/**
 * Export OpenEPCIS battery passports as BatteryPass-Ready 2.0.1 documents (the GEFEG data model,
 * vendor/batterypass-ready/2.0.1), through the crosswalk profile `batterypass`
 * (extensions/common/interop/crosswalk/batterypass): lift, then the document per passport, checked
 * against the JSON Schema of the battery's category.
 *
 * A passport is an item-level battery that states its category (BatteryPass-Ready describes items
 * only). Values the passport does not have are reported (the schema's required elements); a wrong
 * form fails, as it would in the crosswalk gate.
 *
 * Usage:
 *   tsx scripts/export-batterypass-ready.ts <passport.jsonld> [out.json]
 *
 * The older GEFEG upload shape (data model 1.0 / longlist v1.3, live validator) is
 * scripts/export-batterypass-gefeg.ts.
 */
import { writeFileSync } from "node:fs";
import { convert, jsonldToQuads, loadBackground, loadInput, loadProfile } from "./lib/crosswalk.ts";
import { jsonSchemaFindings, toTheirJson } from "./lib/crosswalk-target.ts";

export interface ReadyExport {
  docs: Record<string, unknown>[];
  /** Per document: required values it lacks, and wrong forms (should be none). */
  findings: { missing: string[]; form: string[] }[];
}

/** The BatteryPass-Ready 2.0.1 documents of an OpenEPCIS JSON-LD file (one per item passport). */
export async function exportBatteryPassReady(file: string): Promise<ReadyExport> {
  return exportQuads(await loadInput(file));
}

/** The same for a passport held in memory (a JSON-LD document, e.g. one assembled from layers and events). */
export async function exportBatteryPassReadyDoc(doc: unknown): Promise<ReadyExport> {
  return exportQuads(await jsonldToQuads(doc));
}

async function exportQuads(quads: Awaited<ReturnType<typeof loadInput>>): Promise<ReadyExport> {
  const p = loadProfile("batterypass");
  await loadBackground(p);
  const lifted = convert(p, "lift", quads);
  const docs = await toTheirJson(p, lifted.quads);
  return { docs, findings: docs.map((d) => jsonSchemaFindings(p, d)) };
}

if (process.argv[1]?.endsWith("export-batterypass-ready.ts")) {
  const [file, out] = process.argv.slice(2);
  if (!file) {
    console.error("usage: tsx scripts/export-batterypass-ready.ts <passport.jsonld> [out.json]");
    process.exit(64);
  }
  const { docs, findings } = await exportBatteryPassReady(file);
  if (!docs.length) {
    console.error(`${file}: no item-level battery passport with a category: nothing to export`);
    process.exit(1);
  }
  const json = JSON.stringify(docs.length === 1 ? docs[0] : docs, null, 2) + "\n";
  if (out) writeFileSync(out, json);
  else process.stdout.write(json);
  findings.forEach((f, i) => {
    const id = (docs[i].dppHeader as Record<string, unknown> | undefined)?.uniqueProductIdentifier ?? `document ${i + 1}`;
    console.error(`${id}: ${f.missing.length} required value(s) missing, ${f.form.length} wrong form(s)`);
    for (const m of f.missing) console.error(`  missing  ${m}`);
    for (const m of f.form) console.error(`  FORM     ${m}`);
  });
  if (findings.some((f) => f.form.length)) process.exit(1);
}
