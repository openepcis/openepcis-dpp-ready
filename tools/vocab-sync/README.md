# vocab-sync

A Quarkus + LangChain4j CLI that audits and maintains the graded-SKOS mappings from the
OpenEPCIS DPP-extension ontology to upstream vocabularies (GS1, schema.org, SEMICeu, UNTP,
DPP Keystone, GS1 Rail).

It answers one recurring question — **"which upstream mappings are we missing, weak on, or
wrong about?"** — and turns the answer into reviewable, gated edits to the TTLs. The tool
**proposes**; a human approves; a separate `apply` step writes the ontology. The canonical
TTLs are never auto-edited.

## How it works

```
our TTLs ─┐                              ┌─ embed (cached) ─┐
          ├─ Apache Jena → term indexes ─┤                  ├─ retrieve top-K per vocab
upstream ─┘                              └─ embed (cached) ─┘        │
                                                                      ▼
                              LLM grader (per pair) → Verdict{relation, confidence, rationale}
                                                                      │
                       diff vs SKOS already in the TTL → MISSING / WEAK / WRONG / OK
                                                                      │
                                            docs/skos-completeness-*.{md,json}
                                                                      │
                                   apply (gated, dry-run by default) → TTL edits
```

- **Indexes** (`OurIndex`, `UpstreamIndex`) are built with Apache Jena (RIOT reads TTL +
  JSON-LD). Every IRI a mapping is proposed against must exist in the upstream index — the
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
  The QA model is its own swappable config — local flagship by default, or **Claude Opus**
  (see below).
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

- **`gpt-oss-20b` ties the frontier ceiling** (52.0% exact-relation accuracy vs Claude Opus 52.5%)
  at 5.6× the speed and zero parse failures — so the local bulk-grader default holds; you do not
  need a hosted model for the high-volume pass.
- **The confidence floor is volume control, not quality control.** For the bulk grader, "a relation
  exists" is ~99% reliable at any confidence, but *which* graded relation is correct stays ~50%
  regardless of confidence. So the floor trims the low-confidence tail (and routes those to
  `rdfs:seeAlso`), while the **QA second pass**, not the floor, is what polices graded-relation
  correctness. Keeping it around 0.75–0.80 is reasonable; raising it does not buy better grades.
