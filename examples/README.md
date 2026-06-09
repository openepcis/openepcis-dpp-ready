# OpenEPCIS DPP-Ready — Examples Index

A guided tour of the working examples across modules. Every example uses
GS1 Digital Link URIs for identification, `gs1:masterDataAvailableFor`
for inline master data, and EPCIS 2.0 Section 12.3 extension declaration
via the `GS1-Extensions` HTTP header.

All examples use **GS1 demo prefix 952** (7-digit GCP: `9521234`). Never
use 952 for real-world identification.

---

## Battery — EU Battery Regulation 2023/1542

### Master data
- [`battery/examples/battery-product.jsonld`](../battery/examples/battery-product.jsonld)
  — Complete EV battery product master data. ~712 lines. Covers all EU
  Battery Regulation Annex XIII requirements: identification, chemistry,
  rated capacity, operator information, manufacturer, state of health,
  carbon footprint, hazardous substances, due diligence, warranty, spare
  parts, dismantling info, labels.
- [`battery/examples/portable-ebike-battery.jsonld`](../battery/examples/portable-ebike-battery.jsonld)
  — **NEW:** LMT (Light Means of Transport) counterpart to the EV pack;
  NMC622 chemistry, 48 V / 14 Ah, hazardous-substance disclosure with
  EC numbers, EoL material-recovery targets, dismantling docs.
- [`battery/examples/regulatory-notification.jsonld`](../battery/examples/regulatory-notification.jsonld)
  — B2B compliance message (GS1 RegulatoryNotification pattern).

### EPCIS events (8 total, covering full lifecycle)
- [`battery/epcis/commissioning.jsonld`](../battery/epcis/commissioning.jsonld)
  — Battery creation at the factory.
- [`battery/epcis/ownership-transfer.jsonld`](../battery/epcis/ownership-transfer.jsonld)
  — Ownership change across parties.
- [`battery/epcis/carbon-footprint.jsonld`](../battery/epcis/carbon-footprint.jsonld)
  — Carbon footprint declaration with lifecycle breakdown.
- [`battery/epcis/state-of-health.jsonld`](../battery/epcis/state-of-health.jsonld)
  — SoH measurement event with sensor data and provenance.
- [`battery/epcis/state-of-certified-energy.jsonld`](../battery/epcis/state-of-certified-energy.jsonld)
  — SOCE measurement per Annex XIII.
- [`battery/epcis/negative-event.jsonld`](../battery/epcis/negative-event.jsonld)
  — Accident / damage record.
- [`battery/epcis/temperature-extreme.jsonld`](../battery/epcis/temperature-extreme.jsonld)
  — Temperature excursion during transport.
- [`battery/epcis/regulatory-notification.jsonld`](../battery/epcis/regulatory-notification.jsonld)
  — Regulatory compliance event (bizStep `notifying`).

---

## EUDR — EU Deforestation Regulation 2023/1115

### Master data
- [`eudr/examples/timber-product.jsonld`](../eudr/examples/timber-product.jsonld)
  — Round wood (European Oak) with species, country of origin, harvest date.
- [`eudr/examples/timber-derived.jsonld`](../eudr/examples/timber-derived.jsonld)
  — Furniture derived from timber (downstream product).
- [`eudr/examples/plot-of-land.jsonld`](../eudr/examples/plot-of-land.jsonld)
  — Production plot with GeoShape polygon coordinates.
- [`eudr/examples/regulatory-notification.jsonld`](../eudr/examples/regulatory-notification.jsonld)
  — B2B DDS reference sharing (GS1 EUDR p.0.0 pattern).

### EPCIS events (5 total)
- [`eudr/epcis/harvesting.jsonld`](../eudr/epcis/harvesting.jsonld)
  — Timber harvest commissioning event.
- [`eudr/epcis/processing.jsonld`](../eudr/epcis/processing.jsonld)
  — Transformation event (logs to furniture).
- [`eudr/epcis/supply-chain-transfer.jsonld`](../eudr/epcis/supply-chain-transfer.jsonld)
  — Shipping and receiving events.
- [`eudr/epcis/origin-declaration.jsonld`](../eudr/epcis/origin-declaration.jsonld)
  — V1.11 `notifying` pattern (GS1 Germany guideline).
