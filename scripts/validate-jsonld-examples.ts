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
import { offlineDocumentLoader, type JsonLdDocumentLoader } from './lib/jsonld-loader.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

type DocumentLoader = JsonLdDocumentLoader;

interface DropEvent {
  code: string;
  property: string;
  expandedProperty?: string;
}

// Codes that mean a term/value is dropped or expands to a relative (broken) IRI
// — i.e. the document does NOT cleanly expand on the JSON-LD Playground. Other
// jsonld events (e.g. "invalid @language value", where the text still survives)
// are surfaced as WARN but don't fail the build.
const FATAL_CODES = new Set<string>([
  'invalid property',
  'relative @id reference',
  'relative @type reference',
  'relative @vocab mapping',
]);

// Recursively drop underscore-prefixed editorial keys (e.g. _comment).
function stripEditorial(o: any): any {
  if (Array.isArray(o)) return o.map(stripEditorial);
  if (o && typeof o === 'object') {
    return Object.fromEntries(
      Object.entries(o).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [k, stripEditorial(v)]),
    );
  }
  return o;
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
  // Editorial keys (underscore-prefixed, e.g. _comment) are intentional
  // documentation, not data; they never expand. Strip them before expanding so
  // they are not reported as lost properties (the round-trip gate does the same).
  raw = stripEditorial(raw);

  const drops: DropEvent[] = [];

  // Capture EVERY expansion event, not just "invalid property". jsonld also
  // signals data loss / mangling via "relative IRI after expansion" (a term that
  // expands to a non-absolute IRI — silently dropped on the Playground), reserved
  // terms, null @value, etc. A document that "completely expands" emits none.
  const eventHandler = ({ event, next }: any) => {
    if (event && event.code) {
      const det = event.details ?? {};
      const subject = det.property ?? det.term ?? det.value ?? det.id ?? det.relativeIri ?? '?';
      drops.push({ code: event.code, property: String(subject), expandedProperty: det.expandedProperty });
    }
    next();
  };

  try {
    // safe:false so we collect ALL events in one pass (safe:true throws on the first).
    await jsonld.expand(raw, { documentLoader, eventHandler, safe: false });
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
    // One optional subdirectory level so examples/organizations/*.jsonld is covered too.
    if (/(^|\/)(examples|epcis)\/([^/]+\/)?[^/]+\.jsonld$/.test(relStr)) {
      targets.push(path.join(extRoot, relStr));
    }
  }
  targets.sort();

  const documentLoader = await offlineDocumentLoader();

  const filter = process.argv[2];
  const filtered = filter ? targets.filter((t) => t.includes(filter)) : targets;

  console.log(`Validating ${filtered.length} files...\n`);

  let totalDropped = 0;
  let totalErrors = 0;
  const codeTally = new Map<string, number>();

  for (const t of filtered) {
    const r = await validateFile(t, documentLoader);
    if (r.error) {
      totalErrors++;
      console.log(`ERROR  ${r.file}: ${r.error}`);
    } else {
      const fatal = r.drops.filter((d) => FATAL_CODES.has(d.code));
      const warn = r.drops.filter((d) => !FATAL_CODES.has(d.code));
      for (const d of r.drops) codeTally.set(d.code, (codeTally.get(d.code) ?? 0) + 1);
      const fmt = (list: DropEvent[]) => {
        const c = new Map<string, number>();
        for (const d of list) {
          const key = `${d.code}: ${d.property}`;
          c.set(key, (c.get(key) ?? 0) + 1);
        }
        return [...c.entries()].map(([p, n]) => (n > 1 ? `${p}×${n}` : p)).join('; ');
      };
      if (fatal.length) {
        totalDropped += fatal.length;
        console.log(`DROP   ${r.file}: ${fmt(fatal)}`);
      } else if (warn.length) {
        console.log(`WARN   ${r.file}: ${fmt(warn)}`);
      } else {
        console.log(`OK     ${r.file}`);
      }
    }
  }

  console.log(`\nSummary: ${filtered.length} files, ${totalErrors} errors, ${totalDropped} lost properties (fatal).`);
  if (codeTally.size) {
    console.log('All expansion events: ' + [...codeTally.entries()].map(([c, n]) => `${c}=${n}`).join(', '));
  }
  if (totalErrors || totalDropped) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
