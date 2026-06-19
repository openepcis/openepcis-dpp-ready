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
| `oec:recyclableContent` | `untp:recyclableContent` | CircularityPerformance | decimal | Recyclability percentage |
| `oec:recycledContent` | `untp:recycledContent` | RecycledContent | decimal | Total recycled content |
| `oec:preConsumerRecycledContent` | - | RecycledContent | decimal | Pre-consumer breakdown |
| `oec:postConsumerRecycledContent` | - | RecycledContent | decimal | Post-consumer breakdown |
| `oec:utilityFactor` | `untp:utilityFactor` | CircularityPerformance | decimal | Durability multiplier (1.0 = average) |
| `oec:materialCircularityIndicator` | `untp:materialCircularityIndicator` | CircularityPerformance | decimal | Overall MCI score |

### Material Properties

| OpenEPCIS Property | UNTP Equivalent | Domain | Type | Notes |
|-------------------|-----------------|--------|------|-------|
| `oec:massFraction` | `untp:massFraction` | MaterialComposition | decimal | Mass percentage of material |
| `oec:materialName` | `untp:materialName` | MaterialComposition | string | Material identifier |
| `oec:isCriticalRawMaterial` | - | MaterialComposition | boolean | EU CRM flag (OpenEPCIS extension) |

### Emissions Properties

| OpenEPCIS Property | UNTP Equivalent | Domain | Type | Notes |
|-------------------|-----------------|--------|------|-------|
| `oec:carbonFootprintTotal` | `untp:carbonFootprint` | EmissionsPerformance | decimal | Total CO2e in kg |
| `oec:declaredUnit` | `untp:declaredUnit` | EmissionsPerformance | string | Functional unit (kg CO2e/kWh) |
| `oec:operationalScope` | `untp:operationalScope` | EmissionsPerformance | enum | CradleToGate / CradleToGrave |
| `oec:primarySourcedRatio` | `untp:primarySourcedRatio` | EmissionsPerformance | decimal | Direct measurement ratio |

### Traceability Properties

| OpenEPCIS Property | UNTP Equivalent | Domain | Type | Notes |
|-------------------|-----------------|--------|------|-------|
| `oec:verifiedRatio` | `untp:verifiedRatio` | TraceabilityPerformance | decimal | Verified supply chain ratio |
| `oec:granularityLevel` | `untp:granularityLevel` | - | enum | ProductClass / Batch / Item |

### UNTP v0.6.x Additional Properties

| OpenEPCIS Property | UNTP Equivalent | Domain | Type | Notes |
|-------------------|-----------------|--------|------|-------|
| `oec:circularityPerformance` | `untp:circularityScorecard` | - | @id | UNTP v0.6.x scorecard concept |
| `oec:emissionsPerformance` | `untp:emissionsScorecard` | - | @id | UNTP v0.6.x scorecard concept |
| `oec:conformityDeclaration` | `untp:conformityClaim` | - | @id | New in UNTP v0.6.x |
| `oec:dueDiligenceReport` | `untp:dueDiligenceDeclaration` | - | @id | New in UNTP v0.6.x |
| `oec:materialComposition` | `untp:materialsProvenance` | - | @id | New in UNTP v0.6.x |
| `gs1:product` | `untp:product` | - | @id | Product reference |
| `oec:materialName` | `untp:materialName` | MaterialComposition | string | Material identifier |
| `oec:isCriticalRawMaterial` | `untp:isCriticalRawMaterial` | MaterialComposition | boolean | EU CRM flag |

## Class Mapping Table

| OpenEPCIS Class | UNTP Equivalent | Notes |
|-----------------|-----------------|-------|
| `oec:CircularityPerformance` | `untp:CircularityPerformance` | `owl:equivalentClass` |
| `oec:EmissionsPerformance` | `untp:EmissionsPerformance` | `owl:equivalentClass` |
| `oec:TraceabilityPerformance` | `untp:TraceabilityPerformance` | `rdfs:seeAlso` |
| `oec:MaterialComposition` | `untp:Material` | `rdfs:seeAlso` |
| `oec:OperatorInformation` | `untp:Party` | OpenEPCIS has role enumeration |
| `oec:FacilityInformation` | `untp:Facility` | OpenEPCIS has GLN support |
| `oec:DigitalProductPassport` | `untp:ProductPassport` | New in UNTP v0.6.x |
| `oec:FacilityInformation` | `untp:FacilityRecord` | New in UNTP v0.6.x |
| `oec:ConformityDeclaration` | `untp:ConformityAttestation` | New in UNTP v0.6.x |

## Enumeration Mapping

### Operational Scope

| OpenEPCIS | UNTP |
|-----------|------|
| `oec:CradleToGate` | `untp:CradleToGate` |
| `oec:CradleToGrave` | `untp:CradleToGrave` |

### Granularity Level

| OpenEPCIS | UNTP |
|-----------|------|
| `oec:ProductClass` | `untp:ProductClass` |
| `oec:Batch` | `untp:Batch` |
| `oec:Item` | `untp:Item` |

## OpenEPCIS-Only Properties

These properties exist in OpenEPCIS but have no UNTP equivalent:

| Property | Purpose |
|----------|---------|
| `oec:economicOperatorId` | EU EOID per ESPR Article 77 |
| `oec:scipId` | ECHA SCIP database identifier |
| `oec:repairabilityScore` | French Repairability Index |
| `oec:repairabilityClass` | A-E repair classification |
| `oec:accessLevel` | ESPR Article 9 access control |
| `oec:safeUseInstructions` | SCIP safe use text |
| `oec:safeDisassemblyInstructions` | SCIP disassembly text |

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
