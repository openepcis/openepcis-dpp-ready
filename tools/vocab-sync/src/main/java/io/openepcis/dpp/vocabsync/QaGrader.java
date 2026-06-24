package io.openepcis.dpp.vocabsync;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import io.openepcis.dpp.vocabsync.model.Verdict;
import io.quarkiverse.langchain4j.ModelName;
import io.quarkiverse.langchain4j.RegisterAiService;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Second-tier QA verifier. A stronger model (the {@code qa} config — local flagship by
 * default, or Claude Opus when pointed at Anthropic) independently re-judges a mapping the
 * bulk grader proposed. It is shown the bulk verdict and asked to confirm or correct it, so
 * a wrong-but-confident bulk relation is caught before the finding is reported as confirmed.
 */
@RegisterAiService
@ApplicationScoped
@ModelName("qa")
public interface QaGrader {

    @SystemMessage("""
            You are the senior QA reviewer for cross-vocabulary term alignment in a Digital
            Product Passport ontology. A first-pass grader has proposed a graded-SKOS relation
            between OUR term and ONE upstream term. Independently decide the correct relation;
            do not defer to the first pass.

            Return exactly one relation, judged from OUR term's perspective:
              EXACT  — same concept, interchangeable (skos:exactMatch).
              CLOSE  — strongly overlapping but not identical scope (skos:closeMatch).
              BROAD  — OUR term is BROADER; the upstream term is a narrower special case
                       (skos:broadMatch).
              NARROW — OUR term is NARROWER; the upstream term is more general
                       (skos:narrowMatch).
              NONE   — not the same concept; reject the proposed mapping.

            Be stricter than the first pass. Judge meaning, not name similarity: a shared label
            with a different definition, domain, or range is NONE. A class matches only a class,
            a property only a property. When uncertain between two grades, choose the weaker;
            when uncertain that it is a match at all, return NONE. confidence is your own
            0.0–1.0 certainty. rationale is one sentence naming the deciding factor; if you
            overturn the first pass, say why.
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

            FIRST-PASS PROPOSAL (verify or correct)
              relation:  {bulkRelation}
              rationale: {bulkRationale}
            """)
    Verdict verify(@V("ourId") String ourId, @V("ourType") String ourType,
                   @V("ourLabel") String ourLabel, @V("ourComment") String ourComment,
                   @V("ourDomain") String ourDomain, @V("ourRange") String ourRange,
                   @V("upVocab") String upVocab, @V("upIri") String upIri,
                   @V("upType") String upType, @V("upLabel") String upLabel,
                   @V("upComment") String upComment,
                   @V("bulkRelation") String bulkRelation, @V("bulkRationale") String bulkRationale);
}
