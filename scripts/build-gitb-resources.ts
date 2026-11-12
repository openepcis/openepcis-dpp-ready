#!/usr/bin/env tsx
/**
 * Generate the GITB validator-resources bundle: the configuration and artifacts
 * that turn the European Commission's off-the-shelf validators into an OpenEPCIS
 * DPP conformance service.
 *
 * Output (all generated — do not hand-edit):
 *   gitb/validator-resources/shacl/openepcis/config.properties
 *   gitb/validator-resources/shacl/openepcis/shapes/<type>/*.ttl
 *   gitb/validator-resources/json/openepcis/config.properties
 *   gitb/validator-resources/json/openepcis/schemas/<type>/*.json
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
 *    to plain SHACL Core alternation, and per-level shapes are
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
  coreOntologyFiles,
  coreShapeFiles,
  discoverModules,
  coreOf,
  ROOT,
  type ModuleCategory,
  type ValidatableModule,
} from "./lib/modules.ts";
import { activateBySuffix, parseTurtle, stripOwlImports } from "./lib/shacl-run.ts";
import { expandSubProperties } from "./lib/subproperty-expansion.ts";
import { VALIDATOR_DOMAIN, SHACL_RESOURCE_ROOT, JSON_RESOURCE_ROOT } from "./lib/gitb.ts";
import {
  GARBAGE,
  fixturesOf,
  jsonldFileToNTriples,
  loadTargets,
  presenceShape,
  provenance,
  readDocument,
  readText,
  referencedSchemaFiles,
  rootType,
  verdict,
  verifyArtifacts,
  type Target,
} from "./lib/targets.ts";

const WRITE = process.argv.includes("--write");

const SHACL_DOMAIN = path.join(ROOT, SHACL_RESOURCE_ROOT, VALIDATOR_DOMAIN);
const JSON_DOMAIN = path.join(ROOT, JSON_RESOURCE_ROOT, VALIDATOR_DOMAIN);

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
  /** Suffix of the per-level shapes to pre-activate, if any. */
  activate?: string;
  /** Document JSON Schema for the JSON validator domain, if the module ships one. */
  schema?: string;
  /** External target type: bundle-relative artifact paths, used verbatim instead of shapes/<id>/. */
  shaclPaths?: string[];
  schemaPaths?: string[];
  /** External target type: the release it checks against (report profileId / customisationId). */
  profileId?: string;
  customisationId?: string;
}

