package io.openepcis.dpp.vocabsync.cmd;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;
import java.util.stream.Collectors;

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
    @Inject ObjectMapper mapper;

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

    // Default 2 is the safe value with langchain4j's JDK HttpClient, which negotiates HTTP/2 to LM
    // Studio and stalls under sustained parallelism (the benchmark hit the same wall and pinned
    // HTTP/1.1; see docs/AI_PIPELINE.md "Runtime"). Once the grading path is on HTTP/1.1 this can be
    // raised toward LM Studio's parallel slots (gpt-oss-20b loads with 4). The content-aware verdict
    // cache means a regular re-run grades only changed pairs, so this rarely bites in practice.
    @CommandLine.Option(names = "--concurrency", defaultValue = "2",
            description = "Parallel grading requests to the LLM endpoint (raise once HTTP/1.1 is pinned).")
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

    @CommandLine.Option(names = "--qa-judges", defaultValue = "3",
            description = "QA panel size: N blind judges (distinct lenses) vote; a strict majority that "
                    + "matches the bulk relation is STRONG, an existence-only agreement is WEAK "
                    + "(applied as closeMatch), a NONE majority is REJECT, no majority is SPLIT (review).")
    int qaJudges;

    @CommandLine.Option(names = "--qa-rejudge-from",
            description = "Re-run the QA panel ONLY on findings whose tier in this prior report JSON is in "
                    + "--qa-rejudge-tiers, and carry every other finding's QA verdict over unchanged. Point "
                    + "QA at a stronger model to resolve just the contested set without re-judging everything.")
    String qaRejudgeFrom;

    @CommandLine.Option(names = "--qa-rejudge-tiers", defaultValue = "WEAK,SPLIT",
            description = "Comma-separated prior QA tiers to re-judge when --qa-rejudge-from is set.")
    String qaRejudgeTiers;

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

            // Targeted re-judge: with --qa-rejudge-from, only findings whose tier in the prior report is
            // in --qa-rejudge-tiers go to the (presumably stronger) panel; every other finding keeps its
            // prior QA verdict verbatim. Lets a heavy model resolve just the contested set cheaply.
            final boolean targeted = qaRejudgeFrom != null;
            final Map<String, JsonNode> prior = targeted
                    ? loadPriorQa(Path.of(repoRoot).resolve(qaRejudgeFrom).normalize()) : Map.of();
            final Set<String> rejudge;
            if (targeted) {
                Set<String> tierSet = Arrays.stream(qaRejudgeTiers.split(","))
                        .map(s -> s.trim().toUpperCase()).filter(s -> !s.isEmpty())
                        .collect(Collectors.toSet());
                rejudge = prior.entrySet().stream()
                        .filter(e -> tierSet.contains(e.getValue().path("qaTier").asText("")))
                        .map(Map.Entry::getKey).collect(Collectors.toSet());
                System.err.printf("QA re-judge: %d finding(s) in tiers %s from %s; others carried over%n",
                        rejudge.size(), tierSet, qaRejudgeFrom);
            } else {
                rejudge = Set.of();
            }

            List<Finding> toQa = findings.stream()
                    .filter(f -> f.confidence() >= qaMinConfidence)
                    .filter(f -> !targeted || rejudge.contains(key(f)))
                    .toList();
            String qaLabel = "claude-cli".equalsIgnoreCase(qaProvider)
                    ? qaCliModel + " (claude -p)" : qaModelName;
            System.err.printf("QA: verifying %d / %d findings with a %d-judge blind panel on %s%n",
                    toQa.size(), findings.size(), selectedLenses().size(), qaLabel);
            AtomicInteger qd = new AtomicInteger();
            int qaTotal = toQa.size();
            List<Finding> verified = Multi.createFrom().iterable(toQa)
                    .onItem().transformToUni(f -> qaPanelUni(f, ourByIri.get(f.ourIri()),
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
            for (Finding f : findings) merged.put(key(f), f);
            for (Finding f : verified) merged.put(key(f), f);
            // In targeted mode, overlay the prior QA verdict on every finding we did NOT re-judge, so the
            // output report shows the carried-over tiers alongside the freshly re-judged contested ones.
            if (targeted) {
                int carried = 0;
                for (var e : merged.entrySet()) {
                    if (rejudge.contains(e.getKey())) continue; // freshly judged this run
                    JsonNode p = prior.get(e.getKey());
                    if (p != null && p.hasNonNull("qaTier")) {
                        merged.put(e.getKey(), applyPriorQa(e.getValue(), p));
                        carried++;
                    }
                }
                System.err.printf("QA re-judge: carried over %d prior verdict(s)%n", carried);
            }
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
        String qaSummary = "";
        if (qa) {
            Map<String, Long> byTier = new java.util.TreeMap<>();
            for (Finding f : findings) {
                if (f.qaTier() != null) byTier.merge(f.qaTier(), 1L, Long::sum);
            }
            qaSummary = "  (QA-confirmed=" + confirmed + " " + byTier + ")";
        }
        System.out.printf("%naudit complete: %d findings  MISSING=%d WEAK=%d WRONG=%d OK=%d%s%n",
                findings.size(), by.get(Finding.Status.MISSING), by.get(Finding.Status.WEAK),
                by.get(Finding.Status.WRONG), by.get(Finding.Status.OK), qaSummary);
        System.out.println("report: " + md);
        System.out.println("json:   " + json);
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
    private List<String[]> selectedLenses() {
        int n = Math.min(Math.max(1, qaJudges), QA_LENSES.size());
        return QA_LENSES.subList(0, n);
    }

    /**
     * QA panel: run {@code --qa-judges} blind judges (distinct lenses, NOT shown the bulk proposal) and
     * {@link #reconcile} their votes against the bulk relation into a two-tier verdict. Each judge is
     * cached by {@code (qa-model|lens, ourIri, upIri, contentSig)}; the judges for a finding run together
     * and the blocking HTTP calls go on the worker pool. The outer merge bounds findings in flight.
     */
    private Uni<Finding> qaPanelUni(Finding f, OurTerm t, UpstreamTerm up) {
        if (t == null || up == null) return Uni.createFrom().item(f);
        boolean cli = "claude-cli".equalsIgnoreCase(qaProvider);
        String sig = contentSig(t, up);
        List<Uni<Verdict>> judges = new ArrayList<>();
        for (String[] lens : selectedLenses()) {
            String lensId = lens[0], lensText = lens[1];
            String modelTag = (cli ? qaCliModel : qaModelName) + "|" + lensId;
            Verdict cached = verdicts.get(modelTag, f.ourIri(), f.upstreamIri(), sig);
            if (cached != null) {
                judges.add(Uni.createFrom().item(cached));
                continue;
            }
            Uni<Verdict> raw = cli
                    ? claudeCli.runAsync(QA_BLIND_SYSTEM, qaBlindUserPrompt(lensText, t, up), qaCliModel, 300)
                    : Uni.createFrom().item((Supplier<Verdict>) () -> qaGrader.judgeBlind(
                                    lensText, t.prefixedId(), t.type().label(), nz(t.label()), nz(t.comment()),
                                    nz(t.domain()), nz(t.range()), up.vocabId(), up.iri(), up.type().label(),
                                    nz(up.label()), nz(up.comment())))
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
    record Recon(String tier, Verdict.Relation relation, double confidence, String rationale, String predicate) {
    }

    /**
     * Reconcile a panel of blind votes against the bulk relation into a two-tier verdict:
     * STRONG (strict majority equals the bulk relation → write that relation), WEAK (majority is a
     * different non-NONE relation → existence agreed but not the grade → write skos:closeMatch),
     * REJECT (majority NONE), SPLIT (no strict majority → leave for review). Pure for unit testing.
     */
    static Recon reconcile(Verdict.Relation bulk, List<Verdict> votes) {
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

    /** Blind QA-judge instructions for the claude-cli path (mirrors {@link QaGrader#judgeBlind}). */
    private static final String QA_BLIND_SYSTEM = """
            You are a senior reviewer aligning terms from a Digital Product Passport ontology to an
            upstream vocabulary. Decide the single best graded-SKOS relation between OUR term and ONE
            upstream term, judged from OUR term's perspective: EXACT (interchangeable), CLOSE
            (overlapping not identical), BROAD (ours is broader), NARROW (ours is narrower), NONE (not
            the same concept). Judge meaning not name similarity; a class matches only a class, a
            property only a property; when uncertain between two grades choose the weaker, and when
            uncertain it is a match at all return NONE.
            Respond with ONLY a JSON object, no prose:
            {"relation":"EXACT|CLOSE|BROAD|NARROW|NONE","confidence":0.0,"rationale":"one sentence"}
            """;

    /** Blind user prompt for a panel judge: the lens directive + the two terms, with NO bulk proposal. */
    private String qaBlindUserPrompt(String lens, OurTerm t, UpstreamTerm up) {
        return """
                %s

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
                """.formatted(lens,
                t.prefixedId(), t.type().label(), nz(t.label()), nz(t.comment()),
                nz(t.domain()), nz(t.range()),
                up.vocabId(), up.iri(), up.type().label(), nz(up.label()), nz(up.comment()));
    }

    /** Stable finding key: (our IRI, upstream IRI). Matches the prior-report join key. */
    private static String key(Finding f) {
        return f.ourIri() + "\t" + f.upstreamIri();
    }

    /** Read a prior report's findings into a key→node map for the targeted re-judge carry-over. */
    private Map<String, JsonNode> loadPriorQa(Path reportJson) {
        if (!Files.isReadable(reportJson)) {
            throw new IllegalArgumentException("--qa-rejudge-from: cannot read " + reportJson);
        }
        try {
            JsonNode root = mapper.readTree(reportJson.toFile());
            JsonNode arr = root.isArray() ? root : root.path("findings");
            Map<String, JsonNode> m = new LinkedHashMap<>();
            for (JsonNode f : arr) {
                m.put(f.path("ourIri").asText() + "\t" + f.path("upstreamIri").asText(), f);
            }
            return m;
        } catch (java.io.IOException e) {
            throw new IllegalArgumentException("--qa-rejudge-from: " + e.getMessage(), e);
        }
    }

    /** Reconstruct a carried-over finding's QA fields from its prior-report node (no model call). */
    private Finding applyPriorQa(Finding f, JsonNode p) {
        Verdict.Relation rel = relOf(p.path("qaRelation").asText(null));
        double conf = p.path("qaConfidence").asDouble(0);
        String rat = p.path("qaRationale").asText(null);
        String tier = p.path("qaTier").asText(null);
        String pred = p.hasNonNull("proposedPredicate") ? p.path("proposedPredicate").asText() : null;
        return f.withQaPanel(rel, conf, rat, tier, pred);
    }

    private static Verdict.Relation relOf(String s) {
        if (s == null || s.isBlank()) return Verdict.Relation.NONE;
        try {
            return Verdict.Relation.valueOf(s);
        } catch (IllegalArgumentException e) {
            return Verdict.Relation.NONE;
        }
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
        String sig = contentSig(t, up);
        Verdict cached = verdicts.get(t.iri(), up.iri(), sig);
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
                .onItem().invoke(v -> verdicts.put(t.iri(), up.iri(), sig, v))
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

    /**
     * Fingerprint of everything the grader sees for a pair except the IRIs (which are already in the
     * cache key). Folding this into the verdict key means an upstream definition/label/domain edit
     * that keeps the same IRI invalidates the cached verdict, so a re-run re-grades only moved pairs.
     */
    private static String contentSig(OurTerm t, UpstreamTerm up) {
        String raw = String.join("\u0001",
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
