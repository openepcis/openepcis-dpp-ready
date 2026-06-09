# Changelog

All notable changes to the EUDR module will be documented in this file.

## 0.9.6 — version alignment (2026-06-07)

Version alignment with the 0.9.6 core release (EN 18223 model alignment). No functional changes to this module.

## 0.9.5 — SEMICeu Core Location anchoring (2026-05-04)

### Added
- `locn:` prefix declaration in `eudr.ttl`.
- `eudr:geolocation` → `rdfs:seeAlso locn:Geometry` (EU SEMICeu Core Location Vocabulary).
- `eudr:transformationLocation` → `rdfs:seeAlso locn:Location`.

### Notes
- See `extensions/common/interop/docs/SEMIC_CORE_VOCABULARIES.md` for the full mapping.

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Removed (use canonical term instead)

- `eudr:countryCode` → `gs1:countryCode`
- `eudr:euisReferenceNumber` → `gs1:regulatoryReferenceNumber`
- `eudr:harvestDate` → `gs1:harvestDate`
- `eudr:harvestDateEnd` → `gs1:harvestDateEnd`
- `eudr:harvestDateStart` → `gs1:harvestDateStart`
- `eudr:unitCode` → `gs1:unitCode`
- `eudr:value` → `gs1:value`

## [unreleased] — 2026-04-17 (GS1 standardization alignment)

### Changed
- Strengthened GS1 alignment metadata on the exemption reference pattern:
  - Added a dated prelude to the exemption block in `ontology/eudr.ttl`
    spelling out that GS1 EUDR Release P (Sep 2025) defines no
    `gs1:regulatoryExemption` term and that our `eudr:Exemption*` terms
    are provisional pending GS1 standardization publication.
  - Updated `epcis/exemption-declaration.jsonld` comment to record the
    2026-04-17 GS1 alignment snapshot and explain that
    `gs1:regulatoryIdentifier` is correctly omitted from the
    `regulatoryInformation` block when an exemption replaces it
    (per ongoing GS1 standardization).
- New `docs/GS1_ALIGNMENT.md` — dated, citation-backed record of which
  `eudr:` terms are verbatim GS1 Release P, which fill documented gaps,
  and which are provisional pending GS1 standardization publication.

### Removed (shadow-vocabulary cleanup, 2026-04-16/17)
- `eudr:TimberProduct` class — was a thin `rdfs:subClassOf gs1:Product`
  wrapper; `eudr:timberProductType` enum already does the classification
  work.
- `eudr:sourceLocation` property — redundant with EPCIS native
  `bizLocation` / `readPoint`.
- `eudr:batchNumber` property — duplicated `gs1:hasBatchLotNumber`.
- `eudr:hsCode` / `eudr:cnCode` properties — promoted to core as
  `dpp:customsCommodityCode` + `dpp:customsCommodityCodeType` so every
  regulatory module uses the same customs pattern.
- Stale references to non-existent `gs1:isRegulationCompliant` in
  examples; replaced with `dpp:isRegulationCompliant` (new core term).

## [0.9.5] - 2026-04-15 (GS1 Standards Week preparation)

### Added
- **EUDR Exemption Declaration pattern** aligned with the EU Deforestation Regulation (EU 2023/1115):
  - `eudr:ExemptionType` enumeration (`PermanentExemption`, `TemporaryExemption`)
  - `eudr:ExemptionDeclaration` class
  - Properties: `eudr:exemptionDeclaration`, `eudr:exemptionType`, `eudr:exemptionReasonCode`, `eudr:exemptionScope`, `eudr:exemptionScopeReference`, `eudr:exemptionEffectiveFrom`, `eudr:exemptionEffectiveUntil`, `eudr:exemptionAuthority`
- New EPCIS event example: `eudr/epcis/exemption-declaration.jsonld`
  (ObjectEvent with `bizStep: notifying` carrying an ExemptionDeclaration)
- New section in `docs/IMPLEMENTATION_GUIDE.md`: "EUDR Exemption Handling (GS1 standardization reference pattern)" with semantic equivalence table across EPCIS JSON-LD / EANCOM / GDSN

### Notes
- Reference pattern may evolve as GS1 standardization settles.
- Exemption reason code currently typed as `xsd:string`; will become a
  controlled enumeration once the official GS1 standardization code list is published.
- Version remains v0.9.5; project has not yet had a formal release.

## [0.9.5] - 2025-02-02

### Initial Release

OpenEPCIS DPP-Ready v0.9.5 - First official public release.

**Standards Alignment:**
- GS1 Web Vocabulary (native foundation)
- UN Transparency Protocol (UNTP) alignment
- EU Deforestation Regulation 2023/1115
- GS1 EUDR Standard p.0.0
- GS1 Germany EUDR Guideline V1.11

**Key Enumerations:**
- `CommodityType` - Cattle, Cocoa, Coffee, OilPalm, Rubber, Soya, Wood
- `RiskLevel` - Negligible, Low, Standard, High
- `TimberProductType` - RoundWood, SawnWood, Plywood, etc.

**Data Exchange Patterns:**
- `gs1:RegulatoryNotification` for B2B messaging
- EPCIS events for full supply chain traceability

**EPCIS Event Patterns:**
- Timber harvesting (`commissioning`)
- Sawmill processing (`transforming`)
- Supply chain transfer (`shipping`, `receiving`)
- Origin declaration (`notifying` with geolocation)
- Due diligence statement

**Key Features:**
- Plot of land with `gs1:GeoShape` polygon support
- HS code classification (44xx, 47xx, 48xx, 94xx)
- Due diligence report references
- Risk assessment tracking
