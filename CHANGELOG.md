# Changelog

Cross-cutting changes to OpenEPCIS DPP-Ready. Each module keeps its own changelog with the
detail; this file records what a release means for the repository as a whole and links onward.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Modules are
versioned together and share the version in [`package.json`](package.json); `pnpm run
check:release` verifies that every place recording a version agrees.

## [Unreleased]

### Object properties adopt the `has*` naming convention

All 301 object properties across the project-owned namespaces (`oec:`, `eubat:`, `eutex:`,
`euelec:`, `eudr:`, `eudet:`, `eucpr:`, `euppwr:`, `eusteel:`, `usfsma:`) now carry the
`hasXyz` form (`oec:materialComposition` → `oec:hasMaterialComposition`); datatype
properties keep the GS1/schema.org bare-noun style, inverse-style names (`oec:tradeItemPieceOf`)
stay, and the upstream `rail:` mirror is untouched. The sweep covers ontologies, contexts,
overrides, examples, EPCIS events, SHACL shapes, schemas, docs and demo bundles; EN 18223
bare keys follow the local names by construction. One latent collision surfaced and was
resolved: the boolean `eutex:hasTakeBackProgram` became `eutex:takeBackProgramAvailable`
so the take-back programme node property could take the conventional name. Deployed demo
passports still carry the old keys until re-seeded (`seed-dev-passports --reset`).

### `bpr:` shrinks to its longlist-only scope

GEFEG BatteryPass-Ready and the TNO AAS→RDF modules on the CIRPASS-2 hub are renderings of
the one Battery Pass Consortium data model (GEFEG's canonical repo is the Consortium repo;
the TNO modules are machine-generated conversions, `prov:` AasRdfConverter 0.2.0). The
OpenEPCIS-hosted `bpr:` mirror therefore returns to the scope its documentation always
claimed: the DPP-information attributes with no SAMM equivalent plus the four flat
lossless-carrier keys of the bridge context — 8 properties and the `dppStatusCodes`
scheme instead of 124 nodes. 150 of the 157 `battery.ttl` mappings into the mirror were
removed (the Consortium SAMM URNs carry them); 6 terms whose only graded anchor was the
mirror got their SAMM mapping directly. The outbound bridge context's four dangling
camelCase `bpr:` IRIs now point at the real PascalCase terms. The GEFEG conformance
pipeline (schemas + exporter, 23/23) is unaffected — it never used `bpr:`.

### CIRPASS-2 EUDPP v2.0.5 integrated

The EUDPP Core Ontology (v2.0.5, 2026-07-06, ten modules, IRIs now dereferencing) is
covered across the board: 42 new `rdfs:seeAlso cirpass2:` pointers on existing terms, and
new `oec:` terms for the genuine gaps — `hasBackupCopyHost` (ESPR Art. 10(4)),
`isEnergyRelated`, the substance-identity set (`socThreshold`, `iupacName`,
`substanceTradeName`), the conformity framework (`UnionHarmonisationLegislation` +
`assignedELI`, `HarmonisedStandard`, `CommonSpecification`, `ConformityAssessmentModule`
with the Decision 768/2008 modules A–H1), the ESPR Annex I environmental parameters
(`waterConsumption`, `landUse`, `materialFootprint`, `wasteGenerationAmount`,
`packagingWasteAmount`, `productToPackagingRatio`, `recoverableRate`,
`recyclingCollectionRate`) and `productCategoryRules`. The EVENT module (Draft 0.1.0) is
deliberately NOT mirrored: its ESPR activities are vocabulary by their own definitions, so
they land as CBV values (`oec:BizStep-maintaining`/`-refurbishing`/`-remanufacturing`/
`-upgrading`, `oec:Disp-available_on_market`; CBV absence verified content-based
2026-08-06) and the carrier layer is answered by the real EPCIS/CBV IRIs. Full analysis in
[CIRPASS2_ALIGNMENT.md](extensions/common/interop/docs/CIRPASS2_ALIGNMENT.md).

The full EUDPP term set is browsable on ref.openepcis.io: the ontology is mirrored as a
Layer-2 upstream module ([`extensions/upstream/cirpass2-eudpp/`](extensions/upstream/cirpass2-eudpp/README.md),
upstream v2.0.5, ten modules incl. LCA, 465 declared terms, regenerated with
`pnpm run sync:eudpp`) — the same pattern as the GS1 Rail mirror, and the template for
further upstream profiles (e.g. the IDTA AAS submodel templates). Upstream IRIs are
preserved verbatim; our ontology still references them by IRI, no `owl:imports`.
Upstream license Apache 2.0 (CC BY 4.0 fallback as a document).

