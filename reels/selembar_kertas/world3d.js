// world3d: a Three.js cel world that matches the 2D C&H toon line (vendor/toon.js).
// 2-band toon shading, constant-width ink hull in screen pixels, paper fog, and a world->screen projection
// so 2D rubber-hose characters can stand inside the 3D set.
import * as THREE from '../../vendor/three.module.js';
import { W, H, C, track, hash } from '../../vendor/toon.js';

export { THREE };
export const PAPER = 0xF6F1E7, PAPER2 = 0xEDE5D6, INK = 0x1B1817;
export let R, S, CAM, CV;
let OUTLINES = [];

const grad = (() => { // two flat bands: shadow side and lit side, nothing in between (cel look)
  const d = new Uint8Array([168, 168, 168, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 2, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const MATS = new Map();
export const toon = (c) => { if (!MATS.has(c)) MATS.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: grad })); return MATS.get(c); };
export const flat = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });

// Average the normals of vertices that share a position, so the hull does not crack at hard corners.
function smoothNormals(geo) {
  const p = geo.attributes.position, n = geo.attributes.normal, acc = new Map(), key = i => `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
  for (let i = 0; i < p.count; i++) { const k = key(i), v = acc.get(k) || [0, 0, 0]; v[0] += n.getX(i); v[1] += n.getY(i); v[2] += n.getZ(i); acc.set(k, v); }
  const out = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const v = acc.get(key(i)), l = Math.hypot(...v) || 1; out.set([v[0] / l, v[1] / l, v[2] / l], i * 3); }
  geo.setAttribute('onormal', new THREE.BufferAttribute(out, 3));
}
function hullMat(px) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { thick: { value: px }, res: { value: new THREE.Vector2(W, H) }, col: { value: new THREE.Color(INK) },
      fogCol: { value: new THREE.Color(PAPER) }, fogNear: { value: 60 }, fogFar: { value: 260 } },
    vertexShader: `uniform float thick; uniform vec2 res; attribute vec3 onormal; varying float vD;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vec4 c = projectionMatrix*mv; vD = -mv.z;
        vec3 n = normalize((modelViewMatrix*vec4(onormal,0.)).xyz); vec2 d = (projectionMatrix*vec4(n,0.)).xy;
        float l = length(d); if (l > 1e-5) c.xy += d / l * thick * 2. / res * c.w; gl_Position = c; }`,
    fragmentShader: `uniform vec3 col; uniform vec3 fogCol; uniform float fogNear, fogFar; varying float vD;
      void main(){ float f = smoothstep(fogNear, fogFar, vD); gl_FragColor = vec4(mix(col, fogCol, f), 1.); }`,
  });
}
// Ink outline in screen pixels (5 px ≈ the 2D guy's 7-9 px line at the size characters are drawn).
export function ink(mesh, px = 8) {
  if (!mesh.geometry.attributes.onormal) smoothNormals(mesh.geometry);
  const o = new THREE.Mesh(mesh.geometry, hullMat(px)); o.userData.base = px; o.renderOrder = -1; mesh.add(o); OUTLINES.push(o); return mesh;
}
export function mesh(geo, color, x = 0, y = 0, z = 0, line = 8, parent = null) {
  const m = new THREE.Mesh(geo, toon(color)); m.position.set(x, y, z); if (line) ink(m, line); (parent || S).add(m); return m;
}
export const box = (w, h, d, c, x, y, z, line, parent) => mesh(new THREE.BoxGeometry(w, h, d), c, x, y, z, line, parent);
export const cyl = (r0, r1, h, c, x, y, z, line, parent, seg = 18) => mesh(new THREE.CylinderGeometry(r0, r1, h, seg), c, x, y, z, line, parent);

export function initWorld() {
  CV = document.createElement('canvas'); CV.width = W; CV.height = H;
  R = new THREE.WebGLRenderer({ canvas: CV, alpha: true, antialias: true, preserveDrawingBuffer: true });
  R.setClearColor(0, 0); R.outputColorSpace = THREE.SRGBColorSpace;
  S = new THREE.Scene(); S.fog = new THREE.Fog(PAPER, 60, 260);
  CAM = new THREE.PerspectiveCamera(40, W / H, .3, 600);
  S.add(new THREE.HemisphereLight(0xfffaf0, 0xd8cdb8, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-60, 90, 50); S.add(key);
  OUTLINES = [];
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), flat(0xE4D9C4)); ground.rotation.x = -Math.PI / 2; ground.position.y = -.01; S.add(ground);
}

// camera keys: {t, px,py,pz, lx,ly,lz, fov?, e?}; interpolation via toon.js track (eased segments)
let CK = [];
export const setCamKeys = k => { CK = k; };
export const camAt = t => track(CK, t);
export function placeCam(t, shake = { x: 0, y: 0 }) {
  const c = camAt(t);
  CAM.position.set(c.px, c.py, c.pz); CAM.lookAt(c.lx, c.ly, c.lz);
  if (c.fov) { CAM.fov = c.fov; CAM.updateProjectionMatrix(); }
  CAM.updateMatrixWorld();
  return c;
}
// world -> screen. Returns [x, y, depth, pxPerUnit] (pxPerUnit = screen size of 1 world unit at that point).
const V = new THREE.Vector3(), U = new THREE.Vector3();
export function proj(x, y, z) {
  V.set(x, y, z).project(CAM); const sx = (V.x + 1) / 2 * W, sy = (1 - V.y) / 2 * H, d = V.z;
  U.set(x, y + 1, z).project(CAM); const py = (1 - U.y) / 2 * H;
  return [sx, sy, d, Math.abs(sy - py)];
}
export function renderWorld(g, t) {
  const B = Math.floor(t * 12); // line boil at 12 fps, like the 2D characters
  for (const o of OUTLINES) o.material.uniforms.thick.value = o.userData.base * (1 + (hash(B * 3.1 + o.id) - .5) * .22);
  R.render(S, CAM); g.drawImage(CV, 0, 0);
}
// soft contact shadow on the ground (flat, unlit)
export function groundShadow(x, z, rx, rz, a = .14, parent = null) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(1, 32), flat(INK, { transparent: true, opacity: a, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.scale.set(rx, rz, 1); m.position.set(x, .02, z); (parent || S).add(m); return m;
}
