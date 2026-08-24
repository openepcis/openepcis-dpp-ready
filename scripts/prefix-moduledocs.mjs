#!/usr/bin/env node
/**
 * THROWAWAY codemod — applies the canonical prefix rule to the embedded JSON-LD
 * example snippets in openepcis-web's `app/data/moduleDocumentation.ts`. Those
 * snippets are rendered on the ref-openepcis web pages and are maintained
 * separately from the `.jsonld` example files, so they had drifted to bare terms.
 *
 * Reuses the prefix-examples.mjs approach: for each `code:`/`exampleCode:` template
 * literal, parse the JSON, prefix every allowlisted vocabulary key (and type/id
 * class values, and @vocab enum values as {@id}) EXCEPT inside
 * masterDataAvailableFor, and prove each rename loss-free via a per-key N-Quads
 * probe. Run from the dpp repo (resolves the contexts locally via jsonld).
 *
 * Usage: node scripts/prefix-moduledocs.mjs <path-to-moduleDocumentation.ts> [--write]
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
  'https://ref.openepcis.io/extensions/eu/battery/battery-context-batterypass-bridge.jsonld': 'extensions/eu/battery/context/battery-context-batterypass-bridge.jsonld',
  'https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld': 'extensions/eu/textile/context/textile-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld': 'extensions/eu/electronics/context/electronics-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld': 'extensions/eu/eudr/context/eudr-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/detergent/detergent-context.jsonld': 'extensions/eu/detergent/context/detergent-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/ppwr/ppwr-context.jsonld': 'extensions/eu/ppwr/context/ppwr-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/cpr/cpr-context.jsonld': 'extensions/eu/cpr/context/cpr-context.jsonld',
  'https://ref.openepcis.io/extensions/us/fsma204/fsma204-context.jsonld': 'extensions/us/fsma204/context/fsma204-context.jsonld',
  'https://ref.openepcis.io/extensions/common/interop/untp-bridge-context.jsonld': 'extensions/common/interop/context/untp-bridge-context.jsonld',
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

const ALLOWED_PREFIXES = new Set(['gs1', 'schema', 'oec', 'oei', 'eubat', 'eudr', 'eutex', 'euelec', 'eudet', 'euppwr', 'eucpr', 'usfsma', 'rail']);
const allowedCurie = (c) => ALLOWED_PREFIXES.has(c.split(':')[0]);

async function mergeCtx(ref, map, seen) {
  if (typeof ref === 'string') {
    if (seen.has(ref)) return;
    seen.add(ref);
    try { await mergeCtx((await loadDoc(ref))['@context'], map, seen); } catch { /* unknown ctx: skip */ }
  } else if (Array.isArray(ref)) {
    for (const e of ref) await mergeCtx(e, map, seen);
  } else if (ref && typeof ref === 'object') Object.assign(map, ref);
}
async function buildTermMap(ctxRef) { const m = {}; await mergeCtx(ctxRef, m, new Set()); return m; }

// For fragment snippets that carry no @context, resolve terms against the union of
// all module contexts. The per-key gate still proves each rename loss-free; terms
// defined in two modules (shadowed) fail the gate and stay bare. The displayed
// fragment keeps no @context — only its keys gain prefixes.
const DEFAULT_CTX = [
  'https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/detergent/detergent-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/ppwr/ppwr-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/cpr/cpr-context.jsonld',
  'https://ref.openepcis.io/extensions/us/fsma204/fsma204-context.jsonld',
];

function classify(def) {
  if (def == null) return null;
  if (typeof def === 'string') {
    if (def.startsWith('@')) return null;
    if (def.includes(':') && !def.includes('://') && allowedCurie(def)) return { curie: def, kind: 'plain' };
    return null;
  }
  if (typeof def === 'object') {
    const id = def['@id'];
    if (typeof id !== 'string' || id.startsWith('@')) return null;
    const curie = id.includes('://') ? null : id;
    if (!curie || !allowedCurie(curie)) return null;
    if (def['@type'] === '@vocab') return { curie, kind: 'enum', scoped: def['@context'] || null };
    return { curie, kind: 'coerced' };
  }
  return null;
}
const defOf = (m, t) => (Object.prototype.hasOwnProperty.call(m, t) ? m[t] : undefined);
const resolveEnumValue = (scoped, v) => (scoped && typeof scoped[v] === 'string' ? scoped[v] : null);

