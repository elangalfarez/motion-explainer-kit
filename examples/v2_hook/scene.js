// v2 hook (0-5.9 s of "Video ini gw buat pake Viktor"), rebuilt with the toon2 motion layer + one 3D hero.
import { W, H, C, clamp, lerp, ease, prog, hash, wobble, T, amp, track, blob, inkFill, wline, rrect, guy, card, boilText, captions, loadImg, startToon } from '../../vendor/toon.js';
import { twos, easeX, antic, take, arrive, leave, burst, dust, shadow, speedLines, paperFinish, slamLine, camVel, kick, impactOn } from '../../vendor/toon2.js';
import { Toon3D, priceTag } from '../../vendor/toon3d.js';

const IM = {}; let T3, TAG;
const blinkAt = (t, seed) => { const p = (t + seed * 1.7) % 3.1; return p < .12 ? Math.abs(p - .06) / .06 : 1; };

// ---------------- camera: on ONES, with anticipation before whips and a settle after ----------------
function cam(t) {
  const tD = T('dan'), tZ = T('zaman');
  const c = track([
    { t: 0, x: -60, y: -360, z: 2.6, r: -.05 },
    { t: .5, x: 20, y: -470, z: 1.3, r: 0, e: easeX.land },               // scene starts already moving
    { t: 1.84, x: 40, y: -480, z: 1.36, r: .01 },                          // slow push: never dead
    { t: 2.02, x: 60, y: -500, z: 1.44, r: .012, e: easeX.land },          // push on GRATIS impact
    { t: tD - .02, x: 50, y: -500, z: 1.45, r: .012 },
    { t: tD + .14, x: -40, y: -490, z: 1.40, r: .03, e: ease.out },        // anticipation: lean back the other way
    { t: tD + .52, x: 1520, y: -470, z: 1.28, r: -.02, e: ease.inOutExpo },// WHIP
    { t: tD + .9, x: 1500, y: -470, z: 1.3, r: 0, e: ease.out },           // settle
    { t: tZ - .3, x: 1500, y: -430, z: 1.36, r: .01 },
    { t: tZ + .12, x: 1530, y: -400, z: 1.44, r: .025, e: easeX.land },    // punch in on JADUL
    { t: 6.2, x: 1520, y: -395, z: 1.48, r: .02 },
  ], t);
  return c;
}
const hits = () => [[T('gratis'), 26], [T('zaman'), 30], [T('hermes') + .12, 10]];

function ground(g, x0, x1) {
  g.lineWidth = 8; g.strokeStyle = C.ink; g.lineCap = 'round';
  wline(g, [[x0, 0], [x0 + (x1 - x0) * .33, 2], [x0 + (x1 - x0) * .66, -1], [x1, 0]], 900); g.stroke();
  g.lineWidth = 5; const i0 = Math.floor((x0 + 1200) / 220);
  for (let i = i0; i < i0 + (x1 - x0) / 220; i++) { const x = -1200 + 60 + i * 220 + hash(i) * 80; g.beginPath(); g.moveTo(x, 28 + hash(i + 3) * 30); g.lineTo(x + 40 + hash(i + 7) * 40, 28 + hash(i + 3) * 30); g.stroke(); }
}

