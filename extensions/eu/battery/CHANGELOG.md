# Changelog

All notable changes to the Battery module will be documented in this file.

## [Unreleased]

### Added

- End-of-life information as language-tagged text, beside the URLs: `eubat:endUserRoleInWastePrevention`,
  `endUserRoleInSeparateCollection`, `separateCollectionPoints`, `takeBackCollectionPoints`,
  `preparationForReuseFacilities`, `preparationForRepurposingFacilities`, `wasteBatteryTreatmentFacilities`,
  `wasteBatterySafetyInstructions`, `labelSymbolMeaning`, `substancesImpact` (Public).
- `eubat:compositionDescription` (the detailed composition as text, AuthorizedOnly) and
  `eubat:temperatureRangeTestDescription` (how the idle-state range was determined, Public).
- Voltages measured within a temperature range: parameters `eubat:NominalVoltage`, `MinimumVoltage`,
  `MaximumVoltage`, condition types `eubat:LowerTemperatureBound`, `UpperTemperatureBound`.
- Document type `eubat:SparePartReplacementDocument` (an `oec:DocumentType`).
- The Amperia StaxWall 10 example states all of them (texts in `en-GB`).

## [0.14.0] - 2026-11-12

### Changed

- `eubat:StationaryBattery` `skos:broadMatch` the EU DPP Registry category `industrialBattery`:
  above 2 kWh a stationary battery is an industrial battery (Regulation (EU) 2023/1542 Art. 3(1)(14)).
- Example `amperia-staxwall-item.bpr-2.0.1.json`: the Amperia item as BatteryPass-Ready 2.0.1, a
  fixture of the hosted BatteryPass-Ready types; kept in step by `pnpm test`.

## [0.13.1] - 2026-11-11

### Added

- `scripts/reconstruct-batterypass-ready.ts` (`pnpm run reconstruct:batterypass-ready`): model, batch
  and item passport plus the item's EPCIS events → one OpenEPCIS item passport with the folded
  battery state results → BatteryPass-Ready 2.0.1 via the crosswalk. Checked in `pnpm test`
  (Amperia StaxWall 10). The fold is shared with the v1.0 reconstruction.
- `eubat:BatteryTemperature` (performance parameter, CEL): the battery's temperature under operating
  conditions, a result of `eubat:hasBatteryState`; exactMatch SAMM and EUDPP `temperatureInformation`
  and BatteryPass-Ready 2.0.1 `temperatureInformation`.
- The EPCIS fold (`scripts/passport/assemble-core.ts`) counts a temperature alarm (`exception`
  ALARM_CONDITION) as an excursion lasting its sensor element's window.

### Changed

- Amperia StaxWall 10 examples: chemistry name, critical raw materials, hazardous substances with H and
  P statements, dismantling documents, labels, spare-part source, backup copy host, operator address,
  maximum permitted power, C-rate and power capability of the cycle-life test, round-trip efficiency
  at 50 % cycle life, cell resistance; end-of-life documents on the batch; power and round-trip
  efficiency fade, temperature and remaining power capability on the item; the lifecycle events carry
  the matching readings.

## [0.13.0] - 2026-11-11

### Added: BatteryPass-Ready 2.0.1

- `context/batterypass-ready-2.0.1-context.jsonld` reads a BatteryPass-Ready 2.0.1 document (the current
  data model, `vendor/batterypass-ready/2.0.1`) as RDF; `vocab/batterypass-ready-2.0.1-json.ttl` names the
  keys of its value containers (`bprx:`). Both are generated (`pnpm run build:batterypass-ready-context`).
- `vocab/batterypass-ready-2.0.1.ttl`: `batteryCarbonFootprintPerFunctionalUnit` is a data element (its
  name ends like a unit slot, and the generator had left it out); the vocabulary is built from the
  vendored schemas.
- Mappings to 2.0.1 completed from the crosswalk table: carbon footprint per functional unit and raw
  material stage, C-rate of the cycle-life test, declaration of conformity, due diligence report,
  collection and waste-prevention information, test report, separate collection symbol, supply chain
  indices, third-party assurances, present internal resistance (core: hazard statements). The SAMM
  mappings stay.
- `pnpm run export:batterypass-ready` writes the 2.0.1 document of a passport; `pnpm test` checks the
  battery item examples against their category schemas. The GEFEG data model 1.0 pipeline
  (`export-batterypass-gefeg.ts`, live validator, reconstruction) stays for the older state;
  `validate:batterypass-live -- --list` shows which schemas the test environment offers.

### Breaking: measured and tested values on `common/assessment`

Fourth wave of the assessment model. 47 flat terms are removed; their values are results of an
assessment that name an `eubat:` performance parameter and carry a UN/CEFACT unit:

