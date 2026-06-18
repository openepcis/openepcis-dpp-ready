# SEMICeu Core Vocabularies — integration with OpenEPCIS DPP-Ready

The **EU SEMICeu Core Vocabularies** are reference data models published and maintained by the European Commission's Directorate-General for Digital Services (DG DIGIT, SEMIC team) under the Interoperable Europe initiative. They are openly licensed (CC0 / EUPL) and are the canonical EU representation of public-sector entities, conformity requirements, legal entities, natural persons, and addresses.

OpenEPCIS DPP-Ready treats SEMICeu as a **peer Layer 1 foundation** alongside schema.org and GS1 Web Vocabulary. Where a `oec:` or module term overlaps a SEMICeu term, the SEMICeu IRI is canonical and our term is anchored upward via the strongest formal relationship that actually holds — typically `rdfs:subClassOf` (when the local term is a specialisation of the SEMICeu peer) or `rdfs:seeAlso` (when the two extensions overlap but neither contains the other). `owl:equivalentClass` / `owl:equivalentProperty` is reserved for cases where the two terms have **identical extension** — narrower than it looks: `gs1:Organization`, `cv:LegalEntity`, `untp:Party` and `oec:OperatorInformation` are all closely related but none are extensionally equal (charities are legal entities but not ESPR operators; sole proprietors are ESPR operators but in some jurisdictions not legal entities; etc.).

## Source and provenance

- **Maintainer**: SEMIC team — DIGIT-SEMIC-TEAM@ec.europa.eu
- **GitHub**: <https://github.com/semiceu>
- **Portal**: <https://interoperable-europe.ec.europa.eu/collection/semic-support-centre/core-vocabularies>
- **Working group**: e-Government Core Vocabularies Working Group (~70 members across 22 countries)
- **License**: CC0 / EUPL (per individual specification)

## Vocabularies covered

| Vocabulary | Version | Namespace | OpenEPCIS bridge |
|---|---|---|---|
| **CCCEV** — Core Criterion and Evidence | 2.0 | `cccev:` → `http://data.europa.eu/m8g/` | conformity / due-diligence anchoring |
| **CPOV** — Core Public Organisation | 2.1.1 | `cv:` → `http://data.europa.eu/m8g/` | public bodies, contact points |
| **Core Business** | 2.0.0 | `cv:` (shared m8g) | legal entities (operators) |
| **Core Person** | 2.0.0 | `cv:` (shared m8g) + `foaf:` / `schema:` | natural persons (signatories, contacts) |
| **Core Location** | 2.0.0 | `locn:` → `http://www.w3.org/ns/locn#` | addresses, geometry |
| **Core Public Event** | 1.0.0 | `cv:` (shared m8g) | regulatory events (recalls, enforcement) |
| **CPSV-AP** — Core Public Service AP | 3.x | `cpsv:` → `http://purl.org/vocab/cpsv#` + `cv:` | DPP services (registration, verification, dispute) |
| **ADMS / ADMS-AP** | 1.0 / 2.0 | `adms:` → `http://www.w3.org/ns/adms#` | identifier schemes, semantic asset cataloguing |

## Why CCCEV is the most strategic of these

