# AFİNA v9 — Hasat Rotası: doğrulama kaydı

## Kaynak ve mevcut kapılar

Son runtime kaynağı **`31f251cee2e8b83601fbc2cb3a376c979011f39f`**; GitHub CI **41317227401 SUCCESS**. Vercel REST API dağıtımı **`dpl_46Scpv4MqVnjKxb1pYt1bjwSD4Hq` READY**, apex ve www alias'ları bağlı. Son kaynağın HTTP/medya/font ve canlı Lighthouse kabulü doğrulandı. **Son canlı UI kabulü TAMAMLANDI:**87e2e PASS/8responsive skip; altı boyutta görsel/axe/taşma/JS/HTTPkaynak hatası0; native40/41/40kare ve iki gerçek film döngüsü doğrulandı.

Kanıtlar proje içindeki `.cache/task-161/` altında tutulur. Kaynak yükleme manifesti `source-manifest.json`, CI sonucu `ci-watch-polish.log`; bu kayıt runtime dosyası değiştirmez. [BRIEF](BRIEF.md), [PLAN](PLAN.md), [COPY](COPY.md), [21st kaynak provenansı](21ST-SOURCES.json) ve [aktif DESIGN](../../../DESIGN.md) ile birlikte okunur. Önceki v8 yayını ve ilk v9 dağıtımı son kaynak kabulünün yerine geçmez.

## Yerel test ve davranış

| Kapı | Gerçek sonuç | Kanıt |
|---|---|---|
| Unit | **91 dosya, 1208 test PASS** | `unit-final.log` |
| ESLint | `eslint . --max-warnings=0` PASS | `lint-final.log` |
| TypeScript | Tip üretimi ve typecheck PASS | `typecheck-final.log` |
| Production build | Derleme, TypeScript ve statik sayfa üretimi PASS | `build.log` |
| Son yerel e2e | **87 PASS, 8 responsive SKIP, toplam 95** | `e2e-final-local.log` |
| 21st kaynak incelemesi | **39 dosya; 0 error, 0 warning, 39 bilgi düzeyi öneri** | `21st-review.json` |

Sekiz skip başarısız davranışın gizlenmesi değildir: masaüstü scrub/yeniden ölçüm testleri 320/390/768 genişliklerinde altı kez; native telefon/tablet testi 1024/1440 masaüstünde iki kez uygulanmaz. İlgili varyantlar kendi viewport'larında test edilir. Bilgi düzeyi renk önerileri ham 21st raporunda korunur; rapor “öneri 0” diye sunulmaz.

E2e kapsamı gerçek altı SKU ve aynı detay/sepet kimliğini, yalnız tarayıcıya ait yerel sepeti, mobil menü Escape/odak dönüşünü, üyelik giriş yüzeyi ve hukuk bilgisi açılırken alan değerlerini, galeri odak/son ürün/lineer ilerleme/serbest bırakmayı, tercih değişimi ve resize yeniden ölçümünü kapsar. SKU ve B2B segmenti aynı teklif alanlarına gider; doğrulama ve KVKK sonrası gerçek, henüz gönderilmemiş özet ile doğru mailto URI doğrulanır. Reduced-motion, saveData ve JavaScript kapalı yollar ayrıca test edilir. Gerçek hesap, ödeme, müşteri talebi veya e-posta teslimi yapılmaz.

## Altı genişlik ve galeri geometrisi

Yerel [sonuç kaydı](../../../../.cache/task-161/local/results.json) 1440, 1024, 768, 390, **360×640** ve 320 genişliklerini içerir. Yedi bölümün her birinde `scrollWidth` gerçek viewport genişliğine eşittir. Her genişlikte axe ihlali, pageerror ve başarısız kaynak listeleri **0**; bölüm ve tam sayfa görselleri aynı klasördedir. Viewport kontrolü fiziksel telefon kabulü değildir.

| Genişlik | Galeri modu | Ölçülmüş yol | Son örnek |
|---|---|---|---|
| 1440 | Doğrudan lineer scrub | 1099 px | `p=1`, `x=-1099 px` |
| 1024 | Doğrudan lineer scrub | 898 px | `p=1`, `x=-898 px` |
| 768 | Native yatay rail | 1153 px | `scrollLeft=1153`, transform yok |
| 390 | Native yatay rail | 1510 px | `scrollLeft=1510`, transform yok |
| 360 | Native yatay rail | 1540 px | `scrollLeft=1540`, transform yok |
| 320 | Native yatay rail | 1520 px | `scrollLeft=1520`, transform yok |

