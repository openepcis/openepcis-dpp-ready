#!/usr/bin/env tsx
/**
 * Contract: the shapes we publish must produce the SAME verdict in the European
 * Commission's validator as in our own offline gate.
 *
 * scripts/check-shapes.ts runs rdf-validate-shacl in-process: offline,
 * deterministic, no container, and therefore part of `pnpm run build`. It is not
 * the engine anyone else will use. The EU Interoperability Test Bed runs the
 * isaitb/shacl-validator image (Apache Jena underneath), and the two engines do
 * NOT agree for free:
 *
 *   - rdf-validate-shacl silently skips sh:sparql constraints; Jena evaluates
 *     them, so dpp-sh:GranularityDigitalLinkConstraint only ever runs over there.
 *   - Neither applies rdfs:subPropertyOf entailment, but our offline gate
 *     materialises it at runtime while the shipped bundle relies on the
 *     sh:alternativePath rewrite. Two mechanisms for one obligation.
 *
 * Either difference could let a document pass here and fail at the Test Bed —
 * exactly the failure mode a conformance artifact must not have. This gate closes
 * the loop by driving the GENERATED bundle (config.properties included, so a
 * mis-declared validation type fails too) through the real container and
 * comparing conformance per example.
 *
 * WHY IT SENDS N-QUADS AND NOT JSON-LD. The examples are JSON-LD, and the
 * validator will happily take them — but then it resolves each document's
 * @context over the network from ref.openepcis.io, i.e. from the LAST DEPLOYED
 * revision. The first run of this gate failed on 16 examples for exactly that
 * reason: the working tree had already corrected the anyURI coercions while
 * ref.openepcis.io still served `"@type": "@id"`, so the same document expanded
 * to an IRI there and to an anyURI literal here. That is deployment skew, not an
 * engine disagreement, and a gate that conflates the two is useless for both.
 *
 * So the documents are expanded HERE, with the repo's offline document loader,
 * and the resulting N-Quads are what gets validated. The comparison is then
 * purely about the two SHACL engines over identical RDF. Context resolution is
 * already covered by `pnpm run validate:examples` and `pnpm run check:operational`.
 *
 * It needs Docker/Podman, so it lives in CI and in the developer's hands rather
 * than in the offline build.
 *
 * Usage:
 *   pnpm run build:gitb                      # bundle must be current
 *   podman run -d -p 8080:8080 \
 *     -e validator.resourceRoot=/validator/resources/ \
 *     -v "$PWD/gitb/validator-resources/shacl:/validator/resources:ro,Z" \
 *     docker.io/isaitb/shacl-validator:latest
 *   tsx scripts/check-shapes-itb.ts [--validator-url http://localhost:8080] [--verbose]
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import jsonld from "jsonld";
import { offlineDocumentLoader } from "./lib/jsonld-loader.ts";
import {
  discoverModules,
  granularityOfDigitalLink,
  ROOT,
  type ValidatableModule,
} from "./lib/modules.ts";

const args = process.argv.slice(2);
const VERBOSE = args.includes("--verbose");
const urlFlag = args.indexOf("--validator-url");
const BASE = (urlFlag >= 0 ? args[urlFlag + 1] : undefined) ?? "http://localhost:8080";
const DOMAIN = "dpp";

interface TarResult {
  conforms: boolean;
  violations: string[];
}

/** Ask the validator to report in Turtle and read the verdict out of it. */
async function validate(nquads: string, validationType: string): Promise<TarResult> {
  const res = await fetch(`${BASE}/shacl/${DOMAIN}/api/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentToValidate: Buffer.from(nquads, "utf8").toString("base64"),
      embeddingMethod: "BASE64",
      validationType,
      contentSyntax: "application/n-quads",
      reportSyntax: "text/turtle",
    }),
  });
  if (!res.ok) throw new Error(`validator returned HTTP ${res.status}: ${await res.text()}`);
  const report = await res.text();

  // sh:conforms true/false, and the message of each Violation result.
  const conforms = /sh:conforms\s+true/.test(report);
  const violations: string[] = [];
  // Results are blank-node blocks; pick the ones with Violation severity.
  for (const block of report.split(/\bsh:result\b/).slice(1)) {
    if (!/sh:resultSeverity\s+sh:Violation/.test(block)) continue;
    const msg = /sh:resultMessage\s+"((?:[^"\\]|\\.)*)"/.exec(block)?.[1];
    const shape = /sh:sourceConstraintComponent\s+sh:(\w+)/.exec(block)?.[1];
    violations.push(`${shape ?? "?"}: ${msg ?? "(no message)"}`);
  }
  return { conforms, violations };
}

/** The validation type a given example should be checked against. */
function typeFor(module: ValidatableModule, subjectIri: string): string {
  if (!module.granularities.length) return module.type;
  const level = granularityOfDigitalLink(subjectIri);
  const variant = module.granularities.find((g) => g.suffix === `-${level}`);
  return variant?.type ?? module.type;
}

async function seedExamples(module: ValidatableModule): Promise<string[]> {
  if (!module.examplesDir) return [];
  const abs = path.join(ROOT, module.examplesDir);
  const out: string[] = [];
  for (const rel of await fs.readdir(abs, { recursive: true })) {
    const r = String(rel).split(path.sep).join("/");
    if (r.endsWith(".jsonld") && !r.endsWith(".operational.jsonld")) {
      out.push(`${module.examplesDir}/${r}`);
    }
  }
  return out.sort();
}

async function main() {
  // Fail fast and legibly if the container is not there — the most common cause
  // of a red run, and nothing below would make sense without it.
  try {
    const probe = await fetch(`${BASE}/shacl/${DOMAIN}/upload`);
    if (!probe.ok) throw new Error(`HTTP ${probe.status}`);
  } catch (e) {
    console.error(
      `Cannot reach the RDF validator at ${BASE} (${(e as Error).message}).\n` +
        `Start it with:\n` +
        `  pnpm run build:gitb\n` +
        `  podman run -d -p 8080:8080 -e validator.resourceRoot=/validator/resources/ \\\n` +
        `    -v "$PWD/gitb/validator-resources/shacl:/validator/resources:ro,Z" \\\n` +
        `    docker.io/isaitb/shacl-validator:latest`,
    );
    process.exit(1);
  }

  const modules = await discoverModules();
  const documentLoader = await offlineDocumentLoader();
  console.log(
    `Validating the example passports through ${BASE} (isaitb/shacl-validator).\n` +
      `Documents expanded locally to N-Quads, so the comparison is engine-vs-engine\n` +
      `and not affected by what ref.openepcis.io currently serves.\n`,
  );

  let checked = 0;
  let failed = 0;

  for (const module of modules) {
    const examples = await seedExamples(module);
    if (!examples.length) continue;
    console.log(`── ${module.type} (${module.label})`);
    for (const rel of examples) {
      const doc = JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8"));
      const subject = String(doc.id ?? doc["@id"] ?? "");
      const type = typeFor(module, subject);
      checked++;
      let result: TarResult;
      try {
        const nquads = (await jsonld.toRDF(doc, {
          format: "application/n-quads",
          documentLoader: documentLoader as never,
        })) as unknown as string;
        result = await validate(nquads, type);
      } catch (e) {
        failed++;
        console.log(`   ERROR  ${rel} [${type}]: ${(e as Error).message}`);
        continue;
      }
      if (result.conforms) {
        console.log(`   OK     ${rel} [${type}]`);
      } else {
        failed++;
        console.log(`   FAIL   ${rel} [${type}]: ${result.violations.length} violation(s)`);
        for (const v of VERBOSE ? result.violations : result.violations.slice(0, 5)) {
          console.log(`            ${v}`);
        }
        if (!VERBOSE && result.violations.length > 5) {
          console.log(`            … ${result.violations.length - 5} more (--verbose)`);
        }
      }
    }
  }

  // Phase 2: the shipped test-suite fixtures must mean what they claim.
  //
  // The GITB self-test asserts that the positive fixtures conform and — with
  // verify/@invert — that the negative ones do NOT. A negative fixture that still
  // conforms turns that assertion into a lie the Test Bed would report as a pass,
  // which is worse than having no self-test. Checking both directions here means
  // the suite cannot be published claiming a discrimination it does not have.
  const suite = path.join(ROOT, "gitb/test-suites/openepcis-dpp/resources");
  const fixtures: { file: string; type: string; mustConform: boolean }[] = [];
  for (const [kind, mustConform] of [
    ["fixtures", true],
    ["negative", false],
  ] as const) {
    const root = path.join(suite, kind);
    let types: string[] = [];
    try {
      types = await fs.readdir(root);
    } catch {
      continue;
    }
    for (const type of types.sort()) {
      for (const name of (await fs.readdir(path.join(root, type))).sort()) {
        fixtures.push({ file: path.join(root, type, name), type, mustConform });
      }
    }
  }

  if (fixtures.length) {
    console.log(`\n── test-suite fixtures (${fixtures.length})`);
    for (const f of fixtures) {
      const nq = await fs.readFile(f.file, "utf8");
      let result: TarResult;
      try {
        result = await validate(nq, f.type);
      } catch (e) {
        failed++;
        console.log(`   ERROR  ${path.relative(ROOT, f.file)}: ${(e as Error).message}`);
        continue;
      }
      if (result.conforms === f.mustConform) continue;
      failed++;
      console.log(
        f.mustConform
          ? `   FAIL   ${path.relative(ROOT, f.file)} [${f.type}]: reference fixture was REJECTED`
          : `   FAIL   ${path.relative(ROOT, f.file)} [${f.type}]: broken fixture still CONFORMS — ` +
              `the self-test's invert assertion would pass vacuously`,
      );
    }
    const bad = fixtures.length && failed ? "" : " — all as claimed";
    console.log(`   ${fixtures.length} fixture(s) checked${bad}`);
  }

  console.log(`\nSummary: ${checked} example(s) through the EC validator, ${failed} failing.`);
  if (failed) {
    console.log(
      `\nA failure here with a green \`pnpm run check:shapes\` means the two engines disagree:\n` +
        `most likely a sh:sparql constraint (which only Jena runs) or a superproperty\n` +
        `obligation whose sh:alternativePath rewrite is missing from the bundle.`,
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
