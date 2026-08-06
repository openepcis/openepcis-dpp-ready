# CIRPASS-2 alignment with OpenEPCIS DPP-Ready

CIRPASS-2 is the **EU pilot programme** for Digital Product Passports.
It feeds requirements and concept models into CEN/CENELEC JTC 24
(the actual EU standardisation track for DPP — the harmonised EN
18216–18223 series). CIRPASS-2 is one input among several; **not** a
finalised EU standard, **not** the canonical EU DPP ontology.

CIRPASS-2 publishes the **EUDPP Core Ontology** under the W3ID
permanent identifier `https://w3id.org/eudpp#`, hosted on the Semantic
Treehouse vocabulary hub at <https://dpp.vocabulary-hub.eu/specifications>.
Current release: **v2.0.5** (issued 2026-07-06), authored at TalTech.

> **IRI dereference (updated 2026-08-06).** `https://w3id.org/eudpp#<Term>`
> now resolves: the W3ID redirect answers HTTP 200, landing on the
> Treehouse TTL export of the CORE module. There is still no per-term
> HTML page — machines get Turtle, humans should use the
> Specifications catalog. The earlier 404 caveat in this document is
> obsolete.

## Module structure (v2.0.5)

The EUDPP ontology is modular; CORE is an `owl:imports` umbrella over
nine content modules:

| Module | IRI suffix | Contents |
|---|---|---|
| CORE | `/` | umbrella, imports only |
| Product & DPP | `P_DPP` | `DPP`, `Product`, quantitative properties, environmental footprints, dimensions, `dppStatus`, `linkToPreviousDPP` |
| Substances of Concern | `SOC` | `Substance`, `SubstanceOfConcern`, `Concentration`, `Threshold`, CAS/EC/IUPAC identity |
| Life Cycle Assessment | `LCA` | full ILCD+EPD model: `LCAStudy`/`EPDStudy`, EN 15804 indicators, `LifeCycleModule`, PCR/PEFCR, reviews |
| Actors | `ACTOR` | `Actor`, `LegalPerson`/`NaturalPerson`, time-bounded `ActorRoleAssignment`, authorised representatives |
| Identifiers | `IDENT` | identifier schemes with granularity, pattern, issuer, validity |
| Materials | `MAT` | `MaterialOfComposition`, origin, type, recycled content |
| Life-Cycle Events | `EVENT` | **Draft 0.1.0** — ESPR event semantics plus an EPCIS-inspired carrier layer; see the dedicated section below |
| Compliance | `COMP` | `EUDeclarationOfConformity`, `ConformityCertificate`, `HarmonisedStandard`, `CommonSpecification`, `ConformityAssessmentModule`, `UnionHarmonisationLegislation` + `assignedELI` |
| Connector | `CON` | cross-module object properties (`hasUniqueProductIdentifier`, `hasBackUpCopyHost`, `isSignedBy`, …) |

## Anchor strategy

OpenEPCIS DPP-Ready references CIRPASS-2 as **`rdfs:seeAlso` pointers
by default**:

- prefix in `dpp-core.ttl`: `@prefix cirpass2: <https://w3id.org/eudpp#>`
- default relationship: **`rdfs:seeAlso`**
- never `rdfs:subClassOf`, never `owl:equivalentClass`, never
  `rdfs:subPropertyOf`

Graded SKOS mappings toward `cirpass2:` exist only where the SKOS
audit's QA panel confirmed them and the direction was verified
(currently `oec:HazardousSubstance skos:broadMatch cirpass2:Substance`
and `oec:EmissionsPerformance skos:narrowMatch cirpass2:CarbonFootprint`);
everything else stays `rdfs:seeAlso`. Two reasons:

1. **CIRPASS-2 is a pilot deliverable, not a regulation-binding
   standard.** Formal subsumption against an unfinalised peer would
   bind our ontology to choices that may change before the JTC 24
   harmonised standards are published.
2. **Two extensions almost never have identical extension.** The
   CIRPASS-2 classes are typically broader (`cirpass2:Actor` covers
   regulators, consumers, etc., not just economic operators). seeAlso
   is the strongest claim that holds without overstating.

## Reference table

