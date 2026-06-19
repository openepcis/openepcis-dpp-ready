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
    return { ...base, objectType: "SingleValuedDataElement", valueDataType: "xsd:anyURI", value: values[0]["@id"] };
  }
  return { ...base, objectType: "SingleValuedDataElement", value: null };
}

function classifyNode(node: any, range: Map<string, string>): any {
  const types: string[] = node["@type"] || [];
  const hasDoc = `${DPP}documentUrl` in node || types.includes(`${DPP}DocumentReference`);
  if (hasDoc) {
    const first = (iri: string) => (node[iri] && node[iri][0] ? node[iri][0]["@value"] ?? node[iri][0]["@id"] : undefined);
    const res: any = { objectType: "RelatedResource" };
    const title = first(`${DPP}documentTitle`) ?? first(`${DPP}title`);
    if (title) res.resourceTitle = title;
    const ct = first(`${DPP}mimeType`);
    if (ct) res.contentType = ct;
    const url = first(`${DPP}documentUrl`);
    if (url) res.url = url;
    const lang = first(`${DPP}languageCode`);
    if (lang) res.language = lang;
    return res;
  }
  if (isBareRef(node)) {
    return { objectType: "SingleValuedDataElement", valueDataType: valueTypeForId(node["@id"]), value: node["@id"] };
  }
  return { objectType: "DataElementCollection", elements: collectionElements(node, range) };
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

export async function deriveEN18223(input: any, range: Map<string, string>, documentLoader: DocumentLoader): Promise<any> {
  const expanded = await jsonld.expand(input, { documentLoader });
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

// Render one EN 18223 expanded element as its compressed value.
function compressElement(el: any): any {
  switch (el.objectType) {
    case "SingleValuedDataElement":
      return el.value;
    case "MultiLanguageDataElement":
      return el.value; // already [{ value, language }]
    case "MultiValuedDataElement":
      return (el.value || []).map((v: any) => (Array.isArray(v) ? compressElements(v) : v));
    case "DataElementCollection":
      return compressElements(el.elements || []);
    case "RelatedResource": {
      const o: any = {};
      for (const k of ["resourceTitle", "contentType", "url", "language"]) if (el[k] != null) o[k] = el[k];
      return o;
    }
    default:
      return el.value ?? null;
  }
}
function compressElements(elements: any[]): any {
  const o: any = {};
  for (const el of elements) o[el.elementId] = compressElement(el);
  return o;
}

/** The EN 18223 "compressed" serialization (clauses 5.2.6 to 5.2.9): the same
 *  passport as plain key-value JSON, derived from the expanded Annex A form.
 *  Envelope attributes are kept; each data element collapses to elementId:value
 *  (collections nest, multi-values become arrays). */
export function compressEN18223(passport: any): any {
  const { elements, ...envelope } = passport;
  return { ...envelope, ...compressElements(elements || []) };
}
