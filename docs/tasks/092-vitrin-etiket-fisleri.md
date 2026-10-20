# Task 092: Vitrin: kenarda dizili etiket fişleri

## Tür
frontend

## Amaç
≤ 6 ürün, tam ekran zeytinlik/tesis görüntüsü önünde ayakta duran etiket fişleri; her fişte gerçek satın alma kontrolleri.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: evet — ilham: horizontal scroll row (mobil)

## Adımlar
1. Bölüm 100vw×96svh, arka plan onaylı zeytinlik görseli (statik, poster); üst ortada kolon (%18'den başlar) iki kısa paragraf 28–32px fildişi, nötr scrim yalnız kolon arkasında: 'Ürünlerimiz' + resmi ürün kapsamı cümlesi (sofralık zeytin, salamura, zeytinyağı; perakende ve toptan).
2. Alt kenarda yan yana fişler (12px aralık), farklı yükseklikler (26–44svh), 2–3 tanesi 1–2° eğik; fiş = kağıt panel: üstte ince yeşil bant (etiket bandı, düz dolgu — çizgi değil), ad (Fraunces 600, 1. satır kalın), yazılmış karakterlerden ayraç ('· · · · ·'), gramaj, fiyat (tabular), stok/tükendi, adet −/+, 'Sepete ekle'. Fişin alt ucu kesilmez (satın alma kontrolleri her zaman görünür — föy uyarlaması, raporla).
3. Mobil: yatay kaydırılan sıra, fiş 72vw, sonraki fiş sağda görünür; metin 14px'in altına inmez.
4. Ürün görselleri gelince fişin üst yarısına 'tipped-in plate' olarak eklenir (şimdilik yok; boş kutu YOK).

## Kabul kriterleri
- [ ] e2e: her fişte sepete ekle çalışıyor, tükendi fişi devre dışı, mobilde yatay kaydırma + dokunma hedefleri ≥44px
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/092/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Coder Notu

20 Ekim 2026 — Bu sayfada Afina'nın teneke etiketi, kenarda dizili satın alınabilir ürün fişlerine dönüşür.

- `ProductShowcase`, tasarım sırasına göre hero'nun hemen arkasındadır. Sunucunun mevcut `getProducts()` sonucundan en fazla 6 ürün alır; isim, gramaj, fiyat ve stok değiştirilmedi. Onaylı zeytinlik posteri kullanıldı; ürün görseli ve boş görsel kutusu eklenmedi.
- Mevcut `ProductCard` satın alma davranışına `slip` görünümü eklendi. Yeşil dolgu bandı, Fraunces 600 ürün adı, yazı karakterlerinden ayraç, tabular fiyat, stok, adet ve ortak sepete ekleme korunur. Normal kart görünümü ve sepet altyapısı korunmuştur.
- Masaüstünde metin kolonu genişliğin %18'inden başlar; nötr scrim yalnız kolon arkasındadır. Fiş aralığı 12px, ilk iki fişin açısı −1° / 1,5°; diğerleri düzdür. Mobilde fiş genişliği 72vw; sonraki fiş görünür ve sıra doğal olarak yatay kayar. Reduced-motion'da eğim/giriş hareketi kaldırılır, metin ve kontroller görünür kalır.
- Föy uyarlaması: fişlerin alt ucu kesilmez. 26/44/34svh yüksekliklerine, satın alma kontrollerini sığdırmak için 23/27/25rem içerik alt sınırları uygulandı. Ölçülen masaüstü fişleri 409/432/400px; dokunma hedefleri en az 44×44px, metin en az 14px. Bölüm 100vw ve en az 96svh'dir; kısa ekranlarda içerik kadar uzar. Son WebKit koşusundaki 664px yüksekliğinde görünümde bölüm yaklaşık 802px'tir; kontroller kırpılmaz. Diğer dört kabul görünümünde bölüm 864px = 96svh'dir.
- Mobil kapsam paragrafı, uzun metni başlık gibi sıkıştırmamak için 24px'e uyarlandı; başlık 28px, masaüstü kolon metni 28–32px'tir. Bu uyarlama föyün ev kuralları önceliği ve okunurluk içindir; kapsam cümlesi korunmuştur.
- Ekran görüntüsü denetiminde koçanın fiş/metin üstüne gelebildiği saptandı ve RED testiyle tekrarlandı. Mevcut koçan hesabına fişin ve metin kolonunun bütün sınırları eklendi; kart animasyonu bitince aynı frame hesabı yenilenir. Yeni bağımsız scroll dinleyicisi eklenmedi. Son testler hem fiş hem metin kolonu için çakışma olmadığını doğrular.
- Skill'ler: frontend-patterns, motion-foundations, motion-patterns, motion-advanced, accessibility, design-system, verification-loop, tdd-workflow, profesyonel-web-sitesi. DESIGN, föy, beş referans rehberi, kit özeti ve kurulu Next.js'in server/client ve image rehberleri okundu. 21st MCP'den [shugar / Scroller, 3927](https://21st.dev/@shugar/components/scroller-1) kaynağı alındı; doğal yatay flex sırası AFİNA tokenlarına uyarlandı. Mevcut token uyarlamalı Button kullanıldı; yeni bağımlılık kurulmadı.

Doğrulama:

| Komut / kanıt | Sonuç |
|---|---|
| RED: `npm test -- tests/unit/showcase.test.tsx` | Yeni sıra ve kapsam metni eksik olduğu için 2 FAIL / 1 PASS; `test-results/092/red.log` |
| `npm test` | 11 dosya, 211/211 PASS; yeni vitrin testleri 3/3 |
| `npm run lint` | PASS, 0 uyarı |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; varlık/onay/hash denetimi 16/16 PASS |
| Tasteskill lint | 0 FAIL / 2 WARN: mevcut demo `h-screen` ve genel em-dash sayısı |
| Vitrin Playwright komutu | 25/25 PASS; Chromium 1440/768/390/320 ve iPhone 14 WebKit; sepete ekleme, tükendi, yatay sıra, 44px hedefler, klavye, reduced-motion, JS kapalı ve koçan çakışması |
| Regresyon Playwright komutu | 232/232 PASS; sepet, normal ürün kartı/hareketi ve hero regresyonları |
| Production inspect | Bu bölüm için 0 FAIL; sayfa genelinde 1 FAIL / 7 WARN, aşağıda açıklandı |
| `git diff --check` | PASS |

```sh
./node_modules/.bin/next start -H 127.0.0.1 -p 3104
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3104 npx playwright test tests/e2e/showcase.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=chromium-320 --project=webkit-iphone14
PLAYWRIGHT_PORT=3114 npx playwright test tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/upsell.spec.ts tests/e2e/product-card.spec.ts tests/e2e/card-motion.spec.ts tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts tests/e2e/hero-zeytinlik.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=webkit-iphone14
node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3104 --out test-results/092/inspect
```

3114, sepet fixture'larının kendi production webServer'ını açması içindir. Son raporlar `test-results/092/{showcase,regression}-e2e-results.json`, komut çıktıları aynı dizindeki `*-e2e.log` dosyalarındadır. Ekran görüntüleri `chromium-{1440,768,390,320}-vitrin.png`, `webkit-iphone14-vitrin.png`, her görünümün ek `*-vitrin-controls.png` dosyası ve `inspect/` altındadır; dosyalar açılıp incelendi. Büyük bir locator görüntüsü alırken WebKit viewport'u büyütebildiğinden vitrin kayıtları gerçek viewport'ta üst görünüm + kontroller olarak alındı; animasyon bitişi ve koçan konumu ölçümden önce beklendi. Bunlar tarayıcı/emülasyon kanıtıdır. `test-results/` Git tarafından ignore edilir.

Global bulgular gizlenmedi: inspect'in tek FAIL'i `few-pictures` (tüm sayfada 2 fotoğraf, global alt sınır 4). Bu görevde istenen tek onaylı poster ve görselsiz fişler korunur; diğer bölümler ve 097 kapısı tamamlandığında yeniden ölçülür. WARN'lar: palette-cream, grey-body, no-footage, measure, pinned-over-picture, still-page ve bu görevin özellikle istediği mobil side-scroll. Onaylı palet/kare dizisi korunmuştur; loop video veya onaysız görsel eklenmedi.

`npm test -- --coverage`, 211 testi geçirir ancak mevcut app-geneli eşik PASS değildir: satır %71,73, statement %69,81, function %63,63, branch %95,83. Eksik kapsam sepet/yasal route'lardadır; `test-results/092/unit-coverage.log`. AGENTS.md'nin 090–096 ara görev kuralı gereği genel fotoğraf adedi ve global coverage bu bölümün kabulünü engellemez; 097'de kapanmalıdır.

Profesyonel web sitesi görsel kanıtı:

| Kontrol | Nerede / ölçüm | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `*-vitrin.png`, `[data-product-slip]` | #243A29 / #FFFCF5 + #F5F1E7 / etiket bandı #2F7A3B; altın marka tokenı korundu |
| Başlık + gövde fontu | `style-audit.json`, h2/h3 ve kontroller | Fraunces 600 + Figtree |
| Boşluk ölçeği | Fiş, metin kolonu, sıra | 16/24/48/64/120px; 12px sıra aralığı görevin açık istisnası |
| h1/h2/h3 hiyerarşisi | Hero / `#urunler-title` / fiş adı | Korundu; başlıklar en fazla 2 satır |
| Kırık simetri | Masaüstü vitrin görüntüsü | %18 metin ankrajı, farklı yükseklikler ve iki eğik fiş |
| Hover/focus/active: 3 kontrol | `{plus,quantity,add}-{focus,active}.png`, `style-audit.json` | Adet artırma, adet alanı ve Sepete ekle; marka odak halkası ve devre dışı durumlar |
| Gölge/kenarlık | Fiş ve input | Durağan gölge/dekoratif çerçeve yok; yalnız işlevsel form kenarlığı |
| Tek ikon ailesi | Adet kontrolleri / site kabuğu | Mevcut Lucide; fişte dekoratif ikon kartı yok |
| Kontrast ≥4,5:1 | `style-audit.json` | Ana metin 11,97:1; stok 5,95:1; düğme 10,87:1; scrim üstü en açık fotoğraf varsayımında 10,38:1 |
| Yasak liste | Dört kabul ekran görüntüsü + inspect | Mor degrade, emoji, blur yığını, boş görsel kutusu ve stok 3D yok |

## Durum: TAMAMLANDI — v1; v2 (DESIGN.md Topraktan sofraya, 100–107) ile değiştirilecek
