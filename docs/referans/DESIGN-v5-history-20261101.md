# ZEYTİN v5: Toprağın özeni, üretimin güvencesi

1 Kasım 2026 müşteri PDF’si ve kullanıcı yeniden tasarım isteği güncel sözleşmedir. Eski v4 aşağıda tarihçe olarak korunur.

- Renkler: koyu zeytin `#172B21`, şampanya `#B6A078`, kırık beyaz `#F4F0E7`, antrasit `#252725`. V5 değişkenleri `RenewalLanding.module.css` kökünde; alışveriş/auth alt sayfalarının mevcut tokenları korunur.
- Font: yerel Fraunces başlıklar ve Figtree arayüz.
- Açılış: onaylı zeytinlik + mevcut canvas scrub, gerçek HTML slogan ve ürün/kurumsal CTA. Doğal sayfa kaydırması; reduced motion/veri tasarrufunda poster. Yeni Flow filmi onaylanınca aynı hat kullanılır.
- Akış: zeytinlik → marka → müşteri tesis fotoğrafı → koleksiyon → üretim yolculuğu → kurumsal teklif → SSS/iletişim.
- İmza: açık zeminli kurumsal anlatımın koyu yeşil ürün ve işletme bölümleriyle ritmi. Tesis görseli olduğu oranda ve gerçek tabelasıyla kullanılır.
- 21st kaynakları: Scroll-Triggered Video Hero 9701, About Bento 25310, Contact Form 35258. Yerel Next.js/motion/primitive yapısına uyarlandı; kaynakların demo verileri, döngü videoları ve sahte istatistikleri alınmadı.
- Afina Select/Professional sunum grupları SKU veya yeni ambalaj üretmez. Altı mevcut SKU üst sınırı, gerçek sepete ekleme, ürün detayı, stok kontrolleri korunur.

---

# ZEYTİN — Tasarım v4: "Sinematik sofra" (DESIGN.md)

## Karar geçmişi (21 Eki 2026)
- v1 etiket, v2 toprak, v3 kiler reddedildi (arşiv: `DESIGN-v1-etiket.md`, `DESIGN-v2-toprak.md`, `DESIGN-v3-kiler.md`).
- v4 adayları A Teneke / B Afiş / C Belgesel reddedildi (`DESIGN-v4-adaylar.md`).
- **D "Sinematik sofra" kullanıcı onayı aldı ("d ok").** Ölçülecek sözleşme: `~/PROJELER/AFINA-KAYNAK/araclar/log/fable/mock/d.html` (tam sayfa, hareketli HTML prova) + kareler `mock-d-masa-00..06.png`, `mock-d-tel-00..07.png`.
- Ürün gerçekleri ve iddia kuralı: `PRODUCT.md`.

