/**
 * Phase 1 of the schema.org / GS1 realignment.
 *
 * Builds a mapping table classifying every extension term across all 7
 * ontology TTL modules into:
 *   REPLACE_WITH_GS1     — redundant with a GS1 term, delete + use gs1:
 *   REPLACE_WITH_SCHEMA  — redundant with a schema.org term, delete + use schema:
 *   KEEP_LINK_GS1        — keep, but add owl:equivalentProperty / rdfs:subPropertyOf to GS1
 *   KEEP_LINK_SCHEMA     — same against schema.org
 *   KEEP_NO_LINK         — genuinely regulation-specific, no external equivalent
 *
 * Reads cached GS1 + schema.org vocabularies from .cache/vocab/.
 * Outputs a markdown report at docs/skos-alignment/ontology-realignment-mapping.md.
 *
 * Usage: npx tsx scripts/realign-mapping.ts
 */

import { Parser, Store, DataFactory } from "n3";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");
const { namedNode } = DataFactory;

const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const OWL = "http://www.w3.org/2002/07/owl#";
const SKOS = "http://www.w3.org/2004/02/skos/core#";

interface Module {
  prefix: string;
  name: string;
  dir: string;
  ttl: string;
  namespace: string;
}

const MODULES: Module[] = [
  { prefix: "dpp", name: "common/core", dir: "extensions/common/core", ttl: "dpp-core.ttl", namespace: "https://ref.openepcis.io/extensions/common/core/" },
  { prefix: "battery", name: "eu/battery", dir: "extensions/eu/battery", ttl: "battery.ttl", namespace: "https://ref.openepcis.io/extensions/eu/battery/" },
  { prefix: "eudr", name: "eu/eudr", dir: "extensions/eu/eudr", ttl: "eudr.ttl", namespace: "https://ref.openepcis.io/extensions/eu/eudr/" },
  { prefix: "textile", name: "eu/textile", dir: "extensions/eu/textile", ttl: "textile.ttl", namespace: "https://ref.openepcis.io/extensions/eu/textile/" },
  { prefix: "electronics", name: "eu/electronics", dir: "extensions/eu/electronics", ttl: "electronics.ttl", namespace: "https://ref.openepcis.io/extensions/eu/electronics/" },
  { prefix: "detergent", name: "eu/detergent", dir: "extensions/eu/detergent", ttl: "detergent.ttl", namespace: "https://ref.openepcis.io/extensions/eu/detergent/" },
  { prefix: "fsma", name: "us/fsma204", dir: "extensions/us/fsma204", ttl: "fsma204.ttl", namespace: "https://ref.openepcis.io/extensions/us/fsma204/" },
];

interface Term {
  iri: string;
  localName: string;
  kind: "Class" | "DatatypeProperty" | "ObjectProperty" | "Property";
  label: string;
  comment: string;
  domain: string[];
  range: string[];
  existingLinks: { predicate: string; target: string }[];
  module: string;
  prefix: string;
}

interface VocabTerm {
  iri: string;
  localName: string;
  labels: string[];
  comment: string;
  kind: string;
  domain: string[];
  range: string[];
}

function parse(ttl: string): Store {
  const store = new Store();
  const parser = new Parser();
  store.addQuads(parser.parse(ttl));
  return store;
}

function getValues(store: Store, s: string, p: string): string[] {
  return store.getQuads(namedNode(s), namedNode(p), null, null).map((q) => q.object.value);
}

function getValue(store: Store, s: string, p: string): string {
  const v = getValues(store, s, p);
  return v[0] ?? "";
}

function getLocalName(iri: string): string {
  const hashIdx = iri.lastIndexOf("#");
  if (hashIdx >= 0) return iri.substring(hashIdx + 1);
  const slashIdx = iri.lastIndexOf("/");
  if (slashIdx >= 0) return iri.substring(slashIdx + 1);
  return iri;
}

