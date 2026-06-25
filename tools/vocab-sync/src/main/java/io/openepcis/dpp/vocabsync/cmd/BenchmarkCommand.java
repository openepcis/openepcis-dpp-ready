package io.openepcis.dpp.vocabsync.cmd;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openepcis.dpp.vocabsync.ClaudeCli;
import io.openepcis.dpp.vocabsync.GraderPrompts;
import jakarta.inject.Inject;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.RDFDataMgr;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * Benchmarks LLMs on graded-SKOS relation classification against a published ground truth
 * (STW ↔ Wikidata mappings). Phases: build a balanced gold set (Jena over the STW thesaurus +
 * the STW→Wikidata concordance, Wikidata labels/descriptions via API); run the model field
 * (each local model over LM Studio's OpenAI API, plus Opus via claude-cli) using the identical
 * production grading prompt ({@link GraderPrompts}); score (per-model accuracy, per-relation
 * P/R/F1, confusion, confidence calibration, latency). Predictions are appended to a JSONL log
 * so the long run is fully resumable. Outputs feed the white paper.
 */
@CommandLine.Command(
        name = "benchmark",
        description = "Benchmark LLMs on graded-SKOS classification vs STW↔Wikidata ground truth.")
public class BenchmarkCommand implements Runnable {

    private static final String SKOS = "http://www.w3.org/2004/02/skos/core#";
    private static final String STW_NS = "http://zbw.eu/stw/descriptor/";
    private static final String WD_NS = "http://www.wikidata.org/entity/";
    private static final List<String> RELATIONS = List.of("EXACT", "CLOSE", "BROAD", "NARROW", "NONE");
    private static final List<String> CONF_BUCKETS =
            List.of("0.0-0.5", "0.5-0.7", "0.7-0.8", "0.8-0.9", "0.9-1.0");
    // SKOS direction: `stwA skos:broadMatch wdB` ⇒ wdB (object) is BROADER than stwA (subject), so
    // from OUR-term (=STW subject) perspective our term is NARROWER → NARROW. Hence the inversion.
    private static final Map<String, String> PRED_TO_REL = Map.of(
            "exactMatch", "EXACT", "closeMatch", "CLOSE", "broadMatch", "NARROW", "narrowMatch", "BROAD");

    @Inject ObjectMapper mapper;
    @Inject ClaudeCli claudeCli;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;
    @ConfigProperty(name = "quarkus.langchain4j.openai.base-url") String baseUrl;
    @ConfigProperty(name = "quarkus.langchain4j.openai.api-key") String apiKey;

    @CommandLine.Option(names = "--bench-dir", defaultValue = "tools/vocab-sync/.cache/bench")
    String benchDir;
    @CommandLine.Option(names = "--out", defaultValue = "docs/bench/skos-grader-benchmark") String out;
    @CommandLine.Option(names = "--per-class", defaultValue = "40",
            description = "Gold examples per relation class (EXACT/CLOSE/BROAD/NARROW/NONE).")
    int perClass;
    @CommandLine.Option(names = "--rebuild-goldset", defaultValue = "false") boolean rebuildGoldset;
    @CommandLine.Option(names = "--models",
            description = "CSV of local model ids; default = discover via /v1/models (minus embeddings).")
    String models;
    @CommandLine.Option(names = "--include-opus", defaultValue = "false") boolean includeOpus;
    @CommandLine.Option(names = "--opus-model", defaultValue = "claude-opus-4-8") String opusModel;
    @CommandLine.Option(names = "--limit", defaultValue = "0", description = "Cap gold examples (smoke).")
    int limit;
    @CommandLine.Option(names = "--skip-run", defaultValue = "false") boolean skipRun;
    @CommandLine.Option(names = "--no-lms-load", defaultValue = "false",
            description = "Skip `lms load` before each model's batch (default: load to make it the active model).")
    boolean skipLmsLoad;
    @CommandLine.Option(names = "--max-tokens", defaultValue = "4096",
            description = "Completion token cap (raise for reasoning models that truncate the JSON).")
    int maxTokens;
    @CommandLine.Option(names = "--tag", defaultValue = "",
            description = "Suffix appended to each model's stored name, so a re-run (e.g. higher --max-tokens) "
                    + "is a distinct leaderboard row instead of colliding with cached predictions.")
    String tag;

    // HTTP/1.1 pinned: LM Studio's OpenAI server stalls on Java's default HTTP/2 upgrade negotiation
    // (curl/urllib default to 1.1 and return in ~1.5s; the h2 client hangs indefinitely on the POST).
    private final HttpClient http = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1).connectTimeout(Duration.ofSeconds(30)).build();

    @Override
    public void run() {
        Path root = Path.of(repoRoot).normalize();
        Path bench = root.resolve(benchDir).normalize();
        Path goldPath = root.resolve(out.replace("skos-grader-benchmark", "skos-grader-goldset") + ".json");
        // goldset lives next to the report basename's dir
        goldPath = root.resolve("docs/bench/skos-grader-goldset.json");
        Path predPath = bench.resolve("predictions.jsonl");

        List<ObjectNode> gold;
        if (rebuildGoldset || !Files.isReadable(goldPath)) {
            gold = buildGoldSet(bench, goldPath);
        } else {
            gold = readGold(goldPath);
            System.err.println("benchmark: loaded gold set " + gold.size() + " examples");
        }
        if (limit > 0 && gold.size() > limit) gold = gold.subList(0, limit);

        if (!skipRun) runField(gold, predPath);
        score(gold, predPath, root);
    }

    // ----------------------------------------------------------------- gold set

    private List<ObjectNode> buildGoldSet(Path bench, Path goldPath) {
        System.err.println("benchmark: building gold set from STW↔Wikidata …");
        Model stw = RDFDataMgr.loadModel(bench.resolve("stw.ttl").toString());
        Model map = RDFDataMgr.loadModel(bench.resolve("stw_wikidata_mapping.ttl").toString());
        Property prefLabel = ResourceFactory.createProperty(SKOS, "prefLabel");
        Property scopeNote = ResourceFactory.createProperty(SKOS, "scopeNote");

        // STW concept → (label@en, scopeNote@en)
        Map<String, String[]> stwTerms = new LinkedHashMap<>();
        ResIterator subs = stw.listSubjects();
        while (subs.hasNext()) {
            Resource r = subs.next();
            if (r.getURI() == null || !r.getURI().startsWith(STW_NS)) continue;
            String label = enLiteral(r, prefLabel);
            if (label == null) continue;
            stwTerms.put(r.getURI(), new String[]{label, enLiteral(r, scopeNote)});
        }

        // mappings: stwURI -> relation -> [wdIRIs]; collect per relation class
        Map<String, List<String[]>> byRel = new LinkedHashMap<>(); // rel -> list of {stwIri, wdIri}
        for (String rel : List.of("exactMatch", "closeMatch", "broadMatch", "narrowMatch")) {
            Property p = ResourceFactory.createProperty(SKOS, rel);
            List<String[]> pairs = new ArrayList<>();
            var it = map.listStatements(null, p, (RDFNode) null);
            while (it.hasNext()) {
                Statement st = it.next();
                if (st.getSubject().getURI() == null || !st.getSubject().getURI().startsWith(STW_NS)) continue;
                if (!st.getObject().isResource() || st.getObject().asResource().getURI() == null) continue;
                String wd = st.getObject().asResource().getURI();
                if (!wd.startsWith(WD_NS)) continue;
                if (!stwTerms.containsKey(st.getSubject().getURI())) continue;
                pairs.add(new String[]{st.getSubject().getURI(), wd});
            }
            byRel.put(PRED_TO_REL.get(rel), pairs);
        }

        // sample balanced per class, preferring STW terms that have a scopeNote (richer context)
        long seed = 42;
        List<ObjectNode> examples = new ArrayList<>();
        Set<String> usedWd = new TreeSet<>();
        Map<String, String> wdNeeded = new LinkedHashMap<>(); // wdIri -> placeholder (labels fetched later)
        for (var e : byRel.entrySet()) {
            List<String[]> pairs = new ArrayList<>(e.getValue());
            pairs.sort((a, b) -> {
                boolean da = stwTerms.get(a[0])[1] != null, db = stwTerms.get(b[0])[1] != null;
                if (da != db) return da ? -1 : 1;
                return Long.compare(stableHash(a[0] + a[1], seed), stableHash(b[0] + b[1], seed));
            });
            int n = 0;
            for (String[] pr : pairs) {
                if (n >= perClass) break;
                examples.add(example(e.getKey(), pr[0], stwTerms.get(pr[0]), pr[1]));
                wdNeeded.put(pr[1], "");
                usedWd.add(pr[1]);
                n++;
            }
        }
        // NONE negatives: STW term paired with a Wikidata item that is NOT its mapping (random from pool)
        List<String> wdPool = new ArrayList<>(usedWd);
        List<String> stwList = new ArrayList<>(stwTerms.keySet());
        for (int i = 0; i < perClass; i++) {
            String s = stwList.get((int) (Math.floorMod(stableHash("neg-s-" + i, seed), stwList.size())));
            String w = wdPool.get((int) (Math.floorMod(stableHash("neg-w-" + i, seed), wdPool.size())));
            examples.add(example("NONE", s, stwTerms.get(s), w));
            wdNeeded.put(w, "");
        }

        // fetch Wikidata labels + descriptions (batch 50, UA required)
        Map<String, String[]> wd = fetchWikidata(wdNeeded.keySet());
        for (ObjectNode ex : examples) {
            String[] ld = wd.getOrDefault(ex.get("targetIri").asText(), new String[]{null, null});
            ex.put("targetLabel", ld[0] == null ? qid(ex.get("targetIri").asText()) : ld[0]);
            ex.put("targetDef", ld[1]);
        }
        // drop examples whose target has no label at all (rare)
        examples.removeIf(ex -> ex.get("targetLabel").asText().isBlank());
        Collections.shuffle(examples, new java.util.Random(seed));

        write(goldPath, examples);
        Map<String, Long> dist = new TreeMap<>();
        examples.forEach(ex -> dist.merge(ex.get("gold").asText(), 1L, Long::sum));
        System.err.println("benchmark: gold set " + examples.size() + " examples " + dist + " → " + goldPath);
        return examples;
    }

    private ObjectNode example(String rel, String stwIri, String[] ld, String wdIri) {
        ObjectNode o = mapper.createObjectNode();
        o.put("id", qid(stwIri) + "~" + qid(wdIri) + "~" + rel);
        o.put("gold", rel);
        o.put("sourceIri", stwIri);
        o.put("sourceLabel", ld[0]);
        o.put("sourceDef", ld[1]);
        o.put("targetIri", wdIri);
        return o;
    }

    private Map<String, String[]> fetchWikidata(Set<String> iris) {
        List<String> qids = new ArrayList<>();
        for (String iri : iris) qids.add(qid(iri));
        Map<String, String[]> out = new LinkedHashMap<>();
        for (int i = 0; i < qids.size(); i += 50) {
            List<String> batch = qids.subList(i, Math.min(i + 50, qids.size()));
            // '|' is illegal in a java.net.URI → encode as %7C (curl tolerates raw, URI.create does not).
            String url = "https://www.wikidata.org/w/api.php?action=wbgetentities"
                    + "&props=labels%7Cdescriptions&languages=en&format=json&ids="
                    + String.join("%7C", batch);
            try {
                HttpResponse<String> resp = http.send(HttpRequest.newBuilder(URI.create(url))
                        .header("User-Agent", "openepcis-vocab-sync-benchmark/0.1 (research)")
                        .timeout(Duration.ofSeconds(60)).GET().build(), HttpResponse.BodyHandlers.ofString());
                JsonNode ents = mapper.readTree(resp.body()).path("entities");
                ents.fields().forEachRemaining(en -> {
                    JsonNode v = en.getValue();
                    String label = v.path("labels").path("en").path("value").asText(null);
                    String desc = v.path("descriptions").path("en").path("value").asText(null);
                    out.put(WD_NS + en.getKey(), new String[]{label, desc});
                });
                System.err.printf("  wikidata: %d / %d%n", Math.min(i + 50, qids.size()), qids.size());
            } catch (Exception ex) {
                System.err.println("  wikidata batch failed: " + ex.getMessage());
            }
        }
        return out;
    }

    // ----------------------------------------------------------------- run

    private void runField(List<ObjectNode> gold, Path predPath) {
        List<String> field = resolveField();
        System.err.println("benchmark: field = " + field + (includeOpus ? " + opus:" + opusModel : ""));
        Set<String> done = loadDone(predPath);
        try {
            Files.createDirectories(predPath.getParent());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        for (String model : field) {
            boolean opus = model.equals("OPUS");
            String stored = (opus ? opusModel : model) + tag; // tag -> distinct leaderboard row
            String label = (opus ? opusModel + " (claude-cli)" : model) + (tag.isEmpty() ? "" : " " + tag);
            long todo = gold.stream().filter(g -> !done.contains(stored + " " + g.get("id").asText())).count();
            if (todo == 0) { System.err.println("benchmark: " + label + " — all cached, skip"); continue; }
            if (!opus && !skipLmsLoad) lmsLoad(model);
            System.err.printf("benchmark: %s — %d/%d to grade%n", label, todo, gold.size());
            int n = 0;
            for (ObjectNode g : gold) {
                String key = stored + " " + g.get("id").asText();
                if (done.contains(key)) continue;
                String user = GraderPrompts.fillUser(g.get("sourceLabel").asText(), "concept",
                        g.get("sourceLabel").asText(), txt(g, "sourceDef"), "(none)", "(none)",
                        "Wikidata", g.get("targetIri").asText(), "concept",
                        g.get("targetLabel").asText(), txt(g, "targetDef"));
                long t0 = System.nanoTime();
                String[] pv;
                try {
                    pv = opus ? viaOpus(user) : viaLmStudio(model, user);
                } catch (Exception e) {
                    pv = new String[]{"PARSEFAIL", "0", "error: " + e.getMessage(), ""};
                }
                long ms = (System.nanoTime() - t0) / 1_000_000;
                ObjectNode p = mapper.createObjectNode();
                p.put("model", stored);
                p.put("id", g.get("id").asText());
                p.put("gold", g.get("gold").asText());
                p.put("predicted", pv[0]);
                p.put("confidence", safeD(pv[1]));
                p.put("rationale", pv[2]);
                p.put("latencyMs", ms);
                p.put("parseOk", !pv[0].equals("PARSEFAIL"));
                // raw reply kept on every row (capped) so the log can be re-scored offline if the parser
                // improves, without re-running the model — the predictions are deterministic at temp 0.
                if (pv.length > 3 && pv[3] != null && !pv[3].isEmpty()) {
                    p.put("rawReply", pv[3].length() > 4000 ? pv[3].substring(0, 4000) : pv[3]);
                }
                appendLine(predPath, p);
                done.add(key);
                if (++n % 20 == 0) System.err.printf("  %s %d/%d%n", label, n, todo);
            }
        }
    }

    private List<String> resolveField() {
        List<String> field = new ArrayList<>();
        if (models != null && !models.isBlank()) {
            for (String m : models.split(",")) field.add(m.trim());
        } else {
            try {
                HttpResponse<String> r = http.send(HttpRequest.newBuilder(
                        URI.create(baseUrl.replaceAll("/$", "") + "/models")).GET().build(),
                        HttpResponse.BodyHandlers.ofString());
                for (JsonNode m : mapper.readTree(r.body()).path("data")) {
                    String id = m.path("id").asText();
                    if (!id.toLowerCase(Locale.ROOT).contains("embed")) field.add(id);
                }
            } catch (Exception e) {
                System.err.println("benchmark: /v1/models discovery failed: " + e.getMessage());
            }
        }
        if (includeOpus) field.add("OPUS");
        return field;
    }

    private void lmsLoad(String model) {
        String lms = System.getProperty("user.home") + "/.lmstudio/bin/lms";
        // Unload everything first so exactly one model is resident — the field includes a 122B MoE
        // and other large models that would otherwise accumulate and thrash a 128 GB box.
        runLms(lms, 120, "unload", "--all");
        try {
            System.err.println("  lms load " + model + " …");
            Process p = new ProcessBuilder(lms, "load", model, "-y").redirectErrorStream(true).start();
            p.getInputStream().readAllBytes();
            p.waitFor(600, java.util.concurrent.TimeUnit.SECONDS);
        } catch (Exception e) {
            System.err.println("  lms load failed (will rely on JIT): " + e.getMessage());
        }
    }

    private void runLms(String lms, int timeoutSec, String... args) {
        try {
            List<String> cmd = new ArrayList<>();
            cmd.add(lms);
            Collections.addAll(cmd, args);
            Process p = new ProcessBuilder(cmd).redirectErrorStream(true).start();
            p.getInputStream().readAllBytes();
            p.waitFor(timeoutSec, java.util.concurrent.TimeUnit.SECONDS);
        } catch (Exception ignore) {
        }
    }

    private String[] viaLmStudio(String model, String user) throws Exception {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("temperature", 0);
        body.put("max_tokens", maxTokens);
        ArrayNode msgs = body.putArray("messages");
        ((ObjectNode) msgs.addObject()).put("role", "system").put("content", GraderPrompts.SYSTEM);
        ((ObjectNode) msgs.addObject()).put("role", "user").put("content", user + GraderPrompts.JSON_INSTRUCTION);
        HttpResponse<String> resp = http.send(HttpRequest.newBuilder(
                        URI.create(baseUrl.replaceAll("/$", "") + "/chat/completions"))
                        .header("Authorization", "Bearer " + apiKey).header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(900))
                        .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body))).build(),
                HttpResponse.BodyHandlers.ofString());
        String content = mapper.readTree(resp.body()).path("choices").path(0).path("message")
                .path("content").asText("");
        return parseVerdict(content);
    }

    private String[] viaOpus(String user) {
        var v = claudeCli.runAsync(GraderPrompts.SYSTEM, user + GraderPrompts.JSON_INSTRUCTION, opusModel, 300)
                .await().indefinitely();
        return new String[]{v.relation().name(), String.valueOf(v.confidence()), v.rationale(), ""};
    }

    private static final java.util.regex.Pattern RELATION_RX = java.util.regex.Pattern.compile(
            "\"relation\"\\s*:\\s*\"(EXACT|CLOSE|BROAD|NARROW|NONE)\"", java.util.regex.Pattern.CASE_INSENSITIVE);

    /** Robustly extract [relation, conf, rationale, rawReply] from a model reply. Strips Harmony channels
     *  and {@code <think>} chains, then enumerates every balanced {@code {…}} object and tries each from the
     *  LAST backward (models often emit a malformed draft then a clean final / fenced copy). Falls back to a
     *  regex over the relation field so a verdict with only an unescaped quote in its rationale is still
     *  recovered rather than scored as a parse failure. */
    private String[] parseVerdict(String text) {
        if (text == null) return new String[]{"PARSEFAIL", "0", "", ""};
        String raw = text;
        int msg = text.lastIndexOf("<|message|>");
        if (msg >= 0) text = text.substring(msg + "<|message|>".length());
        int think = text.lastIndexOf("</think>");
        if (think >= 0) text = text.substring(think + 8);
        text = text.replaceAll("<\\|[^|]*\\|>", " ");
        // 1) try each balanced JSON object, last first (the final/fenced copy is usually the clean one).
        List<String> objs = balancedObjects(text);
        for (int i = objs.size() - 1; i >= 0; i--) {
            try {
                JsonNode v = mapper.readTree(objs.get(i));
                if (!v.has("relation")) continue;
                String rel = v.path("relation").asText("").trim().toUpperCase(Locale.ROOT);
                if (!RELATIONS.contains(rel)) continue;
                return new String[]{rel, String.valueOf(v.path("confidence").asDouble(0)),
                        v.path("rationale").asText(""), raw};
            } catch (Exception ignore) {
                // try the next-earlier object
            }
        }
        // 2) regex fallback: the relation token is present but the surrounding JSON is malformed
        //    (e.g. unescaped quotes inside the rationale). Recover the relation; rationale best-effort.
        var rm = RELATION_RX.matcher(text);
        if (rm.find()) {
            String rel = rm.group(1).toUpperCase(Locale.ROOT);
            double conf = 0;
            var cm = java.util.regex.Pattern.compile("\"confidence\"\\s*:\\s*([0-9.]+)").matcher(text);
            if (cm.find()) conf = safeD(cm.group(1));
            return new String[]{rel, String.valueOf(conf), "(recovered)", raw};
        }
        return new String[]{"PARSEFAIL", "0", text.strip(), raw};
    }

    /** All top-level balanced {@code {…}} substrings, in order of appearance. */
    private static List<String> balancedObjects(String text) {
        List<String> out = new ArrayList<>();
        int depth = 0, start = -1;
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '{') {
                if (depth == 0) start = i;
                depth++;
            } else if (c == '}' && depth > 0) {
                if (--depth == 0 && start >= 0) out.add(text.substring(start, i + 1));
            }
        }
        return out;
    }

    // ----------------------------------------------------------------- score

    private void score(List<ObjectNode> gold, Path predPath, Path root) {
        Map<String, String> goldById = new LinkedHashMap<>();
        gold.forEach(g -> goldById.put(g.get("id").asText(), g.get("gold").asText()));
        // model -> list of [gold, predicted, conf, latency, parseOk]
        Map<String, List<String[]>> byModel = new LinkedHashMap<>();
        if (Files.isReadable(predPath)) {
            try {
                for (String line : Files.readAllLines(predPath)) {
                    if (line.isBlank()) continue;
                    JsonNode p = mapper.readTree(line);
                    String id = p.path("id").asText();
                    if (!goldById.containsKey(id)) continue;
                    byModel.computeIfAbsent(p.path("model").asText(), k -> new ArrayList<>())
                            .add(new String[]{goldById.get(id), p.path("predicted").asText(),
                                    String.valueOf(p.path("confidence").asDouble()),
                                    String.valueOf(p.path("latencyMs").asLong()),
                                    String.valueOf(p.path("parseOk").asBoolean())});
                }
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        }
        ObjectNode report = mapper.createObjectNode();
        report.put("dataset", "STW↔Wikidata (published skos:*Match), graded SKOS classification");
        report.put("goldSize", gold.size());
        ArrayNode board = report.putArray("models");
        List<ObjectNode> rows = new ArrayList<>();
        for (var e : byModel.entrySet()) {
            rows.add(modelMetrics(e.getKey(), e.getValue()));
        }
        rows.sort((a, b) -> Double.compare(b.get("exactAccuracy").asDouble(), a.get("exactAccuracy").asDouble()));
        rows.forEach(board::add);

        writeJson(root.resolve(out + ".json"), report);
        writeManifest(root.resolve("docs/bench/benchmark-manifest.json"), gold.size(), byModel.keySet());
        writeMarkdown(root.resolve(out + ".md"), rows, gold.size());
        System.out.printf("%nbenchmark scored: %d models → %s.{md,json}%n", rows.size(), root.resolve(out));
    }

    private ObjectNode modelMetrics(String model, List<String[]> preds) {
        int n = preds.size();
        int exactCorrect = 0, binaryCorrect = 0, parseFail = 0;
        long latSum = 0;
        // confusion[gold][pred]
        Map<String, Map<String, Integer>> conf = new TreeMap<>();
        Map<String, int[]> prf = new TreeMap<>(); // rel -> {tp, fp, fn}
        for (String r : RELATIONS) prf.put(r, new int[3]);
        // calibration: confidence bucket -> {n, exactCorrect, asserted (pred!=NONE), assertedCorrect}
        Map<String, int[]> calib = new LinkedHashMap<>();
        for (String b : CONF_BUCKETS) calib.put(b, new int[4]);
        for (String[] p : preds) {
            String g = p[0], pr = p[1];
            latSum += Long.parseLong(p[3]);
            if (pr.equals("PARSEFAIL")) parseFail++;
            boolean exact = g.equals(pr);
            if (exact) exactCorrect++;
            boolean gMatch = !g.equals("NONE"), pMatch = !pr.equals("NONE") && !pr.equals("PARSEFAIL");
            if (gMatch == pMatch) binaryCorrect++;
            conf.computeIfAbsent(g, k -> new TreeMap<>()).merge(pr, 1, Integer::sum);
            if (prf.containsKey(pr)) {
                if (exact) prf.get(pr)[0]++; else prf.get(pr)[1]++;
            }
            if (prf.containsKey(g) && !exact) prf.get(g)[2]++;
            if (!pr.equals("PARSEFAIL")) {
                int[] c = calib.get(confBucket(safeD(p[2])));
                c[0]++;
                if (exact) c[1]++;
                if (pMatch) { c[2]++; if (exact) c[3]++; }
            }
        }
        ObjectNode m = mapper.createObjectNode();
        m.put("model", model);
        m.put("n", n);
        m.put("exactAccuracy", round(exactCorrect / (double) n));
        m.put("binaryAccuracy", round(binaryCorrect / (double) n));
        m.put("parseFailRate", round(parseFail / (double) n));
        m.put("meanLatencyMs", n == 0 ? 0 : latSum / n);
        double macroF1 = 0; int classes = 0;
        ObjectNode perRel = m.putObject("perRelationF1");
        for (String r : RELATIONS) {
            int tp = prf.get(r)[0], fp = prf.get(r)[1], fn = prf.get(r)[2];
            double prec = tp + fp == 0 ? 0 : tp / (double) (tp + fp);
            double rec = tp + fn == 0 ? 0 : tp / (double) (tp + fn);
            double f1 = prec + rec == 0 ? 0 : 2 * prec * rec / (prec + rec);
            perRel.put(r, round(f1));
            if (tp + fn > 0) { macroF1 += f1; classes++; }
        }
        m.put("macroF1", round(classes == 0 ? 0 : macroF1 / classes));
        ObjectNode cm = m.putObject("confusion");
        conf.forEach((g, row) -> {
            ObjectNode rn = cm.putObject(g);
            row.forEach(rn::put);
        });
        // calibration: per confidence bucket, exact accuracy overall and among asserted (pred!=NONE) relations
        ObjectNode cal = m.putObject("calibration");
        calib.forEach((b, c) -> {
            if (c[0] == 0) return;
            ObjectNode bn = cal.putObject(b);
            bn.put("n", c[0]);
            bn.put("exactAccuracy", round(c[1] / (double) c[0]));
            bn.put("asserted", c[2]);
            bn.put("assertedExactAccuracy", c[2] == 0 ? 0 : round(c[3] / (double) c[2]));
        });
        return m;
    }

    private void writeMarkdown(Path p, List<ObjectNode> rows, int goldSize) {
        StringBuilder sb = new StringBuilder();
        sb.append("# SKOS grader benchmark — leaderboard\n\n");
        sb.append("Task: graded-SKOS relation classification (EXACT/CLOSE/BROAD/NARROW/NONE) against ")
                .append(goldSize).append(" STW↔Wikidata gold pairs, identical production prompt, temperature 0.\n\n");
        sb.append("| Model | exact-acc | match/no-match | macroF1 | parse-fail | mean ms |\n");
        sb.append("|---|--:|--:|--:|--:|--:|\n");
        for (ObjectNode m : rows) {
            sb.append("| ").append(m.get("model").asText()).append(" | ")
                    .append(pct(m.get("exactAccuracy").asDouble())).append(" | ")
                    .append(pct(m.get("binaryAccuracy").asDouble())).append(" | ")
                    .append(String.format(Locale.ROOT, "%.2f", m.get("macroF1").asDouble())).append(" | ")
                    .append(pct(m.get("parseFailRate").asDouble())).append(" | ")
                    .append(m.get("meanLatencyMs").asLong()).append(" |\n");
        }
        sb.append("\nFull per-relation F1, confusion matrices, and calibration are in the JSON; the AI "
                + "pipeline doc (`tools/vocab-sync/docs/AI_PIPELINE.md`) interprets these.\n");
        write(p, sb.toString());
    }

    private void writeManifest(Path p, int goldSize, Set<String> models) {
        ObjectNode m = mapper.createObjectNode();
        m.put("benchmark", "skos-grader STW↔Wikidata");
        m.put("goldSize", goldSize);
        m.put("perClass", perClass);
        m.put("prompt", "GraderPrompts (production-identical) + strict-JSON instruction");
        m.put("temperature", 0);
        m.put("hardware", "Apple M5 Max, 128 GB");
        m.put("baseUrl", baseUrl);
        ArrayNode ms = m.putArray("modelsRun");
        new TreeSet<>(models).forEach(ms::add);
        writeJson(p, m);
    }

    // ----------------------------------------------------------------- io/util

    private List<ObjectNode> readGold(Path p) {
        try {
            List<ObjectNode> out = new ArrayList<>();
            for (JsonNode n : mapper.readTree(p.toFile())) out.add((ObjectNode) n);
            return out;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private Set<String> loadDone(Path predPath) {
        Set<String> done = new java.util.HashSet<>();
        if (!Files.isReadable(predPath)) return done;
        try {
            for (String line : Files.readAllLines(predPath)) {
                if (line.isBlank()) continue;
                JsonNode p = mapper.readTree(line);
                done.add(p.path("model").asText() + " " + p.path("id").asText());
            }
        } catch (IOException ignore) {
        }
        return done;
    }

    private void appendLine(Path p, ObjectNode node) {
        try {
            Files.writeString(p, mapper.writeValueAsString(node) + "\n",
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private void write(Path p, String content) {
        try {
            Files.createDirectories(p.getParent());
            Files.writeString(p, content);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private void write(Path p, List<ObjectNode> examples) {
        ArrayNode a = mapper.createArrayNode();
        examples.forEach(a::add);
        writeJson(p, a);
    }

    private void writeJson(Path p, JsonNode node) {
        try {
            Files.createDirectories(p.getParent());
            mapper.writerWithDefaultPrettyPrinter().writeValue(p.toFile(), node);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static String enLiteral(Resource r, Property p) {
        var it = r.listProperties(p);
        String fallback = null;
        while (it.hasNext()) {
            RDFNode o = it.next().getObject();
            if (!o.isLiteral()) continue;
            String lang = o.asLiteral().getLanguage();
            if (lang != null && lang.startsWith("en")) return o.asLiteral().getString().trim();
            if (fallback == null) fallback = o.asLiteral().getString().trim();
        }
        return fallback;
    }

    private static String qid(String iri) {
        int i = Math.max(iri.lastIndexOf('/'), iri.lastIndexOf('#'));
        return i >= 0 ? iri.substring(i + 1) : iri;
    }

    private static String txt(JsonNode o, String f) {
        JsonNode v = o.get(f);
        return v == null || v.isNull() ? "(none)" : v.asText();
    }

    private static String confBucket(double c) {
        return c < 0.5 ? "0.0-0.5" : c < 0.7 ? "0.5-0.7" : c < 0.8 ? "0.7-0.8" : c < 0.9 ? "0.8-0.9" : "0.9-1.0";
    }

    private static double safeD(String s) {
        try { return Double.parseDouble(s); } catch (Exception e) { return 0; }
    }

    private static double round(double d) {
        return Math.round(d * 1000) / 1000.0;
    }

    private static String pct(double d) {
        return String.format(Locale.ROOT, "%.1f%%", d * 100);
    }

    private static long stableHash(String s, long seed) {
        long h = seed;
        for (int i = 0; i < s.length(); i++) h = h * 1099511628211L ^ s.charAt(i);
        return h;
    }
}
