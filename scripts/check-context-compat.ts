/**
 * PUBLISHED CONTEXT COMPATIBILITY GATE: a published term never changes meaning.
 *
 * Every file under extensions/**\/context/ is served from ref.openepcis.org, and
 * stored passports and EPCIS documents name those URLs in their @context. The
 * URL is fetched again every time such a document is read, so whatever the file
 * says TODAY decides what a document written a year ago means. A term whose @id,
 * @type or @container changes turns the same stored JSON into different triples,
 * and that shows up nowhere except in the data of whoever relied on it.
 *
 * Removing a term is allowed: when CIRPASS-2 or an EU act defines a concept
 * better, the new definition replaces the old one and nothing is deprecated.
 * Removals are listed so the PR shows what stored documents will lose, but they
 * do not fail the gate.
 *
 * The proof, per context file present at the base ref:
 *   (1) the file still exists (the URL keeps answering);
 *   (2) both versions are processed by jsonld.js, each with its imports resolved
 *       from its OWN revision, and every term the base defined (imported ones
 *       included) that still exists is defined identically now: @id, reverse, @type, @container,
 *       @language, @direction, @index, @nest, prefix use, and scoped contexts
 *       compared the same way;
 *   (3) @base, @language and @direction of the context are unchanged, and an
 *       existing @vocab is unchanged (adding one where none was is growth).
 * New terms, new files and removed terms pass. An intended redefinition goes
 * into scripts/context-compat-allowlist.json with a reason, or under a NEW URL.
 *
 * Usage: pnpm run check:context-compat [-- --base <git ref>]
 *        base defaults to $CONTEXT_COMPAT_BASE, then origin/main
 */
import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jsonld from "jsonld";
import { buildContextMap, makeDocumentLoader, type JsonLdDocumentLoader } from "./lib/jsonld-loader.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWLIST = "scripts/context-compat-allowlist.json";
const CONTEXT_FILE = /^extensions\/(.+)\/context\/([^/]+\.jsonld)$/;
const DEFINITION_KEYS = ["@id", "reverse", "@type", "@container", "@language", "@direction", "@index", "@nest", "_prefix"];
const CONTEXT_KEYS = ["@base", "@language", "@direction"];

interface AllowEntry {
  file: string;
  term: string;
  reason: string;
}

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

function baseRef(): string {
  const i = process.argv.indexOf("--base");
  return (i > 0 && process.argv[i + 1]) || process.env.CONTEXT_COMPAT_BASE || "origin/main";
}

/** Loader that serves every ref.openepcis.org context and vendored snapshot from the base revision. */
function baseLoader(ref: string, files: string[], fallback: JsonLdDocumentLoader): JsonLdDocumentLoader {
  const map: Record<string, string> = {
    "https://gs1-epcis-reg.org/rail/rail-context.jsonld": "extensions/upstream/gs1-rail/context/rail-context.jsonld",
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld": "vendor/gs1/epcis-context.jsonld",
    "https://ref.gs1.org/voc/": "vendor/gs1/gs1Voc.jsonld",
  };
  for (const f of files) {
    const m = f.match(CONTEXT_FILE)!;
    map[`https://ref.openepcis.org/extensions/${m[1]}/${m[2]}`] = f;
  }
  return async (url: string) => {
    const file = map[url];
    if (!file) return fallback(url);
    return { contextUrl: undefined, documentUrl: url, document: JSON.parse(git("show", `${ref}:${file}`)) };
  };
}

/** The parts of a term definition that decide what a stored value expands to. */
function definition(def: any): string {
  const out: Record<string, unknown> = {};
  for (const k of DEFINITION_KEYS) {
    if (def[k] === undefined) continue;
    out[k] = k === "@container" ? [...def[k]].sort() : def[k];
  }
  return JSON.stringify(out);
}

/** A scoped context is applied the way expansion applies it: on top of the scope, protected terms overridable. */
/**
 * What a key with no term definition expands to: a compact IRI through its prefix,
 * anything else through @vocab, otherwise nothing (the processor drops it).
 */
function undefinedTermIri(ctx: any, term: string): string | undefined {
  const colon = term.indexOf(":");
  if (colon > 0) {
    const prefix = ctx.mappings.get(term.slice(0, colon));
    if (prefix?._prefix) return prefix["@id"] + term.slice(colon + 1);
    return term;
  }
  return ctx["@vocab"] !== undefined ? ctx["@vocab"] + term : undefined;
}

async function activeContext(ctx: unknown, loader: JsonLdDocumentLoader, scope?: any): Promise<any> {
  const api = jsonld as any;
  const start = scope ?? (await api.processContext(null, null, {}));
  return api.processContext(start, ctx, { documentLoader: loader, overrideProtected: scope !== undefined });
}

/**
 * Every way the active context `after` reads a document differently from `before`.
 * Scoped contexts are compared by applying them to their own side, so a term that
 * keeps its @id but changes the meaning of what nests under it is still caught.
 */