function extractModuleTerms(mod: Module): Term[] {
  const ttlPath = join(PROJECT_ROOT, mod.dir, "ontology", mod.ttl);
  const store = parse(readFileSync(ttlPath, "utf-8"));

  const subjects = new Set<string>();
  store.getQuads(null, null, null, null).forEach((q) => {
    if (q.subject.value.startsWith(mod.namespace)) subjects.add(q.subject.value);
  });

  const terms: Term[] = [];
  for (const s of subjects) {
    const types = getValues(store, s, `${RDF}type`);
    let kind: Term["kind"] | null = null;
    if (types.includes(`${OWL}Class`) || types.includes(`${RDFS}Class`)) kind = "Class";
    else if (types.includes(`${OWL}DatatypeProperty`)) kind = "DatatypeProperty";
    else if (types.includes(`${OWL}ObjectProperty`)) kind = "ObjectProperty";
    else if (types.includes(`${RDF}Property`)) kind = "Property";
    if (!kind) continue;

    const links: Term["existingLinks"] = [];
    for (const pred of [
      `${OWL}equivalentClass`,
      `${OWL}equivalentProperty`,
      `${RDFS}subClassOf`,
      `${RDFS}subPropertyOf`,
      `${RDFS}seeAlso`,
      `${SKOS}exactMatch`,
      `${SKOS}closeMatch`,
      `${SKOS}broadMatch`,
      `${SKOS}narrowMatch`,
    ]) {
      for (const target of getValues(store, s, pred)) {
        if (target.startsWith("https://ref.gs1.org/voc/") || target.startsWith("http://schema.org/") || target.startsWith("https://schema.org/")) {
          links.push({ predicate: pred.split("#").pop() || pred.split("/").pop()!, target });
        }
      }
    }

    terms.push({
      iri: s,
      localName: getLocalName(s).replace(mod.namespace, ""),
      kind,
      label: getValue(store, s, `${RDFS}label`),
      comment: getValue(store, s, `${RDFS}comment`).replace(/\s+/g, " ").substring(0, 240),
      domain: getValues(store, s, `${RDFS}domain`),
      range: getValues(store, s, `${RDFS}range`),
      existingLinks: links,
      module: mod.name,
      prefix: mod.prefix,
    });
  }
  terms.sort((a, b) => a.localName.localeCompare(b.localName));
  return terms;
}

function loadVocab(ttlPath: string, prefix: string, namespace: string, altNamespaces: string[] = []): Map<string, VocabTerm> {
  const store = parse(readFileSync(ttlPath, "utf-8"));
  const allNs = [namespace, ...altNamespaces];
  const subjects = new Set<string>();
  store.getQuads(null, null, null, null).forEach((q) => {
    if (allNs.some((ns) => q.subject.value.startsWith(ns))) subjects.add(q.subject.value);
  });

  const map = new Map<string, VocabTerm>();
  for (const s of subjects) {
    const types = getValues(store, s, `${RDF}type`);
    const isClassT =
      types.includes(`${OWL}Class`) ||
      types.includes(`${RDFS}Class`) ||
      types.some((t) => t.endsWith("Class") || t.endsWith("schema:Class"));
    const isPropT =
      types.includes(`${OWL}DatatypeProperty`) ||
      types.includes(`${OWL}ObjectProperty`) ||
      types.includes(`${RDF}Property`);
    if (!isClassT && !isPropT) continue;

    const localName = getLocalName(s);
    const labels: string[] = [];
    for (const pred of [`${RDFS}label`, `${SKOS}prefLabel`, `${SKOS}altLabel`]) {
      for (const v of getValues(store, s, pred)) labels.push(v);
    }
    map.set(localName.toLowerCase(), {
      iri: s,
      localName,
      labels,
      comment: getValue(store, s, `${RDFS}comment`).replace(/\s+/g, " ").substring(0, 240),
      kind: isClassT ? "Class" : "Property",
      domain: getValues(store, s, `${RDFS}domain`),
      range: getValues(store, s, `${RDFS}range`),
    });
  }
  console.log(`  Loaded ${map.size} ${prefix}: terms`);
  return map;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Split a camelCase / PascalCase / snake_case identifier into lowercase tokens.
function tokenize(name: string): string[] {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_\-]+/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 0);
}

