# Changelog

All notable changes to the Interoperability module will be documented in this file.

## [Unreleased]

## [0.13.1] - 2026-11-11

### Changed

- `batterypass` (2.0.1): `dppSchemaVersion` is "2.0.1". New: `registeredTradeNameOrRegisteredTrademark`
  (`schema:legalName`, else the name), `thirdPartyServiceProvider` (`oec:hasBackupCopyHost`: party
  Digital Link, else name), `informationOnSourcesOfSpareParts` (website of a spare-part source or its
  contact), `informationOnAccidents` (incident report of the latest accident), `temperatureInformation`
  (`eubat:BatteryTemperature`), both ways (`lift/65-related.rq`, `lower/65-related.rq`). A resource
  without a MIME type gets its content type from the URL. The stationary inbound case now round-trips
  without OpenEPCIS shape violations.

## [0.13.0] - 2026-11-11

### Added: BatteryPass-Ready 2.0.1 crosswalk profile

- New profile `batterypass`: OpenEPCIS battery item passports convert to BatteryPass-Ready 2.0.1
  documents (the GEFEG JSON Schemas, vendored under `vendor/batterypass-ready/2.0.1`) and back: header,
  identifiers and product data, performance and durability, carbon footprint, materials and hazardous
  substances, circularity, due diligence, labels and conformity. Every lift output is checked against
  the schema of the battery's category; the document is read as RDF with the new
  `batterypass-ready-2.0.1-context.jsonld`. Cases: the EV, LMT and industrial battery examples and a
  stationary 2.0.1 document. What does not convert is listed in the README.
- The target JSON layer (`scripts/lib/crosswalk-target.ts`) takes a profile's own context and one
  schema per value of the document (`"context"`, `"schemaBy"`, `"typedStrings"`), besides the
  Registry's content specifications; its caches are per profile.

### Added: BatteryPass crosswalk profile for the older state; virtual handles

- New profile `batterypass-1.3`: the measured and tested battery values that BatteryPass (SAMM 1.2.x,
  BatteryPass-Ready v1.3) states flat convert to and from the battery state and performance test of
  `common/assessment`; all other statements are OpenEPCIS on both sides and travel unchanged. Cases:
  the EV battery example, and the BatteryPass v1.3 reference passport read through the bridge.
- Engine: virtual flat handles (`<urn:xw:v:…>`) and a reshape phase (`lower/reshape/*.ru` over the
  output). Shared entail and reshape updates (`shared/battery-*.ru`, `profile.json` `"updates"`) let
  the `eu-dpp` profile keep its battery rows unchanged; its lift output is identical to before.
- `cirpass2`: a report of another type in a sensor element that became a test execution is no longer
  left untyped in the output (it is not converted).

### Changed: crosswalk follows the third assessment wave

- `cirpass2`: EPD impact indicators and module values carry their measured value with an SI unit
  (`eudpp:hasMeasurementUnit`); the material circularity indicator and utility factor stay
  `eudpp:CircularEconomyIndicator`s. The textile environmental footprint is converted for the first
  time: an `eudpp:LCAStudy` whose LCIA category results quantify the EF 3.1 indicators
  (`eudpp:ind_EF_climateChange`, `ind_EF_waterUse`, …), its PEFCR as `dcterms:conformsTo`.
  A method of the publisher's own now comes back on the way back (the lowering rule never bound it).
- `keystone`: the footprint figures (`dppk:carbonFootprint`, `environmentalFootprint`, the classes,
  the benchmark percentages) and the material test certificate values (`dppk:mtcYieldStrength` …)
  convert to and from indicators and results; new round-trip case `keystone-mtc-in`. The DPP
  Keystone bridge context no longer aliases them.
- The UNTP, JTC 24 and CIRPASS-2 bridge contexts drop the aliases of the removed core terms.

### Removed: UNTP v0.6 terms from the UNTP bridge

