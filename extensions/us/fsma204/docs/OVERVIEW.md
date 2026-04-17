# FSMA 204 — Overview

## The rule in one paragraph

The FDA's **Food Traceability Final Rule** (21 CFR Part 1 Subpart S),
implementing section 204(d) of the Food Safety Modernization Act, requires
people who manufacture, process, pack, or hold **foods on the Food
Traceability List (FTL)** to maintain records containing **Key Data
Elements (KDEs)** associated with specific **Critical Tracking Events
(CTEs)** and to provide those records to the FDA within 24 hours of a
request. The central mechanism is the **Traceability Lot Code (TLC)** — a
lot-level identifier that travels with the food end-to-end.

## Timeline

- **Final rule published:** 21 Nov 2022
- **Effective date:** 20 Jan 2026
- **Compliance date:** extended to **20 Jan 2028** under FDA enforcement
  discretion announced 20 Mar 2025

## The seven CTEs

| CTE | 21 CFR | When it applies |
|-----|--------|-----------------|
| Harvesting | 1.1325 | Raw agricultural commodities pulled from farms |
| Cooling | 1.1325 | Cooling a raw ag commodity prior to initial packing |
| Initial Packing | 1.1330 | First packing of a RAC — TLC is usually assigned here |
| First Land-Based Receiver | 1.1335 | First land receipt of FTL food off a fishing vessel — TLC assigned here |
| Shipping | 1.1340 | Sending an FTL food to another entity |
| Receiving | 1.1345 | Receiving an FTL food from another entity |
| Transformation | 1.1350 | Changing the food or packaging in a way that creates a new TLC |

## Required KDE highlights per CTE

**Harvesting (1.1325):** location description for immediate previous source;
location description for farm where harvested; commodity description;
quantity and unit; field/growing-area name; harvest date.

**Cooling (1.1325):** location description of the cooler; cooling date;
TLC/TLC source when applicable.

**Initial Packing (1.1330):** TLC; commodity description; quantity and unit;
packing date; location description where packed; location description of
source.

**First Land-Based Receiver (1.1335):** TLC; species; harvest date range;
location of harvest; quantity and unit; receiving date; vessel name and/or
trip identifier.

**Shipping (1.1340):** TLC; quantity and unit; location description of the
immediate subsequent recipient; location from which shipped; shipping date;
reference document type + number.

**Receiving (1.1345):** TLC; quantity and unit; location description of the
immediate previous source; location where received; receiving date;
reference document type + number.

**Transformation (1.1350):** input TLC(s); output TLC (new one assigned);
input and output commodity descriptions; quantities; location where
transformation occurred; transformation date.

## Food Traceability List categories

Twelve categories as of the 2022 rule; this vocabulary encodes them in
`fsma:FoodTraceabilityList`. The FDA periodically updates the FTL — keep
the enum in sync with the latest FDA publication.

## Relationship to EPCIS 2.0

Each CTE maps to an EPCIS 2.0 `ObjectEvent` (or `TransformationEvent` for
the Transformation CTE). The TLC is carried as `fsma:traceabilityLotCode`
at event level; the GS1 Digital Link URI based on `/01/{GTIN}/10/{TLC}`
serves as the EPC identifier. KDEs ride as `fsma:`-namespaced properties,
mirroring how the EU modules in this repo carry their regulatory
extensions.

See `epcis/harvest-cte.jsonld` and `epcis/receiving-cte.jsonld` for worked
examples.

## Out of scope in this preview

- Partial exemptions under 21 CFR 1.1305 (farms selling directly to
  consumers, RACs that will undergo a kill step, etc.).
- The required waiting-period logic for shell eggs.
- The "first receiver" electronic sortable spreadsheet export format
  required by 1.1455 — this is a presentation format, not a data model.
- Canadian and Mexican equivalencies (SFCR, NOMs) — likely future sibling
  modules under `extensions/ca/` and `extensions/mx/`.
