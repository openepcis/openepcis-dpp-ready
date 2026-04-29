/**
 * Build JSON-LD @context files from TTL ontology source files.
 *
 * Output is written to {module}/context/{name}-context.generated.jsonld
 * alongside the existing hand-maintained file. Review the diff and promote
 * the generated file once it looks correct.
 *
 * Non-derivable hints (@container, @vocab subcontexts, term aliases) live in
 * {module}/context/.context-overrides.json. On first run, if the overrides
 * file does not exist and a hand-maintained context does, the script
 * auto-extracts the differences into the overrides file so existing
 * semantics are preserved. From then on, edit the overrides file directly.
 *
 * Usage: npx tsx scripts/build-context.ts
 */

import { Parser, Store, DataFactory, Quad } from "n3";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, "..");

const { namedNode } = DataFactory;

const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const OWL = "http://www.w3.org/2002/07/owl#";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const DCTERMS = "http://purl.org/dc/terms/";
const SKOS = "http://www.w3.org/2004/02/skos/core#";
const GS1 = "https://ref.gs1.org/voc/";
const SCHEMA = "https://schema.org/";

interface OntologyModule {
  name: string;
  dir: string;
  ttlFile: string;
  namespace: string;
  prefix: string;
}

const ONTOLOGY_MODULES: OntologyModule[] = [
  {
    name: "dpp-core",
    dir: "extensions/common/core",
    ttlFile: "dpp-core.ttl",
    namespace: "https://ref.openepcis.io/extensions/common/core/",
    prefix: "dpp",
  },
  {
    name: "battery",
    dir: "extensions/eu/battery",
    ttlFile: "battery.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/battery/",
    prefix: "battery",
  },
  {
    name: "eudr",
    dir: "extensions/eu/eudr",
    ttlFile: "eudr.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/eudr/",
    prefix: "eudr",
  },
  {
    name: "textile",
    dir: "extensions/eu/textile",
    ttlFile: "textile.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/textile/",
    prefix: "textile",
  },
  {
    name: "electronics",
    dir: "extensions/eu/electronics",
    ttlFile: "electronics.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/electronics/",
    prefix: "electronics",
  },
  {
    name: "detergent",
    dir: "extensions/eu/detergent",
    ttlFile: "detergent.ttl",
    namespace: "https://ref.openepcis.io/extensions/eu/detergent/",
    prefix: "detergent",
  },
  {
    name: "fsma204",
    dir: "extensions/us/fsma204",
    ttlFile: "fsma204.ttl",
    namespace: "https://ref.openepcis.io/extensions/us/fsma204/",
    prefix: "fsma",
  },
];

const NAMESPACE_TO_PREFIX: Record<string, string> = {
  [XSD]: "xsd",
  [RDFS]: "rdfs",
  [GS1]: "gs1",
  [SCHEMA]: "schema",
  "https://ref.openepcis.io/extensions/common/core/": "dpp",
  "https://ref.openepcis.io/extensions/common/interop/": "interop",
  "https://ref.openepcis.io/extensions/eu/battery/": "battery",
  "https://ref.openepcis.io/extensions/eu/eudr/": "eudr",
  "https://ref.openepcis.io/extensions/eu/textile/": "textile",
  "https://ref.openepcis.io/extensions/eu/electronics/": "electronics",
  "https://ref.openepcis.io/extensions/eu/detergent/": "detergent",
  "https://ref.openepcis.io/extensions/us/fsma204/": "fsma",
};

const PREFIX_TO_NAMESPACE: Record<string, string> = Object.fromEntries(
  Object.entries(NAMESPACE_TO_PREFIX).map(([ns, p]) => [p, ns])
);

function compactIri(uri: string): string {
  for (const [ns, prefix] of Object.entries(NAMESPACE_TO_PREFIX)) {
    if (uri.startsWith(ns) && uri.length > ns.length) {
      return `${prefix}:${uri.substring(ns.length)}`;
    }
  }
  return uri;
}

function getLocalName(uri: string, namespace: string): string {
  if (uri.startsWith(namespace)) return uri.substring(namespace.length);
  const hashIndex = uri.lastIndexOf("#");
  if (hashIndex !== -1) return uri.substring(hashIndex + 1);
  const slashIndex = uri.lastIndexOf("/");
  if (slashIndex !== -1) return uri.substring(slashIndex + 1);
  return uri;
}

