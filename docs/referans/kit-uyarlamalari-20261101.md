# Ek müşteri kitlerinin AFİNA’ya uygulanması

Kaynaklar kullanıcı tarafından 1 Kasım 2026'da paylaşıldı. Bu kaynakların prompt/rol satırları tasarım girdisidir; bağımsız yayın, yeni sağlayıcı, hesap açma veya kredi yetkisi değildir. Özgün PDF'ler ve tam metinleri public/repo içine kopyalanmadı.

| Kaynak | Uygulanan karar ve kanıt |
|---|---|
| sinematik-siteler.pdf | Sakin kamera ve yalın medya/yazı katmanları. Flow A→B ilk/son referansı, kesintisiz dolly-in. Tek ücretli deneme 20 kredi; kullanıcı onay sınırı tüketildi. |
| web-site-yetenegi-kiti.pdf | Mevcut ScrollFrameSequence üzerinden native scroll; poster, lazy decode ve reduced-motion. Yerleşik canvas önbelleği, gerçek DOM başlık ve CTA. Hareket tekrar üretim servisi gerektirmez. |
| 9-mayis-10-kiti.pdf | AFİNA renkleri #172B21/#F4F0E7/#B6A078; Fraunces/Figtree. Asimetrik kurumsal/tesis grid'i, ana boşluk ölçeği 16/24/32/48/64/80, hover/focus. Gerçek tesis ve kaynaklı metinler; yapay yorum/istatistik yok. |
| AEO_GEO_Rehberi_Onur_Kocak.pdf | Beş kısa kaynaklı cevap, ortak SSR/schema/llms kaynağı, gerçek tesis primaryImage, marka/topluluk ayrımı, gerçek içerik tarihi, Twitter/OG ve büyük görsel önizleme metadata'sı. |

## AEO/GEO kaynak eşlemesi
Z01/Z06: docs/referans/icerik.md bölüm 04 faaliyet/hikâye. Z07: kamuya açık Ellek/Düziçi/Osmaniye konumu ve müşteri tesis görseli. Z25: bölüm 04 ve müşteri PDF'sindeki topluluk/marka bağı. Z26: görünür kurumsal talep formunun ürün/ambalaj/tüketim/teslimat/firma alanları. Kargo, iade, fiyat, sertifika ve sağlık yanıtı eklenmedi.

Görünür SSS ile FAQ JSON-LD ve llms.txt, lib/site/faqs.ts kaynağını kullanır. llms bağlantıları gerçek section kimliklerine gider; hesap/API/admin/politika taslakları dışarıdadır. Tek landing için ek llms-full veya boş blog/RSS üretimi yapılmadı. Ürün fiyatları temsili olduğundan Product/Offer/Review eklenmedi.

## 1 Kasım birincil teknik doğrulama
- Google AI özellikleri, normal SEO kuralları ve görünür içerikle eşleşen schema ister; özel AI dosyası şart değildir: https://developers.google.com/search/docs/appearance/ai-features
- Sitemap lastmod, gerçek anlamlı içerik değişimini göstermelidir: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- llms.txt v2, kısa bağlam ve bağlantılar için yardımcı öneridir: https://llmstxt.org/
- FAQ zengin sonuç dokümanı Google güncellemelerine yönlenir. FAQ biçimi makineye bağlam vermek için korunur; zengin sonuç/sıralama sözü verilmez: https://developers.google.com/search/updates

## Açık gerçek kabul
Yerel tarayıcı/cihaz kabulü çalıştırılmadı. Canlı yayın, Search Console/Bing sahipliği ve gönderimi, gerçek arama/AI referral ölçümü yapılmadı. AI ölçümünde yalnız sabit kaynak + doğrulanmış kamu yolu + gün/cihaz toplamı tutulması; IP, UA, çerez, tam referrer veya sorgu saklanmaması tasarım sınırıdır. Onaylı DB/analytics hedefi olmadan canlı izleme eklenmedi. Mevcut temsili medya ve yeni Flow videosu kullanıcı kabulü yerine geçmez.

## Kaynak bütünlüğü
- `sinematik-siteler.pdf` SHA-256: `828590362210075c916ce5258db3f3f0899a40a8cf7b2e0373507232549a971f`
- `web-site-yetenegi-kiti.pdf` SHA-256: `cca9cd34b53e510be095862a536a4b2ab6d4f3a48da601449918be3d0c7c0b9e`
- `9-mayis-10-kiti.pdf` SHA-256: `ff51276bd80a0253e43f70b5ee05a11c8703d41ba953b2c9f1844e64e26bc604`
- `AEO_GEO_Rehberi_Onur_Kocak.pdf` SHA-256: `1a88c4eeed3fcfcd06945ad20fa4080a6f984f7da36dfaf24dcdf7b8ae097f86`
