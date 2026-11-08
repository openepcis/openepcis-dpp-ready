#!/usr/bin/env tsx
/**
 * Lists every term tiered stricter than a parent property that embeds it.
 *
 * Until resolver !206 and vc !30 the field-access filter and the credential slicer judged only the
 * top-level keys of a passport; a nested term always took its parent's tier. A term tiered
 * stricter than its parent (the mandated AuthorizedOnly cathodeActiveMaterial inside the Public
 * hasBatteryChemistry) was served and signed with the parent. With nested enforcement these are
 * exactly the fields a reader below the term's tier no longer receives, so the list is the change a
 * tier edit makes to what is served. Terms that declare oec:accessLevelInherited take the parent's
 * tier and never appear.
 *
 * A parent embeds a term when its rdfs:range is one of the term's rdfs:domain classes. Terms whose
 * domain is a GS1 class (gs1:Product, gs1:Place, gs1:Organization) sit at the top level of a
 * record and are judged there, so they are not listed.
 *
 * Usage: tsx scripts/report-nested-tiers.ts [--json]
 */
import fs from "node:fs";
import path from "node:path";
import { globSync } from "node:fs";

const ROOT = path.resolve(import.meta.dirname, "..");
const RANK = { Public: 0, AuthorizedOnly: 1, Restricted: 2 } as const;
type Tier = keyof typeof RANK;
interface Prop { id: string; localName: string; domain?: string[]; range?: string[]; accessLevel?: Tier; accessLevelInherited?: boolean; accessLevelMandatedBy?: string }

const props: { module: string; p: Prop }[] = [];
for (const f of globSync("extensions/{common,eu,us}/*/json/*.json", { cwd: ROOT })) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
  for (const p of (data.properties ?? []) as Prop[]) props.push({ module: f.split("/")[2], p });
}
const byRange = new Map<string, { module: string; p: Prop }[]>();
for (const e of props) for (const r of e.p.range ?? []) byRange.set(r, [...(byRange.get(r) ?? []), e]);

const rows: { module: string; term: string; tier: Tier; mandated: boolean; parents: string[] }[] = [];
for (const { module, p } of props) {
  if (!p.accessLevel || p.accessLevelInherited) continue;
  const parents = new Set<string>();
  for (const d of p.domain ?? []) {
    if (d.startsWith("gs1:") || d.startsWith("https://ref.gs1.org/voc/")) continue;
    for (const parent of byRange.get(d) ?? []) {
      const pt = parent.p.accessLevel;
      if (pt && RANK[pt] < RANK[p.accessLevel]) parents.add(`${parent.p.localName} (${pt})`);
    }
  }
  if (parents.size) rows.push({ module, term: p.localName, tier: p.accessLevel, mandated: !!p.accessLevelMandatedBy, parents: [...parents].sort() });
}
rows.sort((a, b) => Number(b.mandated) - Number(a.mandated) || a.module.localeCompare(b.module) || a.term.localeCompare(b.term));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.log(`${rows.length} term(s) tiered stricter than a parent that embeds them (${rows.filter((r) => r.mandated).length} mandated):`);
  for (const r of rows) console.log(`  ${r.module.padEnd(11)} ${r.term.padEnd(38)} ${r.tier.padEnd(15)}${r.mandated ? "mandated " : "         "} under ${r.parents.join(", ")}`);
}
