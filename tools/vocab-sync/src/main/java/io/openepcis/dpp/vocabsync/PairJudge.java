package io.openepcis.dpp.vocabsync;

import io.openepcis.dpp.vocabsync.model.ExistingMapping;
import io.openepcis.dpp.vocabsync.model.Finding;
import io.openepcis.dpp.vocabsync.model.OurTerm;
import io.openepcis.dpp.vocabsync.model.UpstreamTerm;
import io.openepcis.dpp.vocabsync.model.Verdict;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

/**
 * Grades one (our term, upstream term) pair and QA-verifies the resulting finding. Shared by the
 * forward {@code audit} (for each of OUR terms, which upstream term matches?) and the reverse
 * coverage pass (for each UPSTREAM term, which of ours matches?), so both directions are judged by
 * the same prompts, the same verdict cache and the same panel reconciliation.
 *
 * <p>Everything here is per-pair; the orchestration (which pairs, how many in flight, where the
 * report goes) stays in the commands.
 */
@ApplicationScoped
public class PairJudge {

    @Inject Grader grader;
    @Inject QaGrader qaGrader;
    @Inject VerdictCache verdicts;
    @Inject Embeddings embeddings;

    @Inject AnthropicBatch anthropicBatch;

    @ConfigProperty(name = "quarkus.langchain4j.openai.qa.chat-model.model-name") String qaModelName;

    /** Cache tag of the bulk grader when it is not the configured chat model (the batch path). */
    private String graderTag;

    public String qaModelName() {
        return qaModelName;
    }

    /**
     * Grade with an Anthropic model through the Message Batches API instead of the configured chat
     * model. Its verdicts are cached under the model id, so they never mix with the local grader's.
     */
    public void useBatchGrader(String model) {
        this.graderTag = model;
    }

    /** Run the QA panel on an Anthropic model through the Message Batches API. */
    public void useBatchQa(String model) {
        this.qaModelName = model;
    }

    /**
     * Upstream terms that are serialisation slots of a data format rather than concepts. A mapping
     * onto one says nothing about meaning ("a measurement is a kind of value"), so the curator
     * never publishes it, and no model in the 2026-11-06 benchmark kept to that rule from the
     * prompt alone (2 to 12 % on 51 slot pairs). The rule is applied here, before any model.
     */
    private static final Map<String, java.util.Set<String>> SLOTS = Map.of(
            "eu-dpp", java.util.Set.of("url", "value", "unit", "language", "valueRange", "bin",
                    "lowerBound", "upperBound", "recordedTime", "resourceTitle"),
            "gs1", java.util.Set.of("value"));

    /** Is {@code up} a serialisation slot (see {@link #SLOTS})? */
    public static boolean isSlot(UpstreamTerm up) {
        java.util.Set<String> s = SLOTS.get(up.vocabId());
        return s != null && s.contains(up.localName());
    }

    private static Verdict slotVerdict() {
        return new Verdict(Verdict.Relation.NONE, 1.0, "serialisation slot of the upstream format, not a concept");
    }

    private Verdict cachedGrade(OurTerm t, UpstreamTerm up, String sig) {
        return graderTag == null ? verdicts.get(t.iri(), up.iri(), sig)
                : verdicts.get(graderTag, t.iri(), up.iri(), sig);
    }

    private void cacheGrade(OurTerm t, UpstreamTerm up, String sig, Verdict v) {
        if (graderTag == null) verdicts.put(t.iri(), up.iri(), sig, v);
        else verdicts.put(graderTag, t.iri(), up.iri(), sig, v);
    }

    private static String userPrompt(OurTerm t, UpstreamTerm up) {
        return GraderPrompts.fillUser(t.prefixedId(), t.type().label(), nz(t.label()), nz(t.comment()),
                nz(t.domain()), nz(t.range()), up.vocabId(), up.iri(), up.type().label(),
                nz(up.label()), nz(up.comment()), nz(up.domain()), nz(up.range()));
    }

