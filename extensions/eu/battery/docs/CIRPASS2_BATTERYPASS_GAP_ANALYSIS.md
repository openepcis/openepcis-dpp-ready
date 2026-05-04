# CIRPASS-2 + BatteryPass v1.3 — gap analysis

> **Status: working draft, local only.** Coverage analysis of OpenEPCIS
> DPP-Ready `extensions/eu/battery/` against the EU's two reference
> initiatives for the Battery Digital Product Passport. No vocabulary
> changes have shipped yet — this document identifies the additive
> properties we should add to close known gaps.

## Scope

The Battery DPP space has **three parallel reference points**:

1. **EU Battery Regulation 2023/1542** — the legal text. Mandates DPPs
   for industrial / EV / LMT / SLI batteries (Article 77, Annex XIII).
   Effective 2027-02-18 for portable batteries; phased earlier for EV
   and industrial.
2. **BatteryPass Consortium SAMM data model** — the consortium's
   open-source data definition (BMW / BASF / Bosch / Henkel / SAP /
   T-Systems / ZF + Catena-X / Tractus-X).
   - Source: <https://github.com/batterypass/BatteryPassDataModel>
   - SAMM submodels v1.2.0 (current upstream tag, urn:samm:io.BatteryPass.*)
   - **BatteryPass-Ready v1.3 longlist** — the conformance harness
     attribute list (~122 mandatory + recommended attributes), published
     by GEFEG. Source: <https://thebatterypass.eu/battery-pass-ready/publications/>
   - **DIN DKE SPEC 99100:2025-02** — German national standard
     formalising the BatteryPass attribute set
3. **CIRPASS-2 Core ontology** — the EU pilot programme's modular
   ontology, namespace `https://w3id.org/eudpp#`. Hosts general DPP
   classes (Product, Actor, Facility, Substance, ComplianceDeclaration,
   …) that intersect the battery domain through P_DPP and SOC.
   - Catalog: <https://dpp.vocabulary-hub.eu/specifications>

OpenEPCIS DPP-Ready already targets BatteryPass-Ready v1.3 conformance —
`extensions/eu/battery/ontology/battery.ttl` carries 327 triples across
~155 properties, with explicit `BatteryPass-Ready v1.3 longlist
attribute #N` annotations on the SAMM-derived attributes. This document
identifies the residual gaps and the alignment opportunities with
CIRPASS-2.

## Method

Authoritative input sources:

| Source | Used for |
|---|---|
| `https://github.com/batterypass/BatteryPassDataModel` | SAMM submodel attribute lists |
| `https://thebatterypass.eu/battery-pass-ready/publications/` | v1.3 longlist + GEFEG harness expectations |
| <https://www.dke.de/de/normen-standards/dokument?id=8045049&type=dke%7Cdokument> (DIN DKE SPEC 99100:2025-02) | Formal national-standard attribute alignment |
| <https://dpp.vocabulary-hub.eu/specifications> Treehouse hub | TNO OWL conversions (handy for diff but auto-generated) |
| `https://w3id.org/eudpp#` (CIRPASS-2) | Cross-cutting ontology peers |
| EU 2023/1542 Annex XIII | Legal-text attribute basis |

Comparison was done programmatically against `battery.ttl`; full method
in [`docs/cirpass2/SECTOR_INSPIRATION.md`](../../../../docs/cirpass2/SECTOR_INSPIRATION.md).

## Summary

| Coverage area | Status |
|---|---|
| BatteryPass-Ready v1.3 longlist (122 attributes) | **mostly covered** — 11 explicit annotations + the rest implicit. Identifier flat-on-Product convention preserved. |
| BatteryPass-Ready v1.3 / SAMM v1.2.0 Performance and Durability submodel | **mostly covered** — 5 named gaps |
| BatteryPass-Ready v1.3 / SAMM v1.2.0 Circularity submodel | **mostly covered** — 2 named gaps |
| BatteryPass-Ready v1.3 / SAMM v1.2.0 General Product Information submodel | **fully covered** |
| BatteryPass-Ready v1.3 / SAMM v1.2.0 Material Composition submodel | **fully covered** |
| BatteryPass-Ready v1.3 / SAMM v1.2.0 Carbon Footprint submodel | **fully covered** |
| BatteryPass-Ready v1.3 / SAMM v1.2.0 Labeling submodel | **fully covered** |
| BatteryPass-Ready v1.3 / SAMM v1.2.0 Supply Chain Due Diligence submodel | **fully covered** (via `dpp:DueDiligenceReport` + Battery Regulation Art. 39 anchoring) |
| DIN DKE SPEC 99100:2025-02 alignment | **needs review** — DIN attribute list to be cross-checked against our 0.9.5 properties |
| CIRPASS-2 P_DPP module (Battery-relevant classes) | anchor opportunities — see § Anchor recommendations |
| CIRPASS-2 SOC module | already strongly aligned (`dpp:SubstanceOfConcern` etc.) |
| CIRPASS-2 ACTOR module | already aligned via dpp-core SEMICeu anchors |
| CIRPASS-2 LCA module (full EN 15804 / PEFCR / EPD stack) | **out of scope** — we anchor `dpp:EmissionsPerformance` upward via seeAlso; full LCA modelling lives upstream |

