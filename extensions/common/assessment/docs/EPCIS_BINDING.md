# EPCIS binding of the assessment model

An assessment carried out on an item is an EPCIS `ObjectEvent` with `action` `OBSERVE` and
`bizStep` `inspecting`. **The event is the execution**: `eventTime` says when, `readPoint` and
`bizLocation` where, the source party (or `oea:hasAssessmentBody`) by whom. Nothing of that is
repeated inside the assessment.

Two serialisations carry the same information. Pick per use case; both validate.

## Object form

The assessment hangs at event level, like every OpenEPCIS observation extension. Use it when
conditions, protocol settings, criteria or derived indicators belong to the record.

```json
{
  "type": "ObjectEvent", "action": "OBSERVE", "bizStep": "inspecting",
  "epcList": ["https://id.gs1.org/01/09521234000013/21/WJ-2025-00301"],
  "readPoint": { "id": "https://id.gs1.org/414/9521234000068" },
  "eutex:hasRobustnessAssessment": {
    "type": "eutex:RobustnessAssessment",
    "oea:hasMethod": { "@id": "eutex:JRCRobustnessScoring" },
    "oea:hasParameterSetting": { "type": "oea:ParameterSetting",
      "oea:hasParameter": { "@id": "oea:NumberOfCycles" },
      "oea:hasParameterValue": { "type": "gs1:QuantitativeValue", "gs1:value": 5, "gs1:unitCode": "C62" } },
    "oea:hasSubAssessment": [ { "type": "oea:TestExecution", "oea:hasMethod": { "@id": "eutex:SpiralityTest" },
      "oea:hasResult": { "type": "oea:MeasurementResult",
        "oea:hasObservedParameter": { "@id": "eutex:Spirality" },
        "oea:hasMeasuredValue": { "type": "gs1:QuantitativeValue", "gs1:value": "4.2", "gs1:unitCode": "P1" } },
      "oea:awardedScore": 3 } ],
    "oea:hasIndicator": { "type": "oea:Indicator", "oea:hasIndicatorKind": { "@id": "eutex:RobustnessScore" },
      "oea:hasIndicatorValue": { "type": "gs1:QuantitativeValue", "gs1:value": 8, "gs1:unitCode": "C62" } }
  }
}
```

Reference: `extensions/eu/textile/epcis/observation-durability.jsonld`.

## sensorReport form

EPCIS 2.0 sensor data carry one test per `sensorElement`. Use it when a test rig or LIMS reports
raw results.

| EPCIS field | Assessment model |
|---|---|
| `sensorMetadata.dataProcessingMethod` | the `oea:TestMethod` individual (full IRI) |
| `sensorMetadata.bizRules` | the standard (catalogue URL of the `oea:AssessmentStandard`) |
| `sensorMetadata.time` | when the test ran, if it differs from `eventTime` |
| `sensorMetadata.deviceID` / `deviceMetadata` | the instrument, a condition of the test |
| `sensorReport.type` | the `oea:PerformanceParameter` IRI the result observes (or an `oea:IndicatorKind` IRI for a reported score) |
| `sensorReport.value` + `uom` | `oea:hasMeasuredValue` (`gs1:value` + `gs1:unitCode`) |
| `sensorReport.minValue` / `maxValue` | the range when the method reports one |
| `sensorReport.stringValue` | a coded or textual result |

```json
"sensorElementList": [ {
  "sensorMetadata": {
    "dataProcessingMethod": "https://ref.openepcis.org/extensions/eu/textile/MartindaleAbrasionTest",
    "bizRules": "https://www.iso.org/standard/75376.html" },
  "sensorReport": [ { "type": "eutex:AbrasionResistance", "value": 40000, "uom": "C62" } ]
} ]
```

Reference: `extensions/eu/textile/epcis/observation-durability-sensor.jsonld` (conformant to the
GS1 EPCIS 2.0 JSON schema and the OpenEPCIS capture rules) and, for a reported indicator,
`extensions/eu/ppwr/epcis/observation-recyclability.jsonld` (`type` `oea:RecyclabilityScore`).

The sensorReport form has no place for criteria, outcomes, protocol settings or derived
indicators. When those matter, use the object form; the two can share one event.

## Declaring the extension

```
GS1-Extensions: oec=https://ref.openepcis.org/extensions/common/core/,oea=https://ref.openepcis.org/extensions/common/assessment/
```

The `dpp-core` context imports the assessment context, so a document that lists the core context
resolves `oea:` without adding a context of its own.
