#!/usr/bin/env tsx
/**
 * Generate the GITB validator-resources bundle: the configuration and artifacts
 * that turn the European Commission's off-the-shelf validators into an OpenEPCIS
 * DPP conformance service.
 *
 * Output (all generated — do not hand-edit):
 *   gitb/validator-resources/shacl/dpp/config.properties
 *   gitb/validator-resources/shacl/dpp/shapes/<type>/*.ttl
 *   gitb/validator-resources/json/dpp/config.properties
 *   gitb/validator-resources/json/dpp/schemas/<type>/*.json
 *
 * Run it with `--write`; without the flag it only reports what would change, so
 * `pnpm run check:gitb` can fail the build when the committed bundle has drifted
 * from the ontologies — the same contract scripts/sync-dpp-api-openapi.ts uses.
 *
 * Three things make a bundle different from just copying the shapes:
 *
 * 1. THE CORE TRAVELS WITH EVERY TYPE. oec: is cross-cutting, so a battery
 *    passport must satisfy dpp-core-shapes.ttl too, and the module shapes
 *    reference dpp-sh:TranslatableText from it.
 *
 * 2. ONTOLOGIES ARE BACKGROUND KNOWLEDGE, not decoration. sh:class and the
 *    subclass resolution behind sh:targetClass are evaluated over the data
 *    graph, and the class hierarchy plus the code-list individuals live in the
 *    ontology. The validator merges the shape graph into the input graph before
 *    validating (DomainConfig.defaultMergeModelsType), which is what carries
 *    them across.
 *
 * 3. NO REASONER IS ASSUMED. Obligations stated on a superproperty are rewritten
 *    to plain SHACL Core alternation, and per-level/per-category shapes are
 *    shipped pre-activated, because a hosted validator cannot flip
 *    sh:deactivated or run inference at request time. See
 *    scripts/lib/subproperty-expansion.ts for the measurement behind that.
 *
 * Usage:
 *   tsx scripts/build-gitb-resources.ts [--write]
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { Writer } from "n3";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {
  discoverModules,
  coreOf,
  ROOT,
  type ModuleCategory,
  type ValidatableModule,
} from "./lib/modules.ts";
import { activateBySuffix, parseTurtle, stripOwlImports } from "./lib/shacl-run.ts";
import { expandSubProperties } from "./lib/subproperty-expansion.ts";

const WRITE = process.argv.includes("--write");

const SHACL_DOMAIN = path.join(ROOT, "gitb/validator-resources/shacl/dpp");
const JSON_DOMAIN = path.join(ROOT, "gitb/validator-resources/json/dpp");

/** Version stamped into the generated headers, read from the module VERSIONs. */
async function projectVersion(): Promise<string> {
  const pkg = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
  return pkg.version as string;
}

interface ValidationType {
  id: string;
  label: string;
  /** Shapes files to bundle, in load order. */
  shapeFiles: string[];
  /** Ontologies to bundle as background knowledge. */
  ontologyFiles: string[];
  /** Suffix of the per-level/per-category shapes to pre-activate, if any. */
  activate?: string;
  /** Document JSON Schema for the JSON validator domain, if the module ships one. */
  schema?: string;
}

function typesOf(modules: ValidatableModule[], core: ValidatableModule): ValidationType[] {
  const types: ValidationType[] = [];

  const shapesFor = (m: ValidatableModule) =>
    m.dir === core.dir ? [m.shapes] : [core.shapes, m.shapes];
  const ontologiesFor = (m: ValidatableModule) => {
    const files = m.dir === core.dir ? [m.ontology] : [core.ontology, m.ontology];
    // The access-level sidecars carry the ESPR Art. 9 tiers. They are not needed
    // to validate structure and would only bulk up every bundle, so they stay out.
    return files;
  };

  for (const m of modules) {
    types.push({
      id: m.type,
      label: `${m.label} ${"—"} ${m.regulation}`,
      shapeFiles: shapesFor(m),
      ontologyFiles: ontologiesFor(m),
      ...(m.schema ? { schema: m.schema } : {}),
    });

    const variants: ModuleCategory[] = [...m.granularities, ...m.categories];
    for (const v of variants) {
      types.push({
        id: v.type,
        label: v.label,
        // A granularity variant's source (battery-shapes.ttl) is already m.shapes,
        // but a category variant's source (ec-readiness-shapes.ttl) is a separate
        // file that is NOT among the module shapes — it must be added, or the
        // pre-activated bundle would carry no category shapes and enforce nothing
        // beyond the base module. Dedupe so granularities stay unchanged.
        shapeFiles: [...new Set([...shapesFor(m), v.sourceShapes])],
        ontologyFiles: ontologiesFor(m),
        activate: v.suffix,
        ...(m.schema ? { schema: m.schema } : {}),
      });
    }
  }
  return types;
}

