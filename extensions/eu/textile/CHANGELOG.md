# Changelog

All notable changes to the Textile module will be documented in this file.

## [Unreleased]

### Shape corrections

Running the shapes for the first time surfaced a duplicate and several constraints that
contradicted the corpus:

- **`eutex:hasTakeBackProgram` was constrained twice**, once as `sh:class
  eutex:TakeBackProgram` and once as `sh:datatype xsd:boolean` — a leftover of the `has*`
  rename, since the same property cannot be both. The boolean block now points at
  `eutex:takeBackProgramAvailable`, which is the flag it was meant for.
- `gs1:targetConsumerGender` expected `xsd:string` although the value is a GS1 code-list IRI;
  now `sh:nodeKind sh:IRI`.
- `schema:category` required a `eutex:TextileCategory` code with `sh:maxCount 1`, but
  schema.org ranges it over Text *or* Thing and the corpus uses both — and three localized
  category names are three values, not one. Now accepts either a code or translatable text,
  with no maximum.
- `gs1:consumerRecyclingInstructions`, `eutex:additionalCareInstructions`,
  `eutex:microplasticMitigationMeasures`, `eutex:takeBackIncentive`,
  `eutex:endOfLifeDestination` and the `schema:name` obligations accept language-tagged text
  via `dpp-sh:TranslatableText`.

### `garment-set-itip.jsonld`: no apparel subcategory

The example declared `"eutex:hasApparelSubcategory": "Suits"` — a bare string where an IRI
belongs, and not a member of the code list in any case. `eutex:ApparelSubcategory` is a closed
`owl:oneOf` aligned to `dppk:PefcrApparelAccessories` with no member for a multi-piece suit
set, so the value was removed rather than invented; adding a member is an
[EXTENSION-GOVERNANCE](../../../EXTENSION-GOVERNANCE.md) decision. The reason is recorded in
the example.

### Context coercions corrected

`eutex:takeBackUrl`, `eutex:repairGuideUrl` and `eutex:sparePartsUrl` are
`owl:DatatypeProperty` with `rdfs:range xsd:anyURI` but were coerced to `"@type": "@id"`, so
they serialized as IRI nodes rather than literals; they now coerce `xsd:anyURI`.

### Changed
- **`eutex:locationInProduct` replaced by `oec:substanceLocation`.** The EUDPP grading
  round exposed the duplication: both terms carried `skos:exactMatch` onto the same
  `eudpp:substanceLocation`, and the definitions are byte-equivalent in intent (free-text
  location of a substance of concern in the product). Per the layering rule the module
  term moves down to core: examples, EPCIS events, SHACL shape and schemas now use
  `oec:substanceLocation`; its unique `gs1:locationDescription` anchor migrated to the
  core term. `eutex:SubstanceOfConcern` additionally gains
  `rdfs:subClassOf oec:SubstanceOfConcern` (it is defined as the ESPR Art. 7(5) SoC), so
  the core property's domain fits by entailment.

### Added
- **`examples/eudpp-textile-passport.jsonld`** — model-level reference passport in the
  CIRPASS-2 / EUDPP shape carried by GS1 Digital Link: `01/{GTIN}` passport IRI,
  `417`/`414` GLN party/facility IRIs, TARIC (`oec:customsCommodityCode`), GS1-native
  care-label composition, typed EU DoC, and passport metadata incl. the ESPR
  Art. 10(4) backup host (`oec:hasBackupCopyHost` as `oec:OperatorInformation`).
  Companion to the interop MVP-textile gap analysis
  ([`../../common/interop/docs/MVP_TEXTILE_MAPPING.md`](../../common/interop/docs/MVP_TEXTILE_MAPPING.md)):
  the same field domain, done right.

### Changed: object properties adopt the `has*` naming convention

49 textile object properties follow the project-wide rename. The rename surfaced a
latent collision: `eutex:takeBackProgram` (the programme node) and the boolean
`eutex:hasTakeBackProgram` would have merged, so the boolean is now
`eutex:takeBackProgramAvailable` and the node property carries the conventional
`eutex:hasTakeBackProgram`. Contexts, examples, shapes and schemas follow.

### Added: CIRPASS-2 microplastic pointers

`eutex:MicroplasticInfo` now points at the EUDPP P_DPP classes
`cirpass2:MicroplasticRelease` and `cirpass2:NanoplasticRelease`, with a note recording
the governance move-down criterion (the concept graduates to `oec:` once a second
regulation module needs it).

## [0.9.8] - 2026-07-29

### Fixed: mapping directions settled against the layering and the upstream definitions

Assertions that claimed a module term is broader than the `oec:` common-core term it specialises now
read `skos:broadMatch`, or `rdfs:seeAlso` where the relation is component-to-whole rather than a
subsumption. Core is Layer 3 and this module Layer 4, so the module term is the narrower one by
construction, and `check:mappings` rule 10 enforces it. Project-wide this settled 91 directions; see
the [root changelog](../../../CHANGELOG.md).

