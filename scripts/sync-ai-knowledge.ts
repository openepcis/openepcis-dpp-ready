/**
 * Sync the term-knowledge corpus into the openepcis-ai-assistant service.
 *
 * The AI assistant grounds the term chat on the generated `{module}.json` documents from this
 * repository, bundled on its classpath under `term-knowledge/` and listed in `manifest.txt`.
 * TermKnowledgeIndex's own doc comment says "the build/sync step writes it"; this is that step,
 * which did not exist, so the corpus had drifted three days behind the ontologies and still
 * carried `gs1-masterdata`, a vocabulary this repo renamed to `served-fields` under a new
 * namespace when GS1 identity moved upstream.
 *
 * Two directions, treated differently on purpose:
 *   - a vocabulary the corpus carries whose source JSON this repo no longer produces is an ERROR:
 *     the AI would keep answering from a retired namespace;
 *   - a module this repo publishes that the corpus does not carry is a NOTE. `rail` is the standing
 *     example, deliberately absent because the browser's RESOLVER_VOCABS gives it no chat either.
 *
 * After writing, the service needs a rebuild AND a vector reingest: TermCorpusIngestor skips
 * ingestion when the OpenSearch index is already populated unless
 * `ai.term-chat.reingest-on-startup=true`, so a plain redeploy would serve the old embeddings.
 * The script prints the reminder rather than assuming.
 *
 * Usage:
 *   tsx scripts/sync-ai-knowledge.ts            # check only: report drift, exit 1 if any
 *   tsx scripts/sync-ai-knowledge.ts --write    # copy the source of truth over the corpus
 *
 * Override the location with OPENEPCIS_BUILD_PATH (repo root) or AI_TERM_KNOWLEDGE_PATH (the
 * term-knowledge resource directory itself).
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, resolve, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const CORPUS_RELATIVE =
  "modules/openepcis-ai-assistant/openepcis-ai-service/src/main/resources/term-knowledge";
const VOCABS_RELATIVE =
  "modules/openepcis-ai-assistant/openepcis-ai-core/src/main/java/io/openepcis/ai/core/knowledge/TermVocabs.java";

const buildRoot = process.env.OPENEPCIS_BUILD_PATH
  ? resolve(process.env.OPENEPCIS_BUILD_PATH)
  : resolve(repoRoot, "../openepcis-build");
const corpusDir = process.env.AI_TERM_KNOWLEDGE_PATH
  ? resolve(process.env.AI_TERM_KNOWLEDGE_PATH)
  : resolve(buildRoot, CORPUS_RELATIVE);

const write = process.argv.includes("--write");

if (!existsSync(corpusDir)) {
  console.error(`✗ term-knowledge corpus not found: ${corpusDir}`);
  console.error("  Point at the openepcis-build checkout with OPENEPCIS_BUILD_PATH=… " +
    "(or the resource directory with AI_TERM_KNOWLEDGE_PATH=…).");
  process.exit(1);
}

/** Every generated module vocabulary this repo publishes: file basename → path. */
function sources(): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".json") && full.includes("/json/")) out.set(e.name, full);
    }
  };
  walk(join(repoRoot, "extensions"));
  const served = join(repoRoot, "masterdata/served-fields/json/served-fields.json");
  if (existsSync(served)) out.set("served-fields.json", served);
  return out;
}

/**
 * The namespaces TermVocabs maps to a vocabulary name. The corpus and this map have to agree:
 * a record whose namespace is unmapped gets no vocab identity, so the chat cannot find it by
 * the (vocab, termCurie) key the browser sends.
 */
function mappedNamespaces(): Map<string, string> {
  const f = resolve(buildRoot, VOCABS_RELATIVE);
  const out = new Map<string, string>();
  if (!existsSync(f)) return out;
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/Map\.entry\(\s*(?:EXT \+ )?"([^"]+)"\s*,\s*new Vocab\("([^"]+)"/g)) {
    out.set(m[1], m[2]);
  }
  return out;
}

const SRC = sources();
const NS = mappedNamespaces();
const inCorpus = readdirSync(corpusDir).filter((f) => f.endsWith(".json")).sort();

const drift: string[] = [];
const retired: string[] = [];

for (const file of inCorpus) {
  const src = SRC.get(file);
  if (!src) { retired.push(file); continue; }
  const want = readFileSync(src);
  const have = readFileSync(join(corpusDir, file));
  if (!want.equals(have)) {
    drift.push(file);
    if (write) writeFileSync(join(corpusDir, file), want);
  }
}

// The manifest is what the index reads; keep it in step with the files present.
const manifestPath = join(corpusDir, "manifest.txt");
const keep = inCorpus.filter((f) => !retired.includes(f));
const wantManifest = keep.join("\n") + "\n";
const haveManifest = existsSync(manifestPath) ? readFileSync(manifestPath, "utf8") : "";
const manifestDrifted = haveManifest !== wantManifest;
if (manifestDrifted && write) writeFileSync(manifestPath, wantManifest);

const notCarried = [...SRC.keys()].filter((f) => !inCorpus.includes(f)).sort();

if (retired.length) {
  console.error(`✗ ${retired.length} corpus vocabulary/ies have no source of truth in this repo:`);
  for (const f of retired) {
    console.error(`  - ${f}`);
    const doc = JSON.parse(readFileSync(join(corpusDir, f), "utf8"));
    console.error(`      namespace: ${doc.namespace}`);
    const mapped = [...NS.entries()].find(([ns]) => doc.namespace?.includes(ns.replace(/^.*extensions\//, "")));
    if (mapped) console.error(`      still mapped in TermVocabs as "${mapped[1]}"`);
  }
  console.error("  The AI would keep grounding on a namespace this repo no longer publishes.");
  console.error("  Replace it with the vocabulary that superseded it, or drop the file, its");
  console.error("  manifest line and its TermVocabs entry together.");
  process.exit(1);
}

if (!drift.length && !manifestDrifted) {
  console.log(`✓ AI term-knowledge corpus matches the source of truth (${inCorpus.length} vocabulary/ies)`);
  console.log(`  ${corpusDir}`);
  if (notCarried.length) {
    console.log(`  note: ${notCarried.length} module(s) this repo publishes are not in the corpus:`);
    notCarried.forEach((f) => console.log(`    ${basename(f, ".json")}`));
  }
  process.exit(0);
}

if (write) {
  console.log(`✓ wrote ${drift.length + (manifestDrifted ? 1 : 0)} file(s) to the AI term-knowledge corpus`);
  drift.forEach((f) => console.log(`  - ${f}`));
  if (manifestDrifted) console.log(`  - manifest.txt`);
  console.log(`  ${corpusDir}`);
  console.log("\n  Rebuild the service, and reingest the vectors: TermCorpusIngestor SKIPS ingestion");
  console.log("  when the OpenSearch index is already populated. Set");
  console.log("  ai.term-chat.reingest-on-startup=true for the first boot after this change, or");
  console.log("  delete the term-knowledge-vectors index, or the chat keeps the old embeddings.");
} else {
  console.error(`✗ ${drift.length + (manifestDrifted ? 1 : 0)} corpus file(s) drifted from this repo:`);
  drift.forEach((f) => console.error(`  - ${f}`));
  if (manifestDrifted) console.error(`  - manifest.txt`);
  console.error(`  Fix with: pnpm run sync:ai-knowledge -- --write`);
  process.exit(1);
}
