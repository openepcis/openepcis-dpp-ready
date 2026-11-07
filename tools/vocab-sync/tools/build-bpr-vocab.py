#!/usr/bin/env python3
"""Build the BatteryPass-Ready 2.0.1 data element vocabulary from the GEFEG JSON Schemas.

BatteryPass-Ready (git.gefeg.com/bp/BatteryPassDataModel) succeeds the archived Battery Pass
Consortium SAMM model (urn:samm:io.BatteryPass.*, frozen at 1.2.x). Since 2.0 it is the current
battery passport data model, published as JSON Schema and XSD per battery category, with no IRIs.
To align our terms against it, this script reads the property names of all ten 2.0.1 schemas (five
categories, each also in the February 2027 variant) and mints one IRI per data element under
https://ref.openepcis.org/vocab/batterypass-ready/2.0.1#, the same hosting pattern as the 1.3
longlist vocabulary.

The schemas carry no descriptions. Each element gets its parent object as context, and elements
whose name equals the notation of an EU DPP Registry battery data element take over that
element's definition and legal source. Unit and value carriers of the schema's quantity objects
(`kilowattHourUnit`, `celsiusValue`, ...) are serialisation slots, not data points, and are left out.

Usage (from the repo root; needs rdflib):
  tools/vocab-sync/tools/build-bpr-vocab.py
Writes extensions/eu/battery/vocab/batterypass-ready-2.0.1.ttl
"""
import json
import re
import sys
import urllib.request

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS

COMMIT = "64761a79bc287f2e0eb371837c1d02e4eacb9c37"  # GEFEG main, 2026-09-23
RAW = f"https://git.gefeg.com/bp/BatteryPassDataModel/-/raw/{COMMIT}/JSONSchemaFiles/v2.0.1/"
CATEGORIES = ["EV", "LMT", "Industrial_Without_BMS", "Other_Industrial_Above_2kWh",
              "Stationary_Industrial_Above_2kWh"]
ONT = "https://ref.openepcis.org/vocab/batterypass-ready/2.0.1"
NS = Namespace(ONT + "#")
SKOS = Namespace("http://www.w3.org/2004/02/skos/core#")
EU_TTL = "extensions/upstream/eu-dpp/ontology/eu-dpp.ttl"
OUT = "extensions/eu/battery/vocab/batterypass-ready-2.0.1.ttl"
SLOT = re.compile(r"(Unit|Value|Values)$|^(value|unit|identifier|identifierType|name|url|"
                  r"additionallyPossibleValue)$")


def label(name):
    words = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", name)
    words = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1 \2", words)
    return words[:1].upper() + words[1:]


def main():
    elements = {}  # name -> {parents, categories}

    def walk(node, parent, category):
        if isinstance(node, list):
            for x in node:
                walk(x, parent, category)
            return
        if not isinstance(node, dict):
            return
        for name, sub in node.get("properties", {}).items():
            e = elements.setdefault(name, {"parents": set(), "categories": set()})
            if parent:
                e["parents"].add(parent)
            e["categories"].add(category)
            walk(sub, name, category)
        for key in ("items", "allOf", "anyOf", "oneOf"):
            if key in node:
                walk(node[key], parent, category)
        for def_name, sub in node.get("$defs", {}).items():
            walk(sub, def_name, category)

    for cat in CATEGORIES:
        for variant in ("", "_Feb27"):
            name = f"{cat}{variant}_2.0.1.json"
            with urllib.request.urlopen(RAW + name, timeout=60) as r:
                walk(json.load(r), None, cat + variant)

    eu = Graph().parse(EU_TTL)
    eu_def = {}
    for s in eu.subjects(SKOS.notation, None):
        n = str(eu.value(s, SKOS.notation))
        d = eu.value(s, SKOS.definition)
        if d:
            eu_def.setdefault(n, (str(d), eu.value(s, SKOS.scopeNote), s))

    g = Graph()
    g.bind("bpr", NS)
    g.bind("skos", SKOS)
    g.bind("dcterms", DCTERMS)
    ont = URIRef(ONT)
    g.add((ont, RDF.type, OWL.Ontology))
    g.add((ont, DCTERMS.title, Literal("BatteryPass-Ready data elements (data model 2.0.1)", lang="en")))
    g.add((ont, DCTERMS.description, Literal(
        "OpenEPCIS-hosted RDF reference for the data elements of the BatteryPass-Ready data model "
        "2.0.1 (GEFEG, git.gefeg.com/bp/BatteryPassDataModel @ " + COMMIT[:7] + "), the successor of "
        "the archived Battery Pass Consortium SAMM model. Generated from the JSON Schemas by "
        "tools/vocab-sync/tools/build-bpr-vocab.py; names are GEFEG's, IRIs are minted here because "
        "the schemas publish none.", lang="en")))
    g.add((ont, DCTERMS.source, URIRef("https://git.gefeg.com/bp/BatteryPassDataModel")))
    g.add((ont, OWL.versionInfo, Literal("2.0.1")))

    kept = slots = with_def = 0
    for name in sorted(elements):
        if SLOT.search(name):
            slots += 1
            continue
        e = elements[name]
        s = NS[name]
        g.add((s, RDF.type, RDF.Property))
        g.add((s, RDFS.label, Literal(label(name), lang="en")))
        g.add((s, RDFS.isDefinedBy, ont))
        parts = []
        if name in eu_def:
            d, scope, eu_iri = eu_def[name]
            parts.append(d)
            if scope:
                parts.append(str(scope))
            g.add((s, RDFS.seeAlso, eu_iri))
            with_def += 1
        parents = sorted(p for p in e["parents"] if p != name)
        if parents:
            parts.append("Part of: " + ", ".join(label(p) for p in parents[:3]) + ".")
        cats = sorted(e["categories"])
        if len(cats) < 2 * len(CATEGORIES):
            parts.append("Battery categories: " + ", ".join(c.replace("_", " ") for c in cats) + ".")
        g.add((s, RDFS.comment, Literal(" ".join(parts), lang="en")))
        kept += 1

    with open(OUT, "w") as f:
        f.write("# Generated by tools/vocab-sync/tools/build-bpr-vocab.py; do not edit by hand.\n")
        f.write(g.serialize(format="turtle"))
    print(f"{OUT}: {kept} data elements ({with_def} with an EU DPP Registry definition), "
          f"{slots} unit/value slots left out", file=sys.stderr)


if __name__ == "__main__":
    main()
