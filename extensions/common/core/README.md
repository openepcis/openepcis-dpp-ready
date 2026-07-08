# DPP Core Module

The core module provides ESPR-aligned shared patterns, classes, and vocabularies that are reused across all Digital Product Passport (DPP) domain modules.

> **Version**: 1.1.0 (ESPR-aligned)

## ESPR Framework Support

This module is aligned with the **EU Ecodesign for Sustainable Products Regulation (ESPR) 2024/1781**, providing patterns for:

| ESPR Article | Requirement | Core Support |
|--------------|-------------|--------------|
| Article 7 | Performance & Durability | `oec:PerformanceInfo`, `oec:RepairabilityInfo` |
| Article 7 | Material Composition | `oec:MaterialComposition`, `oec:RecycledContent` |
| Article 8 | Substances of Concern | `oec:SubstanceOfConcern` (SCIP aligned) |
| Article 9 | Access Rights | `oec:AccessRights`, `oec:AccessLevel` |
| Article 77 | Economic Operator Registry | `oec:economicOperatorId` (EOID) |

See [docs/ESPR_FRAMEWORK.md](./docs/ESPR_FRAMEWORK.md) for complete ESPR guidance.

## Overview

The core module provides:
- **ESPR-aligned ontology classes** for operator information, performance, repairability, and compliance
- **JSON-LD context** with GS1 and extension namespace declarations
- **Reusable patterns** documented for consistency across regulations
- **Access control patterns** for public vs. restricted data

## Contents

```
core/
├── VERSION                         # Module version (1.1.0)
├── CHANGELOG.md                    # Version history
├── README.md                       # This file
├── ontology/
│   └── dpp-core.ttl               # Core ontology (ESPR-aligned)
├── json/
│   └── dpp-core.json              # Generated JSON (for web apps)
├── context/
│   ├── dpp-core-context.jsonld    # JSON-LD context
│   └── gs1-shortcuts-context.jsonld # Optional GS1 convenience aliases
└── docs/
    ├── ESPR_FRAMEWORK.md          # Complete ESPR reference guide
    ├── PATTERNS.md                # Reusable patterns documentation
    └── GS1_STANDARDS.md           # GS1 standards reference
```

## Namespace

The core vocabulary uses the namespace: `https://ref.openepcis.io/extensions/common/core/`

