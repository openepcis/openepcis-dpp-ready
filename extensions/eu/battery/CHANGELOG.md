# Changelog

All notable changes to the Battery module will be documented in this file.

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Removed (use canonical term instead)

- `battery:auditDate` → `schema:auditDate`
- `battery:batteryCategory` → `schema:category`
- `battery:batteryModel` → `schema:model`
- `battery:batterySerialNumber` → `gs1:hasSerialNumber`
- `battery:batteryStatus` → `schema:status`
- `battery:eventDescription` → `schema:description`
- `battery:exposureStartTime` → `schema:startDate`
- `battery:fullName` → `schema:name`
- `battery:manufacturerInformation` → `gs1:manufacturer`
- `battery:massPercentage` → `schema:weightPercentage`
- `battery:materialCategory` → `schema:category`
- `battery:materialName` → `schema:name`
- `battery:materialSourceCountry` → `gs1:countryOfOrigin`
- `battery:measurementMethod` → `schema:measurementMethod`
- `battery:serviceContactPoint` → `schema:contactPoint`
- `battery:shortName` → `schema:name`
- `battery:substanceName` → `schema:name`

## [Unreleased] - 2026-04-29

### BatteryPass-Ready v1.3 alignment (GEFEG conformance prep)

GEFEG published the **Battery Passport Data Attribute Longlist v1.3** (March 2026, 100 attributes vs 93 in v1.2). The BatteryPass-Ready test environment is scheduled to come online June 2026. This release aligns our `battery:` ontology, validation profiles, EPCIS examples, and SAMM bridge contexts with v1.3 so that documents emitted via the `battery-context-to-batterypass.jsonld` reverse bridge will satisfy the GEFEG harness when it opens.

**New properties — `battery:`**
- `battery:batteryModelIdentifier` (mandatory; v1.3 #7) — manufacturer model ID, distinct from the human-readable `battery:batteryModel`.
- `battery:batterySerialNumber` (mandatory; v1.3 #8) — explicit serial; complements the `(21)` AI in the GS1 Digital Link.
- `battery:facilityIdentifier` (mandatory; v1.3 #11) — was implicit in `manufacturingPlace`; now first-class.
- `battery:operatorIdentifier` (mandatory; v1.3 #9) — split from `operatorInformation`; access-restricted to authorities.
- `battery:manufacturerIdentifier` (mandatory; v1.3 #10) and `battery:manufacturerInformation` (mandatory; v1.3 #13) — split from a single combined attribute.

**New properties — `dpp:` core (cross-cutting DPP information, v1.3 #1-#4)**
- `dpp:schemaVersion` — schema version this DPP follows (e.g. `"1.3"`).
- `dpp:status` — reuses existing `dpp:PassportStatus` enumeration; added `dpp:Suspended` individual.
- `dpp:granularity` — new `dpp:DPPGranularity` enumeration (`ModelLevel`, `ModelPerSiteLevel`, `BatchLevel`, `ItemLevel`).
- `dpp:lastUpdate` — date-time of latest DPP update.

**Removed properties — `battery:`**
- `battery:leadPreConsumerShare` and `battery:leadPostConsumerShare` — combined into the existing `battery:leadRecycledShare` per v1.3 #54 (the EU Battery Regulation does not require a pre/post split for lead, in contrast to lithium, cobalt, nickel).

**SAMM bridge context updates**
- Bumped SAMM URN namespace versions from `1.2.0` / `1.2.1` to `1.3.0` in both forward (`battery-context-batterypass-bridge.jsonld`) and reverse (`battery-context-to-batterypass.jsonld`) bridges.
- Added new `bp-dpp` prefix → `urn:samm:io.BatteryPass.DPPInformation:1.3.0#` for the DPP-information sub-category.
- Added mappings for all v1.3 new attributes.
- Note: v1.3 SAMM URNs are placeholders pending publication of GEFEG aspect models.

**Validation profiles**
- `battery-shapes.ttl` — added SHACL `minCount` constraints on all v1.3-mandatory identifiers and DPP-info fields. Carbon footprint label, performance class and study URL are now required.
- `battery-schema.json` — Battery `$defs` extended with v1.3 identifiers and DPP-info fields; new `DPPStatus` and `DPPGranularity` enums. Lead pre/post share removed from `RecycledContent`.
- New: `validation/batterypass-v1.3-schema.json` — generated JSON Schema reflecting the GEFEG v1.3 longlist (100 properties, 85 required for at least one battery category). Validates SAMM-shaped passport documents emitted by the bridge.

**Reference artifacts**
- New: `examples/batterypass-v1.3.jsonld` — canonical SAMM v1.3 passport for the same battery used in `epcis/commissioning.jsonld`. Demonstrates the EPCIS → bridge → SAMM round-trip.
- New: `docs/reference/2026_BatteryPass-Ready_DataAttributeLongList_v1.3.xlsx` — committed authoritative copy of the GEFEG longlist (last-modified 2026-03-24).
- New: `scripts/build-batterypass-schema.ts` — generator script (`pnpm run build:batterypass-schema`) that re-derives the v1.3 export schema from the committed XLSX.

**EPCIS event examples**
- `epcis/commissioning.jsonld` — populated with all v1.3-mandatory product-level attributes (model identifier, serial number, facility identifier, operator/manufacturer identifiers, DPP schema version/status/granularity/last-update). Updated `_comment_architecture` to reflect the v1.3 contract and the role of the `GS1-Extensions` HTTP header in activating regulation-specific validation.

**Mock conformance harness**
- New: `scripts/test-batterypass-conformance.ts` — runs three test groups (schema, plausibility, round-trip) approximating the GEFEG harness, with paired negative cases. 40 tests, all passing. Wired as `pnpm test`.
- Added `ajv@^8.20.0` and `ajv-formats@^3.0.1` to devDependencies.

**Documentation corrections (no schema impact)**
- Updated equation comments on `battery:capacityFade`, `battery:powerFade`, `battery:roundTripEfficiencyFade` to reflect bracket-placement fixes per v1.3 (#61, #71, #77).

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