`untp-bridge-context.jsonld` carried the scorecard model of the UNTP v0.6 drafts next to the v0.7.0
terms. UNTP v0.7.0 (2026-04-02) is the current release and no longer has these terms, so the bridge
drops them: `CircularityPerformance`, `EmissionsPerformance`, `TraceabilityPerformance`,
`FacilityRecord`, `CradleToGate`, `CradleToGrave`, `ProductClass`, `Batch`, `Item`,
`carbonFootprint`, `recycledContent`, `recyclableContent`, `declaredUnit`, `utilityFactor`,
`materialCircularityIndicator`, `verifiedRatio`, `primarySourcedRatio`, `operationalScope`,
`granularityLevel`, `circularityPerformance`, `emissionsPerformance`, `traceabilityPerformance`,
`circularityScorecard`, `emissionsScorecard`, `conformityClaim`, `dueDiligenceDeclaration`,
`materialsProvenance`, `materialName`, `isCriticalRawMaterial`. The v0.7.0 name
`materialProvenance` takes over from `materialsProvenance` (still `oec:hasMaterialComposition`).
No term changed its meaning; `check:context-compat` reports removals only.
`UNTP_MAPPING.md` and the UNTP section of `STANDARDS_ALIGNMENT.md` now describe v0.7.0 only.


## [0.12.0] - 2026-11-10

### Added: EU DPP Registry crosswalk profile

A third crosswalk profile, `eu-dpp`, converts passports to and from the Commission's DPP Registry
semantic data artifacts 1.0.0: the core passport header for every product passport, and the battery
data elements (identification, manufacturer, manufacturing place and date, category, status,
chemistry, substances, critical raw materials, label symbols, weight, capacities, voltages, power,
resistances, efficiencies, C-rates, lifetimes, cycles, state-of-health values, temperature range,
warranty, documents). The gate checks the target side with the Commission's own SHACL shapes (SPARQL
constraints included) and JSON Schemas, renders the JSON the Registry receives
(`lifted.eu-dpp.json`), and runs the Commission's 20 conformance examples: our check finds no wrong
form in them, and each passport among them goes down to OpenEPCIS and back (`conformance.txt`). Two
defects of the release are accepted (language tags need a region; a model identifier needs a batch
number); what the OpenEPCIS battery model cannot hold is listed in the crosswalk README. The engine
restores derived integer datatypes Oxigraph normalises; the offline loader resolves the Registry's
contexts from `vendor/eu-dpp` and inlines their chained `@import`, which JSON-LD 1.1 forbids.
The rows use the battery terms of 0.11.0 (`hasExpectedLifetime`, `hasRemainingRoundTripEfficiency`,
`hasSafetyMeasures` as a document on the end-of-life information, `hasDismantlingAndRemovalInformation`);
the Registry's current and remaining round-trip efficiency share one term, so lowering keeps the
remaining value (`xw:lowerUnless`).

### Added: crosswalk checks against the CIRPASS-2 ontologies and every module example

The gate checks each lift output against the OWL/RDFS axioms of the CIRPASS-2 ontologies
(`scripts/lib/owl-structure.ts`); unavoidable findings are accepted per profile with their gap
number (`profile.json` `structure.accepted`), listed in `roundtrip.txt`, and fail once no longer
needed. It runs every module example through both profiles, commits the lowered document as JSON-LD
(`lowered.ours.jsonld`) and checks it expands losslessly; `check:shapes:itb` validates it with the
full shapes. SHACL applies per module as in the EC validator; what the way back no longer satisfies
is recorded (`roundtrip.txt`, `examples-shapes.txt`). An entailment step types EPCIS master data
without `type`. Rule fixes: `eudpp:amount`/`isDeclared` on module values, `xsd:anyURI` URLs,
`schema:address` for actors, the facility name, GLN scheme for Digital Link identifiers, process
types of recycling routes, indicator provenance via results, product-only rules, generic hazardous
substances as `eudpp:Substance`, zero values. Gap docs corrected: EUDPP has facility addresses,
coordinates and a (mis-namespaced) facility name; four new gaps (23–26). Gate time 30 s → 12 s for
the cases.

### Added: EUDPP core in the `cirpass2` crosswalk

