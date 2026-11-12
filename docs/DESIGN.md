# AFİNA ZEYTİN — Altın Dal (tasarım dili v3 · 12 Kasım 2026)

> Sanat yönetimi cümlesi: **AFİNA'nın kendi afişindeki dünya web'e taşınır: zeytinliğin derin yeşili, şampanya altını hap düğmeler, iştah açan büyük fotoğraf; hepsi açık fildişi zeminde.**
> Bu dosya ön yüzün tek tasarım sözleşmesidir. Önceki dil ("Ellek sofrası") `docs/DESIGN-v2-ellek-sofrasi.md` içinde yalnız tarihçedir, uygulanmaz. İçerik ve sıra için `docs/MASTER-PROMPT.md` §10–§11 ve müşteri BRIEF'i geçerlidir.

## Neden değişti (karar kaydı)

Müşteri v2'yi beğenmedi; neyi beğenmediğini kullanıcı iletmedi ("başla sen"). Yön bu yüzden üç kanıttan türetildi; **bu seçim Claude'un kararıdır, müşteri onayı K5 kapısında alınır:**

| Kanıt | Ne gösteriyor | v2'de neydi |
|---|---|---|
| Müşterinin kendi marka afişi (`AFINA-KAYNAK/referans/kurumsal-banner-referans.png`, AFİNA ZEYTİN şeridi) | Derin zeytin yeşili fotoğraf zemin, altın logo, **altın hap etiketler + ikon**, yuvarlak hatlı yazı, dairesel "%100 Doğal" mührü, gerçek ürün fotoğrafı | Düz fildişi, köşeli koyu düğme, mühür/etiket yasak, bol boşluk |
| Müşterinin beğendiği site (Köklü Zeytincilik, Firecrawl marka taraması) | Zarif serif (Cormorant Garamond) + geometrik sans (Jost), yeşil + krem + altın, 8–9 px yuvarlak düğme | Fraunces + Figtree, 4–8 px köşe |
| Dünyadaki iyi zeytinyağı siteleri (Firecrawl: Brightland, Graza, Kosterina) | Karakterli **çok büyük** serif başlık (72 px+), sade sans gövde, krem zemin, zeminden ayrışan güçlü düğme rengi, fotoğraf ağırlığı | Başlıklar orta boy, düğme zemine yakın |
| ui-ux-pro-max `--design-system` ("olive oil food artisan ecommerce premium natural") | Yazı çifti **Cormorant / Montserrat**; altın vurgu; hover 150–300 ms; 4,5:1 karşıtlık; görünür odak | — |

Reddedilen ui-ux-pro-max önerileri: koyu zemin + "Liquid Glass" (müşteri açık ton istedi; cam efekti yasak listede).

## Tokens — Colors

| Ad | Değer | Token | Rol |
|---|---|---|---|
| Zeytin yeşili | `#243A29` | `--sf-green` | Birincil düğme, koyu bant, alt bilgi, başlık metni |
| Derin yeşil | `#1A2B1E` | `--sf-green-deep` | Düğme hover/basılı, fotoğraf üstü koyulaştırma tabanı |
| Zeytin | `#5C6B3A` | `--sf-olive` | İkon, ince süs çizgisi, ikincil vurgu (fildişinde 5,1:1) |
| Adaçayı | `#E7EBDD` | `--sf-sage` | Ürün görsel zemini, yumuşak bant |
| Fildişi | `#F5F1E7` | `--sf-ivory` | Sayfa zemini |
| Kâğıt | `#FFFDF8` | `--sf-paper` | Kart, üst menü, form alanı |
| Şampanya altını | `#D4B483` | `--sf-gold` | Altın düğme dolgusu, madalyon, ince çizgi, koyu zeminde vurgu |
| Koyu altın | `#80602D` | `--sf-gold-deep` | Açık zeminde altın metin/ikon/üst etiket, odak halkası (5,1:1) |
| Mürekkep | `#202A22` | `--sf-ink` | Gövde metni |
| Soluk | `#586052` | `--sf-muted` | Yardımcı metin |
| Çizgi | `#D7D7C9` | `--sf-line` | Ayırıcı, kart kenarı |

