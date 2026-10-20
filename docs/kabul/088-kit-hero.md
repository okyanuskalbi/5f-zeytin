# 088 — ZEYTİN hero teknik denetimi

20 Ekim 2026. Başlangıç: `09142c0`, temiz `main`. Bu checkout'ın production build'i `http://localhost:3104` üzerinde denetlendi; mevcut 3004 süreci kullanılmadı. Onaylı 086 kompozisyonu ve kaynak dosyalar korundu.

**Sonuç: BEKLİYOR.** Yerel komutlar ve 300 tarayıcı testi geçti. Gerçek iOS/Android, sistem güç tasarrufu/adres çubuğu/safe-area kabulü yapılmadı. Onaylı videonun son karesindeki kaynak kadrajı da “ürün odağı kesilmez” maddesini bütünüyle karşılamıyor. 076 kalite kabulü ve kullanıcı görsel kabulü açık kalır.

## Kontrol tablosu

| Kontrol | Sonuç | Güncel kanıt / sınır |
|---|---|---|
| Kaynak onayı | PASS | İki dış `ONAY.md` okundu; PNG/MP4 hash'leri aşağıda. Manifest, approval ve 243 WebP dosyasının hash/ölçüleri, 245 fiziksel dosyanın eksik/fazla kontrolü yeniden yapıldı. `check:assets` geçti. |
| Döngü dikişi | UYGULANMAZ | Hero autoplay loop değil; ileri/geri scrub. Kaynak ilk/son kareleri ve iki yöndeki şeritler açılarak incelendi. Kamera yakınlaşması başlangıca kesintisiz bağlanmıyor; loop'a dönüştürülmedi. Kaynağın %0/%100 uçlarında siyah/boş kare yok. |
| Poster / ilk yükleme | PASS | SSR'de 2400/1200 WebP, 16:9 ölçüleri ve iki CTA var. JS kapalı/başarısız, bekleyen medya, manifest 404/500, tüm kareler 404, canvas null/throw, çizim hatası ve context loss senaryoları geçti. Hata halinde poster korunur; canvas hatasında çalışma durur. Yavaş ağda kutu geometrisi değişmedi; Chromium CLS=0. |
| Sıkıştırma | PASS / UYGULANMAZ | Kare paketi **11.323.604 bayt = 10,799 MiB ≤12 MiB**. Runtime hero MP4 yok; `<5.000.000 bayt` MP4 teslim kapısı UYGULANMAZ. Salt okunur kaynak MP4 **5.379.141 bayt**; bu dosya <5 MB kabul edilmiş veya web teslimi yapılmış sayılmaz. |
| Scrub | PASS (yerel davranış) | %0/25/50/75/100 → 0/30/60/90/120; ters sıra, yavaş/hızlı ve üst üste yön değiştirme geçti. Uç/ara örneklerde canvas alfa=255; indeks 0..120, hedefe yerleştikten sonra eski kareye dönüş yok. Tek mevcut Motion scroll + rAF yolu korundu. Performance ayrıntıları aşağıda; fiziksel cihaz akıcılığı açık. |
| Reduced-motion | PASS | İlk yüklemede ve tercih değişiminde poster; canvas/kare isteği yok, dekoratif hareket yok, metin/iki CTA ve klavye çalışıyor. Değişimde yükleyici dispose edilir. |
| Mobil kaynak / yük | PASS | 320/390/768×900'de yalnız 960 set; 1440×900'de yalnız 1920 set. Gereksiz iki set isteği yok. Kısa ekran, `saveData` ve ≤4 mantıksal çekirdek bildiren aygıtta poster. Ekran dışında/gizli sekmede yeni kuyruk işi ve çizim durur; başlamış istekler bitebilir. Yeniden görünür olunca güncel pencere yüklenir. |
| Mobil ürün kadrajı | FAIL — kaynak sınırı | Poster ve canvas sağa hizalanarak mobilin ek yatay kesimi azaltıldı. Ancak onaylı **kaynağın 120. indeksinde** push-in, şişe/kasenin altını ve kasenin bir bölümünü zaten kesiyor. Eksik pikseller kadraj değişikliğiyle geri getirilemez. Kaynak değiştirme/yeni üretim bu görevde yasak; korunarak açık kaydedildi. [Kaynak uçları](../../test-results/088/source-endpoints.png). |
| Okunurluk scrim'i | PASS | Masaüstü `%92 → %75 @32% → 0 @58%` aynen; mobil görsel üstte/fildişi metin altta. %0/65/100 ve reduced-motion gerçek ekran piksellerinden ölçüldü. Metin en az **6,947:1**, odak en az **5,422:1**; menü metni en az **5,945:1**. Yeni dekoratif gradyan/glass yok. |
| Responsive / erişim | PASS (emülasyon) | Üç motorda 320/360/390/430/768/1440 ve 844×390; yatay taşma, CTA odak kırpılması yok; h1 ≤2 satır, CTA/menü hedefleri ≥44 px. 900→780 yükseklik değişiminde odak korunur. ≤55rem yükseklikte sticky yerine doğal kaydırma ve poster, böylece kısa görünümde CTA erişilir. |
| Gerçek iOS / Android | FAIL — doğrulanamadı | Fiziksel cihaz denetimi yok. iOS `devicectl` erişimi yok; mevcut adb test oturumu/5037 dinleyicisi bulunmadı. Yeni cihaz bağlantısı kurulmadı. Emülasyon aşağıda ayrı listelendi; gerçek adres çubuğu, çentik/safe-area ve OS düşük güç modu kabul edilmedi. |

