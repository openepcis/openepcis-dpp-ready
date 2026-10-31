# CIRPASS-2 alignment with OpenEPCIS DPP-Ready

CIRPASS-2 is the **EU pilot programme** for Digital Product Passports.
It feeds requirements and concept models into CEN/CENELEC JTC 24
(the actual EU standardisation track for DPP — the harmonised EN
18216–18223 series). CIRPASS-2 is one input among several; **not** a
finalised EU standard, **not** the canonical EU DPP ontology.

CIRPASS-2 publishes the **EUDPP Core Ontology** under the W3ID
permanent identifier `https://w3id.org/eudpp#`, documented at
<https://cirpass-2.github.io/ontologies-docs/> (WIDOCO pages with a
per-term anchor) and hosted on the Semantic Treehouse vocabulary hub at
<https://dpp.vocabulary-hub.eu/specifications>. Current release:
**v2.1.0** (CORE issued 2026-10-16; documentation refresh 2026-10-12,
LCA added to the CORE imports 2026-10-22), authored at TalTech. Our
mirror is built from the module files in
`github.com/CIRPASS-2/ontologies-docs` at a pinned commit (`a41561d`,
2026-10-29).

> **IRI dereference.** `https://w3id.org/eudpp#<Term>` resolves through
> the W3ID redirect to the Treehouse Turtle export of the module. Humans
> should use the WIDOCO documentation, which has one anchor per term
> (`CORE/core-complete/index-en.html#<Term>`). The hub export trails the
> documented release by a patch level and its `COMP` export was unusable
> on 2026-10-29, which is why the mirror reads the GitHub files (see
> [`extensions/upstream/cirpass2-eudpp/README.md`](../../../upstream/cirpass2-eudpp/README.md)).

## Module structure (v2.1.0)

The EUDPP ontology is modular; CORE is an `owl:imports` umbrella over
nine content modules (LCA is imported since 2.1.0):

| Module | IRI suffix | Version | Contents |
|---|---|---|---|
| CORE | `/` | 2.1.0 | umbrella, imports only |
| Product & DPP | `P_DPP` | 2.2.0 | `DPP`, `Product`, `ProductStatus`, quantitative properties, dimensions, `dppStatus`, `dppUrl`, `dppBackupUrl`, `dppSchemaVersion`, `linkToPreviousDPP` |
| Substances of Concern | `SOC` | 2.2.0 | `Substance`, `SubstanceOfConcern`, `SubstancePresence`, `SubstanceIdentifier` (+ CAS/EC/ECHA scheme), `ConcentrationRange`/`MaximumConcentration`, ESPR Art. 2(27) criteria (a)–(d) as `SoCQualificationAssertion`, management instructions |
| Life Cycle Assessment | `LCA` | 3.1 | ILCD+EPD model rebuilt: `LCAStudy`/`EPDStudy`, `LCAResult` → `LCIAResult`/`InventoryIndicatorResult`/`LandUseResult`/…, `LCAModuleValue` per `LifeCycleModule` (A1–D), EN 15804+A2 indicators `ind_*`, EF 3.1 impact categories, PCR/PEFCR, reviews, licence types |
| Actors | `ACTOR` | 2.2.0 | `Actor`, `LegalPerson`/`NaturalPerson`, time-bounded `ActorRoleAssignment`, `ManufacturerRecord`, facilities, authorised representatives |
| Identifiers | `IDENT` | 1.2.0 | identifier schemes with granularity, pattern, issuer, jurisdiction, validity; `FacilityIdentifierScheme` |
| Materials | `MAT` | 1.1.0 | `MaterialOfComposition`, origin, type scheme/value, recycled-content type |
| Life-Cycle Events | `EVENT` | **1.0.0** | ESPR product and DPP events; the EPCIS-inspired carrier layer of 0.1.0 is gone, GS1 EPCIS/CBV IRIs are referenced instead — see the dedicated section below |
| Compliance | `COMP` | 1.0.0 | `EUDeclarationOfConformity`, `ConformityCertificate`, `HarmonisedStandard`, `CommonSpecification`, `ConformityAssessmentModule`, `UnionHarmonisationLegislation` + `assignedELI` |
| Connector | `CON` | 2.4.0 | cross-module object properties (`hasUniqueProductIdentifier`, `hasBackUpCopyHost`, `hasSubstancePresence`, `hasLCAResult`, `hasPreviousDPP`/`hasNextDPP`, …) |

