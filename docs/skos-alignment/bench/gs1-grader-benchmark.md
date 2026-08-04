# SKOS grader benchmark — leaderboard

Task: graded-SKOS relation classification (EXACT/CLOSE/BROAD/NARROW/NONE) against 109 STW↔Wikidata gold pairs, identical production prompt, temperature 0.

| Model | exact-acc | match/no-match | macroF1 | parse-fail | mean ms |
|---|--:|--:|--:|--:|--:|
| openai/gpt-oss-20b | 45.0% | 75.2% | 0.36 | 0.0% | 2054 |
| qwen/qwen3.5-27b | 45.0% | 67.0% | 0.31 | 0.0% | 5801 |
| mistralai/devstral-small-2-2512 | 22.0% | 76.1% | 0.16 | 0.0% | 2720 |

Full per-relation F1, confusion matrices, and calibration are in the JSON; the AI pipeline doc (`tools/vocab-sync/docs/AI_PIPELINE.md`) interprets these.
