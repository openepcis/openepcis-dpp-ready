# Access-tier review matrix — eudr

Regulatory frame: EUDR (EU) 2023/1115, Art. 9–12 (DDS)

Coverage: 37 properties — 8 Public / 23 AuthorizedOnly / 6 Restricted / 0 inherited / 0 UNCLASSIFIED; 6 legally locked.

| Term | Label | Tier | Mandated (locked) | Source | Rationale |
|---|---|---|---|---|---|
| `areaHectares` | Area Hectares | **AuthorizedOnly** |  | eli/reg/2023/1115 | Plot area without coordinates supports plausibility checks of the due diligence but is not needed by the public; the coordinates themselves are Restricted. |
| `areaSize` | Area Size | **AuthorizedOnly** |  | eli/reg/2023/1115 | Quantitative plot-area values mirror areaHectares and stay at the same due-diligence detail tier. |
| `commodityType` | Commodity Type | **Public** |  | eli/reg/2023/1115 | The EUDR commodity category (Annex I scope) states only what kind of product this is, which is apparent from the product itself. |
| `countryList` | Country List | **Public** |  | eli/reg/2023/1115 | Country-of-production at country granularity is a consumer-relevant origin claim that exposes no plot or producer detail. |
| `countryRiskCategory` | Country Risk Category | **Public** |  | eli/reg/2023/1115 | The country risk classification restates the Commission's published Art. 29 country benchmarking, which is itself public. |
| `deforestationFreeDate` | Deforestation Free Date | **Public** |  | eli/reg/2023/1115 | The deforestation-free cutoff confirmation is the headline Art. 3 compliance claim the product is marketed under. |
| `derivedFrom` | Derived From | **AuthorizedOnly** |  | eli/reg/2023/1115 | Product-to-source-product links expose the upstream supply chain, a legitimate-interest traceability view for authorities and supply-chain partners. |
| `dueDiligenceStatement` | Due Diligence Statement | **AuthorizedOnly** |  | eli/reg/2023/1115 | The DDS reference is communicated down the supply chain to operators and traders (Art. 12(3) reference-number handling), an economic-operator audience rather than the public. |
| `exemptionAuthority` | Exemption Authority | **AuthorizedOnly** |  | eli/reg/2023/1115 | The party asserting the exemption is identified by GLN, party-level data for authorities and supply-chain partners. |
| `exemptionDeclaration` | Exemption Declaration | **AuthorizedOnly** |  | eli/reg/2023/1115 | An asserted out-of-scope/exemption declaration is a compliance position statement for authorities and trading partners to review. |
| `exemptionEffectiveFrom` | Exemption Effective From | **AuthorizedOnly** |  | eli/reg/2023/1115 | Exemption validity dates are detail of the exemption record at the professional tier. |
| `exemptionEffectiveUntil` | Exemption Effective Until | **AuthorizedOnly** |  | eli/reg/2023/1115 | Exemption validity dates are detail of the exemption record at the professional tier. |
| `exemptionReasonCode` | Exemption Reason Code | **AuthorizedOnly** |  | eli/reg/2023/1115 | The coded exemption reason is compliance-position detail for authorities and trading partners. |
| `exemptionScope` | Exemption Scope | **AuthorizedOnly** |  | eli/reg/2023/1115 | The GTIN/batch/serial scope statement is detail of the exemption record for compliance reviewers. |
| `exemptionScopeReference` | Exemption Scope Reference | **AuthorizedOnly** |  | eli/reg/2023/1115 | Concrete batch/serial identifiers in exemption scope are traceability identifiers exposed only to compliance reviewers. |
| `exemptionType` | Exemption Type | **AuthorizedOnly** |  | eli/reg/2023/1115 | The permanent/temporary classification is detail of the exemption record, which as a whole sits at the professional tier. |
| `forestManagementUnit` | Forest Management Unit | **Restricted** | 🔒 eli/reg/2023/1115 | eli/reg/2023/1115 | A forest-management-unit or concession identifier localises the producing land as effectively as coordinates and stays with the authority-only origin data. |
| `fscCertification` | FSC Certification | **AuthorizedOnly** |  | eli/reg/2023/1115 | The FSC certificate reference is verification evidence used in Art. 10 risk assessment; certificate scope data can reveal supplier relationships. |
| `geofence` | Geofence | **Restricted** | 🔒 eli/reg/2023/1115 | eli/reg/2023/1115 | Plot polygons (plots above 4 ha, Art. 9(1)(d)) are the same authority-channelled geolocation data as point coordinates. |
| `geolocation` | Geolocation | **Restricted** | 🔒 eli/reg/2023/1115 | eli/reg/2023/1115 | Plot coordinates are DDS content (Art. 9(1)(d)) accessible via the EUDR Information System to competent authorities and customs (Arts. 33, 11-12), and pinpoint individual producers' land. |
| `landUseHistory` | Land Use History | **AuthorizedOnly** |  | eli/reg/2023/1115 | Land-use history narratives substantiate the deforestation-free claim at plot level and can indirectly localise plots, so they stay with the professional tier. |
| `legallyHarvested` | Legally Harvested | **Public** |  | eli/reg/2023/1115 | Legal-harvest confirmation is the second headline Art. 3 compliance claim; the substantiating detail stays in the higher tiers. |
| `mitigationMeasures` | Mitigation Measures | **AuthorizedOnly** |  | eli/reg/2023/1115 | Art. 10(2)/11 mitigation measures describe the operator's internal risk procedures, reviewable by authorities rather than consumers. |
| `originDetails` | Origin Details | **Restricted** | 🔒 eli/reg/2023/1115 | eli/reg/2023/1115 | The origin-details container aggregates plot geolocation and producer identity, so the container carries the tier of its most sensitive content. |
| `originList` | Origin List | **Restricted** | 🔒 eli/reg/2023/1115 | eli/reg/2023/1115 | The origin list is the set-valued form of originDetails and carries the same locked tier. |
| `producerIdentification` | Producer Identification | **Restricted** | 🔒 eli/reg/2023/1115 | eli/reg/2023/1115 | Producer identity linked to plots is personal and commercially sensitive DDS content the regulation routes to authorities, not the public. |
| `riskAssessment` | Risk Assessment | **AuthorizedOnly** |  | eli/reg/2023/1115 | The Art. 10 risk assessment is internal due-diligence substantiation reviewed by competent authorities and downstream operators, not consumer information. |
| `riskAssessmentDate` | Risk Assessment Date | **AuthorizedOnly** |  | eli/reg/2023/1115 | The risk-assessment date is administrative detail of the Art. 10 assessment record. |
| `riskLevel` | Risk Level | **AuthorizedOnly** |  | eli/reg/2023/1115 | The operator-assigned product risk level is a due-diligence judgement for authorities and buyers; the public sees the published country-level category instead. |
| `speciesCommonName` | Species Common Name | **Public** |  | eli/reg/2023/1115 | The species common name is product-level information consumers use to assess wood products; species is DDS content (Art. 9(1)(c)) but not confidential at product level. |
| `speciesScientificName` | Species Scientific Name | **Public** |  | eli/reg/2023/1115 | The scientific species name (required in the DDS per Art. 9(1)(c)) identifies the species, not the producer or plot, and mirrors long-standing public timber labelling practice. |
| `statementDate` | Statement Date | **AuthorizedOnly** |  | eli/reg/2023/1115 | The DDS submission date is administrative detail of the due-diligence filing shared with supply-chain actors and authorities. |
| `timberProductType` | Timber Product Type | **Public** |  | eli/reg/2023/1115 | The timber product type is a scope classification with no supply-chain sensitivity. |
| `transformationDate` | Transformation Date | **AuthorizedOnly** |  | eli/reg/2023/1115 | Processing dates are supply-chain traceability detail supporting due diligence, not consumer information. |
| `transformationLocation` | Transformation Location | **AuthorizedOnly** |  | eli/reg/2023/1115 | Processing locations expose commercially sensitive supplier facilities and belong to the legitimate-interest traceability view. |
| `verificationMethod` | Verification Method | **AuthorizedOnly** |  | eli/reg/2023/1115 | How claims were verified (audits, satellite monitoring) is due-diligence methodology for authorities and legitimate-interest verifiers. |
| `volumeCubicMeters` | Volume Cubic Meters | **AuthorizedOnly** |  | eli/reg/2023/1115 | Consignment volumes are quantity data (Art. 9(1)(b)) that reveal trade flows between specific parties. |