// Module-prefix tokens that should be ignored when scoring overlap (these are noise).
const MODULE_NOISE = new Set([
  "battery", "textile", "electronics", "detergent", "eudr", "fsma",
  "dpp", "interop", "the", "of", "for", "and", "a", "an",
  // common boilerplate from labels
  "information", "info", "data",
]);

// Generic technical suffix/prefix tokens. These are "significant" by length but
// matching on these alone is meaningless (e.g. "casNumber" vs "busNumber" share only
// "number"). They count for overlap but never qualify as the *distinguishing* shared
// significant token.
const WEAK_SUFFIX_TOKENS = new Set([
  "number", "code", "type", "value", "name", "id", "identifier",
  "percentage", "fraction", "ratio", "amount", "level", "status",
  "date", "time", "info",
]);

// Common synonyms that map between extension and canonical vocabularies.
const SYNONYMS: Record<string, string[]> = {
  manufacturer: ["maker", "producer"],
  product: ["item", "good"],
  serial: ["serialnumber"],
  number: ["code", "id", "identifier"],
  identifier: ["id", "number"],
  warranty: ["guarantee"],
  category: ["type", "class"],
  weight: ["mass"],
  date: ["time"],
  manufacturing: ["production", "made"],
  description: ["desc"],
  name: ["title"],
  organization: ["organisation", "org", "company"],
  origin: ["source"],
  energy: ["power"],
  rating: ["score"],
  carbon: ["co2"],
  certification: ["certificate"],
  durability: ["robustness", "lifespan"],
  test: ["assessment"],
  hazard: ["risk"],
  conditions: ["terms"],
  model: ["modelnumber"],
};

function expandWithSynonyms(tokens: string[]): Set<string> {
  const out = new Set(tokens);
  for (const t of tokens) {
    if (SYNONYMS[t]) for (const s of SYNONYMS[t]) out.add(s);
    for (const [k, vs] of Object.entries(SYNONYMS)) {
      if (vs.includes(t)) out.add(k);
    }
  }
  return out;
}

function tokenSet(name: string): Set<string> {
  const tokens = tokenize(name).filter((t) => !MODULE_NOISE.has(t) && t.length > 1);
  return expandWithSynonyms(tokens);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersect = 0;
  for (const t of a) if (b.has(t)) intersect++;
  const union = a.size + b.size - intersect;
  return intersect / union;
}

function dice(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersect = 0;
  for (const t of a) if (b.has(t)) intersect++;
  return (2 * intersect) / (a.size + b.size);
}

