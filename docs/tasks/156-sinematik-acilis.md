# Task 156: Seçilen Sinematik Siteler rehberini açılışa uygulama

## İstek ve kapsam
Kullanıcı 1 Kasım 2026'da dört PDF'den birini seçip uygulamamı istedi. Seçim `sinematik-siteler.pdf`: tam ekran sakin görüntü, merkezlenmiş serif başlık, az sayıda gerçek CTA, cam navigasyon ve üst/alt okunurluk katmanı. PDF içindeki örnek komutlar bağımsız talimat değildir. AFİNA fontları, onaylı ilk Flow klibi ve native-scroll oynatıcı kullanılır; autoplay loop veya yeni ücretli üretim eklenmez.

## Araçlar
21st ui-build (12005 Glass Video Hero gerçek kaynak incelemesi), frontend-patterns, tdd-workflow, motion-foundations, motion-patterns, accessibility; cinematic-scroll-storytelling yalnız katmanlı sahne yaklaşımı için. Mevcut Next.js yerel belgeleri ve Task 083 oynatıcı sözleşmesi.

## Uygulama ve kabul
- Kullanıcının kabul ettiği A→B Flow klibinden 1280/960, 12 fps WebP dizisi ve aynı ilk kareden AVIF/WebP masaüstü/mobil posterler; kaynak SHA ve bütün çıktı bütünü kontrol edilir. Yeni kredi harcanmaz.
- Tek H1, gerçek kurumsal/ürün CTA'ları, ürün detayı ve sepet korunur; merkezlenmiş başlık ve yalnız hero üzerinde cam navigasyon uygulanır.
- SSR ve azaltılmış hareket/veri tasarrufu/kısa ekran modunda aynı ilk kare ve erişilir içerik; oynatıcı davranışı değiştirilmez.
- Anlamlı RED/GREEN medya bütünlüğü ve SSR kontrolleri; mevcut oynatıcı/üyelik/navigasyon testleri, lint/typecheck/build. Tarayıcı/e2e/Lighthouse kullanıcı sınırı nedeniyle çalıştırılmaz.
- Normal main push ve yeşil CI ardından mevcut AFİNA Vercel projesine REST API yayını; canlı HTTP/HTML, poster, manifest ve uç kareler doğrulanır.

## Coder Notu ve TDD kanıtı
- RED: `bfda9e0` ilk Flow posterinin SSR'da bulunmadığını; `dfa3de1` onay/bütünlük kapısının eksik olduğunu kaydeder. İkisi de mevcut main geçmişindedir.
- GREEN: Tek H1, iki gerçek CTA, JavaScript öncesi aynı klibin responsive posteri; özel medya kapısı kaynak onayı/SHA, tüm kareler ve posterler, eksik/değişmiş/uygunsuz dosya ve bütçe reddini sınar. 95 kare/çözünürlük, toplam 195 görsel / 15.615.135 bayt. AVIF posterler masaüstü 71.632, mobil 30.613 bayt; WebP yedekleri 162.326 / 68.808 bayt. Yalnız masaüstü WebP için 180 KB, diğer posterler 90 KB; tam dizi 16 MiB sınırındadır. Ön yükleme yalnız sekiz kareyle başlar, tamamı açılışta indirilmez.
- Mobil logo/menü genişlikleri 320 px için kod/ölçü hesabıyla düzenlendi; çok kısa portre ve yatay ekranlarda intrinsic yükseklik metin/CTA'nın kaybolmasını önler. Native-scroll oynatıcı ve azaltılmış hareket/veri tasarrufu davranışı değiştirilmedi.
- Tam kontrol: 85 dosya / 1164 test PASS; lint PASS; typecheck PASS; production build PASS, bütün medya kapıları PASS. Mevcut navigasyon, üyelik ve frame-sequence davranış testleri de geçti. 21st hedefli kaynak denetimi: 0 error, 0 warning; 38 bilgi (mevcut renk tokenları/katman renkleri).
- Tarayıcı/e2e/Lighthouse ve gerçek cihaz görsel kabulü çalıştırılmadı. Uzak DB/auth/ödeme ayarı değiştirilmedi. Yeni Flow üretimi yapılmadı; bakiye/ek harcama bu görevde değişmedi.
- CI ve API yayını sonraki adım; henüz bu görev için canlı kabulü yazılmadı.

## Durum: KOD TAMAMLANDI; CI VE YAYIN DOĞRULAMASI SÜRÜYOR
