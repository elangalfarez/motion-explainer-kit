import { W, H, C, clamp, lerp, ease, prog, hash, spring, wobble, T, E, amp, track, blob, inkFill, wline, rrect, guy, card, boilText, popLine, captions, loadImg, startToon } from '../../vendor/toon.js';

import { stationD, stationE, stationF, stationG, stationH, stationI, makeMocks, phoneK, phoneOuter, phoneFrame, PH } from './part2.js';
const IM = {};
const blinkAt = (t, seed) => { const p = (t + seed * 1.7) % 3.1; return p < .12 ? Math.abs(p - .06) / .06 : 1; };

// ---------------- camera (world -> screen) ----------------
// stations: A elang x=0 | B hermes x=1500 | C startups x=3000
function cam(t) {
  return track([
    { t: 0, x: -80, y: -330, z: 3.0, r: -.04 },
    { t: .55, x: 20, y: -470, z: 1.3, r: 0, e: ease.outExpo },
    { t: 2.45, x: 40, y: -480, z: 1.36, r: .01 },
    { t: 2.85, x: 1500, y: -470, z: 1.3, r: -.015, e: ease.inOutExpo },   // whip to Hermes
    { t: 3.85, x: 1500, y: -470, z: 1.32, r: 0 },
    { t: 4.6, x: 1490, y: -385, z: 1.48, r: .02, e: ease.out },             // push on old Hermes
    { t: 5.6, x: 1490, y: -380, z: 1.52, r: .02 },
    { t: 6.05, x: 3060, y: -470, z: 1.3, r: -.01, e: ease.inOutExpo },     // whip to Startups
    { t: 8.1, x: 3080, y: -470, z: 1.32, r: 0 },
    { t: 9.0, x: 3150, y: -430, z: 1.42, r: .015, e: ease.inOut },          // push to gift box
    { t: 10.05, x: 3170, y: -430, z: 1.48, r: .0 },
    { t: 10.6, x: 3200, y: -620, z: 1.08, r: -.01, e: ease.outExpo },      // pull back for Viktor reveal
    { t: 11.45, x: 3200, y: -630, z: 1.12, r: 0 },
    { t: 11.95, x: 4700, y: -540, z: 1.22, r: .015, e: ease.inOutExpo },   // D: Viktor vs Hermes
    { t: 13.5, x: 4700, y: -550, z: 1.26, r: 0 },
    { t: 14.68, x: 4720, y: -580, z: 1.36, r: -.01, e: ease.inOut },
    { t: 14.95, x: 4720, y: -600, z: 1.2, r: 0, e: ease.outExpo },         // punch out on "powerful"
    { t: 15.3, x: 4720, y: -600, z: 1.22, r: 0 },
    { t: 15.75, x: 6300, y: -580, z: 1.2, r: -.015, e: ease.inOutExpo },   // E: frontier models
    { t: 17.4, x: 6300, y: -590, z: 1.24, r: 0 },
    { t: 18.95, x: 6300, y: -600, z: 1.18, r: 0 },
    { t: 19.45, x: 7900, y: -560, z: 1.24, r: .015, e: ease.inOutExpo },   // F: receipt + credit
    { t: 20.9, x: 7890, y: -580, z: 1.3, r: 0 },
    { t: 21.4, x: 7900, y: -560, z: 1.26, r: 0, e: ease.outExpo },
    { t: 23.3, x: 7900, y: -560, z: 1.3, r: 0 },
    { t: 23.75, x: 9500, y: -560, z: 1.24, r: -.015, e: ease.inOutExpo },  // G: max usage -> $3.000
    { t: 26.6, x: 9500, y: -570, z: 1.3, r: 0 },
    { t: 27.45, x: 9500, y: -640, z: 1.12, r: 0, e: ease.outExpo },
    { t: 28.95, x: 9500, y: -640, z: 1.15, r: 0 },
    { t: 29.5, x: 11100, y: -560, z: 1.26, r: .02, e: ease.inOutExpo },   // H: bansos
    { t: 29.95, x: 11100, y: -540, z: 1.36, r: 0, e: ease.outExpo },
    { t: 31.1, x: 11100, y: -580, z: 1.26, r: 0 },
    { t: 32.1, x: 11100, y: -590, z: 1.22, r: 0 },
    { t: 32.55, x: 12700, y: -580, z: 1.2, r: -.015, e: ease.inOutExpo },  // I: scraping + strategy
    { t: 35.0, x: 12700, y: -590, z: 1.24, r: 0 },
    { t: 36.9, x: 12710, y: -600, z: 1.28, r: 0 },
    { t: 39.6, x: 12700, y: -600, z: 1.24, r: 0 },
    { t: 43, x: 12700, y: -600, z: 1.24, r: 0 },
  ], t);
}

