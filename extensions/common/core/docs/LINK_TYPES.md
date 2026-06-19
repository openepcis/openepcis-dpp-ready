# GS1 Link Types for Digital Product Passports

This document maps [GS1 Web Vocabulary Link Types](https://ref.gs1.org/voc/?show=linktypes) to JSON-LD response types using [GS1 Web Vocabulary](https://ref.gs1.org/voc/) classes.

## Overview

GS1 Digital Link resolvers use the `linkType` query parameter to route requests to specific resources:

```
https://id.gs1.org/01/09521234000013/21/BAT2024-001?linkType=gs1:dpp
```

## Primary DPP Link Types

### gs1:dpp — Digital Product Passport

**The primary link type for DPP access.**

**GS1 Definition**: "Digital product passport access"

**Request**:
```bash
curl -H "Accept: application/ld+json" \
  "https://id.gs1.org/01/09521234000013/21/BAT2024-001?linkType=gs1:dpp"
```

**Response Type**: `gs1:Product` with domain extensions

| Domain | Additional Type | Key GS1 Properties |
|--------|-----------------|-------------------|
| Battery | `eubat:Battery` | Plus `eubat:technicalSpecifications`, `eubat:materialComposition` |
| EUDR | `eudr:TimberProduct` | Plus `eudr:sourceLocation`, `eudr:commodityType` |

**Example**:
```json
{
  "@context": {"gs1": "https://ref.gs1.org/voc/", ...},
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
  "type": ["gs1:Product", "eubat:Battery"],
  "gs1:gtin": "09521234000013",
  "gs1:serialNumber": "BAT2024-001",
  "gs1:productName": "EcoCell Industrial Battery Module IM-500",
  "gs1:manufacturer": {
    "type": "gs1:Organization",
    "gs1:partyGLN": "9521234000006",
    "gs1:organizationName": "EcoCell Energy GmbH"
  },
  "gs1:certificationInfo": [...],
  "schema:category": "IndustrialBattery",
  "eubat:technicalSpecifications": {...}
}
```

---

### gs1:pip — Product Information Page

**GS1 Definition**: "Brand-operated or retail product information for consumers"

**Response Type**: `gs1:Product` — consumer-facing product data

Similar to `gs1:dpp` but may be a subset focused on consumer information rather than full regulatory compliance data.

---

### gs1:masterData — Master Data

**GS1 Definition**: "Structured master data for B2B applications"

**Response Type**: `gs1:Product`, `gs1:Organization`, or `gs1:Place`

Returns complete master data records suitable for B2B system integration.

```json
{
  "@context": [...],
  "type": "gs1:Product",
  "gs1:gtin": "09521234000013",
  "gs1:brand": {...},
  "gs1:manufacturer": {...},
  "gs1:countryOfOrigin": "DE",
  "gs1:netWeight": {"gs1:value": "45.5", "gs1:unitCode": "KGM"},
  "gs1:grossWeight": {"gs1:value": "52.0", "gs1:unitCode": "KGM"}
}
```

---

## Traceability & Visibility

### gs1:epcis — EPCIS Repository

**GS1 Definition**: "EPC Information Services (EPCIS) repository of visibility event data"

**Response Type**: `epcis:EPCISDocument` or `epcis:EPCISQueryDocument`

```json
{
  "@context": ["https://ref.gs1.org/standards/epcis/epcis-context.jsonld", {...}],
  "type": "EPCISQueryDocument",
  "schemaVersion": "2.0",
  "epcisBody": {
    "queryResults": {
      "eventList": [...]
    }
  }
}
```

---

### gs1:traceability — Traceability Information

**GS1 Definition**: "Traceability information (includes track and trace)"

**Response Type**: Simplified traceability view or geolocation data

| Domain | Response Focus |
|--------|----------------|
| EUDR | `eudr:PlotOfLand` with geolocation polygon, harvest dates |
| Battery | Supply chain summary, ownership history |

**Example (EUDR)**:
```json
{
  "@context": [...],
  "id": "https://id.gs1.org/01/09521234000020/10/BATCH-2025-01",
  "gs1:traceability": {
    "eudr:sourceLocation": {
      "type": ["gs1:Place", "eudr:PlotOfLand"],
      "gs1:geo": {
        "gs1:latitude": "52.5200",
        "gs1:longitude": "13.4050"
      },
      "eudr:polygonCoordinates": "POLYGON((13.40 52.51, 13.41 52.51, ...))",
      "eudr:areaHectares": 2.5,
      "gs1:countryCode": "DE"
    },
    "gs1:harvestDate": "2025-01-15",
    "eudr:deforestationFreeDate": "2025-01-15",
    "eudr:legallyHarvested": true
  }
}
```

---

## Certification & Compliance

### gs1:certificationInfo — Certification Information

**GS1 Definition**: "Certification documentation and details"

**Response Type**: `gs1:CertificationDetails` array

```json
{
  "@context": [...],
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
  "gs1:certificationInfo": [
    {
      "type": "gs1:CertificationDetails",
      "gs1:certificationAgency": "TÜV Rheinland",
      "gs1:certificationStandard": "ISO 14001:2015",
      "gs1:certificationValue": "Certified",
      "gs1:certificationIdentification": "TUV-2024-00456",
      "gs1:certificationStartDate": "2024-01-15",
      "gs1:certificationEndDate": "2027-01-14"
    },
    {
      "type": "gs1:CertificationDetails",
      "gs1:certificationAgency": "European Commission",
      "gs1:certificationStandard": "EU 2023/1542 Battery Regulation",
      "gs1:certificationValue": "Compliant",
      "gs1:certificationIdentification": "DoC-2024-00123"
    }
  ]
}
```

---

### gs1:registryEntry — Entry in a Register

**GS1 Definition**: "Entry in an official register"

**Response Type**: Registry reference with identifier

Useful for EUDR's EU Information System (EUIS) reference numbers:

```json
{
  "@context": [...],
  "id": "https://id.gs1.org/01/09521234000020/10/BATCH-2025-01",
  "gs1:registryEntry": {
    "gs1:registryName": "EU Information System (EUIS)",
    "gs1:registryIdentifier": "EUIS-2025-DE-00012345",
    "gs1:registryEntryDate": "2025-01-20"
  }
}
```

---

## Sustainability

### gs1:sustainabilityInfo — Sustainability and Recycling

**GS1 Definition**: "Sustainability and recycling requirements or processes"

**Response Type**: Sustainability-focused product data

```json
{
  "@context": [...],
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
  "gs1:sustainabilityInfo": {
    "oec:carbonFootprintTotal": 45.2,
    "oec:carbonFootprintUnit": "kg CO2e/kWh",
    "oec:carbonFootprintStudyUrl": {"id": "https://example.com/cfp/study.pdf"},
    "oec:recycledContent": {
      "type": "oec:RecycledContent",
      "oec:totalRecycledShare": 35.0,
      "oec:postConsumerShare": 23.0,
      "oec:preConsumerShare": 12.0
    },
    "oec:circularityInfo": {
      "type": "oec:CircularityInfo",
      "oec:recyclabilityRate": 95.5,
      "oec:endOfLifeInstructions": {"id": "https://example.com/eol-guide.pdf"}
    }
  }
}
```

---

## Safety & Recalls

### gs1:safetyInfo — Safety Information

**GS1 Definition**: "Safety guidance and warnings"

**Response Type**: Safety data including hazardous substances

```json
{
  "@context": [...],
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
  "gs1:safetyInfo": {
    "oec:hazardousSubstances": [
      {
        "type": "oec:HazardousSubstance",
        "schema:name": "Cobalt compounds",
        "oec:casNumber": "7440-48-4",
        "oec:hazardClass": "Carcinogenicity",
        "oec:concentration": 12.5,
        "oec:hazardImpact": "May cause cancer by inhalation"
      }
    ],
    "gs1:consumerSafetyInformation": "Handle with care. Do not puncture or expose to fire."
  }
}
```

---

### gs1:recallStatus — Recall Status

**GS1 Definition**: "Product recall verification data"

**Response Type**: Recall status object

```json
{
  "@context": [...],
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
  "gs1:recallStatus": {
    "gs1:hasActiveRecall": false,
    "gs1:lastVerified": "2025-01-19T10:00:00Z"
  }
}
```

Or with active recall:
```json
{
  "gs1:recallStatus": {
    "gs1:hasActiveRecall": true,
    "gs1:recallDescription": "Potential thermal runaway risk in units manufactured before 2024-06",
    "gs1:recallStartDate": "2025-01-15",
    "gs1:recallAction": "Return to manufacturer for inspection"
  }
}
```

---

## Instructions & Service

### gs1:instructions — Instructions

**GS1 Definition**: "Assembly, usage, and operational guidance"

**Response Type**: Document references

```json
{
  "@context": [...],
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
  "gs1:instructions": [
    {
      "type": "gs1:ReferencedFileDetails",
      "gs1:referencedFileType": {"id": "gs1:ReferencedFileTypeCode-PRODUCT_MANUAL"},
      "gs1:referencedFileURL": "https://example.com/docs/manual-en.pdf",
      "gs1:fileLanguageCode": "en"
    }
  ]
}
```

---

### gs1:serviceInfo — Service Information

**GS1 Definition**: "Service and maintenance instructions"

**Response Type**: Service provider and spare parts information

```json
{
  "@context": [...],
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
  "gs1:serviceInfo": {
    "eubat:sparePartsSupplier": [
      {
        "type": "gs1:Organization",
        "gs1:partyGLN": "9521987000001",
        "gs1:organizationName": "BatteryParts Direct",
        "gs1:contactPoint": {
          "gs1:contactType": "Service",
          "gs1:email": "service@example.com"
        }
      }
    ],
    "gs1:warrantyPromise": {
      "gs1:durationOfWarranty": "P8Y",
      "gs1:warrantyType": "Full Warranty"
    }
  }
}
```

---

## Link Type Summary

| Link Type | GS1 URI | Primary Response Type |
|-----------|---------|----------------------|
| `dpp` | `gs1:dpp` | `gs1:Product` + domain extensions |
| `pip` | `gs1:pip` | `gs1:Product` (consumer view) |
| `masterData` | `gs1:masterData` | `gs1:Product` / `gs1:Organization` / `gs1:Place` |
| `epcis` | `gs1:epcis` | `epcis:EPCISDocument` |
| `traceability` | `gs1:traceability` | Geolocation / supply chain data |
| `certificationInfo` | `gs1:certificationInfo` | `gs1:CertificationDetails` |
| `registryEntry` | `gs1:registryEntry` | Registry identifier |
| `sustainabilityInfo` | `gs1:sustainabilityInfo` | Carbon footprint, recycling data |
| `safetyInfo` | `gs1:safetyInfo` | Hazardous substances, warnings |
| `recallStatus` | `gs1:recallStatus` | Recall verification |
| `instructions` | `gs1:instructions` | `gs1:ReferencedFileDetails` |
| `serviceInfo` | `gs1:serviceInfo` | Spare parts, warranty |

## Content Negotiation

| Accept Header | Response Format |
|---------------|-----------------|
| `application/ld+json` | JSON-LD (primary for DPP) |
| `application/json` | Plain JSON |
| `text/html` | Human-readable HTML |
| `text/turtle` | RDF Turtle |

## Implementation Notes

1. **Default**: Without `linkType`, return `gs1:pip` or `gs1:dpp` based on product type
2. **Resolver routing**: Map link types to backend services/endpoints
3. **Partial responses**: Not all link types need full data — return relevant subset
4. **Caching**: Static data (masterData) can be cached longer than dynamic (recallStatus)

## References

- [GS1 Web Vocabulary](https://ref.gs1.org/voc/)
- [GS1 Web Vocabulary Link Types](https://ref.gs1.org/voc/?show=linktypes)
- [GS1 Digital Link Standard](https://www.gs1.org/standards/gs1-digital-link)
- [EPCIS 2.0 Standard](https://ref.gs1.org/standards/epcis/)
