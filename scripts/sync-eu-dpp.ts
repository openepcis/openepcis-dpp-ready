/**
 * Sync the EU DPP Registry semantic data artifacts.
 *
 *   pnpm run sync:eu-dpp                       # download the pinned archive from the Commission
 *   pnpm run sync:eu-dpp -- --from <file.zip>  # use a local copy of the same archive
 *
 * NETWORK SYNC — NEVER RUN THIS AS PART OF A BULK REGENERATION. Sync on purpose, in its own
 * commit, and read the diff (see the note in sync-cirpass2.ts).
 *
 * SOURCE. The European Commission publishes the artifacts as one ZIP on the DPP resources page
 * (https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/resources-documentation_en).
 * Every IRI inside points at https://repository.product-passport.ec.europa.eu/, a host that had
 * no DNS record when release 1.0.0 came out (NXDOMAIN on 2026-11-02 from the zone's own name
 * servers), so the archive is the only source there is. The archive is pinned by SHA-256: a
 * download with another hash is refused, because the Commission replaces documents under the
 * same download link.
 *
 * OUTPUT.
 *   vendor/eu-dpp/<version>/                  verbatim archive content (core/, product/) plus
 *                                             MANIFEST.json (archive hash, per-file SHA-256)
 *   extensions/upstream/eu-dpp/ontology/eu-dpp.ttl
 *                                             every SKOS vocabulary of the release merged into one
 *                                             Turtle file, triples unchanged, for build:json,
 *                                             the vocabulary browser and vocab-sync
 *
 * Upstream IRIs are preserved, nothing is rebranded. Licence: EUPL-1.2, as stated in each
 * vocabulary.
 */

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import {
  cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync,
} from "fs";
import { tmpdir } from "os";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { Parser, Writer, type Quad } from "n3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** The pinned release. Bump deliberately, in the sync commit, together with the minima below. */
const RELEASE = {
  version: "1.0.0",
  issued: "2026-10-30",
  title: "DPP Registry – Semantic Data Artifacts",
  url:
    "https://single-market-economy.ec.europa.eu/document/download/5fad8a3a-9c18-486d-be02-01eb540e91e8_en" +
    "?filename=DPP%20Registry%20%E2%80%93%20Semantic%20Data%20Artifacts.zip",
  sha256: "46b753cdcdf11d3dba9d045c2c8410eabe41125c741e5240499c0ca0fccd2ddd",
};

const BASE = "https://repository.product-passport.ec.europa.eu/";
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const SKOS_CONCEPT = "http://www.w3.org/2004/02/skos/core#Concept";

/**
 * Minimum number of skos:Concept per vocabulary file. A release that drops below refuses to sync,
 * so a broken export (an empty file, a renamed scheme) is never written into the mirror unnoticed.
 */
const MIN_CONCEPTS: Record<string, number> = {
  "core/1.0.0/vocabs/core-vocabulary.ttl": 11,
  "core/1.0.0/vocabs/common-vocabulary.ttl": 11,
  "core/1.0.0/vocabs/measurement-unit.ttl": 11,
  "core/1.0.0/vocabs/critical-raw-material.ttl": 34,
  "core/1.0.0/vocabs/granularity-level.ttl": 3,
  "core/1.0.0/vocabs/instance-status.ttl": 2,
  "core/1.0.0/vocabs/information-type.ttl": 2,
  "core/1.0.0/vocabs/observed-characteristic.ttl": 1,
  "core/1.0.0/vocabs/core-error-code.ttl": 6,
  "core/1.0.0/vocabs/common-error-code.ttl": 13,
  "product/batteries/1.0.0/vocabs/battery-vocabulary.ttl": 88,
  "product/batteries/1.0.0/vocabs/battery-category.ttl": 3,
  "product/batteries/1.0.0/vocabs/battery-chemistry.ttl": 10,
  "product/batteries/1.0.0/vocabs/battery-chemical-symbol.ttl": 3,
  "product/batteries/1.0.0/vocabs/battery-status.ttl": 5,
  "product/batteries/1.0.0/vocabs/battery-information-type.ttl": 3,
  "product/batteries/1.0.0/vocabs/battery-error-code.ttl": 88,
};

const VENDOR_DIR = join(ROOT, "vendor", "eu-dpp", RELEASE.version);
const MIRROR_TTL = join(ROOT, "extensions", "upstream", "eu-dpp", "ontology", "eu-dpp.ttl");

const PREFIXES: Record<string, string> = {
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  owl: "http://www.w3.org/2002/07/owl#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  skos: "http://www.w3.org/2004/02/skos/core#",
  dct: "http://purl.org/dc/terms/",
  euvoc: "http://publications.europa.eu/ontology/euvoc#",
  "concept-status": "http://publications.europa.eu/resource/authority/concept-status/",
};

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

