/**
 * Pure, browser-safe core for assembling an item-level battery passport by
 * folding its EPCIS lifecycle event stream. No `fs`, no exporter, no Node APIs —
 * it takes already-parsed EPCIS documents and returns the folded item-level
 * values plus per-metric PROVENANCE (which event fed each value).
 *
 * Used by both:
 *   - the CLI (scripts/reconstruct-passport-from-epcis.ts), which reads files +
 *     runs the GEFEG exporter around this fold, and
 *   - the Passport Explorer demo (bundled by esbuild), which animates the
 *     item-level values folding in as the timeline advances.
 *
 * Mirrors the pure/CLI split of scripts/en18223/derive-core.ts.
 */

export type Obj = Record<string, any>;

export interface SensorReport { type: string; value: number; uom?: string }

/** One EPCIS event flattened to (epc, time, bizStep, disposition, reports). */
export interface FoldEvent {
  epc: string;
  eventID?: string;
  time: number;
  timeIso: string;
  eventType?: string;
  bizStep?: string;
  disposition?: string;
  incidentType?: string;
  reports: SensorReport[];
}

/** Deep merge (later source wins; arrays replace). Pure. */
export function deepMerge(a: Obj, b: Obj): Obj {
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

/** Flatten parsed EPCIS documents to per-EPC FoldEvents (one per epcList entry). */
export function parseEpcisEvents(docs: Obj[]): FoldEvent[] {
  const evs: FoldEvent[] = [];
  for (const doc of docs) {
    const list = doc?.epcisBody?.eventList ?? [];
    for (const e of list) {
      const epcs: string[] = Array.isArray(e.epcList) ? e.epcList : [];
      const reports: SensorReport[] = [];
      for (const se of e.sensorElementList ?? []) {
        for (const r of se.sensorReport ?? []) {
          if (typeof r.value === "number" && typeof r.type === "string") reports.push({ type: r.type, value: r.value, uom: r.uom });
        }
      }
      for (const epc of epcs) {
        evs.push({
          epc,
          eventID: e.eventID,
          time: Date.parse(e.eventTime),
          timeIso: e.eventTime,
          eventType: e.type,
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

/** The serialized (01+21) EPC that appears in the most events. */
export function inferTargetEpc(evs: FoldEvent[]): string | undefined {
  const counts = new Map<string, number>();
  for (const e of evs) if (/\/21\//.test(e.epc)) counts.set(e.epc, (counts.get(e.epc) ?? 0) + 1);
  let best: string | undefined;
  let n = -1;
  for (const [epc, c] of counts) if (c > n) { best = epc; n = c; }
  return best;
}

export function parseDigitalLink(epc: string): { gtin?: string; serial?: string } {
  const m = epc.match(/\/01\/(\d{14})(?:\/21\/([^/#?]+))?/);
  return { gtin: m?.[1], serial: m?.[2] };
}

/** A single contributing sensor reading, for provenance display. */
export interface Reading { value: number; timeIso: string; bizStep?: string; eventID?: string }

export interface FoldResult {
  /** Events for the target EPC, ascending by time. */
  events: FoldEvent[];
  latest(type: string): number | undefined;
  maxVal(type: string): number | undefined;
  /** All readings of a metric type, ascending — the provenance trail. */
  readings(type: string): Reading[];
  buckets: { above: number; below: number; chargingAbove: number; chargingBelow: number };
  deepDischarge: number;
  /** Latest representative operating temperature (from a non-excursion reading). */
  opTemp: number | undefined;
  /** ISO time of the most recent event (for Date-timeOfLatestUpdateOfDPP). */
  lastTimeIso: string | undefined;
}

/**
 * Fold the event stream for one battery into item-level aggregates + provenance.
 * `idleMin`/`idleMax` (from the model's temperatureRangeIdleState) bound the
 * temperature-excursion buckets. Pure: same inputs -> same result.
 */
export function foldItemEvents(
  allEvents: FoldEvent[],
  target: string | undefined,
  opts: { idleMin?: number; idleMax?: number } = {},
): FoldResult {
  const evs = allEvents.filter((e) => e.epc === target).sort((a, b) => a.time - b.time);

  const readings = (type: string): Reading[] =>
    evs.flatMap((e) => e.reports.filter((r) => r.type === type).map((r) => ({ value: r.value, timeIso: e.timeIso, bizStep: e.bizStep, eventID: e.eventID })));
  const latest = (type: string): number | undefined => { const xs = readings(type); return xs.length ? xs[xs.length - 1].value : undefined; };
  const maxVal = (type: string): number | undefined => { const xs = readings(type); return xs.length ? Math.max(...xs.map((x) => x.value)) : undefined; };

  const { idleMin, idleMax } = opts;
  const idleMid = idleMin !== undefined && idleMax !== undefined ? (idleMin + idleMax) / 2 : 25;

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
  const opTemp = evs.filter((e) => !excursionEventTimes.has(e.time)).flatMap((e) => e.reports.filter((r) => r.type === "Temperature").map((r) => r.value)).pop();
  const lastTimeIso = evs.length ? evs[evs.length - 1].timeIso : undefined;

  return { events: evs, latest, maxVal, readings, buckets, deepDischarge, opTemp, lastTimeIso };
}
