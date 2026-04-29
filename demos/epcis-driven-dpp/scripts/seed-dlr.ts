/**
 * Seed the local Digital Link Resolver (Colima k3s) with the master-data
 * cards from each *.masterdata.jsonld sidecar.
 *
 * For each card:
 *   1. PUT a Product / Place / Organization record (via the resolver's
 *      product API — accepts JSON-LD with @JsonAnySetter for extensions).
 *   2. POST a LinkSet with a gs1:masterData link pointing back at the
 *      same Digital Link, so GET /<dl>?linkType=masterData returns the
 *      card inline (200) instead of redirecting.
 *
 * The exact API path / verb is read from openepcis-build/modules/openepcis-digital-link-resolver/.
 * As ground-truthed in our exploration:
 *   POST /{digitalLinkSet}              — register link entries (LinkSet payload)
 *   GET  /{digitalLink}?linkType=masterData → returns the master data card (application/ld+json)
 *
 * If the deployment differs (e.g. PUT vs POST, or the Product API is mounted
 * separately), tweak the RESOLVER_PRODUCT_PATH / RESOLVER_LINKSET_PATH below.
 */
import { resolve } from 'node:path';
import { readJson } from './lib/io.js';
import { httpFetch, expectOk } from './lib/http.js';
import { getAccessToken } from './lib/keycloak.js';
import { FLOWS_DIR, getenv, SIDECAR_FOR_FLOW, ALL_FLOWS, type FlowName } from './lib/env.js';

type Card = Record<string, unknown> & { id: string; type?: string };

function pathFromGs1Url(url: string): string {
  const u = new URL(url);
  return u.pathname; // e.g. /01/09521234000013/21/BAT2024-001
}

async function putProduct(card: Card, token: string): Promise<void> {
  const base = getenv('DLR_URL');
  const dlPath = pathFromGs1Url(card.id);
  const url = `${base}${dlPath}`;
  const response = await httpFetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/ld+json',
      Accept: 'application/ld+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(card),
  });
  await expectOk(response, `seed-dlr PUT ${url}`);
  console.log(`  PUT ${dlPath}  (${card.type ?? 'object'})`);
}

async function postLinkSet(card: Card, token: string): Promise<void> {
  const base = getenv('DLR_URL');
  const dlPath = pathFromGs1Url(card.id);
  const url = `${base}${dlPath}`;
  const linkSet = {
    linkset: [
      {
        anchor: card.id,
        itemDescription:
          ((card['gs1:productName'] as { en?: string } | undefined)?.en) ??
          ((card['gs1:physicalLocationName'] as { en?: string } | undefined)?.en) ??
          ((card['gs1:organizationName'] as { en?: string } | undefined)?.en) ??
          'OpenEPCIS DPP demo entry',
        'gs1:masterData': [
          {
            href: `${dlPath}?linkType=gs1:masterData`,
            title: 'Product master data',
            type: 'application/ld+json',
            hreflang: ['en'],
          },
        ],
      },
    ],
  };
  const response = await httpFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(linkSet),
  });
  await expectOk(response, `seed-dlr POST ${url}`);
  console.log(`  POST ${dlPath}  (linkset)`);
}

async function seedFlow(flow: FlowName): Promise<void> {
  const sidecarFlow = SIDECAR_FOR_FLOW[flow];
  if (!sidecarFlow) {
    console.log(`seed-dlr ${flow}: no sidecar (lifecycle flow), skipping`);
    return;
  }
  const sidecarPath = resolve(FLOWS_DIR, `${sidecarFlow}.masterdata.jsonld`);
  const sidecar = readJson<{ masterData?: Card[] }>(sidecarPath);
  const cards = sidecar.masterData ?? [];
  console.log(`seed-dlr ${flow}: ${cards.length} card(s) from ${sidecarPath}`);

  const token = await getAccessToken();
  for (const card of cards) {
    await putProduct(card, token);
    await postLinkSet(card, token);
  }
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? (args as FlowName[]) : ALL_FLOWS;
for (const flow of targets) await seedFlow(flow);
