/**
 * Generate the EC Battery Passport guidance data-point registry (RDF/Turtle).
 *
 * The European Commission's "Guidance Document: Digital Batteries Passport -
 * data points by category" (v1.0, 28 July 2026, Ares(2026)7579758, CC BY 4.0)
 * is the first official EU enumeration of the Battery Passport data points:
 * 71 numbered entries, each with its legal source in Regulation (EU) 2023/1542
 * and an applicability matrix per battery category (EV / LMT / industrial),
 * including which data points are NOT to be filled/displayed as of February
 * 2027. The Commission publishes no RDF/IRIs; like the GEFEG BatteryPass-Ready
 * mirror (build-batterypass-ready-vocab.ts) this script mints an
 * OpenEPCIS-hosted RDF reference so the data points can be aligned with our
 * terms and browsed on ref.openepcis.io.
 *
 * Each data point is dual-typed rdf:Property + cccev:InformationRequirement:
 * the EU data points are information REQUIREMENTS that reference properties,
 * not properties themselves — modelled with the EU's own SEMICeu CCCEV
 * building block. The registry also encodes the document's mechanics:
 *   - lifecycle: Annex XIII 4 data points (51-71) are dynamic (EPCIS event
 *     stream folded into the item passport); the rest are static resolver-
 *     served master data,
 *   - accessTier: derived from BR Article 77(2) via the Annex XIII paragraph,
 *   - applicability per category with the guidance's verbatim conditions,
 *   - implementedBy links to the operative eubat:/gs1:/oec:/schema: terms.
 *
 * Source of truth: extensions/eu/battery/vocab/ec-guidance-datapoints.json
 * Outputs:
 *   extensions/eu/battery/vocab/ec-battery-passport-guidance-1.0.ttl
 *   extensions/eu/battery/validation/ec-datapoint-applicability.json
 *   extensions/eu/battery/docs/EC_GUIDANCE_DATAPOINTS.md
 * Run: pnpm run build:ec-guidance-vocab
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MODULE = join(ROOT, "extensions/eu/battery");
const SOURCE = join(MODULE, "vocab/ec-guidance-datapoints.json");
const OUT_TTL = join(MODULE, "vocab/ec-battery-passport-guidance-1.0.ttl");
const OUT_MATRIX = join(MODULE, "validation/ec-datapoint-applicability.json");
const OUT_DOC = join(MODULE, "docs/EC_GUIDANCE_DATAPOINTS.md");

const NS = "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#";
const ONT = "https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0";

interface Applicability {
  status: "mandatory" | "optional" | "conditional" | "notToBeFilled" | "pending";
  note?: string;
}

interface DataPoint {
  nr: number;
  name: string;
  source: string | null;
  lifecycle: "static" | "dynamic";
  accessTier: "public" | "legitimateInterest" | "notifiedBodiesAndAuthorities";
  applicability: { ev: Applicability; lmt: Applicability; industrial: Applicability };
  implementedBy: string[];
  epcisExample?: string;
  relatedDataPoints?: number[];
  aggregates?: number[];
  remark?: string;
}

interface Registry {
  document: {
    title: string;
    version: string;
    issued: string;
    publisher: string;
    reference: string;
    license: string;
    regulation: string;
  };
  dataPoints: DataPoint[];
}

const registry: Registry = JSON.parse(readFileSync(SOURCE, "utf-8"));
const { document: doc, dataPoints } = registry;

if (dataPoints.length !== 71) {
  throw new Error(`Expected 71 data points, found ${dataPoints.length}`);
}
for (let i = 0; i < dataPoints.length; i++) {
  if (dataPoints[i].nr !== i + 1) throw new Error(`Data point at index ${i} has nr ${dataPoints[i].nr}`);
}

const dpIri = (nr: number) => `<${NS}dp-${String(nr).padStart(2, "0")}>`;
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

/** CURIE from the source JSON → TTL token (all prefixes declared in the header). */
const curie = (t: string) => t;

// ── TTL ──────────────────────────────────────────────────────────────────────

