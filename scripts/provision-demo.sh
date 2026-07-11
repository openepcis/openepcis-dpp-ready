#!/usr/bin/env bash
#
# provision-demo.sh — Canonical, idempotent provisioner for the OpenEPCIS DPP
# demo catalogue (the 11 products the DDM `demo-catalog.ts` resolves, their
# product images, the manufacturer organizations, and the per-product EPCIS
# traceability link). One command, one source of truth.
#
# Supersedes the scattered flow (seed-dev-demo.sh + upload-product-images.sh +
# seed-organizations.sh + provision-demo-epcis-links.sh + refresh-dev-demo.sh),
# and deliberately does NOT touch persona passwords (unlike seed-dev-passports.sh).
#
# WHY a single script:
#   - The 11-product catalogue (9 canonical + Fjordline/Amperia heroes) lived
#     split across scripts; only some knew the hero GTINs.
#   - Images were attached with a GET-modify-PUT that re-populates the resolver
#     linkset and silently drops links (masterData/epcis). Here images are
#     EMBEDDED in the product POST body, so one write yields a complete linkset.
#   - `USERNAME` is a special read-only parameter in zsh (it reflects the login
#     user), so `USERNAME=demo-admin …` was silently ignored. This script reads
#     SEED_USER instead, with a correct per-env default (demo -> demo-admin).
#
# Usage:
#   SEED_PW=… SEED_CLIENT_SECRET=… scripts/provision-demo.sh --env=demo
#   scripts/provision-demo.sh --env=demo --only=products      # one phase
#   scripts/provision-demo.sh --env=demo --only=orgs,epcis
#   scripts/provision-demo.sh --env=demo --events             # also capture EPCIS events
#   scripts/provision-demo.sh --env=demo --dry-run
#
# Env (BRUNO_* accepted as fallbacks for the old muscle memory):
#   SEED_PW / BRUNO_PW                     password of SEED_USER in realm `openepcis`
#   SEED_CLIENT_SECRET / BRUNO_CLIENT_SECRET  secret of the backend-service client
#   SEED_USER            override the seed user (default per-env; demo=demo-admin)
#   Optional overrides: DL_URL FILES_URL AUTH_URL API_URL SEED_CLIENT_ID
#
# Phases (default: products orgs epcis verify): products, orgs, epcis, events, verify.
set -uo pipefail

# ------------------------------------------------------------------ args
ENV=demo; ONLY=""; DRY=0; WANT_EVENTS=0
for arg in "$@"; do
  case "$arg" in
    --env=*)   ENV="${arg#--env=}" ;;
    --only=*)  ONLY="${arg#--only=}" ;;
    --events)  WANT_EVENTS=1 ;;
    --dry-run) DRY=1 ;;
    -h|--help) grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; exit 64 ;;
  esac
done

# ------------------------------------------------------------------ env
case "$ENV" in
  dev)   : "${DL_URL:=https://id.dev.epcis.cloud}";   : "${FILES_URL:=https://files.dev.epcis.cloud}";   : "${AUTH_URL:=https://keycloak.dev.epcis.cloud}"; : "${API_URL:=https://api.dev.epcis.cloud}";   DEF_USER=admin ;;
  demo)  : "${DL_URL:=https://id.demo.epcis.cloud}";  : "${FILES_URL:=https://files.demo.epcis.cloud}";  : "${AUTH_URL:=https://auth.demo.epcis.cloud}";    : "${API_URL:=https://api.demo.epcis.cloud}";  DEF_USER=demo-admin ;;
  local) : "${DL_URL:=https://id.epcis.local:8443}";  : "${FILES_URL:=https://files.epcis.local:8443}";  : "${AUTH_URL:=https://auth.epcis.local:8443}";    : "${API_URL:=https://api.epcis.local:8443}";  DEF_USER=admin ;;
  *) echo "Unknown --env: $ENV (expected dev|demo|local)" >&2; exit 64 ;;
esac
REALM="${REALM:-openepcis}"
SEED_CLIENT_ID="${SEED_CLIENT_ID:-backend-service}"
SEED_USER="${SEED_USER:-$DEF_USER}"                    # NOT $USERNAME — zsh reserves that
SEED_PW="${SEED_PW:-${BRUNO_PW:-}}"
SEED_CLIENT_SECRET="${SEED_CLIENT_SECRET:-${BRUNO_CLIENT_SECRET:-}}"
TOKEN_URL="$AUTH_URL/realms/$REALM/protocol/openid-connect/token"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMAGES_DIR="${IMAGES_DIR:-$REPO_ROOT/scripts/images}"
ORG_BRU_DIR="$REPO_ROOT/bruno/digital-link-resolver/04-organizations"