    /**
     * Batch pre-pass for the bulk grade: every pair without a cached verdict goes to the batch grader
     * in one Message Batch, and each parsed verdict is cached. The normal reactive pass then only hits
     * the cache. A pair whose reply failed or did not parse stays uncached and is graded by the
     * configured chat model in that pass. Returns the number of verdicts cached.
     */
    public int prefillGrades(List<OurTerm> terms, List<UpstreamTerm> ups) {
        if (graderTag == null) return 0;
        List<AnthropicBatch.Request> reqs = new ArrayList<>();
        Map<String, Object[]> byKey = new java.util.HashMap<>();
        for (int i = 0; i < terms.size(); i++) {
            OurTerm t = terms.get(i);
            UpstreamTerm up = ups.get(i);
            if (isSlot(up)) continue;
            String sig = contentSig(t, up);
            if (cachedGrade(t, up, sig) != null) continue;
            String k = t.iri() + "\n" + up.iri();
            if (byKey.putIfAbsent(k, new Object[]{t, up, sig}) != null) continue;
            reqs.add(new AnthropicBatch.Request(k, GraderPrompts.SYSTEM,
                    userPrompt(t, up) + GraderPrompts.JSON_INSTRUCTION));
        }
        System.err.printf("batch grade: %d uncached pair(s) for %s%n", reqs.size(), graderTag);
        int n = 0;
        for (var e : anthropicBatch.run(graderTag, reqs).entrySet()) {
            Object[] p = byKey.get(e.getKey());
            var v = VerdictParser.parse(e.getValue());
            if (v.isEmpty()) continue;
            cacheGrade((OurTerm) p[0], (UpstreamTerm) p[1], (String) p[2], v.get());
            n++;
        }
        verdicts.save();
        return n;
    }

    /**
     * Batch pre-pass for the QA panel: every (finding, lens) judge without a cached vote goes into one
     * Message Batch on the batch QA model, and each parsed vote is cached under that model and lens.
     * {@link #qaPanelUni} then reconciles from the cache.
     */
    public int prefillQa(List<Finding> findings, Map<String, OurTerm> ourByIri,
                         java.util.function.Function<String, UpstreamTerm> upByIri, int qaJudges) {
        List<AnthropicBatch.Request> reqs = new ArrayList<>();
        Map<String, String[]> byKey = new java.util.HashMap<>();
        for (Finding f : findings) {
            OurTerm t = ourByIri.get(f.ourIri());
            UpstreamTerm up = upByIri.apply(f.upstreamIri());
            if (t == null || up == null) continue;
            String sig = contentSig(t, up);
            for (String[] lens : selectedLenses(qaJudges)) {
                String modelTag = qaModelName + "|" + lens[0];
                if (verdicts.get(modelTag, f.ourIri(), f.upstreamIri(), sig) != null) continue;
                String k = modelTag + "\n" + f.ourIri() + "\n" + f.upstreamIri();
                if (byKey.putIfAbsent(k, new String[]{modelTag, f.ourIri(), f.upstreamIri(), sig}) != null) continue;
                reqs.add(new AnthropicBatch.Request(k, GraderPrompts.QA_BLIND_SYSTEM,
                        GraderPrompts.fillQaUser(lens[1], userPrompt(t, up)) + GraderPrompts.JSON_INSTRUCTION));
            }
        }
        System.err.printf("batch QA: %d uncached judge vote(s) for %s%n", reqs.size(), qaModelName);
        int n = 0;
        for (var e : anthropicBatch.run(qaModelName, reqs).entrySet()) {
            String[] p = byKey.get(e.getKey());
            var v = VerdictParser.parse(e.getValue());
            if (v.isEmpty()) continue;
            verdicts.put(p[0], p[1], p[2], p[3], v.get());
            n++;
        }
        verdicts.save();
        return n;
    }

    /** Distinct QA lenses; a panel of these (run blind) gives decorrelated votes from the QA model. */
    private static final List<String[]> QA_LENSES = List.of(
            new String[]{"scope", "Lens: compare the DEFINITIONS' scope — are the two concepts the same, "
                    + "strongly overlapping, or does one fully contain the other?"},
            new String[]{"direction", "Lens: focus on HIERARCHY — is OUR term broader than, narrower than, "
                    + "or equal in scope to the upstream term? Choose BROAD/NARROW only if one genuinely "
                    + "subsumes the other."},
            new String[]{"skeptic", "Lens: be a strict skeptic — default to NONE unless the concepts are "
                    + "genuinely the same or clearly overlapping; a similar label with a differing definition, "
                    + "domain, or range is NONE."},
            new String[]{"neutral", "Lens: weigh definition, domain, and range together and choose the single "
                    + "best relation."});

    /** N distinct lenses (capped at the available set — extra judges at temperature 0 only duplicate). */
    public List<String[]> selectedLenses(int qaJudges) {
        int n = Math.min(Math.max(1, qaJudges), QA_LENSES.size());
        return QA_LENSES.subList(0, n);
    }

