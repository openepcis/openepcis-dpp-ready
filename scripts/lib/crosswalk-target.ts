/**
 * The target side of a crosswalk profile that ships its own JSON form, SHACL shapes and JSON
 * Schemas (profile.json "json" and "targetShapes"; the EU DPP Registry first).
 *
 *   theirJsonToQuads   a target JSON document (no @context, as the Registry receives it) → RDF:
 *                      the context follows from its content specifications, the root gets the
 *                      profile's root type (the shapes target it) and, when the root key holds an
 *                      absolute IRI, that IRI.
 *   toTheirJson        RDF → one target JSON document per root, nested, numbers as JSON numbers.
 *   targetShapeFindings  the target's SHACL shapes for the specifications a document declares,
 *                      SPARQL constraints included (rdf-validate-shacl cannot run them; Oxigraph
 *                      does, with the focus nodes worked out from targets, sh:property, sh:node and
 *                      sh:or / sh:and / sh:xone).
 *   jsonSchemaFindings the target's JSON Schemas for those specifications.
 *
 * Findings come in two kinds: "missing" (a required value the document does not have: sh:minCount,
 * JSON Schema required / dependentRequired), which is the document's content, and "form" (anything
 * else: a wrong datatype, code, pattern, unknown key), which is the converter's responsibility.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { DataFactory, Store, Writer, type Quad } from "n3";
import jsonld from "jsonld";
import * as ox from "oxigraph";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { ROOT, jsonldToQuads, type Profile } from "./crosswalk.ts";
import SHACLValidator from "rdf-validate-shacl";
import { parseTurtle as parseStore, stripOwlImports, stripSparqlConstraints, SH } from "./shacl-run.ts";

const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const XSD = "http://www.w3.org/2001/XMLSchema#";

export interface TargetJson {
  specBase: string;
  /** Content specification (relative to specBase) → context file (relative to the vendored tree). */
  contexts: Record<string, string>;
  /** Content specification → JSON Schema files (relative to the vendored tree). */
  schemas: Record<string, string[]>;
  rootType: string;
  /** JSON key of the root whose value, when an absolute IRI, is the root's IRI. */
  rootId: string;
  /** The vendored tree: specBase maps onto it. */
  conformance: string;
}

export interface TargetShapes {
  bySpec: Record<string, string[]>;
}

export interface TargetFindings {
  form: string[];
  missing: string[];
}

function cfg(p: Profile): TargetJson {
  const j = (p as Profile & { json?: TargetJson }).json;
  if (!j) throw new Error(`profile ${p.id} has no "json" section`);
  return j;
}

export function hasTargetJson(p: Profile): boolean {
  return Boolean((p as Profile & { json?: TargetJson }).json);
}

/** The content specifications (relative to specBase) a JSON document or an RDF graph declares. */
export function specsOf(p: Profile, src: Quad[] | Record<string, unknown>): string[] {
  const { specBase } = cfg(p);
  const ids = Array.isArray(src)
    ? src.filter((q) => q.predicate.value.endsWith("#contentSpecificationIds")).map((q) => q.object.value)
    : ((src.contentSpecificationIds as string[] | undefined) ?? []);
  return [...new Set(ids.filter((s) => s.startsWith(specBase)).map((s) => s.slice(specBase.length)))].sort();
}

/** The context URL for a set of specifications: the most specific one the profile knows. */
function contextUrl(p: Profile, specs: string[]): string {
  const c = cfg(p);
  const known = specs.filter((s) => c.contexts[s]).sort((a, b) => b.length - a.length);
  if (!known.length) throw new Error(`no context for content specifications ${specs.join(", ") || "(none)"}`);
  return c.specBase + c.contexts[known[0]];
}

/** A target JSON document (no @context) as RDF. */
export async function theirJsonToQuads(p: Profile, doc: Record<string, unknown>): Promise<Quad[]> {
  const c = cfg(p);
  const root: Record<string, unknown> = { "@context": contextUrl(p, specsOf(p, doc)), "@type": c.rootType, ...doc };
  const id = doc[c.rootId];
  if (typeof id === "string" && /^[A-Za-z][A-Za-z0-9+.-]*:\S+$/.test(id)) root["@id"] = id;
  return jsonldToQuads(root);
}

