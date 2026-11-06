package io.openepcis.dpp.vocabsync.cmd;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.Embeddings;
import io.openepcis.dpp.vocabsync.GapAdvisor;
import io.openepcis.dpp.vocabsync.OurIndex;
import io.openepcis.dpp.vocabsync.PairJudge;
import io.openepcis.dpp.vocabsync.Retriever;
import io.openepcis.dpp.vocabsync.RdfSupport;
import io.openepcis.dpp.vocabsync.ReportWriter;
import io.openepcis.dpp.vocabsync.UpstreamIndex;
import io.openepcis.dpp.vocabsync.VerdictCache;
import io.openepcis.dpp.vocabsync.model.CoverageRow;
import io.openepcis.dpp.vocabsync.model.Finding;
import io.openepcis.dpp.vocabsync.model.GapAdvice;
import io.openepcis.dpp.vocabsync.model.OurTerm;
import io.openepcis.dpp.vocabsync.model.TermType;
import io.openepcis.dpp.vocabsync.model.UpstreamTerm;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import jakarta.inject.Inject;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.riot.RDFDataMgr;
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
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Reverse-coverage pass. The audit asks "for each of OUR terms, what upstream matches?"; this asks
 * the opposite — "for each UPSTREAM term, does anything of ours map to it, and if not, what should
 * we do?" Every upstream term of the chosen vocabulary lands in exactly one bucket:
 *
 * <ul>
 *   <li>{@code covered} — one of our terms already maps to it (any predicate).</li>
 *   <li>{@code proposed} — with {@code --grade}: the nearest terms of ours were LLM-graded (same
 *       prompts, cache and QA panel as the audit) and at least one is a match the TTL lacks. The
 *       findings go to a report in the audit's format, so {@code provenance --xlsx} and
 *       {@code curate} work on them unchanged.</li>
 *   <li>{@code code-list} — an individual or concept (our index holds classes and properties only);
 *       adopted by value reference, never by SKOS.</li>
 *   <li>{@code epcis-cbv} — a term of the upstream EVENT module; EPCIS/CBV carries it by policy.</li>
 *   <li>{@code uncovered} — a class or property nothing of ours maps to and no graded match; with
 *       {@code --advise} the bulk model recommends MAP / ADOPT / CARRIER / OUT_OF_SCOPE.</li>
 * </ul>
 *
 * <p>{@code --baseline} marks which terms are new since an earlier copy of the mirror, so a release
 * review can be limited to what the upstream release added ({@code --only-new}).
 */
@CommandLine.Command(
        name = "reverse",
        description = "Coverage of an upstream vocabulary from our side: covered / proposed (graded) / "
                + "code-list / epcis-cbv / uncovered (advised) → docs/skos-alignment/skos-reverse-coverage.{md,json}.")
public class ReverseCommand implements Runnable {

    @Inject OurIndex ourIndex;
    @Inject UpstreamIndex upstreamIndex;
    @Inject Embeddings embeddings;
    @Inject PairJudge judge;
    @Inject GapAdvisor advisor;
    @Inject VerdictCache verdicts;
    @Inject ReportWriter reportWriter;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;
    @ConfigProperty(name = "quarkus.langchain4j.openai.chat-model.model-name") String bulkModelName;

    @CommandLine.Option(names = "--vocab",
            description = "Limit to one upstream vocab id (e.g. eudpp, cirpass2-textile, untp).")
    String vocab;

    @CommandLine.Option(names = "--baseline",
            description = "Earlier copy of the upstream TTL (repo-relative); terms absent there are 'new'.")
    String baseline;

    @CommandLine.Option(names = "--only-new", defaultValue = "false",
            description = "Report only terms absent from --baseline.")
    boolean onlyNew;

    @CommandLine.Option(names = "--module-map",
            description = "JSON object upstream IRI → module name (repo-relative), for the Module column "
                    + "and the EVENT policy bucket.")
    String moduleMap;

    @CommandLine.Option(names = "--min-cosine", defaultValue = "0.50",
            description = "Candidates of ours at/above this similarity are graded (with --grade) or listed.")
    double minCosine;

