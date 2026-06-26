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

// Context IRI → local file. Auto-discovered from every extensions/**/context/*.jsonld
// so a new module (or a new context file) is covered with no edit here — the old
// hardcoded map silently skipped iron-steel and would skip any future module.
// Published URL convention: a context at extensions/<path>/context/<name>.jsonld is
// served at https://ref.openepcis.io/extensions/<path>/<name>.jsonld (no "context/").
// Non-openepcis hosts (e.g. the GS1 Rail mirror) are listed explicitly below.
const SPECIAL_HOST_MAP: Record<string, string> = {
  'https://gs1-epcis-reg.org/rail/rail-context.jsonld':
    'extensions/upstream/gs1-rail/context/rail-context.jsonld',
};

async function buildContextMap(): Promise<Record<string, string>> {
  const map: Record<string, string> = { ...SPECIAL_HOST_MAP };
  const extRoot = path.join(ROOT, 'extensions');
  const entries = await fs.readdir(extRoot, { recursive: true });
  for (const rel of entries) {
    const relStr = String(rel).split(path.sep).join('/');
    const m = relStr.match(/^(.+)\/context\/([^/]+\.jsonld)$/);
    if (!m) continue;
    const url = `https://ref.openepcis.io/extensions/${m[1]}/${m[2]}`;
    map[url] = `extensions/${relStr}`;
  }
  return map;
}

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

function makeDocumentLoader(urlToFile: Record<string, string>) {
  return async (url: string) => {
    if (urlToFile[url]) {
      const localPath = path.join(ROOT, urlToFile[url]);
      const text = await fs.readFile(localPath, 'utf8');
      return { contextUrl: undefined, documentUrl: url, document: JSON.parse(text) };
    }
    const doc = await loadRemote(url);
    return { contextUrl: undefined, documentUrl: url, document: doc };
  };
}
type DocumentLoader = ReturnType<typeof makeDocumentLoader>;

interface DropEvent {
  property: string;
  expandedProperty: string;
}

async function validateFile(filePath: string, documentLoader: DocumentLoader) {
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
  // Auto-discover every examples/ and epcis/ JSON-LD under extensions/ (no
  // hardcoded module list — new modules are covered automatically).
  const extRoot = path.join(ROOT, 'extensions');
  const targets: string[] = [];
  for (const rel of await fs.readdir(extRoot, { recursive: true })) {
    const relStr = String(rel).split(path.sep).join('/');
    if (/(^|\/)(examples|epcis)\/[^/]+\.jsonld$/.test(relStr)) {
      targets.push(path.join(extRoot, relStr));
    }
  }
  targets.sort();

  const urlToFile = await buildContextMap();
  const documentLoader = makeDocumentLoader(urlToFile);

  const filter = process.argv[2];
  const filtered = filter ? targets.filter((t) => t.includes(filter)) : targets;

  console.log(`Validating ${filtered.length} files...\n`);

  let totalDropped = 0;
  let totalErrors = 0;

  for (const t of filtered) {
    const r = await validateFile(t, documentLoader);
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