Hata/başarı/uyarı tokenları mevcut değerleriyle kalır. Karşıtlık çiftleri (ölçülmüş): fildişi/yeşil 11:1+, yeşil/altın 6,2:1, koyu altın/fildişi 5,1:1. **Beyaz yazı altın üstüne konmaz** (2:1); altın dolgunun üstündeki yazı her zaman `--sf-green`.

Yüzey dengesi: sayfanın çoğu açık (fildişi/kâğıt/adaçayı). Ana sayfada **en çok 2 koyu yeşil bant** + alt bilgi; iç sayfalarda en çok 1.

## Tokens — Typography

### Cormorant — başlık · `--font-display`
Google Fonts, değişken ağırlık; kullanılan: 600 (başlıklar), 700 (hero). `latin` + `latin-ext` (İ ı ş ğ ç ö ü). Harf aralığı −0,01em; satır 0,95–1,1. Küçük x-yüksekliği nedeniyle **büyük** kullanılır; 22 px altına inmez. İtalik yalnız hero başlığında tek ifadede, aynı aileden.

### Montserrat — gövde, arayüz, düğme · `--font-body`
Google Fonts, değişken; 400 (gövde), 500 (menü), 600 (düğme, fiyat, etiket). Gövde 16 px / 1,65; satır ≤ 68 karakter. Fiyatlarda `font-variant-numeric: tabular-nums`.

Yükleme: `next/font/google` (`Cormorant`, `Montserrat`; `display: "swap"`, `subsets: ["latin","latin-ext"]`) — dosyalar derlemede indirilir ve kendi alan adımızdan sunulur, CSP değişmez. Derleme ortamında indirme başarısız olursa woff2 dosyaları OFL lisansıyla `app/fonts/` altına alınır ve `next/font/local` kullanılır. Fraunces/Figtree/Inter dosyaları ve `scripts/optimize-fraunces.py` kaldırılır.

### Type Scale

| Rol | Aile / ağırlık | Masaüstü | Telefon | Satır |
|---|---|---|---|---|
| Hero başlık | Cormorant 700 | `clamp(56px, 7vw, 96px)` | 44–52 px | 0,95 |
| Bölüm başlığı (h2) | Cormorant 600 | `clamp(38px, 4.2vw, 56px)` | 34 px | 1,05 |
| Alt başlık (h3), kart başlığı | Cormorant 600 | 28 px | 24 px | 1,1 |
| Ürün adı | Cormorant 600 | 24 px | 22 px | 1,15 |
| Giriş paragrafı | Montserrat 400 | 18 px | 17 px | 1,6 |
| Gövde | Montserrat 400 | 16 px | 16 px | 1,65 |
| Düğme | Montserrat 600 | 15 px, +0,01em | 15 px | 1 |
| Menü | Montserrat 500 | 15 px | 17 px (çekmece) | 1 |
| Fiyat | Montserrat 600 | 20 px | 18 px | 1 |
| Üst etiket | Montserrat 600, büyük harf, +0,14em, `--sf-gold-deep` | 12 px | 12 px | 1 |
| Yardımcı / küçük | Montserrat 400 | 14 px | 14 px | 1,5 |

Üst etiket (ör. "Hikayemiz") afişteki dile aittir ve serbesttir; en çok **her iki bölümde bir**, yanında 16 px zeytin yaprağı ikonu. Büyük harf dönüşümü CSS ile ve `lang="tr"` altında yapılır (i → İ).

## Tokens — Spacing & Shapes

Boşluk ölçeği değişmez: 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128 (`--sf-space-*`). Bölüm dikey boşluğu masaüstü 96, telefon 64. İçerik genişliği en çok 1280 px; yan boşluk masaüstü 48, telefon 16.

### Köşe tablosu (tek kaynak; kod bu tabloyla birebir)

| Öğe | Köşe | Token |
|---|---|---|
| Düğme, etiket (tag), adet seçici, arama alanı, sepet rozeti | 999 px (hap) | `--sf-radius-pill` |
| Kart, fotoğraf, panel, pencere, çekmece dış köşesi | 24 px (telefon 20 px) | `--sf-radius-card` |
| Form alanı, küçük görsel, açılır liste | 12 px | `--sf-radius-field` |
| Madalyon, mühür, ikon dairesi | 50% | `--sf-radius-round` |
| Hero video alt köşeleri | 32 px (telefon 24 px) | `--sf-radius-hero` |
| Kemer görsel (yalnız Hasat ve Hakkımızda ana görseli) | üst 999 px, alt 24 px | `--sf-radius-arch` |

