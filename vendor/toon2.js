// toon2: motion-craft layer on top of toon.js. Everything is a pure function of t (frames render out of order).
// Principles distilled from pro motion studies (motionmaxxing, ClaudeAnimationBase, animate, lottie motion-design):
//  - characters on TWOS (15 fps drawings), camera on ONES + shutter blur  -> crisp hand-drawn acting, filmic camera
//  - arrive by DECELERATING FROM OVERSIZE (most travel in the first 4-8 frames, long tail), never grow from zero
//  - anticipation before every big move, squash on contact, follow-through on hanging parts (lag)
//  - impact frames (2 frames of ink burst) + dust + camera kick sell every hit
//  - one living thing in every held frame; paper grain so the ground is a surface, not a swatch
import { W, H, C, clamp, lerp, ease, prog, hash, blob, inkFill, wline, boilText } from './toon.js';

export const FPS = 30;
// hold each drawing 2 frames; the 1/120 offset keeps all shutter sub-samples of one frame on the same drawing
export const twos = t => Math.floor((t + 1 / 120) * 15 + 1e-6) / 15;
export const threes = t => Math.floor(t * 10 + 1e-6) / 10;
export const easeX = {
  // land: huge early travel, long soft tail, no bounce (measured "soft land")
  land: t => 1 - Math.pow(1 - clamp(t), 4.2),
  // leave: ease in, accelerate out of frame
  leave: t => Math.pow(clamp(t), 2.6),
  // snap with one small overshoot (one visible spring per film)
  snap: t => { t = clamp(t); return 1 - Math.exp(-7 * t) * Math.cos(9 * t); },
};

// value of fn at a slightly earlier time: follow-through for hanging parts (hair, tie, string, held props)
export const lag = (fn, t, d = .06) => fn(t - d);

// anticipation -> action -> settle, as squash (+) / stretch (-) and vertical offset (px, - = up)
// t0 = moment of action (usually a word time). a = amount.
export function antic(t, t0, a = 1, pre = .16, hang = .32) {
  if (t < t0 - pre || t > t0 + hang + .8) return { sq: 0, dy: 0 };
  if (t < t0) { const k = prog(t, t0 - pre, t0, ease.out); return { sq: .16 * a * k, dy: 10 * a * k }; }      // crouch
  if (t < t0 + hang) { const k = (t - t0) / hang, arc = Math.sin(k * Math.PI);                                  // hop on an arc
    return { sq: -.14 * a * Math.sin(Math.min(1, k * 2.2) * Math.PI) , dy: -90 * a * arc }; }
  const d = t - t0 - hang; return { sq: .18 * a * Math.exp(-9 * d) * Math.cos(d * 26), dy: 0 };               // squash land, settle
}
// a "take": the head/body snaps big then settles (reaction)
export function take(t, t0, a = 1) {
  if (t < t0 - .1 || t > t0 + 1) return 0;
  if (t < t0) return -.06 * a * prog(t, t0 - .1, t0);
  const d = t - t0; return a * .22 * Math.exp(-6 * d) * Math.cos(d * 18);
}

// arrival from oversize: returns {k (0..1 progress), s (scale), a (alpha)}
export function arrive(t, t0, dur = .3, from = 2.6) {
  const k = easeX.land(prog(t, t0, t0 + dur, ease.lin));
  return { k, s: lerp(from, 1, k), a: t < t0 ? 0 : clamp((t - t0) / .05), on: t >= t0 };
}
// exit: accelerate out (shrink + move)
export function leave(t, t1, dur = .22) { return easeX.leave(prog(t, t1, t1 + dur, ease.lin)); }

// 2-3 frame impact flag
export const impactOn = (t, t0, frames = 2) => t >= t0 && t < t0 + frames / FPS;

