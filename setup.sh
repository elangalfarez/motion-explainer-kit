#!/usr/bin/env bash
# One-time setup for a session (Claude Code cloud VM, Mac or Linux). Safe to re-run.
#   bash setup.sh          # tools + browser check + clone the reference skills into refs/
#   bash setup.sh --fast   # skip cloning reference repos
set -u
cd "$(dirname "$0")"
ok(){ printf '  \033[32mOK\033[0m %s\n' "$1"; }; bad(){ printf '  \033[31m!!\033[0m %s\n' "$1"; }

echo "1/5 ffmpeg"
if ! command -v ffmpeg >/dev/null; then
  if command -v apt-get >/dev/null; then (sudo -n true 2>/dev/null && S=sudo || S=""; $S apt-get update -qq && $S apt-get install -y -qq ffmpeg >/dev/null); 
  elif command -v brew >/dev/null; then brew install ffmpeg; fi
fi
command -v ffmpeg >/dev/null && ok "ffmpeg $(ffmpeg -version | head -1 | cut -d' ' -f3)" || bad "ffmpeg missing: install it"

echo "2/5 python packages"
python3 -m pip install -q -r requirements.txt 2>/dev/null || python3 -m pip install -q --break-system-packages -r requirements.txt
python3 -c "import playwright, numpy, scipy, soundfile, requests" && ok "playwright numpy scipy soundfile requests" || bad "pip install failed"

echo "3/5 headless browser"
if [ -n "${CHROME_PATH:-}" ] && [ -x "$CHROME_PATH" ]; then ok "Chrome at $CHROME_PATH (cloud VM)";
elif [ -x /usr/bin/google-chrome ]; then ok "Chrome at /usr/bin/google-chrome";
else python3 -m playwright install chromium-headless-shell >/dev/null 2>&1 && ok "Playwright Chromium downloaded" || bad "no browser: set CHROME_PATH or allow Playwright downloads"; fi

echo "4/5 ElevenLabs (voice + forced alignment)"
code=$(curl -s -o /dev/null -w '%{http_code}' ${ELEVENLABS_API_KEY:+-H "xi-api-key: $ELEVENLABS_API_KEY"} https://api.elevenlabs.io/v1/user || echo 000)
case $code in
  200) ok "api.elevenlabs.io reachable and authorised";;
  401) bad "reachable but no key: add a network secret (host api.elevenlabs.io, header xi-api-key) or export ELEVENLABS_API_KEY";;
  *)   bad "api.elevenlabs.io blocked (HTTP $code): add it under the environment's network secret / Allowed domains. Own-VO + whisper still works";;
esac

echo "5/5 reference skills -> refs/ (read-only inspiration, not copied into the kit)"
if [ "${1:-}" != "--fast" ]; then
  mkdir -p refs
  while read -r name url; do
    [ -z "$name" ] && continue
    if [ -d "refs/$name/.git" ]; then git -C "refs/$name" pull -q --ff-only 2>/dev/null; else GIT_TERMINAL_PROMPT=0 timeout 120 git clone -q --depth 1 "$url" "refs/$name" 2>/dev/null; fi
    [ -d "refs/$name" ] && ok "$name" || bad "$name ($url) not cloned"
  done < references/skill_repos.txt
fi
echo "Done. Next: read CLAUDE.md, then render an example:  python3 tools/render.py examples/bbca_salim --stills 1,8,20,40"
