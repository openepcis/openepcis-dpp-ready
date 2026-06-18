# URL Patterns and Identifier Reference

Complete reference for all URI patterns, identifier conventions, and resolvable URLs used in the OpenEPCIS Battery DPP.

> **Disclaimer**: This is **not official GS1 guidance**, but all URI patterns follow official GS1 standards:
>
> - **[GS1 Digital Link URI Syntax](https://www.gs1.org/standards/gs1-digital-link)** — URI structure and AI encoding
> - **[GS1 Application Identifiers](https://www.gs1.org/standards/barcodes/application-identifiers)** — AI-01 (GTIN), AI-21 (serial), AI-414 (GLN), AI-8004 (GIAI)
> - **[GS1 Web Vocabulary](https://www.gs1.org/voc/)** — `gs1:` namespace terms
>
> We follow GS1 best practices: resolvable URIs, proper check digit calculation, and standard AI encoding. [Feedback welcome](https://github.com/openepcis/openepcis-battery-dpp/issues)!

> **Note**: All example identifiers in this project use **GS1 prefix 952**, the official GS1 prefix for demonstrations, examples, and tests. Per [GS1 guidance](https://www.gs1.org/standards/bc-epc-interop), prefix 952 should never be used for real-world identification. See the `9521nnn` convention for 7-digit GCP examples.

## Table of Contents

1. [GS1 Digital Link URIs](#gs1-digital-link-uris)
2. [Vocabulary Namespaces](#vocabulary-namespaces)
3. [EPCIS Context URLs](#epcis-context-urls)
4. [Fragment Identifiers](#fragment-identifiers)
5. [Event Identifiers](#event-identifiers)
6. [External Resources](#external-resources)
7. [Process Assumptions](#process-assumptions)

---

## GS1 Digital Link URIs

### Battery Product Identity

The primary identifier for each battery is a GS1 Digital Link URI that IS resolvable:

```
https://id.gs1.org/01/{gtin}/21/{serial}
```

| Component | AI | Description | Example |
|-----------|-----|-------------|---------|
| GTIN | 01 | Global Trade Item Number | `09521234000013` |
| Serial | 21 | Serial Number | `BAT2024-001` |

**Full Example:**
```
https://id.gs1.org/01/09521234000013/21/BAT2024-001
```

### Organization Identity (GLN)

```
https://id.gs1.org/417/{gln}
```

| Role | Example GLN | Full URI |
|------|-------------|----------|
| Manufacturer | `9521234000006` | `https://id.gs1.org/417/9521234000006` |
| Operator | `9521987000001` | `https://id.gs1.org/417/9521987000001` |

### Location Identity (GLN for Locations)

```
https://id.gs1.org/414/{gln}
```

| Location Type | Example GLN | Full URI |
|---------------|-------------|----------|
| Production Facility | `9521234000013` | `https://id.gs1.org/414/9521234000013` |
| Service Center | `9521987000018` | `https://id.gs1.org/414/9521987000018` |

### Device Identity (GIAI)

```
https://id.gs1.org/8004/{giai}
```

| Device Type | Example | Full URI |
|-------------|---------|----------|
| BMS | `9521987BMS-001` | `https://id.gs1.org/8004/9521987BMS-001` |
| Test Equipment | `9521234EOL-TEST-001` | `https://id.gs1.org/8004/9521234EOL-TEST-001` |

---

## Vocabulary Namespaces

### Official GS1 Vocabulary

| Prefix | Namespace URI | Usage |
|--------|---------------|-------|
| `gs1:` | `https://ref.gs1.org/voc/` | Core GS1 terms |

**Key GS1 vocabulary terms used:**
- `gs1:Product` - Product class
- `gs1:Organization` - Organization class
- `gs1:QuantitativeValue` - Measurement values
- `gs1:manufacturer` - Manufacturer reference
- `gs1:gtin` - GTIN property
- `gs1:netWeight` - Weight property
- `gs1:regulatoryInformation` - Regulatory data
- `gs1:RegulatoryInformation` - Regulatory info class
- `gs1:RegulationTypeCode-BATTERY_DIRECTIVE` - Battery regulation code
- `gs1:RegulationTypeCode-CE` - CE marking code

### Battery Vocabulary

| Prefix | Namespace URI | Status |
|--------|---------------|--------|
| `eubat:` | `https://ref.openepcis.io/extensions/eu/battery/` | OpenEPCIS managed |

**Ontology URL:** `https://ref.openepcis.io/extensions/eu/battery/`

### EPCIS Standard Context

| URL | Description |
|-----|-------------|
| `https://ref.gs1.org/standards/epcis/epcis-context.jsonld` | Official GS1 EPCIS 2.0 JSON-LD context |

---

## EPCIS Context URLs

### For EPCIS Events

All EPCIS events MUST use this context structure:

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    {
      "battery": "https://ref.openepcis.io/extensions/eu/battery/"
    }
  ]
}
```

### For Product Master Data

Product master data uses namespace prefixes directly:

```json
{
  "@context": {
    "gs1": "https://ref.gs1.org/voc/",
    "battery": "https://ref.openepcis.io/extensions/eu/battery/",
    "xsd": "http://www.w3.org/2001/XMLSchema#"
  }
}
```

### Custom Contexts

| Context | Path | Purpose |
|---------|------|---------|
| Default | `context/battery-context.jsonld` | GS1-native, supply chain |
| Scientific | `context/battery-context-scientific.jsonld` | EMMO/QUDT bridges |

---

## Fragment Identifiers

Nested objects within the product master use fragment identifiers for unique `id`:

### Pattern

```
{battery-uri}#{component}
```

### Examples

| Component | Fragment | Full id |
|-----------|----------|----------|
| Chemistry | `#chemistry` | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#chemistry` |
| Specifications | `#specs` | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#specs` |
| Recycled Content | `#recycled` | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#recycled` |
| End of Life | `#eol` | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#eol` |
| Due Diligence | `#due-diligence` | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#due-diligence` |
| Operator | `#operator` | `https://id.gs1.org/417/9521234000006#operator` |
| Address | `#address` | `https://id.gs1.org/417/9521234000006#address` |

### Material Composition

```
{battery-uri}#mat-{element-symbol}
```

| Material | Full id |
|----------|----------|
| Lithium | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#mat-li` |
| Iron | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#mat-fe` |
| Graphite | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#mat-c` |

### Hazardous Substances

```
{battery-uri}#haz-{component}
```

| Substance | Full id |
|-----------|----------|
| Electrolyte | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#haz-electrolyte` |
| Solvent | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#haz-solvent` |

### Labels

```
{battery-uri}#label-{subject}
```

| Label | Full id |
|-------|----------|
| WEEE | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#label-weee` |
| Hazard | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#label-hazard` |
| Carbon Footprint | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#label-cfp` |
| Fire | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#label-fire` |

### Power Capability

```
{battery-uri}#power-{soc-level}
```

| SoC Level | Full id |
|-----------|----------|
| 80% | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#power-80` |
| 20% | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#power-20` |

### Temperature Range

```
{battery-uri}#temp-{context}
```

| Context | Full id |
|---------|----------|
| Idle | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#temp-idle` |

### Dismantling Documents

```
{battery-uri}#dismantle-{doc-type}
```

| Document Type | Full id |
|---------------|----------|
| BOM | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#dismantle-bom` |
| 3D Model | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#dismantle-3d` |
| Manual | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#dismantle-manual` |

### Spare Parts

```
{battery-uri}#spare-{index}
```

| Supplier | Full id |
|----------|----------|
| Primary | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#spare-1` |
| Secondary | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#spare-2` |

### Regulatory Information

```
{battery-uri}#reg-{regulation-type}
```

| Regulation | Full id |
|------------|----------|
| Battery Directive | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#reg-battery` |
| CE Marking | `https://id.gs1.org/01/09521234000013/21/BAT2024-001#reg-ce` |

---

## Event Identifiers

### EPCIS Event UUID Pattern

All EPCIS events use UUID-based URNs:

```
urn:uuid:{uuid-v4}
```

### Event UUID Assignments

| Event Type | File | Event id |
|------------|------|-----------|
| Commissioning | `commissioning.jsonld` | `urn:uuid:550e8400-e29b-41d4-a716-446655440001` |
| Carbon Footprint | `carbon-footprint.jsonld` | `urn:uuid:550e8400-e29b-41d4-a716-446655440002` |
| State of Health | `state-of-health.jsonld` | `urn:uuid:550e8400-e29b-41d4-a716-446655440003` |
| Ownership Transfer | `ownership-transfer.jsonld` | `urn:uuid:550e8400-e29b-41d4-a716-446655440004` |
| Negative Event | `negative-event.jsonld` | `urn:uuid:550e8400-e29b-41d4-a716-446655440010` |
| Regulatory Notification | `regulatory-notification.jsonld` | `urn:uuid:550e8400-e29b-41d4-a716-446655440010` |
| Temperature Extreme | `temperature-extreme.jsonld` | `urn:uuid:550e8400-e29b-41d4-a716-446655440011` |
| SOCE Measurement | `state-of-certified-energy.jsonld` | `urn:uuid:550e8400-e29b-41d4-a716-446655440012` |

---

## External Resources

### Referenced Document URLs

These are example URLs for a fictional company. In production, replace with actual document URLs.

| Document Type | Example URL |
|---------------|-------------|
| EU Declaration | `https://www.ecocell-batteries.example.com/docs/IM-500-eu-doc.pdf` |
| Test Report | `https://www.ecocell-batteries.example.com/docs/IM-500-test-report.pdf` |
| User Manual | `https://www.ecocell-batteries.example.com/docs/IM-500-manual.pdf` |
| Safety Data Sheet | `https://www.ecocell-batteries.example.com/docs/IM-500-sds.pdf` |
| CFP Study | `https://www.ecocell-batteries.example.com/docs/IM-500-cfp-study.pdf` |
| Dismantling BOM | `https://www.ecocell-batteries.example.com/docs/IM-500-bom.pdf` |
| 3D Model | `https://www.ecocell-batteries.example.com/docs/IM-500-3d-model.step` |
| Dismantling Manual | `https://www.ecocell-batteries.example.com/docs/IM-500-dismantling.pdf` |

### Business Transaction URLs

| Transaction Type | Pattern |
|------------------|---------|
| Purchase Order | `https://{company}.example.com/orders/{po-id}` |
| Invoice | `https://{company}.example.com/invoices/{inv-id}` |
| Certificate | `https://{company}.example.com/docs/{cert-id}.pdf` |

### Device Metadata URLs

| Device | Metadata URL |
|--------|--------------|
| BMS | `https://bms-vendor.example.com/devices/BMS-3000` |
| Temp Logger | `https://logistics-sensors.example.com/devices/TempLogger-X200` |

---

## Process Assumptions

### bizStep Values (EPCIS 2.0 JSON-LD)

In EPCIS 2.0 JSON-LD, bizStep values are **bare strings** that the context expands:

| Use Case | bizStep Value | Expanded URI |
|----------|---------------|--------------|
| Battery creation | `"commissioning"` | `https://ref.gs1.org/cbv/BizStep-commissioning` |
| SoH measurement | `"inspecting"` | `https://ref.gs1.org/cbv/BizStep-inspecting` |
| Ownership change | `"accepting"` | `https://ref.gs1.org/cbv/BizStep-accepting` |
| Regulatory filing | `"notifying"` | `https://ref.gs1.org/cbv/BizStep-notifying` |

### disposition Values (EPCIS 2.0 JSON-LD)

Similarly, disposition values are **bare strings**:

| Use Case | disposition Value | Expanded URI |
|----------|-------------------|--------------|
| In operation | `"active"` | `https://ref.gs1.org/cbv/Disp-active` |
| In shipment | `"in_transit"` | `https://ref.gs1.org/cbv/Disp-in_transit` |
| Compliance confirmed | `"conformant"` | `https://ref.gs1.org/cbv/Disp-conformant` |
| Physically damaged | `"damaged"` | `https://ref.gs1.org/cbv/Disp-damaged` |
| Needs repair/replace | `"needs_replacement"` | `https://ref.gs1.org/cbv/Disp-needs_replacement` |

### action Values

| Event Type | action | Meaning |
|------------|--------|---------|
| Commissioning | `ADD` | Battery comes into existence |
| Measurement | `OBSERVE` | Read-only observation |
| Transfer | `OBSERVE` | Ownership observation |

### Master Data Linkage

EPCIS 2.0 links events to master data using `gs1:masterDataAvailableFor` ON THE EPC:

```json
{
  "epcList": [
    {
      "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
      "masterDataAvailableFor": {
        "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001"
      }
    }
  ]
}
```

This pattern indicates the EPC's master data is available at the same Digital Link URI.

### Unit of Measure Codes

All measurements use UN/CEFACT Rec 20 codes:

| Measurement | UoM Code | Symbol |
|-------------|----------|--------|
| Percentage | `P1` | % |
| Ampere-hour | `AH` | Ah |
| Kilowatt-hour | `KWH` | kWh |
| Volt | `VLT` | V |
| Kilowatt | `KWT` | kW |
| Ohm | `OHM` | Ω |
| Celsius | `CEL` | °C |
| Kilogram | `KGM` | kg |

### Event Timeline Assumptions

The example events follow this lifecycle:

| Order | Date | Event | File |
|-------|------|-------|------|
| 1 | 2024-03-15 | Commissioning | `commissioning.jsonld` |
| 2 | 2024-03-15 | Regulatory Notification | `regulatory-notification.jsonld` |
| 3 | 2024-03-20 | Carbon Footprint Declaration | `carbon-footprint.jsonld` |
| 4 | 2024-04-10 | Ownership Transfer | `ownership-transfer.jsonld` |
| 5 | 2025-02-20 | Negative Event (Damage) | `negative-event.jsonld` |
| 6 | 2025-06-15 | State of Health Check | `state-of-health.jsonld` |
| 7 | 2025-07-18 | Temperature Excursion | `temperature-extreme.jsonld` |
| 8 | 2025-09-10 | SOCE Measurement | `state-of-certified-energy.jsonld` |

### Party Assumptions

| GLN | Organization | Role |
|-----|--------------|------|
| `9521234000006` | EcoCell GmbH | Manufacturer |
| `9521234000013` | EcoCell Stuttgart Plant | Production Facility |
| `9521987000001` | Industrial Energy Systems GmbH | Operator/Owner |
| `9521987000018` | IE Systems Service Center | Service Location |

---

## Verification

### URL Validation Checklist

- [ ] All `id` values are valid URIs
- [ ] All GS1 Digital Link URIs follow AI syntax
- [ ] All fragment identifiers are URL-safe
- [ ] All vocabulary prefixes resolve
- [ ] All context URLs are accessible

### JSON-LD Validation

```bash
# Validate with JSON-LD playground
jsonld normalize examples/battery-product.jsonld

# Check context resolution
curl -H "Accept: application/ld+json" https://ref.gs1.org/standards/epcis/epcis-context.jsonld
```

### EPCIS Validation

Ensure all events:
- Have unique `id` (UUID)
- Use `type` for explicit typing (mapped from `@type` via context)
- Include `masterDataAvailableFor` on EPCs
- Use bare string bizStep/disposition values
