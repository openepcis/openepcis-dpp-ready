# CEN/CENELEC JTC 24 DPP standards: clause-by-clause conformance map

This document maps the eight published CEN/CENELEC JTC 24 Digital Product
Passport standards to OpenEPCIS, clause by clause. It records what each
standard actually requires and how the **EPCIS4DPP** profile (OpenEPCIS's
GS1 and EPCIS based realisation) conforms to it.

**Terminology.** *Compliance* refers to meeting a regulatory requirement
(ESPR, the Battery Regulation). *Conformance* refers to adhering to a
published standard (a CEN/CENELEC DPP standard or a GS1 standard). The
CEN standards define neutral models; EPCIS4DPP is one conformant way to
realise them.

**EPCIS4DPP** (informal name) is the OpenEPCIS profile that binds the
neutral CEN models to a concrete GS1 and EPCIS implementation: GS1
identifiers, the GS1 Digital Link data carrier, EPCIS 2.0 events as the
dynamic lifecycle layer, the GS1 Web Vocabulary plus ref.openepcis.org as
the semantic dictionary, and JSON-LD as the serialisation. The standards
do not require these specific choices; EPCIS4DPP adopts them.

**Source handling.** The standards are published by CEN/CENELEC and
adopted nationally (for example as NEN-EN). They are licensed documents.
This map cites clause numbers and paraphrases; it reproduces no
substantial text. Read the standards themselves for the normative wording.

**Status legend:** *Conformant* (EPCIS4DPP satisfies it today) ·
*Partial* (satisfied in part, remainder tracked) · *Planned* (tracked in
[`EN18223_MODEL_ALIGNMENT.md`](./EN18223_MODEL_ALIGNMENT.md)) ·
*Profile choice* (an EPCIS4DPP decision the standard leaves open).

---

## EN 18219:2026 (Unique identifiers)

**Scope (Clause 1).** Requirements and guidelines for unique product,
economic-operator, and facility identifiers, across global uniqueness,
persistence, syntax, granularity, interoperability, and openness. Three
granularity levels: model, batch, item.

**Key requirements.**
- The standard is **identifier-scheme-neutral**. A product identifier
  shall meet the Clause 4 requirements and use one of five schemes in
  Clause 5: GS1 Application Identifier or ASC MH10.8.2 Data Identifier
  (5.2), IEC 61406 Identification Link (5.3), W3C Decentralized
  Identifier (5.4), RAIN RFID (5.5), Digital Object Identifier (5.6).
  Operator and facility identifiers are specified separately (Clause 6,
  including GLN).
- Clause 4 requirements apply to every scheme: global uniqueness (no
  reassignment, cross-domain uniqueness provided to registries),
  persistence (including survival of insolvency or liquidation), syntax
  (a URL or derivable to a URL), interoperability (retrievable from a
  data carrier per EN 18220), and openness (public access without
  registration, app download, or credentials).
- Granularity (4.4): an identifier is unique at the smallest level it
  serves; the granularity level stays consistent once on the market; a
  change of granularity requires a new identifier.

**EPCIS4DPP conformance.**
- We adopt the GS1 scheme of Clause 5.2 (GS1 Application Identifiers):
  GTIN for the product, GTIN + serial for the item, GLN for operators
  and facilities, GIAI/GRAI for assets. This is a **profile choice**
  among the five permitted schemes.
- `oec:granularityLevel` uses the standard's own enumeration **model /
  batch / item** (exact match). In EPCIS4DPP the level is **derived from
  the GS1 Digital Link key qualifiers (Application Identifiers)** on the
  identifier, so it is not an independent free-form value:
    - `01/{gtin}` → model
    - `01/{gtin}/10/{lot}` → batch
    - `01/{gtin}/21/{serial}` → item
  (AI `22`, consumer product variant, refines the model.) *Planned:* a
  validation rule that derives granularity from the AIs present and
  enforces the EN 18219 (4.4) consistency rule against the identifier.
- Economic-operator and facility identifiers are modelled distinctly
  (`oec:OperatorInformation`, `oec:FacilityInformation`), matching the
  separate operator/facility requirements of Clause 6.
- EUID/EOID/FID: EN 18219 does not name the EU registry identifiers, so
  carrying GS1 keys alongside registry identifiers is an EPCIS4DPP
  **profile choice**, not a standard requirement.

**Status:** Conformant (GS1 scheme); granularity exact; consistency rule Planned.

---

## EN 18220:2026 (Data carriers)

