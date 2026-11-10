# BatteryPass-Ready data model (vendored)

Verbatim copy of the JSON Schemas of the BatteryPass-Ready data model, as published in
<https://git.gefeg.com/bp/BatteryPassDataModel> (`JSONSchemaFiles/`), plus the v1.3 → v2.0
changelog. Written by `pnpm run sync:batterypass-ready` from a pinned commit; nothing under
`<version>/` is edited. `<version>/MANIFEST.json` records the commit and the SHA-256 of every file.

| Release | Commit | Content |
|---|---|---|
| 2.0.1 | `64761a79` (2026-09-23) | one schema per battery category (EV, LMT, industrial without BMS, other industrial above 2 kWh, stationary industrial above 2 kWh), each in two variants: all requirements (`<Category>_2.0.1.json`) and the requirements from February 2027 (`<Category>_Feb27_2.0.1.json`, a subset) |

Licence: CC BY 4.0, © BatteryPass-Ready Consortium ("This document is made available under a CC BY
Licence (Attribution)", repository README). The resources are maintained by acatech on behalf of the
consortium.

## How the repository uses it

- `tools/vocab-sync/tools/build-bpr-vocab.py` mints IRIs for the 122 data elements
  (`extensions/eu/battery/vocab/batterypass-ready-2.0.1.ttl`, `bpr:`), which the SKOS alignment and
  the battery ontology's `skos:*Match` use.
- `scripts/build-batterypass-ready-context.ts` writes the JSON-LD context that reads a 2.0.1 document
  as RDF (`extensions/eu/battery/context/batterypass-ready-2.0.1-context.jsonld`), the keys of its value
  containers (`batterypass-ready-2.0.1-json.ttl`, `bprx:`) and the document structure of the crosswalk
  profile (`extensions/common/interop/crosswalk/batterypass/structure.ttl`).
- The crosswalk profile `batterypass` converts OpenEPCIS battery passports to 2.0.1 documents and back
  and checks every document against the schema of its category (all requirements);
  `pnpm run export:batterypass-ready` and `pnpm test` use it.

## Notes on release 2.0.1

- The schemas carry no descriptions, no `$id` and no IRIs; definitions are in the BatteryPass-Ready
  Data Attribute Longlist v2.0 (thebatterypass.eu). Elements that apply only under conditions
  (`symbolsForCadmiumAndLead`, `warrantyPeriod`, the recycled content shares, ...) are optional in the
  schemas; the consortium announces plausibility checks for them.
- No group declares `additionalProperties: false`: a key outside the schema passes.
- Percentages and internal resistances are integers (whole percent, whole ohms), so an internal
  resistance below 0.5 Ω cannot be stated.
- The granularity admits `item` only.
- The changelog names the identifier types `CAS` and `EC`; the schemas admit `CAS No` and `EC No`.
- The GEFEG test environment (batterypass-ready.gefeg.com) validated data model 1.0 / longlist v1.3
  when this mirror was made; its older schemas are mirrored under
  `extensions/eu/battery/docs/reference/gefeg-batterypass-ready/` for `scripts/export-batterypass-gefeg.ts`.
