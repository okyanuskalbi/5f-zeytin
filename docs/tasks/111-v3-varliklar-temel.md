# Task 111: v3 varlıklar, tokenlar, sayfa iskeleti (eski bölümleri kaldır)

## Tür
frontend

## Amaç
ZEYTİN v3 "Sofradan kilere" için:
- onaylı görselleri optimize edip `public/`'e al;
- tokenları DESIGN.md v3'e göre kur;
- ana sayfayı yeni bölüm sırasına göre iskelet olarak yeniden düzenle.

v2'nin reddedilen bölümleri kaldırılır.

## Bağlam
- **Önce oku:**
  - `docs/DESIGN.md` (v3, tamamı)
  - `PRODUCT.md`
  - onaylı taslak `.impeccable/mocks/decision/mix-b.webp` (yerel, gitignore'da; görsel sözleşme)
- Kullanıcı 21 Eki: v2 "berbat, hiç beğenmedim". Impeccable critique teşhisi DESIGN.md'nin karar geçmişinde. Kullanıcı taslak B'yi seçti.
- Onaylı görseller: `~/PROJELER/AFINA-KAYNAK/zeytin-v3-gorseller/`. SHA-256 ve onay `ONAY.md` içinde. Repo dışından **yalnız okunur**, işlenmiş kopyalar repoya yazılır.
- Ürün stüdyo + sahne görselleri: `~/PROJELER/AFINA-KAYNAK/urun-gorselleri/onayli/` (ONAY.md).
- Tesis: `docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg`. Plaka bulanık; orijinal asla repoya girmez.
- 102 ve 107 İPTAL. Bu görev ve 112–115 onların yerini alır.

## Kullanılacak araçlar
- Skill: `impeccable` (önce `scripts/impeccable context`; görev boyunca `reference/craft-floor.md`), `design-taste-frontend`, `vercel-react-best-practices`, `web-perf`.
- ECC skill: frontend-patterns, design-system, verification-loop.
- 21st MCP: bu görevde gerekmez.

## Adımlar
1. **Görsel hattı:** `scripts/prepare-v3-assets.mjs` (sharp; yoksa ekle) kaynakları okur ve `public/images/v3/` altına yazar.
   - **hero:** masaüstü AVIF+WebP 1920/2880 genişlik (≤ 180 KB hedef), mobil 750/1150 (≤ 120 KB).
   - **kiler-duvar:** 1920/2880, ≤ 150 KB.
   - **ürünler + koli:** Alpha korunur. Kırpma eşiği: ürünler alpha > 40, raf alpha > 200. AVIF+WebP, 300/600 yükseklik.
   - **raf:** Yatay uzatılabilir şerit.
   - **kraft:** 512px karo.
   - **Galeri:** onaylı stüdyo 4:5 + sahne 16:9, 800/1600.
   - **Manifest:** `public/images/v3/manifest.json`. İçeriği: kaynak SHA-256 (ONAY.md ile eşleşmeli), çıktı boyutları, alt metinler (Türkçe).
2. **Tokenlar** (`app/globals.css`): DESIGN.md v3 renk ve tipografi tablosu. Neon yeşil ve v2 toprak tokenları kalkar. Fraunces ve Figtree korunur.
3. **Katalog** (`lib/catalog/static-products.ts`): Aile + varyant modeli (her aile tek ürün, boylar varyant):
   - Doğal Kırma Yeşil Zeytin: 1 kg kavanoz, 10 kg teneke.
   - Salamura Siyah Zeytin: 1 kg.
   - Natürel Sızma Zeytinyağı: 1 L, 5 L.
   - Salamura Yeşil Zeytin: 5 kg.

   Her varyantın görsel anahtarı manifest'ten gelir. Fiyatlar örnek kalır. Sepet ve checkout varyant id'siyle çalışmaya devam eder; mevcut sepet testleri bozulmaz.
4. **Sayfa iskeleti** (`app/page.tsx`), sıra: Hero → Kışlık kiler → Güven şeridi → Tesis + Toptan → SSS → Footer.
   - Kaldırılacak bileşenler: HeroIntro (satın alma kutusu), HeroLightScene, Moments, FeaturedProduct/FeaturedPurchase, OsmaniyeMap, neon Facility bandı, eski ProductShowcase/ProductCard.
   - Kullanılmayan dosyalar silinir. İçerik metinlerinden (resmi) gerekenler korunur.
   - Bu görevde yeni bölümler basit ama doğru içerikli yer tutucu olabilir; boş kutu YOK. 112–114 bölümleri tamamlar.
5. **Taslak yazıları:** Dağınık "Örnek ürünler", "Temsili görsel", "Gerçek satış kataloğu değildir", "henüz kullanıma açık değil" yazıları kalkar. Yerine footer'da TEK satır: "Önizleme: fiyatlar ve görseller temsilidir."

## Kabul kriterleri
- [ ] `node scripts/prepare-v3-assets.mjs` tekrar çalışınca aynı çıktıyı verir. Manifest SHA'ları ONAY.md ile eşleşir. Bunun için `scripts/check-v3-assets.mjs` testi yazılır ve `npm run check:assets` içine eklenir.
- [ ] Bayt bütçeleri: hero masaüstü ≤ 180 KB, mobil ≤ 120 KB, kiler-duvar ≤ 150 KB, ürün 600px ≤ 90 KB (script kontrol eder).
- [ ] `grep -rniE "Örnek ürünler|Gerçek satış kataloğu|kullanıma açık değil" app components` sonucu boş.
- [ ] `npm run build`, `npm run lint`, typecheck ve sepet/checkout/üyelik e2e testleri yeşil. Varyant modeline uyması gereken testler güncellenir; Coder Notu'nda listelenir.
- [ ] Repo PUBLIC: orijinal plakalı tesis fotoğrafı ve kit PDF'leri repoya girmez. `git ls-files | grep -iE "plaka|\.pdf$"` yalnız bulanık jpg'yi gösterir.

## Yapılmaması gerekenler
- Yeni görsel üretme. Yalnız onaylı dosyalar.
- DB, auth ve ödeme mantığına dokunma.
- Bölümlerin son tasarımını burada bitirmeye çalışma (112–114).

## Coder Notu

2026-10-21 — Task 111 kapsamı uygulandı.

- `prepare-v3-assets.mjs`, iki harici ONAY.md kaydındaki 24 onaylı görseli salt okunur doğrular; ayrıca repodaki onaylı bulanık tesis fotoğrafını işler. 25 kaynaktan 98 AVIF/WebP türevi üretildi. Kaynak/çıktı SHA-256, ölçü, Türkçe alt metin, alpha kırpma sınırı ve encoder sürümü manifestte tutulur. Kaynakların tamamı yazmadan önce doğrulanır; orijinaller repoya kopyalanmaz. Sharp zaten mevcut olduğundan bağımlılık eklenmedi.
- Dört aile / altı varyant kuruldu. Doğal Kırma 1/10 kg, siyah 1 kg, yağ 1/5 L, salamura yeşil 5 kg. Görsel ve galeri anahtarları manifestten gelir; `getProducts()` sepet/checkout için düz varyant listesini korur. Fiyat ve stok örnektir.
- V3 renk/tipografi tokenları uygulandı; eski toprak/neon tokenlarına bağlı iç sayfa stilleri yeni tokenlara taşındı. Eski hero, ışık, Moments, öne çıkan ürün, harita ve ProductCard/Showcase bileşenleri kaldırıldı. Yeni sıra: sofra hero → kiler → güven → tesis/toptan → tam cümleli SSS → footer. 320 px taşması giderildi. Çalışmayan toptan formu gösterilmez; iletişim kanalı uydurulmadı. Tek fiyat/görsel önizleme notu footer'dadır.
- DB, auth, sepet ve ödeme mantığı değiştirilmedi. Bu yüzeylerde yalnız istenen taslak ifadeleri ve kaldırılan CSS tokenları güncellendi. Nihai hero satın alma CTA'sı/hareketi, raf yerleşimi/hızlı görünüm ve son bölüm tasarımları 112–114 kapsamındadır; bu görev içerikli temel iskelettir.

Doğrulama (komutla):

- RED: `npx vitest run tests/unit/v3-catalog.test.ts` önce eksik aile modeli nedeniyle 2 FAIL verdi; eksik v3 manifesti de kontrol scripti tarafından reddedildi. GREEN: tüm birim testleri geçti.
- `node scripts/prepare-v3-assets.mjs` iki kez çalıştırıldı. Manifestler `cmp` ile aynı; `node scripts/check-v3-assets.mjs --require-sources` 98 çıktının dosya hash'lerini, özgün ONAY.md SHA'larını, alpha, ölçü, oran ve bütçelerini doğruladı. Harici kaynak bulunmayan CI modu da sabit onay SHA kayıtlarıyla PASS.
- En büyük dosyalar: hero masaüstü **177.776 B / 180.000 B**, mobil **118.742 B / 120.000 B**, duvar **84.646 B / 150.000 B**, 600 px ürün **56.528 B / 90.000 B**. Alpha eşikleri >40 ve >200 korunur. `node --test scripts/check-v3-assets.test.mjs`: 3 PASS; sahte kaynak SHA ve hash/boyutu güncellenmiş bütçe aşımı reddedilir.
- `npm run check:assets`, `npm run build`, `NEXT_PUBLIC_DEMO=1 npm run build`, `npm run lint`, `npm run typecheck`: PASS. Son build demo bayrağı olmadan bırakıldı.
- `npm run test -- --coverage`: **269 PASS**; statement %82,35 / branch %86,11 / function %87,50 / line %87,71; tüm mevcut eşikler geçti.
- Production: `PLAYWRIGHT_PORT=3111 npx playwright test tests/e2e/cart-wire.spec.ts tests/e2e/cart-experience.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/upsell.spec.ts tests/e2e/checkout.spec.ts tests/e2e/membership.spec.ts --grep-invert 'mock journeys'`: 455 senaryo, 18 mevcut cihaz kapsamı skip'i. 435 PASS; son iki senaryonun assertion'ları geçti ancak eşzamanlı iskelet testinin aynı çıktı klasörünü temizlemesi trace kapanışında ENOENT verdi. Bunlar ayrı klasörde tekrar çalıştırıldı: `--project=webkit-iphone14 --grep 'mobile sheet:|route loads the catalog' --output=test-results/111-production-recheck`: **2 PASS**. Böylece 437 uygulanabilir production senaryosu doğrulandı.
- Demo build üzerinde `NEXT_PUBLIC_DEMO=1 FRAME_SEQUENCE_DEV_URL=http://localhost:3004 PLAYWRIGHT_PORT=3111 npx playwright test tests/e2e/checkout.spec.ts tests/e2e/membership.spec.ts --grep 'mock journeys' --output=test-results/111-demo`: **117 PASS**. Önizleme bağlantısı kontrolü mevcut yerel dev sunucusunu kullandı; yeni dev sunucusu kilit nedeniyle açılmadı, mevcut sunucu durdurulmadı.
- `PLAYWRIGHT_BASE_URL=http://localhost:3112 npx playwright test tests/e2e/scenes.spec.ts --output=test-results/111-foundation`: **39 PASS**; bölüm sırası, görseller, iki boyun ayrı sepet satırlarında kalması ve JavaScript kapalı SSR.
- `PLAYWRIGHT_BASE_URL=http://localhost:3112 node scripts/verify-v3-page.mjs`: masaüstü, iPhone 14, 320 px iPhone SE, Pixel 7 ve yatay Pixel için **93 adet %40 kaydırma karesi**. Taşma, kesik başlık, eksik görsel, JS/ağ hatası yok. Footer'a 120 px adımlarla erişildi (mobil WebKit wheel API desteklemediğinden orada aynı adımda native scroll kullanıldı). Yerel çıktı/şeritler: `test-results/111-scroll/`. Bu test Lighthouse veya canlı yayın kabulü değildir.
- Impeccable `context` + craft-floor ve istenen skill'ler kullanıldı; mekanik `detect --json` sonucu `[]`. Context, `docs/DESIGN.md` yolunu otomatik bulmadı; görevdeki v3 belge ve onaylı B taslağı doğrudan okundu. Bildirdiği eksik `buildPath` kaydı görev dışında bırakıldı. 21st bu görevde açıkça gerekli değil.
- İstenen `grep -rniE "Örnek ürünler|Gerçek satış kataloğu|kullanıma açık değil" app components`: eşleşme yok (exit 1). `git ls-files | grep -iE "plaka|\.pdf$"`: yalnız `docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg`. Kit PDF / plakalı orijinal / sır eklenmedi. `git diff --check`: PASS.

Test uyarlamaları:

- Katalog kimliği/ad/fiyat beklentileri: `cart-wire`, `cart-experience`, `cart-page`, `upsell`, `checkout`, `membership`, `interior-pages` e2e; `checkout-adapter`, `bootstrap`, `checkout-page`, `interior-pages`, `asset-registry` unit.
- `membership.spec.ts` adres akışında form kapanışı, yeni formun boş değeri ve kaydedilen başlık beklenir; kaydetme/yenileme yarışı giderildi, auth uygulaması değişmedi.
- Kaldırılan v2 bileşenlerinin `hero-label`, `featured-product`, `moments`, `v2-foundation`, `scenes`, `showcase` unit testleri ve `product-card`/`card-motion` e2e + fixture'ı kaldırıldı. Yerlerine `v3-catalog`, `v3-foundation`, `pantry-family`, güncel `facility`/`faq-contact-footer` ve yeniden yazılan `scenes.spec.ts` davranış testleri getirildi. İskelet dışındaki eski görsel/hareket e2e dosyalarının tamamı bu görevde koşulmadı; nihai 112–115 tasarım kapısına aittir.
- Başlangıçtan kalan `.taste-skill/inspect/` dosyaları korunup commit dışında bırakıldı. Diğer docs dosyaları, `_legacy/`, özgün promptlar ve kaynak repo değiştirilmedi.

## Durum: TAMAMLANDI
