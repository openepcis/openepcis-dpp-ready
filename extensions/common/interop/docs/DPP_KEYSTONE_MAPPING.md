# OpenEPCIS ↔ DPP Keystone Property Mapping

Mapping between OpenEPCIS DPP-Ready and the **DPP Keystone** profile
(`dpp-keystone.org`, prefix `dppk:`, namespace
`https://dpp-keystone.org/spec/v2/terms#`, spec **v2**). DPP Keystone is a peer
DPP profile published as JSON-LD + JSON Schema; OpenEPCIS treats it as a Layer-2
community profile and anchors to it via graded SKOS mapping relations
(`skos:exactMatch` / `skos:closeMatch` / `skos:broadMatch`) in the module
ontologies plus the bridge context
[`../context/dpp-keystone-bridge-context.jsonld`](../context/dpp-keystone-bridge-context.jsonld).

To ingest a DPP Keystone document, load it with the bridge context: its keys are
reinterpreted as the OpenEPCIS vocabulary.

## Value conventions — read before exchanging

DPP Keystone and OpenEPCIS **do not share all numeric conventions**. Two known
mismatches the bridge context cannot rescale (JSON-LD maps IRIs, not values):

| Concern | DPP Keystone | OpenEPCIS | Action on exchange |
|---------|--------------|-----------|--------------------|
| Component / content share | `componentPercentage`, `*RecycledContentPercentage` on a **0–100** scale | `oec:massFraction`, `oec:preConsumerRecycledContent`, `oec:postConsumerRecycledContent` on a **0–1** fraction | Divide by 100 when importing into `oec:` (and ×100 when exporting). |
| Numeric datatype | `xsd:double` | `xsd:decimal` | No value change; datatype annotation differs only. |
| Visibility / access | `dppk:visibility` enum: `Public`, `LegitimateInterest`, `LegitimateInterestOrAuthority`, `AuthorityOnly` (4) | `oec:AccessLevel`: `Public`, `AuthorizedOnly`, `Restricted` (3) | Lossy: `LegitimateInterest`/`LegitimateInterestOrAuthority` → `Restricted`/`AuthorizedOnly` approximately. Not auto-mapped. |

## Coverage legend

- **Mapped** — faithful 1:1 term mapping in the bridge context.
- **Partial** — mapped, but lossy (scale, granularity, or enum mismatch).
- **Structural** — no `@context` mapping possible; needs a shape transform (documented, not in the bridge).
- **Unmapped (theirs)** — DPP Keystone term with no OpenEPCIS counterpart.

## Core — product, organization, component

| DPP Keystone | OpenEPCIS | Coverage | Notes |
|--------------|-----------|----------|-------|
| `dppk:Product` | `gs1:Product` | Mapped | |
| `dppk:Organization` | `oec:OperatorInformation` | Mapped | |
| `dppk:gtin` / `productName` / `brand` / `model` / `netWeight` / `countryOfOrigin` | `gs1:gtin` / `gs1:productName` / `gs1:brandName` / `schema:model` / `gs1:netWeight` / `gs1:countryOfOrigin` | Mapped | GS1 first per layering. |
| `dppk:economicOperatorId` / `facilityId` | `oec:economicOperatorId` / `oec:facilityId` | Mapped | |
| `dppk:organizationName` / `gln` / `manufacturer` | `gs1:organizationName` / `gs1:globalLocationNumber` / `gs1:manufacturer` | Mapped | |
| `dppk:Component` | `oec:MaterialComposition` | Mapped | The generic component class splits across `oec:MaterialComposition` (+ `oec:SubstanceOfConcern` for chemical identity). |
| `dppk:componentName` / `componentIdentifier` | `oec:componentName` / `oec:componentIdentifier` | Mapped | Harvested into `oec:` to give the bridge a clean target. |
| `dppk:componentCasNumber` / `componentEcNumber` / `componentIupacName` | `oec:casNumber` / `oec:ecNumber` / `schema:iupacName` | Mapped | IUPAC name maps to the foundational `schema:iupacName` directly (no local term needed). |
| `dppk:componentLocationInProduct` | `oec:substanceLocation` | Mapped | |
| `dppk:componentPercentage` | `oec:massFraction` | Partial | 0–100 → 0–1 rescale (see above). |

## Iron & steel + Material Test Certificate (`eusteel:`)

