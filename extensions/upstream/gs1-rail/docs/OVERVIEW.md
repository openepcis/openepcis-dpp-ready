# GS1 Rail Vocabulary — integration overview

## Layering

GS1 Rail is a **Layer-1 sectoral vocabulary**, peer to:

- GS1 Web Vocabulary (`gs1:` — `https://ref.gs1.org/voc/`)
- SEMICeu Core Vocabularies (`cv:`, `cccev:`, `locn:`, `adms:`, `cpsv:`)
- schema.org (`schema:`)

Per [`docs/VOCABULARY_LAYERING.md`](../../../../docs/VOCABULARY_LAYERING.md),
Layer-1 vocabularies are used directly. Rail terms are **not** re-minted
under `ref.openepcis.io` — the upstream namespace
`https://gs1-epcis-reg.org/rail/voc/data#` is the canonical IRI base.

When a rail concept overlaps with a `dpp:` concept (e.g.
`rail:itemReconditioningDate` ↔ `dpp:remanufacturingDate`), the linkage
lives in the **bridge context** at
[`extensions/common/interop/context/rail-bridge-context.jsonld`](../../../common/interop/context/rail-bridge-context.jsonld),
not in either ontology. This keeps each vocabulary clean and lets users
opt into the bridge by including it in their `@context` array.

## Coverage

The upstream vocabulary v1.6 contributes (counts from
`json/rail.json`):

- **7 classes**: `Authentication`, `DynamicCoefficient` (deprecated),
  `Manufacturer`, `NominalValueSet`, `RegistryEntries`,
  `ResultsOverviewAttributes`, `VerifiedByGS1Attributes`.
- **48 properties** spanning sensor metadata, wheel diagnostics,
  vehicle imbalance metrics, EPCIS Registry response shapes, and
  authentication parameters.
- **5 enumerations**: `DataProcessingMethod` (15 values),
  `HeavierSide` (2), `TypesWTMS` (5), `VisibilityStatus` (2),
  `WheelDamageType` (3).

Rail properties have domain anchors to `epcis:SensorMetadata`,
`epcis:SensorReport`, `gs1:Place`, `schema:Product`,
`schema:Observation`, `schema:WarrantyPromise`, and `gs1:Organization`.
Rail extends EPCIS 2.0 directly (`voaf:extends epcis:`).

## EPCIS integration

Rail-touched EPCIS 2.0 events follow the same rules as every other
extension in this repo (see
[`extensions/common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md`](../../../common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md)
and
[`extensions/common/core/docs/GS1_EXTENSIONS_HEADER.md`](../../../common/core/docs/GS1_EXTENSIONS_HEADER.md)):

1. **Rail extension properties live at event level** as siblings of
   `bizStep`, `epcList`, `sensorElementList`, etc. They do **not** go
   inside `masterDataAvailableFor`.
2. **`masterDataAvailableFor` carries `gs1:` properties only.**
3. **Activate rail processing via the `GS1-Extensions` HTTP header**:
   ```http
   GS1-Extensions: rail=https://gs1-epcis-reg.org/rail/voc/data#
   ```
   Combine with other extensions when the event also carries `dpp:` or
   regulation-specific data:
   ```http
   GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/, rail=https://gs1-epcis-reg.org/rail/voc/data#
   ```
4. **JSON-LD `@context`** lists the EPCIS base context plus rail and any
   bridges:
   ```json
   {
     "@context": [
       "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
       "https://gs1-epcis-reg.org/rail/rail-context.jsonld",
       "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
       "https://ref.openepcis.io/extensions/common/interop/rail-bridge-context.jsonld"
     ]
   }
   ```

The two examples in `epcis/` demonstrate this end-to-end.

## Sync procedure

When upstream publishes a new rail version:

1. `pnpm sync:rail` — re-fetches upstream artefacts, regenerates the TTL
   from `gs1RailVoc.jsonld`, mirrors context + SHACL + examples.
2. `pnpm build:json && pnpm build:context` — re-emits `rail.json` and the
   generated context.
3. `pnpm validate:examples` — confirms our local EPCIS examples still
   round-trip cleanly under any new vocabulary changes.
4. Update [`VERSION`](../VERSION) and add a `CHANGELOG.md` entry recording
   the upstream version, sync date, and any bridge changes that follow.

If upstream renames or retires terms, update
`extensions/common/interop/context/rail-bridge-context.jsonld` so the DPP
anchors continue to resolve.
