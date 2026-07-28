/**
 * Golden-fidelity gate for the EN 18223 §5.2 compressed form.
 *
 * `roundtrip-check.ts` proves that attaching an operational context to the
 * MASTER body is lossless. It never reads the committed `*.operational.jsonld`
 * artifacts, so it cannot see a defect introduced by COMPACTION, and the
 * compressed artifact is exactly what the DPP API serves for
 * `representation=compressed`. This gate closes that hole: it expands each
 * committed golden under its own operational `@context` and compares the graph
 * to the seed it was generated from.
 *
 * Two failure modes it catches, both of which are silent today:
 *   1. A coercion mismatch between the operational context and the standard one
 *      (e.g. an `@type: "@id"` envelope alias on a property whose range is
 *      xsd:string) turns a literal into a relative IRI on read-back.
 *   2. An `@type: "@vocab"` enum whose scoped code map does not list the code the
 *      compressed form emits, so the bare code expands to a relative IRI.
 *
 * The compressed form is a PROJECTION, not a re-serialisation: it adds the EN
 * 18223 envelope (dppSchemaVersion, contentSpecificationIds, …), drops the subject
 * IRI (identity lives in the envelope / the request URL) and may inline a
 * referenced node. So it is deliberately NOT graph-equal to the seed, and this
 * gate does not pretend otherwise. It asserts the two invariants that hold
 * regardless of how the projection reshapes the document, and that are pure
 * corruption when violated:
 *
 *   (A) no object expands to a relative IRI, so the value is unreadable as data;
 *   (B) for a predicate the seed and the golden share, the VALUE FORM agrees: if
 *       the seed's object is an IRI, the golden's must be too. A literal there is a
 *       node reference flattened into a string, so a consumer gets text where the
 *       seed had a link. That happens when the operational chain's bare alias
 *       lost the `@type: "@id"` its standard definition (or the upstream range)
 *       carries. A URL-shaped string is NOT a violation when the seed has one too
 *       (gs1:certificationURI is a genuine xsd:anyURI literal).
 *
 * Usage: tsx scripts/en18223/golden-fidelity-check.ts [filter-substring]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import jsonld from "jsonld";
import { documentLoader, ROOT } from "./node-io.ts";

const stripComments = (o: any): any =>
  Array.isArray(o) ? o.map(stripComments)
    : o && typeof o === "object"
      ? Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith("_")).map(([k, v]) => [k, stripComments(v)]))
      : o;

async function quads(doc: any): Promise<string[]> {
  const nq = (await jsonld.canonize(stripComments(doc), {
    algorithm: "URDNA2015",
    format: "application/n-quads",
    safe: false,
    documentLoader: documentLoader as any,
  } as any)) as unknown as string;
  return nq.split("\n").filter(Boolean);
}

/** predicate + object of a quad, with blank-node labels normalised away. */
function predObj(q: string): string {
  const norm = q.replace(/_:c14n\d+/g, "_:b");
  const m = norm.match(/^(?:<[^>]*>|_:b)\s+(.*)\s\.$/);
  return m ? m[1] : norm;
}

const isAbsolute = (s: string) => /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s);

/** (A) objects that are relative IRIs, unreadable as data. */
function relativeObjects(qs: string[]): string[] {
  const out: string[] = [];
  for (const q of qs) {
    const m = q.match(/\s<([^>]*)>\s\.$/);
    if (m && !isAbsolute(m[1])) out.push(`${predicateOf(q)} -> <${m[1]}>`);
  }
  return out;
}

/** predicate -> set of object forms ("iri" | "literal") in a graph. */
function formsByPredicate(qs: string[]): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  for (const q of qs) {
    const body = q.replace(/^(?:<[^>]*>|_:c14n\d+)\s+/, "");
    const pm = body.match(/^<([^>]*)>\s+(.*)\s\.$/);
    if (!pm) continue;
    const [, pred, obj] = pm;
    const form = obj.startsWith('"') ? "literal" : "iri"; // blank nodes count as iri (a node)
    if (!m.has(pred)) m.set(pred, new Set());
    m.get(pred)!.add(form);
  }
  return m;
}

/** (B) predicates where the seed carries an IRI object but the golden a literal. */
function flattenedRefs(seedQ: string[], goldQ: string[]): string[] {
  const s = formsByPredicate(seedQ);
  const g = formsByPredicate(goldQ);
  const out: string[] = [];
  for (const [pred, forms] of g) {
    const sf = s.get(pred);
    if (!sf) continue; // predicate added by the projection; nothing to compare against
    if (forms.has("literal") && !sf.has("literal") && sf.has("iri")) {
      out.push(`${pred}: seed has an IRI object, golden a literal`);
    }
  }
  return out.sort();
}

function predicateOf(q: string): string {
  const m = q.match(/<([^>]*)>\s(?:<[^>]*>|"|_:)/);
  const all = [...q.matchAll(/<([^>]*)>/g)].map((x) => x[1]);
  return all.length >= 2 ? all[all.length - (q.trimEnd().endsWith('> .') ? 2 : 1)] : (m ? m[1] : "?");
}

async function main(): Promise<number> {
  const filter = process.argv[2];
  const goldens: string[] = [];
  for (const rel of await fs.readdir(path.join(ROOT, "extensions"), { recursive: true })) {
    const r = String(rel).split(path.sep).join("/");
    if (/\/examples\/[^/]+\.operational\.jsonld$/.test(r)) goldens.push(`extensions/${r}`);
  }
  goldens.sort();

  const problems: string[] = [];
  let checked = 0;
  for (const golden of goldens) {
    if (filter && !golden.includes(filter)) continue;
    const seed = golden.replace(/\.operational\.jsonld$/, ".jsonld");
    if (!(await fs.stat(path.join(ROOT, seed)).catch(() => null))) continue;
    checked++;
    const seedQ = await quads(JSON.parse(await fs.readFile(path.join(ROOT, seed), "utf8")));
    const goldQ = await quads(JSON.parse(await fs.readFile(path.join(ROOT, golden), "utf8")));

    const rel = [...new Set(relativeObjects(goldQ))];
    const flat = flattenedRefs(seedQ, goldQ);
    if (rel.length) problems.push(`${golden}\n      (A) ${rel.length} value(s) expand to a RELATIVE IRI:\n          ${rel.slice(0, 8).join("\n          ")}`);
    if (flat.length) problems.push(`${golden}\n      (B) ${flat.length} predicate(s) whose node reference flattened to a STRING:\n          ${flat.slice(0, 8).join("\n          ")}`);
    console.log(`  ${rel.length || flat.length ? "FAIL" : "PASS"}  ${golden}`);
  }

  if (problems.length) {
    console.error(`\n✗ golden-fidelity: ${problems.length} problem(s) across ${checked} compressed artifact(s)`);
    problems.forEach((p) => console.error("  - " + p));
    console.error(`\n  The compressed form is what the DPP API serves for representation=compressed, so a`);
    console.error(`  difference here is data a consumer cannot read back. Fix the coercion in the operational`);
    console.error(`  context (it must match the standard context / TTL range) or complete the @vocab code map,`);
    console.error(`  then re-run \`pnpm run build:operational-examples\`.`);
    return 1;
  }
  console.log(`\n✓ golden-fidelity: all ${checked} compressed artifact(s) read back with no relative IRI and no flattened node reference.`);
  return 0;
}

process.exit(await main());
