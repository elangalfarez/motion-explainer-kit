// Toon runtime: Canvas2D cartoon reels (Cyanide&Happiness-style rubber-hose characters, line boil,
// real "footage" cards, 2.5D camera with motion blur). Scene calls startToon({draw, overlay}).
export const W = 1080, H = 1920;
export const C = {
  paper: '#F6F1E7', paper2: '#EDE5D6', ink: '#1B1817', orange: '#FF7A3D', orange2: '#E8552A', lime: '#B9E36A',
  gold: '#F2C14E', red: '#E5372B', blue: '#2B35F5', grey: '#9A948C', white: '#FFFFFF', font: 'Outfit',
};
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = {
  lin: t => t,
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inOutExpo: t => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outElastic: t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1,
};
export const prog = (t, a, b, e = ease.inOut) => e(clamp((t - a) / Math.max(1e-6, b - a)));
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// damped spring response to a step at t0 (0 -> 1 with overshoot)
export const spring = (t, t0, f = 2.2, d = 5) => t < t0 ? 0 : 1 - Math.exp(-d * (t - t0)) * Math.cos(f * 2 * Math.PI * (t - t0));
export const wobble = (t, t0, amp = 1, f = 2.2, d = 4) => t < t0 ? 0 : amp * Math.exp(-d * (t - t0)) * Math.sin(f * 2 * Math.PI * (t - t0));

// ---------- words / voice ----------
let WORDS = [], DUR = 30, ENV = [], EFPS = 60, CHUNKS = [];
const clean = w => w.toLowerCase().replace(/[^\w°]/g, '');
export function T(word, n = 1) { let k = 0; for (const w of WORDS) if (clean(w.w) === clean(word) && ++k === n) return w.s; console.warn('word not found', word, n); return 0; }
export function E(word, n = 1) { let k = 0; for (const w of WORDS) if (clean(w.w) === clean(word) && ++k === n) return w.e; return 0; }
export const duration = () => DUR;
export function amp(t) { // smoothed voice loudness 0..1
  let s = 0, n = 0; for (let k = -2; k <= 2; k++) { const v = ENV[Math.round(t * EFPS) + k]; if (v != null) { s += v; n++; } }
  return n ? clamp(s / n) : 0;
}

// ---------- keyframe tracks ----------
// keys: [{t, ...numbers, e?}] -> object with interpolated numbers
export function track(keys, t) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1] || a;
  const k = b === a ? 0 : (b.e || ease.inOut)(clamp((t - a.t) / (b.t - a.t)));
  const o = {}; for (const key in a) if (typeof a[key] === 'number') o[key] = lerp(a[key], b[key] ?? a[key], k);
  return o;
}

