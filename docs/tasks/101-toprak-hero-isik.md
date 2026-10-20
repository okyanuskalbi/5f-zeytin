# Task 101: Toprak hero ve ışığın doğuşu

## Tür
frontend

## Amaç
Koyu zeytinlik hero (kare dizisi) + scroll ile ışık doğuşu: zemin toprak→krem, görüntü aydınlanır, 'Yeri sofrada.' gelir.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: evet — ilham: scroll-linked hero (uyarla)

## Adımlar
1. Sticky ~180vh sahne; arka plan onaylı zeytinlik ScrollFrameSequence (poster SSR, LCP: ≤60 KB AVIF + fetchpriority=high; kare dizisi boşta/etkileşimde).
2. Başlık sol alt: 'Kökü toprakta.' (display, krem); %40 ilerlemede ikinci satır 'Yeri sofrada.' alttan yükselerek gelir.
3. Işık doğuşu (motion-framer `useScroll` + `useTransform`): %35→%85 arası zemin `#0D110D`→`#F6F1E6`, görüntü `brightness(0.55)`→`1`, sonra görüntü yukarı kayar/küçülür ve vitrine yer açar; metin rengi krem→zeytin. Düz renk enterpolasyonu, gradyan yok.
4. Sağ altta 'Ürünleri keşfet' (altın) → Lenis yoksa doğal kaydırma ile vitrine; destek cümlesi: resmi alt slogan.
5. Mobil: 100svh, başlık 13vw iki satır, dikey kırpım; ışık geçişi aynı; LCP posteri mobil boyutta.
6. reduced-motion: ikinci satır ve krem zemin hemen; poster statik.

## Kabul kriterleri
- [ ] e2e: scroll %20/%60/%95'te zemin rengi ve başlık satırları beklenen; reduced-motion statik
- [ ] Lighthouse mobil bu bölümle LCP < 2.5 s (3 ölçüm medyanı)
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/101/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Durum: BEKLİYOR