## Varlıklar ve kaynak ilişkisi

Kaynaklar yalnız okundu:

- `AFINA-KAYNAK/sahne-gorselleri/adaylar/zeytin-v1.png`: **10.239.451 bayt**, SHA-256 `a5e9683e842478222e73a08631d96892cdbe0e4cc2812ce7cac1b870bec76b79`; aynı klasörün üstündeki `ONAY.md` ile eşleşir.
- `AFINA-KAYNAK/sahne-videolari/onayli/zeytin.mp4`: **5.379.141 bayt**, SHA-256 `a326b19c0ee6e830d987113359992a63da4ef20e8c64bf9196d0f67ce6d981b8`; `onayli/ONAY.md` ile eşleşir.
- Video: **5,041667 sn**, H.264 High, yuv420p, 1920×1080, 24/1 fps. [ffprobe kaydı](../../test-results/088/source-codec.json).
- [İlk/son kare](../../test-results/088/source-endpoints.png), [ileri örnekleme](../../test-results/088/source-forward.png), [geri örnekleme](../../test-results/088/source-reverse.png). Şeritler yalnız denetim çıktısıdır; runtime'a eklenmedi.

| Runtime dosyası | Ölçü / adet | Bayt | SHA-256 |
|---|---|---:|---|
| `zeytinlik-1200.webp` | 1200×675 | 119.346 | `96bad3c9018135bd27e907e3e6eca6771b447c0b682c5faca05f775a3ec78ce4` |
| `zeytinlik-2400.webp` | 2400×1350 | 316.066 | `f6d490617df356087f6fbbf88e761ed6d233e35d47f63b1f012cd1a3ededa3ff` |
| `960/frame-*.webp` | 121 × 960×540 | 3.268.902 | Dosya bazında [assets.json](../../test-results/088/assets.json) |
| `1920/frame-*.webp` | 121 × 1920×1080 | 7.945.520 | Aynı kayıt |
| `manifest.json` | 121 kare, 24 fps, 16:9 | 128 | `32226572b3563cd50f14c54cb2defdc87f4f4f2f09b7cf84fde8324ac0383077` |
| `approval.json` | approved, runtime=true | Paket toplamına dahil | `993ccb9e67decc74105534c7bc261e92fe0a030d96dec2721185f8f9d5248794` |

Paket toplamı iki kare seti, dizinin `poster.webp` dosyası ve iki JSON'u içerir; ayrı 1200/2400 hero posterleri toplamı **435.412 bayt** bu toplama katılmadı. Bağımsız `docs/gorsel-onay.md` kaydı, approval hash'i ve değişmeyen 086 belge referansı `check:assets` ile doğrulandı. Hiçbir asset/manifest/onay kaydı değiştirilmedi.

## Ağ ve performance