function typesOf(modules: ValidatableModule[], core: ValidatableModule): ValidationType[] {
  const types: ValidationType[] = [];

  const shapesFor = (m: ValidatableModule) =>
    m.dir === core.dir ? coreShapeFiles(core) : [...coreShapeFiles(core), m.shapes];
  const ontologiesFor = (m: ValidatableModule) => {
    const files = m.dir === core.dir ? coreOntologyFiles(core) : [...coreOntologyFiles(core), m.ontology];
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

    const variants: ModuleCategory[] = m.granularities;
    for (const v of variants) {
      types.push({
        id: v.type,
        label: v.label,
        // A granularity variant's source (battery-shapes.ttl) is already among
        // the module shapes; the set keeps it from being bundled twice.
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

/**
 * Banner shown above the validator's web form.
 *
 * One line, no quotes around attributes and no backslashes: the value goes into
 * a .properties file, where a trailing backslash continues the line and a quote
 * survives only by accident. `validatorReload` is the class the accompanying
 * javascriptExtension binds, so clicking the title returns to the form — the
 * convention the Test Bed's own sample validators follow.
 */
function banner(): string {
  const p = [
    `Checks a Digital Product Passport against the SHACL shapes published by <a href=https://ref.openepcis.org target=_blank>OpenEPCIS DPP-Ready</a>,`,
    `an open-source vocabulary for passports under the ESPR (2024/1781) and the sectoral EU regulations, built on GS1 and the SEMIC core vocabularies.`,
    `Pick the validation type matching your passport's regulation and granularity, then submit it as JSON-LD, Turtle, RDF/XML or N-Triples.`,
    `The shapes, the reference passports and the issue tracker are at <a href=https://github.com/openepcis/openepcis-dpp-ready target=_blank>github.com/openepcis/openepcis-dpp-ready</a>;`,
    `the configuration behind this service is at <a href=https://github.com/openepcis/validator-resources-${VALIDATOR_DOMAIN} target=_blank>validator-resources-${VALIDATOR_DOMAIN}</a>.`,
    `REST and SOAP APIs are available for integrations.`,
  ].join(" ");
  return (
    `<div> <div style=display:table> <div style=display:table-row>` +
    ` <div style=display:table-cell;cursor:pointer class=validatorReload>` +
    ` <h1>OpenEPCIS DPP-Ready validator</h1> </div> </div>` +
    ` <div style=display:table-row> <div style=display:table-cell;padding-top:20px>` +
    ` <p> ${p} </p> </div> </div> </div> <hr> </div>`
  );
}

async function buildShaclBundle(types: ValidationType[], version: string) {
  const files = new Map<string, string>();

  for (const t of types) {
    if (t.shaclPaths) continue;
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
    `# Hosted by the European Commission on the shared Interoperability Test Bed as`,
    `# the "${VALIDATOR_DOMAIN}" domain, from the public mirror of this directory:`,
    `#   https://github.com/openepcis/validator-resources-${VALIDATOR_DOMAIN}`,
    `#   https://www.itb.ec.europa.eu/shacl/${VALIDATOR_DOMAIN}/upload`,
    `# Mirror it with: pnpm run publish:validator-resources`,
    `#`,
    `# The same directory drives the local stack, with the same domain name, so a`,
    `# test suite moves between the two by address alone:`,
    `#   podman run -p 8080:8080 -e validator.resourceRoot=/validator/resources/ \\`,
    `#     -v "\$PWD/gitb/validator-resources/shacl:/validator/resources:ro,Z" \\`,
    `#     docker.io/isaitb/shacl-validator:latest`,
    ``,
    `validator.type = ${types.map((t) => t.id).join(", ")}`,
    ``,
  ];
  for (const t of types) lines.push(`validator.typeLabel.${t.id} = ${t.label}`);
  lines.push("");
  for (const t of types) lines.push(`validator.shaclFile.${t.id} = ${t.shaclPaths ? t.shaclPaths.join(", ") : `shapes/${t.id}`}`);
  lines.push(...reportLines(types, version));
  lines.push(
    ``,
    `# Every artifact is bundled locally, so validation is offline and reproducible;`,
    `# only the input document's own @context is fetched.`,
    `validator.loadImports = false`,
    ``,
    `validator.channels = form, rest_api, soap_api`,
    `validator.defaultReportSyntax = text/turtle`,
    `validator.uploadTitle = OpenEPCIS DPP-Ready validator`,
    `validator.supportMinimalUserInterface = true`,
    ``,
    `# The hosted UI is European Commission themed and carries no project context of`,
    `# its own, so the banner says what the service validates and where the shapes`,
    `# come from. Single line, unquoted attributes: this is a .properties value.`,
    `validator.bannerHtml = ${banner()}`,
    `validator.javascriptExtension = $(document).ready(function() { $(".validatorReload").off().on("click", function() { window.location.href="upload"; });});`,
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
  targetJson: TargetBundle,
) {
  const files = new Map<string, string>(targetJson.files);
  const withSchema: ValidationType[] = [];
  const referenced = targetJson.referenced;
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
  withSchema.push(...targetJson.types);
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
    `# means. Granularity variants are absent here — they differ only`,
    `# in RDF obligations, not in JSON structure.`,
    ``,
    `validator.type = ${withSchema.map((t) => t.id).join(", ")}`,
    ``,
  ];
  for (const t of withSchema) lines.push(`validator.typeLabel.${t.id} = ${t.label}`);
  lines.push("");
  for (const t of withSchema) lines.push(`validator.schemaFile.${t.id} = ${t.schemaPaths ? t.schemaPaths.join(", ") : `schemas/${t.id}`}`);
  if (referenced.length) {
    lines.push(
      ``,
      `# Schemas a $ref names by its $id (the publisher's host does not resolve; registered here instead).`,
      `validator.referencedSchemas = ${referenced.join(", ")}`,
    );
  }
  lines.push(...reportLines(withSchema, version));
  lines.push(
    ``,
    `validator.channels = form, rest_api, soap_api`,
    `validator.uploadTitle = OpenEPCIS DPP-Ready JSON validator`,
    ``,
  );
  files.set("config.properties", lines.join("\n"));
  return files;
}

/**
 * Report metadata, so every validation report names what it was checked against: our release as
 * the service version and, for an external type, the target release and its pin.
 */
function reportLines(types: ValidationType[], version: string): string[] {
  const ext = types.filter((t) => t.profileId);
  if (!ext.length) return [];
  const lines = [``, `validator.report.validationServiceName = OpenEPCIS DPP-Ready validator`, `validator.report.validationServiceVersion = ${version}`];
  for (const t of ext) lines.push(`validator.report.profileId.${t.id} = ${t.profileId}`);
  for (const t of ext) if (t.customisationId) lines.push(`validator.report.customisationId.${t.id} = ${t.customisationId}`);
  return lines;
}

interface TargetBundle {
  types: ValidationType[];
  files: Map<string, string>;
  referenced: string[];
  /** owl:imports the publisher's shape files declare, bundled locally instead (SHACL domain). */
  skipImports: Set<string>;
}

/**
 * The external targets (scripts/lib/targets.ts) as validation types of both domains.
 *
 * The publisher's artifacts are bundled byte for byte under artifacts/<target>-<version>/, in the
 * vendor layout, after their SHA-256 has been checked against the vendor manifest. A type is only
 * declared when it rejects a document that is not one and accepts every one of the publisher's own
 * examples that belongs to it; otherwise it would tell a third party their correct document is
 * wrong, or that anything goes.
 */
async function buildTargetBundles(): Promise<{ shacl: TargetBundle; json: TargetBundle; problems: string[] }> {
  const shacl: TargetBundle = { types: [], files: new Map(), referenced: [], skipImports: new Set() };
  const json: TargetBundle = { types: [], files: new Map(), referenced: [], skipImports: new Set() };
  const problems: string[] = [];
  for (const target of loadTargets()) {
    const bad = verifyArtifacts(target);
    if (bad.length) {
      problems.push(...bad.map((b) => `${target.id} ${target.version}: ${b}`));
      continue;
    }
    const base = `artifacts/${target.id}-${target.version}`;
    const vendorDir = target.manifest.replace(/\/MANIFEST\.json$/, "");
    const bundled = (f: string) => (f.startsWith(vendorDir) ? `${base}${f.slice(vendorDir.length)}` : `${base}/background/${path.basename(f)}`);
    // Byte for byte, except that a UTF-16 file (SAMM tooling writes some) is bundled as UTF-8:
    // the validators read UTF-8; the characters are the same.
    const copy = async (into: Map<string, string>, f: string) => {
      if (!into.has(bundled(f))) into.set(bundled(f), readText(f));
      return bundled(f);
    };
    const fixtures = fixturesOf(target).filter((f) => f.role === "publisher");
    const pin = target.manifestData.commit ?? target.manifestData.archiveSha256 ?? "";
    for (const type of target.types) {
      const label = `${type.label} (${target.publisher}; hosted by OpenEPCIS, not endorsed by the publisher)`;
      const reasons: string[] = [];
      // A non-document must be rejected: by the JSON Schema, or by the presence shape of the root
      // class. A model whose shapes name no root (a test corpus of fragments) proves instead that
      // its shapes discriminate with the publisher's own failing cases.
      if (type.schemas.length || rootType(target)) {
        if ((await verdict(target, type, GARBAGE)).valid) reasons.push("accepts a document that is not one");
      } else if (!fixtures.some((f) => f.expect === "invalid" && f.types.includes(type.id))) {
        reasons.push("names no root class and has no failing publisher case to prove it discriminates");
      }
      for (const f of fixtures.filter((x) => x.types.includes(type.id))) {
        const v = await verdict(target, type, readDocument(f.file), { noShacl: !!f.noShacl });
        if (f.expect === "valid" && !v.valid) reasons.push(`rejects the publisher's own example ${f.file}: ${[...v.missing, ...v.form][0]}`);
        if (f.expect === "invalid" && v.valid) reasons.push(`accepts ${f.file}, which the publisher's test corpus expects to fail`);
      }
      if (reasons.length) {
        problems.push(`${type.id}: not declared, ${reasons.join("; ")}`);
        continue;
      }
      const common = { id: type.id, label, shapeFiles: [], ontologyFiles: [], profileId: `${target.id} ${target.version}`, customisationId: pin };
      if (type.shapes.length) {
        const paths = [];
        for (const f of [...type.shapes, ...(target.shacl?.background ?? [])]) {
          const p = await copy(shacl.files, f);
          if (!f.endsWith(".jsonld")) {
            for (const m of shacl.files.get(p)!.matchAll(/owl:imports\s+<([^>]+)>/g)) shacl.skipImports.add(m[1]);
            paths.push(p);
            continue;
          }
          // The validator reads a shapes file into one graph and drops a JSON-LD @graph that
          // carries an @id (a named graph): measured, the shapes were then silently inactive.
          // The same triples go beside the original as Turtle (N-Triples), and that is loaded.
          const ttl = p.replace(/\.jsonld$/, ".ttl");
          if (!shacl.files.has(ttl)) {
            shacl.files.set(
              ttl,
              `# GENERATED by scripts/build-gitb-resources.ts from ${path.basename(p)} beside it (SHA-256 in ${target.manifest}):\n` +
                `# the same triples, every named graph merged into the default graph, so the validator loads them.\n` +
                (await jsonldFileToNTriples(target, f)),
            );
          }
          paths.push(ttl);
        }
        const presence = presenceShape(target);
        if (presence) {
          shacl.files.set(`${base}/presence.ttl`, presence);
          paths.push(`${base}/presence.ttl`);
        }
        shacl.types.push({ ...common, shaclPaths: paths });
      }
      if (type.schemas.length) {
        const paths = [];
        for (const f of type.schemas) paths.push(await copy(json.files, f));
        json.types.push({ ...common, schemaPaths: paths });
      }
    }
    const refs = referencedSchemaFiles(target);
    for (const f of refs) await copy(json.files, f);
    if (refs.length) json.referenced.push(base);
    console.log(`target ${provenance(target)}: ${target.types.length} type(s)`);
  }
  return { shacl, json, problems };
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
  const targets = await buildTargetBundles();
  const shacl = await buildShaclBundle([...types, ...targets.shacl.types], version);
  for (const [k, v] of targets.shacl.files) shacl.set(k, v);
  if (targets.shacl.skipImports.size) {
    // The validator follows owl:imports of a shapes file over the network; every import a
    // publisher's shapes declare is a file the type already bundles.
    shacl.set(
      "config.properties",
      shacl.get("config.properties")! +
        `# owl:imports of the external models' shape files, bundled with their types instead.\n` +
        `validator.owlImportSkippedUris = ${[...targets.shacl.skipImports].sort().join(", ")}\n`,
    );
  }
  const json = await buildJsonBundle(types, version, moduleByType, targets.json);

  const changed = [
    ...(await reconcile(SHACL_DOMAIN, shacl)),
    ...(await reconcile(JSON_DOMAIN, json)),
  ];

  console.log(
    `GITB validator resources: ${types.length} validation type(s) ` +
      `(${modules.length} module(s) + ${types.length - modules.length} variant(s))`,
  );
  for (const t of types) console.log(`  ${t.id.padEnd(26)} ${t.label}`);
  const ext = [...new Set([...targets.shacl.types, ...targets.json.types].map((t) => t.id))].sort();
  console.log(`External targets: ${ext.length} validation type(s)`);
  for (const id of ext) {
    const kinds = [targets.shacl.types.some((t) => t.id === id) && "SHACL", targets.json.types.some((t) => t.id === id) && "JSON"].filter(Boolean);
    console.log(`  ${id.padEnd(46)} ${kinds.join(" + ")}`);
  }
  if (targets.problems.length) {
    console.log(`\n✗ external targets:`);
    for (const p of targets.problems) console.log(`    ${p}`);
    process.exit(1);
  }

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
