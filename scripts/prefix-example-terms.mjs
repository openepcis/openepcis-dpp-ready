// Normalize example JSON-LD so every vocabulary term carries an explicit
// prefix (eutex:/eubat:/oec:/gs1:/schema: …), making the source of each term
// obvious at a glance. Most example files are already prefixed; this fixes the
// stragglers that slipped in bare. Idempotent: already-prefixed keys are left
// as-is (except the legacy dpp: alias, which is rewritten to oec:).
//
// Scope: extensions/**/examples/**/*.jsonld  (EPCIS event files under epcis/
// are excluded — their CBV/event-model fields like bizStep/type/value are
// structural and must stay bare per the prefix rule; extension terms there are
// already prefixed by hand). GEFEG batterypass-ready/*.json are excluded too.
//
// Run:  node scripts/prefix-example-terms.mjs   (add --dry to preview)

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const DRY = process.argv.includes("--dry");
const INDEX = JSON.parse(
  readFileSync(
    "/Users/sven/Documents/projects/openepcis-web/apps/digital-data-management/app/utils/term-vocab-index.json",
    "utf8",
  ),
);
// Foundational-vocab term sets from the guard's snapshot: a gs1:/schema: term
// is only prefixed if it genuinely exists upstream (else the vocab guard would
// reject the newly-explicit reference). Extension terms need no such check.
const SNAP = JSON.parse(readFileSync("scripts/vocab-snapshot.json", "utf8"));
const UPSTREAM = {
  gs1: new Set(SNAP.vocabs?.gs1?.terms ?? []),
  schema: new Set(SNAP.vocabs?.schema?.terms ?? []),
};

// JSON-LD keyword aliases + editorial keys that are not vocabulary terms.
const KEEP_BARE = new Set(["id", "type"]);
const isLangTag = (k) => /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(k);

let renamed = 0;
const perFile = {};

function transform(node, file) {
  if (Array.isArray(node)) return node.map((n) => transform(n, file));
  if (!node || typeof node !== "object") return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    // Never touch @-keywords; never descend into @context.
    if (k === "@context") { out[k] = v; continue; }
    if (k.startsWith("@") || k.startsWith("_") || KEEP_BARE.has(k)) {
      out[k] = transform(v, file);
      continue;
    }
    let key = k;
    if (k.includes(":")) {
      const [px, ...rest] = k.split(":");
      if (px === "dpp") { key = "oec:" + rest.join(":"); renamed++; perFile[file] = (perFile[file] || 0) + 1; }
    } else if (!isLangTag(k) && INDEX[k]) {
      // INDEX[k] is the canonical CURIE. Only add a prefix when the local name
      // is unchanged (a pure prefix alias, e.g. garmentType -> eutex:garmentType).
      // Leave true aliases bare (e.g. textileCategory -> schema:category,
      // recyclingInstructions -> gs1:consumerRecyclingInstructions): renaming
      // the key would drop the term's scoped @context (enum maps) and rewrite
      // its local name, which we don't want in the source examples.
      const curie = INDEX[k];
      const px = curie.split(":")[0];
      const pureLocalMatch = curie === `${px}:${k}`;
      // Skip true aliases (local renamed); skip gs1:/schema: terms absent from
      // the upstream snapshot (they'd fail the vocab guard).
      const upstreamOk = px in UPSTREAM ? UPSTREAM[px].has(k) : true;
      if (pureLocalMatch && upstreamOk) {
        key = curie;
        renamed++;
        perFile[file] = (perFile[file] || 0) + 1;
      }
    }
    out[key] = transform(v, file);
  }
  return out;
}

const files = execSync(
  'find extensions -path "*/examples/*" -name "*.jsonld" ! -path "*batterypass-ready*"',
).toString().trim().split("\n").filter(Boolean);

for (const f of files) {
  let doc;
  try { doc = JSON.parse(readFileSync(f, "utf8")); } catch { console.log("parse-fail", f); continue; }
  const before = JSON.stringify(doc);
  const next = transform(doc, f);
  if (JSON.stringify(next) !== before) {
    if (!DRY) writeFileSync(f, JSON.stringify(next, null, 2) + "\n");
  }
}

console.log(`${DRY ? "[dry] " : ""}Renamed ${renamed} key(s) across ${Object.keys(perFile).length} file(s):`);
for (const [f, n] of Object.entries(perFile)) console.log(`  ${n}\t${f}`);
