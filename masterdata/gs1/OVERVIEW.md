# GS1 Web Vocabulary — the masterdata engine's upstream vocabulary

This is **not an EPCIS extension.** The regulation modules under `extensions/`
(battery, textile, EUDR, …) are OpenEPCIS-authored vocabularies that *extend*
EPCIS/DPP for a specific regulation. The GS1 Web Vocabulary is different in kind:
it is the **upstream, third-party vocabulary that the masterdata engine models
against**. Products, Places, and Organizations in the resolver and in Digital
Data Management are GS1 classes first; our extensions only add the properties GS1
does not yet define.

It is published on ref.openepcis.io because we vendor a pinned snapshot and build
bare-term shortcut aliases from it, but it must be **described and anchored
differently** from the extensions: it belongs to the masterdata engine, not to
the extension catalogue.

## What the masterdata engine models from GS1

The engine resolves and serves master data as GS1 Web Vocabulary types:

- **Products** — `gs1:Product` and its subclasses (there are many: the vocabulary
  models trade items across categories, not a single Product class). A resolver
  product record is a `gs1:Product` (optionally further typed by an extension
  class such as `eubat:Battery`) carrying `gs1:gtin`, `gs1:productName`,
  `gs1:brand`, weights/dimensions, packaging, and so on.
- **Places** — `gs1:Place` (identified by GLN, `gs1:globalLocationNumber`), used
  for manufacturing places and facilities.
- **Organizations** — `gs1:Organization` (also GLN-identified), used for the
  manufacturer, economic operator, and other parties.

The EN 18223 DPP derivation (`scripts/en18223/`, and the `openepcis-dpp-api`
service) reads exactly these GS1-typed records and projects them to the passport.

## How it is vendored and used

- **Snapshot:** `vendor/gs1/gs1Voc.jsonld` — a pinned copy of the GS1 Web
  Vocabulary, used offline by the CLI/tooling and the browser demo so builds are
  deterministic. It is upstream data; we do not edit it.
- **Bare-term aliases:** `scripts/build-context.ts` generates
  `extensions/common/core/context/gs1-shortcuts-context.jsonld` from that snapshot
  — a bare alias (`gtin → gs1:gtin`, …) for every GS1 class and property. Only the
  operational contexts include this layer, so the compressed EN 18223 §5.2 form
  keys GS1 terms by their bare names. Curated additions/overrides that the pinned
  snapshot is missing live in
  `extensions/common/core/context/.gs1-shortcuts-overrides.json`.
- **Vocabulary mapping:** which DPP concepts reuse GS1 terms vs. which are
  OpenEPCIS-defined is documented in
  [`../../extensions/common/core/docs/GS1_VOCABULARY_MAPPING.md`](../../extensions/common/core/docs/GS1_VOCABULARY_MAPPING.md).

## Note on context URLs

The generated `gs1-shortcuts-context.jsonld` is currently hosted under
`extensions/common/core/context/` for URL stability — operational context arrays,
the dpp-api classpath loader, and already-stored documents reference that URL.
Moving the canonical context URL under `/masterdata/gs1/` (with redirects) can
follow later. This document changes the **description and anchoring** of the
vocabulary — its canonical home and how it is framed — not the resolution URLs.