- **Battery state** (Annex XIII 4): `eubat:hasBatteryState` → `eubat:BatteryStateAssessment`. State of
  health and charge, SOCE, full cycles, remaining capacity and usable energy, capacity and power
  fade, internal resistance and its increase, energy and capacity throughput, remaining round-trip
  efficiency and its fade, self-discharge, time above / below the temperature boundaries (also while
  charging), deep-discharge events, initial capacity and energy are results; the remaining power
  capability at a state of charge is a sub-assessment with that condition
  (`eubat:StateOfChargeLevel`); remaining cycles and lifetime are indicators.
- **Performance test** (Annex XIII 1 (o)-(p)): `eubat:hasPerformanceTest` on the technical
  specification → `eubat:PerformanceDurabilityTest`. The reference test is `oea:hasMethod`; depth of
  discharge and charge / discharge C-rate are protocol settings; the capacity exhaustion and
  resistance increase thresholds are `eubat:CapacityExhaustionThreshold` and
  `eubat:ResistanceIncreaseThreshold`; initial cell and pack resistance, initial self-discharge,
  initial round-trip efficiency and at 50 % cycle life, cycle life and lifetime throughputs are
  results; the original power capability is a sub-assessment per state of charge.
- **Carbon footprint class**: an indicator of kind `eubat:CarbonFootprintPerformanceClass`.

Rated values, the expected lifetime in years, warranty, carbon footprint stages, test report links,
negative events and SOCE measurement metadata stay properties. EPCIS events name the parameters as
`sensorReport` types (`eubat:StateOfHealth` instead of `eubat:hasStateOfHealth`); mixed sensor
elements are split (BMS values and ambient temperature). The EC readiness check finds a data point
carried by a result through the parameter it observes. The BatteryPass bridge keeps the keys of these
values under their SAMM IRI (BatteryPass-Ready v1.3 `bpr:` for four longlist-only attributes, minted
in `vocab/batterypass-ready-1.3.ttl`); the new `batterypass-1.3` crosswalk profile converts them.
`battery-context-to-batterypass.jsonld` no longer points three keys at SAMM attributes that do not
exist. `scripts/migrate-assessment.ts` rewrites stored passports.

## [0.12.0] - 2026-11-10

### Fixed: example values the EU Registry crosswalk rejected

- `examples/amperia-staxwall-item.jsonld`: the state of certified energy is a share (97.5 %, the
  remaining 9.98 kWh of the certified 10.24 kWh), not an energy; the cycle count is a
  `gs1:QuantitativeValue` (unit `C62`), as `eubat:hasCycleCount` defines it.
- `examples/batterypass-lmt-item.jsonld`: the remaining capacity is 271.04 Ah (rated 280 Ah, 3.2 %
  capacity fade), not a percentage.
- `eubat:hasRemainingCapacity`, `eubat:hasCapacityThroughput`: the unit code in the comment is `AMH`.

### Fixed: no `action` on the assembling TransformationEvent

`epcis/amperia-staxwall-lifecycle.jsonld`: TransformationEvents have no `action` in EPCIS 2.0.

## [0.11.0] - 2026-11-09

### Removed: `eubat:substanceCasNumber`, `eubat:substanceEcNumber`

Replaced by `oec:casNumber` and `oec:ecNumber` on `eubat:HazardousSubstance`; the shape, the
module schema and the BatteryPass bridge key `hazardousSubstanceIdentifier` point there. The
Public tier they carried now comes from `hasHazardousSubstances`.

## [0.10.1] - 2026-11-08

### Fixed: `battery-schema.json`

- `Battery.hasExpectedLifetime` removed. Since 0.10.0 the expected lifetime sits on
  `eubat:TechnicalSpecification`, where the schema already lists it.
- `Battery.lastUpdate` is `lastUpdated` (also in `required`), `batteryPassportIdentifier` is
  `passportIdentifier`; the old names only survive in the BatteryPass bridge contexts.

## [0.10.0] - 2026-11-07

### Removed: duplicate terms on our side (re-audit 2026-11)

The 2026-11 re-audit found several of our terms mapped `skos:exactMatch` onto the same upstream
data element. Where they name the same data point, one term stays; nothing is deprecated. Where the
surviving term sits on another node or carries another value shape, `scripts/migrate-assessment.ts`
moves the value (the examples are migrated with it).

