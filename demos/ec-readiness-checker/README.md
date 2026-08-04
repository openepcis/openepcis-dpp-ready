# EC Battery Passport readiness checker

Checks battery passport JSON-LD against the 71 data points of the European
Commission guidance **"Digital Batteries Passport — data points by category"**
(v1.0, 28 July 2026, Ares(2026)7579758) — the official EU list, mirrored as the
[`ec-battery-passport-guidance/1.0`](../../extensions/eu/battery/vocab/ec-battery-passport-guidance-1.0.ttl)
registry.

For each data point the checker reports, per battery category (EV / LMT /
industrial):

| Outcome | Meaning |
|---|---|
| fulfilled | a carrying term (or the GS1 Digital Link id) is present |
| missing | mandatory for the category, no carrier found |
| condition to check | applicable only under a condition the machine can't decide (quoted verbatim) |
| not yet required | blocked on the upcoming implementing act / Omnibus IV as of Feb 2027 |
| provided early | present although the format is not yet specified |
| optional | optional and not provided |
| not to be filled | resolved by the guidance as duplicate/aggregate |

It is a **structural coverage check**, not a validation of values — SHACL
shapes and JSON Schema do that. Pass all levels of one battery
(model + batch + item) for the full picture: the dynamic Annex XIII 4 data
points (51–71) are folded from the EPCIS event stream at item level, so a model
passport alone legitimately lacks them.

## Run

```bash
# browser demo (bundles the shared core + samples, then serves this directory)
pnpm run demo:ec-readiness          # http://localhost:8000

# CLI against any passport document(s)
pnpm run check:ec-readiness -- \
  extensions/eu/battery/examples/battery-product-model.jsonld \
  extensions/eu/battery/examples/battery-product-batch.jsonld \
  extensions/eu/battery/examples/battery-product.jsonld
# options: --category ev|lmt|industrial · --date YYYY-MM-DD · --json · --strict · --shacl
```

## SHACL mode

`--shacl` runs a real SHACL engine (rdf-validate-shacl) against the generated
[`ec-readiness-shapes.ttl`](../../extensions/eu/battery/validation/ec-readiness-shapes.ttl)
instead of the structural matrix walk — same source data, but graph-precise:
the anchor paths (e.g. `technicalSpecifications/ratedCapacity`) are derived
from the ontologies' `rdfs:domain` declarations, statuses map to SHACL
severities (mandatory = `sh:Violation`, conditional = `sh:Warning`,
optional/pending = `sh:Info`), and the CLI activates the shapes of the chosen
category and folds the model/batch/item Digital Link hierarchy into one focus
node before validating. The shapes file is self-contained — any SHACL engine
can execute the same checklist without OpenEPCIS tooling.

Shared evaluation core: [`scripts/lib/ec-readiness.ts`](../../scripts/lib/ec-readiness.ts).
Applicability matrix: [`extensions/eu/battery/validation/ec-datapoint-applicability.json`](../../extensions/eu/battery/validation/ec-datapoint-applicability.json)
(generated from the hand-transcribed guidance source by `pnpm run build:ec-guidance-vocab`).

Guidance content reused under CC BY 4.0, © European Union, 2026. Not an
official position of the European Commission.
