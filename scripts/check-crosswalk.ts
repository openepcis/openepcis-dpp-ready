#!/usr/bin/env tsx
/**
 * Round-trip gate for the crosswalk profiles (extensions/common/interop/crosswalk/<profile>/tests).
 *
 * A test case is a folder with either
 *   ours.jsonld | ours.ttl        an OpenEPCIS document (master data or EPCIS)  → lift, then lower
 *   <profile>.ttl                 a document in the target vocabulary          → lower, then lift
 * and the committed goldens the gate compares against:
 *   expected.<profile>.ttl | expected.ours.ttl   the converted document
 *   roundtrip.txt                                 what the way back does not restore, per term,
 *                                                 and which input terms no rule handles
 *   lowered.ours.jsonld                           the OpenEPCIS side a consumer receives (the lower
 *                                                 output), compacted with the published contexts;
 *                                                 it must expand to exactly the lowered RDF, and
 *                                                 check:shapes:itb validates it with the full shapes
 * The goldens are review artefacts: a change in a rule shows up as a diff in them. Gaps of the
 * target vocabulary live in roundtrip.txt rather than failing the build; a NEW difference fails.
 *
 * Hard checks on every case, in both directions:
 *   - no output uses a predicate or class its direction's vocabulary does not define (a leak);
 *   - the OpenEPCIS side (the input of a lift, the output of a lower) satisfies the profile's
 *     SHACL shapes with the OpenEPCIS ontologies as background;
 *   - the target side (the output of a lift, the input of a lower) satisfies the OWL/RDFS axioms of
 *     the target vocabulary (domain, range, restrictions), except findings the profile accepts as
 *     a documented gap of the target (profile.json "structure"); those are listed in roundtrip.txt.
 *
 * Then every module example (the examples/ and epcis/ JSON-LD of each module) goes through every profile,
 * lift then lower: it must convert without error, leak or (unaccepted) structure finding and
 * serialise losslessly as JSON-LD. Shapes its way back no longer satisfies (though the example
 * does) are committed per profile in examples-shapes.txt. What each example keeps: --report.
 *
 *   tsx scripts/check-crosswalk.ts            check
 *   tsx scripts/check-crosswalk.ts --write    regenerate the goldens
 *   tsx scripts/check-crosswalk.ts --report   also print, per example, what the round trip keeps
 *   tsx scripts/check-crosswalk.ts --cases    the test cases only
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Quad } from "n3";
import { Store } from "n3";
import {
  canonical, convert, jsonldToQuads, sameValueSpelling, toOursJsonLd, listProfiles, loadBackground, loadInput, moduleOntologies, loadProfile, parseTurtle, predicateDelta, ROOT, toTurtle, vocabularyLeaks,
  type Conversion, type Profile,
} from "./lib/crosswalk.ts";
import { indexOntology, structureFindings, type OntologyIndex } from "./lib/owl-structure.ts";
import { materialiseSubProperties, parseTurtle as parseStore, stripOwlImports, stripSparqlConstraints, validate } from "./lib/shacl-run.ts";

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const WRITE = process.argv.includes("--write");
const REPORT = process.argv.includes("--report");
const CASES_ONLY = process.argv.includes("--cases");
let failures = 0;
let cases = 0;

function shorten(iri: string, p: Profile): string {
  for (const [k, ns] of Object.entries(p.prefixes).sort((a, b) => b[1].length - a[1].length)) {
    if (iri.startsWith(ns)) return `${k}:${iri.slice(ns.length)}`;
  }
  return iri;
}

function deltaText(title: string, d: Map<string, number>, p: Profile): string[] {
  const lines: string[] = [];
  const lost = [...d].filter(([, n]) => n > 0);
  const added = [...d].filter(([, n]) => n < 0);
  lines.push(`## ${title}`);
  if (!lost.length && !added.length) lines.push("identical (per term)");
  for (const [k, n] of lost) lines.push(`- missing ${n}  ${k.startsWith("a ") ? "a " + shorten(k.slice(2), p) : shorten(k, p)}`);
  for (const [k, n] of added) lines.push(`+ extra   ${-n}  ${k.startsWith("a ") ? "a " + shorten(k.slice(2), p) : shorten(k, p)}`);
  return lines;
}

function unhandledText(c: Conversion, p: Profile): string[] {
  const lines = ["## not converted (no rule handles these input terms)"];
  if (!c.unhandled.size) lines.push("none");
  for (const [k, n] of [...c.unhandled].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`  ${n}  ${k.startsWith("a ") ? "a " + shorten(k.slice(2), p) : shorten(k, p)}`);
  }
  return lines;
}

/** A golden's RDF: Turtle and JSON-LD goldens compare as canonical RDF. */
async function rdfOf(path: string, text: string): Promise<string | undefined> {
  if (path.endsWith(".ttl")) return canonical(parseTurtle(text));
  if (path.endsWith(".jsonld")) return canonical(await jsonldToQuads(JSON.parse(text)));
  return undefined;
}

