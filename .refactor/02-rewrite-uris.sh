#!/usr/bin/env bash
# Phase A step 2: rewrite namespace URIs inside every moved module.
# Uses macOS BSD sed syntax (-i '').
set -euo pipefail

REPO="/Users/sven/Documents/projects/openepcis/openepcis-dpp-ready"
cd "$REPO"

FILE_TYPES=( -name "*.ttl" -o -name "*.jsonld" -o -name "*.json" -o -name "*.md" )

rewrite() {
  local dir="$1"
  local from="$2"
  local to="$3"

  if [[ ! -d "$dir" ]]; then
    echo "    [SKIP] $dir not found"
    return 0
  fi

  local count
  count=$(grep -rl "$from" "$dir" 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$count" == "0" ]]; then
    echo "    [NOOP] $dir: no hits for $from"
    return 0
  fi
  echo "    [REWRITE] $dir: $count files"
  find "$dir" -type f \( "${FILE_TYPES[@]}" \) -exec sed -i '' "s|${from}|${to}|g" {} +
}

echo "==> Per-module self-URI rewrite"
rewrite extensions/common/core     "https://ref.openepcis.io/extensions/dpp/"        "https://ref.openepcis.io/extensions/common/core/"
rewrite extensions/common/interop  "https://ref.openepcis.io/extensions/interop/"    "https://ref.openepcis.io/extensions/common/interop/"
rewrite extensions/eu/battery      "https://ref.openepcis.io/extensions/battery/"    "https://ref.openepcis.io/extensions/eu/battery/"
rewrite extensions/eu/eudr         "https://ref.openepcis.io/extensions/eudr/"       "https://ref.openepcis.io/extensions/eu/eudr/"
rewrite extensions/eu/textile      "https://ref.openepcis.io/extensions/textile/"    "https://ref.openepcis.io/extensions/eu/textile/"
rewrite extensions/eu/electronics  "https://ref.openepcis.io/extensions/electronics/" "https://ref.openepcis.io/extensions/eu/electronics/"
rewrite extensions/eu/detergent    "https://ref.openepcis.io/extensions/detergent/"  "https://ref.openepcis.io/extensions/eu/detergent/"

echo
echo "==> Cross-module rewrite (references to DPP core from every other module)"
for scope in \
    extensions/common/interop \
    extensions/eu/battery \
    extensions/eu/eudr \
    extensions/eu/textile \
    extensions/eu/electronics \
    extensions/eu/detergent ; do
  rewrite "$scope" "https://ref.openepcis.io/extensions/dpp/" "https://ref.openepcis.io/extensions/common/core/"
done

echo
echo "==> Cross-module rewrite (references to other EU modules from interop)"
for slug in battery eudr textile electronics detergent ; do
  rewrite extensions/common/interop \
    "https://ref.openepcis.io/extensions/${slug}/" \
    "https://ref.openepcis.io/extensions/eu/${slug}/"
done

echo
echo "Done. Next: bash .refactor/03-verify.sh"
