# Standards Alignment Overview

OpenEPCIS DPP-Ready harmonizes multiple Digital Product Passport standards into a single, coherent vocabulary.

## Foundational vocabularies (peer Layer 1)

OpenEPCIS DPP-Ready rests on a **peer triumvirate** of foundational vocabularies. Walk these three before minting at `oec:` or any module namespace, in this order:

| # | Vocabulary | Owner | Role in DPP |
|---|---|---|---|
| 1 | **GS1 Web Vocabulary** | GS1 | Imported foundation. Identifier model (GTIN, GLN), trade-item attributes, EPCIS event integration. Most product-side properties already live here — checking GS1 first short-circuits the majority of lookups. Imported via `owl:imports`. |
| 2 | **EU SEMICeu Core Vocabularies** | European Commission DG DIGIT (SEMIC team) | EU public-sector / EU-canonical authority. Fills the gaps GS1 doesn't cover. CCCEV (conformity), CPOV (public bodies), Core Business (legal entities), Core Person, Core Location, Core Public Event, CPSV-AP, ADMS / ADMS-AP. Bridge context at `context/semic-core-bridge-context.jsonld`; full mapping in [`SEMIC_CORE_VOCABULARIES.md`](./SEMIC_CORE_VOCABULARIES.md). |
| 3 | **schema.org** | W3C / industry consortium | Universal-web fallback. Search engines, generic JSON-LD consumers, and most data tools recognise it natively. Best for ratings, observations, generic metadata, and concepts neither GS1 nor SEMICeu has named (`Observation`, `QuantitativeValue`, `GeoCoordinates`, `Rating`). |

Above these foundations sit the **upstream community profiles and standardisation tracks** (Layer 2):

- **CEN/CENELEC JTC 24** — the formal EU standardisation track for DPP under M/604 (EN 18216–18223 + prEN 18239 / 18246). This is the regulation-binding track that JTC 24's harmonised standards will deliver.
- **UNTP v0.7.0** — UN/CEFACT product transparency protocol; bridge context + `owl:equivalentClass` / `owl:equivalentProperty` anchors where extensions match.
- **CIRPASS-2 pilot programme** — EU pilot, one input among several into JTC 24. Their ontology proposal at `https://w3id.org/eudpp#` is referenced via `rdfs:seeAlso` only (W3ID redirect currently 404s; not a finalised standard). See [`CIRPASS2_ALIGNMENT.md`](./CIRPASS2_ALIGNMENT.md).
- **BatteryPass Consortium** — sectoral SAMM data model (v1.2) + BatteryPass-Ready v1.3 conformance harness; bidirectional bridge contexts, no formal anchors. Battery-specific analysis in [`extensions/eu/battery/docs/CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md`](../../../eu/battery/docs/CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md).

CCCEV (Layer 1, SEMICeu) is the EU upstream of UNTP's conformity model — the two are anchored to each other, with UNTP retained as the operative bridge for DPP-specific detail.

## EPCIS adoption depth — our differentiator

Every CIRPASS-2 / BatteryPass / JTC-24 pilot we'd care to interoperate
with **claims** to speak EPCIS. Depth and quality of that adoption,
however, vary a lot — and that variance is where this project adds
real value on top of the shared "we use EPCIS" claim.

Common divergences across the DPP-pilot landscape:

- **Event-type coverage** — many pilots use only `ObjectEvent` for
  commissioning + shipping; few exercise `TransformationEvent`,
  `AggregationEvent`, `AssociationEvent`, sensor reports. Real
  interop requires the full EPCIS 2.0 surface, not just the
  happy-path subset.
- **CBV usage discipline** — many implementations invent custom
  `bizStep` / `disposition` URIs instead of reusing the GS1 CBV code
  lists, breaking the "look up the bizStep, get a stable meaning"
  promise of EPCIS.
- **`gs1:masterDataAvailableFor` discipline** — frequently misused as
  a generic extension carrier, including in early CIRPASS-2 and
  BatteryPass examples. We actively police this in our examples
  (extension properties at event level; master data inside
  `masterDataAvailableFor` carries `gs1:` properties only — see
  [`extensions/common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md`](../../core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md)).
