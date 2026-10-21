# Task 113: Kışlık kiler vitrini (raf + kraft fiyat etiketi + hızlı görünüm)

## Tür
frontend

## Amaç
Taslak B'nin orta bölümü: yeşil kiler duvarında ceviz raflar.
- Ürünler HTML ile rafa oturur.
- Her ürünün sicimli kraft etiketi çalışan bir fiyat etiketidir: ad, boy, fiyat, Ekle.
- Ürüne dokununca hızlı görünüm açılır.

Sayfanın ana satış bölümü budur.

## Bağlam
- Bağımlılık: 111, 112 TAMAMLANDI.
- Oku: `docs/DESIGN.md` v3 bölüm 2 ve "Hareket"; `mix-b.webp` orta bölüm ("Kışlık kiler" başlığı + 2 raf).
- Katalog aile + varyant modeli 111'de kuruldu. En fazla 6 SKU. Admin'den gelecek ürün sayısı 4–6 olabilir; yerleşim otomatik olmalı.
- Comp-led: build-phase `sections` aşaması, aynı spec içinde.

## Kullanılacak araçlar
- Skill:
  - `impeccable` (craft-floor, `animate`, `polish`);
  - `emil-design-eng`, `animate`, `apple-design` (sicim sallanması, bottom sheet fiziği);
  - `break-ui` (uzun ürün adı, tükendi, tek varyant, 6 ürün, 4 ürün);
  - `better-ui`, `better-accessibility`, `motion-framer`.
- ECC: frontend-patterns, motion-patterns, motion-advanced, accessibility, e2e-testing.
- 21st MCP:
  - Hızlı görünüm için Drawer 23558 (sağ panel, odak tuzağı) ve 31360 (mobil alt sayfa, snap);
  - galeri için Thumbnail image viewer 37501;
  - "animated number / digit roll" ara.

  Hepsi token'lara uyarlanır.

## Adımlar
1. **Bölüm `#kiler`:**
   - Zemin `kiler-duvar` (cover, yavaş parallax yok; sabit).
   - Başlık "Kışlık kiler" iki yanında ince altın çizgiyle. Alt satır "Yıllık zeytin ve yağınızı tek seferde alın."
2. **Raflar:**
   - Raf görseli tam genişlik.
   - **Masaüstü (≥ 1024):** üst rafta 4 ürün, alt rafta kalanlar ve kargo kolisi.
   - **Tablet:** 3'lü.
   - **Telefon:** rafta 2 ürün.
   - Ürünlerin tabanı raf üst yüzeyine oturur; gölge yok, yalnız hafif temas gölgesi.
   - Ürün görselleri `loading=lazy` + sabit en-boy oranı (CLS 0).
3. **Kraft etiket bileşeni** (`components/catalog/KraftTag.tsx`):
   - Kraft doku + sicim (SVG çizgi + delik).
   - İçerik: ad (Fraunces), varyant çipleri (radiogroup, ok tuşları), fiyat (tabular; boy değişince rakam rakam döner), "Ekle" butonu.
   - Ekle davranışı: bas → yükleniyor → "Eklendi ✓" → sıfırla.
   - Tükendi durumu: buton pasif, "Tükendi".
   - Dokunma hedefleri ≥ 44px.
   - **Telefon:** etiket ürünün altında tam genişlik. **Masaüstü:** ürünün sağ üstüne asılı (taslaktaki gibi).
4. **Hızlı görünüm:**
   - Ürün görseline ya da etiketteki ada tıklayınca açılır. Masaüstünde sağ panel, telefonda alt sayfa (sürükle-kapat).
   - İçerik: galeri (stüdyo 4:5 + sahne 16:9), varyant, adet, Sepete ekle, kısa açıklama (resmi metinden), "Toptan teklif iste" (→ `#toptan`).
   - URL `?urun=<slug>` olur; geri tuşu paneli kapatır. ESC ve odak tuzağı çalışır.
5. **Sepet:**
   - Ekleme sonrası çekmece kendiliğinden açılmaz; mini bildirim + rozet zıplaması.
   - Çekmece ve sepet satırlarında ürün küçük görseli görünür.
   - Mobil çekmecede satır alt çubuk tarafından kesilmez (v2 hatası).
6. **İmza hareket:**
   - Bölüm görününce raflar sırayla dolar: ürün 12px yukarıdan "konur", spring, stagger 70ms.
   - Sonra etiket sicimden sallanıp durur (döndürme ≤ 4°, en fazla 2 salınım).
   - Reduced-motion'da hepsi yerinde, hareketsiz.

