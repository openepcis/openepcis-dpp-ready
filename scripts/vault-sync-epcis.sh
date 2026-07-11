#!/usr/bin/env bash
#
# vault-sync-epcis.sh — Consolidate the core operator credentials for the three
# epcis.cloud environments (dev / demo / prod) into the company Vaultwarden as a
# Bitwarden Organization "OpenEPCIS" with one collection per environment.
#
# Idempotent: items are matched by exact name and edited in place, so re-running
# never creates duplicates. Secrets stay in-process; only names/status are printed.
#
# Prerequisites (only you can do these):
#   1. Unlock the vault and export the session:   export BW_SESSION="$(bw unlock --raw)"
#   2. A Bitwarden Organization named "OpenEPCIS" must already exist (the CLI cannot
#      create organizations — make it once in the web vault if absent).
#
# Value sources (authoritative):
#   - prod (epcis.cloud): tofu output   (keycloak_admin_username/password,
#     keycloak_client_secret, postgresql_password, opensearch_admin_password,
#     minio_root_user/password)
#   - demo (demo.epcis.cloud): tofu output (admin/postgres/opensearch/minio) +
#     backend-service client secret via the Keycloak admin API
#   - dev (epcis.cloud-dev): kubectl on talos-dev (no credential tofu outputs)
#   - TF_HTTP_USERNAME/PASSWORD: secrets.env
#
# Usage:  export BW_SESSION=...   then   bash scripts/vault-sync-epcis.sh
set -euo pipefail

TFDIR="${TFDIR:-/Users/sven/Documents/projects/terraform-benelog-pve-kubernetes}"
ORG_NAME="${ORG_NAME:-OpenEPCIS}"
JQ=jq; CURL=curl
: "${BW_SESSION:?export BW_SESSION from 'bw unlock --raw' first}"

command -v bw >/dev/null || { echo "bw CLI not found"; exit 1; }

# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
CREATED=(); UPDATED=(); SKIPPED=(); DUPES=()

# tofu output -raw for an env dir (needs TF_HTTP_* in env). Empty on failure.
tf_out() { # envdir name
  ( set -a; . "$TFDIR/secrets.env" 2>/dev/null; set +a
    cd "$TFDIR/$1" || exit 0
    tofu init -input=false -reconfigure >/dev/null 2>&1 || exit 0
    tofu output -raw "$2" 2>/dev/null ) || true
}

# kubectl secret value (base64-decoded). Empty on failure.
kc_secret() { # kubeconfig ns secret key
  kubectl --kubeconfig "$TFDIR/$1" -n "$2" get secret "$3" -o jsonpath="{.data.$4}" 2>/dev/null | base64 -d 2>/dev/null || true
}

# backend-service client secret via Keycloak admin API (uses initial-admin secret).
kc_client_secret() { # kubeconfig ns authhost
  local ku kp at cid
  ku=$(kubectl --kubeconfig "$TFDIR/$1" -n "$2" get secret keycloak-initial-admin -o jsonpath='{.data.username}' 2>/dev/null | base64 -d 2>/dev/null) || return 0
  kp=$(kubectl --kubeconfig "$TFDIR/$1" -n "$2" get secret keycloak-initial-admin -o jsonpath='{.data.password}' 2>/dev/null | base64 -d 2>/dev/null) || return 0
  [ -n "$ku" ] || return 0
  at=$($CURL -sS -X POST "https://$3/realms/master/protocol/openid-connect/token" \
        --data-urlencode grant_type=password --data-urlencode client_id=admin-cli \
        --data-urlencode "username=$ku" --data-urlencode "password=$kp" 2>/dev/null | $JQ -r '.access_token // empty')
  [ -n "$at" ] || return 0
  cid=$($CURL -sS -H "Authorization: Bearer $at" "https://$3/admin/realms/openepcis/clients?clientId=backend-service" 2>/dev/null | $JQ -r '.[0].id // empty')
  [ -n "$cid" ] || return 0
  $CURL -sS -H "Authorization: Bearer $at" "https://$3/admin/realms/openepcis/clients/$cid/client-secret" 2>/dev/null | $JQ -r '.value // empty'
}

