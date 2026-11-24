# vfx/ — pure-code motion VFX (no text, no voice)

The second half of the kit: short cinematic VFX films (8–15 s, 1080p60) drawn 100% in Canvas2D / WebGL2,
judged frame by frame. Reels with voice live in the root kit; text-free VFX pieces live here.

Start with `SKILL.md` (or `AGENTS.md` for non-Claude agents), then every file in `references/`.

| Path | What |
|---|---|
| `SKILL.md`, `AGENTS.md`, `CLAUDE.md`, `PROMPT.md` | the playbook (Mode A brief-only, Mode B reverse-engineer) |
| `references/taste.md` | house "cool": ink-on-paper × dark-molten, slow–slow–FAST–hold, punctuation kit |
| `references/motion_grammar.md` | 9 recipes (gather, ring, burst cut, slash, crescent trail, flare, halftone dissolve, sheath lock, stamp) |
| `references/judge_rubric.md` | 9 per-shot criteria + scorecard.json format + pass rule |
| `references/reverse_engineer.md` | measure-don't-eyeball workflow for copying a reference video's motion |
| `references/pieces/*.md` | lessons per piece (what worked, why it plateaued) |
| `engine/` | `vfx_core.js` primitives + starter `scene.html` + Scarlet Sheath rigs |
| `scripts/render.py` | headless Chromium frame-exact renderer: `stills OUTDIR t…` or `video OUT.mp4 --fps 60 --mbk 4` |
| `scripts/judge.sh` | grids, strips, still pairs, overlays, side-by-side |
| `scripts/gate.py` | finish gate: `python3 scripts/gate.py work/<slug>` |

## Pieces (full source, render any of them)
| Piece | Idea | Tech | Status |
|---|---|---|---|
| `pieces/scarlet_sheath_v3` | katana unsheathe/sheath lock, eye flash (reverse-engineered) | Canvas2D rigs | the quality bar ("already better") |
| `pieces/late_cut` | the cut arrives late: tiny action, delayed consequence | Canvas2D | development study |
| `pieces/shadow_draws_first` | the shadow draws before the blade (light law broken) | Canvas2D | 8/10 |
| `pieces/enso` | the ensō that won't close: the brush tail refuses to meet; `play.html` = interactive | Canvas2D, fbm dry brush | 7.9 plateau, see lessons |
| `pieces/ink_falls_up` | ink falls upward | WebGL2 fluid shader | in progress |

Render a still: `python3 scripts/render.py pieces/enso/scene.html stills /tmp/s 2 6`
(setup: `pip install playwright numpy pillow && python -m playwright install chromium`, ffmpeg on PATH).
