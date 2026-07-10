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

    @SystemMessage(GraderPrompts.SYSTEM)
    @UserMessage(GraderPrompts.USER_TEMPLATE)
    Verdict grade(@V("ourId") String ourId, @V("ourType") String ourType,
                  @V("ourLabel") String ourLabel, @V("ourComment") String ourComment,
                  @V("ourDomain") String ourDomain, @V("ourRange") String ourRange,
                  @V("upVocab") String upVocab, @V("upIri") String upIri,
                  @V("upType") String upType, @V("upLabel") String upLabel,
                  @V("upComment") String upComment,
                  @V("upDomain") String upDomain, @V("upRange") String upRange);
}
