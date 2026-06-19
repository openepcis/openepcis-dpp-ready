/**
 * One-off migration: rename OpenEPCIS vocabulary PREFIXES (aliases only — the
 * namespace IRIs under https://ref.openepcis.io/extensions/… are unchanged).
 *
 *   dpp→oec  interop→oei  battery→eubat  textile→eutex  electronics→euelec
 *   detergent→eudet  ppwr→euppwr  cpr→eucpr  fsma→usfsma
 *   (eudr, rail and all external prefixes: unchanged)
 *
 * Usage: node scripts/rename-prefixes.mjs --dry   (report only)
 *        node scripts/rename-prefixes.mjs         (apply)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";

const RENAMES = {
  dpp: "oec", interop: "oei", battery: "eubat", textile: "eutex",
  electronics: "euelec", detergent: "eudet", ppwr: "euppwr", cpr: "eucpr", fsma: "usfsma",
};
const DRY = process.argv.includes("--dry");
const ROOTS = ["extensions", "scripts", "docs", ".claude/reference"];
const TOP_FILES = ["CLAUDE.md", "README.md"];
const SKIP_DIR = new Set(["node_modules", ".git", ".playwright-mcp"]);
const SKIP_FILE = new Set(["rename-prefixes.mjs"]);
const SKIP_EXT = new Set([".xlsx", ".pdf", ".png", ".jpg", ".lock", ".yaml", ".yml"]);

const NS = "https://ref\\.openepcis\\.io/extensions/";
const lb = "(?<![A-Za-z0-9_/-])"; // not part of a longer token

function transform(file, text) {
  const ext = extname(file);
  let out = text;
  const counts = {};
  const bump = (k, n) => { if (n) counts[k] = (counts[k] || 0) + n; };
  const sub = (re, repl) => {
    const m = out.match(re);
    const n = m ? m.length : 0;
    // Pass repl straight to String.replace so $1/$2 backreferences work for
    // string replacements (a function wrapper would emit them literally).
    out = out.replace(re, repl);
    return n;
  };

  for (const [oldP, newP] of Object.entries(RENAMES)) {
    if (ext === ".ttl") {
      bump(oldP, sub(new RegExp(`${lb}${oldP}:`, "g"), `${newP}:`));
      bump(oldP, sub(new RegExp(`(vann:preferredNamespacePrefix\\s+")${oldP}(")`, "g"), `$1${newP}$2`));
    } else if (ext === ".jsonld" || ext === ".json") {
      // context prefix key: "old": "https://…extensions/…"
      bump(oldP, sub(new RegExp(`"${oldP}"(\\s*:\\s*)"${NS}`, "g"), `"${newP}"$1"https://ref.openepcis.io/extensions/`));
      // CURIEs in string values / keys
      bump(oldP, sub(new RegExp(`${lb}${oldP}:`, "g"), `${newP}:`));
      // GS1-Extensions header label
      bump(oldP, sub(new RegExp(`${lb}${oldP}=https`, "g"), `${newP}=https`));
    } else if (ext === ".md") {
      bump(oldP, sub(new RegExp(`${lb}${oldP}:`, "g"), `${newP}:`));
      bump(oldP, sub(new RegExp(`${lb}${oldP}=https`, "g"), `${newP}=https`));
    } else if (ext === ".ts") {
      // only quoted CURIEs (never bare JS `name:` or type annotations)
      bump(oldP, sub(new RegExp(`(['"\`])${oldP}:`, "g"), `$1${newP}:`));
      bump(oldP, sub(new RegExp(`${lb}${oldP}=https`, "g"), `${newP}=https`));
    }
  }
  return { out, counts, changed: out !== text };
}

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    if (SKIP_DIR.has(e)) continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const files = [];
for (const r of ROOTS) { try { files.push(...walk(r)); } catch {} }
for (const f of TOP_FILES) files.push(f);

const totals = {};
let changedFiles = 0;
for (const f of files) {
  if (SKIP_FILE.has(basename(f))) continue;
  if (SKIP_EXT.has(extname(f))) continue;
  if (![".ttl", ".jsonld", ".json", ".md", ".ts"].includes(extname(f))) continue;
  let text;
  try { text = readFileSync(f, "utf-8"); } catch { continue; }
  const { out, counts, changed } = transform(f, text);
  if (!changed) continue;
  changedFiles++;
  for (const [k, v] of Object.entries(counts)) totals[k] = (totals[k] || 0) + v;
  if (DRY) console.log(`  ${f}  ${Object.entries(counts).map(([k, v]) => `${k}:${k===k?RENAMES[k]:""}×${v}`).join(" ")}`);
  else writeFileSync(f, out);
}

console.log(`\n${DRY ? "[DRY RUN] would change" : "changed"} ${changedFiles} files`);
console.log("replacements per prefix:", Object.fromEntries(Object.entries(totals).map(([k, v]) => [`${k}→${RENAMES[k]}`, v])));
