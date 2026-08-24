/**
 * Build a permissive per-namespace JSON Schema for every ref.openepcis.org EPCIS
 * extension, so the OpenEPCIS repository can register them (POST
 * /userExtension/jsonSchema) and capture events that declare the namespace via
 * the GS1-Extensions header instead of failing closed.
 *
 * Permissive means: each namespace's known terms are declared as OPTIONAL
 * properties (both the short alias and the prefixed `prefix:term` form) with
 * `additionalProperties: true`, so legitimate events are never rejected while
 * the vocabulary is documented. Field-level validation (required / types /
 * code-lists) can tighten later per ontology.
 *
 * Terms are the module ontology's properties (from the generated
 * `json/<module>.json`) plus the aliases in its shipped JSON-LD @context, which
 * contribute the cross-vocabulary terms (`gs1:`/`schema:`) the module reuses but
 * does not define. Both are build outputs, so the schemas track the ontology
 * automatically: re-run after `build:context`/`build:json`.
 *
 * Output:
 *   extensions/**\/validation/<slug>.extension-schema.json   (source of truth)
 *   scripts/out/extension-schemas.manifest.json              (registrar input:
 *     {namespace, defaultPrefix, jsonldContextUrl, schemaFile, terms})
 *
 * Usage: npx tsx scripts/build-extension-schemas.ts
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, "..");
const BASE_URL = "https://ref.openepcis.org/extensions";

interface ExtensionModule {
  /** module directory relative to the repo root */
  dir: string;
  /** default prefix for the namespace */
  prefix: string;
  /** namespace suffix appended to BASE_URL (with trailing slash) */
  nsSuffix: string;
  /** canonical JSON-LD context file under {dir}/context/ */
  ctxFile: string;
  /** generated ontology JSON under {dir}/json/ (build-json.ts output) */
  jsonFile?: string;
}

// Keep this list in step with the module table in CLAUDE.md / architecture.md.
const MODULES: ExtensionModule[] = [
  { dir: "extensions/common/core", prefix: "oec", nsSuffix: "common/core/", ctxFile: "dpp-core-context.jsonld", jsonFile: "dpp-core.json" },
  { dir: "extensions/common/interop", prefix: "oei", nsSuffix: "common/interop/", ctxFile: "semic-core-bridge-context.jsonld" },
  { dir: "extensions/eu/battery", prefix: "eubat", nsSuffix: "eu/battery/", ctxFile: "battery-context.jsonld", jsonFile: "battery.json" },
  { dir: "extensions/eu/eudr", prefix: "eudr", nsSuffix: "eu/eudr/", ctxFile: "eudr-context.jsonld", jsonFile: "eudr.json" },
  { dir: "extensions/eu/textile", prefix: "eutex", nsSuffix: "eu/textile/", ctxFile: "textile-context.jsonld", jsonFile: "textile.json" },
  { dir: "extensions/eu/electronics", prefix: "euelec", nsSuffix: "eu/electronics/", ctxFile: "electronics-context.jsonld", jsonFile: "electronics.json" },
  { dir: "extensions/eu/detergent", prefix: "eudet", nsSuffix: "eu/detergent/", ctxFile: "detergent-context.jsonld", jsonFile: "detergent.json" },
  { dir: "extensions/eu/ppwr", prefix: "euppwr", nsSuffix: "eu/ppwr/", ctxFile: "ppwr-context.jsonld", jsonFile: "ppwr.json" },
  { dir: "extensions/eu/cpr", prefix: "eucpr", nsSuffix: "eu/cpr/", ctxFile: "cpr-context.jsonld", jsonFile: "cpr.json" },
  { dir: "extensions/eu/iron-steel", prefix: "eusteel", nsSuffix: "eu/iron-steel/", ctxFile: "iron-steel-context.jsonld", jsonFile: "iron-steel.json" },
  { dir: "extensions/us/fsma204", prefix: "usfsma", nsSuffix: "us/fsma204/", ctxFile: "fsma204-context.jsonld", jsonFile: "fsma204.json" },
];

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

/**
 * Return sorted term aliases defined in a JSON-LD @context (object or list
 * forms). Skips @-keywords, the bare `id`/`type` aliases, and pure prefix
 * declarations (value is a namespace root ending in `/` or `#`).
 */
function contextTerms(ctxPath: string): string[] {
  let doc: Record<string, JsonValue>;
  try {
    doc = JSON.parse(readFileSync(ctxPath, "utf8"));
  } catch (e) {
    console.error(`  ! cannot parse ${ctxPath}: ${(e as Error).message}`);
    return [];
  }
  const ctx = (doc["@context"] ?? doc) as JsonValue;
  const entries = Array.isArray(ctx) ? ctx : [ctx];
  const terms = new Set<string>();
  for (const entry of entries) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    for (const [k, v] of Object.entries(entry)) {
      if (k.startsWith("@") || k === "id" || k === "type") continue;
      // skip pure prefix declarations (value is a namespace root)
      if (typeof v === "string" && (v.endsWith("/") || v.endsWith("#"))) continue;
      terms.add(k);
    }
  }
  return [...terms].sort();
}

/**
 * Every property local name the module's ontology defines, from the generated
 * `json/<module>.json` (build-json.ts output).
 *
 * The context alone is not enough: since the standard contexts became prefix-only
 * they carry ONLY the terms that needed a non-derivable coercion hint, so reading
 * terms from there under-covers the vocabulary: iron-steel produced an empty
 * schema and fsma204 a three-term one. Classes stay out: this lists property
 * names, and a class name appears in a `type` value, not as a key.
 */
