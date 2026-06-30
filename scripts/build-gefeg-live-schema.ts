/**
 * Derive live-accurate GEFEG BatteryPass-Ready validation schemas.
 *
 * WHY: the schema files GEFEG publishes for download
 * (docs/reference/gefeg-batterypass-ready/*.json) do NOT match what the live
 * `ValidateJSON` server enforces — they declare no `required`, use a wrong root
 * key for Stationary ("Industrial2kWh" vs the live "StationaryIndustrial2kWh"),
 * and differ in attribute key names. This generator produces corrected schemas
 * that reflect the LIVE server, derived from two sources we control:
 *   1. the per-category required-sets discovered by probing the live API with
 *      empty groups (encoded below as REQUIRED), and
 *   2. the value-object / enum shapes taken from the verified-valid fixtures in
 *      examples/batterypass-ready/<category>.gefeg.json (which pass the live API).
 *
 * Output: extensions/eu/battery/validation/gefeg-live/<RootKey>.schema.json
 *
 * Usage: pnpm run build:gefeg-live-schema   (or tsx scripts/build-gefeg-live-schema.ts)
 *
 * Re-derive the REQUIRED sets any time with:
 *   tsx scripts/probe-gefeg-required.ts      (see that script; needs a token)
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FIX = join(ROOT, "extensions/eu/battery/examples/batterypass-ready");
const OUT = join(ROOT, "extensions/eu/battery/validation/gefeg-live");

type Obj = Record<string, any>;

const CATEGORIES = [
  { param: "ev", rootKey: "EV", tag: "EV_BatteryPass" },
  { param: "lmt", rootKey: "LMT", tag: "LMT_BatteryPass" },
  { param: "other-industrial", rootKey: "OtherIndustrial2kWh", tag: "Other_Industrial_BatteryPass" },
  { param: "stationary", rootKey: "StationaryIndustrial2kWh", tag: "Stationary_Industrial_BatteryPass" },
] as const;

// Required-property sets enforced by the LIVE server, per category, per group.
// Captured 2026-06-17 by validating an empty-groups document against each tag.
const IDENT_BASE = [
  "DPPSchemaVersion", "DPPStatus", "DPPGranularity", "Date-timeOfLatestUpdateOfDPP",
  "BatteryModelIdentifier", "UniqueBatteryPassportIdentifierUniqueDPPIdentifier",
  "UniqueBatteryIdentifierUniqueProductIdentifier", "BatterySerialNumber",
  "UniqueEconomicOperatorIdentifier", "UniqueManufacturerIdentifier", "UniqueFacilityIdentifier",
  "EconomicOperatorInformation", "ManufacturerInformation", "ManufacturingPlace",
  "ManufacturingDate", "WarrantyPeriodOfTheBattery", "BatteryCategory", "BatteryMass", "BatteryStatus",
];
const IDENT_WITH_SERVICE = [...IDENT_BASE.slice(0, 15), "DateOfPuttingTheBatteryIntoService", ...IDENT_BASE.slice(15)];

const PERF_OTHER = [
  "RatedCapacity", "CapacityFade", "StateOfChargeSoC", "MinimumVoltage", "MaximumVoltage", "NominalVoltage",
  "OriginalPowerCapability", "PowerFade", "MaximumPermittedBatteryPower", "InitialRoundTripEnergyEfficiency",
  "RoundTripEnergyEfficiencyAt50OfCycleLife", "EnergyRoundTripEfficiencyFade",
  "InitialInternalResistanceOfBatteryCellAndPackModuleRecommended",
  "InternalResistanceIncreaseOfPackCellAndModuleRecommended", "ExpectedLifetimeInCalendarYears",
  "ExpectedLifetime-NumberOfChargeOrDischargeCycles", "NumberOfFullChargingAndDischargingCycles",
  "Cycle-lifeReferenceTest", "C-rateOfRelevantCycle-lifeTest", "TemperatureInformation",
  "TemperatureRangeIdleStateLowerBoundary", "TemperatureRangeIdleStateUpperBoundary", "InformationOnAccidents",
];
const PERF_EV = [...PERF_OTHER.slice(0, 2), "StateOfCertifiedEnergySOCE", ...PERF_OTHER.slice(2)];
const PERF_LMT_STATIONARY = [
  "RatedCapacity", "RemainingCapacity", "CapacityFade", "StateOfChargeSoC", "MinimumVoltage", "MaximumVoltage",
  "NominalVoltage", "OriginalPowerCapability", "RemainingPowerCapability", "PowerFade",
  "MaximumPermittedBatteryPower", "InitialRoundTripEnergyEfficiency", "RoundTripEnergyEfficiencyAt50OfCycleLife",
  "RemainingRoundTripEnergyEfficiency", "EnergyRoundTripEfficiencyFade", "EvolutionOfSelf-dischargeRates",
  "InitialInternalResistanceOfBatteryCellAndPackModuleRecommended",
  "InternalResistanceIncreaseOfPackCellAndModuleRecommended", "ExpectedLifetimeInCalendarYears",
  "ExpectedLifetime-NumberOfChargeOrDischargeCycles", "NumberOfFullChargingAndDischargingCycles",
  "Cycle-lifeReferenceTest", "C-rateOfRelevantCycle-lifeTest", "EnergyThroughput", "CapacityThroughput",
  "TemperatureInformation", "TemperatureRangeIdleStateLowerBoundary", "TemperatureRangeIdleStateUpperBoundary",
  "TimeSpentInExtremeTemperaturesAboveBoundary", "TimeSpentInExtremeTemperaturesBelowBoundary",
  "TimeSpentChargingDuringExtremeTemperaturesAboveBoundary", "TimeSpentChargingDuringExtremeTemperaturesBelowBoundary",
  "NumberOfDeepDischargeEvents", "InformationOnAccidents",
];
const CIRC = [
  "DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack", "PartNumbersForComponents",
  "InformationOnSourcesOfSpareParts", "SafetyMeasures", "Pre-consumerRecycledNickelShare",
  "Pre-consumerRecycledCobaltShare", "Pre-consumerRecycledLithiumShare", "Post-consumerRecycledNickelShare",
  "Post-consumerRecycledCobaltShare", "Post-consumerRecycledLithiumShare", "RecycledLeadShare",
  "RenewableContentShare", "InformationOnTheRoleOfEnd-usersInContributingToWastePrevention",
  "InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries",
  "InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife",
];
const MATERIALS = ["BatteryChemistry", "CriticalRawMaterials", "HazardousSubstances", "MaterialsUsedInCathodeAnodeAndElectrolyte", "ImpactOfSubstancesOnEnvironmentHumanHealthSafetyPersons"];
const CARBON = ["BatteryCarbonFootprintPerFunctionalUnit", "ContributionOfRawMaterialAcquisitionAndPre-processingLifecycleStage", "ContributionOfMainProductProductionLifecycleStage", "ContributionOfDistributionLifecycleStage", "ContributionOfEndOfLifeAndRecyclingLifecycleStage", "CarbonFootprintPerformanceClass", "WebLinkToPublicCarbonFootprintStudy"];
const SCDD = ["InformationOfDueDiligenceReport"];
const SYMBOLS = ["SeparateCollectionSymbol", "SymbolsForCadmiumAndLead", "CarbonFootprintLabel", "ExtinguishingAgent", "MeaningOfLabelsAndSymbols", "EUDeclarationOfConformity", "ResultsOfTestReportsProvingCompliance"];

function requiredFor(param: string) {
  const ident = param === "lmt" || param === "stationary" ? IDENT_WITH_SERVICE : IDENT_BASE;
  const perf = param === "ev" ? PERF_EV : param === "other-industrial" ? PERF_OTHER : PERF_LMT_STATIONARY;
  return {
    IdentifiersAndProductData: ident,
    PerformanceAndDurability: perf,
    CircularityAndResourceEfficiency: CIRC,
    BatteryMaterialsAndComposition: MATERIALS,
    BatteryCarbonFootprint: CARBON,
    SupplyChainDueDiligence: SCDD,
    SymbolsLabelsAndDocumentationOfConformity: SYMBOLS,
  } as Record<string, string[]>;
}

// Infer a JSON-Schema fragment from a value taken from a verified-valid fixture.
// Objects (unit/enum wrappers) get their observed keys as required properties.
function inferSchema(value: any): Obj {
  if (Array.isArray(value)) return { type: "array" };
  if (value && typeof value === "object") {
    const properties: Obj = {};
    for (const [k, v] of Object.entries(value)) properties[k] = inferSchema(v);
    return { type: "object", properties, required: Object.keys(value) };
  }
  if (typeof value === "number") return { type: Number.isInteger(value) ? "integer" : "number" };
  if (typeof value === "boolean") return { type: "boolean" };
  return { type: "string" };
}

// CONVERGENCE (2026-06-23 GEFEG v1.0 update, verified against the live
// ValidateJSON server 2026-06-30): the published static schemas now MATCH the
// live server — single "Battery_Passport" root for every category, with the
// required / format / enum constraints the live server enforces. The bespoke
// "derive from probed required-sets + fixtures" path (the inferSchema/REQUIRED
// machinery above) is therefore obsolete; the live-derived schemas are now exact
// mirrors of the published static schemas, one per harness root-key filename.
const STATIC_DIR = join(ROOT, "extensions/eu/battery/docs/reference/gefeg-batterypass-ready");
const STATIC_FILE: Record<string, string> = {
  EV: "EV_batterypass_1.0.json",
  LMT: "LMT_batterypass_1.0.json",
  OtherIndustrial2kWh: "Other_Industrial_batterypass_1.0.json",
  StationaryIndustrial2kWh: "Stationary_Industrial_batterypass_1.0.json",
};

mkdirSync(OUT, { recursive: true });
for (const c of CATEGORIES) {
  const schema = JSON.parse(readFileSync(join(STATIC_DIR, STATIC_FILE[c.rootKey]), "utf-8")) as Obj;
  const path = join(OUT, `${c.rootKey}.schema.json`);
  writeFileSync(path, JSON.stringify(schema, null, 2) + "\n");
  console.log(`Wrote ${path} (mirror of published static ${STATIC_FILE[c.rootKey]}; live-verified 2026-06-30)`);
}
