// bbca_salim — "Bank ini pernah diambil alih negara": one unbroken camera through a paper-cut ukiyo-e world.
import * as THREE from '../../vendor/three.module.js';
import { W, H, clamp, lerp, ease, prog, hash, startToon, T, E } from '../../vendor/toon.js';
import { PAL, FONT, initPaper, cut, person, seal, board, cartouche, washi, rnd, text as ptext } from './paper.js';
import * as P from './world.js';

let R, S, CAM, CV; const U = []; // per-frame updaters
const add = (m, x, y, z, s = 1) => { m.position.set(x, y, z); m.scale.setScalar(s); S.add(m); return m; };
const lerp3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const v3 = a => new THREE.Vector3(...a);
const outB = ease.outBack, outE = ease.outExpo;
// appear helpers ------------------------------------------------------------
function pop(m, t0, o = {}) { const base = m.scale.x, p0 = m.position.clone();
  U.push(t => { const k = prog(t, t0, t0 + (o.d || .35), outB), out = o.t1 ? prog(t, o.t1, o.t1 + .3, ease.in) : 0;
    const s = Math.max(.0001, base * k * (1 - out)); m.scale.set(s, s, s); m.visible = k > .002 && out < .999; m.position.copy(p0); m.position.y += (o.bob ? Math.sin(t * 2 + p0.x) * .04 : 0); }); return m; }
function stamp(m, t0, o = {}) { const base = m.scale.x;
  U.push(t => { const k = prog(t, t0, t0 + .2, outE), out = o.t1 ? prog(t, o.t1, o.t1 + .25, ease.in) : 0;
    const s = Math.max(.0001, base * lerp(2.4, 1, k) * (1 - out)); m.scale.set(s, s, s); m.visible = t >= t0 && out < .999; m.material.opacity = Math.min(1, k * 3) * (1 - out); m.rotation.z = (o.rot ?? -.08) * (1 - k * .3); });
  SHAKES.push(t0 + .17); return m; }
function drop(m, t0, o = {}) { const y1 = m.position.y;
  U.push(t => { m.visible = t >= t0; const k = t - t0; if (k < 0) return; const s = clamp(k / .28); const fall = 1 - ease.in(s);
    m.position.y = y1 + fall * (o.h || 3) + (s >= 1 ? Math.exp(-7 * (k - .28)) * Math.sin((k - .28) * 22) * .08 : 0); m.rotation.z = (o.rz || .06) * Math.exp(-4 * k) * Math.sin(k * 14); });
  SHAKES.push(t0 + .28); return m; }
const SHAKES = [];
const sway = (m, a = .03, f = 1.3, ph = 0) => U.push(t => { m.rotation.z = Math.sin(t * f + ph) * a; });


const K = {}; // key times
function times() {
  const need = (w, n = 1) => { const v = T(w, n); if (!v && !(w === 'bank' && n === 1)) throw new Error('missing word ' + w + ' ' + n); return v; };
  Object.assign(K, {
    negara: need('negara'), skrg: need('sekarang'), rebut: need('rebutan'), bca: need('bca'), milik: need('milik'), liem: need('liem'), sahabat: need('sahabat'), soe: need('soeharto'),
    mei: need('mei'), y98: need('1998'), soe2: need('soeharto', 2), jatuh: need('jatuh'), rumah: need('rumah'), dibakar: need('dibakar'), ratusan: need('ratusan'),
    nasabah: need('nasabah'), panik: need('panik'), t16: need('16triliun'), ditarik: need('ditarik'), bi: need('bi'), nyuntik: need('nyuntik'), t32: need('32triliun'), tetap: need('tetap'), cukup: need('cukup'),
    d28: need('28'), negara2: need('negara', 2), ambil: need('ambil'), kel: need('keluarga'), kehilangan: need('kehilangan'),
    y02: need('2002'), p51: need('51persen'), lelang: need('dilelang'), stan: need('standard'), tinggi: need('tinggi'),
    tapi: need('tapi'), menang: need('menang'), farallon: need('farallon'), djarum: need('djarum'), raja: need('raja'), harga: need('harganya'), t53: need('53triliun'),
    kel2: need('keluarga', 2), hartono: need('hartono'), pengendali: need('pengendali'), terkaya: need('terkaya'),
    bca3: need('bca', 3), emiten: need('emiten'), terbesar: need('terbesar'), nilai: need('nilainya'), t700: need('700triliun'),
    tahun: need('tahun'), teriak: need('teriak'), ambil2: need('ambil', 2), lagi: need('lagi'), danantara: need('danantara'), rencana: need('rencana'),
    kel3: need('keluarga', 3), sisa: need('sisa'), satu: need('satu'), persen: need('persen'),
    satu2: need('satu', 2), krisis: need('krisis'), ngambil: need('ngambil'), atau: need('atau'), ngasih: need('ngasih'), tergantung: need('tergantung'), mana: need('mana'),
  });
}

