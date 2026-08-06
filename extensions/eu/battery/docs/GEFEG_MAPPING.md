# GEFEG BatteryPass-Ready ↔ OpenEPCIS battery vocabulary mapping

How the OpenEPCIS battery vocabulary (`eubat:`, plus `gs1:` / `schema:` /
`oec:`) maps onto the GEFEG BatteryPass-Ready **upload** structure that the live
`ValidateJSON` server enforces.

- **Canonical mapping** lives in code: [`scripts/export-batterypass-gefeg.ts`](../../../../scripts/export-batterypass-gefeg.ts)
  (flat OpenEPCIS passport → GEFEG upload JSON).
- **Live-accurate target schemas**: [`validation/gefeg-live/`](../validation/gefeg-live/).
- **Discrepancy vs the published static schemas**: see [`CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md`](./CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md).
- **Per-attribute reporting level (model / batch / item) and how EPCIS events reconstruct the item passport**: see [`EPCIS_AND_BATTERYPASS_READY.md`](./EPCIS_AND_BATTERYPASS_READY.md) and the machine-readable [`../validation/batterypass-granularity.json`](../validation/batterypass-granularity.json).

## Envelope

GEFEG wraps everything in one per-category root key → `BatteryPass_Master`, split
into seven SAMM aspect groups. Root keys: `EV`, `LMT`, `OtherIndustrial2kWh`,
`StationaryIndustrial2kWh`.

## Shape conventions

| GEFEG shape | OpenEPCIS source | Note |
|---|---|---|
| Enumerations → `{ "<name>Value": v }` | controlled IRIs / strings | `dppStatusValue`="Active", `batteryCategoryValue`∈{electric vehicle battery, LMT battery, industrial battery}, `batteryStatusValues`="original" |
| Quantities → unit + value object | `gs1:QuantitativeValue` (`{value, unitCode}`) | e.g. `RatedCapacity`→`{amperehourMiliamperehourValue, ampereHourMiliamperehour}`; `BatteryMass`→`{gramKgValue, gramKg}`; CO₂→`{kgCO2-equivalentPerKilowattHourValue, …}` |
| Power at SoC → `{wattValueAt80SoC, wattValueAt20SoC, watt}` | `eubat:hasOriginalPowerCapability` (per-SoC) | integer/decimal ampere-hour variants differ in unit-key casing (live quirk) |

## Group → vocabulary (selected; full map in the exporter)

### IdentifiersAndProductData
| GEFEG attribute | OpenEPCIS term |
|---|---|
| `DPPSchemaVersion` / `DPPStatus` / `DPPGranularity` / `Date-timeOfLatestUpdateOfDPP` | `schema:schemaVersion` / `schema:status` / `oec:hasReportingGranularity` / `oec:lastUpdated` |
| `UniqueBatteryPassportIdentifierUniqueDPPIdentifier` / `UniqueBatteryIdentifierUniqueProductIdentifier` | `oec:` passport id / GS1 Digital Link |
| `BatteryModelIdentifier` / `BatterySerialNumber` | `eubat:batteryModelIdentifier` / `gs1:hasSerialNumber` |
| `UniqueEconomicOperatorIdentifier` / `UniqueManufacturerIdentifier` / `UniqueFacilityIdentifier` | `eubat:operatorIdentifier` / `eubat:manufacturerIdentifier` / `eubat:facilityIdentifier` |
| `EconomicOperatorInformation` / `ManufacturerInformation` | `oec:hasOperatorInformation` / `gs1:manufacturer` (name, registeredTradeName…, postalAddress) |
| `ManufacturingPlace` / `ManufacturingDate` / `DateOfPuttingTheBatteryIntoService` / `WarrantyPeriodOfTheBattery` | `eubat:hasManufacturingPlace` / `eubat:manufacturingDate` / `eubat:puttingIntoService` / warranty |
| `BatteryCategory` / `BatteryMass` / `BatteryStatus` | `schema:category` / `eubat:hasBatteryMass` (`gs1:netWeight`) / `schema:status` |

