package io.openepcis.dpp.vocabsync.model;

/**
 * A drafted term of ours that would cover one upstream term: where it goes, what it is called,
 * how it is defined in our house style, and how it maps back. A draft for the curator, written to
 * a proposal TTL/markdown and into the coverage sheet; nothing is inserted into an ontology until
 * the curator says so.
 *
 * <p>{@code termType} is {@code class} or {@code property}; {@code domain} and {@code range} name
 * classes of ours (prefixed, e.g. {@code oec:SubstanceOfConcern}), a class proposed in the same
 * run, or an XSD datatype; {@code mapping} is the SKOS predicate from our term to the upstream term.
 */
public record TermProposal(String module, String localName, String termType, String label,
                           String definition, String domain, String range, String mapping,
                           String rationale, String caveat) {
}
