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
  // Writing to a mirror that is not there is an error; CHECKING one that is not
  // there is not. The check runs inside `pnpm run build`, and this repository
  // builds on its own in CI, where the sibling checkout does not exist. Failing
  // there would force the check back out of the build, which is how 14 of these
  // files drifted unnoticed in the first place. The skip is announced so a green
  // build is never mistaken for a verified mirror.
  if (!write) {
    console.log(`— dpp-api EN 18223 mirror not present, check skipped (${mirrorDir})`);
    console.log("  Run it against a checkout with OPENEPCIS_BUILD_PATH=… to verify the mirror.");
    process.exit(0);
  }
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
 * The service's own prefix table, read from OperationalDictionary.PREFIXES.
 *
 * This is not a mirrored resource, it is a hand-maintained Java copy of the TS PREFIXES
 * map in scripts/en18223/serialize.ts, and the two silently disagreeing is expensive.
 * The dictionary is keyed by the EXPANDED IRI, so a curated shortcut alias spelled with a
 * prefix the table does not know never expands and never matches: `term()` falls through
 * to `toCurie()`, which cannot shorten the IRI either, and the compressed form ships the
 * full IRI. Every other check stays green, because the payload still expands to the right
 * graph. That is exactly how dev and demo kept serving `cccev:Evidence` and
 * `cv:PublicOrganisation` as raw m8g IRIs after the alias fix landed here.
 *
 * Order matters as well as content: two prefixes may share one namespace (`cv:` /
 * `cccev:` both map to m8g), and both implementations resolve the tie by insertion order,
 * so a reordering changes which CURIE the fallback emits.
 *
 * Parsing Java from a build script is crude, and it is still better than a second
 * hand-maintained list. An unreadable or unrecognisable table yields an empty map, which
 * degrades this to the resource-only check it was before rather than failing on a refactor.
 */
function javaPrefixTable(): Array<[string, string]> {
  const dict = resolve(mirrorDir, "../../java/io/openepcis/dpp/derivation/OperationalDictionary.java");
  if (!existsSync(dict)) return [];
  const src = readFileSync(dict, "utf8");
  const block = /PREFIXES\s*=\s*new\s+LinkedHashMap<>\(\);([\s\S]*?)\n\s*\}/.exec(src)?.[1];
  if (!block) return [];
  return [...block.matchAll(/PREFIXES\.put\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/g)].map(
    (m) => [m[1], m[2]] as [string, string],
  );
}

/** The TS PREFIXES map, read from the source of truth the Java table copies. */
function tsPrefixTable(): Array<[string, string]> {
  const src = readFileSync(join(repoRoot, "scripts/en18223/serialize.ts"), "utf8");
  const block = /const PREFIXES: Record<string, string> = \{([\s\S]*?)\n\};/.exec(src)?.[1];
  if (!block) return [];
  return [...block.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*"([^"]+)"\s*,/gm)].map(
    (m) => [m[1], m[2]] as [string, string],
  );
}

/** Drift between the two prefix tables, as human-readable lines. */
function prefixTableDrift(): string[] {
  const java = javaPrefixTable();
  const ts = tsPrefixTable();
  if (!java.length || !ts.length) return [];
  const problems: string[] = [];
  const jm = new Map(java);
  const tm = new Map(ts);
  for (const [p, ns] of tm) {
    if (!jm.has(p)) problems.push(`OperationalDictionary.PREFIXES is missing "${p}" -> ${ns}`);
    else if (jm.get(p) !== ns) problems.push(`prefix "${p}": TS says ${ns}, Java says ${jm.get(p)}`);
  }
  for (const [p, ns] of jm) {
    if (!tm.has(p)) problems.push(`OperationalDictionary.PREFIXES has extra "${p}" -> ${ns} (not in the TS table)`);
  }
  // Insertion order decides the CURIE for a namespace with two prefixes, so compare it
  // over the prefixes both tables share.
  const shared = (t: Array<[string, string]>) => t.filter(([p]) => jm.has(p) && tm.has(p)).map(([p]) => p);
  const jo = shared(java).join(",");
  const to = shared(ts).join(",");
  if (jo !== to && !problems.length) {
    problems.push(`prefix insertion order differs (decides toCurie for a shared namespace):\n      TS   ${to}\n      Java ${jo}`);
  }
  return problems;
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

  // The prefix table is Java source, not a mirrored resource, so --write cannot fix it.
  const prefixDrift = prefixTableDrift();
  if (prefixDrift.length) {
    console.error(`✗ the service's prefix table has drifted from scripts/en18223/serialize.ts:`);
    prefixDrift.forEach((p) => console.error(`  - ${p}`));
    console.error(`  A prefix the table does not know makes a curated shortcut alias unresolvable, so the`);
    console.error(`  compressed form ships the full IRI instead of the bare term — and nothing else notices,`);
    console.error(`  because the payload still expands to the right graph. Fix PREFIXES in`);
    console.error(`  OperationalDictionary.java by hand (--write does not touch Java source).`);
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
