/**
 * Orchestrates one flow end-to-end:
 *   seed-dlr  →  generate  →  merge-masterdata  →  capture  →  verify
 *
 * Steps that don't apply to lifecycle flows (no sidecar) are skipped.
 * Capture / verify steps are skipped when SKIP_CLUSTER=1 (smoke-test mode
 * against the public testdata-generator only).
 */
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_FLOWS, type FlowName } from './lib/env.js';

const here = dirname(fileURLToPath(import.meta.url));

function run(script: string, flow: FlowName): Promise<void> {
  return new Promise((resolveP, rejectP) => {
    const child = spawn('tsx', [resolve(here, script), flow], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', (code) => (code === 0 ? resolveP() : rejectP(new Error(`${script} exited ${code}`))));
  });
}

const flow = process.argv[2] as FlowName | undefined;
if (!flow || !ALL_FLOWS.includes(flow)) {
  console.error(`Usage: tsx run-flow.ts <flow>\n  flows: ${ALL_FLOWS.join(', ')}`);
  process.exit(2);
}

const skipCluster = process.env.SKIP_CLUSTER === '1';

console.log(`==> ${flow}`);
if (!skipCluster) await run('seed-dlr.ts', flow);
await run('generate.ts', flow);
await run('merge-masterdata.ts', flow);
await run('to-designer.ts', flow);
if (!skipCluster) {
  await run('capture.ts', flow);
  await run('verify.ts', flow);
}
console.log(`==> ${flow} done`);