**Scope (Clause 1).** Requirements for data carriers: symbology, format,
error correction, encoding, print and production quality, durability,
recognition indicators, placement, machine readability, and the link
between the physical product and its digital representation. Out of
scope: architecture and use cases, secure elements and cryptography.

**Key requirements.**
- A data carrier shall encode a unique product identifier that allows
  access to the DPP and complies with the EN 18219 identifier rules
  (5.2.1).
- The standard treats multiple carriers as valid: 2D barcodes (QR per
  ISO/IEC 18004:2024; Data Matrix per ISO/IEC 16022:2024) and RFID (HF
  RFID, NFC at 13.56 MHz, RAIN/UHF RFID per ISO/IEC 18000-63). No single
  carrier is designated primary.
- Print quality is specified (for example QR per ISO/IEC 15415:2024).
  Human-readable interpretation uses OCR-B (ISO 1073-2). A graphical
  marking may indicate the presence of a DPP carrier (5.7).
- For consumers, the identifier shall be usable without registration,
  app download, or credentials; decoding should be native to the device
  operating system (5.3.4).
- Annex B shows identifier schemes including the GS1 Digital Link Web
  URI, IEC 61406, DIDs, RAIN RFID, and DOI.

**EPCIS4DPP conformance.**
- We adopt a **QR code carrying a GS1 Digital Link URI** as the primary
  carrier, with NFC carrying the same URI as a supplementary carrier.
  This is a **profile choice**; the standard permits several carriers.
- *Planned:* document carrier conformance (ISO/IEC 18004 symbology,
  print-quality grade, OCR-B HRI, placement, DPP graphical marker) in
  the implementation guidance and examples.

**EPCIS4DPP profile, beyond the standard.** RFC 9264 linksets, GS1 Web
Vocabulary link types (`gs1:dpp`, `gs1:pip`, `gs1:epcis`, and the rest),
and resolver behaviour are GS1 ecosystem mechanisms. EN 18220 does not
mention linksets, link types, or resolvers. EPCIS4DPP uses them; the
standard neither requires nor forbids them.

**Status:** Conformant (GS1 Digital Link is a permitted carrier); carrier-quality documentation Planned.

---

## EN 18216:2026 (Data exchange protocols)

**Scope (Clause 1).** Secure data exchange protocols and data formats
for the DPP, so that data is human- and machine-readable, structured,
searchable, and transferable over an open network without vendor lock-in.

**Key requirements.**
- Transport (Clause 4): HTTPS, with TLS 1.2 as the minimum (TLS 1.3
  strongly recommended; older TLS and all SSL prohibited), and HTTP/2 as
  the minimum (HTTP/3 recommended). The API style **should** be RESTful;
  EN 18222 specifies the API interaction.
- Data formats (Clause 5): JSON (ISO/IEC 21778:2017) is the base format;
  XML, JSON-LD, and HTML may be used via HTTP content negotiation. Human
  readable rendering shall meet EN 301549:2021 accessibility and W3C HTML.

**EPCIS4DPP conformance.**
- We serve over HTTPS with content negotiation, delivering JSON-LD to
  machines and HTML to people, which satisfies Clause 5. *Planned:*
  state the TLS 1.2+/HTTP-2 minimums and EN 301549 accessibility in the
  deployment guidance and exercise content negotiation in the Bruno
  collection.

**EPCIS4DPP profile, beyond the standard.** EN 18216 does not mention
EPCIS. EPCIS 2.0 (capture and query) is the EPCIS4DPP layer for the
dynamic lifecycle log; it runs over the same HTTPS/REST/JSON transport
the standard prescribes, as an EPCIS4DPP addition.

**Status:** Conformant on transport and formats.

---

## EN 18221:2026 (Data storage, archiving, and data persistence)

**Scope (Clause 1).** Storage, archiving, and persistence on a
decentralized basis, including replication between an economic operator
and a back-up operator, and rules for defining data lifetime.

**Key requirements.**
- Storage (4.1) is decentralized and **technology-neutral**: the
  standard does not impose a storage technology. Stored data shall be
  accurate, complete, and reflect all relevant changes.
- Archiving (4.2): begins at the first change to the initial DPP; all
  changes shall be archived (product-specific requirements may exempt,
  for example, real-time sensor data); archived versions are retained
  for the DPP lifetime and retrievable by authenticated and authorized
  actors; integrity per EN 18246; archiving should follow ISO 14721
  (OAIS).
