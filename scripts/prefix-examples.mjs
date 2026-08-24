#!/usr/bin/env node
/**
 * THROWAWAY codemod (not committed as enforcement) — rewrites standalone example
 * JSON-LD files so every vocabulary term carries an explicit prefix (gs1: incl.),
 * per the canonical prefix rule. Coercion-aware:
 *   - plain alias / @type:@id / xsd:* / @container  -> rename key to its CURIE
 *   - @type:@vocab enum                              -> rename key to its CURIE AND
 *                                                       wrap each value as {"@id": <curie>}
 *   - `type` array values (class aliases)            -> rewrite to CURIE
 * Structural keywords (@*, id), already-prefixed keys, and _comment* are left alone.
 *
 * Every file is gated on N-Quads identity (expanded triple SET unchanged) — the script
 * writes ONLY if the rewrite is semantically identical, else it reports the diff and skips.
 *
 * Usage: node scripts/prefix-examples.mjs [--write] [path-substring-filter]
 */
import jsonld from 'jsonld';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const URL_TO_FILE = {
  'https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld': 'extensions/common/core/context/dpp-core-context.jsonld',
  'https://ref.openepcis.io/extensions/common/core/gs1-shortcuts-context.jsonld': 'extensions/common/core/context/gs1-shortcuts-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld': 'extensions/eu/battery/context/battery-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/battery/battery-context-scientific.jsonld': 'extensions/eu/battery/context/battery-context-scientific.jsonld',
  'https://ref.openepcis.io/extensions/eu/battery/battery-context-batterypass-bridge.jsonld': 'extensions/eu/battery/context/battery-context-batterypass-bridge.jsonld',
  'https://ref.openepcis.io/extensions/eu/battery/battery-context-to-batterypass.jsonld': 'extensions/eu/battery/context/battery-context-to-batterypass.jsonld',
  'https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld': 'extensions/eu/textile/context/textile-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/textile/textile-context-pefcr-bridge.jsonld': 'extensions/eu/textile/context/textile-context-pefcr-bridge.jsonld',
  'https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld': 'extensions/eu/electronics/context/electronics-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld': 'extensions/eu/eudr/context/eudr-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/detergent/detergent-context.jsonld': 'extensions/eu/detergent/context/detergent-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/ppwr/ppwr-context.jsonld': 'extensions/eu/ppwr/context/ppwr-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/cpr/cpr-context.jsonld': 'extensions/eu/cpr/context/cpr-context.jsonld',
  'https://ref.openepcis.io/extensions/us/fsma204/fsma204-context.jsonld': 'extensions/us/fsma204/context/fsma204-context.jsonld',
  'https://ref.openepcis.io/extensions/common/interop/untp-bridge-context.jsonld': 'extensions/common/interop/context/untp-bridge-context.jsonld',
  'https://ref.openepcis.io/extensions/common/interop/jtc24-bridge-context.jsonld': 'extensions/common/interop/context/jtc24-bridge-context.jsonld',
  'https://ref.openepcis.io/extensions/common/interop/cirpass2-bridge-context.jsonld': 'extensions/common/interop/context/cirpass2-bridge-context.jsonld',
  'https://ref.openepcis.io/extensions/common/interop/rail-bridge-context.jsonld': 'extensions/common/interop/context/rail-bridge-context.jsonld',
  'https://gs1-epcis-reg.org/rail/rail-context.jsonld': 'extensions/upstream/gs1-rail/context/rail-context.jsonld',
};

const remoteCache = new Map();
async function loadDoc(url) {
  if (URL_TO_FILE[url]) return JSON.parse(await fs.readFile(path.join(ROOT, URL_TO_FILE[url]), 'utf8'));
  if (remoteCache.has(url)) return remoteCache.get(url);
  const res = await fetch(url, { headers: { Accept: 'application/ld+json, application/json' } });
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  const doc = JSON.parse(await res.text());
  remoteCache.set(url, doc);
  return doc;
}
const documentLoader = async (url) => ({ contextUrl: undefined, documentUrl: url, document: await loadDoc(url) });

function ctxObject(ctx) {
  if (ctx && typeof ctx === 'object' && !Array.isArray(ctx)) return ctx;
  if (Array.isArray(ctx)) return [...ctx].reverse().find((e) => e && typeof e === 'object') || {};
  return {};
}

