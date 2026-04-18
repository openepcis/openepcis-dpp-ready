# Detergent DPP Implementation Guide

This guide covers implementing Digital Product Passports for detergents and surfactants per EU Regulation 2026/405.

## Timeline

| Date | Milestone |
|------|-----------|
| March 2026 | Regulation enters into force |
| September 2029 | Full application (DPP mandatory) |

## DPP Model: Product-Model-Based

Unlike serialized products (e.g., batteries), detergent DPPs are **model-based**:
- One DPP per **product model** (same manufacturer + identical formulation)
- Identified by GTIN only (no serial number)
- Reformulation creates a new DPP

## Step 1: Product Identification

Use GS1 Digital Link URIs with GTIN:

```json
{
  "id": "https://id.gs1.org/01/09521234200013",
  "type": ["Product", "DetergentProduct"],
  "gtin": "09521234200013"
}
```

## Step 2: Product Classification

```json
{
  "detergentCategory": "LaundryDetergent",
  "productForm": "Liquid",
  "intendedUse": "Machine and hand washing of textiles at 20-60°C",
  "cnCode": "3402 20 90"
}
```

## Step 3: Ingredient Declaration

Use INCI names with prescribed weight percentage brackets:

| Bracket | Meaning |
|---------|---------|
| `<5%` | Less than 5% |
| `5-15%` | Between 5% and 15% |
| `15-30%` | Between 15% and 30% |
| `>=30%` | 30% or more |

Mark surfactant ingredients with `isSurfactant: true` — these require biodegradability testing.

## Step 4: Surfactant Biodegradability

Per Annex III, each surfactant type must demonstrate **ultimate aerobic biodegradability** (>=60% within 28 days):

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

Accepted test methods: ISO 14593, OECD 301B, OECD 301D, OECD 301F, OECD 310.

## Step 5: CLP Hazard Classification

Classify per CLP Regulation 1272/2008:

```json
{
  "signalWord": "Warning",
  "hazardPictograms": ["GHS07"],
  "hStatements": ["H315", "H319"],
  "pStatements": ["P101", "P102", "P280"]
}
```

## Step 6: Phosphorus Declaration

Declare total elemental phosphorus content and compliance:

```json
{
  "phosphorusContentPercent": 0.0,
  "phosphateCompliant": true
}
```

## Step 7: Fragrance Allergens

Disclose allergens present above the threshold:

```json
{
  "fragranceAllergens": [
    {
      "type": "FragranceAllergen",
      "allergenName": "Linalool",
      "allergenCasNumber": "78-70-6",
      "allergenConcentration": 0.15
    }
  ]
}
```

## Step 8: Film Biodegradability (Capsules Only)

For capsule/pod products, declare film biodegradability:

```json
{
  "filmBiodegradable": true,
  "filmBiodegradabilityPercentage": 94.7
}
```

## Step 9: Safety Data Sheet

Link the SDS using `dpp:DocumentReference`:

```json
{
  "safetyDataSheet": {
    "type": "DocumentReference",
    "dpp:documentType": {"id": "dpp:SafetyDataSheet"},
    "dpp:documentUrl": "https://example.com/sds/product-sds.pdf",
    "dpp:documentTitle": "Safety Data Sheet",
    "dpp:mimeType": "application/pdf"
  }
}
```

## Step 10: EPCIS Integration

For supply chain traceability, use EPCIS 2.0 events:

```http
GS1-Extensions: detergent=https://ref.openepcis.io/extensions/eu/detergent/
```

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/detergent/detergent-context.jsonld"
  ]
}
```

## Microorganism Disclosure (Article 19)

If the product contains intentionally added microorganisms:

```json
{
  "microorganisms": [
    {
      "type": "MicroorganismInfo",
      "speciesName": "Bacillus subtilis",
      "strainDesignation": "DSM 5547",
      "endProductCharacteristics": "Produces lipase and protease enzymes for grease decomposition"
    }
  ]
}
```

## Validation

- TTL: Use `rapper` tool
- JSON-LD: [json-ld.org/playground](https://json-ld.org/playground/)
- SHACL: Validate against `validation/detergent-shapes.ttl`
- JSON Schema: Validate against `validation/detergent-schema.json`
