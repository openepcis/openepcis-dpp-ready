# Reverse coverage — upstream terms not mapped from our side

Upstream terms with no incoming mapping that are embedding-near one of our terms (cosine ≥ 0.65). Each is a candidate to adopt or to map; embedding-surfaced only, not graded. **2320 gaps.**

## schemaorg (1638)

| Upstream term | type | nearest ours | cos |
|---|---|---|---|
| https://schema.org/EUEnergyEfficiencyEnumeration | class | `euelec:EnergyEfficiencyClass` | 0.90 |
| https://schema.org/energyEfficiencyScaleMax | property | `euelec:energyEfficiencyClass` | 0.88 |
| https://schema.org/energyEfficiencyScaleMin | property | `euelec:energyEfficiencyClass` | 0.87 |
| https://schema.org/reportNumber | property | `eubat:testReportNumber` | 0.82 |
| https://schema.org/floorSize | property | `eudr:areaSize` | 0.82 |
| https://schema.org/hasEnergyEfficiencyCategory | property | `euelec:energyEfficiencyClass` | 0.82 |
| https://schema.org/contentLocation | property | `oec:substanceLocation` | 0.82 |
| https://schema.org/certificationIdentification | property | `eutex:verificationCertification` | 0.82 |
| https://schema.org/weightPercentage | property | `eudet:weightPercentRange` | 0.81 |
| https://schema.org/mpn | property | `euelec:componentPartNumber` | 0.80 |
| https://schema.org/toLocation | property | `oec:substanceLocation` | 0.80 |
| https://schema.org/EnergyStarEnergyEfficiencyEnumeration | class | `oec:EnergyEfficiency` | 0.80 |
| https://schema.org/seasonNumber | property | `eutex:seasonCollection` | 0.80 |
| https://schema.org/videoQuality | property | `oec:dataQualityAssessment` | 0.80 |
| https://schema.org/itemLocation | property | `oec:substanceLocation` | 0.80 |
| https://schema.org/shippingConditions | property | `eubat:transportConditions` | 0.80 |
| https://schema.org/productionDate | property | `euelec:materialDeclarationDate` | 0.79 |
| https://schema.org/sourcedFrom | property | `eudr:derivedFrom` | 0.79 |
| https://schema.org/vehicleIdentificationNumber | property | `oec:registrationNumber` | 0.79 |
| https://schema.org/OrganizationRole | class | `oec:OperatorRole` | 0.79 |
| https://schema.org/emissionsCO2 | property | `oec:carbonFootprintProduction` | 0.79 |
| https://schema.org/validUntil | property | `oec:epdValidUntil` | 0.79 |
| https://schema.org/itemOffered | property | `oec:tradeItemPieceDescription` | 0.78 |
| https://schema.org/event | property | `eubat:eventDate` | 0.78 |
| https://schema.org/certificationStatus | property | `oec:complianceStatus` | 0.78 |
| https://schema.org/IndividualProduct | class | `oec:IndividualTradeItemPiece` | 0.78 |
| https://schema.org/dataFeedElement | property | `oec:dataElement` | 0.78 |
| https://schema.org/expires | property | `oec:passportExpiryDate` | 0.78 |
| https://schema.org/paymentDueDate | property | `oec:reportDate` | 0.78 |
| https://schema.org/normalRange | property | `eutex:sizeRange` | 0.78 |
| https://schema.org/applicationContact | property | `eubat:supplierContact` | 0.78 |
| https://schema.org/APIReference | class | `oec:DocumentReference` | 0.78 |
| https://schema.org/inventoryLevel | property | `oec:granularityLevel` | 0.78 |
| https://schema.org/membershipNumber | property | `oec:registrationNumber` | 0.78 |
| https://schema.org/sizeGroup | property | `eutex:sizeRange` | 0.78 |
| https://schema.org/hoursAvailable | property | `eubat:extendedWarrantyAvailable` | 0.78 |
| https://schema.org/propertyID | property | `oec:facilityId` | 0.78 |
| https://schema.org/provider | property | `eubat:operatorRole` | 0.77 |
| https://schema.org/faxNumber | property | `oec:registrationNumber` | 0.77 |
| https://schema.org/cashBack | property | `oec:takeBackIncentive` | 0.77 |

_(+1598 more)_

## gs1 (526)

