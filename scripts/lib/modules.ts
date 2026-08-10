/**
 * The validatable-module registry: one entry per conformance target that the
 * SHACL gates, the GITB validator resources and the GITB TDL test suite all
 * agree on.
 *
 * Modules are DISCOVERED from the working tree — ontology/<slug>.ttl plus
 * validation/<slug>-shapes.ttl — rather than listed, following the same
 * reasoning as the JSON-LD example gate: the old hardcoded map in that gate
 * silently skipped iron-steel and would have skipped every future module. Only
 * what cannot be derived from the filesystem is curated here: the validation
 * type id, its human label and the regulation it implements. A module that
 * appears on disk without a curated entry is a hard error, so adding one is a
 * one-line edit that cannot be forgotten.
 *
 * Upstream mirrors (extensions/upstream/**) are deliberately absent. We do not
 * govern GS1 Rail or the CIRPASS-2 EUDPP ontology, so a conformance statement
 * must not claim them; neither ships a *-shapes.ttl anyway.
 *
 * Type ids are the ITB `validator.type` values and double as the TDL test case
 * suffixes, so they must stay stable once published — renaming one invalidates
 * every conformance statement recorded against it.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** The cross-cutting core every other module is also validated against. */
export const CORE_DIR = "extensions/common/core";
export const CORE_TYPE = "dpp.core";

interface CuratedModule {
  type: string;
  label: string;
  /** Regulation or framework the module implements, for labels and test-suite docs. */
  regulation: string;
}

/** Curated per module directory. Mirrors the module table in CLAUDE.md. */
const CURATED: Record<string, CuratedModule> = {
  "extensions/common/core": {
    type: CORE_TYPE,
    label: "OpenEPCIS DPP Core",
    regulation: "ESPR 2024/1781 (cross-cutting)",
  },
  "extensions/eu/battery": {
    type: "eu.battery",
    label: "EU Battery",
    regulation: "Battery Regulation 2023/1542",
  },
  "extensions/eu/textile": {
    type: "eu.textile",
    label: "EU Textile",
    regulation: "ESPR Sustainable Textiles",
  },
  "extensions/eu/electronics": {
    type: "eu.electronics",
    label: "EU Electronics",
    regulation: "ESPR Electronics Acts",
  },
  "extensions/eu/detergent": {
    type: "eu.detergent",
    label: "EU Detergent",
    regulation: "Detergents Regulation 2026/405",
  },
  "extensions/eu/eudr": {
    type: "eu.eudr",
    label: "EU Deforestation",
    regulation: "Deforestation Regulation 2023/1115",
  },
  "extensions/eu/ppwr": {
    type: "eu.ppwr",
    label: "EU Packaging",
    regulation: "Packaging and Packaging Waste Regulation 2025/40",
  },
  "extensions/eu/cpr": {
    type: "eu.cpr",
    label: "EU Construction Products",
    regulation: "Construction Products Regulation 2024/3110",
  },
  "extensions/eu/iron-steel": {
    type: "eu.iron-steel",
    label: "EU Iron & Steel",
    regulation: "ESPR iron & steel product group (EN 10204 MTC)",
  },
  "extensions/us/fsma204": {
    type: "us.fsma204",
    label: "US FSMA 204",
    regulation: "FDA FSMA §204 Food Traceability Rule (21 CFR 1 Subpart S)",
  },
};

/**
 * A generated shapes graph that covers one applicability category of a module,
 * carved out of a single multi-category source file.
 *
 * The EC Battery Passport guidance assigns each of its 71 data points a
 * different obligation per battery category, so the generated
 * ec-readiness-shapes.ttl ships all 198 shapes `sh:deactivated true` and the
 * runner activates one category's suffix. The ITB validators cannot flip
 * anything at request time, so each category also becomes its own validation
 * type backed by a pre-activated copy.
 */
export interface ModuleCategory {
  type: string;
  label: string;
  /** Shape-IRI suffix that selects this category (see activateBySuffix). */
  suffix: string;
  /** Multi-category source shapes file, relative to the repo root. */
  sourceShapes: string;
}

/**
 * EN 18223 granularity levels a module carries LEVEL-SPECIFIC obligations for.
 *
 * The levels exist for every passport, but a validation type per level is only
 * worth declaring where the shapes actually differ — otherwise every module
 * would gain three near-identical types that validate exactly the same thing,
 * and `config.properties` would stop saying anything. Battery is currently the
 * only module whose obligations vary by level (a model passport has no serial
 * number; a batch or item passport resolves the model- and party-level
 * identifiers up the Digital Link hierarchy instead of restating them).
 *
 * Same activation contract as the categories above: the per-level shapes ship
 * `sh:deactivated true` with an IRI suffix, and exactly one level is activated.
 */
const GRANULARITIES: Record<string, ModuleCategory[]> = {
  "extensions/eu/battery": [
    {
      type: "eu.battery.model",
      label: "EU Battery — model granularity (EN 18223)",
      suffix: "-model",
      sourceShapes: "extensions/eu/battery/validation/battery-shapes.ttl",
    },
    {
      type: "eu.battery.batch",
      label: "EU Battery — batch granularity (EN 18223)",
      suffix: "-batch",
      sourceShapes: "extensions/eu/battery/validation/battery-shapes.ttl",
    },
    {
      type: "eu.battery.item",
      label: "EU Battery — item granularity (EN 18223)",
      suffix: "-item",
      sourceShapes: "extensions/eu/battery/validation/battery-shapes.ttl",
    },
  ],
};

