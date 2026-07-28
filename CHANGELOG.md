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

Not touched, and worth a decision of its own: 73 graded mappings point at this project's own
namespaces, where the project's rule sends cross-references to `rdfs:seeAlso` regardless of level.

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

### Five new guards, each for a class of error that had reached the repository

Every one was written after finding real instances, not in anticipation:

| Guard | Catches | Found |
|---|---|---|
| `check:extension-terms` | a reference to a project-owned CURIE that no ontology defines | 124 phantom IRIs, including `oec:dppStatus` in six product seeds |
| `check:operational` rules d, e, f | an EPCIS example on the wrong context chain, prefixing wrong in either direction, a lossy organization record | all 47 EPCIS examples, 7 organization records |
| `check:mappings` rules 3b, 3c, 4, 6, 7, 8 | property mapped to a class, batch identifier under an item-scoped one, self-reference, inverted direction, value space over the things it classifies, graded mapping onto a serialisation slot | 3 iron-steel batch identifiers under `schema:serialNumber`, 31 value-space and 14 value-slot assertions, 4 inversions the head-term list could not see, 6 mappings hidden behind angle-bracket IRIs |
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
