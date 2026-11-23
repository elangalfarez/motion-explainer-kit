// Stations D–I (11–40 s) and the J phone pull-out (40–42.3 s) for the Viktor-free reel.
import { W, H, C, clamp, lerp, ease, prog, hash, spring, wobble, T, amp, blob, inkFill, wline, rrect, guy, card, boilText } from '../../vendor/toon.js';

const blinkAt = (t, seed) => { const p = (t + seed * 1.7) % 3.1; return p < .12 ? Math.abs(p - .06) / .06 : 1; };
const talk = t => amp(t) * 1.1;
const vis = k => k > .002;

// ---------- props ----------
export function voucher(g, x, y, s, rot, label = '$1.500') {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rrect(g, -190 + 12, -105 + 14, 380, 210, 22); g.fillStyle = C.ink; g.fill();
  rrect(g, -190, -105, 380, 210, 22); inkFill(g, C.lime, 8);
  g.setLineDash([14, 12]); rrect(g, -168, -84, 336, 168, 14); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke(); g.setLineDash([]);
  boilText(g, 'FREE CREDIT', 0, -48, 34, C.ink);
  boilText(g, label, 0, 22, 92, C.white, { stroke: 12 });
  g.restore();
}
function sparkle(g, x, y, r, t0, t) {
  const k = prog(t, t0, t0 + .35, ease.out), f = 1 - prog(t, t0 + .35, t0 + .8);
  if (!vis(k) || f <= 0) return;
  g.save(); g.translate(x, y); g.rotate(t * 2); g.scale(k * f, k * f); g.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = i % 2 ? r * .35 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath(); inkFill(g, C.gold, 5); g.restore();
}
function burst(g, x, y, t0, t, n = 40, cols = [C.orange, C.lime, C.gold, C.blue, C.red], v0 = 900) {
  if (t < t0) return;
  for (let i = 0; i < n; i++) {
    const dt = t - t0 - hash(i + 40) * .08; if (dt < 0 || dt > 2.2) continue;
    const a = -Math.PI / 2 + (hash(i + 41) - .5) * 2.6, v = v0 * (.6 + hash(i + 42) * .8);
    const px = x + Math.cos(a) * v * dt, py = y + Math.sin(a) * v * dt + 1300 * dt * dt; if (py > 40) continue;
    g.save(); g.translate(px, py); g.rotate(dt * (6 + hash(i + 43) * 10)); g.scale(1, Math.cos(dt * 12 + i));
    g.fillStyle = cols[i % cols.length]; g.fillRect(-12, -7, 24, 14); g.restore();
  }
}

