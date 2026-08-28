#!/usr/bin/env python3
"""Build a graded-SKOS gold set from THIS project's curated mappings.

Why a second gold set. The benchmark that picked the grader and the confidence floor uses 200
STW <-> Wikidata pairs: an economics thesaurus against Wikidata. That measures graded-SKOS skill
in the abstract, which is a fair proxy and the reason the numbers transfer at all. It does not
measure what this pipeline actually does, which is align OpenEPCIS product-passport terms against
GS1, schema.org, DPP Keystone and UNTP. A model can be good at "industrial park vs business park"
and poor at "battery state of health vs gs1:productQuality", and the STW set cannot tell us.

Where the labels come from:

  positives  the mappings currently in our TTLs. Every one survived the QA panel and a human
             curator, which is the same standard the STW gold set claims.
  negatives  pairs a curator REMOVED and never restored. These are worth more than synthetic
             negatives, which are usually random pairs the model rejects trivially. A removed
             pair was proposed by the pipeline, looked plausible enough to be written, and was
             then judged wrong by a person. That is exactly the discrimination we need measured.
             Commits like "remove keyword-matched SKOS mappings to semantically foreign GS1
             terms" are a labelled negative set nobody had used.

A pair removed and later re-added under a DIFFERENT relation is not a negative; it is a
grade correction. Those are filtered out by checking the current TTLs, so the negative set means
"no relation", not "some other relation".

Usage:  tools/build-domain-goldset.py [--upstream gs1] [--per-class 40] [--out FILE]
"""
from __future__ import annotations

import argparse
import collections
import json
import re
import subprocess
import sys
from pathlib import Path

SKOS = "http://www.w3.org/2004/02/skos/core#"
RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"
RDFS_COMMENT = "http://www.w3.org/2000/01/rdf-schema#comment"
SKOS_DEF = SKOS + "definition"
RELATIONS = ("exact", "close", "broad", "narrow")

# The SKOS predicate and the grader's label are INVERTED, and taking the predicate name at face
# value is how the first build of this gold set scored 0/32 on one whole class.
#
#   skos:broadMatch   the OBJECT is broader, so OUR term is narrower  -> the grader says NARROW
#   skos:narrowMatch  the OBJECT is narrower, so OUR term is broader  -> the grader says BROAD
#
# GraderPrompts states it in exactly those words; the README records that an earlier version of
# the tool itself bound these two the wrong way round. It is a trap worth naming rather than
# quietly handling.
GRADER_LABEL = {"exact": "EXACT", "close": "CLOSE", "broad": "NARROW", "narrow": "BROAD"}


def assert_inverse_of_writer(root: Path) -> None:
    """Fail loudly unless this reader is the exact inverse of the code that WROTE the mappings.

    ApplyCommand turns a grader verdict into a SKOS predicate; this file turns the predicate back
    into a verdict. If the two ever disagree, every BROAD and NARROW label in the gold set is
    silently flipped, and the damage is invisible in aggregate because the two errors partly
    cancel — a run scored 0/32 on one class and a plausible-looking 62% on the other.

    So the direction is not asserted from memory or from a comment. It is read out of the writer
    at build time, and a change on either side stops the build instead of quietly poisoning a
    benchmark. This project has had the two predicates bound the wrong way round once already.
    """
    src = root / ("tools/vocab-sync/src/main/java/io/openepcis/dpp/vocabsync/cmd/"
                  "ApplyCommand.java")
    if not src.exists():
        sys.exit(f"cannot verify SKOS direction: {src} not found")
    writer = dict(re.findall(r'case\s+"(EXACT|CLOSE|BROAD|NARROW)"\s*->\s*"skos:(\w+?)Match"',
                             src.read_text()))
    missing = {"EXACT", "CLOSE", "BROAD", "NARROW"} - set(writer)
    if missing:
        sys.exit(f"cannot verify SKOS direction: ApplyCommand has no case for {sorted(missing)}")
    expected = {pred: verdict for verdict, pred in writer.items()}
    if expected != GRADER_LABEL:
        sys.exit("SKOS direction mismatch — ApplyCommand writes " + repr(writer)
                 + ", so this reader must be " + repr(expected)
                 + " but GRADER_LABEL is " + repr(GRADER_LABEL))
    print(f"  direction verified against ApplyCommand: {writer}")

