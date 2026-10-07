#!/usr/bin/env python3
"""
The prefixes of the ontology, for the repository module openepcis-instance-masterdata: every
namespace the extension contexts declare (extensions/**/context/*.jsonld), as prefix -> IRI. The
module writes an ILMD term of one of these namespaces into a lot or serial record in the resolver,
with its canonical prefix; anything else stays in the event. Helper vocabularies that describe no
product (rdfs, xsd, skos, prov, ...) are left out.

    python3 scripts/build-instance-namespaces.py <openepcis-core>/openepcis-instance-masterdata/src/main/resources/instance-masterdata/namespaces.json

Run it after an extension gains or changes a namespace, and commit the result in openepcis-core.
"""
import glob
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
SKIP = {"rdfs", "xsd", "skos", "renderMethodPrefix", "adms", "foaf", "org", "legal", "cpsv", "prov", "time"}


def namespaces():
    found = {}
    for f in sorted(glob.glob(str(HERE / "extensions/**/context/*.jsonld"), recursive=True)):
        try:
            doc = json.loads(pathlib.Path(f).read_text(encoding="utf-8"))
        except ValueError:
            continue
        ctx = doc.get("@context", {})
        for c in ctx if isinstance(ctx, list) else [ctx]:
            if not isinstance(c, dict):
                continue
            for prefix, iri in c.items():
                if isinstance(iri, str) and iri[-1:] in "/#:" and ":" not in prefix and not prefix.startswith("@") and prefix not in SKIP:
                    found.setdefault(prefix, iri)
    return dict(sorted(found.items()))


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    out = {"_source": "openepcis-dpp-ready extensions/**/context/*.jsonld (ref.openepcis.org); regenerate with scripts/build-instance-namespaces.py",
           "namespaces": namespaces()}
    pathlib.Path(sys.argv[1]).write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print(f"{len(out['namespaces'])} prefixes -> {sys.argv[1]}")


if __name__ == "__main__":
    main()
