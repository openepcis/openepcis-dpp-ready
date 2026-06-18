# CEN/CENELEC JTC 24 DPP standards: clause-by-clause conformance map

This document maps the six published CEN/CENELEC JTC 24 Digital Product
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
dynamic lifecycle layer, the GS1 Web Vocabulary plus ref.openepcis.io as
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
- **ref.openepcis.io is a data-dictionary repository in the sense of
  4.3.** Our class and property IRIs are valid `dictionaryReference`
  values, each unique and resolvable, with cross-catalogue mapping via
  `owl:equivalentClass`/`owl:equivalentProperty` to GS1, SEMICeu, and
  UNTP. This is a direct, accurate fit.
- Our GS1 Web Vocabulary + Digital Link JSON-LD is the EN 18223 **compressed**
  serialization (key-value data points, clauses 5.2.6 to 5.2.9). The converter
  `scripts/derive-en18223.ts` derives the EN 18223 **expanded** Annex A form
  (`elements[]` of `{elementId, objectType, dictionaryReference, valueDataType,
  value}`) from it, using the `@context` IRIs as `dictionaryReference` (into the
  ref.openepcis.io §4.3 dictionary) and the ontology ranges as `valueDataType`.
  JSON-LD remains an EPCIS4DPP **profile choice** for the technical layer; the
  standard requires only JSON. For the rationale behind that choice, see the
  "Two routes to interoperability" observation in
  [`GS1_STACK_EN182XX_WHITEPAPER.md`](./GS1_STACK_EN182XX_WHITEPAPER.md).

**Status:** Conformant (model maps to `oec:`; ref.openepcis.io is a 4.3 repository; compressed↦expanded converter shipped); attribute/`dppStatus` alignment Planned.

---

## Quick reference: where each standard places a requirement

| Standard | Defines | EPCIS4DPP realisation |
|----------|---------|-----------------------|
| EN 18219 | Identifier requirements + 5 schemes | GS1 keys (scheme 5.2); granularity model/batch/item |
| EN 18220 | Data-carrier requirements (multiple carriers) | QR + GS1 Digital Link, NFC supplementary |
| EN 18216 | HTTPS/TLS/HTTP-2 + JSON + content negotiation | JSON-LD + HTML over HTTPS; EPCIS transport reuses it |
| EN 18221 | Storage/archiving/persistence + provider roles | Append-only EPCIS + versioned core (a conformant pattern) |
| EN 18222 | Concrete DPP REST API (method set + registry) | Expose the method surface (Planned); EPCIS query + resolver added |
| EN 18223 | UML+JSON information model + data dictionary | `oec:` core maps to it; ref.openepcis.io is the 4.3 dictionary |

For the attribute-level EN 18223 mapping and the EN 18222 method-to-endpoint
plan, see [`EN18223_MODEL_ALIGNMENT.md`](./EN18223_MODEL_ALIGNMENT.md). For
the broader standards landscape, see [`STANDARDS_ALIGNMENT.md`](./STANDARDS_ALIGNMENT.md).

---

*OpenEPCIS DPP-Ready · CEN/CENELEC JTC 24 conformance map · 2026 · Apache-2.0*