The OpenEPCIS conformity stack today routes `Claim` / `Criterion` / `Standard` / `Regulation` / `ConformityAttestation` through `untp:` (UN/CEFACT UNTP v0.7.0). UNTP itself derives its conformity model from **CCCEV**. Anchoring directly to CCCEV gives DPP-Ready alignment with the same EU foundation that JTC 24 and CIRPASS-2 lean on, and removes a hop of indirection for downstream consumers that already speak CCCEV (the EU's data-portal ecosystem, EDPB / DG GROW conformity tooling, etc.).

OpenEPCIS keeps the UNTP bridge as the operative conformity context (UNTP carries DPP-relevant detail CCCEV doesn't yet have). CCCEV is added as a **second equivalence target** so a single payload can be consumed by UNTP-aware and CCCEV-aware tooling alike.

## Per-vocabulary mapping

### CCCEV — Core Criterion and Evidence Vocabulary

CCCEV separates **what is required** (`cccev:Requirement`, `cccev:RequirementGroup`), **what limits the answer** (`cccev:Constraint`), **what data is asked for** (`cccev:InformationConcept`), and **what backs up the answer** (`cccev:Evidence`, `cccev:SupportedValue`).

| OpenEPCIS / UNTP term | CCCEV peer | Relationship |
|---|---|---|
| `oec:DueDiligenceReport` | `cccev:Evidence` | `rdfs:subClassOf cccev:Evidence` (every DDR is evidence supporting a regulatory requirement; cccev:Evidence is broader — covers test reports, certificates, audit logs, attestations) |
| `untp:Claim` | `cccev:SupportedValue` | the value being claimed for an InformationConcept |
| `untp:Criterion` | `cccev:Constraint` | a constraint a Requirement must satisfy |
| `untp:Standard` / `untp:Regulation` | `cccev:Requirement` (with `dcterms:source`) | the regulatory or normative requirement being referenced |
| `untp:ConformityAttestation` | `cccev:Evidence` (typed) | evidence that one or more requirements are satisfied |
| `eubat:declarationOfConformity` | `cccev:Evidence` | the textbook EU CCCEV use case |
| `euelec:RepairCriterion` | `cccev:Criterion` (alias for `cccev:Constraint`) | a scoring criterion is a constraint on a repair-related requirement |

**Worked example** — an ESPR conformity declaration:

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/common/interop/semic-core-bridge-context.jsonld"
  ],
  "type": "Requirement",
  "prefLabel": "ESPR Article 7 — Performance and Durability",
  "description": "Product must meet minimum lifespan and reliability thresholds defined by the ESPR delegated act.",
  "hasConstraint": [
    { "type": "Constraint", "description": "Expected lifespan ≥ 5 years" }
  ],
  "providesEvidence": [
    {
      "type": "Evidence",
      "description": "EU Declaration of Conformity, signed 2026-04-12",
      "issued": "2026-04-12",
      "conformsTo": "https://eur-lex.europa.eu/eli/reg/2024/1781"
    }
  ]
}
```

### CPOV — Core Public Organisation Vocabulary

CPOV models **public** organisations: regulators, notified bodies, market surveillance authorities, customs, competent authorities (EUDR competent authorities, FDA for FSMA204, …). It is a sibling of `gs1:Organization` (which is generic / commercial) and `untp:Party` (which is the most generic).

| Concept | SEMICeu IRI | When to use |
|---|---|---|
| Public organisation | `cv:PublicOrganisation` | Any public-sector body — notified body, market surveillance authority, customs, EU competent authority, FDA |
| Contact point | `cv:ContactPoint` | Customer service, recall coordinator, due-diligence grievance contact, regulatory liaison |
| Contact page | `cv:contactPage` | URL of a contact form / page |
| Email / phone / hours | `cv:email` / `cv:telephone` / `cv:openingHours` | Inline contact details |
| Reference framework | `cv:ReferenceFramework` | The legal framework a public organisation operates under |

**Decision rule** — when modelling an organisation:
1. Public-sector body? → `cv:PublicOrganisation`.
2. Commercial operator (manufacturer, importer, distributor)? → `cv:LegalEntity` (Core Business) or `gs1:Organization` (legacy / EPCIS-native consumers).
3. Generic party with no specific role? → `untp:Party` or `org:Organization`.

### Core Business Vocabulary

Models legal entities — the EU peer to `gs1:Organization` for commercial operators. Carries legal-name, legal status, registered address, and identifier scheme links.

| OpenEPCIS term | Core Business peer | Action |
|---|---|---|
| `oec:OperatorInformation` | `cv:LegalEntity` | **`rdfs:seeAlso` only** — the two overlap but neither contains the other. cv:LegalEntity includes charities and non-profit bodies that are not ESPR operators; ESPR operators include sole proprietors that some jurisdictions classify as natural persons rather than legal entities. Use cv:LegalEntity for EU-portal interoperability when the operator is known to be a legally-registered business. |
| `eubat:operatorInformation` | `cv:LegalEntity` | Anchor via the `oec:` cascade |
| `gs1:Organization` | `cv:LegalEntity` (sibling) | Both legitimate; pick by audience — GS1 for EPCIS-native consumers, `cv:` for EU-portal consumers |

### Core Person Vocabulary

Models natural persons — signatories on conformity declarations, recall coordinators, due-diligence contacts. Reuses `foaf:` for `givenName` / `familyName` / `homepage` and `schema:` for birth date.

Use this **carefully**: DPP payloads should not carry unnecessary PII. Restrict to what regulation requires (e.g. signatory name on a declaration of conformity).

### Core Location Vocabulary

The canonical EU representation for addresses, named locations, and geometry. `locn:Address` is the structured-address class; `locn:Geometry` carries WKT / GeoJSON.

| OpenEPCIS term | Core Location peer | Action |
|---|---|---|
| `oec:FacilityInformation` | `locn:Location` | `rdfs:seeAlso` — keep existing `untp:Facility` equivalence and `gs1:Place` see-also |
| `eudr:geolocation` / `eudr:transformationLocation` | `locn:Geometry` / `locn:Location` | `rdfs:seeAlso` |
| `eutex:spinningFacility` (and siblings) | `locn:Location` (subtype) | `rdfs:seeAlso` on parent property |

### Core Public Event Vocabulary

Models public-sector events — market-surveillance recalls, regulatory enforcement actions, public consultations. **Orthogonal to EPCIS events**: EPCIS models supply-chain events (commissioning, observation, transformation); CPV models public-sector events (a recall announcement, a market-surveillance test campaign).

Useful for: representing a regulatory recall as a `cv:PublicEvent` linked to the `cv:PublicOrganisation` that issued it.

### CPSV-AP — Core Public Service Application Profile

Models public services — the registration, verification, and dispute services that surround a DPP. Out of scope for the v0.9.x core but available in the bridge for adopters who need to represent "the DPP verification service offered by Member State X" or "the DPP dispute mechanism per ESPR Article 9".

### ADMS / ADMS-AP — Asset Description Metadata Schema

Models semantic assets and identifiers. `adms:Identifier` is the EU-canonical identifier-scheme model — exactly what a legal-entity ID (LEI, EUID, EORI), a notified-body number, or a facility identifier needs.

| OpenEPCIS term | ADMS peer | Action |
|---|---|---|
| `eubat:operatorIdentifier` | `adms:Identifier` | `rdfs:seeAlso adms:Identifier` |
| `eubat:notifiedBodyNumber` | `adms:Identifier` (with `cv:PublicOrganisation` for the body itself) | `rdfs:seeAlso adms:Identifier` |
| `eubat:facilityIdentifier` | `adms:Identifier` | `rdfs:seeAlso adms:Identifier` |

## Bridge context usage

The bridge context lives at `extensions/common/interop/context/semic-core-bridge-context.jsonld`. Combine it with `dpp-core-context.jsonld` (and any module context) in `@context`:

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/common/interop/semic-core-bridge-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld"
  ]
}
```

Aliases are short JSON terms (`PublicOrganisation`, `ContactPoint`, `Requirement`, `Evidence`, `LegalEntity`, `Address`, `Identifier`, …) that resolve to the SEMICeu IRIs.

## Related references

- [VOCABULARY_LAYERING.md](../../../../docs/VOCABULARY_LAYERING.md) — full layering doctrine
- [STANDARDS_ALIGNMENT.md](./STANDARDS_ALIGNMENT.md) — overview of how each external standard is integrated
- [UNTP_MAPPING.md](./UNTP_MAPPING.md) — how UNTP terms map to OpenEPCIS — read alongside this doc for the conformity stack
- [CIRPASS2_COVERAGE.md](./CIRPASS2_COVERAGE.md) — CIRPASS-2 pilot requirements coverage
- SEMIC portal: <https://interoperable-europe.ec.europa.eu/collection/semic-support-centre/core-vocabularies>
- CCCEV 2.0: <https://semiceu.github.io/CCCEV/releases/2.00/>
- CPOV 2.1.1: <https://semiceu.github.io/CPOV/releases/2.1.1/>
