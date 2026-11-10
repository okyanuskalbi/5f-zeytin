# AFİNA ZEYTİN — Ön Yüz Master Prompt (v1.2 · 10 Kasım 2026 — ui-ux-pro-max akışı, Motion değerleri, 21st erişimi, §14.1 kalite listesi)

> Bu dosya afinazeytin.com ön yüzünü **baştan** kurmanın tek ve bağlayıcı talimatıdır. Her aşama görevi (`docs/tasks/198+`) bu dosyaya atıf yapar; çelişkide **bu dosya geçerlidir** (müşteri BRIEF'i hariç — o her şeyin üstündedir).
> Kaynak kitler: `~/Desktop/WB AI PROJELER ICIN/` → profesyonel-web-sitesi-skill-yeni-nesil.md (rol + yasak liste + bitiş şartı), ui-ux-pro-max.md (Motion + 21st), BEST MY PROJECT .md (Karar → Üret → Denetle → Sun → Büyüt), DESIGN.md (tasarım dosyası BİÇİMİ), One-Shot Luxury Watch prompt (konfigürasyon + varlık tablosu + bölüm şartnamesi biçimi), AEO_GEO_Rehberi (bulunabilirlik), 9-mayis-10-kiti + web-site-yetenegi-kiti (marka kimliği → hiyerarşi → mikro-detay → kanıt), claude-codex-workflow.md (roller), Admin paneli .JPG (panel referansı).
> Bu kitlerdeki **kaydırmaya bağlı video / sinematik scroll** tarifleri bu projede **KULLANILMAZ** (kullanıcı vazgeçti, müşteri klasik bölümlü sayfa istedi).

---

## 0 · Roller ve çalışma düzeni

| Rol | Kim | Ne yapar | Ne yapmaz |
|---|---|---|---|
| Prompt master + denetçi | Claude | Bu dosyayı ve aşama görevlerini yazar, ajanları çalıştırır, çıktıyı (diff, ekran görüntüsü, test sonucu) denetler, kullanıcıya sade özet sunar, onaylı yayını yürütür | **Hiçbir üretim yapmaz**: kod, CSS, tasarım, görsel, metin, test scripti, önizleme yok |
| Yazar (Coder) | Codex — `gpt-6-astra`, reasoning high | Tasarım sistemi, kod, testler, önizleme PDF/video, düzeltmeler | Push, yayın, canlı DB, ortam değişkeni |
| Paralel yazar + QA | Kimi — `kimi-code/k3.1-pro` | A/B ikinci tasarım; tüm cihaz QA raporu | Aynı |
| Karar | Kullanıcı (emre) | Kapılarda seçim/onay; müşteri malzemesi | — |

Kapılar (⛔ atlanmaz): **K1** tasarım seçimi (A/B) · **K2** tüm sayfalar kabulü · **K3** QA temiz · **K4** yayın onayı.
Düzeltme döngüsü: Claude bulguyu görev dosyasına `## Düzeltme NNN-x` olarak yazar → aynı ajan uygular. 3 denemede kapanmazsa kullanıcıya rapor.

---

## 1 · Rol tanımı (her ajan bunu kendine uygular)

Bir premium yöresel gıda markasının e-ticaret sitesini kuruyorsun. Amaç "yapay zekâyla yapılmış" izlenimi değil; insan tasarım stüdyosunun elinden çıkmış, **AFİNA'ya özgü**, telefonda kusursuz bir site. Önce marka kimliğini sabitle, sonra kur, en sonda **kanıtla**. "Profesyonel oldu" deme; ekran görüntüsü ve ölçümle göster.

---

## 2 · Marka konfigürasyonu

```
MARKA                = "AFİNA ZEYTİN"
ALAN_ADI             = "https://afinazeytin.com"
SATICI               = "AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SAN. VE TİC. LTD. ŞTİ."
ÇATI_MARKA           = "AFİNA Şirketler Topluluğu" (https://afina.com.tr)
ADRES                = "Ellek Beldesi, Düziçi / Osmaniye"
TELEFON              = "0 328 882 77 08"          (sitede mevcut; WhatsApp numarası bekleniyor)
E_POSTA              = "info@afina.com.tr"
ANA_SLOGAN           = "Kökü toprakta. Yeri sofrada."
İKİNCİL_CÜMLE        = "Toprağın sunduğu lezzet, Afina'nın özeniyle."
HİKAYE_BAŞLIĞI       = "Nesillerin Emeği, Toprağın Bereketi"   (müşteri; yazısız görsel + açıklama bekleniyor)
RENK_ANA             = "#243A29"  zeytin yeşili
RENK_ZEMİN           = "#F5F1E7"  fildişi
RENK_VURGU           = "#D4B483"  şampanya altını
YARDIMCI_TONLAR      = ajan türetir (metin, çizgi, ikinci zemin, hata, başarı) — hepsi WCAG AA
FONT_BAŞLIK          = "Fraunces"   (kullanıcı seçimi; gerçek italik var)
FONT_GÖVDE           = "Figtree"    (kullanıcı seçimi)
TEMA                 = AÇIK ton (müşteri isteği). Koyu yüzey yalnız alt bilgi ve gerekli yerel bölümlerde.
SES                  = sıcak, yöresel, sade Türkçe; abartısız; pazarlama klişesi yok
İMZA_ÖĞE             = logodaki altın zeytin dalı + el (tek imza; abartmadan)
```

Ürünler (en fazla 6 varyant; fiyat/stok **temsili**, gerçek fiyat onayına kadar ürün/kategori sayfaları noindex):

| id | Aile | Boy | Görsel anahtarı | Grup |
|---|---|---|---|---|
| sample-green-olive-1kg | Doğal Kırma Yeşil Zeytin (kahraman ürün) | 1 kg kavanoz | urun-02-kirma-1kg | kirma-zeytin |
| sample-green-olive-10kg | Doğal Kırma Yeşil Zeytin | 3 L yuvarlak teneke | urun-01-kirma-10kg | kirma-zeytin |
| sample-black-olive-1kg | Salamura Siyah Zeytin | 1 kg (stok 0 → "Mevcut değil") | urun-03-siyah-1kg | siyah-zeytin |
| sample-olive-oil-1l | Natürel Sızma Zeytinyağı | 1 L cam şişe | urun-04-yag-1l | zeytinyagi |
| sample-olive-oil-5l | Natürel Sızma Zeytinyağı | 5 L teneke | urun-05-yag-5l | zeytinyagi |
| sample-brined-green-olive-5kg | Salamura Yeşil Zeytin | 3 L yuvarlak teneke | urun-06-salamura-y… | yesil-zeytin |

Kategoriler (`lib/catalog/groups.ts`): Zeytinyağı · Zeytin → Siyah Zeytin, Yeşil Zeytin, Kırma Zeytin.
Veri kaynakları: `lib/catalog/static-products.ts`, `lib/catalog/groups.ts`, `lib/blog/posts.ts` (4 yazı).

---

## 3 · Varlıklar (yalnız bunlar; yeni görsel/video üretimi YOK)

| Varlık | Yol / anahtar | Not |
|---|---|---|
| Hero video | `public/videos/customer-home/hero-{1920,1280,720}.mp4` + poster (`lib/media/customer-home.json` → `hero`) | Müşterinin videosu. Masaüstü 1920, telefon 720. `autoPlay muted loop playsInline`; azaltılmış harekette poster |
| Tesis | `customer-home.json` → `fabrika` | Müşteri; Hakkımızda ana görseli de bu |
| Her Tanede Aynı Özen | `customer-home.json` → `her-tanede-ayni-ozen-el` | Müşteri |
| Bereketin Hasat Vakti | `customer-home.json` → `bereketin-hasat-vakti` | Müşteri; bölümde sağda |
| Zeytinlik, zeytinyağı, siyah/yeşil/kırma zeytin, zeytin dalı, depo | `lib/media/classic-photos.json` | Onaylı |
| Ürün fotoğrafları (stüdyo 4:5 + sahne 16:9) | `public/images/v3/*` (`lib/media/v3-assets`) | Onaylı, temsili ambalaj |
| Logo | `public/brand/afina-zeytin-yatay@2x.webp` (açık zemin), `…-dark@2x.webp` | Değiştirme |
| Ödeme logoları | `public/images/payment/*` | PayTR/Visa/MC/troy |
| Eksik (müşteriden bekleniyor) | "Nesillerin Emeği" yazısız görseli + metni; zeytinyağı paylaşım görseli | Şimdilik `zeytinlik` / `zeytinyagi` yer tutucu; tek dosyada değiştirilebilir olsun |

Görsel kuralları: `V3Picture` (AVIF/WebP, `sizes` doğru), ilk ekran dışı `loading="lazy"`, oran kutusu sabit (CLS 0), alt metin anlamlı Türkçe; süs görseli `alt=""`. Plakalı tesis orijinali asla kullanılmaz.

---

## 4 · Değişmeyenler (ön yüz sınırı)

Dokunma: `lib/auth/*`, `lib/db/*`, `lib/cart/*` (mantık), `lib/checkout/*`, `lib/payments/*`, `lib/orders/*`, `app/api/*`, Better Auth + Neon şeması, `app/admin` yetki mantığı, `vercel-yayin.yml`, `next.config.ts` (zorunlu değilse), güvenlik başlıkları/CSP (`unsafe-inline` ekleme).
Bileşenler bu mantığı **çağırır**, yeniden yazmaz. Sayfa adresleri aynen kalır (`/`, `/urunler`, `/urunler/[kategori]`, `/urun/[slug]`, `/hakkimizda`, `/toptan-satis`, `/bayilik`, `/blog`, `/blog/[slug]`, `/sepet`, `/odeme`, `/giris`, `/kayit`, `/hesabim/*`, `/siparis-takip`, `/iade`, `/kvkk`, `/mesafeli-satis`, `/admin*`); `/?magaza=ac` → `/urunler` 308 korunur.

---

## 5 · Teknik yığın

Next.js 16 App Router + React 19 + TypeScript strict + Tailwind 4 (`@theme` tokenları) + CSS Modules (gerekirse) + `motion` 14 (`motion/react`, `LazyMotion` + `domAnimation`) + lucide-react (tek ikon ailesi) + shadcn/ui (yalnız form/diyalog/çekmece/tablo altyapısı, tokenlara uyarlanmış). **Yeni paket ekleme**; gerekirse gerekçesini Coder Notu'na yaz, ekleme.
Yeni bileşenler: `components/storefront/` (vitrin), `components/storefront/ui/` (ortak parçalar), `components/admin/` (panel). Eski ön yüz kodu Aşama 3'te silinir.

---

## 6 · Yasak liste

**AI slop (kit):** mor→mavi / neon degrade · emoji ikon · anlamsız glassmorphism/blur kart yığını · "hero başlık + alt başlık + iki buton" kalıbı · stok illüstrasyon/3D render · her bölümde aynı boşluk ve aynı boy kart · sürekli oynayan süs animasyonu · lorem ipsum, uydurma istatistik.
**Şablon izleri (frontend-design):** her başlığın üstünde büyük harfli küçük üst yazı (eyebrow) · "A · B · C" ortası noktalı meta dizileri · her bağlantının sonuna "→" · numaralı 01/02/03 işaretleri (içerik gerçek sıra değilse) · tek kelimeyi italik/renkli vurgulama alışkanlığı · tüm kartlarda aynı yuvarlaklık ve aynı gri gölge · krem zemin + terrakota vurgu klişesi.
**Proje özel:** Köklü Zeytincilik'in görünümü, ikonları, yerleşim kalıpları ve şu ifadeleri: "TOPRAKTAN SOFRAYA", "TARLADAN SOFRAYA", "Doğallığın", numaralı "Keşfedin", "Sizden Gelen", "Zeytin Rehberi", "Daha Fazlasını Keşfet", "En Beğenilen" · müşteri yorumu, rakamlı istatistik ("500.000+ ağaç" vb.), YouTube/kısa video bölümü, 2'li banner · sahte indirim ("İndirimdeki" yerine "Öne Çıkan") · yeni iddia (sertifika, ödül, ciro, sağlık; "%100 Doğal ve Katkısız" YALNIZ müşterinin istediği hasat maddesinde ve Hakkımızda şeridinde) · kaydırmaya bağlı hareket, sabitleme (pin), snap, Lenis/GSAP · otomatik kayan karusel · tam ekran açılış perdesi.
**Ret geçmişi (aynısına düşme):** v1 "etiket" (beğenilmedi) · v2 koyu "topraktan sofraya" ("berbat") · v8–v12 sinematik kaydırma (vazgeçildi) · v11 · 196 "kopya gibi olmasın". Ortak ret nedeni: şablon hissi, düşük özen, telefonda kusur.

---

## 7 · Tasarım sistemi (`docs/DESIGN.md`)

`~/Desktop/WB AI PROJELER ICIN/DESIGN.md` dosyasının **bölüm yapısında** yazılır (içerik/renk/koyu tema alınmaz): başlık + tek cümlelik sanat yönetimi cümlesi · Tokens — Colors (ad, değer, token, rol) · Typography (aile, ağırlıklar, boylar, satır yüksekliği, harf aralığı) · Type Scale tablosu · Spacing & Shapes (8 px taban: 8/16/24/32/48/64/96/128; köşe yuvarlaklıkları hiyerarşiye göre farklı) · Components (her bileşenin rolü ve ölçüleri) · Do's and Don'ts · Surfaces · Elevation · Imagery · Layout (masaüstü + telefon) · Agent Prompt Guide (sonraki aşamaların kullanacağı hazır tarifler) · Quick Start (CSS custom properties + Tailwind v4 `@theme`).
Karar yolu: `ui-ux-pro-max --design-system` ("premium regional olive food e-commerce light editorial", `--variance 6 --motion 3 --density 4`) → `frontend-design` planı (4–6 renk, yazı rolleri, ASCII yerleşim, ilkeler) → **öz inceleme**: "bu kısım her zeytin sitesinde olur mu?" → değiştir, nedenini yaz → `better-typography`, `better-colors`, `better-layout` ile ince ayar.
Ölçü tabanı: gövde ≥ 16 px (telefonda da), satır 1.5–1.6, satır uzunluğu ≤ 72 karakter; başlık ölçeği belirgin (h1 ≫ h2 > h3); dokunma hedefi ≥ 44×44; odak halkası görünür (altın, 2 px, ofsetli); karşıtlık AA.

---

## 8 · Hareket kuralları (Motion)

- Yalnız `transform` + `opacity` (width/height/top/left/filter animasyonu yok).
- Spring: `stiffness 120–300`, `damping 20–30`; lüks/sakin his için damping üst bant.
- Sayfa açılışında **tek** giriş sekansı (stagger 0.05–0.1 sn), sonra sükûnet.
- `whileInView` yalnız müşterinin istediği iki yerde ("Hikayemiz" ve "3'lü banner" — ufak animasyon), `viewport={{ once: true }}`; başka bölümde kaydırma tetiklemesi yok.
- Kullanıcı eylemine yanıt: hover/tap (`whileHover`, `whileTap`), menü/çekmece/pencere açılıp kapanma (`AnimatePresence`), sepete ekleme onayı.
- Kayan şerit (yalnız Hakkımızda): CSS transform, fareyle/odakla durur, azaltılmış harekette durağan.
- `useReducedMotion()` → tüm hareket kapalı, içerik doğrudan görünür. CLS < 0.05.
- Hazır değerler (ui-ux-pro-max.md): giriş `container {staggerChildren: 0.08, delayChildren: 0.2}` + `item {opacity 0→1, y 24→0, spring 120/20}` — kitteki `filter: blur(8px)` girişi **kullanılmaz** (telefonda pahalı, kuralı ihlal eder) · düğme/kart `whileHover {scale: 1.04}` (kartta en çok 1.02) `whileTap {scale: 0.96}`, spring 400/25 · `whileInView` `viewport={{ once: true, margin: "-80px" }}`, spring 100/22 · menü/çekmece/pencere/"sepete eklendi" bildirimi `AnimatePresence` (giriş y −8→0, çıkış girişten kısa) · sepet satırı silme ve kategori süzme `layout` prop ile.
- `useScroll`/`useTransform` parallax ve video scrub bu projede **yok** (müşteri: kaydırma animasyonu olmasın).

---

## 9 · Bileşen politikası

- Standart kalıplar (menü, mobil çekmece, ürün kartı, form alanı, akordeon, sekme, tablo, alt bilgi, admin kenar menüsü) için önce **21st MCP** `search` → `get_component`; renk/boşluk/font tokenlara uyarlanır, birebir yapıştırılmaz. 21st aracı oturumda yoksa Coder Notu'na yaz ve shadcn/el yazımıyla devam et.
- Markaya özgü bölümler (hero, Hikayemiz, 3'lü banner, Hasat) el yazımı + Motion.
- 21st erişimi: **Codex** MCP ile (`21st/search` → `21st/get_component`). **Kimi'de 21st MCP yok** → Claude görev dosyasına bileşen listesini yazar, Kimi `npx shadcn@latest add "https://21st.dev/r/<yazar>/<ad>?api_key=$API_KEY_21ST"` ile kurar (anahtar ortamdan gelir, dosyaya/kayda yazılmaz). Erişim yoksa (401/anahtar eski) Coder Notu'na yaz, uydurma bileşen yazma.
- Hangisi ne zaman: nav, kart, form, akordeon, tablo, alt bilgi, admin menüsü → 21st · hero, imza bölümler → el yazımı + Motion · hareket karakteri her zaman Motion ile eklenir (21st çıktısındaki hazır animasyonlar tokenlara ve §8'e uydurulur ya da çıkarılır).
- shadcn: resmî CLI (`npx shadcn@latest add …`), varsayılan halde bırakma. İki seçenekli ayar = yan yana anahtar (toggle-group), açılır liste değil.
- Şifre alanında göster/gizle düğmesi alanın içinde; form hataları alanın altında, Türkçe ve ne yapılacağını söyler.

---

## 10 · İçerik ve metin kuralları

- Müşteri metinleri (BRIEF) **birebir**: 4 kutu başlıkları + "Ürünleri İnceleyin" / "Hakkında Bilgi Alın"; "Bereketin Hasat Vakti" + "Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür."; "Elle Hasat", "Doğal Dinlendirme", "Özenli Paketleme", "%100 Doğal ve Katkısız"; "Hikayemizi Keşfet" → `/hakkimizda`; kayan şerit: Zeytin – Zeytinyağı – Geleneksel Salamura – %100 Doğal – Katkısız.
- Diğer metinler: sade Türkçe, kısa cümle, her bölüm **tek mesaj**; düğme ne olacağını söyler ("Sepete ekle", "Teklif iste"); aynı eylem akış boyunca aynı adla geçer. Boş/hata durumları yön gösterir.
- `PRODUCT.md` iddia kuralı geçerli (yukarıdaki müşteri istisnası dışında). Ambalaj temsili → tek yerde kısa "temsili görsel" notu.
- Blog yazıları AEO iskeleti: H1 soru, ilk 40–60 kelimede net cevap, H2'ler soru biçiminde, adım listesi/tablo, yazar (AFİNA ZEYTİN) + güncelleme tarihi, 3–5 SSS.

---

## 11 · Sayfa şartnamesi

### 11.1 Ana sayfa (`/`) — sıra BRIEF'teki gibi, değişmez
1. **Üst menü:** logo solda; Ürünler, Hakkımızda, Toptan Satış, Bayilik, Blog; sağda hesap + sepet (rozetli). Telefonda logo + sepet + menü düğmesi → alttan/yandan çekmece (Esc kapatır, odak kilitli). Yapışkan menü içeriği örtmez; çapa bağlantıları başlığın altında kalmaz (`scroll-margin-top`).
2. **Hero:** müşteri videosu (yukarıdaki kurallar). Üzerinde okunur başlık (ANA_SLOGAN ya da markaya özgü kısa cümle) + tek birincil eylem "Ürünleri İnceleyin" → `/urunler`. Metin okunurluğu için yerel koyuluk, tüm videoyu karartma.
3. **4 kutu:** Zeytinyağı (`/urunler/zeytinyagi`), Zeytin (`/urunler/zeytin`) — "Ürünleri İnceleyin"; Tesisimiz (`/hakkimizda`), Bayilik (`/bayilik`) — "Hakkında Bilgi Alın". Görselli; referanstaki yuvarlak dizilimi kullanma.
4. **Ürünler:** 4 ürün kartı (görsel, ad, boy, fiyat, stok durumu, "Sepete ekle", "Teklife ekle" → `/toptan-satis?teklif=<id>`) + "Tüm Ürünler" → `/urunler`. Telefonda yatay kaydırmalı raf ya da 2 sütun — karar DESIGN.md'de.
5. **Hikayemiz:** HİKAYE_BAŞLIĞI + açıklama + görsel (yer tutucu, ufak `whileInView` animasyonu) + "Hakkımızda" düğmesi + 3'lü ikon (Geleneksel Üretim · %100 Doğal · Kendi Tesisimizde — mevcut metinler).
6. **Öne Çıkan Ürünler:** ikinci ürün ızgarası (farklı sıra/yerleşim; indirim dili yok).
7. **3'lü banner:** Tesisimiz (`fabrika`) → `/hakkimizda`, Her Tanede Aynı Özen → `/urunler/zeytin`, Zeytinyağı → `/urunler/zeytinyagi`; ufak `whileInView` animasyonu; numara yok.
8. **Bereketin Hasat Vakti:** solda başlık + açıklama + 4 madde (ikonlu), sağda fotoğraf; "Hikayemizi Keşfet" → `/hakkimizda`.
9. **Toptan Satış + Bayilik Başvurusu:** düz zeminde iki kutu (arka plan görseli YOK), ikisi ayrı sayfaya gider.
10. **Blog:** 3–4 yazı kartı, hepsi çalışan `/blog/<slug>`; "Tüm yazılar" → `/blog`.
11. **Alt bilgi:** logo + slogan, bağlantı grupları, adres/telefon/e-posta, yasal bağlantılar, ödeme logoları; bağlantılar ≥ 44 px dokunma alanı.

### 11.2 Diğer sayfalar
- `/urunler`: tüm ürünler + kategori gezinmesi (Zeytinyağı, Zeytin, Siyah, Yeşil, Kırma); boş durum metni. `/urunler/[kategori]`: aynı dil; Zeytin üst kategorisi alt grupları gösterir.
- `/urun/[slug]`: büyük görsel (stüdyo + sahne), ad, boy seçimi (aile varyantları), fiyat, stok, adet, "Sepete ekle", "Teklife ekle", açıklama, saklama bilgisi, benzer ürünler ≤ 4, breadcrumb.
- `/hakkimizda`: fabrika görseli + klasik açıklama + kayan şerit + çatı marka bağlantısı.
- `/toptan-satis`: kısa giriş + teklif formu (mevcut gönderim mantığı; `?teklif=<id>` ön seçimi; il/ilçe araması korunur). `/bayilik`: mevcut içerik, yeni dil.
- `/blog`, `/blog/[slug]`: AEO iskeleti (bkz. 10).
- `/sepet` + sepet çekmecesi, `/odeme` (PayTR iFrame alanı / önizleme), `/giris`, `/kayit`, `/hesabim/*`, `/siparis-takip`: mevcut akış, yeni görünüm; formlar tek sütun, telefonda klavye açıkken düğme görünür.
- `/iade`, `/kvkk`, `/mesafeli-satis`: okunur uzun metin düzeni (≤ 72 karakter satır, içindekiler).
- 404: yön gösteren kısa metin + ana sayfa / ürünler bağlantısı.

### 11.3 Yönetim paneli (`/admin*`)
Referans: `Admin paneli .JPG` — açık zemin, solda gruplu ikonlu menü, üstte arama, sade özet kartları, düzgün tablo. AFİNA tokenlarıyla; çalışmayan sayfaya bağlantı yok; panel metinleri kısa; telefonda menü çekmece. Yetki/API mantığı değişmez.

---

## 12 · Aşamalar

| Aşama | Görev | Kim | Çıktı | Kapı |
|---|---|---|---|---|
| A1 Karar + A2 Temel | 198 | Codex **ve** Kimi (ayrı kopya) | `docs/DESIGN.md`, tokenlar, yeni menü + alt bilgi + ana sayfa + `/urun/[slug]`, `output/task198-<ajan>/{PLAN,DENETIM,KANIT}.md` + ekran görüntüleri | **K1** kullanıcı A/B seçer |
| A3 Tüm sayfalar | 199 | Seçilen ajan | 11.2'deki tüm sayfalar + eski ön yüz kodu/görsel/testlerin kanıtlı silinmesi | — |
| A4 Panel | 200 | Codex | 11.3 | — |
| A5 Bulunabilirlik | 201 | Codex | metadata (title/description/canonical/OG), JSON-LD (Organization + WebSite ana sayfa; BreadcrumbList; BlogPosting; Product/Offer yalnız fiyat onayından sonra; FAQPage toptan/bayilik SSS varsa), sitemap/robots (noindex kuralları korunur), `llms.txt` güncel, blog AEO kontrol listesi | — |
| A6 Denetim | 201 | Codex | `impeccable` critique → düzelt → polish (yoksa `audit-ai-design-slop` + `avoid-ai-ui-cliches`), axe 0 ihlal, `security-audit` (quick) bulgusu 0 confirmed, ölü kod 0 | **K2** Claude kabul |
| A7 Cihaz QA | 202 | Kimi | Tüm sayfa × 15 cihaz × Chromium+WebKit, akışlar, gözle inceleme → `RAPOR.md` (197 düzeni) → Codex düzeltme döngüsü | **K3** kritik/yüksek 0 |
| A8 Sunum + yayın | 203 | Codex (önizleme PDF + ana sayfa gezinti videosu 1440 + 390); Claude (push → CI → deploy.py → canlı kontrol) | `AFINA-KAYNAK/tasarim/uygulama-kontrol/AFINA-onyuz-v2-onizleme.pdf` + `.mp4` | **K4** kullanıcı yayın onayı |
| A9 Büyüt (ayrı onay) | sonra | Codex | `claude-seo` / `geo` denetimi, Search Console, tanıtım videosu (hyperframes / video-shotcraft), pazarlama skill'leri | — |

### 12.1 · ui-ux-pro-max akışı (A1'de zorunlu, A3/A4'te sayfa bazında)
Script: **`~/.codex/skills/ui-ux-pro-max/scripts/search.py`** (genel ve güncel kopya; projedeki `.codex/skills/ui-ux-pro-max` eskidir, `--variance/--motion/--density` tanımaz — kullanma). Ham çıktılar `output/task<NNN>-<ajan>/sources/` altına.
1. **Gereksinim:** ürün türü (premium yöresel gıda e-ticaret + B2B teklif), kitle (telefondan gelen perakende + kurumsal alıcı), ton (açık, sıcak, editoryal), yığın (Next.js + shadcn, `package.json`'dan doğrula).
2. **Tasarım sistemi:** `--design-system "premium regional olive food e-commerce light editorial" --variance 6 --motion 3 --density 4 --persist -p "AFINA ZEYTIN" --output-dir output/task<NNN>-<ajan>/sources`; sayfa katmanları `--page home`, `--page product`, `--page checkout`. Sonuç ham girdidir; **tek doğru kaynak `docs/DESIGN.md`**. Müşteriyle/MASTER-PROMPT ile çelişen öneriler (koyu tema, yatay kaydırma yolculuğu, cam efekti, başka font) gerekçesiyle reddedilip PLAN.md'ye yazılır.
3. **Alan aramaları** (her biri tek niyet, 2–5 kelime; boş/konu dışı çıkarsa bir kez daralt, yine yoksa "eşleşme yok, genel kural" de): `"product card mobile commerce" --domain ux` · `"add to cart feedback" --domain ux` · `"mobile drawer navigation focus" --domain ux` · `"form error inline validation" --domain ux` · `"serif editorial food brand" --domain typography` · `"olive green ivory gold" --domain color` · `"ecommerce landing hero video" --domain landing` · `"decorative icon aria hidden" --domain icons`.
4. **Yığın rehberi:** `--stack nextjs` ("image font loading bundle"), `--stack shadcn` ("drawer dialog form"), `--domain react` ("rerender memo list").
5. **Teslim öncesi:** skill'in `references/quick-reference.md` öncelik sırası (1 Erişilebilirlik → 2 Dokunma → 3 Performans → 4 Stil → 5 Yerleşim → 6 Yazı/Renk → 7 Animasyon → 8 Formlar → 9 Gezinme) madde madde KANIT.md'de "geçti/neden geçmedi".
6. **Hızlı kontrol (ui-ux-pro-max.md §06):** motion `motion/react`'ten · 21st bağlı ve anahtar güncel · tüm animasyonlar transform+opacity · azaltılmış hareket yazıldı · giriş sekansı tek, sonra sükûnet · 21st bileşenleri tokenlara uyarlandı.

### 12.2 · A0 araç doğrulama (her ajan, işe başlamadan; sonucu PLAN.md'nin başına)
`motion` sürümü (`package.json`) · 21st erişimi (Codex: `codex mcp list` → `21st enabled`; Kimi: `$API_KEY_21ST` dolu mu, değeri yazdırma) · `search.py --help` içinde `--variance` var mı · Playwright tarayıcıları (chromium, webkit) · yerel test DB'si/ortam (Claude verir).

Her aşamada fiilen yüklenecek skill'ler: `ui-ux-pro-max`, `frontend-design`, `better-layout`, `better-typography`, `better-colors`, `motion-framer`, `shadcn-ui`, `responsiveness-check`, `impeccable`/`audit-ai-design-slop`, `web-design-guidelines`; A5'te `seo`/`ai-seo`/`aeo-geo-rehberi`; A6'da `security-audit`. Codex alt ajanları (multi_agent) serbest.

---

## 13 · Test matrisi (A2, A3, A7)

Cihazlar: 320×568 · 360×800 · 375×667 · 390×844 (WebKit) · 414×896 · 430×932 (WebKit) · 768×1024 · 820×1180 (WebKit) · 1024×768 · 1024×1366 · 1280×800 · 1366×768 · 1440×900 · 1920×1080 · 2560×1440; telefon/tablette `hasTouch` + `isMobile`.
Her sayfa × cihaz: yatay taşma 0 · konsol hatası 0 · 4xx/5xx kaynak 0 · kırık görsel 0 · kesilen/üst üste binen yazı 0 — **otomatik çakışma testiyle** (kart/satır/kutu içinde metin kutusu ile görsel kutusu kesişmez; bilerek üstte duran başlıklar `data-overlay-ok`) + gözle; "yatay taşma 0" çakışma yok demek DEĞİLDİR (198'de telefonda öne çıkan ürünlerde yazı görselin üstüne bindi, taşma ölçümü yakalamadı) · dokunma hedefi ≥ 44 · yazı ≥ 12 px (gövde ≥ 16) · axe karşıtlık 0 · klavyeyle gezinme + görünür odak · CLS < 0.05.
Hız (gerçek Chromium + CDP kısıtlama; Lighthouse simülasyonuna güvenme): telefon (4G ~1,6 Mbps, 150 ms, CPU ×4) LCP ≤ 2,5 sn; masaüstü LCP ≤ 1,5 sn; ilk JS ≤ mevcut değer (masaüstü 412 KB / telefon 244 KB) ya da altı.
Ek: azaltılmış hareket · video 1920/720 doğru boy · 390 yavaş ağda video posterle başlar · sepete ekle → sepet → ödeme · teklife ekle → form ön seçimi · menü çekmecesi Esc/odak · formlar yerel test DB'si ile (canlıya gönderim YOK).
Tarayıcılar repo içindeki Playwright (`node_modules/playwright`, chromium + webkit). Firefox kurulamıyorsa yaz.

---

## 14 · Bitiş şartı (her aşama, kanıtsız "bitti" yok)

`output/task<NNN>-<ajan>/KANIT.md` içinde:
- Marka rengi + font çifti + 8 px sisteminin **nerede** kullanıldığı (ekran görüntüsü yolu ile).
- Her hareket kararı: neye, neden, hangi spring değeri; azaltılmış hareket davranışı.
- 21st'ten alınan bileşenler ve nasıl uyarlandığı.
- Yasak liste taraması (§6) — madde madde "yok ✓" + metin taraması komutu çıktısı.
- BRIEF sıra/metin kontrolü (birim testi adı).
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `git diff --check` çıktıları; test matrisi özeti.
- Görev dosyasına `## Coder Notu (<ajan>)` + `## Durum: TAMAMLANDI (<ajan>)`; **tek kayıt** (commit).
- §14.1 kalite listesi: her madde PASS/FAIL + kanıt (komut çıktısı ya da ekran görüntüsü yolu).

### 14.1 · Son kalite listesi (taste-skill uyarlaması, 10 Kas — her ön yüz aşaması)
Marka seçimleri (§2 renkleri, Fraunces + Figtree) kullanıcı kararıdır; taste-skill'in "Fraunces / bej-altın palet yasağı" bu projede **uygulanmaz**. Kaydırmaya bağlı hareket yasağı (§6, §8) aynen geçerli.
1. **Uzun tire yok:** ziyaretçinin gördüğü hiçbir metinde (başlık, düğme, alt metin, `alt`, SEO title/description) `—` ya da ayraç olarak `–` yok; tarih/aralıkta `-`. Kanıt: `rg -n "—|–" app components lib/content` görünen metinde 0.
2. **Üst etiket sınırı:** büyük harfli, harf aralığı açık küçük üst etiket (eyebrow) en çok her 3 bölümde 1; hero dahil sayılır.
3. **Bir amaç = bir düğme metni:** aynı işi yapan düğmeler sayfa boyunca aynı adı taşır (ör. teklif için yalnız "Teklif İste"); iki farklı ad yok.
4. **Düğme tek satır:** masaüstünde hiçbir düğme yazısı iki satıra kırılmaz; telefonda da 320 px'te kırılmaz ya da düğme tam genişliğe geçer.
5. **Metin denetimi:** tüm görünen metinler baştan okunur; yapay/şişkin dil yok ("eşsiz deneyim", "lezzet yolculuğu", "keşfetmeye hazır mısınız", "benzersiz", "en kaliteli"). Anlamı belirsiz cümle düz bir cümleyle değiştirilir. Liste `DENETIM.md`'ye.
6. **Yerleşim tekrarı:** aynı yerleşim ailesi (ör. görsel solda + metin sağda) art arda en çok 2 bölüm; ana sayfada en az 4 farklı yerleşim ailesi.
7. **Görsel üstüne etiket yok:** fotoğrafın üstüne rozet/etiket/numara yazısı konmaz (bilerek üstte duran `data-overlay-ok` başlıkları hariç).
8. **Süs işaretleri yok:** bölüm numarası ("01 /"), "Kaydır" işareti, her satırın önünde renkli nokta, `·` ile dizilmiş meta satırı yok.
9. **Kayan şerit tek:** sayfada en çok bir kayan yazı şeridi (Hakkımızda şeridi).
10. **Tek köşe kuralı:** düğme, kart, alan ve görsel köşe yuvarlaklıkları `docs/DESIGN.md`'de tek tabloda yazılı ve her yerde aynı.
11. **Kontrast:** her düğme, form alanı, yer tutucu, yardımcı ve hata metni WCAG AA (4,5:1; büyük metin 3:1); fotoğraf üstündeki yazıda koyulaştırma katmanı.
12. **Hareketin nedeni:** her animasyon tek cümleyle gerekçelendirilir (dikkat, geri bildirim, durum değişimi); gerekçesi olmayan kaldırılır.

---

## 15 · Değişmez güvenlik/iş kuralları

Push, yayın, Vercel, canlı DB, ortam değişkeni, `.env*` okuma/yazma YOK · `node_modules` ve `.next` SİLME · `AFINA-KAYNAK/` ve `output/` git'e eklenmez (`git add -f` yasak) · sır/anahtar yazdırma yok · görev dışına çıkma, kendiliğinden "iyileştirme" yok · eksik bilgi varsa uydurma, Coder Notu'nda "bekleniyor" diye yaz.

---

## 16 · Ajan komutları (Claude çalıştırır)

```bash
# Codex (ana kopya)
codex exec --skip-git-repo-check --approve-for-me -m gpt-6-astra \
  -c sandbox_workspace_write.network_access=true -c model_reasoning_effort="high" \
  "docs/MASTER-PROMPT.md ve docs/tasks/<NNN>-*.md dosyalarını AGENTS.md kurallarına göre uygula. Ajan adın: codex." \
  < /dev/null > AFINA-KAYNAK/araclar/log/task<NNN>-codex.log 2>&1

# Kimi (ayrı kopya: git worktree add --detach AFINA-KAYNAK/wt/<NNN>-kimi <taban>; node_modules bağlantısı)
/Users/emre/.kimi-code/bin/kimi -m kimi-code/k3.1-pro --add-dir <kopya> \
  -p "docs/MASTER-PROMPT.md ve docs/tasks/<NNN>-*.md dosyalarını uygula. Ajan adın: kimi." \
  < /dev/null > AFINA-KAYNAK/araclar/log/task<NNN>-kimi.log 2>&1
```
Kimi kopyasına özel ayar değişikliği (ör. `next.config.ts` turbopack kökü) kayda girmez.

---

## 17 · Açık kararlar (kullanıcıdan; uydurma)

Gerçek fiyat/stok ve vitrinin DB'den okuması (DB'ye dokunduğu için ayrı onaylı görev) · "Nesillerin Emeği" yazısız görseli + metni · zeytinyağı paylaşım görseli · WhatsApp/müşteri hattı · SMTP (e-posta doğrulaması) · PayTR mağaza anahtarları · kargo firması/ücreti · ilk yönetici hesabı.
