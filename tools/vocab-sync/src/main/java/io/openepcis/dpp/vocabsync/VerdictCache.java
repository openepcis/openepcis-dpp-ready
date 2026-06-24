package io.openepcis.dpp.vocabsync;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.model.Verdict;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Disk-backed cache of grader verdicts, keyed by (chat-model, our-IRI, upstream-IRI).
 * Makes audit re-runs reproducible and ~free, and lets a long grading run resume after
 * an interruption. Thread-safe so the grading pass can run concurrently.
 */
@ApplicationScoped
public class VerdictCache {

    @Inject
    ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root")
    String repoRoot;

    @ConfigProperty(name = "vocab-sync.verdicts.cache")
    String cachePath;

    @ConfigProperty(name = "quarkus.langchain4j.openai.chat-model.model-name")
    String chatModelName;

    private Map<String, Verdict> cache;

    public synchronized boolean has(String ourIri, String upIri) {
        ensureLoaded();
        return cache.containsKey(key(chatModelName, ourIri, upIri));
    }

    public synchronized Verdict get(String ourIri, String upIri) {
        ensureLoaded();
        return cache.get(key(chatModelName, ourIri, upIri));
    }

    public synchronized void put(String ourIri, String upIri, Verdict v) {
        ensureLoaded();
        cache.put(key(chatModelName, ourIri, upIri), v);
    }

    /** Variant keyed by an explicit model tag — used by the QA pass (a different model). */
    public synchronized Verdict get(String modelTag, String ourIri, String upIri) {
        ensureLoaded();
        return cache.get(key(modelTag, ourIri, upIri));
    }

    public synchronized void put(String modelTag, String ourIri, String upIri, Verdict v) {
        ensureLoaded();
        cache.put(key(modelTag, ourIri, upIri), v);
    }

    public synchronized void save() {
        if (cache == null) return;
        try {
            Path f = file();
            Files.createDirectories(f.getParent());
            mapper.writerWithDefaultPrettyPrinter().writeValue(f.toFile(), cache);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private String key(String modelTag, String ourIri, String upIri) {
        return modelTag + "\n" + ourIri + "\n" + upIri;
    }

    private Path file() {
        return Path.of(repoRoot).resolve(cachePath).normalize();
    }

    private void ensureLoaded() {
        if (cache != null) return;
        cache = new ConcurrentHashMap<>();
        Path f = file();
        if (Files.isReadable(f)) {
            try {
                Map<String, Verdict> raw = mapper.readValue(f.toFile(),
                        mapper.getTypeFactory().constructMapType(Map.class, String.class, Verdict.class));
                cache.putAll(raw);
                System.err.printf("verdicts: loaded %d cached%n", cache.size());
            } catch (IOException e) {
                System.err.println("verdicts: could not read cache (" + e.getMessage() + "); starting fresh");
            }
        }
    }
}
