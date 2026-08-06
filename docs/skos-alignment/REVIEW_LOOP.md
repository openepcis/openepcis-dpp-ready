# Reviewing a vocab-sync audit

The audit proposes; a human decides; a script writes. This is the loop that turns a
completeness report into ontology edits without hand-editing TTL.

```bash
# 1) audit one module (local models, one job at a time)
cd tools/vocab-sync
QA_CHAT_MODEL=qwen/qwen3-32b java -jar target/quarkus-app/quarkus-run.jar \
  audit --module battery --out "$PWD/../../docs/skos-alignment/skos-completeness-battery-$(date +%F)"

# 2) triage it: what may be applied mechanically, what needs a curator
pnpm run skos:triage docs/skos-alignment/skos-completeness-battery-<date>.json

# 3) read the APPLY list, then write it
pnpm run skos:apply docs/skos-alignment/skos-completeness-battery-<date>.json           # dry-run
pnpm run skos:apply docs/skos-alignment/skos-completeness-battery-<date>.json -- --write

# 4) verify and regenerate
rapper -i turtle -c extensions/eu/battery/ontology/battery.ttl
pnpm run check:mappings && pnpm run build
```

Pass the `--out` path as an absolute path: the audit resolves it relative to the jar, so a
relative one escapes the repository.

## What the triage decides, and why

The QA panel judges whether a mapping is real and which graded relation fits. It does not
know this project's conventions, so a confirmed finding still has to clear these filters
before it is written. They come from working the electronics report by hand.

| Verdict | Case | Reason |
|---|---|---|
| SKIP | target is an `oec:` or module term | SKOS mapping relations link across schemes; an internal cross-reference is `rdfs:seeAlso`. |
| HOLD | target is `gs1:value`, `schema:value`, `schema:StructuredValue`, … | A serialisation slot, not a concept. |
| HOLD | target is `schema:Class`, `schema:DataType`, `schema:Enumeration` | Meta-classes: any subsumption claim is a level confusion. |
| HOLD | our term is an enumeration (`owl:oneOf`) or a `…Type` / `…Tier` class and the target denotes the entity | Neither direction fits a category-versus-entity pair. |
| HOLD | our term is a property and the target a class, or the reverse | A graded relation holds between concepts at the same level. The panel proposed `eudr:hasTransformationLocation broadMatch locn:Location` while the same report already carried the correct `locn:location`. Read from the initial capital of the target's local name, a convention every vocabulary we map onto follows. |
| APPLY | the panel reverses the direction of an existing graded relation | Mechanical: the assertion meant the opposite of what it said. |
| APPLY | an existing `rdfs:seeAlso` graded at 0.80 QA confidence or above | The pointer was already there; only the grade is new. |
| APPLY | a new mapping at 0.80 or above | Below that the tool's own gate would emit `rdfs:seeAlso` anyway. |
| HOLD | everything else, including regrades such as `closeMatch` to `broadMatch` | A judgement about how close two concepts are. |

Read the APPLY list before writing it. `check:mappings` is the backstop and has rejected a
panel-confirmed proposal on domain grounds (`schema:softwareVersion` is
`SoftwareApplication`-scoped, so it does not fit a device attribute), which is the intended
division of labour: the panel knows meaning, the guard knows this project's rules.

The filters above are not enough on their own, because two things the panel cannot see only show
up when a human reads the target's own definition:

- **Granularity.** Three iron-steel batch identifiers were graded under `schema:serialNumber`,
  which schema.org domains on `IndividualProduct`. A heat number identifies the melt, not one
  piece. `check:mappings` rule 3c now catches this class mechanically.
- **Level.** A closed list of codes is not in a subsumption relation with the class of things it
  classifies, in either direction. The triage holds these as "our term is a type, target is the
  entity"; `check:mappings` rule 7 now enforces the same thing in the ontology, and runs before
  the direction rule so a level error is not reported as a direction error.
- **A scope clause inside the definition.** `gs1:consumerProductVariant` is explicitly limited to
  variants that do not require a different GTIN, which rules out a detergent's physical form.
  No guard can generalise this one; it is why the APPLY list gets read.

When a proposal is withdrawn after being applied, degrade it to `rdfs:seeAlso` rather than
deleting the pointer, record the pair in [`scripts/skos-deferred.json`](../../scripts/skos-deferred.json)
so a later audit does not re-propose it, and put the reason in the term's `skos:note`.

## The three lists, and which one to reach for

| List | Holds | Effect |
|---|---|---|
| [`scripts/mapping-allowlist.json`](../../scripts/mapping-allowlist.json) | Assertions that are deliberately in the ontology although a mechanical rule would flag them | `check:mappings` stays quiet; the triage refuses any proposal that would change the relation |
| [`scripts/skos-deferred.json`](../../scripts/skos-deferred.json) | Proposals a curator looked at and declined | The triage holds them and they stay listed in [`OPEN_DECISIONS.md`](OPEN_DECISIONS.md) |
| `GENERAL_L1_TERMS` in `check-mappings.ts` | Layer-1 head terms so general that only `broadMatch` toward them is meaningful | Rule 6 rejects `narrowMatch` toward any of them |

The allowlist is shared between the guard and the triage on purpose. While they had separate
lists the textile panel proposed flipping `eutex:seasonCollection`, whose `narrowMatch` the guard
list already recorded as intentional, and the flip would have silently overwritten the reasoning.

## Recording the rest

Everything the triage holds goes to [`OPEN_DECISIONS.md`](OPEN_DECISIONS.md) with its reason,
so the next curator starts from a list rather than from the raw report.

## Direction, once and for all

SKOS reads `A skos:narrowMatch B` as "B is narrower than A". A regulation module term is
almost always the narrower one, so it takes `skos:broadMatch` toward a foundational term.
`check:mappings` rule 6 enforces this against a curated list of general Layer-1 terms, and
rule 4 rejects a term mapped to itself.
