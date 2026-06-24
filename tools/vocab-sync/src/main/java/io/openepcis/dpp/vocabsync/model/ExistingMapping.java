package io.openepcis.dpp.vocabsync.model;

/**
 * A cross-vocabulary mapping already asserted in our TTL for a term: the SKOS (or
 * rdfs:seeAlso / owl:equivalent*) predicate and the upstream IRI it points at.
 */
public record ExistingMapping(String predicate, String targetIri) {
}
