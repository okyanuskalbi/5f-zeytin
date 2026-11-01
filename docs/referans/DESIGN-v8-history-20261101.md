# AFİNA ZEYTİN v8 — Object journey

## Güncel yön ve durum

Task 160: kullanıcı Scroll Craft, frontend-design, frontend-ui-engineering ve Taste ile tasarımı değiştirmeyi, verdiği Google Flow projesini kullanmayı istedi. Önceki “sormadan devam et” yaratıcı devri geçerlidir. [BRIEF](scrollcraft/builds/afina-v8/BRIEF.md) kullanıcı alıntılarını yazılmış yaratıcı kararlardan ayırır; [PLAN](scrollcraft/builds/afina-v8/PLAN.md), [COPY](scrollcraft/builds/afina-v8/COPY.md) ve [VERIFICATION](scrollcraft/builds/afina-v8/VERIFICATION.md) uygulama öncesinde yazıldı.

Bu dosya tek aktif tasarım sözleşmesidir. Önceki v7 dosyası byte-identical [v7 tarihçesine](referans/DESIGN-v7-history-20261101.md) alındı; [v6](referans/DESIGN-v6-history-20261101.md)/[v5](referans/DESIGN-v5-history-20261101.md) ve yayın makbuzları tarihçedir. V8 [afinazeytin.com](https://afinazeytin.com) üzerinde Vercel API **READY**: kaynak `179df851686a34d09a1e965315dc5e902a30c362`, CI 41304790349 SUCCESS, dağıtım `dpl_7EUijPZwcnzr9ML3nHMFRwUErZ89`. READY yayını ve ayrı canlı etkileşim/görsel kabulü doğrulandı.

Yerel kabul: 89 dosya/1200 unit, tam ESLint/typecheck/build PASS; 74 e2e PASS + 6 responsive skip (80 toplam); 1440/1024/768/390/360×640/320 görsel/axe/taşma/pageerror/kaynak hatası0. Motion/JavaScript kapalı/reduced kontrolleri PASS. Native Scenes exit0; inspector 1 FAIL/5 WARN ham sonuçları ve semantik gerekçeleri korunur; inspector0 iddiası yok. 21st/Taste kaynak review tamam.

Canlı kabul: **TAMAMLANDI** — 74 e2e PASS + 6 responsive skip; 1440/1024/768/390/360×640/320 görsel/axe/taşma/pageerror/başarısız kaynak 0; motion/JavaScript kapalı/reduced PASS. Doğal film 190 decoded kare,7,916667 sn., ended/muted; 12,04 sn. gerçek UI oynatım kaydı alındı. Fiziksel cihaz veya gerçek hesap/ödeme/teklif mutasyonu değildir.

Final [yayın makbuzu](referans/yayin-object-v8-20261101.json) ve [QA kaydı](referans/qa-160-20261101.json) nihai Task 160 kanıt kayıtlarıdır; yeni Flow medya kabulü ayrı tutulur.

## Fikir, marka ve nesne

Taste tohumu **1601101**, `--keep palette,type`: **page-is-the-object**. Özel gramer **Object journey**; sayfanın birimi gerçek ambalaj ve ona bağlı seçim/üretici/alışveriş ihtiyacıdır. Yeni isim tek başına tasarım farkı değildir: açılış, beş vuruş ve çalışan seçim gerçekten değişmelidir. [Baseline fingerprint](scrollcraft/FINGERPRINTS.md) v6 ve v7'ye karşı dört planlı farkı kaydeder; v8 satırı nihai sonuç kanıtıyla kaydedilir.

Orijinal yatay logo, **“Kökü toprakta. Yeri sofrada.”**, yerel Fraunces/Figtree ve mevcut semantik renkler korunur: kâğıt `#F4F0E7`, zeytin `#172B21`, şampanya `#B6A078`, antrasit `#252725`, gövde `#414A40`. H1 iki satır, aynı display yüzü ve tek zeytin rengidir; italic/renkli vurgu, eyebrow/indeks rozeti ve scroll oku yoktur. Başlık/CTA SSR'da görünür, film/loader beklemez.

## Açılış düzlemleri ve telefon

- Orijinal opak kâğıt nav, gerçek mağaza/sepet/hesap/menü yolları korunur. Cam nav veya sahne üstünde ikinci menü eklenmez.
- Yeterli masaüstünde (en az901×681 viewport) toplam `170svh + header` alanda tek kısa sticky sahne. Film düzlemi uniform scale1→.82, x0→-8vw, y0→-48px ile geri çekilir. Gerçek ambalaj ayrı düzlemde y80→-8px/scale1→1.12 öne gelir. Katı kâğıt copy-plane kendi metin zeminiyle y0→-24px ilerler; metin zemine göre kaymaz.
- Ambalaj oranı/etiketi bozulmaz; temas/örtüşme açık olmalı, nesne havada asılı görünmemelidir. Filmdeki ağaç/dalı üç bağımsız görüntü katmanıymış gibi raporlama. Tam kare scrim, blur/filter/layout animasyonu yoktur.
- Native film kendi zamanında bir kez oynar; scroll yalnız kompozisyonu değiştirir. `CinematicFilm.mediaStyle` yalnız poster/video katmanına uygulanır; sabit 44px+ kontroller küçülmez/hareket etmez.
- Telefon, kısa ekran ve reduced-motion'da pin yok. Başlık + iki gerçek eylem önce; mobil film satırı280px, ambalaj260px, seçim/ürün ayrıntıları ardından doğal akışta. Eski720/740px minimum yok. 360×640 ve büyütülmüş metin ayrıca doğrulanır; viewport kabulü fiziksel telefon değildir.
- **Ürünleri Keşfet**→`#urunler`, **Kurumsal Teklif Al**→`#toptan-iletisim`; JS kapalı/poster/hata durumunda gerçek anchor'lar erişilir.

## Çalışan signature ve veri sınırı

Üç mevcut temsilci: `sample-green-olive-10kg`, `sample-green-olive-1kg`, `sample-olive-oil-1l`. Seçim aynı ambalaj/ad/miktar/fiyat/incele/ekle hedefini birlikte değiştirir; `aria-pressed`, fieldset/legend ve görünür odak korunur. Tercih edilen id yoksa mevcut ürünlerden fallback yapılır; ürün yoksa satın alma uydurulmaz.

Hero ad/fiyatı mevcut `ProductVariant` girdisinden okur; yeni fiyat/stok kaynağı oluşturmaz. `AddToCart` güncel CatalogProvider/hydration/stok kapısını, sunucu quote/checkout ise ticari otoriteyi korur. Statik örnekler temsili fiyatlardır. Ürün sırası/adı/fiyatı/stoku görsel gerekçeyle değiştirilmez; gerçek detay modalı ve sepet aynı id'yi kullanır.

## Tek zirve ve beş vuruş

Kısa yer kuran film → aynı sahnede nesnenin gelişi tek zirvedir; ikinci dev pin yok. Sonra kompakt gerçek tesis kanıtı → altı SKU native yatay galeri → kurumsal ihtiyacı açan dal → gerçek adres/mağazaya dönüş/SSS çözümü. Kısa üretim özeti ayrı büyük numaralı adım sahnesi değildir.

Tesis müşteri PDF'sindeki gerçek fotoğraftır. Galeri ilk üründe farklı görsel öncelik kullanabilir; mevcut altı SKU sırası ve her ürünün gerçek incele/ekle işlemi korunur. Yatay rail native scroll, klavye odağı ve reduced erişim taşır; gizli/ulaşılamayan son ürün yoktur. B2B'de kapalı gönderim mesajı açılmadan görünür, **Bilgileri hazırlayın** native details içinde mevcut formu açar. Servis/provider kendiliğinden açılmaz, sahte talep başarısı gösterilmez. Kapanış **Ellek’te buluşalım**, gerçek adres, **Ürünlere dön**, mevcut SSS/support/legal/footer yollarıdır; son içerik kaybolmaz.

Yaklaşık %65 üretici/kurumsal güven ve %35 alışveriş korunur. Yeni kapasite, sertifika, sağlık/organik, yorum, kıtlık, indirim veya teslimat iddiası yoktur. Telefon/e-posta yalnız mevcut gerçek yapılandırmadan gelir.

## Medya ve doğru Flow projesi

Doğru Flow projesi 62040049-3473-446b-9d93-8e6cbc45f8bc taze bağlantıda önceki reCAPTCHA uyarısı olmadan çalıştı; güvenlik engeli atlanmadı. Aynı ilk/son kare yöntemiyle Omni 1.1 Flash/720p/8 sn./16:9/x1,12 kredi/çıktı: B→C/C→D/D→F üçü de COMPLETE ve indirildi. Üç yetkili istek 36 kredi, bakiye 230→194; ilk 20 ile toplam 56, eski 80 tavanında 24 kredi kullanılmadı (ek deneme yetkisi değil). Yeni klipler yalnız aday; teknik/görsel inceleme ve kullanıcı onayı olmadan public/runtime yok. Sitede kabul edilmiş A→B kalır. Önceki blocked denemeler/0 harcama tarihçesi ve exact prompts docs/referans/flow-keyframes.json içinde korunur; bakiye kanıtı .cache/task-160/flow-194-credit-balance.png.

Runtime yalnız kabul edilmiş A→B'nin `public/videos/afina-agac-dal.mp4` türevidir: sessiz H264/yuv420p/faststart,1280×720/24fps/190kare/7,916667sn.,2.537.380bayt. Kaynak/çıktı SHA ve kapı `lib/media/cinematic-film.json`, `scripts/check-cinematic-film.mjs`; poster aynı başlangıç karesinden. SDR'ye ikinci tone mapping yapılmaz. Diğer üç film hazır veya yayınlanmış sayılmaz; D yağ dökümü gerçek sıkım/fabrika kanıtı değildir.

Normal mod tercih/hydration/görünürlükten sonra tek oynatım, son kare ve pause/play/replay. Kullanıcı pause korunur; gizli sekme/ekran dışında durur; biten film observer'la yeniden başlamaz. Reduced/saveData film isteği başlatmaz; hata/blocked durumda poster ve uygun manuel kontrol kalır. Loop/scroll currentTime/yeni seek motoru yoktur.

## Araç ve kabul politikası

[Scroll Craft](../.agents/skills/scroll-craft/SKILL.md), [Taste](../.agents/skills/design-taste-frontend/SKILL.md), frontend-design/frontend-ui-engineering ve dört proje yerel MD birlikte uygulanır. Upstream dosyalar değiştirilmez; vanilla engine/GSAP/Lenis/rAF runtime'a eklenmez. Yeni API'ler `motion/react`, ortak eylem tokenları `lib/ui-motion.ts`; sürekli hareket transform/opacity, reduced dönüşü zorunlu. 21st 1635 yalnız varyant/görsel durum örüntüsü, önceki 12200 yalnız tarihsel kompozisyon kaynağıdır; demo metin/medya/font/nav taşınmaz.

Final-source screenshot/contact sheet ve his kontrolü; bağımsız düzlem örnekleri, gerçek decoded film, üç ürün/detail/cart, kapalı B2B/menü/üyelik, SSR/reduced/saveData/error/JS kapalı, kompozit kontrast ve rail erişimi ayrı kanıtlanır. Yerel unit/build canlı kabul değildir. Test yalnız paketli headless Chromium ≤2 worker, düzgün browser/server kapanışı; kullanıcının Chrome'u testte açılmaz. Oturumlu Flow üretim yüzeyi ayrı yetkili kullanımdır. Gerçek hesap/ödeme/teklif, fiziksel cihaz ve Google güvenlik doğrulaması ayrı kapılardır.

Son medya incelemesi: B→C/C→D örneklemde kullanıcı incelemesine hazır; D→F etiketin oluşması/bozulması nedeniyle yayına uygun değil. Yeni harcama36, bakiye194; üçü de kullanıcı kabulü/runtime onayı almamıştır. [Aday incelemesi](scrollcraft/builds/afina-v8/FLOW-CANDIDATE-REVIEW.md).
