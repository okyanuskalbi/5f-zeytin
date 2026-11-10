# Task 188: "Tüm ürünler" ayrı sayfa (`/urunler`)

## Tür
frontend

## Amaç
Kullanıcı isteği (10 Kasım 2026, ekran görüntüsüyle: "tek sayfada açılsın bu bölüm"): ana sayfadaki "Tüm ürünler" açılır penceresi (içinde ikinci kaydırma çubuğu olan dar pencere) kaldırılır. Tüm ürünler kendi sayfasında (`/urunler`), normal sayfa kaydırmasıyla gösterilir.

## Bağlam
- Bugünkü yapı: `components/landing/ProductGroups.tsx` içinde `Dialog` ("Tüm ürünler", "Kapat", `productGrid`). Pencere `afina:open-shop` olayı ve `?magaza=ac` parametresiyle açılıyor. Açanlar: "Tüm ürünleri gör" düğmesi; `components/site/Navbar.tsx` ve `components/site/NavbarMenu.tsx` içindeki "Online Mağaza" (`/?magaza=ac#urunler`).
- Penceredeki "Teklife ekle": `useQuoteJourney().chooseProduct(id)`, pencereyi kapatır, `#toptan` formuna odak verir. `QuoteJourneyProvider` yalnız ana sayfada ve bellek içi.
- Ürün detay penceresi (`ProductDetailProvider`) yalnız ana sayfayı sarıyor. `ProductCard` görsel/başlık tıklamasıyla detay açar. Sepet (`CartProvider`) `app/layout.tsx` içinde, her sayfada çalışır.
- Ana sayfa `force-static` + `revalidate = 300`; ürünler `readProductFamilies()` (Neon).
- Sayfa örneği: `app/bayilik/page.tsx` (metadata, canonical, BreadcrumbList JSON-LD).
- Gerçek fiyatlar henüz onaylı değil (ürün sayfaları / Product şeması fiyat onayına bağlı). Bugün fiyatlar yalnız pencere açılınca görünüyor, HTML'de yok.

## Kullanılacak araçlar
- Fiilen yükle: `ui-ux-pro-max` (§1 erişilebilirlik, §2 dokunma, §5 düzen ve duyarlılık, §9 gezinme), `frontend-design`, `better-layout`, `better-accessibility`, `responsiveness-check`.
- ECC skill: `frontend-patterns`, `tdd-workflow`.
- Next.js `redirects` (`has` ile sorgu eşleme) için kurulu Next.js 16 belgesini oku; sürüme özgü davranışı tahmin etme.
- 21st MCP: hayır. Mevcut `ProductCard` ve C tasarım dili kullanılır; yeni bileşen yok.
- **Codex alt ajanları (multi_agent):** (a) sayfa ve stiller, (b) menü, yönlendirme ve teklif parametresi, (c) testler paralel yürüyebilir. Birleştirme ve son kontrol ana ajanda.

## Dokunulacak dosyalar
- `app/urunler/page.tsx` (oluştur) + sayfa stili (oluştur)
- `components/landing/ProductGroups.tsx`, `components/landing/ProductGroups.module.css` (düzenle)
- `components/site/Navbar.tsx`, `components/site/NavbarMenu.tsx` (düzenle)
- `next.config.*` (yönlendirme), teklif parametresini okuyan küçük istemci parçası (ana sayfa)
- `tests/unit/*` (yeni testler + aşağıdaki mevcut testlerin dönüştürülmesi)

