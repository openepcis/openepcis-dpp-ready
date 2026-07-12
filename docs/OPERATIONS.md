# OpenEPCIS DPP — Operations Runbook

Deploy chains, seeding, guards, and the production gates for the DPP stack
(demo.epcis.cloud and the components behind it). Companion to
[`scripts/DEMO.md`](../scripts/DEMO.md) (the walkthrough) and the module docs.

## Components and deploy chains

| Component | Host | Source | Image / deploy path |
|---|---|---|---|
| GS1 Digital Link Resolver (DLR) | `id.demo.epcis.cloud` | `openepcis-digital-link-resolver` (submodule of `openepcis-build`) | demo runs the dedicated `:dlr-main-demo` tag (resolver main `d458050`, digest `sha256:ff90e47f…`, rollback digest `sha256:cfb36915…`) built by the branch-guarded `dlrdemo:dl:amd64` job on branch `deploy/dlr-main-demo`; deployed by **digest pin** (`kubectl -n openepcis-demo set image deploy/openepcis-digital-link digital-link=…@sha256:…`) |
| DPP API (EN 18223) | `dpp.demo.epcis.cloud` | `openepcis-dpp-api` (submodule) | `docker:dpp` → `:stable`; demo image needs the baked flags `-Ddpp.masterdata.backend=resolver`, `-Ddpp.access.backend=keycloak`, `-Dquarkus.oidc.enabled=true` |
| EPCIS 2.0 repository | `api.demo.epcis.cloud` | `openepcis-rest-quarkus` (build superproject) | `docker:rest` → `:stable` multi-arch manifest; demo deployed by **digest pin** on `openepcis-demo/openepcis-rest-api` |
| Vocabulary browser | `ref.openepcis.io` | `openepcis-web` `apps/ref-openepcis` + this repo's generated JSON | openepcis-web pipeline: `build:ref-openepcis` (clones dpp-ready main, runs its build) → `deploy:ref-openepcis` → `deploy:ref-openepcis-prod` (all manual) |
| Digital Data Management (DDM) | `demo.epcis.cloud` | `openepcis-web` `apps/digital-data-management` | `build:…-demo` → `deploy:…-demo` (Kaniko `:demo` tag) → rollout job — **then digest-pin** (see gotcha below) |

### Deploy gotchas (learned the hard way)
- **`:demo`/tag deploys with `imagePullPolicy: IfNotPresent` do not pull.** A
  `rollout restart` reuses the node-cached image. Always finish a DDM (or any
  tag-based) deploy by pinning the fresh registry digest with `kubectl set image`.
- **`zsh` reserves `USERNAME`.** Inline `USERNAME=x script.sh` is silently ignored;
  use `env USERNAME=x …` or the scripts' `SEED_USER` variable.
- **Submodule pointers must be pushed.** A superproject commit referencing a
  submodule SHA that exists on no remote breaks `maven:build` at fetch
  (`upload-pack: not our ref`). Amended-then-pushed twins are the classic cause.
- **Branch CI guards:** the `deploy/dlr-main-demo` branch carries branch-local
  guards in its own `.gitlab-ci.yml` so only `maven:build` + `dlrdemo:dl:amd64`
  run there — `:stable`/`:stable-ARCH` are never touched from a deploy branch.

## Seeding / provisioning (canonical)

`scripts/provision-demo.sh` is the **single provisioning entry point** (products
with embedded images, hero batch/item granularities, organizations, per-product
`gs1:epcisRepository` links, optional `--events` EPCIS capture with per-module
`GS1-Extensions` headers, verify):

```bash
env SEED_USER=demo-admin SEED_PW=… SEED_CLIENT_SECRET=… \
  scripts/provision-demo.sh --env=demo --events
```

Notes:
- **Sole-store resolver: seeding = reindex.** The DLR (main lineage) serves
  master-data exclusively from OpenSearch (`products-*`/`linksets-*`); it has no
  Postgres fallback. After deploying a fresh resolver, a full provisioning run
  populates the store. Until then, reads are empty.
