import { resolve } from 'node:path';
import { writeJson, readJson } from './lib/io.js';
import { httpFetch, expectOk } from './lib/http.js';
import { ALL_FLOWS, FLOWS_DIR, OUT_DIR, getenv, type FlowName } from './lib/env.js';

async function generate(flow: FlowName): Promise<void> {
  const inputPath = resolve(FLOWS_DIR, `${flow}.input.json`);
  const outputPath = resolve(OUT_DIR, `${flow}.raw.jsonld`);
  const url = getenv('TESTDATA_GENERATOR_URL');

  const input = readJson<Record<string, unknown>>(inputPath);
  const response = await httpFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(input),
  });
  await expectOk(response, `generate(${flow}) → POST ${url}`);
  const generated = await response.json();
  writeJson(outputPath, generated);
  console.log(`generated ${flow} → ${outputPath}`);
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? (args as FlowName[]) : ALL_FLOWS;
for (const flow of targets) await generate(flow);
