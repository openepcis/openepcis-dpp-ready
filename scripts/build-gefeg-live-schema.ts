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

function build(param: string, rootKey: string): Obj {
  const fixture = JSON.parse(readFileSync(join(FIX, `${param}.gefeg.json`), "utf-8")) as Obj;
  const master = fixture[rootKey] as Obj;
  const req = requiredFor(param);

  const groups: Obj = {};
  for (const [group, required] of Object.entries(req)) {
    const present = (master[group] ?? {}) as Obj;
    const properties: Obj = {};
    // union of required names and whatever the fixture demonstrates
    const names = new Set<string>([...required, ...Object.keys(present)]);
    for (const name of names) {
      properties[name] = name in present ? inferSchema(present[name]) : { description: "required by live server; shape not demonstrated by the reference fixture" };
    }
    groups[group] = { type: "object", properties, required };
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://ref.openepcis.io/extensions/eu/battery/validation/gefeg-live/${rootKey}.schema.json`,
    title: `GEFEG BatteryPass-Ready ${rootKey} (live-derived)`,
    description:
      "Live-accurate schema derived from the GEFEG ValidateJSON server (retrieved 2026-06-17) — required-sets from empty-group probing, shapes from verified-valid fixtures. The downloadable GEFEG static schema for this category does NOT match the server; use this. Generator: scripts/build-gefeg-live-schema.ts.",
    type: "object",
    required: [rootKey],
    properties: {
      [rootKey]: {
        type: "object",
        required: Object.keys(groups),
        properties: groups,
      },
    },
  };
}

mkdirSync(OUT, { recursive: true });
for (const c of CATEGORIES) {
  const schema = build(c.param, c.rootKey);
  const path = join(OUT, `${c.rootKey}.schema.json`);
  writeFileSync(path, JSON.stringify(schema, null, 2) + "\n");
  const groupReq = Object.values(requiredFor(c.param)).reduce((n, a) => n + a.length, 0);
  console.log(`Wrote ${path} (root ${c.rootKey}, ${groupReq} required leaves)`);
}
