# Changelog: BatteryPass-Ready JSON Schemas per battery category

**Release:** 2.0  
**Compared against:** 1.3  
**Scope:** EV, Industrial without BMS, LMT, Other Industrial 2kWh, Stationary Industrial 2kWh  
**Schema dialect:** JSON Schema Draft 2020-12

> Note: This changelog is derived from structural comparison of v1.3 and v2.0 of the BatteryPass-Ready JSON Schema files. “Required” means membership in the containing object’s `required` array. A rename is breaking for existing JSON instances even where the underlying semantics remain unchanged.

> Some element requirements have been changed to optional. Some elements are conditional, i.e. they only applies to batteries under certain conditions. These elements have been modelled as "optional" for the time being as conditionality can only be checked through plausibility checks. Plausibility checks will be implemented through future updates.

Elements that are conditional for at least one battery category and thus are still required under certain conditions are:

- symbolsForCadmiumAndLead
- warrantyPeriod
- nickelRecycledContentShare
- cobaltRecycledContentShare
- lithiumRecycledContentShare
- leadRecycledContentShare
- expectedLifetimeNumberofChargeDischargeCycles
- remainingRoundTripEnergyEfficiency
- evolutionOfSelfDischargeRates
- presentInternalResistanceOfPack
- cycleLifeReferenceTest
- cRateOfRelevantCycleLifeTest