// ---------------- station A: elang + 3D GRATIS tag ----------------
const tagPose = t => { // drop, spin to face, pendulum, alive
  const tg = T('gratis'), t0 = tg - .34;
  const d = easeX.land(prog(t, t0, tg, ease.lin));
  const y = lerp(-2100, -590, d) + wobble(t, tg, 26, 2.2, 6);
  const spin = (1 - easeX.land(prog(t, t0, tg + .55, ease.lin))) * Math.PI * 4;
  const swing = wobble(t, tg, .32, 1.05, 1.5) + wobble(t, T('dan') + .3, -.22, 1.1, 2.2);
  return { y, spin, swing, on: t > t0 };
};
function stationA(g, t, tc) {
  const tb = T('terbaik'), tg = T('gratis'), tD = T('dan');
  // key poses with anticipation (pull down before the finger goes up), overshoot settle via snap ease
  const pre = prog(tc, tb - .16, tb, ease.out) * (1 - prog(tc, tb, tb + .05));
  const up = easeX.snap(prog(tc, tb, tb + .4, ease.lin)) * (1 - prog(tc, tg - .2, tg, ease.inOut));
  const tada = easeX.snap(prog(tc, tg, tg + .45, ease.lin));
  const hop = antic(tc, tg - .02, 1.1, .2, .3);
  const look = prog(tc, tg - .55, tg - .4, ease.out) * (1 - prog(tc, tg - .05, tg + .1)); // eyes lead: watch the tag fall
  const lookR = prog(tc, tD - .1, tD + .1, ease.out);                                     // eyes lead the whip
  const hr = { x: lerp(lerp(lerp(25, 10, pre), 55, up), 165, tada), y: lerp(lerp(lerp(95, 120, pre), -165, up), -80, tada) };
  const hl = { x: lerp(-25, -165, tada), y: lerp(95, -80, tada) };
  const headLag = wobble(tc, tb, .09, 1.8, 5) - wobble(tc, tg + .3, .1, 1.6, 5); // head follows the body late
  const y = hop.dy;
  shadow(g, -90, 0, 120, -y);
  guy(g, { kind: 'elang', x: -90, y, s: 1.05, sq: Math.sin(tc * 3) * .012 + hop.sq + take(tc, tb, .5),
    tilt: Math.sin(tc * 2.2) * .03 + up * .1 * (1 - tada) + headLag - look * .12, lean: -pre * .06 + wobble(tc, tg, .06),
    hlx: hl.x + Math.sin(tc * 4) * 4, hly: hl.y, hrx: hr.x, hry: hr.y + Math.sin(tc * 5) * 4,
    eyes: tada > .5 ? 'happy' : (look > .5 ? 'wide' : 'dot'), brow: up > .5 && tada < .5 ? -0.0 : 0, blink: blinkAt(tc, 1),
    mouth: amp(tc) * 1.15, smile: .85, lookX: up * .5 * (1 - tada) + look * .6 + lookR * .9, lookY: -look * .9 }, 1);
  if (up > .05 && tada < .95) { const s = 1.05; g.save(); g.translate(-90 + (60 + hr.x) * s, y + (-195 + hr.y - 18) * s); g.rotate(wobble(tc, tb + .1, .3, 2, 5));
    g.lineWidth = 9; g.strokeStyle = C.ink; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -44 * Math.min(1, up * 1.4)); g.stroke(); g.restore(); }
  if (tada > .05) dust(g, tc, tg - .02 + .3, -90, 0, 8, 1.1);

  // 3D hero: the price tag (camera on ones -> uses t, not tc, so the spin gets real shutter blur)
  const P = tagPose(t);
  if (P.on) {
    const hx = 270, hy = P.y - 150 * .85;
    burst(g, t, tg, hx, P.y, 420, C.gold, 16);
    g.save(); g.translate(hx, hy); g.rotate(P.swing);
    g.lineWidth = 6; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(0, -1800); g.lineTo(0, -10); g.stroke();
    TAG.rotation.set(.12 + Math.sin(t * 1.3) * .05, P.spin + Math.sin(t * 1.7) * .32, 0);
    const cv = T3.render(Math.floor(t * 12));
    const s = .85; g.drawImage(cv, -400 * s, -(500 - 150) * s, 800 * s, 1000 * s);
    g.restore();
  }
}

