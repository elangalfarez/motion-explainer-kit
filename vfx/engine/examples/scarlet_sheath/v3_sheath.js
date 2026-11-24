// ============================================================
//  V3 SHEATHE SEQUENCE (10.3 – 14.6) — every key below was read
//  off the original at 30fps on a 192x108 grid (see ref/g_*.jpg).
// ============================================================
const D2R=Math.PI/180;
// flat paper like the original (≈ rgb 228-241, faint dot grid, no hotspot)
paperBG2=function(){X.fillStyle='#e8e7e3';X.fillRect(0,0,W,H);
  const g=X.createRadialGradient(W*.5,H*.38,150,W*.5,H*.5,1150);g.addColorStop(0,'rgba(255,255,255,.32)');g.addColorStop(1,'rgba(120,115,110,.10)');X.fillStyle=g;X.fillRect(0,0,W,H);
  X.fillStyle=gridPat;X.globalAlpha=.6;X.fillRect(0,0,W,H);X.globalAlpha=1};

// sword: tsuba x, y, blade direction (deg)    [measured]
const SW3=[[10.30,930,120,78],[10.45,1190,140,84],[10.50,1152,216,80],[10.533,1080,216,43],[10.566,1056,190,26],[10.60,1114,232,7.5],[10.633,1180,214,-3],
  [10.666,1170,176,-2],[10.70,1100,194,0],[10.733,1150,236,7],[10.766,1152,270,28],[10.80,1160,324,68],[10.833,1267,420,101],[10.866,1350,450,124],
  [10.90,1340,440,132],[10.933,1330,480,140],[10.966,1380,520,152],[11.0,1396,563,158]];
// saya: koiguchi x, y, direction toward kojiri (deg)
const SY3=[[10.0,470,930,163],[10.30,560,860,163],[10.60,575,845,163],[10.90,770,690,160],[11.0,839,630,158],[11.25,967,551,159],[11.32,975,544,159],[11.6,985,540,159],[11.98,990,538,159]];
// after 11.0 the sword is driven relative to the saya axis: d = distance back along axis, p = perpendicular offset, da = extra angle
const SLIDE=[[11.0,524,128,0],[11.25,605,77,4],[11.3,661,68,5],[11.4,572,25,2],[11.42,545,14,1]];
const SCL3=.9;
function sayaPose(t){const[x,y,a]=kf(t,SY3);return[x,y,a]}
function sheathedTsuba(t){const[kx,ky,a]=sayaPose(t);return[kx-Math.cos(a*D2R)*K3.SAYA0*SCL3,ky-Math.sin(a*D2R)*K3.SAYA0*SCL3,a]}
function swordPose3(t){
  if(t<11.0)return cr(t,SW3);
  const[sx,sy,a]=sheathedTsuba(t);const dx=-Math.cos(a*D2R),dy=-Math.sin(a*D2R);
  let d,p,da;
  if(t<11.42){[d,p,da]=cr(t,SLIDE)}
  else{const u=seg(t,11.42,11.47);d=lerp(545,0,eIn2(u));p=lerp(14,0,u);da=lerp(1,0,u)}
  // perpendicular (screen-down side of the axis)
  const px=-dy,py=dx; // rotate dir by -90 → points below axis for a≈160
  return[sx+dx*d+px*p,sy+dy*d+py*p,a+da];
}
// red crescent smear swept by the tip (motion trail)
function crescent3(t){
  const N=16,dt=.0085,tips=[],inn=[];
  for(let i=0;i<=N;i++){const tt=t-i*dt;if(tt<10.3)break;const[x,y,a]=swordPose3(tt);const c=Math.cos(a*D2R),s=Math.sin(a*D2R);
    tips.push([x+c*K3.BLADE*SCL3,y+s*K3.BLADE*SCL3]);inn.push([x+c*K3.BLADE*SCL3*.72,y+s*K3.BLADE*SCL3*.72])}
  if(tips.length<4)return;
  let sp=0;for(let i=1;i<tips.length;i++)sp+=Math.hypot(tips[i][0]-tips[i-1][0],tips[i][1]-tips[i-1][1]);
  const k=clamp((sp-120)/380);if(k<=0)return;
  X.save();X.globalAlpha=clamp(k*3);
  // crescent: outer edge = tip path, inner edge closes toward the tip path at the tail (tapered)
  const n=tips.length,P=[];
  for(let i=0;i<n;i++)P.push(tips[i]);
  for(let i=n-1;i>=0;i--){const u=i/(n-1),w=(Math.sin(Math.PI*Math.pow(1-u,.6))*.24+.02)*(.25+.75*k);P.push([lerp(tips[i][0],inn[i][0],w),lerp(tips[i][1],inn[i][1],w)])}
  X.fillStyle='#d61c22';X.beginPath();P.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.closePath();X.fill();
  X.fillStyle='rgba(255,90,80,.55)';X.beginPath();for(let i=0;i<n;i++){const u=i/(n-1),w=Math.sin(Math.PI*Math.pow(1-u,.6))*.08;const q=[lerp(tips[i][0],inn[i][0],w),lerp(tips[i][1],inn[i][1],w)];i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1])}for(let i=n-1;i>=0;i--)X.lineTo(tips[i][0],tips[i][1]);X.closePath();X.fill();
  X.strokeStyle=OUT;X.lineWidth=2.2;X.beginPath();tips.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.stroke();
  // thin echo lines just outside the crescent
  X.globalAlpha=k*.6;X.lineWidth=1.3;for(const o of[1.035,1.07]){X.beginPath();tips.slice(0,Math.floor(n*.7)).forEach((p,i)=>{const[x,y]=swordPose3(t-i*dt);const q=[x+(p[0]-x)*o,y+(p[1]-y)*o];i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1])});X.stroke()}
  X.restore();
}
// blade glint: orange halo + white flare travelling tip→tsuba while it slides home
function glint3(x,y,a,t){
  const u=seg(t,11.24,11.47);if(u<=0||u>=1)return;
  const along=lerp(.15,.98,eIn2(u))*K3.BLADE*SCL3;const c=Math.cos(a*D2R),s=Math.sin(a*D2R);
  const fx=x+c*(K3.BLADE*SCL3-along),fy=y+s*(K3.BLADE*SCL3-along);
  flare(fx,fy,lerp(28,60,u),t,.75*Math.sin(Math.PI*u),0);
}
const SPRAY=[...Array(140)].map((_,i)=>({t0:10.5+hash(i*1.7)*.45,vx:(hash(i*2.3)-.3)*260,vy:(hash(i*3.1)-.45)*200,s:2+hash(i*4.7)*5.5,u:.8+hash(i*5.9)*.2}));
function spray3(t){for(const p of SPRAY){if(t<p.t0)continue;const[x,y,a]=swordPose3(p.t0);const c=Math.cos(a*D2R),s=Math.sin(a*D2R);const L=K3.BLADE*SCL3*p.u,T=t-p.t0;
  X.fillStyle=hash(p.s)<.8?'rgba(214,28,34,.9)':'rgba(30,20,22,.85)';X.beginPath();X.arc(x+c*L+p.vx*T,y+s*L+p.vy*T+40*T*T,p.s*(1-.3*seg(T,0,1)),0,TAU);X.fill()}}
