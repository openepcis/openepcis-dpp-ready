# Why every module owns a named EPCIS extension

This project registers one named `https://ref.openepcis.io/extensions/...`
namespace per regulatory domain (`battery:`, `eudr:`, `textile:`,
`electronics:`, `detergent:`, `fsma:`) even when — in some cases — the
extension contributes only a single property or an enum. This document
explains why that is deliberate, not incidental.

## 1. It activates regulation-specific behaviour in the EPCIS Repository

EPCIS 2.0 §12.3 defines the **`GS1-Extensions` HTTP header** on every
capture and query request. The header is a comma-separated list of
`prefix=namespace-URI` pairs:

```http
POST /capture HTTP/1.1
Content-Type: application/ld+json
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/,
                eudr=https://ref.openepcis.io/extensions/eu/eudr/,
                fsma=https://ref.openepcis.io/extensions/us/fsma204/
```

An **OpenEPCIS EPCIS Repository** reads this header on every request and
uses the declared extensions to:

- **Select regulation-specific validation profiles.** The repository
  dispatches to the JSON Schema + SHACL shapes published under each
  namespace's `validation/` artefacts, in addition to the base EPCIS
  validation. Without a declared extension the repository has no way to
  know which regulation's rules apply to a given payload.
- **Enable regulation-specific query endpoints and filters.** Declaring
  `eudr=...` or `fsma=...` switches on EUDR / FSMA 204 traceability query
  shortcuts (e.g., "give me every Critical Tracking Event for this TLC",
  "give me every Due Diligence Statement reference for this GTIN").
- **Trigger regulation-specific master-data resolution.** The repository
  can recognise `eudr:` properties in `gs1:masterDataAvailableFor` blocks
  and resolve them against the matching ontology, schema, and SHACL
  artefacts.
- **Attach the right conformance profile to EPCIS documents at rest.**
  Stored events remember which extensions were declared at capture time,
  so downstream readers can re-materialise the correct context and
  validation regime.

Without a dedicated `prefix=namespace` pair, none of this lights up — the
repository sees an event with strange properties and treats them as
unrecognised vendor extensions.

## 2. It keeps your identifiers under your own control

The namespace URI is also the resolvable location of the ontology TTL,
JSON-LD context, generated JSON, JSON Schema, and SHACL shapes. Pointing
at `https://ref.openepcis.io/extensions/us/fsma204/` means:

- The `@context` URI your JSON-LD documents load **never changes** even
  if the community evolves the definitions behind it.
- SPARQL queries against a merged RDF graph remain stable: every
  `fsma:traceabilityLotCode` triple in the world has the same subject /
  predicate regardless of which authoring tool emitted it.
- Tooling consumers (barcodes-to-DPP resolvers, data-quality dashboards)
  can spider the namespace and discover every related artefact.
- Regulators and auditors get a single, dated, Apache-2.0-licensed
  anchor for "what did OpenEPCIS mean by `fsma:Crustaceans` on Day X?"

## 3. It gives us a landing spot when GS1 eventually publishes

Several modules in this repo (notably the EUDR exemption block and the
FSMA 204 CTE classes) are **provisional reference patterns** that mirror
semantics GS1 standardization is still finalising. Owning the namespace means:

- We can ship a working vocabulary today.
- When GS1 publishes its canonical term, we re-map via
  `owl:equivalentClass` / `owl:equivalentProperty` — downstream consumers
  keep using our URIs, and their graphs continue to validate against both
  vocabularies.
- Our CHANGELOG and the per-module `GS1_ALIGNMENT.md` (e.g.,
  [`eudr/docs/GS1_ALIGNMENT.md`](../../../eu/eudr/docs/GS1_ALIGNMENT.md))
  document which terms are canonical-from-GS1, which are gap-filling, and
  which are provisional-pending-GS1-publication.

## 4. It is consistent even when the module is tiny

The `fsma204` module contributes **one property**
(`fsma:foodTraceabilityListCategory`) plus the FTL enum. Every other FSMA
204 KDE already rides on native EPCIS 2.0 / GS1 Web Vocabulary fields per
the GS1 US R2.0 EPCIS guide. We still register a `fsma:` extension
because:

- The FTL enum itself is the "switch" that tells the repository a given
  product is subject to FSMA 204.
- The repository needs to know to apply FSMA-specific CTE KDE validation
  to events that carry FTL-categorised foods.
- The extension declaration tells the capture client and repository that
  FSMA semantics are in play, even though every other field uses GS1
  terms.

## 5. What to declare, concretely

On a capture or query request that carries OpenEPCIS data, always emit
the header for the modules whose terms appear in the payload (including
the core module when `dpp:` terms are present):

```http
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/,
                eudr=https://ref.openepcis.io/extensions/eu/eudr/
```

And always include the matching JSON-LD context URIs in `@context`:

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld"
  ]
}
```

The two must agree. If the header declares an extension, every term from
that namespace used in the document must be resolvable from one of the
context entries, and vice versa.

## References

- EPCIS 2.0 Standard, Section 12.3 "GS1-Extensions HTTP header":
  <https://ref.gs1.org/standards/epcis/>
- [EPCIS_MASTERDATA_AND_EXTENSIONS.md](EPCIS_MASTERDATA_AND_EXTENSIONS.md)
  — where extension properties belong inside an EPCIS event
- [EXTENSION-GOVERNANCE.md](../../../../EXTENSION-GOVERNANCE.md) — when to
  extend GS1 vs. reuse existing terms
- OpenEPCIS EPCIS Repository documentation: <https://openepcis.io/docs/>
