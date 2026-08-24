/**
 * Extension-term guard: every project-owned IRI referenced in the published
 * artifacts must actually be defined in a module ontology.
 *
 * `check-vocab.ts` validates references to vocabularies we do NOT govern (GS1,
 * schema.org) against a snapshot. This guard is its mirror image for the
 * namespaces we DO govern: `oec:`, `eubat:`, `eudr:`, `eutex:`, `euelec:`,
 * `eudet:`, `euppwr:`, `eucpr:`, `eusteel:`, `usfsma:`, plus the mirrored GS1 Rail
 * namespace. Nothing validated those before, so a hand-authored example could
 * reference `euelec:recyclingRate` forever: the CURIE expands to a well-formed,
 * dereferenceable-looking IRI that resolves to no definition at all. A curated
 * bare alias in `.shortcut-overrides.json` can even give such a phantom a clean
 * operational round-trip, which hides it from every other gate.
 *
 * Definitions come from `**\/ontology/*.ttl` and `**\/vocab/*.ttl` (a term is
 * defined if it is the subject of at least one triple). References are collected
 * from the JSON-LD examples, the EPCIS event examples, the generated contexts and
 * their override files, and the SHACL shapes.
 *
 * Deliberate exceptions live in `scripts/extension-terms-allowlist.json`.
 *
 * Usage: tsx scripts/check-extension-terms.ts [--json]
 */

import { Parser, Store } from "n3";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname, extname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const ALLOWLIST_PATH = join(__dirname, "extension-terms-allowlist.json");

/** Namespaces this project governs (or mirrors and ships a TTL for). */
const OWNED_NAMESPACES = [
  "https://ref.openepcis.org/extensions/",
  "https://gs1-epcis-reg.org/rail/voc/data#",
];

const isOwned = (iri: string) => OWNED_NAMESPACES.some((ns) => iri.startsWith(ns));

/**
 * SHACL shape identifiers live under a `/shapes/` path segment inside an owned
 * namespace (dpp-sh:, ppwr-sh:, …). They are not vocabulary terms, so no module
 * ontology defines them and the definition requirement must not apply.
 *
 * This only became visible once shapes started REFERENCING each other: a shape
 * IRI used as a subject in its own file was already excluded, but a reusable
 * shape pulled in from another file via sh:node appears purely as an object.
 */
const isShapeIri = (iri: string) => /\/shapes\/[^/]*$/.test(iri);

/** Directories that never contain authored artifacts. */
const SKIP_DIRS = new Set(["node_modules", ".git", ".cache", "target", "dist", "json"]);

function walk(dir: string, keep: (full: string) => boolean, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, keep, acc);
    else if (keep(full)) acc.push(full);
  }
  return acc;
}

function parseTtl(ttl: string): Promise<Store> {
  return new Promise((resolve, reject) => {
    const store = new Store();
    new Parser().parse(ttl, (err, quad) => {
      if (err) reject(err);
      else if (quad) store.addQuad(quad);
      else resolve(store);
    });
  });
}

/** Every owned IRI that is the subject of at least one triple in an ontology. */
async function definedTerms(): Promise<Set<string>> {
  const defined = new Set<string>();
  const files = walk(join(PROJECT_ROOT, "extensions"), (f) => isOntologySource(f))
    .concat(walk(join(PROJECT_ROOT, "masterdata"), (f) => isOntologySource(f)));
  for (const file of files) {
    const store = await parseTtl(readFileSync(file, "utf-8"));
    for (const quad of store) {
      if (quad.subject.termType === "NamedNode" && isOwned(quad.subject.value)) {
        defined.add(quad.subject.value);
      }
    }
  }
  return defined;
}

const isOntologySource = (f: string) => {
  const rel = relative(PROJECT_ROOT, f).split("/").join("/");
  return extname(f) === ".ttl" && (rel.includes("/ontology/") || rel.includes("/vocab/"));
};

/** prefix -> namespace, read from the module contexts so it stays in sync. */
function prefixMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of walk(join(PROJECT_ROOT, "extensions"), (f) => f.endsWith("-context.jsonld"))) {
    const doc = JSON.parse(readFileSync(file, "utf-8"));
    const entries = Array.isArray(doc["@context"]) ? doc["@context"] : [doc["@context"]];
    for (const e of entries) {
      if (!e || typeof e !== "object") continue;
      for (const [k, v] of Object.entries(e)) {
        if (typeof v === "string" && isOwned(v) && /^[a-z][a-z0-9]*$/.test(k)) map.set(k, v);
      }
    }
  }
  return map;
}

/** Expand a CURIE to an owned IRI, or null if it is not an owned CURIE. */
function expand(curie: string, prefixes: Map<string, string>): string | null {
  const i = curie.indexOf(":");
  if (i <= 0) return null;
  const ns = prefixes.get(curie.slice(0, i));
  if (!ns) return null;
  const local = curie.slice(i + 1);
  return /^[A-Za-z0-9_.-]+$/.test(local) ? ns + local : null;
}

interface Ref { term: string; file: string; where: string }