- **`GS1-Extensions` HTTP header** — the EPCIS 2.0 §12.3 mechanism
  that activates regulation-specific validation in a repository.
  Most pilot implementations don't set it; their extension data is
  technically vendor-namespaced unknowns to a conformant repository.
- **JSON-LD `@context` hygiene** — pilots routinely ship documents
  with stale, mixed, or missing `@context` arrays.
- **Identifier discipline** — every pilot claims GS1 Digital Link,
  but identifier shapes vary widely (GTIN-only, GTIN+serial, GLN,
  EUID, EOID, vendor-issued UUIDs, all in the same payload set).
- **Sensor / IoT data model** — EPCIS 2.0 added rich sensor-report
  structures; few pilots model their telemetry that way, preferring
  flat custom JSON.

Our differentiator is **EPCIS conformance taken seriously**. Every
example we ship validates against the conformant Event Sentry,
declares the right `GS1-Extensions` header, uses CBV `bizStep` /
disposition values verbatim, and keeps `masterDataAvailableFor` clean.
That depth is what an actual interop deployment depends on — beyond
the shared headline of "we use EPCIS".

## Our Approach: Open and Early

**We believe in building in the open.** The DPP standardization landscape is rapidly evolving, with multiple initiatives converging toward common requirements. Rather than waiting for all standards to finalize, OpenEPCIS provides:

- **Early implementation** of emerging requirements from ESPR, CIRPASS2, and JTC 24
- **Open-source vocabulary** that can evolve alongside the standards
- **Practical examples** that help the community understand how DPP data works
- **Bridge contexts** for interoperability with other initiatives

This approach lets implementers start building today while standards mature. As CEN/CENELEC JTC 24 and other bodies finalize their specifications, we commit to aligning OpenEPCIS accordingly.

## European Standardization: CEN/CENELEC JTC 24

**CEN/CENELEC JTC 24** (Joint Technical Committee 24) is the official European standardization body for Digital Product Passports under ESPR. Established in 2023, JTC 24 develops the harmonised European standards under Standardisation Request **M/604** that define how DPPs work across the EU.

### The 8 EN Standards (CEN/CENELEC JTC 24)

JTC 24 is developing **8 individual standards** under M/604. Six were published as EN standards in 2026; prEN 18239 and prEN 18246 remain in development. The standards are deliberately technology- and scheme-neutral; OpenEPCIS realises them through the **EPCIS4DPP** profile (GS1 identifiers, GS1 Digital Link, EPCIS, ref.openepcis.io). The clause-by-clause detail is in [`CEN_JTC24_CONFORMANCE.md`](./CEN_JTC24_CONFORMANCE.md).

| Standard | Title | WG | Status | EPCIS4DPP realisation |
|----------|-------|----|--------|-----------------------|
| **EN 18219** | Unique identifiers | WG 2 | Published 2026 | **Conformant** — scheme-neutral (5 ID schemes); we use the GS1 scheme; granularity model/batch/item derived from GS1 AIs |
| **EN 18220** | Data carriers | WG 2 | Published 2026 | **Conformant** — several carriers permitted; we use QR + GS1 Digital Link (NFC supplementary); resolver/linksets are an EPCIS4DPP profile addition |
| **EN 18216** | Data exchange protocols | WG 4 | Published 2026 | **Conformant** — HTTPS/TLS/HTTP-2 + JSON + content negotiation; we deliver JSON-LD + HTML |
| **EN 18221** | Data storage, archiving and data persistence | WG 4 | Published 2026 | **Partial** — append-only EPCIS + versioned core (a conformant pattern); provider roles, RPO, OAIS tracked |
| **EN 18222** | APIs for the product passport lifecycle management and searchability | WG 4 | Published 2026 | **Planned** — expose the EN 18222 REST API method set; EPCIS query + resolver added as profile |
| **EN 18223** | System interoperability | WG 4 | Published 2026 | **Conformant** — `oec:` core maps to the EN 18223 model; ref.openepcis.io is the §4.3 data dictionary |
| **prEN 18239** | Access rights, security, business confidentiality | WG 3 | In development | **Partial** — `oec:AccessLevel` + Keycloak cover the access tiers; role-based expansion tracked |
| **prEN 18246** | Data authentication, reliability, and integrity | WG 5 | In development | **Partial** — `oec:did`, `oec:identityCredentialUrl`; ESDC/VC integration tracked |

