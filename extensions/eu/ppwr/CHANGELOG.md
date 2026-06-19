# Changelog

All notable changes to the PPWR module will be documented in this file.

## [0.9.7] — 2026-06-19

### Changed
- Renamed vocabulary prefix `ppwr:` → `euppwr:` (alias only; namespace IRIs unchanged).
- Completed term governance: 100% `dcterms:source` + `skos:note` coverage.
- Tightened SHACL (nodeKind / messages on Packaging).

## [0.1.0] - 2026-05-01

### Initial Release

OpenEPCIS PPWR module v0.1.0 — first DPP-aligned vocabulary for the EU
Packaging and Packaging Waste Regulation (Regulation 2025/40), in force
since January 2025; mandatory labelling requirements apply from August 2025
and digital marking expands per the staged dates in Article 13.

This module is intentionally thin — almost every piece of data PPWR
requires is already covered by the lifted cross-cutting `oec:` terms
shipped in dpp-core 0.9.6 (ExtendedProducerResponsibility, Compostability,
Biodegradability, DepositReturnScheme, bioBasedFraction, plus the existing
RecycledContent / HazardousSubstance / RegulationCompliance patterns).
Only the genuinely packaging-specific concepts live here:

**Classes:**
- `euppwr:Packaging` — `subClassOf gs1:Packaging`. The carrier of all PPWR data.

**Enumerations:**
- `euppwr:PackagingTier` — Sales / Grouped / Transport (Article 3 definitions).
- `euppwr:RecyclabilityGrade` — A / B / C grades (Article 4, Annex II); A is
  highest performance, C is lowest. Grade B is the minimum from January 2038.

**Properties:**
- `euppwr:packagingTier` (range PackagingTier).
- `euppwr:recyclabilityGrade` (range RecyclabilityGrade) — companion to
  `oec:recyclabilityScore` / `oec:recyclabilityRate` for grade-style
  regulation expressions.
- `euppwr:harmonisedSymbol` — URI of the PPWR Annex IX symbol code.

**Standards Alignment:**
- EU Regulation 2025/40 (Packaging and Packaging Waste)
- ESPR 2024/1781 (Ecodesign for Sustainable Products) — packaging is a
  priority product category.
- Single-Use Plastics Directive 2019/904 (substances overlap; covered via
  `oec:HazardousSubstance`).

**Reuses (no new vocabulary):**
- Recyclable / recycled content → `oec:RecycledContent`, `oec:recyclableContent`
- Reusability / reuse status → `untp:ProductStatus` enum
- Compostability → `oec:Compostability` + `oec:compostabilityStandard`
- Bio-based content → `oec:bioBasedFraction`
- Hazardous substances (PFAS, heavy metals — Article 5) → `oec:HazardousSubstance`
- EPR (Article 13) → `oec:ExtendedProducerResponsibility`
- Deposit-return scheme (Article 13) → `oec:DepositReturnScheme`
- Production site / origin → `untp:Facility` / `gs1:Place` / `gs1:GeoShape`
- Declaration of conformity (Article 15–17) → `gs1:regulatoryInformation` +
  `gs1:regulatoryIdentifier` + `untp:ConformityAttestation`
