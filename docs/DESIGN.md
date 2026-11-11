# AFİNA ZEYTİN — Ellek sofrası

> Ellek’teki gerçek üretim görüntüsünü, açık bir sofra zemini ve okunur ürün raflarıyla yan yana getiren sakin bir AFİNA vitrini.

**Tema:** açık. **Yön:** K1, 11 Kasım 2026: kullanıcı A / Codex “Ellek sofrası” tasarımını seçti. Bu belge bir yayın veya tüm sayfalar kabulü değildir. Önceki v12 dosyası değiştirilmeden `DESIGN-v12-hasat.md` altında saklanır. Bağlayıcı üst kaynaklar müşteri BRIEF’i ve `MASTER-PROMPT.md` dosyasıdır.

Bu düzen ziyaretçinin gerçek ürünü, boyu ve fiyatı okuyarak seçim yapmasını sağlar. Büyük doğal görüntü, değişen bölüm ölçüleri ve orijinal logo kimliği taşır. Sahte istatistik, yorum veya indirim anlatısı yoktur. Fraunces ile Figtree kullanıcı seçimidir; değiştirilmez.

## Tokens — Colors

| Ad | Değer | Token | Rol |
|---|---|---|---|
| Zeytin yeşili | `#243A29` | `--sf-green` | Ana eylem, marka, yerel koyu alt bilgi |
| Fildişi | `#F5F1E7` | `--sf-ivory` | Ana sayfa zemini |
| Kâğıt | `#FFFDF8` | `--sf-paper` | Ürün fotoğrafı zemini ve açık menü |
| Şampanya altını | `#D4B483` | `--sf-gold` | Logo çevresi ve koyu zeminde küçük vurgu |
| Mürekkep | `#202A22` | `--sf-ink` | Başlık, ana metin |
| İkincil metin | `#586052` | `--sf-muted` | Boy, stok açıklaması, ikincil paragraf |
| Ayırıcı | `#D7D7C9` | `--sf-line` | İşlevsel çizgi; metin rengi değildir |
| Koyu altın | `#80602D` | `--sf-focus` | Açık zeminde 2 px, 4 px ofsetli odak halkası |

Altı ana renk vardır; çizgi ve odak işlevsel yardımcı tonlardır. Mevcut hata/başarı durumları sözcük ve simgeyle de anlatılır. Yeni dekoratif renk ailesi açılmaz. Genel açık görünüm işletim sistemi karanlık tercihiyle değişmez; koyu alt bilgi kendi renk kapsamını taşır.

Hesaplanan düz renk karşıtlıkları: yeşil/fildişi **10.87:1**, mürekkep/fildişi **13.15:1**, ikincil metin/fildişi **5.80:1**, ikincil metin/kâğıt **6.44:1**, altın/yeşil **6.22:1**, koyu altın/fildişi **5.13:1**. Şampanya altını/fildişi **1.75:1** olduğu için açık zemin üstünde metin veya tek odak göstergesi olmaz. Bunlar sRGB bağıl parlaklık hesabıdır; fotoğraf üstündeki gerçek karşıtlık ayrıca ekran denetimine tabidir.

## Tokens — Typography

### Fraunces — başlık ve marka cümlesi · `--font-display`

- Ağırlık: 500; seçili kısa vurgu ve ürün adı 600.
- Ölçü: ana sayfa başlığı 40–80 px; ürün başlığı 36–56 px; bölüm başlığı 36–56 px; ürün kartı başlığı 22 px, diğer kart başlıkları 24–32 px.
- Satır yüksekliği: büyük başlık 1.08–1.15; bölüm 1.2; çok satırlı kart 1.3.
- Harf aralığı: büyük başlık −0.02em, kart −0.01em.
- Gerçek italik dosyası vardır; tek kelimeyi alışkanlıkla italikleştirme. Bu yönün başlıkları düz yazılır.
- Yedek: Georgia, Times New Roman, serif. Başlıklar yazı olarak kalır.

