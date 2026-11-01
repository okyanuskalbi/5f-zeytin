# V8 — native Taste incelemesi

1 Kasım 2026; yerel production build `aU9kRVEDWxduQepWaIxk_`. Native koşum **12:04:26–12:05:19 UTC**. Hedef `http://127.0.0.1:3020`; 1440×900, 768×1024, 390×844. Bu kayıt yerel tasarım ölçümüdür; canlı yayın kabulü ayrıca tutulur.

Son runtime düzeltmesi, React hazır olmadan ürün seçimi/detay/görsel tetikleyicilerine tıklamanın kaybolmasını önler: bu kontroller hidrasyon hazır olana kadar devre dışıdır. Slogan, görseller, seçili ürün verisi ve alışveriş bağlantıları SSR’de kalır; yerleşim değişmedi. Bu üçüncü/son native koşum yeni build’de yapıldı. Geciktirilmiş JavaScript etkileşim regresyonunun kabulü ayrı E2E kaydındadır.

## Ham sonuç ve yorum

- **Native inspect: 1 FAIL, 5 WARN; exit1.** `--allow` kullanılmadı; sonuç temiz/0FAIL olarak sunulmaz.
- **Native scenes: 0 problem; exit0.** Masaüstünde yaklaşık1,8ekranlık gerçek Motion sahnesi; telefonda yaklaşık1,1ekranlık doğal akış/bitmiş kompozisyon. Native scroll korunur; ikinci scroll motoru yok.
- Hareket eden DOM unsurları: masaüstü **13**, tablet **9**, telefon **7**. Masaüstü ilk denemede7idi; altı anlamlı başlık/fotoğraf/anlatım girişi son build’de ölçüldü. Sayıyı artırmak için boş dekor eklenmedi.
- Üç inspector viewport’unda console hatası **0**; raporun düşük kontrast listesi boş.

Kalan ham FAIL `eyebrow` sınıflandırmasıdır. Tablet ölçümünde5eşleşme: AFİNA grup bağlantısı→sonraki tesis başlığı; ürün ağırlıkları10kg/1L/5L→büyük fiyat metni; formdaki “Firma adı”→sonraki SSS başlığı. Telefonda7eşleşme: grup bağlantısı ve altı gerçek SKU ağırlığı. Ölçücü kısa/küçük metni yakındaki büyük metinle geometrik olarak eşler; form, ürün kartı ve bölüm sahipliğini ayırmaz. Görseller ve DOM birlikte incelendi: bunlar dekoratif kicker değildir. Gerçek ambalaj ağırlığı, firma alanı ve marka ilişkisi korunmuştur; ölçücü/rule/result değiştirilmemiştir.

Beş WARN: bir SSS çizgisi; kullanıcının korunan krem paleti; işlevsel/responsive UI ile14yazı boyutu; bilerek yatay kayan ürün galerisi;13hareketli öğeyi “az hareket” sayan genel eşik. Bunlar ham raporda aynen durur. Galeride kısmi sonraki kart ve yazılı kaydırma yönlendirmesi görünür; yatay gezinmenin keşfi masaüstünde iyileştirilebilir. Daha çok süs animasyonu veya gerçek veriyi kaldırmak önerilmez.

## Soğuk görsel okuma ve duygu eğrisi

- İlk saniye: AFİNA ambalajı ve zeytin ağacı; kâğıt yüzeyde okunur slogan. Beş saniyede zeytin/zeytinyağı, sofra/işletme ve alışveriş yönü anlaşılır.
- İlk scroll: arka film daralırken ambalaj öne gelir; metin düzlemi ayrı hareket eder. Tek zirve sahnenin dönüşümüdür. Yalnız mevcut kabul edilmiş A→B klibi kullanılır; ek hasat/yağ/ambalaj videoları varmış gibi gösterilmez.
- Sonraki sakin bölüm: gerçek tesis fotoğrafı ve kısa Ellek bilgisi, önceki tekrarlı bilgi şeritlerinden daha somut kanıt oluşturur.
- Ürünler: boyut seçimi ve fiyat/ürün eylemleri hikâyeyi alışverişe bağlar. Telefonda pin yerine ayrı doğal kompozisyon ve erken alışveriş eylemi vardır.
- Kurumsal/kapanış: kapalı gönderim servisi küçük, dürüst panelde açıklanır; ardından SSS/adres/alışveriş bağlantıları gelir. Form başarı sonucu uydurulmaz.

