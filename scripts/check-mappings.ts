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
 *  4. SELF-REFERENCE. A mapping or rdfs:seeAlso whose target is the subject itself.
 *     Vacuous (SKOS mapping relations link ACROSS schemes) and it poisons tooling:
 *     vocab-sync seeds existing mapping targets into its upstream index, so a
 *     self-reference reappears as a candidate and the panel "confirms" mapping the
 *     term to itself.
 *
 *  6. INVERTED TOWARD A GENERAL FOUNDATIONAL TERM. skos:narrowMatch aimed at one of
 *     the generic Layer-1 head terms in GENERAL_L1_TERMS (a plain identifier, URL,
 *     instruction, certification, category, country, location, document, ...). Nothing a
 *     regulation module defines is broader than those, so the relation is inverted: SKOS
 *     reads `A skos:narrowMatch B` as "B is narrower than A". The 2026-07 sweep corrected
 *     174 such assertions. Two kinds of pair are allowlisted instead: our term is a TYPE or
 *     CATEGORY and the target denotes the entity itself, so neither direction fits; or our term
 *     is a CONTAINER or LIST that aggregates the upstream concept (eudr:originDetails holds a
 *     country plus a geolocation and a producer), where being the broader term is correct.
 *
 *  5. UNVERIFIED SEMICeu TARGET: any cv:/cccev:/locn:/adms:/cpsv:/foaf:/
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

/** Prefixes that denote the SAME namespace, so a term verified under one is
 *  verified under the other. `cv:` and `cccev:` both expand to
 *  http://data.europa.eu/m8g/. CCCEV terms are commonly written with the
 *  `cccev:` alias to show which SEMICeu vocabulary they come from, and the
 *  registry happens to list many of them under `cv:`. Comparing prefix strings
 *  without this would reject a term that is already verified. */
const PREFIX_ALIASES: Record<string, string[]> = { cv: ["cccev"], cccev: ["cv"] };

/** Is this SEMICeu CURIE verified, under its own prefix or an equivalent one? */
function semiceuVerified(curie: string): boolean {
  if (SEMICEU.has(curie)) return true;
  const [px, local] = curie.split(":");
  return (PREFIX_ALIASES[px] ?? []).some((alt) => SEMICEU.has(`${alt}:${local}`));
}

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
 *
 * Kept in scripts/mapping-allowlist.json rather than inline, because the audit triage needs the
 * same list: an entry records a decision, so a panel may not propose reversing it. When the two
 * disagreed, the textile panel proposed flipping eutex:seasonCollection, whose narrowMatch is
 * intentional.
 */
const ALLOW = new Map<string, string>(
  (JSON.parse(readFileSync(join(__dirname, "mapping-allowlist.json"), "utf8")).allow as {
    subject: string; relation: string; target: string; reason: string;
  }[]).map((a) => [`${a.subject}|${a.relation}|${a.target}`, a.reason]),
);

/**
 * Namespace to prefix, so a target written as a full IRI in angle brackets is checked like
 * the CURIE form. Without this the guard simply did not see those mappings: its matcher only
 * recognised CURIEs, and six inverted directions hid behind `<https://schema.org/...>`.
 */
const NS_TO_PREFIX: [string, string][] = [
  ["https://ref.gs1.org/voc/", "gs1:"],
  ["https://schema.org/", "schema:"],
  ["http://schema.org/", "schema:"],
  ["http://data.europa.eu/m8g/", "cv:"],
  ["http://www.w3.org/ns/locn#", "locn:"],
  ["http://www.w3.org/ns/adms#", "adms:"],
  ["http://purl.org/vocab/cpsv#", "cpsv:"],
  ["http://www.w3.org/ns/org#", "org:"],
  ["http://xmlns.com/foaf/0.1/", "foaf:"],
  ["https://dpp-keystone.org/spec/v2/terms#", "dppk:"],
  ["https://vocabulary.uncefact.org/untp/", "untp:"],
];

/** `<https://schema.org/category>` -> `schema:category`; anything else is returned as is. */
function toCurie(target: string): string {
  if (!target.startsWith("<")) return target;
  const iri = target.slice(1, -1);
  for (const [ns, px] of NS_TO_PREFIX) if (iri.startsWith(ns)) return px + iri.slice(ns.length);
  return target;
}

/**
 * Generic Layer-1 head terms. A project term that maps to one of these is the narrower of
 * the pair, so only skos:broadMatch (or exact/close) is meaningful; skos:narrowMatch here
 * asserts the reverse of what it means. Keep this list to terms that are unambiguously
 * general: a bare identifier, URL, instruction, certification, category, place, document.
 */