function ground(g, x0, x1) {
  g.lineWidth = 8; g.strokeStyle = C.ink; g.lineCap = 'round';
  wline(g, [[x0, 0], [x0 + (x1 - x0) * .33, 2], [x0 + (x1 - x0) * .66, -1], [x1, 0]], 900); g.stroke();
  g.lineWidth = 5; const i0 = Math.floor((x0 + 1200) / 220); for (let i = i0; i < i0 + (x1 - x0) / 220; i++) { const x = -1200 + 60 + i * 220 + hash(i) * 80; g.beginPath(); g.moveTo(x, 28 + hash(i + 3) * 30); g.lineTo(x + 40 + hash(i + 7) * 40, 28 + hash(i + 3) * 30); g.stroke(); }
}

function talk(t) { return amp(t) * 1.1; }

// ---------------- station A: elang + GRATIS tag ----------------
function stationA(g, t) {
  const tb = T('terbaik'), tg = T('gratis');
  const k1 = prog(t, tb - .1, tb + .3, ease.outBack), k2 = prog(t, tg - .15, tg + .25, ease.outBack);
  const breathe = Math.sin(t * 3) * .012;
  // poses: idle -> "number one" finger up -> ta-da
  const hr = { x: lerp(lerp(25, 60, k1), 150, k2), y: lerp(lerp(95, -150, k1), -60, k2) };
  const hl = { x: lerp(-25, -150, k2), y: lerp(95, -60, k2) };
  const hop = wobble(t, tg - .05, 1, 1.6, 5);
  guy(g, { kind: 'elang', x: -90, y: -Math.max(0, hop) * 40, s: 1.05, sq: breathe - hop * .06 + wobble(t, tb, .05, 2.5, 6),
    tilt: Math.sin(t * 2.2) * .04 + k1 * .08 * (1 - k2), lean: wobble(t, tg, .05),
    hlx: hl.x + Math.sin(t * 4) * 4, hly: hl.y, hrx: hr.x, hry: hr.y + Math.sin(t * 5) * 5,
    eyes: k2 > .5 ? 'happy' : 'dot', blink: blinkAt(t, 1), mouth: talk(t), smile: .8, lookX: k1 * .5 * (1 - k2) + Math.sin(t * .9) * .2 }, 1);
  // index finger hint when number one
  if (k1 > .02 && k2 < .98) { g.save(); g.globalAlpha = k1 * (1 - k2); g.translate(-90 + 60 * 1.05 + hr.x * 1.05, (-195 + hr.y - 18) * 1.05); g.lineWidth = 9; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -40); g.stroke(); g.restore(); }
  // GRATIS price tag swinging on a string from the top
  if (t > tg - .3) {
    const drop = prog(t, tg - .3, tg + .05, ease.outBack), ang = wobble(t, tg + .05, .5, 1.1, 1.6);
    g.save(); g.translate(250, -1300 + drop * 480); g.rotate(ang); g.scale(.85, .85);
    g.lineWidth = 6; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(0, -800); g.lineTo(0, 0); g.stroke();
    g.rotate(.12); g.beginPath(); g.moveTo(-40, 20); g.lineTo(40, 20); g.lineTo(150, 110); g.lineTo(150, 460); g.lineTo(-150, 460); g.lineTo(-150, 110); g.closePath(); inkFill(g, C.lime, 9);
    g.beginPath(); g.arc(0, 70, 22, 0, 7); inkFill(g, C.paper, 7);
    boilText(g, 'Rp', 0, 190, 70, C.ink); boilText(g, '0', 0, 330, 200, C.ink);
    boilText(g, 'GRATIS', 0, 430, 52, C.ink);
    g.restore();
  }
}

