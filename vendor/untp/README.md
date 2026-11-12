# UN Transparency Protocol artefacts (vendored)

Verbatim copies of the UNTP JSON Schemas and sample credentials published under
<https://untp.unece.org/artefacts/>, one directory per version. Written by `pnpm run sync:untp`
(`-- --latest` takes the newest version with published artefacts); nothing under `<version>/` is
edited. `<version>/MANIFEST.json` records the retrieval date, the SHA-256 of every file and the
artefacts the version does not publish.

| Version | Status | Note |
|---|---|---|
| 0.8.0 | newest published artefacts; the UNTP documentation lists it as work in progress towards 1.0 | no sample for the conformity credential; the traceability event refers to GS1's EPCIS 2.0.0 JSON Schema (vendor/gs1-epcis) |
| 0.7.0 | release whose public review closed in July 2026 | OpenEPCIS's bridge context `untp-0.7.0-context.jsonld` follows it |

Licence: CC BY 4.0 (UNTP specification). Used by the validation targets
`extensions/common/interop/targets/untp/<version>` (GITB types `x.untp-<version>.*`).
