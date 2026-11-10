/**
 * Crosswalk engine: converts between the OpenEPCIS DPP vocabulary and another DPP vocabulary
 * (CIRPASS-2 first; BatteryPass and DPP Keystone use the same machinery) with declarative
 * SPARQL CONSTRUCT rules, in both directions.
 *
 * A profile lives in extensions/common/interop/crosswalk/<id>/:
 *   profile.json     id, title, prefixes, background ontologies, rule folders, handled terms
 *   mappings.ttl     the pairing tables the rules read (codes, classes, units, preferred units)
 *   lift/*.rq        OpenEPCIS → target   (applied in file order, results unioned)
 *   lower/*.rq       target → OpenEPCIS
 *   <dir>/entail/*.ru  SPARQL updates run first, adding to the input graph what it leaves
 *                      implicit (types of EPCIS master data without "type")
 *   tests/<case>/    round-trip cases, checked by scripts/check-crosswalk.ts
 *
 * The store holds three named graphs: <urn:xw:in> (the document being converted),
 * <urn:xw:bg> (background ontologies: class/property hierarchy, method and criterion
 * individuals) and <urn:xw:map> (mappings.ttl). The default graph is their union, so rules
 * anchor on the input with GRAPH <urn:xw:in> { … } and read hierarchy and tables anywhere.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { DataFactory, Parser, Writer, type Quad } from "n3";
import jsonld from "jsonld";
import * as ox from "oxigraph";

export const ROOT = resolve(import.meta.dirname, "..", "..");
export const CROSSWALK_DIR = join(ROOT, "extensions/common/interop/crosswalk");
export const G_IN = "urn:xw:in";
export const G_BG = "urn:xw:bg";
export const G_MAP = "urn:xw:map";

export type Direction = "lift" | "lower";

export interface Profile {
  id: string;
  title: string;
  dir: string;
  prefixes: Record<string, string>;
  /** Repo-relative Turtle files loaded into the background graph, per direction. */
  background: { lift: string[]; lower: string[] };
  /** Namespace or IRI prefixes whose terms the rules of each direction handle (for the loss report). */
  handles: { lift: string[]; lower: string[] };
  /** Terms an output of each direction may use as predicate or class (files define them, namespaces admit them). */
  vocabulary: Record<Direction, { files: string[]; namespaces: string[] }>;
  /** SHACL shapes the OpenEPCIS side (input of lift, output of lower) must satisfy. */
  shapes: { files: string[] };
  /** Findings of the OWL structure check of the target side that a gap of the target makes unavoidable. */
  structure?: { accepted: { gap: number; match: string; reason: string }[] };
}

/** Every OpenEPCIS module ontology (extensions/<area>/<module>/ontology/*.ttl, no access levels). */
export function moduleOntologies(): string[] {
  const out: string[] = [];
  for (const area of ["common", "eu", "us"]) {
    const base = join(ROOT, "extensions", area);
    if (!existsSync(base)) continue;
    for (const m of readdirSync(base).sort()) {
      const dir = join(base, m, "ontology");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir).sort()) {
        if (f.endsWith(".ttl") && !f.includes("access-levels")) out.push(join("extensions", area, m, "ontology", f));
      }
    }
  }
  return out;
}

/** The SHACL shapes of every OpenEPCIS module (validation/<ontology name>-shapes.ttl). */
export function moduleShapes(): string[] {
  return moduleOntologies()
    .map((f) => f.replace(/\/ontology\/([^/]+)\.ttl$/, "/validation/$1-shapes.ttl"))
    .filter((f) => existsSync(join(ROOT, f)));
}

/** "@modules" in a file list stands for every OpenEPCIS module ontology, "@shapes" for their shapes. */
function expand(files: string[]): string[] {
  return [...new Set(files.flatMap((f) => (f === "@modules" ? moduleOntologies() : f === "@shapes" ? moduleShapes() : [f])))];
}

export function loadProfile(id: string): Profile {
  const dir = join(CROSSWALK_DIR, id);
  const raw = JSON.parse(readFileSync(join(dir, "profile.json"), "utf8"));
  raw.background = { lift: expand(raw.background.lift), lower: expand(raw.background.lower) };
  for (const d of ["lift", "lower"] as const) raw.vocabulary[d].files = expand(raw.vocabulary[d].files);
  raw.shapes.files = expand(raw.shapes.files);
  return { ...raw, dir };
}

