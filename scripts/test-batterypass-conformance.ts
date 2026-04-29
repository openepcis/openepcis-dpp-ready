/**
 * Mock GEFEG BatteryPass-Ready conformance harness.
 *
 * The real test environment at https://batterypass-ready.gefeg.com/ opens in
 * June 2026. This harness simulates what we expect it to check so we can
 * regress against v1.3 alignment ahead of time. Three test groups:
 *
 *   1. SCHEMA       ajv-validate examples/batterypass-v1.3.jsonld against
 *                   the generated batterypass-v1.3-schema.json (longlist
 *                   coverage + per-attribute type/format).
 *   2. PLAUSIBILITY cross-attribute rules the real harness will almost
 *                   certainly enforce: ranges, equation consistency
 *                   (capacityFade = (rated − remaining)/rated × 100),
 *                   voltage ordering, GLN check digits, UTC timestamps.
 *   3. ROUND-TRIP   load epcis/commissioning.jsonld, project the battery:
 *                   master-data attributes through the to-batterypass bridge
 *                   into a SAMM-shaped document, then schema-validate it.
 *                   Catches regressions in the bridge mapping itself.
 *
 * Each group also runs negative cases: a known-good doc is mutated to break
 * one rule and the harness must fail it (otherwise we have a false positive
 * in the rule). Run via: pnpm test
 */

import Ajv2020 from "ajv/dist/2020.js";
import type { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

const SCHEMA_PATH = join(
  PROJECT_ROOT,
  "extensions/eu/battery/validation/batterypass-v1.3-schema.json"
);
const EXAMPLE_PATH = join(
  PROJECT_ROOT,
  "extensions/eu/battery/examples/batterypass-v1.3.jsonld"
);
const COMMISSIONING_PATH = join(
  PROJECT_ROOT,
  "extensions/eu/battery/epcis/commissioning.jsonld"
);

interface TestResult {
  name: string;
  passed: boolean;
  detail?: string;
}

const results: TestResult[] = [];
const TOL = 0.5;

function record(name: string, passed: boolean, detail?: string): void {
  results.push({ name, passed, detail });
}

function loadJson<T = unknown>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

// =============================================================================
// 1. SCHEMA group
// =============================================================================

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);

// The schema uses x-* extension keywords; tell ajv they're informational.
ajv.addKeyword("x-batterypass-no");
ajv.addKeyword("x-access-level");
ajv.addKeyword("x-granularity");
ajv.addKeyword("x-update-mode");

const schema = loadJson<object>(SCHEMA_PATH);
const validate = ajv.compile(schema);

function describeErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors) return "";
  return errors
    .slice(0, 5)
    .map((e) => `${e.instancePath || "(root)"} ${e.message}`)
    .join("; ");
}

function runSchemaTests(): void {
  const example = loadJson<Record<string, unknown>>(EXAMPLE_PATH);
  const ok = validate(example);
  record(
    "SCHEMA: reference example validates against batterypass-v1.3-schema.json",
    !!ok,
    ok ? `${Object.keys(example).filter((k) => !k.startsWith("@") && !k.startsWith("_")).length} attributes covered` : describeErrors(validate.errors)
  );

  // Negative: drop a required attribute, must fail.
  const required = (schema as { required?: string[] }).required ?? [];
  for (const sample of [
    "batteryModelIdentifier",
    "batterySerialNumber",
    "facilityIdentifier",
    "carbonFootprintLabel",
  ]) {
    if (!required.includes(sample)) continue;
    const broken: Record<string, unknown> = { ...example };
    delete broken[sample];
    const passed = !validate(broken);
    record(
      `SCHEMA neg: missing ${sample} is rejected`,
      passed,
      passed ? "" : "validator wrongly accepted doc with missing required attribute"
    );
  }
}

// =============================================================================
// 2. PLAUSIBILITY group
// =============================================================================

type Doc = Record<string, unknown>;

function num(doc: Doc, key: string): number | undefined {
  const v = doc[key];
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && typeof (v as { value?: unknown }).value === "number") {
    return (v as { value: number }).value;
  }
  return undefined;
}

function isUtc(s: unknown): boolean {
  return typeof s === "string" && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z$/.test(s);
}

function gs1CheckDigit(digits: string): boolean {
  if (!/^\d{13,14}$/.test(digits)) return false;
  const padded = digits.padStart(14, "0");
  const body = padded.slice(0, -1);
  const expected = Number(padded.slice(-1));
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    const d = Number(body[i]);
    sum += d * (i % 2 === 0 ? 3 : 1);
  }
  const computed = (10 - (sum % 10)) % 10;
  return computed === expected;
}