| Our IRI | CIRPASS-2 see-also pointer | Note |
|---|---|---|
| `oec:DigitalProductPassport` | `cirpass2:DPP` | |
| `oec:passportIdentifier` | `cirpass2:DPPIdentifier` | |
| `oec:passportStatus` / `oec:PassportStatus` | `cirpass2:dppStatus` | value lists agree (draft/active/archived) |
| `oec:previousPassportVersion` | `cirpass2:linkToPreviousDPP` | |
| `oec:passportIssueDate` / `oec:passportExpiryDate` | `cirpass2:validFrom` / `cirpass2:validUntil` | |
| `oec:hasPassportIssuer` | `cirpass2:hasIssuer` | |
| `oec:hasBackupCopyHost` | `cirpass2:hasBackUpCopyHost` | ESPR Art. 10(4) backup host (CON module) |
| `oec:granularityLevel` / `oec:GranularityLevel` | `cirpass2:granularity`, `cirpass2:ProductIdentifierGranularity` | model/batch/item agrees |
| `oec:customsCommodityCode` / `oec:CustomsCommodityCodeType` | `cirpass2:commodityCode`, `cirpass2:ClassificationCode` | |
| `oec:isEnergyRelated` | `cirpass2:isEnergyRelated` | ESPR scope flag |
| `oec:OperatorInformation` | `cirpass2:Actor`, `cirpass2:LegalPerson`, `cirpass2:ManufacturerRecord` | three pointers — operator overlaps each in a different way |
| `oec:OperatorRole` | `cirpass2:EconomicOperatorRole` | enum-vs-class shape difference; pointer only |
| `oec:AuthorisedRepresentative` | `cirpass2:AuthorisedRepresentativeRoleAssignment`, `cirpass2:hasAuthorisedRepresentative` | |
| `oec:economicOperatorId` | `cirpass2:hasUniqueOperatorIdentifier` | |
| `oec:facilityId` | `cirpass2:FacilityIdentifier`, `cirpass2:hasUniqueFacilityIdentifier` | |
| `oec:FacilityInformation` | `cirpass2:Facility` | |
| `oec:hasVerificationBody` | `cirpass2:hasNotifiedBody` | |
| `oec:HazardousSubstance` | `cirpass2:Substance` | audit-graded `skos:broadMatch` |
| `oec:SubstanceOfConcern` | `cirpass2:SubstanceOfConcern` | both SCIP-aligned |
| `oec:casNumber` / `oec:ecNumber` | `cirpass2:numberCAS` / `cirpass2:numberEC` | |
| `oec:iupacName` / `oec:substanceTradeName` | `cirpass2:nameIUPAC` / `cirpass2:tradeName` | |
| `oec:concentration` / `oec:socThreshold` | `cirpass2:Concentration` / `cirpass2:Threshold`, `cirpass2:ThresholdOfSubstanceOfConcern` | |
| `oec:substanceLocation` | `cirpass2:substanceLocation` | |
| `oec:MaterialComposition` | `cirpass2:MaterialOfComposition` | |
| `oec:hasMaterialOrigin` | `cirpass2:MaterialOrigin`, `cirpass2:hasMaterialOrigin` | |
| `oec:massFraction` | `cirpass2:materialPercentage` | |
| `oec:isCriticalRawMaterial` | `cirpass2:isCriticalRawMaterial` | |
| `oec:CircularityPerformance` | `cirpass2:CircularEconomyIndicator` | |
| `oec:RecycledContent` | `cirpass2:RecycledMaterialsUse` | |
| `oec:recoverableRate` / `oec:recyclingCollectionRate` | `cirpass2:RecoverableRate` / `cirpass2:RecyclingCollectionRate` | |
| `oec:waterConsumption` / `oec:landUse` / `oec:materialFootprint` | `cirpass2:WaterConsumption` / `cirpass2:LandUse` / `cirpass2:MaterialFootprint` | ESPR Annex I parameters |
| `oec:wasteGenerationAmount` / `oec:packagingWasteAmount` / `oec:productToPackagingRatio` | `cirpass2:WasteGenerationAmount` / `cirpass2:PackagingWasteAmount` / `cirpass2:ProductToPackagingRatio` | |
| `oec:EmissionsPerformance` | `cirpass2:CarbonFootprint`, `cirpass2:EnvironmentalFootprint` | audit-graded `skos:narrowMatch` on `CarbonFootprint` |
| `oec:EnvironmentalProductDeclaration` | `cirpass2:EPDStudy`, `cirpass2:EPDDocument` | LCA module |
| `oec:LifecycleStage` (StageA1–D) | `cirpass2:LifeCycleModule` | EN 15804 modules on both sides |
| `oec:lifecycleStage` (`oec:hasLifecycleStage`) | `cirpass2:hasLifeCycleStage` | |
| `oec:ImpactIndicatorType` | `cirpass2:EN15804ImpactIndicator`, `cirpass2:LCIAImpactIndicator` | |
| `oec:ImpactIndicatorResult` / `oec:LifecycleStageResult` | `cirpass2:LCAResult` / `cirpass2:LCIAModuleValue` | |
| `oec:epdRegistrationNumber` / `oec:epdValidUntil` | `cirpass2:registrationNumber` / `cirpass2:expiryDate` | |
| `oec:productCategoryRules` | `cirpass2:PCR`, `cirpass2:PEFCR`, `cirpass2:referenceToPCR`, `cirpass2:referenceToPEFCR` | |
| `oec:ThirdPartyVerification` | `cirpass2:Review`, `cirpass2:ReviewReport` | |
| `oec:DeclarationOfConformity` | `cirpass2:EUDeclarationOfConformity` | |
| `oec:Certificate` | `cirpass2:ConformityCertificate` | |
| `oec:UnionHarmonisationLegislation` / `oec:assignedELI` | `cirpass2:UnionHarmonisationLegislation` / `cirpass2:assignedELI` | both anchored upward to `cccev:ReferenceFramework` / ELI |
| `oec:HarmonisedStandard` / `oec:CommonSpecification` | `cirpass2:HarmonisedStandard` / `cirpass2:CommonSpecification` | |
| `oec:ConformityAssessmentModule` | `cirpass2:ConformityAssessmentModule` | Decision 768/2008 modules A–H1 as individuals on our side |
| `oec:PerformanceInfo` | `cirpass2:Durability`, `cirpass2:Reliability` | |
| `oec:RepairabilityInfo` | `cirpass2:Reliability`, `cirpass2:Durability` | |
| `oec:DueDiligenceReport` | `cirpass2:ComplianceDeclaration` | already anchored more strongly to `cccev:Evidence` (CCCEV is the SEMICeu upstream that CIRPASS-2's compliance model derives from) |
| `oec:DocumentReference` | `cirpass2:DigitalInstruction` | |
| `eutex:MicroplasticInfo` | `cirpass2:MicroplasticRelease`, `cirpass2:NanoplasticRelease` | stays in eutex: until a second regulation needs it (move-down criterion) |

Module ontologies (`battery.ttl`, `eudr.ttl`, `textile.ttl`,
`electronics.ttl`) inherit these pointers indirectly via property
domain/range cascades. Direct module-side anchors exist only where a
module concept has no core counterpart.

## The EVENT module — why we answer it with CBV vocabulary

The EVENT module (**Draft 0.1.0**, issued 2026-03-06, self-described
as "EPCIS-inspired") has three separable layers:

1. **ESPR semantics.** `ESPREvent` with two branches: `ProductEvent`
   (nine subclasses, each carrying an ESPR Art. 2 definition verbatim:
   repair 2(20), maintenance 2(19), refurbishment 2(18),
   remanufacturing 2(16), upgrading 2(17), destruction 2(34),
   making available 2(39), placing on the market 2(40), putting into
   service 2(41)) and `DPPEvent`
   (`DPPCreationEvent`/`DPPUpdateEvent`/`DPPArchivalEvent` with
   `DPPActionType` add/correct/delete/modify).
2. **Technical carrier.** `EPCISCarrier` re-declares the EPCIS event
   model in the `eudpp#` namespace (`ObjectEvent`, `AggregationEvent`,
   `TransactionEvent`, `AssociationEvent`, `TransformationEvent`,
   `ActionType`, `BusinessStep`, `Disposition`, `ReadPoint`,
   `QuantityElement`, …). GS1 appears only as a `dcterms:source` text
   annotation; no GS1 EPCIS/CBV IRI is reused and no SKOS mapping is
   asserted.
3. **Linking.** `ProductEvent --triggersDPPEvent--> DPPEvent
   --isRecordedAs--> DPPEventRecord` (mandatory identifier, timestamp,
   `recordedInSystem` URI), and `EPCISCarrier --hasProductEvent-->
   ProductEvent`.

Our reading: the definitions in layer 1 describe **activities and
legal acts, not events** — none of them says anything about time,
place, or the objects involved. EPCIS deliberately separates the two
concerns: five event types carry *that* something happened;
vocabulary (`bizStep`, `disposition`) carries *what* happened
business-wise. Wrapping each activity in an event class forces a new
class per future activity and breaks on remanufacturing, which
produces a *new* product (an identity change that needs a
`TransformationEvent` with input/output lists, not a subclass of the
old product's event).

So OpenEPCIS adopts the ESPR **content** of layer 1 as CBV vocabulary
and answers layer 2 by mapping, not by mirroring:

| ESPR activity (Art. 2) | CBV 2.0 | OpenEPCIS carrier |
|---|---|---|
| Repair (2(20)) | `cbv:BizStep-repairing` | ObjectEvent |
| Destruction (2(34)) | `cbv:BizStep-destroying` | ObjectEvent |
| Putting into service (2(41)) | `cbv:BizStep-installing` (closest; CBV has no first-use nuance) | ObjectEvent |
| Maintenance (2(19)) | — | `oec:BizStep-maintaining` (minted; CBV verified 2026-08-06) |
| Refurbishment (2(18)) | — | `oec:BizStep-refurbishing` (minted) |
| Remanufacturing (2(16)) | — | `oec:BizStep-remanufacturing` (minted; belongs on a TransformationEvent) |
| Upgrading (2(17)) | — | `oec:BizStep-upgrading` (minted) |
| Making available / placing on the market (2(39)/2(40)) | — | `oec:Disp-available_on_market` (minted persistentDisposition; the first event that sets it records the placing on the market) |

Each minted value follows the `oec:BizStep-notifying` pattern
(`cbv:BizStep`/`cbv:Disp` individual, `skos:notation`,
`dcterms:source` ELI, `skos:note` explaining why CBV 2.0 lacks the
value — verified content-based against the live CBV, which answers
HTTP 200 for *any* path, so only a non-null `@graph` counts — and
`rdfs:seeAlso` to both the nearest CBV value and the corresponding
`cirpass2:*Event` class).

The `DPPEvent` branch needs no new vocabulary at all: passport
lifecycle is `oec:PassportStatus` (draft/active/archived, matching
`cirpass2:dppStatus` values), and `DPPEventRecord` is exactly what an
EPCIS repository produces on capture — event ID, capture timestamp,
repository URI — with EPCIS 2.0 `errorDeclaration` covering the
`CorrectDPPDataAction` semantics. In EUDPP's own architecture the
technical journalisation of an ESPR event is delegated to a carrier
(`isRecordedAs`, `hasProductEvent`); an EPCIS 2.0 repository **is**
that carrier, in the published GS1 standard rather than a re-declared
namespace.

Feedback we owe CIRPASS-2 while EVENT is still Draft 0.1.0: (a) layer
2 should reuse the GS1 EPCIS/CBV IRIs instead of re-declaring them;
(b) the layer-1 activities are vocabulary by their own definitions and
would be more robust as a SKOS concept scheme that CBV values can map
to.

## What we do not do

- **Do not vendor CIRPASS-2 TTL.** No `.ttl` files copied into this
  repository. The Treehouse hub hosts the canonical exports at
  `https://dpp.vocabulary-hub.eu/api/ontology/-/version/<UUID>/export?format=ttl`.
  We reference by IRI, not by file copy.
- **Do not import CIRPASS-2 classes into our class hierarchy.** No
  `owl:imports`, no `rdfs:subClassOf` against `cirpass2:`. Our
  ontology stays self-contained.
- **Do not mirror the EVENT carrier layer.** ESPR activities become
  CBV vocabulary values (see above); the EPCIS re-declaration is
  answered by the real EPCIS/CBV IRIs.

## See also

- [`STANDARDS_ALIGNMENT.md`](./STANDARDS_ALIGNMENT.md) — full
  community-profile narrative including CEN/CENELEC JTC 24 (the
  formal EU standardisation track) and EPCIS-adoption depth as our
  differentiator
- [`CIRPASS2_COVERAGE.md`](./CIRPASS2_COVERAGE.md) — coverage of the
  CIRPASS-2 D3.x **pilot requirements** (orthogonal to this ontology
  pointer doc)
- [`SEMIC_CORE_VOCABULARIES.md`](./SEMIC_CORE_VOCABULARIES.md) —
  SEMICeu Core Vocabularies anchoring (CCCEV is the upstream of
  CIRPASS-2's compliance model)
- [`../../../eu/battery/docs/CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md`](../../../eu/battery/docs/CIRPASS2_BATTERYPASS_GAP_ANALYSIS.md)
  — battery-side landscape, including the provenance of the TNO
  AAS→RDF BatteryPass conversions hosted on the same hub
- CIRPASS-2 catalog: <https://dpp.vocabulary-hub.eu/specifications>
- CIRPASS-2 namespace: `https://w3id.org/eudpp#` (v2.0.5, resolves
  since mid-2026; Turtle for machines, catalog for humans)
