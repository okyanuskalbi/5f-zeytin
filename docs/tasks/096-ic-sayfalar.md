# Task 096: İç sayfalar aynı etiket dilinde

## Tür
frontend

## Amaç
Sepet, ödeme önizleme, hesap yer tutucusu, sipariş takip, yasal sayfaları yeni dile taşı.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: hayır

## Adımlar
1. Sepet sayfası ve çekmece: kağıt panel, fiş dili, upsell (039) korunur.
2. `/odeme-onizleme` (PayTR iframe çevresi): MLNEW düzeni + etiket dili; iframe dokunulmaz.
3. Yasal sayfalar (073 taslakları): okuma tipografisi, satıcı bilgileri SIRKET.md'den.
4. 404 ve boş durumlar.

## Kabul kriterleri
- [ ] e2e: sepet akışı, PayTR önizleme sayfası (anahtarsız uyarı modu), yasal sayfalar 3 tarayıcıda
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/096/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Durum: BEKLİYOR
