# Task 097 — mobil önce/sonra

20 Ekim 2026. Yerel production, yayın veya fiziksel cihaz kabulü değildir.
WebKit: iPhone 14 ve iPhone SE. Chromium: Pixel 7 ve Galaxy S20.
Galaxy S20, Playwright kataloğunda bulunmadığı için 360×800 / DPR 3 Android
Chromium profiliyle emüle edildi. Her profil ayrıca yatay test edildi.

Baseline `b32cd42` kodunun yalıtılmış `.cache/baseline-097` build'i 3106'da;
son build 3104'te çalıştırıldı. Baseline'a yalnız geçici Turbopack çözümleme
kökü ayarı uygulandı; uygulama kaynakları baseline commit'inden geldi.

```sh
AUDIT_URL=http://127.0.0.1:3106 node scripts/audit-mobile-097.mjs before
node scripts/audit-mobile-097.mjs after
```

Ham ölçümler: `test-results/097/{before,after}-mobile/metrics.json`.
Başlıklar dönmüş fişlerin ekran kutusundan değil `offsetHeight/line-height`
ile ölçüldü; 2.01 gibi değerler piksel yuvarlamasıdır, iki satırdır.

## Önce / sonra

| Cihaz | Yön | Görünüm | Başlık satırı önce → sonra | Min yazı | <44px hedef sayısı | Yatay taşma | Form/koçan çakışması |
|---|---|---|---|---|---|---|---|
| iPhone 14 / WebKit | Dikey | 390×664 | 2 → 2 | 13 → 14px | 1 → 0 | 0 → 0px | Yok → yok |
| iPhone 14 / WebKit | Yatay | 664×390 | 2 → 2 | 13 → 14px | 1 → 0 | 0 → 0px | Yok → yok |
| iPhone SE / WebKit | Dikey | 320×568 | 2 → 2 | 13 → 14px | 1 → 0 | 0 → 0px | Yok → yok |
| iPhone SE / WebKit | Yatay | 568×320 | 2 → 2 | 13 → 14px | 1 → 0 | 0 → 0px | Yok → yok |
| Pixel 7 / Chromium | Dikey | 412×839 | 2 → 2 | 13 → 14px | 1 → 0 | 0 → 0px | Yok → yok |
| Pixel 7 / Chromium | Yatay | 839×412 | 2 → 2 | 13 → 14px | 1 → 0 | 0 → 0px | Yok → yok |
| Galaxy S20 / Chromium | Dikey | 360×800 | 2 → 2 | 13 → 14px | 1 → 0 | 0 → 0px | Yok → yok |
| Galaxy S20 / Chromium | Yatay | 800×360 | 2 → 2 | 13 → 14px | 1 → 0 | 0 → 0px | Yok → yok |

Görünüm ölçüleri kullanılan Playwright profillerinin **CSS viewport** değerleridir;
telefonun fiziksel ekran çözünürlüğü değildir. Tam değerler JSON'da saklanır.
Küçük hedef KVKK footer linkiydi; minimum genişliği 44px yapıldı.
Sekiz durumda JavaScript sayfa hatası kaydedilmedi.

Örnek kanıtlar:

- [iPhone 14 ilk ekran](../test-results/097/after-mobile/iPhone-14-portrait-fold.png)
- [iPhone SE yatay](../test-results/097/after-mobile/iPhone-SE-landscape-fold.png)
- [Pixel 7 ürün fişleri](../test-results/097/after-mobile/Pixel-7-portrait-products.png)
- [Galaxy S20 yatay form](../test-results/097/after-mobile/Galaxy-S20-landscape-wholesale.png)
- 1440/768/390: `test-results/097/after/{desktop,tablet,mobile}-{fold,page-*}.jpg`.

## Lighthouse mobil

Mevcut yerel Lighthouse CLI, varsayılan mobil / simulated throttling ayarları;
yalnız performance ve accessibility kategorileri, ayrı taze Chrome profili.
Ölçümler yerel e2e turuyla aynı makinede alındı; saha verisi değildir.

```sh
node /Users/emre/.npm/_npx/0f94ee7615faf582/node_modules/lighthouse/cli/index.js \
  http://127.0.0.1:3104 --output=json \
  --output-path=test-results/097/lighthouse-final.json \
  --only-categories=performance,accessibility \
  --chrome-flags='--headless --no-sandbox' --quiet
```

