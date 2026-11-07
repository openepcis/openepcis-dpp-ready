# SKOS grader benchmark — leaderboard

Task: graded-SKOS relation classification (EXACT/CLOSE/BROAD/NARROW/NONE) against 126 GS1 domain gold pairs, identical production prompt. The bracket after a model names the rubric it graded under (no bracket: the original rubric, before the curator rubric). Local models run at temperature 0; Anthropic models at their default, since they reject the parameter, and through the Batch API, so they have no latency.

| Model | exact-acc | match/no-match | macroF1 | parse-fail | mean ms |
|---|--:|--:|--:|--:|--:|
| claude-opus-5-5 [curator-5] | 45.2% | 62.7% | 0.33 | 0.0% | 0 |
| claude-sonnet-5-5 [curator-5] | 44.4% | 61.9% | 0.33 | 0.0% | 0 |
| claude-fable-5-1 [curator-5] | 43.7% | 64.3% | 0.35 | 0.0% | 0 |
| qwen/qwen3.8-27b [curator-5] | 43.7% | 61.9% | 0.36 | 0.0% | 3315 |
| claude-haiku-5-5 [curator-5] | 37.3% | 57.9% | 0.30 | 0.0% | 0 |
| openai/gpt-oss-20b [curator-5] | 31.7% | 69.0% | 0.29 | 0.0% | 1189 |

Full per-relation F1, confusion matrices, and calibration are in the JSON; the AI pipeline doc (`tools/vocab-sync/docs/AI_PIPELINE.md`) interprets these.
