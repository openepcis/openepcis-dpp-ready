# Changelog

All notable changes to the Electronics module will be documented in this file.

## [Unreleased]

### Fixed: 1 value space no longer mapped onto the class of things they classify

A closed list of codes and the class of things those codes classify sit at different levels, so no graded SKOS relation between them holds in either direction. `euelec:EnergyEfficiencyClass` (to `schema:EnergyConsumptionDetails`) now use `rdfs:seeAlso`.

`check:mappings` rule 7 covers the pattern and runs before the direction rule, since at different levels the question of which term is narrower does not arise. Project-wide this corrected 31 assertions across eight modules; see the [root changelog](../../../CHANGELOG.md).

## [0.9.8] - 2026-07-29

### Fixed: 1 inverted SKOS mapping directions

SKOS reads `A skos:narrowMatch B` as "B is narrower than A". 1 mapping in this module
used `narrowMatch` while pointing at a general foundational term, so it asserted the
reverse of its intent, for example claiming `schema:identifier` was narrower than a
specific passport identifier. It now read `skos:broadMatch`, the project convention for
"this term is narrower than the target". The sweep covered 174 assertions across eight
modules; `check:mappings` rule 6 now rejects the pattern against a curated list of general
Layer-1 terms, and pairs where our term is a type or category while the target denotes the
entity itself are allowlisted for a curator instead (see
[`docs/skos-alignment/OPEN_DECISIONS.md`](../../../docs/skos-alignment/OPEN_DECISIONS.md)).

### Changed: SKOS mapping directions corrected against the vocab-sync QA panel

A `vocab-sync audit --module electronics` run (bulk grader `gpt-oss-20b`, three-judge
blind QA panel on `qwen3-32b`, 2383 candidate pairs, 275 findings) surfaced a
systematic direction error. SKOS states it plainly: `A skos:narrowMatch B` asserts
that B is narrower than A. The module had used `narrowMatch` where its own term is
the narrower one, so 26 mappings claimed the opposite of what they meant, for example
`euelec:weeeRegistrationNumber` asserting `gs1:regulatoryReferenceNumber` was narrower
than it. All 26 are QA-confirmed flips (panel confidence 0.68 to 0.93) and now read
`skos:broadMatch`, which is the project convention for "this term is narrower than
the target"; four of them run the other way (`euelec:EnergyEfficiency`,
`euelec:energyEfficiency`, `euelec:materialDeclaration`, `euelec:componentType` are
genuinely broader than their targets).

Six `rdfs:seeAlso` pointers were upgraded to graded relations where the target is
unambiguous, including `euelec:ElectronicDevice` / `euelec:ElectronicComponent`
`skos:broadMatch gs1:Product` (both are `rdfs:subClassOf gs1:Product`) and
`euelec:ElectronicDevice skos:narrowMatch dppk:Component`. Eight mappings were added:
`euelec:rohsCompliance` to `gs1:certification`, `euelec:treatmentCertificate` to
`schema:hasCertification`, `euelec:calculationMethod` to `schema:measurementMethod`,
`euelec:sparePartPrice` to `schema:price`, `euelec:previousVersion` to `untp:version`,
and three to the BatteryPass SAMM aspects the laptop passport already touches.

`euelec:ElectronicDevice` also gained the `skos:exactMatch dppk:ElectronicDevice` that
the panel confirmed at 0.98 and the class was missing, and `euelec:rohsCompliance` had
its two certification directions corrected.

Two panel proposals were rejected on review: `schema:softwareVersion` and
`schema:assemblyVersion` are `SoftwareApplication`-scoped, so `check:mappings` rejects
them for a device property (the existing `rdfs:seeAlso` is the right treatment), and a
proposed self-mapping of `euelec:WEEECompliance` was a defect in the tool's candidate
retrieval, since fixed.

### Added: the WEEE treatment and repair event model the examples already assumed

The EPCIS examples (`epcis/weee-disposal.jsonld`, `epcis/component-replacement.jsonld`) used
`euelec:` keys that were defined nowhere in the ontology: well-formed IRIs resolving to no
definition. The new `scripts/check-extension-terms.ts` guard surfaced them. Every remaining key is
now a defined term with `dcterms:source`, `skos:note`, `rdfs:seeAlso` and a graded SKOS mapping.

- Classes: `euelec:ElectronicDevice` and `euelec:ElectronicComponent` (both `rdfs:subClassOf
  gs1:Product`; the EEE scope of WEEE 2012/19/EU Art. 3(1)(a) versus a part inside a device),
  `euelec:SelectiveTreatmentItem` (WEEE Annex VII), `euelec:RecoveredMaterial`,
  `euelec:MaterialRecoveryResult` (WEEE Annex V accounting), `euelec:BatteryDisposition`,
  `euelec:HazardousWasteRecord` (WEEE Art. 8 with Dir. 2008/98/EC), `euelec:AvoidedEmissionsEstimate`.
