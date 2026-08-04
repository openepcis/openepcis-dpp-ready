# EC Battery Passport guidance — data-point coverage

How the 71 data points of the European Commission **Guidance Document: Digital Batteries Passport - data points by category**
(Version 1.0, 2026-07-28, Ares(2026)7579758, CC BY 4.0) map onto the
OpenEPCIS battery vocabulary (`eubat:` plus `gs1:` / `schema:` / `oec:`).

- **Machine-readable registry (RDF)**: [`../vocab/ec-battery-passport-guidance-1.0.ttl`](../vocab/ec-battery-passport-guidance-1.0.ttl) — minted under `https://ref.openepcis.io/vocab/ec-battery-passport-guidance/1.0#` because the Commission publishes no IRIs (same pattern as the GEFEG BatteryPass-Ready mirror). Each data point is dual-typed `rdf:Property` + `cccev:InformationRequirement`.
- **Applicability matrix (JSON)**: [`../validation/ec-datapoint-applicability.json`](../validation/ec-datapoint-applicability.json).
- **SHACL readiness shapes**: [`../validation/ec-readiness-shapes.ttl`](../validation/ec-readiness-shapes.ttl) — the matrix made executable for any SHACL engine: one node shape per (data point, category) with the status mapped to severity (mandatory = Violation, conditional = Warning, optional/pending = Info) and the anchor paths derived from the ontologies' `rdfs:domain` declarations. All shapes ship `sh:deactivated true`; activate exactly one category (IRI suffix `-ev`/`-lmt`/`-industrial`) and validate the merged model + batch + item graphs. `pnpm run check:ec-readiness -- --shacl` does both automatically.
- **Source of truth**: [`../vocab/ec-guidance-datapoints.json`](../vocab/ec-guidance-datapoints.json); regenerate with `pnpm run build:ec-guidance-vocab`.

## The four mechanics encoded in the guidance table

