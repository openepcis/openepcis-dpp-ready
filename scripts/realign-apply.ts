/**
 * Phase 2 — apply ontology realignment changes from the mapping JSON.
 *
 * For each row in docs/skos-alignment/ontology-realignment-mapping.json:
 *   REPLACE_WITH_GS1 / REPLACE_WITH_SCHEMA
 *     → delete the term's block from its TTL file
 *     → retarget any JSON-LD context aliases that pointed at the deleted term
 *     → record the deletion in the per-module CHANGELOG
 *   KEEP_LINK_GS1 / KEEP_LINK_SCHEMA
 *     → insert an equivalence/relation triple inside the term's TTL block
 *
 * Only TTL files and JSON-LD context files are edited; no examples or validation
 * rewrites are needed when the context retargets aliases — examples that use the
 * local key resolve to the new canonical IRI automatically. Validation profiles
 * that reference deleted IRIs directly (rare) are flagged for manual follow-up.
 *
 * Usage: npx tsx scripts/realign-apply.ts [--dry-run] [--module=NAME]
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

interface MappingRow {
  iri: string;
  prefix: string;
  localName: string;
  kind: "Class" | "DatatypeProperty" | "ObjectProperty" | "Property";
  label: string;
  module: string;
  moduleDir: string;
  moduleNamespace: string;
  domain: string[];
  range: string[];
  verdict: "REPLACE_WITH_GS1" | "REPLACE_WITH_SCHEMA" | "KEEP_LINK_GS1" | "KEEP_LINK_SCHEMA" | "KEEP_NO_LINK";
  canonical: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "—";
  rationale: string;
  canonicalIri: string;
  candidates: { vocab: string; iri: string; localName: string; labels: string[]; score: number; confidence: string; reason: string }[];
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const APPLY_MEDIUM_LINKS = args.includes("--include-medium");
const MODULE_FILTER = args.find((a) => a.startsWith("--module="))?.split("=")[1];

/**
 * Manual overrides for cases the heuristic auto-classifier got wrong.
 * Keys are `prefix:localName`. Each override either:
 *   - changes the verdict (e.g. force REPLACE → KEEP_NO_LINK to abort a wrong replacement)
 *   - retargets the canonical to a better candidate from the alternates list
 */