PHASES="${ONLY:-products orgs epcis verify}"
PHASES="${PHASES//,/ }"
[ "$WANT_EVENTS" -eq 1 ] && PHASES="$PHASES events"

cyan(){ printf '\033[36m%s\033[0m\n' "$*"; }
red(){ printf '\033[31m%s\033[0m\n' "$*"; }
grn(){ printf '\033[32m%s\033[0m\n' "$*"; }
ylw(){ printf '\033[33m%s\033[0m\n' "$*"; }
has(){ [[ " $PHASES " == *" $1 "* ]]; }

# ------------------------------------------------------------------ catalogue
# gtin | seed JSON-LD (repo-relative) | image slug | description
PRODUCTS=(
  "09521000001428|extensions/eu/textile/examples/garment-product.jsonld|alpine-pro-winter-jacket|Alpine Pro Winter Jacket"
  "09521000002159|extensions/eu/textile/examples/footwear-product.jsonld|trailrunner-shoe|TrailRunner Performance Shoe"
  "09521000004207|extensions/eu/textile/examples/garment-set-itip.jsonld|business-suit|Classic Business Suit"
  "09521001001380|extensions/eu/textile/examples/hometextile-bedlinen.jsonld|bed-linen-set|Casa Lina Organic Cotton Bed Linen Set"
  "09521002005004|extensions/eu/battery/examples/battery-product.jsonld|industrial-battery-im500|EcoCell Industrial Battery Module IM-500"
  "09521003000442|extensions/eu/battery/examples/portable-ebike-battery.jsonld|ebike-battery-vp48|VeloPower e-bike Battery Pack VP-48V-14Ah"
  "09521004005019|extensions/eu/ppwr/examples/beverage-bottle.jsonld|water-bottle-500ml|Mountain Spring 500 mL PET Bottle"
  "09521005000808|extensions/eu/ppwr/examples/multi-layer-pouch.jsonld|snack-pouch-80g|FlexiSnack Multi-layer Pouch"
  "09521006003013|extensions/eu/ppwr/examples/ecommerce-carton.jsonld|ecommerce-carton|EcoFlow corrugated shipping carton"
  "09521234003007|extensions/eu/textile/examples/fjordline-aurora-model.jsonld|fjordline-aurora-shell|Fjordline Aurora Shell jacket"
  "09521234002000|extensions/eu/battery/examples/amperia-staxwall-model.jsonld|amperia-staxwall-10|Amperia StaxWall 10 Home Battery"
)

# ------------------------------------------------------------------ auth
TOKEN=""
fetch_token() {
  if [[ -z "$SEED_PW" || -z "$SEED_CLIENT_SECRET" ]]; then
    red "Set SEED_PW and SEED_CLIENT_SECRET (or BRUNO_PW / BRUNO_CLIENT_SECRET)." >&2
    red "  SEED_PW            = password of '$SEED_USER' in realm '$REALM'" >&2
    red "  SEED_CLIENT_SECRET = secret of the '$SEED_CLIENT_ID' client" >&2
    exit 64
  fi
  cyan "→ Token for '$SEED_USER' from $TOKEN_URL"
  TOKEN=$(curl -sSk -X POST "$TOKEN_URL" \
    --data-urlencode grant_type=password \
    --data-urlencode "client_id=$SEED_CLIENT_ID" \
    --data-urlencode "client_secret=$SEED_CLIENT_SECRET" \
    --data-urlencode "username=$SEED_USER" \
    --data-urlencode "password=$SEED_PW" \
    --data-urlencode "scope=openid roles" | jq -r '.access_token // empty')
  [[ -n "$TOKEN" ]] || { red "Token request failed (check SEED_USER / SEED_PW / secret)."; exit 1; }
}
auth() { echo "Authorization: Bearer $TOKEN"; }

