/**
 * Build a JSON Schema for the BatteryPass-Ready Data Attribute Longlist v1.3.
 *
 * Source longlist (NOT copied into the repo — it has a stable public URL):
 *   https://thebatterypass.eu/wp-content/uploads/2026_BatteryPass-Ready_DataAttributeLongList_v1.3.xlsx
 * The generator downloads it on demand to a temp file. Override with a local copy
 * via the BPASS_LONGLIST_XLSX env var (path) if working offline.
 *
 * This is an internal *longlist-coverage* view: a flat, camelCase schema
 * derived from the v1.3 attribute longlist, used to track which attributes we
 * carry. It is NOT the GEFEG conformance contract.
 *
 * The real GEFEG validation schemas are now published and mirrored under
 * extensions/eu/battery/docs/reference/gefeg-batterypass-ready/. They use a
 * different serialization (per-category root key, seven SAMM aspect groups,
 * verbose PascalCase names, unit+value objects, enums-as-objects). The
 * conformance harness (scripts/test-batterypass-conformance.ts) validates the
 * output of scripts/export-batterypass-gefeg.ts against those real schemas.
 *
 * It is also NOT a schema for the battery: extension itself — that lives in
 * validation/battery-schema.json.
 *
 * Output: extensions/eu/battery/validation/batterypass-v1.3-schema.json
 *
 * Usage:
 *   pnpm run build:batterypass-schema
 *   # or directly:
 *   tsx scripts/build-batterypass-schema.ts
 *
 * Limitations:
 *   - Property names are camelCase-normalised from the longlist's English
 *     attribute names — they do NOT match GEFEG's published attribute names
 *     (which this generator predates). Use the mirrored GEFEG schemas, not this
 *     file, when reconciling field names.
 *   - Type/format inference is keyed off the longlist's Data type column
 *     (String, ID (string), URI/URL, Decimal, Integer, Timestamp UTC-based,
 *     Date[YYYY-MM], Array (string)).
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

const LONGLIST_URL =
  "https://thebatterypass.eu/wp-content/uploads/2026_BatteryPass-Ready_DataAttributeLongList_v1.3.xlsx";

/**
 * Resolve the source longlist without committing it to the repo: prefer a local
 * path from BPASS_LONGLIST_XLSX, otherwise download the canonical file to a temp
 * path. The XLSX is upstream-owned and publicly hosted, so we link/fetch rather
 * than mirror it.
 */
function resolveLonglistXlsx(): string {
  const override = process.env.BPASS_LONGLIST_XLSX;
  if (override && existsSync(override)) return override;
  const dest = join(tmpdir(), "2026_BatteryPass-Ready_DataAttributeLongList_v1.3.xlsx");
  if (!existsSync(dest)) {
    console.log(`Fetching longlist from ${LONGLIST_URL}`);
    execSync(`curl -fsSL '${LONGLIST_URL}' -o '${dest}'`, { stdio: "inherit" });
  }
  return dest;
}

const XLSX_PATH = resolveLonglistXlsx();
const OUTPUT_PATH = join(
  PROJECT_ROOT,
  "extensions/eu/battery/validation/batterypass-v1.3-schema.json"
);

interface Attribute {
  no: number;
  no_v12: string;
  lmt: string;
  ev: string;
  industrial: string;
  stationary: string;
  category: string;
  subcategory: string;
  name: string;
  data_type: string;
  access: string;
  dynamic: string;
  update_trigger: string;
  granularity: string;
}

/**
 * The XLSX is parsed via a tiny inline Python helper rather than a JS xlsx
 * dependency — the file is committed to the repo, parsed on demand at build
 * time, and a one-shot Python invocation avoids adding a new transitive dep
 * to package.json.
 */
