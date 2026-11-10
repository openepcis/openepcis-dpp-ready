# EC Battery Passport guidance — data-point coverage

How the 71 data points of the European Commission **Guidance Document: Digital Batteries Passport - data points by category**
(Version 3.2, 2026-10-19, CC BY 4.0) map onto the
OpenEPCIS battery vocabulary (`eubat:` plus `gs1:` / `schema:` / `oec:`).

- **Machine-readable registry (RDF)**: [`../vocab/ec-battery-passport-guidance-3.2.ttl`](../vocab/ec-battery-passport-guidance-3.2.ttl) — minted under `https://ref.openepcis.org/vocab/ec-battery-passport-guidance/3.2#` because the Commission publishes no IRIs (same pattern as the GEFEG BatteryPass-Ready mirror). Each data point is dual-typed `rdf:Property` + `cccev:InformationRequirement`.
- **Applicability matrix (JSON)**: [`../validation/ec-datapoint-applicability.json`](../validation/ec-datapoint-applicability.json).
- **SHACL readiness shapes**: [`../validation/ec-readiness-shapes.ttl`](../validation/ec-readiness-shapes.ttl) — the matrix made executable for any SHACL engine: one node shape per (data point, category) with the status mapped to severity (mandatory = Violation, conditional = Warning, optional/pending = Info) and the anchor paths derived from the ontologies' `rdfs:domain` declarations. All shapes ship `sh:deactivated true`; activate exactly one category (IRI suffix `-ev`/`-lmt`/`-industrial`) and validate the merged model + batch + item graphs. `pnpm run check:ec-readiness -- --shacl` does both automatically.
- **Source of truth**: [`../vocab/ec-guidance-datapoints.json`](../vocab/ec-guidance-datapoints.json); regenerate with `pnpm run build:ec-guidance-vocab`.
- **Earlier version**: [`../vocab/ec-battery-passport-guidance-1.0.ttl`](../vocab/ec-battery-passport-guidance-1.0.ttl) (2026-07-28, Ares(2026)7579758) stays published under its own namespace; every current data point names its predecessor with `dcterms:replaces`. See [What changed in version 3.2](#what-changed-in-version-32).

## The four mechanics encoded in the guidance table

1. **Static vs. dynamic** — Annex XIII 4 data points (51–71) are *dynamic*: the guidance
   marks the static Annex XIII 1(g) rated capacity (#25) "not to be filled" and re-lists it
   as #51 "same as data point 11" in the Annex XIII 4 block. Dynamic data points are folded from
   the EPCIS event stream into the item passport; static ones are resolver-served master data.
   Each dynamic entry links the EPCIS event example that demonstrates it.
2. **Access tiers** — the "type of information" column (since version 3.2; it agrees with
   BR Article 77(2) via the "data point source" column): Annex XIII 1 / VI A / Art. 77(3) =
   public, XIII 2 = persons with a legitimate interest, notified bodies, market surveillance
   authorities and the Commission, XIII 3 = notified bodies, market surveillance authorities and
   the Commission, XIII 4 = persons with a legitimate interest (individual battery).
3. **Category-conditional obligation** — obligation is a function of (data point, battery
   category): e.g. SOCE (#61) is EV-only while the remaining-capacity family (#62–66) applies
   to LMT/industrial; #33 capacity threshold is EV-only.
4. **Regulatory lifecycle** — "pending" data points are not to be filled as of February 2027:
   #17–18 carbon footprint (format still to be specified in the implementing act), #19
   responsible sourcing (Article 48(1)), #20–23 recycled content (to be applied as envisaged by
   Article 8), #45 instructions for use (on hold pending the Omnibus). A validator must
   distinguish *missing* from *not yet required*.

## What changed in version 3.2

Against version 1.0 (2026-07-28):

- **Renumbering from #40.** The C-rate of the relevant cycle-life test (1.0 #39) is split into a
  charge C-rate (#39, carried by `eubat:ChargeCRate`) and a new, optional discharge
  C-rate (#40, `eubat:DischargeCRate`). 1.0 #40–45 become #41–46; 1.0 #46 (part
  numbers for components) and #47 (contact details of sources for replacement spares) merge into
  #47. From #48 the numbers are unchanged.
- **Recycled content (#20–23)** is no longer mandatory as of February 2027: "to be applied as
  envisaged by Article 8".
- **Internal resistance (#38)** names two values, cell and pack
  (`eubat:InitialCellInternalResistance`, `eubat:InitialPackInternalResistance`).
- **Rated capacity (#51)** reads "same as data point 11" for all three categories.
- New columns "As defined in" and "Type of information" (`ecbp:definedIn`,
  `ecbp:typeOfInformation`); every condition is quoted from the new table.

## Coverage table

Applicability: **M** mandatory · **O** optional · **C** conditional (see note) · **P** pending
(not as of Feb 2027, act outstanding) · **–** not to be filled/displayed.

| # | Data point | Source | EV | LMT | Ind | Lifecycle | Implemented by |
|---|---|---|---|---|---|---|---|
| 1 | Unique identifier [unique product identifier] | BR Article 77 (3) | M | M | M | static | `oec:passportIdentifier` |
| 2 | Identity of who is registering and/or is responsible for the battery passport [name] | BR Article 77 (3) | M | M | M | static | `eubat:hasOperatorInformation`, `eubat:operatorIdentifier`, `eubat:hasOperatorRole` |
| 3 | Manufacturer name, registered trade name or registered trademark [at least one of] | BR Annex VI A (1) | M | M | M | static | `gs1:manufacturer`, `gs1:organizationName` |
| 4 | Manufacturer single contact postal address | BR Annex VI A (1) | M | M | M | static | `gs1:address`, `gs1:PostalAddress` |
| 5 | If available, manufacturer web and email address [both optional] | BR Annex VI A (1) | O | O | O | static | `gs1:contactPoint`, `gs1:ContactPoint` |
| 6 | Battery category [3-code list] | BR Annex VI A (2) | M | M | M | static | `eubat:BatteryCategory`, `schema:category` |
| 7 | Model identification and batch or serial number, or product number or another element a… | BR Annex VI A (2) | M | M | M | static | `eubat:batteryModelIdentifier`, `gs1:hasSerialNumber` |
| 8 | The place of manufacture (geographical location of a battery manufacturing plant) [town… | BR Annex VI A (3) | M | M | M | static | `eubat:hasManufacturingPlace`, `eubat:facilityIdentifier` |
| 9 | The date of manufacturing [month and year] | BR Annex VI A (4) | M | M | M | static | `gs1:productionDate` |
| 10 | The weight [unit kg] | BR Annex VI A (5) | M | M | M | static | `eubat:hasBatteryMass`, `gs1:netWeight` |
| 11 | The capacity [unit Ah] | BR Annex VI A (6) | M | M | M | static | `eubat:hasRatedCapacity` |
| 12 | The chemistry [code list] | BR Annex VI A (7) | M | M | M | static | `eubat:hasBatteryChemistry` |
| 13 | The hazardous substances present in the battery, other than mercury, cadmium or lead [f… | BR Annex VI A (8) | M | M | M | static | `eubat:hasHazardousSubstances`, `eubat:HazardousSubstance` |
| 14 | Usable extinguishing agent [free text] | BR Annex VI A (9) | M | M | M | static | `eubat:extinguishingAgent` |
| 15 | Critical raw materials present in the battery in a concentration of more than 0,1 % wei… | BR Annex VI A (10) | M | M | M | static | `eubat:isCriticalRawMaterial`, `eubat:criticalRawMaterialsStatement` |
| 16 | The material composition of the battery, including its chemistry, hazardous substances … | BR Annex XIII 1 (b) | - | - | - | static | `eubat:hasMaterialComposition` |
| 17 | The carbon footprint declaration | BR Annex XIII 1 (c) | P | P | P | static | `eubat:hasCarbonFootprintDeclaration`, `eubat:CarbonFootprintDeclaration` |
| 18 | The carbon footprint label | BR Annex XIII 1 (c) | P | P | P | static | `eubat:CarbonFootprintPerformanceClass` |
| 19 | Information on responsible sourcing as indicated in the report on battery due diligence… | BR Annex XIII 1 (d) | P | P | P | static | `eubat:hasSupplyChainDueDiligence`, `eubat:dueDiligenceReportUrl` |
| 20 | Percentage share of cobalt that is present in active materials and that has been recove… | BR Annex XIII 1 (e) | P | P | P | static | `eubat:cobaltRecycledShare` |
| 21 | Percentage share of lithium that is present in active materials and that has been recov… | BR Annex XIII 1 (e) | P | P | P | static | `eubat:lithiumRecycledShare` |
| 22 | Percentage share of nickel that is present in active materials and that has been recove… | BR Annex XIII 1 (e) | P | P | P | static | `eubat:nickelRecycledShare` |
| 23 | The percentage share of lead that is present in the battery and that has been recovered… | BR Annex XIII 1 (e) | P | P | P | static | `eubat:leadRecycledShare` |
| 24 | The share of renewable content [%] | BR Annex XIII 1 (f) | M | M | M | static | `eubat:renewableContent` |
| 25 | Rated capacity [unit Ah] | BR Annex XIII 1 (g) | - | - | - | static | `eubat:hasRatedCapacity` |
| 26 | Minimal voltage, with temperature range when relevant [unit V, optional unit °C] | BR Annex XIII 1 (h) | M | M | M | static | `eubat:hasMinimumVoltage` |
| 27 | Nominal voltage, with temperature range when relevant [unit V, optional unit °C] | BR Annex XIII 1 (h) | M | M | M | static | `eubat:hasNominalVoltage` |
| 28 | Maximum voltage, with temperature range when relevant [unit V, optional unit °C] | BR Annex XIII 1 (h) | M | M | M | static | `eubat:hasMaximumVoltage` |
| 29 | Original power capability [unit W] | BR Annex XIII 1 (i) | M | M | M | static | `eubat:PowerCapability` |
| 30 | Power limits, with temperature range when relevant [unit W, optionally min_T °C … max_T… | BR Annex XIII 1 (i) | M | M | M | static | `eubat:hasMaximumPermittedBatteryPower`, `eubat:hasMaximumChargingPower`, `eubat:hasMaximumDischargingPower` |
| 31 | Expected battery lifetime expressed in cycles [in number] | BR Annex XIII 1 (j) | M | M | C | static | `eubat:CycleLife` |
| 32 | Reference test used for expected battery lifetime expressed in cycles [free text] | BR Annex XIII 1 (j) | M | M | C | static | `eubat:hasPerformanceTest` |
| 33 | Capacity threshold for exhaustion [%] | BR Annex XIII 1 (k) | M | - | - | static | `eubat:CapacityExhaustionThreshold` |
| 34 | Temperature range the battery can withstand when not in use (reference test) [min_T °C … | BR Annex XIII 1 (l) | M | M | M | static | `eubat:hasTemperatureRangeIdleState` |
| 35 | Period for which the commercial warranty for the calendar life applies [months] | BR Annex XIII 1 (m) | C | C | C | static | `eubat:warrantyConditions`, `gs1:warranty` |
| 36 | Initial round trip energy efficiency [%] | BR Annex XIII 1 (n) | M | M | C | static | `eubat:InitialRoundTripEfficiency` |
| 37 | Round trip energy efficiency at 50 % of cycle-life [%] | BR Annex XIII 1 (n) | M | M | C | static | `eubat:RoundTripEfficiencyAt50PercentCycleLife` |
| 38 | Internal battery cell resistance [unit Ω] and internal battery pack resistance [unit Ω] | BR Annex XIII 1 (o) | M | M | M | static | `eubat:InitialCellInternalResistance`, `eubat:InitialPackInternalResistance` |
| 39 | Charge C-rate of relevant cycle-life test [number] | BR Annex XIII 1 (p) | M | M | C | static | `eubat:ChargeCRate` |
| 40 | Discharge C-rate of relevant cycle-life test [number] | BR Annex XIII 1 (p) | O | O | O | static | `eubat:DischargeCRate` |
| 41 | The marking requirements laid down in Article 13(4) [Yes/No] | BR Annex XIII 1 (q) | M | M | M | static | `eubat:hasLabels`, `eubat:separateCollectionSymbolUrl` |
| 42 | The marking requirements laid down in Article 13(5) [code list] | BR Annex XIII 1 (q) | C | C | C | static | `eubat:cadmiumSymbolRequired`, `eubat:leadSymbolRequired` |
| 43 | The EU declaration of conformity referred to in Article 18 [a web link] | BR Annex XIII 1 (r) | M | M | M | static | `eubat:hasEuDeclarationOfConformity` |
| 44 | The information regarding the prevention and management of waste batteries laid down in… | BR Annex XIII 1 (s) | M | M | M | static | `eubat:wastePrevention`, `eubat:informationOnCollection`, `eubat:separateCollection` |
| 45 | Clear, understandable and readable instructions for use in a format that makes it possi… | BR Annex XIII 1 (t) | P | P | P | static | `gs1:instructionsForUse`, `gs1:consumerUsageInstructions` |
| 46 | Detailed composition, including materials used in the cathode, anode and electrolyte [f… | BR Annex XIII 2 (a) | M | M | M | static | `eubat:cathodeActiveMaterial`, `eubat:anodeActiveMaterial`, `eubat:electrolyteComposition` |
| 47 | Part numbers for components and contact details of sources for replacement spares [a we… | BR Annex XIII 2 (b) | M | M | M | static | `eubat:spareParts`, `eubat:hasSparePartSources`, `eubat:hasSupplierContact` |
| 48 | Dismantling information, including at least: - exploded diagrams of the battery system/… | BR Annex XIII 2 (c) | M | M | M | static | `eubat:hasDismantlingAndRemovalInformation` |
| 49 | Safety measures [a web link] | BR Annex XIII 2 (d) | M | M | M | static | `eubat:hasSafetyMeasures`, `eubat:safetyInstructions` |
| 50 | Results of test reports proving compliance with the requirements laid down in this Regu… | BR Annex XIII 3 | M | M | M | static | `eubat:resultOfTestReport`, `eubat:testReportNumber` |
| 51 | Rated capacity [unit Ah] | BR Annex XIII 4 (a) | M | M | M | dynamic | `eubat:hasRatedCapacity` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 52 | Capacity fade [%] | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:CapacityFade` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 53 | Power [unit W] | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:PowerCapability` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 54 | Power fade [%] | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:PowerFade` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 55 | Internal resistance [unit Ω] | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:InternalResistance` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 56 | Internal resistance increase [%] | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:InternalResistanceIncrease` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 57 | Where applicable, energy round trip efficiency [%] | BR Annex XIII 4 (a) | C | C | C | dynamic | `eubat:InitialRoundTripEfficiency` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 58 | Where applicable, energy round trip efficiency fade [%] | BR Annex XIII 4 (a) | C | C | C | dynamic | `eubat:RoundTripEfficiencyFade` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 59 | The expected lifetime of the battery under the reference conditions for which it has be… | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:RemainingCycles` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 60 | The expected lifetime of the battery under the reference conditions for which it has be… | BR Annex XIII 4 (a) | M | M | C | dynamic | `eubat:hasExpectedLifetime`, `eubat:RemainingLifetime` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 61 | Information on the state of health of the battery pursuant to Article 14: state of cert… | BR Annex XIII 4 (b) | M | - | - | dynamic | `eubat:StateOfCertifiedEnergy` → [`epcis/state-of-certified-energy.jsonld`](../epcis/state-of-certified-energy.jsonld) |
| 62 | Information on the state of health of the battery pursuant to Article 14: remaining cap… | BR Annex XIII 4 (b) | - | M | C | dynamic | `eubat:RemainingCapacity` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 63 | Information on the state of health of the battery pursuant to Article 14: where possibl… | BR Annex XIII 4 (b) | - | M | C | dynamic | `eubat:PowerCapability` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 64 | Information on the state of health of the battery pursuant to Article 14: where possibl… | BR Annex XIII 4 (b) | - | M | C | dynamic | `eubat:RemainingRoundTripEfficiency` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 65 | Information on the state of health of the battery pursuant to Article 14: where possibl… | BR Annex XIII 4 (b) | - | M | C | dynamic | `eubat:SelfDischargeEvolution`, `eubat:SelfDischargeRate` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 66 | Information on the state of health of the battery pursuant to Article 14: where possibl… | BR Annex XIII 4 (b) | - | M | C | dynamic | `eubat:InternalResistance` → [`epcis/state-of-health.jsonld`](../epcis/state-of-health.jsonld) |
| 67 | Information on the status of the battery, defined as ‘original’, ‘repurposed’, ‘re-used… | BR Annex XIII 4 (c) | M | M | M | dynamic | `schema:status`, `eubat:BatteryStatus` → [`epcis/commissioning.jsonld`](../epcis/commissioning.jsonld) |
| 68 | The number of charging and discharging cycles [number] | BR Annex XIII 4 (d) | C | C | C | dynamic | `eubat:FullCycleCount` → [`epcis/amperia-staxwall-lifecycle.jsonld`](../epcis/amperia-staxwall-lifecycle.jsonld) |
| 69 | Negative events, such as accidents [multiple free texts] | BR Annex XIII 4 (d) | C | C | C | dynamic | `eubat:hasNegativeEvents`, `eubat:NegativeEvent` → [`epcis/negative-event.jsonld`](../epcis/negative-event.jsonld) |
| 70 | Periodically recorded information on the operating environmental conditions, including … | BR Annex XIII 4 (d) | C | C | C | dynamic | `eubat:TimeAboveTemperatureBoundary`, `eubat:TimeBelowTemperatureBoundary` → [`epcis/temperature-extreme.jsonld`](../epcis/temperature-extreme.jsonld) |
| 71 | Periodically recorded information on the state of charge [histogram, %] | BR Annex XIII 4 (d) | C | C | C | dynamic | `eubat:StateOfCharge` → [`epcis/amperia-staxwall-lifecycle.jsonld`](../epcis/amperia-staxwall-lifecycle.jsonld) |

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
| 5 | EV | Optional, to be filled if such data is available |
| 5 | LMT | Optional, to be filled if such data is available |
| 5 | Industrial | Optional, to be filled if such data is available |
| 16 | EV | Not to be filled/displayed - repetition, same data already required under previous data points |
| 16 | LMT | Not to be filled/displayed - repetition, same data already required under previous data points Not to be filled/displayed as of February 2027- format still to be specified in the upcoming implementing act |
| 16 | Industrial | Not to be filled/displayed - repetition, same data already required under previous data points Not to be filled/displayed as of February 2027- format still to be specified in the upcoming implementing act |
| 17 | EV | Not to be filled/displayed as of February 2027- format still to be specified in the upcoming implementing act |
| 17 | LMT | Not to be filled/displayed as of February 2027- format still to be specified in the upcoming implementing act |
| 17 | Industrial | Not to be filled/displayed as of February 2027- format still to be specified in the upcoming implementing act |
| 18 | EV | Not to be filled/displayed as of February 2027- format still to be specified in the upcoming implementing act |
| 18 | LMT | Not to be filled/displayed as of February 2027- format still to be specified in the upcoming implementing act |
| 18 | Industrial | Not to be filled/displayed as of February 2027- format still to be specified in the upcoming implementing act |
| 19 | EV | Not to be filled/displayed as of February 2027- as envisaged by Article 48(1), required from August 2027 |
| 19 | LMT | Not to be filled/displayed as of February 2027- as envisaged by Article 48(1), required from August 2027 |
| 19 | Industrial | Not to be filled/displayed as of February 2027- as envisaged by Article 48(1), required from August 2027 |
| 20 | EV | Not to be filled/displayed as of February 2027- to be applied as envisaged by Article 8 |
| 20 | LMT | Not to be filled/displayed as of February 2027- to be applied as envisaged by Article 8 |
| 20 | Industrial | Not to be filled/displayed as of February 2027- to be applied as envisaged by Article 8 |
| 21 | EV | Not to be filled/displayed as of February 2027 - to be applied as envisaged by Article 8 |
| 21 | LMT | Not to be filled/displayed as of February 2027- to be applied as envisaged by Article 8 |
| 21 | Industrial | Not to be filled/displayed as of February 2027- to be applied as envisaged by Article 8 |
| 22 | EV | Not to be filled/displayed as of February 2027 - to be applied as envisaged by Article 8 |
| 22 | LMT | Not to be filled/displayed as of February 2027 - to be applied as envisaged by Article 8 |
| 22 | Industrial | Not to be filled/displayed as of February 2027 - to be applied as envisaged by Article 8 |
| 23 | EV | Not to be filled/displayed as of February 2027 - to be applied as envisaged by Article 8 |
| 23 | LMT | Not to be filled/displayed as of February 2027 - to be applied as envisaged by Article 8 |
| 23 | Industrial | Not to be filled/displayed as of February 2027 - to be applied as envisaged by Article 8 |
| 25 | EV | Not to be filled/displayed - repetition, same data required under data point 11 |
| 25 | LMT | Not to be filled/displayed - repetition, same data required under data point 11 |
| 25 | Industrial | Not to be filled/displayed - repetition, same data required under data point 11 |
| 31 | Industrial | Only applicable for some industrial batteries where lifetime can be expressed in cycles |
| 32 | Industrial | Only applicable for some industrial batteries where lifetime can be expressed in cycles |
| 33 | LMT | Not to be filled/displayed |
| 33 | Industrial | Not to be filled/displayed |
| 35 | EV | If applicable (if commercial warranty envisaged) |
| 35 | LMT | If applicable (if commercial warranty envisaged) |
| 35 | Industrial | If applicable (if commercial warranty envisaged) |
| 36 | Industrial | Only applicable for some industrial batteries |
| 37 | Industrial | Only applicable for some industrial batteries |
| 39 | Industrial | Only applicable for some industrial batteries |
| 42 | EV | Cadmium or lead symbol if applicable |
| 42 | LMT | Cadmium or lead symbol if applicable |
| 42 | Industrial | Cadmium or lead symbol if applicable |
| 45 | EV | Not to be filled/displayed as of February 2027 - application provisions on hold pending Omnibus adoption |
| 45 | LMT | Not to be filled/displayed as of February 2027 - application provisions on hold pending Omnibus adoption |
| 45 | Industrial | Not to be filled/displayed as of February 2027 - application provisions on hold pending Omnibus adoption |
| 51 | EV | Same as data point 11 (capacity) |
| 51 | LMT | Same as data point 11 (capacity) |
| 51 | Industrial | Same as data point 11 |
| 52 | Industrial | Only for rechargeable batteries |
| 53 | Industrial | Only for rechargeable batteries |
| 54 | Industrial | Only for rechargeable batteries |
| 55 | Industrial | Only for rechargeable batteries |
| 56 | Industrial | Only for rechargeable batteries |
| 57 | EV | If applicable |
| 57 | LMT | If applicable |
| 57 | Industrial | Only for rechargeable batteries, if applicable |
| 58 | EV | If applicable |
| 58 | LMT | If applicable |
| 58 | Industrial | Only for rechargeable batteries, if applicable |
| 59 | Industrial | Only for rechargeable batteries and except for non-cycle applications |
| 60 | Industrial | Only for rechargeable batteries |
| 61 | LMT | Not to be filled/displayed |
| 61 | Industrial | Not to be filled/displayed |
| 62 | EV | Not to be filled/displayed |
| 62 | LMT | Mandatory battery management system |
| 62 | Industrial | Only for stationary battery energy storage systems and if they have a |
| 63 | EV | Not to be filled/displayed |
| 63 | Industrial | Only for stationary battery energy storage systems and if they have a battery management system |
| 64 | EV | Not to be filled/displayed |
| 64 | Industrial | Only for stationary battery energy storage systems and if they have a battery management system |
| 65 | EV | Not to be filled/displayed |
| 65 | Industrial | Only for stationary battery energy storage systems and if they have a battery management system |
| 66 | EV | Not to be filled/displayed |
| 66 | Industrial | Only for stationary battery energy storage systems and if they have a battery management |
| 68 | EV | Applicable as soon as the battery starts to be used |
| 68 | LMT | Applicable as soon as the battery starts to be used |
| 68 | Industrial | Applicable as soon as the battery starts to be used |
| 69 | EV | Applicable as soon as the battery starts to be used |
| 69 | LMT | Applicable as soon as the battery starts to be used |
| 69 | Industrial | Applicable as soon as the battery starts to be used |
| 70 | EV | Applicable as soon as the battery starts to be used |
| 70 | LMT | Applicable as soon as the battery starts to be used |
| 70 | Industrial | Applicable as soon as the battery starts to be used |
| 71 | EV | Applicable as soon as the battery starts to be used |
| 71 | LMT | Applicable as soon as the battery starts to be used |
| 71 | Industrial | Applicable as soon as the battery starts to be used |

---
*Reuse of the guidance document content under CC BY 4.0 with credit to the European
Commission; the table above restructures the document's five-column table into a
coverage mapping and is not an official position of the European Commission.*
