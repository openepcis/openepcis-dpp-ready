# GEFEG BatteryPass-Ready ↔ OpenEPCIS battery vocabulary mapping

How the OpenEPCIS battery vocabulary (`battery:`, plus `gs1:` / `schema:` /
`dpp:`) maps onto the GEFEG BatteryPass-Ready **upload** structure that the live
`ValidateJSON` server enforces.

- **Canonical mapping** lives in code: [`scripts/export-batterypass-gefeg.ts`](../../../../scripts/export-batterypass-gefeg.ts)
  (flat OpenEPCIS passport → GEFEG upload JSON).
- **Live-accurate target schemas**: [`validation/gefeg-live/`](../validation/gefeg-live/).
- **Discrepancy vs the published static schemas**: see [`CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md`](./CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md).

## Envelope

GEFEG wraps everything in one per-category root key → `BatteryPass_Master`, split
into seven SAMM aspect groups. Root keys: `EV`, `LMT`, `OtherIndustrial2kWh`,
`StationaryIndustrial2kWh`.

## Shape conventions

| GEFEG shape | OpenEPCIS source | Note |
|---|---|---|
| Enumerations → `{ "<name>Value": v }` | controlled IRIs / strings | `dppStatusValue`="Active", `batteryCategoryValue`∈{electric vehicle battery, LMT battery, industrial battery}, `batteryStatusValues`="original" |
| Quantities → unit + value object | `gs1:QuantitativeValue` (`{value, unitCode}`) | e.g. `RatedCapacity`→`{amperehourMiliamperehourValue, ampereHourMiliamperehour}`; `BatteryMass`→`{gramKgValue, gramKg}`; CO₂→`{kgCO2-equivalentPerKilowattHourValue, …}` |
| Power at SoC → `{wattValueAt80SoC, wattValueAt20SoC, watt}` | `battery:originalPowerCapability` (per-SoC) | integer/decimal ampere-hour variants differ in unit-key casing (live quirk) |

## Group → vocabulary (selected; full map in the exporter)

### IdentifiersAndProductData
| GEFEG attribute | OpenEPCIS term |
|---|---|
| `DPPSchemaVersion` / `DPPStatus` / `DPPGranularity` / `Date-timeOfLatestUpdateOfDPP` | `schema:schemaVersion` / `schema:status` / `dpp:reportingGranularity` / `dpp:lastUpdated` |
| `UniqueBatteryPassportIdentifierUniqueDPPIdentifier` / `UniqueBatteryIdentifierUniqueProductIdentifier` | `dpp:` passport id / GS1 Digital Link |
| `BatteryModelIdentifier` / `BatterySerialNumber` | `battery:batteryModelIdentifier` / `gs1:hasSerialNumber` |
| `UniqueEconomicOperatorIdentifier` / `UniqueManufacturerIdentifier` / `UniqueFacilityIdentifier` | `battery:operatorIdentifier` / `battery:manufacturerIdentifier` / `battery:facilityIdentifier` |
| `EconomicOperatorInformation` / `ManufacturerInformation` | `dpp:operatorInformation` / `gs1:manufacturer` (name, registeredTradeName…, postalAddress) |
| `ManufacturingPlace` / `ManufacturingDate` / `DateOfPuttingTheBatteryIntoService` / `WarrantyPeriodOfTheBattery` | `battery:manufacturingPlace` / `battery:manufacturingDate` / `battery:puttingIntoService` / warranty |
| `BatteryCategory` / `BatteryMass` / `BatteryStatus` | `schema:category` / `battery:batteryMass` (`gs1:netWeight`) / `schema:status` |