Masaüstü ara örnekleri `x = −travel × progress` eşlemesini doğrudan izler: 1440'ta yaklaşık %20/%40/%60/%80 için −220/−440/−659/−879 px. Spring gecikmesi yoktur. Pin yalnız uygun en az 1024×860 normal hareket/ölçülmüş JS yolunda vardır; kısa ekran, telefon, reduced ve JS kapalı durumlarda native rail'e dönülür. Son ürüne erişim ve odaklanan kartın görünmesi e2e ile ayrıca sınanır.

## Native Scroll Craft ve kompozit okunurluk

[Üç koşu makbuzu](../../../../.cache/task-161/local/scrollcraft-runs.json): desktop, mobile ve reduced **exit 0**. Ham `report.json`, `run.log`, bütün kareler ve contact sheet her koşu klasöründedir.

| Koşu | Yerleşmiş örnek | Clip bulgusu | Medya üstündeki en düşük örneklenmiş kontrast | Console error |
|---|---|---|---|---|
| Desktop | 40/40 | 0 | **5,19:1** | 0 |
| Mobile | 41/41 | 0 | **6,42:1** | 0 |
| Reduced | 40/40 | 0 | **5,19:1** | 0 |

Üç log da “no dead scroll detected” ve örneklenmiş bütün medya cue'larında en kötü karede 4,5:1 üzerini bildirir. Bu, bütün olası video kareleri/cihazlar için sınırsız kontrast garantisi değildir; kayıtlı pikseller ve axe/viewport turuyla sınırlıdır.

Ham Scroll Craft ağ listelerinde gezinme sırasında iptal edilmiş Next RSC ön-getirme istekleri vardır: desktop 4, mobile 4, reduced 3; `/hesabim` ve `/sepet` için `_rsc` istekleri. Bu listeler silinmedi veya “ham ağ hatası 0” diye değiştirilmedi. Altı genişlikteki ayrı kaynak kontrolü sıfır başarısız görsel/film/font kaydı verir. Gerçek `/hesabim` erişim kapısı ve sepet davranışı e2e/HTTP ile ayrıca doğrulanır.

Cihaz grameri masaüstünde **parallax → pan → parallax → reveal → flow → flow → reveal**. Baskın mekân hissi hero/tesis parallax'ıdır; dört aile **pan, parallax, reveal, flow** gerçekten farklı sorumluluk taşır. Galeri tek belirgin pan zirvesidir. Telefon ve reduced koşusunda galeri flow/native olur; raporda kalan bölüm cihaz etiketleri tek başına reduced modda animasyon oynadığı anlamına gelmez. Bütün içerik SSR'da vardır; body/wheel/touch yakalama veya ikinci scroll motoru yoktur.

## Görsel yazar kontrolü ve BRIEF'teki hisler

[Desktop contact sheet](../../../../.cache/task-161/local/scrollcraft-desktop/sheet.png), [mobile contact sheet](../../../../.cache/task-161/local/scrollcraft-mobile/sheet.png) ve [reduced contact sheet](../../../../.cache/task-161/local/scrollcraft-reduced/sheet.png) açılıp görsel olarak okundu. Aşağıdaki değerlendirme yazarın kanıt üzerindeki yorumudur; kullanıcı beğenisi veya kullanıcı araştırması sonucu değildir.

