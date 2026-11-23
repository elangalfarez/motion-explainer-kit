// v3d_flyover: proof of the "3D cel-shaded engineering explainer" look (ref: Sosrobahu short).
// Full Three.js scene: dusk city, elevated toll road, a pier head cast PARALLEL to the road that rotates 90°.
// 2D overlay: projected callouts (line + node + label), slam numbers, ID/EN captions, grain + vignette.
import * as THREE from '../../vendor/three.module.js';
import { W, H, C, clamp, lerp, ease, prog, hash, startToon } from '../../vendor/toon.js';

const PAL = { skyTop: '#2a2350', skyMid: '#7a4a7e', skyLow: '#f59a5b', asphalt: 0x3b3c4a, line: 0xf2efe6, median: 0x8d8a86,
  concrete: 0xaaa7a6, concreteNew: 0xe2d9c8, bld: [0x4b4a6b, 0x5d5378, 0x3f4761, 0x6a5a73, 0x51587a], tree: 0x2f5a4c, warm: 0xffb16a };
let R, S, CAM, BEAM, CARS = [], BARRIERS = [], CV;
const grad = (() => { const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const M = (c, o = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...o });
const ink = new THREE.MeshBasicMaterial({ color: 0x1c1630, side: THREE.BackSide });
const outline = (m, k = 1.04) => { const o = new THREE.Mesh(m.geometry, ink); o.scale.set(1 + (k - 1) * 4 / Math.max(.5, m.geometry.parameters?.width || 4), 1 + (k - 1) * 4 / Math.max(.5, m.geometry.parameters?.height || 4), 1 + (k - 1) * 4 / Math.max(.5, m.geometry.parameters?.depth || 4)); m.add(o); return m; };
const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); S.add(m); return m; };

function pierHead(mat) { // trapezoid cap: 26 wide on top, 12 at the bottom, 5 tall, 5 deep
  const s = new THREE.Shape(); s.moveTo(-13, 0); s.lineTo(13, 0); s.lineTo(13, -1.6); s.lineTo(6, -5); s.lineTo(-6, -5); s.lineTo(-13, -1.6); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 5, bevelEnabled: true, bevelSize: .15, bevelThickness: .15, bevelSegments: 1 }); g.translate(0, 0, -2.5);
  return new THREE.Mesh(g, mat);
}
function car(color, x, z0, dir) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2, .9, 4.2), M(color)); body.position.y = .75; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.7, .7, 2.2), M(0x2a2d3a)); cab.position.set(0, 1.5, -.2); g.add(cab);
  const lamp = new THREE.MeshBasicMaterial({ color: dir < 0 ? 0xfff1c8 : 0xff4a3a });
  for (const sx of [-.65, .65]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.45, .25, .1), lamp); l.position.set(sx, .85, dir < 0 ? -2.12 : 2.12); g.add(l); }
  if (dir > 0) g.rotation.y = Math.PI;
  g.position.set(x, 0, z0); S.add(g); CARS.push({ g, x, z0, dir, v: 9 + hash(z0) * 5 });
}

