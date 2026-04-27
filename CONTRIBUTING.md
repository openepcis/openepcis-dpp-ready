# Contributing to OpenEPCIS DPP-Ready

Thank you for your interest in contributing. This document describes how to propose changes to the OpenEPCIS DPP-Ready ontology framework.

By contributing, you agree to abide by the project [Code of Conduct](./codeOfConduct.md) and to license your contribution under the [Apache License 2.0](./LICENSE).

## What this project is

OpenEPCIS DPP-Ready is a **semantic vocabulary** for Digital Product Passports — not an application. The artefacts that ship are RDF/OWL ontologies, JSON-LD contexts, JSON Schemas, validation profiles, and worked EPCIS 2.0 examples. Every contribution should be evaluable against an upstream regulation (ESPR, EU sectoral acts, FSMA §204, …) and against the GS1 Web Vocabulary.

Read [`README.md`](./README.md), [`EXTENSION-GOVERNANCE.md`](./EXTENSION-GOVERNANCE.md), and [`CLAUDE.md`](./CLAUDE.md) before opening a non-trivial PR.

## Source of truth: TTL files

```
extensions/{region}/{slug}/
├── ontology/*.ttl       # SOURCE OF TRUTH — edit these
├── json/*.json          # generated artefact — do not hand-edit
├── context/*.jsonld     # JSON-LD contexts
├── examples/*.jsonld    # JSON-LD documents
├── epcis/*.jsonld       # EPCIS 2.0 event examples
└── validation/          # validation profiles
```

- Edit `ontology/*.ttl` first. The JSON files under `json/` are regenerated from TTL by `pnpm run build`. Do not hand-edit generated JSON; it will be overwritten.
- Run `pnpm install && pnpm run build` before committing so generated artefacts stay in sync.
- TTL is validated with `rapper`; JSON-LD with the [JSON-LD Playground](https://json-ld.org/playground/); EPCIS events with OpenEPCIS Event Sentry against the relevant `validation/*.json` profile.

## Extension governance: GS1 first

Before adding a new term, check the [GS1 Web Vocabulary](https://ref.gs1.org/voc/) and [schema.org](https://schema.org/). Create an extension term **only when**:

- no equivalent GS1 term exists,
- a regulatory requirement cannot be expressed with GS1 patterns, or
- the term is domain-specific and outside GS1's scope.

Every extension term must declare:

- `dcterms:source` — link to the regulatory requirement (article + paragraph),
- `skos:note` — why GS1 doesn't cover this,
- `rdfs:seeAlso` — related GS1 / schema.org terms,
- `owl:equivalentProperty` or `owl:equivalentClass` — semantic equivalents where they exist.

See [`EXTENSION-GOVERNANCE.md`](./EXTENSION-GOVERNANCE.md) for the full rules.

## Branches and pull requests

- Fork the repository and create a topic branch: `feat/{module}-{short-name}`, `fix/{module}-{short-name}`, or `docs/{short-name}`.
- One logical change per PR. Bundle TTL changes with the regenerated JSON in the same commit.
- PR description should reference the regulation article(s) and any related issue.
- Target `main`. Releases are cut from `main`; do not branch from a release tag.
- Before pushing: run the build, validate any changed JSON-LD contexts, and run the relevant audit (see below).

## Helper commands

The repository ships [Claude Code](https://claude.com/claude-code) slash commands that automate the common workflows. They are optional but recommended:

| Command | Use when |
|---|---|
| `/dpp-add-property {module} {name} {domain} {range} "{desc}"` | Adding a property across all module artefacts |
| `/dpp-sync {module\|all}` | Regenerating derived files after a TTL change |
| `/dpp-audit {module}` | Checking module completeness before a PR |
| `/dpp-bridge create\|verify {name} [url]` | Adding or verifying an interop bridge |
| `/dpp-epcis-event {module} {eventType} {bizStep}` | Adding an EPCIS 2.0 example |
| `/dpp-epcis-lint [module\|path]` | Hygiene check on EPCIS examples |

## Reporting issues

Open an issue on GitHub. For ontology questions, include the affected TTL fragment, the regulation reference, and what you expected the term to mean. For EPCIS event questions, include a minimal reproducible event payload and the validation error.

## Licensing of contributions

All contributions are accepted **only** under the Apache License 2.0. By submitting a contribution you confirm that you are authorised to license it under Apache 2.0 and that it is free of third-party intellectual property claims. See [Code of Conduct §4](./codeOfConduct.md).
