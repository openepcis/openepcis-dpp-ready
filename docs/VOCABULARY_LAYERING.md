# Vocabulary Layering — the delegation pattern behind OpenEPCIS DPP-Ready

This project is organised as **four stacked layers**, each one delegating
cross-cutting concepts to the layer below. The result is that a new EU
regulation module typically adds only a handful of truly regulation-specific
terms, and a single change at a higher layer benefits every module above it.

```
   ┌──────────────────────────────────────────────────────────────────┐
   │  Layer 4 — Regulation modules                                    │
   │    eu/battery   eu/eudr   eu/textile   eu/electronics            │
   │    eu/detergent eu/ppwr                us/fsma204   …            │
   │  ↓ each module only mints terms unique to its regulation         │
   ├──────────────────────────────────────────────────────────────────┤
   │  Layer 3 — DPP common core (`dpp:`)                              │
   │    Cross-cutting concepts that ≥2 regulations share:             │
   │    EPR, Compostability, Biodegradability, DepositReturnScheme,   │
   │    RecycledContent, HazardousSubstance, OperatorInformation,     │
   │    FacilityInformation, RepairabilityInfo, AccessRights, …       │
   │  ↓ anchored upward via owl:equivalentClass / equivalentProperty  │
   ├──────────────────────────────────────────────────────────────────┤
   │  Layer 2 — UNTP / schema.org / Schema.org Observation pattern    │
   │    UNTP Core Vocabulary v0.7.0                                   │
   │    https://vocabulary.uncefact.org/untp/0.7.0/                   │
   │      Party, Facility, Material, Claim, Criterion, Standard,      │
   │      Regulation, ConformityAttestation, ConformityScheme,        │
   │      ProductStatus, ProductIDGranularity, PerformanceMetric, …   │
   │    schema.org                                                    │
   │      Observation, Certification, hasMeasurement,                 │
   │      EnergyConsumptionDetails, Place                             │
   │  ↓                                                               │
   ├──────────────────────────────────────────────────────────────────┤
   │  Layer 1 — GS1 Web Vocabulary (`gs1:`)                           │
   │    Product, Organization, Place, Country, GeoShape,              │
   │    QuantitativeValue, regulatoryInformation, regulatoryAct,      │
   │    regulatoryIdentifier, packagingMaterial, …                    │
   │    UN/CEFACT Rec 20 unit codes (KGM, KWH, AMH, P1, ANN, EUR, …)  │
   └──────────────────────────────────────────────────────────────────┘
```

## The delegation rule

When defining a new term, walk **downward** through the four layers. The
term goes in the **highest** layer that already covers it; only mint a new
IRI when no layer below already has it.

| Decision | Action |
|---|---|
| Already in `gs1:` | Use it directly. |
| Already in UNTP / schema.org | Reference it directly **and** anchor any local alias upward via `owl:equivalentClass` / `owl:equivalentProperty`. |
| Cross-cuts ≥2 regulations but absent upstream | Mint at `dpp:` (common/core). |
| Specific to one regulation | Mint at the module namespace (`eu/<module>:`). |

**Conversely:** if you find yourself adding the same concept to two modules,
that's a signal it should move down to `dpp:`.

## Why this works

1. **Bridge-then-lift, not invent.** UNTP (UN/CEFACT) and CIRPASS-2 have done
   substantial work on a cross-EU DPP ontology. Where they have a term, we
   adopt it; the published `vocabulary.uncefact.org/untp/0.7.0/` IRIs are
   canonical and tooling that knows UNTP automatically understands our data.
2. **Module thinness drives audit clarity.** A reviewer looking at PPWR
   doesn't have to understand what packaging-specific recyclability means
   versus textile-specific recyclability — both reuse `dpp:RecyclabilityAssessment`.
3. **A single change cascades.** Adding `dpp:bioBasedFraction` once means
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
| **Right-to-Repair 2024/1799** | ✅ shipped (dpp: enrichment) | 0 — enriches `dpp:RepairabilityInfo` with `dpp:repairInformationPortalUrl` and `dpp:RepairProvider` class |
| **CSDDD 2024/1760** | ✅ shipped (dpp: enrichment) | 0 — enriches `dpp:DueDiligenceReport` with `dpp:dueDiligenceRegulationContext` and `dpp:supplyChainTransparencyUrl` |
| **Forced Labour 2024/3015** | ✅ shipped (dpp: enrichment) | 0 — enriches `dpp:DueDiligenceReport` with `dpp:forcedLabourFreeAssertion` |
| **CRMA 2024/1252** | ✅ shipped (dpp: enrichment) | 0 — enriches `dpp:MaterialComposition` with `dpp:isStrategicRawMaterial` and `dpp:crmListVersion` |
| FSMA 204 (US) | ✅ shipped (`us/fsma204`) | 0 (mature) |
| End-of-Life Vehicles (revision) | when adopted | ~5 |
| Toys Safety (revision) | when adopted | ~5 |

## Genuine `dpp:` gaps — what we minted, why no upstream had it

CIRPASS-2 D3.2 (April 2025) confirmed three concepts as gaps in published
vocabulary; we minted them at `dpp:`:

1. **Extended Producer Responsibility** (`dpp:ExtendedProducerResponsibility`) —
   national EPR registries vary per Member State; no single international
   vocabulary covers them.
2. **Compostability + Biodegradability + Bio-based** (`dpp:Compostability`,
   `dpp:Biodegradability`, `dpp:bioBasedFraction`) — distinct concepts often
   conflated; references to EN 13432, OK-Compost-Home, ASTM D6400, ISO 14593,
   OECD 301B/D/F.
3. **Deposit-Return Scheme** (`dpp:DepositReturnScheme`) — national / planned
   EU-harmonised schemes; no upstream vocabulary.

Everything else delegates upward.

## Where to read this in code

- `extensions/common/core/ontology/dpp-core.ttl` — the `dpp:` definitions
  with `owl:equivalentClass`/`equivalentProperty` declarations to UNTP and
  schema.org.
- `extensions/common/interop/context/untp-bridge-context.jsonld` — the
  authoritative term-by-term bridge between our ergonomic JSON-LD aliases
  and UNTP IRIs.
- `extensions/common/core/docs/PATTERNS.md` — full pattern reference for
  implementers.

## Where to read this in the published vocabulary browser

<https://ref.openepcis.io/extensions/> — region landing pages
(`/eu`, `/us`, `/common`) list each module with a short description that
states what it delegates to `dpp:`. Each `dpp:` term page shows its
`owl:equivalentClass`/`equivalentProperty` upward links to UNTP / schema.org.
