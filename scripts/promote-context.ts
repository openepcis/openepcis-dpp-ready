#!/usr/bin/env tsx
/**
 * Promote derived term aliases into the hand-curated production @context.
 *
 * `build-context.ts` writes a full-coverage `{name}-context.generated.jsonld`
 * from the TTL (every class/property/enum the ontology defines). The published
 * production `{name}-context.jsonld` is the richer, hand-curated artifact
 * (comments, structured helpers, cross-vocab aliases) and tends to drift behind
 * the ontology: terms get added to the TTL but never reach production, so a
 * consumer loading the production context cannot use them in bare form (no
 * module declares @vocab, so an un-aliased term is silently dropped on expand).
 *
 * This tool reconciles the two with a DEEP MERGE under PRODUCTION PRECEDENCE:
 *   - every key/value/comment already in production is kept verbatim;
 *   - a *new term alias* present in the generated context but absent from
 *     production is added (recursively, so missing enum values inside a shared
 *     property's @vocab subcontext are filled too);
 *   - @-keywords (@type, @container, @id, @vocab, ...) are never newly
 *     introduced into an existing term definition — that would change how an
 *     already-published property's values expand. Existing term definitions stay
 *     byte-identical; only brand-new terms (copied whole) carry their own
 *     coercion, and only non-@ vocabulary keys are appended.
 *
 * It is therefore additive only: it can make more terms resolve, never break or
 * silently re-point an existing one. Re-run it after editing TTL + build:context.
 *
 * Usage: tsx scripts/promote-context.ts [--dry] [module-name-filter]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// module dir + context file basename
const MODULES: [string, string][] = [
  ['extensions/common/core', 'dpp-core'],
  ['extensions/common/interop', 'interop'],
  ['extensions/eu/battery', 'battery'],
  ['extensions/eu/eudr', 'eudr'],
  ['extensions/eu/textile', 'textile'],
  ['extensions/eu/electronics', 'electronics'],
  ['extensions/eu/detergent', 'detergent'],
  ['extensions/eu/ppwr', 'ppwr'],
  ['extensions/eu/cpr', 'cpr'],
  ['extensions/us/fsma204', 'fsma204'],
];

type Json = Record<string, unknown>;
const isPlainObject = (x: unknown): x is Json =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

/** Deep merge with production precedence; returns [merged, addedKeyPaths]. */
function deepMerge(prod: Json, gen: Json, trail: string, added: string[]): Json {
  const out: Json = {};
  // Keep production keys, order, and values first.
  for (const k of Object.keys(prod)) {
    const pv = prod[k];
    const gv = gen[k];
    if (isPlainObject(pv) && isPlainObject(gv)) {
      out[k] = deepMerge(pv, gv, `${trail}${k}.`, added);
    } else {
      out[k] = pv; // production wins on leaves and type mismatches
    }
  }
  // Append generated-only keys. Never introduce an @-keyword (@type/@container/
  // @id/@vocab/...) into an existing definition — that changes how a published
  // term's values expand. Brand-new terms are non-@ keys copied whole (their own
  // coercion rides along inside the copied value).
  for (const k of Object.keys(gen)) {
    if (k in prod) continue;
    if (k.startsWith('@')) continue;
    out[k] = gen[k];
    added.push(`${trail}${k}`);
  }
  return out;
}

/** Return the inline object element of an @context (object form or array form). */
function contextObject(ctx: unknown): Json | null {
  if (isPlainObject(ctx)) return ctx;
  if (Array.isArray(ctx)) {
    const obj = [...ctx].reverse().find((e) => isPlainObject(e));
    return (obj as Json) ?? null;
  }
  return null;
}

function setContextObject(ctx: unknown, merged: Json): unknown {
  if (isPlainObject(ctx)) return merged;
  if (Array.isArray(ctx)) {
    // replace the last object element, preserve string imports and order
    let replaced = false;
    const out = [...ctx];
    for (let i = out.length - 1; i >= 0; i--) {
      if (isPlainObject(out[i])) { out[i] = merged; replaced = true; break; }
    }
    if (!replaced) out.push(merged);
    return out;
  }
  return merged;
}

