# OpenEPCIS Battery DPP Implementation Guide

A comprehensive guide for implementing a GS1-native Digital Product Passport for batteries, compliant with EU Battery Regulation 2023/1542.

> **Disclaimer**: This is **not official GS1 guidance**, but it is built entirely on official GS1 standards and follows GS1 best practices:
>
> | Standard | Usage |
> |----------|-------|
> | [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link) | Resolvable URIs as `id` |
> | [EPCIS 2.0](https://ref.gs1.org/standards/epcis/) | Event-based traceability |
> | [GS1 Web Vocabulary](https://www.gs1.org/voc/) | Linked data vocabulary |
> | [CBV 2.0](https://ref.gs1.org/standards/cbv/) | bizStep, disposition values |
> | [UN/CEFACT Rec 20](https://unece.org/trade/uncefact/cl-recommendations) | Unit of measure codes |
>
> We follow GS1 best practices: resolvable URIs (not opaque URNs), GLN for parties/locations, GTIN+serial for products, EPCIS events with full provenance, and the `gs1:regulatoryInformation` pattern used by GS1 for EUDR.
>
> We invite everyone to use these templates — [feedback welcome](https://github.com/openepcis/openepcis-battery-dpp/issues)!

## Table of Contents

1. [Why GS1-Native?](#why-gs1-native)
2. [Architecture Overview](#architecture-overview)
3. [Context Selection Guide](#context-selection-guide)
4. [Implementation Steps](#implementation-steps)
5. [Ontology Reference](#ontology-reference)
6. [EPCIS Event Types](#epcis-event-types)
7. [EMMO/QUDT Mapping Reference](#emmoqudt-mapping-reference)
8. [Regulatory Compliance Checklist](#regulatory-compliance-checklist)

---

## Why GS1-Native?

### The Problem with Existing Approaches

| Approach | Issue |
|----------|-------|
| **BatteryPass/SAMM** | Uses URN identifiers (`urn:samm:io.BatteryPass.*`) that don't resolve to anything. Requires separate lookup infrastructure. |
| **DPP Keystone** | Creates intermediary `dppk:` namespace with `owl:equivalentProperty` mappings back to GS1. Adds translation layer. |
| **Catena-X** | Requires membership, proprietary tooling, and SAMM model expertise. High barrier to entry. |

### The GS1-Native Advantage

**Your battery's `id` IS its resolver URL:**

```json
{
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001"
}
```

Benefits:
- **Scan QR → Resolve → Get Data**: No separate lookup infrastructure needed
- **Existing Infrastructure**: Uses GS1 Digital Link resolvers manufacturers already have
- **Lower Barrier**: No Catena-X membership or SAMM tools required
- **Dereferenceable**: Every URI returns machine-readable definitions
- **Feb 2027 Ready**: Practical path to EU Battery Regulation compliance

### Comparison Table

| Aspect | BatteryPass (SAMM) | Catena-X | OpenEPCIS Battery DPP |
|--------|-------------------|----------|----------------------|
| **Identity** | URN (non-resolvable) | URN + EDC | GS1 Digital Link (resolvable) |
| **Namespace** | `urn:samm:io.BatteryPass.*` | Custom + SAMM | `gs1:` + `eubat:` |
| **Dereferenceable** | No | Partially | Yes |
| **Dynamic Data** | Static with `lastUpdate` | Via EDC connectors | EPCIS events with provenance |
| **Infrastructure** | Custom | Catena-X network | GS1 Digital Link resolvers |
| **Entry Barrier** | Medium | High (membership) | Low |
| **Scientific Bridge** | None | None | EMMO/QUDT via context |

---

## Architecture Overview

<!-- Diagram source: diagrams/battery-architecture.d2 — regenerate with `pnpm run diagrams:build`. -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="diagrams/battery-architecture-dark.svg">
  <img alt="The GS1 Digital Link Resolver fans out to a static Product Master and a dynamic EPCIS Repository, both backed by the Battery Ontology that extends the GS1 Web Vocabulary." src="diagrams/battery-architecture-light.svg" width="520">
</picture>

### Static vs Dynamic Data

**Static Data** (Product Master - `battery-product.jsonld`):
- Manufacturer identification
- Battery category and chemistry
- Rated capacity, energy, voltage
- Material composition
- Recycled content declarations
- Hazardous substances
- Dismantling documents
- Spare part sources
- Supply chain due diligence

**Dynamic Data** (EPCIS Events):
- State of Health measurements
- State of Certified Energy (SOCE)
- Cycle count progression
- Carbon footprint declarations
- Ownership transfers
- Negative events (accidents, damage)
- Temperature excursions
- Location history

For which attribute belongs at which level (model / batch / item) and how the EPCIS event stream
reconstructs the item passport's dynamic fields, see
[EPCIS_AND_BATTERYPASS_READY.md](./EPCIS_AND_BATTERYPASS_READY.md).

---

## Context Selection Guide

We provide two JSON-LD contexts for different use cases:

### Default Context: `battery-context.jsonld`

**Use when:**
- Implementing for EU Battery Regulation compliance
- Integrating with GS1 supply chain systems
- Building manufacturer/regulator-facing applications

**Features:**
- Pure GS1 vocabulary
- UN/CEFACT Rec 20 unit codes
- No external ontology dependencies

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/eu/battery/context.jsonld",
    ...
  ]
}
```

### Scientific Context: `battery-context-scientific.jsonld`

**Use when:**
- Integrating with research/scientific systems
- Needing EMMO battery ontology alignment
- Requiring QUDT unit conversions

**Features:**
- Extends default context
- Adds EMMO/BattINFO equivalences
- Maps UN/CEFACT codes to QUDT units

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/eu/battery/context-scientific.jsonld",
    ...
  ]
}
```

### Context Layering Example

Same battery data, different semantic views:

```json
// For supply chain systems (default)
{
  "@context": "https://ref.openepcis.io/extensions/eu/battery/context.jsonld",
  "StateOfHealth": { "value": "94.2", "unitCode": "P1" }
}

// For scientific systems (enriched)
{
  "@context": "https://ref.openepcis.io/extensions/eu/battery/context-scientific.jsonld",
  "StateOfHealth": { "value": "94.2", "unitCode": "P1" }
  // Automatically understood as equivalent to battinfo:StateOfHealth
  // P1 automatically maps to unit:PERCENT
}
```

---

## Implementation Steps

### Step 1: Assign GS1 Identifiers

1. **GTIN** for battery product type: `09521234000013`
2. **Serial Number** for individual unit: `BAT2024-001`
3. **GLN** for manufacturer: `9521234000006`
4. **GLN** for production facility: `9521234000013`

### Step 2: Create Product Master Data

Create `battery-product.jsonld` with:

```json
{
  "@context": [...],
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
  "type": ["gs1:Product", "Battery"],

  "gtin": "09521234000013",
  "serialNumber": "BAT2024-001",
  "manufacturer": { "id": "https://id.gs1.org/417/9521234000006", ... },

  "batteryCategory": "IndustrialBattery",
  "technicalSpecifications": { ... },
  "materialComposition": [ ... ],
  "hazardousSubstances": [ ... ],
  "supplyChainDueDiligence": { ... }
}
```

### Step 3: Configure GS1 Digital Link Resolver

Set up content negotiation:
- `Accept: application/ld+json` → Return product master JSON-LD
- `Accept: text/html` → Return human-readable passport page
- `?linkType=gs1:epcis` → Return EPCIS event history

### Step 4: Record EPCIS Events

**Commissioning** (battery creation):
```json
{
  "type": "ObjectEvent",
  "action": "ADD",
  "bizStep": "commissioning",
  "epcList": [{ "id": "https://id.gs1.org/01/.../21/...", ... }],
  "sensorElementList": [{ "sensorReport": [
    { "type": "StateOfHealth", "value": 100 },
    { "type": "CycleCount", "value": 0 }
  ]}]
}
```

**State of Health Updates** (periodic measurements):
```json
{
  "type": "ObjectEvent",
  "action": "OBSERVE",
  "bizStep": "inspecting",
  "sensorElementList": [{ "sensorReport": [
    { "type": "StateOfHealth", "value": 94.2 },
    { "type": "StateOfCertifiedEnergy", "value": 85.3 }
  ]}]
}
```

### Step 5: Handle Negative Events

Record accidents, damage, or temperature excursions:

```json
{
  "type": "ObjectEvent",
  "action": "OBSERVE",
  "disposition": "damaged",
  "sensorElementList": [{ "sensorReport": [
    { "type": "NegativeEvent",
      "eventType": "transport_damage",
      "eventDescription": "..." }
  ]}]
}
```

---

## Ontology Reference

### Classes

| Class | Description |
|-------|-------------|
| `eubat:Battery` | Main class, extends `gs1:Product` |
| `eubat:BatteryChemistry` | Electrochemical system (cathode, anode, electrolyte) |
| `eubat:TechnicalSpecification` | Capacity, voltage, performance parameters |
| `eubat:BatteryMaterial` | Material with composition and CAS number |
| `eubat:RecycledContent` | Recycled material declaration |
| `eubat:HazardousSubstance` | Hazardous substance per EU CLP |
| `eubat:OperatorInformation` | Economic operator (Art. 38) |
| `eubat:SparePartSupplier` | Spare parts source |
| `eubat:DismantlingDocument` | Dismantling documentation |
| `eubat:Label` | Labels per Annex VI |
| `eubat:SupplyChainDueDiligence` | Due diligence info (Art. 39) |
| `eubat:PowerCapabilityAtSoC` | Power capability at specific SoC |
| `eubat:TemperatureRange` | Temperature range specification |
| `eubat:EndOfLifeInfo` | End-of-life handling information |

### Enumerations

**Battery Category** (`eubat:BatteryCategory`):
- `LMTBattery` - Light Means of Transport
- `EVBattery` - Electric Vehicle
- `IndustrialBattery` - Industrial
- `StationaryBattery` - Stationary Energy Storage

**Battery Status** (`eubat:BatteryStatus`):
- `Original`, `Repurposed`, `Reused`, `Remanufactured`, `Waste`

**Material Location** (`eubat:MaterialLocation`):
- `Cathode`, `Anode`, `Electrolyte`, `Separator`, `Casing`

**Hazard Class** (`eubat:HazardClass`) - per EU CLP:
- `AcuteToxicity`, `SkinCorrosionOrIrritation`, `EyeDamageOrIrritation`
- `RespiratoryOrSkinSensitization`, `GermCellMutagenicity`
- `Carcinogenicity`, `ReproductiveToxicity`
- `SpecificTargetOrganToxicity`, `AspirationHazard`
- `HazardousToAquaticEnvironment`

**Dismantling Document Type** (`eubat:DismantlingDocumentType`) - per DIN DKE SPEC:
- `BillOfMaterial`, `Model3D`, `DismantlingManual`
- `RemovalManual`, `OtherManual`, `Drawing`

**Label Subject** (`eubat:LabelSubject`) - per Annex VI:
- `SeparateCollection`, `HazardousMaterial`
- `CarbonFootprintLabel`, `ExtinguishingAgentLabel`

---

## EPCIS Event Types

### Sensor Measurement Types

| Type | Description | Unit |
|------|-------------|------|
| `eubat:StateOfHealth` | Capacity-based SoH | P1 (%) |
| `eubat:StateOfCharge` | Current charge level | P1 (%) |
| `eubat:StateOfCertifiedEnergy` | SOCE per regulation | P1 (%) |
| `eubat:CycleCount` | Full cycles completed | - |
| `eubat:RemainingCapacity` | Current max capacity | AH |
| `eubat:RemainingEnergy` | Current max energy | KWH |
| `eubat:CapacityFade` | Capacity degradation | P1 (%) |
| `eubat:PowerFade` | Power degradation | P1 (%) |
| `eubat:InternalResistance` | Pack/cell resistance | OHM |
| `eubat:EnergyThroughput` | Cumulative energy | KWH |
| `eubat:CapacityThroughput` | Cumulative capacity | AH |
| `eubat:RoundTripEfficiencyFade` | RTE degradation | P1 (%) |
| `eubat:SelfDischargeRate` | Self-discharge rate | P1 (%/month) |
| `eubat:NegativeEvent` | Adverse event | - |
| `eubat:TemperatureExtremeHigh` | High temp exposure | CEL |
| `eubat:TemperatureExtremeLow` | Low temp exposure | CEL |

### Carbon Footprint Types

| Type | Description |
|------|-------------|
| `eubat:CarbonFootprintTotal` | Total lifecycle CFP |
| `eubat:CarbonFootprintRawMaterialExtraction` | Raw material phase |
| `eubat:CarbonFootprintProduction` | Manufacturing phase |
| `eubat:CarbonFootprintDistribution` | Distribution phase |
| `eubat:CarbonFootprintRecycling` | End-of-life phase |

---

## EMMO/QUDT Mapping Reference

When using `battery-context-scientific.jsonld`:

### Class Equivalences

| Battery Ontology | EMMO/BattINFO |
|-----------------|---------------|
| `eubat:StateOfHealth` | `battinfo:StateOfHealth` |
| `eubat:StateOfCharge` | `battinfo:StateOfCharge` |
| `eubat:CycleCount` | `battinfo:CycleNumber` |
| `eubat:RemainingCapacity` | `battinfo:Capacity` |
| `eubat:InternalResistance` | `battinfo:InternalResistance` |
| `eubat:Cathode` | `battinfo:Cathode` |
| `eubat:Anode` | `battinfo:Anode` |
| `eubat:Electrolyte` | `battinfo:Electrolyte` |
| `eubat:Separator` | `battinfo:Separator` |

### Unit Mappings

| UN/CEFACT Rec 20 | QUDT Unit | Symbol |
|------------------|-----------|--------|
| `AH` | `unit:A-HR` | Ah |
| `KWH` | `unit:KiloW-HR` | kWh |
| `VLT` | `unit:V` | V |
| `KWT` | `unit:KiloW` | kW |
| `OHM` | `unit:OHM` | Ω |
| `CEL` | `unit:DEG_C` | °C |
| `KGM` | `unit:KiloGM` | kg |
| `P1` | `unit:PERCENT` | % |

---

## Regulatory Compliance Checklist

Per EU Battery Regulation 2023/1542 Annex XIII:

| Requirement | Implementation | File |
|-------------|----------------|------|
| Unique identifier | `id` = GS1 Digital Link | `battery-product.jsonld` |
| Manufacturer info | `gs1:manufacturer` with GLN | `battery-product.jsonld` |
| Operator info | `eubat:operatorInformation` | `battery-product.jsonld` |
| Manufacturing date | `gs1:productionDate` | `battery-product.jsonld` |
| Manufacturing place | `gs1:placeOfProductProvenance` | `battery-product.jsonld` |
| Battery category | `schema:category` | `battery-product.jsonld` |
| Battery weight | `gs1:netWeight` | `battery-product.jsonld` |
| Carbon footprint | EPCIS event | `carbon-footprint.jsonld` |
| CFP performance class | `ilmd.performanceClass` | `carbon-footprint.jsonld` |
| State of Health | EPCIS `sensorReport` | `state-of-health.jsonld` |
| State of Certified Energy | EPCIS `sensorReport` | `state-of-certified-energy.jsonld` |
| Cycle count | EPCIS `sensorReport` | `state-of-health.jsonld` |
| Material composition | `eubat:materialComposition` | `battery-product.jsonld` |
| Hazardous substances | `eubat:hazardousSubstances` | `battery-product.jsonld` |
| Recycled content | `eubat:recycledContent` (pre/post consumer) | `battery-product.jsonld` |
| Dismantling info | `eubat:dismantlingDocuments` | `battery-product.jsonld` |
| Spare parts | `eubat:sparePartSources` | `battery-product.jsonld` |
| Labels | `eubat:labels` | `battery-product.jsonld` |
| Due diligence | `eubat:supplyChainDueDiligence` | `battery-product.jsonld` |
| Declaration of conformity | `eubat:declarationOfConformity` | `battery-product.jsonld` |
| Test reports | `eubat:resultOfTestReport` | `battery-product.jsonld` |
| Negative events | EPCIS event | `negative-event.jsonld` |

---

## Timeline

- **August 2025**: Economic operators must prepare DPP infrastructure
- **February 2027**: Full DPP requirements enter into force
- **2030+**: Recycled content thresholds increase

---

## Resources

- [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link)
- [GS1 Web Vocabulary](https://ref.gs1.org/voc/)
- [EPCIS 2.0 Standard](https://ref.gs1.org/standards/epcis/)
- [EU Battery Regulation 2023/1542](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1542)
- [DIN DKE SPEC 99100](https://www.dke.de/de/arbeitsfelder/mobility/din-dke-spec-99100)
- [EMMO Battery Domain](https://github.com/emmo-repo/domain-battery)
- [OpenEPCIS](https://github.com/openepcis)
