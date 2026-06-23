# Changelog

All notable changes to the CPR module will be documented in this file.

## [0.9.7] — 2026-06-19

### Added
- Structured Declaration of Performance, harvested from / aligned with the DPP Keystone CPR profile: `eucpr:DeclarationOfPerformance` (`skos:exactMatch dppk:DeclarationOfPerformance`, `rdfs:seeAlso dppk:DoPCBlock`) + `eucpr:declarationOfPerformance` link, with `eucpr:declarationCode` and `eucpr:dateOfIssue`. Complements the existing `eucpr:declarationOfPerformanceUrl` (document link).
- `eucpr:AVCPSystem` enumeration (1+, 1, 2+, 3, 4 per CPR Annex V) + `eucpr:avcpSystem` (`skos:closeMatch dppk:avsSystem`).
- Assessment bodies and supporting documents on the DoP, reusing core: `eucpr:notifiedBody` / `eucpr:technicalAssessmentBody` (→ `oec:OperatorInformation`), `eucpr:europeanAssessmentDocument` / `eucpr:validationReports` (→ `oec:DocumentReference`).
- Convenience named essential characteristics `eucpr:thermalConductivity` and `eucpr:compressiveStrength` (`gs1:QuantitativeValue`), anchored `skos:exactMatch` to `dppk:thermalConductivity` / `dppk:compressiveStrength`.
- `dppk:` prefix for SKOS mapping anchors to the DPP Keystone peer profile.

### Changed
- Renamed vocabulary prefix `cpr:` → `eucpr:` (alias only; namespace IRIs unchanged).
- Completed term governance: 100% `dcterms:source` + `skos:note` coverage.
- Tightened SHACL: the Declaration-of-Performance `essentialCharacteristic` chain is now validated.

## [0.1.0] - 2026-05-01

### Initial Release

OpenEPCIS CPR module v0.1.0 — first DPP-aligned vocabulary for the
revised EU Construction Products Regulation (Regulation 2024/3110), in
force from 7 January 2025; DPP carriage of the Declaration of
Performance / Declaration of Conformity is mandatory per delegated acts
phased in 2026 onward.

This module is intentionally thin in line with the project's four-layer
delegation pattern. The construction-specific concepts live in `eucpr:`;
everything else (recycled content, hazardous substances, EPR, carbon
footprint, end-of-life, due diligence) reuses lifted `oec:` cross-cutting
vocabulary plus `untp:` and `gs1:`.

**Classes:**
- `eucpr:ConstructionProduct` — `subClassOf gs1:Product`. Carrier of CPR data.

**Enumerations:**
- `eucpr:ReactionToFireClass` — A1 / A2 / B / C / D / E / F per EN 13501-1.
  Highest reaction-to-fire performance is A1 (non-combustible); F means
  no performance determined.
- `eucpr:ConstructionProductType` — top-level family per CPR Annex III
  (Cement, Aggregates, Insulation, Window, Door, Membrane, etc.).

**Properties:**
- `eucpr:declarationOfPerformanceUrl` — URL of the DoP / DoC PDF (Article 12).
- `eucpr:essentialCharacteristic` — declared essential-characteristic value
  per Annex III (set-valued; structured EssentialCharacteristic class).
- `eucpr:reactionToFireClass` — links a product to its fire class.
- `eucpr:constructionProductType` — top-level CPR product family.

**Standards Alignment:**
- EU Regulation 2024/3110 (Revised CPR)
- EN 13501-1 (Reaction to fire classification)
- ESPR 2024/1781 (sustainability requirements via delegated acts)

**Reuses (no new vocabulary):**
- Recycled content → `oec:RecycledContent`
- Hazardous substances → `oec:HazardousSubstance`
- Carbon footprint → `oec:CarbonFootprintDeclaration`
- Recyclability → `oec:RecyclabilityAssessment`
- EPR (where applicable) → `oec:ExtendedProducerResponsibility`
- End-of-life take-back → `oec:EndOfLifeProgram`
- Production site → `gs1:Place` / `gs1:GeoShape`
- Declaration of Performance (regulatory ID) → `gs1:regulatoryInformation`
  + `gs1:regulatoryIdentifier` (the structured DoP reference) and/or
  `untp:ConformityAttestation`