export function listProfiles(): string[] {
  return readdirSync(CROSSWALK_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(CROSSWALK_DIR, d.name, "profile.json")))
    .map((d) => d.name)
    .sort();
}

/** Parse Turtle / N-Triples text into n3 quads. */
export function parseTurtle(text: string, baseIRI?: string): Quad[] {
  return new Parser({ baseIRI }).parse(text);
}

/** Expand a JSON-LD document to quads with the repository's offline document loader. */
export async function jsonldToQuads(doc: unknown): Promise<Quad[]> {
  const { offlineDocumentLoader } = await import("./jsonld-loader.ts");
  const nq = (await jsonld.toRDF(doc as never, {
    format: "application/n-quads",
    documentLoader: (await offlineDocumentLoader()) as never,
  })) as unknown as string;
  return new Parser({ format: "application/n-quads" }).parse(nq);
}

/** Load a converter input: .jsonld / .json through JSON-LD, anything else as Turtle. */
export async function loadInput(path: string): Promise<Quad[]> {
  const text = readFileSync(path, "utf8");
  if (/\.json(ld)?$/.test(path)) return jsonldToQuads(JSON.parse(text));
  return parseTurtle(text);
}

function toNQuads(quads: Quad[], graph?: string): string {
  const w = new Writer({ format: "application/n-quads" });
  const g = graph ? `<${graph}>` : "";
  // n3's writer drops the graph term when asked for N-Triples-like output, so build lines here.
  return quads
    .map((q) => w.quadToString(q.subject, q.predicate, q.object).replace(/ \.\n$/, ` ${g} .\n`))
    .join("");
}

function prefixBlock(p: Profile): string {
  return Object.entries(p.prefixes).map(([k, v]) => `PREFIX ${k}: <${v}>`).join("\n") + "\n";
}

function ruleFiles(p: Profile, dir: Direction): string[] {
  const d = join(p.dir, dir);
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => f.endsWith(".rq")).sort().map((f) => join(d, f));
}

export interface RuleRun {
  rule: string;
  triples: number;
}

export interface Conversion {
  quads: Quad[];
  /** Statements the entail rules added to the input (the round trip is compared with input + these). */
  entailed: Quad[];
  rules: RuleRun[];
  /** Input predicates (and rdf:type objects) outside the profile's handled namespaces: not converted. */
  unhandled: Map<string, number>;
}

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

function handled(iri: string, prefixes: string[]): boolean {
  return prefixes.some((p) => iri.startsWith(p));
}

/** JSON-LD background files (e.g. the vendored GS1 Web Vocabulary) as N-Triples, parsed once. */
const jsonldBackground = new Map<string, string>();

/**
 * Prepare the background files of a profile that are not Turtle. Call once before convert();
 * Turtle files need no preparation.
 */
export async function loadBackground(p: Profile): Promise<void> {
  const w = new Writer({ format: "application/n-triples" });
  for (const f of [...p.background.lift, ...p.background.lower]) {
    if (!/\.json(ld)?$/.test(f) || jsonldBackground.has(f)) continue;
    const quads = await jsonldToQuads(JSON.parse(readFileSync(join(ROOT, f), "utf8")));
    jsonldBackground.set(f, quads.map((q) => w.quadToString(q.subject, q.predicate, q.object)).join(""));
  }
}

/**
 * Background and mapping graphs per profile and direction, loaded once: parsing every module
 * ontology dominates a conversion. Only the input graph changes between conversions.
 */
const storeCache = new Map<string, ox.Store>();

/** The store a direction's rules run against: input, background and mapping graphs. */
export function buildStore(p: Profile, direction: Direction, input: Quad[]): ox.Store {
  const key = `${p.dir}:${direction}`;
  let store = storeCache.get(key);
  if (!store) {
    store = loadBackgroundStore(p, direction);
    storeCache.set(key, store);
  }
  store.update(`DROP SILENT GRAPH <${G_IN}>`);
  store.load(toNQuads(input, G_IN), { format: "application/n-quads" });
  return store;
}

