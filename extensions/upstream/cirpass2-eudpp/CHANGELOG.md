# Changelog — CIRPASS-2 EUDPP mirror

Upstream mirror: this module tracks the CIRPASS-2 EUDPP Core Ontology releases
(Semantic Treehouse / w3id.org/eudpp), not the OpenEPCIS DPP-Ready version.

## Sync log

### 2026-10-29 — upstream v2.1.0 (CIRPASS-2/ontologies-docs @ a41561d)

- CORE 2.0.5 → **2.1.0** (issued 2026-10-16; documentation refresh 2026-10-12,
  LCA added to the CORE imports 2026-10-22). Module versions: ACTOR 2.0.0 → 2.2.0,
  CONNECTOR 2.0 → 2.4.0, EVENT 0.1.0 DRAFT → **1.0.0**, IDENT 1.0.5 → 1.2.0,
  MAT 1.0.2 → 1.1.0, P_DPP 2.0.0 → 2.2.0, SOC 2.0.0 → 2.2.0, COMP 1.0.0 (unchanged),
  LCA 2.0 → **3.1**. 4330 quads, 536 named subjects (was 3295 / 465); 229 terms
  removed, 270 added, none marked `owl:deprecated`.
- **Source switched** from the W3ID/hub exports to the module files in
  `github.com/CIRPASS-2/ontologies-docs`, pinned by commit: the hub exports cannot
  be pinned, trail the documented release (ACTOR 2.1.3, CON 2.3.0 on the hub), and
  the hub's `COMP` export was a blank-node structure dump on 2026-10-29. The sync
  script now refuses a module without a named ontology node or with too few terms.
- Breaking renames that our pointers followed: SOC `numberCAS`/`numberEC`/`nameIUPAC`
  → `casNumber`/`ecNumber`/`iupacName`, `substanceLocation` →
  `substanceLocationDescription` + `isLocatedInProduct`, `Concentration`/`Threshold`
  → `ConcentrationRange`/`MaximumConcentration`; LCA rebuilt (`LcaResult` →
  `LCAResult`/`LCIAResult`, `ImpactCategory` → `LCIAImpactCategory`, the `*Footprint`
  classes → `LCIAResult` + impact-category individuals, `hasLifeCycleStage` →
  `forLifeCycleModule`, `hasUnitOfMeasure` → `hasMeasurementUnit`).
- EVENT 1.0.0 dropped the re-declared EPCIS carrier layer (`ObjectEvent`,
  `BusinessStep`, `Disposition`, …) and references `https://ref.gs1.org/epcis/` and
  `https://ref.gs1.org/cbv/` IRIs instead.

### 2026-08-06 — upstream v2.0.5 (initial mirror)

- Initial mirror of the EUDPP Core Ontology v2.0.5 (issued 2026-07-06): CORE
  umbrella + ACTOR 2.0.0, CONNECTOR 2.0, EVENT 0.1.0 DRAFT, IDENT 1.0.5,
  MAT 1.0.2, P_DPP 2.0.0, SOC 2.0.0, COMP 1.0.0, LCA 2.0 — merged verbatim
  into `ontology/eudpp.ttl` by `pnpm sync:eudpp` (3295 quads, 465 declared
  terms). Upstream license Apache 2.0 (CC BY 4.0 fallback as a document),
  © CIRPASS-2 project / TalTech.
