# Task171 — Fotoğraflı çoklu ürün seçimi ve menü düzeltmesi

## Kullanıcı isteği
Teklif ürün alanı fotoğraflı çoklu seçim olsun; her ürünün adedi elle değişsin.
21st.dev MCP kullanılsın. Kullanıcının sonraki notu: menü bozulmuş gibi görünüyor;
ücretli21st erişimi mevcut. Önceki kompakt form ve API yayını tercihi korunur.

## Kapsam
- Gerçek21st109 InteractiveCheckout +20055Quantity kaynakları, mevcut
  React/TypeScript/shadcn/Tailwind yapısına ve AFİNA tokenlarına uyarlanır.
- Ürünler/ambalajlar mevcut katalogdan; çoklu seçim, tümünü seç/temizle,
  her ürün için doğrudan adet ve +/-; seçimin fotoğraflı kapalı özeti.
- Adet1..99999tam sayı; boş/sıfır/kesir/negatif/taşma taslak üretmez.
- Galeriden ekle mevcut seçimi/adedi korur; özet ve mailto bütün kalemleri
  ayrı listeler. Katalog/iletişim değişirse eski taslak geçersiz olur.
- Telefon/şehir/ilçe/KVKK korunur. Backend/cart/payment/dataauthority değişmez.
- Menü: gerçek tarayıcı ölçümü sonrası aktif bölüm/taşma/okunabilirlik düzeltmesi.

## Araçlar / kabul
21st-ui-build, frontend-patterns, tdd-workflow. Mevcut bağımlılıklar kullanılır.
Paketli headless Chromium,≤2worker, her tarayıcı browser.close ve sahip olunan
sunucu SIGTERM ile kapanır. Unit/lint/typecheck/build, desktop/mobil/klavye ve
çoklu gerçekSKU/adet taslağı testi. Canlıda POST/e-posta/ödeme/hesap mutasyonu yok.
Main push + yeşil exactcommit doğrulama sonrası doğrudan Vercel REST API yayını.

## Uygulama
- `components/ui/quote-product-picker.tsx` ve CSS Module: kurulu Radix Dialog,
  Button, Lucide, V3Picture ve gerçek katalog. Yeni paket/provider gerekmedi.
- 21st MCP ücretli erişim doğrulandı;109/20055 ve navbar43059 tam kaynakları
  okundu. Kalıcı kaynak/SHA kaydı `docs/referans/quote-picker-171-source.json`.
  CLI AI üretimi veya yeni harcama yok.
- `QuoteJourneyProvider`: ürün→ham adet haritası. Galeri tekrar eklerse adet
  sıfırlanmaz; başka ürünler korunur. Sepet ile bağımsız teklif seçimi.
- `QuoteComposer`: her satır için1..99999 tam sayı doğrulaması; kaldırılmış
  SKU reddi; değişen veri eski özeti geçersiz yapar. Sabit alıcıya encoded
  mailto birden fazla kalem taşır; gönderimi kullanıcı tamamlar.
- Navbar: gerçek public URL, scroll/resize ile aktif bölüm; CSS/reduced/noJS
  fallback;13px masaüstü etiketler,1360px mobil geçiş,320px taşma düzeltmesi.
- Varsayılan paylaşılabilir bileşen yolu `components/ui`, genel tokenlar
  `app/globals.css`; yerel bileşen stilleri CSS Module olarak korunur.

## Kontrol kaydı (yayın öncesi)
53 odaklı test ve113 dosya/1351 unit geçti. Lint/typecheck/webpack build PASS.
Üretim sunucusunda320–1440px,5viewport/45 kontrol: fotoğraf yüklemesi, tümünü
seç/temizle, iki adet24/12, +/- ve boş/sıfır reddi, Escape/odak dönüşü,44px
kontroller, taşma, özet/mailto, ilçe sıfırlama, ülke, galeri ve üyelik smoke.
Navbar son kontrolünde9viewport,4scroll, reduced/noJS ve içsayfa→ana sayfa
geçişi PASS. Next HistoryUpdater URL yazımından sonra snapshot yenilenir;
aynı commit sırasını taklit eden regresyon testi önce RED sonra GREEN oldu.
Bağımsız kod incelemesinde teklif/veri akışı için somut regresyon bulunmadı.
Fiziksel cihaz ve gerçek ödeme/hesap/e-posta teslimi bu kapsamda test edilmez.

## Durum: KOD VE YEREL KABUL TAMAM / MAIN-API YAYINI SIRADA
Commit öncesi kanıt `docs/referans/qa-171-20261102.json`.
Yayının sonucu ve son canlı tarayıcı kabulü `.cache/task-171/final-receipt.json`
ile kaydedilecek; yerel PASS canlı sonucu yerine geçmez.
