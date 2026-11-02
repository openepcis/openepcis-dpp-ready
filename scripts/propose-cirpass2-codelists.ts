#!/usr/bin/env tsx
/**
 * Draft our individuals for the code-list values of an EUDPP release that nothing of ours
 * references yet: EN 15804+A2 impact and inventory indicators, EF 3.1 impact categories and
 * indicators, life-cycle modules, the ILCD+EPD process lists (review types, licence types,
 * compliance statuses, methodologies, indicator groups, areas of protection), the ESPR Art. 2(27)
 * substance-of-concern criteria, and the LCA verifier role.
 *
 * Deterministic, no model: a code-list value is a fact, not a judgement. Each value becomes a
 * block in our house style (same shape as the oec:GWPTotal … oec:WDP individuals in dpp-core.ttl),
 * typed with the class of ours that holds the list — an existing class, a class the term proposal
 * drafted, or a class stub this script adds with a CHECK note — and mapped skos:exactMatch to
 * the upstream value. Scheme and unit values are not drafted (flat properties / gs1:unitCode).
 *
 * Reads the reverse-coverage JSON (which values are uncovered), the term-proposal JSON (which
 * classes are drafted), the EUDPP mirror (labels, definitions, units); writes a proposal TTL and
 * table beside the term proposal and merges decision + proposal text into the recommendation set
 * the workbook is generated from.
 *
 * Usage:
 *   tsx scripts/propose-cirpass2-codelists.ts --stamp 2026-10-30
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Parser, Store, DataFactory } from "n3";

const { namedNode } = DataFactory;
const args = process.argv.slice(2);
const stampIdx = args.indexOf("--stamp");
const STAMP = stampIdx >= 0 ? args[stampIdx + 1] : "unset";
const ROOT = resolve(import.meta.dirname, "..");
const DOCS = resolve(ROOT, "docs/skos-alignment");
const EUDPP = "https://w3id.org/eudpp#";
const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const SKOS = "http://www.w3.org/2004/02/skos/core#";
const OWL = "http://www.w3.org/2002/07/owl#";

const coverage = JSON.parse(readFileSync(resolve(DOCS, `skos-reverse-coverage-eudpp-${STAMP}.json`), "utf8"));
const proposal = JSON.parse(readFileSync(resolve(DOCS, `skos-adoption-proposal-eudpp-${STAMP}.json`), "utf8"));
const prefillPath = resolve(DOCS, `skos-adoption-proposal-eudpp-${STAMP}-prefill.json`);
const prefill: Record<string, { decision: string; notes: string }> = JSON.parse(readFileSync(prefillPath, "utf8"));

const store = new Store();
store.addQuads(new Parser().parse(readFileSync(resolve(ROOT, "extensions/upstream/cirpass2-eudpp/ontology/eudpp.ttl"), "utf8")));
const lit = (s: string, p: string) => store.getObjects(namedNode(s), namedNode(p), null).find((o) => o.termType === "Literal")?.value;
const objs = (s: string, p: string) => store.getObjects(namedNode(s), namedNode(p), null).map((o) => o.value);

/** Classes the term proposal drafted, keyed by the upstream class they cover. */
const draftedClass = new Map<string, string>();
for (const d of proposal.drafts) if (d.proposal.termType === "class") draftedClass.set(d.upstreamIri, d.ourId);

type Policy = {
  ourClass: string;          // class of ours the values are typed with
  classStub?: string;        // definition for a class this script has to propose (CHECK)
  authority: string;         // where the list comes from, for the skos:note
  name: (local: string, alt?: string) => string;
};
const upper = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const camel = (s: string) => s.split(/[^A-Za-z0-9]+/).filter(Boolean).map(upper).join("");
const fromAlt = (local: string, alt?: string) => camel(alt && !/\s/.test(alt) ? alt : local.replace(/^ind_(EF_)?/, ""));

