# Judge checklist: score from IMAGES, not from code

Make the evidence: `python3 tools/render.py reels/<slug> --judge 2` (frame every 2 s + `judge/sheet.png`), plus a
frame strip of every hit and whip (`--stills` at 1-frame steps around them). Open the images. Then score 0–10.
Best practice: a fresh sub-agent judges with only the frames, script.json and this file, so it can't grade intentions.

| key | question | 9–10 looks like | fail looks like |
|---|---|---|---|
| hook_2s | Would a stranger stop scrolling in the first 2 s? | giant true number/claim + motion on frame 1 | logo, title card, slow fade-in |
| story_twist | Is it one connected story with a turn and an abrupt last-line twist? | each beat causes the next, last line reframes | list of facts, CTA ending |
| truth_labels | Every claim sourced; fakes labelled `● ILUSTRASI`; real shots dated | sources in script.json match the screen | unsourced number, unlabelled mock |
| motion_craft | Arrive/settle, antic, hits sold 4 ways, twos, no linear moves | strip shows overshoot-free decel, impact frames | things just fade/scale linearly |
| camera_one_take | One world, camera travels, whips land, lingers where text is | continuous geography | cuts, jitter, text flies out before read |
| every_2s_new | Something new in every 2 s judge frame? | no two consecutive judge frames alike | 3+ frames of the same composition |
| readability | Every caption/headline readable on a phone at arm's length | ≥ 56 px caption, high contrast, no collisions | small text, text over busy art, clipped words |
| style_consistency | One style, palette and type held start to finish | looks like the example it was copied from | mixed styles, random colours, emoji tofu |
| audio_mix | VO clear, SFX soft and on action, captions in sync (sync.json) | drift ≤ .15 s, no harsh highs | rain/swish bed under voice, late captions |
| ending | Last line lands, hard cut, last word not clipped | 0.4 s tail then cut | trailing dead air or cut-off word |

## scorecard.json
```json
{"rounds": 2,
 "scores": {"hook_2s": 9, "story_twist": 8, "truth_labels": 9, "motion_craft": 8, "camera_one_take": 8,
            "every_2s_new": 8, "readability": 9, "style_consistency": 9, "audio_mix": 8, "ending": 8},
 "evidence": ["judge/t000.00.png", "judge/t002.00.png", "judge/t010.00.png", "judge/t020.00.png", "judge/t040.00.png", "judge/sheet.png"],
 "round_log": ["r1: readability 6 (caption over seal at 18 s) -> moved seal up; every_2s_new 6 (24-30 s static) -> added coin drop"],
 "gaps": "what still isn't 10, honestly"}
```
Pass (enforced by tools/gate.py): average ≥ 8, no criterion < 7, ≥ 2 rounds, ≥ 6 existing evidence frames,
sync.json pass, judge frames newer than final.mp4. Be harsh: a 9 needs a frame that proves it.
