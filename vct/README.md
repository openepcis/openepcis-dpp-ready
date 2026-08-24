# VCT Registry — SD-JWT VC Type Metadata

Credential-type identifiers (`vct`) for SD-JWT verifiable credentials issued
across the OpenEPCIS platform, served at `https://ref.openepcis.org/vct/{name}`
(copied by ref-openepcis `copy:ontologies`, extension-less filenames).

These documents follow the Type Metadata format of
draft-ietf-oauth-sd-jwt-vc (`vct`, `name`, `description`, `display`,
`claims`). They are **not RDF** and deliberately live outside the ontology
modules: per the vocabulary decision of 2026-08-20 (no `oecvc` module),
SD-JWT credential types need no JSON-LD vocabulary — a `vct` is a stable,
dereferenceable type identifier whose metadata helps wallets and verifiers
render and request credentials. JSON-LD credentials (Data Integrity) keep
using `@context`-based types instead.

| vct | Issued by | Status |
|---|---|---|
| `employee` | Keycloak (oid4vc-vci, concept C7) | live on dev |
| `org-membership` | Keycloak (oid4vc-vci, concept C8) | live on dev |
| `dpp` | VC issuer (SD-JWT rendering of a DPP, concept C9) | planned |
| `epcis-event` | VC issuer (traceability attestation, concept C5) | planned |
| `product-masterdata` | VC issuer (resolver master data attestation) | planned |
| `organization-masterdata` | VC issuer (resolver master data attestation) | planned |
| `place-masterdata` | VC issuer (resolver master data attestation) | planned |

Changing a published `vct` identifier invalidates nothing cryptographically
but breaks type recognition in wallets — treat the names as frozen once a
credential of that type has been issued outside dev.
