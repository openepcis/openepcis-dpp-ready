package io.openepcis.dpp.vocabsync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openepcis.dpp.vocabsync.model.TermType;
import io.openepcis.dpp.vocabsync.model.UpstreamTerm;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.OWL;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * Loads upstream vocabulary terms (classes + properties) into a flat, IRI-keyed index.
 * Every IRI a mapping is ever proposed against must exist here — the hallucination guard.
 *
 * <p>Two source kinds: <b>RDF</b> (TTL / expanded JSON-LD ontologies — GS1, schema.org,
 * SEMICeu — read by Jena with real labels/comments) and <b>JSON-LD @context</b> (DPP
 * Keystone, UNTP — term→IRI maps with no definitions, so terms carry only their local name
 * and a class/property guess from name casing). The audit may additionally {@link #seed}
 * the exact IRIs our TTLs already map to, so every existing mapping can be re-graded even
 * when its vocabulary has no machine-readable term set.
 */
@ApplicationScoped
public class UpstreamIndex {

    enum Kind {RDF, CONTEXT, SAMM}

    /** One upstream source: id, the term namespace to keep, where, and how to read it. */
    record Source(String vocabId, String namespace, Path path, Kind kind, String prefix) {
        static Source rdf(String vocabId, String namespace, Path path) {
            return new Source(vocabId, namespace, path, Kind.RDF, null);
        }

        static Source context(String vocabId, String namespace, String prefix, Path path) {
            return new Source(vocabId, namespace, path, Kind.CONTEXT, prefix);
        }

        /** A SAMM (Eclipse ESMF) aspect model — samm:Property / samm:Entity with preferredName/description. */
        static Source samm(String vocabId, String namespace, Path path) {
            return new Source(vocabId, namespace, path, Kind.SAMM, null);
        }
    }

    @Inject
    ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;
    @ConfigProperty(name = "vocab-sync.cache.gs1") String gs1Path;
    @ConfigProperty(name = "vocab-sync.cache.schemaorg") String schemaorgPath;
    @ConfigProperty(name = "vocab-sync.semic-dir") String semicDir;
    @ConfigProperty(name = "vocab-sync.dppk-dir") String dppkDir;
    @ConfigProperty(name = "vocab-sync.dppk-namespace") String dppkNamespace;
    @ConfigProperty(name = "vocab-sync.untp-context") String untpContext;
    @ConfigProperty(name = "vocab-sync.untp-namespace") String untpNamespace;
    @ConfigProperty(name = "vocab-sync.rail-voc") String railVoc;
    @ConfigProperty(name = "vocab-sync.batterypass-root") String batterypassRoot;

    /** Term namespace prefix for the BatteryPass SAMM aspect models (all aspects share it). */
    private static final String BATTERYPASS_NS = "urn:samm:io.BatteryPass";

    private List<UpstreamTerm> terms;
    private Map<String, UpstreamTerm> byIri;

    public synchronized List<UpstreamTerm> all() {
        if (terms == null) loadAll();
        return terms;
    }

    public boolean contains(String iri) {
        if (byIri == null) all();
        return byIri.containsKey(iri);
    }

    public UpstreamTerm get(String iri) {
        if (byIri == null) all();
        return byIri.get(iri);
    }

    /** Add a term if absent (used to seed the exact IRIs our TTLs already map to). */
    public synchronized UpstreamTerm seed(String vocabId, String iri, String localName, TermType type) {
        if (byIri == null) all();
        UpstreamTerm existing = byIri.get(iri);
        if (existing != null) return existing;
        UpstreamTerm t = new UpstreamTerm(vocabId, iri, localName, localName, null, type, "seeded");
        terms.add(t);
        byIri.put(iri, t);
        return t;
    }

    /** Best-effort vocab id for an arbitrary upstream IRI (for seeding + reporting). */
    public static String vocabIdForIri(String iri) {
        if (iri.startsWith("https://ref.gs1.org/voc/")) return "gs1";
        if (iri.startsWith("https://schema.org/") || iri.startsWith("http://schema.org/")) return "schemaorg";
        if (iri.startsWith("http://data.europa.eu/m8g/") || iri.startsWith("http://www.w3.org/ns/locn#")
                || iri.startsWith("http://www.w3.org/ns/adms#") || iri.startsWith("http://purl.org/vocab/cpsv#")
                || iri.startsWith("http://www.w3.org/ns/org#")) return "semic";
        if (iri.startsWith("https://dpp-keystone.org/")) return "dppk";
        if (iri.contains("uncefact.org")) return "untp";
        if (iri.startsWith("https://gs1-epcis-reg.org/rail/")) return "rail";
        if (iri.startsWith("urn:samm:io.BatteryPass")) return "batterypass";
        if (iri.startsWith("http://xmlns.com/foaf/")) return "foaf";
        return "other";
    }

    private void loadAll() {
        Path root = Path.of(repoRoot).normalize();
        List<Source> sources = new ArrayList<>();
        sources.add(Source.rdf("gs1", "https://ref.gs1.org/voc/", root.resolve(gs1Path)));
        sources.add(Source.rdf("schemaorg", "https://schema.org/", root.resolve(schemaorgPath)));
        sources.add(Source.rdf("semic", "http://data.europa.eu/m8g/", root.resolve(semicDir).resolve("semic-m8g.jsonld")));
        sources.add(Source.rdf("semic", "http://www.w3.org/ns/adms#", root.resolve(semicDir).resolve("semic-adms.jsonld")));
        sources.add(Source.rdf("semic", "http://www.w3.org/ns/locn#", root.resolve(semicDir).resolve("semic-locn.jsonld")));
        sources.add(Source.context("untp", untpNamespace, "untp", root.resolve(untpContext)));
        for (Path ctx : dppkContexts(root)) {
            sources.add(Source.context("dppk", dppkNamespace, "dppk", ctx));
        }
        // Extra discovery vocabs from the interop bridge contexts. Note: the CIRPASS-2 and
        // JTC24 bridges carry NO distinct term IRIs (they alias those frameworks' term names to
        // oec:/gs1:/schema:, already loaded), so they are not discovery sources. What they add is
        // org:/cpsv:/foaf: (semic-core bridge, beyond the m8g/locn/adms RDF already loaded) and
        // a few rail: terms. m8g/locn/adms here dedup against the richer RDF load above.
        Path interop = root.resolve("extensions/common/interop/context");
        Path semicBridge = interop.resolve("semic-core-bridge-context.jsonld");
        sources.add(Source.context("semic", "http://www.w3.org/ns/org#", "org", semicBridge));
        sources.add(Source.context("semic", "http://purl.org/vocab/cpsv#", "cpsv", semicBridge));
        sources.add(Source.context("foaf", "http://xmlns.com/foaf/0.1/", "foaf", semicBridge));
        // GS1 Rail: index the full in-repo vocabulary mirror (a Layer-1 sectoral peer), not just the
        // bridge context alias — so our terms can be aligned against the actual rail: terms.
        sources.add(Source.rdf("rail", "https://gs1-epcis-reg.org/rail/voc/data#", root.resolve(railVoc)));
        sources.add(Source.context("rail", "https://gs1-epcis-reg.org/rail/voc/data#", "rail",
                interop.resolve("rail-bridge-context.jsonld")));
        // BatteryPass: Eclipse ESMF/SAMM aspect models (sibling checkout); index the latest version of
        // each aspect as a discovery source for the battery / circularity / carbon-footprint concepts.
        for (Path aspect : batteryPassAspects()) {
            sources.add(Source.samm("batterypass", BATTERYPASS_NS, aspect));
        }

        terms = new ArrayList<>();
        byIri = new HashMap<>();
        for (Source s : sources) {
            if (!Files.isReadable(s.path())) {
                System.err.println("upstream: skipping " + s.vocabId() + " — not readable: " + s.path());
                continue;
            }
            int before = terms.size();
            if (s.kind() == Kind.RDF) loadRdf(s);
            else if (s.kind() == Kind.SAMM) loadSamm(s);
            else loadContext(s);
            int added = terms.size() - before;
            if (added > 0) {
                System.err.printf("upstream: %s += %d (%s)%n", s.vocabId(), added, s.path().getFileName());
            }
        }
        Map<String, Long> byVocab = new java.util.TreeMap<>();
        for (UpstreamTerm t : terms) byVocab.merge(t.vocabId(), 1L, Long::sum);
        System.err.println("upstream: total " + terms.size() + " terms " + byVocab);
    }

    private List<Path> dppkContexts(Path root) {
        Path dir = root.resolve(dppkDir);
        if (!Files.isDirectory(dir)) return List.of();
        try (Stream<Path> w = Files.list(dir)) {
            return w.filter(p -> p.getFileName().toString().endsWith(".jsonld")).sorted().toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    private void loadRdf(Source s) {
        Model model = RDFDataMgr.loadModel(s.path().toString());
        String version = firstVersion(model);
        ResIterator subjects = model.listSubjects();
        while (subjects.hasNext()) {
            Resource r = subjects.next();
            if (r.isAnon() || r.getURI() == null) continue;
            if (!r.getURI().startsWith(s.namespace())) continue;
            TermType type = RdfSupport.termType(r);
            if (type == TermType.OTHER) continue;
            if (byIri.containsKey(r.getURI())) continue;
            String label = RdfSupport.firstString(r, RDFS.label, RdfSupport.SKOS_PREF_LABEL);
            String comment = RdfSupport.firstString(r, RDFS.comment, RdfSupport.SKOS_DEFINITION);
            add(new UpstreamTerm(s.vocabId(), r.getURI(), r.getLocalName(), label, comment, type, version));
        }
    }

    /**
     * Load a SAMM (Eclipse ESMF) aspect model: {@code samm:Property} → a property term,
     * {@code samm:Entity}/{@code samm:AbstractEntity} → a class term, with the label from
     * {@code samm:preferredName} and the definition from {@code samm:description} (both @en-preferred,
     * reusing {@link RdfSupport#firstString}). The samm meta-model namespace is read from the file's
     * own {@code samm:} prefix so the loader is version-tolerant.
     */
    private void loadSamm(Source s) {
        Model model = RDFDataMgr.loadModel(s.path().toString());
        String samm = model.getNsPrefixURI("samm");
        if (samm == null) samm = "urn:samm:org.eclipse.esmf.samm:meta-model:2.1.0#";
        Resource cProperty = model.createResource(samm + "Property");
        Resource cEntity = model.createResource(samm + "Entity");
        Resource cAbstractEntity = model.createResource(samm + "AbstractEntity");
        org.apache.jena.rdf.model.Property pName = model.createProperty(samm + "preferredName");
        org.apache.jena.rdf.model.Property pDesc = model.createProperty(samm + "description");
        ResIterator subjects = model.listSubjects();
        while (subjects.hasNext()) {
            Resource r = subjects.next();
            if (r.isAnon() || r.getURI() == null || !r.getURI().startsWith(s.namespace())) continue;
            TermType type;
            if (r.hasProperty(RDF.type, cProperty)) {
                type = TermType.PROPERTY;
            } else if (r.hasProperty(RDF.type, cEntity) || r.hasProperty(RDF.type, cAbstractEntity)) {
                type = TermType.CLASS;
            } else {
                continue;
            }
            if (byIri.containsKey(r.getURI())) continue;
            String label = RdfSupport.firstString(r, pName);
            String comment = RdfSupport.firstString(r, pDesc);
            add(new UpstreamTerm(s.vocabId(), r.getURI(), RdfSupport.localOf(r.getURI()), label, comment,
                    type, sammVersion(r.getURI())));
        }
    }

    /** Latest-version aspect .ttl files under the BatteryPass sibling checkout (empty if absent). */
    private List<Path> batteryPassAspects() {
        Path base = Path.of(batterypassRoot).resolve("BatteryPass");
        if (!Files.isDirectory(base)) return List.of();
        List<Path> out = new ArrayList<>();
        try (Stream<Path> aspects = Files.list(base)) {
            for (Path aspect : aspects.filter(Files::isDirectory).sorted().toList()) {
                Path latest = latestVersion(aspect);
                if (latest == null) continue;
                try (Stream<Path> files = Files.list(latest)) {
                    files.filter(p -> p.getFileName().toString().endsWith(".ttl")).sorted().forEach(out::add);
                }
            }
        } catch (Exception e) {
            System.err.println("upstream: BatteryPass scan failed: " + e.getMessage());
        }
        return out;
    }

    /** Pick the highest semver-ish version subdirectory (e.g. 1.2.1 over 1.2.0 over 1.0.0). */
    private static Path latestVersion(Path aspectDir) {
        try (Stream<Path> vers = Files.list(aspectDir)) {
            return vers.filter(Files::isDirectory)
                    .max(java.util.Comparator.comparing(p -> p.getFileName().toString(),
                            UpstreamIndex::compareVersions))
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private static int compareVersions(String a, String b) {
        String[] pa = a.split("\\."), pb = b.split("\\.");
        for (int i = 0; i < Math.max(pa.length, pb.length); i++) {
            int x = i < pa.length ? parseIntSafe(pa[i]) : 0;
            int y = i < pb.length ? parseIntSafe(pb[i]) : 0;
            if (x != y) return Integer.compare(x, y);
        }
        return 0;
    }

    private static int parseIntSafe(String s) {
        try {
            return Integer.parseInt(s.replaceAll("\\D", "").isEmpty() ? "0" : s.replaceAll("\\D", ""));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    /** Extract the version segment from a SAMM term IRI like urn:samm:io.BatteryPass.X:1.2.0#term. */
    private static String sammVersion(String iri) {
        int hash = iri.indexOf('#');
        String head = hash >= 0 ? iri.substring(0, hash) : iri;
        int colon = head.lastIndexOf(':');
        return colon >= 0 && colon < head.length() - 1 ? head.substring(colon + 1) : null;
    }

    /** Parse a JSON-LD @context: each entry resolving to {prefix}:local in the namespace. */
    private void loadContext(Source s) {
        try {
            // Some published @context files carry // comments; tolerate them.
            JsonNode root = mapper.reader()
                    .with(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_COMMENTS)
                    .readTree(Files.readString(s.path()));
            JsonNode ctx = root.has("@context") ? root.get("@context") : root;
            if (!ctx.isObject()) return;
            Iterator<Map.Entry<String, JsonNode>> it = ctx.fields();
            while (it.hasNext()) {
                Map.Entry<String, JsonNode> e = it.next();
                String key = e.getKey();
                if (key.startsWith("@")) continue;
                JsonNode v = e.getValue();
                String id = v.isTextual() ? v.asText()
                        : (v.isObject() && v.has("@id") ? v.get("@id").asText() : null);
                if (id == null) continue;
                if (v.isTextual() && (id.endsWith("#") || id.endsWith("/"))) continue; // prefix binding
                String local = null;
                if (id.startsWith(s.prefix() + ":")) local = id.substring(s.prefix().length() + 1);
                else if (id.startsWith(s.namespace())) local = id.substring(s.namespace().length());
                if (local == null || local.isBlank()) continue;
                String iri = s.namespace() + local;
                if (byIri.containsKey(iri)) continue;
                TermType type = Character.isUpperCase(local.charAt(0)) ? TermType.CLASS : TermType.PROPERTY;
                add(new UpstreamTerm(s.vocabId(), iri, local, key, null, type, null));
            }
        } catch (Exception e) {
            System.err.println("upstream: context parse failed for " + s.path() + ": " + e.getMessage());
        }
    }

    private void add(UpstreamTerm t) {
        terms.add(t);
        byIri.put(t.iri(), t);
    }

    private static String firstVersion(Model model) {
        ResIterator it = model.listSubjectsWithProperty(RDF.type, OWL.Ontology);
        while (it.hasNext()) {
            String v = RdfSupport.firstString(it.next(), OWL.versionInfo);
            if (v != null) return v;
        }
        return null;
    }
}
