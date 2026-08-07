# Access-tier review matrix — electronics

Regulatory frame: Energy Labelling 2017/1369 (EPREL) / Ecodesign

Coverage: 102 properties — 51 Public / 32 AuthorizedOnly / 0 Restricted / 19 inherited / 0 UNCLASSIFIED; 5 legally locked.

| Term | Label | Tier | Mandated (locked) | Source | Rationale |
|---|---|---|---|---|---|
| `assessmentDate` | Assessment Date | **Public** |  | eli/reg/2024/1781 | The assessment date tells consumers how current the public repairability score is. |
| `avoidedEmissionsKgCO2e` | Avoided Emissions (kg CO2e) | **(inherited)** |  |  |  |
| `batteryMassGrams` | Battery Mass (grams) | **(inherited)** |  |  |  |
| `calculationMethod` | Calculation Method | **(inherited)** |  |  |  |
| `collectionMethod` | Collection Method | **AuthorizedOnly** |  | eli/dir/2012/19 | Which collection route one item took is take-back scheme operating data; the public tier carries the scheme itself via euelec:collectionSchemeUrl. |
| `collectionSchemeUrl` | Collection Scheme URL | **Public** |  | eli/dir/2012/19 | Dir. 2012/19/EU Art. 14 requires users to be informed about return and collection systems, so the scheme link must be public to serve its purpose. |
| `componentPartNumber` | Component Part Number | **AuthorizedOnly** |  | eli/reg/2024/1781 | Manufacturer part numbers reveal sourcing relationships and are professional repair/recycling detail. |
| `criterionDetails` | Criterion Details | **Public** |  | eli/reg/2024/1781 | The criterion explanation is part of the published substantiation of the repairability index. |
| `criterionMaxScore` | Criterion Max Score | **Public** |  | eli/reg/2024/1781 | The criterion maximum makes the public per-criterion score interpretable. |
| `criterionScore` | Criterion Score | **Public** |  | eli/reg/2024/1781 | Per-criterion scores substantiate the public repairability index. |
| `dataWiped` | Data Wiped | **AuthorizedOnly** |  | eli/dir/2012/19 | Data-erasure assertions concern one device's handling before re-use and are evidence for the operator and the previous owner, not public product data. |
| `deviceCondition` | Device Condition | **AuthorizedOnly** |  | eli/dir/2012/19 | The intake condition assessment is a treatment-operator judgement about one waste item (Dir. 2012/19/EU Art. 8), not product information. |
| `displayScore` | Display Score | **Public** |  | eli/reg/2024/1781 | The 0-10 display score is the consumer-facing figure printed on the repairability label. |
| `displayTechnology` | Display Technology | **Public** |  | eli/reg_del/2019/2013 | The panel technology is ordinary public spec-sheet information. |
| `energyLabelUrl` | Energy Label URL | **Public** | 🔒 eli/reg/2017/1369 | eli/reg/2017/1369 | The energy-label image is itself a public label; EPREL serves it in its public part (Reg. (EU) 2017/1369 Art. 12(3)). |
| `energyRecoveryRate` | Energy Recovery Rate | **(inherited)** |  |  |  |
| `eprelProductUrl` | EPREL Product URL | **Public** | 🔒 eli/reg/2017/1369 | eli/reg/2017/1369 | The EPREL product page is the public register entry itself (Reg. (EU) 2017/1369 Art. 12(3)). |
| `eprelRegistrationNumber` | EPREL Registration Number | **Public** | 🔒 eli/reg/2017/1369 | eli/reg/2017/1369 | The EPREL registration number keys the public register entry and is visible in every public EPREL URL (Reg. (EU) 2017/1369 Art. 12(3)). |
| `featureUpdateEndDate` | Feature Update End Date | **Public** |  | eli/reg/2023/1670 | The feature-update end date is the concrete form of the public update-support commitment. |
| `firmwareVersion` | Firmware Version | **Public** |  | eli/reg/2023/1670 | The current firmware version is device-state transparency a user can read from the device itself. |
| `handlingNote` | Handling Note | **(inherited)** |  |  |  |
| `hasAnnualEnergyConsumption` | Annual Energy Consumption | **Public** | 🔒 eli/reg/2017/1369 | eli/reg/2017/1369 | Annual energy consumption appears on the public energy label and product information sheet in EPREL (Reg. (EU) 2017/1369 Art. 12(3)); aligned with core oec:hasAnnualEnergyConsumption (Public). |
| `hasAssessmentBody` | Assessment Body | **Public** |  | eli/reg/2024/1781 | Who assessed the repairability index is transparency information that makes the public score credible. |
| `hasAvoidedEmissions` | Avoided Emissions | **AuthorizedOnly** |  | eli/reg/2024/1781 | Avoided-emissions estimates are recycler claims about one treatment operation; unlike a substantiated product carbon footprint they are not verified label data, so they are not published by default. |
| `hasBatteryDisposition` | Battery Disposition | **AuthorizedOnly** |  | eli/dir/2012/19 | How the removed battery was handled is treatment-chain evidence for the selective-treatment duty (Dir. 2012/19/EU Annex VII). |
| `hasBillOfMaterials` | Bill of Materials | **AuthorizedOnly** |  | eli/reg/2024/1781 | The component BOM is design and sourcing detail for repairers, recyclers and authorities with a legitimate interest, not consumer information. |
| `hasComponentPassport` | Component Passport | **AuthorizedOnly** |  | eli/reg/2024/1781 | Links into nested component passports expose the component supply chain and are aimed at professional actors (CIRPASS-2 multi-component tracking). |
| `hasComponents` | Components | **AuthorizedOnly** |  | eli/reg/2024/1781 | The component list is BOM content and shares the BOM's legitimate-interest tier. |
| `hasComponentType` | Component Type | **Public** |  | eli/reg/2024/1781 | The component type (battery, display) names the part a public repair statement refers to, without exposing sourcing detail. |
| `hasCriterionType` | Criterion Type | **Public** |  | eli/reg/2024/1781 | The criterion type identifies which published repairability criterion a score belongs to. |
| `hasDisplaySpecification` | Display Specification | **Public** |  | eli/reg_del/2019/2013 | Display specifications are spec-sheet data, published in the public EPREL fiche for displays under Reg. (EU) 2019/2013. |
| `hasEnergyEfficiency` | Energy Efficiency | **Public** |  | eli/reg/2017/1369 | The energy-label information container carries data that Reg. (EU) 2017/1369 puts on the public label and in the public part of EPREL. |
| `hasEnergyEfficiencyClass` | Energy Efficiency Class | **Public** | 🔒 eli/reg/2017/1369 | eli/reg/2017/1369 | The A-G energy class is printed on the public energy label and published in the public part of EPREL (Reg. (EU) 2017/1369 Art. 12(3)). |
| `hasEstimatedRecoverableMaterials` | Estimated Recoverable Materials | **AuthorizedOnly** |  | eli/dir/2012/19 | Pre-treatment recoverability estimates are recycler planning data; the public tier carries the design-level euelec:recyclabilityRate and euelec:recoverabilityRate. |
| `hasFeatureSupportYears` | Feature Support Years | **Public** |  | eli/reg/2023/1670 | The feature-update period is a consumer-facing support commitment of the same nature as security support. |
| `hasHazardousMaterialsIdentified` | Hazardous Materials Identified | **AuthorizedOnly** |  | eli/dir/2012/19 | Selective-treatment findings (Dir. 2012/19/EU Annex VII) are addressed to treatment operators; the consumer-facing substance summary lives in the RoHS and substance-of-concern fields. |
| `hasHazardousWasteRecord` | Hazardous Waste Record | **AuthorizedOnly** |  | eli/dir/2008/98 | Hazardous waste consignment records are regulatory documentation held between the operator and the competent authority (Dir. 2008/98/EC). |
| `hasInstalledComponentPassport` | Installed Component Passport | **AuthorizedOnly** |  | eli/reg/2024/1781 | Links into component passports expose the component supply chain, matching the tier of euelec:hasComponentPassport. |
| `hasMaterialDeclaration` | Material Declaration | **AuthorizedOnly** |  | eli/reg/2006/1907 | The IEC 62474 declaration is detailed substance composition communicated through the professional supply chain per REACH Art. 33(1); the consumer-facing hazard summary lives in public SoC fields. |
| `hasMaterialRecoveryResults` | Material Recovery Results | **AuthorizedOnly** |  | eli/dir/2012/19 | Achieved per-item recovery figures are reported to producer-responsibility schemes and authorities against the Dir. 2012/19/EU Annex V targets; the public tier carries the design-level rates. |
| `hasPeakBrightness` | Peak Brightness | **Public** |  | eli/reg_del/2019/2013 | Peak brightness is ordinary public spec-sheet information also used in the public energy-label calculation for displays. |
| `hasPowerConsumptionOff` | Power Consumption Off | **Public** |  | eli/reg/2017/1369 | Off-mode power is product-information-sheet data of the energy-labelling framework, public where a delegated act applies; aligned with core oec:hasPowerConsumptionOff (Public). |
| `hasPowerConsumptionOn` | Power Consumption On | **Public** |  | eli/reg/2017/1369 | On-mode power is product-information-sheet data of the energy-labelling framework, public where a delegated act applies; aligned with core oec:hasPowerConsumptionOn (Public). |
| `hasPowerConsumptionStandby` | Power Consumption Standby | **Public** |  | eli/reg/2017/1369 | Standby power is product-information-sheet data of the energy-labelling framework, public where a delegated act applies; aligned with core oec:hasPowerConsumptionStandby (Public). |
| `hasRecyclingFacility` | Recycling Facility | **AuthorizedOnly** |  | eli/dir/2012/19 | Which authorised operator treated one item is supply-chain detail for schemes and authorities; the facility's own master data is resolver-served under its GLN. |
| `hasRefreshRate` | Refresh Rate | **Public** |  | eli/reg_del/2019/2013 | Refresh rate is ordinary public spec-sheet information. |
| `hasRepairabilityClass` | Repairability Class | **Public** |  | eli/reg/2024/1781 | The A-E repairability class is the consumer-facing band of the repair assessment; aligned with core oec:repairabilityClass (Public). |
| `hasRepairabilityIndex` | Repairability Index | **Public** |  | eli/reg/2024/1781 | The repairability index is a consumer-facing point-of-sale label (French Indice de Reparabilite; ESPR Annex I repairability). |
| `hasRepairCost` | Repair Cost | **AuthorizedOnly** |  | eli/reg/2024/1781 | What one repair actually cost is transaction data; the publicly required figure is the spare-part price (euelec:hasSparePartPrice, Public). |
| `hasRepairCriteria` | Repair Criteria | **Public** |  | eli/reg/2024/1781 | Per-criterion scores are published alongside the repairability index so consumers can see how the score was reached. |
| `hasReplacedComponentPassport` | Replaced Component Passport | **AuthorizedOnly** |  | eli/reg/2024/1781 | Links into component passports expose the component supply chain, matching the tier of euelec:hasComponentPassport. |
| `hasReplacementDifficulty` | Replacement Difficulty | **Public** |  | eli/reg/2024/1781 | Replacement difficulty is consumer repair information that informs the repair-or-replace decision. |
| `hasRohsCompliance` | RoHS Compliance | **Public** |  | eli/dir/2011/65 | RoHS conformity information backs the CE marking, a public conformity claim (Dir. 2011/65/EU). |
| `hasScreenDiagonal` | Screen Diagonal | **Public** |  | eli/reg_del/2019/2013 | Screen diagonal appears on the public energy label for displays (Reg. (EU) 2019/2013). |
| `hasSecuritySupportYears` | Security Support Years | **Public** |  | eli/reg/2023/1670 | The guaranteed security-update period is a purchase-decision commitment (Reg. (EU) 2023/1670 requires 5 years of OS/security updates). |
| `hasSoftwareSupport` | Software Support | **Public** |  | eli/reg/2023/1670 | The software-support container carries update-horizon commitments that Reg. (EU) 2023/1670 makes consumer-facing. |
| `hasSoftwareUpdateEvent` | Software Update Event | **AuthorizedOnly** |  | eli/reg/2024/1781 | The raw per-device update event log is operational lifecycle data for service and surveillance actors; the public tier carries the aggregated support-status fields instead. |
| `hasSparePartAvailabilityYears` | Spare Part Availability Years | **Public** |  | eli/reg/2023/1670 | Spare-part availability periods are consumer information that Reg. (EU) 2023/1670 requires to be made publicly available for smartphones/tablets. |
| `hasSparePartPrice` | Spare Part Price | **Public** |  | eli/reg/2023/1670 | Spare-part pricing is consumer repair-decision information that Reg. (EU) 2023/1670 requires professional repairers and end-users to be able to see. |
| `hasTreatmentFacility` | Treatment Facility | **(inherited)** |  |  |  |
| `hasWeeeCompliance` | WEEE Compliance | **Public** |  | eli/dir/2012/19 | The WEEE-compliance container carries user-facing collection and recyclability information (Dir. 2012/19/EU Art. 14); producer-registration specifics inside it are tiered separately. |
| `hazardousWasteGenerated` | Hazardous Waste Generated | **AuthorizedOnly** |  | eli/dir/2008/98 | Whether hazardous waste arose is waste-classification data under Dir. 2008/98/EC, addressed to operators and authorities. |
| `iec62474DslVersion` | IEC 62474 DSL Version | **AuthorizedOnly** |  | eli/reg/2006/1907 | The declarable-substance-list version is methodology metadata of the professional material declaration. |
| `isReplaceable` | Is Replaceable | **Public** |  | eli/reg/2024/1781 | Component replaceability is consumer repair information (ESPR Annex I; smartphone/tablet ecodesign requires replaceable parts). |
| `latestUpdateDate` | Latest Update Date | **Public** |  | eli/reg/2023/1670 | The date of the latest update shows whether the public support commitment is being honoured. |
| `materialDeclarationDate` | Material Declaration Date | **AuthorizedOnly** |  | eli/reg/2006/1907 | The declaration date is administrative detail of the professional material declaration. |
| `materialMassGrams` | Material Mass (grams) | **(inherited)** |  |  |  |
| `modelIdentifier` | Model Identifier | **Public** |  | eli/reg/2017/1369 | The model identifier is inherently public product identity and, for energy-labelled products, part of the public EPREL entry (Reg. (EU) 2017/1369 Art. 12(3)). |
| `newVersion` | New Version | **(inherited)** |  |  |  |
| `nextDisposition` | Next Disposition | **AuthorizedOnly** |  | eli/dir/2012/19 | The intended onward route of a removed part is treatment-chain planning data (Dir. 2012/19/EU Art. 8). |
| `osVersion` | OS Version | **Public** |  | eli/reg/2023/1670 | The current OS version is device-state transparency a user can read from the device itself. |
| `previousVersion` | Previous Version | **(inherited)** |  |  |  |
| `recoverabilityRate` | Recoverability Rate | **Public** |  | eli/dir/2012/19 | The recoverable fraction is a consumer-facing circularity claim tied to the WEEE recovery targets (Dir. 2012/19/EU Annex V). |
| `recoveryRate` | Recovery Rate | **(inherited)** |  |  |  |
| `recyclabilityRate` | Recyclability Rate | **Public** |  | eli/dir/2012/19 | The recyclable fraction is a consumer-facing circularity claim tied to the WEEE recovery targets (Dir. 2012/19/EU Annex V); aligned with core oec:recyclabilityRate (Public). |
| `recyclingProcess` | Recycling Process | **AuthorizedOnly** |  | eli/dir/2012/19 | The applied treatment process is operator process data (Dir. 2012/19/EU Art. 8 and Annex VIII). |
| `recyclingRate` | Recycling Rate | **(inherited)** |  |  |  |
| `removalReason` | Removal Reason | **AuthorizedOnly** |  | eli/reg/2024/1781 | Why a part failed on one device is service-history and failure-analysis data; the public tier carries the aggregate durability and repairability figures. |
| `repairabilityLabelUrl` | Repairability Label URL | **Public** |  | eli/reg/2024/1781 | The repairability label image is a public consumer label. |
| `repairDescription` | Repair Description | **AuthorizedOnly** |  | eli/reg/2024/1781 | The repair narrative is service-history detail of one device. |
| `repairTechnician` | Repair Technician | **AuthorizedOnly** |  | eli/reg/2024/1781 | Naming who performed a repair identifies a service party in a specific transaction; the public tier carries the published repair network (oec:RepairProvider). |
| `repairType` | Repair Type | **AuthorizedOnly** |  | eli/reg/2024/1781 | What was repaired on one device is service-history data for repairers, owners and surveillance actors, not a public product attribute. |
| `rohsCompliant` | RoHS Compliant | **Public** |  | eli/dir/2011/65 | The RoHS pass/fail status is a public conformity claim expressed by the CE marking (Dir. 2011/65/EU). |
| `rohsDeclarationUrl` | RoHS Declaration URL | **Public** |  | eli/dir/2011/65 | The RoHS declaration document is the published substantiation of the public conformity claim. |
| `rohsExemptions` | RoHS Exemptions | **Public** |  | eli/dir/2011/65 | Claimed RoHS exemptions (Annex III/IV codes) qualify the public conformity claim and are themselves published lists. |
| `screenResolutionHeight` | Screen Resolution Height | **Public** |  | eli/reg_del/2019/2013 | Screen resolution appears on the public energy label and fiche for displays (Reg. (EU) 2019/2013). |
| `screenResolutionWidth` | Screen Resolution Width | **Public** |  | eli/reg_del/2019/2013 | Screen resolution appears on the public energy label and fiche for displays (Reg. (EU) 2019/2013). |
| `securityUpdateEndDate` | Security Update End Date | **Public** |  | eli/reg/2023/1670 | The security-update end date is the concrete form of the public update-support commitment. |
| `separatelyTreated` | Separately Treated | **(inherited)** |  |  |  |
| `sortingDecision` | Sorting Decision | **AuthorizedOnly** |  | eli/dir/2012/19 | The routing decision taken at a sorting facility is operational treatment data (Dir. 2012/19/EU Art. 8). |
| `totalInputMassGrams` | Total Input Mass (grams) | **(inherited)** |  |  |  |
| `totalRecoveredMassGrams` | Total Recovered Mass (grams) | **(inherited)** |  |  |  |
| `totalScore` | Total Score | **Public** |  | eli/reg/2024/1781 | The 0-100 total score is the published aggregate behind the consumer-facing repairability label. |
| `treatmentCertificate` | Treatment Certificate | **(inherited)** |  |  |  |
| `treatmentMethod` | Treatment Method | **(inherited)** |  |  |  |
| `updateChannel` | Update Channel | **Public** |  | eli/reg/2023/1670 | How to obtain updates is consumer use information required for the update commitment to be actionable. |
| `updateSource` | Update Source | **(inherited)** |  |  |  |
| `updateType` | Update Type | **(inherited)** |  |  |  |
| `warrantyStatus` | Warranty Status | **AuthorizedOnly** |  | eli/reg/2024/1781 | Whether one item was in warranty at the time of a repair is a commercial fact between owner, seller and repairer; the warranty terms themselves are model master data. |
| `wasteDescription` | Waste Description | **(inherited)** |  |  |  |
| `weeeRegistrationCountry` | WEEE Registration Country | **AuthorizedOnly** |  | eli/dir/2012/19 | The registration country is EPR administration detail accompanying the producer registration number. |
| `weeeRegistrationNumber` | WEEE Registration Number | **AuthorizedOnly** |  | eli/dir/2012/19 | The producer registration number (Dir. 2012/19/EU Art. 16) is EPR administration data for registers and authorities, not consumer information. |
