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
 *
 * Works on the compacted, prefixed form the resolver stores (eutex:, oec:, gs1:);
 * keys are matched by local name, so an unprefixed key migrates as well. Every
 * other key is kept. Idempotent: an object without the old keys is unchanged.
 * Test-standard and test-method strings are dropped, the method individual names
 * the standard.
 *
 * Usage:
 *   tsx scripts/migrate-assessment.ts <in.json> [out.json]   one document
 *   tsx scripts/migrate-assessment.ts --check                examples of d1e28a7
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

const isBatteryProduct = (o: Obj) =>
  Object.keys(o).some((k) => ["hasTechnicalSpecifications", "hasEndOfLifeInfo", "hasPerformanceInfo", "hasDismantlingDocuments", "safetyMeasures"].includes(local(k)) && (!k.includes(":") || /^(eubat|oec):/.test(k)));

const BY_TYPE: Record<string, (o: Obj) => void> = {
  DurabilityInfo: durability,
  MicroplasticInfo: microplastic,
  RobustnessAssessment: robustness,
  RecyclabilityAssessment: recyclability,
  RepairabilityInfo: repairability,
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
  rename(doc, at, battery);
  if (battery && isBatteryProduct(doc)) batteryProduct(doc, at);
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

/** Battery terms removed as duplicates in 2026-11 whose successor needed a move or a new shape. */
const BATTERY_REMOVED = new Set([
  "expectedLifetimeYears", "roundTripEnergyEfficiency", "hasDismantlingDocuments", "hasDismantlingInstructions",
  "safetyMeasures", "safetyInstructionsForDismantling",
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
      if (removed || batteryRemoved || renamed) out.push(`${at}.${k}`);
      leftovers(v, `${at}.${k}`, out, textile, battery, bridge);
    }
  }
  return out;
}

const EXAMPLES = ["garment-product", "footwear-product", "hometextile-bedlinen", "organic-tee-product", "fjordline-aurora-model"];
const BATTERY_EXAMPLES = ["amperia-staxwall-item", "amperia-staxwall-model", "battery-product-model", "batterypass-lmt-item", "amperia-staxwall-item.operational", "battery-product-model.operational"];

/** Drop every key the predicate matches, at any depth. */
function without(doc: Json, drop: (key: string) => boolean): Json {
  if (Array.isArray(doc)) return doc.map((v) => without(v, drop));
  if (!doc || typeof doc !== "object") return doc;
  return Object.fromEntries(Object.entries(doc).filter(([k]) => !drop(k)).map(([k, v]) => [k, without(v, drop)]));
}

const BAT = "https://ref.openepcis.org/extensions/eu/battery/battery-context.jsonld";
const BAT_OP = "https://ref.openepcis.org/extensions/eu/battery/battery-operational-context.jsonld";
const BRIDGE = "https://ref.openepcis.org/extensions/eu/battery/battery-context-batterypass-bridge.jsonld";

/** Shapes the examples do not exercise: each input must migrate to exactly the expected document. */
const SYNTHETIC: { name: string; input: Obj; expected: Obj }[] = [
  {
    name: "performance info moves up, ratio becomes a percentage",
    input: {
      "@context": BAT, type: "eubat:Battery",
      "oec:hasPerformanceInfo": { type: "oec:PerformanceInfo", "eubat:roundTripEnergyEfficiency": 0.925, "eubat:hasCurrentSelfDischargingRate": qv(2, "P1") },
      "eubat:hasSelfDischargeRate": qv(3, "P1"),
    },
    expected: {
      "@context": BAT, type: "eubat:Battery",
      "eubat:hasCurrentSelfDischargingRate": qv(3, "P1"),
      "eubat:hasRemainingRoundTripEfficiency": qv(92.5, "P1"),
    },
  },
  {
    name: "safety measures without end-of-life info, string ratio",
    input: { "@context": BAT, "eubat:safetyMeasures": "https://x.example/safety.pdf", "oec:hasPerformanceInfo": { "eubat:roundTripEnergyEfficiency": "0.9", "eubat:hasNegativeEvents": [] } },
    expected: {
      "@context": BAT,
      "oec:hasPerformanceInfo": { "eubat:hasNegativeEvents": [] },
      "eubat:hasRemainingRoundTripEfficiency": qv("90", "P1"),
      "eubat:hasEndOfLifeInfo": { type: "eubat:EndOfLifeInfo", "eubat:hasSafetyMeasures": { type: "oec:DocumentReference", "oec:documentUrl": "https://x.example/safety.pdf" } },
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
      hasRemainingUsableEnergy: { type: "QuantitativeValue", value: 9, unitCode: "KWH" },
      hasEndOfLifeInfo: { type: "EndOfLifeInfo", "eubat:hasSafetyMeasures": { type: "oec:DocumentReference", "oec:documentUrl": "https://x.example/ds.pdf" } },
      hasMaterialComposition: [{ casNumber: "7439-93-2", ecNumber: "231-102-5" }],
      "eubat:hasDismantlingAndRemovalInformation": [
        { type: "eubat:DismantlingDocument", "eubat:hasDocumentType": { "@id": "eubat:DismantlingManual" }, "eubat:documentUrl": "https://x.example/manual.pdf" },
      ],
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
    // 45ccb2f carries the 2026-11 duplicate removal on top of the PR 17 renames of 0142308
    ...BATTERY_EXAMPLES.map((name) => ({ name, file: `extensions/eu/battery/examples/${name}.jsonld`, before: "3aa08bf", after: "45ccb2f", ignore: (k: string) => /hasInitial(Cell|Pack)?InternalResistance$/.test(k) })),
  ];
  for (const { name, file, before, after, ignore } of cases) {
    const show = (rev: string) => JSON.parse(execFileSync("git", ["show", `${rev}:${file}`], { cwd: ROOT, encoding: "utf8" }));
    const migrated = without(migrate(show(before)), ignore);
    const expected = without(show(after), ignore);
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
