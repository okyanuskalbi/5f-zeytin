# Task 103: Öne çıkan: Doğal Kırma Yeşil Zeytin 10 kg (split stage)

## Tür
frontend

## Amaç
Sol yapışkan büyük teneke görseli, sağda kaydırılan hikâye, boy seçimi ve sepete ekle; toptan teklif bağlantısı.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: evet — ilham: sticky split product (uyarla)

## Adımlar
1. Masaüstü 50/50: sol `position: sticky` 100svh teneke görseli (onaylı stüdyo/sahne; yoksa referans kırpımı), sağda: başlık (ürün adı), resmi ürün kapsamı cümlesi, boy seçici (1 kg / 5 kg / 10 kg — temsili, veri getProducts'tan), fiyat, adet, sepete ekle, 'Toptan alım için teklif isteyin' → #toptan.
2. Görsel scroll'da hafif ölçek (1.04→1) ve sahne görseline çapraz geçiş.
3. Mobil: görsel üstte 70svh, içerik altta; sepete ekle tam genişlik.

## Kabul kriterleri
- [ ] e2e: boy değişince fiyat/gramaj değişir, sepete ekleme çalışır; mobil düzen
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/103/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Durum: BEKLİYOR