- Products are delete-then-create per run (idempotent); the DLR deletes the whole
  GTIN tree (class + lot/serial rows), which the script compensates by re-PUTting
  the hero batch/item levels.
- The older seeders (`seed-dev-demo.sh`, `refresh-dev-demo.sh`,
  `upload-product-images.sh`, `seed-organizations.sh`, `seed-dev-passports.sh`)
  are deprecated shims kept for reference.
- Persona passwords are managed by `scripts/e2e-demo-users.sh` (writes
  `/tmp/epcis-demo-users.json`) and synced to Vaultwarden (org **OpenEPCIS**,
  collection *demo*) via `scripts/vault-sync-demo-users.sh` / `vault-sync-epcis.sh`.

## Build guards (this repo, all in `pnpm run build`)

| Guard | Catches |
|---|---|
| `check:vocab` | any `gs1:`/`schema:` reference not defined upstream (snapshot `scripts/vocab-snapshot.json`; refresh with `pnpm run sync:vocab`) |
| `check:granularity` | declared granularity vs GS1 Digital Link AIs |
| `check:identifiers` | GTIN/GLN mod-10 check digits (+ 952 demo-prefix advisory) |
| `check:domains` | any `gs1:` property used outside its declared `rdfs:domain`, or a string literal where a GS1 class value is required (snapshot `scripts/gs1-domains.json`) |
| `check:mappings` | SKOS mappings to semantically foreign upstream terms, inverted `broadMatch`/`narrowMatch` directions, superseded schema.org targets, kind mismatches, unverified SEMICeu targets (`scripts/semiceu-terms.json`) |

`tools/vocab-sync` (the AI mapping pipeline) writes to review branches only; every
applied branch must pass `pnpm run build` before review — the guards are the
deterministic net for anything the models get wrong.

## Production gates (deliberately held)

### EPCIS repository — prod tenant (`openepcis` ns, tag `:prod`)
**Held.** The prod tenant has not been updated in months and is missing: the
capture resilience + fail-closed fixes, the in-place `GS1-Extensions` `@context`
merge, the bundled extension schemas, and the converter URN-retention fixes.
Proposed promotion path (not built): a manual `docker:promote:prod` CI job that
retags the verified `:stable` manifest to `:prod`, followed by a digest-pin
rollout and the demo verification battery. Execute only with an explicit go.

### DLR — multi-tenant `:stable` (openepcis-build MR !83)
**Blocked on masterdata DLS.** The sole-store read path queries
`products-*`/`linksets-*` across all tenant indices and delegates isolation to
OpenSearch Document-Level Security. DLS currently covers only the EPCIS indices
(`epcis.cloud` platform, `opensearch-operator` module; tenants benelog/gs1de/
gs1global/gs1us). To unblock !83:
1. extend the `opensearch-operator` roles with `products-*`/`linksets-*` index
   patterns + the tenant DLS query template,
2. strip the resolver **default** OpenSearch client credentials (reads must run
   with the propagated user Bearer token; only the named `admin` client keeps
   basic-auth for writes/bootstrap),
3. security-bootstrap the clusters, then merge !83 and rebuild `:stable`.
The **single-tenant demo** does not need DLS and runs resolver main via the
`:dlr-main-demo` tag (see above).

## Open external threads
- `openepcis-reactive-event-publisher` PR #4 (parser `@context` robustness) —
  open upstream, maintainers' call.
- openepcis-build MR !78 (Quarkus LTS upgrade plan) — held.
- openepcis-web `GEN-1xx` branches — other tickets, untouched.
- DLR repo: stale task branches `GEN-220`, `GEN-233`, `GEN-322`, `GEN-413`,
  `gs1us-sscc-supprt` (6+ months old, likely superseded) — owner decision,
  listed here instead of deleted.
- DLR repo: 55 fully-merged remote branches are ready for deletion (list captured
  during the 2026-07 consolidation; `dev` and `main` excluded). One-liner, run as
  a maintainer from the resolver checkout:
  `while read b; do git push origin --delete "$b"; done < /tmp/dlr-branches-to-delete.txt`
