package io.openepcis.dpp.vocabsync.model;

import java.util.List;

/**
 * One upstream term in the reverse-coverage report: whether any of our terms maps to it, which of
 * ours sits nearest, what the graded pass proposed, and what the advisor recommends. Written to
 * {@code skos-reverse-coverage.json} and rendered as the {@code coverage} sheet of the review
 * workbook, so the field names are a file format.
 *
 * <p>{@code bucket}:
 * <ul>
 *   <li>{@code covered} — at least one of our terms already maps to it (any predicate).</li>
 *   <li>{@code proposed} — the graded pass found a match the TTL lacks (see the decisions sheet).</li>
 *   <li>{@code code-list} — an individual or concept; adopted by value reference, never by SKOS.</li>
 *   <li>{@code epcis-cbv} — an event-model term; EPCIS/CBV carries it by policy.</li>
 *   <li>{@code uncovered} — class or property with no mapping and no accepted match.</li>
 * </ul>
 */
public record CoverageRow(
        String upstreamIri,
        String localName,
        String module,
        String type,
        boolean isNew,
        String bucket,
        String label,
        String definition,
        String nearestOurId,
        double nearestCosine,
        List<String> candidates,
        String coveredBy,
        String proposalOurId,
        String proposalPredicate,
        String proposalTier,
        Double proposalConfidence,
        String adviceAction,
        String adviceModule,
        String adviceProposedName,
        String adviceCounterpart,
        String adviceRationale) {

    public CoverageRow withProposal(String ourId, String predicate, String tier, Double confidence,
                                    String bucketOverride) {
        return new CoverageRow(upstreamIri, localName, module, type, isNew,
                bucketOverride != null ? bucketOverride : bucket, label, definition, nearestOurId,
                nearestCosine, candidates, coveredBy, ourId, predicate, tier, confidence,
                adviceAction, adviceModule, adviceProposedName, adviceCounterpart, adviceRationale);
    }

    public CoverageRow withAdvice(GapAdvice a) {
        if (a == null) return this;
        return new CoverageRow(upstreamIri, localName, module, type, isNew, bucket, label, definition,
                nearestOurId, nearestCosine, candidates, coveredBy, proposalOurId, proposalPredicate,
                proposalTier, proposalConfidence, a.action(), a.module(), a.proposedName(),
                a.counterpart(), a.rationale());
    }
}
