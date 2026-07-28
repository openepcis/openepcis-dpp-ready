#!/usr/bin/env tsx
/**
 * Write the APPLY set of `triage-skos-report.ts` into the module ontologies.
 *
 * Dry-run by default; `--write` edits the TTL. Two operations only:
 *   flip     an existing `skos:narrowMatch` / `skos:broadMatch` whose direction the panel
 *            reverses, edited in place so nothing else about the line changes;
 *   insert   a new graded relation, or a graded relation beside an existing rdfs:seeAlso,
 *            placed as the last triple of the subject's block.
 *
 * Two things make the insert safe, both learned the hard way: a block ends at the first
 * `.`-terminated line at or after the subject line (searching for "the last line that still
 * belongs to the subject" walks into the comment banner of the next section and produces a
 * triple outside any subject), and the search runs on a copy with `"""…"""` literals blanked,
 * because prose in a skos:note routinely starts a line with a CURIE and would otherwise read
 * as a new subject.
 *
 * Usage:
 *   tsx scripts/apply-skos-triage.ts <report.json> [--write]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const NS_TO_PREFIX: [string, string][] = [
  ["https://ref.gs1.org/voc/", "gs1:"],
  ["https://schema.org/", "schema:"],
  ["http://schema.org/", "schema:"],
  ["http://data.europa.eu/m8g/", "cv:"],
  ["http://www.w3.org/ns/locn#", "locn:"],
  ["http://www.w3.org/ns/adms#", "adms:"],
  ["http://xmlns.com/foaf/0.1/", "foaf:"],
  ["https://dpp-keystone.org/spec/v2/terms#", "dppk:"],
  ["https://vocabulary.uncefact.org/untp/", "untp:"],
];

/**
 * Every form the TTL might already use for this IRI, most likely first.
 *
 * A CURIE is only offered when the file DECLARES that prefix: iron-steel.ttl has no
 * `@prefix untp:`, so writing `untp:processCategory` there produced a file that no longer
 * parsed. Reading is safe either way; writing has to respect the file's own prefixes.
 */
function targetForms(iri: string, declared: Set<string>): string[] {
  const forms = [`<${iri}>`];
  for (const [ns, px] of NS_TO_PREFIX) {
    if (iri.startsWith(ns) && declared.has(px)) forms.unshift(px + iri.slice(ns.length));
  }
  return forms;
}

/** Prefixes the file declares, as `gs1:`, `schema:`, and so on. */
function declaredPrefixes(ttl: string): Set<string> {
  return new Set([...ttl.matchAll(/^@prefix\s+([A-Za-z][\w-]*:)/gm)].map((m) => m[1]));
}

const blank = (ttl: string) =>
  ttl.replace(/"""[\s\S]*?"""/g, (lit) => '""' + lit.replace(/[^\n]/g, " ").slice(2) + '""');

function ontologyFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir)) {
      const full = join(dir, e);
      if (statSync(full).isDirectory()) walk(full);
      else if (e.endsWith(".ttl") && full.includes("/ontology/") && !e.includes("access-levels")) out.push(full);
    }
  };
  walk("extensions");
  return out;
}

interface Item { ourId: string; upstreamIri: string; predicate: string; existing: string | null; qa: number }

const report = process.argv[2];
const write = process.argv.includes("--write");
if (!report) { console.error("usage: tsx scripts/apply-skos-triage.ts <report.json> [--write]"); process.exit(64); }

const items: Item[] = JSON.parse(
  execFileSync("npx", ["tsx", "scripts/triage-skos-report.ts", report, "--json"], { encoding: "utf8" }),
);
if (!items.length) { console.log("nothing to apply"); process.exit(0); }

const files = ontologyFiles();
let flipped = 0, inserted = 0, missed = 0;

for (const it of items) {
  let done = false;
  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const lines = raw.split("\n");
    const masked = blank(raw).split("\n");
    const start = masked.findIndex((l) => new RegExp(`^${it.ourId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`).test(l));
    if (start < 0) continue;
    const end = masked.findIndex((l, i) => i >= start && l.trimEnd().endsWith("."));
    if (end < 0) continue;

    const forms = targetForms(it.upstreamIri, declaredPrefixes(raw));
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // idempotent: the relation may already be there, for instance from an earlier sweep
    const already = masked.slice(start, end + 1).some((l) =>
      forms.some((f) => new RegExp(`^\\s+${it.predicate}\\s+${esc(f)}\\s*[;.]\\s*$`).test(l)));
    if (already) { console.log(`  have   ${it.ourId.padEnd(36)} ${it.predicate} ${forms[0]}`); done = true; break; }
    // flip in place when the pair already exists with the other direction
    if (it.existing === "skos:narrowMatch" || it.existing === "skos:broadMatch") {
      for (let i = start; i <= end; i++) {
        const hit = forms.some((f) => new RegExp(`^\\s+${it.existing}\\s+${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[;.]\\s*$`).test(masked[i]));
        if (!hit) continue;
        if (write) { lines[i] = lines[i].replace(it.existing, it.predicate); writeFileSync(file, lines.join("\n")); }
        console.log(`  flip   ${it.ourId.padEnd(36)} ${it.existing} -> ${it.predicate}  ${forms[0]}`);
        flipped++; done = true; break;
      }
      if (done) break;
    }
    if (done) break;
    // otherwise append the relation as the block's last triple
    if (write) {
      lines[end] = lines[end].trimEnd().slice(0, -1).trimEnd() + " ;";
      lines.splice(end + 1, 0, `    ${it.predicate} ${forms[0]} .`);
      writeFileSync(file, lines.join("\n"));
    }
    console.log(`  insert ${it.ourId.padEnd(36)} ${it.predicate} ${forms[0]}`);
    inserted++; done = true; break;
  }
  if (!done) { console.log(`  MISS   ${it.ourId} ${it.upstreamIri}`); missed++; }
}

console.log(`\n${write ? "wrote" : "DRY-RUN"}: ${flipped} flip(s), ${inserted} insert(s), ${missed} not found`);
if (write) console.log("Now run: rapper -i turtle -c on the touched TTLs, then pnpm run check:mappings && pnpm run build");
