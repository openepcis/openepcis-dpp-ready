# OpenEPCIS ↔ UNTP Property Mapping

Complete mapping between OpenEPCIS DPP-Ready and UN Transparency Protocol (UNTP) vocabulary. Aligned with UNTP v0.6.1 (source: https://opensource.unicc.org/un/unece/uncefact/spec-untp).

## Value Convention

OpenEPCIS and UNTP use the **same 0-1 decimal scale** for all ratio and fraction properties:

| Property | Example | Meaning |
|----------|---------|---------|
| `recycledContent: 0.45` | 45% recycled content |
| `massFraction: 0.15` | 15% of total mass |
| `verifiedRatio: 0.80` | 80% verified |

This ensures **native interoperability** - no value conversion is needed when exchanging data between OpenEPCIS and UNTP systems.

## Property Mapping Table

### Circularity Properties

| OpenEPCIS Property | UNTP Equivalent | Domain | Type | Notes |
|-------------------|-----------------|--------|------|-------|
| `dpp:recyclableContent` | `untp:recyclableContent` | CircularityPerformance | decimal | Recyclability percentage |
| `dpp:recycledContent` | `untp:recycledContent` | RecycledContent | decimal | Total recycled content |
| `dpp:preConsumerRecycledContent` | - | RecycledContent | decimal | Pre-consumer breakdown |
| `dpp:postConsumerRecycledContent` | - | RecycledContent | decimal | Post-consumer breakdown |
| `dpp:utilityFactor` | `untp:utilityFactor` | CircularityPerformance | decimal | Durability multiplier (1.0 = average) |
| `dpp:materialCircularityIndicator` | `untp:materialCircularityIndicator` | CircularityPerformance | decimal | Overall MCI score |

### Material Properties

| OpenEPCIS Property | UNTP Equivalent | Domain | Type | Notes |
|-------------------|-----------------|--------|------|-------|
| `dpp:massFraction` | `untp:massFraction` | MaterialComposition | decimal | Mass percentage of material |
| `dpp:materialName` | `untp:materialName` | MaterialComposition | string | Material identifier |
| `dpp:isCriticalRawMaterial` | - | MaterialComposition | boolean | EU CRM flag (OpenEPCIS extension) |

### Emissions Properties

| OpenEPCIS Property | UNTP Equivalent | Domain | Type | Notes |
|-------------------|-----------------|--------|------|-------|
| `dpp:carbonFootprintTotal` | `untp:carbonFootprint` | EmissionsPerformance | decimal | Total CO2e in kg |
| `dpp:declaredUnit` | `untp:declaredUnit` | EmissionsPerformance | string | Functional unit (kg CO2e/kWh) |
| `dpp:operationalScope` | `untp:operationalScope` | EmissionsPerformance | enum | CradleToGate / CradleToGrave |
| `dpp:primarySourcedRatio` | `untp:primarySourcedRatio` | EmissionsPerformance | decimal | Direct measurement ratio |

### Traceability Properties

| OpenEPCIS Property | UNTP Equivalent | Domain | Type | Notes |
|-------------------|-----------------|--------|------|-------|
| `dpp:verifiedRatio` | `untp:verifiedRatio` | TraceabilityPerformance | decimal | Verified supply chain ratio |
| `dpp:granularityLevel` | `untp:granularityLevel` | - | enum | ProductClass / Batch / Item |

### UNTP v0.6.x Additional Properties

| OpenEPCIS Property | UNTP Equivalent | Domain | Type | Notes |
|-------------------|-----------------|--------|------|-------|
| `dpp:circularityPerformance` | `untp:circularityScorecard` | - | @id | UNTP v0.6.x scorecard concept |
| `dpp:emissionsPerformance` | `untp:emissionsScorecard` | - | @id | UNTP v0.6.x scorecard concept |
| `dpp:conformityDeclaration` | `untp:conformityClaim` | - | @id | New in UNTP v0.6.x |
| `dpp:dueDiligenceReport` | `untp:dueDiligenceDeclaration` | - | @id | New in UNTP v0.6.x |
| `dpp:materialComposition` | `untp:materialsProvenance` | - | @id | New in UNTP v0.6.x |
| `gs1:product` | `untp:product` | - | @id | Product reference |
| `dpp:materialName` | `untp:materialName` | MaterialComposition | string | Material identifier |
| `dpp:isCriticalRawMaterial` | `untp:isCriticalRawMaterial` | MaterialComposition | boolean | EU CRM flag |

## Class Mapping Table

| OpenEPCIS Class | UNTP Equivalent | Notes |
|-----------------|-----------------|-------|
| `dpp:CircularityPerformance` | `untp:CircularityPerformance` | `owl:equivalentClass` |
| `dpp:EmissionsPerformance` | `untp:EmissionsPerformance` | `owl:equivalentClass` |
| `dpp:TraceabilityPerformance` | `untp:TraceabilityPerformance` | `rdfs:seeAlso` |
| `dpp:MaterialComposition` | `untp:Material` | `rdfs:seeAlso` |
| `dpp:OperatorInformation` | `untp:Party` | OpenEPCIS has role enumeration |
| `dpp:FacilityInformation` | `untp:Facility` | OpenEPCIS has GLN support |
| `dpp:DigitalProductPassport` | `untp:ProductPassport` | New in UNTP v0.6.x |
| `dpp:FacilityInformation` | `untp:FacilityRecord` | New in UNTP v0.6.x |
| `dpp:ConformityDeclaration` | `untp:ConformityAttestation` | New in UNTP v0.6.x |

## Enumeration Mapping

### Operational Scope

| OpenEPCIS | UNTP |
|-----------|------|
| `dpp:CradleToGate` | `untp:CradleToGate` |
| `dpp:CradleToGrave` | `untp:CradleToGrave` |

### Granularity Level

| OpenEPCIS | UNTP |
|-----------|------|
| `dpp:ProductClass` | `untp:ProductClass` |
| `dpp:Batch` | `untp:Batch` |
| `dpp:Item` | `untp:Item` |

## OpenEPCIS-Only Properties

These properties exist in OpenEPCIS but have no UNTP equivalent:

| Property | Purpose |
|----------|---------|
| `dpp:economicOperatorId` | EU EOID per ESPR Article 77 |
| `dpp:scipId` | ECHA SCIP database identifier |
| `dpp:repairabilityScore` | French Repairability Index |
| `dpp:repairabilityClass` | A-E repair classification |
| `dpp:accessLevel` | ESPR Article 9 access control |
| `dpp:safeUseInstructions` | SCIP safe use text |
| `dpp:safeDisassemblyInstructions` | SCIP disassembly text |

## Deprecated Property Aliases

For backwards compatibility, these deprecated property names map to current terms:

| Deprecated Name | Current Name |
|----------------|--------------|
| `recyclabilityRate` | `recyclableContent` |
| `totalRecycledShare` | `recycledContent` |
| `preConsumerShare` | `preConsumerRecycledContent` |
| `postConsumerShare` | `postConsumerRecycledContent` |
| `massPercentage` | `massFraction` |
| `carbonFootprintUnit` | `declaredUnit` |
| `circularityInfo` | `circularityPerformance` |
| `CircularityInfo` | `CircularityPerformance` |

## Using the Bridge Context

To process UNTP-style data with OpenEPCIS:

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/common/interop/untp-bridge-context.jsonld"
  ],
  "type": "CircularityPerformance",
  "recyclableContent": 80,
  "recycledContent": 45,
  "utilityFactor": 1.2,
  "materialCircularityIndicator": 65
}
```

This expands to OpenEPCIS URIs:

```json
{
  "@type": "https://ref.openepcis.io/extensions/common/core/CircularityPerformance",
  "https://ref.openepcis.io/extensions/common/core/recyclableContent": 80,
  "https://ref.openepcis.io/extensions/common/core/recycledContent": 45,
  "https://ref.openepcis.io/extensions/common/core/utilityFactor": 1.2,
  "https://ref.openepcis.io/extensions/common/core/materialCircularityIndicator": 65
}
```
