# SKOS completeness report

Scope: **module=iron-steel, 31 terms**  ·  generated 2026-06-24

Each row is a mapping the LLM grader judged a real match between one of our terms and an upstream term, classified against the SKOS already in the TTL.

| Status | Count | Meaning |
|---|---|---|
| MISSING | 22 | grader proposes a mapping the TTL does not assert |
| WEAK | 6 | TTL has only `rdfs:seeAlso`; a graded `skos:*Match` is warranted |
| WRONG | 2 | TTL's graded relation disagrees with the grader |
| OK | 27 | TTL already asserts the grader's relation |

QA verifier (second-tier model): **10 of 57** verified findings confirmed (✓ = QA relation matches the proposal). Prefer confirmed rows when adopting mappings.

## MISSING (22)

### iron-steel

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eusteel:MaterialTestCertificate` | `skos:narrowMatch` | 0.90 | `skos:narrowMatch` | 0.82 | ✓ | https://ref.gs1.org/voc/CertificationDetails | — | The OUR class is a specific certification for metallic products per EN 10204, while the upstream class represents any generic certification. |
| `eusteel:TechnologyRoute` | `skos:narrowMatch` | 0.60 | NONE | 0.97 | ✗ | https://schema.org/EnergyConsumptionDetails | — | The Steel Production Technology Route is a specific type of technology that influences energy consumption, whereas EnergyConsumptionDetails is a general class covering all products’ energy efficiency information. |
| `eusteel:castNumber` | `skos:narrowMatch` | 0.90 | `skos:narrowMatch` | 0.78 | ✓ | https://dpp-keystone.org/spec/v2/terms#heatNumber | — | The OUR property identifies a casting run within a heat, whereas the upstream property refers to the heat itself, making it more general. |
| `eusteel:castNumber` | `skos:narrowMatch` | 0.70 | `skos:narrowMatch` | 0.72 | ✓ | https://ref.gs1.org/voc/hasBatchLotNumber | — | The cast number is a specific type of batch/lot identifier used for traceability of a casting run, whereas the GS1 property is a generic batch/lot identifier. |
| `eusteel:heatNumber` | `skos:narrowMatch` | 0.95 | `skos:narrowMatch` | 0.72 | ✓ | https://ref.gs1.org/voc/hasBatchLotNumber | — | Heat Number is a specific type of batch/lot identifier for molten steel, making it narrower than the generic Batch/Lot Identifier. |
| `eusteel:lotNumber` | `skos:narrowMatch` | 0.92 | `skos:narrowMatch` | 0.85 | ✓ | https://ref.gs1.org/voc/hasBatchLotNumber | — | The GS1 property is a generic batch/lot identifier for any trade item, while the OUR term specifies a delivery lot number for steel products. |
| `eusteel:lotNumber` | `skos:narrowMatch` | 0.70 | NONE | 0.83 | ✗ | https://dpp-keystone.org/spec/v2/terms#productNumber | — | The upstream productNumber is a general identifier for any product, whereas the OUR lotNumber specifically denotes the delivery lot number of a steel product. |
| `eusteel:meltAndPourCountry` | `skos:narrowMatch` | 0.92 | NONE | 0.82 | ✗ | https://schema.org/addressCountry | — | Both refer to a country code, but the OUR term is specifically for the melt‑and‑pour location of steel, whereas schema.org’s addressCountry is a general country property. |
| `eusteel:mtcInspectionType` | `skos:narrowMatch` | 0.90 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtc | — | The upstream mtc property represents a general Material Test Certificate concept, while the OUR property specifies a particular inspection document type. |
| `eusteel:mtcInspectionType` | `skos:narrowMatch` | 0.70 | `skos:closeMatch` | 0.60 | ✗ | https://ref.gs1.org/voc/certificationType | — | The MTC Inspection Document Type is a specific kind of certification document, whereas Certification Type is a general property for any certification. |
| `eusteel:mtcNitrogenContent` | `skos:narrowMatch` | 0.65 | NONE | 0.98 | ✗ | https://ref.gs1.org/voc/textileMaterialContent | — | The candidate property describes a generic material composition percentage, whereas our term specifies the nitrogen content of a steel MTC. |
| `eusteel:mtcNominalSize` | `skos:narrowMatch` | 0.92 | NONE | 0.80 | ✗ | https://ref.gs1.org/voc/sizeDimension | — | The GS1 sizeDimension is a general numerical size measurement, whereas the OUR property specifies the nominal dimension of a tested product. |
| `eusteel:mtcNominalSize` | `skos:narrowMatch` | 0.88 | `skos:narrowMatch` | 0.78 | ✓ | https://schema.org/size | — | Schema.org size is a general property for any product dimension, while the OUR term specifies a numeric nominal size of a tested material. |
| `eusteel:mtcSteelProcess` | `skos:closeMatch` | 0.80 | NONE | 0.70 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtc | — | Both refer to the steelmaking process recorded on a material test certificate, but the upstream term lacks a definition and may be broader. |
| `eusteel:mtcTensileStrength` | `skos:narrowMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtc | — | The upstream term represents the overall Material Test Certificate, whereas our property specifies a particular tensile strength measurement. |
| `eusteel:mtcWeightTolerance` | `skos:closeMatch` | 0.80 | NONE | 0.82 | ✗ | https://ref.gs1.org/voc/productYieldVariationPercentage | — | Both express a percentage of permissible weight variation, but the GS1 term focuses on yield loss while ours refers to tested product tolerance. |
| `eusteel:mtcYieldStrength` | `skos:narrowMatch` | 0.70 | NONE | 0.90 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtc | — | The upstream property represents a generic MTC concept, whereas our term specifies the measured yield strength attribute of an MTC. |
| `eusteel:mtcYieldStrengthRatio` | `skos:narrowMatch` | 0.90 | NONE | 0.93 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcYieldStrength | — | The upstream property represents yield strength itself, while the OUR property specifies a derived ratio of yield to tensile strength. |
| `eusteel:productNumber` | `skos:exactMatch` | 0.99 | `skos:closeMatch` | 0.78 | ✗ | https://schema.org/mpn | — | Both terms denote the manufacturer’s part or product number used to identify a specific steel product. |
| `eusteel:productNumber` | `skos:narrowMatch` | 0.92 | `skos:narrowMatch` | 0.60 | ✓ | https://schema.org/serialNumber | — | The schema.org property represents a general serial or alphanumeric identifier for any product, whereas the OUR term specifically denotes the manufacturer’s product/article number for a steel product. |
| `eusteel:steelDesignation` | `skos:narrowMatch` | 0.72 | `skos:closeMatch` | 0.50 | ✗ | https://dpp-keystone.org/spec/v2/terms#steelGradeClassification | — | The candidate term refers to a general classification of steel grades, whereas the OUR term specifies a particular designation per EN 10027. |
| `eusteel:steelGradeClassification` | `skos:narrowMatch` | 0.70 | `skos:closeMatch` | 0.70 | ✗ | https://dpp-keystone.org/spec/v2/terms#steelDesignation | — | The upstream term refers to a general steel designation, while the OUR property specifies a particular classification scheme (EN 10020). |

