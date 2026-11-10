#!/usr/bin/env tsx
/**
 * Migrate stored passports to the common/assessment model (d1e28a7).
 *
 * The flat textile durability, microplastic, robustness and recyclability terms
 * and the core repairability score/class were removed when measured and assessed
 * values moved to oea: (CIRPASS-2). Nothing is deprecated, so a passport that
 * still carries them loses those values for every JSON-LD reader. This rewrites
 * them into the shape the migrated examples in d1e28a7 use:
 *
 *   DurabilityInfo        abrasion/pilling/colour fastness/dimensional stability/
 *                         tensile/tear  -> oea:TestExecution sub-assessments;
 *                         wash cycles, lifetime, class -> oea:Indicator
 *   MicroplasticInfo      shedding rate -> MicrofibreReleaseTest result;
 *                         risk level -> SheddingRiskLevel indicator
 *   RobustnessAssessment  spirality, dimensional change, visual inspection ->
 *                         sub-assessments with awardedScore; cleaning cycles ->
 *                         parameter setting; fabric type -> condition;
 *                         robustness score -> indicator derived from the tests
 *   RecyclabilityAssessment elastane -> result against ElastaneContentLimit
 *                         (<= 15 %); sorting factors and technical recyclability
 *                         -> criterion results; score -> indicator;
 *                         isRecyclable -> oea:hasOutcome
 *   RepairabilityInfo     score and class -> indicators
 *   PPWR packaging        A/B/C grade -> indicator of an oec:RecyclabilityAssessment;
 *                         design-for-recycling methodology -> its oea:hasMethod (dcc992d)
 *   wave 3 (dafe0803)     EPD impact indicators and module values -> results with units;
 *                         circularity and ESPR Annex I figures -> indicators; textile
 *                         footprint -> assessment with LCIA results and indicators; material
 *                         test certificate values -> results; WEEE treatment outcome ->
 *                         results, avoided emissions -> indicator
 *   wave 4 (4b0d8d7b)     battery state values -> results of eubat:hasBatteryState;
 *                         tested values, settings, thresholds, reference test ->
 *                         eubat:hasPerformanceTest; CF class -> indicator; EPCIS
 *                         sensorReport types -> parameter IRIs
 *
 * Works on the compacted, prefixed form the resolver stores (eutex:, oec:, gs1:);
 * keys are matched by local name, so an unprefixed key migrates as well. Every
 * other key is kept. Idempotent: an object without the old keys is unchanged.
 * Test-standard and test-method strings are dropped, the method individual names
 * the standard.
 *
 * Usage:
 *   tsx scripts/migrate-assessment.ts <in.json> [out.json]   one document
 *   tsx scripts/migrate-assessment.ts --check                examples of d1e28a7, dcc992d, dafe0803, 4b0d8d7b, 9add685
 */
import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Json = any;
type Obj = Record<string, Json>;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ELASTANE_LIMIT_PERCENT = 15;

const local = (key: string) => key.slice(key.lastIndexOf(":") + 1);
const ref = (curie: string) => ({ "@id": curie });
const qv = (value: Json, unitCode: string) => ({ type: "gs1:QuantitativeValue", "gs1:value": value, "gs1:unitCode": unitCode });
const outcome = (ok: boolean) => ref(ok ? "oea:Satisfied" : "oea:NotSatisfied");

/** Remove and return the value of the key whose local name is `name`. */
function take(o: Obj, name: string): Json {
  for (const k of Object.keys(o)) {
    if (local(k) === name) {
      const v = o[k];
      delete o[k];
      return v;
    }
  }
  return undefined;
}

function typeOf(o: Obj): string[] {
  return [o.type ?? o["@type"]].flat().filter(Boolean).map((t: string) => local(t));
}

/** A value kept as stored: a QuantitativeValue passes through, a bare number gets the unit. */
function measured(v: Json, unitCode: string): Json {
  return v && typeof v === "object" ? v : qv(v, unitCode);
}

function measurement(parameter: string, value: Json, unitCode: string): Obj {
  return { type: "oea:MeasurementResult", "oea:hasObservedParameter": ref(parameter), "oea:hasMeasuredValue": measured(value, unitCode) };
}

function test(id: string | undefined, suffix: string, method: string, result: Json, score?: Json): Obj {
  const t: Obj = {};
  if (id) t.id = `${id}-${suffix}`;
  t.type = "oea:TestExecution";
  t["oea:hasMethod"] = ref(method);
  t["oea:hasResult"] = result;
  if (score !== undefined) t["oea:awardedScore"] = score;
  return t;
}

function setOrAppend(o: Obj, key: string, items: Obj[]) {
  if (!items.length) return;
  const existing = o[key] === undefined ? [] : [o[key]].flat();
  const all = [...existing, ...items];
  o[key] = all.length === 1 ? all[0] : all;
}

function durability(o: Obj) {
  const id: string | undefined = o.id ?? o["@id"];
  const tests: Obj[] = [];
  const add = (name: string, suffix: string, method: string, parameter: string, unit: string) => {
    const v = take(o, name);
    if (v !== undefined) tests.push(test(id, suffix, method, measurement(parameter, v, unit)));
  };
  add("abrasionResistance", "abrasion", "eutex:MartindaleAbrasionTest", "eutex:AbrasionResistance", "C62");
  add("pillingResistance", "pilling", "eutex:PillingTest", "eutex:PillingResistance", "C62");
  add("colorFastness", "colour-fastness", "eutex:ColourFastnessTest", "eutex:ColourFastness", "C62");
  add("dimensionalStability", "dimensional-change", "eutex:DimensionalChangeTest", "eutex:DimensionalStability", "P1");
  add("hasTensileStrength", "tensile", "eutex:TensileStrengthTest", "eutex:TensileStrength", "NEW");
  add("hasTearStrength", "tear", "eutex:TearStrengthTest", "eutex:TearStrength", "NEW");

  const indicators: Obj[] = [];
  const cycles = take(o, "expectedWashCycles");
  if (cycles !== undefined) indicators.push({ type: "oea:Indicator", "oea:hasIndicatorKind": ref("oea:NumberOfUseCycles"), "oea:hasIndicatorValue": measured(cycles, "C62") });
  const years = take(o, "expectedLifetimeYears");
  if (years !== undefined) indicators.push({ type: "oea:Indicator", "oea:hasIndicatorKind": ref("oea:ExpectedLifetime"), "oea:hasIndicatorValue": measured(years, "ANN") });
  const cls = take(o, "hasDurabilityClass");
  if (cls !== undefined) indicators.push({ type: "oea:Indicator", "oea:hasIndicatorKind": ref("eutex:DurabilityRating"), "oea:hasCategoricalValue": cls });

  setOrAppend(o, "oea:hasSubAssessment", tests);
  setOrAppend(o, "oea:hasIndicator", indicators);
}

function microplastic(o: Obj) {
  const rate = take(o, "hasSheddingRate");
  if (rate !== undefined) {
    o["oea:hasMethod"] = ref("eutex:MicrofibreReleaseTest");
    o["oea:hasResult"] = measurement("eutex:MicrofibreRelease", rate, "MGM");
  }
  const level = take(o, "hasMicroplasticRiskLevel");
  if (level !== undefined) {
    setOrAppend(o, "oea:hasIndicator", [{ type: "oea:Indicator", "oea:hasIndicatorKind": ref("eutex:SheddingRiskLevel"), "oea:hasCategoricalValue": level }]);
  }
}

function robustness(o: Obj) {
  const id: string | undefined = o.id ?? o["@id"];
  const tests: Obj[] = [];
  const dropMethod = (t: Obj, name: string) => {
    take(t, name);
    take(t, "hasTestStandard");
  };

  const spirality = take(o, "hasSpiralityTest");
  if (spirality && typeof spirality === "object") {
    dropMethod(spirality, "spiralityTestMethod");
    tests.push(test(id, "spirality", "eutex:SpiralityTest", measurement("eutex:Spirality", take(spirality, "spiralityPercentage"), "P1"), take(spirality, "spiralityScore")));
  }
  const dimensional = take(o, "hasDimensionalChangeTest");
  if (dimensional && typeof dimensional === "object") {
    dropMethod(dimensional, "dimensionalChangeTestMethod");
    tests.push(test(id, "dimensional-change", "eutex:DimensionalChangeTest", measurement("eutex:DimensionalStability", take(dimensional, "dimensionalChangePercentage"), "P1"), take(dimensional, "dimensionalChangeScore")));
  }
  const visual = take(o, "hasVisualInspection");
  if (visual && typeof visual === "object") {
    dropMethod(visual, "visualInspectionTestMethod");
    const results: Obj[] = [];
    for (const [name, parameter] of [
      ["colourChangeRating", "eutex:ColourChange"],
      ["fabricAppearanceRating", "eutex:FabricAppearance"],
      ["seamAppearanceRating", "eutex:SeamAppearance"],
      ["nonTextilePartsRating", "eutex:NonTextilePartsAppearance"],
    ]) {
      const v = take(visual, name);
      if (v !== undefined) results.push(measurement(parameter, v, "C62"));
    }
    tests.push(test(id, "visual-inspection", "eutex:AppearanceAfterWashingTest", results.length === 1 ? results[0] : results, take(visual, "visualInspectionScore")));
  }

  const cycles = take(o, "cleaningCyclesBeforeTest");
  const fabric = take(o, "hasRobustnessTestFabricType");
  const score = take(o, "robustnessScore");
  if (score !== undefined || tests.length) o["oea:hasMethod"] = ref("eutex:JRCRobustnessScoring");
  if (cycles !== undefined) {
    o["oea:hasParameterSetting"] = { type: "oea:ParameterSetting", "oea:hasParameter": ref("oea:NumberOfCycles"), "oea:hasParameterValue": measured(cycles, "C62") };
  }
  if (fabric !== undefined) {
    o["oea:hasCondition"] = { type: "oea:AssessmentCondition", "oea:hasConditionType": ref("eutex:SpecimenFabricType"), "oea:hasConditionConcept": fabric };
  }
  if (score !== undefined) {
    const indicator: Obj = {
      type: "oea:Indicator",
      "oea:hasIndicatorKind": ref("eutex:RobustnessScore"),
      "oea:hasIndicatorValue": measured(score, "C62"),
      "oea:hasDerivationMethod": ref("eutex:JRCRobustnessScoring"),
    };
    const from = tests.filter((t) => t.id).map((t) => ref(t.id));
    if (from.length) indicator["oea:isDerivedFrom"] = from;
    setOrAppend(o, "oea:hasIndicator", [indicator]);
  }
  setOrAppend(o, "oea:hasSubAssessment", tests);
}

