// Cast + props for "tikus_hanoi": rats, the French official (pejabat), the rat catcher (pemburu), city/sewer/farm props.
import { C, clamp, lerp, ease, prog, hash, blob, inkFill, wline, rrect, guy, boilText } from '../../vendor/toon.js';

export const RAT = '#8E8A97', RAT2 = '#B9B4C0', PINK = '#EFA3A3', TAIL = '#E58F8F';

// ---------- rat ----------
// o: {s, dir (1 right), run (phase, rad), tail (bool or 0..1 length), look, wink, eyes, stand (0..1 stands up), happy, sq}
export function rat(g, x, y, o = {}, seed = 1) {
  const s = o.s ?? 1, d = o.dir ?? 1, run = o.run ?? 0, st = o.stand ?? 0, sq = o.sq ?? 0;
  const bob = o.run != null ? Math.abs(Math.sin(run)) * -10 : 0;
  g.save(); g.translate(x, y + bob * s); g.scale(s * d * (1 + sq), s * (1 - sq)); g.rotate(-st * .9);
  // tail (behind)
  const tl = o.tail === false ? 0 : (o.tail === true || o.tail == null ? 1 : o.tail);
  if (tl > 0.02) {
    g.lineWidth = 7; g.strokeStyle = TAIL; g.lineCap = 'round';
    const w = Math.sin(run * .7 + seed) * 18;
    g.beginPath(); g.moveTo(-58, -30);
    g.bezierCurveTo(-58 - 60 * tl, -30 + 10, -58 - 70 * tl, -70 + w, -58 - 130 * tl, -60 - w * .6); g.stroke();
  } else if (o.tail === false) { // stump + bandage
    g.fillStyle = PINK; g.beginPath(); g.arc(-62, -32, 7, 0, 7); g.fill();
    g.save(); g.translate(-64, -34); g.rotate(.5); rrect(g, -12, -5, 24, 10, 3); inkFill(g, '#F6F1E7', 3); g.restore();
  }
  // legs
  g.lineWidth = 6; g.strokeStyle = C.ink;
  for (let i = 0; i < 4; i++) {
    const lx = [-34, -14, 18, 38][i], ph = run + (i % 2 ? Math.PI : 0), sw = o.run != null ? Math.sin(ph) * 14 : 0;
    g.beginPath(); g.moveTo(lx, -14); g.lineTo(lx + sw, 0); g.stroke();
  }
  // body
  blob(g, 0, -36, 62, 36, seed + 3, 22, 1.2); inkFill(g, RAT, 6);
  g.save(); g.beginPath(); g.ellipse(6, -22, 40, 15, 0, 0, 7); g.fillStyle = RAT2; g.globalAlpha = .7; g.fill(); g.restore();
  // head
  g.save(); g.translate(54, -52); g.rotate(o.look ?? 0);
  blob(g, -8, -18, 20, 20, seed + 5, 14, .8); inkFill(g, RAT2, 5);         // ear
  blob(g, 4, 0, 34, 27, seed + 4, 18, 1); inkFill(g, RAT, 6);
  g.beginPath(); g.moveTo(26, -10); g.quadraticCurveTo(52, 2, 30, 16); g.closePath(); inkFill(g, RAT, 5);
  g.fillStyle = PINK; g.beginPath(); g.arc(46, 4, 8, 0, 7); g.fill(); g.lineWidth = 3; g.strokeStyle = C.ink; g.stroke();
  g.fillStyle = C.ink;
  if (o.wink) { g.lineWidth = 5; g.beginPath(); g.moveTo(4, -4); g.lineTo(18, -9); g.lineTo(4, -14); g.stroke(); }
  else if (o.eyes === 'happy') { g.lineWidth = 5; g.beginPath(); g.arc(12, -4, 7, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  else { const r = o.eyes === 'wide' ? 8 : 5.5; g.beginPath(); g.arc(12, -6, r, 0, 7); g.fill(); }
  g.lineWidth = 2.5; for (const k of [-1, 1]) { g.beginPath(); g.moveTo(36, 8); g.lineTo(62, 8 + k * 10); g.stroke(); }
  if (o.happy) { g.lineWidth = 4; g.beginPath(); g.arc(28, 14, 8, .2, Math.PI - .2); g.stroke(); }
  g.restore();
  // arm when standing (waving)
  if (st > .3) { g.lineWidth = 6; g.beginPath(); g.moveTo(30, -50); g.lineTo(52 + Math.sin(o.wave ?? 0) * 10, -96); g.stroke(); g.fillStyle = PINK; g.beginPath(); g.arc(52 + Math.sin(o.wave ?? 0) * 10, -98, 7, 0, 7); g.fill(); }
  g.restore();
}
// loose tail prop (for piles, hand-held)
export function tailProp(g, x, y, r = 0, s = 1, seed = 0) {
  g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); g.lineCap = 'round';
  const w = (hash(seed) - .5) * 40;
  g.lineWidth = 11; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(30, -20 + w, 60, 20 - w, 100, w * .5); g.stroke();
  g.lineWidth = 6; g.strokeStyle = TAIL; g.stroke(); g.restore();
}

// ---------- head-space helper (same transform as guy()) ----------
function headSpace(g, st, fn) {
  const s = st.s ?? 1, sq = st.sq ?? 0;
  g.save(); g.translate(st.x, st.y); g.scale(s * (1 + sq), s * (1 - sq)); g.rotate(st.lean ?? 0);
  g.translate(0, -215); g.rotate(st.tilt ?? 0); g.translate(0, -118); fn(g); g.restore();
}
function bodySpace(g, st, fn) {
  const s = st.s ?? 1, sq = st.sq ?? 0;
  g.save(); g.translate(st.x, st.y); g.scale(s * (1 + sq), s * (1 - sq)); g.rotate(st.lean ?? 0); fn(g); g.restore();
}

// French colonial official: white uniform, gold buttons, kepi, curly moustache, round belly
export function pejabat(g, st, seed = 11) {
  guy(g, { ...st, shirt: '#F4F1EA', smile: st.smile ?? .5 }, seed);
  bodySpace(g, st, x => {
    x.fillStyle = C.gold; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(0, -185 + i * 30, 7, 0, 7); x.fill(); x.lineWidth = 3; x.strokeStyle = C.ink; x.stroke(); }
    x.fillStyle = '#26304F'; rrect(x, -72, -112, 144, 18, 4); x.fill(); // belt
    x.fillStyle = C.gold; for (const sx of [-60, 60]) { rrect(x, sx - 22, -212, 44, 14, 6); x.fill(); x.lineWidth = 3; x.strokeStyle = C.ink; x.stroke(); }  // epaulettes
  });
  headSpace(g, st, x => {
    // moustache
    x.save(); x.translate((st.lookX ?? 0) * 8, 28); x.fillStyle = C.ink;
    for (const k of [-1, 1]) { x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(k * 30, -16, k * 58, 2); x.quadraticCurveTo(k * 66, 8, k * 60, -8); x.quadraticCurveTo(k * 34, 10, 0, 10); x.closePath(); x.fill(); }
    x.restore();
    // kepi
    x.save(); x.translate(0, -88); x.rotate(-.06);
    x.beginPath(); x.moveTo(-82, 10); x.lineTo(-70, -78); x.lineTo(70, -84); x.lineTo(84, 10); x.closePath(); inkFill(x, '#D0342C', 7);
    x.beginPath(); x.rect(-84, -8, 168, 22); inkFill(x, '#26304F', 6);
    x.beginPath(); x.moveTo(-40, 14); x.quadraticCurveTo(40, 38, 110, 16); x.lineTo(84, 10); x.closePath(); inkFill(x, C.ink, 4);
    x.fillStyle = C.gold; x.beginPath(); x.arc(0, -40, 12, 0, 7); x.fill();
    x.restore();
  });
}
// Vietnamese rat catcher: brown work shirt, non la conical hat
export function pemburu(g, st, seed = 21) {
  guy(g, { ...st, shirt: '#A8784F' }, seed);
  headSpace(g, st, x => {
    x.save(); x.translate(0, -70); x.rotate(.04);
    x.beginPath(); x.moveTo(-190, 24); x.quadraticCurveTo(0, -150, 0, -150); x.quadraticCurveTo(0, -150, 190, 24); x.quadraticCurveTo(0, 46, -190, 24); x.closePath();
    inkFill(x, '#E9CF8E', 7);
    x.lineWidth = 3; x.strokeStyle = '#B99A55'; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(-190 * i / 4, 24 - 174 * (1 - i / 4) + 4); x.lineTo(190 * i / 4, 24 - 174 * (1 - i / 4) + 4); x.stroke(); }
    x.restore();
    x.lineWidth = 3; x.strokeStyle = C.ink; x.beginPath(); x.moveTo(-100, -40); x.quadraticCurveTo(-60, 90, 0, 98); x.quadraticCurveTo(60, 90, 100, -40); x.stroke(); // chin strap
  });
}

