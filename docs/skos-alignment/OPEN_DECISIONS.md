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

From `skos-completeness-battery-2026-08-07.json`. 87 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.95 | `eubat:HazardClass` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.94 | `eubat:ComponentLocation` | `skos:broadMatch` | `eudpp:Location` | our term is a type, target is the entity |
| 0.94 | `eubat:DismantlingDocumentType` | `skos:broadMatch` | `eudpp:DocumentFormattedProperty` | our term is a type, target is the entity |
| 0.93 | `eubat:TechnicalSpecification` | `skos:broadMatch` | `eudpp:TechnicalSpecification` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.92 | `eubat:leadPreConsumerShare` | skos:closeMatch to `skos:broadMatch` | `batterypass:preConsumerShare` | regrade skos:closeMatch to skos:broadMatch |
| 0.92 | `eubat:BatteryStatus` | `skos:broadMatch` | `eudpp:LifeCycleStage` | our term is a type, target is the entity |
| 0.92 | `eubat:separateCollectionSymbolUrl` | `skos:exactMatch` | `dppk:separateCollectionSymbol` | deferred by a curator: A URL that points at the symbol is not the symbol. exactMatch overstates it; the honest grade is closeMatch or an ungraded pointer. |
| 0.92 | `eubat:NegativeEventType` | `skos:broadMatch` | `eudpp:ProductEvent` | our term is a type, target is the entity |
| 0.92 | `eubat:BatteryMaterial` | `skos:broadMatch` | `eudpp:MaterialType` | deferred by a curator: Level confusion: eudpp:MaterialType is by its own definition a 'placeholder class for material type classification' (cotton, nylon, ...), i.e. a category code, while eubat:BatteryMaterial is the material entity in the battery. An entity is not in a subsumption relation with its classifier. The entity-level mapping eubat:BatteryMaterial broadMatch eudpp:MaterialOfComposition carries the alignment. |
| 0.91 | `eubat:hasCarbonFootprintRecycling` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.91 | `eubat:batteryModelIdentifier` | skos:broadMatch to `skos:narrowMatch` | `batterypass:batteryPassportIdentifier` | deferred by a curator: Different referents: ours identifies the battery model, theirs identifies the passport document about it. Neither subsumes the other. |
| 0.90 | `eubat:hasLabels` | `skos:narrowMatch` | `bpr:SymbolsForCadmiumAndLead` | our term is a property, target is a class |
| 0.90 | `eubat:hasManufacturingPlace` | rdfs:seeAlso to `skos:broadMatch` | `semic:Location` | our term is a property, target is a class |
| 0.89 | `eubat:hasCarbonFootprintTotal` | skos:closeMatch to `skos:narrowMatch` | `batterypass:carbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.88 | `eubat:wastePrevention` | skos:closeMatch to `skos:broadMatch` | `batterypass:wastePrevention` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.88 | `eubat:ResponsibleSourcingStandard` | rdfs:seeAlso to `skos:broadMatch` | `untp:Standard` | our term is a type, target is the entity |
| 0.86 | `eubat:CarbonFootprintClass` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.85 | `eubat:hasEventLocation` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:sportsActivityLocation` | every schema domain (ExerciseAction) is foreign to a passport |
| 0.85 | `eubat:BatteryStatus` | skos:closeMatch to `skos:broadMatch` | `batterypass:BatteryConditionEntity` | our term is a type, target is the entity |
| 0.84 | `eubat:hasDismantlingInstructions` | skos:broadMatch to `skos:narrowMatch` | `batterypass:dismantlingAndRemovalInformation` | deferred by a curator: Direction flip rejected: our term references the dismantling instructions document, the SAMM term is the whole dismantling-and-removal information block (documents plus removal data). Ours is the narrower one, so the existing skos:broadMatch stands. |
| 0.83 | `eubat:hasCarbonFootprintDistribution` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.83 | `eubat:hasEventLocation` | skos:broadMatch to `skos:narrowMatch` | `rail:europeanTrackLocation` | deferred by a curator: Cross-sector noise: a railway track location is a rail-specific concept and mapping a battery event location above it documents nothing. The rail profile is for railway concepts. |
| 0.83 | `eubat:hasAbsoluteCarbonFootprint` | skos:closeMatch to `skos:narrowMatch` | `batterypass:carbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.83 | `eubat:hasHazardousSubstances` | skos:broadMatch to `skos:narrowMatch` | `batterypass:hazardousSubstances` | deferred by a curator: Direction flip rejected: same-named peers at the same granularity (per-substance entries with class/concentration/location on both sides). Neither hierarchy direction holds; the honest grade would be closeMatch, and flipping broad to narrow just trades one overclaim for the other. |
| 0.83 | `eubat:RecycledContent` | skos:closeMatch to `skos:narrowMatch` | `batterypass:RecycledContentEntity` | regrade skos:closeMatch to skos:narrowMatch |
| 0.82 | `eubat:hasSupplierContact` | `skos:broadMatch` | `schemaorg:contactPoints` | schema:contactPoints is superseded by schema:contactPoint |
| 0.81 | `eubat:hasMaterialComposition` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:material` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.81 | `eubat:hasNegativeEvents` | `skos:narrowMatch` | `bpr:InformationOnAccidents` | our term is a property, target is a class |
| 0.81 | `eubat:hasRatedCapacity` | `skos:broadMatch` | `schemaorg:fuelCapacity` | every schema domain (Vehicle) is foreign to a passport |
| 0.80 | `eubat:hasRatedMaximumPower` | skos:broadMatch to `skos:narrowMatch` | `batterypass:ratedMaximumPower` | deferred by a curator: Direction flip rejected: both sides are the same single rated-maximum-power value. A hierarchy claim overstates in either direction; closeMatch would be the honest grade. |
| 0.80 | `eubat:hasRecycledContent` | skos:broadMatch to `skos:narrowMatch` | `batterypass:recycledContent` | deferred by a curator: Direction flip rejected: the SAMM recycledContent is also per-material with pre/post-consumer shares, so the two blocks share granularity. Neither broad nor narrow holds; closeMatch would be the honest grade. |
| 0.80 | `eubat:authorizedServiceCenters` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:serviceUrl` | every schema domain (ServiceChannel) is foreign to a passport |
| 0.80 | `eubat:hasSubstanceLocation` | `skos:broadMatch` | `semic:Location` | our term is a property, target is a class |
| 0.80 | `eubat:hasRecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:postConsumerRecycledContentMass` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `eubat:authorizedServiceCenters` | rdfs:seeAlso to `skos:broadMatch` | `gs1:serviceInfo` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `eubat:cobaltRecycledShare` | rdfs:seeAlso to `skos:broadMatch` | `dppk:preConsumerRecycledContent` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `eubat:hasDismantlingInstructions` | `skos:broadMatch` | `gs1:consumerRecyclingInstructions` | new mapping below the 0.8 floor |
| 0.79 | `eubat:NegativeEventType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Event` | our term is a type, target is the entity |
| 0.79 | `eubat:hasCarbonFootprintProduction` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.79 | `eubat:hasCarbonFootprintDeclaration` | `skos:narrowMatch` | `dppk:carbonFootprintBenchmarkPercentage` | new mapping below the 0.8 floor |
| 0.78 | `eubat:BatteryChemistry` | `skos:broadMatch` | `batterypass:BatteryMaterialEntity` | new mapping below the 0.8 floor |
| 0.78 | `eubat:hasSupplierContact` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:emailAddressOfSupplier` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:PowerCapabilityAtSoC` | skos:closeMatch to `skos:broadMatch` | `batterypass:PowerCapabilityAtEntity` | regrade skos:closeMatch to skos:broadMatch |
| 0.78 | `eubat:safetyInstructionsForDismantling` | rdfs:seeAlso to `skos:broadMatch` | `dppk:safetyMeasures` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:safetyInstructionsForDismantling` | rdfs:seeAlso to `skos:broadMatch` | `dppk:safetyDataSheet` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:recommendedAction` | `skos:closeMatch` | `schemaorg:followup` | every schema domain (MedicalProcedure) is foreign to a passport |
| 0.78 | `eubat:hasRemainingCapacity` | `skos:broadMatch` | `schemaorg:fuelCapacity` | every schema domain (Vehicle) is foreign to a passport |
| 0.78 | `eubat:hasCarbonFootprintDeclaration` | `skos:narrowMatch` | `dppk:carbonFootprintAbsolute` | new mapping below the 0.8 floor |
| 0.78 | `eubat:lithiumRecycledShare` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:postConsumerShare` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eubat:hasResponsibleSourcingStandard` | `skos:broadMatch` | `gs1:certificationStandard` | new mapping below the 0.8 floor |
| 0.78 | `eubat:DismantlingDocumentType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:DigitalDocument` | our term is a type, target is the entity |
| 0.78 | `eubat:dataProviderCertification` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:hasCertification` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `eubat:hasMaximumDischargingPower` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:originalPowerCapability` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `eubat:BatteryChemistry` | `skos:broadMatch` | `schemaorg:ChemicalSubstance` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.77 | `eubat:hasPowerCapabilityAt20SoC` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:ratedMaximumPower` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `eubat:hasRecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:preConsumerRecycledMaterialComposition` | seeAlso upgrade below the 0.8 floor |
| 0.76 | `eubat:safetyInstructionsForDismantling` | rdfs:seeAlso to `skos:broadMatch` | `dppk:endOfLifeInstructions` | seeAlso upgrade below the 0.8 floor |
| 0.76 | `eubat:dueDiligenceReportUrl` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:resultOfTestReport` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eubat:nickelPreConsumerShare` | `skos:broadMatch` | `dppk:recycledContentPercentage` | new mapping below the 0.8 floor |
| 0.75 | `eubat:labelMeaning` | `skos:broadMatch` | `other:prefLabel` | new mapping below the 0.8 floor |
| 0.75 | `eubat:hasCarbonFootprintRawMaterialExtraction` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.75 | `eubat:hasSubstanceLocation` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:batteryMaterialLocation` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eubat:hasInternalResistance` | skos:broadMatch to `skos:narrowMatch` | `batterypass:ohmicResistance` | direction flip toward a peer profile below the 0.8 floor |
| 0.74 | `eubat:hasRecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:preConsumerRecycledContentMass` | seeAlso upgrade below the 0.8 floor |
| 0.74 | `eubat:cobaltRecycledShare` | rdfs:seeAlso to `skos:broadMatch` | `dppk:preConsumerRecycledContentPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `eubat:anodeActiveMaterial` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:material` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `eubat:hasMaterialComposition` | rdfs:seeAlso to `skos:broadMatch` | `untp:materialUsed` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `eubat:lifetimeReferenceTest` | `skos:broadMatch` | `untp:referenceStandard` | new mapping below the 0.8 floor |
| 0.73 | `eubat:electrolyteComposition` | rdfs:seeAlso to `skos:broadMatch` | `bpr:MaterialsUsedInCathodeAnodeAndElectrolyte` | our term is a property, target is a class |
| 0.73 | `eubat:NegativeEvent` | `skos:broadMatch` | `untp:LifecycleEvent` | new mapping below the 0.8 floor |
| 0.72 | `eubat:lifetimeReferenceTest` | `skos:broadMatch` | `dppk:harmonisedStandardReference` | new mapping below the 0.8 floor |
| 0.71 | `eubat:lithiumPostConsumerShare` | `skos:broadMatch` | `batterypass:recycledContent` | new mapping below the 0.8 floor |
| 0.71 | `eubat:recoveryMaterial` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:batteryMaterialName` | seeAlso upgrade below the 0.8 floor |
| 0.70 | `eubat:functionalUnit` | `skos:broadMatch` | `untp:unit` | new mapping below the 0.8 floor |
| 0.70 | `eubat:hasSubstanceLocation` | rdfs:seeAlso to `skos:broadMatch` | `semic:location` | seeAlso upgrade below the 0.8 floor |
| 0.70 | `eubat:facilityIdentifier` | `skos:broadMatch` | `semic:identifier` | new mapping below the 0.8 floor |
| 0.70 | `eubat:hasSupplierContact` | `skos:narrowMatch` | `batterypass:addressOfSupplier` | new mapping below the 0.8 floor |
| 0.69 | `eubat:hasRemainingUsableEnergy` | skos:broadMatch to `skos:narrowMatch` | `batterypass:remainingEnergy` | direction flip toward a peer profile below the 0.8 floor |
| 0.68 | `eubat:safetyInstructions` | skos:broadMatch to `skos:narrowMatch` | `batterypass:safetyInstructions` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.68 | `eubat:hasPowerCapability` | skos:broadMatch to `skos:narrowMatch` | `batterypass:originalPowerCapability` | direction flip toward a peer profile below the 0.8 floor |
| 0.68 | `eubat:isSubstanceOfConcern` | rdfs:seeAlso to `skos:broadMatch` | `gs1:ingredientOfConcern` | gs1 domain FoodBeverageTobaccoProduct is foreign to a passport |
| 0.68 | `eubat:nickelPostConsumerShare` | rdfs:seeAlso to `skos:broadMatch` | `dppk:recycledContentPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `eubat:hasSupplierContact` | `skos:narrowMatch` | `batterypass:supplierWebAddress` | new mapping below the 0.8 floor |
| 0.67 | `eubat:hasDismantlingInstructions` | `skos:broadMatch` | `dppk:instructionsForUse` | new mapping below the 0.8 floor |
| 0.65 | `eubat:hasCarbonFootprintRawMaterialExtraction` | `skos:broadMatch` | `dppk:mtcCarbonEquivalent` | new mapping below the 0.8 floor |
| 0.60 | `eubat:facilityIdentifier` | skos:exactMatch to `skos:closeMatch` | `dppk:facilityId` | regrade skos:exactMatch to skos:closeMatch |
| 0.60 | `eubat:verificationDate` | rdfs:seeAlso to `skos:closeMatch` | `schemaorg:auditDate` | seeAlso upgrade below the 0.8 floor |