function loadBackgroundStore(p: Profile, direction: Direction): ox.Store {
  const store = new ox.Store();
  for (const f of p.background[direction]) {
    if (/\.json(ld)?$/.test(f)) {
      const nt = jsonldBackground.get(f);
      if (nt === undefined) throw new Error(`background ${f} is JSON-LD: call loadBackground(profile) first`);
      store.load(nt, { format: "application/n-triples", to_graph_name: ox.namedNode(G_BG) });
      continue;
    }
    store.load(readFileSync(join(ROOT, f), "utf8"), { format: "text/turtle", to_graph_name: ox.namedNode(G_BG) });
  }
  store.load(readFileSync(join(p.dir, "mappings.ttl"), "utf8"), { format: "text/turtle", to_graph_name: ox.namedNode(G_MAP) });
  return store;
}

/** Ad-hoc query against a direction's store (debugging rules): rows as "var=value" lines. */
export function debugQuery(p: Profile, direction: Direction, input: Quad[], query: string): string[] {
  const res = buildStore(p, direction, input).query(prefixBlock(p) + query, { use_default_graph_as_union: true }) as unknown;
  if (!Array.isArray(res)) return [String(res)];
  return res.map((row: unknown) =>
    row instanceof Map ? [...row].map(([k, v]) => `${k}=${(v as ox.Term).value}`).join("  ") : String(row));
}

/**
 * Terms a profile handles by name: every IRI its rules or the mapping table mention, prefixed
 * names expanded with the profile prefixes. A term no rule names is reported as not converted.
 */
