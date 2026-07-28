/**
 * Sync the EN 18223 derivation resources into the openepcis-dpp-api service.
 *
 * The Quarkus service bundles copies of this repo's JSON-LD contexts, the
 * property→range index and the write-path JSON Schemas, because `En18223Deriver`
 * is a port of the TypeScript converter and is pinned to its output by golden
 * tests. Those copies are MIRRORS: this repo is the source of truth, exactly as it
 * is for the EN 18222 OpenAPI contract (see sync-dpp-api-openapi.ts). When they
 * drift, the Java service resolves different contexts than the TS pipeline and the
 * two silently disagree.
 *
 * Mirrored, per group:
 *   contexts/*.jsonld  ← extensions/**\/context/*.jsonld, plus gs1Voc.jsonld from
 *                        vendor/gs1/ and the vendored EPCIS base context
 *   range-index.json   ← generated from the module TTLs (same code path as the
 *                        browser demo bundle, so the two stay byte-identical)
 *   validation/*.json  ← extensions/**\/validation/*.json
 *
 * Which files the service bundles is the SERVICE's decision, expressed as the
 * URL_TO_FILE map in ClasspathContextLoader. This script refreshes the files already
 * present in the mirror, treats a context the loader NAMES but the mirror lacks as an
 * error (the loader rejects unknown URLs rather than fetching them, so derivation for
 * that module fails at runtime), and reports the reverse case, a context this repo
 * publishes that the loader does not name, as an informational note.
 *
 * That asymmetry is deliberate. iron-steel shipped with neither: the loader named none
 * of its three contexts and the mirror held only the standard one, so the service could
 * not derive an iron-steel passport at all while every check still passed.
 *
 * Usage:
 *   tsx scripts/sync-dpp-api-en18223.ts            # check only: report drift, exit 1 if any
 *   tsx scripts/sync-dpp-api-en18223.ts --write    # copy the source of truth over the mirror
 *
 * The mirror lives in a sibling checkout. Override with OPENEPCIS_BUILD_PATH (repo
 * root) or DPP_API_EN18223_PATH (the en18223 resource directory itself).
 */

import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, resolve, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRangeIndex } from "./en18223/node-io.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const MIRROR_RELATIVE =
  "modules/openepcis-dpp-api/openepcis-dpp-api-application/src/main/resources/en18223";

const mirrorDir = process.env.DPP_API_EN18223_PATH
  ? resolve(process.env.DPP_API_EN18223_PATH)
  : resolve(
      process.env.OPENEPCIS_BUILD_PATH ?? resolve(repoRoot, "../openepcis-build"),
      MIRROR_RELATIVE,
    );

const write = process.argv.includes("--write");

if (!existsSync(mirrorDir)) {
  console.error(`✗ mirror not found: ${mirrorDir}`);
  console.error(
    "  Point at the openepcis-build checkout with OPENEPCIS_BUILD_PATH=… " +
      "(or the resource directory with DPP_API_EN18223_PATH=…).",
  );
  process.exit(1);
}

/** Every file under a directory tree matching a predicate. */
function walk(dir: string, keep: (f: string) => boolean, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) walk(full, keep, acc);
    else if (keep(full)) acc.push(full);
  }
  return acc;
}

/**
 * The context file names ClasspathContextLoader promises to resolve offline, read from its
 * URL_TO_FILE map. Parsing Java from a build script is crude, but the alternative is a
 * second hand-maintained list that drifts from the one that actually decides at runtime.
 * An unreadable or unrecognisable loader yields an empty set, which degrades this check to
 * the mirror-refresh it was before rather than failing the build on a refactor.
 */
