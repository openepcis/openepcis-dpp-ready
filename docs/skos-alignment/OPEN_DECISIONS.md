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
| `euelec:refreshRate` | `skos:broadMatch gs1:value` (0.88) | `skos:narrowMatch gs1:value` |
| `euelec:screenDiagonal` | `skos:broadMatch gs1:value` (0.78) | `skos:narrowMatch gs1:value` |
| `euelec:peakBrightness` | `skos:broadMatch gs1:value` (0.78) | no mapping |

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
| `euelec:treatmentFacility` | `skos:broadMatch untp:fromFacility` (0.89) | Different roles: ours is where treatment happened, UNTP's is a shipment origin. |
| `euelec:recyclingProcess` | `skos:narrowMatch gs1:packagingRecyclingScheme` (0.92) | Cross-domain: GS1's term is packaging-scoped, ours is electronics treatment. |
| `euelec:collectionMethod` | `skos:narrowMatch bpr separateCollection` (0.71) | Plausible but thin, and it points into the battery longlist. |
| `euelec:modelIdentifier` | `skos:narrowMatch bpr:BatteryModelIdentifier` (0.93), `bpr:UniqueBatteryIdentifier…` (0.91) | Directionally right, but it anchors a generic electronics identifier into battery-specific longlist attributes. |

### Duplicate that is documented rather than wrong

`euelec:recyclabilityRate` and `oec:recyclabilityRate` carry the same definition in two
namespaces. The module term already asserts `skos:exactMatch oec:recyclabilityRate`, so the
duplication is recorded, but the layering rule would put a single term in `oec:`. Worth a
consolidation decision; the module's three achieved-rate properties
(`recyclingRate`, `recoveryRate`, `energyRecoveryRate`) are the WEEE Annex V triad and are
genuinely distinct, so they are not part of this question.


<!-- generated: per-module holds and the narrowMatch remainder. Rebuild with `pnpm run skos:decisions`. -->

## battery

