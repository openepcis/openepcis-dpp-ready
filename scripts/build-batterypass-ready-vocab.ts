/**
 * Generate the GEFEG BatteryPass-Ready attribute vocabulary (RDF/Turtle).
 *
 * GEFEG's BatteryPass-Ready (thebatterypass.eu / batterypass-ready.gefeg.com) is a
 * v1.3 attribute *longlist* plus a v1.0 validation test environment. It publishes NO
 * RDF/IRIs. This script mints an OpenEPCIS-hosted RDF reference for that attribute
 * set so it can be aligned against our terms (cross-vocabulary SKOS assessment) and
 * surfaced on ref.openepcis.io as a distinct vocabulary.
 *
 * This is NOT the BatteryPass Consortium SAMM data model (that is
 * urn:samm:io.BatteryPass.*, v1.2.x, referenced separately as samm-* in the bridge
 * contexts). The two are distinct sources.
 *
 * Source of the attribute set: the union of the seven SAMM-group property sets
 * across ALL five live-derived category schemas
 * (extensions/eu/battery/validation/gefeg-live/*.schema.json) — the full GEFEG
 * attribute set, category-specific fields included (not just the subset our
 * exporter emits). Controlled enums come from the same schemas' $defs.
 *
 * Output: extensions/eu/battery/vocab/batterypass-ready-1.3.ttl
 * Run: pnpm run build:batterypass-ready-vocab
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const NS = "https://ref.openepcis.io/vocab/batterypass-ready/1.3#";
const ONT = "https://ref.openepcis.io/vocab/batterypass-ready/1.3";
const GEFEG_DIR = join(ROOT, "extensions/eu/battery/validation/gefeg-live");

// The seven SAMM aspect groups, in canonical order.
const GROUPS = [
  "IdentifiersAndProductData",
  "PerformanceAndDurability",
  "BatteryCarbonFootprint",
  "BatteryMaterialsAndComposition",
  "CircularityAndResourceEfficiency",
  "SupplyChainDueDiligence",
  "SymbolsLabelsAndDocumentationOfConformity",
];

// Union of each group's attribute properties across all five category schemas —
// the full GEFEG attribute set (category-specific fields included).
const schemas = readdirSync(GEFEG_DIR)
  .filter((f) => f.endsWith(".schema.json"))
  .map((f) => JSON.parse(readFileSync(join(GEFEG_DIR, f), "utf-8")) as { $defs?: Record<string, any> });

const groupAttrs: Record<string, string[]> = {};
for (const g of GROUPS) {
  const set = new Set<string>();
  for (const s of schemas) {
    const props = s.$defs?.[g]?.properties ?? {};
    for (const k of Object.keys(props)) set.add(k);
  }
  groupAttrs[g] = [...set].sort();
}

// Controlled value enums worth minting as concepts (attribute-level enums; unit
// enums like volt/percent are skipped — they are units, not passport concepts).
const evSchema = schemas.length
  ? JSON.parse(readFileSync(join(GEFEG_DIR, "EV.schema.json"), "utf-8"))
  : ({} as { $defs?: Record<string, any> });
const ENUM_DEFS = ["batteryCategoryCodes", "batteryStatusCodes", "customChemicalCodes", "dppStatusCodes"];

function enumValues(defName: string): string[] {
  const body = evSchema.$defs?.[defName];
  if (!body) return [];
  if (Array.isArray(body.enum)) return body.enum as string[];
  for (const v of Object.values(body.properties ?? {})) {
    if (v && typeof v === "object" && Array.isArray((v as any).enum)) return (v as any).enum as string[];
  }
  return [];
}

// Humanize a GEFEG PascalCase/hyphenated attribute name into a label.
function label(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const lines: string[] = [];

lines.push("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .");
lines.push("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .");
lines.push("@prefix owl: <http://www.w3.org/2002/07/owl#> .");
lines.push("@prefix skos: <http://www.w3.org/2004/02/skos/core#> .");
lines.push("@prefix dcterms: <http://purl.org/dc/terms/> .");
lines.push("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .");
lines.push("");
lines.push(`<${ONT}>`);
lines.push("    a owl:Ontology ;");
lines.push('    dcterms:title "GEFEG BatteryPass-Ready attribute vocabulary (longlist v1.3)"@en ;');
lines.push(
  '    dcterms:description "OpenEPCIS-hosted RDF reference for the GEFEG BatteryPass-Ready v1.3 attribute longlist (thebatterypass.eu / batterypass-ready.gefeg.com). GEFEG publishes no RDF IRIs; this vocabulary mirrors the attribute set so it can be aligned with OpenEPCIS terms and browsed as a distinct vocabulary. This is NOT the BatteryPass Consortium SAMM data model (urn:samm:io.BatteryPass.*, v1.2.x), which is a separate source."@en ;'
);
lines.push("    dcterms:source <https://thebatterypass.eu/battery-pass-ready/publications/> ;");
lines.push('    owl:versionInfo "1.3 (longlist); GEFEG validation data model v1.0" .');
lines.push("");

let propCount = 0;
for (const group of GROUPS) {
  const attrs = groupAttrs[group];
  lines.push(`# ${group}`);
  for (const attr of attrs) {
    lines.push(`<${NS}${attr}>`);
    lines.push("    a rdf:Property ;");
    lines.push(`    rdfs:label "${esc(label(attr))}"@en ;`);
    lines.push(`    rdfs:comment "GEFEG BatteryPass-Ready longlist v1.3 attribute (group ${group})."@en ;`);
    lines.push(`    rdfs:isDefinedBy <${ONT}> ;`);
    lines.push(`    dcterms:source <https://thebatterypass.eu/battery-pass-ready/publications/> .`);
    lines.push("");
    propCount++;
  }
}

// Controlled-value concept schemes
let conceptCount = 0;
for (const defName of ENUM_DEFS) {
  const values = enumValues(defName);
  if (!values.length) continue;
  const scheme = `${NS}${defName}`;
  lines.push(`# Controlled values: ${defName}`);
  lines.push(`<${scheme}> a skos:ConceptScheme ; rdfs:label "${esc(label(defName))}"@en ; rdfs:isDefinedBy <${ONT}> .`);
  for (const v of values) {
    const slug = v.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    lines.push(`<${NS}${defName}/${slug}>`);
    lines.push(`    a skos:Concept ; skos:inScheme <${scheme}> ;`);
    lines.push(`    skos:prefLabel "${esc(v)}"@en ; rdfs:isDefinedBy <${ONT}> .`);
    conceptCount++;
  }
  lines.push("");
}

const OUT_DIR = join(ROOT, "extensions/eu/battery/vocab");
mkdirSync(OUT_DIR, { recursive: true });
const OUT = join(OUT_DIR, "batterypass-ready-1.3.ttl");
writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`Wrote ${OUT}`);
console.log(`  ${propCount} attribute properties across ${GROUPS.length} groups`);
console.log(`  ${conceptCount} controlled-value concepts across ${ENUM_DEFS.length} enums`);
