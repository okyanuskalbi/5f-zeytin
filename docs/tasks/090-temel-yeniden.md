# Task 090: Temel: tokenlar, süs temizliği, üst çubuk

## Tür
frontend

## Amaç
DESIGN.md renk/tip tokenları, tek düğme biçimi, yasaklı süslerin ve 'görsel hazırlanıyor' kutularının temizliği; e-ticaret için ince sabit üst çubuk.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: hayır

## Adımlar
1. Tokenlar: fildişi zemin, zeytin yeşili mürekkep, etiket bandı yeşili `#2F7A3B`, altın yalnız kurdele; 5 tip boyutu; 12 kolon; kenar 24–32px.
2. Temizlik: eyebrow etiketleri ('OSMANİYE / ÜRETİM TESİSİ', 'PERAKENDE', 'TOPRAKTAN SOFRAYA'), hairline/çerçeveli kutular, gölgeler, yer tutucu kutular (görsel yoksa bileşen tipografiyle tamamlanır, kutu görünmez).
3. Üst çubuk (föy 'no navigation outside the card' e-ticaret için uyarlandı — raporla): sol AFİNA ZEYTİN wordmark, sağ hesap + sepet (adet rozeti) + 'Menü'; düz fildişi zemin, şeffaf değil; mobil ≥44px hedefler, güvenli alan.
4. Düğme: kare köşe, düz dolgu (birincil zeytin yeşili, ikincil fildişi üstüne yeşil metin).

## Kabul kriterleri
- [ ] `grep -rnE 'linear-gradient|backdrop-filter|box-shadow' app components` → yalnız izinli scrim
- [ ] e2e: yer tutucu metinler ('hazırlanıyor', 'yakında' kutu) görünmüyor; sepet rozeti çalışıyor
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/090/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Durum: BEKLİYOR
