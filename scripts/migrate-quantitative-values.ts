#!/usr/bin/env tsx
/**
 * Migrate per-unit `gs1:QuantitativeValue` subclasses to the GS1-idiomatic
 * `{type: "QuantitativeValue", value, unitCode: <UN/CEFACT Rec 20>}` shape.
 *
 * Walks every `.jsonld` under `extensions/{eu,us,common}/<module>/{examples,epcis}/`
 * and rewrites any value object whose `type` (or `@type`) matches one of the
 * 17 retired classes:
 *
 *   Percentage WeightKilograms EnergyKilowattHours PowerWatts PowerKilowatts
 *   TemperatureCelsius DurationYears DurationDays CapacityAmpereHours
 *   VoltageVolts CurrentAmperes ResistanceOhms ForceNewtons SheddingRateMgKg
 *   VolumeLiters FrequencyHertz LuminanceCandela
 *
 * Each is replaced by `{type: "QuantitativeValue", value, unitCode: <REC20>}`,
 * preserving any other keys (id, description, etc.) and any `unitCode` that
 * was already there (with a warning if it disagrees with the canonical code).
 *
 * Idempotent — already-migrated objects are left alone.
 *
 * Usage: tsx scripts/migrate-quantitative-values.ts [filter-substring]
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Class -> UN/CEFACT Rec 20 unit code.
const CLASS_TO_UNIT: Record<string, string> = {
  Percentage: 'P1',
  DurationYears: 'ANN',
  DurationDays: 'DAY',
  WeightKilograms: 'KGM',
  EnergyKilowattHours: 'KWH',
  PowerWatts: 'WTT',
  PowerKilowatts: 'KWT',
  TemperatureCelsius: 'CEL',
  CapacityAmpereHours: 'AMH',
  VoltageVolts: 'VLT',
  CurrentAmperes: 'AMP',
  ResistanceOhms: 'OHM',
  ForceNewtons: 'NEW',
  SheddingRateMgKg: 'MGM',
  VolumeLiters: 'LTR',
  FrequencyHertz: 'HTZ',
  LuminanceCandela: 'CDM2',
};

// Also accept the prefixed forms.
const PREFIXED: Record<string, string> = {};
for (const [k, v] of Object.entries(CLASS_TO_UNIT)) {
  PREFIXED[`oec:${k}`] = v;
  PREFIXED[`eubat:${k}`] = v;
  PREFIXED[`eutex:${k}`] = v;
  PREFIXED[`euelec:${k}`] = v;
}
const ALL_TYPES: Record<string, string> = { ...CLASS_TO_UNIT, ...PREFIXED };

interface Stats {
  rewritten: number;
  conflicts: Array<{ file: string; type: string; existing: string; canonical: string }>;
}

function rewrite(node: any, stats: Stats, file: string): any {
  if (Array.isArray(node)) return node.map((n) => rewrite(n, stats, file));
  if (node === null || typeof node !== 'object') return node;

  const typeKey = '@type' in node ? '@type' : 'type' in node ? 'type' : null;
  if (typeKey) {
    const t = (node as any)[typeKey];
    // Accept single string types only (multi-type arrays are unusual for QuantitativeValue).
    if (typeof t === 'string' && t in ALL_TYPES) {
      const canonical = ALL_TYPES[t];
      const existing = (node as any).unitCode ?? (node as any)['gs1:unitCode'];
      if (existing && existing !== canonical) {
        stats.conflicts.push({ file, type: t, existing, canonical });
      }
      const rewritten: any = {};
      for (const [k, v] of Object.entries(node)) {
        if (k === typeKey) {
          rewritten[typeKey] = 'QuantitativeValue';
        } else {
          rewritten[k] = rewrite(v, stats, file);
        }
      }
      // Insert unitCode if absent. Place it right after `value` for readability.
      if (!('unitCode' in rewritten) && !('gs1:unitCode' in rewritten)) {
        const ordered: any = {};
        for (const [k, v] of Object.entries(rewritten)) {
          ordered[k] = v;
          if (k === 'value') ordered.unitCode = canonical;
        }
        if (!('unitCode' in ordered)) ordered.unitCode = canonical;
        stats.rewritten += 1;
        return ordered;
      }
      stats.rewritten += 1;
      return rewritten;
    }
  }

  const out: any = {};
  for (const [k, v] of Object.entries(node)) out[k] = rewrite(v, stats, file);
  return out;
}

async function processFile(filePath: string, stats: Stats): Promise<boolean> {
  const text = await fs.readFile(filePath, 'utf8');
  const doc = JSON.parse(text);
  const transformed = rewrite(doc, stats, path.relative(ROOT, filePath));
  const newText = JSON.stringify(transformed, null, 2) + '\n';
  if (newText === text) return false;
  await fs.writeFile(filePath, newText, 'utf8');
  return true;
}

async function main() {
  const targets: string[] = [];
  const exts = [
    'extensions/eu/battery',
    'extensions/eu/textile',
    'extensions/eu/electronics',
    'extensions/eu/eudr',
    'extensions/eu/detergent',
    'extensions/us/fsma204',
    'extensions/common/core',
    'extensions/common/interop',
  ];
  for (const dir of exts) {
    for (const sub of ['examples', 'epcis']) {
      const full = path.join(ROOT, dir, sub);
      try {
        const files = await fs.readdir(full);
        for (const f of files) if (f.endsWith('.jsonld')) targets.push(path.join(full, f));
      } catch {}
    }
  }

  const filter = process.argv[2];
  const filtered = filter ? targets.filter((t) => t.includes(filter)) : targets;

  const stats: Stats = { rewritten: 0, conflicts: [] };
  let changedFiles = 0;
  for (const t of filtered) {
    if (await processFile(t, stats)) {
      console.log(`changed ${path.relative(ROOT, t)}`);
      changedFiles += 1;
    }
  }
  console.log(`\nProcessed ${filtered.length} files: ${changedFiles} changed, ${stats.rewritten} value objects rewritten.`);
  if (stats.conflicts.length) {
    console.log('\nWARN: unitCode conflicts (kept existing — please review):');
    for (const c of stats.conflicts) {
      console.log(`  ${c.file}: type=${c.type} existing=${c.existing} canonical=${c.canonical}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
