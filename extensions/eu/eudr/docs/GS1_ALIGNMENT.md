# GS1 EUDR Alignment Status

**Last verified: 2026-04-17**

This module tracks the **GS1 EUDR Provisional Standard (Release P, Sep 2025)**
published at <https://ref.gs1.org/standards/eudr/> and the GS1 Web Vocabulary
at <https://ref.gs1.org/voc/>. This file records, with dates and citations,
where the OpenEPCIS `eudr:` extension is aligned, where it fills a gap that
GS1 has not yet addressed, and where the GS1 model is expected to evolve.

## What we follow verbatim from GS1 EUDR Release P (Sep 2025)

- **`gs1:RegulatoryNotification`** (the B2B message class) — our
  `examples/regulatory-notification.jsonld` is structured per PDF §4.
- **`gs1:regulatoryInformation`** carrying `gs1:regulatoryAct` +
  `gs1:regulationType` + one or more `gs1:regulatoryIdentifier` —
  §3.1, §4.1.
- **`gs1:RegulatoryIdentifier`** mandatory fields
  (`gs1:regulatoryReferenceNumber`, `gs1:regulatoryVerificationNumber`,
  `gs1:regulatoryIdentifierType = DUE_DILIGENCE_STATEMENT`,
  `gs1:applicableProducts`) plus optional
  `gs1:regulatoryInformationProvider`,
  `gs1:regulatoryReferenceApplicabilityStartDate`, `…EndDate`.
- **EPCIS ObjectEvent with `bizStep: "notifying"` and
  `persistentDisposition: ["subject_to_regulation"]`** — PDF §5.2 worked
  example. Our `epcis/due-diligence-statement.jsonld` mirrors that event
  shape.
- **`gs1:masterDataAvailableFor`** for event-level master-data attachment
  — PDF §5.2.

## What GS1 does NOT yet cover (our extensions fill gaps)

These `eudr:` terms exist because the GS1 Web Vocabulary defines no
equivalent as of Release P. Each is marked `dcterms:source` to the
originating regulation or GSMP Work Request.

| Concept | OpenEPCIS term | Why an extension |
|---------|----------------|-------------------|
| Commodity type (EUDR Annex I) | `eudr:commodityType` | GS1 has no EUDR commodity enum. |
| Timber product type | `eudr:timberProductType` | GS1 has no timber sub-classification. |
| Species (scientific + common name) | `eudr:speciesScientificName` / `…CommonName` | GS1 has no species-naming terms. |
| Harvest date / date range | `eudr:harvestDate` / `…Start` / `…End` | GS1 has no harvest-date property. |
| Risk-level classification | `eudr:riskLevel` | GS1 has no EUDR risk enum. |
| Deforestation-free date | `eudr:deforestationFreeDate` | EUDR Art. 3 specific. |
| Legality assertion | `eudr:legallyHarvested` | EUDR Art. 3 specific. |
| Forest management unit | `eudr:forestManagementUnit` | No GS1 equivalent. |
| Exemption declarations | `eudr:ExemptionDeclaration` + family | See next section. |

## Exemption declarations — provisional pending GSMP publication

**Status as of 2026-04-17:** GS1 EUDR Release P defines **no** exemption
terms. The GS1 Web Vocabulary has no `gs1:regulatoryExemption` property,
no `gs1:RegulatoryExemption` class, and no exemption-type enum.

**In-flight GS1 work** the community previewed at the
**GS1 EUDR MSWG on 13 April 2026** (chair: Craig Alan Repec, GS1 GO):

- **WR 25-252** — EUDR exemption handling in EANCOM and GS1 XML.
- **WR 26-122** — EUDR exemption handling in GDSN master data.
- Planned EPCIS/JSON-LD model: when an exemption applies, GS1's
  `gs1:regulatoryIdentifier` becomes **optional** and is replaced by a
  new `gs1:regulatoryExemption` property. Two exemption kinds
  (permanent, temporary).

