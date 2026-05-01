#!/usr/bin/env tsx
/**
 * Convert single-language language-map literals like `{"en": "..."}` to
 * value-object form `{"@value": "...", "@language": "en"}` so they expand
 * cleanly even without an `@container: @language` mapping.
 *
 * Only rewrites objects that have exactly one key, where the key is a
 * 2-3 letter language tag (e.g. `en`, `de`, `pt-BR` simplified to `pt`),
 * and the value is a plain string.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Whitelist of language tags we'll auto-convert. Conservative — anything else
// stays as-is to avoid clobbering `{id: ...}`, `{cn: ...}` (codes), etc.
const LANG_TAGS = new Set([
  'en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'zh', 'ko', 'ar',
  'sv', 'da', 'fi', 'no', 'cs', 'hu', 'ro', 'el', 'tr', 'he', 'th', 'vi', 'uk',
  'en-US', 'en-GB', 'pt-BR', 'pt-PT', 'zh-CN', 'zh-TW', 'fr-CA',
]);

// Property names that legitimately carry textual values which may use language maps.
const TEXT_PROPS = new Set([
  'productName', 'productDescription', 'physicalLocationName', 'organizationName',
  'name', 'description', 'label', 'title', 'comment', 'consumerRecyclingInstructions',
  'streetAddress', 'addressLocality', 'postalCode', 'addressCountry',
  'certificationAgency', 'certificationStandard', 'commodityType', 'speciesCommonName',
  'shortName', 'fullName', 'clearName', 'commercialName', 'componentName',
]);

function transformValue(parentKey: string | null, node: any): any {
  if (Array.isArray(node)) return node.map((n) => transformValue(parentKey, n));
  if (node === null || typeof node !== 'object') return node;
  if (parentKey && TEXT_PROPS.has(parentKey)) {
    const keys = Object.keys(node);
    if (keys.every((k) => LANG_TAGS.has(k)) && keys.every((k) => typeof (node as any)[k] === 'string')) {
      if (keys.length === 1) {
        const k = keys[0];
        return { '@value': (node as any)[k], '@language': k };
      }
      return keys.map((k) => ({ '@value': (node as any)[k], '@language': k }));
    }
  }
  const out: any = {};
  for (const [k, v] of Object.entries(node)) out[k] = transformValue(k, v);
  return out;
}

function transform(node: any): any {
  return transformValue(null, node);
}

async function processFile(filePath: string): Promise<boolean> {
  const text = await fs.readFile(filePath, 'utf8');
  const doc = JSON.parse(text);
  const transformed = transform(doc);
  const newText = JSON.stringify(transformed, null, 2);
  const oldText = JSON.stringify(doc, null, 2);
  if (newText === oldText) return false;
  await fs.writeFile(filePath, newText + '\n', 'utf8');
  return true;
}

async function main() {
  const targets: string[] = [];
  const exts = [
    'extensions/eu/battery',
    'extensions/eu/textile',
    'extensions/eu/electronics',
    'extensions/eu/eudr',
    'extensions/eu/detergent',
    'extensions/us/fsma204',
    'extensions/common/core',
    'extensions/common/interop',
  ];
  for (const dir of exts) {
    for (const sub of ['examples', 'epcis']) {
      const full = path.join(ROOT, dir, sub);
      try {
        const files = await fs.readdir(full);
        for (const f of files) if (f.endsWith('.jsonld')) targets.push(path.join(full, f));
      } catch {}
    }
  }

  let changed = 0;
  for (const t of targets) {
    if (await processFile(t)) {
      console.log(`fixed ${path.relative(ROOT, t)}`);
      changed++;
    }
  }
  console.log(`\nProcessed ${targets.length} files, ${changed} changed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
