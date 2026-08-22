/**
 * EN 18223 DPP serializations, all projections of one canonical RDF graph.
 *
 * JSON dialects:
 *   - compressed (EN 18223 §5.2, also written "operational"): the compact master-data
 *       body keyed by elementId.
 *       operationalJsonLd -> the body + the single operational @context IRI, always
 *         carrying it (self-describing JSON-LD that expands to the product RDF, and
 *         still plain JSON — there is no context-less variant).
 *   - expanded (Annex A) lives in derive-core.ts.
 *
 * RDF serializations (from jsonld.toRDF, so guaranteed graph-consistent with the
 * JSON-LD): Turtle, N-Quads, N-Triples. TTL round-trips (parse-back canonicalises
 * to the same graph) — see scripts/en18223/roundtrip-check.ts.
 *
 * The `jsonld`/`n3` deps make this Node-side; the browser demo uses the same
 * jsonld.toRDF for its RDF views.
 */
import jsonld from "jsonld";
import n3 from "n3";
import {
  deriveEN18223,
  compressEN18223,
  normalizeLanguageMaps,
  type DocumentLoader,
  type CompressOptions,
} from "./derive-core.ts";

// EN 18223 header (envelope) fields in standard order; the top-level keys of a
// compressed passport are emitted in this order, everything else sorted.
const ENVELOPE_ORDER = [
  "digitalProductPassportId", "uniqueProductIdentifier", "granularity",
  "dppSchemaVersion", "dppStatus", "lastUpdated", "economicOperatorId",
  "facilityId", "contentSpecificationIds",
];

const EXT = "https://ref.openepcis.io/extensions";
export const OPERATIONAL_CONTEXT_URL = `${EXT}/common/core/dpp-operational-context.jsonld`;

// Regulation module -> its operational context (base + module vocabulary). A DPP
// carries the operational context(s) of the module(s) its data actually uses; a
// battery passport resolves battery terms without dragging in textile/electronics.
const MODULE_OPERATIONAL: Record<string, string> = {
  "eu/battery": `${EXT}/eu/battery/battery-operational-context.jsonld`,
  "eu/textile": `${EXT}/eu/textile/textile-operational-context.jsonld`,
  "eu/electronics": `${EXT}/eu/electronics/electronics-operational-context.jsonld`,
  "eu/eudr": `${EXT}/eu/eudr/eudr-operational-context.jsonld`,
  "eu/ppwr": `${EXT}/eu/ppwr/ppwr-operational-context.jsonld`,
  "eu/cpr": `${EXT}/eu/cpr/cpr-operational-context.jsonld`,
  "eu/detergent": `${EXT}/eu/detergent/detergent-operational-context.jsonld`,
  "eu/iron-steel": `${EXT}/eu/iron-steel/iron-steel-operational-context.jsonld`,
  "us/fsma204": `${EXT}/us/fsma204/fsma204-operational-context.jsonld`,
};

/** The operational @context value for a master-data body: the module operational
 *  context when it uses exactly one module, an array when it uses several, else
 *  the base. Detected from the module context URLs the body's @context lists. */
export function operationalContextFor(master: any): string | string[] {
  const ctx = master["@context"];
  const entries = Array.isArray(ctx) ? ctx : ctx ? [ctx] : [];
  const mods: string[] = [];
  for (const e of entries) {
    if (typeof e !== "string") continue;
    for (const key of Object.keys(MODULE_OPERATIONAL)) {
      if (e.includes(`/extensions/${key}/`) && !mods.includes(key)) mods.push(key);
    }
  }
  const urls = mods.map((k) => MODULE_OPERATIONAL[k]);
  if (urls.length === 0) return OPERATIONAL_CONTEXT_URL;
  return urls.length === 1 ? urls[0] : urls;
}

