# Crosswalk: converting to and from other DPP vocabularies

OpenEPCIS DPP-Ready data, master data as well as EPCIS events with their extensions, converts into
other Digital Product Passport vocabularies and back. The converter is generic; each target
vocabulary is a **profile** of declarative rules. Interoperability is checked on every build: each
profile carries round-trip test cases whose results are committed and reviewed.

| Profile | Target | Covers today |
|---|---|---|
| [`cirpass2`](cirpass2/) | CIRPASS-2 EU DPP ontologies (EUDPP core 2.1.0, textile 1.1.2) | **EUDPP core:** product, DPP, identifiers (GTIN, GLN, LEI), actors and roles, facilities, addresses, materials, substances of concern, documents, declaration of conformity, regulations, quantities, recycled content, circularity, carbon footprint, EPD/LCIA, product events. **Assessments:** executions, tests, results, criteria (also a sector module's own), thresholds, indicators, units, EPCIS events (object and sensorReport form). **Textile:** durability, robustness, recyclability |
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
and lists every input term no rule or mapping row names: what is not converted is never dropped
silently.
`--query rule.rq` runs a SPARQL query against the store the rules see, for debugging.

## How a profile works

```
<profile>/
  profile.json   prefixes, background ontologies per direction ("@modules" = every OpenEPCIS
                 module ontology; JSON-LD files such as the vendored GS1 Web Vocabulary allowed),
                 namespaces that travel as they are, output vocabulary per direction, SHACL shapes
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
- **GS1 and schema.org travel as they are.** Both sides use them: statements CIRPASS-2 has no term
  for but the GS1 Web Vocabulary does (certifications, warranties, prices, packaging) pass through
  unchanged from a converted node; schema.org statements always do. Addresses and contact points,
  which EUDPP leaves unstructured, are schema.org.
- **A class the target lacks travels as `dcterms:type`.** A product that is `gs1:Clothing`, an operator
  that is `oec:OperatorInformation`, a sector assessment such as `euelec:RepairabilityIndex`: the
  target class is the nearest CIRPASS-2 class, and `dcterms:type` names the original, so the way
  back restores it (and, for an assessment, its entry property from the ontology).
- **Structure follows the target.** Passport data sits on the product in OpenEPCIS and on a DPP node
  in EUDPP (`<product>#dpp`); a carbon footprint stated on the product gets a study of its own
  (`<product>#lca-study`); values held by a container without a CIRPASS-2 class (circularity,
  recycled content) become quantitative properties that are `dcterms:isPartOf` the container.

## What the gate checks

For every test case, in both directions:

1. The converted document equals its committed golden (`expected.<profile>.ttl` / `expected.ours.ttl`,
   compared as canonical RDF).
2. The way back is compared with the input per term. The difference is committed in `roundtrip.txt`;
   a new difference fails the build until it is reviewed and regenerated.
3. No output uses a predicate or class outside its direction's vocabulary.
4. Our own documents and their lowered round trip satisfy the SHACL shapes of the core, assessment
   and textile modules (SPARQL constraints are left to the ITB gate, as in `check:shapes`). A document
   from the target vocabulary may lack what OpenEPCIS requires, such as a facility name EUDPP has no
   term for: its findings are part of the committed report, so only a new one fails.

The test cases are written by us from the published module definitions. CIRPASS-2 publishes no
instance data; when it does, those documents become test cases as they are. The `core-*` cases
are copies of module examples (textile, electronics, construction, iron and steel, carrier
events); `cirpass2-core-in` is a passport a publisher outside OpenEPCIS would write in EUDPP terms.
What a sector module adds beyond EUDPP core (electronics BOM, construction essential
characteristics, iron and steel MTC, textile fibres and care) shows as not converted in those
cases; each sector step of the crosswalk turns those lines into rules or gaps.

## Known gaps of the CIRPASS-2 profile

What CIRPASS-2 (textile 1.1.2, EUDPP 2.1.0) has no place for, and how the profile carries it.
Items 1 to 6 (assessments) are filed upstream as [CIRPASS-2/ontologies-docs#3](https://github.com/CIRPASS-2/ontologies-docs/issues/3), text in
[`../docs/upstream/cirpass2/2026-10-31-assessment-gaps.md`](../docs/upstream/cirpass2/2026-10-31-assessment-gaps.md).

| # | Gap | Carried as | Round trip |
|---|---|---|---|
| 1 | A result does not name the parameter it measures; only the execution does. | `dcterms:subject` on the result | exact |
| 2 | No link from an assessment execution to the product event that records it. | `dcterms:relation` to the `eudpp:ProductEvent` | exact |
| 3 | A condition has no kind and no value. | `dcterms:type`, `rdf:value`, `rdfs:comment` | exact |
| 4 | Points a scoring method awards per result have no slot. | a `PerformanceIndicator` derived from the result, `dcterms:type oea:awardedScore` | exact |
| 5 | No overall verdict of an assessment (recyclable or not). | not carried | lost |
| 6 | An execution has no time; only the EPCIS event has one. | the event record; without an event, `dcterms:date` | exact |
| 7 | No percent and no year in the SI Digital Framework. | percent as `units:one` × 0.01; year as the UN/CEFACT code IRI | exact |
| 8 | A publisher's own method keeps its CIRPASS-2 subclass (scoring method) only as `oea:AssessmentMethod`. | not carried | lost |
| 9 | A criterion result outside recyclability has no outcome slot. | the result and its criterion, without outcome | outcome lost |

EUDPP core (items 10 to 22 are drafted for upstream in
[`../docs/upstream/cirpass2/2026-10-31-eudpp-core-gaps.md`](../docs/upstream/cirpass2/2026-10-31-eudpp-core-gaps.md)):

| # | Gap | Carried as | Round trip |
|---|---|---|---|
| 10 | A facility has no name and no address, only an identifier. | `schema:name`, `schema:address` | exact; a CIRPASS-2 facility cannot satisfy our required name |
| 11 | `isEstablishedIn` points to a `dcterms:Location` without structure; an actor has no contact point. | `schema:PostalAddress` on the location, `schema:contactPoint` | exact |
| 12 | Recycled content of the product (total, pre-/post-consumer) exists only per material. | `RecycledMaterialsUseResult` per value, pre/post marked with `dcterms:type` | exact |
| 13 | Circularity indicators other than the three rates (recyclable content, MCI, utility factor). | `CircularEconomyIndicator` with `dcterms:type` | exact |
| 14 | `dppStatus` lacks draft, suspended and withdrawn. | not carried | lost for those values |
| 15 | A document's `contentType` is only "pdf" or "application". | `dcterms:format` for other media types | exact |
| 16 | No statement that a product does *not* (yet) comply with a regulation. | `dcterms:relation` to the legislation | the explicit "false" is lost |
| 17 | Carbon-footprint stages of the Battery Regulation and PEF are not EN 15804 modules. | `LCAModuleValue` with `dcterms:type` | exact |
| 18 | The country a material comes from (`MaterialOrigin` is raw/recycled/renewable). | `schema:countryOfOrigin` | exact |
| 19 | Voluntary certifications (GRS, OCS, OEKO-TEX); `ConformityCertificate` is for notified bodies. | GS1 `CertificationDetails` | exact |
| 20 | Access rights per attribute (ESPR Art. 10), repairability information, data-quality rating, EPR registration; a due-diligence report has no class. | the report as a `DocumentFormattedProperty`; the rest not carried | exact for the report, else lost |
| 21 | A DPP's content version; the product's last data update. | `schema:version`, `dcterms:modified` | exact |
| 22 | The role of a facility for the product (cut and sew, dyeing, …). | not carried in core (textile process module: textile step) | lost |

The EUDPP `GLN` scheme is declared an actor identifier scheme only; facilities use it as well, since
EUDPP declares no facility scheme.

The sensorReport form of an assessment comes back in the object form: the two are equivalent by the
EPCIS binding of `common/assessment`, and the object form is the one with room for criteria and
indicators.

## Adding a profile

1. Create `<profile>/profile.json` and `mappings.ttl`; copy `keystone/` as the smallest example.
2. Write test cases first: an OpenEPCIS document and a document in the target vocabulary.
3. Write rules until `pnpm run build:crosswalk-goldens` produces goldens you agree with, then read
   each `roundtrip.txt`: every line is either a rule to fix or a gap to document here.
