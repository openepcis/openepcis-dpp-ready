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

## cpr

From `skos-completeness-cpr-2026-07-28.json`. 10 confirmed findings the triage did not apply.

| QA | Our term | Panel proposes | Target | Why it waits |
|---|---|---|---|---|
| 0.95 | `eucpr:ReactionToFireClass` | `skos:broadMatch` | `schemaorg:Class` | target is a meta-class |
| 0.93 | `eucpr:ConstructionProductType` | skos:broadMatch to `skos:narrowMatch` | `dppk:BatteryProduct` | our term is a type, target is the entity |
| 0.92 | `eucpr:characteristicValue` | `skos:narrowMatch` | `schemaorg:broadcastFrequencyValue` | every schema domain (BroadcastFrequencySpecification) is foreign to a passport |
| 0.80 | `eucpr:ConstructionProductType` | skos:broadMatch to `skos:narrowMatch` | `schemaorg:IndividualProduct` | our term is a type, target is the entity |
| 0.77 | `eucpr:ConstructionProduct` | `skos:narrowMatch` | `dppk:IronSteelProduct` | new mapping below the 0.8 floor |
| 0.75 | `eucpr:ConstructionProductType` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Product` | the asserted relation is a recorded decision in mapping-allowlist.json |
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
| 0.78 | `eudet:SurfactantType` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:ChemicalSubstance` | the asserted relation is a recorded decision in mapping-allowlist.json |
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
| 0.94 | `eudr:TimberProductType` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Product` | the asserted relation is a recorded decision in mapping-allowlist.json |
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
| 0.93 | `eutex:SubstanceOfConcernType` | skos:narrowMatch to `skos:broadMatch` | `schemaorg:Substance` | the asserted relation is a recorded decision in mapping-allowlist.json |
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

87 assertion(s) the ontology already carries were marked `WRONG` by the
bulk grader and then had the correction rejected by the QA panel. Nothing was applied, so
each one is either a mapping worth re-reading or a prompt worth improving. A worked example:
the textile panel rejected `eutex:additionalCareInstructions skos:narrowMatch
schema:additionalProperty` at 0.97 confidence, and it does look inverted, since
`schema:additionalProperty` is a general extension slot rather than a narrower concept.

- **electronics**: 24
- **textile**: 21
- **cpr**: 20
- **eudr**: 12
- **iron-steel**: 6
- **detergent**: 3
- **fsma204**: 1

## Remaining `skos:narrowMatch` assertions

308 assertions still read `narrowMatch`. Their targets are peer profiles or
intra-project terms of comparable specificity, where which of the two is narrower is a
modelling question per term. `check:mappings` rule 6 already guards the mechanical class,
the general Layer-1 head terms.

- **BatteryPass SAMM / bpr**: 120
- **schema.org tail**: 59
- **DPP Keystone**: 53
- **UNTP**: 25
- **GS1 tail**: 21
- **intra-project**: 15
- **SEMICeu / CCCEV**: 11
- **other**: 4