Thus, please cross-check the battery category requirements for these elements with the BatteryPass-Ready Data Attribute Longlist v2.0. You can find the document **[here.](https://thebatterypass.eu/battery-pass-ready/resources/)** 

## Executive summary

- Version 2.0 is a breaking release: it changes the root envelope, introduces a dedicated DPP header based on JTC-24, standardizes naming, enriches linked-resource and hazardous-substance structures, and revises multiple value containers and requiredness rules.
- The largest shared migrations are the split into `dppHeader` + `batteryPassportData`, relocation of DPP metadata, broad lower-camel-case conversion, replacement of simple URI strings with `RelatedResource`, and consolidation of recycled-content fields.
- Category-specific differences are primarily concentrated in `performanceAndDurability` and, for Industrial without BMS, the addition of manufacturing/service dates.

### Release-wide changes (apply to all five categories)

#### Breaking document structure and naming

- The root property `Battery_Passport` was replaced by two required root objects: `dppHeader` and `batteryPassportData`. `batteryPassportData` references the `#/$defs/batteryPassportMaster`, which is the main reference instance of all `batteryPassportData` objects.
- Almost all data properties and many `$defs` names were standardized from PascalCase, snake_case, hyphenated naming, or spelling variants to lower camelCase. Examples include `BatteryMass` → `batteryMass`, `Date-timeOfLatestUpdateOfDPP` → `lastUpdated` (and relocation), `e-mailAddress` → `eMailAddress`, `gram_kg_decimal` → `gramKilogramDecimal`, and `kg_CO2-equivalent_integer` → `kgCO2EquivalentInteger`.

#### New `dppHeader` and relocated metadata

- Added `dppHeader` with properties `granularity`, `economicOperatorId`, `contentSpecificationIds`, `facilityId`, `lastUpdated`, `dppStatus`, `dppSchemaVersion`, `uniqueProductIdentifier`, and `digitalProductPassportId`.
- Required header fields are `granularity`, `economicOperatorId`, `lastUpdated`, `dppStatus`, `dppSchemaVersion`, `uniqueProductIdentifier`, and `digitalProductPassportId`; `contentSpecificationIds` and `facilityId` are optional.
- The corresponding Version 1.3 fields were removed from `IdentifiersAndProductData`: `DPPGranularity`, `UniqueEconomicOperatorIdentifier`, `UniqueFacilityIdentifier`, `Date-timeOfLatestUpdateOfDPP`, `DPPStatus`, `DPPSchemaVersion`, `UniqueBatteryIdentifierUniqueProductIdentifier`, and `UniqueBatteryPassportIdentifierUniqueDPPIdentifier`.
- Added typed definitions `dppGranularityType` and `dppGranularityCodes`; granularity is now restricted to `item`, `batch`, or `model`. `dppStatusType` remains structurally equivalent under its new name.

Please note: `item` is the only possible value for batteries. Thus the `granularity` element only accepts `item` values.

#### Shared data-model changes

- Added optional `thirdPartyServiceProvider` to `identifiersAndProductData`; it uses `operatorInformationType`. `uniqueManufacturerIdentifier` is now validated as a URI. `WarrantyPeriodOfTheBattery` became `warrantyPeriod` (and is now optional across all schema files).
- Replaced `HazardousSubstances` and `ImpactOfSubstancesOnEnvironmentHumanHealthSafetyPersons` with required `hazardousSubstancesAndTheirImpact`, an array of 1–100 `HazardousSubstancesType` objects. Each object requires `chemicalName`, `identifierType`, `identifier`, and `concentration`; optional arrays `hazardPhrases` and `precautionaryPhrases` allow 1–20 strings, and `substanceLocation` is optional. Identifier codes are `CAS` and `EC`.
- `criticalRawMaterials` and `materialsUsedInCathodeAnodeAndElectrolyte` changed from required strings to optional arrays of 1–100 strings.
- Recycled-content fields were consolidated: separate pre-consumer and post-consumer fields for nickel, cobalt, and lithium became one field per material (`nickelRecycledContentShare`, `cobaltRecycledContentShare`, `lithiumRecycledContentShare`); `RecycledLeadShare` became `leadRecycledContentShare`. All remain required.
- Added `RelatedResource` (`contentType`, `url`, optional `language`, optional `resourceTitle`; `contentType` and `url` required). URI-valued document/link fields across circularity, carbon footprint, due diligence, symbols/conformity, and accident information now use this richer object. `dismantlingInformation` also uses `RelatedResource`. The supported language enum contains 43 locale codes.
- `SymbolsForCadmiumAndLead` became optional (`symbolsForCadmiumAndLead`).
- `Operator_information_type` became `operatorInformationType`; `e-mailAddress` became `eMailAddress`; the required members remain `name`, `registeredTradeNameOrRegisteredTrademark`, and `postalAddress`.

#### Units, value types, and validation

- Unit-member names were standardized with a `Unit` suffix (for example `percent` → `percentUnit`, `degreeCelsius` → `degreeCelsiusUnit`, `volt` → `voltUnit`, `watt` → `wattUnit`, and `gramKg` → `gramKilogramUnit`). Corresponding enum `$defs` were renamed consistently.
- Percentage containers changed from `percent_decimal` to `percentInteger`; percentage values are now integers constrained to 0–100.
- Power containers were renamed to `wattCelciusDecimalTwoValues` and `wattCelsiusDecimalOneValue`; their watt and temperature values changed from integer to number where defined.
- Internal resistance was expanded from one `ohmValue` to separate cell, module, and pack values in `ohmInteger`; the pack value and unit are required. Added `InternalResistanceIncreaseType` with separate cell/module/pack integer values and required pack value plus percent unit.
- URI fields represented as plain strings in Version 2.0 generally add an explicit HTTP(S) regex; fields migrated to `RelatedResource` apply its URL regex.
- Access-control annotations were revised across the schemas. Version 2.0 also introduces two occurrences of the differently spelled keyword `x-Access-Rights` (with a second hyphen), including `contentSpecificationIds`; consumers that parse custom annotations should account for both spellings.

#### Enumeration changes

- `dppStatusCodes` values changed from title case to lower case and gained `invalid`: `Active`, `Archived`, `Inactive`, `Marked-for-deletion` → `active`, `archived`, `inactive`, `invalid`, `marked-for-deletion`.
- Added `dppGranularityCodes` (`item`, `batch`, `model`) and `hazardousSubstancesIdCodes` (`CAS` and `EC`) in all five Version 2.0 schemas.
- In Industrial without BMS, `customChemicalCodes` expanded from only `Pb` to the common ten-code chemistry list: `Li-ion LCO`, `Li-ion LFP`, `Li-ion LMO`, `Li-ion NCA`, `Li-ion NMC`, `Li-metal`, `Na-ion`, `Ni-Cd`, `Ni-MH`, and `Pb`.
- In LMT and Stationary Industrial 2kWh, the ampere-hour unit enum expanded from only `Ah` to `Ah` and `mAh`.

#### Removed shared performance field

- Removed `RatioBetweenNominalBatteryPowerAndBatteryEnergy` and its supporting watt-per-watt-hour definitions (`watt_per_watt_hour_integer` / `wattPerWattHour`).

## EV

**Compared:** `EV_1.3.json` → `EV_2.0.json`

### Category-specific changes

- No category-exclusive additions or requiredness relaxations were identified beyond the release-wide changes.
- `performanceAndDurability` retains the EV fields for certified/remaining usable energy, SoC/SOCE, power capability, round-trip efficiency, resistance, cycle life, and event counters, with renamed keys and the shared type-container migrations.

### Complete section-level field mapping

> The table below records every field rename, addition, removal, requiredness change, and structural/validation change in the seven business-data sections. Purely shared `$defs` naming migrations are summarized in the release-wide section.

#### Battery carbon footprint

**Renamed / normalized fields**

- `ContributionOfRawMaterialAcquisitionAndPre-processingLifecycleStage` → `contributionOfRawMaterialAcquisitionAndPreProcessingLifecycleStage`, `BatteryCarbonFootprintPerFunctionalUnit` → `batteryCarbonFootprintPerFunctionalUnit`, `ContributionOfMainProductProductionLifecycleStage` → `contributionOfMainProductProductionLifecycleStage`, `ContributionOfDistributionLifecycleStage` → `contributionOfDistributionLifecycleStage`, `ContributionOfEndOfLifeAndRecyclingLifecycleStage` → `contributionOfEndOfLifeAndRecyclingLifecycleStage`, `CarbonFootprintPerformanceClass` → `carbonFootprintPerformanceClass`, `WebLinkToPublicCarbonFootprintStudy` → `webLinkToPublicCarbonFootprintStudy`, `AbsoluteBatteryCarbonFootprint` → `absoluteBatteryCarbonFootprint`.

**Type / validation / reference changes**

- `WebLinkToPublicCarbonFootprintStudy` → `webLinkToPublicCarbonFootprintStudy`: `string` (format `uri`) → `string` (format `uri`, HTTP(S) pattern).

#### Battery materials and composition

**Renamed / normalized fields**

- `BatteryChemistry` → `batteryChemistry`, `CriticalRawMaterials` → `criticalRawMaterials`, `MaterialsUsedInCathodeAnodeAndElectrolyte` → `materialsUsedInCathodeAnodeAndElectrolyte`.

**Removed fields**

- `HazardousSubstances`, `ImpactOfSubstancesOnEnvironmentHumanHealthSafetyPersons`.

**Added fields**

- `hazardousSubstancesAndTheirImpact`.

**Type / validation / reference changes**

- `CriticalRawMaterials` → `criticalRawMaterials`: `string` → `array` (items 1–100, items: `string`).
- `MaterialsUsedInCathodeAnodeAndElectrolyte` → `materialsUsedInCathodeAnodeAndElectrolyte`: `string` → `array` (items 1–100, items: `string`).

#### Circularity and resource efficiency

**Renamed / normalized fields**

- `DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` → `dismantlingInformation`, `PartNumbersForComponents` → `partNumbersForComponents`, `InformationOnSourcesOfSpareParts` → `informationOnSourcesOfSpareParts`, `SafetyMeasures` → `safetyMeasures`, `RenewableContentShare` → `renewableContentShare`, `InformationOnTheRoleOfEnd-usersInContributingToWastePrevention` → `informationOnTheRoleOfEndUsersInContributingToWastePrevention`, `InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` → `informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries`, `InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` → `informationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife`.

**Removed fields**

- `Pre-consumerRecycledNickelShare`, `Pre-consumerRecycledCobaltShare`, `Pre-consumerRecycledLithiumShare`, `Post-consumerRecycledNickelShare`, `Post-consumerRecycledCobaltShare`, `Post-consumerRecycledLithiumShare`, `RecycledLeadShare`.

**Added fields**

- `nickelRecycledContentShare`, `cobaltRecycledContentShare`, `lithiumRecycledContentShare`, `leadRecycledContentShare`.

**Type / validation / reference changes**

- `DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` → `dismantlingInformation`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `PartNumbersForComponents` → `partNumbersForComponents`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnSourcesOfSpareParts` → `informationOnSourcesOfSpareParts`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `SafetyMeasures` → `safetyMeasures`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `RenewableContentShare` → `renewableContentShare`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InformationOnTheRoleOfEnd-usersInContributingToWastePrevention` → `informationOnTheRoleOfEndUsersInContributingToWastePrevention`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` → `informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` → `informationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Identifiers and product data

**Renamed / normalized fields**

- `BatteryModelIdentifier` → `batteryModelIdentifier`, `BatterySerialNumber` → `batterySerialNumber`, `UniqueManufacturerIdentifier` → `uniqueManufacturerIdentifier`, `EconomicOperatorInformation` → `economicOperatorInformation`, `ManufacturerInformation` → `manufacturerInformation`, `ManufacturingPlace` → `manufacturingPlace`, `ManufacturingDate` → `manufacturingDate`, `DateOfPuttingTheBatteryIntoService` → `dateOfPuttingTheBatteryIntoService`.
- `WarrantyPeriodOfTheBattery` → `warrantyPeriod`, `BatteryCategory` → `batteryCategory`, `BatteryMass` → `batteryMass`, `BatteryStatus` → `batteryStatus`.

**Removed fields**

- `DPPSchemaVersion`, `DPPStatus`, `DPPGranularity`, `Date-timeOfLatestUpdateOfDPP`, `UniqueBatteryPassportIdentifierUniqueDPPIdentifier`, `UniqueBatteryIdentifierUniqueProductIdentifier`, `UniqueEconomicOperatorIdentifier`, `UniqueFacilityIdentifier`.

**Added fields**

- `thirdPartyServiceProvider`.

**Type / validation / reference changes**

- `UniqueManufacturerIdentifier` → `uniqueManufacturerIdentifier`: `string` → `string` (format `uri`).
- `WarrantyPeriodOfTheBattery` → `warrantyPeriod`: `string` (format `date`) → `string` (format `duration`).
- `BatteryMass` → `batteryMass`: `#/$defs/gram_kg_decimal` → `#/$defs/gramKilogramDecimal`.

#### Performance and durability

**Renamed / normalized fields**

- `RatedCapacity` → `ratedCapacity`, `RemainingCapacity` → `remainingCapacity`, `CapacityFade` → `capacityFade`, `CertifiedUsableBatteryEnergy` → `certifiedUsableBatteryEnergy`, `RemainingUsableBatteryEnergy` → `remainingUsableBatteryEnergy`, `StateOfCertifiedEnergySOCE` → `stateOfCertifiedEnergySOCE`, `StateOfChargeSoC` → `stateOfChargeSoC`, `MinimumVoltage` → `minimumVoltage`.
- `MaximumVoltage` → `maximumVoltage`, `NominalVoltage` → `nominalVoltage`, `OriginalPowerCapability` → `originalPowerCapability`, `RemainingPowerCapability` → `remainingPowerCapability`, `PowerFade` → `powerFade`, `MaximumPermittedBatteryPower` → `maximumPermittedBatteryPower`, `InitialRoundTripEnergyEfficiency` → `initialRoundTripEnergyEfficiency`, `RoundTripEnergyEfficiencyAt50OfCycleLife` → `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`.
- `EnergyRoundTripEfficiencyFade` → `energyRoundTripEfficiencyFade`, `InitialInternalResistanceOfBatteryCellAndPackModuleRecommended` → `initialInternalResistanceOfBatteryCellAndPackModuleRecommended`, `InternalResistanceIncreaseOfPackCellAndModuleRecommended` → `internalResistanceIncreaseOfPackCellAndModuleRecommended`, `ExpectedLifetimeInCalendarYears` → `expectedLifetimeInCalendarYears`, `ExpectedLifetime-NumberOfCharge-dischargeCycles` → `expectedLifetimeNumberOfChargeDischargeCycles`, `NumberOfFullChargingAndDischargingCycles` → `numberOfFullChargingAndDischargingCycles`, `Cycle-lifeReferenceTest` → `cycleLifeReferenceTest`, `C-rateOfRelevantCycle-lifeTest` → `cRateOfRelevantCycleLifeTest`.
- `CapacityThresholdForExhaustion` → `capacityThresholdForExhaustion`, `TemperatureInformation` → `temperatureInformation`, `TemperatureRangeIdleStateLowerBoundary` → `temperatureRangeIdleStateLowerBoundary`, `TemperatureRangeIdleStateUpperBoundary` → `temperatureRangeIdleStateUpperBoundary`, `NumberOfDeepDischargeEvents` → `numberOfDeepDischargeEvents`, `NumberOfOverchargeEvents` → `numberOfOverchargeEvents`, `InformationOnAccidents` → `informationOnAccidents`.

**Removed fields**

- `RatioBetweenNominalBatteryPowerAndBatteryEnergy`.

**Type / validation / reference changes**

- `RemainingCapacity` → `remainingCapacity`: `#/$defs/amperehour_miliamperehour_integer_2` → `#/$defs/amperehourMiliamperehourInteger`.
- `CapacityFade` → `capacityFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `StateOfCertifiedEnergySOCE` → `stateOfCertifiedEnergySOCE`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `StateOfChargeSoC` → `stateOfChargeSoC`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `OriginalPowerCapability` → `originalPowerCapability`: `#/$defs/watt_celcius_integer` → `#/$defs/wattCelciusDecimalTwoValues`.
- `RemainingPowerCapability` → `remainingPowerCapability`: `#/$defs/watt_celcius_integer_2` → `#/$defs/wattCelciusDecimalTwoValues`.
- `PowerFade` → `powerFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `MaximumPermittedBatteryPower` → `maximumPermittedBatteryPower`: `#/$defs/watt_celsius_integer_onevalue` → `#/$defs/wattCelsiusDecimalOneValue`.
- `InitialRoundTripEnergyEfficiency` → `initialRoundTripEnergyEfficiency`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `RoundTripEnergyEfficiencyAt50OfCycleLife` → `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `EnergyRoundTripEfficiencyFade` → `energyRoundTripEfficiencyFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InternalResistanceIncreaseOfPackCellAndModuleRecommended` → `internalResistanceIncreaseOfPackCellAndModuleRecommended`: `#/$defs/percent_decimal` → `#/$defs/InternalResistanceIncreaseType`.
- `CapacityThresholdForExhaustion` → `capacityThresholdForExhaustion`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InformationOnAccidents` → `informationOnAccidents`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Supply-chain due diligence

**Renamed / normalized fields**

- `InformationOfDueDiligenceReport` → `informationOfDueDiligenceReport`, `ThirdPartyAssurancesOfRecognisedSchemes` → `thirdPartyAssurancesOfRecognisedSchemes`, `SupplyChainIndices` → `supplyChainIndices`.

**Type / validation / reference changes**

- `InformationOfDueDiligenceReport` → `informationOfDueDiligenceReport`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Symbols, labels and conformity documentation

**Renamed / normalized fields**

- `SeparateCollectionSymbol` → `separateCollectionSymbol`, `SymbolsForCadmiumAndLead` → `symbolsForCadmiumAndLead`, `CarbonFootprintLabel` → `carbonFootprintLabel`, `ExtinguishingAgent` → `extinguishingAgent`, `MeaningOfLabelsAndSymbols` → `meaningOfLabelsAndSymbols`, `EUDeclarationOfConformity` → `euDeclarationOfConformity`, `ResultsOfTestReportsProvingCompliance` → `resultsOfTestReportsProvingCompliance`.

**Requiredness changes**

- `symbolsForCadmiumAndLead`: required → optional.

**Type / validation / reference changes**

- `SeparateCollectionSymbol` → `separateCollectionSymbol`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `SymbolsForCadmiumAndLead` → `symbolsForCadmiumAndLead`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `CarbonFootprintLabel` → `carbonFootprintLabel`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `EUDeclarationOfConformity` → `euDeclarationOfConformity`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `ResultsOfTestReportsProvingCompliance` → `resultsOfTestReportsProvingCompliance`: `string` (format `uri`) → `#/$defs/RelatedResource`.


## Industrial without BMS

**Compared:** `Industrial_Without_BMS_1.3.json` → `Industrial_Without_BMS_2.0.json`

### Category-specific changes

- Added optional `manufacturingDate` (`date`) and `dateOfPuttingTheBatteryIntoService` (`date`) to `identifiersAndProductData`; neither existed in Version 1.3 for this category.
- Removed `StateOfChargeSoC` and `TemperatureInformation` from `performanceAndDurability`.
- Added optional `initialInternalResistanceOfBatteryCellAndPackModuleRecommended` (`ohmInteger`) and `internalResistanceIncreaseOfPackCellAndModuleRecommended` (`InternalResistanceIncreaseType`).
- `expectedLifetimeNumberOfChargeDischargeCycles` changed from required to optional.

### Complete section-level field mapping

> The table below records every field rename, addition, removal, requiredness change, and structural/validation change in the seven business-data sections. Purely shared `$defs` naming migrations are summarized in the release-wide section.

#### Battery carbon footprint

**Renamed / normalized fields**

- `ContributionOfRawMaterialAcquisitionAndPre-processingLifecycleStage` → `contributionOfRawMaterialAcquisitionAndPreProcessingLifecycleStage`, `BatteryCarbonFootprintPerFunctionalUnit` → `batteryCarbonFootprintPerFunctionalUnit`, `ContributionOfMainProductProductionLifecycleStage` → `contributionOfMainProductProductionLifecycleStage`, `ContributionOfDistributionLifecycleStage` → `contributionOfDistributionLifecycleStage`, `ContributionOfEndOfLifeAndRecyclingLifecycleStage` → `contributionOfEndOfLifeAndRecyclingLifecycleStage`, `CarbonFootprintPerformanceClass` → `carbonFootprintPerformanceClass`, `WebLinkToPublicCarbonFootprintStudy` → `webLinkToPublicCarbonFootprintStudy`, `AbsoluteBatteryCarbonFootprint` → `absoluteBatteryCarbonFootprint`.

**Type / validation / reference changes**

- `WebLinkToPublicCarbonFootprintStudy` → `webLinkToPublicCarbonFootprintStudy`: `string` (format `uri`) → `string` (format `uri`, HTTP(S) pattern).

#### Battery materials and composition

**Renamed / normalized fields**

- `BatteryChemistry` → `batteryChemistry`, `CriticalRawMaterials` → `criticalRawMaterials`, `MaterialsUsedInCathodeAnodeAndElectrolyte` → `materialsUsedInCathodeAnodeAndElectrolyte`.

**Removed fields**

- `HazardousSubstances`, `ImpactOfSubstancesOnEnvironmentHumanHealthSafetyPersons`.

**Added fields**

- `hazardousSubstancesAndTheirImpact`.

**Requiredness changes**

- `criticalRawMaterials`: required → optional.

**Type / validation / reference changes**

- `CriticalRawMaterials` → `criticalRawMaterials`: `string` → `array` (items 1–100, items: `string`).
- `MaterialsUsedInCathodeAnodeAndElectrolyte` → `materialsUsedInCathodeAnodeAndElectrolyte`: `string` → `array` (items 1–100, items: `string`).

#### Circularity and resource efficiency

**Renamed / normalized fields**

- `DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` → `dismantlingInformation`, `PartNumbersForComponents` → `partNumbersForComponents`, `InformationOnSourcesOfSpareParts` → `informationOnSourcesOfSpareParts`, `SafetyMeasures` → `safetyMeasures`, `RenewableContentShare` → `renewableContentShare`, `InformationOnTheRoleOfEnd-usersInContributingToWastePrevention` → `informationOnTheRoleOfEndUsersInContributingToWastePrevention`, `InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` → `informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries`, `InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` → `informationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife`.

**Removed fields**

- `Pre-consumerRecycledNickelShare`, `Pre-consumerRecycledCobaltShare`, `Pre-consumerRecycledLithiumShare`, `Post-consumerRecycledNickelShare`, `Post-consumerRecycledCobaltShare`, `Post-consumerRecycledLithiumShare`, `RecycledLeadShare`.

**Added fields**

- `nickelRecycledContentShare`, `cobaltRecycledContentShare`, `lithiumRecycledContentShare`, `leadRecycledContentShare`.

**Type / validation / reference changes**

- `DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` → `dismantlingInformation`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `PartNumbersForComponents` → `partNumbersForComponents`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnSourcesOfSpareParts` → `informationOnSourcesOfSpareParts`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `SafetyMeasures` → `safetyMeasures`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `RenewableContentShare` → `renewableContentShare`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InformationOnTheRoleOfEnd-usersInContributingToWastePrevention` → `informationOnTheRoleOfEndUsersInContributingToWastePrevention`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` → `informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` → `informationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Identifiers and product data

**Renamed / normalized fields**

- `BatteryModelIdentifier` → `batteryModelIdentifier`, `BatterySerialNumber` → `batterySerialNumber`, `UniqueManufacturerIdentifier` → `uniqueManufacturerIdentifier`, `EconomicOperatorInformation` → `economicOperatorInformation`, `ManufacturerInformation` → `manufacturerInformation`, `ManufacturingPlace` → `manufacturingPlace`, `WarrantyPeriodOfTheBattery` → `warrantyPeriod`, `BatteryCategory` → `batteryCategory`.
- `BatteryMass` → `batteryMass`, `BatteryStatus` → `batteryStatus`.

**Removed fields**

- `DPPSchemaVersion`, `DPPStatus`, `DPPGranularity`, `Date-timeOfLatestUpdateOfDPP`, `UniqueBatteryPassportIdentifierUniqueDPPIdentifier`, `UniqueBatteryIdentifierUniqueProductIdentifier`, `UniqueEconomicOperatorIdentifier`, `UniqueFacilityIdentifier`.

**Added fields**

- `thirdPartyServiceProvider`, `manufacturingDate`, `dateOfPuttingTheBatteryIntoService`.

**Type / validation / reference changes**

- `UniqueManufacturerIdentifier` → `uniqueManufacturerIdentifier`: `string` → `string` (format `uri`).
- `WarrantyPeriodOfTheBattery` → `warrantyPeriod`: `string` (format `date`) → `string` (format `duration`).
- `BatteryMass` → `batteryMass`: `#/$defs/gram_kg_decimal` → `#/$defs/gramKilogramDecimal`.

#### Performance and durability

**Renamed / normalized fields**

- `RatedCapacity` → `ratedCapacity`, `CapacityFade` → `capacityFade`, `MinimumVoltage` → `minimumVoltage`, `MaximumVoltage` → `maximumVoltage`, `NominalVoltage` → `nominalVoltage`, `OriginalPowerCapability` → `originalPowerCapability`, `PowerFade` → `powerFade`, `MaximumPermittedBatteryPower` → `maximumPermittedBatteryPower`.
- `InitialRoundTripEnergyEfficiency` → `initialRoundTripEnergyEfficiency`, `RoundTripEnergyEfficiencyAt50OfCycleLife` → `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`, `EnergyRoundTripEfficiencyFade` → `energyRoundTripEfficiencyFade`, `ExpectedLifetimeInCalendarYears` → `expectedLifetimeInCalendarYears`, `ExpectedLifetime-NumberOfCharge-dischargeCycles` → `expectedLifetimeNumberOfChargeDischargeCycles`, `Cycle-lifeReferenceTest` → `cycleLifeReferenceTest`, `C-rateOfRelevantCycle-lifeTest` → `cRateOfRelevantCycleLifeTest`, `TemperatureRangeIdleStateLowerBoundary` → `temperatureRangeIdleStateLowerBoundary`.
- `TemperatureRangeIdleStateUpperBoundary` → `temperatureRangeIdleStateUpperBoundary`, `InformationOnAccidents` → `informationOnAccidents`.

**Removed fields**

- `StateOfChargeSoC`, `RatioBetweenNominalBatteryPowerAndBatteryEnergy`, `TemperatureInformation`.

**Added fields**

- `initialInternalResistanceOfBatteryCellAndPackModuleRecommended`, `internalResistanceIncreaseOfPackCellAndModuleRecommended`.

**Requiredness changes**

- `expectedLifetimeNumberOfChargeDischargeCycles`: required → optional.

**Type / validation / reference changes**

- `CapacityFade` → `capacityFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `OriginalPowerCapability` → `originalPowerCapability`: `#/$defs/watt_celcius_integer` → `#/$defs/wattCelciusDecimalTwoValues`.
- `PowerFade` → `powerFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `MaximumPermittedBatteryPower` → `maximumPermittedBatteryPower`: `#/$defs/watt_celsius_integer_onevalue` → `#/$defs/wattCelsiusDecimalOneValue`.
- `InitialRoundTripEnergyEfficiency` → `initialRoundTripEnergyEfficiency`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `RoundTripEnergyEfficiencyAt50OfCycleLife` → `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `EnergyRoundTripEfficiencyFade` → `energyRoundTripEfficiencyFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InformationOnAccidents` → `informationOnAccidents`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Supply-chain due diligence

**Renamed / normalized fields**

- `InformationOfDueDiligenceReport` → `informationOfDueDiligenceReport`, `ThirdPartyAssurancesOfRecognisedSchemes` → `thirdPartyAssurancesOfRecognisedSchemes`, `SupplyChainIndices` → `supplyChainIndices`.

**Type / validation / reference changes**

- `InformationOfDueDiligenceReport` → `informationOfDueDiligenceReport`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Symbols, labels and conformity documentation

**Renamed / normalized fields**

- `SeparateCollectionSymbol` → `separateCollectionSymbol`, `SymbolsForCadmiumAndLead` → `symbolsForCadmiumAndLead`, `CarbonFootprintLabel` → `carbonFootprintLabel`, `ExtinguishingAgent` → `extinguishingAgent`, `MeaningOfLabelsAndSymbols` → `meaningOfLabelsAndSymbols`, `EUDeclarationOfConformity` → `euDeclarationOfConformity`, `ResultsOfTestReportsProvingCompliance` → `resultsOfTestReportsProvingCompliance`.

**Requiredness changes**

- `symbolsForCadmiumAndLead`: required → optional.

**Type / validation / reference changes**

- `SeparateCollectionSymbol` → `separateCollectionSymbol`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `SymbolsForCadmiumAndLead` → `symbolsForCadmiumAndLead`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `CarbonFootprintLabel` → `carbonFootprintLabel`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `EUDeclarationOfConformity` → `euDeclarationOfConformity`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `ResultsOfTestReportsProvingCompliance` → `resultsOfTestReportsProvingCompliance`: `string` (format `uri`) → `#/$defs/RelatedResource`.


## LMT

**Compared:** `LMT_1.3.json` → `LMT_2.0.json`

### Category-specific changes

- Removed `EnergyThroughput`, `CapacityThroughput`, `TimeSpentInExtremeTemperaturesAboveBoundary`, `TimeSpentInExtremeTemperaturesBelowBoundary`, `TimeSpentChargingDuringExtremeTemperaturesAboveBoundary`, and `TimeSpentChargingDuringExtremeTemperaturesBelowBoundary`.
- Added required `presentInternalResistanceOfPack`, using the new pack-oriented `ohmIntegerPack` definition.
- `remainingRoundTripEnergyEfficiency`, `evolutionOfSelfDischargeRates`, and `numberOfDeepDischargeEvents` changed from required to optional.
- `dateOfPuttingTheBatteryIntoService` changed from required to optional.
- The self-discharge rate uses renamed `percentPerMonthDecimal` / `percentPerMonth` definitions; the percentage value is integer-based in Version 2.0.

### Complete section-level field mapping

> The table below records every field rename, addition, removal, requiredness change, and structural/validation change in the seven business-data sections. Purely shared `$defs` naming migrations are summarized in the release-wide section.

#### Battery carbon footprint

**Renamed / normalized fields**

- `ContributionOfRawMaterialAcquisitionAndPre-processingLifecycleStage` → `contributionOfRawMaterialAcquisitionAndPreProcessingLifecycleStage`, `BatteryCarbonFootprintPerFunctionalUnit` → `batteryCarbonFootprintPerFunctionalUnit`, `ContributionOfMainProductProductionLifecycleStage` → `contributionOfMainProductProductionLifecycleStage`, `ContributionOfDistributionLifecycleStage` → `contributionOfDistributionLifecycleStage`, `ContributionOfEndOfLifeAndRecyclingLifecycleStage` → `contributionOfEndOfLifeAndRecyclingLifecycleStage`, `CarbonFootprintPerformanceClass` → `carbonFootprintPerformanceClass`, `WebLinkToPublicCarbonFootprintStudy` → `webLinkToPublicCarbonFootprintStudy`, `AbsoluteBatteryCarbonFootprint` → `absoluteBatteryCarbonFootprint`.

**Type / validation / reference changes**

- `WebLinkToPublicCarbonFootprintStudy` → `webLinkToPublicCarbonFootprintStudy`: `string` (format `uri`) → `string` (format `uri`, HTTP(S) pattern).

#### Battery materials and composition

**Renamed / normalized fields**

- `BatteryChemistry` → `batteryChemistry`, `CriticalRawMaterials` → `criticalRawMaterials`, `MaterialsUsedInCathodeAnodeAndElectrolyte` → `materialsUsedInCathodeAnodeAndElectrolyte`.

**Removed fields**

- `HazardousSubstances`, `ImpactOfSubstancesOnEnvironmentHumanHealthSafetyPersons`.

**Added fields**

- `hazardousSubstancesAndTheirImpact`.

**Requiredness changes**

- `criticalRawMaterials`: required → optional.

**Type / validation / reference changes**

- `CriticalRawMaterials` → `criticalRawMaterials`: `string` → `array` (items 1–100, items: `string`).
- `MaterialsUsedInCathodeAnodeAndElectrolyte` → `materialsUsedInCathodeAnodeAndElectrolyte`: `string` → `array` (items 1–100, items: `string`).

#### Circularity and resource efficiency

**Renamed / normalized fields**

- `DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` → `dismantlingInformation`, `PartNumbersForComponents` → `partNumbersForComponents`, `InformationOnSourcesOfSpareParts` → `informationOnSourcesOfSpareParts`, `SafetyMeasures` → `safetyMeasures`, `RenewableContentShare` → `renewableContentShare`, `InformationOnTheRoleOfEnd-usersInContributingToWastePrevention` → `informationOnTheRoleOfEndUsersInContributingToWastePrevention`, `InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` → `informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries`, `InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` → `informationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife`.

**Removed fields**

- `Pre-consumerRecycledNickelShare`, `Pre-consumerRecycledCobaltShare`, `Pre-consumerRecycledLithiumShare`, `Post-consumerRecycledNickelShare`, `Post-consumerRecycledCobaltShare`, `Post-consumerRecycledLithiumShare`, `RecycledLeadShare`.

**Added fields**

- `nickelRecycledContentShare`, `cobaltRecycledContentShare`, `lithiumRecycledContentShare`, `leadRecycledContentShare`.

**Type / validation / reference changes**

- `DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` → `dismantlingInformation`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `PartNumbersForComponents` → `partNumbersForComponents`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnSourcesOfSpareParts` → `informationOnSourcesOfSpareParts`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `SafetyMeasures` → `safetyMeasures`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `RenewableContentShare` → `renewableContentShare`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InformationOnTheRoleOfEnd-usersInContributingToWastePrevention` → `informationOnTheRoleOfEndUsersInContributingToWastePrevention`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` → `informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` → `informationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Identifiers and product data

**Renamed / normalized fields**

- `BatteryModelIdentifier` → `batteryModelIdentifier`, `BatterySerialNumber` → `batterySerialNumber`, `UniqueManufacturerIdentifier` → `uniqueManufacturerIdentifier`, `EconomicOperatorInformation` → `economicOperatorInformation`, `ManufacturerInformation` → `manufacturerInformation`, `ManufacturingPlace` → `manufacturingPlace`, `ManufacturingDate` → `manufacturingDate`, `DateOfPuttingTheBatteryIntoService` → `dateOfPuttingTheBatteryIntoService`.
- `WarrantyPeriodOfTheBattery` → `warrantyPeriod`, `BatteryCategory` → `batteryCategory`, `BatteryMass` → `batteryMass`, `BatteryStatus` → `batteryStatus`.

**Removed fields**

- `DPPSchemaVersion`, `DPPStatus`, `DPPGranularity`, `Date-timeOfLatestUpdateOfDPP`, `UniqueBatteryPassportIdentifierUniqueDPPIdentifier`, `UniqueBatteryIdentifierUniqueProductIdentifier`, `UniqueEconomicOperatorIdentifier`, `UniqueFacilityIdentifier`.

**Added fields**

- `thirdPartyServiceProvider`.

**Requiredness changes**

- `dateOfPuttingTheBatteryIntoService`: required → optional.

**Type / validation / reference changes**

- `UniqueManufacturerIdentifier` → `uniqueManufacturerIdentifier`: `string` → `string` (format `uri`).
- `WarrantyPeriodOfTheBattery` → `warrantyPeriod`: `string` (format `date`) → `string` (format `duration`).
- `BatteryMass` → `batteryMass`: `#/$defs/gram_kg_decimal` → `#/$defs/gramKilogramDecimal`.

#### Performance and durability

**Renamed / normalized fields**

- `RatedCapacity` → `ratedCapacity`, `RemainingCapacity` → `remainingCapacity`, `CapacityFade` → `capacityFade`, `StateOfChargeSoC` → `stateOfChargeSoC`, `MinimumVoltage` → `minimumVoltage`, `MaximumVoltage` → `maximumVoltage`, `NominalVoltage` → `nominalVoltage`, `OriginalPowerCapability` → `originalPowerCapability`.
- `RemainingPowerCapability` → `remainingPowerCapability`, `PowerFade` → `powerFade`, `MaximumPermittedBatteryPower` → `maximumPermittedBatteryPower`, `InitialRoundTripEnergyEfficiency` → `initialRoundTripEnergyEfficiency`, `RoundTripEnergyEfficiencyAt50OfCycleLife` → `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`, `RemainingRoundTripEnergyEfficiency` → `remainingRoundTripEnergyEfficiency`, `EnergyRoundTripEfficiencyFade` → `energyRoundTripEfficiencyFade`, `InitialSelf-dischargeRate` → `initialSelfDischargeRate`.
- `CurrentSelf-dischargeRate` → `currentSelfDischargeRate`, `EvolutionOfSelf-dischargeRates` → `evolutionOfSelfDischargeRates`, `InitialInternalResistanceOfBatteryCellAndPackModuleRecommended` → `initialInternalResistanceOfBatteryCellAndPackModuleRecommended`, `InternalResistanceIncreaseOfPackCellAndModuleRecommended` → `internalResistanceIncreaseOfPackCellAndModuleRecommended`, `ExpectedLifetimeInCalendarYears` → `expectedLifetimeInCalendarYears`, `ExpectedLifetime-NumberOfCharge-dischargeCycles` → `expectedLifetimeNumberOfChargeDischargeCycles`, `NumberOfFullChargingAndDischargingCycles` → `numberOfFullChargingAndDischargingCycles`, `Cycle-lifeReferenceTest` → `cycleLifeReferenceTest`.
- `C-rateOfRelevantCycle-lifeTest` → `cRateOfRelevantCycleLifeTest`, `TemperatureInformation` → `temperatureInformation`, `TemperatureRangeIdleStateLowerBoundary` → `temperatureRangeIdleStateLowerBoundary`, `TemperatureRangeIdleStateUpperBoundary` → `temperatureRangeIdleStateUpperBoundary`, `NumberOfDeepDischargeEvents` → `numberOfDeepDischargeEvents`, `NumberOfOverchargeEvents` → `numberOfOverchargeEvents`, `InformationOnAccidents` → `informationOnAccidents`.

**Removed fields**

- `RatioBetweenNominalBatteryPowerAndBatteryEnergy`, `EnergyThroughput`, `CapacityThroughput`, `TimeSpentInExtremeTemperaturesAboveBoundary`, `TimeSpentInExtremeTemperaturesBelowBoundary`, `TimeSpentChargingDuringExtremeTemperaturesAboveBoundary`, `TimeSpentChargingDuringExtremeTemperaturesBelowBoundary`.

**Added fields**

- `presentInternalResistanceOfPack`.

**Requiredness changes**

- `remainingRoundTripEnergyEfficiency`: required → optional.
- `evolutionOfSelfDischargeRates`: required → optional.
- `numberOfDeepDischargeEvents`: required → optional.

**Type / validation / reference changes**

- `RemainingCapacity` → `remainingCapacity`: `#/$defs/amperehour_miliamperehour_integer_2` → `#/$defs/amperehourMiliamperehourInteger`.
- `CapacityFade` → `capacityFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `StateOfChargeSoC` → `stateOfChargeSoC`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `OriginalPowerCapability` → `originalPowerCapability`: `#/$defs/watt_celcius_integer` → `#/$defs/wattCelciusDecimalTwoValues`.
- `RemainingPowerCapability` → `remainingPowerCapability`: `#/$defs/watt_celcius_integer_2` → `#/$defs/wattCelciusDecimalTwoValues`.
- `PowerFade` → `powerFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `MaximumPermittedBatteryPower` → `maximumPermittedBatteryPower`: `#/$defs/watt_celsius_integer_onevalue` → `#/$defs/wattCelsiusDecimalOneValue`.
- `InitialRoundTripEnergyEfficiency` → `initialRoundTripEnergyEfficiency`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `RoundTripEnergyEfficiencyAt50OfCycleLife` → `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `RemainingRoundTripEnergyEfficiency` → `remainingRoundTripEnergyEfficiency`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `EnergyRoundTripEfficiencyFade` → `energyRoundTripEfficiencyFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InitialSelf-dischargeRate` → `initialSelfDischargeRate`: `#/$defs/percentMonth_decimal` → `#/$defs/percentPerMonthDecimal`.
- `CurrentSelf-dischargeRate` → `currentSelfDischargeRate`: `#/$defs/percentMonth_decimal` → `#/$defs/percentPerMonthDecimal`.
- `EvolutionOfSelf-dischargeRates` → `evolutionOfSelfDischargeRates`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InternalResistanceIncreaseOfPackCellAndModuleRecommended` → `internalResistanceIncreaseOfPackCellAndModuleRecommended`: `#/$defs/percent_decimal` → `#/$defs/InternalResistanceIncreaseType`.
- `InformationOnAccidents` → `informationOnAccidents`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Supply-chain due diligence

**Renamed / normalized fields**

- `InformationOfDueDiligenceReport` → `informationOfDueDiligenceReport`, `ThirdPartyAssurancesOfRecognisedSchemes` → `thirdPartyAssurancesOfRecognisedSchemes`, `SupplyChainIndices` → `supplyChainIndices`.

**Type / validation / reference changes**

- `InformationOfDueDiligenceReport` → `informationOfDueDiligenceReport`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Symbols, labels and conformity documentation

**Renamed / normalized fields**

- `SeparateCollectionSymbol` → `separateCollectionSymbol`, `SymbolsForCadmiumAndLead` → `symbolsForCadmiumAndLead`, `CarbonFootprintLabel` → `carbonFootprintLabel`, `ExtinguishingAgent` → `extinguishingAgent`, `MeaningOfLabelsAndSymbols` → `meaningOfLabelsAndSymbols`, `EUDeclarationOfConformity` → `euDeclarationOfConformity`, `ResultsOfTestReportsProvingCompliance` → `resultsOfTestReportsProvingCompliance`.

**Requiredness changes**

- `symbolsForCadmiumAndLead`: required → optional.

**Type / validation / reference changes**

- `SeparateCollectionSymbol` → `separateCollectionSymbol`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `SymbolsForCadmiumAndLead` → `symbolsForCadmiumAndLead`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `CarbonFootprintLabel` → `carbonFootprintLabel`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `EUDeclarationOfConformity` → `euDeclarationOfConformity`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `ResultsOfTestReportsProvingCompliance` → `resultsOfTestReportsProvingCompliance`: `string` (format `uri`) → `#/$defs/RelatedResource`.


## Other Industrial 2kWh

**Compared:** `Other_Industrial_2kWh_1.3.json` → `Other_Industrial_2kWh_2.0.json`

### Category-specific changes

- The following performance fields changed from required to optional: `initialRoundTripEnergyEfficiency`, `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`, `energyRoundTripEfficiencyFade`, `expectedLifetimeNumberOfChargeDischargeCycles`, `numberOfFullChargingAndDischargingCycles`, `cycleLifeReferenceTest`, and `cRateOfRelevantCycleLifeTest`.
- No category-exclusive performance fields were added.

### Complete section-level field mapping

> The table below records every field rename, addition, removal, requiredness change, and structural/validation change in the seven business-data sections. Purely shared `$defs` naming migrations are summarized in the release-wide section.

#### Battery carbon footprint

**Renamed / normalized fields**

- `ContributionOfRawMaterialAcquisitionAndPre-processingLifecycleStage` → `contributionOfRawMaterialAcquisitionAndPreProcessingLifecycleStage`, `BatteryCarbonFootprintPerFunctionalUnit` → `batteryCarbonFootprintPerFunctionalUnit`, `ContributionOfMainProductProductionLifecycleStage` → `contributionOfMainProductProductionLifecycleStage`, `ContributionOfDistributionLifecycleStage` → `contributionOfDistributionLifecycleStage`, `ContributionOfEndOfLifeAndRecyclingLifecycleStage` → `contributionOfEndOfLifeAndRecyclingLifecycleStage`, `CarbonFootprintPerformanceClass` → `carbonFootprintPerformanceClass`, `WebLinkToPublicCarbonFootprintStudy` → `webLinkToPublicCarbonFootprintStudy`, `AbsoluteBatteryCarbonFootprint` → `absoluteBatteryCarbonFootprint`.

**Type / validation / reference changes**

- `WebLinkToPublicCarbonFootprintStudy` → `webLinkToPublicCarbonFootprintStudy`: `string` (format `uri`) → `string` (format `uri`, HTTP(S) pattern).

#### Battery materials and composition

**Renamed / normalized fields**

- `BatteryChemistry` → `batteryChemistry`, `CriticalRawMaterials` → `criticalRawMaterials`, `MaterialsUsedInCathodeAnodeAndElectrolyte` → `materialsUsedInCathodeAnodeAndElectrolyte`.

**Removed fields**

- `HazardousSubstances`, `ImpactOfSubstancesOnEnvironmentHumanHealthSafetyPersons`.

**Added fields**

- `hazardousSubstancesAndTheirImpact`.

**Requiredness changes**

- `criticalRawMaterials`: required → optional.

**Type / validation / reference changes**

- `CriticalRawMaterials` → `criticalRawMaterials`: `string` → `array` (items 1–100, items: `string`).
- `MaterialsUsedInCathodeAnodeAndElectrolyte` → `materialsUsedInCathodeAnodeAndElectrolyte`: `string` → `array` (items 1–100, items: `string`).

#### Circularity and resource efficiency

**Renamed / normalized fields**

- `DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` → `dismantlingInformation`, `PartNumbersForComponents` → `partNumbersForComponents`, `InformationOnSourcesOfSpareParts` → `informationOnSourcesOfSpareParts`, `SafetyMeasures` → `safetyMeasures`, `RenewableContentShare` → `renewableContentShare`, `InformationOnTheRoleOfEnd-usersInContributingToWastePrevention` → `informationOnTheRoleOfEndUsersInContributingToWastePrevention`, `InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` → `informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries`, `InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` → `informationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife`.

**Removed fields**

- `Pre-consumerRecycledNickelShare`, `Pre-consumerRecycledCobaltShare`, `Pre-consumerRecycledLithiumShare`, `Post-consumerRecycledNickelShare`, `Post-consumerRecycledCobaltShare`, `Post-consumerRecycledLithiumShare`, `RecycledLeadShare`.

**Added fields**

- `nickelRecycledContentShare`, `cobaltRecycledContentShare`, `lithiumRecycledContentShare`, `leadRecycledContentShare`.

**Type / validation / reference changes**

- `DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` → `dismantlingInformation`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `PartNumbersForComponents` → `partNumbersForComponents`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnSourcesOfSpareParts` → `informationOnSourcesOfSpareParts`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `SafetyMeasures` → `safetyMeasures`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `RenewableContentShare` → `renewableContentShare`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InformationOnTheRoleOfEnd-usersInContributingToWastePrevention` → `informationOnTheRoleOfEndUsersInContributingToWastePrevention`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` → `informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` → `informationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Identifiers and product data

**Renamed / normalized fields**

- `BatteryModelIdentifier` → `batteryModelIdentifier`, `BatterySerialNumber` → `batterySerialNumber`, `UniqueManufacturerIdentifier` → `uniqueManufacturerIdentifier`, `EconomicOperatorInformation` → `economicOperatorInformation`, `ManufacturerInformation` → `manufacturerInformation`, `ManufacturingPlace` → `manufacturingPlace`, `ManufacturingDate` → `manufacturingDate`, `DateOfPuttingTheBatteryIntoService` → `dateOfPuttingTheBatteryIntoService`.
- `WarrantyPeriodOfTheBattery` → `warrantyPeriod`, `BatteryCategory` → `batteryCategory`, `BatteryMass` → `batteryMass`, `BatteryStatus` → `batteryStatus`.

**Removed fields**

- `DPPSchemaVersion`, `DPPStatus`, `DPPGranularity`, `Date-timeOfLatestUpdateOfDPP`, `UniqueBatteryPassportIdentifierUniqueDPPIdentifier`, `UniqueBatteryIdentifierUniqueProductIdentifier`, `UniqueEconomicOperatorIdentifier`, `UniqueFacilityIdentifier`.

**Added fields**

- `thirdPartyServiceProvider`.

**Type / validation / reference changes**

- `UniqueManufacturerIdentifier` → `uniqueManufacturerIdentifier`: `string` → `string` (format `uri`).
- `WarrantyPeriodOfTheBattery` → `warrantyPeriod`: `string` (format `date`) → `string` (format `duration`).
- `BatteryMass` → `batteryMass`: `#/$defs/gram_kg_decimal` → `#/$defs/gramKilogramDecimal`.

#### Performance and durability

**Renamed / normalized fields**

- `RatedCapacity` → `ratedCapacity`, `RemainingCapacity` → `remainingCapacity`, `CapacityFade` → `capacityFade`, `StateOfChargeSoC` → `stateOfChargeSoC`, `MinimumVoltage` → `minimumVoltage`, `MaximumVoltage` → `maximumVoltage`, `NominalVoltage` → `nominalVoltage`, `OriginalPowerCapability` → `originalPowerCapability`.
- `RemainingPowerCapability` → `remainingPowerCapability`, `PowerFade` → `powerFade`, `MaximumPermittedBatteryPower` → `maximumPermittedBatteryPower`, `InitialRoundTripEnergyEfficiency` → `initialRoundTripEnergyEfficiency`, `RoundTripEnergyEfficiencyAt50OfCycleLife` → `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`, `EnergyRoundTripEfficiencyFade` → `energyRoundTripEfficiencyFade`, `InitialInternalResistanceOfBatteryCellAndPackModuleRecommended` → `initialInternalResistanceOfBatteryCellAndPackModuleRecommended`, `InternalResistanceIncreaseOfPackCellAndModuleRecommended` → `internalResistanceIncreaseOfPackCellAndModuleRecommended`.
- `ExpectedLifetimeInCalendarYears` → `expectedLifetimeInCalendarYears`, `ExpectedLifetime-NumberOfCharge-dischargeCycles` → `expectedLifetimeNumberOfChargeDischargeCycles`, `NumberOfFullChargingAndDischargingCycles` → `numberOfFullChargingAndDischargingCycles`, `Cycle-lifeReferenceTest` → `cycleLifeReferenceTest`, `C-rateOfRelevantCycle-lifeTest` → `cRateOfRelevantCycleLifeTest`, `TemperatureInformation` → `temperatureInformation`, `TemperatureRangeIdleStateLowerBoundary` → `temperatureRangeIdleStateLowerBoundary`, `TemperatureRangeIdleStateUpperBoundary` → `temperatureRangeIdleStateUpperBoundary`.
- `NumberOfDeepDischargeEvents` → `numberOfDeepDischargeEvents`, `NumberOfOverchargeEvents` → `numberOfOverchargeEvents`, `InformationOnAccidents` → `informationOnAccidents`.

**Removed fields**

- `RatioBetweenNominalBatteryPowerAndBatteryEnergy`.

**Requiredness changes**

- `initialRoundTripEnergyEfficiency`: required → optional.
- `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`: required → optional.
- `energyRoundTripEfficiencyFade`: required → optional.
- `expectedLifetimeNumberOfChargeDischargeCycles`: required → optional.
- `numberOfFullChargingAndDischargingCycles`: required → optional.
- `cycleLifeReferenceTest`: required → optional.
- `cRateOfRelevantCycleLifeTest`: required → optional.

**Type / validation / reference changes**

- `RemainingCapacity` → `remainingCapacity`: `#/$defs/amperehour_miliamperehour_integer_2` → `#/$defs/amperehourMiliamperehourInteger`.
- `CapacityFade` → `capacityFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `StateOfChargeSoC` → `stateOfChargeSoC`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `OriginalPowerCapability` → `originalPowerCapability`: `#/$defs/watt_celcius_integer` → `#/$defs/wattCelciusDecimalTwoValues`.
- `RemainingPowerCapability` → `remainingPowerCapability`: `#/$defs/watt_celcius_integer_2` → `#/$defs/wattCelciusDecimalTwoValues`.
- `PowerFade` → `powerFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `MaximumPermittedBatteryPower` → `maximumPermittedBatteryPower`: `#/$defs/watt_celsius_integer_onevalue` → `#/$defs/wattCelsiusDecimalOneValue`.
- `InitialRoundTripEnergyEfficiency` → `initialRoundTripEnergyEfficiency`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `RoundTripEnergyEfficiencyAt50OfCycleLife` → `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `EnergyRoundTripEfficiencyFade` → `energyRoundTripEfficiencyFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InternalResistanceIncreaseOfPackCellAndModuleRecommended` → `internalResistanceIncreaseOfPackCellAndModuleRecommended`: `#/$defs/percent_decimal` → `#/$defs/InternalResistanceIncreaseType`.
- `InformationOnAccidents` → `informationOnAccidents`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Supply-chain due diligence

**Renamed / normalized fields**

- `InformationOfDueDiligenceReport` → `informationOfDueDiligenceReport`, `ThirdPartyAssurancesOfRecognisedSchemes` → `thirdPartyAssurancesOfRecognisedSchemes`, `SupplyChainIndices` → `supplyChainIndices`.

**Type / validation / reference changes**

- `InformationOfDueDiligenceReport` → `informationOfDueDiligenceReport`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Symbols, labels and conformity documentation

**Renamed / normalized fields**

- `SeparateCollectionSymbol` → `separateCollectionSymbol`, `SymbolsForCadmiumAndLead` → `symbolsForCadmiumAndLead`, `CarbonFootprintLabel` → `carbonFootprintLabel`, `ExtinguishingAgent` → `extinguishingAgent`, `MeaningOfLabelsAndSymbols` → `meaningOfLabelsAndSymbols`, `EUDeclarationOfConformity` → `euDeclarationOfConformity`, `ResultsOfTestReportsProvingCompliance` → `resultsOfTestReportsProvingCompliance`.

**Requiredness changes**

- `symbolsForCadmiumAndLead`: required → optional.

**Type / validation / reference changes**

- `SeparateCollectionSymbol` → `separateCollectionSymbol`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `SymbolsForCadmiumAndLead` → `symbolsForCadmiumAndLead`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `CarbonFootprintLabel` → `carbonFootprintLabel`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `EUDeclarationOfConformity` → `euDeclarationOfConformity`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `ResultsOfTestReportsProvingCompliance` → `resultsOfTestReportsProvingCompliance`: `string` (format `uri`) → `#/$defs/RelatedResource`.


## Stationary Industrial 2kWh

**Compared:** `Stationary_Industrial_2kWh_1.3.json` → `Stationary_Industrial_2kWh_2.0.json`

### Category-specific changes

- Removed `EnergyThroughput`, `CapacityThroughput`, `TimeSpentInExtremeTemperaturesAboveBoundary`, `TimeSpentInExtremeTemperaturesBelowBoundary`, `TimeSpentChargingDuringExtremeTemperaturesAboveBoundary`, and `TimeSpentChargingDuringExtremeTemperaturesBelowBoundary`.
- Added required `presentInternalResistanceOfPack`, using the new pack-oriented `ohmIntegerPack` definition.
- `remainingRoundTripEnergyEfficiency`, `evolutionOfSelfDischargeRates`, and `numberOfDeepDischargeEvents` changed from required to optional.
- `dateOfPuttingTheBatteryIntoService` changed from required to optional.
- The self-discharge rate uses renamed `percentPerMonthDecimal` / `percentPerMonth` definitions; the percentage value is integer-based in Version 2.0.

### Complete section-level field mapping

> The table below records every field rename, addition, removal, requiredness change, and structural/validation change in the seven business-data sections. Purely shared `$defs` naming migrations are summarized in the release-wide section.

#### Battery carbon footprint

**Renamed / normalized fields**

- `ContributionOfRawMaterialAcquisitionAndPre-processingLifecycleStage` → `contributionOfRawMaterialAcquisitionAndPreProcessingLifecycleStage`, `BatteryCarbonFootprintPerFunctionalUnit` → `batteryCarbonFootprintPerFunctionalUnit`, `ContributionOfMainProductProductionLifecycleStage` → `contributionOfMainProductProductionLifecycleStage`, `ContributionOfDistributionLifecycleStage` → `contributionOfDistributionLifecycleStage`, `ContributionOfEndOfLifeAndRecyclingLifecycleStage` → `contributionOfEndOfLifeAndRecyclingLifecycleStage`, `CarbonFootprintPerformanceClass` → `carbonFootprintPerformanceClass`, `WebLinkToPublicCarbonFootprintStudy` → `webLinkToPublicCarbonFootprintStudy`, `AbsoluteBatteryCarbonFootprint` → `absoluteBatteryCarbonFootprint`.

**Type / validation / reference changes**

- `WebLinkToPublicCarbonFootprintStudy` → `webLinkToPublicCarbonFootprintStudy`: `string` (format `uri`) → `string` (format `uri`, HTTP(S) pattern).

#### Battery materials and composition

**Renamed / normalized fields**

- `BatteryChemistry` → `batteryChemistry`, `CriticalRawMaterials` → `criticalRawMaterials`, `MaterialsUsedInCathodeAnodeAndElectrolyte` → `materialsUsedInCathodeAnodeAndElectrolyte`.

**Removed fields**

- `HazardousSubstances`, `ImpactOfSubstancesOnEnvironmentHumanHealthSafetyPersons`.

**Added fields**

- `hazardousSubstancesAndTheirImpact`.

**Requiredness changes**

- `criticalRawMaterials`: required → optional.

**Type / validation / reference changes**

- `CriticalRawMaterials` → `criticalRawMaterials`: `string` → `array` (items 1–100, items: `string`).
- `MaterialsUsedInCathodeAnodeAndElectrolyte` → `materialsUsedInCathodeAnodeAndElectrolyte`: `string` → `array` (items 1–100, items: `string`).

#### Circularity and resource efficiency

**Renamed / normalized fields**

- `DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` → `dismantlingInformation`, `PartNumbersForComponents` → `partNumbersForComponents`, `InformationOnSourcesOfSpareParts` → `informationOnSourcesOfSpareParts`, `SafetyMeasures` → `safetyMeasures`, `RenewableContentShare` → `renewableContentShare`, `InformationOnTheRoleOfEnd-usersInContributingToWastePrevention` → `informationOnTheRoleOfEndUsersInContributingToWastePrevention`, `InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` → `informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries`, `InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` → `informationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife`.

**Removed fields**

- `Pre-consumerRecycledNickelShare`, `Pre-consumerRecycledCobaltShare`, `Pre-consumerRecycledLithiumShare`, `Post-consumerRecycledNickelShare`, `Post-consumerRecycledCobaltShare`, `Post-consumerRecycledLithiumShare`, `RecycledLeadShare`.

**Added fields**

- `nickelRecycledContentShare`, `cobaltRecycledContentShare`, `lithiumRecycledContentShare`, `leadRecycledContentShare`.

**Type / validation / reference changes**

- `DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack` → `dismantlingInformation`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `PartNumbersForComponents` → `partNumbersForComponents`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnSourcesOfSpareParts` → `informationOnSourcesOfSpareParts`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `SafetyMeasures` → `safetyMeasures`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `RenewableContentShare` → `renewableContentShare`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InformationOnTheRoleOfEnd-usersInContributingToWastePrevention` → `informationOnTheRoleOfEndUsersInContributingToWastePrevention`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries` → `informationOnTheRoleOfEndUsersInContributingToTheSeparateCollectionOfWasteBatteries`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife` → `informationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Identifiers and product data

**Renamed / normalized fields**

- `BatteryModelIdentifier` → `batteryModelIdentifier`, `BatterySerialNumber` → `batterySerialNumber`, `UniqueManufacturerIdentifier` → `uniqueManufacturerIdentifier`, `EconomicOperatorInformation` → `economicOperatorInformation`, `ManufacturerInformation` → `manufacturerInformation`, `ManufacturingPlace` → `manufacturingPlace`, `ManufacturingDate` → `manufacturingDate`, `DateOfPuttingTheBatteryIntoService` → `dateOfPuttingTheBatteryIntoService`.
- `WarrantyPeriodOfTheBattery` → `warrantyPeriod`, `BatteryCategory` → `batteryCategory`, `BatteryMass` → `batteryMass`, `BatteryStatus` → `batteryStatus`.

**Removed fields**

- `DPPSchemaVersion`, `DPPStatus`, `DPPGranularity`, `Date-timeOfLatestUpdateOfDPP`, `UniqueBatteryPassportIdentifierUniqueDPPIdentifier`, `UniqueBatteryIdentifierUniqueProductIdentifier`, `UniqueEconomicOperatorIdentifier`, `UniqueFacilityIdentifier`.

**Added fields**

- `thirdPartyServiceProvider`.

**Requiredness changes**

- `dateOfPuttingTheBatteryIntoService`: required → optional.

**Type / validation / reference changes**

- `UniqueManufacturerIdentifier` → `uniqueManufacturerIdentifier`: `string` → `string` (format `uri`).
- `WarrantyPeriodOfTheBattery` → `warrantyPeriod`: `string` (format `date`) → `string` (format `duration`).
- `BatteryMass` → `batteryMass`: `#/$defs/gram_kg_decimal` → `#/$defs/gramKilogramDecimal`.

#### Performance and durability

**Renamed / normalized fields**

- `RatedCapacity` → `ratedCapacity`, `RemainingCapacity` → `remainingCapacity`, `CapacityFade` → `capacityFade`, `StateOfChargeSoC` → `stateOfChargeSoC`, `MinimumVoltage` → `minimumVoltage`, `MaximumVoltage` → `maximumVoltage`, `NominalVoltage` → `nominalVoltage`, `OriginalPowerCapability` → `originalPowerCapability`.
- `RemainingPowerCapability` → `remainingPowerCapability`, `PowerFade` → `powerFade`, `MaximumPermittedBatteryPower` → `maximumPermittedBatteryPower`, `InitialRoundTripEnergyEfficiency` → `initialRoundTripEnergyEfficiency`, `RoundTripEnergyEfficiencyAt50OfCycleLife` → `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`, `RemainingRoundTripEnergyEfficiency` → `remainingRoundTripEnergyEfficiency`, `EnergyRoundTripEfficiencyFade` → `energyRoundTripEfficiencyFade`, `InitialSelf-dischargeRate` → `initialSelfDischargeRate`.
- `CurrentSelf-dischargeRate` → `currentSelfDischargeRate`, `EvolutionOfSelf-dischargeRates` → `evolutionOfSelfDischargeRates`, `InitialInternalResistanceOfBatteryCellAndPackModuleRecommended` → `initialInternalResistanceOfBatteryCellAndPackModuleRecommended`, `InternalResistanceIncreaseOfPackCellAndModuleRecommended` → `internalResistanceIncreaseOfPackCellAndModuleRecommended`, `ExpectedLifetimeInCalendarYears` → `expectedLifetimeInCalendarYears`, `ExpectedLifetime-NumberOfCharge-dischargeCycles` → `expectedLifetimeNumberOfChargeDischargeCycles`, `NumberOfFullChargingAndDischargingCycles` → `numberOfFullChargingAndDischargingCycles`, `Cycle-lifeReferenceTest` → `cycleLifeReferenceTest`.
- `C-rateOfRelevantCycle-lifeTest` → `cRateOfRelevantCycleLifeTest`, `TemperatureInformation` → `temperatureInformation`, `TemperatureRangeIdleStateLowerBoundary` → `temperatureRangeIdleStateLowerBoundary`, `TemperatureRangeIdleStateUpperBoundary` → `temperatureRangeIdleStateUpperBoundary`, `NumberOfDeepDischargeEvents` → `numberOfDeepDischargeEvents`, `NumberOfOverchargeEvents` → `numberOfOverchargeEvents`, `InformationOnAccidents` → `informationOnAccidents`.

**Removed fields**

- `RatioBetweenNominalBatteryPowerAndBatteryEnergy`, `EnergyThroughput`, `CapacityThroughput`, `TimeSpentInExtremeTemperaturesAboveBoundary`, `TimeSpentInExtremeTemperaturesBelowBoundary`, `TimeSpentChargingDuringExtremeTemperaturesAboveBoundary`, `TimeSpentChargingDuringExtremeTemperaturesBelowBoundary`.

**Added fields**

- `presentInternalResistanceOfPack`.

**Requiredness changes**

- `remainingRoundTripEnergyEfficiency`: required → optional.
- `evolutionOfSelfDischargeRates`: required → optional.
- `numberOfDeepDischargeEvents`: required → optional.

**Type / validation / reference changes**

- `RemainingCapacity` → `remainingCapacity`: `#/$defs/amperehour_miliamperehour_integer_2` → `#/$defs/amperehourMiliamperehourInteger`.
- `CapacityFade` → `capacityFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `StateOfChargeSoC` → `stateOfChargeSoC`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `OriginalPowerCapability` → `originalPowerCapability`: `#/$defs/watt_celcius_integer` → `#/$defs/wattCelciusDecimalTwoValues`.
- `RemainingPowerCapability` → `remainingPowerCapability`: `#/$defs/watt_celcius_integer_2` → `#/$defs/wattCelciusDecimalTwoValues`.
- `PowerFade` → `powerFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `MaximumPermittedBatteryPower` → `maximumPermittedBatteryPower`: `#/$defs/watt_celsius_integer_onevalue` → `#/$defs/wattCelsiusDecimalOneValue`.
- `InitialRoundTripEnergyEfficiency` → `initialRoundTripEnergyEfficiency`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `RoundTripEnergyEfficiencyAt50OfCycleLife` → `roundTripEnergyEfficiencyAt50PerCentOfCycleLife`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `RemainingRoundTripEnergyEfficiency` → `remainingRoundTripEnergyEfficiency`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `EnergyRoundTripEfficiencyFade` → `energyRoundTripEfficiencyFade`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InitialSelf-dischargeRate` → `initialSelfDischargeRate`: `#/$defs/percentMonth_decimal` → `#/$defs/percentPerMonthDecimal`.
- `CurrentSelf-dischargeRate` → `currentSelfDischargeRate`: `#/$defs/percentMonth_decimal` → `#/$defs/percentPerMonthDecimal`.
- `EvolutionOfSelf-dischargeRates` → `evolutionOfSelfDischargeRates`: `#/$defs/percent_decimal` → `#/$defs/percentInteger`.
- `InternalResistanceIncreaseOfPackCellAndModuleRecommended` → `internalResistanceIncreaseOfPackCellAndModuleRecommended`: `#/$defs/percent_decimal` → `#/$defs/InternalResistanceIncreaseType`.
- `InformationOnAccidents` → `informationOnAccidents`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Supply-chain due diligence

**Renamed / normalized fields**

- `InformationOfDueDiligenceReport` → `informationOfDueDiligenceReport`, `ThirdPartyAssurancesOfRecognisedSchemes` → `thirdPartyAssurancesOfRecognisedSchemes`, `SupplyChainIndices` → `supplyChainIndices`.

**Type / validation / reference changes**

- `InformationOfDueDiligenceReport` → `informationOfDueDiligenceReport`: `string` (format `uri`) → `#/$defs/RelatedResource`.

#### Symbols, labels and conformity documentation

**Renamed / normalized fields**

- `SeparateCollectionSymbol` → `separateCollectionSymbol`, `SymbolsForCadmiumAndLead` → `symbolsForCadmiumAndLead`, `CarbonFootprintLabel` → `carbonFootprintLabel`, `ExtinguishingAgent` → `extinguishingAgent`, `MeaningOfLabelsAndSymbols` → `meaningOfLabelsAndSymbols`, `EUDeclarationOfConformity` → `euDeclarationOfConformity`, `ResultsOfTestReportsProvingCompliance` → `resultsOfTestReportsProvingCompliance`.

**Requiredness changes**

- `symbolsForCadmiumAndLead`: required → optional.

**Type / validation / reference changes**

- `SeparateCollectionSymbol` → `separateCollectionSymbol`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `SymbolsForCadmiumAndLead` → `symbolsForCadmiumAndLead`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `CarbonFootprintLabel` → `carbonFootprintLabel`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `EUDeclarationOfConformity` → `euDeclarationOfConformity`: `string` (format `uri`) → `#/$defs/RelatedResource`.
- `ResultsOfTestReportsProvingCompliance` → `resultsOfTestReportsProvingCompliance`: `string` (format `uri`) → `#/$defs/RelatedResource`.