/** Term name → @type (and the scoped @vocab of a vocabulary-valued term) of every term definition in a context. */
function termTypes(ctx: unknown, out = new Map<string, { type: string; vocab?: string }>()): Map<string, { type: string; vocab?: string }> {
  if (!ctx || typeof ctx !== "object") return out;
  for (const [k, v] of Object.entries(ctx as Record<string, unknown>)) {
    if (k.startsWith("@") || !v || typeof v !== "object") continue;
    const def = v as Record<string, unknown>;
    const scoped = def["@context"] as Record<string, unknown> | undefined;
    if (typeof def["@type"] === "string") {
      out.set(k, { type: def["@type"] as string, vocab: typeof scoped?.["@vocab"] === "string" ? (scoped["@vocab"] as string) : undefined });
    }
    if (scoped) termTypes(scoped, out);
  }
  return out;
}

const NUMERIC_TYPES = new Set(["double", "float", "decimal", "integer", "int", "long", "positiveInteger", "nonNegativeInteger"]);

/**
 * Typed strings back to JSON numbers and booleans, and code values back to full IRIs, as the
 * target's JSON Schemas and its own examples write them.
 */
function nativeValues(node: unknown, types: Map<string, { type: string; vocab?: string }>, key?: string): unknown {
  if (Array.isArray(node)) return node.map((x) => nativeValues(x, types, key));
  if (node && typeof node === "object") {
    return Object.fromEntries(Object.entries(node as Record<string, unknown>).map(([k, v]) => [k, nativeValues(v, types, k)]));
  }
  const def = key ? types.get(key) : undefined;
  const t = def?.type.replace(/^xsd:/, "").replace(XSD, "");
  if (typeof node === "string" && t && NUMERIC_TYPES.has(t) && Number.isFinite(Number(node))) return Number(node);
  if (typeof node === "string" && t === "boolean" && (node === "true" || node === "false")) return node === "true";
  if (typeof node === "string" && def?.type === "@vocab" && def.vocab && !node.includes(":")) return def.vocab + node;
  return node;
}

/**
 * fromRDF writes an xsd:string literal as a bare @value; the target's contexts coerce their text
 * terms to xsd:string, so compaction would miss them. The type is put back.
 */
function typedStrings(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(typedStrings);
  if (!node || typeof node !== "object") return node;
  const o = node as Record<string, unknown>;
  if ("@value" in o) return typeof o["@value"] === "string" && !("@type" in o) && !("@language" in o) ? { ...o, "@type": XSD + "string" } : o;
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typedStrings(v)]));
}

/** Keys the target's JSON Schemas declare as arrays (compaction writes a one-member list as its member). */
let arrayKeySet: Set<string> | undefined;
function arrayKeys(p: Profile): Set<string> {
  if (arrayKeySet) return arrayKeySet;
  arrayKeySet = new Set();
  const visit = (s: unknown): void => {
    if (Array.isArray(s)) return s.forEach(visit);
    if (!s || typeof s !== "object") return;
    const o = s as Record<string, unknown>;
    if (o.properties && typeof o.properties === "object") {
      for (const [k, v] of Object.entries(o.properties as Record<string, unknown>)) {
        if (v && typeof v === "object" && (v as Record<string, unknown>).type === "array") arrayKeySet!.add(k);
      }
    }
    Object.values(o).forEach(visit);
  };
  for (const f of schemaFiles(p)) visit(JSON.parse(readFileSync(f, "utf8")));
  return arrayKeySet;
}

function asArrays(node: unknown, keys: Set<string>, key?: string): unknown {
  if (Array.isArray(node)) return node.map((x) => asArrays(x, keys));
  const v = node && typeof node === "object"
    ? Object.fromEntries(Object.entries(node as Record<string, unknown>).map(([k, x]) => [k, asArrays(x, keys, k)]))
    : node;
  return key && keys.has(key) && !Array.isArray(node) ? [v] : v;
}