// Build a merged term -> definition map from the file's @context, recursing into
// string imports (a context whose own @context array references another context,
// e.g. battery-context imports dpp-core). Later refs override earlier, mirroring
// JSON-LD. The per-key probe is still the source of truth for whether a rename is
// safe; this map only decides which keys are CANDIDATES.
async function mergeCtx(ref, map, seen) {
  if (typeof ref === 'string') {
    if (seen.has(ref)) return;
    seen.add(ref);
    const doc = await loadDoc(ref);
    await mergeCtx(doc['@context'], map, seen);
  } else if (Array.isArray(ref)) {
    for (const e of ref) await mergeCtx(e, map, seen);
  } else if (ref && typeof ref === 'object') {
    Object.assign(map, ref); // inline context object
  }
}
async function buildTermMap(contextRef) {
  const map = {};
  await mergeCtx(contextRef, map, new Set());
  return map;
}

const KEYWORDS = new Set(['@context', '@id', '@type', '@value', '@language', '@graph', '@list', '@set', '@vocab', '@base', '@version', '@container', '@protected', 'id']);

// Only GS1 Web Vocabulary, schema.org, and our extension namespaces get prefixed.
// EPCIS event-model terms (epcis:, cbv:) are structural and stay BARE — prefixing
// e.g. `ilmd` -> `epcis:ilmd` is RDF-identical but breaks EPCIS schema conformance.
const ALLOWED_PREFIXES = new Set([
  'gs1', 'schema', 'oec', 'oei', 'eubat', 'eudr', 'eutex', 'euelec', 'eudet',
  'euppwr', 'eucpr', 'usfsma', 'rail',
]);
const allowedCurie = (curie) => ALLOWED_PREFIXES.has(curie.split(':')[0]);

function defOf(map, term) {
  return Object.prototype.hasOwnProperty.call(map, term) ? map[term] : undefined;
}
// Return {curie, kind, scoped} for a term def, or null if not a rewritable vocab
// term. Only allowlisted namespaces (GS1/schema/extensions) are rewritable; EPCIS
// structural terms (epcis:/cbv:) and datatypes (xsd:) return null -> stay bare.
function classify(def) {
  if (def == null) return null;
  if (typeof def === 'string') {
    if (def.startsWith('@')) return null; // keyword alias (e.g. "type":"@type")
    if (def.includes(':') && !def.includes('://') && allowedCurie(def)) return { curie: def, kind: 'plain' };
    return null;
  }
  if (typeof def === 'object') {
    const id = def['@id'];
    if (typeof id !== 'string') return null;
    if (id.startsWith('@')) return null;
    const curie = id.includes('://') ? null : id;
    if (!curie || !allowedCurie(curie)) return null;
    if (def['@type'] === '@vocab') return { curie, kind: 'enum', scoped: def['@context'] || null };
    return { curie, kind: 'coerced' };
  }
  return null;
}
function resolveEnumValue(scoped, v) {
  if (scoped && typeof scoped === 'object' && typeof scoped[v] === 'string') return scoped[v];
  return null; // unknown: signal caller to leave as-is (gate will catch)
}

