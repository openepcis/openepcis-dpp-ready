# OpenEPCIS Battery DPP

**The GS1-Native 360° Battery Passport Solution**

A complete Digital Product Passport implementation for batteries using GS1 standards directly, fully compliant with EU Battery Regulation 2023/1542.

> **Disclaimer**: This is **not official GS1 guidance**, but it is built entirely on official GS1 standards and follows GS1 best practices:
>
> - **[GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link)** — Resolvable URIs as product identifiers (`id`)
> - **[EPCIS 2.0](https://ref.gs1.org/standards/epcis/)** — Event-based traceability with JSON-LD support
> - **[GS1 Web Vocabulary](https://www.gs1.org/voc/)** — Linked data vocabulary for product information
> - **[CBV 2.0](https://ref.gs1.org/standards/cbv/)** — Standard business vocabulary (bizStep, disposition)
> - **[UN/CEFACT Rec 20](https://unece.org/trade/uncefact/cl-recommendations)** — Unit of measure codes
>
> **GS1 Best Practices We Follow:**
> - URIs that resolve (not opaque URNs) — scan QR → get data
> - GLN for organizations and locations, GTIN+serial for products
> - EPCIS events with full provenance (who/what/when/where/why)
> - `gs1:regulatoryInformation` pattern (same as GS1 EUDR approach)
> - Content negotiation for JSON-LD / HTML responses
>
> We invite everyone to use these templates and welcome feedback — please [open an issue](https://github.com/openepcis/openepcis-battery-dpp/issues) or reach out to help us improve this resource.

## Why This Project?

> *"You already use GS1. We give you battery passport compliance by Feb 2027 without learning new data models."*

### The Problem

Existing battery passport approaches create unnecessary complexity:

| Approach | Issue |
|----------|-------|
| **BatteryPass/SAMM** | URN identifiers that don't resolve. Requires separate lookup infrastructure. |
| **DPP Keystone** | Intermediary `dppk:` namespace with equivalence mappings. Adds translation layer. |
| **Catena-X** | Requires membership, proprietary tooling, SAMM expertise. High barrier. |

### Our Solution

**Your battery's `id` IS its resolver URL:**

```json
{
  "id": "https://id.gs1.org/01/09521234000013/21/BAT2024-001",
  "type": ["gs1:Product", "Battery"]
}
```

Scan QR code → resolve URI → get data. **One identity, resolvable everywhere.**

> **Note**: All example identifiers use **GS1 prefix 952** — the official prefix for demos and examples per [GS1 guidance](https://www.gs1.org/standards/bc-epc-interop). Never use 952 for real-world identification.

## Key Features

- **GS1-Native**: Uses existing manufacturer infrastructure (GTINs, GLNs, Digital Link)
- **Resolvable IDs**: Digital Link URIs that actually resolve to data
- **Full Provenance**: EPCIS events capture who/when/where/why for dynamic data
- **Complete Coverage**: All EU Battery Regulation Annex XIII requirements
- **Lower Barrier**: No Catena-X membership or SAMM tools needed
- **Context Flexibility**: Same data works for supply chain AND research (via scientific context)
- **Feb 2027 Ready**: Practical path to compliance

## GS1 Standards Alignment

This implementation follows the **same patterns used by GS1 for EUDR** (EU Deforestation Regulation), establishing a consistent approach for all regulatory compliance data:

### Regulatory Information Pattern

Uses official GS1 Web Vocabulary for regulatory compliance:

```json
{
  "regulatoryInformation": {
    "regulationType": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE",
    "regulatoryAct": "EU 2023/1542",
    "isRegulationCompliant": true
  }
}
```

### EPCIS + Master Data Integration

<!-- Diagram source: docs/diagrams/battery-epcis-masterdata.d2 — regenerate with `pnpm run diagrams:build`. -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/diagrams/battery-epcis-masterdata-dark.svg">
  <img alt="Dynamic EPCIS events (bizStep notifying/inspecting/commissioning, gs1:masterDataAvailableFor, gs1:regulatoryInformation) link down to static JSON-LD master data (gs1: plus eubat:, regulatory information)." src="docs/diagrams/battery-epcis-masterdata-light.svg" width="560">
</picture>

**Architecture rule**: `masterDataAvailableFor` carries product/party/location
**master data** — GS1 Web Vocabulary terms written bare, plus **product-level**
extension attributes that have no GS1 equivalent (e.g. `eubat:batteryChemistry`,
`eubat:ratedCapacity`, `schema:category`), since they describe the GTIN and are
identical across every item of that SKU. **Event-specific / dynamic** extension
data (a single measurement, this-shipment KDEs, incident severity) goes at **event
level**, not in `masterDataAvailableFor`. See the canonical rule in
[core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md §2](../core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md).

This pattern enables **reuse across all EU DPP regulations** (Battery, EUDR, Textile, Electronics).

## Data Exchange Patterns

Two complementary patterns for sharing battery compliance data:

### 1. RegulatoryNotification (B2B Messaging)

Simple JSON-LD message for sharing compliance status between supply chain partners:

```json
{
  "@context": {"gs1": "https://ref.gs1.org/voc/", ...},
  "type": "RegulatoryNotification",
  "messageSender": { "partyGLN": "9521234000006" },
  "messageRecipient": { "partyGLN": "9521234000105" },
  "regulatoryInformation": {
    "regulatoryAct": "EU 2023/1542",
    "regulationType": "gs1:RegulationTypeCode-BATTERY_DIRECTIVE",
    "isRegulationCompliant": true,
    "regulatoryIdentifier": {
      "regulatoryIdentifierType": "gs1:RegulatoryIdentifierType-EU_DECLARATION_OF_CONFORMITY",
      "regulatoryReferenceNumber": "DoC-BAT-2024-00123"
    }
  }
}
```

See `examples/regulatory-notification.jsonld` for the complete example.

### 2. EPCIS Events (Supply Chain Visibility)

For full traceability with provenance, use EPCIS events:

**Standard EPCIS Traceability**:
- `commissioning` — Battery creation
- `shipping` / `receiving` — Supply chain transfers
- `inspecting` — SoH, SOCE measurements

**Compliance Pattern** (for regulatory data sharing):
```json
{
  "type": "ObjectEvent",
  "bizStep": "notifying",
  "disposition": "conformant",
  "regulatoryInformation": [{

    "regulatoryAct": "EU 2023/1542",
    "isRegulationCompliant": true
  }]
}
```

See the [`epcis/`](./epcis/) directory for 9 complete event examples. Two show
master data attached to the GS1 Digital Link via `masterDataAvailableFor`:
[`commissioning.jsonld`](./epcis/commissioning.jsonld) (battery creation) and
[`shipping.jsonld`](./epcis/shipping.jsonld) (placed on market / dispatched — the
DPP card a Digital Link resolver returns when the battery's QR is scanned).

## Comparison

| Aspect | BatteryPass (SAMM) | Catena-X | **OpenEPCIS Battery DPP** |
|--------|-------------------|----------|---------------------------|
| **Identity** | URN (non-resolvable) | URN + EDC | GS1 Digital Link (resolvable) |
| **Namespace** | `urn:samm:io.BatteryPass.*` | Custom + SAMM | `gs1:` + `eubat:` |
| **Dereferenceable** | No | Partially | **Yes** |
| **Dynamic Data** | Static with `lastUpdate` | Via EDC | EPCIS events with provenance |
| **Infrastructure** | Custom | Catena-X network | GS1 Digital Link resolvers |
| **Entry Barrier** | Medium | High | **Low** |
| **Scientific Bridge** | None | None | EMMO/QUDT via context |

## Architecture

<!-- Diagram source: docs/diagrams/battery-architecture.d2 — regenerate with `pnpm run diagrams:build`. -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/diagrams/battery-architecture-dark.svg">
  <img alt="The GS1 Digital Link Resolver fans out to a static Product Master and a dynamic EPCIS Repository, both backed by the Battery Ontology that extends the GS1 Web Vocabulary." src="docs/diagrams/battery-architecture-light.svg" width="520">
</picture>

## Directory Structure

```
battery/
├── README.md
├── ontology/
│   └── battery.ttl              # Battery vocabulary (extends GS1)
├── json/
│   └── battery.json             # Generated JSON (for web apps)
├── examples/
│   ├── battery-product.jsonld        # Complete product master data
│   └── regulatory-notification.jsonld # B2B compliance message
├── epcis/
│   ├── commissioning.jsonld           # Battery created (master data → Digital Link)
│   ├── shipping.jsonld                # Placed on market (master data → Digital Link)
│   ├── regulatory-notification.jsonld # Regulatory compliance notification
│   ├── carbon-footprint.jsonld        # CFP declaration event
│   ├── state-of-health.jsonld         # SoH measurement event
│   ├── state-of-certified-energy.jsonld  # SOCE measurement
│   ├── ownership-transfer.jsonld      # Ownership change
│   ├── negative-event.jsonld          # Accident/damage event
│   └── temperature-extreme.jsonld     # Temperature excursion
├── context/
│   ├── battery-context.jsonld                # Default GS1-native context
│   ├── battery-context-scientific.jsonld     # EMMO/QUDT bridge context
│   ├── battery-context-batterypass-bridge.jsonld  # BatteryPass → OpenEPCIS bridge
│   └── battery-context-to-batterypass.jsonld # OpenEPCIS → BatteryPass bridge
├── validation/
│   └── battery-profile.json     # OpenEPCIS Event Sentry profile
└── docs/
    ├── IMPLEMENTATION_GUIDE.md  # Comprehensive implementation guide
    └── URL_PATTERNS.md          # Complete URI and identifier reference
```

## Vocabulary Namespace

The battery vocabulary uses the namespace: `https://ref.openepcis.io/extensions/eu/battery/`

Browse the vocabulary at: [ref.openepcis.io/extensions/eu/battery/](https://ref.openepcis.io/extensions/eu/battery/)

## Context Flexibility

Same data, different semantic views:

| Context | Purpose | Users |
|---------|---------|-------|
| `battery-context.jsonld` | Default GS1-native | Manufacturers, regulators |
| `battery-context-scientific.jsonld` | EMMO/QUDT equivalences | Researchers, scientific tools |
| `battery-context-batterypass-bridge.jsonld` | BatteryPass → OpenEPCIS | Interoperability with BatteryPass data |
| `battery-context-to-batterypass.jsonld` | OpenEPCIS → BatteryPass | Export to BatteryPass format |

```json
// Supply chain systems use default context
{ "@context": "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld" }

// Scientific systems use enriched context
{ "@context": "https://ref.openepcis.io/extensions/eu/battery/battery-context-scientific.jsonld" }

// Interpret BatteryPass/SAMM data using OpenEPCIS vocabulary
{ "@context": [
    "urn:samm:io.BatteryPass.GeneralProductInformation:1.3.0#",
    "https://ref.openepcis.io/extensions/eu/battery/battery-context-batterypass-bridge.jsonld"
  ]
}
```

### BatteryPass/SAMM Interoperability

The bridge contexts enable **bidirectional compatibility** with BatteryPass (DIN DKE SPEC 99100):

- **`battery-context-batterypass-bridge.jsonld`**: Add to BatteryPass documents to interpret them using OpenEPCIS/GS1 vocabulary. Maps `urn:samm:io.BatteryPass.*` terms to `eubat:` equivalents.

- **`battery-context-to-batterypass.jsonld`**: Add to OpenEPCIS documents to export them with BatteryPass-compatible terminology.

This is the proper JSON-LD semantic web approach—no separate migration tools needed, just context files that enable interoperability.

### BatteryPass-Ready conformance (GEFEG test environment — LIVE)

The GEFEG **BatteryPass-Ready** test environment at
[batterypass-ready.gefeg.com](https://batterypass-ready.gefeg.com/) is **live**
(Build 0.1.1). All four category passports exported from this module — EV, LMT,
Other Industrial, Stationary — **validate clean against the live `ValidateJSON`
server** (verified 2026-06-17).

> **Key finding:** GEFEG's *downloadable* schema files do **not** match what the
> live server enforces (no `required`, wrong Stationary root key, different key
> names, per-category required-sets). The server is authoritative. Full analysis:
> [`docs/CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md`](./docs/CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md).

**Artifacts**

| Path | What |
|---|---|
| [`scripts/export-batterypass-gefeg.ts`](../../../scripts/export-batterypass-gefeg.ts) | flat OpenEPCIS passport → GEFEG upload shape (`pnpm run export:batterypass-gefeg`) |
| [`scripts/validate-batterypass-live.ts`](../../../scripts/validate-batterypass-live.ts) | call the live API — authoritative check (`pnpm run validate:batterypass-live`) |
| [`validation/gefeg-live/`](./validation/gefeg-live/) | live-accurate per-category schemas (`pnpm run build:gefeg-live-schema`; refresh required-sets with `pnpm run probe:gefeg-required`) |
| [`examples/batterypass-ready/`](./examples/batterypass-ready/) | verified-valid fixture per category + the flat source |
| [`docs/GEFEG_MAPPING.md`](./docs/GEFEG_MAPPING.md) | GEFEG upload structure ↔ `eubat:`/`gs1:`/`schema:`/`oec:` mapping |
| [`docs/reference/gefeg-batterypass-ready/`](./docs/reference/gefeg-batterypass-ready/) | the published static schemas (kept as discrepancy evidence) |

**Pipeline (EPCIS 2.0 extension → GEFEG conformance)**

1. EPCIS events declare `GS1-Extensions: dpp=…,battery=…` and carry `eubat:`/`oec:` properties at event level. See [`epcis/commissioning.jsonld`](./epcis/commissioning.jsonld) / [`epcis/shipping.jsonld`](./epcis/shipping.jsonld).
2. The repository activates validation (SHACL [`validation/battery-shapes.ttl`](./validation/battery-shapes.ttl), JSON Schema [`validation/battery-schema.json`](./validation/battery-schema.json)).
3. The assembled master data is exported to the GEFEG upload shape (`export-batterypass-gefeg.ts`).
4. The result validates against the live-derived schema for its category in [`validation/gefeg-live/`](./validation/gefeg-live/) — and against the live server itself.

**Offline harness** — `pnpm test` runs [`scripts/test-batterypass-conformance.ts`](../../../scripts/test-batterypass-conformance.ts): exports the passport for each category, validates it against the live-derived schema, and runs cross-field plausibility checks (voltage ordering, percent ranges, positivity, UTC timestamps) that exceed the live tool's current structure-only scope.

> A separate, internal longlist-coverage schema (`validation/batterypass-v1.3-schema.json`, built by `scripts/build-batterypass-schema.ts`) and the SAMM bridge contexts predate this work; the live-derived schemas above are the conformance contract.

## ESPR Framework Alignment

The EU Battery Regulation 2023/1542 is the **first delegated act under the ESPR framework** (Ecodesign for Sustainable Products Regulation 2024/1781). This battery module is designed with full ESPR alignment in mind.

### ESPR Core Classes Used

The battery vocabulary extends shared ESPR patterns from the core DPP module:

| ESPR Requirement | Core Class | Battery Usage |
|------------------|------------|---------------|
| Article 7 - Performance | `oec:PerformanceInfo` | State of Health, cycle life, capacity retention |
| Article 7 - Repairability | `oec:RepairabilityInfo` | Spare parts availability, repair instructions |
| Article 8 - Substances | `oec:SubstanceOfConcern` | Hazardous substances (SCIP aligned) |
| Article 9 - Access Rights | `oec:AccessRights` | Public vs. restricted data |
| Article 77 - Operator ID | `oec:economicOperatorId` | EOID for economic operators |

### Relationship to ESPR

```
┌─────────────────────────────────────────────────────────────┐
│              ESPR 2024/1781 (Framework)                      │
│  Common patterns: Performance, Repairability, Substances,    │
│  Access Rights, Economic Operator Registration               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         EU Battery Regulation 2023/1542                      │
│  FIRST PRIORITY SECTOR - DPPs mandatory Feb 2027            │
│  Battery-specific: Chemistry, SoH, SOCE, Carbon footprint   │
└─────────────────────────────────────────────────────────────┘
```

> **See also**: [ESPR Framework Documentation](../core/docs/ESPR_FRAMEWORK.md) for complete ESPR guidance applicable across all product categories.

## EU Battery Regulation Compliance

Maps to EU Battery Regulation 2023/1542 Annex XIII:

| Requirement | Implementation |
|-------------|----------------|
| Unique identifier | `id` = GS1 Digital Link |
| Manufacturer info | `gs1:manufacturer` with GLN |
| Operator info | `eubat:operatorInformation` |
| Carbon footprint | EPCIS event with lifecycle breakdown |
| State of Health | EPCIS `sensorReport` with provenance |
| State of Certified Energy | EPCIS `sensorReport` |
| Material composition | `eubat:materialComposition` |
| Hazardous substances | `eubat:hazardousSubstances` |
| Recycled content | Pre/post consumer split per material |
| Dismantling info | `eubat:dismantlingDocuments` |
| Spare parts | `eubat:sparePartSources` |
| Labels | `eubat:labels` with symbols |
| Due diligence | `eubat:supplyChainDueDiligence` |
| Declaration of conformity | `eubat:declarationOfConformity` |
| Negative events | EPCIS events with full provenance |

## Usage

### Resolve a Battery DPP

```bash
# Get JSON-LD
curl -H "Accept: application/ld+json" \
  https://id.gs1.org/01/09521234000013/21/BAT2024-001

# Get HTML
curl -H "Accept: text/html" \
  https://id.gs1.org/01/09521234000013/21/BAT2024-001

# Get EPCIS event history
curl -H "Accept: application/ld+json" \
  "https://id.gs1.org/01/09521234000013/21/BAT2024-001?linkType=gs1:epcis"
```

### Validate with OpenEPCIS Event Sentry

```java
EventSentry sentry = EventSentry.load("validation/battery-profile.json");
ValidationResult result = sentry.validate(epcisEvent);
```

### API Testing with Bruno

A complete Bruno API collection is available for testing battery DPP workflows:

```
bruno/digital-link-resolver/
├── 01-products/battery/
│   ├── create-ev-battery.bru          # Create EV battery masterdata
│   └── get-battery-masterdata.bru     # Resolve battery product
└── 02-epcis-events/battery-lifecycle/
    ├── 01-commissioning.bru           # Battery production
    ├── 02-installation.bru            # Vehicle integration
    └── 03-maintenance.bru             # SoH health check
```

**Setup**:
1. Install [Bruno](https://www.usebruno.com/)
2. Open `bruno/digital-link-resolver/` as collection
3. Select `local` or `dev` environment
4. Run requests in sequence

The collection demonstrates:
- Full battery lifecycle events with `eubat:` extensions
- State of Health (SoH) tracking in maintenance events
- Installation with vehicle VIN linkage
- Diagnostic results and BMS software version tracking

## Timeline

- **August 2025**: Prepare DPP infrastructure
- **February 2027**: Full DPP requirements enter into force
- **2030+**: Recycled content thresholds increase

## Documentation

See [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) for:
- Detailed implementation steps
- Ontology reference
- EPCIS event types
- EMMO/QUDT mapping tables
- Complete regulatory compliance checklist

See [docs/URL_PATTERNS.md](docs/URL_PATTERNS.md) for:
- Complete GS1 Digital Link URI patterns
- Fragment identifier conventions
- Vocabulary namespace reference
- bizStep and disposition value mappings
- Event identifier schemes
- Process assumptions and validation checklists

See [docs/BENCHMARK.md](docs/BENCHMARK.md) for:
- Detailed comparison with BatteryPass, Catena-X, and DPP Keystone
- Feature-by-feature analysis
- Cost and barrier-to-entry comparison
- Regulatory compliance matrix

## Statistics

| Metric | Value |
|--------|-------|
| Ontology properties | 205 |
| EPCIS sensor types | 24 |
| Classes defined | 58 |
| Enumerations | 16 (88 values) |
| Ontology parts | 21 |
| EPCIS event examples | 8 |
| B2B message examples | 1 |
| Context files | 4 |
| Example files | 12 |
| Regulatory coverage | 100% |
| BatteryPass compatibility | Full (via bridge contexts) |

## Known Gaps

This section documents planned features and known limitations for transparency:

### Validation Profile (Planned)
- `validation/battery-profile.json` - OpenEPCIS Event Sentry validation profile is planned but not yet implemented
- The profile will enable automated validation of battery DPP EPCIS events against EU Battery Regulation requirements

### Documentation Gaps
- **EMMO/QUDT Mapping Table**: Detailed mapping table between battery vocabulary and EMMO/QUDT scientific ontologies is planned for `docs/IMPLEMENTATION_GUIDE.md`
- **Property Cardinality**: No mandatory vs optional property documentation yet - users should refer to EU Battery Regulation Annex XIII for requirements
- **Complex EPCIS Scenarios**: Multi-event chain examples (e.g., full battery lifecycle from manufacturing through recycling) are planned

### Version Strategy
- Currently pre-1.0 release
- Namespace URIs are stable: `https://ref.openepcis.io/extensions/eu/battery/`
- Breaking changes will be documented in release notes

We welcome contributions to address these gaps - please [open an issue](https://github.com/openepcis/openepcis-battery-dpp/issues) or submit a pull request.

## License

Apache 2.0

## References

### GS1 Standards & Specifications

These are the official GS1 standards and guidelines we used to build this implementation:

| Standard | Version | How We Use It |
|----------|---------|---------------|
| [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link) | 1.2 | URI structure for `id`, QR code encoding |
| [EPCIS](https://ref.gs1.org/standards/epcis/) | 2.0 | Event capture, JSON-LD serialization |
| [Core Business Vocabulary (CBV)](https://ref.gs1.org/standards/cbv/) | 2.0 | bizStep, disposition, source/destination types |
| [GS1 Web Vocabulary](https://www.gs1.org/voc/) | — | Product attributes, organization data |
| [GS1 Application Identifiers](https://www.gs1.org/standards/barcodes/application-identifiers) | — | AI-01 (GTIN), AI-21 (serial), AI-414 (GLN), AI-8004 (GIAI) |
| [GS1 EUDR Standard](https://ref.gs1.org/standards/eudr/) | — | `gs1:regulatoryInformation` pattern reference |

### GS1 Tools & Resources

- [GS1 Check Digit Calculator](https://www.gs1.org/services/check-digit-calculator) — Verify GTIN/GLN check digits
- [GS1 Company Prefix](https://www.gs1.org/standards/id-keys/company-prefix) — GCP assignment guidance
- [GS1 Prefix 952 for Demos](https://www.gs1.org/standards/bc-epc-interop) — Official demo/test prefix
- [GS1 Digital Link Toolkit](https://www.gs1.org/services/digital-link) — Resolver implementation

### GS1 Vocabulary References

- [gs1:Product](https://www.gs1.org/voc/Product) — Base product class
- [gs1:Organization](https://www.gs1.org/voc/Organization) — Manufacturer, operator
- [gs1:Place](https://www.gs1.org/voc/Place) — Locations
- [gs1:QuantitativeValue](https://www.gs1.org/voc/QuantitativeValue) — Measurements with units
- [gs1:regulatoryInformation](https://www.gs1.org/voc/regulatoryInformation) — Compliance data
- [gs1:RegulationTypeCode-BATTERY_DIRECTIVE](https://ref.gs1.org/voc/RegulationTypeCode-BATTERY_DIRECTIVE) — Battery regulation code

### EU Regulations & Other References

- [EU Battery Regulation 2023/1542](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1542) — Legal requirements
- [DIN DKE SPEC 99100](https://www.dke.de/de/arbeitsfelder/mobility/din-dke-spec-99100) — Technical specification
- [UN/CEFACT Rec 20](https://unece.org/trade/uncefact/cl-recommendations) — Unit of measure codes
- [EMMO Battery Domain](https://github.com/emmo-repo/domain-battery) — Scientific ontology bridge
- [BatteryPass Data Model](https://github.com/batterypass/BatteryPassDataModel) — Alternative approach comparison
