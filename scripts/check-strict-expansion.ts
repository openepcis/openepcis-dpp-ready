/**
 * STRICT EXPANSION GUARD — no published artifact may carry a relative
 * @id/@type reference.
 *
 * Why this exists next to check:operational: that guard checks term SHAPE
 * (bare vs prefixed, prefix leaks, graph identity). It cannot see a value
 * that LOOKS fine and still expands to a relative IRI - an enum member
 * without a mapping in the scoped context it is used under. Three such
 * breaks reached live credential issuance (certificationSubject free text,
 * hasOperatorRole @id-vs-@vocab, referencedFileType) before anything
 * caught them; strict verifiers (jsonld.js safe mode) reject exactly this,
 * so a credential built from such data cannot be verified by the
 * ecosystem.
 *
 * Detection scans the EXPANDED document rather than trusting processor
 * events: jsonld.js reports NOTHING for an unmapped enum under an
 * @id/@vocab-typed key (measured 2026-08-22) - it silently produces a
 * relative @id.
 *
 * Known, deliberate exceptions come from scripts/vocab-allowlist.json, so
 * there is ONE list of accepted deviations, not two.
 *
 * Usage: pnpm run check:strict-expansion
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import jsonld from "jsonld";
import { documentLoader, ROOT } from "./en18223/node-io.ts";

const EXCLUDE = /\.(en18223|expanded)\.json$/;

/** Every @id/@type value in an EXPANDED document that is not an absolute IRI. */
function relativeReferences(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) relativeReferences(item, out);
    return out;
  }
  if (!node || typeof node !== "object") return out;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === "@id" || key === "@type") {
      for (const v of Array.isArray(value) ? value : [value]) {
        // absolute IRIs and blank nodes carry a colon
        if (typeof v === "string" && !v.includes(":")) out.push(v);
      }
    }
    relativeReferences(value, out);
  }
  return out;
}

async function allowlisted(): Promise<Set<string>> {
  const raw = JSON.parse(await fs.readFile(path.join(ROOT, "scripts/vocab-allowlist.json"), "utf8"));
  const terms = new Set<string>();
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (typeof record.term === "string") terms.add(record.term);
    Object.values(record).forEach(walk);
  };
  walk(raw);
  return terms;
}

async function artifacts(): Promise<string[]> {
  const found: string[] = [];
  const walk = async (dir: string) => {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) { await walk(p); continue; }
      if (entry.name.endsWith(".jsonld") && !EXCLUDE.test(entry.name)) found.push(p);
    }
  };
  await walk(path.join(ROOT, "extensions"));
  return found.sort();
}

async function main(): Promise<number> {
  const skip = await allowlisted();
  const problems: string[] = [];
  let checked = 0;

  for (const abs of await artifacts()) {
    const rel = path.relative(ROOT, abs);
    let doc: unknown;
    try {
      doc = JSON.parse((await fs.readFile(abs, "utf8")).replace(/^\s*\/\/.*$/gm, ""));
    } catch {
      continue; // not a JSON document we own
    }
    let expanded: unknown;
    try {
      expanded = await jsonld.expand(doc as any, { documentLoader: documentLoader as any, safe: false } as any);
    } catch (e: any) {
      problems.push(`${rel}: does not expand — ${e.message}`);
      continue;
    }
    checked++;
    const relatives = [...new Set(relativeReferences(expanded))].filter((v) => !skip.has(v));
    if (relatives.length) {
      problems.push(
        `${rel}: relative reference(s) ${relatives.slice(0, 6).join(", ")} — map the value in the ` +
          `scoped @context of the key it is used under, or write an absolute IRI/CURIE`,
      );
    }
  }

  if (problems.length) {
    console.error(`✗ strict-expansion guard: ${problems.length} artifact(s) carry relative references\n`);
    problems.forEach((p) => console.error(`  - ${p}`));
    console.error(
      `\nStrict verifiers (and our own issuance gate) reject these; ${skip.size} known exception(s) ` +
        `from scripts/vocab-allowlist.json were honoured.`,
    );
    return 1;
  }
  console.log(`✓ strict-expansion guard: ${checked} artifact(s) expand without a single relative reference`);
  return 0;
}

process.exit(await main());
