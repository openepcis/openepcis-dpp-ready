# EPCIS 2.0 Extension Integration Guide

How the OpenEPCIS EUDR vocabulary integrates with GS1 EPCIS 2.0 as a
compliant JSON-LD extension.

> **Canonical reference:**
> [`core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md`](../../core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md)
> defines the authoritative rules for master data vs. extension placement
> across all OpenEPCIS DPP-Ready modules. This guide applies those rules
> to the EUDR module specifically.

---

## Two-Layer Approach

The EUDR module combines two complementary vocabularies:

| Layer | Namespace | Purpose |
|-------|-----------|---------|
| **GS1 EUDR Standard** (B2B) | `gs1:` (via `@vocab` in the EPCIS context) | Regulatory notifications, DDS references, product/location master data. Properties inside `gs1:masterDataAvailableFor`. |
| **OpenEPCIS EUDR Extensions** (origin data) | `eudr:` | Commodity details, species, harvest origin, risk assessment, exemptions. Properties at **event level**. |

The GS1 layer follows the patterns defined in the
[GS1 Germany EUDR Implementation Guideline V1.11](https://www.gs1-germany.de/fileadmin/gs1/fachpublikationen/GS1_Germany_EUDR_Guideline_V1.11.pdf)
(Section 4.2). The OpenEPCIS layer extends those patterns with
domain-specific properties that have no `gs1:` equivalent.

---

## The Architecture Rule

### `gs1:masterDataAvailableFor` -- GS1 properties ONLY

`masterDataAvailableFor` embeds master data about identifiers referenced
in the event. It mirrors the structure of a standalone GS1 Web Vocabulary
master data file.

**Allowed:** Only `gs1:` namespace properties (properties from
`https://ref.gs1.org/voc/`). Inside an EPCIS event, these appear
unprefixed because the EPCIS JSON-LD context sets `@vocab` to the GS1
Web Vocabulary namespace.

**Not allowed:** Any property from `eudr:`, `dpp:`, `battery:`,
`textile:`, `electronics:`, or `detergent:` namespaces.

**Reference:** GS1 Germany EUDR Guideline V1.11, Section 4.2 -- every
EPCIS example in V1.11 uses `gs1:masterDataAvailableFor` with
exclusively `gs1:` properties (pages 23, 29, 30, 34, 35, 42, 44, 46,
48).

### Extension properties -- at event level

Properties from `eudr:` go at the **event level** -- as siblings of
`bizStep`, `epcList`, `readPoint`, etc. They describe domain-specific
observations or assertions made at the time of the event.

```
event
  +-- type, eventTime, action, bizStep, ...    (EPCIS core)
  +-- epcList, readPoint, bizLocation, ...     (EPCIS core)
  +-- gs1:masterDataAvailableFor               (gs1: properties only)
  +-- eudr:commodityType                       (extension -- event level)
  +-- eudr:speciesScientificName               (extension -- event level)
  +-- eudr:exemptionDeclaration                (extension -- event level)
  +-- ...
```

---

## GS1-Extensions HTTP Header

Per EPCIS 2.0 Standard Section 12.3, the `GS1-Extensions` header
declares which extension namespaces are in use.

### Format

```
GS1-Extensions: prefix=namespace, prefix2=namespace2
```

### EUDR Extension Declaration

```http
GS1-Extensions: eudr=https://ref.openepcis.io/extensions/eu/eudr/
```

For multiple extensions:

```http
GS1-Extensions: eudr=https://ref.openepcis.io/extensions/eu/eudr/, dpp=https://ref.openepcis.io/extensions/common/core/
```

### Where it appears

| Direction | HTTP method | Purpose |
|-----------|-------------|---------|
| Request | `POST /capture` | Client declares which extensions the payload uses |
| Response | `OPTIONS /` | Server declares which extensions it supports |
| Response | `GET /events` | Server declares which extensions appear in returned data |

### Relationship to `@context`

The `GS1-Extensions` header is the HTTP-level declaration. The
`@context` array in the JSON-LD body is the semantic-level declaration.
Both must be consistent -- every namespace in the header should have a
corresponding context entry, and vice versa.

### Capture Example

```http
POST /capture HTTP/1.1
Host: epcis.example.com
Content-Type: application/ld+json
GS1-EPCIS-Version: 2.0
GS1-CBV-Version: 2.0
GS1-Extensions: eudr=https://ref.openepcis.io/extensions/eu/eudr/
```

### Query Example

```http
GET /events HTTP/1.1
Host: epcis.example.com
Accept: application/ld+json
GS1-EPCIS-Version: 2.0
GS1-Extensions: eudr=https://ref.openepcis.io/extensions/eu/eudr/
```

---

## JSON-LD Context Integration

The EUDR extension provides a JSON-LD context that composes with the
standard EPCIS context.

### Recommended Configuration

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld"
  ]
}
```

### With Multiple Extensions

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld"
  ]
}
```

