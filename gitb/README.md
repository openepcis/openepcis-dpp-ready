# GITB conformance testing — operation

Everything here is **generated**. The conformance model, the design decisions and
the measurements behind them are in
[`../docs/GITB_CONFORMANCE.md`](../docs/GITB_CONFORMANCE.md); this file is how to
run and publish it.

```
validator-resources/shacl/dpp   RDF validator domain: 16 validation types
validator-resources/json/dpp    empty on purpose — see GITB_CONFORMANCE.md
test-suites/openepcis-dpp       GITB TDL suite: 12 specifications, 24 test cases
docker/                         local stacks
dev.sh                          entry point
```

Regenerate after any change to the ontologies, shapes or examples — two drift
gates in `pnpm run build` fail otherwise:

```bash
pnpm run build:gitb            # validator bundle
pnpm run build:gitb-testsuite  # TDL suite and fixtures
```

---

## 1. The validator alone

Enough for the parity gate and for poking at shapes by hand. One image, ~490 MB.

```bash
gitb/dev.sh up validators
```

Then:

| | |
|---|---|
| Web form | <http://localhost:8080/shacl/dpp/upload> |
| REST API | `POST http://localhost:8080/shacl/dpp/api/validate` |
| SOAP (GITB validation service) | <http://localhost:8080/shacl/soap/dpp/validation?wsdl> |

Verify it:

```bash
pnpm run check:shapes:itb
```

That validates every example passport **and** every shipped test-suite fixture in
both directions — the positives must conform, the negatives must not.

A single document by hand:

```bash
curl -s -X POST http://localhost:8080/shacl/dpp/api/validate \
  -H 'Content-Type: application/json' \
  -d "{\"contentToValidate\":\"$(base64 -w0 my-passport.jsonld)\",
       \"embeddingMethod\":\"BASE64\",
       \"validationType\":\"eu.battery.item\",
       \"contentSyntax\":\"application/ld+json\",
       \"reportSyntax\":\"text/turtle\"}"
```

`validationType` must be one of the 16 ids listed in
`validator-resources/shacl/dpp/config.properties`.

---

## 2. The full Test Bed

Adds `gitb-ui`, `gitb-srv`, MySQL and Redis — several GB of images. **Start it in
tmux**: an interrupted SSH session kills the pull.

```bash
tmux new -d -s itb "bash -lc 'gitb/dev.sh up itb'"
tmux attach -t itb
```

Then <http://localhost:9000>, log in as `admin@itb`. The one-time password is in
the `gitb-ui` log until the first successful login:

```bash
gitb/dev.sh logs itb | grep -i -A2 'one-time'
```

In the UI, create:

1. a **domain** — `openepcis-dpp`,
2. one **specification** per module you want statements for (the names in
   `testSuite.xml`'s test-case ids: `dpp.core`, `eu.battery`, `eu.battery.item`, …),
3. the **actor** `DPPDataProvider` under each, role SUT.

Then upload the suite:

```bash
gitb/dev.sh zip     # -> gitb/openepcis-dpp-testsuite.zip
```

The archive deliberately has `testSuite.xml` at its root with no wrapping
directory — resource references inside the test cases are relative to it. The Test
Bed validates structure and references on import.

The suite's `verify` steps call the validator at
`http://shacl-validator:8080/shacl/soap/dpp/validation?wsdl`, the compose service
name, so it works unchanged inside this stack. For another host, regenerate:

```bash
VALIDATOR_ADDRESS=https://validator.example.org pnpm run build:gitb-testsuite
```

Shut down with `gitb/dev.sh down itb`.

---

## 3. Publishing

Two independent steps.

**The validator resources.** `validator-resources/shacl` is laid out to the ISAITB
convention (`resources/<domain>/{config.properties,shapes/}`, as in
[`validator-resources-dcat-ap`](https://github.com/ISAITB/validator-resources-dcat-ap)),
so it can be mirrored to a standalone `validator-resources-openepcis-dpp`
repository without restructuring if the Test Bed asks for one. Deploy the image
with that directory as its resource root — the compose files show the exact
invocation.

**The test suite.** Import the ZIP into the target Test Bed, as in step 2.

### Precondition: redeploy the contexts first

The upload test cases take JSON-LD, so the validator resolves each passport's
`@context` from `ref.openepcis.org`. That is correct behaviour — a third party's
passport must reference the published contexts — but it means the **deployed**
contexts decide the verdict.

`ref.openepcis.org` currently serves a revision predating the `anyURI` coercion
corrections, so an uploaded passport still shows `Value must be a valid literal of
type anyURI` findings that neither `pnpm run check:shapes` nor
`pnpm run check:shapes:itb` reproduces (both work from the local, corrected
contexts by design). Push and redeploy before submitting, or the suite will report
our own deployment lag as the submitter's fault.

Deployment of `ref.openepcis.org` happens outside this repository — see
[`../docs/OPERATIONS.md`](../docs/OPERATIONS.md).

---

## What is and is not verified

Verified by `pnpm run check:shapes:itb` against the real
`isaitb/shacl-validator` image:

- all 16 validation types load, i.e. `config.properties` is accepted;
- all 43 example passports conform;
- all 61 test-suite fixtures behave as claimed — 36 positive conform, 25 negative
  are rejected (one per applicable mutation, each proven by the generator to add
  a violation before it is emitted);
- `sh:alternativePath` substitutes correctly for the `rdfs:subPropertyOf`
  entailment the validator does not apply;
- `dpp-sh:GranularityDigitalLinkConstraint` fires, so the engine does evaluate
  `sh:sparql`.

Verified on a local Test Bed instance (gitb-ui/gitb-srv 1.29.5, 2026-08-12):

- the suite **imports cleanly**: the ITB's own TDL validation reports SUCCESS
  with 0 errors and 0 warnings, structure and resource references included.
  (The first import attempt found 48 TDL-040 errors — the generator built the
  test cases' `<imports>` block but never emitted it — which is exactly why an
  actual import is part of the definition of done.)
- **all 12 self-tests execute and pass** end to end: GITB engine → SOAP call to
  the validator service → verdict, including the `invert="true"` assertions on
  the negative fixtures.
- the **upload test case works interactively**: a real JSON-LD passport
  submitted through the `interact` step validates with its `@context` resolved
  from ref.openepcis.org (verified with `eu.textile` and the organic-tee
  example).

Not yet verified:

- execution on the EU's own Test Bed instance rather than the local compose
  stack — the submission itself.
