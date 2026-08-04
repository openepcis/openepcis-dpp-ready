/**
 * Node wrapper of the EC Battery Passport SHACL readiness check: reads the
 * generated shapes from the filesystem and expands passports with the repo's
 * offline documentLoader. The engine/fold/report logic lives in the
 * environment-neutral core (ec-readiness-shacl-core.ts), which the browser
 * demo bundles with esbuild-provided IO instead.
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { documentLoader } from "../en18223/node-io.ts";
import type { Category } from "./ec-readiness.ts";
import {
  validateWithShaclCore,
  type ShaclReport,
  type ShaclFinding,
} from "./ec-readiness-shacl-core.ts";

export type { ShaclReport, ShaclFinding };

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHAPES_PATH = join(
  __dirname,
  "../../extensions/eu/battery/validation/ec-readiness-shapes.ttl",
);

export async function validateWithShacl(
  docs: unknown[],
  category: Category,
): Promise<ShaclReport> {
  return validateWithShaclCore(readFileSync(SHAPES_PATH, "utf-8"), docs, category, documentLoader);
}
