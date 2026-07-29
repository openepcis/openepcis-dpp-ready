# Changelog

All notable changes to the DPP Core module will be documented in this file.

## [Unreleased]

## [0.9.8] - 2026-07-29

### Changed: `oec:activityClassification` anchored to the GS1 structure published in July 2026

GS1 now models economic activity classification in two parts:
`gs1:organizationClassification` links a `gs1:Organization` to a
`gs1:OrganizationClassificationDetails`, which carries `gs1:organizationClassificationID` (the code)
alongside `gs1:organizationClassificationType` (the scheme it belongs to). That is the structure this
property has been approximating with a single string since 0.9.5, so per the layering rule for a term
upstream has since covered, it is now anchored `skos:closeMatch gs1:organizationClassificationID`,
with `rdfs:seeAlso` to the details class and the type property, and a `skos:note` telling new models
to prefer the GS1 shape. The grade is closeMatch and not exactMatch because this property conveys the
scheme by convention rather than in a sibling field.

The `skos:broadMatch` to the ISIC scheme document became `rdfs:seeAlso`: a classification scheme
published as a web page is not a concept that can subsume a property, and the pointer was already
there.

### Fixed: 5 SKOS mapping relations that stayed inside `oec:`

`skos:broadMatch` and `skos:narrowMatch` link concepts in *different* concept schemes; within one,
SKOS uses `skos:broader` / `skos:narrower`. Five assertions mapped an `oec:` term onto another `oec:`
term, and four of those were also inverted. `oec:isStrategicRawMaterial` is the clearest: it claimed
`oec:isCriticalRawMaterial` is the narrower term while its own `rdfs:comment` records
"Strategic ⊂ Critical". It now reads `skos:broader`. The three carbon-footprint stage properties and
`oec:materialCircularityIndicator` became `rdfs:seeAlso`, since a stage is a component of the total
rather than a specialisation of it, and no SKOS or RDFS relation states "component of".

`check:mappings` rule 9 rejects the shape. Each module declares its own `owl:Ontology`, so a mapping
from `eubat:` to `oec:` is legitimately cross-scheme and is left alone; only a mapping inside a single
namespace is the error.

### Changed: mapping anchors and directions from the vocab-sync audit

A `vocab-sync audit --module core` run (878 findings, 419 QA-confirmed) produced 95 applied
changes: 35 directions corrected and 60 anchors added. Most of the additions anchor `oec:` terms
into the peer profiles that specialise them, which is the shape the layering predicts:
`oec:energyEfficiency` is the broader term against six battery round-trip efficiency metrics,
`oec:recycledContentDetails` against the DPP Keystone and BatteryPass pre- and post-consumer
properties, `oec:substanceLocation` against their hazardous-substance locations, and
`oec:materialComposition` against the GS1 textile and packaging material properties.

Four assertions already in the ontology were inverted and had been invisible, because the head-term
list rule 6 checks did not contain their targets: `oec:DueDiligenceReport` under `cv:Evidence`,
`oec:componentName` under `schema:name`, `oec:biodegradabilityTestMethod` under
`schema:measurementMethod`, and `oec:epdValidUntil` under `schema:validThrough`. All four now read
`skos:broadMatch`, and the list moved to
[`scripts/general-l1-terms.json`](../../../scripts/general-l1-terms.json) so the audit triage reads
the same one. That matters: the core panel proposed 47 further `narrowMatch` assertions, and without
the shared list nothing would have stopped the ones aimed at a general term.

Refused, with the reason recorded in `scripts/skos-deferred.json`: `oec:OperatorInformation` under
CIRPASS-2's `EconomicOperatorRole` (an operator record against a role enumeration, the same level
confusion `CIRPASS2_ALIGNMENT.md` already records as pointer-only), `oec:EnvironmentalProductDeclaration`
over `schema:EnergyConsumptionDetails` (an EN 15804 declaration is not a broader form of appliance
energy figures), and `oec:facilityId` over `dppk:manufacturingFacility` (an identifier is not
broader than the thing it identifies; `oec:facilityInformation` is the term that compares).

Eleven proposals made `oec:value` the broader term of every specific value property the panel could
find, from `rail:topValue` to `semic:hasValue`. A generic value slot says nothing about meaning, so
the triage now treats our own structural carriers the way it already treated upstream ones.