The 2026-08-06/07 vocab-sync rounds then graded the alignment across **all** modules
against the EUDPP-extended upstream index (4407 terms): 79 panel-confirmed SKOS mappings
applied — core 30, battery 13, textile 23 (incl. the nine specific EUDPP footprint
subconcepts under `eutex:EnvironmentalFootprint`), electronics 4, eudr 1, detergent 4,
ppwr 1, cpr 3, iron-steel 3; fsma204 clean. Twelve panel proposals were declined by a
curator with reasons in `scripts/skos-deferred.json` (entity-vs-constraint,
entity-vs-classifier, referent and cross-sector-peer errors), and the triage gained two
permanent structural-carrier guards (`m8g:hasValue`/`supportsValue`,
`eudpp:hasProperty`). QA panels ran locally (qwen3-32b); the provenance trail spans all
rounds. New `check:mappings` rule "object-property-naming" enforces the `has*` object-
property convention from now on (documented in
[docs/VOCABULARY_LAYERING.md](docs/VOCABULARY_LAYERING.md)).

### The official EU battery data-point list becomes a hosted registry

The European Commission's guidance "Digital Batteries Passport — data points by category"
(v1.0, July 2026, Ares(2026)7579758) enumerates the 71 Battery Passport data points with legal
source and per-category applicability as of February 2027. The battery module now mirrors it as
an OpenEPCIS-hosted vocabulary (`ec-battery-passport-guidance/1.0`, generator
`build:ec-guidance-vocab`), dual-typed `rdf:Property` + `cccev:InformationRequirement`, with the
static/dynamic split, Article 77(2) access tiers and applicability matrix machine-readable, and
`rdfs:seeAlso` back-references from 87 `eubat:` terms. Coverage is complete: all 71 data points
resolve to existing terms. Details in the
[battery changelog](extensions/eu/battery/CHANGELOG.md).

### A readiness checker against the official EU list

[`demos/ec-readiness-checker`](demos/ec-readiness-checker/) (browser, `pnpm run
demo:ec-readiness`) and `pnpm run check:ec-readiness` (CLI) evaluate battery passport JSON-LD
against the 71 EC guidance data points: per category and reference date, each data point comes
back fulfilled / missing / condition-to-check / not-yet-required (act outstanding) /
not-to-be-filled, with the carrying terms as evidence and, for the dynamic Annex XIII 4 points,
the EPCIS event example that serves them. Shared core in `scripts/lib/ec-readiness.ts`; a
structural coverage check, complementary to SHACL/JSON Schema. Exercising it against the
examples surfaced that data point 67 (battery status) is operatively carried by `schema:status`
— the registry now records both the property and the `eubat:BatteryStatus` enum class.

### The applicability matrix becomes executable SHACL

`build:ec-guidance-vocab` additionally emits
[`validation/ec-readiness-shapes.ttl`](extensions/eu/battery/validation/ec-readiness-shapes.ttl):
one node shape per (data point, category) targeting `eubat:Battery`, statuses mapped to
severities (mandatory = `sh:Violation`, conditional = `sh:Warning`, optional/pending =
`sh:Info`), the guidance wording in `sh:message` and the registry IRI in `rdfs:seeAlso` — the
official checklist executable by ANY SHACL engine, not just our checker. The anchor paths
(`technicalSpecifications/ratedCapacity`, `manufacturer/address`, …) are derived from the
ontologies' `rdfs:domain` declarations via BFS over the object-property graph, so the shapes
stay correct as the ontology evolves. `check:ec-readiness --shacl` runs rdf-validate-shacl over
them, activating one category's shapes and folding the model/batch/item Digital Link hierarchy
into a single focus node — the RDF mirror of "a finer passport resolves coarser data up the
hierarchy". SHACL's graph precision immediately paid for itself: data points 31 and 36 gained
their second carriers (`eubat:expectedCycleLife`, `eubat:roundTripEfficiency`) that the
key-scanning structural check had papered over.

