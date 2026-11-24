// ============================================================
//  Ensō That Won't Close (Disobeyed, law: form) - shared engine v2.
//  Pure draw(ctx, st). The film maps t -> st (filmState); the interactive page maps
//  pointer physics -> st. Ink is a baked per-pixel dry-brush deposition model
//  (bristle load x washi height field -> kasure), revealed, deformed and lit per frame.
//  The payoff is a paper slit between the two ends: the circle stays open forever.
// ============================================================
(function () {
const W = 1920, H = 1080, TAU = Math.PI * 2;
const CX = 960, CY = 548, R = 365;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const u = cl((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const eOut = u => 1 - Math.pow(1 - cl(u), 3), eOut5 = u => 1 - Math.pow(1 - cl(u), 5);
function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const hash2 = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
const noise1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
function n2(x, y) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash2(xi, yi), hash2(xi + 1, yi), u), lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u), v); }
function fbm2(x, y, o) { let f = 0, a = 0.5, s = 0; for (let k = 0; k < o; k++) { f += a * n2(x, y); s += a; a *= 0.5; x = x * 2.03 + 17.3; y = y * 2.03 + 9.1; } return f / s; }
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function kf(t, keys) { // smoothstep keys [[t,v]]
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1];
    if (t <= b[0]) { const u = (t - a[0]) / (b[0] - a[0]); return lerp(a[1], b[1], u * u * (3 - 2 * u)); } }
  return keys[keys.length - 1][1];
}
const mod = (a, n) => ((a % n) + n) % n;

// ---------------- stroke geometry ----------------
const A0 = 150 * Math.PI / 180, GAP = 32 * Math.PI / 180, SPAN = TAU - GAP;
const FH = 0.36; // share of the gap the head can travel; the tail's share (FT) is solved below so the ink really touches
function rAt(u) { return R * (1 + 0.022 * Math.sin(TAU * u + 0.9) + 0.012 * Math.sin(TAU * 2.3 * u + 2.1) - 0.045 * Math.pow(u, 3)); }
function pathAt(u) { const a = A0 + SPAN * u, r = rAt(u), cx = CX + 6 * u, cy = CY - 4 * u; return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, a }; }
function tangent(u) { const p = pathAt(Math.max(0, u - 0.001)), q = pathAt(Math.min(1, u + 0.001)); const d = Math.hypot(q.x - p.x, q.y - p.y) || 1; return { tx: (q.x - p.x) / d, ty: (q.y - p.y) / d }; }
function widthAt(u) { // brush pressure profile (px)
  const press = 86 * Math.exp(-Math.pow(u / 0.045, 2));
  let w = 66 + 10 * Math.sin(u * 6.5 + 0.4) * (1 - u) + 5 * Math.sin(u * 19 + 1.3) * (1 - u) - 27 * ss(0.42, 0.97, u);
  w = Math.max(w, press);
  w *= 1 - 0.7 * ss(0.95, 1.0, u);
  return w;
}
const T_BLOT = 0.30, T_S0 = 0.66, T_S1 = 2.70;
function strokeU(t) {
  if (t < T_S0) return t < T_BLOT ? -1 : 0;
  if (t >= T_S1) return 1;
  const x = (t - T_S0) / (T_S1 - T_S0);
  const base = y => 0.55 * (y * y * (3 - 2 * y)) + 0.45 * (1 - Math.pow(1 - y, 2.2));
  if (x < 0.86) return cl(0.93 * base(x / 0.86));
  return cl(0.93 + 0.07 * ss(0.86, 1, x)); // the lift: a last quick flick, bristles leaving the paper
}
function blotSpread(t) { return t < T_BLOT ? 0 : kf(t, [[T_BLOT, 0.0], [0.33, 0.66], [0.37, 0.9], [0.5, 0.97], [0.85, 1.03], [1.6, 1.22], [2.8, 1.52]]); }
const UT = new Float32Array(1025);
(function () { let j = 0; for (let t = T_S0; t <= T_S1 + 0.001 && j <= 1024; t += 0.0005) { const u = strokeU(t); while (j <= 1024 && j / 1024 <= u) { UT[j++] = t; } } while (j <= 1024) UT[j++] = T_S1; })();
const paintTime = u => UT[Math.max(0, Math.min(1024, (u * 1024) | 0))];

// tips at rest + contact point
const TIP_T = pathAt(1), TIP_H = pathAt(0);
const RT = Math.hypot(TIP_T.x - CX, TIP_T.y - CY), RH = Math.hypot(TIP_H.x - CX, TIP_H.y - CY);
const ANG_T = Math.atan2(TIP_T.y - CY, TIP_T.x - CX), ANG_H = Math.atan2(TIP_H.y - CY, TIP_H.x - CX);
// head blot geometry (shared with bake) and the real contact point: blot's back edge meets the visible tail tip
const DIR_B = (() => { const t0 = tangent(0); return Math.atan2(t0.ty, t0.tx); })();
const P0B = pathAt(0.01), B0x = P0B.x - 3, B0y = P0B.y + 1, RB = 57;
const ANG_B = Math.atan2(B0y - CY, B0x - CX), RBR = Math.hypot(B0x - CX, B0y - CY);
const U_VIS = 0.962, W_VIS = Math.pow(ss(0.70, 0.99, U_VIS), 1.25);
const THM = ANG_B - (RB * 0.9) / RBR - FH * GAP; // meeting angle
const FT = ((THM + 0.015) - (ANG_T - (1 - U_VIS) * SPAN)) / (GAP * W_VIS);
const G = (() => { const r = (rAt(U_VIS) + RBR) / 2; return { x: CX + Math.cos(THM) * r, y: CY + Math.sin(THM) * r, ax: TIP_H.x, ay: TIP_H.y, bx: TIP_T.x, by: TIP_T.y, th: THM }; })();
function tipPos(which, reach) { // world position of the VISIBLE tip for a given reach
  if (which === 'T') { const a = ANG_T - (1 - U_VIS) * SPAN + reach * FT * GAP * W_VIS, r = rAt(U_VIS); return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r }; }
  const a = ANG_B - (RB * 0.9) / RBR - reach * FH * GAP; return { x: CX + Math.cos(a) * RBR, y: CY + Math.sin(a) * RBR };
}

