package io.openepcis.dpp.vocabsync.model;

/**
 * The advisor's recommendation for an upstream term none of our terms covers.
 *
 * <ul>
 *   <li>{@code MAP} — one of the listed candidates is the same or an overlapping concept after all;
 *       {@code counterpart} names it (the graded pass missed it, or it sat below the cosine gate).</li>
 *   <li>{@code ADOPT} — the concept is missing from our vocabulary and belongs in {@code module}
 *       under {@code proposedName}.</li>
 *   <li>{@code CARRIER} — EPCIS/CBV or a GS1 identifier already carries it; {@code counterpart}
 *       names the construct (an event field, a bizStep, a disposition, an AI).</li>
 *   <li>{@code DEFER} — internal detail of the upstream model no passport exchange needs today.</li>
 *   <li>{@code OUT_OF_SCOPE} — modelling scaffolding or outside a DPP data-exchange vocabulary.</li>
 * </ul>
 */
public record GapAdvice(String action, String module, String proposedName, String counterpart,
                        String rationale) {
}
