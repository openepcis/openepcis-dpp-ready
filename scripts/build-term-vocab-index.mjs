// Build a bareTerm -> source-vocabulary-prefix index from the OpenEPCIS
// JSON-LD context files, so the DDM Provenance widget can attribute a
// compacted (bare) key like "garmentType" to eutex: even when the resolver
// serves it without a prefix. Prefixed keys need no lookup; only bare keys do.
//
// Run:  node scripts/build-term-vocab-index.mjs
// Emits the index to the DDM app's app/utils/term-vocab-index.json.

import { readFileSync, writeFileSync } from "fs";

const ROOTS = [
  "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
  "https://ref.openepcis.io/extensions/common/interop/semic-core-bridge-context.jsonld",
  "https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld",
  "https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld",
  "https://ref.openepcis.io/extensions/eu/ppwr/ppwr-context.jsonld",
  "https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld",
  "https://ref.openepcis.io/extensions/eu/detergent/detergent-context.jsonld",
  "https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld",
  "https://ref.openepcis.io/extensions/eu/iron-steel/iron-steel-context.jsonld",
];

// Prefixes we care to attribute from the extension contexts. Bare keys that are
// neither aliased here nor a foundational (gs1/schema) term are left unattributed
// by the app (no fabricated badge/link).
const KNOWN = new Set([
  "eubat", "eutex", "euelec", "eudet", "eudr", "eusteel", "euppwr", "eucpr",
  "usfsma", "oec", "oei", "gs1", "schema", "cccev", "cv", "locn", "adms", "dpp",
]);

const index = {}; // bareTerm -> canonical CURIE (e.g. "garmentType":"eutex:garmentType",
                  //                              "textileCategory":"schema:category")
const seen = new Set();

function prefixOf(id) {
  if (typeof id !== "string") return null;
  const m = id.match(/^([A-Za-z0-9]+):(?!\/)/); // "eutex:foo" but not "http://"
  return m ? m[1] : null;
}

function ingest(ctxObj) {
  for (const [key, val] of Object.entries(ctxObj)) {
    if (key.startsWith("@")) continue;
    // Prefix definition (value is a namespace URL) — skip; not a term.
    if (typeof val === "string" && /^https?:\/\//.test(val)) continue;
    const id = typeof val === "string" ? val : val && typeof val === "object" ? val["@id"] : null;
    const px = prefixOf(id);
    if (px && KNOWN.has(px) && !(key in index)) index[key] = id; // store full CURIE
    // Nested @context (enum value maps) — recurse for completeness.
    if (val && typeof val === "object" && val["@context"] && typeof val["@context"] === "object") {
      ingest(val["@context"]);
    }
  }
}

async function resolve(url) {
  if (seen.has(url)) return;
  seen.add(url);
  let doc;
  try {
    const res = await fetch(url, { headers: { Accept: "application/ld+json" } });
    if (!res.ok) { console.warn(`skip ${url} (${res.status})`); return; }
    doc = await res.json();
  } catch (e) { console.warn(`skip ${url} (${e.message})`); return; }
  const ctx = doc["@context"];
  const parts = Array.isArray(ctx) ? ctx : [ctx];
  for (const part of parts) {
    if (typeof part === "string") await resolve(part); // nested context URL
    else if (part && typeof part === "object") ingest(part);
  }
}

for (const root of ROOTS) await resolve(root);

// Fold in the full foundational vocabularies from the committed snapshot. The
// resolver compacts foundational terms to bare keys (against the gs1Voc / schema
// contexts it serves), so a bare key the extension contexts didn't alias is still
// a real GS1/schema term — recovering it here lets the Provenance widget attribute
// and link it instead of dropping it to "unattributed". Add-only and ordered so
// extension aliases win first, then GS1, then schema.org (the ~83 gs1∩schema
// name collisions resolve to GS1, matching the GS1→schema layering order).
const snapshot = JSON.parse(
  readFileSync(new URL("./vocab-snapshot.json", import.meta.url), "utf8"),
);
for (const prefix of ["gs1", "schema"]) {
  const terms = snapshot.vocabs?.[prefix]?.terms ?? [];
  for (const local of terms) if (!(local in index)) index[local] = `${prefix}:${local}`;
}

const out = Object.keys(index).sort().reduce((o, k) => ((o[k] = index[k]), o), {});
const dest = "/Users/sven/Documents/projects/openepcis-web/apps/digital-data-management/app/utils/term-vocab-index.json";
writeFileSync(dest, JSON.stringify(out, null, 0) + "\n");
const counts = {};
for (const curie of Object.values(out)) { const p = curie.split(":")[0]; counts[p] = (counts[p] || 0) + 1; }
console.log(`Wrote ${Object.keys(out).length} terms to ${dest}`);
console.log("by prefix:", counts);
