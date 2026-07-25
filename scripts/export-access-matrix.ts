/**
 * Export the ESPR access-tier review matrix.
 *
 * Produces, under scripts/out/access-matrix/:
 *   - <module>.md   one review table per module:
 *       term | label | tier | mandated | source | rationale | notes
 *     (notes: inherited marker, alias collisions with other modules)
 *   - collisions.md the cross-module bare-alias sheet (differing tiers = the
 *     enforcement-relevant ones, same-tier listed for completeness)
 *   - summary.md    tier-distribution table per module + coverage counts
 *
 * This is the HUMAN REVIEW artifact for the re-curation workflow: the curated
 * sidecars are only merged after these matrices are approved. Run after
 * build:json. Run: pnpm run export:access-matrix
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");
const OUT = join(ROOT, "scripts", "out", "access-matrix");

const MODULE_JSON: Array<{ rel: string; regulation: string }> = [
  { rel: "extensions/common/core/json/dpp-core.json", regulation: "ESPR 2024/1781 Art. 7–9, Annex III" },
  { rel: "extensions/common/gs1-masterdata/json/gs1-masterdata.json", regulation: "GS1 Web Vocabulary / ESPR consumer-information baseline" },
  { rel: "extensions/eu/battery/json/battery.json", regulation: "Battery Regulation (EU) 2023/1542, Annex XIII + Art. 14" },
  { rel: "extensions/eu/eudr/json/eudr.json", regulation: "EUDR (EU) 2023/1115, Art. 9–12 (DDS)" },
  { rel: "extensions/eu/textile/json/textile.json", regulation: "ESPR textile delegated act (draft) / Textile Labelling 1007/2011" },
  { rel: "extensions/eu/electronics/json/electronics.json", regulation: "Energy Labelling 2017/1369 (EPREL) / Ecodesign" },
  { rel: "extensions/eu/detergent/json/detergent.json", regulation: "Detergents Regulation 648/2004 (+ 2024 revision)" },
  { rel: "extensions/eu/ppwr/json/ppwr.json", regulation: "PPWR (EU) 2025/40" },
  { rel: "extensions/eu/cpr/json/cpr.json", regulation: "CPR (EU) 2024/3110 (DoP/DoC publicity)" },
  { rel: "extensions/eu/iron-steel/json/iron-steel.json", regulation: "CBAM (EU) 2023/956" },
  { rel: "extensions/us/fsma204/json/fsma204.json", regulation: "FSMA 204 (21 CFR 1.1455 records access)" },
];

interface Term {
  localName: string;
  label?: string;
  accessLevel?: string;
  accessLevelMandatedBy?: string;
  accessLevelRationale?: string;
  accessLevelSource?: string;
  accessLevelInherited?: boolean;
}

function esc(s: string | undefined): string {
  return (s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
}

function shortIri(iri: string | undefined): string {
  if (!iri) return "";
  return iri.replace("https://eur-lex.europa.eu/eli/", "eli/").replace("https://eur-lex.europa.eu/", "");
}

mkdirSync(OUT, { recursive: true });

// localName -> [{module, tier}] across modules (annotated, non-inherited only)
const byAlias = new Map<string, Array<{ module: string; tier: string }>>();
const summaries: string[] = [];

for (const { rel, regulation } of MODULE_JSON) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) continue;
  const moduleName = rel.split("/").pop()!.replace(".json", "");
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const properties: Term[] = doc.properties ?? [];

  for (const p of properties) {
    if (p.accessLevel && !p.accessLevelInherited) {
      const list = byAlias.get(p.localName) ?? [];
      list.push({ module: moduleName, tier: p.accessLevel });
      byAlias.set(p.localName, list);
    }
  }

  const counts: Record<string, number> = { Public: 0, AuthorizedOnly: 0, Restricted: 0, inherited: 0, unclassified: 0, mandated: 0 };
  const rows: string[] = [];
  const sorted = [...properties].sort((a, b) => a.localName.localeCompare(b.localName));
  for (const p of sorted) {
    const tier = p.accessLevelInherited ? "(inherited)" : (p.accessLevel ?? "UNCLASSIFIED");
    if (p.accessLevelInherited) counts.inherited++;
    else if (p.accessLevel) counts[p.accessLevel] = (counts[p.accessLevel] ?? 0) + 1;
    else counts.unclassified++;
    if (p.accessLevelMandatedBy) counts.mandated++;
    rows.push(`| \`${p.localName}\` | ${esc(p.label)} | **${tier}** | ${p.accessLevelMandatedBy ? "🔒 " + shortIri(p.accessLevelMandatedBy) : ""} | ${shortIri(p.accessLevelSource)} | ${esc(p.accessLevelRationale)} |`);
  }

  const md = [
    `# Access-tier review matrix — ${moduleName}`,
    "",
    `Regulatory frame: ${regulation}`,
    "",
    `Coverage: ${properties.length} properties — ${counts.Public} Public / ${counts.AuthorizedOnly} AuthorizedOnly / ${counts.Restricted} Restricted / ${counts.inherited} inherited / ${counts.unclassified} UNCLASSIFIED; ${counts.mandated} legally locked.`,
    "",
    "| Term | Label | Tier | Mandated (locked) | Source | Rationale |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
  writeFileSync(join(OUT, `${moduleName}.md`), md);

  summaries.push(`| ${moduleName} | ${properties.length} | ${counts.Public} | ${counts.AuthorizedOnly} | ${counts.Restricted} | ${counts.inherited} | ${counts.unclassified} | ${counts.mandated} |`);
  console.log(`  ${moduleName.padEnd(16)} ${String(properties.length).padStart(4)} terms -> scripts/out/access-matrix/${moduleName}.md`);
}

// Collision sheet
const differing: string[] = [];
const same: string[] = [];
for (const [localName, entries] of [...byAlias].sort(([a], [b]) => a.localeCompare(b))) {
  if (entries.length < 2) continue;
  const detail = entries.map((e) => `${e.module}: ${e.tier}`).join(", ");
  if (new Set(entries.map((e) => e.tier)).size > 1) {
    differing.push(`| \`${localName}\` | ${detail} | ⚠️ enforcement uses the STRICTEST for the bare alias |`);
  } else {
    same.push(`| \`${localName}\` | ${detail} | consistent |`);
  }
}
writeFileSync(join(OUT, "collisions.md"), [
  "# Cross-module bare-alias collisions",
  "",
  "Served documents are matched by bare local name as well as curie; a name shared",
  "across modules with DIFFERING tiers resolves to the strictest. Differing entries",
  "must be reconciled or explicitly waived (scripts/access-level-waivers.json).",
  "",
  "## Differing tiers (action required)",
  "",
  "| Local name | Module tiers | Effect |",
  "|---|---|---|",
  ...(differing.length ? differing : ["| _none_ | | |"]),
  "",
  "## Same tier in all modules (informational)",
  "",
  "| Local name | Module tiers | Effect |",
  "|---|---|---|",
  ...(same.length ? same : ["| _none_ | | |"]),
  "",
].join("\n"));

writeFileSync(join(OUT, "summary.md"), [
  "# Access-tier coverage summary",
  "",
  "| Module | Terms | Public | AuthorizedOnly | Restricted | Inherited | UNCLASSIFIED | Locked |",
  "|---|---|---|---|---|---|---|---|",
  ...summaries,
  "",
  `Differing-tier alias collisions: ${differing.length} (see collisions.md).`,
  "",
].join("\n"));

console.log(`\naccess-matrix: ${summaries.length} module matrices + collisions.md + summary.md -> scripts/out/access-matrix/`);