const OVERRIDES: Record<string, { verdict?: MappingRow["verdict"]; canonical?: string; reason: string }> = {
  // Sanity-check outliers flagged before Phase 2.
  "oec:massFraction": { verdict: "KEEP_NO_LINK", reason: "schema:weight is wrong — mass fraction is a percentage, not weight" },
  "oec:vatIdentificationNumber": { canonical: "schema:vatID", reason: "schema:vehicleIdentificationNumber is for cars; schema:vatID is the right canonical" },
  "eubat:facilityIdentifier": { verdict: "KEEP_NO_LINK", reason: "schema:cvdFacilityId is a covid-specific term, not a generic identifier" },
  "eubat:remainingCapacity": { verdict: "KEEP_NO_LINK", reason: "schema:remainingAttendeeCapacity is for events, not battery capacity" },
  // facility / mime / hazard / class noisy cross-domain links
  "oec:facilityType": { verdict: "KEEP_NO_LINK", reason: "gs1:collarType is wrong — facility type is unrelated to apparel" },
  "oec:mimeType": { verdict: "KEEP_NO_LINK", reason: "gs1:collarType is wrong — MIME type is a media format" },
  "oec:hazardImpact": { verdict: "KEEP_NO_LINK", reason: "schema:accessibilityHazard is for disability accommodations, not chemical hazards" },
  "oec:hazardClass": { verdict: "KEEP_NO_LINK", reason: "schema:accessibilityHazard is for disability accommodations" },
  "oec:HazardClass": { verdict: "KEEP_NO_LINK", reason: "schema:MapCategoryType is unrelated" },
  "oec:repairabilityClass": { verdict: "KEEP_NO_LINK", reason: "schema:biomechnicalClass is medical, not repair-related" },
  "oec:performanceClass": { verdict: "KEEP_NO_LINK", reason: "schema:biomechnicalClass is medical" },
  "oec:testedConditions": { verdict: "KEEP_NO_LINK", reason: "gs1:paymentTerms is unrelated" },
  "oec:carbonFootprint": { verdict: "KEEP_NO_LINK", reason: "schema:emissionsCO2 isn't a class to link to via seeAlso here; existing untp-core link is preferred" },
  "oec:carbonFootprintTotal": { verdict: "KEEP_NO_LINK", reason: "Existing owl:equivalentProperty untp-core:carbonFootprint is the strong link" },

  // schema:MapCategoryType is for cartographic categories — not appropriate for product/material categories
  "eubat:MaterialCategory": { verdict: "KEEP_NO_LINK", reason: "schema:MapCategoryType is geographic" },
  "eubat:BatteryCategory": { verdict: "KEEP_NO_LINK", reason: "schema:MapCategoryType is geographic" },
  "eutex:LCIACategory": { verdict: "KEEP_NO_LINK", reason: "schema:MapCategoryType is geographic" },
  "eutex:TextileCategory": { verdict: "KEEP_NO_LINK", reason: "schema:MapCategoryType is geographic" },
  "euelec:WEEECategory": { verdict: "KEEP_NO_LINK", reason: "schema:MapCategoryType is geographic" },
  "euelec:DeviceCategory": { verdict: "KEEP_NO_LINK", reason: "schema:MapCategoryType is geographic" },
  "eudet:DetergentCategory": { verdict: "KEEP_NO_LINK", reason: "schema:MapCategoryType is geographic" },

  // schema:priceComponentType is for finance, not electronic components
  "euelec:componentType": { verdict: "KEEP_NO_LINK", reason: "schema:priceComponentType is for billing, not electronic components" },
  "euelec:ComponentType": { verdict: "KEEP_NO_LINK", reason: "schema:PriceComponentTypeEnumeration is for billing" },

  // schema:digitalSourceType is for media licensing, not material origin
  "eutex:recycledSourceType": { verdict: "KEEP_NO_LINK", reason: "schema:digitalSourceType is for media licensing" },
  "eutex:wasteOriginType": { verdict: "KEEP_NO_LINK", reason: "schema:digitalSourceType is for media licensing" },

  // schema:fiberContent doesn't exist — probably a textile-specific token match noise
  "eutex:syntheticFiberContent": { verdict: "KEEP_NO_LINK", reason: "schema:fiberContent is not a standard schema.org term in the production vocab" },

  // eudr:origin* are structured location records, not generic schema:source
  "eudr:originDetails": { verdict: "KEEP_NO_LINK", reason: "schema:source is too generic; originDetails carries structured production-place data" },
  "eudr:originList": { verdict: "KEEP_NO_LINK", reason: "schema:source is too generic; originList is a container of OriginDetails" },

  // schema:hasEnergyEfficiencyCategory exists but takes EnergyConsumptionDetails — over-replacement
  "euelec:energyEfficiencyClass": { verdict: "KEEP_NO_LINK", reason: "schema:hasEnergyEfficiencyCategory has a different domain shape; keep as-is for ESPR Energy Label compliance" },

  // schema:reportNumber is generic — battery test reports have specific structure
  "eubat:testReportNumber": { verdict: "KEEP_NO_LINK", reason: "schema:reportNumber loses the battery-test-specific scoping" },

  // gs1:Product is a class — these enumeration classes shouldn't be equivalentClass to gs1:Product
  "eudet:DetergentProduct": { verdict: "KEEP_NO_LINK", reason: "Already subclass of gs1:Product implicitly via domain; adding equivalentClass overstates equivalence" },
  "eudet:ProductForm": { verdict: "KEEP_NO_LINK", reason: "ProductForm is an enum (Liquid, Powder, ...), not equivalent to gs1:Product class" },

  // schema:EventStatusType is for scheduled-event status (cancelled/postponed), not battery negative events
  "eubat:NegativeEventType": { verdict: "KEEP_NO_LINK", reason: "schema:EventStatusType is for scheduled-event status" },

  // textile:TextileFootwear is genuine subclass of gs1:Footwear — keep this LINK (it's HIGH and correct)

  // schema:DigitalDocumentPermissionType is for read/write permissions, not document types
  "oec:DocumentType": { verdict: "KEEP_NO_LINK", reason: "schema:DigitalDocumentPermissionType is for permissions (read/write), not document classification" },

  // schema:orderItemNumber is for retail order line items (Amazon-style), not trade item piece counts
  "oec:tradeItemPieceNumber": { verdict: "KEEP_NO_LINK", reason: "schema:orderItemNumber is for retail order lines, not trade items" },

  // gs1:qualifyingProductCategoryDescription is a GS1 GDSN field about qualifying categories — narrower
  "oec:productCategory": { verdict: "KEEP_NO_LINK", reason: "gs1:qualifyingProductCategoryDescription is a different concept (qualifier); use a generic schema:category alias instead in context" },

  // schema:typeOfGood is undefined in current schema.org; schema:category fits better
  "eudr:timberProductType": { verdict: "KEEP_NO_LINK", reason: "schema:typeOfGood is not a stable schema.org term" },

  // schema:producer is for media production, not legal/agricultural producer
  "eudr:producerIdentification": { verdict: "KEEP_NO_LINK", reason: "schema:producer is for media (film, etc.), not legal/agricultural producers" },

  // electronics:updateSource — software update origin URL
  "euelec:updateSource": { verdict: "KEEP_NO_LINK", reason: "schema:source is too generic; updateSource carries software-update-specific semantics" },

  // textile:fiberOrigin — structured fiber origin record, not generic source
  "eutex:fiberOrigin": { verdict: "KEEP_NO_LINK", reason: "fiberOrigin is structured (country, region, certification) — generic schema:source loses scope" },

  // gs1:certificationAgencyURL is the URL of the agency, not the certificate itself
  "eubat:measurementCertificateUrl": { verdict: "KEEP_NO_LINK", reason: "gs1:certificationAgencyURL is the agency's URL, not the certificate document URL" },
  "eubat:verificationCertificateUrl": { verdict: "KEEP_NO_LINK", reason: "Same as above" },

  // gs1:certificationInfo is broader; using it would lose specific certification semantics on these properties
  "oec:dataProviderCertification": { verdict: "KEEP_NO_LINK", reason: "gs1:certificationInfo is a generic descriptor, not the specific data-provider attestation" },
  "eubat:dataProviderCertification": { verdict: "KEEP_NO_LINK", reason: "Same as above" },
  "eudr:fscCertification": { verdict: "KEEP_NO_LINK", reason: "FSC is a specific scheme; gs1:certificationInfo loses the schema specificity" },
  "eutex:fiberCertification": { verdict: "KEEP_NO_LINK", reason: "Same — generic gs1:certificationInfo loses fiber-specific scoping" },
  "eutex:verificationCertification": { verdict: "KEEP_NO_LINK", reason: "Same" },

  // schema:weightPercentage exists as a percentage, this is a valid replacement
  // (battery:massPercentage stays as REPLACE — confirmed)

  // schema:contactPoint is a structured class, replacement is fine for battery:serviceContactPoint
  // (keep as REPLACE)

  // gs1:fileLanguageCode is for file metadata (GDSN), not document language — too narrow
  "oec:languageCode": { verdict: "KEEP_NO_LINK", reason: "gs1:fileLanguageCode is GDSN-file-specific, not generic language code" },
  "eubat:languageCode": { verdict: "KEEP_NO_LINK", reason: "Same" },

  // gs1:regulatoryReferenceNumber exists and is exact name match — valid REPLACE for both
  // (keep as REPLACE)

  // schema:reportNumber is a media term (e.g. published report) — see SKIPped above

  // GS1 First precedence overrides: when the auto-classifier picked schema but gs1 has the same coverage,
  // prefer gs1.
  "oec:sourceCountry": { canonical: "gs1:countryOfOrigin", reason: "GS1 First — gs1:countryOfOrigin exists with the same semantics" },
  "eubat:materialSourceCountry": { canonical: "gs1:countryOfOrigin", reason: "GS1 First — gs1:countryOfOrigin exists" },
  "eubat:manufacturerInformation": { canonical: "gs1:manufacturer", reason: "GS1 First — gs1:manufacturer exists" },
  "euelec:componentManufacturer": { canonical: "gs1:manufacturer", reason: "GS1 First — gs1:manufacturer exists" },
  // battery:auditDate keeps schema:auditDate (more specific than gs1:certificationAuditDate which is cert-scoped)
  // battery:materialCategory keeps schema:category (gs1:packagingMaterialType is for packaging, not battery materials)
};

