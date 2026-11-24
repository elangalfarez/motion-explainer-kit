// ============================================================
//  V3 EYE (4.8 – 9.8) — rebuilt from pixel samples of the original:
//  closed molten lens (thin dark-red outline → orange → cream core
//  hugging the inner edge), dark-red halftone interior, BLACK almond
//  eye with heavy lids + red creases, shard iris with slit, then a
//  pinwheel vortex pupil with echo arcs and radial speed lines.
// ============================================================
const ER=rng(4242);
const eBolts=[...Array(11)].map((_,i)=>({u:-.82+i*.165+(ER()-.5)*.08,side:i%2?1:-1,len:110+ER()*170,seed:Math.floor(ER()*1e6)}));
const eShards=[...Array(30)].map(()=>({a:ER()*TAU,d:.25+ER()*.62,l:.07+ER()*.1,w:.03+ER()*.035}));
const eLines=[...Array(70)].map(()=>({a:ER()*TAU,r0:.12+ER()*.2,r1:.55+ER()*.4}));
const eBlades=[...Array(30)].map((_,i)=>({a:i/30*TAU+ER()*.2,r0:.06+ER()*.3,r1:.55+ER()*.4,span:1.0+ER()*.9,w:.018+ER()*.03}));
const eDots=[...Array(30)].map(()=>({a:ER()*TAU,d:ER()*.62,s:3+ER()*6,hot:ER()<.75}));
const eSpeed=[...Array(110)].map(()=>({a:ER()*TAU,r:1.15+ER()*3.0,l:.6+ER()*1.6,w:1+ER()*2.4,c:ER()<.6?'#ff7a32':'#ffc070',ph:ER()}));
const eDrops=[...Array(110)].map(()=>({a:ER()*TAU,v:.25+ER()*.9,ph:ER(),s:3+ER()*4}));
const eTri=[...Array(34)].map(()=>({x:ER()*W,y:ER()*H,s:6+ER()*14,r:ER()*TAU,vx:(ER()-.5)*40,vy:(ER()-.5)*30,vr:(ER()-.5)*2}));
const eEmb=[...Array(40)].map(()=>({x:ER()*W,y:ER()*H,s:2+ER()*4,hot:ER()<.55,ph:ER()*TAU}));
const eCrack=[...Array(6)].map((_,i)=>({x:-300+i*55,y:20+ER()*60,a:-.3+ER()*.6-(i%2?2.6:0),seed:Math.floor(ER()*1e6)}));
const eSpikes=[...Array(36)].map(()=>({u:ER()*1.8-.9,side:ER()<.5?-1:1,len:120+ER()*380,w:6+ER()*16,lean:(ER()-.5)*.5}));

function zoomE(t){return kf(t,[[4.8,1.15],[5.3,1],[6.9,1.03],[7.5,1.22],[7.75,1.42],[8.1,1.5],[9.25,1.72]])[0]}
function lensOuter(L,Hh,t,seed){const top=[],bot=[];const n=120;
  for(let i=0;i<=n;i++){const u=i/n*2-1,x=u*L,pr=Math.pow(Math.max(0,1-u*u),.78);
    const wob=6*noise1(u*14+t*2.2+seed)+3*noise1(u*41+t*5+seed);top.push([x,-Hh*pr+wob]);bot.push([x,Hh*pr+wob*.8+3*noise1(u*17-t*2+seed+9)])}
  return[top,bot]}
function offsetIn(arr,Hh,B,sign){ // inner edge: thicker toward the tips, closes before them
  return arr.map(([x,y],i)=>{const u=i/(arr.length-1)*2-1;const b=B*(.9+.55*Math.abs(u)*Math.abs(u));const yy=y-sign*b;return[x,sign<0?Math.min(yy,-2):Math.max(yy,2)]})}
function polyBand(o,i){X.beginPath();o.forEach((p,k)=>k?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));for(let k=i.length-1;k>=0;k--)X.lineTo(i[k][0],i[k][1]);X.closePath()}
function lineOf(arr,dy=0){X.beginPath();arr.forEach((p,k)=>k?X.lineTo(p[0],p[1]+dy):X.moveTo(p[0],p[1]+dy))}
function midOf(o,i,f){return o.map((p,k)=>[p[0],lerp(p[1],i[k][1],f)])}

