// "Prancis bayar warga Hanoi buat bunuh tikus" — toon v2 story reel (cobra effect, Hanoi 1902).
import { W, H, C, clamp, lerp, ease, prog, hash, wobble, T, track, blob, inkFill, wline, rrect, boilText, captions, startToon } from '../../vendor/toon.js';
import { twos, easeX, antic, take, arrive, leave, burst, dust, shadow, speedLines, paperFinish, slamLine, camVel, kick, impactOn } from '../../vendor/toon2.js';
import { rat, tailProp, pejabat, pemburu, coin, villa, pipeH, board, stamp, barn, fence, desk, scissors, sack, RAT } from './cast.js';

const blinkAt = (t, seed) => { const p = (t + seed * 1.7) % 3.3; return p < .12 ? Math.abs(p - .06) / .06 : 1; };
const idle = (t, k = 1) => Math.sin(t * 2.4) * .03 * k;
let ST = null;

// ---------------- stations + camera ----------------
function stations() {
  if (ST) return ST;
  ST = [
    { x: 0, y: -360, z: 1.5, a: 0 },
    { x: 1700, y: -300, z: 1.1, a: T('awalnya') - .25 },
    { x: 3400, y: -360, z: 1.45, a: T('jadi') - .25 },
    { x: 5100, y: -380, z: 1.4, a: T('akhirnya') - .25 },
    { x: 6800, y: -360, z: 1.45, a: T('sampai') - .22 },
    { x: 8500, y: -400, z: 1.4, a: T('ternyata', 2) - .25 },
    { x: 10200, y: -400, z: 1.3, a: T('pinggir') - .4 },
    { x: 11900, y: -420, z: 1.3, a: T('programnya') - .25 },
    { x: 13600, y: -420, z: 1.3, a: T('pelajarannya') - .25 },
  ];
  return ST;
}
let KEYS = null;
function camKeys() {
  if (KEYS) return KEYS;
  const S = stations(), k = [];
  S.forEach((s, i) => {
    const n = S[i + 1];
    k.push({ t: s.a + (i ? .02 : 0), x: s.x, y: s.y, z: s.z, r: 0, e: i ? ease.inOutExpo : ease.lin });
    if (i === 0) k[0] = { t: 0, x: -40, y: -380, z: 2.3, r: -.04 };          // open already moving
    if (i === 0) k.push({ t: .45, x: s.x, y: s.y, z: s.z, r: 0, e: easeX.land });
    k.push({ t: s.a + .32, x: s.x + 8, y: s.y, z: s.z + .01, r: .004, e: ease.out });   // settle
    if (n) {
      k.push({ t: n.a - .5, x: s.x + 30, y: s.y - 10, z: s.z + .07, r: .01 });            // slow push: never dead
      k.push({ t: n.a - .34, x: s.x - 60, y: s.y - 8, z: s.z + .05, r: .03, e: ease.out }); // anticipation lean
    } else k.push({ t: 52.5, x: s.x + 30, y: s.y - 20, z: s.z + .12, r: .01 });
  });
  KEYS = k; return k;
}
const cam = t => track(camKeys(), t);
const hits = () => [[T('bayar') + .02, 10], [T('banyak') + .02, 18], [T('20.000'), 26], [T('sen'), 16], [T('tanpa') + .3, 22],
  [T('dipotong') + .1, 18], [T('nemu'), 16], [T('distop'), 30], [T('produksi'), 20], [T('selokan') + .1, 8], [T('pemburu'), 14]];

function ground(g, x0, x1) {
  g.lineWidth = 8; g.strokeStyle = C.ink; g.lineCap = 'round';
  wline(g, [[x0, 0], [x0 + (x1 - x0) * .33, 2], [x0 + (x1 - x0) * .66, -1], [x1, 0]], 900); g.stroke();
  g.lineWidth = 5; const i0 = Math.floor((x0 + 1200) / 220);
  for (let i = i0; i < i0 + (x1 - x0) / 220; i++) { const x = -1200 + 60 + i * 220 + hash(i) * 80; g.beginPath(); g.moveTo(x, 28 + hash(i + 3) * 30); g.lineTo(x + 40 + hash(i + 7) * 40, 28 + hash(i + 3) * 30); g.stroke(); }
}
// a rat that crosses from xa to xb between ta and tb (runs on twos)
function runner(g, tc, ta, tb, xa, xb, y, s, seed, o = {}) {
  if (tc < ta || tc > tb) return;
  const k = (tc - ta) / (tb - ta), x = lerp(xa, xb, o.e ? o.e(k) : k);
  rat(g, x, y, { s, dir: xb > xa ? 1 : -1, run: tc * 26 + seed, ...o }, seed);
}

