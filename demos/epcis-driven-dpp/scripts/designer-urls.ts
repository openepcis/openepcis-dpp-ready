/**
 * Print Test Data Designer UI URLs for each flow.
 *
 *   https://tools.openepcis.io/ui/event-data-designer/?url=<raw-github-url>
 *
 * The URLs only work AFTER `flows/designer/*.designer.json` is pushed to a
 * public branch. Until then, treat them as templates.
 *
 * Override the repo / branch via env: REPO_OWNER, REPO_NAME, REPO_BRANCH,
 * REPO_PATH (default: demos/epcis-driven-dpp/flows/designer).
 */
import { ALL_FLOWS } from './lib/env.js';

const owner = process.env.REPO_OWNER ?? 'openepcis';
const name = process.env.REPO_NAME ?? 'openepcis-dpp-ready';
const branch = process.env.REPO_BRANCH ?? 'main';
const path = process.env.REPO_PATH ?? 'demos/epcis-driven-dpp/flows/designer';
const designerBase = 'https://tools.openepcis.io/ui/event-data-designer/?url=';

console.log(`# Designer URLs for ${owner}/${name}@${branch}`);
console.log(`# (URLs only work once the files are pushed)\n`);

for (const flow of ALL_FLOWS) {
  const raw = `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${path}/${flow}.designer.json`;
  console.log(`## ${flow}`);
  console.log(`raw:      ${raw}`);
  console.log(`designer: ${designerBase}${raw}\n`);
}
