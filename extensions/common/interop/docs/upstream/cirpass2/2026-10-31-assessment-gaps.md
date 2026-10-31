# Issue for CIRPASS-2/ontologies-docs: assessment data that does not round-trip

Status: filed 2026-10-31 as https://github.com/CIRPASS-2/ontologies-docs/issues/3. Repository: `CIRPASS-2/ontologies-docs` (textile modules);
item 2 also concerns `ontologies-core` (EVENT).

---

**Title:** Textile assessment: six things an exchange partner cannot express (found by a round-trip converter)

**Summary**

We convert Digital Product Passport assessment data between our EPCIS-based vocabulary
(OpenEPCIS DPP-Ready, `common/assessment`, which follows your textile-assessment and
textile-indicator pattern) and the CIRPASS-2 textile ontology 1.1.2, in both directions, with
round-trip tests. Most of the model maps one to one. The points below are what we could not
express in CIRPASS-2 terms and had to carry in generic vocabulary (dcterms, rdf). Each one is a
small addition on your side.

**1. A measurement result does not say which parameter it measures.**
`assessesPerformanceParameter` sits on the `AssessmentExecution`; `MeasurementResult` has no link
to the parameter. An execution that measures several parameters (ISO 15487 grades colour change,
fabric appearance, seam appearance and non-textile parts in one inspection) produces several
results, and a consumer cannot tell which value belongs to which parameter.
*Proposal:* `txt-assessment:measuresParameter` (domain `MeasurementResult`, range
`ObservedPerformanceParameter`), or allow `assessesPerformanceParameter` on results.
*We carry:* `dcterms:subject` on the result.

**2. No link from an assessment execution to the product event that records it.**
`TextileProcessExecution` has `isRepresentedByProductEvent`; assessments do not. A test carried
out on an item is recorded as an EPCIS `ObjectEvent` (`OBSERVE`, `inspecting`), which EVENT 1.0
already references through the GS1 IRIs.
*Proposal:* `isRepresentedByProductEvent` (or an equivalent) with domain `AssessmentExecution`.
*We carry:* `dcterms:relation` to the `eudpp:ProductEvent`.

**3. An assessment condition has no kind and no value.**
`AssessmentCondition` / `TestCondition` have no properties for what the condition is (specimen
fabric type, pre-treatment) or its value (a coded concept or a quantity), although the JRC
robustness scoring selects its threshold tables by fabric type.
*Proposal:* `hasConditionType`, `hasConditionValue` (QuantitativeValue), `hasConditionConcept`.
*We carry:* `dcterms:type`, `rdf:value`, `rdfs:comment`.

**4. Points a scoring method awards per result have no slot.**
`RecyclabilityScoringRule` has `awardsScoreValue` as a rule definition, but a result or criterion
result cannot state the points it earned (spirality 0-3 of the robustness score, one point per
sorting criterion met).
*Proposal:* `awardedScoreValue` (domain `AssessmentResult`, range `QuantitativeValue`).
*We carry:* a `PerformanceIndicator` derived from the result, marked `dcterms:type`.

**5. No overall verdict of an assessment.**
A recyclability assessment cannot state that the product counts as recyclable under the applied
method (as opposed to a label band or a score). Criterion results have outcomes; the assessment
as a whole does not.
*Proposal:* `hasAssessmentOutcome` on `AssessmentResult` or `AssessmentExecution`, using the
existing outcome concepts.
*We carry:* nothing (lost).

**6. An execution has no time.**
Neither `AssessmentExecution` nor its results carry a date or time. Data that does not come with
an EPCIS event cannot say when it was assessed.
*Proposal:* reuse `epcis:eventTime` via the product event (item 2), or add `executionDate`.

**Side notes**

- `RatingValueConcept` and `ThresholdComparisonOperatorConcept`: only the operators have published
  values; rating scales (1-5 grey scale, ISO 15487 grades) have none. We state grades as
  quantities with unit `one`.
- The SI Digital Framework has no percent and no year; percentages travel as `units:one` × 0.01,
  as your modelling notes prescribe for mass fractions, years as UN/CEFACT `ANN`.

**Test material**

The round-trip cases (our documents and documents written in your terms from the module
definitions), the expected outputs and the per-case loss reports will be published with our next
release under `extensions/common/interop/crosswalk/cirpass2/tests/` in
https://github.com/openepcis/openepcis-dpp-ready. Published CIRPASS-2
instance data would let us replace our hand-written inbound cases.
