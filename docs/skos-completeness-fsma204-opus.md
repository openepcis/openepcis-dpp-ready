# SKOS completeness report

Scope: **module=fsma204, 2 terms**  ·  generated 2026-06-24

Each row is a mapping the LLM grader judged a real match between one of our terms and an upstream term, classified against the SKOS already in the TTL.

| Status | Count | Meaning |
|---|---|---|
| MISSING | 2 | grader proposes a mapping the TTL does not assert |
| WEAK | 0 | TTL has only `rdfs:seeAlso`; a graded `skos:*Match` is warranted |
| WRONG | 0 | TTL's graded relation disagrees with the grader |
| OK | 0 | TTL already asserts the grader's relation |

QA verifier (second-tier model): **0 of 2** verified findings confirmed (✓ = QA relation matches the proposal). Prefer confirmed rows when adopting mappings.

## MISSING (2)

### fsma204

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `usfsma:FoodTraceabilityList` | `skos:broadMatch` | 0.90 | NONE | 0.90 | ✗ | https://ref.gs1.org/voc/FruitsVegetables | — | The Food Traceability List includes many specific food categories, while the GS1 class covers only fruits and vegetables, making our term a broader concept. |
| `usfsma:foodTraceabilityListCategory` | `skos:narrowMatch` | 0.75 | NONE | 0.85 | ✗ | https://ref.gs1.org/voc/traceability | — | The candidate property refers to general traceability information, whereas our property specifies the particular FDA Food Traceability List category for a product. |

