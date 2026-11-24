// set: the ring diorama. The MPR hall (stage, VP chair, 732 seats) sits at the centre; the landmarks of the story stand
// around a ring road, so one continuous camera can visit them in order and come back to the chair.
import { THREE, S, box, cyl, groundShadow, INK } from './world3d.js';
import { colonnade, domeHall, block, tree, chair, gate, table, ballotBox, paperSheet, COL } from './props3d.js';
import { C } from '../../vendor/toon.js';

export const RING = 52;                       // landmark radius
export const ANG = { schools: 0, mk: 40, ballot: 80, street: 112, ma: 145, dpr: 200, lo: 250 };
export const polar = (aDeg, r, y = 0) => { const a = aDeg * Math.PI / 180; return [Math.sin(a) * r, y, -Math.cos(a) * r]; };
const faceCentre = (g, aDeg) => { g.rotation.y = -aDeg * Math.PI / 180; };   // local +z (the front) points at the hall

export const SET = {};

function seats() { // exactly 732 seats in 8 concentric rows (the MPR's 580 DPR + 152 DPD members)
  const rows = 8, radii = [...Array(rows)].map((_, i) => 11.5 + i * 1.15), tot = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map(r => Math.round(732 * r / tot)); counts[rows - 1] += 732 - counts.reduce((a, b) => a + b, 0);
  const geo = new THREE.BoxGeometry(.62, .5, .62), mat = new THREE.MeshToonMaterial({ color: 0xffffff });
  const im = new THREE.InstancedMesh(geo, mat, 732); im.frustumCulled = false;
  const M = new THREE.Matrix4(), pos = []; let k = 0;
  radii.forEach((r, ri) => { for (let i = 0; i < counts[ri]; i++) {
    const a = (i + (ri % 2) * .5) / counts[ri] * Math.PI * 2, p = [Math.sin(a) * r, .25 + ri * .12, -Math.cos(a) * r];
    M.makeRotationY(-a); M.setPosition(...p); im.setMatrixAt(k, M); im.setColorAt(k, new THREE.Color(0x9C6B45)); pos.push(p); k++; } });
  S.add(im); SET.seats = im; SET.seatPos = pos; SET.seatCount = k;
}
function voters() { // the 96 million: a field of small discs outside the ring (a picture of scale, not a count)
  const n = 9000, geo = new THREE.CylinderGeometry(.55, .55, .3, 7), im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff }), n);
  im.frustumCulled = false; const pos = [];
  for (let i = 0; i < n; i++) { const a = i * 2.39996, r = 64 + Math.sqrt(i / n) * 190; pos.push([Math.sin(a) * r, -Math.cos(a) * r, r]);
    im.setColorAt(i, new THREE.Color(i % 3 ? 0x3A3532 : 0x6F6B66)); }
  S.add(im); SET.voters = im; SET.voterPos = pos;
}
function fence() { // low fence ring around the hall: LO stands behind it at the end
  const r = 22.5;
  for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; box(.28, 1.3, .28, COL.dark, Math.sin(a) * r, .65, -Math.cos(a) * r, 5); }
  for (const y of [.55, 1.12]) { const t = new THREE.Mesh(new THREE.TorusGeometry(r, .09, 6, 128), new THREE.MeshBasicMaterial({ color: INK })); t.rotation.x = Math.PI / 2; t.position.y = y; S.add(t); }
}

