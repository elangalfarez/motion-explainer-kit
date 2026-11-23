// ando_ramen — "Bangkrut di umur 47": one unbroken camera through a paper-cut ukiyo-e world (Three.js).
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
  Object.assign(K, {
    p0: 0, n47: T('47'), bang: T('bangkrut'), penj: T('dipenjara'), tapi: T('tapi'), mie: T('mie'), sem: T('semalam'),
    nama: T('namanya'), momo: T('momofuku'), yatim: T('yatim'), y48: T('1948'), dua: T('dua'), kasus: T('kasus'),
    bebas: T('bebas'), dir: T('direktur'), kop: T('koperasinya'), bang2: T('bangkrut', 2), harta: T('hartanya'), sisa: T('sisa'), rumah: T('rumah'),
    tapi2: T('tapi', 2), pem: T('pemandangan'), habis2: T('habis', 2), antre: T('antre'), dingin: T('dingin'), mangkuk: T('semangkuk'),
    jadi2: T('jadi', 2), gubuk: T('gubuk'), setahun: T('setahun'), nggak: T('nggak'), tidur: T('tidur'), empat: T('empat'),
    sampai: T('sampai'), istri: T('istrinya'), tempura: T('tempura'), mie2: T('mie', 2), kilat: T('kilat'), air: T('airnya'), awet: T('awet'), tinggal: T('tinggal'), seduh: T('seduh'),
    y58: T('1958'), lahir: T('lahirlah'), pertama: T('pertama'), umurnya: T('umurnya'), n48: T('48'), skrg: T('sekarang'), m123: T('123miliar'), porsi: T('porsi'),
    indo: T('indonesia'), dua2: T('dua', 2), mulai: T('mulai'), nol: T('nol'), n47b: T('47', 2), lo: T('lo', 2), telat: T('telat'),
  });
}

// ---------------- camera: Catmull-Rom through timed keys ----------------
let CK = [];
function camKeys() {
  CK = [
    [0.0, [0, 5.4, 9.5], [0, 2.2, -2]],
    [1.2, [0, 2.3, 6.6], [0, 2.0, -2]],
    [K.tapi - .1, [.35, 1.85, 4.7], [0, 2.0, -2]],
    [K.mie + .9, [0, 2.4, 7.6], [0, 2.9, -7]],
    [K.nama + .2, [0, 2.5, 7.0], [0, 3.0, -7]],
    [K.momo + .1, [4.8, 1.8, -19.8], [5, 1.5, -26]],
    [K.y48 - .3, [5.1, 1.5, -21.0], [5, 1.3, -26]],
    [K.y48 + .4, [1.4, 1.9, -37.8], [0, 1.7, -44]],
    [K.bebas - .1, [.2, 1.6, -39.9], [0, 1.5, -44]],
    [K.dir - .1, [-4.2, 1.9, -56.2], [-5.6, 1.8, -64]],
    [K.harta + .2, [-4.6, 2.3, -55.4], [-5.6, 1.6, -64]],
    [K.rumah + .3, [-2.6, 1.3, -58.6], [-2.4, .9, -63.6]],
    [K.tapi2 + .25, [-7.4, 1.6, -85.5], [-5, 1.2, -93]],
    [K.antre, [-4.5, 1.7, -88], [-1, 1.3, -95]],
    [K.mangkuk + .6, [2.1, 1.7, -93.6], [4, 1.5, -100]],
    [K.gubuk + .1, [.9, 2.1, -120.5], [0, 1.4, -128]],
    [K.tidur + .9, [.2, 1.6, -123.4], [0, 1.4, -128]],
    [K.istri, [0, 1.7, -144.6], [0, 1.2, -150]],
    [K.tempura + .5, [.3, 1.4, -147.0], [.3, 1.0, -149.8]],
    [K.mie2 + .3, [0, 1.9, -152.8], [0, 1.25, -160]],
    [K.seduh + .6, [.15, 1.8, -153.3], [.05, 1.3, -160]],
    [K.y58 + .2, [0, 1.8, -171.0], [0, 2.3, -180]],
    [K.n48 + .5, [.15, 1.6, -172.0], [.3, 1.6, -180]],
    [K.m123 + .2, [0, 24, -176], [0, 0, -199]],
    [K.indo + .5, [7.5, 11, -197], [8.5, 0, -206]],
    [K.mulai + .9, [0, 2.3, -231.5], [0, 2.1, -240]],
    [99, [0, 2.0, -233.4], [0, 2.1, -240]],
  ];
}
function cr(p0, p1, p2, p3, u) { const u2 = u * u, u3 = u2 * u; return p1.map((_, i) => .5 * ((2 * p1[i]) + (-p0[i] + p2[i]) * u + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * u2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * u3)); }
function camAt(t) {
  let i = 0; while (i < CK.length - 2 && t > CK[i + 1][0]) i++;
  const a = CK[i], b = CK[i + 1], u = ease.inOut(clamp((t - a[0]) / (b[0] - a[0]))) * .6 + clamp((t - a[0]) / (b[0] - a[0])) * .4;
  const A = CK[Math.max(0, i - 1)], B = CK[Math.min(CK.length - 1, i + 2)];
  return { p: cr(A[1], a[1], b[1], B[1], u), l: cr(A[2], a[2], b[2], B[2], u) };
}

