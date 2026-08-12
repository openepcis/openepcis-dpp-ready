# Changelog

All notable changes to the Battery module will be documented in this file.

## [Unreleased]

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
- `bpr:` prefix → `https://ref.openepcis.io/vocab/batterypass-ready/1.3#`, an OpenEPCIS-hosted reference namespace for the GEFEG BatteryPass-Ready longlist v1.3 attributes that have no SAMM/RDF equivalent (the DPP-information group #1–#4: schema version, status, granularity, last update).
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