| DPP Keystone | OpenEPCIS | Coverage | Notes |
|--------------|-----------|----------|-------|
| `dppk:IronSteelProduct` | `eusteel:IronSteelProduct` | Mapped | `skos:exactMatch`. |
| `dppk:heatNumber` / `castNumber` / `lotNumber` / `productNumber` / `purchaserOrder` | `eusteel:` same | Mapped | |
| `dppk:steelGradeClassification` / `steelDesignation` / `technologyRoute` / `meltAndPourCountry` / `cbamReportId` | `eusteel:` same | Mapped | `technologyRoute`: dppk free text → `eusteel:TechnologyRoute` enum (Partial on export). |
| `dppk:MaterialTestCertificate` / `mtc` | `eusteel:MaterialTestCertificate` / `eusteel:mtc` | Mapped | `skos:exactMatch`. |
| `dppk:mtcNominalSize` / `mtcWeightTolerance` / `mtcYieldStrength` / `mtcYieldStrengthRatio` / `mtcElongation` / `mtcRelativeRibArea` | `eusteel:` same | Mapped | EN 10168 mechanical. |
| `dppk:mtcCarbonContent` / `mtcPhosphorusContent` / `mtcSulfurContent` / `mtcCopperContent` / `mtcNitrogenContent` / `mtcCarbonEquivalent` | `eusteel:` same | Mapped | EN 10168 chemical. |
| `dppk:mtcSteelProcess` / `mtcFinishing` / `mtcRadiometricControl` | `eusteel:` same | Mapped | |
| — | `eusteel:mtcInspectionType`, `eusteel:mtcTensileStrength` | Unmapped (theirs) | OpenEPCIS enrichments (EN 10204 doc type, Rm). |

## Environmental Product Declaration (EN 15804)

| DPP Keystone | OpenEPCIS | Coverage | Notes |
|--------------|-----------|----------|-------|
| `dppk:EPDBlock` | `oec:EnvironmentalProductDeclaration` | Mapped | `skos:exactMatch`. |
| `dppk:ImpactValues` | `oec:ImpactIndicatorResult` | Mapped | `skos:closeMatch` (structural difference — see below). |
| `dppk:epd` | `oec:environmentalProductDeclaration` | Mapped | `skos:exactMatch`. |
| `dppk:indicator` | `oec:impactIndicator` | Mapped | |
| `dppk:gwp` / `gwpF` / `gwpB` / `gwpLuluc` / `odp` / `ap` / `epF` / `epM` / `epT` / `pocp` / `adpe` / `adpf` / `wdp` | `oec:impactIndicator` with `oec:indicatorType` ∈ {`oec:GWPTotal`, `GWPFossil`, …, `WDP`} | **Structural** | DPP Keystone has one property per indicator pointing at an `ImpactValues` node; OpenEPCIS normalises to one `ImpactIndicatorResult` carrying an `oec:indicatorType` selector. Each `dppk:` indicator property is anchored `rdfs:seeAlso` to its `oec:ImpactIndicatorType` value; the per-property→per-instance reshape is a transform, not a context mapping. |
| `dppk:a1` … `dppk:c1` (lifecycle modules) | `oec:LifecycleStageResult` (`oec:lifecycleStage` ∈ {`oec:StageA1`…`oec:StageD`} + `oec:stageValue`) | **Structural** | Same reshape: flat `a1..d` properties → normalised stage/value pairs. `rdfs:seeAlso` anchors on each `oec:Stage*` value. |

## Construction / Declaration of Performance (`eucpr:`)

| DPP Keystone | OpenEPCIS | Coverage | Notes |
|--------------|-----------|----------|-------|
| `dppk:DoPCBlock` / `DeclarationOfPerformance` | `eucpr:DeclarationOfPerformance` | Mapped | `skos:exactMatch`. |
| `dppk:ConstructionProduct` | `eucpr:ConstructionProduct` | Mapped | |
| `dppk:dopc` / `hasDoP` | `eucpr:declarationOfPerformance` | Mapped | |
| `dppk:declarationCode` / `dopIdentifier` | `eucpr:declarationCode` | Mapped | |
| `dppk:dateOfIssue` | `eucpr:dateOfIssue` | Mapped | |
| `dppk:harmonisedStandardReference` | `eucpr:harmonisedStandard` | Mapped | |
| `dppk:avsSystem` | `eucpr:avcpSystem` | Mapped | dppk free string → `eucpr:AVCPSystem` enum (Partial on export). |
| `dppk:notifiedBody` / `technicalAssessmentBody` | `eucpr:notifiedBody` / `eucpr:technicalAssessmentBody` (→ `oec:OperatorInformation`) | Mapped | |
| `dppk:validationReports` / `europeanAssessmentDocument` | `eucpr:validationReports` / `eucpr:europeanAssessmentDocument` (→ `oec:DocumentReference`) | Mapped | |
| `dppk:thermalConductivity` / `compressiveStrength` | `eucpr:thermalConductivity` / `eucpr:compressiveStrength` | Mapped | |
| `dppk:reactionToFire` (string) | `eucpr:reactionToFireClass` (EN 13501-1 enum) | Partial | String → enum. Not auto-mapped in the context. |
| `dppk:DoPC` per-test groups (`chlorideContent`, `bondStrength`, `thermalCompatibility`, …) | `eucpr:essentialCharacteristic` instances | Structural | Each test group → one `EssentialCharacteristic` (name + `gs1:QuantitativeValue` + `harmonisedStandard`). |
| `dppk:steelGrade` / `railProfile` (construction) | `eusteel:steelDesignation` / `rail:` | Partial / Unmapped | Construction-rail crossovers. |

