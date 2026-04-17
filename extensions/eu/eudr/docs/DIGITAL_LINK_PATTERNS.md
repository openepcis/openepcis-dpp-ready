# GS1 Digital Link Patterns for EUDR

This document describes the GS1 Digital Link URI patterns used for EUDR compliance.

## Overview

GS1 Digital Link provides resolvable URIs that can serve as both identifiers and URLs. A resolver translates these URIs into requests for specific data formats.

**Base resolver**: `https://id.gs1.org/`

---

## URI Patterns

### Products (GTIN)

**Pattern**: `https://id.gs1.org/01/{GTIN}`

| Component | Description |
|-----------|-------------|
| `01` | Application Identifier for GTIN |
| `{GTIN}` | 14-digit Global Trade Item Number |

**Examples**:
```
https://id.gs1.org/01/09521234000020                    # Product class
https://id.gs1.org/01/09521234000020/21/LOG-2025-001   # Serialized instance
https://id.gs1.org/01/09521234000020/10/BATCH-2025-01  # Batch/lot
```

### Locations (GLN)

**Pattern**: `https://id.gs1.org/414/{GLN}`

| Component | Description |
|-----------|-------------|
| `414` | Application Identifier for physical location |
| `{GLN}` | 13-digit Global Location Number |

**Examples**:
```
https://id.gs1.org/414/9521234000099   # Plot of land
https://id.gs1.org/414/9521234000006   # Office location
https://id.gs1.org/414/9521234000105   # Warehouse
```

### Organizations/Parties (GLN)

**Pattern**: `https://id.gs1.org/417/{GLN}`

| Component | Description |
|-----------|-------------|
| `417` | Application Identifier for legal entity |
| `{GLN}` | 13-digit Global Location Number |

**Examples**:
```
https://id.gs1.org/417/9521234000006   # Forest owner
https://id.gs1.org/417/9521234000105   # Furniture manufacturer
```

### Assets (GIAI)

**Pattern**: `https://id.gs1.org/8004/{GIAI}`

| Component | Description |
|-----------|-------------|
| `8004` | Application Identifier for GIAI |
| `{GIAI}` | Global Individual Asset Identifier |

**Examples**:
```
https://id.gs1.org/8004/9521234000006-GPS-001   # GPS device
```

---

## Additional Key Qualifiers

### Serial Number (21)

For serialized product instances:
```
https://id.gs1.org/01/{GTIN}/21/{Serial}
```

**Example**: `https://id.gs1.org/01/09521234000020/21/LOG-2025-001`

### Batch/Lot Number (10)

For batch-level identification:
```
https://id.gs1.org/01/{GTIN}/10/{Batch}
```

**Example**: `https://id.gs1.org/01/09521234000020/10/BATCH-2025-01`

---

## Resolver Patterns

A GS1 Digital Link resolver can return different representations based on the `Accept` header or link type.

### Master Data Resolution

When an EPCIS event references a location or product, the resolver can provide master data:

```json
{
  "readPoint": {
    "id": "https://id.gs1.org/414/9521234000099"
  },
  "gs1:masterDataAvailableFor": {
    "id": "https://id.gs1.org/414/9521234000099"
  }
}
```

The resolver at `id.gs1.org` or a custom resolver returns:

```json
{
  "id": "https://id.gs1.org/414/9521234000099",
  "type": "gs1:Place",
  "gs1:locationGLN": "9521234000099",
  "gs1:physicalLocationName": "Sustainable Oak Forest - Plot 47",
  "gs1:geo": {
    "type": "gs1:GeoShape",
    "gs1:polygon": "[[13.40, 52.51], [13.41, 52.51], ...]"
  }
}
```

### Link Types

Standard link types for resolver responses:

| Link Type | Description | MIME Type |
|-----------|-------------|-----------|
| `gs1:pip` | Product information page | `text/html` |
| `gs1:masterData` | Master data (JSON-LD) | `application/ld+json` |
| `gs1:epcis` | EPCIS events | `application/ld+json` |
| `gs1:certificationInfo` | Certification data | `application/json` |

---

## EUDR-Specific Usage

### Plot of Land Master Data

The plot of land GLN resolves to location master data with EUDR extensions:

**URI**: `https://id.gs1.org/414/9521234000099`

**Resolved Data**:
```json
{
  "@context": {
    "gs1": "https://ref.gs1.org/voc/",
    "eudr": "https://ref.openepcis.io/extensions/eu/eudr/"
  },
  "type": "gs1:Place",
  "id": "https://id.gs1.org/414/9521234000099",
  "gs1:locationGLN": "9521234000099",
  "gs1:physicalLocationName": "Sustainable Oak Forest - Plot 47",
  "gs1:geo": {
    "type": "gs1:GeoShape",
    "gs1:polygon": "[[13.40, 52.51], [13.41, 52.51], [13.41, 52.52], [13.40, 52.52], [13.40, 52.51]]"
  },
  "eudr:forestManagementUnit": "FMU-DE-2024-00123",
  "eudr:landUseHistory": "Managed sustainable oak forest since 1920."
}
```

### Product Master Data

Product GTIN resolves to product master data with EUDR extensions:

**URI**: `https://id.gs1.org/01/09521234000020/21/LOG-2025-001`

**Resolved Data**:
```json
{
  "@context": {
    "gs1": "https://ref.gs1.org/voc/",
    "eudr": "https://ref.openepcis.io/extensions/eu/eudr/"
  },
  "type": "gs1:Product",
  "id": "https://id.gs1.org/01/09521234000020/21/LOG-2025-001",
  "gs1:gtin": "09521234000020",
  "gs1:productName": "European Oak Round Wood - Grade A",
  "eudr:commodityType": "Wood",
  "eudr:timberProductType": "RoundWood",
  "eudr:speciesScientificName": "Quercus robur",
  "eudr:harvestDate": "2025-01-15",
}
```

---

## In EPCIS Events

Use Digital Link URIs as identifiers in EPCIS events:

```json
{
  "type": "ObjectEvent",
  "action": "ADD",
  "bizStep": "commissioning",

  "epcList": [
    "https://id.gs1.org/01/09521234000020/21/LOG-2025-001"
  ],

  "readPoint": {
    "id": "https://id.gs1.org/414/9521234000099"
  },

  "sourceList": [{
    "type": "urn:epcglobal:cbv:sdt:owning_party",
    "source": "https://id.gs1.org/417/9521234000006"
  }],

  "gs1:masterDataAvailableFor": [
    { "id": "https://id.gs1.org/01/09521234000020/21/LOG-2025-001" },
    { "id": "https://id.gs1.org/414/9521234000099" },
    { "id": "https://id.gs1.org/417/9521234000006" }
  ]
}
```

---

## Demo Prefix

All examples use GS1 demo prefix **952** (7-digit GCP: `9521234`):

| Identifier | Example |
|------------|---------|
| GTIN (Product) | `09521234000020` |
| GLN (Party) | `9521234000006` |
| GLN (Location) | `9521234000099` |

This prefix is reserved for demonstrations and examples per [GS1 General Specifications](https://www.gs1.org/standards/barcodes-epcrfid-id-keys/gs1-general-specifications).

---

## References

- [GS1 Digital Link Standard](https://www.gs1.org/standards/gs1-digital-link)
- [GS1 Digital Link URI Structure](https://ref.gs1.org/standards/digital-link/uri-specification/)
- [GS1 Application Identifiers](https://www.gs1.org/standards/barcodes/application-identifiers)
- [OpenEPCIS Resolver](https://ref.openepcis.io/)
