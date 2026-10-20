# Task 097 — üç eleştiri turu

20 Ekim 2026. Kaynak: `~/.claude/skills/design-taste-frontend/references/critique.md`.
Production: `next build` + `next start -p 3104`. Ekran görüntüleri açılarak incelendi;
puanlar ölçüm aracının verdiği puanlar değil, görsel değerlendirmedir.

Marka sabit: zeytin yeşili / fildişi / altın, Fraunces 600 SOFT 50 ve Figtree,
8/16/24/32/48/64/96 boşlukları. Bu sayfada Afina'nın kendi teneke etiketi,
ürün seçilen karta, ürün fişlerine ve sepet koçanına dönüşür.

## ROUND 1

Seen in one second: Fotoğraf önündeki Afina ürün etiketi.

Idea (one sentence): Teneke etiketi alışveriş yapılan sayfa nesnesidir.

Live thing: Ürün/boy seçimi etiketi yeniden basar; seçilen SKU mevcut sepete eklenir.

Layout words by section: hero=pinned / vitrin=full-bleed slips / tesis=mosaic /
süreç=drag row / SSS=reading columns / toptan=visit card + form / footer=label back.

Scores:

| Genişlik | Design | Usability | Creativity | Content | Overall |
|---|---:|---:|---:|---:|---:|
| 1440 | 6.0 | 6.5 | 7.5 | 6.5 | 6.5 |
| 768 | 6.5 | 7.0 | 7.5 | 6.5 | 6.9 |
| 390 | 6.5 | 7.0 | 7.5 | 6.5 | 6.9 |

Caps applied: İki boş masaüstü ekranı design ≤6.5; sahne anlatımında tekrar fotoğrafı.
Başlangıç inspect: 0 FAIL, 5 WARN, her genişlikte 23 hareket. Bu sonuç görsel kabul sayılmadı.

Top three problems (most visible first), each with the screenshot it shows in and the fix:

1. [1440 ilk şerit](../test-results/097/before/desktop-page-01.jpg): kart koçana
   dönüştükten sonra iki fotoğraf ekranı sürüyor. `scrollLength` 300 → 150;
   ürün başlangıcı dönüşüm sonundan en fazla bir ekran uzakta.
2. [1440 ikinci şerit](../test-results/097/before/desktop-page-02.jpg): süreçte altı
   kez aynı zeytinlik fotoğrafı, toptanda sağa yığılmış küçük kart/form.
   Süreç görselleri kaldırıldı; büyük Fraunces adlar ve resmi hikâyeden kısa
   ifadeler kullanıldı. Toptanda adres kartı sola, büyük başlık ve ürün kapsamı
   ortaya, form sağa alındı; mobil sırası başlık → adres kartı → form.
3. [390 ilk şerit](../test-results/097/before/mobile-page-01.jpg): 13px detaylar ve
   farklı ara yazı boyutları. Beş ortak yazı basamağı; en küçük boy 14px.
   Koçan 120px, metni 14px; KVKK linkinin hedefi en az 44×44px.

## ROUND 2

Seen in one second: Ürün seçilebilen etiket; vitrin daha erken başlıyor.

Idea (one sentence): Aynı etiket dili hero, fişler ve footer boyunca korunuyor.

Live thing: Etiket seçimleri ile sepet sayısı/toplamı aynı sepet durumundan geliyor.

Layout words by section: hero=short pin / vitrin=standing slips / tesis=type mosaic /
süreç=typographic drag row / SSS=reading columns / toptan=three-part field / footer=label back.

Scores:

| Genişlik | Design | Usability | Creativity | Content | Ham ağırlıklı | Overall |
|---|---:|---:|---:|---:|---:|---:|
| 1440 | 6.5 | 7.5 | 7.5 | 7.0 | 7.1 | 6.0 |
| 768 | 6.5 | 7.5 | 7.5 | 7.0 | 7.1 | 6.0 |
| 390 | 6.5 | 7.5 | 7.5 | 7.0 | 7.1 | 6.0 |

Caps applied: Inspect FAIL bulunduğu için overall ≤6.0; dört gerçek fotoğraf
eşiği karşılanmadığı için design ≤6.5.

Top three problems (most visible first), each with the screenshot it shows in and the fix:

1. [1440 şerit](../test-results/097/round-2/desktop-page-01.jpg): tekrar fotoğrafları
   kaldırılınca `few-pictures` FAIL oluştu. Aynı kareleri geri eklemek doğru
   düzeltme değildir. Tesis dosyaları manifestte `candidate`, `runtime:false`;
   farklı, onaylı fotoğraflar olmadan bu kapı açık kaldı.
2. [390 şerit](../test-results/097/round-2/mobile-page-01.jpg): toptan CTA'nın
   altında ikinci “Toptansatış” başlığı `eyebrow` FAIL üretiyor. Başlık tek h2
   olarak kapsam alanına taşındı; DOM sırası mobil okuma sırasıyla eşleşti.
3. [768 şerit](../test-results/097/round-2/tablet-page-01.jpg): küçük detaylar ve
   yükleme bütçesi son kontrol gerektiriyor. Footer hedefi 44px'e çıkarıldı;
   kullanılmayan display yüzlerinin preload'u kapatıldı, aynı onaylı poster
   Next image servisi üzerinden responsive teslim edildi. Kaynak dosyalar değişmedi.

