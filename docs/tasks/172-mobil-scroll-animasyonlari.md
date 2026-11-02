# Task172 — Masaüstü hareketini mobile taşıma

## İstek
2 Kasım kullanıcı: Masaüstü beğenildiyse scroll efektleri ve animasyonlar
mümkün olduğunca mobile de aktarılsın. Kabul edilen sahne/marka/ticari yapı
korunur; bu görev animasyon ve telefon yerleşimi uyarlamasıdır.

## Uygulama ve kabul
- İlk üç sahne: uygun dikey dokunmatik ekranda ortak kısa sticky yolculuk,
  kamera/yazı/tesis/sofra/ambalaj hareketleri; telefona sığan tesis düzeni.
- Yatay ürün galerisi: dikey kaydırma → yatay ray ve spotlight; altı gerçek
  SKU, detay/sepet/teklif kontrolleri ve klavye odağı korunur.
- B2B ve finale: kendi görünür alanına bağlı hafif görsel parallax.
- Reduced-motion, saveData, düşük CPU, kısa/yatay ekranlarda tam native akış;
  hiçbir modda görünmeyen/erişilemeyen CTA, tekrarlı ID veya scroll kilidi yok.
- Mevcut onaylı4MB video; poster-first/src-less SSR, ekran dışında duraklama,
  geç indirme/decoder hatasında poster. Yeni görsel/video/paket/ödeme yok.
- CSS transform/opacity, MotionValue; frame başına React state yok.

## Kullanılacak araçlar
frontend-patterns, tdd-workflow, animation-performance.21st MCP mevcut
24623/motiondotdev Scroll Horizontal Gallery kaynağı tekrar incelendi.
Tasarım korunarak mevcut bileşenler uyarlanır; yeni registry kurulumu yok.
Next yerel CSS rehberi okundu. Yalnız yeşil görev commit'i/main push;
doğrulama-only Actions sonrası Vercel REST API yayını.

## Doğrulama
Policy/lifecycle/anchor/focus RED→GREEN unit, lint/typecheck/build; paketli
headless Chromium≤2worker. Telefon portre/landscape,320–1440px, aşağı/yukarı
scroll, ilk/son ürün, CTA/detail/teklif/menü, reduced/saveData/noJS/rotation.
Tarayıcı ve başlatılan sunucu düzgün kapatılır. Gerçek hesap/ödeme/e-posta
mutasyonu yok; emülasyon fiziksel iOS/Android kabulü olarak sunulmaz.

## Uygulama
- Ortak portrait-touch policy:320–1023px, en az640px yükseklik. Harvest480svh;
  desktop600svh ve kabul edilen hareket aralıkları aynı. Tesis ve sofra telefon
  düzeni; gerçek100svh yüksekliğiyle scroll/hash/odak aynı ilerlemeye bağlı.
- Galerinin son ürünü için dekoratif spotlight yerine rayın yerleşim genişliği
  ölçülür. Touch kartlar ölçeklenmez,44px kontroller korunur. Yüksek türev için
  doğru imageSizes ile mevcut600px ürün görseli seçilir.
- Rotation/reduced geçişlerinde render sırasında alt bileşen state bildirimi
  kaldırıldı. Native→scrub ölçümü değişince odaktaki SKU yeniden hizalanır;
  normal kullanıcı scroll'u serbesttir. İki hata RED→GREEN ile doğrulandı.
- B2B kendi görünümüne bağlı teneke±28px/şişe±16px; kapanış±20px ve yeterli
  overscan. Form ve metin hit alanları sabit; desktop değerleri korunur.
- Film indirirken görünüm/sekme dışına çıkılırsa istek iptal; geç yanıt bağlanmaz.
  Native seek sırasında çakışan seek yok; hata poster, zamanlayıcı/RAF temizliği.
- Kaynak docs/referans/mobile-scroll-172-source.json. Bağımlılık, video, katalog,
  fiyat/stok/schema, hesap/ödeme/e-posta sağlayıcısı değişmedi.

## Kod kapıları
117 dosya /1410 unit PASS; tam lint, typecheck ve webpack production build PASS.
Paketli headless Chromium üretim sunucusunda12profil/63kontrol PASS: ileri/geri
dokunma, opacity/scene bounds, filmseek, ilk/son SKU, detay/teklif, rotation,
reduced tercih değişiminde odak, ilklü hash, saveData/düşük CPU/noJS.
Navbar9boyut,4scroll durumu, iç sayfa→ana sayfa ve fallback PASS. JS hata ve
POST0. Kanıt `docs/referans/qa-172-20261102.json`. Fiziksel cihaz testi yok.

## Durum: KOD VE YEREL KABUL TAMAM / MAIN-API YAYINI SIRADA
Yetkili normal main push ardından exact-commit Actions doğrulaması ve doğrudan
Vercel REST API yayını; makbuz `.cache/task-172/final-receipt.json`.