From `skos-completeness-battery-2026-07-28.json`. 194 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.98 | `eubat:nominalVoltage` | skos:closeMatch to `skos:exactMatch` | `bpr:NominalVoltage` | our term is a property, target is a class |
| 0.95 | `eubat:HazardClass` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.94 | `eubat:cadmiumSymbolRequired` | skos:narrowMatch to `skos:broadMatch` | `bpr:SymbolsForCadmiumAndLead` | our term is a property, target is a class |
| 0.94 | `eubat:negativeEvents` | `skos:narrowMatch` | `bpr:NumberOfDeepDischargeEvents` | our term is a property, target is a class |
| 0.94 | `eubat:powerCapabilityAt20SoC` | skos:narrowMatch to `skos:broadMatch` | `bpr:RemainingPowerCapability` | our term is a property, target is a class |
| 0.94 | `eubat:technicalSpecifications` | `skos:narrowMatch` | `bpr:NominalVoltage` | our term is a property, target is a class |
| 0.94 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `bpr:Pre-consumerRecycledNickelShare` | our term is a property, target is a class |
| 0.94 | `eubat:safetyInstructionsForDismantling` | skos:narrowMatch to `skos:broadMatch` | `bpr:SafetyMeasures` | our term is a property, target is a class |
| 0.93 | `eubat:materialComposition` | skos:broadMatch to `skos:narrowMatch` | `bpr:CriticalRawMaterials` | our term is a property, target is a class |
| 0.93 | `eubat:temperatureRangeIdleState` | skos:closeMatch to `skos:broadMatch` | `bpr:TemperatureInformation` | our term is a property, target is a class |
| 0.93 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `bpr:Pre-consumerRecycledLithiumShare` | our term is a property, target is a class |
| 0.93 | `eubat:temperatureRangeCharging` | `skos:broadMatch` | `bpr:TemperatureInformation` | our term is a property, target is a class |
| 0.93 | `eubat:leadPreConsumerShare` | skos:narrowMatch to `skos:broadMatch` | `bpr:RecycledLeadShare` | our term is a property, target is a class |
| 0.93 | `eubat:ComponentLocation` | `skos:broadMatch` | `gs1:Place` | our term is a type, target is the entity |
| 0.92 | `eubat:cobaltRecycledShare` | skos:broadMatch to `skos:narrowMatch` | `bpr:Post-consumerRecycledCobaltShare` | our term is a property, target is a class |
| 0.92 | `eubat:safetyMeasures` | skos:closeMatch to `skos:broadMatch` | `bpr:SafetyMeasures` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.92 | `eubat:leadPreConsumerShare` | skos:closeMatch to `skos:broadMatch` | `batterypass:preConsumerShare` | regrade skos:closeMatch to skos:broadMatch |
| 0.92 | `eubat:separateCollectionSymbolUrl` | `skos:exactMatch` | `dppk:separateCollectionSymbol` | deferred by a curator: A URL that points at the symbol is not the symbol. exactMatch overstates it; the honest grade is closeMatch or an ungraded pointer. |
| 0.92 | `eubat:negativeEvents` | skos:broadMatch to `skos:narrowMatch` | `bpr:NumberOfOverchargeEvents` | our term is a property, target is a class |
| 0.92 | `eubat:powerCapabilityAt20SoC` | skos:narrowMatch to `skos:broadMatch` | `bpr:OriginalPowerCapability` | our term is a property, target is a class |
| 0.92 | `eubat:powerCapabilityAt20SoC` | skos:narrowMatch to `skos:broadMatch` | `bpr:MaximumPermittedBatteryPower` | our term is a property, target is a class |
| 0.92 | `eubat:electrolyteComposition` | skos:narrowMatch to `skos:broadMatch` | `bpr:BatteryChemistry` | our term is a property, target is a class |
| 0.92 | `eubat:roundTripEfficiency` | `skos:narrowMatch` | `bpr:RoundTripEnergyEfficiencyAt50OfCycleLife` | our term is a property, target is a class |
| 0.92 | `eubat:cobaltRecycledShare` | skos:broadMatch to `skos:narrowMatch` | `bpr:Pre-consumerRecycledCobaltShare` | our term is a property, target is a class |
| 0.91 | `eubat:batteryModelIdentifier` | skos:broadMatch to `skos:narrowMatch` | `batterypass:batteryPassportIdentifier` | deferred by a curator: Different referents: ours identifies the battery model, theirs identifies the passport document about it. Neither subsumes the other. |
| 0.91 | `eubat:timeSpentInExtremeTemperaturesBelowBoundary` | skos:broadMatch to `skos:narrowMatch` | `bpr:TimeSpentChargingDuringExtremeTemperaturesBelowBoundary` | our term is a property, target is a class |
| 0.91 | `eubat:remainingEnergy` | skos:broadMatch to `skos:narrowMatch` | `bpr:RemainingUsableBatteryEnergy` | our term is a property, target is a class |
| 0.91 | `eubat:ratedMaximumPower` | `skos:broadMatch` | `bpr:RemainingPowerCapability` | our term is a property, target is a class |
| 0.91 | `eubat:maximumPermittedBatteryPower` | skos:narrowMatch to `skos:broadMatch` | `bpr:RemainingPowerCapability` | our term is a property, target is a class |
| 0.91 | `eubat:safetyInstructions` | skos:narrowMatch to `skos:broadMatch` | `bpr:SafetyMeasures` | our term is a property, target is a class |
| 0.90 | `eubat:separateCollection` | `skos:broadMatch` | `bpr:InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` | our term is a property, target is a class |
| 0.90 | `eubat:manufacturingPlace` | rdfs:seeAlso to `skos:broadMatch` | `semic:Location` | our term is a property, target is a class |
| 0.90 | `eubat:cathodeActiveMaterial` | skos:narrowMatch to `skos:broadMatch` | `bpr:BatteryChemistry` | our term is a property, target is a class |
| 0.89 | `eubat:ratedEnergy` | `skos:narrowMatch` | `bpr:CertifiedUsableBatteryEnergy` | our term is a property, target is a class |
| 0.89 | `eubat:temperatureRangeDischarging` | `skos:broadMatch` | `bpr:TemperatureInformation` | our term is a property, target is a class |
| 0.88 | `eubat:anodeActiveMaterial` | skos:narrowMatch to `skos:broadMatch` | `bpr:BatteryChemistry` | our term is a property, target is a class |
| 0.88 | `eubat:roundTripEnergyEfficiency` | skos:broadMatch to `skos:narrowMatch` | `bpr:RoundTripEnergyEfficiencyAt50OfCycleLife` | our term is a property, target is a class |
| 0.88 | `eubat:originalPowerCapability` | skos:narrowMatch to `skos:broadMatch` | `bpr:MaximumPermittedBatteryPower` | our term is a property, target is a class |
| 0.88 | `eubat:expectedLifetime` | skos:broadMatch to `skos:narrowMatch` | `bpr:ExpectedLifetimeInCalendarYears` | our term is a property, target is a class |
| 0.88 | `eubat:cobaltPostConsumerShare` | skos:narrowMatch to `skos:broadMatch` | `bpr:RenewableContentShare` | our term is a property, target is a class |
| 0.88 | `eubat:wastePrevention` | skos:narrowMatch to `skos:broadMatch` | `batterypass:wastePrevention` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.88 | `eubat:facilityIdentifier` | skos:closeMatch to `skos:narrowMatch` | `gs1:globalLocationNumber` | regrade skos:closeMatch to skos:narrowMatch |
| 0.88 | `eubat:cathodeActiveMaterial` | skos:narrowMatch to `skos:broadMatch` | `bpr:MaterialsUsedInCathodeAnodeAndElectrolyte` | our term is a property, target is a class |
| 0.88 | `eubat:ResponsibleSourcingStandard` | rdfs:seeAlso to `skos:broadMatch` | `untp:Standard` | our term is a type, target is the entity |
| 0.88 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `bpr:Pre-consumerRecycledCobaltShare` | our term is a property, target is a class |
| 0.87 | `eubat:absoluteCarbonFootprint` | skos:broadMatch to `skos:narrowMatch` | `bpr:BatteryCarbonFootprintPerFunctionalUnit` | our term is a property, target is a class |
| 0.87 | `eubat:powerCapabilityAt80SoC` | `skos:broadMatch` | `bpr:MaximumPermittedBatteryPower` | our term is a property, target is a class |
| 0.87 | `eubat:powerCapability` | skos:narrowMatch to `skos:broadMatch` | `bpr:MaximumPermittedBatteryPower` | our term is a property, target is a class |
| 0.86 | `eubat:CarbonFootprintClass` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.86 | `eubat:lifecycleStage` | skos:broadMatch to `skos:narrowMatch` | `bpr:ContributionOfRawMaterialAcquisitionAndPre-processingLifecycleStage` | our term is a property, target is a class |
| 0.86 | `eubat:maximumTemperature` | skos:closeMatch to `skos:narrowMatch` | `bpr:TemperatureRangeIdleStateUpperBoundary` | our term is a property, target is a class |
| 0.86 | `eubat:temperatureRangeIdleState` | skos:broadMatch to `skos:narrowMatch` | `bpr:TemperatureRangeIdleStateLowerBoundary` | our term is a property, target is a class |
| 0.86 | `eubat:powerCapability` | skos:narrowMatch to `skos:broadMatch` | `bpr:RemainingPowerCapability` | our term is a property, target is a class |
| 0.85 | `eubat:expectedLifetimeCapacityThroughput` | `skos:broadMatch` | `bpr:EnergyThroughput` | our term is a property, target is a class |
| 0.85 | `eubat:timeSpentChargingDuringExtremeTemperaturesAboveBoundary` | skos:narrowMatch to `skos:broadMatch` | `bpr:TimeSpentInExtremeTemperaturesAboveBoundary` | our term is a property, target is a class |
| 0.85 | `eubat:eventLocation` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:sportsActivityLocation` | every schema domain (ExerciseAction) is foreign to a passport |
| 0.85 | `eubat:maximumChargingPower` | skos:narrowMatch to `skos:broadMatch` | `bpr:MaximumPermittedBatteryPower` | our term is a property, target is a class |
| 0.85 | `eubat:BatteryStatus` | skos:narrowMatch to `skos:broadMatch` | `batterypass:BatteryConditionEntity` | our term is a type, target is the entity |
| 0.85 | `eubat:electrolyteType` | skos:narrowMatch to `skos:broadMatch` | `bpr:MaterialsUsedInCathodeAnodeAndElectrolyte` | our term is a property, target is a class |
| 0.85 | `eubat:facilityIdentifier` | skos:narrowMatch to `skos:broadMatch` | `bpr:ManufacturingPlace` | our term is a property, target is a class |
| 0.84 | `eubat:ratedMaximumPower` | skos:broadMatch to `skos:narrowMatch` | `bpr:OriginalPowerCapability` | our term is a property, target is a class |
| 0.83 | `eubat:eventLocation` | skos:broadMatch to `skos:narrowMatch` | `rail:europeanTrackLocation` | deferred by a curator: Cross-sector noise: a railway track location is a rail-specific concept and mapping a battery event location above it documents nothing. The rail profile is for railway concepts. |
| 0.83 | `eubat:remainingEnergy` | skos:narrowMatch to `skos:broadMatch` | `bpr:RemainingPowerCapability` | our term is a property, target is a class |
| 0.83 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `bpr:Post-consumerRecycledNickelShare` | our term is a property, target is a class |
| 0.83 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `bpr:Post-consumerRecycledLithiumShare` | our term is a property, target is a class |
| 0.83 | `eubat:hazardousSubstances` | skos:broadMatch to `skos:narrowMatch` | `batterypass:hazardousSubstances` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.83 | `eubat:expectedRemainingCycles` | skos:narrowMatch to `skos:broadMatch` | `bpr:ExpectedLifetime-NumberOfCharge-dischargeCycles` | our term is a property, target is a class |
| 0.83 | `eubat:maximumDischargingPower` | skos:narrowMatch to `skos:broadMatch` | `bpr:RemainingPowerCapability` | our term is a property, target is a class |
| 0.83 | `eubat:TechnicalSpecification` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:PropertyValueSpecification` | target is a structural value carrier |
| 0.82 | `eubat:lithiumPostConsumerShare` | `skos:broadMatch` | `bpr:RenewableContentShare` | our term is a property, target is a class |
| 0.82 | `eubat:anodeActiveMaterial` | skos:narrowMatch to `skos:broadMatch` | `bpr:MaterialsUsedInCathodeAnodeAndElectrolyte` | our term is a property, target is a class |
| 0.82 | `eubat:supplierContact` | `skos:broadMatch` | `schemaorg:contactPoints` | schema:contactPoints is superseded by schema:contactPoint |
| 0.81 | `eubat:materialComposition` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:material` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.81 | `eubat:nickelRecycledShare` | skos:narrowMatch to `skos:broadMatch` | `bpr:RenewableContentShare` | our term is a property, target is a class |
| 0.81 | `eubat:originalPowerCapability` | skos:narrowMatch to `skos:broadMatch` | `bpr:RemainingPowerCapability` | our term is a property, target is a class |
| 0.81 | `eubat:temperatureRangeIdleState` | skos:broadMatch to `skos:narrowMatch` | `bpr:TemperatureRangeIdleStateUpperBoundary` | our term is a property, target is a class |
| 0.81 | `eubat:ratedCapacity` | `skos:broadMatch` | `schemaorg:fuelCapacity` | every schema domain (Vehicle) is foreign to a passport |
| 0.80 | `eubat:ratedMaximumPower` | skos:broadMatch to `skos:narrowMatch` | `batterypass:ratedMaximumPower` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.80 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `batterypass:recycledContent` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.80 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `bpr:Post-consumerRecycledCobaltShare` | our term is a property, target is a class |
| 0.80 | `eubat:authorizedServiceCenters` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:serviceUrl` | every schema domain (ServiceChannel) is foreign to a passport |
| 0.80 | `eubat:capacityThroughput` | rdfs:seeAlso to `skos:closeMatch` | `bpr:CapacityThroughput` | our term is a property, target is a class |
| 0.80 | `eubat:powerCapability` | skos:broadMatch to `skos:narrowMatch` | `bpr:OriginalPowerCapability` | our term is a property, target is a class |
| 0.80 | `eubat:substanceLocation` | `skos:broadMatch` | `semic:Location` | our term is a property, target is a class |
| 0.80 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:postConsumerRecycledContentMass` | direction flip toward a peer profile below the 0.8 floor |
| 0.79 | `eubat:carbonFootprintProduction` | skos:narrowMatch to `skos:broadMatch` | `batterypass:absoluteCarbonFootprint` | direction flip toward a peer profile below the 0.8 floor |
| 0.79 | `eubat:lithiumPostConsumerShare` | `skos:broadMatch` | `dppk:postConsumerRecycledContent` | new mapping below the 0.8 floor |
| 0.79 | `eubat:safetyMeasures` | skos:broadMatch to `skos:narrowMatch` | `batterypass:safetyInstructions` | direction flip toward a peer profile below the 0.8 floor |
| 0.79 | `eubat:nickelRecycledShare` | skos:broadMatch to `skos:narrowMatch` | `bpr:Post-consumerRecycledNickelShare` | our term is a property, target is a class |
| 0.79 | `eubat:repurposingGuidelines` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:wastePrevention` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `eubat:authorizedServiceCenters` | rdfs:seeAlso to `skos:broadMatch` | `gs1:serviceInfo` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `eubat:cobaltRecycledShare` | rdfs:seeAlso to `skos:broadMatch` | `dppk:preConsumerRecycledContent` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `eubat:dismantlingInstructions` | `skos:broadMatch` | `gs1:consumerRecyclingInstructions` | new mapping below the 0.8 floor |
| 0.79 | `eubat:NegativeEventType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Event` | our term is a type, target is the entity |
| 0.79 | `eubat:carbonFootprintProduction` | skos:narrowMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | direction flip toward a peer profile below the 0.8 floor |
| 0.79 | `eubat:carbonFootprintDeclaration` | `skos:narrowMatch` | `dppk:carbonFootprintBenchmarkPercentage` | new mapping below the 0.8 floor |
| 0.78 | `eubat:safetyInstructionsForDismantling` | skos:narrowMatch to `skos:broadMatch` | `batterypass:safetyMeasures` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `eubat:cRate` | skos:broadMatch to `skos:narrowMatch` | `bpr:C-rateOfRelevantCycle-lifeTest` | our term is a property, target is a class |
| 0.78 | `eubat:repurposingGuidelines` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:informationOnCollection` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:BatteryChemistry` | `skos:broadMatch` | `batterypass:BatteryMaterialEntity` | new mapping below the 0.8 floor |
| 0.78 | `eubat:supplierContact` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:emailAddressOfSupplier` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:PowerCapabilityAtSoC` | skos:narrowMatch to `skos:broadMatch` | `batterypass:PowerCapabilityAtEntity` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `eubat:timeSpentInExtremeTemperaturesAboveBoundary` | skos:broadMatch to `skos:narrowMatch` | `bpr:TimeSpentChargingDuringExtremeTemperaturesAboveBoundary` | our term is a property, target is a class |
| 0.78 | `eubat:complianceStatus` | `skos:narrowMatch` | `bpr:ResultsOfTestReportsProvingCompliance` | our term is a property, target is a class |
| 0.78 | `eubat:maximumPermittedBatteryPower` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:remainingPowerCapability` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:carbonFootprintDeclaration` | `skos:narrowMatch` | `dppk:carbonFootprintAbsolute` | new mapping below the 0.8 floor |
| 0.78 | `eubat:euDeclarationOfConformity` | `skos:broadMatch` | `untp:conformityAssessment` | new mapping below the 0.8 floor |
| 0.78 | `eubat:safetyInstructionsForDismantling` | rdfs:seeAlso to `skos:broadMatch` | `dppk:safetyMeasures` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:safetyInstructionsForDismantling` | rdfs:seeAlso to `skos:broadMatch` | `dppk:safetyDataSheet` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:responsibleSourcingStandard` | `skos:broadMatch` | `gs1:certificationStandard` | new mapping below the 0.8 floor |
| 0.78 | `eubat:remainingCapacity` | `skos:broadMatch` | `schemaorg:fuelCapacity` | every schema domain (Vehicle) is foreign to a passport |
| 0.78 | `eubat:recommendedAction` | `skos:closeMatch` | `schemaorg:followup` | every schema domain (MedicalProcedure) is foreign to a passport |
| 0.78 | `eubat:nickelRecycledShare` | skos:broadMatch to `skos:narrowMatch` | `batterypass:postConsumerShare` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `eubat:remainingEnergy` | skos:broadMatch to `skos:narrowMatch` | `bpr:CertifiedUsableBatteryEnergy` | our term is a property, target is a class |
| 0.78 | `eubat:incidentId` | skos:narrowMatch to `skos:broadMatch` | `untp:id` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `eubat:powerCapabilityAt80SoC` | `skos:broadMatch` | `batterypass:powerCapabilityAt` | new mapping below the 0.8 floor |
| 0.78 | `eubat:lithiumRecycledShare` | skos:broadMatch to `skos:narrowMatch` | `batterypass:postConsumerShare` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `eubat:DismantlingDocumentType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:DigitalDocument` | our term is a type, target is the entity |
| 0.78 | `eubat:lifecycleStage` | `skos:narrowMatch` | `bpr:ContributionOfDistributionLifecycleStage` | our term is a property, target is a class |
| 0.78 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `bpr:RecycledLeadShare` | our term is a property, target is a class |
| 0.78 | `eubat:dataProviderCertification` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:hasCertification` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `eubat:maximumDischargingPower` | skos:narrowMatch to `skos:broadMatch` | `batterypass:originalPowerCapability` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `eubat:BatteryChemistry` | `skos:broadMatch` | `schemaorg:ChemicalSubstance` | new mapping below the 0.8 floor |
| 0.77 | `eubat:operatorIdentifier` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:manufacturerInformation` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `eubat:operatorIdentifier` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:globalLocationNumber` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `eubat:carbonFootprintRecycling` | skos:narrowMatch to `skos:broadMatch` | `batterypass:absoluteCarbonFootprint` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `eubat:carbonFootprintProduction` | `skos:broadMatch` | `bpr:AbsoluteBatteryCarbonFootprint` | our term is a property, target is a class |
| 0.77 | `eubat:ThirdPartyVerification` | skos:narrowMatch to `skos:broadMatch` | `dppk:Certification` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `eubat:powerCapabilityAt80SoC` | skos:narrowMatch to `skos:broadMatch` | `batterypass:remainingPowerCapability` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `eubat:powerCapabilityAt20SoC` | skos:narrowMatch to `skos:broadMatch` | `batterypass:ratedMaximumPower` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:preConsumerRecycledMaterialComposition` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `eubat:carbonFootprintRawMaterialExtraction` | `skos:broadMatch` | `dppk:carbonFootprintGeneralInfo` | new mapping below the 0.8 floor |
| 0.77 | `eubat:manufacturerIdentifier` | skos:narrowMatch to `skos:broadMatch` | `bpr:UniqueEconomicOperatorIdentifier` | our term is a property, target is a class |
| 0.77 | `eubat:facilityIdentifier` | `skos:broadMatch` | `semic:identifier` | new mapping below the 0.8 floor |
| 0.76 | `eubat:lifecycleStage` | skos:broadMatch to `skos:narrowMatch` | `bpr:ContributionOfEndOfLifeAndRecyclingLifecycleStage` | our term is a property, target is a class |
| 0.76 | `eubat:safetyInstructionsForDismantling` | rdfs:seeAlso to `skos:broadMatch` | `dppk:endOfLifeInstructions` | seeAlso upgrade below the 0.8 floor |
| 0.76 | `eubat:repurposingPotential` | skos:narrowMatch to `skos:broadMatch` | `batterypass:wastePrevention` | direction flip toward a peer profile below the 0.8 floor |
| 0.76 | `eubat:nickelRecycledShare` | skos:broadMatch to `skos:narrowMatch` | `bpr:Pre-consumerRecycledNickelShare` | our term is a property, target is a class |
| 0.76 | `eubat:carbonFootprintDeclaration` | skos:narrowMatch to `skos:broadMatch` | `dppk:environmentalFootprint` | direction flip toward a peer profile below the 0.8 floor |
| 0.76 | `eubat:dueDiligenceReportUrl` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:resultOfTestReport` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eubat:anodeActiveMaterial` | skos:narrowMatch to `skos:broadMatch` | `batterypass:batteryMaterials` | direction flip toward a peer profile below the 0.8 floor |
| 0.75 | `eubat:repurposingPotential` | `skos:broadMatch` | `bpr:InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` | our term is a property, target is a class |
| 0.75 | `eubat:minimumTemperature` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:temperatureRangeIdleState` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eubat:anodeActiveMaterial` | skos:narrowMatch to `skos:broadMatch` | `dppk:materialComposition` | direction flip toward a peer profile below the 0.8 floor |
| 0.75 | `eubat:carbonFootprintRawMaterialExtraction` | skos:narrowMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | direction flip toward a peer profile below the 0.8 floor |
| 0.75 | `eubat:carbonFootprintRawMaterialExtraction` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:absoluteCarbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eubat:labelMeaning` | `skos:broadMatch` | `other:prefLabel` | new mapping below the 0.8 floor |
| 0.75 | `eubat:leadPostConsumerShare` | skos:narrowMatch to `skos:broadMatch` | `bpr:RecycledLeadShare` | our term is a property, target is a class |
| 0.75 | `eubat:DismantlingDocument` | skos:broadMatch to `skos:narrowMatch` | `batterypass:DismantlingAndRemovalDocumentation` | direction flip toward a peer profile below the 0.8 floor |
| 0.75 | `eubat:internalResistance` | skos:broadMatch to `skos:narrowMatch` | `batterypass:ohmicResistance` | direction flip toward a peer profile below the 0.8 floor |
| 0.75 | `eubat:certifiedUsableEnergy` | rdfs:seeAlso to `skos:narrowMatch` | `bpr:RemainingUsableBatteryEnergy` | our term is a property, target is a class |
| 0.75 | `eubat:substanceLocation` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:batteryMaterialLocation` | seeAlso upgrade below the 0.8 floor |
| 0.74 | `eubat:carbonFootprintRawMaterialExtraction` | rdfs:seeAlso to `skos:broadMatch` | `dppk:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.74 | `eubat:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:preConsumerRecycledContentMass` | direction flip toward a peer profile below the 0.8 floor |
| 0.74 | `eubat:cobaltRecycledShare` | rdfs:seeAlso to `skos:broadMatch` | `dppk:preConsumerRecycledContentPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.74 | `eubat:roundTripEfficiencyAt50PercentCycleLife` | skos:narrowMatch to `skos:broadMatch` | `dppk:efficiency` | direction flip toward a peer profile below the 0.8 floor |
| 0.73 | `eubat:anodeActiveMaterial` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:material` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `eubat:lithiumRecycledShare` | rdfs:seeAlso to `skos:narrowMatch` | `bpr:Pre-consumerRecycledLithiumShare` | our term is a property, target is a class |
| 0.73 | `eubat:carbonFootprintRecycling` | rdfs:seeAlso to `skos:broadMatch` | `bpr:AbsoluteBatteryCarbonFootprint` | our term is a property, target is a class |
| 0.73 | `eubat:operatorIdentifier` | `skos:broadMatch` | `dppk:identifier` | new mapping below the 0.8 floor |
| 0.73 | `eubat:materialComposition` | rdfs:seeAlso to `skos:broadMatch` | `untp:materialUsed` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `eubat:carbonFootprintRawMaterialExtraction` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `eubat:lifetimeReferenceTest` | `skos:broadMatch` | `untp:referenceStandard` | new mapping below the 0.8 floor |
| 0.73 | `eubat:nickelPostConsumerShare` | skos:narrowMatch to `skos:broadMatch` | `batterypass:postConsumerShare` | direction flip toward a peer profile below the 0.8 floor |
| 0.73 | `eubat:powerCapabilityAt20SoC` | skos:narrowMatch to `skos:broadMatch` | `batterypass:originalPowerCapability` | direction flip toward a peer profile below the 0.8 floor |
| 0.73 | `eubat:electrolyteComposition` | rdfs:seeAlso to `skos:broadMatch` | `bpr:MaterialsUsedInCathodeAnodeAndElectrolyte` | our term is a property, target is a class |
| 0.73 | `eubat:lifecycleStage` | `skos:narrowMatch` | `bpr:ContributionOfMainProductProductionLifecycleStage` | our term is a property, target is a class |
| 0.73 | `eubat:NegativeEvent` | `skos:broadMatch` | `untp:LifecycleEvent` | new mapping below the 0.8 floor |
| 0.72 | `eubat:lifetimeReferenceTest` | `skos:broadMatch` | `dppk:harmonisedStandardReference` | new mapping below the 0.8 floor |
| 0.72 | `eubat:temperatureRangeDischarging` | skos:narrowMatch to `skos:broadMatch` | `batterypass:temperatureInformation` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `eubat:electrolyteComposition` | skos:narrowMatch to `skos:broadMatch` | `batterypass:batteryMaterials` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `eubat:electrolyteComposition` | skos:narrowMatch to `skos:broadMatch` | `dppk:batteryChemistry` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `eubat:carbonFootprintRawMaterialExtraction` | skos:narrowMatch to `skos:broadMatch` | `dppk:environmentalFootprint` | direction flip toward a peer profile below the 0.8 floor |
| 0.71 | `eubat:recoveryMaterial` | skos:narrowMatch to `skos:broadMatch` | `batterypass:batteryMaterialName` | direction flip toward a peer profile below the 0.8 floor |
| 0.70 | `eubat:functionalUnit` | `skos:broadMatch` | `untp:unit` | new mapping below the 0.8 floor |
| 0.70 | `eubat:substanceLocation` | rdfs:seeAlso to `skos:broadMatch` | `semic:location` | seeAlso upgrade below the 0.8 floor |
| 0.70 | `eubat:supplierContact` | `skos:narrowMatch` | `batterypass:addressOfSupplier` | new mapping below the 0.8 floor |
| 0.69 | `eubat:remainingUsableEnergy` | skos:broadMatch to `skos:narrowMatch` | `batterypass:remainingEnergy` | direction flip toward a peer profile below the 0.8 floor |
| 0.68 | `eubat:electrolyteComposition` | `skos:broadMatch` | `dppk:materialComposition` | new mapping below the 0.8 floor |
| 0.68 | `eubat:safetyInstructions` | skos:broadMatch to `skos:narrowMatch` | `batterypass:safetyInstructions` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.68 | `eubat:internalResistance` | rdfs:seeAlso to `skos:narrowMatch` | `bpr:InitialInternalResistanceOfBatteryCellAndPackModuleRecommended` | our term is a property, target is a class |
| 0.68 | `eubat:safetyInstructionsForDismantling` | skos:narrowMatch to `skos:broadMatch` | `untp:materialSafetyInformation` | direction flip toward a peer profile below the 0.8 floor |
| 0.68 | `eubat:powerCapability` | skos:broadMatch to `skos:narrowMatch` | `batterypass:originalPowerCapability` | direction flip toward a peer profile below the 0.8 floor |
| 0.68 | `eubat:isSubstanceOfConcern` | rdfs:seeAlso to `skos:broadMatch` | `gs1:ingredientOfConcern` | gs1 domain FoodBeverageTobaccoProduct is foreign to a passport |
| 0.68 | `eubat:nickelPostConsumerShare` | rdfs:seeAlso to `skos:broadMatch` | `dppk:recycledContentPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `eubat:supplyChainIndex` | rdfs:seeAlso to `skos:closeMatch` | `bpr:SupplyChainIndices` | our term is a property, target is a class |
| 0.68 | `eubat:lithiumRecycledShare` | skos:narrowMatch to `skos:broadMatch` | `batterypass:recycledContent` | direction flip toward a peer profile below the 0.8 floor |
| 0.68 | `eubat:supplierContact` | `skos:narrowMatch` | `batterypass:supplierWebAddress` | new mapping below the 0.8 floor |
| 0.67 | `eubat:lithiumRecycledShare` | rdfs:seeAlso to `skos:narrowMatch` | `bpr:Post-consumerRecycledLithiumShare` | our term is a property, target is a class |
| 0.67 | `eubat:dismantlingInstructions` | `skos:broadMatch` | `dppk:instructionsForUse` | new mapping below the 0.8 floor |
| 0.65 | `eubat:powerCapabilityAt20SoC` | `skos:broadMatch` | `batterypass:powerCapabilityAt` | new mapping below the 0.8 floor |
| 0.65 | `eubat:carbonFootprintRawMaterialExtraction` | `skos:broadMatch` | `dppk:mtcCarbonEquivalent` | new mapping below the 0.8 floor |
| 0.61 | `eubat:carbonFootprintProduction` | `skos:broadMatch` | `batterypass:carbonFootprint` | new mapping below the 0.8 floor |
| 0.60 | `eubat:verificationDate` | rdfs:seeAlso to `skos:closeMatch` | `schemaorg:auditDate` | seeAlso upgrade below the 0.8 floor |

