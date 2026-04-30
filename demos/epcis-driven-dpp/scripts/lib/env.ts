import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const DEMO_ROOT = resolve(here, '..', '..');
export const FLOWS_DIR = resolve(DEMO_ROOT, 'flows');
export const OUT_DIR = resolve(DEMO_ROOT, 'out');

export type FlowName =
  | 'battery-commission'
  | 'battery-state-of-health'
  | 'battery-lifecycle'
  | 'textile-garment-transform'
  | 'textile-durability'
  | 'textile-lifecycle';

export const ALL_FLOWS: FlowName[] = [
  'battery-commission',
  'battery-state-of-health',
  'battery-lifecycle',
  'textile-garment-transform',
  'textile-durability',
  'textile-lifecycle',
];

export const SIDECAR_FOR_FLOW: Record<FlowName, FlowName | null> = {
  'battery-commission': 'battery-commission',
  'battery-state-of-health': null,
  'battery-lifecycle': null,
  'textile-garment-transform': 'textile-garment-transform',
  'textile-durability': null,
  'textile-lifecycle': null,
};

const BATTERY_GS1_EXT =
  'dpp=https://ref.openepcis.io/extensions/common/core/,battery=https://ref.openepcis.io/extensions/eu/battery/';
const TEXTILE_GS1_EXT =
  'dpp=https://ref.openepcis.io/extensions/common/core/,textile=https://ref.openepcis.io/extensions/eu/textile/';

export const GS1_EXTENSIONS_FOR_FLOW: Record<FlowName, string> = {
  'battery-commission': BATTERY_GS1_EXT,
  'battery-state-of-health': BATTERY_GS1_EXT,
  'battery-lifecycle': BATTERY_GS1_EXT,
  'textile-garment-transform': TEXTILE_GS1_EXT,
  'textile-durability': TEXTILE_GS1_EXT,
  'textile-lifecycle': TEXTILE_GS1_EXT,
};

function loadDotenv(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotenv(resolve(DEMO_ROOT, '.env.local'));
loadDotenv(resolve(DEMO_ROOT, 'env', 'local.env.example'));

export function getenv(name: string, fallback?: string): string {
  const v = process.env[name];
  if (v === undefined || v === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const TLS_INSECURE = process.env.INSECURE_TLS === '1';
