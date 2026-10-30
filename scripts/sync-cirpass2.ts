/**
 * Sync the CIRPASS-2 ontology mirrors under extensions/upstream/cirpass2-*.
 *
 *   pnpm run sync:eudpp              # CORE: extensions/upstream/cirpass2-eudpp/ontology/eudpp.ttl
 *   pnpm run sync:cirpass2-textile   # extensions/upstream/cirpass2-textile/ontology/textile.ttl
 *   pnpm run sync:cirpass2-battery   # extensions/upstream/cirpass2-battery/ontology/battery.ttl
 *
 * NETWORK SYNC — NEVER RUN THIS AS PART OF A BULK REGENERATION.
 * This script FETCHES FROM UPSTREAM. Every other generator here is
 * deterministic from local sources, so "re-run all generators" is a safe proof
 * that nothing hidden reintroduces old data. It is not safe for a network sync:
 * it mixes whatever upstream serves right now into an unrelated change. Its
 * sibling sync:rail did exactly that during a namespace rename on 2026-08-24 —
 * a failed fetch wrote three mirror files to zero lines. Sync a mirror on
 * purpose, in its own commit, and read the diff.
 *
 * SOURCE. The module files are read from the CIRPASS-2 documentation repository
 * (github.com/CIRPASS-2/ontologies-docs, the WIDOCO site behind
 * https://cirpass-2.github.io/ontologies-docs/) at the commit pinned in
 * UPSTREAM_COMMIT, so a sync is reproducible and the diff of a bump is the
 * upstream delta and nothing else. The W3ID namespace (https://w3id.org/eudpp)
 * stays the dereference target in our documentation; it redirects to the
 * Semantic Treehouse hub, whose exports are what this script read until
 * 2026-10. They were abandoned as the source because (a) they cannot be pinned,
 * (b) the hub trails the documented release by a patch level, and (c) on
 * 2026-10-29 the COMP export came back as an OWL structure dump of blank nodes
 * with no IRI in it at all. The guard below exists so that a module in that
 * state can never again be written into a mirror unnoticed.
 *
 * Upstream IRIs are preserved, nothing is rebranded. The merged Turtle is the
 * single source file the build pipeline parses into json/<name>.json (same
 * pattern as the GS1 Rail mirror). Our own ontology references the eudpp terms
 * by IRI only — no owl:imports, no class adoption
 * (see extensions/common/interop/docs/CIRPASS2_ALIGNMENT.md).
 *
 * Upstream licenses: CORE and Battery — Apache License 2.0 (CC BY 4.0 fallback
 * when treated as a document), (c) CIRPASS-2 project / TalTech (CORE) and the
 * battery module authors; Textile — CC BY 4.0, CIRPASS-2 textile working group
 * (task T3.2 led by GS1 in Europe). The mirrors keep those licenses.
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Parser, Writer, Store, type Quad } from "n3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const UPSTREAM_REPO = "CIRPASS-2/ontologies-docs";
/** Pinned upstream commit. Bump deliberately, in the sync commit. */
const UPSTREAM_COMMIT = "a41561dc9f8a237124d20b5ed5fc221360252fbb";
const RAW_BASE = `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${UPSTREAM_COMMIT}`;

const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const OWL = "http://www.w3.org/2002/07/owl#";
const DCT = "http://purl.org/dc/terms/";

interface ModuleSpec {
  /** Path of the module directory in the upstream repository. */
  path: string;
  /** Short name used in the log and the mirror header. */
  key: string;
  /** Minimum number of distinct named subjects inside `namespaces`; 0 for an
   *  umbrella that only declares owl:imports. */
  minTerms: number;
}

interface MirrorSpec {
  name: string;
  title: string;
  modules: ModuleSpec[];
  /** Namespace prefixes (string match) that hold the mirror's own terms. */
  namespaces: string[];
  /** The owl:Ontology node that carries the mirror's version and issue date. */
  ontologyIri: string;
  out: string;
  prefixes: Record<string, string>;
  license: string[];
}

const EUDPP_NS = "https://w3id.org/eudpp#";