## core

From `skos-completeness-core-2026-08-06.json`. 148 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.99 | `oec:EnergyEfficiencyClass` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.96 | `oec:OperatorRole` | `skos:exactMatch` | `dppk:EconomicOperatorRole` | our term is a type, target is the entity |
| 0.94 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:topValue` | our term is a structural value carrier |
| 0.94 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:leftValueString` | our term is a structural value carrier |
| 0.94 | `oec:DepositReturnScheme` | `skos:broadMatch` | `gs1:ReturnablePackageDepositDetails` | our term is a type, target is the entity |
| 0.94 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:rightValueString` | our term is a structural value carrier |
| 0.93 | `oec:lastUpdated` | `skos:exactMatch` | `bpr:Date-timeOfLatestUpdateOfDPP` | our term is a property, target is a class |
| 0.93 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `gs1:authenticitySecurityFeatureValue` | our term is a structural value carrier |
| 0.93 | `oec:hasCarbonFootprintRawMaterial` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.92 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:textValue` | our term is a structural value carrier |
| 0.92 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:valueReference` | our term is a structural value carrier |
| 0.92 | `oec:value` | `skos:narrowMatch` | `semic:supportsValue` | target is a structural value carrier |
| 0.92 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `rail:rightValue` | our term is a structural value carrier |
| 0.92 | `oec:lastDataUpdate` | `skos:exactMatch` | `bpr:Date-timeOfLatestUpdateOfDPP` | our term is a property, target is a class |
| 0.92 | `oec:hasCarbonFootprintDistribution` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.92 | `oec:value` | skos:broadMatch to `skos:narrowMatch` | `gs1:additionalProductClassificationValue` | our term is a structural value carrier |
| 0.91 | `oec:OperatorRole` | rdfs:seeAlso to `skos:exactMatch` | `other:EconomicOperatorRole` | our term is a type, target is the entity |
| 0.90 | `oec:productToPackagingRatio` | rdfs:seeAlso to `skos:exactMatch` | `other:ProductToPackagingRatio` | our term is a property, target is a class |
| 0.90 | `oec:registrationNumber` | `skos:exactMatch` | `other:registrationNumber` | deferred by a curator: Name-only match: the EUDPP property is domained on EPDStudy (EPD programme registration number, ILCD publicationAndOwnership/registrationNumber), ours on OperatorInformation (company registration). The correct counterpart oec:epdRegistrationNumber already carries the pointer. |
| 0.90 | `oec:materialFootprint` | rdfs:seeAlso to `skos:exactMatch` | `other:MaterialFootprint` | our term is a property, target is a class |
| 0.90 | `oec:socThreshold` | rdfs:seeAlso to `skos:exactMatch` | `other:ThresholdOfSubstanceOfConcern` | our term is a property, target is a class |
| 0.90 | `oec:hasDataElement` | `skos:broadMatch` | `semic:hasMember` | deferred by a curator: Foreign domain: org:hasMember relates an Organization to a member Agent; oec:hasDataElement is EN 18223 structural containment (passport/collection to DataElement). Membership as a word pattern, not as a concept. |
| 0.90 | `oec:OperatorInformation` | `skos:narrowMatch` | `other:EconomicOperatorRole` | deferred by a curator: An operator record (name, address, identifiers) against a role enumeration: the same level confusion already resolved for oec:OperatorRole, which CIRPASS2_ALIGNMENT.md records as pointer-only. |
| 0.89 | `oec:EnergyEfficiencyClass` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:EnergyConsumptionDetails` | our term is a type, target is the entity |
| 0.89 | `oec:RepairProvider` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:AutoRepair` | schema:AutoRepair belongs to an area foreign to a passport |
| 0.89 | `oec:stageValue` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.88 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:originalCodeValue` | our term is a structural value carrier |
| 0.87 | `oec:hasCarbonFootprintProduction` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.86 | `oec:RepairProvider` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:MotorcycleRepair` | schema:MotorcycleRepair belongs to an area foreign to a passport |
| 0.84 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `semic:hasValue` | target is a structural value carrier |
| 0.84 | `oec:recycledContent` | skos:closeMatch to `skos:narrowMatch` | `batterypass:recycledContent` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.83 | `oec:EnvironmentalProductDeclaration` | `skos:narrowMatch` | `schemaorg:EnergyConsumptionDetails` | deferred by a curator: An EN 15804 environmental product declaration covers impact indicators across the whole life cycle; schema:EnergyConsumptionDetails carries appliance energy figures. Neither subsumes the other. |
| 0.83 | `oec:OperationalScope` | skos:broadMatch to `skos:narrowMatch` | `batterypass:CarbonFootprintPerLifecycleStageEntity` | our term is a type, target is the entity |
| 0.82 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `schemaorg:codeValue` | our term is a structural value carrier |
| 0.82 | `oec:recyclabilityScore` | `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.82 | `oec:hasExpectedLifespan` | skos:closeMatch to `skos:narrowMatch` | `batterypass:expectedLifetime` | regrade skos:closeMatch to skos:narrowMatch |
| 0.81 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:value` | target is a structural value carrier |
| 0.81 | `oec:carbonFootprintTotal` | skos:closeMatch to `skos:narrowMatch` | `batterypass:carbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.81 | `oec:DocumentReference` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:APIReference` | schema:APIReference belongs to an area foreign to a passport |
| 0.81 | `oec:facilityId` | skos:broadMatch to `skos:narrowMatch` | `dppk:manufacturingFacility` | deferred by a curator: An identifier is not broader than the thing it identifies: oec:facilityId is the identifier, dppk:manufacturingFacility the facility reference. oec:hasFacilityInformation is the term that compares. |
| 0.80 | `oec:PassportStatus` | rdfs:seeAlso to `skos:exactMatch` | `other:dppStatus` | our term is a class, target is a property |
| 0.80 | `oec:hasMaterialComposition` | `skos:narrowMatch` | `gs1:textileMaterialPercentage` | gs1:textileMaterialPercentage is a general Layer-1 term, so narrowMatch inverts the relation; broadMatch is the direction |
| 0.79 | `oec:ProductCategory` | `skos:broadMatch` | `untp:Product` | our term is a type, target is the entity |
| 0.79 | `oec:EnvironmentalProductDeclaration` | skos:broadMatch to `skos:narrowMatch` | `batterypass:CarbonFootprintPerLifecycleStageEntity` | direction flip toward a peer profile below the 0.8 floor |
| 0.79 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:carbonFootprintPerLifecycleStage` | direction flip toward a peer profile below the 0.8 floor |
| 0.79 | `oec:SingleValuedDataElement` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:QuantitativeValue` | seeAlso upgrade below the 0.8 floor |
| 0.79 | `oec:hasDismantlingInstructions` | skos:broadMatch to `skos:narrowMatch` | `batterypass:dismantlingAndRemovalInformation` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `oec:economicOperatorId` | rdfs:seeAlso to `skos:broadMatch` | `gs1:additionalOrganizationID` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:recycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:postConsumerRecycledContentPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:hasCarbonFootprintUse` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:ProductCategory` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Product` | our term is a type, target is the entity |
| 0.78 | `oec:hasMaterialComposition` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:packagingMaterialCompositionQuantity` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:reportUrl` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:supplyChainDueDiligenceReport` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:passportIdentifier` | skos:broadMatch to `skos:narrowMatch` | `batterypass:batteryPassportIdentifier` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `oec:hasMultiLanguageValue` | `skos:broadMatch` | `untp:value` | new mapping below the 0.8 floor |
| 0.78 | `oec:hasRecycledContentDetails` | skos:broadMatch to `skos:narrowMatch` | `untp:recycledMassFraction` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `oec:hasProductCategory` | skos:broadMatch to `skos:narrowMatch` | `batterypass:batteryCategory` | direction flip toward a peer profile below the 0.8 floor |
| 0.78 | `oec:CarbonFootprintDeclaration` | `skos:broadMatch` | `other:EnvironmentalFootprint` | new mapping below the 0.8 floor |
| 0.78 | `oec:identityCredentialUrl` | rdfs:seeAlso to `skos:broadMatch` | `dppk:verifiableCredential` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `oec:LifecycleStageResult` | skos:broadMatch to `skos:narrowMatch` | `batterypass:CarbonFootprintPerLifecycleStageEntity` | direction flip toward a peer profile below the 0.8 floor |
| 0.77 | `oec:HazardousSubstance` | rdfs:seeAlso to `skos:broadMatch` | `other:Substance` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:hasCarbonFootprintProduction` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:absoluteCarbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:hasTechnicalLifetime` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:batteryTechnicalProperties` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:hasMaterialComposition` | rdfs:seeAlso to `skos:narrowMatch` | `gs1:textileMaterialContent` | gs1:textileMaterialContent is a general Layer-1 term, so narrowMatch inverts the relation; broadMatch is the direction |
| 0.77 | `oec:stageValue` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:remainingCapacityValue` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:endOfLifeInstructions` | skos:closeMatch to `skos:broadMatch` | `batterypass:endOfLifeInformation` | regrade skos:closeMatch to skos:broadMatch |
| 0.77 | `oec:hasCarbonFootprint` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:absoluteCarbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `oec:massFraction` | `skos:narrowMatch` | `untp:recycledMassFraction` | new mapping below the 0.8 floor |
| 0.77 | `oec:stageValue` | `skos:narrowMatch` | `batterypass:remainingRoundTripEnergyEfficiencyValue` | new mapping below the 0.8 floor |
| 0.77 | `oec:RecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:RecycledContentEntity` | seeAlso upgrade below the 0.8 floor |
| 0.76 | `oec:value` | rdfs:seeAlso to `skos:narrowMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.76 | `oec:stageValue` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:capacityThroughputValue` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:hasCarbonFootprint` | skos:closeMatch to `skos:narrowMatch` | `batterypass:batteryCarbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.75 | `oec:compostabilityStandard` | `skos:broadMatch` | `untp:standard` | new mapping below the 0.8 floor |
| 0.75 | `oec:materialCircularityIndicator` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:recyclabilityScore` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:ProductCategory` | rdfs:seeAlso to `skos:broadMatch` | `gs1:Product` | our term is a type, target is the entity |
| 0.75 | `oec:passportVersion` | `skos:broadMatch` | `dppk:versionNumber` | new mapping below the 0.8 floor |
| 0.75 | `oec:DocumentType` | skos:closeMatch to `skos:narrowMatch` | `gs1:ReferencedFileTypeCode` | regrade skos:closeMatch to skos:narrowMatch |
| 0.75 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:evolutionOfSelfDischargeValue` | direction flip toward a peer profile below the 0.8 floor |
| 0.75 | `oec:hasMultiLanguageValue` | `skos:broadMatch` | `schemaorg:textValue` | new mapping below the 0.8 floor |
| 0.75 | `oec:hasTraceabilityPerformance` | `skos:broadMatch` | `untp:requiredPerformance` | new mapping below the 0.8 floor |
| 0.75 | `oec:hasLifecycleStageResult` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:carbonFootprintPerLifecycleStage` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:tradeItemPieceDescription` | rdfs:seeAlso to `skos:broadMatch` | `gs1:additionalProductDescription` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:hasCarbonFootprintEndOfLife` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:hasLifecycleStage` | skos:closeMatch to `skos:broadMatch` | `batterypass:lifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.75 | `oec:separateCollectionInfo` | `skos:broadMatch` | `batterypass:informationOnCollection` | new mapping below the 0.8 floor |
| 0.75 | `oec:TraceabilityPerformance` | rdfs:seeAlso to `skos:broadMatch` | `untp:PerformanceMetric` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `oec:SingleValuedDataElement` | `skos:broadMatch` | `schemaorg:PropertyValueSpecification` | target is a structural value carrier |
| 0.75 | `oec:DataElementCollection` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Collection` | schema:Collection belongs to an area foreign to a passport |
| 0.75 | `oec:hasMultiLanguageValue` | `skos:broadMatch` | `dppk:dimensionValue` | new mapping below the 0.8 floor |
| 0.74 | `oec:DocumentReference` | skos:closeMatch to `skos:narrowMatch` | `gs1:ReferencedFileDetails` | regrade skos:closeMatch to skos:narrowMatch |
| 0.73 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:remainingEnergyValue` | direction flip toward a peer profile below the 0.8 floor |
| 0.73 | `oec:hasCarbonFootprintProduction` | rdfs:seeAlso to `skos:broadMatch` | `dppk:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `oec:hasCarbonFootprintEndOfLife` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.73 | `oec:hasCarbonFootprintUse` | `skos:narrowMatch` | `batterypass:batteryCarbonFootprint` | new mapping below the 0.8 floor |
| 0.73 | `oec:preConsumerRecycledContent` | rdfs:seeAlso to `skos:broadMatch` | `untp:recycledMassFraction` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `oec:BiodegradabilityTestMethod` | rdfs:seeAlso to `skos:broadMatch` | `semic:Criterion` | our term is a type, target is the entity |
| 0.73 | `oec:hasPowerConsumptionOn` | `skos:broadMatch` | `dppk:ratedPower` | new mapping below the 0.8 floor |
| 0.73 | `oec:reportUrl` | `skos:broadMatch` | `batterypass:documentURL` | new mapping below the 0.8 floor |
| 0.73 | `oec:stageValue` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:numberOfFullCyclesValue` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `oec:carbonFootprintTotal` | `skos:narrowMatch` | `batterypass:batteryCarbonFootprint` | new mapping below the 0.8 floor |
| 0.73 | `oec:CustomsCommodityCodeType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:CategoryCode` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `oec:identityCredentialUrl` | rdfs:seeAlso to `skos:broadMatch` | `gs1:referencedFileURL` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `oec:LifecycleStageResult` | rdfs:seeAlso to `skos:exactMatch` | `other:LCIAModuleValue` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `oec:declaredUnit` | `skos:broadMatch` | `schemaorg:unitText` | new mapping below the 0.8 floor |
| 0.72 | `oec:hasCarbonFootprintRawMaterial` | `skos:broadMatch` | `other:MaterialFootprint` | our term is a property, target is a class |
| 0.72 | `oec:carbonFootprintTotal` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:carbonFootprintPerLifecycleStage` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:preConsumerRecycledContentPercentage` | direction flip toward a peer profile below the 0.8 floor |
| 0.72 | `oec:hasPerformanceInfo` | `skos:narrowMatch` | `untp:claimedPerformance` | new mapping below the 0.8 floor |
| 0.72 | `oec:indicatorTotalValue` | rdfs:seeAlso to `skos:broadMatch` | `gs1:value` | target is a structural value carrier |
| 0.72 | `oec:wastePreventionInfo` | `skos:narrowMatch` | `batterypass:informationOnCollection` | new mapping below the 0.8 floor |
| 0.72 | `oec:postConsumerRecycledContent` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:recycledContent` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `oec:hasDueDiligenceReport` | `skos:broadMatch` | `untp:documentation` | new mapping below the 0.8 floor |
| 0.72 | `oec:hasCarbonFootprint` | skos:closeMatch to `skos:narrowMatch` | `batterypass:carbonFootprint` | regrade skos:closeMatch to skos:narrowMatch |
| 0.72 | `oec:CustomsCommodityCodeType` | rdfs:seeAlso to `skos:broadMatch` | `gs1:TypeCode` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `oec:epdStandard` | `skos:broadMatch` | `gs1:certificationStandard` | new mapping below the 0.8 floor |
| 0.72 | `oec:hasTraceabilityPerformance` | `skos:broadMatch` | `dppk:performance` | new mapping below the 0.8 floor |
| 0.71 | `oec:hasSubstancesOfConcern` | rdfs:seeAlso to `skos:closeMatch` | `gs1:ingredientOfConcern` | gs1 domain FoodBeverageTobaccoProduct is foreign to a passport |
| 0.71 | `oec:reportUrl` | rdfs:seeAlso to `skos:broadMatch` | `gs1:referencedFileURL` | seeAlso upgrade below the 0.8 floor |
| 0.71 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:energyThroughputValue` | direction flip toward a peer profile below the 0.8 floor |
| 0.70 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:preConsumerRecycledContent` | direction flip toward a peer profile below the 0.8 floor |
| 0.70 | `oec:hasCarbonFootprintUse` | `skos:broadMatch` | `dppk:carbonFootprint` | new mapping below the 0.8 floor |
| 0.70 | `oec:hasCarbonFootprint` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:carbonFootprintPerLifecycleStage` | seeAlso upgrade below the 0.8 floor |
| 0.70 | `oec:HarmonisedStandard` | `skos:broadMatch` | `untp:Standard` | new mapping below the 0.8 floor |
| 0.70 | `oec:hasConformityDeclaration` | rdfs:seeAlso to `skos:broadMatch` | `gs1:certification` | seeAlso upgrade below the 0.8 floor |
| 0.70 | `oec:hasFacilityInformation` | `skos:narrowMatch` | `other:FacilityIdentifier` | our term is a property, target is a class |
| 0.70 | `oec:materialFootprint` | `skos:narrowMatch` | `gs1:packagingMaterialCompositionQuantity` | new mapping below the 0.8 floor |
| 0.70 | `oec:stageValue` | skos:broadMatch to `skos:narrowMatch` | `batterypass:capacityFadeValue` | direction flip toward a peer profile below the 0.8 floor |
| 0.70 | `oec:FacilityInformation` | `skos:narrowMatch` | `gs1:LocationID_Details` | new mapping below the 0.8 floor |
| 0.70 | `oec:recycledContent` | skos:broadMatch to `skos:narrowMatch` | `dppk:postConsumerRecycledContent` | direction flip toward a peer profile below the 0.8 floor |
| 0.69 | `oec:hasHazardousSubstances` | `skos:broadMatch` | `dppk:textileSubstancesOfConcern` | new mapping below the 0.8 floor |
| 0.69 | `oec:HazardousSubstance` | skos:broadMatch to `skos:narrowMatch` | `batterypass:HazardousSubstanceEntity` | direction flip toward a peer profile below the 0.8 floor |
| 0.69 | `oec:hasCarbonFootprintProduction` | `skos:broadMatch` | `dppk:carbonFootprintAbsolute` | new mapping below the 0.8 floor |
| 0.68 | `oec:hasCarbonFootprintUse` | `skos:broadMatch` | `dppk:carbonFootprintAbsolute` | new mapping below the 0.8 floor |
| 0.68 | `oec:hasPerformanceInfo` | `skos:narrowMatch` | `untp:requiredPerformance` | new mapping below the 0.8 floor |
| 0.68 | `oec:indicatorTotalValue` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.68 | `oec:dismantlingGuideUrl` | `skos:broadMatch` | `batterypass:dismantlingAndRemovalInformation` | new mapping below the 0.8 floor |
| 0.68 | `oec:hasMaterialComposition` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:recycledMaterial` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `oec:stageValue` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:internalResistanceIncreaseValue` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `oec:activityClassification` | rdfs:seeAlso to `skos:narrowMatch` | `other:isic` | seeAlso upgrade below the 0.8 floor |
| 0.67 | `oec:hasPowerConsumptionOn` | `skos:broadMatch` | `dppk:power` | new mapping below the 0.8 floor |
| 0.67 | `oec:biodegradationPercentage` | `skos:broadMatch` | `dppk:componentPercentage` | new mapping below the 0.8 floor |
| 0.66 | `oec:hasCarbonFootprintProduction` | `skos:broadMatch` | `dppk:environmentalFootprint` | new mapping below the 0.8 floor |
| 0.65 | `oec:endOfLifeInstructions` | `skos:narrowMatch` | `dppk:textileEndOfLifeInstructions` | new mapping below the 0.8 floor |
| 0.63 | `oec:hasCarbonFootprintProduction` | `skos:broadMatch` | `dppk:carbonFootprintGeneralInfo` | new mapping below the 0.8 floor |
| 0.63 | `oec:FacilityInformation` | rdfs:seeAlso to `skos:broadMatch` | `untp:Facility` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `oec:hasCarbonFootprint` | `skos:broadMatch` | `dppk:environmentalFootprint` | new mapping below the 0.8 floor |
| 0.60 | `oec:hazardImpact` | `skos:narrowMatch` | `batterypass:hazardousSubstanceImpact` | new mapping below the 0.8 floor |

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

