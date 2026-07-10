/**
 * SKOS mapping sanity guard.
 *
 * Validates every skos:exactMatch / closeMatch / broadMatch / narrowMatch in the
 * extension ontologies against the three foundational peers. Catches the error
 * classes found in the 2026-07 vocabulary audit:
 *
 *  1. FOREIGN-DOMAIN TARGET — a mapping to an upstream term whose declared
 *     domain belongs to a semantically foreign area (keyword-matched anchors:
 *     gs1:maximumOptimumConsumptionTemperature = drinking temperature,
 *     schema:fuelCapacity = vehicle fuel tank, schema:fiberContent = dietary
 *     fibre, schema:doseValue = medication dose, ...). Related-but-different
 *     terms belong in rdfs:seeAlso, not in a mapping relation.
 *
 *  2. INVERTED DIRECTION — skos:narrowMatch toward a target the subject
 *     rdfs:subClassOf / rdfs:subPropertyOf. Project convention: broadMatch =
 *     "this term is narrower than the target".
 *
 *  3. SUPERSEDED / KIND MISMATCH (schema.org) — mapping to a supersededBy'd
 *     term, or a property mapped to a class (and vice versa).
 *
 *  4. UNVERIFIED SEMICeu TARGET — any cv:/cccev:/locn:/adms:/cpsv:/foaf:/
 *     legal:/org: mapping target must be listed in scripts/semiceu-terms.json
 *     (dereference-verified; cv:LegalEntity famously does not exist — the term
 *     lives at legal:LegalEntity).
 *
 * Data: scripts/gs1-domains.json + scripts/schema-domains.json (committed
 * snapshots; refresh alongside `pnpm run sync:vocab`) and
 * scripts/semiceu-terms.json (manually dereference-verified).
 *
 * Deliberate cross-domain anchors live in ALLOW with a justification.
 *
 * Usage: npx tsx scripts/check-mappings.ts
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

const GS1 = JSON.parse(readFileSync(join(__dirname, "gs1-domains.json"), "utf8")) as {
  propDomain: Record<string, string>;
};
const SCHEMA = JSON.parse(readFileSync(join(__dirname, "schema-domains.json"), "utf8")) as {
  terms: Record<string, { kind: string; domains?: string[]; supersededBy?: string[] }>;
};
const SEMICEU = new Set<string>(
  (JSON.parse(readFileSync(join(__dirname, "semiceu-terms.json"), "utf8")) as { verified: string[] }).verified,
);

/** GS1 domains that are foreign to a DPP product context unless allowlisted. */
const GS1_FOREIGN = /^(FoodAndBeverage|FoodBeverageTobacco|Meat|Seafood|Fruits|Milk|Beverage|Offer|Demand|Transaction)/;
/** schema.org domains that mark a term as belonging to a foreign area. */
const SCHEMA_FOREIGN = new Set([
  "NutritionInformation", "Vehicle", "Clip", "Episode", "TVSeries", "APIReference",
  "SoftwareApplication", "DoseSchedule", "MedicalProcedure", "Drug", "PaymentCard",
  "LoyaltyProgram", "FinancialProduct", "Offer", "Demand", "MusicRecording", "Movie",
  "BroadcastService", "Recipe", "MenuItem", "ServiceChannel", "Flight",
]);

/**
 * Deliberate cross-domain anchors, each with a reason. Key: `subject|relation|target`.
 */
const ALLOW = new Map<string, string>([
  // Detergent ingredients are the documented analogue of GS1's food ingredient
  // model (see eudet:Ingredient's skos:note) — the anchor is intentional.
  ["eudet:ingredientList|narrowMatch|gs1:ingredientStatement", "documented food-ingredient analogue"],
  ["eudet:ingredientList|broadMatch|gs1:ingredientName", "documented food-ingredient analogue"],
  ["eudet:phosphorusContentPercent|narrowMatch|gs1:ingredientContentPercentage", "documented food-ingredient analogue"],
  // Textile terms may map to WearableProduct-scoped GS1 terms.
  ["eutex:syntheticFiberContent|narrowMatch|gs1:textileMaterialContent", "textile module; WearableProduct scope fits"],
  ["eutex:recycledContentDeclaration|narrowMatch|gs1:textileMaterialContent", "textile module; WearableProduct scope fits"],
  ["eutex:sizeRange|narrowMatch|gs1:size", "textile module; WearableProduct scope fits"],
  ["eutex:seasonCollection|narrowMatch|gs1:seasonCalendarYear", "textile module; WearableProduct scope fits"],
  ["eutex:seasonCollection|narrowMatch|gs1:seasonName", "textile module; WearableProduct scope fits"],
  ["eutex:seasonCollection|broadMatch|gs1:seasonParameter", "textile module; WearableProduct scope fits"],
]);

const SEMICEU_PREFIXES = new Set(["cv", "cccev", "locn", "adms", "cpsv", "foaf", "legal", "org"]);
const RELS = ["exactMatch", "closeMatch", "broadMatch", "narrowMatch"];

