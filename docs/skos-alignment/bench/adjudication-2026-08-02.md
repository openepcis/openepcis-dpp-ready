# Blinde Nachbewertung — 30 Grenzfälle

Zweck: entscheiden, ob die ~55%-Decke der Modelle **die Aufgabe** ist oder **Rauschen im
Goldstandard**. Die Fälle stammen aus CLOSE, BROAD und NONE — den drei Klassen, in denen der
gesamte Fehler sitzt. Gold-Etikett und Modellurteil sind bewusst nicht abgebildet.

## Die Richtungskonvention (die Falle des Tages)

- **EXACT** — dasselbe Konzept
- **CLOSE** — fast dasselbe, gefahrlos verwandt zu behandeln
- **BROAD** — **unser** Term ist der breitere, ihrer der Spezialfall
- **NARROW** — **unser** Term ist der engere, ihrer der Oberbegriff
- **NONE** — keine Beziehung, die man verzeichnen sollte

## Antworten

Ein Wort pro Zeile, Nummer beibehalten:

```
 1. NONE
 2. NONE
 3. CLOSE
 4. NONE
 5. BROAD
 6. BROAD
 7. BROAD
 8. CLOSE
 9. NONE
10. EXACT
11. EXACT
12. CLOSE
13. BROAD
14. NONE
15. NARROW
16. CLOSE
17. NARROW
18. NARROW
19. NARROW
20. NARROW
21. NONE
22. NONE
23. NONE
24. NARROW
25. CLOSE
26. CLOSE
27. NARROW
28. EXACT
29. CLOSE
30. NARROW
```

---

### 1. Deposit-Return Scheme  ↔  Has Returnable Package Deposit Details

- **unser** `oec:depositReturnScheme` — Links a product (typically gs1:PackagingDetails) to the DRS it participates in. Where the GS1 packaging model is in use, prefer the upstream gs1:hasReturnablePackageDeposit (gs1:PackagingDetails \u2192 gs1:ReturnablePackageDepositDetails); since oec:DepositReturnScheme subclasses the GS1 target class, the same node works for both.
- **upstream** `gs1:hasReturnablePackageDeposit` — links to details of amounts refunded for returnable package in a specified region.

### 2. Customs Commodity Code Type  ↔  Type Code

- **unser** `oec:CustomsCommodityCodeType` — The classification system that a customs commodity code belongs to.
- **upstream** `gs1:TypeCode` — A code list.

### 3. MTC Nominal Size  ↔  Size Dimension

- **unser** `eusteel:mtcNominalSize` — Nominal dimension of the tested product (mm).
- **upstream** `gs1:sizeDimension` — The numerical size measurement relating to the size type.

### 4. Stage Value  ↔  Measurement Value

- **unser** `oec:stageValue` — Indicator value for this lifecycle module, in the indicator's declared unit.
- **upstream** `gs1:value` — A floating-point numeric value that is qualified by the corresponding measurement unit code - see gs1:unitCode

### 5. Transformation Date  ↔  Production Date and Time

- **unser** `eudr:transformationDate` — Date when commodity was processed/transformed.
- **upstream** `gs1:productionDateTime` — The date and time of production (or assembly). The date and time of production is determined by the manufacturer. The date and time may refer to the trade item itself or to the items contained.

### 6. Material Composition  ↔  Textile Material Content

- **unser** `oec:materialComposition` — (keine Definition)
- **upstream** `gs1:textileMaterialContent` — A description of the material composition used in conjunction with the material percentage.

### 7. Value  ↔  Authenticity Security Feature Value

- **unser** `oec:value` — The value of a SingleValuedDataElement or MultiLanguageValue (EN 18223 4.1.2.5, 4.1.2.8.2). Any JSON data type.
- **upstream** `gs1:authenticitySecurityFeatureValue` — Links to a string value read from a physical security marking.

### 8. Language  ↔  File Language Code

- **unser** `oec:language` — Language tag of a value (EN 18223 4.1.2.8.2): ISO 639 language plus EN ISO 3166-1 country, for example \"en-GB\".
- **upstream** `gs1:fileLanguageCode` — The specified language to which the digital asset is targeted. It is recommended to use the ISO 639-1 language code.

### 9. FSC Certification  ↔  Certification End Date

- **unser** `eudr:fscCertification` — Reference to FSC (Forest Stewardship Council) certification.
- **upstream** `gs1:certificationEndDate` — Last date of validity for the certification. (After this date the certification lapses and would need to be renewed/replaced)