const PREFIXES: Record<string, string> = {
  gs1: "https://ref.gs1.org/voc/",
  oec: "https://ref.openepcis.io/extensions/common/core/",
  eubat: "https://ref.openepcis.io/extensions/eu/battery/",
  eutex: "https://ref.openepcis.io/extensions/eu/textile/",
  eudr: "https://ref.openepcis.io/extensions/eu/eudr/",
  euppwr: "https://ref.openepcis.io/extensions/eu/ppwr/",
  eucpr: "https://ref.openepcis.io/extensions/eu/cpr/",
  eudet: "https://ref.openepcis.io/extensions/eu/detergent/",
  euelec: "https://ref.openepcis.io/extensions/eu/electronics/",
  eusteel: "https://ref.openepcis.io/extensions/eu/iron-steel/",
  usfsma: "https://ref.openepcis.io/extensions/us/fsma204/",
  schema: "https://schema.org/",
  // SEMICeu Core Vocabularies: one namespace, two conventional spellings. Both are
  // needed in the expansion direction, because a curated shortcut alias may name
  // either (`cccev:Evidence`, `cv:PublicOrganisation`) and buildOperationalKeyMap
  // keys the dictionary by the expanded IRI. `cccev` sits first so the CURIE
  // direction is deterministic and matches the Java port's insertion order.
  cccev: "http://data.europa.eu/m8g/",
  cv: "http://data.europa.eu/m8g/",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
};

// namespace IRI -> prefix, longest namespace first (greedy CURIE fallback). The
// sort is stable, so two prefixes sharing one namespace resolve to whichever comes
// first in PREFIXES — the same tie-break the Java port's insertion order gives.
const NS_PREFIX: Array<[string, string]> = Object.entries(PREFIXES)
  .map(([p, ns]) => [ns, p] as [string, string])
  .sort((a, b) => b[0].length - a[0].length);
const toCurie = (iri: string): string => {
  for (const [ns, p] of NS_PREFIX) if (iri.startsWith(ns)) return `${p}:${iri.slice(ns.length)}`;
  return iri;
};
const expandCurie = (iri: string): string => {
  const i = iri.indexOf(":");
  if (i > 0) {
    const p = iri.slice(0, i);
    if (PREFIXES[p]) return PREFIXES[p] + iri.slice(i + 1);
  }
  return iri;
};

const localNameOf = (iri: string): string => {
  const i = Math.max(iri.lastIndexOf("/"), iri.lastIndexOf("#"));
  return i >= 0 ? iri.slice(i + 1) : iri;
};

/** The resolved operational data-dictionary.
 *
 *  `keyMap` holds the top-level aliases; `scopedKeyMap` holds the aliases a
 *  TYPE-SCOPED `@context` contributes, keyed by the class IRI it hangs on. One
 *  property IRI legitimately carries several aliases (schema:category is
 *  `deviceCategory`, `weeeCategory`, `batteryCategory`, `materialCategory`, …),
 *  each scoping its own enum, so a flat IRI->alias map cannot express the
 *  dictionary: it picks one alias for every occurrence and emits codes the
 *  chosen alias does not enumerate, which expand to relative IRIs.
 *  `vocabProps` is likewise per scope, because the coercion travels with the
 *  alias, not with the IRI. */
export interface OperationalDictionary {
  keyMap: Map<string, string>;
  vocabProps: Set<string>;
  scopedKeyMap: Map<string, Map<string, string>>;
  scopedVocabProps: Map<string, Set<string>>;
  /** Every top-level alias of a property IRI, in chain order, with the code
   *  IRIs its own enum lists. Lets the key be chosen against the value. */
  aliases: Map<string, Array<{ term: string; codes: Set<string> }>>;
}

