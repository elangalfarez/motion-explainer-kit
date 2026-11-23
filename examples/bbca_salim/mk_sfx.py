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
add = lambda t, ty, g=.6, **k: E_.append(dict(t=round(max(0, t), 3), type=ty, gain=g, **k))
add(0.0, "whoosh", .7, len=1.3)
for t in [T('bca')+.1, T('mei')-.1, T('nasabah')-.2, T('28')-.1, T('2002')-.1, T('hartono')-.3, T('bca',3)-.2, T('tahun')+.4, T('keluarga',3)-.2, T('satu',2)-.2]:
    add(t, "whoosh", .6, len=.6)
for w,n in [('negara',1),('rebutan',1),('1998',1),('cukup',1),('28',1),('ambil',1),('2002',1),('tinggi',1),('menang',1),('terkaya',1),('terbesar',1),('rencana',1),('satu',1),('krisis',1)]:
    add(T(w,n)+.12, "stamp", .7)
add(T('jatuh')+.45, "stamp", .6)
for w in ['milik','sahabat','soeharto','ratusan','16triliun','32triliun','53triliun','700triliun','pengendali','danantara','sisa']: add(T(w)-.05, "pop", .45)
for i in range(5): add(T('ratusan')+i*.09, "pop", .3)
add(T('dibakar'), "swish", .35, len=1.4)
for i in range(10): add(T('16triliun')+i*.1, "swish", .12, len=.15)
add(T('nyuntik'), "zip", .5)
for i in range(8): add(T('terkaya')+.1+i*.11, "kaching", .12)
for i in range(6): add(T('ngasih')+.05+i*.05, "kaching", .12)
add(T('menang')-.02, "stamp", .8); add(T('mana'), "ding", .45)
json.dump(sorted(E_, key=lambda e: e['t']), open("sfx.json","w")); print(len(E_))
