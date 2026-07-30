/**
 * Live-environment gate for the EN 18223 compressed passports.
 *
 * The offline gates prove the repo is consistent. They say nothing about what a
 * deployment actually serves, and the two drift apart silently: an environment keeps
 * serving whatever was last written to it, so a vocabulary fix in this repo does not
 * reach dev or demo until the catalogue is re-provisioned. That is how both
 * environments ended up serving `oec:dppStatus` and `eubat:batteryCategory` — CURIEs
 * for terms the ontology had already renamed — for every one of the two flagship
 * passports, at all three granularities, with every offline guard green.
 *
 * This gate reads each provisioned passport from the DPP API and asserts the three
 * properties that the compressed §5.2 form has to have in production:
 *
 *   1. no CURIE, as a key or as a `type` value. A prefix here means the stored body
 *      holds a term the operational alias chain cannot name, which in practice means
 *      the record predates a vocabulary change (`compactOperational` falls back to
 *      `toCurie`). Re-provision, or fix the alias if the term is current;
 *   2. no null value. The deriver emits `null` when it cannot read the stored shape
 *      of a property, so a null is data the consumer silently loses;
 *   3. no foreign or placeholder host in the STORED body. A record on dev must not
 *      name demo, and it must not carry the environment-neutral hosts the examples
 *      are authored with (`id.gs1.org`, `files.example.org`) — those mean the
 *      seeding rewrite in scripts/lib/seed-hosts.sh did not run. Checked against
 *      `representation=gs1`, not the served passport: the deriver legitimately mints
 *      a canonical `id.gs1.org/417/{gln}` party link for economicOperatorId, which
 *      would otherwise be flagged on every passport.
 *
 * The catalogue is read out of scripts/provision-demo.sh rather than repeated here:
 * that script decides what exists on an environment, and a second hand-maintained
 * list would drift from it. (Same tradeoff as sync-dpp-api-en18223.ts, which parses
 * the Java loader for the same reason.)
 *
 * Usage:
 *   tsx scripts/check-env-passports.ts --env=dev
 *   tsx scripts/check-env-passports.ts --env=demo --gtin=09521234002000
 *   tsx scripts/check-env-passports.ts --env=demo --json    # machine-readable report
 *
 * Needs network. NOT part of `pnpm run build`; run it after provisioning.
 * Exit codes: 0 clean, 1 findings, 2 could not reach the API, 64 bad arguments.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROVISIONER = path.join(ROOT, "scripts/provision-demo.sh");

const args = process.argv.slice(2);
const env = (args.find((a) => a.startsWith("--env="))?.slice("--env=".length) ?? "demo").trim();
const onlyGtin = args.find((a) => a.startsWith("--gtin="))?.slice("--gtin=".length);
const asJson = args.includes("--json");
const timeoutMs = Number(args.find((a) => a.startsWith("--timeout="))?.slice("--timeout=".length) ?? 20000);

if (!["dev", "demo"].includes(env)) {
  console.error(`✗ unknown --env: ${env} (expected dev or demo)`);
  process.exit(64);
}

const ID_HOST = `id.${env}.epcis.cloud`;
const DPP_BASE = `https://dpp.${env}.epcis.cloud`;
// Hosts that must not appear in the STORED body of a record on this environment: any
// other deployment, plus the neutral hosts the committed examples are authored with.
//
// Checked against the stored master data (representation=gs1), not the derived
// passport. The deriver legitimately MINTS a canonical GS1 party Digital Link
// (https://id.gs1.org/417/{gln}) for economicOperatorId / facilityId when the
// manufacturer node carries only a GLN — see partyDigitalLink in derive-core.ts. That
// is a globally canonical operator identifier, not environment drift, and checking the
// served form would flag it on every passport.
const FOREIGN_HOST = new RegExp(
  `\\b[a-z0-9-]+\\.(?:${["dev", "demo", "test", "staging"].filter((e) => e !== env).join("|")})\\.epcis\\.cloud\\b` +
    `|\\bid\\.gs1\\.org\\b|\\bfiles\\.example\\.org\\b`,
  "g",
);

/** One `a|b|c` row of a bash array literal in the provisioner. */
function bashArrayRows(src: string, name: string): string[][] {
  const start = src.indexOf(`${name}=(`);
  if (start < 0) throw new Error(`${name}=( not found in ${path.relative(ROOT, PROVISIONER)}`);
  const end = src.indexOf("\n)", start);
  if (end < 0) throw new Error(`unterminated ${name}=( in ${path.relative(ROOT, PROVISIONER)}`);
  return src
    .slice(start + `${name}=(`.length, end)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith('"') && l.includes("|"))
    .map((l) => l.replace(/^"|"$/g, "").split("|"));
}

interface Target {
  label: string;
  /** Digital Link path below the resolver host, e.g. 01/09521.../21/SERIAL */
  dl: string;
  gtin: string;
}

function catalogue(): Target[] {
  const src = readFileSync(PROVISIONER, "utf8");
  const out: Target[] = [];
  for (const [gtin] of bashArrayRows(src, "PRODUCTS")) {
    out.push({ label: `${gtin} model`, dl: `01/${gtin}`, gtin });
  }
  // The two flagships additionally exist at batch and item granularity.
  for (const [gtin, lot, serial] of bashArrayRows(src, "HEROES")) {
    out.push({ label: `${gtin} batch`, dl: `01/${gtin}/10/${lot}`, gtin });
    out.push({ label: `${gtin} item`, dl: `01/${gtin}/21/${serial}`, gtin });
  }
  // Tier probes are deliberately not Public, so an anonymous read is expected to be
  // filtered or refused; they are covered by verify-access-tiers.sh instead.
  return onlyGtin ? out.filter((t) => t.gtin === onlyGtin) : out;
}

