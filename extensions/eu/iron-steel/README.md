# OpenEPCIS DPP — Iron & Steel (`eusteel:`)

Digital Product Passport vocabulary for the **iron & steel** ESPR priority
product group (Regulation (EU) 2024/1781). Namespace
`https://ref.openepcis.io/extensions/eu/iron-steel/`, prefix `eusteel:`.

## Scope

This module is intentionally **thin**. It mints only steel-specific concepts:

- **`eusteel:IronSteelProduct`** — the product carrier (subclass of `gs1:Product`).
- **Steel identification** — heat / cast / lot / product numbers, purchaser
  order, grade classification (EN 10020), designation (EN 10027), melt-and-pour
  country, CBAM report id (Regulation (EU) 2023/956).
- **`eusteel:technologyRoute`** — primary steelmaking route (BF-BOF, EAF, OHF).
- **`eusteel:MaterialTestCertificate`** — the EN 10204 inspection document
  (type 2.1/2.2/3.1/3.2) carrying the EN 10168 mechanical and chemical
  parameters that substantiate the declared grade.

Everything cross-cutting reuses the lifted **`oec:`** core vocabulary:

| Need | Reuse |
|------|-------|
| Recycled content (EAF scrap share, pre/post-consumer) | `oec:RecycledContent` |
| Substances of concern (REACH / SCIP) | `oec:substancesOfConcern`, `oec:SubstanceOfConcern` |
| Environmental Product Declaration (EN 15804, GWP etc.) | `oec:EnvironmentalProductDeclaration` |
| Carbon footprint (single value / 5-stage) | `oec:carbonFootprintTotal`, `oec:CarbonFootprintDeclaration` |
| Material composition | `oec:materialComposition` |
| Supporting documents (REACH docs, conformity) | `oec:documents` / `oec:DocumentReference` |
| Economic operator, facility | `oec:OperatorInformation`, `oec:FacilityInformation` |

## Interoperability

`eusteel:` is anchored to the **DPP Keystone** peer profile
(`dpp-keystone.org`, `dppk:`): `eusteel:IronSteelProduct ≡ dppk:IronSteelProduct`,
`eusteel:MaterialTestCertificate ≡ dppk:MaterialTestCertificate`, and every
`mtc*` / identification property carries a `skos:exactMatch` (or `skos:closeMatch`
for the `technologyRoute` enum) to its `dppk:` counterpart. See the bridge in
[`../../common/interop/`](../../common/interop/).

## Layout

```
iron-steel/
├── VERSION
├── CHANGELOG.md
├── ontology/iron-steel.ttl       # source of truth
├── context/iron-steel-context.jsonld
├── examples/rebar-product.jsonld
├── epcis/transformation-rolling.jsonld
├── validation/iron-steel-shapes.ttl
├── docs/IMPLEMENTATION_GUIDE.md
└── json/iron-steel.json          # generated (pnpm build)
```

TTL is the source of truth. Regenerate `json/` and `context/iron-steel-context.jsonld`
with `pnpm build` and `pnpm build:context` (run `/dpp-sync iron-steel`). Put any
non-derivable JSON-LD hints in `context/.context-overrides.json`.
