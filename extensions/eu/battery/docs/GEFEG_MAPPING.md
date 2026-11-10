# GEFEG BatteryPass-Ready ↔ OpenEPCIS battery vocabulary mapping

> **Data model 1.0 (longlist v1.3), the older state.** The current BatteryPass-Ready data model is
> 2.0.1: its mapping is the crosswalk profile `batterypass`
> ([`mappings.ttl`](../../../common/interop/crosswalk/batterypass/mappings.ttl), one row per data
> element, round-trip tested; gaps in the
> [crosswalk README](../../../common/interop/crosswalk/README.md#the-batterypass-ready-201-profile)),
> and `pnpm run export:batterypass-ready` writes the 2.0.1 document. This page describes the 1.0
> upload shape the GEFEG test environment validated, which `export-batterypass-gefeg.ts` still writes.

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
| Power at SoC → `{wattValueAt80SoC, wattValueAt20SoC, watt}` | `eubat:PowerCapability` results per state of charge | integer/decimal ampere-hour variants differ in unit-key casing (live quirk) |

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
Since 0.13.0 the measured and tested values are results of an assessment (common/assessment): the
names below are the `eubat:` performance parameters a result observes, in the battery state
(`eubat:hasBatteryState`, dynamic) or in the performance test on the technical specification
(`eubat:hasPerformanceTest`, static). Rated values stay properties.

`RatedCapacity`→`eubat:hasRatedCapacity`; `RemainingCapacity`→state result `eubat:RemainingCapacity`;
`Minimum/Maximum/NominalVoltage`→`eubat:{minimum,maximum,nominal}Voltage`;
`OriginalPowerCapability`/`RemainingPowerCapability`→`eubat:PowerCapability` results of a sub-assessment per state of charge (test / state);
**`MaximumPermittedBatteryPower`→`eubat:hasMaximumPermittedBatteryPower`** (new);
`CapacityFade`/`PowerFade`/`EnergyRoundTripEfficiencyFade`→state results `eubat:CapacityFade`/`PowerFade`/`RoundTripEfficiencyFade`;
`StateOfChargeSoC`/`StateOfCertifiedEnergySOCE`→state results `eubat:StateOfCharge`/`StateOfCertifiedEnergy`;
`Initial/Remaining RoundTripEnergyEfficiency`→test result `eubat:InitialRoundTripEfficiency` / state result `eubat:RemainingRoundTripEfficiency`;
`Initial Self-discharge`/`EvolutionOfSelf-dischargeRates`→test result `eubat:InitialSelfDischargeRate` / state result `eubat:SelfDischargeEvolution`;
`InitialInternalResistance…`/`InternalResistanceIncrease…`→test results `eubat:InitialCellInternalResistance`, `eubat:InitialPackInternalResistance` / state result `eubat:InternalResistanceIncrease`;
`ExpectedLifetimeInCalendarYears`/`ExpectedLifetime-NumberOfChargeOrDischargeCycles`/`NumberOfFullChargingAndDischargingCycles`→`eubat:hasExpectedLifetime` / test result `eubat:CycleLife` / state result `eubat:FullCycleCount`;
`EnergyThroughput`/`CapacityThroughput`→state results `eubat:EnergyThroughput`/`CapacityThroughput`;
`TemperatureInformation`/`TemperatureRangeIdleState{Lower,Upper}Boundary`→`eubat:` temperature range;
**`TimeSpentInExtremeTemperatures{Above,Below}Boundary`, `TimeSpentChargingDuringExtremeTemperatures{Above,Below}Boundary`→state results `eubat:TimeAboveTemperatureBoundary` …**;
`NumberOfDeepDischargeEvents`→state result `eubat:DeepDischargeEvents`; `InformationOnAccidents`→accident note.

### BatteryCarbonFootprint
`BatteryCarbonFootprintPerFunctionalUnit` + four `ContributionOf…LifecycleStage` →
`eubat:hasCarbonFootprintTotal` + lifecycle-stage values; `CarbonFootprintPerformanceClass`→indicator of kind `eubat:CarbonFootprintPerformanceClass` (A–E); `WebLinkToPublicCarbonFootprintStudy`→study URL.

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
- the four time-in-extreme-temperature values, minted as flat properties and since 0.13.0 the
  performance parameters `eubat:TimeAboveTemperatureBoundary`, `eubat:TimeBelowTemperatureBoundary`,
  `eubat:ChargingTimeAboveTemperatureBoundary`, `eubat:ChargingTimeBelowTemperatureBoundary`
