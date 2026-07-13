#!/usr/bin/env python3
"""
gen-product-docs.py — replace example.com placeholder URLs in the demo product
seeds with real, hosted assets.

For every provisioned seed it:
  1. finds each `*.example.com` URL,
  2. classifies it (document PDF / symbol icon / product image / DPP identifier),
  3. for documents, renders a simple branded, product-matched PDF (HTML -> PDF via
     headless Chrome) into scripts/docs/<gtin>/<slug>.pdf,
  4. rewrites the seed in place so the URL points at the hosted asset:
       https://files.demo.epcis.cloud/files/products/<gtin>/docs/<slug>.pdf
     (icons -> products/_common/symbols/<name>.svg; DPP -> resolver DL URL).

The `docs` phase of provision-demo.sh uploads scripts/docs/** and scripts/symbols/**
to matching keys, so the rewritten URLs resolve.

Idempotent: re-running regenerates the PDFs and re-applies the same rewrites
(URLs already pointing at files.demo.epcis.cloud are skipped).

Usage:
    python3 scripts/gen-product-docs.py               # all provisioned products
    python3 scripts/gen-product-docs.py --gtin 09521890340331
    python3 scripts/gen-product-docs.py --no-pdf      # rewrite seeds only, skip PDF render
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DOCS_DIR = REPO / "scripts" / "docs"
FILES_BASE = "https://files.demo.epcis.cloud/files"
DL_BASE = "https://id.demo.epcis.cloud"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# file (repo-relative) -> gtin. Mirrors provision-demo.sh PRODUCTS + HEROES.
SEEDS: dict[str, str] = {
    "extensions/eu/textile/examples/garment-product.jsonld": "09521000001428",
    "extensions/eu/textile/examples/footwear-product.jsonld": "09521000002159",
    "extensions/eu/textile/examples/garment-set-itip.jsonld": "09521000004207",
    "extensions/eu/textile/examples/hometextile-bedlinen.jsonld": "09521001001380",
    "extensions/eu/battery/examples/battery-product.jsonld": "09521002005004",
    "extensions/eu/battery/examples/portable-ebike-battery.jsonld": "09521003000442",
    "extensions/eu/ppwr/examples/beverage-bottle.jsonld": "09521004005019",
    "extensions/eu/ppwr/examples/multi-layer-pouch.jsonld": "09521005000808",
    "extensions/eu/ppwr/examples/ecommerce-carton.jsonld": "09521006003013",
    "extensions/eu/textile/examples/fjordline-aurora-model.jsonld": "09521234003007",
    "extensions/eu/textile/examples/fjordline-aurora-batch.jsonld": "09521234003007",
    "extensions/eu/textile/examples/fjordline-aurora-item.jsonld": "09521234003007",
    "extensions/eu/battery/examples/amperia-staxwall-model.jsonld": "09521234002000",
    "extensions/eu/battery/examples/amperia-staxwall-batch.jsonld": "09521234002000",
    "extensions/eu/battery/examples/amperia-staxwall-item.jsonld": "09521234002000",
    "extensions/eu/textile/examples/organic-tee-product.jsonld": "09521890340331",
}
# The model seed per gtin, used to source product name / manufacturer / facts.
MODEL_OF = {
    "09521234003007": "extensions/eu/textile/examples/fjordline-aurora-model.jsonld",
    "09521234002000": "extensions/eu/battery/examples/amperia-staxwall-model.jsonld",
}

ICON_FIELDS = {"labelSymbol", "separateCollectionSymbolUrl"}
IMAGE_FIELDS = {"thumbnailUrl", "contentUrl"}

# leaf field key -> (slug, human doc title, intro sentence). Keyword fallback below.
FIELD_DOC = {
    "carbonFootprintStudyUrl": ("carbon-footprint-study", "Carbon Footprint Study",
        "Summary of the product carbon footprint assessment and the methodology applied."),
    "declarationOfConformity": ("declaration-of-conformity", "EU Declaration of Conformity",
        "Manufacturer's declaration that the product conforms to the applicable EU requirements."),
    "dueDiligenceReportUrl": ("due-diligence-report", "Supply-Chain Due-Diligence Report",
        "Annual due-diligence report on responsible sourcing across the supply chain."),
    "dueDiligencePolicyUrl": ("due-diligence-policy", "Due-Diligence Policy",
        "The company policy governing responsible sourcing and supply-chain due diligence."),
    "thirdPartyAssurancesUrl": ("third-party-assurance", "Third-Party Assurance Statement",
        "Independent third-party assurance of the reported sustainability information."),
    "resultOfTestReport": ("test-report", "Test Report",
        "Results of the laboratory testing performed on the product."),
    "verificationCertificateUrl": ("verification-certificate", "Verification Certificate",
        "Certificate confirming independent verification of the declared data."),
    "repurposingGuidelines": ("repurposing-guidelines", "Repurposing Guidelines",
        "Guidance for safe repurposing and second-life use of the product."),
    "safetyInstructions": ("safety-instructions", "Safety Instructions",
        "Important safety information for handling, use and storage."),
    "safetyInstructionsForDismantling": ("dismantling-safety", "Dismantling Safety Instructions",
        "Safety instructions for professional dismantling at end of life."),
    "warrantyConditions": ("warranty-conditions", "Warranty Conditions",
        "The terms and conditions of the manufacturer's warranty."),
    "takeBackUrl": ("take-back-programme", "Take-Back Programme",
        "How to return the product at end of life through the take-back programme."),
    "repairGuideUrl": ("repair-guide", "Repair Guide",
        "Step-by-step guidance for common repairs to extend the product's life."),
    "sparePartsUrl": ("spare-parts", "Spare Parts List",
        "Available spare parts and how to order them."),
    "authorizedServiceCenters": ("service-centres", "Authorised Service Centres",
        "Network of authorised service centres for maintenance and repair."),
    "professionalRepairNetwork": ("repair-network", "Professional Repair Network",
        "Find a professional repair partner near you."),
    "informationOnCollection": ("collection-information", "Collection Information",
        "How this product is collected separately at end of life."),
    "separateCollection": ("separate-collection", "Separate Collection Notice",
        "This product must be collected separately from household waste."),
    "wastePrevention": ("waste-prevention", "Waste Prevention Advice",
        "Advice on prolonging product life and preventing waste."),
    "documentUrl": ("document", "Product Document",
        "Reference documentation for the product."),
}
# keyword (in URL path) -> (slug, title, intro) fallback when field key is `id`.
KEYWORD_DOC = [
    ("user-guide", ("user-guide", "User & Care Guide",
        "How to use and care for the product to get the most out of it.")),
    ("care", ("care-guide", "Care Guide",
        "Care and maintenance instructions for the product.")),
    ("manual", ("user-manual", "User Manual",
        "Operating manual for the product.")),
    ("certification", ("certifications", "Product Certifications",
        "Overview of the certifications held by this product.")),
    ("certificate", ("certificate", "Certificate",
        "Certificate issued for this product.")),
    ("transparency", ("transparency-report", "Supply-Chain Transparency Report",
        "Transparency report covering the product's supply chain.")),
    ("cfp", ("carbon-footprint-study", "Carbon Footprint Study",
        "Summary of the product carbon footprint assessment.")),
    ("repair", ("repair-guide", "Repair Guide",
        "Guidance for common repairs.")),
    ("spare", ("spare-parts", "Spare Parts List",
        "Available spare parts and ordering information.")),
    ("takeback", ("take-back-programme", "Take-Back Programme",
        "How to return the product at end of life.")),
]


def load(path: Path):
    return json.loads(path.read_text())


def first_str(v):
    """Best-effort human string from a JSON-LD value (str, {@value}, [ {@value} ])."""
    if isinstance(v, str):
        return v
    if isinstance(v, dict):
        return v.get("@value") or v.get("en") or ""
    if isinstance(v, list) and v:
        return first_str(v[0])
    return ""


def product_meta(gtin: str, seed: dict) -> dict:
    """Product name, manufacturer, and a few display facts from the model seed."""
    model_rel = MODEL_OF.get(gtin)
    src = load(REPO / model_rel) if model_rel else seed
    name = first_str(src.get("gs1:productName")) or "Product"
    man = src.get("gs1:manufacturer") or {}
    if isinstance(man, list):
        man = man[0] if man else {}
    manufacturer = first_str(man.get("gs1:organizationName")) or "Manufacturer"
    facts: list[tuple[str, str]] = [("GTIN", gtin)]
    country = src.get("gs1:countryOfOrigin", {})
    cc = country.get("gs1:countryCode") if isinstance(country, dict) else None
    if cc:
        facts.append(("Country of origin", cc))
    nw = src.get("gs1:netWeight")
    if isinstance(nw, dict) and nw.get("gs1:value") is not None:
        facts.append(("Net weight", f"{nw['gs1:value']} {nw.get('gs1:unitCode', '')}".strip()))
    mats = src.get("gs1:textileMaterial")
    if isinstance(mats, list) and mats:
        comp = ", ".join(
            f"{m.get('gs1:textileMaterialPercentage', '')}% {first_str(m.get('gs1:textileMaterialDescription'))}".strip()
            for m in mats if isinstance(m, dict)
        )
        if comp:
            facts.append(("Composition", comp))
    return {"name": name, "manufacturer": manufacturer, "facts": facts,
            "issue_date": src.get("oec:passportIssueDate", "2026-02-15")}


# ---- URL discovery -------------------------------------------------------

def find_example_urls(node, key=None, out=None):
    """Yield (url, leaf_key) for every example.com http URL leaf."""
    if out is None:
        out = []
    if isinstance(node, dict):
        for k, v in node.items():
            find_example_urls(v, k.split(":")[-1], out)
    elif isinstance(node, list):
        for v in node:
            find_example_urls(v, key, out)
    elif isinstance(node, str) and node.startswith("http") and "example" in node:
        out.append((node, key))
    return out


def slugify(s: str) -> str:
    s = re.sub(r"\.pdf$", "", s, flags=re.I)
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "document"


def classify(url: str, keys: set[str]):
    """Return (action, slug, title, intro). action in {pdf, icon-<name>, image, dpp}."""
    if keys & ICON_FIELDS:
        name = "battery-label" if "labelSymbol" in keys else "separate-collection"
        return ("icon", name, None, None)
    if keys & IMAGE_FIELDS:
        return ("image", "product-image", None, None)
    if "passportIdentifier" in keys:
        return ("dpp", None, None, None)
    # document: prefer a known field mapping, else keyword, else path filename
    for k in keys:
        if k in FIELD_DOC:
            slug, title, intro = FIELD_DOC[k]
            return ("pdf", slug, title, intro)
    path = url.split("?")[0].rstrip("/")
    last = path.split("/")[-1]
    for kw, (slug, title, intro) in KEYWORD_DOC:
        if kw in path.lower():
            return ("pdf", slug, title, intro)
    # bare-domain website -> company one-pager
    if "/" not in url.split("://", 1)[-1].strip("/"):
        return ("pdf", "company", "Company Information",
                "About the manufacturer and its sustainability commitments.")
    return ("pdf", slugify(last), "Product Document", "Reference documentation for the product.")


# ---- PDF rendering -------------------------------------------------------

def doc_html(meta: dict, title: str, intro: str) -> str:
    facts = "".join(
        f"<tr><th>{html.escape(k)}</th><td>{html.escape(str(v))}</td></tr>"
        for k, v in meta["facts"]
    )
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 22mm 20mm; }}
* {{ box-sizing: border-box; }}
body {{ font-family: Helvetica, Arial, sans-serif; color: #1c2b28; font-size: 12pt; line-height: 1.5; }}
.top {{ border-bottom: 3px solid #8FB3A6; padding-bottom: 14px; margin-bottom: 28px; }}
.brand {{ font-size: 11pt; letter-spacing: .14em; text-transform: uppercase; color: #5f7d73; }}
h1 {{ font-size: 22pt; margin: 6px 0 2px; color: #33544a; }}
.product {{ font-size: 13pt; color: #4a5c57; margin: 0; }}
.intro {{ margin: 26px 0; }}
table {{ border-collapse: collapse; width: 100%; margin-top: 10px; }}
th, td {{ text-align: left; padding: 8px 10px; border-bottom: 1px solid #e3ebe8; vertical-align: top; }}
th {{ width: 34%; color: #5f7d73; font-weight: 600; }}
.badge {{ display: inline-block; background: #eef4f1; color: #33544a; border-radius: 6px;
         padding: 4px 10px; font-size: 9.5pt; margin-top: 18px; }}
footer {{ position: fixed; bottom: 12mm; left: 20mm; right: 20mm; font-size: 8.5pt;
          color: #8a9a95; border-top: 1px solid #e3ebe8; padding-top: 6px; }}
</style></head><body>
<div class="top">
  <div class="brand">{html.escape(meta['manufacturer'])}</div>
  <h1>{html.escape(title)}</h1>
  <p class="product">{html.escape(meta['name'])}</p>
</div>
<p class="intro">{html.escape(intro)}</p>
<table>{facts}</table>
<span class="badge">Digital Product Passport &middot; issued {html.escape(str(meta['issue_date']))}</span>
<footer>This is illustrative demo documentation generated for the OpenEPCIS Digital
Product Passport showcase. Product: {html.escape(meta['name'])} &middot; {html.escape(meta['manufacturer'])}.</footer>
</body></html>"""


