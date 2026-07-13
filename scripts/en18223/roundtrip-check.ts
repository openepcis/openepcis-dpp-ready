/**
 * RDF round-trip gate for the EN 18223 operational JSON-LD context.
 *
 * Proves that attaching the single published operational context
 * (extensions/common/core/context/dpp-operational-context.jsonld) to a compact
 * GS1 Web Vocabulary master-data body (a resolver POST /products payload) yields
 * a JSON-LD document that expands to the SAME RDF graph (URDNA2015 canonical
 * N-Quads) as the original master data. That is the "perfect RDF" guarantee: the
 * operational/JSON-LD tier is lossless and graph-equal to what you POST.
 *
 * Usage: tsx scripts/en18223/roundtrip-check.ts <master.jsonld> [<master2.jsonld> ...]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import jsonld from "jsonld";
import n3 from "n3";
import { documentLoader as loader, ROOT } from "./node-io.ts";
import { operationalContextFor, operationalJsonLd, toTurtle } from "./serialize.ts";

const canon = (doc: any) =>
  jsonld.canonize(doc, { algorithm: "URDNA2015", format: "application/n-quads", safe: false, documentLoader: loader as any });

function stripComments(o: any): any {
  if (Array.isArray(o)) return o.map(stripComments);
  if (o && typeof o === "object")
    return Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith("_")).map(([k, v]) => [k, stripComments(v)]));
  return o;
}

function quadSet(nquads: string): Set<string> {
  return new Set(nquads.split("\n").filter(Boolean));
}

async function checkOne(rel: string): Promise<boolean> {
  const master = stripComments(JSON.parse(await fs.readFile(path.resolve(ROOT, rel), "utf8")));
  const operational = { ...master, "@context": operationalContextFor(master) };

  const a = quadSet(await canon(master));
  const b = quadSet(await canon(operational));

  const missing = [...a].filter((q) => !b.has(q)); // in master, lost by operational context
  const extra = [...b].filter((q) => !a.has(q)); // added by operational context
  const ctxOk = missing.length === 0 && extra.length === 0;

  // Turtle round-trip: operational JSON-LD -> Turtle -> parse back -> canonical graph.
  const ttl = await toTurtle(operationalJsonLd(master), loader);
  const reparsed = new n3.Parser({ format: "text/turtle" }).parse(ttl);
  const backNQuads = new n3.Writer({ format: "application/n-quads" });
  backNQuads.addQuads(reparsed);
  const backStr: string = await new Promise((res, rej) => backNQuads.end((e: any, r: string) => (e ? rej(e) : res(r))));
  const c = quadSet(await jsonld.canonize(backStr, { algorithm: "URDNA2015", format: "application/n-quads", inputFormat: "application/n-quads", safe: false } as any));
  const ttlOk = c.size === b.size && [...b].every((q) => c.has(q));

  const ok = ctxOk && ttlOk;
  console.log(`\n${ok ? "PASS" : "FAIL"}  ${rel}  (master ${a.size} · operational ${b.size} · turtle ${c.size} quads)`);
  if (missing.length) {
    console.log(`  ${missing.length} quad(s) LOST by operational context:`);
    missing.slice(0, 12).forEach((q) => console.log("   - " + q));
  }
  if (extra.length) {
    console.log(`  ${extra.length} quad(s) ADDED by operational context:`);
    extra.slice(0, 12).forEach((q) => console.log("   + " + q));
  }
  if (!ttlOk) console.log(`  Turtle round-trip mismatch: ${c.size} quads vs ${b.size}`);
  return ok;
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: tsx scripts/en18223/roundtrip-check.ts <master.jsonld> ...");
  process.exit(64);
}
let allOk = true;
for (const f of files) allOk = (await checkOne(f)) && allOk;
console.log(`\n${allOk ? "✓ all round-trips isomorphic" : "✗ round-trip differences found"}`);
process.exit(allOk ? 0 : 1);
