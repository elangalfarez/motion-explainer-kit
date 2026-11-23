"""Cartoon SFX layer (NumPy) mixed over an existing mix.wav.
Usage: python sfx.py VIDEO_DIR   # reads VIDEO_DIR/sfx.json [{"t":sec,"type":"whoosh|pop|stamp|kaching|boing|type|zip|swish|ding","len"?,"gain"?}]
Writes VIDEO_DIR/mix_sfx.wav (mix.wav + sfx, peak-limited)."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, lfilter

SR = 48000
rng = np.random.default_rng(7)
def tt(d): return np.arange(int(d * SR)) / SR
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def env(n, a, r): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)

def whoosh(L=.5):
    n = int(L * SR); x = rng.standard_normal(n); out = np.zeros(n); seg = 2400
    for i in range(0, n, seg):  # sweeping band
        p = i / n; c = 400 + 3000 * np.sin(p * np.pi); out[i:i + seg] = bp(x[i:i + seg], c * .6, min(c * 1.6, 20000))
    return out * np.sin(np.linspace(0, np.pi, n)) ** 2 * .5
def pop(): t = tt(.12); f = 900 * np.exp(-t * 30) + 300; return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .002, .03) * .5
def stamp(): t = tt(.35); return (np.sin(2 * np.pi * 70 * t) * env(len(t), .001, .08) + bp(rng.standard_normal(len(t)), 200, 2000) * env(len(t), .001, .02)) * .8
def kaching():
    t = tt(.9); x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(2093, 5), (2637, 6), (3136, 7), (4186, 9)]) * .12
    x[:int(.05 * SR)] += bp(rng.standard_normal(int(.05 * SR)), 2000, 8000) * .4; d = int(.08 * SR); x[d:] += x[:-d] * .6; return x
def boing(): t = tt(.45); f = 180 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 6); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .003, .15) * .5
def typing(L=1.0):
    n = int(L * SR); out = np.zeros(n); k = 0
    while k < n - 2000: c = bp(rng.standard_normal(600), 1500, 6000) * env(600, .0005, .004) * (.5 + rng.random() * .5); out[k:k + 600] += c; k += int(SR * (.05 + rng.random() * .06))
    return out * .6
def zip_(): t = tt(.1); f = 600 + 4000 * t / .1; return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .005, .05) * .18
def swish(L=1.2): x = bp(rng.standard_normal(int(L * SR)), 3000, 9000); return x * np.sin(np.linspace(0, np.pi, len(x))) * .25
def ding(): t = tt(.6); return (np.sin(2 * np.pi * 1568 * t) + .4 * np.sin(2 * np.pi * 3136 * t)) * np.exp(-t * 7) * .25
GEN = {'whoosh': whoosh, 'pop': pop, 'stamp': stamp, 'kaching': kaching, 'boing': boing, 'type': typing, 'zip': zip_, 'swish': swish, 'ding': ding}

def lp(x, hz): b, a = butter(2, hz / (SR / 2), 'low'); return lfilter(b, a, x)

def duck_env(v, depth=.45, att=.03, rel=.25):
    """1.0 where the voice is silent, (1-depth) under speech; smoothed attack/release."""
    hop = 480; n = len(v) // hop + 1; e = np.array([np.sqrt(np.mean(v[i*hop:(i+1)*hop]**2) + 1e-12) for i in range(n)])
    on = (e > np.percentile(e, 60) * .35).astype(float); g = np.ones(n); cur = 1.0
    for i in range(n):
        tgt = 1 - depth * on[i]; k = att if tgt < cur else rel; cur += (tgt - cur) * min(1, (hop / SR) / k); g[i] = cur
    return np.interp(np.arange(len(v)), np.arange(n) * hop, g)

def main():
    """Soft mix (2026-11-18, elang: SFX were too harsh and rain masked the VO):
    fx bus lowpassed at 5.5 kHz, bus gain .32, ducked ~-5 dB under the voice, gentle soft-clip."""
    d = Path(sys.argv[1]); mix, sr = sf.read(d / 'mix.wav'); assert sr == SR
    if mix.ndim > 1: mix = mix.mean(1)
    fx = np.zeros_like(mix)
    for e in json.loads((d / 'sfx.json').read_text()):
        f = GEN[e['type']]; x = f(e['len']) if 'len' in e and e['type'] in ('whoosh', 'type', 'swish') else f()
        x = x * e.get('gain', 1.0); i = int(e['t'] * SR)
        if e['type'] == 'whoosh': i -= len(x) // 2
        i = max(0, i); j = min(len(fx), i + len(x)); fx[i:j] += x[:j - i]
    fx = lp(fx, 5500)
    vp = d / 'voice.wav'
    if vp.exists():
        v, _ = sf.read(vp); v = v.mean(1) if v.ndim > 1 else v; v = np.pad(v, (0, max(0, len(fx) - len(v))))[:len(fx)]
        fx = fx * duck_env(v)
    out = mix + fx * .32; pk = np.abs(out).max()
    out = np.tanh(out * 1.1) / np.tanh(1.1) if pk > .9 else out
    pk2 = np.abs(out).max(); out *= min(1, .95 / pk2)
    sf.write(d / 'mix_sfx.wav', out, SR); print(json.dumps({'events': len(json.loads((d / 'sfx.json').read_text())), 'peak_in': float(pk)}))
main()
