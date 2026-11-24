# Ink Falls Up (Disobeyed #7, law: gravity) - lessons
Project: `vfx/pieces/ink_falls_up/` (scene.js state/camera/drops, shader.js WebGL2 fragment, render.py, audio.py, CHECKLIST.md). 1080p60, 9s loop, no text.

- WebGL2 renders in headless Chromium via SwiftShader flags (in render.py). The cost is ~1.6-2.7 s/frame at MBK3, so 540 frames take ~25 min on 1 CPU. Iterate on stills; render the full video only after the stills pass.
- Colour semantics: cinnabar/red ink on white paper reads as BLOOD. Sumi black with an indigo Beer fringe (absorb ~vec3(1.55,1.35,1.0)) plus gold flecks reads as premium ink-in-water.
- Plume shapes: a symmetric stem with two vortex lobes reads as anatomy (uterus), and two equal-height spirals read as a face (eyes). Kill the stem, put the lobes at unequal heights and sizes, weaken the roll spiral, and add a pooled base veil along the surface.
- A hard bounding-box early-out in a density field shows as a rectangular cut once you add wide features. Widen the bounds along with the feature.
- Rain: vertical dots read as sparse specks. Tails along the velocity (from the previous position) work, but if they are long they read as thorns; cap them around 110px.
- Spring camera: it needs lead plus stiffness to frame fast action (the rise to the ceiling).
- v2 status [slack, 2026-11-22]: delivered as a development cut, self-scored 6.5/10. Round-3 plan: open on the snap, a bigger hero drop with a trail, a refraction shockwave instead of the flash ring, one dominant bloom, rhythmic rain the brush gulps. Files: scene_v1/shader_v1 = v1; current = v2.

## v3/v4 status + lessons [slack, 2026-11-23]
- v3 7.4/10 (F0CKX1Q3S8M), v4 8.1/10 (F0CKM1L72DD): impact 7.5, opening 7.5 still <8. Round-5 plan: round the impact blob into a ring + needle jet; slow push-in + bristle tremble pre-snap.
- `abs(x-e.y)` in ripple displacement makes a cusp -> vertical refraction seam ("black square"). Use sqrt((x-e.y)^2+900).
- Cut a slow opening while keeping the loop: time-warp the scene (x1.9 over 0.35-1.95), render in output time, export warp table for audio (audio.py UW()).
- Plume "limbs/arms": isolate terms one at a time with single stills. The real culprit was the elliptical cap ring `ce`, not lobes or puffs (also removed seg filaments in v3).
- Rain waves timed by arrival (tp = wave - T).
- Full 500-frame MBK3 render ~13-21 min on 1 CPU; check one still per term before re-rendering.
