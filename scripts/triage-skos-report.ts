#!/usr/bin/env tsx
/**
 * Triage a vocab-sync completeness report into what may be applied mechanically and
 * what needs a curator.
 *
 * The audit's QA panel says whether a mapping is real and which graded relation fits.
 * It does not know this project's conventions, so a confirmed finding still has to pass
 * the filters below before it may be written. Every one of them was added after a panel
 * proposed the thing it now refuses:
 *
 *   SKIP  intra-project target      mapping relations link ACROSS schemes; an oec:/module
 *                                   target is an internal cross-reference (rdfs:seeAlso).
 *   HOLD  recorded decision         the pair is in mapping-allowlist.json under a different
 *                                   relation, so the ontology already holds the answer. A
 *                                   proposal that lands ON an entry is pre-blessed and skips
 *                                   every mechanical filter below.
 *   HOLD  structural carrier        gs1:value / schema:value and friends are serialisation
 *                                   slots, not concepts. Checked on BOTH sides: the core panel
 *                                   proposed eleven mappings making oec:value the broader term
 *                                   of every specific value property it could find.
 *   HOLD  inverted direction        narrowMatch toward a general Layer-1 head term
 *                                   (general-l1-terms.json, shared with check:mappings rule 6).
 *   HOLD  identical local names     a subsumption between eubat:hasRatedMaximumPower and
 *                                   batterypass:ratedMaximumPower is not what a name match says;
 *                                   exactMatch or closeMatch is the question.
 *   HOLD  meta-class                schema:Class is the class of classes.
 *   HOLD  type versus entity        our term names a Type / Category / Class while the
 *                                   target denotes the entity itself, so neither
 *                                   subsumption direction fits.
 *   HOLD  level mismatch            a property mapped to a class, or the reverse.
 *   HOLD  foreign or retired target a foreign schema.org CLASS (schema:AutoRepair for a repair
 *                                   provider), a foreign GS1 or schema.org domain, or a term
 *                                   schema.org has superseded.
 *   APPLY direction flip            an existing graded relation whose direction the panel
 *                                   reverses: mechanical, the meaning was inverted.
 *   APPLY seeAlso upgrade           an existing rdfs:seeAlso the panel grades, above the
 *                                   confidence floor.
 *   APPLY new mapping               only from 0.80 QA confidence up; below that the tool's
 *                                   own gate would emit rdfs:seeAlso instead.
 *
 * Everything not in APPLY lands in HOLD with its reason, for
 * docs/skos-alignment/OPEN_DECISIONS.md. Read the APPLY list before writing it: the filters
 * cannot see a scope clause inside an upstream definition, which is why
 * scripts/skos-deferred.json exists.
 *
 * Usage: tsx scripts/triage-skos-report.ts <report.json> [--json]
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OWN = "https://ref.openepcis.io/extensions/";
const CARRIERS = new Set([
  "https://ref.gs1.org/voc/value", "https://schema.org/value",
  "https://schema.org/StructuredValue", "https://schema.org/PropertyValueSpecification",
  "https://schema.org/minValue", "https://schema.org/maxValue",
]);

/**
 * Our own structural value carriers. The CARRIERS check above looks at the target only, so the
 * core audit could propose eleven mappings making `oec:value` the broader term of every specific
 * value property it could find (`rail:topValue`, `schema:textValue`, `semic:hasValue`, ...). A
 * generic value slot mapped onto another vocabulary's value slot says nothing about meaning.
 */
const OUR_CARRIERS = new Set(["oec:value", "oec:unitCode"]);

/**
 * Generic Layer-1 head terms, from the list `check:mappings` rule 6 enforces. A proposal that
 * would introduce `narrowMatch` toward one of these is the inverted direction in a new mapping,
 * which the flip logic below only catches for relations that already exist.
 */
const GENERAL_L1: Set<string> = new Set(
  (() => {
    try { return JSON.parse(readFileSync("scripts/general-l1-terms.json", "utf8")).terms as string[]; }
    catch { return []; }
  })(),
);
const META = new Set(["https://schema.org/Class", "https://schema.org/DataType", "https://schema.org/Enumeration"]);
const FLOOR = 0.8;

/**
 * Pairs a curator has already looked at and parked. Without this an automated pass keeps
 * re-proposing what a human decided to leave alone, and the decision list and the ontology
 * drift apart. Edit scripts/skos-deferred.json to put one back in scope.
 */