# Upsert a login item (name unique within the org). Args: coll_id name url user pass notes
upsert_login() {
  local coll="$1" name="$2" url="$3" user="$4" pass="$5" notes="$6"
  if [ -z "$pass" ] && [ -z "$user" ]; then SKIPPED+=("$name (no value)"); return 0; fi
  local existing id
  existing=$(echo "$ALL_ITEMS" | $JQ -r --arg n "$name" '.[]|select(.name==$n)|.id' | head -1)
  local body
  body=$($JQ -cn --arg n "$name" --arg u "$user" --arg p "$pass" --arg url "$url" --arg notes "$notes" \
    --arg org "$ORG_ID" --arg coll "$coll" '{
      organizationId:$org, collectionIds:[$coll], folderId:null, type:1, name:$n,
      notes:(if $notes=="" then null else $notes end), favorite:false,
      login:{username:(if $u=="" then null else $u end), password:$p,
             uris:(if $url=="" then [] else [{"match":null,"uri":$url}] end)}
    }')
  if [ -n "$existing" ]; then
    echo "$body" | bw encode | bw edit item "$existing" >/dev/null && UPDATED+=("$name")
  else
    echo "$body" | bw encode | bw create item >/dev/null && CREATED+=("$name")
  fi
}

# Upsert a secure note. Args: coll_id name notes
upsert_note() {
  local coll="$1" name="$2" notes="$3"
  local existing
  existing=$(echo "$ALL_ITEMS" | $JQ -r --arg n "$name" '.[]|select(.name==$n)|.id' | head -1)
  local body
  body=$($JQ -cn --arg n "$name" --arg notes "$notes" --arg org "$ORG_ID" --arg coll "$coll" '{
      organizationId:$org, collectionIds:[$coll], folderId:null, type:2, name:$n,
      notes:$notes, favorite:false, secureNote:{type:0}
    }')
  if [ -n "$existing" ]; then
    echo "$body" | bw encode | bw edit item "$existing" >/dev/null && UPDATED+=("$name")
  else
    echo "$body" | bw encode | bw create item >/dev/null && CREATED+=("$name")
  fi
}

ensure_collection() { # name -> echoes id
  local name="$1" id
  id=$(echo "$ALL_COLLS" | $JQ -r --arg n "$name" '.[]|select(.name==$n)|.id' | head -1)
  if [ -z "$id" ]; then
    bw get template org-collection \
      | $JQ --arg n "$name" --arg org "$ORG_ID" --arg m "$SELF_MEMBER" \
          '.name=$n | .organizationId=$org | .externalId=null | .groups=[] |
           .users=(if $m=="" then [] else [{"id":$m,"readOnly":false,"hidePasswords":false,"manage":true}] end)' \
      | bw encode | bw create org-collection --organizationid "$ORG_ID" >/dev/null 2>&1 \
      || echo "  ! collection '$name' create failed" >&2
    ALL_COLLS=$(bw list org-collections --organizationid "$ORG_ID" 2>/dev/null || echo '[]')
    id=$(echo "$ALL_COLLS" | $JQ -r --arg n "$name" '.[]|select(.name==$n)|.id' | head -1)
  fi
  echo "$id"
}

# ---------------------------------------------------------------------------
# resolve org + collections
# ---------------------------------------------------------------------------
bw sync --force >/dev/null 2>&1 || true
ORG_ID=$(bw list organizations | $JQ -r --arg n "$ORG_NAME" '.[]|select(.name==$n)|.id' | head -1)
[ -n "$ORG_ID" ] || { echo "Organization '$ORG_NAME' not found — create it once in the web vault, then re-run."; exit 1; }
echo "org '$ORG_NAME' = $ORG_ID"
SELF_EMAIL=$(bw status 2>/dev/null | $JQ -r '.userEmail // empty')
SELF_MEMBER=$(bw list org-members --organizationid "$ORG_ID" 2>/dev/null | $JQ -r --arg e "$SELF_EMAIL" '.[]|select(.email==$e)|.id' | head -1)
ALL_COLLS=$(bw list org-collections --organizationid "$ORG_ID" 2>/dev/null || echo '[]')
C_DEV=$(ensure_collection dev); C_DEMO=$(ensure_collection demo); C_PROD=$(ensure_collection prod)
echo "collections: dev=$C_DEV demo=$C_DEMO prod=$C_PROD"
{ [ -n "$C_DEV" ] && [ -n "$C_DEMO" ] && [ -n "$C_PROD" ]; } || {
  echo "!! collection creation failed (see above). Most likely the org key isn't in this"
  echo "   session (MAC decrypt error): run  bw logout && bw login && export BW_SESSION=\$(bw unlock --raw)  then re-run."
  exit 1; }