Sectoral extensions published alongside CORE are mirrored as their own
upstream modules: the **Textile Ontology 1.1.2** (task T3.2 led by GS1 in Europe, twelve modules
under `https://w3id.org/eudpp/textile-<module>#`,
[`extensions/upstream/cirpass2-textile/`](../../../upstream/cirpass2-textile/README.md))
and the **EU DPP Battery Ontology 0.4.0 DRAFT**
([`extensions/upstream/cirpass2-battery/`](../../../upstream/cirpass2-battery/README.md)).
The 2026-10-30 vocab-sync round audited `common/core`, `eu/battery` and
`eu/textile` against all three mirrors (reports
`docs/skos-alignment/skos-completeness-{core,battery,textile}-2026-10-29`,
graded gpt-oss-20b, QA panel qwen3-32b); the curated CIRPASS-2 subset of
its APPLY set is written (30 + 32 + 26 mappings, see the module
changelogs), the part-of, different-axis and value-slot proposals are
held in `docs/skos-alignment/OPEN_DECISIONS.md`. This document covers
CORE.

## Anchor strategy

OpenEPCIS DPP-Ready references CIRPASS-2 as **`rdfs:seeAlso` pointers
by default**:

- prefix in `dpp-core.ttl`: `@prefix cirpass2: <https://w3id.org/eudpp#>`
- default relationship: **`rdfs:seeAlso`**
- never `rdfs:subClassOf`, never `owl:equivalentClass`, never
  `rdfs:subPropertyOf`