### Fixed: 2 graded mappings onto a serialisation slot

`eutex:lciaValue` under `gs1:value` and `schema:value`. A value slot denotes no concept, so the
pointer is `rdfs:seeAlso`; the `schema:value` line was a duplicate of one and is gone.
`check:mappings` rule 8 covers the pattern; see the [root changelog](../../../CHANGELOG.md).

### Fixed: 3 value spaces no longer mapped onto the class of things they classify

A closed list of codes and the class of things those codes classify sit at different levels, so no graded SKOS relation between them holds in either direction. `eutex:ApparelSubcategory` (to `dppk:PefcrApparelAccessories`), `eutex:SubstanceOfConcernType` (to `schema:Substance`) and `eutex:TestStandard` (to `untp:Standard`) now use `rdfs:seeAlso`.

`check:mappings` rule 7 covers the pattern and runs before the direction rule, since at different levels the question of which term is narrower does not arise. Project-wide this corrected 31 assertions across eight modules; see the [root changelog](../../../CHANGELOG.md).

### Changed: mapping directions and anchors from the vocab-sync audit

A `vocab-sync audit --module textile` run (371 findings, 139 QA-confirmed) produced 30 applied
changes: 10 directions corrected and 19 anchors added, plus one no-op. The corrections give
`eutex:weightExcludingTrims`, `eutex:chemicalPurpose`, `eutex:TakeBackProgram`,
`eutex:fiberCertification`, `eutex:sparePartsUrl` and both assessment-result classes
`skos:broadMatch` toward their schema.org and GS1 heads, and turn `eutex:TextileApparel` into
the broader term against `dppk:PefcrShirtsAndBlouses`. The additions anchor the facility
properties (`eutex:dyeingFacility`, `eutex:weavingFacility`) into UNTP, DPP Keystone and the
BatteryPass manufacturing place, and give `eutex:TextileProduct` its `schema:Product` and
`dppk:Product` parents.

Six panel-confirmed proposals were refused, each on documented evidence rather than taste, and
all six are recorded in `scripts/skos-deferred.json`:

- `eutex:substanceConcentration` to `gs1:juiceContentPercent`. The GS1 term is domained on
  `FoodBeverageTobaccoProduct`, which `check:mappings` rule 1 already rejects, so the apply
  would have failed the build. The triage now mirrors the guard's GS1 foreign-domain list.
- `eutex:seasonCollection` to `gs1:seasonCalendarYear` and `gs1:seasonName`. Both directions
  are recorded decisions: a collection designation such as SS24 carries the season and its
  year, so it aggregates them. The allowlist that documents this moved to
  `scripts/mapping-allowlist.json`, which the triage now reads, so a panel can no longer
  propose reversing a recorded decision.
- `eutex:benchmarkPerformance` to `dppk:environmentalFootprintBenchmarkPercentage` as
  `skos:exactMatch`. `DPP_KEYSTONE_MAPPING.md` records the pair as Partial: our property
  collapses both the environmental and the carbon benchmark percentage, a distinction DPP
  Keystone makes.
- Four instruction mappings on `eutex:additionalCareInstructions`, a free-text overflow field.
  Claiming it is broader than repair, safe-use, disassembly and storage instructions
  over-claims, and the panel contradicted itself by rejecting `dppk:safeUseInstructions` at
  0.97 while accepting `dppk:textileSafeUseInstructions` at 0.85.

### Fixed: 41 inverted SKOS mapping directions

SKOS reads `A skos:narrowMatch B` as "B is narrower than A". 41 mappings in this module
used `narrowMatch` while pointing at a general foundational term, so they asserted the
reverse of their intent, for example claiming `schema:identifier` was narrower than a
specific passport identifier. They now read `skos:broadMatch`, the project convention for
"this term is narrower than the target". The sweep covered 174 assertions across eight
modules; `check:mappings` rule 6 now rejects the pattern against a curated list of general
Layer-1 terms, and pairs where our term is a type or category while the target denotes the
entity itself are allowlisted for a curator instead (see
[`docs/skos-alignment/OPEN_DECISIONS.md`](../../../docs/skos-alignment/OPEN_DECISIONS.md)).

### Added
- `eutex:TextileProduct`: the module base class (`rdfs:subClassOf gs1:Product`) that the README, the JSON Schema and `eutex:TextileProductShape` all referred to without a TTL definition. `eutex:TextileApparel` and `eutex:TextileFootwear` are now its subclasses, so the product shape reaches both wearable slices as well as HomeTextiles and TechnicalTextiles, which `gs1:WearableProduct` does not cover.

