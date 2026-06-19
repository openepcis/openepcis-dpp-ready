# Changelog

All notable changes to the Electronics module will be documented in this file.

## 0.9.6 — version alignment (2026-06-07)

Version alignment with the 0.9.6 core release (EN 18223 model alignment). No functional changes to this module.

## 0.9.5 — SEMICeu CCCEV anchoring (2026-05-04)

### Added
- `cv:` / `cccev:` prefix declarations in `electronics.ttl`.
- **`euelec:RepairCriterion` → `rdfs:subClassOf cccev:Criterion`** (EU SEMICeu CCCEV). Repair-Index criteria are a specific kind of CCCEV Criterion: each scored against an InformationConcept within the broader Repairability Requirement. Modelled as subClassOf rather than owl:equivalentClass because cccev:Criterion is broader and covers any conformity-evaluation criterion.
- `euelec:criterionScore` → `rdfs:seeAlso cccev:SupportedValue` (the score is the supported value for the criterion's InformationConcept).

### Notes
- No properties removed. JSON-LD payloads round-trip identically. See `extensions/common/interop/docs/SEMIC_CORE_VOCABULARIES.md`.

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `euelec:EnergyEfficiency` owl:equivalentClass `schema:EnergyEfficiencyEnumeration`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `euelec:EnergyEfficiency` owl:equivalentClass `schema:EnergyEfficiencyEnumeration`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `euelec:EnergyEfficiency` owl:equivalentClass `schema:EnergyEfficiencyEnumeration`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `euelec:EnergyEfficiency` owl:equivalentClass `schema:EnergyEfficiencyEnumeration`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Removed (use canonical term instead)

- `euelec:commercialName` → `schema:name`
- `euelec:componentManufacturer` → `gs1:manufacturer`
- `euelec:componentName` → `schema:name`
- `euelec:deviceCategory` → `schema:category`
- `euelec:operatingSystem` → `schema:operatingSystem`
- `euelec:weeeCategory` → `schema:category`

### Added equivalence / cross-reference links

- `euelec:EnergyEfficiency` owl:equivalentClass `schema:EnergyEfficiencyEnumeration`

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
