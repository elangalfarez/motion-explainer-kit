# Styles: pick one, copy its example, keep its engine

Every example in `examples/` is a complete, renderable reel (script.json, words.json, scene.js, engine files, mix.wav).
Copy the closest one into `reels/<slug>/`, keep the engine, rewrite the story. Render its stills first to calibrate.

## 1. Paper-cut ukiyo-e one-take (Vox paper × woodblock print), the Ando / BBCA look  ★ default for story reels
- Examples: `examples/ando_ramen` (Momofuku Ando), `examples/bbca_salim` (BCA × Salim, soft ducked SFX = latest).
- Engine: `paper.js` (every object is a washi sheet: misregistered flat pigment + sumi key line + cream cut edge +
  soft drop shadow + grain; `person()`, `seal()`, `board()`, `cartouche()`), `world.js` (props: hills, mountain, pine,
  mist, bank, stall, prison, factory, syringe, gavel, pie chart, coins, flags …), Three.js scene with a Catmull-Rom
  camera that flies through timed keys = one continuous take through a diorama.
- Palette (PAL in paper.js): paper #efe3c8, sumi #211d1b, prussian #1f3d68, beni red #c0412f, ochre #d39c43,
  green #7f9a4c. Font: Shippori Mincho B1 (vendor/). Captions = paper strips with the key word in red.
- Feel: slow-slow-FAST camera, props pop up like pop-up-book flaps, seals stamp in, numbers on cartouches.

## 2. Toon × real footage (Cyanide & Happiness rubber-hose + real screenshots), the "Viktor gratis" look
- Example: `examples/viktor_gratis` (172K-view reel), `examples/v2_hook` (v2 motion layer: twos, arrivals, hits).
- Engine: `vendor/toon.js` (`guy()` rig with mouth driven by the voice envelope, 12 fps line boil, `card()` = real
  screenshot in a browser frame, `popLine` headlines, outlined captions, motion blur) + `vendor/toon2.js`
  (twos, antic/take, arrive/leave, burst, dust, speedLines, slamLine, kick, paperFinish) + `vendor/toon3d.js`
  (one cel-shaded 3D hero, e.g. `priceTag`).
- Palette: paper #F6F1E7, ink #1B1817, orange #FF7A3D, lime #B9E36A, gold #F2C14E. Font Outfit 700–900.
- Layout: chip top-left, headlines y 230–480, cards ~y 840, ground ~y 1560, captions y 1700.
- Best for: founder notes, tool explainers, "proof" stories with real screenshots labelled `● REAL SITE, <date>`.

## 3. Toon story world (stations along x, whip pans), the "Tikus Hanoi" look
- Example: `examples/tikus_hanoi` (cobra-effect story, 52 s). `cast.js` = reusable characters/props (rat, official,
  hunter, villa, sewer pipe, notice board, stamp, sack…), scene.js = stations 1700 px apart, ≤3 s per shot.

## 4. Cel-shaded 3D flyover (engineering / history explainer)
- Example: `examples/v3d_flyover` (7 s proof). Three.js MeshToonMaterial 3-band shading, inverted-hull ink outline,
  fog, dusk light, 2D overlay callouts projected from 3D points, slam numbers.

## 5. Anything else: lemo-opuscar (99 coded film styles)
`bash setup.sh` clones it into `refs/lemo-opuscar`. Read `AGENTS.md` → `DIRECTOR.md` → `TECHNIQUE.md`, then
`styles/README.md` to pick. Good matches: map/stick history explainers → `map-explainer`, `stick-explainer`,
`satellite-briefing`, `comic-history`; 3D engineering → `lowpoly-island`, `precise-mechanism`, `white-model`,
`iso-infographic`. Port the look into our pipeline (scene.js + tools/render.py) so voice timing, captions, judge and
gate still apply. License: lemo code is MIT; its STYLE.md/docs are CC BY-NC: direction only, don't copy text.

## Style rules that hold for every style
- One world, the camera travels. No hard cuts except the final one.
- Max 2 typefaces. Max ~5 colours + paper + ink. Big readable captions (phone, arm's length).
- One "hero" moment worth a screenshot (3D price tag, giant seal, number slam), placed on the hook payoff.
- Nothing pinned on screen for 3+ shots; text never collides with props; props never cover faces.
