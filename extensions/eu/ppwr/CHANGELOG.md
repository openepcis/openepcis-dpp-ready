# Changelog

All notable changes to the PPWR module will be documented in this file.

## [Unreleased]

### Changed
- Examples now use the GS1 Web Vocabulary packaging model end to end:
  `gs1:Product` → `gs1:packaging` → `euppwr:Packaging` (subclass of
  `gs1:PackagingDetails`), with `gs1:packagingMaterial` /
  `gs1:PackagingMaterialDetails` (typed material codes + composition
  quantities), `gs1:packagingType`, `gs1:packagingFeature`,
  `gs1:packagingRecyclingProcessType`, and
  `gs1:hasReturnablePackageDeposit` → `gs1:returnablePackageDepositAmount`
  (`gs1:PriceSpecification`) + `gs1:returnablePackageDepositRegion`.
  Packaging sold as a trade item (e-commerce carton) is dual-typed
  `gs1:Product` + `euppwr:Packaging` — the per-component-GTIN pattern from
  the GS1 in Europe PPWR white paper (v1.0, June 2025).
- Regulation compliance declarations use the module-owned
  `euppwr:RegulationTypeCode-PACKAGING_AND_PACKAGING_WASTE_REGULATION`
  (typed `gs1:RegulationTypeCode`); the placeholder GS1-namespace code
  `gs1:RegulationTypeCode-PACKAGING_WASTE_DIRECTIVE` (absent upstream) is
  retired and removed from the vocab-guard allowlist.
- Corrected regulation facts throughout: recyclability grades are Article 6
  / Annex II (A ≥ 95%, B ≥ 80%, C ≥ 70% of unit weight), harmonised
  labelling is Article 12 (implementing acts due 2026-08-12, applying from
  2028-08-12), deposit-return is Article 50; in-force / application dates
  fixed (2025-02-11 / 2026-08-12).
- `euppwr:Packaging` is a subclass of `gs1:PackagingDetails` only (the
  `gs1:Product` superclass moved to instance-level typing where packaging
  is itself a trade item); returnable-asset guidance corrected to GRAI
  (AI 8003).
- EPCIS examples: lots (AI 01 + AI 10) move from `epcList` to
  `quantityList`; deposit return uses a serialised GTIN (AI 01 + AI 21);
  the recovery TransformationEvent drops the `action` field and the
  redundant class-level `inputEPCList`; all events reference the
  beverage-bottle story GTIN `09521004005019`; `GS1-Extensions` header
  examples now include the `euppwr` pair.
- Recycled content uses `oec:recycledContentDetails` with decimal
  fractions (the dpp-core model) instead of QuantitativeValue nodes under
  the wrong linking key.

### Added
- `euppwr:designForRecyclingMethodology`, `euppwr:depositRefundIssued`,
  `euppwr:containerCondition` — previously used by EPCIS examples/shapes
  but undefined in the ontology.
- SHACL shapes for the GS1 packaging model
  (`ppwr-sh:PackagingMaterialDetailsShape`,
  `ppwr-sh:ReturnablePackageDepositShape`).
- Standard/shortcut context entries for the GS1 packaging terms.

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
- `euppwr:Packaging` — `subClassOf gs1:PackagingDetails`. The carrier of all PPWR data.

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
