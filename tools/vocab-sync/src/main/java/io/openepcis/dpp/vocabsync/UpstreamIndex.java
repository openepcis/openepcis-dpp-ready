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
import org.apache.jena.rdf.model.Statement;
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
    record Source(String vocabId, String namespace, Path path, Kind kind, String prefix,
                  String dataElementSchemeSuffix) {
        static Source rdf(String vocabId, String namespace, Path path) {
            return new Source(vocabId, namespace, path, Kind.RDF, null, null);
        }

        /**
         * An RDF source whose data elements are SKOS concepts rather than RDF properties: a concept
         * in a scheme whose IRI ends in {@code dataElementSchemeSuffix} is indexed as a property.
         * The EU DPP Registry vocabularies work this way: {@code battery-vocabulary#batteryWeight}
         * is a skos:Concept, and the Commission's own SHACL shapes use it as the sh:path of the
         * passport field. The concepts of the other schemes (chemistries, units, statuses) stay
         * code-list values.
         */
        static Source rdfDataElements(String vocabId, String namespace, Path path, String dataElementSchemeSuffix) {
            return new Source(vocabId, namespace, path, Kind.RDF, null, dataElementSchemeSuffix);
        }

        static Source context(String vocabId, String namespace, String prefix, Path path) {
            return new Source(vocabId, namespace, path, Kind.CONTEXT, prefix, null);
        }

        /** A SAMM (Eclipse ESMF) aspect model — samm:Property / samm:Entity with preferredName/description. */
        static Source samm(String vocabId, String namespace, Path path) {
            return new Source(vocabId, namespace, path, Kind.SAMM, null, null);
        }

        /** The term type of {@code r} in this source; see {@link #rdfDataElements}. */
        TermType typeOf(Resource r) {
            TermType t = RdfSupport.termType(r);
            if (t != TermType.OTHER || dataElementSchemeSuffix == null) return t;
            if (!r.hasProperty(RDF.type, SKOS_CONCEPT)) return t;
            var it = r.listProperties(SKOS_IN_SCHEME);
            while (it.hasNext()) {
                var o = it.next().getObject();
                if (o.isURIResource() && o.asResource().getURI().endsWith(dataElementSchemeSuffix)) {
                    return TermType.PROPERTY;
                }
            }
            return t;
        }
    }

    private static final Resource SKOS_CONCEPT =
            org.apache.jena.rdf.model.ResourceFactory.createResource(RdfSupport.SKOS_NS + "Concept");
    private static final org.apache.jena.rdf.model.Property SKOS_IN_SCHEME =
            org.apache.jena.rdf.model.ResourceFactory.createProperty(RdfSupport.SKOS_NS, "inScheme");
    private static final org.apache.jena.rdf.model.Property SKOS_SCOPE_NOTE =
            org.apache.jena.rdf.model.ResourceFactory.createProperty(RdfSupport.SKOS_NS, "scopeNote");

    /** EU DPP Registry semantic data artifacts: every vocabulary sits under this base. */
    public static final String EU_DPP_BASE = "https://repository.product-passport.ec.europa.eu/";

    @Inject
    ObjectMapper mapper;

    @ConfigProperty(name = "vocab-sync.repo-root") String repoRoot;
    @ConfigProperty(name = "vocab-sync.cache.gs1") String gs1Path;
    @ConfigProperty(name = "vocab-sync.cache.schemaorg") String schemaorgPath;
    @ConfigProperty(name = "vocab-sync.semic-dir") String semicDir;
    @ConfigProperty(name = "vocab-sync.dppk-dir") String dppkDir;
    @ConfigProperty(name = "vocab-sync.dppk-namespace") String dppkNamespace;
    @ConfigProperty(name = "vocab-sync.dppk-ontology") java.util.Optional<String> dppkOntology;
    @ConfigProperty(name = "vocab-sync.untp-context") String untpContext;
    @ConfigProperty(name = "vocab-sync.untp-namespace") String untpNamespace;
    @ConfigProperty(name = "vocab-sync.rail-voc") String railVoc;
    @ConfigProperty(name = "vocab-sync.eudpp-voc") String eudppVoc;
    @ConfigProperty(name = "vocab-sync.cirpass2-textile-voc") String cirpass2TextileVoc;
    @ConfigProperty(name = "vocab-sync.cirpass2-battery-voc") String cirpass2BatteryVoc;
    @ConfigProperty(name = "vocab-sync.eu-dpp-voc") String euDppVoc;
    @ConfigProperty(name = "vocab-sync.batterypass-root") String batterypassRoot;
    @ConfigProperty(name = "vocab-sync.batterypass-ready-vocab") String batterypassReadyVocab;

    private List<Source> sourceList = List.of();

    /** Term namespace prefix for the BatteryPass SAMM aspect models (all aspects share it). */
    private static final String BATTERYPASS_NS = "urn:samm:io.BatteryPass";

    private List<UpstreamTerm> terms;
    private Map<String, UpstreamTerm> byIri;

    public synchronized List<UpstreamTerm> all() {
        if (terms == null) loadAll();
        return terms;
    }

    /**
     * The typed individuals and concepts of one RDF source (code-list values such as life-cycle
     * modules or impact categories). They are NOT part of the index — our side holds classes and
     * properties only, so nothing retrieves against them — but a coverage report has to list them.
     */
    public synchronized List<UpstreamTerm> individuals(String vocabId) {
        all();
        List<UpstreamTerm> out = new ArrayList<>();
        for (Source s : sourceList) {
            if (s.kind() != Kind.RDF || !s.vocabId().equals(vocabId) || !Files.isReadable(s.path())) continue;
            Model model = RDFDataMgr.loadModel(s.path().toString());
            String version = firstVersion(model, s.namespace());
            ResIterator subjects = model.listSubjects();
            while (subjects.hasNext()) {
                Resource r = subjects.next();
                if (r.isAnon() || r.getURI() == null) continue;
                if (!r.getURI().startsWith(s.namespace())) continue;
                if (s.typeOf(r) != TermType.OTHER) continue;
                if (!r.hasProperty(RDF.type)) continue;
                if (r.hasProperty(RDF.type, OWL.Ontology)) continue;
                String label = RdfSupport.firstString(r, RDFS.label, RdfSupport.SKOS_PREF_LABEL);
                String comment = RdfSupport.firstString(r, RDFS.comment, RdfSupport.SKOS_DEFINITION);
                out.add(new UpstreamTerm(s.vocabId(), r.getURI(), r.getLocalName(), label, comment,
                        TermType.OTHER, version));
            }
        }
        return out;
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
        if (iri.startsWith("https://w3id.org/eudpp/textile-")) return "cirpass2-textile";
        if (iri.startsWith("https://w3id.org/eudpp/battery")) return "cirpass2-battery";
        if (iri.startsWith("https://w3id.org/eudpp")) return "eudpp";
        if (iri.startsWith("urn:samm:io.BatteryPass")) return "batterypass";
        if (iri.startsWith("https://ref.openepcis.org/vocab/batterypass-ready/")) return "bpr";
        if (iri.startsWith("http://xmlns.com/foaf/")) return "foaf";
        if (iri.startsWith(EU_DPP_BASE)) return "eu-dpp";
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
        // DPP Keystone v3 publishes an OWL ontology with labels, definitions, domain and range;
        // read it first so its terms win over the bare names the contexts give. The namespace stem
        // covers the v3 sub-namespaces (terms/epd#, terms/dopc#, terms/unit#, terms/signature#).
        dppkOntology.filter(p -> !p.isBlank()).ifPresent(p -> sources.add(Source.rdf("dppk",
                dppkNamespace.replaceAll("#$", ""), root.resolve(p))));
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
        // CIRPASS-2 EUDPP: index the full in-repo upstream mirror (Layer-2 community profile),
        // so our terms can be aligned against the actual eudpp: terms instead of only the
        // seeAlso pointers already in dpp-core.
        sources.add(Source.rdf("eudpp", "https://w3id.org/eudpp#", root.resolve(eudppVoc)));
        // CIRPASS-2 sectoral ontologies (textile 1.1.2, battery 0.4.0 DRAFT): in-repo mirrors, each
        // spread over several sub-namespaces under one path prefix; the prefix match of loadRdf
        // covers them all. The battery file also carries MIREOT copies of eudpp# CORE terms, which
        // fall outside the prefix and stay with the eudpp source above.
        sources.add(Source.rdf("cirpass2-textile", "https://w3id.org/eudpp/textile-", root.resolve(cirpass2TextileVoc)));
        sources.add(Source.rdf("cirpass2-battery", "https://w3id.org/eudpp/battery", root.resolve(cirpass2BatteryVoc)));
        // EU DPP Registry semantic data artifacts (European Commission, release 1.0.0): in-repo
        // mirror of the seventeen SKOS vocabularies. The data elements of the core, common and
        // battery vocabularies are indexed as properties; the value schemes stay code lists.
        sources.add(Source.rdfDataElements("eu-dpp", EU_DPP_BASE, root.resolve(euDppVoc), "-vocabulary"));
        // BatteryPass: Eclipse ESMF/SAMM aspect models (sibling checkout); index the latest version of
        // each aspect as a discovery source for the battery / circularity / carbon-footprint concepts.
        for (Path aspect : batteryPassAspects()) {
            sources.add(Source.samm("batterypass", BATTERYPASS_NS, aspect));
        }
        // GEFEG BatteryPass-Ready: an OpenEPCIS-hosted RDF reference for the v1.3 attribute
        // longlist (GEFEG publishes no IRIs). A distinct source from the Consortium SAMM above.
        sources.add(Source.rdf("bpr", "https://ref.openepcis.org/vocab/batterypass-ready/1.3#",
                root.resolve(batterypassReadyVocab)));

        sourceList = sources;
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


    /**
     * Local names of the resource objects of the given properties, joined with "/" (max 4) —
     * the domain/range hint fed to the graders so keyword matches into foreign subject areas
     * (drinking temperature, dietary fibre, vehicle fuel, ...) are recognisable.
     */
    private static String refLocals(Resource r, org.apache.jena.rdf.model.Property... props) {
        java.util.LinkedHashSet<String> out = new java.util.LinkedHashSet<>();
        for (org.apache.jena.rdf.model.Property p : props) {
            var it = r.listProperties(p);
            while (it.hasNext()) {
                var o = it.next().getObject();
                if (o.isURIResource()) out.add(o.asResource().getLocalName());
            }
        }
        if (out.isEmpty()) return null;
        return String.join("/", out.stream().limit(4).toList());
    }

    /**
     * The registry copies the legal text of a whole provision onto every element it splits into
     * (serialNumber, productNumber and otherIdentificationElement all carry the definition of
     * Annex VI Part A 2). Name the parent group, and say when the definition is shared, so the grader
     * takes the element from its label instead of reading the provision as the element.
     */
    static String elementContext(Model model, Resource r) {
        var bp = model.createProperty(RdfSupport.SKOS_NS, "broader");
        Statement b = r.getProperty(bp);
        if (b == null || !b.getObject().isURIResource()) return null;
        Resource parent = b.getObject().asResource();
        String parentLabel = RdfSupport.firstString(parent, RDFS.label, RdfSupport.SKOS_PREF_LABEL);
        StringBuilder out = new StringBuilder("Part of: ")
                .append(parentLabel != null ? parentLabel : parent.getLocalName()).append('.');
        String def = RdfSupport.firstString(r, RdfSupport.SKOS_DEFINITION);
        if (def != null) {
            int siblings = 0;
            for (var it = model.listSubjectsWithProperty(bp, parent); it.hasNext(); ) {
                Resource sib = it.next();
                if (!sib.equals(r) && def.equals(RdfSupport.firstString(sib, RdfSupport.SKOS_DEFINITION))) siblings++;
            }
            if (siblings > 0) {
                out.append(" The definition above is the legal text of the whole provision, shared with ")
                        .append(siblings).append(siblings == 1 ? " sibling element" : " sibling elements")
                        .append("; this element is only the part its label names.");
            }
        }
        return out.toString();
    }

    private void loadRdf(Source s) {
        Model model = RDFDataMgr.loadModel(s.path().toString());
        String version = firstVersion(model, s.namespace());
        ResIterator subjects = model.listSubjects();
        while (subjects.hasNext()) {
            Resource r = subjects.next();
            if (r.isAnon() || r.getURI() == null) continue;
            if (!r.getURI().startsWith(s.namespace())) continue;
            TermType type = s.typeOf(r);
            if (type == TermType.OTHER) continue;
            if (byIri.containsKey(r.getURI())) continue;
            String label = RdfSupport.firstString(r, RDFS.label, RdfSupport.SKOS_PREF_LABEL);
            String comment = RdfSupport.firstString(r, RDFS.comment, RdfSupport.SKOS_DEFINITION);
            if (s.dataElementSchemeSuffix() != null) {
                // The scope note carries the legal source and the per-category obligation
                // ("Article 77 (3) ... Public. EV: Mandatory, ..."), which a grader needs to tell
                // two similarly named data points apart.
                String scope = RdfSupport.firstString(r, SKOS_SCOPE_NOTE);
                if (scope != null) comment = comment == null ? scope : comment + " " + scope;
                String context = elementContext(model, r);
                if (context != null) comment = comment == null ? context : comment + " " + context;
            }
            String domain = refLocals(r, RDFS.domain,
                    model.createProperty("https://schema.org/domainIncludes"),
                    model.createProperty("http://schema.org/domainIncludes"));
            String range = refLocals(r, RDFS.range,
                    model.createProperty("https://schema.org/rangeIncludes"),
                    model.createProperty("http://schema.org/rangeIncludes"));
            add(new UpstreamTerm(s.vocabId(), r.getURI(), r.getLocalName(), label, comment, type,
                    domain, range, version));
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
            Map<String, String> subPrefixes = new HashMap<>();
            collectSubPrefixes(root, s.prefix() + "-", subPrefixes);
            collectContextTerms(root.has("@context") ? root.get("@context") : root, s, subPrefixes);
        } catch (Exception e) {
            System.err.println("upstream: context parse failed for " + s.path() + ": " + e.getMessage());
        }
    }

    /**
     * Collect terms from a JSON-LD @context, recursing into nested per-entry @context blocks. UNTP
     * defines its property terms deep inside per-type sub-contexts (e.g. Product → materialProvenance
     * → massFraction), so a flat top-level scan would miss most of the vocabulary. Terms dedup by IRI.
     */
    private void collectContextTerms(JsonNode ctx, Source s, Map<String, String> subPrefixes) {
        if (ctx == null) return;
        if (ctx.isArray()) {
            for (JsonNode n : ctx) collectContextTerms(n, s, subPrefixes);
            return;
        }
        if (!ctx.isObject()) return;
        Iterator<Map.Entry<String, JsonNode>> it = ctx.fields();
        while (it.hasNext()) {
            Map.Entry<String, JsonNode> e = it.next();
            String key = e.getKey();
            JsonNode v = e.getValue();
            if (!key.startsWith("@")) {
                String id = v.isTextual() ? v.asText()
                        : (v.isObject() && v.has("@id") ? v.get("@id").asText() : null);
                if (id != null && !(v.isTextual() && (id.endsWith("#") || id.endsWith("/")))) {
                    String local = null;
                    String ns = s.namespace();
                    if (id.startsWith(s.prefix() + ":")) local = id.substring(s.prefix().length() + 1);
                    else if (id.startsWith(s.namespace())) local = id.substring(s.namespace().length());
                    else {
                        for (Map.Entry<String, String> sp : subPrefixes.entrySet()) {
                            if (id.startsWith(sp.getKey() + ":")) {
                                local = id.substring(sp.getKey().length() + 1);
                                ns = sp.getValue();
                                break;
                            }
                            if (id.startsWith(sp.getValue())) {
                                local = id.substring(sp.getValue().length());
                                ns = sp.getValue();
                                break;
                            }
                        }
                    }
                    String iri = local == null ? null : ns + local;
                    if (local != null && !local.isBlank() && !byIri.containsKey(iri)) {
                        TermType type = Character.isUpperCase(local.charAt(0)) ? TermType.CLASS : TermType.PROPERTY;
                        add(new UpstreamTerm(s.vocabId(), iri, local, key, null, type, null));
                    }
                }
            }
            // UNTP-style nesting: an entry may carry its own @context defining further terms.
            if (v.isObject() && v.has("@context")) collectContextTerms(v.get("@context"), s, subPrefixes);
        }
    }

    /**
     * Prefixes that extend the source prefix with a sub-namespace, declared anywhere in the
     * context. DPP Keystone v3 moved its EPD indicators to {@code dppk-epd:} and its DoPC fields to
     * {@code dppk-dopc:}; they are the same vocabulary, so their terms are indexed under it.
     */
    private static void collectSubPrefixes(JsonNode n, String stem, Map<String, String> out) {
        if (n == null) return;
        if (n.isArray()) {
            for (JsonNode x : n) collectSubPrefixes(x, stem, out);
            return;
        }
        if (!n.isObject()) return;
        Iterator<Map.Entry<String, JsonNode>> it = n.fields();
        while (it.hasNext()) {
            Map.Entry<String, JsonNode> e = it.next();
            JsonNode v = e.getValue();
            if (e.getKey().startsWith(stem) && v.isTextual()
                    && (v.asText().endsWith("#") || v.asText().endsWith("/"))) {
                out.put(e.getKey(), v.asText());
            } else if (v.isObject() || v.isArray()) {
                collectSubPrefixes(v, stem, out);
            }
        }
    }

    private void add(UpstreamTerm t) {
        terms.add(t);
        byIri.put(t.iri(), t);
    }

    /**
     * The version of the source's own ontology node. A merged mirror holds several
     * owl:Ontology nodes (the EUDPP file carries CORE plus its nine modules), so the node
     * whose IRI is the source namespace (minus the trailing # or /) wins; the first node
     * with a version is the fallback for single-ontology files.
     */
    private static String firstVersion(Model model, String namespace) {
        String want = namespace.replaceAll("[#/]+$", "");
        String fallback = null;
        ResIterator it = model.listSubjectsWithProperty(RDF.type, OWL.Ontology);
        while (it.hasNext()) {
            Resource node = it.next();
            String v = RdfSupport.firstString(node, OWL.versionInfo);
            if (v == null) continue;
            if (node.getURI() != null && node.getURI().replaceAll("[#/]+$", "").equals(want)) return v;
            if (fallback == null) fallback = v;
        }
        return fallback;
    }
}
