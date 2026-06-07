# EN 18223 / EN 18222 alignment spec (Phase B work list)

This document records, but does not yet implement, the deltas to align
the `dpp:` core ontology and the OpenEPCIS API surface with the EN 18223
information model and the EN 18222 API. It is the backlog for a later
implementation pass. The vocabulary is Preview v0.9.6, so renames and
value changes are safe (no published consumers to break).

Citations are to clause numbers of the licensed CEN standards; no
substantial text is reproduced. See
[`CEN_JTC24_CONFORMANCE.md`](./CEN_JTC24_CONFORMANCE.md) for the
clause-by-clause conformance narrative.

> **Implementation status (2026-06-06): Phase B slice 1 done.** §1
> (DigitalProductPassport attributes + EN JSON keys), §3 (dppStatus
> reconciliation), and the granularity value alignment (string
> model/batch/item) are implemented in `dpp-core.ttl`, `dpp-core-context.jsonld`,
> the core validation (JSON Schema + SHACL), the regenerated JSON, and the
> battery example/context/shapes; 66 examples validate with 0 errors.
> **Update (2026-06-06): Phase B slice 2 done.** §4 DataElement model
> implemented in `dpp-core.ttl` (`dpp:DataElement` + subclasses, `elementId`,
> `dictionaryReference`, `valueDataType`, `value`, `multiLanguageValue`,
> `language`), `dpp:DocumentReference` documented as the EN 18223
> RelatedResource, plus a worked envelope example
> `extensions/common/core/examples/en18223-passport.jsonld` (validates).
>
> **Update (2026-06-06): §2 derivation rule added.** The GS1-AI granularity
> consistency rule is now a published SHACL `sh:sparql` constraint
> (`dpp-sh:GranularityDigitalLinkConstraint`) in `dpp-core-shapes.ttl`. It is
> not executed by the repo's JSON-Schema example validator, so it is exercised
> by SHACL-capable consumers (Event Sentry / repository).
>
> **Update (2026-06-06): §4 converter done.** EN 18223 defines two
> serializations: *compressed* (key-value, clauses 5.2.6 to 5.2.9, which is our
> GS1 WebVoc JSON-LD minus `@context`) and *expanded* (Annex A:
> `elements[]` of `{elementId, objectType, dictionaryReference, valueDataType,
> value}`, plain JSON). `scripts/derive-en18223.ts` (npm `derive:en18223`)
> derives the expanded Annex A form from good GS1 + Digital Link JSON-LD:
> `dictionaryReference` = the property IRI (via `jsonld.expand`),
> `valueDataType` = the coerced literal type or the ontology `rdfs:range` or an
> inferred type, `objectType` inferred from the value shape (scalar →
> SingleValued; scalar array → MultiValued; `[{value,language}]` →
> MultiLanguage; `gs1:QuantitativeValue` and nested objects → DataElementCollection;
> DocumentReference → RelatedResource), and `granularity` derived from the
> Digital Link AIs. Examples: `extensions/common/core/examples/en18223-passport.compressed.jsonld`
> (input) and `…expanded.json` (output). Enum case: lowercase per the
> authoritative prose (clause 4.1.1), even though some Annex A examples render
> values title-case. A self-contained client-side demo page
> (`demos/en18223-converter/`, npm `demo:en18223`) shows the derivation live;
> the converter logic is split into a browser-safe core
> (`scripts/en18223/derive-core.ts`) shared by the CLI and the demo.
>
> **Remaining:** RelatedResource `resourceTitle` field on `dpp:DocumentReference`
> (§4), change management (§5), the EN 18222 API surface + Bruno requests (§6),
> and the productised Quarkus converter (follow-up).

**Action legend:** *aligned* (no change) · *rename* · *add* ·
*reconcile-values* · *serialise* (projection rule, no new class needed) ·
*new-class*.

---

## 1. DigitalProductPassport attributes (EN 18223:2026, 4.1.2.1, Table 1)

