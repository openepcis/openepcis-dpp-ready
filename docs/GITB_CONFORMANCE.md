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
| Domain | `openepcis-dpp` — OpenEPCIS DPP-Ready |
| Specification | one per regulation module, plus the cross-cutting core |
| Actor | `DPPDataProvider`, role `SUT` — the economic operator or solution provider under test |
| Validation type | the identifier a validator request carries, e.g. `eu.battery.item` |
| Test suite | `gitb/test-suites/openepcis-dpp` |

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
│   ├── shacl/dpp/            config.properties + shapes/<type>/{shapes,background}.ttl
│   └── json/dpp/             (empty — see "The JSON domain" below)
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

`pnpm run check:shapes:itb` verifies all 48 fixtures in both directions. If an
upstream change makes a mutation stop violating, that gate fails loudly rather
than the suite quietly asserting nothing.

---

## The JSON domain

`gitb/validator-resources/json/dpp` is **empty on purpose**, and
`pnpm run build:gitb` prints per module why.

A JSON validation type is declared only when its schema both rejects a wrong
document and accepts ours. None currently does:

- Six modules ship `$defs`-only libraries — 21–37 named definitions, no top-level
  `type`, `required`, `properties` or `$ref`. JSON Schema treats a schema with no
  applicable keyword as satisfied by any instance. Measured:
  `{"this":"is not a passport at all"}` returned `SUCCESS` with 0 assertions.
- `eu.electronics` and `us.fsma204` **reject this project's own examples**, both
  from leftovers of the `has*` rename: `required` names `repairabilityClass` and
  `foodTraceabilityListCategory`, while the documents (and in the fsma204 case the
  schema's own `properties`) carry `hasRepairabilityClass` and
  `hasFoodTraceabilityListCategory`.

Note also that the JSON schemas are written against the **bare-keyed operational
form** — the shape an EN 18223 API serves — not the prefixed seed form. That is why
the generator's positive control validates the `*.operational.jsonld` goldens.

A conformance service that accepts anything is worse than none, and one that
rejects correct passports is worse still. Giving each module a document-level
schema is work on the JSON Schema layer; the domain fills itself in as that lands.

---

## Running it

See [`../gitb/README.md`](../gitb/README.md).
