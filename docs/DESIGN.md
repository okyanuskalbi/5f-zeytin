# AFİNA ZEYTİN v9 — Hasat Rotası

## Güncel yön ve durum

[Task 161](tasks/161-pro-plan-tum-bolumler-21st-scroll-craft.md) **UYGULANIYOR; kabul ve yayın BEKLİYOR**. Kullanıcı yeni pro planı uygulamamızı ve bütün bölümlerde gerçek 21st kaynaklarını Scroll Craft yöntemiyle kullanmamızı istedi. “Sormadan devam et” yaratıcı devri sürer. [Kaynak plan](referans/afina-zeytin-pro-plan-20261101.md), uygulama öncesi [BRIEF](scrollcraft/builds/afina-v9/BRIEF.md), [PLAN](scrollcraft/builds/afina-v9/PLAN.md), [COPY](scrollcraft/builds/afina-v9/COPY.md) ve [21st provenansı](scrollcraft/builds/afina-v9/21ST-SOURCES.json) kaynak ve kararları ayırır. Örnek planın Vite logosu/fiyatları/istatistikleri/WhatsApp önerisi gerçek proje verisi değildir.

Bu dosya tek aktif görsel sözleşmedir. Önceki v8 dosyası değişmeden [v8 arşivine](referans/DESIGN-v8-history-20261101.md) alındı; SHA-256 `07285a4340723309589e90cbdac00ed7583252ec14c446e6c437b2550620d686`. V6/v7/v8 kompozisyonları ve kabul makbuzları tarihçedir. V8 kaynak `179df851`/READY ve onun 1200 unit/74 e2e kabulü v9 sonucu sayılmaz. Task 161 için son kaynak CI, görsel/davranış kabulü, API yayını ve canlı kontrol ayrıca kaydedilecektir; burada tamamlandı iddiası yoktur.

## Marka, renk ve tipografi

Orijinal AFİNA ZEYTİN ve topluluk logoları, gerçek ambalajlar ve **“Kökü toprakta. Yeri sofrada.”** korunur. Yeni planın aktif paleti: marka `--pro-brand: #84CC16`, hover `#A3E635`, taş `--pro-stone: #EDE8DD`, mürekkep `--pro-ink: #1C1F1A`, kâğıt `#F7F4EE`, yağ altını `--pro-gold: #C89B3C`. Küçük metinde erişilir koyu altın `--pro-gold-ink: #735519`, gövde/ikincil `#4F594B`; altın dekor rengi otomatik metin rengi değildir. Kaynak `app/globals.css`. Yerel Türkçe/Latin font alt kümeleri `lib/media/pro-fonts.json` içinde kaynak/çıktı SHA, eksen ve glif kontrolüyle kayıtlıdır; özgün dosyalar ve OFL lisansları korunur. Diğer karakterler font fallback ile okunur.

Başlık **Fraunces**, gövde **Inter**; resmî slogan aynı yüzle iki satırdır. Başlık/gerçek CTA ve içerik SSR'da görünür, video/loader/hydration beklemez. Ana aralıklar 8 px tabanlı 32/48/64/96; planın yuvarlatılmış ürün yüzeyleri ve tek cam navigasyonu v8'in kare/opak yüzey tercihini değiştirir. Sade içerik, kısa kaynaklı metin ve yaklaşık %65 üretici/kurumsal güven, %35 alışveriş dengesi sürer.

## Yedi bölüm ve gerçek kaynaklar

| Sıra | Semantik bölüm | 21st demo ID | Gerçek uyarlama |
|---|---|---|---|
| 1 | `#baslangic` | 32829 | Tam geniş kabul edilmiş Flow filmi, özgün ön dal, iki satır slogan ve iki gerçek eylem. |
| 2 | `#urunler` (`#kiler` alias) | 24623 | Altı gerçek SKU için tek yatay keşif/karar zirvesi; detay/sepet ve teklife ürün aktarımı. |
| 3 | `#tesisimiz` (`#kurumsal` alias) | 20023 | Gerçek Ellek tesis fotoğrafı, kısa yer/adres metni, izole görüntü parallax'ı. |
| 4 | `#uretim-yolculugu` | 1197 | Toprağımız/Tesisimiz/Sunumumuz için bir büyük ve iki destekleyici gerçek fotoğraf/metin bento. |
| 5 | `#toptan-iletisim` | 7262 | Otel/restoran, market/bayi, toplu tüketim: üç eşdeğer işlevsel segment seçimi. |
| 6 | `#teklif` | 35258 | İsimli/validasyonlu form, KVKK, gerçek talep özeti ve kullanıcı tarafından gönderilen e-posta taslağı. |
| 7 | `#iletisim` (iç `#sik-sorulanlar`) | 31986 | Beş kaynaklı native disclosure/schema, gerçek adres, destek ve mağazaya dönüş. |

