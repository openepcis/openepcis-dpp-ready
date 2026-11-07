#!/usr/bin/env tsx
/**
 * Write the APPLY set of `triage-skos-report.ts` into the module ontologies.
 *
 * Dry-run by default; `--write` edits the TTL. Two operations only:
 *   regrade  an existing graded relation the panel regrades (a direction flip, or closeMatch
 *            to exactMatch and the like), edited in place so nothing else about the line changes;
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
  ["https://dpp-keystone.org/spec/v3/terms/epd#", "dppk-epd:"],
  ["https://dpp-keystone.org/spec/v3/terms/dopc#", "dppk-dopc:"],
  ["https://dpp-keystone.org/spec/v3/terms#", "dppk:"],
  ["https://vocabulary.uncefact.org/untp/", "untp:"],
  ["https://repository.product-passport.ec.europa.eu/core/vocabs/core-vocabulary#", "eudppcore:"],
  ["https://repository.product-passport.ec.europa.eu/core/vocabs/common-vocabulary#", "eudppcom:"],
  ["https://repository.product-passport.ec.europa.eu/product/batteries/vocabs/battery-vocabulary#", "eudppbat:"],
];

/**
 * Every form the TTL might already use for this IRI, most likely first.
 *
 * A CURIE is only offered when the file DECLARES that prefix: iron-steel.ttl has no
 * `@prefix untp:`, so writing `untp:processCategory` there produced a file that no longer
 * parsed. Reading is safe either way; writing has to respect the file's own prefixes.
 */
function targetForms(iri: string, declared: Map<string, string>): string[] {
  const forms = [`<${iri}>`];
  // any prefix the file declares can already be in use on the line (cirpass2-battery:, bpr:, ...)
  for (const [px, ns] of declared) {
    const local = iri.slice(ns.length);
    if (iri.startsWith(ns) && /^[A-Za-z_][\w-]*$/.test(local) && !forms.includes(px + local)) forms.push(px + local);
  }
  // a new triple prefers the conventional prefix, when the file declares it for that namespace
  for (const [ns, px] of NS_TO_PREFIX) {
    if (iri.startsWith(ns) && declared.get(px) === ns) {
      const f = px + iri.slice(ns.length);
      forms.splice(forms.indexOf(f), 1);
      forms.unshift(f);
      break;
    }
  }
  return forms;
}

/** Prefixes the file declares, `gs1:` to its namespace IRI. */
function declaredPrefixes(ttl: string): Map<string, string> {
  return new Map([...ttl.matchAll(/^@prefix\s+([A-Za-z][\w-]*:)\s*<([^>]*)>/gm)].map((m) => [m[1], m[2]]));
}

// Blank long literals AND comment lines, keeping every newline. A comment that happens to
// end in a full stop ("… the eubat: namespace.") would otherwise read as the block end, and
// the insert would split the subject in two (battery.ttl, 2026-10-30).
const blank = (ttl: string) =>
  ttl
    .replace(/"""[\s\S]*?"""/g, (lit) => '""' + lit.replace(/[^\n]/g, " ").slice(2) + '""')
    .replace(/^[ \t]*#.*$/gm, (line) => " ".repeat(line.length));

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
let regraded = 0, inserted = 0, missed = 0;

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
    // regrade in place when the pair already exists under another graded relation: a direction
    // flip, or closeMatch / exactMatch / narrowMatch / broadMatch to one of the others
    if (it.existing?.startsWith("skos:")) {
      for (let i = start; i <= end; i++) {
        const hit = forms.some((f) => new RegExp(`^\\s+${it.existing}\\s+${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[;.]\\s*$`).test(masked[i]));
        if (!hit) continue;
        if (write) { lines[i] = lines[i].replace(it.existing, it.predicate); writeFileSync(file, lines.join("\n")); }
        console.log(`  regrade ${it.ourId.padEnd(36)} ${it.existing} -> ${it.predicate}  ${forms[0]}`);
        regraded++; done = true; break;
      }
      if (done) break;
      // the pair exists but not on a line of its own (a comma list): never add a second relation
      console.log(`  MISS   ${it.ourId} ${it.existing} ${forms[0]} is not on a line of its own`);
      missed++; done = true; break;
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

console.log(`\n${write ? "wrote" : "DRY-RUN"}: ${regraded} regrade(s), ${inserted} insert(s), ${missed} not found`);
if (write) console.log("Now run: rapper -i turtle -c on the touched TTLs, then pnpm run check:mappings && pnpm run build");
