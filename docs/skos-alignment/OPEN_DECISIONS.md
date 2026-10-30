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

## battery

From `skos-completeness-battery-2026-10-29.json`. 78 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.95 | `eubat:renewableContentShare` | skos:exactMatch to `skos:broadMatch` | `batterypass:renewableContent` | regrade skos:exactMatch to skos:broadMatch |
| 0.94 | `eubat:hasCarbonFootprintRecycling` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.92 | `eubat:measurementCertificateUrl` | skos:closeMatch to `skos:broadMatch` | `gs1:certificationInfo` | regrade skos:closeMatch to skos:broadMatch |
| 0.92 | `eubat:DismantlingDocumentType` | `skos:broadMatch` | `eudpp:DocumentFormattedProperty` | our term is a type, target is the entity |
| 0.92 | `eubat:hasNegativeEvents` | skos:closeMatch to `skos:narrowMatch` | `batterypass:negativeEvent` | regrade skos:closeMatch to skos:narrowMatch |
| 0.92 | `eubat:ResponsibleSourcingStandard` | rdfs:seeAlso to `skos:broadMatch` | `untp:Standard` | our term is a type, target is the entity |
| 0.91 | `eubat:safetyMeasures` | `skos:broadMatch` | `batterypass:safetyMeasures` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.91 | `eubat:hasCarbonFootprintTotal` | skos:closeMatch to `skos:narrowMatch` | `batterypass:carbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.90 | `eubat:BatteryStatus` | `skos:broadMatch` | `eudpp:ProductStatus` | our term is a type, target is the entity |
| 0.90 | `eubat:casNumber` | skos:exactMatch to `skos:broadMatch` | `batterypass:batteryMaterialIdentifier` | regrade skos:exactMatch to skos:broadMatch |
| 0.89 | `eubat:ResponsibleSourcingStandard` | `skos:broadMatch` | `eudpp:HarmonisedStandard` | our term is a type, target is the entity |
| 0.89 | `eubat:DismantlingDocumentType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:DigitalDocument` | our term is a type, target is the entity |
| 0.88 | `eubat:leadPreConsumerShare` | skos:closeMatch to `skos:broadMatch` | `batterypass:preConsumerShare` | regrade skos:closeMatch to skos:broadMatch |
| 0.88 | `eubat:safetyMeasures` | `skos:broadMatch` | `cirpass2-battery:safetyMeasures` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.88 | `eubat:hasCarbonFootprintRawMaterialExtraction` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.88 | `eubat:wastePrevention` | skos:closeMatch to `skos:broadMatch` | `batterypass:wastePrevention` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.87 | `eubat:safetyInstructions` | skos:closeMatch to `skos:broadMatch` | `gs1:safetyInfo` | regrade skos:closeMatch to skos:broadMatch |
| 0.87 | `eubat:hasMaterialComposition` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:material` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.87 | `eubat:NegativeEventType` | `skos:broadMatch` | `eudpp:ProductEvent` | our term is a type, target is the entity |
| 0.86 | `eubat:TechnicalSpecification` | `skos:broadMatch` | `eudpp:TechnicalSpecification` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.84 | `eubat:NegativeEventType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Event` | our term is a type, target is the entity |
| 0.83 | `eubat:batteryModelIdentifier` | skos:broadMatch to `skos:narrowMatch` | `batterypass:batteryPassportIdentifier` | deferred by a curator: Different referents: ours identifies the battery model, theirs identifies the passport document about it. Neither subsumes the other. |
| 0.83 | `eubat:PowerCapabilityAtSoC` | skos:closeMatch to `skos:broadMatch` | `batterypass:PowerCapabilityAtEntity` | regrade skos:closeMatch to skos:broadMatch |
| 0.82 | `eubat:RecycledContent` | skos:closeMatch to `skos:narrowMatch` | `batterypass:RecycledContentEntity` | regrade skos:closeMatch to skos:narrowMatch |
| 0.81 | `eubat:hasStateOfCharge` | skos:exactMatch to `skos:closeMatch` | `batterypass:stateOfCharge` | regrade skos:exactMatch to skos:closeMatch |
| 0.80 | `eubat:stateOfChargeLevel` | skos:closeMatch to `skos:broadMatch` | `batterypass:stateOfCharge` | regrade skos:closeMatch to skos:broadMatch |
| 0.80 | `eubat:BatteryStatus` | skos:closeMatch to `skos:broadMatch` | `batterypass:BatteryConditionEntity` | our term is a type, target is the entity |
| 0.80 | `eubat:NegativeEventType` | `skos:narrowMatch` | `cirpass2-battery:AccidentEvent` | our term is a type, target is the entity |
| 0.79 | `eubat:ComponentLocation` | `skos:narrowMatch` | `cirpass2-battery:BatteryLocation` | our term is a type, target is the entity |
| 0.79 | `eubat:hasCarbonFootprintProduction` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.78 | `eubat:hasRemainingRoundTripEfficiency` | skos:exactMatch to `skos:broadMatch` | `batterypass:roundtripEfficiency` | regrade skos:exactMatch to skos:broadMatch |
| 0.78 | `eubat:hasSubstanceLocation` | rdfs:seeAlso to `skos:broadMatch` | `semic:location` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:timeSpentInExtremeTemperaturesBelowBoundary` | `skos:narrowMatch` | `cirpass2-battery:timeSpentChargingInExtremeTemperaturesBelowBoundary` | new mapping below the 0.8 floor |
| 0.78 | `eubat:hasOperatorRole` | skos:closeMatch to `skos:broadMatch` | `semic:role` | regrade skos:closeMatch to skos:broadMatch |
| 0.78 | `eubat:hasCycleCount` | skos:exactMatch to `skos:closeMatch` | `batterypass:numberOfFullCycles` | regrade skos:exactMatch to skos:closeMatch |
| 0.78 | `eubat:hasSupplierContact` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:emailAddressOfSupplier` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:hasSupplierContact` | `skos:broadMatch` | `schemaorg:contactPoints` | schema:contactPoints is superseded by schema:contactPoint |
| 0.78 | `eubat:hasOriginalPowerCapability` | `skos:broadMatch` | `cirpass2-battery:originalPowerCapability` | new mapping below the 0.8 floor |
| 0.78 | `eubat:batteryModelIdentifier` | skos:broadMatch to `skos:narrowMatch` | `batterypass:productIdentifier` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `eubat:labelSymbol` | `skos:narrowMatch` | `cirpass2-battery:separateCollectionSymbol` | new mapping below the 0.8 floor |
| 0.78 | `eubat:ResponsibleSourcingStandard` | `skos:broadMatch` | `cirpass2-textile:AssessmentStandard` | our term is a type, target is the entity |
| 0.77 | `eubat:hasEnergyThroughput` | `skos:narrowMatch` | `cirpass2-battery:remainingUsableBatteryEnergy` | new mapping below the 0.8 floor |
| 0.77 | `eubat:hasTechnicalSpecifications` | `skos:narrowMatch` | `batterypass:originalPowerCapability` | new mapping below the 0.8 floor |
| 0.76 | `eubat:hasOriginalPowerCapability` | skos:closeMatch to `skos:broadMatch` | `batterypass:remainingPowerCapability` | regrade skos:closeMatch to skos:broadMatch |
| 0.76 | `eubat:leadPostConsumerShare` | skos:closeMatch to `skos:broadMatch` | `batterypass:postConsumerShare` | regrade skos:closeMatch to skos:broadMatch |
| 0.75 | `eubat:cobaltRecycledShare` | rdfs:seeAlso to `skos:broadMatch` | `dppk:preConsumerRecycledContentPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eubat:safetyInstructionsForDismantling` | rdfs:seeAlso to `skos:broadMatch` | `dppk:endOfLifeInstructions` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eubat:hasSubstanceLocation` | `skos:broadMatch` | `semic:Location` | our term is a property, target is a class |
| 0.75 | `eubat:inspectorId` | `skos:broadMatch` | `untp:id` | new mapping below the 0.8 floor |
| 0.75 | `eubat:ThirdPartyVerification` | `skos:narrowMatch` | `cirpass2-textile:ManufacturerDeclarationVerificationMethod` | new mapping below the 0.8 floor |
| 0.74 | `eubat:leadPostConsumerShare` | `skos:broadMatch` | `dppk:postConsumerRecycledContent` | new mapping below the 0.8 floor |
| 0.73 | `eubat:hazardImpact` | `skos:narrowMatch` | `batterypass:hazardousSubstanceImpact` | new mapping below the 0.8 floor |
| 0.73 | `eubat:ThirdPartyVerification` | `skos:narrowMatch` | `cirpass2-textile:RecycledContentVerificationMethod` | new mapping below the 0.8 floor |
| 0.73 | `eubat:MaterialRecoveryTarget` | `skos:broadMatch` | `cirpass2-textile:ProcessTargetSpecification` | new mapping below the 0.8 floor |
| 0.73 | `eubat:leadPostConsumerShare` | `skos:broadMatch` | `dppk:postConsumerRecycledMaterialComposition` | new mapping below the 0.8 floor |
| 0.73 | `eubat:cobaltPostConsumerShare` | skos:closeMatch to `skos:broadMatch` | `batterypass:postConsumerShare` | regrade skos:closeMatch to skos:broadMatch |
| 0.73 | `eubat:expectedLifetimeYears` | `skos:narrowMatch` | `cirpass2-battery:expectedLifetimeCalendarYears` | new mapping below the 0.8 floor |
| 0.73 | `eubat:ThirdPartyVerification` | `skos:narrowMatch` | `cirpass2-textile:ChainOfCustodyVerificationMethod` | new mapping below the 0.8 floor |
| 0.73 | `eubat:DismantlingDocument` | skos:narrowMatch to `skos:broadMatch` | `batterypass:DismantlingAndRemovalDocumentation` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `eubat:nickelRecycledShare` | `skos:broadMatch` | `dppk:preConsumerRecycledContentMass` | new mapping below the 0.8 floor |
| 0.72 | `eubat:MaterialRecoveryTarget` | `skos:broadMatch` | `eudpp:RecoverableRate` | new mapping below the 0.8 floor |
| 0.72 | `eubat:hasHazardousSubstances` | `skos:broadMatch` | `untp:hazardous` | new mapping below the 0.8 floor |
| 0.72 | `eubat:hasRecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:postConsumerRecycledContentMass` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `eubat:hasDismantlingDocuments` | `skos:broadMatch` | `batterypass:dismantlingAndRemovalInformation` | new mapping below the 0.8 floor |
| 0.72 | `eubat:nickelRecycledShare` | `skos:broadMatch` | `cirpass2-textile:hasRecycledContentMassFractionValue` | new mapping below the 0.8 floor |
| 0.72 | `eubat:BatteryMaterial` | skos:exactMatch to `skos:broadMatch` | `batterypass:BatteryMaterialEntity` | regrade skos:exactMatch to skos:broadMatch |
| 0.72 | `eubat:recoveryMaterial` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:batteryMaterialName` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `eubat:hasLabelSubject` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:labelingSubject` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `eubat:nickelRecycledShare` | `skos:broadMatch` | `dppk:postConsumerRecycledContentPercentage` | new mapping below the 0.8 floor |
| 0.70 | `eubat:hasInitialCapacity` | `skos:broadMatch` | `other:Capacity` | our term is a property, target is a class |
| 0.69 | `eubat:nickelRecycledShare` | `skos:broadMatch` | `dppk:postConsumerRecycledContentMass` | new mapping below the 0.8 floor |
| 0.69 | `eubat:hasRecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:preConsumerRecycledMaterialComposition` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `eubat:DismantlingDocument` | `skos:broadMatch` | `schemaorg:TextDigitalDocument` | new mapping below the 0.8 floor |
| 0.68 | `eubat:authorizedServiceCenters` | rdfs:seeAlso to `skos:broadMatch` | `gs1:serviceInfo` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `eubat:BatteryMaterial` | `skos:narrowMatch` | `cirpass2-battery:BatteryChemistry` | new mapping below the 0.8 floor |
| 0.68 | `eubat:ComponentLocation` | `skos:closeMatch` | `batterypass:BatteryLocationEntity` | our term is a type, target is the entity |
| 0.65 | `eubat:cobaltPostConsumerShare` | `skos:broadMatch` | `dppk:postConsumerRecycledMaterialComposition` | new mapping below the 0.8 floor |
| 0.63 | `eubat:hasEnergyThroughput` | skos:closeMatch to `skos:narrowMatch` | `batterypass:energyThroughput` | regrade skos:closeMatch to skos:narrowMatch |