// ---------------- baked ink ----------------
const BX = CX - R - 140, BY = CY - R - 140, BW = 2 * R + 280, BH = 2 * R + 280, NP = BW * BH;
let OV, D, S, UU, LO, LN, AL, SP, GR, CRK, CID, RF, ARR, THK, CT, CWF, BLB, BLT;
let ACT_B, ACT_E, EX0, EY0, EW, EH;
let inkC, inkX, bodyC, bodyX, bodyImg, endC, endX, endImg, emB, emBX, emBImg, emE, emEX, emEImg, paperC;
const NB = 72;
function bake() {
  OV = new Float32Array(NP); D = new Float32Array(NP); S = new Float32Array(NP).fill(9); UU = new Float32Array(NP); LO = new Float32Array(NP); LN = new Float32Array(NP);
  AL = new Float32Array(NP); SP = new Float32Array(NP); GR = new Float32Array(NP); CRK = new Float32Array(NP); CID = new Float32Array(NP); RF = new Float32Array(NP); ARR = new Float32Array(NP); THK = new Float32Array(NP); CT = new Float32Array(NP); CWF = new Float32Array(NP); BLB = new Float32Array(NP); BLT = new Float32Array(NP);
  const r = rng(7), BK = [], BE = [], BDN = [], BLG = [];
  for (let b = 0; b < NB; b++) { const off = Math.abs(b / (NB - 1) * 2 - 1);
    BK.push(r()); BDN.push(0.55 + 0.45 * r()); BLG.push(r());
    BE.push(1 - 0.012 - 0.17 * Math.pow(r(), 1.6) * (0.4 + 0.6 * off)); }
  for (let py = 0; py < BH; py++) for (let px = 0; px < BW; px++) {
    const x = BX + px, y = BY + py, p = py * BW + px;
    // washi height field: pulp mottling + anisotropic fibre ridges
    const ph = 0.55 * fbm2(x * 0.11, y * 0.11, 3) + 0.45 * fbm2((x * 0.8 + y * 0.6) * 0.035, (y * 0.8 - x * 0.6) * 0.33, 2);
    let dS = 0, sS = 9, uS = 0, loS = 0, lnS = 0;
    // ---- stroke ----
    let th = Math.atan2(y - CY, x - CX), u = mod(th - A0, TAU) / SPAN; if (u > 1.035) u -= TAU / SPAN;
    if (u > -0.02 && u < 1.0) {
      const uc = cl(u, 0, 1), cx = CX + 6 * uc, cy = CY - 4 * uc;
      th = Math.atan2(y - cy, x - cx); u = mod(th - A0, TAU) / SPAN; if (u > 1.035) u -= TAU / SPAN;
      if (u > 0 && u < 1.0) {
        const rr = rAt(u) + 3.5 * noise1(u * 23 + 4) + 1.5 * noise1(u * 71), d = Math.hypot(x - cx, y - cy), w = widthAt(u) * (0.5 + 0.5 * ss(0, 0.035, u)), hw = w / 2;
        const lat = (d - rr) / hw;
        const loadBase = 1.12 - 0.95 * Math.pow(u, 0.95) + 0.14 * noise1(u * 9 + 2) + 0.42 * ss(0.78, 1.0, u);
        const dryE = cl(0.35 - loadBase + 0.3 * u);
        const eN = (0.03 + 0.16 * dryE) * noise1(u * 150 + (lat > 0 ? 0 : 77)) + (0.015 + 0.05 * dryE) * noise1(u * 700 + (lat > 0 ? 3 : 9));
        const inside = cl((1 + eN - Math.abs(lat)) * hw + 0.5);
        if (inside > 0) {
          const sU = u * 2140, sL = lat * hw;
          const lw = lat + 0.13 * noise1(u * 6 + lat * 1.3) + 0.05 * noise1(u * 29 + lat * 3.1) + 0.02 * noise1(u * 97);
          const bf = cl((lw + 1) * 0.5 + 0.018 * noise1(lw * 9 + u * 4 + 3) + 0.008 * noise1(lw * 31 - u * 9), 0, 0.9999) * NB, b = bf | 0, f = bf - b;
          const hair = 0.6 + 0.4 * Math.sin(f * Math.PI);
          // bundles: bristles clump into irregular groups that merge and split along the stroke
          const bund = fbm2(sU / 70 + 3, lw * 3.4 + 0.4 * noise1(u * 13), 3);
          // broad dry islands (paper left bare where the brush skipped), and pooled wet patches
          const isl = fbm2(sU / 46 + 11, sL / 7 + 5, 3), pool = fbm2(sU / 90 + 41, sL / 14 + 9, 2);
          const loadB = loadBase - (0.5 * lat * lat + 0.25 * BK[b]) * Math.pow(u, 1.3) + 0.08 * noise1(u * 31 + b * 0.71) + 0.55 * (bund - 0.5) * ss(0.12, 0.5, u) - 0.75 * ss(0.5, 0.75, isl) * ss(0.2, 0.55, u) + 0.25 * ss(0.55, 0.75, pool) * (1 - ss(0.6, 0.9, u)) + 0.12 * noise1(b * 0.29 + u * 4.5 + 7) * ss(0.25, 0.6, u);
          const dry = 1 - loadB;
          // streaks follow the paper's fibre direction + stroke direction, not per-lane dashes
          const dash = fbm2(sU / 16 + b * 0.37, sL / 1.4 + 0.6 * ph, 2);
          const surf = 0.52 * ph + 0.12 * hair * BDN[b] + 0.36 * dash;
          let cov = ss(dry - 0.14, dry + 0.14, surf + 0.06 * ss(0.75, 1, u));
          cov *= ss(BE[b] + 0.004, BE[b] - 0.02, u);
          dS = inside * cov * (0.55 + 0.45 * cl(loadB)) * (1 - (0.03 + 0.3 * cl(dry + 0.1)) * (1 - (0.4 + 0.6 * hair) * BDN[b] * (0.5 + dash))) * (0.86 + 0.14 * dash) * (0.9 + 0.1 * cl(pool * 1.6));
          if (u > 0.3 && u < 0.93) { const sw = 0.2 + 0.1 * noise1(u * 17 + 2), sl = -0.12 + 0.22 * noise1(u * 5 + 9), gb = ss(0.28, 0.42, fbm2(sU / 38 + 5, 3.1, 2)); // a narrow connected spine keeps the stroke one hand-made mark at phone size
            const spv = Math.exp(-Math.pow((lw - sl) / sw, 2)) * ss(0.3, 0.42, u) * ss(0.93, 0.8, u) * gb * (0.55 + 0.45 * ss(0.35, 0.6, dash));
            dS = Math.max(dS, inside * spv * 0.78); }
          if (u > 0.72) { // 3 strong bristle strands survive the dry tail (phone-size legibility), ending at different lengths
            let stv = 0; const SL = [[-0.38, 0.978, 1.2], [0.1, 0.999, 1.8], [0.47, 0.955, 1.0]];
            for (const q of SL) { const l0 = q[0] + 0.16 * noise1(u * 22 + q[0] * 9) + 0.06 * noise1(u * 90 + q[0] * 4); const brk = ss(0.3, 0.5, fbm2(sU / 11 + q[0] * 31, q[0] * 7 + 2, 2)); const g = Math.exp(-Math.pow((lw - l0) * hw / (q[2] * (0.7 + 0.8 * brk)), 2)) * ss(q[1], q[1] - 0.03, u) * (1 - 0.5 * ss(q[1] - 0.06, q[1], u)) * (0.45 + 0.55 * brk) * (0.82 + 0.18 * noise1(u * 300 + q[0] * 50)); if (g > stv) stv = g; }
            dS = Math.max(dS, inside * stv * 0.8 * ss(0.8, 0.93, u) * (0.75 + 0.25 * ss(0.4, 0.6, dash)));
            const isl2 = fbm2(sU / 30 + 71, sL / 4.2 + 13, 3); // wet ink islands between the strands: the tip stays a body of sumi, not a cage of lines
            dS = Math.max(dS, inside * ss(0.55, 0.66, isl2) * (0.5 + 0.4 * ss(0.3, 0.7, dash)) * ss(0.74, 0.84, u) * ss(0.996, 0.972, u));
          }
          sS = u + 0.012 * lat * lat + 0.006 * BLG[b] + 0.0025 * noise1(u * 400 + b);
          uS = u; loS = d - rr; lnS = Math.abs(lat);
        }
      }
    }
    // ---- start blot: wet pool with capillary feathering ----
    const dxb = x - B0x, dyb = y - B0y, db = Math.hypot(dxb, dyb);
    let dB = 0, rf = 0;
    if (db < RB * 1.7) {
      const a = Math.atan2(dyb, dxb), ta = a - (A0 + Math.PI / 2), el = 1 + 0.16 * Math.cos(2 * ta), ca = Math.cos(a), sa_ = Math.sin(a), cn = (f, o) => 2 * n2(ca * f + o, sa_ * f + o * 1.7) - 1, eR = RB * el * (0.86 + 0.15 * cn(0.8, 4) + 0.1 * cn(2.2, 11) + 0.055 * cn(6.5, 23) + 0.03 * cn(19, 41) + 0.012 * cn(55, 7));
      rf = db / eR;
      if (rf < 1) { const pd = Math.hypot(dxb + 12, dyb - 9) / RB; dB = cl((1 - rf) * eR + 0.5) * cl(0.88 + 0.12 * cl(1.25 - pd) + 0.06 * (ph - 0.5)) * (rf > 0.88 ? 0.9 + 0.1 * (1 - rf) / 0.12 : 1); }
      else { const fing = 0.5 + 0.35 * cn(6, 5) + 0.15 * cn(15, 1), fe = 1.05 + 0.22 * Math.pow(cl(fing), 1.6);
        dB = 0.3 * Math.pow(1 - ss(1, fe, rf), 1.5) * (0.55 + 0.45 * ph); }
    }
    if (dB > 0.01 && (rf < 1 || dB >= dS)) { const ab = Math.atan2(dyb, dxb), cb_ = Math.cos(ab), sb_ = Math.sin(ab); BLB[p] = 2 * n2(cb_ * 1.6 + 7, sb_ * 1.6 + 3) - 1 + 0.5 * (2 * n2(cb_ * 4 + 1, sb_ * 4 + 9) - 1); const ov = cl(dS / 0.45) * ss(0.25, 0.75, rf); OV[p] = ov; BLT[p] = lerp(fbm2(x * 0.045, y * 0.045, 3) * 0.7 + 0.3 * fbm2(x * 0.16, y * 0.16, 2), fbm2(x * 0.09, y * 0.09, 3), ov); D[p] = Math.max(dB, dS); S[p] = 0; RF[p] = Math.max(rf, 0.001); UU[p] = 0; LO[p] = ab; LN[p] = lnS; }
    else if (dS > 0.003) { D[p] = dS; S[p] = sS; UU[p] = uS; LO[p] = loS; LN[p] = lnS; }
    GR[p] = ph;
  }
  // blur for edge darkening + gloss normals
  const BD = new Float32Array(NP), T = new Float32Array(NP);
  const box = (src, dst, rad, horiz) => {
    for (let o = 0; o < (horiz ? BH : BW); o++) { let acc = 0; const n = horiz ? BW : BH;
      const at = i => horiz ? o * BW + i : i * BW + o;
      for (let i = -rad; i <= rad; i++) acc += src[at(Math.max(0, Math.min(n - 1, i)))];
      for (let i = 0; i < n; i++) { dst[at(i)] = acc / (2 * rad + 1); acc += src[at(Math.min(n - 1, i + rad + 1))] - src[at(Math.max(0, i - rad))]; } }
  };
  box(D, T, 3, true); box(T, BD, 3, false); box(BD, T, 2, true); box(T, BD, 2, false);
  const gr = rng(99); ACT_B = []; ACT_E = [];
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let y = 1; y < BH - 1; y++) for (let x = 1; x < BW - 1; x++) {
    const p = y * BW + x; if (D[p] < 0.004) continue;
    const edge = cl(1 - BD[p]) * D[p];
    AL[p] = cl(D[p] * 1.04 + edge * 0.32);
    const gx = BD[p + 1] - BD[p - 1], gy = BD[p + BW] - BD[p - BW];
    SP[p] = cl((gx * 0.6 + gy * 0.8) * 3.0);
    const ph = GR[p]; GR[p] = gr() * 0.5 + ph * 0.5;
    // craquelure for the burn: voronoi in stroke space, cells elongated along the stroke (charred-wood checking)
    const u0 = UU[p], isB = RF[p] > 0, sxx = (isB ? x / 9 : u0 * 2140 / 15) + 1.1 * fbm2(x * 0.06, y * 0.06, 2) + 0.35 * fbm2(x * 0.2, y * 0.2, 2), syy = (isB ? y / 9 : LO[p] / 8) + 0.9 * fbm2(x * 0.06 + 5, y * 0.06 + 3, 2) + 0.3 * fbm2(x * 0.2 + 9, y * 0.2, 2);
    const gxi = Math.floor(sxx), gyi = Math.floor(syy); let f1 = 1e9, f2 = 1e9, i1 = 0, i2 = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const ci = gxi + i, cj = gyi + j, id = ci * 7919 + cj * 104729;
      const qx = ci + hash2(ci, cj), qy = cj + hash2(cj + 31, ci + 17), dd = Math.hypot(sxx - qx, syy - qy);
      if (dd < f1) { f2 = f1; i2 = i1; f1 = dd; i1 = id; } else if (dd < f2) { f2 = dd; i2 = id; } }
    CRK[p] = (f2 - f1) * 11; CID[p] = hash(Math.min(i1, i2) * 0.013 + Math.max(i1, i2) * 0.0071); CT[p] = fbm2(x * 0.045 + 50, y * 0.045 + 20, 3); if (!RF[p]) BLT[p] = fbm2(x * 0.09, y * 0.09, 3); CWF[p] = 0.45 + 1.1 * Math.pow(hash(Math.min(i1, i2) * 0.019 + Math.max(i1, i2) * 0.011 + 3), 2);
    const u = UU[p];
    { const dU = Math.min(u, 1 - u); ARR[p] = Math.max(0, 0.82 * Math.pow(dU / 0.5, 0.85) + 0.07 * noise1(u * 23 + 1) + 0.04 * noise1(u * 71 + 5) + 0.05 * LN[p] + 0.11 * (fbm2(u * 2140 / 60 + 3, LO[p] / 9 + 7, 3) - 0.5) + 0.05 * (fbm2(x * 0.11, y * 0.11, 2) - 0.5) + 0.08 * (1 - cl(D[p] * 1.3)) + 0.22 * ss(0.45, 0.6, fbm2(u * 2140 / 150 + 21, LO[p] / 30 + 4, 2)) * ss(0.05, 0.25, dU));
      if (RF[p] > 0) ARR[p] = 0.015 + 0.2 * cl((Math.hypot(BX + x - G.x, BY + y - G.y) - 15) / (RB * 2.2)) + 0.03 * (fbm2(x * 0.08, y * 0.08, 2) - 0.5);
      THK[p] = cl(widthAt(u) / 70) * AL[p]; CID[p] = (RF[p] > 0 ? 0.6 : 1) * (CID[p] > 0.45 ? 1 : 0.12) * (0.6 + 0.4 * noise1(u * 60 + LO[p] * 0.05)); }
    if (RF[p] > 0 || u < 0.225 || u > 0.68) { ACT_E.push(p); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    else ACT_B.push(p);
  }
  const M = 120; EX0 = Math.max(0, x0 - M); EY0 = Math.max(0, y0 - M); EW = Math.min(BW, x1 + M) - EX0; EH = Math.min(BH, y1 + M) - EY0;
}

