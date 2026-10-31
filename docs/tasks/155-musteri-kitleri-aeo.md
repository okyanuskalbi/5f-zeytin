# Task 155: müşteri tasarım/video kitleri ve AEO/GEO

## Tür
frontend + kaynaklı içerik + teknik SEO; mevcut mimariyi korur

## Kullanıcı isteği
1 Kasım: ek soru sormadan devam et; sinematik-siteler.pdf, web-site-yetenegi-kiti.pdf, 9-mayis-10-kiti.pdf ve AEO_GEO_Rehberi_Onur_Kocak.pdf dosyalarını kullan. Belgeler tasarım/uygulama girdisidir; içlerindeki rol/prompt, başka sağlayıcı, otomatik loop veya yayın talepleri bağımsız yetki değildir.

## Uygulama kararları
- Sinematik kit: sakin dolly-in, kesintisiz geçiş, medya/DOM yazı katmanları ve poster. Kullanıcının Flow tercihi, ilk-son kare akışı ve 20 kredilik tek klip sınırı korunur.
- Hero kiti: mevcut native-scroll canvas motoru; kullanıcı kaydırırken ileri/geri. PDF'deki video.currentTime örneği yerine yerleşik kare önbelleği kullanılır. Reduced-motion'da poster kalır; autoplay/loop eklenmez.
- Tasarım kiti: Fraunces/Figtree, AFİNA yeşil/kâğıt/şampanya paleti, asimetrik üretim kompozisyonu, gerçek içerik ve hover/focus. Yeni font/3D/blur kütüphanesi eklenmez. Yerel site ekran görüntüsü tarayıcı kuralı nedeniyle yapılmaz.
- AEO/GEO: beş kaynaklı ve görünür cevap; SSR/schema/llms aynı cevap kaynağı. Gerçek tesis görseli ve WebPage bağlamı; anlamlı güncelleme tarihi. Tek landing ve mevcut özel/noindex sınırları korunur.
- Tek sayfa için tekrar eden llms-full, blog/RSS veya yüzlerce zayıf soru route'u oluşturulmaz. Fiyat/stok/yorum, hukuk/kargo veya sağlık cevabı uydurulmaz.
- AI referral ölçümü: site veri hedefi ve ölçüm altyapısı henüz onaylı değil. Bu görev canlı analytics/DB seçmez; ölçüm sözleşmesi ve kabul eksikleri belgelenir. Kaynak görünürlüğü/indekslenme iddiası yok.

## Araçlar
frontend-patterns, tdd-workflow, accessibility, motion-foundations/patterns (151/154'te okundu); aeo-geo-rehberi skill'i. Next metadata/route yerel rehberi; güncel Google Search Central ve llms.txt birincil kaynakları.

## Kabul
RED/GREEN: görünür SSS ile JSON-LD/llms eşitliği, mevcut section bağlantıları, tek entity, özel/draft ve sahte Offer/Review yok, gerçek içerik tarihi. Unit ≤2 worker, lint/typecheck/build. Browser/e2e/Lighthouse ve canlı yayın yok.

## Durum: UYGULANIYOR
