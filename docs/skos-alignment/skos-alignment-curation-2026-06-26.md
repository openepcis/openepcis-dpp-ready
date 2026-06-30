# SKOS alignment — curation decisions (2026-06-26)

Curation of the upstream-vocabulary alignment for branch `vocab-sync/upstream-2026-06-26`.

- **Source report:** the qwen3-32b contested re-judge (`docs/skos-completeness-sync-32b.json`):
  bulk grader `openai/gpt-oss-20b`, QA verifier `qwen/qwen3-32b` (3-judge blind panel).
- **Workbook:** `docs/skos-alignment-review.xlsx`, applied via `vocab-sync curate`.
- **Outcome:** **1080 of 1103 proposed decisions accepted** (23 rejected). 1037 mappings inserted +
  19 existing mappings changed (7 predicate rewrites, 12 removals).

Reproduce / adjust: edit the `Apply?` column in the workbook and re-run

```bash
vocab-sync curate --xlsx docs/skos-alignment-review.xlsx \
    --report docs/skos-completeness-sync-32b.json --stamp 2026-06-26
```

## Policy

- **Adds + add-seealso (1061): accept all.** They are additive and were QA-confirmed at/above the
  graded floor (below it they are emitted as `rdfs:seeAlso`, not a graded claim). No information lost.
- **Rewrites (predicate swaps the panel recommended): accept, unless the swap over-claims.**
- **Removes (drop an existing mapping the panel rejected): accept the drop only when the upstream
  target is generic or a genuinely different concept; otherwise keep the mapping.** The strict-skeptic
  QA lens dropped many same-concept pairs (identical / permuted local names, well-known identifiers,
  same-project delegations); those are kept.

## Rejected: 1 rewrite (kept the safer existing predicate)

| Term | Proposed | Kept | Why |
|---|---|---|---|
| `eubat:selfDischargeRate` → `dppk:selfDischargeCurrent` | closeMatch → **exactMatch** | `closeMatch` | a self-discharge *rate* (%/time) and *current* (A) are different physical quantities; do not assert equivalence. |

Accepted rewrites (7): `oec:DocumentReference`→broadMatch `gs1:ReferencedFileDetails`;
`eubat:hazardImpact`→narrowMatch; `eubat:hazardousSubstances`→exactMatch;
`euelec:powerConsumptionOff`→exactMatch `oec:powerConsumptionOff`;
`eudr:exemptionEffectiveFrom`→closeMatch; `eusteel:technologyRoute`→exactMatch;
`eusteel:MaterialTestCertificate`→narrowMatch `schema:Certification`.

## Rejected: 22 removes (kept the mapping)

Same concept / sound delegation — the panel's NONE verdict was the skeptic lens over-firing.

| Our term | Mapping kept |
|---|---|
| `oec:componentName` | exactMatch `dppk:componentName` |
| `oec:componentIdentifier` | exactMatch `dppk:componentIdentifier` |
| `oec:iupacName` | closeMatch `dppk:componentIupacName` |
| `oec:casNumber` | closeMatch `dppk:componentCasNumber` |
| `oec:endOfLifeInstructions` | exactMatch `dppk:endOfLifeInstructions` |
| `eubat:initialInternalResistance` | exactMatch `dppk:internalResistanceInitial` |
| `eubat:maximumPermittedBatteryPower` | exactMatch `dppk:powerMaximumPermitted` |
| `eubat:remainingPowerCapability` | closeMatch `dppk:powerRemaining` |
| `eubat:maximumVoltage` | exactMatch `dppk:voltageMaximum` |
| `eubat:expectedCycleLife` | exactMatch `dppk:expectedLifetimeCycles` |
| `eubat:cRateLifeCycleTest` | exactMatch `dppk:cRateCycleTest` |
| `eubat:carbonFootprintProduction` | exactMatch `oec:carbonFootprintProduction` (battery → core) |
| `eubat:supplyChainIndex` | closeMatch `dppk:supplyChainIndices` |
| `eubat:Battery` | closeMatch `dppk:BatteryProduct` (cross-profile class anchor) |
| `eucpr:reactionToFireClass` | closeMatch `dppk:reactionToFire` |
| `euelec:weeeRegistrationNumber` | narrowMatch `oec:eprRegistrationNumber` (WEEE ⊂ EPR) |
| `euelec:weeeRegistrationCountry` | narrowMatch `oec:eprJurisdiction` |
| `euppwr:Packaging` | closeMatch `dppk:Packaging` |
| `eutex:organicContentPercentage` | closeMatch `dppk:organicContentPercentage` |
| `eutex:repairServices` | exactMatch `dppk:repairServices` |
| `eutex:containsAnimalNonTextileParts` | exactMatch `dppk:animalOriginNonTextile` |
| `eutex:TechnicalRecyclability` | narrowMatch `oec:RecyclabilityAssessment` |

## Accepted: 12 removes (mapping dropped)

Generic or genuinely different target — the drop is correct.

| Our term | Dropped mapping | Reason |
|---|---|---|
| `oec:EnvironmentalProductDeclaration` | closeMatch `dppk:EPDBlock` | document class vs DPPK data block |
| `oec:compostabilityStandard` | narrowMatch `gs1:certificationStandard` | generic certification target |
| `oec:dppSchemaVersion` | narrowMatch `schema:version` | generic web property |
| `oec:FacilityInformation` | closeMatch `untp:Facility` | info card vs facility entity (granularity) |
| `eubat:carbonFootprintRecycling` | narrowMatch `gs1:sustainabilityInfo` | far-too-generic target |
| `eubat:nickelPreConsumerShare` | narrowMatch `oec:recycledContent` | loose; generic core term |
| `eubat:powerCapabilityRatio` | exactMatch `dppk:powerEnergyRatio` | different metric |
| `eubat:lithiumRecycledShare` | narrowMatch `oec:recycledContent` | loose; generic core term |
| `eubat:carbonFootprintStudyUrl` | closeMatch `dppk:carbonFootprintStudy` | a URL vs the study/document |
| `euelec:modelIdentifier` | narrowMatch `schema:model` | generic; panel split, no support |
| `eutex:recycledContentSource` | narrowMatch `oec:recycledContent` | source vs content amount |
| `eutex:repairServices` | narrowMatch `gs1:serviceInfo` | generic (dppk exactMatch kept instead) |

## Provenance

Machine-readable audit of the applied set: `docs/alignment-provenance.{ttl,json}` and the
per-row review sheet `docs/skos-alignment-review.md`, both regenerated to match the accepted set.