- Persistence (4.3) and replication (4.5): a back-up copy is held by a
  back-up DPP service provider, replicated over the EN 18222 lifecycle
  API or another agreed secure mechanism, over an EN 18216 protocol,
  with a Recovery Point Objective to bound data loss. Roles defined: the
  (main) DPP service provider and the back-up DPP service provider.
- DPP lifetime (3.4) is the period a regulation requires the DPP to
  remain available; no fixed duration is set.

**EPCIS4DPP conformance.**
- Our EPCIS event store is append-only, and the immutable-core passport
  is versioned, which is a **conformant implementation pattern** for the
  archiving and persistence requirements. The standard is
  technology-neutral, so it does not mandate this pattern.
- *Planned:* model the main and back-up DPP service provider roles, the
  archiving-on-first-change trigger, the sensor-data archival exemption,
  the Recovery Point Objective, and OAIS conformance; carry data lifetime
  as a regulation-driven property.
- Integrity (EN 18246) is referenced normatively here and is tracked
  pending that standard's publication.

**Status:** Partial (append-only + versioning conformant; provider roles, RPO, OAIS, lifetime Planned).

---

## EN 18222:2026 (APIs for the product passport lifecycle management and searchability)

**Scope (Clause 1).** A standardized DPP API for searchability and for
interactions across a product's DPP lifecycle. Methods are specified
abstractly (Clause 4), with a REST-HTTP implementation in Clause 8. The
payload content follows EN 18223, the protocol and serialisation follow
EN 18216, and access and security follow EN 18246.

**Key requirements (Clauses 4 to 6).** A concrete method set, each
returning a `statusCode`:
- Life Cycle API: `ReadDPPById`, `ReadDPPByProductId` (current active
  version, product id per EN 18219), `ReadDPPVersionByIdAndDate`,
  `ReadDPPIdsByProductIds` (with `limit`/`cursor` pagination),
  `ReadDataElement`, `CreateDPP`, `UpdateDPPById` (partial update; all
  changes shall be archived per EN 18221), `DeleteDPPById`,
  `UpdateDataElement`.
- Searchability is provided by the product-id query methods
  (`ReadDPPByProductId`, `ReadDPPIdsByProductIds`,
  `ReadDPPVersionByProductIdAndDate`). Content negotiation per EN 18216
  should be used where multiple response types are supported.
- DPP Registry API (Clause 5): `RegisterProductDPP` takes a
  `DppRegistryEntry` and returns a registration identifier.
- Fine-granular API (Clause 6): `ReadDataElement` and `UpdateDataElement`
  address a single data element by its path.

**EPCIS4DPP conformance.**
- *Planned:* expose the EN 18222 method set over the OpenEPCIS
  repository as the standard DPP API surface. Method-to-endpoint mapping
  is tracked in [`EN18223_MODEL_ALIGNMENT.md`](./EN18223_MODEL_ALIGNMENT.md).

**EPCIS4DPP profile, beyond the standard.** EN 18222's "searchability"
is product-id discovery with pagination. It does not define EPCIS-style
queries (by EPC, business step, disposition, location, or time window).
EPCIS4DPP adds the EPCIS 2.0 query interface for the lifecycle event log,
and the GS1 Digital Link resolver for carrier-to-resource discovery, as
profile additions alongside the EN 18222 API.

**Status:** Planned (the EN 18222 method surface); EPCIS query and resolver are profile additions.

---

## EN 18223:2026 (System interoperability)

**Scope (Clause 1).** The semantic description of a product and its
lifecycle, a common information model for data-dictionary systems,
metadata models and formats for exchange, and rules for using them in
product-group data models. It addresses interoperability at three levels
named in the Introduction: organisational, semantic, and technical.

**Key requirements.**
- The information model is expressed as a **UML class model** with a
  **plain-JSON serialisation** (Clause 5); the prose of Clause 4 is
  authoritative. The standard does not prescribe JSON-LD, RDF, OWL, or
  SHACL.
- `DigitalProductPassport` (4.1.2.1, Table 1) carries:
  `digitalProductPassportId` (globally unique, should be a URI),
  `uniqueProductIdentifier` (per EN 18219), `granularity`
  (model/batch/item), `dppSchemaVersion`, `dppStatus` (example values
  active/inactive/archived/invalid, extensible by legal acts),
  `lastUpdated` (ISO 8601 UTC), `economicOperatorId`, `facilityId` (0..1),
  `contentSpecificationIds`, and any number of `DataElement`s.
