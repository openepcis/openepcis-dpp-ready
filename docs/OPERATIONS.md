# OpenEPCIS DPP — Operations Runbook

Deploy chains, seeding, guards, and the production gates for the DPP stack
(demo.epcis.cloud and the components behind it). Companion to
[`scripts/DEMO.md`](../scripts/DEMO.md) (the walkthrough) and the module docs.

## Components and deploy chains

| Component | Host | Source | Image / deploy path |
|---|---|---|---|
| GS1 Digital Link Resolver (DLR) | `id.demo.epcis.cloud` | `openepcis-digital-link-resolver` (submodule of `openepcis-build`) | demo runs the dedicated `:dlr-main-demo` tag (resolver main, digest pinned in `demo.epcis.cloud/variables.tf` — keep tf default and live pin in sync or an unrelated apply rolls the deployment) built by the branch-guarded `dlrdemo:dl:amd64` job on branch `deploy/dlr-main-demo`; deployed by **digest pin** (`kubectl -n openepcis-demo set image deploy/openepcis-digital-link digital-link=…@sha256:…`) |
| DPP API (EN 18223) | `dpp.demo.epcis.cloud` | `openepcis-dpp-api` (submodule) | `docker:dpp` → `:stable`; demo image needs the baked flags `-Ddpp.masterdata.backend=resolver`, `-Ddpp.access.backend=keycloak`, `-Dquarkus.oidc.enabled=true` |
| EPCIS 2.0 repository | `api.demo.epcis.cloud` | `openepcis-rest-quarkus` (build superproject) | `docker:rest` → `:stable` multi-arch manifest; demo deployed by **digest pin** on `openepcis-demo/openepcis-rest-api` |
| Vocabulary browser | `ref.openepcis.io` | `openepcis-web` `apps/ref-openepcis` + this repo's generated JSON | openepcis-web pipeline: `build:ref-openepcis` (clones dpp-ready main, runs its build) → `deploy:ref-openepcis` → `deploy:ref-openepcis-prod` (all manual) |
| Digital Data Management (DDM) | `demo.epcis.cloud` | `openepcis-web` `apps/digital-data-management` | `build:…-demo` → `deploy:…-demo` (Kaniko `:demo` tag) → rollout job — **then digest-pin** (see gotcha below) |
| DPP conformance validator | not yet hosted | this repo's generated `gitb/validator-resources/shacl` | off-the-shelf `isaitb/shacl-validator` with that directory as `validator.resourceRoot`; locally `gitb/dev.sh up validators`. See [GITB_CONFORMANCE.md](GITB_CONFORMANCE.md) |

### The conformance validator depends on the vocabulary browser deploy

The GITB upload test cases take JSON-LD, so the validator resolves each passport's
`@context` from `ref.openepcis.io` — i.e. from whatever the *vocabulary browser* chain last
deployed. A passport is therefore judged against the deployed contexts, not the ones in
`main`.

That coupling has bitten once already: the `anyURI` coercion corrections were green in the
repo while `ref.openepcis.io` still served `"@type": "@id"`, so the same document expanded to
an IRI in the Test Bed and to an `anyURI` literal locally, and 16 examples "failed"
conformance for a reason that had nothing to do with them. **Run the `ref-openepcis` deploy
chain before publishing or submitting the test suite**, otherwise the suite reports our
deployment lag as the submitter's fault. The repo's own gates deliberately do not reproduce
this: `check:shapes:itb` sends pre-expanded N-Quads so it measures the shapes, not the
deployment.

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

### DLR — multi-tenant `:stable` (dev/prod rollout)
**DLS + ESPR tiers are BUILT and live-verified on demo** (2026-07-12); the
remaining gate is the DEV/PROD rollout, which needs a maintenance window:
1. **Pin the dev resolver by digest FIRST.** Dev runs the floating
   `:stable-amd64` tag with `IfNotPresent` — once `:stable` is rebuilt from
   resolver main, any pod reschedule silently pulls the sole-store image and
   dev master data (still in Postgres!) goes dark. Pin before rebuilding.
2. **Migrate dev tenant master data Postgres → OpenSearch** (real
   benelog/gs1de data — a migration, not the demo fixture reseed).
3. `tofu apply` the dev platform (submodule bump to platform `02d0741`+
   carries the tier DLS roles in `opensearch-operator`) — NOTE: the dev root
   has accumulated unapplied drift (image references, Keycloak health/metrics,
   CNPG monitoring, observability adds); review the whole plan, reconcile the
   image pins like on demo, do not apply blind.
4. Provision the `dpp-*` realm roles on the dev realm (`dpp-admin` composite
   of `dpp-restricted`), verify the EPCIS DLS regression (benelog/gs1de/
   gs1global unchanged) and run `scripts/verify-access-tiers.sh` against dev.
5. Then bump the resolver submodule on openepcis-build main (a FRESH MR —
   the old !83 targets the outdated d458050 and is superseded) TOGETHER with
   the openepcis-core submodule (>= f1a2452 — the resolver needs the
   GS1GermanyServicePlatformV1 wiring constructor), rebuild `:stable`,
   digest-pin dev.

## ESPR access tiers (live on demo)

Master-data documents carry an `accessLevel` keyword
(`Public`/`AuthorizedOnly`/`Restricted`, wire-identical to the DPP API's
`AccessLevel`); OpenSearch DLS enforces it:
- **anonymous** → `public_masterdata_role`: linksets unrestricted (resolution
  is public GS1 infrastructure), master data only at `Public`;
