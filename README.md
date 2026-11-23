# Motion Explainer Kit 🎬

Make 30–60 s vertical story reels (like the Ando ramen and BCA × Salim videos) with nothing but a **Claude
subscription**. Claude writes the story, draws every frame in code, voices it with ElevenLabs "Will", times
each word, renders the MP4, then judges and fixes its own work before it hands the video over.

No After Effects, no AI video, no stock footage. It's all code, so it's sharp, on-brand, and you can redo it.

## What you need
- A Claude **Pro / Max / Team** plan (cloud sessions at **claude.ai/code** are included).
- A free **GitHub** account (Claude saves the finished video there for you to download).
- Optional: an **ElevenLabs** account for the "Will" voice (free plan works for trying; commercial use needs a paid plan).
  No ElevenLabs? Record your own voice on your phone instead.

## Start in 5 minutes (Claude Code in the cloud)
1. **Copy the kit.** Open this repo on GitHub → **Use this template** → **Create a new repository**
   (name it e.g. `my-reels`, private is fine).
2. **Open Claude Code.** Go to **claude.ai/code**, connect GitHub when it asks, pick your `my-reels` repo.
3. **Give it the voice (once).** Open the environment settings (the cloud environment selector → edit):
   - **Network secrets → Add secret**: website `api.elevenlabs.io`, header name `xi-api-key`, remove "Bearer",
     paste your ElevenLabs API key as the value. (Claude never sees the key.)
   - Optional, for Whisper: Network access **Limited** + Allowed domains `huggingface.co` and `*.hf.co`.
   - Recommended: environment variable `BASH_MAX_TIMEOUT_MS=1800000` (lets long renders run in one go).
4. **Paste the prompt** from `PROMPT.md` (fill in your topic). Claude stops twice for your OK:
   after the **script**, and after the **storyboard stills**.
5. **Download.** When it's done, Claude pushes a branch. On GitHub open that branch →
   `reels/<slug>/final.mp4` → **Download raw file**. Post it.

Just want to look first? Pick **No repository** at claude.ai/code and paste the "try it" prompt from `PROMPT.md`:
Claude clones the kit and renders the example stills so you can see the quality. (Downloading a finished MP4
works best with your own repo from step 1.)

## What's inside
| | |
|---|---|
| `CLAUDE.md` | the playbook Claude follows (workflow, two approval stops, rules) |
| `PROMPT.md` | copy-paste prompts: new reel, your own voice, new style, reverse-engineer a reel's look |
| `references/` | story formula, styles, motion rules, voice, **judge checklist**, lessons learned |
| `tools/` | `voice.py` (Will + forced alignment / Whisper), `render.py` (frames → MP4), `sfx.py` (soft cartoon SFX), `sync_check.py`, `gate.py` |
| `vendor/` | the drawing engines (toon rig, motion layer, 3D hero), Three.js, fonts |
| `examples/` | 6 complete reels you can render without any API key |
| `.claude/` | the finish gate (Claude can't say "done" until the judge scores pass) + the skill |
| `setup.sh` | installs tools and clones the reference skills (lemo-opuscar & co.) |

## The styles
1. **Paper-cut ukiyo-e one-take**: Ando, BCA × Salim. One unbroken camera flies through a paper diorama.
2. **Toon × real screenshots**: Cyanide-&-Happiness-style characters with real website proof cards.
3. **Toon story world**: stations and whip pans (the Hanoi rat bounty).
4. **Cel-shaded 3D flyover**: engineering and history explainers.
5. **Any of lemo-opuscar's 99 coded film styles** (map explainers, stick figures, low-poly islands…).

## How "good" is enforced
Claude renders a frame every 2 seconds and scores 10 criteria (hook in 2 s, story twist, every claim sourced, motion
craft, one-take camera, something new every 2 s, readable on a phone, consistent style, audio mix and caption sync,
ending). Average ≥ 8, nothing below 7, two rounds of fixes minimum, captions within 0.15 s of the voice. A Stop hook
blocks Claude from finishing until that passes. It still can't replace your eyes, so watch the video before you post.

## Good to know
- Rendering is slow-ish: about 5–25 minutes for a 60 s reel in a cloud session. Claude runs it in the background.
- Every fact gets a source in `script.json`. Dramatic is fine; false isn't.
- Credits: the reference skills in `refs/` belong to their authors (see `references/skill_repos.txt`). lemo-opuscar's
  docs are CC BY-NC, so the kit only uses them as direction.
- ElevenLabs is retiring its default voices (including Will) on 31 Dec 2026. The kit switches to "Warren"
  automatically, or you can pick any voice ID.
