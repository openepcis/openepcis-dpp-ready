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
| **Namespace** | `urn:samm:io.BatteryPass.*` | Custom + SAMM | `gs1:` + `battery:` |
| **Dereferenceable** | No | Partially | Yes |
| **Dynamic Data** | Static with `lastUpdate` | Via EDC connectors | EPCIS events with provenance |
| **Infrastructure** | Custom | Catena-X network | GS1 Digital Link resolvers |
| **Entry Barrier** | Medium | High (membership) | Low |
| **Scientific Bridge** | None | None | EMMO/QUDT via context |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  GS1 Digital Link Resolver                                  │
│  https://id.gs1.org/01/{gtin}/21/{serial}                  │
│  - Content negotiation (JSON-LD / HTML)                     │
│  - Link type routing (?linkType=gs1:epcis)                 │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────┐                 ┌─────────────────────┐
│  Product Master     │                 │  EPCIS Repository   │
│  (Static Data)      │                 │  (Dynamic Events)   │
├─────────────────────┤                 ├─────────────────────┤
│ • Manufacturer      │                 │ • State of Health   │
│ • Battery category  │                 │ • Cycle count       │
│ • Rated capacity    │                 │ • Carbon footprint  │
│ • Chemistry         │                 │ • Ownership history │
│ • Materials         │                 │ • Negative events   │
│ • Hazardous subst.  │                 │ • Temperature logs  │
│ • Due diligence     │                 │ • SOCE measurements │
└─────────────────────┘                 └─────────────────────┘
          │                                       │
          └───────────────────┬───────────────────┘
                              ▼
                 ┌─────────────────────┐
                 │  Battery Ontology   │
                 │  (Extends GS1 Voc)  │
                 │  - Dereferenceable  │
                 │  - OWL/RDFS         │
                 └─────────────────────┘
