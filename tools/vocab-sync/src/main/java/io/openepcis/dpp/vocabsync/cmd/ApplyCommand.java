package io.openepcis.dpp.vocabsync.cmd;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.OurIndex;
import io.openepcis.dpp.vocabsync.TtlEditor;
import io.openepcis.dpp.vocabsync.UpstreamIndex;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Gated apply. Reads a completeness-report JSON, selects findings by status / confidence /
 * (optional) approval file, and inserts the graded {@code skos:*Match} (and optionally
 * {@code rdfs:seeAlso}) into each term's TTL block. Dry-run by default — nothing is written
 * without {@code --apply}. Every target IRI is re-checked against the upstream index, so a
 * hallucinated IRI can never reach the ontology.
 */
@CommandLine.Command(
        name = "apply",
        description = "Insert approved SKOS mappings from a report into the TTLs (dry-run unless --apply).")
public class ApplyCommand implements Runnable {

    @Inject OurIndex ourIndex;
    @Inject UpstreamIndex upstreamIndex;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;

    @CommandLine.Option(names = "--report", defaultValue = "docs/skos-alignment/skos-completeness-core.json",
            description = "Report JSON to apply (repo-relative).")
    String report;

    @CommandLine.Option(names = "--status", defaultValue = "MISSING,WEAK",
            description = "Comma list of statuses to apply.")
    String status;

    @CommandLine.Option(names = "--min-confidence", defaultValue = "0.85",
            description = "Only apply findings at/above this grader confidence.")
    double minConfidence;

    @CommandLine.Option(names = "--module", description = "Limit to one module slug.")
    String module;

    @CommandLine.Option(names = "--vocab", description = "Limit to one upstream vocab id (gs1, schemaorg, …).")
    String vocab;

    @CommandLine.Option(names = "--with-seealso", defaultValue = "false",
            description = "Also add rdfs:seeAlso to the same target (when absent).")
    boolean withSeeAlso;

    @CommandLine.Option(names = "--confirmed-only", defaultValue = "false",
            description = "Only apply findings the QA verifier confirmed (confirmed=true in the report).")
    boolean confirmedOnly;

    @CommandLine.Option(names = "--approve",
            description = "Approval file: lines of '<ourIri><TAB><upstreamIri>'. If set, only listed pairs apply.")
    String approveFile;

    @CommandLine.Option(names = "--apply", defaultValue = "false",
            description = "Actually write the TTLs. Omit for a dry-run diff.")
    boolean apply;

    @CommandLine.Option(names = "--rewrite", defaultValue = "false",
            description = "Process WRONG findings by swapping the existing predicate to the QA-recommended "
                    + "relation (e.g. exactMatch→closeMatch). Requires WRONG in --status.")
    boolean rewrite;

    @CommandLine.Option(names = "--min-qa-confidence", defaultValue = "0.75",
            description = "Floor for asserting a graded skos:*Match. Below it, an added mapping is "
                    + "emitted as rdfs:seeAlso instead (the discovered link without the semantic claim).")
    double minQaConfidence;

    @CommandLine.Option(names = "--downgrade-applied", defaultValue = "false",
            description = "Remediation: for already-applied confirmed adds with QA confidence below "
                    + "--min-qa-confidence, downgrade the in-place graded relation to rdfs:seeAlso "
                    + "(or drop it if a seeAlso to that target already exists).")
    boolean downgradeApplied;

    @CommandLine.Option(names = "--apply-removes", defaultValue = "false",
            description = "Destructive: for WRONG findings the QA verifier rejected outright (qaRelation = "
                    + "NONE), drop the existing graded mapping line from the TTL. Independent of --rewrite. "
                    + "Use with --approve so only curator-accepted removals are carried out.")
    boolean applyRemoves;

    /** One planned triple insertion. */
    private record Plan(String ourId, String predicate, String iri, String upstreamLabel,
                         double confidence, String statusName) {
    }

    /**
     * One planned edit to an existing mapping line (WRONG findings): an in-place predicate swap, or —
     * when {@code remove} is true — dropping the line entirely (QA said the mapping is not a match).
     */
    private record Rewrite(String ourId, String oldPredicate, String newPredicate, String iri,
                           boolean remove) {
    }