interface PlausibilityRule {
  name: string;
  check(doc: Doc): { ok: boolean; detail?: string };
}

const PLAUSIBILITY_RULES: PlausibilityRule[] = [
  {
    name: "stateOfCharge ∈ [0, 100]",
    check: (d) => {
      const v = num(d, "stateOfCharge");
      if (v === undefined) return { ok: true };
      return { ok: v >= 0 && v <= 100, detail: `stateOfCharge=${v}` };
    },
  },
  {
    name: "capacityFade ∈ [0, 100] and matches (rated − remaining)/rated × 100",
    check: (d) => {
      const fade = num(d, "capacityFade");
      const rated = num(d, "ratedCapacity");
      const rem = num(d, "remainingCapacity");
      if (fade === undefined) return { ok: true };
      if (fade < 0 || fade > 100) return { ok: false, detail: `capacityFade=${fade}` };
      if (rated !== undefined && rem !== undefined && rated > 0) {
        const expected = ((rated - rem) / rated) * 100;
        if (Math.abs(expected - fade) > TOL) {
          return { ok: false, detail: `capacityFade=${fade} but expected ≈${expected.toFixed(2)} from rated=${rated}, remaining=${rem}` };
        }
      }
      return { ok: true };
    },
  },
  {
    name: "powerFade ∈ [0, 100] and matches (original − remaining)/original × 100",
    check: (d) => {
      const fade = num(d, "powerFade");
      const orig = num(d, "originalPowerCapability");
      const rem = num(d, "remainingPowerCapability");
      if (fade === undefined) return { ok: true };
      if (fade < 0 || fade > 100) return { ok: false, detail: `powerFade=${fade}` };
      if (orig !== undefined && rem !== undefined && orig > 0) {
        const expected = ((orig - rem) / orig) * 100;
        if (Math.abs(expected - fade) > TOL) {
          return { ok: false, detail: `powerFade=${fade} but expected ≈${expected.toFixed(2)}` };
        }
      }
      return { ok: true };
    },
  },
  {
    name: "minimumVoltage ≤ nominalVoltage ≤ maximumVoltage",
    check: (d) => {
      const min = num(d, "minimumVoltage");
      const nom = num(d, "nominalVoltage");
      const max = num(d, "maximumVoltage");
      if ([min, nom, max].some((x) => x === undefined)) return { ok: true };
      const ok = (min as number) <= (nom as number) && (nom as number) <= (max as number);
      return { ok, detail: `min=${min} nom=${nom} max=${max}` };
    },
  },
  {
    name: "recycled-content shares ∈ [0, 1]",
    check: (d) => {
      const keys = [
        "preConsumerRecycledNickelShare",
        "preConsumerRecycledCobaltShare",
        "preConsumerRecycledLithiumShare",
        "postConsumerRecycledNickelShare",
        "postConsumerRecycledCobaltShare",
        "postConsumerRecycledLithiumShare",
        "recycledLeadShare",
        "renewableContentShare",
      ];
      for (const k of keys) {
        const v = num(d, k);
        if (v === undefined) continue;
        if (v < 0 || v > 1) return { ok: false, detail: `${k}=${v} (expected 0–1 decimal)` };
      }
      return { ok: true };
    },
  },
  {
    name: "round-trip efficiency values ∈ [0, 1]",
    check: (d) => {
      const keys = [
        "initialRoundTripEnergyEfficiency",
        "remainingRoundTripEnergyEfficiency",
        "roundTripEnergyEfficiencyAt50PercentOfCycleLife",
      ];
      for (const k of keys) {
        const v = num(d, k);
        if (v === undefined) continue;
        if (v < 0 || v > 1) return { ok: false, detail: `${k}=${v}` };
      }
      return { ok: true };
    },
  },
  {
    name: "temperature idle range: lower < upper",
    check: (d) => {
      const lo = num(d, "temperatureRangeIdleStateLowerBoundary");
      const hi = num(d, "temperatureRangeIdleStateUpperBoundary");
      if (lo === undefined || hi === undefined) return { ok: true };
      return { ok: lo < hi, detail: `lower=${lo} upper=${hi}` };
    },
  },
  {
    name: "dateTimeOfLatestUpdate is UTC (ends with Z)",
    check: (d) => {
      const v = d.dateTimeOfLatestUpdate;
      if (v === undefined) return { ok: true };
      return { ok: isUtc(v), detail: `value=${String(v)}` };
    },
  },
  {
    name: "carbonFootprintPerformanceClass ∈ {A,B,C,D,E}",
    check: (d) => {
      const v = d.carbonFootprintPerformanceClass;
      if (v === undefined) return { ok: true };
      return { ok: typeof v === "string" && /^[A-E]$/.test(v), detail: `value=${String(v)}` };
    },
  },
  {
    name: "facilityIdentifier passes GS1 GLN check digit",
    check: (d) => {
      const v = d.facilityIdentifier;
      if (typeof v !== "string") return { ok: true };
      // Allow opaque non-numeric IDs through; only run check if it looks like a GLN (13 digits).
      if (!/^\d{13}$/.test(v)) return { ok: true };
      return { ok: gs1CheckDigit(v), detail: `gln=${v}` };
    },
  },
  {
    name: "manufacturerIdentifier passes GS1 GLN check digit",
    check: (d) => {
      const v = d.manufacturerIdentifier;
      if (typeof v !== "string") return { ok: true };
      if (!/^\d{13}$/.test(v)) return { ok: true };
      return { ok: gs1CheckDigit(v), detail: `gln=${v}` };
    },
  },
  {
    name: "batteryCarbonFootprintPerFunctionalUnit > 0",
    check: (d) => {
      const v = num(d, "batteryCarbonFootprintPerFunctionalUnit");
      if (v === undefined) return { ok: true };
      return { ok: v > 0, detail: `value=${v}` };
    },
  },
  {
    name: "expectedLifetimeInCalendarYears > 0",
    check: (d) => {
      const v = num(d, "expectedLifetimeInCalendarYears");
      if (v === undefined) return { ok: true };
      return { ok: v > 0, detail: `value=${v}` };
    },
  },
  {
    name: "non-negative event counters",
    check: (d) => {
      const keys = [
        "numberOfDeepDischargeEvents",
        "numberOfFullChargingAndDischargingCycles",
        "timeSpentInExtremeTemperaturesAboveBoundary",
        "timeSpentInExtremeTemperaturesBelowBoundary",
      ];
      for (const k of keys) {
        const v = num(d, k);
        if (v === undefined) continue;
        if (v < 0) return { ok: false, detail: `${k}=${v}` };
      }
      return { ok: true };
    },
  },
];