- **any authenticated realm user** → same public floor (mapped via the realm
  default roles — deliberately NOT `users:"*"`, which would drag the internal
  basic-auth admin into the DLS role and filter admin-client reads);
- **tenant role** (realm role = tenant, e.g. `demo`) → own-tenant documents
  except `Restricted`;
- **`<tenant>_restricted_role`** (`and_backend_roles [tenant, dpp-restricted]`;
  `dpp-admin` is a Keycloak composite of `dpp-restricted`) → own-tenant
  `Restricted`.
`AuthorizedOnly` is readable by EVERY authenticated tenant member (mirrors the
DPP API's AccessRoles — only writes need `dpp-writer`/`dpp-admin`). Writers
set the tier explicitly or the indexing chokepoint derives it from
`isAnonymousAccessAllowed` (Public ⇔ true, reconciled both ways).
Verification: `scripts/verify-access-tiers.sh` (persona matrix + public
resolution regression); tier probe products `09521000002005` (Restricted) and
`09521000002104` (AuthorizedOnly) are seeded by `provision-demo.sh`.

**Hard-learned:** (1) index mappings freeze at index creation — template
changes need `scripts/demo-reindex-masterdata.sh` (recreate indices + full
reseed), else DLS clauses match nothing; (2) per-request Bearer propagation
to OpenSearch only happens through the extension's request-scoped client —
the resolver's `DlrContextAwareOpenSearchClient` selects it; a directly
injected client reads anonymously.

### Field-level security (FLS) — plugin semantics, verified empirically

Spiked against OpenSearch 2.18 (security plugin 2.18.0.0, single node,
internal test users/roles; 2026-07-24). The multi-role combination rules are
NOT the intuitive "visible if any role allows":

1. **Exclude-form (`~field`) accumulates across roles** — visibility is the
   INTERSECTION. A field excluded by any one of the user's roles stays hidden,
   even when every other role omits it.
2. **A role without FLS does not re-open anything** — combined with an
   FLS-bearing role on the same index pattern, the FLS list still applies
   (an include-list role + a no-FLS role = clamped to the include list).
3. **Include-form (allowlist) UNIONS across roles** — a user with includes
   {A} and {A,B,C} sees {A,B,C}. This is the only form with usable
   tier-lattice semantics.
4. FLS filters unmapped `_source` fields and nested dot-paths
   (`~nested.deepSecret`) correctly — mappings (`dynamic:false`) don't limit it.
5. FLS closes the query-probing oracle: a term query on an FLS-hidden mapped
   field returns 0 hits for the restricted persona (1 hit for admin).

**Design consequence:** native FLS can tier ONLY personas that map to a
single effective role set with one allowlist — i.e. anonymous
(`public_masterdata_role` gets the include-form Public-field allowlist, which
is also fail-closed for unclassified fields). Authenticated operators need
"everything except Restricted fields, including unknown custom fields" —
inexpressible as an include list and broken as an exclude list (rule 1
clamps `<tenant>_restricted_role` holders too, who also hold the tenant
role). Operator/authority field tiering therefore happens in the resolver's
app-layer projection (`TierFieldFilter`), and once the Public allowlist
lands on `public_masterdata_role`, authenticated users must STOP mapping to
that role (rule 2 would clamp them to Public fields): drop the realm-default
mapping and widen the tenant-role DLS to
`(defaultGroup == tenant AND accessLevel != Restricted) OR accessLevel == Public`.

**Reconcile caveat:** the demo applies its securityconfig via a
`securityadmin.sh` full reload from the `opensearch-security-config`
ConfigMap (see `opensearch-securityadmin-script`) — every deploy/apply
REVERTS runtime role changes. The resolver's `POST /field-access/sync`
(pushes the anonymous Public-field allowlist to `public_masterdata_role`)
must be re-invoked after every securityconfig apply.

## GS1-DE Service Platform integration

Two capability areas (sources in
`openepcis-build/modules/openepcis-core/openepcis-gs1de-service-platform/`):
- **Verified-by-GS1** — fully implemented: verify_ids/gtins/glns + licensee
  search, OpenSearch cache `gs1-verified-ids` (7d TTL), REST facade
  `/gs1verifier/**`, resolver inbound import (`/sync/{key}`) and the
  GCP-length SPI.
- **Central resolver population** (id.gs1.org / id.gs1.de ResolutionRules/
  Targets) — client APIs generated and per-token wiring ready
  (`Gs1DeServiceGateway.ruleApiFor/targetApiFor`), **push subscriber is a
  follow-up feature** (mapping linkset→ResolutionRule + probe against the
  GS1-DE test environment; must run under the licensee's token, never the
  platform token).

Outbound product sync (GEN-446, OpenSearch edition): flag
`openepcis.gs1de-outbound-sync.enabled` (default OFF); per-GCP client
registry `gs1de-clients-<group>` managed via `/gs1de/clients` (secrets
write-only/masked; admin group only), attempts + per-GCP usage metering in
`sync-operations-<group>` (`/gs1de/clients/{name}/usage`). Both indices are
deliberately in NO DLS role (admin client only). Activation is an explicit
ops step: register clients (licenceKey + authToken per GCP), set the flag,
probe against the GS1-DE test environment. Known follow-ups: no retry sweeper
for FAILED_RETRYABLE yet (fire-and-forget vs the old SQL outbox) and no
ILM/retention on sync-operations.

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