## BatteryPass-Ready v1.3 / SAMM v1.2.0 — concrete attribute gaps

Each row below is an attribute present in the upstream BatteryPass SAMM
submodel that does **not** have a direct property in our `battery.ttl`.
All gaps are additive (no breaking change to existing payloads); naming
follows our GS1-first / BatteryPass-Ready v1.3 convention.

### Performance and Durability (`io.BatteryPass.Performance:1.2.0`)

| BatteryPass attribute | Status | Recommended addition |
|---|---|---|
| `currentSelfDischargingRate` (+ `currentSelfDischargingRateValue`) | gap | `battery:currentSelfDischargingRate` (range `gs1:QuantitativeValue`, %/month) on `dpp:PerformanceInfo` domain |
| `atSoC` (test condition: SoC at which a metric was measured) | gap | `battery:atSoC` (range `xsd:decimal`, 0–1) — annotation on test-result records |
| `numberOfFullCycles` (cumulative full equivalent cycles) | gap | `battery:numberOfFullCycles` (range `xsd:integer`) |
| `roundTripEnergyEfficiency` (current efficiency vs. original) | gap | `battery:roundTripEnergyEfficiency` (range `xsd:decimal`, 0–1) |
| `expectedLifetime` / `expectedNumberOfCycles` | partial — described in comments only | `battery:expectedLifetime` (range `gs1:QuantitativeValue`) + `battery:expectedNumberOfCycles` (range `xsd:integer`) |
| `negativeEvents` (failure / fault event log) | partial — `battery:Accident` exists but no top-level negative-event class | New `battery:NegativeEvent` class (`battery:Accident rdfs:subClassOf battery:NegativeEvent`); `battery:negativeEvents` collection |
| `capacityFade` / `capacityThroughput` / `energyThroughput` / `evolutionOfSelfDischarge` / `internalResistanceIncrease` / `originalPowerCapability` / `remainingPowerCapability` / `remainingCapacity` / `remainingEnergy` / `stateOfCertifiedEnergy` / `stateOfCharge` / `stateOfHealth` / `temperatureRangeIdleState` / `cRate` / `cRateLifeCycleTest` / `informationOnCollection` / `puttingIntoService` / `extinguishingAgent` | covered ✓ | — |

### Circularity (`io.BatteryPass.Circularity:1.2.0`)

| BatteryPass attribute | Status | Recommended addition |
|---|---|---|
| `dismantlingAndRemovalInformation` (URL or rich text — Annex VIII §B safety information) | gap | `battery:dismantlingAndRemovalInformation` (range `dpp:DocumentReference`) |
| `safetyMeasures` (general end-of-life handling guidance) | gap | `battery:safetyMeasures` (range `xsd:string` for now; promote to typed class if structure emerges) |
| `extinguishingAgent` / `addressOfSupplier` / `nameOfSupplier` / `emailAddressOfSupplier` / `components` / `partNumber` / `endOfLifeInformation` / `informationOnCollection` / `postConsumerShare` / `preConsumerShare` / `documentType` / `documentURL` | covered ✓ | — |

### General Product Information (`io.BatteryPass.GeneralProductInformation:1.2.0`)

