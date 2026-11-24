"""Pixel-sample a reference frame to measure colours and band positions (for fitting glows/lenses numerically).
usage: python colorprobe.py FRAME.jpg colors X1,Y1 X2,Y2 ...         -> RGB/hex at points (5x5 median)
       python colorprobe.py FRAME.jpg bands [MINE.jpg] [--r 215 --g 90]  -> per-column y-runs of bright pixels (orig vs mine)"""
import sys
import numpy as np
from PIL import Image

def load(f): return np.asarray(Image.open(f).convert('RGB')).astype(int)

def colors(a, pts):
    for p in pts:
        x, y = map(int, p.split(','))
        c = np.median(a[max(0,y-2):y+3, max(0,x-2):x+3].reshape(-1, 3), 0).astype(int)
        print(f"{x},{y}: rgb{tuple(int(v) for v in c)} #{c[0]:02x}{c[1]:02x}{c[2]:02x}")

def bands(a, rt, gt):
    m = (a[:, :, 0] > rt) & (a[:, :, 1] > gt); out = {}
    for x in range(100, a.shape[1] - 20, 150):
        ys = np.where(m[:, x])[0]; runs = []
        if len(ys):
            s = p = ys[0]
            for y in ys[1:]:
                if y - p > 8: runs.append((int(s), int(p))); s = y
                p = y
            runs.append((int(s), int(p)))
        out[x] = [r for r in runs if r[1] - r[0] > 12]
    return out

def main():
    f, mode, rest = sys.argv[1], sys.argv[2], sys.argv[3:]
    if mode == 'colors': return colors(load(f), rest)
    rt = int(rest[rest.index('--r') + 1]) if '--r' in rest else 215
    gt = int(rest[rest.index('--g') + 1]) if '--g' in rest else 90
    other = [r for r in rest if r.endswith(('.jpg', '.png'))]
    o = bands(load(f), rt, gt); s = bands(load(other[0]), rt, gt) if other else {}
    for x in o: print(x, 'O', o[x], ' S', s.get(x))

main()