function namedTerms(p: Profile, direction: Direction): Set<string> {
  // Both directions: a class the rules of one direction produce is the one the other direction
  // reads by its properties, without naming the class again.
  void direction;
  // Comments do not count: a term a comment mentions is not converted by naming it.
  const text = [...ruleFiles(p, "lift"), ...ruleFiles(p, "lower"), join(p.dir, "mappings.ttl")]
    .map((f) => readFileSync(f, "utf8").replace(/(^|\s)#.*$/gm, "$1")).join("\n");
  const out = new Set<string>();
  for (const m of text.matchAll(/<(https?:[^>\s]+)>/g)) out.add(m[1]);
  for (const m of text.matchAll(/(?<![\w:/#-])([A-Za-z][\w-]*):([A-Za-z_][\w.-]*[\w-])/g)) {
    const ns = p.prefixes[m[1]];
    if (ns) out.add(ns + m[2]);
  }
  return out;
}

const XSD = "http://www.w3.org/2001/XMLSchema#";
const RDFS_RANGE = "http://www.w3.org/2000/01/rdf-schema#range";

/**
 * Properties of a direction's output vocabulary whose range is xsd:dateTimeStamp. Oxigraph
 * normalises a valid xsd:dateTimeStamp literal to xsd:dateTime; the engine types it back.
 */
const stampRanges = new Map<string, Set<string>>();
function dateTimeStampProperties(p: Profile, direction: Direction): Set<string> {
  const key = `${p.id}:${direction}`;
  let set = stampRanges.get(key);
  if (!set) {
    set = new Set();
    for (const f of p.vocabulary[direction].files) for (const q of parseTurtle(readFileSync(join(ROOT, f), "utf8"))) {
      if (q.predicate.value === RDFS_RANGE && q.object.value === XSD + "dateTimeStamp") set.add(q.subject.value);
    }
    stampRanges.set(key, set);
  }
  return set;
}

/** Run one direction of a profile over the input quads. */
export function convert(p: Profile, direction: Direction, input: Quad[]): Conversion {
  const store = buildStore(p, direction, input);
  const prefixes = prefixBlock(p);
  const entailed: Quad[] = [];
  const entailDir = join(p.dir, direction, "entail");
  if (existsSync(entailDir)) {
    // Inside the store: blank nodes keep their identity. What was added is read back as a diff.
    const dump = () => (store.query(`CONSTRUCT { ?s ?p ?o } WHERE { GRAPH <${G_IN}> { ?s ?p ?o } }`) as ox.Quad[])
      .map((q) => q.toString() + " .");
    const before = new Set(dump());
    for (const f of readdirSync(entailDir).filter((x) => x.endsWith(".ru")).sort()) {
      try {
        store.update(prefixes + readFileSync(join(entailDir, f), "utf8"), { use_default_graph_as_union: true });
      } catch (e) {
        throw new Error(`${join(entailDir, f)}: ${(e as Error).message}`);
      }
    }
    const added = dump().filter((l) => !before.has(l)).join("\n");
    if (added) entailed.push(...new Parser({ format: "application/n-triples", blankNodePrefix: "" }).parse(added));
  }
  const seen = new Set<string>();
  const out: Quad[] = [];
  const rules: RuleRun[] = [];
  const writer = new Writer({ format: "application/n-triples" });
  for (const file of ruleFiles(p, direction)) {
    const query = prefixes + readFileSync(file, "utf8");
    let result: ox.Quad[];
    const started = Date.now();
    try {
      result = store.query(query, { use_default_graph_as_union: true }) as ox.Quad[];
      if (process.env.CROSSWALK_PROFILE_RULES) console.error(`${Date.now() - started} ms ${file.slice(p.dir.length + 1)}`);
    } catch (e) {
      throw new Error(`${file}: ${(e as Error).message}`);
    }
    const nt = result.map((q) => q.toString() + " .").join("\n");
    // Keep the store's blank-node labels: every rule must address the same node with the same
    // label, or a node splits into one per rule.
    const stamps = dateTimeStampProperties(p, direction);
    const quads = (nt ? new Parser({ format: "application/n-triples", blankNodePrefix: "" }).parse(nt) : []).map((q) =>
      q.object.termType === "Literal" && q.object.datatype.value === XSD + "dateTime" && stamps.has(q.predicate.value)
        ? DataFactory.quad(q.subject, q.predicate, DataFactory.literal(q.object.value, DataFactory.namedNode(XSD + "dateTimeStamp")))
        : q);
    let added = 0;
    for (const q of quads) {
      const key = writer.quadToString(q.subject, q.predicate, q.object);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(q);
      added++;
    }
    rules.push({ rule: file.slice(p.dir.length + 1), triples: added });
  }

  const unhandled = new Map<string, number>();
  const ok = p.handles[direction];
  const named = namedTerms(p, direction);
  for (const q of input) {
    const key = q.predicate.value === RDF_TYPE ? `a ${q.object.value}` : q.predicate.value;
    const iri = q.predicate.value === RDF_TYPE ? q.object.value : q.predicate.value;
    if (!named.has(iri) && !handled(iri, ok)) unhandled.set(key, (unhandled.get(key) ?? 0) + 1);
  }
  return { quads: out, entailed, rules, unhandled };
}

const OPENEPCIS_EXT = "https://ref.openepcis.org/extensions/";
const EPCIS_CONTEXT = "https://ref.gs1.org/standards/epcis/epcis-context.jsonld";

/**
 * The published JSON-LD contexts an OpenEPCIS document uses: the EPCIS context when it has EPCIS
 * statements, then the context of every module whose namespace it uses (the core's first; module
 * contexts import it). A module's context is extensions/<area>/<module>/context/<name>-context.jsonld,
 * served at https://ref.openepcis.org/extensions/<area>/<module>/<name>-context.jsonld.
 */
export function contextsFor(quads: Quad[]): string[] {
  const used = new Set<string>();
  for (const q of quads) {
    for (const iri of [q.predicate.value, q.predicate.value === RDF_TYPE ? q.object.value : ""]) {
      if (iri.startsWith(OPENEPCIS_EXT)) used.add(iri.slice(OPENEPCIS_EXT.length).split("/").slice(0, 2).join("/"));
      if (iri.startsWith("https://ref.gs1.org/epcis/")) used.add("epcis");
    }
  }
  const out: string[] = used.has("epcis") ? [EPCIS_CONTEXT] : [];
  const modules = [...used].filter((m) => m !== "epcis").sort((a, b) => (a === "common/core" ? -1 : b === "common/core" ? 1 : a.localeCompare(b)));
  if (!modules.includes("common/core")) modules.unshift("common/core");
  for (const m of modules) {
    const dir = join(ROOT, "extensions", m, "context");
    if (!existsSync(dir)) continue;
    const file = readdirSync(dir).find((f) => /^[\w-]+-context\.jsonld$/.test(f) && !/(shortcut|operational|bridge)/.test(f));
    if (file) out.push(`${OPENEPCIS_EXT}${m}/${file}`);
  }
  return out;
}

/** An OpenEPCIS-side conversion result as JSON-LD, compacted with the published contexts. */
export async function toOursJsonLd(quads: Quad[]): Promise<Record<string, unknown>> {
  const { offlineDocumentLoader } = await import("./jsonld-loader.ts");
  const w = new Writer({ format: "application/n-quads" });
  const sorted = [...quads].sort((a, b) =>
    (a.subject.value + a.predicate.value + a.object.value).localeCompare(b.subject.value + b.predicate.value + b.object.value));
  const expanded = await jsonld.fromRDF(sorted.map((q) => w.quadToString(q.subject, q.predicate, q.object)).join("") as never,
    { format: "application/n-quads" });
  return (await jsonld.compact(expanded, { "@context": contextsFor(quads) } as never,
    { documentLoader: (await offlineDocumentLoader()) as never })) as Record<string, unknown>;
}

/** Serialise quads as Turtle with the profile's prefixes, triples sorted for stable output. */
export async function toTurtle(quads: Quad[], prefixes: Record<string, string>): Promise<string> {
  const writer = new Writer({ prefixes });
  const sorted = [...quads].sort((a, b) =>
    (a.subject.value + a.predicate.value + a.object.value).localeCompare(b.subject.value + b.predicate.value + b.object.value),
  );
  writer.addQuads(sorted);
  return new Promise((res, rej) => writer.end((e, r) => (e ? rej(e) : res(r))));
}

const NUMERIC = new Set(["double", "float", "decimal", "integer", "int", "long", "nonNegativeInteger", "positiveInteger"].map((t) => XSD + t));

/**
 * The quads with numeric literals in one spelling per value ("24000"^^xsd:double and
 * "2.4E4"^^xsd:double are the same literal value): for comparing documents whose serialisers
 * write numbers differently, such as a JSON-LD round trip.
 */
export function sameValueSpelling(quads: Quad[]): Quad[] {
  return quads.map((q) => {
    const o = q.object;
    if (o.termType !== "Literal" || !NUMERIC.has(o.datatype.value) || !Number.isFinite(Number(o.value))) return q;
    return DataFactory.quad(q.subject, q.predicate, DataFactory.literal(String(Number(o.value)), o.datatype));
  });
}

/** RDFC-1.0 canonical N-Quads of a quad set: equal strings ⇔ isomorphic graphs. */
export async function canonical(quads: Quad[]): Promise<string> {
  const w = new Writer({ format: "application/n-quads" });
  const nq = quads.map((q) => w.quadToString(q.subject, q.predicate, q.object)).join("");
  return (await jsonld.canonize(nq as never, {
    algorithm: "RDFC-1.0",
    inputFormat: "application/n-quads",
    format: "application/n-quads",
  } as never)) as unknown as string;
}

/**
 * Structural difference between two graphs that is stable under blank-node relabelling:
 * per predicate (rdf:type per class), how many more triples A has than B. Used for loss reports.
 */
export function predicateDelta(a: Quad[], b: Quad[]): Map<string, number> {
  const count = (qs: Quad[]) => {
    const m = new Map<string, number>();
    for (const q of qs) {
      const k = q.predicate.value === RDF_TYPE ? `a ${q.object.value}` : q.predicate.value;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  const ca = count(a), cb = count(b);
  const out = new Map<string, number>();
  for (const k of new Set([...ca.keys(), ...cb.keys()])) {
    const d = (ca.get(k) ?? 0) - (cb.get(k) ?? 0);
    if (d !== 0) out.set(k, d);
  }
  return new Map([...out.entries()].sort((x, y) => x[0].localeCompare(y[0])));
}

/** Predicates and classes an output uses that its direction's vocabulary does not define. */
export function vocabularyLeaks(p: Profile, direction: Direction, quads: Quad[]): string[] {
  const v = p.vocabulary[direction];
  const defined = new Set<string>();
  for (const f of v.files) for (const q of parseTurtle(readFileSync(join(ROOT, f), "utf8"))) {
    if (q.subject.termType === "NamedNode") defined.add(q.subject.value);
  }
  const ok = (iri: string) => defined.has(iri) || v.namespaces.some((ns) => iri.startsWith(ns));
  const leaks = new Set<string>();
  for (const q of quads) {
    if (!ok(q.predicate.value)) leaks.add(q.predicate.value);
    if (q.predicate.value === RDF_TYPE && q.object.termType === "NamedNode" && !ok(q.object.value)) leaks.add(`a ${q.object.value}`);
  }
  return [...leaks].sort();
}