## core

From `skos-completeness-core-2026-07-28.json`. 169 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.99 | `oec:EnergyEfficiencyClass` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.96 | `oec:OperatorRole` | `skos:exactMatch` | `dppk:EconomicOperatorRole` | our term is a type, target is the entity |
| 0.95 | `oec:carbonFootprintRawMaterial` | `skos:exactMatch` | `bpr:ContributionOfRawMaterialAcquisitionAndPre-processingLifecycleStage` | our term is a property, target is a class |
| 0.94 | `oec:energyEfficiency` | `skos:narrowMatch` | `bpr:InitialRoundTripEnergyEfficiency` | our term is a property, target is a class |
| 0.94 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:topValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:leftValueString` | our term is a structural value carrier |
| 0.94 | `oec:DepositReturnScheme` | `skos:broadMatch` | `gs1:ReturnablePackageDepositDetails` | our term is a type, target is the entity |
| 0.94 | `oec:carbonFootprintDistribution` | `skos:broadMatch` | `bpr:AbsoluteBatteryCarbonFootprint` | our term is a property, target is a class |
| 0.94 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:rightValueString` | our term is a structural value carrier |
| 0.93 | `oec:lastUpdated` | `skos:exactMatch` | `bpr:Date-timeOfLatestUpdateOfDPP` | our term is a property, target is a class |
| 0.93 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `gs1:authenticitySecurityFeatureValue` | our term is a structural value carrier |
| 0.93 | `oec:recycledContentDetails` | `skos:narrowMatch` | `bpr:Post-consumerRecycledCobaltShare` | our term is a property, target is a class |
| 0.93 | `oec:recycledContentDetails` | `skos:narrowMatch` | `bpr:Pre-consumerRecycledLithiumShare` | our term is a property, target is a class |
| 0.93 | `oec:energyEfficiency` | `skos:narrowMatch` | `bpr:RoundTripEnergyEfficiencyAt50OfCycleLife` | our term is a property, target is a class |
| 0.92 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:textValue` | our term is a structural value carrier |
| 0.92 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:valueReference` | our term is a structural value carrier |
| 0.92 | `oec:value` | `skos:narrowMatch` | `semic:supportsValue` | our term is a structural value carrier |
| 0.92 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:rightValue` | our term is a structural value carrier |
| 0.92 | `oec:componentIdentifier` | `skos:narrowMatch` | `bpr:BatteryModelIdentifier` | our term is a property, target is a class |
| 0.92 | `oec:recycledContentDetails` | `skos:narrowMatch` | `bpr:RecycledLeadShare` | our term is a property, target is a class |
| 0.92 | `oec:recycledContentDetails` | `skos:narrowMatch` | `bpr:Pre-consumerRecycledNickelShare` | our term is a property, target is a class |
| 0.92 | `oec:lastDataUpdate` | `skos:exactMatch` | `bpr:Date-timeOfLatestUpdateOfDPP` | our term is a property, target is a class |
| 0.92 | `oec:recycledContentDetails` | `skos:narrowMatch` | `bpr:Post-consumerRecycledNickelShare` | our term is a property, target is a class |
| 0.92 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `gs1:additionalProductClassificationValue` | our term is a structural value carrier |
| 0.91 | `oec:recycledContentDetails` | `skos:narrowMatch` | `bpr:Post-consumerRecycledLithiumShare` | our term is a property, target is a class |
| 0.91 | `oec:economicOperatorId` | `skos:exactMatch` | `bpr:UniqueEconomicOperatorIdentifier` | our term is a property, target is a class |
| 0.90 | `oec:OperatorInformation` | `skos:narrowMatch` | `other:EconomicOperatorRole` | deferred by a curator: An operator record (name, address, identifiers) against a role enumeration: the same level confusion already resolved for oec:OperatorRole, which CIRPASS2_ALIGNMENT.md records as pointer-only. |
| 0.89 | `oec:EnergyEfficiencyClass` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:EnergyConsumptionDetails` | our term is a type, target is the entity |
| 0.89 | `oec:RepairProvider` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:AutoRepair` | schema:AutoRepair belongs to an area foreign to a passport |
| 0.89 | `oec:recycledContentDetails` | `skos:narrowMatch` | `bpr:Pre-consumerRecycledCobaltShare` | our term is a property, target is a class |
| 0.89 | `oec:stageValue` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.88 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:originalCodeValue` | our term is a structural value carrier |
| 0.87 | `oec:carbonFootprintTotal` | `skos:exactMatch` | `bpr:AbsoluteBatteryCarbonFootprint` | our term is a property, target is a class |
| 0.86 | `oec:postConsumerRecycledContent` | `skos:narrowMatch` | `bpr:Post-consumerRecycledLithiumShare` | our term is a property, target is a class |
| 0.86 | `oec:RepairProvider` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:MotorcycleRepair` | schema:MotorcycleRepair belongs to an area foreign to a passport |
| 0.85 | `oec:recycledContent` | `skos:narrowMatch` | `bpr:Post-consumerRecycledNickelShare` | our term is a property, target is a class |
| 0.85 | `oec:postConsumerRecycledContent` | `skos:broadMatch` | `bpr:RenewableContentShare` | our term is a property, target is a class |
| 0.85 | `oec:expectedLifespan` | `skos:narrowMatch` | `bpr:ExpectedLifetimeInCalendarYears` | our term is a property, target is a class |
| 0.85 | `oec:postConsumerRecycledContent` | `skos:narrowMatch` | `bpr:Post-consumerRecycledCobaltShare` | our term is a property, target is a class |
| 0.84 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `semic:hasValue` | our term is a structural value carrier |
| 0.84 | `oec:recycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:recycledContent` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.83 | `oec:EnvironmentalProductDeclaration` | `skos:narrowMatch` | `schemaorg:EnergyConsumptionDetails` | deferred by a curator: An EN 15804 environmental product declaration covers impact indicators across the whole life cycle; schema:EnergyConsumptionDetails carries appliance energy figures. Neither subsumes the other. |
| 0.83 | `oec:economicOperatorId` | `skos:broadMatch` | `bpr:EconomicOperatorInformation` | our term is a property, target is a class |
| 0.83 | `oec:OperationalScope` | skos:broadMatch to `skos:narrowMatch` | `batterypass:CarbonFootprintPerLifecycleStageEntity` | our term is a type, target is the entity |
| 0.82 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `schemaorg:codeValue` | our term is a structural value carrier |
| 0.82 | `oec:recyclabilityScore` | `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.82 | `oec:productCategory` | `skos:narrowMatch` | `bpr:BatteryCategory` | our term is a property, target is a class |
| 0.81 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:value` | target is a structural value carrier |
| 0.81 | `oec:recycledContent` | `skos:narrowMatch` | `bpr:Post-consumerRecycledLithiumShare` | our term is a property, target is a class |
| 0.81 | `oec:DocumentReference` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:APIReference` | schema:APIReference belongs to an area foreign to a passport |
| 0.81 | `oec:facilityId` | skos:broadMatch to `skos:narrowMatch` | `dppk:manufacturingFacility` | deferred by a curator: An identifier is not broader than the thing it identifies: oec:facilityId is the identifier, dppk:manufacturingFacility the facility reference. oec:facilityInformation is the term that compares. |
| 0.81 | `oec:recycledContent` | `skos:narrowMatch` | `bpr:RecycledLeadShare` | our term is a property, target is a class |
| 0.81 | `oec:recycledContent` | `skos:narrowMatch` | `bpr:Pre-consumerRecycledNickelShare` | our term is a property, target is a class |
| 0.80 | `oec:recycledContent` | `skos:narrowMatch` | `bpr:Post-consumerRecycledCobaltShare` | our term is a property, target is a class |
| 0.80 | `oec:carbonFootprint` | `skos:narrowMatch` | `bpr:BatteryCarbonFootprintPerFunctionalUnit` | our term is a property, target is a class |
| 0.80 | `oec:materialComposition` | `skos:narrowMatch` | `gs1:textileMaterialPercentage` | gs1:textileMaterialPercentage is a general Layer-1 term, so narrowMatch inverts the relation; broadMatch is the direction |
| 0.80 | `oec:carbonFootprint` | `skos:narrowMatch` | `bpr:AbsoluteBatteryCarbonFootprint` | our term is a property, target is a class |
| 0.80 | `oec:preConsumerRecycledContent` | `skos:narrowMatch` | `bpr:Pre-consumerRecycledNickelShare` | our term is a property, target is a class |
| 0.79 | `oec:recycledContent` | `skos:narrowMatch` | `bpr:Pre-consumerRecycledCobaltShare` | our term is a property, target is a class |
| 0.79 | `oec:ProductCategory` | `skos:broadMatch` | `untp:Product` | our term is a type, target is the entity |
| 0.79 | `oec:EnvironmentalProductDeclaration` | skos:broadMatch to `skos:narrowMatch` | `batterypass:CarbonFootprintPerLifecycleStageEntity` | direction flip toward a peer profile below the 0.8 floor |
| 0.79 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:carbonFootprintPerLifecycleStage` | direction flip toward a peer profile below the 0.8 floor |
| 0.79 | `oec:SingleValuedDataElement` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:QuantitativeValue` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `oec:dismantlingInstructions` | skos:broadMatch to `skos:narrowMatch` | `batterypass:dismantlingAndRemovalInformation` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `oec:economicOperatorId` | rdfs:seeAlso to `skos:broadMatch` | `gs1:additionalOrganizationID` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:recycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:postConsumerRecycledContentPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:carbonFootprintUse` | skos:narrowMatch to `skos:broadMatch` | `batterypass:carbonFootprint` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `oec:preConsumerRecycledContent` | `skos:narrowMatch` | `bpr:Pre-consumerRecycledCobaltShare` | our term is a property, target is a class |
| 0.78 | `oec:productCategory` | skos:broadMatch to `skos:narrowMatch` | `batterypass:batteryCategory` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `oec:ProductCategory` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Product` | our term is a type, target is the entity |
| 0.78 | `oec:recycledContentDetails` | skos:broadMatch to `skos:narrowMatch` | `untp:recycledMassFraction` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `oec:operatorInformation` | `skos:narrowMatch` | `bpr:ManufacturerInformation` | our term is a property, target is a class |
| 0.78 | `oec:materialComposition` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:packagingMaterialCompositionQuantity` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:reportUrl` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:supplyChainDueDiligenceReport` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:passportIdentifier` | skos:broadMatch to `skos:narrowMatch` | `batterypass:batteryPassportIdentifier` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `oec:multiLanguageValue` | `skos:broadMatch` | `untp:value` | new mapping below the 0.8 floor |
| 0.78 | `oec:CarbonFootprintDeclaration` | `skos:broadMatch` | `other:EnvironmentalFootprint` | new mapping below the 0.8 floor |
| 0.78 | `oec:identityCredentialUrl` | skos:narrowMatch to `skos:broadMatch` | `dppk:verifiableCredential` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `oec:LifecycleStageResult` | skos:broadMatch to `skos:narrowMatch` | `batterypass:CarbonFootprintPerLifecycleStageEntity` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `oec:carbonFootprintProduction` | skos:narrowMatch to `skos:broadMatch` | `batterypass:absoluteCarbonFootprint` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `oec:HazardousSubstance` | rdfs:seeAlso to `skos:broadMatch` | `other:Substance` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:materialComposition` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:textileMaterialContent` | gs1:textileMaterialContent is a general Layer-1 term, so narrowMatch inverts the relation; broadMatch is the direction |
| 0.77 | `oec:stageValue` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:remainingCapacityValue` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:endOfLifeInstructions` | skos:narrowMatch to `skos:broadMatch` | `batterypass:endOfLifeInformation` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `oec:technicalLifetime` | skos:narrowMatch to `skos:broadMatch` | `batterypass:batteryTechnicalProperties` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `oec:carbonFootprint` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:absoluteCarbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:massFraction` | `skos:narrowMatch` | `untp:recycledMassFraction` | new mapping below the 0.8 floor |
| 0.77 | `oec:stageValue` | `skos:narrowMatch` | `batterypass:remainingRoundTripEnergyEfficiencyValue` | new mapping below the 0.8 floor |
| 0.77 | `oec:RecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:RecycledContentEntity` | seeAlso upgrade below the 0.8 floor |
| 0.76 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.76 | `oec:stageValue` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:capacityThroughputValue` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:compostabilityStandard` | `skos:broadMatch` | `untp:standard` | new mapping below the 0.8 floor |
| 0.75 | `oec:materialCircularityIndicator` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:recyclabilityScore` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:lifecycleStageResult` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:carbonFootprintPerLifecycleStage` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:ProductCategory` | skos:narrowMatch to `skos:broadMatch` | `gs1:Product` | our term is a type, target is the entity |
| 0.75 | `oec:traceabilityPerformance` | `skos:broadMatch` | `untp:requiredPerformance` | new mapping below the 0.8 floor |
| 0.75 | `oec:passportVersion` | `skos:broadMatch` | `dppk:versionNumber` | new mapping below the 0.8 floor |
| 0.75 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:evolutionOfSelfDischargeValue` | direction flip toward a peer profile below the 0.8 floor |
| 0.75 | `oec:multiLanguageValue` | `skos:broadMatch` | `schemaorg:textValue` | new mapping below the 0.8 floor |
| 0.75 | `oec:tradeItemPieceDescription` | rdfs:seeAlso to `skos:broadMatch` | `gs1:additionalProductDescription` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:separateCollectionInfo` | `skos:broadMatch` | `batterypass:informationOnCollection` | new mapping below the 0.8 floor |
| 0.75 | `oec:lifecycleStage` | skos:narrowMatch to `skos:broadMatch` | `batterypass:lifecycleStage` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.75 | `oec:carbonFootprint` | skos:broadMatch to `skos:narrowMatch` | `batterypass:batteryCarbonFootprint` | direction flip toward a peer profile below the 0.8 floor |
| 0.75 | `oec:carbonFootprintEndOfLife` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:TraceabilityPerformance` | rdfs:seeAlso to `skos:broadMatch` | `untp:PerformanceMetric` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:SingleValuedDataElement` | `skos:broadMatch` | `schemaorg:PropertyValueSpecification` | target is a structural value carrier |
| 0.75 | `oec:DataElementCollection` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Collection` | schema:Collection belongs to an area foreign to a passport |
| 0.75 | `oec:multiLanguageValue` | `skos:broadMatch` | `dppk:dimensionValue` | new mapping below the 0.8 floor |
| 0.73 | `oec:carbonFootprintProduction` | skos:narrowMatch to `skos:broadMatch` | `dppk:carbonFootprint` | direction flip toward a peer profile below the 0.8 floor |
| 0.73 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:remainingEnergyValue` | direction flip toward a peer profile below the 0.8 floor |
| 0.73 | `oec:carbonFootprintEndOfLife` | skos:narrowMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | direction flip toward a peer profile below the 0.8 floor |
| 0.73 | `oec:declaredUnit` | `skos:narrowMatch` | `bpr:BatteryCarbonFootprintPerFunctionalUnit` | our term is a property, target is a class |
| 0.73 | `oec:carbonFootprintUse` | `skos:narrowMatch` | `batterypass:batteryCarbonFootprint` | new mapping below the 0.8 floor |
| 0.73 | `oec:preConsumerRecycledContent` | rdfs:seeAlso to `skos:broadMatch` | `untp:recycledMassFraction` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `oec:BiodegradabilityTestMethod` | skos:narrowMatch to `skos:broadMatch` | `semic:Criterion` | our term is a type, target is the entity |
| 0.73 | `oec:crmListVersion` | skos:narrowMatch to `skos:broadMatch` | `dppk:dppSchemaVersion` | direction flip toward a peer profile below the 0.8 floor |
| 0.73 | `oec:powerConsumptionOn` | `skos:broadMatch` | `dppk:ratedPower` | new mapping below the 0.8 floor |
| 0.73 | `oec:reportUrl` | `skos:broadMatch` | `batterypass:documentURL` | new mapping below the 0.8 floor |
| 0.73 | `oec:stageValue` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:numberOfFullCyclesValue` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `oec:carbonFootprintTotal` | `skos:narrowMatch` | `batterypass:batteryCarbonFootprint` | new mapping below the 0.8 floor |
| 0.73 | `oec:CustomsCommodityCodeType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:CategoryCode` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `oec:identityCredentialUrl` | rdfs:seeAlso to `skos:broadMatch` | `gs1:referencedFileURL` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `oec:carbonFootprintProduction` | `skos:closeMatch` | `bpr:ContributionOfMainProductProductionLifecycleStage` | our term is a property, target is a class |
| 0.72 | `oec:crmListVersion` | skos:narrowMatch to `skos:broadMatch` | `dppk:versionNumber` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `oec:carbonFootprintTotal` | skos:broadMatch to `skos:narrowMatch` | `batterypass:carbonFootprintPerLifecycleStage` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:preConsumerRecycledContentPercentage` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `oec:MultiLanguageValue` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:StructuredValue` | target is a structural value carrier |
| 0.72 | `oec:lifecycleStageResult` | `skos:narrowMatch` | `bpr:ContributionOfRawMaterialAcquisitionAndPre-processingLifecycleStage` | our term is a property, target is a class |
| 0.72 | `oec:indicatorTotalValue` | skos:narrowMatch to `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.72 | `oec:performanceInfo` | `skos:narrowMatch` | `untp:claimedPerformance` | new mapping below the 0.8 floor |
| 0.72 | `oec:RecyclabilityAssessment` | skos:narrowMatch to `skos:broadMatch` | `untp:ConformityAssessment` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `oec:wastePreventionInfo` | `skos:narrowMatch` | `batterypass:informationOnCollection` | new mapping below the 0.8 floor |
| 0.72 | `oec:postConsumerRecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:recycledContent` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `oec:dueDiligenceReport` | `skos:broadMatch` | `untp:documentation` | new mapping below the 0.8 floor |
| 0.72 | `oec:carbonFootprint` | skos:broadMatch to `skos:narrowMatch` | `batterypass:carbonFootprint` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.72 | `oec:CustomsCommodityCodeType` | rdfs:seeAlso to `skos:broadMatch` | `gs1:TypeCode` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `oec:epdStandard` | `skos:broadMatch` | `gs1:certificationStandard` | new mapping below the 0.8 floor |
| 0.72 | `oec:traceabilityPerformance` | `skos:broadMatch` | `dppk:performance` | new mapping below the 0.8 floor |
| 0.71 | `oec:facilityInformation` | `skos:narrowMatch` | `bpr:ManufacturingPlace` | our term is a property, target is a class |
| 0.71 | `oec:reportUrl` | rdfs:seeAlso to `skos:broadMatch` | `gs1:referencedFileURL` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:energyThroughputValue` | direction flip toward a peer profile below the 0.8 floor |
| 0.71 | `oec:substancesOfConcern` | rdfs:seeAlso to `skos:closeMatch` | `gs1:ingredientOfConcern` | gs1 domain FoodBeverageTobaccoProduct is foreign to a passport |
| 0.70 | `oec:wastePreventionInfo` | `skos:narrowMatch` | `bpr:InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` | our term is a property, target is a class |
| 0.70 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:preConsumerRecycledContent` | direction flip toward a peer profile below the 0.8 floor |
| 0.70 | `oec:carbonFootprintUse` | `skos:broadMatch` | `dppk:carbonFootprint` | new mapping below the 0.8 floor |
| 0.70 | `oec:conformityDeclaration` | rdfs:seeAlso to `skos:broadMatch` | `gs1:certification` | seeAlso upgrade below the 0.8 floor |
| 0.70 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:capacityFadeValue` | direction flip toward a peer profile below the 0.8 floor |
| 0.70 | `oec:carbonFootprint` | skos:broadMatch to `skos:narrowMatch` | `batterypass:carbonFootprintPerLifecycleStage` | direction flip toward a peer profile below the 0.8 floor |
| 0.70 | `oec:FacilityInformation` | `skos:narrowMatch` | `gs1:LocationID_Details` | new mapping below the 0.8 floor |
| 0.70 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:postConsumerRecycledContent` | direction flip toward a peer profile below the 0.8 floor |
| 0.69 | `oec:carbonFootprintProduction` | `skos:broadMatch` | `dppk:carbonFootprintAbsolute` | new mapping below the 0.8 floor |
| 0.69 | `oec:HazardousSubstance` | skos:broadMatch to `skos:narrowMatch` | `batterypass:HazardousSubstanceEntity` | direction flip toward a peer profile below the 0.8 floor |
| 0.69 | `oec:hazardousSubstances` | `skos:broadMatch` | `dppk:textileSubstancesOfConcern` | new mapping below the 0.8 floor |
| 0.68 | `oec:carbonFootprintUse` | `skos:broadMatch` | `dppk:carbonFootprintAbsolute` | new mapping below the 0.8 floor |
| 0.68 | `oec:indicatorTotalValue` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.68 | `oec:dismantlingGuideUrl` | `skos:broadMatch` | `batterypass:dismantlingAndRemovalInformation` | new mapping below the 0.8 floor |
| 0.68 | `oec:dismantlingInstructions` | `skos:narrowMatch` | `bpr:DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` | our term is a property, target is a class |
| 0.68 | `oec:performanceInfo` | `skos:narrowMatch` | `untp:requiredPerformance` | new mapping below the 0.8 floor |
| 0.68 | `oec:materialComposition` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:recycledMaterial` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `oec:stageValue` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:internalResistanceIncreaseValue` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `oec:carbonFootprintTotal` | `skos:narrowMatch` | `bpr:BatteryCarbonFootprintPerFunctionalUnit` | our term is a property, target is a class |
| 0.68 | `oec:activityClassification` | skos:broadMatch to `skos:narrowMatch` | `other:isic` | direction flip toward a peer profile below the 0.8 floor |
| 0.67 | `oec:powerConsumptionOn` | `skos:broadMatch` | `dppk:power` | new mapping below the 0.8 floor |
| 0.67 | `oec:biodegradationPercentage` | `skos:broadMatch` | `dppk:componentPercentage` | new mapping below the 0.8 floor |
| 0.66 | `oec:carbonFootprintProduction` | `skos:broadMatch` | `dppk:environmentalFootprint` | new mapping below the 0.8 floor |
| 0.65 | `oec:endOfLifeInstructions` | `skos:narrowMatch` | `dppk:textileEndOfLifeInstructions` | new mapping below the 0.8 floor |
| 0.63 | `oec:carbonFootprintProduction` | `skos:broadMatch` | `dppk:carbonFootprintGeneralInfo` | new mapping below the 0.8 floor |
| 0.63 | `oec:FacilityInformation` | rdfs:seeAlso to `skos:broadMatch` | `untp:Facility` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `oec:carbonFootprint` | `skos:broadMatch` | `dppk:environmentalFootprint` | new mapping below the 0.8 floor |

## cpr

From `skos-completeness-cpr-2026-07-28.json`. 10 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.95 | `eucpr:ReactionToFireClass` | `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.93 | `eucpr:ConstructionProductType` | skos:broadMatch to `skos:narrowMatch` | `dppk:BatteryProduct` | our term is a type, target is the entity |
| 0.92 | `eucpr:characteristicValue` | `skos:narrowMatch` | `schemaorg:broadcastFrequencyValue` | every schema domain (BroadcastFrequencySpecification) is foreign to a passport |
| 0.80 | `eucpr:ConstructionProductType` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:IndividualProduct` | schema:IndividualProduct is a general Layer-1 term, so narrowMatch inverts the relation; broadMatch is the direction |
| 0.77 | `eucpr:ConstructionProduct` | `skos:narrowMatch` | `dppk:IronSteelProduct` | new mapping below the 0.8 floor |
| 0.75 | `eucpr:ConstructionProductType` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Product` | our term is a type, target is the entity |
| 0.74 | `eucpr:validationReports` | skos:broadMatch to `skos:narrowMatch` | `batterypass:resultOfTestReport` | direction flip toward a peer profile below the 0.8 floor |
| 0.73 | `eucpr:EssentialCharacteristic` | `skos:broadMatch` | `semic:Criterion` | new mapping below the 0.8 floor |
| 0.69 | `eucpr:EssentialCharacteristic` | `skos:broadMatch` | `gs1:QuantitativeValue` | new mapping below the 0.8 floor |
| 0.68 | `eucpr:ConstructionProductType` | skos:narrowMatch to `skos:broadMatch` | `gs1:Product` | our term is a type, target is the entity |