function recyclability(o: Obj) {
  const results: Obj[] = [];
  const elastane = take(o, "elastaneContentPercent");
  if (elastane !== undefined) {
    const r = measurement("eutex:ElastaneContent", elastane, "P1");
    r["oea:isEvaluatedAgainst"] = ref("eutex:ElastaneContentLimit");
    const v = Number(typeof elastane === "object" ? elastane["gs1:value"] ?? elastane.value : elastane);
    if (!Number.isNaN(v)) r["oea:hasOutcome"] = outcome(v <= ELASTANE_LIMIT_PERCENT);
    results.push(r);
  }
  const sorting = take(o, "hasSortingFactors");
  if (sorting && typeof sorting === "object") {
    for (const [name, criterion] of [
      ["sameInnerOuterComposition", "eutex:SameInnerOuterComposition"],
      ["freeFromPrintings", "eutex:FreeFromPrintings"],
      ["freeFromCoatings", "eutex:FreeFromCoatings"],
      ["freeFromSequins", "eutex:FreeFromSequins"],
      ["freeFromDyes", "eutex:FreeFromDyes"],
      ["isMonoMaterial", "eutex:MonoMaterial"],
    ]) {
      const v = take(sorting, name);
      if (typeof v === "boolean") results.push({ type: "oea:CriterionResult", "oea:hasCriterion": ref(criterion), "oea:hasOutcome": outcome(v), "oea:awardedScore": v ? 1 : 0 });
    }
  }
  const technical = take(o, "hasTechnicalRecyclability");
  if (technical && typeof technical === "object") {
    const tech = take(technical, "hasApplicableRecyclingTechnology");
    if (tech !== undefined) o["eutex:hasApplicableRecyclingTechnology"] = tech;
    const s = take(technical, "technicalRecyclabilityScore");
    if (s !== undefined) {
      results.push({ type: "oea:CriterionResult", "oea:hasCriterion": ref("eutex:TechnicalRecyclabilityCriterion"), "oea:hasOutcome": outcome(Number(s) > 0), "oea:awardedScore": s });
    }
  }
  const score = take(o, "recyclabilityScore");
  const recyclable = take(o, "isRecyclable");
  if (results.length || score !== undefined || recyclable !== undefined) o["oea:hasMethod"] = ref("eutex:JRCRecyclabilityScoring");
  setOrAppend(o, "oea:hasResult", results);
  if (score !== undefined) {
    setOrAppend(o, "oea:hasIndicator", [{
      type: "oea:Indicator",
      "oea:hasIndicatorKind": ref("oea:RecyclabilityScore"),
      "oea:hasIndicatorValue": measured(score, "C62"),
      "oea:hasDerivationMethod": ref("eutex:JRCRecyclabilityScoring"),
    }]);
  }
  if (typeof recyclable === "boolean") o["oea:hasOutcome"] = outcome(recyclable);
}

function repairability(o: Obj) {
  const indicators: Obj[] = [];
  const score = take(o, "repairabilityScore");
  if (score !== undefined) indicators.push({ type: "oea:Indicator", "oea:hasIndicatorKind": ref("oea:RepairabilityScore"), "oea:hasIndicatorValue": measured(score, "C62") });
  const cls = take(o, "repairabilityClass");
  if (cls !== undefined) indicators.push({ type: "oea:Indicator", "oea:hasIndicatorKind": ref("oea:RepairabilityClass"), "oea:indicatorText": cls });
  setOrAppend(o, "oea:hasIndicator", indicators);
}

/**
 * PPWR (wave 2): the A/B/C grade becomes an indicator of an oec:RecyclabilityAssessment on the
 * packaging and the design-for-recycling methodology its method. Prefixed keys get prefixed
 * successors; bare keys (operational context) get bare ones.
 */
function packagingRecyclability(o: Obj) {
  const keys = Object.keys(o).filter((k) => ["hasRecyclabilityGrade", "designForRecyclingMethodology"].includes(local(k)));
  if (!keys.length) return;
  const bare = keys.every((k) => !k.includes(":"));
  const n = (curie: string) => (bare ? local(curie) : curie);
  const grade = take(o, "hasRecyclabilityGrade");
  const methodology = take(o, "designForRecyclingMethodology");
  const key = Object.keys(o).find((k) => local(k) === "hasRecyclabilityAssessment") ?? n("oec:hasRecyclabilityAssessment");
  const assessment: Obj = o[key] && typeof o[key] === "object" && !Array.isArray(o[key]) ? o[key] : { type: "oec:RecyclabilityAssessment" };
  if (methodology !== undefined) assessment[n("oea:hasMethod")] = { type: "oea:AssessmentMethod", [n("oea:methodName")]: methodology };
  if (grade !== undefined)
    setOrAppend(assessment, n("oea:hasIndicator"), [{ type: "oea:Indicator", [n("oea:hasIndicatorKind")]: ref("euppwr:RecyclabilityPerformanceGrade"), [n("oea:hasCategoricalValue")]: grade }]);
  o[key] = assessment;
}

/** Prefixed successor keys for a prefixed source key, bare ones for a bare key. */
const spelling = (bare: boolean) => (curie: string) => (bare ? local(curie) : curie);

function indicator(n: (c: string) => string, kind: string, value: Json, unitCode: string): Obj {
  return { type: "oea:Indicator", [n("oea:hasIndicatorKind")]: ref(kind), [n("oea:hasIndicatorValue")]: measured(value, unitCode) };
}

/** Wave 3, core: ESPR Annex I life-cycle figures on the product become indicators. */
const PRODUCT_INDICATORS: [string, string, string][] = [
  ["productToPackagingRatio", "oec:ProductToPackagingRatio", "C62"],
  ["wasteGenerationAmount", "oec:WasteGeneration", "KGM"],
  ["packagingWasteAmount", "oec:PackagingWaste", "KGM"],
  ["waterConsumption", "oec:WaterConsumption", "MTQ"],
  ["landUse", "oec:LandUse", "MTK"],
  ["materialFootprint", "oec:MaterialFootprint", "KGM"],
];
const CIRCULARITY_INDICATORS: [string, string][] = [
  ["materialCircularityIndicator", "oec:MaterialCircularityIndicator"],
  ["utilityFactor", "oec:UtilityFactor"],
];

function productIndicators(o: Obj) {
  for (const [name, kind, unit] of PRODUCT_INDICATORS) {
    const key = Object.keys(o).find((k) => local(k) === name && (k.startsWith("oec:") || !k.includes(":")));
    if (!key) continue;
    const n = spelling(!key.includes(":"));
    const v = take(o, name);
    setOrAppend(o, Object.keys(o).find((k) => local(k) === "hasIndicator") ?? n("oea:hasIndicator"), [indicator(n, kind, v, unit)]);
  }
}

/**
 * Wave 3, core: the circularity container keeps MCI and utility factor as indicators; the
 * recyclable share moves to a RecyclabilityRate result of the product's recyclability
 * assessment (dropped when that assessment already states the same value).
 */
function circularity(o: Obj) {
  const cKey = Object.keys(o).find((k) => local(k) === "hasCircularityPerformance");
  const c = cKey && o[cKey];
  if (!c || typeof c !== "object" || Array.isArray(c)) return;
  for (const [name, kind] of CIRCULARITY_INDICATORS) {
    const key = Object.keys(c).find((k) => local(k) === name);
    if (!key) continue;
    const n = spelling(!key.includes(":"));
    const v = take(c, name);
    setOrAppend(c, Object.keys(c).find((k) => local(k) === "hasIndicator") ?? n("oea:hasIndicator"), [indicator(n, kind, v, "C62")]);
  }
  const rKey = Object.keys(c).find((k) => local(k) === "recyclableContent");
  if (!rKey) return;
  const n = spelling(!rKey.includes(":"));
  const v = take(c, "recyclableContent");
  const aKey = Object.keys(o).find((k) => local(k) === "hasRecyclabilityAssessment") ?? n("oec:hasRecyclabilityAssessment");
  const a: Obj = o[aKey] && typeof o[aKey] === "object" && !Array.isArray(o[aKey]) ? o[aKey] : { type: "oec:RecyclabilityAssessment" };
  const resKey = Object.keys(a).find((k) => local(k) === "hasResult") ?? n("oea:hasResult");
  const same = [a[resKey] ?? []].flat().some((r: Obj) => {
    const param = r?.[Object.keys(r).find((k) => local(k) === "hasObservedParameter") ?? ""];
    const val = r?.[Object.keys(r).find((k) => local(k) === "hasMeasuredValue") ?? ""];
    const iri = typeof param === "string" ? param : param?.["@id"] ?? param?.id;
    const num = val && typeof val === "object" ? val[Object.keys(val).find((k) => local(k) === "value") ?? ""] : val;
    return iri && /RecyclabilityRate$/.test(iri) && Number(num) === Number(v && typeof v === "object" ? v["gs1:value"] ?? v.value : v);
  });
  if (!same) setOrAppend(a, resKey, [{ type: "oea:MeasurementResult", [n("oea:hasObservedParameter")]: ref("oea:RecyclabilityRate"), [n("oea:hasMeasuredValue")]: measured(v, "C62") }]);
  o[aKey] = a;
}

/** EN 15804 declared units of the impact categories: the unit of the reference substance. */
function impactUnitCode(unit: string): string | undefined {
  const u = unit.replace(/\s*\/.*$/, "").trim().toLowerCase();
  if (/^mol\b/.test(u)) return "C34";
  if (/^mj\b/.test(u)) return "3B";
  if (/^m3\b|^m³/.test(u)) return "MTQ";
  if (/^kg\b/.test(u)) return "KGM";
  return undefined;
}

/**
 * Wave 3, core: an EPD impact indicator is an oea:MeasurementResult. The category moves to
 * oea:hasObservedParameter, total and unit to oea:hasMeasuredValue; the stated unit text (with
 * its declared unit, "kg CO2 eq / t") stays as oec:declaredUnit. Stage values become measured
 * values in the same unit, observing the same category.
 */
