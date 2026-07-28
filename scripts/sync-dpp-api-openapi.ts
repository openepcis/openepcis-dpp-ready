/**
 * Sync the EN 18222 OpenAPI contract into the openepcis-dpp-api service.
 *
 * Source of truth (this repo):
 *   extensions/common/interop/api/en18222-dpp-api.openapi.yaml
 * Mirror (the Quarkus service that serves it at /q/openapi):
 *   modules/openepcis-dpp-api/openepcis-dpp-api-application/src/main/resources/META-INF/openapi.yaml
 *
 * Usage:
 *   tsx scripts/sync-dpp-api-openapi.ts            # check only: report drift, exit 1 if any
 *   tsx scripts/sync-dpp-api-openapi.ts --write    # copy source of truth over the mirror
 *
 * The mirror lives in a sibling checkout. Override its location with
 * OPENEPCIS_BUILD_PATH (repo root) or DPP_API_OPENAPI_PATH (the file itself).
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE = resolve(
  repoRoot,
  "extensions/common/interop/api/en18222-dpp-api.openapi.yaml",
);

const MIRROR_RELATIVE =
  "modules/openepcis-dpp-api/openepcis-dpp-api-application/src/main/resources/META-INF/openapi.yaml";

const mirror = process.env.DPP_API_OPENAPI_PATH
  ? resolve(process.env.DPP_API_OPENAPI_PATH)
  : resolve(
      process.env.OPENEPCIS_BUILD_PATH ?? resolve(repoRoot, "../openepcis-build"),
      MIRROR_RELATIVE,
    );

const write = process.argv.includes("--write");

if (!existsSync(SOURCE)) {
  console.error(`✗ source of truth missing: ${SOURCE}`);
  process.exit(1);
}

const source = readFileSync(SOURCE, "utf8");

if (!existsSync(mirror)) {
  console.error(`✗ mirror not found: ${mirror}`);
  console.error(
    "  Point at the openepcis-build checkout with OPENEPCIS_BUILD_PATH=… " +
      "(or the file directly with DPP_API_OPENAPI_PATH=…).",
  );
  process.exit(1);
}

const mirrored = readFileSync(mirror, "utf8");

if (mirrored === source) {
  console.log(`✓ openepcis-dpp-api openapi.yaml matches the source of truth`);
  console.log(`  ${mirror}`);
  process.exit(0);
}

if (write) {
  writeFileSync(mirror, source);
  console.log(`✓ wrote source of truth to the openepcis-dpp-api mirror`);
  console.log(`  ${mirror}`);
  console.log(`  Commit it in openepcis-dpp-api (the service serves it at /q/openapi).`);
  process.exit(0);
}

// Report drift as a first-difference summary; the caller can diff for detail.
const sourceLines = source.split("\n");
const mirrorLines = mirrored.split("\n");
let firstDiff = 0;
while (
  firstDiff < sourceLines.length &&
  firstDiff < mirrorLines.length &&
  sourceLines[firstDiff] === mirrorLines[firstDiff]
) {
  firstDiff++;
}

console.error("✗ openepcis-dpp-api openapi.yaml has drifted from the source of truth");
console.error(`  source: ${SOURCE} (${sourceLines.length} lines)`);
console.error(`  mirror: ${mirror} (${mirrorLines.length} lines)`);
console.error(`  first difference at line ${firstDiff + 1}:`);
console.error(`    source: ${sourceLines[firstDiff] ?? "<eof>"}`);
console.error(`    mirror: ${mirrorLines[firstDiff] ?? "<eof>"}`);
console.error("");
console.error("  Reconcile in dpp-ready, then: pnpm run sync:dpp-api-openapi");
console.error(`  Full diff: diff -u "${SOURCE}" "${mirror}"`);
process.exit(1);