const MIRRORS: Record<string, MirrorSpec> = {
  core: {
    name: "eudpp",
    title: "CIRPASS-2 EUDPP Core Ontology",
    // CORE plus its owl:imports closure, read module by module so each
    // module's owl:Ontology node (version, issued) survives the merge.
    modules: [
      { path: "CORE/core", key: "CORE", minTerms: 0 },
      { path: "CORE/actor", key: "ACTOR", minTerms: 10 },
      { path: "CORE/connector", key: "CON", minTerms: 10 },
      { path: "CORE/event", key: "EVENT", minTerms: 10 },
      { path: "CORE/ident", key: "IDENT", minTerms: 10 },
      { path: "CORE/mat", key: "MAT", minTerms: 5 },
      { path: "CORE/p_dpp", key: "P_DPP", minTerms: 10 },
      { path: "CORE/soc", key: "SOC", minTerms: 10 },
      { path: "CORE/comp", key: "COMP", minTerms: 10 },
      { path: "CORE/lca", key: "LCA", minTerms: 10 },
    ],
    namespaces: [EUDPP_NS],
    ontologyIri: "https://w3id.org/eudpp/",
    out: "extensions/upstream/cirpass2-eudpp/ontology/eudpp.ttl",
    prefixes: { eudpp: EUDPP_NS },
    license: [
      "# Upstream license: Apache License 2.0 (CC BY 4.0 fallback as a document),",
      "# (c) CIRPASS-2 project / TalTech.",
    ],
  },
  textile: {
    name: "textile",
    title: "CIRPASS-2 Textile Ontology",
    // One merged export: the umbrella's owl:imports closure over the twelve
    // textile modules plus the two code-list files, as published.
    modules: [{ path: "Textile/textile-ontology-complete", key: "textile-ontology-complete", minTerms: 300 }],
    namespaces: ["https://w3id.org/eudpp/textile-"],
    ontologyIri: "https://w3id.org/eudpp/textile-ontology",
    out: "extensions/upstream/cirpass2-textile/ontology/textile.ttl",
    prefixes: Object.fromEntries(
      [
        "assessment", "associated-materials", "associated-materials-codelists", "codelists",
        "connector", "context", "core", "durability", "indicator", "process", "recyclability",
        "repairability", "soc", "structure",
      ].map((m) => [`txt-${m}`, `https://w3id.org/eudpp/textile-${m}#`]),
    ),
    license: [
      "# Upstream license: CC BY 4.0, (c) CIRPASS-2 project — textile upper-level ontology task T3.2 (led by GS1 in Europe).",
    ],
  },
  battery: {
    name: "battery",
    title: "CIRPASS-2 EU DPP Battery Ontology",
    // One merged export: the umbrella plus its thematic modules and SKOS
    // vocabularies. The file also carries MIREOT copies of a few CORE terms
    // (eudpp#Product, eudpp#MaterialOfComposition, …); they are outside the
    // battery namespaces and are not counted or indexed as battery terms.
    modules: [{ path: "Battery/battery-ontology-complete", key: "battery-ontology-complete", minTerms: 50 }],
    namespaces: ["https://w3id.org/eudpp/battery#", "https://w3id.org/eudpp/battery-"],
    ontologyIri: "https://w3id.org/eudpp/battery",
    out: "extensions/upstream/cirpass2-battery/ontology/battery.ttl",
    prefixes: {
      bat: "https://w3id.org/eudpp/battery#",
      ...Object.fromEntries(
        [
          "categories", "chemistries", "extinguisher-classes", "labeling", "locations",
          "materials", "metals", "performance", "statuses",
        ].map((m) => [`bat-${m}`, `https://w3id.org/eudpp/battery-${m}#`]),
      ),
      eudpp: EUDPP_NS,
    },
    license: [
      "# Upstream license: Apache License 2.0 (CC BY 4.0 fallback as a document),",
      "# (c) CIRPASS-2 project — battery ontology authors.",
    ],
  },
};

const which = process.argv[2] ?? "core";
const spec = MIRRORS[which];
if (!spec) {
  console.error(`unknown mirror "${which}"; one of: ${Object.keys(MIRRORS).join(", ")}`);
  process.exit(2);
}

