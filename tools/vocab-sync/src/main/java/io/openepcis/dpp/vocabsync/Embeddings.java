package io.openepcis.dpp.vocabsync;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Embeds term text via the configured LLM endpoint and caches the vectors on disk so
 * re-runs are ~free. Cache keys are namespaced by embedding-model id, so swapping the
 * model does not mix vector spaces. Vectors are L2-normalised on store, so cosine
 * similarity is a plain dot product.
 */
@ApplicationScoped
public class Embeddings {

    @Inject
    EmbeddingModel model;

    @Inject
    ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root")
    String repoRoot;

    @ConfigProperty(name = "vocab-sync.embeddings.cache")
    String cachePath;

    @ConfigProperty(name = "quarkus.langchain4j.openai.embedding-model.model-name")
    String embedModelName;

    private Map<String, float[]> cache;
    private boolean dirty;

    /** Embed many texts (batched for uncached ones), returning vectors in input order. */
    public List<float[]> embedAll(List<String> texts) {
        ensureLoaded();
        // Collect the distinct uncached texts, embed them in batches, then assemble.
        LinkedHashMap<String, String> uncached = new LinkedHashMap<>(); // key -> text
        for (String t : texts) {
            String k = key(t);
            if (!cache.containsKey(k)) uncached.putIfAbsent(k, t);
        }
        List<Map.Entry<String, String>> todo = new ArrayList<>(uncached.entrySet());
        int batch = 64;
        for (int i = 0; i < todo.size(); i += batch) {
            List<Map.Entry<String, String>> slice = todo.subList(i, Math.min(i + batch, todo.size()));
            List<TextSegment> segs = slice.stream().map(e -> TextSegment.from(e.getValue())).toList();
            List<Embedding> vecs = model.embedAll(segs).content();
            for (int j = 0; j < slice.size(); j++) {
                cache.put(slice.get(j).getKey(), normalise(vecs.get(j).vector()));
            }
            dirty = true;
            System.err.printf("embeddings: %d / %d new vectors%n",
                    Math.min(i + batch, todo.size()), todo.size());
        }
        save();

        List<float[]> out = new ArrayList<>(texts.size());
        for (String t : texts) out.add(cache.get(key(t)));
        return out;
    }

    /** Embed a single text (uses/updates the cache). */
    public float[] embed(String text) {
        return embedAll(List.of(text)).get(0);
    }

    /** Cosine similarity of two L2-normalised vectors (== dot product). */
    public static double cosine(float[] a, float[] b) {
        double dot = 0;
        int n = Math.min(a.length, b.length);
        for (int i = 0; i < n; i++) dot += a[i] * b[i];
        return dot;
    }

    private static float[] normalise(float[] v) {
        double norm = 0;
        for (float x : v) norm += x * x;
        norm = Math.sqrt(norm);
        if (norm == 0) return v;
        float[] out = new float[v.length];
        for (int i = 0; i < v.length; i++) out[i] = (float) (v[i] / norm);
        return out;
    }

    private String key(String text) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(embedModelName.getBytes());
            md.update((byte) 0);
            byte[] h = md.digest(text.getBytes());
            StringBuilder sb = new StringBuilder(h.length * 2);
            for (byte b : h) sb.append(Character.forDigit((b >> 4) & 0xF, 16)).append(Character.forDigit(b & 0xF, 16));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private Path cacheFile() {
        return Path.of(repoRoot).resolve(cachePath).normalize();
    }

    @SuppressWarnings("unchecked")
    private void ensureLoaded() {
        if (cache != null) return;
        cache = new HashMap<>();
        Path f = cacheFile();
        if (Files.isReadable(f)) {
            try {
                Map<String, List<Number>> raw = mapper.readValue(Files.readAllBytes(f), Map.class);
                raw.forEach((k, list) -> {
                    float[] v = new float[list.size()];
                    for (int i = 0; i < list.size(); i++) v[i] = list.get(i).floatValue();
                    cache.put(k, v);
                });
                System.err.printf("embeddings: loaded %d cached vectors%n", cache.size());
            } catch (IOException e) {
                System.err.println("embeddings: could not read cache (" + e.getMessage() + "); starting fresh");
            }
        }
    }

    private void save() {
        if (!dirty) return;
        try {
            Path f = cacheFile();
            Files.createDirectories(f.getParent());
            mapper.writeValue(f.toFile(), cache);
            dirty = false;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