### Fixed: 14 graded mappings onto a serialisation slot

`gs1:value`, `schema:value` and the min/max bounds carry a number or a string wherever a vocabulary
needs one; they denote no concept, so a subsumption claim against them says nothing. The 14 that
existed contradicted each other: `oec:indicatorTotalValue` was broader than `schema:value` while
`eucpr:characteristicValue` was both narrower than it and broader than `schema:minValue`. All are
`rdfs:seeAlso` now, and `check:mappings` rule 8 keeps it that way. The two general value CLASSES are
a different case and were flipped rather than downgraded: `oec:MultiLanguageValue` is narrower than
`schema:StructuredValue`, and `eubat:TechnicalSpecification` than `schema:PropertyValueSpecification`.

### Fixed: 8 value spaces no longer mapped onto the class of things they classify

A closed list of codes and the class of things those codes classify sit at different levels, so no graded SKOS relation between them holds in either direction. `oec:OperatorRole` (to `schema:OrganizationRole` and `cirpass2:EconomicOperatorRole`), `oec:ProductCategory` (to `gs1:Product`, `schema:Product`, `gs1:FoodBeverageTobaccoProduct` and `dppk:BatteryProduct`), `oec:BiodegradabilityTestMethod` (to `cv:Criterion`) and `oec:EnergyEfficiencyClass` (to `schema:EnergyConsumptionDetails`) now use `rdfs:seeAlso`.

The `cirpass2:EconomicOperatorRole` pair is a case where the ontology contradicted our own documentation: [`CIRPASS2_ALIGNMENT.md`](../interop/docs/CIRPASS2_ALIGNMENT.md) records it as an "enum-vs-class shape difference; pointer only", and the `rdfs:seeAlso` beside it was already that pointer, so the `skos:exactMatch` is simply gone.

`check:mappings` rule 7 covers the pattern and runs before the direction rule, since at different levels the question of which term is narrower does not arise. Project-wide this corrected 31 assertions across eight modules; see the [root changelog](../../../CHANGELOG.md).

### Changed: EPCIS examples serve the standard contexts; the operational chain is EN 18223 only

Two serializations had blurred into one. The design is that standard JSON-LD prefixes every
vocabulary term, `gs1:` included, and that bare terms exist only in the compressed EN 18223 §5.2
form ([`docs/EN18223_FORMATS.md`](../../../docs/EN18223_FORMATS.md)). In practice all 47
`epcis/*.jsonld` examples across every module referenced a `*-operational-context.jsonld`,
against rule 4 in [`CLAUDE.md`](../../../CLAUDE.md), because the bare GS1 keys inside
`masterDataAvailableFor` needed the shortcut aliases that only the operational chain carried.

`dpp-core-context.jsonld` now gives `gs1:masterDataAvailableFor` a property-scoped `@context`
pointing at `gs1-shortcuts-context.jsonld`. A JSON-LD 1.1 property-scoped context propagates into
the nested nodes and may override the `@protected` terms of the EPCIS base context, so the bare
GS1 keys inside the card resolve while every key outside it stays prefixed. All 47 examples now
list the standard chain, EPCIS base first:

```json
"@context": [
  "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
  "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
  "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld"
]
```

The switch is graph-preserving: each file was canonicalized (URDNA2015) before and after, and the
N-Quads are identical. One file changed on purpose, `eudr/epcis/exemption-declaration.jsonld`,
which carried a party card (`organizationName`, `partyGLN`) inside `masterDataAvailableFor`. Party
data is resolver-served, so the card was removed per rule 1.

The EPCIS base context is now vendored at `vendor/gs1/epcis-context.jsonld`, which makes
`validate:examples` and the guards deterministic offline.

### Added: guards for the two serializations

- `check:operational` grew from three rules to six. It now checks that every EPCIS example lists
  the standard chain with the EPCIS base first and no operational context (d), that prefixing is
  correct in both directions, so a bare key outside `masterDataAvailableFor` and a `gs1:`-prefixed
  key inside it are both errors (e), and that the organization records expand losslessly (f).