function build() {
  CV = document.createElement('canvas'); CV.width = W; CV.height = H;
  R = new THREE.WebGLRenderer({ canvas: CV, alpha: true, antialias: true, preserveDrawingBuffer: true });
  R.setClearColor(0, 0); R.outputColorSpace = THREE.SRGBColorSpace;
  S = new THREE.Scene(); S.fog = new THREE.Fog(0x8a5a7e, 90, 330);
  CAM = new THREE.PerspectiveCamera(50, W / H, .5, 900);
  S.add(new THREE.HemisphereLight(0xffc39a, 0x2a2650, 1.1));
  const sun = new THREE.DirectionalLight(0xffb27a, 3.2); sun.position.set(-80, 60, -160); S.add(sun);
  const fill = new THREE.DirectionalLight(0x8f9cff, .7); fill.position.set(90, 40, 120); S.add(fill);
  // ground + road (road runs along z, median at x=0)
  box(400, .2, 900, M(0x4f4a5a), 0, -.1, -200);
  box(34, .05, 900, M(PAL.asphalt), 0, 0, -200);
  box(3.2, .35, 900, M(PAL.median), 0, .17, -200);
  for (const sx of [-17.5, 17.5]) box(3, .5, 900, M(0x9a8f88), sx, .25, -200);
  const lm = new THREE.MeshBasicMaterial({ color: PAL.line });
  for (let z = 60; z > -500; z -= 9) for (const x of [-9.5, 9.5]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.25, .06, 4), lm); m.position.set(x, .04, z); S.add(m); }
  // elevated toll road: columns every 40 along the median; finished decks up to z=-80, construction at z=-120
  const con = M(PAL.concrete);
  for (const z of [40, 0, -40, -80, -120, -160]) {
    outline(box(3, 14, 3, con, 0, 7, z), 1.012);
    if (z >= -80) { const ph = pierHead(con); ph.position.set(0, 19, z); S.add(ph); const o = new THREE.Mesh(ph.geometry, ink); o.scale.setScalar(1.02); ph.add(o); }
  }
  outline(box(25, 1.8, 132, con, 0, 19.9, -14), 1.012); box(24.6, .2, 131.6, M(0x5d5668), 0, 18.95, -14); // darker soffit                  // deck over the finished part
  for (const sx of [-12.2, 12.2]) box(.5, 1.1, 132, M(0xe8e1d6), sx, 21.3, -14);
  // the hero pier head, cast parallel to the road (rotation.y = 90° means its 26-long axis follows z)
  BEAM = pierHead(M(PAL.concreteNew)); BEAM.position.set(0, 19, -120); BEAM.rotation.y = Math.PI / 2; S.add(BEAM);
  const ol = new THREE.Mesh(BEAM.geometry, new THREE.MeshBasicMaterial({ color: 0x1b1817, side: THREE.BackSide }));
  ol.scale.setScalar(1.025); BEAM.add(ol);
  const hy = box(4.2, .5, 4.2, M(0x3c6fd8), 0, 14.2, -120);  // steel discs (hint)
  // construction barriers around column -120
  const bm = M(0xff7a3d), wm = M(0xf6f1e7);
  for (let i = 0; i < 10; i++) { const z = -135 + i * 3.2; for (const x of [-2.6, 2.6]) { box(.5, 1.1, 2.6, i % 2 ? bm : wm, x, .55, z); } }
  // city: low-poly blocks both sides, lit windows, trees
  const winM = new THREE.MeshBasicMaterial({ color: PAL.warm });
  for (let i = 0; i < 70; i++) {
    const side = i % 2 ? 1 : -1, z = 60 - Math.floor(i / 2) * 16 - hash(i) * 6, w = 10 + hash(i + 3) * 10, d = 10 + hash(i + 5) * 6, h = 8 + hash(i + 7) * (i % 5 === 0 ? 70 : 28);
    const x = side * (26 + w / 2 + hash(i + 9) * 6);
    box(w, h, d, M(PAL.bld[i % 5]), x, h / 2, z);
    for (let k = 0; k < 6; k++) if (hash(i * 13 + k) > .45) { const wy = 3 + hash(i * 7 + k) * (h - 5); const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), winM);
      wn.position.set(x - side * (w / 2 + .05), wy, z + (hash(k + i) - .5) * (d - 3)); wn.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; S.add(wn); }
    if (hash(i + 11) > .3) { const tr = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 0), M(PAL.tree, { flatShading: true }));
      tr.position.set(side * 21.5, 3.2, z + 5); S.add(tr); box(.4, 2, .4, M(0x5a4636), side * 21.5, 1, z + 5); }
  }
  // street lamps on the median
  for (let z = 50; z > -300; z -= 25) { box(.25, 8, .25, M(0x5b5b66), 0, 4, z + 12); const b = new THREE.Mesh(new THREE.SphereGeometry(.45, 8, 6), winM); b.position.set(0, 8, z + 12); S.add(b); }
  // traffic
  const cols = [0xe5372b, 0xf6f1e7, 0x2b35f5, 0xf2c14e, 0x9a948c, 0x33343d, 0xb9e36a];
  for (let i = 0; i < 22; i++) { const right = i % 2; car(cols[i % 7], (right ? 1 : -1) * (i % 4 < 2 ? 5.2 : 12.8), 50 - i * 22, right ? 1 : -1); }
}

