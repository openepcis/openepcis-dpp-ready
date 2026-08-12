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
 *   extensions/eu/battery/validation/ec-readiness-shapes.ttl   (SHACL)
 *   extensions/eu/battery/docs/EC_GUIDANCE_DATAPOINTS.md
 * Run: pnpm run build:ec-guidance-vocab
 *
 * The SHACL artifact makes the applicability matrix executable by ANY SHACL
 * engine, not just our readiness checker: one node shape per (data point,
 * category), each carrying a single constraint (property minCount, or sh:or
 * across the alternative carrying terms; the identification data points 1/7
 * additionally accept a GS1 Digital Link focus-node IRI via sh:pattern), the
 * status mapped to SHACL severity (mandatory=Violation, conditional=Warning,
 * optional/pending=Info; notToBeFilled emits no shape), the guidance wording
 * in sh:message and the registry IRI in rdfs:seeAlso. All shapes ship
 * sh:deactivated true; a validator activates the shapes of ONE category
 * (IRI suffix -ev / -lmt / -industrial) — otherwise a passport would be
 * checked against all three categories at once.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Parser } from "n3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MODULE = join(ROOT, "extensions/eu/battery");
const SOURCE = join(MODULE, "vocab/ec-guidance-datapoints.json");
const OUT_TTL = join(MODULE, "vocab/ec-battery-passport-guidance-1.0.ttl");
const OUT_MATRIX = join(MODULE, "validation/ec-datapoint-applicability.json");
const OUT_SHAPES = join(MODULE, "validation/ec-readiness-shapes.ttl");
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

const CAT_LABEL = { ev: "EV", lmt: "LMT", industrial: "industrial" } as const;
const appPhrase = (a: Applicability) =>
  a.note ? `${a.status} (${a.note})` : a.status;

