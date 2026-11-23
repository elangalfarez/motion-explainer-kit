"""Render a reel (scene.js, Canvas2D/Three.js) frame by frame in headless Chrome, then mux the audio.

Usage (run from the kit root):
  python tools/render.py reels/<slug> --stills 0.5,3,7   # PNG stills -> reels/<slug>/stills/
  python tools/render.py reels/<slug> --judge 2          # one frame every 2 s -> reels/<slug>/judge/ + judge/sheet.png
  python tools/render.py reels/<slug> --from 4 --to 9    # silent preview clip -> reels/<slug>/clip.mp4
  python tools/render.py reels/<slug>                    # full film -> reels/<slug>/final.mp4 (needs mix.wav)
Options: --crf 20 (raise to shrink the file; 20 keeps a 60 s reel around 25-45 MB), --fps 30.

The scene lives in <dir>/scene.js and imports ../../vendor/*.js, so a reel folder must sit two levels under the
kit root (reels/<slug> or examples/<slug>). Browser: $CHROME_PATH (preinstalled in Claude Code cloud sessions at
/usr/bin/google-chrome), else Playwright's own Chromium (`python -m playwright install chromium-headless-shell`).
"""
import argparse, asyncio, base64, functools, http.server, json, os, shutil, subprocess, threading, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PAGE = """<!doctype html><html><head><meta charset=utf-8><style>
@font-face{font-family:Outfit;font-weight:700;src:url(/vendor/outfit-latin-700-normal.woff2)}
@font-face{font-family:Outfit;font-weight:800;src:url(/vendor/outfit-latin-800-normal.woff2)}
@font-face{font-family:Outfit;font-weight:900;src:url(/vendor/outfit-latin-900-normal.woff2)}
body{margin:0;background:#000}</style></head><body>
<script>window.WORDS_DATA=__WORDS__;</script>
<script type=module src="/__REL__/scene.js?v=__V__"></script></body></html>"""


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass


def serve():
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]


def chrome():
    p = os.environ.get("CHROME_PATH")
    if p and Path(p).exists(): return p
    for c in ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]:
        if Path(c).exists(): return c
    return None  # let Playwright use the browser it downloaded itself


async def open_page(vdir):
    from playwright.async_api import async_playwright
    port = serve()
    rel = vdir.relative_to(ROOT).as_posix()
    html = PAGE.replace("__WORDS__", (vdir / "words.json").read_text()).replace("__REL__", rel).replace("__V__", str(time.time()))
    (vdir / "_page.html").write_text(html)
    pw = await async_playwright().start()
    br = await pw.chromium.launch(executable_path=chrome(), headless=True, args=[
        "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--disable-gpu-sandbox",
        "--no-sandbox", "--disable-dev-shm-usage"])
    page = await br.new_page(viewport={"width": 1080, "height": 1920})
    logs = []
    page.on("console", lambda m: logs.append(m.text))
    page.on("pageerror", lambda e: logs.append("PAGEERROR " + str(e)))
    await page.goto(f"http://127.0.0.1:{port}/{rel}/_page.html")
    try:
        await page.wait_for_function("window.REEL_READY===true", timeout=120000)
    except Exception:
        print("\n".join(logs)); raise
    return pw, br, page, logs


async def frame(page, t, png=False):
    url = await page.evaluate(f"renderFrame({t:.4f}, '{'image/png' if png else 'image/jpeg'}')")
    return base64.b64decode(url.split(",", 1)[1])


def problems(logs):
    return [l for l in logs if any(k in l.lower() for k in ("error", "warn", "missing", "not found"))]


def sheet(folder, cols=6):
    files = sorted(folder.glob("t*.png"))
    if not files: return None
    out = folder / "sheet.png"
    cols = min(cols, len(files)); rows = (len(files) + cols - 1) // cols
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-pattern_type", "glob", "-i", str(folder / "t*.png"),
                    "-vf", f"scale=270:-1,tile={cols}x{rows}:padding=6:color=white", "-frames:v", "1", str(out)], check=True)
    return out


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir"); ap.add_argument("--stills"); ap.add_argument("--judge", type=float)
    ap.add_argument("--from", dest="t0", type=float); ap.add_argument("--to", dest="t1", type=float)
    ap.add_argument("--tail", type=float, default=0.8); ap.add_argument("--crf", type=int, default=20)
    ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args()
    vdir = Path(a.dir).resolve()
    dur = json.loads((vdir / "words.json").read_text())["duration"] + a.tail
    pw, br, page, logs = await open_page(vdir)
    try:
        if a.stills or a.judge:
            sd = vdir / ("judge" if a.judge else "stills"); sd.mkdir(exist_ok=True)
            ts = [float(s) for s in a.stills.split(",")] if a.stills else [round(i * a.judge, 2) for i in range(int(dur / a.judge) + 1)]
            for t in ts:
                (sd / f"t{t:06.2f}.png").write_bytes(await frame(page, t, png=True))
            if problems(logs): print("console:", problems(logs)[:10])
            sh = sheet(sd)
            print(f"{len(ts)} frames -> {sd}" + (f"  contact sheet -> {sh}" if sh else "")); return
        t0, t1 = a.t0 or 0.0, a.t1 or dur
        partial = a.t0 is not None or a.t1 is not None
        video = vdir / ("clip.mp4" if partial else "video_only.mp4")
        ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(a.fps),
                               "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", str(a.crf),
                               "-pix_fmt", "yuv420p", str(video)], stdin=subprocess.PIPE)
        n = int(round((t1 - t0) * a.fps)); st = time.time()
        for i in range(n):
            ff.stdin.write(await frame(page, t0 + i / a.fps))
            if i % 60 == 0:
                el = time.time() - st
                print(f"frame {i}/{n}  {el:.0f}s  eta {el / max(1, i) * (n - i):.0f}s", flush=True)
        ff.stdin.close(); ff.wait()
        if problems(logs): print("console:", problems(logs)[:10])
        if partial:
            print("clip ->", video); return
        mix = vdir / "mix.wav"
        if not mix.exists():
            shutil.move(video, vdir / "final.mp4"); print("no mix.wav: silent final ->", vdir / "final.mp4"); return
        clip = n / a.fps  # pad audio to the picture length (never -shortest: it clips the ending)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-i", str(mix), "-filter_complex",
                        f"[1:a]apad,afade=t=out:st={max(0, clip - .25):.3f}:d=0.25[a]", "-map", "0:v", "-map", "[a]",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{clip:.3f}", "-movflags", "+faststart",
                        str(vdir / "final.mp4")], check=True)
        video.unlink(missing_ok=True)
        mb = (vdir / "final.mp4").stat().st_size / 1e6
        print(f"final -> {vdir / 'final.mp4'}  ({mb:.1f} MB)")
    finally:
        await br.close(); await pw.stop()


if __name__ == "__main__":
    asyncio.run(main())
