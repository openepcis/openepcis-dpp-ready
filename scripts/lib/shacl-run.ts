/**
 * Generic SHACL execution core — environment-neutral (browser demo AND Node).
 *
 * Everything the project's SHACL gates share: parse a shapes graph, expand
 * JSON-LD documents to RDF, run rdf-validate-shacl, and map the
 * sh:ValidationReport onto a flat finding list. Callers add their own specifics
 * (scripts/lib/ec-readiness-shacl-core.ts folds the Digital Link hierarchy and
 * maps findings back to EC data points; scripts/check-shapes.ts loads the module
 * ontologies as background knowledge).
 *
 * IO lives with the caller so this stays usable from the esbuild browser
 * bundles, which have no filesystem.
 *
 * ENGINE CAVEAT — rdf-validate-shacl does not implement SHACL-SPARQL. It does not
 * ignore sh:sparql either: it THROWS "Cannot find validator for constraint
 * component sh:SPARQLConstraintComponent" as soon as such a shape reaches a
 * matching node. Callers must therefore remove those constraints explicitly (see
 * stripSparqlConstraints) and account for what they gave up. That is why this
 * module is the *build* gate — offline, deterministic, no container — while
 * scripts/check-shapes-itb.ts is the *parity* gate: it drives the same shapes
 * through the European Commission's isaitb/shacl-validator, whose Apache Jena
 * engine does evaluate sh:sparql and is what the Interoperability Test Bed runs.
 * Neither gate replaces the other.
 */
import { Parser, Store, DataFactory } from "n3";
import jsonld from "jsonld";
// rdf-validate-shacl ships no usable types in this setup; it brings its own
// RDF/JS environment and accepts any quad iterable (n3 Store included).
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SHACLValidator from "rdf-validate-shacl";
import type { JsonLdDocumentLoader } from "./jsonld-loader.ts";

export const { namedNode } = DataFactory;

export const SH = "http://www.w3.org/ns/shacl#";
export const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

export type Severity = "Violation" | "Warning" | "Info";

export interface Finding {
  severity: Severity;
  message: string;
  focusNode: string;
  sourceShape: string;
  /** Local name of sh:sourceConstraintComponent, e.g. "DatatypeConstraintComponent".
   *  The single most useful field for triage: it names WHICH constraint failed,
   *  which a shared sh:message on a multi-constraint property shape cannot. */
  component?: string;
  /** sh:resultPath, when the constraint reported one. */
  path?: string;
  /** The offending value, when the constraint reported one. */
  value?: string;
}

export interface Report {
  conforms: boolean;
  findings: Finding[];
}

const SEVERITY_ORDER: Severity[] = ["Violation", "Warning", "Info"];

export const OWL_IMPORTS = "http://www.w3.org/2002/07/owl#imports";

/** Parse one or more Turtle documents into a single store. */
export function parseTurtle(...documents: string[]): Store {
  const store = new Store();
  const parser = new Parser();
  for (const doc of documents) store.addQuads(parser.parse(doc));
  return store;
}

/**
 * Remove owl:imports triples from a graph.
 *
 * The module ontologies import gs1:, the SEMICeu namespaces and each other.
 * rdf-validate-shacl refuses to run a shapes graph that declares owl:imports
 * unless it is handed an importGraph to resolve them from, and resolving them
 * would mean dereferencing remote vocabularies at gate time — the one thing the
 * offline gates must not do. Callers supply the background knowledge they want
 * explicitly instead, so the import declarations are noise by the time the graph
 * is assembled. Mirrors `validator.loadImports = false` in the GITB validator
 * configuration, keeping the two engines on the same closed world.
 *
 * Returns the number of triples removed.
 */
export function stripOwlImports(store: Store): number {
  const imports = [...store.match(null, namedNode(OWL_IMPORTS), null, null)];
  for (const quad of imports) store.removeQuad(quad);
  return imports.length;
}

/**
 * Drop the `sh:deactivated true` triples of the shapes whose IRI ends in the
 * given suffix, activating exactly that subset.
 *
 * The generated EC readiness shapes ship every shape deactivated because the 71
 * guidance data points carry a different obligation per battery category; the
 * runner activates one category. The same mechanism serves
 * scripts/build-gitb-resources.ts, which cannot flip anything at runtime and so
 * emits one pre-activated shapes file per category — hence this lives here
 * rather than in either caller.
 *
 * Returns the number of shapes activated.
 */
export function activateBySuffix(shapes: Store, suffix: string): number {
  const deactivated = [...shapes.match(null, namedNode(`${SH}deactivated`), null, null)];
  let activated = 0;
  for (const quad of deactivated) {
    if (quad.subject.value.endsWith(suffix)) {
      shapes.removeQuad(quad);
      activated++;
    }
  }
  return activated;
}

/**
 * Remove sh:sparql constraints from a shapes graph, returning how many went.
 *
 * rdf-validate-shacl has no SHACL-SPARQL implementation and throws the moment one
 * of these shapes reaches a matching node, so the in-process gate cannot simply
 * carry them. Removing them is honest only if the caller says so — the count is
 * returned precisely so the gate can report what it did not check, and
 * scripts/check-shapes-itb.ts is where those constraints are actually evaluated.
 */
