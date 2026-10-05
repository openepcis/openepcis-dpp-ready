#!/usr/bin/env tsx
/**
 * Provision the OpenEPCIS conformance community on an Interoperability Test Bed,
 * through its automation REST API.
 *
 * What it builds, idempotently: one specification per validation type, the
 * DPPDataProvider actor under each, the GITB test suite deployed once as a
 * SHARED suite and linked to every specification, and an organisation, system
 * and conformance statement per specification for the reference passports.
 * Everything is derived from the shipping validator configuration, so the Test
 * Bed cannot drift from the bundle the validator serves.
 *
 * THE HEADER. The API key header is documented as `ITB_API_KEY`, and that name
 * works against a local instance. The shared Test Bed sits behind a proxy that
 * drops headers containing underscores, so the same call comes back
 * `{"error_code":"204","error_description":"Needs API key header."}` and reads
 * exactly like a disabled API. `ITB-API-KEY` passes through both. That one
 * character is the difference between "the automation API is not available to
 * us" and provisioning the whole community in forty seconds.
 *
 * PERMISSIONS. Three different keys, and using the wrong one gives a 403 whose
 * wording points elsewhere:
 *   - specifications, actors, shared test suites, organisations, systems: the
 *     COMMUNITY key
 *   - conformance statements and test sessions: the ORGANISATION key
 *   - domains and communities themselves: the MASTER key, which only the Test
 *     Bed operator holds, so on a shared instance those two exist already
 * Conformance statements additionally need "Manage test sessions via REST API"
 * under Community details > User permissions, which no API call can set. Until
 * it is ticked, every statement fails with "You are not allowed to manage test
 * sessions through the automation API".
 *
 * Usage:
 *   ITB_COMMUNITY_KEY=... ITB_DOMAIN_KEY=... \
 *     tsx scripts/provision-itb-community.ts [--url https://www.itb.ec.europa.eu/itb] [--run]
 *
 * Keys come from the Test Bed UI (the domain and community detail forms) and
 * belong in the password manager, never in this repository. `--run` executes
 * the 16 self-tests afterwards and prints the verdicts.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT } from "./lib/modules.ts";
import { VALIDATOR_DOMAIN, SHACL_RESOURCE_ROOT } from "./lib/gitb.ts";

const args = process.argv.slice(2);
const urlFlag = args.indexOf("--url");
const RUN = args.includes("--run");
const BASE = `${(urlFlag >= 0 ? args[urlFlag + 1]! : "https://www.itb.ec.europa.eu/itb").replace(/\/$/, "")}/api/rest`;

const COMMUNITY_KEY = process.env.ITB_COMMUNITY_KEY;
const DOMAIN_KEY = process.env.ITB_DOMAIN_KEY;
/** Deterministic keys we mint ourselves, so a re-run addresses the same objects. */
const ORG_KEY = process.env.ITB_ORG_KEY ?? "openepcis-org";
const SUT_KEY = process.env.ITB_SUT_KEY ?? "openepcis-sut";
const ACTOR = "DPPDataProvider";
const SUITE_ZIP = path.join(ROOT, "gitb/openepcis-dpp-testsuite.zip");

if (!COMMUNITY_KEY || !DOMAIN_KEY) {
  console.error(
    "Set ITB_COMMUNITY_KEY and ITB_DOMAIN_KEY (Test Bed UI: domain and community detail forms).",
  );
  process.exit(1);
}

interface Call {
  method: string;
  path: string;
  key: string;
  body?: unknown;
  form?: FormData;
  /** A 4xx that means "already there" rather than "broken". */
  tolerate?: boolean;
}

