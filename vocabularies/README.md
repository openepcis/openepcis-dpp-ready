# External vocabularies

The ontologies in this folder are published by other organisations. OpenEPCIS DPP-Ready vendors
them so that

- `pnpm run check:mappings` can verify every SKOS mapping against the real upstream term,
- the crosswalks and validation targets under `extensions/common/interop/` can read them offline,
- [ref.openepcis.org/vocabularies](https://ref.openepcis.org/vocabularies) can list them and show
  how the OpenEPCIS extension terms distribute across them.

They are **not** EPCIS extensions. Nothing under `extensions/` is derived from them, no JSON-LD
context, JSON Schema or SHACL shape is generated for them, and their namespaces stay exactly as
published. The OpenEPCIS extensions are the golden set; these vocabularies are what the golden
set is anchored to with `rdfs:seeAlso` and graded SKOS relations.

| Folder | Publisher | Sync | Namespace |
|--------|-----------|------|-----------|
| `gs1-rail/` | GS1 AISBL / GS1 Switzerland | `pnpm run sync:rail` | `https://gs1-epcis-reg.org/rail/voc/data#` |
| `cirpass2-eudpp/` | CIRPASS-2 / TalTech | `pnpm run sync:eudpp` | `https://w3id.org/eudpp#` |
| `cirpass2-textile/` | CIRPASS-2 (task T3.2, GS1 in Europe) | `pnpm run sync:cirpass2-textile` | `https://w3id.org/eudpp/textile-<module>#` |
| `cirpass2-battery/` | CIRPASS-2 | `pnpm run sync:cirpass2-battery` | `https://w3id.org/eudpp/battery#` |
| `eu-dpp/` | European Commission, DG GROW | `pnpm run sync:eu-dpp` | `https://repository.product-passport.ec.europa.eu/…/vocabs/*#` |

Each folder keeps the upstream `VERSION`, a dated sync log in `CHANGELOG.md`, the ontology under
`ontology/` and the generated browsing view under `json/`. GS1 Rail additionally carries the
served `context/rail-context.jsonld`, frozen at the version stored documents expand against, and
the upstream SHACL shapes. Raw upstream snapshots that feed the build scripts live under
[`vendor/`](../vendor/).
