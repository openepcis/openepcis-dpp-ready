/**
 * Guard: the standard/operational context contract.
 *
 * Enforces the rule that unprefixed (bare) terms are supported ONLY via the
 * operational contexts, while the standard module contexts require proper
 * prefixing (so a term's source vocabulary is visible in the data):
 *
 *   (a) no standard context (dpp-core + the module *-context files) defines a
 *       bare property alias — bare aliases live only in the *-shortcut layers;
 *   (b) every product example seed is fully prefixed (no bare property keys and
 *       no bare class values in `type`);
 *   (c) each product seed round-trips: canonicalising it under its own @context
 *       and under its per-module operational context yields the identical RDF
 *       graph (URDNA2015), with no malformed literals;
 *   (d) every EPCIS event example lists STANDARD contexts only: the EPCIS base
 *       context first, then dpp-core, then the module context(s). An event is
 *       interchange payload for an EPCIS repository, not the EN 18223 compressed
 *       form, so it must never point at an operational or shortcut context;
 *   (e) inside an EPCIS event the prefix rule holds in both directions: outside
 *       `gs1:masterDataAvailableFor` every vocabulary key is a CURIE (only EPCIS
 *       structural terms stay bare), and inside it GS1 is the ambient vocabulary
 *       (GS1 keys and GS1 `type` values bare, extension terms prefixed). The bare
 *       keys resolve because dpp-core-context gives `gs1:masterDataAvailableFor`
 *       a property-scoped @context (the gs1-shortcuts layer);
 *   (f) the resolver Organization records are fully prefixed too, and expand with
 *       no dropped terms;
 *   (g) the mirror image of (b): a committed `*.operational.jsonld` carries NO
 *       CURIE at all, neither as a key nor as a `type` value. The compressed form
 *       is the bare-term §5.2 serialization, and `compactOperational` falls back to
 *       a CURIE (or a full IRI) for any term the operational alias chain does not
 *       define. Such a fallback is invisible otherwise: the artifact still expands
 *       to the right graph, so the fidelity and round-trip gates pass while the
 *       payload leaks the prefix the compressed form exists to remove. Fix by
 *       giving the term a bare alias, for upstream classes via the module's
 *       `.shortcut-overrides.json`;
 *   (h) no example, EPCIS event or organization record names a deployment host.
 *       The published artifacts are environment-neutral: identity URLs use the
 *       canonical GS1 Digital Link host and document URLs a placeholder host, and
 *       the seeding scripts rewrite both per environment
 *       (scripts/lib/seed-hosts.sh). A hardcoded `*.epcis.cloud` host is how dev
 *       ended up serving passports whose own URLs named demo.
 *
 * Runs offline against the bundled contexts. Wired into `pnpm run build` and CI.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import jsonld from "jsonld";
import { documentLoader, ROOT } from "./en18223/node-io.ts";
import { operationalContextFor } from "./en18223/serialize.ts";

const STANDARD_CONTEXTS = [
  "extensions/common/core/context/dpp-core-context.jsonld",
  "extensions/eu/battery/context/battery-context.jsonld",
  "extensions/eu/textile/context/textile-context.jsonld",
  "extensions/eu/electronics/context/electronics-context.jsonld",
  "extensions/eu/eudr/context/eudr-context.jsonld",
  "extensions/eu/ppwr/context/ppwr-context.jsonld",
  "extensions/eu/cpr/context/cpr-context.jsonld",
  "extensions/eu/detergent/context/detergent-context.jsonld",
  "extensions/eu/iron-steel/context/iron-steel-context.jsonld",
  "extensions/us/fsma204/context/fsma204-context.jsonld",
];
const STRUCT = new Set(["id", "type"]);

const EPCIS_BASE = "https://ref.gs1.org/standards/epcis/epcis-context.jsonld";
const DPP_CORE = "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld";
const MDAF = "gs1:masterDataAvailableFor";
const EPCIS_CONTEXT_FILE = "vendor/gs1/epcis-context.jsonld";
const GS1_SHORTCUTS_FILE = "extensions/common/core/context/gs1-shortcuts-context.jsonld";
// The rail mirror re-publishes EPCIS sensor terms of its own, so rail events are
// allowed the upstream rail context in addition to the standard chain.
const RAIL_EXTRA = new Set([
  "https://gs1-epcis-reg.org/rail/rail-context.jsonld",
  "https://ref.openepcis.io/extensions/common/interop/rail-bridge-context.jsonld",
]);
const isNamespace = (v: any) => typeof v === "string" && /^https?:\/\//.test(v) && (v.endsWith("/") || v.endsWith("#"));

/** (a) A standard context must not define bare property aliases. */
function bareAliases(ctxDoc: any): string[] {
  const ctx = ctxDoc["@context"];
  const objs = (Array.isArray(ctx) ? ctx : [ctx]).filter((e) => e && typeof e === "object");
  const bare: string[] = [];
  for (const o of objs) {
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith("@") || STRUCT.has(k) || k.includes(":") || isNamespace(v)) continue;
      bare.push(k);
    }
  }
  return bare;
}

