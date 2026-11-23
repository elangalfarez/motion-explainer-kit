# Voice: "Will", tempo, word timing

## Default: ElevenLabs "Will"
- Voice ID `bIHbv24MWmeRgasZH58o` (laid-back young male). Reads slowly: we speed it with `atempo` 1.1–1.2.
- **ElevenLabs retires its default voices on 31 Dec 2026.** Their suggested replacement for Will is
  "Warren - Effortless and Cool", ID `7QN34D2r3hCNwbOYIeK0`. `tools/voice.py` falls back to it automatically if Will 404s;
  you can also pick any voice from the ElevenLabs Voice Library and put its ID in `script.json.voice.voice_id`.
- Model: `eleven_v3` (default in script.json) or `eleven_v4` if the account has it. Both speak Indonesian.
- Account: free plan has 10,000 credits/month and API access, but **no commercial licence** (free-plan content must
  credit "elevenlabs.io" and can't be used commercially). A paid plan gives commercial rights. Check current pricing.

## Connecting the key (never paste it in chat)
- **Claude Code cloud (claude.ai/code):** environment settings → Network secrets → Add secret →
  Allowed websites `api.elevenlabs.io`, header name `xi-api-key`, clear the "Bearer" prefix, paste the key as Value.
  The proxy adds the key to each request; the agent never sees it and the host becomes reachable even on Limited network.
- **Local terminal:** `export ELEVENLABS_API_KEY=...` in your shell (not in a file you commit).

## Timing pipeline (tools/voice.py)
3 takes → pick the median-length take → atempo → trim silence (keep a 0.45 s tail) → **forced alignment on that final
voice.wav** (ElevenLabs `/v1/forced-alignment`) → words.json mapped back to display tokens → env.json (60 fps loudness
for mouths/beats). Listen to all takes; `--take N` overrides the pick.
- Why not the TTS timestamps: after a tempo change they drift (we shipped a reel 1.6 s off by the end once).
- After the final render, `tools/sync_check.py` re-aligns the audio inside final.mp4: every word within 0.15 s.

## Whisper option ("whisper flow")
`--aligner whisper` uses faster-whisper (`pip install faster-whisper`; downloads a model from huggingface.co, so add
`huggingface.co` and `*.hf.co` to the environment's Allowed domains). Good for your own recording in any language when
you don't want ElevenLabs at all. Whisper mishears numbers and brand names: put them in the script exactly as spoken.
(Wispr Flow, the dictation app, is a different thing: handy for dictating your raw story into the prompt.)

## Your own voice
Record on your phone (quiet room, 20 cm from the mic), upload the file into the session, then
`python3 tools/voice.py reels/<slug> --own-vo my_take.m4a`. The script must match what you said word for word.
