/**
 * Reconstruct a GEFEG BatteryPass-Ready passport for one serialized battery by
 * folding its EPCIS lifecycle event stream onto its model + batch master data.
 *
 * WHY: a battery passport is inherently multi-level (see
 * extensions/eu/battery/validation/batterypass-granularity.json and
 * extensions/eu/battery/docs/EPCIS_AND_BATTERYPASS_READY.md):
 *   - Model + Batch attributes are static master data, served by
 *     the GS1 Digital Link resolver (01 / 01+10 Digital Links).
 *   - Item attributes (state of health, cycle count, capacity fade, energy
 *     throughput, time in extreme temperatures, ...) are measured per physical
 *     battery and are carried by EPCIS sensor events (01+21 serialized Digital
 *     Link). The exporter (scripts/export-batterypass-gefeg.ts) emits these as
 *     beginning-of-life values because a model-level passport does not carry
 *     them; this script derives their real values by aggregating the events.
 *
 * So:  passport(item) = masterData(model) (+) masterData(batch) (+) fold(events)
 *
 * The static half is produced by the unchanged exporter; this script overlays
 * the folded item-level values onto the exported passport. Only Item-level
 * attributes that the exported (category-pruned) passport actually carries are
 * overlaid, so the result stays valid against the category schema.
 *
 * Multiple granularity variants:
 *   --sources accepts an ordered list of flat master-data sources (e.g. a
 *     model-level source then a batch-level source); they are deep-merged in
 *     order (later wins) before export, so the model and batch layers can be
 *     supplied separately.
 *   --level model|batch|item selects how far to assemble: 'item' (default)
 *     folds the events; 'model'/'batch' stop at the static projection and only
 *     stamp the granularity (useful to inspect each layer; note that a partial
 *     layer is not necessarily complete against the GEFEG category schema, which
 *     expects the full item passport).
 *
 * Usage:
 *   tsx scripts/reconstruct-passport-from-epcis.ts \
 *     --sources extensions/eu/battery/examples/batterypass-ready/reconstruction.source.json \
 *     --category stationary \
 *     --events extensions/eu/battery/epcis \
 *     --out extensions/eu/battery/examples/batterypass-ready/reconstruction.gefeg.json
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { exportGefeg } from "./export-batterypass-gefeg.js";
import { deepMerge, parseEpcisEvents, inferTargetEpc, foldItemEvents } from "./passport/assemble-core.js";

type Obj = Record<string, any>;

// ---- GEFEG value-object builders (must match export-batterypass-gefeg.ts) ----
const percent = (v?: number) => (v === undefined ? undefined : { percentageValue: v, percent: "%" });
const ahInt = (v?: number) => (v === undefined ? undefined : { amperehourMiliamperehourValue: v, ampereHourMiliamperehour: "Ah" });
const kwh = (v?: number) => (v === undefined ? undefined : { kilowattHourValue: v, kilowattHour: "kWh" });
const celsius = (v?: number) => (v === undefined ? undefined : { celsiusValue: v, degreeCelsius: "°C" });
const round = (v: number, n = 1) => Math.round(v * 10 ** n) / 10 ** n;

// ---- fs helper: read EPCIS files/dirs into parsed documents. The pure parse +
// fold live in ./passport/assemble-core (shared with the browser demo). ----
function loadEventDocs(pathArg: string): Obj[] {
  const files: string[] = [];
  for (const p of pathArg.split(",").map((s) => s.trim()).filter(Boolean)) {
    let isDir = false;
    try { isDir = readdirSync(p).length >= 0; } catch { isDir = false; }
    if (isDir) files.push(...readdirSync(p).filter((f) => f.endsWith(".jsonld")).map((f) => join(p, f)));
    else files.push(p);
  }
  const docs: Obj[] = [];
  for (const f of files) {
    try { docs.push(JSON.parse(readFileSync(f, "utf-8"))); } catch { /* skip unparseable */ }
  }
  return docs;
}

export interface ReconstructOpts {
  sources: string[];
  category: string;
  events?: string;
  epc?: string;
  level?: "model" | "batch" | "item";
}

export interface ReconstructResult {
  passport: Obj;
  summary: { level: string; targetEpc?: string; folded: Record<string, unknown>; leftBeginningOfLife: string[]; eventCount: number };
}

