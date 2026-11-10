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
 * The goldens are review artefacts: a change in a rule shows up as a diff in them. Gaps of the
 * target vocabulary live in roundtrip.txt rather than failing the build; a NEW difference fails.
 *
 * Hard checks on every case, in both directions:
 *   - no output uses a predicate or class its direction's vocabulary does not define (a leak);
 *   - the OpenEPCIS side (the input of a lift, the output of a lower) satisfies the profile's
 *     SHACL shapes with the OpenEPCIS ontologies as background.
 *
 *   tsx scripts/check-crosswalk.ts            check
 *   tsx scripts/check-crosswalk.ts --write    regenerate the goldens
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Quad } from "n3";
import { Store } from "n3";
import {
  canonical, convert, listProfiles, loadBackground, loadInput, moduleOntologies, loadProfile, parseTurtle, predicateDelta, ROOT, toTurtle, vocabularyLeaks,
  type Conversion, type Profile,
} from "./lib/crosswalk.ts";
import { materialiseSubProperties, parseTurtle as parseStore, stripOwlImports, stripSparqlConstraints, validate } from "./lib/shacl-run.ts";

const WRITE = process.argv.includes("--write");
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

async function golden(path: string, actual: string, label: string): Promise<void> {
  if (WRITE) {
    // Keep a Turtle golden that is canonically unchanged: blank-node labels must not churn.
    const same = path.endsWith(".ttl") && existsSync(path)
      && (await canonical(parseTurtle(readFileSync(path, "utf8")))) === (await canonical(parseTurtle(actual)));
    if (!same) writeFileSync(path, actual);
    return;
  }
  if (!existsSync(path)) {
    console.log(`  FAIL ${label}: golden ${path} missing (run with --write)`);
    failures++;
    return;
  }
  const expected = readFileSync(path, "utf8");
  if (path.endsWith(".ttl")) {
    const same = (await canonical(parseTurtle(expected))) === (await canonical(parseTurtle(actual)));
    if (!same) {
      console.log(`  FAIL ${label}: output differs from ${path}`);
      failures++;
    }
  } else if (expected !== actual) {
    console.log(`  FAIL ${label}: ${path} changed`);
    failures++;
  }
}

let shapeCache: { shapes: Store; background: Store } | undefined;
async function shaclViolations(p: Profile, quads: Quad[]): Promise<string[]> {
  if (!shapeCache) {
    const shapes = parseStore(...p.shapes.files.map((f) => readFileSync(join(ROOT, f), "utf8")));
    stripOwlImports(shapes);
    // As in check-shapes: rdf-validate-shacl cannot evaluate sh:sparql; the ITB parity gate does.
    stripSparqlConstraints(shapes);
    // Every module ontology: test documents use sector classes under the shapes' targets.
    const background = parseStore(...moduleOntologies().map((f) => readFileSync(join(ROOT, f), "utf8")));
    stripOwlImports(background);
    shapeCache = { shapes, background };
  }
  const data = new Store();
  data.addQuads(quads);
  data.addQuads([...shapeCache.background]);
  materialiseSubProperties(data, shapeCache.background);
  const report = await validate(shapeCache.shapes, data);
  return report.findings.filter((f) => f.severity === "Violation")
    .map((f) => `${f.sourceShape.replace(/.*[/#]/, "")} ${f.path ? f.path.replace(/.*[/#]/, "") + " " : ""}${f.message}`);
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
  if (firstDir === "lift") {
    hardCheck(`${name} OpenEPCIS side violates SHACL`, await shaclViolations(p, input));
    hardCheck(`${name} lowered round trip violates SHACL`, await shaclViolations(p, back.quads));
  }

  const expectedFile = join(dir, firstDir === "lift" ? `expected.${p.id}.ttl` : "expected.ours.ttl");
  await golden(expectedFile, await toTurtle(first.quads, p.prefixes), `${name} ${firstDir}`);

  const report = [
    `# ${name}: ${firstDir} then ${firstDir === "lift" ? "lower" : "lift"}`,
    `input ${input.length} triples, ${firstDir} ${first.quads.length}, back ${back.quads.length}`,
    "",
    ...deltaText("the way back compared with the input", predicateDelta(input, back.quads), p),
    "",
    ...unhandledText(first, p),
    "",
    ...(firstDir === "lower"
      ? ["## OpenEPCIS shapes the converted document does not satisfy",
         ...(inboundFindings.length ? [...new Set(inboundFindings.map((f) => f.replace(/^n3-\d+ /, "")))].sort().map((f) => `  ${f}`) : ["none"]),
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
if (failures) {
  console.log(`\n✗ crosswalk: ${failures} failure(s) in ${cases} case(s)`);
  process.exit(1);
}
console.log(`\n✓ crosswalk: ${cases} case(s) ${WRITE ? "written" : "match their goldens"}`);
