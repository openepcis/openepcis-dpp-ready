# Product Image Prompts — Flux.2 / similar

Each product gets **2–4 angles** so the gallery has something to scroll
through. Save outputs as `<gtin>-1.png`, `<gtin>-2.png`, … `<gtin>-4.png`
under `scripts/images/`; the upload script picks up every numbered
variant it finds.

Suggested negative prompt for all: `text, watermark, logo, low quality, blurry, low resolution, plastic, cgi, render, mannequin`

Common style suffix appended to every prompt (kept here so you can tweak globally):

> Studio product photograph, seamless white background, soft diffused
> overhead softbox lighting, neutral grey floor shadow, sharp focus, true
> colours, photorealistic, 1:1 aspect ratio, 1024×1024.

Recommended generation params: `steps=40`, `guidance=3.5`, `seed=<gtin>-<n>` for reproducibility.

---

## Textile

### 09521234300014 — Alpine Pro Winter Jacket (Navy)
1. **Front hero** — A men's technical winter jacket in deep navy blue, recycled polyester shell with subtle matte sheen, horizontal down-fill quilting baffles across chest, YKK two-way front zipper with brushed metal pull, articulated hood with drawcord, on an invisible mannequin, straight-on front view.
2. **Three-quarter** — Same jacket, three-quarter angle showing one sleeve cuff with elastic gather and front patch pocket flap.
3. **Texture close-up** — Macro shot of the recycled-polyester twill weave on the jacket shell, slight matte sheen, raindrops beading on the DWR-treated surface, fabric fills the frame.
4. **Hood detail** — Top-down view of the hood with the drawcord pulled tight, brushed-metal cord lock visible.

### 09521234300021 — TrailRunner Performance Shoe (Forest Green)
1. **Side profile** — Single right-foot trail running shoe in forest green, knitted recycled mesh upper, vegetable-tanned tan leather toe overlay, light bio-rubber lugged outsole, white sock-liner, side profile centered.
2. **Outsole** — Bottom-up view showing aggressive trail tread, asymmetric lug pattern, embossed centreline arrow.
3. **Pair front** — Both shoes side by side, laces tied identically, facing camera from slightly above.

### 09521234000075 — Classic Two-piece Business Suit (Charcoal)
1. **On hangers** — Single-breasted charcoal pinstripe wool suit, two-button notch-lapel jacket and matching flat-front trousers hung side by side on slim wooden hangers, white dress shirt and burgundy tie tucked behind.
2. **Jacket detail** — Close-up of the lapel with hand-stitched edge, working buttonhole, and dimpled tie knot just below.
3. **Trouser cuff** — Close-up of the trouser cuff with a single turn-up, sharp crease, sitting on a hardwood floor.

### 09521234300038 — Casa Lina Organic Cotton Bed Linen Set
1. **Folded stack** — Pure white organic cotton duvet cover folded into a neat square, matching pillowcase folded on top, percale weave subtly visible, overhead three-quarter view.
2. **Made-up bed** — Same linen styled on a queen bed, light wrinkles, natural daylight from a side window.
3. **Weave macro** — Extreme close-up macro photograph of woven white percale cotton fabric, fabric fills the entire frame edge-to-edge with no folds, no hems, no stack and no background visible, flat single layer of cloth seen straight-on, fine plain weave with one weft thread crossing over and under one warp thread in a regular 1-over-1-under grid, very high thread count (~200 TC), individual cotton threads crisp and matte, smooth slightly cool sheen, subtle natural fibre fuzz, neutral daylight, shallow depth of field with the weave plane in sharp focus.

## Battery

### 09521234000013 — EcoCell Industrial Battery Module IM-500
1. **Front hero** — Sleek minimalist industrial battery module, the size and shape of a Tesla Powerwall scaled down to a desktop appliance, horizontal landscape orientation wider than tall, single seamless matte-graphite aluminium shell with softly rounded edges, completely flat clean front face with only three subtle details: a small flush circular status indicator glowing soft white, a small laser-etched "IM-500" wordmark in light grey, and one single recessed industrial power inlet with one thick black silicone cable plugged in and exiting straight out the back. No screens, no rack ears, no vents, no extra ports, no logos. Apple-product level of restraint. Studio three-quarter view, seamless white background, soft top lighting, photorealistic.
2. **Connector close-up** — Macro of the single power inlet on the back of the module: one recessed circular high-current industrial DC connector seated cleanly in the matte-graphite aluminium shell, one heavy-gauge black silicone cable fully plugged in with a black moulded strain-relief boot, knurled locking collar, no exposed metal, no markings other than tiny embossed "+/−" symbols, clean studio macro.
3. **Rack of three** — Three identical IM-500 modules stacked neatly in a clean minimalist black equipment rack, all power cables routed straight down the right side, no other clutter, soft cool studio lighting, photorealistic.

### 09521234000044 — VeloPower e-bike Battery Pack VP-48V-14Ah
1. **Side hero** — A single integrated e-bike down-tube battery shaped like a long slim rectangular bar (roughly 36 cm long, 8 cm wide, 7 cm tall) with softly rounded corners and a gently tapered profile designed to sit flush inside a bicycle down tube, matte-black anodised aluminium shell, one short end-cap with a recessed circular key barrel and a small rubber-flap charging port, a discrete row of four small capacity LEDs along the side, photographed on its own on a seamless white background in side profile, no bicycle visible, no extra tubes, no T-shapes, no power tool, looks like a clean OEM product render.
2. **End-cap close-up** — Macro of one short end-cap of the same bar-shaped eubat: the recessed cylindrical key barrel with a small ignition-style key inserted, next to it a small rubber flap lifted to reveal the round charging port, soft studio lighting.
3. **Mounting rail underside** — Underside view of the same slim rectangular battery showing the flat mounting face with a continuous T-slot dovetail rail running its full length and two spring-loaded electrical contact pads at one end, photographed flat against a white background.