## WEAK (6)

### iron-steel

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eusteel:IronSteelProduct` | `skos:exactMatch` | 0.95 | NONE | 0.60 | ✗ | https://ref.openepcis.io/extensions/common/core/IronSteel | `rdfs:seeAlso` | Both classes represent the same concept of an iron or steel product used in EPCIS contexts. |
| `eusteel:heatNumber` | `skos:narrowMatch` | 0.80 | `skos:closeMatch` | 0.60 | ✗ | https://ref.gs1.org/voc/batchLot | `rdfs:seeAlso` | The GS1 batchLot property denotes a general batch or lot identifier, while the OUR heatNumber specifically identifies the melt (heat) number of steel. |
| `eusteel:lotNumber` | `skos:narrowMatch` | 0.90 | `skos:closeMatch` | 0.75 | ✗ | https://ref.gs1.org/voc/batchLot | `rdfs:seeAlso` | The GS1 batchLot property is a general batch/lot identifier, whereas the OUR lotNumber specifically denotes the delivery lot number of a steel product. |
| `eusteel:meltAndPourCountry` | `skos:narrowMatch` | 0.80 | `skos:narrowMatch` | 0.72 | ✓ | https://schema.org/countryOfOrigin | `rdfs:seeAlso` | The term specifies the country where steel was melted and poured, which is a more specific instance of product origin covered by schema.org’s countryOfOrigin. |
| `eusteel:productNumber` | `skos:narrowMatch` | 0.95 | `skos:closeMatch` | 0.55 | ✗ | https://ref.gs1.org/voc/globalModelNumber | `rdfs:seeAlso` | The GS1 property denotes a general global model number for any product, whereas the OUR term specifies a manufacturer’s product/article number specifically for steel products. |
| `eusteel:purchaserOrder` | `skos:closeMatch` | 0.85 | `skos:broadMatch` | 0.60 | ✗ | https://schema.org/orderNumber | `rdfs:seeAlso` | Both represent an identifier for a transaction, but the OUR term is specifically a purchaser order reference for steel delivery. |

## WRONG (2)

### iron-steel

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eusteel:MaterialTestCertificate` | `skos:narrowMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://schema.org/Certification | `skos:broadMatch` | Material Test Certificate is a specific type of certification for metallic products, whereas Certification in schema.org is a general concept covering all kinds of certifications. |
| `eusteel:technologyRoute` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#technologyRoute | `skos:closeMatch` | Both properties share the same name and refer to the primary steelmaking route used for a product, indicating identical concept. |

## OK (27)

### iron-steel

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eusteel:IronSteelProduct` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#IronSteelProduct | `skos:exactMatch` | Both terms denote the same concept of an iron or steel product, and share identical labels. |
| `eusteel:MaterialTestCertificate` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#MaterialTestCertificate | `skos:exactMatch` | Both terms denote the same inspection document for metallic products, matching in class type and intended use. |
| `eusteel:castNumber` | `skos:exactMatch` | 0.98 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#castNumber | `skos:exactMatch` | Both properties identify the same casting run number within a heat, matching in definition and domain. |
| `eusteel:cbamReportId` | `skos:exactMatch` | 0.95 | `skos:exactMatch` | 0.90 | ✓ | https://dpp-keystone.org/spec/v2/terms#cbamReportId | `skos:exactMatch` | Both terms are the same property name and refer to an identifier for a CBAM report linked to a steel product. |
| `eusteel:heatNumber` | `skos:exactMatch` | 0.99 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#heatNumber | `skos:exactMatch` | Both properties identify the melt or batch number of steel from which a product was cast, matching the same concept. |
| `eusteel:lotNumber` | `skos:exactMatch` | 0.98 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#lotNumber | `skos:exactMatch` | Both terms are named lotNumber and refer to a delivery or production batch identifier for the steel product. |
| `eusteel:meltAndPourCountry` | `skos:exactMatch` | 0.98 | `skos:closeMatch` | 0.70 | ✗ | https://dpp-keystone.org/spec/v2/terms#meltAndPourCountry | `skos:exactMatch` | Both terms denote the ISO‑3166 country where steel is melted and poured, with identical domain (IronSteelProduct) and range. |
| `eusteel:mtc` | `skos:exactMatch` | 0.99 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtc | `skos:exactMatch` | Both properties represent the same concept of linking a steel product to its Material Test Certificate. |
| `eusteel:mtcCarbonContent` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcCarbonContent | `skos:exactMatch` | Both properties represent the carbon content measured in a material test certificate, with identical scope and range. |
| `eusteel:mtcCarbonEquivalent` | `skos:exactMatch` | 0.95 | `skos:exactMatch` | 0.82 | ✓ | https://dpp-keystone.org/spec/v2/terms#mtcCarbonEquivalent | `skos:exactMatch` | Both terms share the same label, domain (MaterialTestCertificate), and refer to the carbon equivalent value used as a weldability indicator. |
| `eusteel:mtcCopperContent` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcCopperContent | `skos:exactMatch` | Both terms represent the same measurement of copper content in a material test certificate. |
| `eusteel:mtcElongation` | `skos:exactMatch` | 0.98 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcElongation | `skos:exactMatch` | Both properties are named mtcElongation and refer to the same mechanical test result (percentage elongation after fracture) for a material test certificate. |
| `eusteel:mtcFinishing` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcFinishing | `skos:exactMatch` | Both properties share the same name, domain (MaterialTestCertificate), and describe the finishing/delivery condition recorded on a certificate. |
| `eusteel:mtcNitrogenContent` | `skos:exactMatch` | 0.97 | `skos:closeMatch` | 0.70 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcNitrogenContent | `skos:exactMatch` | Both properties share the same name and refer to nitrogen content measured in a material test certificate. |
| `eusteel:mtcNominalSize` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcNominalSize | `skos:exactMatch` | Both properties share the same name and refer to the nominal dimension of a tested product, indicating identical meaning. |
| `eusteel:mtcPhosphorusContent` | `skos:exactMatch` | 0.98 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcPhosphorusContent | `skos:exactMatch` | Both properties represent the phosphorus content measured in a material test certificate, matching in type and intended value. |
| `eusteel:mtcRadiometricControl` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcRadiometricControl | `skos:exactMatch` | Both properties share the same name and refer to the radiometric control result for steel, indicating identical concept. |
| `eusteel:mtcRelativeRibArea` | `skos:exactMatch` | 0.99 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcRelativeRibArea | `skos:exactMatch` | Both terms denote the same metric – the relative rib area (fR) for ribbed reinforcing steel used in material test certificates. |
| `eusteel:mtcSteelProcess` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcSteelProcess | `skos:exactMatch` | Both terms share the same name, domain (MaterialTestCertificate), and represent the steelmaking process recorded on a certificate. |
| `eusteel:mtcSulfurContent` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcSulfurContent | `skos:exactMatch` | Both terms refer to the sulfur content measured in a material test certificate, with identical domain and range. |
| `eusteel:mtcWeightTolerance` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcWeightTolerance | `skos:exactMatch` | Both terms refer to the same concept of permitted weight tolerance for a tested product, and they share identical labels and domain. |
| `eusteel:mtcYieldStrength` | `skos:exactMatch` | 0.98 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcYieldStrength | `skos:exactMatch` | Both properties share the same name and refer to the measured yield strength of a material test certificate. |
| `eusteel:mtcYieldStrengthRatio` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#mtcYieldStrengthRatio | `skos:exactMatch` | Both terms denote the same property measuring the ratio of yield strength to tensile strength. |
| `eusteel:productNumber` | `skos:exactMatch` | 0.97 | `skos:closeMatch` | 0.55 | ✗ | https://dpp-keystone.org/spec/v2/terms#productNumber | `skos:exactMatch` | Both terms denote the manufacturer’s product or article number for a steel product. |
| `eusteel:purchaserOrder` | `skos:exactMatch` | 0.99 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#purchaserOrder | `skos:exactMatch` | Both terms denote the purchaser order reference linked to a steel delivery, sharing identical domain and range. |
| `eusteel:steelDesignation` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#steelDesignation | `skos:exactMatch` | Both properties represent the same concept of a steel name/number designation. |
| `eusteel:steelGradeClassification` | `skos:exactMatch` | 0.90 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#steelGradeClassification | `skos:exactMatch` | Both terms use the same label and refer to the classification of steel grades according to EN 10020 for iron/steel products, indicating identical scope. |

