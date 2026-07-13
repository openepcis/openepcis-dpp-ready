#!/usr/bin/env bash
#
# gen-drawthings.sh — generate product-gallery images locally with Draw Things
# (Flux.2 Klein) via its Automatic1111-compatible HTTP API, and drop them into
# scripts/images/<gtin>-<n>.png where provision-demo.sh picks them up.
#
# Prompts live in scripts/product-image-prompts.md (human copy) and are mirrored
# here per GTIN so this stays runnable without parsing markdown. Each product's
# composition supplies its own lighting/background, so no global style suffix is
# appended — only the per-product negative prompt below.
#
# Prereq: Draw Things running with the HTTP API enabled (default :7860) and a
# Flux.2 Klein checkpoint loaded (flux_2_klein_*). Check:
#   curl -s http://127.0.0.1:7860/sdapi/v1/options | jq -r .model
#
# Usage:
#   scripts/gen-drawthings.sh 09521890340331            # all variants
#   scripts/gen-drawthings.sh 09521890340331 1 3        # only variants 1 and 3
#   DT_URL=http://127.0.0.1:7860 STEPS=24 CFG=4 scripts/gen-drawthings.sh <gtin>
set -uo pipefail

GTIN="${1:-}"; shift || true
[[ -n "$GTIN" ]] || { echo "usage: $0 <gtin> [variant ...]" >&2; exit 64; }

DT_URL="${DT_URL:-http://127.0.0.1:7860}"
STEPS="${STEPS:-24}"
CFG="${CFG:-4}"
WIDTH="${WIDTH:-1024}"
HEIGHT="${HEIGHT:-1024}"
SAMPLER="${SAMPLER:-Euler a}"
# Draw Things ships with Hi-Res Fix + a 4x ESRGAN upscaler on by default, which
# renders 1024 requests at 4096 (~26 MB PNGs). Keep it off for web-sized gallery
# images; set HIRES=1 to leave the app's setting untouched.
HIRES="${HIRES:-0}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${IMAGES_DIR:-$REPO_ROOT/scripts/images}"
mkdir -p "$OUT_DIR"

# Per-product prompt sets. Add a new `case` arm to support another GTIN.
NEG=""
PROMPTS=()
case "$GTIN" in
  09521890340331) # Organic Tee — Organic Corp.
    NEG="text, printing, logo, letters, numbers, qr code, barcode, watermark, hangtag, price tag, swing tag, string, tablet, phone, device, screen, perspective distortion, tilted angle, oversaturated, cartoonish, wool, woolen, chunky knit, cable knit, ribbed sweater, coarse thick yarn, fuzzy fluffy fibres"
    PROMPTS=(
"Clean product photograph, top-down flat lay shot straight from directly above, no perspective distortion. A single soft organic cotton t-shirt in a calm organic green-teal (around #8FB3A6) lies flat and fills most of the frame, neatly arranged with short sleeves relaxed to the sides and a crew neckline, fine cotton weave and gentle natural folds, high fabric detail. Nothing else in the scene: no hangtag, no label, no tablet, no props. Soft even natural daylight, gentle realistic shadows, seamless pale neutral surface. Overall palette: fresh organic green-blue evoking sustainability and circular economy, muted eucalyptus and teal, soft and premium. Looks like a real photograph taken in a studio, natural and believable, minimalist modern corporate aesthetic."
"Clean product photograph, top-down flat lay shot straight from directly above, no perspective distortion. A single soft organic cotton t-shirt in a calm organic green-teal (around #8FB3A6) neatly folded into a tidy rectangle, centred and filling most of the frame, crisp folded edges, fine cotton weave and subtle fabric texture clearly visible, a small blank sewn-in neck label just peeking at the top fold. Soft even natural daylight, gentle realistic shadows, seamless pale neutral surface. Overall palette: fresh organic green-blue evoking sustainability and circular economy, muted eucalyptus and teal, soft and premium. Looks like a real studio photograph, natural and believable, minimalist modern corporate aesthetic."
"Extreme close-up macro photograph of a lightweight fine single-jersey cotton t-shirt fabric in a calm organic green-teal (around #8FB3A6), the smooth cotton knit fills the entire frame edge to edge, single flat thin layer of cloth seen straight-on. Very fine tight jersey knit of thin combed cotton yarn, tiny uniform V-shaped stitches in a smooth flat surface, the soft matte low-relief texture of everyday t-shirt cotton, NOT wool, NOT a chunky or ribbed sweater, no thick coarse yarn, no fluffy fibres. Smooth slightly cool cotton sheen, neutral daylight, shallow depth of field with the fabric plane in sharp focus. Overall palette muted eucalyptus and teal, soft and premium, photorealistic, natural and believable."
    )
    ;;
  *) echo "No prompt set defined for GTIN $GTIN in $0" >&2; exit 64 ;;
esac

# Which variants to render (default: all)
WANT=("$@"); [[ ${#WANT[@]} -eq 0 ]] && WANT=($(seq 1 ${#PROMPTS[@]}))

model=$(curl -s --max-time 5 "$DT_URL/sdapi/v1/options" | jq -r '.model // empty')
[[ -n "$model" ]] || { echo "Draw Things API not reachable at $DT_URL (is the HTTP API on?)" >&2; exit 1; }
if [[ "$HIRES" != "1" ]]; then
  curl -s -o /dev/null -X POST "$DT_URL/sdapi/v1/options" \
    -H 'Content-Type: application/json' -d '{"hires_fix": false}'
  echo "→ Hi-Res Fix disabled (native ${WIDTH}x${HEIGHT}); set HIRES=1 to keep it on"
fi
echo "→ Draw Things model: $model  ($STEPS steps, cfg $CFG, ${WIDTH}x${HEIGHT}, sampler '$SAMPLER')"

for n in "${WANT[@]}"; do
  idx=$((n - 1))
  [[ $idx -ge 0 && $idx -lt ${#PROMPTS[@]} ]] || { echo "  skip variant $n (out of range)" >&2; continue; }
  out="$OUT_DIR/${GTIN}-${n}.png"
  body=$(jq -n --arg p "${PROMPTS[$idx]}" --arg neg "$NEG" \
    --argjson steps "$STEPS" --argjson cfg "$CFG" \
    --argjson w "$WIDTH" --argjson h "$HEIGHT" --argjson seed "$n" --arg sampler "$SAMPLER" \
    '{prompt:$p, negative_prompt:$neg, steps:$steps, cfg_scale:$cfg, width:$w, height:$h, seed:$seed, sampler_name:$sampler, batch_size:1}')
  echo "  variant $n → $out"
  b64=$(curl -s --max-time 600 -X POST "$DT_URL/sdapi/v1/txt2img" \
    -H 'Content-Type: application/json' -d "$body" | jq -r '.images[0] // empty')
  [[ -n "$b64" ]] || { echo "    FAILED (empty response)" >&2; continue; }
  echo "$b64" | base64 --decode > "$out"
  echo "    wrote $(wc -c < "$out" | tr -d ' ') bytes"
done
echo "✓ done ($OUT_DIR)"
