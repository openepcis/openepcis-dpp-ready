#!/usr/bin/env bash
# Drive the local GITB conformance stack.
#
# Two profiles:
#   validators  the RDF validator alone — what the parity gate needs and what you
#               want for poking at shapes by hand (one ~490 MB image)
#   itb         the full Test Bed on top, to import the test suite and run
#               sessions through the UI (several more images, GBs)
#
# The compose files mount gitb/validator-resources/shacl, which is GENERATED.
# This script regenerates it first so a stale bundle can never be served.
#
# Long pulls belong in tmux — an interrupted SSH session kills them:
#   tmux new -d -s itb "bash -lc 'gitb/dev.sh up itb'"

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

# podman-compose where available, else docker compose. Both read the same files.
if command -v podman-compose >/dev/null 2>&1; then
  COMPOSE=(podman-compose)
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
else
  echo "Neither podman-compose nor 'docker compose' is available." >&2
  exit 1
fi

profile="${2:-validators}"
case "$profile" in
  validators) FILE="$HERE/docker/docker-compose.validators.yml" ;;
  itb)        FILE="$HERE/docker/docker-compose.itb.yml" ;;
  *) echo "Unknown profile '$profile' (expected: validators | itb)" >&2; exit 1 ;;
esac

regenerate() {
  echo "→ regenerating the validator bundle so nothing stale gets mounted"
  (cd "$ROOT" && pnpm run --silent build:gitb >/dev/null)
}

wait_for_validator() {
  echo -n "→ waiting for the RDF validator"
  for _ in $(seq 1 60); do
    if curl -fsS -o /dev/null http://localhost:8080/shacl/dpp/upload 2>/dev/null; then
      echo " — up: http://localhost:8080/shacl/dpp/upload"
      return 0
    fi
    echo -n "."
    sleep 5
  done
  echo " — did not come up in 5 minutes." >&2
  return 1
}

case "${1:-help}" in
  up)
    regenerate
    "${COMPOSE[@]}" -f "$FILE" up -d
    wait_for_validator
    if [ "$profile" = "itb" ]; then
      cat <<'EOF'

→ Test Bed UI: http://localhost:9000
  Log in as admin@itb. The one-time password is printed in the gitb-ui log until
  the first successful login:

    gitb/dev.sh logs itb | grep -i -A2 'one-time'

  Then: create the domain, add a specification per module and the DPPDataProvider
  actor, and upload gitb/test-suites/openepcis-dpp as a ZIP (see gitb/README.md).
EOF
    fi
    ;;
  down)
    "${COMPOSE[@]}" -f "$FILE" down
    ;;
  logs)
    "${COMPOSE[@]}" -f "$FILE" logs --tail 200
    ;;
  zip)
    # The Test Bed expects the suite's CONTENTS at the archive root, with no
    # wrapping directory: resource references inside the test cases are relative
    # to it.
    out="$ROOT/gitb/openepcis-dpp-testsuite.zip"
    (cd "$ROOT/gitb/test-suites/openepcis-dpp" && rm -f "$out" && zip -qr "$out" .)
    echo "→ $out"
    ;;
  *)
    cat <<EOF
usage: gitb/dev.sh <command> [profile]

  up [validators|itb]    start the stack (default profile: validators)
  down [profile]         stop it
  logs [profile]         tail the logs
  zip                    package the test suite for import into a Test Bed

Verify the running stack with:
  pnpm run check:shapes:itb
EOF
    ;;
esac