// camera path: low dolly under the deck -> crane up -> near top-down over the construction pier
const KEYS = [
  { t: 0.0, p: [10.5, 2.4, 84], l: [-1, 16, 22] },
  { t: 2.0, p: [9.8, 2.9, 58], l: [-1, 17, 0] },
  { t: 3.3, p: [50, 58, -90], l: [0, 15, -120], e: ease.inOut },
  { t: 6.8, p: [38, 74, -108], l: [0, 15, -121], e: ease.out },
];
function camAt(t) {
  let a = KEYS[0], b = KEYS[KEYS.length - 1];
  for (let i = 0; i < KEYS.length - 1; i++) if (t >= KEYS[i].t && t <= KEYS[i + 1].t) { a = KEYS[i]; b = KEYS[i + 1]; break; }
  if (t > b.t) a = b;
  const k = a === b ? 0 : (b.e || ease.lin)(clamp((t - a.t) / (b.t - a.t)));
  const v = (u, w) => u.map((x, i) => lerp(x, w[i], k));
  return { p: v(a.p, b.p), l: v(a.l, b.l) };
}
const ROT0 = 3.75, ROT1 = 5.55;               // beam turns 90° here (slow, heavy, settles)
const rot = t => { const k = clamp((t - ROT0) / (ROT1 - ROT0)); return Math.PI / 2 * (1 - (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)); };

function world(g, t) {
  // sky
  const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, PAL.skyTop); sk.addColorStop(.45, PAL.skyMid); sk.addColorStop(.75, PAL.skyLow); sk.addColorStop(1, '#ffd29a');
  g.fillStyle = sk; g.fillRect(0, 0, W, H);
  const c = camAt(t); CAM.position.set(...c.p); CAM.lookAt(...c.l);
  for (const k of CARS) { let z = k.z0 + k.dir * k.v * t; k.g.position.z = z; }
  BEAM.rotation.y = rot(t);
  R.render(S, CAM); g.drawImage(CV, 0, 0);
}