const lines: string[] = [];
lines.push(`@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix cccev: <http://data.europa.eu/m8g/> .
@prefix gs1: <https://ref.gs1.org/voc/> .
@prefix schema: <https://schema.org/> .
@prefix oec: <https://ref.openepcis.io/extensions/common/core/> .
@prefix eubat: <https://ref.openepcis.io/extensions/eu/battery/> .
@prefix ecbp: <${NS}> .

# GENERATED FILE - do not edit. Source: vocab/ec-guidance-datapoints.json,
# generator: scripts/build-ec-guidance-vocab.ts (pnpm run build:ec-guidance-vocab).

<${ONT}>
    a owl:Ontology ;
    dcterms:title "EC Battery Passport guidance data-point registry (v1.0)"@en ;
    dcterms:description "OpenEPCIS-hosted RDF reference for the European Commission '${esc(doc.title)}' (Version ${doc.version}, ${doc.issued}, ${doc.reference}). The Commission publishes the 71 Battery Passport data points as a textual table without IRIs; this registry mirrors them so they can be aligned with OpenEPCIS terms and browsed as a distinct vocabulary. Each data point is dual-typed rdf:Property + cccev:InformationRequirement and carries its legal source in Regulation (EU) 2023/1542, the per-category applicability as of February 2027 (EV / LMT / industrial), the static/dynamic lifecycle split (Annex XIII 4 = dynamic, served by the EPCIS event stream), the access tier derived from Article 77(2), and ecbp:implementedBy links to the operative OpenEPCIS/GS1 terms. Reused under CC BY 4.0; the guidance document is not an official position of the European Commission and this registry restructures its table into RDF."@en ;
    dcterms:publisher "${esc(doc.publisher)}"@en ;
    dcterms:creator "OpenEPCIS" ;
    dcterms:issued "${doc.issued}"^^xsd:date ;
    dcterms:license <${doc.license}> ;
    dcterms:source <${doc.regulation}> ;
    dcterms:bibliographicCitation "European Commission, ${esc(doc.title)}, Version ${doc.version}, ${doc.reference}"@en ;
    owl:versionInfo "${doc.version}" ;
    rdfs:seeAlso <https://ref.openepcis.io/extensions/eu/battery/> ;
    rdfs:seeAlso <https://ref.openepcis.io/vocab/batterypass-ready/1.3> .

# ── Registry annotation properties ───────────────────────────────────────────

ecbp:implementedBy
    a owl:AnnotationProperty ;
    rdfs:label "implemented by"@en ;
    rdfs:comment "Operative vocabulary term (eubat:/gs1:/oec:/schema:) that carries this EU data point in an OpenEPCIS battery passport."@en ;
    rdfs:isDefinedBy <${ONT}> .

ecbp:lifecycle
    a owl:AnnotationProperty ;
    rdfs:label "lifecycle"@en ;
    rdfs:comment "The guidance document's static/dynamic split: 'static' data points (Article 77(3), Annex VI A, Annex XIII 1-3) are model/batch master data served by the GS1 Digital Link resolver; 'dynamic' data points (Annex XIII 4, numbers 51-71) are updatable values folded from the EPCIS event stream into the item passport."@en ;
    rdfs:isDefinedBy <${ONT}> .

ecbp:accessTier
    a owl:AnnotationProperty ;
    rdfs:label "access tier"@en ;
    rdfs:comment "Access tier derived from Regulation (EU) 2023/1542 Article 77(2) via the data point's Annex XIII paragraph: 'public' (Annex XIII 1, Annex VI A, Article 77(3)), 'legitimateInterest' (Annex XIII 2 and 4), 'notifiedBodiesAndAuthorities' (Annex XIII 3). Not stated in the guidance document itself."@en ;
    dcterms:source <${doc.regulation}> ;
    rdfs:isDefinedBy <${ONT}> .

ecbp:applicabilityEV
    a owl:AnnotationProperty ;
    rdfs:label "applicability (EV batteries)"@en ;
    rdfs:comment "Applicability of the data point for electric vehicle batteries as of February 2027: mandatory | optional | conditional | notToBeFilled | pending. Conditions are quoted in skos:scopeNote."@en ;
    rdfs:isDefinedBy <${ONT}> .

ecbp:applicabilityLMT
    a owl:AnnotationProperty ;
    rdfs:label "applicability (LMT batteries)"@en ;
    rdfs:comment "Applicability of the data point for light means of transport batteries as of February 2027: mandatory | optional | conditional | notToBeFilled | pending. Conditions are quoted in skos:scopeNote."@en ;
    rdfs:isDefinedBy <${ONT}> .

ecbp:applicabilityIndustrial
    a owl:AnnotationProperty ;
    rdfs:label "applicability (industrial batteries)"@en ;
    rdfs:comment "Applicability of the data point for industrial batteries as of February 2027: mandatory | optional | conditional | notToBeFilled | pending. Conditions are quoted in skos:scopeNote."@en ;
    rdfs:isDefinedBy <${ONT}> .

ecbp:epcisExample
    a owl:AnnotationProperty ;
    rdfs:label "EPCIS example"@en ;
    rdfs:comment "Repository-relative path (extensions/eu/battery/) of an EPCIS 2.0 event example demonstrating how this dynamic data point is captured in the event stream."@en ;
    rdfs:isDefinedBy <${ONT}> .
`);

