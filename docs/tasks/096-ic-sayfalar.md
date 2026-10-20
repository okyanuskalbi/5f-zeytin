# Task 096: İç sayfalar aynı etiket dilinde

## Tür
frontend

## Amaç
Sepet, ödeme önizleme, hesap yer tutucusu, sipariş takip, yasal sayfaları yeni dile taşı.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: hayır

## Adımlar
1. Sepet sayfası ve çekmece: kağıt panel, fiş dili, upsell (039) korunur.
2. `/odeme-onizleme` (PayTR iframe çevresi): MLNEW düzeni + etiket dili; iframe dokunulmaz.
3. Yasal sayfalar (073 taslakları): okuma tipografisi, satıcı bilgileri SIRKET.md'den.
4. 404 ve boş durumlar.

## Kabul kriterleri
- [ ] e2e: sepet akışı, PayTR önizleme sayfası (anahtarsız uyarı modu), yasal sayfalar 3 tarayıcıda
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/096/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Coder Notu

20 Ekim 2026. İç sayfa uygulaması ve davranış kontrolleri tamamlandı; **iç sayfalara uygulanan inspect kapısında üç kural FAIL kaldığı için Durum BEKLİYOR**.

### Uygulama

- PLAN, DESIGN (tamamı), föy, dört kit özeti, layout/type/colour/motion/imagery rehberleri ve `AFINA-KAYNAK/sirket/SIRKET.md` okundu. Görevdeki ECC frontend-patterns, motion-patterns/advanced, accessibility, design-system, verification-loop; ayrıca motion-foundations, tdd-workflow ve profesyonel-web-sitesi kullanıldı. Görevin “21st MCP: hayır” tercihi izlendi; yeni paket/skill kurulmadı. Next 16.4.2'nin yerel layouts/pages ve not-found rehberleri okundu.
- Marka kararı: mevcut Fraunces/Figtree, zeytin mürekkebi/fildişi/şampanya altını, kare buton ve 8px boşluk sistemi. `InnerPage.module.css` kağıt yüzeyleri, yeşil etiket bandını, altın özet şeridini ve okuma ölçüsünü ortaklaştırır. Dekoratif çerçeve, gölge, yeni medya veya animasyon eklenmedi.
- Sepet sayfası ve drawer fiş düzenine taşındı; gövde metinleri 16px, adet/fiyatlar tabular kaldı. Boş sepete ürünlere dönüş eklendi. Store, fiyat/stok doğrulaması, persistence, odak tuzağı/iadesi ve 039 upsell/indirim koşulları korundu.
- Ödeme önizlemesinde solda temsili kart/özet/bilgilendirme, sağda PayTR alanı; dönüşler ortak kağıt boş durum düzeninde. `PaytrFrame` iframe/resizer kodu, token isteği ve production 404 kapısı değiştirilmedi. Yerel anahtarsız uyarı ve mock iframe testi gerçek ödeme kabulü değildir.
- Üç yasal taslak ortak `LegalDocument` ile okuma düzeninde; kamuya açık unvan, adres, VD/VKN eklendi. Taslak/noindex/onay bekleme durumu korundu. Eksik telefon/e-posta/MERSİS uydurulmadı, politika/sözleşme hükümleri yazılmadı.
- `/hesabim`, `/siparis-takip` henüz kapalı hizmetleri açıklayan veri toplamayan yer tutucular; kök 404 geri dönüş CTA'sıyla tamamlandı. DB/auth/ödeme entegrasyonu yapılmadı; ilgili ONAY GEREKLİ kapıları açılmadı.

### TDD ve komut kanıtı

Yolculuklar: onaylı satıcı bilgisini taslaktan okumak; boş hizmetten ürünlere dönmek; sepeti drawer/sayfa arasında düzenleyip yenilemek; anahtarsız PayTR uyarısını ve production korumasını görmek.

