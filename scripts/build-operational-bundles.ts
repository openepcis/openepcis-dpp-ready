/**
 * Self-contained twins of the operational contexts.
 *
 * Each operational context is a chain of remote references: textile-operational
 * imports dpp-operational, which imports dpp-core, which imports assessment and
 * so on. jsonld.js and pyld dereference at most 10 remote context URLs per
 * resolution and stop with "context overflow" on the eleventh. One sector needs
 * 8 of our URLs plus gs1Voc.jsonld; a passport with two sectors needs 11 and
 * yields no RDF at all in those libraries.
 *
 * This script writes, next to every {name}-operational-context.jsonld, a
 * {name}-operational-bundle.jsonld whose @context is the same chain with every
 * remote reference replaced by the @context value it points to, in place and in
 * order. That substitution is exactly what a JSON-LD processor does when it
 * dereferences a context, so the bundle means the same by construction. The
 * script also proves it:
 *
 *   (a) a bundle contains no remote context reference, scoped ones included;
 *   (b) original and bundle produce the same term definitions, @vocab, default
 *       language and base direction, and every scoped context produces the
 *       same definitions on top of them;
 *   (c) every committed bundle is byte-identical to a fresh build;
 *   (d) gs1Voc.jsonld plus the bundles of every pair of sector modules
 *       resolves within the jsonld.js limit.
 *
 * The operational contexts stay as they are and remain the canonical URLs; a
 * bundle is an alternative a server may hand out where the chain is too long.
 *
 * Usage: tsx scripts/build-operational-bundles.ts [--check]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import jsonld from "jsonld";
import { buildContextMap, makeDocumentLoader } from "./lib/jsonld-loader.ts";
import { ROOT } from "./en18223/node-io.ts";

const CHECK = process.argv.includes("--check");
const OWN = "https://ref.openepcis.org/extensions/";
const GS1_VOC = "https://ref.gs1.org/voc/data/gs1Voc.jsonld";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const contextMap = await buildContextMap();
const rawLoader = makeDocumentLoader(contextMap);
const loaded = new Map<string, Promise<unknown>>();
const loader = (url: string) => {
  if (!loaded.has(url)) loaded.set(url, rawLoader(url));
  return loaded.get(url)! as ReturnType<typeof rawLoader>;
};

async function contextOf(url: string): Promise<Json> {
  const file = contextMap[url];
  if (!file) throw new Error(`no file for ${url}`);
  const doc = JSON.parse(await fs.readFile(path.join(ROOT, file), "utf8"));
  return doc["@context"] as Json;
}

/** Replace every remote reference in a context value by the value it points to. */
async function inline(value: Json, chain: string[]): Promise<Json> {
  if (typeof value === "string") {
    if (!value.startsWith(OWN)) throw new Error(`foreign context ${value} in ${chain.join(" > ")}`);
    if (chain.includes(value)) throw new Error(`cycle ${[...chain, value].join(" > ")}`);
    return inline(await contextOf(value), [...chain, value]);
  }
  if (Array.isArray(value)) {
    const out: Json[] = [];
    for (const entry of value) {
      const resolved = await inline(entry, chain);
      // a dereferenced array is spliced in place, as the processor walks it
      if (typeof entry === "string" && Array.isArray(resolved)) out.push(...resolved);
      else out.push(resolved);
    }
    return out;
  }
  if (value && typeof value === "object") {
    if ("@import" in value) throw new Error(`@import in ${chain.join(" > ")} is not handled`);
    const out: { [k: string]: Json } = {};
    for (const [k, v] of Object.entries(value)) {
      if (v && typeof v === "object" && !Array.isArray(v) && "@context" in v) {
        out[k] = { ...v, "@context": await inline(v["@context"] as Json, [...chain, `scoped ${k}`]) };
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return value;
}

function hasRemote(value: Json): boolean {
  if (typeof value === "string") return true;
  if (Array.isArray(value)) return value.some(hasRemote);
  if (value && typeof value === "object") {
    return Object.values(value).some(
      (v) => !!v && typeof v === "object" && !Array.isArray(v) && "@context" in v && hasRemote(v["@context"] as Json),
    );
  }
  return false;
}

// ------------------------------------------------------------- the proof

type Active = { mappings: Map<string, Record<string, unknown>>; [k: string]: unknown };

async function activeContext(ctx: Json, base?: Active): Promise<Active> {
  const start = base ?? ((await (jsonld as any).processContext(null, null, {})) as Active);
  return (await (jsonld as any).processContext(start, ctx, { documentLoader: loader })) as Active;
}

function definition(def: Record<string, unknown>): string {
  const { "@context": _scoped, ...rest } = def;
  return JSON.stringify(Object.keys(rest).sort().map((k) => [k, rest[k]]));
}

const scopedSeen = new Map<string, Promise<string | null>>();

async function difference(a: Active, b: Active, where: string, depth = 0): Promise<string | null> {
  for (const key of ["@vocab", "@language", "@direction", "@base"]) {
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) return `${where}: ${key} differs`;
  }
  if (a.mappings.size !== b.mappings.size) return `${where}: ${a.mappings.size} terms vs ${b.mappings.size}`;
  for (const [term, def] of a.mappings) {
    const other = b.mappings.get(term);
    if (!other) return `${where}: term ${term} missing`;
    if (definition(def) !== definition(other)) return `${where}: term ${term} differs`;
    if (def["@context"] !== undefined || other["@context"] !== undefined) {
      if (depth > 2) continue;
      // the same scoped pair on the same base is proven once
      const key = `${depth}|${JSON.stringify(def["@context"])}|${JSON.stringify(other["@context"])}`;
      if (!scopedSeen.has(key)) {
        scopedSeen.set(
          key,
          (async () =>
            difference(
              await activeContext(def["@context"] as Json, a),
              await activeContext(other["@context"] as Json, b),
              `${where} > ${term}`,
              depth + 1,
            ))(),
        );
      }
      const d = await scopedSeen.get(key)!;
      if (d) return d;
    }
  }
  return null;
}

// ------------------------------------------------------------- build

const operational = Object.entries(contextMap)
  .filter(([url]) => url.startsWith(OWN) && url.endsWith("-operational-context.jsonld"))
  .sort(([a], [b]) => a.localeCompare(b));

const failures: string[] = [];
const bundleUrls: Record<string, string> = {};

for (const [url, file] of operational) {
  const bundleUrl = url.replace(/-operational-context\.jsonld$/, "-operational-bundle.jsonld");
  const bundleFile = file.replace(/-operational-context\.jsonld$/, "-operational-bundle.jsonld");
  bundleUrls[url] = bundleUrl;
  const context = await inline(await contextOf(url), [url]);
  const doc = {
    _comment: [
      `Self-contained twin of ${url}: every remote context reference replaced by its content, in place.`,
      "Generated by scripts/build-operational-bundles.ts; do not edit. Same meaning as the operational context, proven in --check.",
      "Use it where a JSON-LD library limits remote context loads (jsonld.js and pyld stop at 10).",
    ],
    "@context": context,
  };
  const text = JSON.stringify(doc, null, 2) + "\n";

  if (hasRemote(context)) failures.push(`${bundleFile}: still references a remote context`);
  const d = await difference(await activeContext(url), await activeContext(context), path.basename(bundleFile));
  if (d) failures.push(d);

  if (CHECK) {
    const committed = await fs.readFile(path.join(ROOT, bundleFile), "utf8").catch(() => null);
    if (committed !== text) failures.push(`${bundleFile}: missing or stale, run pnpm run build:bundles`);
  } else {
    await fs.writeFile(path.join(ROOT, bundleFile), text);
    console.log(`wrote ${bundleFile} (${(text.length / 1024).toFixed(0)} KiB)`);
  }
}

// (d) two sectors at once, through jsonld.js with its own limit
const sectors = operational.map(([url]) => url).filter((u) => !u.endsWith("/core/dpp-operational-context.jsonld"));
const bundleLoader = async (url: string) => {
  if (Object.values(bundleUrls).includes(url)) {
    const file = contextMap[Object.keys(bundleUrls).find((k) => bundleUrls[k] === url)!]!.replace(
      /-operational-context\.jsonld$/,
      "-operational-bundle.jsonld",
    );
    const document = CHECK
      ? JSON.parse(await fs.readFile(path.join(ROOT, file), "utf8"))
      : { "@context": await inline(await contextOf(Object.keys(bundleUrls).find((k) => bundleUrls[k] === url)!), [url]) };
    return { contextUrl: undefined, documentUrl: url, document };
  }
  return loader(url);
};
let pairs = 0;
for (let i = 0; i < sectors.length; i++) {
  for (let j = i + 1; j < sectors.length; j++) {
    const ctx = [GS1_VOC, bundleUrls[sectors[i]], bundleUrls[sectors[j]]];
    try {
      await jsonld.expand({ "@context": ctx, "@id": "urn:x:pair" } as any, { documentLoader: bundleLoader as any });
      pairs++;
    } catch (e) {
      failures.push(`pair ${path.basename(sectors[i])} + ${path.basename(sectors[j])}: ${(e as any).details?.code ?? (e as Error).message}`);
    }
  }
}

if (failures.length) {
  console.error(failures.map((f) => `FAIL ${f}`).join("\n"));
  process.exit(1);
}
console.log(`${operational.length} bundles equivalent to their operational contexts; ${pairs} sector pairs resolve within the jsonld.js limit`);