// Walk an @context value (array / IRI to load / inline object), collecting bare
// (unprefixed) term -> full-IRI aliases and the IRIs of @vocab-coerced properties.
// `scoped` accumulates the same two things per class IRI for type-scoped contexts.
async function collectAliases(
  ctxValue: any,
  documentLoader: DocumentLoader,
  acc: Array<[string, string]>,
  vocab: Set<string>,
  scoped: Array<[string, string, string, boolean]>,
  enums: Array<[string, string, Set<string>]>,
): Promise<void> {
  if (Array.isArray(ctxValue)) {
    for (const c of ctxValue) await collectAliases(c, documentLoader, acc, vocab, scoped, enums);
    return;
  }
  if (typeof ctxValue === "string") {
    const doc = (await documentLoader(ctxValue)).document;
    await collectAliases(doc["@context"], documentLoader, acc, vocab, scoped, enums);
    return;
  }
  if (ctxValue && typeof ctxValue === "object") {
    for (const [term, def] of Object.entries(ctxValue)) {
      if (term.startsWith("@") || term.includes(":")) continue;
      if (typeof def === "string") {
        acc.push([term, expandCurie(def)]);
        continue;
      }
      if (def && typeof def === "object") {
        const iri = (def as any)["@id"];
        if (iri) acc.push([term, expandCurie(iri as string)]);
        if ((def as any)["@type"] === "@vocab") {
          // @vocab-coerced property: its coded values are safe to emit as bare
          // codes (they re-expand via @vocab). Record the property, and descend
          // any scoped @context enumerating the codes. @id-typed terms are NOT
          // descended: their references must stay full IRIs to round-trip.
          if (iri) vocab.add(expandCurie(iri as string));
          if ((def as any)["@context"]) {
            const codes = new Set<string>();
            const sub: Array<[string, string]> = [];
            await collectAliases((def as any)["@context"], documentLoader, sub, vocab, scoped, enums);
            for (const [, codeIri] of sub) codes.add(codeIri);
            acc.push(...sub);
            if (iri) enums.push([term, expandCurie(iri as string), codes]);
          }
        } else if ((def as any)["@context"] && iri) {
          // A TYPE-SCOPED context: a class term carrying the aliases that apply
          // only inside a node of that type. Its entries must NOT land in the
          // top-level map, or they would leak onto every node in the document.
          collectScoped(expandCurie(iri as string), (def as any)["@context"], scoped);
        }
      }
    }
  }
}

// Entries of a type-scoped @context. Only inline definitions are read: a scoped
// context that referenced a remote document would change what a bare key means
// depending on network state, which the operational form must not do.
function collectScoped(
  classIri: string,
  ctx: any,
  scoped: Array<[string, string, string, boolean]>,
): void {
  if (!ctx || typeof ctx !== "object" || Array.isArray(ctx)) return;
  for (const [term, def] of Object.entries(ctx)) {
    if (term.startsWith("@") || term.includes(":")) continue;
    if (typeof def === "string") {
      scoped.push([classIri, term, expandCurie(def), false]);
      continue;
    }
    if (def && typeof def === "object") {
      const iri = (def as any)["@id"];
      if (!iri) continue;
      const isVocab = (def as any)["@type"] === "@vocab";
      scoped.push([classIri, term, expandCurie(iri as string), isVocab]);
      // The enum this scoped alias carries. Collected under the same class so a
      // coded value whose context key differs from its local name still compacts
      // to the key the scoped enum actually defines.
      if (isVocab && (def as any)["@context"]) collectScoped(classIri, (def as any)["@context"], scoped);
    }
  }
}

/** Resolve the operational context chain to its data dictionary.
 *
 *  Where one property IRI has several top-level aliases, the FIRST in chain
 *  order wins, which is the alias set this repository already publishes.
 *  A blind first-wins is what produced the bug, though: on a laptop (whose
 *  master lists the battery context before the electronics one, because a
 *  laptop has a battery) `schema:category` took the battery alias, and the
 *  device code the battery enum does not list expanded to a relative IRI.
 *  So the choice is VALUE-DIRECTED: among the aliases of one IRI, an alias
 *  whose enum actually lists the code being emitted beats one that does not.
 *  That fixes the selection without renaming the aliases that were never
 *  ambiguous, which a switch to last-wins would have done wholesale. */
