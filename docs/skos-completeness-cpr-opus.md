# SKOS completeness report

Scope: **module=cpr, 23 terms**  ·  generated 2026-06-24

Each row is a mapping the LLM grader judged a real match between one of our terms and an upstream term, classified against the SKOS already in the TTL.

| Status | Count | Meaning |
|---|---|---|
| MISSING | 22 | grader proposes a mapping the TTL does not assert |
| WEAK | 1 | TTL has only `rdfs:seeAlso`; a graded `skos:*Match` is warranted |
| WRONG | 2 | TTL's graded relation disagrees with the grader |
| OK | 12 | TTL already asserts the grader's relation |

QA verifier (second-tier model): **2 of 37** verified findings confirmed (✓ = QA relation matches the proposal). Prefer confirmed rows when adopting mappings.

## MISSING (22)

### cpr

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eucpr:ConstructionProductType` | `skos:broadMatch` | 0.88 | NONE | 0.78 | ✗ | https://dpp-keystone.org/spec/v2/terms#ConstructionProduct | — | Construction Product Type represents a top‑level product family, whereas ConstructionProduct in DPP Keystone denotes an individual construction product. |
| `eucpr:DeclarationOfPerformance` | `skos:narrowMatch` | 0.92 | NONE | 0.85 | ✗ | https://vocabulary.uncefact.org/untp/0.7.0/Performance | — | Declaration of Performance is a specific type of performance declaration defined by CPR Article 12, whereas the UNTP Performance class is a generic, unspecified performance concept. |
| `eucpr:EssentialCharacteristic` | `skos:narrowMatch` | 0.90 | NONE | 0.86 | ✗ | http://data.europa.eu/m8g/Requirement | — | EssentialCharacteristic is a specific declared property value, whereas Requirement is a general condition that must be proven. |
| `eucpr:EssentialCharacteristic` | `skos:narrowMatch` | 0.85 | NONE | 0.85 | ✗ | https://ref.gs1.org/voc/QuantitativeValue | — | The GS1 class covers any quantitative value, while the OUR class specifies a single essential characteristic with name and standard reference. |
| `eucpr:EssentialCharacteristic` | `skos:narrowMatch` | 0.80 | NONE | 0.78 | ✗ | https://vocabulary.uncefact.org/untp/0.7.0/Criterion | — | EssentialCharacteristic is a specific declared property value, whereas Criterion is a general evaluation condition. |
| `eucpr:EssentialCharacteristic` | `skos:narrowMatch` | 0.70 | `skos:broadMatch` | 0.60 | ✗ | http://data.europa.eu/m8g/Criterion | — | EssentialCharacteristic is a specific type of Criterion, representing a declared property value; thus it is narrower than the general evaluation condition. |
| `eucpr:ReactionToFireClass` | `skos:narrowMatch` | 0.95 | NONE | 0.97 | ✗ | https://schema.org/Class | — | The upstream term is a generic class definition, whereas our term specifies a particular fire‑reaction classification. |
| `eucpr:ReactionToFireClass` | `skos:narrowMatch` | 0.60 | NONE | 0.95 | ✗ | http://data.europa.eu/m8g/Criterion | — | Reaction-to-fire Class is a specific classification per EN 13501-1, whereas Criterion is a general condition for evaluation. |
| `eucpr:ReactionToFireClass` | `skos:narrowMatch` | 0.60 | NONE | 0.93 | ✗ | https://vocabulary.uncefact.org/untp/0.7.0/Criterion | — | Reaction-to-fire Class is a specific classification per EN 13501-1, whereas Criterion is a generic condition for evaluation. |
| `eucpr:avcpSystem` | `skos:narrowMatch` | 0.95 | NONE | 0.90 | ✗ | https://schema.org/codingSystem | — | Both properties refer to a coding system, but ours is specifically the AVCP system, a particular instance of a general coding system. |
| `eucpr:characteristicName` | `skos:broadMatch` | 0.80 | NONE | 0.95 | ✗ | https://ref.gs1.org/voc/additiveName | — | The property refers to any characteristic name, whereas the GS1 term specifies only additive or genetic modification names. |
| `eucpr:characteristicValue` | `skos:narrowMatch` | 0.95 | `skos:closeMatch` | 0.70 | ✗ | https://schema.org/value | — | Our property specifies a quantitative value for an essential characteristic, whereas schema.org’s value is a generic property applicable to any QuantitativeValue. |
| `eucpr:characteristicValue` | `skos:closeMatch` | 0.88 | `skos:broadMatch` | 0.78 | ✗ | https://ref.gs1.org/voc/value | — | Both properties represent a numeric measurement qualified by a unit code, but the candidate lacks the specific domain of an essential characteristic. |
| `eucpr:dateOfIssue` | `skos:closeMatch` | 0.85 | `skos:closeMatch` | 0.60 | ✓ | https://schema.org/dateIssued | — | Both properties denote the date an item is issued, though the specific domain (Declaration vs. ticket) differs. |
| `eucpr:dateOfIssue` | `skos:closeMatch` | 0.82 | NONE | 0.82 | ✗ | https://schema.org/datePublished | — | Both properties record the first issuance date of a document, but one is specific to a Declaration of Performance while the other applies broadly to any published creative work or certification. |
| `eucpr:dateOfIssue` | `skos:closeMatch` | 0.78 | NONE | 0.85 | ✗ | https://ref.gs1.org/voc/initialCertificationDate | — | Both properties record the original issuance date of a document, but one refers to a declaration and the other to a certification. |
| `eucpr:declarationOfPerformance` | `skos:narrowMatch` | 0.95 | NONE | 0.95 | ✗ | https://schema.org/typeOfGood | — | Both properties associate a product with a structured value, but ours is specifically for a Declaration of Performance, whereas typeOfGood is a generic link to any structured value. |
| `eucpr:declarationOfPerformance` | `skos:narrowMatch` | 0.92 | `skos:closeMatch` | 0.55 | ✗ | https://vocabulary.uncefact.org/untp/0.7.0/performanceClaim | — | Both properties express a performance statement, but ours specifically links to a structured Declaration of Performance, whereas the candidate is a generic performance claim. |
| `eucpr:reactionToFireClass` | `skos:narrowMatch` | 0.80 | NONE | 0.82 | ✗ | https://ref.gs1.org/voc/additionalProductClassification | — | The upstream property refers to any additional product classification, whereas the OUR term specifies a particular reaction‑to‑fire class. |
| `eucpr:reactionToFireClass` | `skos:narrowMatch` | 0.70 | NONE | 0.82 | ✗ | https://ref.gs1.org/voc/additionalProductClassificationValue | — | The property refers to a specific EN 13501‑1 fire‑reaction classification, whereas the candidate is a generic additional product classification code; our term is more specific. |
| `eucpr:technicalAssessmentBody` | `skos:closeMatch` | 0.75 | NONE | 0.97 | ✗ | https://schema.org/reviewBody | — | Both properties refer to the entity that issues an assessment or review, but the upstream term is specific to reviews rather than technical assessments. |
| `eucpr:thermalConductivity` | `skos:narrowMatch` | 0.90 | NONE | 0.90 | ✗ | https://ref.gs1.org/voc/value | — | Our property specifies thermal conductivity, a particular measurement, whereas the upstream term is a generic measurement value. |

## WEAK (1)

### cpr

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eucpr:declarationCode` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#dopIdentifier | `rdfs:seeAlso` | Both properties represent the unique identifier for a Declaration of Performance. |

