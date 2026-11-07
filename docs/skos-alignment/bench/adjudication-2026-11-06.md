# EU-DPP-Adjudikation 2026-11-06

Rubrik curator-5. Stimmen: Opus, Sonnet, Fable, Haiku | QA-Linsen scope, direction, skeptic (Opus). E exact, C close, B broad, Nw narrow, - none.

## Offen für Sven

| ours | EU-Element | Entscheidung | Stimmen | QA |
|---|---|---|---|---|
| `eubat:cathodeActiveMaterial` | `batteryChemistry` | CLOSE | C Nw Nw C | C C Nw |
| `eubat:roundTripEfficiency` | `roundTripEnergyEfficiency` | EXACT | Nw E Nw E | E - - |
| `eubat:informationOnCollection` | `separateCollectionPoints` | BROAD | E E E B | E E E |
| `eubat:informationOnCollection` | `takeBackCollectionPoints` | BROAD | E C E C | E E E |
| `eubat:hasRemainingRoundTripEfficiency` | `roundTripEnergyEfficiencyFade` | NONE | - C C C | - - - |
| `eubat:hasCurrentSelfDischargingRate` | `selfDischargingRateSet` | NARROW | Nw C Nw Nw | E E Nw |
| `eubat:hasMaximumDischargingPower` | `powerCapability` | NONE | - Nw Nw Nw | - - - |
| `eubat:hasEvolutionOfSelfDischarge` | `selfDischargingRate` | BROAD | E E E E | E E E |
| `eubat:hasInternalResistance` | `internalCellResistance` | BROAD | B E B E | C B B |
| `eubat:hasCycleCount` | `numberOfDischargingCycles` | CLOSE | E E E E | E E E |
| `eubat:hasPowerCapability` | `originalPowerCapability` | NARROW | Nw C B C | Nw Nw B |
| `eubat:roundTripEfficiencyAt50PercentCycleLife` | `roundTripEnergyEfficiency` | NONE | - Nw - Nw | Nw - - |
| `eubat:hazardImpact` | `batterySubstancesImpact` | CLOSE | C C E C | Nw Nw E |
| `eubat:batteryModelIdentifier` | `uniqueProductIdentifier` | NONE | - - Nw C | Nw - - |
| `eubat:electrolyteType` | `batteryChemistry` | NONE | - Nw Nw Nw | - - - |
| `eubat:hasRatedMaximumPower` | `originalPowerCapability` | NONE | - E - C | C - - |
| `oec:hasProductCategory` | `batteryCategory` | BROAD | B B B C | - B - |
| `oec:hasReportingGranularity` | `granularity` | CLOSE | C C - C | - - C |
| `oec:hasFacilityInformation` | `manufacturingPlace` | BROAD | C B - - | B B - |
| `oec:hasOperatorInformation` | `manufacturerIdentification` | BROAD | B C B - | B B - |
| `oec:dismantlingGuideUrl` | `dismantlingInformation` | EXACT | B E E C | C E C |
| `oec:safeUseInstructions` | `safetyMeasures` | CLOSE | C C Nw C | - - - |
| `eusteel:productNumber` | `productNumber` | NONE | E E E - | E E E |

## Von Hand entschieden

| ours | EU-Element | Entscheidung | Stimmen | QA |
|---|---|---|---|---|
| `eubat:hasTemperatureRangeStorage` | `notInUseTemperatureRangeTest` | NONE | - E - E | B E B |
| `eubat:hasOriginalPowerCapability` | `powerCapability` | NONE | E - ? Nw | Nw - E |
| `eubat:expectedCycleLife` | `expectedLifetimeCyclesRest` | NONE | E E E E | E E E |
| `eubat:hasTemperatureRangeIdleState` | `notInUseTemperatureRangeTest` | NONE | B E - E | E E E |

## Mehrheit ab 5 von 7