The browser demo runs the same engine client-side: an "Engine" switch toggles between the
structural matrix walk and rdf-validate-shacl over the bundled shapes (contexts bundled, unknown
context URLs fetched — ref.openepcis.io serves CORS), rendering both into the same checklist.
The environment-neutral core lives in `scripts/lib/ec-readiness-shacl-core.ts`; the Node wrapper
keeps the filesystem/documentLoader IO. The date picker gained regulatory-milestone chips and a
timeline (guidance v1.0 publication, passport-duty start 2027-02-18, the selected reference date
as a moving marker) with a note that the carbon-footprint and instructions-for-use data points
remain blocked on the pending implementing act / Omnibus IV. The shapes and the applicability
matrix are published as battery-module artefacts on ref.openepcis.io
(`extensions/eu/battery/ec-readiness-shapes.ttl`, versioned copies included), and the shapes
graph IRI is that hosted URL, so the document self-dereferences.

### Battery SKOS audit re-run after the EC registry landed

A fresh `vocab-sync audit --module battery` (2026-08-04, QA panel qwen3.5-27b, 1180 findings)
followed the review loop: triage produced 74 APPLY / 154 HOLD / 952 SKIP; two panel-confirmed
proposals were rejected on reading the targets' definitions and recorded as `seeAlso` decisions
in `mapping-allowlist.json` (`eubat:ThirdPartyVerification` vs the ENERGY-STAR value enumeration
— a value list, not a verification concept; `eubat:BatteryChemistry` vs `schema:ChemicalSubstance`
— an electrochemical system is not a portion of matter). The remaining 72 were written: 2
direction flips and 70 graded mappings, mostly upgrading existing `rdfs:seeAlso` pointers toward
BatteryPass SAMM / DPP Keystone / GEFEG targets. `cv:Event` was dereference-verified and added to
`semiceu-terms.json` (target of the new `eubat:NegativeEvent` anchor). Known gap: the audit's
upstream index does not yet contain the EC guidance registry, so the 92 `rdfs:seeAlso` pointers
to `ecbp:dp-*` were not graded — a vocab-sync index addition, tracked as follow-up.

### Dead external references fixed (link audit across all 1079 mapping targets)

A live sweep of every external URI referenced from the module ontologies found three genuine
defects (the rest of the non-200s are bot-protection false positives on ISO/OECD/ECHA/gs1.org):
`eutex:energyUsage` declared the phantom range `oec:EnergyKilowattHours` (no such core term —
now `gs1:QuantitativeValue`, as its own comment prescribes); `oec:conformityDeclaration` carried
`skos:closeMatch untp:conformityClaim`, which has been removed from the published UNTP
vocabulary (403 on both hosts — downgraded to `rdfs:seeAlso untp:ConformityAttestation`, the
nearest surviving concept, without a subsumption claim); and the battery module's OECD due
diligence guidance link used a pre-restructure oecd.org URL (now the stable DOI
`10.1787/9789264252479-en`). The GS1 Rail namespace no longer dereferences at all — handled on
ref.openepcis.io by routing rail term links to the mirrored in-app module pages.

## [0.9.9] - 2026-08-04

### PPWR becomes a full downstream-consumable module; cpr wired alongside

The `ppwr` and `eucpr` modules existed with complete ontologies, contexts and examples but were
absent from the `MODULES` list of `scripts/build-extension-schemas.ts` — and that script's
manifest (`scripts/out/extension-schemas.manifest.json`) is the only thing the DDM passport
editor's vocab sync iterates, so neither module ever reached the app. Both are wired now and
ship generated `*.extension-schema.json` files.

PPWR itself gains the Article 12(2) reuse data card (`euppwr:ReuseInformation` with system
scope enumeration, system name, collection points, rotations — the one PPWR data set with no
upstream carrier) and a hand-written DPP document schema (`validation/ppwr-schema.json`) whose
single hard requirement is the Annex VIII EU declaration of conformity reference
(`oec:conformityDeclaration`), the only duty in force for all packaging from 2026-08-12;
labelling/grading/recycled-content data points carry their article citations as recommendations
until their 2028/2029/2030 application dates. Details in the
[module changelog](extensions/eu/ppwr/CHANGELOG.md).

## [0.9.8] - 2026-07-29

### The compressed form carries no prefix, and the environments can be checked against it

Three defects kept the served EN 18223 §5.2 payloads from being the bare-term form they are
defined to be, and none of them was visible to any existing gate.

