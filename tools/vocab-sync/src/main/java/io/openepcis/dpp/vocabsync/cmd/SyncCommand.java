package io.openepcis.dpp.vocabsync.cmd;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.UpstreamRefresh;
import io.openepcis.dpp.vocabsync.VocabSync;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * The regular-run entry point: pull every configured upstream vocabulary, and only if something
 * moved, re-audit (the content-aware verdict cache means just the changed/new pairs hit the LLM),
 * then apply the QA-confirmed mappings at/above the floor to a dedicated git branch for review.
 * Safe to run on a schedule (see {@code ops/sync.sh}): it never writes the canonical TTLs on the
 * current branch and makes no branch when nothing changed.
 */
@CommandLine.Command(
        name = "sync",
        description = "Refresh upstream → re-audit only what changed → apply QA-confirmed mappings to a branch.")
public class SyncCommand implements Runnable {

    @Inject UpstreamRefresh refresh;
    @Inject ObjectMapper mapper;
    @Inject CommandLine.IFactory factory;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;

    @CommandLine.Option(names = "--module", description = "Limit the audit/apply to one module slug.")
    String module;

    @CommandLine.Option(names = "--stamp", defaultValue = "manual",
            description = "Run stamp (e.g. 2026-06-25); used in the branch name and the report/provenance.")
    String stamp;

    @CommandLine.Option(names = "--min-qa-confidence", defaultValue = "0.75",
            description = "Only apply mappings the QA model confirmed at/above this confidence.")
    String minQaConfidence;

    @CommandLine.Option(names = "--force", defaultValue = "false",
            description = "Audit even if the upstream refresh found no change.")
    boolean force;

    @CommandLine.Option(names = "--no-apply", defaultValue = "false",
            description = "Stop after the report; do not create a branch or write any TTLs.")
    boolean noApply;

    @CommandLine.Option(names = "--no-qa", defaultValue = "false",
            description = "Skip the QA verifier in the audit (then nothing is confirmed → no apply).")
    boolean noQa;

    @CommandLine.Option(names = "--concurrency",
            description = "Parallel bulk-grading requests (passed to audit; raise for a cluster endpoint).")
    Integer concurrency;

    @CommandLine.Option(names = "--max-candidates",
            description = "Cap graded candidates per term (passed to audit; lower to trim the work-list).")
    Integer maxCandidates;

    @CommandLine.Option(names = "--min-cosine",
            description = "Cosine gate for retrieved candidates (passed to audit; raise to trim the work-list).")
    Double minCosine;

    @CommandLine.Option(names = "--push", defaultValue = "false",
            description = "Push the created branch to origin (default: leave it local for review).")
    boolean push;

    @CommandLine.Option(names = "--report", defaultValue = "docs/skos-completeness-sync",
            description = "Audit report basename (repo-relative).")
    String report;

    @CommandLine.Option(names = "--delta-out", defaultValue = "docs/skos-upstream-delta.json")
    String deltaOut;

