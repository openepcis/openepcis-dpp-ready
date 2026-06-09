# EUDR Implementation Guide

This guide provides step-by-step instructions for implementing EU Deforestation Regulation (EUDR) 2023/1115 compliance using GS1 standards.

> **Disclaimer**: This is **not official GS1 guidance**, but follows official GS1 standards:
> - [GS1 EUDR Standard](https://ref.gs1.org/standards/eudr/)
> - [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link)
> - [EPCIS 2.0](https://ref.gs1.org/standards/epcis/)

## Table of Contents

1. [Overview](#overview)
2. [Key Requirements](#key-requirements)
3. [Data Model](#data-model)
4. [Implementation Steps](#implementation-steps)
5. [Event Types](#event-types)
6. [Geolocation Requirements](#geolocation-requirements)
7. [Due Diligence Process](#due-diligence-process)
8. [Examples](#examples)

---

## Overview

The EU Deforestation Regulation requires operators placing regulated commodities on the EU market to:

1. **Ensure products are deforestation-free** (cutoff: 31 December 2020)
2. **Ensure products are legally produced** per country of production laws
3. **Submit due diligence statements** to the EU Information System (EUIS)
4. **Provide geolocation data** for production plots
5. **Maintain full traceability** back to the plot of land

### Regulated Commodities

| Commodity | HS Code Range | Examples |
|-----------|---------------|----------|
| Cattle | 01, 02, 41, 43 | Live cattle, beef, leather |
| Cocoa | 18 | Cocoa beans, chocolate |
| Coffee | 09 | Coffee beans, roasted coffee |
| Oil Palm | 15 | Palm oil, derivatives |
| Rubber | 40 | Natural rubber, products |
| Soya | 12, 15, 23 | Soybeans, soy oil, meal |
| Wood | 44, 47, 48, 94 | Timber, pulp, paper, furniture |

---

## Key Requirements

### Cutoff Date

**31 December 2020** - Products must come from land that was not deforested after this date.

### Geolocation

| Plot Size | Requirement |
|-----------|-------------|
| > 4 hectares | Full polygon coordinates (WKT or GeoJSON) |
| ≤ 4 hectares | Center point (latitude, longitude) sufficient |

### Due Diligence Steps

1. **Information gathering** - Collect product, supplier, geolocation data
2. **Risk assessment** - Evaluate deforestation and legality risks
3. **Risk mitigation** - Take measures for non-negligible risks
4. **Submit to EUIS** - File due diligence statement

---

## Data Model

### Where Data Lives

| Data Type | Location | Pattern |
|-----------|----------|---------|
| Geolocation (polygon) | Location master data | `gs1:masterDataAvailableFor` on `readPoint` |
| Species, weight | Product master data | `gs1:masterDataAvailableFor` on EPC |
| Due diligence | Event `gs1:regulatoryInformation` | GS1 Web Vocabulary pattern |
| EUIS reference | Event `gs1:regulatoryInformation` | Extension property |
| Batch number | Product master data | `gs1:masterDataAvailableFor` with `hasBatchLotNumber` |

### Key Principle

- **Events** capture what happened and when
- **Master Data** provides detailed product/location information
- **`gs1:regulatoryInformation`** on events captures compliance declarations

---

## Implementation Steps

### Step 1: Set Up Identifiers

Use GS1 Digital Link identifiers:

```
Product:  https://id.gs1.org/01/{GTIN}/21/{Serial}
Location: https://id.gs1.org/414/{GLN}
Organization: https://id.gs1.org/417/{GLN}
```

### Step 2: Create Location Master Data (Plot of Land)

```json
{
  "id": "https://id.gs1.org/414/9521234000099",
  "type": ["gs1:Place", "eudr:PlotOfLand"],
  "eudr:polygonCoordinates": "POLYGON((...))",
  "eudr:areaHectares": 2.5,
  "eudr:countryOfOrigin": "DE",
  "eudr:forestManagementUnit": "FMU-DE-2024-00123"
}
```

### Step 3: Create Product Master Data

```json
{
  "id": "https://id.gs1.org/01/09521234000020/21/LOG-2025-001",
  "type": "Product",
  "eudr:commodityType": "Wood",
  "eudr:speciesScientificName": "Quercus robur",
}
```

### Step 4: Record Harvesting Event

```json
{
  "type": "ObjectEvent",
  "action": "ADD",
  "bizStep": "commissioning",
  "epcList": ["https://id.gs1.org/01/09521234000020/21/LOG-2025-001"],
  "readPoint": {
    "id": "https://id.gs1.org/414/9521234000099"
  },
  "gs1:masterDataAvailableFor": [
    {
      "id": "https://id.gs1.org/01/09521234000020/21/LOG-2025-001",
      "productName": "European Oak Round Wood",
      "gs1:harvestDate": "2025-01-15",
      "eudr:speciesScientificName": "Quercus robur",
      "countryOfOrigin": "DE"
    },
    {
      "id": "https://id.gs1.org/414/9521234000099",
      "physicalLocationName": "Sustainable Oak Forest - Plot 47",
      "geo": {
        "polygon": "[[13.40, 52.51], [13.41, 52.51], ...]"
      }
    }
  ]
}
```

### Step 5: Record Due Diligence Statement

```json
{
  "type": "ObjectEvent",
  "action": "OBSERVE",
  "bizStep": "inspecting",
  "gs1:regulatoryInformation": [{
    "gs1:regulationType": "gs1:RegulationTypeCode-DEFORESTATION_REGULATION",
    "gs1:regulatoryAct": "EU 2023/1115",
    "isRegulationCompliant": true,
    "gs1:regulatoryReferenceNumber": "EUIS-2025-DE-00012345",
    "eudr:deforestationFreeDate": "2025-01-15",
    "eudr:legallyHarvested": true,
    "eudr:riskLevel": "Low"
  }]
}
```

### Step 6: Record Transformations (Derived Products)

Use `TransformationEvent` to link derived products back to source commodities:

```json
{
  "type": "TransformationEvent",
  "inputEPCList": ["...source-log-id..."],
  "outputEPCList": ["...furniture-id..."],
  "gs1:masterDataAvailableFor": [{
    "id": "...furniture-id...",
    "eudr:transformationDate": "2025-02-15",
    "eudr:commodityType": "Wood",
    "eudr:timberProductType": "Furniture"
  }]
}
```

---

## Event Types

### Harvesting Event (ObjectEvent, ADD)

Records the creation/harvesting of a commodity at the plot of land.

- **bizStep**: `commissioning`
- **action**: `ADD`
- **Key Master Data**: harvest date, species, country of origin (via `gs1:masterDataAvailableFor`)

### Due Diligence Statement (ObjectEvent, OBSERVE)

Records the regulatory compliance declaration.

- **bizStep**: `inspecting`
- **action**: `OBSERVE`
- **Key Data**: EUIS reference, risk level, deforestation-free date

### Transformation Event (TransformationEvent)

Records processing of commodities into derived products.

- **bizStep**: `commissioning`
- **Links**: input commodities to output products

---

## Geolocation Requirements

### For Plots > 4 Hectares

Provide polygon coordinates in WKT format:

```
POLYGON((lon1 lat1, lon2 lat2, lon3 lat3, lon4 lat4, lon1 lat1))
```

Or GeoJSON format:

```json
{
  "type": "Polygon",
  "coordinates": [[[lon1, lat1], [lon2, lat2], [lon3, lat3], [lon1, lat1]]]
}
```

### For Plots ≤ 4 Hectares

Center point is sufficient:

```
"eudr:centerPoint": "52.5150,13.4050"
```

### Capturing in Events

Use sensor reports for real-time geolocation:

```json
"sensorElementList": [{
  "sensorReport": [
    { "type": "gs1:Latitude", "value": 52.5150, "uom": "DD" },
    { "type": "gs1:Longitude", "value": 13.4050, "uom": "DD" }
  ]
}]
```

---

## Due Diligence Process

### 1. Information Gathering

Collect and verify:
- Product identification (GTIN, serial)
- Commodity type and species
- Country and region of production
- Plot of land geolocation
- Harvest date
- Supplier information

### 2. Risk Assessment

Evaluate based on:
- Country risk category (per EU benchmarking)
- Complexity of supply chain
- Verification of source documentation
- Satellite imagery analysis (if needed)

### 3. Risk Mitigation

For non-negligible risk:
- Additional verification steps
- On-site audits
- Third-party certification verification
- Satellite monitoring

### 4. EUIS Submission

Submit due diligence statement to EU Information System:
- Receive EUIS reference number
- Record in `gs1:regulatoryReferenceNumber`

---

## Examples

See the `examples/` directory for complete examples:

- **`timber-product.jsonld`** - Round wood product master data
- **`plot-of-land.jsonld`** - Production plot with geolocation
- **`timber-derived.jsonld`** - Furniture derived from timber

See the `epcis/` directory for event examples:

- **`harvesting.jsonld`** - Timber harvest commissioning event
- **`processing.jsonld`** - Transformation to furniture
- **`due-diligence-statement.jsonld`** - EUDR compliance declaration
- **`exemption-declaration.jsonld`** - EUDR exemption (reference pattern, GS1 standardization)

---

## EUDR Exemption Handling (reference pattern)

> **Status:** This section describes a **reference pattern** aligned with the EU
> Deforestation Regulation (EU 2023/1115) and ongoing GS1 standardization for
> EUDR exemption handling across EANCOM, GS1 XML, and GDSN. The pattern here may
> evolve as that standardization settles.

### What is an EUDR exemption?

An EUDR exemption allows an economic operator to be relieved from the full
due diligence obligation for specific products or batches, under defined
conditions. Typical exemption triggers include:

- **Already-verified low-risk source** — the upstream supplier has already
  performed due diligence and provided verifiable evidence
- **Downstream operator simplified obligation** — per EUDR Article 2.17
  (introduced by the Dec 2025 amendment)
- **Re-import or re-export of previously compliant product**
- **Temporary grace period** — for example during a transition period

GS1 standardization codifies the exemption mechanism across three GS1 data sharing
formats (EANCOM, GS1 XML, GDSN). GS1 standardization covers the GDSN master data
handling. The EPCIS / JSON-LD pattern below mirrors the semantics.

### Two exemption types

The ontology distinguishes:

- **`eudr:PermanentExemption`** — applies to all future batches/instances of
  a given GTIN without expiry (e.g., verified low-risk origin country).
  Typically scoped at GTIN level.
- **`eudr:TemporaryExemption`** — applies to specific batches or serial
  numbers within a defined time period. Requires scope identification
  (batch/lot number or serial list) and an end date.

### EPCIS pattern

Carry the exemption in an `ObjectEvent` with `bizStep: "notifying"` and
`persistentDisposition.set: ["subject_to_regulation"]`, attaching an
`eudr:ExemptionDeclaration` to the product master data via
`gs1:masterDataAvailableFor`:

```json
{
  "type": "ObjectEvent",
  "bizStep": "notifying",
  "persistentDisposition": { "set": ["subject_to_regulation"] },
  "epcList": ["https://id.gs1.org/01/09521234000020/10/LOT-2026-Q1-0042"],
  "gs1:masterDataAvailableFor": [{
    "id": "https://id.gs1.org/01/09521234000020/10/LOT-2026-Q1-0042",
    "eudr:exemptionDeclaration": {
      "type": "eudr:ExemptionDeclaration",
      "eudr:exemptionType": "TemporaryExemption",
      "eudr:exemptionReasonCode": "DOWNSTREAM_VERIFIED_LOW_RISK",
      "eudr:exemptionScope": "batch",
      "eudr:exemptionScopeReference": "LOT-2026-Q1-0042",
      "eudr:exemptionEffectiveFrom": "2026-04-15",
      "eudr:exemptionEffectiveUntil": "2026-07-15",
      "eudr:exemptionAuthority": { "..." : "..." }
    }
  }]
}
```

See `eudr/epcis/exemption-declaration.jsonld` for the full example.

### Semantic equivalence across formats

| Concept | EPCIS JSON-LD (this guide) | EANCOM (GS1 standardization) | GDSN (GS1 standardization) |
|---|---|---|---|
| Exemption type | `eudr:exemptionType` | IMD segment C272:DE7081 | dedicated attribute |
| Exemption reason code | `eudr:exemptionReasonCode` | IMD segment C273:DE7009 | dedicated attribute |
| Temporary batch/serial scope | `eudr:exemptionScope` + `exemptionScopeReference` | GIN segment under SG22 | exemption attribute on item |
| Date range | `eudr:exemptionEffectiveFrom/Until` | date segments | date attributes |
| Declaring party | `eudr:exemptionAuthority` (dpp:OperatorInformation) | NAD segments | partyGLN attribute |

### Controlled vocabularies (pending)

The exemption reason code is currently typed as `xsd:string` because the
official code list from GS1 standardization is not yet final. Once it is published, the reason codes will become a controlled enumeration
in this ontology.

The `eudr:exemptionScope` property uses the string values `gtin`, `batch`,
and `serial` to indicate the identifier level at which the exemption
applies.

### EPCIS vs. GS1 EUDR B2B messaging

The `gs1:RegulatoryNotification` pattern (GS1 EUDR Standard p.0.0) is the
B2B message for sharing **DDS reference numbers**. The exemption pattern
described here is **complementary**: it declares that specific
batches/products are exempt from the DDS obligation in the first place,
and is surfaced via EPCIS events rather than via RegulatoryNotification.
A supply chain can use both patterns in sequence:

1. Exemption declared via EPCIS (`bizStep: notifying` +
   `eudr:ExemptionDeclaration`)
2. Downstream partners receive and verify the exemption
3. If later a full DDS becomes required (e.g., exemption expires), the
   normal `gs1:RegulatoryNotification` flow resumes

---

## References

- [EU Deforestation Regulation 2023/1115](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1115)
- [GS1 EUDR Standard](https://ref.gs1.org/standards/eudr/)
- [European Commission EUDR FAQ](https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en)
- [OpenEPCIS DPP Core Patterns](../../core/docs/PATTERNS.md)
- GS1 standardization GS1 standardization (EUDR exemptions — EANCOM / GS1 XML / GDSN)
- GS1 standardization GS1 standardization (EUDR exemptions — GDSN)
