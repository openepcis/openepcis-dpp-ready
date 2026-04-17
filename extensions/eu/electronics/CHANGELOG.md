# Changelog

All notable changes to the Electronics module will be documented in this file.

## [0.9.5] - 2025-02-02

### Initial Release

OpenEPCIS DPP-Ready v0.9.5 - First official public release.

**Standards Alignment:**
- GS1 Web Vocabulary (native foundation)
- UN Transparency Protocol (UNTP) alignment
- EU ESPR 2024/1781 compliance
- French Repairability Index (Indice de Réparabilité)
- EU Right to Repair (A-E grades)
- WEEE Directive 2012/19/EU (6 categories)
- RoHS Directive 2011/65/EU
- EU Energy Labeling 2019/2021 (A-G classes)
- CIRPASS-2 multi-component tracking
- IEC 62474 material declarations
- ISO/IEC 12207/14764 software lifecycle

**Key Classes:**
- `ElectronicDevice` - Base class for electronics (extends gs1:Product)
- `RepairabilityIndex` - French 5-criteria, 100-point scoring
- `SoftwareSupport` - OS/firmware update lifecycle tracking
- `EnergyEfficiency` - EU Energy Label with EPREL integration
- `ComponentBOM` - Bill of Materials for multi-component DPPs
- `WEEECompliance` - WEEE category and registration
- `RoHSCompliance` - Hazardous substances compliance

**Device Categories:**
- Smartphones, Tablets, Laptops, Desktops, Servers
- Displays, Televisions
- Household appliances (washing machines, refrigerators, etc.)
- Network equipment, Data storage, Printers, Wearables

**EPCIS Event Patterns:**
- Commissioning with master data
- Software/firmware updates
- Component replacement (battery, display)
- Ownership transfer
- WEEE end-of-life disposal

**Examples:**
- Smartphone with French Repairability Index
- Server with energy efficiency and BOM
- Display with EPREL registration
- Laptop with battery DPP linking