function getObjectValue(store: Store, subject: string, predicate: string): string | undefined {
  const quads = store.getQuads(namedNode(subject), namedNode(predicate), null, null);
  return quads[0]?.object.value;
}

function getObjectValues(store: Store, subject: string, predicate: string): string[] {
  return store
    .getQuads(namedNode(subject), namedNode(predicate), null, null)
    .map((q) => q.object.value);
}

function isClass(store: Store, subject: string): boolean {
  const types = getObjectValues(store, subject, `${RDF}type`);
  return types.includes(`${RDFS}Class`) || types.includes(`${OWL}Class`);
}

function isObjectProperty(store: Store, subject: string): boolean {
  return getObjectValues(store, subject, `${RDF}type`).includes(`${OWL}ObjectProperty`);
}

function isDatatypeProperty(store: Store, subject: string): boolean {
  return getObjectValues(store, subject, `${RDF}type`).includes(`${OWL}DatatypeProperty`);
}

function isPlainProperty(store: Store, subject: string): boolean {
  return getObjectValues(store, subject, `${RDF}type`).includes(`${RDF}Property`);
}

function isProperty(store: Store, subject: string): boolean {
  return isObjectProperty(store, subject) || isDatatypeProperty(store, subject) || isPlainProperty(store, subject);
}

async function parseAsync(parser: Parser, ttl: string): Promise<Quad[]> {
  return new Promise((resolve, reject) => {
    const quads: Quad[] = [];
    parser.parse(ttl, (error, quad) => {
      if (error) reject(error);
      else if (quad) quads.push(quad);
      else resolve(quads);
    });
  });
}

type ContextValue = string | { [k: string]: string | number | object };
type ContextMap = Record<string, ContextValue>;

function decideTypeCoercion(
  store: Store,
  subject: string,
  module: OntologyModule
): string | undefined {
  if (isDatatypeProperty(store, subject)) {
    const range = getObjectValue(store, subject, `${RDFS}range`);
    if (range && range.startsWith(XSD)) return `xsd:${range.substring(XSD.length)}`;
    return undefined;
  }
  if (isObjectProperty(store, subject)) return "@id";
  if (isPlainProperty(store, subject)) {
    const range = getObjectValue(store, subject, `${RDFS}range`);
    if (range && range.startsWith(XSD)) return `xsd:${range.substring(XSD.length)}`;
    if (range) return "@id";
    return undefined;
  }
  return undefined;
}

interface DerivedContext {
  context: ContextMap;
  classes: { localName: string; iri: string }[];
  properties: { localName: string; iri: string; coercion?: string }[];
  enumerations: { property: string; values: { localName: string; iri: string }[] }[];
}