| EN 18223 attribute | Card. | Current `dpp:` term | Action |
|--------------------|-------|---------------------|--------|
| `digitalProductPassportId` (URI) | 1 | `dpp:passportIdentifier` | rename/align to the EN name; require URI form |
| `uniqueProductIdentifier` (per EN 18219) | 1 | the GS1 key / Digital Link (e.g. `gs1:gtin`) | add an explicit `dpp:uniqueProductIdentifier` carrying the Digital Link; keep `gs1:gtin` |
| `granularity` (model/batch/item) | 1 | `dpp:granularityLevel` | aligned (values match); add derivation + validation from GS1 AIs (see §2) |
| `dppSchemaVersion` | 1 | (none) | add `dpp:schemaVersion`. NOTE: this is the **schema** version, distinct from our content `dpp:passportVersion` |
| `dppStatus` | 1 | `dpp:passportStatus` → `dpp:PassportStatus` | reconcile-values (see §3) |
| `lastUpdated` (ISO 8601 UTC) | 1 | `dpp:passportLastModified` | rename/align; require ISO 8601 UTC |
| `economicOperatorId` (per EN 18219) | 1 | `dpp:economicOperatorId` | aligned; ensure EN 18219 format |
| `facilityId` (per EN 18219) | 0..1 | `dpp:FacilityInformation` (+ GLN) | add a direct `dpp:facilityId` literal per EN 18219 |
| `contentSpecificationIds` | 0..* | (none explicit) | add `dpp:contentSpecificationId`; populate from the declared regulation/module specs (mirrors the `GS1-Extensions` namespaces) |
| `{DataElement}` | 0..* | named `dpp:`/module properties | serialise (see §4) |

Notes:
- EN 18223 has **no content-version attribute**; versioning is achieved
  through archiving (EN 18221). Our `dpp:passportVersion` /
  `dpp:previousPassportVersion` / `dpp:passportIssueDate` /
  `dpp:passportExpiryDate` / `dpp:passportIssuer` are EPCIS4DPP additions
  that support the archiving requirement. Keep them; do not conflate with
  `dppSchemaVersion`.

## 2. Granularity derived from the GS1 Digital Link (EPCIS4DPP rule)

`granularity` is not independent in EPCIS4DPP; it is a function of the
GS1 Application Identifiers present on the `uniqueProductIdentifier`:

| Digital Link pattern | AIs | granularity |
|----------------------|-----|-------------|
| `01/{gtin}` | 01 | model |
| `01/{gtin}/10/{lot}` | 01 + 10 | batch |
| `01/{gtin}/21/{serial}` | 01 + 21 | item |

AI `22` (consumer product variant) refines the model. *Action (add):* a
SHACL/JSON-Schema rule that derives `dpp:granularityLevel` from the AIs
and rejects a mismatch, and enforces EN 18219 (4.4) consistency (level
fixed once on the market; a granularity change needs a new identifier).

## 3. dppStatus reconciliation (EN 18223 Table 1)

EN 18223 example values: `active`, `inactive`, `archived`, `invalid`
(extensible "by relevant legal acts"). Current `dpp:PassportStatus`:
`Draft`, `Active`, `Updated`, `Withdrawn`, `Archived`, `Suspended`.

| EN 18223 value | EPCIS4DPP mapping | Action |
|----------------|-------------------|--------|
| `active` | `dpp:Active` | align casing/value |
| `inactive` | `dpp:Suspended` (and pre-market `dpp:Draft`) | map |
| `archived` | `dpp:Archived` | align |
| `invalid` | `dpp:Withdrawn` (terminal) | map |
| (none) | `dpp:Updated` | drop or demote; EN 18223 uses `lastUpdated`, not a status, to mark updates |

*Action (reconcile-values):* expose the four EN base values as the
canonical set, retain our extra states as profile extensions
(permitted by "further values by legal acts"), and document the mapping.
Decide whether `dpp:Updated` is removed (recommended) since `lastUpdated`
already conveys it.

## 4. DataElement model (EN 18223, 4.1.2.3 to 4.1.2.9)

EN 18223 wraps every data point in an abstract `DataElement` envelope
(`elementId`, optional `dictionaryReference`) with concrete subclasses:
`DataElementCollection`, `SingleValuedDataElement`,
`MultiValuedDataElement`, `RelatedResource`, `MultiLanguageDataElement`.

Our ontology uses named RDF properties directly rather than a generic
envelope. The two are bridged by `dictionaryReference`:

- *serialise:* provide an EN 18223 JSON projection that wraps each value
  as a `DataElement` whose `dictionaryReference` is the OpenEPCIS term
  IRI (e.g. `https://ref.openepcis.io/extensions/eu/battery/ratedCapacity`)
  and whose `valueDataType` is the XSD type from the ontology. No new
  ontology classes are strictly required for this.
- *add (optional):* mirror classes (`dpp:DataElement` and subclasses) if
  we want the envelope expressible natively in RDF as well.