Eski `--sf-radius-*` tokenları (action, button, panel, image, harvest, badge, cart-card, drawer, video…) silinir; kodda tablo dışı yarıçap kalmaz.

### Gölge
Duran kart: gölgesiz, 1 px `--sf-line`. Hover/odak: `--sf-shadow-lift: 0 16px 36px -18px rgba(36,58,41,.32)`. Ürün görselinin altında yumuşak zemin gölgesi (elips, `rgba(36,58,41,.18)`). Gri/siyah gölge yok.

## Sayfa yapısı (12 Kas kararı: tek sayfa landing)

Site **tek sayfalık landing**: `/` sırayla Hero (`baslangic`) · Ürünler (`urunler`, kategori sekmeli) · Hikâyemiz (`hikayemiz`, hakkımızda + tesis + hasat) · Toptan & Bayilik (`toptan-bayilik`, iki sekme + form) · Zeytin Defteri (`blog`, 3 kart) · SSS + İletişim (`iletisim`) · alt bilgi. Üst menü `/#id` bağlantılarıdır. Ayrı kalan sayfalar: sepet, ödeme, giriş/kayıt/hesabım, yönetim paneli, yasal sayfalar, `/urun/[slug]`, `/blog/[slug]`. Eski adresler 308 ile bölüme yönlendirilir. Bölüm dikey boşluğu masaüstü 56–64, tablet 48, telefon 36–40 px. Tekrar kuralı: aynı hedefe ikinci düğme yok, bölüm başına en çok bir `primary`/`gold`, aynı cümle iki kez geçmez. Hareket: yalnız tek seferlik hafif belirme (opacity + 8 px, 280 ms) ve hover/odak; kaydırmaya bağlı efekt yok. Ayrıntı: `docs/tasks/208-tek-sayfa-landing.md`. Aşağıdaki "Components" bölümündeki sayfa başına tarifler bu yapıya göre okunur (bölümler tek sayfada birleşir).

## Components

### PillButton — imza öğe: "altın madalyonlu hap"
Yapı: hap gövde + sağ uçta **36 px dairesel madalyon** içinde ikon (ok / sepet / onay / artı). Yükseklik masaüstü 52, telefon 48; sol iç boşluk 24, madalyonlu sağ iç boşluk 8, madalyonsuz 24. Etiket **tek satır** (`white-space: nowrap`); 320 px'te sığmazsa düğme tam genişlik olur.

| Varyant | Dolgu / yazı | Madalyon | Nerede |
|---|---|---|---|
| `primary` | `--sf-green` / `--sf-ivory` | `--sf-gold` zemin, yeşil ikon | Açık zeminde ana eylem (Sepete ekle, Ürünleri İnceleyin, Gönder) |
| `gold` | `--sf-gold` / `--sf-green` | `--sf-green` zemin, fildişi ikon | Koyu bant, video/fotoğraf üstü, alt bilgi |
| `outline` | saydam, 1,5 px `--sf-green` kenar / `--sf-green` | kenarlı, saydam | İkincil eylem (Teklife ekle, Hakkımızda, Tüm Ürünler açık zeminde) |
| `quiet` | kâğıt zemin, 1 px `--sf-line` kenar / `--sf-green` 600; yükseklik 44 | 28 px mini madalyon: 1,5 px `--sf-gold` halka, 14 px ok | Üçüncül bağlantı, **tek başına duran** her yazı bağlantısı (12 Kas kararı: alt çizgili tek başına bağlantı yok). Cümle içi bağlantılar alt çizgili kalır. Koyu zeminde kenar `--sf-gold` %40, yazı `--sf-ivory`. Telefonda tam genişlik ya da 2 sütun |

