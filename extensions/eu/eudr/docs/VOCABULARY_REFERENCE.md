# EUDR Vocabulary Reference

This document provides a clear reference for which vocabulary terms to use when implementing EUDR compliance.

## EPCIS 2.0 Extension Declaration

The EUDR extension is a **first-class EPCIS 2.0 extension**. Declare it using the `GS1-Extensions` HTTP header per [EPCIS 2.0 Section 12.3](https://ref.gs1.org/standards/epcis/):

```http
GS1-Extensions: eudr=https://ref.openepcis.io/extensions/eu/eudr/
```

See [EPCIS_EXTENSION_GUIDE.md](./EPCIS_EXTENSION_GUIDE.md) for complete integration patterns.

---

## Overview: Two Layers of Vocabulary

| Layer | Namespace | GS1-Extensions Header |
|-------|-----------|----------------------|
| GS1 EUDR Standard | `https://ref.gs1.org/standards/eudr/` | (official GS1, no header needed) |
| GS1 Web Vocabulary | `https://ref.gs1.org/voc/` | (official GS1, no header needed) |
| OpenEPCIS EUDR Extensions | `https://ref.openepcis.io/extensions/eu/eudr/` | `eudr=https://ref.openepcis.io/extensions/eu/eudr/` |

---

## GS1 EUDR Standard Terms

These terms are defined by the official GS1 EUDR standard for B2B regulatory notifications. Structure matches [GS1 EUDR-tool](https://github.com/gs1/EUDR-tool) output.

| Term | Usage |
|------|-------|
| `gs1:RegulatoryNotification` | Message type for sharing DDS references |
| `gs1:messageSender` | Organization sending the notification (partyGLN or URI) |
| `gs1:messageRecipient` | Organization receiving the notification (partyGLN or URI) |
| `gs1:regulatoryInformation` | Container for regulatory data |
| `gs1:regulatoryAct` | The regulation: `"EU 2023/1115"` |
| `gs1:regulationType` | Type code: `"DEFORESTATION_REGULATION"` |
| `gs1:regulatoryIdentifier` | DDS reference information |
| `gs1:regulatoryIdentifierType` | Type: `"DUE_DILIGENCE_STATEMENT"` |
| `gs1:regulatoryReferenceNumber` | The EUIS reference number (required) |
| `gs1:regulatoryVerificationNumber` | Verification number (required) |
| `gs1:regulatoryInformationProvider` | Organization that provided the info (partyGLN or URI) |
| `gs1:applicableProducts` | Products this DDS applies to |
| `gs1:applicableTransactions` | Business transactions (orders, invoices) |

**Context URL**: `https://ref.gs1.org/standards/eudr/context.jsonld`

---

## GS1 Web Vocabulary Terms

These standard GS1 terms should be used for master data. They are NOT EUDR-specific.

### Locations

| Term | Usage |
|------|-------|
| `gs1:Place` | Location type (including plots of land) |
| `gs1:locationGLN` | 13-digit GLN identifier |
| `gs1:physicalLocationName` | Human-readable location name |
| `gs1:geo` | Container for geographic data |
| `gs1:GeoShape` | For polygon boundaries |
| `gs1:polygon` | Polygon coordinate string |
| `gs1:GeoCoordinates` | For point locations |
| `gs1:latitude` | Latitude value |
| `gs1:longitude` | Longitude value |
| `gs1:address` | Postal address information |
| `gs1:PostalAddress` | Address type |

### Organizations

| Term | Usage |
|------|-------|
| `gs1:Organization` | Organization type |
| `gs1:organizationName` | Legal name |
| `gs1:partyGLN` | 13-digit party GLN |

### Products

| Term | Usage |
|------|-------|
| `gs1:Product` | Product type |
| `gs1:gtin` | 14-digit GTIN |
| `gs1:productName` | Product name |
| `gs1:regulatedProductName` | Official regulatory name |

### Measurements

| Term | Usage |
|------|-------|
| `gs1:QuantitativeValue` | Measurement container |
| `gs1:value` | Numeric value |
| `gs1:unitCode` | UN/CEFACT unit code (e.g., "KGM", "HAR") |
| `gs1:netWeight` | Product weight |

### Countries

| Term | Usage |
|------|-------|
| `gs1:Country` | Country type |
| `gs1:countryCode` | ISO 3166-1 Alpha-2 code |
| `gs1:countryOfOrigin` | Product origin country |

---

## OpenEPCIS EUDR Extensions (eudr:)

These properties have **NO equivalent in GS1 standards** and are required for EUDR compliance.

### Harvest Data (EUDR Article 9.1.d)

| Property | Type | Description |
|----------|------|-------------|
| `gs1:harvestDate` | `xsd:date` | Single harvest date |
| `gs1:harvestDateStart` | `xsd:date` | Start of harvest period |
| `gs1:harvestDateEnd` | `xsd:date` | End of harvest period |

**Note**: Use either `harvestDate` OR `harvestDateStart`/`harvestDateEnd`, not both.

### Species Identification (EUDR Article 9.1.c)

| Property | Type | Description |
|----------|------|-------------|
| `eudr:speciesScientificName` | `xsd:string` | Latin name (e.g., "Quercus robur") |
| `eudr:speciesCommonName` | `xsd:string` | Common name (e.g., "European Oak") |

### Commodity Classification

| Property | Type | Values |
|----------|------|--------|
| `eudr:commodityType` | `@id` | `Cattle`, `Cocoa`, `Coffee`, `OilPalm`, `Rubber`, `Soya`, `Wood` |
| `eudr:timberProductType` | `@id` | `RoundWood`, `SawnWood`, `Plywood`, `Veneer`, `WoodPellets`, `WoodChips`, `Pulp`, `Paper`, `Furniture`, `Charcoal`, `PrintedMatter` |

### Risk Classification (EUDR Article 29)

| Property | Type | Values |
|----------|------|--------|
| `eudr:riskLevel` | `@id` | `Negligible`, `Low`, `Standard`, `High` |

### Compliance Data

| Property | Type | Description |
|----------|------|-------------|
| `eudr:deforestationFreeDate` | `xsd:date` | Date confirming deforestation-free status |
| `eudr:legallyHarvested` | `xsd:boolean` | Confirmation of legal harvest |
| `eudr:landUseHistory` | `xsd:string` | Land history documentation |
| `eudr:forestManagementUnit` | `xsd:string` | FMU identifier |
| `eudr:verificationMethod` | `xsd:string` | How compliance was verified |

### Operator Identification

Use standard properties from GS1 and DPP-Core vocabularies:

| Property | Type | Description |
|----------|------|-------------|
| `dpp:eoriNumber` | `xsd:string` | EU customs identifier (from dpp-core) |
| `gs1:partyGLN` | `xsd:string` | 13-digit GLN (from GS1 Web Vocabulary) |

### Product Traceability

| Property | Type | Description |
|----------|------|-------------|
| `eudr:transformationDate` | `xsd:date` | Date of processing |

### Area Measurement

| Property | Type | Description |
|----------|------|-------------|
| `eudr:areaSize` | object | Use with `gs1:QuantitativeValue` |
| `eudr:areaHectares` | `xsd:decimal` | Shorthand for area in hectares |

---

## Decision Guide: Which Term to Use?

### Location Data

| Need | Use This |
|------|----------|
| Plot of land | `gs1:Place` with `gs1:GeoShape` |
| Center point (plots ≤4 ha) | `gs1:GeoCoordinates` |
| Polygon (plots >4 ha) | `gs1:GeoShape` with `gs1:polygon` |
| Forest management unit | `eudr:forestManagementUnit` |
| Land history | `eudr:landUseHistory` |

### Product Data

| Need | Use This |
|------|----------|
| Product identification | `gs1:Product` with `gs1:gtin` |
| Commodity type | `eudr:commodityType` |
| Timber product type | `eudr:timberProductType` |
| Species name | `eudr:speciesScientificName` |
| Weight | `gs1:netWeight` with `gs1:QuantitativeValue` |
| Country of origin | `gs1:countryOfOrigin` with `gs1:Country` |

### Event Data

| Need | Use This |
|------|----------|
| Harvest date | `gs1:harvestDate` or `eudr:harvestDateStart/End` |
| DDS reference | `gs1:regulatoryInformation` |
| Risk level | `eudr:riskLevel` |
| Compliance flag | `eudr:legallyHarvested`, `eudr:deforestationFreeDate` |

---

## Example: Complete Product with Correct Terms

```json
{
  "@context": {
    "gs1": "https://ref.gs1.org/voc/",
    "eudr": "https://ref.openepcis.io/extensions/eu/eudr/"
  },
  "type": "gs1:Product",
  "id": "https://id.gs1.org/01/09521234000020/21/LOG-2025-001",

  "gs1:gtin": "09521234000020",
  "gs1:productName": "European Oak Round Wood",

  "gs1:countryOfOrigin": {
    "type": "gs1:Country",
    "gs1:countryCode": "DE"
  },

  "gs1:netWeight": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "850",
    "gs1:unitCode": "KGM"
  },

  "eudr:commodityType": "Wood",
  "eudr:timberProductType": "RoundWood",
  "eudr:speciesScientificName": "Quercus robur",
  "eudr:speciesCommonName": "European Oak",
  "gs1:harvestDate": "2025-01-15",
}
```

---

## References

- [GS1 EUDR Standard](https://ref.gs1.org/standards/eudr/)
- [GS1 Web Vocabulary](https://www.gs1.org/voc/)
- [EU Regulation 2023/1115](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1115)
- [OpenEPCIS EUDR Ontology](../ontology/eudr.ttl)
