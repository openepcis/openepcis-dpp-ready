# Access-tier review matrix — iron-steel

Regulatory frame: CBAM (EU) 2023/956

Coverage: 16 properties — 5 Public / 10 AuthorizedOnly / 1 Restricted / 0 inherited / 0 UNCLASSIFIED; 0 legally locked.

| Term | Label | Tier | Mandated (locked) | Source | Rationale |
|---|---|---|---|---|---|
| `castNumber` | Cast Number | **AuthorizedOnly** |  | eli/reg/2024/1781 | Cast numbers are EN 10168 batch-traceability identifiers of the professional delivery record. |
| `cbamReportId` | CBAM Report ID | **Restricted** |  | eli/reg/2023/956 | The CBAM report identifier keys into embedded-emissions filings that Reg. (EU) 2023/956 (Arts. 6, 35) exchanges only between operators, authorised declarants and authorities, so it stays with the authority/declarant tier. |
| `hasMtc` | Material Test Certificate | **AuthorizedOnly** |  | eli/reg/2024/1781 | The EN 10204 certificate is a B2B inspection document issued to the purchaser, professional detail rather than consumer information. |
| `hasTechnologyRoute` | Technology Route | **Public** |  | eli/reg/2024/1781 | The steelmaking route (e.g. BF-BOF vs EAF) is the headline green-steel differentiator buyers and consumers rely on, without exposing installation-level emissions data. |
| `heatNumber` | Heat Number | **AuthorizedOnly** |  | eli/reg/2024/1781 | Heat numbers are EN 10168 batch-traceability identifiers linking deliveries to production runs, supply-chain data for professional actors. |
| `lotNumber` | Lot Number | **AuthorizedOnly** |  | eli/reg/2024/1781 | Delivery lot numbers tie the product to specific commercial shipments, supply-chain data for professional actors. |
| `meltAndPourCountry` | Melt and Pour Country | **Public** |  | eli/reg/2024/1781 | Country of melt and pour is an origin-transparency claim at country granularity, exposing no facility or supplier detail. |
| `mtcFinishing` | MTC Finishing | **AuthorizedOnly** |  | eli/reg/2024/1781 | The delivery/finishing condition is certificate content agreed between producer and purchaser. |
| `mtcInspectionType` | MTC Inspection Document Type | **AuthorizedOnly** |  | eli/reg/2024/1781 | The EN 10204 document type (2.1-3.2) is certificate metadata belonging to the professional MTC record. |
| `mtcNominalSize` | MTC Nominal Size | **AuthorizedOnly** |  | eli/reg/2024/1781 | The tested nominal dimension is certificate content of the B2B inspection document. |
| `mtcSteelProcess` | MTC Steel Process | **AuthorizedOnly** |  | eli/reg/2024/1781 | The free-text process entry on the certificate is production detail for the purchaser; the public claim is the controlled technologyRoute. |
| `mtcWeightTolerance` | MTC Weight Tolerance | **AuthorizedOnly** |  | eli/reg/2024/1781 | The permitted weight tolerance is contractual certificate content between producer and purchaser. |
| `productNumber` | Product Number | **Public** |  | eli/reg/2024/1781 | The manufacturer article number is ordinary public product identity, stamped or tagged on the product. |
| `purchaserOrder` | Purchaser Order | **AuthorizedOnly** |  | eli/reg/2024/1781 | The purchaser order reference exposes a specific commercial relationship and belongs to the B2B delivery record. |
| `steelDesignation` | Steel Designation | **Public** |  | eli/reg/2024/1781 | The EN 10027 steel designation is standardised public product identity every buyer specifies against. |
| `steelGradeClassification` | Steel Grade Classification | **Public** |  | eli/reg/2024/1781 | The EN 10020 grade classification is a coarse public typing of the material with no commercial sensitivity. |