/** (b) Bare property keys / bare `type` class values anywhere in a seed. */
function bareTerms(node: any, out: Set<string>): void {
  if (Array.isArray(node)) {
    node.forEach((v) => bareTerms(v, out));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if ((k === "type" || k === "@type")) {
        for (const t of Array.isArray(v) ? v : [v]) {
          if (typeof t === "string" && !t.includes(":") && !t.startsWith("@")) out.add(`type=${t}`);
        }
      } else if (!k.startsWith("@") && !k.startsWith("_") && !STRUCT.has(k) && !k.includes(":")) {
        out.add(k);
      }
      bareTerms(v, out);
    }
  }
}

/**
 * Every term the EPCIS base context defines, including the ones that only exist
 * inside a type-/property-scoped @context (sensorElementList → sensorReport →
 * type, persistentDisposition → set/unset, …). These are the only keys allowed to
 * stay bare in an event: they are EPCIS structural fields, not vocabulary.
 */
function collectTerms(ctx: any, out: Set<string>): void {
  if (Array.isArray(ctx)) { ctx.forEach((c) => collectTerms(c, out)); return; }
  if (!ctx || typeof ctx !== "object") return;
  for (const [k, v] of Object.entries(ctx)) {
    if (!k.startsWith("@")) out.add(k);
    if (v && typeof v === "object") collectTerms((v as any)["@context"], out);
  }
}

/**
 * (e) Walk an event and report keys/values that break the prefix rule. `inMdaf`
 * flips the expectation: outside the card GS1 must be prefixed, inside it must be
 * bare (that is where gs1 is the ambient vocabulary).
 */
function prefixProblems(
  node: any,
  structural: Set<string>,
  gs1Bare: Set<string>,
  inMdaf: boolean,
  out: Set<string>,
): void {
  if (Array.isArray(node)) {
    node.forEach((v) => prefixProblems(v, structural, gs1Bare, inMdaf, out));
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    const nested = inMdaf || k === MDAF;
    if (k.startsWith("@") || k.startsWith("_") || STRUCT.has(k)) {
      // fall through to the recursion below
    } else if (inMdaf) {
      if (k.startsWith("gs1:")) out.add(`${k} (inside ${MDAF} GS1 terms are written bare)`);
      else if (!k.includes(":") && !gs1Bare.has(k)) out.add(`${k} (bare inside ${MDAF} but not a GS1 term)`);
    } else if (!k.includes(":") && !structural.has(k)) {
      out.add(`${k} (bare outside ${MDAF} and not an EPCIS structural term)`);
    }
    if (k === "type" || k === "@type") {
      for (const t of Array.isArray(v) ? v : [v]) {
        if (typeof t !== "string" || t.startsWith("@") || t.includes(":")) continue;
        // A bare class value is only legal inside a card (GS1 ambient) or when the
        // EPCIS context itself defines the code (e.g. bizTransaction types).
        if (!(inMdaf ? gs1Bare.has(t) : structural.has(t))) out.add(`type=${t}`);
      }
    }
    prefixProblems(v, structural, gs1Bare, nested, out);
  }
}

const stripComments = (o: any): any =>
  Array.isArray(o) ? o.map(stripComments)
    : o && typeof o === "object"
      ? Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith("_")).map(([k, v]) => [k, stripComments(v)]))
      : o;

const canon = (doc: any) =>
  jsonld.canonize(doc, { algorithm: "URDNA2015", format: "application/n-quads", safe: false, documentLoader: documentLoader as any }) as unknown as Promise<string>;

// Not OpenEPCIS GS1-prefixed DPP master data, so out of scope for the prefix rule:
//  - batterypass-*: BatteryPass-vocabulary compare samples (use the bridge context)
//  - regulatory-notification: a GS1 regulatory-message doc that pulls a remote context
// Skip non-DPP examples and the generated .operational.jsonld golden artifacts
// (those are the bare-keyed compressed form, not prefixed standard-context seeds).
const EXCLUDE = /(batterypass-|regulatory-notification|\.operational\.jsonld$)/;