- `DataElement` (4.1.2.3, abstract) has `elementId` and an optional
  `dictionaryReference`; concrete subclasses are `DataElementCollection`,
  `SingleValuedDataElement`, `MultiValuedDataElement`, `RelatedResource`,
  and `MultiLanguageDataElement`. Value types follow XSD-to-JSON rules
  (4.1.2.9).
- Change management (4.2): every change should be tracked (identifier,
  timestamp, actor per EN 18239, changed properties) and archived per
  EN 18221.
- Data-dictionary repositories (4.3): a **decoupled approach**. Each data
  point references a machine-readable definition in a repository; each
  definition has a unique identifier, occurs once, and the model allows
  mapping between catalogues.

**EPCIS4DPP conformance.**
- The `DigitalProductPassport` attributes map almost one-to-one onto
  `oec:` core. Reconciliation of attribute names and `dppStatus` values
  is tracked in [`EN18223_MODEL_ALIGNMENT.md`](./EN18223_MODEL_ALIGNMENT.md).
- **ref.openepcis.org is a data-dictionary repository in the sense of
  4.3.** Our class and property IRIs are valid `dictionaryReference`
  values, each unique and resolvable, with cross-catalogue mapping via
  `owl:equivalentClass`/`owl:equivalentProperty` to GS1, SEMICeu, and
  UNTP. This is a direct, accurate fit.
- Our GS1 Web Vocabulary + Digital Link JSON-LD is the EN 18223 **compressed**
  serialization (key-value data points, clauses 5.2.6 to 5.2.9). The converter
  `scripts/derive-en18223.ts` derives the EN 18223 **expanded** Annex A form
  (`elements[]` of `{elementId, objectType, dictionaryReference, valueDataType,
  value}`) from it, using the `@context` IRIs as `dictionaryReference` (into the
  ref.openepcis.org §4.3 dictionary) and the ontology ranges as `valueDataType`.
  JSON-LD remains an EPCIS4DPP **profile choice** for the technical layer; the
  standard requires only JSON. For the rationale behind that choice, see the
  "Two routes to interoperability" observation in
  [`GS1_STACK_EN182XX_WHITEPAPER.md`](./GS1_STACK_EN182XX_WHITEPAPER.md).

**Status:** Conformant (model maps to `oec:`; ref.openepcis.org is a 4.3 repository; compressed↦expanded converter shipped); attribute/`dppStatus` alignment Planned.

---

## EN 18239:2026 (Access rights management, information system security, and business confidentiality)

**Scope (Clause 1).** Access-rights management for the DPP, including IT
security, data protection, and the transfer of responsibilities between
economic operators; a framework for managing access to confidential
information, with public DPP data readable without any restriction.

**Key requirements.**
- Actors (Clause 4.2): the standard enumerates who needs access along the
  life cycle — economic operators and their sub-roles (manufacturer,
  authorised representative, importer, distributor, dealer, fulfilment
  service provider), consumers, professional repairers, independent
  operators, recyclers, market surveillance authorities, customs
  authorities, DPP service providers (main and back-up) — plus the
  *notified actor* of 3.6. Roles are defined per product group by the
  relevant legal act; the economic operator may grant additional
  privileges (5.2.6, 5.2.7).
- Identity (5.2.1, 5.2.4, 5.2.8): every actor carries a globally unique
  operator identifier per EN 18219, and that identifier is part of the
  authentication process — for example inside a trustworthy role
  credential that admits an actor without the operator's individual
  approval.
- Public data (5.2.2, 5.2.3, 6.1): readable without authentication and
  never withheld on the basis of location or jurisdiction.
- Granularity (5.2.10, 5.2.23): access-rights terms are defined, and
  enforced, at data-element level, according to the requesting actor's
  role.
- Accountability (5.2.5, 5.2.16): management of controlled data uses
  non-repudiation mechanisms; every access to, and every change of,
  roles, rights or controlled data is logged, auditable, and protected
  against tampering, forging and deletion, with integrity over time.
- Life cycle of rights (5.2.17, 5.2.19, 6.3): documented grant / revoke /
  modify processes, emergency revocation, a revocation policy.
- Delegation (5.2.18, 5.2.20): access roles can be delegated; the
  authorisation then also weighs the delegating entity's role and the
  robustness of the delegation itself.
- Protection (5.2.11, 5.2.24): limits against attacks and mass scraping;
  no user profiling unless authentication is strictly required.