| ours | EU-Element | Entscheidung | Stimmen | QA |
|---|---|---|---|---|
| `eubat:hasDismantlingInstructions` | `wasteBatterySafetyInstructions` | NONE | - C - C | - - - |
| `eubat:anodeActiveMaterial` | `batteryChemistry` | NARROW | Nw Nw Nw Nw | - - Nw |
| `eubat:hasDismantlingDocuments` | `dismantlingInformation` | EXACT | E E E C | E E E |
| `eubat:hasRemainingRoundTripEfficiency` | `roundTripEnergyEfficiency` | EXACT | Nw E E E | E E E |
| `eubat:hasRemainingRoundTripEfficiency` | `roundTripEfficiencyAtHalfCycleLife` | NONE | - C - C | - - - |
| `eubat:hasMinimumTemperature` | `notInUseTemperatureRange` | NARROW | Nw Nw - Nw | Nw Nw - |
| `eubat:hasMaximumPermittedBatteryPower` | `originalPowerCapability` | NONE | - Nw - - | - - - |
| `eubat:hasMaximumPermittedBatteryPower` | `powerCapability` | NONE | - Nw - - | - - - |
| `eubat:timeSpentInExtremeTemperaturesBelowBoundary` | `environmentalConditionHistogram` | NARROW | Nw Nw Nw - | - Nw Nw |
| `eubat:hasMaximumDischargingPower` | `originalPowerCapability` | NONE | - Nw - C | - - - |
| `eubat:hasDismantlingAndRemovalInformation` | `wasteBatteryPreventionManagementInfo` | NONE | - - - Nw | - - - |
| `eubat:hasSupplierContact` | `manufacturerContactDetails` | NONE | - C C - | - - - |
| `eubat:hasSupplierContact` | `manufacturerPostalAddress` | NONE | - - - C | - - - |
| `eubat:hasMaterialComposition` | `detailedComposition` | EXACT | E C E C | E E E |
| `eubat:cRateLifeCycleTest` | `cycleLifeDischargeCRate` | NONE | - - C C | - - - |
| `eubat:hasStateOfHealth` | `stateOfCertifiedEnergy` | CLOSE | C C C E | C C C |
| `eubat:timeSpentChargingDuringExtremeTemperaturesAboveBoundary` | `environmentalConditionHistogram` | NARROW | Nw Nw Nw Nw | C Nw C |
| `eubat:hasRemainingPowerCapability` | `powerCapability` | EXACT | E E E C | Nw E E |
| `eubat:recommendedAction` | `safetyMeasures` | NONE | - - - C | - - - |
| `eubat:hasRemainingUsableEnergy` | `remainingCapacity` | CLOSE | C C C C | - C - |
| `eubat:criticalRawMaterialsStatement` | `detailedComposition` | NONE | - - C - | - - - |
| `eubat:roundTripEnergyEfficiency` | `roundTripEfficiencyAtHalfCycleLife` | NONE | - C - C | - - - |
| `eubat:hasRatedMaximumPower` | `powerLimit` | NARROW | Nw E Nw C | Nw Nw Nw |
| `eubat:hasRatedMaximumPower` | `powerCapability` | NONE | - E - C | - - - |
| `eubat:hasManufacturingPlace` | `manufacturingCountry` | BROAD | B B B C | B B B |
| `eubat:hasManufacturingPlace` | `manufacturingCity` | BROAD | B B B C | B B B |
| `oec:hasEnergyEfficiency` | `roundTripEnergyEfficiencyFade` | NONE | - B - C | - - - |
| `oec:hasEnergyEfficiency` | `remainingRoundTripEfficiency` | NONE | - - B B | - - - |
| `oec:safeDisassemblyInstructions` | `dismantlingInformation` | CLOSE | C C C Nw | C - C |
| `oec:hasOperatorInformation` | `manufacturerContactDetails` | NONE | - - B - | - - - |
| `oec:hasMaterialComposition` | `detailedComposition` | BROAD | B C B E | B B B |
| `oec:hasRepairInstructions` | `dismantlingInformation` | CLOSE | C C C B | C C C |
| `oec:hasSubstancesOfConcern` | `hazardousSubstances` | BROAD | B B B C | C B B |
| `oec:bioBasedFraction` | `renewableContentShare` | CLOSE | C C E C | C Nw C |
| `oec:hazardImpact` | `batterySubstancesImpact` | CLOSE | C C B C | C C Nw |
| `eubat:batteryModelIdentifier` | `otherIdentificationElement` | NONE | - C - Nw | - - - |

## Einstimmig plus QA

