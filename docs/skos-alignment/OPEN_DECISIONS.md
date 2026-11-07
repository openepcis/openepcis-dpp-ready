# Open mapping decisions from the vocab-sync audits

QA-confirmed findings that were deliberately **not** applied, with the reason. Each is a
judgement call rather than a mechanical correction, so it waits for a curator. Delete an
entry once it is decided, and record the outcome in the module CHANGELOG.

Provenance: `vocab-sync audit` with the bulk grader `gpt-oss-20b` and a three-judge blind
QA panel on `qwen3-32b`. Reports live beside this file as
`skos-completeness-<module>-<date>.{md,json}`.

## electronics (2026-07-28)

### The target is a structural carrier, not a concept

`gs1:value` is the numeric slot inside a `gs1:QuantitativeValue`. The panel confirmed a
`skos:broadMatch` from three display metrics to it, which is defensible in the sense that
a measurement is a kind of value, but it maps a domain concept onto a serialisation
detail. Decide whether such mappings carry their weight at all; if not, the existing
`skos:narrowMatch` should be dropped rather than flipped.

| Our term | Panel says | Currently |
|---|---|---|
| `euelec:hasRefreshRate` | `skos:broadMatch gs1:value` (0.88) | `skos:narrowMatch gs1:value` |
| `euelec:hasScreenDiagonal` | `skos:broadMatch gs1:value` (0.78) | `skos:narrowMatch gs1:value` |
| `euelec:hasPeakBrightness` | `skos:broadMatch gs1:value` (0.78) | no mapping |

### The target is a meta-class

`euelec:EURepairabilityClass` currently asserts `skos:narrowMatch schema:Class`, and the
panel proposes flipping it to `broadMatch` (0.87). `schema:Class` is schema.org's class of
classes, so either direction is a meta-level confusion. The mapping probably belongs
nowhere.

### Type versus entity

Four proposals map one of our enumeration or type terms onto an upstream term that denotes
the thing itself. Upgrading the existing `rdfs:seeAlso` would assert a subsumption between
a category and an entity.

| Our term | Panel says |
|---|---|
| `euelec:ComponentType` | `skos:broadMatch dppk:Component` (0.77) |
| `euelec:RepairCriterionType` | `skos:broadMatch cv:Criterion` (0.71), `untp:Criterion` (0.70) |
| `euelec:RepairCriterion` | `skos:broadMatch schema:Rating` (0.73) |

### Role mismatch or thin evidence

| Our term | Panel says | Concern |
|---|---|---|
| `euelec:nextDisposition` | `skos:exactMatch untp:disposition` (0.81) | `exactMatch` is a strong claim for a WEEE routing decision versus UNTP's general disposition; `closeMatch` may be the honest grade. |
| `euelec:hasTreatmentFacility` | `skos:broadMatch untp:fromFacility` (0.89) | Different roles: ours is where treatment happened, UNTP's is a shipment origin. |
| `euelec:recyclingProcess` | `skos:narrowMatch gs1:packagingRecyclingScheme` (0.92) | Cross-domain: GS1's term is packaging-scoped, ours is electronics treatment. |
| `euelec:collectionMethod` | `skos:narrowMatch bpr separateCollection` (0.71) | Plausible but thin, and it pointed into the battery longlist. Moot since the bpr: mirror shrank to its longlist-only scope; the SAMM URN is the anchor target now. |
| `euelec:modelIdentifier` | `skos:narrowMatch bpr:BatteryModelIdentifier` (0.93), `bpr:UniqueBatteryIdentifier…` (0.91) | Was parked as a cross-module governance call. Moot since the bpr: mirror shrank to its longlist-only scope (the two target IRIs no longer exist); the corresponding skos-deferred.json entries were removed. |

### Duplicate that is documented rather than wrong

`euelec:recyclabilityRate` and `oec:recyclabilityRate` carry the same definition in two
namespaces. The module term already asserts `skos:exactMatch oec:recyclabilityRate`, so the
duplication is recorded, but the layering rule would put a single term in `oec:`. Worth a
consolidation decision; the module's three achieved-rate properties
(`recyclingRate`, `recoveryRate`, `energyRecoveryRate`) are the WEEE Annex V triad and are
genuinely distinct, so they are not part of this question.


<!-- generated: per-module holds and the narrowMatch remainder. Rebuild with `pnpm run skos:decisions`. -->

## assessment