// ---------------- build world ----------------
let BG, SUN, BOWL, BUILDING, PACKS = [];
async function build() {
  const ff = [new FontFace('Shippori', 'url(/vendor/ShipporiMinchoB1-ExtraBold.ttf)', { weight: '800' }), new FontFace('Shippori', 'url(/vendor/ShipporiMinchoB1-Bold.ttf)', { weight: '700' })];
  for (const f of ff) { await f.load(); document.fonts.add(f); }
  times(); camKeys(); initPaper();
  CV = document.createElement('canvas'); CV.width = W; CV.height = H;
  R = new THREE.WebGLRenderer({ canvas: CV, alpha: true, antialias: true, preserveDrawingBuffer: true });
  R.setClearColor(0, 0); R.outputColorSpace = THREE.SRGBColorSpace;
  S = new THREE.Scene(); S.fog = new THREE.Fog(0xe8dcc0, 18, 75);
  CAM = new THREE.PerspectiveCamera(40, W / H, .1, 600);
  add(P.ground(160, 320), 0, 0, -130);

  // ---- scenery along the whole route (kept |x| >= 8.5 near the path) ----
  const Rn = rnd(5);
  for (let z = 6; z > -260; z -= 7) for (const side of [-1, 1]) {
    const x = side * (9 + Rn() * 9); add(P.pine(2.2 + Rn() * 2.2, Math.floor(Rn() * 99)), x, 0, z - Rn() * 3);
  }
  for (let z = -10; z > -270; z -= 28) for (const side of [-1, 1]) { add(P.hills(26, 4, Rn() > .5 ? PAL.green : PAL.ochre, Math.floor(Rn() * 50), { bot: PAL.ochreL, rows: true }), side * 24, 0, z); }
  BG = new THREE.Group(); S.add(BG);
  for (const [x, z, w, h] of [[-26, -70, 30, 12], [20, -80, 34, 15], [-4, -95, 40, 17]]) { const m = P.mountain(w, h, Math.floor(Rn() * 9)); m.material.fog = false; m.material.opacity = .85; m.position.set(x, -1, z); m.renderOrder = -2; BG.add(m); }
  { const m = P.mist(60, 2.4, 3, .8); m.material.fog = false; m.position.set(0, 1, -60); m.renderOrder = -1; BG.add(m); }

  // ---- S0 HOOK: lone man on a hill in the rain ----
  add(P.hill(9, 1.25, 6), 0, 0, -2.2);
  const ando = add(person({ coat: PAL.prus, hat: true, mouth: 'sad' }), 0, 1.0, -2.0, 1.05); sway(ando, .015, 1.1);
  add(P.mist(14, 1, 3, .9), -3, .4, -6); add(P.hills(30, 3.2, PAL.prusL, 9, { bot: PAL.prus }), 0, 0, -9);
  for (let i = 0; i < 7; i++) { const c = add(P.cloud(4 + hash(i) * 3, i + 1), (hash(i + 3) - .5) * 9, 4.2 + hash(i + 7) * 3, 3 - i * 2.2); }
  stamp(add(seal(['47'], { w: 1.25, h: 1.25, size: 92 }), -.85, 3.05, -1.5), K.n47, { t1: K.tapi - .1 });
  { const bk = drop(add(board(['BANGKRUT'], { w: 2.1, h: .62, bg: PAL.sumiL }), .95, 2.75, -1.4), K.bang, { h: 2.5 }); U.push(t => { if (t > K.tapi) bk.visible = false; }); }
  const hb = add(P.bars(2.2, 2.6), 0, -3, -1.1); U.push(t => { const k = prog(t, K.penj - .1, K.penj + .25, outB); hb.position.y = lerp(-3, .9, k) - prog(t, K.tapi - .2, K.tapi + .3, ease.in) * 4; hb.visible = t > K.penj - .15 && t < K.tapi + .35; });
  // ---- S1: the giant ramen bowl rises behind ----
  BOWL = add(P.bowl(7.4, 4.4), 0, -6.5, -7.2); add(P.mist(12, 1, 8, .9), 2, .1, -6.6);
  U.push(t => { const k = prog(t, K.mie - .25, K.mie + .75, ease.out); BOWL.position.y = lerp(-5.5, -.35, k) + Math.sin(t * 1.6) * .05 * k; });
  for (let i = 0; i < 3; i++) { const s = add(P.steam(2.2, 3.4, 7 + i), -2.1 + i * 2.1, 3.4, -7.1); U.push(t => { const k = prog(t, K.mie + .5 + i * .12, K.mie + 1.2 + i * .12); s.visible = k > .01 && t < K.nama + 1.4; s.scale.set(1, Math.max(.001, k), 1); s.position.y = 3.0 + Math.sin(t * 2 + i) * .15; s.rotation.z = Math.sin(t * 1.4 + i) * .05; }); }
  const chop = add(cut(.25, 5, (g, w, h) => { g.fillStyle = PAL.woodL; g.strokeStyle = PAL.sumi; g.lineWidth = 4; for (const x of [10, 26]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 6, 0); g.lineTo(x + 3, h); g.closePath(); g.fill(); g.stroke(); } }), 1.3, 9, -7.0);
  U.push(t => { const k = prog(t, K.sem - .2, K.sem + .25, outB); chop.position.y = lerp(10, 2.4, k); chop.rotation.z = -.35; chop.visible = t > K.sem - .25; });
  // ---- S2: name + orphan ----
  pop(add(cartouche('安藤百福', 'MOMOFUKU ANDO', { w: 1.0, h: 3.6 }), 4.05, .1, -26.6, .8), K.nama - .2);
  pop(add(board(['1910 · TAIWAN'], { w: 2.0, h: .42, bg: PAL.prus }), 5.9, 2.45, -26.2), K.momo + .3);
  const kid = pop(add(person({ kind: 'child', coat: PAL.beniL, mouth: 'sad' }), 5.2, 0, -25.6), K.nama + .2); sway(kid, .03, 2);
  const mom = add(person({ kind: 'woman', coat: PAL.ai }), 4.65, 0, -26.0), dad = add(person({ coat: PAL.greyD }), 5.85, 0, -26.05);
  for (const [m, dx, i] of [[mom, -1, 0], [dad, 1, 1]]) { const x0 = m.position.x; U.push(t => { const k = prog(t, K.yatim + .15 + i * .1, K.yatim + 1.5 + i * .1, ease.in), a = prog(t, K.nama + .2, K.nama + .5, outB);
    m.position.set(x0 + dx * k * .9, k * 2.6, m.position.z); m.rotation.z = dx * k * .6; m.material.opacity = 1 - k; m.visible = a > .01 && k < .99; m.scale.setScalar(Math.max(.001, a)); }); }
  add(P.hills(12, 2.2, PAL.greenD, 13, { bot: PAL.ochre }), 5, 0, -31); add(P.mist(10, .9, 2, .85), 6, 1.6, -30);
  // ---- S3: prison 1948 ----
  add(person({ coat: PAL.white, mouth: 'sad', eyes: 'shut' }), -.1, .55, -44.5, 1.05);
  add(P.prison(5.4, 3.6), 0, 0, -44.1);
  stamp(add(seal(['1948'], { w: 1.5, h: .85, size: 66 }), -.45, 2.35, -43.7, .5), K.y48);
  stamp(add(board(['2 TAHUN'], { w: 1.6, h: .55, bg: PAL.beni }), .5, 1.6, -43.7, .55), K.dua, { rot: .07 });
  pop(add(board(['KASUS PAJAK'], { w: 1.7, h: .5, bg: PAL.white, fg: PAL.sumi }), .1, .45, -43.8), K.kasus);
  add(P.hills(14, 3.2, PAL.prusL, 17, { bot: PAL.prus }), 0, 0, -50);
  // ---- S4: credit union collapse, the one rented house ----
  BUILDING = new THREE.Group(); BUILDING.position.set(-5.9, 0, -64.6); S.add(BUILDING); BUILDING.add(P.building(4.4, 3.5));
  pop(add(board(['KOPERASI KREDIT'], { w: 2.6, h: .5, bg: PAL.sumiL }), -5.9, 3.85, -64.4), K.bebas + .3, { t1: K.bang2 - .1 });
  const dir = pop(add(person({ coat: PAL.prus, glasses: true, mouth: 'smile', arms: 'down' }), -4.6, 0, -62.6), K.bebas - .3);
  const dirS = pop(add(board(['DIREKTUR'], { w: 1.2, h: .34, bg: PAL.prus }), -4.6, 2.05, -62.55), K.dir, { t1: K.bang2 });
  U.push(t => { const k = prog(t, K.bang2 - .05, K.bang2 + .5, ease.in); BUILDING.rotation.x = -k * Math.PI / 2 * .98; if (t > K.bang2 + .5) BUILDING.rotation.x = -Math.PI / 2 * .98 + Math.exp(-6 * (t - K.bang2 - .5)) * Math.sin((t - K.bang2 - .5) * 20) * .06; });
  SHAKES.push(K.bang2 + .5);
  stamp(add(seal(['BANGKRUT'], { w: 2.4, h: .8, size: 62 }), -5.7, 2.3, -62.4), K.bang2 + .45, { t1: K.rumah - .2 });
  for (let i = 0; i < 14; i++) { const c = add(P.coin(.32, 200 + i), -5.9 + (hash(i) - .5) * 2.6, .4 + hash(i + 2) * 1.2, -62.9); const vx = (hash(i + 5) - .5) * 4, vy = 3 + hash(i + 9) * 2.5;
    U.push(t => { const k = t - (K.harta + i * .025); c.visible = k > -.6 && k < 2; const kk = Math.max(0, k); c.position.set(-5.9 + (hash(i) - .5) * 2.6 + vx * kk, .4 + hash(i + 2) * 1.2 + vy * kk - 4.5 * kk * kk, -62.9); c.rotation.z = kk * 6 + i; c.visible = k > -.05 && k < 2; c.scale.setScalar(1); }); }
  const hs = pop(add(P.house(1.7, 1.5), -2.4, 0, -63.9), K.sisa - .25);
  pop(add(board(['RUMAH SEWAAN'], { w: 1.7, h: .42, post: .5, bg: PAL.white, fg: PAL.sumi }), -1.0, 0, -63.4), K.rumah);
  add(P.hills(16, 2.5, PAL.green, 19, { bot: PAL.ochreL }), -4, 0, -70);
  // ---- S5: memory, post-war queue in the cold ----
  add(P.stall(2.8, 2.7), 4.1, 0, -100.4);
  for (let i = 0; i < 15; i++) { const u = i / 14, x = lerp(2.75, -6.4, u), z = lerp(-99.7, -91.2, u);
    const pp = add(person({ coat: [PAL.prus, PAL.greyD, PAL.ai, PAL.sumiL, PAL.wood][i % 5], hat: i % 3 === 0, mouth: i % 4 ? 'flat' : 'sad', kind: i % 6 === 4 ? 'woman' : 'man', seed: i }), x, 0, z, .9 + hash(i) * .12);
    U.push(t => { pp.rotation.z = Math.sin(t * 5 + i) * .02 * (t > K.dingin ? 2.5 : 1); pp.position.y = Math.abs(Math.sin(t * 6 + i)) * (t > K.dingin && t < K.dingin + 1.2 ? .03 : 0); }); }
  for (let i = 0; i < 2; i++) { const s = add(P.steam(1.2, 2.2, 30 + i), 3.4 + i * .9, 2.2, -100.6); U.push(t => { s.position.y = 2.1 + Math.sin(t * 2 + i) * .1; }); }
  pop(add(board(['OSAKA · HABIS PERANG'], { w: 2.5, h: .44, bg: PAL.sumiL }), -4.6, 2.35, -92.2), K.habis2 - .1);
  stamp(add(seal(['ANTRE'], { w: 1.4, h: .62, size: 50 }), .3, 2.6, -95.2), K.antre + .05, { rot: .06 });
  add(P.hills(30, 2.6, PAL.prusL, 23, { bot: PAL.white }), 0, 0, -106); add(P.mist(20, 1, 4, .85), -1, .3, -104);
  // ---- S6: the backyard shed, 365 days ----
  const sh = add(P.shed(3.6, 2.9), 0, 0, -128.2);
  U.push(t => { const k = clamp((t - K.setahun) / (K.tidur + .8 - K.setahun)); sh.scale.set(1, 1 + Math.sin(t * 18) * .004 * (k > 0 && k < 1), 1); });
  for (let i = 0; i < 10; i++) { const pg = add(cut(.4, .5, (g, w, h) => { g.fillStyle = PAL.white; g.strokeStyle = PAL.sumi; g.lineWidth = 3; g.fillRect(4, 4, w - 8, h - 8); g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = PAL.beni; g.fillRect(4, 4, w - 8, h * .25); ptext(g, String(1 + i * 36), w / 2, h * .62, h * .36, PAL.sumi); }, { anchor: 'center' }), 1.3, 1.7, -127.6);
    U.push(t => { const k = t - (K.nggak - .2 + i * .09); pg.visible = k > 0 && k < 1.6; const kk = Math.max(0, k); pg.position.set(1.3 + kk * 2.2 + Math.sin(kk * 5 + i) * .3, 1.7 + kk * 1.6, -127.6 + kk * .8); pg.rotation.z = kk * 4 * (i % 2 ? 1 : -1); }); }
  stamp(add(seal(['TIDUR', '4 JAM'], { w: 1.3, h: 1.3, size: 44 }), -1.25, 2.9, -127.6), K.tidur + .05);
  add(P.hills(16, 2.2, PAL.greenD, 29, { bot: PAL.ochre }), 0, 0, -134);
  // ---- S7: kitchen, wife frying tempura ----
  add(P.kitchen(5, 3.2), 0, 0, -150.4);
  const wife = add(person({ kind: 'woman', coat: PAL.beniL, obi: PAL.prus, mouth: 'smile', arms: 'work' }), -.3, 0, -149.9); sway(wife, .02, 1.5);
  const wk = add(P.wok(1.2), .7, .95, -149.75);
  for (let i = 0; i < 6; i++) { const b = add(P.coin(.07, 300 + i), .35 + i * .1, 1.32, -149.7); b.material.color.set(0xfff6dc); U.push(t => { const k = (t * 1.6 + hash(i)) % 1; b.position.y = 1.3 + k * .3; b.scale.setScalar(1 - k * .7); }); }
  stamp(add(seal(['IDE!'], { w: 1.0, h: 1.0, size: 64 }), 1.05, 2.4, -149.6), K.tempura + .1, { rot: .1 });
  pop(add(board(['TEMPURA'], { w: 1.3, h: .38, bg: PAL.ochre }), .7, .45, -149.6), K.tempura - .15);
  // ---- S8: flash-fry macro + hot water ----
  add(cut(2.9, 1.1, (g, w, h) => { g.fillStyle = PAL.sumi; g.beginPath(); g.ellipse(w / 2, h * .28, w * .49, h * .22, 0, 0, 7); g.fill(); g.fillStyle = PAL.oil; g.beginPath(); g.ellipse(w / 2, h * .3, w * .45, h * .18, 0, 0, 7); g.fill();
    g.fillStyle = PAL.sumi; g.beginPath(); g.moveTo(0, h * .28); g.bezierCurveTo(w * .05, h, w * .95, h, w, h * .28); g.ellipse(w / 2, h * .28, w * .5, h * .22, 0, 0, Math.PI); g.fill(); }), 0, -.05, -160.3);
  for (let i = 0; i < 8; i++) { const b = add(P.coin(.06, 600 + i), -1 + i * .28, .3, -160.25); b.material.color.set(0xfff6dc); U.push(t => { const k = (t * 1.8 + hash(i)) % 1, hot = t > K.mie2 + .4 && t < K.tinggal; b.visible = hot; b.position.y = .25 + k * .4; b.scale.setScalar((1 - k * .7) * (1.5)); }); }
  const nb = add(P.noodleBlock(1.0), 0, 4, -160.2);
  U.push(t => { const a = prog(t, K.mie2 - .1, K.mie2 + .55, ease.out), b = prog(t, K.tinggal - .2, K.tinggal + .45, ease.inOut);
    nb.position.set(lerp(0, -.6, b), lerp(lerp(4, .3, a), .75, b) + (a >= 1 && b <= 0 ? Math.sin(t * 30) * .02 : 0), -160.2 + b * .6); nb.visible = t > K.mie2 - .15 && t < K.seduh + 2; nb.scale.setScalar(lerp(1, .55, b)); });
  for (let i = 0; i < 12; i++) { const d = add(P.drop(.16, 400 + i), 0, 1, -160.1); const vx = (hash(i) - .5) * 2.8, vy = 3 + hash(i + 1) * 2;
    U.push(t => { const k = t - (K.air + i * .03); d.visible = k > 0 && k < 1.2; const kk = Math.max(0, k); d.position.set(vx * kk, .7 + vy * kk - 5 * kk * kk, -160.1); d.rotation.z = Math.atan2(-vx, vy - 10 * kk); }); }
  pop(add(board(['AIRNYA KELUAR'], { w: 1.8, h: .4, bg: PAL.prus }), -.15, 2.75, -160.0), K.air, { t1: K.tinggal - .2 });
  stamp(add(seal(['AWET'], { w: .9, h: .5, size: 40 }), .8, 2.05, -160.0), K.awet - .05, { t1: K.tinggal - .2 });
  pop(add(P.bowl(1.2, .85, { noodles: false, col: PAL.white, col2: PAL.beni }), -.6, .1, -159.5), K.tinggal - .3);
  const kt = add(P.kettle(1.0), 1.4, 2.4, -159.3); const stream = add(cut(.07, 1.3, (g, w, h) => { g.fillStyle = PAL.prusL; g.fillRect(0, 0, w, h); }, { edgeW: 3, shadow: false }), .2, 1.1, -159.4);
  U.push(t => { const a = prog(t, K.seduh - .35, K.seduh, outB); kt.visible = a > .01; kt.scale.setScalar(Math.max(.001, a)); kt.rotation.z = lerp(0, .7, prog(t, K.seduh, K.seduh + .3)); kt.position.set(lerp(1.8, .45, a), 2.15, -159.3);
    const s = prog(t, K.seduh + .25, K.seduh + .45); stream.visible = s > .01 && t < K.y58 - .2; stream.scale.set(1, Math.max(.001, s), 1); stream.position.set(-.45 + Math.sin(t * 20) * .01, 1.95 - 1.3 * s, -159.35); });
  const st2 = add(P.steam(.9, 1.4, 50), -.6, .95, -159.6); U.push(t => { const k = prog(t, K.seduh + .6, K.seduh + 1.2); st2.visible = k > .01; st2.scale.set(1, Math.max(.001, k), 1); });
  // ---- S9: 1958 dawn, the world's first ----
  SUN = add(P.sun(7), 0, -5, -200); SUN.renderOrder = -1;
  U.push(t => { const k = prog(t, K.y58 - .4, K.y58 + 1.6, ease.out); SUN.position.y = lerp(-4.5, 4.6, k); SUN.visible = t > K.y58 - .5 && t < K.m123 + 2; });
  add(P.hills(24, 2.4, PAL.prus, 41, { bot: PAL.prusL }), 0, 0, -186); add(P.mist(22, 1.1, 5, .8), 0, .5, -184);
  stamp(add(seal(['1958'], { w: 1.5, h: .85, size: 66 }), -.45, 3.0, -178.6, .62), K.y58);
  pop(add(board([['MIE INSTAN', PAL.white], ['PERTAMA DI DUNIA', PAL.ochreL]], { w: 1.9, h: .72, bg: PAL.beni, size: 27 }), .05, 2.45, -178.8), K.lahir - .05);
  const old = pop(add(person({ coat: PAL.prus, glasses: true, mouth: 'open', arms: 'cheer' }), 1.25, 0, -178.0), K.umurnya - .4);
  U.push(t => { if (t > K.n48) old.position.y = Math.abs(Math.sin((t - K.n48) * 7)) * .18 * Math.exp(-(t - K.n48) * 1.5); });
  stamp(add(seal(['UMUR', '48'], { w: 1.0, h: 1.0, size: 40 }), 1.95, 1.95, -177.8), K.n48);
  for (let i = 0; i < 9; i++) { const pk = add(P.packet(.55, 500 + i), 6, 0, -178.9); PACKS.push(pk);
    U.push(t => { const k = t - (K.y58 + 1.2 + i * .22); pk.visible = k > 0; const x = 5 - k * 2.4; pk.position.set(Math.max(-5 + i * 0, x), Math.abs(Math.sin(k * 9)) * .12, -178.9 - (i % 2) * .15); pk.rotation.z = Math.sin(k * 9) * .08; }); }
  // ---- S10: the world from above — a sea of bowls + Indonesia #2 ----
  const smallBowl = P.bowl(1.1, .75, { noodles: true }); const sbm = smallBowl.material, sbg = smallBowl.geometry;
  for (let i = 0; i < 520; i++) { const m = new THREE.Mesh(sbg, sbm); const x = -13 + (i % 26) * 1.05 + (hash(i) - .5) * .3, z = -186 - Math.floor(i / 26) * 1.15 + (hash(i + 9) - .5) * .3;
    if (x > 3.5 && z < -199) continue; m.rotation.x = -Math.PI / 2; m.position.set(x, .02, z); S.add(m);
    U.push(t => { const k = prog(t, K.skrg - .3 + (Math.abs(x) * .05 + (-186 - z) * .04) * .5, K.skrg + .3 + (Math.abs(x) * .05 + (-186 - z) * .04) * .5, outB); m.visible = k > .01; m.scale.setScalar(Math.max(.001, k)); }); }
  const isl = add(P.islands(7), 8.5, .05, -206); isl.rotation.x = -Math.PI / 2;
  const pin = add(seal(['#2'], { w: .9, h: .9, size: 70 }), 6.4, 0, -205.4); pin.rotation.x = -.6; stamp(pin, K.indo + .15);
  // ---- S11: the hill again — at dawn ----
  const sun2 = add(P.sun(9), 0, 4.2, -262); sun2.renderOrder = -1; U.push(t => { sun2.visible = t > K.skrg; });
  add(P.hills(30, 3, PAL.prus, 61, { bot: PAL.prusL }), 0, 0, -252); add(P.mist(26, 1.4, 6, .85), 0, 1.4, -250);
  add(P.hill(9, 1.25, 66, PAL.green), 0, 0, -240.3);
  const fin = add(person({ coat: PAL.prus, glasses: true, mouth: 'smile', arms: 'cheer' }), 0, 1.0, -240.1, 1.05); sway(fin, .02, 1.3);
  stamp(add(seal(['47'], { w: 1.15, h: 1.15, size: 86 }), -.8, 1.75, -239.3, .7), K.n47b);
  drop(add(board([['LO MASIH', PAL.white], ['NGERASA TELAT?', PAL.ochreL]], { w: 2.3, h: .85, bg: PAL.sumiL, size: 29 }), 0, 3.0, -239.4), K.lo - .05, { h: 2.4 });
}

