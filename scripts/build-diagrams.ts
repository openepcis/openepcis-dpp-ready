/**
 * Compile every D2 diagram source to committed light + dark SVGs.
 *
 * D2 is the single source of truth for diagrams in this repo. Each
 * `tools/vocab-sync/docs/diagrams/*.d2` is compiled to two themed SVGs:
 *   <name>-light.svg  (theme 0,   Neutral Default)
 *   <name>-dark.svg   (theme 200, Dark Mauve)
 * embedded via <picture> + prefers-color-scheme in the Markdown docs.
 *
 * The `diagrams` GitHub Actions workflow runs this and fails if the
 * committed SVGs are stale (git diff --exit-code), so the SVGs in git
 * always match their .d2 source.
 *
 * Requires the `d2` CLI on PATH (`brew install d2`).
 *
 * Usage: pnpm run diagrams:build
 */
import { execFileSync } from "child_process";
import { existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DIAGRAMS_DIR = join(__dirname, "../tools/vocab-sync/docs/diagrams");

// theme id → output suffix. d2 theme 0 = Neutral Default (light),
// 200 = Dark Mauve (dark). See `d2 themes`.
const VARIANTS: Array<{ theme: number; suffix: string }> = [
  { theme: 0, suffix: "light" },
  { theme: 200, suffix: "dark" },
];

function ensureD2(): void {
  try {
    execFileSync("d2", ["--version"], { stdio: "ignore" });
  } catch {
    console.error("[build-diagrams] `d2` CLI not found on PATH. Install it: brew install d2");
    process.exit(1);
  }
}

function build(): void {
  ensureD2();

  if (!existsSync(DIAGRAMS_DIR)) {
    console.error(`[build-diagrams] no diagrams directory at ${DIAGRAMS_DIR}`);
    process.exit(1);
  }

  const sources = readdirSync(DIAGRAMS_DIR).filter((f) => f.endsWith(".d2")).sort();
  if (sources.length === 0) {
    console.log("[build-diagrams] no .d2 sources found — nothing to do.");
    return;
  }

  let built = 0;
  for (const src of sources) {
    const base = src.replace(/\.d2$/, "");
    const srcPath = join(DIAGRAMS_DIR, src);
    for (const { theme, suffix } of VARIANTS) {
      const out = join(DIAGRAMS_DIR, `${base}-${suffix}.svg`);
      // --pad keeps a small consistent margin; deterministic output is essential
      // for the stale-check git diff in CI.
      execFileSync("d2", ["--theme", String(theme), "--pad", "20", srcPath, out], {
        stdio: "inherit",
      });
      console.log(`[build-diagrams] ${src} → ${base}-${suffix}.svg`);
      built++;
    }
  }
  console.log(`[build-diagrams] done — ${built} SVG(s) from ${sources.length} source(s).`);
}

build();