From `skos-completeness-assessment-2026-11-06.json`. 114 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.82 | `oea:hasCategoricalValue` | `skos:exactMatch` | `cirpass2-textile:hasCategoricalValue` | also exactMatch to hasRatingValue in cirpass2-textile: at most one can be the same data point |
| 0.77 | `oea:CriterionResult` | `skos:broadMatch` | `cirpass2-textile:AssessmentResult` | new mapping below the 0.8 floor |
| 0.77 | `oea:hasComparisonOperator` | `skos:exactMatch` | `cirpass2-textile:hasComparisonOperator` | new mapping below the 0.8 floor |
| 0.77 | `oea:hasSubAssessment` | rdfs:seeAlso to `skos:broadMatch` | `other:hasPart` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oea:hasIndicator` | `skos:exactMatch` | `cirpass2-textile:hasIndicator` | new mapping below the 0.8 floor |
| 0.77 | `oea:isEvaluatedAgainst` | `skos:narrowMatch` | `cirpass2-textile:evaluatedAgainstThreshold` | new mapping below the 0.8 floor |
| 0.77 | `oea:indicatorText` | `skos:exactMatch` | `cirpass2-textile:hasTextualValue` | new mapping below the 0.8 floor |
| 0.77 | `oea:hasOutcome` | `skos:narrowMatch` | `cirpass2-textile:hasCriterionOutcome` | new mapping below the 0.8 floor |
| 0.77 | `oea:Assessment` | `skos:narrowMatch` | `cirpass2-textile:RepairabilityAssessment` | new mapping below the 0.8 floor |
| 0.77 | `oea:PerformanceParameter` | `skos:narrowMatch` | `cirpass2-textile:ObservedPerformanceParameter` | new mapping below the 0.8 floor |
| 0.77 | `oea:PerformanceParameter` | `skos:narrowMatch` | `cirpass2-textile:DeformationPerformanceParameter` | new mapping below the 0.8 floor |
| 0.77 | `oea:AssessmentResult` | `skos:narrowMatch` | `cirpass2-textile:MeasurementResult` | new mapping below the 0.8 floor |
| 0.77 | `oea:TestMethod` | `skos:narrowMatch` | `cirpass2-textile:TestMethod` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.77 | `oea:hasDerivationMethod` | `skos:narrowMatch` | `eudpp:computedByMethod` | new mapping below the 0.8 floor |
| 0.77 | `oea:Criterion` | `skos:exactMatch` | `semic:Criterion` | new mapping below the 0.8 floor |
| 0.76 | `oea:Indicator` | `skos:narrowMatch` | `cirpass2-textile:UseRelatedIndicator` | new mapping below the 0.8 floor |
| 0.76 | `oea:Threshold` | `skos:broadMatch` | `semic:Criterion` | new mapping below the 0.8 floor |
| 0.76 | `oea:hasResult` | `skos:exactMatch` | `cirpass2-textile:producesResult` | new mapping below the 0.8 floor |
| 0.75 | `oea:AssessmentStandard` | `skos:narrowMatch` | `eudpp:HarmonisedStandard` | new mapping below the 0.8 floor |
| 0.75 | `oea:CriterionResult` | `skos:narrowMatch` | `cirpass2-textile:RecyclabilityCriterionResult` | new mapping below the 0.8 floor |
| 0.75 | `oea:hasParameterSetting` | `skos:exactMatch` | `cirpass2-textile:hasParameterSetting` | new mapping below the 0.8 floor |
| 0.75 | `oea:PerformanceParameter` | `skos:narrowMatch` | `cirpass2-textile:MechanicalPerformanceParameter` | new mapping below the 0.8 floor |
| 0.75 | `oea:AssessmentResult` | `skos:exactMatch` | `cirpass2-textile:AssessmentResult` | new mapping below the 0.8 floor |
| 0.75 | `oea:AssessmentResult` | `skos:narrowMatch` | `cirpass2-textile:RecycledContentAssessmentResult` | new mapping below the 0.8 floor |
| 0.75 | `oea:AssessmentResult` | `skos:narrowMatch` | `cirpass2-textile:RecoveredMaterialQualityResult` | new mapping below the 0.8 floor |
| 0.74 | `oea:PerformanceParameter` | `skos:narrowMatch` | `cirpass2-textile:SurfacePerformanceParameter` | new mapping below the 0.8 floor |
| 0.73 | `oea:Threshold` | `skos:exactMatch` | `cirpass2-textile:PerformanceThreshold` | new mapping below the 0.8 floor |
| 0.72 | `oea:TestExecution` | `skos:broadMatch` | `cirpass2-textile:AssessmentExecution` | new mapping below the 0.8 floor |
| 0.72 | `oea:PerformanceParameter` | `skos:narrowMatch` | `cirpass2-textile:AssemblyPerformanceParameter` | new mapping below the 0.8 floor |
| 0.72 | `oea:ComparisonOperator` | `skos:exactMatch` | `cirpass2-textile:ThresholdComparisonOperatorConcept` | our term is a type, target is the entity |
| 0.72 | `oea:hasIndicatorValue` | `skos:exactMatch` | `cirpass2-textile:hasQuantitativeValue` | new mapping below the 0.8 floor |
| 0.71 | `oea:PerformanceParameter` | `skos:narrowMatch` | `cirpass2-textile:VisualPerformanceParameter` | new mapping below the 0.8 floor |
| 0.69 | `oea:MeasurementParameter` | `skos:broadMatch` | `cirpass2-textile:AssessmentParameter` | new mapping below the 0.8 floor |
| 0.69 | `oea:hasParameterValue` | `skos:exactMatch` | `cirpass2-textile:hasParameterValue` | new mapping below the 0.8 floor |
| 0.69 | `oea:hasAssessment` | `skos:narrowMatch` | `cirpass2-textile:hasRecyclabilityAssessment` | new mapping below the 0.8 floor |
| 0.69 | `oea:criterionDescription` | `skos:broadMatch` | `schemaorg:description` | new mapping below the 0.8 floor |
| 0.69 | `oea:AssessmentResult` | `skos:narrowMatch` | `cirpass2-textile:RepairabilityAssessmentResult` | new mapping below the 0.8 floor |
| 0.67 | `oea:hasCondition` | `skos:narrowMatch` | `cirpass2-textile:hasRepairCostCondition` | new mapping below the 0.8 floor |
| 0.67 | `oea:assessmentDate` | `skos:exactMatch` | `untp:assessmentDate` | new mapping below the 0.8 floor |
| 0.67 | `oea:Criterion` | `skos:narrowMatch` | `cirpass2-textile:RecyclabilityCriterionConcept` | new mapping below the 0.8 floor |
| 0.67 | `oea:isDerivedFrom` | rdfs:seeAlso to `skos:broadMatch` | `other:source` | seeAlso upgrade below the 0.8 floor |
| 0.67 | `oea:Outcome` | `skos:narrowMatch` | `cirpass2-textile:RecyclabilityOutcomeConcept` | our term is a type, target is the entity |
| 0.67 | `oea:hasAssessment` | `skos:narrowMatch` | `cirpass2-textile:hasRecycledContentAssessment` | new mapping below the 0.8 floor |
| 0.66 | `oea:Threshold` | `skos:narrowMatch` | `eudpp:ThresholdOfSubstanceOfConcern` | new mapping below the 0.8 floor |
| 0.66 | `oea:Threshold` | `skos:narrowMatch` | `cirpass2-textile:TextileTrackingThreshold` | new mapping below the 0.8 floor |
| 0.66 | `oea:MeasurementResult` | `skos:narrowMatch` | `cirpass2-textile:RecyclingYieldResult` | new mapping below the 0.8 floor |
| 0.64 | `oea:Threshold` | `skos:narrowMatch` | `cirpass2-textile:TextileRecyclingAlertThreshold` | new mapping below the 0.8 floor |
| 0.64 | `oea:AssessmentCondition` | `skos:narrowMatch` | `cirpass2-textile:RepairabilityContextCondition` | new mapping below the 0.8 floor |
| 0.64 | `oea:hasCategoricalValue` | `skos:narrowMatch` | `cirpass2-textile:hasRecyclabilityLabel` | new mapping below the 0.8 floor |
| 0.64 | `oea:calculationDescription` | `skos:closeMatch` | `cirpass2-textile:calculationAssumption` | new mapping below the 0.8 floor |
| 0.63 | `oea:hasAssessment` | `skos:narrowMatch` | `cirpass2-textile:hasRepairabilityAssessment` | new mapping below the 0.8 floor |
| 0.63 | `oea:hasIndicator` | `skos:narrowMatch` | `dppk:indicator` | new mapping below the 0.8 floor |
| 0.63 | `oea:AssessmentResult` | `skos:narrowMatch` | `eudpp:LandUseResult` | new mapping below the 0.8 floor |
| 0.63 | `oea:AssessmentResult` | `skos:narrowMatch` | `eudpp:EnvironmentalFootprintScoreResult` | new mapping below the 0.8 floor |
| 0.63 | `oea:TestMethod` | `skos:broadMatch` | `cirpass2-textile:AssessmentMethod` | new mapping below the 0.8 floor |
| 0.63 | `oea:Criterion` | `skos:exactMatch` | `untp:Criterion` | new mapping below the 0.8 floor |
| 0.62 | `oea:AssessmentResult` | `skos:narrowMatch` | `eudpp:InventoryIndicatorResult` | new mapping below the 0.8 floor |
| 0.61 | `oea:Threshold` | `skos:broadMatch` | `untp:Criterion` | new mapping below the 0.8 floor |
| 0.61 | `oea:conditionDescription` | `skos:broadMatch` | `schemaorg:description` | new mapping below the 0.8 floor |
| 0.61 | `oea:AssessmentResult` | `skos:narrowMatch` | `eudpp:EnergyConsumptionResult` | new mapping below the 0.8 floor |
| 0.61 | `oea:AssessmentResult` | `skos:narrowMatch` | `eudpp:RecycledMaterialsUseResult` | new mapping below the 0.8 floor |
| 0.61 | `oea:AssessmentResult` | `skos:narrowMatch` | `eudpp:WaterConsumptionResult` | new mapping below the 0.8 floor |
| 0.61 | `oea:AssessmentResult` | `skos:narrowMatch` | `eudpp:SustainableRenewableMaterialsUseResult` | new mapping below the 0.8 floor |
| 0.61 | `oea:AssessmentMethod` | `skos:narrowMatch` | `cirpass2-textile:RobustnessAssessment` | new mapping below the 0.8 floor |
| 0.61 | `oea:hasObservedParameter` | `skos:broadMatch` | `eu-dpp:observedCharacteristic` | new mapping below the 0.8 floor |
| 0.61 | `oea:AssessmentResult` | `skos:narrowMatch` | `cirpass2-textile:RecyclabilityAssessmentResult` | new mapping below the 0.8 floor |
| 0.60 | `oea:hasMeasuredValue` | `skos:narrowMatch` | `cirpass2-textile:hasRatingValue` | new mapping below the 0.8 floor |
| 0.60 | `oea:hasMeasuredValue` | `skos:narrowMatch` | `cirpass2-textile:hasRecyclingYieldValue` | new mapping below the 0.8 floor |
| 0.60 | `oea:hasCategoricalValue` | `skos:exactMatch` | `cirpass2-textile:hasRatingValue` | new mapping below the 0.8 floor |
| 0.60 | `oea:hasAssessmentBody` | `skos:narrowMatch` | `eudpp:hasNotifiedBody` | new mapping below the 0.8 floor |
| 0.59 | `oea:hasEvidence` | `skos:exactMatch` | `untp:auditableEvidence` | new mapping below the 0.8 floor |
| 0.59 | `oea:AssessmentStandard` | `skos:broadMatch` | `untp:Standard` | new mapping below the 0.8 floor |
| 0.59 | `oea:hasResult` | `skos:broadMatch` | `schemaorg:result` | new mapping below the 0.8 floor |
| 0.59 | `oea:hasResult` | `skos:narrowMatch` | `eudpp:hasInventoryIndicatorResult` | new mapping below the 0.8 floor |
| 0.58 | `oea:Threshold` | rdfs:seeAlso to `skos:broadMatch` | `semic:Constraint` | seeAlso upgrade below the 0.8 floor |
| 0.58 | `oea:hasIndicator` | `skos:narrowMatch` | `eudpp:hasInventoryIndicatorResult` | new mapping below the 0.8 floor |
| 0.58 | `oea:hasThresholdValue` | `skos:narrowMatch` | `batterypass:capacityThresholdForExhaustion` | new mapping below the 0.8 floor |
| 0.58 | `oea:AssessmentMethod` | `skos:narrowMatch` | `cirpass2-textile:ChainOfCustodyVerificationMethod` | new mapping below the 0.8 floor |
| 0.58 | `oea:standardCode` | `skos:narrowMatch` | `dppk:harmonisedStandardReference` | new mapping below the 0.8 floor |
| 0.57 | `oea:Assessment` | `skos:narrowMatch` | `cirpass2-textile:RobustnessAssessment` | new mapping below the 0.8 floor |
| 0.57 | `oea:hasAssessment` | `skos:narrowMatch` | `eudpp:hasLCAStudy` | new mapping below the 0.8 floor |
| 0.57 | `oea:hasMeasuredValue` | `skos:broadMatch` | `dppk:characteristicValue` | new mapping below the 0.8 floor |
| 0.56 | `oea:MeasurementResult` | `skos:narrowMatch` | `eudpp:EnvironmentalFootprintScoreResult` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasCondition` | `skos:narrowMatch` | `cirpass2-textile:hasSparePartAvailabilityCondition` | new mapping below the 0.8 floor |
| 0.55 | `oea:awardedScore` | `skos:closeMatch` | `cirpass2-textile:awardsScoreValue` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasParameterSetting` | `skos:closeMatch` | `cirpass2-textile:isQualifiedByParameterSetting` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasThresholdValue` | `skos:narrowMatch` | `cirpass2-battery:capacityThresholdForExhaustion` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasMeasuredValue` | `skos:narrowMatch` | `cirpass2-textile:hasRecyclableMassFractionValue` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasResult` | `skos:narrowMatch` | `cirpass2-textile:hasRecoveredMaterialQualityResult` | new mapping below the 0.8 floor |
| 0.55 | `oea:calculationDescription` | `skos:closeMatch` | `cirpass2-textile:derivedUsingMethod` | new mapping below the 0.8 floor |
| 0.55 | `oea:calculationDescription` | `skos:broadMatch` | `schemaorg:description` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasObservedParameter` | `skos:closeMatch` | `cirpass2-textile:assessesPerformanceParameter` | new mapping below the 0.8 floor |
| 0.55 | `oea:assessmentDate` | `skos:narrowMatch` | `gs1:certificationAuditDate` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasAssessedParameter` | `skos:closeMatch` | `cirpass2-textile:measuresPerformanceParameter` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasEvidence` | `skos:closeMatch` | `semic:hasSupportingEvidence` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasEvidence` | `skos:exactMatch` | `untp:evidence` | new mapping below the 0.8 floor |
| 0.55 | `oea:AssessmentResult` | rdfs:seeAlso to `skos:closeMatch` | `schemaorg:Observation` | seeAlso upgrade below the 0.8 floor |
| 0.55 | `oea:maxScore` | `skos:closeMatch` | `cirpass2-textile:hasMaximumScoreValue` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasMethod` | `skos:closeMatch` | `cirpass2-textile:derivedUsingMethod` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasDerivationMethod` | `skos:closeMatch` | `cirpass2-textile:appliesMethod` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasDerivationMethod` | `skos:closeMatch` | `dppk:testMethod` | new mapping below the 0.8 floor |
| 0.55 | `oea:hasThresholdParameter` | `skos:closeMatch` | `cirpass2-textile:criterionForPerformanceParameter` | new mapping below the 0.8 floor |
| 0.54 | `oea:hasMethod` | `skos:narrowMatch` | `eudpp:computedByMethod` | new mapping below the 0.8 floor |
| 0.53 | `oea:CriterionResult` | `skos:narrowMatch` | `cirpass2-textile:RecoveredMaterialQualityResult` | new mapping below the 0.8 floor |
| 0.53 | `oea:hasAssessment` | `skos:narrowMatch` | `untp:conformityAssessment` | new mapping below the 0.8 floor |
| 0.53 | `oea:PerformanceParameter` | `skos:narrowMatch` | `cirpass2-textile:PerformanceAfterNCycles` | new mapping below the 0.8 floor |
| 0.53 | `oea:ParameterSetting` | `skos:closeMatch` | `cirpass2-textile:MeasurementParameter` | new mapping below the 0.8 floor |
| 0.53 | `oea:hasDerivationMethod` | `skos:closeMatch` | `schemaorg:measurementMethod` | new mapping below the 0.8 floor |
| 0.53 | `oea:hasObservedParameter` | `skos:closeMatch` | `cirpass2-textile:concernsPerformanceParameter` | new mapping below the 0.8 floor |
| 0.53 | `oea:ParameterSetting` | `skos:closeMatch` | `cirpass2-textile:ProcessParameterSetting` | new mapping below the 0.8 floor |
| 0.52 | `oea:hasConditionValue` | `skos:closeMatch` | `cirpass2-textile:hasParameterValue` | new mapping below the 0.8 floor |
| 0.50 | `oea:MeasurementParameter` | `skos:closeMatch` | `cirpass2-textile:MeasurementParameterSetting` | new mapping below the 0.8 floor |
| 0.50 | `oea:Outcome` | `skos:closeMatch` | `cirpass2-textile:AssessmentResult` | our term is a type, target is the entity |
| 0.50 | `oea:hasMethod` | `skos:closeMatch` | `dppk:testMethod` | new mapping below the 0.8 floor |

## battery

From `skos-completeness-battery-2026-11-06.json`. 258 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.89 | `eubat:cRateLifeCycleTest` | `skos:exactMatch` | `cirpass2-battery:chargeCRateOfCycleLifeTest` | also exactMatch to cRateOfCycleLifeTest in cirpass2-battery: at most one can be the same data point |
| 0.89 | `eubat:batteryModelIdentifier` | skos:broadMatch to `-` | `batterypass:batteryPassportIdentifier` | panel rejects a pair deferred by a curator: Different referents: ours identifies the battery model, theirs identifies the passport document about it. Neither subsumes the other. |
| 0.88 | `eubat:casNumber` | `skos:exactMatch` | `eudpp:casNumber` | exactMatch target shared with eubat:substanceCasNumber: duplicate terms on our side |
| 0.88 | `eubat:ecNumber` | skos:broadMatch to `skos:exactMatch` | `eudpp:ecNumber` | exactMatch target shared with eubat:substanceEcNumber: duplicate terms on our side |
| 0.88 | `eubat:hasCurrentSelfDischargingRate` | `skos:exactMatch` | `batterypass:currentSelfDischargingRate` | also exactMatch to currentSelfDischargingRateValue in batterypass: at most one can be the same data point |
| 0.88 | `eubat:expectedLifetimeYears` | `skos:exactMatch` | `cirpass2-battery:expectedLifetimeCalendarYears` | exactMatch target shared with eubat:hasExpectedLifetime: duplicate terms on our side |
| 0.88 | `eubat:hasEvolutionOfSelfDischarge` | `skos:exactMatch` | `cirpass2-battery:selfDischargeRateEvolution` | also exactMatch to currentSelfDischargeRate in cirpass2-battery: at most one can be the same data point |
| 0.87 | `eubat:hasCarbonFootprintPerformanceClass` | `skos:exactMatch` | `dppk:batteryCarbonFootprintClass` | also exactMatch to carbonFootprintClass in dppk: at most one can be the same data point |
| 0.87 | `eubat:renewableContent` | skos:closeMatch to `skos:exactMatch` | `batterypass:renewableContent` | exactMatch target shared with eubat:renewableContentShare: duplicate terms on our side |
| 0.87 | `eubat:hasNegativeEvents` | skos:closeMatch to `skos:exactMatch` | `batterypass:negativeEvents` | also exactMatch to negativeEvent in batterypass: at most one can be the same data point |
| 0.87 | `eubat:hasRatedMaximumPower` | skos:broadMatch to `skos:exactMatch` | `batterypass:ratedMaximumPower` | deferred by a curator: Direction flip rejected: both sides are the same single rated-maximum-power value. A hierarchy claim overstates in either direction; closeMatch would be the honest grade. |
| 0.86 | `eubat:hasRemainingRoundTripEfficiency` | `skos:exactMatch` | `cirpass2-battery:remainingRoundTripEnergyEfficiency` | exactMatch target shared with eubat:roundTripEnergyEfficiency: duplicate terms on our side |
| 0.86 | `eubat:hasExpectedLifetime` | skos:closeMatch to `skos:exactMatch` | `batterypass:expectedLifetime` | exactMatch target shared with eubat:expectedLifetimeYears: duplicate terms on our side |
| 0.86 | `eubat:hasHazardousSubstances` | skos:broadMatch to `skos:exactMatch` | `batterypass:hazardousSubstances` | deferred by a curator: Direction flip rejected: same-named peers at the same granularity (per-substance entries with class/concentration/location on both sides). Neither hierarchy direction holds; the honest grade would be closeMatch, and flipping broad to narrow just trades one overclaim for the other. |
| 0.85 | `eubat:hasCycleCount` | skos:closeMatch to `skos:exactMatch` | `eu-dpp:numberOfChargingCycles` | regrade skos:closeMatch to skos:exactMatch against an adjudicated EU DPP Registry pair |
| 0.85 | `eubat:hasDismantlingInstructions` | `skos:exactMatch` | `cirpass2-battery:dismantlingInformation` | exactMatch target shared with eubat:hasDismantlingDocuments, eubat:hasDismantlingAndRemovalInformation: duplicate terms on our side |
| 0.85 | `eubat:expectedCycleLife` | `skos:exactMatch` | `eu-dpp:expectedLifetimeCyclesRest` | also exactMatch to expectedLifetimeCycles in eu-dpp: at most one can be the same data point |
| 0.85 | `eubat:hasCurrentSelfDischargingRate` | `skos:exactMatch` | `cirpass2-battery:currentSelfDischargeRate` | exactMatch target shared with eubat:hasEvolutionOfSelfDischarge, eubat:hasSelfDischargeRate: duplicate terms on our side |
| 0.85 | `eubat:hasEnergyThroughput` | skos:closeMatch to `skos:exactMatch` | `batterypass:energyThroughput` | also exactMatch to energyThroughputValue in batterypass: at most one can be the same data point |
| 0.85 | `eubat:dueDiligenceReportUrl` | `skos:exactMatch` | `cirpass2-battery:dueDiligenceReport` | exactMatch target shared with eubat:hasSupplyChainDueDiligence: duplicate terms on our side |
| 0.84 | `eubat:safetyMeasures` | skos:narrowMatch to `skos:exactMatch` | `batterypass:safetyInstructions` | exactMatch target shared with eubat:safetyInstructions: duplicate terms on our side |
| 0.83 | `eubat:hasNegativeEvents` | skos:closeMatch to `skos:exactMatch` | `batterypass:negativeEvent` | also exactMatch to negativeEvents in batterypass: at most one can be the same data point |
| 0.83 | `eubat:hasSelfDischargeRate` | `skos:exactMatch` | `cirpass2-battery:currentSelfDischargeRate` | exactMatch target shared with eubat:hasCurrentSelfDischargingRate, eubat:hasEvolutionOfSelfDischarge: duplicate terms on our side |
| 0.82 | `eubat:hasEvolutionOfSelfDischarge` | skos:narrowMatch to `skos:exactMatch` | `eu-dpp:selfDischargingRate` | regrade skos:narrowMatch to skos:exactMatch against an adjudicated EU DPP Registry pair |
| 0.82 | `eubat:hasDismantlingAndRemovalInformation` | `skos:exactMatch` | `cirpass2-battery:dismantlingInformation` | exactMatch target shared with eubat:hasDismantlingInstructions, eubat:hasDismantlingDocuments: duplicate terms on our side |
| 0.82 | `eubat:cRateLifeCycleTest` | `skos:broadMatch` | `batterypass:cRateLifeCycleTest` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.82 | `eubat:hasExpectedLifetime` | skos:closeMatch to `skos:exactMatch` | `dppk:expectedLifetimeYears` | exactMatch target shared with eubat:expectedLifetimeYears: duplicate terms on our side |
| 0.81 | `eubat:hasDismantlingDocuments` | `skos:exactMatch` | `cirpass2-battery:dismantlingInformation` | exactMatch target shared with eubat:hasDismantlingInstructions, eubat:hasDismantlingAndRemovalInformation: duplicate terms on our side |
| 0.81 | `eubat:hasSelfDischargeRate` | skos:closeMatch to `skos:exactMatch` | `dppk:selfDischargeCurrent` | exactMatch target shared with eubat:hasCurrentSelfDischargingRate, eubat:hasEvolutionOfSelfDischarge: duplicate terms on our side |
| 0.81 | `eubat:declarationOfConformity` | rdfs:seeAlso to `skos:exactMatch` | `batterypass:declarationOfConformity` | exactMatch target shared with eubat:hasEuDeclarationOfConformity: duplicate terms on our side |
| 0.81 | `eubat:ComponentLocation` | `skos:exactMatch` | `batterypass:BatteryLocationEntity` | our term is a type, target is the entity |
| 0.81 | `eubat:dueDiligenceReportUrl` | `skos:exactMatch` | `batterypass:supplyChainDueDiligenceReport` | exactMatch target shared with eubat:hasSupplyChainDueDiligence: duplicate terms on our side |
| 0.80 | `eubat:hasDismantlingInstructions` | rdfs:seeAlso to `skos:exactMatch` | `dppk:dismantlingInformation` | exactMatch target shared with eubat:hasDismantlingDocuments, eubat:hasDismantlingAndRemovalInformation: duplicate terms on our side |
| 0.80 | `eubat:hasDismantlingDocuments` | `skos:exactMatch` | `dppk:dismantlingInformation` | exactMatch target shared with eubat:hasDismantlingInstructions, eubat:hasDismantlingAndRemovalInformation: duplicate terms on our side |
| 0.80 | `eubat:informationOnCollection` | skos:narrowMatch to `skos:exactMatch` | `eu-dpp:takeBackCollectionPoints` | regrade skos:narrowMatch to skos:exactMatch against an adjudicated EU DPP Registry pair |
| 0.80 | `eubat:hasRemainingEnergy` | rdfs:seeAlso to `skos:exactMatch` | `dppk:remainingUsableEnergy` | exactMatch target shared with eubat:hasRemainingUsableEnergy: duplicate terms on our side |
| 0.80 | `eubat:safetyMeasures` | `skos:exactMatch` | `batterypass:safetyMeasures` | also exactMatch to safetyInstructions in batterypass: at most one can be the same data point |
| 0.80 | `eubat:hasCycleCount` | skos:closeMatch to `skos:exactMatch` | `eu-dpp:numberOfDischargingCycles` | regrade skos:closeMatch to skos:exactMatch against an adjudicated EU DPP Registry pair |
| 0.80 | `eubat:hasExpectedLifetime` | `skos:exactMatch` | `cirpass2-battery:expectedLifetimeCalendarYears` | exactMatch target shared with eubat:expectedLifetimeYears: duplicate terms on our side |
| 0.80 | `eubat:hasRemainingPowerCapability` | skos:closeMatch to `skos:exactMatch` | `batterypass:remainingPowerCapability` | also exactMatch to remainingPowerCapabilityValue in batterypass: at most one can be the same data point |
| 0.80 | `eubat:roundTripEnergyEfficiency` | rdfs:seeAlso to `skos:exactMatch` | `dppk:roundTripEfficiencyRemaining` | exactMatch target shared with eubat:hasRemainingRoundTripEfficiency: duplicate terms on our side |
| 0.80 | `eubat:roundTripEnergyEfficiency` | `skos:exactMatch` | `cirpass2-battery:remainingRoundTripEnergyEfficiency` | exactMatch target shared with eubat:hasRemainingRoundTripEfficiency: duplicate terms on our side |
| 0.80 | `eubat:safetyInstructions` | skos:broadMatch to `skos:exactMatch` | `batterypass:safetyInstructions` | exactMatch target shared with eubat:safetyMeasures: duplicate terms on our side |
| 0.80 | `eubat:roundTripEfficiencyAt50PercentCycleLife` | rdfs:seeAlso to `skos:exactMatch` | `dppk:roundTripEfficiencyAt50Cycles` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `eubat:labelMeaning` | skos:closeMatch to `skos:exactMatch` | `batterypass:labelingMeaning` | regrade skos:closeMatch to skos:exactMatch |
| 0.79 | `eubat:hasRemainingPowerCapability` | `skos:exactMatch` | `cirpass2-battery:remainingPowerCapability` | new mapping below the 0.8 floor |
| 0.79 | `eubat:electrolyteType` | `skos:broadMatch` | `dppk:batteryChemistry` | new mapping below the 0.8 floor |
| 0.78 | `eubat:substanceEcNumber` | skos:broadMatch to `skos:exactMatch` | `eudpp:ecNumber` | regrade skos:broadMatch to skos:exactMatch |
| 0.78 | `eubat:hasDismantlingDocuments` | `skos:exactMatch` | `batterypass:dismantlingAndRemovalInformation` | new mapping below the 0.8 floor |
| 0.78 | `eubat:hasDismantlingAndRemovalInformation` | skos:closeMatch to `skos:exactMatch` | `batterypass:dismantlingAndRemovalInformation` | regrade skos:closeMatch to skos:exactMatch |
| 0.78 | `eubat:hasDismantlingAndRemovalInformation` | skos:closeMatch to `skos:exactMatch` | `dppk:dismantlingInformation` | regrade skos:closeMatch to skos:exactMatch |
| 0.77 | `eubat:hasTemperatureRangeStorage` | rdfs:seeAlso to `skos:exactMatch` | `batterypass:temperatureRangeIdleState` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `eubat:hasRecycledContent` | skos:broadMatch to `skos:exactMatch` | `batterypass:recycledContent` | deferred by a curator: Direction flip rejected: the SAMM recycledContent is also per-material with pre/post-consumer shares, so the two blocks share granularity. Neither broad nor narrow holds; closeMatch would be the honest grade. |
| 0.77 | `eubat:hasCurrentSelfDischargingRate` | `skos:exactMatch` | `batterypass:currentSelfDischargingRateValue` | new mapping below the 0.8 floor |
| 0.77 | `eubat:hasMaximumDischargingPower` | `skos:broadMatch` | `cirpass2-battery:maximumPermittedBatteryPower` | new mapping below the 0.8 floor |
| 0.77 | `eubat:substanceCasNumber` | skos:broadMatch to `skos:exactMatch` | `eudpp:casNumber` | regrade skos:broadMatch to skos:exactMatch |
| 0.77 | `eubat:cobaltPostConsumerShare` | skos:closeMatch to `skos:broadMatch` | `batterypass:postConsumerShare` | regrade skos:closeMatch to skos:broadMatch |
| 0.77 | `eubat:ComponentLocation` | `skos:exactMatch` | `cirpass2-battery:BatteryLocation` | our term is a type, target is the entity |
| 0.77 | `eubat:dueDiligenceReportUrl` | skos:closeMatch to `skos:exactMatch` | `dppk:dueDiligenceReport` | regrade skos:closeMatch to skos:exactMatch |
| 0.77 | `eubat:safetyMeasures` | `skos:exactMatch` | `cirpass2-battery:safetyMeasures` | new mapping below the 0.8 floor |
| 0.77 | `eubat:hasEvolutionOfSelfDischarge` | `skos:exactMatch` | `cirpass2-battery:currentSelfDischargeRate` | new mapping below the 0.8 floor |
| 0.75 | `eubat:hasCurrentSelfDischargingRate` | rdfs:seeAlso to `skos:exactMatch` | `dppk:selfDischargeCurrent` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eubat:hasCapacityFade` | `skos:exactMatch` | `batterypass:capacityFadeValue` | new mapping below the 0.8 floor |
| 0.75 | `eubat:roundTripEnergyEfficiency` | `skos:exactMatch` | `batterypass:remainingRoundTripEnergyEfficiency` | new mapping below the 0.8 floor |
| 0.75 | `eubat:lithiumPreConsumerShare` | `skos:broadMatch` | `batterypass:preConsumerShare` | new mapping below the 0.8 floor |
| 0.75 | `eubat:hasRecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:preConsumerRecycledMaterialComposition` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eubat:hasEvolutionOfSelfDischarge` | `skos:exactMatch` | `dppk:selfDischargeCurrent` | new mapping below the 0.8 floor |
| 0.75 | `eubat:hasNegativeEvents` | `skos:narrowMatch` | `dppk:eventsAccidents` | new mapping below the 0.8 floor |
| 0.75 | `eubat:hasMaximumChargingPower` | skos:closeMatch to `skos:broadMatch` | `batterypass:ratedMaximumPower` | regrade skos:closeMatch to skos:broadMatch |
| 0.75 | `eubat:hasMaximumChargingPower` | `skos:broadMatch` | `cirpass2-battery:maximumPermittedBatteryPower` | new mapping below the 0.8 floor |
| 0.75 | `eubat:roundTripEnergyEfficiency` | `skos:exactMatch` | `batterypass:remainingRoundTripEnergyEfficiencyValue` | new mapping below the 0.8 floor |
| 0.75 | `eubat:safetyInstructions` | `skos:exactMatch` | `cirpass2-battery:safetyMeasures` | new mapping below the 0.8 floor |
| 0.74 | `eubat:renewableContentShare` | skos:broadMatch to `skos:exactMatch` | `eu-dpp:renewableContentShare` | regrade skos:broadMatch to skos:exactMatch against an adjudicated EU DPP Registry pair |
| 0.74 | `eubat:TemperatureRange` | `skos:exactMatch` | `batterypass:TemperatureRangeType` | new mapping below the 0.8 floor |
| 0.73 | `eubat:lifetimeReferenceTest` | skos:closeMatch to `skos:exactMatch` | `dppk:referenceTestCycleLife` | regrade skos:closeMatch to skos:exactMatch |
| 0.73 | `eubat:hasRemainingCapacity` | `skos:exactMatch` | `batterypass:remainingCapacityValue` | new mapping below the 0.8 floor |
| 0.73 | `eubat:hasRemainingEnergy` | `skos:exactMatch` | `cirpass2-battery:remainingUsableBatteryEnergy` | new mapping below the 0.8 floor |
| 0.72 | `eubat:BatteryStatus` | `skos:broadMatch` | `eudpp:ProductStatus` | our term is a type, target is the entity |
| 0.72 | `eubat:facilityIdentifier` | `skos:exactMatch` | `eudpp:hasUniqueFacilityIdentifier` | new mapping below the 0.8 floor |
| 0.72 | `eubat:PowerCapabilityAtSoC` | skos:closeMatch to `skos:exactMatch` | `batterypass:PowerCapabilityAtEntity` | regrade skos:closeMatch to skos:exactMatch |
| 0.72 | `eubat:leadPostConsumerShare` | skos:closeMatch to `skos:broadMatch` | `batterypass:postConsumerShare` | regrade skos:closeMatch to skos:broadMatch |
| 0.72 | `eubat:hasPowerCapabilityAt20SoC` | `skos:broadMatch` | `eu-dpp:remainingPowerCapability` | new mapping below the 0.8 floor |
| 0.72 | `eubat:hasStateOfCharge` | rdfs:seeAlso to `skos:exactMatch` | `other:StateOfCharge` | our term is a property, target is a class |
| 0.72 | `eubat:mimeType` | `skos:exactMatch` | `dppk:contentType` | new mapping below the 0.8 floor |
| 0.72 | `eubat:batteryModelIdentifier` | skos:broadMatch to `skos:exactMatch` | `dppk:model` | regrade skos:broadMatch to skos:exactMatch |
| 0.72 | `eubat:labelSymbol` | `skos:exactMatch` | `batterypass:labelingSymbol` | new mapping below the 0.8 floor |
| 0.72 | `eubat:ResponsibleSourcingStandard` | rdfs:seeAlso to `skos:broadMatch` | `untp:Standard` | our term is a type, target is the entity |
| 0.72 | `eubat:hasInternalResistanceIncrease` | `skos:exactMatch` | `batterypass:internalResistanceIncreaseValue` | new mapping below the 0.8 floor |
| 0.72 | `eubat:hasCarbonFootprintDistribution` | `skos:broadMatch` | `batterypass:carbonFootprint` | new mapping below the 0.8 floor |
| 0.72 | `eubat:DismantlingDocument` | skos:narrowMatch to `skos:exactMatch` | `batterypass:DismantlingAndRemovalDocumentation` | regrade skos:narrowMatch to skos:exactMatch |
| 0.71 | `eubat:hasDismantlingInstructions` | skos:broadMatch to `skos:exactMatch` | `batterypass:dismantlingAndRemovalInformation` | deferred by a curator: Direction flip rejected: our term references the dismantling instructions document, the SAMM term is the whole dismantling-and-removal information block (documents plus removal data). Ours is the narrower one, so the existing skos:broadMatch stands. |
| 0.71 | `eubat:leadPreConsumerShare` | skos:closeMatch to `skos:broadMatch` | `batterypass:preConsumerShare` | regrade skos:closeMatch to skos:broadMatch |
| 0.71 | `eubat:spareParts` | `skos:exactMatch` | `dppk:partNumbers` | new mapping below the 0.8 floor |
| 0.71 | `eubat:hasMaximumDischargingPower` | skos:exactMatch to `skos:broadMatch` | `batterypass:ratedMaximumPower` | regrade skos:exactMatch to skos:broadMatch |
| 0.71 | `eubat:hasOperatorInformation` | skos:closeMatch to `skos:exactMatch` | `batterypass:operatorInformation` | regrade skos:closeMatch to skos:exactMatch |
| 0.71 | `eubat:lifetimeReferenceTest` | `skos:exactMatch` | `cirpass2-battery:cycleLifeReferenceTest` | new mapping below the 0.8 floor |
| 0.71 | `eubat:hasStateOfCharge` | `skos:exactMatch` | `batterypass:stateOfChargeValue` | new mapping below the 0.8 floor |
| 0.71 | `eubat:Battery` | skos:closeMatch to `skos:exactMatch` | `dppk:BatteryProduct` | regrade skos:closeMatch to skos:exactMatch |
| 0.71 | `eubat:safetyInstructions` | `skos:exactMatch` | `dppk:safetyMeasures` | new mapping below the 0.8 floor |
| 0.71 | `eubat:hasDismantlingInstructions` | `skos:broadMatch` | `dppk:endOfLifeInstructions` | new mapping below the 0.8 floor |
| 0.71 | `eubat:hasRecycledContent` | `skos:exactMatch` | `cirpass2-textile:hasRecycledContentDeclaration` | new mapping below the 0.8 floor |
| 0.71 | `eubat:hasEvolutionOfSelfDischarge` | `skos:exactMatch` | `batterypass:evolutionOfSelfDischargeValue` | new mapping below the 0.8 floor |
| 0.71 | `eubat:supplyChainIndex` | skos:closeMatch to `skos:exactMatch` | `dppk:supplyChainIndices` | regrade skos:closeMatch to skos:exactMatch |
| 0.71 | `eubat:hasMaximumChargingPower` | rdfs:seeAlso to `skos:broadMatch` | `dppk:powerMaximumPermitted` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `eubat:substanceCasNumber` | `skos:broadMatch` | `eudpp:hasSubstanceIdentifier` | new mapping below the 0.8 floor |
| 0.71 | `eubat:manufacturerIdentifier` | `skos:broadMatch` | `eudpp:hasUniqueOperatorIdentifier` | new mapping below the 0.8 floor |
| 0.70 | `eubat:HazardousSubstance` | skos:broadMatch to `skos:closeMatch` | `eudpp:SubstanceOfConcern` | regrade skos:broadMatch to skos:closeMatch |
| 0.70 | `eubat:BatteryChemistry` | `skos:exactMatch` | `batterypass:BatteryChemistryEntity` | new mapping below the 0.8 floor |
| 0.70 | `eubat:hasPowerCapabilityAt80SoC` | `skos:broadMatch` | `dppk:powerRemaining` | new mapping below the 0.8 floor |
| 0.69 | `eubat:hasPowerCapabilityAt80SoC` | `skos:broadMatch` | `cirpass2-battery:remainingPowerCapability` | new mapping below the 0.8 floor |
| 0.69 | `eubat:hasRemainingUsableEnergy` | `skos:exactMatch` | `batterypass:remainingEnergyValue` | new mapping below the 0.8 floor |
| 0.69 | `eubat:hasSupplyChainDueDiligence` | `skos:exactMatch` | `dppk:dueDiligenceReport` | new mapping below the 0.8 floor |
| 0.69 | `eubat:separateCollectionSymbolUrl` | `skos:broadMatch` | `cirpass2-battery:labelingSymbol` | new mapping below the 0.8 floor |
| 0.69 | `eubat:hasInternalResistance` | rdfs:seeAlso to `skos:exactMatch` | `other:InternalResistance` | our term is a property, target is a class |
| 0.69 | `eubat:hasPowerCapabilityAt20SoC` | `skos:broadMatch` | `dppk:powerRemaining` | new mapping below the 0.8 floor |
| 0.68 | `eubat:hasSupplyChainDueDiligence` | `skos:exactMatch` | `cirpass2-battery:dueDiligenceReport` | new mapping below the 0.8 floor |
| 0.68 | `eubat:hasSupplyChainDueDiligence` | `skos:exactMatch` | `batterypass:supplyChainDueDiligenceReport` | new mapping below the 0.8 floor |
| 0.67 | `eubat:safetyInstructions` | `skos:broadMatch` | `gs1:instructions` | new mapping below the 0.8 floor |
| 0.67 | `eubat:hasTemperatureRangeStorage` | `skos:narrowMatch` | `dppk:temperatureIdleUpper` | new mapping below the 0.8 floor |
| 0.67 | `eubat:operatorIdentifier` | `skos:narrowMatch` | `dppk:eori` | new mapping below the 0.8 floor |
| 0.66 | `eubat:substanceEcNumber` | `skos:broadMatch` | `eudpp:hasSubstanceIdentifier` | new mapping below the 0.8 floor |
| 0.66 | `eubat:wastePrevention` | `skos:exactMatch` | `eu-dpp:endUserRoleInWastePrevention` | new mapping below the 0.8 floor |
| 0.66 | `eubat:hasMaximumTemperature` | skos:closeMatch to `skos:exactMatch` | `batterypass:maximum` | regrade skos:closeMatch to skos:exactMatch |
| 0.66 | `eubat:labelSymbol` | `skos:narrowMatch` | `cirpass2-battery:leadSymbol` | new mapping below the 0.8 floor |
| 0.66 | `eubat:hasTemperatureRangeIdleState` | `skos:narrowMatch` | `dppk:temperatureIdleUpper` | new mapping below the 0.8 floor |
| 0.66 | `eubat:hasCarbonFootprintTotal` | `skos:closeMatch` | `dppk:carbonFootprintAbsolute` | new mapping below the 0.8 floor |
| 0.65 | `eubat:batteryModelIdentifier` | `skos:exactMatch` | `untp:modelNumber` | new mapping below the 0.8 floor |
| 0.65 | `eubat:labelSymbol` | `skos:narrowMatch` | `cirpass2-battery:separateCollectionSymbol` | new mapping below the 0.8 floor |
| 0.65 | `eubat:operatorIdentifier` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:manufacturerInformation` | seeAlso upgrade below the 0.8 floor |
| 0.65 | `eubat:hasManufacturingPlace` | skos:broadMatch to `skos:exactMatch` | `gs1:manufacturingPlant` | regrade skos:broadMatch to skos:exactMatch |
| 0.65 | `eubat:leadRecycledShare` | `skos:broadMatch` | `dppk:recycledContentPercentage` | new mapping below the 0.8 floor |
| 0.65 | `eubat:hasStateOfHealth` | rdfs:seeAlso to `skos:exactMatch` | `other:StateOfHealth` | our term is a property, target is a class |
| 0.65 | `eubat:hasSelfDischargeRate` | `skos:exactMatch` | `batterypass:evolutionOfSelfDischargeValue` | new mapping below the 0.8 floor |
| 0.64 | `eubat:concentration` | `skos:exactMatch` | `eudpp:hasConcentration` | new mapping below the 0.8 floor |
| 0.64 | `eubat:safetyInstructionsForDismantling` | rdfs:seeAlso to `skos:broadMatch` | `dppk:endOfLifeInstructions` | seeAlso upgrade below the 0.8 floor |
| 0.64 | `eubat:hasTemperatureRangeStorage` | `skos:narrowMatch` | `dppk:temperatureIdleLower` | new mapping below the 0.8 floor |
| 0.64 | `eubat:separateCollectionSymbolUrl` | `skos:exactMatch` | `eu-dpp:separateCollectionSymbol` | new mapping below the 0.8 floor |
| 0.64 | `eubat:hasInternalResistance` | skos:broadMatch to `skos:narrowMatch` | `batterypass:ohmicResistance` | direction flip toward a peer profile below the 0.8 floor |
| 0.64 | `eubat:hasSupplierContact` | `skos:broadMatch` | `schemaorg:contactPoints` | schema:contactPoints is superseded by schema:contactPoint |
| 0.64 | `eubat:hasNotifiedBody` | `skos:exactMatch` | `eudpp:conformityAttestedBy` | new mapping below the 0.8 floor |
| 0.64 | `eubat:hasTemperatureRangeIdleState` | `skos:exactMatch` | `eu-dpp:notInUseTemperatureRangeTest` | new mapping below the 0.8 floor |
| 0.63 | `eubat:timeSpentInExtremeTemperaturesAboveBoundary` | `skos:narrowMatch` | `dppk:timeChargingTempUpper` | new mapping below the 0.8 floor |
| 0.63 | `eubat:hasInternalResistance` | skos:closeMatch to `skos:exactMatch` | `eu-dpp:ohmicResistance` | regrade skos:closeMatch to skos:exactMatch against an adjudicated EU DPP Registry pair |
| 0.63 | `eubat:hazardImpact` | skos:closeMatch to `skos:exactMatch` | `dppk:hazardousSubstancesImpact` | regrade skos:closeMatch to skos:exactMatch |
| 0.63 | `eubat:hasTemperatureRangeIdleState` | `skos:narrowMatch` | `cirpass2-battery:temperatureRangeIdleStateUpperBoundary` | new mapping below the 0.8 floor |
| 0.62 | `eubat:hasExpectedLifetime` | `skos:closeMatch` | `batterypass:expectedNumberOfCycles` | new mapping below the 0.8 floor |
| 0.62 | `eubat:hasInternalResistance` | `skos:narrowMatch` | `dppk:internalResistanceDynamic` | new mapping below the 0.8 floor |
| 0.62 | `eubat:lithiumRecycledShare` | `skos:broadMatch` | `dppk:recycledContentPercentage` | new mapping below the 0.8 floor |
| 0.62 | `eubat:hasExpectedLifetime` | `skos:closeMatch` | `eu-dpp:expectedLifetimeCycles` | new mapping below the 0.8 floor |
| 0.61 | `eubat:hasExpectedLifetime` | `skos:closeMatch` | `dppk:expectedLifetimeCycles` | new mapping below the 0.8 floor |
| 0.61 | `eubat:criticalRawMaterialsStatement` | `skos:exactMatch` | `dppk:criticalRawMaterials` | new mapping below the 0.8 floor |
| 0.61 | `eubat:hasExpectedLifetime` | `skos:closeMatch` | `cirpass2-battery:expectedLifetimeCycles` | new mapping below the 0.8 floor |
| 0.61 | `eubat:manufacturerIdentifier` | `skos:broadMatch` | `batterypass:operatorInformation` | new mapping below the 0.8 floor |
| 0.61 | `eubat:expectedLifetimeYears` | `skos:closeMatch` | `cirpass2-battery:expectedLifetimeCycles` | new mapping below the 0.8 floor |
| 0.61 | `eubat:hasBatteryChemistry` | skos:broadMatch to `skos:closeMatch` | `batterypass:batteryMaterials` | regrade skos:broadMatch to skos:closeMatch |
| 0.61 | `eubat:hasInternalResistance` | `skos:narrowMatch` | `cirpass2-battery:initialPackInternalResistance` | new mapping below the 0.8 floor |
| 0.61 | `eubat:hasInitialPackInternalResistance` | `skos:broadMatch` | `dppk:internalResistanceOhmic` | new mapping below the 0.8 floor |
| 0.61 | `eubat:hasPowerCapabilityAt80SoC` | `skos:broadMatch` | `batterypass:remainingPowerCapabilityValue` | new mapping below the 0.8 floor |
| 0.61 | `eubat:hasInitialCapacity` | `skos:broadMatch` | `other:Capacity` | our term is a property, target is a class |
| 0.61 | `eubat:hasRemainingPowerCapability` | `skos:exactMatch` | `batterypass:remainingPowerCapabilityValue` | new mapping below the 0.8 floor |
| 0.61 | `eubat:nickelPostConsumerShare` | rdfs:seeAlso to `skos:broadMatch` | `dppk:recycledContentPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.61 | `eubat:hasTemperatureRangeIdleState` | `skos:narrowMatch` | `cirpass2-battery:temperatureRangeIdleStateLowerBoundary` | new mapping below the 0.8 floor |
| 0.60 | `eubat:hasTemperatureRangeStorage` | `skos:narrowMatch` | `cirpass2-battery:temperatureRangeIdleStateUpperBoundary` | new mapping below the 0.8 floor |
| 0.60 | `eubat:timeSpentChargingDuringExtremeTemperaturesBelowBoundary` | `skos:broadMatch` | `dppk:timeExtremeTempLower` | new mapping below the 0.8 floor |
| 0.60 | `eubat:hasMinimumTemperature` | `skos:narrowMatch` | `cirpass2-battery:temperatureRangeIdleStateLowerBoundary` | new mapping below the 0.8 floor |
| 0.60 | `eubat:hasMinimumTemperature` | `skos:narrowMatch` | `dppk:temperatureIdleLower` | new mapping below the 0.8 floor |
| 0.60 | `eubat:timeSpentInExtremeTemperaturesBelowBoundary` | `skos:narrowMatch` | `cirpass2-battery:timeSpentChargingInExtremeTemperaturesBelowBoundary` | new mapping below the 0.8 floor |
| 0.60 | `eubat:timeSpentInExtremeTemperaturesBelowBoundary` | `skos:narrowMatch` | `dppk:timeChargingTempLower` | new mapping below the 0.8 floor |
| 0.60 | `eubat:hasInternalResistance` | `skos:narrowMatch` | `dppk:internalResistanceOhmic` | new mapping below the 0.8 floor |
| 0.60 | `eubat:hasInternalResistance` | `skos:exactMatch` | `dppk:internalResistance` | new mapping below the 0.8 floor |
| 0.60 | `eubat:hasPowerCapabilityAt20SoC` | `skos:broadMatch` | `batterypass:remainingPowerCapabilityValue` | new mapping below the 0.8 floor |
| 0.60 | `eubat:languageCode` | skos:broadMatch to `skos:exactMatch` | `schemaorg:inLanguage` | regrade skos:broadMatch to skos:exactMatch |
| 0.60 | `eubat:hasStateOfCertifiedEnergy` | `skos:closeMatch` | `cirpass2-battery:remainingUsableBatteryEnergy` | new mapping below the 0.8 floor |
| 0.60 | `eubat:hasMaterialComposition` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:material` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.60 | `eubat:hasStateOfHealth` | `skos:closeMatch` | `batterypass:stateOfCertifiedEnergy` | new mapping below the 0.8 floor |
| 0.60 | `eubat:timeSpentChargingDuringExtremeTemperaturesAboveBoundary` | `skos:broadMatch` | `batterypass:timeExtremeHighTemp` | new mapping below the 0.8 floor |
| 0.60 | `eubat:expectedLifetimeYears` | `skos:closeMatch` | `eu-dpp:expectedLifetimeCycles` | new mapping below the 0.8 floor |
| 0.60 | `eubat:expectedLifetimeYears` | `skos:broadMatch` | `dppk:lifetime` | new mapping below the 0.8 floor |
| 0.60 | `eubat:dataProviderCertification` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:hasCertification` | seeAlso upgrade below the 0.8 floor |
| 0.59 | `eubat:separateCollectionSymbolUrl` | `skos:broadMatch` | `batterypass:labels` | new mapping below the 0.8 floor |
| 0.59 | `eubat:measurementCertificateUrl` | skos:closeMatch to `skos:broadMatch` | `gs1:certificationInfo` | regrade skos:closeMatch to skos:broadMatch |
| 0.59 | `eubat:cobaltPostConsumerShare` | rdfs:seeAlso to `skos:broadMatch` | `dppk:recycledContentPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.59 | `eubat:cobaltRecycledShare` | `skos:broadMatch` | `schemaorg:recycledContentPercentage` | schema:recycledContentPercentage is not in the checked schema.org release (pending) |
| 0.58 | `eubat:hasExpectedLifetime` | `skos:closeMatch` | `eu-dpp:expectedLifetimeCyclesRest` | new mapping below the 0.8 floor |
| 0.58 | `eubat:lithiumRecycledShare` | `skos:broadMatch` | `schemaorg:recycledContentPercentage` | schema:recycledContentPercentage is not in the checked schema.org release (pending) |
| 0.58 | `eubat:hasTemperatureRangeStorage` | `skos:narrowMatch` | `cirpass2-battery:temperatureRangeIdleStateLowerBoundary` | new mapping below the 0.8 floor |
| 0.58 | `eubat:hasRecycledContent` | `skos:narrowMatch` | `dppk:recycledContentPercentage` | new mapping below the 0.8 floor |
| 0.58 | `eubat:hasInitialCellInternalResistance` | `skos:broadMatch` | `dppk:internalResistance` | new mapping below the 0.8 floor |
| 0.58 | `eubat:dueDiligencePolicyUrl` | `skos:broadMatch` | `batterypass:supplyChainDueDiligenceReport` | new mapping below the 0.8 floor |
| 0.58 | `eubat:hasComponentLocation` | `skos:narrowMatch` | `batterypass:hazardousSubstanceLocation` | new mapping below the 0.8 floor |
| 0.58 | `eubat:hasInitialPackInternalResistance` | `skos:broadMatch` | `dppk:internalResistance` | new mapping below the 0.8 floor |
| 0.58 | `eubat:hasStateOfHealth` | `skos:closeMatch` | `cirpass2-battery:stateOfCertifiedEnergy` | new mapping below the 0.8 floor |
| 0.58 | `eubat:labelSymbol` | `skos:narrowMatch` | `dppk:separateCollectionSymbol` | new mapping below the 0.8 floor |
| 0.57 | `eubat:expectedCycleLife` | `skos:closeMatch` | `batterypass:expectedLifetime` | new mapping below the 0.8 floor |
| 0.57 | `eubat:expectedCycleLife` | `skos:closeMatch` | `dppk:expectedLifetimeYears` | new mapping below the 0.8 floor |
| 0.57 | `eubat:hasRemainingCapacity` | `skos:closeMatch` | `dppk:remainingUsableEnergy` | new mapping below the 0.8 floor |
| 0.57 | `eubat:leadRecycledShare` | `skos:closeMatch` | `dppk:postConsumerRecycledMaterialComposition` | new mapping below the 0.8 floor |
| 0.57 | `eubat:expectedLifetimeYears` | `skos:closeMatch` | `dppk:expectedLifetimeCycles` | new mapping below the 0.8 floor |
| 0.57 | `eubat:expectedLifetimeYears` | `skos:closeMatch` | `batterypass:expectedNumberOfCycles` | new mapping below the 0.8 floor |
| 0.57 | `eubat:notifiedBodyName` | `skos:broadMatch` | `dppk:certificationBodyName` | new mapping below the 0.8 floor |
| 0.57 | `eubat:hasCarbonFootprintTotal` | `skos:closeMatch` | `batterypass:absoluteCarbonFootprint` | new mapping below the 0.8 floor |
| 0.57 | `eubat:lithiumRecycledShare` | `skos:closeMatch` | `dppk:preConsumerRecycledMaterialComposition` | new mapping below the 0.8 floor |
| 0.57 | `eubat:hasRecycledContent` | `skos:narrowMatch` | `eudpp:materialRecycledContent` | new mapping below the 0.8 floor |
| 0.57 | `eubat:hasRemainingEnergy` | `skos:closeMatch` | `batterypass:stateOfCertifiedEnergy` | new mapping below the 0.8 floor |
| 0.57 | `eubat:hasInitialCellInternalResistance` | `skos:broadMatch` | `dppk:internalResistanceOhmic` | new mapping below the 0.8 floor |
| 0.57 | `eubat:hasRemainingUsableEnergy` | `skos:closeMatch` | `cirpass2-battery:stateOfCertifiedEnergy` | new mapping below the 0.8 floor |
| 0.57 | `eubat:hasRemainingUsableEnergy` | `skos:closeMatch` | `batterypass:stateOfCertifiedEnergy` | new mapping below the 0.8 floor |
| 0.55 | `eubat:safetyInstructionsForDismantling` | skos:broadMatch to `skos:closeMatch` | `dppk:dismantlingInformation` | regrade skos:broadMatch to skos:closeMatch |
| 0.55 | `eubat:safetyInstructionsForDismantling` | `skos:closeMatch` | `dppk:disassemblyInstructions` | new mapping below the 0.8 floor |
| 0.55 | `eubat:hasSubstanceLocation` | `skos:closeMatch` | `cirpass2-battery:hasBatteryLocation` | new mapping below the 0.8 floor |
| 0.55 | `eubat:cathodeActiveMaterial` | skos:closeMatch to `skos:broadMatch` | `eu-dpp:batteryChemistry` | regrade skos:closeMatch to skos:broadMatch against an adjudicated EU DPP Registry pair |
| 0.55 | `eubat:hasDismantlingInstructions` | `skos:closeMatch` | `dppk:repairInstructions` | new mapping below the 0.8 floor |
| 0.55 | `eubat:verificationStandard` | rdfs:seeAlso to `skos:closeMatch` | `gs1:certificationStandard` | seeAlso upgrade below the 0.8 floor |
| 0.55 | `eubat:NegativeEvent` | `skos:closeMatch` | `dppk:NegativeEventsInfo` | new mapping below the 0.8 floor |
| 0.55 | `eubat:hasAbsoluteCarbonFootprint` | `skos:closeMatch` | `batterypass:batteryCarbonFootprint` | new mapping below the 0.8 floor |
| 0.55 | `eubat:warrantyConditions` | `skos:broadMatch` | `gs1:manufacturersWarranty` | new mapping below the 0.8 floor |
| 0.55 | `eubat:TechnicalSpecification` | skos:broadMatch to `skos:closeMatch` | `batterypass:BatteryTechnicalPropertiesEntity` | regrade skos:broadMatch to skos:closeMatch |
| 0.55 | `eubat:hasStateOfCertifiedEnergy` | `skos:closeMatch` | `dppk:remainingUsableEnergy` | new mapping below the 0.8 floor |
| 0.55 | `eubat:cRate` | `skos:closeMatch` | `batterypass:cRateLifeCycleTest` | new mapping below the 0.8 floor |
| 0.55 | `eubat:verificationBodyName` | `skos:closeMatch` | `dppk:certificationBodyName` | new mapping below the 0.8 floor |
| 0.55 | `eubat:hasComponentLocation` | `skos:closeMatch` | `eudpp:substanceLocationDescription` | new mapping below the 0.8 floor |
| 0.55 | `eubat:substanceCasNumber` | `skos:broadMatch` | `dppk:componentCasNumber` | new mapping below the 0.8 floor |
| 0.55 | `eubat:timeSpentChargingDuringExtremeTemperaturesAboveBoundary` | `skos:broadMatch` | `dppk:timeExtremeTempUpper` | new mapping below the 0.8 floor |
| 0.55 | `eubat:verificationDate` | rdfs:seeAlso to `skos:closeMatch` | `schemaorg:auditDate` | seeAlso upgrade below the 0.8 floor |
| 0.55 | `eubat:TemperatureRange` | `skos:exactMatch` | `batterypass:TemperatureConditionsEntity` | new mapping below the 0.8 floor |
| 0.55 | `eubat:expectedLifetimeYears` | `skos:closeMatch` | `eu-dpp:expectedLifetimeCyclesRest` | new mapping below the 0.8 floor |
| 0.55 | `eubat:hasRemainingUsableEnergy` | `skos:closeMatch` | `eu-dpp:stateOfCertifiedEnergy` | new mapping below the 0.8 floor |
| 0.55 | `eubat:renewableContentShare` | `skos:closeMatch` | `eudpp:materialIsSustainableRenewable` | new mapping below the 0.8 floor |
| 0.55 | `eubat:hasSupplyChainDueDiligence` | `skos:narrowMatch` | `cirpass2-battery:dueDiligenceAudit` | new mapping below the 0.8 floor |
| 0.55 | `eubat:hasCarbonFootprintDeclaration` | `skos:closeMatch` | `dppk:carbonFootprintLabel` | new mapping below the 0.8 floor |
| 0.55 | `eubat:hasInternalResistanceIncrease` | `skos:closeMatch` | `eu-dpp:internalResistance` | new mapping below the 0.8 floor |
| 0.53 | `eubat:warrantyConditions` | `skos:closeMatch` | `gs1:warrantyScopeDescription` | new mapping below the 0.8 floor |
| 0.53 | `eubat:hasOperatorInformation` | `skos:closeMatch` | `dppk:economicOperator` | new mapping below the 0.8 floor |
| 0.53 | `eubat:hasSupplierContact` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:emailAddressOfSupplier` | seeAlso upgrade below the 0.8 floor |
| 0.53 | `eubat:hasMaximumTemperature` | `skos:narrowMatch` | `cirpass2-battery:temperatureRangeIdleStateUpperBoundary` | new mapping below the 0.8 floor |
| 0.53 | `eubat:manufacturerIdentifier` | `skos:closeMatch` | `eu-dpp:manufacturerIdentification` | new mapping below the 0.8 floor |
| 0.53 | `eubat:exposureDurationMinutes` | `skos:narrowMatch` | `dppk:timeExtremeTempLower` | new mapping below the 0.8 floor |
| 0.53 | `eubat:safetyInstructions` | `skos:closeMatch` | `dppk:safeUseInstructions` | new mapping below the 0.8 floor |
| 0.53 | `eubat:safetyInstructions` | rdfs:seeAlso to `skos:closeMatch` | `gs1:consumerSafetyInformation` | seeAlso upgrade below the 0.8 floor |
| 0.53 | `eubat:hasRecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:preConsumerRecycledContentMass` | seeAlso upgrade below the 0.8 floor |
| 0.53 | `eubat:authorizedServiceCenters` | `skos:closeMatch` | `dppk:repairService` | new mapping below the 0.8 floor |
| 0.53 | `eubat:hasExpectedLifetimeCapacityThroughput` | `skos:closeMatch` | `cirpass2-battery:expectedLifetimeCycles` | new mapping below the 0.8 floor |
| 0.53 | `eubat:hasExpectedLifetimeCapacityThroughput` | `skos:closeMatch` | `dppk:expectedLifetimeCycles` | new mapping below the 0.8 floor |
| 0.53 | `eubat:hasHazardousSubstances` | `skos:closeMatch` | `dppk:hazardousSubstancesImpact` | new mapping below the 0.8 floor |
| 0.53 | `eubat:separateCollection` | `skos:closeMatch` | `cirpass2-battery:separateCollectionSymbol` | new mapping below the 0.8 floor |
| 0.53 | `eubat:separateCollection` | rdfs:seeAlso to `skos:closeMatch` | `dppk:separateCollectionSymbol` | seeAlso upgrade below the 0.8 floor |
| 0.53 | `eubat:separateCollection` | `skos:closeMatch` | `eu-dpp:endUserRoleInSeparateCollection` | new mapping below the 0.8 floor |
| 0.53 | `eubat:hasMaximumVoltage` | `skos:broadMatch` | `dppk:voltage` | new mapping below the 0.8 floor |
| 0.53 | `eubat:CarbonFootprintDeclaration` | skos:narrowMatch to `skos:closeMatch` | `eudpp:CarbonFootprint` | regrade skos:narrowMatch to skos:closeMatch |
| 0.53 | `eubat:hasCarbonFootprintDeclaration` | `skos:narrowMatch` | `dppk:carbonFootprintAbsolute` | new mapping below the 0.8 floor |
| 0.53 | `eubat:safetyInstructions` | `skos:closeMatch` | `dppk:safetyDataSheet` | new mapping below the 0.8 floor |
| 0.52 | `eubat:NegativeEvent` | `skos:broadMatch` | `untp:LifecycleEvent` | new mapping below the 0.8 floor |
| 0.52 | `eubat:hasOperatorInformation` | skos:narrowMatch to `skos:closeMatch` | `eu-dpp:registrantIdentity` | regrade skos:narrowMatch to skos:closeMatch against an adjudicated EU DPP Registry pair |
| 0.50 | `eubat:informationOnCollection` | `skos:closeMatch` | `batterypass:separateCollection` | new mapping below the 0.8 floor |
| 0.50 | `eubat:informationOnCollection` | `skos:closeMatch` | `eu-dpp:endUserRoleInSeparateCollection` | new mapping below the 0.8 floor |
| 0.50 | `eubat:hasExpectedLifetimeCapacityThroughput` | `skos:closeMatch` | `eu-dpp:expectedLifetimeCycles` | new mapping below the 0.8 floor |
| 0.50 | `eubat:batteryModelIdentifier` | `skos:closeMatch` | `eu-dpp:productNumber` | new mapping below the 0.8 floor |
| 0.50 | `eubat:hasComplianceStatus` | `skos:closeMatch` | `eudpp:referenceToComplianceStatus` | new mapping below the 0.8 floor |

## carrier

No held findings: everything the panel confirmed was either applied or filtered as out of scope.

## core

From `skos-completeness-core-2026-11-06.json`. 224 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.86 | `oec:GranularityLevel` | `skos:exactMatch` | `dppk:GranularityValue` | our term is a type, target is the entity |
| 0.82 | `oec:ActorRole` | rdfs:seeAlso to `skos:narrowMatch` | `eudpp:EconomicOperatorRole` | our term is a type, target is the entity |
| 0.82 | `oec:DigitalProductPassport` | `skos:exactMatch` | `schemaorg:DigitalProductPassport` | schema:DigitalProductPassport is not in the checked schema.org release (pending) |
| 0.81 | `oec:GranularityLevel` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:ProductIdentifierGranularity` | our term is a type, target is the entity |
| 0.80 | `oec:AccessLevel` | `skos:exactMatch` | `dppk:VisibilityValue` | our term is a type, target is the entity |
| 0.80 | `oec:ActorRole` | `skos:narrowMatch` | `eudpp:AuthorityRole` | our term is a type, target is the entity |
| 0.80 | `oec:recycledContent` | `skos:exactMatch` | `schemaorg:recycledContentPercentage` | schema:recycledContentPercentage is not in the checked schema.org release (pending) |
| 0.80 | `oec:hasSubstancesOfConcern` | `skos:exactMatch` | `schemaorg:substanceOfConcern` | schema:substanceOfConcern is not in the checked schema.org release (pending) |
| 0.80 | `oec:OperatorRole` | rdfs:seeAlso to `skos:narrowMatch` | `eudpp:EconomicOperatorRole` | our term is a type, target is the entity |
| 0.78 | `oec:remanufacturingDate` | skos:narrowMatch to `skos:exactMatch` | `rail:itemReconditioningDate` | regrade skos:narrowMatch to skos:exactMatch |
| 0.77 | `oec:hasProductCategory` | `skos:exactMatch` | `eudpp:hasProductGroup` | new mapping below the 0.8 floor |
| 0.77 | `oec:economicOperatorId` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:hasUniqueOperatorIdentifier` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:LifecycleStageResult` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:LCAModuleValue` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:hasRepairProvider` | `skos:exactMatch` | `dppk:repairService` | new mapping below the 0.8 floor |
| 0.77 | `oec:hasDocuments` | `skos:exactMatch` | `dppk:documents` | new mapping below the 0.8 floor |
| 0.77 | `oec:DepositReturnScheme` | `skos:broadMatch` | `gs1:ReturnablePackageDepositDetails` | our term is a type, target is the entity |
| 0.77 | `oec:hasOperatorInformation` | `skos:exactMatch` | `eudpp:hasEconomicOperator` | new mapping below the 0.8 floor |
| 0.77 | `oec:hasRepairInstructions` | `skos:narrowMatch` | `dppk:textileRepairInstructions` | new mapping below the 0.8 floor |
| 0.77 | `oec:DPPGranularity` | `skos:exactMatch` | `dppk:GranularityValue` | our term is a type, target is the entity |
| 0.77 | `oec:wastePreventionInfo` | `skos:exactMatch` | `batterypass:wastePrevention` | new mapping below the 0.8 floor |
| 0.75 | `oec:hasConformityDeclaration` | `skos:exactMatch` | `dppk:euDeclarationOfConformity` | new mapping below the 0.8 floor |
| 0.75 | `oec:carbonFootprintStudyUrl` | `skos:exactMatch` | `dppk:carbonFootprintStudy` | new mapping below the 0.8 floor |
| 0.75 | `oec:EnvironmentalProductDeclaration` | `skos:exactMatch` | `schemaorg:EnvironmentalProductDeclaration` | schema:EnvironmentalProductDeclaration is not in the checked schema.org release (pending) |
| 0.75 | `oec:massFraction` | `skos:narrowMatch` | `cirpass2-textile:hasFibreMassFraction` | new mapping below the 0.8 floor |
| 0.75 | `oec:endOfLifeInstructions` | `skos:narrowMatch` | `dppk:textileEndOfLifeInstructions` | new mapping below the 0.8 floor |
| 0.75 | `oec:thirdPartyAssurancesUrl` | `skos:exactMatch` | `dppk:supplyChainAssurances` | new mapping below the 0.8 floor |
| 0.75 | `oec:ImpactIndicatorType` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:EN15804ImpactIndicator` | our term is a type, target is the entity |
| 0.74 | `oec:HarmonisedStandard` | `skos:broadMatch` | `untp:Standard` | new mapping below the 0.8 floor |
| 0.73 | `oec:documentUrl` | skos:broadMatch to `skos:exactMatch` | `gs1:referencedFileURL` | regrade skos:broadMatch to skos:exactMatch |
| 0.73 | `oec:hasHazardousSubstances` | skos:closeMatch to `skos:exactMatch` | `batterypass:hazardousSubstances` | regrade skos:closeMatch to skos:exactMatch |
| 0.73 | `oec:hasOperatorInformation` | `skos:exactMatch` | `dppk:economicOperator` | new mapping below the 0.8 floor |
| 0.73 | `oec:ImpactIndicatorResult` | skos:closeMatch to `skos:exactMatch` | `dppk:ImpactValues` | regrade skos:closeMatch to skos:exactMatch |
| 0.73 | `oec:substanceLocation` | skos:narrowMatch to `skos:exactMatch` | `batterypass:hazardousSubstanceLocation` | regrade skos:narrowMatch to skos:exactMatch |
| 0.72 | `oec:reportUrl` | rdfs:seeAlso to `skos:exactMatch` | `batterypass:supplyChainDueDiligenceReport` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `oec:hasDismantlingInstructions` | `skos:exactMatch` | `cirpass2-battery:dismantlingInformation` | new mapping below the 0.8 floor |
| 0.72 | `oec:hasConformityDeclaration` | `skos:exactMatch` | `batterypass:declarationOfConformity` | new mapping below the 0.8 floor |
| 0.72 | `oec:safeDisassemblyInstructions` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:hasDisassemblyInstruction` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `oec:languageCode` | skos:broadMatch to `skos:exactMatch` | `schemaorg:inLanguage` | regrade skos:broadMatch to skos:exactMatch |
| 0.72 | `oec:languageCode` | `skos:exactMatch` | `dppk:language` | new mapping below the 0.8 floor |
| 0.72 | `oec:ImpactIndicatorResult` | skos:broadMatch to `skos:exactMatch` | `eudpp:LCIAResult` | regrade skos:broadMatch to skos:exactMatch |
| 0.72 | `oec:DigitalProductPassport` | `skos:exactMatch` | `untp:DigitalProductPassport` | new mapping below the 0.8 floor |
| 0.72 | `oec:RecyclabilityAssessment` | rdfs:seeAlso to `skos:narrowMatch` | `cirpass2-textile:RecyclabilityAssessment` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.72 | `oec:OperatorRole` | `skos:broadMatch` | `eudpp:Role` | our term is a type, target is the entity |
| 0.72 | `oec:hazardImpact` | `skos:exactMatch` | `batterypass:hazardousSubstanceImpact` | new mapping below the 0.8 floor |
| 0.72 | `oec:hasDueDiligenceReport` | rdfs:seeAlso to `skos:exactMatch` | `batterypass:supplyChainDueDiligenceReport` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `oec:indicatorTotalValue` | `skos:exactMatch` | `dppk:total` | new mapping below the 0.8 floor |
| 0.71 | `oec:hasCarbonFootprintEndOfLife` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `oec:combinedNomenclatureCode` | `skos:broadMatch` | `eudpp:commodityCode` | new mapping below the 0.8 floor |
| 0.71 | `oec:hasDismantlingInstructions` | skos:broadMatch to `skos:exactMatch` | `batterypass:dismantlingAndRemovalInformation` | regrade skos:broadMatch to skos:exactMatch |
| 0.71 | `oec:hasConformityDeclaration` | skos:narrowMatch to `skos:exactMatch` | `eu-dpp:euDeclarationOfConformity` | regrade skos:narrowMatch to skos:exactMatch against an adjudicated EU DPP Registry pair |
| 0.71 | `oec:casNumber` | `skos:exactMatch` | `batterypass:batteryMaterialIdentifier` | new mapping below the 0.8 floor |
| 0.71 | `oec:SubstanceOfConcern` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:SubstanceOfConcern` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `oec:postConsumerRecycledContent` | `skos:exactMatch` | `batterypass:postConsumerShare` | new mapping below the 0.8 floor |
| 0.71 | `oec:economicOperatorId` | rdfs:seeAlso to `skos:broadMatch` | `gs1:additionalOrganizationID` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `oec:combinedNomenclatureCode` | `skos:broadMatch` | `dppk:hsCode` | new mapping below the 0.8 floor |
| 0.71 | `oec:recycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:postConsumerRecycledContentPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:postConsumerRecycledContent` | direction flip toward a peer profile below the 0.8 floor |
| 0.71 | `oec:hasCarbonFootprint` | `skos:narrowMatch` | `dppk:carbonFootprintAbsolute` | new mapping below the 0.8 floor |
| 0.71 | `oec:dismantlingGuideUrl` | `skos:exactMatch` | `dppk:disassemblyInstructions` | new mapping below the 0.8 floor |
| 0.71 | `oec:indicatorUnit` | `skos:exactMatch` | `eudpp:unitAsString` | new mapping below the 0.8 floor |
| 0.71 | `oec:hasBiodegradabilityTestMethod` | `skos:broadMatch` | `dppk:testMethod` | new mapping below the 0.8 floor |
| 0.70 | `oec:hasDepositAmount` | skos:closeMatch to `skos:exactMatch` | `gs1:returnablePackageDepositAmount` | regrade skos:closeMatch to skos:exactMatch |
| 0.70 | `oec:hasSoftwareUpdatesAvailability` | `skos:broadMatch` | `dppk:softwareUpdatePolicy` | new mapping below the 0.8 floor |
| 0.70 | `oec:postConsumerRecycledContent` | `skos:exactMatch` | `dppk:postConsumerRecycledContentPercentage` | new mapping below the 0.8 floor |
| 0.69 | `oec:hasImpactIndicator` | rdfs:seeAlso to `skos:exactMatch` | `dppk:indicator` | seeAlso upgrade below the 0.8 floor |
| 0.69 | `oec:massFraction` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:materialPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.69 | `oec:EnergyEfficiency` | skos:broadMatch to `skos:exactMatch` | `schemaorg:EnergyConsumptionDetails` | regrade skos:broadMatch to skos:exactMatch |
| 0.69 | `oec:hasDismantlingInstructions` | `skos:broadMatch` | `dppk:endOfLifeInstructions` | new mapping below the 0.8 floor |
| 0.69 | `oec:hasCarbonFootprint` | skos:closeMatch to `skos:narrowMatch` | `batterypass:batteryCarbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.69 | `oec:postConsumerRecycledContent` | `skos:broadMatch` | `dppk:recycledContentPercentage` | new mapping below the 0.8 floor |
| 0.69 | `oec:preConsumerRecycledContent` | `skos:broadMatch` | `schemaorg:recycledContentPercentage` | schema:recycledContentPercentage is not in the checked schema.org release (pending) |
| 0.69 | `oec:hasHazardousSubstances` | `skos:narrowMatch` | `dppk:hazardousSubstances` | new mapping below the 0.8 floor |
| 0.69 | `oec:granularityLevel` | `skos:exactMatch` | `untp:idGranularity` | new mapping below the 0.8 floor |
| 0.69 | `oec:hasPerformanceInfo` | `skos:narrowMatch` | `dppk:performance` | new mapping below the 0.8 floor |
| 0.68 | `oec:FacilityInformation` | rdfs:seeAlso to `skos:broadMatch` | `eudpp:Facility` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `oec:activityClassification` | `skos:exactMatch` | `gs1:organizationClassification` | new mapping below the 0.8 floor |
| 0.68 | `oec:compostabilityStandard` | `skos:broadMatch` | `gs1:certificationStandard` | new mapping below the 0.8 floor |
| 0.68 | `oec:previousPassportVersion` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:hasPreviousDPP` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `oec:ActorRole` | `skos:exactMatch` | `eudpp:Role` | our term is a type, target is the entity |
| 0.68 | `oec:ImpactIndicatorResult` | `skos:narrowMatch` | `eudpp:LandUseResult` | new mapping below the 0.8 floor |
| 0.68 | `oec:postConsumerRecycledContent` | `skos:broadMatch` | `schemaorg:recycledContentPercentage` | schema:recycledContentPercentage is not in the checked schema.org release (pending) |
| 0.67 | `oec:collectionPointDirectoryUrl` | `skos:broadMatch` | `batterypass:informationOnCollection` | new mapping below the 0.8 floor |
| 0.67 | `oec:activityClassification` | rdfs:seeAlso to `skos:narrowMatch` | `other:isic` | seeAlso upgrade below the 0.8 floor |
| 0.67 | `oec:recycledContent` | `skos:exactMatch` | `cirpass2-textile:hasRecycledContentMassFractionValue` | new mapping below the 0.8 floor |
| 0.66 | `oec:reportUrl` | `skos:exactMatch` | `cirpass2-battery:dueDiligenceReport` | new mapping below the 0.8 floor |
| 0.66 | `oec:facilityId` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:hasUniqueFacilityIdentifier` | seeAlso upgrade below the 0.8 floor |
| 0.66 | `oec:hasMaterialOrigin` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:hasMaterialOrigin` | seeAlso upgrade below the 0.8 floor |
| 0.66 | `oec:hasCarbonFootprintUse` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.65 | `oec:dismantlingGuideUrl` | `skos:exactMatch` | `batterypass:dismantlingAndRemovalInformation` | new mapping below the 0.8 floor |
| 0.65 | `oec:hasMaterialComposition` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:fibreComposition` | seeAlso upgrade below the 0.8 floor |
| 0.65 | `oec:hasMaterialOrigin` | `skos:broadMatch` | `dppk:countryOfOrigin` | new mapping below the 0.8 floor |
| 0.65 | `oec:preConsumerRecycledContent` | `skos:broadMatch` | `dppk:recycledContentPercentage` | new mapping below the 0.8 floor |
| 0.65 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:preConsumerRecycledContentPercentage` | direction flip toward a peer profile below the 0.8 floor |
| 0.65 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:preConsumerRecycledContent` | direction flip toward a peer profile below the 0.8 floor |
| 0.64 | `oec:separateCollectionInfo` | `skos:broadMatch` | `batterypass:informationOnCollection` | new mapping below the 0.8 floor |
| 0.64 | `oec:hasCarbonFootprint` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:absoluteCarbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.64 | `oec:epdRegistrationNumber` | `skos:broadMatch` | `schemaorg:reportNumber` | new mapping below the 0.8 floor |
| 0.64 | `oec:hasDepositReturnScheme` | skos:closeMatch to `skos:exactMatch` | `gs1:hasReturnablePackageDeposit` | regrade skos:closeMatch to skos:exactMatch |
| 0.64 | `oec:hasEnergyEfficiencyClass` | skos:closeMatch to `skos:exactMatch` | `schemaorg:hasEnergyEfficiencyCategory` | regrade skos:closeMatch to skos:exactMatch |
| 0.64 | `oec:componentIdentifier` | `skos:narrowMatch` | `dppk:componentEcNumber` | new mapping below the 0.8 floor |
| 0.63 | `oec:postConsumerRecycledContent` | `skos:broadMatch` | `cirpass2-textile:hasRecycledContentMassFractionValue` | new mapping below the 0.8 floor |
| 0.63 | `oec:componentIdentifier` | `skos:exactMatch` | `eudpp:hasMaterialIdentifier` | new mapping below the 0.8 floor |
| 0.63 | `oec:concentration` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:hasConcentration` | seeAlso upgrade below the 0.8 floor |
| 0.62 | `oec:did` | `skos:broadMatch` | `semic:identifier` | new mapping below the 0.8 floor |
| 0.61 | `oec:reportUrl` | `skos:exactMatch` | `dppk:dueDiligenceReport` | new mapping below the 0.8 floor |
| 0.61 | `oec:hasDismantlingInstructions` | rdfs:seeAlso to `skos:exactMatch` | `dppk:dismantlingInformation` | seeAlso upgrade below the 0.8 floor |
| 0.61 | `oec:hasRepairInstructions` | `skos:closeMatch` | `dppk:disassemblyInstructions` | new mapping below the 0.8 floor |
| 0.61 | `oec:passportVersion` | skos:closeMatch to `skos:broadMatch` | `schemaorg:version` | regrade skos:closeMatch to skos:broadMatch |
| 0.61 | `oec:postConsumerRecycledContent` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:recycledContent` | seeAlso upgrade below the 0.8 floor |
| 0.61 | `oec:issueDate` | skos:exactMatch to `skos:narrowMatch` | `dppk:dateOfIssue` | regrade skos:exactMatch to skos:narrowMatch |
| 0.61 | `oec:hasOperatorRole` | skos:closeMatch to `skos:broadMatch` | `gs1:organizationRole` | regrade skos:closeMatch to skos:broadMatch |
| 0.61 | `oec:preConsumerRecycledContent` | `skos:broadMatch` | `cirpass2-textile:hasRecycledContentMassFractionValue` | new mapping below the 0.8 floor |
| 0.61 | `oec:componentIdentifier` | `skos:narrowMatch` | `dppk:componentCasNumber` | new mapping below the 0.8 floor |
| 0.61 | `oec:passportStatus` | `skos:broadMatch` | `semic:status` | new mapping below the 0.8 floor |
| 0.61 | `oec:safeUseInstructions` | skos:exactMatch to `skos:broadMatch` | `dppk:safeUseInstructions` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.61 | `oec:preConsumerRecycledContent` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:recycledContent` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `oec:economicOperatorId` | `skos:broadMatch` | `batterypass:operatorInformation` | new mapping below the 0.8 floor |
| 0.60 | `oec:separateCollectionInfo` | `skos:exactMatch` | `batterypass:separateCollection` | new mapping below the 0.8 floor |
| 0.60 | `oec:hasRepairabilityInfo` | `skos:narrowMatch` | `dppk:repairInstructions` | new mapping below the 0.8 floor |
| 0.60 | `oec:recycledContent` | `skos:exactMatch` | `untp:recycledMassFraction` | new mapping below the 0.8 floor |
| 0.60 | `oec:hasOperatorInformation` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:manufacturerInformation` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `oec:ImpactIndicatorResult` | `skos:narrowMatch` | `eudpp:WaterConsumptionResult` | new mapping below the 0.8 floor |
| 0.60 | `oec:hasMaterialComposition` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:textileMaterialContent` | gs1:textileMaterialContent is a general Layer-1 term, so narrowMatch inverts the relation; broadMatch is the direction |
| 0.60 | `oec:hasMaterialComposition` | `skos:exactMatch` | `eudpp:hasMaterial` | new mapping below the 0.8 floor |
| 0.60 | `oec:carbonFootprintTotal` | `skos:exactMatch` | `dppk:carbonFootprint` | new mapping below the 0.8 floor |
| 0.60 | `oec:hasRepairInstructions` | skos:broadMatch to `skos:closeMatch` | `gs1:serviceInfo` | regrade skos:broadMatch to skos:closeMatch |
| 0.60 | `oec:hasMaterialOrigin` | `skos:exactMatch` | `untp:originCountry` | new mapping below the 0.8 floor |
| 0.60 | `oec:collectionPointDirectoryUrl` | `skos:exactMatch` | `eu-dpp:separateCollectionPoints` | new mapping below the 0.8 floor |
| 0.60 | `oec:wastePreventionInfo` | `skos:closeMatch` | `eu-dpp:wasteBatteryPreventionManagementInfo` | new mapping below the 0.8 floor |
| 0.60 | `oec:MaterialComposition` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:MaterialOfComposition` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `oec:passportExpiryDate` | `skos:broadMatch` | `schemaorg:expires` | new mapping below the 0.8 floor |
| 0.60 | `oec:HazardousSubstance` | skos:broadMatch to `skos:closeMatch` | `eudpp:SubstanceOfConcern` | regrade skos:broadMatch to skos:closeMatch |
| 0.59 | `oec:eoriNumber` | `skos:broadMatch` | `dppk:economicOperatorId` | new mapping below the 0.8 floor |
| 0.59 | `oec:compostabilityStandard` | `skos:broadMatch` | `untp:referenceStandard` | new mapping below the 0.8 floor |
| 0.59 | `oec:ImpactIndicatorResult` | `skos:broadMatch` | `cirpass2-textile:AssessmentResult` | new mapping below the 0.8 floor |
| 0.59 | `oec:regulatoryPermitIdentification` | rdfs:seeAlso to `skos:broadMatch` | `gs1:regulatoryIdentifier` | seeAlso upgrade below the 0.8 floor |
| 0.58 | `oec:repairInformationPortalUrl` | `skos:closeMatch` | `dppk:repairInstructions` | new mapping below the 0.8 floor |
| 0.58 | `oec:LifecycleStageResult` | `skos:broadMatch` | `dppk:ImpactValues` | new mapping below the 0.8 floor |
| 0.58 | `oec:activityClassification` | skos:closeMatch to `skos:broadMatch` | `gs1:organizationClassificationID` | regrade skos:closeMatch to skos:broadMatch |
| 0.58 | `oec:passportStatus` | `skos:broadMatch` | `schemaorg:creativeWorkStatus` | new mapping below the 0.8 floor |
| 0.58 | `oec:DocumentReference` | rdfs:seeAlso to `skos:narrowMatch` | `eudpp:DigitalInstruction` | seeAlso upgrade below the 0.8 floor |
| 0.58 | `oec:safeDisassemblyInstructions` | skos:broadMatch to `skos:closeMatch` | `dppk:disassemblyInstructions` | regrade skos:broadMatch to skos:closeMatch |
| 0.58 | `oec:previousPassportVersion` | skos:exactMatch to `skos:closeMatch` | `eudpp:linkToPreviousDPP` | regrade skos:exactMatch to skos:closeMatch |
| 0.58 | `oec:componentName` | `skos:narrowMatch` | `dppk:componentIupacName` | new mapping below the 0.8 floor |
| 0.58 | `oec:hasMaterialComposition` | `skos:narrowMatch` | `cirpass2-textile:hasFibreCompositionComponent` | new mapping below the 0.8 floor |
| 0.58 | `oec:carbonFootprintTotal` | `skos:closeMatch` | `batterypass:batteryCarbonFootprint` | new mapping below the 0.8 floor |
| 0.58 | `oec:DPPGranularity` | `skos:closeMatch` | `eudpp:ProductIdentifierGranularity` | our term is a type, target is the entity |
| 0.58 | `oec:DPPGranularity` | `skos:closeMatch` | `eudpp:IdentifierGranularity` | our term is a type, target is the entity |
| 0.58 | `oec:postConsumerRecycledContent` | skos:closeMatch to `skos:broadMatch` | `untp:recycledMassFraction` | regrade skos:closeMatch to skos:broadMatch |
| 0.58 | `oec:preConsumerRecycledContent` | `skos:closeMatch` | `dppk:preConsumerRecycledContentMass` | new mapping below the 0.8 floor |
| 0.57 | `oec:hasProductCategory` | `skos:closeMatch` | `gs1:gpcCategoryCode` | new mapping below the 0.8 floor |
| 0.57 | `oec:hasCarbonFootprintProduction` | rdfs:seeAlso to `skos:broadMatch` | `dppk:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.57 | `oec:hasReportingGranularity` | `skos:closeMatch` | `eudpp:granularity` | new mapping below the 0.8 floor |
| 0.57 | `oec:hasFacilityInformation` | `skos:narrowMatch` | `dppk:facilityId` | new mapping below the 0.8 floor |
| 0.57 | `oec:recycledContent` | `skos:closeMatch` | `cirpass2-textile:hasRecycledMaterialMassValue` | new mapping below the 0.8 floor |
| 0.57 | `oec:CarbonFootprintDeclaration` | `skos:closeMatch` | `schemaorg:EnvironmentalProductDeclaration` | schema:EnvironmentalProductDeclaration is not in the checked schema.org release (pending) |
| 0.57 | `oec:endOfLifeInstructions` | rdfs:seeAlso to `skos:closeMatch` | `gs1:consumerRecyclingInstructions` | seeAlso upgrade below the 0.8 floor |
| 0.57 | `oec:landUse` | `skos:closeMatch` | `dppk:sqp` | new mapping below the 0.8 floor |
| 0.57 | `oec:passportIssueDate` | rdfs:seeAlso to `skos:closeMatch` | `eudpp:validFrom` | seeAlso upgrade below the 0.8 floor |
| 0.57 | `oec:hasCarbonFootprintRawMaterial` | `skos:broadMatch` | `dppk:carbonFootprint` | new mapping below the 0.8 floor |
| 0.57 | `oec:preConsumerRecycledContent` | rdfs:seeAlso to `skos:broadMatch` | `untp:recycledMassFraction` | seeAlso upgrade below the 0.8 floor |
| 0.57 | `oec:endOfLifeInstructions` | `skos:closeMatch` | `dppk:disassemblyInstructions` | new mapping below the 0.8 floor |
| 0.57 | `oec:RecyclabilityAssessment` | `skos:closeMatch` | `cirpass2-textile:RecyclabilityAssessmentResult` | new mapping below the 0.8 floor |
| 0.57 | `oec:granularityLevel` | `skos:closeMatch` | `eudpp:hasGranularity` | new mapping below the 0.8 floor |
| 0.57 | `oec:hasPerformanceInfo` | `skos:narrowMatch` | `cirpass2-textile:hasDurabilityAspect` | new mapping below the 0.8 floor |
| 0.56 | `oec:iupacName` | `skos:broadMatch` | `dppk:name` | new mapping below the 0.8 floor |
| 0.56 | `oec:FacilityInformation` | rdfs:seeAlso to `skos:broadMatch` | `semic:Location` | seeAlso upgrade below the 0.8 floor |
| 0.56 | `oec:hasBiodegradabilityTestMethod` | `skos:broadMatch` | `cirpass2-textile:derivedUsingMethod` | new mapping below the 0.8 floor |
| 0.55 | `oec:did` | `skos:broadMatch` | `dppk:identifier` | new mapping below the 0.8 floor |
| 0.55 | `oec:hasDueDiligenceReport` | `skos:narrowMatch` | `cirpass2-battery:dueDiligenceAudit` | new mapping below the 0.8 floor |
| 0.55 | `oec:separateCollectionInfo` | `skos:closeMatch` | `eu-dpp:takeBackCollectionPoints` | new mapping below the 0.8 floor |
| 0.55 | `oec:dataProviderCertification` | `skos:broadMatch` | `gs1:certificationInfo` | new mapping below the 0.8 floor |
| 0.55 | `oec:facilityId` | `skos:narrowMatch` | `untp:madeAtFacility` | new mapping below the 0.8 floor |
| 0.55 | `oec:substanceTradeName` | `skos:closeMatch` | `batterypass:hazardousSubstanceName` | new mapping below the 0.8 floor |
| 0.55 | `oec:passportIssueDate` | `skos:closeMatch` | `dppk:versionDate` | new mapping below the 0.8 floor |
| 0.55 | `oec:carbonFootprintMethodology` | `skos:closeMatch` | `dppk:carbonFootprintCalculationParameters` | new mapping below the 0.8 floor |
| 0.55 | `oec:hasCarbonFootprint` | skos:closeMatch to `skos:narrowMatch` | `batterypass:carbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.55 | `oec:ImpactIndicatorResult` | `skos:narrowMatch` | `eudpp:SustainableRenewableMaterialsUseResult` | new mapping below the 0.8 floor |
| 0.55 | `oec:hasMaterialComposition` | `skos:closeMatch` | `schemaorg:material` | new mapping below the 0.8 floor |
| 0.55 | `oec:carbonFootprintTotal` | skos:closeMatch to `skos:narrowMatch` | `batterypass:carbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.55 | `oec:regulatoryPermitIdentification` | `skos:closeMatch` | `gs1:certificationIdentification` | new mapping below the 0.8 floor |
| 0.55 | `oec:BiodegradabilityTestMethod` | `skos:broadMatch` | `schemaorg:MeasurementMethodEnum` | our term is a type, target is the entity |
| 0.55 | `oec:recyclableContent` | `skos:closeMatch` | `dppk:recyclabilityScore` | new mapping below the 0.8 floor |
| 0.55 | `oec:professionalRepairNetwork` | rdfs:seeAlso to `skos:closeMatch` | `dppk:repairService` | seeAlso upgrade below the 0.8 floor |
| 0.55 | `oec:carbonFootprintStudyUrl` | `skos:closeMatch` | `dppk:carbonFootprintCalculationParameters` | new mapping below the 0.8 floor |
| 0.55 | `oec:hasGuaranteedLifespan` | rdfs:seeAlso to `skos:closeMatch` | `schemaorg:durationOfWarranty` | seeAlso upgrade below the 0.8 floor |
| 0.55 | `oec:hasGuaranteedLifespan` | `skos:closeMatch` | `cirpass2-battery:expectedLifetimeCalendarYears` | new mapping below the 0.8 floor |
| 0.55 | `oec:RecyclabilityAssessment` | `skos:broadMatch` | `cirpass2-textile:AssessmentExecution` | new mapping below the 0.8 floor |
| 0.55 | `oec:complianceStatus` | `skos:closeMatch` | `eudpp:referenceToComplianceStatus` | new mapping below the 0.8 floor |
| 0.55 | `oec:registrationNumber` | skos:broadMatch to `skos:closeMatch` | `gs1:registryEntry` | regrade skos:broadMatch to skos:closeMatch |
| 0.55 | `oec:hasCarbonFootprintUse` | `skos:broadMatch` | `dppk:carbonFootprint` | new mapping below the 0.8 floor |
| 0.55 | `oec:hasPerformanceInfo` | `skos:narrowMatch` | `cirpass2-textile:hasObservedPerformanceParameter` | new mapping below the 0.8 floor |
| 0.55 | `oec:postConsumerRecycledContent` | `skos:closeMatch` | `dppk:postConsumerRecycledContentMass` | new mapping below the 0.8 floor |
| 0.55 | `oec:hasSubstancesOfConcern` | `skos:narrowMatch` | `dppk:hazardousSubstances` | new mapping below the 0.8 floor |
| 0.54 | `oec:massFraction` | `skos:narrowMatch` | `cirpass2-textile:hasTextileFibreMassFraction` | new mapping below the 0.8 floor |
| 0.54 | `oec:ActorRole` | `skos:narrowMatch` | `cirpass2-textile:RepairActorTypeConcept` | our term is a type, target is the entity |
| 0.54 | `oec:hasBiodegradabilityTestMethod` | `skos:broadMatch` | `cirpass2-textile:appliesMethod` | new mapping below the 0.8 floor |
| 0.53 | `oec:massFraction` | `skos:narrowMatch` | `cirpass2-textile:hasNonTextileMaterialMassFraction` | new mapping below the 0.8 floor |
| 0.53 | `oec:facilityId` | `skos:narrowMatch` | `untp:producedAtFacility` | new mapping below the 0.8 floor |
| 0.53 | `oec:hazardStatement` | `skos:closeMatch` | `batterypass:hazardousSubstanceClass` | new mapping below the 0.8 floor |
| 0.53 | `oec:hasRecycledContentDetails` | skos:narrowMatch to `skos:closeMatch` | `cirpass2-textile:hasRecycledContentAspect` | regrade skos:narrowMatch to skos:closeMatch |
| 0.53 | `oec:economicOperatorId` | `skos:closeMatch` | `dppk:eori` | new mapping below the 0.8 floor |
| 0.53 | `oec:hasRecyclabilityAssessment` | `skos:closeMatch` | `cirpass2-textile:hasRecyclabilityAspect` | new mapping below the 0.8 floor |
| 0.53 | `oec:hasCarbonFootprintProduction` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:absoluteCarbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.53 | `oec:separateCollectionInfo` | `skos:closeMatch` | `dppk:separateCollectionSymbol` | new mapping below the 0.8 floor |
| 0.53 | `oec:repairInformationPortalUrl` | `skos:closeMatch` | `eu-dpp:sparePartReplacementDetails` | new mapping below the 0.8 floor |
| 0.53 | `oec:eprRegistrationNumber` | rdfs:seeAlso to `skos:broadMatch` | `gs1:registryEntry` | seeAlso upgrade below the 0.8 floor |
| 0.53 | `oec:facilityId` | `skos:closeMatch` | `eudpp:hasFacility` | new mapping below the 0.8 floor |
| 0.53 | `oec:componentIdentifier` | `skos:broadMatch` | `dppk:identifier` | new mapping below the 0.8 floor |
| 0.53 | `oec:ImpactIndicatorResult` | `skos:narrowMatch` | `eudpp:RecycledMaterialsUseResult` | new mapping below the 0.8 floor |
| 0.53 | `oec:regulatoryPermitIdentification` | `skos:closeMatch` | `schemaorg:certificationIdentification` | new mapping below the 0.8 floor |
| 0.53 | `oec:RecycledContent` | rdfs:seeAlso to `skos:closeMatch` | `eudpp:RecycledMaterialsUseResult` | seeAlso upgrade below the 0.8 floor |
| 0.53 | `oec:hasPassportIssuer` | skos:closeMatch to `skos:broadMatch` | `schemaorg:issuedBy` | regrade skos:closeMatch to skos:broadMatch |
| 0.53 | `oec:professionalRepairNetwork` | `skos:closeMatch` | `cirpass2-textile:hasRepairService` | new mapping below the 0.8 floor |
| 0.53 | `oec:RepairProvider` | `skos:closeMatch` | `cirpass2-textile:RepairService` | new mapping below the 0.8 floor |
| 0.50 | `oec:hasEnergyEfficiency` | `skos:narrowMatch` | `batterypass:roundtripEfficiency` | new mapping below the 0.8 floor |
| 0.50 | `oec:hasEnergyEfficiency` | `skos:narrowMatch` | `cirpass2-battery:roundTripEnergyEfficiencyAt50PercentCycleLife` | new mapping below the 0.8 floor |
| 0.50 | `oec:hasMaterialComposition` | `skos:narrowMatch` | `cirpass2-textile:hasNonTextileMaterialMassFraction` | new mapping below the 0.8 floor |
| 0.50 | `oec:hasAccessLevel` | `skos:closeMatch` | `semic:confidentialityLevelType` | new mapping below the 0.8 floor |
| 0.50 | `oec:MaterialComposition` | `skos:closeMatch` | `eudpp:MaterialOrigin` | new mapping below the 0.8 floor |
| 0.50 | `oec:MaterialComposition` | `skos:closeMatch` | `batterypass:BatteryMaterialEntity` | new mapping below the 0.8 floor |
| 0.49 | `oec:TraceabilityPerformance` | rdfs:seeAlso to `skos:broadMatch` | `untp:PerformanceMetric` | seeAlso upgrade below the 0.8 floor |
| 0.47 | `oec:SubstanceOfConcern` | `skos:closeMatch` | `eudpp:SubstancePresence` | new mapping below the 0.8 floor |
| 0.43 | `oec:hasMaterialComposition` | `skos:closeMatch` | `untp:materialUsage` | new mapping below the 0.8 floor |

## cpr

From `skos-completeness-cpr-2026-11-06.json`. 10 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.77 | `eucpr:EssentialCharacteristic` | rdfs:seeAlso to `skos:broadMatch` | `dppk:ProductCharacteristic` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `eucpr:hasEssentialCharacteristic` | `skos:broadMatch` | `dppk:productCharacteristics` | new mapping below the 0.8 floor |
| 0.69 | `eucpr:declarationOfPerformanceUrl` | `skos:exactMatch` | `dppk:dopc` | new mapping below the 0.8 floor |
| 0.67 | `eucpr:hasReactionToFireClass` | `skos:narrowMatch` | `dppk:reactionToFireSystem4` | new mapping below the 0.8 floor |
| 0.65 | `eucpr:hasReactionToFireClass` | `skos:narrowMatch` | `dppk:reactionToFireSystem1` | new mapping below the 0.8 floor |
| 0.57 | `eucpr:hasNotifiedBody` | `skos:closeMatch` | `eudpp:hasNotifiedBody` | new mapping below the 0.8 floor |
| 0.55 | `eucpr:hasEuropeanAssessmentDocument` | `skos:broadMatch` | `untp:relatedDocument` | new mapping below the 0.8 floor |
| 0.55 | `eucpr:harmonisedStandard` | `skos:broadMatch` | `untp:referenceStandard` | new mapping below the 0.8 floor |
| 0.53 | `eucpr:hasAvcpSystem` | `skos:narrowMatch` | `dppk:avcpSystem3` | new mapping below the 0.8 floor |
| 0.50 | `eucpr:hasValidationReports` | skos:broadMatch to `skos:closeMatch` | `batterypass:resultOfTestReport` | regrade skos:broadMatch to skos:closeMatch |

## detergent

From `skos-completeness-detergent-2026-11-06.json`. 13 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.89 | `eudet:hasIngredientList` | skos:broadMatch to `-` | `gs1:ingredientName` | panel rejects a pair recorded in mapping-allowlist.json |
| 0.89 | `eudet:phosphorusContentPercent` | skos:broadMatch to `-` | `gs1:ingredientContentPercentage` | panel rejects a pair recorded in mapping-allowlist.json |
| 0.83 | `eudet:hasSafetyDataSheet` | `skos:exactMatch` | `dppk:safetyDataSheet` | also exactMatch to safetyDataSheet in dppk: at most one can be the same data point |
| 0.71 | `eudet:allergenCasNumber` | `skos:broadMatch` | `eudpp:casNumber` | new mapping below the 0.8 floor |
| 0.68 | `eudet:hasTestMethod` | `skos:broadMatch` | `dppk:testMethod` | new mapping below the 0.8 floor |
| 0.65 | `eudet:Ingredient` | `skos:broadMatch` | `dppk:Component` | new mapping below the 0.8 floor |
| 0.65 | `eudet:hasProductForm` | skos:closeMatch to `skos:broadMatch` | `gs1:productFormDescription` | regrade skos:closeMatch to skos:broadMatch |
| 0.63 | `eudet:dosageInstructions` | `skos:broadMatch` | `gs1:instructions` | new mapping below the 0.8 floor |
| 0.61 | `eudet:allergenCasNumber` | `skos:broadMatch` | `dppk:componentCasNumber` | new mapping below the 0.8 floor |
| 0.60 | `eudet:hasTestMethod` | skos:closeMatch to `skos:broadMatch` | `schemaorg:measurementMethod` | regrade skos:closeMatch to skos:broadMatch |
| 0.58 | `eudet:dosageInstructions` | `skos:broadMatch` | `dppk:instructionsForUse` | new mapping below the 0.8 floor |
| 0.58 | `eudet:dosageInstructions` | `skos:broadMatch` | `gs1:instructionsForUse` | new mapping below the 0.8 floor |
| 0.53 | `eudet:hasHazardousSubstances` | `skos:closeMatch` | `batterypass:hazardousSubstances` | new mapping below the 0.8 floor |

## electronics

From `skos-completeness-electronics-2026-11-06.json`. 24 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.77 | `euelec:ElectronicComponent` | skos:closeMatch to `skos:broadMatch` | `dppk:Component` | regrade skos:closeMatch to skos:broadMatch |
| 0.77 | `euelec:modelIdentifier` | `skos:exactMatch` | `untp:modelNumber` | new mapping below the 0.8 floor |
| 0.76 | `euelec:componentPartNumber` | `skos:exactMatch` | `cirpass2-battery:partNumber` | new mapping below the 0.8 floor |
| 0.75 | `euelec:componentPartNumber` | `skos:exactMatch` | `schemaorg:mpn` | new mapping below the 0.8 floor |
| 0.67 | `euelec:hasEnergyEfficiencyClass` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:hasEnergyConsumptionDetails` | deferred by a curator: Our property carries an efficiency class label; the schema.org property links to a consumption-details node. Related, but not one subsuming the other. |
| 0.61 | `euelec:featureUpdateEndDate` | `skos:broadMatch` | `dppk:softwareUpdatePolicy` | new mapping below the 0.8 floor |
| 0.60 | `euelec:securityUpdateEndDate` | `skos:broadMatch` | `dppk:softwareUpdatePolicy` | new mapping below the 0.8 floor |
| 0.60 | `euelec:osVersion` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:softwareVersion` | every schema domain (SoftwareApplication) is foreign to a passport |
| 0.59 | `euelec:RepairCriterion` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Rating` | seeAlso upgrade below the 0.8 floor |
| 0.59 | `euelec:batteryMassGrams` | `skos:exactMatch` | `batterypass:batteryMass` | new mapping below the 0.8 floor |
| 0.58 | `euelec:hasEnergyEfficiency` | `skos:narrowMatch` | `dppk:energyEfficiencyClass` | new mapping below the 0.8 floor |
| 0.57 | `euelec:componentPartNumber` | `skos:broadMatch` | `dppk:componentIdentifier` | new mapping below the 0.8 floor |
| 0.57 | `euelec:hasComponents` | `skos:exactMatch` | `dppk:components` | new mapping below the 0.8 floor |
| 0.57 | `euelec:firmwareVersion` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:softwareVersion` | every schema domain (SoftwareApplication) is foreign to a passport |
| 0.55 | `euelec:energyRecoveryRate` | `skos:closeMatch` | `dppk:mer` | new mapping below the 0.8 floor |
| 0.55 | `euelec:calculationMethod` | `skos:broadMatch` | `cirpass2-textile:calculationDescription` | new mapping below the 0.8 floor |
| 0.55 | `euelec:calculationMethod` | `skos:broadMatch` | `cirpass2-textile:derivedUsingMethod` | new mapping below the 0.8 floor |
| 0.55 | `euelec:hasReplacementDifficulty` | `skos:closeMatch` | `eudpp:isReplaceable` | new mapping below the 0.8 floor |
| 0.55 | `euelec:collectionSchemeUrl` | `skos:closeMatch` | `batterypass:informationOnCollection` | new mapping below the 0.8 floor |
| 0.53 | `euelec:recyclabilityRate` | `skos:closeMatch` | `cirpass2-textile:hasRecyclableMassFractionValue` | new mapping below the 0.8 floor |
| 0.53 | `euelec:MaterialRecoveryResult` | `skos:closeMatch` | `cirpass2-textile:RecyclingYieldResult` | new mapping below the 0.8 floor |
| 0.53 | `euelec:batteryMassGrams` | `skos:closeMatch` | `dppk:batteryMass` | new mapping below the 0.8 floor |
| 0.50 | `euelec:ReplacementDifficulty` | `skos:closeMatch` | `cirpass2-textile:EaseOfDisassembly` | our term is a type, target is the entity |
| 0.49 | `euelec:collectionSchemeUrl` | `skos:closeMatch` | `eu-dpp:separateCollectionPoints` | new mapping below the 0.8 floor |

## eudr

From `skos-completeness-eudr-2026-11-06.json`. 18 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.87 | `eudr:hasFscCertification` | skos:narrowMatch to `-` | `gs1:certificationType` | panel rejects a pair recorded in mapping-allowlist.json |
| 0.86 | `eudr:hasOriginDetails` | skos:narrowMatch to `-` | `gs1:countryOfOrigin` | panel rejects a pair recorded in mapping-allowlist.json |
| 0.77 | `eudr:hasFscCertification` | `skos:broadMatch` | `dppk:certifications` | new mapping below the 0.8 floor |
| 0.71 | `eudr:DueDiligenceStatement` | `skos:broadMatch` | `gs1:RegulatoryIdentifier` | deferred by a curator: A due-diligence statement is a document, not an identifier; the subsumption does not hold in either direction. |
| 0.68 | `eudr:hasFscCertification` | `skos:broadMatch` | `dppk:additionalCertification` | new mapping below the 0.8 floor |
| 0.61 | `eudr:geolocation` | skos:closeMatch to `skos:broadMatch` | `schemaorg:geo` | regrade skos:closeMatch to skos:broadMatch |
| 0.61 | `eudr:geofence` | `skos:broadMatch` | `gs1:polygon` | new mapping below the 0.8 floor |
| 0.59 | `eudr:hasCountryList` | `skos:closeMatch` | `dppk:countryOfOrigin` | new mapping below the 0.8 floor |
| 0.58 | `eudr:volumeCubicMeters` | `skos:exactMatch` | `untp:volume` | new mapping below the 0.8 floor |
| 0.58 | `eudr:hasCountryList` | skos:narrowMatch to `skos:closeMatch` | `gs1:countryOfOrigin` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.57 | `eudr:transformationDate` | rdfs:seeAlso to `skos:closeMatch` | `gs1:productionDateTime` | seeAlso upgrade below the 0.8 floor |
| 0.56 | `eudr:hasCountryList` | `skos:broadMatch` | `schemaorg:countryOfOrigin` | new mapping below the 0.8 floor |
| 0.55 | `eudr:hasCountryList` | skos:broadMatch to `skos:closeMatch` | `gs1:countryOfOriginStatement` | regrade skos:broadMatch to skos:closeMatch |
| 0.55 | `eudr:exemptionScopeReference` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:hasSerialNumber` | seeAlso upgrade below the 0.8 floor |
| 0.53 | `eudr:hasCountryList` | `skos:closeMatch` | `eudpp:countryOfOrigin` | new mapping below the 0.8 floor |
| 0.53 | `eudr:transformationDate` | rdfs:seeAlso to `skos:closeMatch` | `gs1:productionDate` | seeAlso upgrade below the 0.8 floor |
| 0.53 | `eudr:transformationDate` | `skos:closeMatch` | `schemaorg:productionDate` | new mapping below the 0.8 floor |
| 0.52 | `eudr:transformationDate` | `skos:closeMatch` | `dppk:manufacturingDate` | new mapping below the 0.8 floor |

