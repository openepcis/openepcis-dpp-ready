# EU DPP Registry semantic data artifacts (vendored)

Verbatim copy of the European Commission's "DPP Registry – Semantic Data Artifacts", as published
on the DPP resources page
(<https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/resources-documentation_en>).
Written by `pnpm run sync:eu-dpp`; nothing under `<version>/core` and `<version>/product` is edited.
`<version>/MANIFEST.json` records the archive hash and the SHA-256 of every file.

| Release | Issued | Archive SHA-256 | Content |
|---|---|---|---|
| 1.0.0 | 2026-10-30 | `46b753cdcdf11d3dba9d045c2c8410eabe41125c741e5240499c0ca0fccd2ddd` | core, batteries, subgroups evb / ind / lmt: SKOS vocabularies, SHACL shapes per view (pub, res1, res2, res3), JSON Schemas, JSON-LD contexts, conformance examples |

Licence: EUPL-1.2, as stated in every vocabulary.

The SKOS vocabularies are also merged into the upstream module
[`extensions/upstream/eu-dpp`](../../extensions/upstream/eu-dpp/README.md), which the build,
the vocabulary browser and vocab-sync read. The OpenEPCIS dpp-api validates its
`representation=eu` output against the JSON Schemas of this release.

## Why a copy is needed

Every `$id`, `$ref`, `@context` and concept IRI in these files points at
`https://repository.product-passport.ec.europa.eu/…`. On 2026-11-02 that host had no DNS record
(NXDOMAIN from the zone's authoritative name servers and from public resolvers), so nothing in the
release can be resolved remotely. Consumers map the prefix onto this directory.

## Known inconsistencies in release 1.0.0

Checked against the release itself, the Semantic Data Guide and the Registry API Integration Guide:

- The Semantic Data Guide announces XSDs; the archive contains none.
- The guide writes `contentSpecificationIds` as `…/core/releases/{SemVer}`; the JSON Schema pattern
  and every example use `…/core/{SemVer}`. The schema is what validates.
- `multiLanguage` keys must match `^[A-Za-z]{2}-[A-Za-z]{2}$`, so a plain BCP 47 tag such as `en`
  is rejected.
- The temperature range of the minimal, nominal and maximum voltage is required by the schema,
  while Annex XIII 1(h) of Regulation (EU) 2023/1542 and the Commission's own data-point guidance
  ask for it "when relevant".
- The model identifier is only accepted together with a batch number (`dependentRequired`), so a
  passport at model level cannot carry its model identifier.
- The measurement-unit vocabulary holds eleven units, without kilowatt or any energy unit, while the
  data-point guidance (version 3.2, footnote 2) says multiples and submultiples of each unit are
  allowed.
- The Registry API names the EV subgroup `EV`, the semantic repository `evb`.
- The granularity is an IRI in the passport and a plain string in the Registry submission API.
- The contexts end in an `@vocab` catch-all (`unknown#`), so an undeclared key expands silently
  instead of failing.

The Commission's own conformance examples do validate against the schemas of the release.
