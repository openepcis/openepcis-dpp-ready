# Crosswalk: converting to and from other DPP vocabularies

OpenEPCIS DPP-Ready data, master data as well as EPCIS events with their extensions, converts into
other Digital Product Passport vocabularies and back. The converter is generic; each target
vocabulary is a **profile** of declarative rules. Interoperability is checked on every build: each
profile carries round-trip test cases whose results are committed and reviewed.

| Profile | Target | Covers today |
|---|---|---|
| [`cirpass2`](cirpass2/) | CIRPASS-2 EU DPP ontologies (EUDPP core 2.1.0, textile 1.1.2) | assessments, tests, results, criteria, thresholds, indicators, units, EPCIS events (object and sensorReport form), textile durability, robustness, recyclability |
| [`keystone`](keystone/) | DPP Keystone v2 (`dppk:`) | the JRC robustness and recyclability scores (flat on the product) |

BatteryPass follows once the battery module is on the assessment model.

## Running it

```bash
pnpm run crosswalk -- --profile cirpass2 --lift  --in extensions/eu/textile/examples/garment-product.jsonld
pnpm run crosswalk -- --profile cirpass2 --lower --in their-passport.ttl --out ours.ttl
pnpm run check:crosswalk                 # the round-trip gate (part of pnpm run build)
pnpm run build:crosswalk-goldens         # regenerate the committed expectations after a rule change
```

`--lift` goes from OpenEPCIS to the target, `--lower` from the target to OpenEPCIS. Input is JSON-LD
(passport, EPCIS document) or Turtle. The report on stderr says how many triples each rule produced
and lists every input term no rule handles: what is not converted is never dropped silently.
`--query rule.rq` runs a SPARQL query against the store the rules see, for debugging.

## How a profile works

```
<profile>/
  profile.json   prefixes, background ontologies per direction, handled terms,
                 output vocabulary per direction, SHACL shapes for the OpenEPCIS side
  mappings.ttl   pairing tables: classes, codes, parameters, units (no ontology)
  lift/*.rq      SPARQL CONSTRUCT rules OpenEPCIS → target, run in file order
  lower/*.rq     SPARQL CONSTRUCT rules target → OpenEPCIS
  tests/<case>/  ours.jsonld | ours.ttl  or  <profile>.ttl, plus committed goldens
```

The engine (`scripts/lib/crosswalk.ts`, Oxigraph) loads the input into one named graph, the
background ontologies and the mapping table into two others, and runs every rule. Rules anchor on
the input graph and read hierarchy and tables from the rest. There is no per-term code: a new term
is a row in `mappings.ttl`, a new structure a rule.

Principles every profile follows:

- **Codes pair one to one.** Outcomes, comparison operators, criteria and labels map to the target's
  code values in both directions (`xw:sameCode`).
- **Definitions keep their IRI.** Methods, standards and performance parameters of OpenEPCIS appear in
  the target output under their own IRI, typed with the target's class (`xw:liftType`). The way back
  is then exact. A target node of such a class without an OpenEPCIS IRI lowers to the canonical
  partner (`xw:lowerTo`) or is adopted as it is.
- **Data nodes keep their identity**, IRI or blank node.
- **What the target cannot say travels in standard vocabulary, never in ours.** Examples are
  `dcterms:subject` or `rdf:value`. The output of a lift uses only the target's terms and W3C, GS1 and
  EPCIS terms, and the gate fails on any other predicate or class.

## What the gate checks

For every test case, in both directions:

1. The converted document equals its committed golden (`expected.<profile>.ttl` / `expected.ours.ttl`,
   compared as canonical RDF).
2. The way back is compared with the input per term. The difference is committed in `roundtrip.txt`;
   a new difference fails the build until it is reviewed and regenerated.
3. No output uses a predicate or class outside its direction's vocabulary.
4. The OpenEPCIS side, meaning the input of a lift, the output of a lower and the lowered round trip,
   satisfies the SHACL shapes of the assessment and textile modules.

The test cases are written by us from the published module definitions. CIRPASS-2 publishes no
instance data; when it does, those documents become test cases as they are.

## Known gaps of the CIRPASS-2 profile

What CIRPASS-2 (textile 1.1.2, EUDPP 2.1.0) has no place for, and how the profile carries it.
Items 1 to 6 are proposed upstream in
[`../docs/upstream/cirpass2/2026-10-31-assessment-gaps.md`](../docs/upstream/cirpass2/2026-10-31-assessment-gaps.md).

| # | Gap | Carried as | Round trip |
|---|---|---|---|
| 1 | A result does not name the parameter it measures; only the execution does. | `dcterms:subject` on the result | exact |
| 2 | No link from an assessment execution to the product event that records it. | `dcterms:relation` to the `eudpp:ProductEvent` | exact |
| 3 | A condition has no kind and no value. | `dcterms:type`, `rdf:value`, `rdfs:comment` | exact |
| 4 | Points a scoring method awards per result have no slot. | a `PerformanceIndicator` derived from the result, `dcterms:type oea:awardedScore` | exact |
| 5 | No overall verdict of an assessment (recyclable or not). | not carried | lost |
| 6 | An execution has no time; only the EPCIS event has one. | the event record | exact when an event exists |
| 7 | No percent and no year in the SI Digital Framework. | percent as `units:one` × 0.01; year as the UN/CEFACT code IRI | exact |
| 8 | A publisher's own method keeps its CIRPASS-2 subclass (scoring method) only as `oea:AssessmentMethod`. | not carried | lost |

The sensorReport form of an assessment comes back in the object form: the two are equivalent by the
EPCIS binding of `common/assessment`, and the object form is the one with room for criteria and
indicators.

## Adding a profile

1. Create `<profile>/profile.json` and `mappings.ttl`; copy `keystone/` as the smallest example.
2. Write test cases first: an OpenEPCIS document and a document in the target vocabulary.
3. Write rules until `pnpm run build:crosswalk-goldens` produces goldens you agree with, then read
   each `roundtrip.txt`: every line is either a rule to fix or a gap to document here.