function extractAttributes(xlsxPath: string): Attribute[] {
  const py = `
import sys, json, zipfile, xml.etree.ElementTree as ET, re

xlsx = sys.argv[1]
ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
SAMM = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

with zipfile.ZipFile(xlsx) as z:
    sst_root = ET.fromstring(z.read('xl/sharedStrings.xml'))
    sheet_xml = z.read('xl/worksheets/sheet4.xml')

strings = []
for si in sst_root.findall('s:si', ns):
    parts = []
    for t in si.iter():
        if t.tag.endswith('}t'):
            parts.append(t.text or '')
    strings.append(''.join(parts))

root = ET.fromstring(sheet_xml)
attrs = []
for row in root.iter(SAMM + 'row'):
    rd = {}
    for c in row:
        ref = c.get('r', '')
        m = re.match(r'([A-Z]+)', ref)
        if not m:
            continue
        col = m.group(1)
        t = c.get('t', '')
        v = c.find('s:v', ns)
        is_ = c.find('s:is', ns)
        val = ''
        if t == 's' and v is not None:
            val = strings[int(v.text)]
        elif t == 'inlineStr' and is_ is not None:
            val = ''.join(x.text or '' for x in is_.iter() if x.tag.endswith('}t'))
        elif v is not None:
            val = v.text or ''
        rd[col] = val
    no = rd.get('B', '').strip()
    if not no.isdigit():
        continue
    attrs.append({
        'no': int(no),
        'no_v12': rd.get('C', '').strip(),
        'lmt': rd.get('D', '').strip(),
        'ev': rd.get('E', '').strip(),
        'industrial': rd.get('F', '').strip(),
        'stationary': rd.get('G', '').strip(),
        'category': rd.get('H', '').strip(),
        'subcategory': rd.get('I', '').strip(),
        'name': rd.get('J', '').strip(),
        'data_type': rd.get('P', '').strip(),
        'access': rd.get('Q', '').strip(),
        'dynamic': rd.get('R', '').strip(),
        'update_trigger': rd.get('S', '').strip(),
        'granularity': rd.get('T', '').strip(),
    })
print(json.dumps(attrs))
`;
  const out = execSync(`python3 -c '${py.replace(/'/g, "'\\''")}' '${xlsxPath}'`, {
    encoding: "utf-8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return JSON.parse(out) as Attribute[];
}

/**
 * Manual overrides for property names where the longlist's English attribute
 * name is awkward to camelCase or where the SAMM aspect models use a known
 * shorter handle. Keyed by attribute number.
 */
const NAME_OVERRIDES: Record<number, string> = {
  1: "dppSchemaVersion",
  2: "dppStatus",
  3: "dppGranularity",
  4: "dateTimeOfLatestUpdate",
  5: "batteryPassportIdentifier",
  6: "batteryIdentifier",
  7: "batteryModelIdentifier",
  8: "batterySerialNumber",
  9: "economicOperatorIdentifier",
  10: "manufacturerIdentifier",
  11: "facilityIdentifier",
  12: "economicOperatorInformation",
  13: "manufacturerInformation",
  14: "manufacturingPlace",
  15: "manufacturingDate",
  16: "puttingIntoService",
  17: "warrantyPeriod",
  18: "batteryCategory",
  19: "batteryMass",
  20: "batteryStatus",
  92: "temperatureRangeIdleStateLowerBoundary",
  93: "temperatureRangeIdleStateUpperBoundary",
};

/**
 * The longlist's "Data type" column is summary-level. For composite blocks
 * (operator/manufacturer information, battery chemistry, dismantling info,
 * spare-part sources, hazardous substances) and for known list-shaped string
 * attributes, override the inferred type with the actual on-the-wire shape.
 * Keyed by attribute number.
 */
const TYPE_OVERRIDES: Record<number, JsonSchemaProperty> = {
  12: { type: "object" }, // economicOperatorInformation
  13: { type: "object" }, // manufacturerInformation
  39: { type: "object" }, // batteryChemistry
  42: { type: "array", items: { type: "object" } }, // hazardousSubstances
  44: { type: "array", items: { type: "object" } }, // dismantlingInformation: manuals
  45: { anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] }, // partNumbers
  46: { type: "array", items: { type: "object" } }, // sources of spare parts
  91: { anyOf: [{ type: "string" }, { type: "object" }] }, // temperatureInformation (free-text or structured)
  100: { type: "string" }, // information on accidents (free text, longlist says URI/URL but harness-side is freeform)
};

function camelCase(s: string): string {
  return s
    .replace(/%/g, " Percent ")
    .replace(/[\(\)\[\]\.,/:;]/g, " ")
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i === 0) return lower;
      return lower[0].toUpperCase() + lower.slice(1);
    })
    .join("");
}

