# Ensō That Won't Close (Disobeyed series), lessons [2026-11-23]
Source: `vfx/pieces/enso/` (enso.js engine, play.html interactive, scene.html film, render.py/grid.py/build_film.sh/playtest.py, CHECKLIST.md, judge/jN reviews). Interactive: pieces/enso/play.html.
Status: 11 rounds, blind-judge overall 6.56 → 7.92, then a plateau of 7.83–7.92 for 7 rounds (judge noise is about ±0.5 per shot). The ≥8 per-shot gate never passed; the cut and options A/B/C went to elang.

## What worked
- Stroke-space fbm islands for dry-brush breakup (kasure). Judges called it the main strength.
- Moving ends: inverse-map every destination pixel back to its source (no holes, no double density). Split at the wrap.
- Blend overlapping primitives with an overlap field (OV) so the blot head doesn't show a seam.
- Erosion must use continuous noise. Cell-constant fields look stamped.
- Cooling becomes an event when patches flare out one by one, keeping heat alive in thick pockets.
- Test the interactive with real CDP touch (has_touch, is_mobile). A first touch during an intro phase was being dropped. Fix: if pending, speed the clock up 4× and then grab.
- Filament bridges: smooth quadratic outlines, a meniscus at the base and a bead on the growing end. Pointed wedges read as "vector triangles".

## Why it plateaued (fix at the start of the next piece, not in round 10)
- Hand-keyed deformation (the tail sliding along the arc) never reads as elastic. Budget a real bristle/spring sim from round 1.
- A tear drawn as a dark slit with uniformly pale lips reads as an "ink stroke" at phone size. Hole cues are needed: unequal lifted and curled lips, occluded underlight, fibres that snap at staggered times.
- A glow crack-map over the ink reads as an overlay. Char needs matte plates with relief, with the hottest values only at the front.
- Judge at phone scale. Native crops looked good when the delivery-size read did not.
- When 3+ rounds sit inside judge noise, stop and report honestly with options rather than grinding.
