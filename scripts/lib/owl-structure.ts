/**
 * Structure check of RDF data against the OWL/RDFS axioms of a target ontology, read the way a
 * consumer of that ontology validates instance data (closed world, as SHACL derived from OWL does):
 *
 *   rdfs:domain        the subject has a class within the domain
 *   rdfs:range         a class: the object is a node with a class within the range
 *                      a datatype: the object is a literal of that datatype (or one derived from it)
 *   owl:allValuesFrom  every value of the property on an instance of the class is within the filler
 *   owl:someValuesFrom at least one such value
 *   owl:hasValue       the value is present
 *   owl:(min|max|)(Qualified)Cardinality  the number of (qualifying) values
 *
 * Classes are rdfs:subClassOf / owl:equivalentClass closed, owl:unionOf members count. A node's
 * classes are its rdf:type in the data plus, for IRIs the ontology describes (code individuals),
 * its rdf:type there. An object IRI whose class neither the data nor the ontology states (an
 * external IRI such as a unit or a country) is not checked against a class range.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Quad, Term } from "n3";
import { Parser } from "n3";

const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const OWL = "http://www.w3.org/2002/07/owl#";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const TYPE = `${RDF}type`;

/** Datatypes a literal of the key datatype also belongs to (XSD derivation, closed over). */
const DERIVED: Record<string, string[]> = {
  [`${XSD}integer`]: [`${XSD}decimal`],
  [`${XSD}nonNegativeInteger`]: [`${XSD}integer`, `${XSD}decimal`],
  [`${XSD}positiveInteger`]: [`${XSD}nonNegativeInteger`, `${XSD}integer`, `${XSD}decimal`],
  [`${XSD}int`]: [`${XSD}long`, `${XSD}integer`, `${XSD}decimal`],
  [`${XSD}long`]: [`${XSD}integer`, `${XSD}decimal`],
  [`${XSD}dateTimeStamp`]: [`${XSD}dateTime`],
  [`${XSD}token`]: [`${XSD}normalizedString`, `${XSD}string`],
  [`${XSD}normalizedString`]: [`${XSD}string`],
};
const ANY_LITERAL = new Set([`${RDFS}Literal`, `${RDFS}Datatype`]);

type Filler = { kind: "class"; iris: Set<string> } | { kind: "datatype"; iri: string } | { kind: "unknown" };

interface Restriction {
  property: string;
  kind: "all" | "some" | "value" | "min" | "max" | "exact";
  filler?: Filler;
  value?: string;
  n?: number;
}

export interface OntologyIndex {
  /** class → itself and every superclass */
  supers: Map<string, Set<string>>;
  domain: Map<string, Filler>;
  range: Map<string, Filler>;
  restrictions: Map<string, Restriction[]>;
  /** rdf:type statements of individuals the ontology declares */
  individualTypes: Map<string, Set<string>>;
  datatypes: Set<string>;
}

function key(t: Term): string {
  return t.termType === "BlankNode" ? `_:${t.value}` : t.value;
}

