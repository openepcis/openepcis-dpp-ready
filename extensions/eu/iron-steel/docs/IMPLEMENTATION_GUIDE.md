# Iron & Steel DPP — Implementation Guide

This guide shows how to assemble a Digital Product Passport for an iron or
steel product under the ESPR iron & steel delegated act (Regulation (EU)
2024/1781), using the `eusteel:` module plus the lifted `oec:` core.

## 1. Choose the carrier

```jsonc
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/iron-steel/iron-steel-context.jsonld"
  ],
  "id": "https://id.gs1.org/01/{GTIN}/10/{HEAT}",
  "type": "eusteel:IronSteelProduct"
}
```

Use a GS1 Digital Link: `01` (GTIN) for the product model, `10` (batch) for the
heat/cast, `21` (serial) for an individually serialised item.

## 2. Steel identification

| Concept | Property | Standard |
|---------|----------|----------|
| Heat (melt) number | `eusteel:heatNumber` | EN 10168 |
| Cast number | `eusteel:castNumber` | EN 10168 |
| Delivery lot | `eusteel:lotNumber` | — |
| Manufacturer product number | `eusteel:productNumber` | — |
| Grade classification | `eusteel:steelGradeClassification` | EN 10020 |
| Designation (name / number) | `eusteel:steelDesignation` | EN 10027 |
| Melt-and-pour country | `eusteel:meltAndPourCountry` | CBAM |
| Production route | `eusteel:technologyRoute` (BF-BOF / EAF / OHF) | — |
| CBAM report id | `eusteel:cbamReportId` | (EU) 2023/956 |

## 3. Material Test Certificate (EN 10204)

Attach the mill certificate via `eusteel:mtc`. Declare the EN 10204 inspection
document type (`mtcInspectionType`: `2.1`, `2.2`, `3.1`, `3.2`) and the EN 10168
parameters that substantiate the grade:

- Mechanical: `mtcYieldStrength`, `mtcTensileStrength`, `mtcYieldStrengthRatio`,
  `mtcElongation`, `mtcRelativeRibArea`, `mtcNominalSize`, `mtcWeightTolerance`.
- Chemical (cast analysis): `mtcCarbonContent`, `mtcPhosphorusContent`,
  `mtcSulfurContent`, `mtcCopperContent`, `mtcNitrogenContent`,
  `mtcCarbonEquivalent`.
- Process: `mtcSteelProcess`, `mtcFinishing`, `mtcRadiometricControl`.

## 4. Cross-cutting data — reuse `oec:`

Do **not** mint steel-specific terms for these; reuse the core vocabulary:

- **Recycled content** (the EAF scrap share is the headline ESPR metric):
  `oec:recycledContent` → `oec:RecycledContent` with
  `oec:preConsumerRecycledContent` / `oec:postConsumerRecycledContent`.
- **Environmental Product Declaration** (EN 15804): `oec:environmentalProductDeclaration`
  → `oec:EnvironmentalProductDeclaration` with `oec:impactIndicator` results
  (`oec:GWPTotal` etc.) and optional `oec:lifecycleStageResult` breakdown.
- **Substances of concern** (REACH / SCIP): `oec:substancesOfConcern`.
- **Supporting documents** (REACH dossier, recycled-content conformity):
  `oec:documents` → `oec:DocumentReference`.
- **Economic operator / facility**: `oec:OperatorInformation` / `oec:FacilityInformation`.

## 5. EPCIS events

Steel CTEs (melting, casting, rolling) are `TransformationEvent`s. Carry the
heat number that ties an output to its cast in `ilmd` as a prefixed extension
property (`eusteel:heatNumber`); put full static product attributes inside
`masterDataAvailableFor` (GS1 ambient → bare keys, extension terms keep their
context alias). Declare the extensions in the HTTP header:

```http
GS1-Extensions: oec=https://ref.openepcis.io/extensions/common/core/, eusteel=https://ref.openepcis.io/extensions/eu/iron-steel/
```

See [`../epcis/transformation-rolling.jsonld`](../epcis/transformation-rolling.jsonld)
and [`../examples/rebar-product.jsonld`](../examples/rebar-product.jsonld).

## 6. Interoperability

`eusteel:` is anchored to the DPP Keystone peer profile (`dppk:`). A DPP Keystone
iron & steel passport maps onto this module via the bridge context in
[`../../common/interop/context/dpp-keystone-bridge-context.jsonld`](../../common/interop/context/dpp-keystone-bridge-context.jsonld).