interface Match {
  vocab: "gs1" | "schema";
  term: VocabTerm;
  reason: string;
  score: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

interface IndexedTerm extends VocabTerm {
  tokens: Set<string>;
  rawTokens: string[];
}

function indexVocab(map: Map<string, VocabTerm>): IndexedTerm[] {
  const out: IndexedTerm[] = [];
  for (const term of map.values()) {
    const allText = [term.localName, ...term.labels].join(" ");
    const rawTokens = tokenize(allText);
    out.push({
      ...term,
      tokens: tokenSet(allText),
      rawTokens,
    });
  }
  return out;
}

// Schema.org meta-types — these are SCALAR DATA TYPES (Number, Date, Class, etc.),
// not domain properties. They should never be the canonical replacement for a domain
// property like dpp:eoriNumber or dpp:complianceDate. We block them as match targets.
const SCHEMA_META_TYPE_BLOCKLIST = new Set([
  "Number", "Integer", "Float", "Boolean", "Text", "Date", "DateTime", "Time",
  "Class", "DataType", "Property", "Mass", "Distance", "Energy", "URL",
  "QuantitativeValue", // too generic — properties are like schema:weight, schema:height
  "Thing", "Intangible", "Enumeration", "StructuredValue", "Action",
  "Code", "MediaObject",
]);

// GS1 meta-types likewise.
const GS1_META_TYPE_BLOCKLIST = new Set([
  "TypeCode", "DataValue", "MeasurementType", "Property",
]);

function findMatches(term: Term, gs1Indexed: IndexedTerm[], schemaIndexed: IndexedTerm[]): Match[] {
  const localNorm = normalizeName(term.localName);
  const labelNorm = normalizeName(term.label || "");

  const queryText = [term.localName, term.label].join(" ");
  const queryTokens = tokenSet(queryText);
  const queryRawTokens = tokenize(queryText);
  const isProperty = term.kind !== "Class";

  const candidates: Match[] = [];

  function score(vocab: "gs1" | "schema", term2: IndexedTerm): { score: number; reason: string; confidence: Match["confidence"] } | null {
    // Block scalar meta-types — they're never the right replacement for a domain term
    if (vocab === "schema" && SCHEMA_META_TYPE_BLOCKLIST.has(term2.localName)) return null;
    if (vocab === "gs1" && GS1_META_TYPE_BLOCKLIST.has(term2.localName)) return null;

    // For an extension property, the canonical match should also be a property
    // (matching a property to a class is almost always wrong).
    if (isProperty && term2.kind !== "Property") {
      // exception: keep as a low-confidence candidate but don't promote
      // (handled below by capping confidence)
    }
    // For an extension class, similarly prefer class-to-class.
    if (!isProperty && term2.kind === "Property") {
      return null;
    }

    const norm2 = normalizeName(term2.localName);
    const labelNorms2 = term2.labels.map(normalizeName);

    // 1. Exact normalized name match
    if (norm2 === localNorm || norm2 === labelNorm || labelNorms2.includes(localNorm) || labelNorms2.includes(labelNorm)) {
      return { score: 1.0, reason: `exact name/label match`, confidence: "HIGH" };
    }

    // 2. has<X> / <X> match — gs1 often prefixes with has
    const hasStripped = norm2.startsWith("has") ? norm2.substring(3) : null;
    if (hasStripped && (hasStripped === localNorm || labelNorms2.some((l) => l === localNorm))) {
      return { score: 0.95, reason: `has-prefix match (${term2.localName} ↔ ${term.localName})`, confidence: "HIGH" };
    }
    // module-prefix-strip
    const moduleStripped = localNorm.replace(new RegExp(`^${term.prefix}`), "");
    if (moduleStripped && moduleStripped !== localNorm && (norm2 === moduleStripped || hasStripped === moduleStripped)) {
      return { score: 0.92, reason: `module-prefix-strip match (${term.prefix}+${term2.localName})`, confidence: "HIGH" };
    }

    // 3. Token overlap (Jaccard + Dice)
    if (queryTokens.size === 0 || term2.tokens.size === 0) return null;
    const j = jaccard(queryTokens, term2.tokens);
    const d = dice(queryTokens, term2.tokens);

    // Require at least one significant token to be shared. A token is "significant"
    // if it's >3 chars AND not in WEAK_SUFFIX_TOKENS — those generic suffixes
    // alone cannot carry a match.
    let sharedSig = 0;
    let sharedDistinguishing = 0;
    for (const t of queryTokens) {
      if (term2.tokens.has(t) && t.length > 3) {
        sharedSig++;
        if (!WEAK_SUFFIX_TOKENS.has(t)) sharedDistinguishing++;
      }
    }
    if (sharedDistinguishing === 0) return null;

    // Penalty: kind mismatch (property vs class)
    const kindMismatch = isProperty && term2.kind !== "Property";
    const cap = (c: Match["confidence"]): Match["confidence"] => kindMismatch ? "LOW" : c;

    if (d >= 0.75) return { score: d, reason: `strong token overlap (Dice=${d.toFixed(2)}, J=${j.toFixed(2)})`, confidence: cap("HIGH") };
    if (d >= 0.55) return { score: d, reason: `good token overlap (Dice=${d.toFixed(2)})`, confidence: cap("MEDIUM") };
    if (d >= 0.35 && sharedSig >= 2) return { score: d, reason: `partial overlap, ${sharedSig} significant tokens`, confidence: cap("MEDIUM") };
    if (d >= 0.25 && sharedSig >= 1) return { score: d, reason: `weak overlap (Dice=${d.toFixed(2)}, ${sharedSig} sig)`, confidence: "LOW" };
    return null;
  }

  for (const t2 of gs1Indexed) {
    const s = score("gs1", t2);
    if (s) candidates.push({ vocab: "gs1", term: t2, reason: s.reason, score: s.score, confidence: s.confidence });
  }
  for (const t2 of schemaIndexed) {
    const s = score("schema", t2);
    if (s) candidates.push({ vocab: "schema", term: t2, reason: s.reason, score: s.score, confidence: s.confidence });
  }

  // Sort: by score desc, then GS1 before schema (precedence rule)
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.vocab !== b.vocab) return a.vocab === "gs1" ? -1 : 1;
    return a.term.localName.localeCompare(b.term.localName);
  });

  // Dedup by canonical IRI
  const seen = new Set<string>();
  return candidates.filter((m) => {
    const key = `${m.vocab}:${m.term.localName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function classify(term: Term, matches: Match[]): { verdict: string; canonical: string; confidence: string; rationale: string } {
  const hasExistingLink = term.existingLinks.length > 0;

  if (matches.length === 0) {
    return {
      verdict: "KEEP_NO_LINK",
      canonical: "",
      confidence: "—",
      rationale: hasExistingLink ? "no canonical match in GS1/schema.org by name; existing seeAlso preserved" : "no canonical match in GS1/schema.org by name",
    };
  }

  const top = matches[0];
  // Heuristic: enumeration *values* (named individuals styled as classes with capitalized
  // local names and no domain/range and a short label) get linked, not replaced — they
  // typically encode regulation-specific terminology even when names overlap.
  const isEnumValue = term.kind === "Class" && term.range.length === 0 && term.domain.length === 0 && term.label && term.label.length < 30 && /^[A-Z]/.test(term.localName);

  const canonical = top.vocab === "gs1" ? `gs1:${top.term.localName}` : `schema:${top.term.localName}`;

  if (top.confidence === "HIGH") {
    if (isEnumValue) {
      return {
        verdict: top.vocab === "gs1" ? "KEEP_LINK_GS1" : "KEEP_LINK_SCHEMA",
        canonical,
        confidence: "HIGH",
        rationale: `Likely enumeration value — link rather than replace; ${top.reason}`,
      };
    }
    return {
      verdict: top.vocab === "gs1" ? "REPLACE_WITH_GS1" : "REPLACE_WITH_SCHEMA",
      canonical,
      confidence: "HIGH",
      rationale: `${top.reason}; canonical label: "${top.term.labels[0] || top.term.localName}"`,
    };
  }

  if (top.confidence === "MEDIUM") {
    return {
      verdict: top.vocab === "gs1" ? "KEEP_LINK_GS1" : "KEEP_LINK_SCHEMA",
      canonical,
      confidence: "MEDIUM",
      rationale: `Probable relationship — ${top.reason}; review: replace or link?`,
    };
  }

  // LOW-confidence matches: don't assert a link, but surface candidates for review.
  // Suggesting a noisy link is worse than no link.
  return {
    verdict: "KEEP_NO_LINK",
    canonical: "",
    confidence: "LOW",
    rationale: `No high-confidence match. Top speculative candidate: ${canonical} (${top.reason}). Review candidates list.`,
  };
}

function main() {
  console.log("Loading reference vocabularies...");
  const cacheDir = join(PROJECT_ROOT, ".cache/vocab");
  const gs1Map = loadVocab(join(cacheDir, "gs1-voc.ttl"), "gs1", "https://ref.gs1.org/voc/");
  const schemaMap = loadVocab(join(cacheDir, "schemaorg.ttl"), "schema", "https://schema.org/", ["http://schema.org/"]);

  const gs1Indexed = indexVocab(gs1Map);
  const schemaIndexed = indexVocab(schemaMap);

  console.log("\nExtracting extension terms...");
  const allTerms: Term[] = [];
  for (const mod of MODULES) {
    const terms = extractModuleTerms(mod);
    console.log(`  ${mod.name}: ${terms.length} terms`);
    allTerms.push(...terms);
  }

  console.log("\nClassifying...");
  type Row = Term & { verdict: string; canonical: string; confidence: string; rationale: string; allMatches: Match[] };
  const rows: Row[] = allTerms.map((t) => {
    const matches = findMatches(t, gs1Indexed, schemaIndexed);
    const c = classify(t, matches);
    return { ...t, ...c, allMatches: matches.slice(0, 5) };
  });

  // Aggregate counts
  const counts: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    counts[r.module] ??= {};
    counts[r.module][r.verdict] = (counts[r.module][r.verdict] || 0) + 1;
  }

  // Output markdown
  const lines: string[] = [];
  lines.push("# Ontology Realignment Mapping (Phase 1 working document)\n");
  lines.push(`Generated: ${new Date().toISOString()}\n`);
  lines.push(`Total extension terms analyzed: **${rows.length}**\n`);
  lines.push("## Methodology\n");
  lines.push("Each extension term is matched against the cached GS1 Web Vocabulary (`gs1:`, ~600 terms) ");
  lines.push("and schema.org (`schema:`, ~2400 terms) using local-name and label tokens. ");
  lines.push("Per governance precedence, GS1 ranks before schema.org when both match. ");
  lines.push("Schema.org meta-types (Number, Date, Class, DataType, etc.) are blocked as match targets. ");
  lines.push("Property/Class kind mismatches are demoted to LOW confidence.\n");
  lines.push("**Confidence is heuristic.** HIGH means exact name/label match, has-prefix match, or strong token overlap (Dice ≥ 0.75). ");
  lines.push("It is *not* a guarantee — every REPLACE_WITH_* row needs domain-expert review before TTL edits.\n");

  lines.push("## Verdict legend\n");
  lines.push("| Verdict | Action |");
  lines.push("|---|---|");
  lines.push("| `REPLACE_WITH_GS1` | Delete from TTL. Replace usages with GS1 term. |");
  lines.push("| `REPLACE_WITH_SCHEMA` | Delete from TTL. Replace usages with schema.org term. |");
  lines.push("| `KEEP_LINK_GS1` | Keep extension term, add owl:equivalentProperty/Class or rdfs:subPropertyOf to GS1. |");
  lines.push("| `KEEP_LINK_SCHEMA` | Same against schema.org. |");
  lines.push("| `KEEP_NO_LINK` | No external equivalent found; review whether to keep, rename, or research further. |\n");

  // Quick-decisions section: exact-match REPLACEs (highest signal)
  const exactReplace = rows.filter((r) =>
    r.verdict.startsWith("REPLACE_WITH_") &&
    r.allMatches[0] &&
    r.allMatches[0].reason.startsWith("exact name/label match")
  );
  lines.push(`## Quick wins — exact-name REPLACEs (${exactReplace.length})\n`);
  lines.push("These have an exact local-name or label match in GS1 / schema.org. Lowest review burden.\n");
  if (exactReplace.length > 0) {
    lines.push("| Extension term | → Canonical | Kind | Module |");
    lines.push("|---|---|---|---|");
    for (const r of exactReplace) {
      lines.push(`| \`${r.prefix}:${r.localName}\` | \`${r.canonical}\` | ${r.kind} | ${r.module} |`);
    }
    lines.push("");
  }

  // GS1 deduplication section (the user's primary concern)
  const gs1Replaces = rows.filter((r) => r.verdict === "REPLACE_WITH_GS1");
  lines.push(`## GS1 redundancies — ${gs1Replaces.length} extension terms duplicating GS1\n`);
  lines.push("Per the user's example (\`eubat:batterySerialNumber → gs1:hasSerialNumber\`), these are extension terms ");
  lines.push("that re-declare what GS1 Web Vocabulary already covers.\n");
  if (gs1Replaces.length > 0) {
    lines.push("| Extension term | → GS1 term | Kind | Confidence | Rationale |");
    lines.push("|---|---|---|---|---|");
    for (const r of gs1Replaces) {
      lines.push(`| \`${r.prefix}:${r.localName}\` | \`${r.canonical}\` | ${r.kind} | ${r.confidence} | ${r.rationale.replace(/\|/g, "\\|")} |`);
    }
    lines.push("");
  }

  lines.push("## Summary by module\n");
  lines.push("| Module | REPLACE_GS1 | REPLACE_SCHEMA | KEEP_LINK_GS1 | KEEP_LINK_SCHEMA | KEEP_NO_LINK | Total |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");
  let totalsRow: Record<string, number> = {};
  for (const mod of MODULES) {
    const c = counts[mod.name] || {};
    const cells = [
      c["REPLACE_WITH_GS1"] || 0,
      c["REPLACE_WITH_SCHEMA"] || 0,
      c["KEEP_LINK_GS1"] || 0,
      c["KEEP_LINK_SCHEMA"] || 0,
      c["KEEP_NO_LINK"] || 0,
    ];
    const total = cells.reduce((a, b) => a + b, 0);
    lines.push(`| ${mod.name} | ${cells[0]} | ${cells[1]} | ${cells[2]} | ${cells[3]} | ${cells[4]} | ${total} |`);
    cells.forEach((v, i) => {
      const k = ["REPLACE_WITH_GS1", "REPLACE_WITH_SCHEMA", "KEEP_LINK_GS1", "KEEP_LINK_SCHEMA", "KEEP_NO_LINK"][i];
      totalsRow[k] = (totalsRow[k] || 0) + v;
    });
  }
  const grandTotal = Object.values(totalsRow).reduce((a, b) => a + b, 0);
  lines.push(`| **Total** | **${totalsRow["REPLACE_WITH_GS1"] || 0}** | **${totalsRow["REPLACE_WITH_SCHEMA"] || 0}** | **${totalsRow["KEEP_LINK_GS1"] || 0}** | **${totalsRow["KEEP_LINK_SCHEMA"] || 0}** | **${totalsRow["KEEP_NO_LINK"] || 0}** | **${grandTotal}** |\n`);

  // Per-module detailed tables
  for (const mod of MODULES) {
    const moduleRows = rows.filter((r) => r.module === mod.name);
    if (moduleRows.length === 0) continue;
    lines.push(`## ${mod.name} (${mod.prefix}:)\n`);
    lines.push("| Term | Kind | Verdict | Confidence | Canonical | Rationale | Other candidates |");
    lines.push("|---|---|---|---|---|---|---|");
    for (const r of moduleRows) {
      const others = r.allMatches
        .slice(1)
        .map((m) => `${m.vocab}:${m.term.localName} (${m.confidence})`)
        .join("; ");
      const rationale = r.rationale.replace(/\|/g, "\\|");
      lines.push(`| \`${r.prefix}:${r.localName}\` | ${r.kind} | ${r.verdict} | ${r.confidence} | ${r.canonical || "—"} | ${rationale} | ${others || "—"} |`);
    }
    lines.push("");
  }

  const outPath = join(PROJECT_ROOT, "docs/skos-alignment/ontology-realignment-mapping.md");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, lines.join("\n"));
  console.log(`\nWrote mapping to ${outPath}`);

  // Also emit a structured JSON for the apply script to consume.
  const jsonOut = rows.map((r) => ({
    iri: r.iri,
    prefix: r.prefix,
    localName: r.localName,
    kind: r.kind,
    label: r.label,
    module: r.module,
    moduleDir: MODULES.find((m) => m.name === r.module)!.dir,
    moduleNamespace: MODULES.find((m) => m.name === r.module)!.namespace,
    domain: r.domain,
    range: r.range,
    verdict: r.verdict,
    canonical: r.canonical,
    confidence: r.confidence,
    rationale: r.rationale,
    canonicalIri: r.allMatches[0]?.term?.iri || "",
    candidates: r.allMatches.map((m) => ({
      vocab: m.vocab,
      iri: m.term.iri,
      localName: m.term.localName,
      labels: m.term.labels,
      score: m.score,
      confidence: m.confidence,
      reason: m.reason,
    })),
  }));
  const jsonPath = join(PROJECT_ROOT, "docs/skos-alignment/ontology-realignment-mapping.json");
  writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2));
  console.log(`Wrote JSON to ${jsonPath}`);

  console.log("\nGrand totals:");
  for (const [k, v] of Object.entries(totalsRow)) console.log(`  ${k}: ${v}`);
}

main();
