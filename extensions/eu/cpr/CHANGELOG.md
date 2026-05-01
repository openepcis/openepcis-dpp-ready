# Changelog

All notable changes to the CPR module will be documented in this file.

## [0.1.0] - 2026-05-01

### Initial Release

OpenEPCIS CPR module v0.1.0 — first DPP-aligned vocabulary for the
revised EU Construction Products Regulation (Regulation 2024/3110), in
force from 7 January 2025; DPP carriage of the Declaration of
Performance / Declaration of Conformity is mandatory per delegated acts
phased in 2026 onward.

This module is intentionally thin in line with the project's four-layer
delegation pattern. The construction-specific concepts live in `cpr:`;
everything else (recycled content, hazardous substances, EPR, carbon
footprint, end-of-life, due diligence) reuses lifted `dpp:` cross-cutting
vocabulary plus `untp:` and `gs1:`.

**Classes:**
- `cpr:ConstructionProduct` — `subClassOf gs1:Product`. Carrier of CPR data.

**Enumerations:**
- `cpr:ReactionToFireClass` — A1 / A2 / B / C / D / E / F per EN 13501-1.
  Highest reaction-to-fire performance is A1 (non-combustible); F means
  no performance determined.
- `cpr:ConstructionProductType` — top-level family per CPR Annex III
  (Cement, Aggregates, Insulation, Window, Door, Membrane, etc.).

**Properties:**
- `cpr:declarationOfPerformanceUrl` — URL of the DoP / DoC PDF (Article 12).
- `cpr:essentialCharacteristic` — declared essential-characteristic value
  per Annex III (set-valued; structured EssentialCharacteristic class).
- `cpr:reactionToFireClass` — links a product to its fire class.
- `cpr:constructionProductType` — top-level CPR product family.

**Standards Alignment:**
- EU Regulation 2024/3110 (Revised CPR)
- EN 13501-1 (Reaction to fire classification)
- ESPR 2024/1781 (sustainability requirements via delegated acts)

**Reuses (no new vocabulary):**
- Recycled content → `dpp:RecycledContent`
- Hazardous substances → `dpp:HazardousSubstance`
- Carbon footprint → `dpp:CarbonFootprintDeclaration`
- Recyclability → `dpp:RecyclabilityAssessment`
- EPR (where applicable) → `dpp:ExtendedProducerResponsibility`
- End-of-life take-back → `dpp:EndOfLifeProgram`
- Production site → `gs1:Place` / `gs1:GeoShape`
- Declaration of Performance (regulatory ID) → `gs1:regulatoryInformation`
  + `gs1:regulatoryIdentifier` (the structured DoP reference) and/or
  `untp:ConformityAttestation`