/** Serialize a store to Turtle with stable prefixes so output is byte-comparable. */
function toTurtle(store: ReturnType<typeof parseTurtle>): Promise<string> {
  const writer = new Writer({
    prefixes: {
      sh: "http://www.w3.org/ns/shacl#",
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      owl: "http://www.w3.org/2002/07/owl#",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      skos: "http://www.w3.org/2004/02/skos/core#",
      dcterms: "http://purl.org/dc/terms/",
      gs1: "https://ref.gs1.org/voc/",
      schema: "https://schema.org/",
      oec: "https://ref.openepcis.org/extensions/common/core/",
      "dpp-sh": "https://ref.openepcis.org/extensions/common/core/shapes/",
    },
  });
  return new Promise((resolve, reject) => {
    writer.addQuads([...store]);
    writer.end((err, result: string) =>
      err ? reject(err) : resolve(stabilizeBlankNodes(result)),
    );
  });
}

/**
 * N3's writer labels referenced blank nodes with a process-GLOBAL counter
 * (_:n3-<n>), so parsing more triples for one type shifts every later type's
 * labels — a one-line shape change would then reflow every unrelated bundle.
 * Renumber each file's blank nodes to a per-file sequence in first-appearance
 * order, making every bundle's serialization independent of what was parsed
 * before it. Purely cosmetic (blank-node labels are file-local scope).
 */
function stabilizeBlankNodes(ttl: string): string {
  const map = new Map<string, string>();
  return ttl.replace(/_:n3-\d+/g, (label) => {
    if (!map.has(label)) map.set(label, `_:b${map.size}`);
    return map.get(label)!;
  });
}

async function buildShaclBundle(types: ValidationType[], version: string) {
  const files = new Map<string, string>();

  for (const t of types) {
    const shapeTtls = await Promise.all(
      t.shapeFiles.map((f) => fs.readFile(path.join(ROOT, f), "utf8")),
    );
    const ontologyTtls = await Promise.all(
      t.ontologyFiles.map((f) => fs.readFile(path.join(ROOT, f), "utf8")),
    );

    const shapes = parseTurtle(...shapeTtls);
    stripOwlImports(shapes);
    if (t.activate) activateBySuffix(shapes, t.activate);

    const ontology = parseTurtle(...ontologyTtls);
    stripOwlImports(ontology);

    const stats = expandSubProperties(shapes, ontology);

    const header =
      `# GENERATED by scripts/build-gitb-resources.ts (pnpm run build:gitb) — do not edit.\n` +
      `# OpenEPCIS DPP-Ready ${version}, validation type "${t.id}".\n` +
      `# Sources: ${t.shapeFiles.join(", ")}\n` +
      (t.activate ? `# Pre-activated variant: shapes whose IRI ends in "${t.activate}".\n` : "") +
      `# Superproperty obligations rewritten to sh:alternativePath ` +
      `(${stats.pathsRewritten} path(s), ${stats.targetsAdded} target(s)) so no reasoner is required.\n`;

    files.set(`shapes/${t.id}/shapes.ttl`, header + (await toTurtle(shapes)));
    files.set(
      `shapes/${t.id}/background.ttl`,
      `# GENERATED — background knowledge for validation type "${t.id}".\n` +
        `# Class hierarchy and code-list individuals: sh:class and the subclass\n` +
        `# resolution behind sh:targetClass are evaluated over the data graph, and\n` +
        `# the validator merges this shape graph into the input before validating.\n` +
        `# Sources: ${t.ontologyFiles.join(", ")}\n` +
        (await toTurtle(ontology)),
    );
  }

  const lines: string[] = [
    `# GENERATED by scripts/build-gitb-resources.ts (pnpm run build:gitb) — do not edit.`,
    `# OpenEPCIS DPP-Ready ${version} — RDF validator domain for the EU Interoperability Test Bed.`,
    `#`,
    `# Deploy with the European Commission's off-the-shelf RDF validator:`,
    `#   podman run -p 8080:8080 -e validator.resourceRoot=/validator/resources/ \\`,
    `#     -v "\$PWD/gitb/validator-resources/shacl:/validator/resources:ro,Z" \\`,
    `#     docker.io/isaitb/shacl-validator:latest`,
    ``,
    `validator.type = ${types.map((t) => t.id).join(", ")}`,
    ``,
  ];
  for (const t of types) lines.push(`validator.typeLabel.${t.id} = ${t.label}`);
  lines.push("");
  for (const t of types) lines.push(`validator.shaclFile.${t.id} = shapes/${t.id}`);
  lines.push(
    ``,
    `# Every artifact is bundled locally, so validation is offline and reproducible;`,
    `# only the input document's own @context is fetched.`,
    `validator.loadImports = false`,
    ``,
    `validator.channels = form, rest_api, soap_api`,
    `validator.defaultReportSyntax = text/turtle`,
    `validator.uploadTitle = OpenEPCIS DPP-Ready validator`,
    ``,
    `# Callers may add their own shapes on top of a type, but never replace it:`,
    `# a conformance statement must always include the shapes we publish.`,
  );
  for (const t of types) lines.push(`validator.externalShapes.${t.id} = optional`);
  lines.push("");

  files.set("config.properties", lines.join("\n"));
  return files;
}

