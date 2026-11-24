# Scarlet Sheath (緋鞘) — style bible, timeline, lessons

Reference: X post by @Ssr360535694 (status 2122934850407510386), 1920x1080 60fps, 14.58s → `(see engine/examples)`.
Final engine (v3, elang: "already better", asked to save it 2026-11-19): `(see engine/examples)` (scene3.html + v3_katana.js, v3_sheath.js, v3_eye.js, fonts, render.py, audio3.py, cmp tools). Measured grids/sheets: `(see engine/examples)`.

## Look
- Two worlds that cut hard into each other: **ink-on-paper** (paper #ecebe6 / measured #e8e7e3–#f2f1ef, faint 14px dot grid, ink #141014, red #c8102e, gold #d9a441) and **dark molten glow** (#0b090c bg, orange halftone dots, additive glows white-hot core → #ff8a3a → #ff3a10).
- Comic print grammar: halftone discs, spiky comic bursts used as wipes, stamps/seal with splatter, glitch title card (serif kanji + brush latin).
- Hit punctuation: 1–2 frame colour inversion (difference + hue-rotate 180), decaying noise camera shake, white flash frame with black slit before the eye.
- Every big move has motion blur (4 sub-frames, 1/120 shutter) and lands with deceleration (eOut/eOut5); snaps (sheath lock) use eIn2 over 3 frames.

## Signature motion systems (all in vfx_core.js or the v3 modules)
| System | Key idea |
|---|---|
| Gathering lines | 130 log-spiral arms whose radius collapses into the focus (tsuba) and accelerate on arrival; open tapered paths, never closed orbiting rings. Modes ink / glow / hot. |
| Brush ring | trim-path draw-on of a 44-strand dry-brush arc with black under-stroke, inner shadow, highlight, optional glow. |
| Spike-burst wipe | evenodd fill of a spikeStar hole shrinking → cut to dark. |
| Blade slash | katana-shaped white-hot smear (thick tail → point), 3 additive layers + dark outline. |
| Crescent smear | red trail built from the tip's pose HISTORY (sample swordPose(t-i*dt)), alpha keyed to tip speed. |
| Eye | molten lens (fitted outline with noise wobble, inner edge thickens toward tips), black almond with heavy lids, shard iris + slit, blink 7.08–7.45, pinwheel vortex pupil, radial speed lines. |
| Halftone dissolve | dark layer masked through round halftone dots ordered by a slash-band + noise field; coloured fragments on the dissolve front. |
| Sheath choreography | measured pose keys (tsuba x,y,angle) → catmull-rom; after 11.0 the blade is driven RELATIVE to the saya axis (distance, perpendicular offset, extra angle) so insertion stays glued; lock 11.42→11.47. |
| Katana art | curved centreline bow() (sori), cream X-wrap tsuka, black-rimmed gold tsuba, kintsugi cracks, ribbed red foot, ofuda after lock, sageo cord flips up then hangs. |

## Measured timeline (real time, s)
cut to dark 1.067 · slash 2.967 · inversions 3.033 / 9.266 / 9.787 · rift 3.95 · eye flash 4.767 · eye 4.8–9.25 (blink 7.17–7.42, band dim 8.45–9.05) · giant slash 9.22–9.3 · halftone dissolve 9.82–10.78 · swing 10.3–11.0 · sheath lock 11.42–11.47 · close-up push → stamp slam 13.33 · end 14.6.

## Lessons (what failed before it got good)
- v1 copied the *objects* and timed by eye → felt wrong. v2 fixed timing with 60fps scene detection, still scored ~6–7. v3 measured poses and colours numerically → ~8–8.5.
- "Renders at 60fps / deterministic" is not a visual pass. Only side-by-side frames count.
- elang spotted "lines circle instead of gather" in seconds: check the *direction of motion* of every particle system against the original strip, not just its shape.
- Don't redraw what you can measure: pose keys, lens shape and band colours came from grids + colorprobe and moved scores more than any polish.
- Remaining known gaps at save time: energy curves too orderly, plasma contour/eyelid shading, ink breakup too round (original = fragmented print texture), stamp splatter, lens tilt 4.8–5.6s.
- SFX: soft, band-limited, enveloped; elang finds harsh noise bursts bad. I can't listen, so say that the mix is unheard.
