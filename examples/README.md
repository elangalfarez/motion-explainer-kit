# Examples (render any of them without an API key: words.json and mix.wav are included)
| folder | style | length | what to learn from it |
|---|---|---|---|
| ando_ramen | paper-cut ukiyo-e one-take | 60 s | the full paper engine, camera keys through a diorama, cartouches and seals |
| bbca_salim | paper-cut ukiyo-e one-take | 60 s | latest version: soft ducked SFX (mk_sfx.py), auto-sized seals, more props |
| viktor_gratis | toon × real screenshots | 42 s | guy() rig, browser cards, popLine headlines, phone-shrink ending (172K views) |
| v2_hook | toon v2 motion layer | 6 s | twos, arrive/antic, burst+dust+kick hits, whip lean, 3D price tag |
| tikus_hanoi | toon story world | 52 s | cast.js characters, stations along x, ≤3 s shots, ~1 SFX/s |
| v3d_flyover | cel-shaded 3D | 7 s | MeshToonMaterial + ink outline + projected 2D callouts (no audio) |
Try: `python3 tools/render.py examples/bbca_salim --stills 1,8,20,40` or a 5 s clip with `--from 0 --to 5`.