| Upstream term | type | nearest ours | cos |
|---|---|---|---|
| https://ref.gs1.org/voc/productFormDescription | property | `eudet:productForm` | 0.88 |
| https://ref.gs1.org/voc/organicPercentClaim | property | `eutex:organicContentPercentage` | 0.85 |
| https://ref.gs1.org/voc/collarType | property | `eutex:garmentType` | 0.85 |
| https://ref.gs1.org/voc/minimumOptimumConsumptionTemperature | property | `eubat:minimumTemperature` | 0.83 |
| https://ref.gs1.org/voc/certificationStatus | property | `oec:complianceStatus` | 0.83 |
| https://ref.gs1.org/voc/certificationAuditDate | property | `oec:complianceDate` | 0.83 |
| https://ref.gs1.org/voc/grossWeight | property | `eutex:weightExcludingTrims` | 0.82 |
| https://ref.gs1.org/voc/maximumOptimumConsumptionTemperature | property | `eubat:maximumTemperature` | 0.82 |
| https://ref.gs1.org/voc/seasonCalendarYear | property | `eutex:seasonCollection` | 0.82 |
| https://ref.gs1.org/voc/consumerLifestage | property | `eubat:lifecycleStage` | 0.82 |
| https://ref.gs1.org/voc/availableLanguage | property | `eubat:languageCode` | 0.81 |
| https://ref.gs1.org/voc/packagingRecyclingProcessType | property | `eutex:applicableRecyclingTechnology` | 0.81 |
| https://ref.gs1.org/voc/offerRedemptionURL | property | `oec:depositRedemptionChannelUrl` | 0.81 |
| https://ref.gs1.org/voc/productRange | property | `eutex:sizeRange` | 0.81 |
| https://ref.gs1.org/voc/certificationIdentification | property | `oec:facilityCertifications` | 0.81 |
| https://ref.gs1.org/voc/certificationEndDate | property | `euelec:securityUpdateEndDate` | 0.81 |
| https://ref.gs1.org/voc/certificationAgencyURL | property | `eubat:measurementCertificateUrl` | 0.81 |
| https://ref.gs1.org/voc/AllergenDetails | class | `eudet:FragranceAllergen` | 0.81 |
| https://ref.gs1.org/voc/expirationDate | property | `oec:passportExpiryDate` | 0.80 |
| https://ref.gs1.org/voc/phosphorusPerNutrientBasis | property | `eudet:phosphorusContentPercent` | 0.80 |
| https://ref.gs1.org/voc/regulatoryVerificationNumber | property | `oec:registrationNumber` | 0.80 |
| https://ref.gs1.org/voc/packagingRecyclingScheme | property | `eutex:isRecyclable` | 0.80 |
| https://ref.gs1.org/voc/productSustainabilityInfo | property | `oec:wastePreventionInfo` | 0.80 |
| https://ref.gs1.org/voc/seasonName | property | `eutex:seasonCollection` | 0.80 |
| https://ref.gs1.org/voc/certificationStartDate | property | `oec:complianceDate` | 0.80 |
| https://ref.gs1.org/voc/packagingDate | property | `euelec:materialDeclarationDate` | 0.79 |
| https://ref.gs1.org/voc/ingredientName | property | `oec:componentName` | 0.79 |
| https://ref.gs1.org/voc/initialCertificationDate | property | `euelec:assessmentDate` | 0.79 |
| https://ref.gs1.org/voc/juiceContentPercent | property | `eudet:phosphorusContentPercent` | 0.79 |
| https://ref.gs1.org/voc/targetMarketCountries | property | `eudr:countryList` | 0.79 |
| https://ref.gs1.org/voc/ingredientContentPercentage | property | `eutex:organicContentPercentage` | 0.79 |
| https://ref.gs1.org/voc/textileMaterial | property | `eutex:textileChemicals` | 0.79 |
| https://ref.gs1.org/voc/price | property | `eucpr:characteristicValue` | 0.79 |
| https://ref.gs1.org/voc/certificationType | property | `oec:documentType` | 0.79 |
| https://ref.gs1.org/voc/unitCode | property | `oec:indicatorUnit` | 0.79 |
| https://ref.gs1.org/voc/filePixelHeight | property | `euelec:screenResolutionHeight` | 0.79 |
| https://ref.gs1.org/voc/isWearableItemDisposable | property | `eutex:isRepairable` | 0.79 |
| https://ref.gs1.org/voc/traceability | property | `oec:traceabilityPerformance` | 0.79 |
| https://ref.gs1.org/voc/dueDate | property | `oec:reportDate` | 0.78 |
| https://ref.gs1.org/voc/productYieldVariationPercentage | property | `eudet:weightPercentRange` | 0.78 |

_(+486 more)_

## untp (15)

