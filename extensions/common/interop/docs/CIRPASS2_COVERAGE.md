# CIRPASS2 Requirements Coverage

Analysis of how OpenEPCIS DPP-Ready covers CIRPASS2 Digital Product Passport pilot requirements.

## Overview

CIRPASS2 (Circular Economy Product Passport Readiness) is an EU project defining requirements for Digital Product Passports. OpenEPCIS DPP-Ready provides comprehensive coverage of these requirements.

## Coverage Summary

| Category | Coverage | OpenEPCIS Module |
|----------|----------|-----------------|
| Product Identification | Full | Core (`dpp:uniqueProductIdentifier`) |
| Manufacturer Information | Full | Core (`dpp:OperatorInformation`) |
| Facility Information | Full | Core (`dpp:FacilityInformation`) |
| Material Composition | Full | Core (`dpp:MaterialComposition`) |
| Substances of Concern | Full | Core (`dpp:SubstanceOfConcern`) |
| Carbon Footprint | Full | Core (`dpp:EmissionsPerformance`) |
| Circularity | Full | Core (`dpp:CircularityPerformance`) |
| Repairability | Full | Core (`dpp:RepairabilityInfo`) |
| Durability | Full | Core (`dpp:PerformanceInfo`) |
| Access Control | Full | Core (`dpp:AccessRights`) |
| Battery-Specific | Full | Battery (`battery:`) |
| Textile-Specific | Full | Textile (`textile:`) |

## Detailed Coverage

### Product Identification

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Unique product identifier | `dpp:uniqueProductIdentifier` (GS1 Digital Link) |
| Product model/type | `dpp:productModel`, `dpp:productCategory` |
| Batch/lot number | EPCIS lot tracking, `dpp:granularityLevel` |
| Serial number | GS1 Serial (AI 21) |
| Passport identifier | `dpp:passportIdentifier` |
| Passport version | `dpp:passportVersion` |

### Manufacturer Information

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Manufacturer name | `gs1:organizationName` via `dpp:OperatorInformation` |
| Manufacturer ID | `dpp:operatorId` (GLN), `dpp:economicOperatorId` (EOID) |
| Contact information | `gs1:address`, `gs1:contactPoint` |
| Operator role | `dpp:operatorRole` (Manufacturer, Importer, etc.) |
| Registration numbers | `dpp:registrationNumber`, `dpp:eoriNumber`, `dpp:vatIdentificationNumber` |

### Facility Information

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Manufacturing location | `dpp:FacilityInformation` |
| Facility identifier | `gs1:gln` (inherited from gs1:Place) |
| Facility name | `gs1:name` (inherited from gs1:Place) |
| Facility address | `gs1:address` (inherited from gs1:Place) |
| Facility certifications | `dpp:facilityCertifications` (gs1:CertificationDetails) |
| Facility type | `dpp:facilityType` |

### Material Composition

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Material name | `dpp:materialName` |
| Material percentage | `dpp:massFraction` |
| Material origin | `dpp:sourceCountry` |
| CAS/EC numbers | `dpp:casNumber`, `dpp:ecNumber` |
| Critical raw materials | `dpp:isCriticalRawMaterial` |

### Substances of Concern

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Substance identification | `dpp:SubstanceOfConcern` |
| SCIP database link | `dpp:scipId` |
| Hazard classification | `dpp:hazardClass` (CLP categories) |
| Concentration | `dpp:concentration` |
| Location in product | `dpp:substanceLocation` |
| Safe use instructions | `dpp:safeUseInstructions` |
| Disassembly instructions | `dpp:safeDisassemblyInstructions` |

### Carbon Footprint

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Total carbon footprint | `dpp:carbonFootprintTotal` |
| Functional unit | `dpp:declaredUnit` |
| Lifecycle scope | `dpp:operationalScope` (CradleToGate/CradleToGrave) |
| Data quality | `dpp:primarySourcedRatio` |
| Study reference | `dpp:carbonFootprintStudyUrl` |

### Circularity

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Recyclability rate | `dpp:recyclableContent` |
| Recycled content | `dpp:recycledContent` |
| Pre-consumer recycled | `dpp:preConsumerRecycledContent` |
| Post-consumer recycled | `dpp:postConsumerRecycledContent` |
| Circularity indicator | `dpp:materialCircularityIndicator` |
| End-of-life instructions | `dpp:endOfLifeInstructions` |
| Waste prevention | `dpp:wastePreventionInfo` |
| Separate collection | `dpp:separateCollectionInfo` |
| Dismantling info | `dpp:dismantlingInstructions` |

### Repairability

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Repairability score | `dpp:repairabilityScore` |
| Repairability class | `dpp:repairabilityClass` (A-E) |
| Spare parts availability | `dpp:sparePartsAvailability` |
| Spare parts delivery | `dpp:sparePartsDeliveryTime` |
| Repair instructions | `dpp:repairInstructions` |
| Professional repair network | `dpp:professionalRepairNetwork` |
| DIY repair possible | `dpp:diyRepairPossible` |
| Software updates | `dpp:softwareUpdatesAvailability` |

### Durability

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Expected lifespan | `dpp:expectedLifespan` |
| Guaranteed lifespan | `dpp:guaranteedLifespan` |
| Usage cycles | `dpp:usageCycles` |
| Technical lifetime | `dpp:technicalLifetime` |
| Performance class | `dpp:performanceClass` |
| Tested conditions | `dpp:testedConditions` |
| Utility factor | `dpp:utilityFactor` |

### Access Control

| CIRPASS2 Requirement | OpenEPCIS Implementation |
|---------------------|-------------------------|
| Public data | `dpp:Public` access level |
| Authority-only data | `dpp:AuthorizedOnly` access level |
| Restricted data | `dpp:Restricted` access level |
| Authorized parties | `dpp:authorizedParties` |
| Data retention | `dpp:dataRetentionPeriod` |

## Domain-Specific Coverage

### Battery DPP (CIRPASS2 Battery Pilot)

The `battery:` module provides full coverage of Battery Regulation 2023/1542 Annex XIII:

- Battery chemistry and composition
- Technical specifications (capacity, voltage, power)
- State of health and performance degradation
- Recycled content by material (Li, Co, Ni, Pb)
- Carbon footprint with lifecycle phases
- Dismantling documentation (DIN DKE SPEC 99100)
- Due diligence for raw materials

### Textile DPP (CIRPASS2 Textile Pilot)

The `textile:` module provides coverage for EU Textile Strategy:

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
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/, battery=https://ref.openepcis.io/extensions/eu/battery/
```
