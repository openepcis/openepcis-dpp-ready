# Changelog

All notable changes to the EUDR module will be documented in this file.

## [0.9.9] - 2026-08-04

## [0.9.8] - 2026-07-29

### Fixed: 5 value spaces no longer mapped onto the class of things they classify

A closed list of codes and the class of things those codes classify sit at different levels, so no graded SKOS relation between them holds in either direction. `eudr:TimberProductType` (to `gs1:Product`, `schema:Product`, `untp:Product` and `dppk:Product`) and `eudr:ActorRole` (to `schema:Role`) now use `rdfs:seeAlso`.

`check:mappings` rule 7 covers the pattern and runs before the direction rule, since at different levels the question of which term is narrower does not arise. Project-wide this corrected 31 assertions across eight modules; see the [root changelog](../../../CHANGELOG.md).

### Changed: mapping directions and anchors from the vocab-sync audit

A `vocab-sync audit --module eudr` run (108 findings, 26 QA-confirmed) corrected nine directions
and added four anchors. `eudr:geofence` is narrower than the SEMICeu geometry and coordinates
terms and than `schema:polygon`; `eudr:exemptionEffectiveFrom` narrower than `schema:validFrom`;
`eudr:volumeCubicMeters` narrower than `gs1:grossVolume`; `eudr:fscCertification` narrower than
the GS1 certification identification. Two run the other way and keep `skos:narrowMatch`:
`eudr:countryList` aggregates several countries of origin and `eudr:originDetails` is a container
for geolocation and producer, so each is the broader term. Both are allowlisted in
`check:mappings`, whose rule 6 otherwise assumes an atomic term.

`cv:coordinates` was added to `scripts/semiceu-terms.json`; it is defined in the official
SEMICeu m8g source and was only missing from the verification registry, which is why the
reference had been invisible to the guard until it learned to read full IRIs.

`eudr:DueDiligenceStatement` to `gs1:RegulatoryIdentifier` was deferred: a statement is a
document, not an identifier.

### Fixed: 6 inverted SKOS mapping directions

SKOS reads `A skos:narrowMatch B` as "B is narrower than A". 6 mappings in this module
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
- Prefix `eudr:` retained (already region-scoped); IRIs unchanged.
- Completed term governance: 100% `dcterms:source` + `skos:note` coverage.
- Added `owl:imports` for SEMICeu Core Location (locn).

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

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

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
  `oec:customsCommodityCode` + `oec:customsCommodityCodeType` so every
  regulatory module uses the same customs pattern.
- Stale references to non-existent `gs1:isRegulationCompliant` in
  examples; replaced with `oec:isRegulationCompliant` (new core term).

## [0.9.5] - 2026-04-15 (GS1 Standards Week preparation)

### Added
- **EUDR Exemption Declaration pattern** aligned with the EU Deforestation Regulation (EU 2023/1115):
  - `eudr:ExemptionType` enumeration (`PermanentExemption`, `TemporaryExemption`)
  - `eudr:ExemptionDeclaration` class
  - Properties: `eudr:exemptionDeclaration`, `eudr:exemptionType`, `eudr:exemptionReasonCode`, `eudr:exemptionScope`, `eudr:exemptionScopeReference`, `eudr:exemptionEffectiveFrom`, `eudr:exemptionEffectiveUntil`, `eudr:exemptionAuthority`
- New EPCIS event example: `eudr/epcis/exemption-declaration.jsonld`
  (ObjectEvent with `bizStep: oec:BizStep-notifying` carrying an ExemptionDeclaration)
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
