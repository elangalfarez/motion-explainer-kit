// toon3d: a Three.js hero object that lives inside the 2D toon world.
// Cel shading (3-band MeshToonMaterial) + inverted-hull ink outline that boils at 12 fps, paper palette,
// rendered to an offscreen WebGL canvas, then drawn into the Canvas2D frame like any other prop.
// Use it for ONE screenshot-worthy hero moment per reel (a coin, a tag, a phone, a trophy), not everywhere.
import * as THREE from './three.module.js';
import { C } from './toon.js';

function bands(n = 3) {
  const d = new Uint8Array(n * 4); const lv = n === 3 ? [110, 190, 255] : [...Array(n)].map((_, i) => 90 + i * 165 / (n - 1));
  lv.forEach((v, i) => d.set([v, v, v, 255], i * 4));
  const tx = new THREE.DataTexture(d, n, 1, THREE.RGBAFormat); tx.minFilter = tx.magFilter = THREE.NearestFilter; tx.needsUpdate = true; return tx;
}

export class Toon3D {
  constructor(w = 800, h = 1000) {
    this.canvas = document.createElement('canvas'); this.canvas.width = w; this.canvas.height = h;
    this.r = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    this.r.setClearColor(0x000000, 0); this.r.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(28, w / h, 10, 20000); this.cam.position.set(0, 0, 2000);
    const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(-600, 900, 1200); this.scene.add(key);
    this.scene.add(new THREE.AmbientLight(0xffffff, .9));
    this.grad = bands(3); this.outlines = [];
    this.root = new THREE.Group(); this.scene.add(this.root);
  }
  toon(color, map = null) { return new THREE.MeshToonMaterial({ color, gradientMap: this.grad, map }); }
  // inverted hull: back faces pushed out along normals, flat ink
  outline(mesh, px = 9) {
    const m = new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide });
    const u = { thick: { value: px } }; m.onBeforeCompile = s => { s.uniforms.thick = u.thick;
      s.vertexShader = 'uniform float thick;\n' + s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * thick;'); };
    const o = new THREE.Mesh(mesh.geometry, m); o.userData.u = u; o.userData.base = px; mesh.add(o); this.outlines.push(o); return o;
  }
  // canvas texture helper (2D drawing on a face)
  tex(w, h, drawFn) { const c = document.createElement('canvas'); c.width = w; c.height = h; drawFn(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  render(boil = 0) {
    for (const o of this.outlines) o.userData.u.thick.value = o.userData.base * (1 + (Math.sin(boil * 12.9898) * .5) * .25);
    this.r.render(this.scene, this.cam); return this.canvas;
  }
}

// Ready-made hero: a chunky price tag (shape with string hole), front face printed from a 2D draw function.
// Shape coordinates: x -150..150, y 0 (top) .. -440 (bottom), hole at (0,-70).
export function priceTag(T3, { color = C.lime, side = '#8FBF45', depth = 60, print }) {
  const s = new THREE.Shape();
  s.moveTo(-40, -20); s.lineTo(40, -20); s.lineTo(150, -110); s.lineTo(150, -440); s.lineTo(-150, -440); s.lineTo(-150, -110); s.closePath();
  const hole = new THREE.Path(); hole.absarc(0, -70, 22, 0, Math.PI * 2, true); s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 10, bevelSize: 8, bevelSegments: 3, curveSegments: 24 });
  geo.translate(0, 220, -depth / 2); // centre it
  const map = T3.tex(600, 880, (x, w, h) => { x.fillStyle = color; x.fillRect(0, 0, w, h); print && print(x, w, h); });
  // ExtrudeGeometry caps use shape coords as UVs: map x -150..150, y -440..0 to 0..1
  map.repeat.set(1 / 300, 1 / 440); map.offset.set(.5, 1);
  const front = T3.toon(0xffffff, map), sideM = T3.toon(side);
  const mesh = new THREE.Mesh(geo, [front, sideM]); T3.outline(mesh, 7); T3.root.add(mesh); return mesh;
}
