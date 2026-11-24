// Ink Falls Up - main fragment shader (world y-up, pixels)
window.FS = `#version 300 es
precision highp float;
out vec4 o;
uniform float t, TI, zoom, flash, pulse, plumeFade, sinkK;
uniform vec2 cam, shk, dust;
uniform vec4 dA[64]; uniform vec4 dB[64]; uniform int nD;   // drops: A=(x,y,r,alpha) B=(tailDx,tailDy,tailR,kind)
uniform vec4 rip[16]; uniform int nR;                       // ripples: (t0,x,amp,0)
const vec2 TIP = vec2(1000.,420.);
const float S = 2150.;
const float X0 = 1050.;
const vec2 BU = vec2(-0.7660,0.6428);   // brush axis (tip -> handle)
const vec2 BP = vec2(0.6428,0.7660);
const vec3 PAPER = vec3(0.925,0.918,0.894);
const vec3 GOLD = vec3(0.86,0.64,0.26);

float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return s;}
float fbm3(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*vn(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return s;}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}

// ---------- water surface (underside of the sky) ----------
float surf(float x){
  float h=0.;
  for(int i=0;i<16;i++){ if(i>=nR) break; vec4 e=rip[i]; float tau=t-e.x; if(tau<0.) continue;
    float r=sqrt((x-e.y)*(x-e.y)+900.); float front=430.*tau+30.;
    float env=smoothstep(front,front-120.,r);
    h+=e.z*env*22.*exp(-1.5*tau)*exp(-r/700.)*sin(r*.043-tau*17.+1.2)*smoothstep(0.,.05,tau);
    h+=e.z*34.*exp(-pow(r/(38.+60.*tau),2.))*exp(-tau*5.)*smoothstep(0.,.03,tau);
  }
  // gravity returns: surface sags under the ink before the fingers
  h-=14.*sinkK*exp(-pow((x-X0)/520.,2.));
  return h;
}

// ---------- caustics (Hoskins-style iteration) ----------
float caustic(vec2 uv,float tm){
  vec2 p=mod(uv*6.28318,6.28318)-250.; vec2 i=p; float c=1.,inten=.005;
  for(int n=0;n<4;n++){float tt=tm*(1.-(3.5/float(n+1)));
    i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
    c+=1./length(vec2(p.x/(sin(i.x+tt)/inten),p.y/(cos(i.y+tt)/inten)));}
  c/=4.; c=1.17-pow(c,1.4); return clamp(pow(abs(c),8.),0.,1.);
}

// ---------- plume density (local q: y up from surface) ----------
float lobe(vec2 q,vec2 c,float r,float s,float tau){
  vec2 d=q-c; float L=length(d); float a=atan(d.y,d.x*s);
  float roll=1.-.28*smoothstep(.25,1.1,tau)*(1.-(.5+.5*sin(a+L*.085-tau*4.2)))*2.;
  return exp(-pow(L/r,2.)*1.6)*roll;
}
float seg(vec2 q,vec2 a,vec2 b,float w){vec2 pa=q-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return exp(-pow(length(pa-ba*h)/w,2.));}
float plume(vec2 q,float tau){
  if(tau<=0.) return 0.;
  float g1=1.-exp(-tau/1.05);
  float H=(30.+430.*g1)*(1.-.3*sinkK);
  float W=22.+150.*(1.-exp(-tau/1.4));
  float rl=14.+58.*(1.-exp(-tau/1.0));
  if(abs(q.x-W*.35)>W*2.2+rl*2.+700. || q.y<-30. || q.y>H+rl*3.+360.) return 0.;
  float up=clamp(q.y/max(H,1.),0.,1.5);
  // two-scale turbulence; stronger with height and time
  float amp=(6.+85.*smoothstep(0.,2.8,tau)*up);
  vec2 wq=q+(vec2(fbm3(q*.006+vec2(0.,-tau*.32)),fbm3(q*.006+vec2(5.2,1.3+tau*.28)))-.5)*2.*amp;
  wq+=(vec2(vn(wq*.03+tau*.4),vn(wq*.03+9.1-tau*.4))-.5)*14.*smoothstep(.2,1.5,tau);
  float d=0.;
  // primary ring, tilted and asymmetric
  float tilt=.12*g1;
  vec2 cL=vec2(-W*1.2,H*1.12+W*.25), cR=vec2(W*.75,H*.72);
  d+=1.15*lobe(wq,cR,rl*1.45,1.,tau);
  vec2 ce=(wq-vec2(0.,H-rl*.25))/vec2(W+rl*.8,rl*1.3);
  d+=0.*exp(-pow((length(ce)-1.)*4.,2.))*smoothstep(-.5,.4,ce.y);
  // puffs: a cluster of smaller rolling billows born along the path
  for(int k=0;k<9;k++){float fk=float(k); float hk=fract(sin(fk*91.7)*437.5), hk2=fract(sin(fk*17.3)*921.1);
    float born=.2+.26*fk; float g=smoothstep(born,born+1.6,tau); if(g<=0.) continue;
    float side=hk>.3?1.:-1.;
    vec2 c=vec2(W*.45+side*(W*(.2+.6*hk2)+30.*g*hk)*(side>0.?1.:.3),H*(.45+.6*hk2)+(50.+90.*hk)*g);
    float r=rl*(.35+.4*hk2)*(.5+.5*g);
    d+=.8*g*lobe(wq,c,r,side,tau+fk);
    
  }
  // base veil: ink pooling and creeping along the ceiling (asymmetric)
  float bx=q.x-W*.35; float bw=W*2.2+rl*2.;
  d+=.32*smoothstep(0.,1.,tau)*exp(-pow(bx/bw,2.))*exp(-max(wq.y,0.)/(28.+40.*g1))*(.5+.9*fbm3(wq*.012+tau*.2));
  // secondary rings (instability)
  float g2=smoothstep(.75,3.2,tau);
  if(g2>0.){
    vec2 c2=cR+vec2(60.*g2,110.*g2); float r2=rl*.6*(.4+.6*g2);
    d+=.8*g2*lobe(wq,c2,r2,1.,tau)+.45*g2*lobe(wq,c2+vec2(-r2*1.3,r2*.9),r2*.6,-1.,tau);
    
  }
  // ridged filaments + soft veil
  float r1=1.-abs(2.*fbm(wq*.02+vec2(tau*.15,-tau*.25))-1.);
  d*=mix(.35,1.6,r1*r1*r1);
  d+=.08*smoothstep(.0,.5,d)*fbm3(wq*.01);
  d*=1.+1.6*exp(-tau*2.2);
  return d*plumeFade;
}

// ---------- brush ----------
float brushR(float a){
  if(a<330.) return 52.*pow(clamp(a/205.,0.,1.),.58)*(1.-.22*smoothstep(205.,330.,a));
  if(a<392.) return 38.;
  return 31.+1.5*exp(-pow((mod(a-392.,400.)-200.)/8.,2.));
}
float brushSD(vec2 w,out float a,out float b,out float R){
  vec2 d=w-TIP; a=dot(d,BU); b=dot(d,BP);
  R=brushR(max(a,0.))*(1.+.07*pulse*smoothstep(240.,0.,a)*smoothstep(-10.,60.,a));
  if(a<0.) return length(d);
  return abs(b)-R;
}

// ---------- backdrop ----------
vec3 backdrop(vec2 w,vec2 sp,out float inWater){
  vec3 col=PAPER;
  float n1=fbm3(vec2(w.x*.006,w.y*.045));
  col*=.972+.05*n1;
  col+=(vn(w*1.25)-.5)*.018;
  col*=1.+.045*smoothstep(400.,2150.,w.y);
  float hs=surf(w.x); float dd=w.y-(S+hs);
  inWater=step(0.,dd);
  if(dd>0.){
    float sl=(surf(w.x+3.)-surf(w.x-3.))/6.;
    vec2 rw=w+vec2(sl*90.,0.)*exp(-dd/220.);
    col*=mix(vec3(.94,.965,.97),vec3(.80,.86,.88),smoothstep(0.,900.,dd));
    float sh=fbm3(vec2((rw.x+rw.y*.35)*.0045+t*.03,t*.05));
    col+=vec3(1.,.98,.93)*.10*pow(sh,2.5)*smoothstep(0.,500.,dd);
    float cz=caustic(rw*.0011+vec2(0.,t*.01),t*.55+3.);
    float bz=flash*exp(-length(w-vec2(X0,S))/(380.+900.*(t-TI)));
    col+=vec3(1.,.985,.94)*(.085+.75*bz)*cz*smoothstep(-20.,120.,dd);
    // underside sheen band
    col+=vec3(.06)*exp(-dd/9.);
    // shockwave

    // plume (Beer absorption: cinnabar)
    vec2 q=rw-vec2(X0,S);
    float d=plume(q,t-TI);
    if(d>0.001){
      col*=exp(-vec3(1.55,1.35,1.0)*d*1.9)*exp(-.25*d*d);
      // gold flecks
      vec2 cell=floor(q/13.); float hh=h21(cell+7.);
      if(hh>.965 && d>.12 && d<1.6){vec2 pc=(cell+.5+.35*(vec2(h21(cell+1.),h21(cell+2.))-.5))*13.;
        float sp2=smoothstep(2.4,0.,length(q-pc))*(.45+.55*sin(t*7.+hh*90.));
        col=mix(col,GOLD*1.25,clamp(sp2,0.,1.)*.9);}
    }
  }
  // meniscus line
  col*=1.-.55*exp(-pow(dd*zoom/1.6,2.));
  col+=.05*exp(-pow((dd-4.)/3.,2.));
  col*=1.-.06*exp(-pow((dd+5.)/5.,2.));
  // dust motes (air) - drift
  if(dd<0.){vec2 dp=(w-dust)/38.; vec2 ci=floor(dp); float hm=h21(ci+19.);
    if(hm>.93){vec2 pc=ci+.5+.35*(vec2(h21(ci+3.),h21(ci+5.))-.5); float md=length(dp-pc)*38.;
      col*=1.-.11*smoothstep(2.6,.8,md);}}
  return col;
}

// ---------- drops ----------
float dropSD(vec2 w,int i){
  vec4 A=dA[i],B=dB[i]; float dc=length(w-A.xy)-A.z;
  if(length(B.xy)<.5) return dc;
  vec2 a=A.xy,bb=A.xy+B.xy; vec2 pa=w-a,ba=bb-a; float hh=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
  float dt=length(pa-ba*hh)-mix(A.z*.92,B.z,pow(hh,.7));
  return smin(dc,dt,max(A.z*.6,3.));
}

void main(){
  vec2 sp=gl_FragCoord.xy;
  vec2 w=(sp-vec2(960.,540.))/zoom+cam+shk;
  { float tau=t-TI; if(tau>0. && tau<.9){ vec2 dv=w-vec2(X0,S); float dq=length(dv); float Rw=60.+1250.*tau;
    float k=(dq-Rw)/42.; w-=normalize(dv+1e-4)*22.*k*exp(-k*k)*(1.-tau/.9)*(1.-tau/.9); } }
  float inW;
  vec3 col=backdrop(w,sp,inW);

  // brush cast shadow on the paper
  float a,b,R; float sd=brushSD(w-vec2(26.,-30.),a,b,R);
  if(a<2600.) col*=1.-.13*smoothstep(22.,-14.,sd);
  // brush
  sd=brushSD(w,a,b,R);
  if(sd<1.5 && a<3200.){
    float cov=clamp(.5-sd*zoom,0.,1.);
    float u=clamp(b/max(R,1.),-1.,1.); float nz=sqrt(max(1.-u*u,0.));
    vec3 N=normalize(vec3(BP*u,nz)); vec3 L=normalize(vec3(-.45,.62,.65)); vec3 Hh=normalize(L+vec3(0,0,1));
    float dif=.35+.65*max(dot(N,L),0.);
    vec3 bc;
    if(a<330.){
      float hair=vn(vec2(u*34.+a*.004,a*.011)); float hair2=vn(vec2(u*90.,a*.03));
      float wet=smoothstep(185.,55.,a+38.*(hair-.5));
      vec3 dry=vec3(.80,.74,.62)*(.82+.3*hair2);
      vec3 wc=vec3(.045,.045,.06)*(.75+.4*hair);
      bc=mix(dry,wc,wet)*dif;
      bc+=vec3(1.,.9,.88)*pow(max(dot(N,Hh),0.),36.)*(.18+.7*wet);
      bc*=.86+.2*hair2;
      cov*=smoothstep(-1.,4.,a);
    }else if(a<392.){
      bc=vec3(.05,.045,.05)*dif+vec3(.8)*pow(max(dot(N,Hh),0.),60.);
      float gr=min(abs(a-336.),abs(a-386.)); bc=mix(bc,GOLD*(.7+.6*dif),smoothstep(2.2,.8,gr));
    }else{
      float fib=vn(vec2(u*40.,a*.004)); float m=mod(a-392.,400.);
      bc=vec3(.70,.56,.36)*(.8+.3*fib)*dif+vec3(1.,.95,.85)*pow(max(dot(N,Hh),0.),24.)*.35;
      bc*=1.-.45*exp(-pow((m-200.)/3.,2.));
    }
    col=mix(col,bc,cov);
  }

  // drops (cinnabar ink): refraction of backdrop + Beer + spec + inner glow
  for(int i=0;i<64;i++){ if(i>=nD) break;
    vec4 A=dA[i],B=dB[i];
    if(length(w-A.xy-B.xy*.5)>A.z+length(B.xy)*.5+B.z+6.) continue;
    float d=dropSD(w,i);
    if(d>1.5) continue;
    float e=.6;
    vec2 g=normalize(vec2(dropSD(w+vec2(e,0),i)-dropSD(w-vec2(e,0),i),dropSD(w+vec2(0,e),i)-dropSD(w-vec2(0,e),i))+1e-5);
    float rr=max(A.z,2.);
    float depth=clamp(-d/rr,0.,1.);
    float nz=sqrt(1.-pow(1.-depth,2.));
    vec3 N=normalize(vec3(g*(1.-nz),nz));
    float iw; vec3 bgR=backdrop(A.xy-(w-A.xy)*.7,sp,iw);
    float th=.35+1.2*nz;
    vec3 c=bgR*exp(-vec3(2.9,2.7,2.2)*th*(.9+.02*rr));
    // inner glow (light focused to the far side)
    c+=vec3(.18,.26,.42)*.6*smoothstep(.2,.9,depth)*max(dot(normalize(w-A.xy+1e-4),normalize(vec2(.45,-.62))),0.)*(1.-depth*.6);
    vec3 L=normalize(vec3(-.45,.62,.65)); vec3 Hh=normalize(L+vec3(0,0,1));
    c+=vec3(1.)*pow(max(dot(N,Hh),0.),70.)*1.1;
    c=mix(c,vec3(.02,.02,.035),.55*smoothstep(.35,0.,depth));  // dark rim
    float cov=clamp(.5-d*zoom,0.,1.)*A.w;
    col=mix(col,c,cov);
  }

  // finish: vignette + grain + flash
  vec2 uv=sp/vec2(1920.,1080.);
  col*=1.-.22*pow(length((uv-.5)*vec2(1.,.8)),2.2);
  col+=(h21(sp+fract(t*13.)*91.)-.5)*.022;
  o=vec4(clamp(col,0.,1.),1.);
}`;