const CATEGORIES: Record<string, ModuleCategory[]> = {
  "extensions/eu/battery": [
    {
      type: "eu.battery.ev",
      label: "EU Battery — electric vehicle (EC guidance coverage)",
      suffix: "-ev",
      sourceShapes: "extensions/eu/battery/validation/ec-readiness-shapes.ttl",
    },
    {
      type: "eu.battery.lmt",
      label: "EU Battery — light means of transport (EC guidance coverage)",
      suffix: "-lmt",
      sourceShapes: "extensions/eu/battery/validation/ec-readiness-shapes.ttl",
    },
    {
      type: "eu.battery.industrial",
      label: "EU Battery — industrial (EC guidance coverage)",
      suffix: "-industrial",
      sourceShapes: "extensions/eu/battery/validation/ec-readiness-shapes.ttl",
    },
  ],
};

export interface ValidatableModule extends CuratedModule {
  /** Module directory relative to the repo root, e.g. "extensions/eu/battery". */
  dir: string;
  /** File-name stem of the module's artifacts, e.g. "battery" or "dpp-core". */
  slug: string;
  /** Module ontology, relative to the repo root. */
  ontology: string;
  /** Access-level annotation sidecar, when present. */
  accessLevels?: string;
  /** The module's own SHACL shapes, relative to the repo root. */
  shapes: string;
  /** Document JSON Schema, relative to the repo root, when the module ships one. */
  schema?: string;
  /** Directory holding the module's example passports, when present. */
  examplesDir?: string;
  /** Pre-activated category variants derived from a multi-category shapes file. */
  categories: ModuleCategory[];
  /** Pre-activated EN 18223 granularity variants, where obligations differ by level. */
  granularities: ModuleCategory[];
}

async function exists(rel: string): Promise<boolean> {
  try {
    await fs.access(path.join(ROOT, rel));
    return true;
  } catch {
    return false;
  }
}

/**
 * Discover every module that ships both an ontology and a SHACL shapes graph.
 * Returned in a stable order: the core first, then by type id, so generated
 * artifacts are byte-stable across runs and machines.
 */
export async function discoverModules(): Promise<ValidatableModule[]> {
  const found: ValidatableModule[] = [];
  const uncurated: string[] = [];

  const extRoot = path.join(ROOT, "extensions");
  for (const rel of await fs.readdir(extRoot, { recursive: true })) {
    const relStr = String(rel).split(path.sep).join("/");
    // ontology/<slug>.ttl, excluding the access-level sidecars.
    const m = relStr.match(/^(.+)\/ontology\/([^/]+)\.ttl$/);
    if (!m || m[2].endsWith("-access-levels")) continue;

    const dir = `extensions/${m[1]}`;
    const slug = m[2];
    const shapes = `${dir}/validation/${slug}-shapes.ttl`;
    if (!(await exists(shapes))) continue;

    const curated = CURATED[dir];
    if (!curated) {
      uncurated.push(dir);
      continue;
    }

    const accessLevels = `${dir}/ontology/${slug}-access-levels.ttl`;
    const schema = `${dir}/validation/${slug}-schema.json`;
    const examplesDir = `${dir}/examples`;

    found.push({
      ...curated,
      dir,
      slug,
      ontology: `${dir}/ontology/${slug}.ttl`,
      ...((await exists(accessLevels)) ? { accessLevels } : {}),
      shapes,
      ...((await exists(schema)) ? { schema } : {}),
      ...((await exists(examplesDir)) ? { examplesDir } : {}),
      categories: CATEGORIES[dir] ?? [],
      granularities: GRANULARITIES[dir] ?? [],
    });
  }

  if (uncurated.length) {
    throw new Error(
      `module(s) ship an ontology and SHACL shapes but have no entry in CURATED ` +
        `(scripts/lib/modules.ts): ${uncurated.join(", ")}. Add the validation type id, ` +
        `label and regulation so the GITB validator resources and test suite cover them.`,
    );
  }

  found.sort((a, b) =>
    a.type === CORE_TYPE ? -1 : b.type === CORE_TYPE ? 1 : a.type.localeCompare(b.type),
  );
  return found;
}

/** The core module, which every other module's validation type also includes. */
export function coreOf(modules: ValidatableModule[]): ValidatableModule {
  const core = modules.find((m) => m.type === CORE_TYPE);
  if (!core) throw new Error(`the core module (${CORE_DIR}) was not discovered`);
  return core;
}

/** Every validation type id: each module, then its granularity and category variants. */
export function allTypeIds(modules: ValidatableModule[]): string[] {
  return modules.flatMap((m) => [
    m.type,
    ...m.granularities.map((g) => g.type),
    ...m.categories.map((c) => c.type),
  ]);
}

/**
 * Infer the EN 18223 granularity of a passport from its GS1 Digital Link IRI:
 * AI 01 alone is a model, 01+10 a batch, 01+21 an item. This is the same
 * derivation dpp-sh:GranularityDigitalLinkConstraint checks against the declared
 * oec:granularityLevel, and it lets a gate pick the right level for an example
 * without the document having to say so.
 */
export function granularityOfDigitalLink(iri: string): "model" | "batch" | "item" | undefined {
  if (!/\/01\//.test(iri)) return undefined;
  if (/\/21\//.test(iri)) return "item";
  if (/\/10\//.test(iri)) return "batch";
  return "model";
}
