# EUDR Module

This module provides vocabulary and examples for implementing EU Deforestation Regulation (EUDR) 2023/1115 compliance using GS1 standards.

> **Disclaimer**: This is **not official GS1 guidance**, but it is built entirely on official GS1 standards and follows GS1 best practices:
> - [GS1 EUDR Standard](https://ref.gs1.org/standards/eudr/) — `gs1:RegulatoryNotification` for B2B messaging
> - [GS1 EUDR-tool](https://github.com/gs1/EUDR-tool) — Reference implementation for generating notifications
> - [GS1 Germany EUDR Guideline V1.11](https://www.gs1-germany.de/branchen-themen/nachhaltigkeit/eu-deforestation-regulation-eudr/) — EPCIS event patterns
> - [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link) — Resolvable URIs as product identifiers
> - [EPCIS 2.0](https://ref.gs1.org/standards/epcis/) — Event-based traceability with JSON-LD
> - [GS1 Web Vocabulary](https://www.gs1.org/voc/) — Linked data vocabulary

## Regulation Overview

**EU Deforestation Regulation (EUDR) 2023/1115**

- **Timeline**: Active since December 2024 (large operators), June 2025 (SMEs)
- **Scope**: Seven commodities - cattle, cocoa, coffee, oil palm, rubber, soya, wood
- **GS1 Code**: `gs1:RegulationTypeCode-DEFORESTATION_REGULATION`

**Key Requirements**:
1. Deforestation-free due diligence statements
2. Geolocation data for commodities (plot of land coordinates)
3. Supply chain traceability back to production location
4. Risk assessment and mitigation
5. EU Information System reference numbers

## Data Exchange Patterns

GS1 provides two complementary patterns for EUDR compliance, both supported by this module:

### 1. gs1:RegulatoryNotification (B2B Messaging)

Simple message format from [GS1 EUDR Standard](https://ref.gs1.org/standards/eudr/) for sharing Due Diligence Statement reference numbers between supply chain partners. Structure matches output from the [GS1 EUDR-tool](https://github.com/gs1/EUDR-tool):

```json
{
  "@context": "https://ref.gs1.org/standards/eudr/context.jsonld",
  "type": "RegulatoryNotification",
  "messageSender": { "partyGLN": "9521234000006" },
  "messageRecipient": { "partyGLN": "9521234000105" },
  "regulatoryInformation": {
    "regulatoryAct": "EU 2023/1115",
    "regulationType": "DEFORESTATION_REGULATION",
    "regulatoryIdentifier": {
      "regulatoryIdentifierType": "DUE_DILIGENCE_STATEMENT",
      "regulatoryReferenceNumber": "EUIS-2025-DE-00012345",
      "regulatoryVerificationNumber": "VN-2025-DE-00012345",
      "applicableProducts": [{ "gtin": "09521234000020" }]
    }
  }
}
```

See `examples/regulatory-notification.jsonld` for the complete example.

### 2. EPCIS Events (Supply Chain Visibility)

For full traceability, use EPCIS events per [GS1 Germany Guideline V1.11](https://www.gs1-germany.de/branchen-themen/nachhaltigkeit/eu-deforestation-regulation-eudr/):

**Standard EPCIS Traceability**:
- `commissioning` — Product creation at harvest
- `shipping` / `receiving` — Supply chain transfers
- `transforming` — Processing (e.g., logs → furniture)

**V1.11 Compliance Pattern** (for regulatory data sharing):
```json
{
  "type": "ObjectEvent",
  "bizStep": "notifying",
  "persistentDisposition": { "set": ["subject_to_regulation"] },
  "gs1:regulatoryInformation": [{
    "gs1:regulationType": "gs1:RegulationTypeCode-DEFORESTATION_REGULATION",
    "gs1:regulatoryIdentifier": {
      "gs1:regulatoryIdentifierType": "gs1:RegulatoryIdentifierType-DUE_DILIGENCE_STATEMENT",
      "gs1:regulatoryReferenceNumber": "EUIS-2025-DE-00012345"
    }
  }]
}
```

See `epcis/` directory for complete event examples.

## Module Contents

```
eudr/
├── VERSION                              # Module version (0.9.5)
├── CHANGELOG.md                         # Version history
├── README.md                            # This file
├── ontology/
│   └── eudr.ttl                        # EUDR vocabulary (extensions only)
├── json/
│   └── eudr.json                       # Generated JSON (for web apps)
├── examples/
│   ├── timber-product.jsonld           # Wood/timber product master data
│   ├── timber-derived.jsonld           # Derived product (furniture)
│   ├── plot-of-land.jsonld             # Production plot geolocation
│   └── regulatory-notification.jsonld  # B2B DDS sharing (GS1 p.0.0)
├── epcis/
│   ├── harvesting.jsonld               # Timber harvest (commissioning)
│   ├── processing.jsonld               # Sawmill processing (transformation)
│   ├── supply-chain-transfer.jsonld    # Shipping and receiving events
│   ├── origin-declaration.jsonld       # V1.11 notifying pattern
│   └── due-diligence-statement.jsonld  # EUDR declaration event
├── context/
│   └── eudr-context.jsonld             # JSON-LD context
├── validation/
│   └── eudr-profile.json               # Event Sentry validation profile
└── docs/
    ├── IMPLEMENTATION_GUIDE.md         # Step-by-step implementation
    ├── VOCABULARY_REFERENCE.md         # GS1 vs eudr: term guide
    ├── DIGITAL_LINK_PATTERNS.md        # GS1 Digital Link URI patterns
    └── EPCIS_EXTENSION_GUIDE.md        # EPCIS 2.0 integration & GS1-Extensions header
```

## Vocabulary Namespace

The EUDR vocabulary uses the namespace: `https://ref.openepcis.io/extensions/eu/eudr/`

Browse the vocabulary at: [ref.openepcis.io/extensions/eu/eudr/](https://ref.openepcis.io/extensions/eu/eudr/)

## Commodity Focus: Wood/Timber

This initial release focuses on **wood and timber** commodities (HS codes 44xx, 47xx, 48xx, 94xx):
- Round wood and logs
- Sawn wood and lumber
- Plywood and veneer
- Wood pellets and chips
- Pulp and paper
- Furniture
- Charcoal

Future releases will expand to other EUDR commodities.

## Key Concepts

### Geolocation Data
EUDR requires precise geographic coordinates for the plot of land where commodities were produced. Use standard `gs1:Place` with `gs1:GeoShape` (polygon) or `gs1:GeoCoordinates` (point):

```json
{
  "type": "gs1:Place",
  "id": "https://id.gs1.org/414/9521234000099",
  "gs1:locationGLN": "9521234000099",
  "gs1:physicalLocationName": [{ "@value": "Sustainable Oak Forest - Plot 47", "@language": "en" }],
  "gs1:geo": {
    "type": "gs1:GeoShape",
    "gs1:polygon": "[[13.40, 52.51], [13.41, 52.51], [13.41, 52.52], [13.40, 52.52], [13.40, 52.51]]"
  }
}
```

| Plot Size | Requirement | GS1 Pattern |
|-----------|-------------|-------------|
| > 4 hectares | Full polygon coordinates | `gs1:GeoShape` with `gs1:polygon` |
| ≤ 4 hectares | Center point sufficient | `gs1:GeoCoordinates` with lat/lon |

### Due Diligence Statement
Operators must declare products are deforestation-free using `gs1:regulatoryInformation`:

```json
{
  "gs1:regulatoryInformation": [{
    "gs1:regulationType": "gs1:RegulationTypeCode-DEFORESTATION_REGULATION",
    "gs1:regulatoryAct": "EU 2023/1115",
    "gs1:regulatoryIdentifier": {
      "gs1:regulatoryIdentifierType": "gs1:RegulatoryIdentifierType-DUE_DILIGENCE_STATEMENT",
      "gs1:regulatoryReferenceNumber": "EUIS-2025-DE-00012345"
    }
  }]
}
```

### Data Model Summary

| Data Type | Where It Lives | Pattern |
|-----------|---------------|---------|
| Geolocation (polygon) | Location master data | `gs1:masterDataAvailableFor` on `readPoint` |
| Species, weight | Product master data | `gs1:masterDataAvailableFor` on EPC |
| Due diligence | Event `gs1:regulatoryInformation` | GS1 Web Vocabulary pattern |
| EUIS reference | Event `gs1:regulatoryInformation` | Extension property |

## ESPR Framework Alignment

While EUDR 2023/1115 is a separate regulation from ESPR 2024/1781, both are part of the EU's broader sustainability agenda. The OpenEPCIS DPP framework provides shared patterns that work across both regulations.

### Shared ESPR Core Classes

The EUDR module reuses ESPR-aligned patterns from the core DPP module:

| ESPR Pattern | Core Class | EUDR Usage |
|--------------|------------|------------|
| Article 77 - Operator ID | `dpp:economicOperatorId` | EOID for operators placing products on EU market |
| Due Diligence | `dpp:DueDiligenceReport` | EUDR due diligence documentation |
| Documents | `dpp:DocumentReference` | Supporting certificates and reports |
| Operators | `dpp:OperatorInformation` | Economic operator details |

### Regulatory Framework Relationship

```
┌─────────────────────────────────────────────────────────────┐
│              EU Green Deal & Circular Economy                │
└─────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│  ESPR 2024/1781              │  │  EUDR 2023/1115              │
│  Ecodesign for Sustainable   │  │  Deforestation-Free          │
│  Products Regulation         │  │  Products Regulation         │
│  - Digital Product Passports │  │  - Due Diligence Statements  │
│  - Performance & Durability  │  │  - Geolocation Data          │
│  - Repairability             │  │  - Supply Chain Traceability │
│  - Substances of Concern     │  │  - Risk Assessment           │
└──────────────────────────────┘  └──────────────────────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
        ┌─────────────────────────────────────────────────────┐
        │         OpenEPCIS DPP Core Framework                 │
        │  Shared patterns: Operator info, due diligence,      │
        │  document references, GS1 Digital Link identifiers   │
        └─────────────────────────────────────────────────────┘
```

> **See also**: [ESPR Framework Documentation](../core/docs/ESPR_FRAMEWORK.md) for complete ESPR guidance applicable across all product categories.

## Dependencies

- **Core module**: `>= 0.9.5`
  - Uses `dpp:OperatorInformation` for economic operator data
  - Uses `dpp:DueDiligenceReport` for due diligence documentation
  - Uses `dpp:DocumentReference` for supporting documents

## Usage

### EPCIS 2.0 Extension Integration

This module is designed as a **first-class EPCIS 2.0 extension** per [EPCIS 2.0 Section 12.3](https://ref.gs1.org/standards/epcis/).

#### GS1-Extensions HTTP Header

Declare the EUDR extension in EPCIS capture/query requests:

```http
GS1-Extensions: eudr=https://ref.openepcis.io/extensions/eu/eudr/
```

With multiple extensions:

```http
GS1-Extensions: eudr=https://ref.openepcis.io/extensions/eu/eudr/, dpp=https://ref.openepcis.io/extensions/common/core/
```

See [docs/EPCIS_EXTENSION_GUIDE.md](./docs/EPCIS_EXTENSION_GUIDE.md) for complete EPCIS integration patterns.

### Import the ontology
```turtle
@prefix eudr: <https://ref.openepcis.io/extensions/eu/eudr/> .
@prefix dpp: <https://ref.openepcis.io/extensions/common/core/> .

# Your implementation imports EUDR
<https://example.com/my-implementation/> owl:imports <https://ref.openepcis.io/extensions/eu/eudr/> .
```

### Use the JSON-LD context
```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld"
  ]
}
```

## Vocabulary Namespaces

| Prefix | Namespace | Purpose |
|--------|-----------|---------|
| `gs1:` | `https://ref.gs1.org/voc/` | Core GS1 vocabulary (use for master data) |
| `dpp:` | `https://ref.openepcis.io/extensions/common/core/` | DPP Core extension properties |
| `eudr:` | `https://ref.openepcis.io/extensions/eu/eudr/` | EUDR extension properties (not yet standardised) |

**Note**: The `eudr:` namespace provides extension properties for EUDR-specific origin data. For master data, always prefer standard `gs1:` vocabulary (`gs1:Place`, `gs1:Product`, `gs1:Organization`).

## Two-Layer Approach: GS1 Standard + OpenEPCIS Extensions

This module implements a two-layer approach because GS1 EUDR p.0.0 is intentionally scoped to B2B messaging only:

### What GS1 EUDR p.0.0 Provides
- `gs1:RegulatoryNotification` — B2B message for sharing DDS reference numbers
- Properties: `messageSender`, `messageRecipient`, `regulatoryInformation`
- Transaction types: invoice (IV), order (ON), etc.

### What GS1 EUDR p.0.0 Does NOT Provide
- ❌ Harvest dates (`harvestDate`, `harvestDateStart`, `harvestDateEnd`)
- ❌ Species names (scientific/common)
- ❌ Detailed origin data model
- ❌ Risk assessment properties

### OpenEPCIS eudr: Extensions Fill the Gap

| eudr: Property | Justification |
|----------------|---------------|
| `eudr:harvestDate` | EUDR Article 9.1.d requirement — no GS1 equivalent |
| `eudr:harvestDateStart/End` | For harvest date ranges |
| `eudr:speciesScientificName` | EUDR Article 9.1.c requirement |
| `eudr:speciesCommonName` | Companion to scientific name |
| `eudr:commodityType` | EUDR Article 1.1 — 7 specific commodities |
| `eudr:timberProductType` | EUDR Annex I timber categories |
| `eudr:riskLevel` | EUDR Article 29 risk classification |
| `eudr:deforestationFreeDate` | EUDR cutoff verification |
| `eudr:legallyHarvested` | EUDR compliance flag |

### GS1 Web Vocabulary (Not EUDR-specific)

For general master data, use standard GS1 patterns:

| Use Case | GS1 Pattern |
|----------|-------------|
| Location with polygon | `gs1:Place` + `gs1:GeoShape` |
| Country of origin | `gs1:Country` + `gs1:countryCode` |
| Measurements (area, weight) | `gs1:QuantitativeValue` |
| Organizations | `gs1:Organization` |
| Products | `gs1:Product` |

## Cutoff Date

EUDR specifies **31 December 2020** as the cutoff date. Products must be proven deforestation-free from land that was not deforested after this date.

## Example Identifiers

All examples use GS1 demo prefix **952** (7-digit GCP: `9521234`) per [GS1 guidance](https://www.gs1.org/standards/barcodes-epcrfid-id-keys/gs1-general-specifications):
- GTIN: `09521234000020`
- GLN (Party): `9521234000006`
- GLN (Location): `9521234000099`

## License

Apache License 2.0 - See LICENSE file in repository root.

## References

- [EU Deforestation Regulation 2023/1115](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1115)
- [GS1 EUDR Standard](https://ref.gs1.org/standards/eudr/)
- [GS1 EUDR-tool](https://github.com/gs1/EUDR-tool) — Official notification generator
- [GS1 Germany EUDR Guideline V1.11](https://www.gs1-germany.de/branchen-themen/nachhaltigkeit/eu-deforestation-regulation-eudr/)
- [EPCIS 2.0 Standard](https://ref.gs1.org/standards/epcis/) — Section 12.3: GS1-Extensions header
- [European Commission EUDR FAQ](https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en)