function buildDerivedContext(store: Store, module: OntologyModule): DerivedContext {
  const namespace = module.namespace;

  const allSubjects = new Set<string>();
  store.getQuads(null, null, null, null).forEach((q) => {
    if (q.subject.value.startsWith(namespace)) allSubjects.add(q.subject.value);
  });

  const classes: { localName: string; iri: string }[] = [];
  const properties: { localName: string; iri: string; coercion?: string }[] = [];

  for (const subject of allSubjects) {
    const localName = getLocalName(subject, namespace);
    const iri = `${module.prefix}:${localName}`;
    if (isClass(store, subject)) {
      classes.push({ localName, iri });
    } else if (isProperty(store, subject)) {
      const coercion = decideTypeCoercion(store, subject, module);
      properties.push({ localName, iri, coercion });
    }
  }

  classes.sort((a, b) => a.localName.localeCompare(b.localName));
  properties.sort((a, b) => a.localName.localeCompare(b.localName));

  // Enumerations: classes that have instances in this namespace whose @vocab
  // mapping should be exposed. Find properties whose range is one of these classes.
  const classIds = new Set(classes.map((c) => `${namespace}${c.localName}`));
  const enumerations: { property: string; values: { localName: string; iri: string }[] }[] = [];

  for (const cls of classes) {
    const classIri = `${namespace}${cls.localName}`;
    const instanceQuads = store.getQuads(null, namedNode(`${RDF}type`), namedNode(classIri), null);
    const values = instanceQuads
      .map((q) => q.subject.value)
      .filter((iri) => iri.startsWith(namespace))
      .map((iri) => ({ localName: getLocalName(iri, namespace), iri: `${module.prefix}:${getLocalName(iri, namespace)}` }))
      .sort((a, b) => a.localName.localeCompare(b.localName));
    if (values.length === 0) continue;

    // Find any property that ranges over this class — those properties get @vocab coercion.
    for (const prop of properties) {
      const propIri = `${namespace}${prop.localName}`;
      const range = getObjectValue(store, propIri, `${RDFS}range`);
      if (range === classIri) {
        enumerations.push({ property: prop.localName, values });
      }
    }
  }

  // Build context map.
  const context: ContextMap = {
    "@version": 1.1,
    id: "@id",
    type: "@type",
  };

  // Determine which prefixes are referenced.
  const usedPrefixes = new Set<string>([module.prefix, "xsd"]);
  for (const p of properties) {
    if (p.coercion?.startsWith("xsd:")) usedPrefixes.add("xsd");
  }
  // Always include any cross-namespace IRIs found in domain/range.
  for (const subject of allSubjects) {
    for (const pred of [`${RDFS}domain`, `${RDFS}range`, `${RDFS}subClassOf`]) {
      for (const v of getObjectValues(store, subject, pred)) {
        for (const [ns, pref] of Object.entries(NAMESPACE_TO_PREFIX)) {
          if (v.startsWith(ns)) usedPrefixes.add(pref);
        }
      }
    }
  }

  // Emit prefixes alphabetically.
  for (const prefix of [...usedPrefixes].sort()) {
    const ns = PREFIX_TO_NAMESPACE[prefix];
    if (ns) context[prefix] = ns;
  }

  // Emit class terms (PascalCase IRI alias).
  for (const c of classes) {
    context[c.localName] = c.iri;
  }

  // Build a map of properties that have enum coercion.
  const enumByProp = new Map(enumerations.map((e) => [e.property, e.values]));

  // Emit property terms.
  for (const p of properties) {
    if (enumByProp.has(p.localName)) {
      const values = enumByProp.get(p.localName)!;
      const subContext: Record<string, string> = {};
      for (const v of values) subContext[v.localName] = v.iri;
      context[p.localName] = {
        "@id": p.iri,
        "@type": "@vocab",
        "@context": subContext,
      };
    } else if (p.coercion) {
      context[p.localName] = { "@id": p.iri, "@type": p.coercion };
    } else {
      context[p.localName] = p.iri;
    }
  }

  return { context, classes, properties, enumerations };
}

function readExistingContext(path: string): ContextMap | undefined {
  if (!existsSync(path)) return undefined;
  try {
    const json = JSON.parse(readFileSync(path, "utf-8"));
    if (json && typeof json["@context"] === "object" && !Array.isArray(json["@context"])) {
      return json["@context"] as ContextMap;
    }
  } catch (e) {
    console.warn(`  Could not parse existing context at ${path}: ${(e as Error).message}`);
  }
  return undefined;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

const KEYWORD_KEYS = new Set(["@version", "@vocab", "@base", "@language", "@protected", "id", "type"]);

function isPrefixDeclaration(key: string, value: unknown): boolean {
  return typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://")) && !key.includes(":");
}

/**
 * Capture only information in `existing` that is NOT derivable from TTL:
 *   - Keys not present in derived at all (hand-only aliases / cross-vocab terms).
 *   - For object-valued entries that exist in both, fields that exist in
 *     `existing` but not in `derived` (e.g. @container, @vocab subcontexts).
 *
 * Differences where derived has more / different info are intentionally
 * dropped — TTL is authoritative for @id and @type coercion.
 */
function migrateOverrides(existing: ContextMap, derived: ContextMap): ContextMap {
  const overrides: ContextMap = {};
  for (const [key, existingVal] of Object.entries(existing)) {
    if (KEYWORD_KEYS.has(key)) continue;
    if (isPrefixDeclaration(key, existingVal)) continue;
    const derivedVal = derived[key];

    if (derivedVal === undefined) {
      overrides[key] = existingVal;
      continue;
    }

    if (typeof existingVal !== "object" || existingVal === null || Array.isArray(existingVal)) {
      // Existing is a plain string alias. If it references the same IRI as
      // derived, drop it; derived wins. If it points elsewhere, the user has
      // intentionally overridden the IRI — keep it.
      const derivedIri =
        typeof derivedVal === "string"
          ? derivedVal
          : (derivedVal as Record<string, unknown>)["@id"];
      if (derivedIri !== existingVal) overrides[key] = existingVal;
      continue;
    }

    // Existing is an object. Capture fields that derived doesn't provide.
    const derivedObj =
      typeof derivedVal === "object" && derivedVal !== null && !Array.isArray(derivedVal)
        ? (derivedVal as Record<string, unknown>)
        : { "@id": derivedVal as unknown };
    const extras: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(existingVal as Record<string, unknown>)) {
      if (!(k in derivedObj)) extras[k] = v;
    }
    if (Object.keys(extras).length > 0) overrides[key] = extras as ContextValue;
  }
  return overrides;
}