export async function buildOperationalKeyMap(
  operationalContext: string | string[],
  documentLoader: DocumentLoader,
): Promise<OperationalDictionary> {
  const defs: Array<[string, string]> = [];
  const vocabProps = new Set<string>();
  const scoped: Array<[string, string, string, boolean]> = [];
  const enums: Array<[string, string, Set<string>]> = [];
  await collectAliases(operationalContext, documentLoader, defs, vocabProps, scoped, enums);
  const keyMap = new Map<string, string>();
  for (const [term, iri] of defs) if (!keyMap.has(iri)) keyMap.set(iri, term);
  const aliases = new Map<string, Array<{ term: string; codes: Set<string> }>>();
  const codesOf = new Map<string, Set<string>>();
  for (const [term, iri, codes] of enums) codesOf.set(`${term}|${iri}`, codes);
  for (const [term, iri] of defs) {
    if (!aliases.has(iri)) aliases.set(iri, []);
    const list = aliases.get(iri)!;
    if (!list.some((a) => a.term === term)) {
      list.push({ term, codes: codesOf.get(`${term}|${iri}`) ?? new Set() });
    }
  }
  const scopedKeyMap = new Map<string, Map<string, string>>();
  const scopedVocabProps = new Map<string, Set<string>>();
  for (const [classIri, term, iri, isVocab] of scoped) {
    if (!scopedKeyMap.has(classIri)) scopedKeyMap.set(classIri, new Map());
    scopedKeyMap.get(classIri)!.set(iri, term);
    if (isVocab) {
      if (!scopedVocabProps.has(classIri)) scopedVocabProps.set(classIri, new Set());
      scopedVocabProps.get(classIri)!.add(iri);
    }
  }
  return { keyMap, vocabProps, scopedKeyMap, scopedVocabProps, aliases };
}

/** Compress options from the resolved operational dictionary. `term` (keys /
 *  `type` values): the context alias for an IRI, else its CURIE. `codeTerm`
 *  (coded values of @vocab properties): the enum alias, else the bare local name
 *  — both re-expand via @vocab and satisfy the JSON-Schema enum. `isVocabProperty`
 *  gates which reference values are compacted, so @id references keep full IRIs.
 *  Together they make the compressed body round-trip (GET == valid PUT). */
export function operationalOptions(dict: OperationalDictionary): CompressOptions {
  const { keyMap, vocabProps, scopedKeyMap, scopedVocabProps, aliases } = dict;
  // A type-scoped entry beats the top level; among several node types the first
  // in document order wins, so the emitted key is deterministic and the output
  // stays byte-stable.
  const inScope = (iri: string, scope?: string[]): string | undefined => {
    if (!scope) return undefined;
    for (const t of scope) {
      const hit = scopedKeyMap.get(t)?.get(iri);
      if (hit !== undefined) return hit;
    }
    return undefined;
  };
  // Among the top-level aliases of one IRI: the first whose own enum lists the
  // code about to be emitted, else the first alias. Without the value the two
  // rules coincide, so only genuinely ambiguous keys move.
  const topLevel = (iri: string, valueIri?: string): string | undefined => {
    const list = aliases.get(iri);
    if (!list || list.length === 0) return keyMap.get(iri);
    if (valueIri && list.length > 1) {
      const fit = list.find((a) => a.codes.has(valueIri));
      if (fit) return fit.term;
    }
    return list[0].term;
  };
  return {
    term: (iri: string, scope?: string[], valueIri?: string) =>
      inScope(iri, scope) ?? topLevel(iri, valueIri) ?? toCurie(iri),
    codeTerm: (iri: string, scope?: string[]) => inScope(iri, scope) ?? keyMap.get(iri) ?? localNameOf(iri),
    isVocabProperty: (iri: string, scope?: string[]) => {
      if (scope) for (const t of scope) if (scopedVocabProps.get(t)?.has(iri)) return true;
      return vocabProps.has(iri);
    },
  };
}

