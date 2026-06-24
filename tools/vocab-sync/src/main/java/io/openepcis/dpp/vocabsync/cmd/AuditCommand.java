package io.openepcis.dpp.vocabsync.cmd;

import io.openepcis.dpp.vocabsync.ClaudeCli;
import io.openepcis.dpp.vocabsync.Embeddings;
import io.openepcis.dpp.vocabsync.Grader;
import io.openepcis.dpp.vocabsync.OurIndex;
import io.openepcis.dpp.vocabsync.QaGrader;
import io.openepcis.dpp.vocabsync.RdfSupport;
import io.openepcis.dpp.vocabsync.ReportWriter;
import io.openepcis.dpp.vocabsync.Retriever;
import io.openepcis.dpp.vocabsync.UpstreamIndex;
import io.openepcis.dpp.vocabsync.VerdictCache;
import io.openepcis.dpp.vocabsync.model.Candidate;
import io.openepcis.dpp.vocabsync.model.ExistingMapping;
import io.openepcis.dpp.vocabsync.model.Finding;
import io.openepcis.dpp.vocabsync.model.OurTerm;
import io.openepcis.dpp.vocabsync.model.UpstreamTerm;
import io.openepcis.dpp.vocabsync.model.Verdict;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

/**
 * Completeness audit. For each of our terms: retrieve type-compatible upstream candidates
 * by embedding similarity, LLM-grade each pair (cached), classify the verdict against the
 * SKOS already in the TTL, and write a reviewable report. Existing mapping targets are
 * always re-graded so disagreements (WRONG) surface too. No TTL is touched.
 */
@CommandLine.Command(
        name = "audit",
        description = "Find missing / weak / wrong SKOS mappings from our terms to upstream "
                + "and write docs/skos-completeness-report.{md,json}.")
public class AuditCommand implements Runnable {

    @Inject OurIndex ourIndex;
    @Inject UpstreamIndex upstreamIndex;
    @Inject Retriever retriever;
    @Inject Grader grader;
    @Inject QaGrader qaGrader;
    @Inject ClaudeCli claudeCli;
    @Inject VerdictCache verdicts;
    @Inject ReportWriter reportWriter;
    @Inject Embeddings embeddings;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;

    @ConfigProperty(name = "quarkus.langchain4j.openai.qa.chat-model.model-name") String qaModelName;

    @CommandLine.Option(names = "--module", description = "Limit to one module slug (e.g. core, battery).")
    String module;

    @CommandLine.Option(names = "--limit", defaultValue = "0",
            description = "Audit at most N of our terms (0 = all). Useful for a quick dry-run.")
    int limit;

    @CommandLine.Option(names = "--k", defaultValue = "4", description = "Candidates per vocab.")
    int kPerVocab;

    @CommandLine.Option(names = "--min-cosine", defaultValue = "0.50",
            description = "Only grade candidates at/above this cosine (exact-name + existing always graded).")
    double minCosine;

    @CommandLine.Option(names = "--min-confidence", defaultValue = "0.55",
            description = "Drop graded matches below this confidence.")
    double minConfidence;

    @CommandLine.Option(names = "--max-candidates", defaultValue = "6",
            description = "Hard cap on graded candidates per term (exact-name + existing exempt).")
    int maxCandidates;

    @CommandLine.Option(names = "--concurrency", defaultValue = "2",
            description = "Parallel grading requests to the LLM endpoint (LM Studio 500s above ~2 sustained).")
    int concurrency;

    @CommandLine.Option(names = "--retries", defaultValue = "4",
            description = "Per-pair retry attempts on a transient LLM error (with backoff).")
    int retries;

    @CommandLine.Option(names = "--no-qa", defaultValue = "false",
            description = "Skip the second-tier QA verifier (QA runs by default).")
    boolean skipQa;

    @CommandLine.Option(names = "--qa-min-confidence", defaultValue = "0.0",
            description = "Only QA-verify findings at/above this bulk confidence.")
    double qaMinConfidence;

