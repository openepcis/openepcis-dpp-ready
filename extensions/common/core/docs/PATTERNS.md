# DPP Core Reusable Patterns

This document describes the reusable patterns in the DPP Core module that can be applied across different regulation-specific DPP implementations. The core module is aligned with the EU Ecodesign for Sustainable Products Regulation (ESPR) 2024/1781.

> **Read first**: [Vocabulary Layering](../../../../docs/VOCABULARY_LAYERING.md) — the
> four-layer delegation pattern (regulation modules → `oec:` → UNTP/schema.org → GS1).
> The patterns below are at Layer 3 (`oec:`); most are anchored upward via
> `owl:equivalentClass`/`equivalentProperty` to a Layer-2 term in UNTP v0.7.0
> (`vocabulary.uncefact.org/untp/0.7.0/`) or schema.org. When implementing a
> regulation module, **delegate** — don't redefine.

## Table of Contents

1. [JSON-LD Context Usage](#json-ld-context-usage)
2. [Data Exchange Patterns](#data-exchange-patterns)
3. [ESPR Framework Patterns](#espr-framework-patterns)
4. [Operator Information Pattern](#operator-information-pattern)
5. [Facility Information Pattern](#facility-information-pattern)
6. [Due Diligence Report Pattern](#due-diligence-report-pattern)
7. [Regulatory Information Pattern](#regulatory-information-pattern)
8. [Hazardous Substance Pattern](#hazardous-substance-pattern)
9. [Performance and Durability Pattern](#performance-and-durability-pattern)
10. [Repairability Pattern](#repairability-pattern)
11. [Document Reference Pattern](#document-reference-pattern)
12. [Circularity Information Pattern](#circularity-information-pattern)
13. [Material Composition Pattern](#material-composition-pattern)
14. [Carbon Footprint Pattern](#carbon-footprint-pattern)
15. [Access Rights Pattern](#access-rights-pattern)
16. [Extended Producer Responsibility Pattern](#extended-producer-responsibility-pattern)
17. [Compostability / Biodegradability / Bio-based Pattern](#compostability--biodegradability--bio-based-pattern)
18. [Deposit-Return Scheme Pattern](#deposit-return-scheme-pattern)

**See also**: [LINK_TYPES.md](LINK_TYPES.md) — GS1 link type routing and JSON-LD response mapping

---

## JSON-LD Context Usage

### Context Imports

The DPP Core context defines only OpenEPCIS-specific extensions (`oec:` namespace). GS1 terms must be resolved by importing the appropriate official GS1 context alongside the DPP context.

**For EPCIS Events** (supply chain traceability):
```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    {
      "battery": "https://ref.openepcis.io/extensions/eu/battery/"
    }
  ]
}
```

Include the GS1-Extensions header in HTTP requests:
```http
GS1-Extensions: oec=https://ref.openepcis.io/extensions/common/core/, eubat=https://ref.openepcis.io/extensions/eu/battery/
```

**For Product Master Data** (Digital Link resolution):
```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    {
      "battery": "https://ref.openepcis.io/extensions/eu/battery/"
    }
  ]
}
```

**For EUDR** (deforestation regulation):
```json
{
  "@context": [
    "https://ref.gs1.org/standards/eudr/context.jsonld",
    "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld"
  ]
}
```

### Namespace References

| Prefix | Namespace | GS1-Extensions Header |
|--------|-----------|----------------------|
| `gs1:` | `https://ref.gs1.org/voc/` | (official GS1, no header needed) |
| `oec:` | `https://ref.openepcis.io/extensions/common/core/` | `oec=https://ref.openepcis.io/extensions/common/core/` |
| `eubat:` | `https://ref.openepcis.io/extensions/eu/battery/` | `eubat=https://ref.openepcis.io/extensions/eu/battery/` |
| `eudr:` | `https://ref.openepcis.io/extensions/eu/eudr/` | `eudr=https://ref.openepcis.io/extensions/eu/eudr/` |

---

## Data Exchange Patterns

### Purpose

All DPP modules support two complementary patterns for regulatory data exchange, following GS1 best practices established in the [GS1 EUDR Standard](https://ref.gs1.org/standards/eudr/):

| Pattern | Purpose | Use Case |
|---------|---------|----------|
| **B2B Messaging** | Simple JSON-LD messages | Share compliance status between partners |
| **EPCIS Events** | Full traceability with provenance | Audit trail, supply chain visibility |

### Pattern 1: RegulatoryNotification (B2B Messaging)

Lightweight JSON-LD message for direct partner-to-partner compliance communication:

```json
{
  "@context": [...],
  "type": "RegulatoryNotification",
  "messageSender": {
    "type": "Organization",
    "partyGLN": "9521234000006"
  },
  "messageRecipient": {
    "type": "Organization",
    "partyGLN": "9521234000105"
  },
  "regulatoryInformation": {
    "regulatoryAct": "EU 2023/1542",
    "regulationType": { "id": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE" },
    "isRegulationCompliant": true,
    "regulatoryIdentifier": {
      "regulatoryIdentifierType": { "id": "gs1:RegulatoryIdentifierType-EU_DECLARATION_OF_CONFORMITY" },
      "regulatoryReferenceNumber": "DoC-2024-00123"
    }
  }
}
```

**When to use**:
- Sharing compliance certificates between trading partners
- B2B EDI-style messaging
- Simple compliance status queries

### Pattern 2: EPCIS Events (Supply Chain Visibility)

Full EPCIS events with provenance for auditable traceability. Per GS1 Germany EUDR Guideline V1.11, `regulatoryInformation` should be **nested inside** the product entry in `gs1:masterDataAvailableFor`.

**Architecture rule**: `gs1:masterDataAvailableFor` contains ONLY `gs1:` namespace properties. Extension properties (`oec:`, `eudr:`, `eubat:`, etc.) go at **event level** -- as siblings of `bizStep`, `epcList`, etc. See [EPCIS_MASTERDATA_AND_EXTENSIONS.md](EPCIS_MASTERDATA_AND_EXTENSIONS.md) for the authoritative guide.

**Important**: Inside `gs1:masterDataAvailableFor`, the `gs1:` prefix is NOT required - use bare property names and string values:

```json
{
  "type": "ObjectEvent",
  "eventTime": "2025-01-15T10:00:00Z",
  "action": "OBSERVE",
  "bizStep": "notifying",
  "persistentDisposition": {
    "set": ["subject_to_regulation"]
  },

  "quantityList": [
    {
      "epcClass": "https://id.gs1.org/01/09521234000020/10/BATCH-2025-01",
      "quantity": 850,
      "uom": "KGM"
    }
  ],

  "readPoint": {
    "id": "https://id.gs1.org/414/9521234000006"
  },

  "gs1:masterDataAvailableFor": [
    {
      "id": "https://id.gs1.org/01/09521234000020/10/BATCH-2025-01",
      "productName": "European Oak Round Wood",
      "gtin": "09521234000020",
      "hasBatchLotNumber": "BATCH-2025-01",
      "countryOfOrigin": "DE",
      "regulatoryInformation": [
        {
          "regulationType": "DEFORESTATION_REGULATION",
          "regulatoryAct": "EU 2023/1115",
          "isRegulationCompliant": true,
          "regulatoryIdentifierType": "DUE_DILIGENCE_STATEMENT",
          "regulatoryReferenceNumber": "EUIS-2025-DE-00012345"
        }
      ]
    },
    {
      "id": "https://id.gs1.org/414/9521234000099",
      "locationGLN": "9521234000099",
      "physicalLocationName": "Forest Plot 47",
      "geo": {
        "polygon": "[[13.40, 52.51], [13.41, 52.51], [13.41, 52.52], [13.40, 52.52], [13.40, 52.51]]"
      },
      "countryCode": "DE"
    },
    {
      "id": "https://id.gs1.org/417/9521234000006",
      "organizationName": "Example GmbH",
      "partyGLN": "9521234000006",
      "countryCode": "DE"
    }
  ],

  "eudr:commodityType": "Wood",
  "eudr:speciesScientificName": "Quercus robur",
  "eudr:speciesCommonName": "European Oak"
}
```

**Key points per GS1 Germany EUDR Guideline V1.11**:
- `epcList` or `quantityList` contains product identifiers (serialized or batch-level)
- `gs1:masterDataAvailableFor` is a **top-level array** on the event -- contains ONLY `gs1:` properties
- **Extension properties** (`eudr:`, `oec:`, `eubat:`, etc.) go at **event level** -- siblings of `bizStep`
- **Inside `masterDataAvailableFor`, use bare property names** (no `gs1:` prefix) - the namespace is assumed
- **Use bare string values** like `"regulationType": "DEFORESTATION_REGULATION"` (not `{ "id": "gs1:..." }`)
- **`regulatoryInformation` is nested INSIDE the product entry** (not at event level)
- For EUDR: use `bizStep: "notifying"` and `persistentDisposition: { "set": ["subject_to_regulation"] }`
- The "notifying" event eliminates the need for redundant inclusion in subsequent shipping/packing events

**When to use**:
- Full supply chain traceability
- Regulatory audits requiring provenance
- Event-sourced compliance records
- Sharing complete master data with events

### Module Implementation

Each DPP module should provide examples of both patterns:

| Module | B2B Notification | EPCIS Events |
|--------|------------------|--------------|
| Battery | `examples/regulatory-notification.jsonld` | `epcis/*.jsonld` (8 types) |
| EUDR | `examples/regulatory-notification.jsonld` | `epcis/*.jsonld` (5 types) |
| Textile | `examples/regulatory-notification.jsonld` | `epcis/*.jsonld` |
| Electronics | `examples/regulatory-notification.jsonld` | `epcis/*.jsonld` |

---

## ESPR Framework Patterns

### Overview

The EU Ecodesign for Sustainable Products Regulation (ESPR) 2024/1781 establishes the framework for Digital Product Passports. Key ESPR data requirements supported by DPP Core:

| ESPR Article | Requirement | DPP Pattern |
|--------------|-------------|-------------|
| Article 7 | Performance & Durability | `oec:PerformanceInfo` |
| Article 7 | Repairability | `oec:RepairabilityInfo` |
| Article 8 | Substances of Concern | `oec:SubstanceOfConcern` |
| Article 9 | Access Rights | `oec:AccessRights` |
| Article 77 | Economic Operator Registration | `oec:economicOperatorId` |

### ESPR Product Categories

```json
{
  "oec:productCategory": "Electronics"
}
```

Available categories: `Batteries`, `Textiles`, `Electronics`, `Furniture`, `Tyres`, `ConstructionProducts`, `Chemicals`, `Packaging`, `FoodContact`, `IronSteel`, `Aluminium`

### Unique Product Identifier

Per ESPR, use GS1 Digital Link format:

```json
{
  "gs1:productID": { "id": "https://id.gs1.org/01/09521234000013/21/SN-2025-001" },
  "oec:passportIdentifier": { "id": "https://id.gs1.org/01/09521234000013/21/SN-2025-001/10/DPP-v1" },
  "oec:passportVersion": "1.0",
  "oec:passportIssueDate": "2025-01-15",
  "oec:passportStatus": "Active",
  "oec:passportLastModified": "2025-01-15T10:30:00Z",
  "oec:passportIssuer": {
    "type": "OperatorInformation",
    "operatorRole": "Manufacturer",
    "organizationName": "Example Corp"
  }
}
```

---

## Operator Information Pattern

### Purpose
Capture economic operator data as required by EU Market Surveillance Regulation, ESPR, and domain-specific regulations.

### Structure
```json
{
  "type": "OperatorInformation",
  "operatorRole": "Manufacturer",
  "gln": "9521234000006",
  "gs1:organizationName": "Example Manufacturing GmbH",
  "oec:economicOperatorId": "EOID-DE-2025-123456",
  "oec:eoriNumber": "DE123456789012345",
  "schema:vatID": "DE123456789",
  "registrationNumber": "DE-REG-2024-001234",
  "gs1:address": {
    "type": "PostalAddress",
    "streetAddress": "Industrial Park 1",
    "addressLocality": "Berlin",
    "postalCode": "10115",
    "addressCountry": "DE"
  }
}
```

**Note:** Use `gs1:gln` (mapped as `gln` in context) for operator identification since `oec:OperatorInformation` extends `gs1:Organization`.

### ESPR Economic Operator ID (Article 77)

ESPR Article 77 establishes a single EU-wide economic operator registry. The `economicOperatorId` (EOID) replaces national registrations:

```json
{
  "oec:economicOperatorId": "EOID-DE-2025-123456"
}
```

### Operator Roles
- `oec:Manufacturer` - Entity that manufactures the product
- `oec:Importer` - Entity that imports the product into the EU
- `oec:Distributor` - Entity that distributes the product
- `oec:Processor` - Entity that processes raw materials (EUDR)
- `oec:Trader` - Entity that trades commodities (EUDR)
- `oec:AuthorisedRepresentative` - Entity authorized to act on behalf of manufacturer (ESPR Article 16)
- `oec:FulfilmentServiceProvider` - Entity providing fulfilment services (ESPR Article 17)

### Usage
- **Battery DPP**: Required per Article 38
- **EUDR**: Operator placing product on EU market
- **Textile DPP**: Economic operator information
- **ESPR**: All product categories per Article 77

---

## Facility Information Pattern

### Purpose
Capture manufacturing or processing facility information per ESPR requirements.

### Structure
```json
{
  "type": "FacilityInformation",
  "gln": "9521234000099",
  "gs1:name": "Example Manufacturing Plant Berlin",
  "oec:facilityType": "Manufacturing",
  "gs1:address": {
    "type": "gs1:PostalAddress",
    "gs1:streetAddress": "Industrial Park 1",
    "gs1:addressLocality": "Berlin",
    "gs1:postalCode": "10115",
    "gs1:addressCountry": "DE"
  },
  "oec:facilityCertifications": [
    {
      "type": "gs1:CertificationDetails",
      "gs1:certificationStandard": "ISO 14001:2015",
      "gs1:certificationAgency": "TÜV Rheinland"
    }
  ]
}
```

**Note:** Use `gs1:gln` (mapped as `gln` in context) for facility identification, `gs1:name` for facility name, and `gs1:address` for location since `oec:FacilityInformation` extends `gs1:Place`.

### GS1 Digital Link Format

For facility identifiers, use GLN with Digital Link:
```
https://id.gs1.org/414/9521234000099
```

### Usage
- **All ESPR categories**: Manufacturing location transparency
- **Battery DPP**: Factory identification for traceability
- **EUDR**: Processing facility for commodities

---

## Due Diligence Report Pattern

### Purpose
Reference supply chain due diligence documentation required by various regulations.

### Structure
```json
{
  "type": "DueDiligenceReport",
  "reportUrl": { "id": "https://example.com/due-diligence/2024-report.pdf" },
  "thirdPartyAssurancesUrl": { "id": "https://example.com/verification/cert-123.pdf" },
  "reportDate": "2024-06-15",
  "verificationBody": {
    "type": "Organization",
    "organizationName": "Verification Corp",
    "globalLocationNumber": "9521234000099"
  }
}
```

### Usage
- **Battery DPP**: Article 39 supply chain due diligence
- **EUDR**: Deforestation-free due diligence statement
- **Textile DPP**: Supply chain transparency

---

## Regulatory Information Pattern

### Purpose
Declare compliance with specific regulations using the GS1 `gs1:regulatoryInformation` pattern.

### Structure (on EPCIS Event)
```json
{
  "type": "ObjectEvent",
  "gs1:regulatoryInformation": [{
    "type": "RegulatoryInformation",
    "regulationType": { "id": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE" },
    "regulatoryAct": "EU 2023/1542",
    "isRegulationCompliant": true,
    "gs1:regulatoryReferenceNumber": "EU-REF-2024-001234",
    "oec:complianceDate": "2025-01-15"
  }]
}
```

### Key Regulation Type Codes
| Regulation | GS1 Code |
|------------|----------|
| Battery Directive | `gs1:RegulationTypeCode-BATTERY_DIRECTIVE` |
| EUDR | `gs1:RegulationTypeCode-DEFORESTATION_REGULATION` |
| RoHS | `gs1:RegulationTypeCode-ROHS_DIRECTIVE` |
| WEEE | `gs1:RegulationTypeCode-WEEE_DIRECTIVE` |

---

## Hazardous Substance Pattern

### Purpose
Declare hazardous substances per CLP Regulation 1272/2008.

### Structure
```json
{
  "type": "HazardousSubstance",
  "substanceName": "Cobalt compounds",
  "casNumber": "7440-48-4",
  "hazardClass": "Carcinogenicity",
  "concentration": 12.5,
  "hazardImpact": "May cause cancer by inhalation"
}
```

### Hazard Classes (CLP)
- `AcuteToxicity`
- `SkinCorrosionOrIrritation`
- `EyeDamageOrIrritation`
- `RespiratoryOrSkinSensitization`
- `GermCellMutagenicity`
- `Carcinogenicity`
- `ReproductiveToxicity`
- `SpecificTargetOrganToxicity`
- `AspirationHazard`
- `HazardousToAquaticEnvironment`

---

## Substances of Concern Pattern (ESPR Article 8)

### Purpose
Declare substances of concern aligned with SCIP database and ESPR requirements. Extends the basic HazardousSubstance pattern with additional tracking fields.

### Structure
```json
{
  "type": "SubstanceOfConcern",
  "schema:name": "Lead",
  "oec:casNumber": "7439-92-1",
  "oec:ecNumber": "231-100-4",
  "oec:scipId": "SCIP-12345678",
  "oec:concentration": 0.5,
  "oec:hazardClass": "ReproductiveToxicity",
  "oec:substanceLocation": "Battery electrodes",
  "oec:safeUseInstructions": "Avoid contact. Use protective gloves.",
  "oec:safeDisassemblyInstructions": "Remove battery before disassembly. Handle in ventilated area."
}
```

### SCIP Database Integration

The SCIP (Substances of Concern In Products) database is managed by ECHA. Include `scipId` for products notified to SCIP.

### Usage
- **All ESPR categories**: Required for products containing SVHCs
- **Battery DPP**: Hazardous materials in battery components
- **Electronics**: Lead, mercury, cadmium tracking

---

## Performance and Durability Pattern (ESPR Article 7)

### Purpose
Capture product performance, durability, and lifespan information per ESPR requirements.

### Structure
```json
{
  "type": "PerformanceInfo",
  "oec:expectedLifespan": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "10",
    "gs1:unitCode": "ANN"
  },
  "oec:guaranteedLifespan": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "5",
    "gs1:unitCode": "ANN"
  },
  "oec:usageCycles": 3000,
  "oec:performanceClass": "A",
  "oec:testedConditions": "Standard laboratory conditions per EN 62040-3"
}
```

### Unit Codes for Lifespan
| Unit | Code | Usage |
|------|------|-------|
| Years | ANN | Expected lifespan |
| Months | MON | Short-lived products |
| Hours | HUR | Operating hours |
| Cycles | N/A | Use `usageCycles` property |

### Usage
- **All ESPR categories**: Durability and performance requirements
- **Battery DPP**: Expected battery lifetime, charging cycles
- **Electronics**: Device lifespan, software support period
- **Textiles**: Expected washes, durability rating

---

## Repairability Pattern (ESPR Article 7)

### Purpose
Capture repair, maintenance, and spare parts information per ESPR requirements.

### Structure
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
  "schema:deliveryTime": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "5",
    "gs1:unitCode": "DAY"
  },
  "oec:diyRepairPossible": true,
  "oec:professionalRepairNetwork": { "id": "https://example.com/repair-network" },
  "oec:repairInstructions": {
    "type": "DocumentReference",
    "documentType": "Manual",
    "documentUrl": { "id": "https://example.com/docs/repair-manual.pdf" },
    "languageCode": "en"
  },
  "oec:softwareUpdatesAvailability": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "5",
    "gs1:unitCode": "ANN"
  }
}
```

### Repairability Score (French Index)
The repairability score (0-10) follows the French Indice de Réparabilité model:
- Documentation availability
- Ease of disassembly
- Spare parts availability
- Spare parts pricing
- Product-specific criteria

### Repairability Class
- `A` - Excellent (8.0-10.0)
- `B` - Good (6.0-7.9)
- `C` - Average (4.0-5.9)
- `D` - Poor (2.0-3.9)
- `E` - Very Poor (0-1.9)

### Usage
- **Electronics**: Mandatory repairability information
- **Battery DPP**: Battery replacement instructions
- **Textiles**: Care and repair instructions

---

## Document Reference Pattern

### Purpose
Reference external documents (reports, certificates, manuals) with metadata.

### Structure
```json
{
  "type": "DocumentReference",
  "documentType": "Certificate",
  "documentTitle": "ISO 14001 Environmental Management Certificate",
  "documentUrl": { "id": "https://example.com/certs/iso14001.pdf" },
  "mimeType": "application/pdf",
  "languageCode": "en",
  "issueDate": "2024-01-15",
  "validUntil": "2027-01-14"
}
```

### Document Types
- `DueDiligenceDocument`
- `Certificate`
- `TestReport`
- `Manual`
- `DeclarationOfConformity`
- `SafetyDataSheet`
- `EnvironmentalReport`
- `ThirdPartyVerification`

---

## Circularity Information Pattern

### Purpose
Capture end-of-life handling, recycling, and circular economy information.

### Structure
```json
{
  "type": "CircularityInfo",
  "recyclabilityRate": 95.5,
  "endOfLifeInstructions": { "id": "https://example.com/docs/eol-guide.pdf" },
  "wastePreventionInfo": { "id": "https://example.com/docs/waste-prevention.html" },
  "separateCollectionInfo": { "id": "https://example.com/docs/collection-points.html" },
  "dismantlingInstructions": {
    "type": "DocumentReference",
    "documentType": "Manual",
    "documentUrl": { "id": "https://example.com/docs/dismantling.pdf" }
  }
}
```

---

## Material Composition Pattern

### Purpose
Declare material composition with source country and critical raw material status.

### Structure
```json
{
  "type": "MaterialComposition",
  "materialName": "Lithium",
  "casNumber": "7439-93-2",
  "massPercentage": 3.2,
  "sourceCountry": "CL",
  "isCriticalRawMaterial": true
}
```

### Critical Raw Materials
Materials flagged as `isCriticalRawMaterial: true` are on the EU Critical Raw Materials list.

---

## Carbon Footprint Pattern

### Purpose
Declare product carbon footprint with lifecycle breakdown.

### Structure
```json
{
  "carbonFootprintTotal": 45.2,
  "carbonFootprintUnit": "kg CO2e/kWh",
  "carbonFootprintStudyUrl": { "id": "https://example.com/cfp/study-2024.pdf" }
}
```

### For EPCIS Events (Lifecycle Breakdown)
Use sensor reports with specialized types:
- `CarbonFootprintTotal`
- `CarbonFootprintRawMaterialExtraction`
- `CarbonFootprintProduction`
- `CarbonFootprintDistribution`
- `CarbonFootprintRecycling`

---

## GS1 Master Data Pattern

### Purpose
Embed master data in EPCIS events using `gs1:masterDataAvailableFor` as a top-level array. Per [GS1 Germany EUDR Guideline V1.11](https://www.gs1-germany.de/fileadmin/gs1/fachpublikationen/GS1_Germany_EUDR_Guideline_V1.11.pdf), regulatory information should be nested inside the product entry.

### Architecture Rule
`gs1:masterDataAvailableFor` contains ONLY `gs1:` namespace properties. Extension properties (`oec:`, `eudr:`, `eubat:`, etc.) go at **event level** -- as siblings of `bizStep`, `epcList`, etc. See [EPCIS_MASTERDATA_AND_EXTENSIONS.md](EPCIS_MASTERDATA_AND_EXTENSIONS.md).

### Bare String Notation
Inside `gs1:masterDataAvailableFor`, the `gs1:` prefix is NOT required - it is assumed. Use bare property names and string values:
- Use `"productName"` not `"gs1:productName"`
- Use `"regulationType": "DEFORESTATION_REGULATION"` not `{ "id": "gs1:RegulationTypeCode-..." }`

### GS1 Shortcuts Context (Optional)
Outside of `gs1:masterDataAvailableFor`, to use the same short syntax for RegulationTypeCode values, include the optional shortcuts context:

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/gs1-shortcuts-context.jsonld"
  ]
}
```

This enables `"gs1:regulationType": "BATTERY_DIRECTIVE"` instead of `{"id": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE"}`. See [gs1-shortcuts-context.jsonld](../context/gs1-shortcuts-context.jsonld) for available shortcuts.

### Structure
The `gs1:masterDataAvailableFor` array sits at the **top level of the event**, with `regulatoryInformation` **nested inside the product entry**:

```json
{
  "type": "ObjectEvent",
  "eventTime": "2025-01-15T10:00:00Z",
  "action": "OBSERVE",
  "bizStep": "notifying",
  "persistentDisposition": {
    "set": ["subject_to_regulation"]
  },

  "quantityList": [
    {
      "epcClass": "https://id.gs1.org/01/09521234000020/10/BATCH-001",
      "quantity": 850,
      "uom": "KGM"
    }
  ],

  "readPoint": {
    "id": "https://id.gs1.org/414/9521234000099"
  },

  "bizLocation": {
    "id": "https://id.gs1.org/414/9521234000099"
  },

  "gs1:masterDataAvailableFor": [
    {
      "id": "https://id.gs1.org/01/09521234000020/10/BATCH-001",
      "productName": "Product Name Here",
      "gtin": "09521234000020",
      "hasBatchLotNumber": "BATCH-001",
      "netWeight": {
        "value": "850",
        "unitCode": "KGM"
      },
      "regulatoryInformation": [
        {
          "regulationType": "DEFORESTATION_REGULATION",
          "regulatoryAct": "EU 2023/1115",
          "isRegulationCompliant": true,
          "regulatoryIdentifierType": "DUE_DILIGENCE_STATEMENT",
          "regulatoryReferenceNumber": "EUIS-2025-DE-00012345"
        }
      ]
    },
    {
      "id": "https://id.gs1.org/414/9521234000099",
      "locationGLN": "9521234000099",
      "physicalLocationName": "Facility Name",
      "countryCode": "DE"
    },
    {
      "id": "https://id.gs1.org/417/9521234000006",
      "organizationName": "Company Name",
      "partyGLN": "9521234000006",
      "countryCode": "DE"
    }
  ]
}
```

### Key Principles
- **`quantityList` or `epcList`**: Contains product identifiers (batch-level or serialized)
- **`gs1:masterDataAvailableFor`**: Top-level array with full master data inline
- **Inside master data, use bare property names** (no `gs1:` prefix) - the namespace is assumed
- **Use bare string values** like `"regulationType": "DEFORESTATION_REGULATION"`
- **`regulatoryInformation`**: **Nested INSIDE the product entry** (not at event level)
- For EUDR: use `bizStep: "notifying"` and `persistentDisposition: { "set": ["subject_to_regulation"] }`
- **Events** capture what happened, when, and where
- **Master Data** provides the detailed product/location/organization information embedded in the event

---

## Access Rights Pattern (ESPR Article 9)

### Purpose
Control data visibility per ESPR Article 9 requirements. Define which DPP data is publicly accessible vs. restricted to authorized parties.

### Structure
```json
{
  "type": "AccessRights",
  "oec:accessLevel": "Public",
  "oec:dataRetentionPeriod": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "10",
    "gs1:unitCode": "ANN"
  }
}
```

### Access Levels per ESPR Article 9

| Level | Description | Authorized Users |
|-------|-------------|------------------|
| `Public` | Freely accessible | Consumers, all market participants |
| `AuthorizedOnly` | Restricted access | Market surveillance, customs authorities |
| `Restricted` | Business confidential | Specific authorized economic operators |

### Data by Access Level

**Public Data (Article 9.1)**:
- Product identification (GTIN, serial)
- Manufacturer/brand information
- Basic specifications
- Environmental performance labels
- Recycling instructions

**Authorized Only (Article 9.2)**:
- Detailed compliance documentation
- Test reports
- Due diligence information
- Supply chain details

**Restricted (Article 9.3)**:
- Trade secrets
- Detailed manufacturing processes
- Supplier pricing
- Proprietary formulations

### Structure with Authorized Parties
```json
{
  "type": "AccessRights",
  "oec:accessLevel": "Restricted",
  "oec:authorizedParties": [
    {
      "type": "gs1:Organization",
      "gs1:partyGLN": "9521234000105",
      "gs1:organizationName": "Market Surveillance Authority DE"
    }
  ],
  "oec:dataRetentionPeriod": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "10",
    "gs1:unitCode": "ANN"
  }
}
```

### Usage
- **All ESPR categories**: Required data access control
- Applied at field/section level within DPP data
- Enforced by DPP registry/resolver systems

---

## Best Practices

1. **Use GS1 Digital Link identifiers** for all products and locations
2. **Reference master data** instead of duplicating in events
3. **Use `gs1:regulatoryInformation`** for compliance declarations
4. **Provide multilingual documents** with `languageCode`
5. **Include verification bodies** for third-party assurances
6. **Track data provenance** with `lastDataUpdate` and `dataQualityAssessment`
7. **Implement access control** per ESPR Article 9 using `oec:AccessRights`
8. **Include EOID** for economic operator identification per ESPR Article 77
9. **Provide repairability information** for applicable product categories
10. **Document substances of concern** with SCIP database identifiers

---

## Extended Producer Responsibility Pattern

EPR registration applies across PPWR (packaging), WEEE (electronics), Battery
Regulation, ELV, and the upcoming Textile-DA. National schemes vary per
Member State — no single international vocabulary covers them, which is why
this pattern is minted at `oec:`.

```json
{
  "type": "ExtendedProducerResponsibility",
  "eprRegistrationNumber": "DE-VPC-58092100",
  "eprWasteStream": "packaging",
  "eprJurisdiction": { "id": "https://ref.gs1.org/voc/Country-DE", "type": "Country" },
  "eprScheme": {
    "id": "https://id.gs1.org/417/4030101000001",
    "type": "Organization",
    "organizationName": "Der Grüne Punkt — Duales System Deutschland GmbH"
  },
  "eprComplianceUrl": "https://ldb.zsvr.de/marken/58092100"
}
```

**Properties** (all on `oec:ExtendedProducerResponsibility`):
- `oec:eprRegistrationNumber` — registry-issued ID
- `oec:eprWasteStream` — `"packaging"` / `"weee"` / `"batteries"` / `"vehicles"` / `"textiles"`
- `oec:eprJurisdiction` — `gs1:Country` reference
- `oec:eprScheme` — `gs1:Organization` (the PRO / scheme operator)
- `oec:eprComplianceUrl` — public verification endpoint

**Used by**: PPWR (Article 13), WEEE (Article 16), Battery (Annex II §7), ELV-revision, Textile-DA (planned).

---

## Compostability / Biodegradability / Bio-based Pattern

Three distinct concepts often conflated. **Bio-based** = origin (renewable
feedstock fraction). **Biodegradability** = test result (microbial breakdown
under specified conditions). **Compostability** = certification category
(EN 13432 / OK-Compost-Home / ASTM D6400) — a regulatory category, not a
measurement.

### Bio-based fraction

```json
{
  "bioBasedFraction": { "type": "QuantitativeValue", "value": 0.30, "unitCode": "P1" }
}
```

### Biodegradability (`subClassOf schema:Observation`)

```json
{
  "biodegradability": {
    "type": "Biodegradability",
    "biodegradationPercentage": { "type": "QuantitativeValue", "value": 0.825, "unitCode": "P1" },
    "biodegradabilityTestMethod": "OECD301B"
  }
}
```

### Compostability

```json
{
  "compostability": {
    "type": "Compostability",
    "compostabilityType": "IndustrialCompostable",
    "compostabilityStandard": "https://www.iso.org/standard/61131.html"
  }
}
```

**Used by**: PPWR (Article 13), Detergent (filmBiodegradable / surfactant biodegradability), Textile (bio-based fibres), future Furniture-DA, Single-Use Plastics Directive.

---

## Deposit-Return Scheme Pattern

Deposit-return systems vary per Member State (DE, AT, NL, SE, …) and are
expanding under PPWR Article 13. No upstream vocabulary covers them.

```json
{
  "depositReturnScheme": {
    "type": "DepositReturnScheme",
    "depositAmount": { "type": "QuantitativeValue", "value": 0.25, "unitCode": "EUR" },
    "depositSchemeOperator": {
      "id": "https://id.gs1.org/417/4030101000018",
      "type": "Organization",
      "organizationName": "Deutsche Pfandsystem GmbH"
    },
    "depositRedemptionChannelUrl": "https://www.dpg-pfandsystem.de/find-redemption-point"
  }
}
```

`depositAmount` uses `gs1:QuantitativeValue` with `gs1:unitCode` = ISO 4217
currency code (e.g. `"EUR"`, `"DKK"`) — same idiom as physical units, but
with a currency code instead of a UN/CEFACT Rec 20 unit code.

**Used by**: PPWR (Article 13), beverage container DRS, future EU-harmonised DRS.
