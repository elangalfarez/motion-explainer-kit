# Motion rules: why it feels hand-made, not template

## Timing
- **Anchor every beat to a spoken word**: `T('word', n)` = start of the n-th occurrence (punctuation stripped),
  `E()` = end. Never hardcode seconds; a re-voice must not break the film. Watch the console for "word not found".
- **Something new every ~2 s** (prop drop, counter roll, stamp, card scroll, camera move). Dead frames kill retention.
- **Rhythm = slow, slow, FAST, hold.** Build, release on the punch word, then let it breathe ~1 s.
- **Whole words at speech rhythm**: headlines slam word by word at word time minus 1–2 frames. Never type letters.

## Movement (vendor/toon2.js)
1. **Characters on twos, camera on ones**: draw acting with `tc = twos(t)` (15 fps), keep camera/props on `t`.
2. **Arrive from oversize, decelerate, no bounce**: `arrive(t, t0, .28, 2.4)`; never grow from 0; exits accelerate.
   At most ONE visible spring per reel.
3. **Anticipation → action → settle** on every big move (`antic`, `take`); hands pull down before they go up;
   hanging parts follow late (`wobble`).
4. **Eyes lead**: characters look at the thing ~0.4 s before it lands, and where the camera will whip.
5. **Hits are sold 4 ways**: `burst()` (3 frames) + `dust()` + camera `kick()` + a sound. Stamps crash from 3.2× in ~4 frames.
6. **Whips**: lean ~90 px the opposite way for 0.15 s → `inOutExpo` whip (0.4–0.5 s) → settle. Speed lines from camera
   velocity. A foreground shape crossing the lens mid-whip sells depth (off-screen at every station).
7. **Finish**: `paperFinish()` last (12 fps grain + warm vignette).

## Camera (paper one-take, examples/ando_ramen + bbca_salim)
- Catmull-Rom through timed keys `[t, pos, look]`; linger ~1.5 s where text sits; zero the tangent after a long jump
  (or it overshoots). Shrink/hide big props before the camera flies through them.
- Vertical frame at ~6 units distance shows only ±1.1 units wide: text props ≤2 units wide, within ±1 of the look target.
- Distant mountains/sky follow the camera (background group at camera z) or they turn into walls later.

## Sound
- Soft cartoon SFX from `tools/sfx.py` (whoosh/pop/stamp/kaching/boing/type/zip/swish/ding): lowpassed, ducked under
  the voice. ≈1 event per action. Swish gain ≤ .35. Never a continuous noise bed under narration.
