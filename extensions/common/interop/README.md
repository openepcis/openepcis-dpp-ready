# OpenEPCIS DPP-Ready: The Universal DPP Platform

This module provides interoperability documentation and bridge contexts for harmonizing OpenEPCIS DPP-Ready with other Digital Product Passport standards.

## Open and Early

**We believe in building in the open.** The DPP standardization landscape is rapidly evolving—CEN/CENELEC JTC 24 has six of eight harmonised standards (EN 18216, 18219, 18220, 18221, 18222, 18223) at FprEN stage publishing March 2026, with prEN 18239 and prEN 18246 still in development. CIRPASS2 is defining pilot requirements, and industry needs to start building now. OpenEPCIS shares early to enable pilots and gather feedback.

## Vision

OpenEPCIS DPP-Ready is **THE comprehensive, authoritative Digital Product Passport platform** that harmonizes all major DPP standards:

| Standard | Alignment Level | Integration Method |
|----------|----------------|-------------------|
| **GS1 Web Vocabulary** | Native Foundation | Built on GS1 patterns, `owl:imports` |
| **CEN/CENELEC JTC 24** | Tracking | Structural alignment via CIRPASS2 |
| **UN Transparency Protocol (UNTP)** | Property-aligned | `owl:equivalentProperty`, bridge context |
| **CIRPASS2** | Requirements coverage | Documentation, feeds into JTC 24 |
| **ESPR 2024/1781** | Full compliance | Core module implementation |
| **EN 45552-45555** | Methodology support | Properties to store assessment results |
| **BatteryPass** | Bridge context | Full import capability |

## More Than Just Models - A Complete Open Ecosystem

**OpenEPCIS is not just another DPP specification.** While others provide static models and paperwork, OpenEPCIS delivers a **complete, production-ready ecosystem**:

| What Others Provide | What OpenEPCIS Provides |
|---------------------|------------------------|
| PDF specifications | Executable ontologies (TTL/JSON-LD) |
| Proof-of-concept models | Production-ready v0.9.5 with validation |
| Sector-specific silos | Multi-sector platform (Battery, Textile, EUDR, Electronics) |
| Standalone schemas | Full EPCIS 2.0 supply chain integration |
| Static documentation | Live vocabulary browser at [ref.openepcis.io](https://ref.openepcis.io) |
| Proprietary tooling | 100% open source under Apache 2.0 |

### Zero Vendor Lock-In

Everything is **100% open source**:
- **Ontologies**: Apache 2.0 licensed TTL/OWL files
- **Contexts**: Free-to-use JSON-LD contexts
- **Tools**: Open source converters, validators, generators
- **Examples**: Complete working examples for all modules
- **Documentation**: Full implementation guides

You can host, modify, extend, and deploy without any licensing fees or vendor dependencies.

### Bridge Proprietary Formats

We don't force you to abandon existing investments. OpenEPCIS provides **bridge contexts** that import data from proprietary and alternative formats:

| Source Format | Bridge Context | Result |
|---------------|---------------|--------|
| BatteryPass (SAMM) | `batterypass-bridge-context.jsonld` | Full import to GS1-native |
| UNTP documents | `untp-bridge-context.jsonld` | Property-aligned import |
| CEN/CENELEC JTC 24 | `jtc24-bridge-context.jsonld` | EN 18216-18223 + prEN 18239/18246 alignment |
| Legacy systems | Custom bridge contexts | Gradual migration path |

This means you can:
1. **Import** existing BatteryPass or UNTP documents
2. **Validate** against OpenEPCIS SHACL shapes
3. **Export** to GS1-native EPCIS events
4. **Resolve** via standard GS1 Digital Link infrastructure

## Why OpenEPCIS?

### GS1-Native
Built on GS1 Digital Link, GTIN, and GLN identifiers - the global standard for product identification.

### UNTP-Compatible
Property names are aligned with UN Transparency Protocol patterns. Use the UNTP bridge context for native interoperability.

### JTC 24-Tracking
Aligned with CEN/CENELEC JTC 24 harmonised standards: EN 18216, 18219, 18220, 18221, 18222, 18223 (FprEN, publishing March 2026); prEN 18239, prEN 18246 (in development). Methodology standards EN 45552-45555.

### CIRPASS2-Ready
Meets all EU pilot requirements for Digital Product Passports (CIRPASS2 feeds into JTC 24).

### ESPR-Compliant
Full coverage of EU Ecodesign for Sustainable Products Regulation 2024/1781.

### EPCIS-Integrated
Supply chain traceability via EPCIS 2.0 events with extension support.

### Best-of-Breed Patterns
Superior implementations for:
- **Operator roles** - Full ESPR Article 77 role enumeration
- **Facility information** - GLN support, certifications, types
- **Substances of concern** - Full SCIP database alignment
- **Repairability** - French Repairability Index support
- **Access control** - Three-tier ESPR Article 9 access levels

## Contents

```
interop/
├── VERSION                           # 0.9.5
├── README.md                         # This file
├── CHANGELOG.md                      # Release notes
├── docs/
│   ├── LICENSING.md                  # IP analysis, attribution requirements
│   ├── STANDARDS_ALIGNMENT.md        # GS1 + UNTP + CIRPASS2 + JTC 24 alignment overview
│   ├── UNTP_MAPPING.md               # Complete OpenEPCIS ↔ UNTP property mapping
│   └── CIRPASS2_COVERAGE.md          # CIRPASS2 pilot requirements coverage
└── context/
    ├── untp-bridge-context.jsonld    # JSON-LD context for UNTP-style property names
    ├── cirpass2-bridge-context.jsonld # JSON-LD context for CIRPASS2 property names
    └── jtc24-bridge-context.jsonld   # JSON-LD context for CEN/CENELEC JTC 24 (EN 18216-18223 + prEN 18239/18246)
```

## UNTP Bridge Context

The `untp-bridge-context.jsonld` allows UNTP-style JSON-LD documents to be processed using OpenEPCIS vocabulary:

```json
{
  "@context": [
    "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.io/extensions/common/interop/untp-bridge-context.jsonld"
  ],
  "carbonFootprint": 42.5,
  "recycledContent": 45,
  "recyclableContent": 80
}
```

### Value Convention

OpenEPCIS uses the **0-1 decimal scale** for all ratio and fraction properties, fully aligned with UNTP:
- `recycledContent: 0.45` means 45% recycled content
- `massFraction: 0.15` means 15% of total mass

This enables direct interoperability with UNTP without any value conversion.

## Quick Links

- [UNTP Property Mapping](./docs/UNTP_MAPPING.md)
- [Standards Alignment Overview](./docs/STANDARDS_ALIGNMENT.md)
- [Licensing and Attribution](./docs/LICENSING.md)
- [CIRPASS2 Coverage](./docs/CIRPASS2_COVERAGE.md)

## Validation

### SHACL Shapes

SHACL validation shapes are available in `core/validation/dpp-core-shapes.ttl`:
- Value range constraints (0-1 for fractions)
- Required property validation
- Cardinality constraints
- Enumeration validation
- Format patterns (CAS numbers, EC numbers, country codes)

### JSON Schema

JSON Schema is available in `core/schema/dpp-core-schema.json`:
- JSON Schema 2020-12 compatible
- Type definitions for all DPP classes
- Value format validation
- Required field enforcement

## License

Apache License 2.0 - See [LICENSE](../LICENSE)