async function golden(path: string, actual: string, label: string): Promise<void> {
  if (WRITE) {
    // Keep an RDF golden that is canonically unchanged: blank-node labels must not churn.
    const same = existsSync(path) && (await rdfOf(path, actual)) !== undefined
      && (await rdfOf(path, readFileSync(path, "utf8"))) === (await rdfOf(path, actual));
    if (!same) writeFileSync(path, actual);
    return;
  }
  if (!existsSync(path)) {
    console.log(`  FAIL ${label}: golden ${path} missing (run with --write)`);
    failures++;
    return;
  }
  const expected = readFileSync(path, "utf8");
  if (path.endsWith(".ttl") || path.endsWith(".jsonld")) {
    const same = (await rdfOf(path, expected)) === (await rdfOf(path, actual));
    if (!same) {
      console.log(`  FAIL ${label}: output differs from ${path}`);
      failures++;
    }
  } else if (expected !== actual) {
    console.log(`  FAIL ${label}: ${path} changed`);
    failures++;
  }
}

let shaclBackground: Store | undefined;
const shapeSets = new Map<string, Store>();

/**
 * Shape files that apply to a document, as the EC validator applies them per validation type: the
 * core's (and those below it) always, a module's when the document uses the module's namespace. A
 * module's shapes may target any product (FSMA 204 does); they hold only for that module's data.
 */
function applicableShapes(p: Profile, quads: Quad[]): string[] {
  const used = new Set<string>();
  for (const q of quads) {
    for (const iri of [q.predicate.value, q.predicate.value === RDF_TYPE ? q.object.value : ""]) {
      const m = /^https:\/\/ref\.openepcis\.org\/(extensions\/[^/]+\/[^/]+)\//.exec(iri);
      if (m) used.add(m[1]);
    }
  }
  return p.shapes.files.filter((f) => {
    const dir = f.slice(0, f.indexOf("/validation/"));
    return dir === "extensions/common/core" || dir === "extensions/common/assessment" || used.has(dir);
  });
}

async function shaclViolations(p: Profile, quads: Quad[]): Promise<string[]> {
  if (!shaclBackground) {
    // Every module ontology: test documents use sector classes under the shapes' targets.
    shaclBackground = parseStore(...moduleOntologies().map((f) => readFileSync(join(ROOT, f), "utf8")));
    stripOwlImports(shaclBackground);
  }
  const files = applicableShapes(p, quads);
  const key = files.join("|");
  let shapes = shapeSets.get(key);
  if (!shapes) {
    shapes = parseStore(...files.map((f) => readFileSync(join(ROOT, f), "utf8")));
    stripOwlImports(shapes);
    // As in check-shapes: rdf-validate-shacl cannot evaluate sh:sparql; the ITB parity gate does.
    stripSparqlConstraints(shapes);
    shapeSets.set(key, shapes);
  }
  const data = new Store();
  data.addQuads(quads);
  data.addQuads([...shaclBackground]);
  materialiseSubProperties(data, shaclBackground);
  const report = await validate(shapes, data);
  return report.findings.filter((f) => f.severity === "Violation")
    .map((f) => `${f.sourceShape.replace(/.*[/#]/, "")} ${f.path ? f.path.replace(/.*[/#]/, "") + " " : ""}${f.message}`);
}

