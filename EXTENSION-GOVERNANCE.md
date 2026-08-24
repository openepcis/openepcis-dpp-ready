# OpenEPCIS DPP Extension Governance

This document explains the governance principles and rationale for vocabulary extensions in the OpenEPCIS DPP-Ready project.

## Core Principles

### 1. Vocabulary Precedence: GS1 → SEMICeu → schema.org → upstream community → custom

When modelling a property or class, choose the most-canonical vocabulary in this order:

1. **`gs1:` (GS1 Web Vocabulary)** — imported foundation. Identifier model (GTIN, GLN), trade-item attributes, EPCIS event integration. Most product-side properties already live here, so checking GS1 first short-circuits the majority of lookups. GS1 itself aligns with schema.org for many concepts, so picking GS1 also gives transitive schema.org compatibility.
2. **EU SEMICeu Core Vocabularies** — public-sector / EU-canonical authority. Fills the gaps GS1 doesn't cover. CCCEV (`cccev:Requirement`, `cccev:Constraint`, `cccev:Evidence`, `cccev:InformationConcept`); CPOV (`cv:PublicOrganisation`, `cv:ContactPoint`); Core Business (`cv:LegalEntity`); Core Person (`cv:Person`); Core Location (`locn:Address`, `locn:Location`, `locn:Geometry`); ADMS (`adms:Identifier`); CPSV-AP. Use these for any public body, legal entity, contact point, address, identifier scheme, conformity requirement, or evidence.
3. **`schema:` (schema.org)** — universal-web fallback. Best for ratings, observations, generic metadata, and concepts neither GS1 nor SEMICeu has named (`Observation`, `QuantitativeValue`, `GeoCoordinates`, `Rating`).
4. **Upstream community profiles** — UNTP v0.7.0, CIRPASS-2, CEN/CENELEC JTC 24. Reference directly and anchor any local alias upward.
5. **Custom extension (`dpp:`, `battery:`, …)** — only when none of the above covers the concept, and a regulatory or domain requirement makes the gap unavoidable.

Extension terms that duplicate a schema.org, GS1, or SEMICeu term **must be removed**, and the canonical term used directly (or the extension term strong-anchored via `owl:equivalentClass` / `owl:equivalentProperty` and the upstream IRI preferred in JSON-LD serialisations). The 0.9.5 alignment cleanup deleted ~50 schema.org / GS1 redundancies; the SEMICeu pass that follows extends the same discipline to the EU public-sector vocabularies (see `extensions/common/interop/docs/SEMIC_CORE_VOCABULARIES.md`).

### 2. Extension Transparency
Every extension term includes:
- `dcterms:source` - Link to the regulatory requirement mandating this term
- `skos:note` - Explanation of why GS1 Web Vocabulary and schema.org don't cover this
- `rdfs:seeAlso` - Links to related GS1/schema.org terms where applicable
- `owl:equivalentProperty` / `owl:equivalentClass` / `rdfs:subPropertyOf` - When a semantic equivalent or supertype exists

### 3. GS1 Digital Link Identifiers
All product and location identifiers follow GS1 Digital Link URI syntax:
- Products: `https://id.gs1.org/01/{GTIN}/21/{serial}`
- Locations: `https://id.gs1.org/414/{GLN}`
- Organizations: `https://id.gs1.org/417/{GLN}`

### 4. EPCIS 2.0 Extension Declaration
Extensions are declared in EPCIS documents using the standard header format:
```
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/
GS1-Extensions: battery=https://ref.openepcis.io/extensions/eu/battery/
```

## Namespace Prefixes

| Prefix | URI | Purpose |
|--------|-----|---------|
| `dpp` | `https://ref.openepcis.io/extensions/common/core/` | Core DPP/ESPR vocabulary |
| `battery` | `https://ref.openepcis.io/extensions/eu/battery/` | Battery Regulation vocabulary |
| `eudr` | `https://ref.openepcis.io/extensions/eu/eudr/` | EUDR vocabulary |
| `detergent` | `https://ref.openepcis.io/extensions/eu/detergent/` | Detergent Regulation vocabulary |
| `schema` | `https://schema.org/` | schema.org (foundational, peer Layer 1) |
| `gs1` | `https://ref.gs1.org/voc/` | GS1 Web Vocabulary (foundational, peer Layer 1, imported) |
| `cv` | `http://data.europa.eu/m8g/` | SEMICeu CPOV / Core Business / Person / Public Event / CPSV-AP (foundational, peer Layer 1) |
| `cccev` | `http://data.europa.eu/m8g/` | SEMICeu Core Criterion and Evidence Vocabulary (foundational, peer Layer 1) |
| `locn` | `http://www.w3.org/ns/locn#` | SEMICeu Core Location Vocabulary (foundational, peer Layer 1) |
| `adms` | `http://www.w3.org/ns/adms#` | ADMS / ADMS-AP (foundational, peer Layer 1) |
| `cpsv` | `http://purl.org/vocab/cpsv#` | CPSV legacy namespace (foundational, peer Layer 1) |
| `org` | `http://www.w3.org/ns/org#` | W3C Org Ontology (used by SEMICeu) |
| `foaf` | `http://xmlns.com/foaf/0.1/` | FOAF (used by SEMICeu) |

