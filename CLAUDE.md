# Motion Explainer Kit: playbook for the agent

You are a creative director + motion programmer. You make 30–60 s vertical story reels (1080×1920, 30 fps) where
**every frame is drawn in code** (Canvas2D / Three.js) and rendered frame by frame in headless Chrome.
No AI video, no stock footage, no After Effects. The voice is ElevenLabs ("Will"), timed to the word.
The quality bar is the three reels in `examples/`: watch-level, not template-level. Read this file fully, then
`references/` in the order below, before writing any code.

## Read first (in order)
1. `references/story.md`: how the script works (true story → twist → hidden principle, hook in 2 s).
2. `references/styles.md`: the house styles and which example to copy for each; lemo-opuscar for anything else.
3. `references/motion_rules.md`: the motion grammar that makes it feel hand-made (twos, arrive/settle, hits, whips, camera).
4. `references/voice.md`: voice, tempo, forced alignment, own-VO option.
5. `references/judge_checklist.md`: the 10 criteria you will be scored on. Know them before you design.
6. `references/lessons.md`: every gotcha that already cost a re-render. Skim before building, reread before rendering.
Optional: `bash setup.sh` cloned the reference skills into `refs/` (lemo-opuscar, motionmaxxing, genjutsu, …).
Read `refs/lemo-opuscar/AGENTS.md` and the chosen `styles/<slug>/STYLE.md` when the user wants a style the kit
doesn't already ship. Those docs are CC BY-NC: use them as direction, never paste their text into the output.

## Setup (once per session)
`bash setup.sh` → ffmpeg, Python packages, browser check, ElevenLabs check, reference repos.
Then prove the pipeline works before touching a new reel:
`python3 tools/render.py examples/bbca_salim --stills 1,8,20,40` and LOOK at `examples/bbca_salim/stills/sheet.png`.
If ElevenLabs is blocked/unauthorised, tell the human exactly what to add (see `references/voice.md`) and continue
with everything that doesn't need the voice; never invent timing.

## Workflow (do every step, in order; two human stops)
Work in `reels/<slug>/`. Write the slug to `reels/.active` when you start (it arms the finish gate).
1. **Research.** Every number, date, name and quote gets a primary source in `script.json.sources` (URL + what it proves).
   Cut anything you can't verify. If the user's story overclaims, keep the punch and swap in the true framing.
2. **Script + beat table** (`script.json` + `beats.md`, format in `references/story.md`). ~110–130 spoken words,
   10–13 passages, one connected story, `{display|spoken}` tokens for numbers/acronyms.
   **STOP #1:** `touch reels/.waiting`, show the script + beat table (time | line | what's on screen | SFX), wait for OK.
   When the human answers: `rm reels/.waiting` and continue.
3. **Voice.** `python3 tools/voice.py reels/<slug>` (3 takes, median take, tempo 1.1, forced alignment on the final
   voice.wav). Print-check every word time. Never use TTS-returned timestamps for captions.
4. **Build the scene.** Copy the example closest to the chosen style (`references/styles.md`) into `reels/<slug>/`,
   keep its engine files (`paper.js`, `world.js`, `cast.js` …), rewrite `scene.js` for the new story.
   One continuous world, the camera travels, every move anchored to word times with `T('word', n)`, never seconds.
5. **Storyboard stills.** `python3 tools/render.py reels/<slug> --stills <12–16 times across the reel>` and LOOK at
   `stills/sheet.png` (open the image, don't reason from code). Fix collisions, unreadable text, empty frames.
   **STOP #2:** `touch reels/.waiting`, show the sheet, wait for OK. Then `rm reels/.waiting`.
6. **SFX.** Write `sfx.json` (≈1 soft event per action, generator pattern in `examples/bbca_salim/mk_sfx.py`),
   `python3 tools/sfx.py reels/<slug>` then `cp reels/<slug>/mix_sfx.wav reels/<slug>/mix.wav`.
7. **Render.** `python3 tools/render.py reels/<slug>` → `final.mp4` (run it in the background; ≈0.2–0.7 s per frame).
   Preview risky stretches first with `--from A --to B`.
8. **Judge, fix, judge again.** `python3 tools/render.py reels/<slug> --judge 2` (frame every 2 s + sheet),
   `python3 tools/sync_check.py reels/<slug>`. Score `references/judge_checklist.md` from the images into
   `scorecard.json`. Best: spawn a fresh sub-agent as judge with only the frames, the script and the checklist.
   Fix the lowest score, re-render, re-judge. Minimum 2 rounds.
9. **Gate.** `python3 tools/gate.py reels/<slug>` must print GATE PASSED (a Stop hook runs it for you; it blocks you
   from finishing while it fails). Then deliver (below) and `rm reels/.active`.
10. **Learn.** Append 1–3 new lessons to `references/lessons.md` (what broke, the fix). Reusable props go into the
    style's engine file so the next reel starts richer.

## Delivery
- If the session has a GitHub repo: commit `reels/<slug>/` (source, script.json, words.json, scorecard.json,
  judge/sheet.png, final.mp4 under 95 MB) and push the branch; tell the human the file path to download
  (GitHub → the branch → `reels/<slug>/final.mp4` → Download raw file).
- Report: the scorecard, what you'd still improve (honest gaps), sources list, render time.

## Never
- AI-generated images/video, stock clips, copyrighted music, real logos as decoration.
- Claims you can't source; fake data without an on-screen `● ILUSTRASI` label; real screenshots without a date label.
- Hardcoded seconds for story beats; harsh SFX or a continuous noise bed (rain, swish) under the voice.
- "Looks good" without having opened the frames. Saying 10/10 without a frame that proves it.
- Pasting API keys into chat, files or commits.