Product, DPP, identifiers, actors and roles, facilities, materials, substances of concern,
documents, regulations, quantities, circularity, carbon footprint, EPD and product events convert
both ways; GS1 Web Vocabulary and schema.org statements without an EUDPP term travel unchanged;
classes the target lacks travel as `dcterms:type`. Ten round-trip cases more, and the gate records
the OpenEPCIS shapes an inbound document does not satisfy. Thirteen EUDPP core gaps are drafted for
upstream (`docs/upstream/cirpass2/2026-10-31-eudpp-core-gaps.md`).

### Added: crosswalk profiles `cirpass2` and `keystone`

Rule-driven conversion to and from CIRPASS-2 (textile 1.1.2, EUDPP 2.2.0) and DPP Keystone v3, with
round-trip test cases, committed goldens and loss reports (`crosswalk/README.md`). The CIRPASS-2
alignment doc points to it; a draft upstream issue lists six things CIRPASS-2 assessment data
cannot express (`docs/upstream/cirpass2/`).

### Removed: Keystone aliases for CPR shortcuts

The DPP Keystone bridge no longer aliases `thermalConductivity` and `compressiveStrength`: CPR states
them as essential-characteristic results.

### Changed: DPP Keystone bridge on spec v3

`dpp-keystone-bridge-context.jsonld` binds `dppk:` to `https://dpp-keystone.org/spec/v3/terms#`;
v3 is the only specification DPP Keystone publishes, and the module ontologies have cited it since
0.10.0. The four remaining v2 references in the detergent and EUDR mappings (
`textileSubstancesOfConcern`, `safetyDataSheet`, `countryOfOrigin`, `Product`) move with it; each
local name exists unchanged in v3. The namespace change is listed in
`scripts/context-compat-allowlist.json` as an intended redefinition.

## [0.10.0] - 2026-11-07

### Removed: bridge aliases for flat scores

The CIRPASS-2, JTC 24 and DPP Keystone bridge contexts no longer alias `repairabilityScore`,
`repairabilityClass`, `expectedLifespan`, `robustnessScore` and `recyclabilityScore`: the targets are
now indicator objects of `common/assessment`, which a key alias cannot produce.

### Changed: CIRPASS-2 EUDPP mirror on release 2.1.0, two sectoral mirrors added

- The EUDPP Core Ontology mirror ([`extensions/upstream/cirpass2-eudpp/`](../../upstream/cirpass2-eudpp/README.md))
  moved from v2.0.5 to **v2.1.0** (documentation refresh 2026-10-12, CORE with LCA
  import 2026-10-22): EVENT 1.0.0 (the EPCIS carrier clone is gone, GS1 IRIs are
  referenced), SOC 2.2.0 (identity renames, `SubstancePresence`, ESPR Art. 2(27)
  criteria), LCA 3.1 (rebuilt), P_DPP 2.2.0 (`dppUrl`/`dppBackupUrl`/`dppSchemaVersion`,
  `hasPreviousDPP`/`hasNextDPP`). The sync now reads the pinned module files of
  `github.com/CIRPASS-2/ontologies-docs` (`scripts/sync-cirpass2.ts`) instead of the
  unpinnable hub exports, whose `COMP` export was broken on 2026-10-29.
- New upstream mirrors [`cirpass2-textile/`](../../upstream/cirpass2-textile/README.md)
  (CIRPASS-2 Textile Ontology 1.1.2, task T3.2 led by GS1 in Europe, CC BY 4.0) and
  [`cirpass2-battery/`](../../upstream/cirpass2-battery/README.md) (EU DPP Battery
  Ontology 0.4.0 DRAFT). Alignment of `eu/textile` and `eu/battery` to them is a
  follow-up SKOS audit.
- [`docs/CIRPASS2_ALIGNMENT.md`](docs/CIRPASS2_ALIGNMENT.md) rewritten for 2.1.0:
  module table with versions, reference table following the renames, EVENT section
  recording that upstream adopted the GS1 IRIs, sectoral-mirror pointers.
- `pnpm run check:mappings` rule 13: every `cirpass2:`/`eudpp:` target (graded or
  `rdfs:seeAlso`) must exist in the mirror. It found 43 dead pointers after the bump,
  three of which had never resolved against any release.
