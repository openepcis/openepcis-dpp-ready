#!/usr/bin/env bash
# Phase A step 3: verify no stale old-style URIs remain inside extensions/.
# Any non-zero count means a rewrite was missed — paste that output back.
set -euo pipefail

REPO="/Users/sven/Documents/projects/openepcis/openepcis-dpp-ready"
cd "$REPO"

echo "==> New directory layout"
find extensions -maxdepth 2 -type d | sort
echo

echo "==> Stale URI scan (each line should end in 0)"
for slug in dpp interop battery eudr textile electronics detergent ; do
  count=$(grep -r "https://ref.openepcis.io/extensions/${slug}/" extensions 2>/dev/null | wc -l | tr -d ' ')
  printf "    %-14s %s\n" "${slug}:" "$count"
done

echo
echo "==> Files still referencing old URIs (if any)"
grep -rn "https://ref\.openepcis\.io/extensions/\(dpp\|interop\|battery\|eudr\|textile\|electronics\|detergent\)/" extensions 2>/dev/null | head -30 || echo "    (none)"

echo
echo "==> Sanity peek: prefix declarations in TTL files"
grep -rh "^@prefix " extensions --include="*.ttl" | grep "ref.openepcis.io" | sort -u | head -20

echo
echo "Done. When all counts are 0, tell me (Claude) to proceed with FSMA 204 + web-app edits."