| BRIEF'teki his | Görüntüde/işlevde gözlenen karşılık | Sınır |
|---|---|---|
| Sakin yakınlık | Gerçek zeytinlik ağacı, solda sabit iki satır slogan ve yeşil ürün eylemi; ayrı bir intro bekletmesi yok. | Tam geniş film açılışı v7 ile ortak biçimdir; tek başına özgünlük puanı değildir. |
| Keşif → karar | Ambalajlar aynı rafın içinde açılır; ilerleyen rail gerçek son ürüne ulaşır. “Teklife ekle” seçimi aynı SKU'yu forma taşır. | Ekran görüntüsü seçim aktarımını kanıtlamaz; bu bağ e2e ile ayrıca doğrulandı. |
| Güven | Ellek'in gerçek yeşil/siyah tesis fotoğrafı ve kısa kaynaklı yer/adres metni, galeri sonrasında sakin bir kanıt yüzeyi oluşturur. | Görüntü kapasite, sertifika veya üretim hattı denetimi değildir. |
| Bağ kurma | Büyük ağaç fotoğrafı ile iki küçük tesis/şişe sahnesi aynı toprak–tesis–sunum anlatısını kurar; telefonda sırayla okunur. | Onaylı sahne görselleri gerçek süreç videosu gibi sunulmaz. |
| Kontrol | Canlı yeşil B2B alanında üç eşdeğer segment ve ardından taş zeminde açıkça açıklanmış taslak formu vardır. | Site e-postayı kendisi göndermediğini söyler; otomatik teslim hissi uydurulmaz. |
| Yönünü bilme | Native beş cevap, gerçek adres/yol tarifi, ürünlere dönüş ve orijinal marka/legal kapanışı okunur. | Adres/footer çözümü önceki sürümlerle akrabadır; fark diye sayılmaz. |

Yazar kontrolünde belirgin zirve galeridir; fotoğraf/bento ve B2B/teklif sonrasında ikinci bir pin veya içeriksiz sessiz viewport görülmedi. Mobilde bağımsız ön dal katmanı gizlenir, doğal video kadrajı ve metin korunur. Son polish'te H1 ve açıklama düz SSR HTML'dir; yalnız CTA grubunda y eksenli giriş kalır. Ön dal görseli lazy/low öncelikli yüklenir. Bu düzen film/animasyon hazır olana kadar metni saklamaz.

## Kanonik fingerprint karşılaştırması

[Mevcut fingerprint kayıtları](../../FINGERPRINTS.md) geçmiş satırları değiştirilmeden son canlı kabulden sonra v9 shipped satırı eklendi. Renk/font/isim değişimi fark puanı değildir. İncelenen geometri ve çalışan signature üzerinden muhafazakâr karşılaştırma:

| Önceki sürüm | Grammar | Nav | Hero device | Act sequence | Close | Signature | Fark |
|---|---|---|---|---|---|---|---|
| v6 Üretici Atlası | Farklı | Farklı | Farklı | Farklı | Ortak | Farklı | **5/6** |
| v7 Zeytinin İçinden | Farklı | Farklı | **Ortak** | Farklı | Ortak | Farklı | **4/6** |
| v8 Object journey | Farklı | Farklı | Farklı | Farklı | Ortak | Farklı | **5/6** |

V7 karşılaştırmasında tam geniş film+overlay slogan ortaklığından dolayı hero puanı verilmedi. V9 grammar ve signature farkı yalnız videonun değişmesi değildir: gerçek SKU'nun yatay raftan işletme segmentiyle aynı doğrulanmış talep taslağına taşınması, galerinin tek zirve olması ve yedi bölüm sırasının bunun çevresinde kurulmasıdır. Büyük marka/adres/legal kapanışının benzerliği üç karşılaştırmada da puan almaz. Son canlı kabul ve kesin makbuzla bu karşılaştırma v9 shipped kaydı olarak sahiplenildi.

## Son film, poster ve fontlar

Kaynak [pro-loop.json](../../../../lib/media/pro-loop.json): kullanıcı kabulü olan A→B, kaynak SHA `be77f66a14e418791093fe53937598204313a99f6368204f1fbf6ebaacf14171`. Kaynak kare 6..65 üzerinde ileri/geri yerel kurgu; **yeni ücretli üretim 0 kredi**. Son türev **1280×720, 24 fps, 120 kare, 5 saniye, sessiz H264/yuv420p/faststart**, **2.742.609 bayt**; SHA-256 **`1a9b941dce0ab46c09570766458508647887dee7e2b9d2897b2a5a70108c5719`**.

