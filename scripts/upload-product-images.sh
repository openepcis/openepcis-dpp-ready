#!/usr/bin/env bash
# Upload product images for the 9 demo GTINs to files.dev.epcis.cloud,
# then PUT each product's master-data with the new image URLs in
# referencedFileDetails.
#
# Inputs (any combination accepted):
#   ./images/<gtin>-<n>.png        — multiple angles, n = 1..N
#   ./images/<gtin>.png            — single image fallback
#   (.jpg, .jpeg, .webp also work)
# If a GTIN has zero images the script logs SKIP and moves on.
#
# Env:
#   BRUNO_PW            — admin password in the openepcis realm
#   BRUNO_CLIENT_SECRET — secret for backend-service in the openepcis realm
#
# Usage:
#   BRUNO_PW=… BRUNO_CLIENT_SECRET=… scripts/upload-product-images.sh
#
# Targets the dev environment (id.dev.epcis.cloud / files.dev.epcis.cloud
# / auth.dev.epcis.cloud). To re-point at another env, override:
#   DL_URL=…  FILES_URL=…  AUTH_URL=…

set -euo pipefail

DL_URL="${DL_URL:-https://id.dev.epcis.cloud}"
FILES_URL="${FILES_URL:-https://files.dev.epcis.cloud}"
AUTH_URL="${AUTH_URL:-https://auth.dev.epcis.cloud}"
REALM="${REALM:-openepcis}"
CLIENT_ID="${CLIENT_ID:-backend-service}"
USERNAME="${USERNAME:-admin}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGES_DIR="${IMAGES_DIR:-$SCRIPT_DIR/images}"

red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }

# C2PA signing is optional. When c2patool is on PATH each image gets a
# minimal Flux.2 provenance manifest embedded before upload. Without it
# the script falls back to uploading the bare PNG with a warning.
# Install with: brew install c2patool   (or download from
# https://github.com/contentauth/c2patool/releases).
SOFTWARE_AGENT_NAME="${SOFTWARE_AGENT_NAME:-Flux.2}"
SOFTWARE_AGENT_VERSION="${SOFTWARE_AGENT_VERSION:-local}"
CLAIM_GENERATOR="${CLAIM_GENERATOR:-OpenEPCIS DPP Demo/1.0}"
C2PA_AVAILABLE=0
if command -v c2patool >/dev/null 2>&1; then
  C2PA_AVAILABLE=1
  green "c2patool detected — images will be signed with a Flux.2 provenance manifest."
else
  yellow "c2patool not on PATH — uploading unsigned. Install with 'brew install c2patool' to enable C2PA."
fi

if [[ -z "${BRUNO_PW:-}" || -z "${BRUNO_CLIENT_SECRET:-}" ]]; then
  red "Set BRUNO_PW and BRUNO_CLIENT_SECRET in the environment." >&2
  exit 1
fi

TOKEN=$(curl -sk -X POST "$AUTH_URL/realms/$REALM/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=password" \
  --data-urlencode "client_id=$CLIENT_ID" \
  --data-urlencode "client_secret=$BRUNO_CLIENT_SECRET" \
  --data-urlencode "username=$USERNAME" \
  --data-urlencode "password=$BRUNO_PW" \
  --data-urlencode "scope=openid roles profile" \
  | jq -r '.access_token // empty')

if [[ -z "$TOKEN" ]]; then
  red "Token fetch failed — check BRUNO_PW / BRUNO_CLIENT_SECRET / $AUTH_URL." >&2
  exit 1
fi

# (gtin, image basename, content-description) triples — matches the
# product names in app/data/demo-catalog.ts.
DEMOS=(
  "09521000001428|alpine-pro-winter-jacket|Alpine Pro Winter Jacket — front"
  "09521000002159|trailrunner-shoe|TrailRunner Performance Shoe — side"
  "09521000004207|business-suit|Classic Business Suit — hanging"
  "09521001001380|bed-linen-set|Casa Lina Organic Cotton Bed Linen Set"
  "09521002005004|industrial-battery-im500|EcoCell Industrial Battery Module IM-500"
  "09521003000442|ebike-battery-vp48|VeloPower e-bike Battery Pack VP-48V-14Ah"
  "09521004005019|water-bottle-500ml|Mountain Spring 500 mL PET Bottle"
  "09521005000808|snack-pouch-80g|FlexiSnack Multi-layer Pouch"
  "09521006003013|ecommerce-carton|EcoFlow corrugated shipping carton"
  "09521234002000|amperia-staxwall-10|Amperia StaxWall 10 Home Battery"
  "09521234003007|fjordline-aurora-shell|Fjordline Aurora Shell jacket"
)

# Optional space-separated GTIN allowlist. When set, only these GTINs are
# processed (e.g. ONLY_GTINS="09521234002000 09521234003007" to (re)image just
# the provenance-demo products without re-PUTting the others' master data).
ONLY_GTINS="${ONLY_GTINS:-}"

