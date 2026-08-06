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
 *     174 such assertions. A CONTAINER or LIST term that aggregates the upstream concept is
 *     allowlisted instead (eudr:hasOriginDetails holds a country plus a geolocation and a
 *     producer), because being the broader term is correct there.
 *
 *  7. VALUE SPACE MAPPED ONTO AN ENTITY CLASS. A closed list of codes and the class of things
 *     those codes classify sit at different levels, so no graded relation between them holds
 *     in either direction: eudet:ProductForm is not broader than gs1:Product, and
 *     eucpr:ConstructionProductType is not narrower than dppk:BatteryProduct. 31 such
 *     assertions were downgraded to rdfs:seeAlso in 2026-07; the graded mapping of a value
 *     space belongs on another value space, the way eudet:DetergentCategory anchors to
 *     schema:CategoryCode. Checked BEFORE rule 6, since at different levels the question of
 *     which term is narrower does not arise and rule 6 would advise flipping the direction,
 *     which only mirrors the confusion. An intra-project target is left to the separate
 *     question of what cross-references inside this project should be.
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
 * Generic Layer-1 head terms, in scripts/general-l1-terms.json so the audit triage reads the same list.
 * See that file for why it is shared.
 */
const GENERAL_L1_TERMS = new Set<string>(
  JSON.parse(readFileSync(join(__dirname, "general-l1-terms.json"), "utf8")).terms as string[],
);

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

/**
 * `rule`, `relation` and `target` are set where a fix can be applied mechanically, so
 * `--json` can drive one instead of a script re-deriving the census by parsing this output.
 */
interface Violation {
  file: string; subject: string; detail: string;
  rule?: string; relation?: string; target?: string;
}
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

/**
 * Serialisation slots: properties that carry a number or a string wherever a vocabulary needs
 * one. They denote no concept, so no graded relation against them is meaningful. The general
 * value CLASSES (schema:StructuredValue, schema:PropertyValueSpecification) are not slots and
 * are handled as ordinary general head terms.
 */
const VALUE_SLOTS = new Set(["gs1:value", "schema:value", "schema:minValue", "schema:maxValue"]);

/** The namespaces this project governs, so a target inside them is a cross-reference. */
const OUR_PREFIXES = new Set(["oec", "eubat", "eutex", "euelec", "eudet", "eucpr", "eusteel", "eudr", "euppwr", "usfsma"]);

/** Names that denote a closed set of codes rather than a set of things. */
const VALUE_SPACE_SUFFIX = /(Type|Types|Category|Categories|Class|Code|Codes|CodeSet|Status|Enumeration|Tier|Grade|Level|Scheme|Form)$/;

/**
 * Is this subject a value space: an enumeration, or a class named for one?
 *
 * Properties are excluded even when named like one, because `oec:hasDocumentType` is a property
 * whose values are codes rather than a class of codes, and a property-to-property mapping is
 * a different question.
 */
function isValueSpace(subj: string, block: string): boolean {
  const aClause = block.match(/\ba\s+([^;.]+)[;.]/)?.[1] ?? "";
  if (/Property\b/.test(aClause)) return false;
  if (/\bowl:oneOf\b/.test(block)) return true;
  return VALUE_SPACE_SUFFIX.test(subj.split(":")[1] ?? "");
}

/**
 * Does this target denote a class of THINGS, as opposed to a property or a value space?
 *
 * Read from the local name: an initial capital marks a class in every vocabulary this project
 * maps onto, and a value-space suffix marks a code list, which is a legitimate partner for one
 * of ours. schema.org is checked against its own kind data first, since it is available.
 */
