/**
 * Read-back assertions per flow.
 * Each step is intentionally tolerant — it logs PASS/FAIL/SKIP rather than
 * throwing on the first failure, so an operator inspecting the demo can see
 * which capabilities of the local cluster are wired up and which aren't.
 */
import { resolve } from 'node:path';
import { readJson } from './lib/io.js';
import { httpFetch } from './lib/http.js';
import { getAccessToken } from './lib/keycloak.js';
import { OUT_DIR, getenv, ALL_FLOWS, SIDECAR_FOR_FLOW, type FlowName } from './lib/env.js';

type EPCISDoc = {
  epcisBody?: { eventList?: { epcList?: string[]; outputEPCList?: string[] }[] };
};

function pathFromGs1Url(url: string): string {
  return new URL(url).pathname;
}

function logResult(label: string, ok: boolean, detail = ''): void {
  const tag = ok ? 'PASS' : 'FAIL';
  console.log(`  [${tag}] ${label}${detail ? ` — ${detail}` : ''}`);
}

async function verifyDlr(flow: FlowName): Promise<void> {
  const sidecarFlow = SIDECAR_FOR_FLOW[flow];
  if (!sidecarFlow) return;
  const sidecar = readJson<{ masterData?: { id: string; type?: string }[] }>(
    resolve(OUT_DIR, '..', 'flows', `${sidecarFlow}.masterdata.jsonld`)
  );
  const base = getenv('DLR_URL');
  const token = await getAccessToken().catch(() => '');

  for (const card of sidecar.masterData ?? []) {
    const url = `${base}${pathFromGs1Url(card.id)}?linkType=gs1:masterData`;
    const response = await httpFetch(url, {
      headers: {
        Accept: 'application/ld+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    logResult(`DLR ${pathFromGs1Url(card.id)}`, response.ok, `status=${response.status}`);
  }
}

async function verifyEvents(flow: FlowName): Promise<void> {
  const finalPath = resolve(OUT_DIR, `${flow}.final.jsonld`);
  const doc = readJson<EPCISDoc>(finalPath);
  const epcs = new Set<string>();
  for (const event of doc.epcisBody?.eventList ?? []) {
    for (const epc of event.epcList ?? []) epcs.add(epc);
    for (const epc of event.outputEPCList ?? []) epcs.add(epc);
  }
  const base = getenv('EPCIS_API_URL');
  const token = await getAccessToken().catch(() => '');

  for (const epc of epcs) {
    const url = `${base}/events?MATCH_anyEPC=${encodeURIComponent(epc)}`;
    const response = await httpFetch(url, {
      headers: {
        Accept: 'application/ld+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    logResult(`Repository query for ${epc}`, response.ok, `status=${response.status}`);
  }
}

async function verify(flow: FlowName): Promise<void> {
  console.log(`verify ${flow}`);
  await verifyDlr(flow);
  await verifyEvents(flow);
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? (args as FlowName[]) : ALL_FLOWS;
for (const flow of targets) await verify(flow);
