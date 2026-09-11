#!/usr/bin/env bash
#
# Copyright (c) 2022-2026 benelog GmbH & Co. KG
# All rights reserved.
#
# Licensed under the benelog OpenEPCIS Framework Product License, Version 1.0.
# See BENELOG_LICENSE-1.0 for details.
#
# migrate-granularity-entry-paths.sh — Fold lot-bearing serial documents onto the
# serial's own document, per environment, BEFORE the resolver's canonical-serial
# policy is switched on (openepcis.granularity.canonical-serial).
#
# WHY: the identity of an instance is GTIN + serial (GS1 TDS: the serial is
# unique within the GTIN); the lot is an attribute. The resolver used to store a
# request on /01/{gtin}/10/{lot}/21/{ser} as its OWN product document (_id =
# that path) and its own linkset, next to whatever lived at 01/{gtin}/21/{ser}.
# With the policy on, 01/{gtin}/21/{ser} is the only key and the lot is
# `hasBatchLotNumber` on it — so every entry path document must be merged into its
# target first, or its data goes dark.
#
# WHAT (per environment, via a kubectl port-forward to OpenSearch and the
# tenant admin's OIDC bearer, exactly like demo-reindex-masterdata.sh):
#   dry-run (default)  count + list every entry path product document (_id shaped
#                      01/*/10/*/21/*) in products-* and every entry path linkset
#                      (path 01/*/10/*/21/*) in linksets-*, export them as JSON.
#   --apply            per product entry path: merge onto 01/{gtin}/21/{ser}
#                      (the newer updatedAt wins field by field, the lot is set
#                      as hasBatchLotNumber, a stored `id` is rewritten), write
#                      the target, delete the entry-path document. Per entry-path linkset: re-key
#                      onto the serial path when no target linkset exists,
#                      otherwise union the link arrays per link type (by href)
#                      into the target; delete the entry-path document. Idempotent: a second
#                      run finds nothing.
#   GS1 DE: no action — already published rules published under entry paths stay upstream (prune is
#   off); documented in the Terraform provenance when the flag is switched.
#
# Usage:
#   SEED_PW=… SEED_CLIENT_SECRET=… scripts/migrate-granularity-entry-paths.sh --env=demo
#   SEED_PW=… SEED_CLIENT_SECRET=… scripts/migrate-granularity-entry-paths.sh --env=demo --apply
#   … --out=DIR   where the export lands (default scratch/granularity-migration)
#   … --port=N    local port for the port-forward (default 19200)
#
# Env: SEED_PW / SEED_CLIENT_SECRET (BRUNO_* accepted), SEED_USER, REALM,
# AUTH_URL, KUBE_CONTEXT, NAMESPACE, OS_SERVICE — same conventions as
# provision-demo.sh, with per-environment defaults below.
#
# Exit codes: 0 ok · 1 a request failed · 64 bad args.
set -uo pipefail

ENV=demo; APPLY=0; OUT=""; PORT=19200; BASIC_SECRET=""
for arg in "$@"; do
  case "$arg" in
    --env=*)   ENV="${arg#--env=}" ;;
    --apply)   APPLY=1 ;;
    --out=*)   OUT="${arg#--out=}" ;;
    --port=*)  PORT="${arg#--port=}" ;;
    # OpenSearch basic auth instead of the OIDC bearer: either the Kubernetes
    # secret holding `username`/`password` (e.g. opensearch-epc-is-admin-credentials)
    # or OS_BASIC_USER / OS_BASIC_PW in the environment. For environments whose
    # Keycloak seed user is not at hand.
    --basic-secret=*) BASIC_SECRET="${arg#--basic-secret=}" ;;
    -h|--help) grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; exit 64 ;;
  esac
done