/**
 * (g) Every CURIE / full-IRI term left in a compressed artifact: a property key that
 * still carries a prefix, or a `type` value that is not a bare class alias. Both mean
 * the operational alias chain has no bare name for that term.
 */
function prefixLeaks(node: any, out: Set<string>): void {
  if (Array.isArray(node)) {
    node.forEach((v) => prefixLeaks(v, out));
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (!k.startsWith("@") && !k.startsWith("_") && k.includes(":")) out.add(k);
    if (k === "type" || k === "@type") {
      for (const t of Array.isArray(v) ? v : [v]) {
        // A bare alias has no colon. Anything else is a CURIE (schema:ImageObject)
        // or, when no prefix is known either, a full IRI (http://data.europa.eu/m8g/Evidence).
        if (typeof t === "string" && !t.startsWith("@") && t.includes(":")) out.add(`type=${t}`);
      }
    }
    if (k !== "@context") prefixLeaks(v, out);
  }
}

/** (h) Deployment hostnames that must not appear in a published artifact. */
const DEPLOYMENT_HOST = /\b[a-z0-9-]+\.(?:dev|demo|test|staging)\.epcis\.cloud\b|\bepcis\.local\b/g;

function deploymentHosts(text: string): string[] {
  return [...new Set(text.match(DEPLOYMENT_HOST) ?? [])];
}

interface Targets {
  seeds: string[]; // product master-data seeds (rules b + c)
  events: string[]; // EPCIS event examples (rules d + e)
  orgs: string[]; // resolver Organization records (rule f)
  compressed: string[]; // generated *.operational.jsonld artifacts (rule g)
}

async function targets(): Promise<Targets> {
  const t: Targets = { seeds: [], events: [], orgs: [], compressed: [] };
  const walk = async (dir: string) => {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { await walk(p); continue; }
      if (!e.name.endsWith(".jsonld")) continue;
      if (dir.endsWith("/epcis")) t.events.push(p);
      else if (dir.endsWith("/examples/organizations")) t.orgs.push(p);
      else if (dir.endsWith("/examples") && e.name.endsWith(".operational.jsonld")) t.compressed.push(p);
      else if (dir.endsWith("/examples") && !EXCLUDE.test(e.name)) t.seeds.push(p);
    }
  };
  await walk(path.join(ROOT, "extensions"));
  t.seeds.sort(); t.events.sort(); t.orgs.sort(); t.compressed.sort();
  return t;
}