İlk IDR paketi son kareye aynen taşınmıştır. `optimized-seam.log` decoded ilk/son piksel eşliğini **SSIM 1,000000** verir; aynı ölçümde bütün RGB kanalları 1'dir. Bu kapanış eşliği ileri/geri kamera dönüşünün fiziksel olarak kesintisiz çekim olduğu anlamına gelmez. `optimized-vs-v1.log`, önceki 6.847.142 baytlık kodlamayla 120 kare üzerinde **SSIM 0,968635** verir. Önceki byte/kalite ölçümleri tarihçedir; son dosya küçülürken ölçülen görsel fark gizlenmez. Daha önceki ara `opt-seam-ssim.log` nihai dikiş sonucu değildir; nihai kanıt `optimized-seam.log`dur.

Son hero posteri AVIF **76.119 bayt**, SHA `3b174344ec775e4c0898493fbcc598102c1add25a1da272f4a5c16af4222030d`; WebP fallback **217.778 bayt**. OG, onaylı şişe/marka görseli **1200×630, 56.108 bayt**. Daha önceki 75.957 bayt poster son polish öncesi tarihseldir. Gerçek loop oynatımı, iki dikişten geçme, pause/ekran dışında durma e2e kapsamındadır; reduced/saveData MP4 isteği başlatmaz.

[Font provenansı](../../../../lib/media/pro-fonts.json): **yerel Türkçe alt küme Inter 44.740 bayt**, **Fraunces 62.948 bayt**. Inter kaynak Google Fonts commit'i `e1d6480102fed30739fead0faee463101f892c8f`, OFL `app/fonts/Inter-OFL.txt`; Fraunces mevcut yerel kaynaktan, OFL `app/fonts/OFL.txt`. Türkçe harf/para birimi karakterleri, boyut ve SHA manifestte doğrulanır; Google font servisine runtime isteği gerekmez. Bu, global font veya sağlayıcı kurulumu değildir.

## İlk canlı sürümde bulunan hata ve gerçek düzeltme

İlk v9 kaynak **`0f1e4ec`** için `e2e-first-live.log`: **85 PASS, 8 SKIP, 2 FAIL**. İki hata 1024/1440'ta cam navigasyonun okunur kontrolleri/orijinal logo testindedir. Bu sonuç tamamlanmış canlı kabul diye yazılmadı.

Neden, statik/uyumluluk SSR yolunda `usePathname()` henüz değer vermediğinde landing'in false kabul edilmesiydi. Navbar'ın son kaynak kararı **`!pathname || pathname === "/"`**; ilk HTML'de kâğıt/cam landing tonu ve uygun orijinal logo korunur. H1/açıklama ilk içerik kararlılığı ve medya/font yükü de son polish'te düzeltildi. Son yerel 87/8 sonucu bu kaynakla yeşildir; canlı HTTP artık `ssrNavigation: "paper"` doğrular. İlk iki başarısızlık tarihçeden çıkarılmadı. Son canlı UI koşusu87PASS/8responsive skip ile tamamlandı; ilk logo hataları giderildi.

## Lighthouse: yöntemleri ayıran gerçek ölçümler

Lighthouse **13.5.0**, yalnız performans/erişilebilirlik kategorileri. Mobil profil 412×823, DPR1,75; fiziksel telefon değildir. Simulated ve DevTools uygulamalı throttling sonuçları birbirinin yerine sunulmaz. Mobil yapılandırma: RTT150 ms, request latency **562,5 ms**, download **1474,56 Kbps**, upload675 Kbps ve **4× CPU**. DevTools koşusu ayrıca 5250 ms bekleme/quiet ayarlarını kullanır; varsayılan simülasyon koşusu 1000 ms kullanır.

| Ortam / yöntem | Performans | Erişilebilirlik | LCP | TBT | CLS |
|---|---|---|---|---|---|
| Yerel, varsayılan mobil simülasyon | **86** | 100 | **4183,0285 ms** | 1 ms | 0,000327008 |
| Yerel, mobil DevTools throttling | **100** | 100 | **868,35 ms** | 0 ms | 0,000006560 |
| Yerel, masaüstü simülasyon | 100 | 100 | 821,17 ms | 0 ms | 0,000048898 |
| **Son canlı, varsayılan mobil simülasyon** | **100** | **100** | **1325,665 ms** | **9 ms** | **0,000333568** |
| **Son canlı, masaüstü simülasyon** | **99** | **100** | **923,183 ms** | **0 ms** | **0,000025524** |
| Son canlı, mobil DevTools throttling | **98** | 100 | **1019,23 ms** | 7,081 ms | 0,000327008 |