async function call<T = unknown>({ method, path: p, key, body, form, tolerate }: Call): Promise<T | undefined> {
  const res = await fetch(BASE + p, {
    method,
    // Hyphens, not underscores. See the header note at the top of this file.
    headers: { "ITB-API-KEY": key, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  if (!res.ok) {
    const text = (await res.text()).slice(0, 200);
    if (tolerate) return undefined;
    throw new Error(`${method} ${p} -> ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text.trim().startsWith("{") || text.trim().startsWith("[") ? (JSON.parse(text) as T) : undefined;
}

/**
 * The validation types and their labels, read back from the configuration the
 * validator actually serves rather than recomputed from the module registry.
 */
async function validationTypes(): Promise<{ id: string; label: string }[]> {
  const config = await fs.readFile(
    path.join(ROOT, SHACL_RESOURCE_ROOT, VALIDATOR_DOMAIN, "config.properties"),
    "utf8",
  );
  const order = config.match(/^validator\.type = (.*)$/m)?.[1].split(",") ?? [];
  const labels = new Map(
    [...config.matchAll(/^validator\.typeLabel\.(\S+) = (.*)$/gm)].map((m) => [m[1]!, m[2]!]),
  );
  return order
    .map((id) => id.trim())
    // The generated labels carry em dashes, which the Test Bed's tables break badly.
    .map((id) => ({ id, label: (labels.get(id) ?? id).replace(/ — /g, ", ") }));
}

/**
 * The validator address is baked into every `verify` step when the suite is
 * generated, so an archive built for the compose stack silently points a hosted
 * Test Bed at `http://shacl-validator:8080`, which it cannot resolve. The run
 * then fails with the bare hostname as its entire error message. Cheaper to
 * catch here than to debug there.
 */
function assertSuiteTargets(apiBase: string): void {
  const testCase = execFileSync("unzip", ["-p", SUITE_ZIP, "testCases/tc-upload-dpp.core.xml"], {
    encoding: "utf8",
  });
  const handler = testCase.match(/handler="([^"]+)"/)?.[1] ?? "";
  const want = new URL(apiBase).host;
  const got = handler ? new URL(handler).host : "(none)";
  if (got === want) return;
  throw new Error(
    `The test suite archive points at ${got}, the Test Bed is ${want}.\n` +
      `Rebuild it for this target, then package it:\n` +
      `  VALIDATOR_ADDRESS=https://${want} pnpm run build:gitb-testsuite -- --write\n` +
      `  gitb/dev.sh zip\n` +
      `Afterwards regenerate with the default address, or the drift gate fails.`,
  );
}

async function main() {
  const types = await validationTypes();
  console.log(`Test Bed: ${BASE}`);
  console.log(`${types.length} validation type(s)\n`);

  const existing = new Map(
    ((await call<{ shortName: string; apiKey: string }[]>({
      method: "GET",
      path: `/domain/${DOMAIN_KEY}/specifications`,
      key: COMMUNITY_KEY!,
    })) ?? []).map((s) => [s.shortName, s.apiKey]),
  );

  console.log("specifications");
  const specKey = new Map<string, string>();
  for (const t of types) {
    if (existing.has(t.id)) {
      specKey.set(t.id, existing.get(t.id)!);
      console.log(`  = ${t.id}`);
      continue;
    }
    const created = await call<{ apiKey: string }>({
      method: "PUT",
      path: "/specification",
      key: COMMUNITY_KEY!,
      body: { shortName: t.id, fullName: t.label, domain: DOMAIN_KEY, apiKey: t.id },
    });
    specKey.set(t.id, created?.apiKey ?? t.id);
    console.log(`  + ${t.id}`);
  }

  console.log("\nactors");
  for (const t of types) {
    const actors = (await call<{ identifier: string }[]>({
      method: "GET",
      path: `/specification/${specKey.get(t.id)}/actors`,
      key: COMMUNITY_KEY!,
      tolerate: true,
    })) ?? [];
    if (actors.some((a) => a.identifier === ACTOR)) {
      console.log(`  = ${t.id}`);
      continue;
    }
    await call({
      method: "PUT",
      path: "/actor",
      key: COMMUNITY_KEY!,
      body: {
        identifier: ACTOR,
        name: "Digital Product Passport data provider",
        description: "The economic operator or solution provider whose passport is under test.",
        default: true,
        specification: specKey.get(t.id),
        apiKey: `${t.id}--actor`,
      },
    });
    console.log(`  + ${t.id}`);
  }

  // One shared suite for the whole domain. Deployed per specification it would
  // be sixteen uploads of the same 32 test cases, each with its own history.
  console.log("\nshared test suite");
  assertSuiteTargets(BASE);
  const form = new FormData();
  form.append("testSuite", new Blob([await fs.readFile(SUITE_ZIP)]), "openepcis-dpp-testsuite.zip");
  const deployed = await call<{ completed: boolean; identifiers: { testSuite: string; testCases: string[] } }>({
    method: "POST",
    path: "/testsuite/deployShared",
    key: COMMUNITY_KEY!,
    form,
  });
  console.log(`  ${deployed?.identifiers.testSuite}: ${deployed?.identifiers.testCases.length} test case(s)`);

  await call({
    method: "POST",
    path: "/testsuite/linkShared",
    key: COMMUNITY_KEY!,
    body: {
      testSuite: deployed?.identifiers.testSuite,
      specifications: types.map((t) => ({ specification: specKey.get(t.id), update: true })),
    },
  });
  console.log(`  linked to ${types.length} specification(s)`);

  console.log("\norganisation, system, conformance statements");
  await call({
    method: "PUT",
    path: "/organisation",
    key: COMMUNITY_KEY!,
    body: { shortName: "OpenEPCIS", fullName: "OpenEPCIS reference implementation", apiKey: ORG_KEY },
    tolerate: true,
  });
  await call({
    method: "PUT",
    path: "/system",
    key: COMMUNITY_KEY!,
    body: {
      shortName: "Reference passports",
      fullName: "OpenEPCIS reference passports",
      organisation: ORG_KEY,
      apiKey: SUT_KEY,
    },
    tolerate: true,
  });
  let statements = 0;
  const refused: string[] = [];
  for (const t of types) {
    // The organisation key here, not the community one, and the community needs
    // "Manage test sessions via REST API" ticked. See the note at the top.
    try {
      await call({ method: "PUT", path: `/conformance/${SUT_KEY}/${t.id}--actor`, key: ORG_KEY });
      statements++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // A statement that is already there is not a problem; anything else is.
      if (/already/i.test(msg)) statements++;
      else refused.push(`${t.id}: ${msg}`);
    }
  }
  console.log(`  ${statements}/${types.length} statement(s)`);
  for (const r of refused) console.log(`  ! ${r}`);
  if (refused.some((r) => /not allowed to manage test sessions/.test(r))) {
    console.log(
      `\n  Tick "Manage test sessions via REST API" under Community details > User\n` +
        `  permissions in the Test Bed UI, then re-run. No API call can set it.`,
    );
  }

  if (!RUN) {
    console.log(`\n✓ provisioned. Add --run to execute the self-tests.`);
    return;
  }

  console.log("\nself-tests");
  let green = 0;
  for (const t of types) {
    const started = await call<{ createdSessions: { session: string }[] }>({
      method: "POST",
      path: "/tests/start",
      key: ORG_KEY,
      body: {
        system: SUT_KEY,
        actor: `${t.id}--actor`,
        testCase: [`tc-selftest-${t.id}`],
        waitForCompletion: true,
        maximumWaitTime: 600_000,
      },
    });
    const sessions = (started?.createdSessions ?? []).map((s) => s.session);
    const status = await call<{ sessions: { result: string }[] }>({
      method: "POST",
      path: "/tests/status",
      key: ORG_KEY,
      body: { session: sessions, withLogs: false },
    });
    const result = status?.sessions?.[0]?.result ?? "NO SESSION";
    if (result === "SUCCESS") green++;
    console.log(`  ${t.id.padEnd(24)} ${result}`);
  }
  console.log(`\n${green}/${types.length} self-test(s) SUCCESS`);
  if (green !== types.length) process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
