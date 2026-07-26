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
import { compactOperational } from "./serialize.ts";

// Non-product-passport examples (bridges, notifications, plot-of-land) that the
// demo builder also skips: they are not DPPs, so the DPP projection does not apply.
const SKIP = /(batterypass-|regulatory-notification|plot-of-land)/;

// Bare-name collisions where a shadowed same-name term legitimately stays a
// CURIE (see build-context.ts detectCollisions). Local names of shadowed terms
// are allowed to appear CURIE-keyed in compacted output.
async function loadShadowedLocalNames(): Promise<Set<string>> {
  const out = new Set<string>();
  try {
    const manifest = JSON.parse(
      await fs.readFile(path.join(ROOT, "extensions/common/core/context/.alias-collisions.json"), "utf8"),
    );
    for (const c of manifest) out.add(c.term);
  } catch { /* no manifest yet */ }
  return out;
}

// Walk a compacted document and collect every property key that is still a CURIE
// (contains ':' and is not an @-keyword). Values are not keys, so only object
// keys are inspected.
function collectCurieKeys(node: any, acc: Set<string>): void {
  if (Array.isArray(node)) {
    for (const v of node) collectCurieKeys(v, acc);
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (!k.startsWith("@") && k.includes(":")) acc.add(k);
    collectCurieKeys(v, acc);
  }
}

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

async function checkOne(rel: string, range: Map<string, string>, allowedCuries: Set<string>): Promise<boolean> {
  const input = JSON.parse(await fs.readFile(rel, "utf8"));
  // GET -> PUT -> GET: compact the resolver master data (pass 1, standard
  // context), then compact the compacted operational form again (pass 2, which
  // carries the operational context). True JSON-LD compaction must be a fixed point.
  const s1 = await compactOperational(input, range, documentLoader);
  const s2 = await compactOperational(s1, range, documentLoader);
  const name = path.relative(ROOT, rel);

  // Idempotence (fixed point) is a hard correctness gate. Residual CURIE keys are
  // reported as coverage gaps (a bare alias is missing for that IRI, or it is a
  // shadowed collision) but do NOT fail the build: full bare coverage is bounded
  // by vocabulary completeness (a term used in an example but absent from the TTL
  // has no bare alias to compact to), which is tracked separately.
  const curies = new Set<string>();
  collectCurieKeys(s1, curies);
  const leaks = [...curies].filter((c) => !allowedCuries.has(c.split(":")[1] ?? c));
  leaks.forEach((c) => coverageGaps.add(c));

  const stable = JSON.stringify(s1) === JSON.stringify(s2);
  if (stable) {
    console.log(`  PASS  ${name}${leaks.length ? `  (CURIE gaps: ${leaks.join(", ")})` : ""}`);
    return true;
  }
  console.log(`  FAIL  ${name}  (not idempotent)`);
  for (const k of new Set([...Object.keys(s1), ...Object.keys(s2)])) {
    if (JSON.stringify(s1[k]) !== JSON.stringify(s2[k])) {
      console.log(`     DIFF ${k}`);
      console.log(`        first:  ${String(JSON.stringify(s1[k])).slice(0, 160)}`);
      console.log(`        second: ${String(JSON.stringify(s2[k])).slice(0, 160)}`);
    }
  }
  return false;
}

const coverageGaps = new Set<string>();

const args = process.argv.slice(2);
const files = args.length ? args.map((f) => path.resolve(f)) : await listExamples();
const range = await buildRangeIndex();
const allowedCuries = await loadShadowedLocalNames();
let allOk = true;
for (const f of files) allOk = (await checkOne(f, range, allowedCuries)) && allOk;
if (coverageGaps.size) {
  console.log(`\n  ${coverageGaps.size} distinct term(s) still CURIE-keyed (no bare alias / shadowed):`);
  console.log(`  ${[...coverageGaps].sort().join(", ")}`);
}
console.log(allOk
  ? `\n✓ operational serialization is idempotent (GET → PUT → GET is byte-stable) across ${files.length} product example(s)`
  : "\n✗ operational serialization is NOT idempotent");
process.exit(allOk ? 0 : 1);