| Upstream term | type | nearest ours | cos |
|---|---|---|---|
| https://vocabulary.uncefact.org/untp/0.7.0/hazardous | property | `oec:hazardousSubstances` | 0.81 |
| https://vocabulary.uncefact.org/untp/0.7.0/processCategory | property | `oec:productCategory` | 0.75 |
| https://vocabulary.uncefact.org/untp/0.7.0/performanceClaim | property | `eucpr:declarationOfPerformance` | 0.74 |
| https://vocabulary.uncefact.org/untp/0.7.0/conformityTopic | property | `eubat:declarationOfConformity` | 0.71 |
| https://vocabulary.uncefact.org/untp/0.7.0/referenceRegulation | property | `eutex:pefcrReference` | 0.71 |
| https://vocabulary.uncefact.org/untp/0.7.0/registeredId | property | `oec:registrationNumber` | 0.71 |
| https://vocabulary.uncefact.org/untp/0.7.0/referenceStandard | property | `oec:epdStandard` | 0.71 |
| https://vocabulary.uncefact.org/untp/0.7.0/countryOfOperation | property | `eudr:countryList` | 0.70 |
| https://vocabulary.uncefact.org/untp/0.7.0/producedAtFacility | property | `eutex:dyeingFacility` | 0.70 |
| https://vocabulary.uncefact.org/untp/0.7.0/idGranularity | property | `oec:reportingGranularity` | 0.68 |
| https://vocabulary.uncefact.org/untp/0.7.0/attestationType | property | `eubat:atSoC` | 0.67 |
| https://vocabulary.uncefact.org/untp/0.7.0/Regulation | class | `euelec:RoHSCompliance` | 0.66 |
| https://vocabulary.uncefact.org/untp/0.7.0/AttestationType | class | `euelec:RepairCriterionType` | 0.66 |
| https://vocabulary.uncefact.org/untp/0.7.0/ConformityAttestation | class | `eutex:RobustnessAssessment` | 0.65 |
| https://vocabulary.uncefact.org/untp/0.7.0/ProductStatus | class | `eudet:ProductForm` | 0.65 |

## dppk (26)

| Upstream term | type | nearest ours | cos |
|---|---|---|---|
| https://dpp-keystone.org/spec/v2/terms#language | property | `oec:language` | 0.78 |
| https://dpp-keystone.org/spec/v2/terms#contentType | property | `oec:documentType` | 0.77 |
| https://dpp-keystone.org/spec/v2/terms#productName | property | `eusteel:productNumber` | 0.76 |
| https://dpp-keystone.org/spec/v2/terms#packagingMaterialCompositionQuantity | property | `eubat:materialComposition` | 0.75 |
| https://dpp-keystone.org/spec/v2/terms#additionalCertifications | property | `eutex:additionalCareInstructions` | 0.75 |
| https://dpp-keystone.org/spec/v2/terms#packaging | property | `euelec:billOfMaterials` | 0.74 |
| https://dpp-keystone.org/spec/v2/terms#packagingMaterialType | property | `eucpr:constructionProductType` | 0.73 |
| https://dpp-keystone.org/spec/v2/terms#packagingRecycledContent | property | `oec:preConsumerRecycledContent` | 0.73 |
| https://dpp-keystone.org/spec/v2/terms#epM | property | `oec:eprScheme` | 0.72 |
| https://dpp-keystone.org/spec/v2/terms#grossWeight | property | `eutex:weightExcludingTrims` | 0.72 |
| https://dpp-keystone.org/spec/v2/terms#url | property | `eubat:documentUrl` | 0.71 |
| https://dpp-keystone.org/spec/v2/terms#epT | property | `oec:epdProgramOperator` | 0.71 |
| https://dpp-keystone.org/spec/v2/terms#width | property | `euelec:screenResolutionWidth` | 0.71 |
| https://dpp-keystone.org/spec/v2/terms#packagingRecyclingProcessType | property | `eutex:applicableRecyclingTechnology` | 0.70 |
| https://dpp-keystone.org/spec/v2/terms#color | property | `eutex:colorFastness` | 0.70 |
| https://dpp-keystone.org/spec/v2/terms#countryOfOrigin | property | `eudr:countryList` | 0.70 |
| https://dpp-keystone.org/spec/v2/terms#epF | property | `oec:epdProgramOperator` | 0.70 |
| https://dpp-keystone.org/spec/v2/terms#packagingSubstanceOfConcern | property | `oec:substancesOfConcern` | 0.70 |
| https://dpp-keystone.org/spec/v2/terms#model | property | `euelec:modelIdentifier` | 0.69 |
| https://dpp-keystone.org/spec/v2/terms#netWeight | property | `eutex:weightExcludingTrims` | 0.69 |
| https://dpp-keystone.org/spec/v2/terms#height | property | `euelec:screenResolutionHeight` | 0.69 |
| https://dpp-keystone.org/spec/v2/terms#description | property | `euelec:criterionDetails` | 0.69 |
| https://dpp-keystone.org/spec/v2/terms#depth | property | `eubat:depthOfDischargeInCycleLifeTest` | 0.68 |
| https://dpp-keystone.org/spec/v2/terms#pocp | property | `eudet:pStatements` | 0.67 |
| https://dpp-keystone.org/spec/v2/terms#total | property | `euelec:totalScore` | 0.67 |
| https://dpp-keystone.org/spec/v2/terms#MetersLengthLiteral | class | `oec:GranularityLevel` | 0.66 |

