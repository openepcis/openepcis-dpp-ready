# GS1 EPCIS / CBV validation artefacts (vendored)

Verbatim copies of what GS1 publishes for EPCIS / CBV 2.0.1 on
<https://ref.gs1.org/standards/epcis/2.0.1/> (JSON Schema, SHACL shapes, EPCIS and CBV ontologies,
JSON-LD context), the 2.0.0 JSON Schema (UNTP 0.8.0's traceability event names it by its `$id`),
and the example documents of the standard's repository <https://github.com/gs1/EPCIS> (`JSON/`,
pinned by commit). Written by `pnpm run sync:epcis`; nothing under `<version>/` is edited.
`<version>/MANIFEST.json` records the commit, the retrieval date and the SHA-256 of every file.

Licence: the artefacts carry the GS1 IP policy (<https://www.gs1.org/standards/ip>) rather than a
software licence. This project treats them as freely redistributable, like Apache 2.0 (decision of
2026-11-12), as GS1 publishes them openly for implementers.

Used by the validation target `extensions/common/interop/targets/epcis/2.0.1` (GITB type
`x.epcis-2.0.1.document`), which also holds every OpenEPCIS EPCIS example to them.
