#!/usr/bin/env tsx
/**
 * Mirror the generated RDF validator bundle into the standalone repository the
 * European Commission hosts the validator from.
 *
 * The shared Interoperability Test Bed does not build anything: it watches one
 * public repository per hosted validator and re-reads it on push (the webhook
 * the ITB team configures on that repository). That repository must therefore
 * carry the bundle in the ISAITB layout — `resources/config.properties` plus
 * `resources/shapes/**`, the domain directory flattened away, exactly as in
 * ISAITB/validator-resources-rdf-sample — and nothing else it would have to
 * interpret.
 *
 * Which is why publishing is a mirror, not a second source. Everything under
 * `resources/` here is byte-identical to gitb/validator-resources/shacl/openepcis,
 * which `pnpm run build:gitb` derives from the ontologies and shapes. A change
 * made in the mirror is overwritten by the next sync; the drift gate in
 * `pnpm run build` is what keeps the local copy honest in the first place.
 *
 * Usage:
 *   pnpm run publish:validator-resources                  # sync the working tree, report
 *   pnpm run publish:validator-resources -- --commit      # ...and commit
 *   pnpm run publish:validator-resources -- --commit --push
 *   pnpm run publish:validator-resources -- --target /some/checkout
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT } from "./lib/modules.ts";
import { VALIDATOR_DOMAIN, SHACL_RESOURCE_ROOT } from "./lib/gitb.ts";

const args = process.argv.slice(2);
const COMMIT = args.includes("--commit");
const PUSH = args.includes("--push");
const targetFlag = args.indexOf("--target");

const REPO_NAME = `validator-resources-${VALIDATOR_DOMAIN}`;
const REPO_URL = `https://github.com/openepcis/${REPO_NAME}`;
const ITB = "https://www.itb.ec.europa.eu";

const TARGET =
  targetFlag >= 0
    ? path.resolve(args[targetFlag + 1]!)
    : path.join(path.dirname(ROOT), REPO_NAME);

const BUNDLE = path.join(ROOT, SHACL_RESOURCE_ROOT, VALIDATOR_DOMAIN);

function git(cwd: string, ...argv: string[]): string {
  return execFileSync("git", argv, { cwd, encoding: "utf8" }).trim();
}

async function projectVersion(): Promise<string> {
  const pkg = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
  return pkg.version as string;
}

/** Every file under `dir`, as paths relative to it. */
async function walk(dir: string, prefix = ""): Promise<string[]> {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const name of entries) {
    if (name === ".git") continue;
    const full = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    out.push(...((await fs.stat(full)).isDirectory() ? await walk(full, rel) : [rel]));
  }
  return out;
}

/**
 * The validation types, read back from the generated configuration rather than
 * recomputed: the README must describe the bundle that is actually shipping.
 */
async function validationTypes(): Promise<{ id: string; label: string }[]> {
  const config = await fs.readFile(path.join(BUNDLE, "config.properties"), "utf8");
  const order = config.match(/^validator\.type = (.*)$/m)?.[1].split(",") ?? [];
  const labels = new Map<string, string>();
  for (const line of config.split("\n")) {
    const m = line.match(/^validator\.typeLabel\.(\S+) = (.*)$/);
    if (m) labels.set(m[1]!, m[2]!);
  }
  return order.map((id) => id.trim()).map((id) => ({ id, label: labels.get(id) ?? id }));
}

async function readme(version: string, sha: string): Promise<string> {
  const types = await validationTypes();
  return `# OpenEPCIS DPP-Ready — RDF validator resources

Configuration and SHACL shapes behind the **OpenEPCIS Digital Product Passport
validator**, hosted by the European Commission on the shared
[Interoperability Test Bed](https://www.itb.ec.europa.eu/) as the
\`${VALIDATOR_DOMAIN}\` domain:

| | |
|---|---|
| Web UI | <${ITB}/shacl/${VALIDATOR_DOMAIN}/upload> |
| REST API | <${ITB}/shacl/${VALIDATOR_DOMAIN}/api> (Swagger: <${ITB}/shacl/swagger-ui/index.html>, domain \`${VALIDATOR_DOMAIN}\`) |
| SOAP API (GITB validation service) | <${ITB}/shacl/soap/${VALIDATOR_DOMAIN}/validation?wsdl> |

A passport is submitted as JSON-LD, Turtle, RDF/XML or N-Triples and checked
against the shapes for one validation type. \`sh:Violation\` fails, \`sh:Warning\`
and \`sh:Info\` are reported and tolerated — the shapes use the milder severities
deliberately, for conditional and optional data points.

## Validation types

The type id is the published contract: it is what a validation request carries
and what a Test Bed conformance statement is recorded against. Renaming one
invalidates every statement already made, so ids are stable.

| Type | Covers |
|---|---|
${types.map((t) => `| \`${t.id}\` | ${t.label} |`).join("\n")}