## core

From `skos-completeness-core-2026-10-29.json`. 124 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.99 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `gs1:additionalProductClassificationValue` | our term is a structural value carrier |
| 0.98 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasRecyclingYieldValue` | our term is a structural value carrier |
| 0.98 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasRatingValue` | our term is a structural value carrier |
| 0.98 | `oec:value` | `skos:narrowMatch` | `eudpp:minimumNumericalValue` | our term is a structural value carrier |
| 0.98 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:rightValueString` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `rail:leftValue` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `schemaorg:broadcastFrequencyValue` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasRepairResponseTimeValue` | our term is a structural value carrier |
| 0.97 | `oec:EnergyEfficiencyClass` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.97 | `oec:value` | `skos:narrowMatch` | `schemaorg:orderValue` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `eudpp:identifierExampleValue` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasThresholdValue` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasScaleValue` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `eudpp:maximumNumericalValue` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `gs1:additionalOrganizationIdentificationTypeValue` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasRecyclableMassFractionValue` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasRecycledMaterialMassValue` | our term is a structural value carrier |
| 0.97 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasRecycledContentMassFractionValue` | our term is a structural value carrier |
| 0.96 | `oec:value` | `skos:narrowMatch` | `schemaorg:legislationLegalValue` | our term is a structural value carrier |
| 0.96 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:rightValue` | our term is a structural value carrier |
| 0.96 | `oec:value` | `skos:narrowMatch` | `eudpp:numericalValue` | our term is a structural value carrier |
| 0.96 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasQuantitativeValue` | our term is a structural value carrier |
| 0.96 | `oec:value` | `skos:narrowMatch` | `rail:bottomValue` | our term is a structural value carrier |
| 0.96 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasMinimumScoreValue` | our term is a structural value carrier |
| 0.96 | `oec:ImpactIndicatorResult` | skos:broadMatch to `skos:exactMatch` | `eudpp:LCIAResult` | regrade skos:broadMatch to skos:exactMatch |
| 0.95 | `oec:hasCarbonFootprintEndOfLife` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.95 | `oec:GranularityLevel` | `skos:exactMatch` | `eudpp:IdentifierGranularity` | our term is a type, target is the entity |
| 0.95 | `oec:value` | `skos:narrowMatch` | `eudpp:identifierValue` | our term is a structural value carrier |
| 0.95 | `oec:value` | `skos:narrowMatch` | `schemaorg:strengthValue` | our term is a structural value carrier |
| 0.95 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasCharacteristicValue` | our term is a structural value carrier |
| 0.95 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasTextualValue` | our term is a structural value carrier |
| 0.95 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasParameterValue` | our term is a structural value carrier |
| 0.95 | `oec:contentSpecificationId` | skos:closeMatch to `skos:exactMatch` | `dppk:contentSpecificationIds` | regrade skos:closeMatch to skos:exactMatch |
| 0.95 | `oec:EnvironmentalProductDeclaration` | skos:exactMatch to `skos:narrowMatch` | `eudpp:EPDDocument` | regrade skos:exactMatch to skos:narrowMatch |
| 0.95 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:textValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `eudpp:codeValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:numericValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `batterypass:capacityFadeValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasMeasuredValue` | our term is a structural value carrier |
| 0.94 | `oec:DepositReturnScheme` | `skos:broadMatch` | `gs1:ReturnablePackageDepositDetails` | our term is a type, target is the entity |
| 0.94 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `schemaorg:codeValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:value` | target is a structural value carrier |
| 0.94 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `semic:hasValue` | target is a structural value carrier |
| 0.94 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:originalCodeValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasTextualValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasQuantitativeValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `schemaorg:minValue` | target is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasTextualValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasQuantitativeValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `batterypass:stateOfCertifiedEnergyValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | `skos:narrowMatch` | `batterypass:energyThroughputValue` | our term is a structural value carrier |
| 0.94 | `oec:RecycledContent` | `skos:narrowMatch` | `cirpass2-textile:RecycledContent` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.94 | `oec:passportStatus` | skos:closeMatch to `skos:exactMatch` | `eudpp:dppStatus` | regrade skos:closeMatch to skos:exactMatch |
| 0.93 | `oec:value` | `skos:narrowMatch` | `eudpp:value` | our term is a structural value carrier |
| 0.93 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `gs1:authenticitySecurityFeatureValue` | our term is a structural value carrier |
| 0.93 | `oec:remanufacturingDate` | skos:narrowMatch to `skos:exactMatch` | `rail:itemReconditioningDate` | regrade skos:narrowMatch to skos:exactMatch |
| 0.93 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasTextualValue` | our term is a structural value carrier |
| 0.93 | `oec:value` | `skos:narrowMatch` | `batterypass:remainingCapacityValue` | our term is a structural value carrier |
| 0.93 | `oec:value` | `skos:narrowMatch` | `batterypass:internalResistanceIncreaseValue` | our term is a structural value carrier |
| 0.93 | `oec:value` | `skos:narrowMatch` | `batterypass:remainingPowerCapabilityValue` | our term is a structural value carrier |
| 0.92 | `oec:language` | skos:closeMatch to `skos:narrowMatch` | `gs1:fileLanguageCode` | regrade skos:closeMatch to skos:narrowMatch |
| 0.92 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `semic:value` | our term is a structural value carrier |
| 0.92 | `oec:value` | `skos:narrowMatch` | `schemaorg:doseValue` | our term is a structural value carrier |
| 0.92 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:awardsScoreValue` | our term is a structural value carrier |
| 0.92 | `oec:value` | `skos:narrowMatch` | `cirpass2-textile:hasTextualValue` | our term is a structural value carrier |
| 0.92 | `oec:value` | `skos:narrowMatch` | `batterypass:currentSelfDischargingRateValue` | our term is a structural value carrier |
| 0.92 | `oec:value` | `skos:narrowMatch` | `batterypass:remainingEnergyValue` | our term is a structural value carrier |
| 0.92 | `oec:RepairProvider` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:AutoRepair` | schema:AutoRepair belongs to an area foreign to a passport |
| 0.92 | `oec:OperatorRole` | rdfs:seeAlso to `skos:exactMatch` | `eudpp:EconomicOperatorRole` | our term is a type, target is the entity |
| 0.92 | `oec:OperatorRole` | `skos:broadMatch` | `eudpp:Role` | our term is a type, target is the entity |
| 0.92 | `oec:ImpactIndicatorType` | `skos:narrowMatch` | `eudpp:EN15804Indicator` | our term is a type, target is the entity |
| 0.92 | `oec:RepairProvider` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:MotorcycleRepair` | schema:MotorcycleRepair belongs to an area foreign to a passport |
| 0.92 | `oec:hasRecycledContentDetails` | skos:closeMatch to `skos:narrowMatch` | `dppk:postConsumerRecycledContentMass` | regrade skos:closeMatch to skos:narrowMatch |
| 0.92 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:nominalValue` | our term is a structural value carrier |
| 0.92 | `oec:EnergyEfficiencyClass` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:EnergyConsumptionDetails` | our term is a type, target is the entity |
| 0.89 | `oec:value` | `skos:narrowMatch` | `schemaorg:ratingValue` | our term is a structural value carrier |
| 0.89 | `oec:DocumentType` | `skos:broadMatch` | `eudpp:DocumentFormattedProperty` | our term is a type, target is the entity |
| 0.89 | `oec:DocumentReference` | skos:closeMatch to `skos:narrowMatch` | `gs1:ReferencedFileDetails` | regrade skos:closeMatch to skos:narrowMatch |
| 0.88 | `oec:hasCarbonFootprintProduction` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.88 | `oec:value` | `skos:narrowMatch` | `schemaorg:defaultValue` | our term is a structural value carrier |
| 0.88 | `oec:value` | `skos:narrowMatch` | `eudpp:materialTypeValue` | our term is a structural value carrier |
| 0.88 | `oec:OperatorRole` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:OrganizationRole` | our term is a type, target is the entity |
| 0.88 | `oec:ImpactIndicatorType` | rdfs:seeAlso to `skos:narrowMatch` | `eudpp:EN15804ImpactIndicator` | our term is a type, target is the entity |
| 0.88 | `oec:RecyclabilityAssessment` | `skos:narrowMatch` | `cirpass2-textile:RecyclabilityAssessment` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.87 | `oec:DataElementCollection` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Collection` | schema:Collection belongs to an area foreign to a passport |
| 0.85 | `oec:SingleValuedDataElement` | `skos:broadMatch` | `schemaorg:PropertyValueSpecification` | target is a structural value carrier |
| 0.85 | `oec:hasCarbonFootprintRawMaterial` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.82 | `oec:hasCarbonFootprint` | skos:closeMatch to `skos:narrowMatch` | `batterypass:carbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.80 | `oec:hasDocuments` | skos:closeMatch to `skos:broadMatch` | `gs1:referencedFile` | regrade skos:closeMatch to skos:broadMatch |
| 0.80 | `oec:CircularityPerformance` | `skos:narrowMatch` | `cirpass2-textile:RecycledContentPerformanceThreshold` | new mapping below the 0.8 floor |
| 0.79 | `oec:hasCarbonFootprint` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:carbonFootprintPerLifecycleStage` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `oec:SingleValuedDataElement` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:QuantitativeValue` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `oec:RepairabilityInfo` | `skos:closeMatch` | `cirpass2-textile:RepairabilityAssessmentResult` | new mapping below the 0.8 floor |
| 0.79 | `oec:FacilityInformation` | `skos:narrowMatch` | `gs1:LocationID_Details` | new mapping below the 0.8 floor |
| 0.78 | `oec:hasTechnicalLifetime` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:batteryTechnicalProperties` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:ProductCategory` | `skos:narrowMatch` | `cirpass2-textile:TextileCleaningProduct` | our term is a type, target is the entity |
| 0.78 | `oec:DocumentReference` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:APIReference` | schema:APIReference belongs to an area foreign to a passport |
| 0.78 | `oec:ConformityAssessmentModule` | `skos:broadMatch` | `untp:ConformityScheme` | new mapping below the 0.8 floor |
| 0.78 | `oec:hasIndicatorType` | `skos:broadMatch` | `eudpp:quantifiesIndicator` | new mapping below the 0.8 floor |
| 0.78 | `oec:hasPerformanceInfo` | `skos:narrowMatch` | `batterypass:carbonFootprintPerformanceClass` | new mapping below the 0.8 floor |
| 0.78 | `oec:carbonFootprintTotal` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:carbonFootprintPerLifecycleStage` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:hasCarbonFootprint` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:absoluteCarbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:hasCarbonFootprint` | skos:closeMatch to `skos:narrowMatch` | `batterypass:batteryCarbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.77 | `oec:hasCarbonFootprintRawMaterial` | `skos:broadMatch` | `dppk:carbonFootprint` | new mapping below the 0.8 floor |
| 0.75 | `oec:CircularityPerformance` | `skos:narrowMatch` | `cirpass2-textile:PerformanceAfterNCycles` | new mapping below the 0.8 floor |
| 0.75 | `oec:carbonFootprintTotal` | skos:closeMatch to `skos:narrowMatch` | `batterypass:carbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.75 | `oec:ConformityAssessmentModule` | `skos:broadMatch` | `untp:ConformityAssessment` | new mapping below the 0.8 floor |
| 0.75 | `oec:wastePreventionInfo` | `skos:narrowMatch` | `batterypass:informationOnCollection` | new mapping below the 0.8 floor |
| 0.75 | `oec:hasEndOfLifeProgram` | `skos:narrowMatch` | `cirpass2-textile:hasEndOfLifeInstruction` | new mapping below the 0.8 floor |
| 0.75 | `oec:substanceLocation` | `skos:narrowMatch` | `cirpass2-battery:hasBatteryLocation` | new mapping below the 0.8 floor |
| 0.74 | `oec:hasCarbonFootprintDistribution` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.74 | `oec:wastePreventionInfo` | `skos:narrowMatch` | `batterypass:wastePrevention` | new mapping below the 0.8 floor |
| 0.73 | `oec:ConformityAssessmentModule` | `skos:broadMatch` | `untp:ConformityProfile` | new mapping below the 0.8 floor |
| 0.73 | `oec:TraceabilityPerformance` | rdfs:seeAlso to `skos:broadMatch` | `untp:PerformanceMetric` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `oec:hasMaterialComposition` | `skos:narrowMatch` | `batterypass:isCriticalRawMaterial` | new mapping below the 0.8 floor |
| 0.70 | `oec:hasMaterialComposition` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:recycledMaterial` | seeAlso upgrade below the 0.8 floor |
| 0.69 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:preConsumerRecycledContentPercentage` | direction flip toward a peer profile below the 0.8 floor |
| 0.69 | `oec:lastDataUpdate` | skos:exactMatch to `skos:closeMatch` | `batterypass:lastUpdate` | regrade skos:exactMatch to skos:closeMatch |
| 0.68 | `oec:hasMaterialComposition` | `skos:narrowMatch` | `eudpp:materialRecycledContentType` | new mapping below the 0.8 floor |
| 0.68 | `oec:hasMaterialComposition` | `skos:narrowMatch` | `cirpass2-textile:hasRecoveredMaterial` | new mapping below the 0.8 floor |
| 0.68 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:capacityFadeValue` | direction flip toward a peer profile below the 0.8 floor |
| 0.66 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:postConsumerRecycledContent` | direction flip toward a peer profile below the 0.8 floor |
| 0.64 | `oec:hasMaterialComposition` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:postConsumerRecycledMaterialComposition` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `oec:hasCarbonFootprint` | `skos:broadMatch` | `dppk:environmentalFootprint` | new mapping below the 0.8 floor |

## cpr

From `skos-completeness-cpr-2026-08-07.json`. 11 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.95 | `eucpr:ReactionToFireClass` | `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.94 | `eucpr:ConstructionProductType` | `skos:broadMatch` | `eudpp:Product` | our term is a type, target is the entity |
| 0.93 | `eucpr:hasDeclarationOfPerformance` | `skos:broadMatch` | `eudpp:hasProperty` | target is a structural value carrier |
| 0.93 | `eucpr:ConstructionProductType` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:BatteryProduct` | our term is a type, target is the entity |
| 0.92 | `eucpr:ConstructionProduct` | `skos:narrowMatch` | `dppk:IronSteelProduct` | deferred by a curator: Overreach: narrowMatch would claim every iron/steel product is a construction product, but steel also goes into vehicles and appliances. dppk:IronSteelProduct is the Keystone steel-sector class and aligns with eusteel:, not as a subclass of CPR construction products. |
| 0.92 | `eucpr:hasCharacteristicValue` | `skos:narrowMatch` | `schemaorg:broadcastFrequencyValue` | every schema domain (BroadcastFrequencySpecification) is foreign to a passport |
| 0.80 | `eucpr:ConstructionProductType` | rdfs:seeAlso to `skos:narrowMatch` | `schemaorg:IndividualProduct` | schema:IndividualProduct is a general Layer-1 term, so narrowMatch inverts the relation; broadMatch is the direction |
| 0.75 | `eucpr:ConstructionProductType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Product` | our term is a type, target is the entity |
| 0.74 | `eucpr:hasValidationReports` | skos:broadMatch to `skos:narrowMatch` | `batterypass:resultOfTestReport` | direction flip toward a peer profile below the 0.8 floor |
| 0.73 | `eucpr:EssentialCharacteristic` | `skos:broadMatch` | `semic:Criterion` | new mapping below the 0.8 floor |
| 0.68 | `eucpr:ConstructionProductType` | rdfs:seeAlso to `skos:broadMatch` | `gs1:Product` | our term is a type, target is the entity |

## detergent

From `skos-completeness-detergent-2026-08-07.json`. 19 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.88 | `eudet:hasTestMethod` | `skos:broadMatch` | `eudpp:includesMethod` | deferred by a curator: Name-only match: eudpp:includesMethod is LCIA-scoped (domain eudpp:Methodology, range eudpp:Method — EN15804+A2, EF v3.1 method grouping), while ours links a detergent biodegradability test to its test method. Different domains, no subsumption. |
| 0.88 | `eudet:hasProductForm` | `skos:broadMatch` | `eudpp:hasProperty` | target is a structural value carrier |
| 0.85 | `eudet:hasProductForm` | `skos:broadMatch` | `gs1:consumerProductVariant` | deferred by a curator: GS1 scopes consumerProductVariant to variants that do NOT require a different GTIN; liquid, powder and tablet are separate trade items. Removed; skos:closeMatch gs1:productFormDescription is the correct GS1 target. |
| 0.83 | `eudet:hasHazardousSubstances` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:hazardousSubstanceClass` | deferred by a curator: Composition, not subsumption: ours links a product to its hazardous-substance entries; the SAMM term is the CLP class datum inside one entry. An attribute of the contained thing is not a narrower concept of the containment link. The ungraded seeAlso stands. |
| 0.80 | `eudet:hasHazardousSubstances` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:hazardousSubstanceIdentifier` | deferred by a curator: Composition, not subsumption: same reasoning as the hazardousSubstanceClass pair — the CAS identifier inside a substance entry is not a narrower concept of the product-to-substances link. |
| 0.78 | `eudet:SurfactantType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:ChemicalSubstance` | our term is a type, target is the entity |
| 0.78 | `eudet:hasHazardousSubstances` | rdfs:seeAlso to `skos:broadMatch` | `dppk:textileSubstancesOfConcern` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `eudet:ProductForm` | rdfs:seeAlso to `skos:broadMatch` | `gs1:Product` | our term is a type, target is the entity |
| 0.76 | `eudet:phosphorusContentPercent` | `skos:broadMatch` | `dppk:componentPercentage` | new mapping below the 0.8 floor |
| 0.75 | `eudet:endProductCharacteristics` | `skos:broadMatch` | `untp:characteristics` | new mapping below the 0.8 floor |
| 0.75 | `eudet:Ingredient` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:ChemicalSubstance` | seeAlso upgrade below the 0.8 floor |
| 0.74 | `eudet:DetergentProduct` | `skos:broadMatch` | `dppk:Product` | new mapping below the 0.8 floor |
| 0.73 | `eudet:hasHazardousSubstances` | `skos:broadMatch` | `untp:hazardous` | new mapping below the 0.8 floor |
| 0.72 | `eudet:ProductForm` | `skos:broadMatch` | `dppk:Product` | our term is a type, target is the entity |
| 0.72 | `eudet:ProductForm` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Product` | our term is a type, target is the entity |
| 0.69 | `eudet:ProductForm` | `skos:broadMatch` | `untp:Product` | our term is a type, target is the entity |
| 0.69 | `eudet:ProductForm` | `skos:broadMatch` | `dppk:ProductCharacteristic` | our term is a type, target is the entity |
| 0.66 | `eudet:BiodegradabilityTestMethod` | rdfs:seeAlso to `skos:broadMatch` | `semic:Criterion` | our term is a type, target is the entity |
| 0.64 | `eudet:filmBiodegradabilityPercentage` | `skos:broadMatch` | `dppk:environmentalFootprintBenchmarkPercentage` | new mapping below the 0.8 floor |

## electronics

From `skos-completeness-electronics-2026-08-07.json`. 29 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.95 | `euelec:ElectronicDevice` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:Component` | deferred by a curator: DPP Keystone components are cross-sector product parts (the same profile serves iron & steel, EPD and textile), so dppk:Component is not a narrower class of ElectronicDevice; a casing component is no electronic device. The ungraded seeAlso stands. |
| 0.93 | `euelec:EnergyEfficiency` | rdfs:seeAlso to `skos:narrowMatch` | `schemaorg:EUEnergyEfficiencyEnumeration` | deferred by a curator: Level confusion: the schema.org term is the closed A-G code list, ours is the energy-efficiency information entity. A code list and the entity it classifies are not in a subsumption relation in either direction (documented level rule). The ungraded seeAlso stands. |
| 0.93 | `euelec:WEEECompliance` | `skos:broadMatch` | `eudpp:UnionHarmonisationLegislation` | deferred by a curator: Referent mismatch: ours is the compliance record of a product with WEEE, the EUDPP class is the legislation itself. The WEEE directive as a law would be an individual of the EUDPP class; the compliance record is not a narrower legislation. |
| 0.92 | `euelec:recyclingProcess` | `skos:narrowMatch` | `gs1:packagingRecyclingScheme` | deferred by a curator: The GS1 term is packaging-scoped; ours is an electronics treatment process. Domain mismatch that the GS1 foreign-domain list does not cover. |
| 0.92 | `euelec:hasRepairCost` | `skos:broadMatch` | `semic:hasValue` | target is a structural value carrier |
| 0.91 | `euelec:newVersion` | `skos:broadMatch` | `schemaorg:assemblyVersion` | every schema domain (APIReference) is foreign to a passport |
| 0.91 | `euelec:iec62474DslVersion` | `skos:broadMatch` | `eudpp:identifierSchemeVersion` | deferred by a curator: Referent mismatch: the IEC 62474 declarable-substance-list version is the version of a standard's substance list, not of an identifier scheme (EUDPP IDENT module scope). |
| 0.89 | `euelec:hasTreatmentFacility` | `skos:broadMatch` | `untp:fromFacility` | deferred by a curator: Different roles: ours is where treatment happened, UNTP's is a shipment origin. |
| 0.88 | `euelec:recyclingProcess` | skos:closeMatch to `skos:narrowMatch` | `gs1:packagingRecyclingProcessType` | regrade skos:closeMatch to skos:narrowMatch |
| 0.88 | `euelec:hasEnergyEfficiencyClass` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:hasEnergyConsumptionDetails` | deferred by a curator: Our property carries an efficiency class label; the schema.org property links to a consumption-details node. Related, but not one subsuming the other. |
| 0.88 | `euelec:hasRefreshRate` | rdfs:seeAlso to `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.88 | `euelec:hasFeatureSupportYears` | `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.87 | `euelec:EURepairabilityClass` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.85 | `euelec:hasSparePartPrice` | `skos:broadMatch` | `semic:hasValue` | target is a structural value carrier |
| 0.82 | `euelec:newVersion` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:softwareVersion` | every schema domain (SoftwareApplication) is foreign to a passport |
| 0.81 | `euelec:nextDisposition` | `skos:exactMatch` | `untp:disposition` | deferred by a curator: exactMatch is a strong claim for a WEEE routing decision against UNTP's general disposition; closeMatch may be the honest grade. |
| 0.78 | `euelec:hasScreenDiagonal` | rdfs:seeAlso to `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.78 | `euelec:EnergyEfficiencyClass` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:EnergyConsumptionDetails` | our term is a type, target is the entity |
| 0.78 | `euelec:hasPeakBrightness` | `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.77 | `euelec:ComponentType` | rdfs:seeAlso to `skos:broadMatch` | `dppk:Component` | our term is a type, target is the entity |
| 0.73 | `euelec:RepairCriterion` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Rating` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `euelec:RepairCriterionType` | rdfs:seeAlso to `skos:broadMatch` | `semic:Criterion` | our term is a type, target is the entity |
| 0.71 | `euelec:criterionMaxScore` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:maxValue` | target is a structural value carrier |
| 0.71 | `euelec:hasComponentType` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:batteryCategory` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `euelec:collectionMethod` | `skos:narrowMatch` | `batterypass:separateCollection` | new mapping below the 0.8 floor |
| 0.70 | `euelec:MaterialRecoveryResult` | `skos:broadMatch` | `eudpp:FlowResult` | new mapping below the 0.8 floor |
| 0.70 | `euelec:hasMaterialDeclaration` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:batteryMaterials` | seeAlso upgrade below the 0.8 floor |
| 0.70 | `euelec:RepairCriterionType` | rdfs:seeAlso to `skos:broadMatch` | `untp:Criterion` | our term is a type, target is the entity |
| 0.68 | `euelec:hasEnergyEfficiency` | rdfs:seeAlso to `skos:narrowMatch` | `schemaorg:energyEfficiencyScaleMax` | seeAlso upgrade below the 0.8 floor |

## eudr

From `skos-completeness-eudr-2026-08-07.json`. 10 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.97 | `eudr:TimberProductType` | `skos:broadMatch` | `eudpp:Product` | our term is a type, target is the entity |
| 0.96 | `eudr:TimberProductType` | `skos:broadMatch` | `eudpp:MaterialType` | deferred by a curator: Different classification axes: TimberProductType classifies products (EUDR Annex I categories: sawn wood, plywood, ...), eudpp:MaterialType classifies composition materials ('cotton, nylon' per its own definition). A product category is not a narrower material category — unlike eutex:FiberType, where fibers are materials. The product-group axis is carried by eudr:hasTimberProductType broadMatch eudpp:hasProductGroup. |
| 0.94 | `eudr:TimberProductType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Product` | our term is a type, target is the entity |
| 0.94 | `eudr:ActorRole` | `skos:broadMatch` | `eudpp:Role` | our term is a type, target is the entity |
| 0.93 | `eudr:TimberProductType` | rdfs:seeAlso to `skos:broadMatch` | `gs1:Product` | our term is a type, target is the entity |
| 0.93 | `eudr:ActorRole` | `skos:narrowMatch` | `eudpp:EconomicOperatorRole` | our term is a type, target is the entity |
| 0.87 | `eudr:TimberProductType` | `skos:broadMatch` | `dppk:ConstructionProduct` | our term is a type, target is the entity |
| 0.86 | `eudr:DueDiligenceStatement` | `skos:broadMatch` | `gs1:RegulatoryIdentifier` | deferred by a curator: A due-diligence statement is a document, not an identifier; the subsumption does not hold in either direction. |
| 0.78 | `eudr:ActorRole` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Role` | our term is a type, target is the entity |
| 0.65 | `eudr:hasCountryList` | `skos:narrowMatch` | `untp:countryName` | new mapping below the 0.8 floor |

