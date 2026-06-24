package io.openepcis.dpp.vocabsync.model;

/**
 * One audited (our term → upstream term) pair the grader judged a real match, classified
 * against the SKOS already in the TTL.
 *
 * <ul>
 *   <li>{@link Status#MISSING} — grader proposes a mapping the TTL does not assert at all.</li>
 *   <li>{@link Status#WEAK} — TTL links the IRI only with {@code rdfs:seeAlso} (ungraded);
 *       grader proposes a specific graded relation.</li>
 *   <li>{@link Status#WRONG} — TTL asserts a graded relation that disagrees with the
 *       grader's (e.g. exactMatch vs broadMatch).</li>
 *   <li>{@link Status#OK} — TTL already asserts the grader's relation.</li>
 * </ul>
 */
public record Finding(
        String module,
        String ourId,
        String ourType,
        String ourIri,
        String vocabId,
        String upstreamIri,
        String upstreamLabel,
        Verdict.Relation relation,
        String proposedPredicate,
        double confidence,
        double cosine,
        String rationale,
        Status status,
        String existingPredicate,
        // QA verifier (second tier); null when QA was not run.
        Verdict.Relation qaRelation,
        Double qaConfidence,
        String qaRationale,
        Boolean confirmed) {

    public enum Status {
        MISSING, WEAK, WRONG, OK
    }

    /** Copy with the QA verdict attached and a confirmed flag set. */
    public Finding withQa(Verdict.Relation qaRel, double qaConf, String qaRat, boolean ok) {
        return new Finding(module, ourId, ourType, ourIri, vocabId, upstreamIri, upstreamLabel,
                relation, proposedPredicate, confidence, cosine, rationale, status, existingPredicate,
                qaRel, qaConf, qaRat, ok);
    }
}
