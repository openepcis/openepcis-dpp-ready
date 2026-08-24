#!/usr/bin/env tsx
/**
 * Contract: every SHACL shapes graph this project publishes must actually run,
 * and the project's own example passports must satisfy it.
 *
 * Until this gate existed, 10 of the 11 *-shapes.ttl files were never executed
 * by anything — only the generated battery ec-readiness-shapes.ttl had a runner.
 * Shapes that nothing executes are prose: they can reference undefined terms,
 * target classes that never appear, or contradict the examples shipped beside
 * them, and nothing notices. That is tolerable while the shapes are only
 * documentation of intent. It stops being tolerable the moment they are handed
 * to the EU Interoperability Test Bed, where third parties run them against
 * their own data and every defect surfaces as our defect.
 *
 * For each module the gate assembles
 *   - a SHAPES graph: the module's shapes + the core shapes, because oec: is
 *     cross-cutting — a battery passport must satisfy the core constraints too;
 *   - a DATA graph: the example passport + the module ontology + the core
 *     ontology as BACKGROUND KNOWLEDGE.
 *
 * The background knowledge belongs in the DATA graph, not the shapes graph, and
 * that placement is load-bearing rather than incidental. SHACL evaluates
 * sh:class and resolves sh:targetClass subclass membership over the data graph
 * alone: the class hierarchy and the code-list individuals live in the ontology,
 * so without them a shape targeting gs1:PackagingDetails never fires on a
 * euppwr:Packaging instance, and `sh:class eutex:CareSymbolCode` rejects the very
 * individuals the ontology defines. The gate would be quietly vacuous in one
 * direction and loudly wrong in the other.
 *
 * The GITB validator resources bundle the same ontologies for the same reason;
 * the ITB validator reaches the same closed world from the other side by merging
 * the shapes model into the input model before validating.
 *
 * Every sh:Violation fails the build. sh:Warning and sh:Info are reported and
 * tolerated: the generated EC readiness shapes use them for conditional and
 * optional data points by design.
 *
 * ENGINE CAVEAT: this gate runs rdf-validate-shacl, which has no SHACL-SPARQL
 * implementation and THROWS as soon as a sh:sparql shape reaches a matching node.
 * Those constraints are therefore removed before validating and the count is
 * printed, so what this gate does not check stays visible instead of being
 * quietly assumed away. It is the offline, container-free, deterministic gate that
 * belongs in `pnpm run build`. The companion gate `pnpm run check:shapes:itb`
 * drives the same shapes through the European Commission's isaitb/shacl-validator,
 * whose Apache Jena engine does evaluate sh:sparql — which is how
 * dpp-sh:GranularityDigitalLinkConstraint is enforced at all. Neither gate
 * replaces the other.
 *
 * Usage:
 *   tsx scripts/check-shapes.ts [filter-substring] [--verbose] [--warnings]
 *     filter-substring  restrict to modules/examples whose path contains it
 *     --verbose         list every finding, not just a per-file summary
 *     --warnings        treat Warning as failing too (not used by the build)
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { offlineDocumentLoader } from "./lib/jsonld-loader.ts";
import {
  discoverModules,
  coreOf,
  granularityOfDigitalLink,
  ROOT,
  type ValidatableModule,
} from "./lib/modules.ts";
import {
  activateBySuffix,
  materialiseSubProperties,
  parseTurtle,
  stripOwlImports,
  stripSparqlConstraints,
  toDataGraph,
  validate,
  type Finding,
} from "./lib/shacl-run.ts";

const args = process.argv.slice(2);
const VERBOSE = args.includes("--verbose");
const FAIL_ON_WARNING = args.includes("--warnings");
const FILTER = args.find((a) => !a.startsWith("--"));

/** Examples are JSON-LD passports; the *.operational.jsonld goldens expand to the
 *  same graph (guaranteed by the EN 18223 round-trip gate), so validating both
 *  doubles the runtime and reports every finding twice. Take the seed form. */
function isSeedExample(rel: string): boolean {
  return rel.endsWith(".jsonld") && !rel.endsWith(".operational.jsonld");
}

async function examplesOf(module: ValidatableModule): Promise<string[]> {
  if (!module.examplesDir) return [];
  const abs = path.join(ROOT, module.examplesDir);
  const out: string[] = [];
  for (const rel of await fs.readdir(abs, { recursive: true })) {
    const relStr = String(rel).split(path.sep).join("/");
    if (isSeedExample(relStr)) out.push(`${module.examplesDir}/${relStr}`);
  }
  return out.sort();
}

