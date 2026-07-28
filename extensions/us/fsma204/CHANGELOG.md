# Changelog — FSMA 204 module

All notable changes to the FSMA 204 extension are documented here. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
module adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed: 1 value space no longer mapped onto the class of things they classify

A closed list of codes and the class of things those codes classify sit at different levels, so no graded SKOS relation between them holds in either direction. `usfsma:FoodTraceabilityList` (to `gs1:FruitsVegetables`) now use `rdfs:seeAlso`.

`check:mappings` rule 7 covers the pattern and runs before the direction rule, since at different levels the question of which term is narrower does not arise. Project-wide this corrected 31 assertions across eight modules; see the [root changelog](../../../CHANGELOG.md).

## [0.9.8] - 2026-07-29

### Changed
- The three CTE event examples and `examples/ftl-product.jsonld` list the standard context chain
  (EPCIS base, then `dpp-core-context`, then `fsma204-context`) in place of the operational
  context. Graph-identical; the mechanism is the property-scoped context on
  `gs1:masterDataAvailableFor` described in the
  [core changelog](../../common/core/CHANGELOG.md).
- `usfsma:foodTraceabilityListCategory` reads `skos:broadMatch schema:category` in place of
  `narrowMatch`: an FTL category is the narrower term. Confirmed by a
  `vocab-sync audit --module fsma204` run.

### Fixed
- The generated capture schema now carries `usfsma:foodTraceabilityListCategory`. The generator
  read terms from the module context alone, so a term the context only coerces was absent from the
  schema and an event carrying it failed validation.

## [0.9.7] — 2026-06-19

### Changed
- Renamed vocabulary prefix `fsma:` → `usfsma:` (alias only; namespace IRIs unchanged).
- Completed term governance: 100% `dcterms:source` + `skos:note` coverage.

## [0.1.0] — 2026-04-17

Initial preview release. Models the FDA Food Safety Modernization Act §204
Final Rule on Food Traceability (21 CFR Part 1 Subpart S) as a first-class
EPCIS 2.0 extension, sibling to the EU DPP modules under `extensions/eu/`.

### Added
- `usfsma:TraceabilityLotCode` — the canonical TLC concept (21 CFR 1.1315).
- `usfsma:CriticalTrackingEvent` abstract class with seven subclasses covering
  the FDA's defined CTEs: Harvesting, Cooling, Initial Packing, First
  Land-Based Receiver, Shipping, Receiving, Transformation.
- `usfsma:KeyDataElement` concept and properties for the KDEs each CTE must
  capture (21 CFR 1.1330–1.1345).
- `usfsma:FoodTraceabilityList` enumeration with the twelve FDA-defined
  categories of foods subject to the rule.
- JSON-LD context (`fsma204-context.jsonld`) that maps the TTL vocabulary
  to the short `usfsma:` prefix and enables bare-string values for enums.
- Reference master-data example (`examples/traceability-lot.jsonld`) —
  a leafy-greens product with its assigned TLC.
- Two EPCIS 2.0 event examples mapping FSMA CTEs to canonical EPCIS
  `ObjectEvent` patterns:
  - `epcis/harvest-cte.jsonld` (Harvesting CTE → `bizStep: commissioning`)
  - `epcis/receiving-cte.jsonld` (Receiving CTE → `bizStep: receiving`)
