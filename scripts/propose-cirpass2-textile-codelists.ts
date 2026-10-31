#!/usr/bin/env tsx
/**
 * Draft our individuals for the code-list values of the CIRPASS-2 textile ontology that nothing
 * of ours references yet: the SKOS concept schemes of textile-codelists, textile-associated-
 * materials-codelists, textile-assessment-codelists and the concepts the other sub-modules
 * declare inline (recyclability barriers, criteria, outcomes, repair actions and actors, context
 * factors, SoC locations, …).
 *
 * Deterministic, no model: a code-list value is a fact, not a judgement. Each concept becomes a
 * block in our house style (UpperCamelCase individual, same shape as the eutex:Cotton … or
 * eutex:Wash30 … individuals in textile.ttl), typed with the class of ours that holds the list:
 * an existing class, the class the term proposal drafted for the upstream concept class, or a
 * class stub this script adds with a CHECK note. The SKOS structure (scheme, top concept,
 * broader/narrower, notation, alt labels) is kept, and every value maps skos:exactMatch to the
 * upstream concept.
 *
 * Reads the reverse-coverage JSON (which values are code-list rows), the term-proposal JSON
 * (which classes are drafted), the textile mirror (labels, definitions, hierarchy); writes a
 * proposal TTL and table beside the term proposal and merges decision + proposal text into the
 * recommendation set the workbook is generated from.
 *
 * Usage:
 *   tsx scripts/propose-cirpass2-textile-codelists.ts --stamp 2026-10-30
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DataFactory, Parser, Store } from "n3";

const { namedNode } = DataFactory;
const args = process.argv.slice(2);
const stampIdx = args.indexOf("--stamp");
const STAMP = stampIdx >= 0 ? args[stampIdx + 1] : "unset";
const ROOT = resolve(import.meta.dirname, "..");
const DOCS = resolve(ROOT, "docs/skos-alignment");
const VOCAB = "cirpass2-textile";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const SKOS = "http://www.w3.org/2004/02/skos/core#";
const OWL = "http://www.w3.org/2002/07/owl#";
const EUTEX = "https://ref.openepcis.org/extensions/eu/textile/";

const coverage = JSON.parse(readFileSync(resolve(DOCS, `skos-reverse-coverage-${VOCAB}-${STAMP}.json`), "utf8"));
const proposal = JSON.parse(readFileSync(resolve(DOCS, `skos-adoption-proposal-${VOCAB}-${STAMP}.json`), "utf8"));
const prefillPath = resolve(DOCS, `skos-adoption-proposal-${VOCAB}-${STAMP}-prefill.json`);
const prefill: Record<string, { decision: string; notes: string }> = JSON.parse(readFileSync(prefillPath, "utf8"));

const store = new Store();
store.addQuads(new Parser().parse(readFileSync(resolve(ROOT, "extensions/upstream/cirpass2-textile/ontology/textile.ttl"), "utf8")));
const ours = new Store();
ours.addQuads(new Parser().parse(readFileSync(resolve(ROOT, "extensions/eu/textile/ontology/textile.ttl"), "utf8")));
const lit = (s: string, p: string) => store.getObjects(namedNode(s), namedNode(p), null).find((o) => o.termType === "Literal")?.value;
const lits = (s: string, p: string) => store.getObjects(namedNode(s), namedNode(p), null).filter((o) => o.termType === "Literal").map((o) => o.value);
const objs = (s: string, p: string) => store.getObjects(namedNode(s), namedNode(p), null).map((o) => o.value);
const localOf = (iri: string) => iri.slice(iri.indexOf("#") + 1);
const upper = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const camel = (s: string) => s.split(/[^A-Za-z0-9]+/).filter(Boolean).map(upper).join("");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");

/** Classes the term proposal drafted for this run, by upstream concept class local name → our id. */
const draftedClass = new Map<string, string>();
for (const d of proposal.drafts) if (d.proposal?.termType === "class") draftedClass.set(localOf(d.upstreamIri), d.ourId);

/** Local names already in eu/textile (classes, properties, individuals): a drafted value must not collide. */
const oursLocal = new Set<string>();
for (const q of ours.getQuads(null, null, null, null)) if (q.subject.value.startsWith(EUTEX)) oursLocal.add(q.subject.value.slice(EUTEX.length));

/**
 * Where a value's upstream concept class has no drafted class of ours: the existing class of
 * ours that holds the same kind of value (with the overlap the curator must check), or a class
 * stub this script adds.
 */