case "$ENV" in
  dev)    : "${AUTH_URL:=https://keycloak.dev.epcis.cloud}"; : "${KUBE_CONTEXT:=admin@talos-dev}";  : "${NAMESPACE:=openepcis}";        : "${OS_SERVICE:=opensearch}";        DEF_USER=admin ;;
  demo)   : "${AUTH_URL:=https://auth.demo.epcis.cloud}";    : "${KUBE_CONTEXT:=admin@talos-prod}"; : "${NAMESPACE:=openepcis-demo}";   : "${OS_SERVICE:=opensearch}";        DEF_USER=demo-admin ;;
  epc-is) : "${AUTH_URL:=https://auth.epc.is}";              : "${KUBE_CONTEXT:=admin@talos-prod}"; : "${NAMESPACE:=openepcis-epc-is}"; : "${OS_SERVICE:=opensearch-epc-is}"; DEF_USER=demo-admin; DEF_REALM=platform ;;
  *) echo "Unknown --env: $ENV (expected dev|demo|epc-is)" >&2; exit 64 ;;
esac
REALM="${REALM:-${DEF_REALM:-openepcis}}"
SEED_CLIENT_ID="${SEED_CLIENT_ID:-backend-service}"
SEED_USER="${SEED_USER:-$DEF_USER}"
SEED_PW="${SEED_PW:-${BRUNO_PW:-}}"
SEED_CLIENT_SECRET="${SEED_CLIENT_SECRET:-${BRUNO_CLIENT_SECRET:-}}"
TOKEN_URL="$AUTH_URL/realms/$REALM/protocol/openid-connect/token"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${OUT:-$REPO_ROOT/scratch/granularity-migration}"
RUN_DIR="$OUT/$ENV-$(date +%Y%m%d-%H%M%S)"

cyan(){ printf '\033[36m%s\033[0m\n' "$*"; }
red(){ printf '\033[31m%s\033[0m\n' "$*"; }
grn(){ printf '\033[32m%s\033[0m\n' "$*"; }
ylw(){ printf '\033[33m%s\033[0m\n' "$*"; }

