# Changelog

All notable changes to the Battery module will be documented in this file.

## Unreleased — GEFEG BatteryPass-Ready live-conformance alignment (2026-06-17)

### Added
- 5 additive performance properties required by the **live** GEFEG
  BatteryPass-Ready validator (no GS1/upstream equivalent), flat on their domain
  class so existing payloads are unaffected:
  - `eubat:maximumPermittedBatteryPower` (range `gs1:QuantitativeValue`, domain `eubat:TechnicalSpecification`)
  - `eubat:timeSpentInExtremeTemperaturesAboveBoundary` / `…BelowBoundary` (range `xsd:integer`, domain `gs1:Product`)
  - `eubat:timeSpentChargingDuringExtremeTemperaturesAboveBoundary` / `…BelowBoundary` (range `xsd:integer`, domain `gs1:Product`)
- GEFEG exporter `scripts/export-batterypass-gefeg.ts` + live caller
  `scripts/validate-batterypass-live.ts` + required-set probe
  `scripts/probe-gefeg-required.ts` + derived-schema generator
  `scripts/build-gefeg-live-schema.ts`.
- Live-accurate per-category schemas under `validation/gefeg-live/`, verified-valid
  fixtures under `examples/batterypass-ready/`, mirrored GEFEG artifacts under
  `docs/reference/gefeg-batterypass-ready/`, the GEFEG↔OpenEPCIS map
  (`docs/GEFEG_MAPPING.md`), and EPCIS `epcis/shipping.jsonld` (DPP master data on
  the GS1 Digital Link via `masterDataAvailableFor`).

### Removed
- The mirrored longlist `docs/reference/2026_BatteryPass-Ready_DataAttributeLongList_v1.3.xlsx`.
  It has a stable public URL, so `build:batterypass-schema` now fetches it on
  demand (override with `BPASS_LONGLIST_XLSX`) rather than committing a copy.

### Notes
- Documented that GEFEG's downloadable static schemas do not match the live
  `ValidateJSON` server (no `required`, wrong Stationary root key, differing key
  names); see `docs/CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md`. All four categories
  validate clean against the live server. The GEFEG static schemas under
  `docs/reference/gefeg-batterypass-ready/` are kept (downloaded via the SPA;
  no stable canonical URL to link to).

## 0.9.6 — EN 18223 status alignment (2026-06-07)

### Added
- `eubat:Battery` class, regenerating `json/battery.json` against the new EN 18223 core model.

### Changed
- `dppStatus` aligned to the string-valued `oec:passportStatus` (EN 18223 `dppStatus`); the SHACL passport-status shape updated to match.
- Per-attribute reporting granularity now uses `oec:reportingGranularity` (the `granularity` key is reserved for the EN 18223 passport-level attribute); passport timestamp uses `oec:lastUpdated`.

## 0.9.5 — BatteryPass-Ready v1.3 gap-fill + CIRPASS-2 see-also pointers (2026-05-04)

