// ============================================================
//  V3 KATANA — redrawn from the original's close-up (12.1s):
//  curved saya + blade, cream X-wrap tsuka, black-rimmed gold
//  tsuba, carbon mouth, glossy twisted lacquer, kintsugi, red
//  ribbed foot, chamfered gold kojiri, world-vertical ofuda,
//  sageo cord rising to a tassel.  Local: tsuba (0,0), hilt -y,
//  blade/saya +y. Local -x = "top" side when lying at ~160deg.
// ============================================================
const K3={HILT:245,BLADE:680,SAYA0:22,SAYA1:722,SORI:11,SW:18,HW:19};
const OUT='#121014';
// centreline bow (both blade and saya bow toward local -x)
function bow(y){const u=clamp(y/K3.SAYA1,0,1);return -K3.SORI*4*u*(1-u)}
function sayaHW(y){return lerp(K3.SW,K3.SW-3,clamp((y-K3.SAYA0)/(K3.SAYA1-K3.SAYA0)))}
function bandPath(y0,y1,hw,n=24){ // closed polygon around curved centreline between y0..y1
  X.beginPath();
  for(let i=0;i<=n;i++){const y=lerp(y0,y1,i/n);X.lineTo(bow(y)-hw(y),y)}
  for(let i=n;i>=0;i--){const y=lerp(y0,y1,i/n);X.lineTo(bow(y)+hw(y),y)}
  X.closePath();
}
function goldFill(x0,x1){const g=X.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'#8a5a14');g.addColorStop(.28,'#f3cf72');g.addColorStop(.5,'#d9a441');g.addColorStop(1,'#7a4c10');return g}
function goldBand(y0,y1,extra=2.5){bandPath(y0,y1,y=>sayaHW(y)+extra,4);X.fillStyle=goldFill(-K3.SW-3,K3.SW+3);X.fill();X.lineWidth=3.2;X.strokeStyle=OUT;X.stroke()}

