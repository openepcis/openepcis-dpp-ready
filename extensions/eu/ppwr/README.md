# PPWR Module

Vocabulary and examples for implementing Digital Product Passports under
the EU Packaging and Packaging Waste Regulation (Regulation 2025/40).

## Regulation overview

**EU Regulation 2025/40 (Packaging and Packaging Waste Regulation, PPWR)** —
in force since 11 February 2025; replaces Directive 94/62/EC; general
application from 12 August 2026.

| Application date | Requirement |
|---|---|
| 12 Aug 2026 | General application; implementing acts due for the Article 12 harmonised labels and the digital material-composition marking methodology |
| 12 Feb 2027 | Packaging identifiable in an EPR scheme across relevant Member States (Art. 12(8)) |
| 12 Aug 2028 | Harmonised labelling per Article 12 (material composition pictograms; optional QR/digital data carrier; single data carrier for product + packaging) |
| 1 Jan 2030 | Recyclability grading mandatory (Grade A ≥ 95% / B ≥ 80% / C ≥ 70% per Article 6, Annex II); Grade C is the minimum to be placed on the EU market. Recycled-content minimums for plastic packaging begin (Art. 7) |
| 1 Jan 2038 | Only Grades A and B may be placed on the market |
| 1 Jan 2040 | Increased recycled-content targets |

## Module philosophy

PPWR's data points map almost entirely onto the **GS1 Web Vocabulary
packaging model** plus cross-cutting `oec:` and `untp:` vocabulary already
in this repository. **This module is intentionally thin**: only the
genuinely PPWR-specific concepts live in the `euppwr:` namespace.
Everything else is reused.

