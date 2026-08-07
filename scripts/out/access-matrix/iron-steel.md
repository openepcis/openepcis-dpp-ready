# Access-tier review matrix — iron-steel

Regulatory frame: CBAM (EU) 2023/956

Coverage: 28 properties — 5 Public / 22 AuthorizedOnly / 1 Restricted / 0 inherited / 0 UNCLASSIFIED; 0 legally locked.

| Term | Label | Tier | Mandated (locked) | Source | Rationale |
|---|---|---|---|---|---|
| `castNumber` | Cast Number | **AuthorizedOnly** |  | eli/reg/2024/1781 | Cast numbers are EN 10168 batch-traceability identifiers of the professional delivery record. |
| `cbamReportId` | CBAM Report ID | **Restricted** |  | eli/reg/2023/956 | The CBAM report identifier keys into embedded-emissions filings that Reg. (EU) 2023/956 (Arts. 6, 35) exchanges only between operators, authorised declarants and authorities, so it stays with the authority/declarant tier. |
| `hasMtc` | Material Test Certificate | **AuthorizedOnly** |  | eli/reg/2024/1781 | The EN 10204 certificate is a B2B inspection document issued to the purchaser, professional detail rather than consumer information. |
| `hasTechnologyRoute` | Technology Route | **Public** |  | eli/reg/2024/1781 | The steelmaking route (e.g. BF-BOF vs EAF) is the headline green-steel differentiator buyers and consumers rely on, without exposing installation-level emissions data. |
| `heatNumber` | Heat Number | **AuthorizedOnly** |  | eli/reg/2024/1781 | Heat numbers are EN 10168 batch-traceability identifiers linking deliveries to production runs, supply-chain data for professional actors. |
| `lotNumber` | Lot Number | **AuthorizedOnly** |  | eli/reg/2024/1781 | Delivery lot numbers tie the product to specific commercial shipments, supply-chain data for professional actors. |
| `meltAndPourCountry` | Melt and Pour Country | **Public** |  | eli/reg/2024/1781 | Country of melt and pour is an origin-transparency claim at country granularity, exposing no facility or supplier detail. |
| `mtcCarbonContent` | MTC Carbon Content | **AuthorizedOnly** |  | eli/reg/2024/1781 | Cast/ladle chemistry is professional certificate data used by fabricators and inspectors, not consumer information. |
| `mtcCarbonEquivalent` | MTC Carbon Equivalent | **AuthorizedOnly** |  | eli/reg/2024/1781 | The weldability indicator (CEV/CET) is professional certificate data derived from the cast analysis. |
| `mtcCopperContent` | MTC Copper Content | **AuthorizedOnly** |  | eli/reg/2024/1781 | Cast/ladle chemistry is professional certificate data used by fabricators and inspectors, not consumer information. |
| `mtcElongation` | MTC Elongation | **AuthorizedOnly** |  | eli/reg/2024/1781 | Measured elongation is mechanical certificate data of the professional MTC record. |
| `mtcFinishing` | MTC Finishing | **AuthorizedOnly** |  | eli/reg/2024/1781 | The delivery/finishing condition is certificate content agreed between producer and purchaser. |
| `mtcInspectionType` | MTC Inspection Document Type | **AuthorizedOnly** |  | eli/reg/2024/1781 | The EN 10204 document type (2.1-3.2) is certificate metadata belonging to the professional MTC record. |
| `mtcNitrogenContent` | MTC Nitrogen Content | **AuthorizedOnly** |  | eli/reg/2024/1781 | Cast/ladle chemistry is professional certificate data used by fabricators and inspectors, not consumer information. |
| `mtcNominalSize` | MTC Nominal Size | **AuthorizedOnly** |  | eli/reg/2024/1781 | The tested nominal dimension is certificate content of the B2B inspection document. |
| `mtcPhosphorusContent` | MTC Phosphorus Content | **AuthorizedOnly** |  | eli/reg/2024/1781 | Cast/ladle chemistry is professional certificate data used by fabricators and inspectors, not consumer information. |
| `mtcRadiometricControl` | MTC Radiometric Control | **AuthorizedOnly** |  | eli/reg/2024/1781 | The radiometric control result is inspection evidence of the professional MTC record. |
| `mtcRelativeRibArea` | MTC Relative Rib Area | **AuthorizedOnly** |  | eli/reg/2024/1781 | The rib-area bond parameter for reinforcing steel is certificate data for structural professionals. |
| `mtcSteelProcess` | MTC Steel Process | **AuthorizedOnly** |  | eli/reg/2024/1781 | The free-text process entry on the certificate is production detail for the purchaser; the public claim is the controlled technologyRoute. |
| `mtcSulfurContent` | MTC Sulfur Content | **AuthorizedOnly** |  | eli/reg/2024/1781 | Cast/ladle chemistry is professional certificate data used by fabricators and inspectors, not consumer information. |
| `mtcTensileStrength` | MTC Tensile Strength | **AuthorizedOnly** |  | eli/reg/2024/1781 | Measured mechanical test values are certificate data for the purchaser and inspectors; declared performance for construction use surfaces publicly via the CPR DoP instead. |
| `mtcWeightTolerance` | MTC Weight Tolerance | **AuthorizedOnly** |  | eli/reg/2024/1781 | The permitted weight tolerance is contractual certificate content between producer and purchaser. |
| `mtcYieldStrength` | MTC Yield Strength | **AuthorizedOnly** |  | eli/reg/2024/1781 | Measured mechanical test values are certificate data for the purchaser and inspectors; declared performance for construction use surfaces publicly via the CPR DoP instead. |
| `mtcYieldStrengthRatio` | MTC Yield Strength Ratio | **AuthorizedOnly** |  | eli/reg/2024/1781 | The Re/Rm ratio is derived mechanical certificate data of the professional MTC record. |
| `productNumber` | Product Number | **Public** |  | eli/reg/2024/1781 | The manufacturer article number is ordinary public product identity, stamped or tagged on the product. |
| `purchaserOrder` | Purchaser Order | **AuthorizedOnly** |  | eli/reg/2024/1781 | The purchaser order reference exposes a specific commercial relationship and belongs to the B2B delivery record. |
| `steelDesignation` | Steel Designation | **Public** |  | eli/reg/2024/1781 | The EN 10027 steel designation is standardised public product identity every buyer specifies against. |
| `steelGradeClassification` | Steel Grade Classification | **Public** |  | eli/reg/2024/1781 | The EN 10020 grade classification is a coarse public typing of the material with no commercial sensitivity. |