const loaderPromise = import("./jsonld-loader.ts").then((m) => m.offlineDocumentLoader());

/** RDF → one target JSON document per root, nested, without @context, root @id and @type. */
export async function toTheirJson(p: Profile, quads: Quad[]): Promise<Record<string, unknown>[]> {
  const c = cfg(p);
  if (!quads.some((q) => q.predicate.value === RDF + "type" && q.object.value === c.rootType)) return [];
  const loader = await loaderPromise;
  const w = new Writer({ format: "application/n-quads" });
  const sorted = [...quads].sort((a, b) =>
    (a.subject.value + a.predicate.value + a.object.value).localeCompare(b.subject.value + b.predicate.value + b.object.value));
  const url = contextUrl(p, specsOf(p, quads));
  const ctxDoc = (await loader(url)).document as { "@context": unknown };
  const expanded = typedStrings(await jsonld.fromRDF(sorted.map((q) => w.quadToString(q.subject, q.predicate, q.object)).join("") as never,
    { format: "application/n-quads" }));
  // Framed by the root type: a root may be a blank node (no unique product identifier IRI).
  const framed = (await jsonld.frame(expanded, { "@context": url, "@type": c.rootType } as never,
    { documentLoader: loader as never, embed: "@always", omitGraph: false } as never)) as Record<string, unknown>;
  const types = termTypes(ctxDoc["@context"]);
  return ((framed["@graph"] as Record<string, unknown>[]) ?? []).map((node) => {
    const { "@id": _i, "@type": _t, id: _i2, type: _t2, ...doc } = node;
    return asArrays(nativeValues(doc, types), arrayKeys(p)) as Record<string, unknown>;
  });
}

// ---------------------------------------------------------------- SHACL

let vocabStore: ox.Store | undefined;
let vocabNt = "";
const shapeCache = new Map<string, { shapes: Store; sparql: SparqlConstraint[] }>();

interface SparqlConstraint {
  shape: string;
  message: string;
  query: string;
  focus: string;
}

