# SKOS grader benchmark — leaderboard

Task: graded-SKOS relation classification (EXACT/CLOSE/BROAD/NARROW/NONE) against 90 EU DPP Registry gold pairs, identical production prompt. The bracket after a model names the rubric it graded under (no bracket: the original rubric, before the curator rubric). Local models run at temperature 0; Anthropic models at their default, since they reject the parameter, and through the Batch API, so they have no latency.

| Model | exact-acc | match/no-match | macroF1 | parse-fail | mean ms |
|---|--:|--:|--:|--:|--:|
| claude-opus-5-5 [curator-5] | 88.9% | 97.8% | 0.79 | 0.0% | 0 |
| claude-sonnet-5-5 [curator-5] | 85.6% | 93.3% | 0.74 | 0.0% | 0 |
| claude-fable-5-1 [curator-5] | 82.2% | 93.3% | 0.69 | 0.0% | 0 |
| claude-haiku-5-5 [curator-5] | 77.8% | 92.2% | 0.64 | 0.0% | 0 |
| qwen/qwen3.8-27b think-medium [curator-5] | 76.7% | 91.1% | 0.62 | 0.0% | 33968 |
| qwen/qwen3.6-35b-a3b think-medium [curator-5] | 75.6% | 88.9% | 0.57 | 1.1% | 16600 |
| qwen/qwen3.8-27b [curator-5] | 73.3% | 87.8% | 0.44 | 0.0% | 3467 |
| openai/gpt-oss-120b think-medium [curator-5] | 72.2% | 85.6% | 0.49 | 0.0% | 5540 |
| qwen/qwen3.6-35b-a3b [curator-5] | 65.6% | 82.2% | 0.33 | 0.0% | 878 |
| openai/gpt-oss-20b [curator-5] | 60.0% | 81.1% | 0.40 | 0.0% | 1064 |
| openai/gpt-oss-120b [curator-5] | 60.0% | 78.9% | 0.41 | 10.0% | 1731 |

Full per-relation F1, confusion matrices, and calibration are in the JSON; the AI pipeline doc (`tools/vocab-sync/docs/AI_PIPELINE.md`) interprets these.
