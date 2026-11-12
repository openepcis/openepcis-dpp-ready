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
import AjvDraft04 from "ajv-draft-04";
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
  /** The crosswalk profile that reads the model's own JSON (none for a model we do not convert). */
  profile?: string;
  /** "draft": the publisher marks the release as a draft; labels and the report say so. */
  status?: "draft";
  shacl?: { background?: string[] };
  /** referencedSchemas: directories (every *.schema.json in them) or files, registered by $id. */
  json?: { referencedSchemas?: string | string[] };
  chains?: Record<string, Chain>;
  /** Types stated outright: scope, label, shapes and schemas (repo-relative), all applying. */
  types?: { scope: string; label: string; shapes?: string[]; schemas?: string[]; when?: { typeIncludes: string } }[];
  /** JSON-LD documents of the model: context URL prefixes served from vendored directories. */
  jsonld?: { contexts: Record<string, string> };
  /** The class every document is an instance of, when the crosswalk profile does not say. */
  rootType?: string;
  /** Publisher examples that are not documents of any type here (another model's form), with why. */
  exclude?: { file: string; reason: string; only?: "shacl" }[];
  /** File names that apply to the public view only (the passport header). */
  publicOnly?: { files: string[] };
  categories?: Record<string, string>;
  /**
   * glob: documents, all expected valid unless `expect` says otherwise. expectations: a publisher's
   * test corpus, a JSON file of scenarios ({fixture_path, expected_conforms}, paths relative to
   * `base`), as CIRPASS-2 ships it.
   */
  fixtures: (
    | { role: "publisher" | "openepcis"; glob: string; expect?: "valid" | "invalid"; scopes?: string[] }
    | { role: "publisher"; expectations: string; base: string; scopes?: string[] }
  )[];
  accepted: { match: string; reason: string }[];
}

export interface Manifest {
  version: string;
  commit?: string;
  archiveSha256?: string;
  retrieved?: string;
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
  /** A document belongs to the type when its JSON `type` (string or array) includes this value. */
  typeIncludes?: string;
}

export interface Target extends TargetSpec {
  dir: string;
  manifestData: Manifest;
  profileData?: Profile;
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
  /** The publisher's verdict on its own fixture: a test corpus has documents that must fail. */
  expect: "valid" | "invalid";
}

/** A Turtle fixture travels as `{ "@turtle": text }`: RDF only, no JSON Schema side. */
export const TURTLE = "@turtle";

/** A text file as published: UTF-8, or UTF-16 when it starts with a byte-order mark (SAMM tooling). */
export function readText(file: string): string {
  const bytes = readFileSync(join(ROOT, file));
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return bytes.subarray(2).toString("utf16le");
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return Buffer.from(bytes.subarray(2)).swap16().toString("utf16le");
  return bytes.toString("utf8").replace(/^\uFEFF/, "");
}

/** Read a fixture or a document to validate: JSON, or Turtle (.ttl) wrapped under TURTLE. */
export function readDocument(file: string): Record<string, unknown> {
  const text = readText(file);
  return /\.ttl$/.test(file) ? { [TURTLE]: text } : JSON.parse(text);
}

const typeId = (t: TargetSpec, ...parts: string[]) => ["x", `${t.id}-${t.version}`, ...parts].join(".");
const draft = (t: TargetSpec) => (t.status === "draft" ? " (draft release)" : "");

