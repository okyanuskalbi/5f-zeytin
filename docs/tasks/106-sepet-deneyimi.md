# Task 106: Sepet çekmecesi, mini sepet, upsell

## Tür
frontend

## Amaç
Sağ çekmece (mobil alt sayfa), layout/AnimatePresence satır animasyonları, upsell, mobil mini sepet çubuğu.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: evet — Drawer 23558 / 31360 (uyarla)

## Adımlar
1. Çekmece: sağdan (masaüstü 440px), mobilde alttan sayfa (snap 60%/95%, sürükle-kapat), odak tuzağı, ESC, scroll kilidi; satırlar `layout` + `AnimatePresence` (ekle/sil/adet); upsell (039) çekmecede; toplam, 'Ödemeye geç' (PayTR önizleme/checkout akışına).
2. Mini sepet: mobilde ilk eklemeden sonra altta sabit çubuk (adet · toplam · 'Sepet'), güvenli alan, footer görünürken içerik üstüne binmez.
3. Sepet sayfası (096) v2 diline uyarlanır.

## Kabul kriterleri
- [ ] e2e: ekle/sil/adet animasyonları sonrası toplam doğru; çekmece klavye/odak; mini sepet görünürlük kuralları; Firefox 320 odak testi geçer
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/106/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Durum: BEKLİYOR
