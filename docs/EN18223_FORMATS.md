# EN 18223 DPP representations

The EU-DPP API (`openepcis-dpp-api`) serves an EN 18223:2026
`DigitalProductPassport` derived from GS1 Web Vocabulary + GS1 Digital Link
master data (the resolver Product API `POST /products` body). It offers the two
EN 18223 JSON serializations, both in XML, plus RDF. They all describe the same
facts.

## Design principle

EN 18223 defines **one JSON payload** and two serializations of it (§5.2.1):

- the **compressed** serialization (§5.2) — ordinary key/value JSON keyed by
  `elementId`, with the `dictionaryReference` and `valueDataType` held in an
  external **data dictionary** (§5.2.2), and
- the **expanded** serialization (Annex A) — the same content with every
  `DataElement` spelled out (`elementId`, `objectType`, `dictionaryReference`,
  `valueDataType`, value).

A JSON-LD `@context` is exactly that data dictionary.

**Fidelity — the operational form is returned as it came.** The operational /
compressed payload is the stored master-data body echoed **verbatim**: the EN
18223 envelope plus the product properties in the exact JSON shape they were
written. A scalar stays a scalar, an array stays an array, a single object stays
an object; both scalar and array are supported wherever a property allows
repetition (`GET` of what you `PUT` returns the same bytes). Attaching the
published operational `@context` makes that same body self-describing JSON-LD
without changing a single data byte, so "operational JSON-LD" and "compressed
JSON" are the same payload — one carries the `@context`, one leaves the dictionary
external. The operational form is **not** normalized or re-shaped.

The **expanded** (Annex A) form is the deliberately normalized, typed derivation
for machine processing. The RDF forms are projections of the one canonical graph
(Titanium in Java, jsonld.js in the TypeScript reference); the two XML forms are
projections of the Annex A information model (XML is not RDF).

## The representations

Selected with the `Accept` header and the `representation` query parameter on the
DPP read endpoints (`GET /v1/dpps/{id}`, `/v1/dppsByProductId/{id}`,
`/v1/dppsByIdAndDate/{id}`).

| Representation | Media type | `?representation` | What it is |
|---|---|---|---|
| **Operational (JSON-LD)** | `application/ld+json` | `operational` | The stored body echoed verbatim (shape preserved) carrying the published operational `@context` as its data dictionary. Valid JSON and valid JSON-LD; expands to the product RDF. Exactly what you `POST`. |
| **Compressed (JSON)** | `application/json` | `compressed` (default) | The same echoed body with the dictionary left external (no `@context`). Byte-identical to the operational body minus the context line. |
| **Expanded (JSON)** | `application/json` | `full` / `expanded` | The Annex A typed form: an `elements[]` array where each `DataElement` carries `elementId`, `objectType`, `dictionaryReference`, `valueDataType`. |
| **Compressed (XML)** | `application/xml` | `operational` / `compressed` | The Annex B XML: the payload as XML, header in the `dpp:` namespace, each data element under its dictionary's namespace prefix. |
| **Expanded (XML)** | `application/xml` | `full` / `expanded` | An XML rendering of the Annex A model (the standard defines only compressed XML; this is the faithful analogue). |
| **GS1 profile** | `application/json` | `gs1` | The master-data body verbatim (no derived header). |
| **Turtle** | `text/turtle` | — | The DPP RDF graph as Turtle. |
| **N-Triples** | `application/n-triples` | — | The graph as N-Triples. |
| **N-Quads** | `application/n-quads` | — | The graph as N-Quads. |

`Accept` precedence: an RDF type (Turtle/N-Triples/N-Quads) wins, then
`application/ld+json`, then `application/xml`, then `application/json`. For
`application/xml` and `application/json` the `representation` flag chooses
compressed (default) vs expanded; `application/ld+json` is always the operational
payload with the `@context`.

## The operational `@context` (the data dictionary)

