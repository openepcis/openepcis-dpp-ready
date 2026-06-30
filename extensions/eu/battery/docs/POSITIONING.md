# OpenEPCIS Battery DPP — Design Rationale & Positioning

This note explains the design choices behind the OpenEPCIS battery Digital Product
Passport and how it relates to other battery-passport efforts. It is **not** a
competitive ranking: the initiatives below address overlapping but distinct scopes,
and OpenEPCIS deliberately interoperates with several of them.

## The landscape

| Initiative | What it primarily is | Relationship to OpenEPCIS |
|---|---|---|
| **BatteryPass** (SAMM aspect models) | A semantic data model for the EU battery passport. | Peer data model. OpenEPCIS ships bridge contexts (`battery-context-batterypass-bridge.jsonld`, `battery-context-to-batterypass.jsonld`) so a payload can be mapped both ways. |
| **Catena-X** | An automotive **data-space / exchange framework** (EDC + IDS connectors, data sovereignty, usage contracts). | A different layer — it governs *how* data is exchanged between partners, not the vocabulary. Complementary: an OpenEPCIS passport can travel over a Catena-X data space. |
| **DPP Keystone** | A generic, cross-sector DPP profile. | Upstream peer profile. `oec:` terms are anchored to `dppk:` via graded SKOS mappings, and we ship `dpp-keystone-bridge-context.jsonld`. |

Because the scopes differ, a single "best" ranking would be misleading. The sections
below describe what the OpenEPCIS model optimises for and the trade-offs involved.

## Design choices (and why)

### 1. Dereferenceable identity — GS1 Digital Link
The passport `id` is a GS1 Digital Link (`https://id.gs1.org/01/{gtin}/21/{serial}`),
so an HTTP GET on the scanned QR code resolves directly to the data. Trade-off: this
assumes GTIN-based identification and a GS1 Digital Link resolver. URN-based identity
schemes (used by some passports) avoid the resolver but need a separate resolution
service to turn the identifier into data.

### 2. Event-based dynamic data — EPCIS 2.0
Dynamic values (state of health, cycle count, the carbon-footprint lifecycle phases,
…) are carried as EPCIS 2.0 events, which record the value **plus** when, where, by
which device, and by which method. This keeps a full, auditable history rather than a
single latest reading.

OpenEPCIS event (excerpt):
```json
{
  "type": "ObjectEvent",
  "eventTime": "2025-06-15T09:30:00Z",
  "epcList": [{ "id": "https://id.gs1.org/01/.../21/..." }],
  "sensorReport": [{
    "type": "StateOfHealth",
    "value": 94.2,
    "dataProcessingMethod": "https://www.iec.ch/standards/iec-62660-1"
  }],
  "readPoint": { "id": "https://id.gs1.org/414/9521987000018" },
  "deviceID": "https://id.gs1.org/8004/9521987BMS-001"
}
```
A point-in-time / static-blob model instead stores the value with a `lastUpdate`
timestamp — simpler to produce, but it does not retain location, method, device, or
prior readings. The event model is the right trade-off when provenance and audit
trails matter; a static snapshot is lighter when only the current value is needed.

### 3. Standards-native vocabulary
Terms come directly from the GS1 Web Vocabulary, UN/CEFACT (units of measure), and
JSON-LD/OWL, so each IRI dereferences to a definition without a proprietary
translation layer. Battery-specific concepts that GS1 does not cover are minted under
`eubat:` and anchored upward with graded SKOS mappings.

### 4. Scientific bridge — EMMO / BattINFO / QUDT
A second JSON-LD context (`battery-context-scientific.jsonld`) layers EMMO/BattINFO
class equivalences and QUDT units onto the same payload, so one passport can be read
both by a supply-chain consumer and by a materials-research toolchain.

### 5. Regulatory coverage
The model targets the data points of EU Battery Regulation 2023/1542 Annex XIII —
static attributes plus the dynamic state-of-health / state-of-charge metrics — using
GS1 terms where they exist and `eubat:` / `oec:` extensions where they do not. The
`validation/` SHACL shapes and JSON Schema check a payload against those requirements.

## When another approach fits better
- **Sovereign, contract-governed exchange** between named partners → a data space
  such as Catena-X (which can carry an OpenEPCIS passport as its payload).
- **Already standardised on BatteryPass SAMM tooling** → use the bridge contexts to
  map in and out rather than switching models.
- **A generic, cross-sector profile** → DPP Keystone, to which the OpenEPCIS core
  vocabulary anchors.

## References

- [EU Battery Regulation 2023/1542](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1542)
- [BatteryPass Project](https://thebatterypass.eu/)
- [Catena-X](https://catena-x.net/)
- [DPP Keystone](https://dpp-keystone.org/)
- [GS1 Digital Link](https://www.gs1.org/standards/gs1-digital-link)
- [EPCIS 2.0](https://ref.gs1.org/standards/epcis/)
- [EMMO Battery Domain](https://github.com/emmo-repo/domain-battery)
