# Textile Module

This module provides vocabulary and examples for implementing Digital Product Passports for textile products under the EU Sustainable Textiles Strategy, ESPR 2024/1781, and the EU Preparatory Study on Textiles 3rd Milestone.

> **Status**: v0.9.6 - Production Ready

## Regulation Overview

**EU Preparatory Study on Textiles - 3rd Milestone** (December 2025)
- **Scope**: Apparel, footwear, home textiles, technical textiles
- **Robustness**: 0-10 composite score (spirality, dimensional change, visual inspection)
- **Recyclability**: 0-10 score (elastane content, sorting factors, technical recyclability)
- **Recycled Content**: Structured declarations with chain of custody
- **Environmental Footprint**: PEF single score per PEFCR Apparel & Footwear
- **Substances of Concern**: 4-type classification per ESPR Article 7(5)

**Aligned Standards**:
- EU ESPR 2024/1781
- EU Textile Labelling Regulation 1007/2011
- ISO 3758:2023 (Care labelling codes)
- ISO 6330, 16322-3, 3759, 15487 (Robustness testing)
- PEFCR Apparel & Footwear (Environmental footprint)
- REACH, CLP, POPs Regulations (Substances of concern)
- ZDHC Manufacturing Restricted Substances List (MRSL)

## Module Contents

```
textile/
├── VERSION                              # 0.9.6
├── CHANGELOG.md                         # Version history
├── README.md                            # This file
├── ontology/
│   └── textile.ttl                     # Textile vocabulary (~2,000 lines)
├── context/
│   ├── textile-context.jsonld          # JSON-LD context
│   └── textile-context-pefcr-bridge.jsonld  # PEFCR bridge context
├── examples/
│   ├── garment-product.jsonld          # Winter jacket with full DPP
│   └── footwear-product.jsonld         # Trail shoe with mixed materials
├── epcis/
│   ├── commissioning.jsonld            # Garment commissioning
│   ├── transformation-spinning.jsonld  # Fiber -> yarn
│   ├── transformation-weaving.jsonld   # Yarn -> fabric
│   ├── transformation-garment.jsonld   # Fabric -> garment
│   ├── observation-durability.jsonld   # Robustness score
│   ├── observation-chemical.jsonld     # SoC test results
│   └── observation-carbon-footprint.jsonld  # PEF/carbon footprint
├── validation/
│   ├── textile-shapes.ttl             # SHACL shapes
│   └── textile-schema.json            # JSON Schema
├── docs/
│   ├── IMPLEMENTATION_GUIDE.md        # Full implementation guide
│   ├── ROBUSTNESS_SCORING.md          # 0-10 robustness methodology
│   └── RECYCLABILITY_SCORING.md       # 0-10 recyclability methodology
└── json/                               # Generated (run pnpm build)
```

## Vocabulary Namespace

**Prefix**: `eutex:`
**URI**: `https://ref.openepcis.io/extensions/eu/textile/`

