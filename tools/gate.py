#!/usr/bin/env python3
"""Definition of done for a reel. Usage: python tools/gate.py reels/<slug>   (exit 0 = pass, 2 = fail + reasons)

Hook mode (no argument, run by .claude/settings.json on Stop): checks the slug written in reels/.active.
No reels/.active = no reel in progress = pass, so ordinary chat is never blocked.
reels/.waiting exists = the agent is waiting for the human's OK (script / storyboard) = pass.
After 8 blocked stops in a row the hook lets the agent stop, so it reports the blocker instead of looping.
The gate checks that the work and the judging happened, with evidence on disk. It cannot see pixels:
the scores themselves come from looking at the frames (ideally a fresh sub-agent judge).
"""
import json, os, sys
from pathlib import Path

CRITERIA = ["hook_2s", "story_twist", "truth_labels", "motion_craft", "camera_one_take", "every_2s_new",
            "readability", "style_consistency", "audio_mix", "ending"]


def check(d: Path):
    errs = []
    need = lambda f, why: (d / f).exists() or errs.append(f"{f} missing: {why}")
    if not need("script.json", "write the script (references/story.md)"): return errs
    s = json.loads((d / "script.json").read_text())
    if not s.get("sources"): errs.append("script.json has no sources: every fact needs a primary source, or cut it")
    need("words.json", "run tools/voice.py")
    need("stills/sheet.png", "render storyboard stills before the full render")
    if need("final.mp4", "run tools/render.py on the reel"):
        mb = (d / "final.mp4").stat().st_size / 1e6
        if mb > 95: errs.append(f"final.mp4 is {mb:.0f} MB: re-render with --crf 23 (GitHub rejects files over 100 MB)")
        fm = (d / "final.mp4").stat().st_mtime
        if not (d / "judge/sheet.png").exists() or (d / "judge/sheet.png").stat().st_mtime < fm:
            errs.append("judge frames are older than final.mp4: run tools/render.py --judge 2 on the final cut and look at them")
    if need("sync.json", "run tools/sync_check.py"):
        y = json.loads((d / "sync.json").read_text())
        if not y.get("pass"): errs.append(f"caption sync failed (max drift {y.get('max_abs_drift')}s): re-align on the final voice.wav")
    if need("scorecard.json", "judge with references/judge_checklist.md"):
        c = json.loads((d / "scorecard.json").read_text())
        if c.get("rounds", 0) < 2: errs.append("fewer than 2 judge rounds (judge, fix, re-render, judge again)")
        sc = c.get("scores", {})
        miss = [k for k in CRITERIA if k not in sc]
        if miss: errs.append("scorecard missing criteria: " + ", ".join(miss))
        vals = [sc[k] for k in CRITERIA if k in sc]
        if vals and sum(vals) / len(vals) < 8: errs.append(f"average {sum(vals)/len(vals):.1f} < 8")
        low = [k for k in CRITERIA if sc.get(k, 0) < 7]
        if low: errs.append("criteria below 7: " + ", ".join(low))
        ev = c.get("evidence", [])
        if len(ev) < 6 or not all((d / e).exists() for e in ev): errs.append("scorecard needs >= 6 existing evidence frames (judge/*.png)")
    return errs


def main():
    if len(sys.argv) > 1: d = Path(sys.argv[1])
    else:
        a = Path("reels/.active")
        if not a.exists() or Path("reels/.waiting").exists(): sys.exit(0)
        d = Path("reels") / a.read_text().strip()
    errs = check(d)
    cnt = Path("reels/.gate_blocks")
    if errs and len(sys.argv) == 1:
        n = int(cnt.read_text() or 0) + 1 if cnt.exists() else 1
        cnt.write_text(str(n))
        if n > 8:
            cnt.unlink(); print("Gate still failing after 8 tries: stop and tell the human exactly what blocks you:\n- " + "\n- ".join(errs)); sys.exit(0)
    elif cnt.exists(): cnt.unlink()
    if errs:
        print(f"GATE FAILED ({d}). Not done yet:\n- " + "\n- ".join(errs), file=sys.stderr); sys.exit(2)
    print("GATE PASSED", d)


if __name__ == "__main__":
    main()