# Product images are model-level (they identify the product, not a serial), but
# the provenance-demo products are seeded at three granularities as separate
# Digital Link records (model 01/{gtin}, batch 01/{gtin}/10/{lot}, item
# 01/{gtin}/21/{serial}) by seed-dev-passports.sh. Those batch/item records
# don't inherit the model's referencedFile, so after imaging the model we
# propagate the same images down to each sub-Digital-Link listed here. Format:
#   <gtin>|<space-separated sub-paths, each "10/{lot}" or "21/{serial}">
INSTANCE_IMAGE_TARGETS=(
  "09521234002000|10/LOT-2026-AMP01 21/STAX10-2026-000001"
  "09521234003007|10/LOT-2026-FJ03 21/AUR-2026-000001"
)

sign_with_c2pa() {
  # Embed a minimal C2PA manifest declaring Flux.2 as the creator and
  # marking the asset as AI-generated with training/mining opted out.
  # Returns the path to the signed PNG on stdout; on failure echoes the
  # original src path so the upload still proceeds.
  local gtin="$1" description="$2" src="$3"
  if [[ "$C2PA_AVAILABLE" != "1" ]]; then
    echo "$src"
    return
  fi
  # macOS mktemp -t treats the argument as a name prefix and ignores
  # X-placeholders, so a literal `.XXXXXX.json` ends up in the filename
  # and c2patool can't infer the format. Build explicit paths instead.
  local rand="$$-${RANDOM}-${RANDOM}"
  local manifest="/tmp/c2pa-manifest-${rand}.json"
  local signed="/tmp/c2pa-signed-${rand}.png"
  cat > "$manifest" <<JSON
{
  "claim_generator": "$CLAIM_GENERATOR",
  "title": "$description",
  "assertions": [
    {
      "label": "c2pa.actions",
      "data": {
        "actions": [
          {
            "action": "c2pa.created",
            "digitalSourceType": "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
            "softwareAgent": {
              "name": "$SOFTWARE_AGENT_NAME",
              "version": "$SOFTWARE_AGENT_VERSION"
            }
          }
        ]
      }
    },
    {
      "label": "c2pa.training-mining",
      "data": {
        "entries": {
          "c2pa.ai_training":            { "use": "notAllowed" },
          "c2pa.ai_generative_training": { "use": "notAllowed" },
          "c2pa.data_mining":            { "use": "notAllowed" }
        }
      }
    },
    {
      "label": "stds.schema-org.CreativeWork",
      "data": {
        "@context": "https://schema.org/",
        "@type": "ImageObject",
        "isBasedOn": "https://id.gs1.org/01/$gtin",
        "creator": [
          { "@type": "SoftwareApplication", "name": "$SOFTWARE_AGENT_NAME" }
        ]
      }
    }
  ]
}
JSON
  # c2patool sign — uses its bundled test signer when no --signer/--cert
  # flags are passed, which is the right default for a demo. For
  # production deployments swap in a real signing cert via env vars.
  if c2patool "$src" --manifest "$manifest" --output "$signed" --force >/dev/null 2>&1; then
    rm -f "$manifest"
    echo "$signed"
  else
    yellow "  c2patool failed for $src — uploading unsigned"
    rm -f "$manifest" "$signed"
    echo "$src"
  fi
}