From `skos-completeness-textile-2026-08-07.json`. 51 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.95 | `eutex:TestStandard` | rdfs:seeAlso to `skos:broadMatch` | `untp:Standard` | our term is a type, target is the entity |
| 0.93 | `eutex:SubstanceOfConcernType` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:Substance` | our term is a type, target is the entity |
| 0.93 | `eutex:SubstanceOfConcernType` | `skos:broadMatch` | `eudpp:Substance` | our term is a type, target is the entity |
| 0.92 | `eutex:benchmarkPerformance` | rdfs:seeAlso to `skos:exactMatch` | `dppk:environmentalFootprintBenchmarkPercentage` | deferred by a curator: skos:exactMatch contradicts our own bridge documentation: DPP_KEYSTONE_MAPPING.md records this as Partial because eutex:benchmarkPerformance collapses BOTH dppk:environmentalFootprintBenchmarkPercentage and dppk:carbonFootprintBenchmarkPercentage, a distinction dppk makes and we do not. Our term is the broader one, so the honest grade is narrowMatch or closeMatch, not exactMatch. |
| 0.92 | `eutex:substanceConcentration` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.90 | `eutex:WasteOriginType` | `skos:broadMatch` | `eudpp:MaterialOrigin` | our term is a type, target is the entity |
| 0.90 | `eutex:LCIACategory` | `skos:broadMatch` | `eudpp:LcaResult` | our term is a type, target is the entity |
| 0.89 | `eutex:secondaryMaterialFraction` | `skos:broadMatch` | `eudpp:materialPercentage` | deferred by a curator: Wrong referent: eudpp:materialPercentage is the composition share of a material ('percentage of material x'), while secondaryMaterialFraction is the recycled-content ratio. EUDPP carries the right counterpart as eudpp:materialRecycledContent (the battery module maps its recycled shares there); a future pass should propose that pair instead. |
| 0.88 | `eutex:SubstanceOfConcernType` | `skos:broadMatch` | `eudpp:SubstanceOfConcern` | our term is a type, target is the entity |
| 0.88 | `eutex:SubstanceOfConcern` | `skos:broadMatch` | `eudpp:SubstanceOfConcern` | identical local names, so exactMatch or closeMatch is the question, not which contains which |
| 0.83 | `eutex:FootprintDataType` | `skos:narrowMatch` | `batterypass:CarbonFootprintPerLifecycleStageEntity` | our term is a type, target is the entity |
| 0.81 | `eutex:DurabilityClass` | `skos:broadMatch` | `eudpp:Durability` | our term is a type, target is the entity |
| 0.80 | `eutex:lciaValue` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:value` | target is a structural value carrier |
| 0.80 | `eutex:secondaryMaterialFraction` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:recycledContent` | deferred by a curator: Cross-sector peers at the same granularity: a textile-scoped recycled fraction and the battery-scoped recycledContent block do not subsume each other in either direction (same reasoning as the deferred eubat:hasRecycledContent flip). The ungraded seeAlso stands. |
| 0.78 | `eutex:spiralityScore` | rdfs:seeAlso to `skos:broadMatch` | `untp:score` | seeAlso upgrade below the 0.8 floor |
| 0.78 | `eutex:ApparelSubcategory` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:PefcrApparelAccessories` | our term is a type, target is the entity |
| 0.77 | `eutex:seasonCollection` | skos:narrowMatch to `skos:broadMatch` | `gs1:seasonCalendarYear` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.77 | `eutex:hasCutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `schemaorg:countryOfAssembly` | seeAlso upgrade below the 0.8 floor |
| 0.77 | `eutex:RecycledContentDeclaration` | `skos:broadMatch` | `eudpp:RecycledMaterialsUse` | new mapping below the 0.8 floor |
| 0.76 | `eutex:concentrationRange` | `skos:broadMatch` | `eudpp:hasConcentration` | new mapping below the 0.8 floor |
| 0.75 | `eutex:DurabilityClass` | `skos:broadMatch` | `eudpp:QualityIndicator` | our term is a type, target is the entity |
| 0.75 | `eutex:maxConcentration` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:hazardousSubstanceConcentration` | seeAlso upgrade below the 0.8 floor |
| 0.75 | `eutex:CLPHazardCategory` | `skos:broadMatch` | `schemaorg:CategoryCode` | new mapping below the 0.8 floor |
| 0.75 | `eutex:seasonCollection` | skos:narrowMatch to `skos:broadMatch` | `gs1:seasonName` | the asserted relation is a recorded decision in mapping-allowlist.json |
| 0.75 | `eutex:CareSymbolCode` | `skos:broadMatch` | `eudpp:ClassificationCode` | new mapping below the 0.8 floor |
| 0.75 | `eutex:hasCutAndSewFacility` | `skos:broadMatch` | `gs1:countryOfAssembly` | new mapping below the 0.8 floor |
| 0.74 | `eutex:CareInstruction` | `skos:broadMatch` | `eudpp:DigitalInstruction` | new mapping below the 0.8 floor |
| 0.73 | `eutex:RobustnessAssessment` | `skos:broadMatch` | `eudpp:Durability` | new mapping below the 0.8 floor |
| 0.73 | `eutex:organicContentPercentage` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:renewableContent` | seeAlso upgrade below the 0.8 floor |
| 0.73 | `eutex:RobustnessAssessment` | `skos:broadMatch` | `eudpp:ConformityAssessmentModule` | new mapping below the 0.8 floor |
| 0.73 | `eutex:maxConcentration` | `skos:broadMatch` | `eudpp:hasConcentration` | new mapping below the 0.8 floor |
| 0.72 | `eutex:hasApparelSubcategory` | rdfs:seeAlso to `skos:broadMatch` | `gs1:additionalProductClassification` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `eutex:hasCutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:manufacturingPlace` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `eutex:carbonFootprintManufacturing` | skos:closeMatch to `skos:broadMatch` | `batterypass:carbonFootprintPerLifecycleStage` | regrade skos:closeMatch to skos:broadMatch |
| 0.72 | `eutex:carbonFootprintManufacturing` | rdfs:seeAlso to `skos:broadMatch` | `batterypass:carbonFootprint` | seeAlso upgrade below the 0.8 floor |
| 0.72 | `eutex:LCIACategoryCode` | `skos:broadMatch` | `eudpp:ImpactCategory` | new mapping below the 0.8 floor |
| 0.71 | `eutex:hasRobustnessAssessment` | `skos:broadMatch` | `untp:conformityAssessment` | new mapping below the 0.8 floor |
| 0.70 | `eutex:hasSubstancesOfConcern` | `skos:broadMatch` | `dppk:hazardousSubstances` | new mapping below the 0.8 floor |
| 0.70 | `eutex:RecycledContentDeclaration` | `skos:broadMatch` | `dppk:DeclarationOfPerformance` | new mapping below the 0.8 floor |
| 0.70 | `eutex:hasCutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `dppk:facilityId` | seeAlso upgrade below the 0.8 floor |
| 0.70 | `eutex:hasFiberCertification` | rdfs:seeAlso to `skos:broadMatch` | `gs1:certificationIdentification` | seeAlso upgrade below the 0.8 floor |
| 0.69 | `eutex:hasRobustnessAssessment` | `skos:broadMatch` | `untp:assessmentCriteria` | new mapping below the 0.8 floor |
| 0.69 | `eutex:hasCutAndSewFacility` | rdfs:seeAlso to `skos:broadMatch` | `untp:producedAtFacility` | seeAlso upgrade below the 0.8 floor |
| 0.69 | `eutex:hasEuDeclarationOfConformity` | `skos:broadMatch` | `untp:conformityAssessment` | new mapping below the 0.8 floor |
| 0.68 | `eutex:hasSubstancesOfConcern` | `skos:broadMatch` | `dppk:dangerousSubstances` | new mapping below the 0.8 floor |
| 0.68 | `eutex:hasWasteOriginType` | `skos:narrowMatch` | `dppk:animalOriginNonTextile` | new mapping below the 0.8 floor |
| 0.68 | `eutex:safeUseInstructions` | rdfs:seeAlso to `skos:broadMatch` | `gs1:consumerUsageInstructions` | seeAlso upgrade below the 0.8 floor |
| 0.68 | `eutex:benchmarkPerformance` | rdfs:seeAlso to `skos:narrowMatch` | `dppk:carbonFootprintBenchmarkPercentage` | seeAlso upgrade below the 0.8 floor |
| 0.67 | `eutex:hasRobustnessAssessment` | rdfs:seeAlso to `skos:broadMatch` | `untp:assessedPerformance` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `eutex:dimensionalChangePercentage` | rdfs:seeAlso to `skos:closeMatch` | `dppk:dimensionalChange` | seeAlso upgrade below the 0.8 floor |
| 0.60 | `eutex:locationInProduct` | rdfs:seeAlso to `skos:narrowMatch` | `batterypass:hazardousSubstanceLocation` | seeAlso upgrade below the 0.8 floor |

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

110 assertions still read `narrowMatch`. Their targets are peer profiles or
intra-project terms of comparable specificity, where which of the two is narrower is a
modelling question per term. `check:mappings` rule 6 already guards the mechanical class,
the general Layer-1 head terms.

- **BatteryPass SAMM / bpr**: 40
- **DPP Keystone**: 31
- **GS1 tail**: 17
- **other**: 16
- **schema.org tail**: 5
- **UNTP**: 1
