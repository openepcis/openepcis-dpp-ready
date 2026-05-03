# Changelog

All notable changes to the DPP Core module will be documented in this file.

## 0.9.5 — SEMICeu Core Vocabularies anchoring (2026-05-04)

### Added
- New SEMICeu Core Vocabulary `@prefix` declarations in `dpp-core.ttl` — `cv:` / `cccev:` (`http://data.europa.eu/m8g/`), `locn:` (`http://www.w3.org/ns/locn#`), `adms:` (`http://www.w3.org/ns/adms#`), `cpsv:` (`http://purl.org/vocab/cpsv#`), `org:` (`http://www.w3.org/ns/org#`), `foaf:` (`http://xmlns.com/foaf/0.1/`).
- Upward anchors on cross-cutting `dpp:` classes:
  - `dpp:OperatorInformation` → `owl:equivalentClass cv:LegalEntity` + `rdfs:seeAlso cv:LegalEntity` (EU Core Business peer to `gs1:Organization`).
  - `dpp:DueDiligenceReport` → `owl:equivalentClass cccev:Evidence` + `rdfs:seeAlso cccev:Requirement` (CCCEV is the EU upstream of UNTP's conformity model).
  - `dpp:FacilityInformation` → `rdfs:seeAlso locn:Location` (EU Core Location peer; `locn:Address` and `locn:Geometry` carry the structured sub-parts).
  - `dpp:DocumentReference` → `rdfs:seeAlso foaf:Document` (used by SEMICeu CPOV for contact pages and homepages).
- `skos:note` blocks updated to explain the SEMICeu anchors and when each peer is preferable.

### Notes
- No `dpp:` terms removed in this pass. Anchors only — JSON-LD payloads continue to round-trip identically. The bridge context at `extensions/common/interop/context/semic-core-bridge-context.jsonld` lets consumers compose payloads using SEMICeu IRIs directly when preferred.
- See `extensions/common/interop/docs/SEMIC_CORE_VOCABULARIES.md` for the full mapping rationale.

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

### Removed (use canonical term instead)

- `dpp:documentTitle` → `schema:name`
- `dpp:materialName` → `schema:name`
- `dpp:productModel` → `schema:ProductModel`
- `dpp:regulatoryReferenceNumber` → `gs1:regulatoryReferenceNumber`
- `dpp:schemaVersion` → `schema:schemaVersion`
- `dpp:sourceCountry` → `gs1:countryOfOrigin`
- `dpp:sparePartsDeliveryTime` → `schema:deliveryTime`
- `dpp:status` → `schema:status`
- `dpp:substanceName` → `schema:name`
- `dpp:uniqueProductIdentifier` → `gs1:productID`
- `dpp:validUntil` → `schema:validUntil`
- `dpp:vatIdentificationNumber` → `schema:vatID`

## [0.9.5] - 2026-04-15 (GS1 Standards Week preparation)

### Added
- **ITIP (Individual Trade Item Piece) support** aligned with GS1 GSMP Work Request WR 25-212 (Community Review):
  - `dpp:IndividualTradeItemPiece` class
  - `dpp:tradeItemPieceCount` (positiveInteger) on `gs1:Product`
  - `dpp:tradeItemPieceNumber`, `dpp:tradeItemPieceOf`, `dpp:tradeItemPieceDescription`
  - Maps to GS1 AI 8026 (GTIN + total piece count + piece number)
  - Usable across modules; first example in `textile/examples/garment-set-itip.jsonld`
- `dpp:tradeItemPieces` container property in the JSON-LD context

### Changed
- JTC 24 standards references updated from "prEN" to "EN" for the six
  standards now at FprEN stage (EN 18216, 18219, 18220, 18221, 18222,
  18223). Remaining prEN references preserved for prEN 18239 and prEN
  18246 (still in development).

### Notes
- Version remains v0.9.5; project has not yet had a formal release.
  Dated entries track ongoing development within the v0.9.5 preview.
- Additions are reference patterns aligned with active GS1 GSMP work
  requests; may evolve as eBallots close.

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
