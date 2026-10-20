# Task 104: Tesisimiz + Toptan (fabrika yeşili bandı)

## Tür
frontend

## Amaç
Tesis cephesi yeşili bandında 'Osmaniye'de, kendi tesisimizde.' + bilgiler + tesis fotoğrafı (onaylıysa); altında toptan formu.

## Bağlam
ZEYTİN v2 — **önce `docs/DESIGN.md` (tamamı; v2 "Topraktan sofraya") okunur**; v1 (`DESIGN-v1-etiket.md`) bileşenleri (etiket kartı, koçan, fişler, fırfırlı footer) kaldırılır/dönüştürülür. Korunanlar DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" + "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop; skill `motion-framer`, `profesyonel-web-sitesi`, `ui-ux-pro-max` (e-ticaret UX)
- 21st MCP: hayır

## Adımlar
1. Bant `#6CCB3C` zemin, siyah mürekkep (AA ölç), sol: dev başlık 'Osmaniye'de, kendi tesisimizde.' + resmi 04 hikâye 2. paragrafı + bilgiler (Ellek, Düziçi / Osmaniye · Sofralık, salamura, zeytinyağı · Perakende + toptan · 2021'den bu yana).
2. Sağ: tesis fotoğrafı (plaka bulanık, `public/images/tesis`) YALNIZ `docs/gorsel-onay.md`'de kullanıcı onayı varsa; yoksa Osmaniye il silüeti (doğru sınır, Düziçi noktası) siyah dolgu.
3. Altında zeytin zeminli 'Toptan satış' bölümü: mevcut 081 formu yeni dile; adres (SIRKET.md), telefon/e-posta teyit gelene kadar gizli.

## Kabul kriterleri
- [ ] e2e: form doğrulama + KVKK onayı; fotoğraf onaysızsa render edilmiyor; kontrast AA
- [ ] `lint.mjs app components` 0 FAIL; production (`next build && next start -p 3104`) `inspect.mjs` bu bölüm için FAIL 0; 1440/768/390 + iPhone 14 (WebKit) + Pixel 7 ekran görüntüleri `test-results/104/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil); sepet/PayTR önizleme/toptan form testleri bozulmaz

## Coder Notu

### Uygulama — 21 Ekim 2026

- PLAN, DESIGN v2'nin tamamı, AGENTS, resmi 04 içerik, görsel onay kaydı ve 081 okundu. Adres/faaliyet tarihi salt okunur `AFINA-KAYNAK/sirket/SIRKET.md` ile doğrulandı. Başlangıçta `main` ve çalışma ağacı temizdi.
- `Facility`: tam genişlik `#6CCB3C` bant, `#0D110D` mürekkep, iki satırlık “Osmaniye’de, kendi tesisimizde.” başlığı, birebir resmi ikinci paragraf ve solda dört bilgi. Sağda mevcut gerçek Osmaniye il sınırı, Düziçi ilçe merkezi noktası ve lisans bağlantısı var. Tesis fotoğrafının kullanıcı onayı yok; görevde izin verilen harita alternatifi kullanıldı. Onaysız fotoğraf render/ağ isteği yok.
- `WholesaleContact` ve mevcut 081 formu zeytin zeminde, kart/kutu olmadan yeniden yerleştirildi. Tesis ve toptan artık ardışık, süreçten sonra ve SSS'den önce. Adres korunuyor; teyitsiz müşteri hizmetleri telefon/e-postası yayınlanmıyor. Eski sıra/kart assertion'ları yalnız bu yeni düzen için güncellendi.
- KVKK okundu bildirimi başlangıçta boş; işaretlenmeden enjekte edilmiş gönderim çağrılamaz. Hata açıklaması kutuya bağlı, odak ilk hataya gider, pending sırasında kilitlenir, başarıda sıfırlanır. Pazarlama izni eklenmedi. Mevcut taslak KVKK bağlantısı/uyarısı korunuyor. Runtime gönderimi 082 servisi gelene kadar kapalı; başarı/hata/pending testleri yalnız test fixture'ında, gerçek teslim/tahsilat iddiası yok.
- Hareket mevcut `motion/react` altyapısında bir kez giriş, 24 px, 0,08 sn stagger; SSR görünür, reduced-motion/klavye/JS kapalı erişim korunuyor. Ürün/sepet/PayTR uygulaması, DB, auth, görsel onayları ve diğer dokümanlar değiştirilmedi.
- Skill'ler: frontend-patterns, motion-foundations/patterns/advanced, accessibility, design-system, verification-loop, tdd-workflow, motion-framer, profesyonel-web-sitesi, ui-ux-pro-max. Yerel Next.js CSS/client sınırı kılavuzları okundu; UX skill'inde form hata/odak araması yapıldı. Ek skill/paket yok. Task'ın “21st MCP: hayır” tercihi uygulandı; mevcut özelleştirilmiş shadcn primitive'leri kullanıldı.