async function probeEqual(ctxRef, key, val, curie, newVal) {
  const set = async (k, v) => new Set((await jsonld.toRDF(await jsonld.expand({ '@context': ctxRef, '@id': 'urn:probe:s', [k]: v }, { documentLoader }), { format: 'application/n-quads' })).split('\n').filter(Boolean));
  const a = await set(key, val), b = await set(curie, newVal);
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

async function rewrite(node, map, ctxRef) {
  if (Array.isArray(node)) return Promise.all(node.map((n) => rewrite(n, map, ctxRef)));
  if (!node || typeof node !== 'object') return node;
  const targetCount = new Map();
  for (const key of Object.keys(node)) {
    if (key.startsWith('@') || key === 'id' || key === 'type' || key.includes(':') || key.startsWith('_')) continue;
    const c = classify(defOf(map, key));
    if (c) targetCount.set(c.curie, (targetCount.get(c.curie) || 0) + 1);
  }
  const out = {};
  for (const [key, val] of Object.entries(node)) {
    if (key === '@context') { out[key] = val; continue; }
    if (key === 'masterDataAvailableFor' || key === 'gs1:masterDataAvailableFor') { out['masterDataAvailableFor'] = val; continue; }
    if (key === 'type' || key === '@type') {
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
    if (key.includes(':')) { out[key] = await rewrite(val, map, ctxRef); continue; }
    const c = classify(defOf(map, key));
    if (!c || targetCount.get(c.curie) > 1) { out[key] = await rewrite(val, map, ctxRef); continue; }
    let newVal;
    if (c.kind === 'enum') {
      const wrap = (v) => (typeof v === 'string' && resolveEnumValue(c.scoped, v) ? { '@id': resolveEnumValue(c.scoped, v) } : v);
      newVal = Array.isArray(val) ? val.map(wrap) : wrap(val);
    } else newVal = val;
    if (await probeEqual(ctxRef, key, val, c.curie, newVal)) out[c.curie] = await rewrite(newVal, map, ctxRef);
    else out[key] = await rewrite(val, map, ctxRef);
  }
  return out;
}

// Extract balanced {...} starting at index i (i points at '{').
function matchBraces(s, i) {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}') { depth--; if (depth === 0) return j + 1; }
  }
  return -1;
}

async function main() {
  const file = process.argv[2];
  const write = process.argv.includes('--write');
  if (!file) { console.error('usage: prefix-moduledocs.mjs <file> [--write]'); process.exit(1); }
  let text = await fs.readFile(file, 'utf8');

  const marker = /\b(code|exampleCode):\s*`/g;
  const edits = []; // {start,end,newText}
  let m, ok = 0, skip = 0, fail = 0;
  while ((m = marker.exec(text))) {
    const braceStart = text.indexOf('{', m.index + m[0].length);
    const close = text.indexOf('`', m.index + m[0].length);
    if (braceStart < 0 || (close >= 0 && close < braceStart)) continue; // not a JSON block
    const braceEnd = matchBraces(text, braceStart);
    if (braceEnd < 0) continue;
    const jsonText = text.slice(braceStart, braceEnd);
    let doc;
    try { doc = JSON.parse(jsonText); } catch { skip++; continue; }
    // Blocks with their own @context use it; context-free fragments resolve
    // against the merged all-modules context (but keep no @context themselves).
    const ctxRef = doc['@context'] || DEFAULT_CTX;
    let next;
    try { next = await rewrite(doc, await buildTermMap(ctxRef), ctxRef); }
    catch (e) { fail++; console.log(`  FAIL block @${braceStart}: ${e.message}`); continue; }
    const newJson = JSON.stringify(next, null, 2);
    if (newJson !== jsonText) { edits.push({ start: braceStart, end: braceEnd, newText: newJson }); ok++; }
  }
  // apply edits back-to-front
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) text = text.slice(0, e.start) + e.newText + text.slice(e.end);
  console.log(`blocks rewritten: ${ok}, skipped(non-JSON/no-ctx): ${skip}, failed: ${fail}`);
  if (write && edits.length) { await fs.writeFile(file, text); console.log('written.'); }
  else if (!write) console.log('[dry] not written');
}
main().catch((e) => { console.error(e); process.exit(1); });
