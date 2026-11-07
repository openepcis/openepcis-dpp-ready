#!/usr/bin/env python3
"""Build the EU DPP Registry gold sets from the curation on dpp-ready main.

Positives: every skos:{exact,close,broad,narrow}Match from one of our ontology terms to an EU
DPP Registry data element (core-, common- or battery-vocabulary).
Negatives (NONE): every pair the 2026-11-02 audits proposed (battery, core, reverse) that the
curation did not write. Each pair carries its evidence:
  written      mapping in the TTL, curated by hand (2026-11-02 curation and later edits)
  explicit     declined in the "Declined, and why" table of the curation notes, or corrected later
  adjudicated  decided in the model-assisted adjudication of 2026-11-06 (adjudication-2026-11-06.json),
               written or declined; graded by the same models a benchmark scores, so kept apart
  slot         target is a serialisation slot of the flat JSON (url, value, unit, ...)
  implicit     proposed, not written, not yet decided

Writes three files beside the other gold sets:
  docs/skos-alignment/bench/eu-dpp-goldset.json       written + explicit: the gold set to choose a grader by
  docs/skos-alignment/bench/eu-dpp-adjudicated.json   adjudicated: a consistency check, not independent truth
  docs/skos-alignment/bench/eu-dpp-adjudication.json  implicit: still to be decided
Slot pairs are left out: PairJudge drops them before any model sees them. Every pair gets a stable
dev/test split from a hash of its id, so adding pairs never moves an existing one.

Needs the gitignored audit reports skos-completeness-{battery,core,reverse}-eu-dpp-2026-11-02.json
in docs/skos-alignment/ and rdflib (pip install rdflib).

Usage (from the repo root): tools/vocab-sync/tools/build-eu-goldset.py
"""
import glob, hashlib, json, os, sys
from collections import Counter, defaultdict

try:
    from rdflib import Graph, Namespace, RDF, RDFS, OWL, URIRef
except ImportError:
    sys.exit("build-eu-goldset: needs rdflib (pip install rdflib)")

SKOS = Namespace("http://www.w3.org/2004/02/skos/core#")
EU = "https://repository.product-passport.ec.europa.eu/"
EU_DATA = (EU + "core/vocabs/core-vocabulary#", EU + "core/vocabs/common-vocabulary#",
           EU + "product/batteries/vocabs/battery-vocabulary#")
PRED_TO_REL = {SKOS.exactMatch: "EXACT", SKOS.closeMatch: "CLOSE",
               SKOS.broadMatch: "NARROW", SKOS.narrowMatch: "BROAD"}
SLOTS = {"url", "value", "unit", "language", "valueRange", "bin", "lowerBound", "upperBound",
         "recordedTime", "resourceTitle", "contentType", "title"}
EXPLICIT = {  # (our local name, EU local name) from the "Declined, and why" table
    ("carbonFootprintDeclarationId", "otherIdentificationElement"),
    ("numberOfDeepDischargeEvents", "numberOfDischargingCycles"),
    ("transportationSafetyClass", "safetyMeasures"),
    ("cadmiumSymbolRequired", "chemicalSymbol"), ("leadSymbolRequired", "chemicalSymbol"),
    ("hasMaterialComposition", "criticalRawMaterials"),
    ("hasInitialCapacity", "batteryCapacity"),
    # corrected 2026-11-06: our terms carry the current value, not the original one
    ("hasPowerCapabilityAt80SoC", "originalPowerCapability"),
    ("hasPowerCapabilityAt20SoC", "originalPowerCapability"),
}
CONTAINERS = {"hasTechnicalSpecifications", "hasEndOfLifeInfo"}


def local(iri):
    return iri.rsplit("#", 1)[-1].rsplit("/", 1)[-1]


def en(g, s, *preds):
    for p in preds:
        vals = [o for o in g.objects(s, p)]
        for o in vals:
            if getattr(o, "language", None) in ("en", None):
                return str(o)
    return None


