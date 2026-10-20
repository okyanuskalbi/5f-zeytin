# Task 105: Topraktan sofraya şeridi, SSS, footer

## Tür
frontend

## Amaç
Sürüklenen süreç şeridi (görsel tekrarı yok), teyitli SSS, toprak zeminli footer.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: evet — ilham: drag carousel + progress

## Adımlar
1. Süreç: 6 adım, Framer Motion `drag='x'` + kaydırma + klavye, ilerleme çubuğu (düz dolgu); adım adı büyük Fraunces; metin yalnız resmi tek cümle; görseller onaylı süreç görselleri gelince (yoksa görselsiz, aynı görsel iki kez YOK).
2. SSS: teyitli sorular (087), iki kolon okuma metni.
3. Footer toprak zemin: logo (dark), slogan, linkler, satıcı satırı (unvan · Düziçi VD · VKN 0091520061), yasal linkler, küçük Topluluk logosu → https://afina.com.tr.

## Kabul kriterleri
- [ ] e2e: sürükleme/klavye/ilerleme; SSS teyitsiz soru yok; footer linkleri
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/105/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Durum: BEKLİYOR
