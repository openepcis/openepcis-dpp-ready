# SKOS grader benchmark — leaderboard

Task: graded-SKOS relation classification (EXACT/CLOSE/BROAD/NARROW/NONE) against 90 EU DPP Registry gold pairs, identical production prompt. The bracket after a model names the rubric it graded under (no bracket: the original rubric, before the curator rubric). Local models run at temperature 0; Anthropic models at their default, since they reject the parameter, and through the Batch API, so they have no latency.

| Model | exact-acc | match/no-match | macroF1 | parse-fail | mean ms |
|---|--:|--:|--:|--:|--:|
| claude-opus-5-5 [curator-3] | 78.9% | 91.1% | 0.69 | 0.0% | 0 |
| claude-sonnet-5-5 [curator-3] | 77.8% | 91.1% | 0.70 | 0.0% | 0 |
| claude-fable-5-1 [curator-3] | 72.2% | 90.0% | 0.59 | 0.0% | 0 |
| claude-haiku-5-5 [curator-3] | 71.1% | 91.1% | 0.62 | 0.0% | 0 |
| openai/gpt-oss-20b [curator-3] | 61.1% | 86.7% | 0.45 | 0.0% | 991 |
| openai/gpt-oss-120b [curator-3] | 58.9% | 81.1% | 0.41 | 5.6% | 2239 |

Full per-relation F1, confusion matrices, and calibration are in the JSON; the AI pipeline doc (`tools/vocab-sync/docs/AI_PIPELINE.md`) interprets these.