interface Violation { file: string; subject: string; detail: string; }
const violations: Violation[] = [];

function ttlFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) ttlFiles(p, out);
    else if (entry.endsWith(".ttl") && p.includes("/ontology/")) out.push(p);
  }
  return out;
}

for (const f of ttlFiles(join(PROJECT_ROOT, "extensions"))) {
  const ttl = readFileSync(f, "utf8");
  const rel = relative(PROJECT_ROOT, f);
  const isTextile = rel.includes("/textile/");
  // subject blocks: line-initial CURIE to the next line-initial CURIE
  const bounds = [...ttl.matchAll(/^([a-z]+:[\w-]+)(?:\s|$)/gm)];
  for (let i = 0; i < bounds.length; i++) {
    const subj = bounds[i][1];
    const start = bounds[i].index!;
    const end = i + 1 < bounds.length ? bounds[i + 1].index! : ttl.length;
    const block = ttl.slice(start, end);
    const supers = new Set(
      [...block.matchAll(/rdfs:sub(?:ClassOf|PropertyOf)\s+([A-Za-z]\w*:[\w-]+)/g)].map((m) => m[1]),
    );
    for (const m of block.matchAll(/skos:(exactMatch|closeMatch|broadMatch|narrowMatch)\s+([A-Za-z]\w*:[\w-]+)/g)) {
      const [_, relName, target] = m;
      const key = `${subj}|${relName}|${target}`;
      if (ALLOW.has(key)) continue;

      // 2. inverted direction: narrowMatch toward own superclass/superproperty
      if (relName === "narrowMatch" && supers.has(target)) {
        violations.push({ file: rel, subject: subj, detail: `skos:narrowMatch ${target} but rdfs:sub*Of ${target} — the subject is NARROWER; use skos:broadMatch` });
        continue;
      }

      const [px, local] = target.split(":", 2);
      if (px === "gs1") {
        // 1. foreign gs1 domain
        const dom = GS1.propDomain[local];
        if (dom && GS1_FOREIGN.test(dom) && !(isTextile && /^(Wearable|Clothing|Footwear)/.test(dom))) {
          violations.push({ file: rel, subject: subj, detail: `skos:${relName} gs1:${local} — gs1 domain ${dom} is semantically foreign; use rdfs:seeAlso or drop` });
        }
      } else if (px === "schema") {
        const e = SCHEMA.terms[local];
        if (!e) {
          violations.push({ file: rel, subject: subj, detail: `skos:${relName} schema:${local} — term does not exist on schema.org` });
          continue;
        }
        // 3a. superseded
        if (e.supersededBy?.length) {
          violations.push({ file: rel, subject: subj, detail: `skos:${relName} schema:${local} — SUPERSEDED by schema:${e.supersededBy.join(", ")}` });
        }
        // 1. foreign schema domain (only when ALL declared domains are foreign)
        const doms = e.domains ?? [];
        if (doms.length && doms.every((d) => SCHEMA_FOREIGN.has(d))) {
          violations.push({ file: rel, subject: subj, detail: `skos:${relName} schema:${local} — schema domain ${doms.join("/")} is semantically foreign; use rdfs:seeAlso or drop` });
        }
        // 3b. kind mismatch: subject kind from the `a <types>` clause only
        // (never from the subject NAME — e.g. oec:energyEfficiencyClass is a property)
        const aClause = block.match(/\ba\s+([^;.]+)[;.]/)?.[1] ?? "";
        const subjKind = /Property\b/.test(aClause) ? "property" : /Class\b/.test(aClause) ? "class" : null;
        if (subjKind && (e.kind === "class" || e.kind === "property") && subjKind !== e.kind) {
          violations.push({ file: rel, subject: subj, detail: `skos:${relName} schema:${local} — ${subjKind} mapped to a schema ${e.kind}` });
        }
      } else if (SEMICEU_PREFIXES.has(px)) {
        // 4. SEMICeu target must be dereference-verified
        if (!SEMICEU.has(target)) {
          violations.push({ file: rel, subject: subj, detail: `skos:${relName} ${target} — not in scripts/semiceu-terms.json; dereference the IRI and add it once verified (cv:LegalEntity does NOT exist — use legal:LegalEntity)` });
        }
      }
      // other prefixes (cirpass2/untp/dppk/samm/bpr/rail/oec-internal): no upstream
      // ground truth available here — covered by their own module audits.
    }
  }
}

console.log(`check:mappings — SKOS mapping sanity across extension ontologies`);
if (violations.length) {
  console.error(`\n${violations.length} mapping violation(s):`);
  for (const v of violations) console.error(`  ✖ ${v.subject} — ${v.detail}\n      in ${v.file}`);
  process.exit(1);
}
console.log("All SKOS mappings point at existing, semantically plausible upstream terms with consistent direction.");
