# EPCIS-driven DPP master-data demo

Four runnable flows that prove an OpenEPCIS DPP-Ready deployment can:

1. **register** GTIN/GLN identifiers in a GS1 conformant Digital Link
   Resolver (DLR) with their master data, and
2. **update** the registered DPP master data via captured EPCIS 2.0
   events flowing through the existing Kafka-based message infrastructure.

Everything is plain JSON-LD over GS1 Web Vocabulary + GS1 EPCIS 2.0 — no
SAMM, no proprietary side-payloads. The same master-data documents are
served by the DLR and spliced into events as `masterDataAvailableFor`.

## The four flows

| Flow | Event | What it shows |
|---|---|---|
| `battery-commission` | `ObjectEvent` ADD, bizStep `commissioning` | First sighting of `https://id.gs1.org/01/09521234000013/21/BAT2024-001` — registers GTIN + GLN + manufacturer in the DLR, splices the same card into the event under `masterDataAvailableFor`, plus initial sensor readings |
| `battery-state-of-health` | `ObjectEvent` OBSERVE, bizStep `inspecting` | Lifecycle update on the same battery — no `masterDataAvailableFor` (already registered), updated SoH/SoC/cycleCount on `sensorElementList` mutate the DPP |
| `textile-garment-transform` | `TransformationEvent` | Three input lots (fabric / down / trim) → finished garment; registers the garment GTIN with `textile:textileCategory`, `textile:apparelSubcategory`, `textile:fabricType`, `gs1:textileMaterial` composition |
| `textile-durability` | `ObjectEvent` OBSERVE, bizStep `inspecting` | Laboratory test result — `textile:robustnessAssessment` carried at event level (per the §2B rule) updates the garment DPP |

All flows use GS1 demo prefix `952` (GCP `9521234`), matching the
existing examples in `extensions/eu/battery/epcis/` and
`extensions/eu/textile/epcis/`.

## How it fits together

```
flows/<flow>.input.json       ──► tools.openepcis.io  ──► out/<flow>.raw.jsonld
                                                                  │
flows/<flow>.masterdata.jsonld ─┐                                 │
                                ├─► merge-masterdata.ts ──────────┤
                                │                                 ▼
                                │                       out/<flow>.final.jsonld
                                │                                 │
                                │                                 ▼
                                │             api.epcis.local:8443/capture
                                │                  (with GS1-Extensions header)
                                │                                 │
                                │                                 ▼
                                │                       Kafka ── OpenSearch
                                │
                                └─► seed-dlr.ts ──► id.epcis.local:8443
                                                          (Product + LinkSet)
```

The same `*.masterdata.jsonld` sidecar feeds both the DLR seed (as
served via content-negotiation on the GS1 Digital Link) and the
`masterDataAvailableFor` block inside the captured event.

> Why the merge step exists at all: the public testdata-generator's
> input DTO has no `masterDataAvailableFor` field. It supports `@context`
> overrides, `ilmd`, `userExtensions[].rawJsonld`, `sensorElementList`,
> and structured WHO/WHERE/WHY fields, but master data is post-processed.

## Prerequisites

The demo targets the local **Colima Kubernetes** deployment of
`openepcis-platform`. Bring the cluster up once before running flows:

1. Follow `epcis.cloud-dev/openepcis-platform/docs/local-development.md`:
   `colima start --kubernetes …`, `mkcert -install`, edit
   `environments/local/terraform.tfvars`, `tofu apply`,
   `./scripts/dev/port-forward.sh openepcis`.
2. Add the `/etc/hosts` entries from `env/hosts.example`.
3. Confirm `https://api.epcis.local:8443/q/health` and
   `https://id.epcis.local:8443/q/health` answer 200.

Then in this directory:

```bash
pnpm install
cp env/local.env.example .env.local   # adjust if your endpoints differ
```

## Running

End-to-end (seed-dlr → generate → merge → capture → verify):

```bash
pnpm demo:battery:commission
pnpm demo:battery:soh
pnpm demo:textile:transform
pnpm demo:textile:durability
# or all four:
pnpm demo:all
```

Smoke-test against `tools.openepcis.io` only (no cluster needed —
useful for iterating on the input templates):

```bash
SKIP_CLUSTER=1 pnpm demo:battery:commission
ls out/    # battery-commission.raw.jsonld, battery-commission.final.jsonld
```

Individual stages (each accepts an optional flow name; default is all):

```bash
pnpm generate battery-commission
pnpm merge battery-commission
pnpm seed-dlr battery-commission
pnpm capture battery-commission
pnpm verify battery-commission
```

