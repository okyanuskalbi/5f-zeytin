# Task 094: Topraktan sofraya: sürüklenen anlar şeridi

## Tür
frontend

## Amaç
Altı anlık süreç şeridi (Hasat, Seçim, Kırma, Salamura, Dolum, Sofrada), yatay sürüklenir, ilerleme çubuğu.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: evet — ilham: drag carousel + progress bar

## Adımlar
1. Föy 'Drag row of moments' geometrisi: başlık 'Topraktan sofraya', sağda geri/ileri kare düğmeler, altında 6px ilerleme çubuğu (düz dolgu), 280px kolonlar, scroll-snap, değişen boşluklar, 4:5 görsel.
2. Metinler: her an için 1 satır başlık + ≤ 3 satır. **İddia kuralı:** yöntem/süre/sıcaklık/katkısız gibi teknik iddia YOK; genel, doğrulanabilir ifadeler; her metin `docs/teyit/surec.md` listesine 'kullanıcı teyidi bekliyor' olarak yazılır ve UI'da ancak teyit sonrası açılır — o zamana kadar yalnız başlıklar + resmi belgeden türeyen tek cümle ('Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.').
3. Görseller: şimdilik onaylı zeytinlik/tesis kırpımları (4:5); Atlas üretimi ayrı onaylı görev.
4. Mobil: 72vw kolonlar, düğmeler yok, çubuk kalır.

## Kabul kriterleri
- [ ] e2e: sürükleme/klavye ile ilerleme, çubuk ilerliyor; teyitsiz süreç metni UI'da yok
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/094/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Coder Notu

20 Ekim 2026 — Afina'nın teneke etiketinin kağıt/yeşil baskı dili bu bölümde soldan sağa okunan altı anlık fotoğraf şeridine dönüştü. Ana/nötr/vurgu #243A29 / #F5F1E7 / #D4B483; Fraunces 600 başlıklar ve Figtree gövde korunmuştur. DESIGN, föyün tamamı, kit özeti, beş tasarım rehberi, kurulu Next.js server/client, CSS ve image rehberleri okundu. Kullanılan skill'ler: frontend-patterns, motion-foundations, motion-patterns, motion-advanced, accessibility, design-system, verification-loop, profesyonel-web-sitesi ve TDD.