    @CommandLine.Option(names = "--k", defaultValue = "3", description = "Nearest terms of ours per upstream term.")
    int k;

    @CommandLine.Option(names = "--grade", defaultValue = "false",
            description = "LLM-grade the (ours, upstream) candidate pairs and write a findings report.")
    boolean grade;

    @CommandLine.Option(names = "--min-confidence", defaultValue = "0.55",
            description = "Drop graded matches below this bulk confidence.")
    double minConfidence;

    @CommandLine.Option(names = "--no-qa", defaultValue = "false",
            description = "Skip the QA panel on graded findings.")
    boolean skipQa;

    @CommandLine.Option(names = "--batch-model",
            description = "Grade through the Anthropic Message Batches API with this model (e.g. "
                    + "claude-fable-5-1) instead of the configured chat model: half price, results in "
                    + "minutes. Verdicts are cached under the model id. Needs ANTHROPIC_API_KEY or the key file.")
    String batchModel;

    @CommandLine.Option(names = "--qa-batch-model",
            description = "Run the QA panel through the Anthropic Message Batches API with this model.")
    String qaBatchModel;

    @CommandLine.Option(names = "--qa-judges", defaultValue = "3", description = "QA panel size.")
    int qaJudges;

    @CommandLine.Option(names = "--concurrency", defaultValue = "2", description = "Parallel grading requests.")
    int concurrency;

    @CommandLine.Option(names = "--qa-concurrency", defaultValue = "1", description = "Parallel QA findings.")
    int qaConcurrency;

    @CommandLine.Option(names = "--retries", defaultValue = "4", description = "Retries per LLM call.")
    int retries;

    @CommandLine.Option(names = "--advise", defaultValue = "false",
            description = "Ask the QA model what to do with each uncovered class/property.")
    boolean advise;

    @CommandLine.Option(names = "--defer-domains", split = ",",
            description = "Upstream class local names whose instances are internal model detail by policy: an "
                    + "uncovered class in this list, or a property whose domain is in it, is advised DEFER "
                    + "without a model call (e.g. LCAStudy,Review,LCAMethod).")
    List<String> deferDomains = List.of();

    @CommandLine.Option(names = "--out", defaultValue = "docs/skos-alignment/skos-reverse-coverage",
            description = "Coverage basename (repo-relative) → .md + .json.")
    String out;

    @CommandLine.Option(names = "--report", defaultValue = "docs/skos-alignment/skos-completeness-reverse",
            description = "Findings report basename (repo-relative) for --grade → .md + .json.")
    String report;

    @CommandLine.Option(names = "--stamp", defaultValue = "unset",
            description = "Run date to embed in the outputs.")
    String stamp;

    @CommandLine.Option(names = "--advice-prefill",
            description = "With --advise: write a recommendation set (upstream IRI → {decision, notes}) "
                    + "for the uncovered rows the advice sends elsewhere (MAP → map, CARRIER → carrier, "
                    + "OUT_OF_SCOPE → out of scope); the input for `propose --prefill` and the workbook.")
    String advicePrefill;

    /** A candidate of ours: embedding-nearest of the same type, or a lexical hit of any type. */
    private record Near(OurTerm term, double cosine, boolean lexical) {
    }

    /** Lexical force-includes per upstream term; embedding ranking keeps the type-compatible top-k. */
    private static final int MAX_LEXICAL = 2;
    private static final double LEXICAL_MIN_COSINE = 0.65;
    private static final double LEXICAL_MIN_JACCARD = 0.5;