## detergent

From `skos-completeness-detergent-2026-07-28.json`. 18 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.85 | `eudet:productForm` | `skos:broadMatch` | `gs1:consumerProductVariant` | deferred by a curator: GS1 scopes consumerProductVariant to variants that do NOT require a different GTIN; liquid, powder and tablet are separate trade items. Removed; skos:closeMatch gs1:productFormDescription is the correct GS1 target. |
| 0.84 | `eudet:DetergentCategory` | `skos:broadMatch` | `schemaorg:ProductGroup` | our term is a type, target is the entity |
| 0.78 | `eudet:SurfactantType` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:ChemicalSubstance` | our term is a type, target is the entity |
| 0.78 | `eudet:hazardousSubstances` | skos:narrowMatch to `skos:broadMatch` | `dppk:textileSubstancesOfConcern` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `eudet:Ingredient` | `skos:broadMatch` | `schemaorg:Substance` | new mapping below the 0.8 floor |
| 0.77 | `eudet:ProductForm` | skos:narrowMatch to `skos:broadMatch` | `gs1:Product` | our term is a type, target is the entity |
| 0.76 | `eudet:phosphorusContentPercent` | `skos:broadMatch` | `dppk:componentPercentage` | new mapping below the 0.8 floor |
| 0.75 | `eudet:endProductCharacteristics` | `skos:broadMatch` | `untp:characteristics` | new mapping below the 0.8 floor |
| 0.75 | `eudet:Ingredient` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:ChemicalSubstance` | seeAlso upgrade below the 0.8 floor |
| 0.74 | `eudet:DetergentProduct` | `skos:broadMatch` | `dppk:Product` | new mapping below the 0.8 floor |
| 0.73 | `eudet:hazardousSubstances` | `skos:broadMatch` | `untp:hazardous` | new mapping below the 0.8 floor |
| 0.72 | `eudet:ProductForm` | `skos:broadMatch` | `dppk:Product` | our term is a type, target is the entity |
| 0.72 | `eudet:ProductForm` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Product` | our term is a type, target is the entity |
| 0.70 | `eudet:allergenCasNumber` | skos:narrowMatch to `skos:broadMatch` | `dppk:componentCasNumber` | direction flip toward a peer profile below the 0.8 floor |
| 0.69 | `eudet:ProductForm` | `skos:broadMatch` | `untp:Product` | our term is a type, target is the entity |
| 0.69 | `eudet:ProductForm` | `skos:broadMatch` | `dppk:ProductCharacteristic` | our term is a type, target is the entity |
| 0.66 | `eudet:BiodegradabilityTestMethod` | skos:narrowMatch to `skos:broadMatch` | `semic:Criterion` | our term is a type, target is the entity |
| 0.64 | `eudet:filmBiodegradabilityPercentage` | `skos:broadMatch` | `dppk:environmentalFootprintBenchmarkPercentage` | new mapping below the 0.8 floor |

## electronics

From `skos-completeness-electronics-2026-07-28.json`. 18 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.93 | `euelec:modelIdentifier` | `skos:narrowMatch` | `bpr:BatteryModelIdentifier` | deferred by a curator: Directionally right, but it anchors a generic electronics identifier into a battery-specific longlist attribute. Cross-module anchoring is a governance call. |
| 0.92 | `euelec:recyclingProcess` | `skos:narrowMatch` | `gs1:packagingRecyclingScheme` | deferred by a curator: The GS1 term is packaging-scoped; ours is an electronics treatment process. Domain mismatch that the GS1 foreign-domain list does not cover. |
| 0.91 | `euelec:newVersion` | `skos:broadMatch` | `schemaorg:assemblyVersion` | every schema domain (APIReference) is foreign to a passport |
| 0.91 | `euelec:modelIdentifier` | `skos:narrowMatch` | `bpr:UniqueBatteryIdentifierUniqueProductIdentifier` | deferred by a curator: Same cross-module question as the BatteryModelIdentifier anchor. |
| 0.89 | `euelec:treatmentFacility` | `skos:broadMatch` | `untp:fromFacility` | deferred by a curator: Different roles: ours is where treatment happened, UNTP's is a shipment origin. |
| 0.88 | `euelec:recyclingProcess` | skos:closeMatch to `skos:narrowMatch` | `gs1:packagingRecyclingProcessType` | regrade skos:closeMatch to skos:narrowMatch |
| 0.88 | `euelec:refreshRate` | skos:narrowMatch to `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.88 | `euelec:energyEfficiencyClass` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:hasEnergyConsumptionDetails` | deferred by a curator: Our property carries an efficiency class label; the schema.org property links to a consumption-details node. Related, but not one subsuming the other. |
| 0.87 | `euelec:EURepairabilityClass` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.82 | `euelec:newVersion` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:softwareVersion` | every schema domain (SoftwareApplication) is foreign to a passport |
| 0.81 | `euelec:nextDisposition` | `skos:exactMatch` | `untp:disposition` | deferred by a curator: exactMatch is a strong claim for a WEEE routing decision against UNTP's general disposition; closeMatch may be the honest grade. |
| 0.78 | `euelec:peakBrightness` | `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.78 | `euelec:screenDiagonal` | skos:narrowMatch to `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.77 | `euelec:ComponentType` | rdfs:seeAlso to `skos:broadMatch` | `dppk:Component` | our term is a type, target is the entity |
| 0.73 | `euelec:RepairCriterion` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Rating` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `euelec:RepairCriterionType` | rdfs:seeAlso to `skos:broadMatch` | `semic:Criterion` | our term is a type, target is the entity |
| 0.71 | `euelec:collectionMethod` | `skos:narrowMatch` | `batterypass:separateCollection` | new mapping below the 0.8 floor |
| 0.70 | `euelec:RepairCriterionType` | rdfs:seeAlso to `skos:broadMatch` | `untp:Criterion` | our term is a type, target is the entity |

## eudr

From `skos-completeness-eudr-2026-07-28.json`. 8 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.94 | `eudr:TimberProductType` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Product` | our term is a type, target is the entity |
| 0.93 | `eudr:TimberProductType` | skos:narrowMatch to `skos:broadMatch` | `gs1:Product` | our term is a type, target is the entity |
| 0.92 | `eudr:transformationLocation` | rdfs:seeAlso to `skos:broadMatch` | `semic:Location` | our term is a property, target is a class |
| 0.87 | `eudr:TimberProductType` | `skos:broadMatch` | `dppk:ConstructionProduct` | our term is a type, target is the entity |
| 0.86 | `eudr:DueDiligenceStatement` | `skos:broadMatch` | `gs1:RegulatoryIdentifier` | deferred by a curator: A due-diligence statement is a document, not an identifier; the subsumption does not hold in either direction. |
| 0.78 | `eudr:ActorRole` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Role` | our term is a type, target is the entity |
| 0.73 | `eudr:ActorRole` | `skos:broadMatch` | `semic:Participation` | our term is a type, target is the entity |
| 0.65 | `eudr:countryList` | `skos:narrowMatch` | `untp:countryName` | new mapping below the 0.8 floor |

## fsma204

From `skos-completeness-fsma204-2026-07-28.json`. 1 confirmed finding the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.70 | `usfsma:foodTraceabilityListCategory` | `skos:broadMatch` | `untp:productCategory` | new mapping below the 0.8 floor |

## iron-steel

From `skos-completeness-iron-steel-2026-07-28.json`. 6 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.88 | `eusteel:heatNumber` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:serialNumber` | deferred by a curator: Granularity, not specificity: schema:serialNumber is domained on schema:IndividualProduct, so it identifies one piece, while a heat number identifies the melt every piece came from. Downgraded to rdfs:seeAlso; the batch-level skos:closeMatch to gs1:hasBatchLotNumber carries the mapping. |
| 0.79 | `eusteel:meltAndPourCountry` | rdfs:seeAlso to `skos:broadMatch` | `untp:countryCode` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eusteel:IronSteelProduct` | skos:narrowMatch to `skos:broadMatch` | `untp:Product` | direction flip toward a peer profile below the 0.8 floor |
| 0.75 | `eusteel:IronSteelProduct` | skos:narrowMatch to `skos:broadMatch` | `dppk:Product` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `eusteel:IronSteelProduct` | skos:narrowMatch to `skos:broadMatch` | `dppk:ConstructionProduct` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `eusteel:mtcNominalSize` | `skos:broadMatch` | `rail:nominalValue` | new mapping below the 0.8 floor |

## ppwr

From `skos-completeness-ppwr-2026-07-28.json`. 1 confirmed finding the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.91 | `euppwr:PackagingTier` | `skos:broadMatch` | `gs1:PackagingDetails` | our term is a type, target is the entity |

## textile

From `skos-completeness-textile-2026-07-28.json`. 48 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.95 | `eutex:TestStandard` | skos:narrowMatch to `skos:broadMatch` | `untp:Standard` | our term is a type, target is the entity |
| 0.93 | `eutex:SubstanceOfConcernType` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Substance` | our term is a type, target is the entity |
| 0.92 | `eutex:benchmarkPerformance` | rdfs:seeAlso to `skos:exactMatch` | `dppk:environmentalFootprintBenchmarkPercentage` | deferred by a curator: skos:exactMatch contradicts our own bridge documentation: DPP_KEYSTONE_MAPPING.md records this as Partial because eutex:benchmarkPerformance collapses BOTH dppk:environmentalFootprintBenchmarkPercentage and dppk:carbonFootprintBenchmarkPercentage, a distinction dppk makes and we do not. Our term is the broader one, so the honest grade is narrowMatch or closeMatch, not exactMatch. |
| 0.92 | `eutex:substanceConcentration` | `skos:narrowMatch` | `gs1:juiceContentPercent` | gs1 domain FoodBeverageTobaccoProduct is foreign to a passport |
| 0.92 | `eutex:substanceConcentration` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.90 | `eutex:dyeingFacility` | `skos:broadMatch` | `bpr:ManufacturingPlace` | our term is a property, target is a class |
| 0.90 | `eutex:weavingFacility` | `skos:broadMatch` | `bpr:ManufacturingPlace` | our term is a property, target is a class |
| 0.86 | `eutex:additionalCareInstructions` | `skos:narrowMatch` | `dppk:textileRepairInstructions` | deferred by a curator: The term is a free-text overflow field ("Additional care instructions in text form"), so claiming it is BROADER than a specific instruction kind over-claims. The panel is also self-inconsistent here: it rejected dppk:safeUseInstructions at 0.97 while accepting dppk:textileSafeUseInstructions at 0.85. |
| 0.85 | `eutex:additionalCareInstructions` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:consumerStorageInstructions` | deferred by a curator: Same over-claim. The existing rdfs:seeAlso is the honest relation between a free-text care field and GS1's storage instructions. |
| 0.85 | `eutex:additionalCareInstructions` | `skos:narrowMatch` | `dppk:textileSafeUseInstructions` | deferred by a curator: Same over-claim as dppk:textileRepairInstructions: a free-text catch-all is not the parent concept of a specific instruction kind. |
| 0.85 | `eutex:DurabilityClass` | `skos:broadMatch` | `schemaorg:Rating` | our term is a type, target is the entity |
| 0.83 | `eutex:FootprintDataType` | `skos:narrowMatch` | `batterypass:CarbonFootprintPerLifecycleStageEntity` | our term is a type, target is the entity |
| 0.83 | `eutex:additionalCareInstructions` | `skos:narrowMatch` | `dppk:disassemblyInstructions` | deferred by a curator: Same over-claim, and disassembly is not a care instruction at all. |
| 0.80 | `eutex:lciaValue` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.78 | `eutex:spiralityScore` | rdfs:seeAlso to `skos:broadMatch` | `untp:score` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eutex:ApparelSubcategory` | skos:broadMatch to `skos:narrowMatch` | `dppk:PefcrApparelAccessories` | our term is a type, target is the entity |
| 0.78 | `eutex:spinningFacility` | skos:narrowMatch to `skos:broadMatch` | `batterypass:manufacturingPlace` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `eutex:seasonCollection` | skos:narrowMatch to `skos:broadMatch` | `gs1:seasonCalendarYear` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.77 | `eutex:cutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:countryOfAssembly` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eutex:finishingFacility` | `skos:broadMatch` | `bpr:ManufacturingPlace` | our term is a property, target is a class |
| 0.75 | `eutex:maxConcentration` | skos:narrowMatch to `skos:broadMatch` | `batterypass:hazardousSubstanceConcentration` | direction flip toward a peer profile below the 0.8 floor |
| 0.75 | `eutex:cutAndSewFacility` | `skos:broadMatch` | `gs1:countryOfAssembly` | new mapping below the 0.8 floor |
| 0.75 | `eutex:CLPHazardCategory` | `skos:broadMatch` | `schemaorg:CategoryCode` | new mapping below the 0.8 floor |
| 0.75 | `eutex:seasonCollection` | skos:narrowMatch to `skos:broadMatch` | `gs1:seasonName` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.73 | `eutex:organicContentPercentage` | skos:narrowMatch to `skos:broadMatch` | `batterypass:renewableContent` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `eutex:apparelSubcategory` | rdfs:seeAlso to `skos:broadMatch` | `gs1:additionalProductClassification` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `eutex:cutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:manufacturingPlace` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `eutex:spinningFacility` | `skos:broadMatch` | `bpr:ManufacturingPlace` | our term is a property, target is a class |
| 0.72 | `eutex:carbonFootprintManufacturing` | skos:narrowMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `eutex:carbonFootprintManufacturing` | skos:narrowMatch to `skos:broadMatch` | `batterypass:carbonFootprint` | direction flip toward a peer profile below the 0.8 floor |
| 0.71 | `eutex:robustnessAssessment` | `skos:broadMatch` | `untp:conformityAssessment` | new mapping below the 0.8 floor |
| 0.70 | `eutex:RecycledContentDeclaration` | `skos:broadMatch` | `dppk:DeclarationOfPerformance` | new mapping below the 0.8 floor |
| 0.70 | `eutex:cutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `dppk:facilityId` | seeAlso upgrade below the 0.8 floor |
| 0.70 | `eutex:substancesOfConcern` | `skos:broadMatch` | `dppk:hazardousSubstances` | new mapping below the 0.8 floor |
| 0.70 | `eutex:fiberCertification` | rdfs:seeAlso to `skos:broadMatch` | `gs1:certificationIdentification` | seeAlso upgrade below the 0.8 floor |
| 0.69 | `eutex:robustnessAssessment` | `skos:broadMatch` | `untp:assessmentCriteria` | new mapping below the 0.8 floor |
| 0.69 | `eutex:cutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `untp:producedAtFacility` | seeAlso upgrade below the 0.8 floor |
| 0.69 | `eutex:cutAndSewFacility` | `skos:broadMatch` | `bpr:ManufacturingPlace` | our term is a property, target is a class |
| 0.69 | `eutex:euDeclarationOfConformity` | `skos:broadMatch` | `untp:conformityAssessment` | new mapping below the 0.8 floor |
| 0.68 | `eutex:takeBackProgram` | skos:narrowMatch to `skos:broadMatch` | `batterypass:endOfLifeInformation` | direction flip toward a peer profile below the 0.8 floor |
| 0.68 | `eutex:safeUseInstructions` | rdfs:seeAlso to `skos:broadMatch` | `gs1:consumerUsageInstructions` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `eutex:wasteOriginType` | `skos:narrowMatch` | `dppk:animalOriginNonTextile` | new mapping below the 0.8 floor |
| 0.68 | `eutex:substancesOfConcern` | `skos:broadMatch` | `dppk:dangerousSubstances` | new mapping below the 0.8 floor |
| 0.68 | `eutex:benchmarkPerformance` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:carbonFootprintBenchmarkPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.67 | `eutex:robustnessAssessment` | rdfs:seeAlso to `skos:broadMatch` | `untp:assessedPerformance` | seeAlso upgrade below the 0.8 floor |
| 0.65 | `eutex:EnvironmentalFootprint` | rdfs:seeAlso to `skos:narrowMatch` | `other:CarbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `eutex:dimensionalChangePercentage` | rdfs:seeAlso to `skos:closeMatch` | `dppk:dimensionalChange` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `eutex:locationInProduct` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:hazardousSubstanceLocation` | seeAlso upgrade below the 0.8 floor |

## Where the pipeline contradicts itself

155 assertion(s) the ontology already carries were marked `WRONG` by the
bulk grader and then had the correction rejected by the QA panel. Nothing was applied, so
each one is either a mapping worth re-reading or a prompt worth improving. A worked example:
the textile panel rejected `eutex:additionalCareInstructions skos:narrowMatch
schema:additionalProperty` at 0.97 confidence, and it does look inverted, since
`schema:additionalProperty` is a general extension slot rather than a narrower concept.

- **battery**: 44
- **core**: 24
- **electronics**: 24
- **textile**: 21
- **cpr**: 20
- **eudr**: 12
- **iron-steel**: 6
- **detergent**: 3
- **fsma204**: 1

## Remaining `skos:narrowMatch` assertions

279 assertions still read `narrowMatch`. Their targets are peer profiles or
intra-project terms of comparable specificity, where which of the two is narrower is a
modelling question per term. `check:mappings` rule 6 already guards the mechanical class,
the general Layer-1 head terms.

- **BatteryPass SAMM / bpr**: 118
- **DPP Keystone**: 62
- **schema.org tail**: 31
- **GS1 tail**: 21
- **UNTP**: 21
- **intra-project**: 15
- **other**: 6
- **SEMICeu / CCCEV**: 5