**A missing alias leaks a prefix.** `compactOperational` falls back to a CURIE, or to a full IRI
when no prefix is known either, for any term the operational alias chain does not name. The chain
covered `oec:`, the modules and GS1, so three upstream classes leaked into the committed
artifacts: `schema:ImageObject`, `cccev:Evidence` and `cv:PublicOrganisation`. The generated
shortcut layers now declare both SEMICeu prefix spellings, the three classes are curated aliases
in their module's `.shortcut-overrides.json`, and the serializer resolves either spelling of the
`m8g` namespace. A new rule in `pnpm run check:operational` fails the build on any prefix left in
a compressed artifact, so the class of defect cannot come back silently.

**A stored language map read back as `null`.** The resolver stores a language-tagged literal as a
JSON-LD 1.1 language map, `{"en": "…"}`, not in the `{"@value","@language"}` form it was written
in. That only expands when the term declares `@container: "@language"`, which these contexts
deliberately do not: the container mangles a bare single value object into garbage, and 102 of
those appear in the committed artifacts alone. So the map expanded to an empty node and every
language-tagged field of a stored passport derived as `value: null`, across 20 properties.
`normalizeLanguageMaps` now rewrites the shape before expansion, on the JSON and the RDF path
alike. The test is shape-only and pinned by 11 cases in the golden-fidelity gate, because `id` is
also the ISO 639-1 tag for Indonesian and a looser rule reads every node reference in the master
data as a literal. Five textile/detergent properties and two `oec:` twins that carry
language-tagged prose while declaring `rdfs:range xsd:string` were corrected to `rdf:langString`.

**Published examples named a deployment.** 20 example files hardcoded `id.demo.epcis.cloud` and
`files.demo.epcis.cloud`, and the provisioner only substituted a host for three FLS-probe fields,
which is how dev came to serve passports whose own identity and document URLs named demo. The
examples are now environment-neutral (`https://id.gs1.org`, `https://files.example.org`) and the
seeding scripts rewrite both per environment through the shared
[`scripts/lib/seed-hosts.sh`](scripts/lib/seed-hosts.sh); the guard rejects a deployment host in
any published artifact.

**The environments are now checkable.** The offline gates say nothing about what a deployment
serves, and the two drift apart silently: an environment keeps serving whatever was last written
to it, so a vocabulary fix does not reach dev or demo until the catalogue is re-provisioned. That
is how both environments came to serve `oec:dppStatus` and `eubat:batteryCategory`, CURIEs for
terms renamed in this release, on both flagship passports at all three granularities, with every
guard green. `pnpm run check:env-passports -- --env=dev|demo` reads each provisioned passport and
fails on a CURIE, a `null` value or a foreign host, taking its catalogue from
`scripts/provision-demo.sh` so the two cannot diverge. It needs network and is not part of
`pnpm run build`; run it after provisioning.

The `openepcis-dpp-api` mirror (contexts, range index, OpenAPI contract) was synced and its
language-map port is covered by four tests in `En18223DeriverTest`.

**Both environments were re-provisioned** from the corrected seeds. That removed the stale
`oec:dppStatus` / `eubat:batteryCategory` CURIEs and all host drift, and it repaired the demo
catalogue's Alpine Pro Winter Jacket, whose passport had been answering `500`: its stored
`extensions` block had lost its `@context` and held 48 bare keys, so the service could not
resolve them. A freshly written record carries the `@context` and resolves. Six model-level
`gs1:traceability` links disappeared with the rewrite; those were the self-referential
`?linkType=gs1:traceability` entries that redirected to themselves, and the provisioner owns
the real ones at the granularities that have traceability data.

Releasing `openepcis-dpp-api` then exposed a second half of the alias defect, and a gap in
this repo's own checks. The service's `OperationalDictionary.PREFIXES` is a hand-maintained
Java copy of the TS `PREFIXES` map, and it did not know the SEMICeu `m8g` namespace. Because
the dictionary is keyed by the expanded IRI, the curated `cccev:Evidence` and
`cv:PublicOrganisation` aliases never expanded and never matched, so `term()` fell through to
`toCurie()`, which could not shorten those IRIs either: the deployed service kept shipping
raw `http://data.europa.eu/m8g/…` values while every mirror and resource check stayed green,
because the payload still expands to the right graph. `pnpm run check:dpp-api-en18223` now
parses that table and fails on any disagreement with the TS one, content and insertion order
alike — the order decides which CURIE the fallback emits when two prefixes share a namespace.
The service carries the matching guard, asserting that a compressed body containing
`schema:ImageObject`, `cccev:Evidence` and `cv:PublicOrganisation` comes out fully
bare-termed.

### The two serializations are separated

