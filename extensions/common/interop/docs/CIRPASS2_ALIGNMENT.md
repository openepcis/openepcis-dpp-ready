# CIRPASS-2 alignment with OpenEPCIS DPP-Ready

CIRPASS-2 is the **EU pilot programme** for Digital Product Passports.
It feeds requirements and concept models into CEN/CENELEC JTC 24
(the actual EU standardisation track for DPP — the harmonised EN
18216–18223 series). CIRPASS-2 is one input among several; **not** a
finalised EU standard, **not** the canonical EU DPP ontology.

CIRPASS-2 publishes a modular ontology proposal under the W3ID
permanent identifier `https://w3id.org/eudpp#`, hosted on the Semantic
Treehouse vocabulary hub at <https://dpp.vocabulary-hub.eu/specifications>.

> **Caveat — IRI dereference.** As of 2026-05, the W3ID redirect for
> `https://w3id.org/eudpp#<Class>` returns HTTP 404 (it points at a
> Treehouse API path that doesn't match the current backend). The
> namespace exists but the IRIs don't resolve to a per-term page in
> a browser. We treat the namespace as a stable identifier for
> see-also pointing only.

## Anchor strategy

OpenEPCIS DPP-Ready references CIRPASS-2 as a **see-also pointer
only**:

- prefix in `dpp-core.ttl`: `@prefix cirpass2: <https://w3id.org/eudpp#>`
- relationship: **`rdfs:seeAlso` only**
- never `rdfs:subClassOf`, never `owl:equivalentClass`, never
  `rdfs:subPropertyOf`

We deliberately do **not** elevate CIRPASS-2 anchors to formal
subsumption or equivalence. Three reasons:

1. **CIRPASS-2 is a pilot deliverable, not a regulation-binding
   standard.** Formal subsumption against an unfinalised peer would
   bind our ontology to choices that may change before the JTC 24
   harmonised standards are published.
2. **The W3ID IRI doesn't currently dereference.** Asserting
   `rdfs:subClassOf cirpass2:Actor` against an IRI that 404s in a
   browser is bad citizenship — consumers can't verify the claim.
3. **Two extensions almost never have identical extension.** The
   CIRPASS-2 classes are typically broader (`cirpass2:Actor` covers
   regulators, consumers, etc., not just economic operators). seeAlso
   is the strongest claim that holds without overstating.

## Reference table

| Our IRI | CIRPASS-2 see-also pointer | Note |
|---|---|---|
| `dpp:OperatorInformation` | `cirpass2:Actor`, `cirpass2:LegalPerson`, `cirpass2:ManufacturerRecord` | three pointers — operator overlaps each in a different way |
| `dpp:OperatorRole` | `cirpass2:EconomicOperatorRole` | enum-vs-class shape difference; pointer only |
| `dpp:FacilityInformation` | `cirpass2:Facility` | |
| `dpp:HazardousSubstance` | `cirpass2:Substance` | |
| `dpp:SubstanceOfConcern` | `cirpass2:SubstanceOfConcern` | both SCIP-aligned |
| `dpp:CircularityPerformance` | `cirpass2:CircularEconomyIndicator` | |
| `dpp:RecycledContent` | `cirpass2:RecycledMaterialsUse` | |
| `dpp:EmissionsPerformance` | `cirpass2:CarbonFootprint`, `cirpass2:EnvironmentalFootprint` | |
| `dpp:PerformanceInfo` | `cirpass2:Durability`, `cirpass2:Reliability` | |
| `dpp:RepairabilityInfo` | `cirpass2:Reliability`, `cirpass2:Durability` | |
| `dpp:DueDiligenceReport` | `cirpass2:ComplianceDeclaration` | already anchored more strongly to `cccev:Evidence` (CCCEV is the SEMICeu upstream that CIRPASS-2's compliance model derives from) |
| `dpp:DocumentReference` | `cirpass2:DigitalInstruction` | |

Module ontologies (`battery.ttl`, `eudr.ttl`, `textile.ttl`,
`electronics.ttl`) inherit these pointers indirectly via property
domain/range cascades. No module-side TTL changes are needed.

## What we do not do

- **Do not vendor CIRPASS-2 TTL.** No `.ttl` files copied into this
  repository. The Treehouse hub hosts the canonical exports at
  `https://dpp.vocabulary-hub.eu/api/ontology/-/version/<UUID>/export?format=ttl`.
  We reference by IRI, not by file copy.
- **Do not import CIRPASS-2 classes into our class hierarchy.** No
  `owl:imports`, no `rdfs:subClassOf` against `cirpass2:`. Our
  ontology stays self-contained.
- **Do not re-render CIRPASS-2 namespace as if it dereferenced.** The
  ref.openepcis.io vocabulary browser knows that `cirpass2:` IRIs
  point at the Treehouse Specifications catalog, not a per-term page,
  and routes "View on…" links accordingly.

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
- CIRPASS-2 catalog: <https://dpp.vocabulary-hub.eu/specifications>
- CIRPASS-2 namespace: `https://w3id.org/eudpp#` (currently does not
  dereference cleanly; see Caveat)