### Figtree — gövde ve arayüz · `--font-body`

- Ağırlık: 400 gövde; 500 bağlantı; 600 düğme/etiket; 700 gerektiğinde durum.
- Ölçü: gövde ve form 16–18 px; yardımcı bilgi 14 px; hiçbir görünür metin 12 px altında değildir.
- Satır yüksekliği: gövde 1.6; arayüz 1.5. Harf aralığı 0.
- Fiyat, adet ve rozetlerde `font-variant-numeric: tabular-nums`.
- Uzun metin 65–72ch ile sınırlı; paragraflar `text-wrap: pretty`, başlıklar `balance`.
- Resmî Google Fonts kaynağından alınan `app/fonts/Figtree-variable.ttf` ve OFL lisansı kullanılır; `next/font/local` 300–900 ağırlık aralığını yerelden yükler. Uygulamada gövde 400 ve üstüdür. Font yüklenmesi içerik kaydırmamalıdır. Yedek Arial/Helvetica Neue.

### Type Scale

| Rol | Aile | Ağırlık | Ölçü | Satır | Harf aralığı |
|---|---|---|---|---|---|
| Yardımcı bilgi | Figtree | 400 | .875rem | 1.5 | 0 |
| Menü / düğme | Figtree | 500–600 | 1rem | 1.5 | 0 |
| Gövde | Figtree | 400 | 1–1.125rem | 1.6 | 0 |
| Fiyat | Figtree | 600 | 1.125–1.5rem | 1.5 | 0 |
| H3 ürün kartı | Fraunces | 500 | 1.375rem | 1.35 | −.01em |
| H3 blog / banner | Fraunces | 500 | 1.5–1.75rem | 1.3 | −.01em |
| H2 bölüm | Fraunces | 500 | 2.25–3.5rem | 1.15 | −.02em |
| H1 ürün | Fraunces | 500 | 2.25–3.5rem | 1.15 | −.02em |
| H1 ana sayfa | Fraunces | 500 | 2.5–5rem | 1.08 | −.025em |

## Tokens — Spacing & Shapes

**Taban:** 8 px. **Yoğunluk:** rahat, ancak ilk ürüne erişim gereksiz boşlukla geciktirilmez.

### Spacing Scale

| Ad | Değer | Token | Kullanım |
|---|---|---|---|
| 8 | 8 px | `--sf-space-8` | İkon/metin, durum satırı |
| 16 | 16 px | `--sf-space-16` | Telefon kenarı, yakın öğe arası |
| 24 | 24 px | `--sf-space-24` | Kartlar ve satırlar arası |
| 32 | 32 px | `--sf-space-32` | Bölüm içi gruplar |
| 48 | 48 px | `--sf-space-48` | Telefon bölüm arası, menü kontrolü |
| 64 | 64 px | `--sf-space-64` | Masaüstü bölüm içi geniş aralık |
| 96 | 96 px | `--sf-space-96` | Ana bölümler arası |
| 128 | 128 px | `--sf-space-128` | Yalnız geniş ekran hikâye geçişi |

44 px erişilebilirlik alt sınırıdır; çoğu kontrol 48 px seçilir. İnce çizgi 1 px ve odak 2 px bu boşluk ölçeğinin konusu değildir.

### Border Radius

Tek köşe tablosu. Değerler mevcut görünümü koruyan adlandırılmış CSS değişkenleridir (`app/globals.css`). Ana sayfa, ürün, katalog, kurumsal içerik, teklif, üyelik, hesap ve ortak menü/sepet yüzeyi bu tabloyu kullanır. Yönetim paneli Task200 kapsamındadır.

