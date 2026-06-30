/**
 * Export an OpenEPCIS flat battery passport into the GEFEG BatteryPass-Ready
 * upload-file shape, so it can be validated by the GEFEG test environment's
 * "Product Passport Data Validation" module
 * (https://batterypass-ready.gefeg.com/, Build 0.1.1).
 *
 * The GEFEG validation schemas (committed under
 * extensions/eu/battery/docs/reference/gefeg-batterypass-ready/) are NOT the
 * flat camelCase shape our other artifacts use. They are a SAMM-grouped
 * structure with a single per-category root key wrapping `BatteryPass_Master`,
 * seven aspect groups, verbose PascalCase attribute names, and quantities
 * carried as unit+value objects (e.g. { ampereHourValueDecimal, ampereHourMiliamperehour }).
 *
 * In the v1.0 schema export all four category schemas are identical except for
 * that root key, and none declare `required`/`additionalProperties:false`
 * (validation is lenient). This exporter therefore maps the attributes we hold
 * data for into the correct group/name/unit-object slots; unmapped attributes
 * are simply omitted. It logs how many GEFEG leaf attributes it populated so
 * coverage is never silently capped.
 *
 * Usage:
 *   tsx scripts/export-batterypass-gefeg.ts <source.json> <category> [out.json]
 *   category ∈ ev | lmt | other-industrial | stationary
 */

import { readFileSync, writeFileSync } from "fs";

// ---- category → root wrapper key (per the LIVE schema; the static Stationary
// file mislabels its root as "Industrial2kWh").
const ROOT_KEY: Record<string, string> = {
  ev: "EV",
  lmt: "LMT",
  "other-industrial": "OtherIndustrial2kWh",
  stationary: "StationaryIndustrial2kWh",
};

// ---- unit-code translation: OpenEPCIS UN/CEFACT codes → GEFEG unit enums
function ahUnit(unitCode?: string) {
  return unitCode === "4O" || unitCode === "MAH" ? "mAh" : "Ah";
}

type Q = Record<string, unknown>;
let populated = 0;
function set(group: Q, key: string, value: unknown): void {
  if (value === undefined || value === null) return;
  group[key] = value;
  populated++;
}

// ---- value-object builders. Key names follow what the LIVE GEFEG validator
// requires (discovered via scripts/validate-batterypass-live.ts), which differs
// from the static mirrored schema. Where the required value-key was ambiguous we
// emit both candidates; extra keys are ignored by the validator.
// NB: GEFEG's integer and decimal ampere-hour variants disagree on the unit-key
// casing. Integer (RatedCapacity, RemainingCapacity) → "ampereHourMiliamperehour"
// (capital H); decimal (CapacityThroughput) → "amperehourMiliamperehour".
const ampereHour = (v?: { value?: number; unitCode?: string }) =>
  v?.value === undefined
    ? undefined
    : { amperehourMiliamperehourValue: v.value, ampereHourMiliamperehour: ahUnit(v.unitCode) };
const ahInt = (n?: number) =>
  n === undefined || n === null ? undefined : { amperehourMiliamperehourValue: n, ampereHourMiliamperehour: "Ah" };
const volt = (v?: { value?: number }) =>
  v?.value === undefined ? undefined : { voltValue: v.value, volt: "V" };
const kg = (v?: { value?: number }) =>
  v?.value === undefined ? undefined : { gramKgValue: v.value, gramKg: "kg" };
const watt = (v?: number) =>
  v === undefined || v === null ? undefined : { wattValue: v, watt: "W" };
const ohm = (v?: number) =>
  v === undefined || v === null ? undefined : { ohmValue: Math.round(v), ohm: "Ohm" };