| Komut / kanıt | Sonuç |
|---|---|
| RED: `npm test -- tests/unit/interior-pages.test.tsx` | Eksik satıcı bölümü için **3 beklenen FAIL**, `test-results/096/red.log`; checkpoint `3ff402a` |
| GREEN: aynı hedef | **3/3 PASS**, `green.log`; checkpoint `9233b40` |
| Son `npm test -- --coverage` | **17 dosya, 248/248 PASS**; statement %87,50, branch %95,83, function %92,85, line %91,83; tüm global eşikler PASS (`unit-coverage.log`) |
| `npm run lint` / `npm run typecheck` / `npm run build` | **PASS**; varlık/hash/onay kontrolü **18/18 PASS**, `lint.log`, `typecheck.log`, `build.log` |
| `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` | **0 FAIL / 2 WARN**; mevcut demo h-screen ve genel uzun tire kullanımı (`taste-lint.log`) |
| Production `interior-pages.spec.ts` + `legal.spec.ts` | **72/72 PASS**; Chromium 1440/768/390/320, Firefox 1440/390, WebKit 390 ve iPhone 14 (`interior-e2e.log`) |
| Sepet `cart-wire`, `cart-drawer`, `cart-page`, `upsell` | **84/84 PASS**; Chromium 1440, Firefox 390, WebKit iPhone 14 (`cart-regression.log`) |
| Geliştirmede `payment-preview.spec.ts` | **42/42 PASS**; Chromium 1440/768/390/320, Firefox 390 ve WebKit iPhone 14; reduced-motion, anahtarsız uyarı, mock iframe/resizer, hata/tekrar deneme, sonuç URL'sinin ödeme teyidi olmaması (`payment-e2e.log`) |
| Ekran/stil ölçümü | **64 kayıt, 73 PNG**, 1440/768/390 + iPhone 14, yatay taşma yok; içerik başlıkları en fazla iki satır (`capture.log`, `style-audit.json`) |
| `git diff --check`, eklenen satırlarda sır/debug taraması | **PASS**, şüpheli ekleme yok; env dosyaları değiştirilmedi |