    @CommandLine.Option(names = "--qa-concurrency", defaultValue = "1",
            description = "Parallel QA requests (the flagship model is large; keep low).")
    int qaConcurrency;

    @CommandLine.Option(names = "--qa-provider", defaultValue = "openai",
            description = "QA backend: 'openai' (HTTP, needs API key for Claude) or 'claude-cli' "
                    + "(shells out to `claude -p`, uses your Claude subscription login).")
    String qaProvider;

    @CommandLine.Option(names = "--qa-cli-model", defaultValue = "claude-opus-4-8",
            description = "Model id for the claude-cli QA provider.")
    String qaCliModel;

    @CommandLine.Option(names = "--out", description = "Report basename (default docs/skos-completeness-report).")
    String out;

    @CommandLine.Option(names = "--stamp", defaultValue = "unset",
            description = "Timestamp string to embed in the report (Date.now is unavailable to the JVM tool by policy).")
    String stamp;

    @Override
    public void run() {
        List<OurTerm> ours = ourIndex.load(module);
        if (limit > 0 && ours.size() > limit) ours = ours.subList(0, limit);
        String scope = (module != null ? "module=" + module : "all modules")
                + (limit > 0 ? " (limit " + limit + ")" : "") + ", " + ours.size() + " terms";
        System.err.println("audit: " + scope);

        boolean qa = !skipQa;

        // Seed the exact IRIs our TTLs already map to, so every existing mapping can be
        // re-graded (validation) even for vocabularies with no machine-readable term set.
        int seeded = 0;
        for (OurTerm t : ours) {
            for (ExistingMapping m : t.existing()) {
                if (!upstreamIndex.contains(m.targetIri())) {
                    upstreamIndex.seed(UpstreamIndex.vocabIdForIri(m.targetIri()),
                            m.targetIri(), RdfSupport.localOf(m.targetIri()), t.type());
                    seeded++;
                }
            }
        }
        if (seeded > 0) System.err.println("audit: seeded " + seeded + " existing-mapping targets");

        retriever.prepare(); // embeds the upstream index once (cached on disk)

        // 1) Build the (our term, candidate) work list: retrieved candidates above the
        //    cosine gate ∪ exact-name matches ∪ existing-mapping targets present upstream.
        record Pair(OurTerm term, UpstreamTerm up, double cosine, boolean existingTarget) {
        }
        List<Pair> work = new ArrayList<>();
        for (OurTerm t : ours) {
            Map<String, Pair> perTerm = new LinkedHashMap<>();
            int graded = 0;
            for (Candidate c : retriever.candidatesFor(t, kPerVocab)) {
                boolean keep = c.exactLocalName() || c.score() >= minCosine;
                if (!keep) continue;
                if (!c.exactLocalName() && graded >= maxCandidates) continue;
                perTerm.putIfAbsent(c.term().iri(), new Pair(t, c.term(), c.score(), false));
                graded++;
            }
            // Always (re-)grade existing mapping targets that exist upstream, to catch WRONG.
            for (ExistingMapping m : t.existing()) {
                UpstreamTerm up = upstreamIndex.get(m.targetIri());
                if (up != null && up.type() == t.type()) {
                    perTerm.put(up.iri(), new Pair(t, up, scoreOf(t, up), true));
                }
            }
            work.addAll(perTerm.values());
        }
        System.err.printf("audit: %d terms → %d candidate pairs to grade%n", ours.size(), work.size());

        // 2) Grade reactively: bounded in-flight requests via Mutiny merge(concurrency),
        //    declarative backoff retry per pair, verdicts cached on success only.
        AtomicInteger done = new AtomicInteger();
        int total = work.size();
        List<Finding> findings = Multi.createFrom().iterable(work)
                .onItem().transformToUni(p -> gradeCachedUni(p.term(), p.up())
                        .onItem().transform(v -> {
                            int n = done.incrementAndGet();
                            if (n % 25 == 0 || n == total) {
                                System.err.printf("  graded %d / %d%n", n, total);
                                verdicts.save();
                            }
                            return Optional.ofNullable(
                                    classify(p.term(), p.up(), p.cosine(), v, p.existingTarget()));
                        }))
                .merge(Math.max(1, concurrency))
                .collect().asList()
                .await().indefinitely()
                .stream().flatMap(Optional::stream)
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
        verdicts.save();

        // 3) Hallucination guard: every reported upstream IRI must exist in the index.
        findings.removeIf(f -> {
            boolean real = upstreamIndex.contains(f.upstreamIri());
            if (!real) System.err.println("  dropped hallucinated IRI: " + f.upstreamIri());
            return !real;
        });

        // 3.5) QA verification: a stronger second-tier model re-judges each finding.
        if (qa && !findings.isEmpty()) {
            Map<String, OurTerm> ourByIri = ours.stream()
                    .collect(java.util.stream.Collectors.toMap(OurTerm::iri, x -> x, (a, b) -> a));
            List<Finding> toQa = findings.stream().filter(f -> f.confidence() >= qaMinConfidence).toList();
            String qaLabel = "claude-cli".equalsIgnoreCase(qaProvider)
                    ? qaCliModel + " (claude -p)" : qaModelName;
            System.err.printf("QA: verifying %d / %d findings with %s%n",
                    toQa.size(), findings.size(), qaLabel);
            AtomicInteger qd = new AtomicInteger();
            int qaTotal = toQa.size();
            List<Finding> verified = Multi.createFrom().iterable(toQa)
                    .onItem().transformToUni(f -> qaVerifyUni(f, ourByIri.get(f.ourIri()),
                            upstreamIndex.get(f.upstreamIri()))
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
            Map<String, Finding> merged = new LinkedHashMap<>();
            for (Finding f : findings) merged.put(f.ourIri() + "\t" + f.upstreamIri(), f);
            for (Finding f : verified) merged.put(f.ourIri() + "\t" + f.upstreamIri(), f);
            findings = new ArrayList<>(merged.values());
        }

        // 4) Write the report.
        String base = out != null ? out : "docs/skos-completeness-report";
        Path md = Path.of(repoRoot).resolve(base + ".md").normalize();
        Path json = Path.of(repoRoot).resolve(base + ".json").normalize();
        reportWriter.write(md, json, findings, scope, stamp);

        Map<Finding.Status, Long> by = new LinkedHashMap<>();
        for (Finding.Status s : Finding.Status.values()) {
            by.put(s, findings.stream().filter(x -> x.status() == s).count());
        }
        long confirmed = findings.stream().filter(f -> Boolean.TRUE.equals(f.confirmed())).count();
        System.out.printf("%naudit complete: %d findings  MISSING=%d WEAK=%d WRONG=%d OK=%d%s%n",
                findings.size(), by.get(Finding.Status.MISSING), by.get(Finding.Status.WEAK),
                by.get(Finding.Status.WRONG), by.get(Finding.Status.OK),
                qa ? "  (QA-confirmed=" + confirmed + ")" : "");
        System.out.println("report: " + md);
        System.out.println("json:   " + json);
    }

    /**
     * QA-verify one finding with the second-tier model. A cache hit resolves immediately;
     * otherwise the QA grader runs on the worker pool with backoff retry. {@code confirmed}
     * means the QA relation exactly matches the bulk-proposed relation.
     */
    private Uni<Finding> qaVerifyUni(Finding f, OurTerm t, UpstreamTerm up) {
        if (t == null || up == null) return Uni.createFrom().item(f);
        boolean cli = "claude-cli".equalsIgnoreCase(qaProvider);
        String modelTag = cli ? qaCliModel : qaModelName;
        Verdict cached = verdicts.get(modelTag, f.ourIri(), f.upstreamIri());
        Uni<Verdict> vu;
        if (cached != null) {
            vu = Uni.createFrom().item(cached);
        } else {
            // claude-cli is already non-blocking (Process.onExit → Uni); the HTTP grader is
            // blocking, so it runs on the worker pool. Both share retry/cache/recover below.
            Uni<Verdict> raw;
            if (cli) {
                raw = claudeCli.runAsync(QA_SYSTEM, qaUserPrompt(f, t, up), qaCliModel, 300);
            } else {
                raw = Uni.createFrom().item((Supplier<Verdict>) () -> qaGrader.verify(
                                t.prefixedId(), t.type().label(), nz(t.label()), nz(t.comment()),
                                nz(t.domain()), nz(t.range()), up.vocabId(), up.iri(), up.type().label(),
                                nz(up.label()), nz(up.comment()),
                                f.relation().name(), nz(f.rationale())))
                        .runSubscriptionOn(Infrastructure.getDefaultWorkerPool());
            }
            vu = raw
                    .onFailure().retry().withBackOff(Duration.ofMillis(500), Duration.ofSeconds(8))
                        .atMost(Math.max(1, retries))
                    .onItem().invoke(v -> verdicts.put(modelTag, f.ourIri(), f.upstreamIri(), v))
                    .onFailure().recoverWithItem(e ->
                            new Verdict(Verdict.Relation.NONE, 0, "qa failed: " + e.getMessage()));
        }
        return vu.onItem().transform(qv ->
                f.withQa(qv.relation(), qv.confidence(), qv.rationale(), qv.relation() == f.relation()));
    }

    /** QA verifier instructions for the claude-cli path (mirrors {@link QaGrader}'s system prompt). */
    private static final String QA_SYSTEM = """
            You are the senior QA reviewer for cross-vocabulary term alignment in a Digital
            Product Passport ontology. A first-pass grader proposed a graded-SKOS relation
            between OUR term and ONE upstream term. Independently decide the correct relation
            from OUR term's perspective; do not defer to the first pass. Be stricter than it.
            Relations: EXACT (interchangeable), CLOSE (overlapping not identical), BROAD (ours
            is broader), NARROW (ours is narrower), NONE (not the same concept; reject). Judge
            meaning not name similarity; a class matches only a class, a property only a
            property; when uncertain prefer the weaker grade or NONE.
            Respond with ONLY a JSON object, no prose:
            {"relation":"EXACT|CLOSE|BROAD|NARROW|NONE","confidence":0.0,"rationale":"one sentence"}
            """;

    private String qaUserPrompt(Finding f, OurTerm t, UpstreamTerm up) {
        return """
                OUR TERM
                  id: %s
                  type: %s
                  label: %s
                  definition: %s
                  domain: %s
                  range: %s

                UPSTREAM CANDIDATE
                  vocabulary: %s
                  iri: %s
                  type: %s
                  label: %s
                  definition: %s

                FIRST-PASS PROPOSAL (verify or correct)
                  relation: %s
                  rationale: %s
                """.formatted(
                t.prefixedId(), t.type().label(), nz(t.label()), nz(t.comment()),
                nz(t.domain()), nz(t.range()),
                up.vocabId(), up.iri(), up.type().label(), nz(up.label()), nz(up.comment()),
                f.relation().name(), nz(f.rationale()));
    }

    private double scoreOf(OurTerm t, UpstreamTerm up) {
        try {
            return Embeddings.cosine(embeddings.embed(t.embedText()), embeddings.embed(up.embedText()));
        } catch (RuntimeException e) {
            return 0;
        }
    }

    /**
     * Verdict for a pair: a cache hit resolves immediately, otherwise the reactive grader
     * runs with exponential-backoff retry. The verdict is cached only on success, so a
     * terminal failure leaves the pair ungraded for the next run to retry.
     */
    private Uni<Verdict> gradeCachedUni(OurTerm t, UpstreamTerm up) {
        Verdict cached = verdicts.get(t.iri(), up.iri());
        if (cached != null) return Uni.createFrom().item(cached);
        // langchain4j's structured-output AiService is blocking, so run it as a deferred
        // Uni on the worker pool. merge(concurrency) upstream bounds how many run at once.
        return Uni.createFrom().item(() -> grader.grade(
                        t.prefixedId(), t.type().label(), nz(t.label()), nz(t.comment()),
                        nz(t.domain()), nz(t.range()), up.vocabId(), up.iri(), up.type().label(),
                        nz(up.label()), nz(up.comment())))
                .runSubscriptionOn(Infrastructure.getDefaultWorkerPool())
                .onFailure().retry()
                    .withBackOff(Duration.ofMillis(500), Duration.ofSeconds(8))
                    .atMost(Math.max(1, retries))
                .onItem().invoke(v -> verdicts.put(t.iri(), up.iri(), v))
                .onFailure().recoverWithItem(e ->
                        new Verdict(Verdict.Relation.NONE, 0, "grade failed: " + e.getMessage()));
    }

    /** Classify a verdict against the term's existing TTL mappings → a Finding (or null to skip). */
    private Finding classify(OurTerm t, UpstreamTerm up, double cosine, Verdict v, boolean existingTarget) {
        List<ExistingMapping> forIri = t.existing().stream()
                .filter(m -> m.targetIri().equals(up.iri())).toList();
        String gradedExisting = forIri.stream().map(ExistingMapping::predicate)
                .filter(AuditCommand::isGraded).findFirst().orElse(null);
        boolean anyExisting = !forIri.isEmpty();
        String existingPred = anyExisting ? forIri.get(0).predicate() : null;

        if (!v.relation().isMatch()) {
            // Grader says NONE. Only interesting if the TTL asserts a graded mapping here.
            if (gradedExisting != null) {
                return new Finding(t.moduleSlug(), t.prefixedId(), t.type().label(), t.iri(),
                        up.vocabId(), up.iri(), up.label(), Verdict.Relation.NONE, null,
                        v.confidence(), cosine, v.rationale(), Finding.Status.WRONG, gradedExisting,
                        null, null, null, null);
            }
            return null;
        }
        if (v.confidence() < minConfidence) return null;

        Finding.Status status;
        if (!anyExisting) {
            status = Finding.Status.MISSING;
        } else if (gradedExisting == null) {
            status = Finding.Status.WEAK; // only seeAlso so far
        } else if (agrees(gradedExisting, v.relation())) {
            status = Finding.Status.OK;
        } else {
            status = Finding.Status.WRONG;
        }
        return new Finding(t.moduleSlug(), t.prefixedId(), t.type().label(), t.iri(),
                up.vocabId(), up.iri(), up.label(), v.relation(), v.relation().predicate(),
                v.confidence(), cosine, v.rationale(), status, existingPred,
                null, null, null, null);
    }

    /** A predicate counts as a graded assertion (vs informational seeAlso). */
    private static boolean isGraded(String pred) {
        String p = local(pred);
        return p.equals("exactMatch") || p.equals("closeMatch") || p.equals("broadMatch")
                || p.equals("narrowMatch") || p.equals("equivalentClass") || p.equals("equivalentProperty");
    }

    /** Does the existing graded predicate match the grader's proposed relation? */
    private static boolean agrees(String existingPred, Verdict.Relation rel) {
        String p = local(existingPred);
        if ((p.equals("equivalentClass") || p.equals("equivalentProperty")))
            return rel == Verdict.Relation.EXACT;
        return rel.predicate() != null && local(rel.predicate()).equals(p);
    }

    private static String local(String prefixed) {
        int i = prefixed.indexOf(':');
        return i >= 0 ? prefixed.substring(i + 1) : prefixed;
    }

    private static String nz(String s) {
        return s == null ? "(none)" : s;
    }
}