export function stripSparqlConstraints(shapes: Store): number {
  const constraints = [...shapes.match(null, namedNode(`${SH}sparql`), null, null)];
  for (const quad of constraints) {
    // Drop the link and the constraint node's own triples, so no orphan
    // sh:SPARQLConstraint is left for the engine to trip over.
    shapes.removeQuad(quad);
    for (const inner of [...shapes.match(quad.object, null, null, null)]) {
      shapes.removeQuad(inner);
    }
  }
  return constraints.length;
}

export const RDFS_SUBPROPERTYOF = "http://www.w3.org/2000/01/rdf-schema#subPropertyOf";

/**
 * Materialise rdfs:subPropertyOf entailment in a data graph: for every triple
 * `s p o` where `p rdfs:subPropertyOf* q`, add `s q o`.
 *
 * Why this has to happen explicitly. The module ontologies specialise core
 * properties — euelec:weeeRegistrationNumber is a rdfs:subPropertyOf
 * oec:eprRegistrationNumber, eudet:biodegradationPercentage of
 * oec:biodegradationPercentage — so a WEEE compliance node genuinely DOES declare
 * an EPR registration number, just under its specialised name. The core shapes
 * target the superclass and ask for the core property, and that obligation is
 * satisfied only under RDFS entailment.
 *
 * Apache Jena (and therefore the ITB validator) can be configured to do this;
 * rdf-validate-shacl performs no inference at all. Materialising it here keeps
 * the offline gate and the Test Bed on the same answer instead of letting the
 * two engines disagree about what is conformant — the one thing a conformance
 * artifact must never do.
 *
 * Transitive closure over the property hierarchy, computed from `ontology`
 * (which carries the subPropertyOf axioms) and applied to `data`. Returns the
 * number of triples added.
 */
export function materialiseSubProperties(data: Store, ontology: Store): number {
  // predicate -> direct superproperties
  const direct = new Map<string, string[]>();
  for (const q of ontology.match(null, namedNode(RDFS_SUBPROPERTYOF), null, null)) {
    if (q.subject.termType !== "NamedNode" || q.object.termType !== "NamedNode") continue;
    const list = direct.get(q.subject.value) ?? [];
    list.push(q.object.value);
    direct.set(q.subject.value, list);
  }
  if (!direct.size) return 0;

  // Transitive closure, guarding against cycles in a hand-authored hierarchy.
  const closure = new Map<string, Set<string>>();
  const resolve = (p: string, seen: Set<string>): Set<string> => {
    const cached = closure.get(p);
    if (cached) return cached;
    const out = new Set<string>();
    for (const sup of direct.get(p) ?? []) {
      if (seen.has(sup)) continue;
      out.add(sup);
      for (const t of resolve(sup, new Set([...seen, sup]))) out.add(t);
    }
    closure.set(p, out);
    return out;
  };
  for (const p of direct.keys()) resolve(p, new Set([p]));

  let added = 0;
  for (const quad of [...data]) {
    for (const sup of closure.get(quad.predicate.value) ?? []) {
      if (data.has(DataFactory.quad(quad.subject, namedNode(sup), quad.object, quad.graph))) continue;
      data.addQuad(quad.subject, namedNode(sup), quad.object, quad.graph);
      added++;
    }
  }
  return added;
}

/** Expand JSON-LD documents and merge them into one data graph. */
export async function toDataGraph(
  documents: unknown[],
  documentLoader: JsonLdDocumentLoader,
): Promise<Store> {
  const data = new Store();
  const parser = new Parser({ format: "N-Quads" });
  for (const doc of documents) {
    const nquads = (await jsonld.toRDF(doc as object, {
      format: "application/n-quads",
      documentLoader: documentLoader as never,
    })) as unknown as string;
    data.addQuads(parser.parse(nquads));
  }
  return data;
}

/**
 * Run the shapes over the data and return the findings, worst severity first.
 *
 * `conforms` here is NOT sh:ValidationReport/sh:conforms, which is false as soon
 * as any result exists. It means "no sh:Violation": Warning and Info are graded
 * advice the generated EC readiness shapes rely on (conditional and optional
 * data points), and a gate that failed on them could never go green.
 */
export async function validate(shapes: Store, data: Store): Promise<Report> {
  const report = await new SHACLValidator(shapes).validate(data);

  const findings: Finding[] = report.results.map((r: any) => ({
    severity: (r.severity?.value ?? `${SH}Violation`).replace(SH, "") as Severity,
    message: (r.message?.[0]?.value ?? "").toString(),
    focusNode: r.focusNode?.value ?? "",
    sourceShape: r.sourceShape?.value ?? "",
    ...(r.sourceConstraintComponent?.value
      ? { component: r.sourceConstraintComponent.value.replace(SH, "") }
      : {}),
    ...(r.path?.value ? { path: r.path.value } : {}),
    ...(r.value?.value ? { value: r.value.value } : {}),
  }));

  findings.sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) ||
      a.sourceShape.localeCompare(b.sourceShape),
  );

  return { conforms: findings.every((f) => f.severity !== "Violation"), findings };
}