const DEFERRED: Map<string, string> = (() => {
  const m = new Map<string, string>();
  try {
    for (const d of JSON.parse(readFileSync("scripts/skos-deferred.json", "utf8")).deferred ?? []) {
      m.set(`${d.ourId}|${d.upstreamIri}`, d.reason);
    }
  } catch { /* no list yet */ }
  return m;
})();

/**
 * schema.org areas that are foreign to a product passport. Same list `check:mappings` uses,
 * plus the broadcast specification: the panel confidently proposed
 * `eucpr:hasCharacteristicValue` -> `schema:broadcastFrequencyValue`, a radio term, for a
 * construction product characteristic. Meaning-level judgement cannot see domain scope.
 */
const SCHEMA_FOREIGN = new Set([
  "NutritionInformation", "Vehicle", "Clip", "Episode", "TVSeries", "APIReference",
  "SoftwareApplication", "DoseSchedule", "MedicalProcedure", "Drug", "PaymentCard",
  "LoyaltyProgram", "FinancialProduct", "Offer", "Demand", "MusicRecording", "Movie",
  "BroadcastService", "BroadcastFrequencySpecification", "Recipe", "MenuItem",
  "ServiceChannel", "Flight", "AutoRepair", "MotorcycleRepair", "Collection",
  "SportsActivityLocation", "SportsEvent", "ExerciseAction",
]);
const SCHEMA_DOMAINS: Record<string, { domains?: string[] }> = (() => {
  try {
    return JSON.parse(readFileSync("scripts/schema-domains.json", "utf8")).terms ?? {};
  } catch { return {}; }
})();

/**
 * GS1 areas foreign to a product passport, and the GS1 property domains, both as
 * `check:mappings` rule 1 uses them. Without this the triage proposes what the guard then
 * rejects: the textile panel confidently offered `eutex:substanceConcentration` ->
 * `gs1:juiceContentPercent`, a FoodBeverageTobaccoProduct term, for a chemical concentration.
 */
/**
 * The guard's deliberate-anchor list, as `subject|relation|target` with a CURIE target. Two
 * uses here: a proposal that lands on an entry is pre-blessed, so a mechanical filter must not
 * hold it; a proposal that CHANGES the relation of an entry is refused, because the entry is a
 * recorded decision. Without the second, the textile panel's flip of eutex:seasonCollection
 * would have overwritten the note explaining why its narrowMatch is intentional.
 */
const ALLOWED: Set<string> = new Set(
  (JSON.parse(readFileSync("scripts/mapping-allowlist.json", "utf8")).allow as {
    subject: string; relation: string; target: string;
  }[]).map((a) => `${a.subject}|${a.relation}|${a.target}`),
);
const ALLOWED_PAIRS: Set<string> = new Set(
  [...ALLOWED].map((k) => { const [s, , t] = k.split("|"); return `${s}|${t}`; }),
);

const TO_CURIE: [string, string][] = [
  ["https://ref.gs1.org/voc/", "gs1:"], ["https://schema.org/", "schema:"],
  ["http://schema.org/", "schema:"], ["http://data.europa.eu/m8g/", "cv:"],
  ["http://www.w3.org/ns/locn#", "locn:"], ["http://www.w3.org/ns/adms#", "adms:"],
  ["http://xmlns.com/foaf/0.1/", "foaf:"],
];
const curieOf = (iri: string) => {
  for (const [ns, px] of TO_CURIE) if (iri.startsWith(ns)) return px + iri.slice(ns.length);
  return iri;
};

const GS1_FOREIGN = /^(FoodAndBeverage|FoodBeverageTobacco|Meat|Seafood|Fruits|Milk|Beverage|Offer|Demand|Transaction)/;
const GS1_DOMAINS: Record<string, string> = (() => {
  try {
    return JSON.parse(readFileSync("scripts/gs1-domains.json", "utf8")).propDomain ?? {};
  } catch { return {}; }
})();

/** Layer-1 foundational vocabularies: a direction flip toward one of these is mechanical. */
const L1 = ["https://ref.gs1.org/voc/", "https://schema.org/", "http://schema.org/",
  "http://data.europa.eu/m8g/", "http://www.w3.org/ns/locn#", "http://www.w3.org/ns/adms#",
  "http://xmlns.com/foaf/0.1/"];

interface Finding {
  ourId: string; ourIri: string; ourType: string; upstreamIri: string; vocabId: string;
  proposedPredicate: string | null; existingPredicate: string | null;
  status: string; qaTier: string; qaConfidence: number; confidence: number; rationale: string;
}