- Operations (Clause 6.4, 6.5): business continuity, security by design,
  incident response, ISMS continuous improvement (ISO 27001 PDCA) — all
  *should*-level, organisational.

**EPCIS4DPP conformance.**
- Actor taxonomy: `oec:ActorRole` carries Clause 4.2 and 3.6 verbatim,
  with the economic-operator sub-roles as `oec:OperatorRole`
  (Conformant). The EUDR supply-chain positions live in the same
  enumeration, so no module mints a role list of its own.
- Roles per legal act: the access-level sidecars state which roles each
  governing act admits to a tier (`oec:authorizedOnlyGrantedToRole`,
  `oec:restrictedGrantedToRole`) or to a single term
  (`oec:accessGrantedToRole`, only together with
  `oec:accessLevelMandatedBy`) — dpp-core for ESPR Art. 9, battery for
  Annex XIII(3) and the Art. 14 / Annex VII state-of-health terms, EUDR
  for Arts. 26 and 33 (Conformant for those three modules; the other
  regulation modules inherit the core defaults until their acts fix an
  audience).
- Element-level enforcement by role: the Digital Link resolver filters
  controlled fields per tier and, for actors outside the owning economic
  operator, per audience (role gate); roles are minted from realm roles
  declared trustworthy by the deployment (Conformant for reads of master
  data and linksets; the DPP API decides whole-passport read/write by
  role, not per element — Partial).
- Public data without authentication, and never by location: the
  resolver's anonymous path (Conformant).
- Operator identifier in authentication (5.2.1, 5.2.8): *In progress* —
  the `operator_id` claim (EN 18219 GLN URI) is being added to the
  platform realm and carried into every change record.
- Logging and non-repudiation (5.2.5, 5.2.16): *Planned* — the DPP API
  keeps a signed version graph of passport changes; access logging and
  role/right change logging are not yet built.
- Delegation assessment (5.2.20): *Planned* — capability tokens delegate
  a path but do not yet carry an assessable chain.
- Clause 6 operations: organisational, outside this map.

**EPCIS4DPP profile, beyond the standard.** The role vocabulary is
published RDF with SKOS alignment, so a third party can read which roles a
passport field admits before asking for it; the standard requires the
rule, not its publication.

**Status:** Partial — vocabulary and element-level enforcement by role
conformant; operator identifier in progress; logging and delegation
assessment planned.

---

## EN 18246:2026 (Data authentication, reliability and integrity)

**Scope (Clause 1).** Secure information processing and communication
that safeguards integrity, authenticity and reliability of DPP data,
minimising fraud and counterfeiting; a framework for trust and
interoperation via *electronically signed data constructs* (ESDC).
System architecture, use cases, data-carrier secure elements and
cryptographic identifier features are out of scope.

**Key requirements.**
- Independence from transport (4.1): the mechanisms that ensure integrity
  and authenticity are independent of the security of the communication
  channel — a signature on the data, not only TLS.
- Identification (4.2): every actor accessing controlled data is
  identified by a globally unique identifier; authentication is based on
  the required level of assurance.
- Public data (4.3, 5.4.2): readable without authentication, without
  additional software, with measures against profiling; additional
  security must never block public access.
- Authenticity and integrity (4.7): a DPP is verifiable, and verification
  is free of charge and without limitation for the verifier; every
  modification, including creation and deletion, is bound to the
  authenticated actor's identity with non-repudiation; changes are logged
  tamper-proof with integrity over time, verifiable without offline
  procedures; the responsible editor is identifiable through a globally
  unique operator identifier.
- Personal data and the public page (5.1.2, 5.1.3, 5.1.6): no personal
  data gathered from public readers; the DPP service uses no external
  analytics tools and includes no reference to external components in
  its response; no personal data or advanced device functions requested.
- Protection (5.1.5, 5.1.7, 5.1.8): profiling prevented where technically
  feasible; phishing/quishing awareness; anti-scraping, while search
  engines may index.
- Data carrier and identifier (4.5, 4.6, 5.3.1): protecting the
  identifier or the carrier is optional, must stay interoperable with
  EN 18219/18220, and must never require additional software for public
  data; a counterfeiting risk assessment *should* be done and
  proportionate measures *may* follow.
- Accessibility (5.4.3): public content perceivable and operable for
  persons with disabilities, without weakening security.
- ESDC (Annex A, normative): an ESDC has an issuer, a subject, data and a
  signature; it verifies integrity, authenticity, non-repudiation of the
  issuer, and the issuer's authority against a trusted list or governance
  framework. Annex B (informative) lists EAA, VDS (ISO 22376), DigSig
  (ISO/IEC 20248), W3C Verifiable Credentials and AdES signatures as
  realisations.

