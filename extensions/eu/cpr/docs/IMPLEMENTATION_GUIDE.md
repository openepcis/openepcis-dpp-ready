# CPR Implementation Guide

How to assemble a CPR-aligned Digital Product Passport using the OpenEPCIS
DPP-Ready vocabulary.

## What's in this module vs reused from common core

The CPR module is intentionally minimal. Only construction-specific
concepts live in `cpr:`:

- **`cpr:ConstructionProduct`** — extends `gs1:Product`.
- **`cpr:constructionProductType`** — enum of Annex III families.
- **`cpr:reactionToFireClass`** — A1..F per EN 13501-1.
- **`cpr:declarationOfPerformanceUrl`** — DoP/DoC document reference.
- **`cpr:EssentialCharacteristic`** — name + value + harmonised standard.

Everything else uses the cross-cutting `dpp:` and `untp:` vocabulary
already lifted to common-core. See the README for the full mapping table
and [`docs/VOCABULARY_LAYERING.md`](../../../docs/VOCABULARY_LAYERING.md)
for the four-layer delegation pattern.

## Minimum viable CPR DPP

A CPR-compliant DPP needs, at minimum:

1. **Identification** — `gs1:gtin` (or appropriate GS1 AI for non-GTIN
   identification) embedded in a GS1 Digital Link URI.
2. **Construction product type** — `cpr:constructionProductType` from
   Annex III enum.
3. **Declaration of Performance** — `cpr:declarationOfPerformanceUrl`
   pointing at a structured DoP / DoC document (Article 12).
4. **Essential characteristics** — at least the ones required for the
   product family per Annex III (e.g. compressive strength + setting
   time for cement; thermal conductivity + density for insulation).
5. **Reaction-to-fire class** when fire performance is essential
   (Annex III, EN 13501-1).
6. **Manufacturer / authorised rep** — `gs1:manufacturer` or
   `dpp:operatorInformation` (which equivalents `untp:Party`).
7. **CE-marking declaration** — `gs1:regulatoryInformation` referencing
   `gs1:RegulationTypeCode-CONSTRUCTION_PRODUCTS_REGULATION` and
   `dpp:isRegulationCompliant`.

Optional but strongly recommended:

- **Recycled content** — `dpp:RecycledContent` (mandatory for some
  product families per delegated acts).
- **Carbon footprint** — `dpp:CarbonFootprintDeclaration` with lifecycle
  stages (mandatory for cement and steel from 2027 per delegated acts).
- **End-of-life take-back** — `dpp:EndOfLifeProgram`.
- **Substances of concern** — `dpp:HazardousSubstance` declarations for
  REACH-listed substances.

## Validation

```bash
pnpm validate:examples
pyshacl -s extensions/eu/cpr/validation/cpr-shapes.ttl -d <your-doc>.jsonld
```

The CPR shape requires:

- `cpr:constructionProductType` (exactly one)
- `cpr:declarationOfPerformanceUrl` (at least one)
- `cpr:reactionToFireClass` ∈ {A1..F} when present
- `cpr:essentialCharacteristic` with name + value + (optional) harmonised
  standard

Lifted `dpp:` shapes cover the cross-cutting parts.

## See also

- [`docs/VOCABULARY_LAYERING.md`](../../../../docs/VOCABULARY_LAYERING.md)
- `extensions/common/core/docs/PATTERNS.md` — pattern reference
- `extensions/common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md`