/** Namespace → prefix, so a reported path keeps the one thing that disambiguates
 *  it. Two properties can share a local name across layers
 *  (oec:biodegradationPercentage vs eudet:biodegradationPercentage), and a
 *  local-name-only report makes a layering duplication look like missing data. */
const PREFIXES: [string, string][] = [
  ["https://ref.openepcis.io/extensions/common/core/shapes/", "dpp-sh"],
  ["https://ref.openepcis.io/extensions/common/core/", "oec"],
  ["https://ref.openepcis.io/extensions/eu/battery/", "eubat"],
  ["https://ref.openepcis.io/extensions/eu/textile/", "eutex"],
  ["https://ref.openepcis.io/extensions/eu/electronics/", "euelec"],
  ["https://ref.openepcis.io/extensions/eu/detergent/", "eudet"],
  ["https://ref.openepcis.io/extensions/eu/eudr/", "eudr"],
  ["https://ref.openepcis.io/extensions/eu/ppwr/", "euppwr"],
  ["https://ref.openepcis.io/extensions/eu/cpr/", "eucpr"],
  ["https://ref.openepcis.io/extensions/eu/iron-steel/", "eusteel"],
  ["https://ref.openepcis.io/extensions/us/fsma204/", "usfsma"],
  ["https://ref.gs1.org/voc/", "gs1"],
  ["https://schema.org/", "schema"],
  ["http://www.w3.org/2001/XMLSchema#", "xsd"],
];