7. **112'den devreden:** Telefonda hero'daki "Ürünleri gör" butonu tenekenin üstüne biniyor. İki buton yan yana olsun ya da metin bloğu sıkılaşsın; ürün görünür kalsın.

## Kabul kriterleri
- [ ] e2e (Chromium + WebKit + mobil):
  - Her varyant için fiyat değişir.
  - Ekle sepete doğru varyantı ekler.
  - Tükendi ürün eklenemez.
  - Hızlı görünüm aç/kapa çalışır: tıklama, ESC, geri tuşu, mobilde sürükle.
  - Klavye ile tüm etiket kontrolleri erişilir.
- [ ] `break-ui` durumları ekran görüntüsüyle `test-results/113/break/`: 4 ürün, 6 ürün, uzun ad, tek varyant, tükendi.
- [ ] Kaydırma kare şeridi (masaüstü/iPhone/Pixel, %40 adım) `test-results/113/filmstrip-*.jpg`:
  - kesik etiket yok;
  - raf ile ürün arasında boşluk ya da taşma yok;
  - boş ekran yok.
- [ ] Dokunma hedefleri ≥ 44px (Playwright ölçümü). Kontrast: kraft üstünde metin ≥ 4.5:1.
- [ ] Lighthouse mobil 3 ölçüm medyanı ≥ 85, CLS < 0.1. inspect.mjs FAIL 0.

## Yapılmaması gerekenler
- Ödeme ve DB'ye dokunma.
- Yeni görsel üretme.
- Fiyatları gerçek sanma; katalog örnek kalır.

## Coder Notu

### Uygulama (21 Ekim 2026)
- Yeşil duvar, ceviz raf, kargo kolisi; masaüstünde 4, tablette 3, telefonda 2 kolon. Yerleşim aile/varyant modelini ve en fazla 6 örnek SKU'yu korur. Ürün tabanı ve kargo kolisi aynı raf çizgisindedir; uzun ad etiket yüksekliğine göre satırı büyütür.
- `KraftTag`: sicim/delik SVG'si, Fraunces ad, ok/Home/End tuşlarıyla radyo varyantları, tabular ve rakam bazlı fiyat geçişi, Ekle → Ekleniyor → Eklendi ✓ → sıfırlama; stok/adet hatası ve Tükendi.
- Hızlı görünüm gerektiğinde yüklenir; sağ panel/mobil alt sayfa, stüdyo ve sofra galerisi, varyant/adet, resmi içerikten açıklama, `#toptan` bağlantısı. `?urun=<aile-slug>` geri/ileri, doğrudan URL, ESC, odak tuzağı/geri dönüş ve mobil sürükle-kapat desteklenir.
- Ekle çekmeceyi açmaz; kısa bildirim ve mevcut rozet hareketi çalışır. Sepet çekmecesi/sayfasında küçük görsel; mobil çekmece gövdesi ve son satırın alt çubuk altında kalması düzeltildi. Mobil hero butonları yan yana, metin daha sıkı; onaylı ürün fotoğrafı görünür kalır.
- Raf için 12px yerleşme/spring ve 70ms sıra, etiket için en fazla 4°/iki salınım. Reduced-motion'da konum sabit, tüm içerik/CTA erişilir. Lazy görsellerin boyutları sabittir.
- Kullanılan skill'ler: impeccable (craft-floor/animate/polish), emil-design-eng, animate, apple-design, break-ui, better-ui, better-accessibility, motion-framer; proje ECC frontend-patterns, motion-foundations/patterns/advanced, accessibility, e2e-testing ve TDD. Yeni skill kurulmadı.
- 21st MCP kaynakları okundu ve mevcut Radix/Motion + marka tokenlarına uyarlandı: Drawer 23558 + 31360, Thumbnail image viewer 37501, Rolling Digits 19158 (`animated number digit roll` araması). Yeni shadcn bileşeni gerekmedi; mevcut Dialog/Radix altyapısı kullanıldı. Next.js 16.4.2'nin yerel native History API rehberi okundu.