## fsma204

No held findings: everything the panel confirmed was either applied or filtered as out of scope.

## iron-steel

From `skos-completeness-iron-steel-2026-08-07.json`. 6 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.88 | `eusteel:heatNumber` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:serialNumber` | deferred by a curator: Granularity, not specificity: schema:serialNumber is domained on schema:IndividualProduct, so it identifies one piece, while a heat number identifies the melt every piece came from. Downgraded to rdfs:seeAlso; the batch-level skos:closeMatch to gs1:hasBatchLotNumber carries the mapping. |
| 0.80 | `eusteel:lotNumber` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:serialNumber` | deferred by a curator: Same item-versus-batch granularity as eusteel:heatNumber, and lot against serial is the textbook case of it. Downgraded to rdfs:seeAlso; skos:broadMatch gs1:hasBatchLotNumber carries the mapping. |
| 0.79 | `eusteel:meltAndPourCountry` | rdfs:seeAlso to `skos:broadMatch` | `untp:countryCode` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eusteel:castNumber` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:serialNumber` | deferred by a curator: Same item-versus-batch granularity as eusteel:heatNumber. Downgraded to rdfs:seeAlso; skos:broadMatch gs1:hasBatchLotNumber carries the mapping. |
| 0.72 | `eusteel:IronSteelProduct` | rdfs:seeAlso to `skos:broadMatch` | `dppk:ConstructionProduct` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `eusteel:mtcNominalSize` | `skos:broadMatch` | `rail:nominalValue` | new mapping below the 0.8 floor |

