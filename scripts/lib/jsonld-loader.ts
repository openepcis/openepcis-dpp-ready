/**
 * Offline, deterministic JSON-LD document loader for the repo's own artifacts.
 *
 * Every context this project publishes is resolved from the working tree rather
 * than the network, so the gates that expand example documents produce the same
 * verdict on a laptop, in CI and on a machine with no route to
 * ref.openepcis.org. Upstream contexts come from the pinned snapshots under
 * vendor/gs1/ — the same trade-off the vocabulary guard makes with
 * scripts/vocab-snapshot.json.
 *
 * Contexts are auto-discovered from extensions/**\/context/*.jsonld, so a new
 * module (or a new context file in an existing one) is covered with no edit
 * here. Published URL convention: a context at
 * extensions/<path>/context/<name>.jsonld is served at
 * https://ref.openepcis.org/extensions/<path>/<name>.jsonld — the "context/"
 * segment is dropped.
 *
 * Shared by scripts/validate-jsonld-examples.ts and the SHACL gates
 * (scripts/lib/shacl-run.ts callers), which must agree on what a document
 * expands to; two loaders would let the two gates disagree.
 *
 * Not to be merged with scripts/en18223/node-io.ts, which keeps its own
 * EXPLICIT url→file table on purpose: the browser demo iterates URL_TO_FILE to
 * bundle contexts.json with esbuild, so that map is a bundling manifest as much
 * as a loader and cannot be replaced by filesystem discovery.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Contexts served from a host other than ref.openepcis.org, plus the upstream snapshots. */
const SPECIAL_HOST_MAP: Record<string, string> = {
  "https://gs1-epcis-reg.org/rail/rail-context.jsonld":
    "extensions/upstream/gs1-rail/context/rail-context.jsonld",
  "https://ref.gs1.org/standards/epcis/epcis-context.jsonld": "vendor/gs1/epcis-context.jsonld",
  "https://ref.gs1.org/voc/": "vendor/gs1/gs1Voc.jsonld",
};

export interface LoadedDocument {
  contextUrl?: string;
  documentUrl: string;
  document: unknown;
}

export type JsonLdDocumentLoader = (url: string) => Promise<LoadedDocument>;

/** Map every published context URL to its file in the working tree. */
export async function buildContextMap(): Promise<Record<string, string>> {
  const map: Record<string, string> = { ...SPECIAL_HOST_MAP };
  const extRoot = path.join(ROOT, "extensions");
  for (const rel of await fs.readdir(extRoot, { recursive: true })) {
    const relStr = String(rel).split(path.sep).join("/");
    const m = relStr.match(/^(.+)\/context\/([^/]+\.jsonld)$/);
    if (!m) continue;
    map[`https://ref.openepcis.org/extensions/${m[1]}/${m[2]}`] = `extensions/${relStr}`;
  }
  return map;
}

const remoteCache = new Map<string, unknown>();

async function loadRemote(url: string): Promise<unknown> {
  if (remoteCache.has(url)) return remoteCache.get(url);
  const res = await fetch(url, { headers: { Accept: "application/ld+json, application/json" } });
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  const doc = JSON.parse(await res.text());
  remoteCache.set(url, doc);
  return doc;
}

/**
 * Build a loader over the given URL→file map. Anything not in the map falls
 * through to the network, which is how a genuinely foreign context still
 * resolves; every URL this project owns should hit the map.
 */
export function makeDocumentLoader(urlToFile: Record<string, string>): JsonLdDocumentLoader {
  return async (url: string) => {
    const local = urlToFile[url];
    if (local) {
      const text = await fs.readFile(path.join(ROOT, local), "utf8");
      return { contextUrl: undefined, documentUrl: url, document: JSON.parse(text) };
    }
    return { contextUrl: undefined, documentUrl: url, document: await loadRemote(url) };
  };
}

/** Convenience: discover the contexts and return a ready loader. */
export async function offlineDocumentLoader(): Promise<JsonLdDocumentLoader> {
  return makeDocumentLoader(await buildContextMap());
}
