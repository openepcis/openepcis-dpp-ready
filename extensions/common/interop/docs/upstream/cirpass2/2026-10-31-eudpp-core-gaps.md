# Draft issue for CIRPASS-2/ontologies-docs: EUDPP core data that does not round-trip

Status: draft, not filed. Repository: `CIRPASS-2/ontologies-docs` (CORE modules ACTOR, P_DPP,
MAT, SOC, COMP, LCA). Companion of
[#3](https://github.com/CIRPASS-2/ontologies-docs/issues/3) (textile assessment).

---

**Title:** EUDPP core 2.1.0: what a complete product passport cannot express (found by a round-trip converter)

**Summary**

We convert complete Digital Product Passports between our EPCIS-based vocabulary (OpenEPCIS
DPP-Ready) and EUDPP core 2.1.0 in both directions, with round-trip tests over passports of
several sectors (textile, electronics, construction products, steel) and a passport written in
EUDPP terms only. Product, DPP, identifiers, actors and roles, materials, substances of concern,
declaration of conformity, quantities, carbon footprint, EPD results and product events map
closely. The points below are what we had to carry in other vocabularies (schema.org, GS1 Web
Vocabulary, Dublin Core) or could not carry at all. Most are small additions.

**1. A facility has no name and no address.**
`Facility` has an identifier and `isUsedByActor`, nothing else. A passport naming the
manufacturing site cannot say what or where it is.
*Proposal:* `facilityName`, and a location link like `isEstablishedIn` for facilities.
*We carry:* `schema:name`, `schema:address`.

**2. An actor's location has no structure; an actor has no contact point.**
`isEstablishedIn` points to `dcterms:Location` without saying how an address is written. ESPR
Art. 27(6) asks for a postal address and an electronic means of contact.
*Proposal:* name the address properties (e.g. LOCN `locn:address`, or schema.org), and a contact
point property.
*We carry:* `schema:PostalAddress` on the location, `schema:contactPoint`.

**3. Recycled content of the product as a whole.**
`materialRecycledContent` and `materialRecycledContentType` are per material. Delegated acts state
recycled content per product (total, pre-consumer, post-consumer), and `RecycledMaterialsUseResult`
is an LCA inventory result without a pre/post distinction.
*Proposal:* a product-level recycled-content property with the existing content-type values.
*We carry:* one `RecycledMaterialsUseResult` per value, pre/post marked with `dcterms:type`.

**4. Circularity indicators beyond the three rates.**
`CircularEconomyIndicator` has `RecyclingRate`, `RecoverableRate` and `RecyclingCollectionRate`.
Recyclable content, the Material Circularity Indicator and its utility factor have no class.
*We carry:* `CircularEconomyIndicator` with `dcterms:type`.

**5. DPP status values.**
`dppStatus` allows Active, Archived, Inactive, Invalid. A passport in preparation (draft) or one
suspended or withdrawn by its issuer has no value.

**6. Document content type.**
`contentType` allows "pdf" and "application" only, which leaves out HTML instructions, images and
video (ESPR Art. 27(7) digital instructions) and does not say which application type.
*Proposal:* a media-type string (IANA), with "pdf"/"application" as legacy values.
*We carry:* `dcterms:format` for any other media type.

**7. A regulation the product does not (yet) comply with.**
`isConformWith` states conformity. A passport that lists applicable legislation including one
whose conformity is pending has no slot for it.
*We carry:* `dcterms:relation` to the `UnionHarmonisationLegislation`.

**8. Carbon-footprint stages that are not EN 15804 modules.**
The Battery Regulation (Annex II) and PEF report life-cycle stages (raw material acquisition,
main production, distribution, end of life). `LCAModuleValue.forLifeCycleModule` accepts EN 15804
modules only.
*Proposal:* allow other life-cycle stage schemes for `forLifeCycleModule`.
*We carry:* `LCAModuleValue` with `dcterms:type` naming the stage.

**9. The country a material comes from.**
`MaterialOrigin` distinguishes raw, recycled and renewable. Several delegated acts and supply-chain
rules ask for the country of origin of a material.
*We carry:* `schema:countryOfOrigin`.

**10. Voluntary certifications.**
`ConformityCertificate` models certificates of conformity-assessment bodies. Voluntary scheme
certificates of a product, material or site (GRS, OCS, OEKO-TEX, SA8000) have no class.
*We carry:* GS1 Web Vocabulary `CertificationDetails`, unchanged.

**11. Product data with no core term.**
Access rights per attribute (ESPR Art. 10(1)(d)), repairability information (spare-part
availability, repair network), extended producer responsibility registration, a due-diligence
report. Some may belong in sector modules; access rights belong in the core.
*We carry:* the due-diligence report as a `DocumentFormattedProperty`; the rest is not carried.

**12. The role of a facility for a product.**
`hasFacility` does not say what the facility did for the product (cut and sew, dyeing, assembly).
Textile 1.1.2 has process executions for this; the core has no counterpart.

**Side notes**

- `GLN` is declared an `ActorIdentifierScheme` only; there is no `FacilityIdentifierScheme`
  individual, although GLNs identify facilities as well. We use `GLN` for facilities.
- `manufacturingDate` has no range; we use `xsd:date`.

**Test material**

The round-trip cases, expected outputs and per-case loss reports will be published with our next
release under `extensions/common/interop/crosswalk/cirpass2/tests/` (cases `core-*` and
`cirpass2-core-in`) in https://github.com/openepcis/openepcis-dpp-ready.