## WRONG (2)

### cpr

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eucpr:avcpSystem` | — | 0.60 | NONE | 0.80 | ✓ | https://dpp-keystone.org/spec/v2/terms#avsSystem | `skos:closeMatch` | The upstream property has no definition and its label (avsSystem) does not provide enough evidence to confirm it matches the AVCP system concept. |
| `eucpr:reactionToFireClass` | `skos:exactMatch` | 0.90 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#reactionToFire | `skos:closeMatch` | Both properties refer to the reaction‑to‑fire classification of a construction product, matching in scope and intent. |

## OK (12)

### cpr

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eucpr:ConstructionProduct` | `skos:exactMatch` | 0.95 | `skos:narrowMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#ConstructionProduct | `skos:exactMatch` | Both terms denote the same class of construction products governed by the DPP and Declaration‑of‑Performance framework. |
| `eucpr:DeclarationOfPerformance` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#DeclarationOfPerformance | `skos:exactMatch` | Both terms denote the same concept of a structured declaration of performance for construction products. |
| `eucpr:compressiveStrength` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#compressiveStrength | `skos:exactMatch` | Both properties denote the declared compressive strength of a construction product, using the same quantitative value representation. |
| `eucpr:dateOfIssue` | `skos:exactMatch` | 0.95 | `skos:narrowMatch` | 0.50 | ✗ | https://dpp-keystone.org/spec/v2/terms#dateOfIssue | `skos:exactMatch` | Both properties share the same name and refer to the issuance date of a declaration, indicating identical scope. |
| `eucpr:declarationCode` | `skos:exactMatch` | 0.97 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#declarationCode | `skos:exactMatch` | Both properties represent the unique reference number identifying a Declaration of Performance. |
| `eucpr:declarationOfPerformance` | `skos:exactMatch` | 0.98 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#hasDoP | `skos:exactMatch` | Both properties link a construction product to its Declaration of Performance, matching in purpose and semantics. |
| `eucpr:europeanAssessmentDocument` | `skos:exactMatch` | 0.99 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#europeanAssessmentDocument | `skos:exactMatch` | Both properties refer to the same European Assessment Document linked to a Declaration of Performance. |
| `eucpr:harmonisedStandard` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#harmonisedStandardReference | `skos:exactMatch` | Both properties refer to the URI of the harmonised technical specification under which an essential characteristic is declared. |
| `eucpr:notifiedBody` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.50 | ✗ | https://dpp-keystone.org/spec/v2/terms#notifiedBody | `skos:exactMatch` | Both properties represent the notified body involved in a declaration, sharing identical domain and range semantics. |
| `eucpr:technicalAssessmentBody` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.70 | ✗ | https://dpp-keystone.org/spec/v2/terms#technicalAssessmentBody | `skos:exactMatch` | Both properties represent the entity that issued a European Technical Assessment, with identical scope and intended use. |
| `eucpr:thermalConductivity` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#thermalConductivity | `skos:exactMatch` | Both properties denote the declared thermal conductivity of a product, with identical units and domain context. |
| `eucpr:validationReports` | `skos:exactMatch` | 0.92 | `skos:closeMatch` | 0.55 | ✗ | https://dpp-keystone.org/spec/v2/terms#validationReports | `skos:exactMatch` | Both properties refer to the same concept of linking test or validation reports that support a declaration. |