- vocab-sync round 2026-10-30 (grader gpt-oss-20b, QA panel qwen3-32b) over core, battery
  and textile against all three mirrors: 88 curated CIRPASS-2 mappings written (see the
  module changelogs), the remaining APPLY and HOLD findings recorded in
  [`docs/skos-alignment/OPEN_DECISIONS.md`](../../../docs/skos-alignment/OPEN_DECISIONS.md);
  `alignment-run-manifest.json` regenerated.

## [0.9.9] - 2026-08-04

### Added
- **MVP Textile DPP bridge** (`context/mvp-textile-bridge-context.jsonld`) —
  out-of-band lift of a commercial DPP platform's Treehouse-generated "MVP Textile
  DPP v2" JSON Schema (CIRPASS-2 pilot context; provider deliberately not named) onto
  OpenEPCIS/GS1 terms: 22 of 28 leaf fields mapped (structural containers via
  JSON-LD 1.1 `@nest`), the 6 gaps plus eight schema pitfalls documented in
  [`docs/MVP_TEXTILE_MAPPING.md`](docs/MVP_TEXTILE_MAPPING.md).
  Nothing of the schema is vendored (no published license); verified by expanding the
  vendor sample through the context.
- The CIRPASS-2 EUDPP Core Ontology is now mirrored as a Layer-2 upstream module
  ([`extensions/upstream/cirpass2-eudpp/`](../../upstream/cirpass2-eudpp/README.md),
  upstream v2.0.5) so the alignment documented in
  [`docs/CIRPASS2_ALIGNMENT.md`](docs/CIRPASS2_ALIGNMENT.md) has a browsable target on
  ref.openepcis.org. The alignment strategy itself is unchanged: `rdfs:seeAlso` by
  default, graded SKOS only where audited, no `owl:imports`.

## [0.9.8] - 2026-07-29

### Added
- **EN 18222 DPP API** — `api/en18222-dpp-api.openapi.yaml`, an OpenAPI 3.1 contract realising the EN 18222:2026 method set (DPP lifecycle management + searchability: read/create/update/delete, product-id discovery, registry) with the EN 18223 `DigitalProductPassport` as payload. 7 paths, 10 operations, every one citing its EN 18222 clause and recording its conformance level (shall / should / conditional per clause 4.1). `representation=compressed` (the clause 5.2 key/value form) is the default; `representation=full` returns the Annex A `elements[]` form. Errors are the EN 18222 Table 12 `Result` object with the Table 15 status codes. Closes [`docs/EN18223_MODEL_ALIGNMENT.md`](docs/EN18223_MODEL_ALIGNMENT.md) §6. The GS1 Digital Link resolver and EPCIS 2.0 query interface remain separate APIs alongside it.
- **`X-API-KEY` credential form** on the EN 18222 contract — a single-header `xApiKey` scheme alongside bearer/OIDC, the OpenEPCIS `API-KEY` + `API-KEY-SECRET` pair, and basic auth (each entry in `security` is a self-sufficient alternative). This is the form OpenDPP expects; declaring it keeps the contract descriptive of the EN 18222 API rather than only of the service behind it. **Contract only — the OpenEPCIS implementation does not accept `X-API-KEY`** and no support for it is planned; `openepcis-dpp-api` authenticates OIDC bearer tokens.
- **This repo is the source of truth for that contract.** The `openepcis-dpp-api` service copy (`src/main/resources/META-INF/openapi.yaml`, served at `/q/openapi`) is a byte-identical mirror. `pnpm run sync:dpp-api-openapi` writes it, `pnpm run check:dpp-api-openapi` reports drift; the mirror location defaults to `../openepcis-build` and is overridable with `OPENEPCIS_BUILD_PATH` / `DPP_API_OPENAPI_PATH`.

## [0.9.7] — 2026-06-19