    @Override
    public void run() {
        Path root = Path.of(repoRoot).normalize();
        List<OurTerm> ours = ourIndex.load(null);
        Map<String, OurTerm> ourByIri = new HashMap<>();
        for (OurTerm t : ours) ourByIri.putIfAbsent(t.iri(), t);

        // Every upstream IRI anything of ours maps to (any predicate, any subject type — our
        // individuals carry pointers too) is covered; remember by whom.
        Map<String, List<String>> coveredBy = ourIndex.allMappings();

        Set<String> known = loadBaseline(root);
        Map<String, String> modules = loadModuleMap(root);

        // Classes and properties from the index, plus the typed individuals of the chosen
        // vocabulary (code-list values are part of a release and belong on the coverage sheet).
        List<UpstreamTerm> pool = new ArrayList<>(upstreamIndex.all());
        if (vocab != null) pool.addAll(upstreamIndex.individuals(vocab));
        List<UpstreamTerm> upstream = pool.stream()
                .filter(u -> vocab == null || vocab.equals(u.vocabId()))
                .filter(u -> !onlyNew || known == null || !known.contains(u.iri()))
                .sorted(Comparator.comparing(UpstreamTerm::iri))
                .toList();
        System.err.printf("reverse: %d our terms, %d covered targets, %d upstream terms%s%n",
                ours.size(), coveredBy.size(), upstream.size(),
                known != null ? " (" + (onlyNew ? "new only, " : "") + "baseline " + known.size() + " IRIs)" : "");

        List<float[]> ourVecs = embeddings.embedAll(ours.stream().map(OurTerm::embedText).toList());
        List<float[]> upVecs = embeddings.embedAll(upstream.stream().map(UpstreamTerm::embedText).toList());

        // 1) Nearest terms of ours per upstream term (type-compatible) and the policy bucket.
        Map<String, List<Near>> nearest = new HashMap<>();
        List<CoverageRow> rows = new ArrayList<>();
        for (int i = 0; i < upstream.size(); i++) {
            UpstreamTerm u = upstream.get(i);
            List<Near> near = new ArrayList<>();
            if (u.type() != TermType.OTHER) {
                float[] uv = upVecs.get(i);
                // Embedding rank among terms of the same type, plus lexical hits of any type: an
                // upstream class AbrasionResistance and our property abrasionResistance never meet
                // on type or on cosine, but they share the name and the curator must see the pair.
                // Same name always; otherwise half the distinctive name tokens in common and a
                // loose cosine, so "assessment" or "method" alone pulls nothing in.
                String upName = Retriever.foldedName(u.localName());
                Set<String> upTokens = Retriever.tokens(u.localName());
                List<Near> lexical = new ArrayList<>();
                for (int j = 0; j < ours.size(); j++) {
                    OurTerm o = ours.get(j);
                    double cos = Embeddings.cosine(uv, ourVecs.get(j));
                    if (o.type() == u.type()) near.add(new Near(o, cos, false));
                    boolean exact = Retriever.foldedName(o.localName()).equals(upName);
                    if (exact || (cos >= LEXICAL_MIN_COSINE
                            && Retriever.jaccard(upTokens, Retriever.tokens(o.localName())) >= LEXICAL_MIN_JACCARD)) {
                        lexical.add(new Near(o, exact ? 1.0 + cos : cos, true));
                    }
                }
                near.sort(Comparator.comparingDouble(Near::cosine).reversed());
                if (near.size() > k) near = new ArrayList<>(near.subList(0, k));
                lexical.sort(Comparator.comparingDouble(Near::cosine).reversed());
                Set<String> have = new HashSet<>();
                for (Near n : near) have.add(n.term().iri());
                int added = 0;
                for (Near l : lexical) {
                    if (added >= MAX_LEXICAL) break;
                    if (have.add(l.term().iri())) {
                        // Carry the real cosine; the flag is what exempts the pair from the gate.
                        near.add(new Near(l.term(), l.cosine() > 1.0 ? l.cosine() - 1.0 : l.cosine(), true));
                        added++;
                    }
                }
            }
            nearest.put(u.iri(), near);

            String module = modules.getOrDefault(u.iri(), moduleFromNamespace(u.iri()));
            List<String> covered = coveredBy.get(u.iri());
            String bucket;
            if (covered != null) bucket = "covered";
            else if (u.type() == TermType.OTHER) bucket = "code-list";
            else if ("EVENT".equalsIgnoreCase(module)) bucket = "epcis-cbv";
            else bucket = "uncovered";

            Near best = near.stream().max(Comparator.comparingDouble(Near::cosine)).orElse(null);
            rows.add(new CoverageRow(u.iri(), u.localName(), module, u.type().label(),
                    known == null || !known.contains(u.iri()), bucket, u.label(), u.comment(),
                    best == null ? null : best.term().prefixedId(), best == null ? 0 : best.cosine(),
                    near.stream().map(n -> n.term().prefixedId() + " " + fmt(n.cosine()) + (n.lexical() ? " lexical" : "")).toList(),
                    covered == null ? null : String.join("; ", covered),
                    null, null, null, null, null, null, null, null, null));
        }

        // 2) Grade the candidate pairs of the uncovered classes/properties (same judge as the audit).
        List<Finding> findings = new ArrayList<>();
        if (grade) {
            record Pair(OurTerm term, UpstreamTerm up, double cosine) {
            }
            List<Pair> work = new ArrayList<>();
            Map<String, UpstreamTerm> upByIri = new HashMap<>();
            for (UpstreamTerm u : upstream) upByIri.put(u.iri(), u);
            for (CoverageRow r : rows) {
                if (!r.bucket().equals("uncovered")) continue;
                for (Near n : nearest.get(r.upstreamIri())) {
                    if (n.lexical() || n.cosine() >= minCosine) work.add(new Pair(n.term(), upByIri.get(r.upstreamIri()), n.cosine()));
                }
            }
            if (batchModel != null) {
                judge.useBatchGrader(batchModel);
                judge.prefillGrades(work.stream().map(Pair::term).toList(), work.stream().map(Pair::up).toList());
            }
            System.err.printf("reverse: grading %d candidate pairs with %s%n", work.size(),
                    batchModel != null ? batchModel : bulkModelName);
            AtomicInteger done = new AtomicInteger();
            int total = work.size();
            findings = Multi.createFrom().iterable(work)
                    .onItem().transformToUni(p -> judge.gradeCachedUni(p.term(), p.up(), retries)
                            .onItem().transform(v -> {
                                int n = done.incrementAndGet();
                                if (n % 25 == 0 || n == total) {
                                    System.err.printf("  graded %d / %d%n", n, total);
                                    verdicts.save();
                                }
                                return Optional.ofNullable(
                                        judge.classify(p.term(), p.up(), p.cosine(), v, minConfidence));
                            }))
                    .merge(Math.max(1, concurrency))
                    .collect().asList()
                    .await().indefinitely()
                    .stream().flatMap(Optional::stream)
                    .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
            verdicts.save();

            if (!skipQa && !findings.isEmpty()) {
                if (qaBatchModel != null) {
                    judge.useBatchQa(qaBatchModel);
                    judge.prefillQa(findings, ourByIri, upByIri::get, qaJudges);
                }
                System.err.printf("reverse: QA panel on %d findings (%d judges, %s)%n",
                        findings.size(), judge.selectedLenses(qaJudges).size(), judge.qaModelName());
                AtomicInteger qd = new AtomicInteger();
                int qaTotal = findings.size();
                findings = Multi.createFrom().iterable(findings)
                        .onItem().transformToUni(f -> judge.qaPanelUni(f, ourByIri.get(f.ourIri()),
                                        upByIri.get(f.upstreamIri()), retries, qaJudges)
                                .onItem().transform(vf -> {
                                    int n = qd.incrementAndGet();
                                    if (n % 10 == 0 || n == qaTotal) {
                                        System.err.printf("  QA %d / %d%n", n, qaTotal);
                                        verdicts.save();
                                    }
                                    return vf;
                                }))
                        .merge(Math.max(1, qaConcurrency))
                        .collect().asList()
                        .await().indefinitely();
                verdicts.save();
            }

            // Best accepted finding per upstream term → the proposal column; the term becomes "proposed".
            Map<String, Finding> bestByUp = new HashMap<>();
            for (Finding f : findings) {
                boolean accepted = skipQa ? f.relation().isMatch() : Boolean.TRUE.equals(f.confirmed());
                if (!accepted) continue;
                Finding prev = bestByUp.get(f.upstreamIri());
                if (prev == null || score(f) > score(prev)) bestByUp.put(f.upstreamIri(), f);
            }
            for (int i = 0; i < rows.size(); i++) {
                Finding f = bestByUp.get(rows.get(i).upstreamIri());
                if (f == null) continue;
                rows.set(i, rows.get(i).withProposal(f.ourId(), f.proposedPredicate(), f.qaTier(),
                        f.qaConfidence() != null ? f.qaConfidence() : f.confidence(), "proposed"));
            }

            String scope = "reverse " + (vocab != null ? "vocab=" + vocab : "all vocabs")
                    + (onlyNew ? " (new since baseline)" : "") + ", " + upstream.size() + " upstream terms";
            Path md = root.resolve(report + ".md").normalize();
            Path json = root.resolve(report + ".json").normalize();
            reportWriter.write(md, json, findings, scope, stamp);
            System.out.println("report: " + md);
        }

        // 3) Advice for what is still uncovered (and for the EVENT policy bucket, so the sheet shows
        //    which EPCIS/CBV construct carries each).
        if (advise) {
            List<Integer> idx = new ArrayList<>();
            for (int i = 0; i < rows.size(); i++) {
                String b = rows.get(i).bucket();
                if (b.equals("uncovered") || b.equals("epcis-cbv")) idx.add(i);
            }
            System.err.printf("reverse: %d uncovered/policy terms to consider for advice (%s)%n", idx.size(), judge.qaModelName());
            AtomicInteger ad = new AtomicInteger();
            int total;
            Map<String, UpstreamTerm> upByIri = new HashMap<>();
            for (UpstreamTerm u : upstream) upByIri.put(u.iri(), u);
            // Policy pre-pass: internal model detail is DEFER by rule, not by judgement.
            Set<String> deferSet = new HashSet<>(deferDomains);
            List<Integer> ask = new ArrayList<>();
            for (int i : idx) {
                CoverageRow r = rows.get(i);
                UpstreamTerm u = upByIri.get(r.upstreamIri());
                String reason = null;
                if (deferSet.contains(r.localName())) {
                    reason = "policy: internal model detail (class listed in --defer-domains)";
                } else if (u != null && u.domain() != null) {
                    for (String d : u.domain().split("[,\\s]+")) {
                        String local = d.contains(":") ? d.substring(d.lastIndexOf(':') + 1) : d;
                        if (deferSet.contains(local)) {
                            reason = "policy: property of " + local + ", internal model detail (--defer-domains)";
                            break;
                        }
                    }
                }
                if (reason != null) {
                    rows.set(i, r.withAdvice(new GapAdvice("DEFER", null, null, null, reason)));
                } else {
                    ask.add(i);
                }
            }
            System.err.printf("reverse: %d deferred by policy, %d to advise%n", idx.size() - ask.size(), ask.size());
            Set<String> ourModules = new HashSet<>();
            for (OurTerm t : ours) ourModules.add(t.moduleSlug());
            idx = ask;
            total = idx.size();
            final int adviseTotal = total;
            List<Map.Entry<Integer, GapAdvice>> advised = Multi.createFrom().iterable(idx)
                    .onItem().transformToUni(i -> adviceUni(rows.get(i), upByIri.get(rows.get(i).upstreamIri()),
                                    nearest.get(rows.get(i).upstreamIri()))
                            .onItem().transform(a -> {
                                int n = ad.incrementAndGet();
                                if (n % 25 == 0 || n == adviseTotal) System.err.printf("  advised %d / %d%n", n, adviseTotal);
                                return Map.entry(i, a);
                            }))
                    .merge(Math.max(1, concurrency))
                    .collect().asList()
                    .await().indefinitely();
            for (var e : advised) {
                GapAdvice a = e.getValue();
                if (a == null) continue;
                // The model may echo an upstream module name; a term of ours lives in one of our modules.
                if ("ADOPT".equalsIgnoreCase(a.action()) && (a.module() == null || !ourModules.contains(a.module()))) {
                    a = new GapAdvice(a.action(), "core", a.proposedName(), a.counterpart(), a.rationale());
                }
                rows.set(e.getKey(), rows.get(e.getKey()).withAdvice(a));
            }
        }

        write(root, rows, upstream.size());
        if (advise && advicePrefill != null) writeAdvicePrefill(root, rows);
    }

