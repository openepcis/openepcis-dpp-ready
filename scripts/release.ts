#!/usr/bin/env tsx
/**
 * Stamp a release version across every place this repo records one, and check that they agree.
 *
 * The version lives in more places than is comfortable, which is why it drifted: at 0.9.7 the
 * package, the VERSION files, the ontologies and CLAUDE.md all said 0.9.7 while README.md still
 * said 0.9.6, listed fsma204 at 0.1.0, and omitted cpr, ppwr and iron-steel from both of its
 * tables altogether. `--check` runs as part of the build so that cannot recur.
 *
 * Stamped:
 *   package.json                        "version"
 *   extensions/{region}/{slug}/VERSION  the module version
 *   .../ontology/*.ttl                  owl:versionInfo + owl:versionIRI
 *   .../CHANGELOG.md                    the `## [Unreleased]` heading becomes `## [x.y.z] - DATE`
 *   README.md                           status badge, the TL;DR sentence, both module tables
 *   CLAUDE.md                           the module table
 *
 * Upstream mirrors under extensions/upstream/ keep their upstream version and are skipped.
 * Generated artifacts (context files, json/) carry the version from the TTL, so run the build
 * afterwards; the script reminds you.
 *
 * Usage:
 *   tsx scripts/release.ts --check                 # verify every stamp agrees with package.json
 *   tsx scripts/release.ts --version 0.9.8         # dry run: report what would change
 *   tsx scripts/release.ts --version 0.9.8 --write
 *   tsx scripts/release.ts --version 0.9.8 --write --date 2026-07-29
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const arg = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const check = argv.includes("--check");
const write = argv.includes("--write");
const target = arg("version");
const date = arg("date") ?? new Date().toISOString().slice(0, 10);

if (!check && !target) {
  console.error("usage: tsx scripts/release.ts (--check | --version x.y.z [--write] [--date YYYY-MM-DD])");
  process.exit(64);
}
if (target && !/^\d+\.\d+\.\d+$/.test(target)) {
  console.error(`✗ not a semantic version: ${target}`);
  process.exit(64);
}

interface Module { slug: string; region: string; dir: string; path: string; upstream: boolean }

/** Every module directory, with `upstream` flagged so mirrors keep their own version. */
function modules(): Module[] {
  const out: Module[] = [];
  const root = join(repoRoot, "extensions");
  for (const region of readdirSync(root, { withFileTypes: true })) {
    if (!region.isDirectory()) continue;
    for (const mod of readdirSync(join(root, region.name), { withFileTypes: true })) {
      if (!mod.isDirectory()) continue;
      const dir = join(root, region.name, mod.name);
      if (!existsSync(join(dir, "VERSION"))) continue;
      out.push({
        slug: mod.name,
        region: region.name,
        dir,
        path: `${region.name}/${mod.name}`,
        upstream: region.name === "upstream",
      });
    }
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

const MODULES = modules();
const OWNED = MODULES.filter((m) => !m.upstream);

const problems: string[] = [];
const changes: string[] = [];

/**
 * Replace in a file, recording it as a change (or a --check problem when it disagrees).
 *
 * `optional` files are stamped when present and ignored when absent. CLAUDE.md is optional
 * because it is excluded by a global gitignore, so it does not exist in a fresh clone and this
 * check runs in the build.
 */
function stamp(file: string, label: string, edit: (src: string) => string, optional = false) {
  const abs = join(repoRoot, file);
  if (!existsSync(abs)) {
    if (!optional) problems.push(`${file} is missing`);
    return;
  }
  const src = readFileSync(abs, "utf8");
  const next = edit(src);
  if (next === src) return;
  if (check) { problems.push(label); return; }
  changes.push(label);
  if (write) writeFileSync(abs, next);
}

const version = target ?? JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")).version;

// ── package.json ────────────────────────────────────────────────────────────────
stamp("package.json", `package.json → ${version}`, (s) =>
  s.replace(/("version"\s*:\s*")[^"]+(")/, `$1${version}$2`));

// ── per-module VERSION and ontology stamps ──────────────────────────────────────
for (const m of OWNED) {
  stamp(`extensions/${m.path}/VERSION`, `${m.path}/VERSION → ${version}`, () => `${version}\n`);

  const ontDir = join(m.dir, "ontology");
  if (!existsSync(ontDir)) continue;
  for (const f of readdirSync(ontDir)) {
    if (!f.endsWith(".ttl") || f.includes("access-levels")) continue;
    stamp(`extensions/${m.path}/ontology/${f}`, `${m.path}/ontology/${f} → ${version}`, (s) =>
      s
        .replace(/(owl:versionInfo\s+")[^"]+(")/g, `$1${version}$2`)
        // versionIRI ends in the version: .../extensions/eu/battery/0.9.7
        .replace(
          new RegExp(`(owl:versionIRI\\s+<https://ref\\.openepcis\\.io/extensions/${m.path}/)[\\d.]+(>)`, "g"),
          `$1${version}$2`,
        ));
  }
}

// ── CHANGELOGs: open the Unreleased section into a dated release heading ────────
// Only where the section has content; an empty Unreleased means the module did not change.
// The upstream mirror keeps a dated sync log rather than versions, so it is read for presence
// only. The root CHANGELOG.md is the cross-cutting summary and is stamped like a module.
const changelogTargets = [
  "CHANGELOG.md",
  ...MODULES.map((m) => ({ rel: `extensions/${m.path}/CHANGELOG.md`, upstream: m.upstream })),
];
for (const t of changelogTargets) {
  const rel = typeof t === "string" ? t : t.rel;
  const upstream = typeof t === "string" ? false : t.upstream;
  const abs = join(repoRoot, rel);
  if (!existsSync(abs)) { problems.push(`${rel} is missing`); continue; }
  if (upstream) continue;
  const src = readFileSync(abs, "utf8");

  // --check verifies version STAMPS. It deliberately does not require a `## [version]` heading
  // in every changelog: a module may legitimately have no entry in a release, and a newly added
  // changelog never carried the previous versions.
  if (check) continue;

  const m1 = /^## \[Unreleased\][^\n]*\n/m.exec(src);
  if (!m1) { problems.push(`${rel} has no ## [Unreleased] heading`); continue; }
  const after = src.slice(m1.index + m1[0].length);
  const body = after.split(/^## /m)[0];
  if (!body.trim()) continue; // nothing to release for this module

  // Re-stamping a version that is already released would leave two headings for it and split
  // the entries between them. Bump to a new version instead.
  if (new RegExp(`^## \\[?${version.replace(/\./g, "\\.")}\\]?[\\s(]`, "m").test(src)) {
    problems.push(`${rel} already has a ${version} heading and its Unreleased section has content; bump to a new version`);
    continue;
  }

  changes.push(`${rel}: Unreleased → [${version}] - ${date}`);
  if (write) {
    writeFileSync(
      abs,
      src.slice(0, m1.index) + `## [Unreleased]\n\n## [${version}] - ${date}\n` + after,
    );
  }
}

// ── README and CLAUDE.md ────────────────────────────────────────────────────────
// Version cells only. The regulation and "last updated" columns are prose, so a missing ROW is
// reported for a human to write rather than generated badly.
const readme = join(repoRoot, "README.md");
const readmeSrc = existsSync(readme) ? readFileSync(readme, "utf8") : "";
for (const m of OWNED) {
  const link = `./extensions/${m.path}/`;
  if (!readmeSrc.includes(link)) problems.push(`README.md has no module-table row for ${m.path}`);
  if (!new RegExp(`^\\|\\s*\`${m.path}\`\\s*\\|`, "m").test(readmeSrc)) {
    problems.push(`README.md has no versioning-table row for \`${m.path}\``);
  }
}

stamp("README.md", `README.md version cells → ${version}`, (s) => {
  let out = s
    .replace(/status-preview%20[\d.]+-orange/g, `status-preview%20${version}-orange`)
    .replace(/Status: Preview [\d.]+/g, `Status: Preview ${version}`)
    .replace(/Preview at v[\d.]+/g, `Preview at v${version}`);
  // Module table: the version cell sits between the Status and the Last-updated cell.
  for (const m of OWNED) {
    out = out.replace(
      new RegExp(`(\\[${m.path.replace("/", "\\/")}\\]\\(\\.\\/extensions\\/${m.path}\\/\\)[^\\n]*?\\|\\s*)[\\d.]+(\\s*\\|)`),
      `$1${version}$2`,
    );
    out = out.replace(
      new RegExp("(^\\|\\s*`" + m.path + "`\\s*\\|\\s*)[\\d.]+(\\s*\\|)", "m"),
      `$1${version}$2`,
    );
  }
  return out;
});

stamp("CLAUDE.md", `CLAUDE.md module table → v${version}`, (s) => {
  let out = s;
  for (const m of OWNED) {
    out = out.replace(
      new RegExp(`(\`extensions\\/${m.path}\\/\`[^\\n]*?\\|\\s*)v[\\d.]+(\\s*\\|)`),
      `$1v${version}$2`,
    );
  }
  return out;
}, true);

// ── report ──────────────────────────────────────────────────────────────────────
if (check) {
  console.log(`release:check: every version stamp against package.json (${version})`);
  if (problems.length) {
    console.error(`\n✗ ${problems.length} version stamp(s) disagree or are missing:`);
    problems.forEach((p) => console.error(`  - ${p}`));
    console.error(`\n  Fix with: pnpm run release -- --version ${version} --write`);
    process.exit(1);
  }
  console.log(`✓ ${OWNED.length} module(s) + package.json + README.md all read ${version}`);
  process.exit(0);
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) a version bump cannot fix on its own:`);
  problems.forEach((p) => console.error(`  - ${p}`));
}
console.log(`${write ? "wrote" : "DRY-RUN"}: ${changes.length} change(s) for ${version} (${date})`);
changes.forEach((c) => console.log(`  - ${c}`));
if (write) {
  console.log(`\nNow run: pnpm run build  (generated contexts and json/ carry the version from the TTL)`);
}
process.exit(problems.length ? 1 : 0);
