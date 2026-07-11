#!/usr/bin/env bash
#
# vault-mark-review.sh — Non-destructively mark the candidate-duplicate vault items
# (superseded by the new "OpenEPCIS" org collections) for later review. Adds a
# visible name prefix + an explanatory note. Deletes NOTHING. Idempotent (won't
# double-mark). To un-mark, remove the prefix/note in the app, or see UNMARK below.
#
# Prereq: export BW_SESSION="$(bw unlock --raw)"
# Usage:  bash scripts/vault-mark-review.sh            # mark the baked candidate list
#         bash scripts/vault-mark-review.sh <id> ...   # mark specific ids
#         UNMARK=1 bash scripts/vault-mark-review.sh    # strip the marker again
set -euo pipefail
: "${BW_SESSION:?export BW_SESSION from 'bw unlock --raw' first}"
JQ=jq
PREFIX="⟦review→delete⟧ "
NOTE="⚠️ REVIEW→DELETE candidate: superseded by the OpenEPCIS org collections (EPCIS · {dev|demo|prod} · …). Verify the new org item holds the same value, then delete. Marked 2026-07-07 by vault-mark-review.sh."

# Candidate ids (epcis.cloud dev/demo/prod core creds now duplicated by the org items).
IDS=(
  ff97fb08-fc93-41c1-a381-c76e2918d31c  # Keycloak Admin
  5bbe54c8-4c4b-4326-ad9b-4cbf4df165fa  # keycloak (new) auth epcis.cloud
  77699a13-5622-4dbb-97c9-17a727c5337d  # keycloak epcis.cloud
  b1b31b90-d489-4a95-b059-8064be79f509  # keycloak.dev.epcis.cloud
  18970f51-528c-492c-b484-d7137e661113  # Keycloak dev.epcis.cloud
  55d49350-36e1-4840-9d3e-64c7d6d74f24  # Epcis Cloud Keykloak
  30d7e472-b55e-4618-8377-ffa17c534bc2  # OpenSearch Admin
  2589308a-47b1-4001-9147-4527f5b3b712  # Minio User
  c62f2d10-a8da-46d0-9d33-9339c273fcb7  # minio.dev.epcis.cloud
  ef28e217-2021-412f-9b92-bf52ac74fd58  # Minio EPCIS Cloud
  41692852-4502-47df-a817-f7d07651730b  # DEV Epcis Cloud
  49926a28-a85d-4c1d-9cd5-5bd4e8a604ba  # DEV EPCIS Cloud Sven Boeckelmann
)
[ "$#" -gt 0 ] && IDS=("$@")

bw sync >/dev/null 2>&1 || true
for id in "${IDS[@]}"; do
  item=$(bw get item "$id" 2>/dev/null) || { echo "  ?  $id  (not found)"; continue; }
  name=$(echo "$item" | $JQ -r '.name')
  if [ "${UNMARK:-0}" = 1 ]; then
    echo "$item" | $JQ --arg p "$PREFIX" --arg note "$NOTE" '
        .name = (.name | if startswith($p) then .[($p|length):] else . end)
      | .notes = ((.notes // "") | gsub("\\n?" + ($note|gsub("[.*+?^${}()|\\[\\]\\\\]"; "\\\\&")); ""))
      ' | bw encode | bw edit item "$id" >/dev/null && echo "  unmarked: $name"
    continue
  fi
  case "$name" in
    "$PREFIX"*) echo "  skip (already marked): $name" ;;
    *)
      echo "$item" | $JQ --arg p "$PREFIX" --arg note "$NOTE" \
          '.name = ($p + .name) | .notes = ((.notes // "") + (if (.notes // "")=="" then "" else "\n\n" end) + $note)' \
        | bw encode | bw edit item "$id" >/dev/null && echo "  marked: $PREFIX$name"
      ;;
  esac
done
echo "done. Review later: search the vault for '⟦review→delete⟧'. Re-run with UNMARK=1 to undo."
