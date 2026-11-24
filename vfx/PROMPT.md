# Hand-off prompt (paste into any agent, with this folder as the working dir)
Read SKILL.md and every file in references/ fully before writing code. Then: <BRIEF, e.g. "make a cool sword sheath animation" or "reverse engineer this video: URL">.
Follow the Steps exactly, use the house taste when no reference is given, render the example in engine/examples first to calibrate the quality bar, judge from images, and finish only when `python3 scripts/gate.py work/<slug>` passes. Report the scorecard and remaining gaps honestly.