ALL_ITEMS=$(bw list items --organizationid "$ORG_ID" 2>/dev/null || echo '[]')

# ---------------------------------------------------------------------------
# PROD (epcis.cloud, talos-prod ns openepcis) — via tofu output
# ---------------------------------------------------------------------------
echo "== prod =="
P_ADMU=$(tf_out epcis.cloud keycloak_admin_username); P_ADMU=${P_ADMU:-admin}
P_ADMP=$(tf_out epcis.cloud keycloak_admin_password)
P_CS=$(tf_out epcis.cloud keycloak_client_secret)
P_PG=$(tf_out epcis.cloud postgresql_password)
P_OS=$(tf_out epcis.cloud opensearch_admin_password)
P_MU=$(tf_out epcis.cloud minio_root_user); P_MU=${P_MU:-minio}
P_MP=$(tf_out epcis.cloud minio_root_password)
upsert_login "$C_PROD" "EPCIS · prod · Keycloak admin"            "https://auth.epcis.cloud" "$P_ADMU" "$P_ADMP" "openepcis realm admin (= BRUNO_PW). Console: https://auth.epcis.cloud/admin"
upsert_login "$C_PROD" "EPCIS · prod · backend-service client secret" "https://auth.epcis.cloud/realms/openepcis" "backend-service" "$P_CS" "OIDC client secret (= BRUNO_CLIENT_SECRET)."
upsert_login "$C_PROD" "EPCIS · prod · PostgreSQL (openepcis)"    "https://api.epcis.cloud" "openepcis" "$P_PG" "Postgres app user."
upsert_login "$C_PROD" "EPCIS · prod · OpenSearch admin"          "https://dashboards.epcis.cloud" "admin" "$P_OS" "OpenSearch cluster admin."
upsert_login "$C_PROD" "EPCIS · prod · MinIO root"                "https://api.epcis.cloud" "$P_MU" "$P_MP" "MinIO/S3 root."

# ---------------------------------------------------------------------------
# DEMO (demo.epcis.cloud, talos-prod ns openepcis-demo)
# ---------------------------------------------------------------------------
echo "== demo =="
D_ADMP=$(tf_out demo.epcis.cloud keycloak_admin_password)
[ -n "$D_ADMP" ] || D_ADMP=$(kc_secret talos-prod/kubeconfig openepcis-demo keycloak-credentials password)
D_CS=$(kc_client_secret talos-prod/kubeconfig openepcis-demo auth.demo.epcis.cloud)
D_PG=$(tf_out demo.epcis.cloud postgresql_password)
D_OS=$(tf_out demo.epcis.cloud opensearch_admin_password)
D_MP=$(tf_out demo.epcis.cloud minio_root_password)
upsert_login "$C_DEMO" "EPCIS · demo · Keycloak admin"            "https://auth.demo.epcis.cloud" "admin" "$D_ADMP" "openepcis realm admin (= BRUNO_PW). Bootstrap: k8s openepcis-demo/keycloak-initial-admin (temp-admin)."
upsert_login "$C_DEMO" "EPCIS · demo · backend-service client secret" "https://auth.demo.epcis.cloud/realms/openepcis" "backend-service" "$D_CS" "OIDC client secret (= BRUNO_CLIENT_SECRET)."
upsert_login "$C_DEMO" "EPCIS · demo · PostgreSQL (openepcis)"    "https://api.demo.epcis.cloud" "openepcis" "$D_PG" "Postgres app user."
upsert_login "$C_DEMO" "EPCIS · demo · OpenSearch admin"          "https://api.demo.epcis.cloud" "admin" "${D_OS:-localdev-opensearch-admin}" "Demo OpenSearch admin (fixed literal, matches module bcrypt)."
upsert_login "$C_DEMO" "EPCIS · demo · MinIO root"                "https://files.demo.epcis.cloud" "minio" "$D_MP" "MinIO/S3 root."