// ---------------- paper (no baked lamp falloff: it tiles by mirroring) ----------------
function makePaper() {
  paperC = mk(W, H); const x = paperC.getContext('2d'), r = rng(3);
  x.fillStyle = '#e8dfca'; x.fillRect(0, 0, W, H);
  const img = x.getImageData(0, 0, W, H), d = img.data;
  for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
    const i = (Y * W + X) * 4;
    const m = (fbm2(X * 0.006, Y * 0.006, 3) - 0.5) * 16 + (fbm2(X * 0.05, Y * 0.05, 2) - 0.5) * 7 + (r() - 0.5) * 6;
    d[i] += m; d[i + 1] += m * 0.95; d[i + 2] += m * 0.85;
  }
  x.putImageData(img, 0, 0);
  for (let i = 0; i < 2400; i++) {
    let px = r() * W, py = r() * H, a = r() * TAU; const len = 20 + 140 * Math.pow(r(), 2), light = r() < 0.6;
    x.strokeStyle = light ? `rgba(255,252,240,${0.10 + 0.15 * r()})` : `rgba(120,95,60,${0.03 + 0.05 * r()})`;
    x.lineWidth = 0.5 + r() * 0.9; x.beginPath(); x.moveTo(px, py);
    for (let k = 0; k < len; k += 6) { a += (r() - 0.5) * 0.5; px += Math.cos(a) * 6; py += Math.sin(a) * 6; x.lineTo(px, py); }
    x.stroke();
  }
  for (let i = 0; i < 240; i++) { x.fillStyle = `rgba(90,70,45,${0.08 + 0.12 * r()})`; x.beginPath(); x.ellipse(r() * W, r() * H, 0.6 + r() * 1.6, 0.4 + r(), r() * 3, 0, TAU); x.fill(); }
}
function drawPaper(ctx, st) { // world-space; in wide mode, mirrored tiles fill any aspect seamlessly
  const ox = -40, oy = -30, pw = W + 80, ph = H + 60;
  if (!st.wide) { ctx.drawImage(paperC, ox, oy, pw, ph); return; }
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    ctx.save();
    ctx.translate(ox + i * pw + (i ? pw : 0), oy + j * ph + (j ? ph : 0));
    ctx.scale(i ? -1 : 1, j ? -1 : 1);
    ctx.drawImage(paperC, 0, 0, pw, ph); ctx.restore();
  }
}

// ---------------- per-pixel shading ----------------
const RAMP = [[0, 30, 12, 8], [0.22, 110, 20, 6], [0.45, 205, 62, 12], [0.66, 252, 128, 34], [0.84, 255, 196, 98], [1, 255, 246, 220]];
function ramp(h, out) {
  h = cl(h); let i = 0; while (i < RAMP.length - 2 && h > RAMP[i + 1][0]) i++;
  const a = RAMP[i], b = RAMP[i + 1], u = (h - a[0]) / (b[0] - a[0]);
  out[0] = lerp(a[1], b[1], u); out[1] = lerp(a[2], b[2], u); out[2] = lerp(a[3], b[3], u);
}
const _c = [0, 0, 0], _o = [0, 0, 0], _e = [0, 0, 0, 0];
const ct0 = p => CT[p];
let hlF = 1;
function shade(p, st) { // -> alpha (0..1); colour in _o, emission in _e
  _e[3] = 0; let ero = 1;
  const rf = RF[p];
  let a;
  if (rf > 0) { let sp = st.blot; if (sp <= 0) return 0; { const pk = st.t < 0.52 ? ss(0.3, 0.325, st.t) * (1 - ss(0.37, 0.52, st.t)) : 0, bb = BLB[p] > 0 ? BLB[p] * BLB[p] : 0; let f = 0.2 * ss(0.6, 2.8, st.t) * bb; if (pk > 0) { const ca = Math.cos(LO[p] - DIR_B); f += pk * (0.55 * ca + 0.3 * (2 * ca * ca - 1)); } sp *= 1 + f; } /* the loaded brush lands moving: an asymmetric forward press, then slow capillary fingers */ const lob = ss(0.31, 0.5, st.t) * (1 - ss(1.4, 2.6, st.t)); sp *= 1 + 0.26 * (0.5 + 0.5 * BLB[p]) * lob; const comp = ss(0.3, 0.95, st.t); // dense core lags a translucent wet fringe that runs ahead into the fibres
    const rj = rf + 0.1 * (GR[p] - 0.5) * ss(0.5, 1, rf) - 0.05 * BLB[p] * ss(0.6, 1, rf), core = ss(rj - 0.05, rj + 0.01, sp * (0.8 + 0.2 * comp)), halo = 0.62 * Math.pow(1 - ss(sp * 0.74, sp * (1.16 + 0.06 * (1 - comp)) + 0.06 * BLB[p], rf), 1.4) * cl(0.4 + 0.9 * (BLT[p] - 0.3)) * (0.5 + 0.5 * GR[p]);
    a = AL[p] * Math.max(core, halo); }
  else { const s = S[p]; if (s > st.sHead) return 0; a = AL[p] * (st.sHead >= 1 ? 1 : cl((st.sHead - s) / 0.007)); }
  if (a <= 0.004) return 0;
  const u = UU[p], al = AL[p];
  const age = st.t - (rf > 0 ? T_BLOT : paintTime(u)), wet = age < 0 ? 1 : Math.exp(-age / 1.6);
  let r = 13 + 46 * (1 - al) - 5 * wet, g = 11 + 40 * (1 - al) - 4 * wet, b = 14 + 34 * (1 - al);
  if (rf > 0) { const bt = BLT[p] - 0.5, rim = ss(0.45, 0.98, rf), k = 0.45 + 0.55 * wet; const tv = (34 * rim * (1 - OV[p]) * (0.6 + bt * 1.6) + 26 * bt) * k; r += tv; g += tv * 0.92; b += tv * 0.86; }
  const spec = SP[p] * (0.18 + 0.82 * wet) * al;
  r += spec * 66; g += spec * 72; b += spec * 88;
  if (st.ignT >= 0) {
    const ia = st.ignT - ARR[p];
    if (ia > 0) {
      const thick = THK[p];
      const ext = 0.45 + 3.0 * ss(0.3, 0.72, CT[p] + 0.12 * (GR[p] - 0.5)) - 0.6 * (1 - thick), ta_ = st.tearAge || 0, hl = cl(st.heat * (1 + 0.7 * thick) - 0.5 * (1 - thick) - 0.25 * (CT[p] - 0.5) * (1 - st.heat)) * (1 - ss(ext, ext + 0.4, ta_)), fl = ta_ > 0.6 ? ss(ext - 0.3, ext, ta_) * (1 - ss(ext, ext + 0.35, ta_)) * cl(st.heat * 2 + 0.25) : 0; // each patch flares once along its fissures as it goes out: a visible retreating ember line // cools patch by patch, thin parts first // thin/dry parts die first, pooled ink keeps isolated fissures
      const dryF = ss(0.86, 0.96, u); if (dryF > 0) hlF = 1 - dryF * ss(0.1, 0.32, ia); else hlF = 1; const local = hlF * ss(0, 0.06, ia) * (0.55 + 0.45 * Math.exp(-ia / 0.35)) * hl;
      const front = Math.exp(-ia / 0.04) * ss(0, 0.008, ia) * ss(0.35, 0.6, BLT[p] + 0.35 * (CT[p] - 0.5)), tip = front * ss(0.6, 0.8, GR[p] * 0.5 + 0.5 * BLT[p] + 0.2 * (1 - D[p]));
      const cw = (0.6 + 1.6 * local) * CWF[p], crk = CRK[p];
      const fm = ss(0.42, 0.6, CT[p]), cm = (1 - ss(cw * 0.25, cw * 1.25, crk)) * CID[p] * fm, rim = (1 - ss(cw * 1.2, cw * 3.2, crk)) * fm * CID[p];
      const dense = ss(0.35, 0.8, D[p]);
      // char crust: matte, slightly brown, ash flecks once cooler
      const charK = ss(0, 0.2, ia) * (1 - 0.5 * dryF);
      const gg = GR[p];
      const ash = cl((gg - 0.78) * 6) * (1 - hl) * 0.8 + cl((gg - 0.55) * 2.5) * (1 - hl) * 0.2 * ss(0.4, 1.6, ia);
      { const ed = rf > 0 ? lerp(rf, Math.min(rf, LN[p]), OV[p]) : LN[p], lim = 1.04 - 0.24 * ss(0.4, 0.7, BLT[p] + 0.25 * (gg - 0.5)) * ss(0.15, 1.1, ia) - 0.06 * (gg - 0.5); ero = 1 - ss(lim - 0.14, lim, ed); if (ero < 1 && ero > 0.05) { r += 18 * (1 - ero); g += 14 * (1 - ero); b += 10 * (1 - ero); } } // the burnt edge crumbles away in patches; its lifted rim catches the lamp
      // matte charcoal islands (per crust cell tone), fissure margins darker, grey ash as it cools
      const bl = BLT[p], bump = cl(((BLT[p - 1] || bl) - (BLT[p + 1] || bl) + (BLT[p - BW] || bl) - (BLT[p + BW] || bl)) * 260, -1, 1); // swollen crust relief, lit from the lamp (top-left)
      const cb = (30 + 13 * ss(0.35, 0.75, bl) + 10 * gg + 8 * (CT[p] - 0.5) + 4 * bump - 12 * ss(0.74, 0.84, gg) + 16 * (D[p] - 0.75) - 14 * rim) * (0.72 + 0.28 * al);
      r = lerp(r, cb + 75 * ash, charK); g = lerp(g, cb * 0.9 + 68 * ash, charK); b = lerp(b, cb * 0.82 + 60 * ash, charK);
      const hot = cl(cm * local * dense * (1.1 + 0.5 * thick) + fl * (0.75 * cm + 0.25 * rim) * dense + front * (0.25 + 0.75 * dense) * (0.5 + 0.5 * ss(0.3, 0.7, BLT[p])) * 1.1 + tip * 0.9);
      if (hot > 0.01) {
        ramp(hot, _c);
        const k = cl(hot * 1.7);
        r = lerp(r, _c[0], k); g = lerp(g, _c[1], k); b = lerp(b, _c[2], k);
        _e[0] = _c[0]; _e[1] = _c[1]; _e[2] = _c[2]; _e[3] = Math.pow(hot, 1.3);
      }
    }
  }
  _o[0] = r; _o[1] = g; _o[2] = b;
  return a * ero * (0.92 + 0.08 * GR[p]);
}
function putPx(d, e, i4, a, w) { // ink at full res, emission at half res
  const A = a * 255; if (d[i4 + 3] >= A) return;
  d[i4] = _o[0]; d[i4 + 1] = _o[1]; d[i4 + 2] = _o[2]; d[i4 + 3] = A;
  if (_e[3] > 0) { const idx = i4 >> 2, x = idx % w, y = (idx / w) | 0, j = ((y >> 1) * ((w + 1) >> 1) + (x >> 1)) * 4, E = _e[3] * 255;
    if (e[j + 3] < E) { e[j] = _e[0]; e[j + 1] = _e[1]; e[j + 2] = _e[2]; e[j + 3] = E; } }
}
function bodyPass(st) {
  const d = bodyImg.data, e = emBImg.data, hot = st.ignT >= 0; d.fill(0); if (hot) e.fill(0);
  for (let k = 0; k < ACT_B.length; k++) { const p = ACT_B[k], a = shade(p, st); if (a > 0) putPx(d, e, p * 4, a, BW); }
  bodyX.putImageData(bodyImg, 0, 0); if (hot) emBX.putImageData(emBImg, 0, 0);
}
const TS = TAU / SPAN;
const U_SPLIT = mod(THM + 0.012 - A0, TAU) / SPAN; // ends own the gap up to the meeting angle (was 1.035, which clipped the tail's front flat before contact)
const uOfAng = a => { let x = a - A0; while (x < 0) x += TAU; while (x >= TAU) x -= TAU; let u = x / SPAN; if (u > U_SPLIT) u -= TS; return u; };
let MAP = null, MAPW = null, MAPK = null, ISE, DST, DANG, DRAD, DU0, DCOS, DSIN;
const LN_U = 4096, U_LO = -0.1, U_HI = 1.1, LUT_T = new Float32Array(LN_U + 1), LUT_H = new Float32Array(LN_U + 1);
for (let i = 0; i <= LN_U; i++) { const u = U_LO + (U_HI - U_LO) * i / LN_U; LUT_T[i] = u > 0.70 ? Math.pow(ss(0.70, 0.99, u), 1.25) : 0; LUT_H[i] = u < 0.21 ? ss(0.21, 0.03, u) : 0; }
const lutI = u => Math.max(0, Math.min(LN_U, ((u - U_LO) / (U_HI - U_LO) * LN_U) | 0));
function makeDst() { // ends canvas pixels that a moving end can ever cover (annulus outside the static body arc)
  ISE = new Uint8Array(NP); for (const p of ACT_E) ISE[p] = 1;
  const out = [];
  for (let y = 0; y < EH; y++) for (let x = 0; x < EW; x++) {
    const X = BX + EX0 + x - CX, Y = BY + EY0 + y - CY, rad = Math.hypot(X, Y);
    if (rad < R - 100 || rad > R + 80) continue;
    const u = uOfAng(Math.atan2(Y, X)); if (u > 0.235 && u < 0.665) continue;
    out.push(y * EW + x);
  }
  DST = Int32Array.from(out); DANG = new Float32Array(DST.length); DRAD = new Float32Array(DST.length); DU0 = new Float32Array(DST.length); DCOS = new Float32Array(DST.length); DSIN = new Float32Array(DST.length);
  for (let k = 0; k < DST.length; k++) { const q = DST[k], X = BX + EX0 + q % EW - CX, Y = BY + EY0 + ((q / EW) | 0) - CY; DANG[k] = Math.atan2(Y, X); DRAD[k] = Math.hypot(X, Y); DU0[k] = uOfAng(DANG[k]); DCOS[k] = Math.cos(DANG[k]); DSIN[k] = Math.sin(DANG[k]); }
}
const L_TR = new Float32Array(LN_U + 1), L_WV = new Float32Array(LN_U + 1), L_F = new Float32Array(LN_U + 1), L_RB = new Float32Array(LN_U + 1);
for (let i = 0; i <= LN_U; i++) L_RB[i] = rAt(cl(U_LO + (U_HI - U_LO) * i / LN_U, 0, 1));
const NCB = 128, CB_HW = new Float32Array(NCB), CB_F = new Float32Array(NCB), CB_WV = new Float32Array(NCB), CB_BAND = new Float32Array(NCB); // coarse culling bins
for (let c = 0; c < NCB; c++) { let m = 0; const u0 = U_LO + (U_HI - U_LO) * c / NCB, u1 = U_LO + (U_HI - U_LO) * (c + 1) / NCB;
  for (let u = u0 - 0.08; u <= u1 + 0.08; u += 0.002) { const uc = cl(u, 0, 1); m = Math.max(m, u < 0.06 ? 72 : widthAt(uc) * 0.62 + 8); } CB_HW[c] = m; }