function swordAct3(t){
  spray3(t);crescent3(t);
  const[x,y,a]=swordPose3(t);
  const gA=t>11.2&&t<11.5?Math.sin(Math.PI*seg(t,11.2,11.5)):0;
  sword3(x,y,a*D2R,SCL3,gA*.9);
  glint3(x,y,a,t);
}
// overrides: the I→J hand-off uses the same keys
swordAct=function(t){if(t>=10.3)swordAct3(t);else{const[x,y,a]=cr(t,SWING);sword3(x,y,a,SCL3)}};
function drawSayaJ(t){SAGEO_UP=0;OFUDA_A=0;const[kx,ky,a]=sayaPose(t);saya3(kx,ky,a*D2R,SCL3,t,true)}

// arc band: red ink lines (same curve as v2 redBand) → white-hot band on lock
function arcCurve(o=0){X.moveTo(-1150,-40+o);X.quadraticCurveTo(0,-190+o,1150,-150+o*.8)}
function hotBand3(t){
  const a=seg(t,11.5,11.56)*(1-seg(t,11.86,12.0));if(a<=0)return;
  const w=t<11.62?lerp(20,74,eOut(seg(t,11.5,11.62))):lerp(74,10,eIn2(seg(t,11.62,11.95)));
  X.save();X.translate(960,600);X.rotate(-.34);X.globalAlpha=a;X.lineCap='round';
  X.strokeStyle='rgba(225,40,30,.75)';X.lineWidth=w*1.25;X.beginPath();arcCurve(18);X.stroke();
  X.strokeStyle='#ff6a3a';X.lineWidth=w;X.beginPath();arcCurve(18);X.stroke();
  X.strokeStyle='#ffc890';X.lineWidth=w*.55;X.beginPath();arcCurve(18);X.stroke();
  X.strokeStyle='#fffaf0';X.lineWidth=Math.max(2,w*.22);X.beginPath();arcCurve(18);X.stroke();
  // ember specks riding the band
  X.fillStyle='rgba(200,20,30,.9)';for(let i=0;i<40;i++){const u=hash(i*3.1),x=lerp(-1100,1100,u),y=lerp(-40,-150,u)-Math.sin(u*Math.PI)*95+18+(hash(i)-.5)*w*1.3;X.beginPath();X.arc(x,y,2+hash(i+4)*3,0,TAU);X.fill()}
  X.restore();
}
function ring3(cx,cy,t){
  const k=seg(t,11.64,11.98);if(k<=0||k>=1)return;
  const r=lerp(55,430,eOut(k)*.85+k*.15);
  X.save();X.globalAlpha=1-seg(t,11.8,11.98);X.strokeStyle='#c8242c';X.lineWidth=lerp(6,2.5,k);X.beginPath();X.arc(cx,cy,r,0,TAU);X.stroke();
  X.strokeStyle='rgba(200,36,44,.35)';X.lineWidth=1.2;X.beginPath();X.arc(cx,cy,r*.94,0,TAU);X.stroke();
  // spikes radiating inside the ring
  const sk=1-seg(t,11.72,11.9);if(sk>0)for(let i=0;i<22;i++){const a=hash(i*7)*TAU,r0=r*(.12+hash(i)*.25),r1=r*(.55+hash(i+3)*.4);
    X.globalAlpha=sk*(i%3?.8:.5);X.strokeStyle=i%4==0?'#c8242c':OUT;X.lineWidth=1+hash(i+9)*2.4;X.beginPath();X.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);X.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);X.stroke()}
  X.restore();
}
function inkField(t,a=1){for(let i=0;i<70;i++){const x=hash(i)*W+Math.sin(t*.7+i)*14,y=hash(i+40)*H+Math.cos(t*.6+i)*10;X.globalAlpha=a;X.fillStyle=i%4==0?'rgba(20,16,20,.85)':i%4==1?'rgba(140,135,135,.5)':'rgba(205,20,32,.8)';X.beginPath();X.arc(x,y,(i%4==0?7:3)+hash(i+9)*4,0,TAU);X.fill()}X.globalAlpha=1}