/**
 * Enumeration classes, read from the ontologies: a class whose block carries `owl:oneOf` is a
 * closed value list, so mapping it onto an upstream class that denotes the entity itself is a
 * type-versus-entity confusion whichever direction is chosen. Name suffixes alone miss cases
 * like `euppwr:PackagingTier`, which is why this reads the source.
 */
function enumerationClasses(): Set<string> {
  const out = new Set<string>();
  const walk = (dir: string) => {
    for (const e of readdirSync(dir)) {
      const full = join(dir, e);
      if (statSync(full).isDirectory()) walk(full);
      else if (e.endsWith(".ttl") && full.includes("/ontology/") && !e.includes("access-levels")) {
        const ttl = readFileSync(full, "utf8").replace(/"""[\s\S]*?"""/g, '""');
        let subject: string | null = null;
        for (const line of ttl.split("\n")) {
          const m = /^([a-z]+:[\w-]+)(?:\s|$)/.exec(line);
          if (m) { subject = m[1]; continue; }
          if (subject && /^\s+owl:oneOf\b/.test(line)) out.add(subject);
        }
      }
    }
  };
  walk("extensions");
  return out;
}
const ENUMS = enumerationClasses();

const isTypeTerm = (id: string) =>
  ENUMS.has(id) || /(Type|Category|Class|Code|Status|Enumeration|Tier|Grade|Level|Scheme)$/.test(id.split(":")[1] ?? "");
/**
 * Does the target denote the entity itself, rather than a code list or enumeration?
 *
 * Type-to-type is a legitimate pair: `euelec:WEEECategory` under `schema:CategoryCode`, or an
 * efficiency-class enum under `schema:EnergyEfficiencyEnumeration`. Only a type mapped onto a
 * class of THINGS (`schema:Product`, `gs1:PackagingDetails`, `dppk:Component`) is the confusion
 * worth holding, so a target that names itself a code, enumeration or type is not an entity.
 */