- **Prefer precision over size:** an 8-bit Qwen3-32B beats its own 4-bit by +4 points and a 4-bit
  122B by six, reaching the ceiling. Reasoning-tuned models were slower and no more accurate.

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
| `smoke` | Grade one known pair — verifies the endpoint + structured output. |
| `stats [--module S]` | Load both indexes and print counts (no LLM). |
| `retrieve --term NAME [--k K]` | Show embedding-retrieved candidates for one term (no grading). |
| `audit [--module S] [--limit N] [--concurrency C] [--no-qa]` | Find MISSING/WEAK/WRONG mappings, QA-verify them → `docs/skos-completeness-report.{md,json}`. |
| `apply --report R [--status …] [--confirmed-only] [--min-qa-confidence X] [--rewrite] [--apply]` | Insert/rewrite mappings into the TTLs (dry-run unless `--apply`). Below `--min-qa-confidence` (0.75) an add is emitted as `rdfs:seeAlso`, not a graded relation; re-parses + restores on invalid output. |
| `provenance [--min-qa-confidence X]` | From the reports, write `docs/skos-alignment-review.md` (human review sheet) + `docs/alignment-provenance.{ttl,json}` (audit trail of applied mappings). |
| `reverse [--vocab V] [--min-cosine X]` | Reverse coverage: upstream terms with no incoming mapping that are embedding-near one of ours → `docs/skos-reverse-coverage.{md,json}`. |
| `manifest [--qa-model M]` | Reproducibility manifest: models, parameters, upstream versions + cache hashes → `docs/alignment-run-manifest.json`. |
| `fetch --from URL\|file --against cached [--save]` | Diff a refreshed upstream vocabulary against the cached copy (added/removed/changed terms) to decide when to re-audit. |
| `fetch --all [--save]` | Refresh **every** configured upstream source (`vocab-sync.source.*.url`), diff each, and write `docs/skos-upstream-delta.json`. |
| `sync [--module S] [--stamp D] [--force] [--no-apply] [--no-qa] [--push] [--min-qa-confidence X]` | The regular-run loop: refresh upstream → if moved, re-audit (only changed pairs hit the LLM) → apply QA-confirmed mappings to a `vocab-sync/upstream-<stamp>` branch. See [`docs/AI_PIPELINE.md`](docs/AI_PIPELINE.md#running-it-regularly-the-sync-loop). |
| `benchmark [--per-class N] [--models CSV] [--include-opus] [--max-tokens T] [--tag S]` | Benchmark LLMs on graded-SKOS classification against published STW↔Wikidata mappings; builds a balanced gold set, runs the field model-by-model (resumable JSONL log), and scores accuracy/F1/confusion/calibration → `docs/bench/`. |

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

## Run it elsewhere / repoint the LLM

Everything is `base-url` + model config — no host lock-in. Override by env var:

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

### QA verifier model — local by default; Claude Opus optional (and unnecessary)

The second-tier QA pass uses its own model config, independent of the bulk grader. Default
is the **local flagship** (`qwen3.5-122b-a10b`, or `Qwen3-32B` 8-bit), so the whole chain runs
locally with no API key and no data leaving the machine.

> **Opus adds no measured benefit.** In the benchmark Opus scored 52.5% exact-relation accuracy,
> statistically level with the local models (52.0–52.5%). A hosted QA pass buys no accuracy on this
> task — only a cost, an external dependency, and data egress. Its only marginal value is
> model-family independence, which pairing two *different local* models already gives. Keep it as an
> option; default to local. See [`docs/AI_PIPELINE.md`](docs/AI_PIPELINE.md).

If you still want Opus in the QA slot, there are **two ways** to run it:

**1. Claude API key (`--qa-provider openai`, the default transport).** Officially supported;
billed pay-as-you-go via console.anthropic.com. Uses Anthropic's OpenAI-compatible endpoint:

```bash
export QA_BASE_URL=https://api.anthropic.com/v1/
export QA_CHAT_MODEL=claude-opus-4-8
export QA_API_KEY=sk-ant-…
java -jar target/quarkus-app/quarkus-run.jar audit --module core
```

**2. Claude Pro/Max subscription, via the Claude Code CLI (`--qa-provider claude-cli`).** The
tool shells out to `claude -p` (headless mode), which authenticates with your existing Claude
Code login — no API key in this tool:

```bash
claude login                      # or: export CLAUDE_CODE_OAUTH_TOKEN=$(claude setup-token)
java -jar target/quarkus-app/quarkus-run.jar audit --module core \
     --qa-provider claude-cli --qa-cli-model claude-opus-4-8
```

> Why a CLI bridge and not just an OAuth token in the HTTP path? Per Anthropic's policy,
> Pro/Max **subscription OAuth is only for Claude Code and claude.ai** — using those tokens
> in a third-party HTTP client (or a community proxy) violates the Consumer Terms. Going
> through `claude -p` keeps usage inside the sanctioned Claude Code path. Note that as of
> mid-2026 programmatic `claude -p` usage draws on a separate per-plan credit pool billed at
> API rates, not the chat allowance. The subprocess is driven reactively (`Process.onExit()`
> → Mutiny `Uni`), so `--qa-concurrency` bounds how many `claude` processes run at once.

QA verdicts are cached by `(qa-model, ourIri, upstreamIri)`, separate from the bulk grader's,
so the bulk pass stays local/free while only the (smaller) set of findings goes to Opus.
Disable QA with `--no-qa`; restrict it with `--qa-min-confidence`. In the report, `✓` marks a
finding the QA model confirms; `apply --confirmed-only` writes just those.

## Inputs

- Our terms + existing SKOS: `extensions/*/*/ontology/*.ttl`.
- Upstream term sets, three source kinds (see `UpstreamIndex`):
  - **RDF** (real labels/comments, via Jena): GS1 + schema.org (`.cache/vocab/{gs1-voc.ttl,
    schemaorg.ttl}`), SEMICeu (`.cache/vocab/semic-{m8g,adms,locn}.jsonld`), and the in-repo
    GS1 Rail vocabulary (`extensions/upstream/gs1-rail/ontology/gs1RailVoc.ttl`).
  - **SAMM** (Eclipse ESMF aspect models): BatteryPass — `samm:Property`/`samm:Entity` with
    `samm:preferredName`/`samm:description`, latest version per aspect from the sibling checkout
    (`batterypass-root`).
  - **JSON-LD @context** (term→IRI, name-only, class/property guessed from casing): DPP
    Keystone (`.cache/vocab/dppk/*.context.jsonld`) and UNTP (the in-repo
    `interop/context/untp-bridge-context.jsonld`).
  - Total ≈ 3,550 terms {gs1, schemaorg, semic, untp, dppk, rail, batterypass, foaf}.
- **Existing-target seeding:** the audit also seeds the exact IRIs our TTLs already map to,
  so every current mapping can be re-graded (validation) even when its vocabulary has no
  machine-readable term set. This is what lets the report classify existing mappings as
  OK / WEAK / WRONG rather than only finding MISSING ones.

## Caches (under `tools/vocab-sync/.cache/`)

- `embeddings.json` — term vectors, keyed by `(embed-model, text)`.
- `verdicts.json` — grader verdicts, keyed by `(chat-model, ourIri, upstreamIri)`.

Delete a cache to force recomputation. Both are safe to commit-ignore.
