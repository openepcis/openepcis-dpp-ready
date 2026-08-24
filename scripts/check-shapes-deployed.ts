#!/usr/bin/env tsx
/**
 * The post-deploy counter-check: every example passport must conform AS
 * JSON-LD, i.e. with its @context resolved from ref.openepcis.org.
 *
 * The inverse of scripts/check-shapes-itb.ts, deliberately. That gate expands
 * documents locally to N-Quads so that deployment skew cannot masquerade as an
 * engine disagreement — which means it is blind to the one thing THIS check
 * measures: whether the currently deployed contexts expand the documents the
 * way the shapes assume. When ref.openepcis.org lags the repository, a document
 * that is green through the local loader picks up stale coercions from the
 * live context (the classic: `"@type": "@id"` vs anyURI literal) and fails at
 * the Test Bed even though nothing in the repository is wrong.
 *
 * So: run check-shapes-itb.ts to qualify the shapes, deploy ref-openepcis,
 * then run THIS until it is green. Green here means the deployment matches
 * the suite and an upload of the raw JSON-LD is submittable.
 *
 * Needs the validator container (same one as the ITB gate) and network access
 * to ref.openepcis.org from inside that container.
 *
 * Usage:
 *   gitb/dev.sh up validators
 *   tsx scripts/check-shapes-deployed.ts [--validator-url http://localhost:8080] [--verbose]
 */

import { promises as fs } from "node:fs";
import path from "node:path";
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

/** Send the raw JSON-LD bytes; the validator resolves @context itself. */
async function validate(jsonldBytes: Buffer, validationType: string): Promise<TarResult> {
  const res = await fetch(`${BASE}/shacl/${DOMAIN}/api/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentToValidate: jsonldBytes.toString("base64"),
      embeddingMethod: "BASE64",
      validationType,
      contentSyntax: "application/ld+json",
      reportSyntax: "text/turtle",
    }),
  });
  if (!res.ok) throw new Error(`validator returned HTTP ${res.status}: ${await res.text()}`);
  const report = await res.text();

  const conforms = /sh:conforms\s+true/.test(report);
  const violations: string[] = [];
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
  try {
    const probe = await fetch(`${BASE}/shacl/${DOMAIN}/upload`);
    if (!probe.ok) throw new Error(`HTTP ${probe.status}`);
  } catch (e) {
    console.error(
      `Cannot reach the RDF validator at ${BASE} (${(e as Error).message}).\n` +
        `Start it with: gitb/dev.sh up validators`,
    );
    process.exit(1);
  }

  const modules = await discoverModules();
  console.log(
    `Validating the example passports AS JSON-LD through ${BASE}.\n` +
      `@context is resolved by the validator from ref.openepcis.org — this\n` +
      `measures the DEPLOYMENT, not the shapes (check-shapes-itb.ts does that).\n`,
  );

  let checked = 0;
  let failed = 0;

  for (const module of modules) {
    const examples = await seedExamples(module);
    if (!examples.length) continue;
    console.log(`── ${module.type} (${module.label})`);
    for (const rel of examples) {
      const bytes = await fs.readFile(path.join(ROOT, rel));
      const doc = JSON.parse(bytes.toString("utf8"));
      const subject = String(doc.id ?? doc["@id"] ?? "");
      const type = typeFor(module, subject);
      checked++;
      let result: TarResult;
      try {
        result = await validate(bytes, type);
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

  console.log(`\nSummary: ${checked} example(s) as raw JSON-LD, ${failed} failing.`);
  if (failed) {
    console.log(
      `\nA failure here with a green check-shapes-itb.ts is deployment skew:\n` +
        `ref.openepcis.org serves contexts older (or newer) than this working tree.\n` +
        `Redeploy ref-openepcis, or update the working tree, until both are green.`,
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