// ---------------- camera: Catmull-Rom through timed keys ----------------
let CK = [];
function camKeys() {
  CK = [
    [0.0, [0, 5.6, 9.5], [0, 2.4, -2]],
    [1.3, [0, 2.6, 6.2], [0, 2.2, -2]],
    [K.bca - .35, [.3, 2.2, 4.6], [0, 2.1, -2]],
    [K.bca + .25, [4.5, 1.9, -16.8], [4.55, 1.5, -24]],
    [K.mei - .25, [4.6, 1.7, -17.6], [4.55, 1.45, -24]],
    [K.y98 + .1, [.2, 2.0, -37.4], [0, 1.6, -44]],
    [K.ratusan - .2, [-.2, 1.7, -38.2], [0, 1.3, -44]],
    [K.ratusan + .8, [2.6, 2.3, -39.8], [3.9, 1.0, -47.5]],
    [K.nasabah + .1, [-4.3, 2.0, -59.6], [-5.0, 1.4, -67]],
    [K.bi - .1, [-4.6, 1.9, -60.4], [-5.0, 1.4, -67]],
    [K.nyuntik + .4, [-3.7, 2.1, -59.0], [-3.95, 1.4, -67]],
    [K.cukup + .3, [-4.2, 1.9, -60.0], [-4.5, 1.4, -67]],
    [K.d28 + .2, [2.8, 2.0, -81.6], [3.0, 1.6, -89]],
    [K.kehilangan + .4, [2.4, 1.8, -82.4], [2.6, 1.4, -89]],
    [K.y02 + .25, [0, 2.0, -100.6], [0, 1.6, -110]],
    [K.tinggi + .2, [-.1, 1.9, -100.9], [-.1, 1.5, -110]],
    [K.menang + .2, [.6, 1.8, -102.6], [.6, 1.4, -110]],
    [K.raja + .1, [3.6, 2.1, -106.8], [4.6, 1.6, -114]],
    [K.kel2 - .05, [4.1, 1.9, -107.4], [4.6, 1.6, -114]],
    [K.hartono + .25, [-4, 1.9, -125.6], [-4, 1.5, -132]],
    [K.bca3 - .35, [-3.8, 1.8, -126.2], [-4, 1.45, -132]],
    [K.bca3 + .1, [0, 1.1, -142.5], [0, 2.8, -153]],
    [K.nilai + .2, [0, 3.6, -142.0], [0, 3.6, -153]],
    [K.tahun + .1, [0, 3.8, -143.0], [0, 3.6, -153]],
    [K.tahun + .7, [4, 1.9, -165.4], [4, 1.5, -172]],
    [K.rencana + .4, [4.1, 1.8, -166.0], [4, 1.45, -172]],
    [K.kel3 + .2, [-3, 1.8, -185.4], [-3, 1.5, -192]],
    [K.persen + .6, [-3, 1.75, -186.0], [-3, 1.5, -192]],
    [K.satu2 + .3, [0, 2.3, -206.6], [0, 2.1, -214]],
    [K.tergantung, [0, 2.2, -207.2], [0, 2.1, -214]],
    [99, [0, 2.0, -208.6], [0, 2.1, -214]],
  ];
}
function cr(p0, p1, p2, p3, u) { const u2 = u * u, u3 = u2 * u; return p1.map((_, i) => .5 * ((2 * p1[i]) + (-p0[i] + p2[i]) * u + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * u2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * u3)); }
function camAt(t) {
  let i = 0; while (i < CK.length - 2 && t > CK[i + 1][0]) i++;
  const a = CK[i], b = CK[i + 1], u = ease.inOut(clamp((t - a[0]) / (b[0] - a[0]))) * .6 + clamp((t - a[0]) / (b[0] - a[0])) * .4;
  let A = CK[Math.max(0, i - 1)], B = CK[Math.min(CK.length - 1, i + 2)];
  const far = (x, y) => Math.hypot(...x.map((v, k) => v - y[k])) > 6, near = far(a[1], b[1]);
  if (!near && far(A[1], a[1])) A = a; if (!near && far(B[1], b[1])) B = b;
  return { p: cr(A[1], a[1], b[1], B[1], u), l: cr(A[2], a[2], b[2], B[2], u) };
}