macOS Darwin arm64, Node 24.11.1, Playwright 1.64.1, production build; normal ölçüm localhost, ağ/CPU throttling yok, temiz browser context, DPR=1, 2 test worker. Normal hareket testlerinde bildirilen `hardwareConcurrency=8`; düşük donanım senaryosu ayrıca 4 ile sınandı. Fiziksel aygıt benchmark'ı değildir.

Tam ileri/geri geçişte üç tarayıcıda da her seçilen setin 121 karesi bir kez alındı. Resource Timing `encodedBodySize` gövdeyi, `transferSize` tarayıcının transfer ölçümünü gösterir; paket bütçesiyle karıştırılmaz. [Bütün URL/byte/süreler](../../test-results/088/verification.json).

| Görünüm | Seçilen set | Kare gövdesi | Kare transferSize | Diğer set |
|---|---|---:|---:|---|
| 320/390/768×900; Chromium/Firefox/WebKit | 960 | 3.268.902 | 3.305.202 | 0 istek |
| 1440×900; Chromium/Firefox/WebKit | 1920 | 7.945.520 | 7.981.820 | 0 istek |

Poster ve manifest transferleri yukarıdaki **kare** rakamlarına dahil değildir; ayrı URL kayıtları JSON'dadır. İlk buffer 15 kare, eşzamanlı istek tavanı 6; unit testleri ve Network trace'i ile doğrulandı.

| Motor | Sürüm | rAF P95 (dört genişlik) | En yüksek aralık | >50 ms aralık |
|---|---|---|---:|---:|
| Chromium | 156.0.8078.4 | 16,7–16,8 ms | 33,3 ms | 0 |
| Firefox | 157.0 | 9,14–9,26 ms | 33,14 ms | 0 |
| WebKit | 27.2 | 21–27 ms | **57 ms** | **2**, 1440 px |

Bunlar otomasyon, ekran görüntüsü ve scroll sırasında alınan headless rAF örnekleri; donanımlar arasında FPS karşılaştırması değildir. WebKit 1440 örneğindeki iki gecikme saklanmadı; fiziksel Safari ölçümü açık. Chromium Long Tasks API ve ayrı 24.494 olaylı [Performance trace](../../test-results/088/performance-trace.json) içinde >50 ms RunTask yok. Firefox/WebKit Long Tasks ve layout-shift API desteği yok; onların sıfır sayaçları “sıfır uzun görev/CLS” kanıtı sayılmadı. Chromium'da dört genişlikte CLS=0. Yavaş medya sırasında poster kutusu geometrisi üç motorda değişmedi.

Ek yavaş ağ ölçümü: Chromium, 390×900, **150 ms latency, 131.072 B/sn download, 65.536 B/sn upload, CPU 4× yavaşlatma**. Poster ve iki CTA erişilir; poster tamamlanmadan kare yüklemesi başlamaz. [İlk ekran](../../test-results/088/slow-3g-initial.png), [hazır ekran](../../test-results/088/slow-3g-ready.png), [parametre ve transferler](../../test-results/088/extra-audit.json). Bu koşulda poster isteği 6.178 ms sürdü; hızlı yükleme iddiası yapılmadı.

## Erişim, ekranlar ve emülasyon

- Metin ölçümü: fotoğraf/scrim/CTA arka planı gerçek ekran piksellerinden, her metin satırının kapladığı alan boyunca; normal ≥4,5:1 ve büyük ≥3:1. Üç motor/dört genişlik/%0–65–100: minimum **6,9471337:1**. [Ölçümler](../../test-results/088/verification.json).
- Odak: header kontrolleri, menü düğmesi ve iki CTA; %0/65/100 ve 320/390/768/1440'da outline altındaki gerçek piksellerden minimum **5,4223601:1**. [Ayrıntılar](../../test-results/088/extra-audit.json). Menü açıkken düz yüzey renk çiftleri de ölçüldü: açıklama 5,945:1, bağlantı/ikonlar 11,969:1; hedefler 44–45 px. [Menü ölçümü](../../test-results/088/menu-contrast.json).
- [390 px](../../test-results/088/hero-final-390.png), [1440 px](../../test-results/088/hero-final-1440.png), [reduced-motion](../../test-results/088/hero-reduced.png), [844×390 odak](../../test-results/088/landscape-focus.png), [mobil menü](../../test-results/088/menu-390.png). İlk iki hero görseli testte 0. kare beklentisi sonrasında alınır.
- iPhone 13 **emülasyonu**: WebKit 27.2, ölçülen viewport 390×664, DPR=3, touch; yalnız 1200 poster, **0 kare**. [Ekran](../../test-results/088/emulation-iPhone-13.png).
- Pixel 7 **emülasyonu**: Chromium 156.0.8078.4, 412×839, DPR=2,625, touch; yalnız 1200 poster, **0 kare**. [Ekran](../../test-results/088/emulation-Pixel-7.png).
- ≤880 px yükseklik için poster tercihi kasıtlıdır; görünüm boyu 900 px olan mobil testlerde 960 setin gerçek transferi ayrıca ölçülür. Emüle edilen touch, çentik ve URL çubuğunun gerçek cihaz davranışını kanıtlamaz.
- Native OS düşük güç modu için güvenilir bir tarayıcı sinyali bu denetimde yok. `saveData` ve düşük çekirdek sayısı yalnız sınanabilen muhafazakâr poster kapılarıdır; OS düşük güç testi yerine geçirilmedi.