    /** Map a Verdict.Relation enum name (from the report's qaRelation/relation) to a SKOS predicate. */
    private static String relationToPredicate(String rel) {
        if (rel == null) return null;
        return switch (rel) {
            case "EXACT" -> "skos:exactMatch";
            case "CLOSE" -> "skos:closeMatch";
            // SKOS direction: BROAD (our term broader) => the upstream target is the
            // NARROWER concept => skos:narrowMatch, and vice versa.
            case "BROAD" -> "skos:narrowMatch";
            case "NARROW" -> "skos:broadMatch";
            default -> null; // NONE / unknown → no safe rewrite (removal is a manual decision)
        };
    }

    @Override
    public void run() {
        Set<String> statuses = new LinkedHashSet<>(List.of(status.split(",")));
        Set<String> approved = loadApproval();

        JsonNode root;
        try {
            Path rp = Path.of(repoRoot).resolve(report).normalize();
            if (!Files.isReadable(rp)) {
                System.err.println("apply: report not found: " + rp);
                return;
            }
            root = mapper.readTree(rp.toFile());
        } catch (Exception e) {
            System.err.println("apply: cannot read report: " + e.getMessage());
            return;
        }

        // Mirror the audit's seeding: register the exact IRIs our TTLs already map to, so the
        // hallucination guard recognises real (already-referenced) targets that aren't in a
        // machine-readable upstream term set. Without this, apply would drop valid findings.
        for (var t : ourIndex.load(module)) {
            for (var m : t.existing()) {
                if (!upstreamIndex.contains(m.targetIri())) {
                    upstreamIndex.seed(UpstreamIndex.vocabIdForIri(m.targetIri()),
                            m.targetIri(), io.openepcis.dpp.vocabsync.RdfSupport.localOf(m.targetIri()),
                            t.type());
                }
            }
        }

        // Group selected findings by module slug → ourId. Inserts (MISSING/WEAK) and
        // rewrites (WRONG, when --rewrite) are collected separately.
        Map<String, Map<String, List<Plan>>> byModule = new LinkedHashMap<>();
        Map<String, Map<String, List<Rewrite>>> rewritesByModule = new LinkedHashMap<>();
        int selected = 0, rewrites = 0, removed = 0, skippedGuard = 0, skippedNoRel = 0;
        for (JsonNode f : root.path("findings")) {
            String st = f.path("status").asText();
            if (!statuses.contains(st)) continue;
            double conf = f.path("confidence").asDouble();
            if (conf < minConfidence) continue;
            String mod = f.path("module").asText();
            if (module != null && !module.equals(mod)) continue;
            String vid = f.path("vocabId").asText();
            if (vocab != null && !vocab.equals(vid)) continue;
            if (confirmedOnly && !f.path("confirmed").asBoolean(false)) continue;
            String iri = f.path("upstreamIri").asText();
            String ourIri = f.path("ourIri").asText();
            String ourId = f.path("ourId").asText();
            double qaConf = f.path("qaConfidence").isNumber() ? f.path("qaConfidence").asDouble() : 0.0;
            if (!approved.isEmpty() && !approved.contains(ourIri + "\t" + iri)) continue;
            if (!upstreamIndex.contains(iri)) { // hallucination guard
                System.err.println("apply: dropping IRI absent from upstream index: " + iri);
                skippedGuard++;
                continue;
            }

            if ("WRONG".equals(st)) {
                if (!rewrite && !applyRemoves) continue; // WRONG needs --rewrite (swap) or --apply-removes (drop)
                String oldPred = f.path("existingPredicate").asText(null);
                // Prefer the QA verifier's relation; fall back to the bulk grader's.
                String qaRel = f.path("qaRelation").isNull() ? null : f.path("qaRelation").asText(null);
                String newPred = relationToPredicate(qaRel != null ? qaRel : f.path("relation").asText(null));
                if (newPred == null) { // QA said NONE → drop the existing mapping (only with --apply-removes)
                    if (applyRemoves && oldPred != null && "NONE".equals(qaRel)) {
                        rewritesByModule.computeIfAbsent(mod, k -> new LinkedHashMap<>())
                                .computeIfAbsent(ourId, k -> new ArrayList<>())
                                .add(new Rewrite(ourId, oldPred, oldPred, iri, true));
                        removed++;
                    } else {
                        skippedNoRel++; // no existing line, or no clear NONE verdict → manual decision
                    }
                    continue;
                }
                if (!rewrite || oldPred == null || oldPred.equals(newPred)) {
                    skippedNoRel++; // swap needs --rewrite and a genuinely different predicate
                    continue;
                }
                rewritesByModule.computeIfAbsent(mod, k -> new LinkedHashMap<>())
                        .computeIfAbsent(ourId, k -> new ArrayList<>())
                        .add(new Rewrite(ourId, oldPred, newPred, iri, false));
                rewrites++;
                continue;
            }

            String pred = f.path("proposedPredicate").asText(null);
            if (pred == null || pred.isBlank() || "null".equals(pred)) continue;

            if (downgradeApplied) {
                // Remediation of an already-applied batch: only sub-floor graded adds; downgrade
                // the in-place skos:*Match to rdfs:seeAlso (the rewrite phase dedups vs existing seeAlso).
                boolean graded = pred.startsWith("skos:") && pred.endsWith("Match");
                if (!graded || qaConf >= minQaConfidence) continue;
                rewritesByModule.computeIfAbsent(mod, k -> new LinkedHashMap<>())
                        .computeIfAbsent(ourId, k -> new ArrayList<>())
                        .add(new Rewrite(ourId, pred, "rdfs:seeAlso", iri, false));
                rewrites++;
                continue;
            }

            // Normal apply: below the QA floor, assert only rdfs:seeAlso (the discovered link
            // without the unwarranted graded semantic claim).
            String effPred = (pred.startsWith("skos:") && pred.endsWith("Match") && qaConf < minQaConfidence)
                    ? "rdfs:seeAlso" : pred;
            byModule.computeIfAbsent(mod, k -> new LinkedHashMap<>())
                    .computeIfAbsent(ourId, k -> new ArrayList<>())
                    .add(new Plan(ourId, effPred, iri, f.path("upstreamLabel").asText(""), conf, st));
            selected++;
        }
        System.err.printf("apply: %d inserts + %d rewrites + %d removes selected (status=%s, conf≥%.2f, qa≥%.2f)%s%s%n",
                selected, rewrites, removed, statuses, minConfidence, minQaConfidence,
                skippedGuard > 0 ? ", " + skippedGuard + " dropped by guard" : "",
                skippedNoRel > 0 ? ", " + skippedNoRel + " WRONG skipped (NONE/unchanged → manual)" : "");

        Map<String, Path> ttlFiles = ourIndex.moduleTtlFiles();
        int inserted = 0, swapped = 0, files = 0, missed = 0;
        Set<String> mods = new LinkedHashSet<>();
        mods.addAll(byModule.keySet());
        mods.addAll(rewritesByModule.keySet());
        for (String mod : mods) {
            Path ttl = ttlFiles.get(mod);
            if (ttl == null) {
                System.err.println("apply: no TTL for module " + mod);
                continue;
            }
            int[] n = applyToFile(ttl,
                    byModule.getOrDefault(mod, Map.of()),
                    rewritesByModule.getOrDefault(mod, Map.of()));
            missed += n[2];
            if (n[0] + n[1] > 0) {
                inserted += n[0];
                swapped += n[1];
                files++;
            }
        }
        // A selected edit that could not be located is a silent-skip hazard in the primary
        // insert/rewrite paths — fail loudly. (In --downgrade-applied remediation, a miss just
        // means an idempotency-skipped add was never written, which is benign.)
        if (missed > 0 && !downgradeApplied) {
            throw new IllegalStateException("apply: " + missed + " selected edit(s) could not be located "
                    + "in the TTLs (see warnings above). Reconcile the report against the ontology.");
        }
        if (missed > 0) {
            System.err.println("apply: " + missed + " selected edit(s) not located (expected for "
                    + "idempotency-skipped adds in --downgrade-applied).");
        }
        System.out.printf("%napply %s: %d inserted + %d rewritten into %d file(s)%s%n",
                apply ? "WROTE" : "DRY-RUN", inserted, swapped, files,
                apply ? "  (now run `pnpm run check:mappings` + `pnpm run build` as the deterministic gate)"
                      : "  (re-run with --apply to write; then `pnpm run check:mappings` + `pnpm build:json` + web copy:ontologies)");
    }

