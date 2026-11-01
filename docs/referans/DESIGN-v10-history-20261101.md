# AFİNA ZEYTİN v10 — Dalından sofraya

## Güncel yön

Kullanıcı “zeytin sitesini baştan scrolling sectionla yapalım”, ardından
Framer Motion, `uipro init --ai codex` ve React Bits kullanımını istedi.
[Task162](tasks/162-scrolling-sections.md) uygulandı; yerel kod kontrolleri
geçti. Görsel tarayıcı kabulü ve yayın tamamlanmadı. V9 değişmeden
[arşivlendi](referans/DESIGN-v9-history-20261101.md); önceki kabul yeni sürümün
kanıtı değildir. [Brief](scrollcraft/builds/afina-v10/BRIEF.md) kararları ve
[provenans](scrollcraft/builds/afina-v10/SOURCES.json) gerçek kaynakları ayırır.

## Görsel sözleşme

Orijinal logo, “Kökü toprakta. Yeri sofrada.”, altı mevcut SKU ve onaylı
fotoğraf/film korunur. Fraunces başlık, Inter gövde; ana zemin #EDE8DD,
yüzey #F7F4EE, zeytin #243A29, mürekkep #1C1F1A, koyu altın #735519.
#84CC16 yalnız belirgin eylem/seçim vurgusudur. Örnek ürün verileri gerçek
satış onayı sayılmaz. Yeni medya üretimi veya kredi harcaması yoktur.

Açılış artık tam film üstüne yazı değildir: kendi taş zemininde tam slogan,
sağda ayrı yüksek film kadrajı ve bağımsız özgün ön dal. Yeterince büyük
ekranda kısa 145svh tutuş; telefon/kısa/reduced/SSR doğal akış. H1 ve gerçek
ürün/teklif bağlantıları görünür. Film kaynak ve lifecycle kontrolü korunur.

## Bölümler ve davranış

1. #baslangic: ayrı başlık/film/ön dal düzlemleri, gerçek iki CTA.
2. #uretim-yolculugu: 21st Scroll01 (18041) uyarlaması. Üç okuma adımı,
   masaüstünde tek sabit fotoğraf ve beraber değişen bölüm işareti. Fotoğraf
   hafif yakınlaşır; okuyucu bölüm bağlarıyla da ilerleyebilir. Telefon/kısa
   ekran/reduced/JS kapalı durumda üç fotoğraf kendi metninin yanındadır.
3. #tesisimiz / #kurumsal: gerçek Ellek tesisi ve adres, izole görüntü parallax.
4. #urunler / #kiler: altı SKU'lu düz ambalaj rafı; tall desktop lineer yatay
   geçiş, diğer ekranlarda native rail. Detay, sepet, stok ve teklif aktarımı.
5. #toptan-iletisim: ikon kartları yerine üç büyük işletme seçim satırı.
6. #teklif: solda sakin başlık, sağda mevcut doğrulamalı e-posta taslağı.
7. #iletisim: native SSS, “Sofrada görüşürüz.”, gerçek adres ve mağazaya dönüş.

React Bits BlurText'in gerçek kelime/keyframe/once-in-view çekirdeği B2B ve
kapanış başlıklarında kullanılır. Filtre/loop/gizli SSR başlangıcı kaldırıldı;
yalnız mevcut `framer-motion` çalışma zamanı. Framer-motion14.4.0 ve motion14.4.0
aynı LazyMotion/useScroll nesnelerine çözülür. İkinci GSAP/Lenis motoru yok.
UIPro araması storytelling/mobile/reduced-motion rehberi olarak kullanıldı;
otomatik kırmızı restoran paleti AFİNA'nın marka tokenlarının yerini almadı.

## Korunan işlevler ve kabul

Ürün kimliği/adı/fiyatı/stoğu/sırası, detay/sepet/üyelik ve sunucu otoritesi
korunur. SKU ve B2B seçimi aynı teklif bağlamına gider. Form mailto taslağı
hazırlar; gönderimi kullanıcı tamamlar. Servis/DB/ödeme kurulumu bu kapsamda
etkinleştirilmez. Gerçek üretim/sertifika/kapasite/teslimat iddiası uydurulmaz.

1216 unit, lint/typecheck, onaylı medya kapıları ve webpack production build
geçti. 21st değişen kaynak incelemesi 0 error/0 warning/1 info. E2E senaryoları
hazır; bu oturumda headless tarayıcı ve localhost izni kullanılamadığı için
piksel/scroll kabulü tamamlanmadı. Yeni sürüm yayımlanmadı; v9 canlı kalır.
[Doğrulama kaydı](scrollcraft/builds/afina-v10/VERIFICATION.md).
