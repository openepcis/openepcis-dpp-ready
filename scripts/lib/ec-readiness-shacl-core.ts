/**
 * SHACL execution core of the EC Battery Passport readiness check —
 * environment-neutral (browser demo AND Node CLI).
 *
 * Runs the generated ec-readiness-shapes.ttl over one battery's passport
 * documents. Everything generic — parsing, JSON-LD expansion, category
 * activation, report mapping — lives in scripts/lib/shacl-run.ts; what stays
 * here is the two things that are specific to this check: folding the GS1
 * Digital Link model/batch/item hierarchy into one focus node, and mapping
 * findings back to the EC data-point numbers carried in the sh:message texts.
 *
 * IO lives with the caller: the Node wrapper (ec-readiness-shacl.ts) reads the
 * shapes from the filesystem and uses the repo's offline documentLoader; the
 * browser demo bundles the shapes text and context documents with esbuild.
 */
import {
  RDF_TYPE,
  activateBySuffix,
  namedNode,
  parseTurtle,
  toDataGraph,
  validate,
  type Severity,
} from "./shacl-run.ts";
import type { JsonLdDocumentLoader } from "./jsonld-loader.ts";
import type { Category } from "./ec-readiness.ts";

export type { JsonLdDocumentLoader };

export interface ShaclFinding {
  severity: Severity;
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

const BATTERY = "https://ref.openepcis.io/extensions/eu/battery/Battery";

export async function validateWithShaclCore(
  shapesTtl: string,
  docs: unknown[],
  category: Category,
  documentLoader: JsonLdDocumentLoader,
): Promise<ShaclReport> {
  // Shapes: every shape ships sh:deactivated true; activate the chosen category.
  const shapes = parseTurtle(shapesTtl);
  const shapesActivated = activateBySuffix(shapes, `-${category}`);

  // Data: merge every passport level into one graph (dynamic data points only
  // exist at item level; the guidance is evaluated per battery, not per file).
  const data = await toDataGraph(docs, documentLoader);

  // Fold the GS1 Digital Link hierarchy: the model (01), batch (01+10) and item
  // (01+21) passports of one battery are distinct eubat:Battery nodes in RDF,
  // but per the granularity model a finer passport RESOLVES model/batch data up
  // the hierarchy rather than restating it. Mirror that resolution by rewriting
  // every Battery node to one canonical focus node before validation —
  // otherwise each level would be (wrongly) validated as a complete passport.
  const batteryNodes = [
    ...data.match(null, namedNode(RDF_TYPE), namedNode(BATTERY), null),
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

  const report = await validate(shapes, data);

  const findings: ShaclFinding[] = report.findings.map((f) => {
    const nrMatch = /^EC data point (\d+)/.exec(f.message);
    return {
      severity: f.severity,
      message: f.message,
      focusNode: f.focusNode,
      sourceShape: f.sourceShape,
      ...(nrMatch ? { dataPoint: Number(nrMatch[1]) } : {}),
    };
  });
  // validate() already ordered by severity; refine ties by data point so the
  // report reads in guidance order rather than by shape IRI.
  const order: Severity[] = ["Violation", "Warning", "Info"];
  findings.sort(
    (a, b) =>
      order.indexOf(a.severity) - order.indexOf(b.severity) ||
      (a.dataPoint ?? 999) - (b.dataPoint ?? 999),
  );

  return {
    conforms: report.conforms,
    category,
    shapesActivated,
    findings,
  };
}
