# AFİNA v8 — uygulama öncesi skor

Önkoşul: BRIEF önce yazıldı. Durum **PLANLANDI; uygulama/kabul/yayın bekleniyor**. Taste page-is-the-object, tohum 1601101; Next.js + motion/react ve mevcut ticaret/kimlik mimarisi.

## Tek gramer ve yasaklar

**Object journey:** sayfanın birimi seçilebilir ambalaj ve ilişkili yer/üretici/kanal ihtiyacıdır; nesne → kanıt → ürün → kurumsal dal → çözüm. Hazır gramerlerin rastgele karışımı değil, bu sürekliliğe bağlı özel yapı.
Tek desktop açılışından başka pin yok; worldflight/spacer zinciri, v7 tek film + overlay, v6 organik pencere + küçük kart, tekrar eyebrow/indeks, katalog omurgası ve tam kare scrim yok. Opak özgün nav/gerçek yollar korunur.

| Hazır gramer | Neden seçilmedi |
|---|---|
| Filmic one-shot | Gerçek seçim ve mağaza/kurumsal anchor'ları çoklu giriş ister; tek doğrusal film değil. |
| Chaptered editorial | Uzun yazı/folio/titlepage önceliği yerine gerçek ambalaj ve çalışan eylem önce gelir. |
| Live surface | AFİNA yazılım değil; sahte app/demo için marka/tesis kanıtı silinemez. |
| Continuous world | Onaylı uyumlu zincir yok; üç taslak üretilmiş sayılmaz, mağaza akışı tek canvas'a çevrilmez. |
| Typographic poster | Gerçek ambalaj, tesis ve istenen Flow ana kanıtlardır; salt tipografi bunları silemez. |
| Gallery/catalog | Yaklaşık 65/35 üretici/alışveriş yönü yalnız nesne indeksine indirgenmez; resmî slogan kalır. |
| Split stage | İki taraf/kazanan karşılaştırması yok; sürekli divider reddedilen split'e yaklaşır. |
| Rhythmic cutlist | Sakin üretici güveni 12–20 hızlı kesit istemiyor; kısa açılış tutuşu anlamlıdır. |

## Açılış düzlemleri ve hareket

| Düzlem | Başlangıç → çözüm | Sınır |
|---|---|---|
| Uzak film | Uniform scale 1 → .82, x 0 → -8vw, y 0 → -48px | Yalnız medya düzlemi; kontrol/metin hareket etmez. |
| Orta mekân | Filmdeki ağaç/dal geri çekilerek nesneye yer açar | Tek filmi üç bağımsız katman gibi raporlama. |
| Odak ambalaj | Gerçek alfa 10kg teneke, y 80 → -8px, scale 1 → 1.12 | Oran/etiket korunur; seçim kendi onaylı ambalajını getirir. |
| Ön/temas | Katı kâğıt seçim zemini, açık taban teması/örtüşme | CTA/etiket kapanmaz; nesne havada asılı görünmez. |
| Atmosfer/type | Doğal film ışığı + statik temas; kâğıtta gerçek HTML H1/destek/CTA | Tam kare scrim/blur yok; copy-plane kendi zeminiyle y0→-24px, metin zemine göre sabit; SSR görünür. |

Desktop yaklaşık 170svh/kısa sticky: başlangıçta sakin yer kurma, ortada bağımsız nesne zirvesi, çıkışta okunur nesne/eylem. Telefon/reduced pin yok; H1 + ana CTA üstte, uygulamada 280px film/260px ürün sahnesi, ayrıntı altta; min 720/740px yok. Tek zirve; boş bekleme mesafesi yok.
Mevcut CinematicFilm sessiz tek oynatım/son kare/pause/play/replay; scroll seek/loop eklenmez. mediaStyle yalnız medya düzlemini etkiler, sabit 44px+ kontrolü değil. Reduced/saveData poster/isteksiz kaynak, görünüm/sekme dışı durma ve kullanıcı pause korunur.

## Beş vuruş — his eğrisinden sonra cihaz skoru

| Vuruş | Baskın aile | Gerekli sonuç |
|---|---|---|
| Yer → nesne | Parallax + tek kısa pin | Üç temsilcinin aynı görsel/ad/fiyat/stok/detail/cart hedefi birlikte değişir. |
| Kompakt tesis kanıtı | Reveal/normal flow | Gerçek PDF fotoğrafı, kısa yer bilgisi; bir kez transform/opacity, SSR görünür. |
| Altı SKU | Native pan/gallery | Mevcut sıra/veri korunur; çeşitlenmiş görsel öncelik; touch/klavye/reduced erişir. |
| Kurumsal ihtiyaç | Çalışan expandable branch | Kapalı servis mesajı açılmadan görünür; native details içinde mevcut form. |
| Gerçek adres/mağazaya dönüş/SSS | Typographic close/durağan flow | Son metin/CTA kaybolmaz; destek/legal/footer erişilir. |

En az 4 uygun aile, art arda aynı baskın aile yok; scrub 0, pin 1. Hover/tap ayrı signature sayılmaz. Sadece motion/react transform/opacity; yabancı engine/GSAP/yeni rAF/bağımlılık/body kilidi yok. Kısa üretim köprüsü ikinci büyük numaralı adım sahnesine dönüşmez.
Seçim id'leri BRIEF'tedir; mevcut ürün/CatalogProvider verisi çözülür, yeni fiyat/stok tablosu yok. Semantik selection/klavye/durum; odak sıçramaz. İncele mevcut ProductDetailProvider, ekle mevcut AddToCart/hydration/stok kapısı. Eksik/kayıp üründe uygun dürüst fallback/boş durum. Galeri yeniden sıralanmaz. B2B açmak provider etkinleştirmez veya sahte talep göndermez.

## Fingerprint ve sıra

V6 ve v7'nin her birine karşı **4/6** planlı fark: grammar, hero device, act-sequence, signature. Aynı nav ve benzer gerçek adres/legal kapanışı puan sayılmaz. Yeni ad tek başına kanıt değildir; final pikseller ve işlevle doğrulanır. Baseline docs/scrollcraft/FINGERPRINTS.md; v8 satırı ancak başarılı yayından sonra.
Önce BRIEF/PLAN/COPY/VERIFICATION → anlamlı davranış RED (aynı ürün hedefi/stok/B2B aç-kapa/film kontrolü ayrımı) → mevcut varlıklarla runtime → scoped + full unit/lint/type/build/medya kapısı → final source headless ve gerçek piksel/feel → normal yetkili push/CI/Vercel API → production read-only tekrar.
Doctor --probe olmadan explicit workspace/paketli binary ile geçti; cache preflight kanıtı VERIFICATION'dadır. Foreign engine importu, KIE/API probe, serve --lan, global kurulum yok. Testler yalnız paketli headless Chromium ≤2 worker; browser/sunucu düzgün kapanır. Gerçek müşteri/ödeme/form mutasyonu yok.