## Adımlar
1. **Yeni sayfa `app/urunler/page.tsx`** (sunucu bileşeni, `force-static` + `revalidate = 300`, `readProductFamilies()`):
   - Görünür breadcrumb: "Ana Sayfa" (`/`) / "Ürünler" (`aria-current="page"`).
   - H1 "Tüm ürünler", altında "Ambalajınızı seçin, sepetinize veya teklifinize ekleyin."
   - Ürün ızgarası: bugünkü penceredeki sıra (`imageKey` sıralı) ve aynı `ProductCard` (`staticPresentation`, `featured={false}`). Kart yüzeyi ve renkleri penceredekiyle aynı: fildişi kart, altın fiyat, altın "Teklife ekle" düğmesi. Kapsayıcı ana sayfa bölümleriyle aynı genişlikte (en çok 1240 px).
   - Sütunlar: ≥ 1024 px 3; 640–1023 px 2; 360–639 px 2 (bu aralıkta fiyat üstte, "Sepete ekle" ve "Teklife ekle" tam genişlik alt alta); < 360 px 1. `ProductCard` bileşeninin kendisini değiştirme; sayfa stilinden düzenle (pencerede yapıldığı gibi).
   - Ürün yoksa `role="status"` ile "Görüntülenecek ürün bulunmuyor."
   - Her kartta "Teklife ekle" **bağlantıdır**: `/?teklif=<ürün id>#toptan` (JavaScript olmadan da gider). Erişilebilir ad: "Teklife ekle: <ad>, <boy>".
   - Kart görseli/başlığı ürün detay penceresini açar: sayfayı `ProductDetailProvider products={products}` ile sar, `quoteEnabled` **kapalı** (bu sayfada teklif, kart bağlantısıyla yapılır).
   - İkinci kaydırma alanı yok; "Kapat" düğmesi yok. Normal sayfa kaydırması.
   - Metadata: başlık "Ürünler | AFİNA ZEYTİN", açıklama, canonical `/urunler`, OpenGraph; BreadcrumbList JSON-LD (`app/bayilik/page.tsx` gibi).
   - **Arama motorlarına şimdilik kapalı:** `robots: { index: false, follow: true }`. `app/sitemap.ts` ve `llms.txt` dosyalarına EKLEME. Product/Offer şeması ekleme. Gerçek fiyatlar onaylanınca açılacak.
2. **Ana sayfa `ProductGroups`:** `Dialog`, `afina:open-shop` ve `afina:quote-selected` dinleyicileri, `magaza` temizleme kodu ve pencere stilleri kalkar. "Tüm ürünleri gör" `next/link` ile `/urunler` adresine gider; görünüm ve ikonlar aynı kalır. 4 ürün grubu fotoğrafı (detay açar) aynen kalır.
3. **Menü:** `Navbar.tsx` ve `NavbarMenu.tsx` içindeki "Online Mağaza" düz bağlantı olur: `/urunler`. Olay gönderme kalkar; telefon menüsü tıklayınca kapanır. `/urunler` sayfasındayken masaüstündeki "Online Mağaza" `aria-current="page"` alır. Masaüstü menüdeki "Ürünler" (`/#urunler`) değişmez.
4. **Eski bağlantı:** `/?magaza=ac` → `/urunler` sunucu yönlendirmesi (`next.config` `redirects`, `has` query `magaza` = `ac`, kalıcı). Ana sayfanın diğer adresleri etkilenmez.
5. **Teklif parametresi (ana sayfa):** `/?teklif=<id>` ile gelindiğinde id ana sayfa ürün listesinde varsa `chooseProduct(id)` çağrılır (ürün teklif formunda 1 adetle seçili gelir). Parametre `history.replaceState` ile adresten silinir, `#toptan` formuna gidilir ve ilk alana odak verilir (penceredeki bugünkü davranışla aynı). Bilinmeyen veya boş id yok sayılır (hata yok, seçim yok). Ana sayfa `force-static` kalır: parametreyi istemcide oku (`useSearchParams` kullanırsan statik derlemeyi bozma).
6. Kullanılmayan kod/stiller temizlenir. `afina:open-shop` hiçbir yerde kalmaz. `afina:quote-selected` için dinleyici kalmazsa gönderimi de kaldır; kalırsa dokunma.

## Kabul kriterleri
- [x] Unit: `/urunler` render: H1 "Tüm ürünler", breadcrumb, ürün sayısı kadar kart, her kartta `href="/?teklif=<id>#toptan"` olan "Teklife ekle" bağlantısı, boş liste iletisi. Metadata: başlık, canonical, `robots` noindex/follow, BreadcrumbList.
- [x] Unit: "Tüm ürünleri gör" ve iki "Online Mağaza" bağlantısı `href="/urunler"`; ana sayfada "Tüm ürünler" başlıklı `role="dialog"` yok.
- [x] `rg -n "afina:open-shop|magaza=ac" app components lib` yalnız yönlendirme tanımını bulur (başka sonuç yok).
- [x] Unit: `?teklif=` geçerli id → ürün seçili ve parametre silinmiş; bilinmeyen id → seçim yok, hata yok.
- [x] Yönlendirme testte doğrulanır. `npm run build && npm run start` sonrasında `curl -sI 'http://localhost:3004/?magaza=ac'` → 308 ve `location` `/urunler` ile başlar; `curl -s http://localhost:3004/urunler` → 200 ve `noindex` içerir; `curl -s http://localhost:3004/sitemap.xml` `/urunler` içermez.
- [x] Mevcut testler silinmez, yeni davranışa dönüştürülür: `gallery-interactions-178`, `classic-home-184`, `classic-navigation-184`, `classic-commerce-184`, `navbar-menu-174`.
- [x] `app/sitemap.ts` ve `llms.txt` değişmemiş.
- [x] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `git diff --check` yeşil.
- [ ] Tarayıcı doğrulaması Claude'da (360 / 390 / 768 / 1024 / 1440): yatay taşma yok, ikinci kaydırma alanı yok, düğmeler ≥ 44 px, yazı kesilmez.

