"""Render scene.html frame-by-frame -> mp4 (or stills). usage: render.py stills t1 t2 ... | render.py video FPS OUT"""
import sys, subprocess, base64, time, pathlib
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent

def main():
    mode = sys.argv[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--disable-web-security", "--allow-file-access-from-files"])
        pg = b.new_page(viewport={"width": 1920, "height": 1080})
        pg.on("console", lambda m: print("JS:", m.text))
        pg.on("pageerror", lambda e: print("PAGEERR:", e))
        import os
        pg.goto((HERE / os.environ.get("SCENE","scene.html")).as_uri())
        pg.evaluate("window.MBK="+os.environ.get("MBK","1"))
        pg.evaluate("document.fonts.ready.then(()=>1)")
        pg.wait_for_timeout(500)
        grab = "(t)=>{render(t);return document.getElementById('c').toDataURL('image/jpeg',0.93)}"
        if mode == "stills":
            for t in sys.argv[2:]:
                d = pg.evaluate(grab, float(t))
                (HERE / f"s_{t}.jpg").write_bytes(base64.b64decode(d.split(",")[1]))
        else:
            fps, out = int(sys.argv[2]), sys.argv[3]
            n = int(14.6 * fps)
            ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", str(fps),
                                   "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                                   "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
            t0 = time.time()
            for i in range(n):
                d = pg.evaluate(grab, i / fps)
                ff.stdin.write(base64.b64decode(d.split(",")[1]))
                if i % 60 == 0:
                    print(i, n, round(time.time() - t0, 1), flush=True)
            ff.stdin.close(); ff.wait()
        b.close()

main()
