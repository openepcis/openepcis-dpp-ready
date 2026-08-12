# Changelog

All notable changes to the PPWR module will be documented in this file.

## [Unreleased]

### Changed: verified against the GS1 packaging model, concrete anchors added

Re-checked every `euppwr:` term against the full property inventory of
`gs1:PackagingDetails`, `gs1:PackagingMaterialDetails` and
`gs1:ReturnablePackageDepositDetails`. No duplication found; the delegation
documented in the ontology header holds. Added the near-miss anchors the
review surfaced, each with a note recording why the GS1 term does not carry
the PPWR data point:

- `euppwr:harmonisedSymbol` → `rdfs:seeAlso gs1:packagingMarkedLabelAccreditation`
  (closed accreditation code list, explicitly non-regulatory) and
  `gs1:consumerRecyclingInstructions` (textual sorting guidance).
- `euppwr:hasRecyclabilityGrade` → `rdfs:seeAlso gs1:packagingRecyclingProcessType`
  (binary RECYCLABLE claim vs graded A/B/C) and
  `gs1:ReferencedFileTypeCode-RECYCLABILITY_ASSESSMENT_CERTIFICATE`; same
  certificate anchor on `euppwr:designForRecyclingMethodology`.
- `euppwr:ReuseInformation` / `euppwr:reuseSystemName` →
  `rdfs:seeAlso gs1:packagingRecyclingScheme` (closed code list of national
  deposit schemes, cannot name an arbitrary Annex VI re-use system operator).
- Ontology header now lists `gs1:packagingRecyclingScheme` and
  `gs1:consumerRecyclingInstructions` among the GS1 terms used directly.

## [0.9.9] - 2026-08-04

### Added: Article 12(2) reuse data card

New terms for the reuse information the PPWR Article 12(2) QR code (or other
standardised, open, digital data carrier) must make available for reusable
packaging from 2029-02-12 — the one PPWR data set with no GS1/SEMICeu/
schema.org/oec carrier: `euppwr:ReuseInformation` +
`euppwr:reuseInformation` (domained on `euppwr:Packaging`), the
`euppwr:ReuseSystemScope` enumeration (`LocalSystem` / `NationalSystem` /
`UnionWideSystem` — Art. 12(2) "local, national or Union-wide system for
re-use"), `euppwr:reuseSystemName`, `euppwr:collectionPointsUrl`
(`skos:closeMatch oec:collectionPointDirectoryUrl`, which is domained to
end-of-life programmes), `euppwr:averageRotationsEstimate`, and the
deliberately domain-less `euppwr:rotationCount` (usable in the card and as
an EPCIS event observation, peer of `euppwr:containerCondition`). All six
properties default to `oec:Public` — Art. 12(2) makes them end-user QR
information.

### Added: hand-written DPP document schema

`validation/ppwr-schema.json` (detergent-schema pattern): the only
`$defs.Packaging.required` entry is `conformityDeclaration` — the Annex VII
Module A assessment with an Annex VIII EU declaration of conformity is the
one duty already in force for all packaging placed on the market from
2026-08-12 (Art. 15(2), Art. 39), carried as an `oec:DocumentReference` via
`oec:conformityDeclaration`. Labelling (Art. 12, 2028/2029), recyclability
grading (Art. 6, 2030) and recycled-content minima (Art. 7, 2030) are
described as recommended data points with their article citations until
their application dates.

### Added: wired into the extension-schema manifest

The module is now listed in `scripts/build-extension-schemas.ts`, so
`validation/ppwr.extension-schema.json` and the
`scripts/out/extension-schemas.manifest.json` entry are generated and
downstream consumers (the DDM passport editor's vocab sync) can pick the
module up.

### Changed
- Examples: the e-commerce carton carries the new
  `euppwr:reuseInformation` card (national re-use pool, collection points,
  average rotations estimate); both the carton and the multi-layer pouch
  reference their EU declaration of conformity via
  `oec:conformityDeclaration` (Annex VIII document, kept 5/10 years per
  Art. 15(3)).

## [0.9.8] - 2026-07-29

### Changed: mapping anchors from the vocab-sync audit

A `vocab-sync audit --module ppwr` run (10 findings, 4 QA-confirmed) graded two new anchors,
`euppwr:containerCondition` to `schema:itemCondition` and `euppwr:Packaging` to
`gs1:PackagingDetails` (the class already documented itself as a `gs1:PackagingDetails`
subclass), and corrected `euppwr:harmonisedSymbol` to `skos:narrowMatch
dppk:separateCollectionSymbol`: PPWR Article 12 covers a family of harmonised symbols of which
separate collection is one, so our term is the broader one. `euppwr:PackagingTier` was left
alone; it is an `owl:oneOf` enumeration and the proposed target denotes packaging itself.

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
