# Licensing and Attribution

OpenEPCIS DPP-Ready is released under the **Apache License 2.0**.

## Third-Party Acknowledgments

This vocabulary aligns with and references the following standards:

### GS1 Web Vocabulary

- **Source**: https://ref.gs1.org/voc/
- **License**: GS1 IP Policy (free to use with attribution)
- **Usage**: Native foundation vocabulary
- **Integration**: `owl:imports <https://ref.gs1.org/voc/>`

GS1 Web Vocabulary provides the foundational patterns for product identification, organization data, and regulatory information. OpenEPCIS extends GS1 vocabulary only where no equivalent term exists.

### UN Transparency Protocol (UNTP)

- **Source**: https://untp.unece.org/docs/specification/
- **License**: GPL-3.0
- **Usage**: Semantic alignment via `owl:equivalentProperty` and `rdfs:seeAlso`
- **Note**: Property names aligned with UNTP patterns for interoperability

OpenEPCIS declares semantic equivalence to UNTP terms without copying content. This approach is compatible with GPL-3.0 licensing as semantic mappings state relationships rather than incorporating copyrighted material.

### CIRPASS2 Project

- **Source**: https://cirpass2.eu/
- **License**: CC BY 4.0
- **Usage**: Requirements alignment and coverage documentation
- **Attribution**: CIRPASS2 requirements referenced in coverage documentation

### EU Regulations

The following EU regulations are public domain regulatory text:

- **ESPR 2024/1781** - Ecodesign for Sustainable Products Regulation
- **Battery Regulation 2023/1542** - EU Battery Regulation
- **EUDR 2023/1115** - EU Deforestation Regulation
- **CLP Regulation 1272/2008** - Classification, Labelling and Packaging

## License Compatibility Analysis

| Source | License | Can Use? | Approach |
|--------|---------|----------|----------|
| GS1 Web Vocabulary | GS1 IP Policy | Yes | Native foundation, attribute GS1 |
| UNTP | GPL-3.0 | Yes* | Reference via `rdfs:seeAlso`, don't copy verbatim |
| CIRPASS2 | CC BY 4.0 | Yes | Attribute in `dcterms:source` |
| EU Regulations | Public Domain | Yes | Reference as authoritative source |

*Note: Semantic mappings are safe. Using `owl:equivalentClass` and `rdfs:seeAlso` states relationships without copying content.

## Safe IP Approach

1. **Semantic mappings are safe**: Using `owl:equivalentClass` and `rdfs:seeAlso` declares semantic relationships without copying content.

2. **Naming patterns are safe**: Adopting similar naming patterns (e.g., using "carbonFootprint" vs "carbonFootprintTotal") is permissible - ideas and naming conventions are not copyrightable.

3. **Attribution is provided**: All sources are documented via:
   - `dcterms:source` - Regulatory or standard references
   - `rdfs:seeAlso` - Related terms in other vocabularies
   - `owl:equivalentProperty` - Semantic equivalents

## Attribution in Ontology Files

Each OpenEPCIS ontology file includes appropriate attribution:

```turtle
<https://ref.openepcis.io/extensions/common/core/>
    dcterms:source <https://untp.unece.org/docs/specification/> ;
    rdfs:comment "Aligned with UN Transparency Protocol patterns"@en ;
    rdfs:seeAlso <https://ref.gs1.org/voc/> ;
    rdfs:seeAlso <https://eur-lex.europa.eu/eli/reg/2024/1781> .
```

## Using OpenEPCIS in Your Projects

OpenEPCIS DPP-Ready is licensed under Apache 2.0, which allows:

- Commercial use
- Modification
- Distribution
- Patent use
- Private use

Requirements:
- Include license and copyright notice
- State changes if you modify the code
- No trademark use without permission

For more details, see the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
