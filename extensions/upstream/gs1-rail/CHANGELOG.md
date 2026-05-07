# Changelog — GS1 Rail mirror

This file tracks when this repository's mirror of the GS1 Rail Vocabulary
was synced from upstream <https://gs1-epcis-reg.org/rail/>. The upstream
vocabulary itself is versioned independently by GS1 AISBL — see
[`VERSION`](./VERSION) for the upstream version currently mirrored.

## 2026-05-07 — initial mirror of upstream v1.6

Mirrored:
- `ontology/gs1RailVoc.ttl` — converted from upstream
  `gs1RailVoc.jsonld` (623 triples, 7 classes, 48 properties, 5 enumerations).
- `context/rail-context.jsonld` — verbatim copy of upstream context.
- `validation/Rail-SHACL.json` — verbatim copy.
- `validation/Rail-EPCIS-SHACL-Generic.json` — verbatim copy.

Authored locally:
- `extensions/common/interop/context/rail-bridge-context.jsonld` —
  bridges rail terms upward to `dpp:` / SEMICeu / GS1 equivalents.
- `epcis/wheel-temperature-sensor.jsonld` — EPCIS 2.0 ObjectEvent
  carrying `rail:wheelTemperature` + `rail:bearingTemperature` sensor data.
- `epcis/refurbishment-event.jsonld` — TransformationEvent linking
  `rail:itemReconditioningDate` to `dpp:remanufacturingDate`.

Notes:
- Upstream `examples/Example1-3.jsonld` URLs return HTTP 200 with 0 bytes;
  re-run `pnpm sync:rail` after upstream populates them.
- Upstream `gs1RailVoc.ttl` is 404; the `.ttl` in `ontology/` is regenerated
  from `gs1RailVoc.jsonld` by `pnpm sync:rail`.