| Öğe türü / kullanım | Köşe ölçüsü | Token adı |
|---|---|---|
| Düğme: ürün satın alma, boy seçimi, ürün teklifi, kategori/hesap bağlantısı, seçici seçeneği | 4 px | `--sf-radius-action` |
| Düğme: ana sayfa birincil/ikincil eylem, sepet kuponu | 8 px | `--sf-radius-button` |
| Düğme: dairesel menü, hesap, sepet kontrolleri | %50 | `--sf-radius-icon` |
| Düğme: video kontrolü | 24 px | `--sf-radius-video` |
| Düğme: ortak sepet ödeme/öneri/mini eylemi | 999 px | `--sf-radius-pill` |
| Kart: çerçevesiz ürün, kategori, blog | 0 px | `--sf-radius-card` |
| Kart/panel: toptan, bayilik, üyelik, hesap, talep özeti, seçici listesi | 8 px | `--sf-radius-panel` |
| Kart: mevcut sepet satırı/öneri/özet | 12 px | `--sf-radius-cart-card` |
| Görsel: ürün, küçük kategori, banner, blog, sepet fotoğrafı | 8 px | `--sf-radius-image` |
| Görsel: geniş kategori; masaüstü hikâye | 16 px | `--sf-radius-image-wide` |
| Görsel: telefon hikâyesi | 8 px | `--sf-radius-image` |
| Görsel: hasat üst-sol, masaüstü / telefon | 64 / 32 px | `--sf-radius-harvest` / `--sf-radius-harvest-mobile` |
| Görsel: hasat diğer üç köşe | 8 px | `--sf-radius-image` |
| Görsel seçici düğmesi | 4 px | `--sf-radius-thumbnail` |
| Rozet/etiket: menüde adet | 16 px | `--sf-radius-badge` |
| Rozet/etiket: mevcut sepette boy | 999 px | `--sf-radius-pill` |
| Form alanı: ürün adet grubu | 4 px | `--sf-radius-field` |
| Form alanı: mevcut sepet adet grubu | 999 px | `--sf-radius-pill` |
| Form alanı: ortak Input, select, telefon ve ülke düğmesi (kupon hariç) | 0 px | `rounded-none` veya `border-radius:0` |
| Form alanı: mevcut sepet kuponu | 8 px | `--sf-radius-button` |
| Çekmece/pencere: menü ve ortak Dialog/Sheet kabuğu | 0 px | `--sf-radius-drawer`; ortak `rounded-none` |

Hasat köşeleri sırası üst-sol, üst-sağ, alt-sağ, alt-soldur. Fotoğrafın üzerinde yer adı rozeti yoktur. `data-overlay-ok` yalnız bilinçli başlık/eylem kapsayıcısındadır; video kontrolü işlevsel `data-media-control` düğmesidir. Çakışma testi ikisini açıkça ayırır; geri kalan yazı/görsel kesişmeleri hatadır.

### Shadows

Ürünlerde ve bölümlerde gölge yoktur. Çekmeceyi arka plandan ayıran örtü yeterlidir; varsa gölge yalnız bu işlev için kullanılır. Gölgeler hareket ettirilmez.

### Layout

Telefon dış boşluğu 16 px; tablet/masaüstü en az 32 px. Ana sayfa içerik genişliği 1312 px, ürün sayfası 1280 px, menü/alt bilgi 1440 px ile sınırlanır. Bölüm araları içerik görevine göre 48/64/96/128 px; her bölüm aynı yükseklikte değildir.

## Components

### Üst menü

Logo solda, beş gerçek sayfa bağlantısı ortada, hesap ve sepet sağda. Açık ve opak zemin; cam/blur yok. Menü satırı telefon 72 px, 1100 px ve üstünde 80 px; 48 px kontrol alanları. Çekmece yalnız dar ekranda; Esc, odak kilidi, odağı açan düğmeye geri verme ve erişilir başlık zorunlu. Çapa hedefi menü altında kalmaz. Hesap/sepet mevcut sağlayıcıları çağırır. Menü gövdesi yalnız açıldığında yüklenir; ilk sayfa yüküne eklenmez.