### Komutla doğrulama
| Kabul / garanti | Komut ve gerçek sonuç |
|---|---|
| TDD RED → GREEN | `npm test -- tests/unit/pantry-family.test.tsx`: önce yeni Fiyat/radio/Ekle/Tükendi sözleşmelerinde **3 FAIL**, uygulama sonrası **3 PASS**. Doğru SKU, çekmecenin açılmaması, tükendi ve stok sınırında sepetin korunması doğrulandı. |
| Birim / coverage | `npm test -- --coverage`: **24 dosya / 274 test PASS**; mevcut `app/**` kapsamı statements **%82,85**, branch **%86,11**, functions **%88,88**, lines **%87,93**. Bileşen kapsamı için yüzde iddia edilmez; kritik yol aşağıdaki gerçek tarayıcı testleriyle doğrulandı. `test-results/113/unit-coverage.log`. |
| Lint / tip / build / varlıklar | `npm run lint`, `npm run typecheck`, `npm run build`: **PASS**. Build öncesi iki asset kapısı **18 onaylı görsel + 98 v3 çıktı PASS**. `test-results/113/build.log`. |
| Chromium + WebKit/iPhone | `env PLAYWRIGHT_PORT=3113 npx playwright test tests/e2e/pantry-v3.spec.ts tests/e2e/sofra-hero.spec.ts --workers=1 --project=chromium-1440 --project=webkit-iphone14`: son build üzerinde **23 PASS, 1 SKIP** (yalnız masaüstüne uygulanmayan mobil sürükleme testi). Tüm 6 SKU fiyatı/ID'si, tükendi, klavye/ok tuşları, galeri, adet, ESC, geri/ileri/doğrudan URL, odak tuzağı ve dönüş, mobil snap/sürükle, reduced-motion, 44px hedefler, raf teması, sepet satır görselleri ve son satır erişimi doğrulandı. Hero regresyonları da geçti. `test-results/113/e2e-accepted.log`, `e2e-pantry-hero.json`. |
| Stres / kare şeritleri / kontrast | `node scripts/verify-pantry-v3.mjs`: **PASS**; masaüstü Chromium 1440×1000, iPhone 14 WebKit, Pixel 7 Chromium. **43 kare** (10/18/15), %40 adım, üç `filmstrip-*.jpg`; 4/6 ürün, uzun ad, tek varyant, tükendi ve boş katalog için **18 ekran görüntüsü** `test-results/113/break/`. 6 ürün/kolinin raf hizası, yatay taşma olmaması ve hedefler ≥44px ölçüldü; JS hatası yok. Doku tüm piksellerde gerçek CSS `soft-light` harmanıyla hesaplandı: mürekkep metin için minimum **5,6207:1**. `visual-report.json`. |
| inspect.mjs | `node /Users/emre/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:3114 --out test-results/113/inspect-final --json`: **0 FAIL, 3 WARN**; onaylı sofra beyazı, videonun olmaması ve 12 hareketli öğenin az bulunması. Task yeni görsel/video istemez, onaylı renk/hareket sınırları korundu. `inspect-final.json`. |
| Impeccable detector | `/Users/emre/.codex/skills/impeccable/scripts/impeccable detect --json <değişen UI hedefleri>`: **[]**. `test-results/113/impeccable-detect.json`; mekanik tarama tek kez yapıldı. |
| Lighthouse mobil (3 production ölçümü) | `node scripts/verify-pantry-performance.mjs /Users/emre/.npm/_npx/0f94ee7615faf582/node_modules/lighthouse/cli/index.js http://localhost:3114`: Lighthouse **13.5.0**, mobil/simulate, URL engelleme yok. Performance **81 / 86 / 86**, medyan **86**; Accessibility medyan **100**, CLS **0**, LCP **4203,9585 ms**. Task 113'ün Performance ≥85 ve CLS <0.1 kapısı **PASS**. Üç ham rapor ve `lighthouse-summary.json` `test-results/113/` altında. |

### Tamamlanamayan / durum gerekçesi
- Task bağlamında istenen **aynı spec içinde build-phase `sections` aşaması** doğrulanamadı. Önceden kalan `.impeccable/build/state.json` hâlâ **plates/open**, `sections/pending`. `/Users/emre/.codex/skills/impeccable/scripts/impeccable build-phase advance` gerçek sonucu **GATE PLATES FAILED**: `assets/plates/sofra.png` için mevcut hero referansına karşı **structure 39%**; ayrıca yeni component plan/asset review kabulü istiyor. `test-results/113/build-phase.log`.
- Kaynak skill: `/Users/emre/.codex/skills/impeccable/SKILL.md`, uygulanan `reference/new-work.md` §6: **“write nothing for a later phase while an earlier gate is open”**. Task 111/112 ve görsellerin kullanıcı onayı korunarak 113'ün yetkilendirilmiş uygulama/kabul komutları tamamlandı; yerel kapı elle kapatılmadı, sıfırlanmadı veya yeni spec açılarak aşılmadı. Araç yeni sofra görseli üretmeyi istiyor; Task 113 açıkça **“Yeni görsel üretme”** diyor. Bu kalan kapı plan/görsel kararına ihtiyaç duyduğundan durum BEKLİYOR bırakıldı. Yukarıdaki işlevsel testler ve ölçülebilir kabul sonuçları PASS'tır; comp-led faz kabulü iddia edilmez.
- Vite fixture yalnız test sınırında veri değiştirir; `four/six/long/single/sold/empty` seçicisi production rotası değildir. Resmi katalog, fiyat ve stok örnek kalır; DB/ödeme, onaylı görsel dosyaları, diğer dokümanlar ve başka repolar değiştirilmedi. Yerel kanıtlar `test-results/113/` altında gitignore kapsamındadır.