The design has always been that standard JSON-LD prefixes every vocabulary term, `gs1:` included,
and that bare unprefixed terms exist only in the compressed EN 18223 §5.2 form. The two had blurred:
all 47 EPCIS examples referenced an operational context, because the bare GS1 keys inside
`gs1:masterDataAvailableFor` needed alias layers that only the operational chain carried.

`dpp-core-context.jsonld` now gives `gs1:masterDataAvailableFor` a property-scoped `@context`, so
the ambient-GS1 rule inside the card works under the standard contexts. Every EPCIS example lists
the standard chain with the EPCIS base first, and the operational chain is once again exclusively
the EN 18223 compressed serialization. The switch was verified graph-identical by canonicalizing
all 47 files before and after. Detail in the
[core changelog](extensions/common/core/CHANGELOG.md) and
[`docs/EN18223_FORMATS.md`](docs/EN18223_FORMATS.md).

### SKOS mapping directions corrected across every module

`A skos:narrowMatch B` reads "B is narrower than A", which the specification states directly:
`skos:broader` relates a concept to one *more general* in meaning, and `skos:broadMatch` is a
sub-property of it. 174 assertions across eight modules used `narrowMatch` while pointing at a
general foundational term, asserting the reverse of their intent. They now read `skos:broadMatch`.

All ten modules were then audited by the local model pipeline (`tools/vocab-sync`), whose confirmed
findings were triaged, reviewed by hand, and applied. The two largest passes show the layering
working: `common/core` (878 findings, 95 applied) mostly anchors an `oec:` term as the broader one
against the peer profile that specialises it, and `eu/battery` (1182 findings, 130 applied) mostly
anchors into the BatteryPass SAMM model and DPP Keystone, the two community profiles that cover its
domain in detail.

The core pass also surfaced four assertions that had been inverted and invisible, because the
head-term list rule 6 checks did not contain their targets (`cv:Evidence`, `schema:name`,
`schema:measurementMethod`, `schema:validThrough`). That list now lives in
[`scripts/general-l1-terms.json`](scripts/general-l1-terms.json) and the triage reads the same one,
so a proposal that would reintroduce the inverted direction is held rather than applied. Without
that, 47 further `narrowMatch` proposals from the core panel had nothing checking them.

The review is deliberately not fully automatic, and 28 panel-confirmed proposals were refused on
documented evidence rather than taste. Textile alone accounts for six: a GS1 term scoped to
`FoodBeverageTobaccoProduct`, two directions the project had already recorded as intentional, an
`exactMatch` our own bridge documentation calls Partial, and four instruction mappings from a
free-text overflow field. Battery accounts for twelve, among them six claiming a metal-specific
recycled share is broader than BatteryPass's generic one, which is inverted. Findings a curator declined
are recorded with their reasons in
[`docs/skos-alignment/OPEN_DECISIONS.md`](docs/skos-alignment/OPEN_DECISIONS.md), which also counts
the 87 assertions where the pipeline's two stages contradict each other. The loop is documented in
[`docs/skos-alignment/REVIEW_LOOP.md`](docs/skos-alignment/REVIEW_LOOP.md).

### 31 value spaces no longer mapped onto the classes of things they classify

A closed list of codes and the class of things those codes classify sit at different levels, so no
graded SKOS relation between them holds in either direction. `eudet:ProductForm` was not broader
than `gs1:Product`, and `eucpr:ConstructionProductType` was not narrower than
`dppk:BatteryProduct`. All 31 such assertions across eight modules now use `rdfs:seeAlso`, which
carries the pointer without the claim. The graded mapping of a value space belongs on another value
space, as `eudet:DetergentCategory` already did with `skos:broadMatch schema:CategoryCode`.

`check:mappings` rule 7 covers the pattern, and it runs **before** the direction rule: at different
levels the question of which term is narrower does not arise, and the direction rule advised
flipping to `broadMatch`, which only mirrors the confusion. That ordering is why the family stayed
hidden. Six of the pairs were parked on the mapping allowlist as "type mapped to the entity class",
which silenced the guard on the schema.org side of each pair while the `gs1:Product` twin of the
same assertion went unchecked, because `gs1:Product` was not among the guard's head terms even
though GS1 is the vocabulary the layering rule consults first. Those six allowlist entries are gone.

One pair contradicted our own documentation: `CIRPASS2_ALIGNMENT.md` records
`oec:OperatorRole` to `cirpass2:EconomicOperatorRole` as an "enum-vs-class shape difference; pointer
only", and the ontology asserted `skos:exactMatch` next to the `rdfs:seeAlso` that was already the
pointer.