def main(root):
    bench = os.path.join(root, "docs/skos-alignment/bench")
    ours = Graph()
    for f in glob.glob(os.path.join(root, "extensions/**/ontology/*.ttl"), recursive=True):
        if "/upstream/" in f or f.endswith("-access-levels.ttl"):
            continue
        ours.parse(f, format="turtle")
    eu = Graph().parse(os.path.join(root, "extensions/upstream/eu-dpp/ontology/eu-dpp.ttl"),
                       format="turtle")
    nm = ours.namespace_manager

    def qn(iri):
        try:
            return nm.normalizeUri(URIRef(iri))
        except Exception:
            return str(iri)

    def our_term(iri):
        s = URIRef(iri)
        types = set(ours.objects(s, RDF.type))
        if not types:
            return None
        kind = "class" if (OWL.Class in types or RDFS.Class in types) else "property"
        dom = ", ".join(sorted(qn(o) for o in ours.objects(s, RDFS.domain))) or None
        rng = ", ".join(sorted(qn(o) for o in ours.objects(s, RDFS.range))) or None
        return {"sourceIri": iri, "sourceId": qn(iri), "sourceType": kind,
                "sourceLabel": en(ours, s, RDFS.label, SKOS.prefLabel) or local(iri),
                "sourceDef": en(ours, s, RDFS.comment, SKOS.definition),
                "sourceDomain": dom, "sourceRange": rng}

    def element_context(s, d):
        # Same text as UpstreamIndex.elementContext: the parent group, and whether the registry
        # copied the provision's legal text onto this element and its siblings.
        parent = next(iter(eu.objects(s, SKOS.broader)), None)
        if not isinstance(parent, URIRef):
            return None
        out = "Part of: " + (en(eu, parent, RDFS.label, SKOS.prefLabel) or local(str(parent))) + "."
        if d:
            n = sum(1 for sib in eu.subjects(SKOS.broader, parent)
                    if sib != s and en(eu, sib, SKOS.definition) == d)
            if n:
                out += (" The definition above is the legal text of the whole provision, shared with "
                        f"{n} sibling element{'' if n == 1 else 's'}; this element is only the part its label names.")
        return out

    def eu_term(iri):
        s = URIRef(iri)
        if (s, RDF.type, SKOS.Concept) not in eu:
            return None
        d = en(eu, s, SKOS.definition)
        note = en(eu, s, SKOS.scopeNote)
        return {"targetIri": iri, "targetLabel": en(eu, s, SKOS.prefLabel) or local(iri),
                "targetDef": d, "targetScopeNote": note, "targetContext": element_context(s, d),
                "targetScheme": next((str(o) for o in eu.objects(s, SKOS.inScheme)), None)}

    adj_path = os.path.join(bench, "adjudication-2026-11-06.json")
    adjudicated = {(d["srcIri"], d["tgtIri"]): d["final"] for d in json.load(open(adj_path))} \
        if os.path.exists(adj_path) else {}

    examples, seen = [], set()
    for p, rel in PRED_TO_REL.items():
        for s, o in ours.subject_objects(p):
            if not str(o).startswith(EU_DATA):
                continue
            a, b = our_term(str(s)), eu_term(str(o))
            if not a or not b:
                continue
            key = (str(s), str(o))
            if key in seen:
                continue
            seen.add(key)
            examples.append({"id": f"{a['sourceId']}~{local(str(o))}~{rel}", "gold": rel,
                             "evidence": "adjudicated" if key in adjudicated else "written", **a, **b})

    pos = len(examples)
    for name in ("battery", "core", "reverse"):
        rep = json.load(open(os.path.join(root, "docs/skos-alignment",
                                          f"skos-completeness-{name}-eu-dpp-2026-11-02.json")))
        for f in rep["findings"]:
            key = (f["ourIri"], f["upstreamIri"])
            if key in seen or not f["upstreamIri"].startswith(EU_DATA):
                continue
            a, b = our_term(f["ourIri"]), eu_term(f["upstreamIri"])
            if not a or not b:  # our term was removed since (duplicates), or not a data element
                continue
            seen.add(key)
            ol, ul = local(f["ourIri"]), local(f["upstreamIri"])
            if ul in SLOTS:
                why = "slot"
            elif adjudicated.get(key) == "NONE":
                why = "adjudicated"
            elif (ol, ul) in EXPLICIT or ol in CONTAINERS:
                why = "explicit"
            else:
                why = "implicit"
            examples.append({"id": f"{a['sourceId']}~{ul}~NONE", "gold": "NONE", "evidence": why,
                             "auditRelation": f["relation"], "auditQaTier": f.get("qaTier"),
                             "auditRun": name, **a, **b})

    for e in examples:
        e["split"] = "dev" if hashlib.sha1(e["id"].encode()).digest()[0] % 2 == 0 else "test"
    files = {"eu-dpp-goldset.json": ("written", "explicit"),
             "eu-dpp-adjudicated.json": ("adjudicated",),
             "eu-dpp-adjudication.json": ("implicit",)}
    for name, tiers in files.items():
        rows = [e for e in examples if e["evidence"] in tiers]
        with open(os.path.join(bench, name), "w") as f:
            json.dump(rows, f, indent=1, ensure_ascii=False)
            f.write("\n")
        print(f"{name}: {len(rows)} pairs {dict(Counter(e['gold'] for e in rows))}")
    print(f"{sum(e['evidence'] == 'slot' for e in examples)} slot pairs left out")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