## fsma204

No held findings: everything the panel confirmed was either applied or filtered as out of scope.

## interop

No held findings: everything the panel confirmed was either applied or filtered as out of scope.

## iron-steel

From `skos-completeness-iron-steel-2026-11-06.json`. 22 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.86 | `eusteel:heatNumber` | `skos:exactMatch` | `dppk:castNumber` | exactMatch target shared with eusteel:castNumber: duplicate terms on our side |
| 0.77 | `eusteel:heatNumber` | skos:closeMatch to `skos:broadMatch` | `gs1:hasBatchLotNumber` | regrade skos:closeMatch to skos:broadMatch |
| 0.71 | `eusteel:productNumber` | skos:closeMatch to `skos:broadMatch` | `schemaorg:productID` | regrade skos:closeMatch to skos:broadMatch |
| 0.70 | `eusteel:steelDesignation` | `skos:exactMatch` | `dppk:steelGrade` | new mapping below the 0.8 floor |
| 0.67 | `eusteel:meltAndPourCountry` | skos:closeMatch to `skos:broadMatch` | `schemaorg:countryOfOrigin` | regrade skos:closeMatch to skos:broadMatch |
| 0.62 | `eusteel:meltAndPourCountry` | rdfs:seeAlso to `skos:broadMatch` | `dppk:productionLocationCountry` | seeAlso upgrade below the 0.8 floor |
| 0.61 | `eusteel:MaterialTestCertificate` | skos:exactMatch to `skos:broadMatch` | `dppk:MaterialTestCertificate` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.60 | `eusteel:mtcWeightTolerance` | `skos:broadMatch` | `eudpp:tolerance` | new mapping below the 0.8 floor |
| 0.60 | `eusteel:MaterialTestCertificate` | `skos:broadMatch` | `dppk:Certification` | new mapping below the 0.8 floor |
| 0.60 | `eusteel:heatNumber` | `skos:broadMatch` | `dppk:lotNumber` | new mapping below the 0.8 floor |
| 0.59 | `eusteel:productNumber` | `skos:exactMatch` | `eu-dpp:productNumber` | new mapping below the 0.8 floor |
| 0.58 | `eusteel:lotNumber` | `skos:closeMatch` | `dppk:heatNumber` | new mapping below the 0.8 floor |
| 0.57 | `eusteel:cbamReportId` | skos:closeMatch to `skos:broadMatch` | `schemaorg:reportNumber` | regrade skos:closeMatch to skos:broadMatch |
| 0.57 | `eusteel:heatNumber` | `skos:broadMatch` | `untp:batchNumber` | new mapping below the 0.8 floor |
| 0.55 | `eusteel:productNumber` | `skos:closeMatch` | `dppk:model` | new mapping below the 0.8 floor |
| 0.55 | `eusteel:meltAndPourCountry` | `skos:broadMatch` | `untp:originCountry` | new mapping below the 0.8 floor |
| 0.55 | `eusteel:lotNumber` | `skos:closeMatch` | `dppk:castNumber` | new mapping below the 0.8 floor |
| 0.55 | `eusteel:steelDesignation` | `skos:closeMatch` | `dppk:steelGradeClassification` | new mapping below the 0.8 floor |
| 0.54 | `eusteel:castNumber` | `skos:broadMatch` | `untp:batchNumber` | new mapping below the 0.8 floor |
| 0.53 | `eusteel:productNumber` | `skos:closeMatch` | `eu-dpp:uniqueProductIdentifier` | new mapping below the 0.8 floor |
| 0.53 | `eusteel:hasTechnologyRoute` | `skos:closeMatch` | `dppk:mtcSteelProcess` | new mapping below the 0.8 floor |
| 0.50 | `eusteel:purchaserOrder` | `skos:closeMatch` | `schemaorg:partOfOrder` | new mapping below the 0.8 floor |

