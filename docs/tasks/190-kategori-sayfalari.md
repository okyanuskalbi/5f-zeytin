# Task 190: Ürün grubu (kategori) sayfaları

## Tür
frontend

## Amaç
Müşteri isteği (10 Kasım 2026, WhatsApp, kullanıcı iletti): "Ürün Gruplarının ek sayfası olsa olur mu kategori gibi … Çünkü Siyah Zeytinin 1'den fazla çeşidi olabilir". Ana sayfadaki 4 ürün grubu (Siyah Zeytin, Yeşil Zeytin, Kırma Zeytin, Zeytinyağı) kendi sayfasını açar. Her sayfa o gruptaki tüm ürünleri listeler. İleride eklenecek yeni çeşitler doğru gruba kendiliğinden düşer.

## Bağlam
- 188 (`/urunler`), 189 ve 189-1 (renk) tamamlandı; aynı ağaçta sırayla yürür.
- Vitrin ürünleri kodda: `lib/catalog/static-products.ts` (4 aile, 6 boy, onaylı görseller). Veritabanından yalnız kategori etiketi ayarı gelir (`lib/catalog/read.ts` → `readProductFamilies`).
- Gruplar bugün `components/landing/ProductGroups.tsx` içinde sabit; aile → grup birebir: `salamura-siyah` → Siyah Zeytin, `salamura-yesil` → Yeşil Zeytin, `dogal-kirma` → Kırma Zeytin, `naturel-sizma` → Zeytinyağı. Grup fotoğrafları `lib/media/classic-photos.json` (`siyah-zeytin`, `yesil-zeytin`, `kirma-zeytin`, `zeytinyagi`).
- Bugün grup fotoğrafına tıklayınca o ailenin ilk ürününün detay penceresi açılıyor.
- `/urunler` sayfası: `app/urunler/page.tsx` + `page.module.css` (ızgara, kart, "Teklife ekle" bağlantısı, detay penceresi, noindex).

## Kullanılacak araçlar
- Fiilen yükle: `ui-ux-pro-max` (§2 dokunma, §5 düzen, §9 gezinme), `frontend-design`, `better-layout`, `better-accessibility`, `responsiveness-check`.
- ECC skill: `frontend-patterns`, `tdd-workflow`. Next.js 16 `generateStaticParams` / `dynamicParams` / iç içe `layout` için kurulu belgeyi oku.
- 21st MCP: hayır (mevcut kart ve C dili).
- **Codex alt ajanları (multi_agent):** (a) grup modeli + sayfalar, (b) kategori gezinmesi + ana sayfa bağlantıları, (c) testler paralel.

## Adımlar
1. **Grup tanımı tek yerde** (`lib/catalog/` altında): sıra ve kısa adlar: Siyah Zeytin `siyah-zeytin`, Yeşil Zeytin `yesil-zeytin`, Kırma Zeytin `kirma-zeytin`, Zeytinyağı `zeytinyagi`; her grupta ad, kısa ad ve fotoğraf anahtarı. Her aile bir gruba bağlanır (ör. ailede `groupId`). **Bir grupta birden fazla aile olabilir** (ileride ikinci bir siyah zeytin çeşidi = yeni aile, aynı grup). Ana sayfa `ProductGroups` ve yeni sayfalar bu tek kaynağı kullanır.
2. **Kategori sayfaları `app/urunler/[kategori]/page.tsx`:** `generateStaticParams` ile 4 grup, `dynamicParams = false` (bilinmeyen kısa ad → 404), `force-static` + `revalidate = 300`.
   - Breadcrumb: Ana Sayfa / Ürünler (`/urunler`) / <Grup adı> (`aria-current="page"`).
   - H1 = grup adı. Altında `/urunler` ile aynı cümle: "Ambalajınızı seçin, sepetinize veya teklifinize ekleyin." Yeni tanıtım metni YAZMA.
   - Izgara, kart, "Teklife ekle" bağlantısı (`/?teklif=<id>#toptan`), ürün detay penceresi, boşluklar ve sütun kuralları `/urunler` ile birebir: ortak bileşene çıkar, kopyalama.
   - Grupta ürün yoksa: "Bu grupta şu an ürün bulunmuyor." ve "Tüm ürünler" (`/urunler`) bağlantısı.
   - Metadata: başlık "<Grup adı> | AFİNA ZEYTİN", açıklama, canonical `/urunler/<kısa ad>`, `robots: { index: false, follow: true }` (gerçek fiyatlar onaylanana kadar `/urunler` gibi), üç düzeyli BreadcrumbList. `app/sitemap.ts` ve `llms.txt` değişmez.
