package io.openepcis.dpp.vocabsync.cmd;

import io.openepcis.dpp.vocabsync.ReviewWorkbook;
import io.openepcis.dpp.vocabsync.VocabSync;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Import the curator's edited review workbook and rebuild the review branch to match. Reads the
 * {@code Apply? = yes} rows from the {@code .xlsx}, writes them as an approval file, then rebuilds a
 * dedicated branch from the clean base branch by replaying the gated {@code apply} (adds, rewrites,
 * and — for QA-rejected mappings — removes) restricted to exactly the accepted pairs, regenerates the
 * provenance/review artifacts to match, and commits. The base branch and the current branch are never
 * modified; the curated mappings land on {@code vocab-sync/upstream-<stamp>}.
 */
@CommandLine.Command(
        name = "curate",
        description = "Apply a curator-edited review workbook: rebuild the review branch from only the "
                + "accepted (Apply?=yes) mappings.")
public class CurateCommand implements Runnable {

    @Inject CommandLine.IFactory factory;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;

    @CommandLine.Option(names = "--xlsx", defaultValue = "docs/skos-alignment/skos-alignment-review.xlsx",
            description = "Edited review workbook to import (repo-relative).")
    String xlsx;

    @CommandLine.Option(names = "--report", required = true,
            description = "The report JSON the workbook was generated from (repo-relative).")
    String report;

    @CommandLine.Option(names = "--stamp", defaultValue = "manual",
            description = "Run stamp; used in the branch name and the regenerated provenance.")
    String stamp;

    @CommandLine.Option(names = "--base-branch", defaultValue = "feat/upstream-skos-vocab-sync",
            description = "Branch to rebuild from (the clean ontology base, without applied mappings).")
    String baseBranch;

    @CommandLine.Option(names = "--branch",
            description = "Target branch to (re)create. Defaults to vocab-sync/upstream-<stamp>.")
    String branch;

    @CommandLine.Option(names = "--min-qa-confidence", defaultValue = "0.75",
            description = "Graded-mapping floor passed to apply/provenance (below it, an add is seeAlso).")
    String minQaConfidence;

    @CommandLine.Option(names = "--bulk-model", defaultValue = "openai/gpt-oss-20b",
            description = "Bulk grader id recorded in the regenerated provenance.")
    String bulkModel;

    @CommandLine.Option(names = "--qa-model", defaultValue = "qwen/qwen3-32b",
            description = "QA verifier id recorded in the regenerated provenance.")
    String qaModel;

    @CommandLine.Option(names = "--approve-out", defaultValue = "tools/vocab-sync/.cache/curate-approve.tsv",
            description = "Where to write the generated approval file (gitignored).")
    String approveOut;

    @CommandLine.Option(names = "--push", defaultValue = "false",
            description = "Push the rebuilt branch to origin (default: leave it local for review).")
    boolean push;