Browse the vocabulary at: [ref.openepcis.io/extensions/common/core/](https://ref.openepcis.io/extensions/common/core/)

## EPCIS 2.0 Extension Declaration

Declare the DPP extension in EPCIS requests per Section 12.3:

```http
GS1-Extensions: oec=https://ref.openepcis.io/extensions/common/core/
```

## Ontology Classes

### ESPR-Specific Classes

| Class | Description | ESPR Article |
|-------|-------------|--------------|
| `oec:FacilityInformation` | Manufacturing facility data | Article 7 |
| `oec:PerformanceInfo` | Product durability and lifespan | Article 7 |
| `oec:RepairabilityInfo` | Repair scores, spare parts | Article 7 |
| `oec:SubstanceOfConcern` | SCIP-aligned substance tracking | Article 8 |
| `oec:AccessRights` | Data visibility control | Article 9 |

### General DPP Classes

| Class | Description |
|-------|-------------|
| `oec:OperatorInformation` | Economic operator data (now with EOID support) |
| `oec:DueDiligenceReport` | Supply chain due diligence |
| `oec:CircularityInfo` | End-of-life and recycling |
| `oec:HazardousSubstance` | CLP Regulation substances |
| `oec:MaterialComposition` | Material and CRM tracking |
| `oec:RecycledContent` | Pre/post consumer recycled content |
| `oec:DocumentReference` | External document references |

### Enumerations

| Enumeration | Purpose |
|-------------|---------|
| `oec:OperatorRole` | Manufacturer, Importer, Distributor, AuthorisedRepresentative, FulfilmentServiceProvider |
| `oec:AccessLevel` | Public, AuthorizedOnly, Restricted |
| `oec:ProductCategory` | Batteries, Textiles, Electronics, Furniture, etc. |
| `oec:HazardClass` | CLP Regulation hazard classes |
| `oec:DocumentType` | Certificate, TestReport, Manual, SafetyDataSheet, etc. |

## Key Properties

### Economic Operator (Article 77)

```json
{
  "type": "OperatorInformation",
  "oec:economicOperatorId": "EOID-DE-2025-123456",
  "oec:eoriNumber": "DE123456789012345",
  "operatorRole": "Manufacturer",
  "gs1:partyGLN": "9521234000006"
}
```

### Performance & Durability (Article 7)

```json
{
  "type": "PerformanceInfo",
  "oec:expectedLifespan": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "10",
    "gs1:unitCode": "ANN"
  },
  "oec:usageCycles": 3000,
  "oec:performanceClass": "A"
}
```

### Repairability (Article 7)

```json
{
  "type": "RepairabilityInfo",
  "oec:repairabilityScore": 7.5,
  "oec:repairabilityClass": "B",
  "oec:sparePartsAvailability": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "10",
    "gs1:unitCode": "ANN"
  },
  "oec:diyRepairPossible": true
}
```

### Access Control (Article 9)

```json
{
  "type": "AccessRights",
  "oec:accessLevel": "Public"
}
```

## Version Dependencies

Domain modules declare their minimum required core version:

| Module | Minimum Core Version |
|--------|---------------------|
| battery | >= 1.1.0 |
| eudr | >= 1.1.0 |
| textile | >= 1.1.0 (planned) |
| electronics | >= 1.1.0 (planned) |

## Usage

### Import the Ontology

```turtle
@prefix oec: <https://ref.openepcis.io/extensions/common/core/> .

# Your domain ontology imports core
<https://ref.openepcis.io/extensions/yourdomain/> owl:imports <https://ref.openepcis.io/extensions/common/core/> .
```

### Use the JSON-LD Context

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/yourdomain/yourdomain-context.jsonld"
  ]
}
```

### Optional: GS1 Shortcuts Context

For cleaner syntax with GS1 RegulationTypeCode values, include the shortcuts context:

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/gs1-shortcuts-context.jsonld"
  ],
  "gs1:regulatoryInformation": {
    "gs1:regulationType": "BATTERY_DIRECTIVE",
    "gs1:regulatoryAct": "EU 2023/1542",
    "gs1:isRegulationCompliant": true
  }
}
```

Without shortcuts (standard GS1 syntax):
```json
"gs1:regulationType": { "id": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE" }
```

With shortcuts:
```json
"gs1:regulationType": "BATTERY_DIRECTIVE"
```

Available shortcuts include: `BATTERY_DIRECTIVE`, `DEFORESTATION_REGULATION`, `ROHS_DIRECTIVE`, `WEEE_DIRECTIVE`, `REACH`, `CE_MARKING`, and more.

### HTTP Headers

Include the GS1-Extensions header in EPCIS requests:

```http
POST /capture HTTP/1.1
Content-Type: application/ld+json
GS1-Extensions: oec=https://ref.openepcis.io/extensions/common/core/
```

## Documentation

- [ESPR Framework Guide](./docs/ESPR_FRAMEWORK.md) - Complete ESPR reference
- [Patterns Reference](./docs/PATTERNS.md) - Reusable implementation patterns
- [GS1 Standards](./docs/GS1_STANDARDS.md) - Links to GS1 standards used

## License

Apache License 2.0 - See LICENSE file in repository root.

## Disclaimer

This is **not official GS1 guidance**, but follows official GS1 standards:
- [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link)
- [EPCIS 2.0](https://ref.gs1.org/standards/epcis/)
- [GS1 Web Vocabulary](https://www.gs1.org/voc/)
- [GS1 DPP Standards](https://ref.gs1.org/standards/)

## References

- [ESPR Regulation 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781)
- [CIRPASS Project](https://cirpassproject.eu/)
- [ECHA SCIP Database](https://echa.europa.eu/scip)
