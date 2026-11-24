/* THE CUT ARRIVES LATE. Original choreography, procedural environment.
   Pure time sampling: no incremental physics, random state or accumulated transforms. */
(function(){
window.DUR=12;
HITS=[[3.34,3.5],[5.95,4],[6.98,11]];
const SCENE={cutA:[-300,1046],cutB:[2220,-12],slope:-.42,intercept:920,splitAt:6.98};
const paper=mk(W,H), px=paper.getContext('2d');
const architecture=mk(W,H), ax=architecture.getContext('2d');
const landscape=mk(W,H), lx=landscape.getContext('2d');
const terrace=mk(W,H), fx=terrace.getContext('2d');
const texture=mk(384,216), tx=texture.getContext('2d');
const R=rng(34691);
for(let i=0;i<18000;i++){
  tx.fillStyle=i%5?'rgba(35,28,28,.055)':'rgba(255,255,255,.18)';
  const x=R()*384,y=R()*216;
  tx.fillRect(x,y,R()*1.1+.2,R()*.55+.2);
}
const pigment=px.createLinearGradient(0,0,0,H);
pigment.addColorStop(0,'#e3dfd4');pigment.addColorStop(.45,'#f0ede4');pigment.addColorStop(1,'#ded8cb');
px.fillStyle=pigment;px.fillRect(0,0,W,H);
px.globalAlpha=.8;px.drawImage(texture,0,0,W,H);px.globalAlpha=1;
const ph=rng(90);
// Quiet print registration and fibrous marks, not a clean digital swatch.
for(let i=0;i<900;i++){
 const x=ph()*W,y=ph()*H;px.strokeStyle=`rgba(60,47,38,${.015+ph()*.035})`;
 px.lineWidth=.4+ph()*.8;px.beginPath();px.moveTo(x,y);px.lineTo(x+ph()*17-4,y+ph()*3);px.stroke();
}
// Vermilion sun, cropped by the upper mountain ridge.
px.fillStyle=RED;px.beginPath();px.arc(1420,286,163,0,TAU);px.fill();
px.save();px.clip();px.globalCompositeOperation='destination-out';
for(let i=0;i<230;i++){let yy=120+ph()*330;px.fillRect(1240+ph()*330,yy,ph()*30+1,.5+ph()*1.7)}
px.restore();px.globalCompositeOperation='source-over';
function mountain(g,y,amp,col,seed){
 const rr=rng(seed);g.fillStyle=col;g.beginPath();g.moveTo(-100,H+100);
 for(let x=-100;x<=W+100;x+=55)g.lineTo(x,y+Math.sin(x*.004+seed)*amp+Math.sin(x*.011+seed)*amp*.23+rr()*18);
 g.lineTo(W+100,H+100);g.closePath();g.fill();
}
mountain(lx,480,88,'#c9c5ba',17);mountain(lx,560,94,'#b5b2a7',4);mountain(lx,670,70,'#9c9e93',11);
// Dry-brush hillside hatch and distant reed beds.
const hr=rng(76);
for(let i=0;i<800;i++){
 const x=hr()*W,y=520+hr()*210;
 lx.strokeStyle=`rgba(52,56,50,${hr()*.14})`;lx.lineWidth=hr()*1.4+.4;lx.beginPath();lx.moveTo(x,y);
 lx.lineTo(x+12+hr()*48,y-5-hr()*17);lx.stroke();
}
// Foreground pale stone terrace occludes the bottom of the hills.
fx.fillStyle='#dfdacd';fx.beginPath();fx.moveTo(0,739);fx.quadraticCurveTo(900,695,1920,750);fx.lineTo(1920,1080);fx.lineTo(0,1080);fx.fill();
fx.strokeStyle='rgba(50,44,38,.19)';fx.lineWidth=1.3;
for(let y=770;y<1120;y+=53){fx.beginPath();fx.moveTo(0,y);fx.lineTo(W,y-10);fx.stroke()}
for(let x=-800;x<2800;x+=230){fx.beginPath();fx.moveTo(960+(x-960)*.27,730);fx.lineTo(x,H);fx.stroke()}
// Architecture: aged timber gate, asymmetric in the composition.
function timber(x,y,w,h){
 ax.fillStyle='#292925';ax.fillRect(x,y,w,h);ax.fillStyle='rgba(236,231,210,.16)';ax.fillRect(x+w*.72,y,2,h);
 for(let k=0;k<16;k++){const yy=y+k*h/16;ax.strokeStyle='rgba(0,0,0,.24)';ax.lineWidth=.8;ax.beginPath();ax.moveTo(x+3,yy);ax.bezierCurveTo(x+w*.4,yy+8,x+w*.4,yy+30,x+w-3,yy+36);ax.stroke()}
}
timber(260,248,33,518);timber(1602,248,33,518);
timber(240,270,1410,24);timber(240,347,1410,12);
// Swept roof edge, tapered ends.
ax.fillStyle='#262521';ax.beginPath();ax.moveTo(160,228);ax.quadraticCurveTo(940,300,1728,228);ax.lineTo(1684,262);ax.quadraticCurveTo(945,319,202,262);ax.closePath();ax.fill();
ax.strokeStyle='#8b8878';ax.lineWidth=2;ax.beginPath();ax.moveTo(215,253);ax.quadraticCurveTo(960,301,1680,253);ax.stroke();
for(let i=0;i<16;i++){const xx=350+i*75;ax.fillStyle='rgba(52,48,41,.13)';ax.fillRect(xx,362,2,320)}
// Small grass silhouettes establish grounding without competing with the weapon.
for(let i=0;i<65;i++){
 const x=100+hash(i*14)*1720,y=730+hash(i*4)*22;ax.strokeStyle='rgba(29,31,27,.5)';ax.lineWidth=.8+hash(i)*1.5;
 ax.beginPath();ax.moveTo(x,y);ax.quadraticCurveTo(x-3,y-12,x-5+hash(i+20)*12,y-22-hash(i+9)*22);ax.stroke();
}

function cutY(x){return SCENE.intercept+SCENE.slope*x}
function halfClip(side){
 X.beginPath();X.moveTo(-350,cutY(-350));X.lineTo(2270,cutY(2270));
 if(side<0){X.lineTo(2270,-600);X.lineTo(-350,-600)}else{X.lineTo(2270,1700);X.lineTo(-350,1700)}
 X.closePath();X.clip();
}
function offsets(t,depth,side){
 const u=eOut5(seg(t,SCENE.splitAt,9.35));
 const slip=eOut(seg(t,SCENE.splitAt+.12,8.75));
 const settle=seg(t,8.0,12);
 return side<0?[-(42*u+38*slip+25*settle)*depth,-(45*u+60*slip+12*settle)*depth]:[(65*u+48*slip+40*settle)*depth,(80*u+45*slip+20*settle)*depth];
}
function splitPlate(canvas,t,depth){
 for(const side of[-1,1]){
  const [dx,dy]=offsets(t,depth,side);
  X.save();X.translate(dx,dy);halfClip(side);X.drawImage(canvas,0,0);X.restore();
 }
}
function voidWorld(t){
 const g=X.createLinearGradient(0,1050,1500,100);g.addColorStop(0,'#31050e');g.addColorStop(.43,'#a40725');g.addColorStop(.6,'#e42a3b');g.addColorStop(1,'#39050c');X.fillStyle=g;X.fillRect(-400,-400,2700,1900);
 if(t<6.98)return;
 X.save();
 // A dark inner fault and flowing contour strata give the opening interior depth.
 X.fillStyle='#16070e';X.beginPath();
 for(let x=-500;x<2500;x+=55){const y=cutY(x)+26+Math.sin(x*.004+t*.25)*10;X.lineTo(x,y-21)}
 for(let x=2500;x>-500;x-=55){const y=cutY(x)+26+Math.sin(x*.004+t*.25)*10;X.lineTo(x,y+21)}
 X.closePath();X.fill();
 for(let k=0;k<7;k++){
  X.beginPath();for(let x=-500;x<2500;x+=70){const y=cutY(x)+k*13-28+Math.sin(x*.003+t*.23+k)*8;X.lineTo(x,y)}
  X.strokeStyle=k%2?'rgba(255,154,112,.12)':'rgba(20,7,14,.23)';X.lineWidth=1+k*.3;X.stroke();
 }
 for(let i=0;i<48;i++){
  let q=(hash(i)*2+(t-6.98)*(.2+hash(i+7)*.4))%2;
  const x=q*W,y=cutY(x)+(hash(i+22)-.5)*125;
  X.strokeStyle=`rgba(255,174,117,${.08+hash(i+6)*.16})`;X.lineWidth=.5+hash(i)*2;
  X.beginPath();X.moveTo(x,y);X.lineTo(x+15+hash(i+4)*90,y-6-hash(i+3)*28);X.stroke();
 }X.restore();
}
function thread(t){
 const cx=1170,cy=cutY(cx);
 // Shared split plane, with a separate gravity term only on the severed lower strand.
 for(const side of[-1,1]){
  let [dx,dy]=offsets(t,1.38,side);
  const dt=Math.max(0,t-7.03);
  if(side>0){dy+=dt*dt*200;dx+=Math.sin(dt*3)*dt*20}
  X.save();X.translate(dx,dy);
  const tremble=seg(t,6.12,6.9);
  const sway=(Math.sin(t*2.5)*(4+8*seg(t,1,3.1))+Math.sin(t*14)*14*tremble)*(1-seg(t,6.98,7.3));
  const path=()=>{X.beginPath();if(side<0){X.moveTo(cx,-100);X.bezierCurveTo(cx+5,80,cx+sway,260,cx,cy)}else{X.moveTo(cx,cy);X.bezierCurveTo(cx-sway,cy+35,cx+sway,560,cx,594)}};
  path();X.strokeStyle='#31181b';X.lineWidth=4.7;X.stroke();path();X.strokeStyle=RED;X.lineWidth=2.4;X.stroke();
  if(side>0){
   X.strokeStyle=INK;X.lineWidth=2;X.fillStyle=GOLD;X.beginPath();X.ellipse(cx,602,5.5,8,0,0,TAU);X.fill();X.stroke();
   X.strokeStyle=RED;X.lineWidth=2;for(let i=-3;i<=3;i++){X.beginPath();X.moveTo(cx,610);X.quadraticCurveTo(cx+i,620,cx+i*2.4+Math.sin(t*2+i)*1.4,636);X.stroke()}
  }X.restore();
 }
}
function dust(t,foreground=false){
 const n=foreground?30:48;
 for(let i=0;i<n;i++){
  const x=hash(i*3.7+9)*W+Math.sin(t*.25+i)*8;
  const y=(hash(i*5.3+7)*H-t*(foreground?8:2)+H*3)%H;
  X.fillStyle=foreground?'rgba(30,24,19,.18)':'rgba(37,26,16,.11)';
  X.fillRect(x,y,foreground?2:1.2,foreground?1.5:.8);
 }
}
function gather(t){
 if(t>3.25)return;
 const a=seg(t,.1,.65)*(1-seg(t,2.98,3.25));
 if(a<=0)return;
 X.save();X.translate(716,623);X.scale(.66,.45);
 gatherLines(t,.05,0,0,82,'ink',a*.84,.85);X.restore();
}
function bladeOut(t){
 const reveal=44*eOut5(seg(t,3.08,3.34))*(1-eIn2(seg(t,4.35,5.95)));
 return reveal-4*Math.sin(Math.PI*seg(t,5.95,6.02));
}
function hero(t){
 const o=bladeOut(t),gl=seg(t,3.05,3.3)*(1-seg(t,3.55,3.9));
 X.save();
 // Broad terrace shadow and two carved display cradles.
 X.translate(810,798);X.rotate(.12);
 const sh=X.createRadialGradient(0,0,10,0,0,670);sh.addColorStop(0,'rgba(30,21,20,.26)');sh.addColorStop(1,'rgba(30,21,20,0)');
 X.scale(1,.055);X.fillStyle=sh;X.fillRect(-700,-700,1400,1400);X.restore();
 const [standX,standY]=offsets(t,1.28,1);
 // Once the floor starts slipping away, the supports fall out of the closing composition.
 X.save();X.translate(standX,standY+700*eIn2(seg(t,8.7,9.55)));
 for(const[cx,cy,base]of[[1001,657,817],[1470,713,850]]){
  X.save();X.fillStyle='#25221e';X.strokeStyle='#141014';X.lineWidth=3;
  X.beginPath();X.moveTo(cx-10,cy+20);X.lineTo(cx+10,cy+20);X.lineTo(cx+15,base);X.lineTo(cx-15,base);X.closePath();X.fill();X.stroke();
  X.beginPath();X.moveTo(cx-36,cy-18);X.quadraticCurveTo(cx-28,cy+44,cx,cy+28);X.quadraticCurveTo(cx+28,cy+44,cx+36,cy-18);X.lineTo(cx+27,cy-21);X.quadraticCurveTo(cx+20,cy+24,cx,cy+14);X.quadraticCurveTo(cx-20,cy+24,cx-27,cy-21);X.closePath();X.fill();X.stroke();
  X.fillStyle='#393028';X.beginPath();X.roundRect(cx-57,base-2,114,17,4);X.fill();X.stroke();
  X.strokeStyle='rgba(217,164,65,.42)';X.lineWidth=1.6;X.beginPath();X.moveTo(cx+8,cy+35);X.lineTo(cx+10,base-7);X.stroke();X.restore();
 }
 X.restore();
 const rot=.12-Math.PI/2;
 SAGEO_UP=.13+Math.sin(t*1.25)*.025;OFUDA_A=0;
 katana(716,623,rot,1.28,{t,out:o,charms:true});
 if(gl>0){
  const xx=716-Math.cos(.12)*o*1.28,yy=623-Math.sin(.12)*o*1.28;
  glow(()=>{X.moveTo(xx-3,yy-22);X.lineTo(xx+32,yy+19)},'#fff8de','#ffb464',RED,1.2,gl*.6);
 }
 // Travel of a restrained reflection makes the held steel feel metallic.
 if(t>3.45&&t<4.35){
  const u=seg(t,3.45,4.35),xx=669+u*39,yy=615+u*5;
  glow(()=>{X.moveTo(xx-2,yy-15);X.lineTo(xx+1,yy+15)},'#fffceb','#fff3c1',GOLD,1,Math.sin(Math.PI*u)*.65);
 }
 if(t>=5.95&&t<6.15){
  const u=seg(t,5.95,6.15);
  flare(733,624,24*(1-u),t,(1-u)*.8);
  X.save();X.translate(733,624);X.rotate(.12);X.scale(.42,1);
  X.strokeStyle=GOLD;X.globalAlpha=(1-u)*.85;X.lineWidth=2;
  X.beginPath();X.arc(0,0,8+eOut(u)*73,0,TAU);X.stroke();X.restore();
 }
}
function fineSlash(t){
 const d=t-3.34;if(d<0||d>.23)return;
 X.save();X.globalAlpha=(1-d/.23)*.65;
 // Begin at the exposed blade, using exactly the world's common cut line.
 const origin=681,end=lerp(origin,2170,eOut5(seg(t,3.34,3.41)));
 glow(()=>{X.moveTo(origin,cutY(origin));X.lineTo(end,cutY(end))},'#fff9e9','#ffc493',RED,2.3,1);
 if(d<.12)flare(end,cutY(end),8,t,(1-d/.12)*.7);
 X.restore();
}
function premonition(t){
 if(t<6.43||t>=6.98)return;
 const u=seg(t,6.43,6.98),len=eIn(u)*1520;
 X.save();X.globalAlpha=u*.38;X.strokeStyle=RED;X.lineWidth=1.6;
 X.beginPath();X.moveTo(681-len*.4,cutY(681-len*.4));X.lineTo(681+len*.6,cutY(681+len*.6));X.stroke();X.restore();
}
function severedEdges(t){
 const a=eOut(seg(t,6.98,7.16))*(1-seg(t,11.4,12));
 if(a<=0)return;
 X.save();X.globalAlpha=a;
 for(const side of[-1,1]){
  const [dx,dy]=offsets(t,1,side);X.save();X.translate(dx,dy);
  X.beginPath();X.moveTo(-300,cutY(-300));X.lineTo(2220,cutY(2220));X.strokeStyle=side<0?'#30211e':'#fff3d5';X.lineWidth=side<0?4:3;X.stroke();X.restore();
 }
 // Fragmented paper chips are a result of the cut, not generic circular particles.
 for(let i=0;i<58;i++){
  const d=t-6.98-hash(i+60)*.23;if(d<0)continue;
  const xx=hash(i*9)*W,yy=cutY(xx),vx=(hash(i+5)-.5)*180,vy=(hash(i+3)-.5)*170;
  const x=xx+vx*d,y=yy+vy*d+50*d*d,size=2+hash(i+21)*7;
  X.save();X.translate(x,y);X.rotate(d*(hash(i)-.5)*6);X.fillStyle=i%3?'#ebe5d5':RED;
  X.beginPath();X.moveTo(-size,0);X.lineTo(size*.4,-size*.45);X.lineTo(size,size*.3);X.lineTo(-size*.2,size*.7);X.fill();X.restore();
 }X.restore();
}
function title(t){
 if(t<9.35)return;
 const u=eOut5(seg(t,9.35,9.62));
 X.save();X.translate(960,916+(1-u)*18);X.globalAlpha=u;
 X.fillStyle=INK;X.textAlign='center';X.textBaseline='middle';X.font='132px FilmSerif,Georgia,serif';
 X.fillText('The cut arrives late.',0,0);
 X.restore();
}
function render2(t){
 t=clamp(t,0,12);X.setTransform(1,0,0,1,0,0);X.globalAlpha=1;X.globalCompositeOperation='source-over';X.filter='none';X.clearRect(0,0,W,H);
 const macro=t>=3.02&&t<6.08;
 const zoom=macro?lerp(2.22,2.33,seg(t,3.02,6.08)):lerp(1.02,1.09,eIO(seg(t,0,3.0)))*(1+.035*seg(t,6.08,6.98))*(1-.075*eOut(seg(t,6.98,9.4)));
 const [sx,sy,sr]=shake(t);
 X.save();X.translate(W/2+sx,H/2+sy);X.rotate(sr);
 X.scale(zoom,zoom);X.translate(macro?-737:-960,macro?-614:-540);
 voidWorld(t);
 splitPlate(paper,t,.58);
 splitPlate(landscape,t,.85);
 splitPlate(terrace,t,1.28);
 splitPlate(architecture,t,1.10);
 dust(t);thread(t);gather(t);hero(t);fineSlash(t);premonition(t);severedEdges(t);
 dust(t,true);X.restore();
 // The title belongs to the resolved picture and is stable in screen space.
 title(t);
 vignette(.13);
}
// Reset explicit state also at frame zero for reliable forward/reverse seek.
window.render2=render2;
window.render=t=>{
 if(t===0)C.width=W;
 const cut=t>=6.08?6.08:t>=3.02?3.02:0;
 // Shutter samples may not cross an editorial camera cut.
 renderMB(t,window.MBK||1,Math.min(1/120,Math.max(0,t-cut)));
};
})();
