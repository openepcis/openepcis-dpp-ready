/**
 * Validation targets: external DPP models at a pinned version, hosted as GITB validation types
 * next to the OpenEPCIS module types.
 *
 * A target is extensions/common/interop/targets/<target>/<version>/target.json. It names the
 * vendored artifacts (vendor/<…>/<version>/, with a MANIFEST.json of SHA-256 sums written by the
 * target's sync script), the crosswalk profile that knows how a document of that model is read
 * (contexts, schemas and shapes per content specification), the fixtures (the publisher's own
 * examples and what our crosswalk lifts) and the deviations a defect of the release makes
 * unavoidable, each with its reason.
 *
 * Type ids carry the target version, `x.<target>-<version>.<scope>[.<view>]`, so a conformance
 * statement always names the release it was made against; the artifacts are bundled verbatim and
 * never patched. Our own judgement (the accepted deviations) lives only in the report
 * (scripts/report-interop-conformance.ts), never in what the validator enforces.
 */
import { createHash } from "node:crypto";
import { existsSync, globSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { Quad } from "n3";
import * as ox from "oxigraph";
import { ROOT, loadProfile, type Profile } from "./crosswalk.ts";
import jsonld from "jsonld";
import { DataFactory, Parser, Writer } from "n3";
import { registerShapeText, shaclFindings, specsOf, theirJsonToQuads, type TargetFindings } from "./crosswalk-target.ts";
import { offlineDocumentLoader } from "./jsonld-loader.ts";

export const TARGETS_DIR = "extensions/common/interop/targets";

interface Chain {
  label: string;
  specs: string[];
  views?: string[];
}

export interface TargetSpec {
  id: string;
  version: string;
  title: string;
  publisher: string;
  manifest: string;
  profile: string;
  shacl?: { background?: string[] };
  json?: { referencedSchemas?: string };
  chains?: Record<string, Chain>;
  /** Types stated outright: scope, label, shapes and schemas (repo-relative), all applying. */
  types?: { scope: string; label: string; shapes?: string[]; schemas?: string[] }[];
  /** JSON-LD documents of the model: context URL prefixes served from vendored directories. */
  jsonld?: { contexts: Record<string, string> };
  /** The class every document is an instance of, when the crosswalk profile does not say. */
  rootType?: string;
  /** Publisher examples that are not documents of any type here (another model's form), with why. */
  exclude?: { file: string; reason: string; only?: "shacl" }[];
  /** File names that apply to the public view only (the passport header). */
  publicOnly?: { files: string[] };
  categories?: Record<string, string>;
  fixtures: { role: "publisher" | "openepcis"; glob: string }[];
  accepted: { match: string; reason: string }[];
}

export interface Manifest {
  version: string;
  commit?: string;
  archiveSha256?: string;
  repository?: string;
  source?: string;
  license: string;
  files: { path: string; sha256: string }[];
}

export interface TargetType {
  /** x.<target>-<version>.<scope>[.<view>] */
  id: string;
  label: string;
  /** SHACL shape files (repo-relative), empty when the release ships none for this scope. */
  shapes: string[];
  /** JSON Schema files (repo-relative); every one must hold (allOf). */
  schemas: string[];
  /** Which documents the type applies to: content specifications (+ view), or a category schema. */
  specs?: string[];
  view?: string;
  category?: string;
}

export interface Target extends TargetSpec {
  dir: string;
  manifestData: Manifest;
  profileData: Profile;
  types: TargetType[];
}

export interface Fixture {
  file: string;
  /**
   * publisher: the publisher's own example. openepcis: our crosswalk's output for an OpenEPCIS
   * passport. roundtrip: our output for a publisher's document taken in and lifted back, where a
   * missing value is a loss of the crosswalk.
   */
  role: "publisher" | "openepcis" | "roundtrip";
  /** The types the fixture is a document of. */
  types: string[];
  /** Why the SHACL side does not apply to this document (it is checked by JSON Schema only). */
  noShacl?: string;
}

const typeId = (t: TargetSpec, ...parts: string[]) => ["x", `${t.id}-${t.version}`, ...parts].join(".");

/** The view a file serves, from its name (pub-…, res1-…); undefined for files of every view. */
export function viewOfName(file: string): string | undefined {
  return /^(pub|res\d)-/.exec(file.replace(/.*\//, ""))?.[1];
}

function typesOf(t: TargetSpec, profile: Profile): TargetType[] {
  const types: TargetType[] = (t.types ?? []).map((ty) => ({
    id: typeId(t, ty.scope),
    label: `${t.title} ${t.version}, ${ty.label}`,
    shapes: ty.shapes ?? [],
    schemas: ty.schemas ?? [],
  }));
  const p = profile as Profile & {
    targetShapes?: { bySpec: Record<string, string[]> };
    json?: { schemas?: Record<string, string[]>; schemaBy?: { files: Record<string, string> }; conformance?: string };
  };
  for (const [scope, chain] of Object.entries(t.chains ?? {})) {
    const conformance = p.json?.conformance ?? "";
    const headerOnly = new Set(t.publicOnly?.files ?? []);
    const inView = (f: string, view?: string) =>
      !view || (viewOfName(f) ? viewOfName(f) === view : view === "pub" || !headerOnly.has(f.replace(/.*\//, "")));
    for (const view of chain.views ?? [undefined]) {
      types.push({
        id: view ? typeId(t, scope, view) : typeId(t, scope),
        label: `${t.title} ${t.version}, ${chain.label}${view ? `, view ${view}` : ""}`,
        shapes: chain.specs.flatMap((s) => p.targetShapes?.bySpec[s] ?? []).filter((f) => inView(f, view)),
        schemas: chain.specs
          .flatMap((s) => p.json?.schemas?.[s] ?? [])
          .filter((f) => inView(f, view))
          .map((f) => join(conformance, f)),
        specs: chain.specs,
        view,
      });
    }
  }
  for (const [name, scope] of Object.entries(t.categories ?? {})) {
    const file = Object.values(p.json?.schemaBy?.files ?? {}).find((f) => f.endsWith(`/${name}.json`));
    if (!file) throw new Error(`target ${t.id} ${t.version}: no schema ${name} in profile ${t.profile}`);
    const category = Object.entries(p.json!.schemaBy!.files).find(([, f]) => f === file)![0];
    const feb27 = file.replace(/_2\.0\.1\.json$/, "_Feb27_2.0.1.json");
    types.push({ id: typeId(t, scope), label: `${t.title} ${t.version}, ${category}`, shapes: [], schemas: [file], category });
    if (feb27 !== file && existsSync(join(ROOT, feb27))) {
      types.push({
        id: typeId(t, scope, "feb27"),
        label: `${t.title} ${t.version}, ${category}, requirements from February 2027`,
        shapes: [],
        schemas: [feb27],
        category,
      });
    }
  }
  return types;
}

/** Every target in the registry, sorted by id and version. */
export function loadTargets(): Target[] {
  const base = join(ROOT, TARGETS_DIR);
  const out: Target[] = [];
  for (const id of readdirSync(base).sort()) {
    for (const version of readdirSync(join(base, id)).sort()) {
      const file = join(base, id, version, "target.json");
      if (!existsSync(file)) continue;
      const spec = JSON.parse(readFileSync(file, "utf8")) as TargetSpec;
      const profileData = loadProfile(spec.profile);
      out.push({
        ...spec,
        dir: join(TARGETS_DIR, id, version),
        manifestData: JSON.parse(readFileSync(join(ROOT, spec.manifest), "utf8")),
        profileData,
        types: typesOf(spec, profileData),
      });
    }
  }
  return out;
}

/** The artifacts a target bundles that do not match its MANIFEST.json (path: reason). */
export function verifyArtifacts(t: Target): string[] {
  const vendorDir = t.manifest.replace(/\/MANIFEST\.json$/, "");
  const sums = new Map(t.manifestData.files.map((f) => [join(vendorDir, f.path), f.sha256]));
  const used = new Set(t.types.flatMap((ty) => [...ty.shapes, ...ty.schemas]).filter((f) => f.startsWith(vendorDir)));
  for (const f of referencedSchemaFiles(t)) used.add(f);
  for (const f of t.shacl?.background ?? []) if (f.startsWith(vendorDir)) used.add(f);
  for (const fx of t.fixtures) for (const f of globSync(fx.glob, { cwd: ROOT })) if (f.startsWith(vendorDir)) used.add(f);
  const bad: string[] = [];
  for (const f of [...used].sort()) {
    const want = sums.get(f);
    if (!want) {
      bad.push(`${f}: not in ${t.manifest}`);
      continue;
    }
    const got = createHash("sha256").update(readFileSync(join(ROOT, f))).digest("hex");
    if (got !== want) bad.push(`${f}: SHA-256 ${got} differs from the manifest`);
  }
  return bad;
}

/** Every JSON Schema of the release that a $ref may name by its $id. */
export function referencedSchemaFiles(t: Target): string[] {
  const dir = t.json?.referencedSchemas;
  if (!dir) return [];
  return globSync(`${dir}/**/*.schema.json`, { cwd: ROOT }).sort();
}

/** The release's provenance in one line, for labels, headers and the report. */
export function provenance(t: Target): string {
  const m = t.manifestData;
  const pin = m.commit ? `commit ${m.commit.slice(0, 8)}` : m.archiveSha256 ? `archive sha256 ${m.archiveSha256.slice(0, 12)}` : "unpinned";
  return `${t.publisher}, ${t.title} ${t.version} (${pin}, ${m.repository ?? m.source ?? ""})`;
}

/** The fixtures of a target with the types each is a document of. */
export function fixturesOf(t: Target): Fixture[] {
  const out: Fixture[] = [];
  for (const f of t.fixtures) {
    for (const file of globSync(f.glob, { cwd: ROOT }).sort()) {
      const ex = t.exclude?.find((x) => x.file === file);
      if (ex && !ex.only) continue;
      const doc = JSON.parse(readFileSync(join(ROOT, file), "utf8"));
      // A crosswalk case that starts from the target's document holds it next to the lifted one.
      const roundtrip = f.role === "openepcis" && /\/lifted\.[^/]+\.json$/.test(file) &&
        existsSync(join(ROOT, file.replace(/lifted\.([^/]+)\.json$/, "$1.json")));
      out.push({
        file,
        role: roundtrip ? "roundtrip" : f.role,
        types: typesForDocument(t, doc, file).map((ty) => ty.id),
        ...(ex?.only === "shacl" ? { noShacl: ex.reason } : {}),
      });
    }
  }
  return out;
}

/** The types a document belongs to: its content specifications and view, or its category. */
export function typesForDocument(t: Target, doc: Record<string, unknown>, file = ""): TargetType[] {
  if (t.types.length && !t.chains && !t.categories) return t.types;
  const cats = t.types.filter((ty) => ty.category);
  if (cats.length) {
    const p = t.profileData as Profile & { json?: { schemaBy?: { path: string } } };
    const path = p.json?.schemaBy?.path ?? "";
    const category = path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], doc);
    return cats.filter((ty) => ty.category === category);
  }
  const specs = new Set(specsOf(t.profileData, doc));
  const view = viewOfName(file);
  // The most specific chain whose specifications the document declares, every view unless the
  // file names one.
  const chains = t.types.filter((ty) => ty.specs?.every((s) => specs.has(s)));
  const longest = Math.max(0, ...chains.map((ty) => ty.specs!.length));
  return chains.filter((ty) => ty.specs!.length === longest && (!view || !ty.view || ty.view === view));
}

const ajvByTarget = new Map<string, InstanceType<typeof Ajv2020>>();

function ajvFor(t: Target): InstanceType<typeof Ajv2020> {
  let ajv = ajvByTarget.get(t.dir);
  if (ajv) return ajv;
  ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  for (const f of referencedSchemaFiles(t)) {
    const schema = JSON.parse(readFileSync(join(ROOT, f), "utf8"));
    if (schema.$id && !ajv.getSchema(schema.$id)) ajv.addSchema(schema);
  }
  ajvByTarget.set(t.dir, ajv);
  return ajv;
}

const compiled = new Map<string, ReturnType<InstanceType<typeof Ajv2020>["compile"]>>();

/** JSON Schema findings of a document for one type: a missing property apart from any other error. */
export function jsonFindings(t: Target, type: TargetType, doc: unknown): TargetFindings {
  const ajv = ajvFor(t);
  const form: string[] = [];
  const missing: string[] = [];
  for (const file of type.schemas) {
    const schema = JSON.parse(readFileSync(join(ROOT, file), "utf8"));
    let validate = schema.$id ? ajv.getSchema(schema.$id) : compiled.get(file);
    if (!validate) {
      validate = ajv.compile(schema);
      if (!schema.$id) compiled.set(file, validate);
    }
    if (validate(doc)) continue;
    const name = file.replace(/.*\//, "");
    for (const e of validate.errors ?? []) {
      const line = `schema ${name} ${e.instancePath || "/"} ${e.keyword}: ${e.message}${e.keyword === "required" ? ` (${(e.params as { missingProperty?: string }).missingProperty})` : ""}`;
      (e.keyword === "required" || e.keyword === "dependentRequired" ? missing : form).push(line);
    }
  }
  return { form: [...new Set(form)], missing: [...new Set(missing)] };
}

const backgroundCache = new Map<string, string>();

/** SHACL findings of a document's RDF for one type, with the target's background merged in. */
export async function shapeFindings(t: Target, type: TargetType, quads: Quad[]): Promise<TargetFindings> {
  if (!type.shapes.length) return { form: [], missing: [] };
  let nt = backgroundCache.get(t.dir);
  if (nt === undefined) {
    const parts: string[] = [];
    for (const f of t.shacl?.background ?? []) {
      if (f.endsWith(".jsonld")) {
        parts.push(await jsonldFileToNTriples(t, f));
        continue;
      }
      const store = new ox.Store();
      store.load(readFileSync(join(ROOT, f), "utf8"), { format: "text/turtle" });
      parts.push((store.query("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }") as ox.Quad[]).map((q) => q.toString() + " .").join("\n"));
    }
    nt = parts.join("\n");
    backgroundCache.set(t.dir, nt);
  }
  for (const f of type.shapes) if (f.endsWith(".jsonld") && !converted.has(f)) {
    registerShapeText(f, await jsonldFileToNTriples(t, f));
    converted.add(f);
  }
  return shaclFindings(type.shapes, quads, nt);
}

const converted = new Set<string>();

/** A JSON-LD file (shapes, an ontology) as N-Triples, every named graph merged into one. */
export async function jsonldFileToNTriples(t: Target, file: string): Promise<string> {
  const nq = (await jsonld.toRDF(JSON.parse(readFileSync(join(ROOT, file), "utf8")), {
    format: "application/n-quads",
    documentLoader: (await loaderFor(t)) as never,
  })) as unknown as string;
  const quads = new Parser({ format: "application/n-quads" }).parse(nq);
  return new Writer({ format: "application/n-triples" }).quadsToString(
    quads.map((q) => DataFactory.quad(q.subject, q.predicate, q.object)),
  );
}

/** The document loader for a target: its vendored contexts, else the repository's offline loader. */
async function loaderFor(t: Target) {
  const fallback = await offlineDocumentLoader();
  const prefixes = Object.entries(t.jsonld?.contexts ?? {});
  return async (url: string) => {
    const hit = prefixes.find(([p]) => url.startsWith(p));
    if (!hit) return fallback(url);
    const file = join(ROOT, hit[1], url.slice(hit[0].length));
    return { contextUrl: undefined, documentUrl: url, document: JSON.parse(readFileSync(file, "utf8")) };
  };
}

/** A target document (the model's own JSON, no @context) as RDF, the way the crosswalk reads it. */
export async function documentQuads(t: Target, doc: Record<string, unknown>): Promise<Quad[]> {
  if (!t.jsonld) return theirJsonToQuads(t.profileData, doc);
  if (!doc["@context"]) throw new Error("no @context");
  const nq = (await jsonld.toRDF(doc as never, { format: "application/n-quads", documentLoader: (await loaderFor(t)) as never })) as unknown as string;
  return new Parser({ format: "application/n-quads" }).parse(nq);
}

export interface Verdict {
  type: string;
  /** What the hosted validator answers: no finding at all. */
  valid: boolean;
  /** Valid apart from the accepted deviations: what we claim. */
  conforms: boolean;
  missing: string[];
  form: string[];
  /** Findings matched by an accepted deviation of the target, with the reason. */
  accepted: { finding: string; reason: string }[];
}

/** Validate one document against one type: JSON Schema and SHACL, as the hosted types would. */
export async function verdict(t: Target, type: TargetType, doc: Record<string, unknown>, opts: { noShacl?: boolean } = {}): Promise<Verdict> {
  const j = jsonFindings(t, type, doc);
  let s: TargetFindings = { form: [], missing: [] };
  if (type.shapes.length && !opts.noShacl) {
    let quads: Quad[] | undefined;
    try {
      quads = await documentQuads(t, doc);
    } catch (e) {
      s.form.push(`rdf: not readable as a ${t.title} document (${(e as Error).message.split("\n")[0]})`);
    }
    if (quads) {
      s = await shapeFindings(t, type, quads);
      const root = rootType(t);
      if (root && !quads.some((q) => q.predicate.value === RDF_TYPE && q.object.value === root)) {
        s.form.push(`presence: no ${root.replace(/.*[#/]/, "")} in the document`);
      }
    }
  }
  const all = { missing: [...j.missing, ...s.missing], form: [...j.form, ...s.form] };
  const accepted: Verdict["accepted"] = [];
  const keep = (f: string) => {
    const a = t.accepted.find((x) => new RegExp(x.match).test(f));
    if (a) accepted.push({ finding: f, reason: a.reason });
    return !a;
  };
  const missing = all.missing.filter(keep);
  const form = all.form.filter(keep);
  return { type: type.id, valid: !accepted.length && !missing.length && !form.length, conforms: !missing.length && !form.length, missing, form, accepted };
}

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

/** The class every document of the target is an instance of (the profile's JSON root type). */
export function rootType(t: Target): string | undefined {
  return t.rootType ?? (t.profileData as Profile & { json?: { rootType?: string } }).json?.rootType;
}

/**
 * The one shape OpenEPCIS adds to a SHACL type: the input must contain an instance of the root
 * class. The publisher's shapes all target that class, so without it an empty or unrelated graph
 * would pass with zero findings. SHACL Core (sh:targetNode on the class, an inverse rdf:type path),
 * so the hosted validator and rdf-validate-shacl agree.
 */
export function presenceShape(t: Target): string | undefined {
  const root = rootType(t);
  if (!root) return undefined;
  return [
    `@prefix sh: <http://www.w3.org/ns/shacl#> .`,
    `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .`,
    ``,
    `# Added by OpenEPCIS DPP-Ready, not part of the ${t.title} ${t.version} release.`,
    `<https://ref.openepcis.org/extensions/common/interop/targets/${t.id}/${t.version}/shapes#Presence>`,
    `  a sh:NodeShape ;`,
    `  sh:targetNode <${root}> ;`,
    `  sh:property [`,
    `    sh:path [ sh:inversePath rdf:type ] ;`,
    `    sh:minCount 1 ;`,
    `    sh:message "The document contains no ${root.replace(/.*[#/]/, "")}: it is not a ${t.title} ${t.version} document." ;`,
    `  ] .`,
    ``,
  ].join("\n");
}

const SHN = "http://www.w3.org/ns/shacl#";
const XSD_INTEGER = "http://www.w3.org/2001/XMLSchema#integer";

/**
 * A document the type's own shapes must reject, derived from a valid one: a property the
 * publisher's shapes type with sh:datatype on the root class gets an xsd:integer value instead, or,
 * without one, a property they require on the root class is dropped.
 * It proves the publisher's shapes are live in a validator, not only the presence shape: a
 * validator that silently drops a shapes file (a JSON-LD @graph read into one model) passes it.
 * Undefined when no such property shape exists.
 */
export async function livenessMutation(t: Target, type: TargetType, quads: Quad[]): Promise<{ quads: Quad[]; path: string } | undefined> {
  const root = rootType(t);
  if (!root || !type.shapes.length) return undefined;
  const store = new ox.Store();
  for (const f of type.shapes) {
    const text = f.endsWith(".jsonld") ? await jsonldFileToNTriples(t, f) : readFileSync(join(ROOT, f), "utf8");
    store.load(text, { format: "text/turtle" });
  }
  const rows = store.query(`SELECT ?p ?d WHERE {
    ?s <${SHN}targetClass> <${root}> ; <${SHN}property> ?ps . ?ps <${SHN}path> ?p ; <${SHN}datatype> ?d .
    FILTER(isIRI(?p) && ?d != <${XSD_INTEGER}>)
  } ORDER BY STR(?p)`) as Map<string, ox.Term>[];
  const roots = new Set(quads.filter((q) => q.predicate.value === RDF_TYPE && q.object.value === root).map((q) => q.subject.value));
  for (const r of rows) {
    const path = r.get("p")!.value;
    const subject = quads.find((q) => roots.has(q.subject.value) && q.predicate.value === RDF_TYPE)?.subject;
    if (!subject) return undefined;
    return {
      path,
      quads: [
        ...quads.filter((q) => !(q.subject.equals(subject) && q.predicate.value === path)),
        DataFactory.quad(subject, DataFactory.namedNode(path), DataFactory.literal("7", DataFactory.namedNode(XSD_INTEGER))),
      ],
    };
  }
  // No typed property on the root: drop a required one the document states instead.
  const required = store.query(`SELECT DISTINCT ?p WHERE {
    ?s <${SHN}targetClass> <${root}> ; <${SHN}property> ?ps . ?ps <${SHN}path> ?p ; <${SHN}minCount> ?n .
    FILTER(isIRI(?p) && ?n >= 1)
  } ORDER BY STR(?p)`) as Map<string, ox.Term>[];
  for (const r of required) {
    const path = r.get("p")!.value;
    if (!quads.some((q) => roots.has(q.subject.value) && q.predicate.value === path)) continue;
    return { path, quads: quads.filter((q) => !(roots.has(q.subject.value) && q.predicate.value === path)) };
  }
  return undefined;
}

/** The `{"this": "is not a passport"}` probe every type must reject. */
export const GARBAGE = { this: "is not a passport" };