/** The view a file serves, from its name (pub-…, res1-…); undefined for files of every view. */
export function viewOfName(file: string): string | undefined {
  return /^(pub|res\d)-/.exec(file.replace(/.*\//, ""))?.[1];
}

function typesOf(t: TargetSpec, profile: Profile = {} as Profile): TargetType[] {
  const types: TargetType[] = (t.types ?? []).map((ty) => ({
    id: typeId(t, ty.scope),
    label: `${t.title} ${t.version}${draft(t)}, ${ty.label}`,
    shapes: ty.shapes ?? [],
    schemas: ty.schemas ?? [],
    ...(ty.when ? { typeIncludes: ty.when.typeIncludes } : {}),
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
      const profileData = spec.profile ? loadProfile(spec.profile) : undefined;
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

/**
 * The artifacts a target bundles that do not match their vendor MANIFEST.json (path: reason). A
 * file from another vendored release (a schema a $ref names, say) is checked against its own
 * manifest, the nearest MANIFEST.json above it.
 */
export function verifyArtifacts(t: Target): string[] {
  const vendorDir = t.manifest.replace(/\/MANIFEST\.json$/, "");
  const used = new Set(t.types.flatMap((ty) => [...ty.shapes, ...ty.schemas]).filter((f) => f.startsWith("vendor/")));
  for (const f of referencedSchemaFiles(t)) used.add(f);
  for (const f of t.shacl?.background ?? []) if (f.startsWith("vendor/")) used.add(f);
  for (const f of fixturesOf(t)) if (f.file.startsWith(vendorDir)) used.add(f.file);
  for (const fx of t.fixtures) if ("expectations" in fx) used.add(fx.expectations);
  const bad: string[] = [];
  for (const f of [...used].sort()) {
    let dir = f.replace(/\/[^/]+$/, "");
    while (dir.includes("/") && !existsSync(join(ROOT, dir, "MANIFEST.json"))) dir = dir.replace(/\/[^/]+$/, "");
    const manifestFile = join(dir, "MANIFEST.json");
    if (!existsSync(join(ROOT, manifestFile))) {
      bad.push(`${f}: no MANIFEST.json above it`);
      continue;
    }
    const m = JSON.parse(readFileSync(join(ROOT, manifestFile), "utf8")) as Manifest;
    const want = m.files.find((x) => join(dir, x.path) === f)?.sha256;
    if (!want) {
      bad.push(`${f}: not in ${manifestFile}`);
      continue;
    }
    const got = createHash("sha256").update(readFileSync(join(ROOT, f))).digest("hex");
    if (got !== want) bad.push(`${f}: SHA-256 ${got} differs from ${manifestFile}`);
  }
  return bad;
}

/** Every JSON Schema of the release that a $ref may name by its $id. */
export function referencedSchemaFiles(t: Target): string[] {
  const entries = ([] as string[]).concat(t.json?.referencedSchemas ?? []);
  return entries.flatMap((e) => (e.endsWith(".json") ? [e] : globSync(`${e}/**/*.schema.json`, { cwd: ROOT }))).sort();
}

/** The release's provenance in one line, for labels, headers and the report. */
export function provenance(t: Target): string {
  const m = t.manifestData;
  const pin = m.commit
    ? `commit ${m.commit.slice(0, 8)}`
    : m.archiveSha256
      ? `archive sha256 ${m.archiveSha256.slice(0, 12)}`
      : m.retrieved
        ? `retrieved ${m.retrieved}, SHA-256 per file`
        : "unpinned";
  return `${t.publisher}, ${t.title} ${t.version}${draft(t)} (${pin}, ${m.repository ?? m.source ?? ""})`;
}

/** The fixtures of a target with the types each is a document of. */
export function fixturesOf(t: Target): Fixture[] {
  const out: Fixture[] = [];
  for (const f of t.fixtures) {
    const listed: { file: string; expect: "valid" | "invalid" }[] =
      "expectations" in f
        ? (JSON.parse(readFileSync(join(ROOT, f.expectations), "utf8")).scenarios as { fixture_path: string; expected_conforms: boolean }[])
            .map((sc) => ({ file: join(f.base, sc.fixture_path), expect: sc.expected_conforms ? ("valid" as const) : ("invalid" as const) }))
            .sort((a, b) => a.file.localeCompare(b.file))
        : globSync(f.glob, { cwd: ROOT }).sort().map((file) => ({ file, expect: f.expect ?? ("valid" as const) }));
    for (const { file, expect } of listed) {
      const ex = t.exclude?.find((x) => x.file === file);
      if (ex && !ex.only) continue;
      const doc = readDocument(file);
      const scoped = f.scopes?.map((sc) => typeId(t, sc));
      // A crosswalk case that starts from the target's document holds it next to the lifted one.
      const roundtrip = f.role === "openepcis" && /\/lifted\.[^/]+\.json$/.test(file) &&
        existsSync(join(ROOT, file.replace(/lifted\.([^/]+)\.json$/, "$1.json")));
      out.push({
        file,
        role: roundtrip ? "roundtrip" : f.role,
        types: scoped ?? typesForDocument(t, doc, file).map((ty) => ty.id),
        expect,
        ...(ex?.only === "shacl" ? { noShacl: ex.reason } : {}),
      });
    }
  }
  return out;
}

/** The types a document belongs to: its content specifications and view, or its category. */
export function typesForDocument(t: Target, doc: Record<string, unknown>, file = ""): TargetType[] {
  if (t.types.length && !t.chains && !t.categories) {
    const declared = ([] as unknown[]).concat(doc.type ?? doc["@type"] ?? []).map(String);
    return t.types.filter((ty) => !ty.typeIncludes || declared.includes(ty.typeIncludes));
  }
  const cats = t.types.filter((ty) => ty.category);
  if (cats.length) {
    const p = (t.profileData ?? {}) as Profile & { json?: { schemaBy?: { path: string } } };
    const path = p.json?.schemaBy?.path ?? "";
    const category = path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], doc);
    return cats.filter((ty) => ty.category === category);
  }
  if (!t.profileData) return [];
  const specs = new Set(specsOf(t.profileData, doc));
  const view = viewOfName(file);
  // The most specific chain whose specifications the document declares, every view unless the
  // file names one.
  const chains = t.types.filter((ty) => ty.specs?.every((s) => specs.has(s)));
  const longest = Math.max(0, ...chains.map((ty) => ty.specs!.length));
  return chains.filter((ty) => ty.specs!.length === longest && (!view || !ty.view || ty.view === view));
}

type AnyAjv = InstanceType<typeof Ajv2020> | InstanceType<typeof AjvDraft04>;
const ajvByTarget = new Map<string, InstanceType<typeof Ajv2020>>();
const draft04ByTarget = new Map<string, InstanceType<typeof AjvDraft04>>();

/** JSON Schema draft-04 (SAMM generators) reads exclusiveMinimum and id differently: its own dialect. */
function draft04For(t: Target): InstanceType<typeof AjvDraft04> {
  let ajv = draft04ByTarget.get(t.dir);
  if (ajv) return ajv;
  ajv = new AjvDraft04({ strict: false, allErrors: true });
  addFormats(ajv as never);
  draft04ByTarget.set(t.dir, ajv);
  return ajv;
}

function ajvFor(t: Target): InstanceType<typeof Ajv2020> {
  let ajv = ajvByTarget.get(t.dir);
  if (ajv) return ajv;
  ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  // GS1 EPCIS states draft-07; draft-07 keywords are a subset ajv's 2020 vocabulary evaluates alike.
  ajv.addMetaSchema(JSON.parse(readFileSync(join(ROOT, "node_modules/ajv/dist/refs/json-schema-draft-07.json"), "utf8")));
  for (const f of referencedSchemaFiles(t)) {
    const schema = JSON.parse(readFileSync(join(ROOT, f), "utf8"));
    if (schema.$id && !ajv.getSchema(schema.$id)) ajv.addSchema(schema);
  }
  ajvByTarget.set(t.dir, ajv);
  return ajv;
}

const compiled = new Map<string, ReturnType<AnyAjv["compile"]>>();

/** JSON Schema findings of a document for one type: a missing property apart from any other error. */
export function jsonFindings(t: Target, type: TargetType, doc: unknown): TargetFindings {
  if (doc && typeof doc === "object" && TURTLE in doc) return { form: [], missing: [] };
  const form: string[] = [];
  const missing: string[] = [];
  for (const file of type.schemas) {
    const schema = JSON.parse(readText(file));
    const ajv: AnyAjv = /draft-04/.test(String(schema.$schema ?? "")) ? draft04For(t) : ajvFor(t);
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
  // Shapes that declare sh:entailment RDFS are evaluated over the RDFS closure of data plus
  // background, as Jena (the Test Bed) does; rdf-validate-shacl has no entailment of its own.
  const rdfs = type.shapes.some((f) => !f.endsWith(".jsonld") && /sh:entailment\s+<http:\/\/www\.w3\.org\/ns\/entailment\/RDFS>/.test(readText(f)));
  return shaclFindings(type.shapes, rdfs ? rdfsClosure(quads, nt) : quads, nt);
}

/**
 * The RDFS entailments a SHACL processor applies under sh:entailment RDFS that matter for
 * validation: rdfs:subPropertyOf (rdfs7), rdfs:domain / rdfs:range typing (rdfs2, rdfs3) and
 * rdfs:subClassOf typing (rdfs9), over the data and the background ontology, to a fixpoint.
 * Only the data's own triples and what they entail are returned (the background is merged later).
 */
function rdfsClosure(quads: Quad[], backgroundNt: string): Quad[] {
  const store = new ox.Store();
  const w = new Writer({ format: "application/n-triples" });
  store.load(quads.map((q) => w.quadToString(q.subject, q.predicate, q.object)).join(""), { format: "application/n-triples" });
  const bg = new ox.Store();
  if (backgroundNt) bg.load(backgroundNt, { format: "application/n-triples" });
  const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
  const sub = (p: string) => new Map<string, string[]>(
    (bg.query(`SELECT ?a ?b WHERE { ?a <${RDFS}${p}>+ ?b . FILTER(isIRI(?a) && isIRI(?b)) }`) as Map<string, ox.Term>[]).reduce((m, r) => {
      const a = r.get("a")!.value;
      m.set(a, [...(m.get(a) ?? []), r.get("b")!.value]);
      return m;
    }, new Map<string, string[]>()),
  );
  const superProps = sub("subPropertyOf");
  const superClasses = sub("subClassOf");
  const one = (p: string) => new Map((bg.query(`SELECT ?a ?b WHERE { ?a <${RDFS}${p}> ?b . FILTER(isIRI(?b)) }`) as Map<string, ox.Term>[]).map((r) => [r.get("a")!.value, r.get("b")!.value]));
  const domain = one("domain");
  const range = one("range");
  const add = (s: ox.Term, p: string, o: ox.Term) => {
    const q = ox.quad(s as ox.NamedNode, ox.namedNode(p), o as ox.NamedNode);
    if (store.has(q)) return false;
    store.add(q);
    return true;
  };
  for (let changed = true; changed; ) {
    changed = false;
    for (const q of store.match(null, null, null, null)) {
      const p = q.predicate.value;
      for (const sp of superProps.get(p) ?? []) changed = add(q.subject, sp, q.object) || changed;
      if (domain.has(p)) changed = add(q.subject, RDF_TYPE, ox.namedNode(domain.get(p)!)) || changed;
      if (range.has(p) && q.object.termType !== "Literal") changed = add(q.object, RDF_TYPE, ox.namedNode(range.get(p)!)) || changed;
      if (p === RDF_TYPE) for (const c of superClasses.get(q.object.value) ?? []) changed = add(q.subject, RDF_TYPE, ox.namedNode(c)) || changed;
    }
  }
  return new Parser({ format: "application/n-quads" }).parse(store.dump({ format: "application/n-quads" }));
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
    // A prefix maps onto a directory; a whole URL maps onto one file.
    const file = join(ROOT, hit[1], hit[1].endsWith(".jsonld") ? "" : url.slice(hit[0].length));
    return { contextUrl: undefined, documentUrl: url, document: JSON.parse(readFileSync(file, "utf8")) };
  };
}

/** A target document (the model's own JSON, no @context) as RDF, the way the crosswalk reads it. */
export async function documentQuads(t: Target, doc: Record<string, unknown>): Promise<Quad[]> {
  if (typeof doc[TURTLE] === "string") return new Parser({ format: "text/turtle" }).parse(doc[TURTLE] as string);
  if (!t.jsonld) {
    if (!t.profileData) throw new Error(`${t.id} ${t.version} reads no RDF from JSON`);
    return theirJsonToQuads(t.profileData, doc);
  }
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
  return t.rootType ?? (t.profileData as (Profile & { json?: { rootType?: string } }) | undefined)?.json?.rootType;
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
