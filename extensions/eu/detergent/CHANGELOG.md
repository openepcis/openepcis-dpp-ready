# Changelog

All notable changes to the Detergent module will be documented in this file.

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