/**
 * Add prefixed-form aliases so a CURIE key (e.g. `gs1:netWeight`) carries the SAME
 * coercion as its bare alias. A raw CURIE key would otherwise expand via plain
 * prefix-expansion and SILENTLY DROP @type/@container coercion — turning
 * `"gs1:harvestDateStart": "2026-02-16"` into an untyped string instead of an
 * xsd:date. With these aliases, examples can use explicit, origin-revealing
 * prefixes (`gs1:`, `oec:`, …) with clean scalar values everywhere outside
 * `masterDataAvailableFor`, while the expanded RDF stays identical to the bare form.
 *
 * The alias is copied VERBATIM from the production bare def (not a TTL-derived def),
 * so bare and prefixed forms can never disagree even where the bare alias was
 * hand-overridden (e.g. a URL term curated as @type:@id rather than xsd:anyURI).
 *
 * Only coerced object-valued terms need this. Plain string aliases and class names
 * round-trip through prefix expansion already (no coercion to lose); @vocab enums
 * are written in examples as explicit `{ "@id": "…" }` values, so they are skipped
 * (which also avoids @id collisions when several enum terms share one @id such as
 * `schema:category`). Mutates `obj` in place; returns the alias keys added.
 */
function synthesizePrefixedAliases(obj: Json): string[] {
  const added: string[] = [];
  for (const [key, val] of Object.entries({ ...obj })) {
    if (key.startsWith('@') || key.includes(':')) continue; // keyword or already CURIE-keyed
    if (!isPlainObject(val)) continue; // string alias / class name — prefix-expansion is lossless
    const id = (val as Json)['@id'];
    if (typeof id !== 'string' || id.includes('://') || !id.includes(':')) continue;
    if ((val as Json)['@type'] === '@vocab') continue; // enum — handled via {@id} values
    if (id in obj) continue; // alias already present (or bare key already is the CURIE)
    obj[id] = val;
    added.push(id);
  }
  return added;
}

function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const filter = args.find((a) => !a.startsWith('--'));

  let totalAdded = 0;
  for (const [dir, base] of MODULES) {
    if (filter && !base.includes(filter)) continue;
    const prodPath = path.join(ROOT, dir, 'context', `${base}-context.jsonld`);
    const genPath = path.join(ROOT, dir, 'context', `${base}-context.generated.jsonld`);
    if (!existsSync(prodPath) || !existsSync(genPath)) {
      console.log(`SKIP ${base} (prod=${existsSync(prodPath)} gen=${existsSync(genPath)})`);
      continue;
    }
    const prod = JSON.parse(readFileSync(prodPath, 'utf8')) as Json;
    const gen = JSON.parse(readFileSync(genPath, 'utf8')) as Json;
    const prodObj = contextObject(prod['@context']);
    const genObj = contextObject(gen['@context']);
    if (!prodObj || !genObj) { console.log(`SKIP ${base} (no @context object)`); continue; }

    const added: string[] = [];
    const merged = deepMerge(prodObj, genObj, '', added);
    const aliased = synthesizePrefixedAliases(merged);
    if (added.length === 0 && aliased.length === 0) {
      console.log(`OK   ${base}: already complete`);
      continue;
    }
    prod['@context'] = setContextObject(prod['@context'], merged);
    totalAdded += added.length + aliased.length;
    const parts = [];
    if (added.length) parts.push(`+${added.length} terms`);
    if (aliased.length) parts.push(`+${aliased.length} prefixed-aliases`);
    console.log(`${dry ? 'WOULD ' : ''}ADD  ${base}: ${parts.join(', ')}`);
    if (added.length) console.log(`       terms: ${added.join(', ')}`);
    if (!dry) writeFileSync(prodPath, JSON.stringify(prod, null, 2) + '\n');
  }
  console.log(`\n${dry ? '[dry] ' : ''}Total aliases added: ${totalAdded}`);
}

main();