| BatteryPass attribute | Status | Recommended addition |
|---|---|---|
| `batteryMass` | gap | `battery:batteryMass` (range `gs1:QuantitativeValue`) — `rdfs:subPropertyOf gs1:netWeight` to keep GS1-first |
| `manufacturerInformation` / `manufacturingDate` / `manufacturingPlace` / `operatorInformation` / `BatteryCategory` / `BatteryStatus` / `BatteryPassportIdentifier` / `ProductIdentifier` / `ManufacturerIdentification` / `puttingIntoService` / `postalAddress` / `contactName` | covered ✓ | — |

### Material Composition (`io.BatteryPass.MaterialComposition:1.2.0`)

Fully covered. We carry `battery:batteryChemistry`, `battery:batteryMaterials`,
`battery:hazardousSubstances`, the SCIP-aligned `dpp:SubstanceOfConcern`
parent, `battery:isCriticalRawMaterial`, plus battery-specific
`battery:CathodeActiveMaterial` / `Anode...` typed classes that go
beyond the SAMM submodel's flat shape.

### Carbon Footprint (`io.BatteryPass.CarbonFootprint:1.2.0`)

Fully covered. `battery:CarbonFootprintDeclaration` carries
`absoluteCarbonFootprint`, `carbonFootprintPerformanceClass`,
`carbonFootprintPerLifecycleStage`, plus our `dpp:carbonFootprintTotal` /
`dpp:EmissionsPerformance` cross-module anchor. GDSN CFP pattern.

### Labeling (`io.BatteryPass.Labels:1.2.0`)

Fully covered. `battery:labels`, `labelingMeaning`, `labelingSubject`,
`labelingSymbol`, `declarationOfConformity`, `resultOfTestReport` all
present.

### Supply Chain Due Diligence (`io.BatteryPass.SupplyChainDueDiligence:1.2.0`)

Fully covered. The upstream SAMM submodel is sparse (28 triples, 4
attributes). We provide a richer `dpp:DueDiligenceReport` with EUDR /
CSDDD / Forced Labour / Battery Regulation Article 39 enrichments.

### BatteryPass-Ready v1.3 longlist (GEFEG harness) — coverage

We claim conformance with the v1.3 longlist throughout the TTL (11 explicit
`BatteryPass-Ready v1.3 longlist attribute #N` annotations on
`battery:operatorIdentifier`, `manufacturerIdentifier`, `facilityIdentifier`,
`batteryModelIdentifier`, `manufacturingPlace`, the carbon-footprint
attributes, the Labels block, etc.).

The `extensions/eu/battery/context/battery-context-batterypass-bridge.jsonld`
plus `battery-context-to-batterypass.jsonld` provide bidirectional
mapping between our IRI shape and the GEFEG harness key names.

## DIN DKE SPEC 99100:2025-02 — alignment status