async function differences(
  before: any,
  after: any,
  oldLoader: JsonLdDocumentLoader,
  newLoader: JsonLdDocumentLoader,
  where: string,
  depth = 0,
  seen = new Set<string>(),
): Promise<{ term: string; problem: string; removed?: boolean }[]> {
  const found: { term: string; problem: string; removed?: boolean }[] = [];
  for (const k of CONTEXT_KEYS) {
    if (before[k] !== after[k]) found.push({ term: k, problem: `${where}${k} ${JSON.stringify(before[k])} -> ${JSON.stringify(after[k])}` });
  }
  if (before["@vocab"] !== undefined && before["@vocab"] !== after["@vocab"]) {
    found.push({ term: "@vocab", problem: `${where}@vocab ${before["@vocab"]} -> ${after["@vocab"] ?? "removed"}` });
  }
  for (const [term, old] of before.mappings as Map<string, any>) {
    const now = after.mappings.get(term);
    const label = `${where}${term}`;
    if (!now) {
      // a plain IRI mapping that the prefix or @vocab still produces is not lost
      if (definition(old) === definition({ "@id": old["@id"], reverse: false, _prefix: false })
        && undefinedTermIri(after, term) === old["@id"]) continue;
      found.push({ term, problem: `${label} (was ${old["@id"]})`, removed: true });
      continue;
    }
    if (definition(old) !== definition(now)) {
      found.push({ term, problem: `${label} changed ${definition(old)} -> ${definition(now)}` });
      continue;
    }
    if (old["@context"] === undefined) continue;
    if (now["@context"] === undefined) {
      found.push({ term, problem: `${label} lost its scoped @context` });
      continue;
    }
    const key = JSON.stringify([old["@context"], now["@context"]]);
    if (depth >= 2 || seen.has(key)) continue;
    seen.add(key);
    let scopedBefore: any;
    try {
      scopedBefore = await activeContext(old["@context"], oldLoader, before);
    } catch {
      continue; // the published scope never processed this way either
    }
    try {
      const scopedAfter = await activeContext(now["@context"], newLoader, after);
      const inner = await differences(scopedBefore, scopedAfter, oldLoader, newLoader, `${label} > `, depth + 1, seen);
      found.push(...inner.map((d) => ({ term, problem: d.problem, removed: d.removed })));
    } catch (e: any) {
      found.push({ term, problem: `${label} scoped @context no longer processes: ${e.message}` });
    }
  }
  return found;
}

async function main(): Promise<number> {
  const ref = baseRef();
  try {
    git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
  } catch {
    console.error(`✗ context compat: base ref ${ref} not found (fetch it, or pass --base)`);
    return 2;
  }
  const allow: AllowEntry[] = JSON.parse(await fs.readFile(path.join(ROOT, ALLOWLIST), "utf8"));
  const used = new Set<AllowEntry>();
  const allowed = (file: string, term: string) => {
    const hit = allow.find((a) => a.file === file && (a.term === term || a.term === "*"));
    if (hit) used.add(hit);
    return hit !== undefined;
  };

  const baseFiles = git("ls-tree", "-r", "--name-only", ref, "extensions/")
    .split("\n")
    .filter((f) => CONTEXT_FILE.test(f));
  const newLoader = makeDocumentLoader(await buildContextMap());
  const oldLoader = baseLoader(ref, baseFiles, newLoader);

  const problems: string[] = [];
  const removals: string[] = [];
  let terms = 0;
  for (const file of baseFiles) {
    const current = await fs.readFile(path.join(ROOT, file), "utf8").catch(() => undefined);
    if (current === undefined) {
      if (!allowed(file, "*")) problems.push(`${file}: removed, its published URL would stop answering`);
      continue;
    }
    const oldDoc = JSON.parse(git("show", `${ref}:${file}`));
    if (oldDoc["@context"] === undefined) continue;
    let before: any;
    try {
      before = await activeContext(oldDoc["@context"], oldLoader);
    } catch {
      continue; // already unusable when published; check:contexts owns that
    }
    let after: any;
    try {
      after = await activeContext(JSON.parse(current)["@context"], newLoader);
    } catch (e: any) {
      problems.push(`${file}: no longer processes as an @context: ${e.message}`);
      continue;
    }
    terms += before.mappings.size;
    // a term broken at the top level also shows up under every scope that inherits
    // it; report each break once, at the shallowest place it occurs
    const shallowest = new Map<string, { problem: string; removed?: boolean }>();
    for (const d of await differences(before, after, oldLoader, newLoader, "")) {
      if (!d.removed && allowed(file, d.term)) continue;
      const essence = d.problem.split(" > ").pop()!;
      const known = shallowest.get(essence);
      if (!known || known.problem.split(" > ").length > d.problem.split(" > ").length) shallowest.set(essence, d);
    }
    for (const d of shallowest.values()) {
      if (d.removed) removals.push(d.problem.split(" > ").pop()!);
      else problems.push(`${file}: ${d.problem}`);
    }
  }

  for (const a of allow) {
    if (!used.has(a)) console.warn(`  note: allowlist entry ${a.file} ${a.term} matched nothing, remove it`);
  }
  if (removals.length) {
    const distinct = [...new Set(removals)].sort();
    console.log(`  ${distinct.length} term(s) removed against ${ref}; stored documents using them lose these fields:`);
    distinct.forEach((r) => console.log(`    ${r}`));
  }
  if (problems.length) {
    console.error(`✗ context compat: ${problems.length} change(s) against ${ref} give a published term a different meaning\n`);
    problems.forEach((p) => console.error(`  - ${p}`));
    console.error(
      `\nA published term keeps its meaning. Give the new meaning a new term or a new context URL, ` +
        `or, if the redefinition is intended, add {file, term, reason} to ${ALLOWLIST}.`,
    );
    return 1;
  }
  console.log(`✓ context compat: ${baseFiles.length} published context(s), ${terms} term(s) checked, none redefined against ${ref}`);
  return 0;
}

process.exit(await main());
