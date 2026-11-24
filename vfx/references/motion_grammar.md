# Motion grammar — recipes (each maps to vfx_core.js primitives)
| Recipe | When | Build | Primitives |
|---|---|---|---|
| Gather | anticipation | 100–150 log-spiral tapered arms collapse into focus, accelerate on arrival | gatherLines(ink/glow/hot) |
| Ring draw-on | build | dry-brush arc trim-path 0→100% over 0.4–0.7 s, black under-stroke | brushRing |
| Burst cut | world switch | spikeStar hole shrinks to 0 → hard cut to other world | spikeStar evenodd |
| Slash | release | katana-shaped white-hot smear, thick tail→point, 3 additive layers | taperPoly, glow, flare |
| Crescent trail | swings | trail from pose HISTORY pose(t-i*dt), alpha ∝ tip speed | taperPoly |
| Flare | hit peak | star + anamorphic streak, 4–8 frames | flare, bloom |
| Halftone dissolve | exit | layer masked by dots ordered along slash band + noise | halftoneDissolve |
| Sheath lock | resolve | blade driven relative to saya axis, snap in 3 frames, shake, sageo flips | kf/cr + example v3_sheath.js |
| Stamp slam | end | scale 1.4→1 eOut5 in 4 frames, splatter, shake | shake, invertFrame |
Template 14 s: gather(0–1) → burst cut(1.07) → slash+inversion(3.0) → rift(4) → flash+eye(4.8–9.2) → giant slash(9.2) → dissolve(9.8–10.8) → swing+sheath lock(10.3–11.5) → push-in → stamp(13.3).