    @Override
    public void run() {
        Path root = Path.of(repoRoot).normalize();
        Path wb = root.resolve(xlsx).normalize();
        if (!Files.isReadable(wb)) {
            System.err.println("curate: workbook not found: " + wb);
            return;
        }
        String target = branch != null ? branch : "vocab-sync/upstream-" + stamp;

        // 1) Read the curator's accepted rows and write them as an approval file.
        List<ReviewWorkbook.Decision> accepted = ReviewWorkbook.readAccepted(wb);
        if (accepted.isEmpty()) {
            System.err.println("curate: no rows with Apply?=yes in " + wb + "; nothing to do.");
            return;
        }
        var byAction = accepted.stream()
                .collect(Collectors.groupingBy(ReviewWorkbook.Decision::action, Collectors.counting()));
        System.err.printf("curate: %d accepted decision(s) %s%n", accepted.size(), byAction);

        Path approve = root.resolve(approveOut).normalize();
        try {
            Files.createDirectories(approve.getParent());
            List<String> lines = new ArrayList<>();
            lines.add("# vocab-sync curate — accepted (ourIri<TAB>upstreamIri) pairs for " + target);
            for (ReviewWorkbook.Decision d : accepted) lines.add(d.ourIri() + "\t" + d.upstreamIri());
            Files.write(approve, lines);
        } catch (Exception e) {
            System.err.println("curate: cannot write approval file: " + e.getMessage());
            return;
        }

        // 2) Guard: the working tree must be clean (the commit uses `git add` on the apply outputs).
        if (!git(root, "status", "--porcelain").isBlank()) {
            System.err.println("curate: working tree is not clean; commit or stash first.");
            return;
        }
        String original = git(root, "rev-parse", "--abbrev-ref", "HEAD").trim();
        if (original.isEmpty()) {
            System.err.println("curate: not a git repo or detached HEAD; aborting.");
            return;
        }
        if (gitCode(root, "rev-parse", "--verify", "--quiet", baseBranch) != 0) {
            System.err.println("curate: base branch not found: " + baseBranch);
            return;
        }

        // 3) Recreate the target branch from the clean base. If we are on it, step off first.
        if (original.equals(target) && gitCode(root, "checkout", baseBranch) != 0) {
            System.err.println("curate: could not switch off " + target + "; aborting.");
            return;
        }
        if (gitCode(root, "rev-parse", "--verify", "--quiet", target) == 0
                && gitCode(root, "branch", "-D", target) != 0) {
            System.err.println("curate: could not delete existing branch " + target + "; aborting.");
            return;
        }
        if (gitCode(root, "checkout", "-b", target, baseBranch) != 0) {
            System.err.println("curate: could not create branch " + target + " from " + baseBranch + ".");
            gitCode(root, "checkout", original);
            return;
        }

        try {
            // 4) Replay the gated apply restricted to the accepted pairs (adds + rewrites + removes).
            int rc = exec(List.of("apply", "--report", report, "--approve", approveOut,
                    "--status", "MISSING,WEAK,WRONG", "--rewrite", "--apply-removes",
                    "--min-confidence", "0", "--min-qa-confidence", minQaConfidence, "--apply"));
            if (rc != 0) {
                System.err.println("curate: apply failed (rc=" + rc + "); leaving branch for inspection.");
                return;
            }
            // 5) Regenerate provenance/review to match exactly what was applied.
            exec(List.of("provenance", "--report", report, "--approve", approveOut,
                    "--min-qa-confidence", minQaConfidence, "--stamp", stamp,
                    "--bulk-model", bulkModel, "--qa-model", qaModel));
            // 6) Commit the ontology edits and the provenance docs (not the workbook or approval file).
            gitCode(root, "add", "extensions",
                    "docs/skos-alignment/alignment-provenance.json", "docs/skos-alignment/alignment-provenance.ttl",
                    "docs/skos-alignment/skos-alignment-review.md");
            gitCode(root, "commit", "-m",
                    "vocab-sync: apply curator-accepted upstream mappings (" + stamp + ")");
            if (push) gitCode(root, "push", "-u", "origin", target);
        } finally {
            gitCode(root, "checkout", original);
        }
        System.out.printf("curate: rebuilt branch %s (%s) from %d accepted decision(s). Review and merge.%n",
                target, push ? "pushed" : "local", accepted.size());
    }

    private int exec(List<String> args) {
        return new CommandLine(new VocabSync(), factory).execute(args.toArray(new String[0]));
    }

    private String git(Path root, String... args) {
        try {
            List<String> cmd = new ArrayList<>(List.of("git", "-C", root.toString()));
            cmd.addAll(List.of(args));
            Process p = new ProcessBuilder(cmd).redirectErrorStream(true).start();
            String out = new String(p.getInputStream().readAllBytes());
            p.waitFor();
            return out;
        } catch (Exception e) {
            return "";
        }
    }

    private int gitCode(Path root, String... args) {
        try {
            List<String> cmd = new ArrayList<>(List.of("git", "-C", root.toString()));
            cmd.addAll(List.of(args));
            Process p = new ProcessBuilder(cmd).redirectErrorStream(true).start();
            p.getInputStream().readAllBytes();
            return p.waitFor();
        } catch (Exception e) {
            return -1;
        }
    }
}