### Hero

Müşterinin zeytinlik videosu, tek slogan ve tek `Ürünleri İnceleyin` bağlantısı. Video geniş yüzeydir; bütün video karartılmaz. Masaüstünde slogan alt-sol bölgede, yalnız metnin arkasındaki koyu radyal geçiş üzerinde; sağdaki zeytinlik serbest kalır. Koyulaştırmanın çekirdeği %80-86 opaklıktadır; üst, alt ve sağ kenarı 48 px içinde yumuşar. Fotoğraf üstündeki düğmelerin koyu altın odak halkası, karelerden etkilenmemesi için açık düğme zemininin 4 px içinde kalır. Düğme fildişi, yazısı yeşildir. Krem panel, kesik köşeli etiket, açılış perdesi ve ikinci düğme yok. Telefonda da slogan video üstünde, alt-sol yerel karartmada durur. Hero telefon yüksekliği en fazla 608 px ve ekran yüksekliği eksi 72 px; kontrol için alt alan ayrılır. Poster ilk kare için yer ayırır; duyarlı AVIF ön yükleme bağlantısı belge başına taşınır ve yüksek önceliklidir. Fraunces normal yüzü gerektiğinde yüklenir; kullanılmayan italik dosya açılışta ön yüklenmez. Video kontrolü en az 48×48 px.

### Dört geçiş

Zeytinyağı ve Zeytin daha büyük fotoğraflı geçişler; Tesisimiz/Bayilik daha kısa görselli geçişler. Hepsinde metin ve hedef bağlayıcı BRIEF’ten gelir. Telefonda dört geçiş alt alta; ilk iki görsel geniş, Tesisimiz ve Bayilik küçük fotoğrafla yatay satırdır. Yuvarlak küçük fotoğraf + ortalı başlık şablonu yok.

### Ürün kartı ve ilk raf

Stüdyo fotoğrafı 4:5 oranlı görüntü alanında, ambalaj kırpılmadan; masaüstünde yaklaşık 260 px görüntü yüksekliği. Kart dış çerçeve/gölge yığını değildir. Ad, boy, fiyat, stok ve iki ayrı eylem okunur. İlk raf masaüstünde dört sütun; tablet iki sütun; telefonda doğal yatay raf, sonraki kart için 32 px alan ipucu. Otomatik kayma ve snap yoktur. `Tüm Ürünler` bağlantısı rafın altında durur. Başlık/eylem kısaltılmaz; `Teklife ekle` ikincil eylemdir.

### Hikâyemiz

Başlık ve kısa açıklama iki sütunlu giriş; altında geniş onaylı zeytinlik fotoğrafı ve üç değer. Telefon sırası başlık, açıklama, fotoğraf, değerlerdir. Hakkımızda bağlantısı ikincil düğmedir:48px asgari yükseklik,12×24px iç boşluk,8px köşe, yeşil1px çerçeve, kâğıt zemin ve yeşil metin; üzerine gelince fildişi zemin. Müşteri metni/görseli henüz gelmediği için yer tutucu kaydı korunur; yeni tarihçe uydurulmaz.

### Öne çıkan ürünler

İlk rafın kopyası olmayan iki sütunlu yatay ürün anlatımı; ürün sırası ters çevrilir. 1100 px ve altında iki sütundaki kartların fotoğraf/bilgisi alt alta gelir. 767 px ve altında tek sütun raf vardır; tüm telefon boylarında fotoğraf üstte, bilgi alttadır. Fotoğraf bağlantısının yüksekliği kendi oranından hesaplanır, kartın bütün yüksekliğinden alınmaz; bu, görüntünün yazı sütununa taşmasını önler. İndirim etiketi, üzeri çizili fiyat veya popülerlik iddiası yoktur.

### Üçlü banner

