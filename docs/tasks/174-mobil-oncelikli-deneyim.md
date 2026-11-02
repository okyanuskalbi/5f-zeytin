# Task174 — Mobil öncelikli deneyim

## İstek
Kullanıcı: “daha çok mobilize olmalı 21st.dev ve tüm frontend skilllerine bak”.
Task173 kaynak3be79e5 main/API READY; makbuz .cache/task-173/final-receipt.json.
Telefon deneyimi, kabul edilmiş masaüstü tasarımını değiştirmeden yeniden düzenlenir.

## Tasarım ve kapsam
- Telefon menüsü: daha küçük başlık, 44px ikon kontrolü, alttan açılan erişilebilir
  kompakt panel ve açıkça gruplanmış alışveriş/kurumsal bağlantıları.
- Ürünler: mevcut scroll animasyonunu korurken görünür önceki/sonraki kontrolü,
  sayaç ve anlaşılır dokunma yönü; ilk/son SKU ve bütün eylemler erişilir.
- İlk ekran: kısa telefonlarda da başlık/ana CTA görünür; sahne metinleri,
  görsel oranları ve bölüm boşlukları telefon ölçülerine göre dengelenir.
- Ürün seçici/form: safe-area ve klavye için esnek alt panel, okunur alanlar,
  seçilen adet özeti ve erişilebilir tamamlama kontrolü; manuel mailto korunur.
- Sepet: küçük ekranda ürünlere daha fazla yer, kompakt boş durum ve özet.
- Orijinal medya, gerçek altı SKU/fiyat/stok/sıralama, auth/PayTR/server otoritesi
  ve Reduced Motion/fallback sözleşmeleri değişmez. Yeni paket gerekmedikçe eklenmez.

## Kaynaklar ve araçlar
21st-ui-build/review; MCP search + get_component. İncelenen kaynaklar:
8343 Bottom Nav Bar, 31360 Drawer, 8297 Product Carousel. Kaynak dosyaları
.cache/task-174/21st-*.json; mevcut Radix/Motion ve marka tokenlarına uyarlanır.
Frontend skill envanteri: düzen, tipografi, erişilebilirlik, Apple mobil davranışı,
React desenleri, motion/performance, QA. Ayrıntılı kaynak eşlemesi denetim kaydına eklenir.
Next yerel CSS rehberi incelendi. Ücretli AI/medya üretimi yok.

## Kabul
- 320×568, 360×640, 390×844, 430×932, yatay844×390, tablet768×1024,
  masaüstü1440×900: taşma, hedef boyutu, görünür CTA ve menü/kapanış/odak.
- İleri/geri galeri, ilk/son ürün, detay ve sepet; quantity ve quote picker,
  form hata/klavye alanı; Reduced Motion/noJS ve dönüş.
- Masaüstü görsel karşılaştırması, mevcut ilgili regression testleri,
  tam unit≤2worker/lint/typecheck/production build.
- Yalnız paketli headless Chromium; tüm owned browser/server düzgün kapanır.
- Kullanıcının Device Hub isteği kapsamında Safari simülatörü ayrı gözlenir;
  otomasyon emülasyonu fiziksel cihaz kabulü olarak yazılmaz.
- Gerçek sipariş/hesap/ödeme/e-posta gönderimi yok.
- Yeşil main commit/push, exact-commit CI; doğrudan Vercel REST API yayını.

## Yerel doğrulama

- 119 unit dosyası / 1424 test PASS; lint, typecheck, webpack production build PASS.
- 21st CLI: 9 değişen UI kaynağı, ardından son CartDrawer farkı; hata/uyarı/öneri yok.
- Mobil tarayıcı: 9 profil / 48 kontrol PASS. Kısa320×568 ilkCTA görünür;
  44px menü/galeri kontrolleri, alt panel/odak, noJS/reduced ve footer doğrulandı.
- Teklif/picker: 5 viewport / 45 kontrol PASS; çoklu fotoğraflı seçim, elle adet,
  geçersiz adet, şehir/ilçe reset ve yalnız yerel mailto taslağı.
- Animasyon: 12 profil / 63 kontrol PASS. İleri/geri film seek, gerçek Chromium
  touch gesture, tüm6SKU/CTA, hash, rotation, reduced/save-data/düşükCPU/noJS.
- Navbar: 9 viewport, 4scrollhedefi, içsayfa dönüşü ve odak/ESC PASS.
- Dikey pointercancel sonrası ilk gerçek satınalma tap'i yerel tarayıcıda geçti.
  Yatay844×390 dolu sepet CTA görünürlüğü de düzeltildi; 4 boyutta
  CTA/odak/tek ödeme bilgisi ve adet/silme tekrar doğrulandı.
- Kanıtlar `.cache/task-174/`: `mobile-local-final/report.json`,
  `qa-local-2026-11-02T19-40-49-106Z/report.json`,
  `motion/local-1793648533943/report.json`, `nav-local/report.json`.
- Skill eşlemesi: `docs/referans/mobile-174-skill-review.md`.

## Durum: YEREL KONTROLLER PASS / MAIN VE API YAYINI SIRADA

Canlı kabul ve Device Hub sonucu ayrıca kaydedilir. Tarayıcı emülasyonu fiziksel
iPhone veya gerçek yazılım klavyesi kabulü olarak sunulmaz.