export function buildSet(drawDoc) {
  // hall: stage, chair, MPR table, seats, fence
  box(10, 1.2, 8, COL.stone, 0, .6, 0, 8); box(10.6, .3, 8.6, COL.wall, 0, 1.35, 0, 6);
  SET.chair = chair(0, -1, { s: 1 }); SET.chair.position.y = 1.5;
  SET.table = table(0, -3.6, 7, { cloth: 0x5E8C6A }); SET.table.position.y = 1.5;   // behind the chair: the hook camera sees the chair first
  seats(); fence();
  // stations
  const at = (k, r = RING) => polar(ANG[k], r);
  let p = at('schools');
  for (const [dx, c] of [[-7, 0xEFE3C8], [7, 0xFBF7EE]]) { const g = block(p[0] + dx, p[2] - 4, 9, 8, 7, c, dx); g.rotation.y = 0; }
  p = at('mk'); SET.mk = colonnade(p[0], p[2], { w: 18, cols: 7 }); faceCentre(SET.mk, ANG.mk);
  // the walker comes out of the court towards the camera, through this gate
  const gp = polar(ANG.mk - 6.5, 41); SET.gate = gate(gp[0], gp[2], 7); SET.gate.g.rotation.y = -ANG.mk * Math.PI / 180;   // arm lies across the view
  p = at('ballot', 44); SET.ballot = ballotBox(p[0], p[2], 1.1);
  p = at('ma'); SET.ma = colonnade(p[0], p[2], { w: 18, cols: 6, color: 0xB9B2A7, body: 0x8E877D, roof: 0x6F6B66 }); faceCentre(SET.ma, ANG.ma);
  p = at('dpr', 58); SET.dpr = domeHall(p[0], p[2]); faceCentre(SET.dpr, ANG.dpr);
  // HMP door in front of the dome (frame + hinged leaf)
  const dp = polar(ANG.dpr + 6, 45), dg = new THREE.Group(); dg.position.set(dp[0], 0, dp[2]); dg.rotation.y = -ANG.dpr * Math.PI / 180; S.add(dg);
  box(.5, 5, .5, COL.wood, -1.6, 2.5, 0, 6, dg); box(.5, 5, .5, COL.wood, 1.6, 2.5, 0, 6, dg); box(3.7, .5, .5, COL.wood, 0, 5.2, 0, 6, dg);
  const leaf = new THREE.Group(); leaf.position.set(-1.35, 0, 0); dg.add(leaf); box(2.7, 4.8, .2, COL.orange, 1.35, 2.45, 0, 6, leaf);
  SET.hmpDoor = leaf; SET.hmpPos = [dp[0], 3, dp[2]];
  // city filler beyond the ring (gaps left where landmarks stand)
  for (let i = 0; i < 46; i++) { const a = i * 360 / 46 + 4, r = 74 + (i * 37 % 23);
    const near = Object.values(ANG).some(x => Math.abs(((a - x + 540) % 360) - 180) < 9); if (near) continue;
    const q = polar(a, r), h = 7 + (i * 13 % 17), g = block(q[0], q[2], 7 + i % 5, h, 7, i % 3 ? COL.wall : COL.cream, i); faceCentre(g, a); }
  for (let i = 0; i < 40; i++) { // trees stay off the camera ring (r 16-34) and out of each landmark's sightline
    const a = i * 9 + 4, near = Object.values(ANG).some(x => Math.abs(((a - x + 540) % 360) - 180) < 10); if (near) continue;
    const q = polar(a, 46 + (i % 3) * 4); tree(q[0], q[2], 1); }
  // road ring
  const road = new THREE.Mesh(new THREE.RingGeometry(26, 36, 160), new THREE.MeshBasicMaterial({ color: 0xD3C7B1 })); road.rotation.x = -Math.PI / 2; road.position.y = .01; S.add(road);
  for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2, d = new THREE.Mesh(new THREE.PlaneGeometry(.22, 1.6), new THREE.MeshBasicMaterial({ color: 0xF6F1E7 }));
    d.rotation.x = -Math.PI / 2; d.rotation.z = -a; d.position.set(Math.sin(a) * 31, .02, -Math.cos(a) * 31); S.add(d); }
  voters();
  // hero paper (drawn document) and its twin pinned at the MA
  SET.paper = paperSheet(2.4, 3.3, drawDoc);
  SET.paperMA = paperSheet(2.4, 3.3, drawDoc);
}

// per-frame state of instanced crowds (pure functions of their inputs)
const MX = new THREE.Matrix4(), Q = new THREE.Quaternion(), V3 = new THREE.Vector3(), SC = new THREE.Vector3();
export function updateVoters(rise, sink) { // rise 0..1 wave outward, sink 0..1 everyone gone
  const im = SET.voters;
  SET.voterPos.forEach(([x, z, r], i) => {
    const up = Math.min(1, Math.max(0, (rise * 260 - (r - 64)) / 18)), s = up * (1 - sink);
    MX.compose(V3.set(x, .12 - sink * .4, z), Q.identity(), SC.set(s || 1e-4, s || 1e-4, s || 1e-4)); im.setMatrixAt(i, MX);
  });
  im.instanceMatrix.needsUpdate = true;
}
const GREY = new THREE.Color(0x9C6B45), LIT = new THREE.Color(C.orange);
export function updateSeats(lit) { // lit 0..1: seats light up orange in a sweep
  const im = SET.seats, c = new THREE.Color();
  for (let i = 0; i < SET.seatCount; i++) { const on = lit * SET.seatCount * 1.2 - i > 0; im.setColorAt(i, on ? LIT : GREY); }
  im.instanceColor.needsUpdate = true;
}
