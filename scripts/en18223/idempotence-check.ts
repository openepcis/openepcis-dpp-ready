/**
 * Idempotence gate for the compressed EN 18223 §5.2 serialization (also written
 * "operational").
 *
 * Proves that the body a read emits is a byte-stable write body: for every product
 * example, compressing the derived passport (keyed by the module operational
 * context), attaching that context, deriving + compressing again yields the
 * IDENTICAL payload. That is the GET -> PUT -> GET stability guarantee the DPP API
 * relies on (writing back a read is a fixed point).
 *
 * Usage: tsx scripts/en18223/idempotence-check.ts [<file.jsonld> ...]
 * With no args it scans every extensions/**\/examples/*.jsonld product passport.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { ROOT, documentLoader, buildRangeIndex } from "./node-io.ts";
import { deriveEN18223, compressEN18223 } from "./derive-core.ts";
import { operationalContextFor, buildOperationalKeyMap, operationalOptions } from "./serialize.ts";

// Non-product-passport examples (bridges, notifications, plot-of-land) that the
// demo builder also skips: they are not DPPs, so the DPP projection does not apply.
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
      for (const f of files) if (f.endsWith(".jsonld") && !SKIP.test(f)) out.push(path.join(exDir, f));
    }
  }
  return out.sort();
}

async function checkOne(rel: string, range: Map<string, string>): Promise<boolean> {
  const input = JSON.parse(await fs.readFile(rel, "utf8"));
  const ctx = operationalContextFor(input);
  const keyFn = operationalOptions(await buildOperationalKeyMap(ctx, documentLoader));
  // Production-accurate: the stored operational document carries the operational
  // context, so BOTH passes derive under it (the example's own @context only
  // matters at create time, before the operational form is stored).
  const { "@context": _c, ...body } = input;
  const s1 = compressEN18223(await deriveEN18223({ "@context": ctx, ...body }, range, documentLoader), keyFn);
  const s2 = compressEN18223(await deriveEN18223({ "@context": ctx, ...s1 }, range, documentLoader), keyFn);
  const ok = JSON.stringify(s1) === JSON.stringify(s2);
  const name = path.relative(ROOT, rel);
  if (ok) {
    console.log(`  PASS  ${name}`);
    return true;
  }
  console.log(`  FAIL  ${name}`);
  for (const k of Object.keys(s1)) {
    if (JSON.stringify(s1[k]) !== JSON.stringify(s2[k])) {
      console.log(`     DIFF ${k}`);
      console.log(`        first:  ${JSON.stringify(s1[k]).slice(0, 160)}`);
      console.log(`        second: ${JSON.stringify(s2[k]).slice(0, 160)}`);
    }
  }
  return false;
}

const args = process.argv.slice(2);
const files = args.length ? args.map((f) => path.resolve(f)) : await listExamples();
const range = await buildRangeIndex();
let allOk = true;
for (const f of files) allOk = (await checkOne(f, range)) && allOk;
console.log(allOk
  ? `\n✓ operational serialization is idempotent across ${files.length} product example(s) (GET → PUT → GET is byte-stable)`
  : "\n✗ operational serialization is NOT idempotent");
process.exit(allOk ? 0 : 1);
