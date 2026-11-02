package io.openepcis.dpp.vocabsync.cmd;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.OurIndex;
import io.openepcis.dpp.vocabsync.PairJudge;
import io.openepcis.dpp.vocabsync.Retriever;
import io.openepcis.dpp.vocabsync.ProposalDrafter;
import io.openepcis.dpp.vocabsync.UpstreamIndex;
import io.openepcis.dpp.vocabsync.model.CoverageRow;
import io.openepcis.dpp.vocabsync.model.OurTerm;
import io.openepcis.dpp.vocabsync.model.TermProposal;
import io.openepcis.dpp.vocabsync.model.TermType;
import io.openepcis.dpp.vocabsync.model.UpstreamTerm;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Draft terms of ours for the upstream terms a reverse run left uncovered. Reads the coverage JSON
 * and (optionally) the recommendation set, drafts one term per selected row with the QA model —
 * classes first, so the properties that follow can name them as domain or range — and writes the
 * drafts as a proposal TTL in our house style, a markdown table, a JSON, and an updated
 * recommendation set (decision {@code adopt}, the draft in the notes) for the workbook.
 *
 * <p>Nothing is inserted into an ontology. The TTL is a proposal file for the curator; applying it
 * is an ordinary ontology edit with its changelog line.
 */
@CommandLine.Command(
        name = "propose",
        description = "Draft terms of ours (TTL + table) for the uncovered rows of a reverse-coverage run.")
public class ProposeCommand implements Runnable {

    @Inject OurIndex ourIndex;
    @Inject UpstreamIndex upstreamIndex;
    @Inject ProposalDrafter drafter;
    @Inject PairJudge judge;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;

    @CommandLine.Option(names = "--coverage", required = true,
            description = "Reverse-coverage JSON (repo-relative) from `reverse`.")
    String coverageFile;

    @CommandLine.Option(names = "--prefill",
            description = "Recommendation set (upstream IRI → {decision, notes}); rows whose decision is in "
                    + "--for are drafted, rows with other decisions are left alone.")
    String prefillFile;

    @CommandLine.Option(names = "--for", split = ",", defaultValue = "adopt,defer",
            description = "Prefill decisions that select a row for drafting (rows without a prefill entry "
                    + "are drafted when the bucket is uncovered).")
    List<String> forDecisions;

    @CommandLine.Option(names = "--vocab-prefix", defaultValue = "eudpp",
            description = "Prefix to write the upstream mapping object with (eudpp:X).")
    String vocabPrefix;

    @CommandLine.Option(names = "--default-module",
            description = "Module of ours a draft falls into when the model names none of ours (default: the "
                    + "module whose name ends --vocab-prefix, e.g. cirpass2-textile → textile, else core).")
    String defaultModule;

    @CommandLine.Option(names = "--concurrency", defaultValue = "1", description = "Parallel drafting requests.")
    int concurrency;

    @CommandLine.Option(names = "--retries", defaultValue = "3", description = "Retries per LLM call.")
    int retries;

    @CommandLine.Option(names = "--out", required = true,
            description = "Output basename (repo-relative) → .ttl, .md, .json and -prefill.json.")
    String out;

    @CommandLine.Option(names = "--stamp", defaultValue = "unset", description = "Run date for the outputs.")
    String stamp;

    @CommandLine.Option(names = "--reuse",
            description = "Saved drafts JSON of an earlier run: a row whose candidates are unchanged against "
                    + "--reuse-coverage keeps its draft without a model call.")
    String reuseFrom;

    @CommandLine.Option(names = "--reuse-coverage",
            description = "The coverage JSON the --reuse drafts were made from.")
    String reuseCoverage;

    @CommandLine.Option(names = "--render",
            description = "Re-render the outputs from a saved drafts JSON of an earlier run (no model calls).")
    String renderFrom;