function propertyName(a: Attribute): string {
  if (NAME_OVERRIDES[a.no]) return NAME_OVERRIDES[a.no];
  // Trim long name; take portion before " / " or " incl. " or ", "
  const trimmed = a.name.split(/ \/ | incl\.|,|\(/)[0].trim();
  return camelCase(trimmed) || `attr${a.no}`;
}

interface JsonSchemaProperty {
  type?: string | string[];
  format?: string;
  pattern?: string;
  items?: JsonSchemaProperty;
  description?: string;
  oneOf?: JsonSchemaProperty[];
  anyOf?: JsonSchemaProperty[];
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  "x-batterypass-no"?: number;
  "x-access-level"?: string;
  "x-granularity"?: string;
  "x-update-mode"?: string;
}

/**
 * The longlist's "Data type" column is the regulatory description of the
 * value, not its on-the-wire JSON shape. Real SAMM aspect models and GS1
 * passports commonly carry numeric attributes as QuantitativeValue objects
 * ({ value, unitCode }) and string-typed attributes can be either a single
 * string or an array of strings (e.g. "critical raw materials" — a list of
 * names). We accept both shapes via anyOf so that documents emitted via the
 * to-batterypass bridge validate without us having to know in advance which
 * shape GEFEG's harness expects for each attribute.
 */
const QUANTITATIVE_VALUE: JsonSchemaProperty = {
  type: "object",
  properties: {
    value: { type: "number" },
    unitCode: { type: "string" },
  },
  required: ["value"],
};

function jsonTypeFor(dataType: string): JsonSchemaProperty {
  const t = dataType.replace(/\s+/g, " ").trim();
  if (t === "String" || t === "ID (string)") {
    return {
      anyOf: [
        { type: "string" },
        { type: "array", items: { type: "string" } },
      ],
    };
  }
  if (t === "URI/URL") {
    // Don't pin format:uri — the longlist mixes URLs and free-text notes here.
    return { type: "string" };
  }
  if (t === "Decimal") {
    return { anyOf: [{ type: "number" }, QUANTITATIVE_VALUE] };
  }
  if (t === "Integer") {
    return { anyOf: [{ type: "number" }, QUANTITATIVE_VALUE] };
  }
  if (t.startsWith("Timestamp")) return { type: "string", format: "date-time" };
  if (t.startsWith("Date[YYYY-MM]")) return { type: "string", pattern: "^\\d{4}-\\d{2}$" };
  if (t === "Array (string)") return { type: "array", items: { type: "string" } };
  return { type: "string" };
}

/**
 * The longlist marks applicability with x / (x) per battery category.
 * "x" means mandatory for that category; "(x)" means recommended.
 * For the v1.3 GEFEG harness we treat any "x" in any category as
 * effectively required for a generic passport. Refine per-category if the
 * harness exposes category-specific test profiles.
 */
function isMandatory(a: Attribute): boolean {
  return [a.lmt, a.ev, a.industrial, a.stationary].some((v) => v === "x");
}

function buildSchema(attrs: Attribute[]): object {
  const properties: Record<string, JsonSchemaProperty> = {};
  const required: string[] = [];

  for (const a of attrs) {
    const name = propertyName(a);
    if (properties[name]) {
      // collisions are bugs — bail loudly
      throw new Error(`Property name collision: ${name} (attribute #${a.no})`);
    }
    const base = TYPE_OVERRIDES[a.no] ?? jsonTypeFor(a.data_type);
    properties[name] = {
      ...base,
      description: `[${a.no}] ${a.name} — ${a.subcategory || a.category}`,
      "x-batterypass-no": a.no,
      "x-access-level": a.access,
      "x-granularity": a.granularity,
      "x-update-mode": a.dynamic,
    };
    if (isMandatory(a)) required.push(name);
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://ref.openepcis.io/extensions/eu/battery/batterypass-v1.3-schema.json",
    title: "BatteryPass-Ready v1.3 Data Attribute Longlist",
    description:
      "JSON Schema generated from the BatteryPass-Ready v1.3 longlist (March 2026). Internal longlist-coverage view (not the GEFEG conformance contract — see validation/gefeg-live/). Generator: scripts/build-batterypass-schema.ts. Source XLSX (fetched, not mirrored): https://thebatterypass.eu/wp-content/uploads/2026_BatteryPass-Ready_DataAttributeLongList_v1.3.xlsx.",
    type: "object",
    properties,
    required,
    additionalProperties: true,
  };
}

const attrs = extractAttributes(XLSX_PATH);
console.log(`Parsed ${attrs.length} attributes from v1.3 longlist`);
const schema = buildSchema(attrs);
writeFileSync(OUTPUT_PATH, JSON.stringify(schema, null, 2) + "\n");
const requiredCount = (schema as { required: string[] }).required.length;
console.log(`Wrote ${OUTPUT_PATH} (${requiredCount} required attributes)`);
