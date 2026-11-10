/**
 * The JSON-LD reading of a BatteryPass-Ready 2.0.1 document (GEFEG JSON Schemas, vendored under
 * vendor/batterypass-ready/2.0.1).
 *
 * BatteryPass-Ready publishes its data model as JSON Schema only: no context, no IRIs. The data
 * elements have OpenEPCIS-hosted IRIs in extensions/eu/battery/vocab/batterypass-ready-2.0.1.ttl
 * (bpr:, tools/vocab-sync/tools/build-bpr-vocab.py). What remains are the keys of the schemas' value
 * containers (`percentageValue`, `kilowattHourUnit`, `url`, `name`, ...): serialisation slots, not
 * data points. This script gives them IRIs of their own (bprx:, the JSON form) and writes the
 * context that reads a 2.0.1 document as RDF key by key, nested as the JSON is:
 *
 *   extensions/eu/battery/vocab/batterypass-ready-2.0.1-json.ttl   bprx: slots (with their datatype
 *                                                                  as rdfs:range) and the class of
 *                                                                  the document root
 *   extensions/eu/battery/context/batterypass-ready-2.0.1-context.jsonld
 *   extensions/common/interop/crosswalk/batterypass/structure.ttl  where each data element sits in
 *                                                                  the document (header or data
 *                                                                  group) and the battery categories
 *                                                                  whose schema has it, and the datatype
 *                                                                  of every numeric key
 *
 * Arrays are sets (@set), integers xsd:integer and other numbers xsd:double, as the schemas type
 * them, so the RDF of a document compacts back to the same JSON. Texts, dates and codes stay plain
 * strings. The crosswalk profile `batterypass` converts this RDF to and from OpenEPCIS.
 *
 * Usage: pnpm run build:batterypass-ready-context
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMAS = "vendor/batterypass-ready/2.0.1/JSONSchemaFiles";
const VOCAB = "extensions/eu/battery/vocab/batterypass-ready-2.0.1.ttl";
const JSON_VOCAB = "extensions/eu/battery/vocab/batterypass-ready-2.0.1-json.ttl";
const CONTEXT = "extensions/eu/battery/context/batterypass-ready-2.0.1-context.jsonld";
const STRUCTURE = "extensions/common/interop/crosswalk/batterypass/structure.ttl";
const BPR = "https://ref.openepcis.org/vocab/batterypass-ready/2.0.1#";
const BPRX = "https://ref.openepcis.org/vocab/batterypass-ready/2.0.1/json#";

type Node = Record<string, any>;
interface Key { array: boolean; types: Set<string>; parents: Set<string> }
const keys = new Map<string, Key>();

function visit(node: Node | undefined, parent: string, defs: Record<string, Node>, seen: Set<string>): void {
  if (!node || typeof node !== "object") return;
  const ref = typeof node.$ref === "string" ? node.$ref.split("/").pop()! : undefined;
  if (ref) {
    if (seen.has(ref)) return;
    return visit(defs[ref], parent, defs, new Set([...seen, ref]));
  }
  for (const [name, sub] of Object.entries((node.properties ?? {}) as Record<string, Node>)) {
    const k = keys.get(name) ?? { array: false, types: new Set<string>(), parents: new Set<string>() };
    keys.set(name, k);
    k.parents.add(parent);
    let target = sub;
    if (sub.type === "array") {
      k.array = true;
      target = sub.items ?? {};
    }
    const tref = typeof target.$ref === "string" ? defs[target.$ref.split("/").pop()!] : target;
    if (tref?.properties) k.types.add("object");
    else if (typeof tref?.type === "string") k.types.add(tref.type);
    visit(target, name, defs, seen);
  }
}

/** Per category schema (all requirements, not the February 2027 subset): group → its elements. */
const placement = new Map<string, Map<string, Set<string>>>();
for (const f of readdirSync(join(ROOT, SCHEMAS)).filter((f) => f.endsWith(".json")).sort()) {
  const schema = JSON.parse(readFileSync(join(ROOT, SCHEMAS, f), "utf8"));
  visit(schema, "(root)", schema.$defs ?? {}, new Set());
  if (f.includes("_Feb27")) continue;
  const category = f.replace(/_2\.0\.1\.json$/, "");
  const defs = schema.$defs as Record<string, Node>;
  const groups: [string, Node][] = [["dppHeader", defs.dppHeader],
    ...Object.entries(defs.batteryPassportMaster.properties as Record<string, Node>).map(([g, v]): [string, Node] => [g, defs[v.$ref.split("/").pop()]])];
  for (const [g, def] of groups) {
    for (const el of Object.keys(def.properties)) {
      const byGroup = placement.get(el) ?? new Map<string, Set<string>>();
      placement.set(el, byGroup);
      (byGroup.get(g) ?? byGroup.set(g, new Set()).get(g)!).add(category);
    }
  }
}

const elements = new Set([...readFileSync(join(ROOT, VOCAB), "utf8").matchAll(/^bpr:(\S+) a rdf:Property/gm)].map((m) => m[1]));
const label = (n: string) => n.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
const datatype = (k: Key): string | undefined => {
  if (k.types.has("object") || k.types.has("string") || k.types.has("boolean")) return undefined;
  if (k.types.has("number")) return "xsd:double";
  if (k.types.has("integer")) return "xsd:integer";
  return undefined;
};

