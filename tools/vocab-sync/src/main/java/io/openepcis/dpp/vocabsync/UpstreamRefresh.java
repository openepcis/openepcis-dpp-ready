package io.openepcis.dpp.vocabsync;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openepcis.dpp.vocabsync.model.TermType;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import org.apache.jena.vocabulary.RDFS;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeSet;

/**
 * Pulls the refreshable upstream vocabularies from their canonical URLs and diffs each against the
 * cached copy (added / removed / changed terms, by IRI and a label+definition signature). Shared by
 * the {@code fetch --all} command and the {@code sync} loop so both decide "did upstream move?" the
 * same way. Sources with no configured URL are skipped (their URLs vary by host and are set per
 * environment). Term content is read with Jena, mirroring {@code FetchCommand}'s single-file diff.
 */
@ApplicationScoped
public class UpstreamRefresh {

    /** Bound on concurrent source downloads — a handful of small files from distinct hosts. */
    private static final int REFRESH_CONCURRENCY = 4;

    // One reused client, pinned to HTTP/1.1 (LM Studio aside, some vocab CDNs also mishandle the JDK
    // client's HTTP/2 upgrade; 1.1 is what curl/the benchmark use reliably).
    // Follow redirects including scheme downgrades (the JDK client defaults to NEVER; the SEMICeu /
    // data.europa.eu PURLs bounce through http⇄https hops that NORMAL refuses but curl -L follows).
    // These are public, read-only vocabulary fetches, so following downgrades is acceptable here.
    private final HttpClient http = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1).followRedirects(HttpClient.Redirect.ALWAYS)
            .connectTimeout(Duration.ofSeconds(30)).build();

    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;

    @ConfigProperty(name = "vocab-sync.cache.gs1") String gs1Cache;
    @ConfigProperty(name = "vocab-sync.cache.schemaorg") String schemaorgCache;
    @ConfigProperty(name = "vocab-sync.semic-dir") String semicDir;

    @ConfigProperty(name = "vocab-sync.source.gs1.url") java.util.Optional<String> gs1Url;
    @ConfigProperty(name = "vocab-sync.source.schemaorg.url") java.util.Optional<String> schemaorgUrl;
    @ConfigProperty(name = "vocab-sync.source.semic-m8g.url") java.util.Optional<String> semicM8gUrl;
    @ConfigProperty(name = "vocab-sync.source.semic-adms.url") java.util.Optional<String> semicAdmsUrl;
    @ConfigProperty(name = "vocab-sync.source.semic-locn.url") java.util.Optional<String> semicLocnUrl;

    /** One vocabulary's source: a logical name, its canonical URL, and the cached file (repo-relative). */
    public record Source(String name, String url, String cachedRel) {
    }

    /** Diff of one source against its cache. {@code error} non-null means the refresh failed for it. */
    public record SourceDelta(String name, String url, String cachedRel, int oldCount, int newCount,
                              List<String> added, List<String> removed, List<String> changed,
                              boolean saved, String error) {
        public int moved() {
            return error == null ? added.size() + removed.size() + changed.size() : 0;
        }
    }

    public record RefreshResult(List<SourceDelta> sources) {
        public boolean moved() {
            return sources.stream().anyMatch(s -> s.moved() > 0);
        }
    }

    /** The configured sources, in a stable order; entries with a blank URL are still listed (skipped). */
    public List<Source> sources() {
        return List.of(
                new Source("gs1", url(gs1Url), gs1Cache),
                new Source("schemaorg", url(schemaorgUrl), schemaorgCache),
                new Source("semic-m8g", url(semicM8gUrl), semicDir + "/semic-m8g.jsonld"),
                new Source("semic-adms", url(semicAdmsUrl), semicDir + "/semic-adms.jsonld"),
                new Source("semic-locn", url(semicLocnUrl), semicDir + "/semic-locn.jsonld"));
    }

    private static String url(java.util.Optional<String> o) {
        return o.map(String::trim).filter(s -> !s.isEmpty()).orElse(null);
    }

    /**
     * Download + diff every configured source concurrently; when {@code save}, overwrite the cache on
     * success. Each source is an independent network+parse unit, so they fan out reactively with a
     * bounded {@code merge} (mirroring the audit grading pipeline); the blocking download+Jena parse
     * runs on the worker pool, off the caller's thread. The caller awaits the assembled result.
     */
    public RefreshResult refreshAll(boolean save) {
        Path root = Path.of(repoRoot).normalize();
        List<Source> active = new ArrayList<>();
        for (Source s : sources()) {
            if (s.url() == null || s.url().isBlank()) {
                System.err.println("refresh: " + s.name() + " — no source URL configured, skipping");
            } else {
                active.add(s);
            }
        }
        if (active.isEmpty()) return new RefreshResult(List.of());

        // Force Jena's lazy init before the parallel fan-out so concurrent first-time loadModel calls
        // (when this runs standalone, e.g. `fetch --all` with no prior index load) can't race it.
        org.apache.jena.sys.JenaSystem.init();

        List<SourceDelta> deltas = Multi.createFrom().iterable(active)
                .onItem().transformToUni(s -> Uni.createFrom().item(() -> diffOne(root, s, save))
                        .runSubscriptionOn(Infrastructure.getDefaultWorkerPool()))
                .merge(REFRESH_CONCURRENCY)
                .collect().asList()
                .await().indefinitely();

        // merge() emits in completion order; restore the configured order for deterministic output.
        List<String> order = active.stream().map(Source::name).toList();
        deltas.sort(Comparator.comparingInt(d -> order.indexOf(d.name())));
        return new RefreshResult(deltas);
    }

    private SourceDelta diffOne(Path root, Source s, boolean save) {
        Path cached = root.resolve(s.cachedRel()).normalize();
        Path fresh = null;
        try {
            fresh = download(s.url());
            Map<String, String> newSig = signatures(fresh);
            Map<String, String> oldSig = Files.isReadable(cached) ? signatures(cached) : Map.of();

            var added = new TreeSet<>(newSig.keySet());
            added.removeAll(oldSig.keySet());
            var removed = new TreeSet<>(oldSig.keySet());
            removed.removeAll(newSig.keySet());
            var changed = new TreeSet<String>();
            for (String iri : newSig.keySet()) {
                if (oldSig.containsKey(iri) && !Objects.equals(oldSig.get(iri), newSig.get(iri))) {
                    changed.add(iri);
                }
            }
            boolean saved = false;
            if (save && (!added.isEmpty() || !removed.isEmpty() || !changed.isEmpty() || oldSig.isEmpty())) {
                saveToCache(fresh, cached);
                saved = true;
            }
            return new SourceDelta(s.name(), s.url(), s.cachedRel(), oldSig.size(), newSig.size(),
                    new ArrayList<>(added), new ArrayList<>(removed), new ArrayList<>(changed), saved, null);
        } catch (Exception e) {
            System.err.println("refresh: " + s.name() + " failed: " + e.getMessage());
            return new SourceDelta(s.name(), s.url(), s.cachedRel(), 0, 0,
                    List.of(), List.of(), List.of(), false, e.getMessage());
        } finally {
            if (fresh != null) {
                try {
                    Files.deleteIfExists(fresh);
                } catch (IOException ignore) {
                    // best-effort temp cleanup
                }
            }
        }
    }

    /** Write the machine-readable delta the sync loop / CI reads to decide whether to re-audit. */
    public void writeDelta(RefreshResult r, Path out, String stamp) {
        ObjectNode root = mapper.createObjectNode();
        root.put("generated", stamp);
        root.put("moved", r.moved());
        ArrayNode arr = root.putArray("sources");
        for (SourceDelta d : r.sources()) {
            ObjectNode o = arr.addObject();
            o.put("name", d.name());
            o.put("url", d.url());
            o.put("cached", d.cachedRel());
            o.put("oldTerms", d.oldCount());
            o.put("newTerms", d.newCount());
            o.put("added", d.added().size());
            o.put("removed", d.removed().size());
            o.put("changed", d.changed().size());
            o.put("saved", d.saved());
            o.put("error", d.error());
            ArrayNode ai = o.putArray("addedIris");
            d.added().stream().limit(200).forEach(ai::add);
            ArrayNode ci = o.putArray("changedIris");
            d.changed().stream().limit(200).forEach(ci::add);
            ArrayNode ri = o.putArray("removedIris");
            d.removed().stream().limit(200).forEach(ri::add);
        }
        try {
            Files.createDirectories(out.getParent());
            mapper.writerWithDefaultPrettyPrinter().writeValue(out.toFile(), root);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    // ── helpers (mirror FetchCommand's single-file diff) ──────────────────────────────────────────

    /** Term IRI → "label|comment" signature, for class/property terms only. */
    private Map<String, String> signatures(Path file) {
        Model m = RDFDataMgr.loadModel(file.toString());
        Map<String, String> sig = new LinkedHashMap<>();
        ResIterator it = m.listSubjects();
        while (it.hasNext()) {
            Resource r = it.next();
            if (r.isAnon() || r.getURI() == null) continue;
            if (RdfSupport.termType(r) == TermType.OTHER) continue;
            String label = RdfSupport.firstString(r, RDFS.label, RdfSupport.SKOS_PREF_LABEL);
            String comment = RdfSupport.firstString(r, RDFS.comment, RdfSupport.SKOS_DEFINITION);
            sig.put(r.getURI(), (label == null ? "" : label) + "|" + (comment == null ? "" : comment));
        }
        return sig;
    }

    /**
     * Write the fetched file into the cache. If the upstream's format differs from the cache file's
     * extension (e.g. W3C serves ADMS/LOCN as Turtle but the cache is {@code .jsonld}), re-serialize
     * through Jena so the cached file stays valid for its extension — the index loader picks the
     * parser by extension. Matching formats are a plain byte copy.
     */
    private void saveToCache(Path fresh, Path cached) throws IOException {
        Files.createDirectories(cached.getParent());
        String fe = ext(fresh), ce = ext(cached);
        if (fe.equals(ce)) {
            Files.copy(fresh, cached, StandardCopyOption.REPLACE_EXISTING);
            return;
        }
        Model m = RDFDataMgr.loadModel(fresh.toString());
        RDFFormat fmt = ce.equals("jsonld") ? RDFFormat.JSONLD : RDFFormat.TURTLE_PRETTY;
        try (var os = Files.newOutputStream(cached)) {
            RDFDataMgr.write(os, m, fmt);
        }
    }

    private static String ext(Path p) {
        String n = p.getFileName().toString();
        int i = n.lastIndexOf('.');
        return i < 0 ? "" : n.substring(i + 1).toLowerCase(java.util.Locale.ROOT);
    }

    private Path download(String url) throws Exception {
        HttpResponse<byte[]> resp = http.send(
                HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(180)).GET().build(),
                HttpResponse.BodyHandlers.ofByteArray());
        if (resp.statusCode() / 100 != 2) throw new IllegalStateException("HTTP " + resp.statusCode());
        byte[] body = resp.body();
        // Some servers (e.g. schema.org) return gzip regardless of Accept-Encoding; the JDK client
        // does not auto-decompress. Detect the gzip magic (0x1f 0x8b) and inflate.
        if (body.length > 2 && (body[0] & 0xff) == 0x1f && (body[1] & 0xff) == 0x8b) {
            try (var gz = new java.util.zip.GZIPInputStream(new java.io.ByteArrayInputStream(body))) {
                body = gz.readAllBytes();
            }
        }
        String ext = url.endsWith(".jsonld") || url.contains("json") ? ".jsonld" : ".ttl";
        Path tmp = Files.createTempFile("vocab-refresh", ext);
        Files.write(tmp, body);
        return tmp;
    }
}
