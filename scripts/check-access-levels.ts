/**
 * Access-level (ESPR Article 9 tier) conformance check.
 *
 * Every property SHOULD carry oec:defaultAccessLevel (Public, AuthorizedOnly,
 * Restricted) — either inline in the module ontology or in its
 * ontology/<name>-access-levels.ttl sidecar. Unannotated properties are only a
 * WARNING: at runtime they fall back to AuthorizedOnly (fail-closed toward the
 * public, visible to authenticated operators), so a missing annotation can
 * never accidentally expose data — it can only over-restrict the anonymous
 * view. Errors (exit 1) are reserved for actual inconsistencies:
 *
 *   - accessLevel outside the enum {Public, AuthorizedOnly, Restricted}
 *   - accessLevelMandatedBy present without a defaultAccessLevel (a lock
 *     without a value is meaningless)
 *
 * Operates on the generated json/<module>.json (build-json.ts output), so run
 * after build:json. Run: pnpm run check:access-levels (also part of pnpm run build)
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");

const MODULE_JSON: string[] = [
  "extensions/common/core/json/dpp-core.json",
  "extensions/eu/battery/json/battery.json",
  "extensions/eu/eudr/json/eudr.json",
  "extensions/eu/textile/json/textile.json",
  "extensions/eu/electronics/json/electronics.json",
  "extensions/eu/detergent/json/detergent.json",
  "extensions/eu/ppwr/json/ppwr.json",
  "extensions/eu/cpr/json/cpr.json",
  "extensions/eu/iron-steel/json/iron-steel.json",
  "extensions/us/fsma204/json/fsma204.json",
];

const TIERS = new Set(["Public", "AuthorizedOnly", "Restricted"]);

interface Term {
  localName: string;
  accessLevel?: string;
  accessLevelMandatedBy?: string;
}

let errors = 0;
let warnings = 0;

for (const rel of MODULE_JSON) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) continue;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const properties: Term[] = doc.properties ?? [];
  const unannotated: string[] = [];

  for (const p of properties) {
    if (p.accessLevel !== undefined && !TIERS.has(p.accessLevel)) {
      console.error(
        `ERROR ${rel}: ${p.localName} has accessLevel "${p.accessLevel}" outside {Public, AuthorizedOnly, Restricted}`
      );
      errors++;
    }
    if (p.accessLevelMandatedBy && p.accessLevel === undefined) {
      console.error(
        `ERROR ${rel}: ${p.localName} has accessLevelMandatedBy without a defaultAccessLevel`
      );
      errors++;
    }
    if (p.accessLevel === undefined) unannotated.push(p.localName);
  }

  const annotated = properties.length - unannotated.length;
  const summary = `${rel}: ${annotated}/${properties.length} properties tier-annotated`;
  if (unannotated.length > 0) {
    warnings += unannotated.length;
    console.warn(`WARN  ${summary}; unannotated fall back to AuthorizedOnly:`);
    console.warn(`      ${unannotated.join(", ")}`);
  } else {
    console.log(`OK    ${summary}`);
  }
}

if (errors > 0) {
  console.error(`\ncheck-access-levels: ${errors} error(s), ${warnings} warning(s)`);
  process.exit(1);
}
console.log(`\ncheck-access-levels: green (${warnings} unannotated term(s) fall back to AuthorizedOnly)`);