Masaüstünde 1.25/1/.85 oranında farklı genişliklerde tek sıra: tesis daha geniş, el ve yağ daha kısa; ikinci ve üçüncü görsel 48/96 px aşağıdan başlar. Telefonda bu düşey fark kaldırılır, üç doğal satır olur. Başlıklar açık zeminde/fotoğrafla ilişkili okunur alanda; numara, keşif etiketi ve eşit üç kemer yok. İlk sıradaki iki kategoriden ayrı görev taşır: üretim görüntülerini gösterir.

### Hasat

Başlık, verilen açıklama ve dört sade çizgisel ikonlu madde solda; müşterinin hasat fotoğrafı sağda. 2×2 kart kabuğu veya sıra numarası yok. Telefonda metin ve maddeler önce, fotoğraf sonra. `Hikayemizi Keşfet` `/hakkimizda` hedefine gider.

### Toptan ve bayilik

İki ayrı düz alan: Toptan Satış kâğıt yüzeyinde, Bayilik yeşil yüzeyde fildişi metinle. Arka plan fotoğrafı yok. Başlık, kısa açıklama ve ayrı sayfa bağlantısı. Telefonda alt alta.

### Blog ve alt bilgi

Dört gerçek yazı bağlantısı; küçük görseller, farklı metin uzunluğuna açık düzen. Koyu yeşil alt bilgi orijinal logo, slogan, iletişim, bağlantı grupları ve gerçek ödeme logolarını taşır. Link alanları en az 44 px. Sahte sosyal hesap eklenmez.

### Ürün ayrıntısı

Masaüstünde büyük görüntü solda, seçim/satın alma ve açıklama sağda; telefonda ad, boy, fiyat, adet ve satın alma önce, ardından fotoğraf, açıklama ve saklama bilgisi gelir. Kaynak okuma sırası da telefondaki bu sıradır. 320×568 ve 390×844 ilk ekranında seçili boy, fiyat ve Sepete ekle görünür. Stüdyo ve sahne görünümü seçilebilir; değişim sabit kutuda olur. Boy seçimleri görünür düğmeler; seçili durum yalnız renkle belirtilmez. Adet alanı 16 px ve 48 px hedefler. `Sepete ekle` mevcut sepet işlevini çağırır; teklif doğru ürün kimliğini taşır. Açıklama, saklama bilgisi ve en fazla dört benzer ürün. Breadcrumb ve noindex korunur.

## Do's and Don'ts

### Do

- Müşterinin sırasını ve metnini koru; yerleşimi AFİNA’ya göre yeniden kur.
- Orijinal logo, altı ürün kimliği, gerçek hedefler ve mevcut işlevler kullan.
- Fotoğrafın kendisini göster; okunurluk için yalnız metin çevresini ele al.
- 8 px boşluk ritmi, 16 px gövde ve belirgin başlık hiyerarşisi kullan.
- Klavye odağı, stok yok durumu ve azaltılmış hareketi normal tasarımın parçası yap.
- Açık/koyu yüzeyin karşıtlığını kendi arka planında ölç.

### Don't

- Her başlığa üst etiket, her bağlantıya ok veya her karta gölge ekleme.
- Sahte indirim, rakam, yorum, sağlık/sertifika/ödül iddiası üretme.
- Referans sitenin ifadelerini, dairesel kategorilerini veya numaralı bannerlarını kullanma.
- Scroll pin/scrub/snap/parallax, GSAP/Lenis, kayan karusel veya sürekli süs animasyonu ekleme.
- Müşterinin videosunu başka kliple veya yeni üretilen görselle değiştirme.
- Ana sayfaya kayan yazı bandı ekleme; Hakkımızda bandı Task199 kapsamındadır.
- `lib/auth`, `lib/db`, sepet/checkout/ödeme/sipariş mantığını tasarım gerekçesiyle değiştirme.

## Surfaces