### Added
- **DPP Keystone bridge.** New `context/dpp-keystone-bridge-context.jsonld` mapping the DPP Keystone profile (`dpp-keystone.org`, `dppk:`, spec v2) onto the OpenEPCIS vocabulary, plus full coverage analysis in [`docs/DPP_KEYSTONE_MAPPING.md`](docs/DPP_KEYSTONE_MAPPING.md). Covers product/organization/component, iron & steel + Material Test Certificate (`eusteel:`), EN 15804 EPD (`oec:`), construction/DoP (`eucpr:`), and the textile ESPR deltas (`eutex:`). Structural reshapes (EPD indicator/lifecycle objects, DoPC per-test groups) and lossy conversions (0–100 vs 0–1 scales, dppk 4-value visibility vs `oec:AccessLevel`) are documented rather than forced into the context. Semantic anchors are graded SKOS mapping relations (`skos:exactMatch` / `skos:closeMatch` / `skos:broadMatch`) in the respective module ontologies.

### Changed
- Renamed vocabulary prefix `interop:` → `oei:` (alias only; namespace IRIs unchanged).
- Completed term governance: 100% `dcterms:source` + `skos:note` coverage.
- GS1 Rail bridge context + equivalences to `oec:` / GS1 / SEMICeu.

## [0.9.6] - 2026-06-07 (EN 18223 conformance + GS1 to EN 18223 converter)

### Added
- **`docs/CEN_JTC24_CONFORMANCE.md`** — clause-by-clause conformance map of the OpenEPCIS GS1 + EPCIS profile against the six published CEN/CENELEC JTC 24 standards (EN 18216, 18219, 18220, 18221, 18222, 18223).
- **`docs/EN18223_MODEL_ALIGNMENT.md`** — the Phase B work list aligning `oec:` core with the EN 18223 information model.
- **`docs/GS1_STACK_EN182XX_WHITEPAPER.md`** — the EPCIS4DPP whitepaper, with a "Deriving the passport from a GS1 Digital Link" section (GS1 Application Identifiers to granularity) and a "Two routes to interoperability" observation comparing EN 18223 and UNTP serialisation, process, and access.
- Browser demo `demos/en18223-converter/` that derives the EN 18223 Annex A "expanded" serialization live from GS1 Web Vocabulary + GS1 Digital Link JSON-LD. Linked from the root and interop READMEs.
## [0.9.6] - 2026-05-07 (GS1 Rail Vocabulary mirror + bridge)

### Added
- **GS1 Rail bridge** (`context/rail-bridge-context.jsonld`) — additive context that
  brings the `rail:` (`https://gs1-epcis-reg.org/rail/voc/data#`) and `oec:`
  namespaces into scope alongside the upstream rail and dpp-core contexts.
  Documents the rail ↔ dpp / GS1 / SEMICeu equivalences
  (`rail:itemReconditioningDate` ↔ `oec:remanufacturingDate`,
  `rail:VisibilityStatus` ↔ `oec:AccessLevel`, etc.) so DPP-aware consumers can
  read rail-typed EPCIS events.
- Companion mirror under `extensions/upstream/gs1-rail/` (Apache 2.0; published
  by GS1 AISBL with GS1 Switzerland) — see that module for upstream attribution
  and re-sync procedure.
- New project script `pnpm sync:rail` for re-fetching upstream artefacts.

### Notes
- The bridge is intentionally minimal: it does **not** redefine any rail or dpp
  term (the upstream EPCIS context that rail-context transitively loads marks
  all of its terms `@protected`, so additive declarations only). Anchorings
  live in the TTL ontologies (`dpp-core.ttl` adds `oec:remanufacturingDate`
  with `rdfs:seeAlso rail:itemReconditioningDate`) and in the `_equivalences`
  block of the bridge file.

## [0.9.5] - 2026-05-04 (SEMICeu Core Vocabularies elevation)