## Packaging

### 09521234500018 — Mountain Spring 500 mL PET Bottle
1. **Front straight-on** — Clear 500 ml PET water bottle, blue-tinted screw cap with tamper ring, embossed mountain motif on the wall, light condensation on the lower half, straight-on view.
2. **Cap and neck macro** — Tight macro close-up of just the top of the same 500 ml clear PET water bottle, frame filled by the cap and the upper neck of the bottle only (shoulder of the bottle just visible at the bottom edge of the frame, the body of the bottle out of frame), camera at roughly eye-level with the cap, slight three-quarter angle so both the top face and the side of the cap are visible. Blue-tinted screw cap with fine vertical knurled ribs around its side wall, flat top with a small embossed recycling mould mark, still seated on the bottle and connected to the blue tamper-evident ring by intact thin plastic bridges below it (tethered cap design), the threaded PET neck visible just below the tamper ring, condensation droplets on the neck, sharp focus on the cap's knurled edge with shallow depth of field falling off toward the bottle shoulder, seamless white background, photorealistic.
3. **Crushed for recycling** — The same 500 ml clear PET water bottle stepped on and compacted along its long axis into a thin flattened disc roughly 2–3 cm thick — height has collapsed from ~22 cm down to about a quarter of that, walls visibly buckled and accordion-folded with deep concentric crinkle creases, the threaded neck partially squashed sideways, cap removed and lying separately next to it, blue tamper-ring still on the neck, label crumpled, lying flat on its side on a seamless white background, top-down three-quarter view that clearly shows the flattened pancake profile, photorealistic, NOT an upright intact bottle.

### 09521234500025 — FlexiSnack Multi-layer Pouch (80 g)
1. **Stand-up front** — Stand-up snack foil pouch, soft pillow shape, matte silver-grey multi-layer laminate, clear viewing window across lower third, top heat-seal serration, front-on.
2. **Side / gusset** — Side profile showing the gusset and the heat-seal width.
3. **Layer cross-section** — Schematic-style cross-section of the multi-layer laminate (PET / aluminium / PE) labelled at each layer; clean white background, still photographic.

## E-commerce shipping

### 09521234500049 — EcoFlow E-commerce Carton (30×20×15 cm)
1. **Sealed three-quarter** — Plain Kraft-brown corrugated cardboard shipping carton, single-wall, 30×20×15 cm proportions, all flaps closed and tape-sealed, three-quarter angle showing front and one side.
2. **Open top** — Same carton with the top flaps spread open, empty interior, viewed from slightly above.
3. **Stacked column** — Three identical cartons stacked vertically, tape lines aligned.
4. **Corrugated edge** — Macro of the corrugated edge showing the fluted profile, single-wall structure visible.

---

## After generation

Save each variant as `<gtin>-<n>.png` (or `.jpg`/`.webp`) in
`scripts/images/`. Example:

```
scripts/images/
  09521234300014-1.png
  09521234300014-2.png
  09521234300014-3.png
  09521234300014-4.png
  09521234300021-1.png
  ...
```

Then run:

```bash
BRUNO_PW=… BRUNO_CLIENT_SECRET=… ./scripts/upload-product-images.sh
```

The script uploads every numbered variant for a GTIN to
`files.dev.epcis.cloud` and PUTs the product's master-data with the
full list of image URLs under `referencedFileDetails`.

---

## Provenance-demo products (multi-granularity, DDM Provenance widget)

Generated locally with Draw Things (`flux_2_dev`, `steps=18`, `cfg=3.5`)
via its Automatic1111-compatible API at `http://127.0.0.1:7860/sdapi/v1/txt2img`.
Negative prompt used: `text, watermark, logo/brand logo, people, hands,
blurry, distorted, car battery, aa battery, cartoon`.

### 09521234002000 — Amperia StaxWall 10 Home Battery (1024×1024)
1. **Front** — Professional product photograph of a sleek wall-mounted residential home battery energy storage unit, matte white and charcoal grey minimalist Scandinavian industrial design, slim rectangular wall cabinet, small status LED, mounted on a clean light grey modern utility room wall, soft studio lighting, straight-on front view.
2. **Three-quarter** — Same unit, three-quarter angled view showing slim depth, small status display.
3. **Stacked/modular** — Two sleek modular stackable home battery units mounted together on a modern garage utility wall (shows the "modular, stackable" story), soft daylight.

### 09521234003007 — Fjordline Aurora Shell (896×1152 portrait)
1. **Front hero** — Modern 3-layer recycled-polyester waterproof shell jacket, deep fjord blue with subtle grey accents, technical outdoor hardshell with hood and sealed seams, on an invisible ghost mannequin, straight-on front view, clean white studio background.
2. **Three-quarter back** — Same jacket, three-quarter angled back view on invisible ghost mannequin.
3. **Fabric macro** — Close-up of the deep fjord-blue recycled-polyester technical shell fabric with a sealed seam and a matte zipper pull, water droplets beading on the waterproof surface.

Re-image just these two without touching the other demo products:

```bash
ONLY_GTINS="09521234002000 09521234003007" \
  BRUNO_PW=… BRUNO_CLIENT_SECRET=… ./scripts/upload-product-images.sh
```