for (const dp of dataPoints) {
  const t: string[] = [];
  t.push(`${dpIri(dp.nr)}`);
  t.push(`    a rdf:Property, cccev:InformationRequirement ;`);
  t.push(`    rdfs:label "${esc(dp.name)}"@en ;`);
  t.push(`    skos:notation "${dp.nr}" ;`);
  if (dp.source) {
    t.push(`    dcterms:bibliographicCitation "${esc(dp.source)}"@en ;`);
  } else {
    t.push(`    skos:historyNote "The guidance document lists no data point source for this entry."@en ;`);
  }
  t.push(`    dcterms:source <${doc.regulation}> ;`);
  t.push(`    ecbp:lifecycle "${dp.lifecycle}" ;`);
  t.push(`    ecbp:accessTier "${dp.accessTier}" ;`);
  t.push(`    ecbp:applicabilityEV "${dp.applicability.ev.status}" ;`);
  t.push(`    ecbp:applicabilityLMT "${dp.applicability.lmt.status}" ;`);
  t.push(`    ecbp:applicabilityIndustrial "${dp.applicability.industrial.status}" ;`);
  const scopeNotes: string[] = [];
  for (const [cat, label] of [["ev", "EV"], ["lmt", "LMT"], ["industrial", "Industrial"]] as const) {
    const a = dp.applicability[cat];
    if (a.note) scopeNotes.push(`${label}: ${a.note}`);
  }
  if (scopeNotes.length) t.push(`    skos:scopeNote "${esc(scopeNotes.join(" | "))}"@en ;`);
  for (const term of dp.implementedBy) {
    t.push(`    ecbp:implementedBy ${curie(term)} ;`);
    t.push(`    rdfs:seeAlso ${curie(term)} ;`);
  }
  for (const rel of dp.relatedDataPoints ?? []) t.push(`    dcterms:relation ${dpIri(rel)} ;`);
  for (const agg of dp.aggregates ?? []) t.push(`    dcterms:references ${dpIri(agg)} ;`);
  if (dp.epcisExample) t.push(`    ecbp:epcisExample "${esc(dp.epcisExample)}" ;`);
  if (dp.remark) t.push(`    skos:editorialNote "${esc(dp.remark)}"@en ;`);
  t.push(`    skos:note "European Commission Battery Passport guidance data point ${dp.nr} (${esc(doc.reference)}, v${doc.version}). Applicability shown is the state as of February 2027 per the guidance table."@en ;`);
  t.push(`    rdfs:isDefinedBy <${ONT}> .`);
  lines.push(t.join("\n") + "\n");
}

writeFileSync(OUT_TTL, lines.join("\n"));

// ── Applicability matrix (tooling/DDM consumption) ───────────────────────────

const matrix = {
  $comment:
    "GENERATED from vocab/ec-guidance-datapoints.json by scripts/build-ec-guidance-vocab.ts - do not edit. Per-category applicability of the 71 EC Battery Passport guidance data points as of February 2027, with the operative OpenEPCIS/GS1 terms per data point. Statuses: mandatory | optional | conditional | notToBeFilled | pending (blocked on an upcoming implementing act / Omnibus IV).",
  document: doc,
  namespace: NS,
  categories: ["ev", "lmt", "industrial"],
  dataPoints: dataPoints.map((dp) => ({
    nr: dp.nr,
    iri: `${NS}dp-${String(dp.nr).padStart(2, "0")}`,
    name: dp.name,
    source: dp.source,
    lifecycle: dp.lifecycle,
    accessTier: dp.accessTier,
    applicability: dp.applicability,
    implementedBy: dp.implementedBy,
    ...(dp.epcisExample ? { epcisExample: dp.epcisExample } : {}),
  })),
};
writeFileSync(OUT_MATRIX, JSON.stringify(matrix, null, 2) + "\n");

// ── Coverage doc ─────────────────────────────────────────────────────────────

const badge = (a: Applicability) =>
  ({ mandatory: "M", optional: "O", conditional: "C", notToBeFilled: "-", pending: "P" }[a.status]);

