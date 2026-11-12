# Crosswalk: converting to and from other DPP vocabularies

OpenEPCIS DPP-Ready data, master data as well as EPCIS events with their extensions, converts into
other Digital Product Passport vocabularies and back. The converter is generic; each target
vocabulary is a **profile** of declarative rules. Interoperability is checked on every build: each
profile carries round-trip test cases whose results are committed and reviewed.

| Profile | Target | Covers today |
|---|---|---|
| [`cirpass2`](cirpass2/) | CIRPASS-2 EU DPP ontologies (EUDPP core 2.2.0, textile 1.1.2) | **EUDPP core:** product, DPP, identifiers (GTIN, GLN, LEI), actors and roles, facilities, addresses, materials, substances of concern, documents, declaration of conformity, regulations, quantities, recycled content, circularity, carbon footprint, EPD/LCIA, product events. **Assessments:** executions, tests, results, criteria (also a sector module's own), thresholds, indicators, units, EPCIS events (object and sensorReport form). **Textile:** durability, robustness, recyclability |
| [`keystone`](keystone/) | DPP Keystone v3 (`dppk:`) | the JRC robustness and recyclability scores (flat on the product), the textile footprint figures and classes, the material test certificate values |
| [`batterypass`](batterypass/) | BatteryPass-Ready data model 2.0.1 (GEFEG JSON Schemas per battery category, `vendor/batterypass-ready/2.0.1`), read as RDF with `batterypass-ready-2.0.1-context.jsonld` | the whole item passport: header (identifiers, granularity, status, schema version, economic operator, facility), identifiers and product data, performance and durability (measured values from the battery state and the performance test), carbon footprint, materials and hazardous substances, circularity and documents, due diligence, labels and conformity. Checked with the JSON Schema of the battery's category |
| [`batterypass-1.3`](batterypass-1.3/) | the older BatteryPass state: Battery Pass Consortium SAMM 1.2.x and the BatteryPass-Ready v1.3 longlist, as read through `battery-context-batterypass-bridge.jsonld` | the measured and tested battery values these documents state flat: state of health and charge, SOCE, cycles, capacity and power fade, resistance increase, throughput, round-trip efficiencies, self-discharge, temperature exposure, power capability, cycle life, thresholds, C-rate, reference test, carbon footprint class. Everything else is OpenEPCIS on both sides and travels unchanged |
| [`eu-dpp`](eu-dpp/) | EU DPP Registry semantic data artifacts 1.0.0 (the Commission's passport JSON: core, batteries, EV / LMT / industrial) | **Core:** passport identifier, unique product identifier, granularity, status, last update, content specifications, for every product passport. **Batteries:** identification, manufacturer, manufacturing place and date, category, status, chemistry, hazardous substances, critical raw materials, label symbols, weight, capacities, voltages, power limit, resistances, efficiencies, C-rates, lifetimes, cycle counts, state-of-health values, temperature range, warranty, documents. Checked with the Commission's SHACL shapes and JSON Schemas, and against its 20 conformance examples |

## Running it

```bash
pnpm run crosswalk -- --profile cirpass2 --lift  --in extensions/eu/textile/examples/garment-product.jsonld
pnpm run crosswalk -- --profile cirpass2 --lower --in their-passport.ttl --out ours.ttl
pnpm run check:crosswalk                 # the round-trip gate (part of pnpm run build)
pnpm run check:crosswalk -- --report     # … and what each module example keeps
pnpm run build:crosswalk-goldens         # regenerate the committed expectations after a rule change
pnpm run check:shapes:itb                # lowered documents through the EC validator (needs the container)
pnpm run crosswalk -- --profile eu-dpp --lift --in extensions/eu/battery/examples/battery-product.jsonld
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
  lift/entail/*.ru  SPARQL updates run first: types the input leaves implicit (EPCIS master data
                 without "type": a GS1 Digital Link of a trade item is a gs1:Product, an untyped
                 node gets the rdfs:range class of its property)
  lower/*.rq     SPARQL CONSTRUCT rules target → OpenEPCIS
  lower/reshape/*.ru  SPARQL updates run last over the output (<urn:xw:out>): turn virtual handles
                 into the OpenEPCIS structure (see below)
  tests/<case>/  ours.jsonld | ours.ttl  or  <profile>.ttl | <profile>.json, plus committed goldens:
                 the converted document, roundtrip.txt, lowered.ours.jsonld (what an OpenEPCIS
                 consumer receives), lifted.<profile>.json (what the target receives, for a
                 profile with its own JSON form)
  examples-shapes.txt  what the way back of a module example no longer satisfies (committed)
  conformance.txt  the target's own examples, lowered and lifted back (profile with "json")
```

A profile whose target ships its own JSON form, SHACL shapes and JSON Schemas (`profile.json`
`"json"` and `"targetShapes"`; `scripts/lib/crosswalk-target.ts`) is checked against them: the
context follows from the document's content specifications (EU DPP Registry) or is the profile's
own (`"context"`, BatteryPass-Ready, whose schemas publish none), the schema from the content
specifications or from a value of the document (`"schemaBy"`: the battery category), the passport
root carries the target's root type in RDF (its shapes target it) and the unique product identifier
as IRI, and the JSON the target receives is rendered from the lift output.

The engine (`scripts/lib/crosswalk.ts`, Oxigraph) loads the input into one named graph, the
background ontologies and the mapping table into two others, and runs every rule. Rules anchor on
the input graph and read hierarchy and tables from the rest. There is no per-term code: a new term
is a row in `mappings.ttl`, a new structure a rule.

Oxigraph 0.5.11 behaviours rules must respect: a decimal zero multiplied or divided by a decimal is
an evaluation error (the value silently disappears), so every unit conversion keeps zero explicitly
(or converts in `xsd:double`); a `NOT EXISTS` with a class path evaluated per row is slow, so such
tests are computed once in a subquery (`190-schema`, `195-gs1-passthrough`); an update (`entail/*.ru`)
sees no union default graph, so it names `<urn:xw:bg>` and `<urn:xw:map>`; and a literal of a derived
integer type (`xsd:positiveInteger`, `xsd:nonNegativeInteger`) comes back as `xsd:integer`, so the
engine retypes it from the mapping table (`xw:theirDatatype`, `xw:ourDatatype`), as it does for
`xsd:dateTimeStamp`. One SPARQL rule of thumb cost several bugs: a `FILTER` or `BIND` inside a `UNION`
branch sees only that branch's variables, so a value from outside the branch is joined in, not
referenced.

**Virtual handles.** A target that states a value flat (the Registry, BatteryPass: "state of health:
94 %") while OpenEPCIS states it as a result of an assessment (`eubat:hasBatteryState` →
`oea:hasResult` → observed parameter and measured value) meets it through a virtual flat handle
`<urn:xw:v:NAME>` ([`shared/battery-handles.ttl`](shared/battery-handles.ttl)). An entail update of the
lift derives the handle from the assessment, the rules address it like a property, and a reshape
update of the lower builds the assessment back from it. Handles never reach an output and do not count
as input. Profiles share these updates through `profile.json` `"updates"`.

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
4. Our own documents satisfy the SHACL shapes of the core and of each module whose namespace they
   use, as the EC validator applies them per validation type (SPARQL constraints are left to the ITB
   gate, as in `check:shapes`). What the way back no longer satisfies, because the target has no
   place for data a shape requires (CPR essential characteristics, a steel heat number), and what a
   document from the target vocabulary lacks, are part of the committed report: only a new finding
   fails. `check:shapes:itb` sends every `lowered.ours.jsonld` through the EC validator with the
   full shapes and expects exactly that: rejected where the report records findings, else accepted.
5. The target side (every lift output, and a target document written as a test case) satisfies the
   OWL and RDFS axioms of the target ontologies, read as a consumer validates data (closed world,
   `scripts/lib/owl-structure.ts`): `rdfs:domain` and `rdfs:range` (classes, datatypes, unions),
   `owl:allValuesFrom`, `someValuesFrom`, `hasValue` and the cardinalities. A finding fails the build
   unless `profile.json` (`structure.accepted`) accepts it, with the number of the gap below that
   makes it unavoidable; accepted findings are listed in each `roundtrip.txt`, and an accepted entry
   no case needs any more fails as well.
6. The OpenEPCIS side, compacted with the published contexts (`lowered.ours.jsonld`), expands to
   exactly the lowered RDF (numbers compared by value).
7. Every module example (`extensions/*/*/{examples,epcis}/*.jsonld`) goes through every profile,
   lift then lower, without error, leak, unaccepted structure finding or lossy JSON-LD; shapes its
   way back no longer satisfies are committed in `<profile>/examples-shapes.txt`. `--report` prints
   per example how many input statements come back (per term) and how many terms no rule names.
   Data an EPCIS event carries in `ilmd` or as an event extension (rather than as product master
   data) is not converted to product data.
8. For a profile with its own JSON form (`eu-dpp`, `batterypass`), every lift output (test case and module example)
   satisfies the target's SHACL shapes and, rendered as the target's JSON, its JSON Schemas, for the
   content specifications it declares. The JSON must expand back to exactly the lifted RDF and use
   no key outside the target's context. A **missing** value (`sh:minCount`, also nested; a required
   `sh:hasValue` with no value; JSON Schema `required`) is the passport's content and is listed in
   `roundtrip.txt`; any other finding is a **wrong form** and fails, unless `structure.accepted`
   names it as a defect of the target release.
9. The target's own conformance examples: our check must find no wrong form in them (so it agrees
   with the target's validator), and each passport among them is lowered to OpenEPCIS and lifted
   back; what the way back does not restore is committed in `conformance.txt`.

The test cases are written by us from the published module definitions. CIRPASS-2 publishes no
instance data; when it does, those documents become test cases as they are. The `core-*` cases
are copies of module examples (textile, electronics, construction, iron and steel, carrier
events); `cirpass2-core-in` is a passport a publisher outside OpenEPCIS would write in EUDPP terms.
What a sector module adds beyond EUDPP core (electronics BOM, construction essential
characteristics, iron and steel MTC, textile fibres and care) shows as not converted in those
cases; each sector step of the crosswalk turns those lines into rules or gaps.

## Known gaps of the CIRPASS-2 profile

What CIRPASS-2 (textile 1.1.2, EUDPP 2.2.0) has no place for, and how the profile carries it.
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

EUDPP core (items 10 to 25 are drafted for upstream in
[`../docs/upstream/cirpass2/2026-10-31-eudpp-core-gaps.md`](../docs/upstream/cirpass2/2026-10-31-eudpp-core-gaps.md)):

| # | Gap | Carried as | Round trip |
|---|---|---|---|
| 10 | The facility name is published outside the EUDPP namespace: `https://w3id.org/eudpp/facilityName`, not `…/eudpp#facilityName`. | that IRI | exact |
| 11 | An actor has no contact point (only `schema:email` and `schema:telephone`); `isEstablishedIn` points to a `dcterms:Location` without structure. | addresses with EUDPP's own `schema:address` → `schema:PostalAddress`; `schema:contactPoint` | exact; a bare `isEstablishedIn` is not converted |
| 12 | Recycled content of the product (total, pre-/post-consumer) exists only per material. | `RecycledMaterialsUseResult` per value, pre/post marked with `dcterms:type` | exact |
| 13 | Circularity indicators other than the three rates (recyclable content, MCI, utility factor). | `CircularEconomyIndicator` with `dcterms:type` | exact |
| 14 | `dppStatus` lacks draft, suspended and withdrawn. | not carried | lost for those values |
| 15 | A document's `contentType` is only "pdf" or "application". | `dcterms:format` for other media types | exact |
| 16 | No statement that a product does *not* (yet) comply with a regulation. | `dcterms:relation` to the legislation | the explicit "false" is lost |
| 17 | Carbon-footprint stages of the Battery Regulation and PEF are not EN 15804 modules. | `LCAModuleValue` with `dcterms:type`, without the required `forLifeCycleModule` (accepted structure finding) | exact |
| 18 | The country a material comes from (`MaterialOrigin` is raw/recycled/renewable). | `schema:countryOfOrigin` | exact |
| 19 | Voluntary certifications (GRS, OCS, OEKO-TEX); `ConformityCertificate` is for notified bodies. | GS1 `CertificationDetails` | exact |
| 20 | Access rights per attribute (ESPR Art. 10), repairability information, data-quality rating, EPR registration; a due-diligence report has no class. | the report as a `DocumentFormattedProperty`; the rest not carried | exact for the report, else lost |
| 21 | A DPP's content version; the product's last data update. | `schema:version`, `dcterms:modified` | exact |
| 22 | The role of a facility for the product (cut and sew, dyeing, …). | not carried in core (textile process module: textile step) | lost |
| 23 | Text is `xsd:string`: a name or description cannot carry its language (ESPR passports are multilingual). | `rdf:langString` as given (accepted structure finding) | exact |
| 24 | `RecycledMaterialsUseResult` says no `quantifiesIndicator` restriction is imposed, but inherits "exactly one EN 15804 inventory indicator"; no inventory indicator is a share of recycled content. | the result without indicator (accepted structure finding) | exact |
| 25 | Operator identifier schemes are GLN and LEI only; an EORI or a national register number has none, and an identifier requires one. A GS1 Digital Link of a GLN is that GLN. | without scheme (accepted structure finding); a Digital Link becomes the GLN | exact; a Digital Link copy of the node's own GLN is not restored |
| 26 | `derivedFrom` takes results and indicators: an indicator derived from an assessment as a whole has no link to it. | `derivedFrom` its results, `dcterms:relation` the assessment | exact |

The EUDPP `GLN` scheme is declared an actor identifier scheme only; facilities use it as well, since
EUDPP declares no facility scheme. EUDPP restates GS1's EPCIS axioms, among them the domain
`epcis:SourceOrDestination` of a source element's properties; EPCIS JSON-LD types no source element,
so the lift adds the type (and the way back drops it).

The sensorReport form of an assessment comes back in the object form: the two are equivalent by the
EPCIS binding of `common/assessment`, and the object form is the one with room for criteria and
indicators.

## The EU DPP Registry profile

The Commission's passport is one flat JSON record per product (`eu-dpp/`): every data element hangs
off the root, measured values are `{unit, value}` with one of the Registry's eleven units, code
values are full IRIs of its value lists, and the passport is split into views (pub, res1 to res3)
that the shapes and schemas name. The lift writes one record holding all views; the passport root
is the product, its IRI the unique product identifier. The rules are table-driven
(`eu-dpp/mappings.ttl`): a row per data element names our term, its form (quantity, bare number in a
fixed unit, count, text, document, URL) and, where OpenEPCIS keeps the value on a container node of
the product (technical specification, end-of-life information, performance information), the
container. Code values pair through the `skos:exactMatch` our ontologies already carry; the
chemistry list goes by the short name of the electrochemical system, countries from alpha-2 to
alpha-3, the warranty from years to months, kW to W. Data elements a subgroup excludes
(`sh:maxCount 0`: an EV passport states its state of certified energy, the others their remaining
capacity) are written only where allowed. The rows follow the Registry adjudication of 2026-11-06
recorded in the battery and core ontologies (`skos:exactMatch` to the Registry vocabularies).

Checking the target side needed three workarounds, each confined to the checker:

- **SHACL.** rdf-validate-shacl 0.6.5 evaluates `sh:and` / `sh:or` / `sh:xone` / `sh:not` of a
  property shape against the focus node instead of each value, so every `{unit, value}` of a valid
  Registry passport failed (pySHACL 0.40 accepts the Commission's examples). The shapes are
  rewritten to the equivalent form the library gets right (`sh:node` around the logical constraint,
  `sh:and` split per member). The Registry's SPARQL constraints run on Oxigraph, with the focus
  nodes worked out from targets, `sh:property`, `sh:node` and `sh:or`.
- **Contexts.** The subgroup contexts `@import` the battery context, which `@import`s the core
  context; JSON-LD 1.1 forbids an imported context to import again, so a conforming processor
  rejects every EV, LMT and industrial passport. The offline loader inlines the chain.
- **JSON.** The contexts declare no `@set`, so compaction writes a one-element list
  (`contentSpecificationIds`) as a scalar, which the JSON Schemas reject; list-valued keys are read
  from the schemas. Code values are written as full IRIs, as the Commission's own examples do.

With these, our check finds no wrong form in any of the Commission's 20 conformance examples, and
the core example comes back from OpenEPCIS unchanged.

Defects of release 1.0.0 the profile accepts (`structure.accepted`; also listed in
[`vendor/eu-dpp/README.md`](../../../../vendor/eu-dpp/README.md)):

| # | Defect | Effect on an OpenEPCIS passport |
|---|---|---|
| 1 | A language-tagged text needs a region (`en-IE`); a plain BCP 47 tag such as `en` is rejected. | Texts in `en`, `de`, … are rejected; a document language without region is left out of a resource. |
| 2 | A model identifier is accepted only together with a batch number. | An item passport with serial number but no batch cannot name its model. |

Voltages measured within a temperature range (the Registry's `valueRange`; Annex XIII 1 (h) asks
for it "when relevant") are the performance test's sub-assessments with the conditions
`eubat:LowerTemperatureBound` / `eubat:UpperTemperatureBound`, the result observing
`eubat:NominalVoltage` / `MinimumVoltage` / `MaximumVoltage` (handles in
`shared/battery-handles.ttl`); a voltage rating without conditions stays on the technical
specification and goes over without a range. The end-of-life information as text
(`wasteBatteryPreventionManagementInfo`, ten texts), the detailed composition
(`eubat:compositionDescription`), how the not-in-use temperature range was determined
(`eubat:temperatureRangeTestDescription`), the spare part replacement details (a document of type
`eubat:SparePartReplacementDocument` among `oec:hasDocuments`), the trademark (the product's
`gs1:brand`) and the power capabilities without a state of charge go both ways. The Amperia StaxWall
10 passport (`tests/amperia-stationary-item`) is complete in every view; its texts carry a region
(`en-GB`), which defect 1 otherwise demands.

What the OpenEPCIS battery model cannot hold, found by lowering the Commission's examples
(`conformance.txt`):

| Registry data element | OpenEPCIS today |
|---|---|
| `manufacturingDate` (year and month) | `gs1:productionDate` is a full date; a month is not lowered |
| `manufacturerTradeName` | no term (the trademark is the product's `gs1:brand`) |
| `complianceTestReportResults` as a document (content type, title, language) | a bare URL (`eubat:resultOfTestReport`); the Registry requires the content type |
| `roundTripEnergyEfficiency` and `remainingRoundTripEfficiency` as two values | one parameter (`eubat:RemainingRoundTripEfficiency`, adjudication of 2026-11-06); lowering keeps the remaining value, lifting writes it to both |
| `euDeclarationOfConformity` content type, title, language | `cccev:Evidence` with the URL only |
| `numberOfDischargingCycles` | only the full cycle count |
| `negativeEvents`, `cycleLifeReferenceTest` (texts) | negative events as structured events; the reference test's method name is a plain string |
| `environmentalConditionHistogramSet`, `stateOfChargeHistogram` | minutes above / below the boundary, the current state of charge |
| energy values (kWh) | the Registry has no energy unit; kWh values are not converted |

## The BatteryPass-Ready 2.0.1 profile

BatteryPass-Ready (the Battery Pass Consortium's successor project, maintained by acatech, published
by GEFEG at `git.gefeg.com/bp/BatteryPassDataModel`) states the battery passport as JSON Schema per
battery category, with no IRIs and no context. `pnpm run sync:batterypass-ready` vendors the ten
2.0.1 schemas (`vendor/batterypass-ready/2.0.1`, CC BY 4.0); `tools/vocab-sync/tools/build-bpr-vocab.py`
gives the 122 data elements OpenEPCIS-hosted IRIs (`bpr:`, `vocab/batterypass-ready-2.0.1.ttl`), and
`pnpm run build:batterypass-ready-context` the keys of the value containers (`bprx:`, unit, value, url,
name, ...), the context that reads a 2.0.1 document as RDF key by key (nested as the JSON is) and
`batterypass/structure.ttl`: where each element sits (header or one of the seven data groups) and
which categories' schemas have it.

A document is one battery item: `{dppHeader, batteryPassportData}`. The lift takes each item-level
battery that states its category (EV, LMT, stationary, other industrial) as a passport; a model or
batch passport has no 2.0.1 document. Its rules write every element flat on the root, a reshape
update nests them into header and groups and leaves out what the category's schema does not have
(an EV passport has no remaining round-trip efficiency). The lower flattens the groups into a graph
of its own and reads them back. The rows of `batterypass/mappings.ttl` follow those of `eu-dpp`:
a measured value (a quantity or a bare number in a fixed unit) becomes the 2.0.1 value container
with its unit converted (kW to W), an integer container gets the rounded value; texts, numbers,
codes, documents and URLs pair element by element. Values OpenEPCIS states as results of the battery
state or the performance test travel as the shared virtual handles.

The header follows EN 18223: the passport identifier defaults to the product identifier, the economic
operator to the operator's or manufacturer's party Digital Link (`https://id.gs1.org/417/{GLN}`), the
facility is the manufacturing place; the schema version is "2.0.1", the version the document is
written in (a battery's `schema:schemaVersion` names the data model of its OpenEPCIS source and does
not travel). A party's registered trade name is its `schema:legalName`, else its name; the third-party
service provider is the DPP service provider holding the backup copy (`oec:hasBackupCopyHost`) as its
party Digital Link, else its name. On the way down a party Digital Link gives the operator's GLN, and
an economic operator that is the manufacturer gets the role `oec:Manufacturer`.

A resource without a stated MIME type (OpenEPCIS keeps many as bare URLs) gets its `contentType` from
the URL: the file extension (pdf, html, json, jsonld, xml, svg, png, jpg), and a URL without one is a
web page (`text/html`). The sources of spare parts are the website of a spare-part source (or of its
supplier contact); the information on accidents is the incident report of the latest accident among
the negative events; the temperature information is the battery state result
`eubat:BatteryTemperature`.

What does not convert, and why (each listed in the cases' `roundtrip.txt`):

| 2.0.1 data element | OpenEPCIS today |
|---|---|
| `contentType` of a bare URL with an extension outside the list above | left out (reported missing); on the way back a bare URL keeps no media type |
| `numberOfOverchargeEvents` | no term (negative events are structured; overcharge is one of their types, not a counter) |
| `informationOnAccidents` for a battery without an accident | nothing to link: OpenEPCIS states accidents as negative events with an incident report |
| `agentFireClass` of the extinguishing agent | the agent as a text only |
| `materialsUsedInCathodeAnodeAndElectrolyte`, `meaningOfLabelsAndSymbols` | written from the active materials and electrolyte and from the label meanings; one list or text in 2.0.1, so not split again on the way back |
| `remainingPowerCapability`, `originalPowerCapability` | values per state of charge; only 80 % and 20 % have a place |
| internal resistance (cell, module, pack) in whole ohms | values below 0.5 Ω are not representable and stay out (2.0.1 types them as integers) |
| percentages | whole percent (2.0.1 types them as integers) |
| category "industrial battery without BMS" | OpenEPCIS states no battery management system: lowers to `eubat:IndustrialBattery`, lifts back as other industrial |
| OpenEPCIS values 2.0.1 dropped from v1.3 (energy and capacity throughput, time in extreme temperatures, state of health) | not converted; the `batterypass-1.3` profile keeps them |

`pnpm run export:batterypass-ready -- <passport.jsonld>` writes the 2.0.1 document of a passport and
lists the required values it lacks; `pnpm test` checks the exports of the battery examples against
their category schemas.

## Adding a profile

1. Create `<profile>/profile.json` and `mappings.ttl`; copy `keystone/` as the smallest example.
2. Write test cases first: an OpenEPCIS document and a document in the target vocabulary.
3. Write rules until `pnpm run build:crosswalk-goldens` produces goldens you agree with, then read
   each `roundtrip.txt`: every line is either a rule to fix or a gap to document here.
