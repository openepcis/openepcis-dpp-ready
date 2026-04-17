#!/usr/bin/env bash
# Phase A step 1: move each existing module into extensions/{region}/{slug}/
# Run from anywhere; script cds to the repo.
set -euo pipefail

REPO="/Users/sven/Documents/projects/openepcis/openepcis-dpp-ready"
cd "$REPO"

echo "==> Current branch / working tree status"
git rev-parse --abbrev-ref HEAD
git status --short | head -20

echo "==> Creating region directories"
mkdir -p extensions/common extensions/eu extensions/us

echo "==> Moving modules (trying git mv first, falling back to plain mv)"
move_module() {
  local src="$1"
  local dst="$2"

  if [[ ! -d "$src" ]]; then
    echo "    [SKIP] $src does not exist"
    return 0
  fi

  if git mv "$src" "$dst" 2>/dev/null; then
    echo "    [git mv] $src -> $dst"
  else
    mv "$src" "$dst"
    echo "    [mv]     $src -> $dst"
  fi
}

move_module core         extensions/common/core
move_module interop      extensions/common/interop
move_module battery      extensions/eu/battery
move_module eudr         extensions/eu/eudr
move_module textile      extensions/eu/textile
move_module electronics  extensions/eu/electronics
move_module detergent    extensions/eu/detergent

echo
echo "==> New top-level layout"
ls -1 .
echo
echo "==> extensions/ subtree"
find extensions -maxdepth 2 -type d | sort
echo
echo "Done. Next: bash .refactor/02-rewrite-uris.sh"
