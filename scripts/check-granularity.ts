/**
 * Granularity conformance check.
 *
 * Validates that every example passport's declared granularity agrees with the
 * GS1 Digital Link Application Identifiers in its identifier:
 *   /01/{gtin}                    -> model
 *   /01/{gtin}/10/{lot}           -> batch
 *   /01/{gtin}/21/{serial}        -> item
 *
 * This mirrors the SHACL constraint dpp-sh:GranularityDigitalLinkConstraint
 * (extensions/common/core/validation/dpp-core-shapes.ttl) and EN 18219 §4.4 /
 * EN 18223 consistency. It is the one cross-field DPP invariant that JSON Schema
 * cannot express (the granularity token must be consistent with AIs parsed from a
 * different field's URI), and it guards the model/batch/item partitioning the
 * EPCIS4DPP reconstruction depends on (see
 * extensions/eu/battery/docs/EPCIS_AND_BATTERYPASS_READY.md).
 *
 * The full SHACL shapes remain the normative RDF model and can be run with an
 * external SHACL engine; this check keeps the one high-value invariant green in
 * the ordinary build without pulling an RDF/SHACL toolchain into it.
 *
 * Run: pnpm run check:granularity   (also part of pnpm run build)
 */

import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");
const EXT = join(ROOT, "extensions");

type Level = "model" | "batch" | "item";

// Level implied by the GS1 Digital Link AIs present in an identifier URI.
function levelFromDigitalLink(id: string): Level | undefined {
  if (!/\/01\/\d{14}/.test(id)) return undefined;
  if (/\/21\/[^/#?]+/.test(id)) return "item";
  if (/\/10\/[^/#?]+/.test(id)) return "batch";
  return "model";
}

// The declared granularity token, checking the EN 18223 keys we use.
function declaredGranularity(doc: Record<string, any>): string | undefined {
  for (const k of ["oec:granularityLevel", "granularityLevel", "granularity"]) {
    const v = doc[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

// The passport identifier, in priority order (Digital Link string).
function identifier(doc: Record<string, any>): string | undefined {
  for (const k of ["uniqueProductIdentifier", "gs1:productID", "id", "@id"]) {
    const v = doc[k];
    if (typeof v === "string") return v;
    if (v && typeof v === "object" && typeof v.id === "string") return v.id;
    if (v && typeof v === "object" && typeof v["@id"] === "string") return v["@id"];
  }
  return undefined;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    const norm = p.split("\\").join("/");
    if (entry.isDirectory()) out.push(...walk(p));
    // example passports (examples/*.jsonld) and the flat GEFEG source fixtures
    // (examples/**/*.source.json) both declare a granularity + identifier.
    else if (entry.isFile() && (/\/examples\/[^/]+\.jsonld$/.test(norm) || /\/examples\/.*\.source\.json$/.test(norm))) out.push(p);
  }
  return out;
}

const files = walk(EXT).sort();
let checked = 0;
let skipped = 0;
const errors: string[] = [];

for (const f of files) {
  let doc: Record<string, any>;
  try {
    doc = JSON.parse(readFileSync(f, "utf-8"));
  } catch {
    continue; // non-JSON / unparseable examples are covered by validate:examples
  }
  const declared = declaredGranularity(doc);
  if (!declared) {
    skipped++;
    continue; // constraint only applies when a granularity is declared
  }
  const id = identifier(doc);
  const implied = id ? levelFromDigitalLink(id) : undefined;
  const rel = f.replace(ROOT + "/", "");
  if (!id || !implied) {
    errors.push(`${rel}: granularity "${declared}" declared but no GS1 Digital Link identifier to check against`);
    continue;
  }
  if (declared !== implied) {
    errors.push(`${rel}: granularity "${declared}" disagrees with the Digital Link (${id} implies "${implied}")`);
    continue;
  }
  checked++;
}

console.log("Granularity conformance (declared level vs GS1 Digital Link AIs)");
console.log("=".repeat(60));
console.log(`  ${checked} consistent, ${errors.length} mismatched, ${skipped} without a declared granularity (skipped)`);
for (const e of errors) console.log(`  FAIL  ${e}`);
console.log("=".repeat(60));
if (errors.length > 0) process.exit(1);
console.log("All declared granularities agree with their Digital Link.");