/**
 * Does this JSON Schema actually constrain a DOCUMENT, or is it only a library?
 *
 * The shipped `{slug}-schema.json` files are `$defs`-only: 21-37 named
 * definitions, no top-level `type`, `required`, `properties` or `$ref`. JSON
 * Schema treats a schema with no applicable keywords as satisfied by ANY
 * instance, so a domain built from them validates nothing. Measured against
 * isaitb/json-validator: `{"this":"is not a passport at all"}` came back
 * `<result>SUCCESS</result>` with `nrOfAssertions` 0 for every type.
 *
 * A conformance service that accepts anything is worse than none, so a type is
 * only declared once its schema has a document-level entry point. That entry
 * point cannot be derived here: only eu.battery ($defs.Battery, 9 required
 * fields) and eu.ppwr ($defs.Packaging) have a plausible root; textile and core
 * define sub-objects only, and us.fsma204 ships zero $defs. Giving each module a
 * document schema is work on the JSON Schema layer, not on the bundling, so this
 * check simply lets the domain fill itself in as those schemas gain a root.
 */
function constrainsDocuments(schema: unknown): boolean {
  if (!schema || typeof schema !== "object") return false;
  const s = schema as Record<string, unknown>;
  // `type: "object"` with `properties` but no `required` and no
  // `additionalProperties: false` still accepts every object — dpp.core is
  // exactly that shape, and garbage passed it. Only these keywords can reject.
  return Boolean(
    s["$ref"] ??
      s["required"] ??
      s["allOf"] ??
      s["anyOf"] ??
      s["oneOf"] ??
      (s["additionalProperties"] === false ? true : undefined),
  );
}

/**
 * Does the schema accept the module's own example passports?
 *
 * A validation type that rejects the very documents this project publishes is
 * worse than no type at all: it would tell a third party their correct passport
 * is non-conformant. us.fsma204 is the live case — its `required` still names
 * `foodTraceabilityListCategory`, a key left behind by the has* rename that
 * appears neither in the schema's own `properties` nor in any example.
 *
 * The JSON schemas are written against the BARE-KEYED operational form (the
 * shape an EN 18223 API serves), not the prefixed seed, so the goldens are what
 * gets checked here.
 */
async function acceptsOwnExamples(
  schema: unknown,
  module: ValidatableModule,
): Promise<{ ok: boolean; detail?: string }> {
  if (!module.examplesDir) return { ok: true };
  const dir = path.join(ROOT, module.examplesDir);
  let names: string[];
  try {
    names = (await fs.readdir(dir)).filter((n) => n.endsWith(".operational.jsonld"));
  } catch {
    return { ok: true };
  }
  if (!names.length) return { ok: true };

  const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: false });
  addFormats(ajv);
  let validateFn: ReturnType<typeof ajv.compile>;
  try {
    validateFn = ajv.compile(schema as object);
  } catch (e) {
    return { ok: false, detail: `schema does not compile: ${(e as Error).message}` };
  }
  for (const name of names.sort()) {
    const doc = JSON.parse(await fs.readFile(path.join(dir, name), "utf8"));
    if (validateFn(doc)) continue;
    const first = validateFn.errors?.[0];
    return {
      ok: false,
      detail: `${name}: ${first?.instancePath || "/"} ${first?.message ?? "rejected"}`,
    };
  }
  return { ok: true };
}