Graded SKOS mappings toward `cirpass2:` exist only where the SKOS
audit's QA panel confirmed them and the direction was verified
(`oec:HazardousSubstance skos:broadMatch cirpass2:Substance`,
`oec:EmissionsPerformance skos:narrowMatch cirpass2:CarbonFootprint`,
`oec:passportStatus skos:closeMatch cirpass2:dppStatus`, the exact
matches on the passport envelope and the SOC identity properties, and
the 2026-08 audit wave in `dpp-core.ttl`); everything else stays
`rdfs:seeAlso`. Every target, graded or not, must exist in the mirror:
`pnpm run check:mappings` (rule 13, "dead-eudpp-target") fails the build
otherwise, which is how the 2.1.0 renames were caught. Two reasons for
the restraint:

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
| `oec:previousPassportVersion` | `cirpass2:linkToPreviousDPP`, `cirpass2:hasPreviousDPP` | `skos:exactMatch` on `linkToPreviousDPP`; 2.2.0 adds the object properties `hasPreviousDPP`/`hasNextDPP` |
| `oec:passportIssueDate` / `oec:passportExpiryDate` | `cirpass2:validFrom` / `cirpass2:validUntil` | |
| `oec:hasPassportIssuer` | `cirpass2:hasIssuer` | |
| `oec:hasBackupCopyHost` | `cirpass2:hasBackUpCopyHost`, `cirpass2:dppBackupUrl` | ESPR Art. 10(4) backup host (CON module); `dppBackupUrl` is the P_DPP fallback URL |
| `oec:dppSchemaVersion` | `cirpass2:dppSchemaVersion` | EN 18223 `dppSchemaVersion` on both sides |
| `oec:DigitalProductPassport` | `cirpass2:DPP`, `cirpass2:DPPEvent`, `cirpass2:dppUrl` | `skos:exactMatch` on `DPP`; the DPP lifecycle events are pointers only (see EVENT) |
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
| `oec:casNumber` / `oec:ecNumber` | `cirpass2:casNumber` / `cirpass2:ecNumber` | `skos:exactMatch`; renamed in SOC 2.2.0 (were `numberCAS`/`numberEC`) |
| `oec:iupacName` / `oec:substanceTradeName` | `cirpass2:iupacName` / `cirpass2:tradeName` | renamed in SOC 2.2.0 (was `nameIUPAC`) |
| `oec:concentration` / `oec:socThreshold` | `cirpass2:ConcentrationRange`, `cirpass2:MaximumConcentration`, `cirpass2:hasConcentration` / `cirpass2:MaximumConcentration`, `cirpass2:ThresholdOfSubstanceOfConcern` | SOC 2.2.0 replaced `Concentration`/`Threshold` by typed concentrations on `SubstancePresence` |
| `oec:substanceLocation` | `cirpass2:substanceLocationDescription`, `cirpass2:isLocatedInProduct` | `skos:exactMatch` on the textual description; `isLocatedInProduct` is the object-property form |
| `oec:safeUseInstructions` / `oec:safeDisassemblyInstructions` / `oec:hasDismantlingInstructions` / `oec:endOfLifeInstructions` | `cirpass2:hasSafeUseInstruction` / `cirpass2:hasDisassemblyInstruction` / `cirpass2:hasDisassemblyInstruction` / `cirpass2:hasEndOfLifeManagementInstruction` | SOC 2.2.0 scopes these to a `SubstancePresence`; ours are product-level, hence pointers only |
| `oec:MaterialComposition` | `cirpass2:MaterialOfComposition` | |
| `oec:hasMaterialOrigin` | `cirpass2:MaterialOrigin`, `cirpass2:hasMaterialOrigin` | |
| `oec:massFraction` | `cirpass2:materialPercentage` | |
| `oec:isCriticalRawMaterial` | `cirpass2:isCriticalRawMaterial` | |
| `oec:CircularityPerformance` | `cirpass2:CircularEconomyIndicator` | |
| `oec:RecycledContent` | `cirpass2:RecycledMaterialsUseResult` | LCA 3.1 (was `RecycledMaterialsUse`) |
| `oea:RecoverableRate` / `oea:RecyclingCollectionRate` (performance parameters) | `cirpass2:RecoverableRate` / `cirpass2:RecyclingCollectionRate` | |
| `oec:waterConsumption` / `oec:landUse` / `oec:materialFootprint` | `cirpass2:WaterConsumptionResult` / `cirpass2:LandUseResult` / `cirpass2:MaterialFootprint`, `cirpass2:InventoryIndicatorResult` | ESPR Annex I parameters; LCA 3.1 models them as inventory-indicator results |
| `oec:wasteGenerationAmount` / `oec:packagingWasteAmount` / `oec:productToPackagingRatio` | `cirpass2:WasteGenerationAmount` / `cirpass2:PackagingWasteAmount` / `cirpass2:ProductToPackagingRatio` | |
| `oec:EmissionsPerformance` / `oec:CarbonFootprintDeclaration` | `cirpass2:CarbonFootprint`, `cirpass2:LCIAResult` | audit-graded `skos:narrowMatch` on `CarbonFootprint`; `EnvironmentalFootprint` no longer exists, a characterised impact result is `LCIAResult` |
| `oec:EnvironmentalProductDeclaration` | `cirpass2:EPDStudy`, `cirpass2:EPDDocument` | LCA module |
| `oec:LifecycleStage` (StageA1–D) | `cirpass2:LifeCycleModule`; per stage `cirpass2:en15804moduleA1` … `en15804moduleC4`, `cirpass2:moduleD` | EN 15804 modules on both sides; upstream reuses `eudpp:moduleD` for both the EN 15804 module D and the NLF conformity module D |
| `oec:lifecycleStage` (`oec:hasLifecycleStage`) | `cirpass2:forLifeCycleModule` | LCA 3.1 (was `hasLifeCycleStage`) |
| `oec:ImpactIndicatorType` (GWPTotal … ADPFossil) | `cirpass2:EN15804ImpactIndicator`, `cirpass2:LCIAImpactIndicator`, `cirpass2:AreaOfProtection`; per indicator `cirpass2:ind_GWPtotal` … `ind_ADPF` | `skos:broadMatch cirpass2:LCIAImpactCategory`; the twelve EN 15804+A2 core indicators map one-to-one to the `ind_*` individuals |
| `oec:ImpactIndicatorResult` / `oec:LifecycleStageResult` | `cirpass2:LCAResult`, `cirpass2:LCIAResult` / `cirpass2:LCAModuleValue` | `skos:broadMatch` on both; LCA 3.1 renamed `LcaResult` → `LCAResult`, `LCIAModuleValue` → `LCAModuleValue` |
| `oec:epdRegistrationNumber` / `oec:epdValidUntil` | `cirpass2:registrationNumber` / `cirpass2:expiryDate` | |
| `oec:productCategoryRules` | `cirpass2:PCR`, `cirpass2:PEFCR`, `cirpass2:followsPCR`, `cirpass2:followsPEFCR` | `skos:narrowMatch` on `followsPEFCR` (was `referenceToPEFCR`) |
| `oec:declaredUnit` | `cirpass2:hasMeasurementUnit` | `skos:broadMatch` (was `hasUnitOfMeasure`) |
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