// ---------------- station B: Hermes (real site) -> old ----------------
function stationB(g, t) {
  const t0 = T('bukan') - .2, tz = T('zaman'), th2 = T('hermes', 2);
  const ci = prog(t, t0, t0 + .45, ease.outBack);
  const age = prog(t, th2 + .2, tz + .1, ease.inOut);
  const sep = prog(t, tz - .05, tz + .35);
  card(g, IM.hermes, { x: 1500 + (1 - ci) * 500, y: -560, w: 760, rot: lerp(.25, -.05, ci) + wobble(t, tz, .05, 1.4, 3), alpha: ci > .002 ? 1 : 0, s: lerp(.6, 1, ci),
    scroll: prog(t, t0 + .5, tz + 1.2, ease.inOut) * 600, url: 'hermes-agent.nousresearch.com', tint: sep * .85 });
  // JADUL stamp
  const sk = prog(t, tz, tz + .22, ease.out);
  if (sk > .002) { g.save(); g.translate(1640, -440); g.rotate(-.22); const s = lerp(2.6, 1, sk); g.scale(s, s); g.globalAlpha = sk;
    rrect(g, -190, -70, 380, 140, 18); g.lineWidth = 12; g.strokeStyle = C.red; g.stroke(); boilText(g, 'JADUL', 0, 6, 104, C.red); g.restore(); }
  // Hermes the cartoon: proud -> old with walker
  const pop = prog(t, T('hermes') - .25, T('hermes') + .2, ease.outBack);
  if (pop > .002) {
    const shake = Math.sin(t * 40) * 3 * age;
    guy(g, { kind: 'hermes', x: 1440 + shake, y: 0, s: 1.0 * pop, sq: wobble(t, T('hermes') + .1, .06, 2.5, 6) + age * .05,
      lean: age * .22, tilt: age * .15 + Math.sin(t * 2) * .03, shirt: '#F4F1EA', wing: Math.sin(t * 9) * (1 - age) * .6 - age * .6,
      hlx: lerp(-120, 70, age), hly: lerp(-40, 40, age), hrx: lerp(130, 90, age), hry: lerp(-120, 50, age), walker: age,
      eyes: age > .5 ? 'shut' : 'dot', brow: age > .5 ? 1 : 0, blink: blinkAt(t, 2), mouth: age > .3 ? (Math.sin(t * 9) > .6 ? .5 : 0) : 0, smile: lerp(.9, -.6, age) }, 3);
    // dust puffs + cobweb
    if (sep > .01) {
      g.save(); g.globalAlpha = sep * .9; for (let i = 0; i < 9; i++) { const a = hash(i) * 6.28, d = prog(t, tz, tz + 1.4, ease.out) * (80 + hash(i + 9) * 140);
        blob(g, 1450 + Math.cos(a) * d * 1.4, -20 - Math.abs(Math.sin(a)) * d * .5, 18 + hash(i + 4) * 16, 14 + hash(i + 2) * 10, 200 + i, 16, 1.5); inkFill(g, '#EFE8DB', 4); }
      g.restore();
      // cobweb in card corner
      g.save(); g.translate(1500 - 375, -560 - 265); g.globalAlpha = sep; g.lineWidth = 3; g.strokeStyle = C.ink;
      for (let i = 0; i < 5; i++) { const a = i / 4 * Math.PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 170 * sep, Math.sin(a) * 170 * sep); g.stroke(); }
      for (let r = 50; r <= 150; r += 50) { g.beginPath(); for (let i = 0; i <= 4; i++) { const a = i / 4 * Math.PI / 2, rr = r * sep; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? g.quadraticCurveTo(Math.cos(a - .2) * rr * .8, Math.sin(a - .2) * rr * .8, x, y) : g.moveTo(x, y); } g.stroke(); }
      g.restore();
    }
  }
}

