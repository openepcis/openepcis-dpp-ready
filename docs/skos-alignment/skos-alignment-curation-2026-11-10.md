# SKOS curation — re-assessment after assessment waves 3 and 4 (2026-11-10)

Waves 3 and 4 moved measured and tested values of core, textile, iron-steel, electronics and
battery onto `common/assessment`; their external mappings moved with them (exactMatch on a removed
property → closeMatch on the parameter). This run re-assesses every module the waves touched against
all upstream vocabularies, including BatteryPass-Ready 2.0.1 (`bpr:`, 122 data elements).

## Runs

| Direction | Command | Models |
|---|---|---|
| ours → upstream | `audit --module {core, assessment, textile, iron-steel, electronics, battery}` | grading Sonnet 5.5, QA panel Opus 5.5 (Anthropic batch) |
| upstream → ours | `reverse --vocab {eudpp, cirpass2-textile, cirpass2-battery, eu-dpp, batterypass, bpr} --grade --advise` | same |

Reports: `skos-completeness-<module>-2026-11-10.{md,json}`, `skos-reverse-coverage-<vocab>-2026-11-10.*`
(gitignored, regenerable). Triage: `scripts/triage-skos-report.ts`.

## Audit: applied

| Module | Change | Term | Upstream |
|---|---|---|---|
| core | new exactMatch | `oec:carbonFootprintStudyUrl` | `dppk:carbonFootprintStudy` |
| core | closeMatch → exactMatch | `oec:ImpactIndicatorResult` | `dppk-epd:ImpactValues` |
| core | removed broadMatch | `oec:RepairProvider` | `schema:AutoRepair` (car repair) |
| assessment | new narrowMatch | `oea:CriterionResult` | CIRPASS-2 `RecyclabilityCriterionResult` |
| assessment | new narrowMatch | `oea:PerformanceParameter` | CIRPASS-2 `ObservedPerformanceParameter` (textile) |
| textile | new exactMatch | `eutex:endOfLifeHandling` | `eudpp:hasEndOfLifeManagementInstruction` |
| textile | new exactMatch | `eutex:TextileProduct` | `dppk:TextileProduct` |
| textile | removed narrowMatch ×2 | `eutex:EnvironmentalFootprint` | `eudpp:MaterialFootprint`, `eudpp:LCIAResult` |
| textile | new closeMatch (curated) | `eutex:EnvironmentalFootprint` | `eudpp:LCAStudy` (the cirpass2 crosswalk converts the footprint to an LCA study) |
| iron-steel | removed broadMatch | `eusteel:meltAndPourCountry` | `schema:addressCountry` |
| electronics | closeMatch → broadMatch | `euelec:ElectronicComponent` | `dppk:Component` |
| battery | new broadMatch | `eubat:lithiumPreConsumerShare` | SAMM `preConsumerShare` (as its nickel and cobalt siblings) |
| battery | new broadMatch | `eubat:hasMaximumChargingPower` | CIRPASS-2 battery `maximumPermittedBatteryPower` |
| battery | new broadMatch | `eubat:electrolyteType` | `dppk:batteryChemistry` |
| battery | closeMatch → exactMatch | `eubat:dueDiligenceReportUrl` | `dppk:dueDiligenceReport` |
| battery | removed broadMatch | `eubat:cobaltRecycledShare` | `dppk:postConsumerRecycledContent` |

BatteryPass-Ready 2.0.1: the battery and core mappings follow the `batterypass` crosswalk table
(commit "complete the BatteryPass-Ready 2.0.1 mappings"): a term the crosswalk converts to a 2.0.1
element maps to it, exactMatch for the same data element, closeMatch where OpenEPCIS keeps a bare URL
and 2.0.1 a resource, or a parameter concept where 2.0.1 has a property. The audit's two 2.0.1
proposals above the floor are among them (`thirdPartyAssurancesUrl` exact; `resultOfTestReport`
written as closeMatch for that reason).

## Audit: held

| Term | Proposal | Why held |
|---|---|---|
| `oec:hasCarbonFootprintDistribution` | exactMatch `bpr:contributionOfDistributionLifecycleStage` | `eubat:hasCarbonFootprintDistribution` is that data element; two exactMatch on one target would make our side a duplicate |
| `oec:remanufacturingDate` | narrowMatch → exactMatch `rail:itemReconditioningDate` | reconditioning (rail) is one kind of remanufacturing; kept narrow |
| `euelec:componentPartNumber` | exactMatch CIRPASS-2 battery `partNumber` | a battery-module term for a cross-sector electronics component |
| `oea:Threshold` | broadMatch `cccev:Criterion` | already a subclass of `oea:Criterion` ⊑ `cccev:Criterion` |

## Reverse runs

| Upstream | Terms | covered / proposed / code list / uncovered | Applied |
|---|---|---|---|
| EUDPP core | 536 | 154 / 38 / 152 / 192 | none above the floor |
| CIRPASS-2 textile | 421 | see report | `oea:NumberOfCycles` exactMatch `txt-assessment:NumberOfCycles` (the panel proposed `oea:MeasurementParameter` narrowMatch; the parameter is a concept of that scheme, mapped concept to class as the other parameters) |
| CIRPASS-2 battery | | see report | none (its one proposal is `euelec:componentPartNumber`, held above) |
| EU DPP Registry | | see report | none above the floor |
| BatteryPass SAMM | | see report | none above the floor |
| BatteryPass-Ready 2.0.1 | 139 | 77 / 18 / 5 / 39 | `oec:lastUpdated` exactMatch `bpr:lastUpdated` (header of the 2.0.1 document; the crosswalk pairs them) |

Findings below the 0.8 floor and the ADOPT / MAP advice of the reverse runs are curator work: the
reports list them with the panel's reasons.
