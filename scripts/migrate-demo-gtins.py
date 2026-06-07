#!/usr/bin/env python3
"""
One-shot migration: rewrite every old shared-GCP demo GTIN (and the
single shared-manufacturer GLN it ships with) to the per-organization
values produced by `compute-demo-gtins.py`.

Touches:
  - Source seed JSON-LD files in
      extensions/eu/{textile,battery,ppwr}/examples/*.jsonld
  - Bruno collection
      bruno/digital-link-resolver/01-products/**.bru
      bruno/digital-link-resolver/05-linksets/patch-pip-*.bru
  - Image files in scripts/images/ (renamed in place)
  - DDM demo-catalog.ts (relative path passed via CLI)

Old → new mapping is sourced from
  scripts/compute-demo-gtins.py
plus a slug→old-GTIN table inlined below (canonical mapping from the
pre-migration state of the codebase).

Run:
    python3 scripts/migrate-demo-gtins.py --dry-run   # preview
    python3 scripts/migrate-demo-gtins.py             # apply
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import shutil
import subprocess
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent


# Pre-migration GTINs (everything in the repo today references these).
# Slug keys match the new map's `products` keys.
OLD_GTINS: dict[str, str] = {
    "winter-jacket":      "09521234300014",
    "trail-shoe":         "09521234300021",
    "business-suit":      "09521234000075",
    "bed-linen":          "09521234300038",
    "ev-battery":         "09521234000013",
    "ebike-battery":      "09521234000044",
    "beverage-bottle":    "09521234500018",
    "multi-layer-pouch":  "09521234500025",
    "ecommerce-carton":   "09521234500049",
}

# Old shared manufacturer GLN. Every seed file used this for
# `manufacturer.globalLocationNumber`.
OLD_MFG_GLN = "9521234000008"

# Old per-category Bruno setVar GLNs (one shared GLN per category).
# These map to the *first* product's manufacturer GLN under the new
# per-org scheme; create-*.bru files for other products in that
# category will be edited to reference a per-product literal GLN
# instead of the shared var.
OLD_CATEGORY_GLNS: list[str] = [
    "9521987000049",   # packagingManufacturerGln (old)
    "9521234026821",   # batteryManufacturerGln (old)
    "9521234026807",   # manufacturerGln (textile folder, old)
]

# Folder-scoped Bruno setVar names → product slugs. Drives the
# folder.bru rewrite (each var line gets its slug's new GTIN).
BRUNO_FOLDER_VAR_TO_SLUG: dict[str, str] = {
    "jacketGtin":        "winter-jacket",
    "shoeGtin":          "trail-shoe",
    "suitGtin":          "business-suit",
    "bedlinenGtin":      "bed-linen",
    "batteryGtin":       "ev-battery",
    "ebikeBatteryGtin":  "ebike-battery",
    "bottleGtin":        "beverage-bottle",
    "pouchGtin":         "multi-layer-pouch",
    "cartonGtin":        "ecommerce-carton",
}

# Bruno `{{varName}}` template references in create-*.bru that need
# resolution to the per-product manufacturer GLN — the file basename
# (without `create-` prefix and `.bru` suffix) maps to the slug.
BRUNO_CREATE_FILE_TO_SLUG: dict[str, str] = {
    "create-winter-jacket":         "winter-jacket",
    "create-trail-shoe":            "trail-shoe",
    "create-business-suit":         "business-suit",
    "create-hometextile-bedlinen":  "bed-linen",
    "create-ev-battery":            "ev-battery",
    "create-portable-ebike-battery":"ebike-battery",
    "create-beverage-bottle":       "beverage-bottle",
    "create-multi-layer-pouch":     "multi-layer-pouch",
    "create-ecommerce-carton":      "ecommerce-carton",
}

BRUNO_GLN_TEMPLATES: list[str] = [
    "{{manufacturerGln}}",
    "{{batteryManufacturerGln}}",
    "{{packagingManufacturerGln}}",
]


def build_replacements(new_map: dict) -> list[tuple[str, str]]:
    """
    Build a list of (old, new) string substitutions to apply across
    every text-format file we touch. Order matters: GTIN-14 entries
    first (longest), then GLN-13, then bare GCP — we never strip a
    longer match by a shorter one because Python's str.replace is
    full-pass.
    """
    pairs: list[tuple[str, str]] = []
    products = new_map["products"]
    for slug, old in OLD_GTINS.items():
        new = products[slug]["gtin"]
        if old == new:
            continue
        pairs.append((old, new))
        # Some places use GTIN-13 form (drop leading zero) — covered
        # because the leading zero is part of `old`.
    # Manufacturer GLN: same shared value → use each product's mfg GLN.
    # We can't do a single text replace (the same source GLN string
    # appears across all products and needs to map to different new
    # GLNs depending on which product). Handle that per-file below.
    return pairs


def rewrite_jsonld(path: pathlib.Path, new_map: dict, dry_run: bool) -> bool:
    """
    Per-product JSON-LD: each file is owned by exactly one slug
    (matched via the file's `gtin` field). Rewrite GTIN + mfg GLN
    inline.
    """
    body = path.read_text(encoding="utf-8")
    try:
        data = json.loads(body)
    except json.JSONDecodeError as e:
        print(f"  skip {path.relative_to(REPO_ROOT)} — not parseable JSON ({e})", file=sys.stderr)
        return False

    old_gtin = data.get("gtin")
    if not isinstance(old_gtin, str):
        return False

    slug = next((s for s, g in OLD_GTINS.items() if g == old_gtin), None)
    if slug is None:
        return False

    p = new_map["products"][slug]
    new_gtin = p["gtin"]
    new_mfg_gln = p["manufacturer_gln"]

    # GTIN appears once at top-level + several times inside ids / hrefs.
    out = body.replace(old_gtin, new_gtin)
    out = out.replace(OLD_MFG_GLN, new_mfg_gln)

    if out == body:
        return False
    if dry_run:
        print(f"  WOULD rewrite {path.relative_to(REPO_ROOT)}  gtin {old_gtin} → {new_gtin}")
    else:
        path.write_text(out, encoding="utf-8")
        print(f"  rewrote {path.relative_to(REPO_ROOT)}  gtin {old_gtin} → {new_gtin}")
    return True


def rewrite_bruno(path: pathlib.Path, new_map: dict, dry_run: bool) -> bool:
    """
    Bruno .bru files come in three flavours we need to handle
    differently:

    1. **folder.bru** — sets multiple per-product GTIN vars. Rewrite
       each `setVar(NAME, "OLD_GTIN")` line independently, drop the
       legacy category-shared `manufacturerGln` lines (the
       create-*.bru files inline the per-product GLN now).
    2. **create-*.bru** — references exactly one product's GTIN plus
       the category-shared `{{*ManufacturerGln}}` template. Rewrite
       the GTIN and inline the per-product manufacturer GLN in place
       of the template.
    3. **patch-pip-*.bru** (and other product-specific files) — same
       single-GTIN substitution as JSON-LD seeds.
    """
    body = path.read_text(encoding="utf-8")
    name = path.name
    out = body

    # 1) folder.bru: per-var rewrite + drop the legacy GLN setVar lines
    if name == "folder.bru":
        for var, slug in BRUNO_FOLDER_VAR_TO_SLUG.items():
            old_gtin = OLD_GTINS.get(slug)
            new_gtin = new_map["products"][slug]["gtin"]
            if not old_gtin:
                continue
            # Match `bru.setVar("varName", "OLD_GTIN")` keeping
            # whitespace + quote style intact.
            pattern = re.compile(
                rf'(bru\.setVar\(\s*["\']{re.escape(var)}["\']\s*,\s*["\']){re.escape(old_gtin)}(["\']\s*\))'
            )
            out = pattern.sub(rf"\g<1>{new_gtin}\g<2>", out)
        # Drop the legacy category-shared GLN setVar lines —
        # create-*.bru no longer uses them.
        for old_gln in OLD_CATEGORY_GLNS:
            line_pat = re.compile(
                rf'^\s*bru\.setVar\(\s*["\'][^"\']*Gln["\']\s*,\s*["\']{re.escape(old_gln)}["\']\s*\)\s*;?\s*$\n?',
                re.MULTILINE,
            )
            out = line_pat.sub("", out)
        # Mfg-GLN seed-file value (if any folder.bru references it)
        # would also need the same treatment, but in practice only
        # 01-products/*/folder.bru holds the legacy GLN vars and
        # they're all listed above. Nothing else to do here.
        if out == body:
            return False
        if dry_run:
            print(f"  WOULD rewrite {path.relative_to(REPO_ROOT)} (folder.bru — multi-var)")
        else:
            path.write_text(out, encoding="utf-8")
            print(f"  rewrote {path.relative_to(REPO_ROOT)} (folder.bru — multi-var)")
        return True

    # 2) create-*.bru: single GTIN + GLN-template inlining
    stem = path.stem
    if stem in BRUNO_CREATE_FILE_TO_SLUG:
        slug = BRUNO_CREATE_FILE_TO_SLUG[stem]
        p = new_map["products"][slug]
        # The file body uses `{{<varName>}}` for GTIN — rewrite the
        # folder-supplied old GTIN if present (literal occurrences),
        # then inline the per-product manufacturer GLN over the
        # template placeholder.
        old_gtin = OLD_GTINS[slug]
        out = out.replace(old_gtin, p["gtin"])
        out = out.replace(OLD_MFG_GLN, p["manufacturer_gln"])
        for tmpl in BRUNO_GLN_TEMPLATES:
            out = out.replace(tmpl, p["manufacturer_gln"])
        if out == body:
            return False
        if dry_run:
            print(f"  WOULD rewrite {path.relative_to(REPO_ROOT)} (create-* — inline mfg GLN)")
        else:
            path.write_text(out, encoding="utf-8")
            print(f"  rewrote {path.relative_to(REPO_ROOT)} (create-* — inline mfg GLN)")
        return True

    # 3) Other product-specific files: single-GTIN match (e.g.
    # patch-pip-*.bru, get-bottle-masterdata.bru, …).
    hits = [(slug, old) for slug, old in OLD_GTINS.items() if old in body]
    if not hits:
        return False
    if len(hits) > 1:
        print(f"  skip {path.relative_to(REPO_ROOT)} — unexpected multi-GTIN: {[h[0] for h in hits]}", file=sys.stderr)
        return False
    slug, old_gtin = hits[0]
    p = new_map["products"][slug]
    out = out.replace(old_gtin, p["gtin"])
    out = out.replace(OLD_MFG_GLN, p["manufacturer_gln"])
    if out == body:
        return False
    if dry_run:
        print(f"  WOULD rewrite {path.relative_to(REPO_ROOT)}  gtin {old_gtin} → {p['gtin']}")
    else:
        path.write_text(out, encoding="utf-8")
        print(f"  rewrote {path.relative_to(REPO_ROOT)}  gtin {old_gtin} → {p['gtin']}")
    return True


def rewrite_demo_catalog(catalog_path: pathlib.Path, new_map: dict, dry_run: bool) -> bool:
    """
    Replace each old GTIN in demo-catalog.ts with its new GTIN. The
    catalog references GTINs as plain string literals so a flat
    str.replace per pair is safe.
    """
    if not catalog_path.exists():
        print(f"  skip {catalog_path} — not found", file=sys.stderr)
        return False
    body = catalog_path.read_text(encoding="utf-8")
    out = body
    for slug, old in OLD_GTINS.items():
        new = new_map["products"][slug]["gtin"]
        out = out.replace(old, new)
    if out == body:
        return False
    if dry_run:
        print(f"  WOULD rewrite {catalog_path}")
    else:
        catalog_path.write_text(out, encoding="utf-8")
        print(f"  rewrote {catalog_path}")
    return True


def rename_images(images_dir: pathlib.Path, new_map: dict, dry_run: bool) -> int:
    """
    Rename `<old-gtin>-N.<ext>` → `<new-gtin>-N.<ext>`. No-op when
    images_dir doesn't exist (CI / freshly-cloned checkouts).
    """
    if not images_dir.is_dir():
        return 0
    n = 0
    for slug, old in OLD_GTINS.items():
        new = new_map["products"][slug]["gtin"]
        for f in images_dir.glob(f"{old}*"):
            new_name = f.name.replace(old, new, 1)
            target = f.with_name(new_name)
            if dry_run:
                print(f"  WOULD rename {f.name} → {new_name}")
            else:
                f.rename(target)
                print(f"  renamed {f.name} → {new_name}")
            n += 1
    return n


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument(
        "--ddm-catalog",
        type=pathlib.Path,
        default=pathlib.Path(
            "/Users/sven/Documents/projects/openepcis-web/apps/digital-data-management/app/data/demo-catalog.ts"
        ),
        help="Path to DDM demo-catalog.ts (cross-repo edit).",
    )
    args = ap.parse_args()

    # Recompute the map fresh each run so we don't drift if the
    # canonical Python source changed.
    here = pathlib.Path(__file__).resolve().parent
    result = subprocess.run(
        [sys.executable, str(here / "compute-demo-gtins.py")],
        check=True,
        capture_output=True,
        text=True,
    )
    new_map = json.loads(result.stdout)

    print("=== Source seed JSON-LD ===")
    for ext_dir in ("textile", "battery", "ppwr"):
        for p in (REPO_ROOT / "extensions" / "eu" / ext_dir / "examples").glob("*.jsonld"):
            rewrite_jsonld(p, new_map, args.dry_run)

    print("=== Bruno collection ===")
    bruno_root = REPO_ROOT / "bruno" / "digital-link-resolver"
    for sub in ("01-products", "05-linksets"):
        for p in (bruno_root / sub).rglob("*.bru"):
            rewrite_bruno(p, new_map, args.dry_run)

    print("=== DDM demo-catalog.ts ===")
    rewrite_demo_catalog(args.ddm_catalog, new_map, args.dry_run)

    print("=== Image renames ===")
    rename_images(here / "images", new_map, args.dry_run)

    print()
    print("Done." + ("  (dry-run)" if args.dry_run else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
