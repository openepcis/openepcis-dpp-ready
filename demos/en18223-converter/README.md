# EN 18223 converter demo

Live: **<https://openepcis.github.io/openepcis-dpp-ready/>**

A self-contained web page that demonstrates the **EPCIS4DPP** derivation: choose a
real product passport written in **GS1 Web Vocabulary + GS1 Digital Link JSON-LD**
(the EN 18223 *compressed* serialization), or paste your own, and read the derived
CEN/CENELEC EN 18223 `DigitalProductPassport` on the right. The **View** dropdown
switches between the two EN 18223 plain-JSON serializations, expanded (Annex A) and
compressed, and the JSON-LD expansion of the input. Each data point becomes a
`DataElement` whose `dictionaryReference` is the term's own vocabulary IRI (GS1,
schema.org, or the OpenEPCIS extensions); `valueDataType` comes from the ontology,
and `granularity` is derived from the Digital Link Application Identifiers
(`01` → model, `01`+`10` → batch, `01`+`21` → item).

Everything runs **client-side** and offline. The page reuses the same derivation
core as the CLI (`scripts/en18223/derive-core.ts`); the range index, the OpenEPCIS
contexts, and the product samples are generated from the repo sources and bundled
in for the browser.

## Build and run

```bash
pnpm run demo:en18223:build     # generate data + bundle app.js
# then serve the folder with any static server, e.g.:
npx serve demos/en18223-converter
# or build + serve with esbuild's dev server:
pnpm run demo:en18223
```

Open the served `index.html`. `app.js` is a committed prebuilt bundle, so the page
also works from any static host without rebuilding.

## Hosting on GitHub Pages

The page is fully static (relative asset paths, no runtime network calls), so it
deploys to GitHub Pages as-is. The workflow `.github/workflows/pages.yml` builds the
bundle and publishes this folder on every push to `main`; it serves at
<https://openepcis.github.io/openepcis-dpp-ready/>.

## Files

- `index.html`, `styles.css`: the page.
- `app.ts`: browser entry; bundled to `app.js` by esbuild
  (`--loader:.jsonld=json`, `--platform=browser`).
- `range-index.json`, `contexts.json`, `samples.json`: generated from the repo by
  `scripts/build-en18223-demo-data.ts` (property ranges, the OpenEPCIS contexts,
  and the product examples grouped by industry).
- `app.js`: prebuilt bundle (includes `jsonld`, the derivation core, the generated
  data, and the samples).

The derivation logic lives in `scripts/en18223/derive-core.ts` (shared with the CLI
`scripts/derive-en18223.ts`). Not official GS1 or CEN/CENELEC guidance.
