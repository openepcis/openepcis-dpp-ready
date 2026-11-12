#!/usr/bin/env tsx
/**
 * Validate a document of an external DPP model locally, the way the hosted GITB types do: the
 * publisher's own JSON Schemas and SHACL shapes at the release pinned in
 * extensions/common/interop/targets, no login, no network.
 *
 * The target and type follow from the document (BatteryPass-Ready: its battery category; EU DPP
 * Registry: its contentSpecificationIds and, from the file name, its view); --type picks one.
 * Findings are listed as missing values and wrong forms; a finding a defect of the release makes
 * unavoidable is listed apart, with the reason (the target's accepted deviations).
 *
 * Usage:
 *   pnpm run validate:target -- <file.json> [--type x.bpr-2.0.1.stationary-industrial.feb27]
 *   pnpm run validate:target -- --list
 */
import { readFileSync } from "node:fs";
import { loadTargets, provenance, typesForDocument, verdict } from "./lib/targets.ts";

const args = process.argv.slice(2);
const targets = loadTargets();

if (args.includes("--list")) {
  for (const t of targets) {
    console.log(`${provenance(t)}`);
    for (const ty of t.types) console.log(`  ${ty.id.padEnd(46)} ${[ty.shapes.length && "SHACL", ty.schemas.length && "JSON"].filter(Boolean).join(" + ")}`);
  }
  process.exit(0);
}

const typeFlag = args.indexOf("--type");
const wanted = typeFlag >= 0 ? args[typeFlag + 1] : undefined;
const file = args.find((a, i) => !a.startsWith("--") && (typeFlag < 0 || i !== typeFlag + 1));
if (!file) {
  console.error("usage: validate-target.ts <file.json> [--type <id>] | --list");
  process.exit(2);
}
const doc = JSON.parse(readFileSync(file, "utf8"));

const candidates = targets.flatMap((t) =>
  (wanted ? t.types.filter((ty) => ty.id === wanted) : typesForDocument(t, doc, file)).map((ty) => ({ t, ty })),
);
if (!candidates.length) {
  console.error(wanted ? `no validation type ${wanted} (see --list)` : `no target recognises ${file}; pass --type (see --list)`);
  process.exit(2);
}

let failed = false;
for (const { t, ty } of candidates) {
  const v = await verdict(t, ty, doc);
  console.log(`\n${ty.id}  ${ty.label}`);
  console.log(`  against ${provenance(t)}`);
  console.log(`  ${v.valid ? "VALID" : v.conforms ? "CONFORMS (accepted deviations only)" : "NOT VALID"}`);
  for (const m of v.missing) console.log(`  missing   ${m}`);
  for (const f of v.form) console.log(`  form      ${f}`);
  for (const a of v.accepted) console.log(`  accepted  ${a.finding}\n            reason: ${a.reason}`);
  if (!v.conforms) failed = true;
}
process.exit(failed ? 1 : 0);