### Added
- **EU SEMICeu Core Vocabularies bridge** (`context/semic-core-bridge-context.jsonld`) covering CCCEV, CPOV, Core Business, Core Person, Core Location, Core Public Event, CPSV-AP, and ADMS / ADMS-AP. Single consolidated context; namespaces `cv:` / `cccev:` (`http://data.europa.eu/m8g/`), `locn:` (`http://www.w3.org/ns/locn#`), `adms:` (`http://www.w3.org/ns/adms#`), `cpsv:` (`http://purl.org/vocab/cpsv#`), plus `org:` / `foaf:` / `skos:` / `dcterms:` reuse.
- **`docs/SEMIC_CORE_VOCABULARIES.md`** — comprehensive narrative + per-vocabulary mapping. Documents which `oec:` and module terms anchor to SEMICeu and how to compose payloads.
- New **"Foundational vocabularies (peer Layer 1)"** section at the top of `docs/STANDARDS_ALIGNMENT.md` describing the peer triumvirate: schema.org + GS1 + SEMICeu Core Vocabularies as Layer 1 foundations, with UNTP / CIRPASS-2 / JTC 24 sitting above as Layer 2 community profiles.

### Changed
- Vocabulary precedence rule updated project-wide to **`schema:` → `gs1:` → SEMICeu (`cv:` / `cccev:` / `locn:` / `adms:` / `cpsv:`) → upstream community → custom**. See `EXTENSION-GOVERNANCE.md` v1.2.0.
- `README.md` Vision and Bridge Context tables include the SEMICeu row.

### Notes
- This elevation is documentation-and-bridging; the SEMICeu TTLs are not vendored into the project. Anchors are added to `dpp-core.ttl` and selected module TTLs (battery, electronics, eudr, textile) in companion changelogs.

## [0.9.5] - 2026-04-15 (GS1 Standards Week preparation)

### Changed
- **JTC 24 standards references updated from "prEN" to "EN"** for the six
  harmonised standards now at FprEN stage (EN 18216 Data Exchange, EN 18219
  Identifiers, EN 18220 Data Carriers, EN 18221 Storage/Persistence, EN 18222
  APIs, EN 18223 Interoperability) — publishing March 2026. References to
  prEN 18239 (Access Rights) and prEN 18246 (Data Authentication) preserved
  since those remain in development.
- `context/jtc24-bridge-context.jsonld` comment updated to reflect the split.
- `docs/STANDARDS_ALIGNMENT.md` table and prose refreshed.

### Added
- New "Related References & Liaison" section in
  `docs/STANDARDS_ALIGNMENT.md` covering:
  - Standardization Request M/604 (Commission Implementing Decision 31 July 2024)
  - CEN/CLC JTC 24 structure (WG1–WG4); GS1 liaison representative
  - ISO/AWI 25534-1 (ISO/TC 154 DPP Part 1)
  - JRC Methodology Report (JRC145830, March 2026)
  - EU Customs Single Window (CSV-CERTEX) per ESPR Art. 13
  - Relevant GS1 standardization in progress (DPP foundations, extended packaging, data carriers, ITIP, EUDR exemptions)

### Notes
- Version remains v0.9.5; project has not yet had a formal release.

## [0.9.5] - 2025-02-02

### Initial Release

OpenEPCIS DPP-Ready v0.9.5 - First official public release.

**Standards Alignment:**
- GS1 Web Vocabulary (native foundation)
- UN Transparency Protocol (UNTP) v0.6/1.0
- CIRPASS-2 pilot requirements
- EU ESPR 2024/1781

**Key Files:**
- `untp-bridge-context.jsonld` - JSON-LD context for UNTP-style property names
- `LICENSING.md` - IP analysis, license compatibility, attribution
- `STANDARDS_ALIGNMENT.md` - GS1, UNTP, CIRPASS2, ESPR alignment overview
- `UNTP_MAPPING.md` - Complete OpenEPCIS ↔ UNTP property mapping
- `CIRPASS2_COVERAGE.md` - CIRPASS2 pilot requirements coverage

**UNTP Alignment:**
- 14 properties with `owl:equivalentProperty` declarations
- 4 classes with `owl:equivalentClass` declarations
- 0-1 decimal scale for all ratio/fraction properties
- Native interoperability with UNTP data

**Coverage:**
- Digital Product Passport (DPP) - Full alignment
- Digital Facility Record (DFR) - Supported via domain-free properties
- Digital Identity Anchor (DIA) - `did` and `identityCredentialUrl` properties
- Conformity Credentials - Via GS1 `CertificationDetails`
