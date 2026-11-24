# The Shadow Draws First (Disobeyed Ep.1): lessons
Original weapon film, 8.2s, 16:9 at 60fps. Source and judge history are in `vfx/pieces/shadow_draws_first/` (scene.js, REVIEW-r1..r5, scorecard.json). It went 6.2 → 6.7 → 7.4 → 7.6 → 7.7 and never passed the gate (every shot ≥8). It was delivered as a development cut. [slack, 2026-11-22]

## What raised scores
- Teach the rule before you break it. Flame gusts made the wall shadow visibly obey the light, so the frozen bent flame reads as "time stopped".
- A crimson hairline on the shadow blade lets the eye follow it through the cut, tying the tip to the scar.
- Ignition should travel linearly over about 6 frames, with a dark uncut contour ahead of a hot head. Debris and embers must wait until the head passes their spot.
- Draw crisp edges after the bloom pass so a pop stays sharp. Fire flares on the hit frame (`t >= HIT - eps`) and keep the decay dry (about 0.16s, squared falloff).
- Motion-blur accumulation of a fast stylised swing creates parallel "ghost rails". For that window, render a single sample and let the ink smear be the motion blur.
- Dry brush means gaps cut *through* the ribbon with destination-out, widening toward the tail. Dots around the stroke are not dry brush.
- The camera clamp limits ending framing, so move the subject into frame rather than the camera.
- A waiting prop must act on its own. Exaggerate the strain to about 25px plus a stutter, and keep any pressure glint small.

## Ceiling found
- Polish rounds plateaued at about +0.1 per round, and texture stuck at 6–7. Smooth vector fills plus procedural fibre still read as "luminous vector". To clear 8, plan the material language up front: real brush stamps, scanned-paper textures, a thick torn paper edge. Also plan clean backing pockets behind every key mechanism beat (scabbard mouth, click, final draw) from the first layout, because lattices and racks steal them.

## Story logic (elang's feedback)
- A "twist" sting has to follow the story's own logic. Once the shadow has cut and re-sheathed, it drawing again on the floor read as a continuity mistake, not a twist. v2 ended with both the real sword and its shadow at rest, then faded to black. Before adding a final stinger, check: is the action already finished, and does the sting cause anything? [slack, 2026-11-22]
- Audio mix: `out/mix.wav` = foley with `volume=8dB,alimiter=limit=0.8:level=disabled`. alimiter's default auto-level normalises to 0 dB, so keep `level=disabled`.
- Re-sheathe must be one fast action, not a slow return. A blade that sits half out for about 1s and then slides home over 0.55s reads as "unsheathed again". v3 snaps it home in 0.09s, about 0.45s after the pop. After the payoff, use one steady camera move; extra push-ins and tilts read as awkward. [slack, 2026-11-22]
