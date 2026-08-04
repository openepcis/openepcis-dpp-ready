/**
 * SHACL execution path of the EC Battery Passport readiness check (Node-only).
 *
 * Runs a real SHACL engine (rdf-validate-shacl) over the generated
 * validation/ec-readiness-shapes.ttl: the passport JSON-LD documents are
 * expanded to RDF with the repo's offline documentLoader, the shapes of the
 * chosen category are activated (all shapes ship sh:deactivated true, one
 * category's suffix is flipped), and the standard sh:ValidationReport comes
 * back mapped to the data-point numbers carried in the sh:message texts.
 *
 * Deliberately separate from ec-readiness.ts: that structural core stays
 * dependency-free so the browser demo can bundle it; this module pulls in
 * jsonld/n3/rdf-ext/rdf-validate-shacl and reads from the filesystem.
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Parser, Store, DataFactory } from "n3";
import jsonld from "jsonld";
// rdf-validate-shacl ships no usable types in this setup; it brings its own
// RDF/JS environment and accepts any quad iterable (n3 Store included).
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SHACLValidator from "rdf-validate-shacl";
import { documentLoader } from "../en18223/node-io.ts";
import type { Category } from "./ec-readiness.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHAPES_PATH = join(
  __dirname,
  "../../extensions/eu/battery/validation/ec-readiness-shapes.ttl",
);

const SH = "http://www.w3.org/ns/shacl#";

export interface ShaclFinding {
  severity: "Violation" | "Warning" | "Info";
  message: string;
  focusNode: string;
  sourceShape: string;
  /** Data point number parsed from the message ("EC data point N …"), if present. */
  dataPoint?: number;
}

export interface ShaclReport {
  conforms: boolean;
  category: Category;
  shapesActivated: number;
  findings: ShaclFinding[];
}

export async function validateWithShacl(
  docs: unknown[],
  category: Category,
): Promise<ShaclReport> {
  // Shapes: activate the chosen category by dropping its sh:deactivated triples.
  const shapes = new Store(new Parser().parse(readFileSync(SHAPES_PATH, "utf-8")));
  const deactivated = [...shapes.match(null, DataFactory.namedNode(`${SH}deactivated`), null, null)];
  let activated = 0;
  for (const quad of deactivated) {
    if (quad.subject.value.endsWith(`-${category}`)) {
      shapes.removeQuad(quad);
      activated++;
    }
  }

  // Data: merge every passport level into one graph (dynamic data points only
  // exist at item level; the guidance is evaluated per battery, not per file).
  const data = new Store();
  for (const doc of docs) {
    const nquads = (await jsonld.toRDF(doc as object, {
      format: "application/n-quads",
      documentLoader,
    })) as unknown as string;
    data.addQuads(new Parser({ format: "N-Quads" }).parse(nquads));
  }

  // Fold the GS1 Digital Link hierarchy: the model (01), batch (01+10) and item
  // (01+21) passports of one battery are distinct eubat:Battery nodes in RDF,
  // but per the granularity model a finer passport RESOLVES model/batch data up
  // the hierarchy rather than restating it. Mirror that resolution by rewriting
  // every Battery node to one canonical focus node before validation —
  // otherwise each level would be (wrongly) validated as a complete passport.
  const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
  const BATTERY = "https://ref.openepcis.io/extensions/eu/battery/Battery";
  const batteryNodes = [
    ...data.match(null, DataFactory.namedNode(RDF_TYPE), DataFactory.namedNode(BATTERY), null),
  ].map((q) => q.subject);
  if (batteryNodes.length > 1) {
    // Canonical node: the most specific Digital Link (serial > lot > plain GTIN).
    const specificity = (v: string) => (v.includes("/21/") ? 2 : v.includes("/10/") ? 1 : 0);
    const canonical = batteryNodes.reduce((a, b) =>
      specificity(b.value) > specificity(a.value) ? b : a,
    );
    const others = new Set(batteryNodes.filter((n) => !n.equals(canonical)).map((n) => n.value));
    for (const quad of [...data]) {
      if (!others.has(quad.subject.value) && !others.has(quad.object.value)) continue;
      data.removeQuad(quad);
      data.addQuad(
        others.has(quad.subject.value) ? canonical : quad.subject,
        quad.predicate,
        others.has(quad.object.value) && quad.object.termType === "NamedNode"
          ? canonical
          : quad.object,
        quad.graph,
      );
    }
  }

  const validator = new SHACLValidator(shapes);
  const report = await validator.validate(data);

  const findings: ShaclFinding[] = report.results.map((r: any) => {
    const message = (r.message?.[0]?.value ?? "").toString();
    const nrMatch = /^EC data point (\d+)/.exec(message);
    return {
      severity: (r.severity?.value ?? `${SH}Violation`).replace(SH, "") as ShaclFinding["severity"],
      message,
      focusNode: r.focusNode?.value ?? "",
      sourceShape: r.sourceShape?.value ?? "",
      ...(nrMatch ? { dataPoint: Number(nrMatch[1]) } : {}),
    };
  });
  findings.sort(
    (a, b) =>
      ["Violation", "Warning", "Info"].indexOf(a.severity) -
        ["Violation", "Warning", "Info"].indexOf(b.severity) ||
      (a.dataPoint ?? 999) - (b.dataPoint ?? 999),
  );

  return {
    conforms: findings.every((f) => f.severity !== "Violation"),
    category,
    shapesActivated: activated,
    findings,
  };
}
