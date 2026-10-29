# Changelog — CIRPASS-2 Textile Ontology mirror

Upstream mirror: this module tracks the CIRPASS-2 Textile Ontology releases
(github.com/CIRPASS-2/ontologies-docs, w3id.org/eudpp/textile-*), not the
OpenEPCIS DPP-Ready version.

## Sync log

### 2026-10-29 — upstream Version 1.1.2 (initial mirror, ontologies-docs @ a41561d)

- Initial mirror of the CIRPASS Textile Ontology 1.1.2 (issued 2026-07-16;
  umbrella `https://w3id.org/eudpp/textile-ontology` over twelve modules and two
  code lists), copied verbatim from `Textile/textile-ontology-complete/ontology.ttl`
  by `pnpm sync:cirpass2-textile` (9307 quads, 839 named subjects under
  `https://w3id.org/eudpp/textile-*#`). Upstream licence CC BY 4.0.
- Colliding local names across modules are published as `<module>.<name>` by the
  build (15 of them); the IRIs are untouched.
