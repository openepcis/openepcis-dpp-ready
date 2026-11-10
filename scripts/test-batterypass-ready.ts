/**
 * BatteryPass-Ready 2.0.1 conformance (offline): the battery item passports of
 * extensions/eu/battery/examples, exported through the crosswalk profile `batterypass`
 * (scripts/export-batterypass-ready.ts), against the vendored GEFEG JSON Schemas
 * (vendor/batterypass-ready/2.0.1) of each battery's category.
 *
 *   1. SCHEMA        every export has no wrong form; a document without its header's unique
 *                    product identifier is rejected (negative).
 *   2. PLAUSIBILITY  cross-field checks the schemas leave to a future release: voltage order,
 *                    percent ranges, UTC update time, positive carbon footprint.
 *   3. INBOUND       a 2.0.1 document (the crosswalk test case batterypass-stationary-in) is valid
 *                    against its schema and lowers to OpenEPCIS.
 *
 * Values a passport does not state are not failures here: the crosswalk goldens list them
 * (extensions/common/interop/crosswalk/batterypass/tests/*\/roundtrip.txt).
 *
 * Run: pnpm test (after the GEFEG 1.0 harness, scripts/test-batterypass-conformance.ts)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { exportBatteryPassReady } from "./export-batterypass-ready.ts";
import { convert, loadBackground, loadProfile, ROOT } from "./lib/crosswalk.ts";
import { jsonSchemaFindings, theirJsonToQuads } from "./lib/crosswalk-target.ts";

type Doc = Record<string, any>;
const results: { name: string; passed: boolean; detail?: string }[] = [];
const record = (name: string, passed: boolean, detail?: string) => results.push({ name, passed, detail });

const EXAMPLES = ["batterypass-ev-item", "batterypass-lmt-item", "batterypass-industrial-item", "battery-product", "portable-ebike-battery"];
const p = loadProfile("batterypass");
await loadBackground(p);

const num = (v: unknown): number | undefined => (typeof v === "number" ? v : undefined);
for (const name of EXAMPLES) {
  const { docs, findings } = await exportBatteryPassReady(join(ROOT, "extensions/eu/battery/examples", `${name}.jsonld`));
  record(`SCHEMA: ${name} exports one 2.0.1 document`, docs.length === 1, `${docs.length} document(s)`);
  if (docs.length !== 1) continue;
  const [doc] = docs as Doc[];
  const category = doc.batteryPassportData?.identifiersAndProductData?.batteryCategory?.batteryCategoryValue;
  record(`SCHEMA: ${name} (${category}) has no wrong form`, findings[0].form.length === 0,
    findings[0].form.length ? findings[0].form.slice(0, 3).join("; ") : `${findings[0].missing.length} required value(s) the passport does not state`);
  const broken = structuredClone(doc);
  delete broken.dppHeader.uniqueProductIdentifier;
  record(`SCHEMA neg: ${name} without dppHeader.uniqueProductIdentifier is rejected`,
    jsonSchemaFindings(p, broken).missing.some((m) => m.includes("uniqueProductIdentifier")));

  const perf = doc.batteryPassportData?.performanceAndDurability ?? {};
  const [min, nom, max] = [perf.minimumVoltage, perf.nominalVoltage, perf.maximumVoltage].map((v) => num(v?.voltValue));
  record(`PLAUSIBILITY: ${name} minimum ≤ nominal ≤ maximum voltage`,
    [min, nom, max].some((x) => x === undefined) || (min! <= nom! && nom! <= max!), `min=${min} nom=${nom} max=${max}`);
  const pcts: number[] = [];
  JSON.stringify(doc, (k, v) => { if (k === "percentageValue" && typeof v === "number") pcts.push(v); return v; });
  record(`PLAUSIBILITY: ${name} percent values ∈ [0, 100]`, pcts.every((v) => v >= 0 && v <= 100), `${pcts.length} checked`);
  const lu = doc.dppHeader?.lastUpdated;
  record(`PLAUSIBILITY: ${name} lastUpdated is UTC`, lu === undefined || /Z$/.test(lu), String(lu));
  const cf = num(doc.batteryPassportData?.batteryCarbonFootprint?.batteryCarbonFootprintPerFunctionalUnit?.kgCO2EquivalentPerKilowattHourValue);
  record(`PLAUSIBILITY: ${name} carbon footprint per functional unit > 0`, cf === undefined || cf > 0, String(cf));
}

const inbound = JSON.parse(readFileSync(join(p.dir, "tests/batterypass-stationary-in/batterypass.json"), "utf8"));
const f = jsonSchemaFindings(p, inbound);
record("INBOUND: batterypass-stationary-in is valid against its category schema", !f.form.length && !f.missing.length,
  [...f.form, ...f.missing].slice(0, 3).join("; "));
const lowered = convert(p, "lower", await theirJsonToQuads(p, inbound));
record("INBOUND: batterypass-stationary-in lowers to an OpenEPCIS battery", lowered.quads.some((q) =>
  q.predicate.value.endsWith("#type") && q.object.value === "https://ref.openepcis.org/extensions/eu/battery/Battery"),
  `${lowered.quads.length} triples`);

const passed = results.filter((r) => r.passed).length;
console.log("\nBatteryPass-Ready 2.0.1 conformance run (offline, vendored GEFEG schemas)\n" + "=".repeat(60));
for (const r of results) console.log(`  ${r.passed ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  — ${r.detail}` : ""}`);
console.log("=".repeat(60));
console.log(`${passed} passed, ${results.length - passed} failed, ${results.length} total`);
if (passed !== results.length) process.exit(1);
