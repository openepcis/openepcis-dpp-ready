# DPP Keystone validation artifacts (vendored)

Verbatim copy of the DPP Keystone v3 specification artifacts as published on
<https://dpp-keystone.org/spec/> (source: <https://github.com/dpp-keystone-org/DPPKeystoneOrg>):
JSON Schemas (core document schema, conditional sector schemas, shared definitions), the SHACL
shapes generated from the ontology (JSON-LD), the ontology, the JSON-LD contexts and the example
passports. Written by `pnpm run sync:keystone`; nothing under `<version>/` is edited.
`<version>/MANIFEST.json` records the repository commit current at the sync, the retrieval date and
the SHA-256 of every file.

Licence: CC0 1.0 (repository LICENSE).

Used by the validation target `extensions/common/interop/targets/keystone/v3` (GITB types
`x.keystone-v3.*`). The repository holds the sources with a `{{VERSION}}` placeholder and no SHACL;
the site holds what Keystone's build makes of them, which is what a Keystone document is checked
with, so the published files are vendored.
