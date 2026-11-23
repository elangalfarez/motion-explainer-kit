import json, re
W = json.load(open("words.json"))["words"]
def cl(s): return re.sub(r"[^\w]", "", s.lower())
def T(w, n=1):
    k = 0
    for x in W:
        if cl(x["w"]) == cl(w):
            k += 1
            if k == n: return x["s"]
    raise SystemExit(f"missing {w} {n}")
E_ = []
add = lambda t, ty, g=.7, **k: E_.append(dict(t=round(max(0, t), 3), type=ty, gain=g, **k))
add(0.0, "whoosh", .9, len=1.3); add(0.0, "swish", .35, len=5.2)   # descend + rain
for t in [T('tapi'), T('namanya')+.2, T('1948')+.1, T('bebas')+.2, T('tapi',2), T('jadi',2), T('sampai'), T('mie',2)-.1, T('1958')-.2, T('sekarang')-.2, T('dia',8) if False else T('mulai')]:
    add(t - .25, "whoosh", .85, len=.6)
for w,n in [('47',1),('dipenjara',1),('1948',1),('dua',1),('bangkrut',2),('antre',1),('tidur',1),('tempura',1),('awet',1),('1958',1),('48',1),('indonesia',1),('47',2)]:
    add(T(w,n)+ (0.45 if (w,n)==('bangkrut',2) else .12), "stamp", .95)
add(T('bangkrut')-.02, "stamp", .9); add(T('bangkrut')+.25, "boing", .35)
add(T('mie')-.2, "whoosh", .8, len=1.0); add(T('semalam')-.1, "pop", .6)
for w in ['momofuku','kasus','direktur','rumah','pemandangan','pertama','lahirlah']: add(T(w)-.05, "pop", .55)
add(T('yatim')+.2, "swish", .5, len=1.2)
for i in range(12): add(T('hartanya')+i*.04, "kaching", .18)
for i in range(18): add(T('setahun')-.1+i*.2, "zip", .22)
for i in range(10): add(T('nggak')-.1+i*.09, "swish", .2, len=.15)
add(T('digoreng'), "type", .5, len=1.5); add(T('airnya'), "pop", .5)
for i in range(4): add(T('airnya')+.05+i*.06, "pop", .3)
add(T('seduh'), "swish", .5, len=1.0)
add(T('1958')-.3, "whoosh", .7, len=1.4)
for i in range(9): add(T('1958')+1.2+i*.22, "pop", .3)
add(T('123miliar'), "kaching", .9); add(T('lo',2), "stamp", 1.0); add(T('telat'), "ding", .6)
json.dump(sorted(E_, key=lambda e: e['t']), open("sfx.json","w"))
print(len(E_))
