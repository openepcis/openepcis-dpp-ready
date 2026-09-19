# GITB conformance testing — operation

Everything here is **generated**. The conformance model, the design decisions and
the measurements behind them are in
[`../docs/GITB_CONFORMANCE.md`](../docs/GITB_CONFORMANCE.md); this file is how to
run and publish it.

```
validator-resources/shacl/openepcis  RDF validator domain: 16 validation types
validator-resources/json/openepcis   empty on purpose — see GITB_CONFORMANCE.md
test-suites/openepcis-dpp            GITB TDL suite: 16 specifications, 32 test cases
docker/                              local stacks
dev.sh                               entry point
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
| Web form | <http://localhost:8080/shacl/openepcis/upload> |
| REST API | `POST http://localhost:8080/shacl/openepcis/api/validate` |
| SOAP (GITB validation service) | <http://localhost:8080/shacl/soap/openepcis/validation?wsdl> |

Verify it:

```bash
pnpm run check:shapes:itb
```

That validates every example passport **and** every shipped test-suite fixture in
both directions — the positives must conform, the negatives must not.

A single document by hand:

```bash
curl -s -X POST http://localhost:8080/shacl/openepcis/api/validate \
  -H 'Content-Type: application/json' \
  -d "{\"contentToValidate\":\"$(base64 -w0 my-passport.jsonld)\",
       \"embeddingMethod\":\"BASE64\",
       \"validationType\":\"eu.battery.item\",
       \"contentSyntax\":\"application/ld+json\",
       \"reportSyntax\":\"text/turtle\"}"
```

`validationType` must be one of the 16 ids listed in
`validator-resources/shacl/openepcis/config.properties`.

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
`http://shacl-validator:8080/shacl/soap/openepcis/validation?wsdl`, the compose service
name, so it works unchanged inside this stack. For another host, regenerate:

```bash
VALIDATOR_ADDRESS=https://validator.example.org pnpm run build:gitb-testsuite
```

Shut down with `gitb/dev.sh down itb`.

---

## 3. Publishing

Two independent steps.

**The validator resources.** The European Commission hosts the validator on the
shared Test Bed as the `openepcis` domain, reading it from the public mirror
repository [`openepcis/validator-resources-openepcis`](https://github.com/openepcis/validator-resources-openepcis).
Sync it:

```bash
pnpm run publish:validator-resources                    # write the mirror, report
pnpm run publish:validator-resources -- --commit --push # ...and publish it
```

The script refuses to run on a drifted bundle, flattens the domain directory into
`resources/` (the ISAITB layout, as in
[`validator-resources-rdf-sample`](https://github.com/ISAITB/validator-resources-rdf-sample)),
regenerates that repository's README from the shipping configuration, and removes
files a deleted validation type left behind. The mirror lives beside this
checkout by default (`../validator-resources-openepcis`); `--target` points it
elsewhere. Nothing is a second source: whatever is edited there is overwritten by
the next sync.

A push is picked up by the Test Bed's webhook within a couple of minutes; the
live service is then <https://www.itb.ec.europa.eu/shacl/openepcis/upload>.
Before pushing, it is worth serving exactly what the mirror publishes:

```bash
mkdir -p /tmp/hosted && cp -R ../validator-resources-openepcis/resources /tmp/hosted/openepcis
docker run -d --name itb-check -p 8080:8080 \
  -e validator.resourceRoot=/validator/resources/ \
  -v /tmp/hosted:/validator/resources:ro isaitb/shacl-validator:latest
pnpm run check:shapes:itb
```

**The test suite.** Import the ZIP into the target Test Bed, as in step 2. For
the hosted validator, rebuild it against that address first — the path needs no
change, the domain name is the same there:

```bash
VALIDATOR_ADDRESS=https://www.itb.ec.europa.eu pnpm run build:gitb-testsuite -- --write
gitb/dev.sh zip
```

Regenerate with the default address afterwards, or `pnpm run build` fails on the
drift gate.

### Precondition: the deployed contexts decide the verdict

The upload test cases take JSON-LD, so the validator resolves each passport's
`@context` from `ref.openepcis.org`. That is correct behaviour — a third party's
passport must reference the published contexts — but it means the **deployed**
contexts, not the ones in `main`, decide whether a document conforms.

The counter-check for that is its own gate, and unlike every other one it needs
the network:

```bash
gitb/dev.sh up validators
pnpm run check:shapes:deployed
```

Green as of 2026-09-19: all 46 examples conform as raw JSON-LD against the
contexts `ref.openepcis.org` currently serves. It was not always so — the
`anyURI` coercion corrections were green in the repository while the deployed
contexts still coerced `"@type": "@id"`, and 16 examples "failed" conformance for
a reason that had nothing to do with them. Neither `check:shapes` nor
`check:shapes:itb` reproduces that, by design: both work from local, expanded
documents so that deployment skew cannot masquerade as an engine disagreement.

So after any change to the ontologies or contexts: deploy `ref.openepcis.org`
first, then re-run this gate, and only then publish or submit. Deployment of
`ref.openepcis.org` happens outside this repository — see
[`../docs/OPERATIONS.md`](../docs/OPERATIONS.md).

---

## What is and is not verified

Verified by `pnpm run check:shapes:itb` against the real
`isaitb/shacl-validator` image:

- all 16 validation types load, i.e. `config.properties` is accepted;
- all 46 example passports conform;
- all 73 test-suite fixtures behave as claimed — 46 positive conform, 27 negative
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
- **all self-tests execute and pass** end to end: GITB engine → SOAP call to
  the validator service → verdict, including the `invert="true"` assertions on
  the negative fixtures.
- the **upload test case works interactively**: a real JSON-LD passport
  submitted through the `interact` step validates with its `@context` resolved
  from ref.openepcis.org (verified with `eu.textile` and the organic-tee
  example).

Verified against the published mirror (2026-09-19):

- `isaitb/shacl-validator` started with `validator-resources-openepcis/resources`
  mounted as the `openepcis` domain — the exact layout and bytes the shared Test
  Bed reads — serves the web form and the WSDL, offers all 16 types, and takes
  the whole parity gate green (46 examples, 73 fixtures). The banner and
  `validator.supportMinimalUserInterface` are part of what that start accepts:
  a malformed `.properties` value fails the container at boot, loudly.

Not yet verified:

- execution on the EU's own Test Bed instance rather than the local compose
  stack — the submission itself.
