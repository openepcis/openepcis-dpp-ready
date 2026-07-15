#!/usr/bin/env python3
"""
Generate 9 Bruno PATCH .bru files that add a `gs1:epcis` link to each
demo product's linkset. Mirrors the existing pip-patch pattern so the
SGTIN walk-step on the DLR inherits the class-level epcis link, which
makes the Traceability tab in DDM populate from
`api.dev.epcis.cloud/events?MATCH_anyEPC=...`.

Run:
    python3 scripts/generate-epcis-patches.py
"""

from __future__ import annotations

import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BRUNO_DIR = ROOT / "bruno" / "digital-link-resolver" / "05-linkset-patches"

# Slug → (seq, item description shown in the link). The seq builds on
# the existing pip patches (1–9) so the epcis patches sort after them.
ENTRIES = [
    ("winter-jacket",        10, "Alpine Pro Winter Jacket"),
    ("trail-running-shoe",   11, "EcoStride Trail Running Shoe"),
    ("business-suit",        12, "Classic Business Suit"),
    ("bed-linen",            13, "Casa Lina Organic Cotton Bed Linen Set"),
    ("ev-battery",           14, "EcoCell Industrial Battery Module IM-500"),
    ("ebike-battery",        15, "VeloPower e-bike battery pack VP-48V-14Ah"),
    ("beverage-bottle",      16, "Mountain Spring Mineral Water — 500 mL PET bottle"),
    ("multi-layer-pouch",    17, "Crispy Snack Pouch — 80 g multi-layer foil"),
    ("ecommerce-carton",     18, "EcoFlow corrugated shipping carton — 30×20×15 cm"),
]

# Slug → product-key (matches keys in /tmp/demo-gtins.json's `products`).
PRODUCT_KEY = {
    "winter-jacket":     "winter-jacket",
    "trail-running-shoe":"trail-shoe",
    "business-suit":     "business-suit",
    "bed-linen":         "bed-linen",
    "ev-battery":        "ev-battery",
    "ebike-battery":     "ebike-battery",
    "beverage-bottle":   "beverage-bottle",
    "multi-layer-pouch": "multi-layer-pouch",
    "ecommerce-carton":  "ecommerce-carton",
}


def build_patch_bru(slug: str, seq: int, item_desc: str, gtin: str) -> str:
    # `action: "add"` because the products don't have an epcis linkType
    # entry yet — `update` NPEs on the DLR side when there's no existing
    # list to wrap (LinkSetServiceImpl chokes on a null `existingWrapperList`).
    # The 4 patches that returned 200 with `update` did so only because
    # the autopopulator had already touched the link — others 207'd.
    body = json.dumps(
        [{
            "action": "add",
            "linkset": [{
                "anchor": f"{{{{dl-url}}}}/01/{gtin}",
                "itemDescription": item_desc,
                # Ratified GS1 linkType is `epcisRepository` (full voc IRI);
                # the legacy `gs1:epcis` is deprecated and must not be used.
                "https://ref.gs1.org/voc/epcisRepository": [{
                    "href": (
                        "https://api.dev.epcis.cloud/events"
                        f"?MATCH_anyEPC=https%3A%2F%2Fid.gs1.org%2F01%2F{gtin}%2A"
                    ),
                    "title": "EPCIS event history",
                    "type": "application/ld+json",
                    "hreflang": ["en"],
                    "context": ["epcisRepository"],
                    "public": True,
                }],
            }],
        }],
        indent=2,
        ensure_ascii=False,
    )
    return f"""meta {{
  name: Patch epcis — {item_desc.split('—')[0].strip()}
  type: http
  seq: {seq}
}}

patch {{
  url: {{{{dl-url}}}}/01/{gtin}
  body: json
  auth: inherit
}}

headers {{
  Content-Type: application/json
}}

body:json {{
{body}
}}

assert {{
  res.status: eq 200
}}
"""


def main() -> int:
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "compute-demo-gtins.py")],
        check=True,
        capture_output=True,
        text=True,
    )
    canon = json.loads(result.stdout)
    products = canon["products"]

    for slug, seq, item_desc in ENTRIES:
        gtin = products[PRODUCT_KEY[slug]]["gtin"]
        out = BRUNO_DIR / f"patch-epcis-{slug}.bru"
        out.write_text(build_patch_bru(slug, seq, item_desc, gtin), encoding="utf-8")
        print(f"  wrote {out.relative_to(ROOT)}  (GTIN {gtin})")

    return 0


if __name__ == "__main__":
    sys.exit(main())