const cbOf = u => Math.max(0, Math.min(NCB - 1, ((u - U_LO) / (U_HI - U_LO) * NCB) | 0));
function endsPass(st) { // inverse-mapped deformation: every destination pixel pulls its source (no holes, no double density)
  const d = endImg.data, e = emEImg.data, hot = st.ignT >= 0; d.fill(0); if (hot) e.fill(0);
  const rT = st.reachT || 0, rH = st.reachH || 0, prT = Math.max(0, rT), prH = Math.max(0, rH);
  const dT = rT * FT * GAP, dH = -rH * FH * GAP, tr = st.strain * (0.004 + 0.006 * ss(0.8, 1, Math.max(prT, prH)));
  const near1 = 1 - ss(0.86, 0.95, Math.max(prT, prH)); // at the last lunge the ends are taut: no lag wave pulling the tips off the contact
  const vT = cl(-(st.velT || 0) * 0.35, -1, 1) * near1, vH = cl(-(st.velH || 0) * 0.35, -1, 1) * near1, t = st.t;
  const ra = st.recAge || 0, rwk = (st.recA || 0) * Math.exp(-ra / 0.24) * ss(0, 0.03, ra), rw = 23 * rwk, rwH = 16 * rwk * (st.recH || 0); // decaying bend travelling back into the arc after a release
  const still = Math.abs(dT) < 1e-6 && Math.abs(dH) < 1e-6 && tr === 0 && vT === 0 && vH === 0 && rwk < 1e-3;
  if (!still) for (let i = 0; i <= LN_U; i++) { // per-frame tables over u (keeps trig out of the pixel loop)
    const u = U_LO + (U_HI - U_LO) * i / LN_U, wT = LUT_T[i], wH = LUT_H[i];
    if (wT > 0) { L_TR[i] = tr * wT * noise1(t * 41 + u * 30); L_F[i] = 1 - 0.5 * wT * prT + 1.1 * Math.pow(wT, 6) * prT; L_WV[i] = vT * 30 * Math.pow(wT, 1.5) * Math.sin(wT * 4.6 - t * 30) + 30 * Math.sin(Math.PI * wT) * prT * (1 - prT) * 2.2 + rw * Math.sin(wT * 5.2 + ra * 26) * Math.sin(Math.PI * Math.pow(wT, 0.6)) - 34 * Math.pow(wT, 3.5) * prT * near1; } // the terminal quarter bends off its rest curve under load
    else if (wH > 0) { L_TR[i] = tr * wH * noise1(t * 37 + u * 40 + 9); L_F[i] = 1 - 0.3 * wH * prH; L_WV[i] = vH * 18 * Math.pow(wH, 1.5) * Math.sin(wH * 3.4 - t * 30) - 7 * Math.sin(Math.PI * wH) * prH * (1 - prH) * 2.5 + rwH * Math.sin(wH * 6 + ra * 30) * (0.2 + 0.8 * wH) + 16 * Math.pow(wH, 3.5) * prH * near1; }
    else { L_TR[i] = 0; L_F[i] = 1; L_WV[i] = 0; }
  }
  if (!still) { CB_F.fill(1); CB_WV.fill(0);
    for (let i = 0; i <= LN_U; i++) { const u = U_LO + (U_HI - U_LO) * i / LN_U, c0 = cbOf(u - 0.08), c1 = cbOf(u + 0.08), f = L_F[i], w = Math.abs(L_WV[i]);
      if (f > 1 || w > 0) for (let c = c0; c <= c1; c++) { if (f > CB_F[c]) CB_F[c] = f; if (w > CB_WV[c]) CB_WV[c] = w; } }
    for (let c = 0; c < NCB; c++) CB_BAND[c] = CB_HW[c] * CB_F[c] + CB_WV[c] + 4; }
  // a settled deformation (no strain jitter, no waves) maps every pixel to the same source: cache it (the whole burn/cooling)
  const cacheable = !still && tr === 0 && vT === 0 && vH === 0 && rwk < 1e-3, mkey = dT.toFixed(6) + ',' + dH.toFixed(6) + ',' + prT.toFixed(4) + ',' + prH.toFixed(4);
  const useMap = cacheable && MAPK === mkey, bld = cacheable && !useMap; if (bld) { if (!MAP) { MAP = new Int32Array(DST.length); MAPW = new Float32Array(DST.length); } MAPK = mkey; } else if (!cacheable) MAPK = null;
  for (let k = 0; k < DST.length; k++) {
    const q = DST[k];
    let p, wT = 0;
    if (bld) MAP[k] = -1;
    if (still) { p = (EY0 + ((q / EW) | 0)) * BW + EX0 + q % EW; }
    else if (useMap) { p = MAP[k]; if (p < 0) continue; wT = MAPW[k]; }
    else {
      const ang = DANG[k], c0 = cbOf(DU0[k]);
      if (Math.abs(DRAD[k] - L_RB[lutI(DU0[k])]) > CB_BAND[c0]) continue;
      let sa = ang, li = 0;
      for (let it = 0; it < 3; it++) { li = lutI(uOfAng(sa)); sa = ang - (dT * LUT_T[li] + dH * LUT_H[li]); }
      if (dT < 0 || dH > 0) { const l2 = lutI(uOfAng(sa)); let er = sa + dT * LUT_T[l2] + dH * LUT_H[l2] - ang; er -= TAU * Math.round(er / TAU); if (er > 0.004 || er < -0.004) continue; } // unconverged inverse = no source (gap)
      if ((DU0[k] > 0.5) !== (li > (0.5 - U_LO) / (U_HI - U_LO) * LN_U)) continue; // never pull ink across the gap from the other end (wrap)
      const da = ang - sa + L_TR[li];
      wT = LUT_T[li];
      const base = L_RB[li], srad = base + (DRAD[k] - base - L_WV[li]) / L_F[li];
      const d2 = da * da, cd = 1 - d2 * 0.5 + d2 * d2 / 24, sd = da * (1 - d2 / 6 + d2 * d2 / 120); // rotate by -da
      const c = DCOS[k] * cd + DSIN[k] * sd, sn = DSIN[k] * cd - DCOS[k] * sd;
      const sx = Math.round(CX + c * srad - BX), sy = Math.round(CY + sn * srad - BY);
      if (sx < 0 || sy < 0 || sx >= BW || sy >= BH) continue;
      p = sy * BW + sx; if (bld) { MAP[k] = p; MAPW[k] = wT; }
    }
    if (!ISE[p]) continue;
    let a = shade(p, st); if (a <= 0) continue;
    if (wT > 0 && rT > 0) { a = Math.min(1, a * (1 + 1.3 * wT * rT)); const gk = 1 - 0.6 * wT * rT; _o[0] *= gk; _o[1] *= gk; _o[2] *= gk; }
    putPx(d, e, q * 4, a, EW);
  }
  endX.putImageData(endImg, 0, 0); if (hot) emEX.putImageData(emEImg, 0, 0);
}

// ---------------- final-approach filaments ----------------
const FIL = [ // three uneven wet threads; they leave both tips and converge into one bridge
  { o: -9, sag: 7, wA: 5.5, wB: 4.2, ph: 3.1, lim: 0.8, al: 0.92 },
  { o: 2, sag: -4, wA: 7.5, wB: 6.0, ph: 7.7, lim: 0.84, al: 0.97 },
  { o: 11, sag: -9, wA: 3.6, wB: 3.0, ph: 12.4, lim: 0.89, al: 0.85 }];