    private static final Map<String, String> PREFIX = Map.ofEntries(
            Map.entry("core", "oec"), Map.entry("battery", "eubat"), Map.entry("textile", "eutex"),
            Map.entry("electronics", "euelec"), Map.entry("detergent", "eudet"), Map.entry("ppwr", "euppwr"),
            Map.entry("cpr", "eucpr"), Map.entry("iron-steel", "eusteel"), Map.entry("eudr", "eudr"),
            Map.entry("fsma204", "usfsma"), Map.entry("carrier", "carrier"));
    private static final Map<String, String> REGION = Map.ofEntries(
            Map.entry("core", "common"), Map.entry("carrier", "common"), Map.entry("fsma204", "us"));

    private record Draft(CoverageRow row, UpstreamTerm up, TermProposal p) {
    }

    @Override
    public void run() {
        Path root = Path.of(repoRoot).normalize();
        List<CoverageRow> coverage;
        Map<String, JsonNode> prefill = new LinkedHashMap<>();
        try {
            JsonNode cov = mapper.readTree(root.resolve(coverageFile).normalize().toFile());
            coverage = mapper.convertValue(cov.path("terms"), new TypeReference<List<CoverageRow>>() {
            });
            if (prefillFile != null) {
                JsonNode pf = mapper.readTree(root.resolve(prefillFile).normalize().toFile());
                pf.fields().forEachRemaining(e -> prefill.put(e.getKey(), e.getValue()));
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("propose: " + e.getMessage(), e);
        }

        Map<String, CoverageRow> rowByIri = new HashMap<>();
        for (CoverageRow r : coverage) rowByIri.put(r.upstreamIri(), r);
        Set<String> forSet = Set.copyOf(forDecisions);
        if (renderFrom != null) {
            List<Draft> drafts = new ArrayList<>();
            try {
                JsonNode saved = mapper.readTree(root.resolve(renderFrom).normalize().toFile());
                for (JsonNode d : saved.path("drafts")) {
                    CoverageRow r = rowByIri.get(d.path("upstreamIri").asText());
                    if (r == null) continue;
                    // Same selection as a drafting run: a row the prefill decides otherwise keeps its decision.
                    JsonNode pre = prefill.get(r.upstreamIri());
                    if (pre != null && !forSet.contains(pre.path("decision").asText(""))) continue;
                    TermProposal p = mapper.convertValue(d.path("proposal"), TermProposal.class);
                    drafts.add(new Draft(r, upstreamIndex.get(r.upstreamIri()), p));
                }
            } catch (IOException e) {
                throw new IllegalArgumentException("--render: " + e.getMessage(), e);
            }
            System.err.printf("propose: re-rendering %d saved drafts%n", drafts.size());
            write(root, drafts, prefill);
            return;
        }

        List<CoverageRow> selected = coverage.stream()
                .filter(r -> r.bucket().equals("uncovered"))
                .filter(r -> {
                    JsonNode pre = prefill.get(r.upstreamIri());
                    return pre == null || forSet.contains(pre.path("decision").asText(""));
                })
                .toList();
        List<OurTerm> ours = ourIndex.load(null);
        Map<String, OurTerm> ourById = new HashMap<>();
        for (OurTerm t : ours) ourById.putIfAbsent(t.prefixedId(), t);
        StringBuilder ourClasses = new StringBuilder();
        ours.stream().filter(t -> t.type() == TermType.CLASS)
                .sorted(Comparator.comparing(OurTerm::prefixedId))
                .forEach(t -> ourClasses.append("  ").append(t.prefixedId()).append(" — ")
                        .append(PairJudge.nz(t.label())).append('\n'));
        System.err.printf("propose: %d uncovered rows selected (%s) of %d; drafting with %s%n",
                selected.size(), forDecisions, coverage.size(), judge.qaModelName());

        Map<String, TermProposal> reusable = loadReusable(root, rowByIri);
        List<Draft> drafts = new ArrayList<>();
        List<CoverageRow> toDraft = new ArrayList<>();
        for (CoverageRow r : selected) {
            TermProposal p = reusable.get(r.upstreamIri());
            if (p != null) drafts.add(new Draft(r, upstreamIndex.get(r.upstreamIri()), p));
            else toDraft.add(r);
        }
        if (!reusable.isEmpty()) System.err.printf("propose: %d drafts reused, %d to draft%n", drafts.size(), toDraft.size());

        // Classes first, then properties, so a property can point at a class drafted just before.
        List<CoverageRow> classes = toDraft.stream().filter(r -> r.type().equals("class")).toList();
        List<CoverageRow> props = toDraft.stream().filter(r -> !r.type().equals("class")).toList();
        StringBuilder proposedClasses = new StringBuilder();
        drafts.addAll(draftAll(classes, ourById, ourClasses.toString(), proposedClasses.toString()));
        for (Draft d : drafts) {
            if (d.p() != null && "class".equalsIgnoreCase(d.p().termType())) {
                proposedClasses.append("  ").append(prefixed(d.p())).append(" — ").append(d.p().label()).append('\n');
            }
        }
        drafts.addAll(draftAll(props, ourById, ourClasses.toString(),
                proposedClasses.isEmpty() ? "  (none)\n" : proposedClasses.toString()));

        write(root, drafts, prefill);
    }

    /** Candidate ids of a row, order-free, so a draft is reused only when the grader saw the same terms of ours. */
    private static Set<String> candidateIds(CoverageRow r) {
        Set<String> ids = new java.util.TreeSet<>();
        for (String c : r.candidates() == null ? List.<String>of() : r.candidates()) ids.add(c.contains(" ") ? c.substring(0, c.indexOf(' ')) : c);
        return ids;
    }

    /** Drafts of an earlier run whose rows have the same candidates now as then. */
    private Map<String, TermProposal> loadReusable(Path root, Map<String, CoverageRow> rowByIri) {
        Map<String, TermProposal> out = new HashMap<>();
        if (reuseFrom == null) return out;
        if (reuseCoverage == null) throw new IllegalArgumentException("--reuse needs --reuse-coverage");
        try {
            JsonNode oldCov = mapper.readTree(root.resolve(reuseCoverage).normalize().toFile());
            Map<String, CoverageRow> oldRows = new HashMap<>();
            for (CoverageRow r : mapper.convertValue(oldCov.path("terms"), new TypeReference<List<CoverageRow>>() { })) oldRows.put(r.upstreamIri(), r);
            JsonNode saved = mapper.readTree(root.resolve(reuseFrom).normalize().toFile());
            for (JsonNode d : saved.path("drafts")) {
                String iri = d.path("upstreamIri").asText();
                CoverageRow now = rowByIri.get(iri), then = oldRows.get(iri);
                if (now == null || then == null || !candidateIds(now).equals(candidateIds(then))) continue;
                if (d.path("proposal").isMissingNode() || d.path("proposal").isNull()) continue;
                out.put(iri, mapper.convertValue(d.path("proposal"), TermProposal.class));
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("--reuse: " + e.getMessage(), e);
        }
        return out;
    }

    private List<Draft> draftAll(List<CoverageRow> rows, Map<String, OurTerm> ourById,
                                 String ourClasses, String proposedClasses) {
        if (rows.isEmpty()) return List.of();
        AtomicInteger done = new AtomicInteger();
        int total = rows.size();
        return Multi.createFrom().iterable(rows)
                .onItem().transformToUni(r -> draftUni(r, ourById, ourClasses, proposedClasses)
                        .onItem().transform(p -> {
                            int n = done.incrementAndGet();
                            if (n % 10 == 0 || n == total) System.err.printf("  drafted %d / %d%n", n, total);
                            return new Draft(r, upstreamIndex.get(r.upstreamIri()), p);
                        }))
                .merge(Math.max(1, concurrency))
                .collect().asList()
                .await().indefinitely();
    }

    private Uni<TermProposal> draftUni(CoverageRow r, Map<String, OurTerm> ourById,
                                       String ourClasses, String proposedClasses) {
        UpstreamTerm u = upstreamIndex.get(r.upstreamIri());
        StringBuilder cands = new StringBuilder();
        for (String c : r.candidates() == null ? List.<String>of() : r.candidates()) {
            String id = c.contains(" ") ? c.substring(0, c.indexOf(' ')) : c;
            OurTerm t = ourById.get(id);
            cands.append("  ").append(id).append(" — ").append(t == null ? "" : PairJudge.nz(t.label()))
                    .append(": ").append(t == null ? "" : PairJudge.nz(t.comment())).append('\n');
        }
        if (cands.isEmpty()) cands.append("  (none)\n");
        String label = u != null ? u.label() : r.label();
        String comment = u != null ? u.comment() : r.definition();
        String domain = u != null ? u.domain() : null;
        String range = u != null ? u.range() : null;
        String module = r.module() == null || r.module().isBlank() ? "(unknown)" : r.module();
        return Uni.createFrom().item(() -> drafter.draft("eudpp".equals(vocabPrefix) ? "CIRPASS-2 EUDPP" : vocabPrefix,
                        module, r.upstreamIri(), r.type(), PairJudge.nz(label), PairJudge.nz(comment),
                        PairJudge.nz(domain), PairJudge.nz(range), cands.toString(), ourClasses, proposedClasses))
                .runSubscriptionOn(Infrastructure.getDefaultWorkerPool())
                .onFailure().retry().withBackOff(Duration.ofMillis(500), Duration.ofSeconds(8))
                    .atMost(Math.max(1, retries))
                .onFailure().recoverWithItem(e -> {
                    System.err.println("  draft failed for " + r.upstreamIri() + ": " + e.getMessage());
                    return null;
                });
    }

    /**
     * The module of ours a draft goes into: the model's module when it is one of ours; the module
     * whose name starts an upstream sub-module name the model copied instead (textile-process →
     * textile); otherwise the run's default module.
     */
    private String moduleOf(TermProposal p) {
        String m = p.module() == null ? "" : p.module().trim().toLowerCase();
        if (PREFIX.containsKey(m)) return m;
        for (String ours : PREFIX.keySet()) if (m.startsWith(ours + "-") || m.startsWith(ours + "_")) return ours;
        return defaultModule();
    }

    private String defaultModule() {
        if (defaultModule != null && PREFIX.containsKey(defaultModule)) return defaultModule;
        String v = vocabPrefix == null ? "" : vocabPrefix.toLowerCase();
        for (String ours : PREFIX.keySet()) if (v.endsWith("-" + ours) || v.equals(ours)) return ours;
        return "core";
    }

    private String prefixed(TermProposal p) {
        return PREFIX.get(moduleOf(p)) + ":" + p.localName();
    }

    private static String namespace(String module) {
        String m = PREFIX.containsKey(module) ? module : "core";
        return "https://ref.openepcis.org/extensions/" + REGION.getOrDefault(m, "eu") + "/" + m + "/";
    }

    private static final Set<String> MAPPINGS = Set.of(
            "skos:exactMatch", "skos:closeMatch", "skos:broadMatch", "skos:narrowMatch", "rdfs:seeAlso");

    /** First token of the model's mapping field if it is a known predicate, else closeMatch. */
    private static String mappingOf(TermProposal p) {
        if (p.mapping() == null) return "skos:closeMatch";
        String first = p.mapping().trim().split("\\s+")[0];
        return MAPPINGS.contains(first) ? first : "skos:closeMatch";
    }

    /** Domain/range check: our class, a class drafted in this run, or an XSD type; anything else is flagged. */
    private static String unknownRefs(TermProposal p, Set<String> known) {
        List<String> bad = new ArrayList<>();
        for (String ref : new String[]{p.domain(), p.range()}) {
            if (ref == null || ref.isBlank()) continue;
            String r = ref.trim();
            if (r.startsWith("xsd:") || known.contains(r)) continue;
            bad.add(r);
        }
        return bad.isEmpty() ? null : String.join(", ", bad) + " is not an existing or proposed class";
    }

    private void write(Path root, List<Draft> drafts, Map<String, JsonNode> prefill) {
        Map<String, List<Draft>> byModule = new LinkedHashMap<>();
        Set<String> known = new java.util.HashSet<>();
        // Every term of ours by exact prefixed id, and by folded local name within a module, so a
        // draft that takes the name of an existing term is caught: exact → not drafted, set to map;
        // same name up to case (class AbrasionResistance beside property abrasionResistance) → CHECK.
        Set<String> ourIds = new java.util.HashSet<>();
        Map<String, String> ourByFolded = new HashMap<>();
        for (OurTerm t : ourIndex.load(null)) {
            if (t.type() == TermType.CLASS) known.add(t.prefixedId());
            ourIds.add(t.prefixedId());
            ourByFolded.putIfAbsent(t.moduleSlug() + "|" + Retriever.foldedName(t.localName()), t.prefixedId() + " (" + t.type().label() + ")");
        }
        int failed = 0;
        List<Draft> collisions = new ArrayList<>();
        for (Draft d : drafts) {
            if (d.p() == null) { failed++; continue; }
            if (ourIds.contains(prefixed(d.p()))) { collisions.add(d); continue; }
            String m = moduleOf(d.p());
            if ("class".equalsIgnoreCase(d.p().termType())) known.add(PREFIX.get(m) + ":" + d.p().localName());
            byModule.computeIfAbsent(m, k -> new ArrayList<>()).add(d);
        }
        int flagged = 0;

        // TTL in house style, one section per module; a proposal file, not an ontology.
        StringBuilder ttl = new StringBuilder();
        ttl.append("# Proposed terms from the ").append(vocabPrefix).append(" reverse-coverage run of ").append(stamp)
                .append(".\n# Drafted by the QA model, one block per uncovered upstream term; a proposal for the\n")
                .append("# curator, not an ontology. Copy a block into its module's ontology/*.ttl when adopted and\n")
                .append("# add the changelog line; the skos:note keeps the provenance.\n\n");
        ttl.append("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n@prefix owl: <http://www.w3.org/2002/07/owl#> .\n")
                .append("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n@prefix dcterms: <http://purl.org/dc/terms/> .\n")
                .append("@prefix skos: <http://www.w3.org/2004/02/skos/core#> .\n")
                .append("@prefix eudpp: <https://w3id.org/eudpp#> .\n");
        // Every module prefix, not just the ones with drafts: a draft's domain or range may name a
        // class of any module (eutex:SubstanceOfConcern as the range of a core property).
        ttl.append("@prefix gs1: <https://ref.gs1.org/voc/> .\n@prefix schema: <https://schema.org/> .\n");
        for (String m : new java.util.TreeSet<>(PREFIX.keySet())) {
            ttl.append("@prefix ").append(PREFIX.get(m)).append(": <").append(namespace(m)).append("> .\n");
        }
        ttl.append('\n');
        StringBuilder md = new StringBuilder();
        md.append("# Proposed terms — ").append(vocabPrefix).append(" reverse coverage ").append(stamp).append("\n\n")
                .append(drafts.size() - failed).append(" drafts for ").append(drafts.size()).append(" uncovered upstream terms")
                .append(failed > 0 ? " (" + failed + " failed)" : "").append(". Each row is a term of ours the QA model drafted ")
                .append("to cover the upstream term; `caveat` is what the curator must check. The TTL beside this file has the same drafts as blocks.\n\n");
        Map<String, Object> prefillOut = new LinkedHashMap<>();
        prefill.forEach((k, v) -> prefillOut.put(k, v));
        if (!collisions.isEmpty()) {
            md.append("## not drafted: the name is taken (").append(collisions.size()).append(")\n\n")
                    .append("| Existing term of ours | Upstream term | Mapping to add instead |\n|---|---|---|\n");
            for (Draft d : collisions) {
                String id = prefixed(d.p());
                md.append("| `").append(id).append("` | `").append(vocabPrefix).append(':').append(d.row().localName())
                        .append("` | ").append(mappingOf(d.p())).append(" |\n");
                Map<String, Object> pre = new LinkedHashMap<>();
                pre.put("decision", "map");
                pre.put("notes", id + " already exists; add " + mappingOf(d.p()) + " " + vocabPrefix + ":" + d.row().localName()
                        + " to it instead of a second term. Draft: " + PairJudge.nz(d.p().definition()));
                prefillOut.put(d.row().upstreamIri(), pre);
            }
            md.append('\n');
        }
        List<Map<String, Object>> json = new ArrayList<>();

        for (var e : byModule.entrySet()) {
            String m = e.getKey();
            String pfx = PREFIX.get(m);
            List<Draft> list = e.getValue();
            list.sort(Comparator.comparing((Draft d) -> "class".equalsIgnoreCase(d.p().termType()) ? 0 : 1)
                    .thenComparing(d -> d.p().localName()));
            ttl.append("# ===== ").append(m).append(" (").append(list.size()).append(") =====\n\n");
            md.append("## ").append(m).append(" (").append(list.size()).append(")\n\n")
                    .append("| Our term | Type | Label | Definition | Domain | Range | Mapping → upstream | Caveat |\n|---|---|---|---|---|---|---|---|\n");
            for (Draft d : list) {
                TermProposal p = d.p();
                String id = pfx + ":" + p.localName();
                boolean cls = "class".equalsIgnoreCase(p.termType());
                String upLocal = d.row().localName();
                String mapping = mappingOf(p);
                String unknown = unknownRefs(p, known);
                String caveat = p.caveat() == null ? "" : p.caveat().trim();
                if (unknown != null) {
                    caveat = (caveat.isEmpty() ? "" : caveat + " ") + "CHECK: " + unknown + ".";
                    flagged++;
                }
                String sameName = ourByFolded.get(m + "|" + Retriever.foldedName(p.localName()));
                if (sameName != null) {
                    caveat = (caveat.isEmpty() ? "" : caveat + " ") + "CHECK: " + sameName
                            + " already carries this name; adopt only if both are wanted, else map.";
                    flagged++;
                }
                // A domain/range that is not one prefixed name (the model may write a union with
                // '|') cannot go into the TTL; it is kept in the caveat for the curator.
                String domainRef = isRef(p.domain()) ? p.domain().trim() : null;
                String rangeRef = isRef(p.range()) ? p.range().trim() : null;
                if (!cls && nb(p.domain()) && domainRef == null) caveat = caveat + (caveat.isEmpty() ? "" : " ") + "CHECK: domain '" + p.domain().trim() + "' is not one class.";
                if (!cls && nb(p.range()) && rangeRef == null) caveat = caveat + (caveat.isEmpty() ? "" : " ") + "CHECK: range '" + p.range().trim() + "' is not one class.";
                String owlType = cls ? "owl:Class"
                        : (p.range() != null && p.range().startsWith("xsd:")) ? "owl:DatatypeProperty" : "owl:ObjectProperty";
                ttl.append(id).append("\n    a ").append(owlType).append(" ;\n")
                        .append("    rdfs:label \"").append(esc(p.label())).append("\"@en ;\n")
                        .append("    rdfs:comment \"").append(esc(p.definition())).append("\"@en ;\n");
                // A Turtle comment runs to the end of the line, so the CHECK marker follows the ';'.
                if (!cls && domainRef != null) ttl.append("    rdfs:domain ").append(domainRef).append(" ;")
                        .append(known.contains(domainRef) || domainRef.startsWith("xsd:") ? "" : " # CHECK: unknown class")
                        .append('\n');
                if (!cls && rangeRef != null) ttl.append("    rdfs:range ").append(rangeRef).append(" ;")
                        .append(known.contains(rangeRef) || rangeRef.startsWith("xsd:") ? "" : " # CHECK: unknown class")
                        .append('\n');
                ttl.append("    rdfs:isDefinedBy <").append(namespace(m)).append("> ;\n")
                        .append("    dcterms:source <").append(d.row().upstreamIri()).append("> ;\n")
                        .append("    skos:note \"Proposed from the ").append(vocabPrefix).append(" reverse-coverage run of ")
                        .append(stamp).append(" to cover ").append(vocabPrefix).append(":").append(upLocal).append(". ")
                        .append(esc(PairJudge.nz(p.rationale()))).append("\"@en ;\n")
                        // The mapping object is the full IRI: a sectoral upstream spans several
                        // namespaces, so no single prefix covers it.
                        .append("    ").append(mapping).append(" <")
                        .append(d.row().upstreamIri()).append("> .\n\n");
                md.append("| `").append(id).append("` | ").append(cls ? "class" : "property").append(" | ")
                        .append(cell(p.label())).append(" | ").append(cell(p.definition())).append(" | ")
                        .append(cell(p.domain())).append(" | ").append(cell(p.range())).append(" | ")
                        .append(mapping).append(" `").append(vocabPrefix).append(':').append(upLocal).append("` | ")
                        .append(cell(caveat)).append(" |\n");
                Map<String, Object> rec = new LinkedHashMap<>();
                rec.put("upstreamIri", d.row().upstreamIri());
                rec.put("ourId", id);
                rec.put("proposal", p);
                json.add(rec);
                Map<String, Object> pre = new LinkedHashMap<>();
                pre.put("decision", "adopt");
                pre.put("notes", "Proposal: " + id + " (" + (cls ? "class" : "property")
                        + (nb(p.range()) ? ", range " + p.range().trim() : "") + ") "
                        + mapping + " " + vocabPrefix + ":" + upLocal
                        + ". " + PairJudge.nz(p.definition())
                        + (caveat.isEmpty() ? "" : " " + (caveat.startsWith("CHECK") ? "" : "CHECK: ") + caveat));
                prefillOut.put(d.row().upstreamIri(), pre);
            }
            md.append('\n');
        }

        try {
            Path base = root.resolve(out).normalize();
            Files.createDirectories(base.getParent());
            Files.writeString(Path.of(base + ".ttl"), ttl.toString());
            Files.writeString(Path.of(base + ".md"), md.toString());
            Map<String, Object> doc = new LinkedHashMap<>();
            doc.put("generated", stamp);
            doc.put("drafts", json);
            mapper.writerWithDefaultPrettyPrinter().writeValue(Path.of(base + ".json").toFile(), doc);
            mapper.writerWithDefaultPrettyPrinter().writeValue(Path.of(base + "-prefill.json").toFile(), prefillOut);
            if (!collisions.isEmpty()) System.err.printf("propose: %d drafts not written, the name is taken (set to map)%n", collisions.size());
            System.out.printf("%npropose: %d drafts (%d failed, %d with a domain/range to check) → %s.{ttl,md,json}, prefill → %s-prefill.json%n",
                    drafts.size() - failed, failed, flagged, base, base);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static boolean nb(String s) {
        return s != null && !s.isBlank();
    }

    /** One prefixed name (oec:Thing, xsd:string): what a domain or range line may carry. */
    private static boolean isRef(String s) {
        return nb(s) && s.trim().matches("[A-Za-z][A-Za-z0-9-]*:[A-Za-z_][A-Za-z0-9_-]*");
    }

    private static String esc(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ");
    }

    private static String cell(String s) {
        return s == null ? "" : s.replace("|", "\\|").replace("\n", " ");
    }
}