| Removed | Use instead | Migration |
|---|---|---|
| `eubat:expectedLifetimeYears` | `eubat:hasExpectedLifetime` | year count becomes a `gs1:QuantitativeValue` with unitCode `ANN`; the term now sits on `eubat:TechnicalSpecification` next to `eubat:expectedCycleLife` |
| `eubat:roundTripEnergyEfficiency` | `eubat:hasRemainingRoundTripEfficiency` | the 0-1 ratio on `oec:PerformanceInfo` becomes a percentage quantity (unitCode `P1`) on the battery |
| `eubat:hasSelfDischargeRate` | `eubat:hasCurrentSelfDischargingRate` | rename; the term now sits on the battery like the other state-of-health values |
| `eubat:hasRemainingEnergy` | `eubat:hasRemainingUsableEnergy` | rename |
| `eubat:hasDismantlingDocuments` | `eubat:hasDismantlingAndRemovalInformation` | rename; its range is now `eubat:DismantlingDocument` (a subclass of `oec:DocumentReference`) |
| `eubat:hasDismantlingInstructions` | `eubat:hasDismantlingAndRemovalInformation` | the link on the end-of-life info becomes a dismantling-manual document on the battery, unless the list already holds that file |
| `eubat:safetyMeasures`, `eubat:safetyInstructionsForDismantling` | `eubat:hasSafetyMeasures` (new) | each link becomes an `oec:DocumentReference` on the end-of-life info (Annex XIII 2 (d), guidance #49) |
| `eubat:casNumber`, `eubat:ecNumber` | `oec:casNumber`, `oec:ecNumber` | rename; same name, same AuthorizedOnly tier |

Kept, because they are not duplicates: `eubat:declarationOfConformity` (the URL on the
declaration that `eubat:hasEuDeclarationOfConformity` links), `eubat:dueDiligenceReportUrl` (on
the due-diligence node), `eubat:renewableContentShare` (per material, while
`eubat:renewableContent` is the battery's share), `eubat:hasEvolutionOfSelfDischarge` (the series,
not the current value) and `eubat:safetyInstructions` (public end-user instructions, Art. 74(1)(f)).
`eubat:substanceCasNumber` and `eubat:substanceEcNumber` stay as well: they are Public, because the
hazardous substances are disclosed under Annex VI Part A, while the CAS and EC numbers in the
material breakdown are AuthorizedOnly, and field access merges tiers by local name.

The guidance registries (1.0 and 3.2), the readiness shapes, the access tiers, the extension schema
and the GITB bundle follow. Data point 36 (initial round-trip efficiency) is now carried by
`eubat:roundTripEfficiency` alone. The BatteryPass bridge keeps every key: `remainingEnergy`,
`currentSelfDischargingRate`, `batteryMaterialIdentifier` and the two dismantling keys land on the
surviving terms, and both expected-lifetime keys keep the upstream SAMM IRI because they carry a
bare year count. The EPCIS examples measure `eubat:hasRemainingUsableEnergy`. The re-pointed keys
are listed with their reason in `scripts/context-compat-allowlist.json`.

### Changed: EC data-point guidance version 3.2

The Commission replaced the Battery Passport data-point guidance: version 3.2 of 19 October 2026
supersedes version 1.0 of 28 July 2026 (Ares(2026)7579758). The registry follows as
`vocab/ec-battery-passport-guidance-3.2.ttl` under its own namespace
(`https://ref.openepcis.org/vocab/ec-battery-passport-guidance/3.2#dp-NN`); the 1.0 file stays
published and every 3.2 data point names its predecessor with `dcterms:replaces`. All 95
`rdfs:seeAlso` pointers of the ontology move to the 3.2 numbers.

- The C-rate of the cycle-life test is split: charge (#39, `eubat:cRateLifeCycleTest`) and
  discharge (#40, new, optional). 1.0 #40 to #45 become #41 to #46; 1.0 #46 and #47 merge into #47.
- Recycled content (#20 to #23) is not to be filled as of February 2027 ("to be applied as
  envisaged by Article 8"), so the readiness check reports it as not yet required.
- The registry carries the new columns "As defined in" (`ecbp:definedIn`) and "Type of
  information" (`ecbp:typeOfInformation`); conditions are quoted from the 3.2 table.
- Readiness demo: group boundaries (Annex XIII 1 is #17 to #45, Annex XIII 2 #46 to #49), the 3.2
  release on the timeline.

### Added: discharge C-rate and cell / pack resistance

`eubat:dischargeCRateLifeCycleTest` (guidance #40) and `eubat:hasInitialCellInternalResistance`
/ `eubat:hasInitialPackInternalResistance` (guidance #38 names both values).
Public tier, context entries, extension schema and the battery example follow.

### Removed: duplicates that the EU DPP Registry and EN 18223 now cover

Removed without a deprecation phase, because each one duplicates a term that carries the
`skos:exactMatch` to the Commission's DPP Registry data element. Their SKOS mappings move to the
surviving term; examples, the guidance registries (1.0 and 3.2), the BatteryPass bridge and the
GITB fixtures follow.

| Removed | Use instead | Why |
|---|---|---|
| `eubat:batteryPassportIdentifier` | `oec:passportIdentifier` | EN 18223 `digitalProductPassportId`, EU `core-vocabulary#digitalProductPassportId` |
| `eubat:lastDataUpdate` | `oec:lastUpdated` | EN 18223 `lastUpdated`, EU `core-vocabulary#lastUpdate`; every battery example already carried both |
| `eubat:exhaustionThreshold` | `eubat:capacityThresholdForExhaustion` | same definition, EU `capacityExhaustionThreshold` |
| `eubat:capacityFadeThreshold` | `eubat:capacityThresholdForExhaustion` | a second wording of the same threshold (guidance #33); the examples gave it 20 next to an exhaustion threshold of 70 |
| `eubat:expectedNumberOfCycles` | `eubat:expectedCycleLife` | EU `expectedLifetimeCycles` (guidance #31) |
| `eubat:numberOfFullCycles` | `eubat:hasCycleCount` | EU `numberOfChargingCycles` (guidance #68) |
| `eubat:hasInitialInternalResistance` | `eubat:hasInitialCellInternalResistance`, `eubat:hasInitialPackInternalResistance` | guidance 3.2 #38 asks for both values; one undifferentiated value fills neither |

The BatteryPass bridge keeps every incoming key: `batteryPassportIdentifier` and
`productIdentifier` land on `oec:passportIdentifier`, `lastUpdate` on `oec:lastUpdated`, the
longlist cycle keys on `eubat:expectedCycleLife` and `eubat:hasCycleCount`, and the single initial
resistance keeps its upstream SAMM IRI. These re-pointed keys are listed with their reason in
`scripts/context-compat-allowlist.json`.

### Fixed: renewable content share

The EU `renewableContentShare` (Annex XIII 1 (f)) is the share of the whole battery. It is now an
exactMatch of `eubat:renewableContent` (end-of-life information); the per-material
`eubat:renewableContentShare` points at it with broadMatch.

### Added: EU DPP Registry value lists

`skos:exactMatch` from the battery categories, battery statuses and access levels to the EU DPP
Registry value lists (mirror `upstream/eu-dpp`).

### Changed: recyclability rate pointer

`eubat:recyclabilityRate` points at `oea:RecyclabilityRate` (rdfs:seeAlso) instead of the removed
`oec:recyclabilityRate`.

### Changed: CIRPASS-2 pointers follow EUDPP 2.1.0

### Added: audited SKOS mappings to the CIRPASS-2 battery ontology (vocab-sync wave 2026-10-30)

`vocab-sync audit --module battery` against EUDPP 2.1.0 and the mirrored EU DPP Battery
Ontology 0.4.0 DRAFT (grader gpt-oss-20b, three-judge QA panel on qwen3-32b, report
`docs/skos-alignment/skos-completeness-battery-2026-10-29.{md,json}`; 938 findings, 93 APPLY
after triage, 43 of them with a CIRPASS-2 target). 32 were curated and written:
`eubat:Battery`, `numberOfFullCycles`, `cRateLifeCycleTest`, `labelSymbol`,
`hasRemainingUsableEnergy`, `initialSelfDischarge`, `powerCapabilityRatio`,
`roundTripEfficiency` / `roundTripEfficiencyAt50PercentCycleLife` → `skos:exactMatch` on
their `battery-performance#` twins; the generic rate, resistance, exposure-time, test-report
and self-discharge properties → `skos:narrowMatch` on the initial / at-50 % / charging
specialisations; `PowerCapabilityAtSoC`, `hasPowerCapabilityAt20SoC`,
`safetyInstructionsForDismantling`, `substanceCasNumber` / `substanceEcNumber`,
`MaterialCategory`, `hasOperatorInformation`, `CarbonFootprintDeclaration` → `broadMatch` /
`narrowMatch` on the battery and EUDPP terms. `eubat:hasMaximumPermittedBatteryPower` gets an
`rdfs:seeAlso` to `battery-performance#maximumPermittedBatteryPower` (not proposed by the
panel). Held: the textile-targeted proposals (`hasRecycledContent`, `lithiumRecycledShare`,
`capacityThresholdForExhaustion` → textile value properties), range-to-boundary and
threshold-to-value proposals, `hasMaximumDischargingPower exactMatch
maximumPermittedBatteryPower`, and the inverted `separateCollectionSymbolUrl`.

`eubat:ecNumber` → `eudpp:ecNumber`, `eubat:hasSubstanceLocation` →
`eudpp:isLocatedInProduct`, `eubat:RecycledContent` → `eudpp:RecycledMaterialsUseResult`,
`eubat:CarbonFootprintDeclaration` / `eubat:CarbonFootprintClass` → `eudpp:LCIAResult`
(the `EnvironmentalFootprint` class no longer exists in LCA 3.1). Relation grades kept.
The CIRPASS-2 EU DPP Battery Ontology 0.4.0 DRAFT is now mirrored as
`extensions/upstream/cirpass2-battery`; aligning `eubat:` to it is a follow-up audit.

## [0.9.9] - 2026-08-04

### Changed: envelope-term anchor to CIRPASS-2 EUDPP

`eubat:lastDataUpdate` now anchors `skos:closeMatch eudpp:lastUpdate`,
mirroring the anchor its cross-cutting sibling `oec:lastDataUpdate`
already carries.

### Changed: schema descriptions cite the regulation

`validation/battery-schema.json` now carries a regulation-referenced
`description` for the seven passport-template headline data points (chemistry, mass, passport identifier, carbon footprint, expected lifetime, hazardous substances, material composition)
— the same clause source the PPWR schema already provides. Downstream
requirement profiles (DDM passport templates) quote these instead of a
generic placeholder.

### Granularity-dependent obligations split out (EN 18223)

`eubat:BatteryShape` required `gs1:hasSerialNumber` of **every** battery passport, including
model-level ones that by definition have no serial, and required the model- and party-level
identifiers of batch and item passports, which under the granularity model resolve that data
up the GS1 Digital Link hierarchy rather than restating it — the same resolution
`scripts/lib/ec-readiness-shacl-core.ts` performs by folding the three levels onto one focus
node. Every battery passport was therefore non-conformant by construction.

The level-dependent obligations now live in `eubat:BatteryShape-model`, `-batch` and `-item`,
which ship `sh:deactivated true` and are activated one at a time by IRI suffix — the same
mechanism the generated EC readiness category shapes use. Each level is also its own GITB
validation type (`eu.battery.model` / `.batch` / `.item`). `-batch` deliberately adds no
property: a batch passport's lot identity *is* its Digital Link (AI 10), and minting a
`eubat:lotNumber` would duplicate the identifier the document IRI already carries.

### `eubat:hasOperatorRole` and `eubat:hasOperatorInformation` anchored to the core

Both are declared `rdfs:subPropertyOf` their `oec:` counterparts. `eubat:hasOperatorRole` has
the identical domain and range as `oec:hasOperatorRole`, so it was a pure specialisation by
regulation whose `skos:note` nonetheless claimed no equivalent existed. With the axiom in
place a battery passport that states the battery-specific term satisfies the cross-cutting
obligation, and the core shapes need no knowledge of the `eubat:` namespace.

### Shape corrections

- `eubat:hasOperatorRole` was constrained with `sh:datatype xsd:string` although it is an
  object property whose values are `oec:OperatorRole` individuals; now `sh:nodeKind sh:IRI`.
- `gs1:manufacturer` required an inlined `oec:OperatorInformation` node, rejecting the
  resolver-served IRI reference the architecture prescribes for party master data. Now accepts
  an inlined operator or organization node **or** an IRI reference.
- `schema:name`, `eubat:electrolyteType` and `eubat:extinguishingAgent` accept
  language-tagged text via `dpp-sh:TranslatableText`.

### Examples completed

The reference passports never carried the BatteryPass-Ready v1.3 mandatory DPP attributes
(#1–#4, #7–#11): `schema:schemaVersion`, `oec:passportStatus`,
`oec:hasReportingGranularity`, `oec:lastUpdated` and `eubat:batteryModelIdentifier` at every
level, the facility/operator/manufacturer identifiers at model level, and
`gs1:hasSerialNumber` at item level. Values are drawn from each file's own GTIN, GLNs and
Digital Link serial. `portable-ebike-battery.jsonld` additionally gained
`oec:granularityLevel` and a carbon-footprint study URL, and its `eubat:expectedCycleLife`
was unwrapped from a `gs1:QuantitativeValue` — the ontology declares it `xsd:integer`.

### Changed: `bpr:` mirror shrunk to its longlist-only scope

GEFEG BatteryPass-Ready is the Battery Pass Consortium's publication and validation
channel, not a second data model (its canonical repo is the Consortium repo; the TNO
AAS→RDF modules on the CIRPASS-2 hub render the same source). The OpenEPCIS-hosted
`bpr:` namespace therefore now carries only the longlist-only remainder: the
DPP-information attributes `DPPSchemaVersion`, `DPPStatus`, `DPPGranularity`,
`Date-timeOfLatestUpdateOfDPP`, the four flat lossless-carrier keys of the bridge
context, and the `dppStatusCodes` scheme. `battery.ttl` drops 150 mappings into the
mirror (the `urn:samm:io.BatteryPass.*` URNs carry them); `capacityFadeThreshold`,
`powerCapabilityRatio`, `stateOfChargeLevel`, `hasOperatorInformation`, `spareParts`
and `numberOfDeepDischargeEvents` receive their SAMM anchor directly. The outbound
bridge context's four `bpr:` IRIs, previously dangling in camelCase, now reference the
real terms. README documents the one-model-several-renderings picture including the TNO
provenance. GEFEG conformance (schemas, exporter, 23/23 harness) is untouched.

### Changed: object properties adopt the `has*` naming convention

91 battery object properties follow the project-wide rename (`eubat:materialComposition`
→ `eubat:hasMaterialComposition`); `eubat:hasBattery` already conformed. Datatype
properties (rated values, fade counters, identifiers) keep their names.

### Added: EC Battery Passport guidance data-point registry (Ares(2026)7579758)

The European Commission's "Guidance Document: Digital Batteries Passport — data points by
category" (v1.0, 28 July 2026, CC BY 4.0) is the first official EU enumeration of the Battery
Passport data points: 71 numbered entries with their legal source in Regulation (EU) 2023/1542
and per-category applicability (EV / LMT / industrial) as of February 2027. The Commission
publishes no RDF, so — like the GEFEG BatteryPass-Ready mirror — the registry is minted as an
OpenEPCIS-hosted vocabulary: [`vocab/ec-battery-passport-guidance-1.0.ttl`](vocab/ec-battery-passport-guidance-1.0.ttl),
generated by `scripts/build-ec-guidance-vocab.ts` from the hand-transcribed source
[`vocab/ec-guidance-datapoints.json`](vocab/ec-guidance-datapoints.json).

Each data point is dual-typed `rdf:Property` + `cccev:InformationRequirement` (the data points
are information requirements that reference properties, modelled with the EU's own SEMICeu
building block) and encodes the guidance table's mechanics machine-readably: the static/dynamic
split (Annex XIII 4 = dynamic, folded from the EPCIS event stream; each dynamic entry links its
EPCIS event example), the access tier derived from Article 77(2), the per-category applicability
with the verbatim conditions, and `ecbp:implementedBy` links to the operative terms. A derived
matrix ships as [`validation/ec-datapoint-applicability.json`](validation/ec-datapoint-applicability.json).

Coverage: all 71 data points are carried by existing terms — no new `eubat:` terms were needed
(GS1 covers manufacturer identity, production date, weight, serial and instructions for use;
identification runs over GS1 Digital Link path segments; periodic recordings are the EPCIS
`sensorElementList` mechanism). 87 `eubat:` terms now carry `rdfs:seeAlso` back-references to
their data points, so every term card shows its official EU data-point number. Full mapping in
[`docs/EC_GUIDANCE_DATAPOINTS.md`](docs/EC_GUIDANCE_DATAPOINTS.md).

## [0.9.8] - 2026-07-29

### Fixed: mapping directions settled against the layering and the upstream definitions

Assertions that claimed a module term is broader than the `oec:` common-core term it specialises now
read `skos:broadMatch`, or `rdfs:seeAlso` where the relation is component-to-whole rather than a
subsumption. Core is Layer 3 and this module Layer 4, so the module term is the narrower one by
construction, and `check:mappings` rule 10 enforces it. Project-wide this settled 91 directions; see
the [root changelog](../../../CHANGELOG.md).

### Fixed: 3 SKOS mapping relations that stayed inside `eubat:`

`skos:broadMatch` and `skos:narrowMatch` link concepts in *different* concept schemes; within one,
SKOS uses `skos:broader` / `skos:narrower`. `eubat:leadPreConsumerShare` and
`eubat:leadPostConsumerShare` now read `skos:broader eubat:leadRecycledShare`, and
`eubat:numberOfDeepDischargeEvents` reads `skos:broader eubat:negativeEvents`, which also corrects
its direction: a deep-discharge count is a kind of negative event, not the other way round.
`check:mappings` rule 9 rejects the shape; a mapping from `eubat:` to `oec:` is legitimately
cross-scheme and is untouched. See the [root changelog](../../../CHANGELOG.md).

### Changed: mapping anchors and directions from the vocab-sync audit

A `vocab-sync audit --module battery` run (1182 findings, 614 QA-confirmed) produced 130 applied
changes: 84 directions corrected and 46 anchors added. The bulk anchors `eubat:` into the two peer
profiles that model batteries in detail, the BatteryPass consortium SAMM model (75 targets) and DPP
Keystone (43), which is what the layering predicts for a module whose domain a community profile
already covers closely.

Twelve panel-confirmed proposals were refused, each recorded in `scripts/skos-deferred.json`:

- Six claimed a metal-specific recycled share (`eubat:cobaltRecycledShare`, `leadRecycledShare`,
  `lithiumRecycledShare`) is broader than BatteryPass's generic `preConsumerShare` and
  `postConsumerShare`. That is inverted; if anything ours are the narrower terms.
- `eubat:batteryModelIdentifier` under `batterypass:batteryPassportIdentifier`. Different referents:
  ours identifies the battery model, theirs the passport document about it.
- `eubat:separateCollectionSymbolUrl` as `skos:exactMatch dppk:separateCollectionSymbol`. A URL that
  points at the symbol is not the symbol.
- `eubat:eventLocation` under `schema:sportsActivityLocation` and `rail:europeanTrackLocation`, a
  sports venue and a railway track.
- Two proposed that `eubat:hazardousSubstances` and `eubat:ratedMaximumPower` are broader than the
  identically named BatteryPass terms. Two terms that named themselves the same thing are candidates
  for `exactMatch` or `closeMatch`; the triage now holds a subsumption between identical local names.

`check:mappings` caught one more after the fact, which is the guard doing its job: the panel proposed
`schema:contactPoints`, which schema.org retired in favour of `schema:contactPoint`, and
`eubat:supplierContact` already mapped to the current term. The triage reads schema.org's
`supersededBy` data now, so that round trip does not repeat.

### Changed: `eubat:TechnicalSpecification` is the narrower term against `schema:PropertyValueSpecification`

It read `skos:narrowMatch`, which asserts the reverse. The general value classes were added to the
shared head-term list, so rule 6 catches this shape now. See the
[root changelog](../../../CHANGELOG.md).

### Fixed: 4 value spaces no longer mapped onto the class of things they classify

A closed list of codes and the class of things those codes classify sit at different levels, so no graded SKOS relation between them holds in either direction. `eubat:ComponentLocation` (to `locn:Location`), `eubat:DismantlingDocumentType` (to `schema:DigitalDocument`), `eubat:NegativeEventType` (to `schema:Event`) and `eubat:ResponsibleSourcingStandard` (to `untp:Standard`) now use `rdfs:seeAlso`.

`check:mappings` rule 7 covers the pattern and runs before the direction rule, since at different levels the question of which term is narrower does not arise. Project-wide this corrected 31 assertions across eight modules; see the [root changelog](../../../CHANGELOG.md).

### Fixed: 52 inverted SKOS mapping directions

SKOS reads `A skos:narrowMatch B` as "B is narrower than A". 52 mappings in this module
used `narrowMatch` while pointing at a general foundational term, so they asserted the
reverse of their intent, for example claiming `schema:identifier` was narrower than a
specific passport identifier. They now read `skos:broadMatch`, the project convention for
"this term is narrower than the target". The sweep covered 174 assertions across eight
modules; `check:mappings` rule 6 now rejects the pattern against a curated list of general
Layer-1 terms, and pairs where our term is a type or category while the target denotes the
entity itself are allowlisted for a curator instead (see
[`docs/skos-alignment/OPEN_DECISIONS.md`](../../../docs/skos-alignment/OPEN_DECISIONS.md)).

### Fixed: phantom `eubat:` IRIs removed

The new `check-extension-terms` guard found 42 distinct `eubat:` CURIEs referenced
by published artifacts but defined in no ontology. Every reference now resolves.

### Added
- `eubat:leadPreConsumerShare` / `eubat:leadPostConsumerShare` (range `xsd:decimal`,
  domain `eubat:RecycledContent`): voluntary pre/post breakdown of the Art. 8
  recycled-lead share, mirroring the lithium / cobalt / nickel pattern. The
  Regulation mandates only the aggregate `eubat:leadRecycledShare` for lead, so the
  `skos:note` records the split as voluntary; both were already pinned in the
  context overrides and used by `examples/battery-product.jsonld`.
- `eubat:numberOfDeepDischargeEvents` (range `xsd:integer`, domain `gs1:Product`):
  a flat cumulative lifetime counter in the same family as
  `eubat:timeSpentInExtremeTemperaturesAboveBoundary`, where `eubat:negativeEvents`
  carries the individually dated `eubat:DeepDischarge` events.
- Graded SKOS anchors from existing terms to the BatteryPass-Ready longlist
  attributes they answer (`bpr:CriticalRawMaterials`, `bpr:PartNumbersForComponents`,
  `bpr:SeparateCollectionSymbol`, `bpr:ResultsOfTestReportsProvingCompliance`,
  `bpr:BatteryCarbonFootprintPerFunctionalUnit`, the three `bpr:ContributionOf…`
  lifecycle stages, `bpr:MeaningOfLabelsAndSymbols`, the two end-user role
  attributes, `bpr:DismantlingInformation-Manuals…`,
  `bpr:ImpactOfSubstancesOnEnvironment…`, `bpr:NumberOfDeepDischargeEvents`).
- `eubat:note` on `epcis/negative-event.jsonld` carrying the free-text incident
  description that the phantom key had encoded in its value.

### Changed
- `context/battery-context-batterypass-bridge.jsonld`: 28 longlist keys repointed
  from phantom IRIs to the vocabulary term that already covers the concept:
  `warrantyPeriod` → `gs1:warranty` (Layer 1, as `battery.ttl` already directs),
  the six pre/post metal shares → `eubat:{lithium,cobalt,nickel}{Pre,Post}ConsumerShare`,
  `recycledLeadShare` → `eubat:leadRecycledShare`, the four carbon-footprint
  contributions → `eubat:carbonFootprint{RawMaterialExtraction,Production,Distribution,Recycling}`,
  `batteryCarbonFootprintPerFunctionalUnit` → `eubat:carbonFootprintTotal` (already
  defined as kg CO2e per kWh), `webLinkToPublicCarbonFootprintStudy` →
  `eubat:carbonFootprintStudyUrl`, `resultsOfTestReportsProvingCompliance` →
  `eubat:resultOfTestReport`, `informationOfDueDiligenceReport` →
  `eubat:dueDiligenceReportUrl`, `separateCollectionSymbol` →
  `eubat:separateCollectionSymbolUrl`, `meaningOfLabelsAndSymbols` →
  `eubat:labelMeaning`, `criticalRawMaterials` → `eubat:criticalRawMaterialsStatement`,
  `impactOfSubstancesOnEnvironment` → `eubat:hazardImpact`,
  `dismantlingInformationManuals…` → `eubat:dismantlingDocuments`,
  `partNumbersForComponents` → `eubat:spareParts`, `informationOnSourcesOfSpareParts`
  → `eubat:sparePartSources`, the two end-user role keys → `eubat:wastePrevention` /
  `eubat:separateCollection`, `informationOnBatteryCollection` →
  `eubat:informationOnCollection`, `initialRoundTripEnergyEfficiency` →
  `eubat:roundTripEfficiency`, the idle-state boundaries →
  `eubat:minimumTemperature` / `eubat:maximumTemperature`, and the four
  extreme-temperature durations → the `eubat:timeSpent…Boundary` properties.
- Four longlist keys that OpenEPCIS models structurally across several terms keep
  their upstream `bpr:` IRI instead of a partial match: `materialsUsedInCathode`,
  `symbolsForCadmiumAndLead`, `carbonFootprintLabel`, `informationOnAccidents`. The
  bridge `_comment` now states this target-selection rule.
- Same bridge, two further corrections: the SAMM-shaped `timeExtreme*` keys pointed
  at the class `gs1:Temperature` (a temperature, not a duration) and `negativeEvents`
  pointed at the class `eubat:NegativeEvent` from a property position; both now
  resolve to the matching properties.
- `examples/batterypass-v1.3.jsonld`: the 24 phantom `eubat:` keys are written as
  the bridge's BatteryPass aliases, which are also the property names
  `validation/batterypass-v1.3-schema.json` expects.
- `examples/batterypass-v1.3.jsonld` now satisfies that schema completely: 85/85
  required attributes, 0 validation errors (it was 45/85). The remaining 40 keys
  were still written in prefixed form, so the file claimed a conformance it did not
  have. Renaming them to the longlist names is graph-preserving because the bridge
  already aliases each one to the same IRI; three cases needed the bridge fixed
  first:
  - `extinguishingAgent` and `renewableContentShare` had no alias at all, though
    both terms exist in `battery.ttl` and the data was present.
  - `hazardousSubstances` now carries `eubat:hazardousSubstances` (range
    `eubat:HazardousSubstance`) instead of `oec:hazardousSubstances`: the values are
    battery-specific (`eubat:substanceCasNumber`, `eubat:concentration`,
    `hazardousSubstanceClass`), so the core property's range did not match its data.
  - BatteryPass `[5] batteryPassportIdentifier` (DPP identifier) and
    `[6] batteryIdentifier` (unique battery/product identifier) are distinct
    attributes; the bridge mapped both onto `eubat:batteryPassportIdentifier`.
    `batteryIdentifier` now maps to `gs1:productID`.
  - Quantity carriers use the longlist's bare `{value, unitCode}` shape, aliased
    onto `gs1:value`/`gs1:unitCode` carrying the same `xsd:decimal` coercion as the
    prefixed terms, so the numeric literals keep their datatype.
- `validation/battery-shapes.ttl`: `eubat:OperatorInformation` does not exist, so
  `sh:class` and `sh:targetClass` now name `oec:OperatorInformation`, the declared
  range of `eubat:operatorInformation`.
- `epcis/negative-event.jsonld`: `eubat:incidentType` → `eubat:eventType` with the
  `eubat:NegativeEventType` enum value `PhysicalDamage`.

## [0.9.7] — 2026-06-19 — GEFEG BatteryPass-Ready conformance + branded prefixes

### Changed
- Renamed vocabulary prefix `battery:` → `eubat:` (alias only; namespace IRIs unchanged).
- Completed term governance: 100% `dcterms:source` + `skos:note` coverage.
- Added `owl:imports` for the SEMICeu Core Vocabularies (m8g / locn / adms) and cross-layer `rdfs:seeAlso` anchors to `oec:`.

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

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

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
- `oec:granularity` — new `oec:DPPGranularity` enumeration (`ModelLevel`, `BatchLevel`, `ItemLevel`).
- `oec:lastUpdate` — date-time of latest DPP update.

**Removed properties — `eubat:`**
- `eubat:leadPreConsumerShare` and `eubat:leadPostConsumerShare` — combined into the existing `eubat:leadRecycledShare` per v1.3 #54 (the EU Battery Regulation does not require a pre/post split for lead, in contrast to lithium, cobalt, nickel).

**BatteryPass bridge contexts — two sources referenced separately**
- The bridge contexts now reference each BatteryPass source with its own prefix, instead of a single (incorrect) `bp-*` set pointing at non-existent SAMM `1.3.0` URNs and a fabricated `DPPInformation` submodel.
- `bpsamm-*` prefixes → the BatteryPass Consortium SAMM aspect models at their real published versions `1.2.0` (Performance `1.2.1`), matching the SKOS mappings in `battery.ttl`.
- `bpr:` prefix → `https://ref.openepcis.org/vocab/batterypass-ready/1.3#`, an OpenEPCIS-hosted reference namespace for the GEFEG BatteryPass-Ready longlist v1.3 attributes that have no SAMM/RDF equivalent (the DPP-information group #1–#4: schema version, status, granularity, last update).
- Added mappings for the v1.3 longlist attributes across both bridges.

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
