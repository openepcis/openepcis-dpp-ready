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

const ENVELOPE: Record<string, string> = {
  [`${DPP}passportIdentifier`]: "digitalProductPassportId",
  [`${GS1}productID`]: "uniqueProductIdentifier",
  [`${DPP}granularityLevel`]: "granularity",
  [`${DPP}dppSchemaVersion`]: "dppSchemaVersion",
  [`${DPP}passportStatus`]: "dppStatus",
  [`${DPP}lastUpdated`]: "lastUpdated",
  [`${DPP}economicOperatorId`]: "economicOperatorId",
  [`${DPP}facilityId`]: "facilityId",
  [`${DPP}contentSpecificationId`]: "contentSpecificationIds",
};

const ENVELOPE_ORDER = [
  "digitalProductPassportId", "uniqueProductIdentifier", "granularity",
  "dppSchemaVersion", "dppStatus", "lastUpdated", "economicOperatorId",
  "facilityId", "contentSpecificationIds",
];

export async function deriveEN18223(input: any, range: Map<string, string>, documentLoader: DocumentLoader): Promise<any> {
  const expanded = await jsonld.expand(input, { documentLoader });
  const node = Array.isArray(expanded) ? expanded[0] : expanded;
  if (!node) throw new Error("input expanded to nothing");

  const dpp: any = {};
  const dl = firstVal(node, `${GS1}productID`) ?? node["@id"];
  for (const [iri, key] of Object.entries(ENVELOPE)) {
    if (!(iri in node)) continue;
    if (key === "contentSpecificationIds") dpp[key] = node[iri].map((e: any) => e["@value"] ?? e["@id"]);
    else dpp[key] = firstVal(node, iri);
  }
  if (!dpp.uniqueProductIdentifier && dl) dpp.uniqueProductIdentifier = dl;
  dpp.granularity = granularityFromDigitalLink(dpp.uniqueProductIdentifier);
  if (!dpp.dppStatus) dpp.dppStatus = "active";

  const ordered: any = {};
  for (const k of ENVELOPE_ORDER) if (k in dpp) ordered[k] = dpp[k];

  const elements: any[] = [];
  for (const key of Object.keys(node)) {
    if (skipKey(key) || key in ENVELOPE) continue;
    elements.push(buildElement(key, node[key], range));
  }
  ordered.elements = elements;
  return ordered;
}
