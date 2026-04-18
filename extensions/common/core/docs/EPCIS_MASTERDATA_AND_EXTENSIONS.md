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

### A. `masterDataAvailableFor` — product/party/location master data

`masterDataAvailableFor` is a mechanism to embed **master data about
identifiers** that are referenced elsewhere in the event. It provides the
"product/location/party card" for an EPC, GLN, SSCC, etc. The key itself
is an EPCIS-context term and is written **bare** (no `gs1:` prefix).

**Rules:**
- The `id` (`@id`) in each entry MUST match an identifier already present
  in the event (`epcList`, `readPoint`, `bizLocation`, `parentID`,
  `sourceList`, `destinationList`, etc.).
- Structure is identical to a standalone GTIN/GLN master data file
  (On-Demand Data Retrieval pattern).
- Unprefixed properties resolve to `gs1:` via the EPCIS JSON-LD context's
  `@vocab`. Inside `masterDataAvailableFor` the `gs1:` prefix is
  **implicit** — write GS1 property keys and `gs1:`-class `type` / `id`
  values **bare** (e.g. `productName`, `type: "Product"`,
  `id: "RegulationTypeCode-BATTERY_DIRECTIVE"`).
- Properties from other namespaces (`battery:`, `eudr:`, `textile:`,
  `dpp:`, …) **keep** their namespace prefix. Only `gs1:` is elided.

**Project convention:** `masterDataAvailableFor` entries are strongly
biased towards **GS1 Web Vocabulary properties** — every attribute that has
a native GS1 term MUST use it (written bare). Extension-namespaced
properties (`battery:batteryChemistry`, `textile:fabricType`,
`detergent:detergentCategory`, etc.) are permitted **only for genuinely
product-level attributes that have no GS1 equivalent**. In practice this
means:

- **YES** — `gs1:regulatoryInformation`, `gs1:countryOfOrigin`,
  `gs1:productName`, `gs1:netWeight`, `gs1:manufacturer`,
  `gs1:certification`, `gs1:textileMaterial`, `gs1:harvestDate` etc.
- **YES**, when no GS1 equivalent exists — `battery:batteryChemistry`,
  `battery:batteryCategory`, `textile:textileCategory`,
  `textile:fabricType`, `detergent:detergentCategory`,
  `electronics:deviceCategory`, `eudr:commodityType`,
  `fsma:foodTraceabilityListCategory`. These describe the GTIN itself and
  belong with the other product master data.
- **NO** — observation-specific data (sensor readings, per-event
  disposition, this-shipment-only KDEs). Those go at event level.
- **NO** — lot-specific master data (harvest date of THIS batch, recycled
  content source of THIS yarn run). Those go in `ilmd` on ADD /
  TransformationEvent.

**Reference:** GS1 Germany EUDR Guideline V1.11, Section 4.2 — every EPCIS
example in V1.11 uses `masterDataAvailableFor` with exclusively `gs1:`
properties (pages 23, 29, 30, 34, 35, 42, 44, 46, 48). Our rule is the
same with one narrow carve-out for extension-namespaced
product-classification terms that GS1 has not yet published.

### B. Extension Properties — at event level

Properties from our DPP extension vocabularies that describe
**observation-specific data** (data that varies per event) go at the
**event level** — as siblings of `bizStep`, `epcList`, `readPoint`, etc.

**Rules:**
- Placed as user extension fields directly on the event object.
- MUST be properly prefixed (e.g., `eudr:riskLevel`,
  `battery:incidentSeverity`, not bare `riskLevel` / `incidentSeverity`).
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
- `electronics:repairType`, `electronics:repairTechnician`,
  `electronics:warrantyStatus` on a repair event — specific to the repair
  action.
- `battery:incidentSeverity` on a negative event.
- `textile:environmentalFootprint`, `textile:substancesOfConcern`,
  `textile:robustnessAssessment` on an observation event — laboratory
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
  `textile:isRecycledFiber` + `textile:recycledContentSource` for this
  yarn batch, a sensor reading captured at commissioning time.
- **NO (product-level)** — `battery:batteryChemistry`,
  `textile:textileCategory`, `detergent:detergentCategory`,
  `electronics:deviceCategory`. These describe the GTIN (they are the
  same for every lot of the same SKU) and belong in
  `masterDataAvailableFor` (see §A).

**Rule of thumb:** If the value would be identical across every batch of
the same GTIN, it is **not** ilmd. Put it in the product master data
block. If the value is specific to this batch (different harvest date,
different lot of recycled input, different test-certificate number),
then ilmd is the right place.

Do NOT confuse:
- `masterDataAvailableFor` — product/location/party master data;
  applies to any event type/action.
- `ilmd` — lot-level master data for newly-created items; only on
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
  "type": ["gs1:Product", "battery:Battery"],
  "gs1:productName": "EV Battery Pack 280Ah LFP",
  "gs1:manufacturer": { ... },
  "gs1:regulatoryInformation": [{ ... }],
  "battery:batteryChemistry": "LFP",
  "battery:ratedCapacity": { ... },
  "dpp:carbonFootprintTotal": 42.5
}
```

This is the On-Demand Data Retrieval pattern from the GS1 Germany EUDR
Guideline V1.11 — the data structure that `masterDataAvailableFor`
mirrors for `gs1:` properties.

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
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/,battery=https://ref.openepcis.io/extensions/eu/battery/
```

**Full set (all modules):**
```http
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/,battery=https://ref.openepcis.io/extensions/eu/battery/,eudr=https://ref.openepcis.io/extensions/eu/eudr/,textile=https://ref.openepcis.io/extensions/eu/textile/,electronics=https://ref.openepcis.io/extensions/eu/electronics/,detergent=https://ref.openepcis.io/extensions/eu/detergent/
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
          "harvestDate": "2025-01-15",
          "productName": {
            "en": "European Oak Round Wood - Grade A"
          }
        },
        {
          "id": "https://id.gs1.org/414/9521234000006",
          "physicalLocationName": {
            "en": "Waldwirtschaft Schmidt - Head Office"
          },
          "countryCode": "DE"
        }
      ],

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
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/,eudr=https://ref.openepcis.io/extensions/eu/eudr/
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

### Mistake 1: Extension properties inside masterDataAvailableFor

```json
"masterDataAvailableFor": [{
  "id": "https://id.gs1.org/01/.../10/LOT-001",
  "regulatoryInformation": [...],
  "eudr:commodityType": "Wood"    // ← WRONG: observation-specific, belongs at event level
}]
```

Fix: Move `eudr:commodityType` to event level.

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