    /** The advice-derived recommendation set: only the rows that should not be drafted as terms of ours. */
    private void writeAdvicePrefill(Path root, List<CoverageRow> rows) {
        Map<String, String> decisions = Map.of("MAP", "map", "CARRIER", "carrier", "OUT_OF_SCOPE", "out of scope");
        Map<String, Map<String, String>> out = new LinkedHashMap<>();
        for (CoverageRow r : rows) {
            if (!r.bucket().equals("uncovered") || r.adviceAction() == null) continue;
            String decision = decisions.get(r.adviceAction().toUpperCase(Locale.ROOT));
            if (decision == null) continue;
            String notes = "Advice " + r.adviceAction()
                    + (r.adviceCounterpart() == null || r.adviceCounterpart().isBlank() ? "" : " -> " + r.adviceCounterpart())
                    + ". " + PairJudge.nz(r.adviceRationale());
            out.put(r.upstreamIri(), Map.of("decision", decision, "notes", notes.trim()));
        }
        Path file = root.resolve(advicePrefill).normalize();
        try {
            new com.fasterxml.jackson.databind.ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(file.toFile(), out);
            System.err.printf("reverse: advice prefill with %d rows → %s%n", out.size(), file);
        } catch (java.io.IOException e) {
            throw new IllegalStateException("reverse: cannot write " + file + ": " + e.getMessage(), e);
        }
    }