// ---------- boil (hand-drawn line jitter at 12 fps) ----------
let BOIL = 0;
const bj = (i, amt = 1.6) => (hash(BOIL * 13.7 + i * 1.913) - .5) * 2 * amt;
export function blob(g, x, y, rx, ry, seed = 0, n = 28, amt = 1.6) {
  g.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2, j = bj(seed * 97 + (i % n), amt);
    const px = x + Math.cos(a) * (rx + j), py = y + Math.sin(a) * (ry + j);
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.closePath();
}
export function inkFill(g, fill, lw = 7) { if (fill) { g.fillStyle = fill; g.fill(); } g.lineWidth = lw; g.strokeStyle = C.ink; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
export function wline(g, pts, seed = 0, amt = 1.2) { // wobbly polyline
  g.beginPath(); pts.forEach((p, i) => { const x = p[0] + bj(seed * 31 + i * 2, amt), y = p[1] + bj(seed * 31 + i * 2 + 1, amt); i ? g.lineTo(x, y) : g.moveTo(x, y); });
}
export function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

// ---------- character rig ----------
// st: {x,y,s,sq (squash),tilt,lean,hlx,hly,hrx,hry (hand offsets from shoulders), eyes:'dot'|'happy'|'wide'|'shut',
//      blink, mouth 0..1, smile -1..1, lookX, lookY, brow 0|1 (worried)|-1 (angry), legL, legR (kick), hair, shirt, kind}
export function guy(g, st, seed = 1) {
  const s = st.s ?? 1, sq = st.sq ?? 0;
  g.save(); g.translate(st.x, st.y); g.scale(s * (1 + sq), s * (1 - sq)); g.rotate(st.lean ?? 0);
  // legs
  g.lineWidth = 9; g.strokeStyle = C.ink; g.lineCap = 'round';
  const lk = st.legL ?? 0, rk = st.legR ?? 0;
  wline(g, [[-28, -95], [-32 - lk * 30, -45 - lk * 10], [-34 - lk * 50, 0 - lk * 30]], seed + 1); g.stroke();
  wline(g, [[28, -95], [32 + rk * 30, -45 - rk * 10], [34 + rk * 50, 0 - rk * 30]], seed + 2); g.stroke();
  g.fillStyle = C.ink; blob(g, -42 - lk * 50, -4 - lk * 30, 22, 10, seed + 3, 14, .8); g.fill(); blob(g, 42 + rk * 50, -4 - rk * 30, 22, 10, seed + 4, 14, .8); g.fill();
  // body
  const shirt = st.shirt || C.orange;
  g.beginPath(); const bp = [[-62, -205], [62, -205], [72, -90], [-72, -90]];
  bp.forEach((p, i) => { const x = p[0] + bj(seed * 7 + i, 1.4), y = p[1] + bj(seed * 7 + i + 9, 1.4); i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.closePath(); inkFill(g, shirt, 7);
  if (st.kind === 'hermes') { // blue sash
    g.save(); g.clip(); g.fillStyle = C.blue; g.beginPath(); g.moveTo(-70, -210); g.lineTo(-30, -210); g.lineTo(75, -95); g.lineTo(35, -85); g.closePath(); g.fill(); g.restore();
  }
  if (st.kind === 'viktor') { // white collar + orange tie (an AI employee: "not a tool, a hire")
    g.beginPath(); g.moveTo(-34, -205); g.lineTo(0, -178); g.lineTo(34, -205); g.closePath(); inkFill(g, C.white, 5);
    g.beginPath(); g.moveTo(-11, -182); g.lineTo(11, -182); g.lineTo(17, -120); g.lineTo(0, -100); g.lineTo(-17, -120); g.closePath(); inkFill(g, C.orange, 5);
  }
  if (st.kind === 'elang') { g.fillStyle = C.ink; g.font = `900 34px ${C.font}`; g.textAlign = 'center'; g.fillText('A', 0, -135); }
  // arms (rubber hose)
  const arm = (sx, hx, hy, side, sd) => {
    const ex = sx + hx, ey = -195 + hy;
    const mx = (sx + ex) / 2, my = (-195 + ey) / 2, dx = ex - sx, dy = ey + 195;
    const bend = (st.bend ?? 0.28) * side;
    const cx = mx - dy * bend, cy = my + dx * bend;
    g.lineWidth = 9; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(sx, -195); g.quadraticCurveTo(cx + bj(sd, 2), cy + bj(sd + 1, 2), ex, ey); g.stroke();
    blob(g, ex, ey, 19, 19, sd + 5, 14, 1); inkFill(g, C.white, 6);
  };
  arm(-60, st.hlx ?? -30, st.hly ?? 95, -1, seed + 10);
  if (st.kind === 'hermes' && st.walker > 0) walker(g, st.walker, seed);
  arm(60, st.hrx ?? 30, st.hry ?? 95, 1, seed + 20);
  // head
  g.save(); g.translate(0, -215); g.rotate(st.tilt ?? 0); g.translate(0, -118);
  if (st.kind === 'hermes') { // beard
    g.fillStyle = '#E9E6E1';
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.15 + i * 0.7 / 6); blob(g, Math.cos(a) * 85, 30 + Math.sin(a) * 85, 40, 40, seed + 40 + i, 16, 1.2); inkFill(g, '#ECE9E4', 6); }
  }
  blob(g, 0, 0, 120, 118, seed + 30, 34, 1.8); inkFill(g, C.white, 8);
  if (st.kind === 'elang') hairElang(g, seed);
  if (st.kind === 'viktor') hairViktor(g, seed);
  if (st.kind === 'hermes') helmet(g, seed, st.wing ?? 0);
  // eyes
  const lx = (st.lookX ?? 0) * 14, ly = (st.lookY ?? 0) * 10, bl = st.blink ?? 1, eyes = st.eyes || 'dot';
  g.fillStyle = C.ink; g.strokeStyle = C.ink; g.lineWidth = 8; g.lineCap = 'round';
  for (const sx of [-40, 40]) {
    if (st.wink && sx > 0) { g.beginPath(); g.moveTo(sx - 16 + lx, -6 + ly); g.lineTo(sx + 14 + lx, -14 + ly); g.lineTo(sx - 16 + lx, -20 + ly); g.stroke(); continue; }
    if (eyes === 'happy') { g.beginPath(); g.arc(sx + lx, -8 + ly, 16, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else if (eyes === 'shut') { g.beginPath(); g.moveTo(sx - 16 + lx, -10 + ly); g.lineTo(sx + 16 + lx, -10 + ly); g.stroke(); }
    else { const r = eyes === 'wide' ? 15 : 10; g.save(); g.translate(sx + lx, -10 + ly); g.scale(1, Math.max(.08, bl)); g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.restore(); }
  }
  if (st.brow) { g.lineWidth = 7; for (const sx of [-40, 40]) { g.beginPath(); const d = st.brow * Math.sign(sx); g.moveTo(sx - 20 + lx, -42 + d * 8 + ly); g.lineTo(sx + 20 + lx, -42 - d * 8 + ly); g.stroke(); } }
  // mouth
  const m = clamp(st.mouth ?? 0), sm = st.smile ?? 0.6;
  if (m > 0.08) {
    g.beginPath(); g.ellipse(lx * .6, 48 + ly * .5, 22 + m * 10, 6 + m * 26, 0, 0, 7); g.fillStyle = C.ink; g.fill();
    g.save(); g.clip(); g.fillStyle = '#E8604A'; g.beginPath(); g.ellipse(lx * .6, 48 + ly * .5 + 6 + m * 22, 18, 12, 0, 0, 7); g.fill(); g.restore();
  } else { g.lineWidth = 7; g.beginPath(); g.moveTo(-26 + lx * .6, 46 - sm * 4); g.quadraticCurveTo(lx * .6, 46 + sm * 18, 26 + lx * .6, 46 - sm * 4); g.stroke(); }
  g.restore();
  g.restore();
}
function hairViktor(g, seed) { // neat side part
  g.beginPath(); const pts = [[-116, -20], [-118, -70], [-92, -112], [-40, -138], [20, -140], [70, -128], [106, -96], [119, -45], [116, -18], [96, -52], [60, -78], [-30, -86], [-36, -60], [-70, -60], [-96, -40]];
  pts.forEach((p, i) => { const x = p[0] + bj(seed * 5 + i, 1.2), y = p[1] + bj(seed * 5 + i + 40, 1.2); i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.closePath(); g.fillStyle = '#3A2E28'; g.fill(); g.lineWidth = 6; g.strokeStyle = C.ink; g.stroke();
}
function hairElang(g, seed) {
  g.beginPath(); const pts = [[-112, -30], [-120, -70], [-95, -105], [-70, -128], [-40, -150], [-20, -128], [5, -160], [25, -132], [55, -152], [70, -120], [100, -110], [118, -60], [114, -30], [80, -62], [40, -78], [0, -70], [-50, -78], [-90, -55]];
  pts.forEach((p, i) => { const x = p[0] + bj(seed * 3 + i, 1.5), y = p[1] + bj(seed * 3 + i + 40, 1.5); i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.closePath(); g.fillStyle = C.ink; g.fill();
}
function helmet(g, seed, wing) {
  blob(g, 0, -78, 112, 62, seed + 70, 26, 1.2); g.save(); g.beginPath(); g.rect(-130, -160, 260, 92); g.clip(); blob(g, 0, -78, 112, 62, seed + 70, 26, 1.2); inkFill(g, C.gold, 7); g.restore();
  g.lineWidth = 7; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(-112, -70); g.lineTo(112, -70); g.stroke();
  for (const sd of [-1, 1]) { // little wings
    g.save(); g.translate(sd * 112, -95); g.scale(sd, 1); g.rotate(-0.35 - wing * 0.5);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(40, -70, 90, -60); g.quadraticCurveTo(70, -40, 80, -30); g.quadraticCurveTo(55, -20, 60, -6); g.quadraticCurveTo(30, 0, 0, 10); g.closePath();
    inkFill(g, C.white, 6); g.restore();
  }
}
function walker(g, k, seed) {
  g.save(); g.globalAlpha *= clamp(k); g.translate(0, (1 - k) * 60);
  g.lineWidth = 10; g.strokeStyle = '#8B8F96'; g.lineCap = 'round';
  wline(g, [[60, -140], [150, -140]], seed + 50); g.stroke(); wline(g, [[150, -140], [175, 0]], seed + 51); g.stroke(); wline(g, [[95, -140], [110, 0]], seed + 52); g.stroke();
  g.fillStyle = '#C9CDD3'; for (const x of [110, 175]) { blob(g, x, 4, 16, 10, seed + x, 12, .6); inkFill(g, '#D9DCE0', 5); }
  g.restore();
}

// ---------- footage card (real screenshot in a browser frame) ----------
export function card(g, img, o) { // o: {x,y,w,rot,scroll(px in img space),url,alpha,s, h}
  if (!o.alpha || o.alpha <= 0.003) return;
  const w = o.w, ih = o.h ?? w * 0.625, bar = 58;
  g.save(); g.globalAlpha *= clamp(o.alpha); g.translate(o.x, o.y); g.rotate(o.rot || 0); const s = o.s ?? 1; g.scale(s, s);
  const x = -w / 2, y = -(ih + bar) / 2;
  rrect(g, x + 16, y + 18, w, ih + bar, 26); g.fillStyle = C.ink; g.fill(); // hard cartoon shadow
  rrect(g, x, y, w, ih + bar, 26); g.fillStyle = C.white; g.fill();
  g.save(); rrect(g, x, y + bar, w, ih, [0, 0, 26, 26]); g.clip();
  const sc = w / img.width; g.drawImage(img, 0, o.scroll || 0, img.width, ih / sc, x, y + bar, w, ih);
  if (o.tint) { g.globalCompositeOperation = 'color'; g.fillStyle = `rgba(150,110,60,${o.tint})`; g.fillRect(x, y + bar, w, ih); g.globalCompositeOperation = 'source-over'; }
  g.restore();
  for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x + 34 + i * 30, y + bar / 2, 9, 0, 7); g.fillStyle = [C.red, C.gold, C.lime][i]; g.fill(); }
  if (o.url) { g.font = `700 24px ${C.font}`; const tw = g.measureText(o.url).width; rrect(g, x + 140, y + 12, Math.min(w - 170, tw + 40), 34, 17); g.fillStyle = C.paper2; g.fill(); g.fillStyle = '#5C564F'; g.textBaseline = 'middle'; g.fillText(o.url, x + 160, y + 30); }
  rrect(g, x, y, w, ih + bar, 26); g.lineWidth = 8; g.strokeStyle = C.ink; g.stroke();
  g.restore();
}

// ---------- text ----------
export function boilText(g, text, x, y, size, fill = C.ink, o = {}) {
  g.save(); g.font = `900 ${size}px ${C.font}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  g.translate(x + bj(301, 1.2), y + bj(302, 1.2)); g.rotate((o.rot || 0) + bj(303, .006));
  if (o.stroke) { g.lineWidth = o.stroke; g.strokeStyle = o.strokeColor || C.ink; g.lineJoin = 'round'; g.strokeText(text, 0, 0); }
  g.fillStyle = fill; g.fillText(text, 0, 0); g.restore();
}
// per-letter pop-in headline (screen space). parts: [[text,color],...]
export function popLine(g, t, t0, parts, y, size, o = {}) {
  g.save(); g.font = `900 ${size}px ${C.font}`; g.textBaseline = 'middle';
  const all = parts.map(p => p[0]).join(''); const total = g.measureText(all).width; let x = (o.x ?? W / 2) - total / 2, idx = 0;
  const out = o.t1 != null ? prog(t, o.t1, o.t1 + .25, ease.in) : 0;
  for (const [txt, col] of parts) for (const ch of txt) {
    const cw = g.measureText(ch).width, k = prog(t, t0 + idx * (o.stagger ?? .025), t0 + idx * (o.stagger ?? .025) + .32, ease.outBack);
    if (k > .002 && out < .999) {
      g.save(); g.translate(x + cw / 2 + bj(500 + idx, 1), y + (1 - k) * 40 - out * 60 + bj(600 + idx, 1)); g.scale(k * (1 - out), k * (1 - out)); g.rotate((1 - k) * .3);
      g.lineWidth = o.stroke ?? 16; g.strokeStyle = o.strokeColor ?? C.ink; g.lineJoin = 'round'; if (g.lineWidth) g.strokeText(ch, -cw / 2, 0);
      g.fillStyle = col; g.fillText(ch, -cw / 2, 0); g.restore();
    }
    x += cw; idx++;
  }
  g.restore();
}

// ---------- captions ----------
function buildChunks() {
  CHUNKS = []; let cur = [];
  WORDS.forEach((w, i) => { cur.push(w); const n = WORDS[i + 1];
    if (!n || n.p !== w.p || /[,.!?:]$/.test(w.w) || cur.length >= 3 || n.s - w.e > .35) { CHUNKS.push(cur); cur = []; } });
}
export function captions(g, t, o = {}) {
  const y = o.y ?? 1700, size = o.size ?? 66; let c = null;
  for (let i = 0; i < CHUNKS.length; i++) { const s = CHUNKS[i][0].s - .08, e = CHUNKS[i + 1] ? CHUNKS[i + 1][0].s - .08 : CHUNKS[i].at(-1).e + .6;
    if (t >= s && t < Math.min(e, CHUNKS[i].at(-1).e + .9)) { c = CHUNKS[i]; break; } }
  if (!c) return;
  g.save(); g.font = `900 ${size}px ${C.font}`; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const sp = size * .3, ws = c.map(w => g.measureText(w.w).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1);
  const pop = prog(t, c[0].s - .08, c[0].s + .12, ease.outBack);
  g.translate(W / 2, y); g.scale(.85 + .15 * pop, .85 + .15 * pop); g.translate(-W / 2, -y);
  let x = W / 2 - tw / 2;
  c.forEach((w, i) => { const act = t >= w.s - .03 && t < w.e + .05, on = t >= w.s - .03;
    g.save(); g.translate(x + ws[i] / 2, y); if (act) { g.rotate(-.03); g.scale(1.08, 1.08); }
    g.lineWidth = 16; g.strokeStyle = C.ink; g.strokeText(w.w, -ws[i] / 2, 0);
    g.fillStyle = act ? C.orange : (on ? C.white : 'rgba(255,255,255,.55)'); g.fillText(w.w, -ws[i] / 2, 0); g.restore();
    x += ws[i] + sp; });
  g.restore();
}

// ---------- runtime ----------
export function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
export async function startToon({ build, draw, overlay, blurSamples = 5, shutter = 0.5 }) {
  for (const w of [900, 800, 700]) await document.fonts.load(`${w} 60px ${C.font}`);
  const data = window.WORDS_DATA; WORDS = data.words; DUR = data.duration; buildChunks();
  try { const e = await (await fetch('./env.json')).json(); ENV = e.env; EFPS = e.fps; } catch (e) { console.warn('no env.json'); }
  const ctx = {}; if (build) await build(ctx);
  const out = document.createElement('canvas'); out.width = W; out.height = H; const g = out.getContext('2d');
  const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tg = tmp.getContext('2d');
  document.body.appendChild(out);
  window.renderFrame = (t, type = 'image/jpeg') => {
    const n = blurSamples;
    g.globalAlpha = 1; g.clearRect(0, 0, W, H);
    for (let i = 0; i < n; i++) {
      const ts = n > 1 ? t + (i / (n - 1) - .5) * shutter / 30 : t;
      BOIL = Math.floor(t * 12);
      tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalAlpha = 1; tg.fillStyle = C.paper; tg.fillRect(0, 0, W, H);
      draw(tg, ts, ctx);
      g.globalAlpha = 1 / (i + 1); g.drawImage(tmp, 0, 0);
    }
    g.globalAlpha = 1; BOIL = Math.floor(t * 12); overlay(g, t, ctx);
    return out.toDataURL(type, 0.93);
  };
  window.REEL_READY = true;
}
