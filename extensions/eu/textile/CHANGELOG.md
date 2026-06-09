# Changelog

All notable changes to the Textile module will be documented in this file.

## 0.9.6 — version alignment (2026-06-07)

Version alignment with the 0.9.6 core release (EN 18223 model alignment). No functional changes to this module.

## 0.9.5 — SEMICeu Core Vocabularies anchoring (2026-05-04)

### Added
- `cv:` / `cccev:` / `locn:` prefix declarations in `textile.ttl`.
- `textile:RobustnessAssessment` → `rdfs:seeAlso cccev:Evidence` (EU SEMICeu CCCEV) — the assessment is evidence supporting the EU Preparatory Study robustness Requirement.
- Facility properties (`textile:spinningFacility`, `weavingFacility`, `dyeingFacility`, `cutAndSewFacility`, `finishingFacility`) inherit `locn:Location` anchoring via `dpp:FacilityInformation` (their range), updated in dpp-core in this same release.

### Notes
- See `extensions/common/interop/docs/SEMIC_CORE_VOCABULARIES.md` for the full mapping.

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `textile:LCIACategoryCode` owl:equivalentClass `schema:CategoryCode`
- `textile:TextileFootwear` owl:equivalentClass `gs1:Footwear`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `textile:LCIACategoryCode` owl:equivalentClass `schema:CategoryCode`
- `textile:TextileFootwear` owl:equivalentClass `gs1:Footwear`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `textile:LCIACategoryCode` owl:equivalentClass `schema:CategoryCode`
- `textile:TextileFootwear` owl:equivalentClass `gs1:Footwear`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `textile:LCIACategoryCode` owl:equivalentClass `schema:CategoryCode`
- `textile:TextileFootwear` owl:equivalentClass `gs1:Footwear`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Removed (use canonical term instead)

- `textile:chemicalName` → `schema:name`
- `textile:iupacName` → `schema:iupacName`
- `textile:recyclingInstructions` → `gs1:consumerRecyclingInstructions`
- `textile:targetGender` → `gs1:targetConsumerGender`
- `textile:textileCategory` → `schema:category`

### Added equivalence / cross-reference links

- `textile:LCIACategoryCode` owl:equivalentClass `schema:CategoryCode`
- `textile:TextileFootwear` owl:equivalentClass `gs1:Footwear`

## [0.9.5] - 2026-04-15 (GS1 Standards Week preparation)

### Added
- New example `examples/garment-set-itip.jsonld` demonstrating ITIP (AI 8026)
  piece-level identification for a two-piece business suit. Uses
  `dpp:IndividualTradeItemPiece` + `dpp:tradeItemPieceCount` from the core
  module. Reference pattern aligned with GS1 ITIP (AI 8026).

### Notes
- This textile module is offered as a reference implementation ahead of
  anticipated apparel DPP requirements (2027).
- Version remains v0.9.5; project has not yet had a formal release.

## [0.9.5] - 2026-03-07

### EU Preparatory Study on Textiles 3rd Milestone Compliance

Major expansion to align with the EU JRC Preparatory Study on Textiles 3rd Milestone (December 2025), defining concrete data requirements for textile Digital Product Passports under ESPR 2024/1781.

**New Classes (12):**
- `RobustnessAssessment` - 0-10 composite robustness score container
- `SpiralityTestResult` - Spirality test per ISO 16322-3
- `DimensionalChangeTestResult` - Dimensional change test per ISO 3759
- `VisualInspectionResult` - Visual inspection per ISO 15487
- `RecyclabilityAssessment` - 0-10 recyclability score container
- `SortingFactors` - Recyclability sorting factor assessment
- `TechnicalRecyclability` - Technical recyclability assessment
- `RecycledContentDeclaration` - Structured recycled content with chain of custody
- `EnvironmentalFootprint` - PEF/PEFCR-based environmental reporting
- `LCIACategory` - Individual LCIA impact category results
- `SubstanceOfConcern` - 4-type SoC per ESPR Article 7(5)

**New Enumerations (11):**
- `FabricType` - Knitted, Denim, WovenNonDenim
- `ApparelSubcategory` - 10 apparel subcategories (TShirts, JacketsCoats, etc.)
- `RecyclingTechnology` - 5 recycling technologies
- `WasteOriginType` - PostConsumer, PostIndustrial
- `RecycledSourceType` - FiberToFiber, OpenLoop
- `ChainOfCustodyMethod` - MassBalance, Segregation, IdentityPreserved, Certified
- `FootprintDataType` - PrimaryData, SecondaryData, MixedData
- `LCIACategoryCode` - GWP, WaterUse, Eutrophication, Acidification, Ecotoxicity, HumanToxicity
- `SubstanceOfConcernType` - SoCTypeA (SVHC), SoCTypeB (CLP), SoCTypeC (POPs), SoCTypeD (Recycling)
- `CLPHazardCategory` - CMR, EndocrineDisruptor, PMT, Sensitizer, AquaticToxicity
- `TestStandard` - ISO 6330, ISO 16322-3, ISO 3759, ISO 15487, ISO 105, ISO 12945, ISO 12947

