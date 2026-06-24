package io.openepcis.dpp.vocabsync;

import io.openepcis.dpp.vocabsync.model.TermType;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.OWL;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.util.List;

/** Jena helpers shared by the two index loaders: term typing, label/comment, naming. */
public final class RdfSupport {

    public static final String SKOS_NS = "http://www.w3.org/2004/02/skos/core#";
    public static final Property SKOS_PREF_LABEL = ResourceFactory.createProperty(SKOS_NS, "prefLabel");
    public static final Property SKOS_DEFINITION = ResourceFactory.createProperty(SKOS_NS, "definition");
    public static final Property SKOS_EXACT = ResourceFactory.createProperty(SKOS_NS, "exactMatch");
    public static final Property SKOS_CLOSE = ResourceFactory.createProperty(SKOS_NS, "closeMatch");
    public static final Property SKOS_BROAD = ResourceFactory.createProperty(SKOS_NS, "broadMatch");
    public static final Property SKOS_NARROW = ResourceFactory.createProperty(SKOS_NS, "narrowMatch");
    public static final Property SKOS_RELATED = ResourceFactory.createProperty(SKOS_NS, "relatedMatch");

    /** Mapping predicates we read from a term block (graded SKOS + structural fallbacks). */
    public static final List<Property> MAPPING_PREDICATES = List.of(
            SKOS_EXACT, SKOS_CLOSE, SKOS_BROAD, SKOS_NARROW, SKOS_RELATED,
            RDFS.seeAlso, OWL.equivalentClass, OWL.equivalentProperty);

    private RdfSupport() {
    }

    /** Classify a subject by its rdf:type assertions. */
    public static TermType termType(Resource r) {
        if (r.hasProperty(RDF.type, OWL.Class) || r.hasProperty(RDF.type, RDFS.Class)) {
            return TermType.CLASS;
        }
        if (r.hasProperty(RDF.type, OWL.ObjectProperty)
                || r.hasProperty(RDF.type, OWL.DatatypeProperty)
                || r.hasProperty(RDF.type, OWL.AnnotationProperty)
                || r.hasProperty(RDF.type, RDF.Property)) {
            return TermType.PROPERTY;
        }
        return TermType.OTHER;
    }

    /** First non-blank value across the given properties, preferring English literals. */
    public static String firstString(Resource r, Property... props) {
        String fallback = null;
        for (Property p : props) {
            var it = r.listProperties(p);
            while (it.hasNext()) {
                Statement st = it.next();
                RDFNode o = st.getObject();
                if (!o.isLiteral()) continue;
                String lang = o.asLiteral().getLanguage();
                String val = o.asLiteral().getString();
                if (val == null || val.isBlank()) continue;
                if (lang == null || lang.isEmpty() || lang.startsWith("en")) {
                    return val.trim();
                }
                if (fallback == null) fallback = val.trim();
            }
        }
        return fallback;
    }

    /** Compact name for a resource value (prefix:local if known, else localName). */
    public static String shortName(Model model, RDFNode node) {
        if (node == null || !node.isResource()) return null;
        Resource r = node.asResource();
        if (r.isAnon() || r.getURI() == null) return null;
        String ns = r.getNameSpace();
        String local = r.getLocalName();
        if (local == null || local.isBlank()) return r.getURI();
        String prefix = model.getNsURIPrefix(ns);
        return prefix != null ? prefix + ":" + local : r.getURI();
    }

    /** Local name of an IRI without loading a model (last #/ segment). */
    public static String localOf(String iri) {
        int h = iri.lastIndexOf('#');
        int s = iri.lastIndexOf('/');
        int cut = Math.max(h, s);
        return cut >= 0 && cut < iri.length() - 1 ? iri.substring(cut + 1) : iri;
    }
}