Tarayıcı komutları:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3104 npx playwright test tests/e2e/interior-pages.spec.ts tests/e2e/legal.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=chromium-320 --project=firefox-1440 --project=firefox-390 --project=webkit-390 --project=webkit-iphone14 --output=test-results/096/interior-playwright --reporter=list
PLAYWRIGHT_PORT=3114 npx playwright test tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/upsell.spec.ts --project=chromium-1440 --project=firefox-390 --project=webkit-iphone14
PLAYWRIGHT_BASE_URL=http://localhost:3004 npx playwright test tests/e2e/payment-preview.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=chromium-320 --project=firefox-390 --project=webkit-iphone14 --output=test-results/096/payment-playwright --reporter=list
```

Production `next start -H 127.0.0.1 -p 3104` ile çalıştırıldı. Mevcut geliştirme sunucusu localhost:3004 kullanıldı, kullanıcı süreci kapatılmadı. Production'da `/odeme-onizleme`, iki sonuç URL'si ve token endpoint'i **404**; önizleme kabulü bu korumayı açarak yapılmadı. İlk sandbox tarayıcı süreçleri işletim sistemi tarafından engellendi; kontroller izinli sandbox dışı yerel tarayıcı süreçlerinde tekrarlandı. İlk 127.0.0.1 geliştirme hedefindeki Origin 403, sunucunun localhost adresiyle düzeldi; backend koruması değiştirilmedi. Tekrarlı gezinmedeki 304 farkı test URL'sine hareket tercihi eklenerek giderildi. İlk paralel Playwright koşularının ortak artifact klasörü çakışması son koşularda ayrı output dizinleriyle giderildi.

Ekran ölçümünde ödeme dönüş başlığı dar iki kolon nedeniyle üç satıra düştü (`capture-red.log`); boş durum başlığı tek sütuna alınarak düzeltildi. Kalıcı ödeme e2e'sine iki satır kontrolü eklendi ve 42 test PASS oldu. Görüntüler açılıp incelendi. `test-results/096/` gitignore kapsamındadır; bunlar yerel tarayıcı/emülasyon kanıtıdır, fiziksel cihaz veya canlı yayın kabulü değildir.

### Kalan kapı: inspect iç sayfa kuralları

```sh
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3104 --out test-results/096/inspect-home
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3104/sepet --out test-results/096/inspect-cart
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3104/mesafeli-satis --out test-results/096/inspect-legal
```

- İstenen kök URL komutu: **0 FAIL / 5 WARN**. Sepet: **3 FAIL / 3 WARN**. Mesafeli satış: **3 FAIL / 2 WARN**. Ham raporlar ve 1440/768/390 görüntüleri ilgili `inspect-*` dizinlerinde.
- İki iç sayfada aynı üç FAIL: `few-pictures` (en az dört gerçek görsel), `focal-point` (büyük hero yazısı veya ekranın üçte birini kaplayan görsel), `still-page` (en az sekiz hareketli öğe). Korunan fildişi palet/video olmaması ve sepetin ikincil metni ayrıca WARN.
- Bu ölçer, iç sayfalara da landing yoğunluğu uyguluyor. Dört fotoğraf/video ve sekiz hareketli öğe eklemek, bu görevin okuma/fiş düzenini ve tek canlı öğe kararını genişletir; yeni görsel onayı da yok. Plan kendiliğinden değiştirilmedi, `--allow` ile FAIL'ler bastırılmadı.
- **Claude'un iç sayfalara uygun inspect kapsamını/istisnasını task veya DESIGN içinde açıkça tanımlaması ya da bu üç kuralı sağlayacak yeni düzeni planlaması gerekiyor.** AGENTS.md: “Kendi bölümüne ait bir FAIL varsa görev BEKLİYOR kalır.” Bu nedenle kök inspect ve davranış testleri geçse de TAMAMLANDI yazılmadı.

### Profesyonel web sitesi kanıtı

| Kontrol | Nerede / ölçüm | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `chromium-1440-cart-filled.png`, `*-payment-warning.png` | #243A29 / #F5F1E7, kağıt #FFFCF5 / #D4B483; yeşil etiket bandı |
| Başlık + gövde fontu | `style-audit.json`, h1/h2 ve metin | Fraunces 600 + Figtree, 16px gövde; mevcut beş adımlı ölçek |
| 8px boşluk sistemi | Kağıt/fiş/okuma alanları | Panel 24/32px, aralar 16/24/32px, sayfa 32/48/64/96px; ölçümler JSON'da |
| h1/h2/h3 hiyerarşisi | `*-mesafeli-satis.png`, `*-cart-filled.png`, dönüşler | Başlıklar ≤2 satır; yasal kapsam başlığı 16px Figtree |
| Kırık simetri | Masaüstü sepet/ödeme/yasal | Sepet 1:0,65; ödeme 0,85:1,15; okuma paneli %25 başlangıç çizgisinde |
| Hover/focus/active, üç kontrol | `*-{quantity,refresh,return}-{focus,active}.png` | 2px görünür odak; adet 44×44px, diğerleri ≥44px; mevcut hover/press/reduced-motion korunur |
| Marka kenarlığı / gölge | Kağıt/fiş ve kupon alanı | Durağan gölge/dekoratif çerçeve yok; kuponun işlevsel alanı ve zeytin odak rengi korunur |
| Tek ikon ailesi | Sepet kontrolleri | Mevcut Lucide; yeni aile eklenmedi |
| Kontrast ≥4,5:1 | Token renklerinden hesaplandı | Yeşil/fildişi 10,87:1; gövde/kağıt 17,25:1; ikincil/kağıt 5,95:1; yeşil/altın 6,22:1 |
| Yasak liste | Lint ve açılan ekranlar | Mor degrade, emoji, glass/blur yığını, stok 3D, onaysız medya yok |

## Claude kararı (20 Eki)
Kabul (248 unit + 198 e2e, lint/typecheck/build). İç sayfalardaki 3 FAIL landing yoğunluk kurallarıdır → DESIGN.md 'İç sayfa denetim istisnası' ile `--allow few-pictures,focal-point,still-page`; diğer kurallar 097 kapısında FAIL 0.

## Durum: TAMAMLANDI
