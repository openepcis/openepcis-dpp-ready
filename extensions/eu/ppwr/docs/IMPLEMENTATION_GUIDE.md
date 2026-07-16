# PPWR Implementation Guide

How to assemble a PPWR-aligned Digital Product Passport using the OpenEPCIS
DPP-Ready vocabulary.

## What's in this module vs reused from GS1 / common core

The PPWR module is intentionally minimal. It defines only the
PPWR-specific concepts:

- **`euppwr:Packaging`** — subclass of `gs1:PackagingDetails`, the carrier
  for the PPWR-specific data points.
- **`euppwr:packagingTier`** — Sales / Grouped / Transport (PPWR Article 3).
- **`euppwr:recyclabilityGrade`** — A / B / C (PPWR Article 6, Annex II).
- **`euppwr:harmonisedSymbol`** — URI of an Article 12 harmonised label.
- **`euppwr:designForRecyclingMethodology`** — D4R methodology citation.
- **`euppwr:depositRefundIssued`** / **`euppwr:containerCondition`** —
  EPCIS event-level deposit-return observations.
- **`euppwr:RegulationTypeCode-PACKAGING_AND_PACKAGING_WASTE_REGULATION`** —
  module-owned `gs1:RegulationTypeCode` member (the upstream list has no
  packaging-waste entry).

Everything else uses the GS1 Web Vocabulary packaging model and the
cross-cutting `oec:` / `untp:` vocabulary (see the dpp-core `PATTERNS.md`).
The README has the full mapping table.

## The GS1 packaging model

The packaging card hangs off the trade item exactly as the GS1 Web
Vocabulary models it:

```
gs1:Product ──gs1:packaging──▶ euppwr:Packaging (⊑ gs1:PackagingDetails)
                                 ├─ gs1:packagingType ("Bottle")
                                 ├─ euppwr:packagingTier / recyclabilityGrade / harmonisedSymbol
                                 ├─ gs1:packagingMaterial ──▶ gs1:PackagingMaterialDetails
                                 │    ├─ gs1:packagingMaterialType (code list)
                                 │    ├─ gs1:packagingMaterialCompositionQuantity (g)
                                 │    └─ gs1:packagingMaterialThickness
                                 ├─ gs1:packagingRecyclingProcessType (code list)
                                 ├─ gs1:hasReturnablePackageDeposit ──▶ oec:DepositReturnScheme
                                 │    (⊑ gs1:ReturnablePackageDepositDetails)
                                 │    ├─ gs1:returnablePackageDepositAmount (PriceSpecification)
                                 │    ├─ gs1:returnablePackageDepositRegion (Country)
                                 │    ├─ oec:depositSchemeOperator
                                 │    └─ oec:depositRedemptionChannelUrl
                                 ├─ oec:recycledContentDetails ──▶ oec:RecycledContent
                                 └─ oec:extendedProducerResponsibility ──▶ …
```

When the packaging is itself the trade item (empty carton, sold packaging
component with its own GTIN — the per-component-GTIN pattern from the GS1
in Europe PPWR white paper), type the root node as both `gs1:Product` and
`euppwr:Packaging` and attach the packaging properties directly (see
`examples/ecommerce-carton.jsonld`).

## Minimum viable PPWR DPP

1. **Identification** — `gs1:gtin` embedded in a GS1 Digital Link URI
   (per-component GTINs for packaging components; GRAI (AI 8003) for
   reusable/returnable packaging assets).
2. **Packaging tier** — `euppwr:packagingTier` ∈ {Sales, Grouped, Transport}.
3. **Recyclability grade** — `euppwr:recyclabilityGrade` ∈ {A, B, C}
   (mandatory from 2030; A ≥ 95%, B ≥ 80%, C ≥ 70% of unit weight).
4. **Material composition** — `gs1:packagingMaterial` entries with
   `gs1:packagingMaterialType` codes and composition quantities.
5. **Recycled content** — `oec:recycledContentDetails` (mandatory for
   plastic packaging from 2030, Art. 7).
6. **EPR registration** — `oec:extendedProducerResponsibility` for each
   Member State the packaging is placed on the market in (Art. 12(8)).
7. **Manufacturer / economic operator** — `gs1:manufacturer` or
   `oec:operatorInformation`.