Every regulation type bundles the cross-cutting DPP core shapes as well: \`oec:\`
obligations apply to a battery passport too. The \`eu.battery.{model,batch,item}\`
and \`eu.battery.{ev,lmt,industrial}\` variants exist because those obligations
genuinely differ by EN 18223 granularity and by battery category.

## Layout

\`\`\`
resources/
├── config.properties          validation types, labels, shapes per type
└── shapes/<type>/
    ├── shapes.ttl             the constraints
    └── background.ttl         class hierarchy and code lists the shapes need
\`\`\`

\`background.ttl\` is not decoration. \`sh:class\`, and the subclass resolution
behind \`sh:targetClass\`, are evaluated over the data graph; the validator merges
the shapes graph into the input before validating, which is what carries the
ontology across. Without it the shapes are vacuous in one direction and wrong in
the other.

Two more properties of the bundle follow from what a hosted validator cannot do
at request time, and are why it is generated rather than copied:

- **No reasoner is assumed.** Obligations stated on a superproperty are rewritten
  into plain SHACL Core alternation (\`sh:alternativePath\`), because nothing in
  the delivery chain applies the \`rdfs:subPropertyOf\` entailment the ontologies
  declare.
- **\`sh:deactivated\` cannot be flipped per request**, so each granularity and
  category variant ships one pre-activated copy of the shapes.

Everything is bundled locally (\`validator.loadImports = false\`), so a verdict
depends on the shapes alone — only the submitted document's own \`@context\` is
fetched.

## Generated — do not edit here

This repository is a **mirror**. The source of truth is
[openepcis/openepcis-dpp-ready](https://github.com/openepcis/openepcis-dpp-ready),
where the shapes are derived from the module ontologies and verified against the
same \`isaitb/shacl-validator\` image the Test Bed runs, over every reference
passport the project publishes and a deliberately broken variant of each.

Synced from openepcis-dpp-ready ${version} (\`${sha}\`) with
\`pnpm run publish:validator-resources\`. An edit made directly here is
overwritten by the next sync — please raise issues and pull requests against
[openepcis-dpp-ready](https://github.com/openepcis/openepcis-dpp-ready) instead.

## Licence

[Apache License 2.0](./LICENSE), as the source project.
`;
}

async function main() {
  // A mirror of a stale bundle is worse than no mirror: publish only what the
  // ontologies currently say.
  try {
    execFileSync("pnpm", ["run", "--silent", "check:gitb"], { cwd: ROOT, stdio: "pipe" });
  } catch {
    console.error(
      `✗ the committed validator bundle has drifted from the ontologies.\n` +
        `  Run: pnpm run build:gitb   (then re-run this)`,
    );
    process.exit(1);
  }

  const version = await projectVersion();
  const sha = git(ROOT, "rev-parse", "--short", "HEAD");

  await fs.mkdir(TARGET, { recursive: true });
  const isRepo = await fs
    .stat(path.join(TARGET, ".git"))
    .then(() => true)
    .catch(() => false);
  if (!isRepo) {
    git(TARGET, "init", "-b", "main");
    console.log(`→ initialised a git repository in ${TARGET}`);
  }

  const files = new Map<string, string>();
  for (const rel of await walk(BUNDLE)) {
    files.set(`resources/${rel}`, await fs.readFile(path.join(BUNDLE, rel), "utf8"));
  }
  files.set("README.md", await readme(version, sha));
  files.set("LICENSE", await fs.readFile(path.join(ROOT, "LICENSE"), "utf8"));

  const changed: string[] = [];
  for (const [rel, content] of files) {
    const abs = path.join(TARGET, rel);
    let existing: string | undefined;
    try {
      existing = await fs.readFile(abs, "utf8");
    } catch {
      /* new file */
    }
    if (existing === content) continue;
    changed.push(existing === undefined ? `${rel} (new)` : rel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content);
  }
  // A shapes file left behind by a removed validation type would keep being served.
  for (const rel of await walk(TARGET)) {
    if (files.has(rel)) continue;
    changed.push(`${rel} (stale, removed)`);
    await fs.rm(path.join(TARGET, rel));
  }

  console.log(`Mirror: ${TARGET}`);
  console.log(`  ${files.size} file(s) published, ${changed.length} changed`);
  for (const c of changed.slice(0, 20)) console.log(`    ${c}`);
  if (changed.length > 20) console.log(`    … and ${changed.length - 20} more`);

  if (!COMMIT) {
    console.log(
      `\nNothing committed. Review the tree, then re-run with --commit [--push].`,
    );
    return;
  }
  if (!git(TARGET, "status", "--porcelain")) {
    console.log(`\n✓ already in step — nothing to commit.`);
    return;
  }
  git(TARGET, "add", "-A");
  git(
    TARGET,
    "commit",
    "-m",
    `Sync validator resources from openepcis-dpp-ready ${version} (${sha})`,
  );
  console.log(`\n✓ committed.`);
  if (PUSH) {
    git(TARGET, "push", "origin", "HEAD");
    console.log(`✓ pushed — ${REPO_URL}`);
    console.log(`  The Test Bed picks the change up within a couple of minutes.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
