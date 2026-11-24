"""Write sfx.json from the aligned words: about one soft cue per visible action, anchored to word times."""
import json, re
from pathlib import Path

D = Path(__file__).parent
W = json.loads((D / "words.json").read_text())["words"]
clean = lambda w: re.sub(r"[^\w]", "", w.lower())
def T(word, n=1):
    k = 0
    for w in W:
        if clean(w["w"]) == clean(word):
            k += 1
            if k == n: return w["s"]
    raise KeyError(f"{word} #{n} not in words.json")

ev = lambda t, kind, gain, **o: {"t": round(max(0, t), 3), "type": kind, "gain": gain, **o}
S = [
    ev(0, "whoosh", .4, len=1.0),                                   # opening push-in
    ev(T("mundur") + .1, "pop", .3),                                # VP steps off
    ev(T("1956"), "stamp", .6),
    ev(T("Ceritanya") - .2, "swish", .2, len=1.6),                  # paper flutter as it falls
    ev(T("Surat"), "pop", .35),                                     # paper lands
    ev(T("luar") - .25, "pop", .3), ev(T("luar") + .05, "pop", .3), # country chips
    ev(T("SMA"), "stamp", .45),
    ev(T("2023") - .45, "whoosh", .5, len=.5),                      # whip to the court
    ev(T("buka"), "zip", .3),                                       # barrier lifts
    ev(T("40") - .12, "pop", .3), ev(T("asal") - .1, "pop", .3),
    ev(T("Sembilan"), "pop", .35),
    ev(T("36"), "stamp", .5),
    ev(T("daftar"), "pop", .3),
    ev(T("Menang") - .45, "whoosh", .45, len=.5),
    ev(T("96 juta"), "kaching", .35),
    ev(T("Tapi") - .45, "whoosh", .45, len=.5),
    ev(T("menggugat"), "pop", .3),
    ev(T("30 Oktober") - .45, "whoosh", .45, len=.5),
    ev(T("membatalkannya"), "stamp", .8),                           # the loudest hit
    ev(T("Kata"), "pop", .3),
    ev(T("Lalu") - .45, "whoosh", .45, len=.5),
    ev(T("120"), "type", .22, len=2.0),                             # hands going up
    ev(T("pintu", 2), "zip", .25),
    ev(T("12 November") - .2, "whoosh", .45, len=.7),               # turn back to the chair
    ev(T("mundur", 2), "pop", .3),
    ev(T("dua"), "pop", .35), ev(T("dua") + .25, "pop", .3),
    ev(T("pilih"), "pop", .25),
    ev(T("96 juta", 2) - .1, "whoosh", .4, len=1.6),                # crane up
    ev(T("732"), "stamp", .5),
]
(D / "sfx.json").write_text(json.dumps(S))
print(len(S), "cues")
