package io.openepcis.dpp.vocabsync.model;

/**
 * One term from an upstream vocabulary (GS1, schema.org, SEMICeu, UNTP, DPP Keystone,
 * GS1 Rail). {@code vocabId} matches the web app's EXTERNAL_VOCABULARIES ids (gs1,
 * schemaorg, semic, untp, dppk, rail). The {@code iri} is the canonical, dereferenceable
 * term URI — the only value ever proposed for a mapping (validated against this index).
 */
public record UpstreamTerm(
        String vocabId,
        String iri,
        String localName,
        String label,
        String comment,
        TermType type,
        String version) {

    /** Text fed to the embedding model: name + label + definition. */
    public String embedText() {
        StringBuilder sb = new StringBuilder(localName);
        if (label != null && !label.isBlank()) sb.append(" — ").append(label);
        if (comment != null && !comment.isBlank()) sb.append(". ").append(comment);
        return sb.toString();
    }
}
