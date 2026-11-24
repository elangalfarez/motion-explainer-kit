// Ink Falls Up - state + GL plumbing. Pure render(t), seek-safe (camera spring integrated from 0 every call).
const SDUR = 9.0;
const TIPX = 1000, TIPY = 420, S = 2150, X0 = 1050;
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => { const u = cl((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const eOut = u => 1 - Math.pow(1 - cl(u), 3), eOut5 = u => 1 - Math.pow(1 - cl(u), 5), eIn = u => Math.pow(cl(u), 3);
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---- hero drop kinematics ----
const SNAP = 1.95, V0 = 300, ACC = 1646, HERO_R = 24;
const Y_SNAP = TIPY - 3 - HERO_R - 26;
const heroY = tau => Y_SNAP + V0 * tau + 0.5 * ACC * tau * tau;
const TI = SNAP + (-V0 + Math.sqrt(V0 * V0 + 2 * ACC * (S - HERO_R - Y_SNAP))) / ACC; window.TI = TI;
const heroX = tau => TIPX + 50 * eOut(tau / 0.22) + 10 * ss(0.3, 1.3, tau);
// satellites
const SATS = [{ lag: 0.10, r: 7 }, { lag: 0.19, r: 4.5 }];
const MIST = [0.22, 0.34, 0.46, 0.58, 0.70, 0.82].map((s, i) => ({ s, r: 5.5 - i * 0.6, dx: (hash(i + 40) - 0.5) * 18 }));
const satY = (tau, s) => Y_SNAP - 14 + V0 * 0.85 * (tau - s.lag) + 0.5 * ACC * 0.97 * Math.max(0, tau - s.lag) ** 2;
// crown droplets (spray down, inverted gravity pulls them back up)
const CROWN = Array.from({ length: 10 }, (_, i) => {
  const s = i % 2 ? 1 : -1, h = hash(i + 3);
  return { vx: s * (70 + 230 * h), vy: -(180 + 260 * hash(i + 11)), r: 2.5 + 3.5 * hash(i + 7), g: 1500 };
});
const crownT = c => 2 * -c.vy / c.g;            // time to return to the surface
// Worthington jet + its pinched drop
const JET_PINCH = 0.2, JD = { vy: -520, g: 1350, r: 8.5 };
const jetT = 2 * -JD.vy / JD.g;
// RT fingers -> rain
const NF = 22, RAIN_G = 1500, WAVES = [7.62, 7.92, 8.20];
const FING = Array.from({ length: NF }, (_, i) => {
  const h = hash(i * 3.1 + 1), h2 = hash(i * 5.7 + 2);
  const x = X0 + (i - (NF - 1) / 2) * 44 + (h - 0.5) * 34 + 26 * Math.sin(i * 1.7);
  const L = 30 + 120 * h2 * h2 + 50 * (1 - Math.abs(i - (NF - 1) / 2) / NF);
  const r = 7 + 8 * h * h;
  const y0 = S - L - r;
  const T = Math.sqrt(2 * (y0 - (TIPY - 8)) / RAIN_G);
  const wv = [0, 1, 2, 1, 0, 2, 1, 0, 2, 0, 1, 2, 0, 1, 2, 1, 0, 2, 1, 0, 2, 1][i];
  const tp = WAVES[wv] + 0.035 * (hash(i * 9.3 + 4) - 0.5) - T;
  return { x, L, r, tp, y0, T, tg: 5.75 + 0.12 * h };
});
const RAIN_END = Math.max(...FING.map(f => f.tp + f.T));
window.RAIN_END = RAIN_END;

function rainPos(f, t) {
  const tau = t - f.tp; const p = cl(tau / f.T);
  const y = f.y0 - 0.5 * RAIN_G * tau * tau;
  const x = f.x + (TIPX - f.x) * Math.pow(ss(0.1, 1, p), 1.3);
  return { x, y, v: RAIN_G * tau };
}

// ripple events
const RIPS = [[TI, X0 + 0, 1.0]];
SATS.forEach((s, i) => { const tt = SNAP + bisect(tau => satY(tau, s) - (S - s.r), 0.5, 3); RIPS.push([tt, heroX(tt - SNAP) - 2 * (i + 1), 0.22]); s.TH = tt; });
CROWN.forEach(c => RIPS.push([TI + crownT(c) + 0.04, X0 + c.vx * crownT(c), 0.1 + c.r * 0.02]));
RIPS.push([TI + JET_PINCH + jetT, X0, 0.35]);
function bisect(f, a, b) { for (let i = 0; i < 50; i++) { const m = (a + b) / 2; (f(a) * f(m) <= 0) ? b = m : a = m; } return (a + b) / 2; }

// ---- drops for frame t ----
function drops(t) {
  const D = [];
  const add = (x, y, r, a, tx = 0, ty = 0, tr = 0) => D.push([x, y, r, a, tx, ty, tr, 0]);
  // bead at the tip: teach drop (0-0.45), and the re-formed bead at the end (loop)
  if (t < 0.45) {
    const r = 9 + 5 * eOut(t / 0.4), s = 14 * ss(0.22, 0.45, t);
    const cy = TIPY - 3 - r - s;
    add(TIPX, cy, r, 1, 0, TIPY + 2 - cy, r * 0.45 * (1 - ss(0.28, 0.45, t)) + 1.5);
  } else if (t < 1.1) {
    const tau = t - 0.45, cy = TIPY - 3 - 14 - 14 - 0.5 * 2600 * tau * tau;
    add(TIPX, cy, 13, 1, 0, Math.min(46, 2600 * tau * 0.02) + 4, 3);
    if (tau < 0.12) add(TIPX, TIPY - 4, 4 * (1 - tau / 0.12), 1);
  }
  // hero bead
  if (t >= 0.6 && t < SNAP) {
    const g = eOut5((t - 0.6) / 0.85);
    const wob = 1 + 0.045 * Math.sin((t - 0.6) * 21) * Math.exp(-(t - 0.6) * 2.5);
    const r = HERO_R * g * wob, s = 26 * eIn(ss(1.3, SNAP - 0.02, t));
    const cy = TIPY - 3 - r - s;
    add(TIPX, cy, Math.max(r, 0.01), 1, 0, TIPY + 2 - cy, r * 0.5 * (1 - 0.72 * ss(1.45, SNAP - 0.02, t)) + 1);
  } else if (t >= SNAP && t < TI) {
    const tau = t - SNAP, y = heroY(tau), v = V0 + ACC * tau;
    const sq = Math.exp(-tau * 30);
    const st = ss(0.05, 0.6, tau);
    add(heroX(tau), y, HERO_R * (1 + 0.14 * sq) * (1 - 0.1 * st), 1, -9 * ss(0, 0.2, tau), -(22 + Math.min(150, v * 0.05)) * (1 - sq * 0.6), HERO_R * 0.22);
    MIST.forEach(m => { const u = tau - m.s; if (u > 0) { const sy = heroY(m.s) - HERO_R * 1.4 + (V0 + ACC * m.s) * 0.55 * u + 0.5 * ACC * 0.5 * u * u;
      const rr = m.r * (1 - ss(0.25, 0.75, u)); if (rr > 0.3 && sy < S - 10) add(heroX(m.s) + m.dx, sy, rr, 1, 0, -Math.min(26, rr * 5), rr * 0.4); } });
    if (tau < 0.14) add(TIPX, TIPY - 5, 5 * (1 - tau / 0.14), 1, 0, 6, 2);    // neck remnant retracts
    SATS.forEach(s => { if (tau > s.lag && t < s.TH) { const sy = satY(tau, s); add(heroX(tau) - 6, sy, s.r, 1, 0, -Math.min(30, (V0 + ACC * (tau - s.lag)) * 0.012), s.r * 0.4); } });
  }
  if (t >= TI && t < TI + 1.4) {
    const tau = t - TI;
    CROWN.forEach(c => { const T = crownT(c); if (tau < T) {
      const x = X0 + c.vx * tau, y = S - 4 + c.vy * tau + 0.5 * c.g * tau * tau; const vy = c.vy + c.g * tau;
      add(x, y, c.r * ss(0, 0.04, tau), 1, -c.vx * 0.02, -vy * 0.02, c.r * 0.3); } });
    // jet: grows down then pinches
    const jl = 60 * eOut(tau / JET_PINCH) * (tau < JET_PINCH ? 1 : Math.max(0, 1 - (tau - JET_PINCH) / 0.18));
    if (jl > 2) add(X0, S - jl, 9 * ss(0, 0.06, tau) * (tau < JET_PINCH ? 1 : 0.6), 1, 0, jl + 6, 5);
    const jt = tau - JET_PINCH; if (jt > 0 && jt < jetT) {
      const y = S - 60 - 9 + JD.vy * jt + 0.5 * JD.g * jt * jt;
      if (y < S - 2) add(X0, y, JD.r, 1, 0, -(JD.vy + JD.g * jt) * 0.022, 3);
    }
  }
  // RT fingers and rain
  if (t > 5.7 && t < RAIN_END + 0.1) {
    FING.forEach(f => {
      if (t < f.tp) {
        const g = eIn(ss(f.tg, f.tp, t)); const L = f.L * g;
        if (L > 1) add(f.x, S - 6 - L, f.r * (0.45 + 0.55 * g), 1, 0, L + 10, f.r * 0.45);
      } else {
        const tr = t - f.tp; const L = f.L * (1 - eOut(tr / 0.22));
        if (L > 1) add(f.x, S - 4 - L * 0.6, 3.5 * (1 - tr / 0.22) + 0.5, 1, 0, L * 0.6 + 6, 3);
        const tau = tr;
        if (tau < f.T) {
          const p = rainPos(f, t); const fade = 1 - ss(f.T - 0.05, f.T, tau);
          const q = rainPos(f, Math.max(f.tp, t - 0.05)); const pp = cl(tau / f.T), sh = 1 - 0.55 * ss(0.7, 1, pp);
          add(p.x, p.y, f.r * 0.8 * fade * sh + 0.01, 1, (q.x - p.x) * 0.6, Math.min(42, p.v * 0.016) + 4, f.r * 0.5 * sh);
        }
      }
    });
  }
  // re-formed bead (loop target: r=9 at DUR, same as t=0)
  if (t > 7.6) {
    let got = 0; FING.forEach(f => got += ss(f.tp + f.T - 0.04, f.tp + f.T + 0.1, t)); got /= NF;
    const r = 9 * eOut(ss(0, 1, got) * 0.55 + 0.45 * ss(RAIN_END, SDUR, t));
    if (r > 0.3) { const cy = TIPY - 3 - r; add(TIPX, cy, r, 1, 0, TIPY + 2 - cy, r * 0.45 + 1.5); }
  }
  return D;
}

function brushPulse(t) {
  let p = 0; FING.forEach(f => { const d = t - (f.tp + f.T); if (d > 0) p += Math.exp(-d * 9) * (1 - Math.exp(-d * 80)); });
  return Math.min(2.2, p * 0.45);
}

// camera target (continuous) + spring follow
const ZB = 2.0, ZS = 1.3, YB = 420 + 140 / ZB, YS = S + 380 / ZS;
function camTarget(t) {
  let y = YB, z = ZB - 0.06 * ss(0, 1.9, t);
  if (t >= SNAP) {
    const tau = Math.min(t, TI) - SNAP;
    const zr = ZB - 0.06 - (ZB - 0.06 - ZS) * ss(SNAP + 0.3, TI - 0.12, t);
    z = zr;
    const lead = (V0 + ACC * tau) * 0.09 * ss(SNAP, SNAP + 0.4, t);
    y = Math.min(YB + (heroY(tau) - Y_SNAP) + lead, YS);
    if (t >= TI) { y = YS + 120 * ss(TI + 0.25, 6.0, t); z = ZS + 0.3 * ss(TI + 0.25, 6.0, t); }
  }
  if (t > 6.3) {
    let m = 0; FING.forEach(f => { m += (t < f.tp ? f.y0 : rainPos(f, Math.min(t, f.tp + f.T)).y); }); m /= NF;
    const k = ss(6.3, 6.7, t);
    const ry = Math.max(YB, m - 330);
    y = Math.min(y, ry + (YS + 120 - ry) * (1 - k));
    z = z + (ZS + 0.3 + (ZB - ZS - 0.3) * ss(7.0, 8.2, t) - z) * k;
  }
  return [y, z];
}
function camera(t) {
  // critically damped spring integrated from 0 (seek-safe)
  const w = 10, dt = 1 / 600; let y = camTarget(0)[0], v = 0, z = camTarget(0)[1], vz = 0;
  for (let s = 0; s < t; s += dt) {
    const [ty, tz] = camTarget(s);
    const a = w * w * (ty - y) - 2 * w * v; v += a * dt; y += v * dt;
    const az = 36 * (tz - z) - 12 * vz; vz += az * dt; z += vz * dt;
  }
  return [y, z];
}
// cache camera per t to keep MB cheap
const camCache = new Map();
function cam(t) { const k = Math.round(t * 2400); if (!camCache.has(k)) camCache.set(k, camera(k / 2400)); return camCache.get(k); }

function shake(t) {
  const ev = [[SNAP, 4], [TI, 15], [6.55, 3]];
  let x = 0, y = 0;
  ev.forEach(([t0, a], i) => { const d = t - t0; if (d >= 0 && d < 0.6) { const k = a * Math.exp(-d * 9);
    x += k * Math.sin(d * 83 + i * 2.1) * Math.cos(d * 37); y += k * Math.cos(d * 71 + i) * Math.sin(d * 53 + 1); } });
  return [x, y];
}
function dustOff(t) {
  // integral of drift velocity: down 8px/s, up 46px/s after the snap, down again after gravity returns
  const v = s => -8 + 54 * ss(SNAP, SNAP + 0.5, s) * (1 - ss(5.9, 6.6, s));
  let o = 0; for (let s = 0; s < t; s += 1 / 120) o += v(s) / 120; return o;
}

// ---- GL ----
const cv = document.getElementById('c');
const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
const VS = `#version 300 es
in vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
const BLIT = `#version 300 es
precision highp float;uniform sampler2D tx;uniform float k;out vec4 o;void main(){o=vec4(texture(tx,gl_FragCoord.xy/vec2(1920.,1080.)).rgb*k,1.);}`;
function prog(fs) {
  const mk = (ty, s) => { const x = gl.createShader(ty); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(x)); return x; };
  const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.log(gl.getProgramInfoLog(p)); return p;
}
const P = prog(window.FS), PB = prog(BLIT);
const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
const hasF = !!gl.getExtension('EXT_color_buffer_float');
const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texImage2D(gl.TEXTURE_2D, 0, hasF ? gl.RGBA16F : gl.RGBA8, 1920, 1080, 0, gl.RGBA, hasF ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
const U = n => gl.getUniformLocation(P, n);
const LOC = {}; ['t', 'TI', 'zoom', 'flash', 'pulse', 'plumeFade', 'sinkK', 'cam', 'shk', 'dust', 'dA', 'dB', 'nD', 'rip', 'nR'].forEach(n => LOC[n] = U(n));

function setUniforms(t) {
  gl.useProgram(P);
  const [cy, z] = cam(t), [sx, sy] = shake(t);
  const camx = 960 + 30 * ss(SNAP, TI, t) * (1 - ss(6.4, 7.6, t));
  gl.uniform1f(LOC.t, t); gl.uniform1f(LOC.TI, TI); gl.uniform1f(LOC.zoom, z);
  const fl = t >= TI ? Math.exp(-(t - TI) * 3.2) * (1 - Math.exp(-(t - TI) * 40)) : 0;
  gl.uniform1f(LOC.flash, fl); gl.uniform1f(LOC.pulse, brushPulse(t));
  gl.uniform1f(LOC.plumeFade, 1 - 0.8 * ss(6.4, 7.4, t)); gl.uniform1f(LOC.sinkK, ss(5.75, 6.5, t));
  gl.uniform2f(LOC.cam, camx, cy); gl.uniform2f(LOC.shk, sx, sy); gl.uniform2f(LOC.dust, 0, dustOff(t));
  const D = drops(t).slice(0, 64); const a = new Float32Array(256), b = new Float32Array(256);
  D.forEach((d, i) => { a.set(d.slice(0, 4), i * 4); b.set(d.slice(4, 8), i * 4); });
  gl.uniform4fv(LOC.dA, a); gl.uniform4fv(LOC.dB, b); gl.uniform1i(LOC.nD, D.length);
  const r = new Float32Array(64); RIPS.slice(0, 16).forEach((e, i) => r.set([e[0], e[1], e[2], 0], i * 4));
  gl.uniform4fv(LOC.rip, r); gl.uniform1i(LOC.nR, Math.min(16, RIPS.length));
}

// time warp: scene runs faster (x1.9) through the bead swell so the film opens on the snap
const spd = t => 1 + 0.9 * ss(0.35, 0.6, t) * (1 - ss(1.72, 1.95, t));
const WT = [0], WS = [0]; { let T = 0; for (let t = 0; t < SDUR - 1e-9; t += 1 / 1200) { T += (1 / 1200) / spd(t + 1 / 2400); WT.push(T); WS.push(t + 1 / 1200); } }
const DUR = WT[WT.length - 1]; window.DUR = DUR;
function warp(T) { let lo = 0, hi = WT.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; WT[m] <= T ? lo = m : hi = m; }
  const u = (T - WT[lo]) / Math.max(WT[hi] - WT[lo], 1e-9); return WS[lo] + (WS[hi] - WS[lo]) * cl(u); }
function unwarp(t) { const i = Math.min(WS.length - 1, Math.max(0, Math.round(t * 1200))); return WT[i]; }
window.warp = warp; window.unwarp = unwarp;
window.events = () => ({ TI, RAIN_END, DUR, fing: FING.map(f => [f.tp, f.tp + f.T, f.x]), rips: RIPS.map(r => [r[0], r[1], r[2]]) });
window.render = function (T) {
  const K = Math.max(1, window.MBK || 1), sh = 0.5 / 60;
  gl.viewport(0, 0, 1920, 1080);
  if (K === 1) { gl.bindFramebuffer(gl.FRAMEBUFFER, null); setUniforms(warp(T)); gl.disable(gl.BLEND); gl.drawArrays(gl.TRIANGLES, 0, 3); return; }
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  for (let k = 0; k < K; k++) { setUniforms(warp(Math.max(0, T + ((k + 0.5) / K - 0.5) * sh))); gl.drawArrays(gl.TRIANGLES, 0, 3); }
  gl.disable(gl.BLEND); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(PB); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(gl.getUniformLocation(PB, 'tx'), 0); gl.uniform1f(gl.getUniformLocation(PB, 'k'), 1 / K);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
};
console.log('TI', TI.toFixed(3), 'RAIN_END', RAIN_END.toFixed(3), 'nrip', RIPS.length, 'floatFB', hasF);