function local(iri: string): string {
  return iri.replace(/.*[/#]/, "");
}

/** SPARQL path syntax for a SHACL path node (IRI or sequence list). */
function pathOf(shapes: ox.Store, node: ox.Term): string | undefined {
  if (node.termType === "NamedNode") return `<${node.value}>`;
  const items: string[] = [];
  let cur: ox.Term = node;
  while (cur.value !== RDF + "nil") {
    const first = shapes.match(cur as ox.BlankNode, ox.namedNode(RDF + "first"), null, null)[0];
    const rest = shapes.match(cur as ox.BlankNode, ox.namedNode(RDF + "rest"), null, null)[0];
    if (!first || !rest) return undefined;
    const p = pathOf(shapes, first.object);
    if (!p) return undefined;
    items.push(p);
    cur = rest.object;
  }
  return items.length ? items.join("/") : undefined;
}

/**
 * A SPARQL pattern binding ?f to the focus nodes of a shape, or undefined when the shape is not
 * reachable from a target. Recursion over sh:property (same focus), sh:node (the values of the
 * owning property shape's path) and logical lists (same focus as the owner).
 */
function focusPattern(shapes: ox.Store, shape: ox.Term, depth = 0): string[] {
  if (depth > 8) return [];
  const out: string[] = [];
  for (const q of shapes.match(shape as ox.NamedNode, ox.namedNode(SH + "targetClass"), null, null)) out.push(`?f a <${q.object.value}> .`);
  for (const q of shapes.match(null, ox.namedNode(SH + "property"), shape as ox.NamedNode, null)) out.push(...focusPattern(shapes, q.subject, depth + 1));
  for (const q of shapes.match(null, ox.namedNode(SH + "node"), shape as ox.NamedNode, null)) {
    const pathNode = shapes.match(q.subject, ox.namedNode(SH + "path"), null, null)[0];
    const path = pathNode && pathOf(shapes, pathNode.object);
    if (!path) continue;
    for (const owner of focusPattern(shapes, q.subject, depth + 1)) {
      out.push(`{ SELECT (?v${depth} AS ?f) WHERE { ${owner.replaceAll("?f", `?o${depth}`)} ?o${depth} ${path} ?v${depth} . } }`);
    }
  }
  // Member of an sh:or / sh:and / sh:xone list: the focus of the list's owner.
  for (const q of shapes.match(null, ox.namedNode(RDF + "first"), shape as ox.NamedNode, null)) {
    let head: ox.Term = q.subject;
    for (;;) {
      const prev = shapes.match(null, ox.namedNode(RDF + "rest"), head as ox.BlankNode, null)[0];
      if (!prev) break;
      head = prev.subject;
    }
    for (const kw of ["or", "and", "xone"]) {
      for (const o of shapes.match(null, ox.namedNode(SH + kw), head as ox.BlankNode, null)) out.push(...focusPattern(shapes, o.subject, depth + 1));
    }
  }
  return out;
}

function loadShapes(files: string[]): { shapes: Store; sparql: SparqlConstraint[] } {
  const key = files.join("|");
  let entry = shapeCache.get(key);
  if (entry) return entry;
  const texts = files.map((f) => readFileSync(join(ROOT, f), "utf8"));
  const raw = new ox.Store();
  for (const t of texts) raw.load(t, { format: "text/turtle" });
  const sparql: SparqlConstraint[] = [];
  for (const q of raw.match(null, ox.namedNode(SH + "sparql"), null, null)) {
    const select = raw.match(q.object as ox.BlankNode, ox.namedNode(SH + "select"), null, null)[0]?.object.value;
    if (!select) continue;
    const msg = raw.match(q.object as ox.BlankNode, ox.namedNode(SH + "message"), null, null)[0]?.object.value
      ?? raw.match(q.subject, ox.namedNode(SH + "message"), null, null)[0]?.object.value ?? "";
    const pathNode = raw.match(q.subject, ox.namedNode(SH + "path"), null, null)[0];
    const shapeName = pathNode && pathNode.object.termType === "NamedNode" ? local(pathNode.object.value) : local(q.subject.value);
    const patterns = focusPattern(raw, q.subject);
    if (!patterns.length) continue;
    sparql.push({
      shape: shapeName,
      message: msg,
      query: select.replaceAll("$this", "?this"),
      focus: `SELECT DISTINCT ?f WHERE { ${patterns.map((p) => `{ ${p} }`).join(" UNION ")} }`,
    });
  }
  const shapes = parseStore(...texts);
  stripOwlImports(shapes);
  stripSparqlConstraints(shapes);
  wrapLogicalConstraints(shapes);
  entry = { shapes, sparql };
  shapeCache.set(key, entry);
  return entry;
}

/**
 * rdf-validate-shacl 0.6.5 checks sh:and / sh:or / sh:xone / sh:not of a property shape against the
 * focus node (with the outer path) instead of each value node, so a valid Registry passport fails
 * every {unit, value} constraint (pySHACL agrees with the Commission's examples). The shapes are
 * rewritten to equivalent forms the library evaluates correctly: an sh:and becomes one constraint
 * per member (sh:property for a property shape, sh:node for a node shape), so a result names the
 * member that failed; on a property shape the others move into a node shape its values must
 * conform to (sh:node).
 */
function wrapLogicalConstraints(shapes: Store): void {
  const path = DataFactory.namedNode(SH + "path");
  const node = DataFactory.namedNode(SH + "node");
  const property = DataFactory.namedNode(SH + "property");
  const and = DataFactory.namedNode(SH + "and");
  const members = (list: Quad["object"]): Quad["object"][] => {
    const out: Quad["object"][] = [];
    let cur = list;
    while (cur.value !== RDF + "nil") {
      const first = shapes.getQuads(cur, DataFactory.namedNode(RDF + "first"), null, null)[0];
      const rest = shapes.getQuads(cur, DataFactory.namedNode(RDF + "rest"), null, null)[0];
      if (!first || !rest) break;
      out.push(first.object);
      cur = rest.object;
    }
    return out;
  };
  for (const q of shapes.getQuads(null, and, null, null)) {
    const onProperty = shapes.getQuads(q.subject, path, null, null).length > 0;
    shapes.removeQuad(q);
    for (const m of members(q.object)) {
      const isProperty = shapes.getQuads(m, path, null, null).length > 0;
      if (!onProperty) {
        shapes.addQuad(q.subject, isProperty ? property : node, m);
      } else if (isProperty) {
        const wrapper = DataFactory.blankNode();
        shapes.addQuad(q.subject, node, wrapper);
        shapes.addQuad(wrapper, property, m);
      } else {
        shapes.addQuad(q.subject, node, m);
      }
    }
  }
  for (const kw of ["or", "xone", "not"]) {
    const pred = DataFactory.namedNode(SH + kw);
    for (const q of shapes.getQuads(null, pred, null, null)) {
      if (!shapes.getQuads(q.subject, path, null, null).length) continue;
      const wrapper = DataFactory.blankNode();
      shapes.removeQuad(q);
      shapes.addQuad(q.subject, node, wrapper);
      shapes.addQuad(wrapper, pred, q.object);
    }
  }
}

interface ShaclResult {
  severity?: { value: string };
  sourceConstraintComponent?: { value: string };
  sourceShape?: { value: string };
  path?: { value: string; termType: string };
  value?: { value: string };
  message?: { value: string }[];
  detail: ShaclResult[];
}

/**
 * "path component" of the innermost results under a result (sh:detail), or the result itself; a
 * hasValue result without a value node is marked "(none)". A sequence path is a blank node and
 * shows as "_".
 */
function leafComponents(r: ShaclResult): string[] {
  const path = r.path ? (r.path.termType === "BlankNode" ? "_" : local(r.path.value)) : "";
  const component = (r.sourceConstraintComponent?.value ?? "").replace(SH, "");
  const own = `${path} ${component}${component === "HasValueConstraintComponent" && !r.value ? " (none)" : ""}`;
  return r.detail.length ? r.detail.flatMap(leafComponents) : [own];
}

function vocabulary(): { store: ox.Store; nt: string } {
  if (!vocabStore) {
    vocabStore = new ox.Store();
    vocabStore.load(readFileSync(join(ROOT, "extensions/upstream/eu-dpp/ontology/eu-dpp.ttl"), "utf8"), { format: "text/turtle" });
    vocabNt = (vocabStore.query("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }") as ox.Quad[]).map((q) => q.toString() + " .").join("\n");
  }
  return { store: vocabStore, nt: vocabNt };
}

/**
 * Whether a shape or schema file applies to a view: the Registry splits a passport into views
 * (pub, res1 to res3), each file named after its view; files of no view (core, common) always apply.
 */
function inView(file: string, view?: string): boolean {
  const name = file.replace(/.*\//, "");
  return !view || !/^(pub|res\d)-/.test(name) || name.startsWith(`${view}-`);
}

/** The target's SHACL findings for a document, by the specifications it declares (and its view). */
export async function targetShapeFindings(p: Profile, quads: Quad[], view?: string): Promise<TargetFindings> {
  const bySpec = ((p as Profile & { targetShapes?: TargetShapes }).targetShapes?.bySpec) ?? {};
  const files = specsOf(p, quads).flatMap((s) => bySpec[s] ?? []).filter((f) => inView(f, view));
  if (!files.length) return { form: [], missing: [] };
  const { shapes, sparql } = loadShapes(files);
  const form: string[] = [];
  const missing: string[] = [];

  const data = new Store();
  data.addQuads(quads);
  const { nt } = vocabulary();
  data.addQuads(parseStore(nt).getQuads(null, null, null, null));
  const report = await new SHACLValidator(shapes).validate(data);
  for (const r of report.results as ShaclResult[]) {
    if ((r.severity?.value ?? SH + "Violation") !== SH + "Violation") continue;
    const component = (r.sourceConstraintComponent?.value ?? "").replace(SH, "");
    const leaves = leafComponents(r);
    const detail = r.detail.length ? ` [${[...new Set(leaves)].sort().join(", ")}]` : "";
    const line = `shacl ${r.path ? (r.path.termType === "BlankNode" ? "_" : local(r.path.value)) : local(r.sourceShape?.value ?? "")} ${component}: ${r.message?.[0]?.value ?? ""}${detail}`.replace(/\s+/g, " ").trim();
    // A missing value, also one inside a nested object: every leaf of the result a min count, or a
    // required value (sh:hasValue) with no value at all.
    (leaves.every((l) => /MinCount|HasValueConstraintComponent \(none\)/.test(l)) ? missing : form).push(line.replace(/ \(none\)/g, ""));
  }

  const store = new ox.Store();
  const w = new Writer({ format: "application/n-triples" });
  store.load(quads.map((q) => w.quadToString(q.subject, q.predicate, q.object)).join(""), { format: "application/n-triples" });
  store.load(nt, { format: "application/n-triples" });
  for (const c of sparql) {
    const focus = new Set((store.query(c.focus) as Map<string, ox.Term>[]).map((r) => r.get("f")!.toString()));
    if (!focus.size) continue;
    let rows: Map<string, ox.Term>[];
    try {
      rows = store.query(c.query) as Map<string, ox.Term>[];
    } catch (e) {
      form.push(`sparql ${c.shape}: query fails (${(e as Error).message.split("\n")[0]})`);
      continue;
    }
    for (const r of rows) {
      if (!focus.has(r.get("this")?.toString() ?? "")) continue;
      const v = r.get("value") ?? r.get("path");
      form.push(`sparql ${c.shape}: ${c.message}${v ? ` (${v.termType === "Literal" ? JSON.stringify(v.value) : local(v.value)})` : ""}`);
    }
  }
  return { form: [...new Set(form)].sort(), missing: [...new Set(missing)].sort() };
}

// ---------------------------------------------------------------- JSON Schema

let ajv: InstanceType<typeof Ajv2020> | undefined;

/** Every JSON Schema of the vendored release. */
function schemaFiles(p: Profile): string[] {
  const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
    const full = join(dir, f);
    return statSync(full).isDirectory() ? walk(full) : f.endsWith(".schema.json") ? [full] : [];
  });
  return walk(join(ROOT, cfg(p).conformance)).sort();
}

function schemaValidator(p: Profile): InstanceType<typeof Ajv2020> {
  if (ajv) return ajv;
  const c = cfg(p);
  ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const f of schemaFiles(p)) {
    const schema = JSON.parse(readFileSync(f, "utf8"));
    if (!ajv.getSchema(schema.$id)) ajv.addSchema(schema);
  }
  return ajv;
}

/** The target's JSON Schema findings for a document, by the specifications it declares (and its view). */
export function jsonSchemaFindings(p: Profile, doc: Record<string, unknown>, view?: string): TargetFindings {
  const c = cfg(p);
  const v = schemaValidator(p);
  const form: string[] = [];
  const missing: string[] = [];
  for (const spec of specsOf(p, doc)) {
    for (const file of (c.schemas[spec] ?? []).filter((f) => inView(f, view))) {
      const schema = JSON.parse(readFileSync(join(ROOT, c.conformance, file), "utf8"));
      const validateFn = v.getSchema(schema.$id) ?? v.compile(schema);
      if (validateFn(doc)) continue;
      const name = file.replace(/.*\//, "").replace(".schema.json", "");
      for (const e of validateFn.errors ?? []) {
        const line = `schema ${name} ${e.instancePath || "/"} ${e.keyword}: ${e.message}`;
        (e.keyword === "required" || e.keyword === "dependentRequired" ? missing : form).push(line);
      }
    }
  }
  return { form: [...new Set(form)].sort(), missing: [...new Set(missing)].sort() };
}
