# GS1 Standards Reference

This document provides links to the official GS1 standards used in the OpenEPCIS DPP implementation.

## Core GS1 Standards

### GS1 Digital Link
**URL**: https://www.gs1.org/standards/gs1-digital-link

The GS1 Digital Link standard provides web-addressable identifiers for products, locations, and other entities. It bridges physical products to their digital twins via QR codes and NFC tags.

**Usage in DPP**:
- Product identification: `https://id.gs1.org/01/{GTIN}/21/{Serial}`
- Location identification: `https://id.gs1.org/414/{GLN}`
- Organization identification: `https://id.gs1.org/417/{GLN}`

### EPCIS 2.0
**URL**: https://ref.gs1.org/standards/epcis/

Electronic Product Code Information Services (EPCIS) is the standard for capturing and sharing supply chain event data. Version 2.0 adds JSON-LD support and sensor data.

**Key Features for DPP**:
- Object Events for lifecycle tracking
- Sensor Element List for measurements
- Master Data linking via `gs1:masterDataAvailableFor`
- JSON-LD representation for linked data

**Architecture Rule**: `gs1:masterDataAvailableFor` contains ONLY `gs1:` namespace properties. Extension properties (`dpp:`, `battery:`, `eudr:`, etc.) go at event level. See [EPCIS_MASTERDATA_AND_EXTENSIONS.md](EPCIS_MASTERDATA_AND_EXTENSIONS.md) for the authoritative three-angle guide.

#### GS1-Extensions HTTP Header (Section 12.3)

EPCIS 2.0 defines custom HTTP headers for extension discovery and content negotiation. The `GS1-Extensions` header declares custom vocabulary namespaces:

**Format**: `prefix=namespace, prefix2=namespace2`

**OpenEPCIS DPP Extensions**:
```http
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/, eudr=https://ref.openepcis.io/extensions/eu/eudr/, battery=https://ref.openepcis.io/extensions/eu/battery/
```

This header should be included in:
- **Capture requests**: To declare which extensions are used in the payload
- **Query requests**: To indicate which extension namespaces should be returned
- **Responses**: To advertise supported extensions

**Other EPCIS 2.0 Custom Headers**:
| Header | Purpose |
|--------|---------|
| `GS1-EPCIS-Version` | EPCIS version (e.g., "2.0") |
| `GS1-CBV-Version` | CBV version |
| `GS1-Capture-Error-Behaviour` | Rollback vs proceed on errors |
| `GS1-EPC-Format` | EPC formatting preference |

### GS1 Web Vocabulary
**URL**: https://www.gs1.org/voc/

The GS1 Web Vocabulary provides RDF/JSON-LD terms for product information, organizations, and regulatory data.

**Key Classes Used**:
- `gs1:Product` - Product master data
- `gs1:Organization` - Company information
- `gs1:Place` - Location data
- `gs1:QuantitativeValue` - Measurements with units
- `gs1:RegulatoryInformation` - Compliance declarations

---

## Regulation-Specific Standards

### GS1 Battery DPP Standard
**URL**: https://ref.gs1.org/standards/battery-dpp/ (forthcoming)

GS1 implementation guidance for EU Battery Regulation 2023/1542.

**Regulation Type Code**: `gs1:RegulationTypeCode-BATTERY_DIRECTIVE`

### GS1 EUDR Standard
**URL**: https://ref.gs1.org/standards/eudr/

GS1 implementation guidance for EU Deforestation Regulation 2023/1115.

**Regulation Type Code**: `gs1:RegulationTypeCode-DEFORESTATION_REGULATION`

**Key Features**:
- Geolocation data for commodities
- Due diligence statement patterns
- Supply chain traceability

### Other Regulation Type Codes

| Regulation | GS1 Code | Reference |
|------------|----------|-----------|
| RoHS | `gs1:RegulationTypeCode-ROHS_DIRECTIVE` | EU 2011/65/EU |
| WEEE | `gs1:RegulationTypeCode-WEEE_DIRECTIVE` | EU 2012/19/EU |
| REACH | `gs1:RegulationTypeCode-REACH` | EU 1907/2006 |
| CLP | N/A (use HazardousSubstance pattern) | EU 1272/2008 |

### GS1 Shortcuts Context (Optional)

For cleaner syntax, the optional [gs1-shortcuts-context.jsonld](../context/gs1-shortcuts-context.jsonld) provides aliases for RegulationTypeCode values:

**Without shortcuts**:
```json
"gs1:regulationType": { "id": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE" }
```

**With shortcuts** (include `gs1-shortcuts-context.jsonld`):
```json
"gs1:regulationType": "BATTERY_DIRECTIVE"
```

Available shortcuts: `BATTERY_DIRECTIVE`, `DEFORESTATION_REGULATION`, `ROHS_DIRECTIVE`, `WEEE_DIRECTIVE`, `REACH`, `CE_MARKING`, `CE`, `E_MARK`, `ECODESIGN_DIRECTIVE`, `LVD_DIRECTIVE`, `EMC_DIRECTIVE`, `MACHINERY_DIRECTIVE`, `PACKAGING_WASTE_DIRECTIVE`, `FOOD_CONTACT_MATERIAL`, `MEDICAL_DEVICE_REGULATION`, `BIOCIDE_REGULATION`, `COSMETICS_REGULATION`, `TOYS_DIRECTIVE`, `PPE_REGULATION`, `CONSTRUCTION_PRODUCTS_REGULATION`, `INFANT_FORMULA_LABELLING`, `AEROSOL_REVERSE_EPSILON`, `UVA`.

---

## Unit Codes

GS1/UN/CEFACT recommendation 20 unit codes commonly used in DPP:

| Unit | Code | Description |
|------|------|-------------|
| Kilogram | KGM | Mass |
| Gram | GRM | Mass |
| Ampere-hour | AH | Battery capacity |
| Kilowatt-hour | KWH | Energy |
| Watt | WTT | Power |
| Kilowatt | KWT | Power |
| Volt | VLT | Voltage |
| Ohm | OHM | Resistance |
| Celsius | CEL | Temperature |
| Percent | P1 | Percentage |
| Hectare | HAR | Area |
| Square metre | MTK | Area |

---

## Identifier Structures

### GTIN (Global Trade Item Number)
- 14 digits including check digit
- Example: `09521234000013`

### GLN (Global Location Number)
- 13 digits including check digit
- Example: `9521234000006`

### SGTIN (Serialized GTIN)
- GTIN + Serial Number
- URI: `https://id.gs1.org/01/{GTIN}/21/{Serial}`
- Example: `https://id.gs1.org/01/09521234000013/21/BAT2024-001`

### SSCC (Serial Shipping Container Code)
- 18 digits
- Used for logistics units

---

## JSON-LD Context URLs

### Official GS1 Contexts
```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld"
  ]
}
```

### OpenEPCIS DPP Contexts
```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld"
  ]
}
```

---

## EPCIS 2.1 Preview

EPCIS 2.1 (imminent ratification) adds:
- **`gs1:masterDataAvailableFor`**: Links events to master data repositories
- Enhanced sensor data capabilities
- Improved credential management

This implementation uses EPCIS 2.1 patterns as the forward-looking standard.

---

## References

1. GS1 General Specifications: https://www.gs1.org/genspecs
2. GS1 Digital Link Standard: https://www.gs1.org/standards/gs1-digital-link
3. EPCIS and CBV Standard: https://www.gs1.org/standards/epcis
4. GS1 Web Vocabulary: https://www.gs1.org/voc/
5. UN/CEFACT Recommendation 20: https://unece.org/trade/cefact/codes