// ---------------- A: hook ----------------
function stA(g, t, tc) {
  const tb = T('bayar'), tt = T('tikus'), th = T('hasilnya'), tm = T('malah'), tbn = T('banyak');
  const hop = antic(tc, tb, .7, .16, .28), tk = take(tc, tm, 1.2);
  const shock = prog(tc, tm - .05, tm + .1);
  const flip = prog(t, tb, tb + .6, ease.lin);
  const hr = { x: lerp(40, 120, prog(tc, tb - .1, tb + .1)), y: lerp(90, -150, easeX.snap(prog(tc, tb - .05, tb + .3, ease.lin))) };
  shadow(g, -180, 0, 120, -hop.dy);
  pejabat(g, { x: -180, y: hop.dy, s: 1.02, sq: hop.sq + tk + Math.sin(tc * 3) * .01, tilt: idle(tc) - shock * .12 + wobble(tc, tb, .08, 1.8, 5),
    lean: -shock * .1, hlx: lerp(-40, -150, shock), hly: lerp(90, -120, shock), hrx: lerp(hr.x, 160, shock), hry: lerp(hr.y, -140, shock),
    eyes: shock > .5 ? 'wide' : (tc > th && tc < tm ? 'happy' : 'dot'), blink: blinkAt(tc, 1), mouth: shock * .8, smile: .8,
    lookX: tc > tt - .4 && tc < th ? .8 : (shock > .5 ? .5 : .2), lookY: shock * .2, brow: shock > .5 ? 1 : 0 }, 11);
  // coin flips up from his hand (camera-rate spin)
  if (flip > 0 && flip < 1) { const cx = -180 + (60 + 120) * 1.02 + flip * 200, cy = -360 - Math.sin(flip * Math.PI) * 380 + flip * 300; coin(g, cx, cy, 44, t * 22); }
  // the first rat pops up on "tikus"
  const R = arrive(t, tt - .06, .25, 1.8);
  if (R.on) { const sq = .2 * Math.exp(-8 * (tc - tt)) * Math.cos((tc - tt) * 24);
    rat(g, 200, 0, { s: 1.25 * R.s * .8 + .25, dir: -1, sq, look: Math.sin(tc * 3) * .1, eyes: shock > .5 ? 'happy' : 'dot', happy: tc > th }, 3); dust(g, tc, tt, 200, 0, 6, .7); }
  // then they multiply: pop pop pop
  for (let i = 0; i < 11; i++) {
    const ti = tm + i * .065, A = arrive(t, ti, .22, 2.2); if (!A.on) continue;
    const x = -20 + (hash(i * 3) - .2) * 560, y = -hash(i * 5 + 1) * 40 + (i > 6 ? -420 - hash(i) * 260 : 0), s = (.55 + hash(i + 9) * .35) * A.s * .6 + .2;
    if (i > 6) { burst(g, t, ti, x, y - 30, 120, C.ink, 10); }
    rat(g, x, y, { s, dir: hash(i) > .5 ? 1 : -1, run: i > 6 ? null : tc * 20 + i, eyes: 'dot', happy: true, sq: wobble(tc, ti, .15, 2, 6) }, 40 + i);
  }
  if (tbn) burst(g, t, tbn, 60, -260, 340, C.orange, 16);
}

