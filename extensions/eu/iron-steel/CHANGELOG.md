# Changelog

All notable changes to the DPP Iron & Steel module will be documented in this file.

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