    private Uni<GapAdvice> adviceUni(CoverageRow r, UpstreamTerm u, List<Near> near) {
        StringBuilder cands = new StringBuilder();
        for (Near n : near) {
            cands.append("  ").append(n.term().prefixedId()).append(" — ").append(PairJudge.nz(n.term().label()))
                    .append(": ").append(PairJudge.nz(n.term().comment())).append('\n');
        }
        if (cands.isEmpty()) cands.append("  (none of a compatible type)\n");
        String module = r.module() == null || r.module().isBlank() ? "(unknown)" : r.module();
        return Uni.createFrom().item(() -> advisor.advise(u.vocabId(), module, u.iri(), u.type().label(),
                        PairJudge.nz(u.label()), PairJudge.nz(u.comment()), PairJudge.nz(u.domain()),
                        PairJudge.nz(u.range()), cands.toString()))
                .runSubscriptionOn(Infrastructure.getDefaultWorkerPool())
                .onFailure().retry().withBackOff(Duration.ofMillis(500), Duration.ofSeconds(8))
                    .atMost(Math.max(1, retries))
                .onFailure().recoverWithItem(e -> {
                    System.err.println("  advice failed for " + u.iri() + ": " + e.getMessage());
                    return null;
                });
    }

    private static double score(Finding f) {
        double tier = switch (f.qaTier() == null ? "" : f.qaTier()) {
            case "STRONG" -> 2;
            case "WEAK" -> 1;
            default -> 0;
        };
        return tier * 10 + (f.qaConfidence() != null ? f.qaConfidence() : f.confidence());
    }

