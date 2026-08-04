/**
 * EC Battery Passport readiness evaluation core.
 *
 * Evaluates one or more OpenEPCIS battery passport JSON-LD documents (model,
 * batch and/or item level — pass all levels of one battery for a full picture)
 * against the 71 data points of the European Commission guidance "Digital
 * Batteries Passport - data points by category" (v1.0, Ares(2026)7579758), as
 * mirrored in extensions/eu/battery/validation/ec-datapoint-applicability.json.
 *
 * The registry's applicability statuses translate into outcomes per data point:
 *   mandatory     → fulfilled | missing
 *   optional      → fulfilled | optionalAbsent
 *   conditional   → fulfilled | conditionOpen (the condition is not machine-decidable)
 *   pending       → providedEarly | notYetRequired (implementing act / Omnibus IV outstanding)
 *   notToBeFilled → notApplicable (the guidance resolves these as duplicates/aggregates;
 *                   they share carrier terms with active data points, so presence is
 *                   neither checked nor warned about)
 *
 * Term presence is detected structurally: property CURIEs match document keys
 * (prefixed, or bare for the EN 18223 operational form), class CURIEs match
 * `type`/`@type` values, and the GS1 Digital Link `id` satisfies the
 * identification data points (dp-01 unique identifier, dp-07 model/batch/serial).
 * This is a coverage check of the passport's *structure*, not a validation of
 * its values — SHACL shapes and JSON Schema do that.
 *
 * Shared by scripts/check-ec-readiness.ts (CLI) and demos/ec-readiness-checker.
 */

export type Category = "ev" | "lmt" | "industrial";

export type ApplicabilityStatus =
  | "mandatory"
  | "optional"
  | "conditional"
  | "notToBeFilled"
  | "pending";

export type Outcome =
  | "fulfilled"
  | "missing"
  | "conditionOpen"
  | "optionalAbsent"
  | "providedEarly"
  | "notYetRequired"
  | "notApplicable";

export interface MatrixDataPoint {
  nr: number;
  iri: string;
  name: string;
  source: string | null;
  lifecycle: "static" | "dynamic";
  accessTier: string;
  applicability: Record<Category, { status: ApplicabilityStatus; note?: string }>;
  implementedBy: string[];
  epcisExample?: string;
}

export interface Matrix {
  document: { title: string; version: string; issued: string; reference: string };
  dataPoints: MatrixDataPoint[];
}

export interface DataPointResult {
  nr: number;
  name: string;
  source: string | null;
  lifecycle: "static" | "dynamic";
  accessTier: string;
  status: ApplicabilityStatus;
  note?: string;
  outcome: Outcome;
  /** Terms (or mechanics) found in the passport that carry this data point. */
  evidence: string[];
  /** Terms that would carry this data point (for missing/open ones). */
  expected: string[];
  epcisExample?: string;
}

export interface ReadinessReport {
  category: Category;
  categoryDetected: boolean;
  /** The Battery Passport duty applies from 2027-02-18 (BR Art. 77(1)). */
  asOf: string;
  inForce: boolean;
  document: Matrix["document"];
  results: DataPointResult[];
  summary: {
    mandatory: number;
    fulfilled: number;
    missing: number;
    conditionOpen: number;
    providedEarly: number;
    notYetRequired: number;
    /** fulfilled / mandatory, 0..1 */
    score: number;
  };
}

/** BR Art. 77(1): battery passports are required from 18 February 2027. */
export const BP_APPLICATION_DATE = "2027-02-18";

interface DocFacts {
  keys: Set<string>;
  types: Set<string>;
  ids: string[];
  strings: string[];
}

function collectFacts(docs: unknown[]): DocFacts {
  const facts: DocFacts = { keys: new Set(), types: new Set(), ids: [], strings: [] };
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node === null || typeof node !== "object") {
      if (typeof node === "string") facts.strings.push(node);
      return;
    }
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      facts.keys.add(key);
      if (key === "type" || key === "@type") {
        for (const t of Array.isArray(value) ? value : [value]) {
          if (typeof t === "string") facts.types.add(t);
        }
      }
      if ((key === "id" || key === "@id") && typeof value === "string") {
        facts.ids.push(value);
      }
      walk(value);
    }
  };
  for (const doc of docs) walk(doc);
  return facts;
}

const localName = (curie: string) => curie.split(":").pop() ?? curie;
const isClassCurie = (curie: string) => /^[A-Z]/.test(localName(curie));