function isEntityClass(target: string): boolean {
  const [px, local] = target.split(":", 2);
  if (!local || !/^[A-Z]/.test(local)) return false;
  if (VALUE_SPACE_SUFFIX.test(local)) return false;
  if (px === "schema") return SCHEMA.terms[local]?.kind !== "property";
  return true;
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
    // 11. the same term claimed both broader and narrower than one concept. Two vocabularies often
    // render the same attribute under the same name, and BatteryPass ships two of its own: the
    // consortium SAMM model and the GEFEG longlist mirrored as bpr:. Seven battery terms carried
    // broadMatch toward the samm: rendering and narrowMatch toward the bpr: one, which cannot both
    // hold. Compared on the normalised local name, so it sees across vocabularies.
    const directions = new Map<string, Set<string>>();
    for (const m of block.matchAll(/skos:(broadMatch|narrowMatch)\s+(<[^>]+>|[A-Za-z]\w*:[\w-]+)/g)) {
      const local = (m[2].replace(/[<>]/g, "").split(/[#/]/).pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!directions.has(local)) directions.set(local, new Set());
      directions.get(local)!.add(m[1]);
    }
    for (const [local, rels] of directions) {
      if (rels.size < 2) continue;
      violations.push({
        file: rel, subject: subj, rule: "contradictory-directions",
        detail: `is asserted both broader and narrower than "${local}"; two renderings of one concept cannot stand in opposite relations, so pick the direction the upstream model supports or drop to rdfs:seeAlso`,
      });
    }

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

      // 10. a module term claiming to be broader than a common-core term. The layering puts
      // oec: (Layer 3) above the regulation modules (Layer 4): a module defines what is unique to
      // one regulation, and anything cross-cutting moves down to core. So a module term is the
      // narrower of the pair by construction. 13 assertions had it the wrong way round, two of
      // them directly under a comment in electronics.ttl reading "Anchor electronics-specific
      // cross-cutting concepts upward to the lifted oec: terms".
      if (relName === "narrowMatch" && target.startsWith("oec:") && !subj.startsWith("oec:")
          && OUR_PREFIXES.has(subj.split(":")[0])) {
        violations.push({
          file: rel, subject: subj, rule: "module-over-core", relation: relName, target: rawTarget,
          detail: `skos:narrowMatch ${target} makes a module term broader than a common-core term, which inverts the layering; use skos:broadMatch, or rdfs:seeAlso where the relation is component-to-whole`,
        });
        continue;
      }

      // 9. a *Match relation inside a single scheme. SKOS reserves broadMatch/narrowMatch and
      // friends for concepts in DIFFERENT concept schemes; within one, the relations are
      // skos:broader / skos:narrower, or rdfs:subPropertyOf / rdfs:subClassOf where a genuine
      // subsumption holds. Each module here declares its own owl:Ontology, so a mapping from
      // eubat: to oec: is legitimately cross-scheme; a mapping from oec: to oec: is not. Four of
      // the eight that existed were also inverted, including oec:isStrategicRawMaterial against
      // oec:isCriticalRawMaterial, whose own rdfs:comment records "Strategic ⊂ Critical".
      if (target.split(":")[0] === subj.split(":")[0]) {
        violations.push({
          file: rel, subject: subj, rule: "match-within-one-scheme", relation: relName, target: rawTarget,
          detail: `skos:${relName} ${target} stays inside this vocabulary's own namespace, where SKOS uses skos:broader / skos:narrower (or rdfs:subPropertyOf / rdfs:subClassOf); the *Match relations link across schemes`,
        });
        continue;
      }

      // 8. graded mapping onto a serialisation slot. gs1:value, schema:value and the min/max
      // bounds carry a number or a string wherever a vocabulary needs one; they denote no concept,
      // so a subsumption claim against them says nothing. The 14 that existed contradicted each
      // other: oec:indicatorTotalValue was broader than schema:value while eucpr:hasCharacteristicValue
      // was both narrower than it and broader than schema:minValue.
      if (VALUE_SLOTS.has(target)) {
        violations.push({
          file: rel, subject: subj, rule: "graded-onto-value-slot", relation: relName, target: rawTarget,
          detail: `skos:${relName} ${target} maps onto a serialisation slot, which denotes no concept; use rdfs:seeAlso`,
        });
        continue;
      }

      // 7 before 6 on purpose: when the two terms sit at different levels, which of them is
      // narrower is not a question that arises, and rule 6 would advise flipping to broadMatch,
      // which only mirrors the confusion. `oec:ProductCategory narrowMatch schema:Product` was
      // reported that way while its gs1:Product twin was reported as the level error it is.
      if (isValueSpace(subj, block) && isEntityClass(target) && !OUR_PREFIXES.has(target.split(":")[0])) {
        violations.push({
          file: rel, subject: subj, rule: "value-space-to-entity", relation: relName, target: rawTarget,
          detail: `skos:${relName} ${target} maps a value space onto the class of things it classifies; neither direction subsumes, so use rdfs:seeAlso (and anchor the value space to a code list, as eudet:DetergentCategory does)`,
        });
        continue;
      }

      // 6. inverted direction toward a general foundational term
      if (relName === "narrowMatch" && GENERAL_L1_TERMS.has(target)) {
        violations.push({ file: rel, subject: subj, detail: `skos:narrowMatch ${target} inverts the relation: ${target} is a general foundational term, so this term is the narrower one; use skos:broadMatch` });
        continue;
      }

      // 7. value space mapped onto an entity class. A closed list of codes and the class of
      // things those codes classify are at different levels, so no graded relation between them
      // holds in either direction: eudet:ProductForm is not broader than gs1:Product, and
      // eucpr:ConstructionProductType is not narrower than dppk:BatteryProduct. The honest
      // relation is rdfs:seeAlso, with any graded mapping going to a value space of its own,
      // the way eudet:DetergentCategory anchors to schema:CategoryCode.

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
        // (never from the subject NAME — e.g. oec:hasEnergyEfficiencyClass is a property)
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

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(violations, null, 2));
  process.exit(0);
}

console.log(`check:mappings — SKOS mapping sanity across extension ontologies`);
if (violations.length) {
  console.error(`\n${violations.length} mapping violation(s):`);
  for (const v of violations) console.error(`  ✖ ${v.subject} — ${v.detail}\n      in ${v.file}`);
  process.exit(1);
}
console.log("All SKOS mappings point at existing, semantically plausible upstream terms with consistent direction.");
