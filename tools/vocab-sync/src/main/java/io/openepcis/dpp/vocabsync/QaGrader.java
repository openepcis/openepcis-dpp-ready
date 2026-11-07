package io.openepcis.dpp.vocabsync;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import io.openepcis.dpp.vocabsync.model.Verdict;
import io.quarkiverse.langchain4j.ModelName;
import io.quarkiverse.langchain4j.RegisterAiService;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Second-tier QA panel. A model (the {@code qa} config: a local flagship by default) re-judges each
 * mapping the bulk grader proposed, blind: it is not shown the bulk verdict, so it cannot anchor on
 * it. The panel uses the same curator rubric as the grader ({@link GraderPrompts#RUBRIC}); each
 * judge gets a lens line that focuses it, so a panel of lenses gives decorrelated votes.
 */
@RegisterAiService
@ApplicationScoped
@ModelName("qa")
public interface QaGrader {

    @SystemMessage(GraderPrompts.QA_BLIND_SYSTEM)
    @UserMessage(GraderPrompts.QA_BLIND_USER)
    Verdict judgeBlind(@V("lens") String lens, @V("ourId") String ourId, @V("ourType") String ourType,
                       @V("ourLabel") String ourLabel, @V("ourComment") String ourComment,
                       @V("ourDomain") String ourDomain, @V("ourRange") String ourRange,
                       @V("upVocab") String upVocab, @V("upIri") String upIri,
                       @V("upType") String upType, @V("upLabel") String upLabel,
                       @V("upComment") String upComment,
                       @V("upDomain") String upDomain, @V("upRange") String upRange);
}
