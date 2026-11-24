"""SFX template (numpy+scipy): events on the REAL timeline measured from the reference. Edit the event lists, run, mux.
Rules (elang): soft, band-limited, enveloped hits; ducked bed; nothing harsh. Writes sfx.wav.
Softer mix: no harsh noise bursts, everything band-limited and enveloped."""
import numpy as np, wave
SR=48000; D=14.6; N=int(SR*D); t=np.arange(N)/SR; rng=np.random.default_rng(5)
out=np.zeros(N)
def env(t0,a,d,shape=6):
    x=t-t0; return np.where(x<0,0,np.where(x<a,x/max(a,1e-4),np.exp(-(x-a)*shape/d)))
def lp(x,a):  # fast one-pole via IIR using numpy cumulative trick (block)
    from scipy.signal import lfilter; return lfilter([a],[1,a-1],x)
noise=rng.standard_normal(N); dark=lp(noise,0.02); mid=lp(noise,0.12)-lp(noise,0.02); air=noise-lp(noise,0.35)
F=87.31
bed=sum(a*np.sin(2*np.pi*f*t+0.6*np.sin(2*np.pi*.17*t)) for f,a in [(F,.5),(F*1.5,.28),(F*2,.18),(F*2.997,.05)])
bedenv=np.clip((t-1.0)/1.2,0,1)*np.clip((9.9-t)/0.25,0,1)*(0.55+0.45*np.clip((t-4.8)/4,0,1))
out+=0.15*bed*bedenv
# opening bell (sword resonance) + gathering riser 0.3-1.05
for f,a in [(1046.5,.5),(1568,.28),(2637,.12)]: out+=0.16*a*np.sin(2*np.pi*f*t)*env(0.05,.004,1.6,4)
rise=np.clip((t-0.3)/0.75,0,1)**2*(t<1.067); out+=0.10*mid*rise
# hits
for t0,g in [(1.067,.55),(2.967,.45),(3.97,.5),(4.767,.35),(9.266,.55),(9.787,.45),(11.47,.3)]:
    x=np.clip(t-t0,0,None); sweep=np.sin(2*np.pi*(55*x-20*x*x))*(t>=t0)
    out+=g*sweep*env(t0,.004,.8,5)+g*1.6*dark*env(t0,.003,.35,6)
# whooshes (band-passed, soft) before slashes
for t0,w in [(2.93,.07),(9.24,.06),(10.55,.07),(10.8,.07),(12.75,.09)]:
    out+=0.22*mid*np.exp(-((t-t0)/w)**2)
# shing of the draw (soft metallic partials)
for f in [2400,3150,4100]: out+=0.035*np.sin(2*np.pi*f*t)*env(1.07,.003,1.0,5)
# rift crackle (quiet ticks)
for tk in rng.uniform(4.0,9.2,34): out+=0.035*mid*env(tk,.001,.05,8)
# paper outro plucks
for t0,f in [(10.9,349.2),(11.64,523.3),(12.62,698.5),(13.33,440)]:
    out+=0.09*np.sin(2*np.pi*f*t)*env(t0,.005,1.5,5)*(1+0.3*np.sin(2*np.pi*f*2*t))
# sheath click 11.6, stamp thud 13.33
out+=0.12*air*env(11.47,.001,.04,8)+0.12*np.sin(2*np.pi*1800*t)*env(11.47,.001,.12,6)
# blade sliding home 11.25-11.47: soft rising metallic scrape
sl=np.clip((t-11.25)/0.22,0,1)*(t<11.47); out+=0.05*(np.sin(2*np.pi*(3000+1500*sl)*t))*sl+0.06*air*sl*0.5
x=np.clip(t-13.33,0,None); out+=0.5*np.sin(2*np.pi*85*x)*env(13.33,.003,.35,6)*(t>=13.33)+0.5*dark*env(13.33,.002,.2,6)
out=np.tanh(out*1.05); out*=0.8/np.max(np.abs(out)); out*=np.clip((D-t)/0.8,0,1)
pcm=(out*32767).astype(np.int16)
with wave.open('sfx.wav','wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.stack([pcm,pcm],1).tobytes())
print('ok')
