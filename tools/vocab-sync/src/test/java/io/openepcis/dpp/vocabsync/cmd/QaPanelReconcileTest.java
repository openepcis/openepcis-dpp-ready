package io.openepcis.dpp.vocabsync.cmd;

import io.openepcis.dpp.vocabsync.model.Verdict;
import io.openepcis.dpp.vocabsync.model.Verdict.Relation;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * The QA-panel two-tier gate ({@link AuditCommand#reconcile}). This is the logic that decides what
 * gets applied, so each tier is pinned: STRONG (panel majority == bulk → write that relation),
 * WEAK (majority is a different non-NONE relation → existence agreed, grade not → closeMatch),
 * REJECT (majority NONE), SPLIT (no strict majority → review, nothing written).
 */
class QaPanelReconcileTest {

    private static Verdict v(Relation r) {
        return new Verdict(r, 0.9, "x");
    }

    @Test
    void strong_majorityMatchesBulk_writesThatRelation() {
        AuditCommand.Recon r = AuditCommand.reconcile(Relation.EXACT,
                List.of(v(Relation.EXACT), v(Relation.EXACT), v(Relation.CLOSE)));
        assertEquals("STRONG", r.tier());
        assertEquals(Relation.EXACT, r.relation());
        assertEquals("skos:exactMatch", r.predicate());
    }

    @Test
    void weak_majorityDiffersButRelationExists_writesCloseMatch() {
        AuditCommand.Recon r = AuditCommand.reconcile(Relation.EXACT,
                List.of(v(Relation.CLOSE), v(Relation.CLOSE), v(Relation.EXACT)));
        assertEquals("WEAK", r.tier());
        assertEquals("skos:closeMatch", r.predicate());
    }

    @Test
    void weak_directionConflict_downgradesToCloseMatch() {
        // bulk says BROAD, panel majority says NARROW: don't assert a wrong direction → closeMatch.
        AuditCommand.Recon r = AuditCommand.reconcile(Relation.BROAD,
                List.of(v(Relation.NARROW), v(Relation.NARROW), v(Relation.BROAD)));
        assertEquals("WEAK", r.tier());
        assertEquals("skos:closeMatch", r.predicate());
    }

    @Test
    void reject_majorityNone_writesNothing() {
        AuditCommand.Recon r = AuditCommand.reconcile(Relation.EXACT,
                List.of(v(Relation.NONE), v(Relation.NONE), v(Relation.EXACT)));
        assertEquals("REJECT", r.tier());
        assertNull(r.predicate());
    }

    @Test
    void split_noStrictMajority_writesNothing() {
        AuditCommand.Recon r = AuditCommand.reconcile(Relation.EXACT,
                List.of(v(Relation.EXACT), v(Relation.CLOSE), v(Relation.NONE)));
        assertEquals("SPLIT", r.tier());
        assertNull(r.predicate());
    }

    @Test
    void singleJudge_actsAsItsOwnMajority() {
        assertEquals("STRONG", AuditCommand.reconcile(Relation.EXACT, List.of(v(Relation.EXACT))).tier());
        assertEquals("REJECT", AuditCommand.reconcile(Relation.EXACT, List.of(v(Relation.NONE))).tier());
    }

    @Test
    void twoJudges_mustBothAgree_elseSplit() {
        assertEquals("STRONG", AuditCommand.reconcile(Relation.EXACT,
                List.of(v(Relation.EXACT), v(Relation.EXACT))).tier());
        assertEquals("SPLIT", AuditCommand.reconcile(Relation.EXACT,
                List.of(v(Relation.EXACT), v(Relation.CLOSE))).tier());
    }
}
