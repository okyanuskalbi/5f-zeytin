# Task 107: v2 hareket, performans, eleştiri ve mobil kapısı

## Tür
frontend

## Amaç
Tüm v2 sayfası için global kapı: hareket katmanı, Lighthouse/LCP, 3 tur eleştiri, 4 cihaz mobil rapor.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: hayır

## Adımlar
1. Hareket katmanı tamam (DESIGN.md), inspect hareket ≥ 16 (landing).
2. Performans: Lighthouse mobil 3 ölçüm medyanı Perf ≥ 85, LCP < 2.5 s, CLS < 0.1, A11y ≥ 95 (098 stash'indeki iyileştirmeler gerekirse referans: `git stash list`).
3. `references/critique.md` ile 3 tur (1440/768/390), `docs/critique-107.md`; hedef ≥ 7.5.
4. Mobil: iPhone 14/SE, Pixel 7, Galaxy S20 + yatay; `docs/mobil-analiz-107.md` önce/sonra.
5. Global inspect FAIL 0 (landing istisnasız; iç sayfalar DESIGN.md istisnasıyla).

## Kabul kriterleri
- [ ] Lighthouse hedefleri, critique ve mobil raporları; tam e2e + unit geçer
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/107/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Durum: BEKLİYOR
