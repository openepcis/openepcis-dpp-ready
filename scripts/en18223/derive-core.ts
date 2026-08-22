/**
 * Browser-safe core for deriving an EN 18223:2026 DigitalProductPassport
 * (Annex A "expanded" JSON) from good GS1 Web Vocabulary + GS1 Digital Link
 * JSON-LD (the EN 18223 "compressed" serialization).
 *
 * Pure logic only: depends solely on `jsonld`. No node:fs, no n3. The caller
 * supplies a JSON-LD documentLoader and a property->range map, so the same
 * code runs in the Node CLI (scripts/derive-en18223.ts) and in the browser
 * demo (demos/en18223-converter/app.ts).
 */
import jsonld from "jsonld";

export const DPP = "https://ref.openepcis.io/extensions/common/core/";
export const GS1 = "https://ref.gs1.org/voc/";
const SCHEMA = "https://schema.org/";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";

export type DocumentLoader = (url: string) => Promise<{ contextUrl?: string; documentUrl: string; document: any }>;

const localName = (iri: string): string => {
  const i = Math.max(iri.lastIndexOf("/"), iri.lastIndexOf("#"));
  return i >= 0 ? iri.slice(i + 1) : iri;
};
const toPrefixed = (iri: string): string => (iri.startsWith(XSD) ? `xsd:${localName(iri)}` : iri);