const md: string[] = [];
md.push(`# EC Battery Passport guidance — data-point coverage

How the 71 data points of the European Commission **${doc.title}**
(Version ${doc.version}, ${doc.issued}, ${doc.reference}, CC BY 4.0) map onto the
OpenEPCIS battery vocabulary (\`eubat:\` plus \`gs1:\` / \`schema:\` / \`oec:\`).

- **Machine-readable registry (RDF)**: [\`../vocab/ec-battery-passport-guidance-1.0.ttl\`](../vocab/ec-battery-passport-guidance-1.0.ttl) — minted under \`${NS}\` because the Commission publishes no IRIs (same pattern as the GEFEG BatteryPass-Ready mirror). Each data point is dual-typed \`rdf:Property\` + \`cccev:InformationRequirement\`.
- **Applicability matrix (JSON)**: [\`../validation/ec-datapoint-applicability.json\`](../validation/ec-datapoint-applicability.json).
- **Source of truth**: [\`../vocab/ec-guidance-datapoints.json\`](../vocab/ec-guidance-datapoints.json); regenerate with \`pnpm run build:ec-guidance-vocab\`.

## The four mechanics encoded in the guidance table

1. **Static vs. dynamic** — Annex XIII 4 data points (51–71) are *dynamic*: the guidance
   marks the static Annex XIII 1(g) rated capacity (#25) "not to be filled" and re-lists it
   as #51 "same as data point 11, **but now dynamic**". Dynamic data points are folded from
   the EPCIS event stream into the item passport; static ones are resolver-served master data.
   Each dynamic entry links the EPCIS event example that demonstrates it.
2. **Access tiers** — the "data point source" column determines who may read the value via
   BR Article 77(2): Annex XIII 1 / VI A / Art. 77(3) = public, XIII 2 and XIII 4 = persons
   with a legitimate interest, XIII 3 = notified bodies and market surveillance authorities.
3. **Category-conditional obligation** — obligation is a function of (data point, battery
   category): e.g. SOCE (#61) is EV-only while the remaining-capacity family (#62–66) applies
   to LMT/industrial; #33 capacity threshold is EV-only.
4. **Regulatory lifecycle** — "pending" data points (#17–19 carbon footprint, #44 instructions
   for use) are not to be filled as of February 2027 because the implementing act / Omnibus IV
   is outstanding; a validator must distinguish *missing* from *not yet required*.

## Coverage table

Applicability: **M** mandatory · **O** optional · **C** conditional (see note) · **P** pending
(not as of Feb 2027, act outstanding) · **–** not to be filled/displayed.

| # | Data point | Source | EV | LMT | Ind | Lifecycle | Implemented by |
|---|---|---|---|---|---|---|---|`);

for (const dp of dataPoints) {
  const name = dp.name.length > 90 ? dp.name.slice(0, 87) + "…" : dp.name;
  md.push(
    `| ${dp.nr} | ${name} | ${dp.source ?? "—"} | ${badge(dp.applicability.ev)} | ${badge(
      dp.applicability.lmt
    )} | ${badge(dp.applicability.industrial)} | ${dp.lifecycle} | ${dp.implementedBy
      .map((t) => `\`${t}\``)
      .join(", ")}${dp.epcisExample ? ` → [\`${dp.epcisExample}\`](../${dp.epcisExample})` : ""} |`
  );
}

md.push(`
## Coverage result

All 71 data points are covered by existing terms — no new \`eubat:\` terms were required.
The split follows the vocabulary layering rule: GS1 Web Vocabulary terms where GS1 already
covers the concept (manufacturer identity #3–5, production date #9, net weight #10, serial
number #7, instructions for use #44), \`eubat:\` terms for battery-specific concepts, and
identification mechanics (passport ID #1, batch/serial #7) via GS1 Digital Link path
segments rather than data attributes. Periodic recordings (#70–71) are the EPCIS
\`sensorElementList\` mechanism rather than master-data attributes.

## Verbatim conditions

Data points whose applicability carries a condition, with the guidance's wording:

| # | Category | Condition |
|---|---|---|`);

for (const dp of dataPoints) {
  for (const [cat, label] of [["ev", "EV"], ["lmt", "LMT"], ["industrial", "Industrial"]] as const) {
    const a = dp.applicability[cat];
    if (a.note) md.push(`| ${dp.nr} | ${label} | ${a.note} |`);
  }
}

md.push(`
---
*Reuse of the guidance document content under CC BY 4.0 with credit to the European
Commission; the table above restructures the document's five-column table into a
coverage mapping and is not an official position of the European Commission.*
`);

writeFileSync(OUT_DOC, md.join("\n"));

console.log(`✔ ${OUT_TTL.replace(ROOT + "/", "")} (${dataPoints.length} data points)`);
console.log(`✔ ${OUT_MATRIX.replace(ROOT + "/", "")}`);
console.log(`✔ ${OUT_DOC.replace(ROOT + "/", "")}`);
