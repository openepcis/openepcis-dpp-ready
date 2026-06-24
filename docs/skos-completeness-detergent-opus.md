# SKOS completeness report

Scope: **module=detergent, 42 terms**  ·  generated 2026-06-24

Each row is a mapping the LLM grader judged a real match between one of our terms and an upstream term, classified against the SKOS already in the TTL.

| Status | Count | Meaning |
|---|---|---|
| MISSING | 33 | grader proposes a mapping the TTL does not assert |
| WEAK | 2 | TTL has only `rdfs:seeAlso`; a graded `skos:*Match` is warranted |
| WRONG | 0 | TTL's graded relation disagrees with the grader |
| OK | 6 | TTL already asserts the grader's relation |

QA verifier (second-tier model): **6 of 41** verified findings confirmed (✓ = QA relation matches the proposal). Prefer confirmed rows when adopting mappings.

## MISSING (33)

### detergent

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eudet:BiodegradabilityTestMethod` | `skos:narrowMatch` | 0.80 | NONE | 0.90 | ✗ | http://data.europa.eu/m8g/Criterion | — | Biodegradability Test Method is a specific type of evaluation condition, whereas Criterion is a general concept for any assessment. |
| `eudet:BiodegradabilityTestMethod` | `skos:narrowMatch` | 0.80 | NONE | 0.95 | ✗ | https://schema.org/Certification | — | The upstream class represents a general certification concept, while our class specifies a particular biodegradability test method. |
| `eudet:DetergentProduct` | `skos:broadMatch` | 0.97 | NONE | 0.90 | ✗ | https://schema.org/IndividualProduct | — | DetergentProduct is a class of detergent products, whereas IndividualProduct denotes a single identifiable product instance. |
| `eudet:DetergentProduct` | `skos:narrowMatch` | 0.95 | NONE | 0.72 | ✗ | https://schema.org/ProductModel | — | Detergent Product is a specific type of product, whereas ProductModel is a generic datasheet/specification for any product. |
| `eudet:DetergentProduct` | `skos:narrowMatch` | 0.95 | `skos:narrowMatch` | 0.90 | ✓ | https://ref.gs1.org/voc/Product | — | Detergent Product is a specific type of product, making it a narrower subclass of the general GS1 Product. |
| `eudet:FragranceAllergen` | `skos:narrowMatch` | 0.97 | NONE | 0.60 | ✗ | https://ref.gs1.org/voc/AllergenDetails | — | Fragrance Allergen is a specific type of allergen detail, making it narrower than the general Allergen Details class. |
| `eudet:FragranceAllergen` | `skos:narrowMatch` | 0.95 | `skos:narrowMatch` | 0.60 | ✓ | https://schema.org/ChemicalSubstance | — | Fragrance Allergen is a specific type of chemical substance that must be disclosed, whereas ChemicalSubstance is the general class of all chemical substances. |
| `eudet:Ingredient` | `skos:narrowMatch` | 0.97 | NONE | 0.72 | ✗ | https://schema.org/Substance | — | Ingredient is a specific type of chemical substance used in detergent formulations, making it narrower than the general concept of Substance. |
| `eudet:Ingredient` | `skos:narrowMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://schema.org/ChemicalSubstance | — | An Ingredient is a specific type of chemical substance used in a detergent formulation, making it a narrower concept than the general ChemicalSubstance. |
| `eudet:Ingredient` | `skos:narrowMatch` | 0.80 | NONE | 0.90 | ✗ | https://ref.gs1.org/voc/FoodBeverageTobaccoIngredientDetails | — | Our Ingredient class specifies a detergent ingredient with INCI name, functional role and weight‑percentage range, whereas the GS1 class is a broader ingredient detail type for food, beverage and tobacco products. |
| `eudet:MicroorganismInfo` | `skos:narrowMatch` | 0.92 | NONE | 0.85 | ✗ | https://ref.gs1.org/voc/CompulsoryAdditionalInformation | — | Microorganism Information is a specific type of compulsory product information, while Compulsory Additional Information is the broader category encompassing all such data. |
| `eudet:ProductForm` | `skos:narrowMatch` | 0.95 | NONE | 0.95 | ✗ | https://schema.org/Product | — | Product Form is a specific physical form of a detergent, whereas schema.org Product represents any offered product or service; the former is narrower than the latter. |
| `eudet:ProductForm` | `skos:narrowMatch` | 0.93 | NONE | 0.90 | ✗ | https://schema.org/ProductGroup | — | ProductForm is a specific physical form of a detergent, whereas ProductGroup represents a broader grouping of products that vary by attributes. |
| `eudet:ProductForm` | `skos:narrowMatch` | 0.92 | NONE | 0.95 | ✗ | https://ref.gs1.org/voc/Product | — | ProductForm is a specific physical form of a detergent, which is a narrower concept than the general GS1 Product. |
| `eudet:dosageInstructions` | `skos:narrowMatch` | 0.90 | `skos:narrowMatch` | 0.78 | ✓ | https://ref.gs1.org/voc/consumerUsageInstructions | — | Dosage Instructions is a specific type of consumer usage instructions, adding water‑hardness guidance. |
| `eudet:filmBiodegradabilityPercentage` | `skos:closeMatch` | 0.85 | `skos:narrowMatch` | 0.72 | ✗ | https://ref.openepcis.io/extensions/common/core/biodegradationPercentage | — | Both properties represent a percentage of biodegradability, but the upstream term is generic while ours applies specifically to detergent film. |
| `eudet:fragranceAllergens` | `skos:narrowMatch` | 0.92 | `skos:closeMatch` | 0.60 | ✗ | https://ref.gs1.org/voc/hasAllergen | — | Our property specifies fragrance allergens above a threshold, whereas the GS1 hasAllergen relation is a general allergen link; thus our term is a narrower specialization. |
| `eudet:ingredientList` | `skos:narrowMatch` | 0.93 | NONE | 0.85 | ✗ | https://schema.org/recipeIngredient | — | The candidate property covers any recipe ingredient or list, while our term specifically lists detergent ingredients; thus ours is a narrower specialization. |
| `eudet:ingredientList` | `skos:broadMatch` | 0.92 | `skos:narrowMatch` | 0.78 | ✗ | https://ref.gs1.org/voc/ingredientName | — | Our property represents a list of ingredients in a formulation, whereas the candidate refers to a single ingredient name; thus our term is broader. |
| `eudet:ingredientList` | `skos:narrowMatch` | 0.88 | `skos:closeMatch` | 0.60 | ✗ | https://ref.gs1.org/voc/ingredientsInfo | — | Our property specifies a list of ingredients in the formulation, whereas the candidate refers to general facts about ingredients; thus our term is a narrower specialization. |
| `eudet:ingredientList` | `skos:narrowMatch` | 0.80 | `skos:narrowMatch` | 0.85 | ✓ | https://ref.gs1.org/voc/ingredientStatement | — | eudet:ingredientList specifies a structured list of Ingredient entities, whereas GS1’s ingredientStatement is a single string; thus our property is a narrower, more detailed version. |
| `eudet:ingredientList` | `skos:broadMatch` | 0.75 | `skos:closeMatch` | 0.55 | ✗ | https://schema.org/ingredients | — | eudet:ingredientList refers to a collection of Ingredient entities, whereas schema.org/ingredients denotes a single ingredient used in a recipe. |
| `eudet:intendedUse` | `skos:closeMatch` | 0.85 | NONE | 0.72 | ✗ | https://schema.org/potentialUse | — | Both properties describe the intended use of a product, but the candidate is defined for BioChemEntity rather than detergent products. |
| `eudet:intendedUse` | `skos:closeMatch` | 0.85 | NONE | 0.78 | ✗ | https://ref.gs1.org/voc/consumerUsageInstructions | — | Both describe how a product is to be used, but Intended Use refers to the general purpose while Consumer Usage Instructions provide specific usage instructions. |
| `eudet:phosphorusContentPercent` | `skos:narrowMatch` | 0.92 | `skos:closeMatch` | 0.60 | ✗ | https://ref.gs1.org/voc/ingredientContentPercentage | — | The candidate property describes any ingredient’s percentage in the product, while our term specifies phosphorus as a particular ingredient. |
| `eudet:productForm` | `skos:exactMatch` | 0.98 | `skos:closeMatch` | 0.70 | ✗ | https://ref.gs1.org/voc/productFormDescription | — | Both properties describe the physical form or shape of a detergent product, matching in scope and intent. |
| `eudet:productForm` | `skos:closeMatch` | 0.80 | NONE | 0.85 | ✗ | https://schema.org/dosageForm | — | Both properties describe the physical form of a product, though one is for detergents and the other for drugs. |
| `eudet:recommendedDosage` | `skos:narrowMatch` | 0.93 | `skos:closeMatch` | 0.70 | ✗ | https://ref.gs1.org/voc/value | — | Our property requires a gs1:QuantitativeValue (value plus unit), whereas the candidate only provides a numeric value, making our term more specific. |
| `eudet:recommendedDosage` | `skos:closeMatch` | 0.85 | NONE | 0.90 | ✗ | https://schema.org/recommendedIntake | — | Both properties express a recommended quantitative amount, though the domain (detergent use vs supplement intake) differs. |
| `eudet:recommendedDosage` | `skos:closeMatch` | 0.80 | `skos:closeMatch` | 0.60 | ✓ | https://schema.org/doseValue | — | Both properties represent a numeric dose or dosage value, but our term specifies recommended usage per use while the candidate is a generic dose value. |
| `eudet:safetyDataSheet` | `skos:closeMatch` | 0.70 | `skos:narrowMatch` | 0.78 | ✗ | https://ref.gs1.org/voc/safetyInfo | — | Both refer to a link or reference to safety-related documentation, but our term specifically denotes an SDS document whereas the GS1 term is a generic link to any safety information. |
| `eudet:testDurationDays` | `skos:closeMatch` | 0.85 | NONE | 0.90 | ✗ | https://schema.org/activityDuration | — | Both properties describe the length of an activity, but our property is specific to biodegradability tests and uses integer days, whereas schema.org’s activityDuration is a general activity duration. |
| `eudet:testMethod` | `skos:closeMatch` | 0.80 | `skos:narrowMatch` | 0.60 | ✗ | https://schema.org/measurementMethod | — | Both properties denote the specific method used to perform a measurement, though schema.org’s measurementMethod is generic while our Test Method is specific to biodegradability testing. |

