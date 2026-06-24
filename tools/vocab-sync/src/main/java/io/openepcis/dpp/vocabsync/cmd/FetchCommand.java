package io.openepcis.dpp.vocabsync.cmd;

import io.openepcis.dpp.vocabsync.RdfSupport;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.riot.RDFDataMgr;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import picocli.CommandLine;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.TreeSet;

/**
 * Ongoing-sync helper: load a refreshed upstream vocabulary (from a URL or a local file) and
 * diff its term set against the cached copy — added / removed / changed terms — so a re-audit
 * is only run when upstream actually moved. This turns the one-shot audit into a maintainable
 * capability. Compares by term IRI and a label+comment signature; RDF read by Jena.
 */
@CommandLine.Command(
        name = "fetch",
        description = "Diff a refreshed upstream vocabulary against the cached copy "
                + "(added/removed/changed terms). Use --from URL|file; --against the cached file.")
public class FetchCommand implements Runnable {

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;

    @CommandLine.Option(names = "--from", required = true,
            description = "New version: an http(s) URL or a local file path (TTL/JSON-LD).")
    String from;

    @CommandLine.Option(names = "--against", required = true,
            description = "Cached file to diff against (repo-relative), e.g. .cache/vocab/gs1-voc.ttl.")
    String against;

    @CommandLine.Option(names = "--namespace",
            description = "Only compare terms in this namespace (defaults to comparing all classes/properties).")
    String namespace;

    @CommandLine.Option(names = "--save", defaultValue = "false",
            description = "After diffing, overwrite the cached file with the fetched version.")
    boolean save;

    @Override
    public void run() {
        Path root = Path.of(repoRoot).normalize();
        Path cached = root.resolve(against).normalize();
        if (!Files.isReadable(cached)) {
            System.err.println("fetch: cached file not readable: " + cached);
            return;
        }
        Path fresh;
        try {
            fresh = from.startsWith("http") ? download(from)
                    : (Path.of(from).isAbsolute() ? Path.of(from) : root.resolve(from).normalize());
        } catch (Exception e) {
            System.err.println("fetch: could not obtain " + from + ": " + e.getMessage());
            return;
        }

        Map<String, String> oldSig = signatures(cached);
        Map<String, String> newSig = signatures(fresh);

        var added = new TreeSet<>(newSig.keySet());
        added.removeAll(oldSig.keySet());
        var removed = new TreeSet<>(oldSig.keySet());
        removed.removeAll(newSig.keySet());
        var changed = new TreeSet<String>();
        for (String iri : newSig.keySet()) {
            if (oldSig.containsKey(iri) && !Objects.equals(oldSig.get(iri), newSig.get(iri))) changed.add(iri);
        }

        System.out.printf("%nfetch diff (%s vs %s):%n", from, against);
        System.out.printf("  old terms: %d   new terms: %d%n", oldSig.size(), newSig.size());
        System.out.printf("  + added:   %d%n", added.size());
        System.out.printf("  - removed: %d%n", removed.size());
        System.out.printf("  ~ changed: %d (label/comment)%n", changed.size());
        added.stream().limit(15).forEach(i -> System.out.println("    + " + i));
        removed.stream().limit(15).forEach(i -> System.out.println("    - " + i));
        changed.stream().limit(15).forEach(i -> System.out.println("    ~ " + i));
        boolean moved = !added.isEmpty() || !removed.isEmpty() || !changed.isEmpty();
        System.out.println(moved ? "  → upstream moved: re-audit recommended." : "  → no change.");

        if (save) {
            try {
                Files.copy(fresh, cached, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                System.out.println("  saved fetched version to " + cached);
            } catch (Exception e) {
                System.err.println("  save failed: " + e.getMessage());
            }
        }
    }

    /** Term IRI → "label|comment" signature, for class/property terms (optionally namespace-filtered). */
    private Map<String, String> signatures(Path file) {
        Model m = RDFDataMgr.loadModel(file.toString());
        Map<String, String> sig = new LinkedHashMap<>();
        ResIterator it = m.listSubjects();
        while (it.hasNext()) {
            Resource r = it.next();
            if (r.isAnon() || r.getURI() == null) continue;
            if (namespace != null && !r.getURI().startsWith(namespace)) continue;
            if (RdfSupport.termType(r) == io.openepcis.dpp.vocabsync.model.TermType.OTHER) continue;
            String label = RdfSupport.firstString(r, org.apache.jena.vocabulary.RDFS.label, RdfSupport.SKOS_PREF_LABEL);
            String comment = RdfSupport.firstString(r, org.apache.jena.vocabulary.RDFS.comment, RdfSupport.SKOS_DEFINITION);
            sig.put(r.getURI(), (label == null ? "" : label) + "|" + (comment == null ? "" : comment));
        }
        return sig;
    }

    private Path download(String url) throws Exception {
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build();
        HttpResponse<byte[]> resp = client.send(
                HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(120)).GET().build(),
                HttpResponse.BodyHandlers.ofByteArray());
        if (resp.statusCode() / 100 != 2) throw new IllegalStateException("HTTP " + resp.statusCode());
        String ext = url.endsWith(".jsonld") || url.contains("json") ? ".jsonld" : ".ttl";
        Path tmp = Files.createTempFile("vocab-fetch", ext);
        Files.write(tmp, resp.body());
        return tmp;
    }
}
