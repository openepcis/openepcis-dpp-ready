# Changelog — EU DPP Registry semantic data artifacts mirror

Upstream mirror: this module tracks the European Commission's DPP Registry semantic data
artifacts, not the OpenEPCIS DPP-Ready version.

## Sync log

### 2026-11-02 — upstream release 1.0.0 (initial mirror)

- Initial mirror of "DPP Registry – Semantic Data Artifacts" 1.0.0 (issued 2026-10-30; core,
  batteries and the subgroups evb, ind, lmt), archive SHA-256
  `46b753cdcdf11d3dba9d045c2c8410eabe41125c741e5240499c0ca0fccd2ddd`, by `pnpm sync:eu-dpp`.
  Seventeen SKOS vocabularies merged into `ontology/eu-dpp.ttl` (3169 triples, 294 concepts),
  the full release verbatim under `vendor/eu-dpp/1.0.0/` (78 files). Upstream licence EUPL-1.2.