```

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
| `battery:Battery` | Main class, extends `gs1:Product` |
| `battery:BatteryChemistry` | Electrochemical system (cathode, anode, electrolyte) |
| `battery:TechnicalSpecification` | Capacity, voltage, performance parameters |
| `battery:BatteryMaterial` | Material with composition and CAS number |
| `battery:RecycledContent` | Recycled material declaration |
| `battery:HazardousSubstance` | Hazardous substance per EU CLP |
| `battery:OperatorInformation` | Economic operator (Art. 38) |
| `battery:SparePartSupplier` | Spare parts source |
| `battery:DismantlingDocument` | Dismantling documentation |
| `battery:Label` | Labels per Annex VI |
| `battery:SupplyChainDueDiligence` | Due diligence info (Art. 39) |
| `battery:PowerCapabilityAtSoC` | Power capability at specific SoC |
| `battery:TemperatureRange` | Temperature range specification |
| `battery:EndOfLifeInfo` | End-of-life handling information |

### Enumerations

**Battery Category** (`battery:BatteryCategory`):
- `LMTBattery` - Light Means of Transport
- `EVBattery` - Electric Vehicle
- `IndustrialBattery` - Industrial
- `StationaryBattery` - Stationary Energy Storage

**Battery Status** (`battery:BatteryStatus`):
- `Original`, `Repurposed`, `Reused`, `Remanufactured`, `Waste`

**Material Location** (`battery:MaterialLocation`):
- `Cathode`, `Anode`, `Electrolyte`, `Separator`, `Casing`

**Hazard Class** (`battery:HazardClass`) - per EU CLP:
- `AcuteToxicity`, `SkinCorrosionOrIrritation`, `EyeDamageOrIrritation`
- `RespiratoryOrSkinSensitization`, `GermCellMutagenicity`
- `Carcinogenicity`, `ReproductiveToxicity`
- `SpecificTargetOrganToxicity`, `AspirationHazard`
- `HazardousToAquaticEnvironment`

**Dismantling Document Type** (`battery:DismantlingDocumentType`) - per DIN DKE SPEC:
- `BillOfMaterial`, `Model3D`, `DismantlingManual`
- `RemovalManual`, `OtherManual`, `Drawing`

**Label Subject** (`battery:LabelSubject`) - per Annex VI:
- `SeparateCollection`, `HazardousMaterial`
- `CarbonFootprintLabel`, `ExtinguishingAgentLabel`

---

## EPCIS Event Types

### Sensor Measurement Types

| Type | Description | Unit |
|------|-------------|------|
| `battery:StateOfHealth` | Capacity-based SoH | P1 (%) |
| `battery:StateOfCharge` | Current charge level | P1 (%) |
| `battery:StateOfCertifiedEnergy` | SOCE per regulation | P1 (%) |
| `battery:CycleCount` | Full cycles completed | - |
| `battery:RemainingCapacity` | Current max capacity | AH |
| `battery:RemainingEnergy` | Current max energy | KWH |
| `battery:CapacityFade` | Capacity degradation | P1 (%) |
| `battery:PowerFade` | Power degradation | P1 (%) |
| `battery:InternalResistance` | Pack/cell resistance | OHM |
| `battery:EnergyThroughput` | Cumulative energy | KWH |
| `battery:CapacityThroughput` | Cumulative capacity | AH |
| `battery:RoundTripEfficiencyFade` | RTE degradation | P1 (%) |
| `battery:SelfDischargeRate` | Self-discharge rate | P1 (%/month) |
| `battery:NegativeEvent` | Adverse event | - |
| `battery:TemperatureExtremeHigh` | High temp exposure | CEL |
| `battery:TemperatureExtremeLow` | Low temp exposure | CEL |

### Carbon Footprint Types

| Type | Description |
|------|-------------|
| `battery:CarbonFootprintTotal` | Total lifecycle CFP |
| `battery:CarbonFootprintRawMaterialExtraction` | Raw material phase |
| `battery:CarbonFootprintProduction` | Manufacturing phase |
| `battery:CarbonFootprintDistribution` | Distribution phase |
| `battery:CarbonFootprintRecycling` | End-of-life phase |

---

## EMMO/QUDT Mapping Reference

When using `battery-context-scientific.jsonld`:

### Class Equivalences

| Battery Ontology | EMMO/BattINFO |
|-----------------|---------------|
| `battery:StateOfHealth` | `battinfo:StateOfHealth` |
| `battery:StateOfCharge` | `battinfo:StateOfCharge` |
| `battery:CycleCount` | `battinfo:CycleNumber` |
| `battery:RemainingCapacity` | `battinfo:Capacity` |
| `battery:InternalResistance` | `battinfo:InternalResistance` |
| `battery:Cathode` | `battinfo:Cathode` |
| `battery:Anode` | `battinfo:Anode` |
| `battery:Electrolyte` | `battinfo:Electrolyte` |
| `battery:Separator` | `battinfo:Separator` |

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
| Operator info | `battery:operatorInformation` | `battery-product.jsonld` |
| Manufacturing date | `gs1:productionDate` | `battery-product.jsonld` |
| Manufacturing place | `gs1:placeOfProductProvenance` | `battery-product.jsonld` |
| Battery category | `battery:batteryCategory` | `battery-product.jsonld` |
| Battery weight | `gs1:netWeight` | `battery-product.jsonld` |
| Carbon footprint | EPCIS event | `carbon-footprint.jsonld` |
| CFP performance class | `ilmd.performanceClass` | `carbon-footprint.jsonld` |
| State of Health | EPCIS `sensorReport` | `state-of-health.jsonld` |
| State of Certified Energy | EPCIS `sensorReport` | `state-of-certified-energy.jsonld` |
| Cycle count | EPCIS `sensorReport` | `state-of-health.jsonld` |
| Material composition | `battery:materialComposition` | `battery-product.jsonld` |
| Hazardous substances | `battery:hazardousSubstances` | `battery-product.jsonld` |
| Recycled content | `battery:recycledContent` (pre/post consumer) | `battery-product.jsonld` |
| Dismantling info | `battery:dismantlingDocuments` | `battery-product.jsonld` |
| Spare parts | `battery:sparePartSources` | `battery-product.jsonld` |
| Labels | `battery:labels` | `battery-product.jsonld` |
| Due diligence | `battery:supplyChainDueDiligence` | `battery-product.jsonld` |
| Declaration of conformity | `battery:declarationOfConformity` | `battery-product.jsonld` |
| Test reports | `battery:resultOfTestReport` | `battery-product.jsonld` |
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
