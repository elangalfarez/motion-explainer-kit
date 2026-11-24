# Hooks
- Claude Code: `.claude/settings.json` runs `scripts/gate.py` on Stop; exit 2 blocks "done" and feeds the reasons back to the agent, so it keeps iterating.
- Codex / Cursor / Hermes / any agent: put in the prompt "You may only finish after `python3 scripts/gate.py work/<slug>` prints GATE PASSED." Run it in CI too.
- Honest limit: the gate checks that judging happened with evidence; it cannot see the pixels. The agent's own eyes (or a second judge agent) still decide quality.
