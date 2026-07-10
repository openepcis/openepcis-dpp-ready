/**
 * GS1 domain/range conformance guard.
 *
 * Walks every example and EPCIS document and verifies that each `gs1:`-prefixed
 * property is used per the GS1 Web Vocabulary:
 *
 *  - DOMAIN: on a *typed* node, the property's rdfs:domain must be among the
 *    node's types or their superclasses (gs1 hierarchy + extension-class
 *    rdfs:subClassOf links parsed from the module TTLs). Untyped nested nodes
 *    are skipped — in JSON-LD their type is implied by the property range.
 *    This is exactly the class of error where gs1:warranty (rdfs:domain
 *    gs1:Offer) was attached to a product.
 *
 *  - RANGE: a gs1 object property whose range is a GS1 class must not carry a
 *    bare string literal (e.g. gs1:countryOfOrigin: "DE" instead of a
 *    gs1:Country node). CURIE references ("gs1:...") and IRIs are fine.
 *
 * Vocabulary data comes from scripts/gs1-domains.json, a committed snapshot of
 * the GS1 Web Vocabulary (see its _note for the refresh procedure).
 *
 * Documented deviations live in ALLOW below — keep each entry justified.
 *
 * Usage: npx tsx scripts/check-gs1-domains.ts
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

const GS1 = JSON.parse(readFileSync(join(__dirname, "gs1-domains.json"), "utf8")) as {
  propDomain: Record<string, string>;
  propRange: Record<string, string>;
  subClassOf: Record<string, string[]>;
};

/**
 * Documented deviations: [property local name, node type] pairs accepted with
 * justification. Keep this list short and each entry explained.
 */
const ALLOW = new Set([
  // gs1:textileMaterial has rdfs:domain gs1:Clothing, but its range class
  // gs1:TextileMaterialDetails is documented for "any product using textiles".
  // Footwear (WearableProduct, not Clothing) and home textiles have no GS1
  // composition property; the examples carry a _comment noting the deviation.
  "textileMaterial|eutex:TextileFootwear",
  "textileMaterial|eutex:Footwear",
  // Home textiles are typed plain gs1:Product (eutex:HomeTextiles is a
  // TextileCategory value, not a product class) — hometextile-bedlinen carries
  // the composition via gs1:textileMaterial with a _comment noting the deviation.
  "textileMaterial|gs1:Product",
]);

// ---------------------------------------------------------------------------
// Class hierarchy: gs1 subclass links from the snapshot + extension-class
// rdfs:subClassOf links parsed from the module TTLs (any prefix).
// ---------------------------------------------------------------------------
const superOf = new Map<string, Set<string>>(); // CURIE -> direct supers (CURIEs)
for (const [c, sups] of Object.entries(GS1.subClassOf)) {
  superOf.set(`gs1:${c}`, new Set(sups.map((s) => `gs1:${s}`)));
}

function collectTtlSubclassLinks(dir: string): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      collectTtlSubclassLinks(p);
    } else if (entry.endsWith(".ttl")) {
      const ttl = readFileSync(p, "utf8");
      // subject blocks: from a line-initial CURIE subject to the next one
      const bounds = [...ttl.matchAll(/^([A-Za-z][\w-]*:[\w-]+)\s*$/gm)];
      for (let i = 0; i < bounds.length; i++) {
        const subj = bounds[i][1];
        const start = bounds[i].index!;
        const end = i + 1 < bounds.length ? bounds[i + 1].index! : ttl.length;
        const block = ttl.slice(start, end);
        const sups = [...block.matchAll(/rdfs:subClassOf\s+([A-Za-z]\w*:[\w-]+)/g)].map((m) => m[1]);
        if (sups.length) {
          const set = superOf.get(subj) ?? new Set<string>();
          for (const s of sups) set.add(s);
          superOf.set(subj, set);
        }
      }
    }
  }
}
collectTtlSubclassLinks(join(PROJECT_ROOT, "extensions"));

