# Vocabulary Layering — the delegation pattern behind OpenEPCIS DPP-Ready

This project is organised as **four stacked layers**, each one delegating
cross-cutting concepts to the layer below. The result is that a new EU
regulation module typically adds only a handful of truly regulation-specific
terms, and a single change at a higher layer benefits every module above it.

<!-- Diagram source: diagrams/vocabulary-layering.d2 — regenerate with `pnpm run diagrams:build`. -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="diagrams/vocabulary-layering-dark.svg">
  <img alt="The four-layer delegation stack with the concepts each layer holds: Layer 4 regulation modules; Layer 3 DPP common core (oec:) cross-cutting concepts, anchored upward via graded SKOS; Layer 2 upstream community profiles (UNTP, CIRPASS-2, JTC 24); Layer 1 foundational vocabularies (GS1, EU SEMICeu, schema.org)." src="diagrams/vocabulary-layering-light.svg" width="720">
</picture>

## How the vocabularies relate

The stack diagram above shows containment (which layer holds which
concept). The diagram below shows **how the vocabularies actually relate
to each other** — which terms are equivalent, which are derived from
which, and how `oec:` and module terms anchor upward.

```mermaid
graph BT
    subgraph L1["Layer 1 — Foundational peer triumvirate + sectoral"]
        GS1["gs1:<br/>GS1 Web Vocabulary<br/>(imported, owl:imports)"]
        SEMIC["SEMICeu Core Vocabularies<br/>cv: / cccev: / locn: / adms: / cpsv:<br/>(http://data.europa.eu/m8g/)"]
        SCHEMA["schema:<br/>schema.org"]
        RAIL["rail:<br/>GS1 Rail Vocabulary<br/>(GS1 AISBL / GS1 Switzerland;<br/>https://gs1-epcis-reg.org/rail/voc/data#;<br/>mirrored under extensions/upstream/gs1-rail/)"]
    end

    subgraph L2["Layer 2 — Upstream community profiles"]
        UNTP["untp:<br/>UNTP Core v0.7.0<br/>Party, Facility, Claim,<br/>ConformityAttestation, …"]
        JTC["CEN/CENELEC JTC 24<br/>EN 18216–18223 + prEN 18239/18246"]
        CIRPASS["CIRPASS-2 D3.x<br/>pilot requirements"]
    end

    subgraph L3["Layer 3 — DPP common core (oec:)"]
        DPP_OP["oec:OperatorInformation"]
        DPP_DDR["oec:DueDiligenceReport"]
        DPP_FAC["oec:FacilityInformation"]
        DPP_DOC["oec:DocumentReference"]
        DPP_PERF["oec:CircularityPerformance<br/>EmissionsPerformance<br/>TraceabilityPerformance"]
        DPP_HAZ["oec:HazardousSubstance<br/>SubstanceOfConcern<br/>(no upstream peer)"]
    end

    subgraph L4["Layer 4 — Regulation modules"]
        BAT["eubat:<br/>operatorIdentifier, notifiedBodyNumber,<br/>declarationOfConformity, supplierContact"]
        ELEC["euelec:<br/>RepairCriterion, criterionScore"]
        EUDR["eudr:<br/>geolocation, transformationLocation"]
        TEX["eutex:<br/>RobustnessAssessment,<br/>spinning/weaving/dyeing/cutAndSew/finishingFacility"]
        STEEL["eusteel:<br/>IronSteelProduct, heat/cast number,<br/>steelDesignation, MaterialTestCertificate (EN 10204/10168)"]
    end

    %% --- Layer 2 → Layer 1 derivations ---
    UNTP -. "derived from" .-> SEMIC
    JTC -. "leans on" .-> SEMIC
    CIRPASS -. "feeds into" .-> JTC

    %% --- Layer 3 → Layer 1/2 anchors ---
    DPP_OP ==>|"subClassOf"| GS1
    DPP_OP -.->|"rdfs:seeAlso<br/>cv:LegalEntity"| SEMIC
    DPP_OP -.->|"skos:broadMatch<br/>untp:Party"| UNTP

    DPP_DDR ==>|"subClassOf<br/>cccev:Evidence"| SEMIC

    DPP_FAC ==>|"subClassOf<br/>gs1:Place"| GS1
    DPP_FAC -.->|"skos:exactMatch<br/>untp:Facility"| UNTP
    DPP_FAC -.->|"rdfs:seeAlso<br/>locn:Location"| SEMIC

    DPP_DOC -.->|"skos:exactMatch<br/>gs1:ReferencedFileDetails"| GS1
    DPP_DOC -.->|"rdfs:seeAlso<br/>foaf:Document"| SEMIC

    DPP_PERF -.->|"skos:exactMatch<br/>untp-core:*Performance"| UNTP

    %% --- Layer 4 → Layer 3 / Layer 1 anchors ---
    BAT -.->|"adms:Identifier<br/>cv:PublicOrganisation<br/>cv:ContactPoint<br/>cccev:Evidence"| SEMIC
    BAT -.->|"oec:OperatorInformation"| DPP_OP

    ELEC ==>|"subClassOf<br/>cccev:Criterion"| SEMIC

    EUDR -.->|"locn:Geometry<br/>locn:Location"| SEMIC

    TEX -.->|"oec:FacilityInformation<br/>(cascades to locn:Location)"| DPP_FAC
    TEX -.->|"cccev:Evidence<br/>(RobustnessAssessment)"| SEMIC

    STEEL -.->|"oec:RecycledContent, oec:EnvironmentalProductDeclaration,<br/>oec:substancesOfConcern, oec:DocumentReference"| DPP_DOC
    STEEL -.->|"skos:broadMatch schema:Certification<br/>(MaterialTestCertificate)"| GS1

    classDef l1 fill:#dbeafe,stroke:#1e40af,stroke-width:2px;
    classDef l2 fill:#fef3c7,stroke:#92400e;
    classDef l3 fill:#dcfce7,stroke:#166534;
    classDef l4 fill:#fce7f3,stroke:#9d174d;
    class GS1,SEMIC,SCHEMA l1;
    class UNTP,JTC,CIRPASS l2;
    class DPP_OP,DPP_DDR,DPP_FAC,DPP_DOC,DPP_PERF,DPP_HAZ l3;
    class BAT,ELEC,EUDR,TEX l4;
```

