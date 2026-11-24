#!/usr/bin/env python3
"""Definition-of-done gate. Usage: gate.py work/<slug>  (exit 0 pass, 2 fail with reasons)."""
import json, os, sys
d = sys.argv[1] if len(sys.argv) > 1 else None
if not d:  # hook mode: find newest work/*/scorecard target
    ws = [os.path.join("work", x) for x in os.listdir("work")] if os.path.isdir("work") else []
    if not ws: sys.exit(0)
    d = max(ws, key=os.path.getmtime)
errs = []
p = os.path.join(d, "scorecard.json")
if not os.path.exists(p): errs.append("no scorecard.json - judge with references/judge_rubric.md")
else:
    s = json.load(open(p))
    if s.get("rounds", 0) < 2: errs.append("fewer than 2 judge rounds")
    if not os.path.exists(os.path.join(d, s.get("film", "missing"))): errs.append("film MP4 missing")
    if not os.path.exists(os.path.join(d, "beats.md")): errs.append("beats.md missing")
    for sh in s.get("shots", []):
        sc = list(sh.get("scores", {}).values()) or [0]
        if sum(sc)/len(sc) < 8: errs.append(f"{sh.get('name')}: avg {sum(sc)/len(sc):.1f} < 8")
        if min(sc) < 6: errs.append(f"{sh.get('name')}: a criterion < 6")
        ev = sh.get("evidence", [])
        if not ev or not all(os.path.exists(os.path.join(d, e)) for e in ev): errs.append(f"{sh.get('name')}: evidence images missing")
    if not s.get("shots"): errs.append("no shots scored")
if errs:
    print("GATE FAILED (" + d + "):\n- " + "\n- ".join(errs), file=sys.stderr); sys.exit(2)
print("GATE PASSED", d)