### PerformanceAndDurability
`RatedCapacity`→`eubat:hasRatedCapacity`; `RemainingCapacity`→`eubat:hasRemainingCapacity`;
`Minimum/Maximum/NominalVoltage`→`eubat:{minimum,maximum,nominal}Voltage`;
`OriginalPowerCapability`/`RemainingPowerCapability`→`eubat:hasOriginalPowerCapability` (per-SoC);
**`MaximumPermittedBatteryPower`→`eubat:hasMaximumPermittedBatteryPower`** (new);
`CapacityFade`/`PowerFade`/`EnergyRoundTripEfficiencyFade`→`eubat:hasCapacityFade`/`powerFade`/`roundTripEfficiencyFade`;
`StateOfChargeSoC`/`StateOfCertifiedEnergySOCE`→`eubat:hasStateOfCharge`/`stateOfCertifiedEnergy`;
`Initial/Remaining RoundTripEnergyEfficiency`→`eubat:roundTripEfficiency`/`remainingRoundTripEfficiency`;
`Initial Self-discharge`/`EvolutionOfSelf-dischargeRates`→`eubat:hasSelfDischargeRate`/`evolutionOfSelfDischarge`;
`InitialInternalResistance…`/`InternalResistanceIncrease…`→`eubat:hasInternalResistance`/`internalResistanceIncrease`;
`ExpectedLifetimeInCalendarYears`/`ExpectedLifetime-NumberOfChargeOrDischargeCycles`/`NumberOfFullChargingAndDischargingCycles`→`eubat:expectedLifetimeYears`/`expectedNumberOfCycles`/`numberOfFullCycles`;
`EnergyThroughput`/`CapacityThroughput`→`eubat:hasEnergyThroughput`/`capacityThroughput`;
`TemperatureInformation`/`TemperatureRangeIdleState{Lower,Upper}Boundary`→`eubat:` temperature range;
**`TimeSpentInExtremeTemperatures{Above,Below}Boundary`, `TimeSpentChargingDuringExtremeTemperatures{Above,Below}Boundary`→`eubat:timeSpent…`** (new);
`NumberOfDeepDischargeEvents`→`eubat:` deep-discharge counter; `InformationOnAccidents`→accident note.

### BatteryCarbonFootprint
`BatteryCarbonFootprintPerFunctionalUnit` + four `ContributionOf…LifecycleStage` →
`eubat:hasCarbonFootprintTotal` + lifecycle-stage values; `CarbonFootprintPerformanceClass`→`eubat:hasCarbonFootprintPerformanceClass` (A–E); `WebLinkToPublicCarbonFootprintStudy`→study URL.

### BatteryMaterialsAndComposition
`BatteryChemistry`→`eubat:hasBatteryChemistry` (`{CustomChemicalCodes}`); `CriticalRawMaterials`, `HazardousSubstances`, `MaterialsUsedInCathodeAnodeAndElectrolyte`, `ImpactOfSubstances…`→`eubat:hasMaterialComposition` / `hazardousSubstances` summaries.

### CircularityAndResourceEfficiency
`{Pre,Post}-consumerRecycled{Nickel,Cobalt,Lithium}Share`, `RecycledLeadShare`, `RenewableContentShare`→`eubat:hasRecycledContent`;
`DismantlingInformation-Manuals…`, `PartNumbersForComponents`, `InformationOnSourcesOfSpareParts`, `SafetyMeasures`, end-user info →`eubat:hasEndOfLifeInfo` / `sparePartSources`.

### SupplyChainDueDiligence
`InformationOfDueDiligenceReport`, `ThirdPartyAssurancesOfRecognisedSchemes`, `SupplyChainIndices`→`eubat:hasSupplyChainDueDiligence`.

### SymbolsLabelsAndDocumentationOfConformity
`SeparateCollectionSymbol`, `SymbolsForCadmiumAndLead`, `CarbonFootprintLabel`, `ExtinguishingAgent`, `MeaningOfLabelsAndSymbols`, `EUDeclarationOfConformity`, `ResultsOfTestReportsProvingCompliance`→`eubat:hasLabels` / `euDeclarationOfConformity` / test-report refs.

## Newly minted `eubat:` terms (this integration)

Added to `ontology/battery.ttl` because the live GEFEG validator requires them and
no GS1/upstream term covers them:

- `eubat:hasMaximumPermittedBatteryPower`
- `eubat:timeSpentInExtremeTemperaturesAboveBoundary`
- `eubat:timeSpentInExtremeTemperaturesBelowBoundary`
- `eubat:timeSpentChargingDuringExtremeTemperaturesAboveBoundary`
- `eubat:timeSpentChargingDuringExtremeTemperaturesBelowBoundary`
