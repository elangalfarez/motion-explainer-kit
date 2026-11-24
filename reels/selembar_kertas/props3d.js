// props3d: the set pieces of the toon-3D Jakarta diorama. Each builder returns a THREE.Group placed in S.
// Shapes are simplified on purpose (C&H flatness): boxes, cylinders, extrusions, every one inked.
import { THREE, S, box, cyl, mesh, groundShadow, INK } from './world3d.js';

export const COL = { wall: 0xFBF7EE, cream: 0xEFE3C8, stone: 0xD9D0C1, grey: 0x9A948C, dark: 0x3A3532, roof: 0xC9573A,
  green: 0x5E8C6A, wood: 0xB0794A, gold: 0xF2C14E, orange: 0xFF7A3D, red: 0xE5372B, tree: 0x7FA26A, trunk: 0x7A5638, glass: 0xBFD3D6 };

const group = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; S.add(g); return g; };
function prism(w, h, d, c, x, y, z, parent) { // triangular pediment, apex up, extruded along z
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); geo.translate(0, 0, -d / 2);
  return mesh(geo, c, x, y, z, 8, parent);
}

// A columned court/palace front: steps, n columns, entablature, pediment. Front faces +z.
export function colonnade(x, z, o = {}) {
  const w = o.w ?? 16, d = o.d ?? 10, h = o.h ?? 7, n = o.cols ?? 6, c = o.color ?? COL.wall, g = group(x, z, o.ry ?? 0);
  box(w + 2, .5, d + 3, COL.stone, 0, .25, .6, 6, g); box(w + 1, .5, d + 2, COL.stone, 0, .75, .4, 6, g);
  box(w - 1, h, d - 2.5, o.body ?? COL.cream, 0, 1 + h / 2, -1, 8, g);                     // hall behind the columns
  for (let i = 0; i < n; i++) cyl(.42, .48, h, c, -w / 2 + 1 + i * (w - 2) / (n - 1), 1 + h / 2, d / 2 - .4, 4, g, 14);
  box(w + .4, 1.1, d + .4, c, 0, 1 + h + .55, 0, 8, g);
  if (o.pediment !== false) prism(w + .4, 2.6, d * .5, o.roof ?? c, 0, 2.1 + h, d * .25, g);
  else box(w - 3, 1.6, d - 3, c, 0, 2.9 + h, -.5, 8, g);
  box(3.2, 4, .2, COL.dark, 0, 3, d / 2 - 2.5, 5, g);                                       // door
  groundShadow(x, z + .5, w * .62, d * .62);
  return g;
}

// The DPR hall: a low block with a split green dome (two shells). Stylised, no insignia.
export function domeHall(x, z, o = {}) {
  const g = group(x, z, o.ry ?? 0);
  box(26, 5, 14, COL.wall, 0, 2.5, 0, 8, g);
  for (let i = 0; i < 9; i++) box(1.4, 3, .2, COL.glass, -11 + i * 2.75, 2.6, 7.05, 3, g);
  for (const sd of [-1, 1]) {
    const geo = new THREE.SphereGeometry(9, 28, 14, sd < 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI, 0, Math.PI / 2);
    const m = mesh(geo, COL.green, sd * 1.1, 5, 0, 8, g); m.scale.set(.82, .9, .75);
  }
  groundShadow(x, z, 17, 10);
  return g;
}

// Plain filler buildings so the city reads as a city, not a row of landmarks.
export function block(x, z, w, h, d, c = COL.wall, seed = 0) {
  const g = group(x, z);
  box(w, h, d, c, 0, h / 2, 0, 8, g);
  const rows = Math.max(1, Math.floor(h / 3)), cols = Math.max(1, Math.floor(w / 3));
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++)
    if (((r * 7 + k * 3 + seed) % 5) !== 0) box(1, 1.3, .12, COL.glass, -w / 2 + (k + .5) * w / cols, 1.8 + r * 3, d / 2 + .05, 0, g);
  return g;
}
export function tree(x, z, s = 1) {
  const g = group(x, z); cyl(.25 * s, .3 * s, 2 * s, COL.trunk, 0, s, 0, 3, g, 8);
  const m = mesh(new THREE.IcosahedronGeometry(1.7 * s, 0), COL.tree, 0, 3 * s, 0, 6, g); m.rotation.set(.3, x, .2);
  return g;
}
export function road(x0, z0, x1, z1, wdt = 10) {
  const len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(wdt, len), new THREE.MeshBasicMaterial({ color: 0xD3C7B1 }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = a; m.position.set((x0 + x1) / 2, .01, (z0 + z1) / 2); S.add(m);
  for (let s = 2; s < len; s += 5) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.22, 1.8), new THREE.MeshBasicMaterial({ color: 0xF6F1E7 }));
    d.rotation.x = -Math.PI / 2; d.rotation.z = a; d.position.set(x0 + (x1 - x0) * s / len, .02, z0 + (z1 - z0) * s / len); S.add(d); }
}

