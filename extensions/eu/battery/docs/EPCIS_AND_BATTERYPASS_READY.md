# EPCIS events and BatteryPass-Ready: what is validated, at which level, and how events reconstruct the passport

## The short answer

**EPCIS events are not validated against BatteryPass-Ready.** They are two separate
pipelines with different inputs and tooling:

- **BatteryPass-Ready validates a battery *passport*** (master-data-shaped). The exporter
  [`scripts/export-batterypass-gefeg.ts`](../../../../scripts/export-batterypass-gefeg.ts) projects a
  flat OpenEPCIS passport into the GEFEG upload shape, which is then checked by the live GEFEG
  `ValidateJSON` server ([`scripts/validate-batterypass-live.ts`](../../../../scripts/validate-batterypass-live.ts))
  and offline by [`scripts/test-batterypass-conformance.ts`](../../../../scripts/test-batterypass-conformance.ts)
  against the live-derived schemas in [`../validation/gefeg-live/`](../validation/gefeg-live/).
  No EPCIS event ever enters this pipeline.
- **EPCIS events are validated on their own path**: JSON-LD IRI expansion
  ([`scripts/validate-jsonld-examples.ts`](../../../../scripts/validate-jsonld-examples.ts)),
  base EPCIS 2.0, the SHACL shapes in [`../validation/battery-shapes.ttl`](../validation/battery-shapes.ttl),
  and at runtime an OpenEPCIS EPCIS Repository that activates the battery rules when the
  `GS1-Extensions: eubat=...` header is present (see
  [`../../../common/core/docs/GS1_EXTENSIONS_HEADER.md`](../../../common/core/docs/GS1_EXTENSIONS_HEADER.md)).

They connect through the EPCIS4DPP split: the passport's dynamic per-battery fields are, over a
battery's life, sourced by aggregating the EPCIS event stream. The rest of this document sets out
that connection precisely.

## Two documents, two validators

| Artifact | What it is | Validated by | With what |
|---|---|---|---|
| Battery **passport** (`batterypass-ready/*.source.json` → `*.gefeg.json`) | static master data, GEFEG upload shape | GEFEG `ValidateJSON` (live, authoritative) + offline ajv harness | `validation/gefeg-live/*.schema.json` |
| Battery **passport** (JSON-LD, `examples/battery-product*.jsonld`) | master data as a DPP graph | in-repo SHACL + JSON-LD expansion | `validation/battery-shapes.ttl`, `validation/battery-schema.json` |
| **EPCIS events** (`epcis/*.jsonld`) | dynamic lifecycle log | JSON-LD expansion, EPCIS 2.0, SHACL, and an OpenEPCIS repository keyed by the `GS1-Extensions` header | `scripts/validate-jsonld-examples.ts`, `validation/battery-shapes.ttl`, OpenEPCIS Event Sentry against `validation/*.json` profiles |

The live GEFEG server is authoritative over the published static schemas; see
[`reference/gefeg-batterypass-ready/SOURCE.md`](./reference/gefeg-batterypass-ready/SOURCE.md).
The BatteryPass-Ready data model is **v1.0** (Attribute Longlist v1.3, SAMM 1.2.0/1.2.1).

## What lives at which level

A battery passport is inherently multi-level. The repo carries two related granularity concepts:

- **`oec:reportingGranularity`** (per attribute) → `oec:DPPGranularity`, one of
  `ModelLevel / ModelPerSiteLevel / BatchLevel / ItemLevel`
  ([`../../../common/core/ontology/dpp-core.ttl`](../../../common/core/ontology/dpp-core.ttl)).
  It feeds the GEFEG `DPPGranularity` field.
- **`oec:granularityLevel`** (per passport, EN 18223) → `model` / `batch` / `item`, derived from the
  GS1 Digital Link Application Identifiers (`01` model, `01+10` batch, `01+21` item) and enforced by
  `dpp-sh:GranularityLevelConstraint` + `dpp-sh:GranularityDigitalLinkConstraint`
  ([`../../../common/core/validation/dpp-core-shapes.ttl`](../../../common/core/validation/dpp-core-shapes.ttl)).

The complete per-attribute classification is machine-readable in
[`../validation/batterypass-granularity.json`](../validation/batterypass-granularity.json) (keyed by
SAMM group then attribute; the first level listed is the primary one, and several attributes list
more than one level because they are genuinely reported at more than one). In summary:

| Level | GS1 Digital Link | Served / derived by | Representative BatteryPass-Ready attributes |
|---|---|---|---|
| **Model** | `01/{gtin}` | resolver master data | BatteryModelIdentifier, manufacturer / economic-operator identity, BatteryCategory, BatteryMass, WarrantyPeriod, all rated / type-tested PerformanceAndDurability (RatedCapacity, voltages, OriginalPowerCapability, Initial* efficiencies and resistances, ExpectedLifetime*, cycle-life reference tests, TemperatureRangeIdleState bounds), BatteryChemistry and composition, dismantling / spare-part / safety / end-user information, due diligence, most symbols and conformity |
| **ModelPerSite / Batch** | `01/{gtin}/10/{lot}` | resolver master data | ManufacturingPlace, ManufacturingDate, UniqueFacilityIdentifier, the whole BatteryCarbonFootprint group, recycled- and renewable-content shares, CarbonFootprintLabel |
| **Item** | `01/{gtin}/21/{serial}` | folded from the EPCIS event stream | per-battery identifiers, DPPStatus, DateOfPuttingIntoService, Date-timeOfLatestUpdate, and every dynamic metric: CapacityFade, StateOfChargeSoC, RemainingCapacity, NumberOfFullChargingAndDischargingCycles, EnergyThroughput, StateOfCertifiedEnergySOCE, RemainingRoundTripEnergyEfficiency, InternalResistanceIncrease, TimeSpentInExtremeTemperatures*, NumberOfDeepDischargeEvents, TemperatureInformation |

