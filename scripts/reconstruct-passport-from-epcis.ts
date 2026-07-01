/**
 * Reconstruct a GEFEG BatteryPass-Ready passport for one serialized battery by
 * folding its EPCIS lifecycle event stream onto its model + batch master data.
 *
 * WHY: a battery passport is inherently multi-level (see
 * extensions/eu/battery/validation/batterypass-granularity.json and
 * extensions/eu/battery/docs/EPCIS_AND_BATTERYPASS_READY.md):
 *   - Model + ModelPerSite + Batch attributes are static master data, served by
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

type Obj = Record<string, any>;

// ---- GEFEG value-object builders (must match export-batterypass-gefeg.ts) ----
const percent = (v?: number) => (v === undefined ? undefined : { percentageValue: v, percent: "%" });
const ahInt = (v?: number) => (v === undefined ? undefined : { amperehourMiliamperehourValue: v, ampereHourMiliamperehour: "Ah" });
const kwh = (v?: number) => (v === undefined ? undefined : { kilowattHourValue: v, kilowattHour: "kWh" });
const celsius = (v?: number) => (v === undefined ? undefined : { celsiusValue: v, degreeCelsius: "°C" });
const round = (v: number, n = 1) => Math.round(v * 10 ** n) / 10 ** n;

// ---- deep merge (later source wins; arrays replace) ----
function deepMerge(a: Obj, b: Obj): Obj {
  const out: Obj = Array.isArray(a) ? [...a] : { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ---- EPCIS event model ----
interface Report { type: string; value: number; uom?: string; }
interface Ev { epc: string; time: number; timeIso: string; bizStep?: string; disposition?: string; incidentType?: string; reports: Report[]; }

function loadEvents(pathArg: string): Ev[] {
  const files: string[] = [];
  for (const p of pathArg.split(",").map((s) => s.trim()).filter(Boolean)) {
    let isDir = false;
    try { isDir = readdirSync(p).length >= 0; } catch { isDir = false; }
    if (isDir) files.push(...readdirSync(p).filter((f) => f.endsWith(".jsonld")).map((f) => join(p, f)));
    else files.push(p);
  }
  const evs: Ev[] = [];
  for (const f of files) {
    let doc: Obj;
    try { doc = JSON.parse(readFileSync(f, "utf-8")); } catch { continue; }
    const list = doc?.epcisBody?.eventList ?? [];
    for (const e of list) {
      const epcs: string[] = Array.isArray(e.epcList) ? e.epcList : [];
      const reports: Report[] = [];
      for (const se of e.sensorElementList ?? []) {
        for (const r of se.sensorReport ?? []) {
          if (typeof r.value === "number" && typeof r.type === "string") reports.push({ type: r.type, value: r.value, uom: r.uom });
        }
      }
      for (const epc of epcs) {
        evs.push({
          epc,
          time: Date.parse(e.eventTime),
          timeIso: e.eventTime,
          bizStep: e.bizStep,
          disposition: e.disposition,
          incidentType: e["eubat:incidentType"],
          reports,
        });
      }
    }
  }
  return evs;
}

// Pick the serialized (01+21) EPC that appears in the most events.
function inferTargetEpc(evs: Ev[]): string | undefined {
  const counts = new Map<string, number>();
  for (const e of evs) if (/\/21\//.test(e.epc)) counts.set(e.epc, (counts.get(e.epc) ?? 0) + 1);
  let best: string | undefined;
  let n = -1;
  for (const [epc, c] of counts) if (c > n) { best = epc; n = c; }
  return best;
}

function parseDl(epc: string): { gtin?: string; serial?: string } {
  const m = epc.match(/\/01\/(\d{14})(?:\/21\/([^/#?]+))?/);
  return { gtin: m?.[1], serial: m?.[2] };
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

  // 3. Load and fold the item-level EPCIS event stream.
  const eventsPath = opts.events ?? "extensions/eu/battery/epcis";
  const allEvs = loadEvents(eventsPath);
  const targetEpc = opts.epc ?? inferTargetEpc(allEvs);
  const evs = allEvs.filter((e) => e.epc === targetEpc).sort((a, b) => a.time - b.time);

  const reportsAsc = (type: string) => evs.flatMap((e) => e.reports.filter((r) => r.type === type).map((r) => ({ t: e.time, v: r.value })));
  const latest = (type: string): number | undefined => { const xs = reportsAsc(type); return xs.length ? xs[xs.length - 1].v : undefined; };
  const maxVal = (type: string): number | undefined => { const xs = reportsAsc(type); return xs.length ? Math.max(...xs.map((x) => x.v)) : undefined; };

  const ts = (merged.technicalSpecifications ?? {}) as Obj;
  const initialR = (ts.initialInternalResistance as Obj)?.value as number | undefined;
  const ratedEnergy = (ts.ratedEnergy as Obj)?.value as number | undefined;
  const idleMin = ((ts.temperatureRangeIdleState as Obj)?.minimumTemperature as Obj)?.value as number | undefined;
  const idleMax = ((ts.temperatureRangeIdleState as Obj)?.maximumTemperature as Obj)?.value as number | undefined;
  const idleMid = idleMin !== undefined && idleMax !== undefined ? (idleMin + idleMax) / 2 : 25;

  // Temperature excursions: events carrying both a Temperature and an
  // exposure-duration report. Bucket the duration above/below the idle-state
  // boundary; charging buckets need a charging signal (bizStep), absent here.
  const buckets = { above: 0, below: 0, chargingAbove: 0, chargingBelow: 0 };
  let deepDischarge = 0;
  const excursionEventTimes = new Set<number>();
  for (const e of evs) {
    const temp = e.reports.find((r) => r.type === "Temperature")?.value;
    const dur = e.reports.find((r) => r.type === "eubat:exposureDurationMinutes")?.value;
    if (temp !== undefined && dur !== undefined) {
      excursionEventTimes.add(e.time);
      const above = idleMax !== undefined && temp > idleMax ? true : idleMin !== undefined && temp < idleMin ? false : temp >= idleMid;
      const charging = /charg/i.test(e.bizStep ?? "");
      if (charging) buckets[above ? "chargingAbove" : "chargingBelow"] += dur;
      else buckets[above ? "above" : "below"] += dur;
    }
    if (/deep.?discharge/i.test(e.incidentType ?? "")) deepDischarge += 1;
  }
  // Latest representative operating temperature from a non-excursion reading.
  const opTemp = evs.filter((e) => !excursionEventTimes.has(e.time)).flatMap((e) => e.reports.filter((r) => r.type === "Temperature").map((r) => r.value)).pop();

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
  const lastTime = evs.length ? evs[evs.length - 1].timeIso : undefined;
  if (lastTime) set(ident, "Date-timeOfLatestUpdateOfDPP", lastTime);

  // 5. Report the Item-level slots the passport carries that no event fed (so
  // no coverage is silently capped). Uses the granularity map as the authority.
  const gran = JSON.parse(readFileSync("extensions/eu/battery/validation/batterypass-granularity.json", "utf-8"));
  const itemPerf: string[] = Object.entries(gran.groups.PerformanceAndDurability)
    .filter(([, lv]) => Array.isArray(lv) && (lv as string[])[0] === "ItemLevel")
    .map(([k]) => k);
  const leftBeginningOfLife = itemPerf.filter((k) => k in perf && !(k in folded));

  return { passport, summary: { level, targetEpc, folded, leftBeginningOfLife, eventCount: evs.length } };
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
