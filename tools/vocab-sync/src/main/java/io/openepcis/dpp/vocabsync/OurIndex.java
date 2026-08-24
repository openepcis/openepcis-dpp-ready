package io.openepcis.dpp.vocabsync;

import io.openepcis.dpp.vocabsync.model.ExistingMapping;
import io.openepcis.dpp.vocabsync.model.OurTerm;
import io.openepcis.dpp.vocabsync.model.TermType;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.RDFS;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * Loads our DPP-extension terms from {@code extensions/&#42;/&#42;/ontology/&#42;.ttl}, with the
 * cross-vocabulary mappings already asserted on each term. "Our" terms are those in the
 * {@code https://ref.openepcis.io/extensions/} namespace; everything else in the file
 * (gs1:, schema:, dppk: references, etc.) is ignored here.
 */
@ApplicationScoped
public class OurIndex {

    static final String OUR_NS_PREFIX = "https://ref.openepcis.io/extensions/";

    @ConfigProperty(name = "vocab-sync.repo-root")
    String repoRoot;

    /** Load all modules, or just one by slug (the module directory name, e.g. "battery"). */
    public List<OurTerm> load(String moduleSlug) {
        Path extensions = Path.of(repoRoot).resolve("extensions").normalize();
        if (!Files.isDirectory(extensions)) {
            throw new IllegalStateException("extensions/ not found under repo-root=" + repoRoot
                    + " (resolved " + extensions.toAbsolutePath() + ")");
        }
        List<OurTerm> terms = new ArrayList<>();
        try (Stream<Path> walk = Files.walk(extensions)) {
            List<Path> ttls = walk
                    .filter(p -> p.getParent() != null && p.getParent().getFileName().toString().equals("ontology"))
                    .filter(p -> p.getFileName().toString().endsWith(".ttl"))
                    .sorted()
                    .toList();
            for (Path ttl : ttls) {
                String slug = moduleSlugOf(ttl);
                if (moduleSlug != null && !moduleSlug.equals(slug)) continue;
                loadFile(ttl, slug, terms);
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return terms;
    }

    /** Module slug = the directory two levels above the .ttl (…/<slug>/ontology/<file>.ttl). */
    static String moduleSlugOf(Path ttl) {
        return ttl.getParent().getParent().getFileName().toString();
    }

    /** Map of module slug → its single ontology TTL path (for the gated apply step). */
    public Map<String, Path> moduleTtlFiles() {
        Path extensions = Path.of(repoRoot).resolve("extensions").normalize();
        Map<String, Path> map = new LinkedHashMap<>();
        try (Stream<Path> walk = Files.walk(extensions)) {
            walk.filter(p -> p.getParent() != null
                            && p.getParent().getFileName().toString().equals("ontology"))
                    .filter(p -> p.getFileName().toString().endsWith(".ttl"))
                    .forEach(p -> map.put(moduleSlugOf(p), p));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return map;
    }

    private void loadFile(Path ttl, String slug, List<OurTerm> out) {
        Model model = RDFDataMgr.loadModel(ttl.toString());
        ResIterator subjects = model.listSubjects();
        while (subjects.hasNext()) {
            Resource r = subjects.next();
            if (r.isAnon() || r.getURI() == null) continue;
            if (!r.getURI().startsWith(OUR_NS_PREFIX)) continue;
            TermType type = RdfSupport.termType(r);
            if (type == TermType.OTHER) continue;

            String label = RdfSupport.firstString(r, RDFS.label, RdfSupport.SKOS_PREF_LABEL);
            String comment = RdfSupport.firstString(r, RDFS.comment, RdfSupport.SKOS_DEFINITION);
            String domain = RdfSupport.shortName(model, first(r, RDFS.domain));
            String range = RdfSupport.shortName(model, first(r, RDFS.range));

            List<ExistingMapping> existing = new ArrayList<>();
            for (Property pred : RdfSupport.MAPPING_PREDICATES) {
                var it = r.listProperties(pred);
                while (it.hasNext()) {
                    RDFNode o = it.next().getObject();
                    if (o.isResource() && o.asResource().getURI() != null) {
                        existing.add(new ExistingMapping(model.getNsURIPrefix(pred.getNameSpace()) != null
                                ? model.getNsURIPrefix(pred.getNameSpace()) + ":" + pred.getLocalName()
                                : pred.getLocalName(),
                                o.asResource().getURI()));
                    }
                }
            }

            String ns = r.getNameSpace();
            String prefix = model.getNsURIPrefix(ns);
            String prefixedId = prefix != null ? prefix + ":" + r.getLocalName() : r.getURI();
            out.add(new OurTerm(slug, prefixedId, r.getURI(), r.getLocalName(), type,
                    label, comment, domain, range, existing));
        }
    }

    private static RDFNode first(Resource r, Property p) {
        var it = r.listProperties(p);
        return it.hasNext() ? it.next().getObject() : null;
    }
}
