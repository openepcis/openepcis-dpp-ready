# Detergent Module

This module provides vocabulary and examples for implementing EU Regulation 2026/405 (Detergents and Surfactants) Digital Product Passports using GS1 standards.

> **Disclaimer**: This is **not official GS1 guidance**, but it is built entirely on official GS1 standards and follows GS1 best practices:
> - [GS1 Web Vocabulary](https://www.gs1.org/voc/) — Linked data vocabulary
> - [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link) — Resolvable URIs as product identifiers
> - [EPCIS 2.0](https://ref.gs1.org/standards/epcis/) — Event-based traceability with JSON-LD

## Regulation Overview

**EU Regulation 2026/405 on Detergents and Surfactants**

- **Entry into force**: March 2026
- **Full application**: September 2029
- **Replaces**: Legacy Regulation 648/2004
- **Scope**: All detergents and surfactants placed on the EU market
- **ESPR alignment**: Detergents are a priority product category under ESPR 2024/1781

**Key DPP Requirements**:
1. Full ingredient disclosure using INCI nomenclature
2. Surfactant biodegradability per Annex III (ultimate aerobic >=60%)
3. CLP hazard classification (pictograms, H/P statements, signal word)
4. Phosphorus/phosphate compliance
5. Fragrance allergen disclosure
6. Microorganism disclosure (Article 19) if applicable
7. Film biodegradability for capsule/pod formats

**DPP Model**: Model-based — same manufacturer + identical formulation = one DPP (not per batch).

## Module Contents

```
detergent/
├── VERSION                              # Module version (0.9.6)
├── CHANGELOG.md                         # Version history
├── README.md                            # This file
├── ontology/
│   └── detergent.ttl                   # Detergent vocabulary (extensions only)
├── json/
│   └── detergent.json                  # Generated JSON (for web apps)
├── context/
│   └── detergent-context.jsonld        # JSON-LD context
├── examples/
│   ├── laundry-detergent.jsonld        # Liquid laundry product (full example)
│   └── dishwasher-detergent.jsonld     # Dishwasher capsule (film biodegradability)
├── epcis/
│   └── commissioning.jsonld            # Product model commissioning event
├── validation/
│   ├── detergent-shapes.ttl            # SHACL validation shapes
│   └── detergent-schema.json           # JSON Schema
└── docs/
    └── IMPLEMENTATION_GUIDE.md         # Step-by-step implementation
```

## Vocabulary Namespace

The Detergent vocabulary uses the namespace: `https://ref.openepcis.io/extensions/eu/detergent/`

Browse the vocabulary at: [ref.openepcis.io/extensions/eu/detergent/](https://ref.openepcis.io/extensions/eu/detergent/)

## Key Concepts

### INCI Ingredient List
Ingredients are declared using International Nomenclature of Cosmetic Ingredients (INCI) names with prescribed weight percentage brackets:

```json
{
  "type": "Ingredient",
  "inciName": "Sodium Dodecylbenzenesulfonate",
  "ingredientFunction": "SurfactantFunction",
  "weightPercentRange": "5-15%",
  "casNumber": "25155-30-0",
  "isSurfactant": true
}
```

### Surfactant Biodegradability (Annex III)
Each surfactant type requires ultimate aerobic biodegradability testing (>=60% within 28 days):

```json
{
  "type": "SurfactantBiodegradability",
  "surfactantType": "Anionic",
  "biodegradationPercentage": 82.5,
  "testMethod": "OECD301B",
  "testDurationDays": 28,
  "passesUltimateBiodegradability": true
}
```

### CLP Hazard Classification
Products are classified per CLP Regulation 1272/2008:

```json
{
  "signalWord": "Warning",
  "hazardPictograms": ["GHS07"],
  "hStatements": ["H315", "H319"],
  "pStatements": ["P101", "P102", "P280"]
}
```

### Film Biodegradability (Capsules/Pods)
For capsule/pod products, the water-soluble film must meet biodegradability requirements:

```json
{
  "filmBiodegradable": true,
  "filmBiodegradabilityPercentage": 94.7
}
```

## Shared ESPR Core Classes

The Detergent module reuses ESPR-aligned patterns from the core DPP module:

| ESPR Pattern | Core Class | Detergent Usage |
|--------------|------------|-----------------|
| Hazardous Substances | `dpp:HazardousSubstance` | CLP-classified substances in formulation |
| Article 77 - Operator ID | `dpp:OperatorInformation` | Manufacturer placing product on EU market |
| Documents | `dpp:DocumentReference` | Safety data sheets, test reports |

## Dependencies

- **Core module**: `>= 0.9.6`
  - Uses `dpp:HazardousSubstance` for CLP-classified substances
  - Uses `dpp:OperatorInformation` for economic operator data
  - Uses `dpp:DocumentReference` for SDS and test reports

## Usage

### EPCIS 2.0 Extension Integration

Declare the Detergent extension in EPCIS capture/query requests:

```http
GS1-Extensions: detergent=https://ref.openepcis.io/extensions/eu/detergent/
```

**Architecture rule**: `gs1:masterDataAvailableFor` contains only `gs1:` properties. Detergent-specific extensions (`detergent:`) go at event level. See [core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md](../core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md).

### Use the JSON-LD context
```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/detergent/detergent-context.jsonld"
  ]
}
```

## Vocabulary Namespaces

| Prefix | Namespace | Purpose |
|--------|-----------|---------|
| `gs1:` | `https://ref.gs1.org/voc/` | Core GS1 vocabulary |
| `dpp:` | `https://ref.openepcis.io/extensions/common/core/` | DPP Core extension properties |
| `detergent:` | `https://ref.openepcis.io/extensions/eu/detergent/` | Detergent extension properties |

## Scope Decisions

- **Detergent-only**: Pharmaceuticals are excluded from ESPR (covered by FMD serialization). Cosmetics have no firm DPP mandate yet. A separate cosmetics module can be added later — INCI nomenclature patterns from this module would be reusable.

## Example Identifiers

All examples use GS1 demo prefix **952** (7-digit GCP: `9521234`):
- GTIN (laundry): `09521234200013`
- GTIN (dishwasher): `09521234200020`
- GLN (Party): `9521234000008`
- GLN (Location): `9521234000046`

## License

Apache License 2.0 - See LICENSE file in repository root.

## References

- [EU Regulation 2026/405](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R0405)
- [ESPR 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781)
- [Legacy Regulation 648/2004](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004R0648)
- [CLP Regulation 1272/2008](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008R1272)
- [EPCIS 2.0 Standard](https://ref.gs1.org/standards/epcis/)
