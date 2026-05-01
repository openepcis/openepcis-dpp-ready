# Changelog

All notable changes to the PPWR module will be documented in this file.

## [0.1.0] - 2026-05-01

### Initial Release

OpenEPCIS PPWR module v0.1.0 — first DPP-aligned vocabulary for the EU
Packaging and Packaging Waste Regulation (Regulation 2025/40), in force
since January 2025; mandatory labelling requirements apply from August 2025
and digital marking expands per the staged dates in Article 13.

This module is intentionally thin — almost every piece of data PPWR
requires is already covered by the lifted cross-cutting `dpp:` terms
shipped in dpp-core 0.9.6 (ExtendedProducerResponsibility, Compostability,
Biodegradability, DepositReturnScheme, bioBasedFraction, plus the existing
RecycledContent / HazardousSubstance / RegulationCompliance patterns).
Only the genuinely packaging-specific concepts live here:

**Classes:**
- `ppwr:Packaging` — `subClassOf gs1:Packaging`. The carrier of all PPWR data.

**Enumerations:**
- `ppwr:PackagingTier` — Sales / Grouped / Transport (Article 3 definitions).
- `ppwr:RecyclabilityGrade` — A / B / C grades (Article 4, Annex II); A is
  highest performance, C is lowest. Grade B is the minimum from January 2038.

**Properties:**
- `ppwr:packagingTier` (range PackagingTier).
- `ppwr:recyclabilityGrade` (range RecyclabilityGrade) — companion to
  `dpp:recyclabilityScore` / `dpp:recyclabilityRate` for grade-style
  regulation expressions.
- `ppwr:harmonisedSymbol` — URI of the PPWR Annex IX symbol code.

**Standards Alignment:**
- EU Regulation 2025/40 (Packaging and Packaging Waste)
- ESPR 2024/1781 (Ecodesign for Sustainable Products) — packaging is a
  priority product category.
- Single-Use Plastics Directive 2019/904 (substances overlap; covered via
  `dpp:HazardousSubstance`).

**Reuses (no new vocabulary):**
- Recyclable / recycled content → `dpp:RecycledContent`, `dpp:recyclableContent`
- Reusability / reuse status → `untp:ProductStatus` enum
- Compostability → `dpp:Compostability` + `dpp:compostabilityStandard`
- Bio-based content → `dpp:bioBasedFraction`
- Hazardous substances (PFAS, heavy metals — Article 5) → `dpp:HazardousSubstance`
- EPR (Article 13) → `dpp:ExtendedProducerResponsibility`
- Deposit-return scheme (Article 13) → `dpp:DepositReturnScheme`
- Production site / origin → `untp:Facility` / `gs1:Place` / `gs1:GeoShape`
- Declaration of conformity (Article 15–17) → `gs1:regulatoryInformation` +
  `gs1:regulatoryIdentifier` + `untp:ConformityAttestation`