type Policy = { ourClass: string; check?: string; stub?: string };
const POLICY: Record<string, Policy> = {
  FibreTypeConcept: { ourClass: "eutex:FiberType",
    check: "upstream mixes the fibre groups of Regulation (EU) 1007/2011 Annex I with specific fibres; the specific fibres we already have (eutex:Cotton …) are set to map, the group values are broader, so add skos:broader from ours" },
  TextileApparelProductTypeConcept: { ourClass: "eutex:ApparelSubcategory",
    check: "overlaps the ten existing eutex:ApparelSubcategory individuals; merge rather than duplicate" },
  RecycledContentSourceConcept: { ourClass: "eutex:RecycledSourceType",
    check: "overlaps eutex:FiberToFiber and eutex:OpenLoop; merge rather than duplicate" },
  PreTreatmentTechniqueConcept: { ourClass: "eutex:PreTreatmentTechnique",
    stub: "A technique applied to collected textile waste before recycling, such as removal of trims or disassembly." },
  SortingCriterionConcept: { ourClass: "eutex:SortingCriterion",
    stub: "A criterion by which collected textiles are sorted for reuse or recycling.",
    check: "eutex:SortingFactors (closeMatch, weak) may already carry this; decide one" },
  RecyclabilityCriterionConcept: { ourClass: "eutex:RecyclabilityCriterion",
    stub: "A criterion against which the recyclability of a textile product is assessed." },
  RecyclabilityOutcomeConcept: { ourClass: "eutex:RecyclabilityOutcome",
    stub: "The outcome class of a recyclability assessment of a textile product." },
  PriorityRepairElementTypeConcept: { ourClass: "eutex:PriorityRepairElementType",
    stub: "A type of product element whose repair is prioritised in a repairability assessment.",
    check: "euelec:RepairCriterionType (closeMatch, weak) is the electronics counterpart; keep the two aligned" },
};
const STUB_LABELS: Record<string, string> = {
  "eutex:PreTreatmentTechnique": "Pre-Treatment Technique",
  "eutex:SortingCriterion": "Sorting Criterion",
  "eutex:RecyclabilityCriterion": "Recyclability Criterion",
  "eutex:RecyclabilityOutcome": "Recyclability Outcome",
  "eutex:PriorityRepairElementType": "Priority Repair Element Type",
};

const rows = coverage.terms.filter((t: any) => t.bucket === "code-list");
const rowIris = new Set<string>(rows.map((r: any) => r.upstreamIri));
/** Our id for every upstream value or scheme in the run, so broader/inScheme links resolve inside the proposal. */
const ourIdOf = new Map<string, string>();
for (const iri of rowIris) ourIdOf.set(iri, `eutex:${camel(localOf(iri))}`);

const schemeBlocks: string[] = [];
const blocks: string[] = [];
const table: string[] = [];
const stubs = new Map<string, string>();
const collisions: string[] = [];
let adopted = 0;
let schemes = 0;

for (const r of rows) {
  const iri: string = r.upstreamIri;
  const local = localOf(iri);
  const ourId = ourIdOf.get(iri)!;
  const ourLocal = ourId.slice("eutex:".length);
  const label = lit(iri, SKOS + "prefLabel") ?? lit(iri, RDFS + "label") ?? local;
  const comment = lit(iri, SKOS + "definition") ?? lit(iri, RDFS + "comment");
  const types = objs(iri, RDF + "type");
  const isScheme = types.includes(SKOS + "ConceptScheme");
  if (oursLocal.has(ourLocal)) {
    collisions.push(ourLocal);
    prefill[iri] = { decision: "map", notes: `eutex:${ourLocal} already exists in eu/textile; map it to ${VOCAB}:${local} instead of drafting a second one.` };
    continue;
  }
  if (isScheme) {
    schemeBlocks.push([
      `${ourId}`,
      `    a skos:ConceptScheme ;`,
      `    rdfs:label "${esc(label)}"@en ;`,
      ...(comment ? [`    rdfs:comment "${esc(comment)}"@en ;`] : []),
      `    rdfs:isDefinedBy <${EUTEX}> ;`,
      `    dcterms:source <${iri}> ;`,
      `    skos:exactMatch <${iri}> .`,
    ].join("\n"));
    prefill[iri] = { decision: "adopt", notes: `Proposal: ${ourId} (skos:ConceptScheme) skos:exactMatch ${VOCAB}:${local}. ${comment ?? ""}`.trim() };
    schemes++;
    continue;
  }
  // The concept class: drafted in this run, a policy class of ours, or (no class at all) a bare concept.
  const conceptClass = types.map(localOf).find((t) => draftedClass.has(t) || POLICY[t]);
  const policy = conceptClass ? POLICY[conceptClass] : undefined;
  const ourClass = conceptClass ? (draftedClass.get(conceptClass) ?? policy!.ourClass) : undefined;
  const unresolvedClass = types.filter((t) => t !== OWL + "NamedIndividual" && t !== SKOS + "Concept").map(localOf).find((t) => !draftedClass.has(t) && !POLICY[t]);
  const checks: string[] = [];
  if (policy?.check) checks.push(policy.check);
  if (policy?.stub) { stubs.set(policy.ourClass, policy.stub); checks.push(`${policy.ourClass} is a class stub this proposal adds`); }
  if (unresolvedClass) checks.push(`upstream class ${unresolvedClass} has neither a drafted nor an existing class of ours`);
  const schemeIris = objs(iri, SKOS + "inScheme").filter((s) => ourIdOf.has(s));
  const broader = objs(iri, SKOS + "broader").filter((b) => ourIdOf.has(b));
  const top = objs(iri, SKOS + "topConceptOf").filter((s) => ourIdOf.has(s));
  const notation = lit(iri, SKOS + "notation");
  const alts = lits(iri, SKOS + "altLabel");
  const lines = [
    `${ourId}`,
    `    a owl:NamedIndividual, skos:Concept${ourClass ? `, ${ourClass}` : ""} ;`,
    `    rdfs:label "${esc(label)}"@en ;`,
    `    skos:prefLabel "${esc(label)}"@en ;`,
  ];
  for (const a of alts) lines.push(`    skos:altLabel "${esc(a)}"@en ;`);
  if (notation) lines.push(`    skos:notation "${esc(notation)}" ;`);
  if (comment) lines.push(`    rdfs:comment "${esc(comment)}"@en ;`);
  for (const s of schemeIris) lines.push(`    skos:inScheme ${ourIdOf.get(s)} ;`);
  for (const s of top) lines.push(`    skos:topConceptOf ${ourIdOf.get(s)} ;`);
  for (const b of broader) lines.push(`    skos:broader ${ourIdOf.get(b)} ;`);
  lines.push(`    rdfs:isDefinedBy <${EUTEX}> ;`);
  lines.push(`    dcterms:source <${iri}> ;`);
  lines.push(`    skos:note "Proposed from the ${VOCAB} reverse-coverage run of ${STAMP} to cover ${VOCAB}:${local}.${checks.length ? " CHECK: " + esc(checks.join("; ")) + "." : ""}"@en ;`);
  lines.push(`    skos:exactMatch <${iri}> .`);
  blocks.push(lines.join("\n"));
  table.push(`| \`${ourId}\` | ${ourClass ?? "(skos:Concept)"} | ${label.replace(/\|/g, "\\|")} | ${notation ?? ""} | ${schemeIris.map((s) => ourIdOf.get(s)).join(", ")} | \`${VOCAB}:${local}\` | ${checks.join("; ").replace(/\|/g, "\\|")} |`);
  prefill[iri] = {
    decision: "adopt",
    notes: `Proposal: ${ourId} (individual of ${ourClass ?? "skos:Concept"}${schemeIris.length ? ", in " + schemeIris.map((s) => ourIdOf.get(s)).join("/") : ""}) skos:exactMatch ${VOCAB}:${local}. ${comment ?? ""}`.trim()
      + (checks.length ? ` CHECK: ${checks.join("; ")}.` : ""),
  };
  adopted++;
}