// ---------------- station B: Hermes (real site) -> JADUL ----------------
function stationB(g, t, tc) {
  const t0 = T('bukan') - .14, th = T('hermes'), th2 = T('hermes', 2), tz = T('zaman');
  const A = arrive(t, t0, .34, 1.9);                 // card lands mid-whip: cut on motion
  const age = prog(tc, th2 + .15, tz + .05, ease.inOut);
  const sep = prog(t, tz - .02, tz + .3);
  const ck = kick(t, [[tz, 1]]).x * .004;
  card(g, IM.hermes, { x: 1500 + (1 - A.k) * 380, y: -520, w: 760, rot: lerp(.18, -.04, A.k) + ck + wobble(t, tz, .04, 1.4, 3), alpha: A.a, s: A.s,
    scroll: prog(t, t0 + .4, tz + 1.2, ease.inOut) * 600, url: 'hermes-agent.nousresearch.com', tint: sep * .85 });
  // Hermes drops in: stretch on the fall, squash on landing, dust
  const fall = prog(tc, th - .22, th + .02, ease.in);
  if (fall > 0) {
    const landT = th + .02, yy = lerp(-1300, 0, fall), str = tc < landT ? -.16 * fall : 0;
    const sq = tc >= landT ? .2 * Math.exp(-8 * (tc - landT)) * Math.cos((tc - landT) * 24) + age * .05 : str;
    const shake = Math.sin(tc * 40) * 3 * age;
    shadow(g, 1440, 0, 110, -yy);
    guy(g, { kind: 'hermes', x: 1440 + shake, y: yy, s: 1.0, sq, lean: age * .22, tilt: age * .15 + Math.sin(tc * 2) * .03 - take(tc, tz, .4),
      shirt: '#F4F1EA', wing: Math.sin(tc * 9) * (1 - age) * .7 - age * .6,
      hlx: lerp(-120, 70, age), hly: lerp(-40, 40, age), hrx: lerp(130, 90, age), hry: lerp(-120, 50, age), walker: age,
      eyes: age > .5 ? 'shut' : 'dot', brow: age > .5 ? 1 : 0, blink: blinkAt(tc, 2), mouth: age > .3 ? (Math.sin(tc * 9) > .6 ? .5 : 0) : 0, smile: lerp(.9, -.6, age) }, 3);
    dust(g, tc, landT, 1440, 0, 7, .8);
  }
  // cobweb grows into the card corner after the stamp
  if (sep > .01) { g.save(); g.translate(1500 - 375, -520 - 265); g.globalAlpha = sep; g.lineWidth = 3; g.strokeStyle = C.ink;
    for (let i = 0; i < 5; i++) { const a = i / 4 * Math.PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 170 * sep, Math.sin(a) * 170 * sep); g.stroke(); }
    for (let r = 50; r <= 150; r += 50) { g.beginPath(); for (let i = 0; i <= 4; i++) { const a = i / 4 * Math.PI / 2, rr = r * sep; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? g.quadraticCurveTo(Math.cos(a - .2) * rr * .8, Math.sin(a - .2) * rr * .8, x, y) : g.moveTo(x, y); } g.stroke(); }
    g.restore(); }
  // JADUL stamp: crashes in from 3.2x in ~4 frames, red ink burst, the card kicks
  const S = arrive(t, tz - .1, .14, 3.2);
  if (S.on) {
    burst(g, t, tz + .04, 1650, -400, 300, C.red, 18);
    g.save(); g.translate(1650, -400); g.rotate(-.22 + (1 - S.k) * .25); g.scale(S.s, S.s); g.globalAlpha = S.a;
    rrect(g, -190, -70, 380, 140, 18); g.lineWidth = 12; g.strokeStyle = C.red; g.stroke(); boilText(g, 'JADUL', 0, 6, 104, C.red); g.restore();
  }
}

// foreground layer at parallax 1.6: big ink shapes that cross the lens during the whip (depth)
function foreground(g, c) {
  g.save(); g.translate(-c.x * .6, 0);
  for (const [x, h, sd] of [[1200, 520, 1]]) {
    g.save(); g.translate(x, 120);
    g.fillStyle = C.ink; blob(g, 0, -h * .2, 170, h * .55, 1200 + sd, 24, 3); g.fill();
    g.fillStyle = '#2E2A28'; blob(g, -60, -h * .5, 90, 120, 1300 + sd, 18, 2); g.fill();
    g.restore();
  }
  g.restore();
}