**EPCIS4DPP conformance.**
- ESDC realisation: W3C Verifiable Credentials (VCDM 2.0) with Data
  Integrity `ecdsa-rdfc-2019` and VC-JOSE/SD-JWT, issuer identity by
  `did:web`, evidence by `relatedResource` digests; an OpenEPCIS
  credential verifies at a third-party verifier and a real GS1 licence
  credential verifies here (Conformant for Annex A's first three
  capabilities; see [`VC_INTEROPERABILITY.md`](./VC_INTEROPERABILITY.md)
  for the evidence grade of every layer).
- Issuer authority against a trusted list (Annex A.3, fourth capability):
  Partial — the `TrustRoot` SPI and a per-tenant trusted-issuer registry
  exist; the published, signed issuer list and the GS1 licence-chain
  source are not yet built.
- Transport independence (4.1): Conformant for credentials; plain
  resolver responses rely on TLS only.
- Change binding and logging (4.7): Partial — the DPP API keeps a Git
  version graph with signed checkpoints per operator; binding each
  amendment to the authenticated actor is in progress, a tamper-evident
  access and change log across resolver, trust registry and keys is
  planned.
- Free, unrestricted verification (4.7): Partial — the verification
  endpoint resolves only vendored contexts today, so a foreign credential
  with an unknown context fails there although the library verifies it.
- Public page without external components (5.1.3), no profiling (5.1.5),
  no device functions (5.1.6), accessibility (5.4.3): *To be audited* on
  the public DPP page; the resolver's JSON responses carry no external
  references.
- Anti-scraping (5.1.8): Partial — rate limiting exists for
  authenticated callers, not yet on the anonymous path.
- Data-carrier protection (4.5, 4.6, 5.3.1): Profile choice, not taken
  yet — EPCIS4DPP signs the passport, not the link; a signed Digital Link
  is tracked as a product option.

**EPCIS4DPP profile, beyond the standard.** The standard is technology
neutral and lists Verifiable Credentials as one example. EPCIS4DPP
commits to them because every trust source the ecosystem converges on —
GS1 Digital Licences, EUDI/eIDAS attestations, UNTP — is expressed as a
Verifiable Credential, and because Annex A's trusted-list check and
EN 18239's role credential (5.2.8) describe exactly what a credential
verifier does.

**Status:** Partial — ESDC mechanism conformant and demonstrated against
third parties; actor binding in progress; trusted list, access log,
unrestricted verification and the public-page audit open.

---

## Quick reference: where each standard places a requirement

| Standard | Defines | EPCIS4DPP realisation |
|----------|---------|-----------------------|
| EN 18219 | Identifier requirements + 5 schemes | GS1 keys (scheme 5.2); granularity model/batch/item |
| EN 18220 | Data-carrier requirements (multiple carriers) | QR + GS1 Digital Link, NFC supplementary |
| EN 18216 | HTTPS/TLS/HTTP-2 + JSON + content negotiation | JSON-LD + HTML over HTTPS; EPCIS transport reuses it |
| EN 18221 | Storage/archiving/persistence + provider roles | Append-only EPCIS + versioned core (a conformant pattern) |
| EN 18222 | Concrete DPP REST API (method set + registry) | Expose the method surface (Planned); EPCIS query + resolver added |
| EN 18223 | UML+JSON information model + data dictionary | `oec:` core maps to it; ref.openepcis.org is the 4.3 dictionary |
| EN 18239 | Actors (4.2), roles per legal act, element-level rights, logging, delegation | `oec:ActorRole` + role audiences in the access-level sidecars; resolver role gate; operator id and logging in progress |
| EN 18246 | Transport-independent integrity, actor-bound changes, free verification, ESDC (Annex A) | Verifiable Credentials + `did:web` as the ESDC; signed version graph; trusted list and access log open |

For the attribute-level EN 18223 mapping and the EN 18222 method-to-endpoint
plan, see [`EN18223_MODEL_ALIGNMENT.md`](./EN18223_MODEL_ALIGNMENT.md). For
the broader standards landscape, see [`STANDARDS_ALIGNMENT.md`](./STANDARDS_ALIGNMENT.md).

---

*OpenEPCIS DPP-Ready · CEN/CENELEC JTC 24 conformance map · 2026 · Apache-2.0*