const structureIndex = new Map<string, OntologyIndex>();
/** Which accepted entries matched in any case: an entry nothing needs any more fails the gate. */
const acceptedUsed = new Map<string, Set<number>>();

/** Structure findings of a target-side document: not accepted (fail), accepted (reported). */
function structureCheck(p: Profile, quads: Quad[]): { failing: string[]; accepted: string[] } {
  if (!p.vocabulary.lift.files.length) return { failing: [], accepted: [] };
  if (!structureIndex.has(p.id)) structureIndex.set(p.id, indexOntology(p.vocabulary.lift.files, ROOT));
  const entries = p.structure?.accepted ?? [];
  const used = acceptedUsed.get(p.id) ?? new Set<number>();
  acceptedUsed.set(p.id, used);
  const failing: string[] = [];
  const accepted = new Map<string, number>();
  for (const f of structureFindings(structureIndex.get(p.id)!, quads, (iri) => shorten(iri, p))) {
    const i = entries.findIndex((e) => new RegExp(e.match).test(f));
    if (i < 0) {
      failing.push(f);
      continue;
    }
    used.add(i);
    // One line per gap and rule/class/property; the values themselves are in the golden.
    const line = `gap ${entries[i].gap}  ${f.slice(0, f.indexOf(": "))}`;
    accepted.set(line, (accepted.get(line) ?? 0) + 1);
  }
  return { failing, accepted: [...accepted].sort().map(([l, n]) => `  ${l}  (${n})`) };
}

/** Violations without blank-node labels (they differ between documents), each once, sorted. */
function unlabelled(vs: string[]): string[] {
  return [...new Set(vs.map((v) => v.replace(/(^|\s)n3-\d+(?=\s)/g, "$1_").trim()))].sort();
}

/** Violations of the way back that the OpenEPCIS document itself (with its entailed types) does not have. */
async function newViolations(p: Profile, original: Quad[], back: Quad[]): Promise<string[]> {
  const own = new Set(unlabelled(await shaclViolations(p, original)));
  return unlabelled(await shaclViolations(p, back)).filter((v) => !own.has(v));
}

function hardCheck(label: string, problems: string[]): void {
  if (!problems.length) return;
  console.log(`  FAIL ${label}:`);
  for (const x of problems) console.log(`         ${x}`);
  failures++;
}