function impactIndicator(o: Obj) {
  const typeKey = Object.keys(o).find((k) => local(k) === "hasIndicatorType");
  const totalKey = Object.keys(o).find((k) => local(k) === "indicatorTotalValue");
  const unitKey = Object.keys(o).find((k) => local(k) === "indicatorUnit");
  const any = typeKey ?? totalKey ?? unitKey;
  const n = spelling(!!any && !any.includes(":"));
  const unitText = take(o, "indicatorUnit");
  const code = typeof unitText === "string" ? impactUnitCode(unitText) : undefined;
  if (unitText !== undefined && !code) notes.push(`impact indicator unit "${unitText}" has no UN/CEFACT code; value kept without unitCode`);
  const q = (v: Json) => (v && typeof v === "object" ? v : code ? qv(v, code) : { type: "gs1:QuantitativeValue", "gs1:value": v });
  const entries: [string, Json][] = [];
  for (const [k, v] of Object.entries(o)) {
    if (local(k) === "hasIndicatorType") entries.push([n("oea:hasObservedParameter"), v]);
    else if (local(k) === "indicatorTotalValue") entries.push([n("oea:hasMeasuredValue"), q(v)]);
    else entries.push([k, v]);
  }
  for (const k of Object.keys(o)) delete o[k];
  for (const [k, v] of entries) o[k] = v;
  if (unitText !== undefined) o[n("oec:declaredUnit")] = unitText;
  const stagesKey = Object.keys(o).find((k) => local(k) === "hasLifecycleStageResult");
  for (const st of stagesKey ? [o[stagesKey]].flat() : []) {
    if (!st || typeof st !== "object") continue;
    const sk = Object.keys(st).find((k) => local(k) === "stageValue");
    if (!sk) continue;
    const sn = spelling(!sk.includes(":"));
    const v = st[sk];
    replaceKey(st, sk, sn("oea:hasMeasuredValue"), q(v));
    const category = o[n("oea:hasObservedParameter")];
    if (category !== undefined) {
      const entries = Object.entries(st);
      const at = entries.findIndex(([k]) => local(k) === "hasMeasuredValue");
      entries.splice(at, 0, [sn("oea:hasObservedParameter"), structuredClone(category)]);
      for (const k of Object.keys(st)) delete st[k];
      for (const [k, val] of entries) st[k] = val;
    }
  }
}

/** EN 15804 / PEF reference-substance units; CTUe and CTUh are comparative toxic units (C62). */
function lciaUnitCode(unit: string): string | undefined {
  return /^ctu/i.test(unit.trim()) ? "C62" : impactUnitCode(unit.replace(/-eq\b/i, " eq"));
}

/**
 * Wave 3, textile: the environmental footprint is an oea:Assessment. Manufacturing carbon
 * footprint, PEF single score, benchmark and the two classes become indicators, the PEFCR its
 * method; an LCIA category is a result observing its category code, with value and unit as a
 * quantity and the stated unit kept as oec:declaredUnit.
 */
function environmentalFootprint(o: Obj) {
  const anyKey = Object.keys(o).find((k) => /^(carbonFootprintManufacturing|pefSingleScore|benchmarkPerformance|carbonFootprintClass|environmentalFootprintClass|pefcrReference|hasLciaCategories)$/.test(local(k)));
  const n = spelling(!!anyKey && !anyKey.includes(":"));
  const indicators: Obj[] = [];
  for (const [name, kind, unit] of [
    ["carbonFootprintManufacturing", "eutex:ManufacturingCarbonFootprint", "KGM"],
    ["pefSingleScore", "eutex:PEFSingleScore", "C62"],
    ["benchmarkPerformance", "eutex:BenchmarkPerformance", "P1"],
    ["carbonFootprintClass", "eutex:CarbonFootprintClass", "C62"],
    ["environmentalFootprintClass", "eutex:EnvironmentalFootprintClass", "C62"],
  ] as const) {
    const v = take(o, name);
    if (v !== undefined) indicators.push(indicator(n, kind, v, unit));
  }
  const pefcr = take(o, "pefcrReference");
  if (pefcr !== undefined) o[n("oea:hasMethod")] = { type: "oea:AssessmentMethod", [n("oea:methodName")]: pefcr };
  const catKey = Object.keys(o).find((k) => local(k) === "hasLciaCategories");
  for (const c of catKey ? [o[catKey]].flat() : []) {
    if (!c || typeof c !== "object") continue;
    const codeKey = Object.keys(c).find((k) => local(k) === "hasLciaCategoryCode");
    if (!codeKey && !Object.keys(c).some((k) => /^lcia(Value|Unit)$/.test(local(k)))) continue;
    const cn = spelling(!!codeKey && !codeKey.includes(":"));
    const unit = take(c, "lciaUnit");
    const code = typeof unit === "string" ? lciaUnitCode(unit) : undefined;
    if (unit !== undefined && !code) notes.push(`LCIA unit "${unit}" has no UN/CEFACT code; value kept without unitCode`);
    const entries: [string, Json][] = [];
    for (const [k, v] of Object.entries(c)) {
      if (local(k) === "hasLciaCategoryCode") entries.push([cn("oea:hasObservedParameter"), v]);
      else if (local(k) === "lciaValue") entries.push([cn("oea:hasMeasuredValue"), v && typeof v === "object" ? v : code ? qv(v, code) : { type: "gs1:QuantitativeValue", "gs1:value": v }]);
      else entries.push([k, v]);
    }
    for (const k of Object.keys(c)) delete c[k];
    for (const [k, v] of entries) c[k] = v;
    if (unit !== undefined) c[cn("oec:declaredUnit")] = unit;
  }
  setOrAppend(o, Object.keys(o).find((k) => local(k) === "hasIndicator") ?? n("oea:hasIndicator"), indicators);
}

/** Wave 3, iron-steel: EN 10168 values of a material test certificate, parameter and unit. */
const MTC_RESULTS: [string, string, string][] = [
  ["mtcYieldStrength", "eusteel:YieldStrength", "MPA"],
  ["mtcTensileStrength", "eusteel:TensileStrength", "MPA"],
  ["mtcYieldStrengthRatio", "eusteel:YieldStrengthRatio", "C62"],
  ["mtcElongation", "eusteel:Elongation", "P1"],
  ["mtcRelativeRibArea", "eusteel:RelativeRibArea", "C62"],
  ["mtcCarbonContent", "eusteel:CarbonContent", "P1"],
  ["mtcPhosphorusContent", "eusteel:PhosphorusContent", "P1"],
  ["mtcSulfurContent", "eusteel:SulfurContent", "P1"],
  ["mtcCopperContent", "eusteel:CopperContent", "P1"],
  ["mtcNitrogenContent", "eusteel:NitrogenContent", "P1"],
  ["mtcCarbonEquivalent", "eusteel:CarbonEquivalent", "P1"],
  ["mtcRadiometricControl", "eusteel:RadiometricControl", "C62"],
];

/** Wave 3, iron-steel: the certificate is an oea:Assessment, each test value a result of it. */
function materialTestCertificate(o: Obj) {
  const results: Obj[] = [];
  let bare = false;
  for (const [name, parameter, unit] of MTC_RESULTS) {
    const key = Object.keys(o).find((k) => local(k) === name);
    if (!key) continue;
    bare = !key.includes(":");
    const n = spelling(bare);
    results.push({ type: "oea:MeasurementResult", [n("oea:hasObservedParameter")]: ref(parameter), [n("oea:hasMeasuredValue")]: measured(take(o, name), unit) });
  }
  setOrAppend(o, Object.keys(o).find((k) => local(k) === "hasResult") ?? spelling(bare)("oea:hasResult"), results);
}

/** Wave 3, electronics: the WEEE treatment outcome of one item, parameter and unit. */
const TREATMENT_RESULTS: [string, string, string][] = [
  ["totalInputMassGrams", "euelec:TreatmentInputMass", "GRM"],
  ["totalRecoveredMassGrams", "euelec:RecoveredMass", "GRM"],
  ["recoveryRate", "euelec:AchievedRecoveryRate", "C62"],
  ["recyclingRate", "euelec:AchievedRecyclingRate", "C62"],
  ["energyRecoveryRate", "euelec:EnergyRecoveryRate", "C62"],
];

/** Wave 3, electronics: material recovery figures become results of the treatment assessment. */
function materialRecovery(o: Obj) {
  const results: Obj[] = [];
  let bare = false;
  for (const [name, parameter, unit] of TREATMENT_RESULTS) {
    const key = Object.keys(o).find((k) => local(k) === name);
    if (!key) continue;
    bare = !key.includes(":");
    const n = spelling(bare);
    results.push({ type: "oea:MeasurementResult", [n("oea:hasObservedParameter")]: ref(parameter), [n("oea:hasMeasuredValue")]: measured(take(o, name), unit) });
  }
  setOrAppend(o, Object.keys(o).find((k) => local(k) === "hasResult") ?? spelling(bare)("oea:hasResult"), results);
}

/** Wave 3, electronics: the avoided-emissions figure is an indicator, the calculation basis the method. */
function avoidedEmissions(o: Obj) {
  const key = Object.keys(o).find((k) => /^(avoidedEmissionsKgCO2e|calculationMethod)$/.test(local(k)));
  if (!key) return;
  const n = spelling(!key.includes(":"));
  const v = take(o, "avoidedEmissionsKgCO2e");
  const basis = take(o, "calculationMethod");
  if (basis !== undefined) {
    const name = basis && typeof basis === "object" && "@value" in basis ? basis["@value"] : basis;
    o[n("oea:hasMethod")] = { type: "oea:AssessmentMethod", [n("oea:methodName")]: name };
  }
  if (v !== undefined) setOrAppend(o, Object.keys(o).find((k) => local(k) === "hasIndicator") ?? n("oea:hasIndicator"), [indicator(n, "euelec:AvoidedEmissions", v, "KGM")]);
}

/**
 * Terms PR 17 removed as duplicates, keyed by the stored spelling (prefixed under the
 * core and module contexts, bare under the operational contexts). The target may already
 * be present: every battery example carried oec:lastUpdated next to eubat:lastDataUpdate,
 * and capacityFadeThreshold sat next to the exhaustion threshold as a second wording of it.
 */
