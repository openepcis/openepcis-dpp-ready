/**
 * Generate the GEFEG BatteryPass-Ready longlist-only attribute vocabulary (RDF/Turtle).
 *
 * GEFEG's BatteryPass-Ready (thebatterypass.eu / batterypass-ready.gefeg.com) is the
 * Battery Pass Consortium's publication and validation channel: its v1.3 attribute
 * longlist and v1.0 validation data model render the SAME model as the Consortium
 * SAMM aspect models (urn:samm:io.BatteryPass.*, v1.2.x), which we reference under
 * their real URNs (see build-batterypass-samm-terms.ts). Minting OpenEPCIS IRIs for
 * attributes the SAMM model already identifies would duplicate that vocabulary, so
 * this script mints ONLY the longlist-only remainder:
 *
 *   1. The DPP-information attributes (group IdentifiersAndProductData) that have no
 *      SAMM equivalent: DPP schema version, DPP status, DPP granularity, last update.
 *   2. Four flat longlist keys kept as deliberate lossless carriers in
 *      battery-context-batterypass-bridge.jsonld because OpenEPCIS models the concept
 *      across several terms and a partial match would drop data.
 *
 * KEEP is the explicit list below; every entry is verified at build time to exist in
 * the live-derived schemas (extensions/eu/battery/validation/gefeg-live/*.schema.json)
 * and to have NO name-join match in the Consortium SAMM model.
 *
 * Output: extensions/eu/battery/vocab/batterypass-ready-1.3.ttl
 * Run: pnpm run build:batterypass-ready-vocab
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname, relative, sep } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { Parser } from "n3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const NS = "https://ref.openepcis.io/vocab/batterypass-ready/1.3#";
const ONT = "https://ref.openepcis.io/vocab/batterypass-ready/1.3";

// ── BatteryPass Consortium SAMM descriptions (optional enrichment) ───────────
// GEFEG publishes the BatteryPass-Ready v1.3 attributes as a bare longlist (names
// only, no definitions). The longlist is the same attribute set as the BatteryPass
// Consortium SAMM data model, whose properties DO carry regulation-quoting
// samm:description text. When that model checkout is available we join each bpr
// attribute to the corresponding SAMM property (by normalized name) and reuse its
// definition — giving the vocabulary real, human- and machine-verifiable semantics
// (better vocab pages + alignments the SKOS audit's QA panel can actually confirm,
// rather than the boilerplate that made every candidate read as unverifiable).
// Falls back to a generic note when the checkout is absent or a name has no match.
const SAMM_ROOT =
  process.env.BATTERYPASS_ROOT ?? join(homedir(), "Documents/projects/BatteryPassDataModel");

const normName = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "").toLowerCase();
const versionKey = (p: string) =>
  (relative(SAMM_ROOT, p).split(sep).find((seg) => /^\d+\.\d+\.\d+$/.test(seg)) ?? "0.0.0")
    .split(".")
    .map((n) => Number(n).toString().padStart(4, "0"))
    .join(".");

function walkTtl(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walkTtl(p, out);
    else if (e.endsWith(".ttl")) out.push(p);
  }
  return out;
}

interface SammDef {
  preferredName?: string;
  description?: string;
}

/** name(normalized) -> SAMM preferredName/description, taking the highest model version. */
function loadSammDescriptions(): Map<string, SammDef> {
  const map = new Map<string, SammDef>();
  if (!existsSync(SAMM_ROOT)) {
    console.warn(`  [warn] SAMM checkout not found at ${SAMM_ROOT}; bpr terms keep generic notes.`);
    return map;
  }
  const parser = new Parser();
  // Process files oldest-version first so a higher version's text overwrites.
  const files = walkTtl(SAMM_ROOT).sort((a, b) => versionKey(a).localeCompare(versionKey(b)));
  for (const f of files) {
    let quads;
    try {
      quads = parser.parse(readFileSync(f, "utf-8"));
    } catch {
      continue; // skip anything that is not clean Turtle
    }
    // Only read text off samm:Property subjects. SAMM Characteristics are PascalCase
    // (:NominalVoltage) and collide with their camelCase property (:nominalVoltage)
    // under case-insensitive name matching — and some carry junk descriptions ("s").
    const propIris = new Set<string>();
    for (const q of quads) {
      if (q.predicate.value.endsWith("#type") && q.object.value.endsWith("#Property")) {
        propIris.add(q.subject.value);
      }
    }
    for (const q of quads) {
      if (!propIris.has(q.subject.value)) continue;
      const pred = q.predicate.value;
      if (!pred.endsWith("#preferredName") && !pred.endsWith("#description")) continue;
      if (q.object.termType !== "Literal") continue;
      // preferredName is language-tagged; prefer @en (or untagged).
      const lang = (q.object as unknown as { language?: string }).language ?? "";
      if (lang && lang.toLowerCase() !== "en") continue;
      const val = q.object.value.trim();
      if (val.length < 3) continue; // skip stub text like "s"
      const local = q.subject.value.split(/[#/]/).pop() ?? "";
      if (!local) continue;
      const key = normName(local);
      const entry = map.get(key) ?? {};
      if (pred.endsWith("#preferredName")) entry.preferredName = val;
      else entry.description = val;
      map.set(key, entry);
    }
  }
  return map;
}
const GEFEG_DIR = join(ROOT, "extensions/eu/battery/validation/gefeg-live");

// Longlist-only keep list: attributes with no SAMM equivalent (DPP-information
// group) plus the four flat keys the inbound bridge context keeps as lossless
// carriers. Everything else in the longlist is the Consortium SAMM model and is
// referenced via its real URNs instead of a minted mirror.
const KEEP: Record<string, string[]> = {
  IdentifiersAndProductData: [
    "DPPSchemaVersion",
    "DPPStatus",
    "DPPGranularity",
    "Date-timeOfLatestUpdateOfDPP",
  ],
  PerformanceAndDurability: ["InformationOnAccidents"],
  BatteryMaterialsAndComposition: ["MaterialsUsedInCathodeAnodeAndElectrolyte"],
  SymbolsLabelsAndDocumentationOfConformity: ["SymbolsForCadmiumAndLead", "CarbonFootprintLabel"],
};
const GROUPS = Object.keys(KEEP);

// Verify every KEEP entry against the live-derived schemas, and guard against a
// SAMM term of the same normalized name appearing upstream (which would mean the
// attribute is no longer longlist-only and the mint should be dropped).
const schemas = readdirSync(GEFEG_DIR)
  .filter((f) => f.endsWith(".schema.json"))
  .map((f) => JSON.parse(readFileSync(join(GEFEG_DIR, f), "utf-8")) as { $defs?: Record<string, any> });

const SAMM_TERMS_TTL = join(ROOT, "extensions/eu/battery/vocab/batterypass-samm-terms.ttl");
const sammLocalNames = new Set(
  [...readFileSync(SAMM_TERMS_TTL, "utf-8").matchAll(/urn:samm:io\.BatteryPass\.[A-Za-z]+:[\d.]+#([A-Za-z0-9]+)/g)].map(
    (m) => normName(m[1])
  )
);

const groupAttrs: Record<string, string[]> = {};
for (const g of GROUPS) {
  const inSchemas = new Set<string>();
  for (const s of schemas) {
    const props = s.$defs?.[g]?.properties ?? {};
    for (const k of Object.keys(props)) inSchemas.add(k);
  }
  for (const attr of KEEP[g]) {
    if (!inSchemas.has(attr)) {
      throw new Error(`KEEP attribute ${g}/${attr} not found in gefeg-live schemas — longlist changed upstream?`);
    }
    if (sammLocalNames.has(normName(attr))) {
      throw new Error(
        `KEEP attribute ${g}/${attr} now has a SAMM name-join match — no longer longlist-only, drop the mint and anchor to the SAMM URN instead.`
      );
    }
  }
  groupAttrs[g] = [...KEEP[g]].sort();
}

// Controlled value enums worth minting as concepts (attribute-level enums; unit
// enums like volt/percent are skipped — they are units, not passport concepts).
const evSchema = schemas.length
  ? JSON.parse(readFileSync(join(GEFEG_DIR, "EV.schema.json"), "utf-8"))
  : ({} as { $defs?: Record<string, any> });
// Only the enum backing a kept attribute (DPPStatus). batteryCategoryCodes,
// batteryStatusCodes and customChemicalCodes back SAMM-covered attributes and are
// not minted here.
const ENUM_DEFS = ["dppStatusCodes"];

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

const esc = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");

const sammDefs = loadSammDescriptions();
let enriched = 0;
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
lines.push('    dcterms:title "GEFEG BatteryPass-Ready longlist-only attributes (longlist v1.3)"@en ;');
lines.push(
  '    dcterms:description "OpenEPCIS-hosted RDF reference for the GEFEG BatteryPass-Ready v1.3 longlist attributes that have no equivalent in the Battery Pass Consortium SAMM data model, plus four flat longlist keys kept as lossless carriers in the bridge context. GEFEG (thebatterypass.eu / batterypass-ready.gefeg.com) is the Consortium\'s publication and validation channel; the full model is the Consortium SAMM data model (urn:samm:io.BatteryPass.*, v1.2.x), referenced under its real URNs rather than mirrored here."@en ;'
);
lines.push("    dcterms:source <https://thebatterypass.eu/battery-pass-ready/publications/> ;");
lines.push('    owl:versionInfo "1.3 (longlist); GEFEG validation data model v1.0" .');
lines.push("");

let propCount = 0;
for (const group of GROUPS) {
  const attrs = groupAttrs[group];
  lines.push(`# ${group}`);
  for (const attr of attrs) {
    const samm = sammDefs.get(normName(attr));
    lines.push(`<${NS}${attr}>`);
    lines.push("    a rdf:Property ;");
    lines.push(`    rdfs:label "${esc(label(attr))}"@en ;`);
    if (samm?.description) {
      // Real definition sourced from the corresponding BatteryPass Consortium SAMM
      // property (the longlist and the SAMM model describe the same attribute).
      lines.push(`    rdfs:comment "${esc(samm.description)}"@en ;`);
      lines.push(`    skos:definition "${esc(samm.description)}"@en ;`);
      lines.push(
        `    skos:note "GEFEG BatteryPass-Ready longlist v1.3 attribute (group ${group}). Definition sourced from the corresponding BatteryPass Consortium SAMM property (io.BatteryPass.*), which the longlist derives from."@en ;`
      );
      enriched++;
    } else {
      lines.push(`    rdfs:comment "GEFEG BatteryPass-Ready longlist v1.3 attribute (group ${group})."@en ;`);
    }
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
console.log(`  ${enriched}/${propCount} enriched with a BatteryPass SAMM definition`);
console.log(`  ${conceptCount} controlled-value concepts across ${ENUM_DEFS.length} enums`);