- [`eudr/epcis/due-diligence-statement.jsonld`](../eudr/epcis/due-diligence-statement.jsonld)
  — Full DDS declaration with EUIS reference number, risk level, verification method.
- [`eudr/epcis/exemption-declaration.jsonld`](../eudr/epcis/exemption-declaration.jsonld)
  — **NEW:** EUDR exemption pattern (reference implementation).

---

## Textile — EU Sustainable Textiles Strategy

### Master data
- [`textile/examples/garment-product.jsonld`](../textile/examples/garment-product.jsonld)
  — Winter jacket with recycled polyester shell + down filling; full fiber
  composition, care symbols, certifications.
- [`textile/examples/footwear-product.jsonld`](../textile/examples/footwear-product.jsonld)
  — Running shoe with material composition and durability attributes.
- [`textile/examples/garment-set-itip.jsonld`](../textile/examples/garment-set-itip.jsonld)
  — Two-piece business suit demonstrating ITIP (AI 8026)
  piece-level identification (GS1 ITIP, AI 8026).
- [`textile/examples/hometextile-bedlinen.jsonld`](../textile/examples/hometextile-bedlinen.jsonld)
  — **NEW:** Organic-cotton bed linen set (HomeTextile sub-category);
  GOTS + OEKO-TEX certifications, ESPR-Annex-V durability metrics,
  circular take-back program for non-apparel textile.

### EPCIS events (7 total)
- [`textile/epcis/commissioning.jsonld`](../textile/epcis/commissioning.jsonld)
  — Finished garment commissioning.
- [`textile/epcis/transformation-spinning.jsonld`](../textile/epcis/transformation-spinning.jsonld)
  — Fiber to yarn transformation.
- [`textile/epcis/transformation-weaving.jsonld`](../textile/epcis/transformation-weaving.jsonld)
  — Yarn to fabric transformation.
- [`textile/epcis/transformation-garment.jsonld`](../textile/epcis/transformation-garment.jsonld)
  — Fabric to finished garment.
- [`textile/epcis/observation-durability.jsonld`](../textile/epcis/observation-durability.jsonld)
  — Durability test observation.
- [`textile/epcis/observation-chemical.jsonld`](../textile/epcis/observation-chemical.jsonld)
  — Chemical compliance observation.
- [`textile/epcis/observation-carbon-footprint.jsonld`](../textile/epcis/observation-carbon-footprint.jsonld)
  — PEF carbon footprint observation.

---

## Packaging — EU PPWR 2025/40

### Master data
- [`ppwr/examples/beverage-bottle.jsonld`](../ppwr/examples/beverage-bottle.jsonld)
  — 0.5 L PET beverage bottle, 50% post-consumer rPET, Grade A
  recyclability, deposit-return scheme participation, separate-collection
  PET harmonised symbol.
- [`ppwr/examples/multi-layer-pouch.jsonld`](../ppwr/examples/multi-layer-pouch.jsonld)
  — PET/Aluminium/PE laminate snack pouch; Grade C recyclability
  (lowest acceptable from 2030, phased out by 2038).
- [`ppwr/examples/ecommerce-carton.jsonld`](../ppwr/examples/ecommerce-carton.jsonld)
  — **NEW:** Corrugated cardboard shipping carton; Grouped packaging
  tier; 95% recycled content (80% post-consumer + 15% pre-consumer);
  Grade A recyclability against the paper stream.

### EPCIS events (5 total)
- [`ppwr/epcis/commissioning.jsonld`](../ppwr/epcis/commissioning.jsonld)
  — Packaging enters the regulated supply chain.
- [`ppwr/epcis/ownership-transfer.jsonld`](../ppwr/epcis/ownership-transfer.jsonld)
  — **NEW:** Manufacturer → brand-owner shipment with owning-party
  source/destination and PO/DESADV bizTransactions.
- [`ppwr/epcis/deposit-return.jsonld`](../ppwr/epcis/deposit-return.jsonld)
  — **NEW:** Consumer redeems a deposit-bearing bottle at a Pfand-Automat;
  bizStep `decommissioning`, disposition `returned`. PPWR Art. 50.
- [`ppwr/epcis/recovery.jsonld`](../ppwr/epcis/recovery.jsonld)
  — **NEW:** TransformationEvent at an EPR-registered recycler;
  bottles → rPET flake. PPWR Art. 47.
