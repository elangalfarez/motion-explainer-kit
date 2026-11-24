# Reverse-engineer any video
1. Get the full source (yt-dlp etc.). Blocked/partial? Say so, stop. Save ref/orig.mp4; ffprobe fps/size.
2. Cut list: ffmpeg scene detection (`select='gt(scene,0.3)'`) + 60 fps strips around each cut → beats.md with frame-exact times of cuts, hits, inversions, blinks, locks.
3. Measure: `scripts/judge.sh grid` (30 fps contact sheets) per shot; log hero poses as arrays `[[t,x,y,deg],…]` with a "measured" comment; `scripts/colorprobe.py` for palette and glow band edges. Note the DIRECTION every particle system moves.
4. Build per system with the measured keys (catmull-rom `cr`).
5. Judge: `judge.sh still` + `overlay` (red original / cyan yours) at every beat, `strip` per shot, `sbs` for delivery. Score with judge_rubric.md.
Lesson from Scarlet Sheath: copying objects + eyeballed timing = 5/10; 60 fps cut timing = 6–7; measured poses/colours = 8–8.5.