function curie(iri: string): string {
  for (const [ns, prefix] of PREFIXES) {
    if (iri.startsWith(ns)) return `${prefix}:${iri.slice(ns.length)}`;
  }
  return iri.replace(/^.*[#/]/, "");
}

function formatFinding(f: Finding): string {
  const shape = f.sourceShape ? curie(f.sourceShape) : "(anonymous shape)";
  const focus = f.focusNode.replace(/^https?:\/\/[^/]+\//, "");
  const bits = [f.component?.replace(/ConstraintComponent$/, "") ?? "?"];
  if (f.path) bits.push(`path=${curie(f.path)}`);
  if (f.value !== undefined) bits.push(`value=${f.value}`);
  bits.push(f.message || "(no sh:message)");
  return `${f.severity.toUpperCase().padEnd(9)} ${shape}: ${bits.join(" · ")}  [${focus}]`;
}

async function main() {
  const modules = await discoverModules();
  const core = coreOf(modules);
  const documentLoader = await offlineDocumentLoader();

  const coreShapesTtl = await fs.readFile(path.join(ROOT, core.shapes), "utf8");
  const coreOntologyTtl = await fs.readFile(path.join(ROOT, core.ontology), "utf8");

  // The filter matches a module directory OR an example path, so both
  // `check-shapes eu/textile` and `check-shapes organic-tee` do what they look
  // like they do. Matching only module dirs silently selected nothing.
  const selected = FILTER
    ? (
        await Promise.all(
          modules.map(async (m) =>
            m.dir.includes(FILTER) || (await examplesOf(m)).some((f) => f.includes(FILTER))
              ? m
              : undefined,
          ),
        )
      ).filter((m): m is ValidatableModule => m !== undefined)
    : modules;
  if (FILTER && !selected.length) {
    console.log(`No module or example path matches "${FILTER}".`);
    process.exit(1);
  }
  console.log(
    `Running ${selected.length} shapes graph(s) over the example passports ` +
      `(engine: rdf-validate-shacl; sh:sparql not evaluated)\n`,
  );

  let violations = 0;
  let warnings = 0;
  let infos = 0;
  let filesChecked = 0;
  let modulesWithoutExamples = 0;
  let sparqlSkipped = 0;

  for (const module of selected) {
    const shapeParts = [await fs.readFile(path.join(ROOT, module.shapes), "utf8")];
    const ontologyParts = [await fs.readFile(path.join(ROOT, module.ontology), "utf8")];
    if (module.dir !== core.dir) {
      shapeParts.push(coreShapesTtl);
      ontologyParts.push(coreOntologyTtl);
    }
    // One shapes graph per granularity level, because activation MUTATES the
    // store: the per-level shapes ship sh:deactivated true and exactly one
    // level's suffix is dropped. A single shared store would either leak the
    // previous example's level or require all three active at once, which would
    // demand a passport be a model and an item simultaneously.
    const AGNOSTIC = "*";
    const shapesByLevel = new Map<string, ReturnType<typeof parseTurtle>>();
    let background;
    try {
      background = parseTurtle(...ontologyParts);
      stripOwlImports(background);
      // The level-agnostic graph always exists: every per-level shape stays
      // deactivated in it. Levels are added on top, one activated graph each.
      for (const level of [AGNOSTIC, ...module.granularities.map((g) => g.suffix.replace(/^-/, ""))]) {
        const store = parseTurtle(...shapeParts);
        stripOwlImports(store);
        // rdf-validate-shacl throws on sh:sparql rather than ignoring it; the ITB
        // parity gate is where those constraints are evaluated.
        sparqlSkipped = stripSparqlConstraints(store);
        if (level !== AGNOSTIC) activateBySuffix(store, `-${level}`);
        shapesByLevel.set(level, store);
      }
    } catch (e) {
      console.log(`PARSE FAIL ${module.shapes}: ${(e as Error).message}`);
      violations++;
      continue;
    }
    /**
     * Pick the shapes graph matching this passport's Digital Link granularity.
     * A document with no recognisable Digital Link gets the level-agnostic graph:
     * asserting a level the document never claimed would report obligations it
     * was never subject to.
     */
    const shapesFor = (subjectIri: string) => {
      const level = granularityOfDigitalLink(subjectIri);
      return (level && shapesByLevel.get(level)) ?? shapesByLevel.get(AGNOSTIC)!;
    };

    const examples = (await examplesOf(module)).filter((f) => !FILTER || f.includes(FILTER));
    console.log(`── ${module.type} (${module.label}) · ${examples.length} example(s)`);
    if (!examples.length) {
      // Not a failure: cpr/iron-steel ship few examples and the core ships only
      // organization records. Surfaced so a module never silently drifts to zero.
      console.log("   (no example passports — shapes parsed but not exercised)");
      modulesWithoutExamples++;
      continue;
    }

    for (const rel of examples) {
      filesChecked++;
      let report;
      let level: string | undefined;
      try {
        const doc = JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8"));
        const subject = String(doc.id ?? doc["@id"] ?? "");
        level = granularityOfDigitalLink(subject);
        const data = await toDataGraph([doc], documentLoader);
        data.addQuads([...background]);
        // A module property that specialises a core one satisfies the core
        // obligation only under RDFS entailment; the ITB's Jena engine can infer
        // it, rdf-validate-shacl cannot, so materialise it for both.
        materialiseSubProperties(data, background);
        report = await validate(shapesFor(subject), data);
      } catch (e) {
        console.log(`   ERROR  ${rel}: ${(e as Error).message}`);
        violations++;
        continue;
      }

      const v = report.findings.filter((f) => f.severity === "Violation");
      const w = report.findings.filter((f) => f.severity === "Warning");
      const i = report.findings.filter((f) => f.severity === "Info");
      violations += v.length;
      warnings += w.length;
      infos += i.length;

      const tally = [
        v.length ? `${v.length} violation(s)` : "",
        w.length ? `${w.length} warning(s)` : "",
        i.length ? `${i.length} info` : "",
      ]
        .filter(Boolean)
        .join(", ");

      const at = module.granularities.length ? ` @${level ?? "level-agnostic"}` : "";
      if (v.length) console.log(`   FAIL   ${rel}${at}: ${tally}`);
      else if (w.length || i.length) console.log(`   OK     ${rel}${at}: ${tally}`);
      else console.log(`   OK     ${rel}${at}`);

      const show = VERBOSE ? report.findings : v;
      for (const f of show) console.log(`            ${formatFinding(f)}`);
    }
  }

  console.log(
    `\nSummary: ${selected.length} module(s), ${filesChecked} example(s), ` +
      `${violations} violation(s), ${warnings} warning(s), ${infos} info.`,
  );
  if (modulesWithoutExamples) {
    console.log(`${modulesWithoutExamples} module(s) have no example passports to exercise.`);
  }
  if (!VERBOSE && (warnings || infos)) {
    console.log("Re-run with --verbose to list warnings and info findings.");
  }
  if (sparqlSkipped) {
    console.log(
      `${sparqlSkipped} sh:sparql constraint(s) were NOT evaluated here — this engine has no ` +
        `SHACL-SPARQL support. They run in \`pnpm run check:shapes:itb\` against the EC validator.`,
    );
  }

  if (violations || (FAIL_ON_WARNING && warnings)) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