// ---------------- station C: Claude for Startups -> gift -> Viktor ----------------
function stationC(g, t) {
  const tg = T('gw'), tk = T('keterima'), ts = T('startups'), tp = T('perknya'), tv = T('viktor');
  const ci = prog(t, tg - .1, tg + .4, ease.outBack);
  const lift = prog(t, tv - .1, tv + .6, ease.inOut);
  card(g, IM.startups, { x: 3020, y: -560 - lift * 300, w: 760, rot: lerp(-.3, .04, ci), alpha: (ci > .002 ? 1 : 0) * (1 - lift), s: lerp(.6, 1, ci),
    scroll: prog(t, tg, tv, ease.inOut) * 300, url: 'claude.com/programs/startups' });
  // elang walks in during the whip
  const walkK = prog(t, 5.7, 6.5, ease.out), wx = lerp(2600, 2900, walkK), ph = t * 14;
  const jump = (t > ts - .15 && t < ts + .55) ? Math.sin(clamp((t - (ts - .05)) / .55) * Math.PI) : 0;
  const ant = prog(t, ts - .25, ts - .05) * (1 - prog(t, ts - .05, ts));
  const land = wobble(t, ts + .5, .12, 2.4, 6);
  const gotLetter = prog(t, tk - .2, tk + .25, ease.outBack);
  const cheer = prog(t, ts - .1, ts + .1, ease.out) * (1 - prog(t, tp - .3, tp + .1));
  const walking = walkK < 1 ? 1 : 0;
  guy(g, { kind: 'elang', x: wx, y: -jump * 170, s: 1.0, sq: -jump * .1 + ant * .14 + land,
    legL: walking * Math.max(0, Math.sin(ph)) * .5 + jump * .4, legR: walking * Math.max(0, -Math.sin(ph)) * .5 + jump * .4,
    tilt: Math.sin(t * 2) * .04 - cheer * .1, lean: walking * .08,
    hlx: lerp(lerp(-30, 40, gotLetter), -90, cheer), hly: lerp(lerp(95, 0, gotLetter), -340, cheer),
    hrx: lerp(lerp(30, -40, gotLetter), 90, cheer), hry: lerp(lerp(95, 0, gotLetter), -340, cheer),
    eyes: cheer > .4 ? 'happy' : (gotLetter > .5 && t < ts ? 'wide' : 'dot'), blink: blinkAt(t, 3), mouth: Math.max(talk(t), cheer * .7), smile: .9,
    lookX: t > tp - .2 ? .8 : 0, lookY: gotLetter * (1 - cheer) * .8 }, 5);
  // acceptance letter flies into his hands, then up with the cheer
  if (t > tk - .5) {
    const fly = prog(t, tk - .5, tk + .2, ease.out), up = cheer;
    const toss = prog(t, tv + .15, tv + .8, ease.in);
    const lx = lerp(3400, wx, fly) - toss * 900, ly = lerp(-1300, -170, fly) - up * 450 - jump * 170 - Math.sin(toss * Math.PI) * 500 + toss * 600;
    g.save(); g.translate(lx, ly); g.rotate(lerp(1.6, -.05, fly) + Math.sin(t * 3) * .03 + up * .1 - toss * 4); g.scale(.82, .82);
    rrect(g, -170, -120, 340, 230, 14); inkFill(g, C.white, 8);
    // Claude-ish spark
    g.save(); g.translate(-110, -55); g.strokeStyle = C.orange2; g.lineWidth = 9; g.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); g.stroke(); } g.restore();
    g.fillStyle = C.ink; g.font = `800 30px ${C.font}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Claude for', -60, -70); g.fillText('Startups', -60, -36);
    const st = prog(t, tk + .05, tk + .3, ease.out);
    if (st > .002) { g.save(); g.translate(0, 45); g.rotate(-.12); g.scale(lerp(2, 1, st), lerp(2, 1, st)); g.globalAlpha = st;
      rrect(g, -130, -38, 260, 76, 10); g.lineWidth = 8; g.strokeStyle = '#2E9E55'; g.stroke(); boilText(g, 'ACCEPTED', 0, 3, 46, '#2E9E55'); g.restore(); }
    g.restore();
  }
  // confetti
  if (t > ts - .05) {
    for (let i = 0; i < 60; i++) {
      const dt = t - (ts - .05) - hash(i) * .1; if (dt < 0) continue;
      const a = -Math.PI / 2 + (hash(i + 1) - .5) * 2.2, v = 900 + hash(i + 2) * 900;
      const x = wx + Math.cos(a) * v * dt, y = -420 + Math.sin(a) * v * dt + 1400 * dt * dt;
      if (y > 40) continue;
      g.save(); g.translate(x, y); g.rotate(dt * (6 + hash(i + 3) * 10)); g.scale(1, Math.cos(dt * 12 + i));
      g.fillStyle = [C.orange, C.lime, C.gold, C.blue, C.red][i % 5]; g.fillRect(-12, -7, 24, 14); g.restore();
    }
  }
  // gift box (perk)
  const bd = prog(t, T('dan', 2) - .05, T('dan', 2) + .4, ease.outBack);
  if (bd > .002) {
    const bx = 3260, open = prog(t, tv - .08, tv + .25, ease.out);
    const shake = (t > tp - .1 && t < tv) ? Math.sin(t * 50) * .06 * prog(t, tp - .1, tp + .3) : 0;
    const land = wobble(t, T('dan', 2) + .35, .12, 2.6, 6);
    g.save(); g.translate(bx, -(1 - bd) * 900); g.rotate(shake); g.scale(1 + land, 1 - land);
    // rays behind
    if (open > .002) { g.save(); g.translate(0, -280); g.rotate(t * .4); g.globalAlpha = open;
      for (let i = 0; i < 14; i++) { g.rotate(Math.PI * 2 / 14); g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, -1400 * open); g.lineTo(90, -1400 * open); g.closePath(); g.fillStyle = i % 2 ? 'rgba(242,193,78,.55)' : 'rgba(255,122,61,.35)'; g.fill(); }
      g.restore(); }
    rrect(g, -190, -300, 380, 300, 12); inkFill(g, C.orange, 9);
    g.fillStyle = C.lime; g.fillRect(-30, -300, 60, 300); g.lineWidth = 7; g.strokeStyle = C.ink; g.strokeRect(-30, -300, 60, 300);
    // lid
    g.save(); g.translate(open * 380, -330 - open * 520); g.rotate(open * 1.9);
    rrect(g, -215, -60, 430, 80, 12); inkFill(g, C.orange2, 9); g.fillStyle = C.lime; g.fillRect(-30, -60, 60, 80); g.strokeRect(-30, -60, 60, 80);
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 55, -85, 60, 32, s * .5, 0, 7); inkFill(g, C.lime, 7); }
    g.restore();
    g.restore();
    if (t > tp - .2 && t < tv) boilText(g, '?', bx + 230, -420 + Math.sin(t * 6) * 10, 120, C.ink);
  }
  // Viktor card bursting out of the box
  const vk = prog(t, tv - .02, tv + .55, ease.outBack);
  if (vk > .002) card(g, IM.viktor, { x: 3220, y: lerp(-300, -760, vk), w: 880, rot: lerp(.4, -.03, vk) + Math.sin(t * 1.5) * .01, alpha: 1, s: lerp(.15, 1, vk),
    scroll: prog(t, tv + .5, tv + 3, ease.inOut) * 120, url: 'viktor.com' });
}

function world(g, t) {
  const c = cam(t);
  const sh = wobble(t, T('powerful'), 14, 7, 7) + wobble(t, T('bansos'), 22, 7, 6) + wobble(t, T('3000'), 12, 7, 7) + wobble(t, T('gratis', 2) + .1, 8, 7, 7);
  g.save(); g.translate(W / 2 + sh, H * .5 + sh * .4); g.rotate(c.r); g.scale(c.z, c.z); g.translate(-c.x, -c.y);
  // far doodles (parallax 0.6)
  g.save(); g.translate(c.x * .4, c.y * .4); g.globalAlpha = .5; g.lineWidth = 5; g.strokeStyle = '#D9CFBE';
  for (let i = 0; i < 60; i++) { const x = -800 + i * 260 + hash(i) * 120, y = -1500 + hash(i + 5) * 1100; g.beginPath(); g.arc(x, y, 18 + hash(i + 8) * 30, 0, 7); g.stroke(); }
  g.restore();
  ground(g, c.x - 1400, c.x + 1400);
  const near = x => Math.abs(c.x - x) < 1900;
  if (near(0)) stationA(g, t); if (near(1500)) stationB(g, t); if (near(3100)) stationC(g, t);
  if (near(4700)) stationD(g, t); if (near(6300)) stationE(g, t, IM); if (near(7900)) stationF(g, t);
  if (near(9500)) stationG(g, t); if (near(11100)) stationH(g, t); if (near(12700)) stationI(g, t, IM);
  g.restore();
}

function draw(g, t) {
  const k = phoneK(t);
  if (k <= 0.0005) { world(g, t); return; }
  phoneOuter(g, t, k);
  const s = lerp(1, PH.s, k), cy = lerp(960, PH.cy, k);
  g.save(); g.translate(540, cy); g.scale(s, s); g.translate(-540, -960);
  g.beginPath(); g.roundRect(0, 0, W, H, 34 * k / s); g.clip(); g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  world(g, t); overlayInner(g, t);
  g.restore();
  phoneFrame(g, t, k);
}

function overlayInner(g, t) {}

function counter(g, t, t0, t1, to, fmt, y, size, col, o = {}) {
  if (t < t0 || (o.end != null && t > o.end + .25)) return;
  const n = Math.round(prog(t, t0, t1, ease.out) * to), k = prog(t, t0 - .05, t0 + .25, ease.outBack) + wobble(t, t1, .12, 2.5, 6);
  const out = o.end != null ? prog(t, o.end, o.end + .25, ease.in) : 0;
  g.save(); g.translate(W / 2, y - out * 60); g.scale(k * (1 - out), k * (1 - out)); g.rotate(-.03);
  boilText(g, fmt(n), 0, 0, size, col, { stroke: 18 }); g.restore();
}
const idr = n => n.toLocaleString('de-DE');

function overlay(g, t) {
  // top chip
  g.save(); g.font = `800 30px ${C.font}`; const label = 'FOUNDER NOTES'; const w = g.measureText(label).width + 70;
  rrect(g, 56, 96, w, 62, 31); g.fillStyle = C.ink; g.fill(); g.fillStyle = C.orange; g.beginPath(); g.arc(88, 127, 9, 0, 7); g.fill();
  g.fillStyle = C.white; g.textBaseline = 'middle'; g.fillText(label, 108, 128); g.restore();
  const pk = phoneK(t);
  // A–C
  popLine(g, t, .05, [['AGENT AI', C.white]], 330, 120, { t1: 2.35 });
  popLine(g, t, .45, [['TERBAIK?', C.orange]], 470, 150, { t1: 2.35 });
  popLine(g, t, T('hermes', 2) - .05, [['UDAH ', C.white], ['GA ', C.orange], ['ZAMAN', C.white]], 330, 110, { t1: T('gw') - .3 });
  popLine(g, t, T('perknya') - .1, [['PERK-NYA:', C.white]], 330, 120, { t1: T('viktor') - .1 });
  popLine(g, t, T('viktor') + .05, [['VIKTOR', C.orange]], 300, 150, { stagger: .04, t1: 11.35 });
  // D
  const tt = T('tapi'), tpw = T('powerful');
  popLine(g, t, T('kayak') - .05, [['KAYAK ', C.white], ['HERMES', C.gold]], 320, 110, { t1: tt - .3 });
  popLine(g, t, tt, [['TAPI JAUH LEBIH', C.white]], 300, 92, { t1: 15.3 });
  popLine(g, t, tpw - .05, [['POWERFUL', C.orange]], 425, 140, { t1: 15.3, stagger: .03 });
  // E
  popLine(g, t, T('frontier') - .05, [['FRONTIER ', C.white], ['MODEL', C.lime]], 310, 108, { t1: 18.95 });
  // F
  const tgr = T('gratis', 2), t15 = T('1500');
  popLine(g, t, T('semuanya') - .05, [['SEMUANYA', C.white]], 290, 100, { t1: T('gw', 2) - .1 });
  popLine(g, t, tgr - .05, [['GRATIS', C.lime]], 420, 140, { t1: T('gw', 2) - .1 });
  popLine(g, t, T('kredit') - .05, [['KREDIT', C.white]], 290, 100, { t1: 23.3 });
  popLine(g, t, t15 - .05, [['$1.500', C.lime]], 420, 150, { t1: 23.3 });
  // G
  const tm = T('maksimal'), t2 = T('1500', 2), ttot = T('total'), t3 = T('3000');
  popLine(g, t, tm - .1, [['PAKE ', C.white], ['MAKSIMAL', C.red]], 320, 104, { t1: t2 - .3 });
  popLine(g, t, t2 - .05, [['+$1.500 ', C.lime], ['LAGI', C.white]], 320, 110, { t1: ttot - .3 });
  popLine(g, t, ttot - .05, [['TOTAL', C.white]], 270, 96, { t1: 28.95 });
  counter(g, t, ttot + .05, t3 + .1, 3000, n => '$' + idr(n), 420, 190, C.lime, { end: 28.95 });
  // H
  const ta = T('atau'), tb = T('bansos'), trp = T('rp54');
  popLine(g, t, ta - .05, [['ATAU...', C.white]], 320, 120, { t1: tb - .25 });
  popLine(g, t, tb - .05, [['BANSOS', C.orange]], 300, 150, { t1: 32.25 });
  counter(g, t, trp - .1, T('juta') + .2, 54000000, n => 'Rp ' + idr(Math.round(n / 1e5) * 1e5), 440, 104, C.lime, { end: 32.25 });
  if (t > trp && t < 32.4) { g.save(); g.globalAlpha = prog(t, trp, trp + .3) * (1 - prog(t, 32.1, 32.4)); g.font = `700 30px ${C.font}`; g.textAlign = 'center'; g.fillStyle = C.ink;
    g.fillText('$3.000 × kurs ±Rp17.900 (14 Okt 2026)', W / 2, 525); g.restore(); }
  // I
  const tbs = T('bisa', 2), tkm = T('kemarin'), tsc = T('scraping'), tre = T('reverse'), tst = T('strategi'), tev = T('even');
  popLine(g, t, tbs - .05, [['BISA BUAT', C.white]], 290, 100, { t1: tkm - .1 });
  popLine(g, t, tbs + .2, [['APA AJA', C.orange]], 410, 140, { t1: tkm - .1 });
  popLine(g, t, tsc - .1, [['SCRAPING ', C.white], ['BACKLINK', C.orange]], 320, 92, { t1: tre - .3 });
  popLine(g, t, tre - .05, [['REVERSE ENGINEER', C.white]], 290, 88, { t1: tev - .3 });
  popLine(g, t, tst - .05, [['STRATEGI ', C.orange], ['OFF-PAGE', C.lime]], 400, 92, { t1: tev - .3 });
  captions(g, t);
  // labels: real footage vs illustrative
  const fl = (a, b) => prog(t, a, a + .3) * (1 - prog(t, b - .3, b));
  const l = Math.max(fl(T('bukan'), T('gw') - .1), fl(T('gw') + .3, T('viktor') - .1), fl(T('viktor') + .4, 11.5), fl(T('opus') - .1, 19.1));
  const il = fl(tsc - .3, tev);
  g.save(); g.font = `700 26px ${C.font}`; g.fillStyle = 'rgba(27,24,23,.7)'; g.textAlign = 'right';
  if (l > .01) { g.globalAlpha = l; g.fillText('● REAL SITE, 14 OKT 2026', W - 60, 130); }
  if (il > .01) { g.globalAlpha = il; g.fillText('● ILUSTRASI', W - 60, 130); }
  g.restore();
}

startToon({
  build: async () => {
    for (const k of ['hermes', 'startups', 'viktor', 'opus', 'gpt56']) IM[k] = await loadImg(`./footage/${k}_scroll.jpg`);
    Object.assign(IM, makeMocks());
  },
  draw, overlay, blurSamples: 8,
});