- WEEE collection / sorting / treatment event properties: `collectionMethod`, `deviceCondition`,
  `dataWiped`, `sortingDecision`, `hazardousMaterialsIdentified`, `handlingNote`,
  `estimatedRecoverableMaterials`, `materialMassGrams`, `recyclingProcess`, `recyclingFacility`,
  `materialRecoveryResults`, `totalInputMassGrams`, `totalRecoveredMassGrams`, `recoveryRate`,
  `recyclingRate`, `energyRecoveryRate`, `batteryDisposition`, `batteryMassGrams`,
  `separatelyTreated`, `treatmentFacility`, `treatmentMethod`, `hazardousWasteGenerated`,
  `hazardousWasteRecord`, `wasteDescription`, `treatmentCertificate`, `avoidedEmissions`,
  `avoidedEmissionsKgCO2e`, `calculationMethod`.
- Repair event properties: `repairType`, `repairDescription`, `repairTechnician`, `removalReason`,
  `replacedComponentPassport`, `installedComponentPassport`, `warrantyStatus`, `repairCost`,
  `nextDisposition`.
- Access tiers for all of the above in `ontology/electronics-access-levels.ttl`: per-item treatment
  and repair records are `oec:AuthorizedOnly` (the public tier keeps the design-level rates, the
  collection scheme and the spare-part price), with the nested value carriers marked
  `oec:accessLevelInherited`.
- SHACL: unitCode shapes for `securitySupportYears`, `featureSupportYears`,
  `sparePartAvailabilityYears` (ANN), `annualEnergyConsumption` (KWH) and the three
  `powerConsumption*` properties (WTT), which is the constraint the removed phantom unit classes
  were standing in for.

### Changed: references pointed at the vocabulary that already covered the concept

- `euelec:material` → `schema:material` (Layer 1 schema.org) in the selective-treatment and
  recovered-material entries.
- `euelec:aluminumGrams` / `copperGrams` / `goldGrams` / `silverGrams` / `plasticsGrams` → one
  `schema:material` + `euelec:materialMassGrams` pair per stream, so the pattern extends to any
  material instead of one property per metal.
- `euelec:deviceFirmwareVersionAfterRepair` → `euelec:newVersion`, the module's existing
  event-level "version after update" carrier.
- `euelec:hazardousWaste` (boolean) → `euelec:hazardousWasteGenerated`; the WEEE consignment node
  moved from `euelec:hazardousWasteGenerated` to `euelec:hazardousWasteRecord`, so one name no
  longer carries both a boolean and a node.
- `euelec:carbonOffset` → `euelec:avoidedEmissions`: the figure is avoided primary-production
  emissions, not a purchased offset.
- SHACL shapes stopped targeting classes that do not exist: `euelec:FrequencyHertz`,
  `euelec:LuminanceCandela`, `oec:PowerWatts`, `oec:EnergyKilowattHours` and `oec:DurationYears`
  now resolve to `gs1:QuantitativeValue`, matching every quantity range in the ontology, with the
  unit pinned by the unitCode shapes above. `euelec:ComponentBOMShape` accepts the `gs1:Product`
  its `euelec:components` range declares, and `euelec:ElectronicComponentShape` additionally
  targets objects of `euelec:components` so it validates the bills of materials as shipped.

### Removed: data that granularity rules place outside the event

- `euelec:batteryChemistry` from `epcis/weee-disposal.jsonld`: battery chemistry is model-level
  master data of the battery GTIN (`eubat:batteryChemistry`), served by the resolver.
- `euelec:warrantyStartDate`, `euelec:warrantyEndDate`, `euelec:purchaseCountry` from
  `epcis/ownership-transfer.jsonld`: the `retail_selling` eventTime is the warranty start, the
  warranty terms are model-level master data (`gs1:manufacturersWarranty` with
  `gs1:WarrantyPromise` / `gs1:durationOfWarranty`), and the country of purchase is location-level
  master data of the store GLN already in `readPoint` / `bizLocation`.

## [0.9.7] — 2026-06-19

### Changed
- Renamed vocabulary prefix `electronics:` → `euelec:` (alias only; namespace IRIs unchanged).
- Completed term governance: 100% `dcterms:source` + `skos:note` coverage.
- Added `owl:imports` for the SEMICeu Core Vocabularies.

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

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `euelec:EnergyEfficiency` owl:equivalentClass `schema:EnergyEfficiencyEnumeration`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `euelec:EnergyEfficiency` owl:equivalentClass `schema:EnergyEfficiencyEnumeration`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `euelec:EnergyEfficiency` owl:equivalentClass `schema:EnergyEfficiencyEnumeration`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Added equivalence / cross-reference links

- `euelec:EnergyEfficiency` owl:equivalentClass `schema:EnergyEfficiencyEnumeration`

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

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
