#!/usr/bin/env tsx
/**
 * Parity gate for the JSON validator domain: the external targets' JSON types
 * (scripts/lib/targets.ts) through isaitb/json-validator, against what ajv says locally.
 *
 * For every JSON type: `{"this":"is not a passport"}` must fail; every fixture of the target (the
 * publisher's examples and what our crosswalk lifts) must get the same verdict as ajv on the same,
 * unmodified schemas. A disagreement means the two engines read a schema differently (a $ref the
 * validator cannot resolve, a keyword one of them ignores), and the hosted type would then not say
 * what our conformance report claims.
 *
 * The JSON domain is self-hosted (gitb/docker/docker-compose.validators.yml, port 8081); the EC
 * Test Bed hosts only the SHACL domain today.
 *
 * Usage:
 *   tsx scripts/check-json-itb.ts [--validator-url http://localhost:8081] [--verbose]
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { VALIDATOR_DOMAIN } from "./lib/gitb.ts";
import { ROOT } from "./lib/modules.ts";
import { GARBAGE, fixturesOf, jsonFindings, loadTargets, readDocument, TURTLE } from "./lib/targets.ts";

const args = process.argv.slice(2);
const VERBOSE = args.includes("--verbose");
const urlFlag = args.indexOf("--validator-url");
const BASE = (urlFlag >= 0 ? args[urlFlag + 1] : undefined) ?? "http://localhost:8081";

interface Result {
  success: boolean;
  errors: string[];
}

/** POST one document; the validator answers a GITB TestStepReport (XML). */
async function validate(doc: unknown, validationType: string): Promise<Result> {
  const res = await fetch(`${BASE}/json/${VALIDATOR_DOMAIN}/api/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentToValidate: Buffer.from(JSON.stringify(doc), "utf8").toString("base64"),
      embeddingMethod: "BASE64",
      validationType,
    }),
  });
  if (!res.ok) throw new Error(`validator returned HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const xml = await res.text();
  const result = /<result>(\w+)<\/result>/.exec(xml)?.[1];
  const errors = [...xml.matchAll(/<error[^>]*>[\s\S]*?<description>([\s\S]*?)<\/description>/g)].map((m) => m[1].trim());
  return { success: result === "SUCCESS", errors };
}

async function main() {
  let checked = 0;
  let failed = 0;
  console.log(`Validating the external targets' JSON documents through ${BASE} (isaitb/json-validator).`);
  for (const target of loadTargets()) {
    const types = target.types.filter((t) => t.schemas.length);
    if (!types.length) continue;
    console.log(`\n── ${target.title} ${target.version}`);
    for (const type of types) {
      checked++;
      const r = await validate(GARBAGE, type.id);
      if (r.success) {
        failed++;
        console.log(`   FAIL   ${type.id}: accepts {"this":"is not a passport"}`);
      }
    }
    for (const f of fixturesOf(target)) {
      const doc = readDocument(f.file);
      if (TURTLE in doc) continue;
      for (const id of f.types) {
        const type = types.find((t) => t.id === id);
        if (!type) continue;
        checked++;
        const local = jsonFindings(target, type, doc);
        const expected = !local.form.length && !local.missing.length;
        let r: Result;
        try {
          r = await validate(doc, id);
        } catch (e) {
          failed++;
          console.log(`   ERROR  ${f.file} [${id}]: ${(e as Error).message}`);
          continue;
        }
        if (r.success === expected) {
          if (VERBOSE || !expected) console.log(`   OK     ${f.file} [${id}]${expected ? "" : `: rejected, as by ajv (${r.errors.length} error(s))`}`);
          continue;
        }
        failed++;
        console.log(`   FAIL   ${f.file} [${id}]: validator ${r.success ? "accepts" : "rejects"}, ajv ${expected ? "accepts" : "rejects"}`);
        for (const e of r.errors.slice(0, VERBOSE ? undefined : 5)) console.log(`            ${e}`);
        for (const e of [...local.form, ...local.missing].slice(0, VERBOSE ? undefined : 5)) console.log(`            ajv: ${e}`);
      }
    }
  }
  console.log(`\nSummary: ${checked} validation(s) through the JSON validator, ${failed} failing.`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
