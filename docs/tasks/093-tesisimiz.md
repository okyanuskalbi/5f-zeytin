# Task 093: Tesisimiz: geniş fotoğraf, renk karosu, bilgiler

## Tür
frontend

## Amaç
Gerçek Osmaniye tesis fotoğrafı (plaka yerelde bulanık), Osmaniye silüetli renk karosu ve dört bilgi çifti.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: hayır

## Adımlar
1. Kaynak: `~/PROJELER/AFINA-KAYNAK/fabrika/afina-zeytin-tesis-osmaniye.png` — plakayı (sol alttaki araç, '80 AFN 080') YEREL olarak (sharp/ffmpeg boxblur) bulanıklaştır; dış servise yükleme YOK. `public/images/tesis/` webp 2400/1200; onay kaydı: kaynak hash + 'kullanıcının kendi fotoğrafı, plaka bulanık' notu (kullanıcı fotoğrafı kendisi verdi; yayın için ayrıca Claude onay soracak — kayıt 'aday', runtime=true YALNIZ kullanıcı onayı sonrası; o zamana kadar bölüm fotoğrafsız tipografik varyantla).
2. Başlık 'Tesisimiz' + üç satır giriş (resmi 04 'Marka hikâyesi' 2. paragrafından birebir).
3. Sol karo (kol 1–8) 16:10 fotoğraf + sağ üst köşede 320px kağıt blok: resmi kısa tanım (≤35 kelime).
4. Sağ karo (kol 9–12) zeytin yeşili düz alan: Osmaniye ili sınır silüeti (doğru şekil, tek dolu SVG) + Düziçi noktası. Altında 2×2 bilgi: Konum: Ellek, Düziçi / Osmaniye · Ürünler: sofralık, salamura, zeytinyağı · Satış: perakende + toptan · Faaliyet: 2021'den bu yana.
5. Mobil: föy telefon kuralları.

## Kabul kriterleri
- [ ] Fotoğrafta plaka okunamaz (ekran görüntüsü kontrolü); dış yükleme yapılmadı (ağ logu)
- [ ] e2e: bilgiler resmi/levha verisiyle birebir
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/093/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Coder Notu

20 Ekim 2026 — Bu sayfada Afina'nın teneke etiketi, Osmaniye tesisini anlatan kağıt metin alanı ve yer bilgisi karosuna dönüşür. Marka tokenları, Fraunces/Figtree, resmi metinler, onaylı medya, katalog ve sepet/PayTR altyapısı korunmuştur.