## Düzeltme 113-a (Claude denetimi, 21 Eki 15:00)
İncelenen kanıtlar: `test-results/113/desktop-pantry.png`, `iphone-pantry.png`, `desktop-quick-view.png`, `iphone-quick-view.png`.

Telefon düzeni iyi; korunacak. Masaüstünde sorunlar:

1. **Etiket ürünü kapatıyor.** Masaüstünde kraft etiket ürünün sağ yarısının üstüne biniyor; kavanoz ve teneke yarı yarıya örtülü.
   - Telefondaki gibi yap: etiket rafın ön kenarından sicimle **rafın altına** sarksın, ürün rafın üstünde tamamen görünsün.
   - Ürün görselleri masaüstünde daha büyük olsun: rafta en büyük ürün ~320px yükseklik.
2. **"Ekle" görünmüyor.** Kraft üstünde kraft tonlu buton kontrastsız.
   - Ekle butonu kiler yeşili (`#243A29`) dolgu + krem yazı olsun. Hover ve odak durumu net.
   - Tükendi durumu çerçeveli ve soluk kalsın.
3. **Boş ikinci raf.** Masaüstünde alt rafta yalnız koli var, boş görünüyor.
   - Masaüstünde tek raf kullan: 4 ürün + rafın sağ ucunda kargo kolisi.
   - Ürün sayısı 5–6 olursa ikinci raf otomatik açılır ve koli son rafa gider.
4. **Hızlı görünüm kanıtı.** Masaüstü ekran görüntüsünde panel sağda ~60px kesik görünüyor; büyük olasılıkla açılış animasyonu sırasında çekilmiş.
   - Animasyon bitince çek.
   - Panel genişliği ≥ 440px olmalı, içerik kesilmemeli (test et).
   - Panel açıkken arka plan kaydırması kilitli olsun.
5. **Varyant görseli.** Doğal Kırma'da "10 kg" seçilince raftaki görsel tenekeye, "1 kg" seçilince kavanoza geçsin (çapraz geçiş 200ms). Zeytinyağı 1 L / 5 L için de aynı.
6. **Impeccable build-phase:** "plates" kapısı Claude tarafından muaf tutuldu (bkz. 112 Claude kabulü). Bu kapı yüzünden BEKLİYOR'da kalma; `inspect.mjs` + ekran görüntüsü + e2e yeterli kanıttır.

### Kabul kriterleri (113-a)
- [ ] Ürün ve etiket çakışmıyor (Playwright ile bbox kesişimi 0). Ürün görseli raf üstünde tamamen görünür.
- [ ] Ekle butonu kontrastı ≥ 4.5:1.
- [ ] Varyant değişince görsel değişir (e2e).
- [ ] Yeni masaüstü ve iPhone kare şeritleri `test-results/113/` altına. Hızlı görünüm animasyon bittikten sonra çekilir.
- [ ] Build, lint, unit ve e2e yeşil. Lighthouse mobil medyanı ≥ 85.

## Coder Notu