### PerformanceAndDurability
`RatedCapacity`→`battery:ratedCapacity`; `RemainingCapacity`→`battery:remainingCapacity`;
`Minimum/Maximum/NominalVoltage`→`battery:{minimum,maximum,nominal}Voltage`;
`OriginalPowerCapability`/`RemainingPowerCapability`→`battery:originalPowerCapability` (per-SoC);
**`MaximumPermittedBatteryPower`→`battery:maximumPermittedBatteryPower`** (new);
`CapacityFade`/`PowerFade`/`EnergyRoundTripEfficiencyFade`→`battery:capacityFade`/`powerFade`/`roundTripEfficiencyFade`;
`StateOfChargeSoC`/`StateOfCertifiedEnergySOCE`→`battery:stateOfCharge`/`stateOfCertifiedEnergy`;
`Initial/Remaining RoundTripEnergyEfficiency`→`battery:roundTripEfficiency`/`remainingRoundTripEfficiency`;
`Initial Self-discharge`/`EvolutionOfSelf-dischargeRates`→`battery:selfDischargeRate`/`evolutionOfSelfDischarge`;
`InitialInternalResistance…`/`InternalResistanceIncrease…`→`battery:internalResistance`/`internalResistanceIncrease`;
`ExpectedLifetimeInCalendarYears`/`ExpectedLifetime-NumberOfChargeOrDischargeCycles`/`NumberOfFullChargingAndDischargingCycles`→`battery:expectedLifetimeYears`/`expectedNumberOfCycles`/`numberOfFullCycles`;
`EnergyThroughput`/`CapacityThroughput`→`battery:energyThroughput`/`capacityThroughput`;
`TemperatureInformation`/`TemperatureRangeIdleState{Lower,Upper}Boundary`→`battery:` temperature range;
**`TimeSpentInExtremeTemperatures{Above,Below}Boundary`, `TimeSpentChargingDuringExtremeTemperatures{Above,Below}Boundary`→`battery:timeSpent…`** (new);
`NumberOfDeepDischargeEvents`→`battery:` deep-discharge counter; `InformationOnAccidents`→accident note.

### BatteryCarbonFootprint
`BatteryCarbonFootprintPerFunctionalUnit` + four `ContributionOf…LifecycleStage` →
`battery:carbonFootprintTotal` + lifecycle-stage values; `CarbonFootprintPerformanceClass`→`battery:carbonFootprintPerformanceClass` (A–E); `WebLinkToPublicCarbonFootprintStudy`→study URL.

### BatteryMaterialsAndComposition
`BatteryChemistry`→`battery:batteryChemistry` (`{CustomChemicalCodes}`); `CriticalRawMaterials`, `HazardousSubstances`, `MaterialsUsedInCathodeAnodeAndElectrolyte`, `ImpactOfSubstances…`→`battery:materialComposition` / `hazardousSubstances` summaries.

### CircularityAndResourceEfficiency
`{Pre,Post}-consumerRecycled{Nickel,Cobalt,Lithium}Share`, `RecycledLeadShare`, `RenewableContentShare`→`battery:recycledContent`;
`DismantlingInformation-Manuals…`, `PartNumbersForComponents`, `InformationOnSourcesOfSpareParts`, `SafetyMeasures`, end-user info →`battery:endOfLifeInfo` / `sparePartSources`.

### SupplyChainDueDiligence
`InformationOfDueDiligenceReport`, `ThirdPartyAssurancesOfRecognisedSchemes`, `SupplyChainIndices`→`battery:supplyChainDueDiligence`.

### SymbolsLabelsAndDocumentationOfConformity
`SeparateCollectionSymbol`, `SymbolsForCadmiumAndLead`, `CarbonFootprintLabel`, `ExtinguishingAgent`, `MeaningOfLabelsAndSymbols`, `EUDeclarationOfConformity`, `ResultsOfTestReportsProvingCompliance`→`battery:labels` / `euDeclarationOfConformity` / test-report refs.

## Newly minted `battery:` terms (this integration)

Added to `ontology/battery.ttl` because the live GEFEG validator requires them and
no GS1/upstream term covers them:

- `battery:maximumPermittedBatteryPower`
- `battery:timeSpentInExtremeTemperaturesAboveBoundary`
- `battery:timeSpentInExtremeTemperaturesBelowBoundary`
- `battery:timeSpentChargingDuringExtremeTemperaturesAboveBoundary`
- `battery:timeSpentChargingDuringExtremeTemperaturesBelowBoundary`
