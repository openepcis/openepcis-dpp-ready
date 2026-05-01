# OpenEPCIS DPP-Ready: The Universal DPP Platform

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![Browse the ontology](https://img.shields.io/badge/browse-ref.openepcis.io-2ea44f)](https://ref.openepcis.io)
[![Status: Preview 0.9.5](https://img.shields.io/badge/status-preview%200.9.5-orange)](#what-you-get)

A comprehensive, standards-harmonizing framework for implementing Digital Product Passports aligned with EU ESPR 2024/1781, GS1, and UN Transparency Protocol (UNTP).

> **Browse the live ontology** at **[ref.openepcis.io](https://ref.openepcis.io)** — every class, property, and JSON-LD context shipped from this repository is published there with stable, dereferenceable URIs. The TTL files in `extensions/*/ontology/` are the source of truth; the browser renders the deployed JSON.

> **TL;DR for decision-makers:** OpenEPCIS DPP-Ready is an open-source platform that harmonises GS1, ESPR, UNTP, and CEN/CENELEC JTC 24 standards in a single codebase. Preview at v0.9.5, six regulations covered (battery, textile, EUDR, electronics, detergent, plus the cross-cutting ESPR core), with US FSMA §204 as a v0.1.0 preview. No vendor lock-in, no proprietary tooling, no translation layers. Built on GS1 Digital Link, EPCIS 2.0, and GS1 Web Vocabulary.

## Open and Early

**We believe in building in the open.** The DPP standardization landscape is rapidly evolving—CEN/CENELEC JTC 24 has six of eight harmonised standards (EN 18216, 18219, 18220, 18221, 18222, 18223) at FprEN stage publishing March 2026, with prEN 18239 and prEN 18246 still in development. CIRPASS2 is defining pilot requirements, and industry needs to start building now.

Rather than waiting for all standards to finalize, OpenEPCIS provides:

- **Early implementation** of emerging requirements from ESPR, CIRPASS2, and JTC 24
- **Open-source vocabulary** that evolves alongside the standards
- **Practical examples** that help the community understand how DPP data works
- **Bridge contexts** for interoperability with other initiatives

The EU Battery Regulation requires DPPs starting **February 2027**. Industry can't wait—we're here to help you start today.

## What You Get

| | Count |
|---|---|
| Modules | 9 — `common/{core,interop}`, `eu/{battery,textile,eudr,electronics,detergent,ppwr}`, `us/{fsma204}` |
| Classes | 110+ |
| Properties | 410+ |
| EPCIS Event Examples | 36+ |
| Bridge Contexts | 4 (UNTP, CIRPASS2, JTC 24, BatteryPass) |
| Regulations Covered | 7 (ESPR, Battery Reg, EUDR, Sustainable Textiles, Electronics DAs, Detergents Reg, **PPWR 2025/40**) |

## Vocabulary layering — the delegation pattern

OpenEPCIS DPP-Ready is organised as **four stacked layers**, each delegating
cross-cutting concepts downward. A new EU regulation typically adds only a
handful of truly regulation-specific terms; everything else reuses the
common-core (`dpp:`) vocabulary, which itself anchors upward to UNTP /
schema.org / GS1.

```
  Layer 4 ─ Regulation modules    (eu/battery, eu/eudr, eu/textile,
                                   eu/electronics, eu/detergent, eu/ppwr,
                                   us/fsma204)
            ↓
  Layer 3 ─ Common DPP core (dpp:)  cross-cutting concepts ≥2 regs share
            ↓ owl:equivalentClass / equivalentProperty
  Layer 2 ─ UNTP v0.7.0 + schema.org  Party, Facility, Material, Claim,
                                       ConformityAttestation, Observation,
                                       hasMeasurement, …
            ↓
  Layer 1 ─ GS1 Web Vocabulary (gs1:)  Product, Organization, Place,
                                        QuantitativeValue, regulatoryInformation
```

**The rule when defining a new term:** walk downward through the layers
and use the *highest* layer that already covers the concept. Mint a new
IRI only when no layer below has it. If you find yourself adding the same
concept to two modules, that's a signal it should move down to `dpp:`.

Full explanation, mature regulations covered today, and what's needed to
add the next ones (CPR / ELV / Toys / Right-to-Repair / Forced Labour /
CSDDD): see [`docs/VOCABULARY_LAYERING.md`](docs/VOCABULARY_LAYERING.md).

## Standards Alignment

| Standard | Alignment | Status |
|----------|-----------|--------|
| **GS1 Web Vocabulary** | Native foundation (`owl:imports`) | Stable |
| **CEN/CENELEC JTC 24** | EN 18216 / 18219 / 18220 / 18221 / 18222 / 18223 (FprEN, publishing Mar 2026); prEN 18239 / 18246 (in development) | 6/8 at FprEN |
| **UN Transparency Protocol** | Property-aligned (`owl:equivalentProperty`) | Stable |
| **CIRPASS2** | Requirements coverage | Documented |
| **ESPR 2024/1781** | Articles 7, 8, 9, 77 covered | Complete |
| **EU Battery Regulation 2023/1542** | Annex XIII covered | Complete |
| **EU Deforestation Regulation (EUDR) 2023/1115** | GS1 EUDR p.0.0 + extensions | Complete (timber focus) |
| **EN 45552-45555** | Methodology support | Documented |
| **ISO/AWI 25534-1** (ISO/TC 154, DPP Part 1) | Tracked | Early stage |

> **Disclaimer**: This is **not official GS1 guidance**, but follows official GS1 standards:
> - [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link)
> - [EPCIS 2.0](https://ref.gs1.org/standards/epcis/)
> - [GS1 Web Vocabulary](https://www.gs1.org/voc/)
> - [GS1 Emerging DPP Standards](https://www.gs1.org/standards/standards-emerging-regulations/DPP)

## ESPR Framework

The EU Ecodesign for Sustainable Products Regulation (ESPR) 2024/1781 establishes the framework for Digital Product Passports across the EU. This framework supports ESPR requirements including:

- **Economic Operator Registration** (Article 77) - EOID identifiers
- **Performance & Durability** (Article 7) - Lifespan, usage cycles
- **Repairability** (Article 7) - Repair scores, spare parts availability
- **Substances of Concern** (Article 8) - SCIP database alignment
- **Access Rights** (Article 9) - Public vs. authorized data

See [common/core/docs/ESPR_FRAMEWORK.md](./extensions/common/core/docs/ESPR_FRAMEWORK.md) for detailed ESPR guidance.

## Overview

This monorepo provides a consistent, GS1-aligned approach to implementing Digital Product Passports across multiple EU regulations:

| Module | Region | Regulation | Status | Version | Last updated |
|--------|--------|------------|--------|---------|--------------|
| [common/core](./extensions/common/core/) | Cross-cutting | ESPR 2024/1781 Framework | Preview | 0.9.5 | Apr 2026 |
| [common/interop](./extensions/common/interop/) | Cross-cutting | Standards Harmonization (UNTP, CIRPASS2, JTC 24, BatteryPass) | Preview | 0.9.5 | Apr 2026 |
| [eu/battery](./extensions/eu/battery/) | EU | Battery Regulation 2023/1542 | Preview | 0.9.5 | Feb 2026 |
| [eu/eudr](./extensions/eu/eudr/) | EU | Deforestation Regulation 2023/1115 | Preview | 0.9.5 | Apr 2026 (exemption pattern added) |
| [eu/textile](./extensions/eu/textile/) | EU | Sustainable Textiles Strategy | Preview | 0.9.5 | Mar 2026 (JRC Milestone 3 alignment) |
| [eu/electronics](./extensions/eu/electronics/) | EU | ESPR Electronics Delegated Acts | Preview | 0.9.5 | Feb 2026 |
| [eu/detergent](./extensions/eu/detergent/) | EU | Detergents Regulation 2026/405 | Preview | 0.9.5 | Mar 2026 |
| [us/fsma204](./extensions/us/fsma204/) | US | FSMA §204 Food Traceability Rule (21 CFR 1 Subpart S) | Preview | 0.1.0 | Apr 2026 (new module) |

## Repository Structure

```
openepcis-dpp-ready/
├── README.md                           # This file
├── LICENSE                             # Apache 2.0
├── package.json                        # Build scripts
├── scripts/
│   └── build-json.ts                   # TTL → JSON compiler
├── bruno/                              # API Testing Collection
│
└── extensions/                         # Region-scoped vocabulary modules
    ├── common/                         # Cross-jurisdictional shared patterns
    │   ├── core/                       # DPP Core (ESPR framework, shared patterns)
    │   │   ├── ontology/dpp-core.ttl
    │   │   ├── context/dpp-core-context.jsonld
    │   │   ├── json/dpp-core.json      # Generated
    │   │   └── docs/                   # PATTERNS, ESPR_FRAMEWORK, GS1_STANDARDS
    │   └── interop/                    # UNTP / CIRPASS2 / JTC 24 / BatteryPass bridges
    │       └── context/*.jsonld
    │
    ├── eu/                             # EU regulations
    │   ├── battery/                    # EU Battery Regulation 2023/1542
    │   ├── eudr/                       # EU Deforestation Regulation 2023/1115
    │   ├── textile/                    # EU Sustainable Textiles Strategy
    │   ├── electronics/                # ESPR Electronics Delegated Acts
    │   └── detergent/                  # EU Detergents Regulation 2026/405
    │
    └── us/                             # US regulations
        └── fsma204/                    # FDA FSMA §204 Food Traceability Rule
```

Each module under `eu/`, `us/`, or `common/` follows the same internal layout:
`VERSION`, `CHANGELOG.md`, `README.md`, `ontology/*.ttl`, `context/*.jsonld`,
`json/*.json` (generated), `examples/*.jsonld`, `epcis/*.jsonld`,
`validation/`, and `docs/`.

## Quick Install

```bash
git clone https://github.com/openepcis/openepcis-dpp-ready.git
cd openepcis-dpp-ready
pnpm install
pnpm run build
```

Then open any module's `examples/` directory for JSON-LD samples, or launch the Bruno collection in `bruno/digital-link-resolver/` for an end-to-end API walkthrough.

## Why every module owns a named EPCIS extension

Each module registers its own `https://ref.openepcis.io/extensions/...`
namespace (`battery:`, `eudr:`, `textile:`, `electronics:`, `detergent:`,
`fsma:`) even when the extension contributes only a single property. The
namespace is not cosmetic — it is the **switch** that tells an OpenEPCIS
EPCIS Repository to activate regulation-specific behaviour on every
capture and query request that declares it via the `GS1-Extensions`
HTTP header (EPCIS 2.0 §12.3):

- Validation dispatches to the matching JSON Schema + SHACL shapes under
  the namespace's `validation/` artefacts.
- Regulation-specific query endpoints and filters (e.g., "all CTEs for a
  TLC", "all DDS references for a GTIN") become available.
- Extension-namespaced properties inside `gs1:masterDataAvailableFor`
  blocks are resolved against the right ontology.
- A stable `@context` URI keeps every `eudr:harvestDate` triple (for
  example) pointed at the same subject everywhere.

See [extensions/common/core/docs/GS1_EXTENSIONS_HEADER.md](./extensions/common/core/docs/GS1_EXTENSIONS_HEADER.md)
for the full rationale.

## Building

The ontologies are maintained as TTL (Turtle) files. For web applications, JSON representations can be generated:

```bash
# Install dependencies
pnpm install

# Generate JSON files from TTL sources
pnpm run build
```

This generates JSON files in each module's `json/` directory:
- `extensions/common/core/json/dpp-core.json`
- `extensions/eu/battery/json/battery.json`
- `extensions/eu/eudr/json/eudr.json`
- `extensions/us/fsma204/json/fsma204.json`

The [ref.openepcis.io](https://ref.openepcis.io) vocabulary browser uses these JSON files to display ontology information.

## Feedback

We welcome feedback from anyone — GS1 GO and GS1 MOs, CEN/CENELEC JTC 24 members, the newly forming ISO/IEC JTC 5 on Digital Product Passport, industry leads, implementers, and the wider open-source community. Open an issue, send a PR, or reach out directly.

## Vocabulary Namespaces

The project follows a **`gs1:` → `schema:` → custom** precedence — extension namespaces below carry only terms that have no `gs1:` or `schema:` equivalent. See [EXTENSION-GOVERNANCE.md](./EXTENSION-GOVERNANCE.md).

| Module | Namespace | Prefix |
|--------|-----------|--------|
| DPP Core | `https://ref.openepcis.io/extensions/common/core/` | `dpp:` |
| Interop | `https://ref.openepcis.io/extensions/common/interop/` | `interop:` |
| Battery | `https://ref.openepcis.io/extensions/eu/battery/` | `battery:` |
| EUDR | `https://ref.openepcis.io/extensions/eu/eudr/` | `eudr:` |
| Textile | `https://ref.openepcis.io/extensions/eu/textile/` | `textile:` |
| Electronics | `https://ref.openepcis.io/extensions/eu/electronics/` | `electronics:` |
| Detergent | `https://ref.openepcis.io/extensions/eu/detergent/` | `detergent:` |
| FSMA §204 | `https://ref.openepcis.io/extensions/us/fsma204/` | `fsma:` |
| _Reused_: GS1 Web Vocabulary | `https://ref.gs1.org/voc/` | `gs1:` |
| _Reused_: schema.org | `https://schema.org/` | `schema:` |

## Value Conventions

All ratio and fraction properties use **0-1 decimal scale** (aligned with UNTP):

```json
{
  "recycledContent": 0.45,
  "massFraction": 0.15,
  "verifiedRatio": 0.80
}
```

This means:
- `0.45` = 45%
- `0.15` = 15%
- `0.80` = 80%

## Quick Start

### For Battery DPP

See [extensions/eu/battery/README.md](./extensions/eu/battery/README.md) for:
- EU Battery Regulation 2023/1542 Annex XIII compliance
- 155+ properties, 25+ classes, 22 sensor types
- 8 EPCIS event examples covering full lifecycle

### For EUDR (Deforestation Regulation)

See [extensions/eu/eudr/README.md](./extensions/eu/eudr/README.md) for:
- EU Deforestation Regulation 2023/1115 compliance
- Geolocation data for production plots
- Due diligence statement patterns
- Wood/timber focus (initial release)

### For Standards Interoperability

See [extensions/common/interop/README.md](./extensions/common/interop/README.md) for:
- UNTP bridge context for native interoperability
- Complete property mapping tables
- CIRPASS2 requirements coverage
- Licensing and attribution documentation

### For Textile DPP

See [extensions/eu/textile/README.md](./extensions/eu/textile/README.md) for:
- EU Sustainable Textiles Strategy compliance
- 85+ vocabulary terms (fiber composition, care symbols, durability)
- Apparel and footwear examples
- ISO 3758 care labelling support

### For Electronics DPP

See [extensions/eu/electronics/README.md](./extensions/eu/electronics/README.md) for:
- French Repairability Index (Indice de Réparabilité)
- EU Right to Repair (A-E grades)
- WEEE Directive compliance (6 categories)
- Energy Labeling (A-G classes, EPREL)
- Software/firmware lifecycle tracking
- Multi-component DPP linking (CIRPASS-2)

## API Testing with Bruno

A Bruno API collection is available for testing DPP workflows with the GS1 Digital Link Resolver:

```bash
# Open in Bruno app
bruno/digital-link-resolver/
```

Features:
- **Product creation**: Textile (jacket, footwear), battery masterdata
- **EPCIS lifecycle events**: Commissioning → production → shipping → end-of-life
- **Organizations**: Manufacturer, retailer registration
- **Resolution**: GS1 Digital Link queries with linkTypes

Environments: `local` (localhost:8080), `dev` (dev.epcis.cloud with Keycloak OAuth2)

See [bruno/digital-link-resolver/README.md](./bruno/digital-link-resolver/README.md) for setup instructions.

## Core Patterns

The `core/` module provides reusable patterns aligned with ESPR across all regulations:

**ESPR-Specific Patterns**:
- **Economic Operator ID (EOID)** - EU-wide operator registration (Article 77)
- **Facility Information** - Manufacturing location data
- **Performance & Durability** - Lifespan, usage cycles (Article 7)
- **Repairability** - Repair scores, spare parts (Article 7)
- **Substances of Concern** - SCIP database alignment (Article 8)
- **Access Rights** - Public vs. authorized data (Article 9)

**General DPP Patterns**:
- **Operator Information** - Economic operator data structure
- **Due Diligence Reports** - Supply chain transparency
- **Hazardous Substances** - CLP Regulation compliance
- **Document References** - Certificates, reports, manuals
- **Circularity Information** - End-of-life, recycling
- **Carbon Footprint** - Lifecycle emissions data

See [extensions/common/core/docs/PATTERNS.md](./extensions/common/core/docs/PATTERNS.md) for detailed documentation.
See [extensions/common/core/docs/ESPR_FRAMEWORK.md](./extensions/common/core/docs/ESPR_FRAMEWORK.md) for ESPR-specific guidance.

## Versioning

Each module follows [Semantic Versioning](https://semver.org/) and is versioned independently. Current state:

| Module | Version | Notes |
|--------|---------|-------|
| `common/core` | 0.9.5 | ESPR framework + shared patterns; breaking changes bump major |
| `common/interop` | 0.9.5 | UNTP / CIRPASS2 / JTC 24 / BatteryPass bridges |
| `eu/battery` | 0.9.5 | Battery Regulation 2023/1542 |
| `eu/eudr` | 0.9.5 | Deforestation Regulation 2023/1115 |
| `eu/textile` | 0.9.5 | Sustainable Textiles |
| `eu/electronics` | 0.9.5 | ESPR Electronics Delegated Acts |
| `eu/detergent` | 0.9.5 | Detergents Regulation 2026/405 |
| `us/fsma204` | 0.1.0 | FDA FSMA §204 (preview) |

Modules declare their minimum `common/core` dependency in their respective `README.md` and `CHANGELOG.md`.

## GS1 Standards Used

| Standard | Purpose |
|----------|---------|
| [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link) | Product/location identifiers |
| [EPCIS 2.0](https://ref.gs1.org/standards/epcis/) | Supply chain events |
| [GS1 Web Vocabulary](https://www.gs1.org/voc/) | Semantic data model |
| [CBV 2.0](https://www.gs1.org/standards/epcis/cbv) | Business vocabulary |

## EPCIS 2.0 Extension Compliance

Each module in this framework is designed as a **first-class EPCIS 2.0 extension** per [EPCIS 2.0 Section 12.3](https://ref.gs1.org/standards/epcis/).

### Architecture Rule

**`gs1:masterDataAvailableFor`** in EPCIS events contains ONLY `gs1:` Web Vocabulary properties (product name, country of origin, regulatory information, etc.). Extension properties (`dpp:`, `battery:`, `eudr:`, `textile:`, `electronics:`, `detergent:`) go at **event level** -- as siblings of `bizStep`, `epcList`, etc.

See [extensions/common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md](./extensions/common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md) for the canonical three-angle reference (EPCIS structure, GS1 WebVoc patterns, RDF correctness).

### GS1-Extensions HTTP Header

Declare extensions using the `GS1-Extensions` header (per EPCIS 2.0 specification):

```http
GS1-Extensions: dpp=https://ref.openepcis.io/extensions/common/core/, battery=https://ref.openepcis.io/extensions/eu/battery/, textile=https://ref.openepcis.io/extensions/eu/textile/
```

### Extension Namespaces

| Module | GS1-Extensions Header Value |
|--------|---------------------------|
| DPP Core | `dpp=https://ref.openepcis.io/extensions/common/core/` |
| Battery | `battery=https://ref.openepcis.io/extensions/eu/battery/` |
| EUDR | `eudr=https://ref.openepcis.io/extensions/eu/eudr/` |
| Textile | `textile=https://ref.openepcis.io/extensions/eu/textile/` |
| Electronics | `electronics=https://ref.openepcis.io/extensions/eu/electronics/` |
| Detergent | `detergent=https://ref.openepcis.io/extensions/eu/detergent/` |
| FSMA §204 | `fsma=https://ref.openepcis.io/extensions/us/fsma204/` |

### JSON-LD Context Integration

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld"
  ]
}
```

### Optional: GS1 Shortcuts Context

For cleaner syntax with GS1 RegulationTypeCode values, include the optional shortcuts context:

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/common/core/gs1-shortcuts-context.jsonld"
  ],
  "gs1:regulatoryInformation": {
    "gs1:regulationType": "BATTERY_DIRECTIVE",
    "gs1:isRegulationCompliant": true
  }
}
```

This allows `"BATTERY_DIRECTIVE"` instead of `{"id": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE"}`. See [extensions/common/core/context/gs1-shortcuts-context.jsonld](./extensions/common/core/context/gs1-shortcuts-context.jsonld) for all available shortcuts.

See [extensions/eu/eudr/docs/EPCIS_EXTENSION_GUIDE.md](./extensions/eu/eudr/docs/EPCIS_EXTENSION_GUIDE.md) for detailed EPCIS integration patterns.

## Regulation Type Codes

Use `gs1:regulatoryInformation` with appropriate codes:

```json
{
  "type": "gs1:RegulatoryInformation",
  "gs1:regulationType": { "id": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE" },
  "gs1:regulatoryAct": "EU 2023/1542",
  "gs1:isRegulationCompliant": true
}
```

Available codes:
- `gs1:RegulationTypeCode-BATTERY_DIRECTIVE`
- `gs1:RegulationTypeCode-DEFORESTATION_REGULATION`
- `gs1:RegulationTypeCode-ROHS_DIRECTIVE`
- `gs1:RegulationTypeCode-WEEE_DIRECTIVE`
- `gs1:RegulationTypeCode-REACH`

## Contributing

Contributions are welcome under the [Apache License 2.0](./LICENSE). Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow (TTL is the source of truth, GS1-first extension governance, branch and PR conventions, helper commands) and [codeOfConduct.md](./codeOfConduct.md) for the project Code of Conduct.

Quick checklist before opening a PR:
- TTL ontologies validate with `rapper`
- `pnpm run build` regenerates JSON in sync
- JSON-LD examples and EPCIS events validate
- Module `CHANGELOG.md` updated

## License

Apache License 2.0 - See [LICENSE](./LICENSE)

## Links

- [Browse the live ontology — ref.openepcis.io](https://ref.openepcis.io)
- [OpenEPCIS Documentation](https://openepcis.io/docs/digital-product-passport/)
- [Contributing guide](./CONTRIBUTING.md)
- [Code of Conduct](./codeOfConduct.md)
- [Extension Governance](./EXTENSION-GOVERNANCE.md)
- [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link)
- [EPCIS 2.0 Standard](https://ref.gs1.org/standards/epcis/)
- [GS1 Web Vocabulary](https://www.gs1.org/voc/)