DIN DKE SPEC 99100:2025-02 ("Anforderungen an die Datenattribute des
Batteriepasses") was published 2025-02 and formalises the BatteryPass
attribute set as a German national standard. The BatteryPass Consortium
notes that the v1.2.0 SAMM was published in line with this standard.

The DIN spec is a paywalled / DKE-distributed document (€85 list price,
free to DKE members). Direct attribute-by-attribute cross-check is
**pending** — the document was not consulted directly for this draft.
Action item: either obtain DIN DKE SPEC 99100 and add a per-attribute
trace, or rely on the BatteryPass-Ready v1.3 / SAMM v1.2.0 (which the consortium says
implements the DIN spec) as the proxy until access is arranged.

## CIRPASS-2 — battery-relevant intersections

CIRPASS-2 is the EU **pilot programme** for DPP, not a finalised EU
standard; the formal regulation-binding track is CEN/CENELEC JTC 24
(EN 18216–18223). CIRPASS-2 publishes a modular ontology proposal at
`https://w3id.org/eudpp#` (currently does not dereference cleanly)
which we reference via `rdfs:seeAlso` only — see the project-wide
[`extensions/common/interop/docs/CIRPASS2_ALIGNMENT.md`](../../../common/interop/docs/CIRPASS2_ALIGNMENT.md)
for the full anchor strategy.

CIRPASS-2 does **not publish a battery-specific module** — there is
no `cirpass2:Battery` namespace. Battery DPP work in the CIRPASS-2
landscape lives in the **BatteryPass group** on the Treehouse hub
(separate from CIRPASS-2 vocabularies group) via SAMM-derived OWL
conversions, which is what this document analyses.

The CIRPASS-2 Core ontology does cover **cross-cutting concepts that
batteries inherit** through its P_DPP, SOC, ACTOR, and LCA modules.
Battery-side properties pick those up indirectly via the typed-link
cascade in `dpp-core.ttl`:

| Our battery class / property | CIRPASS-2 see-also pointer | How |
|---|---|---|
| `battery:operatorInformation` (range `dpp:OperatorInformation`) | `cirpass2:Actor` / `cirpass2:LegalPerson` / `cirpass2:ManufacturerRecord` | inherited via `dpp:OperatorInformation rdfs:seeAlso cirpass2:*` |
| `battery:manufacturingPlace` (range `dpp:FacilityInformation`) | `cirpass2:Facility` | inherited via `dpp:FacilityInformation rdfs:seeAlso cirpass2:Facility` |
| `battery:notifiedBody` (range `cv:PublicOrganisation`) | `cirpass2:ConformityAssessmentRole` actor | already anchored upward via SEMICeu CPOV (Layer 1) |
| `battery:declarationOfConformity` / `euDeclarationOfConformity` (range `cccev:Evidence`) | `cirpass2:ComplianceDeclaration` | inherited via `dpp:DueDiligenceReport rdfs:seeAlso cirpass2:ComplianceDeclaration` |
| `dpp:HazardousSubstance` / `battery:hazardousSubstances` | `cirpass2:Substance` / `cirpass2:SubstanceOfConcern` | inherited via dpp-core |
| `dpp:OperatorRole` enum | `cirpass2:EconomicOperatorRole` | inherited via dpp-core |
| `battery:CarbonFootprintDeclaration` / `dpp:carbonFootprintTotal` | `cirpass2:CarbonFootprint` | inherited via `dpp:EmissionsPerformance rdfs:seeAlso cirpass2:CarbonFootprint` |
| `dpp:CircularityPerformance` (used by `battery:circularityInfo`) | `cirpass2:CircularEconomyIndicator` | inherited |

All anchors are `rdfs:seeAlso` only — no `rdfs:subClassOf`, no
`owl:equivalentClass` against `cirpass2:`. CIRPASS-2 is one input to
JTC 24, not a finalised peer; we don't bind our class hierarchy to
the pilot proposal.

No CIRPASS-2 anchors in `battery.ttl` directly — they propagate from
`dpp-core.ttl` through property domain/range cascades.

## Recommendations

### Phase E (additive — proposed for this module)

The 13 gap-fill properties from the BatteryPass-Ready v1.3 / SAMM v1.2.0 analysis,
added flat on the appropriate domain (`dpp:PerformanceInfo`,
`gs1:Product`, `cccev:Evidence` per the typed-link restructure already
in place):

```turtle
# Performance and Durability
battery:currentSelfDischargingRate     a owl:DatatypeProperty ;
    rdfs:domain dpp:PerformanceInfo ; rdfs:range gs1:QuantitativeValue .
battery:atSoC                          a owl:DatatypeProperty ;
    rdfs:range xsd:decimal .
battery:numberOfFullCycles             a owl:DatatypeProperty ;
    rdfs:domain dpp:PerformanceInfo ; rdfs:range xsd:integer .
battery:roundTripEnergyEfficiency      a owl:DatatypeProperty ;
    rdfs:domain dpp:PerformanceInfo ; rdfs:range xsd:decimal .
battery:expectedLifetime               a owl:DatatypeProperty ;
    rdfs:domain gs1:Product ; rdfs:range gs1:QuantitativeValue .
battery:expectedNumberOfCycles         a owl:DatatypeProperty ;
    rdfs:domain gs1:Product ; rdfs:range xsd:integer .

# General Product Info
battery:batteryMass                    a owl:DatatypeProperty ;
    rdfs:domain gs1:Product ; rdfs:range gs1:QuantitativeValue ;
    rdfs:subPropertyOf gs1:netWeight .

# Circularity
battery:dismantlingAndRemovalInformation  a owl:ObjectProperty ;
    rdfs:domain gs1:Product ; rdfs:range dpp:DocumentReference .
battery:safetyMeasures                 a owl:DatatypeProperty ;
    rdfs:domain gs1:Product ; rdfs:range xsd:string .

# Negative-event class (re-parents existing battery:Accident)
battery:NegativeEvent                  a rdfs:Class ;
    rdfs:subClassOf cccev:Evidence ;
    rdfs:seeAlso schema:Event .
battery:Accident                       rdfs:subClassOf battery:NegativeEvent .
battery:negativeEvents                 a owl:ObjectProperty ;
    rdfs:domain dpp:PerformanceInfo ; rdfs:range battery:NegativeEvent .
```

All entries with full skos:notes citing BatteryPass-Ready v1.3 longlist
attribute numbers (where applicable) and SAMM URN equivalents
(`urn:samm:io.BatteryPass.Performance:1.2.0#…`).

Estimated impact: +13 properties, +1 class, +60 triples in
`battery.ttl`. No domain changes to existing properties; bridge
contexts (`battery-context-batterypass-bridge.jsonld` and
`battery-context-to-batterypass.jsonld`) gain entries for the new
attribute names.

### Phase E2 (CIRPASS-2 anchoring — handled in dpp-core)

No battery-specific anchors needed in `battery.ttl`. The cross-cutting
work in `dpp-core.ttl` per [`docs/cirpass2/ALIGNMENT.md`](../../../../docs/cirpass2/ALIGNMENT.md)
Phase B propagates `cirpass2:Actor` / `cirpass2:Facility` / `cirpass2:Substance`
upward anchors through the typed-link cascade. Add only one
battery-specific anchor:

- `battery:euDeclarationOfConformity rdfs:seeAlso cirpass2:ComplianceDeclaration`
  (the typed link is the closest battery-side analogue of the
  CIRPASS-2 Compliance class)

### Phase E3 (DIN DKE SPEC 99100:2025-02 cross-check — pending document access)

Once the DIN DKE SPEC document is accessible, produce a per-attribute
trace table here with one row per DIN attribute, citing both our
property IRI and the SAMM URN. Until then the BatteryPass-Ready v1.3 / SAMM v1.2.0
acts as the proxy.

## What we deliberately do **not** import

The BatteryPass TNO OWL conversions on the Treehouse hub are
auto-generated from the SAMM submodels with deeply nested IRI aliases
(e.g. `Circularity_sparePartSources_sparePartSources_addressOfSupplier`).
**We do not anchor to those IRIs** — they're not stable and not
designed for cross-vocab linking. We anchor to the **SAMM URNs**
(`urn:samm:io.BatteryPass.<Module>:1.2.0#…`) where appropriate, in
`skos:note` references rather than formal `rdfs:seeAlso`.

We also do not import the BatteryPass class hierarchy into our
ontology. Our model uses `gs1:Product` with typed-link nesting for
operator / facility / declaration-of-conformity (per the 0.9.5
restructure) plus flat datatype properties for the longlist
attributes — a richer, GS1-aligned shape than the consortium's
SAMM-flat design, while remaining export-equivalent through the
bridge contexts.

## References

- BatteryPass Consortium SAMM data model: <https://github.com/batterypass/BatteryPassDataModel>
- BatteryPass-Ready v1.3 publications: <https://thebatterypass.eu/battery-pass-ready/publications/>
- DIN DKE SPEC 99100:2025-02: <https://www.dke.de/de/normen-standards/dokument?id=8045049>
- CIRPASS-2 vocabulary catalog: <https://dpp.vocabulary-hub.eu/specifications>
- CIRPASS-2 ontology namespace: `https://w3id.org/eudpp#` (currently does not dereference; see `extensions/common/interop/docs/CIRPASS2_ALIGNMENT.md` for the see-also-only anchor strategy)
- EU Battery Regulation 2023/1542: <https://eur-lex.europa.eu/eli/reg/2023/1542>
- Catena-X SAMM Aspect Models (Tractus-X): <https://github.com/eclipse-tractusx/sldt-semantic-models/tree/main/io.catenax.battery.battery_pass>
- Eclipse Semantic Modeling Framework (SAMM): <https://eclipse-esmf.github.io/samm-specification/>

## Companion documents

- [`docs/cirpass2/ALIGNMENT.md`](../../../../docs/cirpass2/ALIGNMENT.md) — CIRPASS-2 cross-cutting alignment
- [`docs/cirpass2/SECTOR_INSPIRATION.md`](../../../../docs/cirpass2/SECTOR_INSPIRATION.md) — wider sectoral / foundation gap analysis
- [`extensions/eu/battery/docs/IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md) — implementation guide
- [`extensions/eu/battery/docs/BENCHMARK.md`](./BENCHMARK.md) — performance benchmarks
