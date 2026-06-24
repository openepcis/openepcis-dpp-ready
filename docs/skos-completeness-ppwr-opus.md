# SKOS completeness report

Scope: **module=ppwr, 6 terms**  ·  generated 2026-06-24

Each row is a mapping the LLM grader judged a real match between one of our terms and an upstream term, classified against the SKOS already in the TTL.

| Status | Count | Meaning |
|---|---|---|
| MISSING | 3 | grader proposes a mapping the TTL does not assert |
| WEAK | 0 | TTL has only `rdfs:seeAlso`; a graded `skos:*Match` is warranted |
| WRONG | 0 | TTL's graded relation disagrees with the grader |
| OK | 1 | TTL already asserts the grader's relation |

QA verifier (second-tier model): **0 of 4** verified findings confirmed (✓ = QA relation matches the proposal). Prefer confirmed rows when adopting mappings.

## MISSING (3)

### ppwr

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `euppwr:Packaging` | `skos:closeMatch` | 0.75 | `skos:broadMatch` | 0.70 | ✗ | https://ref.gs1.org/voc/PackagingDetails | — | Both classes describe packaging items and include details such as type, materials, and recycling information, but the OUR term is specifically tied to PPWR regulatory context while the GS1 class is a general packaging description. |
| `euppwr:PackagingTier` | `skos:narrowMatch` | 0.80 | NONE | 0.85 | ✗ | https://dpp-keystone.org/spec/v2/terms#Packaging | — | PackagingTier is a specific position within the packaging hierarchy, whereas the upstream Packaging class represents any packaging item. |
| `euppwr:PackagingTier` | `skos:narrowMatch` | 0.75 | NONE | 0.82 | ✗ | https://ref.gs1.org/voc/PackagingDetails | — | The upstream class describes general packaging details, whereas our class specifies a particular tier within the consumption hierarchy. |

## OK (1)

### ppwr

| Our term | Proposed | Conf | QA | QAc | ✓ | Upstream IRI | Existing | Rationale |
|---|---|---|---|---|---|---|---|---|
| `euppwr:Packaging` | `skos:closeMatch` | 0.80 | `skos:narrowMatch` | 0.60 | ✗ | https://dpp-keystone.org/spec/v2/terms#Packaging | `skos:closeMatch` | Both classes represent a packaging item, but the upstream term is a generic packaging concept while ours is specific to PPWR regulation. |

