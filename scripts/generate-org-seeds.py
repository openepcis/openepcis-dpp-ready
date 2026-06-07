#!/usr/bin/env python3
"""
Generate canonical Organization JSON-LD seed files for the 7 demo
manufacturers, plus matching Bruno create-*.bru POST scripts.

Each org carries a globalLocationNumber that matches what the demo
product seeds reference under `manufacturer.globalLocationNumber`, so
the DDM webapp's /417/{gln} deep-links resolve.

Run:
    python3 scripts/generate-org-seeds.py
        # writes 7 jsonld + 7 .bru files
"""

from __future__ import annotations

import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEEDS_DIR = ROOT / "extensions" / "common" / "core" / "examples" / "organizations"
BRUNO_DIR = ROOT / "bruno" / "digital-link-resolver" / "03-organizations"

# Per-org metadata. Address details are illustrative — they make the
# /417 page look plausible without claiming real-world existence.
ORG_DATA = {
    "ecowear": {
        "name": "EcoWear GmbH",
        "city": "Berlin",
        "country": "DE",
        "street": "Nachhaltigkeitsstraße 42",
        "postal": "10115",
        "domain": "ecowear.example.com",
        "operator": "DE-DPP-OP-001",
        "role": "manufacturer",
        "scope": "Apparel and home textiles under EU ESPR Annex V.",
    },
    "casa-lina": {
        "name": "Casa Lina S.r.l.",
        "city": "Como",
        "country": "IT",
        "street": "Via dei Tessitori 7",
        "postal": "22100",
        "domain": "casalina.example.com",
        "operator": "IT-DPP-OP-002",
        "role": "manufacturer",
        "scope": "Organic-cotton home textiles, GOTS-certified weaving.",
    },
    "ecocell": {
        "name": "EcoCell Industrial Batteries AB",
        "city": "Göteborg",
        "country": "SE",
        "street": "Batterivägen 12",
        "postal": "417 56",
        "domain": "ecocell.example.com",
        "operator": "SE-DPP-OP-003",
        "role": "manufacturer",
        "scope": "Industrial LFP battery modules under EU 2023/1542.",
    },
    "velopower": {
        "name": "VeloPower BV",
        "city": "Eindhoven",
        "country": "NL",
        "street": "Fietsstraat 88",
        "postal": "5612 AB",
        "domain": "velopower.example.com",
        "operator": "NL-DPP-OP-004",
        "role": "manufacturer",
        "scope": "Light Means of Transport battery packs (NMC chemistry).",
    },
    "mountain-spring": {
        "name": "Mountain Spring Beverages AG",
        "city": "Visp",
        "country": "CH",
        "street": "Quellweg 3",
        "postal": "3930",
        "domain": "mountain-spring.example.com",
        "operator": "CH-DPP-OP-005",
        "role": "manufacturer",
        "scope": "Bottled mineral water in 50% post-consumer rPET.",
    },
    "flexisnack": {
        "name": "FlexiSnack Foods Oy",
        "city": "Tampere",
        "country": "FI",
        "street": "Tehdaskatu 14",
        "postal": "33100",
        "domain": "flexisnack.example.com",
        "operator": "FI-DPP-OP-006",
        "role": "manufacturer",
        "scope": "Multi-layer foil snack packaging (PET / Al / PE).",
    },
    "ecoflow-packaging": {
        "name": "EcoFlow Packaging Sp. z o.o.",
        "city": "Łódź",
        "country": "PL",
        "street": "Ul. Tekturowa 27",
        "postal": "90-200",
        "domain": "ecoflow-pack.example.com",
        "operator": "PL-DPP-OP-007",
        "role": "manufacturer",
        "scope": "Recycled-cardboard shipping cartons (95% rPCR).",
    },
}


def build_org_payload(gln: str, meta: dict) -> dict:
    """
    Organization payload shape the DLR's POST /organizations expects.
    The Organization DTO uses bare keys (globalLocationNumber, glnType,
    organizationName, …) — gs1:-prefixed keys are rejected with
    "field is required" because the DTO's normaliser doesn't strip the
    prefix for organizations the way it does for products.
    """
    return {
        "@context": [
            "https://ref.gs1.org/voc/",
            "https://ref.openepcis.io/extensions/common/core/dpp-core-context.jsonld",
        ],
        "type": "Organization",
        "glnType": "LEGAL_ENTITY",
        "globalLocationNumber": gln,
        "organizationName": {
            "en": meta["name"],
            meta["country"].lower(): meta["name"],
        },
        "organizationRole": "MANUFACTURER_OF_FINISHED_GOODS",
        # PostalAddress is a nested object on the Organization DTO;
        # top-level streetAddress / addressLocality keys are silently
        # dropped by the entity mapper. The DTO also requires
        # `address.organizationName` (the postal name on the address
        # block — distinct from the Organization's display name above).
        "address": {
            "organizationName": {"en": meta["name"]},
            "streetAddress": {"en": meta["street"]},
            "addressLocality": {"en": meta["city"]},
            "postalCode": meta["postal"],
            "countryCode": meta["country"],
        },
        "email": f"info@{meta['domain']}",
        "telephone": "+00 0 0000 0000",
        "dpp:economicOperatorId": meta["operator"],
        "dpp:operatorType": "dpp:Manufacturer",
    }


def build_org_jsonld(slug: str, gcp: str, gln: str, meta: dict) -> dict:
    """Seed JSON-LD reuses the POST payload shape verbatim."""
    return build_org_payload(gln, meta)


def build_bru(slug: str, gln: str, meta: dict, seq: int) -> str:
    body = json.dumps(build_org_payload(gln, meta), indent=2, ensure_ascii=False)
    return f"""meta {{
  name: Create Org — {meta['name']}
  type: http
  seq: {seq}
}}

post {{
  url: {{{{dl-url}}}}/organizations
  body: json
  auth: inherit
}}

headers {{
  Content-Type: application/json
  isAnonymousAccessAllowed: true
}}

body:json {{
{body}
}}

tests {{
  test("Organization created", function() {{
    expect(res.status).to.be.oneOf([200, 201, 202, 409]);
  }});
}}
"""


def main() -> int:
    # Pull the canonical GTIN/GLN map so we never drift from
    # compute-demo-gtins.py.
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "compute-demo-gtins.py")],
        check=True,
        capture_output=True,
        text=True,
    )
    canon = json.loads(result.stdout)

    SEEDS_DIR.mkdir(parents=True, exist_ok=True)
    BRUNO_DIR.mkdir(parents=True, exist_ok=True)

    for i, (slug, meta) in enumerate(ORG_DATA.items(), start=10):
        org = canon["orgs"][slug]
        jsonld = build_org_jsonld(slug, org["gcp"], org["gln"], meta)
        jsonld_path = SEEDS_DIR / f"{slug}.jsonld"
        jsonld_path.write_text(
            json.dumps(jsonld, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        print(f"  wrote {jsonld_path.relative_to(ROOT)}")

        bru = build_bru(slug, org["gln"], meta, seq=i)
        bru_path = BRUNO_DIR / f"create-{slug}.bru"
        bru_path.write_text(bru, encoding="utf-8")
        print(f"  wrote {bru_path.relative_to(ROOT)}")

    print(f"\nGenerated {len(ORG_DATA)} org seeds + bruno files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
