# Task 091: Hero: etiket kartı, loş zeytinlik, canlı seçim

## Tür
frontend

## Amaç
Föy 'Card over a dim room': onaylı zeytinlik kare dizisi kararmış tam ekran; ortada Afina teneke etiketi dilinde kart; ürün/boy seçimi kartı 'yeniden basar'; scroll'da kart sol alta koçan olur ve sepet özeti gösterir.

## Bağlam
Yeniden kurgu — **önce `docs/DESIGN.md` (tamamı), föy (`node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`) ve `~/PROJELER/AFINA-KAYNAK/kitler/ozet.md` okunur.** Korunanlar (fontlar, renkler, logolar, onaylı zeytinlik görseli/videosu, ScrollFrameSequence, sepet altyapısı, PayTR önizleme, resmi metinler) DEĞİŞMEZ. Kullanıcı (20 Eki): "ZEYTİN PROJESİNİDE VERDİĞİM PDFLERE GÖRE BAŞTAN KURGULA".

## Kullanılacak araçlar
- ECC skill: frontend-patterns, motion-patterns, motion-advanced, accessibility, design-system, verification-loop
- Skill: `profesyonel-web-sitesi`; rehber `~/.claude/skills/design-taste-frontend/references/{layout,type,colour,motion,imagery}.md`
- 21st MCP: evet — ilham: sticky shrink kart, segment seçici (uyarla)

## Adımlar
1. Arka plan: 086'daki zeytinlik ScrollFrameSequence + poster, `filter: brightness(0.7)`.
2. Etiket kartı (kol 4–10, ~55% genişlik, ~62% yükseklik, kare köşe): sol ve sağ kenarda dikey yeşil bantlar (`#2F7A3B`, referans etiketteki gibi), beyaz orta alan, üstte AFİNA wordmark (onaylı logo, dark değil), ortada düz altın kurdele üzerinde seçili ürün adı (Fraunces 600), altında gramaj büyük ('10 KG'), fiyat tabular; 'Kökü toprakta. Yeri sofrada.' iki satır başlık; alt kenarda: solda 'Osmaniye / Düziçi' 14px, ortada 'Sepete ekle' düz düğme, sağda 'Tüm ürünler' linki.
3. Canlı öğe: ürün ve boy seçici (segment/radyo, klavye erişilebilir) → kart içeriği 200 ms çapraz geçişle değişir; veri `getProducts()` (geçici sabit veri, 030 sözleşmesi).
4. Sticky küçülme: scroll'da kart `transform: scale` + translate ile sol alta 120px koçan; koçan: sepet adedi · toplam · 'Sepete git'. Sepet boşsa koçan 'Ürünlere göz at'. reduced-motion: koçan yok, sepet üst çubukta.
5. Mobil: video 100svh, kart tam genişlik −16px, 70svh; başlık 9vw iki satır; düğme kart alt kenarında tam genişlik; koçan sol altta güvenli alan içinde.

## Kabul kriterleri
- [ ] e2e: seçim değişince ad/gramaj/fiyat değişiyor, sepete ekleme sepeti güncelliyor; scroll sonrası koçan görünür ve sepet özetini doğru gösteriyor; reduced-motion statik
- [ ] Mobil WebKit: başlık ilk ekranda tam görünür (kesilme yok)
- [ ] `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` → FAIL yok
- [ ] production (`next build && next start -p 3104`) üzerinde `inspect.mjs http://127.0.0.1:3104` → bu bölüm için FAIL yok; 1440/768/390 + iPhone 14 (WebKit) ekran görüntüleri `test-results/091/`
- [ ] lint/typecheck/build; ilgili e2e (reduced-motion + mobil WebKit dahil); sepet testleri bozulmaz

## Coder Notu

20 Ekim 2026 — 091'in hero kapsamı tamamlandı.

