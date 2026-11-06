#!/usr/bin/env python3
"""Build the DPP Keystone discovery cache for vocab-sync from a DPPKeystoneOrg clone.

DPP Keystone publishes its OWL ontology as JSON-LD files with `//` comments and a `{{VERSION}}`
placeholder in every IRI (src/ontology/<version>/...). vocab-sync reads Turtle, so this script
resolves the placeholder, strips the comments, merges every file's named graph and writes

  .cache/vocab/dppk-<version>.ttl     the ontology (labels, definitions, domain, range)
  .cache/vocab/dppk/*.context.jsonld  the published term contexts (term names only)

The cross-walk contexts to the EC model (dpp-ec-to-keystone, dpp-keystone-to-ec) map foreign IRIs
and are left out of the discovery source.

Usage (from the repo root; needs rdflib):
  tools/vocab-sync/tools/build-dppk-cache.py [CLONE] [REF] [VERSION]
defaults: ~/Documents/projects/DPPKeystoneOrg, origin/main, v3
"""
import os
import re
import subprocess
import sys

from rdflib import Dataset, Graph, RDF, URIRef


def jsonc(text):
    """JSON with // and /* */ comments and trailing commas, as plain JSON."""
    out, i, n, in_str = [], 0, len(text), False
    while i < n:
        c = text[i]
        if in_str:
            out.append(c)
            if c == "\\":
                out.append(text[i + 1])
                i += 2
                continue
            if c == '"':
                in_str = False
        elif c == '"':
            in_str = True
            out.append(c)
        elif text.startswith("//", i):
            while i < n and text[i] != "\n":
                i += 1
            continue
        elif text.startswith("/*", i):
            i = text.index("*/", i) + 2
            continue
        else:
            out.append(c)
        i += 1
    return re.sub(r",(\s*[}\]])", r"\1", "".join(out))


def main():
    clone = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/Documents/projects/DPPKeystoneOrg")
    ref = sys.argv[2] if len(sys.argv) > 2 else "origin/main"
    version = sys.argv[3] if len(sys.argv) > 3 else "v3"
    git = lambda *a: subprocess.check_output(["git", "-C", clone, *a]).decode()
    out_dir = ".cache/vocab"
    os.makedirs(out_dir + "/dppk", exist_ok=True)

    ds = Dataset()
    for path in git("ls-tree", "-r", "--name-only", ref, f"src/ontology/{version}").split():
        if not path.endswith(".jsonld"):
            continue
        body = git("show", f"{ref}:{path}").replace("{{VERSION}}", version)
        ds.parse(data=jsonc(body), format="json-ld")
    g = Graph()
    for s, p, o, _ in ds.quads():
        g.add((s, p, o))
    ttl = f"{out_dir}/dppk-{version}.ttl"
    g.serialize(ttl, format="turtle")
    ns = f"https://dpp-keystone.org/spec/{version}/terms"
    terms = {s for s in g.subjects(RDF.type, None) if isinstance(s, URIRef) and str(s).startswith(ns)}

    contexts = 0
    for path in git("ls-tree", "--name-only", ref, f"src/contexts/{version}/").split():
        name = os.path.basename(path)
        if not name.endswith(".context.jsonld") or "-to-" in name:
            continue
        with open(f"{out_dir}/dppk/{name}", "w") as f:
            f.write(git("show", f"{ref}:{path}").replace("{{VERSION}}", version))
        contexts += 1
    print(f"{ttl}: {len(g)} triples, {len(terms)} typed terms; {contexts} contexts "
          f"from {clone} @ {git('rev-parse', '--short', ref).strip()}")


if __name__ == "__main__":
    main()
