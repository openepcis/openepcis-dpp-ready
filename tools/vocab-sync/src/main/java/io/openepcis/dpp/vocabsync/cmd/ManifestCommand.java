package io.openepcis.dpp.vocabsync.cmd;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.OurIndex;
import io.openepcis.dpp.vocabsync.UpstreamIndex;
import io.openepcis.dpp.vocabsync.model.UpstreamTerm;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Emits a reproducibility manifest for an alignment run: the models used, the retrieval/grading
 * parameters, and each upstream source's term count, version (where declared) and a content
 * hash. Committed alongside the reports so a run can be reproduced and so upstream drift is
 * detectable (compare hashes against a later run / {@code fetch}).
 */
@CommandLine.Command(
        name = "manifest",
        description = "Write docs/alignment-run-manifest.json: models, parameters, and upstream "
                + "source versions/hashes for reproducibility.")
public class ManifestCommand implements Runnable {

    @Inject UpstreamIndex upstreamIndex;
    @Inject OurIndex ourIndex;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;
    @ConfigProperty(name = "quarkus.langchain4j.openai.chat-model.model-name") String bulkModel;
    @ConfigProperty(name = "quarkus.langchain4j.openai.qa.chat-model.model-name") String qaModel;
    @ConfigProperty(name = "quarkus.langchain4j.openai.embedding-model.model-name") String embedModel;
    @ConfigProperty(name = "vocab-sync.retrieve.top-k") int topK;
    @ConfigProperty(name = "vocab-sync.grade.min-confidence") double minConfidence;

    @CommandLine.Option(names = "--min-qa-confidence", defaultValue = "0.75")
    double minQaConfidence;

    @CommandLine.Option(names = "--qa-model",
            description = "Record the QA model actually used (e.g. qwen/qwen3-32b); "
                    + "defaults to the configured one.")
    String qaModelOverride;

    @CommandLine.Option(names = "--stamp", defaultValue = "unset",
            description = "Run date (Date.now is unavailable to the tool by policy).")
    String stamp;

    @CommandLine.Option(names = "--out", defaultValue = "docs/alignment-run-manifest.json")
    String out;

    @Override
    public void run() {
        List<UpstreamTerm> up = upstreamIndex.all();
        Map<String, Long> counts = new TreeMap<>();
        Map<String, String> versions = new TreeMap<>();
        for (UpstreamTerm t : up) {
            counts.merge(t.vocabId(), 1L, Long::sum);
            if (t.version() != null) versions.putIfAbsent(t.vocabId(), t.version());
        }

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("generated", stamp);
        m.put("tool", "vocab-sync 0.1.0 (Quarkus 3.31.3 / Java 25)");
        m.put("models", Map.of("bulk", bulkModel,
                "qa", qaModelOverride != null ? qaModelOverride : qaModel, "embedding", embedModel));
        m.put("parameters", Map.of("retrieveTopK", topK, "minBulkConfidence", minConfidence,
                "minQaConfidence", minQaConfidence));
        m.put("ourTermCount", ourIndex.load(null).size());
        m.put("upstreamCounts", counts);
        m.put("upstreamVersions", versions);
        m.put("cacheHashes", cacheHashes());

        try {
            Path p = Path.of(repoRoot).resolve(out).normalize();
            Files.createDirectories(p.getParent());
            mapper.writerWithDefaultPrettyPrinter().writeValue(p.toFile(), m);
            System.out.println("manifest: " + p);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** SHA-256 (first 16 hex) of each cached upstream source file, for drift detection. */
    private Map<String, String> cacheHashes() {
        Map<String, String> h = new TreeMap<>();
        Path root = Path.of(repoRoot).normalize();
        for (String rel : List.of(".cache/vocab/gs1-voc.ttl", ".cache/vocab/schemaorg.ttl",
                ".cache/vocab/semic-m8g.jsonld", ".cache/vocab/semic-adms.jsonld",
                ".cache/vocab/semic-locn.jsonld")) {
            Path f = root.resolve(rel);
            if (Files.isReadable(f)) h.put(rel, sha256(f));
        }
        return h;
    }

    private static String sha256(Path f) {
        try {
            byte[] d = MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(f));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 8; i++) sb.append(String.format("%02x", d[i]));
            return sb.toString();
        } catch (Exception e) {
            return "?";
        }
    }
}
