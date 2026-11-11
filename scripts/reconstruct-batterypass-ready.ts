/**
 * Reconstruct a BatteryPass-Ready 2.0.1 passport for one serialized battery from its OpenEPCIS
 * passport layers and its EPCIS event stream.
 *
 * passport(item) = model layer (+) batch layer (+) item layer (+) fold(events), all in the
 * OpenEPCIS model; the 2.0.1 document is then the crosswalk export of that one passport
 * (scripts/export-batterypass-ready.ts, profile extensions/common/interop/crosswalk/batterypass).
 *
 * - The layers are OpenEPCIS JSON-LD documents of the same battery at model (01), batch (01+10)
 *   and item (01+21) granularity, compacted with the same contexts. They are merged key by key,
 *   the finer layer winning; the result carries the item's id and item granularity.
 * - The fold (scripts/passport/assemble-core.ts, shared with reconstruct-passport-from-epcis.ts
 *   and the browser demo) reads the sensor reports of the item's events. A report's type is the
 *   eubat: performance parameter it measures, so each value becomes, or replaces, the result
 *   observing that parameter under eubat:hasBatteryState. Derived values: the full-cycle count is
 *   the maximum reading; SOCE given in kWh becomes a share of the rated energy; the internal
 *   resistance increase is against the initial pack resistance of the performance test; the time
 *   above / below the temperature boundaries (also while charging) and the deep-discharge events
 *   are summed over the stream; the battery temperature is the latest reading outside an excursion;
 *   oec:lastUpdated is the time of the latest event.
 *
 * The older GEFEG upload shape (data model 1.0, longlist v1.3) is reconstruct-passport-from-epcis.ts.
 *
 * Usage:
 *   tsx scripts/reconstruct-batterypass-ready.ts \
 *     --layers extensions/eu/battery/examples/amperia-staxwall-model.jsonld,…-batch.jsonld,…-item.jsonld \
 *     --events extensions/eu/battery/epcis/amperia-staxwall-lifecycle.jsonld \
 *     [--epc <item Digital Link>] [--passport merged.jsonld] [--out passport.bpr.json]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { foldItemEvents, inferTargetEpc, parseEpcisEvents, type FoldEvent } from "./passport/assemble-core.ts";
import { exportBatteryPassReadyDoc, type ReadyExport } from "./export-batterypass-ready.ts";

type Obj = Record<string, any>;

const STATE = "eubat:hasBatteryState";

/** Parameters whose latest reading is the current value. */
const LATEST = [
  "eubat:StateOfHealth",
  "eubat:StateOfCharge",
  "eubat:RemainingCapacity",
  "eubat:RemainingUsableEnergy",
  "eubat:CapacityFade",
  "eubat:PowerFade",
  "eubat:InternalResistance",
  "eubat:EnergyThroughput",
  "eubat:CapacityThroughput",
  "eubat:RemainingRoundTripEfficiency",
  "eubat:RoundTripEfficiencyFade",
  "eubat:SelfDischargeRate",
];

export interface ReadyReconstruction {
  passport: Obj;
  export: ReadyExport;
  summary: { targetEpc?: string; eventCount: number; folded: Record<string, number> };
}

function loadEventDocs(pathArg: string): Obj[] {
  const files: string[] = [];
  for (const p of pathArg.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (statSync(p).isDirectory()) files.push(...readdirSync(p).filter((f) => f.endsWith(".jsonld")).map((f) => join(p, f)));
    else files.push(p);
  }
  return files.map((f) => JSON.parse(readFileSync(f, "utf8")));
}

/** Merge the layers key by key (later = finer wins); comments are dropped. */
export function mergeLayers(layers: Obj[]): Obj {
  const out: Obj = {};
  for (const layer of layers) {
    for (const [k, v] of Object.entries(layer)) if (!k.startsWith("_comment")) out[k] = v;
  }
  out["oec:granularityLevel"] = "item";
  out["oec:hasReportingGranularity"] = { id: "oec:ItemLevel" };
  return out;
}

const num = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};
const arr = (v: unknown): Obj[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]) as Obj[];
const idOf = (v: unknown): string | undefined => (typeof v === "string" ? v : (v as Obj)?.["@id"] ?? (v as Obj)?.id);

/** The measured value of the first result anywhere in `node` that observes `parameter`. */
function findResult(node: unknown, parameter: string): number | undefined {
  if (Array.isArray(node)) {
    for (const n of node) {
      const v = findResult(n, parameter);
      if (v !== undefined) return v;
    }
    return undefined;
  }
  if (!node || typeof node !== "object") return undefined;
  const o = node as Obj;
  if (idOf(o["oea:hasObservedParameter"]) === parameter) return num(o["oea:hasMeasuredValue"]?.["gs1:value"]);
  for (const v of Object.values(o)) {
    const r = findResult(v, parameter);
    if (r !== undefined) return r;
  }
  return undefined;
}

/** xsd:decimal travels as a JSON string (see assemble-core), whole numbers as JSON numbers. */
const literal = (v: number): number | string => (Number.isInteger(v) ? v : String(Math.round(v * 1000) / 1000));

function upsertResult(state: Obj, parameter: string, value: number, unitCode: string): void {
  const results = arr(state["oea:hasResult"]);
  const measured = { type: "gs1:QuantitativeValue", "gs1:value": literal(value), "gs1:unitCode": unitCode };
  const existing = results.find((r) => idOf(r["oea:hasObservedParameter"]) === parameter && !r["oea:hasCondition"]);
  if (existing) existing["oea:hasMeasuredValue"] = measured;
  else results.push({ type: "oea:MeasurementResult", "oea:hasObservedParameter": { "@id": parameter }, "oea:hasMeasuredValue": measured });
  state["oea:hasResult"] = results;
}

