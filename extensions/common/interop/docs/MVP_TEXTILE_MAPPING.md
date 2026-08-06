# "MVP Textile DPP v2" — mapping and gap analysis

**Source:** the JSON Schema "MVP Textile DPP v2" of a commercial DPP platform
(Semantic Treehouse export, obtained 2026-08-06 in a CIRPASS-2 pilot context). It is
a **plain JSON Schema with no RDF terms, no `@context`, and no published license** —
so nothing is vendored into this repository; this document and the bridge context
reference the schema's field names only, and the provider is deliberately not named.

**Bridge context:**
[`../context/mvp-textile-bridge-context.jsonld`](../context/mvp-textile-bridge-context.jsonld)
— apply it **out-of-band** to a validated MVP instance to lift it to OpenEPCIS/GS1
linked data (the MVP schema is closed, see pitfall 2, so the context cannot travel
inside the document).

## Pitfalls in the MVP as published

1. **The published sample does not validate against the published schema.**
   `materialComponent` is declared `"type": "string", "format": "uri-reference"`, but
   the sample carries an object (`{}`). Consumers must expect either form.
2. **`additionalProperties: false` at every level.** No `@context`, no extension
   fields, no coexistence with any other profile inside one document. Any linked-data
   lift must be applied out-of-band (as this bridge does).
3. **Identifier-scheme confusion.** `productIdentifierScheme` enumerates
   `GS1 | GTIN | SKU ID` — "GS1" is an organisation, GTIN is the GS1 scheme; the two
   overlap. The company/operator/facility scheme enums (`GLN | EORI | OS_ID`) are
   internally consistent but appear in different orders per object.
4. **Invalid `$id`.** The schema's `$id` is a vendor URN containing a space — not a
   valid URN; the schema is not dereferenceable.
5. **Scale ambiguity.** `materialPercentage` / `recycledContent` are bare numbers with
   "percentage" descriptions (sample value 3.1). OpenEPCIS ratio properties
   (`oec:massFraction`, `oec:recycledContent`) are **0–1 decimals**. The bridge maps
   the IRIs; the consumer must divide by 100 when the source is percent — the schema
   itself does not say.
6. **Passport status vocabulary mismatch.** `lifecycleState` is `Inactive | Active`;
   EUDPP `dppStatus` and `oec:PassportStatus` use draft/active/archived. The bridge
   maps the property; the values need a lookup (`Inactive` is ambiguous between draft
   and archived).
7. **Single-tier supply chain.** `Supply_chain` holds exactly one `Operator` and one
   `Facility` (Tier 1), no arrays — multi-tier traceability cannot be expressed.
8. **Flattened address.** `postalAddress` is one string
   ("Address 1/Address 2/Zip code/City/Country").

## Mapping (theirs → ours)

Structural containers `Supply_chain` and `DPP_metadata` map to `@nest` (JSON-LD 1.1),
so their children expand as direct properties of the product node.

| MVP key | OpenEPCIS/GS1 term | Confidence |
|---|---|---|
| `taricCode` | `oec:customsCommodityCode` | exact |
| `productId` | `gs1:productID` | exact |
| `conformityDeclaration` | `oec:hasConformityDeclaration` | exact |
| `Manufacturer_BrandOwner` | `gs1:manufacturer` | exact |
| `brandName` | `gs1:brandName` | partial (GS1 puts it on a `gs1:Brand` node via `gs1:brand`; a flat string needs that wrapping on normalisation) |
| `companyName` | `gs1:organizationName` | exact |
| `companyIdentifier` | `oec:economicOperatorId` | exact |
| `companyRegistration` | `schema:vatID` | partial (source mixes org no. / VAT no.) |
| `ContactDetails` | `gs1:contactPoint` | exact |
| `postalAddress` | `schema:address` | partial (flattened string, pitfall 8) |
| `emailAddress` | `gs1:email` | exact |
| `phoneNumber` | `gs1:telephone` | exact |
| `Supply_chain` | `@nest` (structural) | — |
| `Operator` | `oec:hasOperatorInformation` | exact |
| `operatorIdentifier` | `oec:economicOperatorId` | exact |
| `operatorName` | `gs1:organizationName` | exact |
| `Facility` | `oec:hasFacilityInformation` | exact |
| `facilityIdentifier` | `oec:facilityId` | exact |
| `facilityName` | `schema:name` | exact |
| `countryOfOrigin` | `schema:addressCountry` | partial (facility country, not product origin — `gs1:countryOfOrigin` is Product-scoped) |
| `MaterialComposition` | `oec:hasMaterialComposition` | exact |
| `materialComponent` | `oec:componentName` | exact (mind pitfall 1) |
| `materialType` | `schema:name` | exact |
| `materialPercentage` | `oec:massFraction` | partial (scale, pitfall 5) |
| `recycledContent` | `oec:recycledContent` | partial (scale, pitfall 5) |
| `DPP_metadata` | `@nest` (structural) | — |
| `passportId` | `oec:passportIdentifier` | exact |
| `dppUrl` | `gs1:dpp` | exact (GS1 Digital Link linkType for the passport) |
| `lifecycleState` | `oec:passportStatus` | partial (value list, pitfall 6) |