const RENAMED: Record<string, string> = {
  "eubat:batteryPassportIdentifier": "oec:passportIdentifier",
  "eubat:lastDataUpdate": "oec:lastUpdated",
  "oec:lastDataUpdate": "oec:lastUpdated",
  "eubat:exhaustionThreshold": "eubat:capacityThresholdForExhaustion",
  "eubat:capacityFadeThreshold": "eubat:capacityThresholdForExhaustion",
  "eubat:expectedNumberOfCycles": "eubat:expectedCycleLife",
  "eubat:numberOfFullCycles": "eubat:hasCycleCount",
  batteryPassportIdentifier: "passportIdentifier",
  lastDataUpdate: "lastUpdated",
  exhaustionThreshold: "capacityThresholdForExhaustion",
  capacityFadeThreshold: "capacityThresholdForExhaustion",
  expectedNumberOfCycles: "expectedCycleLife",
  numberOfFullCycles: "hasCycleCount",
  // 2026-11 duplicates with the same value shape on the same node. The bare casNumber and
  // ecNumber need no rename: the operational context now resolves them to oec: directly.
  "eubat:casNumber": "oec:casNumber",
  "eubat:ecNumber": "oec:ecNumber",
  "eutex:ecNumber": "oec:ecNumber",
  "eubat:hasSelfDischargeRate": "eubat:hasCurrentSelfDischargingRate",
  "eubat:hasRemainingEnergy": "eubat:hasRemainingUsableEnergy",
  hasSelfDischargeRate: "hasCurrentSelfDischargingRate",
  hasRemainingEnergy: "hasRemainingUsableEnergy",
  // 0.10.2: one CAS and one EC term for every position; the tier follows the carrying node
  "eubat:substanceCasNumber": "oec:casNumber",
  "eubat:substanceEcNumber": "oec:ecNumber",
  "eudet:allergenCasNumber": "oec:casNumber",
  substanceCasNumber: "casNumber",
  substanceEcNumber: "ecNumber",
  allergenCasNumber: "casNumber",
};

/** Removed without a one-to-one successor (guidance 3.2 #38 wants cell and pack values); reported, kept. */
const REPORT_ONLY = new Set(["eubat:hasInitialInternalResistance", "hasInitialInternalResistance"]);

/** What a run dropped or could not place; printed, never fatal. */
export const notes: string[] = [];

/** Put `value` under `to` where `from` stood, keeping the key order of `o`. */
function replaceKey(o: Obj, from: string, to: string, value: Json) {
  const entries = Object.entries(o).filter(([k]) => k !== to).map(([k, v]) => (k === from ? [to, value] : [k, v]));
  for (const k of Object.keys(o)) delete o[k];
  for (const [k, v] of entries) o[k] = v;
}

/** Bare keys are renamed only in our own documents: under the BatteryPass bridge they are external keys. */
function rename(o: Obj, at: string, own = true) {
  for (const [k, v] of Object.entries(o)) {
    const to = own || k.includes(":") ? RENAMED[k] : undefined;
    if (to) {
      if (!(to in o)) replaceKey(o, k, to, v);
      else {
        if (JSON.stringify(o[to]) !== JSON.stringify(v)) notes.push(`${at}.${k} = ${JSON.stringify(v)} dropped, ${to} = ${JSON.stringify(o[to])} stays`);
        delete o[k];
      }
    }
    if (REPORT_ONLY.has(k)) notes.push(`${at}.${k} = ${JSON.stringify(v)} has no successor in the context (cell or pack value?), left as is`);
  }
}

/**
 * 2026-11 battery duplicates whose survivor sits on another node or carries another value shape.
 * New keys are written prefixed (eubat:, oec:, gs1:): a CURIE resolves under the module context
 * and under the operational context alike, a bare alias only under the latter.
 */
const keyOf = (o: Obj, name: string) => Object.keys(o).find((k) => local(k) === name && (!k.includes(":") || k.startsWith("eubat:")));
const urlOf = (v: Json): string | undefined =>
  typeof v === "string" ? v : v && typeof v === "object" ? (v["@id"] ?? v.id ?? v["@value"]) : undefined;
const docUrl = (d: Json): string | undefined => {
  if (!d || typeof d !== "object") return urlOf(d);
  const k = Object.keys(d).find((x) => local(x) === "documentUrl");
  return k ? urlOf(d[k]) : undefined;
};

/** Two places to the right in the decimal string: 0.92 -> 92, "0.925" -> "92.5". */
function percentOfRatio(v: Json): Json {
  const s = String(v).trim();
  const m = /^(\d*)(?:\.(\d*))?$/.exec(s);
  if (!m) return v;
  const frac = (m[2] ?? "").padEnd(2, "0");
  const int = ((m[1] || "0") + frac.slice(0, 2)).replace(/^0+(?=\d)/, "");
  const out = frac.length > 2 ? `${int}.${frac.slice(2)}` : int;
  return typeof v === "number" ? Number(out) : out;
}

/** On a technical specification: the year count becomes the has* quantity with unit ANN. */
function technicalSpecification(o: Obj, at: string) {
  const k = keyOf(o, "expectedLifetimeYears");
  if (!k) return;
  const v = o[k];
  const to = Object.keys(o).find((x) => local(x) === "hasExpectedLifetime");
  if (to) {
    notes.push(`${at}.${k} = ${JSON.stringify(v)} dropped, ${to} = ${JSON.stringify(o[to])} stays`);
    delete o[k];
  } else replaceKey(o, k, "eubat:hasExpectedLifetime", v && typeof v === "object" ? v : qv(v, "ANN"));
}

function appendDocs(o: Obj, key: string, docs: Obj[], at: string) {
  const existing = o[key] === undefined ? [] : [o[key]].flat();
  const urls = new Set(existing.map(docUrl).filter(Boolean));
  for (const d of docs) {
    const u = docUrl(d);
    if (u && urls.has(u)) {
      notes.push(`${at}: dismantling document ${u} already listed, not added twice`);
      continue;
    }
    if (u) urls.add(u);
    existing.push(d);
  }
  if (existing.length) o[key] = existing;
}