/** Compressed (EN 18223 §5.2) JSON-LD: the master-data body carrying the applicable
 *  operational @context (per-module) as its data dictionary — self-describing JSON-LD
 *  that expands to the product RDF, and still plain JSON. This is the single §5.2 form
 *  (also written "operational"); there is no context-less variant. */
export function operationalJsonLd(master: any): any {
  const { "@context": _ctx, ...rest } = master;
  return { "@context": operationalContextFor(master), ...rest };
}

/**
 * The compressed (EN 18223 §5.2 operational) JSON-LD. Every vocabulary term is
 * re-keyed to its bare context alias (no `gs1:`/`eutex:` CURIEs) wherever the
 * operational chain defines one, using the operational data dictionary resolved
 * from that context. This is a shape-preserving re-key of the derived passport —
 * a scalar stays a scalar, an array an array, a coded value its bare code — NOT a
 * lossy JSON-LD compaction (which mangles typed literals into {@value,@type}
 * objects and misses terms whose coercion doesn't match the untyped resolver
 * data). The published operational context is attached so the body is
 * self-describing JSON-LD that round-trips, and `orderCompacted` gives a stable,
 * envelope-first key order so the output is a byte-stable fixed point and the
 * Java service (which re-keys through the same dictionary) produces identical bytes.
 */
export async function compactOperational(
  master: any,
  range: Map<string, string>,
  documentLoader: DocumentLoader,
): Promise<any> {
  const passport = await deriveEN18223(master, range, documentLoader);
  const ctx = operationalContextFor(master);
  const dict = await buildOperationalKeyMap(ctx, documentLoader);
  const body = compressEN18223(passport, operationalOptions(dict));
  return orderCompacted({ "@context": ctx, ...body });
}

// Canonical key order for a compacted passport: @context first, the EN 18223
// envelope fields (top level only), then `type`/`id`, then the remaining keys
// sorted. Applied recursively so nested objects are stable too. This is what
// makes Titanium (Java) and jsonld.js (TS) output byte-comparable despite each
// library's own key ordering.
function orderNode(node: any, topLevel: boolean): any {
  if (Array.isArray(node)) return node.map((n) => orderNode(n, false));
  if (!node || typeof node !== "object") return node;
  const out: any = {};
  const put = (k: string) => {
    if (k in node && !(k in out)) out[k] = orderNode(node[k], false);
  };
  put("@context");
  if (topLevel) for (const k of ENVELOPE_ORDER) put(k);
  put("type");
  put("id");
  for (const k of Object.keys(node).filter((k) => !(k in out)).sort()) put(k);
  return out;
}

export function orderCompacted(doc: any): any {
  return orderNode(doc, true);
}

/** Canonical N-Quads (URDNA2015): the reference graph all other forms must match.
 *  Language maps in the stored body are normalized first, exactly as the JSON path
 *  does, so the RDF projections carry the same literals as the compressed form
 *  instead of silently dropping them (see normalizeLanguageMaps). */
export async function toNQuads(master: any, documentLoader: DocumentLoader): Promise<string> {
  return (await jsonld.canonize(normalizeLanguageMaps(master), {
    algorithm: "URDNA2015",
    format: "application/n-quads",
    safe: false,
    documentLoader: documentLoader as any,
  })) as unknown as string;
}

/** N-Triples: the default-graph triples (DPP is a single graph). */
export async function toNTriples(master: any, documentLoader: DocumentLoader): Promise<string> {
  // URDNA2015 over a single default graph yields N-Triples-compatible lines.
  return toNQuads(master, documentLoader);
}