8. **Declaration of regulatory compliance** — `gs1:regulatoryInformation`
   with `gs1:regulationType` =
   `euppwr:RegulationTypeCode-PACKAGING_AND_PACKAGING_WASTE_REGULATION`
   and `oec:isRegulationCompliant`.

Optional but strongly recommended:

- **Deposit-return** — `gs1:hasReturnablePackageDeposit` for beverage
  containers in Member States with DRS (Art. 50).
- **Compostability** — `oec:Compostability` with
  `oec:compostabilityStandard` URI, plus
  `gs1:packagingRecyclingProcessType` = COMPOSTABLE.
- **Bio-based content** — `oec:bioBasedFraction` (voluntary disclosure).
- **PFAS / SVHC declaration** — `oec:HazardousSubstance` entries with
  `hazardImpact: "absent"` for PFAS-free claims (Article 5).
- **Harmonised label** — `euppwr:harmonisedSymbol`. The Article 12
  implementing acts (due 2026-08-12, applying from 2028-08-12) will publish
  the label catalogue; until then use a documented placeholder URI.

## EPCIS pattern

The module ships five lifecycle events (`epcis/`): commissioning,
ownership transfer, recyclability-grade observation, deposit return, and
material recovery. Granularity rules:

- A production **lot** is class-level (AI 01 + AI 10) → `quantityList`,
  never `epcList`.
- A single redeemed **item** is a serialised GTIN (AI 01 + AI 21) →
  `epcList`.
- `masterDataAvailableFor` carries only item/lot-level master data —
  `gs1:` terms bare, extension terms prefixed.
- Observation values measured at the event (grade declarations,
  `euppwr:depositRefundIssued`, `euppwr:containerCondition`) sit at
  **event level** (sensor reports), not in `masterDataAvailableFor`.
- Model-level packaging master data (material composition, deposit amount)
  is **resolver-served** via the GTIN — never embedded in events.

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-operational-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/ppwr/ppwr-operational-context.jsonld",
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld"
  ],
  "type": "EPCISDocument",
  "epcisBody": {
    "eventList": [{
      "type": "ObjectEvent",
      "action": "ADD",
      "bizStep": "commissioning",
      "quantityList": [
        { "epcClass": "https://id.gs1.org/01/09521004005019/10/LOT-01", "quantity": 24000, "uom": "H87" }
      ],
      "masterDataAvailableFor": [{
        "id": "https://id.gs1.org/01/09521004005019/10/LOT-01",
        "type": "Product",
        "regulatoryInformation": [{
          "type": "RegulatoryInformation",
          "regulationType": { "id": "euppwr:RegulationTypeCode-PACKAGING_AND_PACKAGING_WASTE_REGULATION" },
          "regulatoryAct": "EU 2025/40",
          "isRegulationCompliant": true
        }]
      }]
    }]
  }
}
```

The HTTP request must declare the extensions header:

```
GS1-Extensions: oec=https://ref.openepcis.io/extensions/common/core/, euppwr=https://ref.openepcis.io/extensions/eu/ppwr/
```

## Validation

```bash
pnpm validate:examples           # JSON-LD expand round-trip across all examples
pyshacl -s extensions/eu/ppwr/validation/ppwr-shapes.ttl -d <your-doc>.jsonld
```

The PPWR shapes require:

- `euppwr:packagingTier` ∈ {Sales, Grouped, Transport}
- `euppwr:recyclabilityGrade` ∈ {A, B, C} (when present)
- every `gs1:packagingMaterial` entry names a `gs1:packagingMaterialType`
- every `gs1:hasReturnablePackageDeposit` card states
  `gs1:returnablePackageDepositAmount`

Lifted `oec:` shapes (in `extensions/common/core/validation/dpp-core-shapes.ttl`)
cover the rest: `oec:Compostability`, `oec:Biodegradability`,
`oec:DepositReturnScheme`, `oec:ExtendedProducerResponsibility`, and the
QuantitativeValue shape.

## See also

- `extensions/common/core/docs/PATTERNS.md` — cross-cutting patterns
- `extensions/common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md` — EPCIS
  integration guide
- `extensions/common/interop/docs/UNTP_MAPPING.md` — UNTP alignment table
- GS1 in Europe White Paper "Packaging and Packaging Waste Regulation
  (PPWR) and GS1 Standards" (v1.0, June 2025) — per-component GTINs,
  2D/Digital Link labelling, GDSN packaging attributes
