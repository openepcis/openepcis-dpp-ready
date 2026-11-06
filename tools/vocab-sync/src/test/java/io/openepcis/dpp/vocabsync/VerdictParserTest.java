package io.openepcis.dpp.vocabsync;

import io.openepcis.dpp.vocabsync.model.TermType;
import io.openepcis.dpp.vocabsync.model.UpstreamTerm;
import io.openepcis.dpp.vocabsync.model.Verdict.Relation;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** The reply parser of the batch path, and the slot rule that keeps such pairs away from any model. */
class VerdictParserTest {

    @Test
    void plainJson() {
        var v = VerdictParser.parse("{\"relation\":\"EXACT\",\"confidence\":0.9,\"rationale\":\"same data point\"}");
        assertEquals(Relation.EXACT, v.orElseThrow().relation());
        assertEquals(0.9, v.get().confidence());
    }

    @Test
    void fencedAndPrecededByProse_takesTheLastObject() {
        var v = VerdictParser.parse("Draft: {\"relation\":\"CLOSE\"}\n```json\n"
                + "{\"relation\":\"narrow\",\"confidence\":0.7,\"rationale\":\"part of the limit\"}\n```");
        assertEquals(Relation.NARROW, v.orElseThrow().relation());
    }

    @Test
    void unescapedQuoteInRationale_recoversTheRelation() {
        var v = VerdictParser.parse("{\"relation\":\"NONE\",\"confidence\":0.8,\"rationale\":\"a \"threshold\" is not a value\"}");
        assertEquals(Relation.NONE, v.orElseThrow().relation());
        assertEquals(0.8, v.get().confidence());
    }

    @Test
    void noRelation_isEmpty() {
        assertFalse(VerdictParser.parse("I cannot decide.").isPresent());
        assertFalse(VerdictParser.parse(null).isPresent());
    }

    @Test
    void slotTermsAreRecognisedPerVocabulary() {
        assertTrue(PairJudge.isSlot(up("eu-dpp", "url")));
        assertTrue(PairJudge.isSlot(up("gs1", "value")));
        assertFalse(PairJudge.isSlot(up("eu-dpp", "nominalVoltage")));
        assertFalse(PairJudge.isSlot(up("schemaorg", "url")));
    }

    private static UpstreamTerm up(String vocab, String local) {
        return new UpstreamTerm(vocab, "urn:x:" + local, local, local, null, TermType.PROPERTY, "1");
    }
}