// ink starburst behind an impact (world or screen space), lasts ~3 frames then dust takes over
export function burst(g, t, t0, x, y, r = 260, col = C.ink, n = 14) {
  const d = t - t0; if (d < 0 || d > .14) return;
  const k = d / .14, B = Math.floor(t0 * 30);
  g.save(); g.translate(x, y);
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + hash(B + i) * .3, r0 = r * (.35 + k * .5), r1 = r * (.75 + hash(i + B) * .5 + k * .6);
    g.beginPath(); g.moveTo(Math.cos(a - .05) * r0, Math.sin(a - .05) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.lineTo(Math.cos(a + .05) * r0, Math.sin(a + .05) * r0);
    g.closePath(); g.fillStyle = col; g.globalAlpha = 1 - k * .6; g.fill();
  }
  g.restore();
}
// dust puffs rolling out along the ground from (x,y)
export function dust(g, t, t0, x, y, n = 7, spread = 1) {
  const d = t - t0; if (d < 0 || d > .9) return;
  const k = easeX.land(d / .9);
  g.save();
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, sp = (.5 + hash(i * 3.1 + t0) * .7) * spread;
    const px = x + side * k * 230 * sp, py = y - k * (20 + hash(i + 7) * 50) - 10;
    const r = (14 + hash(i + 2) * 22) * (1 - k * .55) * (.6 + k);
    g.globalAlpha = (1 - k) * .95;
    blob(g, px, py, r * 1.3, r, 700 + i, 14, 1.2); inkFill(g, '#EFE7D8', 4);
  }
  g.restore();
}
// soft contact shadow; lift = height above ground (shadow shrinks)
export function shadow(g, x, y, w, lift = 0) {
  const s = clamp(1 - lift / 500, .35, 1);
  g.save(); g.globalAlpha = .18 * s; g.fillStyle = C.ink; g.beginPath(); g.ellipse(x, y + 2, w * s, w * .16 * s, 0, 0, 7); g.fill(); g.restore();
}
// motion trail: draw past poses with decreasing alpha (smear multiples for fast props)
export function echo(g, t, drawAt, n = 3, dt = 1 / 30) {
  for (let i = n; i >= 1; i--) { g.save(); g.globalAlpha *= .16 * (n - i + 1) / n; drawAt(g, t - i * dt); g.restore(); }
  drawAt(g, t);
}
// screen-space speed lines when the camera whips (vx in px/s of world motion on screen)
export function speedLines(g, t, vx, vy = 0) {
  const v = Math.hypot(vx, vy); if (v < 2500) return;
  const k = clamp((v - 2500) / 9000), a = Math.atan2(vy, vx), B = Math.floor(t * 30);
  g.save(); g.translate(W / 2, H / 2); g.rotate(a); g.strokeStyle = C.ink; g.lineCap = 'round';
  for (let i = 0; i < 22; i++) {
    const y = (hash(B * 3 + i) - .5) * H * 1.2, x = (hash(B * 7 + i + 50) - .5) * W * 1.4, len = 200 + hash(i + B) * 600 * k;
    g.globalAlpha = .35 * k; g.lineWidth = 3 + hash(i) * 6; g.beginPath(); g.moveTo(x - len / 2, y); g.lineTo(x + len / 2, y); g.stroke();
  }
  g.restore();
}

// paper grain + edge vignette (screen space, last). Noise tile regenerated deterministically, shifts at 12 fps.
let GRAIN = null;
function grainTile() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), d = x.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = hash(i * .731) * 255; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
  x.putImageData(d, 0, 0); return c;
}
export function paperFinish(g, t, amt = .07) {
  GRAIN = GRAIN || grainTile(); const B = Math.floor(t * 12);
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = amt;
  const p = g.createPattern(GRAIN, 'repeat'); g.translate(-(hash(B) * 256), -(hash(B + 9) * 256)); g.fillStyle = p; g.fillRect(0, 0, W + 512, H + 512); g.restore();
  const v = g.createRadialGradient(W / 2, H * .46, H * .32, W / 2, H * .5, H * .78);
  v.addColorStop(0, 'rgba(60,40,20,0)'); v.addColorStop(1, 'rgba(60,40,20,.22)');
  g.save(); g.fillStyle = v; g.fillRect(0, 0, W, H); g.restore();
}

// kinetic headline at speech rhythm: whole words slam in from oversize, 3-5 frames apart, exit accelerating up.
// parts: [[word, colour], ...]; ts: optional array of start times per word (else t0 + i*gap)
export function slamLine(g, t, t0, parts, y, size, o = {}) {
  const gap = o.gap ?? 4 / 30, t1 = o.t1;
  g.save(); g.font = `900 ${size}px ${C.font}`; g.textBaseline = 'middle';
  const sp = size * .26, ws = parts.map(p => g.measureText(p[0]).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let fit = Math.min(1, (o.maxW ?? 960) / tot);
  let x = W / 2 - tot * fit / 2;
  const out = t1 != null ? leave(t, t1, .2) : 0;
  parts.forEach(([txt, col], i) => {
    const ts = o.ts ? o.ts[i] : t0 + i * gap, A = arrive(t, ts, o.dur ?? .28, o.from ?? 2.4);
    const cx = x + ws[i] * fit / 2; x += (ws[i] + sp) * fit;
    if (!A.on || out >= .999) return;
    g.save(); g.translate(cx, y - out * 140); const s = A.s * fit * (1 - out * .4); g.scale(s, s);
    g.rotate((1 - A.k) * (i % 2 ? .08 : -.08) + (o.rot ?? -.02)); g.globalAlpha = A.a * (1 - out);
    g.lineJoin = 'round'; g.textAlign = 'center';
    g.fillStyle = C.ink; g.fillText(txt, 8, 10);                          // hard offset shadow (print feel)
    g.lineWidth = o.stroke ?? 16; g.strokeStyle = C.ink; g.strokeText(txt, 0, 0);
    g.fillStyle = col; g.fillText(txt, 0, 0); g.restore();
  });
  g.restore();
}

// camera helper: numeric velocity of a camera function (for speed lines / blur decisions)
export function camVel(cam, t) { const a = cam(t - 1 / 60), b = cam(t + 1 / 60); return { vx: (b.x - a.x) * 30 * a.z, vy: (b.y - a.y) * 30 * a.z }; }
// camera kick: sum of decaying shakes at given times [[t, px], ...]
export function kick(t, hits) {
  let x = 0, y = 0;
  for (const [t0, a] of hits) { const d = t - t0; if (d < 0 || d > .5) continue; const e = Math.exp(-9 * d) * a; x += Math.sin(d * 75) * e; y += Math.cos(d * 61) * e * .7; }
  return { x, y };
}