- Bu sayfada Afina'nın teneke etiketi, ürün seçilip sepete eklenen kart ve scroll sonrasında sepet koçanı olur. Onaylı normal logo, Fraunces/Figtree, marka tokenları ve zeytinlik poster/kare dizisi kullanıldı. `ScrollFrameSequence` ve sepet altyapısı korundu.
- Veri, Home'un `getProducts()` okumasından gelir; aynı ≤6 ürün Hero'ya aktarılır. Mevcut temsili katalogda ürün başına tek boy vardır; seçenekler bu veriden türetilir. Birden fazla gerçek boy verildiğinde aynı adlı ürünün ilgili SKU'su seçilir; bu davranış birim testinde doğrulandı. Katalog/fiyat/gramaj eklenmedi.
- Ürün/boy radyoları ok tuşları, Home/End ve tek tab durağıyla çalışır. Kart içeriği 200 ms çapraz geçiş yapar. Stok, ekleme hatası, boş katalog ve JS kapalı ürün/sepet bağlantıları ele alındı.
- Kart scale + translate ile 120px koçana iner; adet ve tutar ortak sepetten hesaplanır. Koçan, sonraki bölümlerin metin/kontrolleriyle çakışırsa en yakın boş alana çekilir; dokunma hedefi ≥44px ve güvenli alan korunur. Sayfadan çıkışta bekleyen ölçüm çağrıları güvenle sonlanır.
- Reduced-motion, düşük donanım ve çok kısa yatay ekranlarda kart statiktir; koçan yerine üst çubuktaki sepet erişimi sürer. Poster/CTA ve içerik erişilir kalır.
- Kullanılan skill'ler: frontend-patterns, motion-foundations, motion-patterns, motion-advanced, accessibility, design-system, verification-loop, tdd-workflow, profesyonel-web-sitesi. Tasarım föyü, beş referans rehberi ve kit özeti okundu. 21st MCP'den [Stacking Cards / 25275](https://21st.dev/@danielpetho/components/stacking-cards) ile [Segmented Control / 23552](https://21st.dev/@ddoemonn/components/segmented-control) kaynakları alınıp uyarlandı. Mevcut token uyarlamalı Button kullanıldı.

Doğrulama:

| Komut / kanıt | Sonuç |
|---|---|
| RED: `npm test -- tests/unit/hero-label.test.tsx` | HeroLabel henüz olmadığı için beklenen eksik uygulama hatası; ardından uygulama yazıldı |
| `npm test` | 10 dosya, 208/208 test PASS; yeni hero testleri 4/4 |
| `npm run lint` | PASS, 0 uyarı |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; varlık/onay/hash kontrolü 16/16 PASS |
| `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` | 0 FAIL, 2 WARN: mevcut demo `h-screen` ve genel em-dash sayısı |
| Aşağıdaki Playwright komutu | 200/200 PASS; 0 skipped, 0 flaky; Chromium 1440/768/390 ve iPhone 14 WebKit emülasyonu |
| Production `inspect.mjs` | Hero kapsamı 0 FAIL; genel rapor 1 FAIL / 6 WARN. Tek FAIL `few-pictures`: tüm sayfada henüz yalnız 1 fotoğraf var. 092–096 bölümleri ve global 097 kapısına ait bulgu korunarak raporlandı |
| Görünüm / kontrast | Heroda 1440/768/390'da başlık 2 satır; WebKit ilk ekran geometrisi PASS. Metin/kurdele 6,22:1; düğme 10,87:1; beyaz üzerinde zeytin yeşili 12,26:1 |

```sh
PLAYWRIGHT_PORT=3114 npx playwright test tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts tests/e2e/hero-zeytinlik.spec.ts tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/upsell.spec.ts --project=chromium-1440 --project=chromium-768 --project=chromium-390 --project=webkit-iphone14
./node_modules/.bin/next start -H ::1 -p 3104
node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs 'http://[::1]:3104' --out test-results/091/inspect
```

3104'ün IPv4 adresinde başka proje dinlediği için o sürece dokunulmadı; ZEYTİN production aynı portun IPv6 adresinde doğrulandı. Sepet fixture'ları `PLAYWRIGHT_BASE_URL` ile çalışmayı açıkça reddettiğinden bütünleşik 200 test, kendi yerel production webServer'ını 3114'te açtı. İlk yanlış IPv4 hedefi ve fixture modu denemeleri kabul kanıtı sayılmadı. Son rapor `test-results/091/final-e2e-results.json`, komut çıktısı `test-results/091/final-e2e.log` içindedir.

Global coverage: `npm test -- --coverage` testlerin tamamını geçirir; ancak mevcut app-geneli eşik PASS değildir: satır %72,34, statement %70,37, function %66,66, branch %96,15. Eksik kapsam sepet/yasal route'larda; rapor `test-results/091-unit-coverage.log`. AGENTS.md'nin 090–096 ara görev kuralı gereği global coverage ve genel görsel adedi bu görevin tamamlanmasını engellemez; 097'de kapanır. Inspect WARN'ları: palette-cream, grey-body, no-footage, measure, pinned-over-picture, still-page. Onaylı kare dizisi loop videoya çevrilmedi.

Profesyonel web sitesi görsel kanıtı (dosyalar `test-results/091/` altında, Git tarafından ignore edilir):

| Kontrol | Ekran görüntüsü / seçici | Sonuç |
|---|---|---|
| Ana / nötr / vurgu | `inspect/desktop-fold.jpg`, `[data-hero-card]` | #243A29 / beyaz + #F5F1E7 / #D4B483; etiket bantları #2F7A3B |
| Başlık + gövde fontu | `style-audit.json`, `#hero-title`, body | Fraunces 600 + Figtree 400/600 |
| Boşluk ölçeği | `[data-hero-card]` | ana gap 8px; padding 16/24/32px; kontrol mikro aralıkları 4/8px |
| h1/h2/h3 hiyerarşisi | `inspect/desktop-fold.jpg`, `inspect/desktop-page-02.jpg` | slogan h1; ürün adı h2; vitrin ürünleri h3; başlık ≤2 satır |
| Kırık simetri | `inspect/desktop-fold.jpg` | 55% kart, kolon 4–10 yönünde sağa kaydırılmış; tam ekran fotoğraf |
| Hover/focus/active: 3 kontrol | `segment-{focus,active}.png`, `add-{focus,active}.png`, `products-{focus,active}.png`, `style-audit.json` | segment, Sepete ekle, Tüm ürünler; koyu yeşil odak halkası, ≥44px hedef |
| Marka gölge/kenarlığı | `[data-hero-card]`, odak kontrolleri | durağan gölge ve dekoratif çerçeve yok; işlevsel odak halkası marka yeşili |
| Tek ikon ailesi | Hero / mevcut Navbar | hero tipografik; çevrede mevcut Lucide |
| Kontrast ≥4,5:1 | `style-audit.json` + e2e piksel ölçümleri | PASS; 6,22 / 10,87 / 12,26 |
| Yasak liste | `inspect/desktop-fold.jpg`, `inspect/tablet-fold.jpg`, `inspect/mobile-fold.jpg`, `webkit-iphone14-hero.png` | mor degrade, emoji, blur yığını, iki CTA şablonu ve stok 3D yok |

## Durum: TAMAMLANDI — v1; v2 (DESIGN.md Topraktan sofraya, 100–107) ile değiştirilecek
