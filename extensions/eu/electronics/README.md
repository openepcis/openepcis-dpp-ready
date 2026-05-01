# Electronics Module

This module provides vocabulary and examples for implementing Digital Product Passports for electronic and electrical equipment under ESPR delegated acts and related EU regulations.

> **Status**: Production Ready (v0.9.5)

## Regulation Coverage

| Regulation | Status | Key Requirements |
|------------|--------|------------------|
| **ESPR 2024/1781** | Framework in force | Computers, servers, smartphones, tablets |
| **French Repairability Index** | Active since 2021 | 5-criteria, 100-point scoring (displayed 0-10) |
| **EU Right to Repair** | June 2025 | A-E repairability grades |
| **WEEE 2012/19/EU** | Active | 6 equipment categories |
| **RoHS 2011/65/EU** | Active | Restricted hazardous substances |
| **Energy Labeling 2019/2021** | Active | A-G efficiency classes, EPREL registry |
| **CIRPASS-2** | 2024-2027 | Multi-component DPP tracking |

## Module Contents

```
electronics/
├── VERSION                              # 0.9.5
├── CHANGELOG.md                         # Version history
├── README.md                            # This file
├── ontology/
│   └── electronics.ttl                 # Electronics vocabulary (~200 terms)
├── json/
│   └── electronics.json                # Generated JSON (for web apps)
├── context/
│   ├── electronics-context.jsonld      # JSON-LD context
│   └── electronics-untp-bridge.jsonld  # UNTP alignment bridge
├── examples/
│   ├── smartphone-product.jsonld       # Smartphone with French index
│   ├── server-product.jsonld           # Server with BOM, energy efficiency
│   ├── display-product.jsonld          # Display with EPREL, energy label
│   └── laptop-product.jsonld           # Laptop with battery DPP link
├── epcis/
│   ├── commissioning.jsonld            # Manufacturing event
│   ├── software-update.jsonld          # Firmware/OS update event
│   ├── component-replacement.jsonld    # Repair event (battery swap)
│   ├── ownership-transfer.jsonld       # Supply chain transfer
│   └── weee-disposal.jsonld            # End-of-life recycling
├── validation/
│   └── electronics-shapes.ttl          # SHACL shapes (planned)
└── docs/
    └── IMPLEMENTATION_GUIDE.md         # Implementation guide (planned)
```

## Vocabulary Namespace

**Namespace**: `https://ref.openepcis.io/extensions/eu/electronics/`

**Browse**: [ref.openepcis.io/extensions/eu/electronics/](https://ref.openepcis.io/extensions/eu/electronics/)

## Key Classes

| Class | Purpose |
|-------|---------|
| `ElectronicDevice` | Base class for all electronics (extends gs1:Product) |
| `RepairabilityIndex` | French 5-criteria, 100-point scoring |
| `RepairCriterion` | Individual criterion score |
| `SoftwareSupport` | OS/firmware update lifecycle |
| `EnergyEfficiency` | EU Energy Label data (A-G, EPREL) |
| `ComponentBOM` | Bill of Materials for multi-component tracking |
| `ElectronicComponent` | Component with DPP linking capability |
| `WEEECompliance` | WEEE category and registration |
| `RoHSCompliance` | RoHS restricted substances |
| `DisplaySpecification` | Display-specific metrics |

## Key Enumerations

### Device Categories
`Smartphone`, `Tablet`, `Laptop`, `Desktop`, `Server`, `Display`, `Television`, `WashingMachine`, `Refrigerator`, `Dishwasher`, `VacuumCleaner`, `SmallAppliance`, `NetworkEquipment`, `DataStorage`, `Printer`, `Wearable`

### French Repair Criteria (20 points each)
`Documentation`, `Disassembly`, `SparePartsAvailability`, `SparePartsPricing`, `ProductSpecific`

### EU Repairability Class
`RepairClassA` (8.1-10), `RepairClassB` (6.1-8), `RepairClassC` (4.1-6), `RepairClassD` (2.1-4), `RepairClassE` (0-2)

### Energy Efficiency Class
`EnergyClassA` through `EnergyClassG`

### WEEE Categories
`WEEE1_TemperatureExchange`, `WEEE2_ScreensMonitors`, `WEEE3_Lamps`, `WEEE4_LargeEquipment`, `WEEE5_SmallEquipment`, `WEEE6_SmallIT`

### Component Types
`BatteryComponent`, `DisplayComponent`, `ProcessorComponent`, `MemoryComponent`, `StorageComponent`, `MotherboardComponent`, `PowerSupplyComponent`, `CoolingSystemComponent`, `CameraComponent`, `SpeakerComponent`, `MicrophoneComponent`, `KeyboardComponent`, `TrackpadComponent`, `ConnectorComponent`, `EnclosureComponent`

### Replacement Difficulty
`UserReplaceable`, `ToolRequired`, `ProfessionalOnly`, `NotReplaceable`

## Dependencies

- **Core module**: `>= 0.9.5` (required)
  - Uses `dpp:OperatorInformation`, `dpp:RepairabilityInfo`, `dpp:PerformanceInfo`
  - Uses `dpp:SubstanceOfConcern`, `dpp:CircularityPerformance`, `dpp:EmissionsPerformance`
- **Battery module**: Optional (for devices with batteries linking to battery DPPs)

## EPCIS 2.0 Extension Declaration

```http
GS1-Extensions: electronics=https://ref.openepcis.io/extensions/eu/electronics/, dpp=https://ref.openepcis.io/extensions/common/core/
```

**Architecture rule**: `gs1:masterDataAvailableFor` contains only `gs1:` properties. Electronics-specific extensions (`electronics:`) go at event level. See [core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md](../core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md).

## JSON-LD Context Usage

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld"
  ]
}
```

### With Battery Module (for devices with batteries)

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld"
  ]
}
```