Durumlar: hover → dolgu `--sf-green-deep` (gold'da %6 koyulaşma), madalyon `translateX(4px)`; basılı → `scale(.97)`; odak → 2 px `--sf-gold-deep` halka, 3 px ofset; `busy` → madalyonda dönen halka, `aria-busy`, tıklanamaz; `disabled` → `--sf-sage` dolgu, `--sf-muted` yazı, madalyon yok. Geçiş 180 ms `ease-out`; azaltılmış harekette yalnız renk değişir. Ölçek büyütme (scale > 1) kullanılmaz.
Sepete ekle akışı: "Sepete ekle" + sepet → `busy` → **"Eklendi"** + onay (1,6 sn) → başa döner. Mantık `components/catalog/AddToCart` içinde aynen kalır; yalnız görünüm değişir. Stok yok: `disabled` "Mevcut değil".
Bir görünüm alanında tek `primary`/`gold`; diğerleri `outline`/`quiet`.

### Etiket (Tag)
Hap, 32 px yükseklik, Montserrat 600 13 px. `sage` (adaçayı zemin, yeşil yazı; boy "1 kg", kategori) ve `gold` (altın zemin, yeşil yazı; koyu/fotoğraf üstü). Afişteki "Zeytin / Zeytinyağı" haplarının karşılığıdır; ikon solda 16 px.

### Mühür (Stamp)
Durağan SVG: dairesel yazı + ortada yaprak, `--sf-gold-deep` (koyu zeminde `--sf-gold`), 96–120 px. **Yalnız** müşterinin izinli iddiasında: Hasat bölümündeki "%100 Doğal ve Katkısız" maddesi ve Hakkımızda. Dönmez, yanıp sönmez.

### Madalyon
48 px daire, 1,5 px `--sf-gold` kenar, içinde 22 px `lucide` ikonu (`--sf-green`; koyu zeminde `--sf-gold`). 3'lü ikon, Hasat maddeleri, Toptan/Bayilik kartları.

### SectionHeading
İsteğe bağlı üst etiket + Cormorant başlık + isteğe bağlı giriş paragrafı; `tone="dark"` koyu bantta fildişi/altın. Başlığın altında 48 px genişlikte 2 px altın çizgi yalnız ortalanmış başlıklarda.

### Üst menü
Kâğıt zemin, 76 px (telefon 64), alt 1 px çizgi, yapışkan. Logo solda; bağlantılar Montserrat 500, etkin bağlantıda 2 px altın alt çizgi; sağda hesap ikonu + **sepet hapı** (ikon + adet rozeti). Telefonda logo + sepet + menü düğmesi; çekmece sağdan, 24 px sol köşeler, bağlantılar Cormorant 28 px, altta `gold` düğme "Ürünleri İnceleyin".

### Hero
Tam genişlik video, yükseklik `min(86vh, 860px)` (telefon 78vh), alt köşeler `--sf-radius-hero`. Sol altta metin: Cormorant 700 fildişi başlık + 18 px tek satır açıklama + **`gold` düğme** "Ürünleri İnceleyin". Okunurluk: sol-alt köşeden `--sf-green-deep` %88 → saydam doğrusal + dairesel koyulaştırma; videonun sağ üstü açık kalır. Video duraklat düğmesi sağ altta 44 px daire. Hero'da mühür ve üst etiket yok.

### Dört geçiş (4 kutu)
Dört fotoğraf kartı, oran 4:5 (telefon 2×2, oran 3:4), köşe 24. Altta yeşil koyulaştırma üstünde Cormorant 28 px fildişi başlık + Montserrat 14 px eylem metni ("Ürünleri İnceleyin" / "Hakkında Bilgi Alın") + 36 px altın madalyon ok. Hover: fotoğraf `scale(1.03)`, madalyon 4 px sağa. Kartın tamamı bağlantıdır.

### Ürün kartı
Kâğıt kart, köşe 24, 1 px çizgi. Üstte **adaçayı zeminli** görsel alanı (oran 1:1, ürün `object-fit: contain`, altında zemin gölgesi); sol üstte boy etiketi (`sage` Tag). Altında Cormorant 24 px ad, Montserrat 600 fiyat + stok satırı, tam genişlik `primary` "Sepete ekle", altında `quiet` "Teklife ekle". Hover: kart `translateY(-4px)` + `--sf-shadow-lift`. Telefon ilk raf: yatay kaydırmalı raf (kart 74vw, sonraki kartın kenarı görünür); ikinci ızgara: 2 sütun, kompakt (düğme 44 px, madalyon 28 px).

### Hikayemiz
İki sütun: solda büyük fotoğraf (köşe 24) + sağ alt köşesine binen küçük ikinci fotoğraf (kâğıt 6 px çerçeve); sağda üst etiket "Hikayemiz", başlık, metin, `outline` "Hakkımızda", altında 3 madalyonlu satır. `whileInView` ufak giriş (müşteri izni).

### Öne Çıkan Ürünler — koyu bant
`--sf-green` zemin, başlık `tone="dark"`, sağ üstte `gold` "Tüm Ürünler". İçinde kâğıt ürün kartları (afişteki "yeşil zemin üstünde parlayan ürün" hissi). Ana sayfadaki 1. koyu bant.

### Üçlü banner
Üç dikey fotoğraf kartı (ortadaki 32 px aşağı kaydırılmış), köşe 24; altta koyulaştırma üstünde başlık + altın madalyon ok. `whileInView` ufak giriş.

### Bereketin Hasat Vakti
Solda üst etiket + başlık + müşteri cümlesi + 4 madde (madalyonlu; dördüncü maddede **mühür**) + `primary` "Hikayemizi Keşfet"; sağda **kemer** fotoğraf (`--sf-radius-arch`), arkasında adaçayı daire.

### Toptan Satış + Bayilik
Adaçayı bant üstünde iki kâğıt kart (köşe 24, arka plan görseli yok): madalyon, Cormorant 28 px başlık, tek cümle, `primary` / `outline` düğme.

### Blog
1 büyük (yatay) + 3 küçük kart; görsel köşe 24; başlık Cormorant; "4 dk okuma" Montserrat 13 px; `quiet` "Tüm yazılar".

### Alt bilgi — koyu
`--sf-green`; üstte ince altın çizgi + zeytin dalı çizimi; altın logo, Cormorant slogan; bağlantılar Montserrat 15 px fildişi (hover altın); `gold` düğme "Teklif İste"; ödeme logoları kâğıt hap içinde. Ana sayfadaki 2. koyu yüzey sayılmaz.

### Formlar
Alan: kâğıt zemin, 1 px `--sf-line`, köşe 12, yükseklik 52; etiket Montserrat 600 14 px üstte; odakta 2 px koyu altın halka; hata metni alanın altında 14 px. Gönder düğmesi `primary` tam genişlik (telefon). İki seçenekli seçim yan yana hap anahtar.

### Ürün ayrıntısı
Solda adaçayı zeminli büyük görsel (köşe 24) + küçük görsel şeridi (köşe 12); sağda Tag (kategori), Cormorant 44–56 px ad, boy seçimi hap anahtar, fiyat 28 px, adet seçici (hap), `primary` "Sepete ekle" + `outline` "Teklife ekle". Telefonda sıra 198-3'teki gibi: ad, boy, fiyat, adet, düğmeler ilk ekranda; fotoğraf altında.

## Do's and Don'ts

### Do
- Fotoğrafı büyük kullan; her bölümde en az bir gerçek görsel ya da ürün.
- Başlıkları cesur büyüt; Cormorant küçük kalırsa zayıf görünür.
- Düğmeyi zeminden ayır: açıkta yeşil, koyuda altın.
- Altını az ve parlak kullan: madalyon, ince çizgi, etkin durum.
- Fotoğraf üstü yazıda koyulaştırma + sayısal karşıtlık ölçümü.

### Don't
- Köşeli düğme, 4–8 px yarıçap, gri gölge, düz boş fildişi alan (v2'nin reddedilen hali).
- Altın üstüne beyaz yazı; altın renkli gövde metni.
- Dönen/yanıp sönen mühür, sürekli oynayan süs, cam/bulanıklık efekti, degrade yazı.
- Mührü izinli iki yer dışında kullanmak; yeni iddia eklemek.
- Köklü Zeytincilik'in yerleşimini, ikonlarını, cümlelerini almak (yazı ailesi benzerliği kopya sayılmaz; düzen ve metin özgün kalır).
- Kaydırmaya bağlı hareket, sabitleme, sayfa düzeyinde snap.

## Surfaces
Ana sayfa sırası ve zemin: menü (kâğıt) → hero (video) → 4 kutu (fildişi) → ürünler (fildişi) → Hikayemiz (kâğıt) → **Öne Çıkan (yeşil)** → 3'lü banner (fildişi) → Hasat (fildişi + adaçayı daire) → Toptan/Bayilik (adaçayı) → Blog (kâğıt) → **alt bilgi (yeşil)**. Art arda iki aynı zemin en çok bir kez.

## Imagery
Yalnız onaylı görseller (MASTER-PROMPT §3). Ürün fotoğrafı beyaz kutuda değil adaçayı zeminde; sahne fotoğrafları tam kart. Koyulaştırma: `linear-gradient(to top, rgba(26,43,30,.86), rgba(26,43,30,0) 62%)`. Süs: logodaki dal çizgisinden türeyen tek satır zeytin dalı (SVG, `--sf-olive` / `--sf-gold`), sayfada en çok 2 kez.

## Layout
Masaüstü 12 sütun, 24 px oluk; telefon 4 sütun, 16 px. Kırılımlar 640 / 768 / 1024 / 1280. Ana sayfada en az 5 farklı yerleşim ailesi (tam genişlik video, 4'lü kart, raf, iki sütun, koyu bant ızgara, kaydırılmış üçlü, kemer, ikili kart, 1+3 blog).

### Hareket sözleşmesi
MASTER-PROMPT §8 aynen. Ek: PillButton madalyonu 4 px, kart kaldırma −4 px, fotoğraf 1,03; hepsi 180–240 ms, yalnız transform/opacity; azaltılmış harekette kapalı.

## Agent Prompt Guide
- **Yeni bir düğme gerekiyorsa** `PillButton` kullan; yeni düğme sınıfı yazma. Varyantı zemine göre seç (açık → primary, koyu/fotoğraf → gold).
- **Yeni bir kart gerekiyorsa** köşe 24, kâğıt zemin, 1 px çizgi; görsel alanı adaçayı.
- **İç sayfa başlığı:** üst etiket (isteğe bağlı) + Cormorant h1 + giriş paragrafı; yanında/altında fotoğraf ya da adaçayı bant. Düz boş başlık şeridi bırakma.
- **Katalog:** solda kategori hapları (Tag, etkin olan yeşil dolgu), sağda ürün kartı ızgarası (masaüstü 3, tablet 2, telefon 2 kompakt).
- **Sepet/ödeme/hesap:** kâğıt paneller köşe 24; özet paneli yeşil değil kâğıt (v2'deki koyu özet kutusu kalkar), toplam satırı Cormorant 28 px; birincil eylem `primary` tam genişlik.
- **Yönetim paneli:** aynı tokenlar; düğmeler hap ama madalyonsuz (`icon="none"`), tablo satırı 52 px, başlıklar Montserrat 600 (panelde Cormorant yalnız sayfa başlığında).
- **21st kaynakları (uyarlanır, birebir yapıştırılmaz):** hyperiux/arrow-fill-button (#26022, hap + ok dolgusu) · bidyut10/add-to-cart-button (#34564, sepete ekle durumları) · shadcnstore/product-card-1 (#28227) · bundui/navigation-menu4 (#18131, mağaza menüsü) · designali-in/stamp (#3417, mühür) · haydenbleasel/pill (#1600, etiket).

## Quick Start

```css
:root {
  --sf-green: #243A29; --sf-green-deep: #1A2B1E; --sf-olive: #5C6B3A;
  --sf-sage: #E7EBDD; --sf-ivory: #F5F1E7; --sf-paper: #FFFDF8;
  --sf-gold: #D4B483; --sf-gold-deep: #80602D;
  --sf-ink: #202A22; --sf-muted: #586052; --sf-line: #D7D7C9; --sf-focus: #80602D;
  --sf-radius-pill: 999px; --sf-radius-card: 24px; --sf-radius-field: 12px;
  --sf-radius-round: 50%; --sf-radius-hero: 32px; --sf-radius-arch: 999px 999px 24px 24px;
  --sf-shadow-lift: 0 16px 36px -18px rgba(36, 58, 41, .32);
  --sf-overlay: linear-gradient(to top, rgba(26, 43, 30, .86), rgba(26, 43, 30, 0) 62%);
  --sf-button-h: 52px; --sf-coin: 36px;
}
@media (max-width: 640px) { :root { --sf-radius-card: 20px; --sf-radius-hero: 24px; --sf-button-h: 48px; } }
```

```css
@theme inline {
  --font-display: var(--font-cormorant), "Iowan Old Style", Georgia, serif;
  --font-body: var(--font-montserrat), "Helvetica Neue", Arial, sans-serif;
}
```
