# Changelog

All notable changes to the Battery module will be documented in this file.

## [0.9.5] - 2025-02-02

### Initial Release

OpenEPCIS DPP-Ready v0.9.5 - First official public release.

**Standards Alignment:**
- GS1 Web Vocabulary (native foundation)
- UN Transparency Protocol (UNTP) alignment
- EU Battery Regulation 2023/1542 Annex XIII complete coverage
- DIN DKE SPEC 99100 dismantling information

**Key Classes:**
- `Battery` - Base class for all battery types (extends gs1:Product)
- `BatteryChemistry` - Electrochemical system (cathode, anode, electrolyte)
- `TechnicalSpecification` - Capacity, voltage, cycle life, power capability
- `BatteryMaterial` - Material composition with CAS/EC numbers
- `RecycledContent` - Pre/post-consumer recycled content
- `EndOfLifeInfo` - Safe dismantling and recycling information
- `HazardousSubstance` - CLP Regulation hazard classification
- `OperatorInformation` - Economic operator per Art. 38
- `SupplyChainDueDiligence` - Art. 39 due diligence
- `CarbonFootprintDeclaration` - Art. 7 lifecycle carbon footprint
- `DismantlingDocument` - DIN DKE SPEC 99100 documents

**Key Enumerations:**
- `BatteryCategory` - LMT, EV, Industrial, Stationary, Portable, SLI
- `BatteryStatus` - Original, Repurposed, Reused, Remanufactured, Waste
- `CellType` - Cylindrical, Prismatic, Pouch, Blade, Coin
- `ComponentLocation` - Cathode, Anode, Electrolyte, Separator, etc.
- `MaterialCategory` - Active material, Binder, Conductor, Additive

**EPCIS Event Patterns:**
- Commissioning with master data
- State of Health measurement
- State of Certified Energy measurement
- Carbon Footprint declaration
- Ownership Transfer
- Temperature Extreme event
- Negative Event (incidents)
- Regulatory Notification

**JSON-LD Contexts:**
- `battery-context.jsonld` - Main context
- `battery-context-scientific.jsonld` - EMMO/QUDT scientific bridge
- `battery-context-batterypass-bridge.jsonld` - BatteryPass interoperability