// ---------------- build world ----------------
let BG;
const crowdCols = [PAL.prus, PAL.greyD, PAL.ai, PAL.sumiL, PAL.wood, PAL.beniL];
async function build() {
  const ff = [new FontFace('Shippori', 'url(/vendor/ShipporiMinchoB1-ExtraBold.ttf)', { weight: '800' }), new FontFace('Shippori', 'url(/vendor/ShipporiMinchoB1-Bold.ttf)', { weight: '700' })];
  for (const f of ff) { await f.load(); document.fonts.add(f); }
  times(); camKeys(); initPaper();
  CV = document.createElement('canvas'); CV.width = W; CV.height = H;
  R = new THREE.WebGLRenderer({ canvas: CV, alpha: true, antialias: true, preserveDrawingBuffer: true });
  R.setClearColor(0, 0); R.outputColorSpace = THREE.SRGBColorSpace;
  S = new THREE.Scene(); S.fog = new THREE.Fog(0xe8dcc0, 18, 75);
  CAM = new THREE.PerspectiveCamera(40, W / H, .1, 600);
  add(P.ground(160, 320), 0, 0, -110);
  const Rn = rnd(5);
  for (let z = 6; z > -240; z -= 7) for (const side of [-1, 1]) { const x = side * (10 + Rn() * 9); add(P.pine(2.2 + Rn() * 2.2, Math.floor(Rn() * 99)), x, 0, z - Rn() * 3); }
  for (let z = -10; z > -250; z -= 28) for (const side of [-1, 1]) add(P.hills(26, 4, Rn() > .5 ? PAL.green : PAL.ochre, Math.floor(Rn() * 50), { bot: PAL.ochreL, rows: true }), side * 25, 0, z);
  BG = new THREE.Group(); S.add(BG);
  for (const [x, z, w, h] of [[-26, -70, 30, 12], [20, -80, 34, 15], [-4, -95, 40, 17]]) { const m = P.mountain(w, h, Math.floor(Rn() * 9)); m.material.fog = false; m.material.opacity = .85; m.position.set(x, -1, z); m.renderOrder = -2; BG.add(m); }
  { const m = P.mist(60, 2.4, 3, .8); m.material.fog = false; m.position.set(0, 1, -60); m.renderOrder = -1; BG.add(m); }

  // ---- S0 HOOK: the bank on a hill at night; the state seal; then everyone scrambles for it ----
  add(P.hills(30, 3.2, PAL.prusL, 9, { bot: PAL.prus }), 0, 0, -9);
  add(P.hill(9, 1.25, 6), 0, 0, -2.6);
  const bk0 = add(P.bank(2.3, 2.2), 0, 1.0, -2.8);
  for (let i = 0; i < 6; i++) add(P.cloud(4 + hash(i) * 3, i + 1), (hash(i + 3) - .5) * 9, 4.6 + hash(i + 7) * 3, 2 - i * 2.4);
  stamp(add(seal(['DIAMBIL', 'ALIH NEGARA'], { w: 2.0, h: .95 }), -.1, 3.2, -2.3, .85), K.negara - .05, { t1: K.rebut - .15 });
  for (let i = 0; i < 9; i++) { const side = i % 2 ? 1 : -1, u = Math.floor(i / 2) / 4, x0 = side * (1.6 + u * .6), x1 = side * (.35 + u * .75), z = -1.9 + u * .9 - (i % 3) * .08;
    const pp = add(person({ coat: crowdCols[i % 6], hat: i % 3 === 0, mouth: 'open', arms: i % 2 ? 'up' : 'cheer', kind: i % 4 === 3 ? 'woman' : 'man', seed: 20 + i }), x0, .4, z, .62);
    U.push(t => { const k = prog(t, K.skrg + .15 + i * .07, K.skrg + .7 + i * .07, outE); pp.visible = k > .002; pp.position.x = lerp(x0, x1, k) + Math.sin(t * 9 + i) * .03 * k;
      pp.position.y = .35 + (1 - Math.abs(u - .5)) * .45 + Math.abs(Math.sin(t * 8 + i * 1.3)) * .1 * k; pp.rotation.z = -side * .12 * k + Math.sin(t * 7 + i) * .05; }); }
  stamp(add(seal(['REBUTAN'], { w: 1.7, h: .66 }), .1, 3.3, -2.2, .78), K.rebut + .05, { rot: .06 });
  // ---- S1: who owned it ----
  pop(add(cartouche('林紹良', 'LIEM SIOE LIONG', { w: 1.0, h: 3.0 }), 3.6, .1, -24.6, .8), K.milik - .1);
  const liem = pop(add(person({ coat: PAL.prus, glasses: true, mouth: 'smile' }), 4.45, 0, -24.0), K.milik); sway(liem, .015, 1.2);
  const soe = pop(add(person({ coat: PAL.sumiL, peci: true, sil: true }), 5.45, 0, -24.15, 1.05), K.sahabat - .1); sway(soe, .01, 1, 1);
  pop(add(board(['BCA · 1957'], { w: 1.6, h: .45, bg: PAL.prus }), 4.6, 2.75, -23.9), K.bca - .05);
  pop(add(board(['SAHABAT DEKAT'], { w: 1.75, h: .42, bg: PAL.beni }), 4.8, 2.12, -23.7), K.sahabat);
  add(P.hills(12, 2.2, PAL.greenD, 13, { bot: PAL.ochre }), 5, 0, -30); add(P.mist(10, .9, 2, .85), 6, 1.6, -29);
  // ---- S2: May 1998 — the fall, the fire, the branches ----
  stamp(add(seal(['MEI 1998'], { w: 1.7, h: .7 }), -.3, 2.75, -43.4, .6), K.y98 - .05);
  const fallB = pop(add(board(['SOEHARTO MUNDUR'], { w: 2.0, h: .45, bg: PAL.sumiL }), 0, 2.35, -43.5), K.soe2 - .1);
  U.push(t => { const k = prog(t, K.jatuh, K.jatuh + .45, ease.in); if (k > 0) { fallB.rotation.z = -k * 1.4; fallB.position.y = 2.35 - k * 2.6; fallB.visible = k < .98; } });
  if (true) SHAKES.push(K.jatuh + .45);
  add(P.house(2.6, 2.2, false), 0, 0, -44.8);
  for (let i = 0; i < 3; i++) { const f = add(P.flames(1.0, 1.3, 7 + i), -.75 + i * .75, .9 + (i === 1 ? .5 : 0), -44.5 + i * .02);
    U.push(t => { const k = prog(t, K.dibakar - .05 + i * .12, K.dibakar + .5 + i * .12, outB); f.visible = k > .002; f.scale.set(Math.max(.001, k) * (1 + Math.sin(t * 13 + i) * .05), Math.max(.001, k) * (1 + Math.sin(t * 17 + i * 2) * .12), 1); }); }
  for (let i = 0; i < 5; i++) { const b = add(P.bank(1.25, 1.2, { broken: true, seed: 300 + i }), 2.7 + i * .62, 0, -46.2 - i * 1.0); pop(b, K.ratusan + i * .09, { d: .3 }); }
  add(P.hills(24, 3, PAL.sumiL, 17, { bot: PAL.beniD }), 0, 0, -52);
  // ---- S3+S4: the run on the bank, the BLBI syringe ----
  const bankR = new THREE.Group(); bankR.position.set(-5, 0, -67.2); S.add(bankR); bankR.add(P.bank(2.6, 2.6));
  U.push(t => { const k = t - K.cukup - .05; bankR.rotation.z = k > 0 && k < 1 ? Math.exp(-5 * k) * Math.sin(k * 30) * .03 : 0; });
  SHAKES.push(K.cukup + .05);
  for (let i = 0; i < 11; i++) { const u = i / 10, x = lerp(-5.1, -7.4, u), z = lerp(-66.4, -61.8, u);
    const pp = add(person({ coat: crowdCols[(i + 2) % 6], hat: i % 3 === 1, mouth: i % 3 ? 'open' : 'sad', kind: i % 5 === 2 ? 'woman' : 'man', seed: 40 + i }), x, 0, z, .82 + hash(i) * .1);
    U.push(t => { const a = prog(t, K.nasabah - .3 + i * .03, K.nasabah + .1 + i * .03, outB); pp.visible = a > .002; pp.scale.setScalar(Math.max(.001, a) * .86);
      pp.rotation.z = Math.sin(t * 9 + i) * .05 * (t > K.panik ? 1.6 : 1); pp.position.y = Math.abs(Math.sin(t * 7 + i)) * (t > K.panik ? .06 : .01); }); }
  for (let i = 0; i < 26; i++) { const b = add(P.bill(.42, 500 + i), -5, .6, -66.6); const vx = -1.2 - hash(i) * 2.2, vy = 2.4 + hash(i + 3) * 2.2, t0 = K.t16 + i * .1;
    U.push(t => { const k = t - t0; b.visible = k > 0 && k < 1.8 && t < K.tetap + 1.2; const kk = Math.max(0, k); b.position.set(-5 + vx * kk, .6 + vy * kk - 2.4 * kk * kk, -66.6 + kk * 1.6); b.rotation.z = kk * 5 * (i % 2 ? 1 : -1); }); }
  const syr = add(P.syringe(1.5), -3.3, 1.4, -66.9);
  U.push(t => { const a = prog(t, K.bi - .1, K.nyuntik + .1, ease.out), d = prog(t, K.cukup + .1, K.cukup + .6, ease.in);
    syr.visible = a > .002 && d < .99; syr.position.set(lerp(-.6, -3.3, a) + Math.sin(t * 22) * .01 * (a >= 1), 1.4 - d * 3, -66.9); syr.rotation.z = -d * .9; });
  stamp(add(seal(['NGGAK', 'CUKUP'], { w: 1.3, h: 1.1 }), -4.6, 2.75, -66.4, .78), K.cukup - .05, { rot: -.1 });
  add(P.hills(24, 3, PAL.greyD, 19, { bot: PAL.grey }), -4, 0, -74);
  // ---- S5: 28 May — the state takes over; Salim walks away ----
  add(P.bank(2.4, 2.4), 3, 0, -89.2);
  const fl = add(P.flag(2.6), 4.55, -2.8, -88.7); U.push(t => { const k = prog(t, K.negara2 - .1, K.negara2 + .6, ease.out); fl.position.y = lerp(-2.8, 0, k); fl.rotation.z = Math.sin(t * 3) * .015; });
  stamp(add(board(['28 MEI 1998'], { w: 1.7, h: .45, bg: PAL.sumiL }), 3, 2.9, -88.7), K.d28 - .05, { rot: .04, t1: K.kel - .2 });
  const bigSeal = drop(add(seal(['DIAMBIL ALIH', 'NEGARA'], { w: 2.1, h: 1.15 }), 2.75, 1.15, -88.4, .74), K.ambil, { h: 3.5 });
  const sl = add(person({ coat: PAL.prus, glasses: true, mouth: 'sad' }), 2.0, 0, -88.0);
  U.push(t => { const a = prog(t, K.d28 - .2, K.d28 + .2, outB), k = prog(t, K.kehilangan - .1, K.kehilangan + 1.4, ease.inOut); sl.visible = a > .002 && k < .98; sl.scale.setScalar(Math.max(.001, a));
    sl.position.x = lerp(2.0, 1.3, k); sl.position.y = Math.abs(Math.sin(t * 6)) * .04 * (k > 0 && k < 1); sl.material.opacity = 1 - k * .9; });
  pop(add(board(['KELUARGA SALIM'], { w: 1.7, h: .4, bg: PAL.white, fg: PAL.sumi }), 2.85, 2.9, -88.6), K.kel - .05, { t1: K.kehilangan + 1.0 });
  add(P.hills(20, 2.5, PAL.green, 23, { bot: PAL.ochreL }), 3, 0, -95);
  // ---- S6+S7: the 2002 auction; the kretek king wins ----
  add(P.podium(1.1, 1.15), 0, 0, -110.6);
  add(person({ coat: PAL.greyD, mouth: 'flat' }), 0, .05, -111.0, .95);
  const gv = add(P.gavel(.75), .5, 1.45, -110.4);
  U.push(t => { const k = t - K.menang; gv.rotation.z = k > -.25 && k < 0 ? lerp(0, .9, prog(t, K.menang - .25, K.menang - .05)) : k >= 0 ? Math.exp(-8 * k) * Math.sin(k * 25) * .2 : 0; });
  SHAKES.push(K.menang);
  stamp(add(board([['LELANG 51%', PAL.white], ['2002', PAL.ochreL]], { w: 1.7, h: .75, bg: PAL.beniD, size: 30 }), 0, 2.75, -110.8), K.y02 - .05);
  const L = pop(add(board([['STANDARD', PAL.white], ['CHARTERED', PAL.white], ['Rp1.800', PAL.ochreL]], { w: 1.45, h: 1.0, post: .7, bg: PAL.prus, size: 27 }), -1.05, 0, -109.7), K.stan - .2);
  const Rb = pop(add(board([['FARALLON', PAL.white], ['+ DJARUM', PAL.white], ['Rp1.775', PAL.ochreL]], { w: 1.45, h: 1.0, post: .7, bg: PAL.beni, size: 27 }), 1.05, 0, -109.7), K.stan);
  stamp(add(seal(['LEBIH', 'TINGGI'], { w: 1.15, h: .85, col: PAL.prusD }), -1.05, 2.15, -109.4, .85), K.tinggi - .05, { rot: -.12 });
  stamp(add(seal(['MENANG'], { w: 1.3, h: .55 }), .95, 2.15, -109.3, .85), K.menang + .02, { rot: .1 });
  add(P.factory(2.8, 2.2), 4.7, 0, -114.6);
  for (let i = 0; i < 2; i++) { const s = add(P.steam(.9, 2.2, 60 + i), 4.7 + (i ? .87 : -.85), 1.3, -114.7); U.push(t => { const k = prog(t, K.djarum - .2, K.djarum + .5); s.visible = k > .01; s.scale.set(1, Math.max(.001, k), 1); s.position.y = 1.25 + Math.sin(t * 2 + i) * .1; s.rotation.z = Math.sin(t * 1.3 + i) * .06; }); }
  pop(add(board(['DJARUM · RAJA KRETEK'], { w: 2.2, h: .42, bg: PAL.sumiL }), 4.6, 2.95, -114.2), K.raja - .1);
  add(P.hills(26, 2.6, PAL.ochre, 29, { bot: PAL.ochreL }), 2, 0, -119);
  // ---- S8: the Hartonos ----
  const h1 = pop(add(person({ coat: PAL.greyD, glasses: true, mouth: 'smile' }), -4.45, 0, -132.0), K.hartono - .2), h2 = pop(add(person({ coat: PAL.prus, glasses: true, mouth: 'smile' }), -3.55, 0, -132.05), K.hartono - .1);
  sway(h1, .02, 1.4); sway(h2, .02, 1.3, 1);
  pop(add(board(['KELUARGA HARTONO'], { w: 2.1, h: .42, bg: PAL.white, fg: PAL.sumi }), -4, 2.12, -131.8), K.kel2);
  pop(add(board(['PENGENDALI · 54,94%'], { w: 2.1, h: .42, bg: PAL.prus }), -4, .3, -131.5), K.pengendali);
  stamp(add(seal(['#1', 'TERKAYA'], { w: 1.5, h: 1.05, col: PAL.beni }), -4, 2.7, -131.6, .8), K.terkaya, { rot: .1 });
  for (let i = 0; i < 16; i++) { const c = add(P.coin(.26, 700 + i), -4 + (hash(i) - .5) * 2.6, 4, -131.4 - hash(i + 1) * .4); const t0 = K.terkaya + .1 + hash(i + 4) * .9;
    U.push(t => { const k = t - t0; c.visible = k > 0 && k < 1.6; const kk = Math.max(0, k); c.position.y = 3.6 - 4.5 * kk * kk; c.rotation.z = kk * 7 + i; }); }
  add(P.hills(18, 2.2, PAL.greenD, 31, { bot: PAL.ochre }), -4, 0, -138);
  // ---- S9: the tower — #1 on the exchange ----
  const tw = add(P.tower(2.3, 7.2, { sign: 'BCA' }), 0, 0, -153.2);
  U.push(t => { const k = prog(t, K.bca3 - .1, K.terbesar + .5, ease.out); tw.scale.set(1, Math.max(.001, k), 1); tw.visible = k > .002; });
  for (let i = 0; i < 8; i++) { const pp = add(person({ coat: crowdCols[i % 6], mouth: 'open', arms: 'up', seed: 80 + i, kind: i % 3 === 2 ? 'woman' : 'man' }), -1.9 + i * .54 + (i > 3 ? .55 : 0), 0, -151.4 + (i % 2) * .2, .55);
    U.push(t => { const k = prog(t, K.emiten + i * .05, K.emiten + .35 + i * .05, outB); pp.visible = k > .002; pp.scale.setScalar(Math.max(.001, k) * .55); pp.position.y = Math.abs(Math.sin(t * 8 + i)) * .08; }); }
  stamp(add(seal(['#1', 'DI BURSA'], { w: 1.45, h: 1.0 }), 1.1, 4.6, -152.4, .85), K.terbesar + .05, { rot: .1 });
  add(P.hills(30, 3, PAL.prusL, 37, { bot: PAL.prus }), 0, 0, -160);
  // ---- S10: 'take it back!' — and the answer ----
  pop(add(board(['AGUSTUS 2025'], { w: 1.7, h: .42, bg: PAL.sumiL }), 4, 2.85, -171.7), K.tahun + .35);
  const picks = [];
  for (let i = 0; i < 7; i++) { const x = 4 + (i - 3) * .42, z = -171.2 - (i % 2) * .35;
    const pp = add(person({ coat: crowdCols[(i + 1) % 6], mouth: 'open', arms: 'up', hat: i % 3 === 0, seed: 90 + i }), x, 0, z, .72);
    U.push(t => { pp.visible = t > K.tahun + .25; pp.position.y = Math.abs(Math.sin(t * 9 + i * 1.7)) * (t > K.teriak && t < K.rencana ? .12 : .02); }); }
  for (let i = 0; i < 3; i++) { const pk = add(board([['AMBIL', PAL.beni], ['LAGI!', PAL.beni]], { w: .85, h: .62, post: .8, bg: PAL.white, size: 26 }), 3.1 + i * .9, .55, -170.9 + (i % 2) * .05, .9); picks.push(pk);
    U.push(t => { const a = prog(t, K.ambil2 - .2 + i * .08, K.ambil2 + .15 + i * .08, outB), d = prog(t, K.rencana + .05, K.rencana + .5, ease.in); pk.visible = a > .002 && d < .99;
      pk.scale.setScalar(Math.max(.001, a) * .9); pk.position.y = .55 + Math.abs(Math.sin(t * 9 + i)) * .1 - d * 2.5; pk.rotation.z = Math.sin(t * 8 + i) * .08 + d * (i - 1) * .8; }); }
  pop(add(board(['DANANTARA:'], { w: 1.6, h: .42, bg: PAL.prus }), 4, 2.4, -171.3), K.danantara - .05);
  stamp(add(seal(['NGGAK ADA', 'RENCANA'], { w: 1.6, h: 1.0 }), 4.1, 1.55, -170.6), K.rencana - .05, { rot: -.07 });
  add(P.hills(24, 2.6, PAL.greyD, 41, { bot: PAL.grey }), 4, 0, -178);
  // ---- S11: the Salims today: ~1% ----
  const pieM = pop(add(P.pie(1.9, .0115), -3, 1.95, -192.5), K.kel3 - .1);
  const wedge = add(P.pieWedge(1.9, .0115), -3, 1.95, -192.45);
  U.push(t => { const a = prog(t, K.kel3 - .1, K.kel3 + .25, outB), m = prog(t, K.sisa, K.sisa + .4, outB); wedge.visible = a > .002; wedge.scale.setScalar(Math.max(.001, a) * lerp(1, 1.12, m)); wedge.position.set(-3 + m * .04, 1.95 + m * .22, -192.45); });
  pop(add(board(['SAHAM BBCA'], { w: 1.5, h: .4, bg: PAL.white, fg: PAL.sumi }), -3, .55, -192.2), K.kel3 + .1);
  const sa = pop(add(person({ coat: PAL.greyD, mouth: 'flat', glasses: false }), -3.75, 0, -191.4, .85), K.kel3); sway(sa, .02, 1.1);
  stamp(add(seal(['±1%'], { w: 1.0, h: .62 }), -2.45, 2.85, -191.9, .85), K.satu, { rot: .08 });
  pop(add(board(['SALIM'], { w: .9, h: .36, bg: PAL.sumiL }), -3.75, 1.75, -191.3), K.salim2 || K.kel3 + .2);
  add(P.hills(24, 2.4, PAL.prus, 47, { bot: PAL.prusL }), -3, 0, -198);
  // ---- S12: back to a hill at dawn — which side are you on? ----
  const sun2 = add(P.sun(8), 0, 3.6, -240); sun2.renderOrder = -1; U.push(t => { const k = prog(t, K.atau - .3, K.atau + 1.2, ease.out); sun2.visible = t > K.satu2; sun2.position.y = lerp(-1.5, 4.6, k); });
  add(P.hills(30, 3, PAL.prus, 61, { bot: PAL.prusL }), 0, 0, -224); add(P.mist(26, 1.4, 6, .85), 0, 1.4, -222);
  add(P.hill(9, 1.25, 66, PAL.green), 0, 0, -214.3);
  add(P.bank(1.8, 1.75), 0, 1.0, -214.6);
  stamp(add(seal(['KRISIS'], { w: 1.2, h: .52, col: PAL.sumiL }), -.45, 2.85, -214.0, .85), K.krisis, { rot: -.08, t1: K.tergantung - .2 });
  const lose = add(person({ coat: PAL.greyD, mouth: 'sad', eyes: 'shut' }), -.85, .35, -213.6, .8), win = add(person({ coat: PAL.prus, glasses: true, mouth: 'open', arms: 'cheer' }), .85, .35, -213.6, .8);
  pop(lose, K.ngambil - .1); U.push(t => { if (t > K.ngambil) lose.rotation.z = Math.sin(t * 1.4) * .02 - .06; });
  pop(win, K.ngasih - .1); U.push(t => { if (t > K.ngasih) win.position.y = .35 + Math.abs(Math.sin((t - K.ngasih) * 7)) * .14 * Math.exp(-(t - K.ngasih) * .8); });
  for (let i = 0; i < 12; i++) { const c = add(P.coin(.22, 800 + i), .85, 1.4, -213.5); const vx = (hash(i) - .2) * 2.4, vy = 2.6 + hash(i + 2) * 1.6;
    U.push(t => { const k = t - (K.ngasih + .05 + i * .03); c.visible = k > 0 && k < 1.4; const kk = Math.max(0, k); c.position.set(.85 + vx * kk * .6, 1.4 + vy * kk - 4 * kk * kk, -213.5); c.rotation.z = kk * 6; }); }
  drop(add(board([['LO DI', PAL.white], ['SISI MANA?', PAL.ochreL]], { w: 2.0, h: .85, bg: PAL.sumiL, size: 32 }), 0, 3.05, -213.8), K.tergantung - .05, { h: 2.6 });
}

