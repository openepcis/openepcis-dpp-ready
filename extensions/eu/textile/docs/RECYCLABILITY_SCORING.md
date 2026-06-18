# Recyclability Scoring System

Per EU Preparatory Study on Textiles 3rd Milestone (December 2025).

## Overview

The recyclability score is a 0-10 composite score based on three factors:

| Factor | Description | Impact |
|--------|-------------|--------|
| Elastane content | Elastane > 5% penalises recyclability | -2 to 0 pts penalty |
| Sorting factors | Product design for sortability | 0-4 pts bonus |
| Technical recyclability | Based on applicable recycling technology | 0-6 pts |

## Elastane Content Penalty

| Elastane Content | Penalty |
|-----------------|---------|
| <= 5% | 0 (no penalty) |
| > 5% and <= 10% | -1 |
| > 10% | -2 |

## Sorting Factors (0-4 points)

Each factor contributes +1 point if satisfied:

| Factor | Criteria | Points |
|--------|----------|--------|
| Same inner/outer composition | Inner and outer layers have matching fiber composition | +1 |
| Free from printings | No non-removable screen prints, transfers, or sublimation prints | +1 |
| Free from coatings | No PU coatings, laminations, or membrane layers | +1 |
| Free from sequins | No sequins, beads, rhinestones, or non-textile embellishments | +1 |

## Technical Recyclability (0-6 points)

Based on the dominant fiber and its applicable recycling technology:

| Technology | Applicable Fibers | Max Score |
|-----------|-------------------|-----------|
| Mechanical Recycling | Cotton, wool, mixed natural | 4 |
| Chemical Recycling (Cotton) | Cotton (high purity) | 6 |
| Thermo-Chemical Recycling | Polyester (high purity) | 6 |
| Chemical Recycling (PA6) | Polyamide 6 (high purity) | 5 |
| Thermo-Mechanical Recycling | PP, PET blends | 3 |

Fiber purity affects the score within each technology:

| Dominant Fiber Purity | Score Multiplier |
|----------------------|-----------------|
| >= 95% single fiber | 1.0x |
| 80-95% dominant | 0.75x |
| 60-80% dominant | 0.5x |
| < 60% (complex blend) | 0.25x |

## Example Calculations

### Cotton T-shirt (95% cotton, 5% elastane)

| Factor | Details | Score |
|--------|---------|-------|
| Elastane penalty | 5% (no penalty) | 0 |
| Same composition | Single layer, yes | +1 |
| Free from printings | No print | +1 |
| Free from coatings | No coating | +1 |
| Free from sequins | No sequins | +1 |
| Technical recyclability | Mechanical, 95% cotton, 4 x 1.0 | +4 |
| **Total** | | **8/10** |

### Polyester-Elastane Legging (88% PES, 12% EL)

| Factor | Details | Score |
|--------|---------|-------|
| Elastane penalty | 12% (> 10%) | -2 |
| Same composition | Single layer, yes | +1 |
| Free from printings | Printed pattern | +0 |
| Free from coatings | No coating | +1 |
| Free from sequins | No sequins | +1 |
| Technical recyclability | Thermo-chemical, 88% PES, 6 x 0.75 | +4.5 |
| **Total** | | **5.5/10** |

### Winter Jacket (rPET/PA/Down blend)

| Factor | Details | Score |
|--------|---------|-------|
| Elastane penalty | 5% | 0 |
| Same composition | Different inner/outer | +0 |
| Free from printings | Yes | +1 |
| Free from coatings | Water-repellent coating | +0 |
| Free from sequins | Yes | +1 |
| Technical recyclability | Thermo-chemical, 55% PES, 6 x 0.5 | +3 |
| **Total** | | **5/10** |

## Ontology Mapping

```turtle
eutex:RecyclabilityAssessment     # Container class
  eutex:recyclabilityScore        # 0-10 composite score
  eutex:isRecyclable              # Boolean (score above threshold)
  eutex:elastaneContentPercent    # Elastane % for penalty calc
  eutex:sortingFactors            # -> SortingFactors
  eutex:technicalRecyclability    # -> TechnicalRecyclability
```