- Görevin açıkça izin verdiği **fotoğrafsız tipografik varyant** uygulandı. Başlık `Tesisimiz`; giriş resmi 04 hikâyesinin ikinci paragrafıdır, birebir korunur (1440px'te 3 satır). İlk paragraf solda, resmi kısa tanım 20 kelimelik kağıt blokta kalır. Fotoğraf/320px köşe bindirmesi yayın onayından sonra etkinleştirilecek görünüm içindir; onaysız fotoğrafa runtime bağlantısı veya boş fotoğraf kutusu eklenmedi. Tekrarlanan dış `Hikâyemiz` başlığı kaldırıldı, `#hikayemiz` eski fragment hedefi korundu.
- Masaüstünde 12 kolonun 1–8'i metin, 9–12'si harita/bilgilerdir; aralık 16px. Mobilde metin ve 3:2 harita alt alta, dört bilgi çifti 2×2 kalır. Giriş mobilde 18px, bilgi değerleri 16px, etiketler 13px; tüm bağlantılar en az 44px yüksektir. Tablet silüet/etiket çakışması RED ölçümünde −56,70px idi; düzeltmeden sonra aralık en az 6,40px'tir. Başlık bütün kabul genişliklerinde tek satırdır.
- Dört bilgi çifti `dl/dt/dd` ile sunulur. Ürün/satış kapsamı resmi 04 belgesinden, Ellek/Düziçi ve **2021'den bu yana faaliyet** bilgisi kullanıcının vergi levhasından çıkarılmış `AFINA-KAYNAK/sirket/SIRKET.md` kaydından doğrulandı (işe başlama 10.03.2021). Kuruluş tarihi veya tesisin kesin koordinatı uydurulmadı; özel vergi PDF'si repoya alınmadı.
- Silüet, [geoBoundaries TUR ADM1](https://www.geoboundaries.org/api/current/gbOpen/TUR/ADM1/) verisinin `Osmaniye / TR-80` poligonundan, sabit `9469f09` revizyonundan çıkarıldı. 316 köşe yerel eşdikdörtgensel projeksiyonla tek dolu SVG path'e çevrildi. Düziçi noktası [OSM ilişki 1248436](https://www.openstreetmap.org/relation/1248436) merkezidir, tesis noktası değildir. Kaynak/hash/koordinatlar `lib/geo/osmaniye.json`, atıf ve CC BY-SA/ODbL koşulları `public/maps/osmaniye-license.txt` içindedir; bölümde görünür lisans bağlantısı vardır. Harita için tarayıcıda dış istek yapılmaz.
- Girişler `motion/react` ile tek sefer, 80ms sıralama ve 16px hareket kullanır. SSR içeriği görünürdür; reduced-motion'da dönüşümler kaldırılır, metin ve CTA'lar erişilir. Kaydırma testinde etiket koçanı ile tesis metni çakışması da düzeltildi: mevcut yerleştirme hesabı tesisin metin/harita/bilgi alanlarını korur, güvenli 120px alan yoksa yinelenen koçanı geçici gizleyip inert yapar. Header sepeti erişilir kalır; bölümden çıkınca normal yerleştirme devam eder. Ayrı scroll dinleyicisi eklenmedi.
- Kullanılan skill'ler: frontend-patterns, motion-foundations, motion-patterns, motion-advanced, accessibility, design-system, verification-loop, profesyonel-web-sitesi. DESIGN, föy, beş tasarım rehberi, kit özeti ve kurulu Next.js CSS/image rehberleri okundu. Task 093'te `21st MCP: hayır` dendiğinden çağrılmadı; mevcut token uyarlamalı Button/Lucide kullanıldı, bağımlılık eklenmedi.

### Yerel fotoğraf / aday kaydı

**Kullanıcının kendi fotoğrafı, plaka bulanık.** Kaynak `AFINA-KAYNAK/fabrika/afina-zeytin-tesis-osmaniye.png` ile mevcut `docs/referans/tesis/afina-zeytin-tesis-osmaniye.png` kopyasının SHA-256 değerleri birebir aynı ve işlem sonrasında değişmemiştir:
`2ab815d27aa8ef64f367feb49f0bb4923870644e534200c7f1716239106126a3`.

`node scripts/prepare-facility.mjs`, yalnız yerel Sharp ile kaynakta x=328, y=656, 104×52px plaka alanına sigma=24 blur uygular, ardından 16:10 merkez kırpımını üretir. Kaynağın 1672px genişliği korunmuş referanstır; 2400px çıktı istenen teslim ölçüsüne büyütülmüştür, yeni detay iddiası taşımaz. EXIF/profil taşınmaz.

| Aday | Ölçü / bayt | SHA-256 | Onay / runtime |
|---|---|---|---|
| `public/images/tesis/tesis-osmaniye-2400.webp` | 2400×1500 / 255868 | `00e8e2c59d8d4f125f562eb730c6c298d2a6fab63358f53e806d45adf71c1731` | candidate / false |
| `public/images/tesis/tesis-osmaniye-1200.webp` | 1200×750 / 117276 | `598c43da43aae93f12cdeec0c89c3c1b34c926e247118586d87450e4a08e554b` | candidate / false |

İki aday manifestte kaynak hash'iyle kayıtlıdır; kullanıcı yayın onayı verilmedi, `approval=null`. `check:assets`, `/images/tesis/` için de kayıt/hash/onay/runtime denetimi yapar; onaysız runtime kullanımı ve kayıtsız dosya için RED→GREEN testleri eklendi. Onay kaydı bu task'ın Coder Notu'ndadır; diğer `docs/` dosyaları değiştirilmedi.

İşlem dış servise/API'ye fotoğraf veya parça yüklemez. `test-results/093/media-{process.log,preparation.json}` ağ kaydı, işlemde HTTP/HTTPS/TCP/TLS/UDP/fetch girişlerini engelleyip sayar: **0 ağ girişimi, 0 yükleme**. Bu Node düzeyinde denetimdir, işletim sistemi paket yakalama iddiası değildir. Tarayıcı ağ logları `*-network.json`: yalnız localhost GET; landing'de aday fotoğraf isteği yoktur. `candidate-{2400,1200}.png` ve `candidate-{2400,1200}-plate.png` dosyaları açılarak kontrol edildi; plaka yakınlaştırmada okunamaz. Adayların tarayıcı görüntüleri yalnız yerel GET ile alındı; Atlas/görsel üretim aracı kullanılmadı. Yayın onayını Claude ayrıca alacaktır; o zamana kadar görevdeki tipografik varyant geçerlidir.

### Komutla doğrulama

| Komut / kanıt | Sonuç |
|---|---|
| RED: `npm test -- tests/unit/facility.test.tsx tests/unit/asset-registry.test.ts` | Başlık/giriş/bilgiler ve tesis varlık kapısı eksikti; `red*.log` |
| RED: koçan kaydırma ve tablet harita aralığı testleri | Çakışmalar tekrarlandı; `stub-red.log`, `map-red.log`; sonra düzeltildi |
| `npm test` | 12 dosya, **216/216 PASS** |
| `npm run lint` | PASS, 0 uyarı |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run check:assets` | **18/18 PASS**, iki adayın onayı/runtime'ı kapalı |
| Tasteskill lint | **0 FAIL / 2 WARN**: mevcut demo `h-screen`, genel em-dash sayısı |
| Tesis Playwright | **30/30 PASS**: Chromium 1440/768/390/320 + iPhone 14 WebKit; resmi içerik, bilgi çiftleri, harita aralığı, onaysız medya/ağ, klavye, reduced-motion, JS kapalı, medya hatası, koçan çakışması |
| Sepet/vitrin/hero regresyonları | **252/252 PASS**; aynı JS düzeltmesi sonrası tüm ilgili regresyonlar; son izole harita CSS düzeltmesi ayrıca 30 tesis testiyle doğrulandı |
| Production inspect | **Bu bölüm için 0 FAIL**; tüm sayfada 1 FAIL / 6 WARN, aşağıda |
| iPhone 14 yatay görünüm | PASS, 844×390, yatay taşma yok; `webkit-iphone14-landscape.png` |
| `git diff --check` / değişen kod sır taraması | PASS; anahtar veya debug log eklenmedi |

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm run check:assets
./node_modules/.bin/next start -H 127.0.0.1 -p 3104
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3104 npx playwright test tests/e2e/facility.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=chromium-320 --project=webkit-iphone14
PLAYWRIGHT_PORT=3114 npx playwright test tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/upsell.spec.ts tests/e2e/product-card.spec.ts tests/e2e/card-motion.spec.ts tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts tests/e2e/hero-zeytinlik.spec.ts tests/e2e/showcase.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=webkit-iphone14
node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3104 --out test-results/093/inspect
```

3114, sepet fixture'larının kendi yerel production webServer'ı içindir. macOS sandbox tarayıcı başlangıcını engellediğinden tarayıcı komutları yetkili sandbox-dışı süreçlerde çalıştırıldı; komutlar yalnız yerel hedefi test etti. Raporlar `test-results/093/{facility,regression}-e2e-results.json`, komut çıktıları aynı dizindeki log'lardır. Zorunlu görüntüler `chromium-{1440,768,390,320}-{tesisimiz,map-facts}.png`, `webkit-iphone14-{tesisimiz,map-facts,reduced}.png`, kaydırma görüntüleri ve `inspect/` altındadır; görüntüler açılıp incelendi. Gerçek viewport görüntüleri kullanıldı; WebKit'i büyüten uzun locator görüntüleri kabul kanıtı yapılmadı. Bunlar tarayıcı/emülasyon kanıtıdır, fiziksel cihaz veya canlı yayın kabulü değildir. `test-results/` gitignore kapsamındadır.

AGENTS.md'nin 090–096 ara görev kuralına göre global bulgular gizlenmedi: inspect'in tek FAIL'i **few-pictures**, sayfada 2 fotoğraf, genel alt sınır 4. Onaysız fotoğraf eklenerek aşılmadı. WARN'lar palette-cream, no-footage, measure, pinned-over-picture, still-page, mobil side-scroll. Onaylı palet ve scroll kare dizisi korunur; girişteki uzun resmi paragraf 1440px'te üç satıra yerleşir, metin kısaltılmadı. Diğer bölüm/medya görevleri ve **097 global kapısı** bu sonuçları kapatacaktır.

`npm test -- --coverage`: 216 test PASS, app-geneli eşik FAIL (satır %71,73, statement %69,81, function %63,63, branch %95,83). Eksik kapsam sepet/yasal route'lardır; `unit-coverage.log`. Bu global eşik 093 bölüm kabulünü engellemez; 097'ye kalır.

Profesyonel web sitesi kanıtı:

| Kontrol | Nerede / ölçüm | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `*-tesisimiz.png`, harita | #243A29 / #F5F1E7 + #FFFCF5 / #D4B483 |
| Başlık + gövde fontu | `*-metrics.json`, `style-audit.json` | Fraunces 600 + Figtree |
| 8px boşluk ölçeği | Bölüm/metin/kağıt/bilgiler | 8/16/24/32/64/96px |
| h1/h2/h3 hiyerarşisi | Hero / Tesisimiz / ürün fişi | Semantik h2; mobil giriş 18px; başlık ≤2 satır |
| Kırık simetri | Masaüstü `*-map-facts.png` | 8/4 kolon, sağ yeşil karo, solda metin |
| Hover/focus/active: 3 bağlantı | `{product,wholesale,credit}-{focus,active}.png`, `style-audit.json` | Ürün, toptan ve harita kaynak linki; görünür odak ve ≥44px hedef |
| Gölge / kenarlık | Bölüm, kağıt ve harita | Durağan gölge/dekoratif çerçeve yok; odaklanan bölümdeki çizgi işlevsel focus outline'dır |
| Tek ikon ailesi | İki mevcut CTA | Lucide; harita veri temelli tek SVG'dir |
| Kontrast ≥4,5:1 | `style-audit.json` | Yeşil/fildişi 10,87:1; gövde/kağıt 17,25:1; etiket/fildişi 5,40:1; altın/yeşil 6,22:1 |
| Yasak liste | Görüntüler + lint/inspect | Mor degrade, emoji, blur kart yığını, boş görsel kutusu, stok 3D yok |

## Durum: TAMAMLANDI — v1; v2 (DESIGN.md Topraktan sofraya, 100–107) ile değiştirilecek
