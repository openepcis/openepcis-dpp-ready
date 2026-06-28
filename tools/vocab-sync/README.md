# vocab-sync

**vocab-sync keeps the OpenEPCIS Digital Product Passport vocabulary connected to the standards
everyone else already uses, and it leans on local, open-source AI models to do the matching.**
It reads our terms and the published vocabularies (GS1, schema.org, the EU SEMIC Core
Vocabularies, UNTP, DPP Keystone, GS1 Rail), proposes how each of our terms relates to theirs,
has a second AI model double-check every proposal, and turns the result into reviewable, gated
edits that a human approves before anything is written.

It is a command-line tool built on Quarkus and LangChain4j (Java 25).

> New to this domain? Start with [Concepts in 60 seconds](#concepts-in-60-seconds). Want the
> engineering depth and the measurements behind the defaults? See
> [`docs/AI_PIPELINE.md`](docs/AI_PIPELINE.md).

## The problem in plain words

We define vocabulary terms for Digital Product Passports: durability, recycled content, battery
state-of-health, deforestation due-diligence, and so on. Many of those concepts already exist in
vocabularies that other organisations publish and maintain. GS1 describes products, parties and
locations; schema.org covers general web data; the EU SEMIC Core Vocabularies cover public-sector
and conformity data; community profiles such as UNTP and DPP Keystone cover passport-specific
structures. For our data to be interoperable, each term we define should record how it relates to
the established one. Our `recycledContent` might be the same concept as a GS1 property, our
`Battery` class might be a narrower kind of a schema.org `Product`, and some of our terms have no
upstream counterpart at all and stay unmapped.

Recording those relationships by hand across thousands of terms, and keeping them correct as the
upstream vocabularies change over time, is slow and easy to get wrong. vocab-sync does that work
for us: it finds the likely matches, grades each relationship, checks its own work with a second
model, and writes the surviving, human-approved mappings back into the ontology. In one sentence,
it answers **"which upstream mappings are we missing, weak on, or wrong about?"** The tool
proposes, a human approves, and a separate `apply` step writes the files. The canonical source
files are never edited automatically.

## Concepts in 60 seconds

If terms like "TTL" and "SKOS" are new to you, this is all you need to follow the rest:

- **RDF** is a simple data model where every fact is a triple of `subject` `predicate` `object`
  (for example, "Battery has-chemistry Lithium"). It is the common language for describing things
  on the web, and almost every published vocabulary is available as RDF.
- **IRI** is the web-style identifier RDF gives every term, much like a URL. Two vocabularies say
  they mean the same thing by sharing an IRI, or by linking their two separate IRIs together.
- **Turtle**, file extension **`.ttl`**, is a readable text syntax for RDF. Where this README
  says "the TTLs", it means our ontology written as Turtle text files.
- **Ontology** is our controlled set of terms: the classes (things, such as `Battery`) and the
  properties (attributes, such as `recycledContent`) we define.
- **Upstream vocabulary** is a term set that someone else owns and publishes: GS1, schema.org,
  the EU SEMIC Core Vocabularies, UNTP, DPP Keystone, GS1 Rail.
- **SKOS** is the standard RDF vocabulary for linking concepts across vocabularies. We use its
  **graded** relations to record how close a match is:
  - `skos:exactMatch`: the same concept
  - `skos:closeMatch`: almost the same, safe to treat as related
  - `skos:broadMatch`: ours is narrower (theirs is the broader concept)
  - `skos:narrowMatch`: ours is broader (theirs is the narrower concept)

  A finished mapping is just one more triple in our Turtle file, of the shape
  `ourTerm skos:closeMatch theirTerm`.
- **Embedding** turns a term's meaning into a vector of numbers, so terms with similar meaning
  land near each other in that space. It lets the tool find candidate matches by similarity, so it
  never has to compare every term against every other term.
- **LLM-as-judge** (grading) is the step where a language model reads two terms, with their labels
  and definitions, and decides which graded relation, if any, holds between them.

## Why it is interesting (the AI engineering)

vocab-sync is a small but complete local-LLM pipeline. The parts worth knowing, each covered in
depth in [`docs/AI_PIPELINE.md`](docs/AI_PIPELINE.md):

- **Fully local, fully open models.** Bulk grading, the QA pass, and the embeddings all run against
  a local OpenAI-compatible endpoint (LM Studio by default; Ollama or any compatible server work
  too). There is no API key, no term data leaves the machine, and a full run costs nothing but
  local compute. The same setup runs on a laptop and in CI.
- **Retrieval before generation.** Each term is embedded once and the vectors are cached on disk.
  The tool then gathers the nearest upstream terms per vocabulary, which narrows millions of
  possible pairs down to a plausible few before any model grades them. Type is enforced, so a class
  is only ever paired with a class and a property with a property.
- **Structured LLM grading.** Grading is a LangChain4j `@RegisterAiService` that returns a typed
  verdict (the relation, a confidence, and a one-sentence rationale). The model's answer is
  validated against that type, so the pipeline reads a real object and never scrapes free-form text.
- **A blind multi-judge QA panel.** A second, independent model re-judges every finding through
  several decorrelated lenses (definition-scope, subsumption-direction, strict-skeptic). It stays
  blind on purpose: it does not see the first proposal, so it cannot simply rubber-stamp it. The
  votes reconcile into a two-tier verdict (STRONG, WEAK, REJECT, SPLIT), and that panel is the real
  quality gate.
- **A measured, counter-intuitive result.** On a 200-pair human-curated benchmark, the question of
  whether a relation exists at all is answered correctly about 99% of the time. The question of
  which graded relation it is tops out near 52% for every model tried, frontier hosted models
  included, and a model's self-reported confidence does not track whether it picked the right
  grade. Three things follow: a local 20B model (`gpt-oss-20b`) is enough for the bulk pass, the
  confidence floor decides how many mappings get asserted, and the QA panel decides whether the
  grades can be trusted.
- **Anti-hallucination guard.** A proposed mapping can only point at an IRI that genuinely exists in
  the upstream index, and that is re-checked again when the mapping is written. The tool cannot
  invent a target term.
- **Cheap incremental re-runs.** Verdicts are cached against a content fingerprint of both terms,
  so a scheduled re-run re-grades only the terms whose text actually changed and serves everything
  else from cache. A routine sync therefore costs a handful of model calls.
- **A reproducible benchmark harness.** The `benchmark` command builds a balanced gold set from a
  published concordance and scores any set of models for accuracy, F1, confusion, and calibration,
  writing a resumable run log so a long benchmark can stop and continue.
- **Human-in-the-loop by design.** The tool only ever proposes. Review happens in an Excel workbook
  where each row is accepted or rejected, and a gated `apply` writes the approved mappings into the
  TTLs. A human sign-off is always required before anything reaches the canonical files.

## How it works

<!-- Diagram source: docs/diagrams/pipeline-overview.d2. Regenerate with `pnpm run diagrams:build`; do not edit the SVGs. -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/diagrams/pipeline-overview-dark.svg">
  <img alt="vocab-sync pipeline: our TTLs and upstream vocabularies feed Apache Jena term indexes; embed and retrieve top-K per vocab feed an LLM grader, then a diff against the SKOS in the TTL produces completeness reports, then gated apply." src="docs/diagrams/pipeline-overview-light.svg" width="420">
</picture>

- **Indexes** (`OurIndex`, `UpstreamIndex`) are built with Apache Jena (RIOT reads TTL and
  JSON-LD). Every IRI a mapping is proposed against must exist in the upstream index. This is the
  anti-hallucination guard, re-checked again at apply time.
- **Retrieval** (`Embeddings`, `Retriever`) embeds each term once (vectors cached on disk),
  then gathers top-K nearest upstream terms *per vocabulary* plus exact local-name matches.
  Type is enforced: a class only matches a class, a property only a property.
- **Grading** (`Grader`, a `@RegisterAiService`) judges one pair at a time and returns a
  graded-SKOS relation. Verdicts are cached by `(model, ourIri, upstreamIri)`, so re-runs
  are reproducible and ~free, and a long run resumes after an interruption.
- **QA verification** (`QaGrader`, a second `@RegisterAiService` bound to the `qa` model)
  runs at the END of an audit: a stronger model independently re-judges every finding,
  seeing the first pass's proposal, and either confirms it (`✓`, QA relation == proposal)
  or overturns it (`✗`). Only confirmed findings should be adopted without extra scrutiny.
  The QA model is its own swappable config: a local model by default, repointable to any
  OpenAI-compatible endpoint (see below).
- **Concurrency** is Mutiny: `Multi … transformToUni(…).merge(N)` bounds in-flight grading
  requests; the blocking AiService call runs on the Vert.x worker pool with declarative
  backoff retry (`onFailure().retry().withBackOff(…)`).

## Why these model and floor defaults (measured)

The bulk grader (`gpt-oss-20b`) and the 0.75 confidence floor were validated empirically with the
`benchmark` subcommand against a published, human-curated graded-SKOS concordance (STW ↔ Wikidata).
The pipeline, the model choices, and what made sense vs what didn't are documented in
[`docs/AI_PIPELINE.md`](docs/AI_PIPELINE.md); the leaderboard and matrices are in
[`docs/bench/skos-grader-benchmark.md`](../../docs/bench/skos-grader-benchmark.md).

Headline findings (200 balanced gold pairs, identical production prompt, temperature 0):

- **`gpt-oss-20b` ties the frontier ceiling** (52.0% exact-relation accuracy versus Claude Opus
  52.5%) at 5.6× the speed with zero parse failures, so the local bulk-grader default holds. You do
  not need a hosted model for the high-volume pass.
- **What the confidence floor controls.** For the bulk grader, whether a relation exists is about
  99% reliable at any confidence. Which graded relation is correct stays about 50% regardless of
  confidence. So the floor trims the low-confidence tail and routes those adds to `rdfs:seeAlso`.
  The QA second pass is what polices graded-relation correctness. Keeping the floor around 0.75 to
  0.80 is reasonable; raising it does not buy better grades.
- **Prefer precision over size:** an 8-bit Qwen3-32B beats its own 4-bit by +4 points and a 4-bit
  122B by six points, reaching the ceiling. Reasoning-tuned models ran slower with no gain in
  accuracy.

## Run it

Requires **JDK 25** (GraalVM CE) and an OpenAI-compatible LLM endpoint. Defaults target
**LM Studio** on this Mac with a chat model + an embedding model loaded.

```bash
sdk use java 25.0.2-graalce
./mvnw -q -DskipTests package           # or: quarkus build
java -jar target/quarkus-app/quarkus-run.jar <command>
```

Commands:

| Command | Purpose |
|---|---|
| `smoke` | Grade one known pair to verify the endpoint and structured output. |
| `stats [--module S]` | Load both indexes and print counts (no LLM). |
| `retrieve --term NAME [--k K]` | Show embedding-retrieved candidates for one term (no grading). |
| `audit [--module S] [--limit N] [--concurrency C] [--no-qa]` | Find MISSING/WEAK/WRONG mappings, QA-verify them → `docs/skos-completeness-report.{md,json}`. |
| `apply --report R [--status …] [--confirmed-only] [--min-qa-confidence X] [--rewrite] [--apply]` | Insert/rewrite mappings into the TTLs (dry-run unless `--apply`). Below `--min-qa-confidence` (0.75) an add becomes a non-committal `rdfs:seeAlso` in place of a graded relation; re-parses and restores on invalid output. |
| `provenance [--report R] [--approve F] [--xlsx P] [--min-qa-confidence X]` | From the report(s), write `docs/skos-alignment-review.md` (review sheet) + `docs/alignment-provenance.{ttl,json}` (audit trail). `--report` reads one report (vs the `*-opus.json` glob); `--xlsx` also writes the editable Excel curation workbook. |
| `curate --report R [--xlsx P] [--stamp D] [--base-branch B] [--push]` | Read a curator-edited workbook and rebuild the `vocab-sync/upstream-<stamp>` branch from only the `Apply?=yes` rows (adds, rewrites, **and** removes). See [Curate via Excel](#curate-via-excel). |
| `reverse [--vocab V] [--min-cosine X]` | Reverse coverage: upstream terms with no incoming mapping that are embedding-near one of ours → `docs/skos-reverse-coverage.{md,json}`. |
| `manifest [--qa-model M]` | Reproducibility manifest: models, parameters, upstream versions + cache hashes → `docs/alignment-run-manifest.json`. |
| `fetch --from URL\|file --against cached [--save]` | Diff a refreshed upstream vocabulary against the cached copy (added/removed/changed terms) to decide when to re-audit. |
| `fetch --all [--save]` | Refresh **every** configured upstream source (`vocab-sync.source.*.url`), diff each, and write `docs/skos-upstream-delta.json`. |
| `sync [--module S] [--stamp D] [--force] [--no-apply] [--no-qa] [--push] [--min-qa-confidence X]` | The regular-run loop: refresh upstream → if moved, re-audit (only changed pairs hit the LLM) → apply QA-confirmed mappings to a `vocab-sync/upstream-<stamp>` branch. See [`docs/AI_PIPELINE.md`](docs/AI_PIPELINE.md#running-it-regularly-the-sync-loop). |
| `benchmark [--per-class N] [--models CSV] [--max-tokens T] [--tag S]` | Benchmark LLMs on graded-SKOS classification against published STW↔Wikidata mappings; builds a balanced gold set, runs the field model-by-model (resumable JSONL log), and scores accuracy/F1/confusion/calibration → `docs/bench/`. |

Typical loop:

```bash
# 1) audit one module, review the report
java -jar target/quarkus-app/quarkus-run.jar audit --module core --out docs/skos-completeness-core
$EDITOR docs/skos-completeness-core.md

# 2) dry-run the high-confidence MISSING/WEAK insertions
java -jar target/quarkus-app/quarkus-run.jar apply --report docs/skos-completeness-core.json \
     --status MISSING,WEAK --min-confidence 0.85

# 3) approve a subset (optional) and write
java -jar target/quarkus-app/quarkus-run.jar apply --report docs/skos-completeness-core.json \
     --approve docs/approved.tsv --apply

# 4) regenerate derived artifacts
pnpm build:json        # in the repo root
# then copy:ontologies in the web app (openepcis-web)
```

`--approve` takes a file of `<ourIri><TAB><upstreamIri>` lines for fine-grained gating.

## Curate via Excel

For row-by-row review without hand-editing TSVs, export an Excel workbook, accept/reject in a
spreadsheet, and rebuild the review branch from your choices.

```bash
J=target/quarkus-app/quarkus-run.jar

# 1) Export the workbook from a report (the `sync` run leaves docs/skos-completeness-sync.json).
java -jar $J provenance --report docs/skos-completeness-sync.json \
     --xlsx docs/skos-alignment-review.xlsx --qa-model qwen/qwen3-32b

# 2) Open docs/skos-alignment-review.xlsx and edit the `Apply?` column.
#    - Every row defaults to `yes`. Set the ones you reject to `no`.
#    - Filter `Scrutiny = review` to triage the contested rows first; the `legend` sheet explains the columns.
#    - Do NOT edit the hidden columns (ourIri/upstreamIri/predicate/oldPredicate); they are the keys.

# 3) Rebuild the review branch from only the accepted rows.
java -jar $J curate --xlsx docs/skos-alignment-review.xlsx \
     --report docs/skos-completeness-sync.json --stamp $(date +%F)
```

`curate` recreates `vocab-sync/upstream-<stamp>` from the clean base branch
(`--base-branch`, default `feat/upstream-skos-vocab-sync`), applies exactly the `Apply?=yes`
decisions (`add`/`add-seealso` inserts, `rewrite` predicate swaps, and `remove` drops of
QA-rejected mappings), regenerates the provenance/review docs to match, and commits (no push unless
`--push`). It refuses to run on a dirty tree and never touches the base or current branch. Edit and
re-run as often as you like; each run rebuilds the branch from scratch, so it is idempotent.

The `.xlsx` is a transient local artifact (gitignored); the curated mappings live on the branch.
`apply --apply-removes` is the destructive primitive `curate` uses to drop a QA-rejected
(`WRONG` + `qaRelation=NONE`) mapping; it is gated behind that flag and `--approve`.

## Run it elsewhere / repoint the LLM

Everything is `base-url` and model config, with no host lock-in. Override by env var:

```bash
# Ollama (its OpenAI-compatible endpoint)
export LLM_BASE_URL=http://localhost:11434/v1
export LLM_CHAT_MODEL=qwen3:32b
export LLM_EMBED_MODEL=nomic-embed-text

# Hosted OpenAI / vLLM / any OpenAI-compatible server
export LLM_BASE_URL=https://api.openai.com/v1
export LLM_API_KEY=sk-…
export LLM_CHAT_MODEL=gpt-4o-mini
export LLM_EMBED_MODEL=text-embedding-3-small
```

Swapping the embedding model invalidates only that model's cached vectors (cache keys are
namespaced by model id), so mixing vector spaces is impossible.

### QA verifier model (local-first, fully OSS)

The second-tier QA pass uses its own model config, independent of the bulk grader. Default
is a **local model** (`Qwen3-32B` 8-bit, or any flagship you load), so the whole chain runs
locally with no API key and no data leaving the machine. Pairing two *different* local models
(bulk vs QA) already gives model-family independence.

> **A frontier hosted model adds no measured benefit on this task.** In the benchmark, Claude
> Opus scored 52.5% exact-relation accuracy, statistically level with the local models
> (52.0% to 52.5%). A hosted QA pass buys no accuracy here, only cost, an external dependency, and
> data egress. See [`docs/AI_PIPELINE.md`](docs/AI_PIPELINE.md).

The verifier is just another OpenAI-compatible endpoint, so you can point it anywhere (an Ollama
cluster, a hosted vLLM, a frontier API) without code changes:

```bash
export QA_BASE_URL=http://localhost:11434/v1     # e.g. an Ollama endpoint
export QA_CHAT_MODEL=qwen/qwen3-32b
export QA_API_KEY=…                              # if the endpoint needs one
java -jar target/quarkus-app/quarkus-run.jar audit --module core
```

QA verdicts are cached by `(qa-model, ourIri, upstreamIri, content-fingerprint)`, separate from
the bulk grader's, so swapping the QA model re-judges only with the new model, and a re-run
re-grades only the pairs whose definitions changed.
Disable QA with `--no-qa`; restrict it with `--qa-min-confidence`. In the report, `✓` marks a
finding the QA model confirms; `apply --confirmed-only` writes just those.

## Inputs

- Our terms + existing SKOS: `extensions/*/*/ontology/*.ttl`.
- Upstream term sets, three source kinds (see `UpstreamIndex`):
  - **RDF** (real labels/comments, via Jena): GS1 + schema.org (`.cache/vocab/{gs1-voc.ttl,
    schemaorg.ttl}`), SEMICeu (`.cache/vocab/semic-{m8g,adms,locn}.jsonld`), and the in-repo
    GS1 Rail vocabulary (`extensions/upstream/gs1-rail/ontology/gs1RailVoc.ttl`).
  - **SAMM** (Eclipse ESMF aspect models): BatteryPass, read as `samm:Property`/`samm:Entity` with
    `samm:preferredName`/`samm:description`, latest version per aspect from the sibling checkout
    (`batterypass-root`).
  - **JSON-LD @context** (term→IRI, name-only, class/property guessed from casing): DPP
    Keystone (`.cache/vocab/dppk/*.context.jsonld`) and UNTP (the in-repo
    `interop/context/untp-bridge-context.jsonld`).
  - Total ≈ 3,550 terms {gs1, schemaorg, semic, untp, dppk, rail, batterypass, foaf}.
- **Existing-target seeding:** the audit also seeds the exact IRIs our TTLs already map to,
  so every current mapping can be re-graded (validation) even when its vocabulary has no
  machine-readable term set. That is what lets the report classify existing mappings as
  OK, WEAK, or WRONG, in addition to surfacing MISSING ones.

## Caches (under `tools/vocab-sync/.cache/`)

- `embeddings.json`: term vectors, keyed by `(embed-model, text)`.
- `verdicts.json`: grader verdicts, keyed by `(chat-model, ourIri, upstreamIri)`.

Delete a cache to force recomputation. Both are safe to commit-ignore.
