// ============================================================
//  vfx_core.js — reusable Canvas2D VFX primitives (from Scarlet Sheath v3,
//  approved by elang 2026-11-19). Pure functions of t: same t -> same frame.
//  Needs <canvas id="c" width=1920 height=1080>. Globals: W,H,C,X.
//  Each scene defines render2(t) (the frame) and HITS (shake events).
// ============================================================
const W=1920,H=1080, C=document.getElementById('c'), X=C.getContext('2d');
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const eOut=t=>1-Math.pow(1-t,3), eIn=t=>t*t*t, eIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const eBack=t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
const eExpo=t=>t>=1?1:1-Math.pow(2,-10*t);
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function noise1(x){const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return lerp(hash(i),hash(i+1),u)*2-1}

// ---------- colours ----------
const PAPER='#ecebe6', INK='#141014', RED='#c8102e', GOLD='#d9a441';

// ---------- offscreen helpers ----------
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
const bloomC=mk(480,270), bloomX=bloomC.getContext('2d');
const tmpC=mk(W,H), tmpX=tmpC.getContext('2d');
// dot-grid paper pattern
const gridPat=(()=>{const c=mk(14,14),x=c.getContext('2d');x.fillStyle='rgba(0,0,0,.06)';x.beginPath();x.arc(7,7,1.1,0,TAU);x.fill();return X.createPattern(c,'repeat')})();
// dark halftone pattern
function dotPat(step,r,col){const c=mk(step,step),x=c.getContext('2d');x.fillStyle=col;x.beginPath();x.arc(step/2,step/2,r,0,TAU);x.fill();return X.createPattern(c,'repeat')}
const darkDots=dotPat(8,1.6,'rgba(255,90,40,.10)');
const redDots=dotPat(7,2.3,'rgba(255,120,80,.45)');
const blackDots=dotPat(9,3.2,'rgba(20,10,10,.9)');

