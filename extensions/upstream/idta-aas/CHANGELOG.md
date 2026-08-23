# Changelog — IDTA AAS semanticId registry

Upstream registry: this module tracks the IDTA submodel-template semanticIds
emitted by the OpenEPCIS AAS builders, not the OpenEPCIS DPP-Ready version.
The VERSION file carries the curation version; the upstream template versions
are recorded per entry.

## Curation log

### 2026-08-23 — 0.1.0 (initial registry, phase-0 builder surface)

- Initial registry of the semanticIds the OpenEPCIS AAS phase-0 builders emit:
  Digital Nameplate for Industrial Equipment 3.0 (IDTA 02006-3-0,
  `https://admin-shell.io/idta/nameplate/3/0/Nameplate`, six IEC CDD elements),
  ContactInformations 1.0 (IDTA 02002-1-0,
  `https://admin-shell.io/zvei/nameplate/1/0/ContactInformations`, eight ECLASS
  elements), DPP Metadata (`https://admin-shell.io/idta/cds/dppMetadata/1` with
  three header properties), plus the AAS meta-model `globalAssetId` anchor.
- Graded SKOS mappings to the GS1 Web Vocabulary terms the builders read;
  the canonical GS1 Digital Link URI is the identity bridge
  (`skos:exactMatch gs1:productID` at all four AAS anchor points).
- Upstream templates CC BY 4.0, (c) Industrial Digital Twin Association.