### 10. Manufacturing Place  ↔  Has Manufacturing Plant

- **unser** `eubat:manufacturingPlace` — Location where the battery was manufactured. A oec:FacilityInformation (subClassOf gs1:Place) carrying GLN, certifications, and facility-specific identifiers.
- **upstream** `gs1:manufacturingPlant` — A physical location consisting of one or more buildings with facilities for manufacturing.

### 11. Facility Identifier  ↔  Global Location Number (GLN)

- **unser** `eubat:facilityIdentifier` — Unique identifier of the manufacturing facility (recommended: GS1 GLN). Sits on the oec:FacilityInformation referenced by eubat:manufacturingPlace.
- **upstream** `gs1:globalLocationNumber` — A Global Location Number (GLN) is the GS1 Identification Key used to identify physical locations or parties. The key comprises a GS1 Company Prefix, Location Reference and Check Digit. For more information see https://www.gs1.org/gln.

### 12. Material Composition  ↔  Packaging Material Details

- **unser** `oec:MaterialComposition` — Material composition information including source country,\npercentage, and critical raw material classification.
- **upstream** `gs1:PackagingMaterialDetails` — Information on any material used for packaging.

### 13. Supplier Contact  ↔  Has After Hours Contact

- **unser** `eubat:supplierContact` — (keine Definition)
- **upstream** `gs1:afterHoursContact` — Links to after-hours contact information. For general contact details, gs1:contactPoint SHALL be used.

### 14. PPWR Packaging  ↔  Returnable Package Deposit Details

- **unser** `euppwr:Packaging` — A packaging item subject to EU Regulation 2025/40 (PPWR). Carrier\nfor the regulation's labelling and DPP data points. Reached from a trade\nitem via gs1:packaging (gs1:Product \u2192 gs1:PackagingDetails); when packaging\nis itself placed on the market as a trade item (e.g. an empty e-commerce\ncarton), type the node as both gs1:Product and euppwr:Packaging. Use\npackagingTier for the sales/grouped/transport position; use\nrecyclabilityGrade, gs1:packagingMaterial, gs1:packagingRecyclingProcessType,\ngs1:hasReturnablePackageDeposit, oec:recycledContent, oec:Compostability,\noec:bioBasedFraction, etc. for the substantive declarations. Identified via\ngs1:gtin; reusable/returnable packaging assets use GRAI (AI 8003).
- **upstream** `gs1:ReturnablePackageDepositDetails` — Details of the deposit for returnable packaging for a product.

### 15. Heat Number  ↔  Batch/Lot Identifier

- **unser** `eusteel:heatNumber` — Heat (melt) number identifying the batch of molten steel from which the product was cast (EN 10168 traceability).
- **upstream** `gs1:hasBatchLotNumber` — The batch or lot number associates an item with information the manufacturer considers relevant for traceability of the trade item to which the element string is applied. The data may refer to the trade item itself or to items contained. The number may be, for example, a production lot number, a shift number, a machine number, a time, or an internal production code. In cases where the same product is manufactured in different locations the brand owner and the manufacturer are responsible for ensuring the non-duplication of batch/lot numbers for a GTIN. For the re-use of batch/lot numbers with a GTIN, sector-specific constraints need to be considered.

### 16. Is Substance of Concern  ↔  Ingredient of Concern

- **unser** `eubat:isSubstanceOfConcern` — Whether this material is a Substance of Very High Concern (SVHC) per REACH.
- **upstream** `gs1:ingredientOfConcern` — Indicates a claim to an ingredient, considered to be a concern for regulatory or other reasons, and which is 'contained' within the product but may not need to specify the amount whether approximate, or an accurate measurement be given.

### 17. Ingredient List  ↔  Ingredient Name

- **unser** `eudet:ingredientList` — List of ingredients in the detergent formulation, using INCI nomenclature.
- **upstream** `gs1:ingredientName` — Free text field describing an ingredient or ingredient group. Ingredients include any additives (colourings, preservatives, e-numbers, etc.) that are encompassed.

### 18. Documents  ↔  Has Referenced File

- **unser** `oec:documents` — Supporting documents for the product. DPP-specific counterpart to gs1:referencedFile: the oec:DocumentReference range adds document typing and ESPR access-rights semantics that gs1:ReferencedFileDetails does not carry.
- **upstream** `gs1:referencedFile` — Link to a file or website containing additional information on product.

### 19. Material Declaration  ↔  Packaging Material Type

