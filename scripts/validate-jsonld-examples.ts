#!/usr/bin/env tsx
/**
 * Validate every example/EPCIS JSON-LD file by expanding it with the JSON-LD
 * library's eventHandler, which surfaces every property that doesn't expand
 * to an absolute IRI or keyword (i.e. would be silently dropped during
 * processing). Anything that survives can be round-tripped in the JSON-LD
 * Playground.
 *
 * Usage: tsx scripts/validate-jsonld-examples.ts [filter-substring]
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jsonld from 'jsonld';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const URL_TO_FILE: Record<string, string> = {
  'https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld':
    'extensions/common/core/context/dpp-core-context.jsonld',
  'https://ref.openepcis.io/extensions/common/core/gs1-shortcuts-context.jsonld':
    'extensions/common/core/context/gs1-shortcuts-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/battery/battery-context.jsonld':
    'extensions/eu/battery/context/battery-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/battery/battery-context-scientific.jsonld':
    'extensions/eu/battery/context/battery-context-scientific.jsonld',
  'https://ref.openepcis.io/extensions/eu/battery/battery-context-batterypass-bridge.jsonld':
    'extensions/eu/battery/context/battery-context-batterypass-bridge.jsonld',
  'https://ref.openepcis.io/extensions/eu/battery/battery-context-to-batterypass.jsonld':
    'extensions/eu/battery/context/battery-context-to-batterypass.jsonld',
  'https://ref.openepcis.io/extensions/eu/textile/textile-context.jsonld':
    'extensions/eu/textile/context/textile-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/textile/textile-context-pefcr-bridge.jsonld':
    'extensions/eu/textile/context/textile-context-pefcr-bridge.jsonld',
  'https://ref.openepcis.io/extensions/eu/electronics/electronics-context.jsonld':
    'extensions/eu/electronics/context/electronics-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/eudr/eudr-context.jsonld':
    'extensions/eu/eudr/context/eudr-context.jsonld',
  'https://ref.openepcis.io/extensions/eu/detergent/detergent-context.jsonld':
    'extensions/eu/detergent/context/detergent-context.jsonld',
  'https://ref.openepcis.io/extensions/us/fsma204/fsma204-context.jsonld':
    'extensions/us/fsma204/context/fsma204-context.jsonld',
  'https://ref.openepcis.io/extensions/common/interop/untp-bridge-context.jsonld':
    'extensions/common/interop/context/untp-bridge-context.jsonld',
  'https://ref.openepcis.io/extensions/common/interop/jtc24-bridge-context.jsonld':
    'extensions/common/interop/context/jtc24-bridge-context.jsonld',
  'https://ref.openepcis.io/extensions/common/interop/cirpass2-bridge-context.jsonld':
    'extensions/common/interop/context/cirpass2-bridge-context.jsonld',
};

const remoteCache = new Map<string, any>();

async function loadRemote(url: string): Promise<any> {
  if (remoteCache.has(url)) return remoteCache.get(url);
  const res = await fetch(url, { headers: { Accept: 'application/ld+json, application/json' } });
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  const text = await res.text();
  const doc = JSON.parse(text);
  remoteCache.set(url, doc);
  return doc;
}

const documentLoader = async (url: string) => {
  if (URL_TO_FILE[url]) {
    const localPath = path.join(ROOT, URL_TO_FILE[url]);
    const text = await fs.readFile(localPath, 'utf8');
    return { contextUrl: undefined, documentUrl: url, document: JSON.parse(text) };
  }
  const doc = await loadRemote(url);
  return { contextUrl: undefined, documentUrl: url, document: doc };
};

interface DropEvent {
  property: string;
  expandedProperty: string;
}

async function validateFile(filePath: string) {
  const rel = path.relative(ROOT, filePath);
  let raw: any;
  try {
    raw = JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (e: any) {
    return { file: rel, drops: [] as DropEvent[], error: `parse: ${e.message}` };
  }
  if (!raw['@context']) return { file: rel, drops: [], error: 'no @context' };

  const drops: DropEvent[] = [];

  const eventHandler = ({ event, next }: any) => {
    if (event && event.code === 'invalid property') {
      const det = event.details ?? {};
      drops.push({ property: det.property, expandedProperty: det.expandedProperty });
    }
    next();
  };

  try {
    await jsonld.expand(raw, { documentLoader, eventHandler });
  } catch (e: any) {
    return { file: rel, drops, error: `expand: ${e.message}` };
  }
  return { file: rel, drops };
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

  const filter = process.argv[2];
  const filtered = filter ? targets.filter((t) => t.includes(filter)) : targets;

  console.log(`Validating ${filtered.length} files...\n`);

  let totalDropped = 0;
  let totalErrors = 0;

  for (const t of filtered) {
    const r = await validateFile(t);
    if (r.error) {
      totalErrors++;
      console.log(`ERROR  ${r.file}: ${r.error}`);
    } else if (r.drops.length) {
      const counts = new Map<string, number>();
      for (const d of r.drops) counts.set(d.property, (counts.get(d.property) ?? 0) + 1);
      totalDropped += r.drops.length;
      const summary = [...counts.entries()].map(([p, n]) => (n > 1 ? `${p}×${n}` : p)).join(', ');
      console.log(`DROP   ${r.file}: ${summary}`);
    } else {
      console.log(`OK     ${r.file}`);
    }
  }

  console.log(`\nSummary: ${filtered.length} files, ${totalErrors} errors, ${totalDropped} dropped properties.`);
  if (totalErrors || totalDropped) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