// power capability is reported at 80% and 20% state of charge
const powerAtSoC = (arr?: Q[]) => {
  if (!Array.isArray(arr)) return undefined;
  const at = (soc: number) => {
    const e = arr.find((x) => x.stateOfChargeLevel === soc);
    const p = (e?.powerCapability as Q)?.value as number | undefined;
    if (p === undefined) return undefined;
    return ((e?.powerCapability as Q)?.unitCode === "KWT" ? p * 1000 : p);
  };
  const v80 = at(80);
  const v20 = at(20);
  if (v80 === undefined && v20 === undefined) return undefined;
  return { wattValueAt80SoC: v80, wattValueAt20SoC: v20, watt: "W" };
};
const percent = (v?: number) =>
  v === undefined || v === null ? undefined : { percentageValue: v, percent: "%" };
const percentMonth = (v?: number) =>
  v === undefined || v === null ? undefined : { percentMonthValue: v, percentMonth: "%/month" };
const celsius = (v?: number) =>
  v === undefined || v === null ? undefined : { celsiusValue: v, degreeCelsius: "°C" };
const co2PerKwh = (v?: { value?: number } | number) => {
  const n = typeof v === "number" ? v : v?.value;
  return n === undefined
    ? undefined
    : { "kgCO2-equivalentPerKilowattHourValue": n, "kgCO2-equivalentPerKilowattHour": "kgCO2-eq/kWh" };
};
const aPerAh = (v?: number) =>
  v === undefined || v === null ? undefined : { amperePerAmpereHourValue: v, amperePerAmpereHour: "A/Ah" };
const kwh = (v?: number) =>
  v === undefined || v === null ? undefined : { kilowattHourValue: v, kilowattHour: "kWh" };
const ahDec = (v?: number) =>
  v === undefined || v === null ? undefined : { amperehourMiliamperehourValue: v, amperehourMiliamperehour: "Ah" };

// ---- enumerations are objects with a single `<name>Value` property
const enumVal = (valueKey: string, value?: string) =>
  value === undefined ? undefined : { [valueKey]: value };

// take the last path segment of an IRI value (…/IndustrialBattery -> IndustrialBattery)
const tail = (iri?: string) => (typeof iri === "string" ? iri.split("/").pop() : undefined);

// batteryCategoryValue enum phrases (from the GEFEG valid sample, e.g.
// EV → "electric vehicle battery").
const CATEGORY_KEY: Record<string, string> = {
  IndustrialBattery: "industrial battery",
  StationaryBattery: "stationary battery",
  EVBattery: "electric vehicle battery",
  LMTBattery: "light means of transport battery",
};
// When exporting AS a target category, the batteryCategoryValue must match that
// category's enum (not the source product's category).
// "battery category codes" enum (from the data-model PDF): only three codes —
// "LMT battery", "electric vehicle battery", "industrial battery". Stationary
// is an industrial battery.
const CATEGORY_VALUE_BY_PARAM: Record<string, string> = {
  ev: "electric vehicle battery",
  lmt: "LMT battery",
  "other-industrial": "industrial battery",
  stationary: "industrial battery",
};
const STATUS_KEY: Record<string, string> = {
  Original: "original",
  Repurposed: "repurposed",
  Reused: "re-used",
  Remanufactured: "remanufactured",
  Waste: "waste",
};
// cathode active material → BatteryPass CustomChemicalCodes enum
const CHEMISTRY_KEY: Record<string, string> = {
  LiFePO4: "Li-ion LFP",
  "LiNiMnCoO2": "Li-ion NMC",
  NMC: "Li-ion NMC",
  NCA: "Li-ion NCA",
  LCO: "Li-ion LCO",
  LMO: "Li-ion LMO",
};
const CF_CLASS: Record<string, string> = {
  CFClassA: "A",
  CFClassB: "B",
  CFClassC: "C",
  CFClassD: "D",
  CFClassE: "E",
};

// organizationName may be a plain string or a multilingual array [{value,language}]
function asText(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length) {
    const first = v[0] as Q;
    return typeof first?.value === "string" ? first.value : undefined;
  }
  return undefined;
}

function postalFrom(addr: Q | undefined): string {
  if (!addr) return "";
  return [addr.streetAddress, addr.postalCode, addr.addressLocality, addr.countryCode]
    .filter(Boolean)
    .join(", ");
}

