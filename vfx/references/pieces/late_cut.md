# Original object/weapon studies

Working example: `vfx/pieces/late_cut/`. “The cut arrives late” was delivered as a development study with a film, offline preview, editable source and an illustrated case study. It is **not** a new approved benchmark. Its final independent review remained below the strict per-shot visual gate. [Slack handoff and review, 2026-11-22]

## Directing the effect
- A tiny action can carry a large delayed consequence. The delay must feel tense, not like a frozen render: use a visible physical tell and a restrained camera approach.
- Favor the proven object rig when character drawing would compete with the effect. A case study should show the brief, material decisions, event relationship, one genuine iteration and reusable systems, without invented client or audience results.
- Separate distant scenery, paper/ground, architecture and foreground when a colored gap looks like an overlay. A shared cut equation plus different depth offsets makes the relationship legible.
- A closed mechanical rig still needs its collar/habaki. Drawing it only at nonzero extension creates a disconnected closed pose.
- Clear foreground objects from the title's landing area before adding a scrim. A large haze can leave conspicuous ghost silhouettes and wash out the shot.

## Rendering and judging
- `document.fonts.ready` can resolve before a canvas first requests its font. Explicitly load the needed face/text and expose `window.ready`; the reusable renderer now awaits this promise, or loads declared faces when no promise exists.
- Clamp subframe shutter samples to the current camera shot. A shutter crossing a camera cut creates a one-frame double exposure even when `render(t)` is deterministic.
- Inspect actual encoded hit frames, not just a 5fps strip or the effect's first sample. An effect lasting less than 0.2 seconds may fall between low-rate samples. A first hit frame averaged across four subframes may contain only a quarter-strength accent.
- A reviewer may confuse “blade starts returning” with “camera returns wide.” Check the brief and actual encoded frame pairs; correct that factual misunderstanding without silently raising aesthetic scores.
- Verify decoded AAC windows around planned cue times. Digital silence can be shown with a display floor, but do not report the resulting infinite/very large dB difference as acoustic dynamic range.
- Compare source and standalone previews separately. Include only sampled-seek claims that were actually tested; do not imply every browser or every timestamp is covered.