Navigasyon **26786**, footer **21474**: toplam **9 seçili ana kaynak**. **1635 yalnız incelenmiş referanstır**; mevcut ProductCard yeniden kullanılır, yeni 1635 uyarlaması veya tüm kaynakların literal kopyası iddia edilmez. 15025 (gerçekte generic sayaç) ve 7091 (global reset/particle motoru) kaynakları okunup reddedildi. Exact component/demo SHA, yazar, URL ve uyarlama sınırı [provenans kaydındadır](scrollcraft/builds/afina-v9/21ST-SOURCES.json); yabancı demo medya/metin/ürün/font/nav taşınmaz.

## Açılış ve tek scroll zirvesi

Hero doğal bir viewport filmidir; v8'in 170svh ambalaj/kâğıt-plane pin'i kaldırılır. Masaüstünde orijinal ön dal ayrı dekoratif düzlemdir. Mobil kadraj filmin kendi ön planını korur; ek dekoratif dal gizlenir. Gerçek DOM slogan/CTA tam opaktır; başlık ve açıklama mount hareketi beklemez. Yalnız CTA grubu kısa y girişi yapar. Filmdeki tek ağaç/dal birden fazla bağımsız medya gibi raporlanmaz. Açık renk cam nav özgün logo, gerçek menü/üyelik/sepet/mağaza yollarını taşır; glass fallback okunur taş zeminlidir. Blur sabit yüzey stilidir, animasyon değildir. İkinci sahne menüsü veya yabancı GSAP nav motoru yoktur.

**Ürünleri Keşfet** → `#urunler`; **Kurumsal Teklif Al** → `#teklif`. Hero H1/eylemleri JS kapalıyken de gerçek anchor'dır. Yerel okunurluk zemini kompozit kontrastla doğrulanır; tüm ekranı saklayan loader veya yüklenene kadar gizli içerik yoktur.

Yalnız ürün galerisi pin olur: uygun viewport **en az 1024×860**, normal hareket ve JS ölçümü sonrasında `x = −travel × progress` doğrudan lineer eşlenir. Spring/Lenis/rAF/scroll girdisi yakalama yoktur. Son ürün ve odaklanan kart görünür kalır; alan sonrasında doğal dikey akış sürer. Telefon/kısa ekran/reduced/JS kapalı durumda native yatay rail; taşma sayfanın dışına yayılmaz. Hero/tesis/bento/B2B/teklif/kapanış yeni tam sayfa pin değildir. Tesis yalnız kliplenmiş görüntüde y0→120px; metin/CTA sabit, mobil/reduced statik. Reveal içerik SSR'da görünür, bir kez ve transform/opacity ile olur.

## Film, poster ve kabul sınırı

Aktif film `public/videos/afina-zeytinlik-loop-5s.mp4`: kullanıcı kabulü olan A→B'den **ücretsiz yerel ileri/geri kurgu**, yeni Veo/Omni üretimi değildir. Kaynak kare **6..65** ileri/geri; **120 kare, 24 fps, 5 saniye, 1280×720**, sessiz H264/faststart; **2.742.609 bayt**, SHA-256 `1a9b941dce0ab46c09570766458508647887dee7e2b9d2897b2a5a70108c5719`. 119 kare CRF28/no-B-frame kodlanır; son kareye ilk IDR paketi aynen eklenir. İlk/son decoded piksel eşliği SSIM1 kalırken önceki6,85MB kodlamaya göre%60 küçüldü. Yön dönüşlü montajdır; fiziksel olarak kusursuz devamlı kamera iddiası yapılmaz. V9 planı eski genel loop yasağının bu kabul edilmiş türeve ilişkin uygulama tercihini değiştirir; yeni ücretli üretim yetkisi vermez.

Hero posteri aynı türevden `public/videos/afina-zeytinlik-poster.avif` **76.119 bayt**, SHA-256 `3b174344ec775e4c0898493fbcc598102c1add25a1da272f4a5c16af4222030d`; WebP fallback, aynı kadraj ve sabit ölçüler. OG `public/brand/og-zeytinyagi.webp` onaylı şişe/marka görseli **1200×630**. Loop/metin okunurluğu, gerçek decoded kare ve telefon kadrajı son kaynakta ayrıca ölçülür.

