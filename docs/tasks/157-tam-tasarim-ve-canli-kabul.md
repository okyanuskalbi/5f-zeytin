# Task 157: Tam tasarım yenileme ve canlı masaüstü/mobil kabul

## İstek
Kullanıcı canlı siteyi tarayıcıda ve mobilde kontrol edip eksikleri düzeltmeyi istedi; hero'yu beğenmedi ve tüm DESIGN.md/tasarım kayıtlarının değiştirilmesini istedi. Son yön Google Flow ve Omni ile çalışma, Web Site Yeteneği Kiti'ni rehber alma. Bu açık istek eski tarayıcı çalıştırmama sınırını kaldırır.

## Tasarım yönü
Üretici Atlası: zeytin üreticisine ait açık, sakin yüzey; karartılmış ortalanmış hero/cam menü yerine metin ve karartılmamış hareketli zeytinlik görüntüsünü ayıran asimetrik kompozisyon. Mobilde doğal içerik akışı. Müşteri PDF'sindeki üretim/kurumsal yaklaşık %65, ürün/alışveriş %35 dengesi; gerçek tesis fotoğrafı, mevcut altı ürün ve gerçek işlemler korunur. Tasarım sözleşmesi ve 21st bağlamı tek güncel v6'ya yenilenir, eski yönergeler arşivlenir.

## Araçlar
frontend-design, browser-qa, 21st ui-build, frontend-patterns, tdd-workflow, accessibility, motion-foundations/motion-patterns. Başlıca medya aracı Google Flow ve Omni; ücret/model önce ekranda kontrol edilir. Mevcut kalan 60 kredi yalnız daha önce yetkilendirilen üç geçiş kapsamındadır; yeni ücretsiz Omni düzenlemesi ancak gerçekten 0 kredi ise yapılır. Güvenlik engeli atlanmaz.

## Kabul
- Canlı mevcut durum: 1440, 768, 390, 320 px; tam sayfa ve açılış görüntüleri, temel etkileşim/console/network/taşma kaydı.
- Yeni tasarım: tek açık metin/görsel kompozisyonu, sade açık menü, ürün ve tesis anlatımının tutarlı yeniden düzenlenmesi; metin/CTA/üçüncü taraf bağları bozulmaz.
- Canlıda tespit edilen gerçek UX hatalarına odaklı RED/GREEN testler; auth/sipariş/ödeme sağlayıcıları veya DB hedefleri kendiliğinden etkinleştirilmez.
- En fazla 2 test worker; yalnız paketli headless Chromium. Fiziksel cihaz testi diye sunulmaz. Ekran görüntüleri PII içermez.
- Unit/lint/typecheck/build ve hedefli headless kabul; normal push + yeşil CI + Vercel REST API yayını + canlı masaüstü/mobil tekrar kabul.