### Komutla doğrulama

Kanıtlar `test-results/104/` altında yereldir; mevcut gitignore gereği commit dışında tutulur.

| Kontrol | Gerçek sonuç / kanıt |
| --- | --- |
| TDD RED → GREEN | `npm test -- tests/unit/facility.test.tsx tests/unit/wholesale-form-ui.test.tsx tests/unit/faq-contact-footer.test.tsx`: RED **9 FAIL / 5 PASS** (eksik v2 başlık/sıra/KVKK); aynı hedef GREEN **14/14 PASS**. `red.log`, `green.log`. Aktif main checkpoint'leri `9f271e8` → `37f0a9e`. |
| `npm test -- --coverage` | **exit 0; 19 dosya, 259/259 PASS**. Varsayılan app kapsamı statement **%87,50**, branch **%95,83**, function **%92,85**, line **%91,83**. `unit.log`. |
| Hedefli form coverage | Üstteki üç unit dosyası, `--coverage --coverage.include='components/landing/{Facility,WholesaleContact,WholesaleForm}.tsx' --coverage.reportsDirectory=test-results/104/coverage`: **14/14 PASS**. Coverage raporuna giren `WholesaleForm.tsx`: statement/function/line **%100**, branch **%97,95**. Saf SSR bileşenlerine kapsam yüzdesi atfedilmedi. `scoped-coverage.log`. |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**; uyarısız ESLint, tip kontrolü, production build. Varlık denetimi **18/18 PASS**. `eslint.log`, `typecheck.log`, `build.log`. |
| `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` | **exit 0; 0 FAIL / 2 WARN**. Mevcut demo `h-screen` ve genel metinlerin uzun tireleri. `taste-lint.log`. |
| Production `next start -H 127.0.0.1 -p 3104` + `inspect.mjs` | Son build üzerinde 1440/768/390: **bu bölüm 0 FAIL**, başlık iki satır, yatay taşma 0, konsol hatası 0. `inspect/report.json`, `inspect-scope.json`, `inspect.log`. Genel **1 FAIL / 4 WARN** aşağıda. |
| Bölüm + regresyon e2e | Aşağıdaki komut **exit 0; 232/232 PASS, 55,8 sn**, **0 atlanan / 0 flaky / 0 başarısız**. Chromium 1440/768/390 ve iPhone 14 WebKit; ayrıca açık Pixel 7 emülasyonu. `e2e-final.log`, `e2e-final.json`, `acceptance.json`. |
| Güvenlik / diff | Değişen uygulama kaynaklarında anahtar, özel anahtar ve debug log taraması **0 eşleşme**; `.env` commit kapsamına alınmadı. `security.json`; `git diff --check` **exit 0**. |