export function indexOntology(files: string[], root: string): OntologyIndex {
  const out = new Map<string, Quad[]>();
  const add = (q: Quad) => {
    const k = key(q.subject);
    if (!out.has(k)) out.set(k, []);
    out.get(k)!.push(q);
  };
  // One blank-node namespace per file: labels of different files must not meet.
  files.forEach((f, i) => {
    for (const q of new Parser({ blankNodePrefix: `f${i}_` }).parse(readFileSync(join(root, f), "utf8"))) add(q);
  });
  const objs = (s: string, p: string) => (out.get(s) ?? []).filter((q) => q.predicate.value === p).map((q) => q.object);
  const one = (s: string, p: string) => objs(s, p)[0];

  const list = (head: Term | undefined): Term[] => {
    const items: Term[] = [];
    let cur = head;
    while (cur && cur.value !== `${RDF}nil`) {
      const first = one(key(cur), `${RDF}first`);
      if (first) items.push(first);
      cur = one(key(cur), `${RDF}rest`);
    }
    return items;
  };

  const datatypes = new Set<string>();
  for (const [s, qs] of out) {
    if (qs.some((q) => q.predicate.value === TYPE && q.object.value === `${RDFS}Datatype`) && !s.startsWith("_:")) datatypes.add(s);
  }
  const isDatatype = (iri: string) => iri.startsWith(XSD) || datatypes.has(iri) || iri === `${RDF}langString` || ANY_LITERAL.has(iri);

  const filler = (t: Term | undefined): Filler => {
    if (!t) return { kind: "unknown" };
    if (t.termType === "NamedNode") return isDatatype(t.value) ? { kind: "datatype", iri: t.value } : { kind: "class", iris: new Set([t.value]) };
    const members = list(one(key(t), `${OWL}unionOf`));
    if (members.length && members.every((m) => m.termType === "NamedNode" && !isDatatype(m.value))) {
      return { kind: "class", iris: new Set(members.map((m) => m.value)) };
    }
    return { kind: "unknown" };
  };

  // Class hierarchy: subClassOf / equivalentClass between named classes, closed.
  const direct = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!direct.has(a)) direct.set(a, new Set());
    direct.get(a)!.add(b);
  };
  const restrictions = new Map<string, Restriction[]>();
  for (const [s, qs] of out) {
    if (s.startsWith("_:")) continue;
    for (const q of qs) {
      if (q.predicate.value !== `${RDFS}subClassOf` && q.predicate.value !== `${OWL}equivalentClass`) continue;
      if (q.object.termType === "NamedNode") {
        link(s, q.object.value);
        if (q.predicate.value === `${OWL}equivalentClass`) link(q.object.value, s);
        continue;
      }
      const r = key(q.object);
      const prop = one(r, `${OWL}onProperty`)?.value;
      if (!prop) continue;
      const qualified = filler(one(r, `${OWL}onClass`) ?? one(r, `${OWL}onDataRange`));
      const add = (x: Restriction) => {
        if (!restrictions.has(s)) restrictions.set(s, []);
        restrictions.get(s)!.push(x);
      };
      const num = (p: string) => Number(one(r, p)?.value);
      if (one(r, `${OWL}allValuesFrom`)) add({ property: prop, kind: "all", filler: filler(one(r, `${OWL}allValuesFrom`)) });
      if (one(r, `${OWL}someValuesFrom`)) add({ property: prop, kind: "some", filler: filler(one(r, `${OWL}someValuesFrom`)) });
      if (one(r, `${OWL}hasValue`)) add({ property: prop, kind: "value", value: one(r, `${OWL}hasValue`)!.value });
      for (const [p, kind] of [["cardinality", "exact"], ["qualifiedCardinality", "exact"], ["minCardinality", "min"],
        ["minQualifiedCardinality", "min"], ["maxCardinality", "max"], ["maxQualifiedCardinality", "max"]] as const) {
        if (one(r, `${OWL}${p}`)) add({ property: prop, kind, n: num(`${OWL}${p}`), filler: p.includes("Qualified") ? qualified : undefined });
      }
    }
  }
  const supers = new Map<string, Set<string>>();
  const closure = (c: string): Set<string> => {
    if (supers.has(c)) return supers.get(c)!;
    const set = new Set([c]);
    supers.set(c, set);
    for (const d of direct.get(c) ?? []) for (const x of closure(d)) set.add(x);
    return set;
  };
  for (const c of direct.keys()) closure(c);

  const domain = new Map<string, Filler>();
  const range = new Map<string, Filler>();
  const individualTypes = new Map<string, Set<string>>();
  for (const [s, qs] of out) {
    if (s.startsWith("_:")) continue;
    const d = qs.find((q) => q.predicate.value === `${RDFS}domain`);
    const r = qs.find((q) => q.predicate.value === `${RDFS}range`);
    if (d) domain.set(s, filler(d.object));
    if (r) range.set(s, filler(r.object));
    const types = qs.filter((q) => q.predicate.value === TYPE && q.object.termType === "NamedNode" && !q.object.value.startsWith(OWL) && !q.object.value.startsWith(RDFS))
      .map((q) => q.object.value);
    if (types.length) individualTypes.set(s, new Set(types));
  }
  return { supers, domain, range, restrictions, individualTypes, datatypes };
}

