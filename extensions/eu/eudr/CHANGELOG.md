# Changelog

All notable changes to the EUDR module will be documented in this file.

## [unreleased] — 2026-04-17 (GS1 EUDR MSWG alignment)

### Changed
- Strengthened GS1 alignment metadata on the exemption reference pattern:
  - Added a dated prelude to the exemption block in `ontology/eudr.ttl`
    spelling out that GS1 EUDR Release P (Sep 2025) defines no
    `gs1:regulatoryExemption` term and that our `eudr:Exemption*` terms
    are provisional pending GSMP WR 25-252 / WR 26-122 publication.
  - Updated `epcis/exemption-declaration.jsonld` comment to record the
    2026-04-17 GS1 alignment snapshot and explain that
    `gs1:regulatoryIdentifier` is correctly omitted from the
    `regulatoryInformation` block when an exemption replaces it
    (per GS1 EUDR MSWG 2026-04-13).
- New `docs/GS1_ALIGNMENT.md` — dated, citation-backed record of which
  `eudr:` terms are verbatim GS1 Release P, which fill documented gaps,
  and which are provisional pending GSMP publication.

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
- **EUDR Exemption Declaration pattern** aligned with GS1 GSMP Work Request WR 25-252 (EUDR Exemptions in EANCOM/GS1 XML/GDSN, eBallot) and WR 26-122 (GDSN Exemptions, Community Review):
  - `eudr:ExemptionType` enumeration (`PermanentExemption`, `TemporaryExemption`)
  - `eudr:ExemptionDeclaration` class
  - Properties: `eudr:exemptionDeclaration`, `eudr:exemptionType`, `eudr:exemptionReasonCode`, `eudr:exemptionScope`, `eudr:exemptionScopeReference`, `eudr:exemptionEffectiveFrom`, `eudr:exemptionEffectiveUntil`, `eudr:exemptionAuthority`
- New EPCIS event example: `eudr/epcis/exemption-declaration.jsonld`
  (ObjectEvent with `bizStep: notifying` carrying an ExemptionDeclaration)
- New section in `docs/IMPLEMENTATION_GUIDE.md`: "EUDR Exemption Handling (WR 25-252 reference pattern)" with semantic equivalence table across EPCIS JSON-LD / EANCOM / GDSN

### Notes
- Reference pattern may evolve per WR 25-252 eBallot outcome.
- Exemption reason code currently typed as `xsd:string`; will become a
  controlled enumeration once the official WR 25-252 code list is published.
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