OS_BASIC_USER="${OS_BASIC_USER:-}"; OS_BASIC_PW="${OS_BASIC_PW:-}"
if [[ -n "$BASIC_SECRET" ]]; then
  OS_BASIC_USER=$(kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" get secret "$BASIC_SECRET" -o jsonpath='{.data.username}' | base64 -d)
  OS_BASIC_PW=$(kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" get secret "$BASIC_SECRET" -o jsonpath='{.data.password}' | base64 -d)
  [[ -n "$OS_BASIC_USER" && -n "$OS_BASIC_PW" ]] || { red "Secret $BASIC_SECRET has no username/password."; exit 1; }
fi

# ------------------------------------------------------------------ connect
AUTH_HEADER=""
if [[ -n "$OS_BASIC_USER" ]]; then
  cyan "→ OpenSearch basic auth as '$OS_BASIC_USER'"
  AUTH_HEADER="Authorization: Basic $(printf '%s:%s' "$OS_BASIC_USER" "$OS_BASIC_PW" | base64)"
else
  [[ -n "$SEED_PW" && -n "$SEED_CLIENT_SECRET" ]] || { red "Set SEED_PW and SEED_CLIENT_SECRET (password of '$SEED_USER' in realm '$REALM', secret of '$SEED_CLIENT_ID') — or use --basic-secret / OS_BASIC_USER+OS_BASIC_PW."; exit 64; }
  cyan "→ Token for '$SEED_USER' from $TOKEN_URL"
  TOKEN=$(curl -sSk -X POST "$TOKEN_URL" \
    --data-urlencode grant_type=password --data-urlencode "client_id=$SEED_CLIENT_ID" \
    --data-urlencode "client_secret=$SEED_CLIENT_SECRET" --data-urlencode "username=$SEED_USER" \
    --data-urlencode "password=$SEED_PW" --data-urlencode "scope=openid roles" | jq -r '.access_token // empty')
  [[ -n "$TOKEN" ]] || { red "Token request failed."; exit 1; }
  AUTH_HEADER="Authorization: Bearer $TOKEN"
fi

mkdir -p "$RUN_DIR"
cyan "→ Port-forward $KUBE_CONTEXT/$NAMESPACE svc/$OS_SERVICE 9200 -> localhost:$PORT"
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" port-forward "svc/$OS_SERVICE" "$PORT:9200" >"$RUN_DIR/port-forward.log" 2>&1 &
PF=$!; trap 'kill $PF 2>/dev/null || true' EXIT
for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do sleep 1; curl -sk -o /dev/null "https://localhost:$PORT/" && break; done
OS="https://localhost:$PORT"
os() { curl -sSk -H "$AUTH_HEADER" -H 'Content-Type: application/json' "$@"; }
enc() { jq -rn --arg s "$1" '$s|@uri'; }

health=$(os "$OS/_cluster/health" | jq -r '.status // "unreachable"')
[[ "$health" != "unreachable" ]] || { red "OpenSearch not reachable through the port-forward (see $RUN_DIR/port-forward.log)"; exit 1; }
grn "  cluster $health"

# ------------------------------------------------------------------ find
# Plausibility first: how many class and instance documents exist at all. A
# "0 entry paths" against "0 instances" would mean the query saw nothing, not that
# the data is clean.
classes_total=$(os "$OS/products-*/_count" -d '{"query":{"bool":{"filter":[{"exists":{"field":"hasBatchLotNumber"}}],"must_not":[{"exists":{"field":"hasSerialNumber"}}]}}}' | jq -r '.count // "?"')
instances_total=$(os "$OS/products-*/_count" -d '{"query":{"exists":{"field":"hasSerialNumber"}}}' | jq -r '.count // "?"')
echo "  products-*: $classes_total lot class document(s), $instances_total instance document(s) in total"

cyan "▸ Entry-path product documents (lot + serial in the _id) (_id 01/*/10/*/21/*) in products-*"
os "$OS/products-*/_search?size=5000" -d '{"query":{"bool":{"filter":[{"exists":{"field":"hasBatchLotNumber"}},{"exists":{"field":"hasSerialNumber"}}]}},"_source":true}' \
  | jq '[.hits.hits[] | select(._id | test("^01/[^/]+/10/[^/]+/21/"))]' > "$RUN_DIR/products.json"
P_COUNT=$(jq 'length' "$RUN_DIR/products.json")
jq -r '.[] | "  \(._index)  \(._id)  gtin=\(._source.gtin)  lot=\(._source.hasBatchLotNumber)  serial=\(._source.hasSerialNumber)  updatedAt=\(._source.updatedAt // "-")"' "$RUN_DIR/products.json"
echo "  $P_COUNT entry-path product document(s)"

cyan "▸ Entry-path linksets (path 01/*/10/*/21/*) in linksets-*"
os "$OS/linksets-*/_search?size=5000" -d '{"query":{"wildcard":{"path":{"value":"01/*/10/*/21/*"}}},"_source":true}' \
  | jq '[.hits.hits[]]' > "$RUN_DIR/linksets.json"
L_COUNT=$(jq 'length' "$RUN_DIR/linksets.json")
jq -r '.[] | "  \(._index)  \(._id)  path=\(._source.path)  entries=\(._source.linkset|length)"' "$RUN_DIR/linksets.json"
echo "  $L_COUNT entry-path linkset(s)"
echo "  export: $RUN_DIR"

if [[ "$APPLY" -ne 1 ]]; then
  ylw "dry-run: nothing changed. Re-run with --apply to migrate."
  exit 0
fi

# ------------------------------------------------------------------ apply
failed=0
# Serial-path of an entry path id/path: drop the /10/{lot} segment.
serial_path() { jq -rn --arg p "$1" '$p | sub("/10/[^/]+/21/"; "/21/")'; }

cyan "▸ Migrating $P_COUNT product document(s)"
while IFS= read -r hit; do
  index=$(jq -r '._index' <<<"$hit"); entry path_id=$(jq -r '._id' <<<"$hit")
  target_id=$(serial_path "$entry path_id")
  target=$(os "$OS/$index/_doc/$(enc "$target_id")")
  if [[ "$(jq -r '.found' <<<"$target")" == "true" ]]; then
    # Field by field: the record with the newer updatedAt wins; the lot is set
    # regardless (the entry-path document IS the statement "this serial belongs to this lot").
    merged=$(jq -n --argjson a "$(jq '._source' <<<"$hit")" --argjson t "$(jq '._source' <<<"$target")" '
      (if ($a.updatedAt // "") > ($t.updatedAt // "") then ($t * $a) else ($a * $t) end)
      | .hasBatchLotNumber = $a.hasBatchLotNumber')
    mode="merged into existing"
  else
    merged=$(jq '._source' <<<"$hit")
    mode="re-keyed"
  fi
  merged=$(jq --arg id "$target_id" 'if (.id? | type) == "string" then .id |= sub("/10/[^/]+/21/"; "/21/") else . end' <<<"$merged")
  code=$(os -o /dev/null -w '%{http_code}' -X PUT "$OS/$index/_doc/$(enc "$target_id")?refresh=true" -d "$merged")
  if [[ "$code" =~ ^20[01]$ ]]; then
    dcode=$(os -o /dev/null -w '%{http_code}' -X DELETE "$OS/$index/_doc/$(enc "$entry path_id")?refresh=true")
    grn "  $index  $entry path_id -> $target_id  ($mode; write $code, delete entry path $dcode)"
  else
    red "  $index  $entry path_id -> $target_id  write FAILED ($code)"; failed=$((failed+1))
  fi
done < <(jq -c '.[]' "$RUN_DIR/products.json")

cyan "▸ Migrating $L_COUNT linkset(s)"
while IFS= read -r hit; do
  index=$(jq -r '._index' <<<"$hit"); entry path_id=$(jq -r '._id' <<<"$hit")
  entry path_path=$(jq -r '._source.path' <<<"$hit"); target_path=$(serial_path "$entry path_path")
  # The entry path document with every path/anchor rewritten to the serial form.
  rekeyed=$(jq --arg tp "$target_path" '
    .path = $tp | .pathTree = $tp
    | .anchor = ((.anchor // []) | map(sub("/10/[^/]+/21/"; "/21/")))
    | .linkset = ((.linkset // []) | map(.anchor |= sub("/10/[^/]+/21/"; "/21/")))' <<<"$(jq '._source' <<<"$hit")")
  target=$(os "$OS/$index/_doc/$(enc "$target_path")")
  if [[ "$(jq -r '.found' <<<"$target")" == "true" ]]; then
    # Union per anchor and link type, links identified by href; the target's
    # description and take-over markers stay.
    merged=$(jq -n --argjson a "$rekeyed" --argjson t "$(jq '._source' <<<"$target")" '
      def meta: ["anchor","itemDescription","adoptedLinkTypes","itemDescriptionAdopted"];
      def merge_entry($te; $ae):
        reduce ($ae | to_entries[] | select(.key as $k | (meta | index($k)) == null)) as $rel ($te;
          .[$rel.key] = (((.[$rel.key] // []) + $rel.value) | unique_by(.href)));
      $t | .linkset = (reduce ($a.linkset // [])[] as $ae ($t.linkset // [];
            if any(.[]; .anchor == $ae.anchor)
            then map(if .anchor == $ae.anchor then merge_entry(.; $ae) else . end)
            else . + [$ae] end))
        | .linkType = ([.linkset[] | to_entries[] | select(.key as $k | (meta | index($k)) == null) | .key] | unique)
        | .languages = ((([.linkset[] | to_entries[] | select(.key as $k | (meta | index($k)) == null) | .value[]? | .hreflang[]?] ) + ($t.languages // [])) | unique)
        | .anchor = ([.linkset[].anchor] | unique)
        | .itemDescription = ([.linkset[].itemDescription | select(. != null and . != "")] | unique)')
    mode="merged into existing"
  else
    merged=$rekeyed; mode="re-keyed"
  fi
  code=$(os -o /dev/null -w '%{http_code}' -X PUT "$OS/$index/_doc/$(enc "$target_path")?refresh=true" -d "$merged")
  if [[ "$code" =~ ^20[01]$ ]]; then
    dcode=$(os -o /dev/null -w '%{http_code}' -X DELETE "$OS/$index/_doc/$(enc "$entry path_id")?refresh=true")
    grn "  $index  $entry path_path -> $target_path  ($mode; write $code, delete entry path $dcode)"
  else
    red "  $index  $entry path_path -> $target_path  write FAILED ($code)"; failed=$((failed+1))
  fi
done < <(jq -c '.[]' "$RUN_DIR/linksets.json")

[[ "$failed" -eq 0 ]] || { red "$failed step(s) failed — export kept in $RUN_DIR"; exit 1; }
grn "✓ migration applied ($ENV): $P_COUNT product(s), $L_COUNT linkset(s). Export in $RUN_DIR"