## Coder Notu / RED → GREEN
- Gerçek canlı başlangıç: 1440/768/390/320 px Chromium. Mobil belge 527 px'e taşıyordu; kaynak `journeyGrid` tek sütunundaki min-content genişliğiydi. `minmax(0,1fr)` ve minimum genişlik sınırıyla düzeltildi; taşma gizlenmedi.
- RED commit'leri: `b79a863` üyelik KVKK bağlantısında form kaybı, `e45684b` yeni mobil sahne/poster eşliği, `ecdbcd6` canlı hero/menü/taşma kabulü. `ad5affe` görünür metnin ekran dışındaki sahneye kare isteği başlatmasını engelleyen ek RED'dir. Son canlı RED 15 kontrolde 10 beklenen FAIL / 5 PASS. Ürün modalı ve mobil menünün temel odak davranışı önceden de çalışıyordu.
- v6 uygulama: metin/görüntü ayrımı, onaylı Flow penceresi ve onaylı gerçek ürün packshot'ı, açık orijinal logo/header, açık ürün rafı ve footer, okunur yağ şişesi sahnesi. Genel amaçlı medya oynatıcıya isteğe bağlı `framed` düzeni eklendi; varsayılan eski sticky davranış değişmedi. Mobilde aynı tam ilk kare kullanılarak poster/canvas kadraj sıçraması önlendi.
- Kayıt formundaki KVKK `_blank` bağlantısı artık pencereyi kapatıp bilgileri silmiyor; modifier tıklamaları da korunur. Normal Next.js sayfa geçişi, Escape ve odağın tetikleyiciye dönmesi korunur.
- Yerel GREEN: 85 dosya / 1171 unit test PASS; lint/typecheck/build PASS; 4 genişlikte 28 Chromium etkileşim testi PASS (hero, menü/odak, tüm bölüm genişlikleri, ürün modalı, yerel sepet ve gerçek üyelik giriş yüzeyi). Sepet testi yalnız yalıtılmış tarayıcı depolaması; sipariş/ödeme/hesap kaydı gönderilmedi.
- Görsel/axe kontrolü 1440/768/390/320 px: taşma 0, pageerror 0, kaynak HTTP hatası 0; ilgili axe WCAG taraması ihlali 0. İlk 320 px taramasında bulunan iki Select/Professional yazı kontrastı ve görsel incelemedeki sepet sayacı kontrastı düzeltildi. Bu otomatik tarama tam erişilebilirlik/ekran okuyucu veya fiziksel cihaz kabulü değildir.
- Animasyonun kareleri kaydırmayla ilerledi; son kadrajın görsel ekrandan çıkmadan bitmesi için framed bitiş aralığı öne alındı. Kısa mobil ekranlarda poster; 1440×1000 reduced-motion koşusunda canvas 0 / kare isteği 0, içerik ve CTA erişilir.
- 21st gerçek kaynak: Editorial Collage Hero 19074. Hedefli inceleme 0 error, 0 warning, 23 bilgi. Demo görselleri/yeni bağımlılık taşınmadı. Eski DESIGN.md birebir `docs/referans/DESIGN-v5-history-20261101.md` arşivine alındı.
- Google Flow'da **Omni 1.1 Flash** seçildi; B→C başlangıç/bitiş kareleri ve istemi hazırlandı. Ekranda 720p/8 sn./16:9/x1 için 12 kredi doğrulandı (üç geçiş 36 kredi; mevcut 60 sınırı içinde). Sayfa yenilendikten sonra da reCAPTCHA bağlantı engeli sürüyor; üretim gönderilmedi, ek kredi kullanımı 0. Mevcut klibi Omni ile ayrı düzenleme maliyeti [resmî kredi tablosunda](https://support.google.com/flow/answer/16526234?hl=en) 40 kredi olduğundan bu kapsam dışı işlem başlatılmadı. Önceki yetkili üç geçiş üretilmiş gibi sunulmaz; sitede mevcut kabul edilmiş klip kullanıldı.
- API yayını: kaynak `9b7b505c2623833ceb97013ffda5c389e26fb4f7`, [CI 41280711961](https://github.com/okyanuskalbi/5f-zeytin/actions/runs/41280711961) SUCCESS; `dpl_DRCshLDGWbDcVPPZvmTerhyU7aR5` READY ve afinazeytin.com/www alias'ları bağlı. Canlıda 28/28 Chromium etkileşim testi PASS; dört genişlikte ek görsel/axe/console/network kabulü PASS. Ana sayfa HTTP 200 + 9 medya/hash isteği eşleşti. Kaydırmada kareler 1440 px'te 0→42, 768 px'te 0→30; reduced-motion canvas/kare isteği 0. Kanıt `docs/referans/yayin-v6-20261101.json` ve `qa-157-20261101.json`.
- Google OAuth, teklif gönderim servisi, ödeme ve uzak müşteri migration'ı bu görevde etkinleştirilmedi; fiziksel telefon kabulü yapılmadı. Tarayıcılar düzgün kapandı; başlatılan yerel 3018/3019 sunucularının kapanışı doğrulandı.

## Durum: TASARIM, YAYIN VE TARAYICI KABULÜ TAMAM; YENİ FLOW/OMNI ÜRETİMİ GOOGLE DOĞRULAMASINI BEKLİYOR