Normal mod muted/playsInline gerçek medya olaylarıyla döner; küçük görünür pause/play kontrolü ve kullanıcı pause kararı korunur. Sekme/görünüm dışında durur. Reduced-motion/saveData MP4 isteği başlatmaz; poster ve tüm gerçek eylemler kalır. Hata/blocked durumda poster ve uygun manuel kontrol vardır. Kontroller en az44px, hareketli video düzlemi dışında; video zamanına scroll/currentTime seek veya spring bağlanmaz. Mevcut SDR ikinci tone mapping almaz.

Diğer B→C/C→D/D→F klipleri adaydır; kaynak, kredi ve kullanıcı kabul kayıtları [flow-keyframes.json](referans/flow-keyframes.json) içindedir. Task160 üç yetkili üretim36 kredi, bakiye194, toplam56/80 tarihçesini değiştirmez; kullanılmayan kredi yeni deneme yetkisi değildir. D→F etiket sorunu nedeniyle runtime'a alınmaz. Omni Chrome Use tarayıcı otomasyonu yaklaşımıdır; Omni1.1Flash ayrı modeldir.

## Çalışan ürün ve kurumsal talep

Altı SKU'nun kimliği, sırası, adı, ambalajı, fiyatı, stoğu ve Product/Offer şeması mevcut veri kaynağında kalır. Galerinin **Teklife ekle** seçimi aynı gerçek SKU'yu, B2B üç butonu aynı segmenti `QuoteJourneyProvider` üzerinden formda seçer. ProductCard detay/sepet ve AddToCart/CatalogProvider hydration/stok kapıları ile sunucu fiyat/checkout otoritesi korunur. JS eylemleri hydration'a kadar disabled; normal anchor'lar erişilir. Boş/kayıp/stok0 dürüst durumdur.

Form bir teslim servisi değildir: gerekli alan/KVKK doğrulaması sonrası gerçek özeti hazırlar, **E-postayla gönder** gerçek `mailto:info@afina.com.tr` taslağını açar. Gönderimi kullanıcı e-posta uygulamasında tamamlar; site otomatik gönderdi/CRM kaydetti demez. Alıcı ve **+90 328 882 77 08** (`+903288827708`) [AFİNA Şirketler Topluluğu'nun resmî iletişim kaynağıdır](https://afina.com.tr/#iletisim); zeytin destek hattı veya WhatsApp olduğu varsayılmaz. Sunucu e-posta transportu/wholesale endpoint/WhatsApp doğrulanmış değildir; yeni provider/env/DB etkinleştirilmez.

Gerçek tesis müşteri PDF'sinden; temsili Flow/yapay sahne üretim hattı veya sıkım kanıtı diye sunulmaz. Kapasite, sertifika, sağlık/organik, yorum, indirim/kıtlık veya teslimat sözü uydurulmaz. Gerçek adres, beş ortak FAQ cevabı/schema, üyelik/ödeme ve mevcut hukuk/support yolları korunur.

## Uygulama ve kabul politikası

[Scroll Craft](../.agents/skills/scroll-craft/SKILL.md), frontend-design/frontend-ui-engineering, [Taste](../.agents/skills/design-taste-frontend/SKILL.md) ve dört proje yerel MD birlikte uygulanır. Upstream dosyalar/engine değiştirilmez veya runtime'a import edilmez; yeni hareket API'si `motion/react`, eylemler `lib/ui-motion.ts`. shadcn için mevcut primitive ve resmî CLI; 21st için gerçek search/get kaynağı ve proje token uyarlaması. Örneklerin global kurulum/model/anahtar/kredi yetkisi yoktur.

Task161 final-source unit/lint/type/build, yedi bölümde hareket/geometri, galerinin lineer ilerlemesi/son ürünü/odak ve SKU→segment→özeti; gerçek URI, modal/menü/üyelik, SSR/JS kapalı/reduced/saveData/hata, poster/loop, kontrast/axe/taşma/kaynak hataları ve 360×640 dahil telefon kadrajları ayrı kaydedilir. Test yalnız paketli headless Chromium ≤2 worker, düzgün browser/server kapanışı; kullanıcının Chrome'u testte açılmaz. Yerel kabul, CI, API READY, canlı UI, fiziksel cihaz ve gerçek hesap/ödeme/e-posta teslimi ayrı kapılardır. Şu an **uygulama sürüyor; Task161 kabulü/yayını bekliyor**.