// One prefix per namespace for the Turtle header. PREFIXES carries both SEMICeu
// spellings of the m8g namespace for the expansion direction; declaring both here
// would emit two @prefix lines for one namespace, so the first one wins.
const TURTLE_PREFIXES: Record<string, string> = Object.fromEntries(
  Object.entries(PREFIXES).filter(
    ([p, ns], _i, all) => all.findIndex(([, other]) => other === ns) === all.findIndex(([q]) => q === p),
  ),
);

/** Turtle, serialized from the canonical quads with prefixed names. */
export async function toTurtle(master: any, documentLoader: DocumentLoader): Promise<string> {
  const nquads = await toNQuads(master, documentLoader);
  const quads = new n3.Parser({ format: "application/n-quads" }).parse(nquads);
  const writer = new n3.Writer({ prefixes: TURTLE_PREFIXES, format: "text/turtle" });
  writer.addQuads(quads);
  return await new Promise<string>((resolve, reject) =>
    writer.end((err: Error | null, result: string) => (err ? reject(err) : resolve(result))),
  );
}

// ---------------------------------------------------------------------------
// EN 18223 XML serializations (dep-free string transforms of the Annex A model
// produced by deriveEN18223). No RDF/JSON-LD involvement: XML is a projection of
// the same EN 18223 information model, not of the RDF graph.
//   - toXmlOperational: the "compressed" XML of Annex B — header in the dpp:
//     namespace, each data element under the namespace prefix of its
//     dictionaryReference, arrays as repeated <item>, MultiLanguage as repeated
//     <MultiLanguageValue>, RelatedResource as nested fields.
//   - toXmlExpanded: a faithful XML rendering of the Annex A expanded model
//     (the standard defines only compressed XML), every DataElement explicit in
//     the dpp: namespace with its elementId/dictionaryReference/valueDataType.
// ---------------------------------------------------------------------------

// EN 18223 Annex B namespace for the DPP structural vocabulary (header + envelope).
const DPP_XML_NS = "https://standards.cen.eu/dpp/18223/v1.0/schema";
// namespace IRI -> short prefix, longest namespace first for greedy matching.
const NS_TO_PREFIX: Array<[string, string]> = Object.entries(PREFIXES)
  .map(([p, ns]) => [ns, p] as [string, string])
  .sort((a, b) => b[0].length - a[0].length);

const namespaceOfIri = (iri: string): string => {
  const i = Math.max(iri.lastIndexOf("/"), iri.lastIndexOf("#"));
  return i >= 0 ? iri.slice(0, i + 1) : iri;
};
const prefixForIri = (iri: string): string | undefined => {
  const ns = namespaceOfIri(iri);
  const hit = NS_TO_PREFIX.find(([n]) => n === ns);
  return hit ? hit[1] : undefined;
};
const xmlEscape = (s: any): string =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pad = (d: number) => "  ".repeat(d);

// The prefixed XML element name for an Annex A data element (dictionaryReference
// namespace -> prefix); falls back to dpp: if the namespace has no known prefix.
function qname(el: any): string {
  const p = el.dictionaryReference ? prefixForIri(el.dictionaryReference) : undefined;
  return `${p ?? "dpp"}:${el.elementId}`;
}

// Every namespace prefix a set of Annex A elements draws on, so the root element
// can declare them all (dpp: is always declared).
function collectXmlPrefixes(elements: any[], acc: Set<string>): void {
  for (const el of elements || []) {
    if (el?.dictionaryReference) {
      const p = prefixForIri(el.dictionaryReference);
      if (p) acc.add(p);
    }
    if (Array.isArray(el?.elements)) collectXmlPrefixes(el.elements, acc);
    if (Array.isArray(el?.value)) for (const v of el.value) if (Array.isArray(v)) collectXmlPrefixes(v, acc);
  }
}