## The EVENT module — now on GS1 IRIs

EVENT **1.0.0** (issued 2026-09-23) replaced the Draft 0.1.0 design.
What changed, and what it means for the position this document took
against the draft:

1. **The re-declared EPCIS carrier is gone.** Draft 0.1.0 had an
   `EPCISCarrier` layer that re-declared the EPCIS event model in the
   `eudpp#` namespace (`ObjectEvent`, `AggregationEvent`, `ActionType`,
   `BusinessStep`, `Disposition`, `ReadPoint`, `QuantityElement`, …).
   1.0.0 removes all of it and references the published GS1 IRIs
   instead — `https://ref.gs1.org/epcis/EPCISEvent`,
   `…/epcis/TransactionEvent`, `…/epcis/QuantityElement`,
   `https://ref.gs1.org/cbv/BizStep`, `…/cbv/Disp`, `…/cbv/BTT`,
   `…/cbv/SDT` — with the module comment stating that this "does not
   imply a global `owl:imports` of EPCIS/CBV nor logical subclassing".
   That is the feedback item (a) this document recorded against the
   draft, adopted upstream.
2. **The ESPR semantics stay.** `ESPREvent` with the `ProductEvent`
   branch (repair 2(20), maintenance 2(19), refurbishment 2(18),
   remanufacturing 2(16), upgrading 2(17), destruction 2(34), making
   available 2(39), placing on the market 2(40), putting into service
   2(41)) and the `DPPEvent` branch
   (`DPPCreationEvent`/`DPPUpdateEvent`/`DPPArchivalEvent`,
   `DPPActionType`, `DPPEventRecord`). New in 1.0.0: `ProductStatus`
   with `hasProductStatus` on the product, and
   `isActorRoleAssignmentForEvent` linking an event to the actor role
   that performed it.

Our reading of the `ProductEvent` branch is unchanged: the definitions
describe **activities and legal acts**, not events — none says anything
about time, place, or the objects involved — and EPCIS separates the
two concerns on purpose: event types carry *that* something happened,
vocabulary (`bizStep`, `disposition`) carries *what* happened. So
OpenEPCIS keeps answering the ESPR **content** with CBV vocabulary and
carries it on the real EPCIS event types that upstream now references:

