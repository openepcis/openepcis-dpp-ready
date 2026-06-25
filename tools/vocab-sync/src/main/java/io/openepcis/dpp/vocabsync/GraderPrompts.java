package io.openepcis.dpp.vocabsync;

/**
 * The single source of truth for the graded-SKOS grading prompt. The {@link Grader} AiService
 * references these constants in its {@code @SystemMessage}/{@code @UserMessage} annotations, and
 * the model benchmark fills the same template manually — so a benchmarked model is judged with the
 * identical prompt the production grader uses. Also defines the strict-JSON output contract used
 * when a model is driven directly (no langchain4j structured-output layer).
 */
public final class GraderPrompts {

    private GraderPrompts() {
    }

    public static final String SYSTEM = """
            You align terms from the OpenEPCIS DPP-extension ontology to upstream
            vocabularies (GS1 Web Vocabulary, schema.org, SEMICeu Core Vocabularies,
            UN/CEFACT UNTP, DPP Keystone, GS1 Rail). You decide the single best
            graded-SKOS relation between OUR term and ONE upstream candidate term.

            Return exactly one relation, judged from OUR term's perspective:
              EXACT  — same concept, interchangeable (skos:exactMatch).
              CLOSE  — strongly overlapping but not identical scope (skos:closeMatch).
              BROAD  — OUR term is BROADER (the upstream term is a narrower special case)
                       (skos:broadMatch).
              NARROW — OUR term is NARROWER (the upstream term is more general)
                       (skos:narrowMatch).
              NONE   — not the same concept; do not assert any mapping.

            Rules:
            - Judge meaning, not name similarity. Same label with different definition
              or domain/range is NOT a match.
            - A class only matches a class; a property only matches a property.
            - When uncertain between two grades, choose the weaker one. When uncertain
              whether it is a match at all, return NONE.
            - confidence is your own 0.0–1.0 certainty in the chosen relation.
            - rationale is one sentence citing the deciding factor (definition, domain,
              range, or scope). Do not restate the labels.
            """;

    public static final String USER_TEMPLATE = """
            OUR TERM
              id:        {ourId}
              type:      {ourType}
              label:     {ourLabel}
              definition:{ourComment}
              domain:    {ourDomain}
              range:     {ourRange}

            UPSTREAM CANDIDATE
              vocabulary:{upVocab}
              iri:       {upIri}
              type:      {upType}
              label:     {upLabel}
              definition:{upComment}
            """;

    /** Appended when a model is driven directly (no langchain4j structured-output enforcement). */
    public static final String JSON_INSTRUCTION = """

            Respond with ONLY a JSON object, no other text:
            {"relation":"EXACT|CLOSE|BROAD|NARROW|NONE","confidence":0.0,"rationale":"one sentence"}
            """;

    /** Fill {@link #USER_TEMPLATE} the same way langchain4j's @V substitution does (for the benchmark). */
    public static String fillUser(String ourId, String ourType, String ourLabel, String ourComment,
                                  String ourDomain, String ourRange, String upVocab, String upIri,
                                  String upType, String upLabel, String upComment) {
        return USER_TEMPLATE
                .replace("{ourId}", nz(ourId)).replace("{ourType}", nz(ourType))
                .replace("{ourLabel}", nz(ourLabel)).replace("{ourComment}", nz(ourComment))
                .replace("{ourDomain}", nz(ourDomain)).replace("{ourRange}", nz(ourRange))
                .replace("{upVocab}", nz(upVocab)).replace("{upIri}", nz(upIri))
                .replace("{upType}", nz(upType)).replace("{upLabel}", nz(upLabel))
                .replace("{upComment}", nz(upComment));
    }

    private static String nz(String s) {
        return s == null ? "(none)" : s;
    }
}
