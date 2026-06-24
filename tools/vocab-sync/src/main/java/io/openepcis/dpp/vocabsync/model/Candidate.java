package io.openepcis.dpp.vocabsync.model;

/** An upstream term retrieved as a mapping candidate for one of our terms, with its score. */
public record Candidate(UpstreamTerm term, double score, boolean exactLocalName) {
}