    /**
     * Verdict for a pair: a cache hit resolves immediately, otherwise the reactive grader
     * runs with exponential-backoff retry. The verdict is cached only on success, so a
     * terminal failure leaves the pair ungraded for the next run to retry.
     */
    public Uni<Verdict> gradeCachedUni(OurTerm t, UpstreamTerm up, int retries) {
        if (isSlot(up)) return Uni.createFrom().item(slotVerdict());
        String sig = contentSig(t, up);
        Verdict cached = cachedGrade(t, up, sig);
        if (cached != null) return Uni.createFrom().item(cached);
        // langchain4j's structured-output AiService is blocking, so run it as a deferred
        // Uni on the worker pool. merge(concurrency) upstream bounds how many run at once.
        return Uni.createFrom().item(() -> grader.grade(
                        t.prefixedId(), t.type().label(), nz(t.label()), nz(t.comment()),
                        nz(t.domain()), nz(t.range()), up.vocabId(), up.iri(), up.type().label(),
                        nz(up.label()), nz(up.comment()), nz(up.domain()), nz(up.range())))
                .runSubscriptionOn(Infrastructure.getDefaultWorkerPool())
                .onFailure().retry()
                    .withBackOff(Duration.ofMillis(500), Duration.ofSeconds(8))
                    .atMost(Math.max(1, retries))
                .onItem().invoke(v -> cacheGrade(t, up, sig, v))
                .onFailure().recoverWithItem(e ->
                        new Verdict(Verdict.Relation.NONE, 0, "grade failed: " + e.getMessage()));
    }

    /**
     * QA panel: run {@code qaJudges} blind judges (distinct lenses, NOT shown the bulk proposal) and
     * {@link #reconcile} their votes against the bulk relation into a two-tier verdict. Each judge is
     * cached by {@code (qa-model|lens, ourIri, upIri, contentSig)}; the judges for a finding run together
     * and the blocking HTTP calls go on the worker pool. The caller's merge bounds findings in flight.
     */
    public Uni<Finding> qaPanelUni(Finding f, OurTerm t, UpstreamTerm up, int retries, int qaJudges) {
        if (t == null || up == null) return Uni.createFrom().item(f);
        String sig = contentSig(t, up);
        List<Uni<Verdict>> judges = new ArrayList<>();
        for (String[] lens : selectedLenses(qaJudges)) {
            String lensId = lens[0], lensText = lens[1];
            String modelTag = qaModelName + "|" + lensId;
            Verdict cached = verdicts.get(modelTag, f.ourIri(), f.upstreamIri(), sig);
            if (cached != null) {
                judges.add(Uni.createFrom().item(cached));
                continue;
            }
            Uni<Verdict> raw = Uni.createFrom().item((Supplier<Verdict>) () -> qaGrader.judgeBlind(
                                    lensText, t.prefixedId(), t.type().label(), nz(t.label()), nz(t.comment()),
                                    nz(t.domain()), nz(t.range()), up.vocabId(), up.iri(), up.type().label(),
                                    nz(up.label()), nz(up.comment()), nz(up.domain()), nz(up.range())))
                            .runSubscriptionOn(Infrastructure.getDefaultWorkerPool());
            judges.add(raw
                    .onFailure().retry().withBackOff(Duration.ofMillis(500), Duration.ofSeconds(8))
                        .atMost(Math.max(1, retries))
                    .onItem().invoke(v -> verdicts.put(modelTag, f.ourIri(), f.upstreamIri(), sig, v))
                    .onFailure().recoverWithItem(e ->
                            new Verdict(Verdict.Relation.NONE, 0, "qa failed: " + e.getMessage())));
        }
        return Uni.join().all(judges).andFailFast().onItem().transform(votes -> {
            Recon r = reconcile(f.relation(), votes);
            return f.withQaPanel(r.relation(), r.confidence(), r.rationale(), r.tier(), r.predicate());
        });
    }

    /** Panel outcome: the gating tier, the panel-consensus relation, its confidence, and the predicate to write. */
    public record Recon(String tier, Verdict.Relation relation, double confidence, String rationale, String predicate) {
    }