function drawFilaments(ctx, st) {
  const m = Math.min(st.reachT, st.reachH); if (m < 0.8 || st.tear > 0) return;
  const A = tipPos('T', st.reachT), B = tipPos('H', st.reachH), dx = B.x - A.x, dy = B.y - A.y, dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl;
  const conv = ss(0.9, 1.0, m), M = { x: lerp(A.x, B.x, 0.52) + nx * 2, y: lerp(A.y, B.y, 0.52) + ny * 2 };
  ctx.save(); ctx.fillStyle = 'rgb(15,12,15)';
  for (const f of FIL) {
    const k = m >= 0.999 ? 1 : ss(f.lim, 0.985, m); if (k <= 0) continue; // how far each side has grown toward the bridge
    const tr = st.strain * 1.6 * noise1(st.t * 24 + f.ph), so = f.o * (1 - conv);
    const ax = A.x + nx * f.o * 0.7, ay = A.y + ny * f.o * 0.7, bx = B.x + nx * f.o * 0.45, by = B.y + ny * f.o * 0.45;
    const cx = M.x + nx * (so + f.sag * (1 - 0.7 * conv) + tr), cy = M.y + ny * (so + f.sag * (1 - 0.7 * conv) + tr);
    for (const side of [0, 1]) { // tail half (grows a bit further) and head half
      const ex = side ? bx : ax, ey = side ? by : ay, w0 = (side ? f.wB : f.wA) * (0.75 + 0.25 * conv), reach = side ? k * 0.92 : Math.min(1, k * 1.08);
      const N = 32, L = [], Rr = [], wob = (0.6 + 1.8 * st.strain) * (1 - 0.6 * conv);
      let lx = 0, ly = 0, lw = 0;
      for (let i = 0; i <= N; i++) { const s0 = i / N * reach, s1 = 1 - s0; // quadratic: end -> control -> M, with a travelling tremble and a meniscus at the base
        let qx = s1 * s1 * ex + 2 * s1 * s0 * cx + s0 * s0 * M.x, qy = s1 * s1 * ey + 2 * s1 * s0 * cy + s0 * s0 * M.y;
        const tx = 2 * s1 * (cx - ex) + 2 * s0 * (M.x - cx), ty = 2 * s1 * (cy - ey) + 2 * s0 * (M.y - cy), tl = Math.hypot(tx, ty) || 1;
        const tw = wob * Math.sin(s0 * Math.PI) * Math.sin(s0 * 7.5 - st.t * 31 + f.ph); qx += -ty / tl * tw; qy += tx / tl * tw;
        const w = w0 * (0.4 + 0.6 * Math.pow(1 - s0, 1.6) + 0.9 * Math.exp(-s0 * 9)) * (0.85 + 0.25 * noise1(f.ph + s0 * 6 + side * 5));
        L.push([qx - ty / tl * w / 2, qy + tx / tl * w / 2]); Rr.push([qx + ty / tl * w / 2, qy - tx / tl * w / 2]); lx = qx; ly = qy; lw = w; }
      ctx.globalAlpha = f.al; ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
      for (let i = 1; i < L.length - 1; i++) ctx.quadraticCurveTo(L[i][0], L[i][1], (L[i][0] + L[i + 1][0]) / 2, (L[i][1] + L[i + 1][1]) / 2);
      ctx.lineTo(L[L.length - 1][0], L[L.length - 1][1]); ctx.lineTo(Rr[Rr.length - 1][0], Rr[Rr.length - 1][1]);
      for (let i = Rr.length - 2; i > 0; i--) ctx.quadraticCurveTo(Rr[i][0], Rr[i][1], (Rr[i][0] + Rr[i - 1][0]) / 2, (Rr[i][1] + Rr[i - 1][1]) / 2);
      ctx.lineTo(Rr[0][0], Rr[0][1]); ctx.closePath(); ctx.fill();
      if (reach < 1) { ctx.beginPath(); ctx.arc(lx, ly, lw * 0.62, 0, TAU); ctx.fill(); } // the growing end is a bead of ink, not a point
    }
  }
  if (conv > 0.6) { ctx.globalAlpha = 0.95 * ss(0.6, 1, conv); ctx.beginPath(); ctx.ellipse(M.x, M.y, 3.2 + 1.6 * conv, 2.4 + 1.2 * conv, Math.atan2(dy, dx), 0, TAU); ctx.fill(); } // the bead where they meet
  ctx.restore();
}

// ---------------- spatter (flung ink) ----------------
function drawSpatter(ctx, st) {
  ctx.save(); ctx.fillStyle = 'rgba(16,13,16,0.9)';
  for (const s of st.spatter) {
    const age = st.t - s.t0; if (age < 0) continue;
    const fly = 0.1, k = cl(age / fly), e = eOut(k);
    const x = s.x + s.vx * e, y = s.y + s.vy * e;
    if (k < 1) {
      const px = s.x + s.vx * eOut(Math.max(0, k - 0.06)), py = s.y + s.vy * eOut(Math.max(0, k - 0.06));
      ctx.strokeStyle = 'rgba(16,13,16,0.45)'; ctx.lineWidth = s.r * 0.45; ctx.lineCap = 'round'; // thin wet trail behind a round drop
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y, s.r * 0.75, s.r * 0.6, Math.atan2(s.vy, s.vx), 0, TAU); ctx.fill();
    } else {
      const sp = 1 + 0.12 * ss(0, 0.5, age - fly);
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU, rr = s.r * sp * (1 + 0.22 * noise1(a * 2 + s.seed) + 0.1 * noise1(a * 6 + s.seed)); i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + rr, y); }
      ctx.fill();
      for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(x + s.vx * 0.05 * (i + 1) + noise1(s.seed + i) * 3, y + s.vy * 0.05 * (i + 1), s.r * 0.35 / (i + 1), 0, TAU); ctx.fill(); }
    }
  }
  ctx.restore();
}

// ---------------- the slit (paper tears between the ends) ----------------
const SPINE = (() => {
  const r = rng(23), out = [], dirO = THM;
  const walk = (x, y, a, len, wf, a0, a1, jit) => { const pts = [{ x, y, al: a0 }]; let d = 0, a00 = a;
    while (d < len) { const st = 5 + r() * 6; if (r() < 0.2) a += (r() < 0.5 ? -1 : 1) * (0.25 + 0.4 * r()) * jit; else a += (r() - 0.5) * 0.12; a = lerp(a, a00, 0.12); x += Math.cos(a) * st; y += Math.sin(a) * st; d += st; pts.push({ x, y, al: lerp(a0, a1, d / len) }); }
    out.push({ pts, wf }); return pts; };
  walk(G.x, G.y, dirO + 0.05, 250, 1, 0, 1, 0.95);
  walk(G.x, G.y, dirO + Math.PI - 0.06, 205, 1, 0, -1, 0.95);
  return out;
})();
const TR = 600, TX0 = Math.round(G.x - TR / 2), TY0 = Math.round(G.y - TR / 2);
let TD, TA, TF, TH, TWF, TSN, TACT, TSG, TEX, TWV, TEN, TIS, TBD, tearC, tearX, tearImg, tearEC, tearEX, tearEImg;
function makeSlitField() {
  TD = new Float32Array(TR * TR); TA = new Float32Array(TR * TR); TF = new Float32Array(TR * TR); TH = new Float32Array(TR * TR); TWF = new Float32Array(TR * TR); TSN = new Int8Array(TR * TR); TACT = []; TSG = new Float32Array(TR * TR); TEX = new Float32Array(TR * TR); TWV = new Float32Array(TR * TR); TEN = new Float32Array(TR * TR); TIS = new Float32Array(TR * TR); TBD = new Float32Array(TR * TR);
  const segs = []; for (const s of SPINE) for (let i = 0; i < s.pts.length - 1; i++) { const a = s.pts[i], b = s.pts[i + 1]; segs.push([a.x, a.y, b.x, b.y, a.al, b.al, s.wf]); }
  for (let y = 0; y < TR; y++) for (let x = 0; x < TR; x++) {
    const wx = TX0 + x, wy = TY0 + y; let best = 1e9, al = 0, wf = 1, sg0 = 1;
    for (const sg of segs) { const dx = sg[2] - sg[0], dy = sg[3] - sg[1], L2 = dx * dx + dy * dy; let u = ((wx - sg[0]) * dx + (wy - sg[1]) * dy) / L2; u = u < 0 ? 0 : u > 1 ? 1 : u;
      const px = sg[0] + dx * u - wx, py = sg[1] + dy * u - wy, dd = Math.hypot(px, py);
      if (dd < best) { best = dd; al = lerp(sg[4], sg[5], u); wf = sg[6]; sg0 = (dx * (wy - sg[1]) - dy * (wx - sg[0])) * (sg[4] <= sg[5] ? 1 : -1) >= 0 ? 1 : -1; } }
    const p = y * TR + x;
    TD[p] = best; TA[p] = al; TWF[p] = wf; TSN[p] = sg0;
    TF[p] = fbm2(wx * 0.35, wy * 0.35, 2) * 0.6 + fbm2(wx * 0.06, wy * 0.06, 2) * 0.4; // fibrous edge noise
    const sAl = al * 240; // fibre hairs: anisotropic, run across the tear (kozo fibres pulled out of the torn edge)
    const wq = sAl * 0.85 + 5 * n2(sAl * 0.06 + sg0 * 3, 1.7); TH[p] = (n2(wq + sg0 * 37, best * 0.07 + sg0 * 11) * 0.75 + 0.25 * n2(sAl * 2.3, best * 0.2 + 5)) * (0.45 + 0.6 * ss(0.3, 0.7, n2(sAl * 0.09 + sg0 * 5, 3.3))); // clustered, irregular hairs (no comb)
    TSG[p] = 0.5 + 0.5 * noise1(al * 6 + sg0 * 7 + 1); TEX[p] = 0.9 + 1.9 * (0.5 + 0.5 * noise1(al * 5 + sg0 * 3 + 8));
    TWV[p] = slitVar(al); TEN[p] = noise1(al * 70 + sg0 * 13); TIS[p] = 0.55 + 0.45 * noise1(al * 16 + 3 + sg0 * 4); TBD[p] = noise1(al * 40 + sg0 * 5);
    if (best < 78) TACT.push(p);
  }
}
const FIB = (() => { const r = rng(57), a = []; const main = [SPINE[0], SPINE[1]];
  for (let i = 0; i < 24; i++) { const sp = main[i % 2], k = 1 + Math.floor(r() * (sp.pts.length * 0.85)); const p = sp.pts[k], q = sp.pts[Math.min(sp.pts.length - 1, k + 1)];
    let tx = q.x - p.x, ty = q.y - p.y; const dl = Math.hypot(tx, ty) || 1; tx /= dl; ty /= dl;
    a.push({ x: p.x, y: p.y, nx: -ty, ny: tx, al: Math.abs(p.al), k: 4 + 26 * Math.pow(r(), 1.3), sk: (r() - 0.5) * 10, cu: r() < 0.5 ? -1 : 1, w: 0.5 + 1.3 * Math.pow(r(), 1.5), lt: 0.6 + 0.4 * r(), sn: 0.04 + 0.9 * Math.pow(r(), 1.2), side: r() < 0.5 ? 1 : -1, sag: 0.4 + 1.2 * r(), wob: r() * 10 }); }
  return a; })();