function loaderNamedContexts(): Set<string> {
  const loader = resolve(
    mirrorDir,
    "../../java/io/openepcis/dpp/derivation/ClasspathContextLoader.java",
  );
  if (!existsSync(loader)) return new Set();
  const src = readFileSync(loader, "utf8");
  const map = /URL_TO_FILE\s*=\s*Map\.ofEntries\(([\s\S]*?)\);/.exec(src)?.[1];
  if (!map) return new Set();
  return new Set(
    [...map.matchAll(/Map\.entry\(\s*"[^"]+"\s*,\s*"([^"]+\.jsonld)"\s*\)/g)].map((m) => m[1]),
  );
}

/**
 * Module slugs, from the directory names under extensions/{region}/. Used to tell an
 * EN 18223 context layer (`<slug>-context`, `-shortcut-context`, `-operational-context`,
 * which the service must resolve) apart from an optional bridge or variant context.
 */
const moduleSlugs: string[] = (() => {
  const root = join(repoRoot, "extensions");
  const slugs: string[] = [];
  for (const region of readdirSync(root, { withFileTypes: true })) {
    if (!region.isDirectory()) continue;
    for (const mod of readdirSync(join(root, region.name), { withFileTypes: true })) {
      if (mod.isDirectory() && existsSync(join(root, region.name, mod.name, "context"))) {
        slugs.push(mod.name);
      }
    }
  }
  return slugs;
})();

/** basename → source path, for the files this repo owns. */
function sourceIndex(): { contexts: Map<string, string>; schemas: Map<string, string> } {
  const contexts = new Map<string, string>();
  const schemas = new Map<string, string>();
  for (const f of walk(join(repoRoot, "extensions"), (f) => f.endsWith(".jsonld") && f.includes("/context/"))) {
    contexts.set(basename(f), f);
  }
  for (const f of walk(join(repoRoot, "extensions"), (f) => f.endsWith(".json") && f.includes("/validation/"))) {
    schemas.set(basename(f), f);
  }
  // Upstream snapshots this repo vendors; the service bundles them under contexts/.
  contexts.set("gs1Voc.jsonld", join(repoRoot, "vendor/gs1/gs1Voc.jsonld"));
  contexts.set("epcis-context.jsonld", join(repoRoot, "vendor/gs1/epcis-context.jsonld"));
  return { contexts, schemas };
}

async function generatedRangeIndex(): Promise<string> {
  const index = await buildRangeIndex();
  const obj: Record<string, string> = {};
  for (const [k, v] of [...index.entries()].sort((a, b) => a[0].localeCompare(b[0]))) obj[k] = v;
  return JSON.stringify(obj, null, 2) + "\n";
}

interface Drift { file: string; reason: string }

async function main(): Promise<number> {
  const { contexts, schemas } = sourceIndex();
  const drift: Drift[] = [];
  const missingSource: string[] = [];
  let checked = 0;

  const mirrorFile = async (mirrorPath: string, source: string | undefined, label: string) => {
    const name = basename(mirrorPath);
    if (!source) { missingSource.push(`${label}/${name}`); return; }
    checked++;
    const want = readFileSync(source, "utf8");
    if (readFileSync(mirrorPath, "utf8") === want) return;
    drift.push({ file: `${label}/${name}`, reason: "content differs" });
    if (write) writeFileSync(mirrorPath, want);
  };

  for (const f of walk(join(mirrorDir, "contexts"), (f) => f.endsWith(".jsonld"))) {
    await mirrorFile(f, contexts.get(basename(f)), "contexts");
  }
  for (const f of walk(join(mirrorDir, "validation"), (f) => f.endsWith(".json"))) {
    await mirrorFile(f, schemas.get(basename(f)), "validation");
  }

  // range-index.json is generated, not copied
  const rangePath = join(mirrorDir, "range-index.json");
  if (existsSync(rangePath)) {
    checked++;
    const want = await generatedRangeIndex();
    if (readFileSync(rangePath, "utf8") !== want) {
      drift.push({ file: "range-index.json", reason: "stale (regenerated from the module TTLs)" });
      if (write) writeFileSync(rangePath, want);
    }
  }

  // The loader names the contexts the service must resolve offline; the mirror holds the
  // files. A name with no file is a runtime failure for that module's derivation, so it is
  // an error here and --write copies it in. A file with no name is optional (bridges, the
  // scientific battery variant), so it stays a note.
  const inMirror = new Set(
    walk(join(mirrorDir, "contexts"), (f) => f.endsWith(".jsonld")).map((f) => basename(f)),
  );
  const named = loaderNamedContexts();
  const notNamed = [...contexts.keys()].filter((n) => !inMirror.has(n) && !named.has(n)).sort();
  // The loader's own test cannot catch a module the map omits ENTIRELY: with no standard
  // context named, there is no anchor from which to demand the siblings. This repo knows the
  // module list, so the omission is caught here. A module that publishes the three EN 18223
  // context layers must have all three named; bridges and variants stay optional.
  // Deliberately NOT filtered by mirror presence: a file sitting in the mirror that the map
  // does not name is just as unreachable as one that is absent, and that combination is what
  // iron-steel shipped with.
  const unwired = [...contexts.keys()]
    .filter((n) => !named.has(n))
    .filter((n) =>
      moduleSlugs.some((slug) => n === `${slug}-context.jsonld`
        || n === `${slug}-shortcut-context.jsonld`
        || n === `${slug}-operational-context.jsonld`),
    )
    .sort();
  const unwiredErrors = named.size ? unwired : [];
  for (const name of [...named].sort()) {
    if (inMirror.has(name)) continue;
    const src = contexts.get(name);
    if (!src) {
      missingSource.push(`contexts/${name} (named by ClasspathContextLoader, absent from this repo)`);
      continue;
    }
    checked++;
    drift.push({ file: `contexts/${name}`, reason: "named by ClasspathContextLoader but absent from the mirror" });
    if (write) writeFileSync(join(mirrorDir, "contexts", name), readFileSync(src));
  }

  if (missingSource.length) {
    console.error(`✗ ${missingSource.length} mirrored file(s) have no source of truth in this repo:`);
    missingSource.forEach((f) => console.error(`  - ${f}`));
    return 1;
  }

  if (unwiredErrors.length) {
    console.error(
      `✗ ${unwiredErrors.length} EN 18223 context layer(s) are published here but not named by ClasspathContextLoader,`,
    );
    console.error(`  so the service cannot resolve them and derivation for that module fails:`);
    unwiredErrors.forEach((n) => console.error(`  - ${n}`));
    console.error(`  Add a URL_TO_FILE entry in ClasspathContextLoader.java, then re-run with --write.`);
    return 1;
  }

  if (!drift.length) {
    console.log(`✓ openepcis-dpp-api EN 18223 resources match the source of truth (${checked} file(s))`);
    console.log(`  ${mirrorDir}`);
    if (notNamed.length) {
      console.log(`  note: ${notNamed.length} context(s) published here are not bundled by the service:`);
      notNamed.forEach((n) => console.log(`    ${n}`));
    }
    return 0;
  }

  if (write) {
    console.log(`✓ wrote ${drift.length} file(s) to the openepcis-dpp-api mirror`);
    drift.forEach((d) => console.log(`  - ${d.file} (${d.reason})`));
    console.log(`  ${mirrorDir}`);
    console.log(`  Re-run the service's EN 18223 tests and commit in openepcis-dpp-api.`);
    return 0;
  }

  console.error(`✗ ${drift.length} of ${checked} EN 18223 resource(s) drifted from this repo:`);
  drift.forEach((d) => console.error(`  - ${d.file} (${d.reason})`));
  console.error(`  Mirror: ${mirrorDir}`);
  console.error(`  Fix with: pnpm run sync:dpp-api-en18223 -- --write`);
  return 1;
}

process.exit(await main());
