#!/usr/bin/env bash
#
# seed-hosts.sh — shared jq filters for turning a committed example seed into a
# body for one specific environment. Source it, do not execute it.
#
# The committed examples under extensions/**/examples/ are environment-neutral:
# identity URLs use the canonical GS1 Digital Link host (https://id.gs1.org) and
# document URLs a placeholder host (https://files.example.org), so nothing in the
# repo names a deployment. Every script that seeds one of those files into a live
# environment has to point those URLs at that environment first. Skipping it is how
# dev ended up serving passports whose own document and identity URLs named demo.
#
# Usage:
#   source "$REPO_ROOT/scripts/lib/seed-hosts.sh"
#   seed_hosts_init "$DL_URL" "$FILES_URL"
#   body=$(jq "${SEED_HOSTARGS[@]}" "$SEED_STRIP | $SEED_HOSTS" "$file")
#
# SEED_STRIP  drops the editorial _comment* keys.
# SEED_HOSTS  rewrites the two neutral hosts to $dl / $files.
# SEED_HOSTARGS  the matching jq --arg pair; pass it to every jq that uses SEED_HOSTS.

# The neutral hosts the examples are authored with. Keep in step with the
# substitution scripts/check-example-hosts.ts enforces.
SEED_NEUTRAL_ID_HOST="https://id.gs1.org"
SEED_NEUTRAL_FILES_HOST="https://files.example.org"

SEED_STRIP='walk(if type == "object" then with_entries(select(.key | startswith("_") | not)) else . end)'
SEED_HOSTS='walk(if type == "string" then (gsub("https://id\\.gs1\\.org"; $dl) | gsub("https://files\\.example\\.org"; $files)) else . end)'

# seed_hosts_init <digital-link-base-url> <files-base-url>
seed_hosts_init() {
  if [[ -z "${1:-}" || -z "${2:-}" ]]; then
    echo "seed_hosts_init: need the Digital Link and files base URLs" >&2
    return 64
  fi
  SEED_HOSTARGS=(--arg dl "$1" --arg files "$2")
}

# seed_hosts_body <file> [extra jq filter appended after the host rewrite]
# Emits the normalized body on stdout.
seed_hosts_body() {
  local file="$1" extra="${2:-.}"
  jq "${SEED_HOSTARGS[@]}" "$SEED_STRIP | $SEED_HOSTS | $extra" "$file"
}