// ---------- props ----------
export function coin(g, x, y, r = 46, spin = 0, label = '1¢') {
  const sx = Math.max(.08, Math.abs(Math.cos(spin)));
  g.save(); g.translate(x, y); g.scale(sx, 1);
  blob(g, 0, 0, r, r, 900, 22, .8); inkFill(g, C.gold, 6);
  g.beginPath(); g.arc(0, 0, r * .72, 0, 7); g.lineWidth = 3; g.strokeStyle = '#B8892A'; g.stroke();
  if (sx > .4) { g.fillStyle = C.ink; g.font = `900 ${r * .8}px ${C.font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, 0, 3); }
  g.restore();
}
export function villa(g, x, y, w = 560, h = 520, seed = 0) { // French colonial villa (ochre, shutters)
  g.save(); g.translate(x, y);
  wline(g, [[-w / 2, 0], [-w / 2, -h], [w / 2, -h], [w / 2, 0]], seed); g.closePath(); inkFill(g, '#F2C978', 7);
  g.beginPath(); g.moveTo(-w / 2 - 40, -h); g.lineTo(0, -h - 150); g.lineTo(w / 2 + 40, -h); g.closePath(); inkFill(g, '#C8553D', 7);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const wx = -w / 2 + 70 + c * (w - 140) / 2 - 45, wy = -h + 70 + r * 210;
    rrect(g, wx, wy, 90, 130, 40); inkFill(g, '#FFE9B0', 5);
    g.fillStyle = '#3E7D6A'; g.fillRect(wx - 26, wy + 10, 22, 120); g.fillRect(wx + 94, wy + 10, 22, 120);
  }
  g.restore();
}
export function pipeH(g, x0, x1, y, r = 70, k = 1) { // horizontal sewer pipe drawn left->right by k
  const xe = lerp(x0, x1, k); if (k < .01) return;
  g.save(); rrect(g, x0, y - r, xe - x0, r * 2, r); inkFill(g, '#6F7C86', 8);
  g.beginPath(); rrect(g, x0 + 14, y - r + 14, xe - x0 - 28, r * 2 - 28, r - 14); g.fillStyle = '#2C3338'; g.fill();
  g.lineWidth = 5; g.strokeStyle = C.ink; for (let xx = x0 + 160; xx < xe - 40; xx += 200) { g.beginPath(); g.moveTo(xx, y - r); g.lineTo(xx, y + r); g.stroke(); }
  g.restore();
}
export function board(g, x, y, w, h, title, lines, o = {}) { // notice board / poster
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); const s = o.s ?? 1; g.scale(s, s); g.globalAlpha *= o.a ?? 1;
  rrect(g, -w / 2 + 14, -h / 2 + 16, w, h, 18); g.fillStyle = C.ink; g.fill();
  rrect(g, -w / 2, -h / 2, w, h, 18); inkFill(g, o.fill ?? '#FFF6DE', 8);
  g.fillStyle = o.titleCol ?? C.red; g.font = `900 ${o.ts ?? 64}px ${C.font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(title, 0, -h / 2 + (o.ts ?? 64) * .95);
  g.fillStyle = C.ink; lines.forEach((l, i) => { g.font = `900 ${l[1]}px ${C.font}`; g.fillStyle = l[2] || C.ink; g.fillText(l[0], 0, -h / 2 + l[3]); });
  g.restore();
}
export function stamp(g, x, y, text, k, s, col = C.red, rot = -.2, size = 96) {
  if (k <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = clamp(k * 3);
  g.font = `900 ${size}px ${C.font}`; const w = g.measureText(text).width + 70;
  rrect(g, -w / 2, -size * .78, w, size * 1.56, 18); g.lineWidth = 12; g.strokeStyle = col; g.stroke();
  boilText(g, text, 0, 6, size, col); g.restore();
}
export function barn(g, x, y, seed = 0) {
  g.save(); g.translate(x, y);
  wline(g, [[-300, 0], [-300, -380], [0, -560], [300, -380], [300, 0]], seed); g.closePath(); inkFill(g, '#B5523B', 8);
  g.beginPath(); g.rect(-110, -260, 220, 260); inkFill(g, '#7A3326', 7);
  g.lineWidth = 6; g.beginPath(); g.moveTo(-110, -260); g.lineTo(110, 0); g.moveTo(110, -260); g.lineTo(-110, 0); g.stroke();
  g.restore();
}
export function fence(g, x0, x1, y) {
  g.lineWidth = 6; g.strokeStyle = C.ink;
  for (let x = x0; x <= x1; x += 70) { rrect(g, x - 12, y - 130, 24, 130, 6); inkFill(g, '#E7D3A8', 5); }
  g.fillStyle = '#E7D3A8'; for (const yy of [y - 100, y - 45]) { rrect(g, x0 - 20, yy, x1 - x0 + 40, 18, 5); inkFill(g, '#E7D3A8', 5); }
}
export function desk(g, x, y, w = 420) {
  g.save(); g.translate(x, y);
  rrect(g, -w / 2, -170, w, 34, 8); inkFill(g, '#8A5A3B', 7);
  for (const sx of [-w / 2 + 30, w / 2 - 30]) { rrect(g, sx - 14, -140, 28, 140, 6); inkFill(g, '#7A4E33', 6); }
  g.restore();
}
export function scissors(g, x, y, open = 0, r = 0, s = 1) {
  g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s);
  for (const k of [-1, 1]) {
    g.save(); g.rotate(k * open * .45);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(110, k * 6); g.lineTo(0, k * 16); g.closePath(); inkFill(g, '#D9DEE3', 5);
    g.beginPath(); g.ellipse(-42, k * 22, 26, 18, 0, 0, 7); g.lineWidth = 10; g.strokeStyle = C.red; g.stroke(); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
    g.restore();
  }
  g.fillStyle = C.ink; g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); g.restore();
}
export function sack(g, x, y, fill = 0, seed = 0) {
  const h = 120 + fill * 90;
  g.save(); g.translate(x, y); blob(g, 0, -h / 2, 80 + fill * 25, h / 2, seed + 50, 22, 2); inkFill(g, '#CDB07A', 7);
  g.lineWidth = 6; g.beginPath(); g.moveTo(-30, -h + 10); g.lineTo(30, -h + 14); g.stroke(); g.restore();
}
