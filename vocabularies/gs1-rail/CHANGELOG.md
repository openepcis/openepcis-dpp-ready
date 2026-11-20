# Changelog — GS1 Rail mirror

This file tracks when this repository's mirror of the GS1 Rail Vocabulary
was synced from upstream <https://gs1-epcis-reg.org/rail/>. The upstream
vocabulary itself is versioned independently by GS1 AISBL — see
[`VERSION`](./VERSION) for the upstream version currently mirrored.

## 2026-11-06 — upstream v2.6, new namespace (GS1-Switzerland/WebOntology @ 1598a72)

The 2026-11-05 entry was wrong about the host: GS1 moved the vocabulary to GS1 Switzerland. The
old host now redirects to <https://ref.gs1.ch/voc/rail/>, which serves
`github.com/GS1-Switzerland/WebOntology` (branch `stage`, `src/sectors/tran/rail`).

- Vocabulary 1.6 → **2.6** (issued 2025-10-23), namespace
  `https://gs1-epcis-reg.org/rail/voc/data#` → **`https://ref.gs1.ch/voc/rail/`**.
- 75 terms (was 87): 13 added (wheel and brake measurements such as `wheelFlatMeasurement`,
  `wheelQualityFactor`, `brakeTemperature`, `runDistance`, `travelDirection`, `revisionStatus`),
  25 removed (the registry and access API layer: `apiKey`, `auth`, `visibility`,
  `VisibilityStatus`, `resultsOverview`, `totalEventCount`, …), `breakThickness` corrected to
  `brakeThickness`.
- Our 13 ontology mappings point at terms that 2.6 keeps; they move to the new namespace.
- **Served contexts unchanged:** `context/rail-context.jsonld` stays the 1.6 file and the interop
  `rail-bridge-context.jsonld` keeps its 1.6 IRIs, because stored documents expand against them.
  The 2.x context is mirrored beside it as `context/upstream-2.x/rail-context.jsonld`.
- The sync now pins the upstream commit and fetches from GitHub; SHACL files follow upstream.

## 2026-11-05 — EPCIS examples removed

GS1 took <https://gs1-epcis-reg.org/rail/> offline: since 2026-11-04 every path there, the
context included, answers 404. The two EPCIS examples (`epcis/wheel-temperature-sensor.jsonld`,
`epcis/refurbishment-event.jsonld`) named that context in their `@context` and could no longer be
expanded by anyone outside this repository, so they are removed. The mirrored vocabulary, context
and SHACL stay at upstream v1.6; `pnpm sync:rail` fails until the host is back.

## 2026-07-29 — local changes, no upstream sync

The mirrored vocabulary is unchanged at upstream v1.6. What changed is how this repository serves
it:

- The two EPCIS examples list the standard context chain, with `dpp-core-context` ahead of
  `rail-context` and the bridge last, in place of the operational context. `dpp-core` must come
  first because the EPCIS base context marks its terms `@protected` and that propagates. Both
  files are graph-identical after the change.
- The bare-term aliases in `context/.context-overrides.json` and `rail-context.jsonld` are gone.
  Standard contexts carry prefixed terms only; bare terms live in the shortcut layer that the
  compressed EN 18223 form uses. The rail sensor keys (`leftValue`, `rightValue`, `visibility`)
  keep resolving because they come from the upstream rail context, which imports the EPCIS base
  context itself.

## 2026-05-07 — initial mirror of upstream v1.6

Mirrored:
- `ontology/gs1RailVoc.ttl` — converted from upstream
  `gs1RailVoc.jsonld` (623 triples, 7 classes, 48 properties, 5 enumerations).
- `context/rail-context.jsonld` — verbatim copy of upstream context.
- `validation/Rail-SHACL.json` — verbatim copy.
- `validation/Rail-EPCIS-SHACL-Generic.json` — verbatim copy.

Authored locally:
- `extensions/common/interop/context/rail-bridge-context.jsonld` —
  bridges rail terms upward to `oec:` / SEMICeu / GS1 equivalents.
- `epcis/wheel-temperature-sensor.jsonld` — EPCIS 2.0 ObjectEvent
  carrying `rail:wheelTemperature` + `rail:bearingTemperature` sensor data.
- `epcis/refurbishment-event.jsonld` — TransformationEvent linking
  `rail:itemReconditioningDate` to `oec:remanufacturingDate`.

Notes:
- Upstream `examples/Example1-3.jsonld` URLs return HTTP 200 with 0 bytes;
  re-run `pnpm sync:rail` after upstream populates them.
- Upstream `gs1RailVoc.ttl` is 404; the `.ttl` in `ontology/` is regenerated
  from `gs1RailVoc.jsonld` by `pnpm sync:rail`.