3. **Kategori gezinmesi** (`/urunler` ve 4 kategori sayfasında aynı, H1 ile ızgara arasında): "Tüm ürünler" + 4 grup bağlantısı. Her bağlantıda küçük yuvarlak grup fotoğrafı (ana sayfadaki grup fotoğrafları; "Tüm ürünler" için mevcut onaylı bir fotoğraf, ör. `zeytinlik`) ve ad. Etkin bağlantı `aria-current="page"` taşır, belirgindir (altın kenar/zemin). Telefonda tek sıra yatay kaydırılabilir olabilir (sayfa yatay taşmaz, yalnız sıra kayar), dokunma hedefi ≥ 44 px. Gezinme `app/urunler/layout.tsx` içinde olursa sayfalar arasında yerinde kalır (191'deki gösterge hareketi için gerekir).
4. **Ana sayfa:** 4 grup fotoğrafı `/urunler/<kısa ad>` bağlantısı olur, detay penceresi açmaz. Görünüm aynı kalır. "Tüm ürünleri gör" `/urunler` olarak kalır.
5. Sepet ve teklif davranışı `/urunler` ile aynıdır.

## Kabul kriterleri
- [x] Unit: grup listesi tek kaynak; her aile tam bir gruba ait; test verisinde bir gruba iki aile verilince kategori sayfası ikisinin tüm boylarını listeler.
- [x] Unit: 4 kategori sayfası render: H1, breadcrumb, doğru ürünler (Siyah Zeytin → `sample-black-olive-1kg`; Yeşil Zeytin → `sample-brined-green-olive-5kg`; Kırma Zeytin → 2 boy; Zeytinyağı → 2 boy), metadata (canonical, noindex/follow), BreadcrumbList; boş grup iletisi.
- [x] Unit: ana sayfadaki grup fotoğrafları `href="/urunler/<kısa ad>"`; kategori gezinmesinde etkin bağlantı `aria-current="page"`, diğerleri değil.
- [x] `npm run build && npm run start` sonrası: 4 sayfa 200 ve `noindex` içerir; `/urunler/olmayan` 404; `sitemap.xml` kategori sayfalarını içermez.
- [x] e2e: `color-contrast-189.spec.ts` ve `footer-canvas-189-1.spec.ts` kapsamına 4 kategori sayfası eklenir ve geçer.
- [x] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `git diff --check` yeşil.
- [ ] Tarayıcı doğrulaması Claude'da (360 / 390 / 768 / 1024 / 1440).

## Yapılmaması gerekenler
- Ürün verisi, fiyat, stok, görsel değişikliği; yeni ürün/çeşit ekleme; yeni medya üretimi; yeni tanıtım metni.
- Veritabanı şeması veya yönetim paneli değişikliği (gruplar şimdilik kodda).
- `AFINA-KAYNAK/` git'e eklenmez (`git add -f` YASAK).
- **Push yok, yayın yok.** Testler yeşilse tek kayıt (commit). İş bitince `node_modules` ve `.next` klasörlerini SİLME.
- `docs/` altında yalnız bu dosyaya Coder Notu ve Durum.

## Coder Notu

- 10 Kasım 2026: görev üç Codex alt ajanıyla (grup modeli/sayfalar, gezinme/ana sayfa, kalıcı tarayıcı testleri) yürütüldü; birleştirme ve tam yerel kabul ana ajanda yapıldı. ui-ux-pro-max, frontend-design, better-layout, better-accessibility, responsiveness-check, frontend-patterns, tdd-workflow ve e2e-testing rehberleri ile kurulu Next 16.4.2 generateStaticParams/dynamicParams/layout belgeleri okundu. Görevin tercihiyle 21st ve yeni bağımlılık kullanılmadı.
- Grup sırası/adı/fotoğrafı tek kaynağa taşındı; ailelerin groupId bağı bir grupta birden fazla aileye izin verir. Dört kategori önceden oluşturulur, bilinmeyen kategori 404 olur. Kalıcı ürün yerleşimindeki başlık/içerik yolu ve fotoğraflı gezinmenin ardından ortak ProductListing kartları gelir. Kart, boy, görsel, fiyat/stok, detay, sepet ve teklif bağlantıları korundu. Ana sayfa grup fotoğrafları artık normal kategori bağlantılarıdır.
- RED: yeni model/sayfa ve gezinme kontrolleri önce başarısız oldu; önceki üretim derlemesinde siyah kategori adresi 404 iken beklenen 200 kontrolü başarısız olarak kaydedildi. GREEN: dört kategori, metadata/üç düzeyli BreadcrumbList, boş grup ve aynı gruba iki ailenin tüm boyları geçti. 188 testleri ortak yerleşimle çalışacak şekilde uyarlandı; eski detay/sepet/teklif testleri gerçek ürün kartı üzerinden korunuyor.
- Yerel kontroller PASS: lint, typecheck, 142 dosyada 1378 birim testi, Next Turbopack üretim derlemesi, git diff --check. Önceden mevcut yerel Postgres gerektiren 6 dosya/26 test ayar bulunmadığı için atlandı; çalıştırılmış sayılmadı.
- Paketli başsız Chromium, en fazla iki işçi: category-pages-190 11/11, color-contrast-189 47/47 ve footer-canvas-189-1 40/40; toplam 98/98 PASS. Dört kategori 200/noindex/canonical/doğru kartlar, bilinmeyen kategori 404, sitemap dışında kalma ve 360/390/768/1024/1440 gezinme/44px/taşma kontrolleri geçti. 94 açık/koyu renk taramasında ihlal 0; 47 görüntü çifti aynı. Alt bilgi testinin 80 açık/koyu görünümünde alt tarafta açık piksel yok. app/sitemap.ts ve llms.txt değişmedi.
- Kanıtlar git dışındaki output/task190, output/task189-sonra ve output/task189-1-footer altında. Derleme ve yerel sunucu işletim sistemi düzeyinde uzak ağ bağlantıları engellenerek çalıştı; ortam ayarları değişmedi, canlı veritabanına bağlanılmadı. Tarayıcılar düzgün kapandı; yerel sunucu SIGTERM ile kapatıldı. node_modules ve .next korundu.
- Karşılanmayan ayrı kabul: Claude'da istenen tarayıcı doğrulaması yapılmadı; ilgili kutu açık tutuldu. Yukarıdaki kontroller yerel Codex uygulama/test kabulüdür; fiziksel cihaz veya Claude görsel kabulü değildir. TAMAMLANDI yerel teslimi belirtir. Push, production/Vercel yayını ve AFINA-KAYNAK/output ekleme yapılmadı. Çalışma sırasında eklenen Task191 motion-framer notları korundu ve bu görevin kaydına alınmadı.

## Claude denetimi (10 Kasım 2026)
- 4 kategori × 5 genişlik: doğru ürünler, H1, üç düzeyli içerik yolu, tek etkin gezinme bağlantısı, noindex + canonical, yatay taşma ve 44 px altı bağlantı yok, sayfa hatası yok; bilinmeyen kategori 404; sitemap'te yok; ana sayfa grup bağlantıları `/urunler/<kısa ad>`. Codex'in `category-pages-190` testi Claude sunucusunda da geçti. **KABUL.**

## Durum: TAMAMLANDI
