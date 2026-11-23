"""Caption-sync check on the FINISHED film: re-align the audio inside final.mp4 and compare with words.json.

Usage: python tools/sync_check.py reels/<slug> [--aligner eleven|whisper]
Writes reels/<slug>/sync.json. Pass = every word within 0.15 s and the last word is present (gate.py reads it).
"""
import argparse, json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import voice


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("dir"); ap.add_argument("--aligner", default="eleven")
    a = ap.parse_args(); D = Path(a.dir)
    cfg = json.loads((D / "script.json").read_text())
    spoken = " ".join(s for p in cfg["passages"] for _, s in voice.parse(p))
    wav = D / "_final_audio.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "quiet", "-i", str(D / "final.mp4"), "-vn", "-ac", "1", "-ar", "48000", str(wav)], check=True)
    real, _ = voice.align_eleven(wav, spoken) if a.aligner == "eleven" else voice.align_whisper(wav, spoken, cfg.get("lang", "id"))
    words = json.loads((D / "words.json").read_text())["words"]
    toks = [(d, s) for p in cfg["passages"] for d, s in voice.parse(p)]
    rows, k = [], 0
    for (d, s), w in zip(toks, words):
        n = len([x for x in s.split() if voice.norm(x)]) or 1
        if k < len(real): rows.append({"w": d, "caption": w["s"], "audio": round(real[k][1], 3), "drift": round(real[k][1] - w["s"], 3)})
        k += n
    worst = max(rows, key=lambda r: abs(r["drift"]))
    film = float(subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(D / "final.mp4")],
                                capture_output=True, text=True).stdout or 0)
    res = {"max_abs_drift": abs(worst["drift"]), "worst": worst, "last_word_present": words[-1]["e"] <= film - 0.1,
           "film_duration": film, "rows": rows}
    res["pass"] = res["max_abs_drift"] <= 0.15 and res["last_word_present"]
    (D / "sync.json").write_text(json.dumps(res, indent=1)); wav.unlink(missing_ok=True)
    print(("SYNC OK" if res["pass"] else "SYNC FAIL"), f"max drift {res['max_abs_drift']:.3f}s at '{worst['w']}', last word present: {res['last_word_present']}")


if __name__ == "__main__":
    main()