async function runCase(p: Profile, dir: string): Promise<void> {
  const name = dir.slice(dir.lastIndexOf("/") + 1);
  cases++;
  const ours = ["ours.jsonld", "ours.ttl"].map((f) => join(dir, f)).find(existsSync);
  const theirs = join(dir, `${p.id}.ttl`);
  let input: Quad[], first: Conversion, back: Conversion, firstDir: "lift" | "lower";
  if (ours) {
    input = await loadInput(ours);
    first = convert(p, "lift", input);
    back = convert(p, "lower", first.quads);
    firstDir = "lift";
  } else if (existsSync(theirs)) {
    input = await loadInput(theirs);
    first = convert(p, "lower", input);
    back = convert(p, "lift", first.quads);
    firstDir = "lower";
  } else {
    console.log(`  FAIL ${name}: neither ours.jsonld/ours.ttl nor ${p.id}.ttl`);
    failures++;
    return;
  }
  const liftOut = firstDir === "lift" ? first.quads : back.quads;
  const lowerOut = firstDir === "lift" ? back.quads : first.quads;
  hardCheck(`${name} lift output leaks`, vocabularyLeaks(p, "lift", liftOut));
  hardCheck(`${name} lower output leaks`, vocabularyLeaks(p, "lower", lowerOut));
  // Our own documents (and their round trip) must satisfy our shapes. A document from another
  // vocabulary may lack what OpenEPCIS requires (e.g. a facility name CIRPASS-2 has no term for):
  // those findings are part of the committed report, so only a new one fails.
  const inboundFindings = firstDir === "lower" ? await shaclViolations(p, first.quads) : [];
  // The target side: our lift output, and a target document we wrote as a test case.
  const structure = structureCheck(p, liftOut);
  hardCheck(`${name} lift output violates the target ontology`, structure.failing);
  if (firstDir === "lower") hardCheck(`${name} input violates the target ontology`, structureCheck(p, input).failing);
  // Our document must satisfy our shapes; what its way back no longer satisfies (data the target
  // cannot hold that a shape requires) is part of the committed report.
  const wayBackFindings = firstDir === "lift" ? await newViolations(p, [...input, ...first.entailed], back.quads) : [];
  if (firstDir === "lift") hardCheck(`${name} OpenEPCIS side violates SHACL`, await shaclViolations(p, input));

  // The OpenEPCIS side as JSON-LD with our contexts: nothing may be lost in the serialisation.
  const oursDoc = await toOursJsonLd(lowerOut);
  if ((await canonical(sameValueSpelling(await jsonldToQuads(oursDoc)))) !== (await canonical(sameValueSpelling(lowerOut)))) {
    hardCheck(`${name} lowered JSON-LD`, ["does not expand back to the lowered RDF (a context coerces a value differently)"]);
  }
  await golden(join(dir, "lowered.ours.jsonld"), JSON.stringify(oursDoc, null, 2) + "\n", `${name} lowered JSON-LD`);

  const expectedFile = join(dir, firstDir === "lift" ? `expected.${p.id}.ttl` : "expected.ours.ttl");
  await golden(expectedFile, await toTurtle(first.quads, p.prefixes), `${name} ${firstDir}`);

  const report = [
    `# ${name}: ${firstDir} then ${firstDir === "lift" ? "lower" : "lift"}`,
    `input ${input.length} triples, ${firstDir} ${first.quads.length}, back ${back.quads.length}`,
    "",
    // Types the lift entailed for an untyped input node count as part of the input.
    ...deltaText("the way back compared with the input",
      predicateDelta(firstDir === "lift" ? [...input, ...first.entailed] : input, back.quads), p),
    "",
    ...unhandledText(first, p),
    "",
    ...(p.vocabulary.lift.files.length
      ? ["## target-ontology axioms the lifted document does not satisfy (accepted gaps)",
         ...(structure.accepted.length ? structure.accepted : ["none"]),
         ""]
      : []),
    ...(firstDir === "lift"
      ? ["## OpenEPCIS shapes the way back no longer satisfies",
         ...(wayBackFindings.length ? wayBackFindings.map((f) => `  ${f}`) : ["none"]),
         ""]
      : []),
    ...(firstDir === "lower"
      ? ["## OpenEPCIS shapes the converted document does not satisfy",
         ...(inboundFindings.length ? unlabelled(inboundFindings).map((f) => `  ${f}`) : ["none"]),
         ""]
      : []),
  ].join("\n");
  await golden(join(dir, "roundtrip.txt"), report, `${name} round trip`);
  console.log(`  ${WRITE ? "wrote" : "ok  "} ${name} (${firstDir}: ${input.length} → ${first.quads.length} → ${back.quads.length})`);
}