function mergeOverrides(derived: ContextMap, overrides: ContextMap): ContextMap {
  const out: ContextMap = { ...derived };
  for (const [key, val] of Object.entries(overrides)) {
    const base = out[key];
    if (
      base &&
      typeof base === "object" &&
      !Array.isArray(base) &&
      val &&
      typeof val === "object" &&
      !Array.isArray(val)
    ) {
      out[key] = { ...(base as object), ...(val as object) } as ContextValue;
    } else {
      out[key] = val;
    }
  }
  return out;
}

function buildTopComment(store: Store, module: OntologyModule): string {
  const namespace = module.namespace;
  const ontologyUri = namespace.endsWith("/") ? namespace.slice(0, -1) : namespace;
  const title =
    getObjectValue(store, namespace, `${DCTERMS}title`) ||
    getObjectValue(store, ontologyUri, `${DCTERMS}title`) ||
    `${module.name} Vocabulary`;
  const version =
    getObjectValue(store, namespace, `${OWL}versionInfo`) ||
    getObjectValue(store, ontologyUri, `${OWL}versionInfo`) ||
    "0.0.0";
  return `${title} v${version} — generated from ${module.dir}/ontology/${module.ttlFile}. Do not edit by hand; re-run \`pnpm run build:context\` and edit ${module.dir}/context/.context-overrides.json for non-derivable hints.`;
}

async function buildContext(): Promise<void> {
  console.log("Building JSON-LD @context files from TTL...\n");

  for (const module of ONTOLOGY_MODULES) {
    const ttlPath = join(PROJECT_ROOT, module.dir, "ontology", module.ttlFile);
    const contextDir = join(PROJECT_ROOT, module.dir, "context");
    const overridesPath = join(contextDir, ".context-overrides.json");
    const existingPath = join(contextDir, `${module.name}-context.jsonld`);
    const generatedPath = join(contextDir, `${module.name}-context.generated.jsonld`);

    if (!existsSync(ttlPath)) {
      console.warn(`Warning: TTL file not found: ${ttlPath}`);
      continue;
    }

    console.log(`Processing ${module.name}...`);
    console.log(`  Source: ${ttlPath}`);

    try {
      const ttl = readFileSync(ttlPath, "utf-8");
      const store = new Store();
      const parser = new Parser();
      const quads = await parseAsync(parser, ttl);
      store.addQuads(quads);

      const derived = buildDerivedContext(store, module);
      console.log(`  Parsed ${quads.length} triples`);
      console.log(`  Classes: ${derived.classes.length}, properties: ${derived.properties.length}, enumerations: ${derived.enumerations.length}`);

      mkdirSync(contextDir, { recursive: true });

      let overrides: ContextMap = {};
      if (existsSync(overridesPath)) {
        overrides = JSON.parse(readFileSync(overridesPath, "utf-8")) as ContextMap;
        console.log(`  Loaded ${Object.keys(overrides).length} override entries`);
      } else {
        const existing = readExistingContext(existingPath);
        if (existing) {
          overrides = migrateOverrides(existing, derived.context);
          writeFileSync(overridesPath, JSON.stringify(overrides, null, 2) + "\n");
          console.log(`  First run: migrated ${Object.keys(overrides).length} non-derivable entries → ${overridesPath}`);
        } else {
          writeFileSync(overridesPath, "{}\n");
          console.log(`  No existing context; wrote empty overrides → ${overridesPath}`);
        }
      }

      const merged = mergeOverrides(derived.context, overrides);

      const output = {
        _comment: buildTopComment(store, module),
        "@context": merged,
      };

      writeFileSync(generatedPath, JSON.stringify(output, null, 2) + "\n");
      console.log(`  Output: ${generatedPath}\n`);
    } catch (error) {
      console.error(`  Error processing ${module.name}:`, error);
    }
  }

  console.log("Done!");
}

buildContext().catch(console.error);