## Çalıştırılan komutlar

```sh
npm run check:assets
npm run test -- tests/unit/frame-sequence.test.ts
npm run test
npm run lint
npm run typecheck
npm run build
PLAYWRIGHT_BASE_URL=http://localhost:3104 npm run test:e2e -- tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts tests/e2e/hero-zeytinlik.spec.ts --output=test-results/088-e2e
git diff --check
```

Sonuçlar: check:assets **16 onaylı görsel + bütün kare paketi PASS**; ilgili unit **38/38**, genel unit **202/202**; lint/typecheck/build/diff PASS. E2E **300/300**, 0 skip/0 retry/0 flaky: Chromium/Firefox/WebKit × 320/390/768/1440, her projede ek 360/430 ve yatay/resize senaryoları. [Makine çıktısı](../../test-results/088/verification.json).

TDD: başlangıç build'inde veri tasarrufu/canvas throw/yatay odak E2E testleri **3/3 başarısız**; yükleyici testleri de veri tasarrufu ve ekran dışı kuyruk kusurlarını doğruladı. İlk tam matriste Firefox resize odağı bulundu ve düzeltildi. Init script sırasına bağlı düşük donanım testi ayrı sayfaya alındı; son tam matris yukarıdaki 300/300'dür.

Ek `npm run test -- --coverage`: **202 test geçti, komut FAIL**. Satır %72,34, statement %70,37, function %66,66; branch %96,15; eşik %80. `git archive HEAD` ile repo içindeki geçici başlangıç kopyasında aynı komut: **196/196**, aynı coverage oranları ve aynı eşik hatası. Bu görev `app/` koduna veya eşiklere dokunmadı. [Yeni coverage logu](../../.cache/088-unit-coverage.log), [başlangıç logu](../../.cache/088-baseline-coverage.log).

Medya denetimi için salt okunur `ffprobe`, SHA-256/Sharp ve `ffmpeg fps=1 / reverse / select(n=0,n=120)` kullanıldı. Ek ağ/trace/kontrast/emülasyon komutu `node .cache/088-extra.mjs`, çıktı derleme `node .cache/088-summarize.mjs`; geçici denetim scriptleri ve büyük ekran/trace/JSON çıktıları `.gitignore` gereği yereldir. Bağlantılar bu çalışma alanındaki gerçek dosyalara gider; GitHub'a yüklenmiş artefakt sayılmaz. Kabul raporu, davranış testleri ve sınırlı kod düzeltmeleri commit edilir.

## Açık kalan kabul

1. Onaylı kaynağın son kare ürün kadrajı: yeni kaynak/tasarım kararı bu görevde verilmedi; bütün ürünün her karede eksiksiz gösterimi sağlanamadı.
2. Gerçek iOS Safari ve Android Chrome: normal/reduced-motion, düşük güç/veri tasarrufu, adres çubuğu/safe-area, yatay görünüm ve klavye kabulü yapılmadı. WebKit 1440 örneğindeki gecikmeler için gerçek cihaz ölçümü de gerekli.
3. 076 kalite kabulü, deployment/yayın ve kullanıcının nihai görsel kabulü bu yerel raporla tamamlanmış sayılmaz.