const slitVar = al => 0.78 + 0.34 * noise1(al * 7 + 3) + 0.2 * Math.abs(noise1(al * 23 + 1));
function slitHalfW(st, al, wf, wv) {
  const aal = Math.abs(al); if (aal > st.tearProg) return -1;
  const taper = Math.pow(cl(1 - aal), 0.55) * (1 - Math.exp(-(st.tearProg - aal) * 18));
  return 16.5 * st.open * taper * (wv === undefined ? slitVar(al) : wv) * wf;
}
function tearPass(st) { // a torn sheet: pale fibrous lips (one lifted toward the lamp), a deep occluded void, fibres pulled across
  const d = tearImg.data, e = tearEImg.data; d.fill(0); e.fill(0);
  const heat = st.heat, sc = st.scorch, op = Math.min(1, st.open);
  for (let k = 0; k < TACT.length; k++) {
    const p = TACT[k], hw = slitHalfW(st, TA[p], TWF[p], TWV[p]);
    if (hw < 0) continue;
    const i4 = p * 4, f = TF[p], side = TSN[p], lift = side > 0, hn = TH[p];
    const asym = lift ? 0.25 * hw : -0.15 * hw; // lips are offset: the tear is not a mirrored slash
    const edgeN = (lift ? 3.2 : 2.4) * (f - 0.5) * Math.min(1, hw / 4) + 1.6 * TEN[p] * Math.min(1, hw / 6);
    const v = TD[p] - hw - edgeN + asym; if (v > (lift ? 46 : 30)) continue;
    const segN = TSG[p], ext = TEX[p];
    const hl = heat > 0 ? Math.pow(heat, 1 + 1.6 * f) * (1 - ss(ext, ext + 0.45, st.tearAge || 0)) : 0; // the wound goes out in patches, not all at once
    const isl = TIS[p];
    const hairL = (lift ? 7 : 5) * Math.min(1, hw / 5) * ss(0.66, 0.88, hn) * ss(0.45, 0.75, TIS[p] + 0.3 * TSG[p]);
    if (v < 0) { // void
      if (-v < hairL) { // a loose fibre hair reaching into the void from the lip
        const k2 = cl(hl * 0.9 * isl) * Math.pow(1 - (-v) / hairL, 0.5);
        d[i4] = lerp(226, 255, k2); d[i4 + 1] = lerp(214, 150, k2); d[i4 + 2] = lerp(190, 60, k2); d[i4 + 3] = 235 * (1 - 0.6 * (-v) / hairL);
        if (k2 > 0.03) { e[i4] = 255; e[i4 + 1] = 140; e[i4 + 2] = 50; e[i4 + 3] = 210 * k2; }
        continue;
      }
      const dd = -v, depth = cl(dd / Math.max(2, hw));
      const shad = lift ? cl(dd / (6 + 0.5 * hw)) : 1; // the lifted lip overhangs and occludes its side of the void
      const glowFromBelow = hl * 0.5 * isl * Math.exp(-dd / (2.2 + 0.1 * hw)) * shad * (0.6 + 0.4 * f);
      const h = cl(glowFromBelow);
      ramp(h * 0.85, _c); const vo = 1 - cl(h * 2.6);
      const occ = lift ? cl(dd / (8 + 0.6 * hw)) : 1, dk = (10 + 22 * occ * (0.6 + 0.8 * (f - 0.3)) * ss(0.3, 1.2, op)) * (1 - 0.35 * (1 - depth)); // a dim under-sheet seen through the hole, darkest under the raised lip
      d[i4] = lerp(_c[0], dk + 4, vo); d[i4 + 1] = lerp(_c[1], dk * 0.6 + 2, vo); d[i4 + 2] = lerp(_c[2], dk * 0.45 + 1, vo); d[i4 + 3] = 255;
      if (h > 0.02) { e[i4] = _c[0]; e[i4 + 1] = _c[1]; e[i4 + 2] = _c[2]; e[i4 + 3] = 255 * Math.pow(h, 1.5); }
      continue;
    }
    // torn edge fringe: paler than the sheet (exposed long kozo fibres), feathered
    const fr = ((lift ? 3.0 : 2.0) + (lift ? 4.5 : 3) * (0.55 * ss(0.3, 0.75, f) + 0.45 * ss(0.7, 0.9, hn) * ss(0.5, 0.8, TIS[p])) * Math.min(1, hw / 5)) * (0.35 + 0.9 * segN); // fringe width follows pulp clumps, only occasional hair tufts (no comb)
    if (v < fr && hw > 0.25) { const lipK = lift ? 0.55 : 1; // light escapes from the lower lip; the raised lip hides it
      const inner = 1 - v / fr;
      const bead = ss(0.4, 0.62, f + 0.25 * TBD[p]);
      const burn = cl(hl * 1.15 * isl) * Math.pow(inner, 2.2) * bead * lipK; // the very edge burns in beads
      const charE = cl((lift ? 1 : 1.7) * sc * Math.pow(inner, 3 - 1.6 * (1 - segN)) * (1 - 0.4 * hn) * (0.4 + 0.6 * (1 - heat * bead)) * (0.7 + 0.9 * (1 - segN))); // after cooling: a hair-thin dark char line on the lip
      const pale = lift ? 250 : 214;
      let R0 = lerp(pale, 40, charE), G0 = lerp(pale - 9, 24, charE), B0 = lerp(pale - 26, 16, charE);
      d[i4] = lerp(R0, 255, burn); d[i4 + 1] = lerp(G0, 150, burn); d[i4 + 2] = lerp(B0, 58, burn);
      d[i4 + 3] = 255 * Math.min(1, (0.55 + 0.45 * inner) * (0.75 + 0.25 * f) + charE * 0.5);
      if (burn > 0.02) { e[i4] = 255; e[i4 + 1] = 132; e[i4 + 2] = 44; e[i4 + 3] = 210 * burn; }
      continue;
    }
    const q = v - fr;
    if (lift) { // lifted lip: the sheet curls up toward the lamp (bright band), then falls back (soft shade line) -> buckled paper
      const LZ = (18 + 24 * op) * (0.45 + 0.5 * f + 0.6 * segN) * Math.min(1, hw / 6 + 0.2);
      if (q < LZ) { const x = q / LZ; const hi = Math.pow(1 - x, 1.4) * 0.46 * op, shd = 0;
        const scr = sc * 0.18 * Math.pow(1 - x, 2) * (0.5 + f);
        if (hi > shd) { d[i4] = lerp(255, 70, scr / (hi + scr)); d[i4 + 1] = lerp(250, 42, scr / (hi + scr)); d[i4 + 2] = lerp(236, 26, scr / (hi + scr)); d[i4 + 3] = 255 * cl(hi + scr); }
        else { d[i4] = 40; d[i4 + 1] = 28; d[i4 + 2] = 20; d[i4 + 3] = 255 * cl(shd + scr); }
        continue; }
    } else { // lower lip: a soft cast shadow from the lifted flap, then a faint scorch
      const LZ = (8 + 14 * op) * (0.4 + 0.6 * f + 0.7 * (1 - segN)) * Math.min(1, hw / 6 + 0.2);
      if (q < LZ) { const x = q / LZ; const shd = Math.pow(1 - x, 1.6) * 0.48 * op + sc * 0.3 * Math.pow(1 - x, 2.5) * (0.4 + f);
        d[i4] = 34; d[i4 + 1] = 22; d[i4 + 2] = 14; d[i4 + 3] = 255 * cl(shd); continue; }
    }
  }
  tearX.putImageData(tearImg, 0, 0); tearEX.putImageData(tearEImg, 0, 0);
}
function drawFibres(ctx, st) { // kozo fibres bridge the slit, silhouetted, then snap and curl back
  ctx.save(); ctx.lineCap = 'round';
  for (const fb of FIB) {
    const hw = slitHalfW(st, fb.al, 1); if (hw <= 0.5) continue;
    const ax = fb.x + fb.nx * (hw + 3), ay = fb.y + fb.ny * (hw + 3), bx = fb.x - fb.nx * (hw + 3), by = fb.y - fb.ny * (hw + 3);
    ctx.lineWidth = fb.w * (hw < fb.k ? 1 - 0.65 * hw / fb.k : 1);
    if (hw < fb.k && (st.tearAge || 0) < fb.sn) {
      const tn = hw / fb.k; ctx.strokeStyle = `rgba(${lerp(232, 255, st.heat * tn) | 0},${lerp(214, 170, st.heat * tn) | 0},${lerp(178, 100, st.heat * tn) | 0},${0.8 * fb.lt * ss(2.5, 6, hw)})`; ctx.beginPath(); ctx.moveTo(ax, ay);
      const sg = (fb.sk * 0.9 + fb.cu * 3) * (0.4 + tn) + fb.sag * (3 + hw * 0.25), mx = fb.x + fb.ny * sg * 0.5 + 2 * noise1(fb.wob), my = fb.y - fb.nx * sg * 0.5 + 2 * noise1(fb.wob + 3); ctx.bezierCurveTo(lerp(ax, mx, 0.6) + fb.ny * sg * 0.6, lerp(ay, my, 0.6) - fb.nx * sg * 0.6, lerp(bx, mx, 0.3) + fb.ny * sg * 0.9, lerp(by, my, 0.3) - fb.nx * sg * 0.9, bx, by); ctx.stroke();
    } else { // snapped: two stubs curl back onto the lips
      const L = 2.5 + fb.k * 0.22; ctx.lineWidth = fb.w * 0.6;
      ctx.strokeStyle = `rgba(${lerp(228, 255, st.heat * 0.6) | 0},${lerp(216, 160, st.heat * 0.6) | 0},${lerp(192, 90, st.heat * 0.6) | 0},${0.55 * fb.lt})`;
      for (const s of [fb.side, -fb.side]) { const ox = fb.x + fb.nx * s * (hw + 2.5), oy = fb.y + fb.ny * s * (hw + 2.5); const L = s === fb.side ? 3 + fb.k * 0.55 : 1.5 + fb.k * 0.08;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.quadraticCurveTo(ox - fb.nx * s * L * 0.7 + fb.ny * fb.cu * L * 0.6, oy - fb.ny * s * L * 0.7 - fb.nx * fb.cu * L * 0.6, ox - fb.nx * s * L * 0.2 + fb.ny * fb.cu * L, oy - fb.ny * s * L * 0.2 - fb.nx * fb.cu * L); ctx.stroke(); }
    }
  }
  ctx.restore();
}