// ---------------- sky (2D) ----------------
const SKY = [ // [z, top, bottom]
  [8, '#101a2e', '#4b5670'], [-12, '#101a2e', '#4b5670'], [-18, '#3b5a82', '#e8cfa0'], [-30, '#3b5a82', '#e8cfa0'],
  [-37, '#26090c', '#b2412c'], [-52, '#26090c', '#b2412c'], [-58, '#3d4450', '#a9a08c'], [-74, '#3d4450', '#a9a08c'],
  [-80, '#7d93a3', '#eadcc0'], [-94, '#7d93a3', '#eadcc0'], [-100, '#8a4a3c', '#efcf98'], [-118, '#8a4a3c', '#efcf98'],
  [-124, '#c98a2e', '#f6e2aa'], [-138, '#c98a2e', '#f6e2aa'], [-142, '#5e8fb8', '#f3e6c4'], [-158, '#5e8fb8', '#f3e6c4'],
  [-164, '#59606b', '#d9cfb6'], [-178, '#59606b', '#d9cfb6'], [-184, '#3b2f4a', '#d9a27a'], [-198, '#3b2f4a', '#d9a27a'], [-205, '#d6603c', '#f8e0a6'],
];
const hx = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
const mixc = (a, b, k) => { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
function skyAt(z, t) {
  let i = 0; while (i < SKY.length - 2 && z < SKY[i + 1][0]) i++;
  const a = SKY[i], b = SKY[i + 1], k = ease.inOut(clamp((a[0] - z) / (a[0] - b[0])));
  return [mixc(a[1], b[1], k), mixc(a[2], b[2], k)];
}
function sky(g, t, c) {
  const [top, bot] = skyAt(c.p[2], t);
  const gr = g.createLinearGradient(0, 0, 0, H * .75); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .18; g.fillStyle = top; for (let i = 0; i < 4; i++) { const y = 120 + i * 150 + Math.sin(i * 2.1) * 30; g.beginPath(); g.roundRect(-40 + i * 60, y, W + 80, 26 + i * 6, 14); g.fill(); } g.restore();
  const z = c.p[2], night = z > -12 ? 1 : 0, fire = z < -34 && z > -54 ? 1 : 0;
  if (night) { g.fillStyle = 'rgba(248,241,223,.92)'; g.beginPath(); g.arc(800, 330, 70, 0, 7); g.fill(); }
  if (fire) { g.fillStyle = 'rgba(240,200,150,.85)'; g.beginPath(); g.arc(260, 300, 60, 0, 7); g.fill(); }
}
function fogTo(t, c) { const [, bot] = skyAt(c.p[2], t); const m = bot.match(/\d+/g).map(Number); S.fog.color.setRGB(...m.map(v => (v / 255) ** 2.2)); }

// ---------------- draw ----------------
function shakeAt(t) { let s = 0; for (const t0 of SHAKES) { const k = t - t0; if (k > 0 && k < .4) s += Math.exp(-k * 14) * .06; } return s; }
function world(g, t) {
  const c = camAt(t), sh = shakeAt(t);
  sky(g, t, c);
  CAM.position.set(c.p[0] + Math.sin(t * 71) * sh, c.p[1] + Math.cos(t * 63) * sh, c.p[2]);
  CAM.lookAt(c.l[0], c.l[1], c.l[2]); CAM.rotation.z += Math.sin(t * .7) * .006;
  fogTo(t, c); BG.position.set(c.p[0] * .9, 0, c.p[2]);
  for (const u of U) u(t);
  R.render(S, CAM); g.drawImage(CV, 0, 0);
}

// ---------------- overlay ----------------
let WPAT = null, CH = [];
function chunks() { const ws = window.WORDS_DATA.words; let cur = [];
  ws.forEach((w, i) => { cur.push(w); const n = ws[i + 1]; if (!n || n.p !== w.p || /[,.!?:]$/.test(w.w) || cur.length >= 3) { CH.push(cur); cur = []; } }); }
const KEY = new Set(['negara', 'rebutan', 'bca', 'liem', 'sioe', 'liong', 'soeharto', '1998', 'jatuh', 'dibakar', 'ratusan', 'panik', '16triliun', '32triliun', 'cukup', '28', 'salim', '2002', '51persen', 'tinggi', 'menang', 'farallon', 'djarum', 'kretek', '53triliun', 'hartono', 'terkaya', 'terbesar', '700triliun', 'ambil', 'lagi', 'rencana', 'satu', 'persen', 'krisis', 'semuanya', 'mana']);
function captions(g, t) {
  let c = null; for (let i = 0; i < CH.length; i++) { const s = CH[i][0].s - .06, e = CH[i + 1] ? CH[i + 1][0].s - .06 : CH[i].at(-1).e + .9; if (t >= s && t < Math.min(e, CH[i].at(-1).e + .8)) { c = CH[i]; break; } }
  if (!c) return;
  const y = 1590, size = 64; g.save(); g.font = `800 ${size}px ${FONT}`; g.textBaseline = 'middle';
  const sp = 18, ws = c.map(w => g.measureText(w.w).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (c.length - 1);
  const k = prog(t, c[0].s - .06, c[0].s + .1, ease.out);
  // paper strip with torn edges
  const px = W / 2 - tw / 2 - 40, pw = tw + 80, R0 = rnd(Math.floor(c[0].s * 100));
  g.translate(0, (1 - k) * 18); g.globalAlpha = k;
  g.fillStyle = 'rgba(30,20,10,.35)'; g.beginPath(); g.roundRect(px + 8, y - 52 + 10, pw, 104, 6); g.fill();
  g.beginPath(); g.moveTo(px, y - 52); for (let x = px; x <= px + pw; x += 18) g.lineTo(x, y - 52 + (R0() - .5) * 7); for (let x = px + pw; x >= px; x -= 18) g.lineTo(x, y + 52 + (R0() - .5) * 7); g.closePath();
  g.fillStyle = PAL.white; g.fill(); g.save(); g.clip(); g.globalCompositeOperation = 'multiply'; g.fillStyle = WPAT; g.fillRect(px, y - 60, pw, 120); g.restore();
  let x = W / 2 - tw / 2;
  c.forEach((w, i) => { const act = t >= w.s - .03 && t < w.e + .05, key = KEY.has(w.w.toLowerCase().replace(/[^\w]/g, ''));
    g.fillStyle = act || (key && t >= w.s) ? PAL.beni : (t >= w.s - .03 ? PAL.sumi : 'rgba(33,29,27,.45)'); g.fillText(w.w, x, y + 3); x += ws[i] + sp; });
  g.restore();
}
function chip(g, t) { // top-left vertical cartouche like a print title slip
  const a = prog(t, .2, .6); g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(30,20,10,.3)'; g.fillRect(58, 76, 300, 70); g.fillStyle = PAL.white; g.fillRect(50, 68, 300, 70); g.strokeStyle = PAL.sumi; g.lineWidth = 3; g.strokeRect(56, 74, 288, 58);
  g.font = `800 34px ${FONT}`; g.fillStyle = PAL.sumi; g.textBaseline = 'middle'; g.fillText('KISAH NYATA', 74, 104);
  g.fillStyle = PAL.beni; g.fillRect(292, 82, 42, 42); g.fillStyle = PAL.white; g.font = `800 30px ${FONT}`; g.textAlign = 'center'; g.fillText('実', 313, 104); g.restore();
}
function counter(g, t, t0, t1, big, small, y) { // carved plate counter
  const k = prog(t, t0, t0 + .3, outE) * (1 - prog(t, t1, t1 + .25)); if (k < .01) return;
  g.save(); g.translate(W / 2, y); g.scale(lerp(1.6, 1, k), lerp(1.6, 1, k)); g.globalAlpha = Math.min(1, k * 2);
  g.font = `800 120px ${FONT}`; const bw = g.measureText(big).width + 90;
  g.fillStyle = 'rgba(30,20,10,.35)'; g.fillRect(-bw / 2 + 10, -95 + 12, bw, 230); g.fillStyle = PAL.sumiL; g.fillRect(-bw / 2, -95, bw, 230); g.strokeStyle = PAL.edge; g.lineWidth = 6; g.strokeRect(-bw / 2 + 12, -83, bw - 24, 206);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = PAL.ochreL; g.fillText(big, 0, -10);
  g.font = `800 40px ${FONT}`; g.fillStyle = PAL.white; g.fillText(small, 0, 84); g.restore();
}
function paperWipe(g, t, t0) { const k = prog(t, t0 - .25, t0, ease.in) * (1 - prog(t, t0, t0 + .3, ease.out)); if (k < .01) return; g.save(); g.globalAlpha = k; g.fillStyle = PAL.white; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'multiply'; g.fillStyle = WPAT; g.fillRect(0, 0, W, H); g.restore(); }
function finish(g, t) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .22; g.fillStyle = WPAT; g.translate((Math.floor(t * 12) % 2) * 3, 0); g.fillRect(-10, 0, W + 20, H); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .5, H * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,24,12,.4)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  // print border
  g.strokeStyle = PAL.sumi; g.lineWidth = 6; g.strokeRect(22, 22, W - 44, H - 44); g.lineWidth = 2; g.strokeRect(34, 34, W - 68, H - 68);
}
function embers(g, t, a) { if (a < .01) return; g.save(); g.globalAlpha = a;
  for (let i = 0; i < 70; i++) { const x = (hash(i) * W + Math.sin(t * 1.3 + i) * 40), y = H - ((hash(i + 3) * H + t * (160 + hash(i) * 220)) % H), r = 3 + hash(i + 9) * 6;
    g.fillStyle = i % 3 ? 'rgba(233,140,60,.85)' : 'rgba(250,210,120,.9)'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.restore(); }
function tag(g, t, t0, t1, s) { // small provenance label under the counter
  const k = prog(t, t0, t0 + .25) * (1 - prog(t, t1, t1 + .2)); if (k < .01) return; g.save(); g.globalAlpha = k; g.font = `700 30px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = g.measureText(s).width + 36; g.fillStyle = 'rgba(33,29,27,.82)'; g.fillRect(W / 2 - w / 2, 1440 - 24, w, 48); g.fillStyle = PAL.white; g.fillText(s, W / 2, 1441); g.restore(); }
function overlay(g, t) {
  if (!WPAT) { WPAT = g.createPattern(washi(), 'repeat'); chunks(); }
  const z = camAt(t).p[2];
  embers(g, t, prog(t, K.dibakar, K.dibakar + .4) * (1 - prog(t, K.nasabah - .4, K.nasabah)));
  paperWipe(g, t, K.d28 - .05);
  paperWipe(g, t, K.hartono - .1);
  counter(g, t, K.ratusan + .3, K.nasabah - .2, '122 CABANG', 'DIRUSAK · MEI 1998', 330);
  counter(g, t, K.t16 - .05, K.bi - .2, '± Rp16 T', 'DITARIK NASABAH', 330);
  tag(g, t, K.t16, K.bi - .2, 'PERKIRAAN BANKIR · ASIAWEEK 1998');
  counter(g, t, K.t32 - .05, K.cukup - .15, 'Rp32 T', 'SUNTIKAN BLBI', 330);
  counter(g, t, K.t53 - .05, K.kel2 - .25, 'Rp5,3 T', '51% SAHAM BCA · 2002', 330);
  counter(g, t, K.t700 - .05, K.tahun - .1, '± Rp700 T', 'NILAI PASAR · NOV 2026', 330);
  tag(g, t, K.teriak - .1, K.rencana + 1.2, 'USULAN SEORANG EKONOM · BCA MEMBANTAH');
  tag(g, t, K.tergantung, 99, 'BUKAN AJAKAN JUAL/BELI SAHAM');
  chip(g, t);
  captions(g, t);
  finish(g, t);
}

startToon({ build, draw: world, overlay, blurSamples: 2, shutter: .5 });