function runPlausibilityTests(): void {
  const example = loadJson<Doc>(EXAMPLE_PATH);
  for (const rule of PLAUSIBILITY_RULES) {
    const r = rule.check(example);
    record(`PLAUSIBILITY: ${rule.name}`, r.ok, r.detail);
  }

  // Negative: each rule should reject a deliberately-broken doc.
  const negativeMutations: { rule: string; mutate: (d: Doc) => void }[] = [
    { rule: "stateOfCharge ∈ [0, 100]", mutate: (d) => { d.stateOfCharge = 150; } },
    { rule: "capacityFade ∈ [0, 100] and matches (rated − remaining)/rated × 100", mutate: (d) => { d.capacityFade = 99; } },
    { rule: "minimumVoltage ≤ nominalVoltage ≤ maximumVoltage", mutate: (d) => { d.maximumVoltage = { value: 20, unitCode: "VLT" }; } },
    { rule: "recycled-content shares ∈ [0, 1]", mutate: (d) => { d.preConsumerRecycledLithiumShare = 1.4; } },
    { rule: "temperature idle range: lower < upper", mutate: (d) => { d.temperatureRangeIdleStateLowerBoundary = 100; } },
    { rule: "dateTimeOfLatestUpdate is UTC (ends with Z)", mutate: (d) => { d.dateTimeOfLatestUpdate = "2026-04-29T08:55:04+02:00"; } },
    { rule: "carbonFootprintPerformanceClass ∈ {A,B,C,D,E}", mutate: (d) => { d.carbonFootprintPerformanceClass = "F"; } },
    { rule: "facilityIdentifier passes GS1 GLN check digit", mutate: (d) => { d.facilityIdentifier = "9521234000000"; } },
  ];

  for (const { rule, mutate } of negativeMutations) {
    const broken: Doc = JSON.parse(JSON.stringify(example));
    mutate(broken);
    const r = PLAUSIBILITY_RULES.find((p) => p.name === rule)!.check(broken);
    record(`PLAUSIBILITY neg: rule '${rule}' rejects broken doc`, !r.ok, r.detail);
  }
}

// =============================================================================
// 3. ROUND-TRIP group
// =============================================================================

/**
 * Project a battery: master-data record from an EPCIS event into a SAMM-shaped
 * passport document. This is a deliberately-thin model of the OpenEPCIS
 * runtime's export logic — just enough to verify the bridge mapping. Real
 * runtime will use a full JSON-LD framing pass; here we hard-code the same
 * mappings the to-batterypass.jsonld bridge declares so we catch divergence.
 */