**New Properties (~60):**
- Robustness: robustnessScore, spiralityTest, dimensionalChangeTest, visualInspection, sub-ratings
- Recyclability: recyclabilityScore, elastaneContentPercent, sortingFactors, technicalRecyclability
- Recycled Content: secondaryMaterialFraction, wasteOriginType, recycledSourceType, chainOfCustodyMethod
- Environmental: carbonFootprintManufacturing, pefSingleScore, benchmarkPerformance, lciaCategories
- SoC: socType, iupacName, casNumber, ecNumber, substanceConcentration, locationInProduct, clpHazardCategory
- Test Standards: testStandard

**Deprecations:**
- `textile:isRecycledFiber` - Use `textile:recycledContentDeclaration` instead
- `textile:recycledContentSource` - Use `textile:recycledContentDeclaration` instead
- `textile:textileChemicals` - Use `textile:substancesOfConcern` instead

**New EPCIS Events (7):**
- Commissioning at cut-and-sew facility
- Transformation: fiber to yarn (spinning)
- Transformation: yarn to fabric (weaving)
- Transformation: fabric to garment (assembly)
- Observation: robustness score reporting
- Observation: substance of concern test results
- Observation: PEF/carbon footprint reporting

**New Files:**
- `textile/context/textile-context-pefcr-bridge.jsonld` - PEFCR bridge context
- `textile/docs/IMPLEMENTATION_GUIDE.md` - Full implementation guide
- `textile/docs/ROBUSTNESS_SCORING.md` - Robustness scoring methodology
- `textile/docs/RECYCLABILITY_SCORING.md` - Recyclability scoring methodology

**Updated Files:**
- `textile/ontology/textile.ttl` - ~1100 new lines of TTL
- `textile/context/textile-context.jsonld` - All new terms added
- `textile/validation/textile-shapes.ttl` - New SHACL shapes with score constraints
- `textile/validation/textile-schema.json` - New JSON Schema definitions
- `textile/examples/garment-product.jsonld` - Added robustness, recyclability, recycled content, footprint, SoC
- `textile/examples/footwear-product.jsonld` - Added robustness, recyclability, recycled content, footprint

## [0.9.5] - 2025-02-02

### Initial Release

OpenEPCIS DPP-Ready v0.9.5 - First official public release.

**Standards Alignment:**
- GS1 Web Vocabulary (native foundation)
- UN Transparency Protocol (UNTP) alignment
- EU Strategy for Sustainable and Circular Textiles (COM/2022/141)
- EU ESPR 2024/1781
- EU Textile Labelling Regulation 1007/2011
- ISO 3758:2023 (Care labelling)
- ZDHC Manufacturing Restricted Substances List (MRSL)

**Key Classes:**
- `TextileProduct` - Base class for textiles (extends gs1:Product)
- `FiberComposition` - Detailed fiber composition with traceability
- `CareInstruction` - ISO 3758 care symbol support
- `DurabilityInfo` - Wash cycles, pilling, color fastness metrics
- `TextileChemical` - Chemical tracking (ZDHC MRSL, REACH)
- `RepairService` - Repair service information
- `TakeBackProgram` - End-of-life take-back data
- `MicroplasticInfo` - Microfiber shedding information

**Key Enumerations:**
- `TextileCategory` - Apparel, Footwear, HomeTextiles, TechnicalTextiles
- `FiberType` - 20 fiber types including recycled/organic variants
- `CareSymbolCode` - 30+ ISO 3758 care symbols
- `MicroplasticRiskLevel` - Low, Medium, High shedding risk
- `DurabilityClass` - A-E durability rating
- `TextileCertification` - GOTS, OEKO-TEX, GRS, RCS, bluesign, LWG

**Key Properties:**
- Fiber composition with recycled content tracking
- Care instructions with full ISO 3758 symbols
- Durability metrics (expected wash cycles, pilling, color fastness)
- Microplastic shedding information
- Supply chain facility tracking (spinning, weaving, dyeing, cut & sew)
- PFAS-free declarations