// ---------------- sky (2D, direction space) ----------------
const SKY = [ // [z, top, bottom]
  [8, '#152238', '#58697c'], [-12, '#24406a', '#d9b98c'], [-30, '#3b5a82', '#e8cfa0'], [-42, '#1c2433', '#56606a'], [-58, '#7d93a3', '#eadcc0'],
  [-80, '#7d93a3', '#eadcc0'], [-90, '#0f1a2c', '#3e4e66'], [-112, '#0f1a2c', '#3e4e66'], [-122, '#3b5a82', '#e3c89a'], [-142, '#b85a34', '#f0d39a'],
  [-166, '#8a4a3c', '#efcf98'], [-172, '#c7503a', '#f6d79e'], [-190, '#8fb2c8', '#f3e6c4'], [-215, '#8fb2c8', '#f3e6c4'], [-228, '#d6603c', '#f8e0a6'],
];
const hx = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
const mixc = (a, b, k) => { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
function skyAt(z, t) {
  let i = 0; while (i < SKY.length - 2 && z < SKY[i + 1][0]) i++;
  const a = SKY[i], b = SKY[i + 1], k = ease.inOut(clamp((a[0] - z) / (a[0] - b[0])));
  let top = mixc(a[1], b[1], k), bot = mixc(a[2], b[2], k);
  if (t > K.setahun - .2 && t < K.tidur + .9) { const d = .5 + .5 * Math.cos((t - K.setahun) * Math.PI * 2 / .5); top = mixc('#0f1a2c', '#5b86b0', d); bot = mixc('#34405a', '#f0dcae', d); }
  return [top, bot];
}
function sky(g, t, c) {
  const [top, bot] = skyAt(c.p[2], t);
  const gr = g.createLinearGradient(0, 0, 0, H * .75); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // wiped bokashi bands
  g.save(); g.globalAlpha = .18; g.fillStyle = top; for (let i = 0; i < 4; i++) { const y = 120 + i * 150 + Math.sin(i * 2.1) * 30; g.beginPath(); g.roundRect(-40 + i * 60, y, W + 80, 26 + i * 6, 14); g.fill(); } g.restore();
  // time-lapse sun/moon over the shed
  if (t > K.setahun - .2 && t < K.tidur + .9) { const ph = ((t - K.setahun) / .5) % 1, x = lerp(-80, W + 80, ph), y = 520 - Math.sin(ph * Math.PI) * 330;
    const day = .5 + .5 * Math.cos((t - K.setahun) * Math.PI * 2 / .5); g.fillStyle = day > .5 ? PAL.beni : PAL.white; g.beginPath(); g.arc(x, y, 58, 0, 7); g.fill(); }
  // moon in the night sections
  const z = c.p[2]; const night = (z > -8 ? 1 : 0) * (1 - prog(t, 4, 7));
  if (night > .01) { g.fillStyle = `rgba(248,241,223,${.9 * night})`; g.beginPath(); g.arc(800, 360, 70, 0, 7); g.fill(); }
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
const KEY = new Set(['47', 'bangkrut', 'dipenjara', 'semalam', 'momofuku', 'ando', 'yatim', 'piatu', '1948', 'dua', 'pajak', 'habis', 'sewaan', 'ramen', 'dingin', 'setahun', 'libur', 'empat', 'tempura', 'kilat', 'awet', 'panas', '1958', 'pertama', '48', '123miliar', 'indonesia', 'nol', 'telat', 'antre', 'gubuk']);
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
function dayCounter(g, t) {
  const a = prog(t, K.setahun - .2, K.setahun + .1) * (1 - prog(t, K.tidur + .7, K.tidur + .9)); if (a < .01) return;
  const n = Math.min(365, Math.max(1, Math.round(365 * clamp((t - K.setahun) / (K.tidur - K.setahun))))); counter(g, t, K.setahun - .2, K.tidur + .7, `HARI ${n}`, 'TANPA LIBUR', 330);
}
function rain(g, t, a, snow) { if (a < .01) return; g.save(); g.globalAlpha = a;
  if (!snow) { g.strokeStyle = 'rgba(230,236,240,.55)'; g.lineWidth = 2.2; for (let i = 0; i < 160; i++) { const x = (hash(i) * W * 1.3 + t * 260) % (W * 1.3) - 100, y = (hash(i + 7) * H + t * 2100 * (.8 + hash(i) * .4)) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 16, y - 110); g.stroke(); } }
  else { g.fillStyle = PAL.white; for (let i = 0; i < 140; i++) { const x = (hash(i) * W + Math.sin(t * 1.5 + i) * 30), y = (hash(i + 3) * H + t * (120 + hash(i) * 120)) % H, r = 3 + hash(i + 9) * 6; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }
  g.restore(); }
function paperWipe(g, t, t0) { const k = prog(t, t0 - .25, t0, ease.in) * (1 - prog(t, t0, t0 + .3, ease.out)); if (k < .01) return; g.save(); g.globalAlpha = k; g.fillStyle = PAL.white; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'multiply'; g.fillStyle = WPAT; g.fillRect(0, 0, W, H); g.restore(); }
function finish(g, t) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .22; g.fillStyle = WPAT; g.translate((Math.floor(t * 12) % 2) * 3, 0); g.fillRect(-10, 0, W + 20, H); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .5, H * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,24,12,.4)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  // print border
  g.strokeStyle = PAL.sumi; g.lineWidth = 6; g.strokeRect(22, 22, W - 44, H - 44); g.lineWidth = 2; g.strokeRect(34, 34, W - 68, H - 68);
}
function overlay(g, t) {
  if (!WPAT) { WPAT = g.createPattern(washi(), 'repeat'); chunks(); }
  rain(g, t, 1 - prog(t, K.tapi - .3, K.tapi + .4), false);
  rain(g, t, prog(t, K.tapi2, K.tapi2 + .4) * (1 - prog(t, K.jadi2 - .2, K.jadi2 + .3)), true);
  paperWipe(g, t, K.tapi2 + .1);
  paperWipe(g, t, K.mie2 - .05);
  dayCounter(g, t);
  counter(g, t, K.m123 - .05, K.indo - .25, '123 MILIAR', 'PORSI MIE INSTAN / TAHUN', 330);
  counter(g, t, K.indo + .1, K.mulai - .1, '#2 DUNIA', 'INDONESIA · 14,7 MILIAR PORSI', 330);
  chip(g, t);
  captions(g, t);
  finish(g, t);
}

startToon({ build, draw: world, overlay, blurSamples: 2, shutter: .5 });