const POLICY: Record<string, Policy> = {
  [EUDPP + "EN15804ImpactIndicator"]: {
    ourClass: "oec:ImpactIndicatorType",
    authority: "EN 15804:2012+A2:2019/AC:2021 core impact indicator (ILCD+EPD extension)",
    name: fromAlt,
  },
  [EUDPP + "EN15804InventoryIndicator"]: {
    ourClass: draftedClass.get(EUDPP + "EN15804InventoryIndicator") ?? "oec:EN15804InventoryIndicator",
    authority: "EN 15804:2012+A2:2019/AC:2021 inventory indicator (resource use, waste, output flows)",
    name: fromAlt,
  },
  [EUDPP + "LCIAImpactIndicator"]: {
    ourClass: "oec:ImpactIndicatorType",
    authority: "Environmental Footprint 3.1 impact-assessment indicator (JRC EF reference package)",
    name: (l, a) => "EF" + camel((a && !/\s/.test(a) ? a : l.replace(/^ind_EF_/, ""))),
  },
  [EUDPP + "LCIAImpactCategory"]: {
    ourClass: "oec:ImpactCategory",
    classStub: "A life-cycle impact-assessment impact category (climate change, eutrophication, water use, …): what an impact indicator measures, independent of the characterisation method. Values follow the EF 3.1 / ILCD category list.",
    authority: "ILCD / Environmental Footprint 3.1 impact category",
    name: (l) => camel(l),
  },
  [EUDPP + "EnvironmentalFootprintScore"]: {
    ourClass: "oec:ImpactIndicatorType",
    authority: "Environmental Footprint 3.1 normalised and weighted single score",
    name: () => "EFSingleScore",
  },
  [EUDPP + "LifeCycleModule"]: {
    ourClass: "oec:LifecycleStage",
    authority: "EN 15804+A2 life-cycle module",
    name: (l) => "Stage" + l.replace(/^en15804module/, ""),
  },
  [EUDPP + "EN15804IndicatorGroup"]: {
    ourClass: "oec:EN15804IndicatorGroup",
    classStub: "A group of EN 15804+A2 indicators as the standard tabulates them: core impact indicators, impact indicators with caveats, resource use, waste, output flows for valorisation, exported energy.",
    authority: "EN 15804+A2 indicator grouping (ILCD+EPD extension)",
    name: (l) => camel(l.replace(/^group_/, "Group ")),
  },
  [EUDPP + "AreaOfProtection"]: {
    ourClass: "oec:AreaOfProtection",
    classStub: "An area of protection in life-cycle impact assessment: what an impact category ultimately threatens (human health, natural environment, natural resources, man-made environment).",
    authority: "ILCD area of protection",
    name: (l) => camel(l.replace(/^aop/, "Aop ")),
  },
  [EUDPP + "TypeOfReview"]: {
    ourClass: draftedClass.get(EUDPP + "TypeOfReview") ?? "oec:TypeOfReview",
    authority: "ILCD+EPD review type",
    name: (l) => camel(l),
  },
  [EUDPP + "LicenseType"]: {
    ourClass: draftedClass.get(EUDPP + "LicenseType") ?? "oec:LicenseType",
    authority: "ILCD+EPD licence type",
    name: (l) => camel(l),
  },
  [EUDPP + "LCAMethodology"]: {
    ourClass: draftedClass.get(EUDPP + "LCAMethodology") ?? "oec:LCAMethodology",
    authority: "LCA methodology (EF 3.0/3.1, CML 2002, ReCiPe 2016, IPCC AR6, EN 15804 inventory rules)",
    name: (l) => camel(l.replace(/^methodology_/, "Methodology ")),
  },
  [EUDPP + "ComplianceStatus"]: {
    ourClass: "oec:LcaComplianceStatus",
    classStub: "The degree to which an LCA or EPD study complies with a compliance system (fully, partially, not compliant). CHECK: eubat:ComplianceStatus exists in the battery module; decide whether to lift it to core instead of a second class.",
    authority: "ILCD+EPD compliance status",
    name: (l) => camel(l),
  },
  [SKOS + "Concept"]: {
    ourClass: "oec:SoCCriterion",
    classStub: "A qualification criterion of ESPR Article 2(27) under which a substance counts as a substance of concern: (a) REACH Art. 57 SVHC, (b) CLP hazard classes, (c) POPs, (d) hampers reuse or recycling. Values are skos:Concepts in oec:SoCCriterionScheme.",
    authority: "ESPR 2024/1781 Article 2(27)",
    name: (l) => "SoC" + l,
  },
  [EUDPP + "Role"]: {
    ourClass: "oec:ActorRole",
    authority: "LCA verifier role (ILCD review); CHECK: oec:ActorRole is a closed owl:oneOf list per EN 18239, extend the list",
    name: (l) => camel(l),
  },
};
const SKIP: Record<string, { decision: string; notes: string }> = {
  [EUDPP + "EC"]: { decision: "out of scope", notes: "Substance identifier schemes stay flat properties (oec:ecNumber); no scheme individual." },
  [EUDPP + "ECHA"]: { decision: "out of scope", notes: "Substance identifier schemes stay flat properties (echaNumber proposed); no scheme individual." },
  [EUDPP + "massFractionUnit"]: { decision: "carrier", notes: "Units are gs1:unitCode values (UN/ECE Rec. 20); a mass-fraction unit is a code there, not a term of ours." },
  [EUDPP + "SoCCriterionScheme"]: { decision: "adopt", notes: "Proposal: oec:SoCCriterionScheme (skos:ConceptScheme) skos:exactMatch eudpp:SoCCriterionScheme. The scheme that holds the four ESPR Art. 2(27) criteria; see the SoC criteria rows." },
};