## What the merge step does

`scripts/merge-masterdata.ts` reads the sidecar, transforms each card
under `masterData[]`, and assigns the result to
`event.masterDataAvailableFor` on every event in the generated document.

The transform follows
[`extensions/common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md`](../../extensions/common/core/docs/EPCIS_MASTERDATA_AND_EXTENSIONS.md)
§2A: keys prefixed with `gs1:` are emitted **bare** inside an EPCIS
event (they resolve via the EPCIS context's `@vocab`); keys with other
prefixes (`battery:`, `textile:`, `dpp:`) **keep** their prefix.

The sidecar itself uses `gs1:` prefixes everywhere because it's served
as a stand-alone WebVoc-pattern master-data file from the DLR (Angle 2 of
the doc above), not embedded in an EPCIS context.

## Verifying

`scripts/verify.ts` runs per-flow checks and logs `[PASS]` / `[FAIL]`
per step:

- DLR round-trip: `GET /<digital-link>?linkType=gs1:masterData` returns
  the registered card.
- Repository query: `GET /events?MATCH_anyEPC=<epc>` returns the captured
  event(s) for the EPC.

Additional verification you can run by hand:

```bash
# JSON-LD expansion (zero orphan keys)
npx -y jsonld expand out/battery-commission.final.jsonld | jq .

# Diff against the committed example
diff <(jq -S '.epcisBody.eventList[0]' out/battery-commission.final.jsonld) \
     <(jq -S '.epcisBody.eventList[0]' ../../extensions/eu/battery/epcis/commissioning.jsonld)

# Battery-Pass v1.3 conformance harness on the merged event
cd ../..
npx tsx scripts/test-batterypass-conformance.ts demos/epcis-driven-dpp/out/battery-commission.final.jsonld
```

## Loading a flow into the Test Data Designer UI

Each `flows/<flow>.input.json` (the API DTO) is auto-converted by
`scripts/to-designer.ts` into `flows/designer/<flow>.designer.json` —
the Drawflow-design shape that
`https://tools.openepcis.io/ui/event-data-designer/?url=<raw-url>` loads.
The conversion runs as the last step of every `pnpm demo:*` command, so
the designer files stay in sync with the API templates.

Push the branch, then open these URLs in a browser
(`pnpm designer-urls` prints them; override repo/branch with
`REPO_OWNER=… REPO_BRANCH=…`):

| Flow | Designer URL |
|---|---|
| battery-commission | `https://tools.openepcis.io/ui/event-data-designer/?url=https://raw.githubusercontent.com/openepcis/openepcis-dpp-ready/main/demos/epcis-driven-dpp/flows/designer/battery-commission.designer.json` |
| battery-state-of-health | …`/battery-state-of-health.designer.json` |
| textile-garment-transform | …`/textile-garment-transform.designer.json` |
| textile-durability | …`/textile-durability.designer.json` |

When the URL loads, you should see identifier nodes wired into a single
event node on the Drawflow canvas; clicking the event opens the same
WHO/WHERE/WHY editor the GS1 Implementation-Guideline templates use.
Hitting **Generate** in the UI produces an EPCIS document equivalent to
`out/<flow>.raw.jsonld` (i.e. without `masterDataAvailableFor`, which our
local merge step still has to splice in).

## Layout

```
demos/epcis-driven-dpp/
├── flows/
│   ├── battery-commission.input.json          # testdata-gen API template
│   ├── battery-commission.masterdata.jsonld   # sidecar (= DLR record)
│   ├── battery-state-of-health.input.json
│   ├── textile-garment-transform.input.json
│   ├── textile-garment-transform.masterdata.jsonld
│   ├── textile-durability.input.json
│   └── designer/                              # Drawflow-design shape
│       └── *.designer.json                    # auto-generated; uploadable to UI
├── scripts/
│   ├── generate.ts             # POST template to tools.openepcis.io
│   ├── merge-masterdata.ts     # splice masterDataAvailableFor
│   ├── to-designer.ts          # convert API template → Drawflow-design shape
│   ├── designer-urls.ts        # print Designer UI URLs for the flows
│   ├── seed-dlr.ts             # Product + LinkSet to local DLR
│   ├── capture.ts              # POST to /capture with GS1-Extensions
│   ├── verify.ts               # read-back assertions
│   ├── run-flow.ts             # orchestrate one flow end-to-end
│   └── lib/{env,io,http,keycloak}.ts
├── env/
│   ├── local.env.example
│   └── hosts.example
└── out/                        # generated artefacts (.gitignored)
```