function eyeBG(t,a=1){
  X.fillStyle='#0a0709';X.fillRect(0,0,W,H);X.fillStyle=darkDots;X.globalAlpha=.6;X.fillRect(0,0,W,H);X.globalAlpha=1;
  for(const e of eTri){const T=t-4.8;X.save();X.translate((e.x+e.vx*T+W)%W,(e.y+e.vy*T+H)%H);X.rotate(e.r+e.vr*T);X.fillStyle='rgba(70,52,56,.75)';X.beginPath();X.moveTo(0,-e.s*.7);X.lineTo(e.s*.45,e.s*.5);X.lineTo(-e.s*.35,e.s*.35);X.closePath();X.fill();X.restore()}
  X.save();X.globalCompositeOperation='lighter';for(const e of eEmb){const fl=.6+.4*Math.sin(t*4+e.ph);X.globalAlpha=a*fl;X.fillStyle=e.hot?'#ff4a1e':'#ffe8d0';X.beginPath();X.arc(e.x,e.y-(t-4.8)*12,e.s*(e.hot?1.6:.7),0,TAU);X.fill();if(e.hot){X.globalAlpha=a*fl*.25;X.beginPath();X.arc(e.x,e.y-(t-4.8)*12,e.s*4,0,TAU);X.fill()}}X.restore();
}
function iris3(t,R){
  const ig=X.createRadialGradient(0,0,R*.05,0,0,R);ig.addColorStop(0,'#ffb060');ig.addColorStop(.25,'#ff6a2a');ig.addColorStop(.6,'#d82a16');ig.addColorStop(.9,'#7a0e08');ig.addColorStop(1,'#3a0504');
  X.beginPath();X.arc(0,0,R,0,TAU);X.fillStyle=ig;X.fill();
  X.save();X.globalCompositeOperation='lighter';
  for(const l of eLines){X.strokeStyle='rgba(255,170,90,.38)';X.lineWidth=1.3;X.beginPath();X.moveTo(Math.cos(l.a)*R*l.r0,Math.sin(l.a)*R*l.r0);X.lineTo(Math.cos(l.a)*R*l.r1,Math.sin(l.a)*R*l.r1);X.stroke()}
  X.restore();
  for(const s of eShards){const d=s.d*R;X.save();X.rotate(s.a);X.translate(d,0);X.fillStyle='rgba(255,240,228,.92)';X.beginPath();X.moveTo(-s.l*R*.2,-s.w*R*.5);X.lineTo(s.l*R,0);X.lineTo(-s.l*R*.2,s.w*R*.5);X.closePath();X.fill();X.restore()}
  // dark limbal ring
  X.beginPath();X.arc(0,0,R,0,TAU);X.lineWidth=R*.06;X.strokeStyle='#1a0304';X.stroke();
  // slit pupil (breathes)
  const pw=R*(.075+.02*Math.sin(t*2.3));X.save();X.rotate(.3);X.beginPath();X.ellipse(0,0,pw,R*1.02,0,0,TAU);X.fillStyle='#120203';X.fill();X.restore();
}
function vortex3(t,R,ring){
  // remnant red iris around the black pupil
  const ig=X.createRadialGradient(0,0,ring*.9,0,0,R*1.12);if(window.NOIRIS){ig.addColorStop(0,'#1a0505');ig.addColorStop(1,'#080203')}else{ig.addColorStop(0,'#ff5a24');ig.addColorStop(.35,'#c8281a');ig.addColorStop(1,'#3a0504')}X.beginPath();X.arc(0,0,R*1.12,0,TAU);X.fillStyle=ig;X.fill();
  X.beginPath();X.arc(0,0,ring,0,TAU);X.fillStyle='#070203';X.fill();
  // pinwheel blades (curved, tapered, rotating)
  X.save();X.beginPath();X.arc(0,0,ring*.97,0,TAU);X.clip();
  const rot=t*2.6;
  for(const b of eBlades){const n=16;const P=[],Q=[];
    for(let i=0;i<=n;i++){const u=i/n,r=lerp(b.r0,b.r1,u)*ring,a=b.a+rot+u*b.span,w=Math.sin(Math.PI*Math.pow(u,.65))*b.w*ring;
      P.push([Math.cos(a)*(r),Math.sin(a)*(r)]);Q.push([Math.cos(a+w/r)*(r),Math.sin(a+w/r)*(r)])}
    X.beginPath();P.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));for(let i=n;i>=0;i--)X.lineTo(Q[i][0],Q[i][1]);X.closePath();
    X.fillStyle='rgba(232,222,210,.82)';X.fill();X.strokeStyle='rgba(120,110,105,.45)';X.lineWidth=1;X.stroke()}
  for(const d of eDots){const a=d.a+rot*.4,r=d.d*ring;X.fillStyle=d.hot?'#ff6a2a':'#fff2e6';X.beginPath();X.arc(Math.cos(a)*r,Math.sin(a)*r,d.s*(ring/170),0,TAU);X.fill()}
  X.restore();
  // white-hot ring + echo arcs
  glow(()=>X.arc(0,0,ring,0,TAU),'#fffcf2','#ffd8a0','#ff6a20',ring*.075);
  glow(()=>X.arc(0,0,ring*1.14,2.15,4.0),'#fff0dc','#ffc080','#ff5a1a',ring*.03,.95);
  glow(()=>X.arc(0,0,ring*1.26,2.45,3.7),'#ffe8d0','#ffb070','#ff5a1a',ring*.018,.7);
  glow(()=>X.arc(0,0,ring*1.12,-.8,.75),'#fff0dc','#ffc080','#ff5a1a',ring*.028,.9);
}
// main rig. dim: 0..1 fades the band (end of shot)
function eye3(t,dim=0){
  eyeBG(t,1-dim*.5);
  const Z=zoomE(t)*(window.EYEZ||1),open=lerp(.85,1,eOut(seg(t,4.8,5.2)));
  let cx=1000+Math.sin(t*.9)*5,cy=lerp(440,446,seg(t,7.5,8.6));
  const rot=lerp(-.296,-.25,eIO(seg(t,7.4,9.2)));
  // camera follows the iris (measured iris centres in the original)
  {const vk0=seg(t,7.75,8.3),eS0=lerp(1,1.28,eIO(vk0));const lx=-63+(78*Math.cos(.1)-22*Math.sin(.1))*eS0,ly=29+(78*Math.sin(.1)+22*Math.cos(.1))*eS0;
   const px=cx+Z*(lx*Math.cos(rot)-ly*Math.sin(rot)),py=cy+Z*(lx*Math.sin(rot)+ly*Math.cos(rot));
   const[tx,ty]=kf(t,[[4.8,945,460],[5.45,1041,465],[6.9,1030,466],[7.5,964,463],[7.75,940,452],[8.0,940,467],[8.3,955,484],[9.25,950,486],[9.29,860,410]]);cx+=tx-px;cy+=ty-py}
  X.save();X.translate(cx,cy);X.rotate(rot);X.scale(Z,Z);
  // fitted to the original's band centre-lines at 5.5s (see tools/bandfit.py)
  const Hh=lerp(110,200,open),B=lerp(50,84,open),Lw=625;
  const cH=x=>Hh*Math.pow(Math.max(0,1-(x/Lw)**2),.7);
  const lensH=x=>cH(x)>0?cH(x)+B/2:0;
  const ribH=x=>{const ax=Math.abs(x);if(ax<Lw-200)return 0;const r=ax<Lw?lerp(B/2,120*open,(ax-Lw+200)/200):120*open-(ax-Lw)*.11;return Math.max(0,r)};
  const N=170,XS=[...Array(N+1)].map((_,i)=>lerp(-1700,1700,i/N));
  const oT=[],oB=[],iT=[],iB=[];
  for(const x of XS){const l=lensH(x),o=Math.max(l,ribH(x)),inn=Math.max(0,cH(x)-B/2);
    const w1=6*noise1(x*.012+t*2.2+3)+3*noise1(x*.035+t*5),w2=6*noise1(x*.012-t*2+19)+3*noise1(x*.03+t*4+7);
    oT.push([x,-o+w1]);oB.push([x,o+w2]);iT.push([x,-inn+(inn>0?w1*.4:0)]);iB.push([x,inn+(inn>0?w2*.4:0)])}
  const layer=f=>{const T=oT.map((p,k)=>[p[0],lerp(iT[k][1],p[1],f)]),Bt=oB.map((p,k)=>[p[0],lerp(iB[k][1],p[1],f)]);X.beginPath();T.forEach((p,k)=>k?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));for(let k=Bt.length-1;k>=0;k--)X.lineTo(Bt[k][0],Bt[k][1]);X.closePath()};
  const it=iT,ib=iB,ot=oT,ob=oB,L=1180;
  // ---- molten band ----
  X.save();X.globalAlpha=1-dim*.93;
  // outer glow
  X.save();X.globalCompositeOperation='lighter';for(const[w,a]of[[90,.07],[46,.14]]){X.strokeStyle=`rgba(255,70,20,${a})`;X.lineWidth=w;lineOf(ot);X.stroke();lineOf(ob);X.stroke()}X.restore();
  for(const[f,c]of[[1,'#a8180c'],[.95,'#ff5a26'],[.82,'#ff8a40'],[.66,'#ffc27a'],[.52,'#ffe8bc'],[.3,'#ff9a58'],[.17,'#e8401c'],[.07,'#9a160c']]){layer(f);X.fillStyle=c;X.fill()}
  lineOf(ot);X.strokeStyle='#ff8a50';X.lineWidth=2.2;X.stroke();lineOf(ob);X.stroke();
  X.save();X.globalCompositeOperation='lighter';
  for(const sg of[-1,1]){const x0=sg*520,x1=sg*1250;const g2=X.createLinearGradient(x0,0,x1,0);g2.addColorStop(0,'rgba(255,245,225,0)');g2.addColorStop(.18,'rgba(255,245,225,.7)');g2.addColorStop(.6,'rgba(255,235,200,.35)');g2.addColorStop(1,'rgba(255,220,180,0)');
    X.fillStyle=g2;X.beginPath();X.moveTo(x0,-55*open);X.lineTo(x1,-30*open);X.lineTo(x1,30*open);X.lineTo(x0,55*open);X.closePath();X.fill()}
  X.restore();
  X.restore();
  // interior: dark red + halftone, redder toward the band
  X.beginPath();it.forEach((p,k)=>k?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));for(let k=ib.length-1;k>=0;k--)X.lineTo(ib[k][0],ib[k][1]);X.closePath();
  const g=X.createRadialGradient(0,0,60,0,0,700);g.addColorStop(0,'#120405');g.addColorStop(.55,'#2a0709');g.addColorStop(1,'#56100f');X.fillStyle=g;X.fill();
  X.save();X.clip();X.fillStyle=redDots;X.globalAlpha=.22;X.fillRect(-1300,-500,2600,1000);X.globalAlpha=1;
  // dark shadow just inside the band
  for(const[arr,sg]of[[it,1],[ib,-1]]){X.strokeStyle='rgba(20,3,4,.55)';X.lineWidth=40;lineOf(arr,sg*30);X.stroke()}
  // ---- the almond eye ----
  const blink=Math.max(0,1-1.15*Math.sin(Math.PI*seg(t,7.08,7.45)));
  const vk=seg(t,7.75,8.3);const eS=lerp(1,1.28,eIO(vk));
  X.save();X.translate(-63,29);X.rotate(.1);X.scale(eS,eS);
  const EL=348,eo=lerp(.7,1,eOut(seg(t,4.8,5.2)))*blink;
  const up=[],lo=[];for(let i=0;i<=60;i++){const u=i/60*2-1,x=u*EL;const pu=Math.pow(1-u*u,.85)*(1+.18*u);up.push([x,-150*pu*eo-2]);lo.push([x,118*Math.pow(1-u*u,.9)*(1-.1*u)*Math.max(eo,.25)+2])}
  const almond=()=>{X.beginPath();up.forEach((p,k)=>k?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));for(let k=lo.length-1;k>=0;k--)X.lineTo(lo[k][0],lo[k][1]);X.closePath()};
  // red creases above the lid
  X.lineCap='round';
  for(const[o,w,c]of[[26,3.5,'#e8361e'],[46,2.2,'#b8200f']]){X.beginPath();up.slice(8,54).forEach((p,k)=>{const q=[p[0],p[1]*1.0-o*Math.pow(1-(p[0]/EL)**2,.5)];k?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1])});X.strokeStyle=c;X.lineWidth=w;X.stroke()}
  if(blink<.999){const full=[];for(let i=0;i<=60;i++){const u=i/60*2-1;full.push([u*EL,-150*Math.pow(1-u*u,.85)*(1+.18*u)*lerp(.7,1,eOut(seg(t,4.8,5.2)))-2])}
    X.beginPath();full.forEach((p,k)=>k?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));for(let k=lo.length-1;k>=0;k--)X.lineTo(lo[k][0],lo[k][1]);X.closePath();
    X.fillStyle='#4a0d0c';X.fill();X.save();X.clip();X.fillStyle=redDots;X.globalAlpha=.35;X.fillRect(-EL,-200,EL*2,400);X.globalAlpha=1;X.restore();
    X.strokeStyle='#060102';X.lineWidth=10;X.beginPath();full.forEach((p,k)=>k?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.stroke()}
  almond();X.fillStyle='#080203';X.fill();
  X.save();almond();X.clip();
  // sclera cracks
  for(const c of eCrack)lightning(c.x,c.y,c.a,150,c.seed,4.9,1);
  const R=184;X.save();X.translate(78,22);
  if(t<7.8)iris3(t,R);
  else{const ring=kf(t,[[7.8,24],[7.92,95],[8.05,128],[8.4,150],[8.9,150],[9.25,122]])[0];vortex3(t,R,ring)}
  X.restore();
  // lid shadow over the iris top
  const lg=X.createLinearGradient(0,-150,0,-40);lg.addColorStop(0,'rgba(8,2,3,.9)');lg.addColorStop(1,'rgba(8,2,3,0)');X.fillStyle=lg;X.fillRect(-EL,-160,EL*2,130);
  X.restore();
  // heavy lid lines
  X.lineJoin='round';X.strokeStyle='#060102';X.lineWidth=13;lineOf(up);X.stroke();X.lineWidth=8;lineOf(lo);X.stroke();
  X.strokeStyle='#ff5a2a';X.lineWidth=3;X.beginPath();lo.slice(6,56).forEach((p,k)=>k?X.lineTo(p[0],p[1]+7):X.moveTo(p[0],p[1]+7));X.stroke();
  // catch-light
  if(eo>.3){X.fillStyle='#fff';X.beginPath();X.ellipse(-92,-40,15,10,-.5,0,TAU);X.fill()}
  X.restore();
  X.restore(); // interior clip
  const ba=1-dim*.85;X.save();X.globalAlpha=ba;
  // thin bright filament just inside the lower band (as sampled)
  X.strokeStyle='rgba(255,140,80,.85)';X.lineWidth=2;lineOf(ib,-12);X.stroke();
  // lightning off the band
  if(open>.5)for(const b of eBolts){const x=b.u*900,hh=Math.max(lensH(x),ribH(x));lightningE(x,b.side*hh+b.side*4,b.side*Math.PI/2+(hash(b.seed)-.5)*.9,b.len,b.seed,t)}
  X.restore();
  // crystal spikes left over from the rift (fade by 5.05)
  const sk=1-seg(t,4.8,5.05);if(sk>0)for(const s of eSpikes){const x=s.u*1000;X.save();X.translate(x,s.side*Math.max(lensH(x),ribH(x)));X.rotate(s.lean);X.globalAlpha=sk*.8;
    const lg2=X.createLinearGradient(0,0,0,s.side*s.len);lg2.addColorStop(0,'#fff0d0');lg2.addColorStop(.7,'#c8a070');lg2.addColorStop(1,'rgba(150,110,70,0)');X.fillStyle=lg2;X.beginPath();X.moveTo(-s.w/2,0);X.lineTo(s.w/2,0);X.lineTo(0,s.side*s.len);X.closePath();X.fill();X.restore()}
  X.restore();
  // ---- vortex extras: radial speed lines + teardrop sparks (screen space) ----
  if(t>7.85){const k=seg(t,7.85,8.05)*(1-dim*.6);const lx=-63+78*Math.cos(.1)*eS-22*Math.sin(.1)*eS,ly=29+78*Math.sin(.1)*eS+22*Math.cos(.1)*eS;const ex=cx+Z*(lx*Math.cos(rot)-ly*Math.sin(rot)),ey=cy+Z*(lx*Math.sin(rot)+ly*Math.cos(rot));
    const ringPx=Z*eS*kf(t,[[7.8,24],[7.92,95],[8.05,128],[8.4,150],[8.9,150],[9.25,122]])[0];
    X.save();X.globalCompositeOperation='lighter';X.lineCap='round';
    for(const s of eSpeed){const ph=(s.ph+t*1.6)%1;const r0=ringPx*(s.r+ph*.8),r1=r0+ringPx*s.l;X.globalAlpha=k*(1-ph*.8);X.strokeStyle=s.c;X.lineWidth=s.w;X.beginPath();X.moveTo(ex+Math.cos(s.a)*r0,ey+Math.sin(s.a)*r0*.8);X.lineTo(ex+Math.cos(s.a)*r1,ey+Math.sin(s.a)*r1*.8);X.stroke()}
    for(const d of eDrops){const ph=(d.ph+t*d.v*.5)%1;const r=ringPx*(1.1+ph*5);const x=ex+Math.cos(d.a)*r,y=ey+Math.sin(d.a)*r*.75;X.globalAlpha=k*(1-ph*.7);X.fillStyle='#ffe6c4';X.save();X.translate(x,y);X.rotate(d.a);X.beginPath();X.ellipse(0,0,d.s*1.7,d.s*.75,0,0,TAU);X.fill();X.restore()}
    X.restore()}
  // star glint at the end
  if(t>8.9){const a=Math.sin(Math.PI*seg(t,8.9,9.3));X.save();X.globalCompositeOperation='lighter';X.globalAlpha=a;X.fillStyle='#ffe8c8';X.translate(1880,330);
    X.beginPath();X.moveTo(0,-60);X.lineTo(4,-4);X.lineTo(70,0);X.lineTo(4,4);X.lineTo(0,60);X.lineTo(-4,4);X.lineTo(-70,0);X.lineTo(-4,-4);X.closePath();X.fill();X.restore()}
}
function lightningE(x0,y0,ang,len,seed,t){
  const r=rng(seed+Math.floor(t*12)*7);
  const path=()=>{const rr=rng(seed+Math.floor(t*12)*7);(function br(x,y,a,l,d){if(l<18||d>2)return;const n=5;let px=x,py=y;X.moveTo(px,py);
    for(let i=0;i<n;i++){a+=(rr()-.5)*.8;px+=Math.cos(a)*l/n;py+=Math.sin(a)*l/n;X.lineTo(px,py);if(rr()<.32&&d<2){br(px,py,a+(rr()<.5?-1:1)*(.5+rr()*.5),l*.45,d+1);X.moveTo(px,py)}}})(x0,y0,ang,len,0)};
  glow(path,'#ffb27a','#ff6a2a','#ff3a08',1.5,.95);
}
// ---- wire into the timeline ----
shotF=function(t){eye3(t,sm(seg(t,8.45,9.05)))};
S6=function(t){eye3(9.1,1)}; // frozen layer used by the halftone shatter
const hSpd=[...Array(26)].map(()=>({a:ER()*TAU,r0:.35+ER()*.3,l:.5+ER()*.9,w:3+ER()*6}));
shotH=function(t){
  const T=t-9.25;
  window.EYEZ=T<.04?1:lerp(.95,.98,seg(t,9.29,9.787));window.NOIRIS=T>=.04;
  eye3(lerp(9.25,9.45,seg(t,9.25,9.787)),T<.04?1:0);
  window.EYEZ=1;window.NOIRIS=0;
  // the cut: thin red/white line straight through the eye
  if(T>=.035){X.save();X.translate(960,560);X.rotate(-.27);X.lineCap='round';
    X.strokeStyle='rgba(255,60,30,.9)';X.lineWidth=9;X.beginPath();X.moveTo(-1200,0);X.lineTo(1200,-10);X.stroke();
    X.strokeStyle='#ffd0b0';X.lineWidth=2.5;X.beginPath();X.moveTo(-1200,-1);X.lineTo(1200,-11);X.stroke();X.restore();
    // thick white radial speed lines, fading
    const k=1-seg(t,9.3,9.62);if(k>0){X.save();X.globalCompositeOperation='lighter';X.lineCap='round';
      for(const s of hSpd){const r0=s.r0*1100,r1=r0+s.l*700;X.globalAlpha=k*.85;X.strokeStyle='#fff6ec';X.lineWidth=s.w*k+1;X.beginPath();X.moveTo(960+Math.cos(s.a)*r0,540+Math.sin(s.a)*r0*.7);X.lineTo(960+Math.cos(s.a)*r1,540+Math.sin(s.a)*r1*.7);X.stroke()}X.restore()}
    // ember burst
    X.save();X.globalCompositeOperation='lighter';for(const s of sparks){const d=s.v*eOut(seg(T,.04,.7));X.globalAlpha=1-seg(T,.3,.7);X.fillStyle=hash(s.a)>.5?'#ff6a2a':'#ffe0c0';X.beginPath();X.arc(960+Math.cos(s.a)*d,540+Math.sin(s.a)*d,s.s,0,TAU);X.fill()}X.restore();
  }
  // the fat white-hot blade sweeping across (9.25 – 9.29)
  if(T<.045){const q=eOut5(seg(T,0,.04));bladeSlash(-300,880,lerp(200,2200,q),lerp(700,180,q),150,1)}
};