1. **Static vs. dynamic** — Annex XIII 4 data points (51–71) are *dynamic*: the guidance
   marks the static Annex XIII 1(g) rated capacity (#25) "not to be filled" and re-lists it
   as #51 "same as data point 11, **but now dynamic**". Dynamic data points are folded from
   the EPCIS event stream into the item passport; static ones are resolver-served master data.
   Each dynamic entry links the EPCIS event example that demonstrates it.
2. **Access tiers** — the "data point source" column determines who may read the value via
   BR Article 77(2): Annex XIII 1 / VI A / Art. 77(3) = public, XIII 2 and XIII 4 = persons
   with a legitimate interest, XIII 3 = notified bodies and market surveillance authorities.
3. **Category-conditional obligation** — obligation is a function of (data point, battery
   category): e.g. SOCE (#61) is EV-only while the remaining-capacity family (#62–66) applies
   to LMT/industrial; #33 capacity threshold is EV-only.
4. **Regulatory lifecycle** — "pending" data points (#17–19 carbon footprint, #44 instructions
   for use) are not to be filled as of February 2027 because the implementing act / Omnibus IV
   is outstanding; a validator must distinguish *missing* from *not yet required*.

## Coverage table

Applicability: **M** mandatory · **O** optional · **C** conditional (see note) · **P** pending
(not as of Feb 2027, act outstanding) · **–** not to be filled/displayed.

| # | Data point | Source | EV | LMT | Ind | Lifecycle | Implemented by |
|---|---|---|---|---|---|---|---|
| 1 | Unique identifier | BR Article 77 (3) | M | M | M | static | `eubat:batteryPassportIdentifier` |
| 2 | Identity of who is registering and/or is responsible for the battery passport | BR Article 77 (3) | M | M | M | static | `eubat:operatorInformation`, `eubat:operatorIdentifier`, `eubat:operatorRole` |
| 3 | Manufacturer name, registered trade name or registered trade mark | BR Annex VI A (1) | M | M | M | static | `gs1:manufacturer`, `gs1:organizationName` |
| 4 | Manufacturer postal address, indicating a single contact point | BR Annex VI A (1) | M | M | M | static | `gs1:address`, `gs1:PostalAddress` |
| 5 | If available, manufacturer web and email address | BR Annex VI A (1) | O | O | O | static | `gs1:contactPoint`, `gs1:ContactPoint` |
| 6 | Battery category | BR Annex VI A (2) | M | M | M | static | `eubat:BatteryCategory`, `schema:category` |
| 7 | Model identification and batch or serial number, or product number or another element a… | BR Annex VI A (2) | M | M | M | static | `eubat:batteryModelIdentifier`, `gs1:hasSerialNumber` |
| 8 | The place of manufacturer (geographical location of a battery manufacturing plant) | BR Annex VI A (3) | M | M | M | static | `eubat:manufacturingPlace`, `eubat:facilityIdentifier` |
| 9 | The date of manufacturing (month and year) | BR Annex VI A (4) | M | M | M | static | `gs1:productionDate` |
| 10 | The weight | BR Annex VI A (5) | M | M | M | static | `eubat:batteryMass`, `gs1:netWeight` |
| 11 | The capacity | BR Annex VI A (6) | M | M | M | static | `eubat:ratedCapacity` |
| 12 | The chemistry | BR Annex VI A (7) | M | M | M | static | `eubat:batteryChemistry` |
| 13 | The hazardous substances present in the battery, other than mercury, cadmium or lead | BR Annex VI A (8) | M | M | M | static | `eubat:hazardousSubstances`, `eubat:HazardousSubstance` |
| 14 | Usable extinguishing agent | BR Annex VI A (9) | M | M | M | static | `eubat:extinguishingAgent` |
| 15 | Critical raw materials present in the battery in a concentration of more than 0,1 % wei… | BR Annex VI A (10) | M | M | M | static | `eubat:isCriticalRawMaterial`, `eubat:criticalRawMaterialsStatement` |
| 16 | The material composition of the battery, including its chemistry, hazardous substances … | — | - | - | - | static | `eubat:materialComposition` |
| 17 | The carbon footprint declaration | BR Annex XIII 1 (c) | P | P | P | static | `eubat:carbonFootprintDeclaration`, `eubat:CarbonFootprintDeclaration` |
| 18 | The carbon footprint label | BR Annex XIII 1 (c) | P | P | P | static | `eubat:carbonFootprintPerformanceClass` |
| 19 | Information on responsible sourcing as indicated in the report on battery due diligence… | BR Annex XIII 1 (d) | P | P | P | static | `eubat:supplyChainDueDiligence`, `eubat:dueDiligenceReportUrl` |
| 20 | Percentage share of cobalt that is present in active materials and that has been recove… | BR Annex XIII 1 (e) | M | M | M | static | `eubat:cobaltRecycledShare` |
| 21 | Percentage share of lithium that is present in active materials and that has been recov… | BR Annex XIII 1 (e) | M | M | M | static | `eubat:lithiumRecycledShare` |
| 22 | Percentage share of nickel that is present in active materials and that has been recove… | BR Annex XIII 1 (e) | M | M | M | static | `eubat:nickelRecycledShare` |
| 23 | The percentage share of lead that is present in the battery and that has been recovered… | BR Annex XIII 1 (e) | M | M | M | static | `eubat:leadRecycledShare` |
| 24 | The share of renewable content | BR Annex XIII 1 (f) | M | M | M | static | `eubat:renewableContentShare` |
| 25 | Rated capacity (in Ah) | BR Annex XIII 1 (g) | - | - | - | static | `eubat:ratedCapacity` |
| 26 | Minimal voltage, with temperature range when relevant | BR Annex XIII 1 (h) | M | M | M | static | `eubat:minimumVoltage` |
| 27 | Nominal voltage, with temperature range when relevant | BR Annex XIII 1 (h) | M | M | M | static | `eubat:nominalVoltage` |
| 28 | Maximum voltage, with temperature range when relevant | BR Annex XIII 1 (h) | M | M | M | static | `eubat:maximumVoltage` |
| 29 | Original power capability (in Watts) | BR Annex XIII 1 (i) | M | M | M | static | `eubat:originalPowerCapability` |
| 30 | Power limits, with temperature range when relevant | BR Annex XIII 1 (i) | M | M | M | static | `eubat:maximumPermittedBatteryPower`, `eubat:maximumChargingPower`, `eubat:maximumDischargingPower` |
| 31 | Expected battery lifetime expressed in cycles | BR Annex XIII 1 (j) | M | M | C | static | `eubat:expectedNumberOfCycles`, `eubat:expectedCycleLife` |
| 32 | Reference test used for expected battery lifetime expressed in cycles | BR Annex XIII 1 (j) | M | M | C | static | `eubat:lifetimeReferenceTest` |
| 33 | Capacity threshold for exhaustion | BR Annex XIII 1 (k) | M | - | - | static | `eubat:capacityThresholdForExhaustion` |
| 34 | Temperature range the battery can withstand when not in use (reference test) | BR Annex XIII 1 (l) | M | M | M | static | `eubat:temperatureRangeIdleState` |
| 35 | Period for which the commercial warranty for the calendar life applies | BR Annex XIII 1 (m) | C | C | C | static | `eubat:warrantyConditions`, `gs1:warranty` |
| 36 | Initial round trip energy efficiency | BR Annex XIII 1 (n) | M | M | C | static | `eubat:roundTripEnergyEfficiency`, `eubat:roundTripEfficiency` |
| 37 | Round trip energy efficiency at 50 % of cycle-life | BR Annex XIII 1 (n) | M | M | C | static | `eubat:roundTripEfficiencyAt50PercentCycleLife` |
| 38 | Internal battery cell and pack resistance | BR Annex XIII 1 (o) | M | M | M | static | `eubat:initialInternalResistance` |
| 39 | C-rate of relevant cycle-life test | BR Annex XIII 1 (p) | M | M | C | static | `eubat:cRateLifeCycleTest` |
| 40 | The marking requirements laid down in Article 13(4) | BR Annex XIII 1 (q) | M | M | M | static | `eubat:labels`, `eubat:separateCollectionSymbolUrl` |
| 41 | The marking requirements laid down in Article 13(5) | BR Annex XIII 1 (q) | C | C | C | static | `eubat:cadmiumSymbolRequired`, `eubat:leadSymbolRequired` |
| 42 | The EU declaration of conformity referred to in Article 18 | BR Annex XIII 1 (r) | M | M | M | static | `eubat:euDeclarationOfConformity` |
| 43 | The information regarding the prevention and management of waste batteries laid down in… | BR Annex XIII 1 (s) | M | M | M | static | `eubat:wastePrevention`, `eubat:informationOnCollection`, `eubat:separateCollection` |
| 44 | Clear, understandable and readable instructions for use in a format that makes it possi… | BR Annex XIII 1 (t) | P | P | P | static | `gs1:instructionsForUse`, `gs1:consumerUsageInstructions` |
| 45 | Detailed composition, including materials used in the cathode, anode and electrolyte | BR Annex XIII 2 (a) | M | M | M | static | `eubat:cathodeActiveMaterial`, `eubat:anodeActiveMaterial`, `eubat:electrolyteComposition` |
| 46 | Part numbers for components | BR Annex XIII 2 (b) | M | M | M | static | `eubat:spareParts` |
| 47 | Contact details of sources for replacement spares | BR Annex XIII 2 (b) | M | M | M | static | `eubat:sparePartSources`, `eubat:supplierContact` |
| 48 | Dismantling information, including at least: exploded diagrams of the battery system/pa… | BR Annex XIII 2 (c) | M | M | M | static | `eubat:dismantlingDocuments`, `eubat:dismantlingInstructions` |
| 49 | Safety measures | BR Annex XIII 2 (d) | M | M | M | static | `eubat:safetyMeasures`, `eubat:safetyInstructions` |
| 50 | Results of test reports proving compliance with the requirements laid down in this Regu… | BR Annex XIII 3 | M | M | M | static | `eubat:resultOfTestReport`, `eubat:testReportNumber` |
| 51 | Rated capacity (in Ah) | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:ratedCapacity` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 52 | Capacity fade (in %) | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:capacityFade` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 53 | Power (in W) | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:powerCapability` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 54 | Power fade (in %) | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:powerFade` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 55 | Internal resistance (in Ω) | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:internalResistance` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 56 | Internal resistance increase (in %) | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:internalResistanceIncrease` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 57 | Where applicable, energy round trip efficiency (in %) | BR Annex XIII 4 (a) | C | C | C | dynamic | `eubat:roundTripEfficiency` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 58 | Where applicable, energy round trip efficiency fade (in %) | BR Annex XIII 4 (a) | C | C | C | dynamic | `eubat:roundTripEfficiencyFade` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 59 | The expected life-time of the battery under the reference conditions for which it has b… | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:expectedRemainingCycles` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 60 | The expected life-time of the battery under the reference conditions for which it has b… | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:expectedLifetimeYears`, `eubat:expectedRemainingLifetimeMonths` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 61 | Information on the state of health of the battery pursuant to Article 14: state of cert… | BR Annex XIII 4 (b) | M | - | - | dynamic | `eubat:stateOfCertifiedEnergy` → [`epcis/state-of-certified-energy.jsonld`](../epcis/state-of-certified-energy.jsonld) |
| 62 | Information on the state of health of the battery pursuant to Article 14: remaining cap… | BR Annex XIII 4 (b) | - | M | C | dynamic | `eubat:remainingCapacity` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 63 | Information on the state of health of the battery pursuant to Article 14: where possibl… | BR Annex XIII 4 (b) | - | M | C | dynamic | `eubat:remainingPowerCapability` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 64 | Information on the state of health of the battery pursuant to Article 14: where possibl… | BR Annex XIII 4 (b) | - | M | C | dynamic | `eubat:remainingRoundTripEfficiency` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 65 | Information on the state of health of the battery pursuant to Article 14: where possibl… | BR Annex XIII 4 (b) | - | M | C | dynamic | `eubat:evolutionOfSelfDischarge`, `eubat:currentSelfDischargingRate` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 66 | Information on the state of health of the battery pursuant to Article 14: where possibl… | BR Annex XIII 4 (b) | - | M | C | dynamic | `eubat:internalResistance` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 67 | Information on the status of the battery, defined as 'original', 'repurposed', 're-used… | BR Annex XIII 4 (c) | M | M | M | dynamic | `schema:status`, `eubat:BatteryStatus` → [`epcis/commissioning.jsonld`](../epcis/commissioning.jsonld) |
| 68 | The number of charging and discharging cycles | BR Annex XIII 4 (d) | C | C | C | dynamic | `eubat:numberOfFullCycles`, `eubat:cycleCount` → [`epcis/amperia-staxwall-lifecycle.jsonld`](../epcis/amperia-staxwall-lifecycle.jsonld) |
| 69 | Negative events, such as accidents | BR Annex XIII 4 (d) | C | C | C | dynamic | `eubat:negativeEvents`, `eubat:NegativeEvent` → [`epcis/negative-event.jsonld`](../epcis/negative-event.jsonld) |
| 70 | Periodically recorded information on the operating environmental conditions, including … | BR Annex XIII 4 (d) | C | C | C | dynamic | `eubat:timeSpentInExtremeTemperaturesAboveBoundary`, `eubat:timeSpentInExtremeTemperaturesBelowBoundary` → [`epcis/temperature-extreme.jsonld`](../epcis/temperature-extreme.jsonld) |
| 71 | Periodically recorded information on the state of charge | BR Annex XIII 4 (d) | C | C | C | dynamic | `eubat:stateOfCharge` → [`epcis/amperia-staxwall-lifecycle.jsonld`](../epcis/amperia-staxwall-lifecycle.jsonld) |

## Coverage result

All 71 data points are covered by existing terms — no new `eubat:` terms were required.
The split follows the vocabulary layering rule: GS1 Web Vocabulary terms where GS1 already
covers the concept (manufacturer identity #3–5, production date #9, net weight #10, serial
number #7, instructions for use #44), `eubat:` terms for battery-specific concepts, and
identification mechanics (passport ID #1, batch/serial #7) via GS1 Digital Link path
segments rather than data attributes. Periodic recordings (#70–71) are the EPCIS
`sensorElementList` mechanism rather than master-data attributes.

## Verbatim conditions

Data points whose applicability carries a condition, with the guidance's wording:

| # | Category | Condition |
|---|---|---|
| 5 | EV | optional, to be filled if such data is available |
| 5 | LMT | optional, to be filled if such data is available |
| 5 | Industrial | optional, to be filled if such data is available |
| 16 | EV | Not to be filled/displayed |
| 16 | LMT | Not to be filled/displayed |
| 16 | Industrial | Not to be filled/displayed |
| 17 | EV | Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act |
| 17 | LMT | Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act |
| 17 | Industrial | Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act |
| 18 | EV | Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act |
| 18 | LMT | Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act |
| 18 | Industrial | Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act |
| 19 | EV | Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act |
| 19 | LMT | Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act |
| 19 | Industrial | Not to be filled/displayed as of February 2027 - format still to be specified in the upcoming implementing act |
| 25 | EV | Not to be filled/displayed |
| 25 | LMT | Not to be filled/displayed |
| 25 | Industrial | Not to be filled/displayed |
| 31 | Industrial | only applicable for some industrial batteries where lifetime can be expressed in cycles |
| 32 | Industrial | only applicable for some industrial batteries where lifetime can be expressed in cycles |
| 33 | LMT | Not to be filled/displayed |
| 33 | Industrial | Not to be filled/displayed |
| 35 | EV | only if applicable (if commercial warranty envisaged) |
| 35 | LMT | only if applicable (if commercial warranty envisaged) |
| 35 | Industrial | only if applicable (if commercial warranty envisaged) |
| 36 | Industrial | only applicable for some industrial batteries |
| 37 | Industrial | only applicable for some industrial batteries |
| 39 | Industrial | only applicable for some industrial batteries |
| 41 | EV | cadmium or lead symbol if applicable |
| 41 | LMT | cadmium or lead symbol if applicable |
| 41 | Industrial | cadmium or lead symbol if applicable |
| 44 | EV | Not to be filled/displayed as of February 2027 - application provisions on hold pending Omnibus IV adoption |
| 44 | LMT | Not to be filled/displayed as of February 2027 - application provisions on hold pending Omnibus IV adoption |
| 44 | Industrial | Not to be filled/displayed as of February 2027 - application provisions on hold pending Omnibus IV adoption |
| 51 | EV | same as data point number 11 (capacity), but now dynamic |
| 51 | LMT | same as data point number 11 (capacity), but now dynamic |
| 51 | Industrial | if applicable, but now dynamic |
| 52 | Industrial | if applicable |
| 53 | Industrial | if applicable |
| 54 | Industrial | if applicable |
| 55 | Industrial | if applicable |
| 56 | Industrial | if applicable |
| 57 | EV | if applicable |
| 57 | LMT | if applicable |
| 57 | Industrial | if applicable |
| 58 | EV | if applicable |
| 58 | LMT | if applicable |
| 58 | Industrial | if applicable |
| 59 | Industrial | if applicable |
| 60 | Industrial | if applicable |
| 61 | LMT | Not to be filled/displayed |
| 61 | Industrial | Not to be filled/displayed |
| 62 | EV | Not to be filled/displayed |
| 62 | Industrial | if applicable |
| 63 | EV | Not to be filled/displayed |
| 63 | Industrial | if applicable |
| 64 | EV | Not to be filled/displayed |
| 64 | Industrial | if applicable |
| 65 | EV | Not to be filled/displayed |
| 65 | Industrial | if applicable |
| 66 | EV | Not to be filled/displayed |
| 66 | Industrial | if applicable |
| 68 | EV | if applicable |
| 68 | LMT | if applicable |
| 68 | Industrial | if applicable |
| 69 | EV | if applicable |
| 69 | LMT | if applicable |
| 69 | Industrial | if applicable |
| 70 | EV | if applicable |
| 70 | LMT | if applicable |
| 70 | Industrial | if applicable |
| 71 | EV | if applicable |
| 71 | LMT | if applicable |
| 71 | Industrial | if applicable |

---
*Reuse of the guidance document content under CC BY 4.0 with credit to the European
Commission; the table above restructures the document's five-column table into a
coverage mapping and is not an official position of the European Commission.*