- `check:extension-terms` is new: the mirror image of `check:vocab` for the namespaces this
  project governs. It found 124 references to project-owned CURIEs that no ontology defines, all
  now resolved. Such a phantom expands to a well-formed but undefined IRI, and a curated bare
  alias can even give it a clean operational round-trip, so nothing else caught them. The worst
  case was `oec:dppStatus` in six product seeds, which is not a term; the property is
  `oec:passportStatus` and its value is the lowercase `skos:notation` token.
- `check:golden-fidelity` asserts no compressed artifact contains a relative IRI or a flattened
  node reference.
- `check:release` verifies that every place recording a version agrees. At 0.9.7 the package, the
  VERSION files, the ontologies and CLAUDE.md said 0.9.7 while README.md said 0.9.6, listed
  fsma204 at 0.1.0, and omitted cpr, ppwr and iron-steel from both of its module tables.

### Fixed: 51 inverted SKOS mapping directions

SKOS reads `A skos:narrowMatch B` as "B is narrower than A". 51 mappings in this module
used `narrowMatch` while pointing at a general foundational term, so they asserted the
reverse of their intent, for example claiming `schema:identifier` was narrower than a
specific passport identifier. They now read `skos:broadMatch`, the project convention for
"this term is narrower than the target". The sweep covered 174 assertions across eight
modules; `check:mappings` rule 6 now rejects the pattern against a curated list of general
Layer-1 terms, and pairs where our term is a type or category while the target denotes the
entity itself are allowlisted for a curator instead (see
[`docs/skos-alignment/OPEN_DECISIONS.md`](../../../docs/skos-alignment/OPEN_DECISIONS.md)).

### Added
- Terms that the JSON-LD contexts and shapes referenced without any TTL definition are now defined: `oec:tradeItemPieces` (ObjectProperty, the forward direction of `oec:tradeItemPieceOf`, `skos:broadMatch schema:hasPart`), `oec:biodegradability` and `oec:compostability` (the entry ObjectProperties that make `oec:Biodegradability` / `oec:Compostability` and their members reachable from a product), `oec:conformityDeclaration` (`skos:closeMatch untp:conformityClaim`, `skos:broadMatch cccev:Evidence`, the target the UNTP bridge compacts `conformityClaim` onto), `oec:combinedNomenclatureCode` (EU CN commodity code; cross-cuts Detergents 2026/405, EUDR Annex I, CBAM and PPWR, and GS1 publishes no tariff property), and `oec:Detergents` as an `oec:ProductCategory` member. All carry access tiers in `dpp-core-access-levels.ttl`.

### Changed
- Curated context aliases repointed off undefined IRIs and onto the vocabulary term that already covers the concept: the `oec:DocumentReference` scoped alias `resourceTitle` now targets `schema:name` (matching the top-level `documentTitle` alias, which already did), and the bare aliases `carbonFootprintUnit`, `totalRecycledShare`, `preConsumerShare` and `postConsumerShare` are dropped in favour of `oec:declaredUnit`, `oec:recycledContent`, `oec:preConsumerRecycledContent` and `oec:postConsumerRecycledContent`.

## [0.9.7] — 2026-06-19

### Added
- EN 15804:2012+A2:2019 Environmental Product Declaration: `oec:EnvironmentalProductDeclaration` (anchored `skos:exactMatch dppk:EPDBlock`), `oec:ImpactIndicatorResult` (`skos:closeMatch dppk:ImpactValues`), and `oec:LifecycleStageResult`. Normalised indicator-by-stage model (avoids a flat indicator × stage property explosion) with the `oec:ImpactIndicatorType` enumeration (13 EN 15804+A2 core indicators: GWP total/fossil/biogenic/luluc, ODP, AP, EP freshwater/marine/terrestrial, POCP, ADP elements/fossil, WDP) and the `oec:LifecycleStage` enumeration (modules A1–A5, B1–B7, C1–C4, D). Properties: `oec:environmentalProductDeclaration`, `oec:epdRegistrationNumber`/`epdProgramOperator`/`epdStandard`/`epdValidUntil`, `oec:impactIndicator`, `oec:indicatorType`/`indicatorUnit`/`indicatorTotalValue`, `oec:lifecycleStageResult`, `oec:lifecycleStage`, `oec:stageValue`. Complements the coarser `oec:CarbonFootprintDeclaration` (5 aggregate stages, GWP only) and single-value `oec:carbonFootprintTotal`.
- Generic component fields harvested from the DPP Keystone `dppk:Component` pattern: `oec:componentName` and `oec:componentIdentifier` (domain `oec:MaterialComposition`, anchored to `dppk:componentName`/`dppk:componentIdentifier` + schema.org), alongside the existing CAS/EC numbers; IUPAC names use the foundational `schema:iupacName` directly.
- `dppk:` prefix declaration (`https://dpp-keystone.org/spec/v2/terms#`) for SKOS mapping anchors to the DPP Keystone peer profile; see the bridge in [`../../interop/`](../../interop/).