| Seviye | Yüzey | Değer | Amaç |
|---|---|---|---|
| 0 | Ana zemin | `--sf-ivory` | Sayfa boyunca açık süreklilik |
| 1 | Kâğıt | `--sf-paper` | Fotoğraf alanı, menü, yerel bilgi yüzeyi |
| 2 | Gerçek fotoğraf | Onaylı medya | Hero, üretim ve ürün görselleri |
| 3 | Yerel koyu | `--sf-green` | Alt bilgi, bayilik kutusu ve sayfa dış kabuğu; içerik fildişidir |

## Elevation

Hiyerarşi gölgeden değil büyük fotoğraf, boşluk, yazı ölçüsü ve işlevden gelir. Kartlar sayfanın yüzeyine oturur. Menü/çekmece içerikle karışmayacak katmandadır; arka planı bulanıklaştırmak yerine sade örtü kullanılır.

## Imagery

Yalnız `customer-home.json`, `classic-photos.json` ve onaylı V3 ürün kaynakları. AVIF/WebP `V3Picture`, doğru `sizes`, sabit oran ve ilk ekran dışında lazy yükleme. İlk görünür hero posteri öncelikli; tüm sayfayı yüksek öncelikle yükleme. Üründe ambalajı kesme; görselin gerçek oranını koru. Fotoğraflı bağlantının metni zaten adını söylüyorsa tekrar eden süs görseli boş alt metin alabilir; anlam taşıyan ürün/fabrika görseli kısa Türkçe alt metin alır.

Hero müşteri MP4: masaüstü 1920, telefon 720; 1280 ara boy mevcuttur. Sessiz, inline ve loop; görünür oynat/durdur kontrolü. Azaltılmış hareket poster; veri tasarrufu ve hata durumunda da görünür içerik/eylem korunur. Video zemininde bütün fotoğrafı kapatan karartma yok.

Bekleyenler: “Nesillerin Emeği” yazısız fotoğraf ve müşteri açıklaması; zeytinyağı paylaşım görseli. Şimdilik onaylı zeytinlik/zeytinyağı fotoğrafları kullanılır; ortak içerik kaydından değiştirilebilir olmalıdır. Plakalı tesis orijinali kullanılmaz. Temsili ambalaj için sayfada bir kısa not yeterlidir.

## Layout

Masaüstünde büyük video → dört yol → ilk ürün rafı → hikâye → farklı ürün yerleşimi → üç banner → hasat → iki iş bağlantısı → dört yazı → alt bilgi. Bölümler doğal sayfa akışındadır. Tek imza orijinal altın dal/el logosudur; yeni dekoratif motif ailesi yoktur.

Telefonda 16 px metin kenarı ve doğal okuma sırası; hero eylemi kısa ekranda görünür, menü 48 px hedeflerle erişilir. 320–430 px ilk ürün rafı dışında sayfa yatay kaymaz. Ürün rafı klavyeyle ve dokunarak kullanılabilir, sonraki kartın görünmesi kayma ipucudur. 768–1100 px iki ürün sütunu; 1100 px üstünde dört sütun. Tam menü yalnız gerçek etiketler rahatça sığdığında açılır. Büyük ekranlarda içerik sınırı metni aşırı uzatmaz.

### Hareket sözleşmesi

`motion/react` ve mevcut LazyMotion. Yalnız transform ve opacity. İlk açılışta başlık/eylem birlikte tek 8→0 px ve .85→1 opacity girişi yapar; spring 180/28, sıra gecikmesi yoktur. Başlık sunucu çıktısında görünür kalır (`initial=false`). Hikâye ve üçlü banner dışında `whileInView` yok; bu iki yerde `once: true`, görünürlük eşiği .15, aynı 8 px/.85 opacity ve spring 180/28. Menü düğmesi basışta .96 ölçek; çekmece 24→0 px yatay ve .6→1 opacity, spring 200/28. Ürün görseli küçük resim düğmeleri basışta .98 ölçek ve spring 240/28; boy seçimi sabit radio kontrolüdür. Azaltılmış harekette tümü anlık, içerik doğrudan görünür. CSS global hareket azaltma kuralı da korunur. Kaydırma video zamanını veya sayfa konumunu yönetmez.