Reading the diagram:

- **Solid arrows** (`==>`) = `rdfs:subClassOf` — strict structural inheritance.
- **Dashed arrows** (`-.->`) = graded SKOS mapping relations (`skos:exactMatch` / `skos:closeMatch` / `skos:broadMatch`) or `rdfs:seeAlso` — semantic anchors that don't change the term's structural ancestry and don't assert OWL logical equivalence.
- **Dotted "derived from" / "leans on"** = informal upstream relationships (UNTP's conformity model derives from CCCEV; JTC 24 leans on SEMICeu).

A few things the diagram makes visible that the stack diagram alone hides:

1. **CCCEV → UNTP → `oec:`** is a real chain. UNTP's conformity model is itself derived from CCCEV (SEMICeu). When the project anchors `oec:DueDiligenceReport` to both `untp:` and `cccev:Evidence`, those two are upstream-of-upstream — anchoring to the EU foundation doesn't bypass UNTP, it adds a second canonical view of the same fact.
2. **`oec:OperatorInformation` is the textbook three-anchor case**: structurally a `gs1:Organization`, semantically equivalent to `untp:Party`, and an EU-portal peer of `cv:LegalEntity`. All three serialisations describe the same operator.
3. **`oec:HazardousSubstance` and similar CLP/REACH terms have no upstream peer.** Those `oec:` terms genuinely fill a gap and stay minted. The diagram shows them isolated at Layer 3 — that's deliberate, not an oversight.
4. **Module terms cascade through `oec:` rather than re-anchoring.** `eutex:spinningFacility` ranges to `oec:FacilityInformation`; the upward anchor to `locn:Location` lives on `oec:`, so every module facility property inherits the SEMICeu peer for free.

## The delegation rule

When defining a new term, walk **downward** through the four layers. The
term goes in the **highest** layer that already covers it; only mint a new
IRI when no layer below already has it. Within Layer 1, check the three
foundational vocabularies in this order: **GS1 → SEMICeu → schema.org**.

| Decision | Action |
|---|---|
| Already in **GS1 Web Vocabulary** (`gs1:`) | Use it directly. GS1 is `owl:imports`-ed and is the canonical source for product / identifier / EPCIS-aligned attributes. |
| Already in **EU SEMICeu Core Vocabularies** (`cv:` / `cccev:` / `locn:` / `adms:` / `cpsv:`) | Use it directly **and** anchor any local alias upward via a graded SKOS mapping relation (`skos:exactMatch` / `skos:closeMatch` / `skos:broadMatch`), or `rdfs:subClassOf` where the local term is a true specialisation. SEMICeu is the EU-canonical source for public bodies, conformity (CCCEV), legal entities, persons, addresses, and identifier schemes. |
| Already in **schema.org** | Use it directly. schema.org is the universal-web fallback for ratings, observations, and generic metadata that GS1 and SEMICeu don't cover. |
| Already in **GS1 Rail Vocabulary** (`rail:` — `https://gs1-epcis-reg.org/rail/voc/data#`) for railway-specific concepts | Use it directly. GS1 Rail is a sectoral peer to `gs1:` published by GS1 AISBL with GS1 Switzerland. Mirrored under `extensions/upstream/gs1-rail/`; cross-cutting overlaps (e.g. `rail:itemReconditioningDate` ↔ `oec:remanufacturingDate`) are bridged via `extensions/common/interop/context/rail-bridge-context.jsonld`. |
| Already in UNTP / CIRPASS-2 / JTC 24 | Reference it directly **and** anchor any local alias upward. |
| Cross-cuts ≥2 regulations but absent upstream | Mint at `oec:` (common/core). |
| Specific to one regulation | Mint at the module namespace (`eu/<module>:`). |

**Conversely:** if you find yourself adding the same concept to two modules,
that's a signal it should move down to `oec:`. If a `oec:` term turns out
to be a SEMICeu / GS1 / schema.org duplicate, **redo and match upstream**:
either delete the `oec:` term in favour of the upstream IRI, or anchor
it via a graded SKOS mapping relation (`skos:exactMatch` / `skos:closeMatch` / `skos:broadMatch`) and prefer the
upstream IRI in JSON-LD serialisations.

## Why three foundational peers, not one

Each of GS1, SEMICeu, and schema.org owns a different slice of the DPP
data model and they only partially overlap. The order reflects how the
project actually consumes them:

- **GS1 Web Vocabulary** is the supply-chain authority and the imported
  foundation. It owns the identifier model (GTIN, GLN), the trade-item
  attribute set, and the EPCIS event integration that is the practical
  backbone of the project. Most product-side properties already live
  here, so checking GS1 first short-circuits most lookups.
- **EU SEMICeu Core Vocabularies** are the European Commission's
  reference vocabularies for public-sector data and fill the gaps GS1
  doesn't cover. CCCEV is upstream of UNTP's conformity model; CPOV /
  Core Business / Core Person / Core Location are the EU-canonical
  representations of public bodies, legal entities, natural persons,
  and addresses respectively. ADMS provides the identifier-scheme
  model that legal-entity IDs (LEI, EUID) plug into.
- **schema.org** is the universal-web fallback. Search engines, generic
  data tools, and most JSON-LD consumers recognise it out of the box.
  Best for ratings, observations, generic metadata, and concepts with
  broad web semantics (`Observation`, `QuantitativeValue`,
  `GeoCoordinates`) that neither GS1 nor SEMICeu has named explicitly.

Treating them as peers means a notified body is `cv:PublicOrganisation`
(not a stretched `gs1:Organization`), a declaration of conformity is
`cccev:Evidence` against a `cccev:Requirement` (not an opaque document
reference), and a product description still flows through `gs1:` /
`schema:` as before.

## Why this works

1. **Bridge-then-lift, not invent.** schema.org, GS1, SEMICeu, UNTP
   (UN/CEFACT) and CIRPASS-2 have done substantial work on cross-EU and
   cross-web data models. Where they have a term, we adopt it; the
   published IRIs (`schema:Product`, `gs1:gtin`,
   `http://data.europa.eu/m8g/PublicOrganisation`,
   `vocabulary.uncefact.org/untp/Party`, …) are canonical and
   tooling that recognises any of these vocabularies automatically
   understands our data.
2. **Module thinness drives audit clarity.** A reviewer looking at PPWR
   doesn't have to understand what packaging-specific recyclability means
   versus textile-specific recyclability — both reuse `oec:RecyclabilityAssessment`.
3. **A single change cascades.** Adding `oec:bioBasedFraction` once means
   PPWR, Detergent, and Textile can all express bio-based content
   identically without coordinating.
4. **Future EU regulations are cheap to add.** CPR, Right-to-Repair, ELV-
   revised, Toys-revised, Forced-Labour, CSDDD — research shows each
   needs ≤5 truly regulation-specific terms once the core is lifted.

## Mature regulations and what's needed for them

| Regulation | Status | Net new module terms (estimate) |
|---|---|---|
| Battery 2023/1542 | ✅ shipped (`eu/battery`) | 0 (mature) |
| EUDR 2023/1115 | ✅ shipped (`eu/eudr`) | 0 (mature) |
| Sustainable Textiles | ✅ shipped (`eu/textile`) | 0 (mature) |
| ESPR Electronics DA | ✅ shipped (`eu/electronics`) | 0 (mature) |
| Detergents 2026/405 | ✅ shipped (`eu/detergent`) | 0 (mature) |
| **PPWR 2025/40** | ✅ shipped (`eu/ppwr`, v0.1.0) | 4 (Packaging, packagingTier, recyclabilityGrade, harmonisedSymbol) |
| **CPR 2024/3110** | ✅ shipped (`eu/cpr`, v0.1.0) | 5 (ConstructionProduct, constructionProductType enum, reactionToFireClass enum, declarationOfPerformanceUrl, EssentialCharacteristic) |
| **Right-to-Repair 2024/1799** | ✅ shipped (oec: enrichment) | 0 — enriches `oec:RepairabilityInfo` with `oec:repairInformationPortalUrl` and `oec:RepairProvider` class |
| **CSDDD 2024/1760** | ✅ shipped (oec: enrichment) | 0 — enriches `oec:DueDiligenceReport` with `oec:dueDiligenceRegulationContext` and `oec:supplyChainTransparencyUrl` |
| **Forced Labour 2024/3015** | ✅ shipped (oec: enrichment) | 0 — enriches `oec:DueDiligenceReport` with `oec:forcedLabourFreeAssertion` |
| **CRMA 2024/1252** | ✅ shipped (oec: enrichment) | 0 — enriches `oec:MaterialComposition` with `oec:isStrategicRawMaterial` and `oec:crmListVersion` |
| FSMA 204 (US) | ✅ shipped (`us/fsma204`) | 0 (mature) |
| End-of-Life Vehicles (revision) | when adopted | ~5 |
| Toys Safety (revision) | when adopted | ~5 |

## Genuine `oec:` gaps — what we minted, why no upstream had it

CIRPASS-2 D3.2 (April 2025) confirmed three concepts as gaps in published
vocabulary; we minted them at `oec:`:

1. **Extended Producer Responsibility** (`oec:ExtendedProducerResponsibility`) —
   national EPR registries vary per Member State; no single international
   vocabulary covers them.
2. **Compostability + Biodegradability + Bio-based** (`oec:Compostability`,
   `oec:Biodegradability`, `oec:bioBasedFraction`) — distinct concepts often
   conflated; references to EN 13432, OK-Compost-Home, ASTM D6400, ISO 14593,
   OECD 301B/D/F.
3. **Deposit-Return Scheme** (`oec:DepositReturnScheme`) — national / planned
   EU-harmonised schemes; no upstream vocabulary.

Everything else delegates upward.

## Where to read this in code

- `extensions/common/core/ontology/dpp-core.ttl` — the `oec:` definitions
  with graded SKOS mapping relations (`skos:exactMatch` / `skos:closeMatch` / `skos:broadMatch`) to GS1,
  schema.org, SEMICeu Core Vocabularies, and UNTP.
- `extensions/common/interop/context/semic-core-bridge-context.jsonld` —
  the term-by-term bridge between our JSON-LD aliases and the SEMICeu
  Core Vocabularies (CCCEV, CPOV, Core Business / Person / Location,
  Core Public Event, CPSV-AP, ADMS-AP).
- `extensions/common/interop/context/untp-bridge-context.jsonld` — the
  authoritative term-by-term bridge between our ergonomic JSON-LD aliases
  and UNTP IRIs.
- `extensions/common/interop/docs/SEMIC_CORE_VOCABULARIES.md` — the
  canonical reference for how SEMICeu Core Vocabularies are integrated
  and which `oec:` / module terms anchor to them.
- `extensions/common/core/docs/PATTERNS.md` — full pattern reference for
  implementers.

## Where to read this in the published vocabulary browser

<https://ref.openepcis.io/extensions/> — region landing pages
(`/eu`, `/us`, `/common`) list each module with a short description that
states what it delegates to `oec:`. Each `oec:` term page shows its
SKOS mapping (`skos:exactMatch` / `skos:closeMatch` / `skos:broadMatch`) upward links to schema.org,
GS1, SEMICeu (`http://data.europa.eu/m8g/...`), and UNTP.