/** Owned CURIEs / IRIs used as keys, `type`/`id` values, or context targets. */
function refsFromJson(file: string, prefixes: Map<string, string>): Ref[] {
  const rel = relative(PROJECT_ROOT, file);
  const refs: Ref[] = [];
  const add = (raw: string, where: string) => {
    const iri = raw.startsWith("http") ? (isOwned(raw) ? raw : null) : expand(raw, prefixes);
    if (iri) refs.push({ term: iri, file: rel, where });
  };
  const visit = (node: any, path: string) => {
    if (Array.isArray(node)) { node.forEach((v) => visit(v, path)); return; }
    if (!node || typeof node !== "object") return;
    for (const [k, v] of Object.entries(node)) {
      if (!k.startsWith("@") && !k.startsWith("_")) add(k, `${path}/${k}`);
      // a term definition's @id, and class/enum values in type/id positions
      if (k === "@id" || k === "type" || k === "@type" || k === "id") {
        for (const t of Array.isArray(v) ? v : [v]) if (typeof t === "string") add(t, `${path}/${k}`);
      }
      visit(v, `${path}/${k}`);
    }
  };
  visit(JSON.parse(readFileSync(file, "utf-8")), "");
  return refs;
}

/** Owned IRIs referenced (not defined) by a SHACL shapes file. */
async function refsFromShapes(file: string): Promise<Ref[]> {
  const store = await parseTtl(readFileSync(file, "utf-8"));
  const rel = relative(PROJECT_ROOT, file);
  const refs: Ref[] = [];
  const subjects = new Set<string>();
  for (const q of store) if (q.subject.termType === "NamedNode") subjects.add(q.subject.value);
  for (const q of store) {
    for (const node of [q.predicate, q.object]) {
      if (
        node.termType === "NamedNode" &&
        isOwned(node.value) &&
        !isShapeIri(node.value) &&
        !subjects.has(node.value)
      ) {
        refs.push({ term: node.value, file: rel, where: q.predicate.value });
      }
    }
  }
  return refs;
}

function category(rel: string): string {
  if (/\/epcis\//.test(rel)) return "EPCIS event examples";
  if (/\/examples\//.test(rel)) return "JSON-LD examples";
  if (/\/context\/\./.test(rel)) return "context override files";
  if (/\/context\//.test(rel)) return "generated contexts";
  if (/\/validation\//.test(rel)) return "SHACL shapes";
  return "other";
}

async function main(): Promise<number> {
  const defined = await definedTerms();
  const prefixes = prefixMap();
  const allow: Set<string> = new Set(
    existsSync(ALLOWLIST_PATH)
      ? (JSON.parse(readFileSync(ALLOWLIST_PATH, "utf-8")).allow ?? []).map((e: any) => e.term)
      : [],
  );

  const refs: Ref[] = [];
  const jsonFiles = walk(join(PROJECT_ROOT, "extensions"), (f) => {
    const rel = relative(PROJECT_ROOT, f);
    return (extname(f) === ".jsonld" || (extname(f) === ".json" && /\/context\//.test(rel)))
      && /\/(examples|epcis|context)\//.test(rel);
  });
  for (const f of jsonFiles) refs.push(...refsFromJson(f, prefixes));
  for (const f of walk(join(PROJECT_ROOT, "extensions"), (f) => /\/validation\/.*\.ttl$/.test(relative(PROJECT_ROOT, f)))) {
    refs.push(...(await refsFromShapes(f)));
  }

  const missing = new Map<string, Ref[]>();
  for (const r of refs) {
    if (defined.has(r.term)) continue;
    const curie = shorten(r.term, prefixes);
    if (allow.has(curie) || allow.has(r.term)) continue;
    if (!missing.has(curie)) missing.set(curie, []);
    missing.get(curie)!.push(r);
  }

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(
      [...missing.entries()].map(([term, rs]) => ({ term, files: [...new Set(rs.map((r) => r.file))] })),
      null, 2));
    return missing.size ? 1 : 0;
  }

  if (missing.size) {
    console.error(`✗ extension-term guard: ${missing.size} project-owned term(s) referenced but not defined in any ontology`);
    const byCat = new Map<string, string[]>();
    for (const [term, rs] of [...missing.entries()].sort()) {
      for (const cat of new Set(rs.map((r) => category(r.file)))) {
        const files = [...new Set(rs.filter((r) => category(r.file) === cat).map((r) => r.file))];
        if (!byCat.has(cat)) byCat.set(cat, []);
        byCat.get(cat)!.push(`${term}  (${files.length} file(s): ${files[0]}${files.length > 1 ? ` +${files.length - 1}` : ""})`);
      }
    }
    for (const [cat, lines] of byCat) {
      console.error(`\n  ${cat}:`);
      lines.forEach((l) => console.error(`    - ${l}`));
    }
    console.error(`\n  Fix by defining the term in the module TTL (with dcterms:source / skos:note / rdfs:seeAlso and a`);
    console.error(`  graded SKOS mapping, per the layering rule) or by pointing the reference at the vocabulary term that`);
    console.error(`  already covers the concept. Deliberate exceptions go in scripts/extension-terms-allowlist.json.`);
    return 1;
  }
  console.log(`✓ extension-term guard: all ${refs.length} project-owned references resolve to a defined term (${defined.size} defined, ${allow.size} allowlisted).`);
  return 0;
}

function shorten(iri: string, prefixes: Map<string, string>): string {
  let best: string | null = null;
  for (const [p, ns] of prefixes) {
    if (iri.startsWith(ns) && (best === null || ns.length > prefixes.get(best.split(":")[0])!.length)) {
      best = `${p}:${iri.slice(ns.length)}`;
    }
  }
  return best ?? iri;
}

process.exit(await main());