### Upstream refreshed, and the two things it changed

The audit pipeline's own copy of the upstream vocabularies was from 29 April (GS1, schema.org) and
late June (SEMICeu), while the guard snapshot and the vendored vocabulary were current. It is
refreshed now, and the delta is recorded in
[`docs/skos-alignment/skos-upstream-delta-2026-07-29.json`](docs/skos-alignment/skos-upstream-delta-2026-07-29.json):
GS1 gained 5 terms, schema.org was unchanged, and four SEMICeu `m8g` definitions changed.

Both halves were checked rather than assumed:

- The four changed SEMICeu definitions (`Evidence`, `PublicOrganisation`, `openingHours`,
  `processingTime`) **confirm** the mappings we already had. `cv:Evidence` now reads "Proof that a
  Requirement is met", which is exactly why `oec:DueDiligenceReport` and `oec:conformityDeclaration`
  are the narrower terms against it. No change was needed.
- Four of the five new GS1 terms are the structure `oec:activityClassification` has been
  approximating with a single string: `gs1:organizationClassification` links an organisation to a
  `gs1:OrganizationClassificationDetails` carrying `gs1:organizationClassificationID` and
  `gs1:organizationClassificationType`. The layering rule says a term upstream has since covered gets
  redone or strong-anchored, so it is anchored `skos:closeMatch` with the GS1 shape named in its
  `skos:note`. The fifth, `gs1:epcisRepository`, this project already adopted.

A re-audit of `common/core` against the refreshed cache then found **nothing further to apply**,
which is the outcome that makes the delta safe to close.

### Downstream artefacts and the AI knowledge index

Two places consume the ontologies, and both had a gap that this release closes.

