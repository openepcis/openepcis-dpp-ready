#!/usr/bin/env tsx
/**
 * Every property key of a module JSON Schema names a term that exists.
 *
 * The module schemas under extensions/<region>/<slug>/validation/<slug>-schema.json are written
 * by hand. The dpp-api validates writes with them, the DDM builds its editor forms from them,
 * the resolver checks textile master data and the GITB JSON validator serves them. Nothing
 * compared them with the ontology, so by 0.10.0 they still described the flat textile durability
 * and recyclability values that moved to common/assessment, keys renamed since 0.9.6
 * (lastDataUpdate, cnCode) and keys that were never defined (displaySize, fiberComposition).
 * Because the schemas leave additional properties open, a stale key does not reject anything; it
 * silently stops checking the data it was written for.
 *
 * A key is resolved the way a document using it is: through the module's own standard,
 * shortcut and operational contexts plus the core and assessment ones (bridge, export and
 * BatteryPass-Ready contexts excluded, they serve other vocabularies). The IRI it lands on must be
 * defined by a project or mirrored ontology, or by the GS1 / schema.org snapshot the vocab guard
 * uses. A bare key that no context binds passes when it is a GS1 Web Vocabulary term, which the
 * operational chain makes ambient.
 *
 * The BatteryPass-Ready longlist schema (batterypass-v1.3-schema.json) uses the longlist's own
 * attribute names on purpose and is not checked.
 */
import fs from "node:fs";
import path from "node:path";
import { globSync } from "node:fs";
import { Parser } from "n3";

const ROOT = path.resolve(import.meta.dirname, "..");
process.chdir(ROOT);

const defined = new Set<string>();
for (const f of globSync("extensions/*/*/ontology/*.ttl")) {
  for (const q of new Parser().parse(fs.readFileSync(f, "utf8"))) defined.add(q.subject.value);
}
const snapshot = JSON.parse(fs.readFileSync("scripts/vocab-snapshot.json", "utf8")).vocabs as Record<string, { namespace: string; terms: string[] }>;
for (const v of Object.values(snapshot)) for (const t of v.terms) defined.add(v.namespace + t);
const gs1Bare = new Set(snapshot.gs1.terms);

type Binding = { id?: string };
/** key -> IRI (CURIE or absolute) plus prefix map, collected from the context files, scoped contexts included. */
function collect(files: string[]) {
  const keys = new Map<string, string | undefined>();
  const prefixes = new Map<string, string>();
  const walk = (c: unknown) => {
    if (Array.isArray(c)) return c.forEach(walk);
    if (!c || typeof c !== "object") return;
    for (const [k, v] of Object.entries(c as Record<string, unknown>)) {
      if (k === "@context") { walk(v); continue; }
      if (k.startsWith("@")) continue;
      const id = typeof v === "string" ? v : (v as Binding & Record<string, unknown>)?.["@id"] as string | undefined;
      if (typeof v === "string" && /^https?:\/\/.*[/#]$/.test(v)) prefixes.set(k, v);
      if (!keys.has(k)) keys.set(k, id);
      if (v && typeof v === "object" && "@context" in (v as object)) walk((v as Record<string, unknown>)["@context"]);
    }
  };
  for (const f of files) walk(JSON.parse(fs.readFileSync(f, "utf8"))["@context"]);
  return { keys, prefixes };
}
const contextFiles = (dir: string) =>
  globSync(`${dir}/context/*.jsonld`).filter((f) => !/bridge|-to-|pefcr|batterypass-ready/.test(path.basename(f)));

const expand = (iri: string | undefined, key: string, prefixes: Map<string, string>) => {
  const v = iri ?? key;
  if (/^https?:\/\//.test(v)) return v;
  const m = /^([A-Za-z][\w.-]*):(.+)$/.exec(v);
  if (m && prefixes.has(m[1])) return prefixes.get(m[1]) + m[2];
  return undefined;
};

const problems: string[] = [];
let checked = 0;
for (const schemaPath of globSync("extensions/*/*/validation/*-schema.json").sort()) {
  if (/extension-schema|batterypass-v1\.3/.test(schemaPath)) continue;
  const moduleDir = schemaPath.split("/validation/")[0];
  const { keys, prefixes } = collect([
    ...contextFiles(moduleDir),
    ...contextFiles("extensions/common/core"),
    ...contextFiles("extensions/common/assessment"),
  ]);
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const defs: Record<string, { properties?: Record<string, unknown> }> = schema.$defs ?? schema.definitions ?? {};
  for (const [defName, def] of [...Object.entries(defs), ["(root)", schema] as const]) {
    for (const key of Object.keys(def.properties ?? {})) {
      if (key.startsWith("@") || key === "id" || key === "type") continue;
      checked++;
      if (keys.has(key)) {
        const iri = expand(keys.get(key), key, prefixes);
        if (iri && defined.has(iri)) continue;
        problems.push(`${schemaPath} ${defName}.${key}: bound to ${keys.get(key) ?? "(no @id)"}, which no ontology defines`);
        continue;
      }
      const iri = expand(undefined, key, prefixes);
      if (iri ? defined.has(iri) : gs1Bare.has(key)) continue;
      problems.push(`${schemaPath} ${defName}.${key}: no context binds it and it is not a GS1 term`);
    }
  }
}

if (problems.length) {
  console.error(`✗ check:json-schemas: ${problems.length} schema key(s) name no existing term`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`✓ check:json-schemas: ${checked} property keys in the module schemas all name existing terms`);
