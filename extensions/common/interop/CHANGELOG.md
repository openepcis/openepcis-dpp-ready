# Changelog

All notable changes to the Interoperability module will be documented in this file.

## [0.9.6] - 2026-06-07 (EN 18223 conformance + GS1 to EN 18223 converter)

### Added
- **`docs/CEN_JTC24_CONFORMANCE.md`** — clause-by-clause conformance map of the OpenEPCIS GS1 + EPCIS profile against the six published CEN/CENELEC JTC 24 standards (EN 18216, 18219, 18220, 18221, 18222, 18223).
- **`docs/EN18223_MODEL_ALIGNMENT.md`** — the Phase B work list aligning `dpp:` core with the EN 18223 information model.
- **`docs/GS1_STACK_EN182XX_WHITEPAPER.md`** — the EPCIS4DPP whitepaper, with a "Deriving the passport from a GS1 Digital Link" section (GS1 Application Identifiers to granularity) and a "Two routes to interoperability" observation comparing EN 18223 and UNTP serialisation, process, and access.
- Browser demo `demos/en18223-converter/` that derives the EN 18223 Annex A "expanded" serialization live from GS1 Web Vocabulary + GS1 Digital Link JSON-LD. Linked from the root and interop READMEs.

## [0.9.5] - 2026-05-04 (SEMICeu Core Vocabularies elevation)

### Added
- **EU SEMICeu Core Vocabularies bridge** (`context/semic-core-bridge-context.jsonld`) covering CCCEV, CPOV, Core Business, Core Person, Core Location, Core Public Event, CPSV-AP, and ADMS / ADMS-AP. Single consolidated context; namespaces `cv:` / `cccev:` (`http://data.europa.eu/m8g/`), `locn:` (`http://www.w3.org/ns/locn#`), `adms:` (`http://www.w3.org/ns/adms#`), `cpsv:` (`http://purl.org/vocab/cpsv#`), plus `org:` / `foaf:` / `skos:` / `dcterms:` reuse.
- **`docs/SEMIC_CORE_VOCABULARIES.md`** — comprehensive narrative + per-vocabulary mapping. Documents which `dpp:` and module terms anchor to SEMICeu and how to compose payloads.
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
