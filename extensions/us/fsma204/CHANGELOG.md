# Changelog — FSMA 204 module

All notable changes to the FSMA 204 extension are documented here. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
module adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