for (const id of listProfiles()) {
  const p = loadProfile(id);
  await loadBackground(p);
  const testsDir = join(p.dir, "tests");
  if (!existsSync(testsDir)) continue;
  console.log(`crosswalk ${id}`);
  for (const d of readdirSync(testsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
    try {
      await runCase(p, join(testsDir, d));
    } catch (e) {
      console.log(`  FAIL ${d}: ${(e as Error).message}`);
      failures++;
    }
  }
}
/** Every module example document, repo-relative, sorted. */
function moduleExamples(): string[] {
  const out: string[] = [];
  for (const area of ["common", "eu", "us", "upstream"]) {
    const base = join(ROOT, "extensions", area);
    if (!existsSync(base)) continue;
    for (const m of readdirSync(base).sort()) {
      for (const sub of ["examples", "epcis"]) {
        const dir = join(base, m, sub);
        if (!existsSync(dir)) continue;
        for (const f of readdirSync(dir).sort()) {
          if (f.endsWith(".jsonld") && !f.endsWith(".operational.jsonld")) out.push(join("extensions", area, m, sub, f));
        }
      }
    }
  }
  return out;
}

/** Per profile: what the way back of an example no longer satisfies (committed, examples-shapes.txt). */
let exampleShapeLines: string[] = [];

async function runExample(p: Profile, rel: string): Promise<string | undefined> {
  const input = await loadInput(join(ROOT, rel));
  const up = convert(p, "lift", input);
  const back = convert(p, "lower", up.quads);
  hardCheck(`${rel} lift output leaks`, vocabularyLeaks(p, "lift", up.quads));
  hardCheck(`${rel} lower output leaks`, vocabularyLeaks(p, "lower", back.quads));
  hardCheck(`${rel} lift output violates the target ontology`, structureCheck(p, up.quads).failing);
  if ((await canonical(sameValueSpelling(await jsonldToQuads(await toOursJsonLd(back.quads))))) !== (await canonical(sameValueSpelling(back.quads)))) {
    hardCheck(`${rel} lowered JSON-LD`, ["does not expand back to the lowered RDF"]);
  }
  // A shape the example satisfies, its way back must satisfy as well.
  // The example with the types the lift entailed for its untyped nodes: those types make shapes apply.
  for (const v of await newViolations(p, [...input, ...up.entailed], back.quads)) exampleShapeLines.push(`${rel}  ${v}`);
  if (!REPORT) return undefined;
  const delta = predicateDelta([...input, ...up.entailed], back.quads);
  const lost = [...delta].filter(([, n]) => n > 0).reduce((a, [, n]) => a + n, 0);
  const kept = input.length + up.entailed.length - lost;
  return `${rel.padEnd(70)} ${String(input.length).padStart(4)} ${String(up.quads.length).padStart(5)} ${String(back.quads.length).padStart(5)} ${String(Math.round((100 * kept) / (input.length + up.entailed.length))).padStart(4)}%  ${up.unhandled.size}`;
}

if (!CASES_ONLY) {
  const examples = moduleExamples();
  for (const id of listProfiles()) {
    const p = loadProfile(id);
    const before = failures;
    exampleShapeLines = [];
    if (REPORT) console.log(`\nexamples through ${id}\n${"document".padEnd(70)} in   lift  back  kept  terms not converted`);
    for (const rel of examples) {
      try {
        const line = await runExample(p, rel);
        if (line) console.log(line);
      } catch (e) {
        console.log(`  FAIL ${rel}: ${(e as Error).message}`);
        failures++;
      }
    }
    await golden(join(p.dir, "examples-shapes.txt"),
      ["# OpenEPCIS shapes the way back of a module example no longer satisfies (and the example does)",
       "# Data a shape requires that the target vocabulary has no place for; a new line fails the gate.",
       ...(exampleShapeLines.length ? exampleShapeLines : ["none"]), ""].join("\n"),
      `${id} examples`);
    console.log(`crosswalk ${id}: ${examples.length} module example(s) ${failures === before ? (WRITE ? "written" : "convert cleanly") : "FAIL"}`);
  }
}

for (const id of listProfiles()) {
  const entries = loadProfile(id).structure?.accepted ?? [];
  entries.forEach((e, i) => {
    // Only judged after a full run: the examples may be the ones needing an entry.
    if (!CASES_ONLY && acceptedUsed.has(id) && !acceptedUsed.get(id)!.has(i)) {
      console.log(`  FAIL ${id}: accepted structure finding (gap ${e.gap}) no longer occurs; remove it from profile.json`);
      failures++;
    }
  });
}
if (failures) {
  console.log(`\n✗ crosswalk: ${failures} failure(s) in ${cases} case(s)`);
  process.exit(1);
}
console.log(`\n✓ crosswalk: ${cases} case(s) ${WRITE ? "written" : "match their goldens"}`);
