# SKOS grader benchmark — leaderboard

Task: graded-SKOS relation classification (EXACT/CLOSE/BROAD/NARROW/NONE) against 200 STW↔Wikidata gold pairs, identical production prompt, temperature 0.

| Model | exact-acc | match/no-match | macroF1 | parse-fail | mean ms |
|---|--:|--:|--:|--:|--:|
| claude-opus-4-8 | 52.5% | 83.0% | 0.46 | 0.0% | 7935 |
| lmstudio-community/Qwen3-32B-MLX-8bit | 52.5% | 85.0% | 0.50 | 0.0% | 25505 |
| openai/gpt-oss-20b | 52.0% | 86.5% | 0.47 | 0.0% | 1423 |
| qwen/qwen3-32b | 48.5% | 82.0% | 0.45 | 0.5% | 13295 |
| lmstudio-community/Qwen3-32B-MLX-4bit | 48.5% | 82.0% | 0.45 | 0.5% | 14167 |
| qwen/qwen3-coder-30b | 47.0% | 89.5% | 0.39 | 0.0% | 663 |
| mistralai/devstral-small-2-2512 | 47.0% | 95.5% | 0.41 | 0.0% | 1515 |
| deepseek/deepseek-r1-0528-qwen3-8b | 47.0% | 75.5% | 0.44 | 2.5% | 18113 |
| qwen3.5-122b-a10b | 46.5% | 64.0% | 0.47 | 15.0% | 49699 |
| zai-org/glm-4.7-flash | 43.0% | 70.5% | 0.40 | 10.5% | 18892 |
| mistralai/magistral-small-2509 | 41.0% | 83.0% | 0.32 | 0.0% | 1501 |
| qwen/qwen3-coder-next | 40.5% | 88.5% | 0.35 | 1.0% | 1132 |
| microsoft/phi-4-mini-reasoning@16k | 34.5% | 71.5% | 0.30 | 13.0% | 23821 |
| microsoft/phi-4-mini-reasoning | 32.0% | 68.0% | 0.27 | 18.5% | 11301 |

Full per-relation F1, confusion matrices, and calibration are in the JSON; the AI pipeline doc (`tools/vocab-sync/docs/AI_PIPELINE.md`) interprets these.