    @Override
    public void run() {
        Path root = Path.of(repoRoot).normalize();

        // Snapshot working-tree cleanliness BEFORE the run writes anything. The apply-to-branch step
        // uses `git add -A`, so a pre-existing dirty tree must block it (else unrelated edits get swept
        // into the commit). This must be captured up front: the run itself writes the report + delta,
        // which would otherwise always trip a check done later.
        boolean treeCleanAtStart = git(root, "status", "--porcelain").isBlank();

        // 1) Pull upstream and record the delta.
        System.err.println("sync: refreshing upstream sources …");
        UpstreamRefresh.RefreshResult delta = refresh.refreshAll(true);
        refresh.writeDelta(delta, root.resolve(deltaOut).normalize(), stamp);
        for (UpstreamRefresh.SourceDelta d : delta.sources()) {
            System.err.printf("  %-12s %s%n", d.name(), d.error() != null ? "ERROR " + d.error()
                    : "+%d -%d ~%d".formatted(d.added().size(), d.removed().size(), d.changed().size()));
        }
        long errored = delta.sources().stream().filter(d -> d.error() != null).count();
        if (!delta.moved() && !force) {
            // Distinguish "confirmed no change" from "couldn't check": an errored refresh is not a
            // clean no-op. Either way we skip the audit (don't grade on incomplete refresh data).
            System.out.println(errored > 0
                    ? "sync: " + errored + " source(s) could not be refreshed and nothing else moved; "
                            + "skipping (retry, or use --force to audit anyway)."
                    : "sync: no upstream change → nothing to do.");
            return;
        }

        // 2) Re-audit. With the content-aware verdict cache, only changed/new pairs are re-graded.
        List<String> auditArgs = new ArrayList<>(List.of("audit", "--out", report, "--stamp", stamp));
        if (module != null) { auditArgs.add("--module"); auditArgs.add(module); }
        if (noQa) auditArgs.add("--no-qa");
        if (concurrency != null) { auditArgs.add("--concurrency"); auditArgs.add(concurrency.toString()); }
        if (maxCandidates != null) { auditArgs.add("--max-candidates"); auditArgs.add(maxCandidates.toString()); }
        if (minCosine != null) { auditArgs.add("--min-cosine"); auditArgs.add(minCosine.toString()); }
        System.err.println("sync: auditing " + (module == null ? "all modules" : module) + " …");
        if (exec(auditArgs) != 0) {
            System.err.println("sync: audit failed; aborting before apply.");
            return;
        }

        // 3) Read the report; decide whether there is anything worth a branch.
        Path reportJson = root.resolve(report + ".json").normalize();
        long confirmed = countConfirmed(reportJson);
        System.out.printf("sync: report %s — %d QA-confirmed finding(s).%n", report + ".json", confirmed);
        if (confirmed == 0 || noApply) {
            System.out.println(noApply ? "sync: --no-apply set; review the report and apply manually."
                    : "sync: nothing confirmed to apply.");
            return;
        }

        // 4) Apply the confirmed mappings to a dedicated branch (never the current one).
        String branch = "vocab-sync/upstream-" + stamp;
        String original = git(root, "rev-parse", "--abbrev-ref", "HEAD").trim();
        if (original.isEmpty()) {
            System.err.println("sync: not a git repo or detached HEAD; skipping apply.");
            return;
        }
        // Refuse to apply if the tree was dirty BEFORE the run (captured up front): `git add -A` would
        // otherwise sweep unrelated working-tree changes into the vocab-sync commit.
        if (!treeCleanAtStart) {
            System.err.println("sync: working tree was not clean at start; leaving the report for manual "
                    + "apply (commit or stash your changes first to enable auto-apply).");
            return;
        }
        if (gitCode(root, "checkout", "-b", branch) != 0 && gitCode(root, "checkout", branch) != 0) {
            System.err.println("sync: could not create/switch to branch " + branch + "; skipping apply.");
            return;
        }
        try {
            List<String> applyArgs = new ArrayList<>(List.of("apply", "--report", report + ".json",
                    "--confirmed-only", "--min-qa-confidence", minQaConfidence, "--apply"));
            if (module != null) { applyArgs.add("--module"); applyArgs.add(module); }
            exec(applyArgs);
            exec(List.of("provenance", "--min-qa-confidence", minQaConfidence, "--stamp", stamp));
            gitCode(root, "add", "-A");
            gitCode(root, "commit", "-m", "vocab-sync: apply QA-confirmed upstream mappings (" + stamp + ")");
            if (push) gitCode(root, "push", "-u", "origin", branch);
        } finally {
            gitCode(root, "checkout", original);
        }
        System.out.printf("sync: applied to branch %s (%s). Review and merge when ready.%n",
                branch, push ? "pushed" : "local");
    }

    private int exec(List<String> args) {
        return new CommandLine(new VocabSync(), factory).execute(args.toArray(new String[0]));
    }

    private long countConfirmed(Path reportJson) {
        if (!Files.isReadable(reportJson)) return 0;
        try {
            JsonNode root = mapper.readTree(reportJson.toFile());
            JsonNode arr = root.isArray() ? root : root.path("findings");
            long n = 0;
            for (JsonNode f : arr) if (f.path("confirmed").asBoolean(false)) n++;
            return n;
        } catch (IOException e) {
            return 0;
        }
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
