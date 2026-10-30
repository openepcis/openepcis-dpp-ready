# Cutting a release

What a release of this repository is, what has to be true before one is cut, and the exact
sequence that produces it. Written so that the sequence can be run end to end by one person
or one agent without judgement calls hidden in it; every judgement call is named as such and
has a place where the answer is recorded.

## What a release is

One version stamp (`package.json`, every module `VERSION`, every ontology's `owl:versionInfo`
and `owl:versionIRI`, the `## [Unreleased]` headings of every changelog, the README tables)
plus the generated artifacts that the build derives from the ontologies at that stamp: JSON
views, contexts, schemas, the GITB validator bundle and test suite. Upstream mirrors under
`extensions/upstream/` keep their own upstream version and are not stamped.

A release is consumed in three places, in this order:

1. `ref.openepcis.org` serves the contexts and ontologies (the site build clones `main`).
2. The EU Test Bed validator reads the GITB bundle from the public mirror repository.
3. Implementers pin the version in their `@context` URLs and `GS1-Extensions` headers.

## Preconditions (all mechanical)

| Check | Command | Must say |
|---|---|---|
| Working tree on `main`, clean | `git status --short` | nothing |
| Full build green | `pnpm run build` | ends with `check:release` ok |
| Examples validate | `pnpm run validate:examples` | 0 errors |
| GITB bundle and test suite current | `pnpm run check:gitb && pnpm run check:gitb-testsuite` | no drift |
| Diagrams current | `pnpm run diagrams:build && git status --short docs/diagrams` | nothing |
| Upstream mirrors current | `pnpm run sync:eudpp`, `sync:cirpass2-textile`, `sync:cirpass2-battery`, `sync:rail` | no diff, or a separate sync commit first |
| Dead upstream pointers | part of `pnpm run build` (`check:mappings` rule 13) | none |

## Preconditions (judgement, with a home for the answer)

| Question | Where the answer lives |
|---|---|
| Which audited SKOS mappings go in? | The review workbook's `decisions` sheet (`Apply?`), applied by `vocab-sync curate`; held items with reasons in `docs/skos-alignment/OPEN_DECISIONS.md`. |
| Which upstream terms do we adopt, map, leave to EPCIS/CBV, or ignore? | The workbook's `coverage` sheet (`Decision`), exported by `vocab-sync coverage-decisions`; adopted terms become ordinary ontology edits with changelog lines. |
| Is a module's change breaking? | Its `CHANGELOG.md` `## [Unreleased]` section: a renamed or removed term is a major bump for that module; the project version follows the highest bump. |
| Does an upstream release need a mirror bump first? | `extensions/upstream/<mirror>/CHANGELOG.md` sync log; the mirror commit precedes the release commit. |

## Sequence

```sh
# 1. Stamp (dry run first, then write). The date defaults to today.
pnpm run release -- --version 0.9.10
pnpm run release -- --version 0.9.10 --write

# 2. Regenerate everything that carries the version, then prove the tree agrees with itself.
pnpm run build:gitb && pnpm run build:gitb-testsuite
pnpm run build
pnpm run validate:examples

# 3. Commit and open the MR (one commit: the stamp plus the regenerated artifacts).
git checkout -b release/0.9.10
git add -A && git commit -m "release 0.9.10"
git push -u origin release/0.9.10 && glab mr create --fill --remove-source-branch

# 4. After the merge, in this order:
pnpm run publish:validator-resources -- --commit --push        # Test Bed re-reads within minutes
#    openepcis-web: main pipeline → build:ref-openepcis → deploy:ref-openepcis → deploy:ref-openepcis-prod
pnpm run check:shapes:deployed -- --validator-url http://localhost:18080   # local ISAITB container
pnpm run check:shapes:itb -- --validator-url https://www.itb.ec.europa.eu  # the hosted one
git tag v0.9.10 && git push origin v0.9.10
```

`release.ts --check` runs inside `pnpm run build`, so a half-stamped tree cannot build. The
GITB drift gates fail the build until step 2 has re-run them.

## What the release commit must not contain

- Upstream mirror changes (own commit, before the release).
- Audited SKOS mapping waves (own commit per module, before the release; they carry their
  own changelog lines and provenance).
- Anything from `docs/skos-alignment/` that the `.gitignore` lists as regenerable.

## Rollback

The version stamp is one commit; reverting it and re-running step 2 restores the previous
artifacts. The validator mirror is a separate repository: re-publishing from the reverted
tree overwrites it. The site redeploys from `main` on the next manual pipeline run.