# Where each upstream's cached copy lives. These are the same files the resolver serves, so the
# benchmark reads the definitions a grader would actually be shown.
UPSTREAM_FILES = {
    "gs1": "gs1Voc.jsonld",
    "schema": "schemaOrg.jsonld",
    "dppk": "dppk.jsonld",
    "untp": None,          # no cached copy; pairs still usable, definitions come out empty
}
UPSTREAM_NS = {
    "gs1": "https://ref.gs1.org/voc/",
    "schema": "https://schema.org/",
    "dppk": "https://dpp-keystone.org/spec/v2/terms#",
    "untp": "https://vocabulary.uncefact.org/untp/",
}
OUR_NS = {
    "oec": "https://ref.openepcis.io/extensions/common/core/",
    "eubat": "https://ref.openepcis.io/extensions/eu/battery/",
    "eucpr": "https://ref.openepcis.io/extensions/eu/cpr/",
    "eudet": "https://ref.openepcis.io/extensions/eu/detergent/",
    "eudr": "https://ref.openepcis.io/extensions/eu/eudr/",
    "euelec": "https://ref.openepcis.io/extensions/eu/electronics/",
    "euppwr": "https://ref.openepcis.io/extensions/eu/ppwr/",
    "eusteel": "https://ref.openepcis.io/extensions/eu/iron-steel/",
    "eutex": "https://ref.openepcis.io/extensions/eu/textile/",
    "usfsma": "https://ref.openepcis.io/extensions/us/fsma204/",
}

TRIPLE = re.compile(
    r'^<([^>]+)>\s+<([^>]+)>\s+(?:<([^>]+)>|"(.*)"(?:@\w+|\^\^<[^>]+>)?)\s*\.$')


def repo_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / "extensions").is_dir() and (parent / ".git").exists():
            return parent
    sys.exit("run this from inside openepcis-dpp-ready")


def ontology_root(root: Path) -> Path:
    """The served ontology copies, which carry the upstream labels and definitions."""
    for candidate in (
            root.parent / "openepcis-web/apps/ref-openepcis/public/ontologies/external",
            root / "tools/vocab-sync/.cache/vocab"):
        if candidate.is_dir():
            return candidate
    sys.exit("no cached upstream vocabularies found")


def parse_ours(root: Path) -> tuple[dict, dict, list]:
    """rapper the TTLs once, then read labels, definitions and mappings out of n-triples."""
    files = sorted(root.glob("extensions/*/*/ontology/*.ttl"))
    if not files:
        sys.exit("no ontology TTLs found")
    nt = []
    for f in files:
        out = subprocess.run(["rapper", "-q", "-i", "turtle", "-o", "ntriples", str(f)],
                             capture_output=True, text=True)
        nt.extend(out.stdout.splitlines())

    rel_iri = {SKOS + r + "Match": GRADER_LABEL[r] for r in RELATIONS}
    label, desc, maps = {}, {}, []
    for line in nt:
        m = TRIPLE.match(line)
        if not m:
            continue
        s, p, obj_iri, obj_lit = m.groups()
        if p in rel_iri and obj_iri:
            maps.append((s, rel_iri[p], obj_iri))
        elif p == RDFS_LABEL and obj_lit:
            label.setdefault(s, obj_lit)
        elif p in (SKOS_DEF, RDFS_COMMENT) and obj_lit:
            desc.setdefault(s, obj_lit)
    return label, desc, maps


def _literal(value) -> str:
    if isinstance(value, dict):
        return value.get("@value", "")
    if isinstance(value, list):
        return _literal(value[0]) if value else ""
    return value or ""


def parse_upstream(path: Path, prefix: str) -> tuple[dict, dict]:
    """CURIE and full IRI both map to the same label/definition, since files differ on which
    form they use for @id."""
    label, desc = {}, {}
    if not path or not path.exists():
        return label, desc
    doc = json.loads(path.read_text(encoding="utf-8-sig"))
    graph = doc.get("@graph", doc) if isinstance(doc, dict) else doc
    ns = UPSTREAM_NS[prefix]
    for node in graph if isinstance(graph, list) else []:
        iri = node.get("@id")
        if not iri:
            continue
        keys = {iri}
        if iri.startswith(prefix + ":"):
            keys.add(ns + iri[len(prefix) + 1:])
        elif iri.startswith(ns):
            keys.add(prefix + ":" + iri[len(ns):])
        lab = _literal(node.get("rdfs:label") or node.get("label"))
        dfn = _literal(node.get("rdfs:comment") or node.get("comment")
                       or node.get("skos:definition"))
        for k in keys:
            if lab:
                label.setdefault(k, lab)
            if dfn:
                desc.setdefault(k, dfn)
    return label, desc


def curie(iri: str) -> str:
    for pfx, ns in {**OUR_NS, **UPSTREAM_NS}.items():
        if iri.startswith(ns):
            return pfx + ":" + iri[len(ns):]
    return iri


def expand(term: str) -> str:
    pfx, _, local = term.partition(":")
    ns = {**OUR_NS, **UPSTREAM_NS}.get(pfx)
    return ns + local if ns else term


