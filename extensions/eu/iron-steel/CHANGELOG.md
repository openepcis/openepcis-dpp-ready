# Changelog

All notable changes to the DPP Iron & Steel module will be documented in this file.

## [Unreleased]

## [0.9.8] - 2026-07-29

### Fixed: three batch identifiers no longer claim to be serial numbers

`eusteel:heatNumber`, `eusteel:castNumber` and `eusteel:lotNumber` each asserted
`skos:broadMatch schema:serialNumber`, which reads as "a heat number is a kind of serial
number". It is not: schema.org domains `serialNumber` on `schema:IndividualProduct`, so it
identifies one piece, while a heat, cast or lot number identifies the group every piece came
from. Neither concept subsumes the other, so all three are now `rdfs:seeAlso` and the
batch-level mapping is carried by `gs1:hasBatchLotNumber`, which each term already asserted.
`eusteel:productNumber` keeps its graded relation: it does identify a single piece.

`check:mappings` gained rule 3c for the pattern. It reads the item-scoped schema.org terms from
their declared domains rather than from a hand-written list, so it stays current if schema.org
adds more, and it fires only when the subject name denotes a lot, batch, heat, cast, melt or
coil. The pair is recorded in `scripts/skos-deferred.json` so a later audit does not re-propose
it.

### Changed: mapping directions and anchors from the vocab-sync audit

A `vocab-sync audit --module iron-steel` run (110 findings, 33 QA-confirmed) found three more
inverted directions that the project-wide sweep had missed because its target list did not yet
carry `schema:addressCountry`, `schema:orderNumber` or `gs1:certificationType`:
`eusteel:meltAndPourCountry`, `eusteel:purchaserOrder` and `eusteel:mtcInspectionType` now read
`skos:broadMatch`. One `rdfs:seeAlso` pointer was graded: `eusteel:mtcSteelProcess` to UNTP's
`processCategory`. The three target terms were added to `check:mappings` rule 6, so the same
inversion is now caught mechanically. Further confirmed findings wait for a curator in
[`docs/skos-alignment/OPEN_DECISIONS.md`](../../../docs/skos-alignment/OPEN_DECISIONS.md); all
of them turn on whether `eusteel:IronSteelProduct` is narrower or broader than a peer profile's
product class, which the panel could not settle above the confidence floor.

### Fixed: 13 inverted SKOS mapping directions

SKOS reads `A skos:narrowMatch B` as "B is narrower than A". 13 mappings in this module
used `narrowMatch` while pointing at a general foundational term, so they asserted the
reverse of their intent, for example claiming `schema:identifier` was narrower than a
specific passport identifier. They now read `skos:broadMatch`, the project convention for
"this term is narrower than the target". The sweep covered 174 assertions across eight
modules; `check:mappings` rule 6 now rejects the pattern against a curated list of general
Layer-1 terms, and pairs where our term is a type or category while the target denotes the
entity itself are allowlisted for a curator instead (see
[`docs/skos-alignment/OPEN_DECISIONS.md`](../../../docs/skos-alignment/OPEN_DECISIONS.md)).

## [0.9.7] — 2026-06-23

### Added
- Initial Iron & Steel module for the ESPR iron & steel priority product group (Regulation (EU) 2024/1781).
- `eusteel:IronSteelProduct` (subclass of `gs1:Product`), anchored `skos:exactMatch dppk:IronSteelProduct` (DPP Keystone peer profile) and `rdfs:seeAlso oec:IronSteel` (core product category).
- Steel identification: `eusteel:heatNumber`, `castNumber`, `lotNumber`, `productNumber`, `purchaserOrder`, `steelGradeClassification` (EN 10020), `steelDesignation` (EN 10027), `meltAndPourCountry`, `cbamReportId` (CBAM Regulation (EU) 2023/956). Each anchored to its GS1/schema.org/DPP Keystone equivalent.
- `eusteel:TechnologyRoute` enumeration (BF-BOF, EAF, OHF, other) + `eusteel:technologyRoute`.
- Material Test Certificate per EN 10204: `eusteel:MaterialTestCertificate` (`skos:exactMatch dppk:MaterialTestCertificate`, `skos:broadMatch schema:Certification`) + `eusteel:mtc`. EN 10168 parameters: `mtcInspectionType`, `mtcNominalSize`, `mtcWeightTolerance`, `mtcYieldStrength`, `mtcTensileStrength`, `mtcYieldStrengthRatio`, `mtcElongation`, `mtcRelativeRibArea`, and chemistry (`mtcCarbonContent`, `mtcPhosphorusContent`, `mtcSulfurContent`, `mtcCopperContent`, `mtcNitrogenContent`, `mtcCarbonEquivalent`), plus `mtcSteelProcess`, `mtcFinishing`, `mtcRadiometricControl`.
- Cross-cutting data reuses `oec:` core: recycled content (`oec:RecycledContent`), substances of concern (`oec:substancesOfConcern`), environmental product declaration (`oec:EnvironmentalProductDeclaration`, EN 15804), and supporting documents (`oec:DocumentReference`).
- Worked example `examples/rebar-product.jsonld` (EAF reinforcing steel S500B with a 3.1 MTC and EN 15804 EPD) and EPCIS transformation event `epcis/transformation-rolling.jsonld`.
- SHACL shapes (`validation/iron-steel-shapes.ttl`) and implementation guide (`docs/IMPLEMENTATION_GUIDE.md`).