Browse the vocabulary at: [ref.openepcis.io/extensions/eu/textile/](https://ref.openepcis.io/extensions/eu/textile/)

## Key Classes

| Class | Description |
|-------|-------------|
| `eutex:TextileProduct` | Base class extending gs1:Product |
| `eutex:FiberComposition` | Detailed fiber composition with traceability |
| `eutex:CareInstruction` | ISO 3758 care symbol support |
| `eutex:DurabilityInfo` | Durability metrics (wash cycles, pilling, etc.) |
| `eutex:RobustnessAssessment` | 0-10 robustness score (spirality + dimensional + visual) |
| `eutex:RecyclabilityAssessment` | 0-10 recyclability score |
| `eutex:RecycledContentDeclaration` | Structured recycled content with chain of custody |
| `eutex:EnvironmentalFootprint` | PEF/PEFCR environmental reporting |
| `eutex:SubstanceOfConcern` | 4-type SoC per ESPR Article 7(5) |
| `eutex:TextileChemical` | Chemical substances (MRSL, REACH) |
| `eutex:TakeBackProgram` | End-of-life take-back program |
| `eutex:MicroplasticInfo` | Microfiber shedding information |

## Key Enumerations

| Enumeration | Values |
|-------------|--------|
| `eutex:TextileCategory` | Apparel, Footwear, HomeTextiles, TechnicalTextiles, Accessories |
| `eutex:FabricType` | Knitted, Denim, WovenNonDenim |
| `eutex:ApparelSubcategory` | TShirts, ShirtsBlouses, Sweaters, JacketsCoats, PantsShorts, DressesSkirts, LeggingsStockingsSocks, Underwear, Swimwear, TextileAccessories |
| `eutex:FiberType` | 20 fiber types including recycled/organic variants |
| `eutex:CareSymbolCode` | 30+ ISO 3758 care symbols |
| `eutex:RecyclingTechnology` | MechanicalRecycling, ChemicalRecyclingCotton, ThermoChemicalRecycling, ChemicalRecyclingPA6, ThermoMechanicalRecycling |
| `eutex:SubstanceOfConcernType` | SoCTypeA (SVHC), SoCTypeB (CLP), SoCTypeC (POPs), SoCTypeD (Recycling) |
| `eutex:CLPHazardCategory` | CMR, EndocrineDisruptor, PMT, Sensitizer, AquaticToxicity |
| `eutex:FootprintDataType` | PrimaryData, SecondaryData, MixedData |
| `eutex:TestStandard` | ISO6330, ISO16322_3, ISO3759, ISO15487, ISO105, ISO12945, ISO12947 |

## GS1 Integration

This vocabulary follows the GS1-first principle:

**Use GS1 properties where available**:
- `gs1:textileMaterial` with `gs1:TextileMaterialDetails` for basic fiber composition
- `gs1:certification` with `gs1:CertificationDetails` for certifications
- `gs1:consumerRecyclingInstructions` for recycling text
- `gs1:referencedFile` for documents

**Textile extensions only where GS1 lacks coverage**:
- Robustness scoring (0-10 per EU methodology)
- Recyclability scoring (0-10 per EU methodology)
- Structured recycled content declarations
- PEF-based environmental footprint
- 4-type substance of concern classification
- Care symbols (ISO 3758 codes)
- Durability metrics (wash cycles, pilling resistance)
- Microplastic shedding data
- Supply chain facility tracking

## Dependencies

**Core module** `>= 1.1.0`:
- `oec:OperatorInformation` - Economic operator data
- `oec:RecycledContent` - Recycled content percentages
- `oec:RepairabilityInfo` - Repair scores and spare parts
- `oec:FacilityInformation` - Manufacturing facility data
- `oec:CircularityInfo` - End-of-life handling
- `oec:DocumentReference` - Supporting documents
- `oec:AccessRights` - Data access control (ESPR Article 9)

## EPCIS 2.0 Extension Declaration

```http
GS1-Extensions: eutex=https://ref.openepcis.io/extensions/eu/textile/, oec=https://ref.openepcis.io/extensions/common/core/
```

**Architecture rule**: `gs1:masterDataAvailableFor` contains only `gs1:` properties. Textile-specific extensions (`eutex:`) go at event level. See [core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md](../core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md).

## JSON-LD Context Usage

```json
{
  "@context": {
    "gs1": "https://ref.gs1.org/voc/",
    "dpp": "https://ref.openepcis.io/extensions/common/core/",
    "textile": "https://ref.openepcis.io/extensions/eu/textile/"
  },
  "type": ["gs1:Product", "eutex:TextileProduct"],
  "gs1:gtin": "09521234300014",
  "textileCategory": "Apparel",
  "fabricType": "WovenNonDenim",
  "apparelSubcategory": "JacketsCoats",
  "robustnessAssessment": {
    "robustnessScore": 8.0
  }
}
```

## Build

Generate JSON from TTL sources using the dev container:

```bash
# From openepcis-web directory
./dev.sh shell

# Inside container
cd /openepcis-dpp
pnpm install
pnpm run build
```

## Validation

**TTL validation** (requires rapper):
```bash
rapper -i turtle textile/ontology/textile.ttl
```

**JSON-LD validation**:
- Use [json-ld.org/playground](https://json-ld.org/playground/)
- Paste example content and verify expansion

## References

- [EU Preparatory Study on Textiles (JRC)](https://susproc.jrc.ec.europa.eu/product-bureau/product-groups/sustainable-textiles)
- [ESPR Regulation 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781)
- [EU Textile Labelling Regulation 1007/2011](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011R1007)
- [ISO 3758:2023 Care labelling](https://www.iso.org/standard/74401.html)
- [PEFCR Apparel & Footwear](https://ec.europa.eu/environment/eussd/smgp/PEFCR_OEFSR_en.htm)
- [GS1 Web Vocabulary](https://ref.gs1.org/voc/)
- [ZDHC MRSL](https://www.roadmaptozero.com/mrsl)
- [Textile Exchange Standards](https://textileexchange.org/standards/)

## License

Apache License 2.0 - See LICENSE file in repository root.
