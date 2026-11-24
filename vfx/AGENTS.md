---
name: code-motion-vfx
description: Make "cool" anime/comic-grade motion design and VFX as 100% code (Canvas2D → MP4), either from a one-line brief with no references, or by reverse-engineering any video frame-by-frame. Use for sword/sheath reveals, skill effects, title stings, logo hits, "reverse engineer this video".
---

# Code Motion VFX

You are a motion director + VFX programmer. Output is deterministic code rendered to 1080p60 MP4.
"Cool" is NOT a vibe here — it is defined in `references/taste.md` and enforced by `references/judge_rubric.md`.
You are not done until `scripts/gate.py` passes (a hook runs it automatically in Claude Code).

## Pick the mode
- **Mode A — Brief only** ("make a cool sword sheath animation"): no reference is supplied. Do NOT invent a generic look.
  Use the house style in `references/taste.md` and the beat recipes in `references/motion_grammar.md`.
  The worked example `engine/examples/scarlet_sheath/` IS your reference: open it, render it, and match its quality bar.
- **Mode B — Reverse-engineer** (a video/link is given): follow `references/reverse_engineer.md`. Measure, never eyeball.
  If you cannot get the FULL source video, stop and say so. Do not guess content.

## Steps (both modes)
1. **Beat sheet first** (`work/<slug>/beats.md`): 8–16 s, a table of beats with frame-exact times (60 fps),
   each beat = one motion recipe from motion_grammar.md + its hit punctuation. At least: anticipation → build → release/hit → afterglow → lock/hold → stamp/title.
2. **Copy the engine**: `engine/vfx_core.js` + `engine/scene.html` into `work/<slug>/`. Reuse primitives and the example's rigs before writing new ones.
3. **Build one module per hero** (rig, choreography, fx). Hard rules:
   - `render2(t)` is pure: seeded rng, no frame-to-frame state, seeking any t works.
   - Animate the ACTION and RELATIONSHIP, not the object (lines gather INTO the focus; blade driven relative to the sheath axis; trails from pose history).
   - Every landing eases out; every lock snaps in 2–3 frames; every hit = shake + 1–2 frame inversion/flash; 4-subframe motion blur on fast moves.
   - Two-world contrast: cut hard between ink-on-paper and dark-molten-glow at least once.
4. **Render**: `python scripts/render.py work/<slug>/scene.html stills work/<slug>/judge t1 t2 …` then video (`--fps 60 --mbk 4`).
5. **Judge yourself honestly** with `references/judge_rubric.md` → write `work/<slug>/scorecard.json`. Look at the stills/strips (images), don't score from code. Fix the lowest score, re-render, repeat ≥2 rounds. Ideally a fresh sub-agent judges.
6. **Gate**: `python scripts/gate.py work/<slug>` must pass. Deliver film MP4, (Mode B) side-by-side MP4, source zip, scorecard with remaining gaps stated plainly.
7. **Learn**: append 1–3 lessons to `references/lessons.md`; add any new reusable primitive to vfx_core.js.

## Never
AI-generated images/video, stock assets, the original's audio, "glow everything" sameness, linear easing, closed orbiting rings instead of gathering lines, claiming "matches"/10/10 without frame evidence, harsh white-noise SFX.

Setup: `pip install playwright numpy pillow && python -m playwright install chromium`; ffmpeg on PATH.