function loadMapping(): MappingRow[] {
  const path = join(PROJECT_ROOT, "docs/skos-alignment/ontology-realignment-mapping.json");
  if (!existsSync(path)) {
    throw new Error(`Mapping JSON not found at ${path}. Run scripts/realign-mapping.ts first.`);
  }
  return JSON.parse(readFileSync(path, "utf-8"));
}

/**
 * Find the line range of a term block in TTL source.
 *
 * A block starts with `prefix:localName` at column 0. We walk forward looking
 * for either (a) a closing line that ends with `.` AND we are not inside a
 * triple-quoted comment, or (b) the next column-0 subject (signals we walked
 * past our own block — the previous non-blank line is then our end).
 *
 * Returns [startLine, endLine] inclusive, 0-indexed. Or null if not found.
 */
function findTermBlock(lines: string[], prefix: string, localName: string): [number, number] | null {
  const startPattern = new RegExp(`^${escapeRegex(prefix)}:${escapeRegex(localName)}\\b`);
  // A "subject" line starts with `<prefix>:<name>` at column 0 (no leading whitespace).
  const subjectPattern = /^[a-zA-Z][a-zA-Z0-9_-]*:[A-Za-z]/;

  for (let i = 0; i < lines.length; i++) {
    if (!startPattern.test(lines[i])) continue;

    let inTripleString = false;
    let lastNonBlank = i;

    for (let j = i; j < lines.length; j++) {
      const line = lines[j];
      // Toggle triple-string state by counting `"""` occurrences on this line
      const tripleCount = (line.match(/"""/g) || []).length;
      const wasInside = inTripleString;
      if (tripleCount % 2 === 1) inTripleString = !inTripleString;

      // If we hit a new subject AT column 0 after our start, our block ended at the previous closing-period line.
      if (j > i && subjectPattern.test(line) && !wasInside && !inTripleString) {
        return [i, lastNonBlank];
      }

      // Closing line: ends with "." (no triple-quote currently open), and we've moved past start.
      if (j > i && !inTripleString && !wasInside && line.trimEnd().endsWith(".")) {
        return [i, j];
      }

      if (line.trim() !== "") lastNonBlank = j;
    }
    // EOF — block extends to last non-blank line
    return [i, lastNonBlank];
  }
  return null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Choose the right link predicate for a KEEP_LINK row.
 * - HIGH-confidence class match: owl:equivalentClass
 * - HIGH-confidence property match: rdfs:subPropertyOf (extension is the more specific subtype)
 * - MEDIUM: rdfs:seeAlso (advisory cross-reference)
 * - LOW or unknown: rdfs:seeAlso
 */
function chooseLinkPredicate(row: MappingRow): string {
  const isClass = row.kind === "Class";
  if (row.confidence === "HIGH") {
    return isClass ? "owl:equivalentClass" : "rdfs:subPropertyOf";
  }
  return "rdfs:seeAlso";
}

/**
 * Format the canonical IRI as a TTL term reference.
 * Input is "gs1:foo" or "schema:bar"; we emit those prefixes literally — both
 * are already declared as @prefix in every module's TTL (we add schema: where
 * missing in a separate pass).
 */
function formatCanonical(canonical: string): string {
  return canonical;
}

interface ModuleChanges {
  module: string;
  moduleDir: string;
  ttlPath: string;
  deletes: { row: MappingRow; lineRange: [number, number] }[];
  links: { row: MappingRow; lineRange: [number, number]; predicate: string }[];
  notFound: MappingRow[];
}

/**
 * Apply manual overrides to rows in-place before planning. Returns the rows
 * (possibly with verdict / canonical fields updated) plus a list of override
 * descriptions to log.
 */
function applyOverrides(rows: MappingRow[]): { rows: MappingRow[]; applied: string[] } {
  const applied: string[] = [];
  const updated = rows.map((r) => {
    const key = `${r.prefix}:${r.localName}`;
    const override = OVERRIDES[key];
    if (!override) return r;
    const next = { ...r };
    if (override.verdict) {
      applied.push(`OVERRIDE ${key}: verdict ${r.verdict} → ${override.verdict} (${override.reason})`);
      next.verdict = override.verdict;
      if (override.verdict === "KEEP_NO_LINK") {
        next.canonical = "";
      }
    }
    if (override.canonical) {
      applied.push(`OVERRIDE ${key}: canonical ${r.canonical} → ${override.canonical} (${override.reason})`);
      next.canonical = override.canonical;
    }
    return next;
  });
  return { rows: updated, applied };
}

function planChangesForModule(rows: MappingRow[]): ModuleChanges {
  const first = rows[0];
  const ttlName = first.moduleDir.split("/").pop() === "core" ? "dpp-core" : first.moduleDir.split("/").pop();
  // Look up TTL filename — pattern is {moduleDir}/ontology/{stem}.ttl
  // The stem is module-dependent; we can find it from the directory listing.
  const ttlDir = join(PROJECT_ROOT, first.moduleDir, "ontology");
  const files = readdirSync(ttlDir).filter((f: string) => f.endsWith(".ttl"));
  if (files.length !== 1) {
    throw new Error(`Expected exactly one .ttl file in ${ttlDir}, found: ${files.join(", ")}`);
  }
  const ttlPath = join(ttlDir, files[0]);
  const lines = readFileSync(ttlPath, "utf-8").split("\n");

  const changes: ModuleChanges = {
    module: first.module,
    moduleDir: first.moduleDir,
    ttlPath,
    deletes: [],
    links: [],
    notFound: [],
  };

  for (const row of rows) {
    if (row.verdict.startsWith("REPLACE_WITH_") || row.verdict.startsWith("KEEP_LINK_")) {
      // Skip MEDIUM-confidence LINK actions by default — they're speculative
      // and adding noisy seeAlso pollutes the ontology. Only HIGH-confidence
      // LINKs (typically exact matches on enumeration classes) are applied.
      // REPLACEs are always applied (the auto-classifier only emits HIGH for those).
      if (row.verdict.startsWith("KEEP_LINK_") && row.confidence !== "HIGH" && !APPLY_MEDIUM_LINKS) continue;

      const range = findTermBlock(lines, row.prefix, row.localName);
      if (!range) {
        changes.notFound.push(row);
        continue;
      }
      if (row.verdict.startsWith("REPLACE_WITH_")) {
        changes.deletes.push({ row, lineRange: range });
      } else {
        changes.links.push({ row, lineRange: range, predicate: chooseLinkPredicate(row) });
      }
    }
  }

  return changes;
}

/**
 * Apply changes to a TTL file. Returns the new contents.
 *
 * Strategy:
 * 1. For each LINK action, insert the equivalence triple before the term block's
 *    closing line (if it ends with " .") — replace the trailing " ." with " ;\n    NEW ."
 * 2. For each DELETE action, remove the block lines AND any trailing blank line.
 * 3. Apply DELETEs in REVERSE line-order so earlier indices don't shift.
 * 4. Apply LINKs in REVERSE line-order similarly (and BEFORE deletes since deletes
 *    invalidate other line ranges — actually if we sort everything by start line
 *    descending and apply, indices stay valid).
 *
 * Also: ensure the schema: prefix is declared at the top of the file. Insert
 * `@prefix schema: <https://schema.org/> .` if missing.
 */
function applyTtlChanges(ttlPath: string, changes: ModuleChanges): { newContent: string; report: string[] } {
  const original = readFileSync(ttlPath, "utf-8");
  let lines = original.split("\n");
  const report: string[] = [];

  // Combine deletes + links, sort by start line descending, apply
  type Op = { kind: "delete" | "link"; range: [number, number]; row: MappingRow; predicate?: string };
  const ops: Op[] = [
    ...changes.deletes.map((d): Op => ({ kind: "delete", range: d.lineRange, row: d.row })),
    ...changes.links.map((l): Op => ({ kind: "link", range: l.lineRange, row: l.row, predicate: l.predicate })),
  ];
  ops.sort((a, b) => b.range[0] - a.range[0]);

  for (const op of ops) {
    const [start, end] = op.range;
    if (op.kind === "delete") {
      // Verify the block still starts where expected
      const startPattern = new RegExp(`^${escapeRegex(op.row.prefix)}:${escapeRegex(op.row.localName)}\\b`);
      if (!startPattern.test(lines[start])) {
        report.push(`SKIP delete ${op.row.prefix}:${op.row.localName}: line ${start} no longer matches (post-edit shift)`);
        continue;
      }
      // Delete lines [start, end] and one trailing blank line if present
      let deleteEnd = end + 1;
      if (deleteEnd < lines.length && lines[deleteEnd].trim() === "") {
        deleteEnd++;
      }
      lines.splice(start, deleteEnd - start);
      report.push(`DELETE ${op.row.prefix}:${op.row.localName} (lines ${start + 1}-${end + 1}) → use ${op.row.canonical}`);
    } else {
      // Idempotency: skip if the link already exists in this term block
      const blockText = lines.slice(start, end + 1).join("\n");
      const linkRegex = new RegExp(`${escapeRegex(op.predicate)}\\s+${escapeRegex(formatCanonical(op.row.canonical))}\\b`);
      if (linkRegex.test(blockText)) {
        report.push(`SKIP link ${op.row.prefix}:${op.row.localName} ${op.predicate} ${op.row.canonical} — already present`);
        continue;
      }
      // Insert equivalence triple before the closing period of the term block.
      // Two closing-line shapes occur in these TTL files:
      //   (a) "    rdfs:isDefinedBy <...> ."   — body line, period preceded by space
      //   (b) `applicable."""@en.`              — multi-line string ending with .
      //   (c) just "."                          — unusual, but handle it
      const closingLine = lines[end];
      const trimmed = closingLine.trimEnd();
      const indent = "    ";
      let newClosing: string[];
      if (trimmed === ".") {
        newClosing = [
          `${indent}${op.predicate} ${formatCanonical(op.row.canonical)} .`,
        ];
      } else if (trimmed.endsWith(" .")) {
        // case (a): replace " ." with " ;" and add new triple after
        const withoutPeriod = trimmed.slice(0, -2);
        newClosing = [
          `${withoutPeriod} ;`,
          `${indent}${op.predicate} ${formatCanonical(op.row.canonical)} .`,
        ];
      } else if (trimmed.endsWith(".")) {
        // case (b): no space before period (e.g. `..."""@en.`). Append a space and ;
        const withoutPeriod = trimmed.slice(0, -1);
        newClosing = [
          `${withoutPeriod} ;`,
          `${indent}${op.predicate} ${formatCanonical(op.row.canonical)} .`,
        ];
      } else {
        report.push(`SKIP link ${op.row.prefix}:${op.row.localName}: unrecognized closing line format: ${JSON.stringify(closingLine)}`);
        continue;
      }
      lines.splice(end, 1, ...newClosing);
      report.push(`LINK ${op.row.prefix}:${op.row.localName} ${op.predicate} ${op.row.canonical}`);
    }
  }

  // Ensure schema: prefix is declared near the top.
  const hasSchemaPrefix = lines.some((l) => /^@prefix schema:\s*</.test(l));
  if (!hasSchemaPrefix && (changes.deletes.some((d) => d.row.canonical.startsWith("schema:")) || changes.links.some((l) => l.row.canonical.startsWith("schema:")))) {
    // Insert after the last @prefix line
    let lastPrefixIdx = -1;
    for (let i = 0; i < Math.min(lines.length, 60); i++) {
      if (lines[i].startsWith("@prefix ")) lastPrefixIdx = i;
    }
    if (lastPrefixIdx >= 0) {
      lines.splice(lastPrefixIdx + 1, 0, "@prefix schema: <https://schema.org/> .");
      report.push(`Added @prefix schema: <https://schema.org/> .`);
    }
  }

  // Ensure gs1: prefix is declared (always — every module has gs1: terms in some way)
  const hasGs1Prefix = lines.some((l) => /^@prefix gs1:\s*</.test(l));
  if (!hasGs1Prefix && (changes.deletes.some((d) => d.row.canonical.startsWith("gs1:")) || changes.links.some((l) => l.row.canonical.startsWith("gs1:")))) {
    let lastPrefixIdx = -1;
    for (let i = 0; i < Math.min(lines.length, 60); i++) {
      if (lines[i].startsWith("@prefix ")) lastPrefixIdx = i;
    }
    if (lastPrefixIdx >= 0) {
      lines.splice(lastPrefixIdx + 1, 0, "@prefix gs1: <https://ref.gs1.org/voc/> .");
      report.push(`Added @prefix gs1: <https://ref.gs1.org/voc/> .`);
    }
  }

  return { newContent: lines.join("\n"), report };
}

/**
 * Update text-form references to deleted terms across context, examples, EPCIS,
 * validation, docs, and bridge contexts. We perform a quoted-string replacement
 * `"prefix:localName"` → `"canonical"` everywhere this could appear.
 *
 * For `.generated.jsonld` files we skip — they regenerate from TTL automatically.
 */
function updateContextFiles(changes: ModuleChanges, mappedDeletes?: { prefix: string; localName: string; canonical: string }[]): string[] {
  const report: string[] = [];
  // Use the mapping-derived deletes (regardless of TTL state) when provided —
  // this lets us run the reference sweep independent of whether the TTL block
  // still exists. Falls back to changes.deletes for compatibility.
  const deletes = mappedDeletes ?? changes.deletes.map((d) => ({ prefix: d.row.prefix, localName: d.row.localName, canonical: d.row.canonical }));
  if (deletes.length === 0) return report;

  // Collect all candidate paths: per-module context/examples/epcis/validation/docs,
  // plus the cross-module interop bridge contexts.
  const moduleRoot = join(PROJECT_ROOT, changes.moduleDir);
  const targetDirs = [
    join(moduleRoot, "context"),
    join(moduleRoot, "examples"),
    join(moduleRoot, "epcis"),
    join(moduleRoot, "validation"),
    join(moduleRoot, "docs"),
    join(PROJECT_ROOT, "extensions/common/interop/context"),
    join(PROJECT_ROOT, "extensions/common/core/docs"),
  ];

  // .ttl includes SHACL shape files which reference deleted terms as bare TTL identifiers
  const fileExtensions = [".jsonld", ".json", ".md", ".ttl"];
  const candidates: string[] = [];
  for (const dir of targetDirs) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!fileExtensions.some((ext) => f.endsWith(ext))) continue;
      if (f.includes(".generated.")) continue;
      candidates.push(join(dir, f));
    }
  }

  for (const path of candidates) {
    const relPath = path.replace(PROJECT_ROOT + "/", "");
    const original = readFileSync(path, "utf-8");
    let updated = original;
    const localChanges: string[] = [];
    const isShacl = path.endsWith("-shapes.ttl");

    for (const del of deletes) {
      // Quoted form: "prefix:localName" → "canonical"
      const oldQuoted = `"${del.prefix}:${del.localName}"`;
      const newQuoted = `"${del.canonical}"`;
      if (updated.includes(oldQuoted)) {
        const count = (updated.match(new RegExp(escapeRegex(oldQuoted), "g")) || []).length;
        updated = updated.split(oldQuoted).join(newQuoted);
        localChanges.push(`${oldQuoted} → ${newQuoted} (${count}x)`);
      }
      // Backtick form in markdown: `prefix:localName` → `canonical`
      if (path.endsWith(".md")) {
        const oldBackticked = `\`${del.prefix}:${del.localName}\``;
        const newBackticked = `\`${del.canonical}\``;
        if (updated.includes(oldBackticked)) {
          const count = (updated.match(new RegExp(escapeRegex(oldBackticked), "g")) || []).length;
          updated = updated.split(oldBackticked).join(newBackticked);
          localChanges.push(`${oldBackticked} → ${newBackticked} (${count}x)`);
        }
      }
      // SHACL TTL shape files: identifier form `prefix:localName` (no quotes) — replace with word-boundary regex
      if (isShacl) {
        const re = new RegExp(`\\b${escapeRegex(del.prefix)}:${escapeRegex(del.localName)}\\b`, "g");
        const matches = updated.match(re);
        if (matches) {
          updated = updated.replace(re, del.canonical);
          localChanges.push(`(SHACL) ${del.prefix}:${del.localName} → ${del.canonical} (${matches.length}x)`);
        }
      }
    }

    if (updated !== original) {
      if (!DRY_RUN) writeFileSync(path, updated);
      report.push(`  ${relPath}:`);
      for (const c of localChanges) report.push(`    ${c}`);
    }
  }
  return report;
}

/**
 * Add CHANGELOG entry for a module's deletions and added links.
 */
function updateChangelog(changes: ModuleChanges): string {
  const path = join(PROJECT_ROOT, changes.moduleDir, "CHANGELOG.md");
  if (!existsSync(path)) return `  no CHANGELOG.md at ${path}`;
  const original = readFileSync(path, "utf-8");

  if (changes.deletes.length === 0 && changes.links.length === 0) return `  no changes`;

  const date = new Date().toISOString().split("T")[0];
  const sectionLines: string[] = [];
  sectionLines.push(`## 0.9.5 — schema.org / GS1 alignment cleanup (${date})\n`);
  sectionLines.push("**Breaking** — extension terms that duplicated GS1 / schema.org have been removed in favor of the canonical vocabulary terms. JSON-LD examples using the same local-key aliases continue to work because the context now resolves those keys to the canonical IRIs.\n");

  if (changes.deletes.length > 0) {
    sectionLines.push("### Removed (use canonical term instead)\n");
    for (const d of changes.deletes) {
      sectionLines.push(`- \`${d.row.prefix}:${d.row.localName}\` → \`${d.row.canonical}\``);
    }
    sectionLines.push("");
  }
  if (changes.links.length > 0) {
    sectionLines.push("### Added equivalence / cross-reference links\n");
    for (const l of changes.links) {
      sectionLines.push(`- \`${l.row.prefix}:${l.row.localName}\` ${l.predicate} \`${l.row.canonical}\``);
    }
    sectionLines.push("");
  }

  // Insert after the first heading (top of file) — convention is # CHANGELOG followed by entries
  const lines = original.split("\n");
  let insertAt = 0;
  // Find the first '##' or end of file metadata
  for (let i = 0; i < lines.length; i++) {
    if (i > 0 && lines[i].startsWith("## ")) {
      insertAt = i;
      break;
    }
    if (i === lines.length - 1) insertAt = lines.length;
  }
  // If no '##' was found, insert at end
  if (insertAt === 0) {
    // Fallback: insert after first line
    insertAt = Math.min(2, lines.length);
  }

  const newContent = [
    ...lines.slice(0, insertAt),
    ...sectionLines,
    ...lines.slice(insertAt),
  ].join("\n");

  if (!DRY_RUN) writeFileSync(path, newContent);
  return `  added section to CHANGELOG (${changes.deletes.length} deletions, ${changes.links.length} links)`;
}

function main() {
  console.log(`Loading mapping...${DRY_RUN ? " [DRY RUN]" : ""}${MODULE_FILTER ? ` [filter: ${MODULE_FILTER}]` : ""}`);
  const allRows = loadMapping();

  // Group by module
  const byModule = new Map<string, MappingRow[]>();
  for (const r of allRows) {
    if (MODULE_FILTER && r.module !== MODULE_FILTER) continue;
    if (!byModule.has(r.module)) byModule.set(r.module, []);
    byModule.get(r.module)!.push(r);
  }

  console.log(`Modules to process: ${[...byModule.keys()].join(", ")}\n`);

  const overallReport: string[] = [];

  for (const [moduleName, rows] of byModule) {
    console.log(`=== ${moduleName} ===`);
    const { rows: overriddenRows, applied: overrideMessages } = applyOverrides(rows);
    for (const msg of overrideMessages) console.log(`  ${msg}`);
    const changes = planChangesForModule(overriddenRows);
    console.log(`  Deletes: ${changes.deletes.length}, Links: ${changes.links.length}, NotFound: ${changes.notFound.length}`);

    if (changes.notFound.length > 0) {
      console.log(`  WARNING — ${changes.notFound.length} terms not found in TTL:`);
      for (const r of changes.notFound) console.log(`    ${r.prefix}:${r.localName}`);
    }

    // Apply TTL changes
    const { newContent, report } = applyTtlChanges(changes.ttlPath, changes);
    if (!DRY_RUN) writeFileSync(changes.ttlPath, newContent);
    for (const line of report) console.log(`  TTL: ${line}`);

    // Apply context / examples / docs reference sweep — uses mapping data
    // directly so it works even after TTL has been edited in a previous run.
    const mappedDeletes = overriddenRows
      .filter((r) => r.verdict.startsWith("REPLACE_WITH_") && r.canonical)
      .map((r) => ({ prefix: r.prefix, localName: r.localName, canonical: r.canonical }));
    const ctxReport = updateContextFiles(changes, mappedDeletes);
    for (const line of ctxReport) console.log(`  CTX:${line}`);

    // CHANGELOG
    const clReport = updateChangelog(changes);
    console.log(`  CHANGELOG: ${clReport}`);

    overallReport.push(`${moduleName}: -${changes.deletes.length} terms, +${changes.links.length} links`);
    console.log();
  }

  // Final cross-module sweep — terms deleted in one module may be referenced
  // (e.g. dpp:status in battery's EPCIS examples). Walk every module's
  // file tree once with the union of all deletes.
  console.log("=== Cross-module sweep ===");
  const allDeletes: { prefix: string; localName: string; canonical: string }[] = [];
  for (const rows of byModule.values()) {
    const { rows: ov } = applyOverrides(rows);
    for (const r of ov) {
      if (r.verdict.startsWith("REPLACE_WITH_") && r.canonical) {
        allDeletes.push({ prefix: r.prefix, localName: r.localName, canonical: r.canonical });
      }
    }
  }
  // Build a synthetic ModuleChanges per module to drive the sweep
  for (const moduleName of byModule.keys()) {
    const moduleDir = byModule.get(moduleName)![0].moduleDir;
    const stub: ModuleChanges = { module: moduleName, moduleDir, ttlPath: "", deletes: [], links: [], notFound: [] };
    const ctxReport = updateContextFiles(stub, allDeletes);
    if (ctxReport.length > 0) {
      console.log(`  ${moduleName}:`);
      for (const line of ctxReport) console.log(`    ${line.trim()}`);
    }
  }

  console.log("\n=== Summary ===");
  for (const line of overallReport) console.log(line);
  if (DRY_RUN) console.log("\n[DRY RUN — no files written]");
}

main();