upload_image() {
  local gtin="$1" key="$2" description="$3" src="$4"
  src=$(sign_with_c2pa "$gtin" "$description" "$src")
  local mime
  case "$src" in
    *.png) mime=image/png ;;
    *.jpg|*.jpeg) mime=image/jpeg ;;
    *.webp) mime=image/webp ;;
    *) red "Unknown image type for $src" >&2; return 1 ;;
  esac
  local resp
  resp=$(curl -sk -X POST "$FILES_URL/files" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$src;type=$mime" \
    -F "key=products/$gtin/$key" \
    -F "anonymous=true" \
    -w "\n%{http_code}")
  local body=${resp%$'\n'*}
  local code=${resp##*$'\n'}
  if [[ "$code" != "200" && "$code" != "201" ]]; then
    red "FAIL upload $gtin → $code"; echo "$body" >&2; return 1
  fi
  echo "$FILES_URL/files/products/$gtin/$key"
}

# apply_images FETCH_DL PUT_TARGET LABEL DESCRIPTION URLS_JSON [CONTENT_TYPE]
# Fetch a record's master-data (Accept: application/ld+json so the @context
# comes back — otherwise the PUT would persist null and wipe the extension
# contexts), overlay the gs1:referencedFile image array, and PUT it back.
# CONTENT_TYPE defaults to application/ld+json (accepted by the GTIN-level
# /products/{gtin} endpoint); the /10/{lot} and /21/{serial} sub-path
# endpoints only accept application/json (ld+json → 415).
apply_images() {
  local fetch_dl="$1" put_target="$2" label="$3" desc="$4" urls_json="$5"
  local content_type="${6:-application/ld+json}"
  curl -sk -L -H "Accept: application/ld+json" \
    "$DL_URL$fetch_dl?linkType=masterData" -o /tmp/p.json
  # Each entry sets the JSON-LD entity id + gs1:referencedFileURL to the image
  # URL and marks it PRODUCT_IMAGE (the DLR auto-linkset-populator reads these).
  # `referencedFile` is the ratified GS1 spelling (DTO still aliases the older
  # `referencedFileDetails`).
  jq --argjson urls "$urls_json" --arg desc "$desc" '
    .referencedFile = (
      $urls
      | to_entries
      | map({
          "type": "gs1:ReferencedFileDetails",
          "fileLanguageCode": "en",
          "contentDescription": ($desc + " (image " + ((.key + 1) | tostring) + ")"),
          "referencedFileType": { "id": "gs1:ReferencedFileTypeCode-PRODUCT_IMAGE" },
          "id": .value,
          "referencedFileURL": .value
        })
    )
  ' /tmp/p.json > /tmp/p2.json
  local code
  code=$(curl -sk -X PUT "$DL_URL$put_target" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: $content_type" \
    --data-binary @/tmp/p2.json \
    -w "%{http_code}" -o /tmp/r.json)
  if [[ "$code" =~ ^20[0-2]$ ]]; then green "  PUT $label → $code"
  else red "  FAIL PUT $label → $code"; head -c 300 /tmp/r.json; echo; fi
}

put_product_with_images() {
  local gtin="$1" description="$2"
  shift 2
  local urls=("$@")
  local urls_json
  urls_json=$(printf '%s\n' "${urls[@]}" | jq -R . | jq -s .)
  # 1. The model record (01/{gtin}).
  apply_images "/01/$gtin" "/products/$gtin" "$gtin (${#urls[@]} img)" "$description" "$urls_json"
  # 2. Propagate to any batch/item Digital Links this product carries so every
  #    granularity shows the (model-level) product images.
  local irow ig sub_paths sub
  for irow in "${INSTANCE_IMAGE_TARGETS[@]}"; do
    IFS="|" read -r ig sub_paths <<<"$irow"
    [[ "$ig" == "$gtin" ]] || continue
    for sub in $sub_paths; do
      apply_images "/01/$gtin/$sub" "/products/$gtin/$sub" "$gtin/$sub" "$description" "$urls_json" "application/json"
    done
  done
}

cd "$(dirname "$0")"

if [[ ! -d "$IMAGES_DIR" ]]; then
  red "$IMAGES_DIR not found. Drop generated images there as <gtin>.png and re-run." >&2
  exit 1
fi

for row in "${DEMOS[@]}"; do
  IFS="|" read -r gtin key description <<<"$row"
  if [[ -n "$ONLY_GTINS" && " $ONLY_GTINS " != *" $gtin "* ]]; then
    continue
  fi
  # Collect every numbered variant (<gtin>-1.png, <gtin>-2.png, …) by
  # enumerating candidate paths explicitly and keeping only those that
  # exist. Globbing was off the table — nullglob + an empty match makes
  # `ls` list the cwd, which pulls non-image files into sources.
  sources=()
  for n in 1 2 3 4; do
    for ext in png jpg jpeg webp; do
      candidate="$IMAGES_DIR/${gtin}-${n}.${ext}"
      [[ -f "$candidate" ]] && sources+=("$candidate")
    done
  done
  # Single-image fallback when no numbered variants exist
  if [[ ${#sources[@]} -eq 0 ]]; then
    for ext in png jpg jpeg webp; do
      candidate="$IMAGES_DIR/${gtin}.${ext}"
      [[ -f "$candidate" ]] && sources+=("$candidate") && break
    done
  fi
  # Cap at 4 images per GTIN (in case both -1.png AND -1.jpg exist etc.)
  if [[ ${#sources[@]} -gt 4 ]]; then
    sources=("${sources[@]:0:4}")
  fi
  if [[ ${#sources[@]} -eq 0 ]]; then
    yellow "SKIP $gtin — no image at $IMAGES_DIR/$gtin{-N,}.{png,jpg,jpeg,webp}"
    continue
  fi
  echo "→ $gtin ($description) — ${#sources[@]} image(s)"
  urls=()
  for i in "${!sources[@]}"; do
    src="${sources[$i]}"
    n=$((i + 1))
    url=$(upload_image "$gtin" "${key}-${n}" "$description" "$src") || continue
    echo "  uploaded: $url"
    urls+=("$url")
  done
  if [[ ${#urls[@]} -gt 0 ]]; then
    put_product_with_images "$gtin" "$description" "${urls[@]}"
  else
    red "  FAIL — no successful uploads for $gtin"
  fi
done