// Per-key safety probe: a rename key->curie (with newVal) is accepted ONLY if,
// under the file's own @context, `{ key: val }` and `{ curie: newVal }` expand to
// the identical triple set. This makes the codemod mirror jsonld EXACTLY — it
// transparently handles datatype/@id coercion, @vocab enums, multi-context term
// shadowing (e.g. materialComposition in two namespaces), and cross-context
// coercion disagreements. Anything not provably identical is left bare.
async function probeEqual(ctxRef, key, val, curie, newVal) {
  const mk = (k, v) => ({ '@context': ctxRef, '@id': 'urn:probe:s', [k]: v });
  const set = async (d) => new Set((await jsonld.toRDF(await jsonld.expand(d, { documentLoader }), { format: 'application/n-quads' })).split('\n').filter(Boolean));
  const a = await set(mk(key, val));
  const b = await set(mk(curie, newVal));
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

async function rewrite(node, map, ctxRef) {
  if (Array.isArray(node)) return Promise.all(node.map((n) => rewrite(n, map, ctxRef)));
  if (!node || typeof node !== 'object') return node;

  // Same-target collision: if two distinct bare keys in this node resolve to the
  // same target CURIE (synonyms, e.g. shortName + fullName -> schema:name),
  // renaming both collapses them into one JSON key and drops a triple. The
  // per-key probe checks each key in isolation and can't see this, so guard here:
  // any CURIE reached by >1 key keeps all its source keys bare.
  const targetCount = new Map();
  for (const key of Object.keys(node)) {
    if (key.startsWith('@') || key === 'id' || key === 'type' || key.includes(':') || key.startsWith('_')) continue;
    const c = classify(defOf(map, key));
    if (c) targetCount.set(c.curie, (targetCount.get(c.curie) || 0) + 1);
  }

  const out = {};
  for (const [key, val] of Object.entries(node)) {
    if (key === '@context') { out[key] = val; continue; }
    // masterDataAvailableFor is the ONE place gs1: is the assumed ambient vocab —
    // gs1 terms stay BARE there. Never prefix inside it; pass through untouched.
    if (key === 'masterDataAvailableFor' || key === 'gs1:masterDataAvailableFor') { out[key] = val; continue; }
    if (key === 'type' || key === '@type') {
      // Class values: rewrite bare class aliases to their CURIE, probe-verified so
      // multi-context shadowing (e.g. RecycledContent in two namespaces) keeps the
      // value bare rather than re-pointing it.
      const conv = async (v) => {
        if (typeof v !== 'string' || v.includes(':')) return v;
        const c = classify(defOf(map, v));
        if (!c) return v;
        return (await probeEqual(ctxRef, '@type', v, '@type', c.curie)) ? c.curie : v;
      };
      out[key] = Array.isArray(val) ? await Promise.all(val.map(conv)) : await conv(val);
      continue;
    }
    if (key === 'id' || key === '@id' || key.startsWith('@')) { out[key] = await rewrite(val, map, ctxRef); continue; }
    if (key.startsWith('_')) { out[key] = val; continue; }
    if (key.includes(':')) { out[key] = await rewrite(val, map, ctxRef); continue; } // already prefixed
    const c = classify(defOf(map, key));
    if (!c || targetCount.get(c.curie) > 1) { out[key] = await rewrite(val, map, ctxRef); continue; }
    // Build the candidate rewritten value, then prove the rename is loss-free.
    let newVal;
    if (c.kind === 'enum') {
      const wrap = (v) => (typeof v === 'string' && resolveEnumValue(c.scoped, v) ? { '@id': resolveEnumValue(c.scoped, v) } : v);
      newVal = Array.isArray(val) ? val.map(wrap) : wrap(val);
    } else {
      newVal = val;
    }
    if (await probeEqual(ctxRef, key, val, c.curie, newVal)) {
      out[c.curie] = await rewrite(newVal, map, ctxRef);
    } else {
      out[key] = await rewrite(val, map, ctxRef); // not provably identical — keep bare
    }
  }
  return out;
}

async function nquadSet(doc) {
  const expanded = await jsonld.expand(doc, { documentLoader });
  const nq = await jsonld.toRDF(expanded, { format: 'application/n-quads' });
  return new Set(nq.split('\n').filter(Boolean));
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const filter = args.find((a) => !a.startsWith('--'));

  const files = [];
  const mods = ['common/core', 'common/interop', 'eu/battery', 'eu/textile', 'eu/electronics', 'eu/eudr', 'eu/detergent', 'eu/ppwr', 'eu/cpr', 'us/fsma204', 'upstream/gs1-rail'];
  for (const dir of mods) {
    for (const sub of ['examples', 'epcis']) {
      const full = path.join(ROOT, 'extensions', dir, sub);
      let names = [];
      try { names = await fs.readdir(full); } catch { continue; }
      for (const n of names) if (n.endsWith('.jsonld')) files.push(path.join(full, n));
    }
  }
  const targets = filter ? files.filter((f) => f.includes(filter)) : files;

  let ok = 0, skipped = 0, unchanged = 0;
  for (const file of targets) {
    const rel = path.relative(ROOT, file);
    const orig = JSON.parse(await fs.readFile(file, 'utf8'));
    const map = await buildTermMap(orig['@context']);
    const next = await rewrite(orig, map, orig['@context']);
    const before = await nquadSet(orig);
    const after = await nquadSet(next);
    const lostArr = [...before].filter((x) => !after.has(x));
    const gainArr = [...after].filter((x) => !before.has(x));
    if (JSON.stringify(orig) === JSON.stringify(next)) { console.log(`SAME   ${rel}`); unchanged++; continue; }
    if (lostArr.length || gainArr.length) {
      console.log(`DIFF!  ${rel}  (lost ${lostArr.length}, gained ${gainArr.length}) — NOT written`);
      lostArr.slice(0, 4).forEach((x) => console.log(`   - ${x.slice(0, 150)}`));
      gainArr.slice(0, 4).forEach((x) => console.log(`   + ${x.slice(0, 150)}`));
      skipped++;
      continue;
    }
    if (write) await fs.writeFile(file, JSON.stringify(next, null, 2) + '\n');
    console.log(`${write ? 'WROTE ' : 'OK    '} ${rel}  (semantically identical)`);
    ok++;
  }
  console.log(`\n${write ? '' : '[dry] '}rewritten-ok: ${ok}, gate-failed: ${skipped}, unchanged: ${unchanged}`);
  if (skipped) process.exitCode = 1;
}
main().catch((e) => { console.error(e); process.exit(1); });