---

## Complete EPCIS Document Example

A timber harvesting event. Note: `gs1:masterDataAvailableFor` contains
only `gs1:` properties; all `eudr:` properties are at event level.

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld",
    {
      "gs1": "https://ref.gs1.org/voc/"
    }
  ],
  "type": "EPCISDocument",
  "schemaVersion": "2.0",
  "creationDate": "2025-01-15T16:00:00.000Z",

  "epcisBody": {
    "eventList": [
      {
        "type": "ObjectEvent",
        "eventID": "urn:uuid:550e8400-e29b-41d4-a716-446655440020",
        "eventTime": "2025-01-15T08:30:00.000Z",
        "eventTimeZoneOffset": "+01:00",
        "action": "ADD",
        "bizStep": "commissioning",
        "disposition": "active",

        "epcList": [
          "https://id.gs1.org/01/09521234000020/21/LOG-2025-001"
        ],

        "readPoint": {
          "id": "https://id.gs1.org/414/9521234000099"
        },

        "bizLocation": {
          "id": "https://id.gs1.org/414/9521234000099"
        },

        "gs1:masterDataAvailableFor": [
          {
            "id": "https://id.gs1.org/01/09521234000020/21/LOG-2025-001",
            "productName": {
              "en": "European Oak Round Wood - Grade A"
            },
            "countryOfOrigin": {
              "countryCode": "DE"
            },
            "harvestDate": "2025-01-15",
            "regulatoryInformation": [
              {
                "regulationType": "DEFORESTATION_REGULATION",
                "regulatoryAct": "EU 2023/1115"
              }
            ]
          },
          {
            "id": "https://id.gs1.org/414/9521234000099",
            "physicalLocationName": {
              "en": "Sustainable Oak Forest - Plot 47"
            },
            "geo": {
              "polygon": "13.40,52.51 13.41,52.51 13.41,52.52 13.40,52.52 13.40,52.51"
            },
            "countryCode": "DE"
          },
          {
            "id": "https://id.gs1.org/417/9521234000006",
            "organizationName": {
              "en": "Waldwirtschaft Schmidt GmbH"
            },
            "partyGLN": "9521234000006",
            "countryCode": "DE"
          }
        ],

        "eudr:commodityType": "Wood",
        "eudr:timberProductType": "RoundWood",
        "eudr:speciesScientificName": "Quercus robur",
        "eudr:speciesCommonName": "European Oak",
        "eudr:volumeCubicMeters": 1.2,
        "eudr:forestManagementUnit": "FMU-DE-2024-00123",
        "eudr:areaHectares": 2.5,

        "sourceList": [
          {
            "type": "urn:epcglobal:cbv:sdt:owning_party",
            "source": "https://id.gs1.org/417/9521234000006"
          }
        ]
      }
    ]
  }
}
```

**HTTP headers for this capture:**
```http
POST /capture HTTP/1.1
Content-Type: application/ld+json
GS1-Extensions: eudr=https://ref.openepcis.io/extensions/eu/eudr/
GS1-EPCIS-Version: 2.0
GS1-CBV-Version: 2.0
```

---

## Exemption Handling

> **Status:** Reference pattern aligned with the EU Deforestation Regulation
> (EU 2023/1115) and ongoing GS1 standardization for EUDR exemption handling. May
> evolve as that standardization settles.

An EUDR exemption allows an economic operator to be relieved from the
full due diligence obligation for specific products or batches. The
exemption declaration is an **event-level extension property**, not
inside `masterDataAvailableFor`.

### Exemption Event Pattern

```json
{
  "type": "ObjectEvent",
  "bizStep": "notifying",
  "action": "OBSERVE",
  "persistentDisposition": { "set": ["subject_to_regulation"] },

  "epcList": [
    "https://id.gs1.org/01/09521234000020/10/LOT-2026-Q1-0042"
  ],

  "readPoint": {
    "id": "https://id.gs1.org/414/9521234000006"
  },

  "gs1:masterDataAvailableFor": [
    {
      "id": "https://id.gs1.org/01/09521234000020/10/LOT-2026-Q1-0042",
      "productName": {
        "en": "European Oak Round Wood - Grade A"
      },
      "countryOfOrigin": {
        "countryCode": "DE"
      },
      "regulatoryInformation": [
        {
          "regulationType": "DEFORESTATION_REGULATION",
          "regulatoryAct": "EU 2023/1115",
          "isRegulationCompliant": true
        }
      ]
    }
  ],

  "eudr:commodityType": "Wood",
  "eudr:timberProductType": "RoundWood",
  "eudr:speciesScientificName": "Quercus robur",
  "eudr:speciesCommonName": "European Oak",

  "eudr:exemptionDeclaration": {
    "type": "eudr:ExemptionDeclaration",
    "eudr:exemptionType": "TemporaryExemption",
    "eudr:exemptionReasonCode": "DOWNSTREAM_VERIFIED_LOW_RISK",
    "eudr:exemptionScope": "batch",
    "eudr:exemptionScopeReference": "LOT-2026-Q1-0042",
    "eudr:exemptionEffectiveFrom": "2026-04-15",
    "eudr:exemptionEffectiveUntil": "2026-07-15",
    "eudr:exemptionAuthority": {
      "id": "https://id.gs1.org/417/9521234000006",
      "type": "dpp:OperatorInformation",
      "organizationName": {
        "en": "Waldwirtschaft Schmidt GmbH"
      },
      "partyGLN": "9521234000006",
      "dpp:operatorRole": "DownstreamOperator",
      "dpp:economicOperatorId": "EOID-DE-2026-009988"
    }
  }
}
```

Note: `eudr:exemptionDeclaration` sits at event level, alongside
`eudr:commodityType` and the other extension properties.
`gs1:masterDataAvailableFor` contains only the GS1 product master data.

See `eudr/epcis/exemption-declaration.jsonld` for the full document.

---

## Best Practices

### 1. Always Declare Extensions

Include the `GS1-Extensions` header in all requests/responses that use
extension properties. Ensure the `@context` array includes the
corresponding extension context.

### 2. Prefer Standard Vocabulary

Use GS1 Web Vocabulary (`gs1:`) for standard properties. Only use
`eudr:` for EUDR-specific data that has no GS1 equivalent:

| Use `gs1:` for | Use `eudr:` for |
|----------------|-----------------|
| `productName` | `eudr:commodityType` |
| `countryOfOrigin` | `eudr:speciesScientificName` |
| `harvestDate` | `eudr:timberProductType` |
| `regulatoryInformation` | `eudr:riskLevel` |
| `geo` / `polygon` | `eudr:exemptionDeclaration` |

### 3. Keep Extensions Out of masterDataAvailableFor

This is the most common mistake. Extension properties (`eudr:`, `dpp:`,
etc.) belong at event level, never inside `masterDataAvailableFor`.

Wrong:
```json
"gs1:masterDataAvailableFor": [{
  "id": "...",
  "eudr:commodityType": "Wood"
}]
```

Correct:
```json
"gs1:masterDataAvailableFor": [{
  "id": "...",
  "productName": { "en": "European Oak Round Wood" }
}],
"eudr:commodityType": "Wood"
```

### 4. Validate JSON-LD

Ensure extension properties expand correctly using tools like the
[JSON-LD Playground](https://json-ld.org/playground/).

---

## EPCIS Repository Requirements

To support OpenEPCIS EUDR extensions, an EPCIS 2.0 repository should:

1. **Accept the GS1-Extensions header** and store extension namespace
   mappings
2. **Preserve extension properties** in captured events without
   modification
3. **Return extension namespace mappings** in responses via
   GS1-Extensions header
4. **Support JSON-LD context resolution** for extension vocabularies

### Service Discovery

Repositories can advertise supported extensions:

```http
GET / HTTP/1.1
Host: epcis.example.com
Accept: application/ld+json