    /**
     * Reconcile a panel of blind votes against the bulk relation into a two-tier verdict:
     * STRONG (strict majority equals the bulk relation → write that relation), WEAK (majority is a
     * different non-NONE relation → existence agreed but not the grade → write skos:closeMatch),
     * REJECT (majority NONE), SPLIT (no strict majority → leave for review). Pure for unit testing.
     */
    public static Recon reconcile(Verdict.Relation bulk, List<Verdict> votes) {
        int k = votes.size();
        Map<Verdict.Relation, Integer> tally = new java.util.EnumMap<>(Verdict.Relation.class);
        Map<Verdict.Relation, Double> confSum = new java.util.EnumMap<>(Verdict.Relation.class);
        for (Verdict v : votes) {
            tally.merge(v.relation(), 1, Integer::sum);
            confSum.merge(v.relation(), v.confidence(), Double::sum);
        }
        Verdict.Relation maj = null;
        int best = 0;
        for (var e : tally.entrySet()) {
            if (e.getValue() > best) { best = e.getValue(); maj = e.getKey(); }
        }
        String tallyStr = tally.toString();
        if (maj == null || best * 2 <= k) {
            return new Recon("SPLIT", Verdict.Relation.NONE, 0, "panel split " + tallyStr, null);
        }
        double conf = confSum.get(maj) / best;
        if (maj == Verdict.Relation.NONE) {
            return new Recon("REJECT", Verdict.Relation.NONE, conf, "panel majority NONE " + tallyStr, null);
        }
        if (maj == bulk) {
            return new Recon("STRONG", maj, conf, "panel agrees " + tallyStr, maj.predicate());
        }
        return new Recon("WEAK", maj, conf,
                "panel agrees a relation but not the grade (bulk " + bulk + ") " + tallyStr,
                Verdict.Relation.CLOSE.predicate());
    }

    /**
     * Classify a verdict against the term's existing TTL mappings → a Finding (or null to skip).
     * {@code minConfidence} drops graded matches the bulk grader is unsure about.
     */
    public Finding classify(OurTerm t, UpstreamTerm up, double cosine, Verdict v, double minConfidence) {
        List<ExistingMapping> forIri = t.existing().stream()
                .filter(m -> m.targetIri().equals(up.iri())).toList();
        String gradedExisting = forIri.stream().map(ExistingMapping::predicate)
                .filter(PairJudge::isGraded).findFirst().orElse(null);
        boolean anyExisting = !forIri.isEmpty();
        String existingPred = anyExisting ? forIri.get(0).predicate() : null;

        if (!v.relation().isMatch()) {
            // Grader says NONE. Only interesting if the TTL asserts a graded mapping here.
            if (gradedExisting != null) {
                return new Finding(t.moduleSlug(), t.prefixedId(), t.type().label(), t.iri(),
                        up.vocabId(), up.iri(), up.label(), Verdict.Relation.NONE, null,
                        v.confidence(), cosine, v.rationale(), Finding.Status.WRONG, gradedExisting,
                        null, null, null, null, null);
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
                null, null, null, null, null);
    }

    /** A predicate counts as a graded assertion (vs informational seeAlso). */
    public static boolean isGraded(String pred) {
        String p = local(pred);
        return p.equals("exactMatch") || p.equals("closeMatch") || p.equals("broadMatch")
                || p.equals("narrowMatch") || p.equals("equivalentClass") || p.equals("equivalentProperty");
    }

    /** Does the existing graded predicate match the grader's proposed relation? */
    static boolean agrees(String existingPred, Verdict.Relation rel) {
        String p = local(existingPred);
        if ((p.equals("equivalentClass") || p.equals("equivalentProperty")))
            return rel == Verdict.Relation.EXACT;
        return rel.predicate() != null && local(rel.predicate()).equals(p);
    }

    private static String local(String prefixed) {
        int i = prefixed.indexOf(':');
        return i >= 0 ? prefixed.substring(i + 1) : prefixed;
    }

    public static String nz(String s) {
        return s == null ? "(none)" : s;
    }

    public double scoreOf(OurTerm t, UpstreamTerm up) {
        try {
            return Embeddings.cosine(embeddings.embed(t.embedText()), embeddings.embed(up.embedText()));
        } catch (RuntimeException e) {
            return 0;
        }
    }

    /**
     * Fingerprint of everything the grader sees for a pair except the IRIs (which are already in the
     * cache key). Folding this into the verdict key means an upstream definition/label/domain edit
     * that keeps the same IRI invalidates the cached verdict, so a re-run re-grades only moved pairs.
     */
    public static String contentSig(OurTerm t, UpstreamTerm up) {
        String raw = String.join("\u0001", GraderPrompts.RUBRIC_VERSION,
                t.type().label(), nz(t.label()), nz(t.comment()), nz(t.domain()), nz(t.range()),
                up.type().label(), nz(up.label()), nz(up.comment()));
        try {
            byte[] h = java.security.MessageDigest.getInstance("SHA-1")
                    .digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(16);
            for (int i = 0; i < 8; i++) sb.append(String.format("%02x", h[i]));
            return sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            return Integer.toHexString(raw.hashCode());
        }
    }
}
