#!/usr/bin/env python3
"""
gen-extension-schemas.py — Generate a permissive per-namespace JSON Schema for every
ref.openepcis.io EPCIS extension, so the OpenEPCIS repository can register them
(POST /userExtension/jsonSchema) and capture events that declare the namespace via
GS1-Extensions instead of failing closed.

Permissive means: each namespace's known terms are declared as OPTIONAL properties (both
the short alias and the prefixed `prefix:term` form) with additionalProperties:true, so
legitimate events are never rejected while the vocabulary is documented. Field-level
validation (required/types/code-lists) can tighten later per ontology.

Output: extensions/**/validation/<slug>.extension-schema.json  (source of truth)
        + a manifest scripts/out/extension-schemas.manifest.json listing
          {namespace, defaultPrefix, jsonldContextUrl, schemaFile} for the registrar.
"""
import json, os, sys, pathlib

REPO = pathlib.Path(__file__).resolve().parent.parent
BASE_URL = "https://ref.openepcis.io/extensions"

# module dir | prefix | namespace suffix | canonical context file
MODULES = [
    ("extensions/common/core",     "oec",     "common/core/",     "dpp-core-context.jsonld"),
    ("extensions/common/interop",  "oei",     "common/interop/",  "semic-core-bridge-context.jsonld"),
    ("extensions/eu/battery",      "eubat",   "eu/battery/",      "battery-context.jsonld"),
    ("extensions/eu/eudr",         "eudr",    "eu/eudr/",         "eudr-context.jsonld"),
    ("extensions/eu/textile",      "eutex",   "eu/textile/",      "textile-context.jsonld"),
    ("extensions/eu/electronics",  "euelec",  "eu/electronics/",  "electronics-context.jsonld"),
    ("extensions/eu/detergent",    "eudet",   "eu/detergent/",    "detergent-context.jsonld"),
    ("extensions/eu/iron-steel",   "eusteel", "eu/iron-steel/",   "iron-steel-context.jsonld"),
    ("extensions/us/fsma204",      "usfsma",  "us/fsma204/",      "fsma204-context.jsonld"),
]

def context_terms(ctx_path, prefix):
    """Return sorted term aliases defined in a JSON-LD @context (dict or list forms).
    Skips @-keywords and bare prefix declarations (value == a namespace URI ending in / or #)."""
    try:
        doc = json.load(open(ctx_path))
    except Exception as e:
        print(f"  ! cannot parse {ctx_path}: {e}", file=sys.stderr)
        return []
    ctx = doc.get("@context", doc)
    entries = ctx if isinstance(ctx, list) else [ctx]
    terms = set()
    for e in entries:
        if not isinstance(e, dict):
            continue
        for k, v in e.items():
            if k.startswith("@") or k in ("id", "type"):
                continue
            # skip pure prefix declarations (value is a namespace root)
            val = v if isinstance(v, str) else (v.get("@id") if isinstance(v, dict) else "")
            if isinstance(v, str) and (v.endswith("/") or v.endswith("#")):
                continue
            terms.add(k)
    return sorted(terms)

def build_schema(namespace, prefix, terms):
    props = {}
    for t in terms:
        # accept both the short alias and the explicitly-prefixed form
        props[t] = {}
        props[f"{prefix}:{t}"] = {}
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": namespace,
        "title": f"OpenEPCIS extension (permissive) — {prefix}",
        "description": (
            f"Permissive capture schema for the {namespace} extension. Declares known terms "
            f"as optional and allows additional properties, so events that declare "
            f"GS1-Extensions {prefix}={namespace} validate and capture. Generated from the "
            f"module JSON-LD context; tighten per ontology for field-level validation."
        ),
        "type": "object",
        "properties": props,
        "patternProperties": {f"^{prefix}:": {}},
        "additionalProperties": True,
    }

def main():
    outdir = REPO / "scripts" / "out"
    outdir.mkdir(parents=True, exist_ok=True)
    manifest = []
    for reldir, prefix, nssuffix, ctxfile in MODULES:
        d = REPO / reldir
        namespace = f"{BASE_URL}/{nssuffix}"
        ctx_path = d / "context" / ctxfile
        ctx_url = f"{BASE_URL}/{nssuffix}{ctxfile}"
        terms = context_terms(ctx_path, prefix) if ctx_path.exists() else []
        schema = build_schema(namespace, prefix, terms)
        valdir = d / "validation"
        valdir.mkdir(parents=True, exist_ok=True)
        slug = reldir.split("/")[-1]
        schema_file = valdir / f"{slug}.extension-schema.json"
        json.dump(schema, open(schema_file, "w"), indent=2)
        rel = schema_file.relative_to(REPO)
        manifest.append({
            "namespace": namespace, "defaultPrefix": prefix,
            "jsonldContextUrl": ctx_url, "schemaFile": str(rel), "terms": len(terms),
        })
        print(f"  {prefix:8} terms={len(terms):3}  -> {rel}")
    json.dump(manifest, open(outdir / "extension-schemas.manifest.json", "w"), indent=2)
    print(f"\nmanifest: scripts/out/extension-schemas.manifest.json ({len(manifest)} namespaces)")

if __name__ == "__main__":
    main()