HTTP/1.1 200 OK
GS1-EPCIS-Version: 2.0
GS1-Extensions: eudr=https://ref.openepcis.io/extensions/eu/eudr/
```

---

## Related Standards

| Standard | URL | Purpose |
|----------|-----|---------|
| EPCIS 2.0 | https://ref.gs1.org/standards/epcis/ | Event capture and query |
| CBV 2.0 | https://ref.gs1.org/standards/cbv/ | Business vocabulary |
| GS1 Web Vocabulary | https://www.gs1.org/voc/ | Master data terms |
| GS1 EUDR Standard | https://ref.gs1.org/standards/eudr/ | B2B regulatory notifications |
| GS1 Germany EUDR Guideline V1.11 | [PDF](https://www.gs1-germany.de/fileadmin/gs1/fachpublikationen/GS1_Germany_EUDR_Guideline_V1.11.pdf) | Authoritative `masterDataAvailableFor` patterns |

---

## References

- [EPCIS 2.0 Standard](https://ref.gs1.org/standards/epcis/) -- Section 6.3 (Extension Mechanisms), Section 12.3 (GS1-Extensions header)
- [GS1 Germany EUDR Implementation Guideline V1.11](https://www.gs1-germany.de/fileadmin/gs1/fachpublikationen/GS1_Germany_EUDR_Guideline_V1.11.pdf) -- Section 4.2 (masterDataAvailableFor examples)
- [`core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md`](../../core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md) -- Canonical guide for master data vs. extension placement
- [GS1 EPCIS GitHub](https://github.com/gs1/EPCIS) -- Reference implementations and OpenAPI
- [OpenEPCIS Repository](https://github.com/openepcis/epcis-repository-ce) -- EPCIS 2.0 implementation supporting extensions
- [JSON-LD Playground](https://json-ld.org/playground/) -- Test RDF expansion
