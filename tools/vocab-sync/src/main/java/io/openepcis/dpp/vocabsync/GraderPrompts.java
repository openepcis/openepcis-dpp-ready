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

    /**
     * Version of the rubric below. It is folded into every verdict's cache key
     * ({@link PairJudge#contentSig}), so a rubric change re-grades instead of serving verdicts
     * the old rubric produced. Bump it with every change to {@link #RUBRIC}.
     */
    public static final String RUBRIC_VERSION = "curator-5";

    /**
     * The curator rubric shared by the grader and the QA panel: the relations, how to judge, and
     * the cases that never get a mapping. Tuned against the EU DPP Registry curation of
     * 2026-11-02 (docs/skos-alignment/bench/eu-dpp-goldset.json); the default "choose the weaker
     * grade when unsure" rule it replaces downgraded same-data-point pairs to CLOSE whenever the
     * two sides serialised the value differently.
     */
    public static final String RUBRIC = """
            Return exactly one relation, judged from OUR term's perspective:
              EXACT  — the same data point or concept (skos:exactMatch).
              CLOSE  — the same subject but not the same data point; each covers cases
                       the other excludes (skos:closeMatch).
              BROAD  — OUR term is BROADER: the upstream term is a special case of ours
                       (written as skos:narrowMatch).
              NARROW — OUR term is NARROWER: ours is a special case of the upstream term,
                       or one of the values the upstream data point legally comprises
                       (written as skos:broadMatch).
              NONE   — no mapping should be published.

            How to judge
            1. Identify the data point, not the label. Read both definitions, and any
               legal source or standard element they cite. Same label with a different
               definition, domain or range is not a match; a different label for the same
               data point is. When the upstream definition is the legal text of a whole
               provision shared with sibling elements, the label names the element and the
               definition only gives its context.
            2. Representation does not change the grade. If both name the same data
               point, the answer is EXACT even when one side is a structured object and
               the other a literal or web link, when units or encodings differ, when one
               side allows text or URL and the other only one of them, or when one side
               adds an optional qualifier such as a test temperature.
               A minor difference in scope does not lower the grade either: a value list
               with one value more or less, a slightly different counting or measuring
               method, or one value versus a list of the same kind of value is still
               EXACT when both name the same data point. Reserve CLOSE for overlapping
               subjects that are different data points.
            3. When both definitions cite the same provision (for example the same annex
               point of a regulation, or the same element of a standard) and describe the
               same quantity, prefer EXACT.
            4. Part of a bundled data point: when the upstream data point legally
               consists of several values (for example a limit that covers both charge and
               discharge power, or a composition that lists cathode, anode and
               electrolyte), each of our terms that carries one of those values is
               NARROW.

            Return NONE for these, however similar the words are
            - Structural grouping: OUR term is a container that bundles many unrelated
              fields (technical specifications, end-of-life information, a section of the
              passport) and the candidate is one field, or the reverse.
            - Serialisation slot: the candidate is a generic slot of a data format (url,
              value, unit, language, value range, bin, bound, recorded time) rather than
              a concept. A media type or content type is a concept, not a slot.
            - Threshold or target versus measured value: a limit, threshold or declared
              target is not the measured or current value.
            - Rated or declared versus measured: a rated or nominal value is not an
              initial, measured, current or remaining one, and an original value is not a
              remaining one.
            - Type versus thing: a category, type or enumeration is not the entity or
              event it classifies.
            - Flag versus list: a yes/no flag for one item is not the list of items.
            - Different referent: an identifier of a product is not the identifier of a
              document about it; a facility is not an organisation; a shipment origin is
              not a treatment site.
            - Different subject area (food, medicine, vehicles, film, software artifacts,
              payments, commercial offers, packaging when ours is the product itself).
            - A class only matches a class; a property or data element matches a property
              or data element.

            When unsure whether a relation exists at all, return NONE. When unsure
            between BROAD and NARROW, re-read rule 4 and which side is the special case.

            confidence is your own 0.0–1.0 certainty in the chosen relation.
            rationale is one sentence citing the deciding factor (definition, legal
            source, domain, range or scope). Do not restate the labels.
            """;

    public static final String SYSTEM = """
            You align terms from the OpenEPCIS DPP-extension ontology to upstream
            vocabularies (GS1 Web Vocabulary, schema.org, SEMICeu Core Vocabularies,
            UN/CEFACT UNTP, DPP Keystone, the EU DPP Registry data model, CIRPASS-2,
            BatteryPass, GS1 Rail). You decide the single best graded-SKOS relation
            between OUR term and ONE upstream candidate term, the way a vocabulary
            curator would before the mapping is published.

            """ + RUBRIC;

    /** System prompt of a blind QA panel judge: the same rubric, a reviewer's framing. */
    public static final String QA_BLIND_SYSTEM = """
            You are a senior reviewer aligning terms from a Digital Product Passport ontology to an
            upstream vocabulary, deciding whether a mapping is published. Decide independently.

            """ + RUBRIC;

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
              domain:    {upDomain}
              range:     {upRange}
            """;

    /** User message of a blind QA panel judge: the lens line, then the pair. */
    public static final String QA_BLIND_USER = "{lens}\n\n" + USER_TEMPLATE;

    /** Fill {@link #QA_BLIND_USER} for the batch path. */
    public static String fillQaUser(String lens, String user) {
        return lens + "\n\n" + user;
    }

    /** Appended when a model is driven directly (no langchain4j structured-output enforcement). */
    public static final String JSON_INSTRUCTION = """

            Respond with ONLY a JSON object, no other text:
            {"relation":"EXACT|CLOSE|BROAD|NARROW|NONE","confidence":0.0,"rationale":"one sentence"}
            """;

    /** Fill {@link #USER_TEMPLATE} the same way langchain4j's @V substitution does (for the benchmark). */
    public static String fillUser(String ourId, String ourType, String ourLabel, String ourComment,
                                  String ourDomain, String ourRange, String upVocab, String upIri,
                                  String upType, String upLabel, String upComment,
                                  String upDomain, String upRange) {
        return USER_TEMPLATE
                .replace("{ourId}", nz(ourId)).replace("{ourType}", nz(ourType))
                .replace("{ourLabel}", nz(ourLabel)).replace("{ourComment}", nz(ourComment))
                .replace("{ourDomain}", nz(ourDomain)).replace("{ourRange}", nz(ourRange))
                .replace("{upVocab}", nz(upVocab)).replace("{upIri}", nz(upIri))
                .replace("{upType}", nz(upType)).replace("{upLabel}", nz(upLabel))
                .replace("{upComment}", nz(upComment))
                .replace("{upDomain}", nz(upDomain)).replace("{upRange}", nz(upRange));
    }

    private static String nz(String s) {
        return s == null ? "(none)" : s;
    }
}