// One Annex A element -> its compressed (Annex B) XML, using the element's own
// prefix for structural children (<item>, <MultiLanguageValue>, resource fields)
// as shown in EN 18223 Annex B Examples 5-8.
function xmlOperationalElement(el: any, depth: number): string {
  const tag = qname(el);
  const p = tag.split(":")[0];
  const open = `${pad(depth)}<${tag}>`;
  const close = `</${tag}>`;
  switch (el.objectType) {
    case "SingleValuedDataElement":
      return el.value == null ? `${pad(depth)}<${tag}/>` : `${open}${xmlEscape(el.value)}${close}`;
    case "MultiLanguageDataElement": {
      const items = (el.value || [])
        .map((v: any) =>
          `${pad(depth + 1)}<${p}:MultiLanguageValue>\n` +
          `${pad(depth + 2)}<${p}:value>${xmlEscape(v.value)}</${p}:value>\n` +
          `${pad(depth + 2)}<${p}:language>${xmlEscape(v.language)}</${p}:language>\n` +
          `${pad(depth + 1)}</${p}:MultiLanguageValue>`)
        .join("\n");
      return `${open}\n${items}\n${pad(depth)}${close}`;
    }
    case "MultiValuedDataElement": {
      const items = (el.value || [])
        .map((v: any) =>
          Array.isArray(v)
            ? `${pad(depth + 1)}<${p}:item>\n${v.map((c: any) => xmlOperationalElement(c, depth + 2)).join("\n")}\n${pad(depth + 1)}</${p}:item>`
            : `${pad(depth + 1)}<${p}:item>${xmlEscape(v)}</${p}:item>`)
        .join("\n");
      return `${open}\n${items}\n${pad(depth)}${close}`;
    }
    case "DataElementCollection": {
      const kids = (el.elements || []).map((c: any) => xmlOperationalElement(c, depth + 1)).join("\n");
      return `${open}\n${kids}\n${pad(depth)}${close}`;
    }
    case "RelatedResource": {
      const fields = ["resourceTitle", "contentType", "url", "language"]
        .filter((k) => el[k] != null)
        .map((k) => `${pad(depth + 1)}<${p}:${k}>${xmlEscape(el[k])}</${p}:${k}>`)
        .join("\n");
      return `${open}\n${fields}\n${pad(depth)}${close}`;
    }
    default:
      return `${pad(depth)}<${tag}/>`;
  }
}

// The DPP header (envelope) as dpp:-namespaced XML, shared by both XML forms.
function xmlHeader(passport: any, depth: number): string {
  const lines: string[] = [];
  for (const k of ENVELOPE_ORDER_XML) {
    if (!(k in passport)) continue;
    if (k === "contentSpecificationIds") {
      const items = (passport[k] || []).map((v: any) => `${pad(depth + 1)}<dpp:item>${xmlEscape(v)}</dpp:item>`).join("\n");
      lines.push(`${pad(depth)}<dpp:contentSpecificationIds>\n${items}\n${pad(depth)}</dpp:contentSpecificationIds>`);
    } else {
      lines.push(`${pad(depth)}<dpp:${k}>${xmlEscape(passport[k])}</dpp:${k}>`);
    }
  }
  return lines.join("\n");
}

const ENVELOPE_ORDER_XML = [
  "digitalProductPassportId", "uniqueProductIdentifier", "granularity",
  "dppSchemaVersion", "dppStatus", "lastUpdated", "economicOperatorId",
  "facilityId", "contentSpecificationIds",
];

function rootPrefixDecls(elements: any[]): string {
  const prefixes = new Set<string>();
  collectXmlPrefixes(elements, prefixes);
  const decls = [`xmlns:dpp="${DPP_XML_NS}"`];
  for (const p of [...prefixes].sort()) if (PREFIXES[p]) decls.push(`xmlns:${p}="${PREFIXES[p]}"`);
  return decls.join("\n    ");
}