def render_pdf(html_str: str, out_pdf: Path) -> bool:
    out_pdf.parent.mkdir(parents=True, exist_ok=True)
    if out_pdf.exists():
        out_pdf.unlink()
    with tempfile.TemporaryDirectory() as td:
        html_path = Path(td) / "doc.html"
        html_path.write_text(html_str)
        prof = Path(td) / "profile"
        proc = subprocess.Popen(
            [CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
             "--no-first-run", "--disable-extensions", "--disable-background-networking",
             f"--user-data-dir={prof}", "--no-pdf-header-footer",
             "--virtual-time-budget=3000",
             f"--print-to-pdf={out_pdf}", html_path.as_uri()],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        # Chrome reliably writes the PDF but sometimes hangs on shutdown; don't
        # wait on a clean exit — poll for the output file, then kill.
        import time
        for _ in range(60):  # up to ~30s
            if out_pdf.exists() and out_pdf.stat().st_size > 0:
                break
            if proc.poll() is not None:
                break
            time.sleep(0.5)
        if proc.poll() is None:
            proc.kill()
            try:
                proc.wait(timeout=5)
            except Exception:  # noqa: BLE001
                pass
        ok = out_pdf.exists() and out_pdf.stat().st_size > 0
        if not ok:
            print(f"    chrome render failed for {out_pdf.name}", file=sys.stderr)
        return ok


# ---- main ----------------------------------------------------------------

def process_seed(rel: str, gtin: str, do_pdf: bool) -> tuple[int, int]:
    path = REPO / rel
    seed = load(path)
    text = path.read_text()
    meta = product_meta(gtin, seed)

    # collect distinct example.com URLs with the set of leaf keys referencing them
    keys_by_url: dict[str, set[str]] = {}
    for url, key in find_example_urls(seed):
        keys_by_url.setdefault(url, set()).add(key)

    rewrites = 0
    pdfs: dict[str, tuple[str, str]] = {}  # slug -> (title, intro)
    # Replace the fully-quoted JSON string ("url") so a short bare-domain URL can
    # never clobber a longer URL that merely starts with it. Longest first for safety.
    for url in sorted(keys_by_url, key=len, reverse=True):
        keys = keys_by_url[url]
        action, slug, title, intro = classify(url, keys)
        if action == "icon":
            target = f"{FILES_BASE}/products/_common/symbols/{slug}.svg"
        elif action == "image":
            target = f"{FILES_BASE}/products/_common/symbols/product-image.svg"
        elif action == "dpp":
            target = f"{DL_BASE}/01/{gtin}"
        else:  # pdf
            target = f"{FILES_BASE}/products/{gtin}/docs/{slug}.pdf"
            pdfs[slug] = (title, intro)
        needle = f'"{url}"'
        if url != target and needle in text:
            text = text.replace(needle, f'"{target}"')
            rewrites += 1

    if rewrites:
        path.write_text(text)

    made = 0
    if do_pdf:
        for slug, (title, intro) in pdfs.items():
            out = DOCS_DIR / gtin / f"{slug}.pdf"
            if render_pdf(doc_html(meta, title, intro), out):
                made += 1
    return rewrites, made


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--gtin", help="only this GTIN")
    ap.add_argument("--no-pdf", action="store_true", help="rewrite seeds only")
    args = ap.parse_args()

    do_pdf = not args.no_pdf
    if do_pdf and not Path(CHROME).exists():
        print(f"Chrome not found at {CHROME}; use --no-pdf or fix the path.", file=sys.stderr)
        return 1

    total_rw = total_pdf = 0
    for rel, gtin in SEEDS.items():
        if args.gtin and gtin != args.gtin:
            continue
        rw, made = process_seed(rel, gtin, do_pdf)
        total_rw += rw
        total_pdf += made
        print(f"  {gtin}  {os.path.basename(rel):40s} rewrites={rw} pdfs={made}")
    print(f"✓ {total_rw} URL rewrites, {total_pdf} PDFs generated under scripts/docs/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