function world(g, t) {
  const c = cam(t), kk = kick(t, hits());
  g.save(); g.translate(W / 2 + kk.x, H * .5 + kk.y); g.rotate(c.r); g.scale(c.z, c.z); g.translate(-c.x, -c.y);
  g.save(); g.translate(c.x * .45, c.y * .45); g.lineWidth = 5; g.strokeStyle = '#DCD2C1';      // far doodles
  for (let i = 0; i < 40; i++) { const x = -800 + i * 260 + hash(i) * 120, y = -1500 + hash(i + 5) * 1100; g.beginPath(); g.arc(x, y, 18 + hash(i + 8) * 30, 0, 7); g.stroke(); }
  g.restore();
  ground(g, c.x - 1400, c.x + 1400);
  const tc = twos(t);                                  // characters + acting on twos
  if (Math.abs(c.x) < 1900) stationA(g, t, tc);
  if (Math.abs(c.x - 1500) < 1900) stationB(g, t, tc);
  foreground(g, c);
  g.restore();
}

function overlay(g, t) {
  const c = cam(t), v = camVel(cam, t); speedLines(g, t, v.vx, v.vy);
  g.save(); g.font = `800 30px ${C.font}`; const label = 'FOUNDER NOTES'; const w = g.measureText(label).width + 70;
  rrect(g, 56, 96, w, 62, 31); g.fillStyle = C.ink; g.fill(); g.fillStyle = C.orange; g.beginPath(); g.arc(88, 127, 9, 0, 7); g.fill();
  g.fillStyle = C.white; g.textBaseline = 'middle'; g.fillText(label, 108, 128); g.restore();
  // words land 0-2 frames before they are heard, at speech rhythm
  slamLine(g, t, 0, [['AGENT', C.white], ['AI', C.white]], 330, 120, { ts: [-.02, T('ai') - .05], t1: 2.3 });
  slamLine(g, t, 0, [['TERBAIK?', C.orange]], 475, 158, { ts: [T('terbaik') - .05], t1: 2.3, from: 3 });
  slamLine(g, t, 0, [['UDAH', C.white], ['GA', C.orange], ['ZAMAN', C.white]], 330, 116, { ts: [T('udah') - .05, T('ga') - .05, T('zaman') - .05], t1: 5.6 });
  captions(g, t);
  const l = prog(t, T('bukan'), T('bukan') + .3) * (1 - prog(t, 5.6, 5.9));
  if (l > .01) { g.save(); g.font = `700 26px ${C.font}`; g.fillStyle = 'rgba(27,24,23,.7)'; g.textAlign = 'right'; g.globalAlpha = l; g.fillText('● REAL SITE, 14 OKT 2026', W - 60, 130); g.restore(); }
  paperFinish(g, t);
}

startToon({
  build: async () => {
    IM.hermes = await loadImg('./footage/hermes_scroll.jpg');
    T3 = new Toon3D(800, 1000);
    TAG = priceTag(T3, { print: (x, w, h) => {           // canvas 600x880 maps to the tag face
      x.fillStyle = C.ink; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `900 120px ${C.font}`; x.fillText('Rp', w / 2, h * .40);
      x.font = `900 330px ${C.font}`; x.fillText('0', w / 2, h * .66);
      x.font = `900 92px ${C.font}`; x.fillText('GRATIS', w / 2, h * .89);
      x.beginPath(); x.arc(w / 2, h * (70 / 440), 34, 0, 7); x.fillStyle = '#2b2b2b'; x.fill();
    } });
  },
  draw: (g, t) => world(g, t), overlay, blurSamples: 8,
});
