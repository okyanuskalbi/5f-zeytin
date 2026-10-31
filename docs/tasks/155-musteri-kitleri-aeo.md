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

## Coder Notu
- Dört PDF okunup hash'leri kaydedildi; uygulanan kararlar ve kaynak eşlemesi `docs/referans/kit-uyarlamalari-20261101.md` içinde. Özgün PDF/prompt dosyaları public'e veya global skill ayarlarına taşınmadı.
- RED checkpoint `2fca191`: beş ortak cevap, doğru marka/topluluk bağlantısı, gerçek tesis görseli/WebPage ve sabit içerik tarihi eksikliği doğrulandı.
- GREEN: `lib/site/faqs.ts` beş görünür cevabı, FAQPage JSON-LD'yi ve llms.txt'yi besler. Teknik metin içinde sahte fiyat, kargo, politika, yorum veya sertifika yok. Organization.memberOf toplulukla bağı anlatır; ayrı marka aynı varlık diye sameAs ile birleştirilmez.
- Ana sayfa metadata'sı büyük görsel önizlemeye izin verir; Vercel preview için noindex kalır. Twitter büyük kartı açık. Sitemap lastmod gerçek anlamlı içerik tarihi 2026-11-01'dir. WebPage/Place görseli yeni gerçek müşteri tesis fotoğrafıdır.
- Paylaşılan SSS beşe çıktığı için eski v3/v4 layout testleri ve offline HTML kapısının ortak SSS beklentisi beş olarak güncellendi; görsel bütçe ve negatif kontroller korundu.
- Son kontrol: **83 dosya / 1146 test PASS; lint PASS; typecheck PASS; production build PASS**. Derlenmiş HTML'de beş cevap, canonical, robots ve Twitter doğrulandı; aday Flow klibi HTML'de yok. İlk JS gzip 194.186 bayt; CSS gzip 21.188 bayt; inline RSC/bootstrap gzip 47.532 bayt. Bunlar build hesaplarıdır, Lighthouse/gerçek ağ ölçümü değildir.
- Tarayıcı/cihaz doğrulaması, canlı indekslenme/referral ölçümü ve yayın yapılmadı. Kitteki analytics uygulaması için gerçek hedef/ölçüm kabulü açık; canlı izleme başlatılmadı.

## Durum: TAMAMLANDI
