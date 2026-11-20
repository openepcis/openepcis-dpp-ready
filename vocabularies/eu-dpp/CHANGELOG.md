# Changelog — EU DPP Registry semantic data artifacts mirror

Upstream mirror: this module tracks the European Commission's DPP Registry semantic data
artifacts, not the OpenEPCIS DPP-Ready version.

## Sync log

### 2026-11-10 — JSON view: data elements as properties

- No upstream change. `json/eu-dpp.json` no longer lists the 110 data elements as values of
  three enumerations: the 109 used as `sh:path` in the Commission's shapes are properties (domain
  from the shape's target class, range from `sh:datatype`, `sh:class`, `sh:node` or the concept
  scheme a SPARQL constraint restricts the value to), `DigitalProductPassport` is a class. Value
  lists and error codes stay enumerations (14). `build-json.ts` option `shapesDir`.

### 2026-11-02 — upstream release 1.0.0 (initial mirror)

- Initial mirror of "DPP Registry – Semantic Data Artifacts" 1.0.0 (issued 2026-10-30; core,
  batteries and the subgroups evb, ind, lmt), archive SHA-256
  `46b753cdcdf11d3dba9d045c2c8410eabe41125c741e5240499c0ca0fccd2ddd`, by `pnpm sync:eu-dpp`.
  Seventeen SKOS vocabularies merged into `ontology/eu-dpp.ttl` (3169 triples, 294 concepts),
  the full release verbatim under `vendor/eu-dpp/1.0.0/` (78 files). Upstream licence EUPL-1.2.