- `valueDataType` follows the EN 18223 (4.1.2.9) XSD-to-JSON rules
  (string-list XSD types and NOTATION/QName excluded; base64 allowed).
  Document this mapping for validators.

### RelatedResource (4.1.2.7) vs `dpp:DocumentReference`

| EN 18223 RelatedResource | Current `dpp:DocumentReference` | Action |
|--------------------------|----------------------------------|--------|
| `contentType` (IANA MIME) | (via `gs1:` referenced-file type) | add `contentType` |
| `url` (RFC 3986) | document URL | align |
| `language` (ISO 639 + ISO 3166-1) | (none) | add `language` |
| `resourceTitle` | title | align |

### MultiLanguage (4.1.2.8)

`MultiLanguageDataElement` / `MultiLanguageValue` (language + value).
*Action:* ensure multilingual values are expressible (RDF language tags
satisfy the model; provide the EN 18223 projection on serialisation).

## 5. Change management (EN 18223, 4.2)

Track per change: identifier, timestamp, actor (per EN 18239),
changed properties; archive per EN 18221. *Action:* either a change-log
structure on the passport, or derive it from the EPCIS event history plus
`dpp:passportLastModified`/version chain. Actor identity waits on
EN 18239 (access rights), still in development.

## 6. EN 18222 API surface to expose (Phase B)

Abstract methods (EN 18222 Clauses 4 to 6); REST-HTTP mapping in Clause 8.
The payload is the EN 18223 model; transport/serialisation per EN 18216;
access/security per EN 18246.

| Method | Purpose | Proposed endpoint (per Clause 8 style) |
|--------|---------|----------------------------------------|
| `ReadDPPById` | DPP by DPP id | `GET /v1/dpps/{dppId}` |
| `ReadDPPByProductId` | current active DPP by product id | `GET /v1/dppsByProductId/{productId}` |
| `ReadDPPVersionByIdAndDate` | DPP version at a date | `GET /v1/dppsByIdAndDate/{dppId}?date={ts}` |
| `ReadDPPIdsByProductIds` | discovery (paginated) | `POST /v1/dppsByProductIds` (`limit`/`cursor`) |
| `ReadDataElement` | single element by path | `GET /v1/dpps/{dppId}/elements/{path}` |
| `CreateDPP` | create | `POST /v1/dpps` |
| `UpdateDPPById` | partial update (archive per EN 18221) | `PATCH /v1/dpps/{dppId}` |
| `UpdateDataElement` | update one element | `PATCH /v1/dpps/{dppId}/elements/{path}` |
| `DeleteDPPById` | delete (end of life) | `DELETE /v1/dpps/{dppId}` |
| `RegisterProductDPP` | register at the DPP registry | `POST /v1/registry` (`DppRegistryEntry` → registrationId) |

Conventions from the standard: element paths use RFC 9535 JSONPath;
in-path `dppId` is percent-encoded; an optional `representation=compressed|full`
flag; each method returns a `statusCode`; content negotiation per EN 18216.

**EPCIS4DPP additions (beyond EN 18222):** the GS1 Digital Link resolver
(carrier-to-resource discovery, RFC 9264 linksets) and the EPCIS 2.0
query interface (event-level search by EPC, business step, disposition,
location, time) sit alongside this API, not inside it.

## 7. ref.openepcis.io as the EN 18223 (4.3) data dictionary

No change needed to the principle: our term IRIs already satisfy the 4.3
repository requirements (unique identifier, single occurrence, resolvable,
cross-catalogue mapping via `owl:equivalentClass`/`owl:equivalentProperty`).
*Action (document):* state this role explicitly on ref.openepcis.io and in
the module READMEs, and ensure every published term is dereferenceable as a
`dictionaryReference`.

---

## Phase B execution order (suggested)

1. `dpp:` core attribute alignment (§1) + `dppStatus` reconciliation (§3) in TTL, context, JSON, validation.
2. Granularity-from-AI derivation + consistency validation (§2).
3. RelatedResource/DocumentReference + MultiLanguage alignment (§4).
4. EN 18223 JSON projection (serialise) + XSD-to-JSON value rules (§4).
5. EN 18222 API surface (§6) + Bruno requests; content negotiation + carrier-quality notes.
6. Revisit change management (§5) and actor identity when prEN 18239 / prEN 18246 publish.

---

*OpenEPCIS DPP-Ready · EN 18223/18222 alignment spec · 2026 · Apache-2.0*
