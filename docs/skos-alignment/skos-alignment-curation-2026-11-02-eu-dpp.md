# SKOS curation — EU DPP Registry semantic data artifacts 1.0.0 (2026-11-02)

First alignment of the OpenEPCIS vocabulary with the European Commission's DPP Registry data
model, mirrored as `extensions/upstream/eu-dpp`. The Commission models the passport fields as
SKOS concepts (the `sh:path` of its own shapes), so vocab-sync indexes the 110 concepts of the
core, common and battery vocabularies as properties (`UpstreamIndex.Source.rdfDataElements`).

## Runs

| Direction | Command | Result |
|---|---|---|
| ours → EU, battery | `audit --module battery --vocab eu-dpp` (gpt-oss-20b, QA panel qwen3-32b) | 1167 pairs graded, 174 findings, QA: 93 STRONG, 33 WEAK, 17 SPLIT, 31 REJECT |
| ours → EU, core | `audit --module core --vocab eu-dpp` | see the core section once written |
| EU → ours | `reverse --vocab eu-dpp --grade --advise` | see the reverse section once written |

Reports: `skos-completeness-battery-eu-dpp-2026-11-02.{md,json}` (gitignored, regenerable).

## Code values (deterministic, no model)

`skos:exactMatch` value by value, because a code list is a fact and not a judgement:
battery category (EV, LMT, industrial), battery status (five values), granularity level (model,
batch, item), access levels public and authorities only (`battery-restricted-type-2`, the same
wording as Annex XIII 3). Stationary, portable and SLI batteries have no EU value. Our chemistry
is not a code list (it is the cathode material as text), so the ten EU chemistry values have no
counterpart yet; the dpp-api derives them.

## Battery data elements: 63 relations written

The panel answers "is there a relation" reliably and "which grade" at chance level (see
`bench/`), and this run showed both: several clearly right pairs came back WEAK or SPLIT
(the three voltages, rated capacity, safety measures, the remaining-capacity family), while the
mechanical triage would have applied many wrong ones. The list was therefore curated by hand
against each EU concept's legal source (scope note) and our term's definition, with the dpp-api
`representation=eu` field mapping as a cross-check: what the renderer writes into an EU field is
the exactMatch candidate.

- **exactMatch** where the EU concept and our term name the same data point of Regulation
  (EU) 2023/1542 (Annex VI A, Annex XIII 1 to 4): mass, rated capacity (also the Annex XIII 4
  `ratedCapacity`, which the guidance declares "same as data point 11"), chemistry, voltages,
  original power capability, power limit, lifetime in cycles and years, the efficiencies, cell
  and pack resistance, charge and discharge C-rate, declaration of conformity, the Annex XIII 4
  state-of-health values, manufacturing place, safety measures, dismantling information,
  negative events, model identifier, last update, passport identifier.
- **broadMatch** where ours is a part or one reading of the EU concept: maximum charging and
  discharging power under power limit, the 80 % and 20 % SoC readings under original power
  capability, cathode, anode and electrolyte under detailed composition, spare parts and
  spare-part sources under the merged 3.2 data point, the extreme-temperature counters under
  the environmental-condition histogram set.
- **narrowMatch** where ours is the broader one: the generic C-rate and the generic initial
  resistance, the operator information over the registrant identity, hazardous substances
  (ours includes mercury, cadmium and lead, the EU field excludes them).
- **closeMatch** where the scope differs slightly: lifetime reference test, test report
  results, cycle count against charging cycles, state-of-charge series against the histogram,
  evolution of self-discharge against the rate set.

## Declined, and why

| Proposal | Reason |
|---|---|
| any `broadMatch core-vocabulary#url`, `common-vocabulary#valueRange`, `#unit`, `core-vocabulary#language` (14 terms) | Serialisation slots of the flat JSON, not concepts; same rule as `gs1:value` in the triage. |
| `hasTechnicalSpecifications`, `hasEndOfLifeInfo` to single fields | A container is not narrower or broader than one of its fields. |
| `exhaustionThreshold`, `renewableContent`, `expectedNumberOfCycles` exactMatch | Duplicates of terms that already carry the exactMatch (`capacityThresholdForExhaustion`, `renewableContentShare`, `expectedCycleLife`); their own SKOS stays with the operative term. |
| `capacityFadeThreshold` → `capacityFade`, `resistanceIncreaseThreshold` → `internalResistanceIncrease` | A threshold is not the measured value. |
| `carbonFootprintDeclarationId` → `otherIdentificationElement`, `numberOfDeepDischargeEvents` → `numberOfDischargingCycles`, `transportationSafetyClass` → `safetyMeasures` | Keyword matches into a different concept. |
| `cadmiumSymbolRequired` / `leadSymbolRequired` → `chemicalSymbol` | Ours is a flag per symbol, the EU field the list of symbols shown; a value mapping, done in the dpp-api, not a SKOS relation. |
| `hasMaterialComposition` → `criticalRawMaterials` | Our composition aggregates data points 12, 13 and 15; the guidance marks the aggregate "not to be filled". |
| `hasInitialCapacity` → `batteryCapacity` | Initial (measured) capacity is not the rated capacity of Annex VI A 6. |