const ctx: Record<string, unknown> = {
  "@version": 1.1,
  bpr: BPR,
  bprx: BPRX,
  xsd: "http://www.w3.org/2001/XMLSchema#",
};
const slots: string[] = [];
for (const name of [...keys.keys()].sort()) {
  const k = keys.get(name)!;
  // extinguishingAgent is both the container and the agent's name in it: no coercion either way.
  const scalar = [...k.types].filter((t) => t !== "object");
  if (scalar.length > 1 && !scalar.every((t) => t === "integer" || t === "number")) {
    throw new Error(`${name}: mixed value types ${[...k.types].join(", ")}`);
  }
  const def: Record<string, unknown> = { "@id": `${elements.has(name) ? "bpr" : "bprx"}:${name}` };
  const dt = datatype(k);
  if (dt) def["@type"] = dt;
  if (k.array) def["@container"] = "@set";
  ctx[name] = def;
  if (!elements.has(name)) slots.push(name);
}
for (const e of elements) if (!keys.has(e)) throw new Error(`${e} is in ${VOCAB} but in no schema`);

writeFileSync(join(ROOT, CONTEXT), JSON.stringify({
  _comment: "GENERATED by scripts/build-batterypass-ready-context.ts - do not edit. Reads a BatteryPass-Ready 2.0.1 document (GEFEG JSON Schemas, vendor/batterypass-ready/2.0.1) as RDF, nested as the JSON is: data elements are bpr: (vocab/batterypass-ready-2.0.1.ttl), the keys of value containers bprx: (vocab/batterypass-ready-2.0.1-json.ttl). The crosswalk profile batterypass converts it to and from OpenEPCIS.",
  "@context": ctx,
}, null, 2) + "\n");

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const ttl = [
  "# GENERATED by scripts/build-batterypass-ready-context.ts - do not edit.",
  "@prefix bprx: <" + BPRX + "> .",
  "@prefix dcterms: <http://purl.org/dc/terms/> .",
  "@prefix owl: <http://www.w3.org/2002/07/owl#> .",
  "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .",
  "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .",
  "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .",
  "",
  "<https://ref.openepcis.org/vocab/batterypass-ready/2.0.1/json> a owl:Ontology ;",
  '    dcterms:title "BatteryPass-Ready 2.0.1 JSON form"@en ;',
  '    dcterms:description "The keys of the value containers of the BatteryPass-Ready 2.0.1 JSON Schemas (unit, value, url, name, ...) and the document root, so that a 2.0.1 document reads as RDF with context/batterypass-ready-2.0.1-context.jsonld. Serialisation slots, not data points: the data elements are in vocab/batterypass-ready-2.0.1.ttl."@en ;',
  "    dcterms:source <https://git.gefeg.com/bp/BatteryPassDataModel> ;",
  '    owl:versionInfo "2.0.1" .',
  "",
  "bprx:BatteryPassport a rdfs:Class ;",
  '    rdfs:label "Battery passport document"@en ;',
  '    rdfs:comment "The root object of a BatteryPass-Ready 2.0.1 document ({dppHeader, batteryPassportData}). Not a key of the JSON: a reader of the document gives the root this type."@en ;',
  "    rdfs:isDefinedBy <https://ref.openepcis.org/vocab/batterypass-ready/2.0.1/json> .",
  "",
  ...slots.flatMap((name) => {
    const k = keys.get(name)!;
    const dt = datatype(k);
    const parents = [...k.parents].sort().map(label);
    return [
      `bprx:${name} a rdf:Property ;`,
      `    rdfs:label "${esc(label(name))}"@en ;`,
      `    rdfs:comment "${esc(`Value slot of: ${parents.slice(0, 6).join(", ")}${parents.length > 6 ? ", ..." : ""}.`)}"@en ;`,
      ...(dt ? [`    rdfs:range ${dt} ;`] : []),
      "    rdfs:isDefinedBy <https://ref.openepcis.org/vocab/batterypass-ready/2.0.1/json> .",
      "",
    ];
  }),
].join("\n");
writeFileSync(join(ROOT, JSON_VOCAB), ttl);
writeFileSync(join(ROOT, STRUCTURE), [
  "# GENERATED by scripts/build-batterypass-ready-context.ts - do not edit.",
  "# Where each data element of a BatteryPass-Ready 2.0.1 document sits: in the header (bpr:dppHeader)",
  "# or in a data group under bpr:batteryPassportData, and the battery categories (schema file names)",
  "# whose schema has it. The lift writes an element flat on the passport root; reshape/ nests it here.",
  "@prefix bpr: <" + BPR + "> .",
  "@prefix bprx: <" + BPRX + "> .",
  "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .",
  "@prefix xw: <https://ref.openepcis.org/extensions/common/interop/crosswalk#> .",
  "",
  ...[...placement.keys()].sort().flatMap((el) => [...placement.get(el)!].map(([g, cats]) =>
    `bpr:${el} xw:group bpr:${g} ; xw:category ${[...cats].sort().map((c) => `"${c}"`).join(", ")} .`)),
  "",
  "bpr:dppHeader xw:group xw:Root .",
  ...[...new Set([...placement.values()].flatMap((m) => [...m.keys()]))].filter((g) => g !== "dppHeader").sort()
    .map((g) => `bpr:${g} xw:group bpr:batteryPassportData .`),
  "bpr:batteryPassportData xw:group xw:Root .",
  "",
  "# The datatype of every numeric key, data element or value slot, as the schemas type it.",
  ...[...keys.keys()].sort().filter((n) => datatype(keys.get(n)!))
    .map((n) => `${elements.has(n) ? "bpr" : "bprx"}:${n} xw:datatype ${datatype(keys.get(n)!)} .`),
  "",
].join("\n"));
console.log(`${CONTEXT}: ${keys.size} keys (${elements.size} data elements, ${slots.length} slots)`);