// ---------------- embers ----------------
const EMB = (() => { const r = rng(77), a = []; for (let i = 0; i < 200; i++) a.push({ u: r(), b: r() * 3.0, life: 0.8 + 1.5 * r(), vx: (r() - 0.5) * 50, vy: -(40 + 110 * r()), s: 0.7 + 2.0 * Math.pow(r(), 2), ph: r() * 100, fromSlit: r() < 0.5 }); return a; })();
const ASH = (() => { const r = rng(131), a = []; for (let i = 0; i < 26; i++) { const n = 5 + (r() * 3 | 0), pts = []; for (let j = 0; j < n; j++) { const an = j / n * TAU + (r() - 0.5) * 0.7, rr = 0.45 + 0.55 * r(); pts.push([Math.cos(an) * rr, Math.sin(an) * rr * (0.5 + 0.4 * r())]); }
  a.push({ u: i % 3 === 0 ? 0.02 + 0.12 * r() : i % 3 === 1 ? 0.86 + 0.12 * r() : 0.05 + 0.6 * r(), off: (r() - 0.5) * 40, b: 0.4 + 1.9 * r(), life: 1.4 + 1.2 * r(), vx: (r() - 0.5) * 30, vy: -(18 + 40 * r()), s: 4.5 + 8 * r(), rot: r() * TAU, spin: (r() - 0.5) * 5, ph: r() * 100, pts, tone: r() }); }
  for (let i = 0; i < 4; i++) { const n = 7, pts = []; for (let j = 0; j < n; j++) { const an = j / n * TAU + (r() - 0.5) * 0.5, rr = 0.5 + 0.5 * r(); pts.push([Math.cos(an) * rr, Math.sin(an) * rr * 0.7]); } // late, larger buoyant flakes: the last pieces of the wound lifting away
    a.push({ u: i < 2 ? 0.975 + 0.02 * r() : 0.005 + 0.02 * r(), off: (r() - 0.5) * 20, b: 1.9 + 0.42 * i + 0.2 * r(), life: 1.6, vx: (i % 2 ? 1 : -1) * (6 + 10 * r()), vy: -(10 + 12 * r()), s: 13 + 7 * r(), rot: r() * TAU, spin: (r() - 0.5) * 2, ph: r() * 100, pts, tone: 0.3 * r() }); }
  for (const f of a) f.life = Math.max(0.5, Math.min(f.life, 3.75 - f.b)); return a; })();
