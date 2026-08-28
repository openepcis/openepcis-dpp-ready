# SKOS grader benchmark — leaderboard

Task: graded-SKOS relation classification (EXACT/CLOSE/BROAD/NARROW/NONE) against 126 GS1 domain gold pairs, identical production prompt, temperature 0.

| Model | exact-acc | match/no-match | macroF1 | parse-fail | mean ms |
|---|--:|--:|--:|--:|--:|
| openai/gpt-oss-20b | 49.1% | 73.7% | 0.42 | 0.0% | 1627 |
| qwen/qwen3.5-27b | 47.4% | 68.4% | 0.34 | 0.0% | 4617 |
| mistralai/devstral-small-2-2512 | 21.1% | 76.3% | 0.15 | 0.0% | 1932 |

Full per-relation F1, confusion matrices, and calibration are in the JSON; the AI pipeline doc (`tools/vocab-sync/docs/AI_PIPELINE.md`) interprets these.