- [`ppwr/epcis/observation-recyclability.jsonld`](../ppwr/epcis/observation-recyclability.jsonld)
  — **NEW:** Notified-body grading event with PPWR Annex II A/B/C grade
  and D4R methodology (RecyClass v2.6).

---

## Electronics — ESPR Electronics Delegated Acts

### Master data
- [`electronics/examples/smartphone-product.jsonld`](../electronics/examples/smartphone-product.jsonld)
  — Smartphone with French Indice de Réparabilité, EPREL energy label,
  RoHS/WEEE compliance.
- [`electronics/examples/laptop-product.jsonld`](../electronics/examples/laptop-product.jsonld)
  — Laptop DPP with repairability score and software/firmware lifecycle.
- [`electronics/examples/server-product.jsonld`](../electronics/examples/server-product.jsonld)
  — Server with component-level detail (multi-component CIRPASS-2 pattern).
- [`electronics/examples/display-product.jsonld`](../electronics/examples/display-product.jsonld)
  — Display with Energy Labelling A-G class.

### EPCIS events (5 total)
- [`electronics/epcis/commissioning.jsonld`](../electronics/epcis/commissioning.jsonld)
- [`electronics/epcis/ownership-transfer.jsonld`](../electronics/epcis/ownership-transfer.jsonld)
- [`electronics/epcis/software-update.jsonld`](../electronics/epcis/software-update.jsonld)
  — Firmware/OS update event.
- [`electronics/epcis/component-replacement.jsonld`](../electronics/epcis/component-replacement.jsonld)
  — Repair event with replaced part identification.
- [`electronics/epcis/weee-disposal.jsonld`](../electronics/epcis/weee-disposal.jsonld)
  — End-of-life / WEEE disposal event.

---

## Detergent — EU Detergents Regulation 2026/405

### Master data
- [`detergent/examples/laundry-detergent.jsonld`](../detergent/examples/laundry-detergent.jsonld)
  — Laundry detergent with INCI ingredients, surfactant biodegradability,
  CLP classification.
- [`detergent/examples/dishwasher-detergent.jsonld`](../detergent/examples/dishwasher-detergent.jsonld)
  — Dishwasher detergent tablet.

### EPCIS events
- [`detergent/epcis/commissioning.jsonld`](../detergent/epcis/commissioning.jsonld)
  — Detergent batch commissioning.

---

## How to read an example

Every example follows this structure:

1. **`_comment_gs1_alignment`** — explains which GS1 patterns are used and why
2. **`@context`** — stacks EPCIS base + `dpp/context` + domain context (e.g., `battery/context`) + any aliases
3. **`id`** — GS1 Digital Link URI (e.g., `https://id.gs1.org/01/09521234000013/21/BAT2024-001`)
4. **`type`** — array of types (e.g., `["gs1:Product", "Battery"]`)
5. **`gs1:*` properties** — standard GS1 Web Vocabulary (manufacturer, GTIN, weight, etc.)
6. **domain-specific properties** — e.g., `battery:stateOfHealth`, `textile:fiberType`, `eudr:harvestDate`
7. **`regulatoryInformation`** — compliance declarations (`gs1:RegulationTypeCode-*`)
8. **`_notes`** (where present) — implementation notes, semantic equivalences, status of referenced standards

## How to run the Bruno collection

The end-to-end API walkthrough lives in [`bruno/digital-link-resolver/`](../bruno/digital-link-resolver/):

1. Install [Bruno](https://www.usebruno.com/)
2. Open `bruno/digital-link-resolver/` as a collection
3. Select the `local` (localhost:8080) or `dev` (dev.epcis.cloud) environment
4. Run requests in sequence — the 4 folders cover products → EPCIS events → organizations → Digital Link resolution

---

## Contributing examples

When adding a new example, mirror the patterns above:

- Put master-data examples in `<module>/examples/`
- Put EPCIS events in `<module>/epcis/`
- Include a `_comment_gs1_alignment` array explaining the patterns
- Cite regulatory sources (`gs1:regulatoryAct`, regulation URLs, WR numbers)
- Use GS1 demo prefix 952 for demo/example identifiers
- Keep examples self-contained — don't cross-reference other example files
- Validate with `rapper` (TTL) and json-ld.org/playground (JSON-LD)
