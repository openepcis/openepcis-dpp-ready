# Proposed code-list individuals — eudpp reverse coverage 2026-10-30

92 values drafted deterministically from the EUDPP mirror; 5 class stubs to check (oec:SoCCriterion, oec:AreaOfProtection, oec:ImpactCategory, oec:LcaComplianceStatus, oec:EN15804IndicatorGroup).

| Our individual | Of class | Label | Notation | Unit | Upstream |
|---|---|---|---|---|---|
| `oec:SoCCriterionA` | oec:SoCCriterion | CriterionA |  |  | `eudpp:CriterionA` |
| `oec:SoCCriterionB` | oec:SoCCriterion | CriterionB |  |  | `eudpp:CriterionB` |
| `oec:SoCCriterionC` | oec:SoCCriterion | CriterionC |  |  | `eudpp:CriterionC` |
| `oec:SoCCriterionD` | oec:SoCCriterion | CriterionD |  |  | `eudpp:CriterionD` |
| `oec:AccreditedThirdPartyReview` | oec:TypeOfReview | Accredited third party review |  |  | `eudpp:accreditedThirdPartyReview` |
| `oec:AopHumanHealth` | oec:AreaOfProtection | Human health |  |  | `eudpp:aopHumanHealth` |
| `oec:AopManMadeEnvironment` | oec:AreaOfProtection | Man-made environment |  |  | `eudpp:aopManMadeEnvironment` |
| `oec:AopNaturalEnvironment` | oec:AreaOfProtection | Natural environment |  |  | `eudpp:aopNaturalEnvironment` |
| `oec:AopNaturalResources` | oec:AreaOfProtection | Natural resources |  |  | `eudpp:aopNaturalResources` |
| `oec:AopOther` | oec:AreaOfProtection | Other AoP |  |  | `eudpp:aopOther` |
| `oec:ClimateChange` | oec:ImpactCategory | Climate change |  |  | `eudpp:climateChange` |
| `oec:DependentInternalReview` | oec:TypeOfReview | Dependent internal review |  |  | `eudpp:dependentInternalReview` |
| `oec:StageA1A3` | oec:LifecycleStage | Product stage (aggregated) | A1-A3 |  | `eudpp:en15804moduleA1A3` |
| `oec:Eutrophication` | oec:ImpactCategory | Eutrophication |  |  | `eudpp:eutrophication` |
| `oec:FreeOfChargeAll` | oec:LicenseType | Free of charge for all users and uses |  |  | `eudpp:freeOfChargeAll` |
| `oec:FreeOfChargeMembers` | oec:LicenseType | Free of charge for members only |  |  | `eudpp:freeOfChargeMembers` |
| `oec:FreeOfChargeSome` | oec:LicenseType | Free of charge for some user types or use types |  |  | `eudpp:freeOfChargeSome` |
| `oec:FreshwaterEcotoxicity` | oec:ImpactCategory | Freshwater ecotoxicity |  |  | `eudpp:freshwaterEcotoxicity` |
| `oec:FullyCompliant` | oec:LcaComplianceStatus | Fully compliant |  |  | `eudpp:fullyCompliant` |
| `oec:GroupCoreImpact` | oec:EN15804IndicatorGroup | core impact |  |  | `eudpp:group_coreImpact` |
| `oec:GroupExportedEnergy` | oec:EN15804IndicatorGroup | exported energy |  |  | `eudpp:group_exportedEnergy` |
| `oec:GroupResourceUse` | oec:EN15804IndicatorGroup | resource use |  |  | `eudpp:group_resourceUse` |
| `oec:GroupValorisation` | oec:EN15804IndicatorGroup | valorisation |  |  | `eudpp:group_valorisation` |
| `oec:GroupWaste` | oec:EN15804IndicatorGroup | waste |  |  | `eudpp:group_waste` |
| `oec:GroupWithCaveats` | oec:EN15804IndicatorGroup | impact with caveats |  |  | `eudpp:group_withCaveats` |
| `oec:HumanToxicity` | oec:ImpactCategory | Human toxicity |  |  | `eudpp:humanToxicity` |
| `oec:CRU` | oec:EN15804InventoryIndicator | Components for re-use | CRU | kg | `eudpp:ind_CRU` |
| `oec:EEE` | oec:EN15804InventoryIndicator | Exported electrical energy | EEE | MJ per energy carrier | `eudpp:ind_EEE` |
| `oec:EET` | oec:EN15804InventoryIndicator | Exported thermal energy | EET | MJ per energy carrier | `eudpp:ind_EET` |
| `oec:EFAcidification` | oec:ImpactIndicatorType | Acidification EF | Acidification | mol H+-eq | `eudpp:ind_EF_acidification` |
| `oec:EFClimateChange` | oec:ImpactIndicatorType | Climate change EF | Climate change | kg CO2-eq | `eudpp:ind_EF_climateChange` |
| `oec:EFEcotoxicityFreshwater` | oec:ImpactIndicatorType | Ecotoxicity, freshwater | Ecotoxicity, freshwater | CTUe | `eudpp:ind_EF_ecotoxicityFreshwater` |
| `oec:EFEutrophicationFreshwater` | oec:ImpactIndicatorType | Eutrophication, freshwater | Eutrophication, freshwater | kg P-eq | `eudpp:ind_EF_eutrophicationFreshwater` |
| `oec:EFEutrophicationMarine` | oec:ImpactIndicatorType | Eutrophication, marine | Eutrophication, marine | kg N-eq | `eudpp:ind_EF_eutrophicationMarine` |
| `oec:EFEutrophicationTerrestrial` | oec:ImpactIndicatorType | Eutrophication, terrestrial | Eutrophication, terrestrial | mol N-eq | `eudpp:ind_EF_eutrophicationTerrestrial` |
| `oec:EFHumanToxicityCancer` | oec:ImpactIndicatorType | Human toxicity, cancer | Human toxicity, cancer | CTUh | `eudpp:ind_EF_humanToxicityCancer` |
| `oec:EFHumanToxicityNonCancer` | oec:ImpactIndicatorType | Human toxicity, non-cancer | Human toxicity, non-cancer | CTUh | `eudpp:ind_EF_humanToxicityNonCancer` |
| `oec:EFIonisingRadiationHumanHealth` | oec:ImpactIndicatorType | Ionising radiation, human health EF | Ionising radiation, human health | kBq U235-eq | `eudpp:ind_EF_ionisingRadiationHumanHealth` |
| `oec:EFLandUse` | oec:ImpactIndicatorType | Land use | Land use | dimensionless (Pt) | `eudpp:ind_EF_landUse` |
| `oec:EFOzoneDepletion` | oec:ImpactIndicatorType | Ozone depletion EF | Ozone depletion | kg CFC-11-eq | `eudpp:ind_EF_ozoneDepletion` |
| `oec:EFParticulateMatter` | oec:ImpactIndicatorType | Particulate matter | Particulate matter | disease incidence | `eudpp:ind_EF_particulateMatter` |
| `oec:EFPhotochemicalOzoneFormation` | oec:ImpactIndicatorType | Photochemical ozone formation, human health | Photochemical ozone formation, human health | kg NMVOC-eq | `eudpp:ind_EF_photochemicalOzoneFormation` |
| `oec:EFResourceUseFossils` | oec:ImpactIndicatorType | Resource use, fossils | Resource use, fossils | MJ | `eudpp:ind_EF_resourceUseFossils` |
| `oec:EFResourceUseMineralsMetals` | oec:ImpactIndicatorType | Resource use, minerals and metals EF | Resource use, minerals and metals | kg Sb-eq | `eudpp:ind_EF_resourceUseMineralsMetals` |
| `oec:EFSingleScore` | oec:ImpactIndicatorType | Environmental Footprint single score | EF single score | dimensionless (Pt) | `eudpp:ind_EF_singleScore` |
| `oec:EFWaterUse` | oec:ImpactIndicatorType | Water use | Water use | m3 world-eq | `eudpp:ind_EF_waterUse` |
| `oec:ETPFw` | oec:ImpactIndicatorType | Potential comparative Toxic Unit for ecosystems (freshwater) | ETP-fw | CTUe | `eudpp:ind_ETPfw` |
| `oec:FW` | oec:EN15804InventoryIndicator | Net use of fresh water | FW | m3 | `eudpp:ind_FW` |
| `oec:HTPC` | oec:ImpactIndicatorType | Potential comparative Toxic Unit for humans (cancer) | HTP-c | CTUh | `eudpp:ind_HTPc` |
| `oec:HTPNc` | oec:ImpactIndicatorType | Potential comparative Toxic Unit for humans (non-cancer) | HTP-nc | CTUh | `eudpp:ind_HTPnc` |
| `oec:HWD` | oec:EN15804InventoryIndicator | Hazardous waste disposed | HWD | kg | `eudpp:ind_HWD` |
| `oec:IRP` | oec:ImpactIndicatorType | Potential Human exposure efficiency relative to U235 | IRP | kBq U235-eq | `eudpp:ind_IRP` |
| `oec:MER` | oec:EN15804InventoryIndicator | Materials for energy recovery | MER | kg | `eudpp:ind_MER` |
| `oec:MFR` | oec:EN15804InventoryIndicator | Materials for recycling | MFR | kg | `eudpp:ind_MFR` |
| `oec:NHWD` | oec:EN15804InventoryIndicator | Non-hazardous waste disposed | NHWD | kg | `eudpp:ind_NHWD` |
| `oec:NRSF` | oec:EN15804InventoryIndicator | Use of non-renewable secondary fuels | NRSF | MJ, net calorific value | `eudpp:ind_NRSF` |
| `oec:PENRE` | oec:EN15804InventoryIndicator | Use of non-renewable primary energy (excl. raw material) | PENRE | MJ, net calorific value | `eudpp:ind_PENRE` |
| `oec:PENRM` | oec:EN15804InventoryIndicator | Use of non-renewable primary energy resources used as raw materials | PENRM | MJ, net calorific value | `eudpp:ind_PENRM` |
| `oec:PENRT` | oec:EN15804InventoryIndicator | Total use of non-renewable primary energy resources | PENRT | MJ, net calorific value | `eudpp:ind_PENRT` |
| `oec:PERE` | oec:EN15804InventoryIndicator | Use of renewable primary energy (excl. raw material) | PERE | MJ, net calorific value | `eudpp:ind_PERE` |
| `oec:PERM` | oec:EN15804InventoryIndicator | Use of renewable primary energy resources used as raw materials | PERM | MJ, net calorific value | `eudpp:ind_PERM` |
| `oec:PERT` | oec:EN15804InventoryIndicator | Total use of renewable primary energy resources | PERT | MJ, net calorific value | `eudpp:ind_PERT` |
| `oec:PM` | oec:ImpactIndicatorType | Potential incidence of disease due to PM emissions | PM | disease incidence | `eudpp:ind_PM` |
| `oec:RSF` | oec:EN15804InventoryIndicator | Use of renewable secondary fuels | RSF | MJ, net calorific value | `eudpp:ind_RSF` |
| `oec:RWD` | oec:EN15804InventoryIndicator | Radioactive waste disposed | RWD | kg | `eudpp:ind_RWD` |
| `oec:SM` | oec:EN15804InventoryIndicator | Use of secondary material | SM | kg | `eudpp:ind_SM` |
| `oec:SQP` | oec:ImpactIndicatorType | Potential Soil Quality Index | SQP | dimensionless (Pt) | `eudpp:ind_SQP` |
| `oec:WDP` | oec:ImpactIndicatorType | Water (user) deprivation potential | WDP | m3 world-eq deprived | `eudpp:ind_WDP` |
| `oec:IndependentExternalReview` | oec:TypeOfReview | Independent external review |  |  | `eudpp:independentExternalReview` |
| `oec:IndependentInternalReview` | oec:TypeOfReview | Independent internal review |  |  | `eudpp:independentInternalReview` |
| `oec:IndependentReviewPanel` | oec:TypeOfReview | Independent review panel |  |  | `eudpp:independentReviewPanel` |
| `oec:IonisingRadiationEcosystems` | oec:ImpactCategory | Ionising radiation, ecosystems |  |  | `eudpp:ionisingRadiationEcosystems` |
| `oec:LandUseSoilQuality` | oec:ImpactCategory | Land use / soil quality |  |  | `eudpp:landUseSoilQuality` |
| `oec:LcaVerifier` | oec:ActorRole | LCA or EPD verifier |  |  | `eudpp:lcaVerifier` |
| `oec:LicenseFee` | oec:LicenseType | License fee |  |  | `eudpp:licenseFee` |
| `oec:LicenseOther` | oec:LicenseType | Other license |  |  | `eudpp:licenseOther` |
| `oec:MarineEcotoxicity` | oec:ImpactCategory | Marine ecotoxicity |  |  | `eudpp:marineEcotoxicity` |
| `oec:MethodologyCML2002` | oec:LCAMethodology | CML 2002 | CML 2002 |  | `eudpp:methodology_CML2002` |
| `oec:MethodologyEF30` | oec:LCAMethodology | Environmental Footprint 3.0 | EF 3.0 |  | `eudpp:methodology_EF3_0` |
| `oec:MethodologyEF31` | oec:LCAMethodology | Environmental Footprint 3.1 | EF 3.1 |  | `eudpp:methodology_EF3_1` |
| `oec:MethodologyEN15804InventoryRules` | oec:LCAMethodology | EN 15804+A2 inventory calculation rules | EN 15804+A2 inventory |  | `eudpp:methodology_EN15804InventoryRules` |
| `oec:MethodologyIPCCAR6` | oec:LCAMethodology | IPCC AR6 (GWP) | IPCC AR6 |  | `eudpp:methodology_IPCC_AR6` |
| `oec:MethodologyReCiPe2016` | oec:LCAMethodology | ReCiPe 2016 | ReCiPe 2016 |  | `eudpp:methodology_ReCiPe2016` |
| `oec:NotCompliant` | oec:LcaComplianceStatus | Not compliant |  |  | `eudpp:notCompliant` |
| `oec:NotReviewed` | oec:TypeOfReview | Not reviewed |  |  | `eudpp:notReviewed` |
| `oec:PartiallyCompliant` | oec:LcaComplianceStatus | Partially compliant |  |  | `eudpp:partiallyCompliant` |
| `oec:PhotochemicalOzoneFormation` | oec:ImpactCategory | Photochemical ozone formation |  |  | `eudpp:photochemicalOzoneFormation` |
| `oec:ResourceUseFossil` | oec:ImpactCategory | Resource use, fossil |  |  | `eudpp:resourceUseFossil` |
| `oec:ResourceUseMineralsMetals` | oec:ImpactCategory | Resource use, minerals and metals |  |  | `eudpp:resourceUseMineralsMetals` |
| `oec:RespiratoryInorganics` | oec:ImpactCategory | Respiratory inorganics / particulate matter |  |  | `eudpp:respiratoryInorganics` |
| `oec:TerrestrialEcotoxicity` | oec:ImpactCategory | Terrestrial ecotoxicity |  |  | `eudpp:terrestrialEcotoxicity` |
| `oec:WaterUseDeprivation` | oec:ImpactCategory | Water use / water deprivation |  |  | `eudpp:waterUseDeprivation` |
