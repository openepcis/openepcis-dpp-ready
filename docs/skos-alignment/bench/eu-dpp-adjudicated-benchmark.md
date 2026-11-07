# SKOS grader benchmark — leaderboard

Task: graded-SKOS relation classification (EXACT/CLOSE/BROAD/NARROW/NONE) against 117 EU DPP adjudicated gold pairs, identical production prompt. The bracket after a model names the rubric it graded under (no bracket: the original rubric, before the curator rubric). Local models run at temperature 0; Anthropic models at their default, since they reject the parameter, and through the Batch API, so they have no latency.

| Model | exact-acc | match/no-match | macroF1 | parse-fail | mean ms |
|---|--:|--:|--:|--:|--:|
| claude-opus-5-5 [curator-5] | 87.2% | 93.2% | 0.82 | 0.0% | 0 |
| claude-fable-5-1 [curator-5] | 76.9% | 88.9% | 0.71 | 1.7% | 0 |
| claude-sonnet-5-5 [curator-5] | 72.6% | 83.8% | 0.69 | 0.0% | 0 |
| claude-haiku-5-5 [curator-5] | 61.5% | 76.1% | 0.56 | 0.0% | 0 |

Full per-relation F1, confusion matrices, and calibration are in the JSON; the AI pipeline doc (`tools/vocab-sync/docs/AI_PIPELINE.md`) interprets these.
