# Access-tier review matrix — dpp-core

Regulatory frame: ESPR 2024/1781 Art. 7–9, Annex III

Coverage: 199 properties — 134 Public / 36 AuthorizedOnly / 6 Restricted / 23 inherited / 0 UNCLASSIFIED; 10 legally locked.

| Term | Label | Tier | Mandated (locked) | Source | Rationale |
|---|---|---|---|---|---|
| `activityClassification` | Activity Classification | **AuthorizedOnly** |  | eli/reg/2024/1781 | ISIC/NACE/NAICS activity codes are operator-registry data for authority cross-checks, not product information for consumers. |
| `assignedELI` | Assigned ELI | **Public** |  | eli/reg/2024/1781 | ELI identifiers name published EU legislation; the legal basis of a conformity claim is inherently public. |
| `bioBasedFraction` | Bio-based Fraction | **Public** |  | eli/reg/2024/1781 | The bio-based share is a consumer-facing environmental claim of the same kind as recycled content (ESPR Annex I; SUP marking precedent). |
| `biodegradationPercentage` | Biodegradation Percentage | **Public** |  | eli/reg/2024/1781 | Biodegradability results substantiate consumer-facing end-of-life claims (ESPR Annex I(m)); detergent module serves related data Public. |
| `carbonFootprintMethodology` | Carbon Footprint Methodology | **Public** |  | eli/reg/2024/1781 | A public CF number is only meaningful and checkable with its methodology reference (ISO 14067/PEF citation). |
| `carbonFootprintStudyUrl` | Carbon Footprint Study URL | **Public** |  | eli/reg/2023/1542 | The Battery Regulation requires a public web link to the underlying CF study (Reg. 2023/1542 Annex XIII(1)); battery module serves the same name Public. |
| `carbonFootprintTotal` | Carbon Footprint Total | **Public** |  | eli/reg/2024/1781 | The total lifecycle CF figure is the headline public value of the CF declaration (Battery Reg. Annex XIII(1) precedent; UNTP alignment). |
| `casNumber` | CAS Number | **AuthorizedOnly** |  | eli/reg/2023/1542 | Substance registry numbers combined with fractions enable full formulation reconstruction; they serve professional and authority use (battery Annex XIII(2) precedent). |
| `collectionPointDirectoryUrl` | Collection Point Directory URL | **Public** |  | eli/dir/2008/98 | A directory of physical collection points is only useful if consumers can reach it (WFD Art. 8a(2) information duty). |
| `combinedNomenclatureCode` | Combined Nomenclature Code | **Public** |  | eli/reg/2024/1781 | The CN commodity code is published on customs declarations and delimits which product law applies, so it carries no commercial confidence beyond the public product classification. |
| `complianceDate` | Compliance Date | **Public** |  | eli/reg/2024/1781 | The verification date qualifies the public compliance assertion it accompanies. |
| `complianceStatus` | Compliance Status | **Public** |  | eli/reg/2024/1781 | Compliance assertions exist to be shown to buyers and authorities — the EU declaration of conformity is a public-facing document (ESPR Art. 44); battery module serves the same name Public. |
| `componentIdentifier` | Component Identifier | **AuthorizedOnly** |  | eli/reg/2024/1781 | Internal component/material codes reveal bill-of-materials structure; they serve repairers, recyclers and authorities (ESPR Art. 9(2)). |
| `componentName` | Component Name | **AuthorizedOnly** |  | eli/reg/2023/1542 | Component-level naming belongs to the detailed composition tier served to legitimate-interest parties (battery Annex XIII(2) precedent). |
| `compostabilityStandard` | Compostability Standard | **Public** |  | eli/reg/2024/1781 | The certified compostability standard backs an on-pack consumer claim (EN 13432 marking precedent; ESPR Annex I(m)). |
| `concentration` | Concentration | **AuthorizedOnly** |  | eli/reg/2023/1542 | The CLP label already discloses presence; exact concentrations are trade-secret-adjacent and serve professional risk assessment (battery Annex XIII(2) precedent). |
| `contentSpecificationId` | Content Specification Identifier | **(inherited)** |  |  |  |
| `crmListVersion` | CRM List Version | **AuthorizedOnly** |  | eli/reg/2024/1252 | The CRM list version qualifies the CRM/SRM flags and shares their audience (Reg. 2024/1252). |
| `customsCommodityCode` | Customs Commodity Code | **AuthorizedOnly** |  | eli/reg/2013/952 | Commodity codes serve the customs controls of ESPR Art. 9/UCC and reveal sourcing and tariff strategy if broadcast (Reg. (EU) 952/2013). |
| `dataProviderCertification` | Data Provider Certification | **AuthorizedOnly** |  | eli/reg/2024/1781 | Provider accreditation detail supports authority and auditor verification of the data pipeline, not consumer decisions. |
| `dataQualityAssessment` | Data Quality Assessment | **AuthorizedOnly** |  | eli/reg/2023/1542 | A-E data-quality ratings qualify professional use of the underlying data and mirror the battery precedent's legitimate-interest tier. |
| `declaredUnit` | Declared Unit | **Public** |  | eli/reg/2024/1781 | The declared/functional unit is required to interpret any public footprint or EPD value (EN 15804; UNTP alignment). |
| `depositRedemptionChannelUrl` | Deposit Redemption Channel URL | **Public** |  | eli/dir/2008/98 | Consumers must be able to find where to redeem the deposit for the DRS to function. |
| `dictionaryReference` | Dictionary Reference | **(inherited)** |  |  |  |
| `did` | Decentralized Identifier | **AuthorizedOnly** |  | eli/reg/2024/1781 | Decentralised identifiers anchor operator identity verification for authorized verifiers, not consumer display. |
| `dismantlingGuideUrl` | Dismantling Guide URL | **AuthorizedOnly** |  | eli/reg/2023/1542 | The dismantling guide targets end-of-life processors and repairers — the legitimate-interest tier of the battery precedent (Annex XIII(2)). |
| `diyRepairPossible` | DIY Repair Possible | **Public** |  | eli/reg/2024/1781 | Whether self-repair is possible is consumer purchase information of the same kind as the repairability score (ESPR Annex I(b)). |
| `documentUrl` | Document URL | **(inherited)** |  |  |  |
| `dppSchemaVersion` | DPP Schema Version | **Public** |  | eli/reg/2024/1781 | Every reader needs the schema version to parse the passport at all, so it belongs to the ESPR Art. 9(1) public baseline. |
| `ecNumber` | EC Number | **AuthorizedOnly** |  | eli/reg/2023/1542 | EC numbers are formulation-level substance identifiers for professional and authority use; textile module agrees on AuthorizedOnly. |
| `economicOperatorId` | Economic Operator ID | **AuthorizedOnly** |  | eli/reg/2024/1781 | The ESPR Art. 77 operator registry identifier serves customs and market-surveillance cross-checks (Art. 9(2)), not consumers. |
| `elementId` | Element Id | **(inherited)** |  |  |  |
| `endOfLifeInstructions` | End of Life Instructions | **Public** |  | eli/reg/2024/1781 | End-of-life handling instructions are directed at end users (ESPR Annex I(m); WFD consumer-information duties). |
| `eoriNumber` | EORI Number | **Restricted** |  | eli/reg/2013/952 | EORI is customs-registration data that the Commission publishes only with the operator's consent (UCC, Reg. (EU) 952/2013). |
| `epdProgramOperator` | EPD Programme Operator | **Public** |  | eli/reg/2024/1781 | The programme operator's name is part of every published EPD's identification per ISO 14025. |
| `epdRegistrationNumber` | EPD Registration Number | **Public** |  | eli/reg/2024/1781 | The EPD registration number points into the programme operator's public declaration library (ISO 14025 publication requirement). |
| `epdStandard` | EPD Reference Standard | **Public** |  | eli/reg/2024/1781 | The reference standard and PCR version make the published EPD interpretable and comparable (EN 15804+A2). |
| `epdValidUntil` | EPD Valid Until | **Public** |  | eli/reg/2024/1781 | EPD validity is part of the published declaration's identification per ISO 14025. |
| `eprComplianceUrl` | EPR Compliance URL | **Public** |  | eli/dir/2008/98 | This URL points to the EPR scheme operator's public verification endpoint, which exists to be consulted (WFD Art. 8a transparency). |
| `eprelProductUrl` | EPREL Product URL | **Public** | 🔒 eli/reg/2017/1369 | eli/reg/2017/1369 | EPREL's product database part is public by design; this URL merely points into it (Regulation (EU) 2017/1369 Art. 12/Annex I). |
| `eprelRegistrationNumber` | EPREL Registration Number | **Public** | 🔒 eli/reg/2017/1369 | eli/reg/2017/1369 | The EPREL registration number identifies the product's entry in a public register (Regulation (EU) 2017/1369). |
| `eprRegistrationNumber` | EPR Registration Number | **AuthorizedOnly** |  | eli/dir/2008/98 | Producer registration numbers support scheme and authority verification (WFD Art. 8a); the consumer-facing proof is eprComplianceUrl. |
| `eprWasteStream` | EPR Waste Stream | **AuthorizedOnly** |  | eli/dir/2008/98 | The covered waste stream is a qualifier of the EPR registration record and shares its audience (WFD Art. 8a). |
| `facilityId` | Facility Identifier | **Restricted** |  | eli/reg/2023/1542 | Facility identifiers map the physical supply chain; the battery precedent reserves manufacturing-site detail for notified bodies, authorities and the Commission (Reg. 2023/1542 Annex XIII(4)). |
| `facilityType` | Facility Type | **Restricted** |  | eli/reg/2023/1542 | The facility's function reveals production-network structure and shares the facility record's authority-only audience (battery precedent). |
| `forcedLabourFreeAssertion` | Forced-Labour-Free Assertion | **Public** |  | eli/reg/2024/3015 | A forced-labour-free assertion is a public marketability claim under the Forced Labour Regulation (EU) 2024/3015. |
| `granularityLevel` | Granularity Level | **Public** |  | eli/reg/2024/1781 | Whether the passport describes a model, batch, or item is required to interpret every other statement in it. |
| `hasAccessLevel` | Access Level | **Public** |  | eli/reg/2024/1781 | The declared tier of a data element must itself be visible for ESPR Art. 9 gating to be interpretable. |
| `hasAccessRights` | Access Rights | **Public** |  | eli/reg/2024/1781 | Tier metadata must be readable by every client so it knows what it may and may not fetch under ESPR Art. 9. |
| `hasAnnualEnergyConsumption` | Annual Energy Consumption | **Public** | 🔒 eli/reg/2017/1369 | eli/reg/2017/1369 | Annual energy consumption appears on the mandatory energy label and in EPREL's public part (Regulation (EU) 2017/1369). |
| `hasAuthorizedParties` | Authorized Parties | **Restricted** |  | eli/reg/2024/1781 | The access-control list itself reveals business relationships and is only actionable by the passport owner and authorities (ESPR Art. 9). |
| `hasBackupCopyHost` | Backup Copy Host | **Public** |  | eli/reg/2024/1781 | The backup host exists so the passport stays reachable when the primary fails; a fallback address only works if its identity is public (Art. 10(4)). |
| `hasBiodegradability` | Biodegradability | **Public** |  | eli/reg/2024/1781 | Entry property for a biodegradability observation whose members (biodegradationPercentage, biodegradabilityTestMethod) are individually Public. |
| `hasBiodegradabilityTestMethod` | Biodegradability Test Method | **Public** |  | eli/reg/2024/1781 | The test method makes the public biodegradation percentage checkable; a claim without its method is unverifiable. |
| `hasCarbonFootprint` | Carbon Footprint | **Public** |  | eli/reg/2024/1781 | The product carbon footprint is a consumer-comparable parameter (ESPR Annex I(l)); the Battery Regulation Annex XIII(1) makes it public, and battery module serves the shared names Public. |
| `hasCarbonFootprintDeclaration` | Carbon Footprint Declaration | **Public** |  | eli/reg/2023/1542 | The CF declaration is the published container of figures that are individually public under the battery precedent. |
| `hasCarbonFootprintDistribution` | Carbon Footprint: Distribution | **Public** |  | eli/reg/2023/1542 | Lifecycle-stage shares of the public CF figure are themselves public in the battery precedent (Reg. 2023/1542 Annex XIII(1)). |
| `hasCarbonFootprintEndOfLife` | Carbon Footprint: End of Life | **Public** |  | eli/reg/2023/1542 | Lifecycle-stage shares of the public CF figure are themselves public in the battery precedent (Reg. 2023/1542 Annex XIII(1)). |
| `hasCarbonFootprintProduction` | Carbon Footprint: Production | **Public** |  | eli/reg/2023/1542 | Lifecycle-stage shares of the public CF figure are themselves public in the battery precedent (Reg. 2023/1542 Annex XIII(1)). |
| `hasCarbonFootprintRawMaterial` | Carbon Footprint: Raw Material Acquisition | **Public** |  | eli/reg/2023/1542 | Lifecycle-stage shares of the public CF figure are themselves public in the battery precedent (Reg. 2023/1542 Annex XIII(1)). |
| `hasCarbonFootprintUse` | Carbon Footprint: Use Phase | **Public** |  | eli/reg/2023/1542 | Lifecycle-stage shares of the public CF figure are themselves public in the battery precedent (Reg. 2023/1542 Annex XIII(1)). |
| `hasCircularityPerformance` | Circularity Performance | **Public** |  | eli/reg/2024/1781 | Container for the circularity parameters (recycled content, recyclability) that ESPR Art. 7(5)/Annex I direct at consumers; its members are individually Public. |
| `hasCompostability` | Compostability | **Public** |  | eli/reg/2024/1781 | Entry property for a compostability classification whose members (compostabilityType, compostabilityStandard) are individually Public and back an on-pack consumer claim. |
| `hasCompostabilityType` | Compostability Type | **Public** |  | eli/reg/2024/1781 | Home- vs industrial-compostability determines correct consumer disposal and is the point of the on-pack claim. |
| `hasConformityDeclaration` | Conformity Declaration | **Public** |  | eli/reg/2024/1781 | The EU declaration of conformity must accompany the product and be produced on request (ESPR Art. 44), so the reference to it cannot be gated. |
| `hasCustomsCommodityCodeType` | Customs Commodity Code Type | **AuthorizedOnly** |  | eli/reg/2013/952 | The classification-system qualifier shares the audience of the commodity code it qualifies (Reg. (EU) 952/2013). |
| `hasDataElement` | Data Element | **(inherited)** |  |  |  |
| `hasDataRetentionPeriod` | Data Retention Period | **Public** |  | eli/reg/2024/1781 | The regulatory retention period is compliance metadata about the passport itself, not commercial data. |
| `hasDepositAmount` | Deposit Amount | **Public** |  | eli/dir/2008/98 | The refundable deposit is printed at point of sale and on-pack; it is consumer price information. |
| `hasDepositReturnScheme` | Deposit-Return Scheme | **Public** |  | eli/dir/2008/98 | DRS participation is marked on-pack and must be visible to consumers for the scheme to function (WFD/PPWR deposit-return provisions). |
| `hasDepositSchemeOperator` | Deposit Scheme Operator | **Public** |  | eli/dir/2008/98 | The operating PRO of a deposit-return scheme is public scheme information, not commercial data of the producer. |
| `hasDismantlingInstructions` | Dismantling Instructions | **AuthorizedOnly** |  | eli/reg/2023/1542 | The battery precedent gives dismantling information to persons with a legitimate interest, not the general public (Reg. 2023/1542 Annex XIII(2)(c)). |
| `hasDocuments` | Documents | **(inherited)** |  |  |  |
| `hasDocumentType` | Document Type | **(inherited)** |  |  |  |
| `hasDueDiligenceRegulationContext` | Due Diligence Regulation Context | **AuthorizedOnly** |  | eli/reg/2023/1542 | The regulatory anchor of a due-diligence report shares the report's legitimate-interest audience (battery Annex XIII(3) precedent). |
| `hasDueDiligenceReport` | Due Diligence Report | **AuthorizedOnly** |  | eli/reg/2023/1542 | Full due-diligence documentation contains supplier-level detail; the battery precedent routes it to notified bodies, surveillance authorities and the Commission (Annex XIII(3)) — public summaries go via thirdPartyAssurancesUrl. |
| `hasEmissionsPerformance` | Emissions Performance | **Public** |  | eli/reg/2024/1781 | Container for emissions figures (carbonFootprint*) that are individually Public under the battery precedent; aligned with UNTP EmissionsPerformance. |
| `hasEndOfLifeProgram` | End-of-Life Program | **Public** |  | eli/dir/2008/98 | Producer end-of-life/take-back programmes only work if consumers can find them (WFD Art. 8a(2) information duty). |
| `hasEnergyEfficiency` | Energy Efficiency | **Public** |  | eli/reg/2017/1369 | Energy performance data feeds the public energy label under the Energy Labelling Framework Regulation; electronics module serves it Public. |
| `hasEnergyEfficiencyClass` | Energy Efficiency Class | **Public** | 🔒 eli/reg/2017/1369 | eli/reg/2017/1369 | The energy efficiency class is printed on the mandatory public label and published in EPREL's public part, so its audience is fixed by Regulation (EU) 2017/1369. |
| `hasEnvironmentalProductDeclaration` | Environmental Product Declaration | **Public** |  | eli/reg/2024/1781 | EPDs under ISO 14025/EN 15804 are published, third-party-verified declarations by definition. |
| `hasEprJurisdiction` | EPR Jurisdiction | **AuthorizedOnly** |  | eli/dir/2008/98 | Per-member-state registration coverage maps the producer's market footprint for enforcement (WFD Art. 8a). |
| `hasEprScheme` | EPR Scheme Operator | **AuthorizedOnly** |  | eli/dir/2008/98 | The producer's PRO affiliation is compliance-registry detail for authorities and schemes (WFD Art. 8a). |
| `hasExpectedLifespan` | Expected Lifespan | **Public** |  | eli/reg/2024/1781 | Durability expressed as expected lifespan is a consumer-facing product parameter under ESPR Art. 7(5) and Annex I(a). |
| `hasExtendedProducerResponsibility` | Extended Producer Responsibility | **AuthorizedOnly** |  | eli/dir/2008/98 | EPR registration records serve scheme operators and enforcement under WFD Art. 8a; member-state registers are not uniformly public. |
| `hasFacilityCertifications` | Facility Certifications | **Restricted** |  | eli/reg/2023/1542 | Per-facility certification detail identifies specific sites and shares the facility record's authority-only audience (battery precedent). |
| `hasFacilityInformation` | Facility Information | **Restricted** |  | eli/reg/2023/1542 | Full facility records (location, type, certifications) are commercially sensitive supply-chain mapping data for authorities and designated operators (battery precedent). |
| `hasGuaranteedLifespan` | Guaranteed Lifespan | **Public** |  | eli/reg/2024/1781 | The guaranteed minimum lifespan is warranty information that must reach the buyer before purchase (ESPR Annex III consumer information). |
| `hasHazardClass` | Hazard Class | **Public** | 🔒 eli/reg/2008/1272 | eli/reg/2008/1272 | CLP hazard classification drives mandatory public label elements and is published in ECHA's C&L Inventory (Reg. (EC) 1272/2008); battery module serves the same name Public. |
| `hasHazardousSubstances` | Hazardous Substances | **Public** |  | eli/reg/2008/1272 | The presence and identity of hazardous substances is disclosed on the CLP label (Reg. (EC) 1272/2008 Art. 18); battery and detergent modules serve the same name Public — exact concentrations stay tiered separately. |
| `hasHazardSignalWord` | Hazard Signal Word | **Public** | 🔒 eli/reg/2008/1272 | eli/reg/2008/1272 | The signal word (Danger/Warning) is a mandatory element of the public CLP label (Reg. (EC) 1272/2008 Art. 17). |
| `hasImpactIndicator` | Impact Indicator | **(inherited)** |  |  |  |
| `hasIndicatorType` | Indicator Type | **(inherited)** |  |  |  |
| `hasLifecycleStage` | Lifecycle Stage | **(inherited)** |  |  |  |
| `hasLifecycleStageResult` | Lifecycle Stage Result | **(inherited)** |  |  |  |
| `hasMaterialComposition` | Material Composition | **AuthorizedOnly** |  | eli/reg/2023/1542 | Detailed composition beyond CLP label disclosure is commercially sensitive; the battery precedent serves it to legitimate-interest parties (Annex XIII(2)). |
| `hasMaterialOrigin` | Material Origin | **AuthorizedOnly** |  | eli/reg/2024/1781 | Per-material origin exposes supplier relationships; supply-chain mapping detail is for authorities and legitimate-interest parties (ESPR Art. 9(2)). |
| `hasMultiLanguageValue` | Multi-Language Value | **(inherited)** |  |  |  |
| `hasOperationalScope` | Operational Scope | **(inherited)** |  |  |  |
| `hasOperatorInformation` | Operator Information | **AuthorizedOnly** |  | eli/reg/2024/1781 | Detailed operator records (addresses, contacts) serve surveillance and customs under ESPR Art. 9(2); the public sees the issuer via passportIssuer. |
| `hasOperatorRole` | Operator Role | **AuthorizedOnly** |  | eli/reg/2024/1781 | The operator's supply-chain role (importer, fulfilment provider, ...) maps responsibility chains for authorities (ESPR Art. 9(2)). |
| `hasPassportIssuer` | Passport Issuer | **Public** |  | eli/reg/2024/1781 | ESPR makes the passport-issuing economic operator accountable for the passport (Art. 9, Art. 77 registry), so issuer identity is part of the public record. |
| `hasPerformanceInfo` | Performance Information | **Public** |  | eli/reg/2024/1781 | Container for the durability and performance parameters that ESPR Art. 7(5)/Annex III direct at consumers; its members are individually Public. |
| `hasPowerConsumptionOff` | Power Consumption: Off Mode | **Public** |  | eli/reg/2017/1369 | Off-mode power is regulated and published under ecodesign/energy-labelling measures (standby regulation lineage); no confidentiality interest exists. |
| `hasPowerConsumptionOn` | Power Consumption: On Mode | **Public** |  | eli/reg/2017/1369 | Mode-specific power values are product-information-sheet data published for labelled product groups; kept overridable pending each group's delegated act. |
| `hasPowerConsumptionStandby` | Power Consumption: Standby Mode | **Public** |  | eli/reg/2017/1369 | Standby power is regulated and published under ecodesign/energy-labelling measures; product-fiche data for labelled groups. |
| `hasProductCategory` | Product Category | **Public** |  | eli/reg/2024/1781 | The ESPR product-group classification determines which delegated act applies and is inherently public market information. |
| `hasRecyclabilityAssessment` | Recyclability Assessment | **Public** |  | eli/reg/2024/1781 | The recyclability assessment substantiates public recyclability claims (ESPR Annex I(i)); textile module serves the same name Public. |
| `hasRecycledContentDetails` | Recycled Content Details | **Public** |  | eli/reg/2024/1781 | Detailed pre-/post-consumer breakdown of a figure whose components (recycledContent, pre-/postConsumerRecycledContent) are individually Public. |
| `hasRepairabilityInfo` | Repairability Information | **Public** |  | eli/reg/2024/1781 | Repair and maintenance information is directed at end users and independent repairers under ESPR Annex I(b) and the right-to-repair framework. |
| `hasRepairInstructions` | Repair Instructions | **Public** |  | eli/reg/2024/1781 | Access to repair instructions for consumers and independent operators is a core ESPR/right-to-repair objective (Annex I(b), Dir. 2024/1799). |
| `hasRepairProvider` | Repair Provider | **Public** |  | eli/dir/2024/1799 | Links to authorised repair providers serve consumer repairer discovery under the right-to-repair framework (Dir. 2024/1799). |
| `hasReportingGranularity` | Reporting Granularity | **Public** |  | eli/reg/2024/1781 | Per-attribute reporting granularity (model/batch/item) is interpretation metadata needed to read the value it qualifies, like the passport-level granularity. |
| `hasSoftwareUpdatesAvailability` | Software Updates Availability | **Public** |  | eli/reg/2024/1781 | The guaranteed software/firmware update period is a consumer durability parameter (ESPR Annex I; smartphone/tablet labelling precedent). |
| `hasSparePartsAvailability` | Spare Parts Availability | **Public** |  | eli/reg/2024/1781 | Spare-parts availability duration is a consumer purchase parameter under ESPR Annex I(d) and existing ecodesign implementing measures. |
| `hasSubstancesOfConcern` | Substances of Concern | **Public** |  | eli/reg/2024/1781 | Tracking substances of concern is a stated DPP objective (ESPR Art. 7(5)(b)) and presence data is already public via ECHA's SCIP database; textile module agrees on Public. |
| `hasTechnicalLifetime` | Technical Lifetime | **Public** |  | eli/reg/2024/1781 | Technical lifetime under specified conditions is a durability parameter directed at end users per ESPR Annex I(a). |
| `hasTraceabilityPerformance` | Traceability Performance | **Public** |  | eli/reg/2024/1781 | Aggregate traceability metrics substantiate public transparency claims without exposing individual suppliers (ESPR Art. 7; CSDDD context). |
| `hasTradeItemPieces` | Trade Item Pieces | **Public** |  | eli/reg/2024/1781 | The piece set is the container for piece data that is itself Public throughout; gating it would hide public product identification behind a closed door. |
| `hasVerificationBody` | Verification Body | **Public** |  | eli/reg/2024/1781 | Naming the third-party verifier is what makes public assurances checkable; battery module serves the same name Public. |
| `hazardImpact` | Hazard Impact | **(inherited)** |  |  |  |
| `hazardPictogramCode` | Hazard Pictogram Code | **Public** | 🔒 eli/reg/2008/1272 | eli/reg/2008/1272 | GHS pictograms are mandatory elements of the public CLP label (Reg. (EC) 1272/2008 Art. 17). |
| `hazardStatement` | Hazard Statement (H-statement) | **Public** | 🔒 eli/reg/2008/1272 | eli/reg/2008/1272 | H-statements are mandatory elements of the public CLP label (Reg. (EC) 1272/2008 Art. 17). |
| `identityCredentialUrl` | Identity Credential URL | **AuthorizedOnly** |  | eli/reg/2024/1781 | Identity-credential endpoints serve verifier workflows and share the operator-identity tier (ESPR Art. 9(2)). |
| `indicatorTotalValue` | Indicator Total Value | **(inherited)** |  |  |  |
| `indicatorUnit` | Indicator Unit | **(inherited)** |  |  |  |
| `isCriticalRawMaterial` | Is Critical Raw Material | **AuthorizedOnly** |  | eli/reg/2024/1252 | CRM flags support recovery obligations of recyclers and authorities under the CRMA (Reg. 2024/1252), not consumer information. |
| `isEnergyRelated` | Is Energy-Related Product | **Public** |  | eli/reg/2024/1781 | Regulatory scope classification; whether a product is energy-related decides which public ecodesign requirements apply. |
| `isRegulationCompliant` | Is Regulation Compliant | **Public** |  | eli/reg/2024/1781 | A per-act compliance flag is a public conformity claim of the declaration-of-conformity kind (ESPR Art. 44). |
| `isStrategicRawMaterial` | Is Strategic Raw Material | **AuthorizedOnly** |  | eli/reg/2024/1252 | Strategic-raw-material flags are supply-security-sensitive and serve authorities and recyclers under the CRMA (Reg. 2024/1252 Annex I). |
| `issueDate` | Issue Date | **Public** |  | eli/reg/2024/1781 | A generic issue date is neutral document metadata needed to judge currency, on par with passportIssueDate. |
| `iupacName` | IUPAC Name | **AuthorizedOnly** |  | eli/reg/2023/1542 | Systematic substance names combined with fractions enable formulation reconstruction, same trade-secret exposure as oec:casNumber (battery Annex XIII(2) precedent). |
| `landUse` | Land Use | **Public** |  | eli/reg/2024/1781 | Annex I ecodesign parameter; headline lifecycle figure with the same consumer-information role as oec:carbonFootprintTotal. |
| `language` | Language | **Public** |  | eli/reg/2024/1781 | Language tags are rendering metadata with no confidentiality content. |
| `languageCode` | Language Code | **Public** |  | eli/reg/2024/1781 | Language codes are rendering metadata with no confidentiality content. |
| `lastDataUpdate` | Last Data Update | **Public** |  | eli/reg/2024/1781 | Update timestamps let all audiences judge data currency; battery module serves the same name Public. |
| `lastUpdated` | Last Updated | **Public** |  | eli/reg/2024/1781 | Update timestamps let all audiences judge data currency (EN 18223 lastUpdated). |
| `massFraction` | Mass Fraction | **AuthorizedOnly** |  | eli/reg/2023/1542 | Exact mass fractions enable formulation reconstruction; recyclers and authorities need them, consumers do not (battery Annex XIII(2) precedent). |
| `materialCircularityIndicator` | Material Circularity Indicator | **Public** |  | eli/reg/2024/1781 | An aggregate circularity score is a consumer comparison metric composed of inputs (recycled content, recyclability, utility) that are themselves Public. |
| `materialFootprint` | Material Footprint | **Public** |  | eli/reg/2024/1781 | Annex I ecodesign parameter; headline lifecycle figure with the same consumer-information role as oec:carbonFootprintTotal. |
| `mimeType` | MIME Type | **(inherited)** |  |  |  |
| `packagingWasteAmount` | Packaging Waste Amount | **Public** |  | eli/reg/2024/1781 | Annex I ecodesign parameter; PPWR reporting publishes the same per-unit packaging figures. |
| `passportExpiryDate` | Passport Expiry Date | **Public** |  | eli/reg/2024/1781 | Readers must know when a passport ceases to be valid; expiry is interpretation metadata like the issue date. |
| `passportIdentifier` | Passport Identifier | **Public** |  | eli/reg/2024/1781 | The passport identifier is the public entry point resolved from the ESPR Art. 9 data carrier and cannot itself be gated. |
| `passportIssueDate` | Passport Issue Date | **Public** |  | eli/reg/2024/1781 | The issue date is neutral passport metadata every audience needs to judge the currency of the information. |
| `passportStatus` | Passport Status | **Public** |  | eli/reg/2024/1781 | Consumers and repairers must be able to tell an active passport from an archived or invalid one before relying on its content. |
| `passportVersion` | Passport Version | **Public** |  | eli/reg/2024/1781 | Version metadata lets any reader confirm they are looking at the current passport revision (EN 18223 lifecycle management). |
| `performanceClass` | Performance Class | **Public** |  | eli/reg/2024/1781 | Performance/efficiency classes (e.g. A-G) exist precisely for at-a-glance consumer comparison, mirroring the public energy-label and battery CF classes. |
| `postConsumerRecycledContent` | Post-Consumer Recycled Content | **Public** |  | eli/reg/2024/1781 | The post-consumer split substantiates the public recycled-content claim (ESPR Annex I(h); PPWR recycled-content rules). |
| `precautionaryStatement` | Precautionary Statement (P-statement) | **Public** | 🔒 eli/reg/2008/1272 | eli/reg/2008/1272 | P-statements are mandatory elements of the public CLP label (Reg. (EC) 1272/2008 Art. 17). |
| `preConsumerRecycledContent` | Pre-Consumer Recycled Content | **Public** |  | eli/reg/2024/1781 | The pre-consumer split substantiates the public recycled-content claim (ESPR Annex I(h)). |
| `previousPassportVersion` | Previous Passport Version | **Public** |  | eli/reg/2024/1781 | The version-history link (EN 18221) keeps the public record auditable without exposing any additional substantive data. |
| `primarySourcedRatio` | Primary Sourced Ratio | **Public** |  | eli/reg/2024/1781 | The measured-vs-estimated data share qualifies the public traceability and footprint claims it accompanies, like its sibling verifiedRatio. |
| `productCategoryRules` | Product Category Rules | **Public** |  | eli/reg/2024/1781 | The PCR/PEFCR reference is EPD metadata without which the declared results are not comparable; ISO 14025 declarations are public documents. |
| `productToPackagingRatio` | Product-to-Packaging Ratio | **Public** |  | eli/reg/2024/1781 | Annex I ecodesign parameter; derived from weights GS1 already publishes per trade item. |
| `professionalRepairNetwork` | Professional Repair Network | **Public** |  | eli/dir/2024/1799 | Consumers must be able to find authorised repairers; the Right-to-Repair Directive builds on public repairer discovery (Dir. 2024/1799). |
| `recoverableRate` | Recoverable Rate | **Public** |  | eli/reg/2024/1781 | End-of-life recoverability is consumer-facing circularity information, same tier as oec:recyclabilityRate. |
| `recyclabilityMethodology` | Recyclability Methodology | **Public** |  | eli/reg/2024/1781 | A public recyclability claim is only checkable with its methodology reference, mirroring the public carbonFootprintMethodology. |
| `recyclabilityRate` | Recyclability Rate | **Public** |  | eli/reg/2024/1781 | The recyclable fraction is consumer-facing under ESPR Annex I(i); electronics module serves the same name Public. |
| `recyclabilityScore` | Recyclability Score | **Public** |  | eli/reg/2024/1781 | Numeric recyclability scores (e.g. JRC textile methodology) exist for consumer comparison; textile module serves it Public. |
| `recyclableContent` | Recyclable Content | **Public** |  | eli/reg/2024/1781 | The recyclable fraction is a consumer comparison parameter under ESPR Annex I(i). |
| `recycledContent` | Recycled Content | **Public** |  | eli/reg/2024/1781 | Recycled-content share is a consumer-facing sustainability parameter (ESPR Annex I(h)); the Battery Regulation makes it public on-pack/passport. |
| `recyclingCollectionRate` | Recycling Collection Rate | **Public** |  | eli/reg/2024/1781 | Collection rates are scheme-level statistics published by EPR schemes and member states; nothing product-confidential. |
| `registrationNumber` | Registration Number | **AuthorizedOnly** |  | eli/reg/2024/1781 | Official registration/licence numbers support authority verification; broadcasting them invites impersonation without serving consumers. |
| `regulatoryActStatus` | Regulatory Act Status | **Public** |  | eli/reg/2024/1781 | The product's status under a named regulatory act (ACTIVE/EXEMPT/PENDING) is public market-access information. |
| `regulatoryPermitIdentification` | Regulatory Permit Identification | **AuthorizedOnly** |  | eli/reg/2024/1781 | Permit and type-examination certificate identifiers serve authority verification; publishing them aids certificate fraud, not consumers. |
| `remanufacturingDate` | Remanufacturing / refurbishment date | **Public** |  | eli/reg/2024/1781 | Whether and when a product was remanufactured or refurbished is purchase-relevant consumer information supporting ESPR's reuse objectives (Annex I). |
| `repairabilityClass` | Repairability Class | **Public** |  | eli/reg/2024/1781 | A repairability class is the at-a-glance consumer form of the repairability score, mirroring public energy-label classes. |
| `repairabilityScore` | Repairability Score | **Public** |  | eli/reg/2024/1781 | Repairability index scores exist to steer purchase decisions (ESPR Annex I(b)); the French Indice de Réparabilité mandates display at point of sale. |
| `repairInformationPortalUrl` | Repair Information Portal URL | **Public** |  | eli/dir/2024/1799 | The Right-to-Repair Directive requires manufacturers to make repair information available via a freely accessible portal (Dir. 2024/1799 Art. 4/5). |
| `repairProviderName` | Repair Provider Name | **Public** |  | eli/dir/2024/1799 | The name of a repair provider that has agreed to be listed is consumer-facing directory information (Dir. 2024/1799). |
| `repairProviderUrl` | Repair Provider URL | **Public** |  | eli/dir/2024/1799 | The listed repair provider's URL is consumer-facing directory information (Dir. 2024/1799). |
| `reportDate` | Report Date | **(inherited)** |  |  |  |
| `reportUrl` | Report URL | **(inherited)** |  |  |  |
| `safeDisassemblyInstructions` | Safe Disassembly Instructions | **AuthorizedOnly** |  | eli/reg/2023/1542 | Safe-disassembly detail for substance-bearing components addresses professional handlers, not consumers (battery Annex XIII(2) precedent). |
| `safeUseInstructions` | Safe Use Instructions | **Public** |  | eli/reg/2024/1781 | Safe-use instructions for products containing substances of concern are directed at end users (ESPR Art. 7(5); CLP supplemental information); textile module agrees on Public. |
| `scipId` | SCIP ID | **Public** | 🔒 eli/dir/2008/98 | eli/dir/2008/98 | SCIP notifications are made publicly available by ECHA under WFD Art. 9(2), so the SCIP identifier points into a public database by design. |
| `separateCollectionInfo` | Separate Collection Info | **Public** |  | eli/dir/2008/98 | Separate-collection requirements must reach end users under the WFD/WEEE consumer-information duties (Dir. 2008/98/EC Art. 8a(2)). |
| `socThreshold` | Substance of Concern Threshold | **Public** |  | eli/reg/2024/1781 | Declaration thresholds come from the delegated act, not from the manufacturer; publishing the threshold discloses regulation text, not formulation. |
| `stageValue` | Stage Value | **(inherited)** |  |  |  |
| `substanceLocation` | Substance Location | **AuthorizedOnly** |  | eli/reg/2023/1542 | Where a substance sits in the product is dismantling/processing detail for waste operators (battery Annex XIII(2); SCIP notification detail). |
| `substanceTradeName` | Substance Trade Name | **AuthorizedOnly** |  | eli/reg/2023/1542 | Trade names reveal supplier relationships on top of substance identity; same professional/authority audience as oec:casNumber. |
| `supplyChainTransparencyUrl` | Supply-Chain Transparency URL | **Public** |  | eli/dir/2024/1760 | CSDDD Art. 16 requires companies to publicly communicate on due diligence; a transparency endpoint is public by function. |
| `takeBackIncentive` | Take-Back Incentive | **Public** |  | eli/dir/2008/98 | A take-back incentive only steers consumer behaviour if consumers can see it; textile module serves the same name Public. |
| `takeBackUrl` | Take-Back URL | **Public** |  | eli/dir/2008/98 | The consumer-facing take-back landing page is public by function; textile module serves the same name Public. |
| `testedConditions` | Tested Conditions | **(inherited)** |  |  |  |
| `thirdPartyAssurancesUrl` | Third Party Assurances URL | **Public** |  | eli/reg/2024/1781 | Third-party assurance links substantiate public claims and are public by function; battery module serves the same name Public. |
| `tradeItemPieceCount` | Trade Item Piece Count | **Public** |  | eli/reg/2024/1781 | How many physical pieces constitute the trade item is basic product identification within the consumer-facing ESPR Annex III information. |
| `tradeItemPieceDescription` | Trade Item Piece Description | **Public** |  | eli/reg/2024/1781 | The human-readable description of each piece (jacket, trousers, booklet) is consumer product identification per ESPR Annex III. |
| `tradeItemPieceNumber` | Trade Item Piece Number | **Public** |  | eli/reg/2024/1781 | The sequential piece number carries no commercial content and is needed to identify which piece of the item one holds. |
| `tradeItemPieceOf` | Trade Item Piece Of | **Public** |  | eli/reg/2024/1781 | Linking a piece to its parent GTIN is product identification equivalent to the public product identifier itself. |
| `usageCycles` | Usage Cycles | **Public** |  | eli/reg/2024/1781 | Expected usage cycles are a durability metric of the same consumer-comparison kind as expected lifespan (ESPR Annex I(a)). |
| `utilityFactor` | Utility Factor | **Public** |  | eli/reg/2024/1781 | Durability relative to the industry average is a consumer comparison metric of the same kind as expected lifespan (ESPR Annex I(a)). |
| `value` | Value | **(inherited)** |  |  |  |
| `valueDataType` | Value Data Type | **(inherited)** |  |  |  |
| `verifiedRatio` | Verified Ratio | **Public** |  | eli/reg/2024/1781 | The verifiably-traced share is an aggregate metric that qualifies the public traceability claim without naming suppliers. |
| `wasteGenerationAmount` | Waste Generation Amount | **Public** |  | eli/reg/2024/1781 | Annex I ecodesign parameter; headline lifecycle figure with the same consumer-information role as oec:carbonFootprintTotal. |
| `wastePreventionInfo` | Waste Prevention Info | **Public** |  | eli/dir/2008/98 | Waste-prevention information is consumer-directed by definition (Dir. 2008/98/EC Art. 9). |
| `waterConsumption` | Water Consumption | **Public** |  | eli/reg/2024/1781 | Annex I ecodesign parameter; headline lifecycle figure with the same consumer-information role as oec:carbonFootprintTotal. |