const rows = coverage.terms.filter((t: any) => t.bucket === "code-list");
const blocks: string[] = [];
const table: string[] = [];
const stubs = new Map<string, string>();
let adopted = 0;
for (const r of rows) {
  const iri: string = r.upstreamIri;
  const local = iri.slice(EUDPP.length);
  if (SKIP[iri]) { prefill[iri] = SKIP[iri]; continue; }
  const types = objs(iri, RDF + "type").filter((t) => t !== OWL + "NamedIndividual");
  const policy = types.map((t) => POLICY[t]).find(Boolean);
  if (!policy) { prefill[iri] = { decision: "defer", notes: `No code-list policy for ${types.join(", ")}; left for the curator.` }; continue; }
  const label = lit(iri, RDFS + "label") ?? local;
  const alt = lit(iri, SKOS + "altLabel");
  const comment = lit(iri, RDFS + "comment") ?? lit(iri, SKOS + "definition");
  const unit = lit(iri, EUDPP + "unitAsString");
  const ourLocal = policy.name(local, alt);
  const ourId = `oec:${ourLocal}`;
  const cleanLabel = label.replace(/^[A-Za-z0-9&-]+ - /, ""); // "GWP-biogenic - Global Warming …" → the long part
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
  const isConcept = policy.ourClass === "oec:SoCCriterion";
  const lines = [
    `${ourId}`,
    `    a owl:NamedIndividual, ${policy.ourClass}${isConcept ? ", skos:Concept" : ""} ;`,
    `    rdfs:label "${esc(cleanLabel)}"@en ;`,
  ];
  if (alt) lines.push(`    skos:notation "${esc(alt)}" ;`);
  if (comment) lines.push(`    rdfs:comment "${esc(comment)}"@en ;`);
  if (isConcept) lines.push(`    skos:inScheme oec:SoCCriterionScheme ;`);
  lines.push(`    rdfs:isDefinedBy <https://ref.openepcis.org/extensions/common/core/> ;`);
  lines.push(`    dcterms:source <${iri}> ;`);
  lines.push(`    skos:note "${esc(policy.authority)}${unit ? "; unit " + esc(unit) : ""}. Proposed from the eudpp reverse-coverage run of ${STAMP} to cover eudpp:${local}."@en ;`);
  lines.push(`    skos:exactMatch eudpp:${local} .`);
  blocks.push(lines.join("\n"));
  table.push(`| \`${ourId}\` | ${policy.ourClass} | ${cleanLabel.replace(/\|/g, "\\|")} | ${alt ?? ""} | ${unit ?? ""} | \`eudpp:${local}\` |`);
  if (policy.classStub) stubs.set(policy.ourClass, policy.classStub);
  prefill[iri] = {
    decision: "adopt",
    notes: `Proposal: ${ourId} (individual of ${policy.ourClass}) skos:exactMatch eudpp:${local}. ${policy.authority}.`
      + (policy.classStub ? ` CHECK: ${policy.ourClass} is a class stub this proposal adds.` : "")
      + (policy.ourClass === "oec:ActorRole" ? " CHECK: extend the closed oec:ActorRole list." : ""),
  };
  adopted++;
}