Some attributes are multi-level by nature: the carbon footprint is declared per model-per-site or
per batch; the manufacturing date is a batch fact also stamped per item; recycled-content shares are
batch facts sometimes aggregated per model-per-site; material composition is model data that can
vary per batch when sourcing changes; temperature information is a model design range at beginning
of life and an item-observed value over life. The map records the primary level first and lists the
others.

The corresponding `eubat:` dynamic sensor terms carry `oec:reportingGranularity oec:ItemLevel` in
[`../ontology/battery.ttl`](../ontology/battery.ttl); `eubat:carbonFootprintTotal` carries both
`oec:BatchLevel` and `oec:ModelPerSiteLevel`.

## How multiple EPCIS events reconstruct the passport

The item passport is the fold of the static master-data layers and the event stream:

```
passport(item) = masterData(model @ 01/{gtin})
               ⊕ masterData(batch @ 01/{gtin}/10/{lot})
               ⊕ fold(EPCIS events for 01/{gtin}/21/{serial})
```

The model and batch layers are served by the GS1-conformant Digital Link resolver: content
negotiation on the Digital Link returns the product master data, and `?linkType=gs1:epcis` returns
the event history (see [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md) Step 3). The three
levels for one battery are shown by
[`../examples/battery-product-model.jsonld`](../examples/battery-product-model.jsonld),
[`../examples/battery-product-batch.jsonld`](../examples/battery-product-batch.jsonld), and
[`../examples/battery-product.jsonld`](../examples/battery-product.jsonld) (item), all for GTIN
`09521234000013`, serial `BAT2024-001`.

Each of the nine EPCIS examples in [`../epcis/`](../epcis/) is item-level (a single serialized
battery). Their `sensorReport` types fold into the item passport fields as follows (event type casing
is the actual lowerCamelCase `eubat:` form used in the event files, plus the bare CBV `Temperature`;
note the prose tables in `IMPLEMENTATION_GUIDE.md` / `POSITIONING.md` write these in PascalCase):

| Passport field | Fed by `sensorReport` type (event) | Fold |
|---|---|---|
| NumberOfFullChargingAndDischargingCycles | `eubat:cycleCount` (commissioning, state-of-health) | max |
| CapacityFade | `eubat:capacityFade` (state-of-health) | latest |
| StateOfChargeSoC | `eubat:stateOfCharge` | latest |
| RemainingCapacity | `eubat:remainingCapacity` (state-of-health) | latest, rounded to integer Ah |
| RemainingRoundTripEnergyEfficiency | `eubat:remainingRoundTripEfficiency` (state-of-certified-energy) | latest |
| StateOfCertifiedEnergySOCE | `eubat:stateOfCertifiedEnergy` (state-of-certified-energy) ÷ rated energy | latest ratio (EV-only field) |
| EnergyThroughput | `eubat:energyThroughput` (state-of-health) | latest |
| InternalResistanceIncrease… | `eubat:internalResistance` (state-of-health) vs `initialInternalResistance` (model) | derived delta |
| TimeSpentInExtremeTemperatures{Above,Below}Boundary | `Temperature` + `eubat:exposureDurationMinutes` (temperature-extreme), bucketed against TemperatureRangeIdleState bounds | sum |
| NumberOfDeepDischargeEvents | negative-event with a deep-discharge incident type | count |
| TemperatureInformation | latest non-excursion `Temperature` reading | latest |
| BatteryCarbonFootprint group | `eubat:carbonFootprintTotal` + four lifecycle-stage reports (carbon-footprint) | recorded declaration (batch-level) |

[`scripts/reconstruct-passport-from-epcis.ts`](../../../../scripts/reconstruct-passport-from-epcis.ts)
is a reference implementation. It merges the master-data source layers (`--sources` accepts a model
source then a batch source, deep-merged; `--level model|batch|item` selects how far to assemble),
runs the unchanged exporter to produce the static passport, then overlays the folded item-level
values onto the slots the category schema carries. Run it with:

```
pnpm run reconstruct:batterypass -- \
  --sources extensions/eu/battery/examples/batterypass-ready/reconstruction.source.json \
  --category stationary --events extensions/eu/battery/epcis \
  --out extensions/eu/battery/examples/batterypass-ready/reconstruction.gefeg.json
```

The committed output [`../examples/batterypass-ready/reconstruction.gefeg.json`](../examples/batterypass-ready/reconstruction.gefeg.json)
folds fifteen item-level attributes from the nine events (847 cycles, 12108 kWh throughput, 5.8 %
capacity fade, 45 min above the temperature boundary, and so on) and validates against
`StationaryIndustrial2kWh.schema.json`. The script reports which item-level slots no event fed, so
coverage is never silently capped (for this battery: RemainingPowerCapability, PowerFade,
EnergyRoundTripEfficiencyFade, EvolutionOfSelf-dischargeRates, CapacityThroughput,
InformationOnAccidents). Without this fold, a model-level passport emits those item fields as
beginning-of-life values (the exporter says as much in its `PerformanceAndDurability` comment).

## Why the split

The passport is a point-in-time conformance document that GEFEG validates structurally. EPCIS keeps
the auditable who / what / when / where history: a dynamic value carried as an EPCIS event records
the reading plus when, where, by which device, and by which method, rather than a single latest
value with a `lastUpdate` timestamp (see [`POSITIONING.md`](./POSITIONING.md)). Reconstruction bridges
the two.

Actually exercising event-fed dynamic data over a running DPP API is the **System-Level DPP
Implementation Testing** track (prEN 18222), which is out of scope today; see
[`CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md`](./CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md).