function isEntityTarget(f: Finding): boolean {
  if (f.ourType !== "class") return false;
  const local = f.upstreamIri.split(/[#/]/).pop() ?? "";
  if (!local || /[a-z]/.test(local[0])) return false; // a property, not a class
  // Code / Enumeration / Type / Category name a value space. Group, List and Specification do
  // NOT: schema:ProductGroup is a group of products and schema:BroadcastFrequencySpecification
  // a specification, both entities.
  return !/(Code|Codes|Enumeration|Type|Types|Class|Category|Categories)$/.test(local);
}

/**
 * Is the target a class or a property, read from the initial capital of its local name?
 *
 * Every vocabulary we map onto follows the convention (GS1, schema.org, SEMICeu, UNTP,
 * DPP Keystone, BatteryPass SAMM), so it is a reliable signal. Returns null when the local
 * name starts with neither case, so an unusual name falls through rather than being guessed at.
 */
function targetKind(iri: string): "class" | "property" | null {
  const local = iri.split(/[#/]/).pop() ?? "";
  if (!local) return null;
  if (/^[A-Z]/.test(local)) return "class";
  if (/^[a-z]/.test(local)) return "property";
  return null;
}

function verdict(f: Finding): { action: "APPLY" | "HOLD" | "SKIP"; reason: string } {
  if (f.qaTier !== "STRONG") return { action: "SKIP", reason: `QA tier ${f.qaTier}` };
  if (!f.proposedPredicate) return { action: "SKIP", reason: "panel proposes no relation" };
  if (f.status === "OK") return { action: "SKIP", reason: "already asserted" };
  const parked = DEFERRED.get(`${f.ourId}|${f.upstreamIri}`);
  if (parked) return { action: "HOLD", reason: `deferred by a curator: ${parked}` };

  const curie = curieOf(f.upstreamIri);
  const proposedIsAllowed = ALLOWED.has(`${f.ourId}|${(f.proposedPredicate ?? "").replace("skos:", "")}|${curie}`);
  // The pair is on the allowlist under a DIFFERENT relation, so the recorded decision is the
  // one already in the ontology.
  if (!proposedIsAllowed && ALLOWED_PAIRS.has(`${f.ourId}|${curie}`)) {
    return { action: "HOLD", reason: "the asserted relation is a recorded decision in mapping-allowlist.json" };
  }
  if (f.upstreamIri.startsWith(OWN)) return { action: "SKIP", reason: "intra-project target" };

  // The mechanical filters are skipped for a pre-blessed proposal: an allowlist entry IS the
  // decision, so a rule must not overrule it. `eudr:hasCountryList narrowMatch gs1:countryOfOrigin`
  // is recorded as a container that aggregates the upstream concept, and the general-Layer-1 rule
  // below would otherwise hold it as an inverted direction.
  if (!proposedIsAllowed) {
    if (CARRIERS.has(f.upstreamIri)) return { action: "HOLD", reason: "target is a structural value carrier" };
    if (OUR_CARRIERS.has(f.ourId)) return { action: "HOLD", reason: "our term is a structural value carrier" };
    if (f.proposedPredicate === "skos:narrowMatch" && GENERAL_L1.has(curie)) {
      return { action: "HOLD", reason: `${curie} is a general Layer-1 term, so narrowMatch inverts the relation; broadMatch is the direction` };
    }
    // Identical local names on both sides, with a subsumption proposed between them. Two terms
    // that named themselves the same thing are candidates for exactMatch or closeMatch; claiming
    // one contains the other needs a reason a name match does not supply. The battery panel
    // proposed `eubat:hasHazardousSubstances` above `batterypass:hazardousSubstances` and
    // `eubat:hasRatedMaximumPower` above `batterypass:ratedMaximumPower`.
    const ourLocal = (f.ourId.split(":")[1] ?? "").toLowerCase();
    const upLocal = (f.upstreamIri.split(/[#/]/).pop() ?? "").toLowerCase();
    if (ourLocal && ourLocal === upLocal
        && (f.proposedPredicate === "skos:narrowMatch" || f.proposedPredicate === "skos:broadMatch")) {
      return { action: "HOLD", reason: `identical local names, so exactMatch or closeMatch is the question, not which contains which` };
    }
    if (META.has(f.upstreamIri)) return { action: "HOLD", reason: "target is a meta-class" };
    if (isTypeTerm(f.ourId) && isEntityTarget(f)) return { action: "HOLD", reason: "our term is a type, target is the entity" };
    // A graded relation holds between two concepts at the same level. The panel judges meaning,
    // so it happily proposes `eudr:hasTransformationLocation broadMatch locn:Location`, a property
    // under a class, while the same report already carries the correct `locn:location` pairing.
    const kind = targetKind(f.upstreamIri);
    if (kind && (f.ourType === "class" || f.ourType === "property") && kind !== f.ourType) {
      return { action: "HOLD", reason: `our term is a ${f.ourType}, target is a ${kind}` };
    }
  }
  if (f.upstreamIri.startsWith("https://ref.gs1.org/voc/") && !proposedIsAllowed) {
    const dom = GS1_DOMAINS[f.upstreamIri.slice("https://ref.gs1.org/voc/".length)];
    // Same textile exception the guard makes: a Wearable/Clothing/Footwear domain is native
    // to eutex:, foreign anywhere else.
    const nativeToTextile = f.ourId.startsWith("eutex:") && /^(Wearable|Clothing|Footwear)/.test(dom ?? "");
    if (dom && GS1_FOREIGN.test(dom) && !nativeToTextile) {
      return { action: "HOLD", reason: `gs1 domain ${dom} is foreign to a passport` };
    }
  }
  if (f.upstreamIri.startsWith("https://schema.org/")) {
    const local = f.upstreamIri.slice("https://schema.org/".length);
    // A foreign CLASS as the target, not just a property with a foreign domain. The domain check
    // below cannot see this, because a class has no domains: that is how `oec:DocumentReference`
    // reached the apply list under `schema:APIReference`, and `oec:RepairProvider` under
    // `schema:AutoRepair` and `schema:MotorcycleRepair`, car and motorcycle repair shops.
    if (SCHEMA_FOREIGN.has(local) && /^[A-Z]/.test(local)) {
      return { action: "HOLD", reason: `schema:${local} belongs to an area foreign to a passport` };
    }
    // schema.org retires a term by superseding it. The battery panel proposed
    // `schema:contactPoints`, retired in favour of `schema:contactPoint`, which the term already
    // mapped to; `check:mappings` rejected it after the fact, which is the guard doing its job but
    // a wasted round trip.
    const superseded = (SCHEMA_DOMAINS as Record<string, { supersededBy?: string[] }>)[local]?.supersededBy;
    if (superseded?.length) {
      return { action: "HOLD", reason: `schema:${local} is superseded by schema:${superseded.join(", ")}` };
    }
    const doms = SCHEMA_DOMAINS[local]?.domains ?? [];
    // Match check:mappings: a term is foreign only when EVERY declared domain is foreign.
    // schema:itemCondition also applies to Product, so a partial hit is not disqualifying.
    if (doms.length && doms.every((d) => SCHEMA_FOREIGN.has(d))) {
      return { action: "HOLD", reason: `every schema domain (${doms.join("/")}) is foreign to a passport` };
    }
  }

  const flip = f.existingPredicate && f.proposedPredicate &&
    new Set([f.existingPredicate, f.proposedPredicate]).size === 2 &&
    [f.existingPredicate, f.proposedPredicate].every((p) => p === "skos:narrowMatch" || p === "skos:broadMatch");
  if (flip) {
    // Toward a foundational term, a flip to broadMatch is provable from the layering, so
    // confidence does not gate it. A flip the OTHER way is not: it claims one of our terms is
    // broader than a Layer-1 term, which is the very error the 174-assertion sweep corrected, so
    // it needs the floor like any other judgement. `oec:activityClassification` was flipped to
    // narrowMatch against schema:naics at 0.73 on the unconditional path; it happens to be right,
    // because our property generalises over ISIC, NACE and NAICS, but the layering did not say so.
    const foundational = L1.some((ns) => f.upstreamIri.startsWith(ns));
    const provable = foundational && f.proposedPredicate === "skos:broadMatch";
    if (provable || f.qaConfidence >= FLOOR) {
      return {
        action: "APPLY",
        reason: `direction flip${provable ? "" : foundational ? " (toward Layer-1 but away from broadMatch, above the floor)" : " (peer profile, above the floor)"}`,
      };
    }
    return {
      action: "HOLD",
      reason: foundational
        ? `flip to ${f.proposedPredicate} would make our term broader than a Layer-1 term, and it is below the ${FLOOR} floor`
        : `direction flip toward a peer profile below the ${FLOOR} floor`,
    };
  }
  if (f.existingPredicate === "rdfs:seeAlso") {
    return f.qaConfidence >= FLOOR
      ? { action: "APPLY", reason: "grade an existing rdfs:seeAlso" }
      : { action: "HOLD", reason: `seeAlso upgrade below the ${FLOOR} floor` };
  }
  if (!f.existingPredicate) {
    return f.qaConfidence >= FLOOR
      ? { action: "APPLY", reason: "new mapping above the floor" }
      : { action: "HOLD", reason: `new mapping below the ${FLOOR} floor` };
  }
  return { action: "HOLD", reason: `regrade ${f.existingPredicate} to ${f.proposedPredicate}` };
}

const path = process.argv[2];
if (!path) { console.error("usage: tsx scripts/triage-skos-report.ts <report.json> [--json]"); process.exit(64); }
const doc = JSON.parse(readFileSync(path, "utf8"));
const findings: Finding[] = doc.findings ?? [];
const rows = findings.map((f) => ({ f, ...verdict(f) }));
const by = (a: string) => rows.filter((r) => r.action === a);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(
    by("APPLY").map((r) => ({
      ourId: r.f.ourId, upstreamIri: r.f.upstreamIri, predicate: r.f.proposedPredicate,
      existing: r.f.existingPredicate, qa: r.f.qaConfidence, reason: r.reason,
    })), null, 2));
  process.exit(0);
}

console.log(`${path.split("/").pop()}: ${findings.length} finding(s)`);
console.log(`  APPLY ${by("APPLY").length}   HOLD ${by("HOLD").length}   SKIP ${by("SKIP").length}\n`);
for (const label of ["APPLY", "HOLD"] as const) {
  const list = by(label).sort((a, b) => b.f.qaConfidence - a.f.qaConfidence);
  if (!list.length) continue;
  console.log(`=== ${label} (${list.length})`);
  for (const r of list) {
    const t = r.f.upstreamIri.split(/[#/]/).pop();
    console.log(
      `  ${r.f.qaConfidence.toFixed(2)} ${r.f.ourId.padEnd(36)} ` +
        `${(r.f.existingPredicate ?? "-").padEnd(17)} -> ${(r.f.proposedPredicate ?? "-").padEnd(17)} ` +
        `${(r.f.vocabId + ":" + t).padEnd(42)} ${r.reason}`,
    );
  }
  console.log("");
}