### Changed
- Cross-vocabulary alignment migrated from `owl:equivalentClass` / `owl:equivalentProperty` to graded SKOS mapping relations across every module: `skos:exactMatch` for true 1:1 cross-walks, `skos:closeMatch` for approximate matches (scale, enum-vs-string, structural differences), and `skos:broadMatch` where an OpenEPCIS term is narrower than its target (e.g. `eusteel:MaterialTestCertificate` → `schema:Certification`). Cross-walks no longer assert OWL logical equivalence, which avoids reasoner / SHACL over-entailment; `rdfs:seeAlso` pointers are retained. `scripts/build-json.ts` now emits `exactMatch` / `closeMatch` / `broadMatch` / `narrowMatch` / `relatedMatch` arrays.
- Renamed vocabulary prefix `dpp:` → `oec:` (alias only; namespace IRIs unchanged).
- Completed term governance: 100% `dcterms:source` + `skos:note` coverage.
- Added `owl:imports` for the SEMICeu Core Vocabularies (m8g / locn / adms).
- Added cross-cutting `oec:remanufacturingDate` (anchored to the GS1 Rail bridge).

## 0.9.6 — EN 18223 information-model alignment + GS1 to EN 18223 converter (2026-06-07)

Aligns `oec:` core with the published EN 18223:2026 `DigitalProductPassport` model (the EPCIS4DPP profile). See [`../../interop/docs/EN18223_MODEL_ALIGNMENT.md`](../../interop/docs/EN18223_MODEL_ALIGNMENT.md) and [`../../interop/docs/CEN_JTC24_CONFORMANCE.md`](../../interop/docs/CEN_JTC24_CONFORMANCE.md).

### Added
- `oec:DigitalProductPassport` class (EN 18223 4.1.2.1 envelope), anchored `owl:equivalentClass untp-dpp:ProductPassport`.
- `oec:dppSchemaVersion`, `oec:facilityId`, `oec:contentSpecificationId` properties (EN 18223 attributes).
- `oec:Inactive`, `oec:Invalid` passport-status values (EN 18223 `dppStatus` base set); `skos:notation` lowercase tokens on all status and granularity values.
- EN 18223 DataElement model (4.1.2.3 to 4.1.2.8): `oec:DataElement` with subclasses `DataElementCollection`, `SingleValuedDataElement`, `MultiValuedDataElement`, `MultiLanguageDataElement`, and `oec:MultiLanguageValue`; properties `oec:elementId`, `oec:dictionaryReference`, `oec:valueDataType`, `oec:value`, `oec:dataElement`, `oec:multiLanguageValue`, `oec:language`. `oec:DocumentReference` documented as the EN 18223 RelatedResource (4.1.2.7).
- Worked EN 18223 example: the real GS1 Web Vocabulary + Digital Link battery passport `../../eu/battery/examples/battery-product.jsonld` derives to `../../eu/battery/examples/battery-product.en18223.json` (the Annex A `elements[]` output whose entries carry a `dictionaryReference` into the ref.openepcis.io data dictionary).
- SHACL constraint `dpp-sh:GranularityDigitalLinkConstraint`: validates that `granularity` matches the GS1 Digital Link Application Identifiers in `uniqueProductIdentifier` (01 -> model, 01+10 -> batch, 01+21 -> item; EN 18219 4.4 / EN 18223), with `sh:declare` prefix declarations added to the shapes graph.
- Converter `scripts/derive-en18223.ts` (npm `derive:en18223`): derives the EN 18223 Annex A "expanded" serialization (`elements[]` with `objectType`/`dictionaryReference`/`valueDataType`) from good GS1 Web Vocabulary + GS1 Digital Link JSON-LD (the EN 18223 "compressed" serialization). Reuses the N3 range index and `jsonld.expand`, and derives the whole envelope (granularity, schema version, identity, and `contentSpecificationIds` from the dictionaryReference namespaces) from the source document.
- Browser demo `demos/en18223-converter/` (npm `demo:en18223`): a self-contained client-side page that runs the converter live (esbuild-bundled). It loads every module's real product passport (battery, electronics, textile, eudr, ppwr, cpr, detergent, fsma), grouped by industry. The derivation logic is a browser-safe core `scripts/en18223/derive-core.ts` (shared by the CLI and the demo) plus Node IO in `scripts/en18223/node-io.ts`; the range index, the OpenEPCIS contexts, and the product samples are generated from the repo sources by `scripts/build-en18223-demo-data.ts` and bundled, so the demo runs offline.