## Agent Prompt Guide

### Task199 tüm sayfalara uyarlama

“Bu belgedeki Ellek sofrası yönünü koru. Fraunces/Figtree, `--sf-*` renkleri, 8 px ölçek, gerçek katalog ve 44 px alt sınırı kullan. Yeni üst etiket/numara/ok/gölge ekleme. Mevcut sunucu işlevlerini değiştirme. Önce sayfanın gerçek işini ve durumlarını çıkar, sonra görünümü uyarla; boş, hata, yükleniyor, seçili ve stok yok durumlarını doğrula.”

### Katalog ve kategori

“Tek başlık, görünür kategori gezinmesi ve mevcut ProductTile kullan. Zeytin üst kategorisi alt grupları açıkça gösterir. Gerçek ürün kimliği/fiyat/stok yetkisini koru. Noindex sürer. Dört sütun ancak ürün adı ve eylemleri sığıyorsa; telefonda liste sayfası için iki dar/kırpık kart yerine okunur sütun.”

### Hakkımızda, toptan ve bayilik

“Üretimi müşteri fabrika fotoğrafıyla anlat. Yeni kuruluş yılı/kapasite/sertifika uydurma. Hakkımızda kayan bandı yalnız kendi sayfasında; hover/focus durdurma ve reduced-motion durağan metin zorunlu. Toptan formda `?teklif=<id>` ön seçimi ve aranabilir il/ilçe mantığını koru. Bayilikte mevcut içerik ve gerçek bağlantılar.”

### Hesap, sepet ve ödeme

“Mevcut sağlayıcılar ve servis çağrıları değişmez. Tek sütunlu 16 px form alanları, alan içi şifre göster düğmesi, alan altında Türkçe hata. 48 px eylemler. Klavye açık telefon ekranında kaydırarak son düğmeye erişim. Sepet toplamı ve PayTR iFrame sınırı korunur; gerçek kart formu üretme.”

### Blog, uzun metin ve 404

“Blogda mevcut dört yazıdan çalış; H1 soru, ilk 40–60 kelimede cevap, soru H2’ler, yazar/güncelleme ve SSS AEO aşamasıyla uyumlu olsun. Yasal metinlerde 72ch sınırı ve içindekiler. 404 kısa açıklama ile ana sayfa ve ürünlere dönüş verir. Sadece ana sayfa görsel dilini taşımak için içerik uydurma.”

### Doğrulama ve sınır

“320–2560 px görev matrisini; klavye/odak, menü Esc, taşma, kırık görsel, konsol, axe, CLS, gerçek video boyu ve reduced-motion kontrolünü çalıştır. Görüntü kanıtını sonuçtan ayrı sakla. Çalışmamış kontrolü PASS yazma. K1 seçimi Task198, tüm sayfa/cihaz kabulü sonraki kapılardır. Push/yayın/canlı DB/.env yok; node_modules ve .next silinmez; AFINA-KAYNAK ve output git’e eklenmez.”

## Quick Start

### CSS Custom Properties

```css
:root {
  --sf-green: #243A29;
  --sf-ivory: #F5F1E7;
  --sf-paper: #FFFDF8;
  --sf-gold: #D4B483;
  --sf-ink: #202A22;
  --sf-muted: #586052;
  --sf-line: #D7D7C9;
  --sf-focus: #80602D;
  --sf-space-8: 8px;
  --sf-space-16: 16px;
  --sf-space-24: 24px;
  --sf-space-32: 32px;
  --sf-space-48: 48px;
  --sf-space-64: 64px;
  --sf-space-96: 96px;
  --sf-space-128: 128px;
  --background: var(--sf-ivory);
  --foreground: var(--sf-ink);
  --primary: var(--sf-green);
  --primary-foreground: var(--sf-paper);
  --muted-foreground: var(--sf-muted);
  --ring: var(--sf-focus);
}
```

