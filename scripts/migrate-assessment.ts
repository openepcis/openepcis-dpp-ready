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
};

/** Removed without a one-to-one successor (guidance 3.2 #38 wants cell and pack values); reported, kept. */
const REPORT_ONLY = new Set(["eubat:hasInitialInternalResistance", "hasInitialInternalResistance"]);

/** What a run dropped or could not place; printed, never fatal. */
export const notes: string[] = [];

function rename(o: Obj, at: string) {
  for (const [k, v] of Object.entries(o)) {
    const to = RENAMED[k];
    if (to) {
      if (!(to in o)) o[to] = v;
      else if (JSON.stringify(o[to]) !== JSON.stringify(v)) notes.push(`${at}.${k} = ${JSON.stringify(v)} dropped, ${to} = ${JSON.stringify(o[to])} stays`);
      delete o[k];
    }
    if (REPORT_ONLY.has(k)) notes.push(`${at}.${k} = ${JSON.stringify(v)} has no successor in the context (cell or pack value?), left as is`);
  }
}

const BY_TYPE: Record<string, (o: Obj) => void> = {
  DurabilityInfo: durability,
  MicroplasticInfo: microplastic,
  RobustnessAssessment: robustness,
  RecyclabilityAssessment: recyclability,
  RepairabilityInfo: repairability,
};

/** Migrate a document in place and return it. */
export function migrate(doc: Json, at = "$"): Json {
  if (Array.isArray(doc)) {
    doc.forEach((v, i) => migrate(v, `${at}[${i}]`));
    return doc;
  }
  if (!doc || typeof doc !== "object") return doc;
  for (const [k, v] of Object.entries(doc)) migrate(v, `${at}.${k}`);
  for (const t of typeOf(doc)) BY_TYPE[t]?.(doc);
  rename(doc, at);
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

export function leftovers(doc: Json, at = "$", out: string[] = [], textile?: boolean): string[] {
  // A bare key is one of the textile terms only under a textile context; eubat:expectedLifetimeYears
  // and friends are other terms of the same name and stay bare under the battery operational context.
  if (textile === undefined) textile = /\/textile\//.test(JSON.stringify(doc?.["@context"] ?? ""));
  if (Array.isArray(doc)) doc.forEach((v, i) => leftovers(v, `${at}[${i}]`, out, textile));
  else if (doc && typeof doc === "object") {
    for (const [k, v] of Object.entries(doc)) {
      const removed = REMOVED.has(local(k)) && (/^(eutex:|oec:)/.test(k) || (textile && !k.includes(":")));
      if (removed || k in RENAMED) out.push(`${at}.${k}`);
      leftovers(v, `${at}.${k}`, out, textile);
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

async function check(): Promise<number> {
  const jsonld = (await import("jsonld")).default as any;
  const { offlineDocumentLoader } = await import("./lib/jsonld-loader.ts");
  const loader = await offlineDocumentLoader();
  const nquads = (doc: Json) => jsonld.canonize(doc, { algorithm: "URDNA2015", format: "application/n-quads", documentLoader: loader, safe: false });
  let failed = 0;
  const cases = [
    // d1e28a7 predates the lastDataUpdate rename, so the timestamp is left out of the textile comparison
    ...EXAMPLES.map((name) => ({ name, file: `extensions/eu/textile/examples/${name}.jsonld`, before: "d1e28a7^", after: "d1e28a7", ignore: (k: string) => /^(oec:)?last(DataUpdate|Updated)$/.test(k) })),
    ...BATTERY_EXAMPLES.map((name) => ({ name, file: `extensions/eu/battery/examples/${name}.jsonld`, before: "3aa08bf", after: "0142308", ignore: (k: string) => /hasInitial(Cell|Pack)?InternalResistance$/.test(k) })),
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
  if (failed) {
    console.error(`✗ assessment migration: ${failed}/${cases.length} example(s) differ from the hand migration (d1e28a7, 0142308)`);
    return 1;
  }
  console.log(`✓ assessment migration: ${cases.length} examples match the hand migrations in d1e28a7 and 0142308 as RDF`);
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
