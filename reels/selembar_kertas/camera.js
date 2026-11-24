// camera: one continuous take, written as polar keys around the hall.
// a = angle (deg), r = radius, h = height; la/lr/lh = the look target in the same polar form.
// Negative r puts the camera on the opposite side, so the opening can fly straight over the chair.
// The look target always stays farther out than the camera, so a turn is a pan and never flips through the lens.
import { ease, track, prog, lerp } from '../../vendor/toon.js';
import { easeX, kick } from '../../vendor/toon2.js';
import { CAM, setFog } from './world3d.js';
import { ANG, polar } from './set.js';
import { anchors } from './anchors.js';

// standard station view: eye level, characters at r 38 fill ~650 px with feet near y 1550, building behind
const st = (a, k = {}) => ({ a, r: 29, h: 2.2, la: a, lr: 41, lh: 2.0, fov: 40, ...k });
let KEYS = null;
function camKeys() {
  if (KEYS) return KEYS; const a = anchors(), k = [];
  const add = (t, v, e = ease.inOut) => k.push({ t, ...v, e });
  const whip = (tLand, from, to, lean = 2.5) => {      // lean back, then an expo whip that lands on the word
    add(tLand - .5, { ...from, a: from.a - lean, la: from.la - lean }, ease.out);
    add(tLand - .02, to, ease.inOutExpo);
  };
  // hook: push in on the VP beside the chair, already moving
  add(0, { a: 0, r: -13.5, h: 2.7, la: 0, lr: 6, lh: 2.9, fov: 40 }, ease.lin);
  add(a.cerita - .25, { a: 0, r: -10.5, h: 2.8, la: 0, lr: 6, lh: 3.1, fov: 38 }, ease.out);
  // the paper falls: crane up and over the chair, follow it down towards the schools
  add(a.kertas - .1, { a: 0, r: -4, h: 13, la: 0, lr: 16, lh: 15, fov: 44 }, ease.inOut);
  add(a.surat + .05, st(0, { r: 35, h: 3.3, lr: 44, lh: 3.4, fov: 38 }), easeX.land);
  add(a.sekolah - .1, st(0, { r: 35.6, h: 3.3, lr: 44, lh: 3.5, fov: 37 }));
  add(a.luar + .2, st(0, { r: 31.5, h: 4, la: 0, lr: 44, lh: 4.6, fov: 46 }), ease.out);       // pull back to show both schools
  add(a.y2023 - .55, st(0, { r: 31.8, h: 4, la: 1, lr: 44, lh: 4.6, fov: 46 }));
  // MK and the gate
  whip(a.y2023 - .1, st(1, { r: 31.8, h: 4, lr: 44, lh: 4.6, fov: 46 }), st(ANG.mk - 2, { r: 26, h: 3, lh: 3.6, fov: 46 }));
  add(a.buka - .1, st(ANG.mk - 2.5, { r: 26.6, h: 2.6, lh: 2.8, fov: 46 }));
  add(a.di40, st(ANG.mk - 2.5, { r: 27.2, h: 2.4, lh: 2.4, fov: 44 }), ease.out);
  add(a.sembilan - .1, st(ANG.mk - 2.5, { r: 27.6, h: 2.3, lh: 2.3, fov: 44 }));
  // the walker: track along the ring with him
  add(a.daftar, st(ANG.mk - 1.5, { r: 27.4, lh: 2.0 }), ease.inOut);
  add(a.menang - .4, st(ANG.mk - 1, { r: 27.2 }));
  // ballot box: land, then crane up a little
  whip(a.menang - .02, st(ANG.mk - 1, { r: 27.2 }), st(ANG.ballot - 1, { r: 31, h: 2.6, lh: 2.4, fov: 44 }));
  add(a.tapi - .5, st(ANG.ballot, { r: 30, h: 5.5, lh: 2.2, fov: 46 }), ease.out);
  // advokat on the street
  whip(a.tapi - .02, st(ANG.ballot, { r: 30, h: 5.5, lh: 2.2, fov: 46 }), st(ANG.street));
  add(a.oktober - .5, st(ANG.street + 2, { r: 28.4 }));
  // MA: push in on the stamp
  whip(a.oktober - .05, st(ANG.street + 2), st(ANG.ma, { r: 28, h: 3, lh: 3.2, fov: 46 }));
  add(a.batal - .15, st(ANG.ma - 1, { r: 30.5, h: 2.8, lh: 2.5, fov: 44 }), ease.inOut);
  add(a.kata, st(ANG.ma - 1, { r: 31.2, h: 2.8, lh: 2.5, fov: 43 }), ease.out);
  add(a.lalu - .5, st(ANG.ma, { r: 31, h: 2.8, lh: 2.5, fov: 44 }));
  // DPR: whip, slow push to the HMP door
  whip(a.lalu - .02, st(ANG.ma, { r: 31, h: 2.8, lh: 2.5, fov: 44 }), st(ANG.dpr, { r: 25, h: 4.5, lh: 5.5, fov: 50 }));
  add(a.pintu2 - .3, st(ANG.dpr + 3, { r: 30, h: 3.2, lh: 3.6, fov: 44 }), ease.inOut);
  add(a.nov - .6, st(ANG.dpr + 5, { r: 33.5, h: 3, lh: 3.2, fov: 40 }), ease.out);
  // back to the chair: the look target sweeps around the ring (a whip turn), the camera flies in
  add(a.nov + .25, { a: ANG.dpr + 2, r: 22, h: 3.2, la: ANG.dpr - 180, lr: 30, lh: 1.2, fov: 44 }, ease.inOutExpo);
  add(a.tanpa, { a: ANG.dpr, r: 10, h: 2.5, la: ANG.dpr - 180, lr: 30, lh: 1.4, fov: 40 }, easeX.land);
  add(a.sekarang - .1, { a: ANG.dpr - 3, r: 10, h: 2.5, la: ANG.dpr - 183, lr: 30, lh: 1.4, fov: 40 });
  // two names: slow low orbit
  add(a.satu + .2, { a: ANG.dpr - 14, r: 11, h: 2.4, la: ANG.dpr - 194, lr: 30, lh: 1.5, fov: 42 }, ease.inOut);
  // 96 juta: rise over the hall and look out across the field of voters to the horizon (scale reveal)
  add(a.lama + .1, { a: ANG.dpr - 18, r: 6, h: 46, la: ANG.dpr - 198, lr: 160, lh: 0, fov: 52 }, ease.inOut);
  add(a.pengganti, { a: ANG.dpr - 20, r: 5, h: 48, la: ANG.dpr - 206, lr: 160, lh: 0, fov: 52 }, ease.lin);
  // 732: tilt down onto the lit seats, then drop outward to LO behind the fence
  add(a.n732 - .1, { a: ANG.lo, r: -14, h: 19, la: ANG.lo, lr: 9, lh: 0, fov: 52 }, ease.inOut);   // seats in view as the count starts
  add(a.lo - .6, { a: ANG.lo, r: -12.5, h: 17.5, la: ANG.lo, lr: 10, lh: 0, fov: 50 }, ease.lin);
  // land low among the lit seats: the 732 in the foreground, LO behind the fence
  add(a.lo - .05, { a: ANG.lo, r: 15, h: 1.55, la: ANG.lo, lr: 30, lh: 1.75, fov: 42 }, easeX.land);
  add(a.end + 1, { a: ANG.lo, r: 16.2, h: 1.55, la: ANG.lo, lr: 30, lh: 1.8, fov: 38 }, ease.lin);
  KEYS = k; return k;
}
export function camAt(t) {
  const c = track(camKeys(), t);
  return { p: polar(c.a, c.r, c.h), l: polar(c.la, c.lr, c.lh), fov: c.fov, h: c.h };
}
export const HITS = () => { const a = anchors(); return [[a.y1956, 14], [a.sma, 8], [a.y2023, 10], [a.u36, 12], [a.juta1, 10], [a.batal, 26], [a.n120, 8], [a.nov, 10], [a.n732, 16]]; };
export function placeCam(t) {
  const c = camAt(t);
  CAM.position.set(...c.p); CAM.lookAt(...c.l); CAM.fov = c.fov; CAM.updateProjectionMatrix(); CAM.updateMatrixWorld();
  const hi = prog(c.h, 6, 46, ease.lin);                   // high crane: push the fog out so the field reads to the horizon
  setFog(lerp(60, 90, hi), lerp(260, 420, hi));
  return c;
}
export const shake = t => kick(t, HITS());
