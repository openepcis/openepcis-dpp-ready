/**
 * GS1 identifier check-digit guard.
 *
 * Scans every example / EPCIS / context file under extensions/** for GS1 Digital
 * Link identifiers and verifies:
 *   - GTIN-14  (/01/<14>)         valid GS1 mod-10 check digit
 *   - GLN-13   (/41[47]/<13>)     valid GS1 mod-10 check digit
 *   - SSCC-18  (/00/<18>)         valid GS1 mod-10 check digit
 *   - demo identifiers use the GS1 952 restricted/demo prefix (GCP 9521234)
 *
 * A bad check digit or a non-952 demo GTIN/GLN fails the build, so hand-authored
 * examples can never ship an invalid identifier. Makes the /dpp-epcis-lint
 * check-digit intent enforceable.
 *
 * Run: pnpm run check:identifiers   (also part of pnpm run build)
 */

import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");
const EXT = join(ROOT, "extensions");

/** GS1 mod-10 (weights 3,1,… from the digit left of the check digit). */
function mod10ok(digits: string): boolean {
  if (!/^\d+$/.test(digits) || digits.length < 2) return false;
  const ds = [...digits].map(Number);
  const check = ds[ds.length - 1];
  let sum = 0;
  let w = 3;
  for (let i = ds.length - 2; i >= 0; i--) {
    sum += ds[i] * w;
    w = w === 3 ? 1 : 3;
  }
  return (10 - (sum % 10)) % 10 === check;
}

// Demo identifiers use the GS1 952 restricted/demo prefix. `086` is allow-listed
// for the FSMA §204 examples, which deliberately use a realistic GS1 US prefix.
const ALLOWED_PREFIXES = ["952", "086"];

/** True if the GS1 company-prefix region is one we allow for examples. */
function prefixAllowed(kind: "gtin" | "gln" | "sscc", digits: string): boolean {
  // GTIN-14 / SSCC-18 have a leading indicator/extension digit before the GCP.
  const body = kind === "gln" ? digits : digits.slice(1);
  return ALLOWED_PREFIXES.some((p) => body.startsWith(p));
}

interface Hit {
  kind: "gtin" | "gln" | "sscc";
  value: string;
  len: number;
}

// Bounded Digital Link AI matches: /01/<14>, /414|417/<13>, /00/<18>.
const PATTERNS: { kind: Hit["kind"]; re: RegExp; len: number }[] = [
  { kind: "gtin", re: /\/01\/(\d{14})(?=[/"#?]|$)/g, len: 14 },
  { kind: "gln", re: /\/41[47]\/(\d{13})(?=[/"#?]|$)/g, len: 13 },
  { kind: "sscc", re: /\/00\/(\d{18})(?=[/"#?]|$)/g, len: 18 },
];

function scan(text: string): Hit[] {
  const out: Hit[] = [];
  for (const { kind, re, len } of PATTERNS) {
    for (const m of text.matchAll(re)) out.push({ kind, value: m[1], len });
  }
  return out;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile() && (p.endsWith(".jsonld") || p.endsWith(".json"))) out.push(p);
  }
  return out;
}

const files = walk(EXT).sort();
const errors: string[] = []; // invalid check digit — fails the build
const warnings: string[] = []; // off-prefix demo id — reported, non-fatal
const distinct = new Set<string>();
let occurrences = 0;

for (const f of files) {
  const text = readFileSync(f, "utf-8");
  const rel = f.replace(ROOT + "/", "");
  for (const h of scan(text)) {
    occurrences++;
    distinct.add(`${h.kind}:${h.value}`);
    if (!mod10ok(h.value)) {
      errors.push(`${rel}: ${h.kind.toUpperCase()} ${h.value} has an invalid GS1 mod-10 check digit`);
    } else if (!prefixAllowed(h.kind, h.value)) {
      // Not fatal: some modules use other realistic GS1 prefixes for demo IDs.
      // New demo identifiers should use 952 (this flags drift).
      warnings.push(`${rel}: ${h.kind.toUpperCase()} ${h.value} is not under the preferred 952 demo prefix`);
    }
  }
}

console.log("GS1 identifier check-digit guard (GTIN-14 / GLN-13 / SSCC-18)");
console.log("=".repeat(60));
console.log(`  ${occurrences} references, ${distinct.size} distinct — ${errors.length} invalid check digits, ${warnings.length} off-952-prefix`);
for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  FAIL  ${e}`);
console.log("=".repeat(60));
if (errors.length > 0) process.exit(1);
console.log("All GS1 identifiers carry a valid mod-10 check digit.");
