/**
 * Rewrite a shapes graph so it needs no RDFS reasoner.
 *
 * The module ontologies specialise core properties with rdfs:subPropertyOf
 * (euelec:weeeRegistrationNumber -> oec:eprRegistrationNumber,
 * eubat:hasOperatorInformation -> oec:hasOperatorInformation, ...), and the core
 * shapes state the obligation on the SUPERproperty. That only works if something
 * applies the entailment.
 *
 * Nothing in the delivery chain does. Measured against isaitb/shacl-validator
 * (the European Commission's RDF validator, Apache Jena underneath, the engine
 * the Interoperability Test Bed runs): a shapes graph carrying the
 * rdfs:subPropertyOf axiom and an instance stating only the subproperty comes
 * back `sh:conforms false` with a MinCount violation. Merging the shape graph
 * into the input graph — which the validator does by default — brings the AXIOM
 * along but does not APPLY it, and DomainConfig exposes no inference or reasoner
 * setting. rdf-validate-shacl, used by the offline gate, does no inference either.
 *
 * So the published bundle must not depend on entailment. This module expresses
 * the same obligations in plain SHACL Core, which both engines evaluate
 * identically:
 *
 *   sh:path P                 ->  sh:path [ sh:alternativePath ( P S1 ... Sn ) ]
 *   sh:targetSubjectsOf P     ->  ... plus one value per subproperty
 *   sh:targetObjectsOf P      ->  ... plus one value per subproperty
 *
 * Paths are rewritten because the obligation must be satisfiable by a
 * specialisation; targets are extended because otherwise a shape aimed at the
 * generic property never reaches a node linked by the specialised one. Both
 * derive from the same closure as scripts/lib/shacl-run.ts's runtime
 * materialisation, so the offline gate and the shipped bundle answer the same
 * question by two mechanisms — and scripts/check-shapes-itb.ts exists to prove
 * they keep agreeing.
 *
 * `sh:alternativePath` was verified against the same container: the rewritten
 * form returns `sh:conforms true` for the instance the axiom-only form rejected.
 */
import { Store, DataFactory } from "n3";
import { RDFS_SUBPROPERTYOF, SH, namedNode } from "./shacl-run.ts";

const { blankNode, quad } = DataFactory;

const RDF_FIRST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#first";
const RDF_REST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest";
const RDF_NIL = "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil";

/** superproperty IRI -> every subproperty IRI below it (transitively). */
export function subPropertyClosure(ontology: Store): Map<string, Set<string>> {
  const parents = new Map<string, string[]>();
  for (const q of ontology.match(null, namedNode(RDFS_SUBPROPERTYOF), null, null)) {
    if (q.subject.termType !== "NamedNode" || q.object.termType !== "NamedNode") continue;
    parents.set(q.subject.value, [...(parents.get(q.subject.value) ?? []), q.object.value]);
  }

  const below = new Map<string, Set<string>>();
  const add = (sup: string, sub: string) => {
    const set = below.get(sup) ?? new Set<string>();
    set.add(sub);
    below.set(sup, set);
  };
  // Walk each subproperty upward, guarding against cycles.
  for (const sub of parents.keys()) {
    const seen = new Set<string>([sub]);
    const queue = [...(parents.get(sub) ?? [])];
    while (queue.length) {
      const sup = queue.shift()!;
      if (seen.has(sup)) continue;
      seen.add(sup);
      add(sup, sub);
      queue.push(...(parents.get(sup) ?? []));
    }
  }
  return below;
}

/** Write an RDF list of the given terms into the store; return its head node. */
function writeList(store: Store, items: string[]): ReturnType<typeof blankNode> {
  const head = blankNode();
  let node = head;
  items.forEach((iri, i) => {
    store.addQuad(quad(node, namedNode(RDF_FIRST), namedNode(iri)));
    if (i === items.length - 1) {
      store.addQuad(quad(node, namedNode(RDF_REST), namedNode(RDF_NIL)));
    } else {
      const next = blankNode();
      store.addQuad(quad(node, namedNode(RDF_REST), next));
      node = next;
    }
  });
  return head;
}

export interface ExpansionStats {
  pathsRewritten: number;
  targetsAdded: number;
}

/**
 * Expand `shapes` in place using the subproperty closure of `ontology`.
 *
 * Only IRI-valued `sh:path` objects are rewritten; an existing path expression
 * (a blank node holding sh:alternativePath, a sequence, sh:inversePath, ...) is
 * left alone, because nesting an alternation inside an authored path expression
 * would change its meaning rather than widen it.
 */
export function expandSubProperties(shapes: Store, ontology: Store): ExpansionStats {
  const closure = subPropertyClosure(ontology);
  if (!closure.size) return { pathsRewritten: 0, targetsAdded: 0 };

  let pathsRewritten = 0;
  for (const q of [...shapes.match(null, namedNode(`${SH}path`), null, null)]) {
    if (q.object.termType !== "NamedNode") continue;
    const subs = closure.get(q.object.value);
    if (!subs?.size) continue;
    // Deterministic order: the superproperty first, then subproperties sorted,
    // so the generated bundle is byte-stable across runs and machines.
    const alternatives = [q.object.value, ...[...subs].sort()];
    const list = writeList(shapes, alternatives);
    const pathNode = blankNode();
    shapes.addQuad(quad(pathNode, namedNode(`${SH}alternativePath`), list));
    shapes.removeQuad(q);
    shapes.addQuad(quad(q.subject, namedNode(`${SH}path`), pathNode, q.graph));
    pathsRewritten++;
  }

  let targetsAdded = 0;
  for (const pred of [`${SH}targetSubjectsOf`, `${SH}targetObjectsOf`]) {
    for (const q of [...shapes.match(null, namedNode(pred), null, null)]) {
      if (q.object.termType !== "NamedNode") continue;
      for (const sub of [...(closure.get(q.object.value) ?? [])].sort()) {
        const extra = quad(q.subject, namedNode(pred), namedNode(sub), q.graph);
        if (shapes.has(extra)) continue;
        shapes.addQuad(extra);
        targetsAdded++;
      }
    }
  }

  return { pathsRewritten, targetsAdded };
}
