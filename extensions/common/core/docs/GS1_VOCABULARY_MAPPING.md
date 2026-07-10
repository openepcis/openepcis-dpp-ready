# GS1 Web Vocabulary Mapping

This document maps OpenEPCIS DPP properties to existing [GS1 Web Vocabulary](https://ref.gs1.org/voc/) terms to maximize interoperability.

## Principle

**Use GS1 Web Vocabulary terms when they exist.** Only define custom terms in `oec:`, `eubat:`, or `eudr:` namespaces for domain-specific concepts that have no GS1 equivalent.

## GS1 Properties Available

### Weight & Dimensions

| GS1 Property | Description | Use Instead Of |
|--------------|-------------|----------------|
| `gs1:netWeight` | Net weight excluding packaging | Custom weight properties |
| `gs1:grossWeight` | Gross weight including packaging | - |
| `gs1:drainedWeight` | Weight without liquid | - |
| `gs1:height` | Product height | Custom dimension properties |
| `gs1:width` | Product width | - |
| `gs1:depth` | Product depth | - |
| `gs1:netContent` | Net content (weight, volume, count) | - |

**Example:**
```json
{
  "gs1:netWeight": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "45.5",
    "gs1:unitCode": "KGM"
  }
}
```

### Dates

| GS1 Property | Description | Use Instead Of |
|--------------|-------------|----------------|
| `gs1:productionDate` | Manufacturing/production date | Custom production date |
| `gs1:expirationDate` | Expiration date | - |
| `gs1:bestBeforeDate` | Best before date | - |

### Identifiers

| GS1 Property | Description | Use Instead Of |
|--------------|-------------|----------------|
| `gs1:gtin` | Global Trade Item Number | - |
| `gs1:serialNumber` | Serial number | Custom serial properties |
| `gs1:hasBatchLotNumber` | Batch or lot number | Custom batch properties |

### Country & Origin

| GS1 Property | Description | Use Instead Of |
|--------------|-------------|----------------|
| `gs1:countryOfOrigin` | Country where product originates | `gs1:countryOfOrigin` |
| `gs1:countryOfAssembly` | Country where assembled | - |
| `gs1:countryCode` | ISO 3166-1 country code | - |

### Warranty

| GS1 Class/Property | Description | Use Instead Of |
|--------------------|-------------|----------------|
| `gs1:WarrantyPromise` | Warranty class | - |
| `gs1:durationOfWarranty` | Warranty duration (gs1:QuantitativeValue, unitCode ANN) | `eubat:warrantyPeriodMonths` |
| `gs1:warrantyScopeDescription` | What the warranty covers | - |
| `oec:warranty` | **Product-level** warranty link to gs1:WarrantyPromise (gs1:warranty is Offer-scoped) | `gs1:warranty` on a product |

**Example:**
```json
{
  "oec:warranty": {
    "type": "gs1:WarrantyPromise",
    "gs1:durationOfWarranty": {
      "type": "gs1:QuantitativeValue",
      "gs1:value": 8,
      "gs1:unitCode": "ANN"
    },
    "gs1:warrantyScopeDescription": "Full replacement warranty"
  }
}
```

### Certifications

| GS1 Class/Property | Description | Use Instead Of |
|--------------------|-------------|----------------|
| `gs1:CertificationDetails` | Certification class | Custom cert classes |
| `gs1:certificationAgency` | Certifying organization | - |
| `gs1:certificationStandard` | Standard being certified | - |
| `gs1:certificationValue` | Certification result | - |
| `gs1:certificationIdentification` | Certificate ID | - |
| `gs1:certificationStartDate` | Validity start | - |
| `gs1:certificationEndDate` | Validity end | - |

**Example:**
```json
{
  "gs1:certification": [{
    "type": "gs1:CertificationDetails",
    "gs1:certificationAgency": "TÜV Rheinland",
    "gs1:certificationStandard": "ISO 14001:2015",
    "gs1:certificationValue": "Certified",
    "gs1:certificationIdentification": "TUV-2024-00456",
    "gs1:certificationStartDate": "2024-01-15",
    "gs1:certificationEndDate": "2027-01-14"
  }]
}
```

### Documents & Files

| GS1 Class/Property | Description | Use Instead Of |
|--------------------|-------------|----------------|
| `gs1:ReferencedFileDetails` | File reference class | `oec:DocumentReference` |
| `gs1:referencedFileURL` | File URL | `oec:documentUrl` |
| `gs1:referencedFileType` | File type code | `oec:documentType` |
| `gs1:fileLanguageCode` | Language code | `oec:languageCode` |

**Example:**
```json
{
  "gs1:referencedFile": [{
    "type": "gs1:ReferencedFileDetails",
    "gs1:referencedFileType": {"id": "gs1:ReferencedFileTypeCode-PRODUCT_MANUAL"},
    "gs1:referencedFileURL": "https://example.com/manual.pdf",
    "gs1:fileLanguageCode": "en"
  }]
}
```

### Recycling & Sustainability

| GS1 Property | Description | Use Instead Of |
|--------------|-------------|----------------|
| `gs1:consumerRecyclingInstructions` | Recycling text instructions | - |

**Note:** GS1 Web Vocabulary has limited sustainability properties. The `oec:` and `eubat:` extensions for carbon footprint, recycled content percentages, and circularity information are appropriate custom extensions.

### Regulatory Information

| GS1 Class/Property | Description | Notes |
|--------------------|-------------|-------|
| `gs1:RegulatoryInformation` | Regulatory info class | Already using ✓ |
| `gs1:regulationType` | Regulation type code | Already using ✓ |
| `gs1:regulatoryAct` | Regulation reference | Already using ✓ |
| `gs1:isRegulationCompliant` | Compliance status | Already using ✓ |

---

## Recommendations

### Battery DPP

| Current | Recommendation | Reason |
|---------|----------------|--------|
| `eubat:warrantyPeriodMonths` | Use `oec:warranty` with `gs1:WarrantyPromise` | GS1 has warranty class |
| Custom weight properties | Use `gs1:netWeight`, `gs1:grossWeight` | Standard GS1 properties |
| `eubat:ratedCapacity` | **Keep** - uses `gs1:QuantitativeValue` range | Battery-specific, correctly typed |
| `eubat:ratedEnergy` | **Keep** | Battery-specific |
| `eubat:StateOfHealth` | **Keep** | Battery-specific sensor type |
| `eubat:materialComposition` | **Keep** | Battery-specific (by component) |

### DPP Core

| Current | Recommendation | Reason |
|---------|----------------|--------|
| `oec:DocumentReference` | Consider `gs1:ReferencedFileDetails` | GS1 has file reference class |
| `oec:documentUrl` | Consider `gs1:referencedFileURL` | GS1 property exists |
| `gs1:countryOfOrigin` | Consider `gs1:countryOfOrigin` | GS1 property exists |
| `oec:recycledContent` | **Keep** | No GS1 equivalent for percentages |
| `oec:carbonFootprint*` | **Keep** | No GS1 equivalent |
| `oec:HazardousSubstance` | **Keep** | CLP-specific, no GS1 equivalent |

### Properties to Keep Custom

These have no GS1 Web Vocabulary equivalent and should remain in domain namespaces:

**Battery-specific (no GS1 equivalent):**
- `eubat:StateOfHealth`, `eubat:StateOfCharge`, `eubat:CycleCount`
- `eubat:batteryChemistry`, `schema:category`, `schema:status`
- `eubat:ratedCapacity`, `eubat:ratedEnergy`, `eubat:nominalVoltage`
- `eubat:lithiumRecycledShare`, `eubat:cobaltRecycledShare`, etc.
- `eubat:CarbonFootprintTotal`, `eubat:CarbonFootprintProduction`, etc.
- `eubat:extinguishingAgent`, `eubat:dismantlingInstructions`

**DPP Core (no GS1 equivalent):**
- `oec:OperatorInformation` with operator roles
- `oec:DueDiligenceReport`
- `oec:CircularityInfo` with recyclability rates
- `oec:RecycledContent` with pre/post-consumer splits
- `oec:HazardousSubstance` with CLP hazard classes
- `oec:carbonFootprint*` properties

**EUDR-specific (no GS1 equivalent):**
- `eudr:PlotOfLand`, `eudr:polygonCoordinates`
- `eudr:deforestationFreeDate`, `eudr:legallyHarvested`
- `eudr:speciesScientificName`, `eudr:speciesCommonName`
- `eudr:commodityType`, `eudr:timberProductType`

---

## GS1 ReferencedFileTypeCode Values

For document references, use GS1's file type codes:

| Code | Use For |
|------|---------|
| `gs1:ReferencedFileTypeCode-PRODUCT_MANUAL` | User manuals |
| `gs1:ReferencedFileTypeCode-SAFETY_DATA_SHEET` | SDS documents |
| `gs1:ReferencedFileTypeCode-CERTIFICATE` | Certificates |
| `gs1:ReferencedFileTypeCode-PRODUCT_IMAGE` | Product images |
| `gs1:ReferencedFileTypeCode-VIDEO` | Product videos |

---

## GS1 Design Patterns

### Product Subclassing

GS1 uses `gs1:Product` as the base class with domain-specific subclasses:

```turtle
eubat:Battery rdfs:subClassOf gs1:Product .
eudr:TimberProduct rdfs:subClassOf gs1:Product .
```

This pattern allows domain-specific properties while maintaining GS1 compatibility.

### Organization Pattern

Use `gs1:Organization` for companies and `gs1:ContactPoint` for contacts:

```json
{
  "gs1:manufacturer": {
    "type": "gs1:Organization",
    "gs1:organizationName": "EcoCell GmbH",
    "gs1:partyGLN": "9521234000006",
    "gs1:contactPoint": {
      "type": "gs1:ContactPoint",
      "gs1:email": "info@example.com"
    }
  }
}
```

### QuantitativeValue Pattern

Always use `gs1:QuantitativeValue` for measurements with units:

```json
{
  "eubat:ratedCapacity": {
    "type": "gs1:QuantitativeValue",
    "gs1:value": "280",
    "gs1:unitCode": "AH"
  }
}
```

### Regulatory Information Pattern

For compliance data, use `gs1:regulatoryInformation`:

```json
{
  "gs1:regulatoryInformation": [{
    "type": "gs1:RegulatoryInformation",
    "gs1:regulationType": {"id": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE"},
    "gs1:regulatoryAct": "EU 2023/1542",
    "gs1:isRegulationCompliant": true
  }]
}
```

### Certification Pattern

For ISO certifications, quality marks, etc., use `gs1:certification`:

```json
{
  "gs1:certification": [{
    "type": "gs1:CertificationDetails",
    "gs1:certificationAgency": "TÜV Rheinland",
    "gs1:certificationStandard": "ISO 14067:2018",
    "gs1:certificationValue": "Certified",
    "gs1:certificationIdentification": "CFP-2024-00789"
  }]
}
```

### EPCIS Master Data Pattern

Use `gs1:masterDataAvailableFor` to reference master data in EPCIS events:

```json
{
  "epcList": ["https://id.gs1.org/01/09521234000013/21/BAT2024-001"],
  "gs1:masterDataAvailableFor": [{
    "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
    "productName": "EcoCell Battery Module",
    "gtin": "09521234000013"
  }]
}
```

---

## Best Practices Summary

1. **Use GS1 for common concepts** - identifiers, weights, dates, warranty, certifications
2. **Extend for domain-specific needs** - battery chemistry, EUDR geolocation, hazardous substances
3. **Use `rdfs:seeAlso`** - when a custom property has a GS1 equivalent, reference it
4. **Use `gs1:QuantitativeValue`** - for any measurement with units
5. **Import GS1 vocabulary** - use `owl:imports <https://ref.gs1.org/voc/>` in ontologies
6. **Prefer GS1 namespace** - use `https://ref.gs1.org/voc/` (not `https://gs1.org/voc/`)

---

## References

- [GS1 Web Vocabulary](https://ref.gs1.org/voc/)
- [GS1 WebVoc GitHub](https://github.com/gs1/WebVoc)
- [GS1 Web Vocabulary JSON-LD](https://ref.gs1.org/voc/data/gs1Voc.jsonld)
- [GS1 Digital Link Standard](https://www.gs1.org/standards/gs1-digital-link)
- [EPCIS 2.0 Standard](https://ref.gs1.org/standards/epcis/)