    private int[] applyToFile(Path ttl, Map<String, List<Plan>> byTerm,
                              Map<String, List<Rewrite>> rewriteByTerm) {
        List<String> lines;
        byte[] original;
        try {
            original = Files.readAllBytes(ttl);
            lines = new ArrayList<>(Files.readAllLines(ttl));
        } catch (Exception e) {
            System.err.println("apply: cannot read " + ttl + ": " + e.getMessage());
            return new int[]{0, 0, 0};
        }

        // Emit CURIEs that match the file's own @prefix declarations (house style), not raw IRIs.
        Map<String, String> nsToPrefix = parsePrefixes(lines);
        boolean headerPrinted = false;

        // 1) Rewrites first (in-place predicate swaps; no line-count change → indices stay valid).
        // The asserting line may be inside the term's definition block OR a one-liner
        // (`subject pred obj .`) in a separate alignment section, so search both.
        int swapped = 0;
        int misses = 0;
        for (var e : rewriteByTerm.entrySet()) {
            String subject = e.getKey();
            for (Rewrite rw : e.getValue()) {
                // Recompute the block each time: a downgrade-to-seeAlso may remove a line and shift indices.
                int[] block = TtlEditor.blockRange(lines, subject);
                String obj = curie(rw.iri(), nsToPrefix);
                String full = "<" + rw.iri() + ">";
                int hit = -1;
                int blockStart = block != null ? block[0] : 0;
                if (block != null) {
                    for (int i = block[0]; i <= block[1] && hit < 0; i++) {
                        String l = lines.get(i);
                        if (l.contains(rw.oldPredicate()) && (l.contains(obj) || l.contains(full))) hit = i;
                    }
                }
                if (hit < 0) { // one-liner: `subject pred obj .` anywhere in the file
                    for (int i = 0; i < lines.size() && hit < 0; i++) {
                        String s = lines.get(i).strip();
                        if ((s.startsWith(subject + " ") || s.startsWith(subject + "\t"))
                                && s.contains(rw.oldPredicate()) && (s.contains(obj) || s.contains(full))) {
                            hit = i;
                            blockStart = i;
                        }
                    }
                }
                if (hit < 0) {
                    System.err.println("apply: rewrite target not found: " + subject + " "
                            + rw.oldPredicate() + " " + obj + " (" + ttl.getFileName() + ")");
                    misses++;
                    continue;
                }
                // A QA-rejected mapping (rw.remove()) is dropped outright. Downgrading to seeAlso when a
                // seeAlso to this target already exists also drops the now-redundant line.
                boolean dedupRemove = rw.newPredicate().equals("rdfs:seeAlso") && block != null
                        && hasSeeAlsoElsewhere(lines, block[0], block[1], hit, obj, full);
                boolean dropLine = rw.remove() || dedupRemove;
                if (!headerPrinted) { System.out.printf("%n%s%n", ttl); headerPrinted = true; }
                System.out.printf("  %s: %s → %s  %s%n", subject, rw.oldPredicate(),
                        rw.remove() ? "(remove, QA rejected)"
                                : (dedupRemove ? "(remove, seeAlso exists)" : rw.newPredicate()), obj);
                if (apply) {
                    if (dropLine) {
                        TtlEditor.removeLine(lines, hit, blockStart);
                    } else {
                        lines.set(hit, lines.get(hit).replaceFirst(
                                java.util.regex.Pattern.quote(rw.oldPredicate()), rw.newPredicate()));
                    }
                }
                swapped++;
            }
        }

        // 2) Inserts (append before each block's closing period; bottom-up so indices stay valid).
        record Edit(int end, String indent, List<String> triples, String ourId) {
        }
        List<Edit> edits = new ArrayList<>();
        for (var e : byTerm.entrySet()) {
            String ourId = e.getKey();
            int[] block = TtlEditor.blockRange(lines, ourId);
            if (block == null) {
                System.err.println("apply: block not found for " + ourId + " in " + ttl.getFileName());
                misses++;
                continue;
            }
            List<String> triples = new ArrayList<>();
            for (Plan p : e.getValue()) {
                String obj = curie(p.iri(), nsToPrefix);
                if (!blockHasMapping(lines, block[0], block[1], p.predicate(), p.iri(), obj)) {
                    triples.add(p.predicate() + " " + obj);
                }
                if (withSeeAlso && !blockHasMapping(lines, block[0], block[1], "rdfs:seeAlso", p.iri(), obj)) {
                    triples.add("rdfs:seeAlso " + obj);
                }
            }
            if (!triples.isEmpty()) {
                edits.add(new Edit(block[1], TtlEditor.indentOf(lines, block[0], block[1]), triples, ourId));
            }
        }

        if (!headerPrinted && !edits.isEmpty()) System.out.printf("%n%s%n", ttl);
        edits.stream().sorted(Comparator.comparing(Edit::ourId)).forEach(ed -> {
            System.out.printf("  %s (block ends L%d):%n", ed.ourId(), ed.end() + 1);
            ed.triples().forEach(t -> System.out.println("    + " + ed.indent() + t));
        });

        int inserted = edits.stream().mapToInt(ed -> ed.triples().size()).sum();
        if (apply && (inserted > 0 || swapped > 0)) {
            edits.sort(Comparator.comparingInt(Edit::end).reversed());
            for (Edit ed : edits) {
                TtlEditor.insertBeforeClose(lines, ed.end(), ed.indent(), ed.triples());
            }
            try {
                Files.write(ttl, String.join("\n", lines).concat("\n").getBytes());
            } catch (Exception e) {
                System.err.println("apply: cannot write " + ttl + ": " + e.getMessage());
                return new int[]{0, 0, misses};
            }
            // Safety net: re-parse what we just wrote; if the edit produced invalid TTL,
            // restore the original bytes and abort so a corrupting edit can never persist.
            try {
                org.apache.jena.riot.RDFDataMgr.loadModel(ttl.toString());
            } catch (RuntimeException re) {
                try {
                    Files.write(ttl, original);
                } catch (Exception ignore) {
                    // fall through to the abort below
                }
                throw new IllegalStateException("apply ABORTED — edit produced invalid TTL, restored "
                        + ttl.getFileName() + ": " + re.getMessage(), re);
            }
        }
        return new int[]{inserted, swapped, misses};
    }

