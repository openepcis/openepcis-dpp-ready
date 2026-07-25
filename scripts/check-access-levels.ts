/**
 * Access-level (ESPR Article 9 tier) conformance check.
 *
 * Completeness contract per property (strict modules): EITHER
 *   - oec:defaultAccessLevel (valid tier) AND oec:accessLevelRationale, OR
 *   - oec:accessLevelInherited true (structural value-carrier: runtime tier is
 *     governed by the embedding parent).
 * In strict modules a property satisfying neither is an ERROR; in non-strict
 * (not-yet-recurated) modules it is a WARNING (runtime falls back to
 * AuthorizedOnly — fail-closed toward the public). Flip modules to strict via
 * STRICT_MODULES as they are re-curated; the end state is all-strict.
 *
 * Always-ERRORs (any module):
 *   - accessLevel outside {Public, AuthorizedOnly, Restricted}
 *   - accessLevelMandatedBy without a defaultAccessLevel (lock without value)
 *   - accessLevelInherited combined WITH a defaultAccessLevel (contradiction)
 *   - strict module: defaultAccessLevel without accessLevelRationale
 *
 * Cross-module ALIAS CONSISTENCY: enforcement matches served fields by bare
 * local name as well as by curie, and merges colliding tiers with max()
 * (stricter wins, silently). A local name carried by ≥2 modules with DIFFERING
 * tiers is therefore an ERROR unless it is explicitly waived (with a
 * justification) in scripts/access-level-waivers.json:
 *   { "waivers": [{ "localName": "...", "justification": "..." }] }
 * Inherited terms and unannotated terms in non-strict modules do not create
 * collisions (unannotated in a STRICT module cannot exist; inherited terms are
 * excluded from the alias map by the resolver).
 *
 * Operates on the generated json/<module>.json (build-json.ts output), so run
 * after build:json. Run: pnpm run check:access-levels (also part of pnpm run build)
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");

const MODULE_JSON: string[] = [
  "extensions/common/core/json/dpp-core.json",
  "extensions/common/gs1-masterdata/json/gs1-masterdata.json",
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

/**
 * Modules whose curation is complete: unannotated properties are ERRORS here.
 * Flip each module in as its re-curation lands; remove the mechanism (make
 * everything strict unconditionally) once all modules are curated.
 */
const STRICT_MODULES = new Set<string>([
  // populated as re-curation lands, e.g. "dpp-core", "battery", ...
]);

const TIERS = new Set(["Public", "AuthorizedOnly", "Restricted"]);

interface Term {
  localName: string;
  accessLevel?: string;
  accessLevelMandatedBy?: string;
  accessLevelRationale?: string;
  accessLevelSource?: string;
  accessLevelInherited?: boolean;
}

interface Waiver {
  localName: string;
  justification: string;
}

function moduleNameOf(rel: string): string {
  return rel.split("/").pop()!.replace(".json", "");
}

function loadWaivers(): Map<string, string> {
  const path = join(ROOT, "scripts", "access-level-waivers.json");
  if (!existsSync(path)) return new Map();
  const doc = JSON.parse(readFileSync(path, "utf8")) as { waivers?: Waiver[] };
  const map = new Map<string, string>();
  for (const w of doc.waivers ?? []) {
    if (w.localName && w.justification) map.set(w.localName, w.justification);
  }
  return map;
}

let errors = 0;
let warnings = 0;

// localName -> [{module, tier}] for the alias-consistency pass
const aliasTiers = new Map<string, Array<{ module: string; tier: string }>>();

for (const rel of MODULE_JSON) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) continue;
  const moduleName = moduleNameOf(rel);
  const strict = STRICT_MODULES.has(moduleName);
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const properties: Term[] = doc.properties ?? [];
  const unannotated: string[] = [];
  let inherited = 0;

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
    if (p.accessLevelInherited && p.accessLevel !== undefined) {
      console.error(
        `ERROR ${rel}: ${p.localName} is accessLevelInherited AND carries a defaultAccessLevel — pick one`
      );
      errors++;
    }
    if (strict && p.accessLevel !== undefined && !p.accessLevelRationale) {
      console.error(
        `ERROR ${rel}: ${p.localName} has a defaultAccessLevel but no accessLevelRationale (required in strict modules)`
      );
      errors++;
    }
    if (p.accessLevelInherited) {
      inherited++;
    } else if (p.accessLevel === undefined) {
      unannotated.push(p.localName);
    } else {
      const list = aliasTiers.get(p.localName) ?? [];
      list.push({ module: moduleName, tier: p.accessLevel });
      aliasTiers.set(p.localName, list);
    }
  }

  const annotated = properties.length - unannotated.length - inherited;
  const summary = `${rel}: ${annotated}/${properties.length} tier-annotated`
    + (inherited > 0 ? `, ${inherited} inherited` : "");
  if (unannotated.length > 0) {
    if (strict) {
      console.error(`ERROR ${summary}; strict module has unclassified properties:`);
      console.error(`      ${unannotated.join(", ")}`);
      errors += unannotated.length;
    } else {
      warnings += unannotated.length;
      console.warn(`WARN  ${summary}; unannotated fall back to AuthorizedOnly:`);
      console.warn(`      ${unannotated.join(", ")}`);
    }
  } else {
    console.log(`OK    ${summary}`);
  }
}

// ---------------------------------------------------------------- alias consistency
const waivers = loadWaivers();
const usedWaivers = new Set<string>();
let collisions = 0;
for (const [localName, entries] of aliasTiers) {
  const tiers = new Set(entries.map((e) => e.tier));
  if (entries.length < 2 || tiers.size < 2) continue;
  const detail = entries.map((e) => `${e.module}:${e.tier}`).join(", ");
  const waiver = waivers.get(localName);
  if (waiver) {
    usedWaivers.add(localName);
    console.warn(`WAIVED alias collision ${localName} (${detail}) — ${waiver}`);
    continue;
  }
  console.error(
    `ERROR alias collision: "${localName}" carries differing tiers across modules (${detail}); `
      + `enforcement resolves the bare alias to the STRICTEST — reconcile the tiers or add a `
      + `justified waiver in scripts/access-level-waivers.json`
  );
  errors++;
  collisions++;
}
for (const localName of waivers.keys()) {
  if (!usedWaivers.has(localName)) {
    console.warn(`WARN  stale waiver for "${localName}" — no collision exists; remove it`);
    warnings++;
  }
}

if (errors > 0) {
  console.error(`\ncheck-access-levels: ${errors} error(s) (${collisions} alias collision(s)), ${warnings} warning(s)`);
  process.exit(1);
}
console.log(`\ncheck-access-levels: green (${warnings} warning(s); non-strict unannotated terms fall back to AuthorizedOnly)`);