### Added
9 additive properties closing the audited gaps against the BatteryPass-Ready
v1.3 longlist (data shapes derived from the canonical SAMM submodels at
v1.2.0, the consortium's current published tag). All flat on the
appropriate domain class — no breaking change to existing payloads or to
the BatteryPass-Ready GEFEG bridge:

- `eubat:currentSelfDischargingRate` (range `gs1:QuantitativeValue`, domain `oec:PerformanceInfo`) — current rate of self-discharge
- `eubat:atSoC` (range `xsd:decimal`, 0–1) — test-condition annotation: state-of-charge at which a metric was measured
- `eubat:numberOfFullCycles` (range `xsd:integer`, domain `oec:PerformanceInfo`)
- `eubat:roundTripEnergyEfficiency` (range `xsd:decimal`, 0–1, domain `oec:PerformanceInfo`)
- `eubat:expectedLifetime` (range `gs1:QuantitativeValue`, domain `gs1:Product`) — ESPR Article 7 durability declaration
- `eubat:expectedNumberOfCycles` (range `xsd:integer`, domain `gs1:Product`)
- `eubat:batteryMass` (range `gs1:QuantitativeValue`, `rdfs:subPropertyOf gs1:netWeight`) — Annex VI Part A; GS1-first via the netWeight subproperty
- `eubat:dismantlingAndRemovalInformation` (range `oec:DocumentReference`) — Annex VIII §B safety information
- `eubat:safetyMeasures` (range `xsd:string`)
- `eubat:negativeEvents` (range existing `eubat:NegativeEvent`, domain `oec:PerformanceInfo`) — wires the already-defined `eubat:NegativeEventType` enum (Accident / PhysicalDamage / ThermalEvent / ElectricalFault / WaterIngress / Overcharge / DeepDischarge / ShortCircuit) into the passport

Each new property carries a `skos:note` citing the corresponding
SAMM submodel URN at v1.2.0. Full provenance trace and the CIRPASS-2
intersections sit in [`docs/CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md`](./docs/CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md).

### Notes
- Battery TTL grows from 1888 → 1959 triples; bridge contexts and
  examples unchanged.
- DIN DKE SPEC 99100:2025-02 alignment proxied via the BatteryPass-Ready v1.3 longlist + SAMM v1.2.0
  SAMM submodels; per-attribute trace pending DIN document access.
- No CIRPASS-2 anchors needed in `battery.ttl` directly — they propagate
  from `dpp-core.ttl` through the typed-link cascade (operator → Actor /
  facility → Facility / hazardousSubstance → Substance / etc.).


## 0.9.5 — SEMICeu Core Vocabularies anchoring (2026-05-04)

Conformity / operator / facility / notified-body identifiers are modelled
as typed nesting under `gs1:Product`, with each identifier sitting on the
typed object it actually identifies. Property names match BatteryPass-Ready
v1.3 / GEFEG harness expectations at the JSON-LD context level; the RDF
shape underneath is structurally correct.

### Typed link properties on `gs1:Product`
- `eubat:euDeclarationOfConformity` — range `cccev:Evidence` (SEMICeu CCCEV). Models the EU Declaration of Conformity as the canonical CCCEV evidence supporting the EU Battery Regulation requirements. `rdfs:subPropertyOf cccev:hasSupportingEvidence`.
- `eubat:manufacturingPlace` — range `oec:FacilityInformation` (subClassOf `gs1:Place`); `rdfs:seeAlso locn:Location`.
- `eubat:operatorInformation` — range `oec:OperatorInformation`; `owl:equivalentClass oec:OperatorInformation` already pulls the legacy `untp-core:Party` anchor through.

### Typed link inside the declaration
- `eubat:notifiedBody` — domain `cccev:Evidence`, range `cv:PublicOrganisation` (SEMICeu CPOV). The notified body that signed off on the conformity assessment is a public organisation; it sits under the declaration, not directly on the product.

### Identifier and label properties (sit on the typed object)
| Property | Domain | Anchor |
|---|---|---|
| `eubat:notifiedBodyNumber` | `cv:PublicOrganisation` | `rdfs:subPropertyOf skos:notation`, `rdfs:seeAlso adms:Identifier` |
| `eubat:notifiedBodyName` | `cv:PublicOrganisation` | `rdfs:subPropertyOf gs1:organizationName` |
| `eubat:operatorIdentifier` | `oec:OperatorInformation` | `rdfs:subPropertyOf skos:notation`, `rdfs:seeAlso adms:Identifier`, `rdfs:seeAlso gs1:gln` |
| `eubat:manufacturerIdentifier` | `oec:OperatorInformation` | `rdfs:subPropertyOf skos:notation`, `rdfs:seeAlso adms:Identifier`, `rdfs:seeAlso gs1:gln` |
| `eubat:facilityIdentifier` | `oec:FacilityInformation` | `rdfs:subPropertyOf skos:notation`, `rdfs:seeAlso adms:Identifier`, `rdfs:seeAlso gs1:gln` |
| `eubat:declarationOfConformity` (URL) | `cccev:Evidence` | `rdfs:seeAlso schema:url` |
| `eubat:euDeclarationOfConformityId` | `cccev:Evidence` | `rdfs:subPropertyOf skos:notation`, `rdfs:seeAlso adms:Identifier` |
| `eubat:supplierContact` | `gs1:Organization` | range `gs1:ContactPoint`; `rdfs:seeAlso cv:ContactPoint` |

### Example shape
`battery-product.jsonld` carries the canonical nested form:

```json
{
  "type": "gs1:Product",
  "euDeclarationOfConformity": {
    "type": "cccev:Evidence",
    "euDeclarationOfConformityId": "DoC-…",
    "declarationOfConformity": "https://…/doc.pdf",
    "notifiedBody": {
      "type": "cv:PublicOrganisation",
      "notifiedBodyNumber": "0123",
      "notifiedBodyName": "TÜV SÜD"
    }
  }
}
```

JSON-LD context registers the `cv:` / `cccev:` prefixes alongside the
existing `gs1:` / `oec:` / `schema:` and aliases the new typed-link
property names (`euDeclarationOfConformity`, `notifiedBody`). RDF entailment
will not enforce these `rdfs:domain` declarations at parse time, so payloads
that put the leaf properties flat under `gs1:Product` will still parse;
the canonical shape is the typed nesting above.

### Other
- `cv:` / `cccev:` / `locn:` / `adms:` prefixes declared in `battery.ttl`.
- See `extensions/common/interop/docs/SEMIC_CORE_VOCABULARIES.md` for the cross-vocab mapping rationale.

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Removed (use canonical term instead)

- `eubat:auditDate` → `schema:auditDate`
- `eubat:batteryCategory` → `schema:category`
- `eubat:batteryModel` → `schema:model`
- `eubat:batterySerialNumber` → `gs1:hasSerialNumber`
- `eubat:batteryStatus` → `schema:status`
- `eubat:eventDescription` → `schema:description`
- `eubat:exposureStartTime` → `schema:startDate`
- `eubat:fullName` → `schema:name`
- `eubat:manufacturerInformation` → `gs1:manufacturer`
- `eubat:massPercentage` → `schema:weightPercentage`
- `eubat:materialCategory` → `schema:category`
- `eubat:materialName` → `schema:name`
- `eubat:materialSourceCountry` → `gs1:countryOfOrigin`
- `eubat:measurementMethod` → `schema:measurementMethod`
- `eubat:serviceContactPoint` → `schema:contactPoint`
- `eubat:shortName` → `schema:name`
- `eubat:substanceName` → `schema:name`

## [Unreleased] - 2026-04-29

### BatteryPass-Ready v1.3 alignment (GEFEG conformance prep)

GEFEG published the **Battery Passport Data Attribute Longlist v1.3** (March 2026, 100 attributes vs 93 in v1.2). The BatteryPass-Ready test environment is scheduled to come online June 2026. This release aligns our `eubat:` ontology, validation profiles, EPCIS examples, and SAMM bridge contexts with v1.3 so that documents emitted via the `battery-context-to-batterypass.jsonld` reverse bridge will satisfy the GEFEG harness when it opens.

**New properties — `eubat:`**
- `eubat:batteryModelIdentifier` (mandatory; v1.3 #7) — manufacturer model ID, distinct from the human-readable `eubat:batteryModel`.
- `eubat:batterySerialNumber` (mandatory; v1.3 #8) — explicit serial; complements the `(21)` AI in the GS1 Digital Link.
- `eubat:facilityIdentifier` (mandatory; v1.3 #11) — was implicit in `manufacturingPlace`; now first-class.
- `eubat:operatorIdentifier` (mandatory; v1.3 #9) — split from `operatorInformation`; access-restricted to authorities.
- `eubat:manufacturerIdentifier` (mandatory; v1.3 #10) and `eubat:manufacturerInformation` (mandatory; v1.3 #13) — split from a single combined attribute.

**New properties — `oec:` core (cross-cutting DPP information, v1.3 #1-#4)**
- `oec:schemaVersion` — schema version this DPP follows (e.g. `"1.3"`).
- `oec:status` — reuses existing `oec:PassportStatus` enumeration; added `oec:Suspended` individual.
- `oec:granularity` — new `oec:DPPGranularity` enumeration (`ModelLevel`, `ModelPerSiteLevel`, `BatchLevel`, `ItemLevel`).
- `oec:lastUpdate` — date-time of latest DPP update.

**Removed properties — `eubat:`**
- `eubat:leadPreConsumerShare` and `eubat:leadPostConsumerShare` — combined into the existing `eubat:leadRecycledShare` per v1.3 #54 (the EU Battery Regulation does not require a pre/post split for lead, in contrast to lithium, cobalt, nickel).

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
- Updated equation comments on `eubat:capacityFade`, `eubat:powerFade`, `eubat:roundTripEfficiencyFade` to reflect bracket-placement fixes per v1.3 (#61, #71, #77).

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