## ROUND 3

Seen in one second: Afina'nın yeşil bantlı ürün etiketi.

Idea (one sentence): Alışveriş etiketi, kısa pin hareketinden sonra okunur fişlere yer açıyor.

Live thing: Ürün/boy seçimi ve gerçek yerel sepet; sayfa yenilenince adetler korunuyor.

Layout words by section: hero=short pin / vitrin=standing slips / tesis=type mosaic /
süreç=typographic drag row / SSS=reading columns / toptan=type + visit card + form /
footer=label back.

Scores:

| Genişlik | Design | Usability | Creativity | Content | Ham ağırlıklı | Overall |
|---|---:|---:|---:|---:|---:|---:|
| 1440 | 6.5 | 8.0 | 7.5 | 7.0 | 7.2 | 6.0 |
| 768 | 6.5 | 8.0 | 7.5 | 7.0 | 7.2 | 6.0 |
| 390 | 6.5 | 8.0 | 7.5 | 7.0 | 7.2 | 6.0 |

Caps applied: Tek kalan `few-pictures` FAIL nedeniyle overall ≤6.0 ve design ≤6.5.
Üçüncü turun puanı 7.5 altında; görev görsel olarak tamamlandı sayılmadı.

Top three problems (most visible first), each with the screenshot it shows in and the fix:

1. [1440 son şerit](../test-results/097/after/desktop-page-01.jpg): gerçek fotoğraf
   sayısı 2; eşik 4. Ek onaylı varlık yok. Kapı istisnayla veya tekrar görselle aşılmadı.
2. [1440 toptan/footer](../test-results/097/after/desktop-page-02.jpg): uzun formun
   yanında tipografik alan fotoğraf kadar dolu değil. Onaylı tesis fotoğrafı
   bu bölümün asıl eksik malzemesi; yeni görsel kullanılmadı.
3. [iPhone 14](../test-results/097/after-mobile/iPhone-14-portrait-fold.png): ilk
   ekran okunur ve kullanılabilir; son Lighthouse LCP 4.85s, performans 80
   (önceki son build ölçümü 4.43s / 82).
   Sırasıyla <2.5s / ≥85 hedefleri karşılanmadı. Sonraki performans çalışması gereği açık.

Son inspect: **1 FAIL, 4 WARN; 1440/768/390'ın her birinde 29 hareket**.
WARN: korunan fildişi palet, video yerine korunan scroll kare dizisi, tasarımın
yatay şeridi ve fotoğraf üstündeki hero kartı. `--allow` eklenmedi.
Beş boyut: 1440'da 14/16/24/36/56; 768'de 14/16/20/28/36;
390'da 14/16/20/28/35px (yuvarlanmış değerler).

## Marka ve mikro detay kanıtı

| Kontrol | Nerede | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `after/desktop-fold.jpg`, CSS `:root` | #243A29 / #F5F1E7 / #D4B483 korundu |
| Başlık / gövde | `after/mobile-fold.jpg`, `#hero-title`, `body` | Fraunces / Figtree; font e2e |
| 8px boşluk ölçeği | hero 16/24/32, tesis 24/32/64/96, SSS 64/96 | CSS ve e2e geometri ölçümleri |
| h1/h2/h3 | `after/desktop-page-01.jpg`, `after/tablet-page-01.jpg` | Beş basamak, en fazla iki başlık satırı |
| Kırık simetri | vitrin farklı fiş yükseklikleri, tesis 8/4 kolon | Vitrin/tesis e2e |
| Hover/focus/active | `radio-focus.png`, `button-hover.png`, `button-press.png`, `footer-focus.png` (`test-results/097/`) | tokens, hero, shell e2e; footer hedefi 44×44px |
| Gölge/kenarlık | ürün fişi ve form | Durağan gölge yok; işlevsel form sınırı token'dan |
| İkon ailesi | header ve süreç kontrolleri | Lucide |
| Kontrast | zeytin/fildişi 10.87:1, muted/card 5.95:1, disabled 4.76:1 | AA; Lighthouse A11y 100; hero piksel testi |
| Yasak liste | taste lint + üç genişlikte inspect | Mor degrade / emoji / glass / stok 3D yok |

`OsmaniyeMap` zaten gerçek il sınırını kullanıyordu: `lib/geo/osmaniye.json`,
`TUR-ADM1-25984515`, geoBoundaries kaynak URL/hash ve yerel lisans kaydı.
Düziçi noktası/etiketi ve karo içinde kırpılmayan geometri tesis e2e ile doğrulandı;
harita yeniden çizilmedi.

Üçüncü tur etkileşim denetiminde odaklı koçanın footer linkini örttüğü de
yeniden üretildi. `motion-gate.spec.ts` regresyonu RED doğrulandı; footer'a
girerken koçanı gizleme ve odağı header sepetine aktarma düzeltmesi masaüstü
ve iPhone 14 WebKit'te geçti. Aynı üçüncü turun son inspect/screenshot çıktıları
bu düzeltmeyle yeniden alındı; ek bir dördüncü eleştiri turu yapılmadı.
