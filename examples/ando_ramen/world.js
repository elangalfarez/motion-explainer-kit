// world.js — props for "Ando" (one continuous paper-cut ukiyo-e world)
import * as THREE from '../../vendor/three.module.js';
import { PAL, PPU, cut, shape, rr, poly, ell, bokashi, text, rnd, washi } from './paper.js';

export function hills(wu, hu, col, seed = 1, o = {}) { // rolling diorama band with bokashi
  return cut(wu, hu, (g, w, h) => {
    const R = rnd(seed), pts = []; for (let i = 0; i <= 24; i++) pts.push([i / 24 * w, h * (.18 + .3 * (.5 + .5 * Math.sin(i * .7 + seed)) * (.6 + R() * .4))]);
    const path = g2 => { g2.moveTo(0, h); pts.forEach(([x, y], i) => i ? g2.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], (x + pts[i - 1][0]) / 2, (y + pts[i - 1][1]) / 2) : g2.lineTo(x, y)); g2.lineTo(w, pts.at(-1)[1]); g2.lineTo(w, h); g2.closePath(); };
    g.save(); g.beginPath(); path(g); g.clip(); bokashi(g, 0, 0, w, h, o.top || col, o.bot || col, seed); g.restore();
    shape(g, path, null, o.lw ?? 5);
    if (o.rows) { g.strokeStyle = 'rgba(30,25,15,.18)'; g.lineWidth = 3; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(0, h * (.45 + k * .1)); g.lineTo(w, h * (.42 + k * .1)); g.stroke(); } }
  }, { seed, ...o });
}
export function mountain(wu, hu, seed = 2) { // snow-capped cone, flat blocks
  return cut(wu, hu, (g, w, h) => {
    const p = poly([[0, h], [w * .38, h * .06], [w * .5, 0], [w * .62, h * .06], [w, h]]);
    g.save(); g.beginPath(); p(g); g.clip(); bokashi(g, 0, 0, w, h, PAL.prus, PAL.prusL, seed); g.restore();
    shape(g, p, null, 5);
    shape(g, poly([[w * .3, h * .2], [w * .38, h * .06], [w * .5, 0], [w * .62, h * .06], [w * .7, h * .2], [w * .6, h * .27], [w * .53, h * .2], [w * .46, h * .3], [w * .39, h * .22]]), PAL.white, 4);
  }, { seed });
}
export function pine(hu, seed = 3) {
  return cut(hu * .7, hu, (g, w, h) => {
    const R = rnd(seed); shape(g, poly([[w * .46, h], [w * .5 + (R() - .5) * 20, h * .1], [w * .56, h]]), PAL.woodD, 4);
    for (let i = 0; i < 4; i++) { const y = h * (.12 + i * .2), ww = w * (.42 + i * .14), x = w * .5 + (R() - .5) * w * .2;
      shape(g, g2 => { g2.ellipse(x, y, ww / 2, h * .06, 0, Math.PI, 0); g2.closePath(); }, i % 2 ? PAL.pine : PAL.greenD, 4);
      g.strokeStyle = 'rgba(240,230,200,.35)'; g.lineWidth = 2; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(x + k * ww / 9, y - 4); g.lineTo(x + k * ww / 8, y - h * .045); g.stroke(); } }
  }, { seed });
}
export function mist(wu, hu = .7, seed = 4, a = .85) {
  const m = cut(wu, hu, (g, w, h) => { g.beginPath(); g.roundRect(0, h * .15, w, h * .7, h * .35); g.fillStyle = PAL.white; g.fill();
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.18, 'rgba(0,0,0,0)'); gr.addColorStop(.82, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = gr; g.fillRect(0, 0, w, h); }, { edge: false, seed });
  m.material.opacity = a; return m;
}
export function cloud(wu, seed = 5) {
  return cut(wu, wu * .42, (g, w, h) => { const R = rnd(seed);
    shape(g, g2 => { g2.moveTo(10, h - 10); for (let i = 0; i < 5; i++) { const x = w * (.1 + i * .2), r = w * (.1 + R() * .06); g2.arc(x, h - 12 - r * .5, r, Math.PI, 0); } g2.lineTo(w - 10, h - 10); g2.closePath(); }, PAL.white, 4);
    g.strokeStyle = PAL.prusL; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(w * .2, h - 30 - i * 14); g.lineTo(w * .8, h - 30 - i * 14); g.stroke(); } }, { seed });
}
export function hill(wu, hu, seed = 6, col = PAL.greenD) {
  return cut(wu, hu, (g, w, h) => { const p = g2 => { g2.moveTo(0, h); g2.bezierCurveTo(w * .25, h * .05, w * .75, h * .05, w, h); g2.closePath(); };
    g.save(); g.beginPath(); p(g); g.clip(); bokashi(g, 0, 0, w, h, col, PAL.ochre, seed); g.restore(); shape(g, p, null, 6);
    g.strokeStyle = 'rgba(30,25,15,.25)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { const x = w * (.15 + i * .085); g.beginPath(); g.moveTo(x, h * .45 + Math.abs(i - 4) * 12); g.lineTo(x - 12, h * .45 + Math.abs(i - 4) * 12 - 22); g.stroke(); } }, { seed });
}
export function bowl(wu, hu, o = {}) { // big ramen bowl, side view, with noodles + steam
  return cut(wu, hu, (g, w, h) => {
    const rimY = h * .3;
    if (o.noodles !== false) { // noodle heap above rim
      shape(g, g2 => { g2.ellipse(w / 2, rimY, w * .44, h * .16, 0, Math.PI, 0); g2.closePath(); }, PAL.noodle, 5);
      g.strokeStyle = '#c9a050'; g.lineWidth = 4; for (let i = 0; i < 14; i++) { g.beginPath(); const x0 = w * .1 + i * w * .058; g.moveTo(x0, rimY); for (let k = 1; k <= 6; k++) g.lineTo(x0 + Math.sin(k * 1.7 + i) * 14, rimY - k * h * .022); g.stroke(); }
      shape(g, ell(w * .66, rimY - h * .06, w * .07, h * .05), PAL.white, 4); shape(g, ell(w * .66, rimY - h * .06, w * .03, h * .022), PAL.ochre, 3); // egg
      shape(g, poly([[w * .3, rimY - h * .14], [w * .36, rimY - h * .16], [w * .4, rimY - h * .02], [w * .33, rimY]]), PAL.green, 3); // nori-ish
    }
    const body = g2 => { g2.moveTo(w * .02, rimY); g2.bezierCurveTo(w * .06, h * .95, w * .94, h * .95, w * .98, rimY); g2.closePath(); };
    g.save(); g.beginPath(); body(g); g.clip(); bokashi(g, 0, rimY, w, h - rimY, o.col || PAL.beni, o.col2 || PAL.beniD, 3); 
    g.strokeStyle = PAL.white; g.lineWidth = w * .012; for (let i = 0; i < 9; i++) { const x = w * (.08 + i * .105); g.beginPath(); g.moveTo(x, rimY + h * .1); g.lineTo(x + w * .03, rimY + h * .1); g.lineTo(x + w * .03, rimY + h * .17); g.lineTo(x + w * .06, rimY + h * .17); g.stroke(); } // raimon band
    g.restore(); shape(g, body, null, 6);
    shape(g, rr(w * .02, rimY - h * .02, w * .96, h * .04, 8), PAL.white, 5);
    shape(g, rr(w * .38, h * .86, w * .24, h * .1, 6), o.col2 || PAL.beniD, 5); // foot
  }, { seed: 21, ...o });
}
export function steam(wu, hu, seed = 7) {
  const m = cut(wu, hu, (g, w, h) => { g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const x = w * (.25 + i * .25); g.strokeStyle = PAL.white; g.lineWidth = 16; g.beginPath(); g.moveTo(x, h);
    for (let k = 1; k <= 8; k++) g.quadraticCurveTo(x + (k % 2 ? 1 : -1) * w * .12, h - (k - .5) * h / 8, x, h - k * h / 8); g.stroke(); } }, { seed, shadow: false, edgeW: 4, edgeCol: PAL.sumiL });
  m.material.opacity = .9; return m;
}
export function prison(wu, hu) { // wall with barred window opening (bars only; figure sits behind)
  return cut(wu, hu, (g, w, h) => {
    const ox = w * .28, oy = h * .22, ow = w * .44, oh = h * .5;
    shape(g, g2 => { g2.rect(0, 0, w, h); g2.rect(ox + ow, oy, -ow, oh); }, PAL.greyD, 6, { rule: 'evenodd' });
    g.strokeStyle = 'rgba(20,16,12,.35)'; g.lineWidth = 3; for (let y = 30; y < h; y += 46) for (let x = (y / 46 % 2) * 40; x < w; x += 80) { if (x > ox - 70 && x < ox + ow && y > oy && y < oy + oh) continue; g.strokeRect(x, y, 80, 46); }
    for (let i = 0; i <= 5; i++) shape(g, rr(ox + i * ow / 5 - 9, oy - 6, 18, oh + 12, 4), PAL.sumi, 3);
    shape(g, rr(ox - 10, oy + oh * .48, ow + 20, 16, 4), PAL.sumi, 3);
  }, { seed: 31 });
}
export function building(wu, hu) { // two-storey shop-house, credit union
  return cut(wu, hu, (g, w, h) => {
    shape(g, rr(w * .06, h * .3, w * .88, h * .7, 2), PAL.plaster, 6);
    shape(g, poly([[0, h * .34], [w * .1, h * .14], [w * .9, h * .14], [w, h * .34]]), PAL.sumiL, 6);
    shape(g, poly([[w * .1, h * .14], [w * .2, 0], [w * .8, 0], [w * .9, h * .14]]), PAL.sumi, 5);
    for (let i = 0; i < 4; i++) { shape(g, rr(w * (.14 + i * .19), h * .4, w * .13, h * .16, 3), PAL.prusD, 4); g.strokeStyle = PAL.plaster; g.lineWidth = 3; g.beginPath(); g.moveTo(w * (.205 + i * .19), h * .4); g.lineTo(w * (.205 + i * .19), h * .56); g.stroke(); }
    shape(g, rr(w * .38, h * .66, w * .24, h * .34, 2), PAL.woodD, 5);
    shape(g, rr(w * .2, h * .6, w * .6, h * .1, 3), PAL.white, 4);
    text(g, '信用組合', w * .5, h * .652, h * .07, PAL.sumi);
    for (const x of [.14, .8]) { shape(g, rr(w * x, h * .66, w * .06, h * .34, 2), PAL.beni, 4); }
  }, { seed: 41 });
}
export function house(wu, hu, lit = true) {
  return cut(wu, hu, (g, w, h) => {
    shape(g, rr(w * .12, h * .42, w * .76, h * .58, 2), PAL.woodL, 5);
    shape(g, poly([[0, h * .48], [w * .5, h * .06], [w, h * .48]]), PAL.ochre, 6);
    g.strokeStyle = 'rgba(60,40,15,.35)'; g.lineWidth = 3; for (let i = 1; i < 7; i++) { g.beginPath(); g.moveTo(w * .5, h * .08); g.lineTo(w * i / 7, h * .47); g.stroke(); }
    shape(g, rr(w * .3, h * .56, w * .22, h * .22, 3), lit ? PAL.gold : PAL.prusD, 4);
    g.strokeStyle = PAL.woodD; g.lineWidth = 3; g.beginPath(); g.moveTo(w * .41, h * .56); g.lineTo(w * .41, h * .78); g.moveTo(w * .3, h * .67); g.lineTo(w * .52, h * .67); g.stroke();
    shape(g, rr(w * .6, h * .62, w * .18, h * .38, 2), PAL.woodD, 4);
  }, { seed: 51 });
}
export function shed(wu, hu) { // backyard work shed with lit window + worker silhouette
  return cut(wu, hu, (g, w, h) => {
    shape(g, poly([[w * .08, h], [w * .08, h * .35], [w * .92, h * .42], [w * .92, h]]), PAL.wood, 6);
    g.strokeStyle = 'rgba(40,25,10,.4)'; g.lineWidth = 4; for (let x = w * .14; x < w * .9; x += w * .07) { g.beginPath(); g.moveTo(x, h * .38); g.lineTo(x, h); g.stroke(); }
    shape(g, poly([[0, h * .38], [w * .5, h * .12], [w, h * .45], [w * .96, h * .5], [w * .5, h * .2], [w * .04, h * .43]]), PAL.sumiL, 5);
    shape(g, poly([[w * .02, h * .4], [w * .5, h * .14], [w * .98, h * .47], [w * .5, h * .27]]), PAL.greyD, 5);
    shape(g, rr(w * .3, h * .5, w * .4, h * .26, 4), PAL.gold, 5);
    // silhouette at work (head, shoulders, raised arm)
    g.fillStyle = PAL.sumi; g.beginPath(); g.ellipse(w * .44, h * .6, w * .045, w * .05, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(w * .36, h * .76); g.quadraticCurveTo(w * .44, h * .62, w * .52, h * .76); g.fill();
    g.lineWidth = 12; g.strokeStyle = PAL.sumi; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * .49, h * .68); g.lineTo(w * .58, h * .63); g.stroke();
    g.fillStyle = PAL.beni; g.beginPath(); g.ellipse(w * .62, h * .7, w * .05, w * .02, 0, 0, 7); g.fill(); g.strokeStyle = PAL.sumi; g.lineWidth = 3; g.stroke(); // pot
    g.lineWidth = 5; g.strokeStyle = PAL.sumi; g.beginPath(); g.moveTo(w * .5, h * .5); g.lineTo(w * .5, h * .76); g.moveTo(w * .3, h * .63); g.lineTo(w * .7, h * .63); g.stroke();
    shape(g, rr(w * .74, h * .6, w * .12, h * .4, 2), PAL.woodD, 4);
  }, { seed: 61 });
}
export function stall(wu, hu) { // black-market ramen stall with noren + red lantern
  return cut(wu, hu, (g, w, h) => {
    shape(g, rr(w * .08, h * .25, w * .06, h * .75, 2), PAL.woodD, 4); shape(g, rr(w * .86, h * .25, w * .06, h * .75, 2), PAL.woodD, 4);
    shape(g, poly([[0, h * .28], [w * .06, h * .1], [w * .94, h * .1], [w, h * .28]]), PAL.sumiL, 5);
    for (let i = 0; i < 5; i++) { shape(g, rr(w * (.14 + i * .145), h * .28, w * .13, h * .22, 2), PAL.prus, 4); }
    text(g, 'ラーメン', w * .5, h * .39, h * .085, PAL.white);
    shape(g, rr(w * .06, h * .7, w * .88, h * .08, 3), PAL.wood, 5); shape(g, rr(w * .1, h * .78, w * .8, h * .22, 2), PAL.woodD, 5);
    // lantern
    g.strokeStyle = PAL.sumi; g.lineWidth = 3; g.beginPath(); g.moveTo(w * .9, h * .28); g.lineTo(w * .9, h * .36); g.stroke();
    shape(g, ell(w * .9, h * .46, w * .075, h * .1), PAL.beni, 5); text(g, '拉', w * .9, h * .46, h * .07, PAL.white);
    shape(g, ell(w * .32, h * .67, w * .07, h * .035), PAL.beniD, 3); shape(g, ell(w * .6, h * .67, w * .07, h * .035), PAL.beniD, 3);
  }, { seed: 71 });
}
export function kitchen(wu, hu) { // back wall + hearth
  return cut(wu, hu, (g, w, h) => {
    shape(g, rr(0, 0, w, h * .72, 2), PAL.plaster, 5);
    g.strokeStyle = 'rgba(80,60,30,.3)'; g.lineWidth = 6; for (const x of [.25, .5, .75]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h * .72); g.stroke(); }
    shape(g, rr(w * .1, h * .12, w * .2, h * .2, 3), PAL.prusD, 4); // window
    shape(g, rr(w * .5, h * .55, w * .45, h * .45, 4), PAL.greyD, 6); // hearth
    shape(g, ell(w * .725, h * .78, w * .08, h * .07), PAL.sumi, 4); g.fillStyle = PAL.beni; g.beginPath(); g.ellipse(w * .725, h * .8, w * .05, h * .04, 0, 0, 7); g.fill();
    shape(g, rr(0, h * .72, w, h * .28, 2), PAL.woodL, 5);
  }, { seed: 81 });
}
export function wok(wu, o = {}) { // pan with oil + tempura (frontal)
  return cut(wu, wu * .45, (g, w, h) => {
    shape(g, ell(w * .5, h * .3, w * .46, h * .14), PAL.oil, 5);
    for (let i = 0; i < 3; i++) shape(g, ell(w * (.32 + i * .17), h * .27, w * .07, h * .05), PAL.ochreL, 3);
    shape(g, g2 => { g2.moveTo(w * .04, h * .3); g2.bezierCurveTo(w * .1, h * .95, w * .9, h * .95, w * .96, h * .3); g2.ellipse(w * .5, h * .3, w * .46, h * .14, 0, 0, Math.PI); g2.closePath(); }, PAL.sumi, 5);
    shape(g, rr(w * .9, h * .18, w * .1, h * .06, 3), PAL.woodD, 3);
  }, { seed: 91, ...o });
}
export function noodleBlock(wu) {
  return cut(wu, wu * .7, (g, w, h) => {
    shape(g, rr(6, 6, w - 12, h - 12, 26), PAL.noodle, 6);
    g.save(); g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 26); g.clip(); g.strokeStyle = '#c69a45'; g.lineWidth = 6;
    for (let y = 20; y < h; y += 18) { g.beginPath(); for (let x = 0; x <= w; x += 10) g.lineTo(x, y + Math.sin(x * .09 + y) * 7); g.stroke(); } g.restore();
  }, { seed: 101 });
}
export function packet(wu, seed = 1) { // generic early ramen packet (no real brand)
  return cut(wu, wu * 1.3, (g, w, h) => {
    shape(g, rr(6, 6, w - 12, h - 12, 10), PAL.white, 5);
    shape(g, rr(6, 6, w - 12, h * .24, 10), PAL.beni, 0); shape(g, rr(6, h - h * .2 - 6, w - 12, h * .2, 10), PAL.ochre, 0);
    text(g, 'RAMEN', w / 2, h * .135, w * .2, PAL.white, { w: 800 });
    shape(g, ell(w / 2, h * .54, w * .32, h * .18), PAL.noodle, 4);
    g.strokeStyle = '#c69a45'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); for (let x = -w * .26; x <= w * .26; x += 6) g.lineTo(w / 2 + x, h * (.46 + i * .03) + Math.sin(x * .2 + i) * 4); g.stroke(); }
    text(g, '即席', w / 2, h * .885, w * .16, PAL.sumi);
    g.strokeStyle = PAL.sumi; g.lineWidth = 5; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 10); g.stroke();
  }, { seed });
}
export function coin(wu, seed) {
  return cut(wu, wu, (g, w, h) => { shape(g, ell(w / 2, h / 2, w * .45, h * .45), PAL.gold, 5); shape(g, rr(w * .4, h * .4, w * .2, h * .2, 2), PAL.paper, 3); }, { seed, anchor: 'center', shadow: false, edgeW: 4 });
}
export function drop(wu, seed) {
  return cut(wu, wu * 1.4, (g, w, h) => shape(g, g2 => { g2.moveTo(w / 2, 4); g2.bezierCurveTo(w * .95, h * .55, w * .85, h - 4, w / 2, h - 4); g2.bezierCurveTo(w * .15, h - 4, w * .05, h * .55, w / 2, 4); }, PAL.prusL, 4), { seed, anchor: 'center', shadow: false, edgeW: 4 });
}
export function kettle(wu) {
  return cut(wu, wu * .8, (g, w, h) => {
    shape(g, g2 => { g2.ellipse(w * .5, h * .6, w * .3, h * .32, 0, 0, 7); }, PAL.greyD, 5);
    shape(g, poly([[w * .22, h * .55], [w * .02, h * .3], [w * .06, h * .26], [w * .26, h * .45]]), PAL.greyD, 4);
    g.lineWidth = 8; g.strokeStyle = PAL.sumi; g.beginPath(); g.arc(w * .5, h * .4, w * .24, Math.PI * 1.1, -Math.PI * .1); g.stroke();
    shape(g, ell(w * .5, h * .3, w * .06, h * .04), PAL.sumi, 2);
  }, { seed: 111, anchor: 'center' });
}
export function islands(wu) { // stylised archipelago on a sea sheet (lies flat)
  return cut(wu, wu * .45, (g, w, h) => {
    shape(g, rr(0, 0, w, h, 30), PAL.prusL, 5);
    g.strokeStyle = 'rgba(240,235,220,.5)'; g.lineWidth = 3; for (let y = 20; y < h; y += 22) { g.beginPath(); for (let x = 10; x < w - 10; x += 12) g.lineTo(x, y + Math.sin(x * .05 + y) * 4); g.stroke(); }
    const isl = (pts) => shape(g, poly(pts.map(([x, y]) => [x * w, y * h])), PAL.green, 4);
    isl([[.05, .18], [.12, .2], [.25, .5], [.3, .66], [.26, .68], [.15, .45]]);            // long NW island
    isl([[.3, .74], [.48, .76], [.52, .82], [.34, .82]]);                                    // long S island
    isl([[.36, .2], [.48, .14], [.55, .3], [.5, .55], [.4, .58], [.34, .4]]);              // big round island
    isl([[.58, .3], [.64, .28], [.62, .45], [.68, .5], [.6, .55], [.58, .66], [.56, .5]]); // K-shaped island
    isl([[.76, .38], [.9, .36], [.98, .5], [.95, .66], [.8, .6]]);                          // E island
    for (let i = 0; i < 6; i++) shape(g, ell(w * (.54 + i * .04), h * .83, w * .014, h * .02), PAL.green, 3);
  }, { seed: 121, anchor: 'center' });
}
export function bars(wu, hu) { // standalone bars (for a hook foreshadow)
  return cut(wu, hu, (g, w, h) => { for (let i = 0; i < 7; i++) shape(g, rr(i * w / 6.2, 0, 18, h, 4), PAL.sumi, 3); shape(g, rr(0, h * .12, w, 16, 3), PAL.sumi, 3); }, { seed: 131 });
}
export function sun(wu, col = PAL.beni) {
  return cut(wu, wu, (g, w, h) => { g.beginPath(); g.arc(w / 2, h / 2, w * .48, 0, 7); g.fillStyle = col; g.fill(); }, { seed: 141, anchor: 'center', edge: false, fog: false });
}
export function ground(wu, hu) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const g = c.getContext('2d');
  g.fillStyle = PAL.paperD; g.fillRect(0, 0, 1024, 1024); g.globalCompositeOperation = 'multiply'; g.fillStyle = g.createPattern(washi(), 'repeat'); g.fillRect(0, 0, 1024, 1024);
  g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(90,70,40,.12)'; g.lineWidth = 3; for (let y = 0; y < 1024; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y + 8); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(wu / 12, hu / 12); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(wu, hu), new THREE.MeshBasicMaterial({ map: t, fog: true })); m.rotation.x = -Math.PI / 2; return m;
}