| ours | EU-Element | Entscheidung | Stimmen | QA |
|---|---|---|---|---|
| `eubat:hasNominalVoltage` | `minimalVoltage` | NONE | - - - - | - - - |
| `eubat:safetyInstructionsForDismantling` | `safetyMeasures` | EXACT | E E E E | E E E |
| `eubat:hasTemperatureRangeStorage` | `notInUseTemperatureRange` | EXACT | E E E E | E E E |
| `eubat:hasDismantlingInstructions` | `dismantlingInformation` | EXACT | E E E E | E E E |
| `eubat:carbonFootprintDeclarationId` | `digitalProductPassportId` | NONE | - - - - | - - - |
| `eubat:hasMinimumVoltage` | `nominalVoltage` | NONE | - - - - | - - - |
| `eubat:safetyMeasures` | `wasteBatterySafetyInstructions` | EXACT | E E E E | E E E |
| `eubat:safetyMeasures` | `preparationForReuseFacilities` | NONE | - - - - | - - - |
| `eubat:expectedRemainingLifetimeMonths` | `expectedLifetimeYears` | NONE | - - - - | - - - |
| `eubat:expectedRemainingCycles` | `expectedLifetimeCycles` | NONE | - - - - | - - - |
| `eubat:hasInternalResistance` | `internalPackResistance` | EXACT | E E E E | E E E |
| `eubat:hasPowerCapabilityAt20SoC` | `powerCapability` | NARROW | Nw Nw Nw Nw | Nw Nw Nw |
| `eubat:hasPowerCapabilityAt20SoC` | `powerLimit` | NONE | - - - - | - - - |
| `eubat:hasPowerCapabilityAt80SoC` | `powerCapability` | NARROW | Nw Nw Nw Nw | Nw Nw Nw |
| `eubat:hasExpectedLifetime` | `expectedLifetimeYears` | EXACT | E E E E | E E E |
| `eubat:manufacturerIdentifier` | `uniqueProductIdentifier` | NONE | - - - - | - - - |
| `eubat:declarationOfConformity` | `euDeclarationOfConformity` | EXACT | E E E E | E E E |
| `eubat:repurposingPotential` | `batteryStatus` | NONE | - - - - | - - - |
| `eubat:hasInitialCapacity` | `ratedCapacity` | NONE | - - - - | - - - |
| `eubat:batteryModelIdentifier` | `batteryIdentification` | NARROW | Nw Nw Nw Nw | Nw Nw Nw |
| `eubat:electrolyteType` | `detailedComposition` | NARROW | Nw Nw Nw Nw | Nw Nw Nw |
| `eubat:resistanceIncreaseThreshold` | `internalResistanceIncrease` | NONE | - - - - | - - - |
| `eubat:roundTripEnergyEfficiency` | `remainingRoundTripEfficiency` | EXACT | E E E E | E E E |
| `eubat:nickelPostConsumerShare` | `renewableContentShare` | NONE | - - - - | - - - |
| `eubat:hasManufacturingPlace` | `manufacturingRegion` | BROAD | B B B B | B B B |
| `eubat:safetyInstructions` | `safetyMeasures` | EXACT | E E E E | E E E |
| `oec:hasEnergyEfficiency` | `initialRoundTripEnergyEfficiency` | BROAD | B B B B | - B B |
| `oec:hasEnergyEfficiency` | `roundTripEnergyEfficiency` | BROAD | B B B B | B - B |
| `oec:hasEnergyEfficiency` | `roundTripEfficiencyAtHalfCycleLife` | BROAD | B B B B | - B B |
| `oec:hasEnergyEfficiency` | `stateOfCertifiedEnergy` | NONE | - - - - | - - - |
| `oec:eprComplianceUrl` | `complianceTestReportResults` | NONE | - - - - | - - - |
| `oec:eprComplianceUrl` | `euDeclarationOfConformity` | NONE | - - - - | - - - |
| `oec:eprComplianceUrl` | `manufacturerWebsite` | NONE | - - - - | - - - |
| `oec:reportUrl` | `complianceTestReportResults` | NONE | - - - - | - - - |
| `oec:hasImpactIndicator` | `batterySubstancesImpact` | NONE | - - - - | - - - |
| `oec:hasDismantlingInstructions` | `dismantlingInformation` | EXACT | E E E E | E E E |
| `oec:documentUrl` | `manufacturerWebsite` | NONE | - - - - | - - - |
| `oec:value` | `binValue` | NONE | - - - - | - - - |
| `oec:elementId` | `uniqueProductIdentifier` | NONE | - - - - | - - - |
| `oec:concentration` | `criticalRawMaterials` | NONE | - - - - | - - - |
| `oec:hasDataElement` | `otherIdentificationElement` | NONE | - - - - | - - - |
| `oec:safeDisassemblyInstructions` | `safetyMeasures` | CLOSE | C C C C | C C - |
| `oec:professionalRepairNetwork` | `manufacturerWebsite` | NONE | - - - - | - - - |
| `oec:hasRecycledContentDetails` | `renewableContentShare` | NONE | - - - - | - - - |
| `oec:tradeItemPieceOf` | `uniqueProductIdentifier` | NONE | - - - - | - - - |
| `oec:hasPerformanceInfo` | `complianceTestReportResults` | NONE | - - - - | - - - |
| `oec:hasPerformanceInfo` | `remainingRoundTripEfficiency` | NONE | - - - - | - - - |
| `eusteel:heatNumber` | `batchNumber` | NONE | - - - - | - - - |
| `euelec:modelIdentifier` | `otherIdentificationElement` | NONE | - - - - | - - - |
| `euelec:componentPartNumber` | `productNumber` | NONE | - - - - | - - - |
| `eusteel:lotNumber` | `productNumber` | NONE | - - - - | - - - |
| `euelec:modelIdentifier` | `serialNumber` | NONE | - - - - | - - - |
| `eusteel:heatNumber` | `serialNumber` | NONE | - - - - | - - - |
| `eubat:hasDismantlingAndRemovalInformation` | `wasteBatterySafetyInstructions` | NONE | - - - - | - - - |
