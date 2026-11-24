"""Voice-over: ElevenLabs takes -> tempo -> trim -> forced alignment on the FINAL audio -> words.json.

Usage (from the kit root):
  python tools/voice.py reels/<slug>                     # 3 takes with script.json voice, pick best, align
  python tools/voice.py reels/<slug> --takes 2 --tempo 1.15
  python tools/voice.py reels/<slug> --own-vo my_take.m4a   # your own recording (phone memo etc.), no TTS
  python tools/voice.py reels/<slug> --aligner whisper      # align with faster-whisper instead of ElevenLabs

Writes in reels/<slug>/: takes/, voice.wav, mix.wav (= voice; sfx.py layers SFX on it), words.json, env.json.

Auth: in a Claude Code cloud session add an environment *network secret* for host api.elevenlabs.io with
header `xi-api-key` (no prefix): the proxy injects the key and the agent never sees it. Locally, export
ELEVENLABS_API_KEY in your terminal. Never paste a key into the chat.

script.json fields used:
  passages: ["Bank ini pernah diambil alih negara.", "{1998.|sembilan belas sembilan puluh delapan.} Soeharto jatuh."]
            {display|spoken}: captions show the left side, the voice says the right side.
  voice: {"voice_id": "bIHbv24MWmeRgasZH58o", "model": "eleven_v3", "fallback_voice_id": "7QN34D2r3hCNwbOYIeK0"}
  lang: "id"
Why forced alignment: TTS-returned timestamps drift after a tempo change (~1.6 s by 58 s in a shipped reel).
Timing is always measured on the exact voice.wav the film uses.
"""
import argparse, json, os, re, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf

API = "https://api.elevenlabs.io/v1"
SR = 48000
WILL, WARREN = "bIHbv24MWmeRgasZH58o", "7QN34D2r3hCNwbOYIeK0"  # Will (default voice, retires 31 Dec 2026) -> Warren


def headers():
    k = os.environ.get("ELEVENLABS_API_KEY")
    return {"xi-api-key": k} if k else {}  # cloud: the network secret adds the header for us


def parse(p):  # "{1998.|sembilan belas ...} Soeharto" -> [("1998.", "sembilan belas ..."), ("Soeharto", "Soeharto")]
    return [(m[3], m[3]) if m[3] else (m[1], m[2]) for m in re.finditer(r"\{([^|}]+)\|([^}]+)\}|(\S+)", p)]


def norm(w):
    return re.sub(r"[^\w]", "", w.lower())


def tts(text, voice_id, model, out):
    import requests
    r = requests.post(f"{API}/text-to-speech/{voice_id}", headers={**headers(), "Content-Type": "application/json"},
                      params={"output_format": "mp3_44100_192"}, json={"text": text, "model_id": model}, timeout=300)
    if r.status_code != 200:
        raise RuntimeError(f"TTS {r.status_code}: {r.text[:300]}")
    out.write_bytes(r.content)


def load(f, tempo=1.0):
    af = ["-af", f"atempo={tempo}"] if tempo != 1 else []
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", str(f), *af, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def trim(a):  # cut leading/trailing silence by energy; keep a 0.45 s tail so the last word is never clipped
    hop = 480; e = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
    on = np.where(e > e.max() * 0.02)[0]
    s0 = max(0, on[0] * hop - int(.05 * SR)); s1 = min(len(a), (on[-1] + 1) * hop + int(.45 * SR))
    v = a[s0:s1]; return v / (np.abs(v).max() + 1e-6) * .89


def align_eleven(wav, text):
    import requests
    with open(wav, "rb") as f:
        r = requests.post(f"{API}/forced-alignment", headers=headers(), files={"file": ("voice.wav", f, "audio/wav")},
                          data={"text": text}, timeout=300)
    if r.status_code != 200:
        raise RuntimeError(f"forced-alignment {r.status_code}: {r.text[:300]}")
    j = r.json()
    return [(w["text"], w["start"], w["end"]) for w in j["words"] if norm(w["text"])], j.get("loss")