async function main(): Promise<number> {
  const problems: string[] = [];

  // (a)
  for (const rel of STANDARD_CONTEXTS) {
    const doc = JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8"));
    const bare = bareAliases(doc);
    if (bare.length) problems.push(`standard context ${rel} defines ${bare.length} bare alias(es): ${bare.slice(0, 8).join(", ")}${bare.length > 8 ? " …" : ""}`);
  }

  const { seeds, events, orgs, compressed } = await targets();

  // (b) + (c)
  for (const abs of seeds) {
    const rel = path.relative(ROOT, abs);
    const doc = stripComments(JSON.parse(await fs.readFile(abs, "utf8")));
    const bare = new Set<string>();
    bareTerms(doc, bare);
    if (bare.size) { problems.push(`seed ${rel} uses bare term(s): ${[...bare].slice(0, 8).join(", ")}`); continue; }
    try {
      const own = await canon(doc);
      if (/@@|"@(value|language)"/.test(own)) { problems.push(`seed ${rel}: malformed literal under its own context`); continue; }
      const op = await canon({ ...doc, "@context": operationalContextFor(doc) });
      if (own !== op) problems.push(`seed ${rel}: operational context is not graph-identical (${own.split("\n").filter(Boolean).length} vs ${op.split("\n").filter(Boolean).length} quads)`);
    } catch (e: any) {
      problems.push(`seed ${rel}: ${e.message}`);
    }
  }

  // (d) + (e)
  const structural = new Set<string>();
  collectTerms(JSON.parse(await fs.readFile(path.join(ROOT, EPCIS_CONTEXT_FILE), "utf8"))["@context"], structural);
  const gs1Bare = new Set<string>();
  collectTerms(JSON.parse(await fs.readFile(path.join(ROOT, GS1_SHORTCUTS_FILE), "utf8"))["@context"], gs1Bare);
  // The rail mirror publishes its own bare sensor terms (leftValue, visibility, …).
  const railStructural = new Set(structural);
  collectTerms(
    JSON.parse(await fs.readFile(path.join(ROOT, "extensions/upstream/gs1-rail/context/rail-context.jsonld"), "utf8"))["@context"],
    railStructural,
  );
  for (const abs of events) {
    const rel = path.relative(ROOT, abs);
    const doc = JSON.parse(await fs.readFile(abs, "utf8"));
    const arr = Array.isArray(doc["@context"]) ? doc["@context"] : [doc["@context"]];
    const isRail = rel.includes("/gs1-rail/");
    // (d) standard contexts only, EPCIS base first, dpp-core present
    if (arr[0] !== EPCIS_BASE) problems.push(`event ${rel}: @context[0] must be the EPCIS base context, found ${JSON.stringify(arr[0])}`);
    if (!arr.includes(DPP_CORE)) problems.push(`event ${rel}: @context must list the dpp-core standard context`);
    for (const entry of arr) {
      if (typeof entry !== "string") { problems.push(`event ${rel}: inline @context entries are not allowed`); continue; }
      if (/-(operational|shortcut)-context\.jsonld$/.test(entry)) problems.push(`event ${rel}: references non-standard context ${entry}`);
      else if (entry !== EPCIS_BASE && entry !== DPP_CORE && !/-context\.jsonld$/.test(entry) && !(isRail && RAIL_EXTRA.has(entry))) {
        problems.push(`event ${rel}: unexpected @context entry ${entry}`);
      }
    }
    // (e) prefix discipline, both directions
    const bad = new Set<string>();
    prefixProblems(stripComments(doc), isRail ? railStructural : structural, gs1Bare, false, bad);
    if (bad.size) problems.push(`event ${rel} breaks the prefix rule: ${[...bad].slice(0, 6).join(", ")}${bad.size > 6 ? ` (+${bad.size - 6} more)` : ""}`);
  }

  // (f) resolver Organization records: prefixed, and nothing dropped on expansion
  for (const abs of orgs) {
    const rel = path.relative(ROOT, abs);
    const doc = stripComments(JSON.parse(await fs.readFile(abs, "utf8")));
    const bare = new Set<string>();
    bareTerms(doc, bare);
    if (bare.size) { problems.push(`organization ${rel} uses bare term(s): ${[...bare].slice(0, 8).join(", ")}`); continue; }
    const dropped: string[] = [];
    try {
      await jsonld.expand(doc, {
        documentLoader: documentLoader as any,
        safe: false,
        eventHandler: ({ event, next }: any) => {
          if (event?.code === "invalid property" || String(event?.code).startsWith("relative ")) {
            dropped.push(`${event.code}: ${event.details?.property ?? event.details?.id ?? "?"}`);
          }
          next();
        },
      } as any);
    } catch (e: any) {
      problems.push(`organization ${rel}: ${e.message}`);
      continue;
    }
    if (dropped.length) problems.push(`organization ${rel}: ${dropped.length} term(s) lost on expansion: ${[...new Set(dropped)].slice(0, 6).join(", ")}`);
  }

  // (g) compressed artifacts carry no prefixed term at all
  for (const abs of compressed) {
    const rel = path.relative(ROOT, abs);
    const doc = JSON.parse(await fs.readFile(abs, "utf8"));
    const { "@context": _ctx, ...body } = doc;
    const leaks = new Set<string>();
    prefixLeaks(body, leaks);
    if (leaks.size) {
      problems.push(
        `compressed ${rel} leaks ${leaks.size} prefixed term(s) (no bare alias in the operational chain): ` +
          `${[...leaks].slice(0, 6).join(", ")}${leaks.size > 6 ? ` (+${leaks.size - 6} more)` : ""}`,
      );
    }
  }

  // (h) no published artifact names a deployment
  for (const abs of [...seeds, ...events, ...orgs, ...compressed]) {
    const rel = path.relative(ROOT, abs);
    const hosts = deploymentHosts(await fs.readFile(abs, "utf8"));
    if (hosts.length) {
      problems.push(
        `${rel} hardcodes deployment host(s) ${hosts.join(", ")} — publish neutral URLs and let ` +
          `scripts/lib/seed-hosts.sh point them at an environment`,
      );
    }
  }

  if (problems.length) {
    console.error(`✗ operational-context guard: ${problems.length} problem(s)`);
    problems.forEach((p) => console.error("  - " + p));
    return 1;
  }
  console.log(
    `✓ operational-context guard: standard contexts prefixed; ${seeds.length} product seed(s) prefixed and ` +
      `graph-identical under their operational context; ${events.length} EPCIS event(s) on standard contexts with ` +
      `GS1 bare only inside ${MDAF}; ${orgs.length} organization record(s) prefixed and lossless; ` +
      `${compressed.length} compressed artifact(s) fully bare-termed; ` +
      `${seeds.length + events.length + orgs.length + compressed.length} artifact(s) environment-neutral.`,
  );
  return 0;
}

process.exit(await main());