/** The unit of the latest report of `type` in the item's events. */
function latestUom(evs: FoldEvent[], type: string): string | undefined {
  let uom: string | undefined;
  for (const e of evs) for (const r of e.reports) if (r.type === type && r.uom) uom = r.uom;
  return uom;
}

/** `layers`: file paths or parsed JSON-LD documents, coarsest first. */
export async function reconstructReady(opts: { layers: (string | Obj)[]; events: string; epc?: string }): Promise<ReadyReconstruction> {
  const passport = mergeLayers(opts.layers.map((l) => (typeof l === "string" ? JSON.parse(readFileSync(l, "utf8")) : structuredClone(l))));
  const allEvs = parseEpcisEvents(loadEventDocs(opts.events));
  const targetEpc = opts.epc ?? passport.id ?? inferTargetEpc(allEvs);

  const ts = (passport["eubat:hasTechnicalSpecifications"] ?? {}) as Obj;
  const tempRange = (ts["eubat:hasTemperatureRangeIdleState"] ?? {}) as Obj;
  const idleMin = num(tempRange["eubat:hasMinimumTemperature"]?.["gs1:value"]);
  const idleMax = num(tempRange["eubat:hasMaximumTemperature"]?.["gs1:value"]);
  const ratedEnergy = num(ts["eubat:hasRatedEnergy"]?.["gs1:value"]);
  const initialR = findResult(passport, "eubat:InitialPackInternalResistance");

  const fold = foldItemEvents(allEvs, targetEpc, { idleMin, idleMax });
  const state: Obj = (passport[STATE] ??= { type: "eubat:BatteryStateAssessment" });
  const folded: Record<string, number> = {};
  const put = (parameter: string, value: number | undefined, unitCode: string | undefined) => {
    if (value === undefined || !unitCode) return;
    upsertResult(state, parameter, value, unitCode);
    folded[parameter] = value;
  };

  for (const p of LATEST) put(p, fold.latest(p), latestUom(fold.events, p));
  put("eubat:FullCycleCount", fold.maxVal("eubat:FullCycleCount"), "C62");

  const soce = fold.latest("eubat:StateOfCertifiedEnergy");
  const soceUom = latestUom(fold.events, "eubat:StateOfCertifiedEnergy");
  if (soce !== undefined && soceUom === "KWH" && ratedEnergy) put("eubat:StateOfCertifiedEnergy", Math.round((soce / ratedEnergy) * 1000) / 10, "P1");
  else if (soce !== undefined && soceUom === "P1") put("eubat:StateOfCertifiedEnergy", soce, "P1");

  const internalR = fold.latest("eubat:InternalResistance");
  if (internalR !== undefined && initialR) {
    put("eubat:InternalResistanceIncrease", Math.round(((internalR - initialR) / initialR) * 1000) / 10, "P1");
  }

  const { above, below, chargingAbove, chargingBelow } = fold.buckets;
  if (above + below + chargingAbove + chargingBelow > 0) {
    put("eubat:TimeAboveTemperatureBoundary", above, "MIN");
    put("eubat:TimeBelowTemperatureBoundary", below, "MIN");
    put("eubat:ChargingTimeAboveTemperatureBoundary", chargingAbove, "MIN");
    put("eubat:ChargingTimeBelowTemperatureBoundary", chargingBelow, "MIN");
  }
  if (fold.deepDischarge > 0) put("eubat:DeepDischargeEvents", fold.deepDischarge, "C62");
  put("eubat:BatteryTemperature", fold.opTemp, "CEL");
  if (fold.lastTimeIso) passport["oec:lastUpdated"] = fold.lastTimeIso;

  return {
    passport,
    export: await exportBatteryPassReadyDoc(passport),
    summary: { targetEpc, eventCount: fold.events.length, folded },
  };
}

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) out[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
  }
  return out;
}

if (process.argv[1]?.endsWith("reconstruct-batterypass-ready.ts")) {
  const a = parseArgs(process.argv.slice(2));
  const D = "extensions/eu/battery/examples";
  const layers = (a.layers ?? ["model", "batch", "item"].map((l) => `${D}/amperia-staxwall-${l}.jsonld`).join(","))
    .split(",")
    .map((s) => s.trim());
  const events = a.events ?? "extensions/eu/battery/epcis/amperia-staxwall-lifecycle.jsonld";
  const res = await reconstructReady({ layers, events, epc: a.epc });
  const { docs, findings } = res.export;
  if (a.passport) writeFileSync(a.passport, JSON.stringify(res.passport, null, 2) + "\n");
  if (!docs.length) {
    console.error("no item-level battery passport with a category after the merge: nothing to export");
    process.exit(1);
  }
  const json = JSON.stringify(docs[0], null, 2) + "\n";
  if (a.out) writeFileSync(a.out, json);
  else process.stdout.write(json);
  const s = res.summary;
  console.error(`Reconstructed ${s.targetEpc ?? "(no serialized EPC)"} from ${layers.length} layer(s) and ${s.eventCount} event(s).`);
  for (const [k, v] of Object.entries(s.folded)) console.error(`  folded ${k} = ${v}`);
  for (const m of findings[0].missing) console.error(`  missing  ${m}`);
  for (const m of findings[0].form) console.error(`  FORM     ${m}`);
  if (findings[0].form.length) process.exit(1);
}