function ontologyProperties(jsonPath: string): string[] {
  if (!existsSync(jsonPath)) return [];
  try {
    const doc = JSON.parse(readFileSync(jsonPath, "utf8"));
    const out = new Set<string>();
    for (const t of doc.properties ?? []) if (t.localName) out.add(t.localName as string);
    return [...out].sort();
  } catch (e) {
    console.error(`  ! cannot parse ${jsonPath}: ${(e as Error).message}`);
    return [];
  }
}

interface AccessInfo {
  accessLevel: string;
  accessLevelMandatedBy?: string;
  accessLevelRationale?: string;
  accessLevelSource?: string;
}

/**
 * Read the module's generated ontology JSON (build-json.ts output) and return
 * localName -> ESPR access tier for every property carrying oec:defaultAccessLevel.
 */
function accessLevels(jsonPath: string): Record<string, AccessInfo> {
  const map: Record<string, AccessInfo> = {};
  if (!existsSync(jsonPath)) return map;
  try {
    const doc = JSON.parse(readFileSync(jsonPath, "utf8"));
    for (const term of [...(doc.properties ?? []), ...(doc.classes ?? [])]) {
      if (term.localName && term.accessLevel) {
        map[term.localName] = {
          accessLevel: term.accessLevel,
          ...(term.accessLevelMandatedBy && { accessLevelMandatedBy: term.accessLevelMandatedBy }),
          ...(term.accessLevelRationale && { accessLevelRationale: term.accessLevelRationale }),
          ...(term.accessLevelSource && { accessLevelSource: term.accessLevelSource }),
        };
      }
    }
  } catch (e) {
    console.error(`  ! cannot parse ${jsonPath}: ${(e as Error).message}`);
  }
  return map;
}

function buildSchema(
  namespace: string,
  prefix: string,
  terms: string[],
  access: Record<string, AccessInfo> = {}
): Record<string, JsonValue> {
  const props: Record<string, JsonValue> = {};
  for (const t of terms) {
    // Accept both the short alias and the explicitly-prefixed form; carry the
    // ESPR tier as x-access-level (batterypass-v1.3-schema.json precedent).
    // Since the standard contexts became prefix-only, every alias arrives as a
    // CURIE (eubat:hasRatedCapacity, and cross-vocabulary ones like gs1:address).
    // Split it: the bare local name is the short alias, and the CURIE is kept as
    // authored; re-prefixing it would emit `eubat:eubat:x` / `oec:gs1:address`
    // and leave the bare form, which this schema exists to accept, missing.
    const colon = t.indexOf(":");
    const local = colon >= 0 ? t.slice(colon + 1) : t;
    const curie = colon >= 0 ? t : `${prefix}:${t}`;
    const a = access[local];
    const annotation: Record<string, JsonValue> = a
      ? {
          "x-access-level": a.accessLevel,
          ...(a.accessLevelMandatedBy && { "x-access-level-mandated-by": a.accessLevelMandatedBy }),
          ...(a.accessLevelRationale && { "x-access-level-rationale": a.accessLevelRationale }),
          ...(a.accessLevelSource && { "x-access-level-source": a.accessLevelSource }),
        }
      : {};
    props[local] = { ...annotation };
    props[curie] = { ...annotation };
  }
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: namespace,
    title: `OpenEPCIS extension (permissive): ${prefix}`,
    description:
      `Permissive capture schema for the ${namespace} extension. Declares known terms ` +
      `as optional and allows additional properties, so events that declare ` +
      `GS1-Extensions ${prefix}=${namespace} validate and capture. Generated from the ` +
      `module ontology plus its JSON-LD context; tighten per ontology for field-level ` +
      `validation.`,
    type: "object",
    properties: props,
    patternProperties: { [`^${prefix}:`]: {} },
    additionalProperties: true,
  };
}

interface ManifestEntry {
  namespace: string;
  defaultPrefix: string;
  jsonldContextUrl: string;
  schemaFile: string;
  terms: number;
}

function main(): void {
  const outDir = join(PROJECT_ROOT, "scripts", "out");
  mkdirSync(outDir, { recursive: true });
  const manifest: ManifestEntry[] = [];

  for (const m of MODULES) {
    const d = join(PROJECT_ROOT, m.dir);
    const namespace = `${BASE_URL}/${m.nsSuffix}`;
    const ctxPath = join(d, "context", m.ctxFile);
    const ctxUrl = `${BASE_URL}/${m.nsSuffix}${m.ctxFile}`;
    // The ontology is the term inventory; the context adds the cross-vocabulary
    // terms the module reuses (gs1:/schema:) that its own TTL does not define.
    const jsonPath = m.jsonFile ? join(d, "json", m.jsonFile) : undefined;
    const terms = [
      ...new Set([
        ...(jsonPath ? ontologyProperties(jsonPath) : []),
        ...(existsSync(ctxPath) ? contextTerms(ctxPath) : []),
      ]),
    ].sort();
    const access = jsonPath ? accessLevels(jsonPath) : {};
    const schema = buildSchema(namespace, m.prefix, terms, access);

    const valDir = join(d, "validation");
    mkdirSync(valDir, { recursive: true });
    const slug = m.dir.split("/").pop()!;
    const schemaFile = join(valDir, `${slug}.extension-schema.json`);
    writeFileSync(schemaFile, JSON.stringify(schema, null, 2) + "\n");

    const rel = relative(PROJECT_ROOT, schemaFile);
    manifest.push({
      namespace,
      defaultPrefix: m.prefix,
      jsonldContextUrl: ctxUrl,
      schemaFile: rel,
      terms: terms.length,
    });
    console.log(`  ${m.prefix.padEnd(8)} terms=${String(terms.length).padStart(3)}  -> ${rel}`);
  }

  const manifestPath = join(outDir, "extension-schemas.manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nmanifest: scripts/out/extension-schemas.manifest.json (${manifest.length} namespaces)`);
}

main();
