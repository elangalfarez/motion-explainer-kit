"""Render a pure render(t) Canvas scene to stills or MP4 (headless Chromium, frame-exact seeking).

usage:
  uv run --with playwright python render.py SCENE.html stills OUTDIR t1 t2 ...
  uv run --with playwright python render.py SCENE.html video OUT.mp4 [--fps 60] [--dur 14.6] [--mbk 4] [--from 0] [--to DUR]
Scene contract: <canvas id="c">, window.render(t) draws frame t, optional window.DUR, window.MBK = motion-blur subframes.
First run in a fresh sandbox: `uv run --with playwright python -m playwright install chromium`.
"""
import sys, subprocess, base64, time, pathlib, argparse
from playwright.sync_api import sync_playwright


def open_page(p, scene, mbk):
    b = p.chromium.launch(args=["--disable-web-security", "--allow-file-access-from-files"])
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.on("console", lambda m: print("JS:", m.text))
    pg.on("pageerror", lambda e: print("PAGEERR:", e))
    pg.goto(pathlib.Path(scene).resolve().as_uri())
    pg.evaluate(f"window.MBK={mbk}")
    # Canvas-only faces may not be requested when fonts.ready first resolves.
    pg.evaluate("async()=>{if(window.ready)await window.ready;else await Promise.all([...document.fonts].map(f=>f.load()));await document.fonts.ready;return 1}")
    pg.wait_for_timeout(500)
    return b, pg


GRAB = "(t)=>{render(t);return document.getElementById('c').toDataURL('image/jpeg',0.93)}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("scene"); ap.add_argument("mode", choices=["stills", "video"]); ap.add_argument("out")
    ap.add_argument("times", nargs="*", type=float)
    ap.add_argument("--fps", type=int, default=60); ap.add_argument("--dur", type=float)
    ap.add_argument("--mbk", type=int, default=4); ap.add_argument("--from", dest="t0", type=float, default=0)
    ap.add_argument("--to", dest="t1", type=float)
    a = ap.parse_args()
    with sync_playwright() as p:
        b, pg = open_page(p, a.scene, a.mbk if a.mode == "video" else 1)
        if a.mode == "stills":
            out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
            for t in a.times:
                d = pg.evaluate(GRAB, t)
                (out / f"s_{t}.jpg").write_bytes(base64.b64decode(d.split(",")[1]))
            print("stills ->", out)
        else:
            dur = a.dur or pg.evaluate("window.DUR||0") or 10
            t1 = a.t1 or dur
            n0, n1 = int(a.t0 * a.fps), int(t1 * a.fps)
            ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", str(a.fps),
                                   "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                                   "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
            t0 = time.time()
            for i in range(n0, n1):
                d = pg.evaluate(GRAB, i / a.fps)
                ff.stdin.write(base64.b64decode(d.split(",")[1]))
                if i % 60 == 0:
                    print(i, n1, round(time.time() - t0, 1), flush=True)
            ff.stdin.close(); ff.wait()
            print("video ->", a.out)
        b.close()


main()