/** On a battery passport (the node that carries the technical specification or end-of-life info). */
function batteryProduct(o: Obj, at: string) {
  const perfKey = Object.keys(o).find((k) => local(k) === "hasPerformanceInfo");
  const eolKey = Object.keys(o).find((k) => local(k) === "hasEndOfLifeInfo");
  const dismantlingKey = () => Object.keys(o).find((k) => local(k) === "hasDismantlingAndRemovalInformation") ?? "eubat:hasDismantlingAndRemovalInformation";

  for (const k of Object.keys(o).filter((x) => local(x) === "hasTechnicalSpecifications" && (!x.includes(":") || x.startsWith("eubat:")))) {
    for (const ts of [o[k]].flat()) if (ts && typeof ts === "object") technicalSpecification(ts, `${at}.${k}`);
  }

  // performance info: the current round-trip efficiency (0-1) and self-discharge rate move up to the product
  let movedFromPerf = false;
  for (const perf of perfKey ? [o[perfKey]].flat() : []) {
    if (!perf || typeof perf !== "object") continue;
    const rte = keyOf(perf, "roundTripEnergyEfficiency");
    if (rte) {
      const v = perf[rte];
      delete perf[rte];
      movedFromPerf = true;
      const to = Object.keys(o).find((k) => local(k) === "hasRemainingRoundTripEfficiency");
      if (to) notes.push(`${at}.${perfKey}.${rte} = ${JSON.stringify(v)} dropped, ${to} = ${JSON.stringify(o[to])} stays`);
      else if (Number(v) > 1) {
        notes.push(`${at}.${perfKey}.${rte} = ${JSON.stringify(v)} is above 1, taken as a percentage already`);
        o["eubat:hasRemainingRoundTripEfficiency"] = qv(v, "P1");
      } else o["eubat:hasRemainingRoundTripEfficiency"] = qv(percentOfRatio(v), "P1");
    }
    const sd = Object.keys(perf).find((k) => local(k) === "hasCurrentSelfDischargingRate" && (!k.includes(":") || k.startsWith("eubat:")));
    if (sd) {
      const v = perf[sd];
      delete perf[sd];
      movedFromPerf = true;
      const to = Object.keys(o).find((k) => local(k) === "hasCurrentSelfDischargingRate");
      if (to) notes.push(`${at}.${perfKey}.${sd} = ${JSON.stringify(v)} dropped, ${to} = ${JSON.stringify(o[to])} stays`);
      else o["eubat:hasCurrentSelfDischargingRate"] = v;
    }
  }
  if (movedFromPerf && perfKey && [o[perfKey]].flat().every((p) => p && typeof p === "object" && Object.keys(p).every((k) => ["type", "@type", "id", "@id"].includes(k)))) {
    delete o[perfKey];
  }

  // dismantling documents: one product-level list
  const docsKey = keyOf(o, "hasDismantlingDocuments");
  if (docsKey) {
    const docs = [o[docsKey]].flat();
    const to = dismantlingKey();
    // the list itself is kept whole (documents of several types may share one file)
    if (o[to] === undefined) replaceKey(o, docsKey, to, docs);
    else {
      delete o[docsKey];
      appendDocs(o, to, docs, at);
    }
  }

  const eols = eolKey ? [o[eolKey]].flat().filter((e) => e && typeof e === "object") : [];
  for (const eol of eols) {
    const di = keyOf(eol, "hasDismantlingInstructions");
    if (di) {
      const urls = [eol[di]].flat().map(urlOf).filter(Boolean) as string[];
      delete eol[di];
      appendDocs(o, dismantlingKey(), urls.map((u) => ({ type: "eubat:DismantlingDocument", "eubat:hasDocumentType": ref("eubat:DismantlingManual"), "eubat:documentUrl": u })), `${at}.${eolKey}`);
    }
  }

  // safety measures (Annex XIII(2)(d)): document references on the end-of-life info
  const measures: Obj[] = [];
  const sm = keyOf(o, "safetyMeasures");
  if (sm) {
    for (const v of [o[sm]].flat()) {
      const u = urlOf(v);
      if (u && /^https?:\/\//.test(u)) measures.push({ type: "oec:DocumentReference", "oec:documentUrl": u });
      else notes.push(`${at}.${sm} = ${JSON.stringify(v)} is not a link and has no place in eubat:hasSafetyMeasures, left as is`);
    }
    if (measures.length) delete o[sm];
  }
  let slot: string | undefined;
  for (const eol of eols) {
    const sd = keyOf(eol, "safetyInstructionsForDismantling");
    if (!sd) continue;
    for (const v of [eol[sd]].flat()) {
      const u = urlOf(v);
      if (u) measures.push({ type: "oec:DocumentReference", "oec:documentUrl": u });
    }
    if (eol === eols[0]) slot = sd;
    else delete eol[sd];
  }
  if (measures.length) {
    let eol = eols[0];
    if (!eol) {
      eol = { type: "eubat:EndOfLifeInfo" };
      o[eolKey ?? "eubat:hasEndOfLifeInfo"] = eol;
    }
    const key = Object.keys(eol).find((k) => local(k) === "hasSafetyMeasures") ?? "eubat:hasSafetyMeasures";
    const existing = eol[key] === undefined ? [] : [eol[key]].flat();
    const seen = new Set(existing.map(docUrl));
    for (const m of measures) if (!seen.has(docUrl(m))) { existing.push(m); seen.add(docUrl(m)); }
    const value = existing.length === 1 ? existing[0] : existing;
    if (slot && !(key in eol)) replaceKey(eol, slot, key, value);
    else {
      if (slot) delete eol[slot];
      eol[key] = value;
    }
  }
}

/** Wave 4, battery: dynamic values on the product -> results of eubat:BatteryStateAssessment. */
const BATTERY_STATE: [string, string, string][] = [
  ["hasStateOfHealth", "eubat:StateOfHealth", "P1"],
  ["hasStateOfCharge", "eubat:StateOfCharge", "P1"],
  ["hasStateOfCertifiedEnergy", "eubat:StateOfCertifiedEnergy", "P1"],
  ["hasCycleCount", "eubat:FullCycleCount", "C62"],
  ["hasRemainingCapacity", "eubat:RemainingCapacity", "AMH"],
  ["hasCapacityFade", "eubat:CapacityFade", "P1"],
  ["hasPowerFade", "eubat:PowerFade", "P1"],
  ["hasInternalResistance", "eubat:InternalResistance", "OHM"],
  ["hasInternalResistanceIncrease", "eubat:InternalResistanceIncrease", "P1"],
  ["hasEnergyThroughput", "eubat:EnergyThroughput", "KWH"],
  ["hasCapacityThroughput", "eubat:CapacityThroughput", "AMH"],
  ["hasRemainingRoundTripEfficiency", "eubat:RemainingRoundTripEfficiency", "P1"],
  ["hasRoundTripEfficiencyFade", "eubat:RoundTripEfficiencyFade", "P1"],
  ["hasEvolutionOfSelfDischarge", "eubat:SelfDischargeEvolution", "P1"],
  ["hasCurrentSelfDischargingRate", "eubat:SelfDischargeRate", "P1"],
  ["timeSpentInExtremeTemperaturesAboveBoundary", "eubat:TimeAboveTemperatureBoundary", "MIN"],
  ["timeSpentInExtremeTemperaturesBelowBoundary", "eubat:TimeBelowTemperatureBoundary", "MIN"],
  ["timeSpentChargingDuringExtremeTemperaturesAboveBoundary", "eubat:ChargingTimeAboveTemperatureBoundary", "MIN"],
  ["timeSpentChargingDuringExtremeTemperaturesBelowBoundary", "eubat:ChargingTimeBelowTemperatureBoundary", "MIN"],
  ["numberOfDeepDischargeEvents", "eubat:DeepDischargeEvents", "C62"],
  ["hasRemainingUsableEnergy", "eubat:RemainingUsableEnergy", "KWH"],
  ["hasInitialCapacity", "eubat:InitialCapacity", "AMH"],
  ["hasInitialEnergy", "eubat:InitialEnergy", "KWH"],
];
const BATTERY_STATE_INDICATORS: [string, string, string][] = [
  ["expectedRemainingCycles", "eubat:RemainingCycles", "C62"],
  ["expectedRemainingLifetimeMonths", "eubat:RemainingLifetime", "MON"],
];
/** Wave 4, battery: tested values on the technical specification -> results of eubat:PerformanceDurabilityTest. */
const BATTERY_TEST: [string, string, string][] = [
  ["hasInitialCellInternalResistance", "eubat:InitialCellInternalResistance", "OHM"],
  ["hasInitialPackInternalResistance", "eubat:InitialPackInternalResistance", "OHM"],
  ["initialSelfDischarge", "eubat:InitialSelfDischargeRate", "P1"],
  ["roundTripEfficiency", "eubat:InitialRoundTripEfficiency", "P1"],
  ["roundTripEfficiencyAt50PercentCycleLife", "eubat:RoundTripEfficiencyAt50PercentCycleLife", "P1"],
  ["expectedCycleLife", "eubat:CycleLife", "C62"],
  ["hasExpectedLifetimeEnergyThroughput", "eubat:LifetimeEnergyThroughput", "KWH"],
  ["hasExpectedLifetimeCapacityThroughput", "eubat:LifetimeCapacityThroughput", "AMH"],
];
const BATTERY_TEST_SETTINGS: [string, string, string][] = [
  ["depthOfDischargeInCycleLifeTest", "eubat:DepthOfDischarge", "P1"],
  ["cRateLifeCycleTest", "eubat:ChargeCRate", "C62"],
  ["dischargeCRateLifeCycleTest", "eubat:DischargeCRate", "C62"],
];
const BATTERY_TEST_THRESHOLDS: [string, string, string, string][] = [
  ["capacityThresholdForExhaustion", "eubat:CapacityExhaustionThreshold", "eubat:StateOfCertifiedEnergy", "oea:LessThan"],
  ["resistanceIncreaseThreshold", "eubat:ResistanceIncreaseThreshold", "eubat:InternalResistanceIncrease", "oea:GreaterThanOrEqual"],
];

/** The key of `o` whose local name is `name`, if it is a battery key (eubat: or bare). */
const batteryKey = (o: Obj, name: string) => Object.keys(o).find((k) => local(k) === name && (k.startsWith("eubat:") || !k.includes(":")));

/** A power capability at a state of charge: a sub-assessment with the SoC as its condition. */
function powerCapabilityAt(n: (c: string) => string, soc: Json, value: Json, id?: string): Obj {
  const t: Obj = {};
  if (id) t.id = id;
  t.type = "oea:TestExecution";
  t[n("oea:hasCondition")] = { type: "oea:AssessmentCondition", [n("oea:hasConditionType")]: ref("eubat:StateOfChargeLevel"), [n("oea:hasConditionValue")]: measured(soc, "P1") };
  t[n("oea:hasResult")] = { type: "oea:MeasurementResult", [n("oea:hasObservedParameter")]: ref("eubat:PowerCapability"), [n("oea:hasMeasuredValue")]: measured(value, "KWT") };
  return t;
}

/** eubat:PowerCapabilityAtSoC objects (one or a list) -> sub-assessments. */
function powerCapabilities(n: (c: string) => string, v: Json): Obj[] {
  return [v].flat().filter((x) => x && typeof x === "object").map((pc: Obj) => {
    const soc = pc[Object.keys(pc).find((k) => local(k) === "stateOfChargeLevel") ?? ""];
    const val = pc[Object.keys(pc).find((k) => local(k) === "hasPowerCapability") ?? ""];
    return powerCapabilityAt(n, soc, val, pc.id ?? pc["@id"]);
  });
}

/** Get or create the assessment under `key` on `o` (a single object). */
function assessmentUnder(o: Obj, entry: string, type: string): Obj {
  const k = Object.keys(o).find((x) => local(x) === local(entry));
  if (k && o[k] && typeof o[k] === "object" && !Array.isArray(o[k])) return o[k];
  const a: Obj = { type };
  o[entry] = a;
  return a;
}

/** Wave 4, battery product: the dynamic values move into eubat:hasBatteryState. */
function batteryState(o: Obj) {
  const results: Obj[] = [];
  const subs: Obj[] = [];
  const indicators: Obj[] = [];
  let bare: boolean | undefined;
  const nOf = () => spelling(!!bare);
  for (const [name, parameter, unit] of BATTERY_STATE) {
    const k = batteryKey(o, name);
    if (!k) continue;
    bare ??= !k.includes(":");
    results.push({ type: "oea:MeasurementResult", [nOf()("oea:hasObservedParameter")]: ref(parameter), [nOf()("oea:hasMeasuredValue")]: measured(take(o, name), unit) });
  }
  for (const [name, kind, unit] of BATTERY_STATE_INDICATORS) {
    const k = batteryKey(o, name);
    if (!k) continue;
    bare ??= !k.includes(":");
    indicators.push(indicator(nOf(), kind, take(o, name), unit));
  }
  const rpc = batteryKey(o, "hasRemainingPowerCapability");
  if (rpc) {
    bare ??= !rpc.includes(":");
    subs.push(...powerCapabilities(nOf(), take(o, "hasRemainingPowerCapability")));
  }
  for (const [name, soc] of [["hasPowerCapabilityAt80SoC", 80], ["hasPowerCapabilityAt20SoC", 20]] as const) {
    const k = batteryKey(o, name);
    if (!k) continue;
    bare ??= !k.includes(":");
    subs.push(powerCapabilityAt(nOf(), soc, take(o, name)));
  }
  if (bare === undefined) return;
  const n = nOf();
  const a = assessmentUnder(o, n("eubat:hasBatteryState"), "eubat:BatteryStateAssessment");
  setOrAppend(a, Object.keys(a).find((k) => local(k) === "hasResult") ?? n("oea:hasResult"), results);
  setOrAppend(a, Object.keys(a).find((k) => local(k) === "hasSubAssessment") ?? n("oea:hasSubAssessment"), subs);
  setOrAppend(a, Object.keys(a).find((k) => local(k) === "hasIndicator") ?? n("oea:hasIndicator"), indicators);
}

/** Wave 4, battery technical specification: the tested values move into eubat:hasPerformanceTest. */
function batteryPerformanceTest(ts: Obj) {
  const results: Obj[] = [];
  const settings: Obj[] = [];
  const thresholds: Obj[] = [];
  const subs: Obj[] = [];
  let method: Obj | undefined;
  let bare: boolean | undefined;
  const nOf = () => spelling(!!bare);
  for (const [name, parameter, unit] of BATTERY_TEST) {
    const k = batteryKey(ts, name);
    if (!k) continue;
    bare ??= !k.includes(":");
    results.push({ type: "oea:MeasurementResult", [nOf()("oea:hasObservedParameter")]: ref(parameter), [nOf()("oea:hasMeasuredValue")]: measured(take(ts, name), unit) });
  }
  for (const [name, parameter, unit] of BATTERY_TEST_SETTINGS) {
    const k = batteryKey(ts, name);
    if (!k) continue;
    bare ??= !k.includes(":");
    settings.push({ type: "oea:ParameterSetting", [nOf()("oea:hasParameter")]: ref(parameter), [nOf()("oea:hasParameterValue")]: measured(take(ts, name), unit) });
  }
  for (const [name, cls, parameter, operator] of BATTERY_TEST_THRESHOLDS) {
    const k = batteryKey(ts, name);
    if (!k) continue;
    bare ??= !k.includes(":");
    thresholds.push({ type: cls, [nOf()("oea:hasThresholdParameter")]: ref(parameter), [nOf()("oea:hasComparisonOperator")]: ref(operator), [nOf()("oea:hasThresholdValue")]: measured(take(ts, name), "P1") });
  }
  const opc = batteryKey(ts, "hasOriginalPowerCapability");
  if (opc) {
    bare ??= !opc.includes(":");
    subs.push(...powerCapabilities(nOf(), take(ts, "hasOriginalPowerCapability")));
  }
  const lrt = batteryKey(ts, "lifetimeReferenceTest");
  if (lrt) {
    bare ??= !lrt.includes(":");
    const v = take(ts, "lifetimeReferenceTest");
    const url = v && typeof v === "object" ? v["@value"] ?? v["@id"] ?? v.id : v;
    method = { type: "oea:TestMethod", [nOf()(/^https?:\/\//.test(String(url)) ? "oea:methodUrl" : "oea:methodName")]: url };
  }
  if (bare === undefined) return;
  const n = nOf();
  const t = assessmentUnder(ts, n("eubat:hasPerformanceTest"), "eubat:PerformanceDurabilityTest");
  if (method) t[n("oea:hasMethod")] = method;
  setOrAppend(t, Object.keys(t).find((k) => local(k) === "hasParameterSetting") ?? n("oea:hasParameterSetting"), settings);
  setOrAppend(t, Object.keys(t).find((k) => local(k) === "isEvaluatedAgainst") ?? n("oea:isEvaluatedAgainst"), thresholds);
  setOrAppend(t, Object.keys(t).find((k) => local(k) === "hasResult") ?? n("oea:hasResult"), results);
  setOrAppend(t, Object.keys(t).find((k) => local(k) === "hasSubAssessment") ?? n("oea:hasSubAssessment"), subs);
}

/** Wave 4, battery carbon footprint: the performance class is an indicator. */
function carbonFootprintClass(o: Obj) {
  const k = batteryKey(o, "hasCarbonFootprintPerformanceClass");
  if (!k) return;
  const n = spelling(!k.includes(":"));
  const v = take(o, "hasCarbonFootprintPerformanceClass");
  setOrAppend(o, Object.keys(o).find((x) => local(x) === "hasIndicator") ?? n("oea:hasIndicator"), [
    { type: "oea:Indicator", [n("oea:hasIndicatorKind")]: ref("eubat:CarbonFootprintPerformanceClass"), [n("oea:hasCategoricalValue")]: v },
  ]);
}

/** Wave 4, EPCIS: a sensorReport whose type is a removed battery property names the parameter instead. */
const SENSOR_TYPES: Record<string, string> = Object.fromEntries(
  BATTERY_STATE.map(([name, parameter]) => [`eubat:${name}`, parameter]),
);
function sensorReportType(o: Obj) {
  for (const k of ["type", "@type"]) {
    const t = o[k];
    if (typeof t === "string" && t in SENSOR_TYPES && Object.keys(o).some((x) => /^(value|stringValue|booleanValue|uom|time)$/.test(x))) o[k] = SENSOR_TYPES[t];
  }
}

/** Apply `f` to every object of `doc`, children first. */
function walkObjects(doc: Json, f: (o: Obj) => void) {
  if (Array.isArray(doc)) doc.forEach((v) => walkObjects(v, f));
  else if (doc && typeof doc === "object") {
    for (const v of Object.values(doc)) walkObjects(v, f);
    f(doc);
  }
}

/** Wave 4 on a battery node: state on the product, tests on its technical specifications, CF class. */
function batteryWave4(o: Obj) {
  sensorReportType(o);
  carbonFootprintClass(o);
  for (const k of Object.keys(o).filter((x) => local(x) === "hasTechnicalSpecifications" && (!x.includes(":") || x.startsWith("eubat:")))) {
    for (const ts of [o[k]].flat()) if (ts && typeof ts === "object") batteryPerformanceTest(ts);
  }
  batteryState(o);
}

const isBatteryProduct = (o: Obj) =>
  Object.keys(o).some((k) => ["hasTechnicalSpecifications", "hasEndOfLifeInfo", "hasPerformanceInfo", "hasDismantlingDocuments", "safetyMeasures"].includes(local(k)) && (!k.includes(":") || /^(eubat|oec):/.test(k)));

const BY_TYPE: Record<string, (o: Obj) => void> = {
  DurabilityInfo: durability,
  MicroplasticInfo: microplastic,
  RobustnessAssessment: robustness,
  RecyclabilityAssessment: recyclability,
  RepairabilityInfo: repairability,
  ImpactIndicatorResult: impactIndicator,
  EnvironmentalFootprint: environmentalFootprint,
  MaterialTestCertificate: materialTestCertificate,
  MaterialRecoveryResult: materialRecovery,
  AvoidedEmissionsEstimate: avoidedEmissions,
};

/**
 * Migrate a document in place and return it. A document read through the BatteryPass bridge
 * context speaks the external BatteryPass keys (its safetyMeasures is a different term), so the
 * battery moves skip it.
 */
export function migrate(doc: Json, at = "$", battery?: boolean): Json {
  if (battery === undefined) battery = !/batterypass-bridge/.test(JSON.stringify(doc?.["@context"] ?? ""));
  if (Array.isArray(doc)) {
    doc.forEach((v, i) => migrate(v, `${at}[${i}]`, battery));
    return doc;
  }
  if (!doc || typeof doc !== "object") return doc;
  for (const [k, v] of Object.entries(doc)) migrate(v, `${at}.${k}`, battery);
  for (const t of typeOf(doc)) BY_TYPE[t]?.(doc);
  packagingRecyclability(doc);
  productIndicators(doc);
  circularity(doc);
  rename(doc, at, battery);
  if (battery && isBatteryProduct(doc)) batteryProduct(doc, at);
  // Wave 4 runs once the earlier battery moves are done everywhere (they pull values up to the product).
  if (battery && at === "$") walkObjects(doc, batteryWave4);
  return doc;
}

/** The old-shape keys a migrated document must not contain any more. */
const REMOVED = new Set([
  "abrasionResistance", "pillingResistance", "colorFastness", "dimensionalStability", "hasTensileStrength", "hasTearStrength",
  "expectedWashCycles", "expectedLifetimeYears", "hasDurabilityClass", "hasSheddingRate", "hasMicroplasticRiskLevel",
  "hasSpiralityTest", "hasDimensionalChangeTest", "hasVisualInspection", "cleaningCyclesBeforeTest", "hasRobustnessTestFabricType",
  "robustnessScore", "elastaneContentPercent", "hasSortingFactors", "hasTechnicalRecyclability", "recyclabilityScore", "isRecyclable",
  "repairabilityScore", "repairabilityClass",
]);

/** Removed in wave 2; the names exist in no other module, so bare keys count under any context. */
const WAVE2_REMOVED = new Set(["hasRecyclabilityGrade", "designForRecyclingMethodology"]);

/** Removed from dpp-core in wave 3; bare spellings are core keys under every context. */
const WAVE3_CORE_REMOVED = new Set([
  "recyclableContent", "utilityFactor", "materialCircularityIndicator", "productToPackagingRatio", "wasteGenerationAmount",
  "packagingWasteAmount", "waterConsumption", "landUse", "materialFootprint", "hasIndicatorType", "indicatorUnit",
  "indicatorTotalValue", "stageValue",
]);

/** Removed from eu/iron-steel in wave 3 (material test certificate values); names are unique. */
const WAVE3_STEEL_REMOVED = new Set(MTC_RESULTS.map(([name]) => name));

/** Removed from eu/electronics in wave 3 (WEEE treatment outcome, avoided emissions); prefixed only. */
const WAVE3_ELEC_REMOVED = new Set([...TREATMENT_RESULTS.map(([name]) => name), "avoidedEmissionsKgCO2e", "calculationMethod"]);

/** Removed from eu/textile in wave 3 (environmental footprint). */
const WAVE3_TEXTILE_REMOVED = new Set([
  "carbonFootprintManufacturing", "pefSingleScore", "benchmarkPerformance", "carbonFootprintClass", "environmentalFootprintClass",
  "pefcrReference", "hasLciaCategoryCode", "lciaValue", "lciaUnit",
]);

/** Battery terms removed as duplicates in 2026-11 whose successor needed a move or a new shape. */
const BATTERY_REMOVED = new Set([
  "expectedLifetimeYears", "roundTripEnergyEfficiency", "hasDismantlingDocuments", "hasDismantlingInstructions",
  "safetyMeasures", "safetyInstructionsForDismantling",
]);

/** Battery terms removed in wave 4 (measured and tested values on common/assessment). */
const WAVE4_BATTERY_REMOVED = new Set([
  ...[...BATTERY_STATE, ...BATTERY_STATE_INDICATORS, ...BATTERY_TEST, ...BATTERY_TEST_SETTINGS].map(([name]) => name),
  ...BATTERY_TEST_THRESHOLDS.map(([name]) => name),
  "hasRemainingPowerCapability", "hasOriginalPowerCapability", "hasPowerCapabilityAt80SoC", "hasPowerCapabilityAt20SoC",
  "hasPowerCapability", "stateOfChargeLevel", "lifetimeReferenceTest", "hasCarbonFootprintPerformanceClass",
]);

export function leftovers(doc: Json, at = "$", out: string[] = [], textile?: boolean, battery?: boolean, bridge?: boolean): string[] {
  // A bare key is one of the textile terms only under a textile context, and one of the battery
  // terms only under the battery operational context; bare hasDismantlingInstructions is the
  // dpp-core term there and is left alone.
  const ctx = JSON.stringify(doc?.["@context"] ?? "");
  if (textile === undefined) textile = /\/textile\//.test(ctx);
  if (bridge === undefined) bridge = /batterypass-bridge/.test(ctx);
  if (battery === undefined) battery = /\/battery\//.test(ctx) && !bridge;
  if (Array.isArray(doc)) doc.forEach((v, i) => leftovers(v, `${at}[${i}]`, out, textile, battery, bridge));
  else if (doc && typeof doc === "object") {
    for (const [k, v] of Object.entries(doc)) {
      const removed = REMOVED.has(local(k)) && (/^(eutex:|oec:)/.test(k) || (textile && !k.includes(":")));
      const batteryRemoved = BATTERY_REMOVED.has(local(k)) && (k.startsWith("eubat:") || (battery && !k.includes(":") && k !== "hasDismantlingInstructions"));
      const renamed = k in RENAMED && (k.includes(":") || !bridge);
      const wave2 = WAVE2_REMOVED.has(local(k)) && (k.startsWith("euppwr:") || !k.includes(":"));
      const wave3 =
        (WAVE3_CORE_REMOVED.has(local(k)) && (k.startsWith("oec:") || !k.includes(":"))) ||
        (WAVE3_TEXTILE_REMOVED.has(local(k)) && (k.startsWith("eutex:") || (textile && !k.includes(":")))) ||
        (WAVE3_STEEL_REMOVED.has(local(k)) && (k.startsWith("eusteel:") || !k.includes(":"))) ||
        (WAVE3_ELEC_REMOVED.has(local(k)) && k.startsWith("euelec:"));
      const wave4 = WAVE4_BATTERY_REMOVED.has(local(k)) && (k.startsWith("eubat:") || (battery && !k.includes(":")));
      if (removed || batteryRemoved || renamed || wave2 || wave3 || wave4) out.push(`${at}.${k}`);
      leftovers(v, `${at}.${k}`, out, textile, battery, bridge);
    }
  }
  return out;
}

const EXAMPLES = ["garment-product", "footwear-product", "hometextile-bedlinen", "organic-tee-product", "fjordline-aurora-model"];
const WAVE3_EXAMPLES = [
  "eu/electronics/examples/display-product", "eu/electronics/examples/laptop-product", "eu/electronics/examples/server-product",
  "eu/electronics/examples/smartphone-product", "eu/electronics/epcis/commissioning", "eu/electronics/epcis/weee-disposal",
  "eu/iron-steel/examples/rebar-product", "eu/textile/examples/fjordline-aurora-batch", "eu/textile/examples/footwear-product",
  "eu/textile/examples/garment-product", "eu/textile/examples/hometextile-bedlinen", "eu/textile/epcis/observation-carbon-footprint",
  "eu/textile/epcis/declaration-environmental-footprint",
];
const WAVE4_EXAMPLES = [
  ...["amperia-staxwall-batch", "amperia-staxwall-item", "amperia-staxwall-model", "battery-product", "battery-product-batch",
    "battery-product-model", "batterypass-ev-item", "batterypass-industrial-item", "batterypass-lmt-item", "portable-ebike-battery",
  ].map((n) => `eu/battery/examples/${n}`),
  ...["amperia-staxwall-lifecycle", "negative-event", "state-of-certified-energy"].map((n) => `eu/battery/epcis/${n}`),
];
const PPWR_EXAMPLES = ["beverage-bottle", "beverage-bottle-lot-01", "ecommerce-carton", "multi-layer-pouch"];
const BATTERY_EXAMPLES = ["amperia-staxwall-item", "amperia-staxwall-model", "battery-product-model", "batterypass-lmt-item", "amperia-staxwall-item.operational", "battery-product-model.operational"];

/** Drop every key the predicate matches, at any depth. */
function without(doc: Json, drop: (key: string) => boolean): Json {
  if (Array.isArray(doc)) return doc.map((v) => without(v, drop));
  if (!doc || typeof doc !== "object") return doc;
  return Object.fromEntries(Object.entries(doc).filter(([k]) => !drop(k)).map(([k, v]) => [k, without(v, drop)]));
}

/** Drop every result observing one of `params` (and a result list it leaves empty), at any depth. */
function withoutResults(doc: Json, params: string[]): Json {
  const observes = (v: Json) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return false;
    const k = Object.keys(v).find((x) => local(x) === "hasObservedParameter");
    const p = k && v[k];
    const iri = typeof p === "string" ? p : p?.["@id"] ?? p?.id;
    return !!iri && params.some((q) => local(iri) === local(q));
  };
  if (Array.isArray(doc)) return doc.filter((v) => !observes(v)).map((v) => withoutResults(v, params));
  if (!doc || typeof doc !== "object") return doc;
  const out: Obj = {};
  for (const [k, v] of Object.entries(doc)) {
    if (observes(v)) continue;
    const w = withoutResults(v, params);
    if (Array.isArray(w) && !w.length) continue;
    out[k] = Array.isArray(w) && w.length === 1 && local(k) === "hasResult" ? w[0] : w;
  }
  return out;
}

const BAT = "https://ref.openepcis.org/extensions/eu/battery/battery-context.jsonld";
const BAT_OP = "https://ref.openepcis.org/extensions/eu/battery/battery-operational-context.jsonld";
const BRIDGE = "https://ref.openepcis.org/extensions/eu/battery/battery-context-batterypass-bridge.jsonld";

/** A measurement result, as the migration writes it (prefixed / bare keys). */
const mr = (parameter: string, value: Json): Obj => ({ type: "oea:MeasurementResult", "oea:hasObservedParameter": ref(parameter), "oea:hasMeasuredValue": value });
const mrBare = (parameter: string, value: Json): Obj => ({ type: "oea:MeasurementResult", hasObservedParameter: ref(parameter), hasMeasuredValue: value });

/** Shapes the examples do not exercise: each input must migrate to exactly the expected document. */
const SYNTHETIC: { name: string; input: Obj; expected: Obj }[] = [
  {
    name: "battery wave 4, operational spelling: state, performance test, power capability",
    input: {
      "@context": BAT_OP,
      hasStateOfHealth: { type: "QuantitativeValue", value: 94, unitCode: "P1" },
      expectedRemainingCycles: 2100,
      hasTechnicalSpecifications: {
        type: "TechnicalSpecification",
        expectedCycleLife: 3000,
        cRateLifeCycleTest: 0.5,
        capacityThresholdForExhaustion: 70,
        lifetimeReferenceTest: "https://x.example/iec-62660-1",
        hasOriginalPowerCapability: [{ type: "PowerCapabilityAtSoC", stateOfChargeLevel: 80, hasPowerCapability: { type: "QuantitativeValue", value: 7.2, unitCode: "KWT" } }],
      },
    },
    expected: {
      "@context": BAT_OP,
      hasTechnicalSpecifications: {
        type: "TechnicalSpecification",
        hasPerformanceTest: {
          type: "eubat:PerformanceDurabilityTest",
          hasMethod: { type: "oea:TestMethod", methodUrl: "https://x.example/iec-62660-1" },
          hasParameterSetting: { type: "oea:ParameterSetting", hasParameter: { "@id": "eubat:ChargeCRate" }, hasParameterValue: qv(0.5, "C62") },
          isEvaluatedAgainst: {
            type: "eubat:CapacityExhaustionThreshold", hasThresholdParameter: { "@id": "eubat:StateOfCertifiedEnergy" },
            hasComparisonOperator: { "@id": "oea:LessThan" }, hasThresholdValue: qv(70, "P1"),
          },
          hasResult: mrBare("eubat:CycleLife", qv(3000, "C62")),
          hasSubAssessment: {
            type: "oea:TestExecution",
            hasCondition: { type: "oea:AssessmentCondition", hasConditionType: { "@id": "eubat:StateOfChargeLevel" }, hasConditionValue: qv(80, "P1") },
            hasResult: mrBare("eubat:PowerCapability", { type: "QuantitativeValue", value: 7.2, unitCode: "KWT" }),
          },
        },
      },
      hasBatteryState: {
        type: "eubat:BatteryStateAssessment",
        hasResult: mrBare("eubat:StateOfHealth", { type: "QuantitativeValue", value: 94, unitCode: "P1" }),
        hasIndicator: { type: "oea:Indicator", hasIndicatorKind: { "@id": "eubat:RemainingCycles" }, hasIndicatorValue: qv(2100, "C62") },
      },
    },
  },
  {
    name: "ppwr grade and design-for-recycling methodology, prefixed",
    input: { "@context": "https://ref.openepcis.org/extensions/eu/ppwr/ppwr-context.jsonld", "euppwr:hasRecyclabilityGrade": { "@id": "euppwr:GradeB" }, "euppwr:designForRecyclingMethodology": "RecyClass 2.0" },
    expected: {
      "@context": "https://ref.openepcis.org/extensions/eu/ppwr/ppwr-context.jsonld",
      "oec:hasRecyclabilityAssessment": {
        type: "oec:RecyclabilityAssessment",
        "oea:hasMethod": { type: "oea:AssessmentMethod", "oea:methodName": "RecyClass 2.0" },
        "oea:hasIndicator": { type: "oea:Indicator", "oea:hasIndicatorKind": { "@id": "euppwr:RecyclabilityPerformanceGrade" }, "oea:hasCategoricalValue": { "@id": "euppwr:GradeB" } },
      },
    },
  },
  {
    name: "ppwr grade, bare keys",
    input: { "@context": "https://ref.openepcis.org/extensions/eu/ppwr/ppwr-operational-context.jsonld", hasRecyclabilityGrade: { "@id": "euppwr:GradeC" } },
    expected: {
      "@context": "https://ref.openepcis.org/extensions/eu/ppwr/ppwr-operational-context.jsonld",
      hasRecyclabilityAssessment: { type: "oec:RecyclabilityAssessment", hasIndicator: { type: "oea:Indicator", hasIndicatorKind: { "@id": "euppwr:RecyclabilityPerformanceGrade" }, hasCategoricalValue: { "@id": "euppwr:GradeC" } } },
    },
  },
  {
    name: "performance info moves up, ratio becomes a percentage",
    input: {
      "@context": BAT, type: "eubat:Battery",
      "oec:hasPerformanceInfo": { type: "oec:PerformanceInfo", "eubat:roundTripEnergyEfficiency": 0.925, "eubat:hasCurrentSelfDischargingRate": qv(2, "P1") },
      "eubat:hasSelfDischargeRate": qv(3, "P1"),
    },
    expected: {
      "@context": BAT, type: "eubat:Battery",
      "eubat:hasBatteryState": {
        type: "eubat:BatteryStateAssessment",
        "oea:hasResult": [mr("eubat:RemainingRoundTripEfficiency", qv(92.5, "P1")), mr("eubat:SelfDischargeRate", qv(3, "P1"))],
      },
    },
  },
  {
    name: "safety measures without end-of-life info, string ratio",
    input: { "@context": BAT, "eubat:safetyMeasures": "https://x.example/safety.pdf", "oec:hasPerformanceInfo": { "eubat:roundTripEnergyEfficiency": "0.9", "eubat:hasNegativeEvents": [] } },
    expected: {
      "@context": BAT,
      "oec:hasPerformanceInfo": { "eubat:hasNegativeEvents": [] },
      "eubat:hasEndOfLifeInfo": { type: "eubat:EndOfLifeInfo", "eubat:hasSafetyMeasures": { type: "oec:DocumentReference", "oec:documentUrl": "https://x.example/safety.pdf" } },
      "eubat:hasBatteryState": { type: "eubat:BatteryStateAssessment", "oea:hasResult": mr("eubat:RemainingRoundTripEfficiency", qv("90", "P1")) },
    },
  },
  {
    name: "operational spelling",
    input: {
      "@context": BAT_OP,
      hasTechnicalSpecifications: { type: "TechnicalSpecification", expectedLifetimeYears: 12 },
      hasRemainingEnergy: { type: "QuantitativeValue", value: 9, unitCode: "KWH" },
      hasEndOfLifeInfo: { type: "EndOfLifeInfo", hasDismantlingInstructions: "https://x.example/manual.pdf", safetyInstructionsForDismantling: "https://x.example/ds.pdf" },
      hasMaterialComposition: [{ casNumber: "7439-93-2", ecNumber: "231-102-5" }],
    },
    expected: {
      "@context": BAT_OP,
      hasTechnicalSpecifications: { type: "TechnicalSpecification", "eubat:hasExpectedLifetime": qv(12, "ANN") },
      hasEndOfLifeInfo: { type: "EndOfLifeInfo", "eubat:hasSafetyMeasures": { type: "oec:DocumentReference", "oec:documentUrl": "https://x.example/ds.pdf" } },
      hasMaterialComposition: [{ casNumber: "7439-93-2", ecNumber: "231-102-5" }],
      "eubat:hasDismantlingAndRemovalInformation": [
        { type: "eubat:DismantlingDocument", "eubat:hasDocumentType": { "@id": "eubat:DismantlingManual" }, "eubat:documentUrl": "https://x.example/manual.pdf" },
      ],
      hasBatteryState: { type: "eubat:BatteryStateAssessment", hasResult: mrBare("eubat:RemainingUsableEnergy", { type: "QuantitativeValue", value: 9, unitCode: "KWH" }) },
    },
  },
  {
    name: "BatteryPass bridge keys stay external",
    input: { "@context": BRIDGE, batteryPassportIdentifier: "urn:x", safetyMeasures: "https://x.example/s.pdf", batteryMaterials: [{ "eubat:casNumber": "1-1-1" }] },
    expected: { "@context": BRIDGE, batteryPassportIdentifier: "urn:x", safetyMeasures: "https://x.example/s.pdf", batteryMaterials: [{ "oec:casNumber": "1-1-1" }] },
  },
  {
    name: "dpp-core dismantling instructions and textile EC number",
    input: { "@context": "https://ref.openepcis.org/extensions/eu/textile/textile-context.jsonld", "oec:hasCircularityPerformance": { hasDismantlingInstructions: { "oec:documentUrl": "https://x.example/d.pdf" } }, "oec:hasSubstancesOfConcern": [{ "eutex:ecNumber": "200-001-8" }] },
    expected: { "@context": "https://ref.openepcis.org/extensions/eu/textile/textile-context.jsonld", "oec:hasCircularityPerformance": { hasDismantlingInstructions: { "oec:documentUrl": "https://x.example/d.pdf" } }, "oec:hasSubstancesOfConcern": [{ "oec:ecNumber": "200-001-8" }] },
  },
  {
    name: "hazardous-substance and allergen CAS numbers join the one CAS term",
    input: {
      "@context": BAT,
      "eubat:hasHazardousSubstances": [{ type: "eubat:HazardousSubstance", "eubat:substanceCasNumber": "7439-92-1", "eubat:substanceEcNumber": "231-100-4" }],
      "eudet:hasFragranceAllergens": [{ "schema:name": "Linalool", "eudet:allergenCasNumber": "78-70-6" }],
    },
    expected: {
      "@context": BAT,
      "eubat:hasHazardousSubstances": [{ type: "eubat:HazardousSubstance", "oec:casNumber": "7439-92-1", "oec:ecNumber": "231-100-4" }],
      "eudet:hasFragranceAllergens": [{ "schema:name": "Linalool", "oec:casNumber": "78-70-6" }],
    },
  },
  {
    name: "operational CAS spelling, bridge key untouched",
    input: { "@context": BAT_OP, hasHazardousSubstances: [{ substanceCasNumber: "7439-92-1", substanceEcNumber: "231-100-4" }] },
    expected: { "@context": BAT_OP, hasHazardousSubstances: [{ casNumber: "7439-92-1", ecNumber: "231-100-4" }] },
  },
];

async function check(): Promise<number> {
  let synthFailed = 0;
  for (const { name, input, expected } of SYNTHETIC) {
    notes.length = 0;
    const got = migrate(structuredClone(input));
    const left = leftovers(got);
    if (JSON.stringify(got) === JSON.stringify(expected) && !left.length) {
      console.log(`  ok  synthetic: ${name}`);
      continue;
    }
    synthFailed++;
    console.error(`  FAIL synthetic: ${name}${left.length ? ` (old keys left: ${left.join(", ")})` : ""}`);
    console.error(`    got      ${JSON.stringify(got)}`);
    console.error(`    expected ${JSON.stringify(expected)}`);
  }
  notes.length = 0;
  const jsonld = (await import("jsonld")).default as any;
  const { offlineDocumentLoader } = await import("./lib/jsonld-loader.ts");
  const loader = await offlineDocumentLoader();
  const nquads = (doc: Json) => jsonld.canonize(doc, { algorithm: "URDNA2015", format: "application/n-quads", documentLoader: loader, safe: false });
  let failed = 0;
  const cases = [
    // d1e28a7 predates the lastDataUpdate rename, so the timestamp is left out of the textile comparison
    ...EXAMPLES.map((name) => ({ name, file: `extensions/eu/textile/examples/${name}.jsonld`, before: "d1e28a7^", after: "d1e28a7", ignore: (k: string) => /^(oec:)?last(DataUpdate|Updated)$/.test(k) })),
    // 9add685 carries the one CAS/EC term on top of the 2026-11 duplicate removal (45ccb2f) and the
    // PR 17 renames of 0142308
    // dcc992d is wave 2 (detergent, cpr, electronics, ppwr)
    ...PPWR_EXAMPLES.map((name) => ({ name, file: `extensions/eu/ppwr/examples/${name}.jsonld`, before: "dcc992d^", after: "dcc992d", ignore: (_: string) => false })),
    // dafe0803 is wave 3 (core life-cycle and circularity, textile footprint, steel certificate,
    // electronics treatment); the electronics commissioning event was edited by hand there
    ...WAVE3_EXAMPLES.map((name) => ({ name, file: `extensions/${name}.jsonld`, before: "dafe0803^", after: "dafe0803", ignore: (_: string) => false })),
    // 4b0d8d7b is wave 4 (battery); events whose sensor elements were split by hand there are left
    // out, and so are the operational goldens (the compressor drops types the master states; the
    // bare spelling is a synthetic case)
    ...WAVE4_EXAMPLES.map((name) => ({ name, file: `extensions/${name}.jsonld`, before: "4b0d8d7b^", after: "4b0d8d7b", ignore: (_: string) => false })),
    ...BATTERY_EXAMPLES.map((name) => ({ name, file: `extensions/eu/battery/examples/${name}.jsonld`, before: "3aa08bf", after: "9add685", ignore: (k: string) => /hasInitial(Cell|Pack)?InternalResistance$/.test(k) })),
  ];
  for (const { name, file, before, after, ignore } of cases) {
    const show = (rev: string) => JSON.parse(execFileSync("git", ["show", `${rev}:${file}`], { cwd: ROOT, encoding: "utf8" }));
    // Both revisions go through the migration: later waves rewrite terms the reference revision
    // still carried, and a document stored at either revision must end in the same current shape.
    // The initial internal resistance was split into cell and pack values without a one-to-one
    // successor (REPORT_ONLY); since wave 4 those are results, so they are left out by parameter too.
    const strip = (d: Json) => withoutResults(without(d, ignore), ["InitialCellInternalResistance", "InitialPackInternalResistance"]);
    const migrated = strip(migrate(show(before)));
    notes.length = 0;
    const expected = strip(migrate(show(after)));
    migrated["@context"] = expected["@context"];
    const [a, b] = [await nquads(migrated), await nquads(expected)];
    const left = leftovers(migrated);
    if (a === b && !left.length) {
      console.log(`  ok  ${name}`);
      continue;
    }
    failed++;
    const as = new Set(a.split("\n")), bs = new Set(b.split("\n"));
    console.error(`  FAIL ${name}${left.length ? ` (old keys left: ${left.join(", ")})` : ""}`);
    for (const l of [...as].filter((x) => !bs.has(x)).slice(0, 8)) console.error(`    + ${l}`);
    for (const l of [...bs].filter((x) => !as.has(x)).slice(0, 8)) console.error(`    - ${l}`);
  }
  if (failed || synthFailed) {
    if (failed) console.error(`✗ migration: ${failed}/${cases.length} example(s) differ from their reference revision`);
    if (synthFailed) console.error(`✗ migration: ${synthFailed}/${SYNTHETIC.length} synthetic case(s) differ`);
    return 1;
  }
  console.log(`✓ migration: ${cases.length} examples match their reference revisions as RDF, ${SYNTHETIC.length} synthetic cases exact`);
  return 0;
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  if (args[0] === "--check") return check();
  if (!args[0]) {
    console.error("usage: migrate-assessment.ts <in.json> [out.json] | --check");
    return 2;
  }
  const doc = migrate(JSON.parse(await fs.readFile(args[0], "utf8")));
  const left = leftovers(doc);
  for (const n of notes) console.error(`note: ${n}`);
  if (left.length) console.error(`old keys left: ${left.join(", ")}`);
  const text = JSON.stringify(doc, null, 2) + "\n";
  if (args[1]) await fs.writeFile(args[1], text);
  else process.stdout.write(text);
  return left.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(await main());
