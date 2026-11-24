// "Selembar kertas": the VP resignation told as one camera take around a toon-3D ring diorama.
// Every beat is anchored to a spoken word with T()/E(); the 3D set lives in set.js, the 2D cast in cast2d.js.
import { W, H, C, clamp, lerp, ease, prog, hash, captions, startToon, rrect } from '../../vendor/toon.js';
import { twos, easeX, arrive, leave, burst, speedLines, paperFinish, slamLine } from '../../vendor/toon2.js';
import { initWorld, CAM, renderWorld, proj } from './world3d.js';
import { anchors } from './anchors.js';
import { camAt, placeCam, shake } from './camera.js';
import { cast } from './acting.js';
import { SET, ANG, polar, buildSet, updateVoters, updateSeats } from './set.js';
import { chip, truthTag, stamp, crowd } from './cast2d.js';

// the drawn document (an illustration: the real certificate is not reproduced)
function drawDoc(g, w, h) {
  g.fillStyle = '#FBF7EE'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1B1817'; g.lineWidth = 10; g.strokeRect(26, 26, w - 52, h - 52);
  g.fillStyle = '#1B1817'; g.textAlign = 'center';
  g.font = `900 64px ${C.font}`; g.fillText('SURAT KETERANGAN', w / 2, 170);
  g.font = `800 50px ${C.font}`; g.fillText('PENYETARAAN IJAZAH', w / 2, 240);
  g.font = `700 30px ${C.font}`; g.fillStyle = '#5C564F'; g.fillText('No. 9149/D.D1/KS/2019', w / 2, 300);
  g.fillStyle = '#C9C1B3'; for (let i = 0; i < 9; i++) g.fillRect(110, 380 + i * 62, (w - 220) * (i % 3 === 2 ? .62 : 1), 18);
  g.strokeStyle = '#1B1817'; g.lineWidth = 6; g.beginPath(); g.arc(w * .72, h - 230, 88, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(140, h - 210); g.bezierCurveTo(200, h - 300, 260, h - 120, 330, h - 230); g.bezierCurveTo(360, h - 270, 380, h - 180, 420, h - 220); g.stroke();
}

// world update (pure in t)
function updateWorld(t) {
  const a = anchors();
  // gate arm lifts on "buka" (antic dip, then a heavy lift that settles)
  const lift = prog(t, a.buka, a.buka + .55, easeX.land), dip = t > a.buka - .14 && t < a.buka ? -.06 * prog(t, a.buka - .14, a.buka) : 0;
  SET.gate.arm.rotation.z = lift * 1.35 + dip;
  // HMP door swings half open on "pintu"
  SET.hmpDoor.rotation.y = -prog(t, a.pintu2, a.pintu2 + .5, easeX.land) * 1.1;
  // the hero paper: falls over the hall, hangs in front of the schools, then leaves upward (accelerating)
  const pp = SET.paper, sch = polar(ANG.schools, 41.5, 3.4);
  if (t < a.cerita - .3 || t > a.y2023 + .5) pp.visible = false;
  else {
    pp.visible = true;
    const f = prog(t, a.cerita - .3, a.surat, ease.out), out = leave(t, a.y2023 - .45, .5);
    const fz = ease.in(prog(t, a.cerita - .3, a.surat, ease.lin)), y = lerp(17, sch[1], f) + out * 16, x = lerp(1.5, sch[0], f) + Math.sin(t * 3.1) * (1 - f) * 2.5, z = lerp(-9, sch[2], fz);   // stays near the lens, then drops away
    pp.position.set(x, y, z); pp.lookAt(CAM.position); pp.rotateZ(Math.sin(t * 2.3) * (1 - f) * .6 + (1 - f) * .4); pp.rotateX(-(1 - f) * .9);
    pp.userData.bend((1 - f) * .25, (1 - f) * .9 + .06, t * 7); pp.scale.setScalar(1.25);
  }
  // twin paper pinned in front of the MA
  const pm = SET.paperMA, mp = polar(ANG.ma, 41, 3.2);
  pm.visible = t > a.oktober - .6 && t < a.lalu + .4;
  if (pm.visible) { const k = easeX.land(prog(t, a.oktober - .6, a.oktober + .2, ease.lin)); pm.position.set(mp[0], mp[1] + (1 - k) * 7, mp[2]); pm.lookAt(CAM.position); pm.rotateZ((1 - k) * .5 + .03); pm.userData.bend(0, .04, 0); }
  // voters: rise in a wave on "96 juta" (2nd), sink on "Penggantinya"; seats light on "732"
  updateVoters(prog(t, a.juta2 - .1, a.lama + .3, ease.out), prog(t, a.pengganti, a.n732, ease.in));
  updateSeats(prog(t, a.n732 - .1, a.n732 + .9, ease.out));
}

// 2D overlays tied to the world
function worldMarks(g, t) {
  const a = anchors(), tc = twos(t);
  // spotlight on the empty chair (hall shots)
  const spot = prog(t, a.tanpa - .2, a.tanpa + .3) * (1 - prog(t, a.juta2, a.juta2 + .6));
  if (spot > .01) { const [x, y] = proj(0, 3.5, -1); const r = g.createRadialGradient(x, y, 40, x, y, 520); r.addColorStop(0, `rgba(255,236,190,${.35 * spot})`); r.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = r; g.fillRect(0, 0, W, H);
    const v = g.createRadialGradient(x, y, 300, x, y, 1100); v.addColorStop(0, 'rgba(27,24,23,0)'); v.addColorStop(1, `rgba(27,24,23,${.35 * spot})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }
  // schools: country chips
  if (t > a.sekolah - .3 && t < a.y2023 + .2) {
    const s1 = proj(...polar(-7.5, 50, 9.5)), s2 = proj(...polar(7.5, 50, 9.5));
    chip(g, t, a.luar - .25, a.y2023 - .2, s1[0], s1[1], 'SINGAPURA', { size: 46 });
    chip(g, t, a.luar + .05, a.y2023 - .2, s2[0], s2[1], 'SYDNEY', { size: 46 });
  }
  // "= SMA" mark on the paper
  if (t > a.setara - .1 && t < a.y2023 + .1) { const [x, y] = proj(...polar(ANG.schools, 41.5, 2.6)); stamp(g, t, a.sma - .05, x + 60, y + 10, '= SMA', { col: C.orange, size: 74, rot: -.08, a: 1 - prog(t, a.y2023 - .3, a.y2023) }); }
  // gate signs
  if (t > a.y2023 && t < a.menang) {
    const gp = polar(ANG.mk - 3, 41, 3.4), [x, y] = proj(...gp);
    chip(g, t, a.di40 - .12, a.sembilan - .2, x, y - 40, 'MIN. 40 TAHUN', { size: 46, fill: C.white });
    chip(g, t, a.asal - .1, a.sembilan - .2, x + 10, y + 50, 'ATAU PERNAH DIPILIH RAKYAT', { size: 40, fill: C.gold });
  }
  // ballots shoot out of the box on "Menang"
  if (t > a.menang && t < a.tapi + .3) {
    const [bx, by, , ppu] = proj(...polar(ANG.ballot, 44, 3.4));
    for (let i = 0; i < 18; i++) { const d = tc - a.menang - (i % 6) * .05; if (d < 0) continue; const k = 1 - Math.pow(1 - clamp(d / 1.1), 3);
      const ang = -Math.PI / 2 + (hash(i) - .5) * 2.2, r = k * (260 + hash(i + 3) * 300) * ppu / 60;
      g.save(); g.translate(bx + Math.cos(ang) * r, by + Math.sin(ang) * r + k * k * 140); g.rotate(hash(i + 7) * 6 + d * 4); g.globalAlpha = 1 - clamp((d - .9) / .5);
      rrect(g, -26, -18, 52, 36, 4); g.fillStyle = C.white; g.fill(); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke(); g.restore(); }
  }
  // MA stamp on the pinned paper + quote strip
  if (t > a.batal - .2 && t < a.lalu + .3) {
    const [x, y] = proj(...polar(ANG.ma, 41, 3.2)), out = leave(t, a.lalu - .25, .3);
    g.save(); g.globalAlpha = 1 - out; stamp(g, t, a.batal, x, y, 'DIBATALKAN', { size: 78, rot: -.18 }); g.restore();
    burst(g, t, a.batal + .13, x, y, 340, C.red, 16);
  }
  // DPR: 120 raised hands, counter
  if (t > a.lalu - .2 && t < a.nov + .3) {
    const [x, y] = proj(...polar(ANG.dpr + 1, 41, 0)), up = Math.round(120 * prog(tc, a.n120 - .1, a.teken + .5, ease.inOut));
    const fade = 1 - leave(t, a.pintu2 - .35, .3);
    g.save(); g.globalAlpha = fade; crowd(g, W / 2, 1010, 12, 10, 62, up, 1.2); g.restore();
  }
}

// screen overlay: headlines, counters, labels, captions
function counter(g, t, t0, t1, from, to, y, size, suffix = '', o = {}) {
  if (t < t0 - .05 || (o.end != null && t > o.end + .3)) return;
  const k = prog(t, t0, t1, ease.out), v = Math.round(lerp(from, to, k)), txt = v.toLocaleString('id-ID') + suffix;
  const A = arrive(t, t0 - .05, .26, 2.2), out = o.end != null ? leave(t, o.end, .25) : 0;
  g.save(); g.translate(W / 2, y - out * 120); g.scale(A.s * (1 - out * .3), A.s * (1 - out * .3)); g.globalAlpha = A.a * (1 - out);
  g.font = `900 ${size}px ${C.font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.fillStyle = C.ink; g.fillText(txt, 8, 10); g.lineWidth = 16; g.strokeStyle = C.ink; g.strokeText(txt, 0, 0); g.fillStyle = o.col ?? C.white; g.fillText(txt, 0, 0);
  if (o.sub) { g.font = `800 ${Math.round(size * .36)}px ${C.font}`; g.lineWidth = 10; g.strokeText(o.sub, 0, size * .78); g.fillStyle = C.white; g.fillText(o.sub, 0, size * .78); }
  g.restore();
}
function overlay(g, t) {
  const a = anchors(), sh = shake(t);
  placeCam(t);                       // characters are drawn once at the frame time: crisp on top of the motion-blurred world
  g.save(); g.translate(sh.x, sh.y); cast(g, t); g.restore();
  g.save(); g.translate(sh.x, sh.y);
  const HY = 330;
  slamLine(g, t, a.wapres, [['WAPRES', C.white], ['MUNDUR', C.orange]], HY, 132, { ts: [a.wapres - .04, a.mundur - .04], t1: a.terakhir - .15 });
  slamLine(g, t, a.terakhir, [['TERAKHIR:', C.white], ['1956', C.orange]], HY, 128, { ts: [a.terakhir - .04, a.y1956 - .04], t1: a.kertas - .2 });
  slamLine(g, t, a.kertas, [['SELEMBAR', C.white], ['KERTAS', C.orange]], HY, 124, { ts: [a.kertas - .3, a.kertas - .04], t1: a.surat + 1.1 });
  slamLine(g, t, a.y2023, [['2023', C.orange]], HY, 150, { ts: [a.y2023 - .04], t1: a.mk + 1 });
  slamLine(g, t, a.di40, [['DI', C.white], ['BAWAH', C.white], ['40', C.orange]], HY, 132, { ts: [a.di40 - .25, a.di40 - .12, a.di40 - .04], t1: a.sembilan - .3 });
  slamLine(g, t, a.sembilan, [['+9', C.orange], ['HARI', C.white]], HY, 132, { ts: [a.sembilan - .04, a.sembilan + .2], t1: a.u36 - .2 });
  slamLine(g, t, a.u36, [['UMUR', C.white], ['36', C.orange]], HY, 140, { ts: [a.u36 - .3, a.u36 - .04], t1: a.menang - .25 });
  counter(g, t, a.juta1 - .05, a.suara1 + .2, 0, 96214691, HY, 112, '', { end: a.tapi - .2, sub: 'SUARA · PEMILU 2024' });
  slamLine(g, t, a.oktober, [['30', C.orange], ['OKT', C.white], ['2026', C.white]], HY, 128, { ts: [a.oktober - .04, a.oktober + .12, a.oktober + .26], t1: a.kata - .2 });
  if (t > a.kata - .1 && t < a.lalu + .1) quoteStrip(g, t, a.kata - .05, a.lalu - .25);
  counter(g, t, a.n120 - .05, a.teken + .5, 0, 120, HY, 150, '', { end: a.pintu2 - .35, sub: 'ANGGOTA DPR · 8 FRAKSI' });
  slamLine(g, t, a.pintu2, [['HAK', C.white], ['MENYATAKAN', C.white], ['PENDAPAT', C.orange]], HY, 96, { ts: [a.pintu2 - .2, a.pintu2 - .1, a.pintu2], t1: a.nov - .3 });
  slamLine(g, t, a.nov, [['12', C.orange], ['NOV', C.white], ['2026', C.white]], HY, 128, { ts: [a.nov - .04, a.nov + .12, a.nov + .26], t1: a.tanpa - .2 });
  slamLine(g, t, a.tanpa, [['TANPA', C.white], ['ALASAN', C.orange]], HY, 124, { ts: [a.tanpa - .04, a.tanpa + .2], t1: a.sekarang - .15 });
  slamLine(g, t, a.dua, [['2', C.orange], ['NAMA', C.white]], HY, 132, { ts: [a.dua - .04, a.dua + .14], t1: a.mpr - .15 });
  slamLine(g, t, a.mpr, [['MPR', C.white], ['PILIH', C.white], ['1', C.orange]], HY, 132, { ts: [a.mpr - .04, a.pilih - .04, a.satu - .04], t1: a.juta2 - .15 });
  counter(g, t, a.juta2 - .05, a.lama, 0, 96214691, HY, 112, '', { end: a.pengganti - .2, sub: 'SUARA MEMILIH WAPRES LAMA' });
  counter(g, t, a.n732 - .05, a.n732 + .7, 0, 732, HY, 170, '', { end: a.lo - .2, col: C.orange, sub: 'ANGGOTA MPR' });
  slamLine(g, t, a.termasuk, [['NGGAK', C.white], ['TERMASUK', C.orange]], HY, 120, { ts: [a.termasuk - .2, a.termasuk - .04] });
  g.restore();
  // truth labels: drawn documents and stand-in characters
  truthTag(g, 'ILUSTRASI', 1, 120);
  captions(g, t, { y: 1700, size: 66 });
  paperFinish(g, t, .06);
}
function quoteStrip(g, t, t0, t1) { // paraphrase of the MA's reasoning, labelled with the case number
  const k = prog(t, t0, t0 + .25, easeX.land), out = leave(t, t1, .25); if (k <= .002) return;
  g.save(); g.translate(W / 2 + (1 - k) * 260, 360 - out * 60); g.globalAlpha = Math.min(1, k * 3) * (1 - out); g.rotate(-.015);
  rrect(g, -440 + 8, -84 + 9, 880, 168, 22); g.fillStyle = C.ink; g.fill();
  rrect(g, -440, -84, 880, 168, 22); g.fillStyle = C.white; g.fill(); g.lineWidth = 7; g.strokeStyle = C.ink; g.stroke();
  g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `900 50px ${C.font}`; g.fillText('Bukti ijazah luar negeri:', 0, -26); g.fillStyle = C.red; g.fillText('tidak ditemukan', 0, 30);
  g.font = `800 26px ${C.font}`; g.fillStyle = '#5C564F'; g.fillText('PUTUSAN MA 742 K/TUN/2026', 0, 112);
  g.restore();
}

// frame
function sky(g) { const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#F3ECDD'); s.addColorStop(1, '#F8F3E8'); g.fillStyle = s; g.fillRect(0, 0, W, H); }
function draw(g, t) {
  sky(g); placeCam(t); updateWorld(t);
  const sh = shake(t);
  g.save(); g.translate(sh.x, sh.y); renderWorld(g, t); worldMarks(g, t); g.restore();
  const c0 = camAt(t - 1 / 60), c1 = camAt(t + 1 / 60), dx = Math.hypot(c1.l[0] - c0.l[0], c1.l[2] - c0.l[2]) * 30;
  speedLines(g, t, dx * 90, 0);
}
startToon({ build: async () => { initWorld(); buildSet(drawDoc); }, draw, overlay, blurSamples: 2, shutter: .5 });
