# OpenEPCIS ↔ UNTP Mapping

Mapping between OpenEPCIS DPP-Ready and the UN Transparency Protocol (UNTP) vocabulary,
aligned with **UNTP v0.7.0** (released 2026-04-02, the current version). Canonical vocabulary:
<https://vocabulary.uncefact.org/untp/>, context: <https://vocabulary.uncefact.org/untp/0.7.0/context/>.
A verbatim copy of that context ships as `context/untp-0.7.0-context.jsonld`.

Earlier UNTP drafts (v0.5, v0.6.x) used a scorecard model (`circularityScorecard`,
`emissionsScorecard`, `CircularityPerformance`, `carbonFootprint`, `operationalScope`,
`granularityLevel`, `ProductPassport`, `FacilityRecord`, ...). UNTP 0.7.0 no longer contains these
terms; it models performance generically through `Performance`, `PerformanceMetric`, `Claim` and
`claimedPerformance`. The bridge context and this mapping only carry 0.7.0 terms.

## Bridge Context

`context/untp-bridge-context.jsonld` lets a UNTP 0.7.0 document be read with OpenEPCIS terms where
an equivalent exists, and keeps the UNTP IRI everywhere else.

### Terms mapped onto OpenEPCIS

| UNTP 0.7.0 term | Maps to | Type |
|---|---|---|
| `Material` | `oec:MaterialComposition` | class |
| `Party` | `oec:OperatorInformation` | class |
| `Facility` | `oec:FacilityInformation` | class |
| `massFraction` | `oec:massFraction` | `xsd:decimal` |
| `materialProvenance` | `oec:hasMaterialComposition` | `@id` |
| `product` | `gs1:product` | `@id` |

### Terms kept in the UNTP namespace

Conformity and performance terms without an OpenEPCIS equivalent stay `untp:`:
`Claim`, `Criterion`, `Standard`, `Regulation`, `ConformityAttestation`, `ConformityScheme`,
`ConformityTopic`, `PerformanceMetric`, `registeredId`, `countryOfOperation`, `processCategory`,
`recycledMassFraction` (`xsd:decimal`), `hazardous` (`xsd:boolean`), `performanceClaim`,
`conformityTopic`, `referenceStandard`, `referenceRegulation`, `attestationType`,
`producedAtFacility`, `idGranularity`.

### Usage

```json
{
  "@context": [
    "https://ref.openepcis.org/extensions/common/core/dpp-core-context.jsonld",
    "https://ref.openepcis.org/extensions/common/interop/untp-bridge-context.jsonld"
  ],
  "type": "Material",
  "massFraction": 0.15,
  "hazardous": false
}
```

expands to

```json
{
  "@type": "https://ref.openepcis.org/extensions/common/core/MaterialComposition",
  "https://ref.openepcis.org/extensions/common/core/massFraction": {
    "@value": 0.15, "@type": "http://www.w3.org/2001/XMLSchema#decimal"
  },
  "https://vocabulary.uncefact.org/untp/hazardous": {
    "@value": false, "@type": "http://www.w3.org/2001/XMLSchema#boolean"
  }
}

UNTP's flat `recyclableContent`, `utilityFactor` and `materialCircularityIndicator` have no alias:
OpenEPCIS states them as a recyclability result and as indicators (common/assessment) with a unit,
which a context alone cannot produce.
```

## Ontology Alignment

The SKOS and `rdfs:seeAlso` links in `extensions/common/core/ontology/dpp-core.ttl`, all against
UNTP 0.7.0 IRIs:

| OpenEPCIS term | Relation | UNTP 0.7.0 term |
|---|---|---|
| `oec:massFraction` | `skos:exactMatch` | `untp:massFraction` |
| `oec:issueDate` | `skos:exactMatch` | `untp:issueDate` |
| `oec:postConsumerRecycledContent` | `skos:closeMatch` | `untp:recycledMassFraction` |
| `oec:hasDueDiligenceRegulationContext` | `skos:closeMatch` | `untp:regulation`, `untp:referenceRegulation` |
| `oec:hasRecycledContentDetails` | `skos:broadMatch` | `untp:recycledMassFraction` |
| `oec:bioBasedFraction` | `skos:broadMatch` | `untp:massFraction` |
| `oec:OperatorInformation` | `skos:broadMatch` | `untp:Party` |
| `oec:crmListVersion` | `skos:broadMatch` | `untp:version` |
| `oec:hasConformityDeclaration` | `rdfs:seeAlso` | `untp:ConformityAttestation` |
| `oec:preConsumerRecycledContent` | `rdfs:seeAlso` | `untp:recycledMassFraction` |
| `oec:hasDepositReturnScheme` | `rdfs:seeAlso` | `untp:referenceScheme`, `untp:idScheme` |

## Value Convention

OpenEPCIS and UNTP both use the 0 to 1 decimal scale for ratios and fractions
(`massFraction: 0.15` is 15 % of total mass), so values pass between the two without conversion.

## OpenEPCIS-Only Properties

| Property | Purpose |
|---|---|
| `oec:economicOperatorId` | EU EOID per ESPR Article 77 |
| `oec:scipId` | ECHA SCIP database identifier |
| `oec:hasAccessLevel` | ESPR Article 9 access control |
| `oec:safeUseInstructions` | SCIP safe use text |
| `oec:safeDisassemblyInstructions` | SCIP disassembly text |
| `oec:isCriticalRawMaterial` | EU CRM flag |
