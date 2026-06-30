# GEFEG BatteryPass-Ready — published artifacts (mirror)

These files are mirrored verbatim from the GEFEG **BatteryPass-Ready** test
environment so the conformance harness can validate against the real published
schemas rather than ones we generate ourselves.

| Source | Value |
|--------|-------|
| Site | https://batterypass-ready.gefeg.com/ |
| Canonical repo | https://git.gefeg.com/bp/BatteryPassDataModel (`BatteryPass-Ready/JSONSchemaFiles/`) |
| Data-model version | **1.0** (work in progress) |
| Data basis | BatteryPass-Ready Data Attribute Longlist **V1.3** (March 2026) — note: the longlist is v1.3, the data model / these schemas are v1.0 |
| Upstream commit | `6ee348bb` "Update JSON schemas in JSONSchemaFiles" (2026-06-23) |
| Retrieved | 2026-06-30 |

> **SAMM aspect models are unaffected.** The `urn:samm:io.BatteryPass.*` aspect
> models (batterypass/BatteryPassDataModel) remain at **1.2.0** (Performance 1.2.1);
> no 1.3.0 SAMM submodels exist. The ontology alignment URNs are correct as-is.

## Files (refreshed 2026-06-30 from upstream `6ee348bb`)

| File | Origin |
|------|--------|
| `EV_batterypass_1.0.json` | Validation schema, Electric Vehicle |
| `LMT_batterypass_1.0.json` | Validation schema, Light Means of Transport |
| `Industrial_Without_BMS_batterypass_1.0.json` | Validation schema, Industrial without BMS (NEW in this update) |
| `Other_Industrial_batterypass_1.0.json` | Validation schema, Other Industrial (> 2 kWh) |
| `Stationary_Industrial_batterypass_1.0.json` | Validation schema, Stationary Industrial (> 2 kWh) |

### Changes in the 2026-06-23 upstream update (vs the 2026-06-17 mirror)

The published static schemas grew ~19 KB → ~42 KB and now include `required`
arrays, `format` constraints, and tightened enums. Drift detected against our
exporter (`scripts/export-batterypass-gefeg.ts`), inner `Battery_Passport_Master`:

**RESOLVED — live-verified 2026-06-30** against the GEFEG `ValidateJSON` server
(`EV_Guide` / `LMT_Guide` / `Other_Industrial_2kWh_Guide` /
`Stationary_Industrial_2kWh_Guide`, version `1.0`). All four category exports now
return ✅ no errors. The static and live contracts have **converged**, so the
`validation/gefeg-live/` schemas are now exact mirrors of these published static
schemas (`scripts/build-gefeg-live-schema.ts` copies them). Exporter changes made:

- carbon-footprint unit enum → ASCII `kgCO2-eq/kWh` (was Unicode-subscript).
- root key → single `Battery_Passport` for every category (per-category roots removed).
- `ExpectedLifetime-NumberOfChargeOrDischargeCycles` → `…NumberOfCharge-dischargeCycles`.
- `WarrantyPeriodOfTheBattery` → `format: date` (`warrantyExpiryDate`).
- `SymbolsForCadmiumAndLead`, `InformationOnAccidents`,
  `InformationOnSourcesOfSpareParts` → `format: uri` (mapped to source URLs).
- `BatteryChemistry` key `CustomChemicalCodes` → `chemicalCodeValue`.
- category-aware emission: each export is pruned to its category schema's allowed
  group properties (EV no longer carries LMT/Stationary-only fields); the
  `BatteryCategory` enum value is per-category (`industrial/non-stationary battery`,
  `industrial/stationary battery`, …).

Hashed asset paths at retrieval time, e.g.
`https://batterypass-ready.gefeg.com/assets/EV_batterypass_1.0-CMI21Ips.json`.
The Battery Pass data-model documentation PDF
(`/assets/Bpass_DataModel-…​.pdf`) and the Test Adapter OpenAPI spec
(`/test-adapter/openapi/index.html`, system-level testing) are available from the
same site but are not mirrored here (this mirror covers the file-validation
schemas only).

## Shape of these schemas (important)

- JSON Schema draft 2020-12. Each category schema has a **single root property**
  that wraps a shared `BatteryPass_Master`; the root key is the only thing that
  differs between the four files:
  - EV → `EV`
  - LMT → `LMT`
  - Other Industrial → `OtherIndustrial2kWh`
  - Stationary Industrial → `Industrial2kWh`
- `BatteryPass_Master` groups attributes into seven SAMM aspects:
  `IdentifiersAndProductData`, `PerformanceAndDurability`,
  `CircularityAndResourceEfficiency`, `BatteryMaterialsAndComposition`,
  `BatteryCarbonFootprint`, `SupplyChainDueDiligence`,
  `SymbolsLabelsAndDocumentationOfConformity`.
- Attribute names are verbose PascalCase carrying their longlist label
  (e.g. `UniqueBatteryPassportIdentifierUniqueDPPIdentifier`,
  `ExpectedLifetime:_NumberOfCharge-dischargeCycles`).
- Quantities are **unit + value objects**, e.g. `RatedCapacity` →
  `{ ampereHourValueDecimal, ampereHourMiliamperehour: "Ah"|"mAh" }`;
  `percent_decimal` → `{ percent: "%", percentageValue: 0–100 }`.
- The v1.0 export declares **no `required` arrays and no `additionalProperties:false`**.
  Validation is therefore lenient: present fields are type/enum-checked, unknown
  fields pass silently. (The docs note semantic/cross-field plausibility checks are
  planned for a future release.)

The four `$defs` blocks are identical (41 defs each); all seven groups carry an
identical property set across the four categories in this prototype release.

> **These static files are stale relative to the live server.** The live
> `ValidateJSON` API enforces `required` properties and several different key
> names (e.g. hyphenated `ExpectedLifetime-NumberOf…`, enum objects with a
> `<name>Value` key, `OriginalPowerCapability` at 80/20 SoC). Treat the live API
> as authoritative; see the "live API is stricter" section in
> `../CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md` and `scripts/validate-batterypass-live.ts`.
