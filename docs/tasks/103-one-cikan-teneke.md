# Task 103: Öne çıkan: Doğal Kırma Yeşil Zeytin 10 kg (split stage)

## Tür
frontend

## Amaç
Sol yapışkan büyük teneke görseli, sağda kaydırılan hikâye, boy seçimi ve sepete ekle; toptan teklif bağlantısı.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: evet — ilham: sticky split product (uyarla)

## Adımlar
1. Masaüstü 50/50: sol `position: sticky` 100svh teneke görseli (onaylı stüdyo/sahne; yoksa referans kırpımı), sağda: başlık (ürün adı), resmi ürün kapsamı cümlesi, boy seçici (1 kg / 5 kg / 10 kg — temsili, veri getProducts'tan), fiyat, adet, sepete ekle, 'Toptan alım için teklif isteyin' → #toptan.
2. Görsel scroll'da hafif ölçek (1.04→1) ve sahne görseline çapraz geçiş.
3. Mobil: görsel üstte 70svh, içerik altta; sepete ekle tam genişlik.

## Kabul kriterleri
- [ ] e2e: boy değişince fiyat/gramaj değişir, sepete ekleme çalışır; mobil düzen
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/103/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Coder Notu

### Uygulanan bölüm

- Tasarım okuması: perakende/toptan müşterisi için v2'nin aydınlık, ürün odaklı editoryal sahnesi. Mevcut Fraunces/Figtree, zeytin/krem/kum tokenları; masaüstünde 50/50, solda 100svh sticky görsel, sağda doğal akışta hikâye ve satın alma. Mobil/tablette görsel üstte 70svh; sepete ekle tam genişlik. Varyans/hareket/yoğunluk: 7/5/3; yeni tasarım sistemi veya mimari kararı yok.
- `FeaturedProduct`, `FeaturedPurchase`, `FeaturedMediaMotion` eklendi. Resmi hikâyenin ilk iki cümlesi ve resmi ürün kapsamı kullanıldı. Boy, gramaj, fiyat, stok, adet, doğrulama hataları ve ortak sepet bağlantısı var. Varsayılan 10 kg; boy değişimi adedi sıfırlar. Eksik boy uydurulmaz; boş katalog ve tükendi durumları korunur.
- Görevin açıkça izin verdiği **temsili** 1/5/10 kg seçenekleri `getProducts()` sabit kataloğuna eklendi. Önceki üç ürünün SKU/fiyat/stok bilgileri korunarak toplam **6** ürün oldu. Yeni örnek fiyatlar sırasıyla 220/1.100/2.200 TL; gerçek fiyat, stok, indirim veya satış onayı değildir. Bölümde bu durum görünür; Product JSON-LD eklenmedi. Vitrin testi sabit üç ürün yerine katalog uzunluğunu, aynı adlı varyantlar için ad + gramajı kullanır. Chromium'un 43,999938px çıktısı için dokunma ölçümü 0,001px hassasiyette yuvarlanır; 44px sınırı korunur.
- `#toptan` bağlantısı mevcut `#toptan-iletisim` bölümünü saran odaklanabilir hedefe gider. Toptan form, PayTR ve sepet altyapısı değiştirilmedi.
- 21st MCP araması yapıldı, [Sticky Content Wrapper / hyperiux, 26064](https://21st.dev/@hyperiux/components/sticky-content-wrapper) kodu alındı. Sticky görsel/metin ayrımı `motion/react`, doğal kaydırma ve proje tokenlarına uyarlandı; GSAP/snap eklenmedi. Mevcut shadcn Button kullanıldı; yeni primitive kurulmadı.
- Görsel scroll ölçeği **1.04 → 1**. Reduced-motion CSS'i ilk boyamadan itibaren transform'u kaldırır; içerik ve eylemler görünür/erişilebilir kalır. Onaylı ayrı sahne verildiğinde opacity ile çapraz geçiş yapabilen `scene` girişi hazırdır.
- Kullanılan skill'ler: frontend-patterns, motion-patterns, motion-advanced, motion-foundations, accessibility, design-system, verification-loop, tdd-workflow, motion-framer, profesyonel-web-sitesi, ui-ux-pro-max; tasteskill lint/inspect kapısı uygulandı. Skill'ler yerelde bulundu, ek kurulum yapılmadı.

### Eksik adım ve BEKLİYOR gerekçesi

**Adım 2'nin sahne görseline gerçek çapraz geçişi tamamlanamadı.** `AFINA-KAYNAK/urun-gorselleri/onayli/ONAY.md` yok; aynı klasörün `RAPOR.md` dosyası açıkça “Hiçbir görsel onaylı değildir.” diyor. `adaylar/01-dogal-kirma-yesil-zeytin-10kg-sahne.*` dosyaları bu nedenle runtime'a alınmadı. AGENTS.md'nin kullanıcı onayı olmadan görsel kullanmama kuralı geçerli. Ayrı onaylı sahne geldiğinde `FeaturedMediaMotion.scene` bağlantısı yapılmalı ve gerçek görseller arasındaki scroll çapraz geçişi doğrulanmalıdır. Bu görevin kendi adımı eksik olduğundan **TAMAMLANDI yazılmadı**.

Görevin Adım 1'de açıkça izin verdiği mevcut referans kırpımı kullanıldı: `AFINA-KAYNAK/urun-gorselleri/referans-teneke-kirpim.jpg` → `public/media/featured/referans-teneke.jpg`. Dosya aynen kopyalandı, yeni üretim/etiket düzenlemesi yapılmadı; 923×920, SHA-256 `89a4c2ac7fdc9222838ecb05261db61d19714165c21857273231aeb43847256a`. Ambalajın 10 kg referansı olduğu tüm boy seçimlerinde görünür. Bu kullanım diğer adaylara onay vermez.

### Komutla doğrulama

Kanıtlar `test-results/103/` altında yereldir; mevcut gitignore gereği commit edilmez.

| Kontrol | Gerçek sonuç / kanıt |
|---|---|
| TDD RED → GREEN | Yeni bileşen import'u eksik uygulama nedeniyle compile RED (`red.log`, testler henüz çalışmadı); bileşen sonrası aynı dosyada **5/5 PASS** (`green.log`). Aktif main checkpoint'leri `c7edcdf` → `fb74fb3`. |
| `npm test -- --coverage` | **19 dosya, 257/257 PASS**; statement %87,50 / branch %95,83 / function %92,85 / line %91,83. `unit.log`. Bu varsayılan kapsam app dosyalarıdır. |
| Yeni bileşenlerin coverage'ı | `npm test -- tests/unit/featured-product.test.tsx --coverage --coverage.include='components/landing/Featured*.tsx' --coverage.reportsDirectory=test-results/103/coverage`: **5/5 PASS**; statement %96,29 / branch %86 / function %94,11 / line %97,91. `scoped-coverage.log`. |
| `npm run lint` | **PASS, 0 uyarı**, `eslint.log`. |
| `npm run typecheck` | **PASS**, `typecheck.log`. |
| `npm run build` | **PASS**, varlık kontrolü **18/18 PASS**, `build.log`. |
| `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` | **0 FAIL / 2 WARN**, `taste-lint.log`. Önceden mevcut demo `h-screen` ve genel uzun tireler. |
| Production `next start -H 127.0.0.1 -p 3104` + `inspect.mjs` | **Task 103 bölümü 0 FAIL**; 1440/768/390'da başlık 2 satır, taşma 0, bozuk görsel yok. `inspect/report.json`, `inspect-scope.json`, `inspect.log`. Global **4 FAIL / 4 WARN** aşağıda. |
| İlgili e2e ve regresyon | **205 PASS / 3 SKIP / 0 FAIL / 0 flaky**, `e2e-verified.log`. Üç SKIP, Pixel 7 çekiminin diğer projelerde tekrarlanmaması içindir; Pixel 7 Chromium testinde gerçekten çalıştı. |
| Güvenlik ve diff | `git diff --check` temiz; eklenen kodda sır, env değeri ve debug çıktısı yok. |

Son e2e komutu:

```sh
PLAYWRIGHT_PORT=3107 FRAME_SEQUENCE_DEV_URL=http://localhost:3004 npm run test:e2e -- \
  tests/e2e/featured-product.spec.ts tests/e2e/showcase.spec.ts \
  tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts \
  tests/e2e/upsell.spec.ts tests/e2e/payment-preview.spec.ts tests/e2e/wholesale-form.spec.ts \
  --project=chromium-1440 --project=chromium-768 --project=chromium-390 \
  --project=webkit-iphone14 --output=test-results/103/verified
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs \
  http://127.0.0.1:3104 --out test-results/103/inspect
```

Playwright kendi production sunucusunu 3107'de başlattı; fixture route'ları için `PLAYWRIGHT_BASE_URL` kullanılmadı. PayTR'nin credential-free dev kontrolleri aynı checkout'un 3004 sunucusunda; token/iframe ve gönderim başarı/hata kontrolleri fixture ile doğrulandı. Bu testler canlı tahsilat veya gerçek e-posta teslimi kanıtı değildir. Sandbox tarayıcı süreçlerini başlatamadığı için browser komutları izinli süreç erişimiyle yeniden çalıştırıldı.

### Ekran ve tasarım kanıtı

`chromium-{1440,768,390}-stage.png`, `*-section.png`, `*-reduce.png`, `webkit-iphone14-*.png`, `Pixel-7-section.png`, `Pixel-7-cart.png`; ayrıca dört profilin `*-interaction-{0,1,2}.png` dosyaları. Masaüstü, tablet, iPhone 14 ve Pixel 7 bölüm görüntüleri açılarak incelendi. iPhone 14 gerçek WebKit, Pixel 7 Chromium cihaz emülasyonudur; fiziksel cihaz kabulü değildir.

| Kontrol | Ekran / seçici / ölçüm | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `*-section.png`, `#one-cikan` | Zeytin #243A29, krem #F6F1E6, kum #EDE4D1; kaynak ambalajın altını korunuyor. |
| Başlık / gövde fontu | `#featured-title`, hikâye `p`; `design-measures.json` | Fraunces / Figtree, dört profilde doğrulandı. |
| 8px boşluk ölçeği | Hikâye gap **32px** ölçüldü; CSS 8/16/24/32/48/96 | PASS. |
| h1/h2/h3 hiyerarşisi | Inspect metrikleri; bölüm h2 1440'da **72px**, 768/390'da **40px**, iki satır | Korunan h1 ve vitrin h3 ölçeğiyle uyumlu. Bölümde ek başlık tekrarları yok. |
| Kırık simetri | `chromium-1440-stage.png` | 50/50 alan, sabit büyük teneke ile farklı yüksekliklerde hikâye/satın alma akışı. |
| Hover/focus/active | Boy radyosu, sepete ekle, toptan linki; `*-interaction-{0,1,2}.png` | Dört profilde odak görünür, outline ≥2px; hover/active kareleri kaydedildi. |
| Marka sınırı/gölgesi | Boy seçici 2px zeytin sınır; ürün sahnesi | Durağan gölge/kart çerçevesi eklenmedi. |
| Tek ikon ailesi | Adet ve sepet eylemleri | Mevcut Lucide; elle SVG/emoji yok. |
| Kontrast ≥4,5:1 | Gerçek computed renkler, `design-measures.json` | Gövde ve birincil düğme **10,89:1**, dört profilde PASS. |
| Yasak liste | Yeni bölüm ve CSS | Mor degrade, emoji, blur yığını, stok 3D, eyebrow ve dekoratif rozet yok. |

### Kapsam dışı genel inspect bulguları

- **3 FAIL `headline-lines`:** mevcut Tesisimiz bölümündeki “Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.” büyük paragrafı 1440/768/390'da üç satır. Yeni ürün başlığı üç profilde iki satırdır.
- **1 FAIL `few-pictures`:** sayfada iki ayrı raster konu görseli var. Onaysız adaylar çoğaltılarak bu kapı geçilmedi; görsel onayları ve 102/104–107 kapsamı bekleniyor.
- **4 WARN:** sözleşmedeki krem palet (`palette-cream`), videoya izin verilmemesi/kare dizisi (`no-footage`), önceki vitrinin yatay akışı (`side-scroll`), korunan hero başlığının görsel üzerindeki sticky hareketi (`pinned-over-picture`).
- AGENTS.md'nin ara görev kuralı uyarınca bu genel bulgular Task 103'ün bölüm kabulünü engellemez. **BEKLİYOR nedeni genel inspect değildir; yukarıdaki onaysız sahne görseli nedeniyle eksik kalan gerçek çapraz geçiştir.**

## Durum: BEKLİYOR