## WEAK (2)

### detergent

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eudet:BiodegradabilityTestMethod` | `skos:exactMatch` | 0.95 | `skos:narrowMatch` | 0.70 | ✗ | https://ref.openepcis.io/extensions/common/core/BiodegradabilityTestMethod | `rdfs:seeAlso` | Both classes represent the same concept of a standard test method for biodegradability. |
| `eudet:hazardousSubstances` | `skos:exactMatch` | 0.95 | `skos:narrowMatch` | 0.72 | ✗ | https://ref.openepcis.io/extensions/common/core/hazardousSubstances | `rdfs:seeAlso` | Both properties represent the set of hazardous substances present in a product, with identical domain and range semantics. |

## OK (6)

### detergent

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `eudet:SignalWord` | `skos:exactMatch` | 0.93 | `skos:closeMatch` | 0.60 | ✗ | https://ref.openepcis.io/extensions/common/core/HazardSignalWord | `skos:exactMatch` | Both classes represent the CLP signal words used to indicate hazard severity in chemical products. |
| `eudet:biodegradationPercentage` | `skos:exactMatch` | 0.95 | `skos:narrowMatch` | 0.60 | ✗ | https://ref.openepcis.io/extensions/common/core/biodegradationPercentage | `skos:exactMatch` | Both properties represent the measured ultimate aerobic biodegradation expressed as a percentage. |
| `eudet:hStatements` | `skos:exactMatch` | 0.95 | `skos:closeMatch` | 0.60 | ✗ | https://ref.openepcis.io/extensions/common/core/hazardStatement | `skos:exactMatch` | Both properties represent CLP hazard statements (e.g., H302, H315) for a detergent product. |
| `eudet:hazardPictograms` | `skos:exactMatch` | 0.95 | NONE | 0.60 | ✗ | https://ref.openepcis.io/extensions/common/core/hazardPictogramCode | `skos:exactMatch` | Both properties represent GHS hazard pictogram codes (e.g., GHS01–GHS09) for a product, matching in definition and intended use. |
| `eudet:pStatements` | `skos:exactMatch` | 0.96 | `skos:narrowMatch` | 0.70 | ✗ | https://ref.openepcis.io/extensions/common/core/precautionaryStatement | `skos:exactMatch` | Both properties represent CLP precautionary statements for a detergent product, with identical domain and range semantics. |
| `eudet:signalWord` | `skos:exactMatch` | 0.90 | `skos:exactMatch` | 0.82 | ✓ | https://ref.openepcis.io/extensions/common/core/hazardSignalWord | `skos:exactMatch` | Both properties represent the CLP hazard signal word (Danger or Warning) used for chemical products. |