    /** Build a namespace→prefix map from the TTL's own @prefix declarations. */
    private static Map<String, String> parsePrefixes(List<String> lines) {
        Map<String, String> nsToPrefix = new LinkedHashMap<>();
        java.util.regex.Pattern p =
                java.util.regex.Pattern.compile("^@prefix\\s+([\\w-]*):\\s+<([^>]+)>\\s*\\.");
        for (String l : lines) {
            java.util.regex.Matcher m = p.matcher(l.strip());
            if (m.find()) nsToPrefix.putIfAbsent(m.group(2), m.group(1));
        }
        return nsToPrefix;
    }

    /** Render an IRI as a CURIE (house style) when a declared prefix covers it, else {@code <iri>}. */
    static String curie(String iri, Map<String, String> nsToPrefix) {
        String bestNs = null, bestPrefix = null;
        for (var e : nsToPrefix.entrySet()) {
            if (iri.startsWith(e.getKey()) && (bestNs == null || e.getKey().length() > bestNs.length())) {
                bestNs = e.getKey();
                bestPrefix = e.getValue();
            }
        }
        if (bestNs != null) {
            String local = iri.substring(bestNs.length());
            if (!local.isEmpty() && local.matches("[A-Za-z_][A-Za-z0-9_.-]*")) {
                return bestPrefix + ":" + local;
            }
        }
        return "<" + iri + ">";
    }

