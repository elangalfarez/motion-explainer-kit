# Story: the script that makes people stay

## The formula (true story → twist → hidden principle)
1. **Hook, 0–2 s.** One bold number or a provocative, TRUE claim, on screen as a giant headline while it's spoken.
   "Umur 47, dia kehilangan semuanya." / "Bank ini pernah diambil alih negara." / "Prancis bayar warga Hanoi buat bunuh tikus."
2. **Promise, 2–5 s.** Tie it to the viewer's life: "...orang inilah yang bikin mie instan yang lo makan semalam."
3. **Rise / fall, 5–40 s.** One connected chain of cause → effect. Each passage = one event with one picture.
   Numbers are the payoff of a passage, not decoration. Escalate: every beat should be bigger or worse than the last.
4. **Turn, ~40 s.** The surprising mechanism (tempura → flash-fried noodles; bounty → people farm rats).
5. **Twist / principle, last line.** An abrupt line that reframes everything, often a question aimed at the viewer.
   Hard cut after it. No "follow for more" CTA (it bleeds retention). "Lo masih ngerasa telat?"

## Rules
- 110–130 spoken words (≈40–55 s after tempo 1.1), 10–13 passages, one passage ≈ one camera station.
- Casual spoken Indonesian (or the user's language): short sentences, "lo/gue", "nggak". Display "gw/lu/ga" via tokens.
- `{display|spoken}` tokens: `{1998.|sembilan belas sembilan puluh delapan.}`, `{16 triliun|enam belas triliun}`,
  `{SEO|S E O}`. Numbers ALWAYS spelled out on the spoken side. One token = one caption word.
- Every line must be drawable. If you can't picture it in one frame, rewrite it.
- Dramatic and clickbait is fine; false is not. Overclaim in the user's brief → keep the punch, swap the true framing,
  and tell them what you changed and why (with the source).
- Sensitive stories (crime, allegations, politics): "diduga / menurut laporan media" wording + an on-screen label;
  anonymous silhouettes for private people; no real logos.
- Run the finished script through `refs/humanizer` / `refs/no-slop` ideas: no "in a world where", no triple adjectives.

## script.json
```json
{
 "slug": "ando_ramen",
 "title": "Bangkrut di umur 47, lalu bikin mie instan pertama di dunia",
 "lang": "id",
 "passages": ["Umur {47,|empat puluh tujuh,} dia kehilangan semuanya. Bangkrut. Pernah dipenjara.", "..."],
 "voice": {"voice_id": "bIHbv24MWmeRgasZH58o", "model": "eleven_v3", "fallback_voice_id": "7QN34D2r3hCNwbOYIeK0"},
 "sources": ["https://www.nissin.com/en_jp/about/founder/ (credit union bankrupt 1957, backyard shed, 4 h sleep)", "..."]
}
```

## beats.md (show at STOP #1)
| t (approx) | line | on screen (station, hero prop, text) | camera | SFX |
|---|---|---|---|---|
| 0.0–2.2 | Umur 47, dia kehilangan semuanya. | paper man alone, giant "47" seal slams | slow push-in | stamp |
| 2.2–4.8 | ...mie instan yang lo makan semalam. | bowl rises from the ground, steam | whip right | whoosh, pop |

## Topic picking
Pick stories that already spread (viral threads, history channels, business lore) and add the missing "why it matters to you".
Good series shapes: "Sejarah bisnis & psikologi yang absurd", founder comebacks, policy backfires (cobra effect),
state vs tycoon, tiny invention → giant market. Verify on primary sources (company history pages, court/news archives,
annual reports, official statistics) before writing a word.