Desktop/tablet/mobile fold’lar, iki desktop sayfa levhası, tablet/mobile sayfa levhaları, scroll filmi, desktop/phone sahne levhaları ve reduced-motion levhası açılıp incelendi. İncelenen görüntülerde yeni somut bir görsel erişilebilirlik kusuru saptanmadı. Bu değerlendirme klavye/axe veya fiziksel cihaz kabulünün yerine geçmez.

## Çevrimdışı kontrast

Raporun gerçek CSS renkleri üzerinde WCAG sRGB hesabı; düz yüzey çiftleri için:

| Yüzey | Ön plan / arka plan | Oran |
|---|---|---:|
| Ana metin / kâğıt | #172B21 / #F4F0E7 | 13,15:1 |
| Gövde / kâğıt | #414A40 / #F4F0E7 | 8,10:1 |
| İkincil / kâğıt | #5A6558 / #F4F0E7 | 5,37:1 |
| İkincil / galeri-altbilgi | #5A6558 / #E5E3D7 | 4,74:1 |
| Açık metin / zeytin | #CDD3C7 / #172B21 | 9,79:1 |
| Buton / zeytin | #F4F0E7 / #172B21 | 13,15:1 |

Bunlar hareketli görüntünün her pikseli için ölçüm değildir. Film üzerindeki ana metin artık opak kâğıt paneldedir. Fiziksel telefon ve gerçek gönderim/ödeme işlemleri bu koşumda yapılmadı.

## Araç bütünlüğü ve kanıt

Proje yerel Taste paketinin40dosyası `.cache/task-160/taste-safe/` içine kopyalandı. Kaynak paket değişmedi;39kopya bayt düzeyinde aynı. Yalnız kopya CDP helper’da tarayıcı bulma/açma/kapatma güvenli biçime uyarlandı: açık paketli Playwright headless-shell1248 yolu; CDP `Browser.close`; süreç çıkışını bekleme; gerekirse yalnız kendi sürecine SIGTERM. Kullanıcının Chrome’u açılmadı; zorla öldürme kullanılmadı. Ölçüm/probe/rules/inspect/scenes mantığı değişmedi.

| Dosya | Kaynak ve kopya SHA-256 |
|---|---|
| inspect.mjs | c0d7366f789b3f594787b37a525d1d7096104a499aac8a97ae04b405046cf02c |
| scenes.mjs | 234ec582e2b841457c33033feeeba8535f9ac285495a74d08dc533a1566c90d5 |
| lib/probe.mjs | a5a17df891e438f55f196d8233601c3c79c873755f442c1ac5c3568de4e6bb48 |
| lib/rules.mjs | 8244aa9f53e77a59a562410310414e6b1a0f0cf002ce8f5aa792740b7f0149bf |

CDP kaynak SHA-256: `320fb75c6454a97b88458e5c33559a1188042aa0041bd5eff53455900236c88a`.

Güvenli kopya SHA-256: `43916bee42ceb74187ee1be2a7476f29d00e374a9362d05e72f38a1c26a74fe5`.

Son ham inspector raporu SHA-256: `da06eac0d49c39c080672113748b0e43c22894e2e96ea590d068a941e8205d44`.

Yerel kanıt: `.cache/task-160/adapter-provenance.json`, `cdp-safety.patch`, `after2/inspect/report.json`, `after2/scenes/`, `after2/offline-contrast.json`, `after2/run-receipt.json`, `after2/cleanup-proof.json`. Önceki snapshot’lar `after-pass1/` ve `after2-previous-Rp054CNQnvHxgsq8ui4OT/`, v7 baseline `before/` altında değişmeden korunur. Inspector’ın320px için200pxyükseklik üreten varsayımı son native koşuma alınmadı; gerçek320px ve360×640 kabulü ayrı uygulama testleridir.

Koşuma ait browser profili/süreci **0**;3020production sunucusu düzgün kapandı. Bu kayıttan sonra runtime/denetim kuralı değiştirilmedi.

Tekrar üretilebilir denetim için kullanılan browser-helper farkı [cdp-safety.patch](tooling/cdp-safety.patch), tüm kaynak/kopya SHA kayıtları [adapter-provenance.json](tooling/adapter-provenance.json) içinde kalıcıdır. Upstream skill dosyası değiştirilmedi; güvenli fark yalnız audit kopyasına uygulanır.

Kalıcı patch sıfır bağlamlı unified diff olarak saklanır (`git apply --unidiff-zero`): böylece boş context satırları belge whitespace hatası üretmez. Özgün helper'a özel cache dizininde uygulandı; sonuç güvenli koşum helper'ıyla bayt düzeyinde aynı doğrulandı. Upstream ve denetim kodu değişmedi.