# ---------------------------------------------------------------------------
# DEV (epcis.cloud-dev, talos-dev ns openepcis) — no cred tofu outputs, use k8s
# ---------------------------------------------------------------------------
echo "== dev =="
V_ADMP=$(kc_secret talos-dev/kubeconfig openepcis keycloak-credentials password)
V_CS=$(kc_client_secret talos-dev/kubeconfig openepcis auth.dev.epcis.cloud)
V_PG=$(kc_secret talos-dev/kubeconfig openepcis openepcis-postgresql-openepcis-credentials password)
[ -n "$V_PG" ] || V_PG=$(kc_secret talos-dev/kubeconfig openepcis postgresql-openepcis-credentials password)
V_OS=$(kc_secret talos-dev/kubeconfig openepcis opensearch-credentials password)
V_MP=$(kc_secret talos-dev/kubeconfig openepcis minio-credentials password)
upsert_login "$C_DEV" "EPCIS · dev · Keycloak admin"             "https://auth.dev.epcis.cloud" "admin" "$V_ADMP" "openepcis realm admin (= BRUNO_PW)."
upsert_login "$C_DEV" "EPCIS · dev · backend-service client secret"  "https://auth.dev.epcis.cloud/realms/openepcis" "backend-service" "$V_CS" "OIDC client secret (= BRUNO_CLIENT_SECRET)."
upsert_login "$C_DEV" "EPCIS · dev · PostgreSQL (openepcis)"     "https://api.dev.epcis.cloud" "openepcis" "$V_PG" "Postgres app user."
upsert_login "$C_DEV" "EPCIS · dev · OpenSearch admin"           "https://api.dev.epcis.cloud" "admin" "$V_OS" "OpenSearch cluster admin."
upsert_login "$C_DEV" "EPCIS · dev · MinIO root"                 "https://files.dev.epcis.cloud" "minio" "$V_MP" "MinIO/S3 root."

# ---------------------------------------------------------------------------
# Shared: Terraform GitLab HTTP state backend (one token, per-env state paths)
# ---------------------------------------------------------------------------
echo "== shared =="
TF_U=$( ( set -a; . "$TFDIR/secrets.env" 2>/dev/null; set +a; echo "${TF_HTTP_USERNAME:-}" ) )
TF_P=$( ( set -a; . "$TFDIR/secrets.env" 2>/dev/null; set +a; echo "${TF_HTTP_PASSWORD:-}" ) )
upsert_login "$C_PROD" "EPCIS · Terraform backend (GitLab HTTP state)" "https://code.company-group.com" "$TF_U" "$TF_P" \
  "GitLab project 76 terraform state. State paths: prod=epcis-cloud, demo=epcis-cloud-demo, dev=epcis-cloud-dev-dpp, ddm=digital-data-management. Same token for all envs."
upsert_note "$C_DEMO" "EPCIS · demo · persona users" \
  "Realm openepcis personas (API-created): demo-admin, demo-operator, demo-authority, demo-viewer, demo-consumer. Passwords are NOT stored — Keycloak cannot return existing passwords; reset via the admin API to set a known one. demo-admin is in the 'admins' group (resolver tenant-isolation bypass)."

# ---------------------------------------------------------------------------
# Reconcile: flag pre-existing personal-vault items that look epcis-related but
# aren't in the org (candidate duplicates) — report only, never delete.
# ---------------------------------------------------------------------------
echo "== reconcile (candidate duplicates in personal vault) =="
bw list items --search epcis 2>/dev/null \
  | $JQ -r --arg org "$ORG_ID" '.[]|select((.organizationId//"")!=$org)|"  DUPE? \(.name)  [id \(.id)]"' || true
bw list items --search epcis.cloud 2>/dev/null \
  | $JQ -r --arg org "$ORG_ID" '.[]|select((.organizationId//"")!=$org)|"  DUPE? \(.name)  [id \(.id)]"' || true

# ---------------------------------------------------------------------------
# summary
# ---------------------------------------------------------------------------
echo "=== summary ==="
echo "  created: ${#CREATED[@]}   ${CREATED[*]:-}"
echo "  updated: ${#UPDATED[@]}   ${UPDATED[*]:-}"
echo "  skipped (no value): ${#SKIPPED[@]}   ${SKIPPED[*]:-}"
echo "done. Review any DUPE? lines above; tell me which to delete and I'll do a confirmed cleanup pass."