function inferType(v: any): string {
  if (typeof v === "boolean") return "xsd:boolean";
  if (typeof v === "number") return Number.isInteger(v) ? "xsd:integer" : "xsd:double";
  if (typeof v === "string") {
    if (/^\d{4}-\d\d-\d\dT/.test(v)) return "xsd:dateTime";
    if (/^\d{4}-\d\d-\d\d$/.test(v)) return "xsd:date";
    if (/^https?:\/\//.test(v)) return "xsd:anyURI";
  }
  return "xsd:string";
}
// datatype of an expanded literal value-object, preferring its coerced @type
function literalType(valObj: any, propIri: string, range: Map<string, string>): string {
  if (valObj["@type"]) return toPrefixed(valObj["@type"]);
  const r = range.get(propIri);
  if (r && r.startsWith(XSD)) return toPrefixed(r);
  return inferType(valObj["@value"]);
}

const isLiteral = (e: any) => e && typeof e === "object" && "@value" in e;
const hasProps = (e: any) => Object.keys(e).some((k) => k !== "@id" && k !== "@type" && k !== "@index");
const isNode = (e: any) => e && typeof e === "object" && !("@value" in e) && (("@id" in e) || hasProps(e));
const skipKey = (key: string): boolean =>
  key === "@id" || key === "@type" || key === "@index" || key.startsWith(RDFS);

const valueTypeForId = (id: string): string => (/^https?:\/\//.test(id) ? "xsd:anyURI" : "xsd:string");
// A node that is only a reference / coded value: an @id (and maybe @type) with
// no child data properties, and not a document reference. These arise from
// JSON-LD @id / @vocab coercion of enumeration values and IRI references; they
// carry a single value, not a nested collection.
function isBareRef(node: any): boolean {
  if (!isNode(node) || !node["@id"]) return false;
  const types: string[] = node["@type"] || [];
  if (`${DPP}documentUrl` in node || types.includes(`${DPP}DocumentReference`)) return false;
  return Object.keys(node).every(skipKey);
}

function buildElement(propIri: string, values: any[], range: Map<string, string>): any {
  const base = { elementId: localName(propIri), dictionaryReference: propIri };

  if (values.length && values.every((e) => isLiteral(e) && e["@language"])) {
    return {
      ...base,
      objectType: "MultiLanguageDataElement",
      value: values.map((e) => ({ value: e["@value"], language: e["@language"] })),
    };
  }
  if (values.length === 1 && isLiteral(values[0])) {
    return {
      ...base,
      objectType: "SingleValuedDataElement",
      valueDataType: literalType(values[0], propIri, range),
      value: values[0]["@value"],
    };
  }
  if (values.length > 1 && values.every(isLiteral)) {
    return {
      ...base,
      objectType: "MultiValuedDataElement",
      valueDataType: literalType(values[0], propIri, range),
      value: values.map((e) => e["@value"]),
    };
  }
  if (values.length === 1 && isNode(values[0])) {
    return { ...base, ...classifyNode(values[0], range) };
  }
  if (values.length > 1 && values.every(isNode)) {
    if (values.every(isBareRef)) {
      return {
        ...base,
        objectType: "MultiValuedDataElement",
        valueDataType: valueTypeForId(values[0]["@id"]),
        reference: true,
        value: values.map((n) => n["@id"]),
      };
    }
    return {
      ...base,
      objectType: "MultiValuedDataElement",
      value: values.map((n) => collectionElements(n, range)),
    };
  }
  if (values.length === 1 && values[0] && values[0]["@id"]) {
    return { ...base, objectType: "SingleValuedDataElement", valueDataType: "xsd:anyURI", reference: true, value: values[0]["@id"] };
  }
  return { ...base, objectType: "SingleValuedDataElement", value: null };
}

function classifyNode(node: any, range: Map<string, string>): any {
  const types: string[] = node["@type"] || [];
  const hasDoc = `${DPP}documentUrl` in node || types.includes(`${DPP}DocumentReference`);
  if (hasDoc) {
    const first = (iri: string) => (node[iri] && node[iri][0] ? node[iri][0]["@value"] ?? node[iri][0]["@id"] : undefined);
    const res: any = { objectType: "RelatedResource" };
    // Carry the DocumentReference type so the compressed form re-expands as a
    // document (the operational context type-scopes resourceTitle/contentType/url/
    // language to the doc IRIs only under this type), keeping the round-trip exact.
    res.nodeTypes = types.includes(`${DPP}DocumentReference`) ? types : [`${DPP}DocumentReference`, ...types];
    // resourceTitle IS schema:name in the operational context, and every document
    // in this repository titles itself with schema:name; reading only the two oec
    // spellings meant the title never reached the compressed form at all.
    const title = first(`${SCHEMA}name`) ?? first(`${DPP}documentTitle`) ?? first(`${DPP}title`);
    if (title) res.resourceTitle = title;
    const ct = first(`${DPP}mimeType`);
    if (ct) res.contentType = ct;
    const url = first(`${DPP}documentUrl`);
    if (url) res.url = url;
    const lang = first(`${DPP}languageCode`);
    if (lang) res.language = lang;
    // A document's kind and issue date are data, not decoration. Without a slot
    // here the projection dropped both silently, which is how a declaration of
    // conformity lost the very fact that it was one.
    const kind = first(`${DPP}hasDocumentType`);
    if (kind) res.documentType = kind;
    const issued = first(`${DPP}issueDate`);
    if (issued) res.issueDate = issued;
    return res;
  }
  if (isBareRef(node)) {
    return { objectType: "SingleValuedDataElement", valueDataType: valueTypeForId(node["@id"]), reference: true, value: node["@id"] };
  }
  // Preserve the node @type: a term whose coercion is type-scoped (e.g. a coded
  // value under a scoped context) resolves the same way on re-derivation only if
  // the type survives, so the compressed body is a byte-stable fixed point.
  return { objectType: "DataElementCollection", nodeTypes: types, elements: collectionElements(node, range) };
}

function collectionElements(node: any, range: Map<string, string>): any[] {
  const out: any[] = [];
  for (const key of Object.keys(node)) {
    if (skipKey(key)) continue;
    out.push(buildElement(key, node[key], range));
  }
  return out;
}

export function granularityFromDigitalLink(dl: string | undefined): string {
  if (!dl) return "model";
  if (/\/21\//.test(dl)) return "item";
  if (/\/10\//.test(dl)) return "batch";
  return "model";
}

const firstVal = (node: any, iri: string): any =>
  node[iri] && node[iri][0] ? (node[iri][0]["@value"] ?? node[iri][0]["@id"]) : undefined;

// The party/facility Digital Link for an operator-valued property: the value
// node's @id (already a Digital Link, e.g. .../417/{gln}) if present, else
// https://id.gs1.org/417/{gln} built from its GS1 GLN. Used to derive the
// EN 18223 mandatory economicOperatorId (and optional facilityId) from the GS1
// operator identity already in the master data.
function partyDigitalLink(node: any, iri: string): string | undefined {
  const op = node[iri] && node[iri][0];
  if (!op) return undefined;
  if (op["@id"]) return op["@id"];
  const gln = firstVal(op, `${GS1}gln`);
  return gln ? `https://id.gs1.org/417/${gln}` : undefined;
}

// EN 18223 envelope attributes carried verbatim from the source document.
// Everything else in the envelope is derived (see deriveEN18223), so the
// compressed input only needs to carry genuine product data plus the
// Digital Link identity and, optionally, the operator/facility identifiers.
const ENVELOPE: Record<string, string> = {
  [`${DPP}passportIdentifier`]: "digitalProductPassportId",
  [`${GS1}productID`]: "uniqueProductIdentifier",
  [`${DPP}granularityLevel`]: "granularity",
  [`${DPP}dppSchemaVersion`]: "dppSchemaVersion",
  [`${DPP}passportStatus`]: "dppStatus",
  [`${DPP}lastUpdated`]: "lastUpdated",
  [`${DPP}economicOperatorId`]: "economicOperatorId",
  [`${DPP}facilityId`]: "facilityId",
};
const CONTENT_SPEC = `${DPP}contentSpecificationId`;
// This converter always emits the Annex A expanded serialization of the model.
const DPP_SCHEMA_VERSION = "EN 18223:2026";

const ENVELOPE_ORDER = [
  "digitalProductPassportId", "uniqueProductIdentifier", "granularity",
  "dppSchemaVersion", "dppStatus", "lastUpdated", "economicOperatorId",
  "facilityId", "contentSpecificationIds",
];

// Namespace of a dictionaryReference IRI: the data dictionary / content
// specification it belongs to (everything up to and including the final / or #).
const namespaceOf = (iri: string): string => {
  const i = Math.max(iri.lastIndexOf("/"), iri.lastIndexOf("#"));
  return i >= 0 ? iri.slice(0, i + 1) : iri;
};
// Walk the built elements (recursively into collections and node-valued
// multi-values) and collect the distinct dictionaryReference namespaces.
function collectContentSpecs(elements: any[], acc: Set<string>): void {
  for (const el of elements) {
    if (el && el.dictionaryReference) acc.add(namespaceOf(el.dictionaryReference));
    if (el && Array.isArray(el.elements)) collectContentSpecs(el.elements, acc);
    if (el && Array.isArray(el.value)) for (const v of el.value) if (Array.isArray(v)) collectContentSpecs(v, acc);
  }
}

// ---------------------------------------------------------------------------
// Compact language maps in the stored master data
//
// The resolver Product API stores a language-tagged literal in JSON-LD 1.1
// language-map form, `{"en": "…"}`, rather than the `{"@value","@language"}` form
// it was written in. A language map only expands when its term carries
// `@container: "@language"`, and the DPP contexts deliberately do not declare that
// (see scripts/fix-language-maps.ts): the container would mangle a bare single
// value object `{"@value":"x","@language":"en"}` into garbage, and 102 of those
// appear in our own artifacts alone. So without the container the map expands to an
// empty node and the element derives as `value: null` — every language-tagged
// extension field of a stored passport read back empty.
//
// Fixing it in the contexts is therefore not an option; the reader has to accept
// the shape. This pre-pass rewrites a pure language map into the value-object form
// before expansion, which is the same normalization fix-language-maps.ts applies to
// the committed artifacts, done at read time for data we did not author.
//
// The test is deliberately shape-only, no vocabulary knowledge: an object whose
// keys are ALL language tags and whose values are ALL strings. Such an object has
// no other valid reading — its keys are not defined terms, so it expands to `{}`
// today. Anything else is left untouched, so a value that already expands
// correctly cannot be changed by this.
// ---------------------------------------------------------------------------

/** Language tags accepted in a compact language map (mirrors scripts/fix-language-maps.ts). */
const LANGUAGE_TAG = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;

/**
 * JSON-LD structural aliases that also read as a language tag. `id` is the one that
 * matters: `{"id": "https://…"}` is how every node reference in this master data is
 * written, and it is also the ISO 639-1 tag for Indonesian. Reading a node reference
 * as a literal is the damaging direction, so structural wins.
 */
const NOT_A_LANGUAGE = new Set(["id", "type"]);

function isLanguageMap(node: any): boolean {
  if (!node || typeof node !== "object" || Array.isArray(node)) return false;
  const keys = Object.keys(node);
  if (!keys.length) return false;
  return keys.every(
    (k) =>
      !NOT_A_LANGUAGE.has(k) &&
      LANGUAGE_TAG.test(k) &&
      (typeof node[k] === "string" ||
        (Array.isArray(node[k]) && node[k].length > 0 && node[k].every((v: any) => typeof v === "string"))),
  );
}

/**
 * Rewrite every compact language map in a master-data body to `[{"@value","@language"}]`.
 * Structure-preserving everywhere else. Exported so the Java port and the guards can
 * be pinned to the same normalization.
 */
export function normalizeLanguageMaps(node: any): any {
  if (Array.isArray(node)) return node.map(normalizeLanguageMaps);
  if (!node || typeof node !== "object") return node;
  if (isLanguageMap(node)) {
    const out: Array<{ "@value": string; "@language": string }> = [];
    // Sorted by language tag so the derived output does not depend on the key order
    // the store happened to serialize.
    for (const lang of Object.keys(node).sort()) {
      const v = node[lang];
      for (const value of Array.isArray(v) ? v : [v]) out.push({ "@value": value, "@language": lang });
    }
    return out;
  }
  const out: any = {};
  for (const [k, v] of Object.entries(node)) {
    // Never descend into @context: a term definition may legitimately be named after
    // something that reads as a language tag (`de: "https://…"`), and rewriting the
    // context would change what the body means rather than how it is spelled.
    out[k] = k === "@context" ? v : normalizeLanguageMaps(v);
  }
  return out;
}

export async function deriveEN18223(input: any, range: Map<string, string>, documentLoader: DocumentLoader): Promise<any> {
  const expanded = await jsonld.expand(normalizeLanguageMaps(input), { documentLoader });
  const node = Array.isArray(expanded) ? expanded[0] : expanded;
  if (!node) throw new Error("input expanded to nothing");

  const dpp: any = {};
  const dl = firstVal(node, `${GS1}productID`) ?? node["@id"];
  for (const [iri, key] of Object.entries(ENVELOPE)) {
    if (iri in node) dpp[key] = firstVal(node, iri);
  }

  // Derived envelope: identity from the Digital Link, granularity from its
  // Application Identifiers, schema version constant, status defaulting to active.
  if (!dpp.uniqueProductIdentifier && dl) dpp.uniqueProductIdentifier = dl;
  dpp.granularity = granularityFromDigitalLink(dpp.uniqueProductIdentifier);
  if (!dpp.digitalProductPassportId && dpp.uniqueProductIdentifier) dpp.digitalProductPassportId = dpp.uniqueProductIdentifier;
  if (!dpp.dppSchemaVersion) dpp.dppSchemaVersion = DPP_SCHEMA_VERSION;
  if (!dpp.dppStatus) dpp.dppStatus = "active";

  // economicOperatorId (EN 18223 mandatory) and facilityId (optional) are derived
  // from the GS1 operator identity in the master data when not stated explicitly:
  // the manufacturer's party Digital Link, and the manufacturing place's.
  if (!dpp.economicOperatorId) {
    const operator = partyDigitalLink(node, `${GS1}manufacturer`);
    if (operator) dpp.economicOperatorId = operator;
  }
  if (!dpp.facilityId) {
    const facility = partyDigitalLink(node, `${GS1}manufacturingPlace`);
    if (facility) dpp.facilityId = facility;
  }

  // Payload elements: every property that is not part of the EN 18223 envelope.
  const elements: any[] = [];
  for (const key of Object.keys(node)) {
    if (skipKey(key) || key in ENVELOPE || key === CONTENT_SPEC) continue;
    elements.push(buildElement(key, node[key], range));
  }

  // contentSpecificationIds: the data dictionaries the payload actually draws
  // on, derived from the dictionaryReference namespaces and unioned with any
  // explicitly declared dpp:contentSpecificationId. Sorted for stable output.
  const specs = new Set<string>();
  for (const e of node[CONTENT_SPEC] || []) {
    const v = e["@value"] ?? e["@id"];
    if (v) specs.add(v);
  }
  collectContentSpecs(elements, specs);
  if (specs.size) dpp.contentSpecificationIds = [...specs].sort();

  const ordered: any = {};
  for (const k of ENVELOPE_ORDER) if (k in dpp) ordered[k] = dpp[k];
  ordered.elements = elements;
  return ordered;
}

/** The standard JSON-LD expansion of the input: every shorthand term resolved
 *  to its full vocabulary IRI. Those IRIs are what the derivation uses as each
 *  DataElement's dictionaryReference, so this view shows where they come from. */
export async function expandJsonLd(input: any, documentLoader: DocumentLoader): Promise<any> {
  return jsonld.expand(input, { documentLoader });
}

/** IRI -> the JSON term it compresses to. The default is the local name; the
 *  operational projection passes a term function that returns the operational-
 *  context alias (with a CURIE fallback), used for element keys and `type` values.
 *
 *  `scope` is the @type IRI list of the node the term occurs IN. One property IRI
 *  can carry a different alias per node type — schema:category is `deviceCategory`
 *  on the product and `weeeCategory` inside a euelec:WEEECompliance — and each of
 *  those aliases scopes its own enum. Resolving without the scope picks whichever
 *  alias the chain happens to define first and emits a code the chosen alias does
 *  not enumerate, which then expands to a RELATIVE IRI.
 *
 *  `valueIri` is the coded value about to be emitted under this key, where there
 *  is one. It settles the same ambiguity at the top level, where no scope
 *  applies: of two aliases for one IRI, the one whose enum lists the code is the
 *  one the value can be read back through. */
export type TermFn = (iri: string, scope?: string[], valueIri?: string) => string;
/** Compress options.
 *  - `term` names keys and `type` values (context alias, else CURIE).
 *  - `codeTerm` compacts a coded VALUE IRI to its bare code (context alias, else
 *    local name), used only for @vocab-coerced properties so the code round-trips
 *    via @vocab and satisfies the JSON-Schema enum.
 *  - `isVocabProperty` tells whether a property is @vocab-coerced. Coded values of
 *    @vocab properties are compacted; @id references keep their full IRI (which
 *    round-trips unchanged). This split is what makes both stable. */
export interface CompressOptions {
  term: TermFn;
  codeTerm: TermFn;
  isVocabProperty: (iri: string, scope?: string[]) => boolean;
}
const localTerm: TermFn = (iri) => localName(iri);
const defaultOptions: CompressOptions = { term: localTerm, codeTerm: localTerm, isVocabProperty: () => false };

// A coded reference value: compact to its bare code only when the property is
// @vocab-coerced; otherwise keep the full IRI (an @id reference). Both the
// coercion test and the code alias are resolved in the scope of the node the
// property sits in, so a type-scoped alias contributes its own enum.
function codeValue(iri: string, propIri: string, opts: CompressOptions, scope?: string[]): string {
  return opts.isVocabProperty(propIri, scope) ? opts.codeTerm(iri, scope) : iri;
}

// The coded value IRI an element carries, where it has exactly one. Used to
// pick among several aliases of the property: only an alias whose enum lists
// this code can carry it. Multi-valued codes deliberately return nothing —
// the key must be one alias for all of them, and the first is as good as any.
function codedValueOf(el: any): string | undefined {
  if (!el?.reference) return undefined;
  if (el.objectType === "SingleValuedDataElement" && typeof el.value === "string") return el.value;
  if (el.objectType === "MultiValuedDataElement" && Array.isArray(el.value) && el.value.length === 1) {
    return typeof el.value[0] === "string" ? el.value[0] : undefined;
  }
  return undefined;
}

// The compressed `type` value for a node's @type IRIs (single term or array).
// A class alias is looked up at the top level: the node's own type cannot be
// scoped by itself, and the reader needs the alias before any scope applies.
function typeValue(nodeTypes: string[] | undefined, term: TermFn): any {
  if (!nodeTypes || nodeTypes.length === 0) return undefined;
  const ts = nodeTypes.map((t) => term(t));
  return ts.length === 1 ? ts[0] : ts;
}

// Render one EN 18223 expanded element as its compressed value. `scope` is the
// @type list of the node this element sits in; it selects among several aliases
// of one property IRI and thereby the enum its coded values must satisfy.
function compressElement(el: any, opts: CompressOptions, scope?: string[]): any {
  switch (el.objectType) {
    case "SingleValuedDataElement":
      return el.reference ? codeValue(el.value, el.dictionaryReference, opts, scope) : el.value;
    case "MultiLanguageDataElement":
      // JSON-LD-native language literals: unambiguous (they never collide with
      // gs1:value the way a bare {value,language} would), so the body round-trips.
      return (el.value || []).map((v: any) => ({ "@value": v.value, "@language": v.language }));
    case "MultiValuedDataElement":
      // A multi-valued node collection carries no per-item @type in the Annex A
      // form, so the containing property is the only scope its members have.
      return (el.value || []).map((v: any) =>
        Array.isArray(v) ? compressElements(v, opts, undefined, el.dictionaryReference)
          : el.reference ? codeValue(v, el.dictionaryReference, opts, scope) : v);
    case "DataElementCollection":
      return compressElements(el.elements || [], opts, el.nodeTypes, el.dictionaryReference);
    case "RelatedResource": {
      const o: any = {};
      const t = typeValue(el.nodeTypes, opts.term);
      if (t !== undefined) o.type = t;
      for (const k of ["resourceTitle", "contentType", "url", "language", "documentType", "issueDate"]) if (el[k] != null) o[k] = el[k];
      return o;
    }
    default:
      return el.value ?? null;
  }
}
// Emit collection members keyed by term(dictionaryReference), in a canonical
// (sorted-by-key) order so the output is byte-stable regardless of the source
// document's property order. A carried node @type is emitted as a leading `type`.
//
// The scope every member key and coded value resolves in is the node's own
// @type list followed by the property this node hangs under, mirroring JSON-LD,
// where a type-scoped context overrides a property-scoped one. Both are needed:
// a single node keeps its @type, while the members of a multi-valued collection
// have only their containing property to go by.
function compressElements(elements: any[], opts: CompressOptions, nodeTypes?: string[], parentProperty?: string): any {
  const scope = [...(nodeTypes ?? []), ...(parentProperty ? [parentProperty] : [])];
  const keyed = elements.map((el) => [opts.term(el.dictionaryReference, scope, codedValueOf(el)), el] as [string, any]);
  keyed.sort((a, b) => a[0].localeCompare(b[0]));
  const o: any = {};
  const t = typeValue(nodeTypes, opts.term);
  if (t !== undefined) o.type = t;
  for (const [key, el] of keyed) o[key] = compressElement(el, opts, scope);
  return o;
}

/** The EN 18223 "compressed" / operational serialization (clauses 5.2.6 to 5.2.9):
 *  the same passport as plain key-value JSON, derived from the expanded Annex A
 *  form. The envelope is kept in EN 18223 order; each data element collapses to
 *  key:value (collections nest, multi-values become arrays). With the operational
 *  term functions the result carries the operational-context aliases, so attaching
 *  that context makes it self-describing JSON-LD that round-trips (GET == valid PUT). */
export function compressEN18223(passport: any, opts: CompressOptions = defaultOptions): any {
  const { elements, ...envelope } = passport;
  return { ...envelope, ...compressElements(elements || [], opts) };
}