## ppwr

From `skos-completeness-ppwr-2026-08-07.json`. 1 confirmed finding the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.91 | `euppwr:PackagingTier` | `skos:broadMatch` | `gs1:PackagingDetails` | our term is a type, target is the entity |

## textile

From `skos-completeness-textile-2026-10-29.json`. 57 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.96 | `eutex:TextileCategory` | `skos:narrowMatch` | `cirpass2-textile:ToyTextileApparel` | our term is a type, target is the entity |
| 0.96 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:PolycottonThermoChemicalRecyclingProcess` | our term is a type, target is the entity |
| 0.95 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:SyntheticFibreChemicalRecyclingProcess` | our term is a type, target is the entity |
| 0.95 | `eutex:FiberType` | `skos:exactMatch` | `cirpass2-textile:FibreTypeConcept` | our term is a type, target is the entity |
| 0.95 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:ChemicalRecyclingProcess` | our term is a type, target is the entity |
| 0.95 | `eutex:TextileCategory` | `skos:narrowMatch` | `cirpass2-textile:TextileProduct` | our term is a type, target is the entity |
| 0.94 | `eutex:carbonFootprintManufacturing` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.94 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:PyrolysisGasificationRecyclingProcess` | our term is a type, target is the entity |
| 0.94 | `eutex:TextileCategory` | `skos:narrowMatch` | `cirpass2-textile:MedicalDeviceTextileApparel` | our term is a type, target is the entity |
| 0.94 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:ThermoMechanicalRecyclingProcess` | our term is a type, target is the entity |
| 0.94 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:ChemicalRecyclingRoute` | our term is a type, target is the entity |
| 0.94 | `eutex:TextileCategory` | `skos:narrowMatch` | `cirpass2-textile:TextileApparel` | our term is a type, target is the entity |
| 0.94 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:CellulosicChemicalRecyclingProcess` | our term is a type, target is the entity |
| 0.93 | `eutex:RobustnessAssessment` | `skos:broadMatch` | `cirpass2-textile:RobustnessAssessment` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.93 | `eutex:lciaValue` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.93 | `eutex:SubstanceOfConcernType` | `skos:broadMatch` | `eudpp:SubstanceOfConcern` | our term is a type, target is the entity |
| 0.93 | `eutex:TextileCategory` | `skos:narrowMatch` | `cirpass2-textile:SmartTextile` | our term is a type, target is the entity |
| 0.93 | `eutex:ApparelSubcategory` | `skos:broadMatch` | `cirpass2-textile:TextileApparel` | our term is a type, target is the entity |
| 0.92 | `eutex:DurabilityClass` | `skos:broadMatch` | `eudpp:Durability` | our term is a type, target is the entity |
| 0.92 | `eutex:DurabilityClass` | `skos:broadMatch` | `cirpass2-textile:IntrinsicDurability` | our term is a type, target is the entity |
| 0.92 | `eutex:CLPHazardCategory` | `skos:broadMatch` | `eudpp:SubstanceOfConcern` | our term is a type, target is the entity |
| 0.92 | `eutex:TextileCategory` | `skos:narrowMatch` | `cirpass2-textile:TextileCleaningProduct` | our term is a type, target is the entity |
| 0.92 | `eutex:TextileCategory` | `skos:narrowMatch` | `cirpass2-textile:TextileApparelProductTypeConcept` | our term is a type, target is the entity |
| 0.92 | `eutex:ApparelSubcategory` | `skos:narrowMatch` | `cirpass2-textile:ToyTextileApparel` | our term is a type, target is the entity |
| 0.92 | `eutex:ApparelSubcategory` | `skos:narrowMatch` | `cirpass2-textile:MedicalDeviceTextileApparel` | our term is a type, target is the entity |
| 0.92 | `eutex:DurabilityClass` | `skos:broadMatch` | `cirpass2-textile:Durability` | our term is a type, target is the entity |
| 0.92 | `eutex:ApparelSubcategory` | `skos:narrowMatch` | `cirpass2-textile:PPETextileApparel` | our term is a type, target is the entity |
| 0.92 | `eutex:CareSymbolCode` | `skos:broadMatch` | `cirpass2-textile:TextileCareInstruction` | our term is a type, target is the entity |
| 0.90 | `eutex:substanceConcentration` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.90 | `eutex:LCIACategory` | `skos:broadMatch` | `eudpp:LCAResult` | our term is a type, target is the entity |
| 0.89 | `eutex:RecyclingTechnology` | `skos:narrowMatch` | `cirpass2-textile:MechanicalRecyclingProcess` | our term is a type, target is the entity |
| 0.89 | `eutex:ChainOfCustodyMethod` | `skos:exactMatch` | `cirpass2-textile:ChainOfCustodyVerificationMethod` | our term is a type, target is the entity |
| 0.89 | `eutex:abrasionResistance` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.88 | `eutex:ChainOfCustodyMethod` | `skos:broadMatch` | `cirpass2-textile:AssessmentMethod` | our term is a type, target is the entity |
| 0.85 | `eutex:RecycledContentDeclaration` | `skos:narrowMatch` | `cirpass2-textile:RecycledContentDeclaration` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.85 | `eutex:ChainOfCustodyMethod` | `skos:broadMatch` | `cirpass2-textile:RecycledContentAssessment` | our term is a type, target is the entity |
| 0.83 | `eutex:substanceConcentration` | `skos:narrowMatch` | `gs1:juiceContentPercent` | gs1 domain FoodBeverageTobaccoProduct is foreign to a passport |
| 0.82 | `eutex:ChainOfCustodyMethod` | `skos:broadMatch` | `cirpass2-textile:RecycledContentVerificationMethod` | our term is a type, target is the entity |
| 0.80 | `eutex:RecycledSourceType` | `skos:narrowMatch` | `cirpass2-textile:RecycledContentSourceConcept` | our term is a type, target is the entity |
| 0.78 | `eutex:hasWashingSymbol` | `skos:broadMatch` | `untp:symbol` | new mapping below the 0.8 floor |
| 0.78 | `eutex:TestStandard` | `skos:broadMatch` | `cirpass2-textile:AssessmentStandard` | our term is a type, target is the entity |
| 0.78 | `eutex:TextileProduct` | `skos:narrowMatch` | `cirpass2-textile:MedicalDeviceTextileApparel` | new mapping below the 0.8 floor |
| 0.77 | `eutex:hasRepairServices` | `skos:narrowMatch` | `cirpass2-textile:hasRepairService` | new mapping below the 0.8 floor |
| 0.77 | `eutex:LCIACategoryCode` | `skos:broadMatch` | `schemaorg:CategoryCodeSet` | our term is a type, target is the entity |
| 0.77 | `eutex:hasApparelSubcategory` | rdfs:seeAlso to `skos:broadMatch` | `gs1:additionalProductClassification` | seeAlso upgrade below the 0.8 floor |
| 0.76 | `eutex:sparePartsUrl` | `skos:closeMatch` | `batterypass:supplierWebAddress` | new mapping below the 0.8 floor |
| 0.75 | `eutex:SpiralityTestResult` | `skos:broadMatch` | `cirpass2-textile:AssessmentResult` | new mapping below the 0.8 floor |
| 0.75 | `eutex:DurabilityInfo` | `skos:narrowMatch` | `cirpass2-battery:BatteryDurability` | new mapping below the 0.8 floor |
| 0.75 | `eutex:SpiralityTestResult` | `skos:broadMatch` | `cirpass2-textile:MeasurementResult` | new mapping below the 0.8 floor |
| 0.74 | `eutex:hasRecycledSourceType` | `skos:broadMatch` | `cirpass2-textile:sourceType` | new mapping below the 0.8 floor |
| 0.73 | `eutex:seasonCollection` | skos:broadMatch to `skos:narrowMatch` | `gs1:seasonParameter` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.73 | `eutex:hasDyeingFacility` | `skos:broadMatch` | `untp:madeAtFacility` | new mapping below the 0.8 floor |
| 0.72 | `eutex:FabricType` | `skos:broadMatch` | `cirpass2-textile:FabricStructuralCharacteristic` | our term is a type, target is the entity |
| 0.72 | `eutex:DurabilityInfo` | `skos:broadMatch` | `cirpass2-textile:DurabilityAssessment` | new mapping below the 0.8 floor |
| 0.71 | `eutex:FabricType` | `skos:broadMatch` | `cirpass2-textile:FabricCharacteristic` | our term is a type, target is the entity |
| 0.70 | `eutex:secondaryMaterialFraction` | rdfs:seeAlso to `skos:broadMatch` | `untp:massFraction` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `eutex:TextileProduct` | `skos:broadMatch` | `cirpass2-textile:TextileProduct` | identical local names, so exactMatch or closeMatch is the question, not which contains which |

## Where the pipeline contradicts itself

85 assertion(s) the ontology already carries were marked `WRONG` by the
bulk grader and then had the correction rejected by the QA panel. Nothing was applied, so
each one is either a mapping worth re-reading or a prompt worth improving. A worked example:
the textile panel rejected `eutex:additionalCareInstructions skos:narrowMatch
schema:additionalProperty` at 0.97 confidence, and it does look inverted, since
`schema:additionalProperty` is a general extension slot rather than a narrower concept.

- **battery**: 22
- **electronics**: 16
- **cpr**: 13
- **core**: 12
- **eudr**: 10
- **textile**: 7
- **detergent**: 3
- **fsma204**: 1
- **iron-steel**: 1

## Remaining `skos:narrowMatch` assertions

138 assertions still read `narrowMatch`. Their targets are peer profiles or
intra-project terms of comparable specificity, where which of the two is narrower is a
modelling question per term. `check:mappings` rule 6 already guards the mechanical class,
the general Layer-1 head terms.

- **other**: 44
- **BatteryPass SAMM / bpr**: 40
- **DPP Keystone**: 31
- **GS1 tail**: 17
- **schema.org tail**: 5
- **UNTP**: 1