### Changed
- `textile-shapes.ttl` repointed at the terms the ontology actually defines. Fibre composition follows the GS1-native model the examples use: `gs1:textileMaterial` → `gs1:TextileMaterialDetails` with `gs1:textileMaterialDescription` / `gs1:textileMaterialPercentage` (was `eutex:fiberComposition` / `FiberComposition` / `fiberType` / `fiberPercentage`). Repair services validate as `gs1:Organization` and textile chemicals as `oec:HazardousSubstance`, matching the declared ranges of `eutex:repairServices` and `eutex:textileChemicals`; both shapes now target via `sh:targetObjectsOf` so they apply to textile entries only. CAS numbers use the shared `oec:casNumber` (the module-local alias was removed in an earlier pass).
- The four product seeds (`garment-product`, `footwear-product`, `organic-tee-product`, `fjordline-aurora-batch`) express recycled content through `oec:recycledContentDetails` → `oec:recycledContent` / `preConsumerRecycledContent` / `postConsumerRecycledContent` as decimal fractions from 0 to 1 per those properties' declared range, and the carbon-footprint functional unit through `oec:declaredUnit`.

## [0.9.7] — 2026-06-19

### Added
- DPP Keystone ESPR harvest (PART 18): delta terms the existing model did not cover, each anchored `skos:exactMatch` to its `dppk:` counterpart — `eutex:organicContentPercentage` / `organicContentMass` (Regulation (EU) 2018/848), `eutex:containsAnimalNonTextileParts` (Regulation (EU) 1007/2011 Art. 12), `eutex:euEcolabel` (Regulation (EC) 66/2010), `eutex:euDeclarationOfConformity` (→ `oec:DocumentReference`), `eutex:weightExcludingTrims` (complements `gs1:netWeight`), and the discrete PEF performance classes `eutex:carbonFootprintClass` / `eutex:environmentalFootprintClass` (complementing the existing `eutex:pefSingleScore`, `eutex:carbonFootprintManufacturing`, and `eutex:benchmarkPerformance`).
- `dppk:` prefix for SKOS mapping anchors to the DPP Keystone peer profile. Recycled-content detail, PEF single score, and the LCIA breakdown were already present and were not re-minted.

### Changed
- Renamed vocabulary prefix `textile:` → `eutex:` (alias only; namespace IRIs unchanged).
- Completed term governance: 100% `dcterms:source` + `skos:note` coverage.
- Added `owl:imports` for the SEMICeu Core Vocabularies; cross-layer `rdfs:seeAlso` anchors to `oec:`.

## 0.9.6 — version alignment (2026-06-07)

Version alignment with the 0.9.6 core release (EN 18223 model alignment). No functional changes to this module.

## 0.9.5 — SEMICeu Core Vocabularies anchoring (2026-05-04)

### Added
- `cv:` / `cccev:` / `locn:` prefix declarations in `textile.ttl`.
- `eutex:RobustnessAssessment` → `rdfs:seeAlso cccev:Evidence` (EU SEMICeu CCCEV) — the assessment is evidence supporting the EU Preparatory Study robustness Requirement.
- Facility properties (`eutex:spinningFacility`, `weavingFacility`, `dyeingFacility`, `cutAndSewFacility`, `finishingFacility`) inherit `locn:Location` anchoring via `oec:FacilityInformation` (their range), updated in dpp-core in this same release.

### Notes
- See `extensions/common/interop/docs/SEMIC_CORE_VOCABULARIES.md` for the full mapping.

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `eutex:LCIACategoryCode` owl:equivalentClass `schema:CategoryCode`
- `eutex:TextileFootwear` owl:equivalentClass `gs1:Footwear`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `eutex:LCIACategoryCode` owl:equivalentClass `schema:CategoryCode`
- `eutex:TextileFootwear` owl:equivalentClass `gs1:Footwear`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `eutex:LCIACategoryCode` owl:equivalentClass `schema:CategoryCode`
- `eutex:TextileFootwear` owl:equivalentClass `gs1:Footwear`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `eutex:LCIACategoryCode` owl:equivalentClass `schema:CategoryCode`
- `eutex:TextileFootwear` owl:equivalentClass `gs1:Footwear`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Removed (use canonical term instead)

- `eutex:chemicalName` → `schema:name`
- `eutex:iupacName` → `schema:iupacName`
- `eutex:recyclingInstructions` → `gs1:consumerRecyclingInstructions`
- `eutex:targetGender` → `gs1:targetConsumerGender`
- `eutex:textileCategory` → `schema:category`

### Added equivalence / cross-reference links

- `eutex:LCIACategoryCode` owl:equivalentClass `schema:CategoryCode`
- `eutex:TextileFootwear` owl:equivalentClass `gs1:Footwear`

## [0.9.5] - 2026-04-15 (GS1 Standards Week preparation)

### Added
- New example `examples/garment-set-itip.jsonld` demonstrating ITIP (AI 8026)
  piece-level identification for a two-piece business suit. Uses
  `oec:IndividualTradeItemPiece` + `oec:tradeItemPieceCount` from the core
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
- `eutex:isRecycledFiber` - Use `eutex:recycledContentDeclaration` instead
- `eutex:recycledContentSource` - Use `eutex:recycledContentDeclaration` instead
- `eutex:textileChemicals` - Use `eutex:substancesOfConcern` instead

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