The packaging card of a trade item hangs off the product per the GS1 Web
Vocabulary: `gs1:Product` —`gs1:packaging`→ `euppwr:Packaging` (subclass of
`gs1:PackagingDetails`) —`gs1:packagingMaterial`→
`gs1:PackagingMaterialDetails`, and —`gs1:hasReturnablePackageDeposit`→
`oec:DepositReturnScheme` (subclass of `gs1:ReturnablePackageDepositDetails`).
Packaging placed on the market as a trade item in its own right (e.g. an
empty e-commerce carton with its own GTIN, per the GS1 in Europe white
paper's per-component-GTIN pattern) is typed both `gs1:Product` and
`euppwr:Packaging` and carries the packaging properties directly.

| PPWR data point (Article) | Carried by |
|---|---|
| Packaging tier (Art. 3) | `euppwr:packagingTier` (this module) |
| Recyclability grade A/B/C (Art. 6, Annex II) | `euppwr:recyclabilityGrade` (this module), substantiated by `oec:recyclabilityScore` + `euppwr:designForRecyclingMethodology` |
| Harmonised labels (Art. 12) | `euppwr:harmonisedSymbol` (this module) |
| Packaging type / format | `gs1:packagingType` |
| Material composition (Art. 5, 6, 12) | `gs1:packagingMaterial` → `gs1:PackagingMaterialDetails` (`gs1:packagingMaterialType` code, `gs1:packagingMaterialCompositionQuantity`, `gs1:packagingMaterialThickness`) |
| Recycling process claim | `gs1:packagingRecyclingProcessType` (RECYCLABLE / REUSABLE / COMPOSTABLE / ENERGY_RECOVERABLE) |
| Recycled content (Art. 7) | `oec:recycledContentDetails` → `oec:RecycledContent` (`oec:recycledContent`, `oec:preConsumerRecycledContent`, `oec:postConsumerRecycledContent`) |
| Deposit-return scheme (Art. 50) | `gs1:hasReturnablePackageDeposit` → `oec:DepositReturnScheme` (`gs1:returnablePackageDepositAmount`, `gs1:returnablePackageDepositRegion`, `oec:depositSchemeOperator`, `oec:depositRedemptionChannelUrl`) |
| Reusability / refurbished status (Art. 24–29) | `untp:ProductStatus` (UNTP v0.7.0 enum) |
| Compostability (Art. 9) | `oec:Compostability` + `oec:compostabilityType` + `oec:compostabilityStandard` |
| Bio-based content (optional disclosure) | `oec:bioBasedFraction` |
| Restricted substances (Art. 5 — PFAS, heavy metals) | `oec:HazardousSubstance`, `oec:SubstanceOfConcern` |
| EPR registration & scheme (Art. 12(8)) | `oec:ExtendedProducerResponsibility` + `oec:eprRegistrationNumber` + `oec:eprScheme` + `oec:eprJurisdiction` + `oec:eprWasteStream` |
| Regulation compliance declaration | `gs1:regulatoryInformation` with `gs1:regulationType` = `euppwr:RegulationTypeCode-PACKAGING_AND_PACKAGING_WASTE_REGULATION` |
| Production site / origin | `untp:Facility`, `gs1:Place`, `gs1:GeoShape` |
| Declaration of conformity (Art. 15–17) | `gs1:regulatoryInformation` + `gs1:regulatoryIdentifier` + `untp:ConformityAttestation` |

> **Why a module-owned regulation code?** The upstream
> `gs1:RegulationTypeCode` list has no packaging-waste member
> (`PACKAGING_SAFETY_DIRECTIVE` covers child-resistant packaging safety).
> This module therefore mints
> `euppwr:RegulationTypeCode-PACKAGING_AND_PACKAGING_WASTE_REGULATION`,
> typed `gs1:RegulationTypeCode`, as a candidate for upstream GS1 code-list
> submission.

## Module contents

```
ppwr/
├── VERSION
├── CHANGELOG.md
├── README.md                                 # this file
├── ontology/ppwr.ttl                         # vocabulary (source of truth)
├── context/
│   ├── ppwr-context.jsonld                   # standard JSON-LD context (prefixed terms)
│   ├── ppwr-shortcut-context.jsonld          # bare-alias layer for operational contexts
│   ├── ppwr-operational-context.jsonld       # EN 18223 operational context
│   └── .context-overrides.json               # non-derivable hints for build:context
├── json/ppwr.json                            # generated by build
├── validation/ppwr-shapes.ttl                # SHACL shapes
├── examples/
│   ├── beverage-bottle.jsonld                # product → gs1:packaging → PET bottle, Grade A, 50% rPET, DRS
│   ├── beverage-bottle-lot-01.jsonld         # batch-level (AI 10) variant of the bottle
│   ├── multi-layer-pouch.jsonld              # snack product → laminate pouch, Grade C, PFAS-free
│   └── ecommerce-carton.jsonld               # carton as trade item (dual-typed), Grade A, PCR cellulose
├── epcis/
│   ├── commissioning.jsonld                  # lot enters the supply chain (quantityList)
│   ├── ownership-transfer.jsonld             # bottler → retailer (owning_party)
│   ├── observation-recyclability.jsonld      # Annex II grade declaration observation
│   ├── deposit-return.jsonld                 # RVM redemption (SGTIN, refund observation)
│   └── recovery.jsonld                       # recycler TransformationEvent → rPET flake
└── docs/IMPLEMENTATION_GUIDE.md
```

## Vocabulary namespace

**Prefix**: `euppwr:`
**URI**: `https://ref.openepcis.io/extensions/eu/ppwr/`

## Vocabulary

| Class | Description |
|-------|-------------|
| `euppwr:Packaging` | Subclass of `gs1:PackagingDetails`. Carrier for the PPWR-specific data points. |
| `euppwr:PackagingTier` | Enumeration: Sales / Grouped / Transport (Article 3). |
| `euppwr:RecyclabilityGrade` | Enumeration: GradeA / GradeB / GradeC (Article 6, Annex II). |

| Property / individual | Range / type | Description |
|----------|-------|-------------|
| `euppwr:packagingTier` | `euppwr:PackagingTier` | Sales (primary) / Grouped (secondary) / Transport (tertiary). |
| `euppwr:recyclabilityGrade` | `euppwr:RecyclabilityGrade` | A / B / C grade per Article 6. |
| `euppwr:harmonisedSymbol` | `xsd:anyURI` | URI of an Article 12 harmonised label entry (implementing acts pending — use documented placeholders). |
| `euppwr:designForRecyclingMethodology` | `xsd:string` | D4R methodology substantiating the grade (RecyClass, CEFLEX, APR, …). |
| `euppwr:depositRefundIssued` | `xsd:decimal` | Event-level observation: refund paid at redemption (Art. 50). |
| `euppwr:containerCondition` | `xsd:string` | Event-level observation: condition of the returned item (reuse vs recycle routing). |
| `euppwr:RegulationTypeCode-PACKAGING_AND_PACKAGING_WASTE_REGULATION` | `gs1:RegulationTypeCode` | Module-owned code-list member for PPWR compliance declarations. |

## EPCIS 2.0 extension declaration

```http
GS1-Extensions: oec=https://ref.openepcis.io/extensions/common/core/, euppwr=https://ref.openepcis.io/extensions/eu/ppwr/
```

Granularity rules (see the core EPCIS guide): lots are class-level, so they
travel in `quantityList` (never `epcList`); a single redeemed item is a
serialised GTIN (AI 01 + AI 21) in `epcList`. `masterDataAvailableFor`
carries item/lot-level master data with bare `gs1:` terms and prefixed
extension terms; observation values (grade declarations, refunds) sit at
event level.

## Identifiers used in examples

All examples use GS1 demo prefix **952**:
- `09521004005019` — Mountain Spring 500 mL PET bottle (batch `LOT-01` at `/01/09521004005019/10/LOT-01`)
- `09521005000808` — Crispy Snack pouch
- `09521006003013` — EcoFlow e-commerce carton
- `09521004005026` — recovered rPET flake (recovery event output)

## License

Apache License 2.0 — see LICENSE file in repository root.

## References

- [EU Regulation 2025/40 (PPWR) full text](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R0040)
- [GS1 in Europe White Paper: Packaging and Packaging Waste Regulation (PPWR) and GS1 Standards](https://www.gs1-germany.de/fileadmin/gs1/fachpublikationen/gs1-in-europe-white-paper-packaging-and-packaging-waste-regulation-and-gs1-standards.pdf) (v1.0, June 2025)
- [GS1 Web Vocabulary: PackagingDetails](https://ref.gs1.org/voc/PackagingDetails), [PackagingMaterialDetails](https://ref.gs1.org/voc/PackagingMaterialDetails), [ReturnablePackageDepositDetails](https://ref.gs1.org/voc/ReturnablePackageDepositDetails)
- [ESPR 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781)
- [UNTP Core Vocabulary v0.7.0](https://vocabulary.uncefact.org/untp/) (used for `untp:Facility`)
- [Single-Use Plastics Directive 2019/904](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0904) (substance restrictions overlap)