# ------------------------------------------------------------------ products (+ embedded images)
upload_image() { # gtin key src  -> echoes URL
  local gtin="$1" key="$2" src="$3" mime resp code
  case "$src" in
    *.png) mime=image/png ;; *.jpg|*.jpeg) mime=image/jpeg ;; *.webp) mime=image/webp ;;
    *) red "  unknown image type: $src" >&2; return 1 ;;
  esac
  resp=$(curl -sk -X POST "$FILES_URL/files" -H "$(auth)" \
    -F "file=@$src;type=$mime" -F "key=products/$gtin/$key" -F "anonymous=true" -w '\n%{http_code}')
  code=${resp##*$'\n'}
  [[ "$code" == 20[01] ]] || { red "  image upload $gtin/$key -> $code" >&2; return 1; }
  echo "$FILES_URL/files/products/$gtin/$key"
}

collect_image_urls() { # gtin slug -> prints JSON array of uploaded URLs
  local gtin="$1" slug="$2" src urls=() n=0 url
  for n in 1 2 3 4; do
    for ext in png jpg jpeg webp; do
      src="$IMAGES_DIR/${gtin}-${n}.${ext}"
      [[ -f "$src" ]] && { url=$(upload_image "$gtin" "${slug}-${n}" "$src") && urls+=("$url"); break; }
    done
  done
  if [[ ${#urls[@]} -eq 0 ]]; then
    for ext in png jpg jpeg webp; do
      src="$IMAGES_DIR/${gtin}.${ext}"
      [[ -f "$src" ]] && { url=$(upload_image "$gtin" "$slug" "$src") && urls+=("$url"); break; }
    done
  fi
  printf '%s\n' "${urls[@]}" | jq -R . | jq -s .
}

provision_product() { # gtin file slug desc
  local gtin="$1" rel="$2" slug="$3" desc="$4" file="$REPO_ROOT/$2"
  [[ -f "$file" ]] || { red "  missing seed file: $rel"; return 1; }
  if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] product $gtin  ($rel + images)"; return 0; fi
  local urls_json; urls_json=$(collect_image_urls "$gtin" "$slug")
  # Embed the image referencedFile array into the seed body so a single POST
  # yields a complete linkset (no lossy follow-up PUT).
  local body; body=$(jq --argjson urls "$urls_json" --arg desc "$desc" '
    if ($urls|length) > 0 then .referencedFile = ($urls | to_entries | map({
        "type":"gs1:ReferencedFileDetails","fileLanguageCode":"en",
        "contentDescription": ($desc + " (image " + ((.key+1)|tostring) + ")"),
        "referencedFileType": {"id":"gs1:ReferencedFileTypeCode-PRODUCT_IMAGE"},
        "id": .value, "referencedFileURL": .value })) else . end' "$file")
  # Idempotent: delete-then-create so the linkset is rebuilt cleanly each run.
  curl -sk -o /dev/null -X DELETE "$DL_URL/products/$gtin" -H "$(auth)"
  local code; code=$(curl -sk -o /tmp/pd_prov.json -w '%{http_code}' -X POST "$DL_URL/products" \
    -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true' \
    --data-binary "$body")
  local nimg; nimg=$(echo "$urls_json" | jq 'length')
  case "$code" in
    20[0-2]) grn "  product $gtin ($nimg img) -> $code" ;;
    *) red "  product $gtin -> $code $(jq -rc '.detail // empty' /tmp/pd_prov.json 2>/dev/null)" ;;
  esac
}

# ------------------------------------------------------------------ organizations (compact Bruno bodies)
extract_bru_body() { # bru-file -> JSON body
  python3 -c "
import sys
t=open(sys.argv[1]).read()
i=t.index('body:json'); w=t.index('{', i); s=t.index('{', w+1); d=0
for j in range(s,len(t)):
    if t[j]=='{': d+=1
    elif t[j]=='}':
        d-=1
        if d==0: print(t[s:j+1]); break
" "$1"
}

provision_orgs() {
  cyan "▸ Organizations"
  local f gln code
  for f in "$ORG_BRU_DIR"/create-*.bru; do
    [[ -f "$f" ]] || continue
    extract_bru_body "$f" > /tmp/org_prov.json 2>/dev/null || continue
    gln=$(jq -r '.globalLocationNumber // empty' /tmp/org_prov.json 2>/dev/null)
    [[ -n "$gln" ]] || { ylw "  skip $(basename "$f" .bru) (no GLN / templated)"; continue; }
    if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] org $gln ($(basename "$f" .bru))"; continue; fi
    code=$(curl -sk -o /tmp/orgr_prov.json -w '%{http_code}' -X POST "$DL_URL/organizations" \
      -H "$(auth)" -H 'Content-Type: application/json' -H 'isAnonymousAccessAllowed: true' \
      --data-binary @/tmp/org_prov.json)
    case "$code" in
      20[0-2]) grn "  org $gln -> $code" ;;
      409) ylw "  org $gln -> 409 (exists)" ;;
      *) red "  org $gln -> $code $(jq -rc '.detail // empty' /tmp/orgr_prov.json 2>/dev/null)" ;;
    esac
  done
}