interface Finding {
  label: string;
  status: number | string;
  curies: string[];
  nulls: string[];
  hosts: string[];
}

/** Walk a served passport collecting the CURIE and null defects. */
function inspect(doc: any): { curies: string[]; nulls: string[] } {
  const curies = new Set<string>();
  const nulls = new Set<string>();
  const walk = (node: any) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    for (const [k, v] of Object.entries(node)) {
      if (k === "@context") continue;
      if (!k.startsWith("@") && k.includes(":")) curies.add(k);
      if (v === null) nulls.add(k);
      if (k === "type" || k === "@type") {
        for (const t of Array.isArray(v) ? v : [v]) {
          // A full IRI is as much a leak as a CURIE: it is the same missing alias,
          // the prefix just was not known either.
          if (typeof t === "string" && t.includes(":")) curies.add(`type=${t}`);
        }
      }
      walk(v);
    }
  };
  walk(doc);
  return { curies: [...curies].sort(), nulls: [...nulls].sort() };
}

async function get(url: string): Promise<{ status: number | string; body?: any; text?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal });
    if (!res.ok) return { status: res.status };
    const text = await res.text();
    return { status: res.status, body: JSON.parse(text), text };
  } catch (e: any) {
    return { status: e?.name === "AbortError" ? "timeout" : `error: ${e?.message ?? e}` };
  } finally {
    clearTimeout(timer);
  }
}

async function read(t: Target): Promise<Finding> {
  const id = encodeURIComponent(`https://${ID_HOST}/${t.dl}`);
  // The compressed form for the CURIE / null checks…
  const served = await get(`${DPP_BASE}/v1/dppsByProductId/${id}`);
  if (served.status !== 200) return { label: t.label, status: served.status, curies: [], nulls: [], hosts: [] };
  // …and the stored master data for the host check, so the deriver's canonical
  // id.gs1.org party link is not mistaken for environment drift.
  const stored = await get(`${DPP_BASE}/v1/dppsByProductId/${id}?representation=gs1`);
  const hosts = [...new Set(stored.text?.match(FOREIGN_HOST) ?? [])];
  return { label: t.label, status: served.status, ...inspect(served.body), hosts };
}

const clean = (f: Finding) => f.status === 200 && !f.curies.length && !f.nulls.length && !f.hosts.length;
const trim = (xs: string[], n = 4) => xs.slice(0, n).join(", ") + (xs.length > n ? ` (+${xs.length - n})` : "");

async function main(): Promise<number> {
  const targets = catalogue();
  if (!targets.length) {
    console.error(`✗ no passports selected${onlyGtin ? ` for --gtin=${onlyGtin}` : ""}`);
    return 64;
  }
  // Sequential on purpose: this runs against a live deployment right after a
  // provisioning run, and a burst of parallel reads muddies which record is slow.
  const findings: Finding[] = [];
  for (const t of targets) findings.push(await read(t));

  if (asJson) {
    console.log(JSON.stringify({ env, findings }, null, 2));
  } else {
    console.log(`\nEN 18223 compressed passports on ${env} (${DPP_BASE})\n`);
    console.log(`  ${"passport".padEnd(26)} ${"http".padEnd(6)} CURIEs / nulls / foreign hosts`);
    for (const f of findings) {
      const detail = clean(f)
        ? "clean"
        : [
            f.curies.length ? `CURIE: ${trim(f.curies)}` : "",
            f.nulls.length ? `null: ${trim(f.nulls)}` : "",
            f.hosts.length ? `host: ${trim(f.hosts)}` : "",
          ].filter(Boolean).join("  |  ");
      console.log(`  ${clean(f) ? "✓" : "✗"} ${f.label.padEnd(24)} ${String(f.status).padEnd(6)} ${detail}`);
    }
  }

  const unreachable = findings.filter((f) => typeof f.status !== "number");
  const bad = findings.filter((f) => !clean(f) && typeof f.status === "number");
  if (unreachable.length === findings.length) {
    console.error(`\n✗ ${DPP_BASE} unreachable for every passport — is the environment up?`);
    return 2;
  }
  if (bad.length || unreachable.length) {
    console.error(
      `\n✗ env-passports (${env}): ${bad.length + unreachable.length} of ${findings.length} passport(s) with findings.`,
    );
    console.error(`  A CURIE means the stored record is older than the current vocabulary, or the deployed dpp-api`);
    console.error(`  predates the alias fix. A foreign host in the STORED body means it was seeded without the
    host rewrite. Both are fixed by re-provisioning against a current dpp-api:`);
    console.error(`    SEED_PW=… SEED_CLIENT_SECRET=… bash scripts/provision-demo.sh --env=${env}`);
    console.error(`  A null means the deriver could not read the stored shape of that property; re-provisioning`);
    console.error(`  does not fix that on its own.`);
    return 1;
  }
  console.log(`\n✓ env-passports (${env}): all ${findings.length} passport(s) bare-termed, complete, and ${env}-hosted.`);
  return 0;
}

process.exit(await main());