def mine_removed(root: Path, since: str) -> set:
    """(ourCurie, upstreamCurie, relation) pairs that existed at some past revision and are gone now.

    Parsed from the FILE STATE at each revision, never from diff text. The diff-reading version
    tracked the subject by scanning hunk lines, and a hunk that opens mid-block leaves it latched
    onto whatever subject it last saw: after a 661-line mechanical rewrite it paired "Class A"
    with five unrelated GS1 terms and "OECD Due Diligence Guidance" with five more. Those are
    trivially-easy negatives that would have inflated every NONE recall in the benchmark.

    A pair still present at HEAD under any relation is not a rejection, so predicate repairs and
    grade corrections drop out on their own.
    """
    revisions = subprocess.run(
        ["git", "log", "--format=%H", f"--since={since}", "--",
         "extensions/*/*/ontology/*.ttl"],
        cwd=root, capture_output=True, text=True).stdout.split()
    files = subprocess.run(
        ["git", "ls-files", "extensions/*/*/ontology/*.ttl"],
        cwd=root, capture_output=True, text=True).stdout.split()

    rel_iri = {SKOS + r + "Match": GRADER_LABEL[r] for r in RELATIONS}

    def triples_at(rev: str) -> set:
        out = set()
        for f in files:
            blob = subprocess.run(["git", "show", f"{rev}:{f}"], cwd=root,
                                  capture_output=True, text=True)
            if blob.returncode:
                continue
            nt = subprocess.run(["rapper", "-q", "-i", "turtle", "-o", "ntriples", "-", "-I",
                                 "http://example.org/"], input=blob.stdout,
                                capture_output=True, text=True).stdout
            for line in nt.splitlines():
                m = TRIPLE.match(line)
                if m and m.group(2) in rel_iri and m.group(3):
                    out.add((m.group(1), rel_iri[m.group(2)], m.group(3)))
        return out

    historical = set()
    for rev in revisions:
        historical |= triples_at(rev)
    now = {(s, o) for s, _, o in triples_at("HEAD")}
    return {(curie(s), curie(o), rel) for s, rel, o in historical if (s, o) not in now}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--upstream", default="gs1",
                    help="comma-separated: gs1,schema,dppk,untp — or 'all'")
    ap.add_argument("--per-class", type=int, default=40)
    ap.add_argument("--since", default="2026-06-18",
                    help="how far back to mine curator removals")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    root = repo_root()
    assert_inverse_of_writer(root)
    wanted = list(UPSTREAM_NS) if args.upstream == "all" else args.upstream.split(",")

    label, desc, maps = parse_ours(root)
    up_label, up_desc = {}, {}
    onto = ontology_root(root)
    for pfx in wanted:
        f = UPSTREAM_FILES.get(pfx)
        l, d = parse_upstream(onto / f if f else None, pfx)
        up_label.update(l)
        up_desc.update(d)

    ns_wanted = tuple(UPSTREAM_NS[p] for p in wanted)
    current = {(s, o) for s, _, o in maps}

    by_class: dict[str, list] = collections.defaultdict(list)
    for s, rel, o in maps:
        if not o.startswith(ns_wanted):
            continue
        oc = curie(o)
        if oc not in up_label:                # unresolvable upstream term, no definition to show
            continue
        by_class[rel].append({
            "id": f"{curie(s)}~{oc}~{rel}",
            "gold": rel,
            "sourceIri": s, "sourceLabel": label.get(s, curie(s).split(":")[1]),
            "sourceDef": desc.get(s, ""),
            "targetIri": o, "targetLabel": up_label.get(oc, ""),
            "targetDef": up_desc.get(oc, ""),
        })

    for our, up, _ in sorted(mine_removed(root, args.since)):
        if not up.startswith(tuple(p + ":" for p in wanted)):
            continue
        s, o = expand(our), expand(up)
        if (s, o) in current:                 # re-added later: a grade fix, not a rejection
            continue
        if up not in up_label:
            continue
        by_class["NONE"].append({
            "id": f"{our}~{up}~NONE",
            "gold": "NONE",
            "sourceIri": s, "sourceLabel": label.get(s, our.split(":")[1]),
            "sourceDef": desc.get(s, ""),
            "targetIri": o, "targetLabel": up_label.get(up, ""),
            "targetDef": up_desc.get(up, ""),
        })

    out = []
    print(f"  available per class (upstream: {','.join(wanted)}):")
    for rel in ("EXACT", "CLOSE", "BROAD", "NARROW", "NONE"):
        pool = sorted(by_class.get(rel, []), key=lambda x: x["id"])
        take = pool[:args.per_class]
        short = "" if len(pool) >= args.per_class else f"   SHORT by {args.per_class - len(pool)}"
        print(f"      {rel:6s} have {len(pool):4d}   taking {len(take):3d}{short}")
        out.extend(take)

    if not out:
        sys.exit("empty gold set")
    target = Path(args.out) if args.out else (
        root / f"docs/skos-alignment/bench/{args.upstream}-grader-goldset.json")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    print(f"  wrote {target.relative_to(root)}  ({len(out)} pairs)")


if __name__ == "__main__":
    main()
