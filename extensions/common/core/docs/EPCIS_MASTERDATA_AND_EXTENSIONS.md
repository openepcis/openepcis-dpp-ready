# EPCIS Master Data, Extensions, and Linked Data

How to correctly structure DPP data in EPCIS events, master data files,
and as RDF linked data. This is the authoritative reference for all
OpenEPCIS DPP-Ready examples and implementations.

> **Sources:**
> - [EPCIS 2.0 Standard](https://ref.gs1.org/standards/epcis/) — Sections 6.3 (Extension Mechanisms), 9.1 (XML Extensibility), 12.3 (GS1-Extensions header)
> - [GS1 Germany EUDR Implementation Guideline V1.11](https://www.gs1-germany.de/fileadmin/gs1/fachpublikationen/GS1_Germany_EUDR_Guideline_V1.11.pdf) — Section 4.2 (masterDataAvailableFor examples)
> - [EPCIS JSON-LD Context](https://ref.gs1.org/standards/epcis/epcis-context.jsonld)
> - [GS1 Web Vocabulary](https://ref.gs1.org/voc/)
> - [EPCIS Artefacts](https://ref.gs1.org/standards/epcis/artefacts)

---

## 1. The Three Angles

Every artefact in this project must be correct from three perspectives
simultaneously. Getting one right but breaking another is not acceptable.

### Angle 1: EPCIS Events (event log layer)

EPCIS events capture **what happened** — the who/what/when/where/why of
supply chain visibility. The EPCIS standard defines strict rules for
where data goes inside an event.

### Angle 2: Master Data Files (GS1 WebVoc layer)

Standalone JSON-LD documents that describe **what something is** — product
attributes, organization details, location information. Served via GS1
Digital Link resolver (content negotiation) or as Regulatory Notification
messages.

### Angle 3: RDF / Ontology (linked data layer)

Every JSON-LD document IS an RDF graph. It must expand to valid triples,
be queryable via SPARQL, and validateable via SHACL. This is not optional
— it's the foundation that makes everything interoperable.

---

## 2. EPCIS Events — Extension Rules

### 0. Namespace prefix rule (canonical)

**Principle.** A bare term means `gs1:` — the GS1 Web Vocabulary is the ambient
default. We rely on that implicit behaviour in exactly **one** place:
`masterDataAvailableFor`, a self-contained GS1 master-data card. **Everywhere else
no namespace is left implicit:** every vocabulary term — `gs1:` included — is
written with its prefix, so a reader sees where each field originates.

| Location | Prefix rule |
|---|---|
| EPCIS event-model / CBV fields (`type`, `eventTime`, `action`, `bizStep`, `disposition`, `epcList`, `readPoint`, `ilmd`, `quantityList`, `sensorElementList`, `value`, `uom`, …) | **Bare always.** These are EPCIS structural terms (the `epcis:`/`cbv:` namespaces), not GS1/extension vocabulary. Never prefix them — `epcis:ilmd` is RDF-equivalent but breaks EPCIS schema conformance. |
| `masterDataAvailableFor` (key is bare) | INSIDE: gs1 property keys **bare**, gs1 class `type`/`id` values **bare**, extension keys **prefixed**. |
| `ilmd` (the contents) | **All** vocabulary terms prefixed incl. `gs1:` — `gs1:bestBeforeDate`, `gs1:catchZone`, `eutex:isRecycledFiber`. The `ilmd` key itself stays bare (it is EPCIS-structural). |
| Event-level extension properties | Prefixed (`eubat:incidentSeverity`, `eudr:riskLevel`). |
| Standalone product / DPP master-data files | **All** terms prefixed incl. `gs1:` — `gs1:productName`, `eubat:batteryChemistry`; `type: ["gs1:Product", "eubat:Battery"]`. |

**How clean values are kept.** Each module `@context` defines, for every coerced
term, BOTH a bare alias and a prefixed-form alias carrying the same coercion (e.g.
`"gs1:harvestDateStart": {"@id": "gs1:harvestDateStart", "@type": "xsd:date"}`). So
`"gs1:harvestDateStart": "2026-02-16"` keeps its `xsd:date` typing while staying a
simple scalar — the prefix is visible on the key, the value stays clean. (A raw
CURIE key without this alias would silently drop the coercion.) These aliases are
generated: edit the TTL (or `.context-overrides.json` for non-derivable hints) and
re-run `pnpm run build:context`, which rewrites `{name}-context.jsonld` in place.

**Legitimately-bare exceptions** (prefixing them would change the RDF, so they stay
bare): EPCIS-structural terms (above); a term shadowed by two namespaces in one
document (e.g. `materialComposition` when both `oec:` and `eubat:` contexts load);
synonym aliases that collapse onto one IRI (`shortName` + `fullName` → `schema:name`);
and open-vocabulary enum values not defined in the term's scoped `@context`. When in
doubt, the test is RDF identity: a rename is allowed only if expansion is unchanged.

### A. `masterDataAvailableFor` — item/lot-level master data only

`masterDataAvailableFor` embeds **item- or lot-level master data** for an
identifier referenced in the event. It is **not** a full product/party/location
card. **Granularity decides placement, not vocabulary:**

- **Model/SKU-level** attributes (intrinsic to the GTIN — identical for every
  unit ever made) and **party/location** master data (the GLN's name, address,
  the organization behind a party GLN) are **resolver-served**: a consumer
  dereferences the GTIN / GLN / party URI against a GS1 Digital Link / Web
  Vocabulary master-data service to obtain them. They must **not** be embedded
  in the event — the event already carries the URI.
- Only data that varies **per serialized item or per production lot** — data a
  model-level resolver could not supply — travels in `masterDataAvailableFor`.

The key itself is an EPCIS-context term, written **bare**.

**Rules:**
- The `id` (`@id`) in each entry MUST match an identifier already present in the
  event (`epcList`, `parentID`, etc.). In practice the only entries are
  `/01/.../21|10/...` (item/lot) Product cards.
- Include only item/lot-level attributes. GS1 keys and `gs1:`-class `type`/`id`
  values are written **bare** (resolved via the EPCIS `@vocab`); extension-
  namespaced lot/item properties (`eudr:`, `eutex:`, …) **keep** their prefix.
- Do **not** add `Place` or `Organization` (GLN/party) entries — reference those
  by their `/414/` and `/417/` URIs in `readPoint`/`bizLocation`/`sourceList`/
  `destinationList`; their master data is resolver-served.

**By granularity:**

- **YES (item/lot-level)** — `gs1:countryOfOrigin` (where *this lot* was made),
  `gs1:regulatoryInformation` (compliance asserted for *this lot/consignment*),
  `gs1:harvestDate` / `harvestDateStart` / `harvestDateEnd` / `productionDate`,
  EUDR plot geolocation (`geo`, `eudr:areaHectares`, `eudr:forestManagementUnit`),
  `eudr:deforestationFreeDate` / `legallyHarvested` / `riskLevel` / `verificationMethod`,
  the EUDR consignment commodity & species (`eudr:commodityType`,
  `eudr:timberProductType`, `eudr:speciesScientificName`, `eudr:speciesCommonName`
  — traceability that travels with the lot), `recycledContent` of *this* run, a
  lot-/instance-measured `oec:emissionsPerformance` / `oec:circularityPerformance`,
  and other lot-level extension attributes.
- **NO (model/SKU-level → resolver)** — `productName`, `netWeight`,
  `schema:category`, `gtin`/`serialNumber` echoes, `eubat:batteryChemistry`/
  `ratedCapacity`, `eutex:fabricType`/`apparelSubcategory`,
  `euppwr:packagingTier`/`recyclabilityGrade`, model identifiers. These
  describe the GTIN; dereference it instead.
- **NO (party/location → resolver)** — organization names, GLNs, addresses,
  physical-location names. Dereference the `/414/` or `/417/` URI.
- **NO (observation → event level)** — sensor readings, lab/test results,
  per-event assertions. Those are event-level extension properties (§B).

### B. Extension Properties — at event level

Properties from our DPP extension vocabularies that describe
**observation-specific data** (data that varies per event) go at the
**event level** — as siblings of `bizStep`, `epcList`, `readPoint`, etc.

**Rules:**
- Placed as user extension fields directly on the event object.
- MUST be properly prefixed (e.g., `eudr:riskLevel`,
  `eubat:incidentSeverity`, not bare `riskLevel` / `incidentSeverity`).
- Declared via `GS1-Extensions` HTTP header (see Section 5).
- Declared via additional `@context` entries in the JSON-LD document.
- In XML binding: appear in the `<extension>` element
  (EPCIS 2.0 Section 9.1).

**Why event-level?** These properties describe domain-specific
observations or assertions made at the time of the event. They are part
of the event's semantics, not part of the product's master data card.

**Examples** — legitimately event-level:
- `eudr:riskLevel`, `eudr:verificationMethod`,
  `eudr:deforestationFreeDate` on a `notifying` event — observations
  specific to the due-diligence notification.
- `euelec:repairType`, `euelec:repairTechnician`,
  `euelec:warrantyStatus` on a repair event — specific to the repair
  action.
- `eubat:incidentSeverity` on a negative event.
- `eutex:environmentalFootprint`, `eutex:substancesOfConcern`,
  `eutex:robustnessAssessment` on an observation event — laboratory
  test results reported at that observation.

### C. ILMD (Instance/Lot Master Data) — lot-level only

ILMD describes master data of **items/lots being created** that applies
to every item in the event's `epcList` / `outputQuantityList`. It
applies to:

- `ObjectEvent` with `action: ADD` only.
- `TransformationEvent` (for output items).
- EPCIS 2.0 §7.3.8 **forbids** ilmd on `action: OBSERVE` or `action: DELETE`.

**ILMD is for lot-level data** — attributes of the specific batch/lot
being commissioned, not attributes of the GTIN itself. For example:

- **YES (lot-level)** — `gs1:bestBeforeDate` for this production run,
  `gs1:catchZone` for this fishing trip,
  `eutex:isRecycledFiber` + `eutex:recycledContentSource` for this
  yarn batch, a sensor reading captured at commissioning time.
- **NO (model/SKU-level)** — `eubat:batteryChemistry`, `schema:category`,
  `eutex:fabricType`, `eudr:commodityType`. These describe the GTIN (identical
  for every lot of the same SKU), so they are **resolver-served** and embedded
  nowhere in the event — neither in `ilmd` nor in `masterDataAvailableFor`.

**Rule of thumb:** If the value would be identical across every batch of the
same GTIN, it is model-level → **do not embed it** (a consumer dereferences the
GTIN to get it). If the value is specific to this batch (harvest date, recycled-
input lot, heat number, test-certificate number), embed it: in **`ilmd`** for the
items the event *creates* (ADD / Transformation), or in **`masterDataAvailableFor`**
as lot/item master data for a *referenced* identifier.

Do NOT confuse:
- `masterDataAvailableFor` — item/lot-level master data for identifiers
  referenced by the event; applies to any event type/action.
- `ilmd` — lot/instance master data for newly-created items; only on
  ADD / Transformation.

---

## 3. Master Data Files — WebVoc Pattern

Standalone JSON-LD documents served via GS1 Digital Link resolver when
someone dereferences a GTIN or GLN URI. Also used in Regulatory
Notification messages.

**In these documents**, extension properties CAN coexist alongside `gs1:`
properties because the document IS the product description — it's not
inside an EPCIS event structure.

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld",
    { "gs1": "https://ref.gs1.org/voc/" }
  ],
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
  "type": ["gs1:Product", "eubat:Battery"],
  "gs1:productName": "EV Battery Pack 280Ah LFP",
  "gs1:manufacturer": { ... },
  "gs1:regulatoryInformation": [{ ... }],
  "eubat:batteryChemistry": "LFP",
  "eubat:ratedCapacity": { ... },
  "oec:carbonFootprintTotal": 42.5
}
```

This is the **resolver-served** standalone master-data document — what a
consumer gets by dereferencing the GTIN/GLN URI (On-Demand Data Retrieval,
GS1 Germany EUDR Guideline V1.11). Model/SKU-level attributes
(`gs1:productName`, `eubat:batteryChemistry`, `eubat:ratedCapacity`, …) live
**here**, not in the event. An EPCIS event references the GTIN by URI and lets
this document supply those attributes; `masterDataAvailableFor` in the event
adds only the item/lot-level deltas the resolver can't know (see §A).

---

## 4. RDF / Linked Data Correctness

Every JSON-LD file in this project must:

1. **Expand to valid RDF triples** — test with [json-ld.org/playground](https://json-ld.org/playground/)
2. **Resolve all CURIEs** — every property key must expand to a full URI
   via `@context`. Orphaned keys (missing from context) are bugs.
3. **Pass SHACL validation** — our shapes in `{module}/validation/*-shacl.ttl`
   validate the RDF graph
4. **Be consumable by RDF tools** — `rapper -i jsonld`, Apache Jena,
   Protégé, SPARQL endpoints
5. **Dereference namespace URIs** — `https://ref.openepcis.io/extensions/common/core/`
   should resolve to the ontology definition (via ref.openepcis.io)

**Testing checklist:**
```bash
# Validate JSON syntax
python3 -c "import json; json.load(open('file.jsonld'))"

# Validate TTL syntax (for ontology files)
rapper -c -i turtle file.ttl

# Test RDF expansion (manual — paste into json-ld.org/playground)
# Verify: all properties expand to full URIs, no orphaned keys
```

---

## 5. GS1-Extensions HTTP Header

Per EPCIS 2.0 Standard Section 12.3, the `GS1-Extensions` header declares
which extension namespaces a server supports.

**Format:** `name=uri` pairs, comma-separated

**OpenEPCIS DPP extensions:**
```http
GS1-Extensions: oec=https://ref.openepcis.io/extensions/common/core/,eubat=https://ref.openepcis.io/extensions/eu/battery/
```

**Full set (all modules):**
```http
GS1-Extensions: oec=https://ref.openepcis.io/extensions/common/core/,eubat=https://ref.openepcis.io/extensions/eu/battery/,eudr=https://ref.openepcis.io/extensions/eu/eudr/,eutex=https://ref.openepcis.io/extensions/eu/textile/,euelec=https://ref.openepcis.io/extensions/eu/electronics/,eudet=https://ref.openepcis.io/extensions/eu/detergent/
```

**Where it appears:**
- Request header on `/capture` (POST) — client declares which extensions the payload uses
- Response header on OPTIONS — server declares which extensions it supports
- Response header on GET — server declares which extensions appear in the returned data

**Relationship to `@context`:** The `GS1-Extensions` header is the HTTP-level
declaration. The `@context` array in the JSON-LD body is the semantic-level
declaration. Both must be consistent — every namespace in the header should
have a corresponding context entry, and vice versa.

---

## 6. Complete Worked Example

### EPCIS Event (Angle 1 + 3)

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld"
  ],
  "type": "EPCISDocument",
  "schemaVersion": "2.0",
  "creationDate": "2025-01-20T12:00:00.000Z",

  "epcisBody": {
    "eventList": [{
      "type": "ObjectEvent",
      "eventID": "urn:uuid:550e8400-e29b-41d4-a716-446655440021",
      "eventTime": "2025-01-20T10:00:00.000Z",
      "eventTimeZoneOffset": "+01:00",
      "action": "OBSERVE",
      "bizStep": "notifying",
      "persistentDisposition": {
        "set": ["subject_to_regulation"]
      },

      "epcList": [
        "https://id.gs1.org/01/09521234000020/10/LOT-2025-001"
      ],

      "readPoint": {
        "id": "https://id.gs1.org/414/9521234000006"
      },

      "masterDataAvailableFor": [
        {
          "id": "https://id.gs1.org/01/09521234000020/10/LOT-2025-001",
          "regulatoryInformation": [{
            "regulationType": "DEFORESTATION_REGULATION",
            "regulatoryAct": "EU 2023/1115",
            "isRegulationCompliant": true,
            "regulatoryIdentifier": [{
              "regulatoryReferenceNumber": "EUIS-2025-DE-00012345",
              "regulatoryIdentifierType": "DUE_DILIGENCE_STATEMENT"
            }]
          }],
          "countryOfOrigin": {
            "countryCode": "DE"
          },
          "harvestDate": "2025-01-15"
        }
      ],
      "_note": "Only lot-level fields here. productName is model-level (resolver-served via the GTIN); the /414/ head-office location is resolver-served via its GLN in readPoint — neither is embedded.",

      "eudr:commodityType": "Wood",
      "eudr:speciesScientificName": "Quercus robur",
      "eudr:speciesCommonName": "European Oak",
      "eudr:deforestationFreeDate": "2025-01-15",
      "eudr:legallyHarvested": true,
      "eudr:riskLevel": "Low",
      "eudr:verificationMethod": "On-site inspection combined with satellite imagery analysis",

      "sourceList": [{
        "type": "urn:epcglobal:cbv:sdt:owning_party",
        "source": "https://id.gs1.org/417/9521234000006"
      }]
    }]
  }
}
```

**HTTP headers for this capture:**
```http
POST /capture HTTP/1.1
Content-Type: application/ld+json
GS1-Extensions: oec=https://ref.openepcis.io/extensions/common/core/,eudr=https://ref.openepcis.io/extensions/eu/eudr/
GS1-EPCIS-Version: 2.0
GS1-CBV-Version: 2.0
```

### The same product as a standalone master data file (Angle 2 + 3)

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld",
    { "gs1": "https://ref.gs1.org/voc/" }
  ],
  "id": "https://id.gs1.org/01/09521234000020/10/LOT-2025-001",
  "type": "gs1:Product",
  "gs1:productName": { "en": "European Oak Round Wood - Grade A" },
  "gs1:countryOfOrigin": { "gs1:countryCode": "DE" },
  "gs1:harvestDate": "2025-01-15",
  "gs1:regulatoryInformation": [{
    "gs1:regulationType": "DEFORESTATION_REGULATION",
    "gs1:regulatoryAct": "EU 2023/1115",
    "gs1:isRegulationCompliant": true
  }],
  "eudr:commodityType": "Wood",
  "eudr:speciesScientificName": "Quercus robur",
  "eudr:speciesCommonName": "European Oak",
  "eudr:deforestationFreeDate": "2025-01-15",
  "eudr:legallyHarvested": true
}
```

Note: In the EPCIS event, `regulatoryInformation` is unprefixed (resolves
to `gs1:regulatoryInformation` via the EPCIS context's `@vocab`). In the
standalone master data file, it's explicitly `gs1:regulatoryInformation`
because the EPCIS context is not loaded.

---

## 7. Common Mistakes to Avoid

### Mistake 1: Model-level (or party/location) data inside masterDataAvailableFor

```json
"masterDataAvailableFor": [{
  "id": "https://id.gs1.org/01/.../10/LOT-001",
  "regulatoryInformation": [...],       // ← OK: lot-level
  "eudr:deforestationFreeDate": "...",  // ← OK: lot-level extension attribute
  "productName": { "en": "..." },       // ← WRONG: model-level → resolver-served via the GTIN
  "eudr:commodityType": "Wood"          // ← WRONG: model-level (describes the product type)
}]
```

`masterDataAvailableFor` holds **item/lot-level** data only — `gs1:` (bare) or
extension-prefixed alike. Model/SKU-level attributes and `Place`/`Organization`
(GLN) cards are resolver-served: drop them and let the GTIN/GLN URI resolve.

### Mistake 2: Unprefixed extension properties

```json
"commodityType": "Wood"    // ← WRONG: resolves to gs1:commodityType (doesn't exist)
```

Fix: Use `eudr:commodityType` with proper prefix.

### Mistake 3: Missing @context for extensions

```json
{
  "@context": "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
  ...
  "eudr:commodityType": "Wood"  // ← WRONG: eudr: prefix not declared in context
}
```

Fix: Add extension context to the `@context` array.

### Mistake 4: Confusing masterDataAvailableFor with ILMD

- `masterDataAvailableFor` = provides master data for identifiers in the event.
  Works on any event type and action.
- `ilmd` = instance/lot master data for newly created items. Only on
  ObjectEvent (action=ADD) or TransformationEvent.

---

## 8. Inline Comments: `_comment_architecture` and `_comment`

The project uses two JSON-LD-safe comment conventions in example files:

- **`_comment_architecture`** — a document-level array of short strings at
  the top of each EPCIS example, describing the *architectural intent*
  (what this event demonstrates, where each kind of data sits, which
  `GS1-Extensions` header to send, which GCP prefix is used, etc.).
- **`_comment`** — a single-string inline note embedded near the data it
  explains, e.g. inside a `sensorReport` entry to pin the unit of measure
  in prose.

**Why the leading underscore?** Keys that start with `_` are not declared
in any `@context` and therefore get **dropped during JSON-LD expansion** —
they produce no RDF triples. That makes them safe to leave in example
files: a JSON-LD processor, a SHACL validator, or an EPCIS repository sees
them as inert. Do **not** rename these to `description`: `description` is
likely to resolve to `schema:description` or `dcterms:description` via
ambient contexts and would leak into the graph.

**Rule:** `_comment_architecture` text must not reinforce anti-patterns —
for example it must not say "`gs1:masterDataAvailableFor` contains ONLY
gs1: properties" (the key itself has no `gs1:` prefix). If you copy an
existing example as a template, keep the underscore convention and make
sure the prose matches the corrected rules in §2A.

---

## References

- [EPCIS 2.0 Standard (PDF)](https://ref.gs1.org/standards/epcis/) — Release 2.0, Ratified Jun 2022
  - Section 6.3: Extension Mechanisms (page 37)
  - Section 7.3.8: ILMD (page 73)
  - Section 9.1: XML Extensibility Mechanism (page 145)
  - Section 12.3: Content Negotiation and GS1-Extensions Header (page 180)
- [EPCIS JSON-LD Context](https://ref.gs1.org/standards/epcis/epcis-context.jsonld)
- [EPCIS Artefacts](https://ref.gs1.org/standards/epcis/artefacts) — SHACL, JSON Schema, Ontology
- [GS1 Web Vocabulary](https://ref.gs1.org/voc/) — `https://ref.gs1.org/voc/`
- [GS1 Germany EUDR Implementation Guideline V1.11](https://www.gs1-germany.de/fileadmin/gs1/fachpublikationen/GS1_Germany_EUDR_Guideline_V1.11.pdf) — 12 January 2026
- [GS1 EUDR Provisional Application Standard](https://ref.gs1.org/standards/eudr/) — artefacts and tools
- [masterDataAvailableFor reference](https://ref.gs1.org/masterDataAvailableFor)
- [JSON-LD Playground](https://json-ld.org/playground/) — test RDF expansion