- **unser** `euelec:materialDeclaration` — Material declaration per IEC 62474 (Declarable Substance List).\nLinks to oec:SubstanceOfConcern for REACH/RoHS substances.
- **upstream** `gs1:packagingMaterialType` — The materials used for the packaging of the product for example glass or plastic.

### 20. Origin List  ↔  Country Of Origin Statement

- **unser** `eudr:originList` — List of origin details (one per geolocation or polygon).
- **upstream** `gs1:countryOfOriginStatement` — A description of the geographic area the item may have originated from or has been processed.

### 21. Food Traceability List category  ↔  Fruits and Vegetables

- **unser** `usfsma:FoodTraceabilityList` — FDA-defined categories of foods subject to FSMA 204 per the Food Traceability List (21 CFR 1.1300). The FDA list enumerates distinct food types with explicit splits (leafy greens non-cut vs fresh-cut; three cheese pasteurisation classes; individual produce items; four finfish classes). The FDA updates the list periodically; this enum reflects the 2022 publication.
- **upstream** `gs1:FruitsVegetables` — Contains properties related specifically to fruit and vegetable products.

### 22. Maximum Temperature  ↔  Maximum Optimum Consumption Temperature

- **unser** `eubat:maximumTemperature` — (keine Definition)
- **upstream** `gs1:maximumOptimumConsumptionTemperature` — The upper limit drinking temperature of the optimum range of the drinking temperature. The optimum range of the drinking temperature is a recommendation and is based on the experience of the individual producer. Allows for the representation of the same value in different units of measure but not multiple values.

### 23. Product Category  ↔  Food Beverage Tobacco Product

- **unser** `oec:ProductCategory` — ESPR priority product categories per Annex I and delegated acts.
- **upstream** `gs1:FoodBeverageTobaccoProduct` — A food, beverage or tobacco product.

### 24. Carbon Footprint - Recycling  ↔  Sustainability and recycling

- **unser** `eubat:carbonFootprintRecycling` — Carbon footprint share from end-of-life/recycling phase (may be negative credit).
- **upstream** `gs1:sustainabilityInfo` — A link to information relating to sustainability and recycling requirements or processes.

### 25. PPWR Packaging  ↔  Packaging

- **unser** `euppwr:Packaging` — A packaging item subject to EU Regulation 2025/40 (PPWR). Carrier\nfor the regulation's labelling and DPP data points. Reached from a trade\nitem via gs1:packaging (gs1:Product \u2192 gs1:PackagingDetails); when packaging\nis itself placed on the market as a trade item (e.g. an empty e-commerce\ncarton), type the node as both gs1:Product and euppwr:Packaging. Use\npackagingTier for the sales/grouped/transport position; use\nrecyclabilityGrade, gs1:packagingMaterial, gs1:packagingRecyclingProcessType,\ngs1:hasReturnablePackageDeposit, oec:recycledContent, oec:Compostability,\noec:bioBasedFraction, etc. for the substantive declarations. Identified via\ngs1:gtin; reusable/returnable packaging assets use GRAI (AI 8003).
- **upstream** `gs1:PackagingDetails` — Details on packaging for a product for example packaging type (bottle), materials, features, recycling, etc..

### 26. Origin Details  ↔  Country Of Origin Statement

- **unser** `eudr:originDetails` — Container for geolocation and producer identification.
- **upstream** `gs1:countryOfOriginStatement` — A description of the geographic area the item may have originated from or has been processed.

### 27. Origin Details  ↔  Provenance Statement

- **unser** `eudr:originDetails` — Container for geolocation and producer identification.
- **upstream** `gs1:provenanceStatement` — Free text description of the region or place the product originates from. This is to be specifically used to specify areas such as cities, mountain ranges, regions. Examples: Made in the Thuringen Mountains, Made in Paris, From the Napa Valley.

### 28. Season Collection  ↔  Season Parameter

- **unser** `eutex:seasonCollection` — Season and year of the collection (e.g., FW2024, SS2025).
- **upstream** `gs1:seasonParameter` — Code indicating the season in which the product is available, e.g. SPRING, WINTER

### 29. Apparel Subcategory  ↔  Has Additional Product Classification

- **unser** `eutex:apparelSubcategory` — The specific apparel subcategory per EU Preparatory Study classification.
- **upstream** `gs1:additionalProductClassification` — Relates to a set of additional product classification details

### 30. Allergen CAS Number  ↔  Has Allergen

- **unser** `eudet:allergenCasNumber` — CAS registry number of the fragrance allergen.
- **upstream** `gs1:hasAllergen` — Relates to details about allergens