/** GS1 Digital Link product identity: /01/{gtin}, optionally /10/{lot} or /21/{serial}. */
const DL_PRODUCT = /\/01\/\d{8,14}(?:\/(?:10|21)\/[^/?#]+)?/;

function termEvidence(curie: string, facts: DocFacts): string | null {
  const bare = localName(curie);
  if (isClassCurie(curie)) {
    if (facts.types.has(curie)) return curie;
    if (facts.types.has(bare)) return `${bare} (bare type)`;
    return null;
  }
  if (facts.keys.has(curie)) return curie;
  if (facts.keys.has(bare)) return `${bare} (bare key)`;
  return null;
}

/**
 * Try to determine the battery category from the documents themselves:
 * category class in a type position, or the category phrasing GEFEG/EPCIS
 * examples use in schema:category / additionalProductClassification values.
 */
export function detectCategory(docs: unknown[]): Category | null {
  const facts = collectFacts(docs);
  const typeHit = (name: string) => facts.types.has(`eubat:${name}`) || facts.types.has(name);
  if (typeHit("EVBattery")) return "ev";
  if (typeHit("LMTBattery")) return "lmt";
  if (typeHit("IndustrialBattery") || typeHit("StationaryBattery")) return "industrial";
  const text = facts.strings.join(" ").toLowerCase();
  if (/\bev ?battery|electric vehicle batter/.test(text)) return "ev";
  if (/\blmt ?battery|light means of transport/.test(text)) return "lmt";
  if (/\bindustrial ?batter|stationary batter/.test(text)) return "industrial";
  return null;
}

export interface EvaluateOptions {
  category?: Category;
  /** Reference date (ISO). Before 2027-02-18 the duty is not yet in force. */
  asOf?: string;
}

export function evaluateReadiness(
  matrix: Matrix,
  docs: unknown[],
  options: EvaluateOptions = {},
): ReadinessReport {
  const detected = detectCategory(docs);
  const category = options.category ?? detected ?? "ev";
  const asOf = options.asOf ?? BP_APPLICATION_DATE;
  const facts = collectFacts(docs);
  const hasDigitalLinkId = facts.ids.some((id) => DL_PRODUCT.test(id));

  const results: DataPointResult[] = matrix.dataPoints.map((dp) => {
    const applicability = dp.applicability[category];
    const evidence: string[] = [];
    for (const term of dp.implementedBy) {
      const hit = termEvidence(term, facts);
      if (hit) evidence.push(hit);
    }
    // Identification data points are satisfied by the GS1 Digital Link id itself.
    if ((dp.nr === 1 || dp.nr === 7) && hasDigitalLinkId) {
      evidence.push("GS1 Digital Link id");
    }
    const present = evidence.length > 0;

    let outcome: Outcome;
    switch (applicability.status) {
      case "mandatory":
        outcome = present ? "fulfilled" : "missing";
        break;
      case "optional":
        outcome = present ? "fulfilled" : "optionalAbsent";
        break;
      case "conditional":
        outcome = present ? "fulfilled" : "conditionOpen";
        break;
      case "pending":
        outcome = present ? "providedEarly" : "notYetRequired";
        break;
      case "notToBeFilled":
        outcome = "notApplicable";
        break;
    }

    return {
      nr: dp.nr,
      name: dp.name,
      source: dp.source,
      lifecycle: dp.lifecycle,
      accessTier: dp.accessTier,
      status: applicability.status,
      note: applicability.note,
      outcome,
      evidence,
      expected: dp.implementedBy,
      epcisExample: dp.epcisExample,
    };
  });

  const count = (o: Outcome) => results.filter((r) => r.outcome === o).length;
  const mandatory = results.filter((r) => r.status === "mandatory").length;
  const fulfilledMandatory = results.filter(
    (r) => r.status === "mandatory" && r.outcome === "fulfilled",
  ).length;

  return {
    category,
    categoryDetected: options.category == null && detected != null,
    asOf,
    inForce: asOf >= BP_APPLICATION_DATE,
    document: matrix.document,
    results,
    summary: {
      mandatory,
      fulfilled: fulfilledMandatory,
      missing: count("missing"),
      conditionOpen: count("conditionOpen"),
      providedEarly: count("providedEarly"),
      notYetRequired: count("notYetRequired"),
      score: mandatory ? fulfilledMandatory / mandatory : 0,
    },
  };
}
