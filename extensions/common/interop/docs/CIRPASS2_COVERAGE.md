# CIRPASS2 Requirements Coverage

Analysis of how OpenEPCIS DPP-Ready covers CIRPASS2 Digital Product Passport pilot requirements.

## Overview

CIRPASS2 (Circular Economy Product Passport Readiness) is an EU project defining requirements for Digital Product Passports. OpenEPCIS DPP-Ready provides comprehensive coverage of these requirements.

## Coverage Summary

| Category | Coverage | OpenEPCIS Module |
|----------|----------|-----------------|
| Product Identification | Full | Core (`oec:uniqueProductIdentifier`) |
| Manufacturer Information | Full | Core (`oec:OperatorInformation`) |
| Facility Information | Full | Core (`oec:FacilityInformation`) |
| Material Composition | Full | Core (`oec:MaterialComposition`) |
| Substances of Concern | Full | Core (`oec:SubstanceOfConcern`) |
| Carbon Footprint | Full | Core (`oec:EmissionsPerformance`) |
| Circularity | Full | Core (`oec:CircularityPerformance`) |
| Repairability | Full | Core (`oec:RepairabilityInfo`) |
| Durability | Full | Core (`oec:PerformanceInfo`) |
| Access Control | Full | Core (`oec:AccessRights`) |
| Battery-Specific | Full | Battery (`eubat:`) |
| Textile-Specific | Full | Textile (`eutex:`) |

## Detailed Coverage

### Product Identification

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Unique product identifier | `oec:uniqueProductIdentifier` (GS1 Digital Link) |
| Product model/type | `oec:productModel`, `oec:productCategory` |
| Batch/lot number | EPCIS lot tracking, `oec:granularityLevel` |
| Serial number | GS1 Serial (AI 21) |
| Passport identifier | `oec:passportIdentifier` |
| Passport version | `oec:passportVersion` |

### Manufacturer Information

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Manufacturer name | `gs1:organizationName` via `oec:OperatorInformation` |
| Manufacturer ID | `oec:operatorId` (GLN), `oec:economicOperatorId` (EOID) |
| Contact information | `gs1:address`, `gs1:contactPoint` |
| Operator role | `oec:operatorRole` (Manufacturer, Importer, etc.) |
| Registration numbers | `oec:registrationNumber`, `oec:eoriNumber`, `oec:vatIdentificationNumber` |

### Facility Information

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Manufacturing location | `oec:FacilityInformation` |
| Facility identifier | `gs1:gln` (inherited from gs1:Place) |
| Facility name | `gs1:name` (inherited from gs1:Place) |
| Facility address | `gs1:address` (inherited from gs1:Place) |
| Facility certifications | `oec:facilityCertifications` (gs1:CertificationDetails) |
| Facility type | `oec:facilityType` |

### Material Composition

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Material name | `oec:materialName` |
| Material percentage | `oec:massFraction` |
| Material origin | `oec:sourceCountry` |
| CAS/EC numbers | `oec:casNumber`, `oec:ecNumber` |
| Critical raw materials | `oec:isCriticalRawMaterial` |

### Substances of Concern

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Substance identification | `oec:SubstanceOfConcern` |
| SCIP database link | `oec:scipId` |
| Hazard classification | `oec:hazardClass` (CLP categories) |
| Concentration | `oec:concentration` |
| Location in product | `oec:substanceLocation` |
| Safe use instructions | `oec:safeUseInstructions` |
| Disassembly instructions | `oec:safeDisassemblyInstructions` |

### Carbon Footprint

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Total carbon footprint | `oec:carbonFootprintTotal` |
| Functional unit | `oec:declaredUnit` |
| Lifecycle scope | `oec:operationalScope` (CradleToGate/CradleToGrave) |
| Data quality | `oec:primarySourcedRatio` |
| Study reference | `oec:carbonFootprintStudyUrl` |

### Circularity

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Recyclability rate | `oec:recyclableContent` |
| Recycled content | `oec:recycledContent` |
| Pre-consumer recycled | `oec:preConsumerRecycledContent` |
| Post-consumer recycled | `oec:postConsumerRecycledContent` |
| Circularity indicator | `oec:materialCircularityIndicator` |
| End-of-life instructions | `oec:endOfLifeInstructions` |
| Waste prevention | `oec:wastePreventionInfo` |
| Separate collection | `oec:separateCollectionInfo` |
| Dismantling info | `oec:dismantlingInstructions` |

### Repairability

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Repairability score | `oec:repairabilityScore` |
| Repairability class | `oec:repairabilityClass` (A-E) |
| Spare parts availability | `oec:sparePartsAvailability` |
| Spare parts delivery | `oec:sparePartsDeliveryTime` |
| Repair instructions | `oec:repairInstructions` |
| Professional repair network | `oec:professionalRepairNetwork` |
| DIY repair possible | `oec:diyRepairPossible` |
| Software updates | `oec:softwareUpdatesAvailability` |

### Durability

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Expected lifespan | `oec:expectedLifespan` |
| Guaranteed lifespan | `oec:guaranteedLifespan` |
| Usage cycles | `oec:usageCycles` |
| Technical lifetime | `oec:technicalLifetime` |
| Performance class | `oec:performanceClass` |
| Tested conditions | `oec:testedConditions` |
| Utility factor | `oec:utilityFactor` |

### Access Control

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Public data | `oec:Public` access level |
| Authority-only data | `oec:AuthorizedOnly` access level |
| Restricted data | `oec:Restricted` access level |
| Authorized parties | `oec:authorizedParties` |
| Data retention | `oec:dataRetentionPeriod` |

## Domain-Specific Coverage

### Battery DPP (CIRPASS2 Battery Pilot)

The `eubat:` module provides full coverage of Battery Regulation 2023/1542 Annex XIII:

- Battery chemistry and composition
- Technical specifications (capacity, voltage, power)
- State of health and performance degradation
- Recycled content by material (Li, Co, Ni, Pb)
- Carbon footprint with lifecycle phases
- Dismantling documentation (DIN DKE SPEC 99100)
- Due diligence for raw materials

### Textile DPP (CIRPASS2 Textile Pilot)

The `eutex:` module provides coverage for EU Textile Strategy:

- Fiber composition (EU Textile Labelling Regulation)
- Care instructions (ISO 3758)
- Durability metrics and classes
- Microplastic shedding information
- Textile certifications (GOTS, OEKO-TEX, etc.)
- Repair services and take-back programs

## Traceability (EPCIS Integration)

OpenEPCIS provides full supply chain traceability via EPCIS 2.0:

| CIRPASS2 Requirement | EPCIS Implementation |
|---------------------|---------------------|
| Production events | `ObjectEvent` with `COMMISSIONING` |
| Transformation | `TransformationEvent` |
| Transport | `ObjectEvent` with `SHIPPING`/`RECEIVING` |
| Ownership transfer | `ObjectEvent` with `TRANSFER` |
| End-of-life | `ObjectEvent` with `DESTROYING` |

EPCIS Extension Declaration:
```http
GS1-Extensions: oec=https://ref.openepcis.io/extensions/common/core/, eubat=https://ref.openepcis.io/extensions/eu/battery/
```