const STUB_LABELS: Record<string, string> = {
  "oec:ImpactCategory": "Impact Category",
  "oec:EN15804IndicatorGroup": "EN 15804 Indicator Group",
  "oec:AreaOfProtection": "Area of Protection",
  "oec:LcaComplianceStatus": "LCA Compliance Status",
  "oec:SoCCriterion": "Substance of Concern Criterion",
};
const stubBlocks = [...stubs.entries()].map(([cls, def]) => [
  `${cls}`,
  `    a owl:Class ;`,
  `    rdfs:label "${STUB_LABELS[cls] ?? cls.slice(4)}"@en ;`,
  `    rdfs:comment "${def.replace(/"/g, '\\"')}"@en ;`,
  `    rdfs:isDefinedBy <https://ref.openepcis.org/extensions/common/core/> ;`,
  `    skos:note "Class stub proposed by scripts/propose-cirpass2-codelists.ts (${STAMP}) to hold the code-list values below; CHECK before adopting."@en .`,
].join("\n"));

const ttl = `# Proposed code-list individuals from the eudpp reverse-coverage run of ${STAMP}.
# Generated by scripts/propose-cirpass2-codelists.ts (deterministic, no model): one block per
# upstream code-list value nothing of ours referenced, typed with the class of ours that holds the
# list, skos:exactMatch to the upstream value. A proposal for the curator, not an ontology.

@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix eudpp: <https://w3id.org/eudpp#> .
@prefix oec: <https://ref.openepcis.org/extensions/common/core/> .

# ===== class stubs the values below need (CHECK each) =====

${stubBlocks.join("\n\n")}

oec:SoCCriterionScheme
    a skos:ConceptScheme ;
    rdfs:label "Substance of Concern Criteria"@en ;
    rdfs:comment "The qualification criteria of ESPR Article 2(27) under which a substance is a substance of concern."@en ;
    rdfs:isDefinedBy <https://ref.openepcis.org/extensions/common/core/> ;
    dcterms:source <${EUDPP}SoCCriterionScheme> ;
    skos:exactMatch eudpp:SoCCriterionScheme .

# ===== values (${adopted}) =====

${blocks.join("\n\n")}
`;
writeFileSync(resolve(DOCS, `skos-adoption-proposal-eudpp-codelists-${STAMP}.ttl`), ttl);
writeFileSync(resolve(DOCS, `skos-adoption-proposal-eudpp-codelists-${STAMP}.md`),
  `# Proposed code-list individuals — eudpp reverse coverage ${STAMP}\n\n${adopted} values drafted deterministically from the EUDPP mirror; ` +
  `${stubs.size} class stubs to check (${[...stubs.keys()].join(", ")}).\n\n| Our individual | Of class | Label | Notation | Unit | Upstream |\n|---|---|---|---|---|---|\n${table.join("\n")}\n`);
writeFileSync(prefillPath, JSON.stringify(prefill, null, 2) + "\n");
const counts: Record<string, number> = {};
for (const v of Object.values(prefill)) counts[v.decision] = (counts[v.decision] ?? 0) + 1;
console.log(`code lists: ${adopted} individuals drafted, ${stubs.size} class stubs; prefill now ${JSON.stringify(counts)}`);