## Fikir
Kullanıcının verdiği kitlerin (sinematik site, scroll'a bağlı sahne, AI-slop→profesyonel) doğrudan uygulaması. Tam ekran yavaş yakınlaşan sofra hero'su, üstünde çalışan satın alma kartı; koyu zeytin yeşili zeminde ürün kartları; kaydırdıkça değişen sabit fotoğraf çerçevesiyle üç adımlı tesis öyküsü; paralakslı kahraman ürün bandı.

## Renk
| Rol | Değer |
|---|---|
| ink (zemin) | `#0E1510` |
| zeytin (bölüm) | `#1F3324` |
| altın (birincil eylem, fiyat) | `#D4B483` / açık `#E6CB97` |
| süt (kart, metin) | `#F7F3EA` |
| gri (ikincil metin) | `#B9C0B6` |
Krem/fildişi **zemin olarak yok**; yalnız kart ve metin. Gradyan yalnız fotoğraf scrim'i ve kart arkası radyal parıltı.

## Tipografi
Fraunces 400/500/600 (başlık, ürün adı; hero'da italik vurgu) + Figtree 400–800 (arayüz, fiyat tabular). Hero `clamp(52px,6.4vw,96px)`, bölüm `clamp(40px,5vw,68px)`, ürün adı 24px, gövde 17–19px.

## Sayfa akışı (prova ile birebir)
1. **Hero (100svh):** `hero-masaustu.webp` / telefonda `hero-mobil.webp`, Ken Burns 18 s. Sol: kicker "Ellek, Düziçi · Osmaniye", "Düziçi'nden *sofranıza.*", açıklama, iki hayalet düğme. Sağ alt: **satın alma kartı** (süt zemin): küçük teneke PNG, ad, boy anahtarı 1 kg | 10 kg, fiyat, "Sepete ekle" (gerçek sepet). Telefon: başlık üstte, kart altta; açıklama gizli.
2. **Güven şeridi:** Kendi tesisimizde dolum · Kargo 2–4 iş günü · PayTR · Toptan teklif.
3. **Ürünler (6, 3×2, telefonda 2 kolon):** koyu kart, şeffaf PNG, ad, boy çipi, altın fiyat, altın "Sepete ekle". Hover: kalkış + parıltı. İlk kartta "En çok alınan" etiketi.
4. **Tesis öyküsü (sticky çerçeve + 3 adım):** sol sabit 4:5 çerçevede fotoğraf çapraz geçişle değişir (sahne-kırma → tesis → sahne-yağ), sağda 01 Kökü toprakta / 02 Kendi tesisimizde / 03 Yeri sofrada. Telefonda çerçeve üstte sticky, adımlar altında.
5. **Kahraman band:** 16:9 sahne görseli paralaks, sol kutu: Doğal Kırma 10 kg · ₺2.200 · Sepete ekle.
6. **Toptan + SSS + Footer:** teklif düğmesi; yalnız teyitli 3 soru; satıcı bilgisi, tek önizleme notu.
- **Telefon sabit alt çubuk:** hero geçildikten sonra fiyat + "Sepete ekle" (güvenli alan).

## Hareket
- İmza: **sticky fotoğraf çerçevesi** (scroll'a bağlı sahne değişimi) + hero Ken Burns.
- Reveal: `whileInView`, y 26px, stagger 80 ms. Kahraman band paralaks (translateY, max 60 px). Nav 40 px sonra blur+koyu.
- Yalnız transform/opacity/filter. `prefers-reduced-motion`: Ken Burns ve reveal yok.

## Görseller (hepsi onaylı, elde)
`zeytin-v3-gorseller/hero-masaustu.webp`, `hero-mobil.webp`, `urun-01…06-*.png`; `urun-gorselleri/onayli/01/03/04-*-sahne.webp`; tesis `public/images/tesis/tesis-osmaniye-*.webp` (plaka bulanık). Yeni görsel gerekmez.

## Performans ve kabul
Lighthouse mobil ≥ 85, LCP < 2,5 s (hero AVIF/WebP srcset, masaüstü ≤ 180 KB, mobil ≤ 120 KB, `fetchpriority=high`), CLS < 0,1, A11y ≥ 95. iPhone 14/SE (WebKit) + Pixel 7; dokunma ≥ 44 px. Her görevde masaüstü + iPhone kaydırma şeridi; prova kareleriyle karşılaştırılır.

## Ev kuralları
İddia kuralı (%100/organik/sertifika/sağlık yok). ≤ 2 font. Emoji, ikon kutusu, 01/02 numarası yalnız öykü adımlarında (prova ile aynı). Dağınık "temsili" yazısı yok; tek önizleme notu footer'da.

## Uygulama
Codex görevleri: (1) hero + satın alma kartı, (2) ürün ızgarası + sepet bağlantısı, (3) sticky öykü + kahraman band, (4) toptan/SSS/footer + mobil çubuk, (5) performans/kaydırma kapısı. Prova HTML'i referanstır; birebir ölçülür.

## 1 Kasım ek kit uyarlamaları (güncel v5)

Müşterinin dört ek PDF'si `docs/referans/kit-uyarlamalari-20261101.md` karar tablosuyla uyarlandı. Fraunces/Figtree ve #172B21/#F4F0E7/#B6A078 korunur; ana bölüm boşlukları 16/24/32/48/64/80 ölçeğindedir. Eski v4 tarifleri tarihsel kalır. Native-scroll canvas ve reduced-motion posteri geçerlidir; yeni Flow klibi 20 kredilik inceleme adayıdır. Paylaşılan SSS beş kaynaklı cevaptır.
