#!/usr/bin/env tsx
/**
 * Build the data files the EN 18223 converter demo bundles:
 *  - range-index.json : property IRI -> rdfs:range (parsed from the module TTLs)
 *  - contexts.json    : context URL -> context document (the local OpenEPCIS contexts)
 *  - samples.json     : real GS1 Web Vocabulary product examples, grouped by industry
 *
 * All three are generated from the repo sources, so the static demo runs fully
 * offline and stays in sync with the ontologies, contexts, and examples we ship.
 *
 * Usage: tsx scripts/build-en18223-demo-data.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { buildRangeIndex, ROOT, URL_TO_FILE } from "./en18223/node-io.ts";
import { granularityFromDigitalLink } from "./en18223/derive-core.ts";

const OUT_DIR = path.join(ROOT, "demos/en18223-converter");

// Module directory -> dropdown group label, in display order.
const GROUPS: Array<[string, string]> = [
  ["extensions/eu/battery", "EU Battery"],
  ["extensions/eu/electronics", "EU Electronics"],
  ["extensions/eu/textile", "EU Textile"],
  ["extensions/eu/eudr", "EU Deforestation (EUDR)"],
  ["extensions/eu/ppwr", "EU Packaging (PPWR)"],
  ["extensions/eu/cpr", "EU Construction (CPR)"],
  ["extensions/eu/detergent", "EU Detergent"],
  ["extensions/us/fsma204", "US FSMA 204"],
  ["extensions/common/core", "Common Core"],
];

// Top-level type local-names that mark a single product / passport document.
const PRODUCT_TYPES = new Set([
  "Product", "DigitalProductPassport", "Battery", "Packaging",
  "ConstructionProduct", "DetergentProduct", "Clothing", "Footwear",
  "TextileApparel", "TextileFootwear",
]);
const localName = (t: string): string => (t.includes(":") ? t.slice(t.indexOf(":") + 1) : t);

function isProduct(doc: any): boolean {
  const t = doc.type ?? doc["@type"];
  const types = Array.isArray(t) ? t : t ? [t] : [];
  return types.some((x) => typeof x === "string" && PRODUCT_TYPES.has(localName(x)));
}

// Every string @context entry must be one we bundle locally; inline namespace
// objects are fine. Guarantees the sample resolves with no network.
function contextsResolvable(doc: any): boolean {
  const c = doc["@context"];
  const entries = Array.isArray(c) ? c : c ? [c] : [];
  return entries.every((e) => typeof e !== "string" || e in URL_TO_FILE);
}

const idOf = (doc: any): string | undefined => doc.id ?? doc["@id"];

async function findExamples(moduleDir: string): Promise<string[]> {
  const dir = path.join(ROOT, moduleDir, "examples");
  let names: string[];
  try { names = await fs.readdir(dir); } catch { return []; }
  return names
    .filter((n) => n.endsWith(".jsonld") && !n.startsWith("en18223-passport"))
    .sort()
    .map((n) => path.join(dir, n));
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  // range-index.json
  const index = await buildRangeIndex();
  const rangeObj: Record<string, string> = {};
  for (const [k, v] of [...index.entries()].sort((a, b) => a[0].localeCompare(b[0]))) rangeObj[k] = v;
  await fs.writeFile(path.join(OUT_DIR, "range-index.json"), JSON.stringify(rangeObj, null, 2) + "\n");

  // contexts.json (url -> document, the single set the CLI also reads)
  const contexts: Record<string, any> = {};
  for (const [url, rel] of Object.entries(URL_TO_FILE)) {
    contexts[url] = JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8"));
  }
  await fs.writeFile(path.join(OUT_DIR, "contexts.json"), JSON.stringify(contexts, null, 2) + "\n");

  // samples.json (real product examples, grouped by industry)
  const samples: Array<{ group: string; label: string; doc: any }> = [];
  const skipped: string[] = [];
  for (const [moduleDir, group] of GROUPS) {
    for (const file of await findExamples(moduleDir)) {
      const rel = path.relative(ROOT, file);
      let doc: any;
      try { doc = JSON.parse(await fs.readFile(file, "utf8")); } catch { skipped.push(`${rel} (parse error)`); continue; }
      const id = idOf(doc);
      if (!isProduct(doc) || !id) { skipped.push(`${rel} (not a product passport)`); continue; }
      if (!contextsResolvable(doc)) { skipped.push(`${rel} (references a non-bundled context)`); continue; }
      const base = path.basename(file, ".jsonld");
      const gran = granularityFromDigitalLink(typeof id === "string" ? id : undefined);
      samples.push({ group, label: `${base} (${gran})`, doc });
    }
  }
  await fs.writeFile(path.join(OUT_DIR, "samples.json"), JSON.stringify(samples, null, 2) + "\n");

  const groupsUsed = new Set(samples.map((s) => s.group)).size;
  console.error(`wrote range-index.json (${Object.keys(rangeObj).length} properties)`);
  console.error(`wrote contexts.json (${Object.keys(contexts).length} contexts)`);
  console.error(`wrote samples.json (${samples.length} samples across ${groupsUsed} groups)`);
  if (skipped.length) console.error(`skipped ${skipped.length}:\n  ${skipped.join("\n  ")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