/** Findings in the data, one line each, sorted: "<rule> <subject class> <property>: <detail>". */
export function structureFindings(ix: OntologyIndex, data: Quad[], shorten: (iri: string) => string = (x) => x): string[] {
  const bySubject = new Map<string, Quad[]>();
  for (const q of data) {
    const k = key(q.subject);
    if (!bySubject.has(k)) bySubject.set(k, []);
    bySubject.get(k)!.push(q);
  }
  const typesOf = (t: Term): Set<string> | undefined => {
    const own = (bySubject.get(key(t)) ?? []).filter((q) => q.predicate.value === TYPE).map((q) => q.object.value);
    const known = t.termType === "NamedNode" ? ix.individualTypes.get(t.value) : undefined;
    if (!own.length && !known) return undefined;
    const all = new Set<string>();
    for (const c of [...own, ...(known ?? [])]) for (const x of ix.supers.get(c) ?? [c]) all.add(x);
    return all;
  };
  const inClass = (types: Set<string> | undefined, f: Filler): boolean | undefined =>
    f.kind !== "class" ? undefined : types ? [...f.iris].some((c) => types.has(c)) : undefined;
  const fits = (o: Term, f: Filler): boolean | undefined => {
    if (f.kind === "unknown") return undefined;
    if (f.kind === "datatype") {
      if (o.termType !== "Literal") return false;
      if (ANY_LITERAL.has(f.iri)) return true;
      const dt = o.datatype.value;
      return dt === f.iri || (DERIVED[dt] ?? []).includes(f.iri);
    }
    if (o.termType === "Literal") return false;
    return inClass(typesOf(o), f);
  };
  const describe = (o: Term) => (o.termType === "Literal" ? `"${o.value}"^^${shorten(o.datatype.value)}` : o.termType === "BlankNode" ? "a blank node" : shorten(o.value));
  const show = (f: Filler | undefined) => (!f || f.kind === "unknown" ? "?" : f.kind === "datatype" ? shorten(f.iri) : [...f.iris].map(shorten).join("|"));
  const label = (types: Set<string> | undefined, s: Term) => {
    const named = [...(bySubject.get(key(s)) ?? [])].filter((q) => q.predicate.value === TYPE).map((q) => shorten(q.object.value)).sort();
    return named.length ? named.join("+") : types ? "?" : "(untyped)";
  };

  const findings = new Set<string>();
  for (const [, qs] of bySubject) {
    const s = qs[0].subject;
    const types = typesOf(s);
    const who = label(types, s);
    for (const q of qs) {
      const p = q.predicate.value;
      if (p === TYPE) continue;
      const d = ix.domain.get(p);
      if (d && d.kind === "class" && inClass(types, d) !== true) findings.add(`domain ${who} ${shorten(p)}: subject is not a ${show(d)}`);
      const r = ix.range.get(p);
      if (r && fits(q.object, r) === false) findings.add(`range ${who} ${shorten(p)}: ${describe(q.object)} is not a ${show(r)}`);
    }
    for (const c of types ?? []) {
      for (const r of ix.restrictions.get(c) ?? []) {
        const values = qs.filter((q) => q.predicate.value === r.property).map((q) => q.object);
        const where = `${shorten(c)} ${shorten(r.property)}`;
        if (r.kind === "all") {
          for (const v of values) if (fits(v, r.filler!) === false) findings.add(`allValuesFrom ${where}: ${describe(v)} is not a ${show(r.filler)}`);
        } else if (r.kind === "some") {
          if (!values.some((v) => fits(v, r.filler!) !== false)) findings.add(`someValuesFrom ${where}: no value that is a ${show(r.filler)}`);
        } else if (r.kind === "value") {
          if (!values.some((v) => v.value === r.value)) findings.add(`hasValue ${where}: ${shorten(r.value!)} missing`);
        } else {
          const counted = r.filler ? values.filter((v) => fits(v, r.filler!) !== false).length : values.length;
          const bad = r.kind === "exact" ? counted !== r.n : r.kind === "min" ? counted < r.n! : counted > r.n!;
          if (bad) findings.add(`cardinality ${where}: ${counted} value(s), ${r.kind === "exact" ? "exactly" : r.kind === "min" ? "at least" : "at most"} ${r.n}${r.filler ? ` ${show(r.filler)}` : ""} required`);
        }
      }
    }
  }
  return [...findings].sort();
}