**Coverage theirs → ours: 22 of 28 leaf fields mapped (79%), 6 partial.**

## Unmapped (theirs) — dropped on expansion, by design

| Key | Why unmapped | Path forward |
|---|---|---|
| `productIdentifierScheme`, `companyIdentifierScheme`, `operatorIdentifierScheme`, `facilityIdentifierScheme` | In the OpenEPCIS profile the scheme is carried by the identifier's syntax (GS1 Digital Link URI, GLN check digit), not a sibling enum. No upstream term for a detached scheme flag; EUDPP's IDENT module models schemes as first-class nodes, which these flat enums do not populate. | If a second source needs it, consider `adms:Identifier`/`skos:notation` structure or EUDPP IDENT alignment — not a new flat `oec:` term. |
| `registryIdentifier` | "Returned from EU Registry" — the EU DPP registry interface is not final; minting a term now would guess its shape. | Candidate `oec:` term once the registry API is published. |
| `dppBackupUrl` | Nearest term `oec:hasBackupCopyHost` (ESPR Art. 10(4)) ranges over the *host operator*, not a URL — mapping a bare URL there would type-clash. | Model the backup host as `oec:OperatorInformation` with the URL as its contact/link. |

## Unmapped (ours) — what the MVP cannot carry

The MVP covers identification, one-tier supply chain, care-label composition and
passport plumbing. It has **no** fields for: fiber certifications and origin
(`eutex:`), care instructions (ISO 3758), durability/repairability and the JRC
robustness/recyclability scores, substances of concern (`oec:SubstanceOfConcern`),
emissions/carbon footprint, circularity beyond one recycled-content number, access
control (`oec:AccessRights`), or any EPCIS event linkage. Coverage ours → theirs is
accordingly low; the MVP is a floor, not a profile.

## Verification

The bridge was verified by expanding the published sample (with `materialComponent`
corrected to a string per pitfall 1) through the context: all 22 mapped fields expand
to the intended IRIs; exactly the 6 documented unmapped keys drop.

## Reference example — the same field domain done right

[`../../../eu/textile/examples/eudpp-textile-passport.jsonld`](../../../eu/textile/examples/eudpp-textile-passport.jsonld)
carries everything the MVP attempts, in the CIRPASS-2 / EUDPP shape with GS1 behind
it: GS1 Digital Link as the identifier backbone (`01/{GTIN}` passport IRI,
`417`/`414` party and facility IRIs with check-digit-valid GLNs), TARIC as
`oec:customsCommodityCode`, GLN-identified manufacturer and tier-1 facility
(EUDPP ACTOR), GS1-native care-label composition (`gs1:textileMaterial`, EUDPP MAT),
a typed EU Declaration of Conformity document (EUDPP COMP), and passport metadata
including the ESPR Art. 10(4) backup host as a real `oec:OperatorInformation`
(EUDPP P_DPP `dppStatus` / `hasBackUpCopyHost`) — instead of a bare URL. The EUDPP
alignment is carried by the ontology (`rdfs:seeAlso` + audited SKOS), so the document
itself stays pure GS1 + `oec:`/`eutex:` and passes every repository guard
(operational round-trip, granularity vs Digital Link, check digits, GS1 domains).