## GS1 Terms to Use (Not Extended)

The following GS1 Web Vocabulary terms should be used directly:

### Product Identification
| GS1 Property | Usage |
|--------------|-------|
| `gs1:gtin` | Global Trade Item Number |
| `gs1:serialNumber` | Serial number |
| `gs1:productName` | Product name (language-tagged) |
| `gs1:productDescription` | Product description |

### Product Attributes
| GS1 Property | Usage |
|--------------|-------|
| `gs1:netWeight` | Product weight (use `gs1:QuantitativeValue`) |
| `gs1:grossWeight` | Packaged weight |
| `gs1:manufacturingDate` | Date of manufacture |
| `gs1:countryOfOrigin` | Manufacturing country (ISO 3166-1) |

### Organizations
| GS1 Class/Property | Usage |
|--------------------|-------|
| `gs1:Organization` | Any organization |
| `gs1:manufacturer` | Link to manufacturer |
| `gs1:organizationName` | Organization name |
| `gs1:gln` | Global Location Number |
| `gs1:PostalAddress` | Address structure |
| `gs1:ContactPoint` | Contact information |

### Measurements
| GS1 Class | Usage |
|-----------|-------|
| `gs1:QuantitativeValue` | All measurements with value and unit |
| `gs1:unitCode` | UN/CEFACT unit code (KGM, KWH, VLT, AH, etc.) |

### Documents and Certifications
| GS1 Class/Property | Usage |
|--------------------|-------|
| `gs1:referencedFile` | Link to documents |
| `gs1:ReferencedFileDetails` | Document metadata class |
| `gs1:ReferencedFileTypeCode` | Document type (CERTIFICATION, DOCUMENT, USER_MANUAL) |
| `gs1:certification` | Link to certifications |
| `gs1:CertificationDetails` | Certification metadata |

### Regulatory Compliance
| GS1 Class/Property | Usage |
|--------------------|-------|
| `gs1:regulatoryInformation` | Link to regulatory info |
| `gs1:RegulatoryInformation` | Regulatory data class |
| `gs1:RegulationTypeCode-BATTERY_DIRECTIVE` | Battery regulation compliance |
| `gs1:RegulationTypeCode-CE` | CE marking compliance |

### Warranty
| GS1 Class/Property | Usage |
|--------------------|-------|
| `gs1:warranty` | Link to warranty |
| `gs1:WarrantyPromise` | Warranty details class |
| `gs1:durationOfWarranty` | Warranty duration (ISO 8601) |

## Extension Rationale by Category

### Carbon Footprint Extensions

**Why Extended:** GS1 GDSN has Carbon Footprint attributes but they are not yet part of GS1 Web Vocabulary.

| Extension | Rationale | GS1 Reference |
|-----------|-----------|---------------|
| `dpp:carbonFootprintTotal` | Numeric CFP value | GDSN CFP Implementation Guideline |
| `dpp:carbonFootprintUnit` | Functional unit | GDSN cfpFunctionalUnit |
| `battery:carbonFootprintDeclaration` | Battery-specific CFP with lifecycle breakdown | Battery Regulation Art. 7 |

**Recommendation:** Monitor GS1 Web Vocabulary updates; these may be added in future versions.

### Recycled Content Extensions

**Why Extended:** GS1 Web Vocabulary does not provide structured recycled content properties with pre/post-consumer breakdown.

| Extension | Rationale | Regulatory Source |
|-----------|-----------|-------------------|
| `dpp:totalRecycledShare` | Total recycled % | ESPR |
| `dpp:preConsumerShare` | Pre-consumer recycled % | ESPR / Battery Regulation |
| `dpp:postConsumerShare` | Post-consumer recycled % | ESPR / Battery Regulation |
| `battery:lithiumRecycledShare` | Material-specific recycled content | Battery Regulation Art. 8 |

### Hazardous Substances Extensions

