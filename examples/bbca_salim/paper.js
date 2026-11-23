// paper.js — "paper-cut ukiyo-e" cutout engine (original code, MIT-style use).
// Every object is a sheet of washi: flat pigment blocks (slightly out of register), a sumi key line,
// a cream cut edge, a soft drop shadow on the layer behind, washi grain + goma-zuri specks.
import * as THREE from '../../vendor/three.module.js';

export const PAL = {
  paper: '#efe3c8', paperD: '#e0cfa9', edge: '#f7efdc', sumi: '#211d1b', sumiL: '#4a4540',
  prus: '#1f3d68', prusD: '#142a4b', prusL: '#5a7aa3', ai: '#2f5079', sky: '#93b3c6',
  beni: '#c0412f', beniD: '#93281d', beniL: '#e59b80', ochre: '#d39c43', ochreL: '#e8c27a', gold: '#e2a93b',
  green: '#7f9a4c', greenD: '#4b6a3a', pine: '#3b5638', skin: '#efd7b0', wood: '#8a6646', woodD: '#5b412b', woodL: '#b48e62',
  plaster: '#e4d6b4', grey: '#8d8b80', greyD: '#5d5c56', white: '#f8f1df', oil: '#e0a637', noodle: '#f0d48a',
};
export const FONT = '"Shippori", serif';
export const PPU = 150;                       // canvas px per world unit
const PAD = 34;                               // px padding for edge + shadow
export const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h)); return c; };
export const rnd = s => { let a = s >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

let WASHI = null, SPECK = null;
export function initPaper() {
  // washi: value-noise mottling + long fibres
  const n = 512, c = mk(n, n), x = c.getContext('2d'), id = x.createImageData(n, n), R = rnd(7);
  const g = 34, grid = new Float32Array((g + 1) * (g + 1)).map(() => R());
  for (let yy = 0; yy < n; yy++) for (let xx = 0; xx < n; xx++) {
    const fx = xx / n * g, fy = yy / n * g, ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy;
    const a = grid[iy * (g + 1) + ix], b = grid[iy * (g + 1) + ix + 1], cc = grid[(iy + 1) * (g + 1) + ix], d = grid[(iy + 1) * (g + 1) + ix + 1];
    const v = (a + (b - a) * tx) * (1 - ty) + (cc + (d - cc) * tx) * ty, j = (R() - .5) * .25, k = (yy * n + xx) * 4;
    const m = 205 + (v + j) * 50; id.data[k] = m; id.data[k + 1] = m * .97; id.data[k + 2] = m * .9; id.data[k + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  x.lineCap = 'round';
  for (let i = 0; i < 900; i++) { x.strokeStyle = R() > .4 ? 'rgba(255,250,235,.35)' : 'rgba(120,95,60,.18)'; x.lineWidth = .6 + R() * .9;
    const X = R() * n, Y = R() * n, a = R() * 6.3, L = 6 + R() * 26; x.beginPath(); x.moveTo(X, Y); x.quadraticCurveTo(X + Math.cos(a + .5) * L * .5, Y + Math.sin(a + .5) * L * .5, X + Math.cos(a) * L, Y + Math.sin(a) * L); x.stroke(); }
  WASHI = c;
  const s = mk(n, n), sx = s.getContext('2d'), R2 = rnd(9);
  for (let i = 0; i < 2600; i++) { sx.fillStyle = `rgba(0,0,0,${.3 + R2() * .6})`; sx.fillRect(R2() * n, R2() * n, 1 + R2() * 1.6, 1 + R2() * 1.6); }
  SPECK = s;
}
export const washi = () => WASHI;

// ---- drawing helpers used inside cut() draw functions (pixel space) ----
// shape(g, path, fill, lw): pigment block shifted (misregistration) + sumi key line on top
export function shape(g, path, fill, lw = 5, o = {}) {
  if (fill) { g.save(); g.translate(o.mx ?? 2.2, o.my ?? -1.6); g.beginPath(); path(g); g.fillStyle = fill; g.fill(o.rule || 'nonzero'); g.restore(); }
  if (lw) { g.beginPath(); path(g); g.lineWidth = lw; g.strokeStyle = o.ink || PAL.sumi; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
}
export const rr = (x, y, w, h, r) => g => g.roundRect(x, y, w, h, r);
export const poly = pts => g => { pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
export const ell = (x, y, rx, ry) => g => g.ellipse(x, y, rx, ry, 0, 0, 7);
// bokashi: vertical wiped gradient inside current clip
export function bokashi(g, x, y, w, h, c1, c2, seed = 1) {
  const R = rnd(seed);
  for (let i = 0; i < w; i += 6) { const off = Math.sin(i * .013 + seed) * 10 + (R() - .5) * 4; const gr = g.createLinearGradient(0, y + off, 0, y + h + off);
    gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(x + i, y, 7, h); }
}
export function text(g, s, x, y, size, col = PAL.sumi, o = {}) {
  g.save(); g.font = `${o.w || 800} ${size}px ${FONT}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.fillStyle = col;
  if (o.ls) g.letterSpacing = o.ls + 'px';
  g.fillText(s, x, y); g.restore();
}

// ---- the cutout itself ----
// wu,hu: world size of the drawable area. draw(g, w, h) in px. Anchor: bottom-centre (o.anchor='center' for middle).
export function cut(wu, hu, draw, o = {}) {
  const w = Math.round(wu * PPU), h = Math.round(hu * PPU), cw = w + PAD * 2, ch = h + PAD * 2;
  const S = mk(cw, ch), sg = S.getContext('2d'); sg.translate(PAD, PAD); draw(sg, w, h);
  // pigment texture: washi multiply + specks knocked out
  if (o.tex !== false) {
    sg.setTransform(1, 0, 0, 1, 0, 0);
    sg.globalCompositeOperation = 'multiply'; sg.globalAlpha = .55; sg.fillStyle = sg.createPattern(WASHI, 'repeat'); sg.fillRect(0, 0, cw, ch);
    sg.globalCompositeOperation = 'destination-in'; sg.globalAlpha = 1; // restore original alpha (multiply over transparent added colour)
    const A = mk(cw, ch), ag = A.getContext('2d'); ag.translate(PAD, PAD); draw(ag, w, h); sg.drawImage(A, 0, 0);
    sg.globalCompositeOperation = 'destination-out'; sg.globalAlpha = .18; sg.drawImage(SPECK, (o.seed || 0) % 200, 0); sg.drawImage(SPECK, 0, 0, SPECK.width, SPECK.height, 512, 0, 512, 512);
    sg.globalCompositeOperation = 'source-over'; sg.globalAlpha = 1;
  }
  const out = mk(cw, ch), g = out.getContext('2d');
  if (o.edge !== false) {
    const e = o.edgeW ?? 7, E = mk(cw, ch), eg = E.getContext('2d');
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; eg.drawImage(S, Math.cos(a) * e, Math.sin(a) * e); }
    eg.globalCompositeOperation = 'source-in'; eg.fillStyle = o.edgeCol || PAL.edge; eg.fillRect(0, 0, cw, ch);
    if (o.shadow !== false) { g.save(); g.filter = 'blur(9px)'; g.globalAlpha = o.shadowA ?? .42; g.drawImage(E, 9, 12); g.restore();
      g.save(); g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgb(40,26,14)'; g.fillRect(0, 0, cw, ch); g.restore(); }
    g.drawImage(E, 0, 0);
  }
  g.drawImage(S, 0, 0);
  const tex = new THREE.CanvasTexture(out); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.generateMipmaps = true;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: o.fog !== false, side: THREE.DoubleSide, toneMapped: false });
  const gw = cw / PPU, gh = ch / PPU, geo = new THREE.PlaneGeometry(gw, gh);
  if (o.anchor === 'center') { /* centred */ } else geo.translate(0, gh / 2 - PAD / PPU, 0); // bottom of drawable area at y=0
  const m = new THREE.Mesh(geo, mat); m.userData.canvas = out; return m;
}
// pivot wrapper (rotate around a point); returns group with child mesh
export function pivot(mesh) { const g = new THREE.Group(); g.add(mesh); return g; }

// ---- characters (front-facing paper puppets) ----
// o: {coat, hat, glasses, kind:'man'|'woman'|'child', mouth, eyes:'open'|'shut', arms:'down'|'up'|'cheer'|'work'}
export function person(o = {}) {
  const kind = o.kind || 'man', wu = kind === 'child' ? .55 : .8, hu = kind === 'child' ? 1.0 : 1.75;
  return cut(wu, hu, (g, w, h) => {
    const cx = w / 2, coat = o.coat || PAL.prus, head = kind === 'child' ? w * .34 : w * .25, hy = head + 6;
    // legs
    if (kind !== 'woman') { shape(g, rr(cx - w * .2, h * .74, w * .14, h * .26, 6), PAL.sumiL, 4); shape(g, rr(cx + w * .06, h * .74, w * .14, h * .26, 6), PAL.sumiL, 4); }
    // body / kimono
    const top = hy + head * .95, bot = kind === 'woman' ? h - 4 : h * .8;
    shape(g, poly([[cx - w * .22, top], [cx + w * .22, top], [cx + w * .36, bot], [cx - w * .36, bot]]), coat, 5);
    if (kind === 'woman') { shape(g, rr(cx - w * .36, h * .5, w * .72, h * .07, 3), o.obi || PAL.beni, 4); shape(g, poly([[cx - w * .14, top], [cx, top + h * .16], [cx + w * .14, top]]), PAL.white, 3); }
    else { shape(g, poly([[cx - w * .09, top], [cx, top + h * .18], [cx + w * .09, top]]), PAL.white, 3); if (kind === 'man') shape(g, poly([[cx - 6, top + 8], [cx + 6, top + 8], [cx + 4, top + h * .15], [cx - 4, top + h * .15]]), o.tie || PAL.beni, 2); }
    // arms
    const arm = (sx, up) => { g.save(); g.translate(cx + sx * w * .2, top + 14); g.rotate(sx * (up === 'up' ? -2.5 : up === 'cheer' ? -2.2 : up === 'work' ? -.9 : .22));
      shape(g, rr(-w * .07, 0, w * .14, h * .3, 10), coat, 4); shape(g, ell(0, h * .31, w * .065, w * .065), PAL.skin, 3); g.restore(); };
    arm(-1, o.arms); arm(1, o.armR || o.arms);
    // head
    shape(g, ell(cx, hy, head * .92, head), PAL.skin, 5);
    if (kind === 'woman') { shape(g, g2 => { g2.ellipse(cx, hy - head * .35, head * 1.02, head * .72, 0, Math.PI, 0); g2.ellipse(cx, hy - head * 1.15, head * .5, head * .38, 0, 0, 7); }, PAL.sumi, 4); }
    else shape(g, g2 => { g2.ellipse(cx, hy - head * .25, head * .96, head * .8, 0, Math.PI * 1.03, -Math.PI * .03); }, PAL.sumi, 4);
    if (o.hat) { shape(g, rr(cx - head * 1.35, hy - head * .82, head * 2.7, head * .26, 8), PAL.sumi, 4); shape(g, rr(cx - head * .85, hy - head * 1.6, head * 1.7, head * .85, 14), PAL.sumiL, 4); shape(g, rr(cx - head * .85, hy - head * 1.0, head * 1.7, head * .16, 3), PAL.beni, 2); }
    if (o.peci) { shape(g, rr(cx - head * .95, hy - head * 1.25, head * 1.9, head * .62, 6), PAL.sumi, 4); }
    // face: few strokes
    g.strokeStyle = PAL.sumi; g.lineWidth = 4; g.lineCap = 'round';
    if (o.eyes === 'shut') { g.beginPath(); g.arc(cx - head * .36, hy + head * .08, head * .14, .2, Math.PI - .2); g.stroke(); g.beginPath(); g.arc(cx + head * .36, hy + head * .08, head * .14, .2, Math.PI - .2); g.stroke(); }
    else { g.fillStyle = PAL.sumi; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * head * .36, hy + head * .1, head * .08, head * .11, 0, 0, 7); g.fill(); } }
    if (o.glasses) { g.lineWidth = 3.5; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * head * .36, hy + head * .1, head * .24, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(cx - head * .12, hy + head * .08); g.lineTo(cx + head * .12, hy + head * .08); g.stroke(); }
    g.lineWidth = 4; g.beginPath();
    if (o.mouth === 'sad') g.arc(cx, hy + head * .68, head * .2, Math.PI + .5, -.5); else if (o.mouth === 'open') { g.ellipse(cx, hy + head * .55, head * .14, head * .18, 0, 0, 7); g.fillStyle = PAL.beniD; g.fill(); } else if (o.mouth === 'smile') g.arc(cx, hy + head * .4, head * .22, .4, Math.PI - .4); else { g.moveTo(cx - head * .14, hy + head * .55); g.lineTo(cx + head * .14, hy + head * .55); }
    g.stroke();
    if (o.cheek !== false) { g.fillStyle = 'rgba(205,90,70,.28)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * head * .58, hy + head * .42, head * .13, head * .08, 0, 0, 7); g.fill(); } }
    if (o.sil) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(28,24,22,.93)'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }
  }, { seed: o.seed || 3 });
}

// seal: red hanko with chipped edge + cream characters (lines array)
export function seal(lines, o = {}) {
  const wu = o.w || 1.2, hu = o.h || 1.2;
  return cut(wu, hu, (g, w, h) => {
    const R = rnd(o.seed || 5);
    g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 10); g.fillStyle = o.col || PAL.beni; g.fill();
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 40; i++) { const side = i % 4, p = R(); const x = side < 2 ? p * w : (side === 2 ? 4 : w - 4), y = side >= 2 ? p * h : (side === 0 ? 4 : h - 4); g.beginPath(); g.arc(x, y, 2 + R() * 7, 0, 7); g.fill(); }
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = PAL.white; g.lineWidth = 6; g.strokeRect(18, 18, w - 36, h - 36);
    const n = lines.length, sz = o.size || Math.min((h - 44) / n * .88, (w - 60) / Math.max(...lines.map(l => l.length)) * 1.3);
    lines.forEach((l, i) => text(g, l, w / 2, h / 2 + (i - (n - 1) / 2) * sz * 1.02, sz, PAL.white, { w: 800 }));
    g.globalCompositeOperation = 'destination-out'; g.globalAlpha = .35; g.drawImage(SPECK, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }, { tex: false, edgeW: 5, ...o });
}
// wooden board / plate with carved words
export function board(lines, o = {}) {
  const wu = o.w || 2.4, hu = o.h || .8, post = o.post || 0;
  return cut(wu, hu + post, (g, w, h) => {
    const bh = hu * PPU;
    if (post) { shape(g, rr(w * .2 - 8, bh - 10, 16, h - bh + 10, 3), PAL.woodD, 4); shape(g, rr(w * .8 - 8, bh - 10, 16, h - bh + 10, 3), PAL.woodD, 4); }
    shape(g, rr(4, 4, w - 8, bh - 8, 8), o.bg || PAL.wood, 5);
    g.strokeStyle = 'rgba(40,25,10,.25)'; g.lineWidth = 2; for (let y = 16; y < bh - 10; y += 11) { g.beginPath(); g.moveTo(14, y); g.bezierCurveTo(w * .3, y + 4, w * .6, y - 4, w - 14, y + 1); g.stroke(); }
    const n = lines.length, sz = o.size || (bh - 40) / n * .82;
    lines.forEach((l, i) => { const y = bh / 2 + (i - (n - 1) / 2) * sz * 1.08;
      const [txt, col] = Array.isArray(l) ? l : [l, o.fg || PAL.white]; text(g, txt, w / 2 + 2, y + 3, sz, 'rgba(30,18,8,.6)'); text(g, txt, w / 2, y, sz, col); });
  }, { seed: o.seed || 11, ...o });
}
// vertical title cartouche (tanzaku)
export function cartouche(main, sub, o = {}) {
  const wu = o.w || .9, hu = o.h || 3.2;
  return cut(wu, hu, (g, w, h) => {
    shape(g, rr(4, 4, w - 8, h - 8, 4), PAL.white, 5); g.strokeStyle = PAL.sumi; g.lineWidth = 2.5; g.strokeRect(16, 16, w - 32, h - 32);
    const n = [...main].length, sz = Math.min((h - 60 - (sub ? 90 : 0)) / n * .9, w * .62);
    [...main].forEach((c, i) => text(g, c, w / 2, 40 + sz * .55 + i * sz * 1.02, sz, PAL.sumi, { w: 800 }));
    if (sub) { g.save(); g.translate(w / 2, h - 52); text(g, sub, 0, 0, 30, PAL.beni, { w: 800 }); g.restore(); }
  }, { seed: 17, ...o });
}