async function readArchive(from: string | undefined): Promise<Buffer> {
  if (from) return readFileSync(from);
  const res = await fetch(RELEASE.url);
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status} ${RELEASE.url}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Prefix for a vocabulary namespace: the scheme name (`battery-chemistry`), as the Commission writes it. */
function schemePrefix(ns: string): string {
  const m = ns.match(/\/vocabs\/([a-z-]+)#$/);
  return m ? m[1] : "";
}

async function main() {
  const args = process.argv.slice(2);
  const fromIdx = args.indexOf("--from");
  const from = fromIdx >= 0 ? args[fromIdx + 1] : undefined;

  const zip = await readArchive(from);
  const hash = sha256(zip);
  if (hash !== RELEASE.sha256) {
    throw new Error(
      `archive hash ${hash} does not match the pinned release ${RELEASE.version} (${RELEASE.sha256}). ` +
        "The Commission may have replaced the file: inspect it, then bump RELEASE on purpose.",
    );
  }

  const tmp = mkdtempSync(join(tmpdir(), "eu-dpp-"));
  try {
    const zipPath = join(tmp, "release.zip");
    writeFileSync(zipPath, zip);
    const unpacked = join(tmp, "x");
    mkdirSync(unpacked);
    execFileSync("unzip", ["-q", zipPath, "-d", unpacked]);
    for (const top of ["core", "product"]) {
      if (!existsSync(join(unpacked, top))) throw new Error(`archive has no ${top}/ directory`);
    }

    // Guard: every known vocabulary is present and carries at least its expected concepts.
    const vocabFiles = walk(unpacked).filter((p) => /\/vocabs\/[^/]+\.ttl$/.test(p));
    const byRel = new Map(vocabFiles.map((p) => [relative(unpacked, p), p]));
    for (const [rel, min] of Object.entries(MIN_CONCEPTS)) {
      const p = byRel.get(rel);
      if (!p) throw new Error(`vocabulary missing from the archive: ${rel}`);
    }
    const unknown = [...byRel.keys()].filter((rel) => !(rel in MIN_CONCEPTS));
    if (unknown.length) {
      throw new Error(`vocabularies not known to this script: ${unknown.join(", ")}; add them to MIN_CONCEPTS`);
    }

    const quads: Quad[] = [];
    const namespaces = new Set<string>();
    for (const [rel, p] of [...byRel.entries()].sort()) {
      const parser = new Parser({ baseIRI: BASE });
      const fileQuads = parser.parse(readFileSync(p, "utf8"));
      const concepts = new Set(
        fileQuads
          .filter((q) => q.predicate.value === RDF_TYPE && q.object.value === SKOS_CONCEPT)
          .map((q) => q.subject.value),
      );
      if (concepts.size < MIN_CONCEPTS[rel]) {
        throw new Error(`${rel}: ${concepts.size} concepts, expected at least ${MIN_CONCEPTS[rel]}`);
      }
      for (const c of concepts) namespaces.add(c.substring(0, c.indexOf("#") + 1));
      quads.push(...fileQuads);
      console.log(`  ${rel}: ${concepts.size} concepts`);
    }

    // 1) Verbatim copy of the archive content.
    rmSync(VENDOR_DIR, { recursive: true, force: true });
    mkdirSync(VENDOR_DIR, { recursive: true });
    cpSync(join(unpacked, "core"), join(VENDOR_DIR, "core"), { recursive: true });
    cpSync(join(unpacked, "product"), join(VENDOR_DIR, "product"), { recursive: true });
    const files = walk(VENDOR_DIR)
      .filter((p) => !p.endsWith("MANIFEST.json"))
      .map((p) => ({ path: relative(VENDOR_DIR, p), sha256: sha256(readFileSync(p)) }));
    writeFileSync(
      join(VENDOR_DIR, "MANIFEST.json"),
      JSON.stringify(
        {
          $comment: "GENERATED by scripts/sync-eu-dpp.ts - do not edit.",
          title: RELEASE.title,
          version: RELEASE.version,
          issued: RELEASE.issued,
          source: RELEASE.url,
          archiveSha256: RELEASE.sha256,
          license: "https://interoperable-europe.ec.europa.eu/collection/eupl/eupl-text-eupl-12",
          files,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(`vendor/eu-dpp/${RELEASE.version}: ${files.length} files`);

    // 2) Merged SKOS mirror.
    const prefixes: Record<string, string> = { ...PREFIXES };
    for (const ns of [...namespaces].sort()) {
      const p = schemePrefix(ns);
      if (p) prefixes[p] = ns;
    }
    const writer = new Writer({ prefixes });
    writer.addQuads(quads);
    const body: string = await new Promise((resolve, reject) =>
      writer.end((err, out) => (err ? reject(err) : resolve(out))),
    );
    const header =
      `# GENERATED FILE - do not edit. Source: ${RELEASE.title} ${RELEASE.version} (${RELEASE.issued}),\n` +
      `# archive SHA-256 ${RELEASE.sha256}, generator: scripts/sync-eu-dpp.ts (pnpm run sync:eu-dpp).\n` +
      `# The ${byRel.size} SKOS vocabularies of the release, merged; triples unchanged. Licence EUPL-1.2.\n\n`;
    mkdirSync(dirname(MIRROR_TTL), { recursive: true });
    writeFileSync(MIRROR_TTL, header + body);
    console.log(`${relative(ROOT, MIRROR_TTL)}: ${quads.length} triples, ${namespaces.size} namespaces`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
