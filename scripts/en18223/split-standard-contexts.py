#!/usr/bin/env python3
"""
One-shot migration: enforce that bare (unprefixed) term aliases are supported
ONLY via the operational contexts, while the standard module contexts require
proper prefixing (so a term's vocabulary is visible in the data).

For each standard context it splits the term map into:
  - standard (rewritten in place): keeps @-keywords, id/type, prefix declarations,
    and every prefixed-CURIE / typed definition (keys containing ":"). Bare aliases
    are removed, so bare terms no longer resolve under the standard context.
  - {name}-shortcut-context.jsonld (new): the removed bare aliases (plus the prefix
    declarations so it resolves), included only by the operational contexts.

dpp-core-context has an object @context; the module contexts have an array
[<dpp-core url>, {terms}] — only the trailing object is split.

Run: python3 scripts/en18223/split-standard-contexts.py
"""
from __future__ import annotations
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
STANDARD = [
    "extensions/common/core/context/dpp-core-context.jsonld",
    "extensions/eu/battery/context/battery-context.jsonld",
    "extensions/eu/textile/context/textile-context.jsonld",
    "extensions/eu/electronics/context/electronics-context.jsonld",
    "extensions/eu/eudr/context/eudr-context.jsonld",
    "extensions/eu/ppwr/context/ppwr-context.jsonld",
    "extensions/eu/cpr/context/cpr-context.jsonld",
    "extensions/eu/detergent/context/detergent-context.jsonld",
    "extensions/eu/iron-steel/context/iron-steel-context.jsonld",
    "extensions/us/fsma204/context/fsma204-context.jsonld",
]
STRUCT = {"id", "type"}


def is_namespace(v) -> bool:
    return isinstance(v, str) and re.match(r"^https?://", v) and (v.endswith("/") or v.endswith("#"))


def keep_in_standard(k, v) -> bool:
    return k.startswith("@") or k in STRUCT or ":" in k or is_namespace(v)


def split_terms(terms: dict):
    """Return (standard_terms, bare_aliases, prefixes)."""
    standard, bare, prefixes = {}, {}, {}
    for k, v in terms.items():
        if k.startswith("@") or is_namespace(v):
            prefixes[k] = v  # @version / prefix decls needed by both layers
        if keep_in_standard(k, v):
            standard[k] = v
        else:
            bare[k] = v
    return standard, bare, prefixes


def main() -> int:
    for rel in STANDARD:
        path = ROOT / rel
        doc = json.loads(path.read_text())
        ctx = doc["@context"]

        if isinstance(ctx, dict):
            terms = ctx
            container = None
        elif isinstance(ctx, list):
            # split the trailing object; keep the imported context URL(s) as-is
            idx = max(i for i, e in enumerate(ctx) if isinstance(e, dict))
            terms = ctx[idx]
            container = (ctx, idx)
        else:
            print(f"skip {rel}: unexpected @context", file=sys.stderr)
            continue

        standard, bare, prefixes = split_terms(terms)
        if not bare:
            print(f"  {rel}: no bare aliases")
            continue

        # rewrite the standard context (bare aliases removed)
        if container is None:
            doc["@context"] = standard
        else:
            container[0][container[1]] = standard
        path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n")

        # write the shortcut layer (bare aliases + prefixes so it resolves standalone)
        shortcut_ctx = {}
        if "@version" not in prefixes:
            shortcut_ctx["@version"] = 1.1
        shortcut_ctx.update(prefixes)
        shortcut_ctx.update(bare)
        name = path.stem.replace("-context", "")
        shortcut_path = path.with_name(f"{name}-shortcut-context.jsonld")
        shortcut_doc = {
            "_comment": [
                f"Bare (unprefixed) term aliases for the {name} vocabulary.",
                "Included only by the operational contexts, so bare terms resolve under an",
                "operational @context but the standard context requires proper prefixing.",
            ],
            "@context": shortcut_ctx,
        }
        shortcut_path.write_text(json.dumps(shortcut_doc, indent=2, ensure_ascii=False) + "\n")
        print(f"  {rel}: moved {len(bare)} bare aliases -> {shortcut_path.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