function drawSaya3(t){
  const y0=K3.SAYA0,y1=K3.SAYA1;
  // body
  bandPath(y0,y1-30,sayaHW);
  const bg=X.createLinearGradient(-K3.SW,0,K3.SW,0);bg.addColorStop(0,'#2a2630');bg.addColorStop(.3,'#0c0a0e');bg.addColorStop(.75,'#141118');bg.addColorStop(1,'#050406');
  X.fillStyle=bg;X.fill();
  X.save();X.clip();
  // carbon diamond weave near the mouth
  X.strokeStyle='rgba(120,118,128,.42)';X.lineWidth=1.1;
  for(let k=-12;k<20;k++){X.beginPath();X.moveTo(-K3.SW-12,46+k*7);X.lineTo(K3.SW+12,46+k*7+28);X.stroke();X.beginPath();X.moveTo(K3.SW+12,46+k*7);X.lineTo(-K3.SW-12,46+k*7+28);X.stroke()}
  X.fillStyle='#0d0b10';X.fillRect(-40,165,80,y1);
  // glossy twisted sheen (rope-like diagonal highlights)
  for(let y=170;y<548;y+=34){const c=bow(y+10);
    const g=X.createLinearGradient(c-K3.SW,y,c+K3.SW,y+30);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.4,'rgba(90,80,100,.35)');g.addColorStop(.55,'rgba(170,165,185,.42)');g.addColorStop(1,'rgba(255,255,255,0)');
    X.fillStyle=g;X.beginPath();X.moveTo(c-K3.SW-2,y);X.quadraticCurveTo(c,y+8,c+K3.SW+2,y+20);X.lineTo(c+K3.SW+2,y+30);X.quadraticCurveTo(c,y+20,c-K3.SW-2,y+10);X.closePath();X.fill()}
  // long specular streak on the top edge
  X.strokeStyle='rgba(255,255,255,.18)';X.lineWidth=3;X.beginPath();for(let y=50;y<540;y+=10)X.lineTo(bow(y)-K3.SW*.55,y);X.stroke();
  // kintsugi gold cracks
  X.strokeStyle='#e6b54e';X.lineWidth=2.4;X.lineJoin='round';X.beginPath();
  const cr1=[[-14,205],[-4,236],[6,250],[-2,284],[10,318],[3,352]],cr2=[[12,380],[2,414],[-9,430],[-3,470],[-12,500]],cr3=[[-6,236],[-15,262]],cr4=[[6,250],[16,270]];
  for(const c of[cr1,cr2,cr3,cr4]){c.forEach((p,i)=>{const x=p[0]+bow(p[1]);i?X.lineTo(x,p[1]):X.moveTo(x,p[1])})}X.stroke();
  X.strokeStyle='rgba(255,240,190,.6)';X.lineWidth=.9;X.stroke();
  X.restore();
  bandPath(y0,y1-30,sayaHW);X.lineWidth=4.2;X.strokeStyle=OUT;X.stroke();
  // red ribbed foot
  const r0=558,r1=y1-30;bandPath(r0,r1,y=>sayaHW(y)+.5,8);
  const rg=X.createLinearGradient(-K3.SW,0,K3.SW,0);rg.addColorStop(0,'#5a0710');rg.addColorStop(.3,'#c8202c');rg.addColorStop(.6,'#8e0f1a');rg.addColorStop(1,'#3a0408');X.fillStyle=rg;X.fill();
  X.save();X.clip();for(let y=r0;y<r1;y+=9){const c=bow(y);X.fillStyle='rgba(30,0,4,.55)';X.beginPath();X.moveTo(c-K3.SW-2,y+3);X.lineTo(c+K3.SW+2,y);X.lineTo(c+K3.SW+2,y+3);X.lineTo(c-K3.SW-2,y+6);X.closePath();X.fill();
    X.fillStyle='rgba(255,140,140,.35)';X.fillRect(c-K3.SW*.6,y+5,K3.SW*.5,2)}X.restore();
  bandPath(r0,r1,y=>sayaHW(y)+.5,8);X.lineWidth=3.6;X.strokeStyle=OUT;X.stroke();
  // gold fittings
  goldBand(y0,y0+24,3);goldBand(182,198,2.5);goldBand(545,560,2);
  // kojiri (chamfered gold cap)
  {const a=y1-32,b=y1,c=bow(a),hw=sayaHW(a)+1.5;X.beginPath();X.moveTo(c-hw,a);X.lineTo(c+hw,a);X.lineTo(c+hw-2,b-10);X.lineTo(c+hw*.35,b);X.lineTo(c-hw+1,b-4);X.closePath();
   X.fillStyle=goldFill(c-hw,c+hw);X.fill();X.lineWidth=3.6;X.strokeStyle=OUT;X.stroke();X.fillStyle='rgba(255,250,220,.55)';X.fillRect(c-hw*.55,a+4,4,b-a-12)}
  // kurikata knob + bead where the cord ties
  X.fillStyle=goldFill(K3.SW,K3.SW+12);X.beginPath();X.ellipse(bow(190)+K3.SW+6,192,8,8,0,0,TAU);X.fill();X.lineWidth=2.5;X.strokeStyle=OUT;X.stroke();
}
function drawHilt3(){
  const y0=-22,y1=-K3.HILT+20,hw=K3.HW;
  roundRect(-hw,y1,hw*2,y0-y1,5);X.fillStyle='#3a0c12';X.fill();
  X.save();roundRect(-hw,y1,hw*2,y0-y1,5);X.clip();
  const P=40;
  for(let y=y1-6;y<y0;y+=P){
    // red diamonds left/right gaps
    X.fillStyle='#7d1420';
    // cream X bands
    X.fillStyle='#f1e9d6';X.strokeStyle=OUT;X.lineWidth=2;
    X.beginPath();X.moveTo(-hw-2,y);X.lineTo(hw+2,y+P*.8);X.lineTo(hw+2,y+P*.8+15);X.lineTo(-hw-2,y+15);X.closePath();X.fill();X.stroke();
    X.beginPath();X.moveTo(hw+2,y);X.lineTo(-hw-2,y+P*.8);X.lineTo(-hw-2,y+P*.8+15);X.lineTo(hw+2,y+15);X.closePath();X.fill();X.stroke();
    X.fillStyle='rgba(120,100,80,.25)';X.fillRect(-hw,y+P*.4,hw*2,3);
    X.fillStyle='#b01a26';X.beginPath();X.moveTo(0,y+P*.55);X.lineTo(5,y+P*.55+5);X.lineTo(0,y+P*.55+10);X.lineTo(-5,y+P*.55+5);X.closePath();X.fill();
  }
  // side shading
  const sg=X.createLinearGradient(-hw,0,hw,0);sg.addColorStop(0,'rgba(0,0,0,.25)');sg.addColorStop(.35,'rgba(255,255,255,.1)');sg.addColorStop(1,'rgba(0,0,0,.35)');X.fillStyle=sg;X.fillRect(-hw,y1,hw*2,y0-y1);
  X.restore();
  roundRect(-hw,y1,hw*2,y0-y1,5);X.lineWidth=4;X.strokeStyle=OUT;X.stroke();
  // menuki
  X.fillStyle=goldFill(-8,8);X.beginPath();X.ellipse(-2,-128,7,19,0,0,TAU);X.fill();X.lineWidth=2;X.stroke();
  // kashira
  X.beginPath();X.moveTo(-hw-2,y1+4);X.lineTo(hw+2,y1+4);X.lineTo(hw+1,-K3.HILT+4);X.quadraticCurveTo(0,-K3.HILT-6,-hw-1,-K3.HILT+4);X.closePath();X.fillStyle=goldFill(-hw,hw);X.fill();X.lineWidth=3.6;X.stroke();
  // fuchi
  roundRect(-hw-2,-26,hw*2+4,16,3);X.fillStyle=goldFill(-hw,hw);X.fill();X.lineWidth=3.2;X.stroke();
}
function drawTsuba3(){
  X.save();X.translate(0,-6);
  X.beginPath();X.ellipse(0,0,64,17,0,0,TAU);X.fillStyle='#120e10';X.fill();
  X.beginPath();X.ellipse(-1,-1,55,12,0,0,TAU);const g=X.createLinearGradient(-55,0,55,0);g.addColorStop(0,'#7a4a0e');g.addColorStop(.3,'#f0c860');g.addColorStop(.6,'#c99030');g.addColorStop(1,'#6a400c');X.fillStyle=g;X.fill();
  X.beginPath();X.ellipse(2,1,38,7,0,0,TAU);X.fillStyle='rgba(120,70,10,.55)';X.fill();
  X.beginPath();X.ellipse(-24,-3,14,3,0,0,TAU);X.fillStyle='rgba(255,250,220,.8)';X.fill();
  X.restore();
}
function drawBlade3(len,glowA=0){
  if(len<=4)return;
  const L=Math.min(len,K3.BLADE),y0=8;
  const hwB=y=>lerp(15,11,y/K3.BLADE);
  // outline polygon: mune (top, -x) and ha (edge, +x); kissaki at the end
  const top=[],edge=[];const n=30,yk=L-46;
  for(let i=0;i<=n;i++){const y=lerp(y0,yk,i/n);top.push([bow(y)-hwB(y),y]);edge.push([bow(y)+hwB(y),y])}
  const tipY=L,tip=[bow(tipY)-hwB(tipY)*.7,tipY];
  const P=[...top,tip,[bow(yk+30)+hwB(yk)*.8,yk+30],...edge.slice().reverse()];
  const path=()=>{X.beginPath();P.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.closePath()};
  if(glowA>0){X.save();X.globalCompositeOperation='lighter';X.globalAlpha=glowA;X.lineJoin='round';
    for(const[w,c,a]of[[46,'#ff6a2a',.18],[26,'#ffa060',.35],[12,'#ffd8b0',.6]]){X.globalAlpha=glowA*a;path();X.lineWidth=w;X.strokeStyle=c;X.stroke()}X.restore()}
  path();const g=X.createLinearGradient(-16,0,16,0);g.addColorStop(0,'#a4adb8');g.addColorStop(.35,'#f6f8fa');g.addColorStop(.62,'#e6eaef');g.addColorStop(1,'#c3cad3');X.fillStyle=g;X.fill();
  X.save();path();X.clip();
  // hamon
  X.beginPath();for(let y=y0+20;y<L-10;y+=5){X.lineTo(bow(y)+hwB(y)*.38+Math.sin(y*.11)*3.2+Math.sin(y*.037)*1.6,y)}X.strokeStyle='rgba(150,130,175,.95)';X.lineWidth=2;X.stroke();
  X.fillStyle='rgba(255,255,255,.75)';X.beginPath();for(let y=y0+20;y<L-10;y+=5){X.lineTo(bow(y)+hwB(y)*.38+Math.sin(y*.11)*3.2+Math.sin(y*.037)*1.6,y)}for(let y=L-10;y>y0+20;y-=5)X.lineTo(bow(y)+hwB(y)-1,y);X.closePath();X.fill();
  // shinogi line
  X.beginPath();for(let y=y0;y<yk;y+=8)X.lineTo(bow(y)-hwB(y)*.45,y);X.strokeStyle='rgba(90,100,115,.5)';X.lineWidth=1.4;X.stroke();
  X.restore();
  path();X.lineWidth=3.4;X.strokeStyle=OUT;X.lineJoin='round';X.stroke();
  // habaki
  roundRect(-17,4,34,26,3);X.fillStyle=goldFill(-17,17);X.fill();X.lineWidth=3.2;X.strokeStyle=OUT;X.stroke();
}
// ofuda + sageo in WORLD space (gravity), attached to saya points
function worldPt(x,y,rot,s,lx,ly){const c=Math.cos(rot),si=Math.sin(rot);return[x+(lx*c-ly*si)*s,y+(lx*si+ly*c)*s]}
function ofuda3(x,y,rot,s,t,alpha=1){
  for(const[ly,len,txt,ph]of[[150,135,['封'],0],[92,192,['封','斷'],1.7]]){
    const[ax,ay]=worldPt(x,y,rot,s,bow(ly)-K3.SW-2,ly,);
    const sway=Math.sin(t*2.1+ph)*.035;
    X.save();X.translate(ax,ay);X.rotate(sway);X.scale(s*OFUDA_S,s*OFUDA_S);X.globalAlpha=alpha;
    X.beginPath();X.moveTo(-12,0);X.lineTo(12,0);X.lineTo(12.5,len);X.lineTo(-11.5,len);X.closePath();
    X.fillStyle='#f3eee0';X.fill();X.lineWidth=2.6;X.strokeStyle=OUT;X.stroke();
    X.fillStyle='rgba(0,0,0,.06)';X.fillRect(4,2,7,len-4);
    X.fillStyle='#d0141c';X.font='900 19px Serif';X.textAlign='center';X.textBaseline='middle';
    txt.forEach((c,i)=>X.fillText(c,0,len*(txt.length==1?.42:(i?.62:.3))));
    X.restore();
  }
}
let SAGEO_UP=1,OFUDA_A=1,OFUDA_S=1;
function sageo3(x,y,rot,s,t){
  const[bx,by]=worldPt(x,y,rot,s,bow(190)+K3.SW+6,192);
  const u=SAGEO_UP,sw=Math.sin(t*2.4)*10*s;
  const ex=bx+lerp(-35,81,u)*s+sw, ey=by+lerp(205,-162,u)*s;
  const c1=[bx+lerp(-6,10,u)*s,by+lerp(60,70,u)*s],c2=[bx+lerp(-20,60,u)*s,by+lerp(120,40,u)*s],m=[bx+lerp(-22,55,u)*s+sw*.5,by+lerp(150,-30,u)*s],c3=[bx+lerp(-26,50,u)*s+sw*.7,by+lerp(180,-90,u)*s],c4=[ex-lerp(4,10,u)*s,ey+lerp(-10,40,u)*s];
  X.save();X.lineCap='round';
  const path=()=>{X.beginPath();X.moveTo(bx,by);X.bezierCurveTo(c1[0],c1[1],c2[0],c2[1],m[0],m[1]);X.bezierCurveTo(c3[0],c3[1],c4[0],c4[1],ex,ey)};
  path();X.strokeStyle=OUT;X.lineWidth=7.5*s;X.stroke();path();X.strokeStyle='#d8241c';X.lineWidth=4.8*s;X.stroke();path();X.strokeStyle='rgba(255,140,110,.7)';X.lineWidth=1.4*s;X.stroke();
  X.fillStyle=goldFill(ex-6*s,ex+6*s);X.beginPath();X.arc(ex,ey,6.5*s,0,TAU);X.fill();X.lineWidth=2*s;X.strokeStyle=OUT;X.stroke();
  const dir=lerp(1,-1,u);X.strokeStyle='#ff4a2a';X.lineWidth=2.2*s;for(let i=-4;i<=4;i++){X.beginPath();X.moveTo(ex,ey+dir*5*s);X.lineTo(ex+i*3.2*s+sw*.2,ey+dir*34*s);X.stroke()}
  X.restore();
}
// --- public API (overrides v2) ---
// katana(x,y,rot,s,opt): x,y = tsuba; rot: local +y direction = rot+PI/2
katana=function(x,y,rot,s,opt={}){
  const t=opt.t||0,out=opt.out||0;KROT=rot;
  // Retain the habaki even when closed; the scabbard masks the hidden steel.
  if(!opt.noHilt){X.save();X.translate(x,y);X.rotate(rot);X.scale(s,s);X.translate(0,-out);drawBlade3(out+74);drawHilt3();drawTsuba3();X.restore()}
  if(opt.noSaya)return;
  X.save();X.translate(x,y);X.rotate(rot);X.scale(s,s);drawSaya3(t);X.restore();
  if(opt.charms!==false){sageo3(x,y,rot,s,t);if(OFUDA_A>0)ofuda3(x,y,rot,s,t,OFUDA_A)}
};
// standalone sword (blade + hilt) at tsuba x,y, blade direction a (rad)
function sword3(x,y,a,s,glowA=0){X.save();X.translate(x,y);X.rotate(a-Math.PI/2);X.scale(s,s);drawBlade3(K3.BLADE,glowA);drawHilt3();drawTsuba3();X.restore()}
// saya alone, placed so its mouth (koiguchi) is at kx,ky, pointing along a (rad, toward kojiri)
function saya3(kx,ky,a,s,t,charms=true){const x=kx-Math.cos(a)*K3.SAYA0*s,y=ky-Math.sin(a)*K3.SAYA0*s;katana(x,y,a-Math.PI/2,s,{t,noHilt:1,charms})}
// v2 shims so older shots keep working with the new art
drawBlade=function(len){drawBlade3(len)};
drawHilt=function(){drawHilt3();drawTsuba3()};