Neither the WR drafts nor the new `gs1:regulatoryExemption` term are
publicly visible as of this writing.

**Our provisional pattern.** We define `eudr:`-namespaced classes and
properties that carry the same semantics:

| OpenEPCIS (provisional) | Planned GS1 equivalent |
|-------------------------|------------------------|
| `eudr:ExemptionDeclaration` (class) | `gs1:RegulatoryExemption` (planned) |
| `eudr:exemptionDeclaration` (property) | `gs1:regulatoryExemption` (planned) |
| `eudr:ExemptionType` + `eudr:PermanentExemption` / `eudr:TemporaryExemption` | `gs1:RegulatoryExemptionTypeCode` enum (planned) |
| `eudr:exemptionReasonCode` | planned (per WR 25-252) |
| `eudr:exemptionScope` + `eudr:exemptionScopeReference` | planned |
| `eudr:exemptionEffectiveFrom` / `…Until` | planned |
| `eudr:exemptionAuthority` (→ `dpp:OperatorInformation`) | planned |

**Migration commitment.** When GS1 publishes the canonical exemption
vocabulary, every `eudr:` term above will be linked via
`owl:equivalentClass` / `owl:equivalentProperty` to its GS1 counterpart
rather than deleted. Downstream consumers of the `eudr:` URIs remain
stable; additionally they will be able to consume the GS1 URIs after the
equivalence mapping is published.

**Example.** See `epcis/exemption-declaration.jsonld` — an EPCIS
ObjectEvent with `bizStep: "notifying"` where the inner
`regulatoryInformation` block omits `regulatoryIdentifier` (an exemption
replaces it) and the exemption itself rides as an event-level
`eudr:exemptionDeclaration`.

## Multi-DDS per outbound batch

The 13 April 2026 MSWG acknowledged that one outbound batch may derive
from multiple imported raw-material batches, each with its own DDS. The
GS1 model supports this today (multiple `gs1:regulatoryIdentifier`
entries) but the result is redundant. Community work is ongoing to
improve expressiveness.

Our examples demonstrate the currently-supported pattern
(one-or-more `gs1:regulatoryIdentifier` entries) without inventing a new
aggregation structure.

## Importer–manufacturer scenario (Commission Scenario 5)

Per the 13 April 2026 MSWG: a company that imports a raw material and
internally transforms it into a finished product places the DDS on the
imported raw material, not on the finished product. This interpretation
is reflected in how our derived-product examples
(`examples/timber-derived.jsonld`) link via `eudr:derivedFrom` back to
the raw-material GTINs — the DDS lives on the raw material.

## Changes log (alignment-relevant)

- **2026-04-17**: Added this file. Strengthened the `skos:note` /
  `dcterms:source` metadata on the exemption block in `ontology/eudr.ttl`
  to state the provisional status explicitly. Clarified the architecture
  comment in `epcis/exemption-declaration.jsonld`.
- **2026-04-16**: Removed shadow properties (`eudr:sourceLocation`,
  `eudr:batchNumber`, `eudr:hsCode`, `eudr:cnCode`, `eudr:TimberProduct`
  class) that duplicated native EPCIS / GS1 fields. Migrated customs
  codes to `dpp:customsCommodityCode` + `dpp:customsCommodityCodeType`.
  Fixed references to non-existent `gs1:isRegulationCompliant` (→
  `dpp:isRegulationCompliant`).
- **2026-04-13**: GS1 EUDR MSWG previewed exemption model; noted for
  follow-up here.

## References

- GS1 EUDR Provisional Standard Release P (Sep 2025):
  <https://ref.gs1.org/standards/eudr/>
- GS1 Web Vocabulary: <https://ref.gs1.org/voc/>
- GS1 EUDR JSON-LD context:
  <https://ref.gs1.org/standards/eudr/context.jsonld>
- EU Commission EUDR implementation guidance (25 March 2026): published
  on the Commission Europa portal (not mirrored here).
- GS1 EUDR MSWG meeting minutes, 13 April 2026 (cited internally).
