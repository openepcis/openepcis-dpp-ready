#!/usr/bin/env tsx
/**
 * Precompute the property -> rdfs:range index used by the EN 18223 converter
 * and write it as JSON, so the browser demo (demos/en18223-converter) can load
 * it without parsing TTL with n3 in the browser.
 *
 * Usage: tsx scripts/build-en18223-rangeindex.ts
 * Output: demos/en18223-converter/range-index.json  (IRI -> rdfs:range IRI)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { buildRangeIndex, ROOT } from "./en18223/node-io.ts";

async function main() {
  const index = await buildRangeIndex();
  const obj: Record<string, string> = {};
  for (const [k, v] of [...index.entries()].sort((a, b) => a[0].localeCompare(b[0]))) obj[k] = v;
  const out = path.join(ROOT, "demos/en18223-converter/range-index.json");
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, JSON.stringify(obj, null, 2) + "\n");
  console.error(`wrote ${path.relative(ROOT, out)} (${Object.keys(obj).length} properties)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