const stubBlocks = [...stubs.entries()].map(([cls, def]) => [
  `${cls}`,
  `    a owl:Class ;`,
  `    rdfs:label "${STUB_LABELS[cls] ?? cls.slice("eutex:".length)}"@en ;`,
  `    rdfs:comment "${esc(def)}"@en ;`,
  `    rdfs:isDefinedBy <${EUTEX}> ;`,
  `    skos:note "Class stub proposed by scripts/propose-cirpass2-textile-codelists.ts (${STAMP}) to hold the code-list values below; CHECK before adopting."@en .`,
].join("\n"));

const ttl = `# Proposed code-list individuals from the ${VOCAB} reverse-coverage run of ${STAMP}.
# Generated by scripts/propose-cirpass2-textile-codelists.ts (deterministic, no model): one block per
# upstream concept nothing of ours referenced, typed with the class of ours that holds the list
# (a drafted class from the term proposal, an existing class, or a stub below), the SKOS scheme
# and hierarchy kept, skos:exactMatch to the upstream concept. A proposal for the curator, not an
# ontology. The drafted classes it types with live in skos-adoption-proposal-${VOCAB}-${STAMP}.ttl.

@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix eutex: <${EUTEX}> .
@prefix euelec: <https://ref.openepcis.org/extensions/eu/electronics/> .

# ===== class stubs the values below need (CHECK each) =====

${stubBlocks.join("\n\n")}

# ===== concept schemes (${schemes}) =====

${schemeBlocks.join("\n\n")}

# ===== values (${adopted}) =====

${blocks.join("\n\n")}
`;
writeFileSync(resolve(DOCS, `skos-adoption-proposal-${VOCAB}-codelists-${STAMP}.ttl`), ttl);
writeFileSync(resolve(DOCS, `skos-adoption-proposal-${VOCAB}-codelists-${STAMP}.md`),
  `# Proposed code-list individuals — ${VOCAB} reverse coverage ${STAMP}\n\n${adopted} values and ${schemes} concept schemes drafted deterministically from the textile mirror; ` +
  `${stubs.size} class stubs to check (${[...stubs.keys()].join(", ")})` +
  (collisions.length ? `; ${collisions.length} values already exist in eu/textile and are set to map (${collisions.join(", ")})` : "") +
  `.\n\n| Our individual | Of class | Label | Notation | Scheme | Upstream | Check |\n|---|---|---|---|---|---|---|\n${table.join("\n")}\n`);
writeFileSync(prefillPath, JSON.stringify(prefill, null, 2) + "\n");
const counts: Record<string, number> = {};
for (const v of Object.values(prefill)) counts[v.decision] = (counts[v.decision] ?? 0) + 1;
console.log(`textile code lists: ${adopted} values + ${schemes} schemes drafted, ${stubs.size} class stubs, ${collisions.length} collisions; prefill now ${JSON.stringify(counts)}`);
