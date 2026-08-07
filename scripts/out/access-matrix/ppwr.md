# Access-tier review matrix — ppwr

Regulatory frame: PPWR (EU) 2025/40

Coverage: 12 properties — 10 Public / 2 AuthorizedOnly / 0 Restricted / 0 inherited / 0 UNCLASSIFIED; 0 legally locked.

| Term | Label | Tier | Mandated (locked) | Source | Rationale |
|---|---|---|---|---|---|
| `averageRotationsEstimate` | Average Rotations Estimate | **Public** |  | eli/reg/2025/40 | The average estimation is the Art. 12(2) fallback where per-item trip/rotation calculation is not feasible, and is user-facing reuse information like the calculated count. |
| `collectionPointsUrl` | Collection Points URL | **Public** |  | eli/reg/2025/40 | Information on collection points is explicitly part of the Art. 12(2) reuse information made available through the QR code. |
| `containerCondition` | Container Condition | **AuthorizedOnly** |  | eli/reg/2025/40 | The observed condition of a returned item is operational routing data of the deposit-return system (PPWR Arts. 27, 50), not consumer product information. |
| `depositRefundIssued` | Deposit Refund Issued | **AuthorizedOnly** |  | eli/reg/2025/40 | Per-return refund amounts are operational financial event data of the deposit-return scheme (PPWR Art. 50); the static deposit amount is served publicly via GS1 master data instead. |
| `designForRecyclingMethodology` | Design-for-Recycling Methodology | **Public** |  | eli/reg/2025/40 | Naming the design-for-recycling methodology (e.g. RecyClass) is the transparency that makes the public recyclability grade verifiable. |
| `harmonisedSymbol` | Harmonised Symbol | **Public** |  | eli/reg/2025/40 | PPWR Art. 12 harmonised labels are printed on the packaging for consumers and separate-collection schemes, so their digital reference is inherently public (label formats pending implementing acts, hence not locked). |
| `hasPackagingTier` | Packaging Tier | **Public** |  | eli/reg/2025/40 | The sales/grouped/transport classification (PPWR Art. 3) is basic packaging typing visible from the packaging itself and needed to interpret every other packaging claim. |
| `hasRecyclabilityGrade` | PPWR Recyclability Grade | **Public** |  | eli/reg/2025/40 | The PPWR Art. 6 recyclability performance grade is a consumer- and scheme-facing band (grading criteria pending delegated acts, hence not locked). |
| `hasReuseInformation` | Reuse Information | **Public** |  | eli/reg/2025/40 | PPWR Art. 12(2): availability of the re-use system, collection points and trips/rotations (or the average estimation) are exactly the information the reuse QR code must make available to users (label formats pending implementing acts, hence not locked). |
| `hasReuseSystemScope` | Reuse System Scope | **Public** |  | eli/reg/2025/40 | The local/national/Union-wide availability of the re-use system is Art. 12(2) end-user information served through the reuse data carrier. |
| `reuseSystemName` | Reuse System Name | **Public** |  | eli/reg/2025/40 | Naming the re-use system (Annex VI system operator) is Art. 12(2) end-user information that makes the reuse claim actionable. |
| `rotationCount` | Rotation Count | **Public** |  | eli/reg/2025/40 | Art. 12(2): the reuse data carrier facilitates the tracking of the packaging and the calculation of trips and rotations; the calculated count is user-facing reuse information. |