function closure(types: string[]): Set<string> {
  const out = new Set<string>();
  const stack = [...types];
  while (stack.length) {
    const t = stack.pop()!;
    if (out.has(t)) continue;
    out.add(t);
    for (const s of superOf.get(t) ?? []) stack.push(s);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Document walk
// ---------------------------------------------------------------------------
interface Violation {
  file: string;
  kind: "domain" | "range";
  prop: string;
  detail: string;
}
const violations: Violation[] = [];

function typesOf(node: Record<string, unknown>): string[] {
  const t = (node["type"] ?? node["@type"]) as string | string[] | undefined;
  if (!t) return [];
  return Array.isArray(t) ? t.filter((x) => typeof x === "string") : [t];
}

function walk(node: unknown, file: string): void {
  if (Array.isArray(node)) {
    for (const x of node) walk(x, file);
    return;
  }
  if (!node || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  const types = typesOf(obj);
  const cl = types.length ? closure(types) : null; // null = untyped -> skip domain check

  for (const [k, v] of Object.entries(obj)) {
    if (k === "@context") continue;
    if (k.startsWith("gs1:")) {
      const local = k.slice(4);
      // domain
      const dom = GS1.propDomain[local];
      if (dom && dom !== "Thing" && cl && !cl.has(`gs1:${dom}`)) {
        const allowed = types.some((t) => ALLOW.has(`${local}|${t}`));
        if (!allowed) {
          violations.push({
            file,
            kind: "domain",
            prop: k,
            detail: `needs domain gs1:${dom}, used on [${types.join(", ")}]`,
          });
        }
      }
      // range: gs1-class-ranged property with a bare string literal
      const rng = GS1.propRange[local];
      if (rng && GS1.subClassOf && !rng.includes(":") && GS1.propDomain && isGs1Class(rng)) {
        const vals = Array.isArray(v) ? v : [v];
        for (const x of vals) {
          if (typeof x === "string" && !x.startsWith("gs1:") && !/^https?:/.test(x)) {
            violations.push({
              file,
              kind: "range",
              prop: k,
              detail: `range gs1:${rng} given a string literal ${JSON.stringify(x.slice(0, 40))}`,
            });
          }
        }
      }
    }
    walk(v, file);
  }
}

const gs1ClassSet = new Set<string>([
  ...Object.keys(GS1.subClassOf),
  ...Object.values(GS1.propDomain),
  ...Object.values(GS1.propRange).filter((r) => /^[A-Z]/.test(r) && !r.includes(":")),
]);
function isGs1Class(name: string): boolean {
  // heuristics: appears as a domain/range/class and is UpperCamelCase, excluding
  // literal-ish ranges that slip through the snapshot (langString etc.)
  if (!/^[A-Z]/.test(name)) return false;
  if (["Thing", "TypeCode"].includes(name)) return false;
  return gs1ClassSet.has(name);
}

// ---------------------------------------------------------------------------
// Run over examples + EPCIS documents
// ---------------------------------------------------------------------------
function jsonldFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (entry === "examples" || entry === "epcis" || !["node_modules"].includes(entry)) jsonldFiles(p, out);
    } else if (entry.endsWith(".jsonld") && (p.includes("/examples/") || p.includes("/epcis/"))) {
      out.push(p);
    }
  }
  return out;
}

const files = jsonldFiles(join(PROJECT_ROOT, "extensions"));
let parsed = 0;
for (const f of files) {
  let doc: unknown;
  try {
    doc = JSON.parse(readFileSync(f, "utf8"));
  } catch {
    continue;
  }
  parsed++;
  walk(doc, relative(PROJECT_ROOT, f));
}

console.log(`check:domains — ${parsed} documents checked against ${Object.keys(GS1.propDomain).length} GS1 property domains`);
if (violations.length) {
  console.error(`\n${violations.length} GS1 domain/range violation(s):`);
  for (const v of violations) {
    console.error(`  ✖ [${v.kind}] ${v.prop} — ${v.detail}\n      in ${v.file}`);
  }
  process.exit(1);
}
console.log("All gs1: property usages conform to their declared domains and ranges.");