**Why Extended:** GS1 provides `gs1:hasAllergen` for food products but lacks industrial hazardous substance classes.

| Extension | Rationale | Regulatory Source |
|-----------|-----------|-------------------|
| `dpp:HazardousSubstance` | CLP-classified substances | EU CLP Regulation 1272/2008 |
| `dpp:SubstanceOfConcern` | SCIP database alignment | Waste Framework Directive |
| `dpp:casNumber` | Chemical identification | REACH |
| `dpp:ecNumber` | EU chemical number | ECHA |
| `dpp:scipId` | SCIP database reference | SCIP |

### Economic Operator Extensions

**Why Extended:** GS1 provides `gs1:Organization` but lacks specific operator role enumeration.

| Extension | Rationale | Regulatory Source |
|-----------|-----------|-------------------|
| `dpp:OperatorRole` | Manufacturer, Importer, Distributor roles | EU MSR 2019/1020 |
| `dpp:economicOperatorId` | EOID from EU registry | ESPR Article 77 |

**Alternative:** Use `gs1:Organization` with a role indicator property.

### Battery-Specific Extensions

**Why Extended:** Battery technical parameters are domain-specific and outside GS1's scope.

| Extension | Rationale | Regulatory Source |
|-----------|-----------|-------------------|
| `battery:batteryCategory` | LMT, EV, Industrial, etc. | Battery Regulation Art. 3 |
| `battery:ratedCapacity` | Capacity in Ah | Annex XIII |
| `battery:nominalVoltage` | Voltage in V | Annex XIII |
| `battery:stateOfHealth` | SoH percentage | Annex XIII |
| `battery:batteryChemistry` | LFP, NMC, etc. | Annex XIII |

**Alternative for Category:** Use `gs1:additionalProductClassification` with system code `BATTERY_REGULATION_2023_1542`.

### Circularity Extensions

**Why Extended:** GS1 provides `gs1:consumerRecyclingInstructions` (text) but lacks structured circularity data.

| Extension | Rationale | Regulatory Source |
|-----------|-----------|-------------------|
| `dpp:recyclabilityRate` | Numeric recyclability % | ESPR |
| `dpp:endOfLifeInstructions` | URL to EOL instructions | ESPR |
| `dpp:CircularityInfo` | Structured circularity data | ESPR |

**Recommendation:** Use `gs1:consumerRecyclingInstructions` for simple text guidance; use extensions for structured data.

### Performance and Repairability Extensions

**Why Extended:** GS1 provides `gs1:warranty` but lacks structured performance/durability and repairability data.

| Extension | Rationale | Regulatory Source |
|-----------|-----------|-------------------|
| `dpp:expectedLifespan` | Product lifespan | ESPR Article 7 |
| `dpp:repairabilityScore` | Repair index (0-10) | French Indice de Réparabilité |
| `dpp:sparePartsAvailability` | Years of spare parts | ESPR Article 7 |

### Access Rights Extensions

**Why Extended:** ESPR defines tiered data access; GS1 does not provide access control semantics.

| Extension | Rationale | Regulatory Source |
|-----------|-----------|-------------------|
| `dpp:AccessLevel` | Public, AuthorizedOnly, Restricted | ESPR Article 9 |
| `dpp:accessRights` | Access configuration | ESPR Article 9 |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-05-04 | Precedence rule extended to `gs1: → SEMICeu (cv:/cccev:/locn:/adms:/cpsv:) → schema: → upstream community → custom`. SEMICeu Core Vocabularies elevated to peer Layer 1 alongside GS1 and schema.org. |
| 1.1.0 | 2026-04-29 | Precedence rule formalised as `gs1: → schema: → custom`. Aligned with the 0.9.5 schema.org / GS1 deduplication cleanup |
| 1.0.0 | 2025-01-28 | Initial governance document |

## References

- [GS1 Web Vocabulary](https://ref.gs1.org/voc/)
- [GS1 Digital Product Passport Standard](https://www.gs1.org/standards/standards-emerging-regulations/DPP)
- [GDSN Carbon Footprint Implementation Guideline](https://gs1.eu/wp-content/uploads/2025/02/GDSN-Implementation-Guideline-for-exchanging-Carbon-Footprint-Data-3.pdf)
- [GS1 Standards Enabling DPP](https://gs1.eu/wp-content/uploads/2025/04/GS1-Standards-Enabling-DPP-V2.2-April-2025.pdf)
- [EU ESPR Regulation 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781)
- [EU Battery Regulation 2023/1542](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1542)
- [DIN DKE SPEC 99100](https://www.dke.de/de/arbeitsfelder/mobility/din-dke-spec-99100)