## Yapılmaması gerekenler
- `ProductCard` tasarımını, fiyatları, ürün verisini, sepet/ödeme/üyelik akışını değiştirme.
- Masaüstü menü "Ürünler" bağlantısını, ana sayfadaki 4 grup fotoğrafını ve ürün detay penceresinin kendisini değiştirme.
- Yeni bağımlılık ekleme; yeni medya üretme.
- `AFINA-KAYNAK/` git'e eklenmez (`git add -f` YASAK).
- **Push yok, production yayını yok.** Testler yeşilse tek kayıt (commit) at; `origin main` gönderimini Claude kullanıcı onayıyla yapar.
- `docs/` altında yalnız bu dosyaya Coder Notu ve Durum.

## Coder Notu
- 10 Kasım 2026: üç Codex alt ajanı sayfa/stil, menü/yönlendirme/teklif ve test işleri için kullanıldı; birleştirme ve son kontroller ana ajanda yapıldı. İstenen UI/UX, frontend-design, better-layout, better-accessibility, responsiveness-check, frontend-patterns ve tdd-workflow rehberleri okundu. Yeni bileşen/dependency ve 21st kullanımı yok.
- RED: sayfa henüz yokken sayfa testi; eski menü adresi ve düğme davranışlarında beklenen hatalar görüldü. GREEN: ilgili 39 test ve yeni yönlendirme/teklif kontrolleri geçti. Beş eski test dosyası dönüştürüldü; ürün detayından teklif/sepet ve odak dönüşü kapsamı korundu.
- Yerel kontroller: lint, typecheck, `npm run test -- --maxWorkers=2` (135 dosya / 1349 PASS; önceden mevcut yerel Postgres gerektiren 6 dosya / 26 test atlandı), varlık kontrolü ve Next 16.4.2 Turbopack production derlemesi PASS; `git diff --check` PASS. Testlerin ilk toplu koşusundaki bellek içi veritabanı zaman aşımı, iki işçiyle tam yeniden koşuda geçmiştir.
- Derleme ve yerel sunucu, ortam ayarlarına dokunmadan geçici Node bağlantı engeliyle çalıştırıldı: yalnız yerel bağlantı serbest, uzak veritabanına bağlantı açılamaz. Derlemede `npm run check:assets` ve npm build ile aynı Next komutu (`node --import ./output/tmp/local-only.mjs node_modules/next/dist/bin/next build`) kullanıldı. Katalog mevcut onaylı statik yedeğiyle doğrulandı; canlı Neon okunmadı.
- Yerel başsız Chromium: 320/360/390/768/1024/1440 genişliklerde 6 kart, yatay taşma 0, iç kaydırma alanı 0 ve 44px altı ürün sayfası kontrolü 0; gerçek teklif bağlantısı → ana sayfada 1 ürün/1 adet seçimi PASS. HTTP: eski adres 308, location `/urunler?magaza=ac`; `/urunler` 200 ve noindex; sitemap'te `/urunler` yok. `app/sitemap.ts` ve `llms.txt` değiştirilmedi. Kanıt: git dışındaki `output/task188/report.json` ve ekran görüntüleri.
- Karşılanmayan ayrı kabul: görevde Claude'a bırakılan tarayıcı doğrulaması bu Codex çalışmasında yapılmış sayılmadı; ilgili kutu açık bırakıldı. Yukarıdaki Chromium sonucu yerel uygulama kontrolüdür. Durum, yerel uygulama/test tesliminin tamamlandığını belirtir; Claude incelemesi veya fiziksel cihaz/yayın onayı değildir.
- Push, production/Vercel yayını, ortam değişikliği ve canlı veritabanı işlemi yapılmadı. AFINA-KAYNAK ve output kayda alınmadı.

## Durum: TAMAMLANDI
