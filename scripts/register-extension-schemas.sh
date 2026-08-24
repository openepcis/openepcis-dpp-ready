#!/usr/bin/env bash
#
# register-extension-schemas.sh — Register every ref.openepcis.io EPCIS extension JSON
# Schema into an OpenEPCIS repository via the built-in endpoint:
#   POST /userExtension/jsonSchema?namespace=&defaultPrefix=&jsonldContextUrl=  (body = schema)
# so events declaring GS1-Extensions <prefix>=<namespace> validate + capture instead of
# failing closed. Reads scripts/out/extension-schemas.manifest.json (from
# `pnpm run build:extension-schemas`). Idempotent: a namespace already mapped returns a 4xx we treat
# as "already registered".
#
# Usage:
#   API=https://api.demo.epcis.cloud bash scripts/register-extension-schemas.sh
set -uo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API="${API:-https://api.demo.epcis.cloud}"
MANIFEST="$REPO/scripts/out/extension-schemas.manifest.json"
CREDS=/tmp/epcis-demo-users.json; SVC=/tmp/epcis-demo-svc.env
[ -f "$MANIFEST" ] || { echo "ABORT: run 'pnpm run build:extension-schemas' first"; exit 1; }
[ -f "$CREDS" ] && [ -f "$SVC" ] || { echo "ABORT: run scripts/e2e-demo-users.sh first"; exit 1; }
. "$SVC"
PW=$(python3 -c "import json;print([u['password'] for u in json.load(open('$CREDS')) if u['username']=='demo-admin'][0])")
TOK=$(curl -sS -X POST "$TOKEN_URL" --data-urlencode grant_type=password --data-urlencode "client_id=$CLIENT_ID" \
  --data-urlencode "client_secret=$CLIENT_SECRET" --data-urlencode username=demo-admin --data-urlencode "password=$PW" \
  --data-urlencode "scope=openid roles" | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))")
[ -n "$TOK" ] || { echo "ABORT: no demo-admin token"; exit 1; }

echo "Registering extension schemas at $API/userExtension/jsonSchema"
python3 -c "import json;print('\n'.join('%s\t%s\t%s\t%s'%(e['defaultPrefix'],e['namespace'],e['jsonldContextUrl'],e['schemaFile']) for e in json.load(open('$MANIFEST'))))" \
| while IFS=$'\t' read -r prefix ns ctxurl file; do
    code=$(curl -sS -o /tmp/reg.$$ -w '%{http_code}' -X POST \
      "$API/userExtension/jsonSchema?namespace=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$ns")&defaultPrefix=${prefix}&jsonldContextUrl=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$ctxurl")" \
      -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
      --data-binary "@$REPO/$file")
    case "$code" in
      2*)  printf '  %-8s %-3s registered (%s)\n' "$prefix" "$code" "$ns" ;;
      409|400) printf '  %-8s %-3s already mapped / present: %s\n' "$prefix" "$code" "$(head -c 120 /tmp/reg.$$ | tr -d '\n')" ;;
      *)   printf '  %-8s FAIL %-3s %s\n' "$prefix" "$code" "$(head -c 200 /tmp/reg.$$ | tr -d '\n')" ;;
    esac
    rm -f /tmp/reg.$$
  done
echo "done. Verify: capture an event with GS1-Extensions: <prefix>=<namespace> -> job success:true."
