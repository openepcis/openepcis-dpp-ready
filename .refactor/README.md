# Refactor: EU/US region hierarchy

One-time scripts to move the flat module layout into
`extensions/{common,eu,us}/...` and rewrite every namespace URI accordingly.
Run in order:

```
cd /Users/sven/Documents/projects/openepcis/openepcis-dpp-ready
bash .refactor/01-move.sh
bash .refactor/02-rewrite-uris.sh
bash .refactor/03-verify.sh
```

If `03-verify.sh` shows non-zero counts, paste the "Files still referencing
old URIs" block back to Claude and we'll patch whatever slipped through.

After `03-verify.sh` is clean, tell Claude to continue. Claude will then:

1. Create `extensions/us/fsma204/` with real content
2. Edit `scripts/build-json.ts`, root `README.md`, `CLAUDE.md`
3. Edit the consuming web app (`scripts/copy-ontologies.ts`,
   `app/utils/moduleRegistry.ts`, `app/data/moduleDocumentation.ts`,
   `app/pages/extensions/[...slug].vue`, `app/pages/extensions/index.vue`,
   `app/layouts/default.vue`)

Final verification commands (Claude will instruct when to run):

```
cd /Users/sven/Documents/projects/openepcis/openepcis-dpp-ready
pnpm install && pnpm run build     # regenerate all JSON under extensions/.../json/

cd /Users/sven/Documents/projects/openepcis-web/apps/ref-openepcis
pnpm run copy:ontologies
pnpm run build
```

This `.refactor/` folder can be deleted once the refactor is merged.