## French Repairability Index

The module implements the official French "Indice de Réparabilité" scoring methodology:

| Criterion | Max Points | Description |
|-----------|------------|-------------|
| Documentation | 20 | Availability of repair documentation |
| Disassembly | 20 | Ease of disassembly and tools required |
| Spare Parts Availability | 20 | Duration and access to spare parts |
| Spare Parts Pricing | 20 | Ratio of part prices to product price |
| Product Specific | 20 | Category-specific (e.g., software support) |

**Total**: 0-100 points, displayed to consumers as 0-10 scale.

## UNTP Alignment

The electronics module is aligned with UN Transparency Protocol (UNTP) where applicable:

| Electronics Property | UNTP Equivalent | Notes |
|---------------------|-----------------|-------|
| `componentPassport` | `linkedProduct` | Nested DPP for components |
| Core properties | Via dpp: module | Full alignment |

Novel patterns (software lifecycle) are designed as potential UNTP v1.0+ contributions.

## EPCIS Event Patterns

| Event | bizStep | Purpose |
|-------|---------|---------|
| Commissioning | `commissioning` | Device manufactured with master data |
| Software Update | `inspecting` | Firmware/OS update recorded |
| Component Replacement | `repairing` | TransformationEvent for battery/display swap |
| Ownership Transfer | `shipping`/`receiving` | Change of custody |
| WEEE Disposal | `destroying` | End-of-life recycling |

## Standards Alignment

| Standard | Purpose | Alignment |
|----------|---------|-----------|
| **GS1 Web Vocabulary** | Native foundation | Extends gs1:Product |
| **UNTP v0.6/1.0** | Interoperability | owl:equivalentProperty |
| **IEC 62474** | Material declarations | Reference DSL identifiers |
| **ISO/IEC 12207** | Software lifecycle | SoftwareSupport patterns |
| **ISO/IEC 14764** | Software maintenance | Update tracking |

## External References

- [ESPR Regulation 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781)
- [French Indice de Réparabilité](https://www.ecologie.gouv.fr/indice-reparabilite)
- [EU Energy Labeling](https://eur-lex.europa.eu/eli/reg/2019/2021)
- [WEEE Directive](https://eur-lex.europa.eu/eli/dir/2012/19/oj)
- [RoHS Directive](https://eur-lex.europa.eu/eli/dir/2011/65/eu)
- [CIRPASS-2 Project](https://cirpassproject.eu/)
- [EPREL Database](https://eprel.ec.europa.eu/)
- [UN Transparency Protocol](https://uncefact.github.io/spec-untp/)

## License

Apache License 2.0 - See LICENSE file in repository root.
