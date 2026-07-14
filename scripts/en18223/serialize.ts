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
import type { DocumentLoader, CompressOptions } from "./derive-core.ts";

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
  usfsma: "https://ref.openepcis.io/extensions/us/fsma204/",
  schema: "https://schema.org/",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
};

// namespace IRI -> prefix, longest namespace first (greedy CURIE fallback).
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

/** The resolved operational data-dictionary: the term aliases and the set of
 *  @vocab-coerced property IRIs. */
export interface OperationalDictionary {
  keyMap: Map<string, string>;
  vocabProps: Set<string>;
}

// Walk an @context value (array / IRI to load / inline object), collecting bare
// (unprefixed) term -> full-IRI aliases and the IRIs of @vocab-coerced properties.
async function collectAliases(
  ctxValue: any,
  documentLoader: DocumentLoader,
  acc: Array<[string, string]>,
  vocab: Set<string>,
): Promise<void> {
  if (Array.isArray(ctxValue)) {
    for (const c of ctxValue) await collectAliases(c, documentLoader, acc, vocab);
    return;
  }
  if (typeof ctxValue === "string") {
    const doc = (await documentLoader(ctxValue)).document;
    await collectAliases(doc["@context"], documentLoader, acc, vocab);
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
          if ((def as any)["@context"]) await collectAliases((def as any)["@context"], documentLoader, acc, vocab);
        }
      }
    }
  }
}

/** Resolve the operational context chain to its data dictionary: the IRI->alias
 *  map (first alias in resolution order wins) plus the @vocab-coerced property set. */
export async function buildOperationalKeyMap(
  operationalContext: string | string[],
  documentLoader: DocumentLoader,
): Promise<OperationalDictionary> {
  const defs: Array<[string, string]> = [];
  const vocabProps = new Set<string>();
  await collectAliases(operationalContext, documentLoader, defs, vocabProps);
  const keyMap = new Map<string, string>();
  for (const [term, iri] of defs) if (!keyMap.has(iri)) keyMap.set(iri, term);
  return { keyMap, vocabProps };
}

/** Compress options from the resolved operational dictionary. `term` (keys /
 *  `type` values): the context alias for an IRI, else its CURIE. `codeTerm`
 *  (coded values of @vocab properties): the enum alias, else the bare local name
 *  — both re-expand via @vocab and satisfy the JSON-Schema enum. `isVocabProperty`
 *  gates which reference values are compacted, so @id references keep full IRIs.
 *  Together they make the compressed body round-trip (GET == valid PUT). */
export function operationalOptions(dict: OperationalDictionary): CompressOptions {
  const { keyMap, vocabProps } = dict;
  return {
    term: (iri: string) => keyMap.get(iri) ?? toCurie(iri),
    codeTerm: (iri: string) => keyMap.get(iri) ?? localNameOf(iri),
    isVocabProperty: (iri: string) => vocabProps.has(iri),
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

/** Canonical N-Quads (URDNA2015) — the reference graph all other forms must match. */
export async function toNQuads(master: any, documentLoader: DocumentLoader): Promise<string> {
  return (await jsonld.canonize(master, {
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

/** Turtle, serialized from the canonical quads with prefixed names. */
export async function toTurtle(master: any, documentLoader: DocumentLoader): Promise<string> {
  const nquads = await toNQuads(master, documentLoader);
  const quads = new n3.Parser({ format: "application/n-quads" }).parse(nquads);
  const writer = new n3.Writer({ prefixes: PREFIXES, format: "text/turtle" });
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