    private Set<String> loadBaseline(Path root) {
        if (baseline == null) return null;
        Path p = root.resolve(baseline).normalize();
        if (!Files.isReadable(p)) throw new IllegalArgumentException("--baseline not readable: " + p);
        Model model = RDFDataMgr.loadModel(p.toString());
        Set<String> iris = new HashSet<>();
        ResIterator it = model.listSubjects();
        while (it.hasNext()) {
            Resource r = it.next();
            if (!r.isAnon() && r.getURI() != null) iris.add(r.getURI());
        }
        return iris;
    }

    private Map<String, String> loadModuleMap(Path root) {
        if (moduleMap == null) return Map.of();
        Path p = root.resolve(moduleMap).normalize();
        try {
            return mapper.readValue(p.toFile(), new TypeReference<Map<String, String>>() {
            });
        } catch (IOException e) {
            throw new IllegalArgumentException("--module-map: " + e.getMessage(), e);
        }
    }

    /**
     * Without a module map, the namespace names the module for vocabularies split over
     * sub-namespaces ({@code https://w3id.org/eudpp/textile-durability#X} → {@code textile-durability});
     * a single-namespace vocabulary gets "".
     */
    static String moduleFromNamespace(String iri) {
        int hash = iri.lastIndexOf('#');
        String ns = hash > 0 ? iri.substring(0, hash) : iri.substring(0, Math.max(0, iri.lastIndexOf('/')));
        String last = ns.substring(ns.lastIndexOf('/') + 1);
        return last.contains("-") ? last : "";
    }