## ppwr

No held findings: everything the panel confirmed was either applied or filtered as out of scope.

## textile

From `skos-completeness-textile-2026-11-06.json`. 139 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.89 | `eutex:hasVerificationCertification` | skos:narrowMatch to `-` | `gs1:certificationType` | panel rejects a pair recorded in mapping-allowlist.json |
| 0.87 | `eutex:hasCareInstructions` | `skos:exactMatch` | `dppk:textileCareInstructions` | also exactMatch to careInstructions in dppk: at most one can be the same data point |
| 0.84 | `eutex:hasSubstancesOfConcern` | `skos:exactMatch` | `dppk:textileSubstancesOfConcern` | also exactMatch to substancesOfConcern in dppk: at most one can be the same data point |
| 0.83 | `eutex:carbonFootprintClass` | `skos:exactMatch` | `dppk:textileCarbonFootprintClass` | also exactMatch to carbonFootprintClass in dppk: at most one can be the same data point |
| 0.82 | `eutex:hasWasteOriginType` | skos:closeMatch to `skos:exactMatch` | `cirpass2-textile:hasRecycledContentSource` | exactMatch target shared with eutex:hasRecycledSourceType: duplicate terms on our side |
| 0.80 | `eutex:garmentType` | `skos:exactMatch` | `cirpass2-textile:hasTextileApparelProductType` | exactMatch target shared with eutex:hasApparelSubcategory: duplicate terms on our side |
| 0.80 | `eutex:secondaryMaterialFraction` | `skos:exactMatch` | `schemaorg:recycledContentPercentage` | schema:recycledContentPercentage is not in the checked schema.org release (pending) |
| 0.80 | `eutex:LCIACategory` | `skos:broadMatch` | `eudpp:LCAResult` | our term is a type, target is the entity |
| 0.79 | `eutex:endOfLifeHandling` | `skos:exactMatch` | `eudpp:hasEndOfLifeManagementInstruction` | new mapping below the 0.8 floor |
| 0.79 | `eutex:hasWasteOriginType` | `skos:exactMatch` | `eudpp:materialRecycledContentType` | new mapping below the 0.8 floor |
| 0.77 | `eutex:TextileProduct` | `skos:exactMatch` | `dppk:TextileProduct` | new mapping below the 0.8 floor |
| 0.77 | `eutex:CareInstruction` | skos:closeMatch to `skos:exactMatch` | `cirpass2-textile:TextileCareInstruction` | regrade skos:closeMatch to skos:exactMatch |
| 0.77 | `eutex:WasteOriginType` | `skos:exactMatch` | `cirpass2-textile:RecycledContentSourceConcept` | our term is a type, target is the entity |
| 0.76 | `eutex:SubstanceOfConcern` | `skos:exactMatch` | `eudpp:SubstanceOfConcern` | new mapping below the 0.8 floor |
| 0.76 | `eutex:TextileProduct` | `skos:broadMatch` | `untp:Product` | new mapping below the 0.8 floor |
| 0.76 | `eutex:secondaryMaterialFraction` | `skos:exactMatch` | `untp:recycledMassFraction` | new mapping below the 0.8 floor |
| 0.75 | `eutex:chemicalPurpose` | `skos:exactMatch` | `cirpass2-textile:hasTextileChemicalFunction` | new mapping below the 0.8 floor |
| 0.75 | `eutex:hasSubstancesOfConcern` | `skos:exactMatch` | `dppk:substancesOfConcern` | new mapping below the 0.8 floor |
| 0.72 | `eutex:hasCareInstructions` | `skos:exactMatch` | `dppk:careInstructions` | new mapping below the 0.8 floor |
| 0.72 | `eutex:organicContentPercentage` | skos:closeMatch to `skos:exactMatch` | `dppk:organicContentPercentage` | regrade skos:closeMatch to skos:exactMatch |
| 0.72 | `eutex:repairGuideUrl` | `skos:exactMatch` | `dppk:repairInstructions` | new mapping below the 0.8 floor |
| 0.72 | `eutex:repairGuideUrl` | `skos:exactMatch` | `dppk:textileRepairInstructions` | new mapping below the 0.8 floor |
| 0.72 | `eutex:MicroplasticInfo` | `skos:broadMatch` | `eudpp:PlasticsRelease` | new mapping below the 0.8 floor |
| 0.71 | `eutex:chemicalPurpose` | `skos:exactMatch` | `cirpass2-textile:hasPresenceChemicalFunction` | new mapping below the 0.8 floor |
| 0.71 | `eutex:hasSubstancesOfConcern` | `skos:exactMatch` | `schemaorg:substanceOfConcern` | schema:substanceOfConcern is not in the checked schema.org release (pending) |
| 0.71 | `eutex:recycledContentSource` | `skos:narrowMatch` | `dppk:postConsumerTypeOfWaste` | new mapping below the 0.8 floor |
| 0.71 | `eutex:FiberType` | `skos:exactMatch` | `cirpass2-textile:FibreTypeConcept` | our term is a type, target is the entity |
| 0.71 | `eutex:secondaryMaterialFraction` | `skos:exactMatch` | `eudpp:materialRecycledContent` | new mapping below the 0.8 floor |
| 0.71 | `eutex:pefcrReference` | `skos:exactMatch` | `eudpp:followsPEFCR` | new mapping below the 0.8 floor |
| 0.70 | `eutex:RobustnessAssessment` | `skos:broadMatch` | `cirpass2-textile:AssessmentExecution` | new mapping below the 0.8 floor |
| 0.70 | `eutex:RecyclabilityAssessment` | rdfs:seeAlso to `skos:broadMatch` | `cirpass2-textile:RecyclabilityAssessment` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.69 | `eutex:TextileProduct` | `skos:narrowMatch` | `cirpass2-textile:ToyTextileApparel` | new mapping below the 0.8 floor |
| 0.68 | `eutex:repairGuideUrl` | `skos:exactMatch` | `cirpass2-textile:hasRepairGuidance` | new mapping below the 0.8 floor |
| 0.67 | `eutex:RecyclabilityAssessment` | `skos:broadMatch` | `cirpass2-textile:AssessmentExecution` | new mapping below the 0.8 floor |
| 0.67 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:MechanicalRecyclingRoute` | our term is a type, target is the entity |
| 0.67 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:PolycottonThermoChemicalRecyclingProcess` | our term is a type, target is the entity |
| 0.67 | `eutex:maxConcentration` | `skos:broadMatch` | `eudpp:hasConcentration` | new mapping below the 0.8 floor |
| 0.67 | `eutex:hasRecycledSourceType` | `skos:exactMatch` | `cirpass2-textile:hasRecycledContentSource` | new mapping below the 0.8 floor |
| 0.67 | `eutex:carbonFootprintManufacturing` | `skos:broadMatch` | `dppk:carbonFootprint` | new mapping below the 0.8 floor |
| 0.67 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:ThermoMechanicalRecyclingProcess` | our term is a type, target is the entity |
| 0.66 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:SyntheticFibreChemicalRecyclingProcess` | our term is a type, target is the entity |
| 0.65 | `eutex:hasRecycledSourceType` | `skos:exactMatch` | `eudpp:materialRecycledContentType` | new mapping below the 0.8 floor |
| 0.65 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:PyrolysisGasificationRecyclingProcess` | our term is a type, target is the entity |
| 0.64 | `eutex:substanceConcentration` | skos:narrowMatch to `skos:exactMatch` | `batterypass:hazardousSubstanceConcentration` | regrade skos:narrowMatch to skos:exactMatch |
| 0.64 | `eutex:hasRepairServices` | `skos:exactMatch` | `cirpass2-textile:hasRepairService` | new mapping below the 0.8 floor |
| 0.64 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:ChemicalRecyclingRoute` | our term is a type, target is the entity |
| 0.63 | `eutex:substanceConcentration` | skos:broadMatch to `skos:exactMatch` | `eudpp:hasConcentration` | regrade skos:broadMatch to skos:exactMatch |
| 0.63 | `eutex:concentrationRange` | `skos:broadMatch` | `eudpp:hasConcentration` | new mapping below the 0.8 floor |
| 0.63 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:ChemicalRecyclingProcess` | our term is a type, target is the entity |
| 0.63 | `eutex:hasRecyclabilityAssessment` | `skos:exactMatch` | `cirpass2-textile:hasRecyclabilityAspect` | new mapping below the 0.8 floor |
| 0.61 | `eutex:seasonCollection` | skos:broadMatch to `skos:closeMatch` | `gs1:seasonParameter` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.61 | `eutex:carbonFootprintManufacturing` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.61 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:CellulosicChemicalRecyclingProcess` | our term is a type, target is the entity |
| 0.61 | `eutex:safeUseInstructions` | skos:exactMatch to `skos:broadMatch` | `dppk:safeUseInstructions` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.61 | `eutex:hasApparelSubcategory` | rdfs:seeAlso to `skos:broadMatch` | `gs1:additionalProductClassification` | seeAlso upgrade below the 0.8 floor |
| 0.61 | `eutex:RobustnessAssessment` | `skos:exactMatch` | `cirpass2-textile:RobustnessAssessment` | new mapping below the 0.8 floor |
| 0.61 | `eutex:hasCareInstructions` | `skos:closeMatch` | `dppk:textileSafeUseInstructions` | new mapping below the 0.8 floor |
| 0.61 | `eutex:recycledContentSource` | skos:broadMatch to `skos:closeMatch` | `eudpp:materialRecycledContentType` | regrade skos:broadMatch to skos:closeMatch |
| 0.61 | `eutex:hasCutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `dppk:manufacturingFacility` | seeAlso upgrade below the 0.8 floor |
| 0.61 | `eutex:TextileProduct` | skos:narrowMatch to `skos:closeMatch` | `gs1:WearableProduct` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.61 | `eutex:TextileProduct` | `skos:narrowMatch` | `cirpass2-textile:TextileWaste` | new mapping below the 0.8 floor |
| 0.61 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:MechanicalRecyclingProcess` | our term is a type, target is the entity |
| 0.61 | `eutex:hasSpinningFacility` | `skos:broadMatch` | `dppk:manufacturingFacility` | new mapping below the 0.8 floor |
| 0.61 | `eutex:hasEnvironmentalFootprint` | `skos:narrowMatch` | `dppk:carbonFootprint` | new mapping below the 0.8 floor |
| 0.60 | `eutex:chemicalPurpose` | `skos:closeMatch` | `cirpass2-textile:hasTextileChemicalUseCategory` | new mapping below the 0.8 floor |
| 0.60 | `eutex:RecyclabilityAssessment` | `skos:broadMatch` | `cirpass2-textile:AssessmentElement` | new mapping below the 0.8 floor |
| 0.60 | `eutex:benchmarkPerformance` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:carbonFootprintBenchmarkPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `eutex:hasTextileChemicals` | `skos:closeMatch` | `dppk:textileSubstancesOfConcern` | new mapping below the 0.8 floor |
| 0.60 | `eutex:hasCutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `untp:producedAtFacility` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `eutex:hasSocType` | `skos:exactMatch` | `eudpp:hasSoCCriterion` | new mapping below the 0.8 floor |
| 0.60 | `eutex:seasonCollection` | skos:narrowMatch to `skos:closeMatch` | `gs1:seasonName` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.60 | `eutex:LCIACategoryCode` | `skos:exactMatch` | `eudpp:LCIAImpactCategory` | new mapping below the 0.8 floor |
| 0.60 | `eutex:carbonFootprintManufacturing` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.60 | `eutex:hasApparelSubcategory` | `skos:exactMatch` | `cirpass2-textile:hasTextileApparelProductType` | new mapping below the 0.8 floor |
| 0.60 | `eutex:fiberOrigin` | `skos:broadMatch` | `dppk:countryOfOrigin` | new mapping below the 0.8 floor |
| 0.59 | `eutex:RobustnessAssessment` | `skos:broadMatch` | `cirpass2-textile:AssessmentElement` | new mapping below the 0.8 floor |
| 0.59 | `eutex:LCIACategoryCode` | `skos:exactMatch` | `eudpp:LCIAImpactIndicator` | our term is a type, target is the entity |
| 0.59 | `eutex:hasWeavingFacility` | `skos:broadMatch` | `dppk:manufacturingFacility` | new mapping below the 0.8 floor |
| 0.59 | `eutex:fiberOrigin` | `skos:broadMatch` | `eudpp:hasMaterialOrigin` | new mapping below the 0.8 floor |
| 0.59 | `eutex:organicContentMass` | `skos:closeMatch` | `dppk:organicContentPercentage` | new mapping below the 0.8 floor |
| 0.58 | `eutex:hasFinishingFacility` | `skos:broadMatch` | `dppk:manufacturingFacility` | new mapping below the 0.8 floor |
| 0.58 | `eutex:carbonFootprintClass` | `skos:closeMatch` | `dppk:carbonFootprintBenchmarkPercentage` | new mapping below the 0.8 floor |
| 0.58 | `eutex:hasCutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `untp:madeAtFacility` | seeAlso upgrade below the 0.8 floor |
| 0.58 | `eutex:TextileProduct` | `skos:narrowMatch` | `cirpass2-textile:MedicalDeviceTextileApparel` | new mapping below the 0.8 floor |
| 0.58 | `eutex:sparePartsUrl` | `skos:closeMatch` | `dppk:sparePartsSources` | new mapping below the 0.8 floor |
| 0.58 | `eutex:safeUseInstructions` | rdfs:seeAlso to `skos:broadMatch` | `gs1:instructions` | seeAlso upgrade below the 0.8 floor |
| 0.58 | `eutex:weightExcludingTrims` | rdfs:seeAlso to `skos:closeMatch` | `gs1:netWeight` | seeAlso upgrade below the 0.8 floor |
| 0.58 | `eutex:environmentalFootprintClass` | `skos:closeMatch` | `dppk:environmentalFootprintBenchmarkPercentage` | new mapping below the 0.8 floor |
| 0.58 | `eutex:hasWaterUsage` | `skos:closeMatch` | `dppk:fw` | new mapping below the 0.8 floor |
| 0.58 | `eutex:EnvironmentalFootprint` | `skos:closeMatch` | `schemaorg:EnvironmentalProductDeclaration` | schema:EnvironmentalProductDeclaration is not in the checked schema.org release (pending) |
| 0.58 | `eutex:CareInstruction` | `skos:narrowMatch` | `cirpass2-textile:DigitalTextileCareInstruction` | new mapping below the 0.8 floor |
| 0.57 | `eutex:endOfLifeHandling` | `skos:broadMatch` | `dppk:endOfLifeInstructions` | new mapping below the 0.8 floor |
| 0.57 | `eutex:seasonCollection` | skos:narrowMatch to `skos:closeMatch` | `gs1:seasonCalendarYear` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.57 | `eutex:organicContentPercentage` | `skos:closeMatch` | `dppk:organicContentMass` | new mapping below the 0.8 floor |
| 0.57 | `eutex:fiberOrigin` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:countryOfOrigin` | seeAlso upgrade below the 0.8 floor |
| 0.57 | `eutex:hasWasteOriginType` | `skos:closeMatch` | `cirpass2-textile:hasWasteSourceType` | new mapping below the 0.8 floor |
| 0.57 | `eutex:hasRobustnessAssessment` | `skos:broadMatch` | `cirpass2-textile:hasDurabilityAspect` | new mapping below the 0.8 floor |
| 0.57 | `eutex:hasRecycledContentDeclaration` | `skos:narrowMatch` | `dppk:postConsumerRecycledContentPercentage` | new mapping below the 0.8 floor |
| 0.57 | `eutex:FabricType` | `skos:closeMatch` | `cirpass2-textile:FabricManufacturingMethodConcept` | our term is a type, target is the entity |
| 0.57 | `eutex:hasApplicableRecyclingTechnology` | `skos:closeMatch` | `cirpass2-textile:resultForRecyclingRoute` | new mapping below the 0.8 floor |
| 0.57 | `eutex:hasApparelSubcategory` | rdfs:seeAlso to `skos:broadMatch` | `untp:productCategory` | seeAlso upgrade below the 0.8 floor |
| 0.57 | `eutex:additionalCareInstructions` | `skos:broadMatch` | `dppk:careInstructions` | new mapping below the 0.8 floor |
| 0.57 | `eutex:LCIACategory` | `skos:closeMatch` | `dppk:ImpactValues` | our term is a type, target is the entity |
| 0.56 | `eutex:RecyclabilityAssessment` | `skos:broadMatch` | `cirpass2-textile:AssessmentResult` | new mapping below the 0.8 floor |
| 0.56 | `eutex:sparePartsUrl` | `skos:closeMatch` | `batterypass:supplierWebAddress` | new mapping below the 0.8 floor |
| 0.56 | `eutex:DurabilityClass` | `skos:broadMatch` | `eudpp:Durability` | our term is a type, target is the entity |
| 0.55 | `eutex:hasRecycledContentDeclaration` | `skos:closeMatch` | `eudpp:materialRecycledContent` | new mapping below the 0.8 floor |
| 0.55 | `eutex:hasRecycledContentDeclaration` | `skos:narrowMatch` | `dppk:preConsumerRecycledContentPercentage` | new mapping below the 0.8 floor |
| 0.55 | `eutex:sizeRange` | skos:broadMatch to `skos:closeMatch` | `gs1:size` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.55 | `eutex:secondaryMaterialFraction` | `skos:closeMatch` | `cirpass2-textile:hasRecycledMaterialMassValue` | new mapping below the 0.8 floor |
| 0.55 | `eutex:pefcrReference` | `skos:closeMatch` | `dppk:pefcrCategory` | new mapping below the 0.8 floor |
| 0.55 | `eutex:pefcrReference` | `skos:broadMatch` | `eudpp:referenceToComplianceSystem` | new mapping below the 0.8 floor |
| 0.55 | `eutex:sparePartsUrl` | `skos:closeMatch` | `batterypass:sparePartSources` | new mapping below the 0.8 floor |
| 0.55 | `eutex:sparePartsUrl` | `skos:closeMatch` | `eu-dpp:sparePartReplacementDetails` | new mapping below the 0.8 floor |
| 0.55 | `eutex:CareSymbolCode` | `skos:closeMatch` | `cirpass2-textile:CareMethodConcept` | our term is a type, target is the entity |
| 0.55 | `eutex:CareSymbolCode` | `skos:broadMatch` | `cirpass2-textile:TextileCareInstruction` | our term is a type, target is the entity |
| 0.55 | `eutex:SubstanceOfConcern` | `skos:closeMatch` | `batterypass:HazardousSubstanceEntity` | new mapping below the 0.8 floor |
| 0.55 | `eutex:hasFiberCertification` | `skos:closeMatch` | `dppk:textileCertifications` | new mapping below the 0.8 floor |
| 0.55 | `eutex:hasSpinningFacility` | `skos:broadMatch` | `untp:producedAtFacility` | new mapping below the 0.8 floor |
| 0.55 | `eutex:weightExcludingTrims` | `skos:closeMatch` | `dppk:netWeight` | new mapping below the 0.8 floor |
| 0.55 | `eutex:environmentalFootprintClass` | `skos:closeMatch` | `dppk:textileCarbonFootprintClass` | new mapping below the 0.8 floor |
| 0.55 | `eutex:environmentalFootprintClass` | `skos:closeMatch` | `batterypass:carbonFootprintPerformanceClass` | new mapping below the 0.8 floor |
| 0.55 | `eutex:organicContentMass` | `skos:closeMatch` | `gs1:organicPercentClaim` | new mapping below the 0.8 floor |
| 0.55 | `eutex:hasWasteOriginType` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:preConsumerTypeOfWaste` | seeAlso upgrade below the 0.8 floor |
| 0.55 | `eutex:hasWasteOriginType` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:postConsumerTypeOfWaste` | seeAlso upgrade below the 0.8 floor |
| 0.53 | `eutex:DurabilityInfo` | `skos:closeMatch` | `cirpass2-textile:IntrinsicDurability` | new mapping below the 0.8 floor |
| 0.53 | `eutex:hasCareInstructions` | `skos:closeMatch` | `dppk:safeUseInstructions` | new mapping below the 0.8 floor |
| 0.53 | `eutex:RecycledSourceType` | `skos:closeMatch` | `cirpass2-textile:TextileWasteSourceConcept` | our term is a type, target is the entity |
| 0.53 | `eutex:FabricType` | `skos:broadMatch` | `cirpass2-textile:FabricStructuralCharacteristic` | our term is a type, target is the entity |
| 0.53 | `eutex:hasSubstancesOfConcern` | `skos:closeMatch` | `batterypass:hazardousSubstances` | new mapping below the 0.8 floor |
| 0.53 | `eutex:hasRecycledContentDeclaration` | `skos:closeMatch` | `cirpass2-textile:hasRecycledContentAssessment` | new mapping below the 0.8 floor |
| 0.53 | `eutex:safeUseInstructions` | `skos:broadMatch` | `gs1:instructionsForUse` | new mapping below the 0.8 floor |
| 0.53 | `eutex:hasTakeBackProgram` | `skos:closeMatch` | `cirpass2-textile:hasEndOfLifeInstruction` | new mapping below the 0.8 floor |
| 0.53 | `eutex:TakeBackProgram` | `skos:closeMatch` | `cirpass2-textile:CollectionForRecyclingProcess` | new mapping below the 0.8 floor |
| 0.52 | `eutex:hasTakeBackProgram` | `skos:closeMatch` | `eu-dpp:takeBackCollectionPoints` | new mapping below the 0.8 floor |
| 0.50 | `eutex:hasCutAndSewFacility` | `skos:broadMatch` | `untp:facility` | new mapping below the 0.8 floor |
| 0.50 | `eutex:hasFabricType` | `skos:closeMatch` | `cirpass2-textile:hasFabricManufacturingMethod` | new mapping below the 0.8 floor |
| 0.50 | `eutex:hasWeavingFacility` | `skos:broadMatch` | `untp:producedAtFacility` | new mapping below the 0.8 floor |
| 0.50 | `eutex:RecyclingTechnology` | `skos:closeMatch` | `cirpass2-textile:RecyclingRoute` | our term is a type, target is the entity |

## Where the pipeline contradicts itself

307 assertion(s) the ontology already carries were marked `WRONG` by the
bulk grader and then had the correction rejected by the QA panel. Nothing was applied, so
each one is either a mapping worth re-reading or a prompt worth improving. A worked example:
the textile panel rejected `eutex:additionalCareInstructions skos:narrowMatch
schema:additionalProperty` at 0.97 confidence, and it does look inverted, since
`schema:additionalProperty` is a general extension slot rather than a narrower concept.

- **battery**: 109
- **core**: 87
- **electronics**: 40
- **textile**: 23
- **eudr**: 20
- **cpr**: 12
- **iron-steel**: 10
- **detergent**: 5
- **ppwr**: 1

## Remaining `skos:narrowMatch` assertions

157 assertions still read `narrowMatch`. Their targets are peer profiles or
intra-project terms of comparable specificity, where which of the two is narrower is a
modelling question per term. `check:mappings` rule 6 already guards the mechanical class,
the general Layer-1 head terms.

- **other**: 75
- **BatteryPass SAMM / bpr**: 36
- **DPP Keystone**: 28
- **GS1 tail**: 14
- **schema.org tail**: 4
