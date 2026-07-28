#!/usr/bin/env tsx
/**
 * Regenerate the per-module HOLD sections of docs/skos-alignment/OPEN_DECISIONS.md from the
 * completeness reports, so the curator's list is reproducible rather than hand-maintained.
 *
 * Everything above the generated marker is hand-written and preserved; everything below it is
 * rewritten from the reports plus a count of the `skos:narrowMatch` assertions still standing.
 *
 * Usage: tsx scripts/build-skos-open-decisions.ts [--check]
 *   --check reports drift and exits 1 without writing (for CI or a pre-commit sweep).
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const DOC = "docs/skos-alignment/OPEN_DECISIONS.md";
const MARKER = "<!-- generated: per-module holds and the narrowMatch remainder. Rebuild with `pnpm run skos:decisions`. -->";

interface Hold { ourId: string; upstreamIri: string; predicate: string | null; existing: string | null; qa: number; reason: string }

function holdsFor(report: string): Hold[] {
  const out = execFileSync("npx", ["tsx", "scripts/triage-skos-report.ts", report], { encoding: "utf8" });
  const holds: Hold[] = [];
  let inHold = false;
  for (const line of out.split("\n")) {
    if (line.startsWith("=== HOLD")) { inHold = true; continue; }
    if (line.startsWith("=== ")) { inHold = false; continue; }
    if (!inHold || !line.trim()) continue;
    const m = /^\s+([\d.]+)\s+(\S+)\s+(\S+)\s+->\s+(\S+)\s+(\S+)\s+(.*)$/.exec(line);
    if (m) holds.push({ qa: Number(m[1]), ourId: m[2], existing: m[3] === "-" ? null : m[3], predicate: m[4], upstreamIri: m[5], reason: m[6].trim() });
  }
  return holds;
}

function remainingNarrowMatch(): Record<string, number> {
  const counts: Record<string, number> = {};
  const walk = (dir: string) => {
    for (const e of readdirSync(dir)) {
      const full = join(dir, e);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (!e.endsWith(".ttl") || !full.includes("/ontology/") || e.includes("access-levels")) continue;
      const ttl = readFileSync(full, "utf8").replace(/"""[\s\S]*?"""/g, '""');
      let subject: string | null = null;
      for (const line of ttl.split("\n")) {
        const m = /^([a-z]+:[\w-]+)(?:\s|$)/.exec(line);
        if (m) { subject = m[1]; continue; }
        const t = /^\s+skos:narrowMatch\s+(\S+?)\s*[;.]\s*$/.exec(line);
        if (!t || !subject) continue;
        const target = t[1];
        const group = target.startsWith("<urn:samm") || target.includes("batterypass-ready") ? "BatteryPass SAMM / bpr"
          : target.startsWith("dppk:") || target.includes("dpp-keystone") ? "DPP Keystone"
          : target.startsWith("untp:") || target.includes("uncefact") ? "UNTP"
          : target.startsWith("cv:") || target.includes("data.europa.eu") ? "SEMICeu / CCCEV"
          : /^(oec|eubat|eutex|euelec|eudet|eucpr|eusteel|eudr|euppwr|usfsma):/.test(target) ? "intra-project"
          : target.startsWith("schema:") || target.includes("schema.org") ? "schema.org tail"
          : target.startsWith("gs1:") || target.includes("ref.gs1.org") ? "GS1 tail" : "other";
        counts[group] = (counts[group] ?? 0) + 1;
      }
    }
  };
  walk("extensions");
  return counts;
}

/**
 * Newest dated report per module. Undated files from earlier sessions
 * (`skos-completeness-battery.json`) and the hosted-model comparison runs (`*-opus.json`)
 * are ignored: this document tracks the current state, not the archive.
 */
const reports = (() => {
  const newest = new Map<string, string>();
  for (const f of readdirSync("docs/skos-alignment")) {
    const m = /^skos-completeness-(.+)-(\d{4}-\d{2}-\d{2})\.json$/.exec(f);
    if (!m || f.includes("-opus")) continue;
    const [, module, date] = m;
    const prev = newest.get(module);
    if (!prev || prev < date) newest.set(module, date);
  }
  return [...newest.entries()].sort().map(([module, date]) => `skos-completeness-${module}-${date}.json`);
})();

