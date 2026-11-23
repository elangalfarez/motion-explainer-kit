# Copy-paste prompts

## 1. New reel (in your own copy of the kit at claude.ai/code)
```
Read CLAUDE.md fully and follow it exactly, including both STOPs. Run `bash setup.sh` first and render
examples/bbca_salim stills to calibrate the quality bar before you start.

New reel. Slug: <short-name, e.g. ando_ramen>
Style: <paper-cut ukiyo-e one-take | toon x real screenshots | toon story world | cel-shaded 3D | lemo-opuscar: <style>>
Language: <Indonesian casual (lo/gue) | English>
Length: 40–55 s
Topic / my raw story (messy is fine):
<what happened, the numbers, any links you have>
Hook idea (optional): <the bold number or claim>
Don't mention / keep private: <brands, names, data>

Finish only when `python3 tools/gate.py reels/<slug>` passes. Then commit reels/<slug> (with final.mp4) to a branch,
push it, and tell me the scorecard, the remaining gaps, and the sources.
```

## 2. Try it first (claude.ai/code → "No repository")
```
Clone https://github.com/elangalfarez/motion-explainer-kit and cd into it. Read CLAUDE.md and README.md.
Run `bash setup.sh --fast`, then render stills of examples/bbca_salim at 1,8,20,40 seconds and of
examples/viktor_gratis at 1,15,30, and show me both stills/sheet.png images. Then explain in 5 lines how I'd make
my own reel about: <topic>.
```

## 3. Your own voice instead of Will
Add to prompt 1:
```
Voice: I recorded it myself. File: <uploaded file name>. Use `tools/voice.py reels/<slug> --own-vo <file>`
(use --aligner whisper if ElevenLabs isn't connected). The script must match my recording word for word, so write
the script from the transcript of my recording.
```

## 4. A new style from a reference video (reverse-engineer the look)
```
Read CLAUDE.md and references/styles.md. I want a new house style based on this reference: <link or uploaded frames>.
Extract frames (ffmpeg, 2 fps), measure the palette (sample pixels), type, layout grid, camera behaviour and
rhythm (cuts/whips per second), and write it up as a new section in references/styles.md + an engine file in
examples/<style_name>/ with a 6–8 s proof reel rendered with our tools. Recreate the look in original code: no
copied assets, logos or audio. Judge the proof side by side with the reference frames and list the gaps honestly.
```

## 5. Series mode (after the first reel worked)
```
Same style and rules as reels/<previous-slug>. Next story: <topic>. Reuse its engine and props, add new props to
the engine file so the next reel starts richer, and append what you learned to references/lessons.md.
```