Published at
`https://ref.openepcis.io/extensions/common/core/dpp-operational-context.jsonld`
(source: `extensions/common/core/context/dpp-operational-context.jsonld`). It
aggregates the DPP core + regulation module contexts and adds the EN 18223
header-term aliases (`digitalProductPassportId` → `oec:passportIdentifier`,
`granularity` → `oec:granularityLevel`, …). Attaching this single IRI to the
compact master-data body turns it into JSON-LD that expands to the product RDF.

## Writing (POST / PUT / PATCH)

The write methods accept the **operational JSON-LD** — the same form reads emit —
so a client can read a passport, edit it, and write it straight back:

- `POST /v1/dpps` — create. Accepts operational JSON-LD (bare `elementId` keys +
  operational `@context`) or plain GS1 Web Vocabulary JSON-LD; both expand to the
  same graph.
- `PUT /v1/dpps/{id}` — full idempotent replace with a complete operational
  passport.
- `PATCH /v1/dpps/{id}` — partial merge in the same operational form.

All three consume `application/json`, `application/ld+json` (and `PATCH` also
`application/merge-patch+json`). A JSON-LD request body is read as UTF-8.

## Discovery

- `OPTIONS /v1/dpps/{id}` returns the supported media types, methods, and
  `representation` values.
- An unsupported `Accept` yields `406 Not Acceptable` with the variant list.
- The full contract is in the OpenAPI document (`/q/openapi`).

## Access

The same access redaction (`filterForRead`) is applied to every representation,
so the operational / JSON-LD / RDF tiers carry exactly the allowed subset of
properties — never more than the compressed/expanded JSON.

## Round-trip guarantee

Two guarantees hold:

1. **Byte fidelity** — the operational / compressed form echoes the stored body
   verbatim, so `GET → PUT → GET` returns the identical body (modulo the
   per-request `lastUpdated` stamp), with the producer's exact shape preserved
   (scalar/array/object). Safe to read, edit, and write straight back.
2. **Graph fidelity** — the operational JSON-LD expands to the **same** RDF graph
   as the master-data body under URDNA2015 canonicalization; Turtle re-serializes
   that same graph.

Enforced by:

- `scripts/en18223/roundtrip-check.ts` (graph fidelity): `expand(operational ⊕
  context)` ≡ `expand(POST /products body)`, and Turtle → parse-back ≡ the graph.
- `scripts/en18223/idempotence-check.ts`: the §5.2 `compress` normalization (used
  for the fine-granular element endpoints) is a fixed point across every product
  example. Runs in `pnpm run build` and CI.
- `En18223FormatsTest` (Java): the live endpoints return operational JSON-LD +
  context, `operational == compressed`, `GET → PUT → GET` byte-faithful, XML
  (Annex B + expanded), Turtle/N-Quads, OPTIONS discovery, and 406.

Run the reference gates:

```bash
pnpm run check:idempotence
pnpm exec tsx scripts/en18223/roundtrip-check.ts \
  extensions/eu/textile/examples/organic-tee-product.jsonld \
  extensions/eu/battery/examples/battery-product.jsonld
```

## Examples

```bash
# Compressed JSON (the payload, dictionary external — closest to POST /products)
curl -H 'Accept: application/json' \
  'https://api.demo.epcis.cloud/v1/dpps/{id}?representation=compressed'

# Operational JSON-LD (same payload + @context, self-describing)
curl -H 'Accept: application/ld+json' 'https://api.demo.epcis.cloud/v1/dpps/{id}'

# Compressed XML (Annex B)
curl -H 'Accept: application/xml' \
  'https://api.demo.epcis.cloud/v1/dpps/{id}?representation=compressed'

# Expanded XML (Annex A analogue)
curl -H 'Accept: application/xml' \
  'https://api.demo.epcis.cloud/v1/dpps/{id}?representation=expanded'

# Turtle
curl -H 'Accept: text/turtle' 'https://api.demo.epcis.cloud/v1/dpps/{id}'

# Annex A expanded JSON
curl 'https://api.demo.epcis.cloud/v1/dpps/{id}?representation=full'

# What can I get?
curl -X OPTIONS 'https://api.demo.epcis.cloud/v1/dpps/{id}'
```