### Düzeltme 113-a — tamamlanan uygulama (21 Ekim 2026)
- `4ccf461` RED regresyon commit'i mevcut `main` geçmişinde doğrulandı; çalışma ağacındaki dört yarım dosya korunarak devam edildi. RED tarayıcı testleri bu oturumda yeniden çalıştırılmadı.
- Kraft etiketler tüm genişliklerde rafın altına taşındı. Ürün alanı masaüstünde 340px, fotoğraf alanı 320px; telefonda mevcut 220px alan ve iki kolon korundu. Sabit görsel kutusu, `object-fit: contain` ve alt hizalama ile görsel yüklenirken ve varyant değişirken raf çizgisi korunur.
- Masaüstünde dört ürün ailesi ve sağ uçtaki koli tek rafta; beşinci aile ikinci rafı başlatır, koli son rafın sağ ucuna yerleşir. 5–6 aile senaryoları için mevcut test fixture'ı ve kanıt script'i korundu.
- Ekle zeytin yeşili dolgu/krem metin, hover'da mürekkep dolgu ve belirgin odak çerçevesi kullanır. Tükendi çerçeveli kraft durumunu korur.
- Doğal Kırma 1/10 kg ve zeytinyağı 1/5 L fotoğrafları seçilen SKU ile değişir. Motion `AnimatePresence` aynı alanda 200ms opacity çapraz geçişi yapar; çıkan görsel erişilebilirlik ağacından gizlenir, reduced-motion'da süre sıfırdır.
- Mevcut hızlı görünüm 520px masaüstü genişliğini ve Radix odak/kaydırma kilidini korur. E2E regresyonu panelin animasyonu bittikten sonra genişlik, taşma ve kaydırma kilidini ölçer; varyant değişiminden sonra raf temasını da kontrol eder. Görsel kanıt script'i panelin `transform: none` durumunu bekler.
- Görevde belirtilen tasarım/erişilebilirlik/Motion ve proje ECC skill'leri kullanıldı; ek skill kurulmadı. 21st MCP `animated number digit roll` araması yeniden yapıldı (Rolling Digits 19158); önceki Drawer/galeri uyarlamaları korundu. Yeni UI bağımlılığı veya shadcn bileşeni gerekmedi. Next.js'in yerel lazy-loading ve native History API rehberleri okundu.

### Bu oturumun komut sonuçları

| Kontrol | Sonuç |
|---|---|
| `npm test -- tests/unit/pantry-family.test.tsx` | **4 PASS**. Zeytin ve yağ için iki yönde fotoğraf/fiyat değişimi, seçilen SKU'nun sepete yazılması, çekmecenin kapalı kalması, Tükendi ve stok sınırı. |
| `npm test -- --coverage --maxWorkers=2` | **24 dosya / 275 test PASS**. Yapılandırılmış `app/**` kapsamı: statements %82,85; branches %86,11; functions %88,88; lines %87,93. |
| `npm run lint` | **PASS**, sıfır uyarı. |
| `npm run typecheck` | **PASS**; güncellenen e2e dosyası da tip kontrolüne dahil. |
| `npm run build` | **PASS**; 16 rota üretildi. Ön kapılar: 18 onaylı görsel ve 98 v3 çıktı **PASS**. |
| `node --input-type=module` ile PostCSS/token kontrast hesabı | Gerçek kaynak CSS'deki Ekle renkleri çözüldü: normal/odak **11,4629:1**, hover **14,0161:1**; eşik ≥4,5 **PASS**. Bu hesap tarayıcıda render ölçümü değildir. |
| `impeccable detect --json components/catalog/Pantry.module.css components/landing/PantryFamily.tsx` | **[]**, tek mekanik tarama. |
| `git diff --check` | **PASS**. |

### Claude doğrulayacak — tarayıcı kabulü
- Ürün/etiket bbox kesişimi 0, görünür ürünün raf teması ve yaklaşık 320px masaüstü yüksekliği; 4/5/6 ailede raf/koli yerleşimi.
- Render edilmiş Ekle kontrastı, hover/odak, ≥44px hedefler; varyant görselinin 200ms geçişi ve reduced-motion.
- Hızlı görünümün animasyon sonrası ≥440px genişliği, içerik taşmaması, arka plan kaydırma kilidi, aç/kapa/geri/ESC/klavye/mobil sürükleme.
- Chromium/WebKit/mobil e2e, yeni masaüstü/iPhone/Pixel kare şeritleri ve break-ui görüntüleri (`test-results/113/`), `inspect.mjs`, üç mobil Lighthouse ölçümünün medyanı ≥85 ve CLS <0,1.
- AGENTS.md'nin **“Tarayıcı testleri Claude'da”** kuralı gereği Playwright, Lighthouse, inspect ve ekran görüntüsü/kare şeridi bu oturumda çalıştırılmadı. Yukarıdaki eski uygulama bölümünün tarayıcı sonuçları 113-a için güncel kabul kanıtı sayılmaz.
- Düzeltme 113-a madde 6 plates kapısını muaf tutar; önceki BEKLİYOR gerekçesi artık geçerli değildir. İstenen kod değişikliklerinde açık engel yok; tarayıcı kabulü AGENTS.md gereği TAMAMLANDI durumunu engellemez. DB/ödeme, onaylı varlıklar, plan ve diğer dokümanlar değiştirilmedi.

## Durum: TAMAMLANDI