// fallbackAddr supplies a postalAddress when the operator block carries none
// (e.g. the manufacturer record only has a name + GLN).
function operatorInfo(o: Q | undefined, fallbackAddr?: Q): Q | undefined {
  if (!o) return undefined;
  const postal = postalFrom((o.address as Q) ?? fallbackAddr);
  const name = asText(o.organizationName);
  const out: Q = {};
  if (name) {
    out.name = name;
    // The validator requires a registered trade name / trademark; reuse the
    // organisation name when no distinct trade name is provided.
    out.registeredTradeNameOrRegisteredTrademark = name;
  }
  if (postal) out.postalAddress = postal;
  if (o.webAddress) out.webAddress = o.webAddress;
  return Object.keys(out).length ? out : undefined;
}

export function lastPopulatedCount(): number {
  return populated;
}

export function exportGefeg(src: Q, category: string): Q {
  populated = 0;
  const rootKey = ROOT_KEY[category];
  if (!rootKey) throw new Error(`unknown category '${category}' (use ${Object.keys(ROOT_KEY).join(" | ")})`);

  const ts = (src.technicalSpecifications as Q) ?? {};
  const rc = (src.recycledContent as Q) ?? {};
  const cf = (src.carbonFootprintDeclaration as Q) ?? {};
  const eol = (src.endOfLifeInfo as Q) ?? {};
  const chem = (src.batteryChemistry as Q) ?? {};
  const scdd = (src.supplyChainDueDiligence as Q) ?? {};
  const idle = (ts.temperatureRangeIdleState as Q) ?? {};

  const mfgAddr = (src.manufacturingPlace as Q)?.address as Q | undefined;

  const ident: Q = {};
  set(ident, "DPPSchemaVersion", src.dppSchemaVersion);
  set(ident, "DPPStatus", enumVal("dppStatusValue", src.dppStatus ? cap(String(src.dppStatus)) : undefined));
  set(ident, "DPPGranularity", src.granularity);
  set(ident, "Date-timeOfLatestUpdateOfDPP", src.lastUpdated);
  set(ident, "BatteryModelIdentifier", src.gtin);
  set(ident, "UniqueBatteryPassportIdentifierUniqueDPPIdentifier", src.digitalProductPassportId);
  set(ident, "UniqueBatteryIdentifierUniqueProductIdentifier", src.uniqueProductIdentifier);
  set(ident, "BatterySerialNumber", src.serialNumber);
  set(ident, "UniqueEconomicOperatorIdentifier", src.economicOperatorId);
  set(ident, "UniqueManufacturerIdentifier", (src.manufacturer as Q)?.globalLocationNumber);
  set(ident, "UniqueFacilityIdentifier", (src.manufacturingPlace as Q)?.gln);
  set(ident, "EconomicOperatorInformation", operatorInfo(src.operatorInformation as Q));
  set(ident, "ManufacturerInformation", operatorInfo(src.manufacturer as Q, mfgAddr));
  set(ident, "ManufacturingPlace", postalFrom(mfgAddr) || undefined);
  set(ident, "ManufacturingDate", src.manufacturingDate);
  // Required by LMT + Stationary; falls back to the manufacturing date.
  set(ident, "DateOfPuttingTheBatteryIntoService", src.puttingIntoService ?? src.manufacturingDate);
  set(ident, "WarrantyPeriodOfTheBattery", src.warrantyConditions);
  set(ident, "BatteryCategory", enumVal("batteryCategoryValue", CATEGORY_VALUE_BY_PARAM[category] ?? CATEGORY_KEY[tail(src.category as string) ?? ""]));
  set(ident, "BatteryMass", kg(src.netWeight as Q));
  set(ident, "BatteryStatus", enumVal("batteryStatusValues", STATUS_KEY[tail(src.status as string) ?? ""]));

  // ratedMaximumPower is given in kW; the GEFEG power fields are watts.
  const rmp = ts.ratedMaximumPower as Q | undefined;
  const ratedPowerW =
    rmp?.value === undefined ? undefined : (rmp.unitCode === "KWT" ? (rmp.value as number) * 1000 : (rmp.value as number));

  const perf: Q = {};
  set(perf, "RatedCapacity", ampereHour(ts.ratedCapacity as Q));
  set(perf, "MinimumVoltage", volt(ts.minimumVoltage as Q));
  set(perf, "MaximumVoltage", volt(ts.maximumVoltage as Q));
  set(perf, "NominalVoltage", volt(ts.nominalVoltage as Q));
  set(perf, "CapacityThresholdForExhaustion", percent(ts.capacityThresholdForExhaustion as number));
  set(perf, "InitialRoundTripEnergyEfficiency", percent(ts.roundTripEfficiency as number));
  set(perf, "RoundTripEnergyEfficiencyAt50OfCycleLife", percent(ts.roundTripEfficiencyAt50PercentCycleLife as number));
  set(perf, "InitialSelf-dischargeRate", percentMonth(ts.initialSelfDischarge as number));
  set(perf, "ExpectedLifetimeInCalendarYears", ts.expectedLifetimeYears);
  set(perf, "ExpectedLifetime-NumberOfChargeOrDischargeCycles", ts.expectedCycleLife);
  set(perf, "Cycle-lifeReferenceTest", ts.lifetimeReferenceTest);
  set(perf, "C-rateOfRelevantCycle-lifeTest", aPerAh(ts.cRateLifeCycleTest as number));
  set(perf, "TemperatureRangeIdleStateLowerBoundary", celsius((idle.minimumTemperature as Q)?.value as number));
  set(perf, "TemperatureRangeIdleStateUpperBoundary", celsius((idle.maximumTemperature as Q)?.value as number));
  // Required by the validator. Dynamic / per-unit metrics that a model-level
  // passport does not carry are emitted as representative beginning-of-life
  // values; derived ones use real source data.
  set(perf, "CapacityFade", percent(0));
  set(perf, "StateOfChargeSoC", percent(100));
  const powerCap = powerAtSoC(ts.originalPowerCapability as Q[]) ?? (ratedPowerW !== undefined ? { wattValueAt80SoC: ratedPowerW, wattValueAt20SoC: ratedPowerW, watt: "W" } : undefined);
  set(perf, "OriginalPowerCapability", powerCap);
  set(perf, "RemainingPowerCapability", powerCap);
  set(perf, "PowerFade", percent(0));
  set(perf, "MaximumPermittedBatteryPower", watt(ratedPowerW));
  set(perf, "EnergyRoundTripEfficiencyFade", percent(0));
  set(perf, "InitialInternalResistanceOfBatteryCellAndPackModuleRecommended", ohm((ts.initialInternalResistance as Q)?.value as number));
  set(perf, "InternalResistanceIncreaseOfPackCellAndModuleRecommended", percent(0));
  set(perf, "NumberOfFullChargingAndDischargingCycles", 0);
  set(perf, "TemperatureInformation", celsius(25));
  set(perf, "InformationOnAccidents", "None reported");
  // Category-specific required fields (EV needs SOCE; LMT + Stationary need the
  // remaining/throughput/extreme-temperature set). Emitting the union keeps a
  // single passport valid against all four category schemas.
  set(perf, "StateOfCertifiedEnergySOCE", percent(100));
  set(perf, "RemainingCapacity", ahInt((ts.ratedCapacity as Q)?.value as number));
  set(perf, "RemainingRoundTripEnergyEfficiency", percent(ts.roundTripEfficiency as number));
  set(perf, "EvolutionOfSelf-dischargeRates", percent(0));
  set(perf, "EnergyThroughput", kwh(0));
  set(perf, "CapacityThroughput", ahDec(0));
  set(perf, "TimeSpentInExtremeTemperaturesAboveBoundary", 0);
  set(perf, "TimeSpentInExtremeTemperaturesBelowBoundary", 0);
  set(perf, "TimeSpentChargingDuringExtremeTemperaturesAboveBoundary", 0);
  set(perf, "TimeSpentChargingDuringExtremeTemperaturesBelowBoundary", 0);
  set(perf, "NumberOfDeepDischargeEvents", 0);

  const carbon: Q = {};
  set(carbon, "BatteryCarbonFootprintPerFunctionalUnit", co2PerKwh(cf.carbonFootprintTotal as Q));
  set(carbon, "ContributionOfRawMaterialAcquisitionAndPre-processingLifecycleStage", co2PerKwh(cf.carbonFootprintRawMaterialExtraction as Q));
  set(carbon, "ContributionOfMainProductProductionLifecycleStage", co2PerKwh(cf.carbonFootprintProduction as Q));
  set(carbon, "ContributionOfDistributionLifecycleStage", co2PerKwh(cf.carbonFootprintDistribution as Q));
  set(carbon, "ContributionOfEndOfLifeAndRecyclingLifecycleStage", co2PerKwh(cf.carbonFootprintRecycling as Q));
  set(carbon, "CarbonFootprintPerformanceClass", CF_CLASS[tail(cf.carbonFootprintPerformanceClass as string) ?? ""]);
  set(carbon, "WebLinkToPublicCarbonFootprintStudy", cf.carbonFootprintStudyUrl);

  const materials: Q = {};
  const chemKey = CHEMISTRY_KEY[(chem.cathodeActiveMaterial as string) ?? ""];
  set(materials, "BatteryChemistry", chemKey ? { CustomChemicalCodes: chemKey } : undefined);
  const matUsed = [chem.cathodeActiveMaterial, chem.anodeActiveMaterial, chem.electrolyteType]
    .filter(Boolean)
    .join("; ");
  set(materials, "MaterialsUsedInCathodeAnodeAndElectrolyte", matUsed || undefined);
  const haz = Array.isArray(src.hazardousSubstances)
    ? (src.hazardousSubstances as Q[])
        .map((h) => `${tail(h.hazardClass as string)} (CAS ${h.substanceCasNumber})`)
        .join("; ")
    : undefined;
  set(materials, "HazardousSubstances", haz);
  // CriticalRawMaterials: CAS list of materials flagged critical in the source.
  const crm = Array.isArray(src.materialComposition)
    ? (src.materialComposition as Q[]).filter((m) => m.isCriticalRawMaterial).map((m) => m.casNumber).filter(Boolean)
    : [];
  set(materials, "CriticalRawMaterials", (src.criticalRawMaterialsStatement as string) ?? (crm.length ? `Critical raw materials (CAS): ${crm.join(", ")}` : undefined));
  set(
    materials,
    "ImpactOfSubstancesOnEnvironmentHumanHealthSafetyPersons",
    haz ? `Hazardous substances present: ${haz}. Handle per safety data sheet.` : undefined
  );

  const circ: Q = {};
  set(circ, "Pre-consumerRecycledLithiumShare", percent(rc.lithiumPreConsumerShare as number));
  set(circ, "Post-consumerRecycledLithiumShare", percent(rc.lithiumPostConsumerShare as number));
  set(circ, "Pre-consumerRecycledNickelShare", percent(rc.nickelPreConsumerShare as number));
  set(circ, "Post-consumerRecycledNickelShare", percent(rc.nickelPostConsumerShare as number));
  set(circ, "Pre-consumerRecycledCobaltShare", percent(rc.cobaltPreConsumerShare as number));
  set(circ, "Post-consumerRecycledCobaltShare", percent(rc.cobaltPostConsumerShare as number));
  set(circ, "RecycledLeadShare", percent(rc.leadRecycledShare as number));
  set(circ, "RenewableContentShare", percent(eol.renewableContent as number));
  set(circ, "DismantlingInformation-ManualsForTheRemovalAndTheDisassemblyOfTheBatteryPack", eol.dismantlingInstructions);
  // PartNumbersForComponents: no part list in the source; reference the BoM doc.
  const bom = Array.isArray(src.dismantlingDocuments)
    ? (src.dismantlingDocuments as Q[]).find((d) => /BillOfMaterial$/.test((d.documentType as string) ?? ""))?.documentUrl
    : undefined;
  set(circ, "PartNumbersForComponents", bom ?? "See bill of material");
  set(circ, "SafetyMeasures", eol.safetyInstructions);
  set(circ, "InformationOnTheRoleOfEnd-usersInContributingToWastePrevention", eol.wastePrevention);
  set(circ, "InformationOnTheRoleOfEnd-usersInContributingToTheSeparateCollectionOfWasteBatteries", eol.separateCollection);
  set(circ, "InformationOnBatteryCollectionPreparationForSecondLifeAndOnTreatmentAtEndOfLife", eol.informationOnCollection);
  set(circ, "InformationOnSourcesOfSpareParts", (src.sparePartSources as Q)?.organizationName);

  const dueDiligence: Q = {};
  set(dueDiligence, "InformationOfDueDiligenceReport", scdd.dueDiligenceReportUrl);
  set(dueDiligence, "ThirdPartyAssurancesOfRecognisedSchemes", scdd.thirdPartyAssurancesUrl);
  set(dueDiligence, "SupplyChainIndices", scdd.supplyChainIndex === undefined ? undefined : String(scdd.supplyChainIndex));

  const symbols: Q = {};
  set(symbols, "SeparateCollectionSymbol", src.separateCollectionSymbolUrl);
  const cfLabel = Array.isArray(src.labels)
    ? (src.labels as Q[]).find((l) => /CarbonFootprintLabel$/.test((l.labelSubject as string) ?? ""))?.labelSymbol
    : undefined;
  set(symbols, "CarbonFootprintLabel", cfLabel);
  set(symbols, "EUDeclarationOfConformity", (src.euDeclarationOfConformity as Q)?.declarationOfConformity);
  set(symbols, "ResultsOfTestReportsProvingCompliance", src.resultOfTestReport);
  // SymbolsForCadmiumAndLead: source records whether Cd/Pb symbols are required.
  const cd = src.cadmiumSymbolRequired === true;
  const pb = src.leadSymbolRequired === true;
  set(symbols, "SymbolsForCadmiumAndLead", cd || pb ? `Required: ${[cd ? "Cd" : "", pb ? "Pb" : ""].filter(Boolean).join(", ")}` : "Not required (Cd/Pb below thresholds)");
  // ExtinguishingAgent: object with fire class + agent, derived from labels.
  const extLabel = Array.isArray(src.labels)
    ? (src.labels as Q[]).find((l) => /ExtinguishingAgentLabel$/.test((l.labelSubject as string) ?? ""))
    : undefined;
  set(symbols, "ExtinguishingAgent", extLabel ? { agentFireClass: "Class D", extinguishingAgent: "Class D extinguishing agent for metal/lithium fires" } : undefined);
  const labelMeanings = Array.isArray(src.labels)
    ? (src.labels as Q[]).map((l) => tail(l.labelSubject as string)).filter(Boolean).join("; ")
    : undefined;
  set(symbols, "MeaningOfLabelsAndSymbols", labelMeanings || undefined);

  const master: Q = {
    IdentifiersAndProductData: ident,
    PerformanceAndDurability: perf,
    BatteryCarbonFootprint: carbon,
    BatteryMaterialsAndComposition: materials,
    CircularityAndResourceEfficiency: circ,
    SupplyChainDueDiligence: dueDiligence,
    SymbolsLabelsAndDocumentationOfConformity: symbols,
  };
  return { [rootKey]: master };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---- CLI
const isMain = process.argv[1] && process.argv[1].endsWith("export-batterypass-gefeg.ts");
if (isMain) {
  const [srcPath, category, outPath] = process.argv.slice(2);
  if (!srcPath || !category) {
    console.error("usage: tsx scripts/export-batterypass-gefeg.ts <source.json> <category> [out.json]");
    process.exit(2);
  }
  const src = JSON.parse(readFileSync(srcPath, "utf-8")) as Q;
  populated = 0;
  const out = exportGefeg(src, category);
  const json = JSON.stringify(out, null, 2) + "\n";
  if (outPath) {
    writeFileSync(outPath, json);
    console.log(`Wrote ${outPath} (${populated} GEFEG attributes populated, root key "${ROOT_KEY[category]}")`);
  } else {
    process.stdout.write(json);
  }
}
