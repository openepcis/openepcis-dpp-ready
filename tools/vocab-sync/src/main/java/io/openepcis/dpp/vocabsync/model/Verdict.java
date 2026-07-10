package io.openepcis.dpp.vocabsync.model;

/**
 * The LLM's judgement of one (our term → upstream term) candidate pair.
 *
 * <p>{@code relation} is the graded-SKOS relation that should hold, from our term's
 * perspective, or {@link Relation#NONE} if the pair is not a real match.
 */
public record Verdict(Relation relation, double confidence, String rationale) {

    public enum Relation {
        /** 1:1 equivalence → {@code skos:exactMatch}. */
        EXACT("skos:exactMatch"),
        /** Approximate / overlapping meaning → {@code skos:closeMatch}. */
        CLOSE("skos:closeMatch"),
        /**
         * Our term is broader than the upstream term → {@code skos:narrowMatch}
         * (SKOS: {@code A skos:narrowMatch B} asserts B is the narrower concept).
         */
        BROAD("skos:narrowMatch"),
        /**
         * Our term is narrower than the upstream term → {@code skos:broadMatch}
         * (SKOS: {@code A skos:broadMatch B} asserts B is the broader concept).
         */
        NARROW("skos:broadMatch"),
        /** Not a match; do not assert any mapping. */
        NONE(null);

        private final String predicate;

        Relation(String predicate) {
            this.predicate = predicate;
        }

        /** The SKOS predicate to write, or {@code null} for {@link #NONE}. */
        public String predicate() {
            return predicate;
        }

        public boolean isMatch() {
            return this != NONE;
        }
    }
}
