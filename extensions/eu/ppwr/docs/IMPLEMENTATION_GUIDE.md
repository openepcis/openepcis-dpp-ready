# PPWR Implementation Guide

How to assemble a PPWR-aligned Digital Product Passport using the OpenEPCIS
DPP-Ready vocabulary.

## What's in this module vs reused from common core

The PPWR module is intentionally minimal. It defines only the three
packaging-specific concepts:

- **`euppwr:Packaging`** — extends `gs1:Packaging`, a carrier for PPWR data.
- **`euppwr:packagingTier`** — Sales / Grouped / Transport (PPWR Article 3).
- **`euppwr:recyclabilityGrade`** — A / B / C (PPWR Article 4, Annex II).
- **`euppwr:harmonisedSymbol`** — URI of an Annex IX symbol.

Everything else uses the cross-cutting `oec:` and `untp:` vocabulary
already lifted to common-core (see the dpp-core `PATTERNS.md` for the
full term list). The README has the full mapping table.

## Minimum viable PPWR DPP

A PPWR-compliant packaging DPP needs, at minimum:

1. **Identification** — `gs1:gtin` (or the appropriate GS1 AI for non-GTIN
   identification) embedded in a GS1 Digital Link URI.
2. **Packaging tier** — `euppwr:packagingTier` ∈ {Sales, Grouped, Transport}.
3. **Recyclability grade** — `euppwr:recyclabilityGrade` ∈ {A, B, C}
   (mandatory from 2030).
4. **Material composition** — `oec:MaterialComposition` entries.
5. **Recycled content** — `oec:RecycledContent` (mandatory for plastic
   packaging from 2030).
6. **EPR registration** — `oec:extendedProducerResponsibility` for each
   Member State the packaging is placed on the market in.
7. **Manufacturer / economic operator** — `gs1:manufacturer` or
   `oec:operatorInformation` (which equivalents `untp:Party`).
8. **Declaration of regulatory compliance** — `gs1:regulatoryInformation`
   with `gs1:regulationType` set to a packaging code and
   `oec:isRegulationCompliant`.

Optional but strongly recommended:

- **Deposit-return** — `oec:depositReturnScheme` for beverage containers
  in Member States with DRS.
- **Compostability** — `oec:Compostability` if the packaging carries an
  industrial / home-compostable claim (note: substantiate with
  `oec:compostabilityStandard` URI).
- **Bio-based content** — `oec:bioBasedFraction` (Article 13 optional
  voluntary disclosure).
- **PFAS / SVHC declaration** — `oec:HazardousSubstance` entries with
  `hazardImpact: "absent"` for PFAS-free claims (Article 5).

## EPCIS pattern

Use a `commissioning` event when the packaging item enters the regulated
supply chain. PPWR-specific properties (packagingTier, recyclabilityGrade,
harmonisedSymbol) and lifted oec: properties live at **event level**, not
inside `masterDataAvailableFor` (which carries only `gs1:` master data).

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/ppwr/ppwr-context.jsonld",
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld"
  ],
  "type": "EPCISDocument",
  "epcisBody": {
    "eventList": [{
      "type": "ObjectEvent",
      "bizStep": "commissioning",
      "epcList": ["https://id.gs1.org/01/09521234500018"],
      "packagingTier": "Sales",
      "recyclabilityGrade": "A",
      "extendedProducerResponsibility": [{ "type": "ExtendedProducerResponsibility", "...": "..." }],
      "masterDataAvailableFor": [{ "id": "https://id.gs1.org/01/09521234500018", "type": "Product", "gtin": "09521234500018" }]
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

The PPWR shape requires:

- `euppwr:packagingTier` ∈ {Sales, Grouped, Transport}
- `euppwr:recyclabilityGrade` ∈ {A, B, C} (when present)

Lifted `oec:` shapes (in `extensions/common/core/validation/dpp-core-shapes.ttl`)
cover the rest:

- `oec:Compostability`, `oec:Biodegradability`, `oec:DepositReturnScheme`,
  `oec:ExtendedProducerResponsibility` — each with their own NodeShape.
- `oec:QuantitativeValueShape` validates every QuantitativeValue carries
  `gs1:value` + `gs1:unitCode`.

## See also

- `extensions/common/core/docs/PATTERNS.md` — cross-cutting patterns
- `extensions/common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md` — EPCIS
  integration guide
- `extensions/common/interop/docs/UNTP_MAPPING.md` — UNTP alignment table
