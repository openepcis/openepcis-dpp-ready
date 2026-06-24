package io.openepcis.dpp.vocabsync.model;

/** RDF kind of a term. A class only maps to a class; a property only to a property. */
public enum TermType {
    CLASS,
    PROPERTY,
    OTHER;

    /** Lower-case label for the grader prompt. */
    public String label() {
        return name().toLowerCase();
    }
}
