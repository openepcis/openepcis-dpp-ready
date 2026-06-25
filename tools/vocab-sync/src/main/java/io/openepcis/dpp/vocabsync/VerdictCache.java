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
 * Disk-backed cache of grader verdicts, keyed by (chat-model, our-IRI, upstream-IRI, content-sig).
 * The content signature is a hash of what the grader actually saw (both terms' label, definition,
 * domain/range, type); folding it into the key means an upstream definition edit that keeps the
 * same IRI <em>invalidates</em> the cached verdict, so a scheduled re-run re-grades exactly the
 * pairs whose content moved instead of serving a stale verdict. Makes re-runs reproducible and
 * ~free for unchanged pairs, and lets a long grading run resume after an interruption. Thread-safe
 * so the grading pass can run concurrently.
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

    public synchronized Verdict get(String ourIri, String upIri, String contentSig) {
        ensureLoaded();
        return cache.get(key(chatModelName, ourIri, upIri, contentSig));
    }

    public synchronized void put(String ourIri, String upIri, String contentSig, Verdict v) {
        ensureLoaded();
        cache.put(key(chatModelName, ourIri, upIri, contentSig), v);
    }

    /** Variant keyed by an explicit model tag — used by the QA pass (a different model). */
    public synchronized Verdict get(String modelTag, String ourIri, String upIri, String contentSig) {
        ensureLoaded();
        return cache.get(key(modelTag, ourIri, upIri, contentSig));
    }

    public synchronized void put(String modelTag, String ourIri, String upIri, String contentSig, Verdict v) {
        ensureLoaded();
        cache.put(key(modelTag, ourIri, upIri, contentSig), v);
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

    private String key(String modelTag, String ourIri, String upIri, String contentSig) {
        return modelTag + "\n" + ourIri + "\n" + upIri + "\n" + (contentSig == null ? "" : contentSig);
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
