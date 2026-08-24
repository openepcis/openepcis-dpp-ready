/**
 * Node-only IO helpers for the EN 18223 converter: an fs-based JSON-LD
 * documentLoader and the property->rdfs:range index parsed from the module
 * TTLs with n3. Side-effect-free (no CLI), so both the CLI
 * (scripts/derive-en18223.ts) and the range-index builder
 * (scripts/build-en18223-rangeindex.ts) can import it.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Parser, Store, DataFactory } from "n3";
import type { DocumentLoader } from "./derive-core.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..");
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";

// Single source of truth: every served OpenEPCIS context URL mapped to its
// local file. The CLI documentLoader reads these from disk (so it resolves
// offline) and the demo-data builder bundles the same set into contexts.json,
// keeping the CLI and the browser demo on identical context documents.
//
// A URL MISSING HERE DOES NOT FAIL, IT GOES TO THE NETWORK. That is the whole
// hazard: rail-bridge-context.jsonld was absent for as long as it existed, and
// nothing showed it, because the published host answers. So two rail EPCIS
// artifacts were being validated against whatever ref.openepcis.org served
// rather than against the file in this repository, and the build quietly
// depended on that host being up. It surfaced only when a namespace change
// pointed the same URL at a host that does not exist yet.
//
// Keep this map complete. To check: collect every ref.openepcis.* context URL
// referenced under extensions/ and vct/ and assert each one appears here.
export const URL_TO_FILE: Record<string, string> = {
  "https://ref.openepcis.org/extensions/common/interop/rail-bridge-context.jsonld":
    "extensions/common/interop/context/rail-bridge-context.jsonld",
  "https://ref.openepcis.org/extensions/common/core/dpp-core-context.jsonld":
    "extensions/common/core/context/dpp-core-context.jsonld",
  "https://ref.openepcis.org/extensions/common/core/dpp-operational-context.jsonld":
    "extensions/common/core/context/dpp-operational-context.jsonld",
  "https://ref.openepcis.org/extensions/common/core/dpp-core-shortcut-context.jsonld":
    "extensions/common/core/context/dpp-core-shortcut-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/battery/battery-shortcut-context.jsonld":
    "extensions/eu/battery/context/battery-shortcut-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/textile/textile-shortcut-context.jsonld":
    "extensions/eu/textile/context/textile-shortcut-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/electronics/electronics-shortcut-context.jsonld":
    "extensions/eu/electronics/context/electronics-shortcut-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/eudr/eudr-shortcut-context.jsonld":
    "extensions/eu/eudr/context/eudr-shortcut-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/ppwr/ppwr-shortcut-context.jsonld":
    "extensions/eu/ppwr/context/ppwr-shortcut-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/cpr/cpr-shortcut-context.jsonld":
    "extensions/eu/cpr/context/cpr-shortcut-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/detergent/detergent-shortcut-context.jsonld":
    "extensions/eu/detergent/context/detergent-shortcut-context.jsonld",
  "https://ref.openepcis.org/extensions/us/fsma204/fsma204-shortcut-context.jsonld":
    "extensions/us/fsma204/context/fsma204-shortcut-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/battery/battery-operational-context.jsonld":
    "extensions/eu/battery/context/battery-operational-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/textile/textile-operational-context.jsonld":
    "extensions/eu/textile/context/textile-operational-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/electronics/electronics-operational-context.jsonld":
    "extensions/eu/electronics/context/electronics-operational-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/eudr/eudr-operational-context.jsonld":
    "extensions/eu/eudr/context/eudr-operational-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/ppwr/ppwr-operational-context.jsonld":
    "extensions/eu/ppwr/context/ppwr-operational-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/cpr/cpr-operational-context.jsonld":
    "extensions/eu/cpr/context/cpr-operational-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/detergent/detergent-operational-context.jsonld":
    "extensions/eu/detergent/context/detergent-operational-context.jsonld",
  "https://ref.openepcis.org/extensions/us/fsma204/fsma204-operational-context.jsonld":
    "extensions/us/fsma204/context/fsma204-operational-context.jsonld",
  "https://ref.openepcis.org/extensions/common/core/gs1-shortcuts-context.jsonld":
    "extensions/common/core/context/gs1-shortcuts-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/battery/battery-context.jsonld":
    "extensions/eu/battery/context/battery-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/battery/battery-context-batterypass-bridge.jsonld":
    "extensions/eu/battery/context/battery-context-batterypass-bridge.jsonld",
  "https://ref.openepcis.org/extensions/eu/textile/textile-context.jsonld":
    "extensions/eu/textile/context/textile-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/electronics/electronics-context.jsonld":
    "extensions/eu/electronics/context/electronics-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/eudr/eudr-context.jsonld":
    "extensions/eu/eudr/context/eudr-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/ppwr/ppwr-context.jsonld":
    "extensions/eu/ppwr/context/ppwr-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/cpr/cpr-context.jsonld":
    "extensions/eu/cpr/context/cpr-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/detergent/detergent-context.jsonld":
    "extensions/eu/detergent/context/detergent-context.jsonld",
  "https://ref.openepcis.org/extensions/us/fsma204/fsma204-context.jsonld":
    "extensions/us/fsma204/context/fsma204-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/iron-steel/iron-steel-context.jsonld":
    "extensions/eu/iron-steel/context/iron-steel-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/iron-steel/iron-steel-shortcut-context.jsonld":
    "extensions/eu/iron-steel/context/iron-steel-shortcut-context.jsonld",
  "https://ref.openepcis.org/extensions/eu/iron-steel/iron-steel-operational-context.jsonld":
    "extensions/eu/iron-steel/context/iron-steel-operational-context.jsonld",
};

// Loader-only mappings (NOT bundled into the browser demo's contexts.json, which
// iterates URL_TO_FILE). The GS1 Web Vocabulary context is large and only needed
// by upstream-referencing docs (e.g. the resolver Organization records); vendoring
// it keeps the CLI/tooling fully offline and deterministic.
const LOADER_ONLY: Record<string, string> = {
  "https://ref.gs1.org/voc/": "vendor/gs1/gs1Voc.jsonld",
  "https://ref.gs1.org/voc/data/gs1Voc.jsonld": "vendor/gs1/gs1Voc.jsonld",
  "https://ref.gs1.org/standards/epcis/epcis-context.jsonld": "vendor/gs1/epcis-context.jsonld",
  "https://gs1-epcis-reg.org/rail/rail-context.jsonld":
    "extensions/upstream/gs1-rail/context/rail-context.jsonld",
};

const remoteCache = new Map<string, any>();
export const documentLoader: DocumentLoader = async (url: string) => {
  const local = URL_TO_FILE[url] ?? LOADER_ONLY[url];
  if (local) {
    const text = await fs.readFile(path.join(ROOT, local), "utf8");
    return { contextUrl: undefined, documentUrl: url, document: JSON.parse(text) };
  }
  // OUR OWN namespace must never reach the network. A context we publish has a
  // file in this repository, so a miss is a gap in the map above, not a reason
  // to ask the internet what we think. Falling through silently meant the build
  // validated an artifact against the DEPLOYED context instead of the committed
  // one, and passed only as long as the host was up. Foreign hosts stay
  // fetchable: we do not hold their documents.
  if (/^https:\/\/ref\.openepcis\.[a-z]+\//.test(url)) {
    throw new Error(
      `${url} is one of ours but is not in URL_TO_FILE, so it would be fetched over the network. ` +
        `Add it to scripts/en18223/node-io.ts pointing at the file in this repository.`,
    );
  }
  if (!remoteCache.has(url)) {
    const res = await fetch(url, { headers: { Accept: "application/ld+json, application/json" } });
    if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
    remoteCache.set(url, JSON.parse(await res.text()));
  }
  return { contextUrl: undefined, documentUrl: url, document: remoteCache.get(url) };
};

const MODULE_TTLS = [
  "extensions/common/core/ontology/dpp-core.ttl",
  "extensions/eu/battery/ontology/battery.ttl",
  "extensions/eu/eudr/ontology/eudr.ttl",
  "extensions/eu/textile/ontology/textile.ttl",
  "extensions/eu/electronics/ontology/electronics.ttl",
  "extensions/eu/detergent/ontology/detergent.ttl",
  "extensions/eu/ppwr/ontology/ppwr.ttl",
  "extensions/eu/cpr/ontology/cpr.ttl",
  "extensions/us/fsma204/ontology/fsma204.ttl",
];

/** property IRI -> rdfs:range IRI, parsed from all module TTLs. */
export async function buildRangeIndex(): Promise<Map<string, string>> {
  const index = new Map<string, string>();
  const parser = new Parser();
  for (const rel of MODULE_TTLS) {
    let ttl: string;
    try { ttl = await fs.readFile(path.join(ROOT, rel), "utf8"); } catch { continue; }
    const store = new Store(parser.parse(ttl));
    for (const q of store.getQuads(null, DataFactory.namedNode(`${RDFS}range`), null, null)) {
      index.set(q.subject.value, q.object.value);
    }
  }
  return index;
}