**Sources:** the standards are published by CEN/CENELEC and adopted nationally (for example as NEN-EN); they are licensed documents. See the clause-cited [`CEN_JTC24_CONFORMANCE.md`](./CEN_JTC24_CONFORMANCE.md) and the [CEN/CENELEC site](https://www.cencenelec.eu/).

### Methodology Standards (Published)

| Standard | Title | OpenEPCIS Alignment |
|----------|-------|---------------------|
| **EN 45552** | General method for durability assessment | `oec:PerformanceInfo`, `oec:expectedLifespan` |
| **EN 45553** | General method for remanufacturability assessment | `oec:CircularityPerformance` |
| **EN 45554** | General method for repair, reuse, upgrade assessment | `oec:RepairabilityInfo` |
| **EN 45555** | General method for recyclability/recoverability assessment | `oec:recyclableContent`, `oec:CircularityPerformance` |

### Key Developments

- **OPC Foundation liaison agreement** (Feb 2026) for digital twin interoperability with DPP ([source](https://www.cencenelec.eu/news-events/news/2026/brief-news/2026-02-24-opcf-liaison-agreement/))
- **CEN/CENELEC Work Programme 2026** confirms DPP as a priority ([source](https://www.cencenelec.eu/news-events/news/2026/brief-news/2026-02-04-work-programme-2026/))
- **JRC Methodology Report** (JRC145830, 2026) defines a methodology for specifying and prioritising DPP data requirements (essential / recommended / voluntary) ([source](https://publications.jrc.ec.europa.eu/repository/handle/JRC145830))
- JTC 24 interview on progress: [wiot-group.com](https://wiot-group.com/think/en/articles/otto-handle-cen-cenelec-on-eu-digital-product-passport/)

### How OpenEPCIS Aligns with JTC 24

**EN 18219 (Identifiers)** — The standard is scheme-neutral, permitting five identifier schemes. EPCIS4DPP adopts the GS1 scheme (GTIN, GLN, GTIN + serial). Granularity (model/batch/item) is the standard's own enumeration, carried in `oec:granularityLevel` and derived from the GS1 Digital Link Application Identifiers (`01/{gtin}` model, `01/{gtin}/10/{lot}` batch, `01/{gtin}/21/{serial}` item).

**EN 18220 (Data Carriers)** — The standard admits several carriers (QR, Data Matrix, HF RFID, NFC, RAIN RFID). EPCIS4DPP uses a QR code carrying a GS1 Digital Link URI, with NFC carrying the same URI as a supplementary carrier. GS1 Digital Link resolution, RFC 9264 linksets and GS1 link types are an EPCIS4DPP profile addition; EN 18220 specifies the carrier, not the resolver.

**EN 18216 (Data Exchange)** — HTTPS (TLS 1.2+, HTTP/2), JSON, and content negotiation (JSON/XML/JSON-LD/HTML). OpenEPCIS delivers JSON-LD and HTML over HTTPS. EPCIS reuses the same transport; EN 18216 does not mention EPCIS.

**EN 18221 (Storage & Persistence)** — The standard is storage-technology-neutral, defining archiving, persistence and the main/back-up DPP service provider roles. EPCIS4DPP's append-only EPCIS store plus versioned core (`oec:passportVersion`, `oec:previousPassportVersion`) is a conformant implementation pattern. Provider roles, Recovery Point Objective, OAIS (ISO 14721) and data lifetime are tracked; integrity follows EN 18246.

**EN 18222 (APIs)** — The standard defines a concrete DPP REST API (ReadDPPById, ReadDPPByProductId, CreateDPP, UpdateDPPById, DeleteDPPById, RegisterProductDPP, element-level access). EPCIS4DPP will expose this method set over the repository (tracked in [`EN18223_MODEL_ALIGNMENT.md`](./EN18223_MODEL_ALIGNMENT.md)). The EPCIS query interface and the Digital Link resolver are profile additions beyond EN 18222.

**EN 18223 (Interoperability)** — The standard mandates a UML and plain-JSON information model with an externalised `dictionaryReference`; it does not prescribe JSON-LD, RDF, OWL or SHACL. EPCIS4DPP's value-add: the `DigitalProductPassport` model maps almost one-to-one onto `oec:` core, and **ref.openepcis.io is the §4.3 data-dictionary repository** whose definitions our term IRIs supply. JSON-LD is our serialisation choice and remains valid JSON; ontologies declare `rdfs:isDefinedBy` and `owl:versionIRI` for discovery and versioning.

**prEN 18239 (Access Rights)** — `oec:AccessLevel` implements the three-tier model (Public, AuthorizedOnly, Restricted). Role-based differentiation (consumer, regulator, recycler, repairer, customs, etc.) tracked and will be added as the standard finalises.

**prEN 18246 (Data Authentication)** — `oec:did` and `oec:identityCredentialUrl` support decentralized identity. Verifiable Credentials and Electronically Signed Data Constructs (ESDC) integration will follow the standard.

### Why Not Wait?

The EU Battery Regulation (2023/1542) requires DPPs starting **February 2027**. Other product categories follow. Industry needs to:

- Build IT systems now
- Train supply chain partners
- Pilot data exchange

OpenEPCIS provides a production-ready vocabulary today, built on stable foundations (GS1, EPCIS 2.0) that will remain valid as the JTC 24 standards finalize.

## DPP Ecosystem Landscape

Multiple initiatives are developing Digital Product Passport specifications. OpenEPCIS differentiates through its **GS1-native architecture**.

### Initiative Comparison

| Initiative | Technical Foundation | Scope | Status | GS1 Integration |
|------------|---------------------|-------|--------|-----------------|
| **CEN/CENELEC JTC 24** | EN 18216-18223 + prEN 18239/18246 (8 standards) | Multi-sector | 6 of 8 published 2026 | Confirmed (EN 18219 = GS1 GTIN) |
| **OpenEPCIS DPP-Ready** | GS1 Web Vocab + EPCIS 2.0 | Multi-sector | Production v0.9.6 | Native |
| **BatteryPass Data Model** | Eclipse SAMM + Custom URNs | Battery only | Spec v1.2.0 | None |
| **DPP Keystone** | Custom JSON-LD vocab | Multi-sector | Proof-of-concept | Partial |
| **CIRPASS2** | Requirements framework | Multi-sector | Requirements → JTC 24 | Reference |
| **UN Transparency Protocol** | JSON-LD + JSON Schema | Multi-sector | Spec v0.6.1 (GitLab) | Limited |

### Why GS1-Native Architecture?

**1. Global Identifier Infrastructure**
- 2+ million companies already use GS1 identifiers (GTIN, GLN)
- No new identifier registration systems required
- GS1 Digital Link resolvers already deployed globally

**2. Supply Chain Event Integration**
- EPCIS 2.0 tracks every product event (manufacturing, shipping, transformation)
- DPP data embeds directly in supply chain events
- Complete lifecycle traceability in one system

**3. No Parallel Infrastructure**
- Use existing GS1 resolver networks
- Leverage existing EPCIS repositories
- Build on established GS1 governance

### BatteryPass Data Model / Catena-X

The [BatteryPass Data Model](https://github.com/battery-pass/BatteryPassDataModel) uses Eclipse SAMM to generate schemas.

**Catena-X ecosystem update (Oct 2025):** The `eclipse-tractusx/digital-product-pass` repository was archived. The successor is `eclipse-tractusx/industry-core-hub`, which uses a generic SAMM DPP model v6.1.0.

**Limitations compared to OpenEPCIS:**
- Custom URN identifiers (`urn:samm:io.BatteryPass.*`) - not GS1-based
- No EPCIS 2.0 integration - separate event tracking needed
- Battery-only scope - cannot extend to other sectors
- Requires dedicated resolver infrastructure

**Interoperability:** OpenEPCIS provides `battery/context/battery-context-batterypass-bridge.jsonld` to import BatteryPass documents.

### DPP Keystone

[DPP Keystone](https://dpp-keystone.org/) provides vocabulary harmonization.

**Limitations compared to OpenEPCIS:**
- Explicitly marked as "proof-of-concept" - not production-ready
- Limited GS1 alignment
- No complete EPCIS 2.0 integration
- Demonstrates concepts but not deployable

## Alignment Summary

| Standard | Properties Aligned | Classes Aligned | Notes |
|----------|-------------------|-----------------|-------|
| **GS1 Web Vocabulary** | Foundation | Foundation | Native integration via `owl:imports` |
| **CEN/CENELEC JTC 24** | Strong (6/8 standards) | Strong | EN 18216-18223 (published 2026) + prEN 18239/18246 (in development); see detailed alignment above |
| **UNTP** | 22 | 9 | `owl:equivalentProperty`, aligned with v0.6.1 (GitLab) |
| **CIRPASS2** | Requirements coverage | Bridge context | `cirpass2-bridge-context.jsonld` + `CIRPASS2_COVERAGE.md` |
| **ESPR 2024/1781** | Full | Full | Core module covers all Article 7/9 requirements |
| **EN 45552-45555** | Methodology support | N/A | Properties to store assessment results |
| **Battery Reg 2023/1542** | Full Annex XIII | Domain-specific | `eubat:` module |
| **Textile Strategy** | Anticipated | Domain-specific | `eutex:` module |

## GS1 Web Vocabulary

**Integration Method**: `owl:imports <https://ref.gs1.org/voc/>`

OpenEPCIS is built natively on GS1 Web Vocabulary patterns:

| GS1 Pattern | OpenEPCIS Usage |
|-------------|-----------------|
| `gs1:Organization` | Base class for `oec:OperatorInformation` |
| `gs1:Place` | Base class for `oec:FacilityInformation` |
| `gs1:CertificationDetails` | Used directly for certifications |
| `gs1:WarrantyPromise` | Used directly for warranty |
| `gs1:ReferencedFileDetails` | Used directly for documents |
| `gs1:QuantitativeValue` | Used for all measurements |
| `gs1:regulatoryInformation` | Used for regulatory compliance |

**Extension Governance**: OpenEPCIS extends GS1 only where no equivalent term exists. Each extension includes:
- `dcterms:source` - Regulatory requirement
- `skos:note` - Why extension is needed
- `rdfs:seeAlso` - Related GS1 terms

## UN Transparency Protocol (UNTP)

**Source**: https://opensource.unicc.org/un/unece/uncefact/spec-untp (moved from GitHub Nov 2025)
**Version aligned**: v0.6.1 (heading to v1.0, expected Jun 2026)
**Integration Method**: `owl:equivalentProperty`, `rdfs:seeAlso`, bridge context

### Property Alignment

| OpenEPCIS Property | UNTP Equivalent | Notes |
|-------------------|-----------------|-------|
| `oec:carbonFootprintTotal` | `untp:carbonFootprint` | Total lifecycle CO2e |
| `oec:declaredUnit` | `untp:declaredUnit` | Functional unit |
| `oec:recycledContent` | `untp:recycledContent` | Total recycled percentage |
| `oec:recyclableContent` | `untp:recyclableContent` | Recyclability percentage |
| `oec:massFraction` | `untp:massFraction` | Material mass fraction |
| `oec:utilityFactor` | `untp:utilityFactor` | Durability multiplier |
| `oec:materialCircularityIndicator` | `untp:materialCircularityIndicator` | MCI score |
| `oec:primarySourcedRatio` | `untp:primarySourcedRatio` | Direct measurement ratio |
| `oec:operationalScope` | `untp:operationalScope` | Lifecycle boundary |
| `oec:verifiedRatio` | `untp:verifiedRatio` | Traceability verification |
| `oec:granularityLevel` | `untp:granularityLevel` | Product/Batch/Item |

### Class Alignment

| OpenEPCIS Class | UNTP Equivalent | Notes |
|-----------------|-----------------|-------|
| `oec:CircularityPerformance` | `untp:CircularityPerformance` | Circularity metrics container |
| `oec:EmissionsPerformance` | `untp:EmissionsPerformance` | Emissions data container |
| `oec:TraceabilityPerformance` | `untp:TraceabilityPerformance` | Traceability metrics |
| `oec:MaterialComposition` | `untp:Material` | Material composition |
| `oec:DigitalProductPassport` | `untp:ProductPassport` | New in v0.6.x |
| `oec:FacilityInformation` | `untp:FacilityRecord` | New in v0.6.x |
| `oec:ConformityDeclaration` | `untp:ConformityAttestation` | New in v0.6.x |

### Value Convention

OpenEPCIS uses the **0-1 decimal scale** for all ratio and fraction properties, fully aligned with UNTP:

```
recycledContent: 0.45   # 45% recycled content
massFraction: 0.15      # 15% of total mass
verifiedRatio: 0.80     # 80% verified
```

This enables **native interoperability** with UNTP - no value conversion required.

## CIRPASS2

**Integration Method**: Requirements coverage documentation

CIRPASS2 defines pilot requirements for EU Digital Product Passports. OpenEPCIS provides coverage for:

- Product identification and authentication
- Manufacturer and facility information
- Material composition and substances of concern
- Carbon footprint and environmental impact
- Circularity and end-of-life information
- Repairability and durability
- Access control and data governance

See [CIRPASS2_COVERAGE.md](./CIRPASS2_COVERAGE.md) for detailed coverage analysis.

## ESPR 2024/1781

**Integration Method**: Full implementation in `oec:` core module

| ESPR Requirement | OpenEPCIS Implementation |
|-----------------|-------------------------|
| Article 7 - Performance/Durability | `oec:PerformanceInfo`, `oec:expectedLifespan` |
| Article 7 - Repairability | `oec:RepairabilityInfo`, `oec:repairabilityScore` |
| Article 8 - Substances of Concern | `oec:SubstanceOfConcern`, SCIP alignment |
| Article 9 - Access Rights | `oec:AccessRights`, `oec:AccessLevel` |
| Article 77 - Operator ID | `oec:economicOperatorId`, `oec:OperatorRole` |

## CEN/CENELEC JTC 24 Methodology Standards

The EN 45552-45555 series defines *how* to assess product characteristics. OpenEPCIS provides *where* to store the results.

### EN 45552 - Durability Assessment

| Assessment Output | OpenEPCIS Property |
|-------------------|-------------------|
| Expected lifetime | `oec:expectedLifespan` |
| Guaranteed lifetime | `oec:guaranteedLifespan` |
| Usage cycles | `oec:usageCycles` |
| Technical lifetime | `oec:technicalLifetime` |
| Test conditions | `oec:testedConditions` |

### EN 45554 - Repairability Assessment

| Assessment Output | OpenEPCIS Property |
|-------------------|-------------------|
| Repairability score | `oec:repairabilityScore` |
| Repairability class | `oec:repairabilityClass` (A-E) |
| Spare parts availability | `oec:sparePartsAvailability` |
| Repair documentation | `oec:repairInstructions` |
| Professional repair access | `oec:professionalRepairNetwork` |
| DIY repairability | `oec:diyRepairPossible` |

### EN 45555 - Recyclability Assessment

| Assessment Output | OpenEPCIS Property |
|-------------------|-------------------|
| Recyclability rate | `oec:recyclableContent` |
| Recovery rate | `oec:CircularityPerformance` |
| Material composition | `oec:MaterialComposition` |
| Disassembly info | `oec:dismantlingInstructions` |

### EN 45553 - Remanufacturability Assessment

| Assessment Output | OpenEPCIS Property |
|-------------------|-------------------|
| Remanufacturing potential | `oec:CircularityPerformance` |
| Component accessibility | `oec:dismantlingInstructions` |
| Material circularity | `oec:materialCircularityIndicator` |

## Superior OpenEPCIS Patterns

These OpenEPCIS patterns are more comprehensive than alternatives:

| Pattern | Why Superior |
|---------|-------------|
| `oec:OperatorInformation` | Full ESPR Article 77 role enumeration (Manufacturer, Importer, Distributor, AuthorisedRepresentative, FulfilmentServiceProvider, etc.) |
| `oec:FacilityInformation` | GLN support, facility certifications, facility type - extends `gs1:Place` |
| `oec:SubstanceOfConcern` | Full SCIP database alignment (SCIP ID, EC Number, safe use instructions) |
| `oec:RepairabilityInfo` | Complete French Repairability Index support (score, class, spare parts, DIY repair) |
| `oec:AccessLevel` | Three-tier ESPR Article 9 access control (Public, AuthorizedOnly, Restricted) |
| `eubat:*` module | Complete Battery Regulation Annex XIII coverage with DIN DKE SPEC 99100 |
| `eutex:*` module | ISO 3758 care symbols, microplastic info, durability classes |

## Related References & Liaison

The following external resources frame OpenEPCIS's work and should be consulted alongside this document:

### European Commission mandate
- **Standardization Request M/604** — Commission Implementing Decision of 31 July 2024, the formal mandate to CEN/CENELEC for JTC 24 to develop harmonised DPP standards in support of ESPR. Deadline for delivering the requested standards was extended to **31 March 2026**.

### CEN/CENELEC JTC 24 structure
- **JTC 24 "Digital Product Passport — Framework and System"** established Q3 2023 under Standardization Request M/604
- Organized into four working groups (WG1-WG4); WG4 on Interoperability is convened by Otto Handle
- GS1 liaison representative: **Andreas Fussler** (GS1 in Europe)
- Over 200 committee meetings held since establishment
- [JTC 24 overview on iTeh Standards](https://standards.iteh.ai/catalog/tc/cen/b2e63c3a-8446-4d3f-b148-51c2b3928ecd/jtc-24)

### International level (ISO)
- **ISO/AWI 25534-1** "Digital product passport — Part 1: Overview and fundamental principles" — ISO/TC 154 joint with UNECE, registered October 2024. Will establish common terminology, core principles, data categories, and governance mechanisms at the global level. Complements the CEN EN 182xx series.
- [ISO/AWI 25534-1](https://www.iso.org/standard/90652.html)

### EU regulatory framework
- **ESPR** — Regulation (EU) 2024/1781 [full text](https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng)
- **Battery Regulation** — Regulation (EU) 2023/1542
- **EUDR** — Regulation (EU) 2023/1115
- **Detergents Regulation** — Regulation (EU) 2026/405

### EU infrastructure
- **EU DPP Registry** — goes live July 2026 under ESPR; stores unique product, operator, and facility identifiers
- **EU Customs Single Window (CSV-CERTEX)** — ESPR customs interconnect; products cannot clear customs without a registered DPP once a product-specific Delegated Act enters into force

### Methodology
- **JRC Methodology Report** (JRC145830, 2026) — methodology for specifying and prioritising DPP data requirements; relevant to `oec:PassportStatus` and EN 18221 storage patterns ([source](https://publications.jrc.ec.europa.eu/repository/handle/JRC145830))
- **EN 45552–45555** — general methods for durability, remanufacturability, repair/reuse/upgrade, recyclability/recoverability assessment

### GS1 standardization
- Relevant GS1 standardization (DPP foundations, extended packaging, data
  carriers including NFC, ITIP piece-level identification, and EUDR exemption
  handling) is in progress and tracked alongside these regulations. The
  reference patterns here align with the published GS1 standards and follow that
  work as it settles.
