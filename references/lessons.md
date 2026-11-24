# Lessons (each one cost a re-render). Append new ones at the bottom: what broke → the fix.

## Code / render
- `T(word)` returns the FIRST match after stripping punctuation ("Viktor." == "Viktor"): use `T(word, n)` for repeats;
  grep the script for duplicates before timing. A key at t=0 is falsy: check `=== undefined`, not `!v`.
- Canvas `arc()` throws on a negative radius (outBack overshoot at small scale) and kills the render mid-way:
  guard with `if (r < 18) return;` and test stills during every scaled prop's intro.
- `prog(..., ease.outBack)` at 0 can be a tiny positive float: gate visibility with `> .002`, not `> 0`.
- `render2/renderFrame(t)` must be pure (seeded random, no frame-to-frame state): stills and seeking depend on it.
- Headlines fade ~0.35 s after their end: end one ~0.4 s before the next starts, or they overlap.
- No emoji in canvas text (tofu boxes). Caption chunks break at ≥17 characters or they clip in 9:16.
- Frame is narrow: stack things vertically. Camera must linger ~1.5 s where a callout points.
- Three.js InstancedMesh with moving instances: `frustumCulled = false`; hidden instances get a zero-scale matrix.
- Mirrored 3D halves: negate the geometry, never `scale(-1)` (it flips the ink outline → black faces).
- Reused props carry text baggage (a sign from the last story). Check signage when you copy an example.
- Long render: run in the background and poll the log; ≈0.2 s/frame toon, ≈0.7 s/frame paper 3D on 4 vCPU.
- `--from/--to` writes a silent clip.mp4 and overwrites the last one. To patch a section, render it and splice by frame.

## Audio
- Never use TTS-returned timestamps for captions: forced-align the FINAL voice.wav (tools/voice.py does).
- Never truncate the voice at the last caption end: keep ~0.45 s tail. Never mux with `-shortest` (clips the ending):
  render.py pads audio to the picture length.
- Harsh SFX and a rain bed masked the voice in the Ando reel: sfx.py lowpasses at 5.5 kHz and ducks under the VO.
- Build mix.wav from the voice before running sfx.py; then `cp mix_sfx.wav mix.wav`.

## Story / truth
- Fact-check viral claims on primary sources: "X bought it" was a donation; the correction made a better hook.
- Allegations: "diduga" + an on-screen "MENURUT LAPORAN MEDIA" label, silhouettes, no logos.
- Founder claims: say revenue/omzet, not profit, unless you have the P&L; blur private data with mosaic, not gaussian.

## Paper one-take
- Keep in-world seals ≤1.6 units wide and let `seal()` auto-size (explicit size overflowed long words).
- Never put a station behind a backdrop band; far "sky" objects with fog off are visible from everywhere, gate them by time.

## Voice / alignment (selembar_kertas, 2026-11-24)
- ElevenLabs eleven_v3 cut the last word off all 3 takes of a ~900-character script ("termasuk" still at -23 dB on the
  last sample). Check every take's tail energy before aligning. Fix: generate the last line alone (it ended in clean
  silence) and splice it into the pause before that line.
- Whisper writes some numbers as digits and glues words ("Bukapintu"), which threw captions 0.46 s off. voice.py now
  matches each spoken word against its display form too, splits glued words, and snaps starts to onsets after real
  pauses. Settle a disputed word time from the energy envelope, not from a second Whisper pass.

## Toon-3D hybrid (C&H rig inside a cel-shaded Three.js world)
- A 2-sample motion blur reads as double outlines on ink lines; render single samples and draw the 2D characters once,
  on top of the world, at the frame time. A camera inside a prop's ink hull renders solid black: keep trees and props
  off the camera path (a ring diorama with the stage at the centre lets one take revisit the start).