async function fetchModule(path: string): Promise<string> {
  const url = `${RAW_BASE}/${path}/ontology.ttl`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

const inNamespace = (iri: string) => spec.namespaces.some((ns) => iri.startsWith(ns));

const store = new Store();
const moduleLog: string[] = [];
let mirrorVersion = "";
let mirrorIssued = "";

for (let i = 0; i < spec.modules.length; i++) {
  const mod = spec.modules[i];
  const ttl = await fetchModule(mod.path);
  // Per-module blank-node prefix so anonymous OWL constructs (restrictions,
  // unions) from different exports can never collide in the merged store.
  const quads: Quad[] = new Parser({ blankNodePrefix: `_:m${i}_` }).parse(ttl);

  const ontologyNode = quads.find(
    (q) => q.predicate.value === `${RDF}type` && q.object.value === `${OWL}Ontology`,
  )?.subject;
  // GUARD 1: the ontology node must be an IRI. The broken hub export of COMP
  // (2026-10-29) parsed fine but declared a blank-node ontology and nothing else.
  if (!ontologyNode || ontologyNode.termType !== "NamedNode") {
    throw new Error(`${mod.key}: no named owl:Ontology node in ${mod.path}/ontology.ttl — refusing to write a mirror from it`);
  }
  // GUARD 2: a content module must carry its terms.
  const named = new Set(
    quads.filter((q) => q.subject.termType === "NamedNode" && inNamespace(q.subject.value)).map((q) => q.subject.value),
  );
  if (named.size < mod.minTerms) {
    throw new Error(`${mod.key}: only ${named.size} named subjects in ${spec.namespaces.join(" | ")} (expected ≥ ${mod.minTerms}) — refusing to write a mirror from it`);
  }

  const ontologyIri = ontologyNode.value;
  const val = (p: string) => quads.find((q) => q.subject.value === ontologyIri && q.predicate.value === p)?.object.value;
  const label = val(`${RDFS}label`) ?? val(`${DCT}title`) ?? mod.key;
  const version = val(`${OWL}versionInfo`) ?? "no version";
  if (ontologyIri === spec.ontologyIri) {
    mirrorVersion = version;
    mirrorIssued = val(`${DCT}issued`) ?? "";
  }
  for (const q of quads) store.addQuad(q);
  moduleLog.push(`${label} (${version})`);
  console.log(`  fetched ${mod.path} — ${label} (${version}) — ${quads.length} quads, ${named.size} named subjects`);
}

if (!mirrorVersion) {
  throw new Error(`ontology node ${spec.ontologyIri} not found in the fetched modules — refusing to write`);
}

const writer = new Writer({
  prefixes: {
    ...spec.prefixes,
    owl: OWL,
    rdf: RDF,
    rdfs: RDFS,
    xsd: "http://www.w3.org/2001/XMLSchema#",
    dcterms: DCT,
    skos: "http://www.w3.org/2004/02/skos/core#",
    schema: "https://schema.org/",
    vann: "http://purl.org/vocab/vann/",
  },
});
writer.addQuads(store.getQuads(null, null, null, null));

const body = await new Promise<string>((resolve, reject) =>
  writer.end((err, result) => (err ? reject(err) : resolve(result))),
);

const termCount = new Set(
  store.getQuads(null, null, null, null)
    .filter((q) => q.subject.termType === "NamedNode" && inNamespace(q.subject.value))
    .map((q) => q.subject.value),
).size;

const header = [
  `# ${spec.title} — upstream mirror (${mirrorVersion}${mirrorIssued ? `, issued ${mirrorIssued}` : ""}).`,
  `# Source: github.com/${UPSTREAM_REPO} @ ${UPSTREAM_COMMIT.slice(0, 7)}`,
  `#   (${spec.modules.map((m) => `${m.path}/ontology.ttl`).join(", ")}),`,
  "# the files behind https://cirpass-2.github.io/ontologies-docs/. Verbatim merge; upstream IRIs",
  "# preserved, nothing rebranded. Term IRIs dereference via https://w3id.org/eudpp (Semantic",
  `# Treehouse hub). Generated by scripts/sync-cirpass2.ts (pnpm run sync:${which === "core" ? "eudpp" : `cirpass2-${which}`}).`,
  `# Modules: ${moduleLog.join("; ")}.`,
  "#",
  ...spec.license,
  "",
].join("\n");

const out = join(ROOT, spec.out);
writeFileSync(out, header + body);
console.log(`\nWrote ${out}`);
console.log(`  ${store.size} quads, ${termCount} named subjects in ${spec.namespaces.join(" | ")}, ${spec.modules.length} module file(s), upstream @ ${UPSTREAM_COMMIT.slice(0, 7)}`);