def align_whisper(wav, text, lang):
    from faster_whisper import WhisperModel  # pip install faster-whisper; needs huggingface.co reachable
    import difflib
    m = WhisperModel("small", device="cpu", compute_type="int8")
    # decode with ffmpeg ourselves: faster-whisper's PyAV path breaks on PyAV >= 15 (metadata_errors kwarg)
    import numpy as np
    pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(wav), "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
    segs, _ = m.transcribe(audio, language=lang, word_timestamps=True, beam_size=5, initial_prompt=text[:200])
    heard = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words if norm(w.word)]
    target = [w for w in text.split() if norm(w)]
    sm = difflib.SequenceMatcher(None, [norm(w) for w in target], [norm(h[0]) for h in heard], autojunk=False)
    tmap = {b.a + j: b.b + j for b in sm.get_matching_blocks() for j in range(b.size)}
    out = []
    for i, w in enumerate(target):  # words whisper missed get interpolated between neighbours
        if i in tmap: out.append((w, heard[tmap[i]][1], heard[tmap[i]][2])); continue
        p = out[-1][2] if out else 0.0
        n = next((heard[tmap[k]][1] for k in range(i + 1, len(target)) if k in tmap), p + .3)
        out.append((w, p, max(p + .05, n)))
    print(f"whisper match ratio {sm.ratio():.3f} (below 0.9: fix numbers/brand names, re-run)")
    return out, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir"); ap.add_argument("--takes", type=int, default=3); ap.add_argument("--take", type=int)
    ap.add_argument("--tempo", type=float, default=1.1, help="Will reads slowly: 1.1-1.2 feels like a reel")
    ap.add_argument("--own-vo"); ap.add_argument("--aligner", choices=["eleven", "whisper"], default="eleven")
    a = ap.parse_args()
    D = Path(a.dir); cfg = json.loads((D / "script.json").read_text())
    toks = [(pi, d, s) for pi, p in enumerate(cfg["passages"]) for d, s in parse(p)]
    spoken = " ".join(s for _, _, s in toks)
    v = cfg.get("voice", {}); (D / "takes").mkdir(exist_ok=True)

    if a.own_vo:
        src, tempo = Path(a.own_vo), 1.0
    else:
        files = [D / f"takes/take_{i}.mp3" for i in range(a.takes)]
        vid = v.get("voice_id", WILL)
        for f in files:  # cached: delete takes/ after editing the script
            if f.exists(): continue
            try:
                tts(spoken, vid, v.get("model", "eleven_v3"), f)
            except RuntimeError as e:
                if vid == WILL and ("not found" in str(e).lower() or "404" in str(e)):
                    print("Will is unavailable (default voices retire 31 Dec 2026): switching to Warren")
                    vid = v.get("fallback_voice_id", WARREN); tts(spoken, vid, v.get("model", "eleven_v3"), f)
                else: raise
            print("tts ->", f)
        # pick the median-length take unless --take is given (median = no rushed or dragging read)
        lens = [(len(load(f)), i) for i, f in enumerate(files)]
        pick = a.take if a.take is not None else sorted(lens)[len(lens) // 2][1]
        src, tempo = files[pick], a.tempo
        print("using", src.name, "of", [f.name for f in files], "(listen to all; --take N to override)")

    vo = trim(load(src, tempo))
    sf.write(D / "voice.wav", vo, SR); sf.write(D / "mix.wav", vo, SR)
    words, loss = align_eleven(D / "voice.wav", spoken) if a.aligner == "eleven" else align_whisper(D / "voice.wav", spoken, cfg.get("lang", "id"))

    out, k = [], 0  # map aligned spoken words back onto DISPLAY tokens
    for pi, d, s in toks:
        n = len([w for w in s.split() if norm(w)]) or 1
        seg = words[k:k + n] or [words[-1]]; k += n
        out.append({"w": d, "s": round(seg[0][1], 3), "e": round(seg[-1][2], 3), "p": pi})
    if k != len(words):
        print(f"WARNING: aligned {len(words)} words but script has {k}: check {{display|spoken}} tokens", file=sys.stderr)
    (D / "words.json").write_text(json.dumps({"duration": round(len(vo) / SR, 3), "words": out}, indent=0))
    rms = [float(np.sqrt(np.mean(vo[i:i + 800] ** 2))) for i in range(0, len(vo), 800)]  # 60 fps mouth/beat envelope
    mx = np.percentile(rms, 95) + 1e-9
    (D / "env.json").write_text(json.dumps({"fps": 60, "env": [round(min(1.2, x / mx), 3) for x in rms]}))
    print(f"voice.wav {len(vo) / SR:.2f}s, {len(out)} words" + (f", align loss {loss:.3f}" if loss is not None else ""))
    print(" | ".join(f'{w["w"]}@{w["s"]}' for w in out))


if __name__ == "__main__":
    main()