### Changed
- The EN 18223 attribute names are now the JSON keys via the dpp-core context: `digitalProductPassportId`, `granularity`, `dppStatus`, `lastUpdated`, `dppSchemaVersion`, `facilityId`, `contentSpecificationIds` (`economicOperatorId` and `uniqueProductIdentifier` were already aligned).
- `oec:granularityLevel` and `oec:passportStatus` are now string-valued (EN 18223 enumeration/String); `oec:GranularityLevel` (model/batch/item) and `oec:PassportStatus` are retained as informative value lists.
- `oec:granularity` (BatteryPass per-attribute reporting granularity) renamed to `oec:reportingGranularity`, freeing the `granularity` key for the EN 18223 passport-level attribute. `oec:ProductClass` granularity value renamed to `oec:Model` (with GS1 Digital Link AI derivation: 01 model, 01+10 batch, 01+21 item).
- Provenance on the passport status/version terms moved from standards-reseller URLs to "EN 18221:2026 / EN 18222:2026 / EN 18223:2026 (CEN/CENELEC JTC 24)" citations.
- Battery: `dppStatus` aligned to the string `oec:passportStatus`; the SHACL status shape updated to match.

### Removed
- Duplicate `oec:lastUpdate` and `oec:passportLastModified` consolidated into `oec:lastUpdated` (EN 18223 `lastUpdated`).
- `oec:Updated` passport status (the `lastUpdated` timestamp conveys it; the `"Updated"` JSON token now aliases to `oec:Active` in bridge contexts).
## 0.9.6 — Refurbishment / remanufacturing cross-cutting (2026-05-07)

### Added
- `oec:remanufacturingDate` (datatype, `xsd:dateTime`, domain `schema:Product`) — covers
  ESPR 2024/1781 Annex II durability / re-use information across sectors (rail rolling
  stock, batteries, electronics, textiles). Anchored via `rdfs:seeAlso` to the upstream
  GS1 Rail term `rail:itemReconditioningDate`.
  - The new `extensions/common/interop/context/rail-bridge-context.jsonld` aliases the
    rail term to this dpp term so EPCIS events can be authored in either vocabulary.

## 0.9.5 — CIRPASS-2 see-also pointers + GS1 CBV anchoring (2026-05-04)

### Added
- New prefix declarations in `dpp-core.ttl`:
  - `cirpass2:` → `https://w3id.org/eudpp#` — CIRPASS-2 pilot programme ontology proposal. Reference-only; the W3ID redirect target currently returns 404 in a browser. CIRPASS-2 is one input into JTC 24, **not** a finalised EU standard.
  - `cbv:` → `https://ref.gs1.org/cbv/` — GS1 Comprehensive Business Vocabulary (EPCIS code lists).
- `rdfs:seeAlso cirpass2:*` pointers on cross-cutting `oec:` classes (no `rdfs:subClassOf`, no `owl:equivalentClass` against `cirpass2:`):
  - `oec:OperatorInformation` → `cirpass2:Actor`, `cirpass2:LegalPerson`, `cirpass2:ManufacturerRecord`
  - `oec:DueDiligenceReport` → `cirpass2:ComplianceDeclaration`
  - `oec:CircularityPerformance` → `cirpass2:CircularEconomyIndicator`
  - `oec:HazardousSubstance` → `cirpass2:Substance`
  - `oec:DocumentReference` → `cirpass2:DigitalInstruction`
  - `oec:RecycledContent` → `cirpass2:RecycledMaterialsUse`
  - `oec:FacilityInformation` → `cirpass2:Facility`
  - `oec:SubstanceOfConcern` → `cirpass2:SubstanceOfConcern`
  - `oec:PerformanceInfo` → `cirpass2:Durability`, `cirpass2:Reliability`
  - `oec:RepairabilityInfo` → `cirpass2:Reliability`, `cirpass2:Durability`
  - `oec:EmissionsPerformance` → `cirpass2:CarbonFootprint`, `cirpass2:EnvironmentalFootprint`
  - `oec:OperatorRole` → `cirpass2:EconomicOperatorRole`
