# GITB conformance testing

How a third party proves that a Digital Product Passport conforms to OpenEPCIS
DPP-Ready, using the conformance-testing infrastructure the European Commission
already operates: the [EU Interoperability Test Bed](https://www.itb.ec.europa.eu/)
(ITB) with its off-the-shelf validators and GITB TDL test suites.

This is the executable counterpart to
[`extensions/common/interop/docs/CEN_JTC24_CONFORMANCE.md`](../extensions/common/interop/docs/CEN_JTC24_CONFORMANCE.md),
which maps the CEN/CENELEC JTC 24 clauses by hand. That document states what the
project claims; this one is how the claim is checked.

Terminology follows the same distinction: **compliance** is meeting a regulatory
requirement (ESPR, the Battery Regulation), **conformance** is adhering to a
published specification. Everything here is about conformance.

---

## The model

| GITB concept | Here |
|---|---|
| Domain (Test Bed) | `openepcis-dpp` — OpenEPCIS DPP-Ready |
| Specification | one per regulation module, plus the cross-cutting core |
| Actor | `DPPDataProvider`, role `SUT` — the economic operator or solution provider under test |
| Validation type | the identifier a validator request carries, e.g. `eu.battery.item` |
| Test suite | `gitb/test-suites/openepcis-dpp` |
| Domain (validator) | `openepcis` — the path segment of every validator URL |

The two "domains" are different things and the names differ on purpose. The
**Test Bed domain** groups specifications, actors and test suites inside a
community. The **validator domain** is one directory of shapes served by an RDF
validator, addressed as `/shacl/openepcis/upload` and
`/shacl/soap/openepcis/validation?wsdl` — the same name locally and on the shared
Test Bed, which is what lets a suite move between them by address alone.

A conformance statement therefore reads: *system X conforms to OpenEPCIS
DPP-Ready / EU Battery*.

### Validation types

Sixteen, generated from the module registry in
[`scripts/lib/modules.ts`](../scripts/lib/modules.ts). Type ids are part of the
published contract — renaming one invalidates every conformance statement recorded
against it.

| Type | Covers |
|---|---|
| `dpp.core` | the cross-cutting ESPR core (`oec:`) |
| `eu.battery`, `eu.textile`, `eu.electronics`, `eu.detergent`, `eu.eudr`, `eu.ppwr`, `eu.cpr`, `eu.iron-steel`, `us.fsma204` | one regulation module each, core included |
| `eu.battery.model`, `.batch`, `.item` | EN 18223 granularity, where obligations differ by level |
| `eu.battery.ev`, `.lmt`, `.industrial` | EC battery-passport guidance coverage per category |

Every regulation type bundles `dpp-core-shapes.ttl` as well, because `oec:` is
cross-cutting: a battery passport must satisfy the core constraints too.

Granularity and category variants exist only where the shapes genuinely differ.
Declaring three levels for every module would triple the type count while
validating exactly the same thing, and `config.properties` would stop meaning
anything. Battery is currently the only module whose obligations vary by level —
a model passport has no serial number, and a batch or item passport resolves the
model- and party-level identifiers up the Digital Link hierarchy instead of
restating them.

### Severity policy

`sh:Violation` fails a test. `sh:Warning` and `sh:Info` are reported and tolerated:
the generated EC readiness shapes use them deliberately for conditional and
optional data points, so a gate that failed on them could never go green.

This is why the report's `conforms` is not
`sh:ValidationReport/sh:conforms` — that is false as soon as any result exists.

### Relationship to the ESPR Article 9 access tiers

None, deliberately. The access tiers in `*-access-levels.ttl` decide **who may see
a field**; the shapes decide **whether the field is well-formed**. The access-level
sidecars are therefore not bundled into the validator: they would enlarge every
bundle without changing a single verdict.

---

## Artifacts

Everything under `gitb/` is generated. Two drift gates run in `pnpm run build`,
so a committed bundle or suite cannot fall behind the ontologies:

```
gitb/
├── validator-resources/
│   ├── shacl/openepcis/      config.properties + shapes/<type>/{shapes,background}.ttl
│   └── json/openepcis/       (empty — see "The JSON domain" below)
├── test-suites/openepcis-dpp/
│   ├── testSuite.xml
│   ├── testCases/tc-{upload,selftest}-<type>.xml
│   └── resources/{fixtures,negative}/<type>/*.nq
└── docker/                   docker-compose.{validators,itb}.yml
```

| Regenerate | Check for drift |
|---|---|
| `pnpm run build:gitb` | `pnpm run check:gitb` |
| `pnpm run build:gitb-testsuite` | `pnpm run check:gitb-testsuite` |

### Where the validator runs

The European Commission hosts the validator on the **shared Interoperability
Test Bed** as the `openepcis` domain, live since 2026-09-25 at
<https://www.itb.ec.europa.eu/shacl/openepcis/upload>. The shared instance builds
nothing and runs no service of ours: it watches one public repository per hosted
validator and re-reads it on push, which a webhook on the mirror repository
triggers.

```
gitb/validator-resources/shacl/openepcis/   ──►   github.com/openepcis/validator-resources-openepcis
  config.properties                                 resources/config.properties
  shapes/<type>/*.ttl                               resources/shapes/<type>/*.ttl
                                                    README.md, LICENSE
```

That repository is a **mirror**, written by `pnpm run publish:validator-resources`
from the generated bundle — the domain directory flattened into `resources/`,
which is the layout the ITB expects (as in
[`ISAITB/validator-resources-rdf-sample`](https://github.com/ISAITB/validator-resources-rdf-sample)).
It is not a second source: an edit made there is overwritten by the next sync.

### The community on the shared Test Bed

Live since 2026-10-05. The European Commission created the community, the domain
and the administrator account; everything inside it is ours, and
`pnpm run provision:itb` builds it from the shipping validator configuration:

| | |
|---|---|
| Community | OpenEPCIS community |
| Domain | `openepcis-dpp` |
| Specifications | 16, one per validation type |
| Actor | `DPPDataProvider` under each, marked default |
| Test suite | one **shared** suite, 32 test cases, linked to all 16 |
| System under test | OpenEPCIS / Reference passports, 16 conformance statements |

`--run` then executes the 16 self-tests through the hosted validator. All 16 came
back SUCCESS on the first full run, which is the end of the chain the project has
been building toward: their engine, their network, our shapes, our passports.

Three things cost real time to discover, so they are worth stating plainly.

**The API key header must be written with hyphens.** It is documented as
`ITB_API_KEY`, and that works against a local instance. The shared Test Bed sits
behind a proxy that drops headers containing underscores, so the call comes back
`{"error_code":"204","error_description":"Needs API key header."}` while sending
the header. That error reads exactly like an API that is switched off, and we
concluded for two days that the automation API was unavailable to us.
`ITB-API-KEY` passes through both instances.

**Three keys, and the 403s point elsewhere.** Specifications, actors, shared test
suites, organisations and systems take the *community* key. Conformance
statements and test sessions take the *organisation* key. Domains and communities
themselves take the *master* key, which only the Test Bed operator holds, which is
why those two come from the onboarding rather than from us. Using the master key
for a specification answers "You are not allowed to manage specifications through
the automation API", which sounds like a missing feature rather than the wrong
credential.

**One switch has no API.** Conformance statements additionally require *Manage
test sessions via REST API* under Community details, User permissions. Until it is
ticked every statement fails with "You are not allowed to manage test sessions
through the automation API". The provisioning script detects that message and says
so.

The keys live in the Test Bed UI, on the domain and community detail forms, and
belong in the password manager. Nothing in this repository contains one.

Three consequences of hosting on the shared instance rather than our own:

- **Only validator configuration is hosted.** Custom extension services — bespoke
  processing or messaging handlers a test case might call — have to run
  elsewhere and be reached remotely. The suite needs none: every `verify` step
  calls the RDF validator's own GITB validation service, and the upload step is
  the Test Bed's built-in `interact`.
- **Office hours, no SLA.** The shared instance runs Monday to Friday, 05:00 to
  20:00 CET. Nothing in `pnpm run build` depends on it; the parity gate runs the
  same `isaitb/shacl-validator` image locally.
- **EU Login with 2FA** guards the Test Bed UI, so a party running conformance
  sessions needs an EU Login account. The validator itself — web form, REST,
  SOAP — stays public.

---

## Three things a hosted validator cannot do

Each of these was measured against `isaitb/shacl-validator`, not assumed. They are
the reason the bundle is generated rather than copied.

### 1. It does not apply RDFS entailment

The module ontologies specialise core properties with `rdfs:subPropertyOf`
(`euelec:weeeRegistrationNumber` → `oec:eprRegistrationNumber`,
`eubat:hasOperatorInformation` → `oec:hasOperatorInformation`, …) and the core
shapes state the obligation on the superproperty. Nothing in the delivery chain
applies that.

Measured: a shapes graph carrying the axiom, with an instance stating only the
subproperty, comes back `sh:conforms false`. `mergeModels` — which the validator
does by default — brings the axiom into the data graph but does not apply it, and
`DomainConfig` exposes no reasoner setting.

So [`scripts/lib/subproperty-expansion.ts`](../scripts/lib/subproperty-expansion.ts)
rewrites the bundle into plain SHACL Core:

```
sh:path P              ->  sh:path [ sh:alternativePath ( P S1 … Sn ) ]
sh:targetSubjectsOf P  ->  … plus one value per subproperty
sh:targetObjectsOf P   ->  … plus one value per subproperty
```

Paths are widened so a specialisation can satisfy the obligation; targets are
extended so a shape aimed at the generic property still reaches nodes linked by
the specialised one. The authored shapes stay layer-clean; the published bundle
needs no reasoner.

### 2. It cannot flip `sh:deactivated` at request time

The granularity and EC-category shapes ship deactivated and one set is activated
per validation type. A hosted validator has no way to do that per request, so the
generator emits one pre-activated copy per type.

### 3. It needs the class hierarchy in the data graph

`sh:class`, and the subclass resolution behind `sh:targetClass`, are evaluated over
the data graph. The class hierarchy and the code-list individuals live in the
ontology, so each bundle ships `background.ttl`; the validator merges the shape
graph into the input before validating, which is what carries them across.

Without it the shapes are vacuous in one direction and wrong in the other: a shape
targeting `gs1:PackagingDetails` never fires on a `euppwr:Packaging` instance, and
`sh:class eutex:CareSymbolCode` rejects the very individuals the ontology defines.

---

## Two engines, one verdict

| Gate | Engine | Runs where | Covers |
|---|---|---|---|
| `pnpm run check:shapes` | `rdf-validate-shacl`, in-process | `pnpm run build`, offline | every shape over every example |
| `pnpm run check:shapes:itb` | `isaitb/shacl-validator` (Apache Jena) | CI + on demand, needs a container | the same, plus `sh:sparql`, plus every test-suite fixture |

They do not agree for free, and the differences are the point:

- **`rdf-validate-shacl` has no SHACL-SPARQL.** It does not ignore `sh:sparql`; it
  throws as soon as such a shape reaches a matching node. The offline gate strips
  those constraints and *prints how many* it gave up, so the gap stays visible.
  `dpp-sh:GranularityDigitalLinkConstraint` is consequently enforced only by the
  parity gate.
- **The entailment is expressed twice** — materialised at runtime offline,
  rewritten to `sh:alternativePath` in the bundle. The parity gate is what proves
  the two mechanisms keep giving the same answer.

The parity gate sends **pre-expanded N-Quads**, not JSON-LD. Sending JSON-LD makes
the validator resolve each `@context` from `ref.openepcis.org`, i.e. from the last
deployed revision — the first parity run failed on 16 examples purely because the
working tree had corrected the `anyURI` coercions while the deployed contexts had
not. That is deployment skew, not an engine disagreement, and a gate that conflates
the two is useless for both. Context resolution is covered by
`pnpm run validate:examples` and `pnpm run check:operational` instead.

**Consequence for a real submission:** the upload test cases *do* take JSON-LD,
because a third party's passport must reference the published contexts. Until
`ref.openepcis.org` serves the current contexts, an uploaded passport will show the
`anyURI` findings that the parity gate does not. Redeploying the contexts is a
precondition for submitting the suite.

---

## Why the self-tests exist

Each specification has two test cases:

- `tc-upload-<type>` — the conformance test proper. The system under test uploads
  its passport as JSON-LD and it is validated against the published shapes.
- `tc-selftest-<type>` — no interaction. Asserts that the reference passports
  OpenEPCIS publishes **pass**, and that a deliberately broken variant **fails**
  (via `verify/@invert="true"`).

The second half is not decoration. A suite that only ever validates correct
documents would look identical if the shapes were empty. The negative fixtures are
**derived** from the positive ones by one documented, minimal mutation, so they
cannot drift from the examples they mutate:

| Mutation | Rejected by |
|---|---|
| `granularity-mismatch` | `dpp-sh:GranularityDigitalLinkConstraint` — also proves the engine evaluates `sh:sparql` |
| `missing-operator-role` | `dpp-sh:EconomicOperatorRoleRequired` |
| `out-of-range-fraction` | the 0..1 value-range constraint on the property |
| `missing-required-property` | whichever `sh:minCount` the module's own shapes declare — read from the shapes, so it needs no curation |

`pnpm run check:shapes:itb` verifies all 73 fixtures in both directions. If an
upstream change makes a mutation stop violating, that gate fails loudly rather
than the suite quietly asserting nothing.

---

## External models

Besides its own modules, the validator hosts the external DPP models this project bridges, each
at a pinned release, so that a passport can be checked against them without a login or a
publisher-run service, and so that our own conformance to them is on record.

| Model | Release | Artifacts | Types |
|---|---|---|---|
| EU DPP Registry semantic data artifacts | 1.0.0 (European Commission, archive SHA-256 pinned) | SHACL shapes and JSON Schemas per view (pub, res1 to res3), core, batteries, subgroups EV / industrial / LMT | `x.eu-dpp-1.0.0.<core\|batteries\|evb\|ind\|lmt>[.<view>]`, SHACL + JSON |
| BatteryPass-Ready data model | 2.0.1 (GEFEG repository, commit pinned) | JSON Schema per battery category, full and February 2027 requirements | `x.bpr-2.0.1.<category>[.feb27]`, JSON |
| BatteryPass-Ready upload format | 1.3, **derived** by OpenEPCIS from the live GEFEG validator (2026-06-17); GEFEG's published static files require nothing | JSON Schema per category (`extensions/eu/battery/validation/gefeg-live`) | `x.bpr-1.3.<category>`, JSON |
| DPP Keystone | v3 (dpp-keystone.org, repository commit and file SHA-256 pinned) | core and conditional sector JSON Schemas; SHACL generated from the ontology | `x.keystone-v3.dpp`, SHACL + JSON |
| GS1 EPCIS / CBV | 2.0.1 (ref.gs1.org; examples from gs1/EPCIS, commit pinned) | JSON Schema, SHACL, EPCIS and CBV ontologies | `x.epcis-2.0.1.document`, SHACL + JSON |
| CIRPASS-2 Textile | 2.0.0 (ontologies-docs publication package, commit pinned) | three shapes graphs over the ontology modules and MIREOT extracts; the package's SHACL test corpus | `x.cirpass2-textile-2.0.0.product`, SHACL |
| CIRPASS-2 Battery | shapes 0.3.0 / ontology 0.4.0, **draft** (ontologies-battery, commit pinned) | profile and three access views, over the ontology modules and CIRPASS-2 CORE 2.2.0 | `x.cirpass2-battery-0.3.0.<profile\|view-*>`, SHACL |
| Battery Pass Consortium data model (SAMM) | 1.2 (Performance 1.2.1; commit pinned) | generated JSON Schema (draft-04) per aspect | `x.batterypass-samm-1.2.<aspect>`, JSON |
| Catena-X battery pass (SAMM) | 6.1.0 (sldt-semantic-models, commit pinned) | generated JSON Schema (draft-04) | `x.catenax-battery-pass-6.1.0.battery-pass`, JSON |
| UN Transparency Protocol | 0.8.0 (newest published artefacts) and 0.7.0 (last reviewed release), side by side | JSON Schema per credential (DPP, DCC, DFR, DIA, DTE) | `x.untp-<version>.<credential>`, JSON |

- **A target is one file**, `extensions/common/interop/targets/<model>/<version>/target.json`: the
  vendored artifacts (`vendor/…/MANIFEST.json`, written by the model's sync script with the SHA-256
  of every file), the crosswalk profile that knows how a document of the model is read, the
  fixtures, and the deviations a defect of the release makes unavoidable, each with its reason.
  `scripts/lib/targets.ts` derives the validation types from it.
- **The type id carries the release** (`x.<model>-<version>.<scope>`), and every report names it
  again: `validator.report.profileId.<type>` is the model and release, `customisationId` its pin,
  `validationServiceVersion` our release. A new release of a model is a new target directory and
  new types; the old ones stay until removed on purpose.
- **The publisher's artifacts are bundled byte for byte** under `artifacts/<model>-<version>/` of
  either domain, after their SHA-256 is checked against the manifest. OpenEPCIS adds one presence
  shape per SHACL type (the input must contain the model's root class; without it a graph with
  nothing in it passes the publisher's shapes) and nothing else. The JSON domain registers the
  model's schemas by `$id` (`validator.referencedSchemas`): the Registry's host does not resolve.
- **A type is declared only when it is faithful**: it rejects `{"this":"is not a passport"}` (or a
  graph without the root class), and accepts every example the publisher ships for it. All 29
  Registry examples and the GEFEG example pass their types.
- **The Registry's restricted views (res1 to res3) carry no header**: the Commission's examples for
  them hold the restricted fields alone, so the header shapes and schema (`core-shapes.ttl`,
  `core.schema.json`) belong to the public view only (`publicOnly` in the target).
- **Shapes in JSON-LD are loaded as Turtle.** Keystone publishes its shapes as JSON-LD whose
  `@graph` carries an `@id`, a named graph. The validator reads a shapes file into one graph and
  drops it: measured, the type then passed a document with a retyped property. The bundle keeps the
  original and loads the same triples as Turtle beside it.
- **What the publishers ship is held to what they say.** A test corpus with expected failures
  (CIRPASS-2 textile, the battery views) is replayed as such: a case the publisher expects to fail
  must fail. A publisher example that breaks its own schema is left out with the reason (the Battery
  Pass Consortium's material composition payload: a CAS number with a trailing space); one whose
  RDF a JSON-LD 1.1 processor rejects is checked by JSON Schema only (three GS1 EPCIS examples
  redefine protected context terms; two untyped Keystone examples).
- **Declared entailment is applied.** Shapes that state `sh:entailment` RDFS (CIRPASS-2 textile
  recyclability) are evaluated over the RDFS closure, as the Test Bed's Jena does; the local check
  reproduces it. `owl:imports` in a publisher's shapes are skipped (`validator.owlImportSkippedUris`):
  the type bundles what they name. SAMM tooling writes some files in UTF-16; they are bundled as UTF-8,
  the same characters, and their draft-04 schemas are checked with ajv's draft-04 dialect.
- **Our EPCIS examples conform to GS1 EPCIS 2.0.1** since this target: editorial notes are
  `rdfs:comment` (the EPCIS context defines the prefix; an unprefixed key is not an allowed extension),
  CBV values are the bare 2.0 JSON form (`owning_party`, not `urn:epcglobal:cbv:sdt:owning_party`),
  sensor values are numbers.
- **The publisher's shapes are proven live**, not only the presence shape: per SHACL type a valid
  publisher example with one root property retyped (or a required one dropped) must be rejected by
  the hosted validator and the local engines alike (`check:shapes:itb`, and a negative step in the
  self-test).
- **Two engines, one verdict, again**: `pnpm run check:shapes:itb` sends every fixture of a SHACL
  type through `isaitb/shacl-validator` and compares with the local engines (rdf-validate-shacl,
  `sh:sparql` on oxigraph); `pnpm run check:json-itb` does the same for the JSON types against
  `isaitb/json-validator` and ajv.

**Our conformance to each release** is `docs/conformance/INTEROP_CONFORMANCE.md` (and `.json`),
regenerated by `pnpm run build:interop-conformance` and gated in `pnpm run build`: per target the
pin and licence, the types, and the verdict on every fixture, sorted by where it comes from (the
publisher's example, our crosswalk's output for an OpenEPCIS passport, or a publisher's document
taken in and lifted back). The gate fails on drift, on a publisher example a type rejects, on any
wrong form in our output, and on an accepted deviation no document needs any more.

Per target and release there is a test suite, `gitb/test-suites/interop-<model>-<version>/`
(`pnpm run build:gitb-testsuite`): upload cases (JSON and RDF), a self-test per type (the
publisher's examples pass, a non-document fails) and a bridge case per type with the crosswalk
output the hosted type accepts. RDF fixtures are pre-expanded N-Quads: the Registry's contexts do
not resolve, BatteryPass-Ready publishes none.

Locally, without a validator: `pnpm run validate:target -- <file.json>` picks the target and type
from the document (BatteryPass-Ready: its battery category; Registry: its content specifications
and, from the file name, its view) and lists missing values, wrong forms and accepted deviations;
`--list` shows every type.

Not hosted yet: GS1 Rail 2.6 (shapes, but the published examples are empty, so a type could not be
held to them), SEMIC, CIRPASS-2 CORE (OWL only; no shapes to host). Bridge output exists for EU DPP
Registry, BatteryPass-Ready (2.0.1 and 1.3) and GS1 EPCIS; for CIRPASS-2 textile 2.0.0 it needs the
mirror update from 1.1.2, for UNTP a crosswalk profile, and our `keystone` crosswalk carries Keystone
terms on an OpenEPCIS passport rather than a Keystone document. New UNTP versions:
`pnpm run sync:untp -- --latest` adds the newest published one as a target of its own.

## The JSON domain

`gitb/validator-resources/json/openepcis` holds the external models' JSON types (above) and the
module schemas fit to be one. A module JSON type is declared only when its schema both rejects a
wrong document and accepts ours, which today only `us.fsma204` does; `pnpm run build:gitb` prints
per module why the others are not:

- Six modules ship `$defs`-only libraries, with no top-level `type`, `required`, `properties` or
  `$ref`. JSON Schema treats a schema with no applicable keyword as satisfied by any instance.
  Measured: `{"this":"is not a passport at all"}` returned `SUCCESS` with 0 assertions.
- A schema that rejects this project's own examples is not declared either.

The module schemas are written against the **bare-keyed operational form** (the shape an EN 18223
API serves), so the generator's positive control validates the `*.operational.jsonld` goldens.

The Test Bed hosts the RDF domain only; the JSON domain runs self-hosted
(`gitb/docker/docker-compose.validators.yml`, port 8081) and is published with the RDF one to
`validator-resources-openepcis` under `json-resources/`, ready for a Test Bed JSON domain.

---

## Running it

See [`../gitb/README.md`](../gitb/README.md).
