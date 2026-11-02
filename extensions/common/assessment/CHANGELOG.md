# Changelog — common/assessment

All notable changes to the OpenEPCIS assessment and test vocabulary.

## [Unreleased]

### Added

- New module below the DPP core (`oea:`): `oea:Assessment`, `oea:TestExecution`,
  `oea:AssessmentMethod`, `oea:TestMethod`, `oea:AssessmentStandard`, `oea:AssessmentCondition`,
  `oea:ParameterSetting`, `oea:AssessmentResult`, `oea:MeasurementResult`, `oea:CriterionResult`,
  `oea:Criterion` (⊑ `cccev:Criterion`), `oea:Threshold`, `oea:Indicator`, and the value spaces
  `oea:PerformanceParameter`, `oea:MeasurementParameter`, `oea:ConditionType`, `oea:IndicatorKind`,
  `oea:Outcome`, `oea:ComparisonOperator`, after the CIRPASS-2 textile-assessment and
  textile-indicator pattern.
- Cross-sector individuals: protocol parameters (`oea:NumberOfCycles`, `oea:Temperature`,
  `oea:Duration`, `oea:RelativeHumidity`, `oea:Load`), performance parameters
  (`oea:RecyclabilityRate`, `oea:RecoverableRate`, `oea:RecyclingCollectionRate`) and indicator kinds
  (`oea:RecyclabilityScore`, `oea:RepairabilityScore`, `oea:RepairabilityClass`,
  `oea:PerformanceClass`, `oea:ExpectedLifetime`, `oea:TechnicalLifetime`, `oea:NumberOfUseCycles`),
  which replace the flat dpp-core properties of the same meaning.
- Shapes (`validation/assessment-shapes.ttl`), validated with the core shapes in every GITB type.
- EPCIS binding: object form and sensorReport form (`docs/EPCIS_BINDING.md`).