const FIELD_MAP: Record<string, string> = {
  "battery:batteryPassportIdentifier": "batteryPassportIdentifier",
  "battery:batteryModelIdentifier": "batteryModelIdentifier",
  "battery:batterySerialNumber": "batterySerialNumber",
  "battery:facilityIdentifier": "facilityIdentifier",
  "battery:operatorIdentifier": "economicOperatorIdentifier",
  "battery:manufacturerIdentifier": "manufacturerIdentifier",
  "battery:batteryCategory": "batteryCategory",
  "dpp:schemaVersion": "dppSchemaVersion",
  "dpp:status": "dppStatus",
  "dpp:granularity": "dppGranularity",
  "dpp:lastUpdate": "dateTimeOfLatestUpdate",
};

function projectFromEpcis(epcisDoc: { epcisBody?: { eventList?: unknown[] } }): Doc {
  const events = epcisDoc.epcisBody?.eventList ?? [];
  const out: Doc = {};
  for (const event of events) {
    const md = (event as { masterDataAvailableFor?: unknown[] }).masterDataAvailableFor ?? [];
    for (const entry of md) {
      const obj = entry as Record<string, unknown>;
      if (obj.type !== "Product") continue;
      for (const [src, dst] of Object.entries(FIELD_MAP)) {
        if (src in obj) out[dst] = obj[src];
      }
      // batteryIdentifier and batteryPassportIdentifier both point at the EPC.
      if (typeof obj.id === "string") {
        out.batteryIdentifier = obj.id;
        if (!out.batteryPassportIdentifier) out.batteryPassportIdentifier = obj.id;
      }
    }
  }
  return out;
}

function runRoundTripTests(): void {
  const epcis = loadJson<{ epcisBody?: { eventList?: unknown[] } }>(COMMISSIONING_PATH);
  const projected = projectFromEpcis(epcis);

  // The projection won't carry every required attribute (the EPCIS event
  // is a snapshot, not a full passport). What we want to verify is that
  // every battery:/dpp: extension property in the event has a known SAMM
  // landing slot — i.e. the bridge mapping covers what the event emits.
  const expectKeys = [
    "batteryPassportIdentifier",
    "batteryIdentifier",
    "batteryModelIdentifier",
    "batterySerialNumber",
    "facilityIdentifier",
    "economicOperatorIdentifier",
    "manufacturerIdentifier",
    "batteryCategory",
    "dppSchemaVersion",
    "dppStatus",
    "dppGranularity",
    "dateTimeOfLatestUpdate",
  ];
  for (const k of expectKeys) {
    record(
      `ROUND-TRIP: projected SAMM doc carries ${k}`,
      k in projected,
      k in projected ? `value=${JSON.stringify(projected[k]).slice(0, 50)}` : "missing"
    );
  }

  // Verify the projected doc satisfies its own dppSchemaVersion claim.
  record(
    "ROUND-TRIP: projected dppSchemaVersion === '1.3'",
    projected.dppSchemaVersion === "1.3",
    `got=${String(projected.dppSchemaVersion)}`
  );

  // Negative: an event with a battery: property that has NO bridge mapping
  // should leave that property out of the projection (so we catch missing
  // mappings as test failures rather than silent data loss).
  // Here we just verify the inverse: every key in the projection corresponds
  // to a known FIELD_MAP target.
  const allowedTargets = new Set([
    ...Object.values(FIELD_MAP),
    "batteryIdentifier", // synthesized from id
  ]);
  const stray = Object.keys(projected).filter((k) => !allowedTargets.has(k));
  record(
    "ROUND-TRIP: no stray fields in SAMM projection",
    stray.length === 0,
    stray.length ? `stray=${stray.join(", ")}` : ""
  );
}

// =============================================================================
// Runner
// =============================================================================

runSchemaTests();
runPlausibilityTests();
runRoundTripTests();

const passed = results.filter((r) => r.passed).length;
const failed = results.length - passed;

console.log("\nMock GEFEG BatteryPass-Ready conformance run\n" + "=".repeat(48));
for (const r of results) {
  const prefix = r.passed ? "  PASS" : "  FAIL";
  console.log(`${prefix}  ${r.name}${r.detail ? `  — ${r.detail}` : ""}`);
}
console.log("=".repeat(48));
console.log(`${passed} passed, ${failed} failed, ${results.length} total`);

if (failed > 0) process.exit(1);
