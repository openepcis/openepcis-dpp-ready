# GEFEG BatteryPass-Ready — published artifacts (mirror)

These files are mirrored verbatim from the GEFEG **BatteryPass-Ready** test
environment so the conformance harness can validate against the real published
schemas rather than ones we generate ourselves.

| Source | Value |
|--------|-------|
| Site | https://batterypass-ready.gefeg.com/ |
| Build | 0.1.1 (Prototype / Early Access) |
| Documentation | v0.1, April 2026 |
| Data basis | BatteryPass-Ready Data Attribute Longlist **V1.3** (March 2026) |
| Retrieved | 2026-06-17 |

## Files

| File | Origin |
|------|--------|
| `EV_batterypass_1.0.json` | Validation schema, Electric Vehicle |
| `LMT_batterypass_1.0.json` | Validation schema, Light Means of Transport |
| `Other_Industrial_batterypass_1.0.json` | Validation schema, Other Industrial (> 2 kWh) |
| `Stationary_Industrial_batterypass_1.0.json` | Validation schema, Stationary Industrial (> 2 kWh) |

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