| Ölçüt | Önce | Sonra | Hedef | Sonuç |
|---|---:|---:|---:|---|
| Performance | 77 | 80 | ≥85 | FAIL |
| Accessibility | 100 | 100 | ≥95 | PASS |
| LCP | 6.95s | 4.85s | <2.5s | FAIL |
| CLS | 0 | 0.00016 | <0.1 | PASS |

Son build'in ilk ölçümü `lighthouse-final.json`: 82 / 4.43s. E2e turu bittikten
sonraki tekrar `lighthouse-final-idle.json`: 80 / 4.85s. Sonuç tablosunda son
tekrar kullanıldı; iki ölçüm de performans/LCP eşiklerinin altında kaldı.
Her iki çalıştırmada Lighthouse 13.5.0, A11y 100 ve CLS 0.00016.

İyileştirme: kullanılmayan Fraunces yüzleri ilk yüklemeye preload edilmez;
aynı onaylı poster responsive Next image çıktısıyla teslim edilir. Font aileleri,
orijinal görseller, ScrollFrameSequence ve video kaynağı değişmedi.
Eşikler yükseltilmedi, Lighthouse sonucu başarı olarak sunulmadı.

## Medya, iOS ve sabit katmanlar

| Kontrol | Kanıt / sonuç |
|---|---|
| Kontrast | Olive/ivory 10.87:1; body/ivory 15.67:1; muted/card 5.95:1; gold/olive 6.22:1; disabled 4.76:1. Hero e2e piksel örneklemesi ayrıca çalıştırıldı. |
| Kare paketi | 960: 121 kare / 3,268,902 byte; 1920: 121 kare / 7,945,520 byte; toplam 10.70 MiB, 12 MiB altında. Tüm paket ilk açılışta indirilmez. |
| Video / autoplay | Runtime'da video elementi yok; onaylı kare dizisi korunur. `play()` veya autoplay izni kullanılmaz. MP4 <5 MB ölçütü kare paketinin başarısı diye gösterilmez. |
| iOS düşük güç | WebKit'te poster, reduced-motion, kısa görünüm ve düşük donanım fallback testleri. Fiziksel iOS Düşük Güç anahtarı denenmedi. |
| Reduced-motion | Statik kart, görünmez koçan, erişilir header sepeti; frame isteği yok; kontroller ve metinler erişilir. Canlı tercih değişimi de e2e'de. |
| svh/dvh | Sekiz profilde destek mevcut. Hero `svh`, dialog `dvh`; kısa yatay görünüm belge akışına geçer. |
| Güvenli alan | Header ve koçan `env(safe-area-inset-*)` kullanır. Emülatör gerçek çentik/klavye ölçümü sayılmaz. |
| Koçan | 120px; metin ≥14px, bağlantı yüksekliği ≥44px. Ürün fişi/okuma engellerinden uzaklaştırılır; yer yoksa inert/gizli olur. Footer görünürken her zaman gizlenir; odaklıysa önce header sepetine aktarılır. |
| Klavye | Form ilk alanı focus edildiğinde sekiz profilde koçan çakışması yok. Yerel klavye focus testi, fiziksel yazılım klavyesinin açıldığının kanıtı değildir. |
| Vitrin | Farklı yükseklikte, alt kenarda tam fişler; mobil 72vw yatay şerit ve sonraki fiş ipucu. Ürün adedi/stok/sepete ekleme testleri korunur. |
| Harita | Gerçek Osmaniye sınırı, Düziçi noktası ve okunur etiket; kaynak/hash/lisans yerel kayıtta. |

## Açık kapılar

Tasarım inspect'inde dört fotoğraf eşiği için `few-pictures` FAIL sürer. Tekrarlı
süreç görselleri geri konmadı; `candidate` tesis fotoğrafları onaylanmadan
kullanılmadı. Performans ve LCP hedefleri de karşılanmadı. Tam e2e çalışmasının
kesin sonucu ve tekrar doğrulamaları task dosyasının Coder Notu'ndadır.
Bu nedenle Task 097 **BEKLİYOR**.