// ---------- D: Viktor vs Hermes power bars (x 4700) ----------
export function stationD(g, t) {
  const tv2 = T('viktor', 2), th = T('hermes', 3), tt = T('tapi'), tj = T('jauh'), tpw = T('powerful');
  const flex = prog(t, tpw - .15, tpw + .15, ease.outBack);
  // power bars
  const bk = prog(t, tt - .15, tt + .25, ease.outBack);
  if (vis(bk)) {
    const rows = [['HERMES', -830, prog(t, tj, tj + .6, ease.out) * .3, '#C9C2B6'], ['VIKTOR', -690, 0, C.orange]];
    const vf = prog(t, tj, tpw, ease.in) + spring(t, tpw, 1.6, 4) * .45;
    rows[1][2] = vf;
    for (const [lab, y, f, col] of rows) {
      g.save(); g.translate(4700, y); g.scale(bk, bk);
      const bw = 620, bh = 96, x0 = -bw / 2;
      rrect(g, x0 + 10, -bh / 2 + 12, bw, bh, 48); g.fillStyle = C.ink; g.fill();
      rrect(g, x0, -bh / 2, bw, bh, 48); g.fillStyle = C.white; g.fill();
      const fw = Math.max(0, f) * bw;
      if (fw > 4) { g.save(); rrect(g, x0, -bh / 2, Math.max(bh, fw), bh, 48); g.fillStyle = col; g.fill(); g.restore(); }
      rrect(g, x0, -bh / 2, Math.max(bw, fw), bh, 48); g.lineWidth = 8; g.strokeStyle = C.ink; g.stroke();
      g.font = `900 44px ${C.font}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = C.ink; g.fillText(lab, x0 + 36, 3);
      if (lab === 'VIKTOR' && t > tpw) { g.textAlign = 'right'; g.fillStyle = C.white; g.lineWidth = 9; g.strokeStyle = C.ink; g.strokeText('MAX+', x0 + fw - 30, 3); g.fillText('MAX+', x0 + fw - 30, 3); }
      g.restore();
    }
    if (t > tpw) { burst(g, 4700 + 310 * 1.4, -690, tpw, t, 30, [C.orange, C.gold, C.lime], 700); sparkle(g, 4960, -780, 70, tpw, t); sparkle(g, 5060, -620, 50, tpw + .12, t); }
  }
  // "≈" between them
  const ak = prog(t, th - .1, th + .2, ease.outBack) * (1 - prog(t, tt - .2, tt));
  if (vis(ak)) { g.save(); g.translate(4700, -330); g.scale(ak, ak); boilText(g, '≈', 0, 0, 170, C.ink); g.restore(); }
  // old Hermes shuffles in
  const hk = prog(t, th - .5, th + .3, ease.out);
  if (vis(hk)) guy(g, { kind: 'hermes', x: lerp(4250, 4480, hk) + Math.sin(t * 40) * 2, y: 0, s: .88, shirt: '#F4F1EA', walker: 1, lean: .2, tilt: .15,
    wing: -.6, hlx: 70, hly: 40, hrx: 90, hry: 50, eyes: t > tpw ? 'wide' : 'shut', brow: 1, smile: -.6, mouth: t > tpw ? .5 : 0, blink: 1, lookX: .8 }, 7);
  // Viktor drops in
  const vk = prog(t, tv2 + .45, tv2 + .85, ease.outBack);
  if (vis(vk)) {
    const land = wobble(t, tv2 + .8, .12, 2.6, 6), wave = t < th ? Math.sin(t * 12) * 40 : 0;
    guy(g, { kind: 'viktor', x: 4930, y: -(1 - vk) * 900, s: 1.0, shirt: C.blue, sq: land + wobble(t, tpw, .1, 3, 6), tilt: Math.sin(t * 2.3) * .04,
      hlx: lerp(-30, -110, flex), hly: lerp(95, -330, flex), hrx: lerp(t < th ? 110 : 30, 110, flex) + wave * (1 - flex), hry: lerp(t < th ? -200 : 95, -330, flex),
      eyes: flex > .5 ? 'happy' : 'dot', blink: blinkAt(t, 4), mouth: flex * .6, smile: .9, lookX: -.5 * (1 - flex), legL: flex * .2, legR: flex * .2 }, 9);
  }
}

// ---------- E: frontier models (x 6300) ----------
export function stationE(g, t, IM) {
  const tl = T('lu'), tf = T('frontier'), to = T('opus'), tg = T('gpt'), ts = T('sol');
  const ok = prog(t, to - .25, to + .2, ease.outBack), gk = prog(t, tg - .25, tg + .2, ease.outBack);
  if (vis(ok)) {
    card(g, IM.opus, { x: 6170, y: lerp(-1500, -780, ok), w: 560, rot: lerp(.4, -.05, ok) + wobble(t, to, .04, 2, 4), alpha: 1, scroll: prog(t, to, 19, ease.inOut) * 260, url: 'anthropic.com/claude/opus' });
  }
  if (vis(gk)) {
    card(g, IM.gpt56, { x: 6440, y: lerp(-1500, -545, gk), w: 560, rot: lerp(-.4, .05, gk) + wobble(t, tg, .04, 2, 4), alpha: 1, scroll: prog(t, tg, 19, ease.inOut) * 220, url: 'openai.com/index/gpt-5-6' });
  }
  const tag = (x, y, txt, col, t0, rot) => { const k = prog(t, t0, t0 + .3, ease.outBack); if (!vis(k)) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.font = `900 40px ${C.font}`; const w = g.measureText(txt).width + 50;
    rrect(g, -w / 2 + 6, -32 + 8, w, 64, 32); g.fillStyle = C.ink; g.fill(); rrect(g, -w / 2, -32, w, 64, 32); inkFill(g, col, 6);
    g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 2); g.restore(); };
  tag(6020, -1010, 'CLAUDE OPUS', C.orange, to + .05, -.08);
  tag(6560, -330, 'GPT-5.6 SOL', C.lime, ts - .05, .06);
  // characters
  const pt = prog(t, tl - .1, tl + .2, ease.outBack) * (1 - prog(t, tf + .3, tf + .6));
  guy(g, { kind: 'elang', x: 6040, y: 0, s: .86, tilt: Math.sin(t * 2) * .04, hlx: -30, hly: 95, hrx: lerp(30, 120, pt), hry: lerp(95, -110, pt),
    eyes: 'dot', blink: blinkAt(t, 5), mouth: talk(t), smile: .8, lookX: .3 + pt * .4, lookY: -pt * .3, sq: wobble(t, tl, .06, 2.5, 6) }, 11);
  const ch = prog(t, to - .1, to + .2, ease.out);
  guy(g, { kind: 'viktor', x: 6580, y: 0, s: .86, shirt: C.blue, tilt: Math.sin(t * 2.4 + 1) * .04, hlx: lerp(-30, -140, ch), hly: lerp(95, -260, ch), hrx: 30, hry: 95,
    eyes: 'dot', blink: blinkAt(t, 6), mouth: 0, smile: .9, lookX: -.6, lookY: -ch * .6, sq: wobble(t, tg, .05, 2.5, 6) }, 13);
}

// ---------- F: receipt GRATIS -> $1.500 credit (x 7900) ----------
export function stationF(g, t) {
  const tsg = T('semuanya'), tgr = T('gratis', 2), tgw = T('gw', 2), tk = T('kredit'), t15 = T('1500');
  const rk = prog(t, tsg - .55, tsg - .1, ease.outBack), rout = prog(t, tgw - .1, tgw + .4, ease.in);
  if (vis(rk) && rout < .999) {
    g.save(); g.translate(7760 - rout * 900, lerp(-1600, -660, rk) - rout * 300); g.rotate(lerp(-.4, -.04, rk) - rout * .8 + wobble(t, tgr + .1, .04, 2, 4));
    const w = 440, h = 520;
    g.beginPath(); g.moveTo(-w / 2 + 12, -h / 2 + 14); g.lineTo(w / 2 + 12, -h / 2 + 14); for (let i = 0; i <= 11; i++) g.lineTo(w / 2 + 12 - i * w / 11, h / 2 + 14 + (i % 2 ? -18 : 0)); g.closePath(); g.fillStyle = C.ink; g.fill();
    g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2); for (let i = 0; i <= 11; i++) g.lineTo(w / 2 - i * w / 11, h / 2 + (i % 2 ? -18 : 0)); g.closePath(); inkFill(g, C.white, 7);
    g.font = `900 40px ${C.font}`; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STRUK', 0, -h / 2 + 50);
    g.setLineDash([10, 10]); g.lineWidth = 4; g.beginPath(); g.moveTo(-w / 2 + 30, -h / 2 + 85); g.lineTo(w / 2 - 30, -h / 2 + 85); g.stroke(); g.setLineDash([]);
    const items = [['Viktor', '$0'], ['Claude Opus', '$0'], ['GPT-5.6 Sol', '$0']];
    g.font = `800 34px ${C.font}`;
    items.forEach(([a, b], i) => { const k = prog(t, tsg - .1 + i * .15, tsg + .1 + i * .15); if (k < .01) return; g.globalAlpha = k;
      g.textAlign = 'left'; g.fillText(a, -w / 2 + 34, -h / 2 + 140 + i * 62); g.textAlign = 'right'; g.fillText(b, w / 2 - 34, -h / 2 + 140 + i * 62); g.globalAlpha = 1; });
    const tk2 = prog(t, tgr - .2, tgr + .05);
    if (tk2 > .01) { g.globalAlpha = tk2; g.lineWidth = 5; g.beginPath(); g.moveTo(-w / 2 + 30, 95); g.lineTo(w / 2 - 30, 95); g.stroke();
      g.font = `900 44px ${C.font}`; g.textAlign = 'left'; g.fillText('TOTAL', -w / 2 + 34, 150); g.textAlign = 'right'; g.fillText('Rp 0', w / 2 - 34, 150); g.globalAlpha = 1; }
    const sk = prog(t, tgr + .05, tgr + .25, ease.out);
    if (vis(sk)) { g.save(); g.translate(20, -10); g.rotate(-.25); const s = lerp(2.4, 1, sk); g.scale(s, s); g.globalAlpha = sk;
      rrect(g, -175, -62, 350, 124, 16); g.lineWidth = 11; g.strokeStyle = C.red; g.stroke(); boilText(g, 'GRATIS', 0, 5, 88, C.red); g.restore(); }
    g.restore();
  }
  // elang: points at receipt, then catches the voucher and lifts it
  const slide = prog(t, tgw - .1, tgw + .5, ease.inOut), catchK = prog(t, t15 - .25, t15 + .05, ease.out), lift = prog(t, t15 + .05, t15 + .45, ease.outBack);
  const ex = lerp(8120, 7920, slide);
  const point = prog(t, tsg - .1, tsg + .2, ease.outBack) * (1 - slide);
  const hx = lerp(lerp(-30, -150, point), 0, catchK), hy = lerp(lerp(95, -60, point), 20, catchK);
  guy(g, { kind: 'elang', x: ex, y: 0, s: .95, tilt: Math.sin(t * 2) * .04, sq: wobble(t, t15, .08, 2.4, 6) + wobble(t, tgr + .1, .05, 2.5, 6),
    hlx: lerp(hx, -60, lift), hly: lerp(hy, -330, lift), hrx: lerp(lerp(30, 60, catchK), 60, lift), hry: lerp(lerp(95, 20, catchK), -330, lift),
    eyes: lift > .5 || (t > tgr + .1 && t < tgw) ? 'happy' : (catchK > .3 ? 'wide' : 'dot'), blink: blinkAt(t, 7), mouth: talk(t), smile: .9, lookX: lerp(-.7 * point, 0, slide), lookY: -catchK * .5 }, 15);
  if (t > tk - .6) {
    const fall = prog(t, tk - .6, t15 - .05, ease.in);
    const vx = ex, vy = lerp(-1700, -190 * .95 + 20, fall) - lift * 400;
    voucher(g, vx, vy, .9, lerp(.6, 0, fall) + Math.sin(t * 3) * .03 * lift, '$1.500');
    if (t > t15) { sparkle(g, vx - 200, vy - 90, 60, t15, t); sparkle(g, vx + 210, vy + 60, 46, t15 + .1, t); }
  }
}

// ---------- G: max usage -> +$1.500 -> $3.000 (x 9500) ----------
export function stationG(g, t) {
  const tk = T('kalau'), tm = T('maksimal'), t2 = T('1500', 2), ttot = T('total'), t3 = T('3000');
  // gauge
  const gk = prog(t, tk - .4, tk, ease.outBack);
  if (vis(gk)) {
    g.save(); g.translate(9500, -700); g.scale(gk, gk);
    const R = 250;
    g.beginPath(); g.arc(12, 14, R + 30, Math.PI, 0); g.closePath(); g.fillStyle = C.ink; g.fill();
    g.beginPath(); g.arc(0, 0, R + 30, Math.PI, 0); g.closePath(); inkFill(g, C.white, 8);
    const segs = [C.lime, C.lime, C.gold, C.orange, C.red];
    segs.forEach((col, i) => { g.beginPath(); g.arc(0, 0, R, Math.PI + i * Math.PI / 5, Math.PI + (i + 1) * Math.PI / 5); g.arc(0, 0, R - 70, Math.PI + (i + 1) * Math.PI / 5, Math.PI + i * Math.PI / 5, true); g.closePath(); inkFill(g, col, 6); });
    let v = prog(t, tk, tm + .1, ease.inOut) * .9; if (t > tm + .1) v = .9 + .1 * Math.abs(Math.sin((t - tm) * 30)) * (1 - prog(t, tm + .6, tm + 1.2)) + .1 * prog(t, tm + .6, tm + 1.2);
    const a = Math.PI + clamp(v, 0, 1.02) * Math.PI;
    g.lineWidth = 14; g.lineCap = 'round'; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * (R - 30), Math.sin(a) * (R - 30)); g.stroke();
    g.beginPath(); g.arc(0, 0, 26, 0, 7); inkFill(g, C.ink, 4);
    g.font = `900 40px ${C.font}`; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PEMAKAIAN', 0, 60);
    const mk = prog(t, tm + .05, tm + .3, ease.outBack);
    if (vis(mk)) { g.save(); g.translate(R - 10, -R + 10); g.rotate(.2); g.scale(mk, mk); boilText(g, 'MAX!', 0, 0, 96, C.red, { stroke: 12, strokeColor: C.ink }); g.restore(); }
    g.restore();
  }
  // desk + laptop
  g.save(); g.lineWidth = 8; g.strokeStyle = C.ink;
  rrect(g, 9310, -210, 340, 34, 8); inkFill(g, '#C98A4B', 7); wline(g, [[9340, -176], [9340, 0]], 81); g.stroke(); wline(g, [[9620, -176], [9620, 0]], 82); g.stroke();
  g.save(); g.translate(9500, -214); g.beginPath(); g.moveTo(-120, 0); g.lineTo(120, 0); g.lineTo(100, -14); g.lineTo(-100, -14); g.closePath(); inkFill(g, '#D9DCE0', 6);
  g.beginPath(); g.moveTo(-95, -14); g.lineTo(-115, -170); g.lineTo(85, -170); g.lineTo(100, -14); g.closePath(); inkFill(g, C.ink, 6);
  const glow = .6 + .4 * Math.sin(t * 20); g.fillStyle = `rgba(185,227,106,${glow})`; g.beginPath(); g.moveTo(-88, -24); g.lineTo(-104, -160); g.lineTo(76, -160); g.lineTo(90, -24); g.closePath(); g.fill();
  g.restore(); g.restore();
  // elang typing like crazy (behind laptop from our view: stands left, faces right)
  const typing = t > tk - .2 && t < ttot ? 1 : 0, ty = Math.sin(t * 38) * 18 * typing;
  const sweat = t > tm && t < ttot;
  const cheer = prog(t, ttot - .1, ttot + .2, ease.outBack);
  guy(g, { kind: 'elang', x: 9300, y: 0, s: .95, lean: .06 * typing, tilt: .05 * typing + Math.sin(t * 2) * .03, sq: typing * Math.sin(t * 19) * .015 + wobble(t, t3, .08, 2.4, 6),
    hlx: lerp(110 + ty, -80, cheer), hly: lerp(-30, -320, cheer), hrx: lerp(150 - ty, 90, cheer), hry: lerp(-20, -330, cheer),
    eyes: cheer > .5 ? 'happy' : (sweat ? 'wide' : 'dot'), brow: sweat && cheer < .5 ? 1 : 0, blink: blinkAt(t, 8), mouth: talk(t), smile: .8, lookX: .8 * (1 - cheer), lookY: .4 * (1 - cheer) }, 17);
  if (sweat) for (let i = 0; i < 3; i++) { const p = ((t * 1.8 + i / 3) % 1); g.save(); g.globalAlpha = 1 - p; g.translate(9300 - 120 + i * 30, -560 + p * 140); blob(g, 0, 0, 10, 15, 300 + i, 10, .8); inkFill(g, '#9ED8F5', 4); g.restore(); }
  // voucher stack on the right
  voucher(g, 9720, -90, .7, -.06, '$1.500');
  if (t > t2 - .45) {
    const f = prog(t, t2 - .45, t2 - .02, ease.in), land = wobble(t, t2, .1, 2.6, 6);
    g.save(); g.translate(0, 0); voucher(g, 9725, lerp(-1700, -175, f), .7 * (1 + land), lerp(-.7, .05, f), '$1.500'); g.restore();
    if (t > t2) { sparkle(g, 9600, -260, 56, t2, t); sparkle(g, 9860, -200, 44, t2 + .1, t); }
  }
  if (t > t3 - .05) burst(g, 9500, -460, t3 - .05, t, 70);
}

// ---------- H: bansos sack + Rp54 juta (x 11100) ----------
export function stationH(g, t) {
  const ta = T('atau'), tb = T('bansos'), trp = T('rp54');
  const drop = prog(t, tb - .35, tb, ease.in), land = wobble(t, tb, .16, 2.4, 5);
  const hop = t > tb + .05 ? Math.max(0, Math.sin(clamp((t - tb - .1) / .5) * Math.PI)) : 0;
  const think = prog(t, ta - .1, ta + .3) * (1 - prog(t, tb - .1, tb));
  guy(g, { kind: 'elang', x: 10860, y: -hop * 120, s: .95, sq: -hop * .08 + wobble(t, tb + .6, .08, 2.4, 6), tilt: think * .15 + Math.sin(t * 2) * .03,
    hlx: lerp(-30, -110, hop > 0 || t > tb ? 1 : 0) + think * 70, hly: lerp(95, -300, t > tb ? 1 : 0) - think * 230, hrx: t > tb ? 110 : 30, hry: t > tb ? -300 : 95,
    eyes: t > tb ? 'happy' : 'dot', blink: blinkAt(t, 9), mouth: talk(t), smile: .9, lookX: t > tb ? .6 : .2, lookY: -think * .8 }, 19);
  if (think > .02) boilText(g, '?', 10980, -620 + Math.sin(t * 6) * 8, 110, C.ink);
  if (vis(drop)) {
    g.save(); g.translate(11230, lerp(-1700, 0, drop)); g.scale(1 + land, 1 - land);
    // sack
    g.beginPath(); g.moveTo(-180, 0); g.quadraticCurveTo(-215, -260, -150, -430); g.quadraticCurveTo(0, -470, 150, -430); g.quadraticCurveTo(215, -260, 180, 0); g.closePath();
    g.save(); g.translate(12, 12); g.fillStyle = C.ink; g.fill(); g.restore(); inkFill(g, '#E7D3A7', 8);
    g.save(); g.clip(); g.fillStyle = C.red; g.fillRect(-230, -330, 460, 70); g.fillStyle = C.white; g.fillRect(-230, -260, 460, 70); g.restore();
    g.lineWidth = 6; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(-205, -330); g.lineTo(205, -330); g.moveTo(-205, -190); g.lineTo(205, -190); g.stroke();
    // tie on top
    g.beginPath(); g.moveTo(-60, -440); g.quadraticCurveTo(0, -520, 60, -440); inkFill(g, '#E7D3A7', 7);
    g.beginPath(); g.ellipse(-40, -500, 40, 22, -.5, 0, 7); inkFill(g, '#C9A86A', 6); g.beginPath(); g.ellipse(40, -500, 40, 22, .5, 0, 7); inkFill(g, '#C9A86A', 6);
    boilText(g, 'BANSOS', 0, -110, 78, C.ink);
    boilText(g, 'VIKTOR', 0, -45, 40, C.orange2);
    g.restore();
    if (t > tb) { g.save(); g.globalAlpha = 1 - prog(t, tb + .4, tb + 1.1); for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI, d = prog(t, tb, tb + .8, ease.out) * 260;
      blob(g, 11230 + Math.cos(a) * d * 1.3, -10 + Math.sin(a) * d * .25, 30, 20, 400 + i, 14, 1.4); inkFill(g, '#EFE8DB', 4); } g.restore(); }
  }
  // money rain
  if (t > trp - .2) for (let i = 0; i < 26; i++) {
    const dt = t - (trp - .2) - hash(i + 70) * 1.2; if (dt < 0) continue;
    const x = 10650 + hash(i + 71) * 900 + Math.sin(dt * 3 + i) * 50, y = -1300 + dt * (380 + hash(i + 72) * 200); if (y > -30) continue;
    g.save(); g.translate(x, y); g.rotate(Math.sin(dt * 2.5 + i) * .6); g.scale(1, Math.cos(dt * 4 + i) * .5 + .6);
    rrect(g, -60, -30, 120, 60, 6); inkFill(g, i % 3 ? '#F28B8B' : '#7FB8F0', 5); g.font = `900 26px ${C.font}`; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(i % 3 ? '100RB' : '50RB', 0, 2);
    g.restore();
  }
}

// ---------- I: apa aja -> scraping backlink -> reverse engineer strategy (x 12700) ----------
const DOMAINS = ['blogtekno.id', 'gamerzone.net', 'kompas-tekno.id', 'forumgame.id', 'reviewapps.com', 'medium.com/@', 'gadgetin.id', 'topup-guide.net', 'esportsnews.id', 'quora.com/...', 'techinasia.id', 'detik-inet.id'];
export function stationI(g, t, IM) {
  const tb = T('bisa', 2), tkm = T('kemarin'), tsc = T('scraping'), tbl = T('backlink'), tko = T('kompetitor'), tre = T('reverse'), tst = T('strategi'), tseo = T('seo'), tev = T('even');
  // task chips burst around ("bisa buat apa aja")
  const chips = [['RISET', -300, -880, C.orange], ['EMAIL', 120, -940, C.lime], ['LAPORAN', 330, -760, C.gold], ['CODING', -360, -650, C.lime], ['DESAIN', -20, -720, C.white], ['SEO', 260, -560, C.orange]];
  chips.forEach(([txt, dx, dy, col], i) => {
    const k = prog(t, tb + i * .09, tb + i * .09 + .3, ease.outBack), out = prog(t, tkm - .2 + i * .03, tkm + .15 + i * .03, ease.in);
    if (!vis(k) || out > .999) return;
    g.save(); g.translate(12700 + dx, dy - out * 900); g.rotate((hash(i) - .5) * .3 + Math.sin(t * 3 + i) * .04); g.scale(k, k);
    g.font = `900 46px ${C.font}`; const w = g.measureText(txt).width + 60;
    rrect(g, -w / 2 + 8, -38 + 10, w, 76, 38); g.fillStyle = C.ink; g.fill(); rrect(g, -w / 2, -38, w, 76, 38); inkFill(g, col, 7);
    g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 3); g.restore();
  });
  // competitor site + sheet (scraping)
  const sk = prog(t, tsc - .45, tsc - .05, ease.outBack), flip = prog(t, tre - .05, tre + .5, ease.inOut), gone = prog(t, tst - .25, tst + .1, ease.in);
  if (vis(sk) && gone < .999) {
    g.save(); g.translate(12510, -800 - gone * 900); g.scale(Math.max(.02, Math.abs(Math.cos(flip * Math.PI))), 1); g.translate(-12510, 800);
    card(g, flip < .5 ? IM.comp : IM.gears, { x: 12510, y: -800, w: 470, rot: lerp(.3, -.04, sk), alpha: 1, s: lerp(.5, 1, sk), url: 'kompetitor.com' });
    g.restore();
    // spreadsheet
    const shk = prog(t, tbl - .3, tbl + .1, ease.outBack);
    if (vis(shk)) {
      g.save(); g.translate(12920, -600 - gone * 900); g.rotate(.04); g.scale(shk * .9, shk * .9);
      const w = 400, h = 430;
      rrect(g, -w / 2 + 12, -h / 2 + 14, w, h, 18); g.fillStyle = C.ink; g.fill(); rrect(g, -w / 2, -h / 2, w, h, 18); inkFill(g, C.white, 7);
      g.fillStyle = '#2E9E55'; rrect(g, -w / 2, -h / 2, w, 62, [18, 18, 0, 0]); g.fill(); g.lineWidth = 7; g.strokeStyle = C.ink; g.stroke();
      g.font = `800 30px ${C.font}`; g.fillStyle = C.white; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('backlinks.csv', -w / 2 + 22, -h / 2 + 32);
      const n = Math.floor(prog(t, tbl, tre + .3) * 11);
      g.font = `700 24px ${C.font}`;
      for (let i = 0; i < n; i++) { const y = -h / 2 + 92 + i * 31; g.fillStyle = i % 2 ? '#F3EEE6' : C.white; g.fillRect(-w / 2 + 8, y - 15, w - 16, 31);
        g.fillStyle = C.ink; g.textAlign = 'left'; g.fillText(DOMAINS[i], -w / 2 + 22, y); g.textAlign = 'right'; g.fillStyle = '#5C564F'; g.fillText('DR ' + (30 + Math.floor(hash(i + 90) * 55)), w / 2 - 22, y); }
      g.restore();
    }
    // flying link icons
    if (t > tsc && t < tre + .3) for (let i = 0; i < 14; i++) {
      const p = ((t - tsc) * 1.3 + i / 14) % 1; if (t - tsc < i / 14 / 1.3) continue;
      const x = lerp(12620, 12900, p), y = lerp(-760, -640, p) - Math.sin(p * Math.PI) * 220;
      g.save(); g.translate(x, y); g.rotate(p * 6); g.lineWidth = 7; g.strokeStyle = C.blue;
      g.beginPath(); g.ellipse(-12, 0, 20, 11, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(12, 0, 20, 11, 0, 0, 7); g.stroke(); g.restore();
    }
  }
  // strategy board
  const bk = prog(t, tst - .15, tst + .3, ease.outBack);
  if (vis(bk)) {
    g.save(); g.translate(12700, -740); g.rotate(-.02 + wobble(t, tst + .2, .03, 2, 4)); g.scale(bk, bk);
    const w = 720, h = 470;
    rrect(g, -w / 2 + 14, -h / 2 + 16, w, h, 20); g.fillStyle = C.ink; g.fill(); rrect(g, -w / 2, -h / 2, w, h, 20); inkFill(g, '#C98A4B', 8);
    rrect(g, -w / 2 + 26, -h / 2 + 26, w - 52, h - 52, 10); inkFill(g, '#E2B57E', 5);
    const notes = [['GUEST POST', -215, -110, C.gold], ['PR / MEDIA', 30, -125, C.lime], ['FORUM', 225, -60, '#9ED8F5'], ['NICHE EDIT', -150, 85, '#F7A8C4'], ['DIREKTORI', 120, 95, C.gold]];
    const ks = notes.map((_, i) => prog(t, tst + .1 + i * .18, tst + .4 + i * .18, ease.outBack));
    g.lineWidth = 5; g.strokeStyle = C.red;
    for (let i = 0; i < notes.length - 1; i++) { const kk = Math.min(ks[i], ks[i + 1]); if (kk < .9) continue; g.beginPath(); g.moveTo(notes[i][1], notes[i][2]); g.lineTo(notes[i + 1][1], notes[i + 1][2]); g.stroke(); }
    notes.forEach(([txt, x, y, col], i) => { const k = ks[i]; if (!vis(k)) return;
      g.save(); g.translate(x, y); g.rotate((hash(i + 60) - .5) * .2); g.scale(k, k);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-88, -58, 186, 126); g.fillStyle = col; g.fillRect(-95, -65, 186, 126); g.lineWidth = 4; g.strokeStyle = C.ink; g.strokeRect(-95, -65, 186, 126);
      g.font = `900 28px ${C.font}`; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, -2, 2);
      g.beginPath(); g.arc(-2, -52, 11, 0, 7); inkFill(g, C.red, 4); g.restore(); });
    g.restore();
  }
  // characters
  const order = prog(t, tkm + .2, tkm + .5, ease.outBack) * (1 - prog(t, tsc + .4, tsc + .7));
  guy(g, { kind: 'elang', x: 12470, y: 0, s: .86, tilt: Math.sin(t * 2) * .04, hlx: -30, hly: 95, hrx: lerp(30, 150, order), hry: lerp(95, -120, order),
    eyes: t > tst + .3 ? 'happy' : 'dot', blink: blinkAt(t, 10), mouth: talk(t), smile: .8, lookX: .6, sq: wobble(t, tkm + .3, .06, 2.5, 6) }, 21);
  const work = t > tsc && t < tre + .3 ? 1 : 0, wy = Math.sin(t * 30) * 15 * work;
  const present = prog(t, tst, tst + .3, ease.outBack);
  const hey = prog(t, tb, tb + .3, ease.outBack) * (1 - prog(t, tkm - .2, tkm + .1));
  guy(g, { kind: 'viktor', x: 12930, y: 0, s: .86, shirt: C.blue, tilt: Math.sin(t * 2.4 + 1) * .04 - work * .06,
    hlx: lerp(lerp(lerp(-30, -110, hey), -150 + wy, work), -170, present), hly: lerp(lerp(lerp(95, -280, hey), -260, work), -300, present),
    hrx: lerp(lerp(30, 110, hey), 30, Math.max(work, present)), hry: lerp(lerp(95, -280, hey), 95, Math.max(work, present)),
    eyes: work ? 'dot' : (hey > .5 ? 'happy' : 'dot'), brow: work ? -1 : 0, blink: blinkAt(t, 11), mouth: 0, smile: .9, lookX: -.7, lookY: -.6 * Math.max(work, present) }, 23);
}

// ---------- offscreen footage-like images (illustrative, not real sites) ----------
export function makeMocks() {
  const mk = (fn) => { const c = document.createElement('canvas'); c.width = 1200; c.height = 750; const g = c.getContext('2d'); fn(g); return c; };
  const comp = mk(g => {
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 1200, 750); g.fillStyle = '#1F2A44'; g.fillRect(0, 0, 1200, 90);
    g.fillStyle = '#FFFFFF'; g.font = '900 44px Outfit'; g.textBaseline = 'middle'; g.fillText('KOMPETITOR', 50, 46);
    g.font = '700 26px Outfit'; ['Promo', 'Game', 'Blog', 'Kontak'].forEach((s, i) => g.fillText(s, 700 + i * 120, 46));
    g.fillStyle = '#FFE3D3'; g.fillRect(0, 90, 1200, 300); g.fillStyle = '#1F2A44'; g.font = '900 64px Outfit'; g.fillText('Top up termurah', 60, 200); g.fillText('se-Indonesia!', 60, 280);
    g.fillStyle = '#FF7A3D'; g.fillRect(60, 320, 220, 50);
    for (let i = 0; i < 4; i++) { g.fillStyle = ['#D9E4FF', '#E7F6D5', '#FFF1C9', '#F4D9FF'][i]; g.fillRect(60 + i * 275, 430, 245, 260); g.fillStyle = '#1F2A44'; g.fillRect(85 + i * 275, 610, 140, 22); }
  });
  const gears = mk(g => {
    g.fillStyle = '#1B1817'; g.fillRect(0, 0, 1200, 750); g.strokeStyle = '#B9E36A'; g.lineWidth = 3;
    for (let x = 0; x < 1200; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 750); g.stroke(); } for (let y = 0; y < 750; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(1200, y); g.stroke(); }
    const gear = (x, y, r, col) => { g.save(); g.translate(x, y); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, rr = i % 2 ? r : r * 1.22; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill();
      g.fillStyle = '#1B1817'; g.beginPath(); g.arc(0, 0, r * .4, 0, 7); g.fill(); g.restore(); };
    gear(420, 380, 190, '#FF7A3D'); gear(760, 300, 120, '#F2C14E'); gear(820, 560, 90, '#B9E36A');
  });
  return { comp, gears };
}

// ---------- J: the whole reel shrinks into a phone held up by Viktor ----------
export function phoneK(t) { return prog(t, T('even') - .05, T('even') + .75, ease.inOutExpo); }
export function phoneOuter(g, t, k) { // background behind the phone
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  g.save(); g.translate(540, 800); g.rotate(t * .3); g.globalAlpha = k;
  for (let i = 0; i < 16; i++) { g.rotate(Math.PI * 2 / 16); g.beginPath(); g.moveTo(0, 0); g.lineTo(-120, -1600); g.lineTo(120, -1600); g.closePath(); g.fillStyle = i % 2 ? 'rgba(242,193,78,.45)' : 'rgba(255,122,61,.28)'; g.fill(); }
  g.restore();
}
export const PH = { cx: 540, cy: 790, s: .4 };
export function phoneFrame(g, t, k) {
  const s = lerp(1, PH.s, k), cx = 540, cy = lerp(960, PH.cy, k);
  const w = W * s, h = H * s, x = cx - w / 2, y = cy - h / 2, pad = 22 * k;
  g.save(); g.globalAlpha = clamp(k * 2);
  // bezel (drawn as a thick ring around the screen)
  g.beginPath(); g.roundRect(x - pad, y - pad * 2.2, w + pad * 2, h + pad * 4.4, 60 * k); g.roundRect(x, y, w, h, 34 * k); g.fillStyle = C.ink; g.fill('evenodd');
  g.fillStyle = '#3A3532'; rrect(g, cx - 50, y - pad * 1.4, 100, 14, 7); g.fill();
  // progress bar like a reel
  g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x + 20, y + h - 18, w - 40, 6); g.fillStyle = C.orange; g.fillRect(x + 20, y + h - 18, (w - 40) * clamp(t / 42.3), 6);
  g.restore();
  if (k < .3) return;
  const tvk = T('viktor', 3), wink = t > tvk + .05;
  const pop = prog(t, T('even') + .35, T('even') + .75, ease.outBack);
  guy(g, { kind: 'viktor', x: 250, y: 1585 + (1 - pop) * 500, s: .78, shirt: C.blue, tilt: Math.sin(t * 2) * .04 + (wink ? -.08 : 0),
    hlx: 30, hly: 95, hrx: lerp(30, 150, pop), hry: lerp(95, -330, pop), eyes: 'dot', wink, blink: blinkAt(t, 12), mouth: 0, smile: wink ? 1 : .8, lookX: wink ? 0 : .6, lookY: wink ? 0 : -.6, sq: wobble(t, tvk, .08, 2.6, 6) }, 25);
  guy(g, { kind: 'elang', x: 830, y: 1585 + (1 - pop) * 500, s: .78, tilt: Math.sin(t * 2.3) * .04, hlx: -60, hly: -60, hrx: 60, hry: -60,
    eyes: 'wide', blink: blinkAt(t, 13), mouth: talk(t), smile: .5, lookX: -.6, lookY: -.6, sq: 0 }, 27);
}
