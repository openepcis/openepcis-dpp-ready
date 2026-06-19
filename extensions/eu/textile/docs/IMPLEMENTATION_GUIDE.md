# Textile DPP Implementation Guide

This guide covers implementing a Digital Product Passport for textile products using the OpenEPCIS Textile vocabulary, aligned with ESPR 2024/1781 and the EU Preparatory Study on Textiles 3rd Milestone (December 2025).

## Quick Start

### 1. Product Identification

Use GS1 Digital Link URIs for product identification:

```
https://id.gs1.org/01/{GTIN}/21/{serial}
```

### 2. Required EPCIS Extension Header

```http
GS1-Extensions: eutex=https://ref.openepcis.io/extensions/eu/textile/, oec=https://ref.openepcis.io/extensions/common/core/
```

### 3. JSON-LD Context

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld"
  ]
}
```

## Data Requirements by EU Preparatory Study

### Mandatory Product Classification

Every textile product must specify:

| Property | Description | Example |
|----------|-------------|---------|
| `schema:category` | High-level category | `Apparel`, `Footwear` |
| `eutex:fabricType` | Fabric construction | `Knitted`, `Denim`, `WovenNonDenim` |
| `eutex:apparelSubcategory` | Specific subcategory | `JacketsCoats`, `TShirts` |

Fabric type is critical because robustness test thresholds differ by construction type.

### Robustness Score (0-10)

The composite robustness score has three components, all measured after 5 cleaning cycles per ISO 6330:

| Component | Max Points | Test Standard |
|-----------|-----------|---------------|
| Spirality | 3 | ISO 16322-3 |
| Dimensional Change | 3 | ISO 3759 |
| Visual Inspection | 4 | ISO 15487 |

See [ROBUSTNESS_SCORING.md](ROBUSTNESS_SCORING.md) for detailed scoring tables.

### Recyclability Score (0-10)

Based on elastane content, sorting factors, and technical recyclability.

See [RECYCLABILITY_SCORING.md](RECYCLABILITY_SCORING.md) for detailed scoring methodology.

### Recycled Content Declaration

Replace simple boolean `isRecycledFiber` with structured `RecycledContentDeclaration`:

```json
{
  "recycledContentDeclaration": [{
    "type": "eutex:RecycledContentDeclaration",
    "secondaryMaterialFraction": 50.0,
    "wasteOriginType": "PostConsumer",
    "recycledSourceType": "OpenLoop",
    "chainOfCustodyMethod": "Certified",
    "meetsTargetThreshold": true
  }]
}
```

### Environmental Footprint

Report per PEFCR Apparel & Footwear methodology:

```json
{
  "environmentalFootprint": {
    "type": "eutex:EnvironmentalFootprint",
    "carbonFootprintManufacturing": 18.5,
    "pefSingleScore": 42.3,
    "benchmarkPerformance": -15.2,
    "dataTypeIndicator": "MixedData",
    "pefcrReference": "PEFCR Apparel & Footwear v1.3"
  }
}
```

### Substances of Concern (4-Type Classification)

Per ESPR Article 7(5), classify substances into 4 types:

| Type | Description | Threshold |
|------|-------------|-----------|
| A | SVHC per REACH | 0.1% w/w |
| B | CLP hazard classification | Per CLP |
| C | POPs per EU 2019/1021 | Per POPs regulation |
| D | Recycling hindrance | Product-specific |

```json
{
  "substancesOfConcern": [{
    "type": "eutex:SubstanceOfConcern",
    "socType": "SoCTypeB",
    "chemicalName": "Disperse Blue 291",
    "casNumber": "56548-64-2",
    "clpHazardCategory": "Sensitizer",
    "substanceConcentration": 0.008
  }]
}
```

## EPCIS Event Lifecycle

A typical textile product goes through these EPCIS events:

1. **Spinning** (TransformationEvent) - Fiber to yarn
2. **Weaving** (TransformationEvent) - Yarn to fabric
3. **Garment Assembly** (TransformationEvent) - Fabric to finished product
4. **Commissioning** (ObjectEvent/ADD) - Product enters the system
5. **Durability Testing** (ObjectEvent/OBSERVE) - Robustness score
6. **Chemical Testing** (ObjectEvent/OBSERVE) - SoC results
7. **Carbon Footprint** (ObjectEvent/OBSERVE) - PEF data

See `textile/epcis/` for complete event examples.

## Migration from v0.9.0

### Deprecated Properties

| Old Property | Replacement |
|-------------|-------------|
| `eutex:isRecycledFiber` | `eutex:recycledContentDeclaration` |
| `eutex:recycledContentSource` | `eutex:recycledContentDeclaration` |
| `eutex:textileChemicals` | `eutex:substancesOfConcern` |

The deprecated properties still work but new implementations should use the replacements.

## Validation

### TTL Syntax

```bash
rapper -i turtle textile/ontology/textile.ttl
```

### SHACL Shapes

Validate instances against `textile/validation/textile-shapes.ttl` for:
- Score ranges (robustness 0-10, spirality 0-3, etc.)
- Required fields (SoC type and chemical name)
- Data type constraints

### JSON Schema

Use `textile/validation/textile-schema.json` for JSON validation of DPP payloads.

## References

- [EU Preparatory Study on Textiles (JRC)](https://susproc.jrc.ec.europa.eu/product-bureau/product-groups/sustainable-textiles)
- [ESPR 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781)
- [PEFCR Apparel & Footwear](https://ec.europa.eu/environment/eussd/smgp/PEFCR_OEFSR_en.htm)
- [GS1 Web Vocabulary](https://ref.gs1.org/voc/)