## Textile

| DPP Keystone | OpenEPCIS | Coverage | Notes |
|--------------|-----------|----------|-------|
| `dppk:TextileProduct` | `gs1:Product` (`eutex:TextileApparel` / `TextileFootwear` for subtype) | Partial | OpenEPCIS splits apparel/footwear; map to the GS1 base on ingest. |
| `dppk:robustnessScore` / `recyclabilityScore` | `eutex:robustnessScore` / `eutex:recyclabilityScore` | Mapped | |
| `dppk:carbonFootprint` | `eutex:carbonFootprintManufacturing` | Mapped | |
| `dppk:carbonFootprintClass` / `environmentalFootprintClass` | `eutex:carbonFootprintClass` / `eutex:environmentalFootprintClass` | Mapped | Harvested. |
| `dppk:environmentalFootprint` | `eutex:pefSingleScore` | Mapped | |
| `dppk:carbonFootprintBenchmarkPercentage` / `environmentalFootprintBenchmarkPercentage` | `eutex:benchmarkPerformance` | Partial | Both dppk keys collapse onto one `eutex:` property (carbon vs single-score benchmark are distinguished in dppk but not in `eutex:`). |
| `dppk:textileWeight` | `gs1:netWeight` | Mapped | |
| `dppk:weightExcludingTrims` | `eutex:weightExcludingTrims` | Mapped | Harvested. |
| `dppk:organicContentPercentage` / `organicContentMass` | `eutex:organicContentPercentage` / `eutex:organicContentMass` | Mapped | Harvested. |
| `dppk:animalOriginNonTextile` | `eutex:containsAnimalNonTextileParts` | Mapped | Harvested. |
| `dppk:euEcolabel` | `eutex:euEcolabel` | Mapped | Harvested. |
| `dppk:euDeclarationOfConformity` | `eutex:euDeclarationOfConformity` (→ `oec:DocumentReference`) | Mapped | Harvested. |
| `dppk:preConsumerRecycledContentPercentage` / `postConsumerRecycledContentPercentage` | `oec:preConsumerRecycledContent` / `oec:postConsumerRecycledContent` | Partial | 0–100 → 0–1 rescale. `eutex:` also offers richer `RecycledContentDeclaration`. |
| `dppk:textileSubstancesOfConcern` | `oec:substancesOfConcern` | Mapped | |
| `dppk:fibreComposition` | `gs1:textileMaterial` / `oec:MaterialComposition` | Partial | OpenEPCIS prefers the GS1 `TextileMaterialDetails` pattern. |
| `dppk:textileCareInstructions` | `eutex:careInstructions` | Partial | OpenEPCIS care model is ISO 3758 symbol-structured, not a free `RelatedResource`. |
| `dppk:textileRepairInstructions` / `textileSafeUseInstructions` / `textileEndOfLifeInstructions` | `eutex:repairGuideUrl` / `oec:safeUseInstructions` / `eutex:takeBackProgram` | Partial | Different document/structure shapes. |
| `dppk:pefcrCategory` | `eutex:apparelSubcategory` | Partial | PEFCR A&F category list vs JRC apparel subcategory list. |
| `dppk:spirality` / `dimensionalChange` / `visualInspection` | `eutex:spiralityPercentage` / `eutex:dimensionalChangePercentage` / `eutex:VisualInspectionResult` | Partial | OpenEPCIS carries the structured `RobustnessAssessment` sub-results. |

## Unmapped (theirs) — no OpenEPCIS counterpart yet

- `dppk:EUApparelSizeSystem` (apparel sizing reference) — candidate for a future `eutex:` enrichment or a GS1 size-code mapping.
- DPP Keystone 24-language `rdfs:label`/`comment` on every term — OpenEPCIS keeps English labels and relies on the GS1/EN 18223 multilingual `MultiLanguageValue` pattern where needed.

## Anchors in the ontologies

Every **Mapped** row above is backed by a graded SKOS mapping relation
(`skos:exactMatch` / `skos:closeMatch` / `skos:broadMatch`; `rdfs:seeAlso` for Structural rows) in the relevant
TTL: `extensions/common/core/ontology/dpp-core.ttl` (EPD, component fields),
`extensions/eu/iron-steel/ontology/iron-steel.ttl` (steel + MTC),
`extensions/eu/cpr/ontology/cpr.ttl` (DoP), and
`extensions/eu/textile/ontology/textile.ttl` (textile deltas).
