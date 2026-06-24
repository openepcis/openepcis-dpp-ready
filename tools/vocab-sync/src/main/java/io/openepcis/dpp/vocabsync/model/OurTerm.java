package io.openepcis.dpp.vocabsync.model;

import java.util.List;

/**
 * One term from our DPP-extension ontology, with the cross-vocabulary mappings already
 * asserted in its TTL block. The audit compares proposed mappings against {@code existing}
 * to classify each as MISSING / WEAK / WRONG / OK.
 */
public record OurTerm(
        String moduleSlug,
        String prefixedId,
        String iri,
        String localName,
        TermType type,
        String label,
        String comment,
        String domain,
        String range,
        List<ExistingMapping> existing) {

    /** Text fed to the embedding model: name + label + definition. */
    public String embedText() {
        StringBuilder sb = new StringBuilder(localName);
        if (label != null && !label.isBlank()) sb.append(" — ").append(label);
        if (comment != null && !comment.isBlank()) sb.append(". ").append(comment);
        return sb.toString();
    }

    /** True if a mapping (any predicate) to this exact IRI is already asserted. */
    public boolean hasMappingTo(String targetIri) {
        return existing.stream().anyMatch(m -> m.targetIri().equals(targetIri));
    }
}
