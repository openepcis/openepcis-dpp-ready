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

Eight modules were then audited by the local model pipeline (`tools/vocab-sync`), whose confirmed
findings were triaged, reviewed by hand, and applied: fsma204, ppwr, cpr, iron-steel, detergent,
eudr, electronics and textile. The pipeline pass for `common/core` and `eu/battery` is outstanding
and lands in a later version; both are covered by the direction sweep above, with 51 and 52
corrections respectively.

The review is deliberately not fully automatic. Six panel-confirmed proposals in textile alone were
refused on documented evidence: a GS1 term scoped to `FoodBeverageTobaccoProduct`, two directions
the project had already recorded as intentional, an `exactMatch` our own bridge documentation calls
Partial, and four instruction mappings from a free-text overflow field. Findings a curator declined
are recorded with their reasons in
[`docs/skos-alignment/OPEN_DECISIONS.md`](docs/skos-alignment/OPEN_DECISIONS.md), which also counts
the 87 assertions where the pipeline's two stages contradict each other. The loop is documented in
[`docs/skos-alignment/REVIEW_LOOP.md`](docs/skos-alignment/REVIEW_LOOP.md).

### Five new guards, each for a class of error that had reached the repository

Every one was written after finding real instances, not in anticipation:

| Guard | Catches | Found |
|---|---|---|
| `check:extension-terms` | a reference to a project-owned CURIE that no ontology defines | 124 phantom IRIs, including `oec:dppStatus` in six product seeds |
| `check:operational` rules d, e, f | an EPCIS example on the wrong context chain, prefixing wrong in either direction, a lossy organization record | all 47 EPCIS examples, 7 organization records |
| `check:mappings` rules 3b, 3c, 4, 6 | property mapped to a class, batch identifier under an item-scoped one, self-reference, inverted direction | 3 iron-steel batch identifiers under `schema:serialNumber`, 6 mappings hidden behind angle-bracket IRIs |
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
