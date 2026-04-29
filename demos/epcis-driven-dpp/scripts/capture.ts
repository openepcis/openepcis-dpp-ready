import { resolve } from 'node:path';
import { readJson } from './lib/io.js';
import { httpFetch, expectOk } from './lib/http.js';
import { getAccessToken } from './lib/keycloak.js';
import { ALL_FLOWS, GS1_EXTENSIONS_FOR_FLOW, OUT_DIR, getenv, type FlowName } from './lib/env.js';

async function capture(flow: FlowName): Promise<void> {
  const finalPath = resolve(OUT_DIR, `${flow}.final.jsonld`);
  const doc = readJson<unknown>(finalPath);
  const url = `${getenv('EPCIS_API_URL')}/capture`;
  const token = await getAccessToken();

  const response = await httpFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ld+json',
      'GS1-Extensions': GS1_EXTENSIONS_FOR_FLOW[flow],
      'GS1-EPCIS-Version': '2.0',
      'GS1-CBV-Version': '2.0',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(doc),
  });
  await expectOk(response, `capture(${flow}) → POST ${url}`);

  const location = response.headers.get('location') ?? '';
  const eventId = location.split('/').pop() ?? '';
  console.log(`capture ${flow}: ${response.status} ${response.statusText}  location=${location}  eventId=${eventId}`);
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? (args as FlowName[]) : ALL_FLOWS;
for (const flow of targets) await capture(flow);
