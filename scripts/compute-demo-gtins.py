#!/usr/bin/env python3
"""
Derive GTIN-14 and GLN-13 check digits for the per-organization GCP
table that the demo products are migrating to.

Output: JSON map keyed by product slug (matches `demo-catalog.ts`
entries) so downstream scripts can read it without reimplementing the
mod-10 algorithm.

Each GCP is 7 digits in the GS1 952x demo / test range. Per-product
item references are chosen to read cleanly and stay unique inside
each GCP. GLN-13 location refs are zero-padded sequence numbers.

Run:
    python3 scripts/compute-demo-gtins.py
        # prints JSON to stdout

    python3 scripts/compute-demo-gtins.py > /tmp/demo-gtins.json
        # consumed by seed-* / push-* / upload-* scripts
"""

from __future__ import annotations

import json
import sys

# ----- GCP allocation -----
# 7-digit GCPs in the 952x range (GS1 reserves 952 for tests and
# internal demos — see GS1 General Specifications §1.4.5).
ORGS: dict[str, dict] = {
    "ecowear": {
        "gcp": "9521000",
        "name": "EcoWear GmbH",
        "country": "DE",
    },
    "casa-lina": {
        "gcp": "9521001",
        "name": "Casa Lina S.r.l.",
        "country": "IT",
    },
    "ecocell": {
        "gcp": "9521002",
        "name": "EcoCell Industrial Batteries AB",
        "country": "SE",
    },
    "velopower": {
        "gcp": "9521003",
        "name": "VeloPower BV",
        "country": "NL",
    },
    "mountain-spring": {
        "gcp": "9521004",
        "name": "Mountain Spring Beverages AG",
        "country": "CH",
    },
    "flexisnack": {
        "gcp": "9521005",
        "name": "FlexiSnack Foods Oy",
        "country": "FI",
    },
    "ecoflow-packaging": {
        "gcp": "9521006",
        "name": "EcoFlow Packaging Sp. z o.o.",
        "country": "PL",
    },
    "organic-corp": {
        "gcp": "9521890",
        "name": "Organic Corp.",
        "country": "DE",
    },
}

# Each product carries:
#   slug:            stable key matching demo-catalog.ts
#   org:             FK to ORGS
#   item_ref:        item reference inside the GCP (5 digits → 7-digit
#                    GCP + 5-digit ref + 1 check digit = 13 → +1 leading
#                    zero indicator = GTIN-14)
PRODUCTS: list[dict] = [
    {"slug": "winter-jacket",       "org": "ecowear",           "item_ref": "00142"},
    {"slug": "trail-shoe",          "org": "ecowear",           "item_ref": "00215"},
    {"slug": "business-suit",       "org": "ecowear",           "item_ref": "00420"},
    {"slug": "bed-linen",           "org": "casa-lina",         "item_ref": "00138"},
    {"slug": "ev-battery",          "org": "ecocell",           "item_ref": "00500"},
    {"slug": "ebike-battery",       "org": "velopower",         "item_ref": "00044"},
    {"slug": "beverage-bottle",     "org": "mountain-spring",   "item_ref": "00501"},
    {"slug": "multi-layer-pouch",   "org": "flexisnack",        "item_ref": "00080"},
    {"slug": "ecommerce-carton",    "org": "ecoflow-packaging", "item_ref": "00301"},
    {"slug": "organic-tee",         "org": "organic-corp",      "item_ref": "34033"},
]


def gs1_check_digit(digits: str) -> str:
    """
    GS1 mod-10 weighted-sum check digit. Works for GTIN-14, GLN-13,
    SSCC-18, etc. Pass in everything *but* the check digit; positions
    are counted from the right (rightmost = position 1).
    """
    if not digits.isdigit():
        raise ValueError(f"non-numeric input: {digits!r}")
    total = 0
    # Right-to-left: position 1 → weight 3, position 2 → weight 1, …
    for i, ch in enumerate(reversed(digits)):
        weight = 3 if i % 2 == 0 else 1
        total += int(ch) * weight
    return str((10 - (total % 10)) % 10)


def build_gtin14(gcp: str, item_ref: str) -> str:
    """
    GTIN-14 = leading indicator '0' + 7-digit GCP + 5-digit item ref
    + 1 check digit. The leading 0 marks a retail GTIN-13 padded to
    14 (no logistic indicator).
    """
    if len(gcp) != 7 or len(item_ref) != 5:
        raise ValueError(f"expected 7+5 digits, got gcp={gcp} item={item_ref}")
    body = "0" + gcp + item_ref  # 13 digits
    return body + gs1_check_digit(body)


def build_gln13(gcp: str, location_ref: str) -> str:
    """
    GLN-13 = 7-digit GCP + 5-digit location ref + 1 check digit.
    Location refs `00001` per org → primary HQ identity for now.
    """
    if len(gcp) != 7 or len(location_ref) != 5:
        raise ValueError(f"expected 7+5 digits, got gcp={gcp} loc={location_ref}")
    body = gcp + location_ref  # 12 digits
    return body + gs1_check_digit(body)


def build_map() -> dict:
    orgs_out: dict[str, dict] = {}
    for org_key, org in ORGS.items():
        gln = build_gln13(org["gcp"], "00001")
        orgs_out[org_key] = {
            "gcp": org["gcp"],
            "name": org["name"],
            "country": org["country"],
            "gln": gln,
        }

    products_out: dict[str, dict] = {}
    for p in PRODUCTS:
        org = ORGS[p["org"]]
        gtin = build_gtin14(org["gcp"], p["item_ref"])
        products_out[p["slug"]] = {
            "gtin": gtin,
            "gcp": org["gcp"],
            "item_ref": p["item_ref"],
            "org": p["org"],
            "manufacturer_gln": orgs_out[p["org"]]["gln"],
            "manufacturer_name": org["name"],
        }

    return {"orgs": orgs_out, "products": products_out}


def main() -> int:
    out = build_map()
    json.dump(out, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
