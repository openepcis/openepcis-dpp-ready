/**
 * Guard: the standard/operational context contract.
 *
 * Enforces the rule that unprefixed (bare) terms are supported ONLY via the
 * operational contexts, while the standard module contexts require proper
 * prefixing (so a term's source vocabulary is visible in the data):
 *
 *   (a) no standard context (dpp-core + the module *-context files) defines a
 *       bare property alias — bare aliases live only in the *-shortcut layers;
 *   (b) every product example seed is fully prefixed (no bare property keys and
 *       no bare class values in `type`);
 *   (c) each product seed round-trips: canonicalising it under its own @context
 *       and under its per-module operational context yields the identical RDF
 *       graph (URDNA2015), with no malformed literals.
 *
 * Runs offline against the bundled contexts. Wired into `pnpm run build` and CI.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import jsonld from "jsonld";
import { documentLoader, ROOT } from "./en18223/node-io.ts";
import { operationalContextFor } from "./en18223/serialize.ts";

const STANDARD_CONTEXTS = [
  "extensions/common/core/context/dpp-core-context.jsonld",
  "extensions/eu/battery/context/battery-context.jsonld",
  "extensions/eu/textile/context/textile-context.jsonld",
  "extensions/eu/electronics/context/electronics-context.jsonld",
  "extensions/eu/eudr/context/eudr-context.jsonld",
  "extensions/eu/ppwr/context/ppwr-context.jsonld",
  "extensions/eu/cpr/context/cpr-context.jsonld",
  "extensions/eu/detergent/context/detergent-context.jsonld",
  "extensions/us/fsma204/context/fsma204-context.jsonld",
];
const STRUCT = new Set(["id", "type"]);
const isNamespace = (v: any) => typeof v === "string" && /^https?:\/\//.test(v) && (v.endsWith("/") || v.endsWith("#"));

/** (a) A standard context must not define bare property aliases. */
function bareAliases(ctxDoc: any): string[] {
  const ctx = ctxDoc["@context"];
  const objs = (Array.isArray(ctx) ? ctx : [ctx]).filter((e) => e && typeof e === "object");
  const bare: string[] = [];
  for (const o of objs) {
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith("@") || STRUCT.has(k) || k.includes(":") || isNamespace(v)) continue;
      bare.push(k);
    }
  }
  return bare;
}

/** (b) Bare property keys / bare `type` class values anywhere in a seed. */
function bareTerms(node: any, out: Set<string>): void {
  if (Array.isArray(node)) {
    node.forEach((v) => bareTerms(v, out));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if ((k === "type" || k === "@type")) {
        for (const t of Array.isArray(v) ? v : [v]) {
          if (typeof t === "string" && !t.includes(":") && !t.startsWith("@")) out.add(`type=${t}`);
        }
      } else if (!k.startsWith("@") && !k.startsWith("_") && !STRUCT.has(k) && !k.includes(":")) {
        out.add(k);
      }
      bareTerms(v, out);
    }
  }
}

const stripComments = (o: any): any =>
  Array.isArray(o) ? o.map(stripComments)
    : o && typeof o === "object"
      ? Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith("_")).map(([k, v]) => [k, stripComments(v)]))
      : o;

const canon = (doc: any) =>
  jsonld.canonize(doc, { algorithm: "URDNA2015", format: "application/n-quads", safe: false, documentLoader: documentLoader as any }) as unknown as Promise<string>;

// Not OpenEPCIS GS1-prefixed DPP master data, so out of scope for the prefix rule:
//  - batterypass-*: BatteryPass-vocabulary compare samples (use the bridge context)
//  - regulatory-notification: a GS1 regulatory-message doc that pulls a remote context
const EXCLUDE = /(batterypass-|regulatory-notification)/;

async function productSeeds(): Promise<string[]> {
  const out: string[] = [];
  const walk = async (dir: string) => {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      // product master-data seeds only: skip resolver org records and EPCIS events
      if (e.isDirectory()) { if (e.name !== "organizations" && e.name !== "epcis") await walk(p); }
      else if (e.name.endsWith(".jsonld") && dir.endsWith("/examples") && !EXCLUDE.test(e.name)) out.push(p);
    }
  };
  await walk(path.join(ROOT, "extensions"));
  return out.sort();
}

async function main(): Promise<number> {
  const problems: string[] = [];

  // (a)
  for (const rel of STANDARD_CONTEXTS) {
    const doc = JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8"));
    const bare = bareAliases(doc);
    if (bare.length) problems.push(`standard context ${rel} defines ${bare.length} bare alias(es): ${bare.slice(0, 8).join(", ")}${bare.length > 8 ? " …" : ""}`);
  }

  // (b) + (c)
  for (const abs of await productSeeds()) {
    const rel = path.relative(ROOT, abs);
    const doc = stripComments(JSON.parse(await fs.readFile(abs, "utf8")));
    const bare = new Set<string>();
    bareTerms(doc, bare);
    if (bare.size) { problems.push(`seed ${rel} uses bare term(s): ${[...bare].slice(0, 8).join(", ")}`); continue; }
    try {
      const own = await canon(doc);
      if (/@@|"@(value|language)"/.test(own)) { problems.push(`seed ${rel}: malformed literal under its own context`); continue; }
      const op = await canon({ ...doc, "@context": operationalContextFor(doc) });
      if (own !== op) problems.push(`seed ${rel}: operational context is not graph-identical (${own.split("\n").filter(Boolean).length} vs ${op.split("\n").filter(Boolean).length} quads)`);
    } catch (e: any) {
      problems.push(`seed ${rel}: ${e.message}`);
    }
  }

  if (problems.length) {
    console.error(`✗ operational-context guard: ${problems.length} problem(s)`);
    problems.forEach((p) => console.error("  - " + p));
    return 1;
  }
  console.log("✓ operational-context guard: standard contexts prefixed; every product seed prefixed and graph-identical under its operational context.");
  return 0;
}

process.exit(await main());
