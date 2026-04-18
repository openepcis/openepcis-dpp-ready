# ESPR Framework Reference

This document provides comprehensive guidance on how the OpenEPCIS DPP-Ready framework supports the EU Ecodesign for Sustainable Products Regulation (ESPR) 2024/1781.

## Table of Contents

1. [Regulation Overview](#regulation-overview)
2. [What is ESPR?](#what-is-espr)
3. [Key ESPR Requirements](#key-espr-requirements)
4. [Priority Product Categories](#priority-product-categories)
5. [OpenEPCIS ESPR Classes](#openepcis-espr-classes)
6. [OpenEPCIS ESPR Properties](#openepcis-espr-properties)
7. [Data Architecture](#data-architecture)
8. [Access Control](#access-control-article-9)
9. [Economic Operator Registration](#economic-operator-registration-article-77)
10. [GS1 Standards Alignment](#gs1-standards-alignment)
11. [Implementation Timeline](#implementation-timeline)
12. [Related Initiatives](#related-initiatives)
13. [References](#references)

---

## Regulation Overview

**Ecodesign for Sustainable Products Regulation (ESPR)**
- **Citation**: EU Regulation 2024/1781
- **Full Title**: Regulation establishing a framework for setting ecodesign requirements for sustainable products
- **Entry into Force**: 18 July 2024
- **Official Journal**: [OJ L, 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781)
- **First DPPs**: February 2027 (batteries as first priority)

---

## What is ESPR?

The **Ecodesign for Sustainable Products Regulation (ESPR)** is a cornerstone of the EU's Circular Economy Action Plan. It replaces and significantly expands the scope of the previous Ecodesign Directive 2009/125/EC.

### Key Objectives

1. **Improve product sustainability** - Set requirements for durability, repairability, recyclability
2. **Enable informed choices** - Provide consumers with reliable product information
3. **Create level playing field** - Harmonize requirements across the EU single market
4. **Support circular economy** - Reduce waste and promote resource efficiency
5. **Combat greenwashing** - Standardize environmental claims

### Digital Product Passport (DPP)

ESPR introduces the **Digital Product Passport** as a mandatory requirement for products covered by delegated acts. The DPP is a structured data set that:

- Provides product information throughout its lifecycle
- Is accessible via a data carrier (QR code, NFC, RFID)
- Contains both public and restricted information
- Is interoperable across the EU
- Supports market surveillance and customs

### Scope

ESPR covers virtually all physical products placed on the EU market, with exceptions for:
- Food and feed
- Medicinal products
- Veterinary medicinal products
- Living organisms
- Motor vehicles (covered by other regulations)

### Key ESPR Requirements

| Article | Requirement | OpenEPCIS Support |
|---------|-------------|-------------------|
| Article 7 | Performance & Durability | `dpp:PerformanceInfo`, `dpp:RepairabilityInfo` |
| Article 8 | Substances of Concern | `dpp:SubstanceOfConcern` |
| Article 9 | Access Rights | `dpp:AccessRights`, `dpp:AccessLevel` |
| Article 77 | Economic Operator Registry | `dpp:economicOperatorId` |

---

## OpenEPCIS ESPR Classes

The core module provides the following ESPR-aligned classes:

| Class | Description | ESPR Article |
|-------|-------------|--------------|
| `dpp:OperatorInformation` | Economic operator data with EOID support | Article 77 |
| `dpp:FacilityInformation` | Manufacturing facility details | Article 7 |
| `dpp:PerformanceInfo` | Product performance and durability | Article 7 |
| `dpp:RepairabilityInfo` | Repair scores, spare parts, instructions | Article 7 |
| `dpp:SubstanceOfConcern` | SCIP-aligned hazardous substance tracking | Article 8 |
| `dpp:AccessRights` | Data visibility control | Article 9 |
| `dpp:CircularityInfo` | End-of-life and recycling information | Article 7 |
| `dpp:MaterialComposition` | Material composition with CRM tracking | Article 7 |
| `dpp:RecycledContent` | Pre/post consumer recycled content | Article 7 |
| `dpp:DueDiligenceReport` | Supply chain due diligence | Article 7 |
| `dpp:DocumentReference` | Supporting documents and certificates | General |

### Enumerations

| Enumeration | Values | Purpose |
|-------------|--------|---------|
| `dpp:OperatorRole` | Manufacturer, Importer, Distributor, AuthorisedRepresentative, FulfilmentServiceProvider, Processor, Trader | ESPR Articles 15-17 |
| `dpp:AccessLevel` | Public, AuthorizedOnly, Restricted | Article 9 |
| `dpp:ProductCategory` | Batteries, Textiles, Electronics, Furniture, Tyres, ConstructionProducts, Chemicals, Packaging, FoodContact, IronSteel, Aluminium | ESPR priority sectors |
| `dpp:HazardClass` | CLP Regulation hazard classes | Article 8 |
| `dpp:DocumentType` | Certificate, TestReport, Manual, SafetyDataSheet, etc. | General |

---

## OpenEPCIS ESPR Properties

### Product Identification

| Property | Type | Description |
|----------|------|-------------|
| `dpp:uniqueProductIdentifier` | URI | GS1 Digital Link product identifier |
| `dpp:passportIdentifier` | URI | Unique DPP instance identifier |
| `dpp:passportVersion` | string | DPP version number |
| `dpp:passportIssueDate` | date | DPP creation date |
| `dpp:passportStatus` | PassportStatus | Draft, Active, Updated, Withdrawn, Archived |
| `dpp:passportLastModified` | dateTime | Last modification timestamp |
| `dpp:passportExpiryDate` | date | Passport expiry/renewal date |
| `dpp:passportIssuer` | OperatorInformation | Responsible economic operator |
| `dpp:previousPassportVersion` | URI | Link to previous passport version |
| `dpp:productModel` | string | Manufacturer model identifier |
| `dpp:productCategory` | ProductCategory | ESPR product category |

### Economic Operator (Article 77)

| Property | Type | Description |
|----------|------|-------------|
| `dpp:economicOperatorId` | string | EU-wide EOID number |
| `dpp:eoriNumber` | string | Customs EORI number |
| `dpp:vatIdentificationNumber` | string | VAT ID |
| `dpp:operatorRole` | OperatorRole | Role in supply chain |
| `dpp:registrationNumber` | string | National registration |

### Facility Information

| Property | Type | Description |
|----------|------|-------------|
| `gs1:gln` | string | Facility identifier (GLN, inherited from gs1:Place) |
| `gs1:name` | string | Facility name (inherited from gs1:Place) |
| `dpp:facilityType` | string | Manufacturing, Processing, Assembly |
| `gs1:address` | PostalAddress | Physical address (inherited from gs1:Place) |
| `dpp:facilityCertifications` | CertificationDetails | ISO and other certifications |

### Performance & Durability (Article 7)

| Property | Type | Description |
|----------|------|-------------|
| `dpp:expectedLifespan` | QuantitativeValue | Expected product lifetime |
| `dpp:guaranteedLifespan` | QuantitativeValue | Manufacturer guarantee |
| `dpp:usageCycles` | integer | Expected usage cycles |
| `dpp:technicalLifetime` | QuantitativeValue | Technical lifetime |
| `dpp:performanceClass` | string | A-G efficiency class |
| `dpp:testedConditions` | string | Test conditions description |

### Repairability (Article 7)

| Property | Type | Description |
|----------|------|-------------|
| `dpp:repairabilityScore` | decimal | 0-10 repairability index |
| `dpp:repairabilityClass` | string | A-E repairability class |
| `dpp:sparePartsAvailability` | QuantitativeValue | Years spare parts available |
| `dpp:sparePartsDeliveryTime` | QuantitativeValue | Max delivery time |
| `dpp:diyRepairPossible` | boolean | Consumer repair possible |
| `dpp:professionalRepairNetwork` | URI | Find repair services |
| `dpp:repairInstructions` | DocumentReference | Repair manual |
| `dpp:softwareUpdatesAvailability` | QuantitativeValue | Software support period |

### Substances of Concern (Article 8)

| Property | Type | Description |
|----------|------|-------------|
| `dpp:substancesOfConcern` | SubstanceOfConcern[] | List of SVHCs |
| `dpp:ecNumber` | string | EINECS/ELINCS number |
| `dpp:scipId` | string | ECHA SCIP database ID |
| `dpp:substanceLocation` | string | Location in product |
| `dpp:safeUseInstructions` | string | Safe handling |
| `dpp:safeDisassemblyInstructions` | string | Safe disassembly |

### Access Control (Article 9)

| Property | Type | Description |
|----------|------|-------------|
| `dpp:accessRights` | AccessRights | Access configuration |
| `dpp:accessLevel` | AccessLevel | Public, AuthorizedOnly, Restricted |
| `dpp:authorizedParties` | Organization[] | Parties with access |
| `dpp:dataRetentionPeriod` | QuantitativeValue | Data retention requirement |

---

## Priority Product Categories

ESPR establishes priority sectors for DPP implementation. The framework supports all planned categories:

| Category | Module | Status | GS1 Code |
|----------|--------|--------|----------|
| Batteries | `battery/` | Production Ready | `gs1:RegulationTypeCode-BATTERY_DIRECTIVE` |
| Textiles | `textile/` | Planned | TBD |
| Electronics | `electronics/` | Planned | TBD |
| Furniture | Future | Planned | TBD |
| Tyres | Future | Planned | TBD |
| Construction | Future | Planned | TBD |

---

## Data Architecture

### ESPR Data Point Categories

ESPR defines approximately 125 data points grouped into categories. The core module provides patterns for each:

#### 1. Product Identification
```json
{
  "dpp:uniqueProductIdentifier": { "id": "https://id.gs1.org/01/09521234000013/21/SN-001" },
  "dpp:productModel": "MODEL-2025-A",
  "dpp:productCategory": "Electronics",
  "dpp:passportIdentifier": { "id": "https://id.gs1.org/01/09521234000013/21/SN-001/10/DPP" },
  "dpp:passportVersion": "1.0",
  "dpp:passportIssueDate": "2025-01-15"
}
```

#### 2. Economic Operator Information
```json
{
  "type": "OperatorInformation",
  "operatorRole": "Manufacturer",
  "dpp:economicOperatorId": "EOID-DE-2025-123456",
  "gs1:partyGLN": "9521234000006",
  "gs1:organizationName": "Example GmbH"
}
```

#### 3. Manufacturing Information
```json
{
  "type": "FacilityInformation",
  "gs1:gln": "9521234000099",
  "gs1:name": "Production Plant Berlin",
  "dpp:facilityType": "Manufacturing"
}
```

#### 4. Performance & Durability
```json
{
  "type": "PerformanceInfo",
  "dpp:expectedLifespan": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "10",
    "gs1:unitCode": "ANN"
  },
  "dpp:usageCycles": 3000,
  "dpp:performanceClass": "A"
}
```

#### 5. Repairability
```json
{
  "type": "RepairabilityInfo",
  "dpp:repairabilityScore": 7.5,
  "dpp:repairabilityClass": "B",
  "dpp:sparePartsAvailability": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "10",
    "gs1:unitCode": "ANN"
  },
  "dpp:diyRepairPossible": true
}
```

#### 6. Substances of Concern
```json
{
  "type": "SubstanceOfConcern",
  "dpp:substanceName": "Lead",
  "dpp:casNumber": "7439-92-1",
  "dpp:scipId": "SCIP-12345678",
  "dpp:substanceLocation": "Battery electrodes",
  "dpp:safeUseInstructions": "Avoid contact"
}
```

#### 7. Carbon Footprint
```json
{
  "dpp:carbonFootprintTotal": 45.2,
  "dpp:carbonFootprintUnit": "kg CO2e/unit",
  "dpp:carbonFootprintStudyUrl": { "id": "https://example.com/cfp-study.pdf" }
}
```

#### 8. Circularity
```json
{
  "type": "CircularityInfo",
  "dpp:recyclabilityRate": 95.5,
  "dpp:endOfLifeInstructions": { "id": "https://example.com/eol-guide.pdf" }
}
```

---

## Access Control (Article 9)

ESPR Article 9 defines three access levels for DPP data:

### Public Data (Article 9.1)
Accessible to all users including consumers:
- Product identification
- Manufacturer information
- Environmental labels
- Basic specifications
- Recycling instructions

```json
{
  "dpp:accessRights": {
    "type": "AccessRights",
    "dpp:accessLevel": "Public"
  }
}
```

### Authorized Only (Article 9.2)
Accessible to market surveillance and customs authorities:
- Detailed test reports
- Compliance documentation
- Due diligence reports
- Supply chain details

```json
{
  "dpp:accessRights": {
    "type": "AccessRights",
    "dpp:accessLevel": "AuthorizedOnly"
  }
}
```

### Restricted (Article 9.3)
Accessible to specific authorized economic operators:
- Trade secrets
- Manufacturing processes
- Proprietary formulations

```json
{
  "dpp:accessRights": {
    "type": "AccessRights",
    "dpp:accessLevel": "Restricted",
    "dpp:authorizedParties": [
      {
        "type": "gs1:Organization",
        "gs1:partyGLN": "9521234000105"
      }
    ]
  }
}
```

---

## Economic Operator Registration (Article 77)

ESPR Article 77 establishes a single EU-wide registry for economic operators. The Economic Operator ID (EOID) replaces national registrations:

```json
{
  "type": "OperatorInformation",
  "dpp:economicOperatorId": "EOID-DE-2025-123456",
  "dpp:eoriNumber": "DE123456789012345",
  "dpp:vatIdentificationNumber": "DE123456789"
}
```

### Operator Roles per ESPR

| Role | ESPR Article | DPP Value |
|------|--------------|-----------|
| Manufacturer | Article 15 | `dpp:Manufacturer` |
| Importer | Article 16 | `dpp:Importer` |
| Authorised Representative | Article 16 | `dpp:AuthorisedRepresentative` |
| Distributor | Article 17 | `dpp:Distributor` |
| Fulfilment Service Provider | Article 17 | `dpp:FulfilmentServiceProvider` |

---

## GS1 Standards Alignment

The framework aligns with GS1 standards for interoperability:

### GS1 DPP Provisional Standard
- Uses GS1 Digital Link for product identification
- Supports GS1 Web Vocabulary for master data
- Compatible with EPCIS 2.0 for supply chain events

### GS1-Extensions Header
Declare the DPP extension in EPCIS requests:
```http
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/
```

### Context Integration
```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld"
  ]
}
```

---

## Implementation Timeline

| Date | Milestone |
|------|-----------|
| July 2024 | ESPR enters into force |
| February 2027 | First DPPs operational (batteries) |
| 2028-2030 | Textiles, electronics, furniture |
| 2030+ | Additional product categories |

---

## Related Initiatives

### CIRPASS-2
EU project developing DPP data architecture and ontology requirements:
- Data model specifications
- Interoperability requirements
- Cross-sector harmonization

### ISO/UNECE JWG9
Joint working group developing ISO 25534-1:
- Global DPP standard
- Cross-border interoperability
- Terminology harmonization

### GS1 Global Office
- GS1 DPP Provisional Standard
- GS1 Digital Link for product identification
- EPCIS 2.0 for supply chain visibility

---

## References

- [ESPR Regulation 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781)
- [GS1 DPP Standards](https://ref.gs1.org/standards/dpp/)
- [CIRPASS Project](https://cirpassproject.eu/)
- [ECHA SCIP Database](https://echa.europa.eu/scip)
