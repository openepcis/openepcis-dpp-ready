/**
 * EC Battery Passport readiness check (CLI).
 *
 * Evaluates battery passport JSON-LD document(s) against the 71 data points of
 * the European Commission guidance "Digital Batteries Passport - data points by
 * category" (Ares(2026)7579758) and prints the checklist. Pass every level of
 * one battery (model + batch + item) for the full picture — a model passport
 * alone legitimately lacks the dynamic Annex XIII 4 data points, which are
 * folded from the EPCIS event stream at item level.
 *
 * Usage:
 *   pnpm run check:ec-readiness -- [options] <passport.jsonld> [more.jsonld...]
 *     --category ev|lmt|industrial   (default: auto-detect, fallback ev)
 *     --date YYYY-MM-DD              reference date (default 2027-02-18)
 *     --json                         machine-readable report on stdout
 *     --strict                       exit 1 when mandatory data points are missing
 *     --shacl                        validate with a real SHACL engine against
 *                                    validation/ec-readiness-shapes.ttl instead of
 *                                    the structural matrix walk (same source data)
 *
 * Example:
 *   pnpm run check:ec-readiness -- extensions/eu/battery/examples/battery-product{-model,-batch,}.jsonld
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  evaluateReadiness,
  type Category,
  type Matrix,
  type Outcome,
} from "./lib/ec-readiness.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MATRIX_PATH = join(
  __dirname,
  "../extensions/eu/battery/validation/ec-datapoint-applicability.json",
);

const args = process.argv.slice(2);
const files: string[] = [];
let category: Category | undefined;
let asOf: string | undefined;
let asJson = false;
let strict = false;
let useShacl = false;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--category") {
    const v = args[++i];
    if (v !== "ev" && v !== "lmt" && v !== "industrial") {
      console.error(`--category must be ev|lmt|industrial, got: ${v}`);
      process.exit(2);
    }
    category = v;
  } else if (a === "--date") {
    asOf = args[++i];
  } else if (a === "--json") {
    asJson = true;
  } else if (a === "--strict") {
    strict = true;
  } else if (a === "--shacl") {
    useShacl = true;
  } else if (a.startsWith("--")) {
    console.error(`unknown option: ${a}`);
    process.exit(2);
  } else {
    files.push(a);
  }
}

if (!files.length) {
  console.error("usage: check-ec-readiness [--category ev|lmt|industrial] [--date YYYY-MM-DD] [--json] [--strict] <passport.jsonld>...");
  process.exit(2);
}

const matrix: Matrix = JSON.parse(readFileSync(MATRIX_PATH, "utf-8"));
const docs = files.map((f) => JSON.parse(readFileSync(f, "utf-8")));
const report = evaluateReadiness(matrix, docs, { category, asOf });

if (useShacl) {
  // SHACL path: the same applicability data, executed as generated shapes by a
  // real engine (rdf-validate-shacl) over the passports' actual RDF graphs.
  const { validateWithShacl } = await import("./lib/ec-readiness-shacl.ts");
  const shacl = await validateWithShacl(docs, report.category);
  if (asJson) {
    console.log(JSON.stringify(shacl, null, 2));
  } else {
    console.log(
      `EC Battery Passport readiness (SHACL) — ${shacl.shapesActivated} shapes activated for category ${shacl.category}`,
    );
    console.log(`documents: ${files.join(", ")}\n`);
    const MARK = { Violation: "\x1b[31m✗\x1b[0m", Warning: "\x1b[33m?\x1b[0m", Info: "\x1b[2mℹ\x1b[0m" };
    for (const f of shacl.findings) {
      console.log(`${MARK[f.severity]} ${f.message}`);
    }
    const counts = { Violation: 0, Warning: 0, Info: 0 };
    for (const f of shacl.findings) counts[f.severity]++;
    console.log(
      `\n${shacl.conforms ? "\x1b[32mconforms\x1b[0m (no violations)" : "\x1b[31mdoes not conform\x1b[0m"}` +
        ` · violations: ${counts.Violation} · warnings: ${counts.Warning} · info: ${counts.Info}`,
    );
  }
  if (strict && !shacl.conforms) process.exit(1);
  process.exit(0);
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const SYMBOL: Record<Outcome, string> = {
    fulfilled: "\x1b[32m✓\x1b[0m",
    missing: "\x1b[31m✗\x1b[0m",
    conditionOpen: "\x1b[33m?\x1b[0m",
    optionalAbsent: "\x1b[2m·\x1b[0m",
    providedEarly: "\x1b[36m+\x1b[0m",
    notYetRequired: "\x1b[2m⏳\x1b[0m",
    notApplicable: "\x1b[2m—\x1b[0m",
  };
  const LABEL: Record<Outcome, string> = {
    fulfilled: "",
    missing: "MISSING",
    conditionOpen: "provide if the condition applies",
    optionalAbsent: "optional, not provided",
    providedEarly: "provided early (format not yet specified)",
    notYetRequired: "not yet required (act outstanding)",
    notApplicable: "not to be filled/displayed",
  };

  console.log(
    `EC Battery Passport readiness — ${report.document.title} v${report.document.version} (${report.document.reference})`,
  );
  console.log(
    `category: ${report.category}${report.categoryDetected ? " (auto-detected)" : ""} · as of ${report.asOf}` +
      (report.inForce ? "" : " — NOTE: before 2027-02-18 the passport duty is not yet in force; treat results as preparation status"),
  );
  console.log(`documents: ${files.join(", ")}\n`);

  for (const r of report.results) {
    const name = r.name.length > 78 ? r.name.slice(0, 75) + "…" : r.name;
    const label = LABEL[r.outcome];
    const dyn = r.lifecycle === "dynamic" ? " [dynamic]" : "";
    console.log(`${SYMBOL[r.outcome]} ${String(r.nr).padStart(2)}  ${name}${dyn}`);
    if (r.outcome === "fulfilled") {
      console.log(`      via ${r.evidence.join(", ")}`);
    } else if (label) {
      console.log(`      ${label}${r.note ? ` — ${r.note}` : ""}`);
      if (r.outcome === "missing" || r.outcome === "conditionOpen") {
        console.log(`      expected: ${r.expected.join(", ")}`);
        if (r.lifecycle === "dynamic" && r.epcisExample) {
          console.log(`      dynamic data point — folded from the EPCIS event stream; see ${r.epcisExample}`);
        }
      }
    }
  }

  const s = report.summary;
  console.log(
    `\nmandatory (${report.category}): ${s.fulfilled}/${s.mandatory} fulfilled (${Math.round(s.score * 100)}%)` +
      ` · missing: ${s.missing} · conditions to check: ${s.conditionOpen}` +
      ` · not yet required: ${s.notYetRequired}${s.providedEarly ? ` · provided early: ${s.providedEarly}` : ""}`,
  );
}

if (strict && report.summary.missing > 0) process.exit(1);