/** EN 18223 Annex B "compressed" XML: the operational payload as XML. */
export function toXmlOperational(passport: any): string {
  const elements: any[] = passport.elements || [];
  const header = xmlHeader(passport, 1);
  const body = elements.map((el) => xmlOperationalElement(el, 1)).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<dpp:DigitalProductPassport\n    ${rootPrefixDecls(elements)}>\n` +
    `${header}\n${body}\n</dpp:DigitalProductPassport>\n`;
}

// One Annex A element as fully-expanded dpp:DataElement XML (elementId,
// dictionaryReference, valueDataType, value); collections recurse.
function xmlExpandedElement(el: any, depth: number): string {
  const meta =
    `${pad(depth + 1)}<dpp:elementId>${xmlEscape(el.elementId)}</dpp:elementId>\n` +
    (el.dictionaryReference ? `${pad(depth + 1)}<dpp:dictionaryReference>${xmlEscape(el.dictionaryReference)}</dpp:dictionaryReference>\n` : "") +
    (el.valueDataType ? `${pad(depth + 1)}<dpp:valueDataType>${xmlEscape(el.valueDataType)}</dpp:valueDataType>\n` : "");
  let value: string;
  switch (el.objectType) {
    case "DataElementCollection":
      value = `${pad(depth + 1)}<dpp:value>\n${(el.elements || []).map((c: any) => xmlExpandedElement(c, depth + 2)).join("\n")}\n${pad(depth + 1)}</dpp:value>`;
      break;
    case "MultiLanguageDataElement":
      value = `${pad(depth + 1)}<dpp:value>\n` +
        (el.value || []).map((v: any) =>
          `${pad(depth + 2)}<dpp:MultiLanguageValue>\n` +
          `${pad(depth + 3)}<dpp:value>${xmlEscape(v.value)}</dpp:value>\n` +
          `${pad(depth + 3)}<dpp:language>${xmlEscape(v.language)}</dpp:language>\n` +
          `${pad(depth + 2)}</dpp:MultiLanguageValue>`).join("\n") +
        `\n${pad(depth + 1)}</dpp:value>`;
      break;
    case "MultiValuedDataElement":
      value = `${pad(depth + 1)}<dpp:value>\n` +
        (el.value || []).map((v: any) =>
          Array.isArray(v)
            ? `${pad(depth + 2)}<dpp:item>\n${v.map((c: any) => xmlExpandedElement(c, depth + 3)).join("\n")}\n${pad(depth + 2)}</dpp:item>`
            : `${pad(depth + 2)}<dpp:item>${xmlEscape(v)}</dpp:item>`).join("\n") +
        `\n${pad(depth + 1)}</dpp:value>`;
      break;
    case "RelatedResource":
      value = `${pad(depth + 1)}<dpp:value>\n` +
        ["resourceTitle", "contentType", "url", "language"].filter((k) => el[k] != null)
          .map((k) => `${pad(depth + 2)}<dpp:${k}>${xmlEscape(el[k])}</dpp:${k}>`).join("\n") +
        `\n${pad(depth + 1)}</dpp:value>`;
      break;
    default:
      value = el.value == null ? `${pad(depth + 1)}<dpp:value/>` : `${pad(depth + 1)}<dpp:value>${xmlEscape(el.value)}</dpp:value>`;
  }
  return `${pad(depth)}<dpp:DataElement objectType="${el.objectType}">\n${meta}${value}\n${pad(depth)}</dpp:DataElement>`;
}

/** Expanded XML: a faithful rendering of the Annex A model (all metadata explicit). */
export function toXmlExpanded(passport: any): string {
  const elements: any[] = passport.elements || [];
  const header = xmlHeader(passport, 1);
  const body = `${pad(1)}<dpp:elements>\n${elements.map((el) => xmlExpandedElement(el, 2)).join("\n")}\n${pad(1)}</dpp:elements>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<dpp:DigitalProductPassport xmlns:dpp="${DPP_XML_NS}">\n` +
    `${header}\n${body}\n</dpp:DigitalProductPassport>\n`;
}
