# OpenEPCIS Assessment and Test Vocabulary (`common/assessment`)

How a Digital Product Passport states what was measured, tested or assessed about a product:
the assessment that was carried out, the method and standard behind it, the conditions and
protocol settings it ran under, the results it produced, the criteria a result is judged
against, and the indicators (scores, classes, expected lifetimes) derived from those results.

- **Namespace:** `https://ref.openepcis.org/extensions/common/assessment/`
- **Prefix:** `oea:`
- **Version:** 0.10.0 (Preview)
- **Position:** below the DPP core. It imports only the GS1 Web Vocabulary, schema.org and
  CCCEV; `dpp-core` imports it, and its shapes travel with the core shapes in every GITB
  validation type. It is not a validation type of its own.

## Why it exists

Until 0.10.0 the modules stated test outcomes as flat literals (`eutex:abrasionResistance 40000`,
the unit, method and standard only in the property comment). The CIRPASS-2 EU DPP ontologies
model the same facts as an assessment execution that produces results, and both communities need
to read each other's data. This module adopts that pattern once, for every sector:

| Question | Term |
|---|---|
| What was done? | `oea:Assessment`, `oea:TestExecution`, composite schemes via `oea:hasSubAssessment` |
| How? | `oea:hasMethod` → `oea:AssessmentMethod` / `oea:TestMethod`, `oea:isDefinedByStandard` → `oea:AssessmentStandard` |
| Under which conditions? | `oea:hasCondition` → `oea:AssessmentCondition`, `oea:hasParameterSetting` → `oea:ParameterSetting` |
| With which result? | `oea:hasResult` → `oea:MeasurementResult` (`oea:hasObservedParameter`, `oea:hasMeasuredValue` as `gs1:QuantitativeValue`) or `oea:CriterionResult` |
| Judged against what? | `oea:isEvaluatedAgainst` → `oea:Criterion` / `oea:Threshold`, `oea:hasOutcome`, `oea:awardedScore` |
| What does it amount to? | `oea:hasIndicator` → `oea:Indicator` (`oea:hasIndicatorKind`, `oea:hasIndicatorValue`, `oea:hasCategoricalValue`, `oea:isDerivedFrom`) |
| Who and when? | the EPCIS event (eventTime, readPoint, source party); in master data `oea:assessmentDate`, `oea:hasAssessmentBody` |
| Evidence | `oea:hasEvidence` → `gs1:ReferencedFileDetails` (Restricted) |

Parameters, indicator kinds, condition types, methods, standards and criteria are **individuals**,
not classes. Sector modules publish their own (`eutex:AbrasionResistance a oea:PerformanceParameter`,
`eutex:MartindaleAbrasionTest a oea:TestMethod`); data points at them.

## Example (textile durability, master data)

```json
"eutex:hasDurabilityInfo": {
  "type": "eutex:DurabilityInfo",
  "oea:hasSubAssessment": [{
    "type": "oea:TestExecution",
    "oea:hasMethod": { "@id": "eutex:MartindaleAbrasionTest" },
    "oea:hasResult": {
      "type": "oea:MeasurementResult",
      "oea:hasObservedParameter": { "@id": "eutex:AbrasionResistance" },
      "oea:hasMeasuredValue": { "type": "gs1:QuantitativeValue", "gs1:value": 40000, "gs1:unitCode": "C62" }
    }
  }],
  "oea:hasIndicator": {
    "type": "oea:Indicator",
    "oea:hasIndicatorKind": { "@id": "oea:ExpectedLifetime" },
    "oea:hasIndicatorValue": { "type": "gs1:QuantitativeValue", "gs1:value": 8, "gs1:unitCode": "ANN" }
  }
}
```

Full examples: `extensions/eu/textile/examples/garment-product.jsonld` (durability, robustness,
recyclability, repairability, microfibre release), `extensions/eu/textile/epcis/observation-durability.jsonld`
(object form in an event) and `observation-durability-sensor.jsonld` (sensorReport form).

## EPCIS binding

The event is the execution; see [docs/EPCIS_BINDING.md](docs/EPCIS_BINDING.md) for the object form
and the equivalent `sensorElementList` form.

## Conventions

- Every number with a unit is a `gs1:QuantitativeValue` with a UN/CEFACT Rec 20 `unitCode`. A grade
  on the scale the method defines (grey scale 1-5, ISO 15487 grades) and a cycle count use `C62`.
- A score is an indicator, never a result. Component points of a composite score are
  `oea:awardedScore` on the result or sub-assessment.
- Closed lists (`oea:Outcome`, `oea:ComparisonOperator`) are fixed here; open lists
  (`oea:PerformanceParameter`, `oea:IndicatorKind`, `oea:MeasurementParameter`, `oea:ConditionType`)
  grow in the sector modules.

## Status of the migration

0.10.0 moves `common/core` (performance, repairability and recyclability values) and `eu/textile`
(durability, robustness, recyclability, microfibre release) onto this model. Detergent, CPR,
electronics and PPWR follow; battery (performance and durability test values) and iron-steel
(material test certificates) after them. Until then those modules still carry flat test values.

## Alignment

The model follows the CIRPASS-2 `textile-assessment` and `textile-indicator` modules
(`AssessmentExecution`, `MeasurementResult`, `PerformanceThreshold`, `Indicator`). Term-level SKOS
mappings and the executable lift to the CIRPASS-2 graph follow with the CIRPASS-2 alignment work;
see `extensions/common/interop/docs/CIRPASS2_ALIGNMENT.md`.
