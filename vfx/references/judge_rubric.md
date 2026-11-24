# Judge rubric — score each shot 0–10 per criterion, from IMAGES only
1 shape/silhouette · 2 pose & position (px vs ref or vs beat sheet) · 3 timing (frames) · 4 colour (probed) · 5 motion direction (strip!) · 6 texture (ink breakup, halftone, brush) · 7 transitions/punctuation · 8 rhythm (slow-slow-FAST-hold) · 9 "would a motion designer post this?"
Mode A has no ref: compare against engine/examples/scarlet_sheath renders + taste.md instead.
scorecard.json:
{"mode":"A|B","rounds":2,"shots":[{"name":"gather","t":[0,1.07],"scores":{"shape":8,...},"evidence":["judge/s01.png"],"gaps":"..."}],"film":"out/film.mp4"}
Pass = every shot avg ≥ 8, no criterion < 6, ≥ 2 rounds, every evidence file exists, film exists. Be harsh: a 9 needs a frame that proves it.