// The vice-president's chair. Returns {g, seat} so the scene can empty/spotlight it.
export function chair(x, z, o = {}) {
  const g = group(x, z, o.ry ?? 0), s = o.s ?? 1;
  box(2.4 * s, .5 * s, 2.2 * s, COL.wood, 0, 1.5 * s, 0, 8, g);
  box(2.1 * s, .35 * s, 1.9 * s, COL.orange, 0, 1.92 * s, 0, 6, g);
  box(2.4 * s, 3.4 * s, .4 * s, COL.wood, 0, 3.4 * s, -1 * s, 8, g);
  box(1.9 * s, 2.6 * s, .2 * s, COL.orange, 0, 3.5 * s, -.75 * s, 6, g);
  for (const [lx, lz] of [[-1, -.9], [1, -.9], [-1, .9], [1, .9]]) box(.3 * s, 1.3 * s, .3 * s, COL.wood, lx * s, .65 * s, lz * s, 6, g);
  for (const sx of [-1.25, 1.25]) box(.3 * s, .3 * s, 2 * s, COL.wood, sx * s, 2.5 * s, 0, 6, g);
  groundShadow(x, z, 1.8 * s, 1.6 * s, .16);
  return g;
}
// Ballot box with a slot on top.
export function ballotBox(x, z, s = 1) {
  const g = group(x, z); box(3 * s, 3 * s, 3 * s, COL.wall, 0, 1.5 * s, 0, 8, g); box(1.6 * s, .1 * s, .3 * s, INK, 0, 3.02 * s, 0, 0, g);
  groundShadow(x, z, 2.2 * s, 2.2 * s); return g;
}
// Boom barrier: post + an arm on a pivot. Returns {g, arm} (rotate arm.rotation.z to lift it).
export function gate(x, z, len = 9, o = {}) {
  const g = group(x, z, o.ry ?? 0);
  box(1, 2.6, 1, COL.dark, 0, 1.3, 0, 8, g);
  const arm = new THREE.Group(); arm.position.set(.3, 2.1, .7); g.add(arm);
  for (let i = 0; i < 6; i++) box(len / 6, .45, .3, i % 2 ? COL.red : COL.wall, len / 12 + i * len / 6, 0, 0, 4, arm);
  box(.6, 1.9, .6, COL.grey, len + .3, .95, .7, 6, g);
  groundShadow(x + 1, z + .7, 1.6, 1.2);
  return { g, arm };
}
// Long table (MPR desk) with a cloth.
export function table(x, z, w = 8, o = {}) {
  const g = group(x, z, o.ry ?? 0);
  box(w, .35, 2.4, COL.wood, 0, 2.1, 0, 8, g);
  box(w, 2.05, .15, o.cloth ?? COL.green, 0, 1.025, 1.15, 6, g);   // cloth reaches the floor: no gap for the seats behind to flicker through
  for (const sx of [-1, 1]) box(.3, 2, .3, COL.wood, sx * (w / 2 - .4), 1, -.9, 6, g);
  groundShadow(x, z, w * .6, 1.6); return g;
}
// Low wooden fence rows / audience benches: rows of small boxes facing +z.
export function benches(x, z, rows = 4, w = 18) {
  const g = group(x, z);
  for (let r = 0; r < rows; r++) box(w, .6, 1.2, COL.wood, 0, .9 + r * .5, -r * 2.4, 6, g);
  return g;
}

// The hero sheet of paper: a subdivided plane with a 2D-drawn face. bend(t-params) rewrites vertices from
// scratch every frame (no state), so seeking stays exact. drawFace(ctx, w, h) paints the document.
export function paperSheet(wu, hu, drawFace, px = 900) {
  const c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * hu / wu);
  drawFace(c.getContext('2d'), c.width, c.height);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const geo = new THREE.PlaneGeometry(wu, hu, 24, 32), base = geo.attributes.position.array.slice();
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  const back = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })); back.scale.setScalar(1.025); m.add(back);
  S.add(m);
  // curl: lift the free corner by amt (0..1); wave: travelling ripple (flutter) of amplitude w at phase ph
  m.userData.bend = (curl = 0, wave = 0, ph = 0) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) {
      const x = base[i], y = base[i + 1], u = x / wu + .5, v = y / hu + .5;
      p[i] = x; p[i + 1] = y;
      p[i + 2] = curl * Math.pow(u * (1 - v), 2) * wu * .9 + wave * Math.sin(u * 5 + v * 2 + ph) * wu * .05;
    }
    geo.attributes.position.needsUpdate = true; geo.computeBoundingSphere();
  };
  m.userData.bend(); return m;
}
