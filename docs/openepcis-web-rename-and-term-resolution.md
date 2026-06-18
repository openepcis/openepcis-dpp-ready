# openepcis-web patch: prefix rename + per-term resolution

Handoff for the sibling **`openepcis-web`** repo (`apps/ref-openepcis`, Nuxt 3),
to follow the dpp-ready prefix rename (`dpp→oec, interop→oei, battery→eubat,
textile→eutex, electronics→euelec, detergent→eudet, ppwr→euppwr, cpr→eucpr,
fsma→usfsma`; **eudr, rail, gs1, schema, untp, cv/cccev/locn/adms unchanged**)
and to close the per-term dereferenceability gap.

Paths below are relative to `apps/ref-openepcis/`. Verified against the repo on
2026-06-18.

---

## ⚠️ Do NOT change (would break loading)

The dpp-ready rename was **alias-only** — it renamed CURIE prefixes *inside*
files, **not any file names**. The generated artifacts are still
`battery.json`, `battery-context.jsonld`, `dpp-core.ttl`, etc. So these stay:

- `app/utils/moduleRegistry.ts` — `fileName` values (`"battery"`, `"dpp-core"`, …)
- `scripts/copy-ontologies.ts` — `prefix` / dir values
- `server/plugins/content-negotiation.ts` — `moduleFileMap` values
- all `import … from "~~/public/ontologies/<name>.json"` statements and
  `~~/public/extensions/<slug>/…` paths
- every `namespace:`/`https://ref.openepcis.io/extensions/...` IRI (canonical)

(An earlier analysis suggested renaming these — that is wrong; they reference
unchanged dpp file basenames.)

---

## Part A — Prefix rename (display + documentation strings only)

The app does not render internal CURIEs from a central map (see Part C) — the
only places the **old prefixes are shown to users** are hardcoded prose/example
strings:

1. **`app/data/moduleDocumentation.ts`** — ~43 occurrences: CURIE examples
   (`textile:TextileApparel`, `dpp:HazardousSubstance`, `detergent:INCIIngredient`,
   `fsma:FoodTraceabilityList`, …) and `GS1-Extensions:` header labels.
2. **`app/pages/extensions/index.vue`** — 4 occurrences: `GS1-Extensions:`
   header examples (`dpp=…`, `battery=…`, `fsma=…`).

Apply the same alias map, touching only CURIE (`prefix:Local`) and header
(`prefix=https`) forms; leave `eudr`, `rail`, `gs1`, `schema`, `untp`, and the
SEMICeu prefixes untouched. Scoped migration (run from `apps/ref-openepcis/`):

```js
// scripts/rename-prefixes-docs.mjs  (one-off; mirrors dpp-ready/scripts/rename-prefixes.mjs)
import { readFileSync, writeFileSync } from "fs";
const MAP = { dpp:"oec", interop:"oei", battery:"eubat", textile:"eutex",
  electronics:"euelec", detergent:"eudet", ppwr:"euppwr", cpr:"eucpr", fsma:"usfsma" };
const FILES = ["app/data/moduleDocumentation.ts", "app/pages/extensions/index.vue"];
const lb = "(?<![A-Za-z0-9_/-])";
for (const f of FILES) {
  let s = readFileSync(f, "utf8");
  for (const [o, n] of Object.entries(MAP)) {
    s = s.replace(new RegExp(`${lb}${o}:([A-Za-z])`, "g"), `${n}:$1`); // CURIEs
    s = s.replace(new RegExp(`${lb}${o}=https`, "g"), `${n}=https`);   // header labels
  }
  writeFileSync(f, s);
}
```

> Note the `dpp:`→`oec:` and `fsma:`→`usfsma:` rewrites also affect prose like
> "reuses `dpp:HazardousSubstance`" — desired. Spot-check that no rename hit an
> unrelated English word (the `prefix:Uppercase` / `prefix=https` guards avoid that).

**Refresh served artifacts** so the published contexts/JSON carry the new
prefixes internally (they are copied verbatim from dpp-ready):

```bash
pnpm run copy:ontologies   # re-pull battery-context.jsonld etc. (now declaring eubat: …)
pnpm run build
```

### A.2 (Optional, recommended) render internal terms as CURIEs

`app/utils/ontologyUtils.ts` → `NAMESPACE_PREFIXES` currently lists only external
vocabs, so OpenEPCIS terms display by bare local name (`Battery`, not
`eubat:Battery`). To show branded CURIEs, add the extension namespaces **with the
new prefixes**:

```ts
export const NAMESPACE_PREFIXES: Record<string, string> = {
  "https://ref.gs1.org/voc/": "gs1:",
  // … existing external entries …
  "https://ref.openepcis.io/extensions/common/core/": "oec:",
  "https://ref.openepcis.io/extensions/common/interop/": "oei:",
  "https://ref.openepcis.io/extensions/eu/battery/": "eubat:",
  "https://ref.openepcis.io/extensions/eu/eudr/": "eudr:",
  "https://ref.openepcis.io/extensions/eu/textile/": "eutex:",
  "https://ref.openepcis.io/extensions/eu/electronics/": "euelec:",
  "https://ref.openepcis.io/extensions/eu/detergent/": "eudet:",
  "https://ref.openepcis.io/extensions/eu/ppwr/": "euppwr:",
  "https://ref.openepcis.io/extensions/eu/cpr/": "eucpr:",
  "https://ref.openepcis.io/extensions/us/fsma204/": "usfsma:",
};
```
`PREFIX_TO_NAMESPACE` derives from it automatically. Confirm `getLocalName(uri,
namespace)` is still passed the module namespace where you want the bare local
name (term headings) vs. CURIE (cross-references).

---

## Part B — Per-term dereferenceability (the real gap)

Today, for `https://ref.openepcis.io/extensions/eu/battery/Battery`:
- `Accept: text/html` → **404** (the `[...slug].vue` term route is dynamic and
  not prerendered, so the static deploy has no page for it).
- `Accept: application/ld+json` → 200 but **wrong body**: `content-negotiation.ts`
  longest-prefix-matches `eu/battery` and serves the **whole module context**,
  not a term-specific document.

### B.1 Term-level JSON-LD — `server/plugins/content-negotiation.ts`

After the existing `moduleSlug`/`moduleName` match, detect a **term segment**
(the path remainder after the module slug) and, for `application/ld+json`, return
a term document built from the ontology JSON instead of the module context:

```ts
const term = afterExt.slice(moduleSlug.length + 1); // "" for namespace, "Battery" for a term
if (term && !term.includes("/") && accept.includes("application/ld+json")) {
  // load /public/ontologies/<moduleName>.json, find class/property/enum by localName
  const onto = await readOntologyJson(moduleName);              // helper: import or fs read
  const t = findTerm(onto, term);                                // classes/properties/enumerations
  if (!t) { setResponseStatus(event, 404); return send(event, …); }
  const doc = {
    "@context": `${origin}/extensions/${moduleSlug}/${moduleName}-context.jsonld`,
    "@id": t.id,                          // the canonical term IRI
    "@type": t.kind === "class" ? "owl:Class" : "owl:ObjectProperty",
    "rdfs:label": t.label, "rdfs:comment": t.comment,
    ...(t.domain && { "rdfs:domain": t.domain }),
    ...(t.range && { "rdfs:range": t.range }),
    "rdfs:isDefinedBy": onto.namespace,
  };
  return serveJson(event, doc, "application/ld+json");
}
// else fall through to the existing module-context branch
```
Also add `text/turtle` term output if you want full parity (serialise the same
triples). Keep the existing 406 for `application/rdf+xml`.

### B.2 Term-level HTML — stop the 404

The term page component already exists (`<TermDetail>` in `[...slug].vue`); it
just isn't generated for the static deploy. Pick one:

- **Prerender (matches current static deploy):** generate the term route list at
  build time from the ontology JSON (the sitemap in
  `server/api/__sitemap__/urls.ts` already enumerates every class/property/enum —
  reuse that). In `nuxt.config.ts`:
  ```ts
  nitro: { prerender: { crawlLinks: true, routes: ["/extensions"] } }
  // or push explicit term routes generated from public/ontologies/*.json
  ```
- **Or** deploy with the Nitro Node server (SSR) and a catch-all so
  `[...slug].vue` renders term routes on demand (no prerender list to maintain).

Prefer prerender if the deploy is static hosting; the term set is bounded and
already known from the ontology JSON.

---

## Part C — Verification

```bash
pnpm run copy:ontologies && pnpm run build      # or generate + preview

# no old prefixes left in user-facing prose
grep -rnE "(dpp|battery|textile|electronics|detergent|ppwr|cpr|fsma)(=https|:[A-Za-z])" \
  app/data/moduleDocumentation.ts app/pages/extensions/index.vue   # → none

# content negotiation matrix (against the running build)
for u in \
  "/extensions/eu/battery/" \
  "/extensions/eu/battery/Battery"; do
  curl -s -o /dev/null -w "$u  html:%{http_code}\n" -H 'Accept: text/html' "$BASE$u"
  curl -s -o /dev/null -w "$u  ld+json:%{http_code} %{content_type}\n" -H 'Accept: application/ld+json' "$BASE$u"
done
# expect: namespace html 200 + ld+json 200 (module context);
#         term      html 200 (no longer 404) + ld+json 200 with @id = the term IRI
```

## Summary checklist
- [ ] A.1 rewrite 47 prose/header prefix strings (`moduleDocumentation.ts`, `index.vue`)
- [ ] A.2 (optional) add OpenEPCIS namespaces to `NAMESPACE_PREFIXES` with new CURIEs
- [ ] `pnpm run copy:ontologies` + build to refresh served contexts/JSON
- [ ] B.1 term-level JSON-LD in `content-negotiation.ts`
- [ ] B.2 term-level HTML (prerender term routes, or SSR catch-all)
- [ ] C verification matrix green; no old prefixes in prose
- [ ] Do NOT touch `fileName` / `moduleFileMap` / import paths / namespace IRIs