for (const dp of dataPoints) {
  const t: string[] = [];
  t.push(`${dpIri(dp.nr)}`);
  t.push(`    a rdf:Property, cccev:InformationRequirement ;`);
  t.push(`    rdfs:label "${esc(dp.name)}"@en ;`);
  // Compact human summary — carried into the vendored term data that powers
  // the ref.openepcis.io term cards (the converter forwards rdfs:comment).
  const comment =
    `European Commission Battery Passport data point ${dp.nr}` +
    (dp.source ? ` (${dp.source})` : "") +
    `. Applicability as of Feb 2027 — ` +
    (["ev", "lmt", "industrial"] as const)
      .map((c) => `${CAT_LABEL[c]}: ${appPhrase(dp.applicability[c])}`)
      .join("; ") +
    `. ${dp.lifecycle === "dynamic" ? "Dynamic (folded from the EPCIS event stream at item level)" : "Static master data (resolver-served)"}; access tier: ${dp.accessTier}.` +
    ` Carried by ${dp.implementedBy.join(", ")}.` +
    (dp.remark ? ` ${dp.remark}` : "");
  t.push(`    rdfs:comment "${esc(comment)}"@en ;`);
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

// ── SHACL readiness shapes ───────────────────────────────────────────────────
//
// SHACL is graph-precise: most carrying terms do not hang directly off the
// eubat:Battery focus node but sit on linked nodes (technicalSpecifications/
// ratedCapacity, endOfLifeInfo/extinguishingAgent, manufacturer/address …).
// The anchor paths are DERIVED from the ontologies' rdfs:domain declarations:
// BFS over the object-property edges starting at the product node yields the
// shortest property path(s) from Battery to each term's domain class.

const PREFIXES: Record<string, string> = {
  "https://ref.gs1.org/voc/": "gs1:",
  "https://schema.org/": "schema:",
  "https://ref.openepcis.io/extensions/common/core/": "oec:",
  "https://ref.openepcis.io/extensions/eu/battery/": "eubat:",
};
const toCurie = (iri: string): string => {
  for (const [ns, prefix] of Object.entries(PREFIXES)) {
    if (iri.startsWith(ns)) return prefix + iri.slice(ns.length);
  }
  return `<${iri}>`;
};
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const OWL = "http://www.w3.org/2002/07/owl#";

/** curie -> ordered path segments (curie[]) from the Battery focus node; [] = flat. */
function deriveAnchorPaths(): Map<string, string[][]> {
  const quads = [
    ...new Parser().parse(readFileSync(join(MODULE, "ontology/battery.ttl"), "utf-8")),
    ...new Parser().parse(
      readFileSync(join(ROOT, "extensions/common/core/ontology/dpp-core.ttl"), "utf-8"),
    ),
  ];
  const domain = new Map<string, string>();
  const range = new Map<string, string>();
  const objectProps = new Set<string>();
  for (const q of quads) {
    if (q.predicate.value === `${RDFS}domain` && q.object.termType === "NamedNode")
      domain.set(q.subject.value, q.object.value);
    if (q.predicate.value === `${RDFS}range` && q.object.termType === "NamedNode")
      range.set(q.subject.value, q.object.value);
    if (
      q.predicate.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" &&
      q.object.value === `${OWL}ObjectProperty`
    )
      objectProps.add(q.subject.value);
  }

  // The product/battery focus node. Object properties without a declared domain
  // are treated as product-level (the core's cross-cutting pattern), and
  // gs1:manufacturer is the (upstream, locally undeclared) edge to Organization.
  const START = "__product__";
  const classOf = (c: string | undefined) =>
    !c ||
    c === "https://ref.gs1.org/voc/Product" ||
    c === "https://ref.openepcis.io/extensions/eu/battery/Battery" ||
    c === "https://schema.org/Product"
      ? START
      : c;
  const edges = new Map<string, Array<{ via: string; to: string }>>();
  const addEdge = (from: string, via: string, to: string) => {
    if (!edges.has(from)) edges.set(from, []);
    edges.get(from)!.push({ via, to });
  };
  for (const p of objectProps) {
    const to = range.get(p);
    if (!to) continue;
    addEdge(classOf(domain.get(p)), p, to);
  }
  addEdge(START, "https://ref.gs1.org/voc/manufacturer", "https://ref.gs1.org/voc/Organization");

  // Enumerate up to 3 distinct SIMPLE paths (no class revisited) from START to
  // every reachable class, depth <= 3, shorter paths first. Collecting every
  // valid route — not only the shortest — lets a term reachable through more
  // than one carrier anchor as an sh:or of all of them: e.g.
  // eubat:hasPowerCapability sits on PowerCapabilityAtSoC, reachable both via
  // hasOriginalPowerCapability (original, static power) and via
  // hasRemainingPowerCapability (dynamic, state-of-health power) — EC data
  // point 53 ("Power in W") legitimately accepts either. This only ADDS
  // alternatives; it never drops or narrows a constraint.
  const pathsTo = new Map<string, string[][]>();
  for (let maxDepth = 1; maxDepth <= 3; maxDepth++) {
    const walk = (at: string, path: string[], visited: Set<string>) => {
      if (path.length >= maxDepth) return;
      for (const { via, to } of edges.get(at) ?? []) {
        if (visited.has(to)) continue; // simple path only
        const newPath = [...path, via];
        if (newPath.length === maxDepth) {
          if (!pathsTo.has(to)) pathsTo.set(to, []);
          const bucket = pathsTo.get(to)!;
          const key = newPath.join(">");
          if (bucket.length < 3 && !bucket.some((p) => p.join(">") === key))
            bucket.push(newPath);
        }
        walk(to, newPath, new Set([...visited, to]));
      }
    };
    walk(START, [], new Set<string>([START]));
  }

  // Locally undeclared upstream carrying-term domains (GS1 Web Vocabulary).
  const GS1_ORG = "https://ref.gs1.org/voc/Organization";
  const UPSTREAM_DOMAIN: Record<string, string> = {
    "gs1:organizationName": GS1_ORG,
    "gs1:address": GS1_ORG,
    "gs1:contactPoint": GS1_ORG,
  };

  const result = new Map<string, string[][]>();
  const allTerms = new Set<string>();
  for (const dp of dataPoints) for (const t of dp.implementedBy) allTerms.add(t);
  for (const term of allTerms) {
    if (isClassTerm(term)) continue;
    const iri = curieToIri(term);
    const d = UPSTREAM_DOMAIN[term] ?? domain.get(iri);
    const cls = classOf(d);
    if (cls === START) {
      result.set(term, [[]]);
      continue;
    }
    const anchors = pathsTo.get(cls);
    // Fallback: no derivable anchor -> flat path (still catches direct use).
    result.set(
      term,
      anchors?.length ? anchors.map((a) => [...a.map(toCurie)]) : [[]],
    );
  }
  return result;
}

const isClassTerm = (curie: string) => /^[A-Z]/.test(curie.split(":").pop() ?? "");
const curieToIri = (curie: string): string => {
  for (const [ns, prefix] of Object.entries(PREFIXES)) {
    if (curie.startsWith(prefix)) return ns + curie.slice(prefix.length);
  }
  return curie;
};

const anchorPaths = deriveAnchorPaths();

const SEVERITY: Record<Applicability["status"], string | null> = {
  mandatory: "sh:Violation",
  conditional: "sh:Warning",
  optional: "sh:Info",
  pending: "sh:Info",
  notToBeFilled: null,
};

const STATUS_HINT: Record<Applicability["status"], string> = {
  mandatory: "mandatory",
  conditional: "provide if the condition applies",
  optional: "optional",
  pending: "not yet required as of Feb 2027 (act outstanding)",
  notToBeFilled: "",
};

/**
 * sh:or members for one carrying term: one property shape per derived anchor
 * path ([] = flat -> sh:path <term>; segments -> SHACL sequence path).
 * Class-typed carriers are skipped — every data point also has a property
 * carrier, and "class used anywhere" is not expressible as a focus-node path.
 */
function orMembers(term: string): string[] {
  if (isClassTerm(term)) return [];
  const variants = anchorPaths.get(term) ?? [[]];
  return variants.map((segments) => {
    const path = segments.length ? `( ${[...segments, term].join(" ")} )` : term;
    return `[ sh:path ${path} ; sh:minCount 1 ]`;
  });
}

/** GS1 Digital Link product identity on the focus node, as an sh:or member. */
const DL_MEMBER = `[ sh:nodeKind sh:IRI ; sh:pattern "/01/[0-9]{8,14}" ]`;

const shapes: string[] = [];
shapes.push(`@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix gs1: <https://ref.gs1.org/voc/> .
@prefix schema: <https://schema.org/> .
@prefix oec: <https://ref.openepcis.io/extensions/common/core/> .
@prefix eubat: <https://ref.openepcis.io/extensions/eu/battery/> .
@prefix ecbp: <${NS}> .

# GENERATED FILE - do not edit. Source: vocab/ec-guidance-datapoints.json,
# generator: scripts/build-ec-guidance-vocab.ts (pnpm run build:ec-guidance-vocab).

<https://ref.openepcis.io/extensions/eu/battery/ec-readiness-shapes.ttl>
    a sh:ShapesGraph ;
    dcterms:title "EC Battery Passport readiness shapes (guidance v${doc.version})"@en ;
    dcterms:description "SHACL form of the EC guidance applicability matrix (${esc(doc.reference)}): one node shape per (data point, category), targeting eubat:Battery. Statuses map to severities - mandatory = sh:Violation, conditional = sh:Warning, optional and pending = sh:Info; 'not to be filled' data points emit no shape. Every shape ships sh:deactivated true: activate the shapes of exactly ONE category (IRI suffix -ev / -lmt / -industrial) before validating, otherwise a passport is checked against all three categories at once. Validate the MERGED model + batch + item graphs of one battery - the dynamic Annex XIII 4 data points only exist at item level. This is the structural coverage check made executable for any SHACL engine; value-level validation lives in battery-shapes.ttl."@en ;
    dcterms:source <${doc.regulation}> ;
    dcterms:license <${doc.license}> ;
    rdfs:seeAlso <${ONT}> ;
    owl:versionInfo "${doc.version}" .
`);

// owl prefix used only in the header line above.
shapes[0] = shapes[0].replace("@prefix sh:", "@prefix owl: <http://www.w3.org/2002/07/owl#> .\n@prefix sh:");

for (const cat of ["ev", "lmt", "industrial"] as const) {
  const catLabel = { ev: "EV", lmt: "LMT", industrial: "industrial" }[cat];
  shapes.push(`# ── ${catLabel} batteries ${"─".repeat(Math.max(1, 60 - catLabel.length))}\n`);
  for (const dp of dataPoints) {
    const a = dp.applicability[cat];
    const severity = SEVERITY[a.status];
    if (!severity) continue;
    const nr = String(dp.nr).padStart(2, "0");
    const members = dp.implementedBy.flatMap(orMembers);
    if (dp.nr === 1 || dp.nr === 7) members.push(DL_MEMBER);
    const constraint =
      members.length === 1
        ? `    sh:property ${members[0].replace("]", `; sh:severity ${severity} ; sh:message "${esc(
            `EC data point ${dp.nr} (${catLabel}, ${STATUS_HINT[a.status]}${a.note ? `: ${a.note}` : ""}): ${dp.name} — expected ${dp.implementedBy.join(" / ")}`,
          )}" ]`)} ;`
        : `    sh:or ( ${members.join(" ")} ) ;\n    sh:severity ${severity} ;\n    sh:message "${esc(
            `EC data point ${dp.nr} (${catLabel}, ${STATUS_HINT[a.status]}${a.note ? `: ${a.note}` : ""}): ${dp.name} — expected ${dp.implementedBy.join(" / ")}${dp.nr === 1 || dp.nr === 7 ? " or a GS1 Digital Link id" : ""}`,
          )}" ;`;
    shapes.push(`ecbp:dp-${nr}-${cat}
    a sh:NodeShape ;
    sh:targetClass eubat:Battery ;
    sh:deactivated true ;
${constraint}
    rdfs:seeAlso ${dpIri(dp.nr)} .
`);
  }
}

writeFileSync(OUT_SHAPES, shapes.join("\n"));

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
- **SHACL readiness shapes**: [\`../validation/ec-readiness-shapes.ttl\`](../validation/ec-readiness-shapes.ttl) — the matrix made executable for any SHACL engine: one node shape per (data point, category) with the status mapped to severity (mandatory = Violation, conditional = Warning, optional/pending = Info) and the anchor paths derived from the ontologies' \`rdfs:domain\` declarations. All shapes ship \`sh:deactivated true\`; activate exactly one category (IRI suffix \`-ev\`/\`-lmt\`/\`-industrial\`) and validate the merged model + batch + item graphs. \`pnpm run check:ec-readiness -- --shacl\` does both automatically.
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
console.log(`✔ ${OUT_SHAPES.replace(ROOT + "/", "")}`);
console.log(`✔ ${OUT_DOC.replace(ROOT + "/", "")}`);