    /** True if some line in the block other than {@code exclude} is an rdfs:seeAlso to the target. */
    private static boolean hasSeeAlsoElsewhere(List<String> lines, int start, int end,
                                               int exclude, String obj, String full) {
        for (int i = start; i <= end; i++) {
            if (i == exclude) continue;
            String l = lines.get(i);
            if (l.contains("rdfs:seeAlso") && (l.contains(obj) || l.contains(full))) return true;
        }
        return false;
    }

    /** True if the block already asserts this predicate to the target (CURIE or full-IRI form). */
    private static boolean blockHasMapping(List<String> lines, int start, int end,
                                           String predicate, String iri, String obj) {
        String full = "<" + iri + ">";
        for (int i = start; i <= end; i++) {
            String l = lines.get(i);
            if (l.contains(predicate) && (l.contains(obj) || l.contains(full))) return true;
        }
        return false;
    }

    private Set<String> loadApproval() {
        Set<String> set = new LinkedHashSet<>();
        if (approveFile == null) return set;
        try {
            Path p = Path.of(repoRoot).resolve(approveFile).normalize();
            for (String line : Files.readAllLines(p)) {
                String s = line.strip();
                if (s.isEmpty() || s.startsWith("#")) continue;
                String[] parts = s.split("\t");
                if (parts.length >= 2) set.add(parts[0].strip() + "\t" + parts[1].strip());
            }
            System.err.printf("apply: %d approved pairs loaded%n", set.size());
        } catch (Exception e) {
            System.err.println("apply: cannot read approval file: " + e.getMessage());
        }
        return set;
    }
}