| ESPR activity (Art. 2) | CBV 2.0 | OpenEPCIS carrier | EUDPP 1.0.0 class (pointer) |
|---|---|---|---|
| Repair (2(20)) | `cbv:BizStep-repairing` | ObjectEvent | `cirpass2:RepairEvent` |
| Destruction (2(34)) | `cbv:BizStep-destroying` | ObjectEvent | `cirpass2:DestructionEvent` |
| Putting into service (2(41)) | `cbv:BizStep-installing` (closest; CBV has no first-use nuance) | ObjectEvent | `cirpass2:PuttingIntoServiceEvent` |
| Maintenance (2(19)) | — | `oec:BizStep-maintaining` (minted; CBV verified 2026-08-06) | `cirpass2:MaintenanceEvent` |
| Refurbishment (2(18)) | — | `oec:BizStep-refurbishing` (minted) | `cirpass2:RefurbishmentEvent` |
| Remanufacturing (2(16)) | — | `oec:BizStep-remanufacturing` (minted; belongs on a TransformationEvent) | `cirpass2:RemanufacturingEvent` |
| Upgrading (2(17)) | — | `oec:BizStep-upgrading` (minted) | `cirpass2:UpgradingEvent` |
| Making available / placing on the market (2(39)/2(40)) | — | `oec:Disp-available_on_market` (minted persistentDisposition; the first event that sets it records the placing on the market) | `cirpass2:MakingAvailableOnMarketEvent` / `cirpass2:PlacingOnMarketEvent` |

Each minted value follows the `oec:BizStep-notifying` pattern
(`cbv:BizStep`/`cbv:Disp` individual, `skos:notation`,
`dcterms:source` ELI, `skos:note` explaining why CBV 2.0 lacks the
value — verified content-based against the live CBV, which answers
HTTP 200 for *any* path, so only a non-null `@graph` counts — and
`rdfs:seeAlso` to both the nearest CBV value and the corresponding
`cirpass2:*Event` class).

The `DPPEvent` branch still needs no new vocabulary: passport lifecycle
is `oec:PassportStatus` (draft/active/archived, `skos:closeMatch
cirpass2:dppStatus`), `oec:DigitalProductPassport` points at
`cirpass2:DPPEvent`, and `DPPEventRecord` is exactly what an EPCIS
repository produces on capture — event ID, capture timestamp,
repository URI — with EPCIS 2.0 `errorDeclaration` covering the
`CorrectDPPDataAction` semantics. An EPCIS 2.0 repository **is** the
carrier EUDPP's architecture delegates to (`isRecordedAs`,
`hasProductEvent`), and since 1.0.0 upstream names it by its GS1 IRIs.

Feedback still open with CIRPASS-2: the `ProductEvent` activities are
vocabulary by their own definitions and would be more robust as a SKOS
concept scheme that CBV values can map to (item (b) against the draft).

## What we do not do

- **Do not import CIRPASS-2 TTL into the ontology.** No `owl:imports`
  of the module files, no re-declared classes. Our ontology references
  terms by IRI. What *does* exist are the **upstream mirror modules**
  ([`extensions/upstream/cirpass2-eudpp/`](../../../upstream/cirpass2-eudpp/README.md),
  [`cirpass2-textile/`](../../../upstream/cirpass2-textile/README.md),
  [`cirpass2-battery/`](../../../upstream/cirpass2-battery/README.md),
  regenerated with `pnpm run sync:eudpp` / `sync:cirpass2-textile` /
  `sync:cirpass2-battery` from the pinned `CIRPASS-2/ontologies-docs`
  commit) — the same pattern as the GS1 Rail mirror: verbatim copies,
  upstream IRIs preserved, indexed into the ref.openepcis.org browser
  so every term is browsable. Mirroring is for indexing and browsing;
  the alignment relationship stays seeAlso/SKOS. Upstream licences
  Apache 2.0 (CORE, battery; CC BY 4.0 fallback as a document) and
  CC BY 4.0 (textile).
- **Do not import CIRPASS-2 classes into our class hierarchy.** No
  `owl:imports`, no `rdfs:subClassOf` against `cirpass2:`. Our
  ontology stays self-contained.
- **Do not re-declare EPCIS.** ESPR activities become CBV vocabulary
  values (see above) carried on the GS1 event types; since EVENT 1.0.0
  upstream references those same IRIs.

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
- CIRPASS-2 documentation: <https://cirpass-2.github.io/ontologies-docs/>
  (sources: <https://github.com/CIRPASS-2/ontologies-docs>)
- CIRPASS-2 catalog: <https://dpp.vocabulary-hub.eu/specifications>
- CIRPASS-2 namespace: `https://w3id.org/eudpp#` (v2.1.0; Turtle for
  machines via the W3ID redirect, WIDOCO pages for humans)
