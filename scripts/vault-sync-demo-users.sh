#!/usr/bin/env bash
#
# vault-sync-demo-users.sh — Store the 5 demo persona login credentials (produced
# by e2e-demo-users.sh in /tmp/epcis-demo-users.json) into the Vaultwarden
# Organization "OpenEPCIS", collection "demo", as Bitwarden login items:
#   EPCIS · demo · persona · {Admin|Operator|Authority|Viewer|Consumer}
# Idempotent (match by exact name -> edit else create; no duplicates).
#
# Prereqs: export BW_SESSION="$(bw unlock --raw)"; org "OpenEPCIS" exists (CLI can't
# create orgs). Reads /tmp/epcis-demo-users.json (run e2e-demo-users.sh first).
#
# Usage: export BW_SESSION=...  then  bash scripts/vault-sync-demo-users.sh
set -euo pipefail
ORG_NAME="${ORG_NAME:-OpenEPCIS}"
CREDS="${CREDS:-/tmp/epcis-demo-users.json}"
JQ=jq
: "${BW_SESSION:?export BW_SESSION from 'bw unlock --raw' first}"
command -v bw >/dev/null || { echo "bw CLI not found"; exit 1; }
[ -f "$CREDS" ] || { echo "ABORT: $CREDS not found — run scripts/e2e-demo-users.sh first"; exit 1; }

CREATED=(); UPDATED=()
title() { case "$1" in demo-admin) echo Admin;; demo-operator) echo Operator;; demo-authority) echo Authority;; demo-viewer) echo Viewer;; demo-consumer) echo Consumer;; *) echo "$1";; esac; }

bw sync --force >/dev/null 2>&1 || true
ORG_ID=$(bw list organizations | $JQ -r --arg n "$ORG_NAME" '.[]|select(.name==$n)|.id' | head -1)
[ -n "$ORG_ID" ] || { echo "Organization '$ORG_NAME' not found — create it once in the web vault."; exit 1; }
SELF_EMAIL=$(bw status 2>/dev/null | $JQ -r '.userEmail // empty')
SELF_MEMBER=$(bw list org-members --organizationid "$ORG_ID" 2>/dev/null | $JQ -r --arg e "$SELF_EMAIL" '.[]|select(.email==$e)|.id' | head -1)
ALL_COLLS=$(bw list org-collections --organizationid "$ORG_ID" 2>/dev/null || echo '[]')
C_DEMO=$(echo "$ALL_COLLS" | $JQ -r '.[]|select(.name=="demo")|.id' | head -1)
if [ -z "$C_DEMO" ]; then
  bw get template org-collection | $JQ --arg org "$ORG_ID" --arg m "$SELF_MEMBER" \
     '.name="demo"|.organizationId=$org|.externalId=null|.groups=[]|.users=(if $m=="" then [] else [{"id":$m,"readOnly":false,"hidePasswords":false,"manage":true}] end)' \
   | bw encode | bw create org-collection --organizationid "$ORG_ID" >/dev/null
  C_DEMO=$(bw list org-collections --organizationid "$ORG_ID" | $JQ -r '.[]|select(.name=="demo")|.id' | head -1)
fi
[ -n "$C_DEMO" ] || { echo "demo collection missing/uncreatable (org key not in session? re-login)"; exit 1; }
echo "org=$ORG_ID demo-collection=$C_DEMO"
ALL_ITEMS=$(bw list items --organizationid "$ORG_ID" 2>/dev/null || echo '[]')

upsert_login() { # name url user pass notes
  local name="$1" url="$2" user="$3" pass="$4" notes="$5" existing body
  existing=$(echo "$ALL_ITEMS" | $JQ -r --arg n "$name" '.[]|select(.name==$n)|.id' | head -1)
  body=$($JQ -cn --arg n "$name" --arg u "$user" --arg p "$pass" --arg url "$url" --arg notes "$notes" --arg org "$ORG_ID" --arg coll "$C_DEMO" \
    '{organizationId:$org,collectionIds:[$coll],folderId:null,type:1,name:$n,notes:$notes,favorite:false,
      login:{username:$u,password:$p,uris:[{"match":null,"uri":$url}]}}')
  if [ -n "$existing" ]; then echo "$body" | bw encode | bw edit item "$existing" >/dev/null && UPDATED+=("$name")
  else echo "$body" | bw encode | bw create item >/dev/null && CREATED+=("$name"); fi
}

while read -r row; do
  u=$(echo "$row" | $JQ -r .username); p=$(echo "$row" | $JQ -r .password)
  t=$(echo "$row" | $JQ -r .tier);     r=$(echo "$row" | $JQ -r .role)
  upsert_login "EPCIS · demo · persona · $(title "$u")" \
    "https://auth.demo.epcis.cloud" "$u" "$p" \
    "Realm openepcis persona. Tier: $t. Role: $r. Login at any *.demo.epcis.cloud OIDC prompt. Set by e2e-demo-users.sh."
done < <($JQ -c '.[]' "$CREDS")

echo "=== summary ==="
echo "  created: ${#CREATED[@]}  ${CREATED[*]:-}"
echo "  updated: ${#UPDATED[@]}  ${UPDATED[*]:-}"
echo "done. Verify: bw list items --organizationid $ORG_ID | jq -r '.[]|select(.name|startswith(\"EPCIS · demo · persona\"))|.name'"