### Tailwind v4

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted-foreground: var(--muted-foreground);
  --color-ring: var(--ring);
  --color-store-olive: var(--sf-green);
  --color-store-ivory: var(--sf-ivory);
  --color-store-paper: var(--sf-paper);
  --color-store-gold: var(--sf-gold);
  --font-sans: var(--font-body);
  --font-serif: var(--font-display);
}
```

Bu örnek mevcut `@theme` içine birleştirilir; ikinci çelişen tema açılmaz. Eski bileşenlerin gerektirdiği adlar ortak semantik değere bağlanabilir, fakat eski ön yüzün kanıtlı temizliği Task199'a aittir. Gerçek uygulama dosyaları ve ölçüm sonuçları Task198 `KANIT.md` kaydında izlenir.


## Task199: tüm müşteri sayfaları

A tasarımının Fraunces/Figtree, fildişi/kâğıt/yeşil ve 8 px aralık sistemi katalog, içerik, teklif, üyelik ve hesaba uygulanır. Yeni sunumlar `components/storefront/{catalog,content,quote,account}` içindedir. Eski auth, sepet, fiyat/stok ve form gönderim yetkileri korunur. Gerçek online ödeme kapalıdır; sepet ve ödeme sayfası bunu açıklar, teklif bağlantısı verir.

Katalog telefonda tek, tablette iki, geniş ekranda üç ürün sütunu; kategori gezinmesi ve sıralama kontrolleri 48 px'tir. Ürün boyu seçimi sayfa başlığı, açıklaması, canonical ve OG adresini birlikte günceller. Hakkımızda tesis fotoğrafı ve tek durdurulabilir şerit; blog başında doğrudan yanıt, soru başlıkları, üç SSS ve ilgili ürünler; yasal metinlerde taslak durumu, içerik bağlantıları ve en fazla 72ch okuma alanı bulunur. Üyelikte tek görünür form yüzeyi vardır; 3D dönüş yoktur. Hesapta soldaki gezinme telefonda doğal akışa geçer. Şifre göster/gizle alanın içindedir.

Hareketler yalnız kullanıcı geri bildirimi içindir: menü spring'i (`stiffness:200,damping:28`) ve sepet spring'i (`visualDuration:.35,bounce:0`), kategori göstergesi (`duration:.25,ease:easeOut`,transform), talep özeti (`stiffness:160,damping:26`,8px/opacity), ürün basma (`stiffness:240,damping:28`,.98scale). Hakkımızda şeridi müşteri talebiyle 36sn doğrusal transform kullanır; üzerine gelince, odak içinde ve düğmeyle durur. Azaltılmış harekette sabittir. Formlar/sayfa gövdeleri kaydırmayla açılmaz; tüm içerik ilk HTML'de erişilir. Mevcut ana sayfa tek açılış ve ürün hover hareketleri A temelinden korunur.


Task199 yükleme sınırları: müşteri bağlantıları başka sayfaların kodunu kendiliğinden indirmez. Kapalı ürün seçicisi ilk tıkta yüklenir; telefon alanının aynı ölçüdeki kabuğu, alanın100px yakınına gelince gerçek kontrolle değiştirilir. Odak, hata/retry ve ilk tık korunur; yeni görünme animasyonu yoktur. Doğrulama aynı lib modülünde kalır. Hesap adres/sipariş/detay gövdelerinde en az `calc(100svh - 240px)` alan ayrılır; sabit sipariş başlıkları ilk HTML'dedir, kişisel veri yanıt bekler.404telefon eylemleri tam genişlikte alt alta kalır; yazı tipi yüklenmesi düğme satırını değiştirmez.
