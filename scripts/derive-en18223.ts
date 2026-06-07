#!/usr/bin/env tsx
/**
 * Derive an EN 18223:2026 DigitalProductPassport (Annex A "expanded" JSON)
 * from good GS1 Web Vocabulary + GS1 Digital Link JSON-LD (the EN 18223
 * "compressed" serialization, i.e. our named-property GS1 JSON-LD).
 *
 * Node CLI around the browser-safe core (scripts/en18223/derive-core.ts);
 * the fs documentLoader and the n3 range index come from
 * scripts/en18223/node-io.ts. The same core powers the browser demo
 * (demos/en18223-converter).
 *
 * Usage: tsx scripts/derive-en18223.ts <input.jsonld> [output.json]
 */
import { promises as fs } from "node:fs";
import { deriveEN18223 } from "./en18223/derive-core.ts";
import { buildRangeIndex, documentLoader } from "./en18223/node-io.ts";

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath) {
    console.error("Usage: tsx scripts/derive-en18223.ts <input.jsonld> [output.json]");
    process.exit(1);
  }
  const input = JSON.parse(await fs.readFile(inputPath, "utf8"));
  const range = await buildRangeIndex();
  const out = await deriveEN18223(input, range, documentLoader);
  const json = JSON.stringify(out, null, 2) + "\n";
  if (outputPath) {
    await fs.writeFile(outputPath, json);
    console.error(`wrote ${outputPath}`);
  } else {
    process.stdout.write(json);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
