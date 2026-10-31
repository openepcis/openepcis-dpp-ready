#!/usr/bin/env tsx
/**
 * Convert between the OpenEPCIS DPP vocabulary and another DPP vocabulary with a crosswalk
 * profile (extensions/common/interop/crosswalk/<profile>/).
 *
 *   tsx scripts/crosswalk.ts --profile cirpass2 --lift  --in passport.jsonld [--out out.ttl]
 *   tsx scripts/crosswalk.ts --profile cirpass2 --lower --in cirpass2.ttl    [--out out.ttl]
 *
 * --lift  OpenEPCIS (JSON-LD master data, EPCIS document, or Turtle) → target vocabulary
 * --lower target vocabulary (Turtle or JSON-LD) → OpenEPCIS
 * The report on stderr lists how many triples each rule produced and which input terms no
 * rule of the profile handles (they are not converted).
 *
 * --query <file.rq> runs a SELECT or CONSTRUCT against the store the direction's rules see
 * (input in <urn:xw:in>, background in <urn:xw:bg>, mappings in <urn:xw:map>, union as
 * default graph, profile prefixes predeclared) and prints the rows: for debugging rules.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { convert, debugQuery, loadInput, loadProfile, toTurtle, type Direction } from "./lib/crosswalk.ts";

const args = process.argv.slice(2);
const opt = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const profileId = opt("--profile") ?? "cirpass2";
const input = opt("--in");
const out = opt("--out");
const direction: Direction | undefined = args.includes("--lift") ? "lift" : args.includes("--lower") ? "lower" : undefined;
if (!input || !direction) {
  console.error("usage: crosswalk.ts --profile <id> (--lift|--lower) --in <file> [--out <file>]");
  process.exit(2);
}

const profile = loadProfile(profileId);
const quads = await loadInput(input);
const queryFile = opt("--query");
if (queryFile) {
  for (const line of debugQuery(profile, direction, quads, readFileSync(queryFile, "utf8"))) console.log(line);
  process.exit(0);
}
const result = convert(profile, direction, quads);
const ttl = await toTurtle(result.quads, profile.prefixes);
if (out) writeFileSync(out, ttl);
else process.stdout.write(ttl);

console.error(`${profile.id} ${direction}: ${quads.length} input triples → ${result.quads.length} output triples`);
for (const r of result.rules) console.error(`  ${r.rule.padEnd(36)} ${r.triples}`);
if (result.unhandled.size) {
  console.error("  not converted (no rule handles these input terms):");
  for (const [k, n] of result.unhandled) console.error(`    ${n.toString().padStart(4)}  ${k}`);
}