// ---------------- B: sewer under the city ----------------
function stB(g, t, tc) {
  const X = 1700, ts = T('selokan'), tsg = T('surga'), tn = T('naik'), tsl = T('saluran'), tms = T('masuk'), tk = T('kaya');
  // underground band
  g.save(); g.fillStyle = '#E3D6C1'; g.fillRect(X - 1000, 8, 2000, 700); g.restore();
  g.fillStyle = '#CDBEA6'; for (let i = 0; i < 30; i++) { const x = X - 900 + hash(i) * 1800, y = 60 + hash(i + 3) * 520; blob(g, x, y, 10 + hash(i + 5) * 18, 8 + hash(i + 7) * 10, 300 + i, 10, .8); g.fill(); }
  villa(g, X + 150, 0, 600, 560, 2);
  // chandelier glow in a window when rats arrive
  const pk = prog(tc, ts, ts + .6, ease.out);
  pipeH(g, X - 640, X + 340, 230, 78, pk);
  // vertical pipe up into the villa
  const vk = prog(tc, ts + .4, ts + .8, ease.out);
  if (vk > 0) { g.save(); rrect(g, X + 250, 230 - 240 * vk, 90, 240 * vk + 40, 30); inkFill(g, '#6F7C86', 8); g.restore(); }
  // label chip
  const L = arrive(t, ts + .1, .25, 2);
  if (L.on && tc < tsg + .2) { g.save(); g.translate(X - 300, 420); g.scale(L.s, L.s); rrect(g, -210, -40, 420, 80, 40); inkFill(g, C.ink, 4);
    g.fillStyle = C.white; g.font = `900 40px ${C.font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SELOKAN BARU', 0, 3); g.restore(); }
  // rats in the pipe: party in paradise
  const n = Math.floor(prog(tc, tsg - .3, tsg + .6, ease.lin) * 7);
  for (let i = 0; i < n; i++) {
    const x = X - 560 + i * 120 + Math.sin(tc * 3 + i) * 18, j = Math.abs(Math.sin(tc * 9 + i * 1.3)) * -16;
    rat(g, x, 280 + j, { s: .5, dir: i % 2 ? 1 : -1, eyes: 'happy', happy: true, run: tc * 14 + i }, 60 + i);
  }
  if (tc > tsg && tc < tn + .4) for (let i = 0; i < 6; i++) { // hearts
    const p = ((tc - tsg) * .8 + i / 6) % 1, x = X - 520 + i * 160, y = 220 - p * 120;
    g.save(); g.globalAlpha = Math.sin(p * Math.PI); g.translate(x, y); g.scale(.9, .9); g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-26, -14, -12, -34, 0, -18); g.bezierCurveTo(12, -34, 26, -14, 0, 8); inkFill(g, C.red, 4); g.restore();
  }
  // up the pipe and into the house
  for (let i = 0; i < 5; i++) {
    const t0 = tn + i * .22, k = prog(tc, t0, t0 + .7, ease.inOut); if (k <= 0) continue;
    if (k < 1) { const y = lerp(230, -40, k); g.save(); g.translate(X + 295, y); g.rotate(-Math.PI / 2); rat(g, 0, 18, { s: .42, run: tc * 30 + i }, 70 + i); g.restore(); }
  }
  // rats popping out of the villa windows
  const win = [[-125, -470], [75, -470], [275, -470], [-125, -260], [75, -260], [275, -260]];
  win.forEach(([wx, wy], i) => {
    const t0 = tms + i * .12, A = arrive(t, t0, .22, 2); if (!A.on) return;
    burst(g, t, t0, X + wx + 0, wy + 60, 110, C.ink, 8);
    rat(g, X + wx - 10, wy + 120, { s: .55 * A.s * .7 + .1, dir: i % 2 ? 1 : -1, stand: .55, wave: tc * 12 + i, eyes: 'happy', happy: true }, 80 + i);
  });
  if (tk) { const k = prog(tc, tk, tk + .3); if (k > 0) { g.save(); g.globalAlpha = k; g.font = `900 120px ${C.font}`; g.fillStyle = C.gold; g.strokeStyle = C.ink; g.lineWidth = 10; g.textAlign = 'center';
    for (let i = 0; i < 3; i++) { const yy = -740 - ((tc - tk) * 140 + i * 60) % 180; g.strokeText('$', X + 40 + (i - 1) * 220, yy); g.fillText('$', X + 40 + (i - 1) * 220, yy); } g.restore(); } }
}

// ---------------- C: hired rat catchers ----------------
function stC(g, t, tc) {
  const X = 3400, tp = T('pemburu'), ts = T('sehari'), tn = T('20.000'), ttp = T('tapi');
  const fall = prog(tc, tp - .26, tp, ease.in);
  if (fall <= 0) return;
  const tired = prog(tc, ttp, ttp + .5);
  const yy = lerp(-1400, 0, fall), sq = tc >= tp ? .2 * Math.exp(-8 * (tc - tp)) * Math.cos((tc - tp) * 24) + tired * .06 : -.16 * fall;
  const fillK = prog(tc, ts, tn + .4, ease.inOut);
  shadow(g, X - 200, 0, 110, -yy);
  pemburu(g, { x: X - 200, y: yy, s: 1, sq, tilt: idle(tc) + tired * .14 + Math.sin(tc * 7) * .03 * tired, lean: tired * .14,
    hlx: lerp(-30, 120, prog(tc, tp + .3, tp + .5)) , hly: lerp(-160, 60, prog(tc, tp, tp + .4)), hrx: lerp(160, 140, tired), hry: lerp(-150, 70, prog(tc, tp + .4, tp + .7)),
    eyes: tired > .5 ? 'shut' : 'dot', brow: tired > .3 ? 1 : 0, blink: blinkAt(tc, 3), mouth: tired * .45, smile: lerp(.8, -.6, tired), lookX: .6 }, 21);
  dust(g, tc, tp, X - 200, 0, 7, .9);
  sack(g, X + 20, 0, fillK, 3);
  // sweat
  if (tired > .2) for (let i = 0; i < 3; i++) { const p = ((tc - ttp) * 1.6 + i / 3) % 1; g.save(); g.globalAlpha = 1 - p; g.translate(X - 200 + 110 + i * 26, -470 + p * 90); blob(g, 0, 0, 9, 14, 500 + i, 10, .5); inkFill(g, '#9FD3F0', 3); g.restore(); }
  // rats get herded into the sack, then they never stop coming
  for (let i = 0; i < 9; i++) runner(g, tc, ts + i * .16, ts + i * .16 + .55, X + 560, X + 40, 0, .55, 100 + i, { eyes: 'wide', e: ease.in });
  for (let i = 0; i < 26; i++) runner(g, tc, ttp - .2 + i * .09, ttp - .2 + i * .09 + 1.2, X + 600, X - 700, -hash(i) * 30, .45 + hash(i + 1) * .25, 140 + i, { happy: true, eyes: 'happy' });
}

// ---------------- D: plan B, 1 tail = 1 cent ----------------
function stD(g, t, tc) {
  const X = 5100, tpb = T('plan'), tsi = T('siapa'), tst = T('setor'), tdb = T('dibayar'), tsen = T('sen'), tnp = T('numpuk'), tsg = T('seneng'), tpj = T('pejabatnya');
  // poster on a wall
  const P = arrive(t, tsi - .05, .3, 2.2);
  if (P.on) board(g, X + 170, -660, 400, 420, 'DICARI:', [['EKOR', 84, C.ink, 175], ['TIKUS', 84, C.ink, 255], ['1 EKOR = 1 SEN', 38, C.red, 340]], { s: P.s * .82, rot: .04 + wobble(t, tsi, .05, 1.4, 3), ts: 56 });
  if (tc > tsen - .1) coin(g, X + 290, -520, 50 + wobble(t, tsen, 14, 2, 5), t * 3 + Math.PI / 2, '1¢');
  desk(g, X + 40, 0, 460);
  // tail pile on the desk
  const nTails = Math.floor(prog(tc, tst, tnp + .7, ease.in) * 46);
  for (let i = 0; i < nTails; i++) {
    const land = tst + (tnp + .7 - tst) * Math.pow((i + 1) / 46, 1 / 2.2) * 1, dropK = clamp((tc - land + .25) / .25);
    const px = X + 40 + (hash(i * 7) - .5) * 300 * (1 - i / 80), py = -175 - Math.floor(i / 7) * 18 - hash(i) * 10;
    tailProp(g, px - 40, lerp(py - 500, py, easeX.land(dropK)), (hash(i + 2) - .5) * 2.4, .9, i);
  }
  const happy = prog(tc, tsg - .1, tsg + .1), hop = antic(tc, tsg + .05, .8, .16, .3);
  shadow(g, X - 250, 0, 110, -hop.dy);
  pejabat(g, { x: X - 250, y: hop.dy, s: .95, sq: hop.sq + Math.sin(tc * 3) * .01, tilt: idle(tc) + happy * Math.sin(tc * 10) * .06, lean: .05,
    hlx: lerp(-30, -150, happy), hly: lerp(90, -150, happy), hrx: lerp(60, 150, happy), hry: lerp(60, -160, happy), eyes: happy > .5 ? 'happy' : 'dot',
    blink: blinkAt(tc, 4), mouth: happy * .7 + (tc > tpb && tc < tpb + .5 ? .4 : 0), smile: .9, lookX: tc < tnp ? .9 : .4, lookY: tc > tnp && tc < tsg ? .5 : 0 }, 12);
  if (happy > .5) for (let i = 0; i < 4; i++) { const p = ((tc - tsg) * 1.2 + i / 4) % 1; g.save(); g.globalAlpha = Math.sin(p * Math.PI); g.translate(X - 250 + (i - 1.5) * 90, -620 - p * 140);
    g.beginPath(); g.moveTo(0, 10); g.bezierCurveTo(-30, -16, -14, -40, 0, -20); g.bezierCurveTo(14, -40, 30, -16, 0, 10); inkFill(g, C.red, 4); g.restore(); }
}

// ---------------- E: tailless rats ----------------
function stE(g, t, tc) {
  const X = 6800, tl = T('larilari'), ttn = T('tanpa'), te = T('ekor', 4);
  const tk = take(tc, ttn + .25, 1.3), wide = prog(tc, ttn + .2, ttn + .3);
  pejabat(g, { x: X - 250, y: 0, s: .95, sq: tk, tilt: idle(tc) - wide * .1, lean: -wide * .12, hlx: lerp(-40, -110, wide), hly: lerp(90, -60, wide), hrx: lerp(40, 110, wide), hry: lerp(90, -60, wide),
    eyes: wide > .5 ? 'wide' : 'dot', brow: wide > .5 ? 1 : 0, blink: blinkAt(tc, 5), mouth: wide * .9, smile: 0, lookX: .9 }, 13);
  // the rat runs in, skids, looks at us
  const runK = prog(tc, tl - .5, ttn + .05, ease.out);
  if (runK > 0) {
    const x = lerp(X + 700, X + 200, runK), skid = prog(tc, ttn - .1, ttn + .1);
    rat(g, x, 0, { s: 1.15, dir: -1, run: skid > .9 ? null : tc * 26, tail: false, sq: wobble(tc, ttn + .05, .12, 2, 5), look: skid > .9 ? -.2 : 0, eyes: 'dot' }, 7);
    if (skid > 0 && skid < 1) dust(g, tc, ttn - .05, x, 0, 6, .6);
  }
  const Q = arrive(t, ttn + .22, .2, 2.6);
  if (Q.on) { g.save(); g.translate(X - 60, -560); g.rotate(.12 + wobble(t, ttn + .22, .1, 2, 5)); g.scale(Q.s, Q.s); boilText(g, '?!', 0, 0, 200, C.orange, { stroke: 16 }); g.restore(); }
  // zoom circle on the missing tail
  const Z = prog(tc, te, te + .25, ease.out);
  if (Z > 0) { g.save(); g.lineWidth = 10; g.strokeStyle = C.red; g.setLineDash([26, 14]); g.beginPath(); g.arc(X + 200 + 75, -40, 90 * (1.6 - .6 * Z), 0, Math.PI * 2 * Z); g.stroke(); g.restore(); }
  // a second tailless rat crosses behind
  runner(g, tc, tl - .2, tl + 1.3, X - 800, X + 700, -230, .5, 9, { tail: false });
}

// ---------------- F: cut the tail, release, breed ----------------
function stF(g, t, tc) {
  const X = 8500, tdp = T('dipotong'), tdl = T('dilepas'), tbr = T('beranak'), tnb = T('nambah');
  const snip = prog(tc, tdp - .15, tdp, ease.in), snap = impactOn(t, tdp, 3);
  const drop = prog(tc, tdl - .05, tdl + .15, ease.in);
  pemburu(g, { x: X - 260, y: 0, s: 1, sq: take(tc, tdp, .5), tilt: idle(tc) + .06, lean: .04, hlx: 150, hly: -60 + drop * 40, hrx: lerp(170, 160, snip), hry: lerp(-120, -150, snip),
    eyes: tc > tdl ? 'happy' : 'dot', blink: blinkAt(tc, 6), mouth: 0, smile: tc > tdl ? .9 : .3, lookX: .8, lookY: .3 }, 22);
  // dangling rat held by the tail tip (left hand at ~ (X-260-60+150, -195-60))
  const hx = X - 260 - 60 + 150 + 20, hy = -255 + drop * 40;
  if (tc < tdl) {
    const sw = Math.sin(tc * 5) * .2 + wobble(tc, tdp, .4, 2, 4);
    g.save(); g.translate(hx, hy); g.rotate(sw);
    if (tc < tdp) { g.lineWidth = 7; g.strokeStyle = '#E58F8F'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(10, 60, 0, 120); g.stroke(); }
    else tailProp(g, -10, 0, 1.5, .9, 3);
    g.restore();
    const ry = tc < tdp ? hy + 120 : hy + 120 + 0;
    g.save(); g.translate(hx + Math.sin(sw) * 120, ry); g.rotate(Math.PI / 2 * (tc < tdp ? 1 : 1)); rat(g, 0, 0, { s: .75, tail: tc < tdp ? .01 : false, eyes: tc < tdp ? 'wide' : 'dot', run: tc * 30 }, 15); g.restore();
  } else {
    const k = prog(tc, tdl, tdl + 1.1, ease.in), x = lerp(hx + 20, X + 700, k), y = 0;
    if (k < 1) rat(g, x, y, { s: .8, tail: false, run: tc * 30, wink: k > .2 && k < .6, happy: true }, 15);
    if (k < .2) dust(g, tc, tdl + .15, hx + 20, 0, 5, .5);
  }
  scissors(g, X - 260 + 60 + 160 + 10, -195 - 150 + 20, snip > .95 ? 0 : (1 - snip) * .9 + Math.max(0, Math.sin(tc * 14)) * .1 * (tc < tdp - .3 ? 1 : 0), -.6, 1);
  if (snap) burst(g, t, tdp, hx + 8, hy + 40, 150, C.red, 12);
  // breeding: 1 -> 2 -> 4 -> 8 -> 16 (above, in the sky)
  const gens = [1, 2, 4, 8, 16];
  gens.forEach((n, gi) => {
    const t0 = tbr - .1 + gi * .2; if (tc < t0) return;
    const latest = gi === gens.length - 1 || tc < tbr - .1 + (gi + 1) * .2; if (!latest) return;
    for (let i = 0; i < n; i++) {
      const cols = Math.min(n, 4), row = Math.floor(i / cols), col = i % cols, A = arrive(t, t0 + i * .01, .18, 1.8);
      const x = X + 150 + (col - (cols - 1) / 2) * 96, y = -760 + row * 96 + Math.abs(Math.sin(tc * 8 + i)) * -10;
      rat(g, x, y, { s: .38 * A.s * .7 + .1, dir: i % 2 ? 1 : -1, happy: true, eyes: 'happy', tail: true }, 200 + i);
    }
    const B = arrive(t, t0, .2, 2.4);
    if (tc < tnb - .05) { g.save(); g.translate(X + 150, -400); g.scale(B.s * .6 + .4, B.s * .6 + .4); boilText(g, `×${n}`, 0, 0, 80, C.orange, { stroke: 12 }); g.restore(); }
  });
  const N = arrive(t, tnb, .25, 2.4);
  if (N.on) { g.save(); g.translate(X + 150, -400); g.scale(N.s * .8, N.s * .8); rrect(g, -200, -52, 400, 104, 52); inkFill(g, C.lime, 7); boilText(g, '+ EKOR', 0, 4, 66, C.ink); g.restore(); }
}

// ---------------- G: rat farm on the outskirts ----------------
function stG(g, t, tc) {
  const X = 10200, tpt = T('petugas'), tnm = T('nemu'), tpk = T('peternakan');
  barn(g, X + 150, 0, 5);
  fence(g, X - 120, X + 400, 0);
  for (let i = 0; i < 14; i++) { // rats behind the fence, bobbing
    const x = X - 100 + (i % 7) * 78 + (i > 6 ? 40 : 0), y = -(i > 6 ? 150 : 40) + Math.abs(Math.sin(tc * 7 + i)) * -14;
    rat(g, x, y, { s: .42, dir: i % 2 ? 1 : -1, happy: true, eyes: hash(i) > .5 ? 'happy' : 'dot', stand: i > 6 ? .4 : 0, wave: tc * 10 + i }, 300 + i);
  }
  const S = arrive(t, tpk - .02, .3, 2.4);
  if (S.on) { g.save(); g.translate(X + 150, -470); g.rotate(-.05 + wobble(t, tpk, .06, 1.6, 4)); g.scale(S.s, S.s); rrect(g, -250, -56, 500, 112, 16); inkFill(g, '#FFF6DE', 8);
    boilText(g, 'PETERNAKAN TIKUS', 0, 4, 46, C.red); g.restore(); }
  const walk = prog(tc, tpt - .4, tnm - .05, ease.out), shock = prog(tc, tnm - .05, tnm + .1);
  const x = lerp(X - 800, X - 270, walk), step = Math.sin(tc * 14) * (1 - shock) * (walk < 1 ? 1 : 0);
  pejabat(g, { x, y: Math.abs(step) * -10, s: .92, sq: take(tc, tnm, 1.3), tilt: idle(tc) - shock * .12, lean: -shock * .14 + step * .03, legL: step > 0 ? step * .3 : 0, legR: step < 0 ? -step * .3 : 0,
    hlx: lerp(-30, -130, shock), hly: lerp(90, -100, shock), hrx: lerp(40, 150, shock), hry: lerp(90, -130, shock), eyes: shock > .5 ? 'wide' : 'dot', brow: shock > .5 ? 1 : 0,
    blink: blinkAt(tc, 7), mouth: shock * 1, smile: 0, lookX: .9 }, 14);
}

// ---------------- H: programme scrapped; rats stay ----------------
function stH(g, t, tc) {
  const X = 11900, tps = T('programnya'), tds = T('distop'), ttt = T('tetep'), tsi = T('situ');
  board(g, X, -560, 620, 440, 'PROGRAM', [['HADIAH', 96, C.ink, 200], ['EKOR TIKUS', 72, C.ink, 300], ['1 EKOR = 1 SEN', 40, '#7C756C', 380]], { rot: -.02, ts: 60 });
  const S = arrive(t, tds - .08, .14, 3.2);
  if (S.on) { burst(g, t, tds + .03, X, -560, 380, C.red, 18); stamp(g, X, -540, 'DISTOP', 1, S.s, C.red, -.24, 120); }
  // rats lounging, one waves and winks
  const pos = [[-240, 0, 1], [-60, 0, -1], [160, 0, 1], [300, 0, -1], [-180, -800, 1], [210, -800, -1]];
  pos.forEach(([dx, dy, d], i) => {
    const t0 = ttt - .15 + i * .07, A = arrive(t, t0, .22, 1.8); if (!A.on) return;
    const wave = i === 2 && tc > tsi - .2;
    rat(g, X + dx, dy, { s: .7 * A.s * .7 + .2, dir: d, happy: true, eyes: i === 2 ? 'dot' : 'happy', wink: wave && tc > tsi, stand: wave ? .5 : 0, wave: tc * 14, sq: wobble(tc, t0, .1, 2, 5) }, 400 + i);
  });
}

// ---------------- I: the lesson ----------------
function stI(g, t, tc) {
  const X = 13600, tpl = T('pelajarannya'), tby = T('bayar', 2), tor = T('orang'), tpr = T('produksi');
  // a rat "factory": crank box producing tails on a conveyor
  const A = arrive(t, tpl + .1, .3, 2.2); if (!A.on) return;
  g.save(); g.translate(X - 200, 0); g.scale(.8 * (A.s * .8 + .2), .8 * (A.s * .8 + .2));
  rrect(g, -200, -360, 300, 360, 20); inkFill(g, '#7E8A94', 8);
  rrect(g, -160, -330, 220, 90, 14); inkFill(g, '#FFF6DE', 6); boilText(g, 'PABRIK', -50, -284, 44, C.ink);
  g.fillStyle = '#2C3338'; rrect(g, 100, -150, 60, 110, 8); g.fill();
  // chimney + smoke puffs
  rrect(g, -150, -470, 70, 120, 6); inkFill(g, '#6F7C86', 7);
  for (let i = 0; i < 4; i++) { const p = (tc * .6 + i / 4) % 1; g.save(); g.globalAlpha = (1 - p) * .9; blob(g, -115 + p * 60, -500 - p * 240, 30 + p * 40, 26 + p * 30, 600 + i, 14, 1.5); inkFill(g, '#EFE7D8', 4); g.restore(); }
  // conveyor
  rrect(g, 150, -60, 520, 40, 20); inkFill(g, '#3B3F46', 6);
  const speed = tc > tpr ? 3.2 : 1.1;
  for (let i = 0; i < 7; i++) { const p = ((tc - tpl) * speed * .35 + i / 7) % 1; tailProp(g, 170 + p * 480, -66, -.1, .7, i); }
  // crank rat
  rat(g, -260, 0, { s: .7, dir: 1, stand: .5, wave: tc * (tc > tpr ? 30 : 12), happy: true, eyes: 'happy' }, 500);
  g.restore();
  // last beat: a rat with a big tail bag winks at camera
  if (tc > tpr) { const B = arrive(t, tpr + .1, .25, 2); rat(g, X + 270, 0, { s: 1 * B.s * .6 + .4, dir: -1, wink: tc > tpr + .4, happy: true }, 501); }
}

const STN = [stA, stB, stC, stD, stE, stF, stG, stH, stI];

// skyline doodles (parallax .45) + Hanoi rooftops (parallax .2) behind the ground
function backdrop(g, c) {
  g.save(); g.translate(c.x * .45, c.y * .45); g.lineWidth = 5; g.strokeStyle = '#DCD2C1';
  const i0 = Math.floor((c.x * .55 - 1400) / 260);
  for (let i = i0; i < i0 + 14; i++) { const x = i * 260 + hash(i) * 120, y = -1500 + hash(i + 5) * 1000; g.beginPath(); g.arc(x, y, 18 + hash(i + 8) * 30, 0, 7); g.stroke(); }
  g.restore();
  g.save(); g.translate(c.x * .25, 0); g.fillStyle = '#E9DFCF'; g.strokeStyle = '#D5C8B4'; g.lineWidth = 5;
  const j0 = Math.floor((c.x * .75 - 1600) / 240);
  for (let j = j0; j < j0 + 16; j++) { const x = j * 240, h = 220 + hash(j) * 260, w = 200;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -h); g.lineTo(x + w / 2, -h - 70 - hash(j + 2) * 40); g.lineTo(x + w, -h); g.lineTo(x + w, 0); g.closePath(); g.fill(); g.stroke(); }
  g.restore();
}

function world(g, t) {
  const c = cam(t), kk = kick(t, hits());
  g.save(); g.translate(W / 2 + kk.x, H * .5 + kk.y); g.rotate(c.r); g.scale(c.z, c.z); g.translate(-c.x, -c.y);
  backdrop(g, c);
  g.fillStyle = C.paper; g.fillRect(c.x - 1600, 2, 3200, 1600);
  ground(g, c.x - 1500, c.x + 1500);
  const tc = twos(t);
  stations().forEach((s, i) => { if (Math.abs(c.x - s.x) < 1500) STN[i](g, t, tc); });
  g.restore();
}

// ---------------- screen-space overlay ----------------
function chip(g, label, x, y, dot = C.orange) {
  g.save(); g.font = `800 30px ${C.font}`; const w = g.measureText(label).width + 70;
  rrect(g, x, y, w, 62, 31); g.fillStyle = C.ink; g.fill(); g.fillStyle = dot; g.beginPath(); g.arc(x + 32, y + 31, 9, 0, 7); g.fill();
  g.fillStyle = C.white; g.textBaseline = 'middle'; g.fillText(label, x + 52, y + 32); g.restore();
}
function counter(g, t, t0, to, y, t1) { // rolling number from oversize
  const A = arrive(t, t0, .3, 2.4); if (!A.on) return; const out = leave(t, t1, .2); if (out >= .999) return;
  const v = Math.round(to * easeX.land(prog(t, t0, t0 + .55, ease.lin)));
  g.save(); g.translate(W / 2, y - out * 160); g.scale(A.s * (1 - out * .4), A.s * (1 - out * .4)); g.globalAlpha = 1 - out; g.rotate(-.03);
  g.font = `900 190px ${C.font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const s = v.toLocaleString('id-ID') + '+';
  g.fillStyle = C.ink; g.fillText(s, 9, 11); g.lineWidth = 18; g.strokeStyle = C.ink; g.strokeText(s, 0, 0); g.fillStyle = C.orange; g.fillText(s, 0, 0);
  g.font = `900 58px ${C.font}`; g.lineWidth = 12; g.strokeText('TIKUS / HARI', 0, 130); g.fillStyle = C.white; g.fillText('TIKUS / HARI', 0, 130);
  g.restore();
}
function overlay(g, t) {
  const c = cam(t), v = camVel(cam, t); speedLines(g, t, v.vx, v.vy);
  chip(g, 'HANOI · 1902', 56, 96);
  const W1 = (w, n = 1) => T(w, n) - .04;
  slamLine(g, t, 0, [['TAHUN', C.white], ['1902', C.orange]], 380, 150, { ts: [-.02, W1('1902')], t1: T('prancis') + .25 });
  slamLine(g, t, 0, [['BAYAR', C.white], ['BUAT', C.white], ['BUNUH', C.white], ['TIKUS', C.orange]], 330, 118, { ts: [W1('bayar'), W1('buat'), W1('bunuh'), W1('tikus')], t1: T('hasilnya') - .1 });
  slamLine(g, t, 0, [['TIKUSNYA', C.white], ['MAKIN', C.white]], 300, 118, { ts: [W1('tikusnya'), W1('makin')], t1: T('awalnya') - .35 });
  slamLine(g, t, 0, [['BANYAK!', C.orange]], 450, 170, { ts: [W1('banyak')], t1: T('awalnya') - .35, from: 3 });
  slamLine(g, t, 0, [['SURGA', C.white], ['TIKUS', C.orange]], 300, 130, { ts: [W1('surga'), W1('tikus', 2)], t1: T('naik') + .9 });
  counter(g, t, T('20.000') - .05, 20000, 380, T('tapi') - .2);
  if (t > T('20.000') && t < T('tapi') - .1) { g.save(); g.globalAlpha = prog(t, T('20.000') + .3, T('20.000') + .6); g.font = `700 28px ${C.font}`; g.fillStyle = 'rgba(27,24,23,.75)'; g.textAlign = 'center';
    g.fillText('● REKOR 1 HARI, JUNI 1902 (ARSIP KOLONIAL)', W / 2, 590); g.restore(); }
  slamLine(g, t, 0, [['GA', C.white], ['ABIS-ABIS', C.orange]], 330, 124, { ts: [W1('ga'), W1('abisabis')], t1: T('akhirnya') - .35 });
  slamLine(g, t, 0, [['PLAN', C.white], ['B', C.orange]], 300, 150, { ts: [W1('plan'), W1('b')], t1: T('siapa') + .2 });
  slamLine(g, t, 0, [['TANPA', C.white], ['EKOR', C.orange]], 300, 150, { ts: [W1('tanpa'), W1('ekor', 4)], t1: T('ternyata', 2) - .35 });
  slamLine(g, t, 0, [['BIAR', C.white], ['BERANAK', C.orange]], 235, 100, { ts: [W1('biar'), W1('beranak')], t1: T('pinggir') - .45 });
  slamLine(g, t, 0, [['TETEP', C.white], ['DI', C.white], ['SITU', C.orange]], 1180, 110, { ts: [W1('tetep'), W1('di', 3), W1('situ')], t1: T('pelajarannya') - .35 });
  slamLine(g, t, 0, [['BAYAR', C.white], ['BUKTI,', C.white]], 290, 124, { ts: [W1('bayar', 2), W1('buktinya')], t1: 60 });
  slamLine(g, t, 0, [['DAPAT', C.white], ['BUKTI', C.orange]], 440, 150, { ts: [W1('orang'), W1('buktinya', 2)], t1: 60 });
  if (t > T('produksi')) { g.save(); g.globalAlpha = prog(t, T('produksi'), T('produksi') + .2); g.font = `800 40px ${C.font}`; g.textAlign = 'center'; g.fillStyle = C.ink;
    g.fillText('(bukan hasilnya)', W / 2, 560); g.restore(); }
  captions(g, t);
  paperFinish(g, t);
}

startToon({ build: async () => {}, draw: (g, t) => world(g, t), overlay, blurSamples: 4 });
