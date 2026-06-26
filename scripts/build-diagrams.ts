/**
 * Compile every D2 diagram source in the repo to committed light + dark SVGs.
 *
 * D2 is the single source of truth for diagrams. Every `*.d2` anywhere under
 * the repo (excluding node_modules / .git) is compiled to two themed SVGs
 * next to it:
 *   <name>-light.svg  (theme 0,   Neutral Default)
 *   <name>-dark.svg   (theme 200, Dark Mauve)
 * embedded via <picture> + prefers-color-scheme in the Markdown docs, so a
 * diagram can live next to the doc that uses it (docs/diagrams/,
 * extensions/eu/battery/docs/diagrams/, tools/vocab-sync/docs/diagrams/, …).
 *
 * The `diagrams` GitHub Actions workflow runs this and fails if the committed
 * SVGs are stale (git diff --exit-code), so the SVGs in git always match their
 * .d2 source. d2 output is deterministic *per version*, so MIN_D2_VERSION is
 * pinned to keep committed SVGs from churning between contributors.
 *
 * Requires the `d2` CLI on PATH (`brew install d2`, >= MIN_D2_VERSION).
 *
 * Usage: pnpm run diagrams:build
 */
import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

// Bump together with the committed SVGs whenever the pinned d2 changes output.
const MIN_D2_VERSION = [0, 7, 0];

// d2 theme 0 = Neutral Default (light), 200 = Dark Mauve (dark). See `d2 themes`.
const VARIANTS: Array<{ theme: number; suffix: string }> = [
  { theme: 0, suffix: "light" },
  { theme: 200, suffix: "dark" },
];

const SKIP_DIRS = new Set(["node_modules", ".git"]);

function ensureD2(): void {
  let raw: string;
  try {
    raw = execFileSync("d2", ["--version"], { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    console.error(
      `[build-diagrams] \`d2\` CLI not found on PATH. Install it: brew install d2 (>= ${MIN_D2_VERSION.join(".")})`,
    );
    process.exit(1);
  }
  const m = raw.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!m) {
    console.warn(`[build-diagrams] could not parse d2 version from "${raw}" — proceeding.`);
    return;
  }
  const v = [Number(m[1]), Number(m[2]), Number(m[3])];
  const cmp = v[0] - MIN_D2_VERSION[0] || v[1] - MIN_D2_VERSION[1] || v[2] - MIN_D2_VERSION[2];
  if (cmp < 0) {
    console.error(
      `[build-diagrams] d2 ${v.join(".")} is too old; need >= ${MIN_D2_VERSION.join(".")} ` +
        `(committed SVGs were generated with a newer d2). Upgrade: brew upgrade d2`,
    );
    process.exit(1);
  }
}

/** Recursively collect every *.d2 path under `dir`. */
function findD2Sources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      findD2Sources(join(dir, entry.name), out);
    } else if (entry.isFile() && entry.name.endsWith(".d2")) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function build(): void {
  ensureD2();

  const sources = findD2Sources(REPO_ROOT).sort();
  if (sources.length === 0) {
    console.log("[build-diagrams] no .d2 sources found — nothing to do.");
    return;
  }

  // Clean stale outputs first so a renamed/deleted .d2 can't leave orphan SVGs
  // behind in a diagram directory. Only remove SVGs that match our naming.
  const dirs = new Set(sources.map((s) => dirname(s)));
  for (const dir of dirs) {
    for (const f of readdirSync(dir)) {
      if (f.endsWith("-light.svg") || f.endsWith("-dark.svg")) {
        rmSync(join(dir, f), { force: true });
      }
    }
  }

  let built = 0;
  for (const srcPath of sources) {
    const dir = dirname(srcPath);
    const base = srcPath.slice(dir.length + 1).replace(/\.d2$/, "");
    for (const { theme, suffix } of VARIANTS) {
      const out = join(dir, `${base}-${suffix}.svg`);
      try {
        // --pad keeps a small consistent margin and deterministic output.
        // Silence d2's own stdout; keep stderr so compile errors surface.
        execFileSync("d2", ["--theme", String(theme), "--pad", "20", srcPath, out], {
          stdio: ["ignore", "ignore", "inherit"],
        });
      } catch {
        console.error(
          `[build-diagrams] failed to compile ${srcPath} (${suffix}). See d2 error above.`,
        );
        process.exit(1);
      }
      // Normalize the embedded version string so output is independent of how the
      // d2 binary was built: Homebrew reports "0.7.1" but the GitHub-release binary
      // (used in CI) reports "v0.7.1". Without this, the committed SVGs and the
      // CI-regenerated SVGs differ only by that "v" and the stale-check fails.
      const svg = readFileSync(out, "utf8");
      const normalized = svg.replace('data-d2-version="v', 'data-d2-version="');
      if (normalized !== svg) writeFileSync(out, normalized);
      console.log(`[build-diagrams] ${base}.d2 → ${base}-${suffix}.svg  (${dir.slice(REPO_ROOT.length + 1)})`);
      built++;
    }
  }
  console.log(`[build-diagrams] done — ${built} SVG(s) from ${sources.length} source(s).`);
}

build();