const GENERAL_L1_TERMS = new Set([
  "schema:identifier", "adms:identifier", "gs1:productID", "schema:serialNumber", "gs1:hasBatchLotNumber",
  "gs1:instructions", "gs1:instructionsForUse", "gs1:consumerUsageInstructions",
  "gs1:referencedFileURL", "schema:url", "gs1:certificationAgencyURL",
  "gs1:sustainabilityInfo", "gs1:safetyInfo", "gs1:consumerSafetyInformation", "gs1:serviceInfo",
  "gs1:certification", "gs1:certificationInfo", "gs1:certificationIdentification", "gs1:CertificationDetails",
  "schema:hasCertification", "schema:Certification",
  "gs1:regulatoryReferenceNumber", "gs1:regulatoryVerificationNumber", "gs1:registryEntry", "gs1:regulatoryInformation",
  "gs1:manufacturingPlant", "gs1:location", "gs1:locationDescription", "locn:location", "locn:Location",
  "schema:location", "schema:Place",
  "schema:CategoryCode", "schema:CategoryCodeSet", "schema:category", "gs1:additionalProductClassificationCode",
  "schema:ChemicalSubstance", "schema:Substance", "gs1:AllergenDetails",
  "schema:DigitalDocument", "foaf:Document", "schema:Report",
  "schema:StatusEnumeration", "schema:inLanguage", "schema:ratingValue",
  "gs1:countryOfOriginStatement", "gs1:countryOfOrigin", "gs1:countryCode",
  "gs1:WearableProduct", "schema:Product", "schema:IndividualProduct",
  "gs1:size", "schema:size", "gs1:organizationRole", "schema:provider",
  "schema:addressCountry", "schema:orderNumber", "gs1:certificationType",
  "gs1:ingredientContentPercentage", "gs1:textileMaterialPercentage", "gs1:organicPercentClaim",
  "gs1:textileMaterialContent", "schema:material", "schema:activeIngredient", "schema:chemicalComposition",
]);

/**
 * schema.org identifiers scoped to a single item, read from the domains rather than named by
 * hand: a term that applies to IndividualProduct and not to Product identifies one piece.
 * Today that is schema:serialNumber alone; deriving it keeps the rule current if more appear.
 */
const ITEM_SCOPED = new Set(
  Object.entries(SCHEMA.terms)
    .filter(([, e]) => (e.domains ?? []).includes("IndividualProduct") && !(e.domains ?? []).includes("Product"))
    .map(([k]) => k),
);
/** Subject names that denote a production or delivery group rather than one piece. */
const BATCH_LEVEL = /(^|[a-z])(Lot|Batch|Heat|Cast|Melt|Coil)([A-Z]|$)|^(lot|batch|heat|cast|melt|coil)/;

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

/**
 * Blank the contents of triple-quoted literals, keeping every newline so line
 * numbers and offsets stay valid. Prose inside a skos:note routinely starts a line
 * with a CURIE ("schema:Product is the universal root."), which the subject-block
 * scanner below would read as a new subject: the real subject's block would then be
 * cut short and its mappings attributed to a term that has no rdfs:subClassOf, so
 * the direction rule silently stopped firing. Strip the literals first.
 */
function blankLongLiterals(ttl: string): string {
  return ttl.replace(/"""[\s\S]*?"""/g, (lit) => '""' + lit.replace(/[^\n]/g, " ").slice(2) + '""');
}

for (const f of ttlFiles(join(PROJECT_ROOT, "extensions"))) {
  const ttl = blankLongLiterals(readFileSync(f, "utf8"));
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
    for (const m of block.matchAll(/skos:(exactMatch|closeMatch|broadMatch|narrowMatch)\s+(<[^>]+>|[A-Za-z]\w*:[\w-]+)/g)) {
      const [_, relName, rawTarget] = m;
      const target = toCurie(rawTarget);
      const key = `${subj}|${relName}|${target}`;
      if (ALLOW.has(key)) continue;

      // 4. self-reference: the subject mapped to itself
      if (target === subj) {
        violations.push({ file: rel, subject: subj, detail: `skos:${relName} ${target} maps the term to itself; a mapping relation links across schemes` });
        continue;
      }

      // 6. inverted direction toward a general foundational term
      if (relName === "narrowMatch" && GENERAL_L1_TERMS.has(target)) {
        violations.push({ file: rel, subject: subj, detail: `skos:narrowMatch ${target} inverts the relation: ${target} is a general foundational term, so this term is the narrower one; use skos:broadMatch` });
        continue;
      }

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
        // 3c. identifier granularity: a batch-level identifier under an item-scoped one.
        // A heat, cast, melt or lot number names the group every piece came from, while an
        // item-scoped identifier names one piece, so neither subsumes the other and the
        // pointer belongs in rdfs:seeAlso. Applies to graded relations only.
        if (ITEM_SCOPED.has(local) && BATCH_LEVEL.test(subj.split(":")[1] ?? "")) {
          violations.push({ file: rel, subject: subj, detail: `skos:${relName} schema:${local} — schema:${local} is domained on IndividualProduct (one piece) while this term identifies a batch; use rdfs:seeAlso` });
        }
      } else if (SEMICEU_PREFIXES.has(px)) {
        // 4. SEMICeu target must be dereference-verified
        if (!semiceuVerified(target)) {
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