- `Moments` landing'de Tesisimiz'den sonra, toptan bölümünden önce yer alır. Masaüstünde 280px kolon / 32px aralık, mobilde 72vw / 16px; altı fotoğraf 4:5 oranındadır. Değişen dikey aralıklar masaüstü 80/128/96/136/112/80px, mobil 32/64/40/56/48/32px. Düğmeler 48×48px, mobilde gizlidir; 6px düz ilerleme çubuğu kalır. Şerit viewport kenarlarına taşar, belge yatay taşmaz.
- Fareyle görsel üzerinden sürükleme, doğal touch/trackpad kaydırması, sağ/sol oklar ve Home/End çalışır. Fare sürüklemesi için 8px eşik, pointer capture ve bırakma/iptal temizliği vardır; touch/pen olayları yakalanmaz veya iptal edilmez. Scroll-snap bırakmada geri gelir. Çubuk gerçek yatay scroll konumundan %0–100 hesaplanır; baş/son düğmeleri sınırlarda kapanır. `ul/li`, adlandırılmış kontroller, klavye yönergesi, görünür focus ve ARIA progress değeri mevcuttur. Otomatik oynatma yoktur.
- UI'daki tek açıklama resmi hikâyenin ilk cümlesidir: **“Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.”** Altı başlık görevdeki sıradadır. Adım 2'nin açıkça istediği `docs/teyit/surec.md` teyit listesi oluşturuldu; bu, göreve özel belge yazımı olarak uygulandı. Altı kısa açıklama adayı **kullanıcı teyidi bekliyor**, hiçbirisi runtime'a import edilmez; HTML/RSC içinde bulunmadıkları e2e ile denetlenir. Bu dosyaya teyit yazılması otomatik yayın yapmaz; metinleri açmak ayrıca kod değişikliği ve test gerektirir. Yöntem/süre/sıcaklık/katkısızlık iddiası eklenmedi.
- Fotoğraflar yalnız manifestte `approved / runtime=true` olan `/images/hero/zeytinlik-1200.webp` kaynağının altı farklı CSS kırpımıdır; yeni veya altı ayrı süreç fotoğrafı değildir. Kaynak dosya/hash/onay değişmedi, tarayıcı aynı dosyayı önbellekten paylaşır. Dekoratif `alt=""`, lazy loading ve sabit 4:5 alan kullanılır; kırpımların üretim aşamalarını belgelediği iddia edilmez. Onaysız tesis adayları runtime'a alınmadı; Atlas üretimi yapılmadı.
- [21st appica-dev Carousel / progress, demo 34485](https://21st.dev/@appica-dev/components/carousel) MCP ile arandı ve tam kodu alındı. Önceki/sonraki kontrolü ve scroll kaynaklı progress yaklaşımı uyarlandı; föyün native scroll-snap geometrisi kullanıldı. Embla/eklenti kurulmadı; mevcut token uyarlamalı Button ve Lucide oklar kullanıldı. Yeni shadcn bileşeni veya bağımlılık eklenmedi.
- Girişler `motion/react` ile 16px, 80ms sıralama ve tek seferdir; SSR baştan görünürdür. Reduced-motion ve düşük güçlü cihazda giriş dönüşümleri kapalı, klavye ilerlemesi anlıktır. Odak veya pointer girişi animasyonu kesip içeriği son konuma getirir. Görsel/JS/observer yokluğu başlıkları gizlemez; JS kapalıyken doğal yatay kaydırma ve içerik kalır, dinamik çubuk/düğmeler JS gerektirir.
- Ekran görüntüsünde mevcut etiket koçanının şeritle çakışması ölçüldü: RED testinde **5915,625px²**. `HeroLabel`'ın mevcut çakışma hesabına bu bölümün sabit sınırı eklendi; güvenli yer bulunmazsa yinelenen koçan bölüm boyunca gizli/inert kalır. Header sepeti erişilir; bölüm çıkışında koçan normal yerleşimine döner. Ayrı scroll dinleyicisi eklenmedi. Son bölüm testi dört kaydırma konumunda çakışma alanını 0 ölçer. Hero hareketi, sepet/PayTR altyapısı ve diğer onaylı içerik korunmuştur.

### Komutla doğrulama / TDD

| Komut / kanıt | Sonuç |
|---|---|
| RED `npm test -- tests/unit/moments.test.tsx` | Bölüm yoktu, 3 test FAIL; `red.log`, commit `f13d6e7` |
| GREEN aynı komut | 3/3 PASS; `green.log`, uygulama commit'i `d95f62f` |
| Koçan RED e2e | 5915,625px² çakışma; `stub-red.log`, test commit'i `0b475b5` |
| `npm test` | 13 dosya, **219/219 PASS** |
| `npm run lint` / `npm run typecheck` / `npm run build` | PASS, lint 0 uyarı |
| `npm run check:assets` (prebuild dahil) | **18/18 PASS**; kaynak/hash/onay/runtime kapıları korunur |
| Tasteskill lint | **0 FAIL / 2 WARN**: mevcut demo h-screen, genel em-dash sayısı |
| Bölüm e2e, production :3104 | **35/35 PASS**; Chromium 1440/768/390/320 + iPhone 14 WebKit |
| Sepet/hero/vitrin/tesis regresyonları | İlk koşuda **274/276 PASS**; eski görünürlük varsayımı güncellenen koçan testi dört görünümde **4/4 PASS**. 276 senaryonun son sonuçları başarılı; ayrıntı aşağıda |
| Production inspect, son build | **0 FAIL / 5 WARN**; aşağıda açıklanmıştır |
| Chromium native touch, Pixel 7 emülasyonu | CDP touchStart/Move/End ile yatay scroll **215px**, ilerleme **%21**; dikey scroll 3007→3192px, kilit yok |
| iPhone 14 WebKit yatay 844×390 | Belge yatay taşması yok; `webkit-iphone14-landscape.png` |

```sh
npm test
npm test -- --coverage
npm run lint
npm run typecheck
npm run build
./node_modules/.bin/next start -H 127.0.0.1 -p 3104
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3104 PLAYWRIGHT_JSON_OUTPUT_FILE=test-results/094/moments-results.json npx playwright test tests/e2e/moments.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=chromium-320 --project=webkit-iphone14 --reporter=list,json --output=test-results/094/moments-artifacts
PLAYWRIGHT_PORT=3114 PLAYWRIGHT_JSON_OUTPUT_FILE=test-results/094/regression-results.json npx playwright test tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/upsell.spec.ts tests/e2e/product-card.spec.ts tests/e2e/card-motion.spec.ts tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts tests/e2e/hero-zeytinlik.spec.ts tests/e2e/showcase.spec.ts tests/e2e/facility.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=webkit-iphone14 --reporter=list,json --output=test-results/094/regression-artifacts
node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3104 --out test-results/094/inspect
node test-results/094/evidence.mjs
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3104 PLAYWRIGHT_JSON_OUTPUT_FILE=test-results/094/hero-cart-results.json npx playwright test tests/e2e/hero-motion.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=webkit-iphone14 -g 'restored mixed cart' --reporter=list,json --output=test-results/094/hero-cart-artifacts
git diff --check origin/main
```

E2e garantileri: altı başlık/sıra, yalnız resmi açıklama, teyitsiz metnin HTML'de yokluğu, onaysız medya isteği yokluğu, kolon/görsel/boşluk/düğme ölçüleri, klavye ve iki yönlü çubuk, fare sürüklemesi, snap temizliği, reduced-motion + canlı tercih değişimi, JS kapalı içerik/doğal ok kaydırması, medya hatası, touch olaylarında capture/iptal olmaması ve koçan çakışması. Mobil WebKit mouse wheel desteklemez; bu tarayıcıda programatik native scroll yolu, klavye ve pointer davranışı ölçülür. Gerçek tarayıcı touch sürüklemesi ayrıca Chromium CDP'de doğrulanmıştır. Bunlar emülasyon kanıtıdır; fiziksel telefon/canlı yayın kabulü değildir.

İlk sandbox tarayıcı başlatması macOS MachPort izninde engellendi; yerel browser komutları yetkili sandbox dışı süreçlerde çalıştırıldı. Test geliştirmesinde native End/no-JS ve mobil WebKit wheel varsayımları düzeltildi. Build yenilenirken eski sunucu ile başlamış ara koşu durduruldu; son kabul koşuları sabit son build ile ayrı başlatılmış sunuculardadır. Ara çıktılar silinmedi. `moments-results.json`: 35 PASS. `regression-results.json`: 274 PASS + 2 FAIL (koçanın her ekran konumunda görünür olduğunu varsayan eski hero testi). Bu test artık güvenli yer yoksa gizli/inert koçanı kabul ederken header sepetini gerçekten açıp **3 adet / 825,50 ₺** tutarını ve kapatma sonrası odak dönüşünü doğrular; görünür koçanda başlık çakışması kontrolü aynen sürer. Yalnız bu test dört görünümde yeniden çalıştırıldı: `hero-cart-results.json` **4 PASS / 0 FAIL**. Böylece önceki iki hata kapatıldı; diğer 272 regresyon ve yeniden doğrulanan 4 senaryo toplam 276 başarılı sonuçtur. Değişmeyen testler gereksiz tekrar çalıştırılmadı.

Kanıtlar `test-results/094/` altındadır (gitignore): komut logları, JSON ölçümler, `chromium-{1440,768,390,320}-moments.png`, `webkit-iphone14-moments.png`, reduced-motion görüntüleri, kontrol focus/active görüntüleri, native touch ve yatay iPhone görüntüsü; `inspect/` içinde production ölçümleri ve sayfa görüntüleri. Görüntüler açılarak incelendi. Şeridin çerçevesi yalnız klavye focus outline'ıdır; durağan dekoratif kenarlık değildir.

### Profesyonel web sitesi kanıtı

| Kontrol | Nerede / ölçüm | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `style-audit.json`, `*-moments.png` | #243A29 / #F5F1E7 / #D4B483; yeni renk yok |
| Başlık + gövde fontu | `*-metrics.json`, `style-audit.json` | Fraunces 600 + Figtree |
| 8px boşluk ölçeği | Bölüm / kolon / fotoğraf | 8/16/24/32/48/64/80/96/112/128/136px; 6px çubuk föyün işlevsel ölçüsüdür |
| h1/h2/h3 | Hero / Topraktan sofraya / anlar | Semantik h2/h3; başlık ≤2 satır; an başlıkları tek satır |
| Kırık simetri | `*-moments.png` | Dikey aralıkları değişen 4:5 kırpımlar, sağda sonraki kolon görünür |
| Hover/focus/active: 3 kontrol | `previous-*`, `next-*`, `strip-*`, `style-audit.json` | Önceki/sonraki: renk/press/2px focus; şerit: grab/grabbing ve 2px focus |
| Gölge / kenarlık | Bölüm ve kontrol ölçümleri | Durağan gölge/dekoratif çerçeve yok; marka yeşili işlevsel focus |
| Tek ikon ailesi | İki ok düğmesi | Lucide outline |
| Kontrast ≥4,5:1 | `style-audit.json` | Yeşil/fildişi 10,87:1; gövde/fildişi 15,67:1; ikincil metin/fildişi 5,40:1 |
| Yasak liste | Lint/inspect + açılan görüntüler | Mor degrade, emoji, blur kart yığını, stok 3D veya boş görsel kutusu yok |

AGENTS.md 090–096 ara görev kuralına göre global bulgular: `npm test -- --coverage` **219 test PASS**, app-geneli coverage eşiği FAIL (satır %71,73; statement %69,81; function %63,63; branch %95,83). Kapsam dışı sepet/yasal route'ların eksik unit coverage'ı `unit-coverage.log` içindedir; 097 global kapısına kalır. Inspect WARN: palette-cream (onaylı marka), no-footage (korunan kare dizisi video elementi değildir), side-scroll (bu görevin açıkça istediği carousel + mevcut vitrin), measure (mevcut uzun resmi tesis paragrafı), pinned-over-picture (mevcut hero). Bu bölümde FAIL yok; onaylı palet/video/metinler bu uyarılar için değiştirilmedi.

Kod farkı/sır taraması: `git diff --check origin/main` PASS; eklenen TypeScript/TSX/CSS satırlarında özel anahtar, gömülü token/şifre veya debug log yok (`security-audit.json`). Task dışı ürün, fiyat, stok, görsel onayı, ödeme, DB/auth ve servis ayarı değiştirilmedi.

## Durum: TAMAMLANDI
