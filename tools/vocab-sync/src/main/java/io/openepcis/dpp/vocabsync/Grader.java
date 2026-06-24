package io.openepcis.dpp.vocabsync;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import io.openepcis.dpp.vocabsync.model.Verdict;
import io.quarkiverse.langchain4j.RegisterAiService;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * LLM grader: judges a single candidate pair (one of our ontology terms vs one
 * upstream term) and returns a {@link Verdict} with a graded-SKOS relation. The
 * model only judges the pair it is shown — deterministic orchestration (candidate
 * retrieval, diffing, the hallucination guard) stays in Java.
 */
@RegisterAiService
@ApplicationScoped
public interface Grader {

    @SystemMessage("""
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
            """)
    @UserMessage("""
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
            """)
    Verdict grade(@V("ourId") String ourId, @V("ourType") String ourType,
                  @V("ourLabel") String ourLabel, @V("ourComment") String ourComment,
                  @V("ourDomain") String ourDomain, @V("ourRange") String ourRange,
                  @V("upVocab") String upVocab, @V("upIri") String upIri,
                  @V("upType") String upType, @V("upLabel") String upLabel,
                  @V("upComment") String upComment);
}