shotJ=function(t){
  paperBG2();
  redBand(1-seg(t,11.55,11.62));
  inkField(t);
  hotBand3(t);
  if(t<11.47){swordAct3(t);drawSayaJ(t)}
  else{const[x,y,a]=sheathedTsuba(t);
    // settle: tiny recoil along the axis after the lock
    const rc=Math.sin(Math.PI*seg(t,11.47,11.56))*10;const c=Math.cos(a*D2R),s=Math.sin(a*D2R);
    SAGEO_UP=eOut(seg(t,11.47,11.6));const ok=seg(t,11.62,11.72);OFUDA_A=ok;OFUDA_S=lerp(1.4,1,eOut(ok));
    katana(x+c*rc,y+s*rc,a*D2R-Math.PI/2,SCL3,{t});OFUDA_S=1;
    if(t<11.56)flare(x,y,lerp(150,40,seg(t,11.47,11.56)),t,1-seg(t,11.47,11.56),.6);
    spray3(t);ring3(x,y,t)}
};
// ============================================================
//  SHOT K  12.0 – 14.6  close-up push → whip upright → stamp
// ============================================================
const CU3=[[12.0,1290,450,1.25,1.70],[12.05,1314,435,1.24,1.73],[12.3,1575,345,1.22,1.85],[12.55,1770,255,1.19,1.87],[12.6,1712,226,1.10,1.80],
  [12.7,1354,90,.77,1.50],[12.766,1133,140,.46,1.32],[12.8,1037,216,.34,1.22],[12.833,998,270,.27,1.15],[12.866,960,322,.13,1.08],[12.9,915,352,-.04,1.0],
  [12.933,890,366,-.12,.93],[12.966,885,377,-.16,.915],[13.0,895,382,-.21,.91],[13.1,887,376,-.34,.91],[13.2,881,371,-.43,.91],[14.6,881,371,-.445,.91]];
shotK=function(t){
  paperBG2();
  for(let i=0;i<30;i++){const x=hash(i)*W+Math.sin(t+i)*20,y=(hash(i+40)*H-(t-12)*30*hash(i+3)+H*3)%H;X.fillStyle=i%3?'rgba(200,20,30,.75)':'rgba(120,110,110,.5)';X.globalAlpha=1-seg(t,12.6,12.9);X.beginPath();X.arc(x,y,2+hash(i+9)*4,0,TAU);X.fill()}X.globalAlpha=1;
  const[x,y,rot,s]=cr(t,CU3);OFUDA_A=1;SAGEO_UP=1-sm(seg(t,12.55,12.75));
  katana(x,y,rot,s,{t});
  if(t>13.22){const p=seg(t,13.22,13.36);const sc=lerp(1.6,1,eOut5(p));stamp(1268,700,sc,lerp(.25,1,sm(p)),t);
    if(t>13.33){const k=eOut(seg(t,13.33,13.7));for(const sp of splat){const d=sp.d*k;X.fillStyle=`rgba(200,20,28,${.85*(1-seg(t,13.6,14.2))})`;X.beginPath();X.arc(1268+Math.cos(sp.a)*d*1.2,700+Math.sin(sp.a)*d,sp.s*(1-k*.3),0,TAU);X.fill()}}}
};

// keep v2's shot I (halftone shatter) in sync with the new saya keys
SHEATH.length=0;for(let tt=9.9;tt<=11.7;tt+=.04){const[x,y,a]=sheathedTsuba(tt);SHEATH.push([tt,x,y,a*D2R])}

{const _I=shotI;shotI=function(t){OFUDA_A=0;SAGEO_UP=0;_I(t)}}
{const _A=shotA;shotA=function(t){OFUDA_A=1;SAGEO_UP=0;_A(t)}}
