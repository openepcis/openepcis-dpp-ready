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
 *   4. RECONSTRUCT   the Amperia StaxWall model, batch and item layers plus the item's EPCIS
 *                    lifecycle stream (scripts/reconstruct-batterypass-ready.ts) give one 2.0.1
 *                    document; with the item's state results removed, the events alone feed them.
 *
 * Values a passport does not state are not failures here: the crosswalk goldens list them
 * (extensions/common/interop/crosswalk/batterypass/tests/*\/roundtrip.txt).
 *
 * Run: pnpm test (after the GEFEG 1.0 harness, scripts/test-batterypass-conformance.ts)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { exportBatteryPassReady } from "./export-batterypass-ready.ts";
import { reconstructReady } from "./reconstruct-batterypass-ready.ts";
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

const AMP = (l: string) => join(ROOT, "extensions/eu/battery/examples", `amperia-staxwall-${l}.jsonld`);
const item = JSON.parse(readFileSync(AMP("item"), "utf8"));
delete item["eubat:hasBatteryState"]["oea:hasResult"];
const rec = await reconstructReady({
  layers: [AMP("model"), AMP("batch"), item],
  events: join(ROOT, "extensions/eu/battery/epcis/amperia-staxwall-lifecycle.jsonld"),
});
const [rdoc] = rec.export.docs as Doc[];
record("RECONSTRUCT: amperia-staxwall layers + events give one 2.0.1 document", rec.export.docs.length === 1,
  `${rec.summary.eventCount} event(s), ${Object.keys(rec.summary.folded).length} value(s) folded`);
if (rdoc) {
  const rperf = rdoc.batteryPassportData?.performanceAndDurability ?? {};
  record("RECONSTRUCT: amperia-staxwall has no wrong form", rec.export.findings[0].form.length === 0, rec.export.findings[0].form.slice(0, 3).join("; "));
  record("RECONSTRUCT: amperia-staxwall is the item, at item granularity",
    rdoc.dppHeader?.uniqueProductIdentifier === "https://id.gs1.org/01/09521234002000/21/STAX10-2026-000001" &&
      rdoc.dppHeader?.granularity?.dppGranularityValue === "item", rdoc.dppHeader?.uniqueProductIdentifier);
  record("RECONSTRUCT: amperia-staxwall cycles are the maximum reading",
    rperf.numberOfFullChargingAndDischargingCycles === 640, String(rperf.numberOfFullChargingAndDischargingCycles));
  record("RECONSTRUCT: amperia-staxwall state of charge and remaining capacity come from the events",
    rperf.stateOfChargeSoC?.percentageValue === 62 && rperf.remainingCapacity?.amperehourMiliamperehourValue === 195,
    `SoC=${rperf.stateOfChargeSoC?.percentageValue} capacity=${rperf.remainingCapacity?.amperehourMiliamperehourValue}`);
  record("RECONSTRUCT: amperia-staxwall resistance increase is against the initial pack resistance",
    rperf.internalResistanceIncreaseOfPackCellAndModuleRecommended?.internalResistanceIncreaseValueForBatteryPack === 6,
    JSON.stringify(rperf.internalResistanceIncreaseOfPackCellAndModuleRecommended));
  record("RECONSTRUCT: amperia-staxwall temperature is the latest reading outside the excursion",
    rperf.temperatureInformation?.celsiusValue === 25, JSON.stringify(rperf.temperatureInformation));
  record("RECONSTRUCT: amperia-staxwall power and round-trip efficiency fade come from the events",
    rperf.powerFade?.percentageValue === 3 && rperf.energyRoundTripEfficiencyFade?.percentageValue === 2,
    `power=${rperf.powerFade?.percentageValue} rte=${rperf.energyRoundTripEfficiencyFade?.percentageValue}`);
  const tempAlarm = rec.passport["eubat:hasBatteryState"]?.["oea:hasResult"]?.find((x: Doc) =>
    x["oea:hasObservedParameter"]?.["@id"] === "eubat:TimeAboveTemperatureBoundary")?.["oea:hasMeasuredValue"]?.["gs1:value"];
  record("RECONSTRUCT: amperia-staxwall temperature alarm counts as 72 min above the boundary", tempAlarm === 72, String(tempAlarm));
  const missing = rec.export.findings[0].missing;
  record("RECONSTRUCT: amperia-staxwall lacks only accident information and the cell resistance (sub-ohm)",
    missing.length === 2 && missing.every((m) => /informationOnAccidents|ohmValueForBatteryCell/.test(m)), missing.join("; "));
  record("RECONSTRUCT: amperia-staxwall lastUpdated is the latest event", rdoc.dppHeader?.lastUpdated === "2026-05-31T09:45:00Z",
    rdoc.dppHeader?.lastUpdated);
}

// The committed 2.0.1 document of the Amperia item (a fixture of the GITB target bpr 2.0.1,
// extensions/common/interop/targets) is what the reconstruction gives today.
const full = await reconstructReady({
  layers: [AMP("model"), AMP("batch"), AMP("item")],
  events: join(ROOT, "extensions/eu/battery/epcis/amperia-staxwall-lifecycle.jsonld"),
});
const committed = readFileSync(join(ROOT, "extensions/eu/battery/examples/amperia-staxwall-item.bpr-2.0.1.json"), "utf8");
record("RECONSTRUCT: amperia-staxwall-item.bpr-2.0.1.json is in step with the reconstruction",
  committed === JSON.stringify(full.export.docs[0], null, 2) + "\n",
  "regenerate with: pnpm run reconstruct:batterypass-ready -- --out extensions/eu/battery/examples/amperia-staxwall-item.bpr-2.0.1.json");
const merged = readFileSync(join(ROOT, "extensions/common/interop/crosswalk/eu-dpp/tests/amperia-stationary-item/ours.jsonld"), "utf8");
record("RECONSTRUCT: the eu-dpp crosswalk case amperia-stationary-item is the merged passport",
  merged === JSON.stringify(full.passport, null, 2) + "\n",
  "regenerate with: pnpm run reconstruct:batterypass-ready -- --passport extensions/common/interop/crosswalk/eu-dpp/tests/amperia-stationary-item/ours.jsonld, then pnpm run build:crosswalk-goldens");

const passed = results.filter((r) => r.passed).length;
console.log("\nBatteryPass-Ready 2.0.1 conformance run (offline, vendored GEFEG schemas)\n" + "=".repeat(60));
for (const r of results) console.log(`  ${r.passed ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  — ${r.detail}` : ""}`);
console.log("=".repeat(60));
console.log(`${passed} passed, ${results.length - passed} failed, ${results.length} total`);
if (passed !== results.length) process.exit(1);