// ---------- glow stroke: layered additive passes ----------
function glow(drawPath,core,mid,outer,w,alpha=1){
  X.save();X.globalCompositeOperation='lighter';X.lineCap='round';X.lineJoin='round';
  const passes=[[w*7,outer,.10],[w*3.5,outer,.22],[w*1.8,mid,.55],[w,core,1]];
  for(const[lw,c,a]of passes){X.globalAlpha=a*alpha;X.strokeStyle=c;X.lineWidth=lw;X.beginPath();drawPath();X.stroke()}
  X.restore();
}
function bloom(amount){
  if(amount<=0)return;
  bloomX.globalCompositeOperation='copy';bloomX.filter='blur(5px)';
  bloomX.drawImage(C,0,0,480,270);bloomX.filter='none';
  X.save();X.globalCompositeOperation='lighter';X.globalAlpha=amount;X.imageSmoothingEnabled=true;
  X.drawImage(bloomC,0,0,W,H);X.restore();
}
function vignette(a){const g=X.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*1.05);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${a})`);X.fillStyle=g;X.fillRect(0,0,W,H)}


// tapered brush arc (ink stroke)
function brushArc(cx,cy,r,a0,a1,w,col,alpha=1){
  const n=28;X.save();X.globalAlpha=alpha;X.fillStyle=col;X.beginPath();
  for(let i=0;i<=n;i++){const u=i/n,a=lerp(a0,a1,u),ww=w*Math.sin(Math.PI*Math.pow(u,.7))+.3;X.lineTo(cx+Math.cos(a)*(r+ww/2),cy+Math.sin(a)*(r+ww/2))}
  for(let i=n;i>=0;i--){const u=i/n,a=lerp(a0,a1,u),ww=w*Math.sin(Math.PI*Math.pow(u,.7))+.3;X.lineTo(cx+Math.cos(a)*(r-ww/2),cy+Math.sin(a)*(r-ww/2))}
  X.closePath();X.fill();X.restore();
}
const sm=t=>t*t*(3-2*t);
const eOut5=t=>1-Math.pow(1-t,5), eIn2=t=>t*t;
function kf(t,keys){ // keys: [[t,v...]] -> eased (smoothstep) interpolation per segment
  if(t<=keys[0][0])return keys[0].slice(1);
  for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];
    if(t<=b[0]){const u=sm((t-a[0])/(b[0]-a[0]));return a.slice(1).map((v,k)=>lerp(v,b[k+1],u))}}
  return keys[keys.length-1].slice(1);
}
// catmull-rom through keys (continuous velocity, for flying objects)
function cr(t,keys){
  const n=keys.length;if(t<=keys[0][0])return keys[0].slice(1);if(t>=keys[n-1][0])return keys[n-1].slice(1);
  let i=0;while(t>keys[i+1][0])i++;
  const p0=keys[Math.max(0,i-1)],p1=keys[i],p2=keys[i+1],p3=keys[Math.min(n-1,i+2)];
  const u=(t-p1[0])/(p2[0]-p1[0]),u2=u*u,u3=u2*u;
  return p1.slice(1).map((_,k)=>{const a=p0[k+1],b=p1[k+1],c=p2[k+1],d=p3[k+1];
    return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u2+(-a+3*b-3*c+d)*u3)});
}
// ---------- camera shake (decaying 2D noise) ----------
let HITS=[]; // scene sets HITS=[[t,amp],...]
function shake(t){let x=0,y=0,r=0;for(const[h,a]of HITS){const d=t-h;if(d<0||d>.45)continue;const k=a*Math.exp(-d*11);
  x+=noise1(d*38+h*7)*k;y+=noise1(d*41+h*13+50)*k;r+=noise1(d*30+h)*k*.0006}return[x,y,r]}

// ---------- tapered stroke along a polyline ----------
function taperPoly(pts,w,headBias=.5){ // returns polygon points; width profile peaks at headBias
  const n=pts.length;if(n<2)return null;const L=[],R=[];
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    const s=i/(n-1);const prof=s<headBias?Math.pow(s/headBias,.6):Math.pow((1-s)/(1-headBias),.9);const ww=w*prof*.5+.4;
    L.push([pts[i][0]-dy*ww,pts[i][1]+dx*ww]);R.push([pts[i][0]+dy*ww,pts[i][1]-dx*ww])}
  return L.concat(R.reverse());
}
function fillPoly(P){X.beginPath();P.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.closePath();X.fill()}
// ============================================================
//  GATHERING LINES — strokes rush IN toward a focus point along
//  curved (spiral) paths and accelerate as they arrive.
// ============================================================
const GR=rng(1234);
const gather=[...Array(130)].map((_,i)=>({th:GR()*TAU,tw:(GR()<.7?1:-1),span:.45+GR()*.9,R0:260+Math.pow(GR(),.8)*1200,
  w:3+GR()*8,red:GR()<.4,dly:GR(),per:.5+GR()*.45,rmin:45+GR()*90,thin:GR()<.35,flat:.12+GR()*.3}));
function gatherPath(g,u,fx,fy){
  // log-spiral arm: tightly curved near the focus, opening outward; the whole arm slides IN (gathers)
  const rh=g.rmin+g.R0*Math.pow(1-u,1.6);const L=(rh*.38+90)*(.5+.5*g.span);const k=g.tw*(.35+g.span*.75);
  const pts=[];const N=22;
  for(let i=0;i<=N;i++){const s=i/N;const r=rh+L*s;const a=g.th+k*Math.log(r/rh)+g.tw*u*.5;pts.push([fx+Math.cos(a)*r,fy+Math.sin(a)*r])}
  return pts;
}
const GLC=mk(480,270),GLX=GLC.getContext('2d');let GLQ=[];
function flushGlow(){if(!GLQ.length)return;GLX.setTransform(1,0,0,1,0,0);GLX.clearRect(0,0,480,270);GLX.setTransform(.25,0,0,.25,0,0);GLX.fillStyle='#ff4a12';
  for(const[P,a]of GLQ){GLX.globalAlpha=a;GLX.beginPath();P.forEach((q,i)=>i?GLX.lineTo(q[0],q[1]):GLX.moveTo(q[0],q[1]));GLX.closePath();GLX.fill()}
  GLQ=[];X.save();X.setTransform(1,0,0,1,0,0);X.globalCompositeOperation='lighter';X.globalAlpha=1;X.imageSmoothingQuality='high';X.drawImage(GLC,0,0,W,H);X.restore()}
function gatherLines(t,t0,fx,fy,count,mode,alpha=1,speed=1){
  for(let i=0;i<count;i++){const g=gather[i];const st=t0+g.dly*.3/speed;if(t<st)continue;
    const ph=((t-st)*speed)/g.per+(i%5)*.2*(t0>.5?1:0);const u=ph%1;const cyc=Math.floor(ph);
    const gg=cyc?{...g,th:g.th+cyc*2.399,R0:g.R0*(.75+hash(i+cyc*17)*.5)}:g;
    const fade=Math.min(1,u*5)*(1-sm(seg(u,.8,1)));if(fade<=0)continue;
    const pts=gatherPath(gg,u,fx,fy);
    if(mode==='ink'){const P=taperPoly(pts,g.w*(g.thin?.45:1.2),.3);
      X.globalAlpha=alpha*fade;X.fillStyle=g.red?(i%3?'#e0302a':'#ee6a5c'):INK;fillPoly(P);}
    else {const P=taperPoly(pts,g.w*.5+1.6,.3);
      X.save();X.globalCompositeOperation='lighter';
      GLQ.push([taperPoly(pts,g.w*1.3+5,.3),alpha*fade*.45]);
      X.globalAlpha=alpha*fade;X.fillStyle=mode==='hot'?'#fff2e0':'#ff9a5a';fillPoly(P);
      X.globalAlpha=alpha*fade;X.fillStyle='#fff4dc';fillPoly(taperPoly(pts,g.w*.16+.7,.3));
      X.restore();}
  }
  flushGlow();X.globalAlpha=1;
}
// ---------- lens flare at the tsuba ----------
function flare(x,y,s,t,a=1,streak=0){
  X.save();X.globalCompositeOperation='lighter';X.globalAlpha=a;
  let g=X.createRadialGradient(x,y,0,x,y,s*2.4);g.addColorStop(0,'rgba(255,255,245,1)');g.addColorStop(.12,'rgba(255,236,190,.95)');g.addColorStop(.35,'rgba(255,140,60,.45)');g.addColorStop(1,'rgba(255,60,10,0)');
  X.fillStyle=g;X.fillRect(x-s*2.5,y-s*2.5,s*5,s*5);
  // 4+4 star rays
  for(let i=0;i<8;i++){const ang=i*Math.PI/4+.35+t*.25, l=s*(i%2?1.6:3.2)*(.85+.15*Math.sin(t*23+i));
    X.save();X.translate(x,y);X.rotate(ang);const lg=X.createLinearGradient(0,0,l,0);lg.addColorStop(0,'rgba(255,250,235,.95)');lg.addColorStop(1,'rgba(255,150,60,0)');
    X.fillStyle=lg;X.beginPath();X.moveTo(0,-s*.06);X.lineTo(l,0);X.lineTo(0,s*.06);X.closePath();X.fill();X.restore()}
  if(streak>0){ // anamorphic diagonal streak
    X.save();X.translate(x,y);X.rotate(.62);X.globalAlpha=a*streak;
    for(const[l,w,c]of[[1500,26,'rgba(255,170,90,.35)'],[1300,9,'rgba(255,235,200,.9)'],[900,3,'#fff']]){const lg=X.createLinearGradient(-l,0,l,0);lg.addColorStop(0,'rgba(255,120,40,0)');lg.addColorStop(.5,c);lg.addColorStop(1,'rgba(255,120,40,0)');X.fillStyle=lg;X.beginPath();X.moveTo(-l,0);X.lineTo(0,-w);X.lineTo(l,0);X.lineTo(0,w);X.closePath();X.fill()}
    X.rotate(-1.2);X.globalAlpha=a*streak*.6;const lg=X.createLinearGradient(-700,0,700,0);lg.addColorStop(0,'rgba(255,120,40,0)');lg.addColorStop(.5,'rgba(255,230,190,.8)');lg.addColorStop(1,'rgba(255,120,40,0)');X.fillStyle=lg;X.beginPath();X.moveTo(-700,0);X.lineTo(0,-5);X.lineTo(700,0);X.lineTo(0,5);X.closePath();X.fill();
    X.restore()}
  X.restore();
}
// ============================================================
//  PRE-BAKED PLATES (drawn once, scaled per frame)
// ============================================================
// ============================================================
//  BRUSH RING — a thick dry-brush stroke drawn on (trim path)
// ============================================================
const BR=rng(77);const strands=[...Array(44)].map((_,i)=>({o:(i/43-.5),w:1.2+BR()*2.8,col:['#c41a12','#e8401c','#ff7a2a','#a8100c','#ffb35a','#d8301a','#5a0806','#ff9a3a'][Math.floor(BR()*8)],lag:BR()*.06,j:BR()*10}));
function brushRing(cx,cy,r,wb,a0,a1,alpha=1,glowK=0){
  if(a1<=a0)return;X.save();X.globalAlpha=alpha;X.lineCap='butt';
  // black under-stroke (ink outline)
  X.strokeStyle='#1a0a0a';X.lineWidth=wb+8;X.beginPath();X.arc(cx,cy,r,a0,a1);X.stroke();
  X.strokeStyle='#b8140e';X.lineWidth=wb;X.beginPath();X.arc(cx,cy,r,a0,a1);X.stroke();
  for(const s of strands){const e=Math.max(a0,a1-s.lag);const rr=r+s.o*wb*.92+Math.sin(s.j)*1.5;
    X.strokeStyle=s.col;X.lineWidth=s.w;X.beginPath();X.arc(cx,cy,rr,a0+s.lag*.5,e);X.stroke()}
  // inner shadow + highlight
  X.strokeStyle='rgba(40,0,0,.35)';X.lineWidth=wb*.22;X.beginPath();X.arc(cx,cy,r-wb*.36,a0,a1);X.stroke();
  X.strokeStyle='rgba(255,220,150,.55)';X.lineWidth=2;X.beginPath();X.arc(cx,cy,r+wb*.18,a0,a1);X.stroke();
  // wet head blob
  
  if(glowK>0)glow(()=>X.arc(cx,cy,r,a0,a1),'#ffe0b0','#ff8040','#ff3a10',wb*.25,glowK);
  X.restore();
}
// ---------- spiky comic burst (white star with black/red edges) ----------
function spikeStar(cx,cy,rIn,rOut,n,seed,rot=0){const r=rng(seed);const P=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU+rot+(r()-.5)*.08,rr=i%2?rIn*(.94+r()*.1):rOut*(.65+r()*.6);P.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr])}return P}

// ---------- halftone dissolve mask: keep layer where field(x,y) > p ----------
// field(x,y) -> 0..1 dissolve order. Draws `layerCanvas` through round halftone dots.
const lay=mk(W,H),layX=lay.getContext('2d');
function halftoneDissolve(layerCanvas,field,p,st=24){
  layX.globalCompositeOperation='copy';layX.drawImage(layerCanvas,0,0);
  const m=mk(W,H),mx=m.getContext('2d');mx.fillStyle='#000';
  for(let y=0;y<H+st;y+=st)for(let x=(Math.floor(y/st)%2)*st/2;x<W+st;x+=st){const f=field(x,y)-p;if(f<=-.02)continue;const r=st*.78*clamp(f*7+.12);mx.beginPath();mx.arc(x,y,r,0,TAU);mx.fill()}
  layX.globalCompositeOperation='destination-in';layX.drawImage(m,0,0);layX.globalCompositeOperation='source-over';X.drawImage(lay,0,0);
}
// ---------- 1-2 frame colour inversion on hits ----------
function invertFrame(){X.save();X.setTransform(1,0,0,1,0,0);X.globalCompositeOperation='difference';X.fillStyle='#fff';X.fillRect(0,0,W,H);X.restore()}
// ---------- sub-frame motion blur: average k renders across the shutter ----------
const acc=mk(W,H),accX=acc.getContext('2d');
function renderMB(t,k=4,shutter=1/120){
  if(k<=1){render2(t);return}
  for(let i=0;i<k;i++){render2(t-shutter*(i/(k-1)));accX.globalAlpha=1/(i+1);accX.drawImage(C,0,0)}
  accX.globalAlpha=1;X.setTransform(1,0,0,1,0,0);X.globalCompositeOperation='copy';X.drawImage(acc,0,0);X.globalCompositeOperation='source-over';
}
window.render=t=>renderMB(t,window.MBK||1);
