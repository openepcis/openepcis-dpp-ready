# Standards Alignment Overview

OpenEPCIS DPP-Ready harmonizes multiple Digital Product Passport standards into a single, coherent vocabulary.

## Our Approach: Open and Early

**We believe in building in the open.** The DPP standardization landscape is rapidly evolving, with multiple initiatives converging toward common requirements. Rather than waiting for all standards to finalize, OpenEPCIS provides:

- **Early implementation** of emerging requirements from ESPR, CIRPASS2, and JTC 24
- **Open-source vocabulary** that can evolve alongside the standards
- **Practical examples** that help the community understand how DPP data works
- **Bridge contexts** for interoperability with other initiatives

This approach lets implementers start building today while standards mature. As CEN/CENELEC JTC 24 and other bodies finalize their specifications, we commit to aligning OpenEPCIS accordingly.

## European Standardization: CEN/CENELEC JTC 24

**CEN/CENELEC JTC 24** (Joint Technical Committee 24) is the official European standardization body for Digital Product Passports under ESPR. Established in 2023, JTC 24 develops the harmonised European standards under Standardisation Request **M/604** that define how DPPs work across the EU.

### The 8 Harmonised EN Standards

The original work item prEN 17957 has been split into **8 individual standards**. Six have reached FprEN (final draft) stage as of March 2026.

| Standard | Title | WG | Status | OpenEPCIS Alignment |
|----------|-------|----|--------|---------------------|
| **EN 18219** | Unique identifiers | WG 2 | FprEN — publishes March 2026 | **Strong** — GS1 GTIN confirmed as identifier; native to our architecture |
| **EN 18220** | Data carriers and links (physical ↔ digital) | WG 2 | FprEN — publishes March 2026 | **Aligned** — GS1 Digital Link, QR code primary; NFC supplementary per WR 26-108 |
| **EN 18216** | Data exchange protocols | WG 4 | FprEN — publishes March 2026 | **Aligned** — HTTPS/REST/JSON = our JSON-LD delivery |
| **EN 18221** | Data storage, archiving, and persistence | WG 4 | FprEN — publishes March 2026 | **Partial** — Versioning via `dpp:passportVersion`; backup/archival roadmap |
| **EN 18222** | APIs for lifecycle management and searchability | WG 4 | FprEN — publishes March 2026 | **In progress** — `dpp:PassportStatus`, lifecycle vocabulary |
| **EN 18223** | Interoperability (technical, semantic, organisational) | WG 4 | FprEN — publishes March 2026 | **Strong** — JSON-LD, RDF/OWL, SHACL = our core stack; `rdfs:isDefinedBy`, `owl:versionIRI` for registry discovery |
| **prEN 18239** | Access rights, security, business confidentiality | WG 3 | In development | **Partial** — `dpp:AccessRights`/`dpp:AccessLevel` covers three-tier model; role-based expansion tracked |
| **prEN 18246** | Data authentication, reliability, and integrity | WG 5 | In development | **Partial** — `dpp:did`, `dpp:identityCredentialUrl`; ESDC/VC integration tracked |

