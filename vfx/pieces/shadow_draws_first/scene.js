/* THE SHADOW DRAWS FIRST — Disobeyed Ep.1 (law broken: light).
   A candle-lit shoji room. Time freezes; only the katana's shadow moves. It draws,
   cuts a crescent across the paper wall and re-sheathes. The real sword catches up
   late, and the wall opens along the shadow's cut onto a molten world.
   Pure render(t): every value is a function of t; no state carried between frames. */
(function(){
window.DUR=8.2;
const FREEZE0=2.45, THAW=4.9;            // world time stops / restarts
const POP=4.9, IGN=4.9, FLAP0=4.98, FLAP1=5.52, CLICK=5.35, BLACK=8.12;
HITS=[[3.45,3],[4.2,2.2],[4.9,15],[5.35,5],[5.52,6]];
const FLOOR=800;
const KX=1130,KY=680,KS=.85,KROTR=Math.PI/2-.012;   // real katana: tsuba, hilt right, blade left
const SK=1.6;                                       // shadow magnification about the flame
OFUDA_A=0;                                          // no paper charms (no glyphs in this film)

// ---------- world time: freezes between FREEZE0 and THAW ----------
function tau(t){
  const F=FREEZE0,d=.12;
  if(t<F-d)return t;
  if(t<F){const u=(t-(F-d))/d;return F-d+d*(u-u*u/2)}
  if(t<THAW)return F-d/2;
  return F-d/2+(t-THAW);
}
// ---------- candle flame (light source) ----------
const CX=830, CTOP=962;
function flame(tw){ // returns {x,y,h,lean,I}
  const f1=noise1(tw*7.3),f2=noise1(tw*13.1+40),f3=noise1(tw*2.1+9);
  const gust=.42*Math.sin(Math.PI*seg(tw,.75,1.75))*(tw<1.75?1:0)-.58*eOut(seg(tw,1.9,2.39));
  return {x:CX+f3*4+f1*2, y:CTOP-40, h:78+f1*9+f2*4+Math.abs(gust)*26, lean:f3*.12+f1*.04+gust, I:1+f1*.07+f2*.04};
}
function lightPos(tw){const f=flame(tw);return [f.x+Math.sin(f.lean)*95,f.y-6+(1-Math.cos(f.lean))*70]}
const LP0=lightPos(tau(3));
const TS0=[LP0[0]+(KX-LP0[0])*SK, LP0[1]+(KY-LP0[1])*SK]; // shadow tsuba during the freeze
const SS=KS*SK, BL=K3.BLADE*SS;                        // shadow scale, shadow blade length (px)
const M=TS0;                                           // shadow saya mouth

// ---------- shadow choreography ----------
// Tip and tsuba keys for the swing + return (designed, shadow space). Crescent rises from the
// mouth, arcs over the wall and lands at the hinge height on the far left.
const SWK=[[3.37,M[0],M[1],180],[3.41,1700,300,212],[3.45,1380,95,248],[3.49,880,66,246],[3.53,420,240,222],[3.57,200,450,200],[3.62,165,M[1],188],
           [3.72,230,480,186],[3.86,700,450,178],[3.98,1150,520,180],[4.06,M[0],M[1],180]];
function swingPose(t){const[x,y,a]=cr(t,SWK);const r=a*Math.PI/180;return{tip:[x,y],tsu:[x-BL*Math.cos(r),y-BL*Math.sin(r)]}}
function shadowPose(t){ // {mode:'sheathed',out} or {mode:'free',tip,tsu}
  if(t<3.37){
    let out=0;
    if(t>2.66)out=95*eOut5(seg(t,2.66,2.76));
    if(t>3.25)out=lerp(95,K3.BLADE,eIn2(seg(t,3.25,3.37)));
    return {mode:'sheathed',out};
  }
  if(t<4.06){const q=swingPose(t);return {mode:'free',tip:q.tip,tsu:q.tsu}}
  if(t<4.2){const u=eIn2(seg(t,4.06,4.2));return {mode:'sheathed',out:K3.BLADE*(1-u)}}
  return {mode:'sheathed',out:0};
}
// crescent scar = tip path 3.37..3.62 (precomputed)
const ARC=[];for(let i=0;i<=140;i++){const tt=lerp(3.37,3.62,i/140);ARC.push(cr(tt,SWK).slice(0,2).concat([tt]))}
const HY=M[1];
// ---------- plates ----------
const R=rng(5150);
const grainT=mk(512,512),gx=grainT.getContext('2d');
for(let i=0;i<26000;i++){gx.fillStyle=i%3?'rgba(0,0,0,.09)':'rgba(255,255,255,.12)';gx.fillRect(R()*512,R()*512,R()*1.4+.3,R()*1.4+.3)}
const fibC=mk(1024,1024),fbx=fibC.getContext('2d');
(function(){const fr=rng(4242);fbx.lineCap='round';
  for(let i=0;i<5200;i++){const x=fr()*1024,y=fr()*1024,a=fr()*TAU,l=6+fr()*fr()*46;
    fbx.strokeStyle=fr()<.55?`rgba(255,250,235,${.10+fr()*.22})`:`rgba(90,66,40,${.06+fr()*.14})`;fbx.lineWidth=.35+fr()*.9;
    fbx.beginPath();fbx.moveTo(x,y);fbx.quadraticCurveTo(x+Math.cos(a+.6)*l*.5,y+Math.sin(a+.6)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);fbx.stroke()}
  for(let i=0;i<260;i++){fbx.fillStyle=`rgba(80,60,35,${.05+fr()*.08})`;fbx.beginPath();fbx.ellipse(fr()*1024,fr()*1024,4+fr()*16,2+fr()*7,fr()*TAU,0,TAU);fbx.fill()}})();
const fibP=X.createPattern(fibC,'repeat');
const wallC=mk(W,H), wx=wallC.getContext('2d');
(function(){
  // paper panes
  const pg=wx.createLinearGradient(0,0,0,FLOOR);pg.addColorStop(0,'#e4dccb');pg.addColorStop(1,'#efe8d8');
  wx.fillStyle=pg;wx.fillRect(0,0,W,FLOOR);
  const pr=rng(9);
  for(let px=0;px<W;px+=115)for(let py=40;py<700;py+=150){wx.fillStyle=`rgba(${pr()<.5?120:255},${pr()<.5?100:240},70,${pr()*.05})`;wx.fillRect(px,py,115,150)}
  wx.globalAlpha=.55;wx.drawImage(grainT,0,0,W,FLOOR);wx.globalAlpha=1;
  for(let i=0;i<1600;i++){const x=pr()*W,y=pr()*FLOOR;wx.strokeStyle=`rgba(110,90,60,${.02+pr()*.05})`;wx.lineWidth=.4+pr()*.7;wx.beginPath();wx.moveTo(x,y);wx.quadraticCurveTo(x+pr()*10,y+pr()*6-3,x+pr()*22-6,y+pr()*8-4);wx.stroke()}
  wx.fillStyle=fibP;wx.globalAlpha=.9;wx.fillRect(0,0,W,FLOOR);wx.globalAlpha=1;
  // kumiko lattice
  const wood='#4a3626';
  wx.globalAlpha=.72;for(let x=0;x<=W;x+=115){wx.fillStyle=wood;wx.fillRect(x-2.5,30,5,680)}
  for(let y=40;y<=700;y+=150){wx.fillStyle=wood;wx.fillRect(0,y-2.5,W,5)}wx.globalAlpha=1;
  for(const x of[0,460,920,1380,1840]){wx.fillStyle='#2f2118';wx.fillRect(x-9,20,18,700)}
  wx.fillStyle='#2a1d15';wx.fillRect(0,0,W,34);wx.fillRect(0,700,W,100); // top rail, koshi panel
  wx.fillStyle='rgba(255,220,170,.08)';wx.fillRect(0,26,W,3);wx.fillRect(0,703,W,2);
  for(let x=0;x<W;x+=230){wx.strokeStyle='rgba(0,0,0,.35)';wx.lineWidth=2;wx.beginPath();wx.moveTo(x,706);wx.lineTo(x,800);wx.stroke()}
  for(let i=0;i<300;i++){const y=710+pr()*88,x=pr()*W;wx.strokeStyle=`rgba(90,60,40,${pr()*.25})`;wx.lineWidth=.6;wx.beginPath();wx.moveTo(x,y);wx.lineTo(x+40+pr()*120,y+pr()*2);wx.stroke()}
  wx.fillStyle='#160f0b';wx.fillRect(0,792,W,10); // sill
})();
const floorC=mk(W,H), fx=floorC.getContext('2d');
(function(){
  const g=fx.createLinearGradient(0,FLOOR,0,H);g.addColorStop(0,'#5b5238');g.addColorStop(1,'#7a6f4c');
  fx.fillStyle=g;fx.fillRect(0,FLOOR,W,H-FLOOR);
  const vp=[960,420];const fr=rng(3);
  for(let y=FLOOR+4;y<H;y+=3){fx.strokeStyle=`rgba(30,25,12,${.08+fr()*.06})`;fx.lineWidth=1;fx.beginPath();fx.moveTo(0,y);fx.lineTo(W,y);fx.stroke()}
  for(const x0 of[-1400,-500,400,1300,2200,3100]){fx.strokeStyle='#1d160e';fx.lineWidth=9;fx.beginPath();
    const u=(FLOOR-vp[1])/(H-vp[1]);fx.moveTo(vp[0]+(x0-vp[0])*u,FLOOR);fx.lineTo(x0,H);fx.stroke()}
  fx.fillStyle='#1d160e';fx.fillRect(0,905,W,7);
  fx.globalAlpha=.4;fx.drawImage(grainT,0,FLOOR,W,H-FLOOR);fx.globalAlpha=1;
})();
const archPath=(g)=>{g.beginPath();ARC.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath()};
const flapC=mk(W,H),flx=flapC.getContext('2d');flx.save();archPath(flx);flx.clip();flx.drawImage(wallC,0,0);flx.restore();
const holeC=mk(W,H),hx=holeC.getContext('2d');hx.drawImage(wallC,0,0);hx.globalCompositeOperation='destination-out';archPath(hx);hx.fill();
// ---------- offscreen layers ----------
const half=mk(W/2,H/2),hfx=half.getContext('2d');
const shC=mk(W,H),shx=shC.getContext('2d');
const fsC=mk(W,H),fsx=fsC.getContext('2d');
const rimC=mk(W,H),rimx=rimC.getContext('2d');const edgeC=mk(W,H),edgeX=edgeC.getContext('2d');

// ---------- drawing helpers ----------
function rack(){
  X.save();
  X.fillStyle='#120c0a';X.strokeStyle='#050304';X.lineWidth=3;
  roundRect(560,884,700,24,6);X.fill();X.stroke();
  for(const x of[720,1060]){
    X.beginPath();X.moveTo(x-20,886);X.lineTo(x-11,712);X.quadraticCurveTo(x-28,690,x-38,668);X.lineTo(x-25,665);X.quadraticCurveTo(x-8,688,x,692);
    X.quadraticCurveTo(x+8,688,x+25,665);X.lineTo(x+38,668);X.quadraticCurveTo(x+28,690,x+11,712);X.lineTo(x+20,886);X.closePath();
    X.fillStyle='#17100d';X.fill();X.stroke();
    X.strokeStyle='rgba(217,164,65,.8)';X.lineWidth=2;X.beginPath();X.moveTo(x-30,670);X.quadraticCurveTo(x,696,x+30,670);X.stroke();
    X.strokeStyle='rgba(255,220,180,.12)';X.lineWidth=3;X.beginPath();X.moveTo(x-7,712);X.lineTo(x-13,880);X.stroke();X.strokeStyle='#050304';X.lineWidth=3;
  }
  X.restore();
}
function realKatana(t,tw,out){katana(KX,KY,KROTR,KS,{t:tw,out,charms:true})}
function swordFree(tip,tsu,s){ // shadow sword placed by tsuba+tip; stretched along the blade
  const dx=tip[0]-tsu[0],dy=tip[1]-tsu[1],len=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
  X.save();X.translate(tsu[0],tsu[1]);X.rotate(a-Math.PI/2);X.scale(s,s*len/BL);drawBlade3(K3.BLADE);X.scale(1,BL/len);drawHilt3();drawTsuba3();X.restore();
}
function strip(P,w0,w1){ // ribbon polygon between two polylines
  X.beginPath();P.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));for(let i=P.length-1;i>=0;i--)X.lineTo(P[i][2],P[i][3]);X.closePath();
}
// smear of the shadow swing: ink ribbon from pose history (blade fraction .3..1)
function shadowSmear(t){
  if(t<3.37||t>3.9)return;
  const n=16,dt=.006;const P=[];
  for(let i=0;i<n;i++){const tt=t-i*dt;if(tt<3.37)break;const p=shadowPose(tt);if(p.mode!=='free')break;
    const a=p.tsu,b=p.tip;const ff=lerp(.72,.985,i/n);P.push([b[0],b[1],lerp(a[0],b[0],ff),lerp(a[1],b[1],ff),i/n])}
  if(P.length<3)return;
  const fade=1-seg(t,3.6,3.9);
  X.save();X.fillStyle='#000';X.strokeStyle='#000';X.lineCap='round';
  // segment quads: dense at the leading tip, breaking into brush loss toward the tail
  for(let i=0;i<P.length-1;i++){const p=P[i],q=P[i+1];const age=i/(P.length-1);
    // each segment loses a band of bristles: inner edge pulled toward the outer edge
    const keep=1-age*.75;
    const pin=[lerp(p[0],p[2],keep),lerp(p[1],p[3],keep)],qin=[lerp(q[0],q[2],keep),lerp(q[1],q[3],keep)];
    X.globalAlpha=fade*(.95-age*.55);X.beginPath();X.moveTo(p[0],p[1]);X.lineTo(q[0],q[1]);X.lineTo(qin[0],qin[1]);X.lineTo(pin[0],pin[1]);X.closePath();X.fill()}
  // dry-brush loss: bristle gaps cut THROUGH the ribbon, widening toward the tail
  X.globalCompositeOperation='destination-out';const gr=rng(97);
  for(let k=0;k<30;k++){const f=.03+gr()*.94,st=.12+gr()*.5,w=1.5+gr()*gr()*9;
    X.globalAlpha=1;X.lineWidth=w;X.beginPath();let on=0;
    for(let i=0;i<P.length;i++){const age=i/(P.length-1);if(age<st)continue;const p=P[i];
      const x=lerp(p[2],p[0],f),y=lerp(p[3],p[1],f);if(on){X.lineWidth=w*(.5+age*1.8)*(.6+.8*Math.abs(noise1(k*5.3+i*.37)));X.beginPath();X.moveTo(on[0],on[1]);X.lineTo(x,y);X.stroke()}on=[x,y]}}
  X.globalCompositeOperation='source-over';
  // bristle strands: each has its own dry-out point along the stroke
  const sr=rng(41);
  for(let k=0;k<34;k++){const f=sr(),w=.8+sr()*3.6,dry=.35+sr()*.65;
    X.globalAlpha=(.45+sr()*.5)*fade;X.lineWidth=w;X.beginPath();let on=0;
    for(let i=0;i<P.length;i++){const p=P[i];if(i/P.length>dry*(1-f*.5))break;const x=lerp(p[2],p[0],f),y=lerp(p[3],p[1],f);
      if(noise1(k*3.1+i*.9)<-.45){if(on){X.stroke();X.beginPath();on=0}continue}
      on?X.lineTo(x,y):X.moveTo(x,y);on=1}
    if(on)X.stroke()}
  X.restore();
}
// ink spatter thrown off the tip during the swing; stays printed on the paper
const SPR=rng(808);const SPAT=[...Array(90)].map(()=>{const u=Math.pow(SPR(),1.4);return{u,d:8+SPR()*SPR()*120,r:.8+SPR()*SPR()*6,j:(SPR()-.5)*.8,el:1+SPR()*2.5}});
function spatter(t){
  if(t<3.37||t>=4.9)return;
  X.save();X.fillStyle='#0c0604';
  for(const d of SPAT){const te=lerp(3.37,3.62,d.u);if(t<te)continue;
    const i=Math.min(ARC.length-2,Math.floor(d.u*(ARC.length-1))),p=ARC[i],q=ARC[i+1];
    const tx=q[0]-p[0],ty=q[1]-p[1],l=Math.hypot(tx,ty)||1;const nx=-ty/l,ny=tx/l;
    const k=eOut5(seg(t,te,te+.07));const dirx=nx*.8+tx/l*d.j+tx/l*.5,diry=ny*.8+ty/l*d.j+ty/l*.5;
    const x=p[0]+dirx*d.d*k,y=p[1]+diry*d.d*k;
    X.globalAlpha=.85;X.beginPath();X.ellipse(x,y,d.r*(k<1?d.el:1),d.r,Math.atan2(diry,dirx),0,TAU);X.fill()}
  X.restore();
}
// the shadow's blade owns a living crimson edge (the only light the shadow makes)
function edgeLine(x,y,rot,s,ly0,ly1,lx,core,a){
  const P=[];for(let i=0;i<=12;i++){const ly=lerp(ly0,ly1,i/12);P.push([x+s*(lx*Math.cos(rot)-ly*Math.sin(rot)),y+s*(lx*Math.sin(rot)+ly*Math.cos(rot))])}
  glow(()=>P.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1])),core,'#ff7a6a','#c8102e',2.2,a);
}
function shadowEdge(t,tw){
  if(t<2.64||t>4.2)return;
  const lp=lightPos(tw),sx=lp[0]+(KX-lp[0])*SK,sy=lp[1]+(KY-lp[1])*SK,p=shadowPose(t);
  const breath=.75+.25*Math.sin(t*9);
  if(p.mode==='sheathed'){if(p.out<6)return;edgeLine(sx,sy,KROTR,SS,-p.out+10,22,12,'#ffe0d8',breath*(t<2.76?1.4:1))}
  else{const a=Math.atan2(p.tip[1]-p.tsu[1],p.tip[0]-p.tsu[0]);
    if(!(window.SUBI>0))edgeLine(p.tsu[0],p.tsu[1],a-Math.PI/2,1,BL*.6,BL*.985,10*SS,'#ffffff',1.1);
    flare(p.tip[0],p.tip[1],16,t,.8,0)}
}
function drawShadowFigure(t,tw){ // in shadow space, solid colours (silhouette pass)
  const lp=lightPos(tw);
  const sx=lp[0]+(KX-lp[0])*SK, sy=lp[1]+(KY-lp[1])*SK;
  const p=shadowPose(t);
  // rack shadow
  X.save();X.translate(lp[0],lp[1]);X.scale(SK,SK);X.translate(-lp[0],-lp[1]);rack();X.restore();
  if(p.mode==='sheathed')katana(sx,sy,KROTR,SS,{t:tw,out:p.out,charms:true});
  else{katana(sx,sy,KROTR,SS,{t:tw,noHilt:1,charms:true});swordFree(p.tip,p.tsu,SS)}
  shadowSmear(t);
}
function silhouette(dst,dx,col,blurPx,drawFn){
  X.setTransform(1,0,0,1,0,0);X.clearRect(0,0,W,H);
  drawFn();
  X.setTransform(1,0,0,1,0,0);
  hfx.globalCompositeOperation='copy';hfx.filter=blurPx?`blur(${blurPx}px)`:'none';hfx.drawImage(C,0,0,W/2,H/2);hfx.filter='none';
  dx.globalCompositeOperation='copy';dx.drawImage(half,0,0,W,H);
  dx.globalCompositeOperation='source-in';dx.fillStyle=col;dx.fillRect(0,0,W,H);dx.globalCompositeOperation='source-over';
}
function camera(t){
  let s,cx,cy;
  const k0=[[0,1,960,560],[2.45,1.035,980,560],[2.62,1.22,1330,540],[3.22,1.25,1340,540],[3.3,1.25,1340,540],[3.62,1.0,960,540],[4.2,1.0,960,540],[4.88,1.1,1060,590],[4.9,1.075,900,520],[5.4,1.0,940,540],[8.12,1.07,950,560]];
  [s,cx,cy]=kf(t,k0);
  const hw=W/2/s,hh=H/2/s;cx=clamp(cx,hw,W-hw);cy=clamp(cy,hh,H-hh);
  const [shx_,shy_,shr]=shake(t);
  X.setTransform(1,0,0,1,0,0);X.translate(W/2+shx_,H/2+shy_);X.rotate(shr);X.scale(s,s);X.translate(-cx,-cy);
}
// ---------- portal world ----------
const PCX=860;
function portal(t){
  const hy=HY;
  const g=X.createLinearGradient(0,40,0,hy);
  g.addColorStop(0,'#1a0306');g.addColorStop(.45,'#6a0614');g.addColorStop(.8,'#d8301a');g.addColorStop(1,'#ffb060');
  X.fillStyle=g;X.fillRect(0,0,W,FLOOR);
  // giant sun rising behind the horizon (the hinge), crimson with halftone
  const sy=lerp(hy+200,hy-150,eOut(seg(t,5.0,8.05)));
  X.save();X.beginPath();X.arc(PCX,sy,330,0,TAU);
  const sg=X.createRadialGradient(PCX,sy,0,PCX,sy,330);sg.addColorStop(0,'#ffe2b0');sg.addColorStop(.55,'#ff7a2a');sg.addColorStop(1,'#e0301c');
  X.fillStyle=sg;X.fill();X.clip();X.fillStyle=blackDots;X.globalAlpha=.22;X.fillRect(0,0,W,H);X.restore();
  // paper-cut mountain layers (parallax drift), ukiyo-e silhouettes
  const drift=(t-5)*1;
  for(const[base,amp,col,seed,sp]of[[hy-150,70,'#7a0a18',3,6],[hy-90,60,'#3a0410',8,12],[hy-30,40,'#140206',13,20]]){
    X.fillStyle=col;X.beginPath();X.moveTo(-100,hy+10);
    for(let x=-100;x<=W+100;x+=24){const xx=x+drift*sp;X.lineTo(x,base-Math.abs(Math.sin(xx*.0042+seed))*amp-Math.sin(xx*.013+seed*2)*amp*.25-Math.pow(Math.max(0,Math.sin(xx*.0021+seed)),6)*amp*1.6)}
    X.lineTo(W+100,hy+10);X.closePath();
    X.save();X.shadowColor='rgba(10,0,2,.65)';X.shadowBlur=26;X.shadowOffsetY=16;X.fill();X.restore();
    X.save();X.clip();X.globalCompositeOperation='overlay';X.globalAlpha=.55;X.fillStyle=fibP;X.fillRect(0,0,W,FLOOR);X.restore();
    X.save();X.translate(0,3);X.strokeStyle='rgba(255,205,150,.6)';X.lineWidth=4;X.stroke();X.restore();
    X.strokeStyle='rgba(30,4,6,.6)';X.lineWidth=1;X.stroke();
  }
  // horizon line glow
  X.save();X.globalCompositeOperation='lighter';
  let hg=X.createLinearGradient(0,hy-60,0,hy);hg.addColorStop(0,'rgba(255,170,90,0)');hg.addColorStop(1,'rgba(255,230,180,.5)');X.fillStyle=hg;X.fillRect(0,hy-60,W,60);
  // drifting heat bands
  for(let i=0;i<10;i++){const y=120+i*40+Math.sin(t*1.3+i)*5,x=((t*(60+i*17)+i*300)%2400)-500;
    const lg=X.createLinearGradient(x,0,x+900,0);lg.addColorStop(0,'rgba(255,120,50,0)');lg.addColorStop(.5,`rgba(255,150,90,${.10+.05*(i%3)})`);lg.addColorStop(1,'rgba(255,120,50,0)');
    X.fillStyle=lg;X.fillRect(x,y,900,2+(i%3)*2)}
  X.restore();
  X.save();X.globalAlpha=.55;X.fillStyle=darkDots;X.fillRect(0,0,W,FLOOR);X.restore();
}
// volumetric rays from the opening into the room (through the dust)
function rays(t){
  if(t<FLAP0)return;
  const a=seg(t,FLAP0,5.6)*(1-.25*seg(t,6.5,8.8));
  X.save();X.globalCompositeOperation='lighter';
  const rr=rng(66);
  for(let i=0;i<14;i++){
    const p=ARC[Math.floor((i+.5)/14*(ARC.length-1))];
    const sx=lerp(PCX,p[0],.85),sy=lerp(HY-120,p[1],.85);
    const dx=sx-PCX,dy=sy-(HY+260),l=Math.hypot(dx,dy);const ux=dx/l,uy=dy/l;
    const L=1400,w=30+rr()*90,wob=.6+.4*Math.sin(t*1.7+i*2.1);
    const ex=sx-uy*0+ux*-L*.0,ey=sy;
    const g=X.createLinearGradient(sx,sy,sx-ux*L*-.0+ (sx-PCX)*1.2, sy+ (sy-HY+120)*0+L*.9);
    g.addColorStop(0,`rgba(255,170,100,${.12*a*wob})`);g.addColorStop(1,'rgba(255,120,60,0)');
    X.fillStyle=g;X.beginPath();
    // rays fan downward-outward toward the camera
    const tx=sx+(sx-PCX)*1.3,ty=sy+L;
    X.moveTo(sx-w*.3,sy);X.lineTo(sx+w*.3,sy);X.lineTo(tx+w*2.2,ty);X.lineTo(tx-w*2.2,ty);X.closePath();X.fill();
  }
  X.restore();
}
// ---------- particles ----------
const DR=rng(77);const DUST=[...Array(150)].map(()=>({x:DR()*W,y:150+DR()*720,vx:(DR()-.5)*8,vy:-6-DR()*14,r:.8+DR()*2.6,ph:DR()*TAU}));
function dust(t,tw){
  X.save();X.globalCompositeOperation='lighter';
  const lp=lightPos(tw);
  for(const d of DUST){
    let x=d.x+d.vx*tw+Math.sin(tw*.8+d.ph)*12,y=((d.y+d.vy*tw)%900+900)%900;
    let a=clamp(1-Math.hypot(x-lp[0],y-lp[1])/1100)*.55;
    if(t>THAW){const u=t-THAW;const dx=x-PCX,dy=y-HY,l=Math.hypot(dx,dy)||1;x+=dx/l*u*u*260;y+=dy/l*u*u*260;a*=1-seg(u,.1,.7)}
    if(a<=.01)continue;X.globalAlpha=a;X.fillStyle='#ffd9a8';X.beginPath();X.arc(x,y,d.r*(t>THAW?.7:1),0,TAU);X.fill();
  }
  X.restore();
}
const ER=rng(313);const EMB=[...Array(220)].map(()=>{const i=Math.floor(ER()*ARC.length);return{i,per:1.2+ER()*1.8,off:ER()*3,sp:200+ER()*700,ang:ER()*TAU,r:1+ER()*3,dz:ER()}});
function embers(t){
  if(t<IGN)return;
  X.save();X.globalCompositeOperation='lighter';
  for(const e of EMB){
    const st=IGN+e.off*.6*(e.dz<.35?0:1); if(t<st)continue; if(t<IGN+.1&&e.i/(ARC.length-1)>(t-IGN)/.1)continue;
    const u=((t-st)/e.per)%1, cyc=Math.floor((t-st)/e.per);
    const p=ARC[(e.i+cyc*37)%ARC.length];
    const ox=p[0]+(PCX-p[0])*.25*e.dz, oy=p[1]+(HY-p[1])*.25*e.dz;
    const dx=ox-PCX,dy=oy-(HY+100),l=Math.hypot(dx,dy)||1;
    const x=ox+dx/l*e.sp*u+Math.sin(u*9+e.ang)*20, y=oy+dy/l*e.sp*u*.6-60*u+Math.cos(u*7+e.ang)*14;
    const a=Math.sin(Math.PI*u)*(t<IGN+.5?seg(t,IGN,IGN+.5):1);
    X.globalAlpha=a*.9;X.fillStyle=e.dz<.3?'#fff1d0':'#ff8a3a';X.beginPath();X.arc(x,y,e.r*(1+u),0,TAU);X.fill();
    X.globalAlpha=a*.18;X.beginPath();X.arc(x,y,e.r*3,0,TAU);X.fill();
  }
  X.restore();
}
const PR=rng(907);const SCRAPS=[...Array(70)].map(()=>{const i=Math.floor(PR()*ARC.length);return{i,v:300+PR()*900,a:PR()*TAU,sp:(PR()-.5)*18,w:8+PR()*26,h:5+PR()*16,dly:PR()*.25,z:PR()}});
function scraps(t){
  if(t<IGN)return;
  for(const s of SCRAPS){
    const u=t-IGN-s.dly*.4;if(u<0)continue;if(t<IGN+.12&&s.i/(ARC.length-1)>(t-IGN)/.1)continue;
    const p=ARC[s.i];const dx=p[0]-PCX,dy=p[1]-(HY+60),l=Math.hypot(dx,dy)||1;
    const sc=1+u*u*s.z*1.4;
    const x=p[0]+dx/l*s.v*u*.7+(p[0]-960)*u*s.z*.8, y=p[1]+dy/l*s.v*u*.5+260*u*u;
    const a=1-seg(u,1.0,1.9);if(a<=0)continue;
    X.save();X.translate(x,y);X.rotate(s.a+s.sp*u);X.scale(sc*Math.cos(u*s.sp*.6),sc);X.globalAlpha=a;
    X.fillStyle=s.z>.5?'#c99a70':'#8a5a3c';X.beginPath();X.moveTo(-s.w/2,-s.h/2);X.lineTo(s.w/2,-s.h/2+2);X.lineTo(s.w/2-3,s.h/2);X.lineTo(-s.w/2+2,s.h/2-1);X.closePath();X.fill();
    X.strokeStyle='rgba(255,120,40,.9)';X.lineWidth=1.5;X.stroke();X.restore();
  }
}
// ---------- candle ----------
function candle(t,tw){
  const f=flame(tw);
  X.save();
  const g=X.createLinearGradient(CX-37,0,CX+37,0);g.addColorStop(0,'#bfae90');g.addColorStop(.4,'#f3e7cc');g.addColorStop(1,'#a8987a');
  const dk=t>IGN;if(dk){const g2=X.createLinearGradient(CX-37,0,CX+37,0);g2.addColorStop(0,'#2a1a14');g2.addColorStop(.5,'#4a2c20');g2.addColorStop(1,'#1a0e0a');X.fillStyle=g2}else X.fillStyle=g;X.beginPath();X.moveTo(CX-34,CTOP);X.quadraticCurveTo(CX,CTOP+8,CX+34,CTOP);X.lineTo(CX+37,H+20);X.lineTo(CX-37,H+20);X.closePath();X.fill();
  X.strokeStyle=dk?'rgba(255,170,100,.55)':'#2a1d15';X.lineWidth=3;X.stroke();
  X.fillStyle=dk?'#3a241a':'#efe2c4';X.beginPath();X.moveTo(CX+12,CTOP+3);X.quadraticCurveTo(CX+20,CTOP+40,CX+16,CTOP+70);X.quadraticCurveTo(CX+9,CTOP+76,CX+8,CTOP+40);X.closePath();X.fill();
  X.strokeStyle='#1a0f0a';X.lineWidth=2.5;X.beginPath();X.moveTo(CX,CTOP+1);X.lineTo(CX+1,CTOP-14);X.stroke();
  // flame (blown out after the cut)
  const out=seg(t,4.93,5.08);
  if(out<1){
    const h=f.h*(1-out)*(1+out*.6),lean=f.lean+out*1.1;
    X.translate(f.x,CTOP-12);X.rotate(lean);
    X.globalCompositeOperation='lighter';
    const rg=X.createRadialGradient(0,-h*.35,2,0,-h*.35,h*2.8);rg.addColorStop(0,`rgba(255,200,120,${.45*f.I*(1-out)})`);rg.addColorStop(1,'rgba(255,120,40,0)');
    X.fillStyle=rg;X.beginPath();X.arc(0,-h*.35,h*2.8,0,TAU);X.fill();
    const fg=X.createLinearGradient(0,0,0,-h);fg.addColorStop(0,'#5a7cff');fg.addColorStop(.18,'#ffcf7a');fg.addColorStop(.55,'#fff6dc');fg.addColorStop(1,'rgba(255,170,70,0)');
    X.fillStyle=fg;X.beginPath();X.moveTo(0,4);X.bezierCurveTo(-19,-6,-15,-h*.5,0,-h);X.bezierCurveTo(15,-h*.5,19,-6,0,4);X.fill();
  }
  X.restore();
  // smoke
  X.save();X.lineCap='round';
  const smokeA=t>4.98?(1-seg(t,6.8,8.5)):.35;
  for(let k=0;k<3;k++){
    const st=t>4.98?Math.min(1,(t-4.98)*.8):.35;
    X.strokeStyle=`rgba(200,190,180,${smokeA*(.22-k*.05)})`;X.lineWidth=2.5+k*2;X.beginPath();
    for(let i=0;i<=30;i++){const u=i/30,y=CTOP-70-u*520*st-(t>4.98?0:40),x=CX+Math.sin(u*6+tw*1.7+k)*(10+u*50)+(t>4.98?u*u*-180:0);i?X.lineTo(x,y):X.moveTo(x,y)}
    X.stroke();
  }
  X.restore();
}
// ---------- the cut line on the wall ----------
function arcPts(u0,u1){const a=Math.floor(u0*(ARC.length-1)),b=Math.ceil(u1*(ARC.length-1));return ARC.slice(a,b+1)}
function scar(t){
  if(t<3.37)return;
  // draw-on following the tip, then permanent hairline
  let n=ARC.length;if(t<3.62){n=ARC.findIndex(p=>p[2]>t);if(n<0)n=ARC.length}
  const P=ARC.slice(0,n);if(P.length<2)return;
  X.save();X.lineCap='round';X.lineJoin='round';
  if(t<IGN){
    X.strokeStyle='rgba(15,8,6,.85)';X.lineWidth=2.4;X.beginPath();P.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.stroke();
    const hot=1-seg(t,3.62,3.95);
    if(hot>0){const H_=P.slice(Math.max(0,P.length-(t<3.62?22:140)));glow(()=>H_.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1])),'#ffd8d0','#ff5a4a','#c8102e',2,hot*1.1)}
    // premonition: a faint crimson heat crawls along the line during the wait
    const pre=seg(t,4.35,4.88);
    if(pre>0){const pulse=.55+.45*Math.sin((t-4.35)*22);
      glow(()=>{P.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]))},'#ff9a6a','#e0302a','#c8102e',1.6,pre*pulse*.8)}
  }else{
    // ignition travels from the mouth to the end in 6 frames (the cut "arrives")
    const u=clamp((t-IGN)/.1),cool=seg(t,IGN+.15,7.5);
    const Q=arcPts(0,Math.max(u,.01));
    if(u<1){const A_=arcPts(u,1);X.strokeStyle='rgba(10,4,3,.95)';X.lineWidth=3;X.beginPath();A_.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.stroke();
      const hd=Q.slice(Math.max(0,Q.length-14));glow(()=>hd.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1])),'#ffffff','#fff0c0','#ff7a20',9,2)}
    const path=()=>Q.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));
    const w=lerp(5,2.2,cool)*(t<FLAP0?1:1.2);
    glow(path,'#ffffff','#ffd090','#ff5a14',w,lerp(1.4,.8,cool)*(u<1?.45:1));
    if(t<IGN+.12){const h=Q[Q.length-1];flare(h[0],h[1],95,t,1.1,0)}
  }
  X.restore();
}
// flap falls back on a horizontal hinge at HY (strip-wise perspective)
function wallLayer(t){
  if(t<FLAP0){X.drawImage(wallC,0,0);return}
  X.drawImage(holeC,0,0);
}
function flapLayer(t){
  if(t<FLAP0||t>6.2)return;X.save();X.globalAlpha=1-seg(t,5.8,6.2);const XX=X;
  const ph=lerp(0,Math.PI/2*.985,eIn2(seg(t,FLAP0,FLAP1)))-(t>FLAP1?Math.sin((t-FLAP1)*18)*Math.exp(-(t-FLAP1)*9)*.08:0);
  const c=Math.cos(ph),s=Math.sin(ph),cx=PCX;
  for(let y=40;y<HY;y+=4){const h=HY-y,ny=HY-h*c,ws=1/(1+h*s*.0016);
    X.drawImage(flapC,0,y,W,4,cx-cx*ws,ny-4*c,W*ws,4*c+1.2)}
  X.save();X.globalCompositeOperation='multiply';X.fillStyle='#9a6040';X.beginPath();ARC.forEach((p,i)=>{const h=HY-p[1],ws=1/(1+h*s*.0016);const x=cx+(p[0]-cx)*ws,y=HY-h*c;i?X.lineTo(x,y):X.moveTo(x,y)});X.closePath();X.fill();X.restore();
  // torn paper thickness along the flap's cut edge
  X.save();X.lineJoin='round';X.beginPath();ARC.forEach((p,i)=>{const h=HY-p[1],ws=1/(1+h*s*.0016);const x=cx+(p[0]-cx)*ws+noise1(i*.9)*1.6,y=HY-h*c;i?X.lineTo(x,y):X.moveTo(x,y)});
  X.strokeStyle='#e8d2b0';X.lineWidth=3+7*s;X.globalAlpha=.9;X.stroke();X.restore();
  X.save();X.beginPath();ARC.forEach((p,i)=>{const h=HY-p[1],ws=1/(1+h*s*.0016);const x=cx+(p[0]-cx)*ws,y=HY-h*c;i?X.lineTo(x,y):X.moveTo(x,y)});X.closePath();X.clip();
  X.globalCompositeOperation='overlay';X.globalAlpha=.8;X.fillStyle=fibP;X.fillRect(0,0,W,FLOOR);X.restore();
  // shade the falling flap
  X.save();X.globalAlpha=.35+s*.6;X.fillStyle='#1a0806';
  X.beginPath();ARC.forEach((p,i)=>{const h=HY-p[1],ws=1/(1+h*s*.0016);const x=cx+(p[0]-cx)*ws,y=HY-h*c;i?X.lineTo(x,y):X.moveTo(x,y)});X.closePath();X.fill();X.restore();X.restore();
}
function charEdge(t){
  if(t<FLAP0)return;
  X.save();X.lineCap='round';X.lineJoin='round';
  X.strokeStyle='rgba(20,8,4,.9)';X.lineWidth=7;X.beginPath();ARC.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.stroke();
  const flick=.75+.25*noise1(t*9);
  glow(()=>ARC.forEach((p,i)=>i?X.lineTo(p[0]+noise1(i*.7+t*3)*1.5,p[1]-2):X.moveTo(p[0],p[1])),'#fff0c8','#ff8a3a','#ff3a10',2.6,flick);
  X.restore();
}
// ---------- lighting ----------
function lighting(t,tw){
  const f=flame(tw),lp=lightPos(tw);
  const A=t<IGN?1:0, B=t<IGN?0:1;
  X.save();X.globalCompositeOperation='multiply';
  if(A>0){
    const r=1350*f.I;const g=X.createRadialGradient(lp[0],lp[1],40,lp[0],lp[1],r);
    g.addColorStop(0,'#fff0d8');g.addColorStop(.22,'#eeb880');g.addColorStop(.5,'#6e4030');g.addColorStop(1,'#1a0e0a');
    X.globalAlpha=A;X.fillStyle=g;X.fillRect(-200,-200,W+400,H+400);
  }
  if(B>0){
    X.globalAlpha=B;
    // the wall facing us is NOT lit by the opening: it falls to silhouette
    const gw=X.createRadialGradient(PCX,HY-160,200,PCX,HY-160,1300);gw.addColorStop(0,'#6a3828');gw.addColorStop(.5,'#2e150e');gw.addColorStop(1,'#120605');
    X.fillStyle=gw;X.fillRect(-200,-200,W+400,FLOOR+200);
    // the floor catches the light pouring out
    const gf=X.createRadialGradient(PCX,FLOOR-40,40,PCX,FLOOR+80,1100);gf.addColorStop(0,'#fff4e4');gf.addColorStop(.45,'#f0a070');gf.addColorStop(1,'#3a1a10');
    X.fillStyle=gf;X.fillRect(-200,FLOOR,W+400,H);
  }
  X.restore();
  // dark-room floor: the gap between the two lights is darker
}

