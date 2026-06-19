# Changelog

All notable changes to the DPP Core module will be documented in this file.

## [0.9.7] — 2026-06-19

### Changed
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
  - `oec:OperatorInformation` → `rdfs:seeAlso cv:LegalEntity` (EU Core Business peer; **not** owl:equivalentClass — see below).
  - `oec:DueDiligenceReport` → `rdfs:subClassOf cccev:Evidence` + `rdfs:seeAlso cccev:Requirement` (a DDR is a specific kind of CCCEV Evidence; CCCEV is the EU upstream of UNTP's conformity model).
  - `oec:FacilityInformation` → `rdfs:seeAlso locn:Location` (EU Core Location peer; `locn:Address` and `locn:Geometry` carry the structured sub-parts).
  - `oec:DocumentReference` → `rdfs:seeAlso foaf:Document` (used by SEMICeu CPOV for contact pages and homepages).
- `skos:note` blocks updated to explain the SEMICeu anchors and when each peer is preferable.

### Anchor strength — design note
The strongest formal claim that actually holds is preferred:

- `oec:OperatorInformation` ↔ `cv:LegalEntity` is `rdfs:seeAlso` only. The two extensions **overlap but neither contains the other**: cv:LegalEntity includes charities / non-profits that are not ESPR operators, and ESPR operators include sole proprietors that some Member States classify as natural persons rather than legal entities. seeAlso is the strongest claim that's universally true; subClassOf and equivalentClass would both over-claim.
- `oec:DueDiligenceReport` ↔ `cccev:Evidence` is `rdfs:subClassOf`. Every DDR is evidence, but cccev:Evidence is far broader (test reports, certificates, audit logs, attestations) — subsumption holds, equivalence does not.

### Notes
- No `oec:` terms removed in this pass. Anchors only — JSON-LD payloads continue to round-trip identically. The bridge context at `extensions/common/interop/context/semic-core-bridge-context.jsonld` lets consumers compose payloads using SEMICeu IRIs directly when preferred.
- See `extensions/common/interop/docs/SEMIC_CORE_VOCABULARIES.md` for the full mapping rationale.

## 0.9.5 — schema.org / GS1 alignment cleanup (2026-04-29)

**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.

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