// ---------- 2D overlay ----------
const proj = (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(CAM); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z]; };
function callout(g, t, t0, t1, anchor, EX, EY, side, label, sub) { // line from 3D anchor to absolute screen point
  const a = prog(t, t0, t0 + .35, ease.out) * (1 - prog(t, t1, t1 + .25)); if (a < .01) return;
  const [x, y] = anchor; const ex = lerp(x, EX, a), ey = lerp(y, EY, a), dx = side;
  g.save(); g.globalAlpha = Math.min(1, a * 1.4);
  g.strokeStyle = '#fff'; g.lineWidth = 5; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 10;
  g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.lineTo(ex + Math.sign(dx) * 70 * a, ey); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 13 * a, 0, 7); g.fill();
  g.font = `800 56px ${C.font}`; g.textAlign = dx > 0 ? 'left' : 'right'; g.textBaseline = 'bottom';
  g.fillText(label, ex + Math.sign(dx) * 86 * a, ey + 22);
  if (sub) { g.font = `700 32px ${C.font}`; g.globalAlpha *= .85; g.fillText(sub, ex + Math.sign(dx) * 86 * a, ey + 66); }
  g.restore();
}
function bigNum(g, t, t0, txt, x, y) { // arrives from oversize, decelerates, no bounce
  const k = prog(t, t0, t0 + .26, ease.outExpo); if (k <= 0) return;
  const s = lerp(2.6, 1, k);
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, k * 2);
  g.font = `900 150px ${C.font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 16; g.strokeStyle = '#1b1817'; g.lineJoin = 'round'; g.strokeText(txt, 0, 0); g.fillStyle = '#fff'; g.fillText(txt, 0, 0);
  g.restore();
}
const CAPS = [
  [0.15, 1.95, 'Lihat kepala tiang tol layang ini.', 'Look at the pier head of this flyover.'],
  [2.05, 3.65, 'Dulu dicor sejajar jalan,', 'It was cast parallel to the road,'],
  [3.7, 6.9, 'lalu diputar 90 derajat.', 'then rotated 90 degrees.'],
];
function captions(g, t) {
  for (const [a, b, id, en] of CAPS) {
    const k = prog(t, a, a + .12) * (1 - prog(t, b, b + .1)); if (k < .01) continue;
    g.save(); g.globalAlpha = k; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.font = `800 64px ${C.font}`; g.lineWidth = 12; g.strokeStyle = 'rgba(15,12,20,.9)'; g.strokeText(id, W / 2, 1480); g.fillStyle = '#fff'; g.fillText(id, W / 2, 1480);
    g.font = `700 36px ${C.font}`; g.lineWidth = 8; g.strokeText(en, W / 2, 1552); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(en, W / 2, 1552);
    g.restore();
  }
}
function arc90(g, t) { // dashed rotation guide drawn on the road plane around the pier
  const a = prog(t, 3.35, 3.7) * (1 - prog(t, 6.2, 6.5)); if (a < .01) return;
  const done = clamp((t - ROT0) / (ROT1 - ROT0));
  g.save(); g.globalAlpha = a; g.setLineDash([22, 16]); g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,.9)';
  g.beginPath(); for (let i = 0; i <= 40; i++) { const th = Math.PI / 2 * (i / 40); const [x, y] = proj(Math.sin(th) * 17, 21.5, -120 + Math.cos(th) * 17); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.setLineDash([]); g.strokeStyle = '#ffb16a'; g.lineWidth = 10;
  g.beginPath(); for (let i = 0; i <= 40; i++) { const th = Math.PI / 2 * (i / 40) * done; const [x, y] = proj(Math.sin(th) * 17, 21.5, -120 + Math.cos(th) * 17); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  const th = Math.PI / 2 * done, [hx, hy] = proj(Math.sin(th) * 17, 21.5, -120 + Math.cos(th) * 17);
  g.fillStyle = '#ffb16a'; g.beginPath(); g.arc(hx, hy, 14, 0, 7); g.fill();
  const [cx, cy] = proj(0, 21.5, -120), [mx, my] = proj(Math.sin(Math.PI / 4) * 17, 21.5, -120 + Math.cos(Math.PI / 4) * 17);
  const ux = mx - cx, uy = my - cy, ul = Math.hypot(ux, uy) || 1;
  g.font = `900 84px ${C.font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = 12; g.strokeStyle = '#1b1817'; const lab = `${Math.round(90 * ease.inOut(done))}°`, lx = mx + ux / ul * 90, ly = my + uy / ul * 90;
  g.strokeText(lab, lx, ly); g.fillStyle = '#fff'; g.fillText(lab, lx, ly);
  g.restore();
}
function finish(g, t) { // film grain at 12 fps + cinematic vignette
  const v = g.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .5, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,6,20,.45)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  const f = Math.floor(t * 12); g.save(); g.globalAlpha = .05;
  for (let i = 0; i < 900; i++) { g.fillStyle = hash(i + f * 977) > .5 ? '#fff' : '#000'; g.fillRect(hash(i * 3 + f) * W, hash(i * 7 + f * 3) * H, 2, 2); }
  g.restore();
}
function overlay(g, t) {
  const c = camAt(t); CAM.position.set(...c.p); CAM.lookAt(...c.l); CAM.updateMatrixWorld();
  callout(g, t, .75, 1.95, proj(-5, 16, 0).slice(0, 2), 230, 1080, 1, 'Kepala tiang', 'pier head');
  callout(g, t, 2.6, 3.65, proj(0, 20.5, -128).slice(0, 2), 560, 520, -1, 'Sejajar jalan', 'parallel to the road');
  arc90(g, t);
  bigNum(g, t, 4.25, '±480 TON', W / 2, 360);
  captions(g, t);
  finish(g, t);
}

startToon({ build: async () => build(), draw: (g, t) => world(g, t), overlay, blurSamples: 2, shutter: .5 });