export function reconstruct(opts: ReconstructOpts): ReconstructResult {
  const level = opts.level ?? "item";
  // 1. Merge the master-data source layers (model, then batch, ...).
  let merged: Obj = {};
  for (const s of opts.sources) merged = deepMerge(merged, JSON.parse(readFileSync(s, "utf-8")));

  // 2. Export the static passport via the unchanged exporter.
  merged.granularity = level;
  const passport = exportGefeg(merged, opts.category) as Obj;
  const master = passport.Battery_Passport as Obj;
  const perf = (master?.PerformanceAndDurability ?? {}) as Obj;
  const ident = (master?.IdentifiersAndProductData ?? {}) as Obj;

  const folded: Record<string, unknown> = {};
  if (level !== "item") {
    return { passport, summary: { level, folded, leftBeginningOfLife: [], eventCount: 0 } };
  }

  // 3. Load + fold the item-level EPCIS event stream (pure fold in assemble-core).
  const eventsPath = opts.events ?? "extensions/eu/battery/epcis";
  const allEvs = parseEpcisEvents(loadEventDocs(eventsPath));
  const targetEpc = opts.epc ?? inferTargetEpc(allEvs);

  const ts = (merged.technicalSpecifications ?? {}) as Obj;
  const initialR = (ts.initialInternalResistance as Obj)?.value as number | undefined;
  const ratedEnergy = (ts.ratedEnergy as Obj)?.value as number | undefined;
  const idleMin = ((ts.temperatureRangeIdleState as Obj)?.minimumTemperature as Obj)?.value as number | undefined;
  const idleMax = ((ts.temperatureRangeIdleState as Obj)?.maximumTemperature as Obj)?.value as number | undefined;

  const fold = foldItemEvents(allEvs, targetEpc, { idleMin, idleMax });
  const { latest, maxVal, buckets, deepDischarge, opTemp } = fold;

  // 4. Overlay folded values onto the item-level slots the passport carries.
  const set = (group: Obj, key: string, val: unknown) => {
    if (val === undefined) return;
    if (!(key in group)) return; // category schema pruned this slot; do not re-add
    group[key] = val;
    folded[key] = val;
  };

  const capacityFade = latest("eubat:capacityFade");
  const soc = latest("eubat:stateOfCharge");
  const remainingCapacity = latest("eubat:remainingCapacity");
  const cycles = maxVal("eubat:cycleCount");
  const energyThroughput = latest("eubat:energyThroughput");
  const remainingRte = latest("eubat:remainingRoundTripEfficiency");
  const soce = latest("eubat:stateOfCertifiedEnergy");
  const internalR = latest("eubat:internalResistance");

  set(perf, "CapacityFade", percent(capacityFade));
  set(perf, "StateOfChargeSoC", percent(soc));
  set(perf, "RemainingCapacity", ahInt(remainingCapacity === undefined ? undefined : Math.round(remainingCapacity)));
  if (cycles !== undefined) set(perf, "NumberOfFullChargingAndDischargingCycles", Math.round(cycles));
  set(perf, "EnergyThroughput", kwh(energyThroughput));
  set(perf, "RemainingRoundTripEnergyEfficiency", percent(remainingRte));
  if (internalR !== undefined && initialR) set(perf, "InternalResistanceIncreaseOfPackCellAndModuleRecommended", percent(round(((internalR - initialR) / initialR) * 100)));
  if (soce !== undefined && ratedEnergy) set(perf, "StateOfCertifiedEnergySOCE", percent(round((soce / ratedEnergy) * 100)));
  if (opTemp !== undefined) set(perf, "TemperatureInformation", celsius(Math.round(opTemp)));
  set(perf, "TimeSpentInExtremeTemperaturesAboveBoundary", buckets.above);
  set(perf, "TimeSpentInExtremeTemperaturesBelowBoundary", buckets.below);
  set(perf, "TimeSpentChargingDuringExtremeTemperaturesAboveBoundary", buckets.chargingAbove);
  set(perf, "TimeSpentChargingDuringExtremeTemperaturesBelowBoundary", buckets.chargingBelow);
  set(perf, "NumberOfDeepDischargeEvents", deepDischarge);

  // Stamp the passport as item-level and refresh the update timestamp from the
  // most recent event.
  set(ident, "DPPGranularity", "item");
  if (fold.lastTimeIso) set(ident, "Date-timeOfLatestUpdateOfDPP", fold.lastTimeIso);

  // 5. Report the Item-level slots the passport carries that no event fed (so
  // no coverage is silently capped). Uses the granularity map as the authority.
  const gran = JSON.parse(readFileSync("extensions/eu/battery/validation/batterypass-granularity.json", "utf-8"));
  const itemPerf: string[] = Object.entries(gran.groups.PerformanceAndDurability)
    .filter(([, lv]) => Array.isArray(lv) && (lv as string[])[0] === "ItemLevel")
    .map(([k]) => k);
  const leftBeginningOfLife = itemPerf.filter((k) => k in perf && !(k in folded));

  return { passport, summary: { level, targetEpc, folded, leftBeginningOfLife, eventCount: fold.events.length } };
}

// ---- CLI ----
function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) { out[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true"; }
  }
  return out;
}

const isMain = process.argv[1] && process.argv[1].endsWith("reconstruct-passport-from-epcis.ts");
if (isMain) {
  const a = parseArgs(process.argv.slice(2));
  const D = "extensions/eu/battery/examples/batterypass-ready";
  const sources = (a.sources ?? `${D}/reconstruction.source.json`).split(",").map((s) => s.trim());
  const category = a.category ?? "stationary";
  const level = (a.level as ReconstructOpts["level"]) ?? "item";
  const res = reconstruct({ sources, category, events: a.events, epc: a.epc, level });
  const json = JSON.stringify(res.passport, null, 2) + "\n";
  if (a.out) writeFileSync(a.out, json);

  const s = res.summary;
  console.log(`Reconstructed ${category} passport at level '${s.level}' for ${s.targetEpc ?? "(no serialized EPC)"} from ${s.eventCount} event(s).`);
  if (s.level === "item") {
    console.log(`Folded ${Object.keys(s.folded).length} item-level attribute(s) from the EPCIS stream:`);
    for (const [k, v] of Object.entries(s.folded)) console.log(`  ${k} = ${JSON.stringify(v)}`);
    if (s.leftBeginningOfLife.length) console.log(`Item-level slots left at beginning-of-life (no feeding event): ${s.leftBeginningOfLife.join(", ")}`);
  }
  if (a.out) console.log(`Wrote ${a.out}`);
  else process.stdout.write(json);
}