function tension(t){ // pressure builds at the scar origin
  const k=seg(t,4.55,4.88);if(k<=0)return;const p=ARC[0];
  flare(p[0],p[1],6+9*k*k,t,.3+.5*k,0);
}
function popAmt(t){return t<POP?(26*eIn2(seg(t,4.3,4.88))-5*Math.max(0,Math.sin((t-4.3)*31))*seg(t,4.4,4.88)):(t<CLICK-.09?48:lerp(48,0,eIn2(seg(t,CLICK-.09,CLICK))))}
function realEdge(t,tw){ // crisp steel line on the exposed real blade, drawn after bloom so the pop stays sharp
  if(t<4.4||t>CLICK)return;const out=popAmt(t);if(out<5)return;
  const a=(t<POP?.5+seg(t,4.4,4.88)*.9:1)*(t>POP+.6?.55:1);
  const tr=t>4.4&&t<POP?noise1(t*60)*seg(t,4.4,4.88)*7:0;
  edgeLine(KX+tr*.6,KY+tr*.3,KROTR,KS,-out+10,22,12,'#ffffff',a*1.3);
}
const FS_DY=200;
function floorSword(t){const u=eOut5(seg(t,7.75,7.84));return [KX+60*KS+lerp(0,150,u)*KS,KY,Math.PI+lerp(-.012,-.1,eOut(seg(t,7.78,7.9)))]}
function floorXf(){X.translate(PCX,FLOOR);X.scale(1.3,1.15);X.translate(-PCX,-FLOOR);X.translate(0,FS_DY)}
function floorEdge(t){ // final snap: the floor shadow's blade flashes the same crimson edge
  if(t<7.84||t>=BLACK)return;const k=1-seg(t,7.86,8.1)*.6;
  X.save();floorXf();const g=floorSword(t);edgeLine(g[0],g[1],g[2]-Math.PI/2,KS,12,K3.BLADE*.985,12,'#ffffff',(t<7.9?1.8:1)*k);X.restore();
}
// ======================= FRAME =======================
function render2(t){
  const tw=tau(t);
  const sp=shadowPose(t);
  // --- silhouette passes ---
  const shadowA=(1-seg(t,4.92,5.05));
  if(shadowA>0)silhouette(shx,shx,'#140a06',1.2,()=>drawShadowFigure(t,tw));
  const pop=popAmt(t);
  const tremble=t>4.4&&t<POP?noise1(t*60)*seg(t,4.4,4.88)*7:0;
  const floorShadowOut=pop; // clean ending: the floor shadow stays sheathed with the real sword
  if(t>IGN)silhouette(fsx,fsx,'#0c0403',1.6,()=>{floorXf();
    X.save();X.translate(0,-0);rack();X.restore();
    katana(KX,KY,KROTR,KS,{t:tw,out:floorShadowOut,charms:true})});
  if(t>IGN){silhouette(rimx,rimx,'#ffb070',0,()=>{X.translate(tremble*.6,tremble*.3);rack();realKatana(t,tw,pop)});
    edgeX.globalCompositeOperation='copy';edgeX.drawImage(rimC,0,-4);edgeX.globalCompositeOperation='destination-out';edgeX.drawImage(rimC,0,0);
    rimx.globalCompositeOperation='copy';rimx.drawImage(edgeC,0,0);rimx.globalCompositeOperation='source-over'}
  // --- scene ---
  X.setTransform(1,0,0,1,0,0);X.globalCompositeOperation='source-over';X.globalAlpha=1;X.fillStyle='#000';X.fillRect(0,0,W,H);
  camera(t);
  wallLayer(t);
  if(shadowA>0){X.save();X.beginPath();X.rect(-100,-100,W+200,FLOOR+100);X.clip();X.globalCompositeOperation='multiply';X.globalAlpha=.86*shadowA;X.drawImage(shC,0,0);X.restore()}
  if(t<IGN){scar(t);spatter(t)}
  X.drawImage(floorC,0,0);
  if(t>IGN){X.save();X.beginPath();X.rect(-200,FLOOR,W+400,H);X.clip();X.globalCompositeOperation='multiply';X.globalAlpha=.95*seg(t,IGN,5.3);X.drawImage(fsC,0,0);X.restore()}
  // real objects (rim light from the portal is drawn as an offset silhouette behind them)
  rack();
  X.save();X.translate(tremble*.6,tremble*.3);realKatana(t,tw,pop);X.restore();
  lighting(t,tw);
  if(t<IGN){shadowEdge(t,tw);tension(t)}
  if(t>=IGN)scar(t);
  if(t>=FLAP0){X.save();archPath(X);X.clip();portal(t);X.restore();flapLayer(t)}
  charEdge(t);
  if(t>FLAP0){X.save();X.globalCompositeOperation='lighter';const hg=X.createRadialGradient(PCX,HY-160,300,PCX,HY-160,1000);hg.addColorStop(0,`rgba(255,120,50,${.22*seg(t,FLAP0,5.6)})`);hg.addColorStop(1,'rgba(255,80,30,0)');X.fillStyle=hg;X.fillRect(-200,-200,W+400,FLOOR+200);X.restore()}
  // rim light on the real katana and rack
  if(t>IGN){X.save();X.globalCompositeOperation='lighter';X.globalAlpha=seg(t,IGN,5.2)*(.85+.15*noise1(t*8));X.drawImage(rimC,0,0);X.restore()}
  rays(t);
  if(t>POP+.05&&t<POP+.4){const u=seg(t,POP+.05,POP+.4);flare(KX+30*KS-4,KY,30*(1-u*.5),t,(1-u)*.9,0)}
  if(t>=CLICK-.004&&t<CLICK+.16){const u=seg(t,CLICK,CLICK+.16);flare(KX-22*KS,KY,40*(1-u*.5),t,(1-u)*(1-u)*1.25,.25*(1-u))}
  candle(t,tw);
  dust(t,tw);
  embers(t);scraps(t);
  X.setTransform(1,0,0,1,0,0);
  bloom(t>IGN?.26+.22*Math.exp(-(t-IGN)*5):.22);
  camera(t);realEdge(t,tw);X.setTransform(1,0,0,1,0,0);
  // grain + vignette
  X.save();X.globalCompositeOperation='overlay';X.globalAlpha=.35;const fr=Math.floor(t*24);
  X.drawImage(grainT,-(fr*137)%512,-(fr*61)%512,W+512,H+512);X.restore();
  vignette(.6);
  if(t>=IGN&&t<IGN+1/60){invertFrame()}
  if(t>=IGN+1/60&&t<IGN+.1){X.save();X.globalCompositeOperation='lighter';X.globalAlpha=.2*(1-seg(t,IGN,IGN+.1));X.fillStyle='#ffe8c8';X.fillRect(0,0,W,H);X.restore()}
  if(t>7.1&&t<BLACK){X.save();X.globalCompositeOperation='multiply';X.globalAlpha=.55*eOut(seg(t,7.1,7.6));const dg=X.createLinearGradient(0,0,0,H);dg.addColorStop(0,'#401810');dg.addColorStop(.55,'#8a5038');dg.addColorStop(1,'#ffffff');X.fillStyle=dg;X.fillRect(0,0,W,H);X.restore()}
  if(t>7.8&&t<BLACK){X.fillStyle='#000';X.globalAlpha=eIn(seg(t,7.8,BLACK));X.fillRect(0,0,W,H);X.globalAlpha=1}
  if(t>=BLACK-1e-6){X.fillStyle='#000';X.globalAlpha=1;X.fillRect(0,0,W,H)}
  X.globalAlpha=1;
}
window.render2=render2;
const CUTS=[IGN,BLACK];
window.render=t=>{const k=(t>3.37&&t<3.66)?1:(window.MBK||1);if(k<=1){render2(t);return}
  const sh=1/120;let lo=t-sh;for(const c of CUTS)if(c<=t+1e-9&&c>lo)lo=c;
  for(let i=k-1;i>=0;i--){const tt=t-(t-lo)*(i/(k-1));window.SUBI=i;render2(tt);accX.globalAlpha=1/(k-i);accX.drawImage(C,0,0)}
  window.SUBI=0;accX.globalAlpha=1;X.setTransform(1,0,0,1,0,0);X.globalCompositeOperation='copy';X.drawImage(acc,0,0);X.globalCompositeOperation='source-over'};
})();
