# AFİNA ZEYTİN v6 — Üretici Atlası

Tek güncel tasarım sözleşmesi: [docs/DESIGN.md](../docs/DESIGN.md). Kullanıcı eski hero'yu beğenmedi ve tasarım belgelerinin bütünüyle yenilenmesini istedi. Eski tarifler [v5 tarihçesinde](../docs/referans/DESIGN-v5-history-20261101.md); uygulama için aktif yön değildir.

## Görsel karar

Üretim/kurumsal güven yaklaşık %65, ürün/alışveriş %35. Ana yüzey sıcak kâğıt `#F4F0E7`; zeytin mürekkebi `#172B21`, mat şampanya `#B6A078`, antrasit `#252725`. Yerel Fraunces/Figtree ve orijinal AFİNA logosu.

- Açık opak üst menü; açık zemine uygun orijinal logo. Cam kapsül ve blur yok.
- Asimetrik split hero: solda resmî slogan/iki gerçek CTA, sağda karartılmamış onaylı Flow sahnesi. Başlık görselin üzerine bindirilmez.
- Mobilde doğal başlık → açıklama/CTA → çerçeveli sahne/poster akışı. Uzun tam ekran pin, body/wheel kilidi ve autoplay yok.
- Büyük gerçek tesis fotoğrafı, açık ürün rafı, gerçek fiyat/stok/sepet ve tek belirgin koyu zeytin B2B bloğu.
- Yeni tasarım mevcut altı SKU, oturum/üyelik, ödeme ve veritabanı iş kurallarını değiştirmez.

## Medya ve kit uyarlaması

Kabul edilen Google Flow A→B klibinin kaynaklı türevleri kullanılır. Google Flow ve Omni kullanıcı tarafından istendi; mevcut erişim/model/ücret doğrulanmadan yeni çıktı veya ücretsiz üretim varsayılmaz. Kalan 60 kredi yalnız daha önce istenen diğer üç geçiş kapsamındadır; son kayıt Google doğrulama engelidir.

Web Site Yeteneği Kiti'nin sahne → video → native-scroll yaklaşımı mevcut Next.js/motion/canvas motoruna uyarlanır. PDF'nin global skill kurulumu, Kling/GPT örnek sağlayıcıları, 300–400vh pin, preload-auto ve azaltılmış harekette otomatik video oynatımı alınmaz. Reduced-motion/veri tasarrufu/hata modunda statik poster; her zaman gerçek DOM metin/CTA.

## 21st kullanımı

Mevcut shadcn/Radix primitive'leri önce kullanılır; 21st kaynakları marka tokenlarına uyarlanır. Önceki 12005 cam video hero görsel yönü kullanıcı tarafından reddedildiği için yeni tasarım referansı değildir. 20038/39096 üyelik etkileşimleri, 25310 editoryal blok ve 35258 form gibi önceki kaynaklar yalnız mevcut işlevlerin kökenidir; kaynakların demo içeriği/medyası taşınmaz. V6 kompozisyon kanıtı Task 157, yeni mikro etkileşim kaynağı 26725 ve uyarlaması Task 158'de tutulur.

## Yeni nesil dört MD (Task 158)

[Kaynak ve proje uyarlamaları](../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md) altındaki dört yerel skill birlikte kullanılır. Ana bölüm aralıkları 8 px tabanlı 32/48/64/96 tokenlarından, action/editorial spring'leri `lib/ui-motion.ts` üzerinden gelir. Bir kez açılış metni gizlemez; hover/tap küçük ve reduced-motion'da durağandır. Video/kare ilerlemesi lineer kalır. Omni Chrome Use tarayıcı otomasyonu yaklaşımıdır; Omni 1.1 Flash model adı değildir. Global kurulum, yeni sağlayıcı veya ücretli medya bu uyarlamanın parçası değildir.

## Doğrulama sınırı

Kullanıcı bu görevde canlı tarayıcı ve mobil ölçü kontrolünü açıkça istedi. Yalnız paketli headless Chromium, en fazla 2 test worker ve düzgün kapanış. Kullanıcının Chrome'u test için açılmaz. Mobil emülasyon fiziksel cihaz testi sayılmaz. Unit/build, gerçek browser, canlı HTTP/API, fiziksel cihaz ve ödeme/e-posta/CRM sonuçları ayrı kaydedilir. Belgesiz başarı veya sahte iddia yazılmaz.