async function buildJsonBundle(
  types: ValidationType[],
  version: string,
  moduleByType: Map<string, ValidatableModule>,
) {
  const files = new Map<string, string>();
  const withSchema: ValidationType[] = [];
  const notDeclared: string[] = [];
  for (const t of types.filter((x) => x.schema && !x.activate)) {
    const raw = await fs.readFile(path.join(ROOT, t.schema!), "utf8");
    const schema = JSON.parse(raw);
    if (!constrainsDocuments(schema)) {
      notDeclared.push(`${t.id}: schema constrains no document (definitions library only)`);
      continue;
    }
    const own = await acceptsOwnExamples(schema, moduleByType.get(t.id)!);
    if (!own.ok) {
      notDeclared.push(`${t.id}: rejects this project's own example — ${own.detail}`);
      continue;
    }
    withSchema.push(t);
    files.set(`schemas/${t.id}/schema.json`, raw);
  }

  if (notDeclared.length) {
    console.log(
      `\nJSON domain: ${notDeclared.length} module schema(s) are not fit to be a conformance ` +
        `type yet, so none is declared for them:`,
    );
    for (const n of notDeclared) console.log(`  ${n}`);
    console.log(
      `A JSON type must both reject a wrong document and accept ours; until the schema does\n` +
        `both, publishing it would mislead. Fix the schema and it appears here automatically.`,
    );
  }
  if (!withSchema.length) {
    // An empty domain would still start a validator that answers SUCCESS to
    // everything on its default type. Emit nothing at all instead.
    return files;
  }

  const lines: string[] = [
    `# GENERATED by scripts/build-gitb-resources.ts (pnpm run build:gitb) — do not edit.`,
    `# OpenEPCIS DPP-Ready ${version} — JSON validator domain (isaitb/json-validator).`,
    `#`,
    `# Document-level JSON Schema, the companion to the SHACL domain: the schema`,
    `# checks the JSON shape a passport must have, the shapes check what the RDF`,
    `# means. Granularity and category variants are absent here — they differ only`,
    `# in RDF obligations, not in JSON structure.`,
    ``,
    `validator.type = ${withSchema.map((t) => t.id).join(", ")}`,
    ``,
  ];
  for (const t of withSchema) lines.push(`validator.typeLabel.${t.id} = ${t.label}`);
  lines.push("");
  for (const t of withSchema) lines.push(`validator.schemaFile.${t.id} = schemas/${t.id}`);
  lines.push(
    ``,
    `validator.channels = form, rest_api, soap_api`,
    `validator.uploadTitle = OpenEPCIS DPP-Ready JSON validator`,
    ``,
  );
  files.set("config.properties", lines.join("\n"));
  return files;
}

/** Write or diff a generated file set rooted at `dir`. Returns changed paths. */
async function reconcile(dir: string, files: Map<string, string>): Promise<string[]> {
  const changed: string[] = [];
  for (const [rel, content] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
    const abs = path.join(dir, rel);
    let existing: string | undefined;
    try {
      existing = await fs.readFile(abs, "utf8");
    } catch {
      /* new file */
    }
    if (existing === content) continue;
    changed.push(path.relative(ROOT, abs));
    if (WRITE) {
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, content);
    }
  }
  // Stale files from a removed validation type would silently keep being served.
  const expected = new Set([...files.keys()].map((r) => path.join(dir, r)));
  const walk = async (d: string): Promise<string[]> => {
    let entries: string[] = [];
    try {
      entries = await fs.readdir(d);
    } catch {
      return [];
    }
    const out: string[] = [];
    for (const name of entries) {
      const full = path.join(d, name);
      const st = await fs.stat(full);
      out.push(...(st.isDirectory() ? await walk(full) : [full]));
    }
    return out;
  };
  for (const abs of await walk(dir)) {
    if (expected.has(abs)) continue;
    changed.push(`${path.relative(ROOT, abs)} (stale)`);
    if (WRITE) await fs.rm(abs);
  }
  return changed;
}

async function main() {
  const version = await projectVersion();
  const modules = await discoverModules();
  const core = coreOf(modules);
  const types = typesOf(modules, core);

  const moduleByType = new Map(modules.map((m) => [m.type, m]));
  const shacl = await buildShaclBundle(types, version);
  const json = await buildJsonBundle(types, version, moduleByType);

  const changed = [
    ...(await reconcile(SHACL_DOMAIN, shacl)),
    ...(await reconcile(JSON_DOMAIN, json)),
  ];

  console.log(
    `GITB validator resources: ${types.length} validation type(s) ` +
      `(${modules.length} module(s) + ${types.length - modules.length} variant(s))`,
  );
  for (const t of types) console.log(`  ${t.id.padEnd(26)} ${t.label}`);

  if (!changed.length) {
    console.log(`\n✓ committed bundle is in step with the ontologies and shapes.`);
    return;
  }
  if (WRITE) {
    console.log(`\n✓ wrote ${changed.length} file(s).`);
    return;
  }
  console.log(`\n✗ the committed GITB bundle has drifted from the source artifacts:`);
  for (const c of changed) console.log(`    ${c}`);
  console.log(`\nRegenerate with: pnpm run build:gitb`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