`build-json.ts` emitted the four `*Match` relations and `rdfs:seeAlso` but not
`skos:broader` / `skos:narrower`, so the four within-scheme hierarchies introduced above existed in
the TTL and were invisible everywhere downstream. They are emitted now, and
[ref.openepcis.io](https://ref.openepcis.io) renders them as their own "same vocabulary" rows,
labelled apart from `broadMatch` because one is an internal hierarchy and the other an upstream
alignment. They stay out of the cross-vocabulary alignment index on purpose: that index measures
how far a term reaches into *other* vocabularies.

The AI assistant grounds its term chat on these same generated documents, bundled on its classpath
under `term-knowledge/`. `TermKnowledgeIndex`'s own comment says "the build/sync step writes it",
and that step did not exist, so the corpus had drifted three days behind and still carried
`gs1-masterdata`, the parallel namespace this repository retired when GS1 identity moved upstream.
`pnpm run check:ai-knowledge` and `sync:ai-knowledge` own it now, and treat the two directions
differently: a corpus vocabulary whose source this repo no longer produces is an error, because the
AI would keep grounding on a retired namespace, while a module this repo publishes that the corpus
omits is a note, since `rail` and `served-fields` are deliberately absent and match the browser's
`RESOLVER_VOCABS`, which gives neither a chat.

One thing the sync cannot do for you: the OpenSearch vector index is only rebuilt when
`AI_REINGEST=true` on the first boot, because `TermCorpusIngestor` skips ingestion whenever
`term-knowledge-vectors` is already populated. A plain redeploy serves embeddings of the old corpus.
The sync prints that reminder rather than assuming it.

### The remaining 224 mapping directions, worked through in blocks

`OPEN_DECISIONS.md` still listed 224 `skos:narrowMatch` assertions as needing a curator. They were
worked through pair by pair against the definitions, and **175 were settled**; 49 remain, each one a
deliberate keep rather than an open question.

The definitions came from sources already on this machine: the BatteryPass SAMM reference in
`extensions/eu/battery/vocab/`, the refreshed GS1 and schema.org caches, and, for DPP Keystone, the
local checkout the audit pipeline is already configured against. Its ontology files are JSON with
comments and `{{VERSION}}` placeholders, so a plain parser rejects them; stripping both yields 448
dppk terms with real labels and definitions, which is what made the dppk pairs decidable rather than
guessable.

The decisions follow the same handful of principles throughout, and every one of them is visible in
the resulting relation:

- **A container and one of its fields** is component-to-whole, so `rdfs:seeAlso`. That covers
  `oec:recycledContentDetails` against nine individual pre- and post-consumer values, and the
  carbon-footprint declarations against the figures they carry.
- **Our term qualified, theirs not** means ours is the narrower one, so `skos:broadMatch`:
  `eubat:anodeActiveMaterial` against DPP Keystone's whole `materialComposition`,
  `eusteel:meltAndPourCountry` against UNTP's `countryOfProduction`,
  `eubat:cadmiumSymbolRequired` against the longlist attribute covering cadmium *and* lead.
- **Different axes** get `rdfs:seeAlso`, however close the names look:
  `euelec:screenResolutionHeight` is pixels where `schema:height` is a length,
  `eubat:stateOfChargeLevel` is the measurement parameter where `dppk:stateOfCharge` is the state,
  `eutex:weavingFacility` is a place where `dppk:facilityId` is an identifier.
- **The same concept in two words** gets `skos:closeMatch`, as with `eubat:hazardImpact` against
  `dppk:hazardousSubstancesImpact`.

`skos:narrowMatch` is now 49, down from 504 before this release began; `skos:broadMatch` is 586 and
`rdfs:seeAlso` 1120. `check:mappings` caught one of these very edits: setting the SAMM side of
`eubat:safetyInstructionsForDismantling` to `broadMatch` while its `bpr:` twin still read
`narrowMatch` tripped rule 11, which is the rule doing exactly what it was written for.

Three findings came out of the reading rather than the counting. `eubat:nickelRecycledShare` pointed
at `bpr:RenewableContentShare`, and renewable content is not recycled content. `eutex:environmentalFootprint`
pointed at `dppk:carbonFootprintGeneralInfo`, whose definition is explicitly battery-scoped. And
`dppk:facilityId` carries its definition in Bulgarian upstream, which is worth reporting to that
project rather than working around.

### 91 mapping directions settled by evidence rather than left open

The remaining `skos:narrowMatch` assertions were listed as a curator's problem, 275 of them, on the
grounds that which of two terms is narrower is a per-term modelling question. That was too quick.
Four subsets were decided from the definitions we already hold locally, and each subset turned out
to follow one principle:

- **13 inverted the layering.** A module term claimed to be broader than a `oec:` common-core term.
  Core is Layer 3 and the modules Layer 4: a module defines what is unique to one regulation and
  anything cross-cutting moves down, so a module term is the narrower one by construction. Two of
  the thirteen sat directly under a comment in `electronics.ttl` reading "Anchor
  electronics-specific cross-cutting concepts upward to the lifted `oec:` terms". Rule 10.
- **30 in the recycled-content family contradicted each other.** `eubat:cobaltRecycledShare` claimed
  to be both broader than BatteryPass's `postConsumerShare` and narrower than DPP Keystone's
  `postConsumerRecycledContent`, the same concept in two profiles, and the cobalt and lithium terms
  disagreed with each other about the same target. One principle settles it: a metal-specific share
  is narrower than a generic recycled-content property, a phase-specific share is narrower than the
  generic phase, and a metal *total* against a generic *phase* is `rdfs:seeAlso`, because neither
  contains the other.
- **35 in the carbon-footprint family.** A stage figure and a per-stage figure are the same
  granularity, so `skos:closeMatch`; a stage against a total is component-to-whole, so
  `rdfs:seeAlso`; only the declaration container is genuinely broader. `oec:carbonFootprintRawMaterial`
  had been both broader than `carbonFootprint` and narrower than `batteryCarbonFootprint`, which are
  two names for the same figure.
- **13 pointed opposite ways at the two BatteryPass renderings.** The consortium SAMM model and the
  GEFEG longlist mirrored as `bpr:` describe one data model, and seven battery terms carried
  `broadMatch` toward the SAMM rendering and `narrowMatch` toward the `bpr:` one. Rule 11 rejects a
  term asserted both broader and narrower than one concept, compared on the normalised local name so
  it sees across vocabularies.

`skos:narrowMatch` is down from 275 to 224 and `skos:broader` appears for the first time, on the four
hierarchies that live inside a single namespace. What is left in
[`OPEN_DECISIONS.md`](docs/skos-alignment/OPEN_DECISIONS.md) is per-term work with no principle
behind it, plus the 87 places where the pipeline's two stages disagree.

One scan was deliberately **not** acted on. 322 terms carry both `rdfs:seeAlso X` and a graded
relation to the same `X`. That reads like an inconsistency and is the project's convention: the
pointer for a reader, the graded relation for a machine.

### 8 SKOS mapping relations that stayed inside one namespace

`broadMatch` and `narrowMatch` link concepts in *different* concept schemes; within one, SKOS uses
`skos:broader` / `skos:narrower`, or `rdfs:subPropertyOf` where a real subsumption holds. Eight
assertions mapped a term onto another term in its own namespace, and four were inverted as well.
`oec:isStrategicRawMaterial` claimed `oec:isCriticalRawMaterial` is the narrower one while its own
`rdfs:comment` records "Strategic ⊂ Critical".

Where a genuine hierarchy holds the relation is now `skos:broader`; where the relation is
component-to-whole, as with the carbon-footprint stage properties against the total, it is
`rdfs:seeAlso`, because neither SKOS nor RDFS has a relation for "component of". `check:mappings`
rule 9 rejects the shape.

This corrects an earlier reading recorded in this repository. 73 graded mappings point at
project-owned namespaces, and they were described as one family that the project rule sends to
`rdfs:seeAlso`. They are not: every module declares its own `owl:Ontology`, so the 65 cross-module
mappings are cross-scheme by SKOS's own definition and are correct as they stand. Only the 8 inside a
single namespace were wrong.

### 14 graded mappings onto a serialisation slot

`gs1:value`, `schema:value` and the min/max bounds carry a number or a string wherever a vocabulary
needs one. They denote no concept, so a subsumption claim against them says nothing, and the 14 that
existed contradicted each other: `oec:indicatorTotalValue` was broader than `schema:value` while
`eucpr:characteristicValue` was both narrower than it and broader than `schema:minValue`. All are
`rdfs:seeAlso` now, held there by `check:mappings` rule 8.

The two general value CLASSES are a different case, since they do denote something, and were flipped
rather than downgraded: `oec:MultiLanguageValue` is narrower than `schema:StructuredValue`, and
`eubat:TechnicalSpecification` than `schema:PropertyValueSpecification`.

The audit triage learned the same lesson from the subject side. The core panel proposed eleven
mappings making `oec:value` the broader term of every specific value property it could find, from
`rail:topValue` to `semic:hasValue`; the carrier filter had only ever looked at the target.

### New guards and rules, each for a class of error that had reached the repository

Every one was written after finding real instances, not in anticipation:

| Guard | Catches | Found |
|---|---|---|
| `check:extension-terms` | a reference to a project-owned CURIE that no ontology defines | 124 phantom IRIs, including `oec:dppStatus` in six product seeds |
| `check:operational` rules d, e, f | an EPCIS example on the wrong context chain, prefixing wrong in either direction, a lossy organization record | all 47 EPCIS examples, 7 organization records |
| `check:mappings` rules 3b, 3c, 4, 6, 7, 8, 9, 10, 11 | property mapped to a class, batch identifier under an item-scoped one, self-reference, inverted direction, value space over the things it classifies, graded mapping onto a serialisation slot, a *Match relation inside one namespace, a module term over a core term, one term asserted both broader and narrower than a concept | 3 iron-steel batch identifiers under `schema:serialNumber`, 31 value-space, 14 value-slot, 8 single-namespace and 91 direction assertions, 4 inversions the head-term list could not see, 6 mappings hidden behind angle-bracket IRIs |
| `check:golden-fidelity` | a compressed artifact with a relative IRI or a flattened node reference | the fixture drift that motivated it |
| `check:release` | version stamps that disagree | README.md at 0.9.6 with three modules missing from both tables |

`check:mappings` also became honest about its own blind spots: it could not see a CURIE inside a
`"""` literal, so a mapping whose subject block began after prose was invisible, and it recognised
only CURIE targets, so every `<https://schema.org/...>` mapping went unchecked.

### The dpp-api mirror is wired, and checked

`openepcis-dpp-api` bundles copies of the contexts and validation schemas this repo owns. iron-steel
was absent from the service's `ClasspathContextLoader` map entirely and two of its three context
layers were missing from the mirror, so the service could not derive an iron-steel passport at all
while every check still passed. `pnpm run check:dpp-api-en18223` now fails on a context layer the
loader does not name, and the service gained a test that walks its own map against the classpath.

### Release tooling

`pnpm run release -- --version x.y.z --write` stamps the version into `package.json`, the module
`VERSION` files, the ontologies' `owl:versionInfo` and `owl:versionIRI`, the changelog headings,
and the README and CLAUDE.md tables. `pnpm run check:release` runs as part of the build.