function drawAsh(ctx, st) { // a few identifiable ash flakes: irregular, curled (foreshortened by spin), drifting up, glowing edge while hot
  if (st.tear <= 0) return;
  ctx.save();
  for (const f of ASH) {
    const age = st.tearAge - f.b; if (age < 0 || age > f.life) continue;
    const k = age / f.life, p = pathAt(f.u), tg = tangent(f.u);
    const x = p.x - tg.ty * f.off + f.vx * age + 14 * noise1(age * 1.3 + f.ph), y = p.y + tg.tx * f.off + f.vy * age - 10 * age * age;
    const ang = f.rot + f.spin * age, fs = Math.cos(f.ph + age * 2.6), al = Math.min(1, age * 4) * Math.pow(1 - k, 1.2);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(f.s, f.s * (0.25 + 0.75 * Math.abs(fs)));
    ctx.beginPath(); f.pts.forEach((q, j) => j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
    const g = 40 + 70 * f.tone * k; ctx.fillStyle = `rgba(${g + 8 | 0},${g + 4 | 0},${g | 0},${0.85 * al})`; ctx.fill();
    const ho = cl(st.heat * (1 - k * 1.4)) * 0.8; if (ho > 0.03) { ctx.lineWidth = 0.35; ctx.strokeStyle = `rgba(255,140,50,${ho * al})`; ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
}
function drawEmbers(ctx, st) {
  if (st.tear <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  { const le = st.tearAge < 2.4 ? 0 : ss(2.4, 2.75, st.tearAge) * (1 - ss(3.35, 3.7, st.tearAge)) * (0.75 + 0.25 * Math.sin(st.t * 11) * Math.sin(st.t * 4.3)); // the last ember, under the lifted lip
    if (le > 0.01) { const sp = SPINE[0], qi = Math.floor((sp.pts.length - 1) * 0.42), q = sp.pts[qi], q2 = sp.pts[qi + 2] || q, an = Math.atan2(q2.y - q.y, q2.x - q.x), rr = 9 + 3 * le, g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rr);
      g.addColorStop(0, `rgba(255,160,70,${0.6 * le})`); g.addColorStop(0.35, `rgba(230,90,30,${0.45 * le})`); g.addColorStop(1, 'rgba(120,30,10,0)'); ctx.fillStyle = g; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(an); ctx.scale(2.6, 0.42); ctx.translate(-q.x, -q.y); ctx.beginPath(); ctx.arc(q.x, q.y, rr, 0, TAU); ctx.fill(); ctx.restore(); } }
  for (const e of EMB) {
    const age = st.tearAge - e.b; if (age < 0 || age > e.life) continue;
    let x0, y0;
    if (e.fromSlit) { const sp = SPINE[(e.ph | 0) % 2], p = sp.pts[Math.floor(e.u * (sp.pts.length - 1) * 0.6)]; x0 = p.x; y0 = p.y; }
    else { if (st.ignT < 0.82 * Math.pow(Math.min(e.u, 1 - e.u) / 0.5, 0.85)) continue; const p = pathAt(e.u); x0 = p.x; y0 = p.y; }
    const k = age / e.life;
    const x = x0 + e.vx * age + 16 * noise1(age * 1.7 + e.ph), y = y0 + e.vy * age - 26 * age * age;
    const a = Math.pow(1 - k, 1.5) * (0.6 + 0.4 * noise1(age * 20 + e.ph)) * st.heat;
    if (a <= 0.01) continue;
    ctx.fillStyle = `rgba(255,${(140 + 90 * (1 - k)) | 0},${(50 + 70 * (1 - k)) | 0},${cl(a)})`;
    ctx.beginPath(); ctx.arc(x, y, e.s * (1 - 0.5 * k), 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ---------------- frame ----------------
let bloomA, bloomB, bgC = null, ovC = null, vwLast = 0, vhLast = 0, frameNo = 0;
function draw(ctx, st) {
  const VW = ctx.canvas.width, VH = ctx.canvas.height;
  if (VW !== vwLast || VH !== vhLast) { bloomA = mk(Math.ceil(VW / 4), Math.ceil(VH / 4)); bloomB = mk(Math.ceil(VW / 8), Math.ceil(VH / 8)); vwLast = VW; vhLast = VH; }
  frameNo++;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0b0806'; ctx.fillRect(0, 0, VW, VH);
  const c = st.cam; const camT = (x) => { x.translate(VW / 2 + c.sx, VH / 2 + c.sy); x.rotate(c.rot || 0); x.scale(c.z, c.z); x.translate(-c.fx, -c.fy); };
  const key = VW + ',' + VH + ',' + c.z.toFixed(4) + ',' + c.fx.toFixed(2) + ',' + c.fy.toFixed(2);
  if (st.wide) { // interactive: camera is fixed, so the paper is a cached screen-space layer
    if (!bgC || bgC.__k !== key) { bgC = bgC && bgC.width === VW && bgC.height === VH ? bgC : mk(VW, VH); const bx = bgC.getContext('2d'); bx.setTransform(1, 0, 0, 1, 0, 0); bx.fillStyle = '#0b0806'; bx.fillRect(0, 0, VW, VH);
      bx.translate(VW / 2, VH / 2); bx.scale(c.z, c.z); bx.translate(-c.fx, -c.fy); drawPaper(bx, st); bgC.__k = key; }
    ctx.drawImage(bgC, c.sx, c.sy);
  }
  camT(ctx);
  if (!st.wide) drawPaper(ctx, st);
  // ink (body cached when nothing changes)
  const bodyDirty = st.forceBody !== false || st.sHead < 1 || (st.ignT >= 0 && (frameNo + 1) % (st.bodyEvery || 1) === 0) || (st.t - T_S1 < 6 && frameNo % 6 === 0);
  let inkDirty = false;
  if (bodyDirty || !bodyC.__ok) { bodyPass(st); bodyC.__ok = 1; inkDirty = true; }
  if (!st.endsEvery || frameNo % st.endsEvery === 0 || !endC.__ok) { endsPass(st); endC.__ok = 1; inkDirty = true; }
  const jit = st.strain * 1.2;
  const jx = noise1(st.t * 40) * jit, jy = noise1(st.t * 43 + 9) * jit;
  if (inkDirty) { inkX.clearRect(0, 0, BW, BH); inkX.drawImage(bodyC, 0, 0); inkX.drawImage(endC, EX0, EY0); } // pixel-exact merge, then one resample
  ctx.drawImage(inkC, BX + jx, BY + jy);
  drawSpatter(ctx, st);
  drawFilaments(ctx, st);
  if (st.tear > 0) { if (!st.tearEvery || (frameNo + (st.tearEvery > 2 ? 2 : 0)) % st.tearEvery === 0 || !tearC.__ok) { tearPass(st); tearC.__ok = 1; } ctx.drawImage(tearC, TX0, TY0); drawFibres(ctx, st); drawAsh(ctx, st); }
  { // room darkens as the circle strains (cached multiply layer, screen space)
    const dq = Math.round(st.dim * 60) / 60, k2 = key + '|' + dq;
    if (!ovC || ovC.__k !== k2) { const PD = 48; ovC = ovC && ovC.width === VW + 2 * PD && ovC.height === VH + 2 * PD ? ovC : mk(VW + 2 * PD, VH + 2 * PD); const ox = ovC.getContext('2d'); ox.setTransform(1, 0, 0, 1, PD, PD);
      ox.translate(VW / 2, VH / 2); ox.scale(c.z, c.z); ox.translate(-c.fx, -c.fy);
      const g = ox.createRadialGradient(G.x, G.y, 60, CX, CY, 1300), k = dq;
      g.addColorStop(0, `rgba(${255 - 110 * k | 0},${255 - 140 * k | 0},${255 - 160 * k | 0},1)`);
      g.addColorStop(0.45, `rgba(${255 - 180 * k | 0},${255 - 195 * k | 0},${255 - 205 * k | 0},1)`); g.addColorStop(1, `rgba(${255 - 230 * k | 0},${255 - 235 * k | 0},${255 - 240 * k | 0},1)`);
      ox.fillStyle = g; ox.fillRect(c.fx - VW / c.z, c.fy - VH / c.z, 2 * VW / c.z, 2 * VH / c.z);
      ox.setTransform(1, 0, 0, 1, PD, PD);
      // lamp falloff + vignette baked into the same layer
      const m = Math.max(VW, VH * 16 / 9);
      const lg = ox.createRadialGradient(VW * 0.45, VH * 0.4, m * 0.05, VW * 0.5, VH * 0.5, m * 0.62);
      const v = 0.5 + 0.25 * k; lg.addColorStop(0, 'rgba(255,255,255,1)'); lg.addColorStop(0.55, 'rgba(255,255,255,1)'); lg.addColorStop(1, `rgba(${255 - 225 * v | 0},${255 - 237 * v | 0},${255 - 247 * v | 0},1)`);
      ox.globalCompositeOperation = 'multiply'; ox.fillStyle = lg; ox.fillRect(-PD, -PD, VW + 2 * PD, VH + 2 * PD); ox.globalCompositeOperation = 'source-over'; ovC.__k = k2; }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(ovC, c.sx - 48, c.sy - 48); ctx.restore();
  }
  emLayer(ctx, st, camT, VW, VH);
  ctx.restore();
  if (st.glow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = st.glow; ctx.drawImage(bloomA, 0, 0, VW, VH); ctx.globalAlpha = st.glow * 0.8; ctx.drawImage(bloomB, 0, 0, VW, VH); ctx.restore(); }
  if (st.flash > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const p = worldToScreen(st, G.x, G.y, VW, VH), rr = 420 * st.cam.z;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr); g.addColorStop(0, `rgba(255,250,235,${st.flash})`); g.addColorStop(0.18, `rgba(255,190,110,${st.flash * 0.45})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); ctx.restore(); }
  if (st.inv) { ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, VW, VH); ctx.restore(); }
  if (st.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${st.fade})`; ctx.fillRect(0, 0, VW, VH); }
  ctx.restore();
}
function worldToScreen(st, x, y, VW = W, VH = H) { const c = st.cam; const dx = (x - c.fx) * c.z, dy = (y - c.fy) * c.z; const co = Math.cos(c.rot || 0), si = Math.sin(c.rot || 0); return { x: VW / 2 + c.sx + dx * co - dy * si, y: VH / 2 + c.sy + dx * si + dy * co }; }
function screenToWorld(st, x, y, VW = W, VH = H) { const c = st.cam; const dx = x - VW / 2 - c.sx, dy = y - VH / 2 - c.sy; const co = Math.cos(-(c.rot || 0)), si = Math.sin(-(c.rot || 0)); return { x: c.fx + (dx * co - dy * si) / c.z, y: c.fy + (dx * si + dy * co) / c.z }; }

function emLayer(ctx, st, camT, VW, VH) {
  const bx = bloomA.getContext('2d'), by = bloomB.getContext('2d');
  const doB = !st.glowEvery || frameNo % st.glowEvery === 0 || st.spark > 0;
  if (doB) { bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, bloomA.width, bloomA.height); }
  if (st.glow <= 0 && st.spark <= 0) return;
  const sc = bloomA.width / VW; bx.setTransform(sc, 0, 0, sc, 0, 0); camT(bx);
  const both = (fn) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; fn(ctx, false); ctx.restore(); if (doB) { bx.save(); bx.globalCompositeOperation = 'lighter'; fn(bx, true); bx.restore(); } };
  if (st.ignT >= 0) {
    if (doB) { bx.drawImage(emB, BX, BY, BW, BH); bx.drawImage(emE, BX + EX0, BY + EY0, EW, EH); }
  }
  if (st.spark > 0) both((x, isB) => { // the instant of contact: one hot point where the ends meet
    const g = x.createRadialGradient(G.x, G.y, 0, G.x, G.y, 9 + 20 * st.spark); g.addColorStop(0, `rgba(255,248,225,${st.spark})`); g.addColorStop(0.35, `rgba(255,170,70,${st.spark * 0.5})`); g.addColorStop(1, 'rgba(255,90,20,0)');
    x.fillStyle = g; x.beginPath(); x.arc(G.x, G.y, 80, 0, TAU); x.fill(); });
  if (st.tear > 0) both((x, isB) => {
    if (isB) x.drawImage(tearEC, TX0, TY0); else { x.globalAlpha = 0.3; x.drawImage(tearEC, TX0, TY0); x.globalAlpha = 1; }
    const gl = x.createRadialGradient(G.x, G.y, 0, G.x, G.y, 430);
    gl.addColorStop(0, `rgba(255,140,55,${0.13 * st.heat})`); gl.addColorStop(0.45, `rgba(190,70,18,${0.045 * st.heat})`); gl.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gl; x.fillRect(G.x - 500, G.y - 500, 1000, 1000);
  });
  drawEmbers(ctx, st); if (!doB) return; drawEmbers(bx, st);
  by.setTransform(1, 0, 0, 1, 0, 0); by.globalCompositeOperation = 'copy'; by.filter = 'blur(8px)'; by.drawImage(bloomA, 0, 0, bloomB.width, bloomB.height); by.filter = 'none';
  bx.setTransform(1, 0, 0, 1, 0, 0); bx.globalCompositeOperation = 'copy'; bx.filter = 'blur(3px)'; bx.drawImage(bloomA, 0, 0); bx.filter = 'none'; bx.globalCompositeOperation = 'source-over';
}

// ---------------- film timeline ----------------
const DUR = 10.6;
const TOUCH = 6.6, TEAR_T = 6.633;
function reachT_at(t) {
  if (t < 4.55) return kf(t, [[3.2, 0], [3.5, -0.16], [3.94, 0.53], [4.1, 0.57], [4.155, -0.5], [4.25, 0.21], [4.35, -0.1], [4.45, 0.035], [4.53, 0]]);
  if (t < 5.95) return kf(t, [[4.55, 0], [4.8, -0.22], [5.26, 0.83], [5.47, 0.88], [5.52, -0.8], [5.62, 0.32], [5.72, -0.15], [5.82, 0.06], [5.92, 0]]);
  if (t < TEAR_T) return kf(t, [[5.95, 0], [6.1, -0.16], [6.4, 0.9], [6.56, 0.93], [TOUCH, 1.0]]);
  return postTear(t);
}
function reachH_at(t) {
  if (t < 4.85) return 0;
  if (t < 5.95) return kf(t, [[4.85, 0], [5.02, -0.2], [5.32, 0.68], [5.47, 0.75], [5.52, -0.66], [5.62, 0.26], [5.72, -0.12], [5.82, 0.05], [5.92, 0]]);
  if (t < TEAR_T) return kf(t, [[5.95, 0], [6.12, -0.18], [6.42, 0.9], [6.56, 0.93], [TOUCH, 1.0]]);
  return postTear(t) * 1.05;
}
function postTear(t) { return kf(t, [[TEAR_T, 1.0], [TEAR_T + 0.055, -0.6], [TEAR_T + 0.15, -0.18], [TEAR_T + 0.26, -0.38], [TEAR_T + 0.4, -0.26], [TEAR_T + 0.62, -0.31], [TEAR_T + 1.0, -0.3]]); }
const SPAT_FILM = (() => {
  const r = rng(91), out = [];
  const add = (t0, n, sx, sy, dirx, diry, spd) => { for (let i = 0; i < n; i++) { const a = Math.atan2(diry, dirx) + (r() - 0.5) * 0.9, v = spd * (0.4 + 0.8 * r()); out.push({ t0: t0 + r() * 0.025, x: sx + (r() - 0.5) * 10, y: sy + (r() - 0.5) * 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 1.3 + 3.2 * Math.pow(r(), 2), seed: r() * 100 }); } };
  const tg = tangent(1), e = TIP_T;
  add(T_S1 - 0.02, 5, e.x, e.y, tg.tx, tg.ty, 80);
  const p1 = tipPos('T', 0.55); add(4.11, 7, p1.x, p1.y, -tg.tx, -tg.ty, 150);
  const p2 = tipPos('T', 0.9); add(5.47, 10, p2.x, p2.y, -tg.tx, -tg.ty, 200);
  const h2 = tipPos('H', 0.5); add(5.48, 6, h2.x, h2.y, tg.tx, tg.ty, 150);
  const pt = tipPos('T', 0.6), ph = tipPos('H', 0.6); add(TEAR_T + 0.01, 9, pt.x, pt.y, -tg.tx, -tg.ty, 260); add(TEAR_T + 0.01, 7, ph.x, ph.y, tg.tx, tg.ty, 230);
  { const t0 = tangent(0); add(T_BLOT + 0.008, 6, B0x + t0.tx * 30, B0y + t0.ty * 30, t0.tx, t0.ty, 150); }
  return out;
})();
function filmState(t) {
  const reachT = reachT_at(t), reachH = reachH_at(t), dt = 1 / 240;
  const velT = (reachT - reachT_at(t - dt)) / dt, velH = (reachH - reachH_at(t - dt)) / dt;
  const att = t < 4.55 ? 0.45 : t < 5.95 ? 0.75 : 1;
  const strain = t < TEAR_T ? cl(Math.max(reachT, reachH, 0)) * att : 0;
  const tearOn = t >= TEAR_T;
  const ta = Math.max(0, t - TEAR_T);
  const heat = !tearOn ? 0 : kf(t, [[TEAR_T, 1], [8.0, 0.86], [9.0, 0.46], [9.6, 0.24], [10.05, 0.07], [10.4, 0]]) * (1 + 0.04 * Math.sin(t * 7));
  const z = 1 + 0.11 * ss(0, DUR, t), focus = 0.3 * ss(0.5, DUR, t);
  const shk = tearOn ? 20 * Math.exp(-ta * 9) : (t >= 6.3 && t < TEAR_T ? 1.4 * strain : 0);
  return {
    t, sHead: strokeU(t), blot: blotSpread(t), reachT, reachH, velT, velH, strain,
    recA: t >= 5.52 && t < TEAR_T ? 1 : t >= 4.155 && t < 5.4 ? 0.6 : 0, recAge: t >= 5.52 ? t - 5.52 : t - 4.155, recH: t >= 5.52 ? 1 : 0,
    spark: t >= TOUCH && t < TEAR_T ? 1 : (tearOn ? Math.exp(-ta * 30) : 0),
    tear: tearOn ? 1 : 0, tearAge: ta, open: tearOn ? eOut(cl((ta - 0.02) / 0.4)) * (1 + 0.3 * ss(0, 1.5, ta) - 0.1 * ss(1.6, 3.3, ta)) : 0, tearProg: tearOn ? Math.pow(cl(ta / 0.22), 0.8) : 0,
    scorch: tearOn ? ss(0, 0.5, ta) : 0,
    ignT: tearOn && ta > 0.05 ? ta - 0.05 : -1, heat, heatLocalBase: 1,
    dim: !tearOn ? kf(t, [[3.0, 0], [4.5, 0.2], [5.9, 0.38], [TOUCH, 0.52]]) : kf(t, [[TEAR_T, 0.6], [9.6, 0.58]]),
    glow: t < TOUCH ? 0 : 1.0,
    flash: t >= TOUCH && t < TEAR_T + 0.2 ? (t < TEAR_T ? 0.35 : 0.6 * Math.exp(-ta * 16)) : 0,
    inv: t >= TEAR_T && t < TEAR_T + 1 / 60,
    spatter: SPAT_FILM,
    cam: { z, fx: lerp(CX, G.x, focus), fy: lerp(CY, G.y, focus), sx: noise1(t * 37) * shk, sy: noise1(t * 41 + 7) * shk, rot: noise1(t * 23 + 3) * shk * 0.0007 },
    fade: ss(10.05, DUR, t),
  };
}
function init() {
  makeSlitField();
  tearC = mk(TR, TR); tearX = tearC.getContext('2d'); tearImg = tearX.createImageData(TR, TR);
  tearEC = mk(TR, TR); tearEX = tearEC.getContext('2d'); tearEImg = tearEX.createImageData(TR, TR);
  makePaper(); bake();
  inkC = mk(BW, BH); inkX = inkC.getContext('2d');
  bodyC = mk(BW, BH); bodyX = bodyC.getContext('2d'); bodyImg = bodyX.createImageData(BW, BH);
  emB = mk((BW + 1) >> 1, (BH + 1) >> 1); emBX = emB.getContext('2d'); emBImg = emBX.createImageData(emB.width, emB.height);
  endC = mk(EW, EH); endX = endC.getContext('2d'); endImg = endX.createImageData(EW, EH);
  makeDst();
  emE = mk((EW + 1) >> 1, (EH + 1) >> 1); emEX = emE.getContext('2d'); emEImg = emEX.createImageData(emE.width, emE.height);
}
window.Enso = { _ends: endsPass, _body: bodyPass, _tear: tearPass, THM, ANG_T, ANG_H, SPAT_FILM, init, draw, filmState, pathAt, tangent, widthAt, tipPos, worldToScreen, screenToWorld, G, CX, CY, R, W, H, DUR, TOUCH, TEAR_T, T_S1, FT, FH, GAP, strokeU, rng, noise1, kf, cl, ss, eOut };
})();
