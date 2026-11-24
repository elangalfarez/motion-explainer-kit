// acting: the 2D role characters, one function per beat. Each returns [{fig, chip...}] for the chip pass.
import { C, clamp, lerp, ease, prog, amp, rrect } from '../../vendor/toon.js';
import { twos, easeX, antic, arrive } from '../../vendor/toon2.js';
import { proj } from './world3d.js';
import { ANG, polar } from './set.js';
import { figure, chip } from './cast2d.js';
import { anchors } from './anchors.js';

const blinkAt = (t, seed) => { const p = (t + seed * 1.7) % 3.1; return p < .12 ? Math.abs(p - .06) / .06 : 1; };
const WAPRES = { kind: 'suit', hair: 'short', shirt: '#33405E', tie: C.orange };
const walkPose = tc => { const ph = tc * 9; return { legL: Math.max(0, Math.sin(ph)) * .35, legR: Math.max(0, -Math.sin(ph)) * .35, dy: Math.abs(Math.sin(ph)) * 10 }; };
const at = (aDeg, r) => polar(aDeg, r);

function hookVP(g, t, tc, a) {          // the VP stands by the chair, then walks off on "mundur"
  if (t > a.cerita + .6) return [];
  const w = prog(t, a.mundur + .1, a.mundur + 1.6, ease.in), ad = antic(tc, a.mundur, .5), wp = walkPose(tc);
  const f = figure(g, -1.05 - w * 5, 1.5, 1.4, { ...WAPRES, sq: ad.sq, legL: w > 0 ? wp.legL : 0, legR: w > 0 ? wp.legR : 0, lookX: -.8, blink: blinkAt(tc, 1), brow: 1, smile: -.2 }, 3);
  return [{ f, text: 'WAPRES', t0: .05, t1: a.mundur + .9 }];
}
function judgeMK(g, t, tc, a) {         // points at the gate on "buka"
  if (t < a.y2023 - .8 || t > a.menang) return [];
  const j = at(ANG.mk + .4, 38.2), point = prog(tc, a.buka - .15, a.buka + .1, ease.out);
  const f = figure(g, j[0], 0, j[2], { kind: 'robe', hair: 'short', hairCol: '#9A948C', shirt: C.ink, brow: -.6, smile: .1, lookX: -.7, blink: blinkAt(tc, 2),
    hlx: -30 - point * 70, hly: 95 - point * 140, hrx: 30, hry: 95 }, 5);
  return [{ f, text: 'HAKIM MK', t0: a.mk - .1, t1: a.sembilan + .2 }];
}
function walker(g, t, tc, a) {          // WALI KOTA -> CAWAPRES -> WAPRES: through the gate, then cheering at the ballot box
  if (t < a.sembilan - .4 || t > a.tapi + .2) return [];
  const k = prog(t, a.sembilan - .4, a.daftar + .2, ease.inOut), onBallot = t > a.menang - .1;
  const q = onBallot ? at(ANG.ballot - 2.2, 38.5) : at(ANG.mk - 2.5, lerp(47, 37, k));   // out of the court, through the gate, towards us
  const wp = walkPose(tc), moving = !onBallot && k > 0 && k < 1, cheer = onBallot ? prog(tc, a.menang, a.menang + .25, easeX.land) : 0;
  const text = t < a.daftar ? 'WALI KOTA' : t < a.menang ? 'CAWAPRES' : 'WAPRES', t0 = t < a.daftar ? a.sembilan : t < a.menang ? a.daftar : a.menang;
  const f = figure(g, q[0], 0, q[2], { ...WAPRES, legL: moving ? wp.legL : 0, legR: moving ? wp.legR : 0, lift: moving ? wp.dy / 500 : 0, lookX: 0,
    eyes: cheer > .5 ? 'happy' : 'dot', blink: blinkAt(tc, 3), mouth: cheer * .6, hlx: -30 - cheer * 40, hly: 95 - cheer * 230, hrx: 30 + cheer * 40, hry: 95 - cheer * 230 }, 3);
  return [{ f, text, t0: t0 - .05, t1: a.tapi - .1 }];
}
function advokat(g, t, tc, a) {         // walks in holding the paper, raises it on "menggugat"
  if (t < a.tapi - .4 || t > a.oktober + .3) return [];
  const k = prog(t, a.tapi - .4, a.advokat + .3, easeX.land), p = at(ANG.street + lerp(7, .5, k), 38), raise = prog(tc, a.gugat - .15, a.gugat + .15, ease.out), wp = walkPose(tc);
  const f = figure(g, p[0], 0, p[2], { kind: 'suit', hair: 'side', shirt: '#6F6B66', tie: C.ink, legL: k < 1 ? wp.legL : 0, legR: k < 1 ? wp.legR : 0, brow: -1, smile: -.3,
    lookX: .5, blink: blinkAt(tc, 4), hlx: -30, hly: 95, hrx: 40 + raise * 30, hry: 70 - raise * 220 }, 7);
  if (f) heldDoc(g, f, raise);
  return [{ f, text: 'ADVOKAT', t0: a.advokat - .1, t1: a.oktober }];
}
function heldDoc(g, f, raise) {         // the paper in the advokat's right hand
  const s = f.s, hx = f.x + (40 + raise * 30 + 60) * s, hy = f.y - (195 - (70 - raise * 220)) * s;
  g.save(); g.translate(hx, hy - 90 * s); g.rotate(.08 - raise * .1); rrect(g, -60 * s, -80 * s, 120 * s, 165 * s, 6 * s); g.fillStyle = '#FBF7EE'; g.fill(); g.lineWidth = 6 * s; g.strokeStyle = C.ink; g.stroke();
  g.fillStyle = '#C9C1B3'; for (let i = 0; i < 5; i++) g.fillRect(-42 * s, (-52 + i * 26) * s, 84 * s * (i % 2 ? .7 : 1), 9 * s); g.restore();
}
function judgeMA(g, t, tc, a) {
  if (t < a.oktober - .6 || t > a.lalu + .2) return [];
  const j = at(ANG.ma - 2.3, 41);
  const f = figure(g, j[0], 0, j[2], { kind: 'robe', hair: 'short', hairCol: '#3A2E28', shirt: C.ink, brow: -1, smile: -.2, lookX: .7, blink: blinkAt(tc, 6),
    mouth: t > a.kata && t < a.lalu ? amp(t) * .9 : 0, hlx: -30, hly: 95, hrx: 40, hry: 30 }, 9);
  return [{ f, text: 'HAKIM MA', t0: a.oktober + .1, t1: a.lalu }];
}
function leavesVP(g, t, tc, a) {        // back in the hall: hand on the table (the letter), then walks off on "mundur"
  if (t < a.nov - .2 || t > a.sekarang + .3) return [];
  const w = prog(t, a.mundur2 + .05, a.tanpa + .5, ease.in), wp = walkPose(tc), reach = prog(tc, a.nov + .2, a.sebelum ?? a.mundur2, ease.out);
  const f = figure(g, -.6 - w * 6, 1.5, -2.2, { ...WAPRES, legL: w > 0 ? wp.legL : 0, legR: w > 0 ? wp.legR : 0, lookX: -.8, blink: blinkAt(tc, 3), brow: 1, smile: -.1,
    hlx: -25, hly: 95, hrx: 40 + reach * 40, hry: 95 - reach * 60 }, 3);
  return [{ f, text: 'WAPRES', t0: a.nov + .3, t1: a.mundur2 + .8 }];
}
function nominees(g, t, tc, a) {        // two names step up beside the empty chair; the MPR figure's hand hovers between them
  if (t < a.dua - .3 || t > a.juta2 + .6) return [];
  const s1 = arrive(tc, a.dua - .05, .3, 1.25), s2 = arrive(tc, a.dua + .2, .3, 1.25), out = [];
  if (s1.on) out.push({ f: figure(g, -1.55, 1.5, .7, { kind: 'suit', hair: 'short', shirt: '#5C564F', tie: '#5E8C6A', s: s1.s, lookX: .4, blink: blinkAt(tc, 8), smile: .3 }, 11), text: 'MENTAN', t0: a.dua, t1: a.juta2, size: 34 });
  if (s2.on) out.push({ f: figure(g, 1.55, 1.5, .7, { kind: 'suit', hair: 'short', hairCol: '#3A2E28', shirt: '#2E3A59', tie: C.gold, s: s2.s, lookX: -.4, blink: blinkAt(tc, 9), smile: .3 }, 12), text: 'MENKO PMK', t0: a.dua + .25, t1: a.juta2, size: 34 });
  const sw = Math.sin((tc - a.pilih) * 5) * prog(tc, a.pilih - .2, a.pilih + .1), up = prog(tc, a.pilih - .2, a.pilih);
  out.push({ f: figure(g, 0, 1.5, -4.3, { kind: 'suit', hair: 'peci', shirt: '#4B4A47', tie: C.ink, lookX: .6 + sw * .5, blink: blinkAt(tc, 10), hlx: -30, hly: 95, hrx: 30 + up * 50 + sw * 30, hry: 95 - up * 150 }, 13),
    text: 'MPR', t0: a.mpr - .05, t1: a.juta2 });
  return out;
}
function lo(g, t, tc, a) {              // LO outside the fence, hands on the rail
  if (t < a.n732 + .4) return [];
  const p = at(ANG.lo, 24.4);
  const f = figure(g, p[0], 0, p[2], { shirt: C.orange, hair: 'side', eyes: t > a.termasuk ? 'wide' : 'dot', blink: blinkAt(tc, 14), brow: 1, smile: -.4, lookY: -.2,
    hlx: -60, hly: 60, hrx: 60, hry: 60 }, 14);
  if (f) rails(g);
  return [{ f, text: 'LO', t0: a.lo - .05, t1: null }];
}
function rails(g) {                     // the fence rails drawn over LO, so he reads as outside it
  for (const y of [.55, 1.12]) {
    const p0 = proj(...polar(ANG.lo - 9, 22.5, y)), p1 = proj(...polar(ANG.lo + 9, 22.5, y));
    g.save(); g.lineCap = 'round'; g.strokeStyle = C.ink; g.lineWidth = 16 * (p0[3] / 120); g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); g.restore();
  }
}

const BEATS = [hookVP, judgeMK, walker, advokat, judgeMA, leavesVP, nominees, lo];
export function cast(g, t) {
  const a = anchors(), tc = twos(t), chips = BEATS.flatMap(b => b(g, t, tc, a)).filter(o => o.f);
  for (const o of chips) chip(g, t, o.t0, o.t1, o.f.x, o.f.top - 46 * clamp(o.f.s * 3, .7, 1.4), o.text, { size: (o.size ?? 40) * clamp(o.f.s * 2.4, .9, 1.3) });
}