- GS1 CBV (Comprehensive Business Vocabulary) explicit anchoring on `oec:PassportStatus` enum values:
  - `oec:Active rdfs:seeAlso cbv:Disp-active`
  - `oec:Withdrawn rdfs:seeAlso cbv:Disp-recalled`

### Notes
- CIRPASS-2 anchors are intentionally see-also-only. Reasons:
  CIRPASS-2 is a pilot deliverable (not a finalised EU standard); the
  published namespace IRI `https://w3id.org/eudpp#` doesn't currently
  dereference (404 via the W3ID redirect); and the CIRPASS-2 classes
  are typically broader than ours (e.g. `cirpass2:Actor` covers
  regulators / consumers, not just economic operators). Stronger
  formal claims would over-state the relationship.
- Battery / EUDR / Textile / Electronics cascade through these
  dpp-core pointers via property domain/range; no module-side TTL
  changes needed.
- See [`extensions/common/interop/docs/STANDARDS_ALIGNMENT.md`](../interop/docs/STANDARDS_ALIGNMENT.md)
  and [`CIRPASS2_ALIGNMENT.md`](../interop/docs/CIRPASS2_ALIGNMENT.md)
  for the full mapping rationale.

## 0.9.5 — SEMICeu Core Vocabularies anchoring (2026-05-04)

