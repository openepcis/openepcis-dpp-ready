# Robustness Scoring System

Per EU Preparatory Study on Textiles 3rd Milestone (December 2025).

## Overview

The robustness score is a composite 0-10 score measured after 5 cleaning cycles (ISO 6330). It consists of three test components:

| Component | Max Points | Test Standard |
|-----------|-----------|---------------|
| Spirality | 3 | ISO 16322-3 |
| Dimensional Change | 3 | ISO 3759 |
| Visual Inspection | 4 | ISO 15487 |
| **Total** | **10** | |

## Spirality Test (ISO 16322-3)

Measures fabric twist/skew after washing.

### Woven Fabrics

| Spirality (%) | Score |
|---------------|-------|
| > 6% | 0 |
| 5.5 - 6% | 1 |
| 5 - 5.5% | 2 |
| <= 5% | 3 |

### Knitted Fabrics

| Spirality (%) | Score |
|---------------|-------|
| > 7% | 0 |
| 6 - 7% | 1 |
| 5 - 6% | 2 |
| <= 5% | 3 |

## Dimensional Change Test (ISO 3759)

Measures shrinkage or stretch after washing.

### Woven Fabrics

| Dimensional Change (absolute %) | Score |
|--------------------------------|-------|
| > 4% | 0 |
| 3.5 - 4% | 1 |
| 3 - 3.5% | 2 |
| <= 3% | 3 |

### Knitted Fabrics

| Dimensional Change (absolute %) | Score |
|--------------------------------|-------|
| > 6% | 0 |
| 5.5 - 6% | 1 |
| 5 - 5.5% | 2 |
| <= 5% | 3 |

## Visual Inspection (ISO 15487)

Assessment of garment appearance after washing. Each sub-rating uses a 1-5 scale (ISO grey scale, where 5 = no change).

### Sub-ratings

| Aspect | Rating Scale | What to Assess |
|--------|-------------|----------------|
| Colour change | 1-5 | Fading, bleeding, yellowing |
| Fabric appearance | 1-5 | Pilling, surface changes, nap loss |
| Seam appearance | 1-5 | Puckering, twisting, opening |
| Non-textile parts | 1-5 | Buttons, zippers, trims condition |

### Score Conversion

The visual inspection score (0-4 pts) is derived from the average of the four sub-ratings:

| Average Sub-rating | Score |
|-------------------|-------|
| < 2.0 | 0 |
| 2.0 - 2.9 | 1 |
| 3.0 - 3.4 | 2 |
| 3.5 - 4.4 | 3 |
| >= 4.5 | 4 |

## Example Calculation

A woven winter jacket tested after 5 wash cycles:

| Test | Measured | Score |
|------|----------|-------|
| Spirality | 4.2% (woven: <= 5%) | 3 |
| Dimensional Change | 3.2% (woven: 3-3.5%) | 2 |
| Visual: Colour | 4/5 | |
| Visual: Fabric | 4/5 | |
| Visual: Seams | 5/5 | |
| Visual: Non-textile | 4/5 | |
| Visual average | 4.25 (3.5-4.4) | 3 |
| **Total** | | **8/10** |

## Ontology Mapping

```turtle
eutex:RobustnessAssessment    # Container class
  eutex:robustnessScore       # 0-10 composite score
  eutex:cleaningCyclesBeforeTest  # Number of wash cycles (default 5)
  eutex:robustnessTestFabricType  # Determines threshold tables
  eutex:spiralityTest         # -> SpiralityTestResult
  eutex:dimensionalChangeTest # -> DimensionalChangeTestResult
  eutex:visualInspection      # -> VisualInspectionResult
```