**Sources:**
- [prEN 18222 on iTeh Standards](https://standards.iteh.ai/catalog/standards/cen/2d02edd9-ec28-4eb3-b99a-6a84c0a84257/pren-18222)
- [prEN 18223 on iTeh Standards](https://standards.iteh.ai/catalog/standards/cen/a5416a2a-bea0-4ad4-9621-8028c96fc621/pren-18223)
- [JTC 24 overview on iTeh](https://standards.iteh.ai/catalog/tc/cen/b2e63c3a-8446-4d3f-b148-51c2b3928ecd/jtc-24)

### Methodology Standards (Published)

| Standard | Title | OpenEPCIS Alignment |
|----------|-------|---------------------|
| **EN 45552** | General method for durability assessment | `dpp:PerformanceInfo`, `dpp:expectedLifespan` |
| **EN 45553** | General method for remanufacturability assessment | `dpp:CircularityPerformance` |
| **EN 45554** | General method for repair, reuse, upgrade assessment | `dpp:RepairabilityInfo` |
| **EN 45555** | General method for recyclability/recoverability assessment | `dpp:recyclableContent`, `dpp:CircularityPerformance` |

### Key Developments

- **OPC Foundation liaison agreement** (Feb 2026) for digital twin interoperability with DPP ([source](https://www.cencenelec.eu/news-events/news/2026/brief-news/2026-02-24-opcf-liaison-agreement/))
- **CEN/CENELEC Work Programme 2026** confirms DPP as a priority ([source](https://www.cencenelec.eu/news-events/news/2026/brief-news/2026-02-04-work-programme-2026/))
- **JRC Methodology Report** (JRC145830, March 2026) defines core DPP (immutable) vs. lifecycle log (dynamic) framework ([source](https://publications.jrc.ec.europa.eu/repository/handle/JRC145830))
- JTC 24 interview on progress: [wiot-group.com](https://wiot-group.com/think/en/articles/otto-handle-cen-cenelec-on-eu-digital-product-passport/)

### How OpenEPCIS Aligns with JTC 24

**EN 18219 (Identifiers)** — GS1 GTIN is confirmed as *the* product identifier. OpenEPCIS is GS1-native, supporting GTIN at model, batch, and item granularity via `dpp:granularityLevel`.

**EN 18220 (Data Carriers)** — QR codes with GS1 Digital Link URIs are the primary data carrier. NFC tags carrying the same GS1 Digital Link URI are supported as supplementary carriers per WR 26-108. OpenEPCIS vocabulary is designed for resolution via GS1 Digital Link resolvers.

**EN 18216 (Data Exchange)** — HTTPS + REST + JSON. OpenEPCIS delivers JSON-LD over HTTPS, fully compatible.

**EN 18221 (Storage & Persistence)** — Passport versioning via `dpp:passportVersion` and `dpp:previousPassportVersion`. Archival and certified-backup-provider requirements (ESPR Art. 9(3a)) are on the roadmap.

**EN 18222 (APIs)** — OpenEPCIS provides vocabulary for DPP lifecycle management: `dpp:PassportStatus` (Draft, Active, Updated, Withdrawn, Archived), `dpp:passportIssueDate`, `dpp:passportLastModified`, `dpp:passportExpiryDate`. The immutable-core vs. dynamic-lifecycle-log distinction maps naturally to EPCIS events for the dynamic part.

**EN 18223 (Interoperability)** — This standard prescribes JSON-LD, RDF, OWL, and SHACL — exactly our technology stack. OpenEPCIS ontologies are defined in RDF/OWL (Turtle), serialized as JSON-LD, and validated with SHACL shapes across all 6 domain modules. Every class and property declares `rdfs:isDefinedBy` for registry/browser discovery. All ontologies carry `owl:versionIRI` for formal semantic versioning per OWL2 Section 3.4.

**prEN 18239 (Access Rights)** — `dpp:AccessLevel` implements the three-tier model (Public, AuthorizedOnly, Restricted). Role-based differentiation (consumer, regulator, recycler, repairer, customs, etc.) tracked and will be added as the standard finalises.

**prEN 18246 (Data Authentication)** — `dpp:did` and `dpp:identityCredentialUrl` support decentralized identity. Verifiable Credentials and Electronically Signed Data Constructs (ESDC) integration will follow the standard.

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
| **CEN/CENELEC JTC 24** | EN 18216-18223 + prEN 18239/18246 (8 standards) | Multi-sector | 6 of 8 at FprEN publishing March 2026 | Confirmed (EN 18219 = GS1 GTIN) |
| **OpenEPCIS DPP-Ready** | GS1 Web Vocab + EPCIS 2.0 | Multi-sector | Production v0.9.5 | Native |
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
| **CEN/CENELEC JTC 24** | Strong (6/8 standards) | Strong | EN 18216-18223 (FprEN) + prEN 18239/18246 (in development); see detailed alignment above |
| **UNTP** | 22 | 9 | `owl:equivalentProperty`, aligned with v0.6.1 (GitLab) |
| **CIRPASS2** | Requirements coverage | Bridge context | `cirpass2-bridge-context.jsonld` + `CIRPASS2_COVERAGE.md` |
| **ESPR 2024/1781** | Full | Full | Core module covers all Article 7/9 requirements |
| **EN 45552-45555** | Methodology support | N/A | Properties to store assessment results |
| **Battery Reg 2023/1542** | Full Annex XIII | Domain-specific | `battery:` module |
| **Textile Strategy** | Anticipated | Domain-specific | `textile:` module |

## GS1 Web Vocabulary

**Integration Method**: `owl:imports <https://ref.gs1.org/voc/>`

OpenEPCIS is built natively on GS1 Web Vocabulary patterns:

| GS1 Pattern | OpenEPCIS Usage |
|-------------|-----------------|
| `gs1:Organization` | Base class for `dpp:OperatorInformation` |
| `gs1:Place` | Base class for `dpp:FacilityInformation` |
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
| `dpp:carbonFootprintTotal` | `untp:carbonFootprint` | Total lifecycle CO2e |
| `dpp:declaredUnit` | `untp:declaredUnit` | Functional unit |
| `dpp:recycledContent` | `untp:recycledContent` | Total recycled percentage |
| `dpp:recyclableContent` | `untp:recyclableContent` | Recyclability percentage |
| `dpp:massFraction` | `untp:massFraction` | Material mass fraction |
| `dpp:utilityFactor` | `untp:utilityFactor` | Durability multiplier |
| `dpp:materialCircularityIndicator` | `untp:materialCircularityIndicator` | MCI score |
| `dpp:primarySourcedRatio` | `untp:primarySourcedRatio` | Direct measurement ratio |
| `dpp:operationalScope` | `untp:operationalScope` | Lifecycle boundary |
| `dpp:verifiedRatio` | `untp:verifiedRatio` | Traceability verification |
| `dpp:granularityLevel` | `untp:granularityLevel` | Product/Batch/Item |

### Class Alignment

| OpenEPCIS Class | UNTP Equivalent | Notes |
|-----------------|-----------------|-------|
| `dpp:CircularityPerformance` | `untp:CircularityPerformance` | Circularity metrics container |
| `dpp:EmissionsPerformance` | `untp:EmissionsPerformance` | Emissions data container |
| `dpp:TraceabilityPerformance` | `untp:TraceabilityPerformance` | Traceability metrics |
| `dpp:MaterialComposition` | `untp:Material` | Material composition |
| `dpp:DigitalProductPassport` | `untp:ProductPassport` | New in v0.6.x |
| `dpp:FacilityInformation` | `untp:FacilityRecord` | New in v0.6.x |
| `dpp:ConformityDeclaration` | `untp:ConformityAttestation` | New in v0.6.x |

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

**Integration Method**: Full implementation in `dpp:` core module

| ESPR Requirement | OpenEPCIS Implementation |
|-----------------|-------------------------|
| Article 7 - Performance/Durability | `dpp:PerformanceInfo`, `dpp:expectedLifespan` |
| Article 7 - Repairability | `dpp:RepairabilityInfo`, `dpp:repairabilityScore` |
| Article 8 - Substances of Concern | `dpp:SubstanceOfConcern`, SCIP alignment |
| Article 9 - Access Rights | `dpp:AccessRights`, `dpp:AccessLevel` |
| Article 77 - Operator ID | `dpp:economicOperatorId`, `dpp:OperatorRole` |

## CEN/CENELEC JTC 24 Methodology Standards

The EN 45552-45555 series defines *how* to assess product characteristics. OpenEPCIS provides *where* to store the results.

### EN 45552 - Durability Assessment

| Assessment Output | OpenEPCIS Property |
|-------------------|-------------------|
| Expected lifetime | `dpp:expectedLifespan` |
| Guaranteed lifetime | `dpp:guaranteedLifespan` |
| Usage cycles | `dpp:usageCycles` |
| Technical lifetime | `dpp:technicalLifetime` |
| Test conditions | `dpp:testedConditions` |

### EN 45554 - Repairability Assessment

| Assessment Output | OpenEPCIS Property |
|-------------------|-------------------|
| Repairability score | `dpp:repairabilityScore` |
| Repairability class | `dpp:repairabilityClass` (A-E) |
| Spare parts availability | `dpp:sparePartsAvailability` |
| Repair documentation | `dpp:repairInstructions` |
| Professional repair access | `dpp:professionalRepairNetwork` |
| DIY repairability | `dpp:diyRepairPossible` |

### EN 45555 - Recyclability Assessment

| Assessment Output | OpenEPCIS Property |
|-------------------|-------------------|
| Recyclability rate | `dpp:recyclableContent` |
| Recovery rate | `dpp:CircularityPerformance` |
| Material composition | `dpp:MaterialComposition` |
| Disassembly info | `dpp:dismantlingInstructions` |

### EN 45553 - Remanufacturability Assessment

| Assessment Output | OpenEPCIS Property |
|-------------------|-------------------|
| Remanufacturing potential | `dpp:CircularityPerformance` |
| Component accessibility | `dpp:dismantlingInstructions` |
| Material circularity | `dpp:materialCircularityIndicator` |

## Superior OpenEPCIS Patterns

These OpenEPCIS patterns are more comprehensive than alternatives:

| Pattern | Why Superior |
|---------|-------------|
| `dpp:OperatorInformation` | Full ESPR Article 77 role enumeration (Manufacturer, Importer, Distributor, AuthorisedRepresentative, FulfilmentServiceProvider, etc.) |
| `dpp:FacilityInformation` | GLN support, facility certifications, facility type - extends `gs1:Place` |
| `dpp:SubstanceOfConcern` | Full SCIP database alignment (SCIP ID, EC Number, safe use instructions) |
| `dpp:RepairabilityInfo` | Complete French Repairability Index support (score, class, spare parts, DIY repair) |
| `dpp:AccessLevel` | Three-tier ESPR Article 9 access control (Public, AuthorizedOnly, Restricted) |
| `battery:*` module | Complete Battery Regulation Annex XIII coverage with DIN DKE SPEC 99100 |
| `textile:*` module | ISO 3758 care symbols, microplastic info, durability classes |

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
- **EU DPP Registry** — goes live July 2026 per ESPR Art. 12; stores unique product, operator, and facility identifiers
- **EU Customs Single Window (CSV-CERTEX)** — ESPR Art. 13 customs interconnect; products cannot clear customs without a registered DPP once a product-specific Delegated Act enters into force

### Methodology
- **JRC Methodology Report** (JRC145830, March 2026) — defines immutable core vs. dynamic lifecycle log framework; directly relevant to `dpp:PassportStatus` and EN 18221 storage patterns ([source](https://publications.jrc.ec.europa.eu/repository/handle/JRC145830))
- **EN 45552–45555** — general methods for durability, remanufacturability, repair/reuse/upgrade, recyclability/recoverability assessment

### GS1 GSMP tracked work requests
- **WR 23-103** — foundational DPP GSCN; introduces GenSpecs Section 2.1.16 "ESPR"
- **WR 26-081** — Extended Packaging / Web-based Information GSCN (Community eBallot)
- **WR 26-108** — NFC as additional data carrier (Community Review)
- **WR 25-212** — ITIP (Individual Trade Item Piece) identification (Community Review)
- **WR 25-252** — EUDR exemptions in EANCOM, GS1 XML, GDSN (eBallot / Community Review)
- **WR 26-122** — EUDR exemptions in GDSN (Community Review)
