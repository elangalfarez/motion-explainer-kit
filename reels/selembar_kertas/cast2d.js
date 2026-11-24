// cast2d: 2D rubber-hose characters and print-style labels standing inside the 3D world.
import { W, H, C, clamp, lerp, ease, prog, hash, guy, rrect } from '../../vendor/toon.js';
import { shadow } from '../../vendor/toon2.js';
import { proj } from './world3d.js';

const GUY_PX = 451; // guy() height in px at s=1 (feet at 0, top of head at -451)

// Draw a guy standing at world (x, y, z), h world units tall. Returns {x, y, top, s} in screen px.
export function figure(g, x, y, z, st = {}, seed = 1, h = 1.85) {
  const [sx, sy, d, ppu] = proj(x, y, z); if (d > 1 || d < -1) return null;
  const s = ppu * h / GUY_PX;
  if (!st.noShadow) shadow(g, sx, sy, 80 * s, (st.lift ?? 0) * s);
  guy(g, { ...st, x: sx + (st.dx ?? 0) * s, y: sy - (st.lift ?? 0) * s, s: s * (st.s ?? 1) }, seed);
  return { x: sx, y: sy, top: sy - GUY_PX * s * (st.s ?? 1), s };
}

// Role chip: names a character by office, never by face. Pops in from oversize.
export function chip(g, t, t0, t1, x, y, text, o = {}) {
  const k = prog(t, t0, t0 + .22, ease.out), out = t1 != null ? prog(t, t1, t1 + .18, ease.in) : 0;
  if (k <= .002 || out >= .999) return;
  const size = o.size ?? 40;
  g.save(); g.font = `900 ${size}px ${C.font}`; const tw = g.measureText(text).width, pw = tw + size * 1.1, ph = size * 1.55;
  x = Math.min(W - pw / 2 - 24, Math.max(pw / 2 + 24, x));   // never clipped by the frame edge
  g.translate(x, y - out * 30); const s = lerp(1.7, 1, k) * (1 - out * .3); g.scale(s, s); g.globalAlpha = Math.min(1, k * 3) * (1 - out);
  rrect(g, -pw / 2 + 6, -ph / 2 + 7, pw, ph, ph / 2); g.fillStyle = C.ink; g.fill();
  rrect(g, -pw / 2, -ph / 2, pw, ph, ph / 2); g.fillStyle = o.fill ?? C.white; g.fill(); g.lineWidth = 6; g.strokeStyle = C.ink; g.stroke();
  g.fillStyle = o.col ?? C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, 3);
  g.restore();
}

// Corner truth label ("ILUSTRASI" for drawn stand-ins, "MENURUT LAPORAN MEDIA" for reported claims; the dot is drawn).
export function truthTag(g, text, a = 1, y = 140) {
  if (a <= .01) return;
  g.save(); g.globalAlpha = a; g.font = `800 30px ${C.font}`; const tw = g.measureText(text).width;
  rrect(g, 48, y - 26, tw + 76, 52, 26); g.fillStyle = 'rgba(27,24,23,.86)'; g.fill();
  g.fillStyle = C.orange; g.beginPath(); g.arc(78, y, 9, 0, 7); g.fill();
  g.fillStyle = C.white; g.textBaseline = 'middle'; g.fillText(text, 98, y + 1); g.restore();
}

// Red rubber stamp that crashes in from 3.2x over ~4 frames, rotated, with ink splatter.
export function stamp(g, t, t0, x, y, text, o = {}) {
  const k = prog(t, t0, t0 + .13, ease.in); if (t < t0) return;
  const s = lerp(3.2, 1, k), size = o.size ?? 92, col = o.col ?? C.red;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.14); g.scale(s, s); g.globalAlpha = Math.min(1, k * 2.5) * (o.a ?? 1);
  g.font = `900 ${size}px ${C.font}`; const tw = g.measureText(text).width, pw = tw + size * .8, ph = size * 1.45;
  g.strokeStyle = col; g.lineWidth = 12; rrect(g, -pw / 2, -ph / 2, pw, ph, 14); g.stroke();
  g.lineWidth = 4; rrect(g, -pw / 2 + 14, -ph / 2 + 14, pw - 28, ph - 28, 8); g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, 6);
  if (k >= 1) { const B = Math.floor(t0 * 30); // splatter specks, fixed per stamp
    for (let i = 0; i < 16; i++) { const a = hash(B + i) * 7, r = pw * .38 + hash(i + B * 2) * 40; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r * .45, 3 + hash(i * 3 + B) * 7, 0, 7); g.fill(); } }
  g.restore();
}

// Hands-up crowd counter: n tiny round heads in rows; raised arms appear as count passes them.
export function crowd(g, cx, cy, cols, rows, gap, raised, scale = 1) {
  g.save(); g.lineCap = 'round';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c, x = cx + (c - (cols - 1) / 2) * gap + (r % 2) * gap * .5, y = cy + r * gap * .78;
    const up = i < raised, hs = 13 * scale;
    g.fillStyle = r % 2 ? '#8E8A84' : '#6F6B66'; g.strokeStyle = C.ink; g.lineWidth = 3;
    g.beginPath(); g.roundRect(x - hs * 1.2, y + hs * .7, hs * 2.4, hs * 1.8, 6); g.fill(); g.stroke();
    g.fillStyle = C.white; g.beginPath(); g.arc(x, y, hs, 0, 7); g.fill(); g.stroke();
    if (up) { g.lineWidth = 3.5; g.beginPath(); g.moveTo(x + hs, y + hs); g.lineTo(x + hs * 1.6, y - hs * 1.6); g.stroke();
      g.fillStyle = C.white; g.beginPath(); g.arc(x + hs * 1.6, y - hs * 1.7, hs * .45, 0, 7); g.fill(); g.stroke(); }
  }
  g.restore();
}