    private static String fmt(double d) {
        return String.format(Locale.ROOT, "%.2f", d);
    }

    private void write(Path root, List<CoverageRow> rows, int upstreamCount) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String b : List.of("covered", "proposed", "code-list", "epcis-cbv", "uncovered")) {
            counts.put(b, rows.stream().filter(r -> r.bucket().equals(b)).count());
        }
        Map<String, Long> advice = new LinkedHashMap<>();
        for (CoverageRow r : rows) {
            if (r.adviceAction() != null) advice.merge(r.adviceAction(), 1L, Long::sum);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("# Reverse coverage — ").append(vocab != null ? vocab : "all upstream vocabularies")
                .append(onlyNew ? " (terms new since the baseline)" : "").append("\n\n");
        sb.append("Generated ").append(stamp).append(". ").append(upstreamCount)
                .append(" upstream terms, each in one bucket: ");
        sb.append(counts.entrySet().stream().map(e -> e.getKey() + " " + e.getValue())
                .reduce((a, b) -> a + ", " + b).orElse("")).append(".");
        if (!advice.isEmpty()) sb.append(" Advice: ").append(advice).append('.');
        sb.append("\n\n");
        for (String b : counts.keySet()) {
            List<CoverageRow> list = rows.stream().filter(r -> r.bucket().equals(b))
                    .sorted(Comparator.comparing(CoverageRow::module).thenComparing(CoverageRow::localName))
                    .toList();
            if (list.isEmpty()) continue;
            sb.append("## ").append(b).append(" (").append(list.size()).append(")\n\n");
            sb.append("| Module | Upstream term | type | new | nearest ours | cos | proposal / covered by | advice |\n");
            sb.append("|---|---|---|---|---|---|---|---|\n");
            for (CoverageRow r : list) {
                String prop = r.coveredBy() != null ? r.coveredBy()
                        : r.proposalOurId() != null
                        ? r.proposalOurId() + " " + r.proposalPredicate() + " (" + r.proposalTier() + ")" : "";
                String adv = r.adviceAction() == null ? ""
                        : r.adviceAction() + (r.adviceProposedName() != null && !r.adviceProposedName().isBlank()
                        ? " " + r.adviceModule() + ":" + r.adviceProposedName() : "")
                        + (r.adviceCounterpart() != null && !r.adviceCounterpart().isBlank()
                        ? " → " + r.adviceCounterpart() : "");
                sb.append("| ").append(r.module()).append(" | `").append(r.localName()).append("` | ")
                        .append(r.type()).append(" | ").append(r.isNew() ? "yes" : "").append(" | ")
                        .append(r.nearestOurId() == null ? "" : "`" + r.nearestOurId() + "`").append(" | ")
                        .append(r.nearestOurId() == null ? "" : fmt(r.nearestCosine())).append(" | ")
                        .append(prop.replace("|", "\\|")).append(" | ").append(adv.replace("|", "\\|")).append(" |\n");
            }
            sb.append('\n');
        }

        try {
            Path md = root.resolve(out + ".md").normalize();
            Files.createDirectories(md.getParent());
            Files.writeString(md, sb.toString());
            Map<String, Object> doc = new LinkedHashMap<>();
            doc.put("generated", stamp);
            doc.put("vocab", vocab);
            doc.put("baseline", baseline);
            doc.put("onlyNew", onlyNew);
            doc.put("minCosine", minCosine);
            doc.put("counts", counts);
            doc.put("advice", advice);
            doc.put("terms", rows);
            mapper.writerWithDefaultPrettyPrinter().writeValue(root.resolve(out + ".json").toFile(), doc);
            System.out.printf("%nreverse: %d upstream terms %s → %s.{md,json}%n", rows.size(), counts, root.resolve(out));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
