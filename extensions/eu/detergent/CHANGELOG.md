# Changelog

All notable changes to the Detergent module will be documented in this file.

## [Unreleased]

### Changed: schema descriptions cite the regulation

`validation/detergent-schema.json` now carries a regulation-referenced
`description` for the five passport-template headline data points (ingredient list, fragrance allergens, pictograms, signal word, dosage)
— the same clause source the PPWR schema already provides. Downstream
requirement profiles (DDM passport templates) quote these instead of a
generic placeholder.

### `eudet:biodegradationPercentage` anchored to the core

Declared `rdfs:subPropertyOf oec:biodegradationPercentage`. `eudet:SurfactantBiodegradability`
is a `rdfs:subClassOf oec:Biodegradability`, so its instances are subject to
`dpp-sh:BiodegradabilityShape`, which requires the core property; the ranges match
(`xsd:decimal`), so the specialisation is a true subproperty and a declared surfactant
percentage now satisfies the cross-cutting obligation.

### Shape corrections

`eudet:dosageInstructions` and the three `schema:name` obligations accept language-tagged text
via `dpp-sh:TranslatableText`, which a bare `sh:datatype xsd:string` had rejected.

## [0.9.8] - 2026-07-29

### Fixed: mapping directions settled against the layering and the upstream definitions

Assertions that claimed a module term is broader than the `oec:` common-core term it specialises now
read `skos:broadMatch`, or `rdfs:seeAlso` where the relation is component-to-whole rather than a
subsumption. Core is Layer 3 and this module Layer 4, so the module term is the narrower one by
construction, and `check:mappings` rule 10 enforces it. Project-wide this settled 91 directions; see
the [root changelog](../../../CHANGELOG.md).

### Fixed: 3 value spaces no longer mapped onto the class of things they classify

A closed list of codes and the class of things those codes classify sit at different levels, so no graded SKOS relation between them holds in either direction. `eudet:ProductForm` (to `gs1:Product`), `eudet:SurfactantType` (to `schema:ChemicalSubstance`) and `eudet:BiodegradabilityTestMethod` (to `cv:Criterion`) now use `rdfs:seeAlso`.

`eudet:DetergentCategory` needed no change: its `skos:broadMatch schema:CategoryCode` is the pattern the rest now follow, a value space anchored to a value space.

`check:mappings` rule 7 covers the pattern and runs before the direction rule, since at different levels the question of which term is narrower does not arise. Project-wide this corrected 31 assertions across eight modules; see the [root changelog](../../../CHANGELOG.md).

### Changed: mapping directions and anchors from the vocab-sync audit

A `vocab-sync audit --module detergent` run (82 findings, 31 QA-confirmed) corrected three
directions and added two anchors. `eudet:DetergentProduct` is narrower than `untp:Product` and
`eudet:ingredientList` narrower than `gs1:ingredientStatement`, so both now read
`skos:broadMatch`; `eudet:hazardousSubstances` is the broader term against the BatteryPass
`hazardousSubstanceClass` and `hazardousSubstanceIdentifier`, so it takes `skos:narrowMatch`
toward both. The `check:mappings` allowlist entry that documents the food-ingredient analogue was
re-keyed to the corrected relation.

The panel also proposed `eudet:productForm skos:broadMatch gs1:consumerProductVariant`, which was
applied and then withdrawn on the GS1 definition: GS1 scopes `consumerProductVariant` to variants
that do *not* require a different GTIN, and liquid, powder and tablet are separate trade items.
`skos:closeMatch gs1:productFormDescription` remains the GS1 anchor. The pair is recorded in
`scripts/skos-deferred.json`.

Further confirmed findings wait for a curator in
[`docs/skos-alignment/OPEN_DECISIONS.md`](../../../docs/skos-alignment/OPEN_DECISIONS.md), most
of them asking whether an enumeration such as `eudet:ProductForm` or `eudet:DetergentCategory`
may be mapped onto a class that denotes the product itself.

### Fixed: 8 inverted SKOS mapping directions

SKOS reads `A skos:narrowMatch B` as "B is narrower than A". 8 mappings in this module
used `narrowMatch` while pointing at a general foundational term, so they asserted the
reverse of their intent, for example claiming `schema:identifier` was narrower than a
specific passport identifier. They now read `skos:broadMatch`, the project convention for
"this term is narrower than the target". The sweep covered 174 assertions across eight
modules; `check:mappings` rule 6 now rejects the pattern against a curated list of general
Layer-1 terms, and pairs where our term is a type or category while the target denotes the
entity itself are allowlisted for a curator instead (see
[`docs/skos-alignment/OPEN_DECISIONS.md`](../../../docs/skos-alignment/OPEN_DECISIONS.md)).

## [0.9.7] — 2026-06-19

### Changed
- Renamed vocabulary prefix `detergent:` → `eudet:` (alias only; namespace IRIs unchanged).
- Completed term governance: 100% `dcterms:source` + `skos:note` coverage.

## 0.9.6 — version alignment (2026-06-07)

Version alignment with the 0.9.6 core release (EN 18223 model alignment). No functional changes to this module.

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Removed (use canonical term instead)

- `eudet:allergenName` → `schema:name` (allergen display name; gs1:allergenSpecificationName is food-scoped and names the spec standard, not the allergen)
- `eudet:detergentCategory` → `schema:category`
- `eudet:inciName` → `schema:name`
- `eudet:speciesName` → `schema:name`

## [0.9.5] - 2026-03-12

### Initial Release

OpenEPCIS DPP-Ready v0.9.5 - First official public release.

**Standards Alignment:**
- GS1 Web Vocabulary (native foundation)
- EU Regulation 2026/405 on Detergents and Surfactants
- ESPR 2024/1781 (Detergents as priority product category)
- CLP Regulation 1272/2008 (hazard classification)

**Key Classes:**
- `DetergentProduct` - Top-level product class (subclass of gs1:Product)
- `Ingredient` - INCI ingredient entry with function and weight range
- `SurfactantBiodegradability` - Annex III test results
- `MicroorganismInfo` - Article 19 microorganism disclosure
- `FragranceAllergen` - Allergen disclosure with CAS and concentration

**Key Enumerations:**
- `DetergentCategory` - LaundryDetergent, DishwasherDetergent, AllPurposeCleaner, etc.
- `ProductForm` - Liquid, Powder, Gel, Capsule, Tablet, Sheet, Paste, Spray
- `SurfactantType` - Anionic, NonIonic, Cationic, Amphoteric
- `BiodegradabilityTestMethod` - ISO14593, OECD301B/D/F, OECD310
- `IngredientFunction` - SurfactantFunction, Builder, Bleach, Enzyme, etc.
- `SignalWord` - Danger, Warning

**DPP Model:**
- Model-based DPP (same manufacturer + identical formulation = one DPP)
- Full INCI ingredient list with prescribed weight percentage brackets
- Surfactant biodegradability per Annex III
- CLP hazard classification (pictograms, H/P statements, signal word)
- Phosphorus/phosphate compliance
- Film biodegradability for capsule/pod formats
- Fragrance allergen disclosure
- Microorganism disclosure per Article 19

**EPCIS Event Patterns:**
- Product model commissioning
