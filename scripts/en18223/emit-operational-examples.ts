/**
 * Emit the committed EN 18223 §5.2 operational artifacts.
 *
 * For every product-passport example (extensions/**\/examples/*.jsonld) this
 * writes a sibling {example}.operational.jsonld containing the bare-term
 * compressed serialization produced by compactOperational — the exact form the
 * DPP API returns for `representation=compressed`. These are golden files: the
 * battery one doubles as the Java parity fixture (dpp-api asserts its own output
 * matches byte-for-byte, modulo lastUpdated).
 *
 * Usage: tsx scripts/en18223/emit-operational-examples.ts [<file.jsonld> ...]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { ROOT, documentLoader, buildRangeIndex } from "./node-io.ts";
import { compactOperational } from "./serialize.ts";

const SKIP = /(batterypass-|regulatory-notification|plot-of-land)/;

async function listExamples(): Promise<string[]> {
  const out: string[] = [];
  const exts = path.join(ROOT, "extensions");
  for (const region of await fs.readdir(exts)) {
    const regionDir = path.join(exts, region);
    if (!(await fs.stat(regionDir)).isDirectory()) continue;
    for (const mod of await fs.readdir(regionDir)) {
      const exDir = path.join(regionDir, mod, "examples");
      let files: string[];
      try { files = await fs.readdir(exDir); } catch { continue; }
      for (const f of files) {
        if (f.endsWith(".jsonld") && !f.endsWith(".operational.jsonld") && !SKIP.test(f)) {
          out.push(path.join(exDir, f));
        }
      }
    }
  }
  return out.sort();
}

const args = process.argv.slice(2);
const files = args.length ? args.map((f) => path.resolve(f)) : await listExamples();
const range = await buildRangeIndex();
for (const f of files) {
  const input = JSON.parse(await fs.readFile(f, "utf8"));
  const operational = await compactOperational(input, range, documentLoader);
  const outPath = f.replace(/\.jsonld$/, ".operational.jsonld");
  await fs.writeFile(outPath, JSON.stringify(operational, null, 2) + "\n");
  console.log(`  ${path.relative(ROOT, outPath)}`);
}
console.log(`\n✓ wrote ${files.length} operational artifact(s)`);