## semic (113)

| Upstream term | type | nearest ours | cos |
|---|---|---|---|
| http://data.europa.eu/m8g/level | property | `oec:accessLevel` | 0.78 |
| http://data.europa.eu/m8g/latitude | property | `eudr:geolocation` | 0.77 |
| http://data.europa.eu/m8g/hasEconomicOperator | property | `oec:operatorInformation` | 0.77 |
| http://data.europa.eu/m8g/longitude | property | `eudr:geolocation` | 0.77 |
| http://data.europa.eu/m8g/eventNumber | property | `eubat:eventLocation` | 0.77 |
| http://data.europa.eu/m8g/specifiesEvidenceType | property | `oec:documentType` | 0.77 |
| http://data.europa.eu/m8g/registrationDate | property | `eubat:verificationDate` | 0.77 |
| http://data.europa.eu/m8g/weightingType | property | `eudet:weightPercentRange` | 0.77 |
| http://data.europa.eu/m8g/evidenceTypeClassification | property | `eudr:commodityType` | 0.76 |
| http://www.w3.org/ns/locn#location | property | `oec:substanceLocation` | 0.76 |
| http://www.w3.org/ns/org#classification | property | `oec:activityClassification` | 0.76 |
| http://data.europa.eu/m8g/weightingConsiderationDescription | property | `euelec:criterionDetails` | 0.75 |
| http://data.europa.eu/m8g/hasEvidenceTypeList | property | `oec:documentType` | 0.75 |
| http://www.w3.org/ns/locn#geographicName | property | `eudr:countryList` | 0.75 |
| http://data.europa.eu/m8g/expectedNumberOfParticipants | property | `eubat:expectedNumberOfCycles` | 0.75 |
| http://data.europa.eu/m8g/code | property | `oec:activityClassification` | 0.75 |
| http://data.europa.eu/m8g/registrationPage | property | `oec:registrationNumber` | 0.75 |
| http://data.europa.eu/m8g/EvidenceTypeList | class | `oec:DocumentType` | 0.74 |
| http://data.europa.eu/m8g/EvidenceType | class | `oec:DocumentType` | 0.74 |
| http://www.w3.org/ns/locn#addressId | property | `oec:facilityId` | 0.74 |
| http://data.europa.eu/m8g/hasValue | property | `oec:value` | 0.74 |
| http://data.europa.eu/m8g/geometryType | property | `eutex:fabricType` | 0.74 |
| http://data.europa.eu/m8g/ReferenceFramework | class | `oec:DocumentReference` | 0.74 |
| http://data.europa.eu/m8g/value | property | `oec:value` | 0.73 |
| http://data.europa.eu/m8g/isDerivedFrom | property | `eudr:derivedFrom` | 0.73 |
| http://www.w3.org/ns/locn#postCode | property | `eubat:languageCode` | 0.73 |
| http://data.europa.eu/m8g/confidentialityLevelType | property | `oec:accessLevel` | 0.73 |
| http://www.w3.org/ns/adms#last | property | `eubat:lastDataUpdate` | 0.73 |
| http://www.w3.org/ns/adms#versionNotes | property | `euelec:newVersion` | 0.72 |
| http://data.europa.eu/m8g/expressionOfExpectedValue | property | `oec:value` | 0.72 |
| http://data.europa.eu/m8g/hasChannel | property | `euelec:updateChannel` | 0.72 |
| http://data.europa.eu/m8g/validityPeriodConstraint | property | `oec:testedConditions` | 0.72 |
| http://data.europa.eu/m8g/hasConcept | property | `eubat:hasBattery` | 0.72 |
| http://data.europa.eu/m8g/relatedService | property | `eutex:repairServices` | 0.72 |
| http://data.europa.eu/m8g/providesValueFor | property | `oec:value` | 0.72 |
| http://data.europa.eu/m8g/crs | property | `oec:crmListVersion` | 0.72 |
| http://data.europa.eu/m8g/isDefinedBy | property | `eubat:supplyChainDueDiligence` | 0.71 |
| http://www.w3.org/ns/adms#supportedSchema | property | `oec:documents` | 0.71 |
| http://data.europa.eu/m8g/validityPeriod | property | `oec:dataRetentionPeriod` | 0.71 |
| http://data.europa.eu/m8g/supportsRequirement | property | `eubat:leadSymbolRequired` | 0.71 |

_(+73 more)_

## foaf (2)

| Upstream term | type | nearest ours | cos |
|---|---|---|---|
| http://xmlns.com/foaf/0.1/familyName | property | `eucpr:characteristicName` | 0.71 |
| http://xmlns.com/foaf/0.1/givenName | property | `eucpr:characteristicName` | 0.71 |