# ------------------------------------------------------------------ epcis traceability link
provision_epcis() { # gtin desc
  local gtin="$1" desc="$2"
  if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] epcis link $gtin"; return 0; fi
  local href="$API_URL/events?MATCH_anyEPC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]+'*'))" "$DL_URL/01/$gtin")"
  local body; body=$(python3 -c "
import json,sys
print(json.dumps([{'action':'add','linkset':[{
 'anchor': sys.argv[1], 'itemDescription': sys.argv[2],
 'epcis':[{'href': sys.argv[3],'title':'EPCIS event history','type':'application/ld+json',
           'hreflang':['en'],'context':['epcis'],'public':True}]}]}]))" \
    "$DL_URL/01/$gtin" "$desc" "$href")
  local code; code=$(curl -sk -o /dev/null -w '%{http_code}' -X PATCH "$DL_URL/01/$gtin" \
    -H "$(auth)" -H 'Content-Type: application/json' -d "$body")
  case "$code" in 20[0-2]) grn "  epcis $gtin -> $code" ;; *) red "  epcis $gtin -> $code" ;; esac
}

# ------------------------------------------------------------------ EPCIS events (optional)
provision_events() {
  cyan "▸ EPCIS events -> $API_URL/capture"
  local f code
  while IFS= read -r f; do
    if [[ "$DRY" -eq 1 ]]; then echo "  [dry-run] event $(basename "$f")"; continue; fi
    code=$(curl -sk -o /dev/null -w '%{http_code}' -X POST "$API_URL/capture" \
      -H "$(auth)" -H 'Content-Type: application/ld+json' --data-binary @"$f")
    case "$code" in 20[0-2]) grn "  $(basename "$f") -> $code" ;; *) red "  $(basename "$f") -> $code" ;; esac
  done < <(find "$REPO_ROOT/extensions/eu"/*/epcis -name '*.jsonld' 2>/dev/null | sort)
}

# ------------------------------------------------------------------ verify
verify() {
  cyan "▸ Verify (resolver-side)"
  local row gtin ok=0 total=0 md dpp img
  for row in "${PRODUCTS[@]}"; do
    IFS='|' read -r gtin _ _ _ <<<"$row"; total=$((total+1))
    md=$(curl -sk -o /dev/null -w '%{http_code}' "$DL_URL/01/$gtin?linkType=gs1:masterData" -H "$(auth)")
    dpp=$(curl -sk -o /dev/null -w '%{http_code}' "$DL_URL/01/$gtin?linkType=gs1:dpp" -H "$(auth)")
    img=$(curl -sk "$DL_URL/01/$gtin?linkType=all" -H "$(auth)" | grep -oiE "$(echo "$FILES_URL"|sed 's#https\?://##')[^\"]*" | wc -l | tr -d ' ')
    if [[ "$md" == 302 && "$dpp" == 302 ]]; then grn "  $gtin  md=$md dpp=$dpp img=$img"; ok=$((ok+1));
    else red "  $gtin  md=$md dpp=$dpp img=$img"; fi
  done
  echo "  $ok/$total products resolve (masterData + dpp)."
}

# ------------------------------------------------------------------ run
cyan "=== provision-demo ($ENV) phases: $PHASES ==="
fetch_token
if has products; then
  cyan "▸ Products (+ embedded images)"
  for row in "${PRODUCTS[@]}"; do IFS='|' read -r g f s d <<<"$row"; provision_product "$g" "$f" "$s" "$d"; done
fi
has orgs   && provision_orgs
if has epcis; then
  cyan "▸ EPCIS traceability links"
  for row in "${PRODUCTS[@]}"; do IFS='|' read -r g f s d <<<"$row"; provision_epcis "$g" "$d"; done
fi
has events && provision_events
has verify && verify
grn "✓ provision-demo complete ($ENV)"