```sh
FRAME_SEQUENCE_DEV_URL=http://localhost:3004 PLAYWRIGHT_PORT=3114 npm run test:e2e -- \
  tests/e2e/facility.spec.ts tests/e2e/facility-wholesale-v2.spec.ts \
  tests/e2e/wholesale-form.spec.ts tests/e2e/faq-contact-footer.spec.ts \
  tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts \
  tests/e2e/upsell.spec.ts tests/e2e/payment-preview.spec.ts \
  --project=chromium-1440 --project=chromium-768 --project=chromium-390 \
  --project=webkit-iphone14 --output=test-results/104/verified
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs \
  http://127.0.0.1:3104 --out test-results/104/inspect
```

Playwright aynı checkout'un son production build'ini 3114'te başlattı. PayTR'nin credential-free geliştirme testleri, aynı checkout olarak doğrulanan mevcut 3004 geliştirme sunucusunu kullandı. İlk regresyon koşumunda eksik `FRAME_SEQUENCE_DEV_URL` ve kaldırılmış v1 kart seçicisi nedeniyle **12 FAIL / 152 PASS** görüldü; ortam tanımı ve yalnız düzen assertion'ı düzeltilerek son koşumda tamamı geçti. İlk sandbox tarayıcı başlatma hataları izinli süreç erişimiyle giderildi; özellik hatası veya başarılı test sayılmadı.

### Ekran ve tasarım kanıtı

`chromium-{1440,768,390}-{facility,map,wholesale,kvkk}.png`, `webkit-iphone14-*.png`, `pixel7-chromium-1440-reduced-*.png` ve `*-link-{0,1,2}-{focus,hover,active}.png` üretildi. Masaüstü, tablet, mobil, iPhone 14 ve Pixel 7 görüntüleri açılarak incelendi. Cihazlar tarayıcı emülasyonudur.

| Kontrol | Nerede / ölçüm | Sonuç |
| --- | --- | --- |
| Ana / nötr / vurgu | `*-audit.json`; yeşil tesis, zeytin form, fildişi yazı, altın kontroller | PASS |
| Başlık + gövde | Gerçek computed Fraunces + Figtree | PASS |
| 8 px boşluk ölçeği | Bölüm 96/64, grid 96/48/32, içerik 32/24/8 px | PASS |
| h1/h2/h3 hiyerarşisi | Bölüm h2 1440'da 72 px, 768/390'da 40 px; form h3 30/26 px; h2 en fazla iki satır | PASS |
| Kırık simetri | `chromium-1440-facility.png`: geniş metin/bilgi sütunu + dar harita; toptan solda metin/sağda form | PASS |
| Hover/focus/active, 3 bileşen | Ürün CTA, tesis toptan linki, KVKK linki; `*-link-*.png`, outline ≥2 px ve gerçek `:active` assertion'ı | PASS |
| Marka kenarlığı / gölge | Altın form kontrol sınırları; durağan gölge/kart yok | PASS |
| Tek ikon ailesi | Korunan Lucide; coğrafi SVG yalnız gerçek sınır | PASS |
| Kontrast AA | Computed renkler: tesis **9,29:1**, toptan gövde **10,89:1**, bölümde en düşük **6,22:1** | PASS |
| Yasak liste | Mor degrade, emoji, blur/kart yığını, stok 3D ve iki butonlu hero şablonu yok | PASS |

### Kapsam dışı genel inspect bulguları

- **1 FAIL `few-pictures`:** sayfanın toplam iki ayrı raster konusu var. Görev onaysız tesis fotoğrafı yerine haritayı açıkça kabul eder; bu kapıyı geçmek için onaysız fotoğraf eklenmedi.
- **4 WARN:** `palette-cream` onaylı krem palet; `no-footage` korunan kare dizisi/video sınırı; `side-scroll` önceki ürün/süreç şeridi; `pinned-over-picture` korunan hero başlığı. Eski tesis büyük paragrafının üç satır FAIL'i bu düzenle kalktı.
- AGENTS.md'nin yeniden kurgu ara görevleri kuralı uyarınca bu genel bulgular Task 104 kabulünü engellemez; global kapı 107'ye aittir. Task 104'ün kendi adımları ve kabul kontrolleri tamamlandı.

## Durum: TAMAMLANDI
