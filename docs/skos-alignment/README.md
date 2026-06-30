# SKOS alignment — agent outputs & evaluation data

This folder holds the inputs and outputs of the **SKOS-alignment agent**
(`tools/vocab-sync/`): the LLM-assisted pipeline that proposes, grades, and
audits cross-vocabulary SKOS mappings between this project's terms and upstream
vocabularies (GS1, schema.org, SEMICeu, UNTP, DPP Keystone, GS1 Rail).

These are **not hand-authored documentation** — they are generated artifacts and
curated evaluation data. Human documentation lives one level up in `docs/`
(`VOCABULARY_LAYERING.md`, `diagrams/`). For the pipeline itself see
[`tools/vocab-sync/README.md`](../../tools/vocab-sync/README.md) and
[`tools/vocab-sync/docs/AI_PIPELINE.md`](../../tools/vocab-sync/docs/AI_PIPELINE.md).

## What's here

| File / glob | What it is | How it's produced |
|---|---|---|
| `skos-completeness-*.{json,md}` | Per-module + combined audit reports: MISSING / WEAK / WRONG / OK mappings, with LLM rationale and QA verdicts. | `vocab-sync audit` / `sync` |
| `skos-reverse-coverage.{json,md}` | Upstream terms with no incoming mapping that sit near one of ours (coverage gaps). | `vocab-sync reverse` |
| `skos-upstream-delta.json` | Diff of each upstream source vs the cached copy on the last refresh. | `vocab-sync fetch --all` |
| `alignment-provenance.{json,ttl}` | Audit trail of accepted mappings (who/what/when/confidence). | `vocab-sync provenance` |
| `ontology-realignment-mapping.{json,md}` | Proposed term realignments. Consumed by `scripts/realign-mapping.ts` / `realign-apply.ts`. | `scripts/realign-mapping.ts` |
| `skos-alignment-review.{md,xlsx}` | Human curation sheet/workbook (edit the `Apply?` column). | `vocab-sync provenance --xlsx` |
| `skos-alignment-curation-*.md` | Notes from a curation session. | hand-authored |
| `alignment-run-manifest.json` | Reproducibility manifest: models, parameters, upstream versions + cache hashes. | `vocab-sync manifest` |
| `bench/` | LLM grader benchmark: balanced gold set, per-model predictions log, scored accuracy/F1/confusion/calibration. | `vocab-sync benchmark` |

## Tracking policy

Regenerable outputs are **gitignored** (see the root `.gitignore`): the
`skos-completeness-*`, `skos-reverse-coverage`, `skos-upstream-delta`,
`alignment-provenance`, `ontology-realignment-mapping`, `skos-alignment-review.{md,xlsx}`,
and `bench/skos-grader-predictions.jsonl` files regenerate on each run and would
otherwise add ~14 MB of churn.

**Tracked** (curated inputs / small reproducibility records): the benchmark gold
set (`bench/skos-grader-goldset.json`), the scored benchmark (`bench/skos-grader-benchmark.{json,md}`,
`bench/benchmark-manifest.json`), the run manifest (`alignment-run-manifest.json`),
and curation notes (`skos-alignment-curation-*.md`).

Accepted mappings themselves are written back into the module `ontology/*.ttl`
files (the source of truth) — not stored here.
