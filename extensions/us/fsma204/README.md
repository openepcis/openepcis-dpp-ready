# FSMA 204 — FDA Food Traceability

**Status:** Preview (v0.1.0) • **Region:** United States • **Rule:** 21 CFR Part 1 Subpart S

OpenEPCIS vocabulary for the U.S. FDA Food Safety Modernization Act §204
**Food Traceability Final Rule**. This module **strictly follows the
authoritative GS1 US guidance**:

- **GS1 US — EPCIS Recommendations for FSMA 204 Critical Tracking Events**,
  Release 2.0, May 15, 2025
  ([PDF](https://documents.gs1us.org/adobe/assets/deliver/urn:aaid:aem:0c934e38-7cd7-4a86-aac3-c54b4c9ef293/EPCIS-Recommendations-FSMA-204-Critical-Tracking-Events.pdf))
- **GS1 US — Application of GS1 System of Standards to Support FSMA 204**,
  Release 3.0, December 2025
  ([PDF](https://documents.gs1us.org/adobe/assets/deliver/urn:aaid:aem:8037d451-b557-4b0f-9fa8-fc94f94e4547/GS1-US-Application-of-GS1-System-of-Standards-to-Support-FSMA-204-Guideline.pdf))

All FSMA 204 KDEs map onto **native EPCIS 2.0 / GS1 Web Vocabulary** fields.
This module deliberately does **not** invent `usfsma:` extension properties
for event data — GS1 US has already specified exactly how each KDE travels.

## What this module contributes

On top of the GS1 US guidance, we add:

1. **RDF class anchors** for the seven CTEs and the TraceabilityLotCode
   concept (documentation/querying aid, not required at runtime).
2. **`usfsma:FoodTraceabilityList` enumeration** — the 23 FDA-defined food
   categories (including the leafy-greens and finfish sub-splits and the
   fresh-cut entries) that the FDA Food Traceability List publishes.
3. **One master-data property** — `usfsma:foodTraceabilityListCategory` —
   attached to `gs1:Product` so a GTIN-level master data record can declare
   its FTL category. This is the only FSMA KDE that GS1 US's master-data
   guide does not already cover.
4. **Verbatim EPCIS 2.0 examples for every CTE**, transcribed from GS1 US
   R2.0 onto demo GCP 086000.

## The seven CTEs — GS1 US EPCIS mapping

| CTE | EPCIS event | `bizStep` | TLC encoding |
|-----|-------------|-----------|--------------|
| Harvesting (§2) | `ObjectEvent`, action=`ADD` | `creating_class_instance` | `quantityList.epcClass` |
| Cooling (§3) | three `ObjectEvent`s | `receiving`, `other`, `transporting` | `quantityList.epcClass` |
| Initial Packing (§4) | `TransformationEvent` | `creating_class_instance` | `outputQuantityList.epcClass` (new TLC) |
| First Land-Based Receiver (§8) | `ObjectEvent`, action=`ADD` | `creating_class_instance` | `quantityList.epcClass` + seafood ILMD |
| Shipping (§6) | `AggregationEvent` action=`ADD` + `ObjectEvent` action=`OBSERVE` | `packing` + `shipping` | `epcList=[SSCC]` + `childQuantityList.epcClass` |
| Receiving (§7) | `AggregationEvent` action=`OBSERVE` | `receiving` | `childQuantityList.epcClass` |
| Transformation (§5) | `TransformationEvent` | `creating_class_instance` | `outputQuantityList.epcClass` |

### TLC encoding

Per GS1 US R2.0 §1.2 and §2-§8, the TLC is always a **GS1 Digital Link URI**
of the form:

```
https://id.gs1.org/01/{GTIN14}/10/{BatchLot}
```

It rides in `quantityList.epcClass`, `childQuantityList.epcClass`, or
`outputQuantityList.epcClass` (depending on the event). **There is no
extension property for the TLC value** — the KDE lives in native EPCIS
structure.

### Location Description KDEs

Every FSMA 204 location KDE (farm, growing area, cooling location, packing
location, receiving location, immediate-previous-source,
immediate-subsequent-recipient) rides as a **GS1 Digital Link URI based on
`/414/{GLN}`** in `readPoint`, `bizLocation`, `sourceList.source`, or
`destinationList.destination`. The full location details (business name,
street address, phone, etc.) are master data of that GLN and exchanged
outside the EPCIS event per GS1 US R2.0 §1.2.

### Party KDEs

Harvester business-name / phone KDEs and similar ride as
`/417/{GLN}` GS1 Digital Link URIs in `sourceList` (type=`owning_party`) or
`destinationList`. Again, full party details are master data of the GLN.

### Seafood KDEs

For First Land-Based Receiver (§8), seafood-specific KDEs ride in the
event's `ilmd`:

- `gs1:catchZone` — array of FAO area codes (list)
- `gs1:harvestDateStart` / `gs1:harvestDateEnd` — harvest date range
- `gs1:fishType` — species / acceptable market name

These are GS1 Web Vocabulary terms — no `usfsma:` extensions needed.

### Reference document KDEs

Reference document type and number KDEs ride in `bizTransactionList` using
standard CBV transaction types (`po`, `recadv`, `desadv`, `bol`, `cert`,
`prodorder`).

## Using the vocabulary

Declare the extension via the EPCIS 2.0 `GS1-Extensions` header:

```
GS1-Extensions: usfsma=https://ref.openepcis.io/extensions/us/fsma204/
```

JSON-LD context pattern (only needed on master data or when using the FTL
enum / CTE class anchors):

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "https://ref.openepcis.io/extensions/us/fsma204/fsma204-context.jsonld"
  ]
}
```

EPCIS event documents themselves only need the standard EPCIS context —
the CTE mapping is entirely in native EPCIS field values.

## Files

- `ontology/fsma204.ttl` — RDF/Turtle source
- `context/fsma204-context.jsonld` — JSON-LD context (master data only)
- `json/fsma204.json` — generated vocabulary JSON
- `examples/traceability-lot.jsonld` — GTIN master data with FTL category
- `epcis/harvest-cte.jsonld` — Harvesting CTE, verbatim GS1 US §2
- `epcis/cooling-cte.jsonld` — Cooling CTE, verbatim GS1 US §3
- `epcis/initial-packing-cte.jsonld` — Initial Packing CTE, verbatim GS1 US §4
- `epcis/transformation-cte.jsonld` — Transformation CTE, verbatim GS1 US §5
- `epcis/shipping-cte.jsonld` — Shipping CTE, verbatim GS1 US §6 (aggregation-add variant)
- `epcis/receiving-cte.jsonld` — Receiving CTE, verbatim GS1 US §7 (aggregation-observe variant)
- `epcis/first-land-based-receiver-cte.jsonld` — FLBR CTE, verbatim GS1 US §8
- `validation/fsma204-schema.json` — JSON Schema stub for the master-data record
- `validation/fsma204-shapes.ttl` — SHACL shape stub
- `docs/OVERVIEW.md` — longer-form rule overview

## References

- FDA Food Traceability Final Rule:
  <https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods>
- Food Traceability List:
  <https://www.fda.gov/food/food-safety-modernization-act-fsma/food-traceability-list>
- 21 CFR Part 1 Subpart S:
  <https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-1/subpart-S>
- FDA enforcement discretion extending the compliance date to
  January 20, 2028 (announced 2025-03-20):
  <https://www.fda.gov/food/food-safety-modernization-act-fsma/final-rule-requirements-additional-traceability-records-certain-foods>
- GDST FSMA 204 Guidance (for seafood):
  <https://thegdst.org/wp-content/uploads/2024/03/FSMA-204-Traceability-Rule-Guidance-final.pdf>

> **Disclaimer:** This vocabulary is a community implementation of the
> published GS1 US recommendations. It is not FDA guidance and is not a
> substitute for reading the rule text.