Yerel 86 ve ayrı yerel DevTools100 tarihsel ölçümleri korunur; “mobil her koşulda100” veya “yerel varsayılan simülasyon100” iddiası yoktur. **Son production mobil ve masaüstü performans kapıları PASS**; eski yerel86 yüzünden bu kapı açık bırakılmaz. Canlı varsayılan/DevTools ölçümleri farklı yöntemlerin somut sonuçlarıdır; alan verisi/CrUX veya fiziksel telefon sonucu değildir.

Ham ölçümler `local/lighthouse/{mobile,desktop,mobile-actual}.json` ve `live/lighthouse/{mobile,desktop,mobile-actual}.json`; özetler her klasörde `summary.json`/`actual-summary.json`. Komut logları `lighthouse-local.log`, `lighthouse-actual-local.log`, `lighthouse-live.log` ve `lighthouse-actual-live.log` altındadır. İlk yayın ve son kaynak ölçümleri birleştirilmez.

## Son canlı HTTP ve UI kabulü

[Canlı HTTP kaydı](../../../../.cache/task-161/live/http.json), **2026-11-01 14:44:01 UTC**:

- Apex200; yedi bölüm sırası ve SSR kâğıt navigasyonu doğru, www200.
- Dört medya dosyası ve iki yerel fontun canlı byte/SHA değerleri manifestlerle eşleşir.
- Video range206; `bytes 0-63/2742609` doğru toplam boyutu bildirir.
- Giriş, kayıt, KVKK, mesafeli satış, iade, sipariş takip ve ürün API yolları200.
- Oturumsuz hesap/sipariş ve admin ürün API'leri401, private/no-store; `/hesabim`307 ile girişe döner.

Son canlı e2e **87PASS/8responsive skip/toplam95**; altı boyutta görsel/axe/taşma/JS/HTTPkaynak hatası0. Canlı native Scroll Craft desktop40/mobile41/reduced40kare; dead-scroll0, min örneklenmiş kontrast5,20/5,94/5,19:1, consoleerror0. Her koşuda3gezinme RSC iptali ham kanıtta korunur. Bu sayılar final source31f251c'nin ayrı canlı koşularından alındı. Kullanıcı hesabı oluşturma, gerçek ödeme, müşteri talebi gönderimi, SMTP teslimi, WhatsApp hattı ve fiziksel telefon kabulü yapılmış sayılmaz. Çalışan kurumsal yol, açıkça çatı şirket `info@afina.com.tr` / `+903288827708` için kullanıcı tarafından gönderilen mailto taslağıdır; otomatik backend teslimi değildir.


## Doğal oynatım, son kanıt ve kapanış

Canlı filmde gerçek `requestVideoFrameCallback` ile iki doğal döngü:216paint callback,245decoded kare,9.011,2ms gözlem; süre5sn,muted/looptrue. Native Scroll Craft raporundaki clips0, sayfanın scrub video kullanmamasıdır; autoplay oynatımının kanıtı bu ayrı gözlem ve e2e'dir. Hiçbir POST/müşteri/sipariş/e-posta yazımı yapılmadı.

16,88sn/1440×900 canlı UI önizlemesi `.cache/task-161/live/site-preview.mp4` (4.440.644B,SHA815c81bb64b3f163affc6aae7a9eda0e00ee7a03e6eced12b100eb5ca3e9c327); açılış, galeri, tesis, hikâye, segment/form, SSS ve kapanışı içerir. Son desktop/telefon contact sheetleri ve piksel görselleri de açılıp okundu. Yazar his kontrolü BRIEF ile uyumlu; kullanıcı beğenisi sonucu iddia edilmez.

Nihai [QA makbuzu](../../../referans/qa-161-20261101.json) ve [yayın makbuzu](../../../referans/yayin-pro-v9-20261101.json) source31f251c'yi kaydeder. Test tarayıcıları ve açılan3018/3019/3020Next süreçleri düzgün kapatıldı; yetim sahip olunan süreç yok.
