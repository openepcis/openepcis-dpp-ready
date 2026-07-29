# Changelog

Cross-cutting changes to OpenEPCIS DPP-Ready. Each module keeps its own changelog with the
detail; this file records what a release means for the repository as a whole and links onward.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Modules are
versioned together and share the version in [`package.json`](package.json); `pnpm run
check:release` verifies that every place recording a version agrees.

## [Unreleased]

## [0.9.8] - 2026-07-29

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