### Added
- New SEMICeu Core Vocabulary `@prefix` declarations in `dpp-core.ttl` — `cv:` / `cccev:` (`http://data.europa.eu/m8g/`), `locn:` (`http://www.w3.org/ns/locn#`), `adms:` (`http://www.w3.org/ns/adms#`), `cpsv:` (`http://purl.org/vocab/cpsv#`), `org:` (`http://www.w3.org/ns/org#`), `foaf:` (`http://xmlns.com/foaf/0.1/`).
- Upward anchors on cross-cutting `oec:` classes:
  - `oec:OperatorInformation` → `rdfs:seeAlso legal:LegalEntity` (EU Core Business peer; **not** owl:equivalentClass — see below).
  - `oec:DueDiligenceReport` → `rdfs:subClassOf cccev:Evidence` + `rdfs:seeAlso cccev:Requirement` (a DDR is a specific kind of CCCEV Evidence; CCCEV is the EU upstream of UNTP's conformity model).
  - `oec:FacilityInformation` → `rdfs:seeAlso locn:Location` (EU Core Location peer; `locn:Address` and `locn:Geometry` carry the structured sub-parts).
  - `oec:DocumentReference` → `rdfs:seeAlso foaf:Document` (used by SEMICeu CPOV for contact pages and homepages).
- `skos:note` blocks updated to explain the SEMICeu anchors and when each peer is preferable.

### Anchor strength — design note
The strongest formal claim that actually holds is preferred:

- `oec:OperatorInformation` ↔ `legal:LegalEntity` is `rdfs:seeAlso` only. The two extensions **overlap but neither contains the other**: legal:LegalEntity includes charities / non-profits that are not ESPR operators, and ESPR operators include sole proprietors that some Member States classify as natural persons rather than legal entities. seeAlso is the strongest claim that's universally true; subClassOf and equivalentClass would both over-claim.
- `oec:DueDiligenceReport` ↔ `cccev:Evidence` is `rdfs:subClassOf`. Every DDR is evidence, but cccev:Evidence is far broader (test reports, certificates, audit logs, attestations) — subsumption holds, equivalence does not.

### Notes
- No `oec:` terms removed in this pass. Anchors only — JSON-LD payloads continue to round-trip identically. The bridge context at `extensions/common/interop/context/semic-core-bridge-context.jsonld` lets consumers compose payloads using SEMICeu IRIs directly when preferred.
- See `extensions/common/interop/docs/SEMIC_CORE_VOCABULARIES.md` for the full mapping rationale.

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

Extension terms that duplicated GS1 / schema.org were removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Removed (use canonical term instead)

- `oec:documentTitle` → `schema:name`
- `oec:materialName` → `schema:name`
- `oec:productModel` → `schema:ProductModel`
- `oec:regulatoryReferenceNumber` → `gs1:regulatoryReferenceNumber`
- `oec:schemaVersion` → `schema:schemaVersion`
- `oec:sourceCountry` → `gs1:countryOfOrigin`
- `oec:sparePartsDeliveryTime` → `schema:deliveryTime`
- `oec:status` → `schema:status`
- `oec:substanceName` → `schema:name`
- `oec:uniqueProductIdentifier` → `gs1:productID`
- `oec:validUntil` → `schema:validUntil`
- `oec:vatIdentificationNumber` → `schema:vatID`

## [0.9.5] - 2026-04-15 (GS1 Standards Week preparation)

### Added
- **ITIP (Individual Trade Item Piece) support** aligned with GS1 ITIP (AI 8026):
  - `oec:IndividualTradeItemPiece` class
  - `oec:tradeItemPieceCount` (positiveInteger) on `gs1:Product`
  - `oec:tradeItemPieceNumber`, `oec:tradeItemPieceOf`, `oec:tradeItemPieceDescription`
  - Maps to GS1 AI 8026 (GTIN + total piece count + piece number)
  - Usable across modules; first example in `textile/examples/garment-set-itip.jsonld`
- `oec:tradeItemPieces` container property in the JSON-LD context

### Changed
- JTC 24 standards references updated from "prEN" to "EN" for the six
  standards now at FprEN stage (EN 18216, 18219, 18220, 18221, 18222,
  18223). Remaining prEN references preserved for prEN 18239 and prEN
  18246 (still in development).

### Notes
- Version remains v0.9.5; project has not yet had a formal release.
  Dated entries track ongoing development within the v0.9.5 preview.
- Additions are reference patterns aligned with active GS1 standardization; may evolve as it settles.

## [0.9.5] - 2025-02-02

### Initial Release

OpenEPCIS DPP-Ready v0.9.5 - First official public release.

**Standards Alignment:**
- GS1 Web Vocabulary (native foundation)
- UN Transparency Protocol (UNTP) alignment via `owl:equivalentProperty`
- EU ESPR 2024/1781 full coverage

**Key Classes:**
- `OperatorInformation` - Economic operator data (EOID per ESPR Article 77)
- `FacilityInformation` - Manufacturing/processing facility (UNTP Facility equivalent)
- `CircularityPerformance` - End-of-life, recycling metrics (UNTP aligned)
- `EmissionsPerformance` - Carbon footprint container (UNTP aligned)
- `TraceabilityPerformance` - Supply chain verification metrics
- `RecycledContent` - Pre/post-consumer recycled content
- `MaterialComposition` - Material tracking with CRM flags
- `SubstanceOfConcern` - SCIP database alignment
- `PerformanceInfo` - Durability and lifetime data
- `RepairabilityInfo` - Repair scores and spare parts
- `AccessRights` - ESPR Article 9 tiered access
- `DocumentReference` - Supporting documents (equivalent to gs1:ReferencedFileDetails)

**Key Enumerations:**
- `OperatorRole` - Manufacturer, Importer, Distributor, etc.
- `AccessLevel` - Public, AuthorizedOnly, Restricted
- `ProductCategory` - ESPR priority sectors
- `OperationalScope` - CradleToGate, CradleToGrave
- `GranularityLevel` - ProductClass, Batch, Item
- `HazardClass` - EU CLP Regulation categories
- `DocumentType` - Due diligence, certificates, reports

**UNTP Alignment:**
- 14 properties with `owl:equivalentProperty` declarations
- 4 classes with `owl:equivalentClass` declarations
- 0-1 decimal scale for all ratio/fraction properties
- Digital Facility Record (DFR) support via domain-free properties
- Digital Identity Anchor (DIA) support via `did` and `identityCredentialUrl`

**New in v0.9.5:**
- `activityClassification` - Industry codes (ISIC/NACE/NAICS) for DFR
- `did` - Decentralized Identifier for DIA
- `identityCredentialUrl` - Link to identity VC for DIA