let body = `${MARKER}\n`;
for (const r of reports) {
  const module = /^skos-completeness-(.+)-\d{4}-\d{2}-\d{2}\.json$/.exec(r)![1];
  const holds = holdsFor(join("docs/skos-alignment", r));
  body += `\n## ${module}\n\n`;
  if (!holds.length) { body += `No held findings: everything the panel confirmed was either applied or filtered as out of scope.\n`; continue; }
  body += `From \`${r}\`. ${holds.length} confirmed finding${holds.length === 1 ? "" : "s"} the triage did not apply.\n\n`;
  body += `| QA | Our term | Panel proposes | Target | Why it waits |\n|---|---|---|---|---|\n`;
  for (const h of holds.sort((a, b) => b.qa - a.qa)) {
    const from = h.existing ? `${h.existing} to ` : "";
    body += `| ${h.qa.toFixed(2)} | \`${h.ourId}\` | ${from}\`${h.predicate}\` | \`${h.upstreamIri}\` | ${h.reason} |\n`;
  }
}

// Where the two pipeline stages contradict each other on an assertion the ontology already
// carries: the bulk grader marks it WRONG, the QA panel then rejects the correction. Neither
// verdict wins, so nothing is applied, and the pair would vanish from the report silently.
// A count per module at least tells a curator where the pipeline is unsure of itself.
const disagreements: Record<string, number> = {};
for (const r of reports) {
  const module = /^skos-completeness-(.+)-\d{4}-\d{2}-\d{2}\.json$/.exec(r)![1];
  const doc = JSON.parse(readFileSync(join("docs/skos-alignment", r), "utf8"));
  const n = (doc.findings ?? []).filter(
    (f: { status: string; qaTier: string; existingPredicate: string | null }) =>
      f.status === "WRONG" && f.qaTier === "REJECT" && f.existingPredicate?.startsWith("skos:"),
  ).length;
  if (n) disagreements[module] = n;
}
const disagreementTotal = Object.values(disagreements).reduce((a, b) => a + b, 0);
if (disagreementTotal) {
  body += `\n## Where the pipeline contradicts itself\n\n`;
  body += `${disagreementTotal} assertion(s) the ontology already carries were marked \`WRONG\` by the\n`;
  body += `bulk grader and then had the correction rejected by the QA panel. Nothing was applied, so\n`;
  body += `each one is either a mapping worth re-reading or a prompt worth improving. A worked example:\n`;
  body += `the textile panel rejected \`eutex:additionalCareInstructions skos:narrowMatch\n`;
  body += `schema:additionalProperty\` at 0.97 confidence, and it does look inverted, since\n`;
  body += `\`schema:additionalProperty\` is a general extension slot rather than a narrower concept.\n\n`;
  for (const [m, n] of Object.entries(disagreements).sort((a, b) => b[1] - a[1])) {
    body += `- **${m}**: ${n}\n`;
  }
}

const counts = remainingNarrowMatch();
const total = Object.values(counts).reduce((a, b) => a + b, 0);
body += `\n## Remaining \`skos:narrowMatch\` assertions\n\n`;
body += `${total} assertions still read \`narrowMatch\`. Their targets are peer profiles or\n`;
body += `intra-project terms of comparable specificity, where which of the two is narrower is a\n`;
body += `modelling question per term. \`check:mappings\` rule 6 already guards the mechanical class,\n`;
body += `the general Layer-1 head terms.\n\n`;
for (const [g, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) body += `- **${g}**: ${n}\n`;

const existing = existsSync(DOC) ? readFileSync(DOC, "utf8") : "";
const head = existing.includes(MARKER) ? existing.slice(0, existing.indexOf(MARKER)) : existing + "\n";
const next = head + body;

if (process.argv.includes("--check")) {
  if (existing !== next) { console.error(`✗ ${DOC} is stale; run pnpm run skos:decisions`); process.exit(1); }
  console.log(`✓ ${DOC} matches the reports`); process.exit(0);
}
writeFileSync(DOC, next);
console.log(`wrote ${DOC}: ${reports.length} module report(s), ${total} narrowMatch remaining`);
