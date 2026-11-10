# Task 193: Ürün detay sayfaları + kategori yapısı (referans sitedeki gibi)

## Tür
frontend

## Amaç
Müşteri revizesi (BRIEF.md): "Ürünler ayrı sayfada gene örnekteki sitede gibi açılabilir. Tüm Ürünler butonu ile klasik mağaza sayfasına yönlenecek. Kategorilerin ayrı sayfaları olacak. Örnek sitenin yapısı kullanılabilir." Ürün detay penceresi yerine her ürünün kendi sayfası olur; kategori yapısı "Zeytinyağı" ve "Zeytin (Siyah / Yeşil / Kırma)" olarak düzenlenir.

## Bağlam
- 192 tamamlandıktan sonra aynı ağaçta. 190 grup modeli: `lib/catalog/groups.ts` (siyah-zeytin, yesil-zeytin, kirma-zeytin, zeytinyagi), aileler `lib/catalog/static-products.ts` (`groupId`), sayfalar `app/urunler/`, ortak `CatalogShell`, `CategoryNavigation`, `ProductListing`.
- Ürün detay penceresi: `components/catalog/ProductDetail*`, `ProductDetailProvider` (galeri, boy seçimi, sepete ekle, açıklama tablosu, teklif).
- Referans: `https://www.kokluzeytincilik.com.tr/` ürün ve kategori sayfaları (tarayıcıyla incele; içerik kopyalama).

## Kullanılacak araçlar
- Fiilen yükle: `ui-ux-pro-max` (§2, §5, §8, §9), `frontend-design`, `better-layout`, `better-accessibility`, `motion-framer`, `responsiveness-check`.
- ECC: `frontend-patterns`, `tdd-workflow`, `e2e-testing`, `seo` (Product şeması YOK, aşağıya bak).
- Codex alt ajanları: (a) ürün sayfası, (b) kategori yapısı + gezinme, (c) testler.

## Adımlar
1. **Kategori yapısı:** üst grup "Zeytin" (`/urunler/zeytin`) eklenir; altında Siyah Zeytin, Yeşil Zeytin, Kırma Zeytin (mevcut sayfalar kalır). "Zeytinyağı" (`/urunler/zeytinyagi`) kalır. Kategori gezinmesi: Tüm ürünler · Zeytinyağı · Zeytin (alt: Siyah · Yeşil · Kırma). Zeytin sayfası tüm zeytin ailelerini listeler; alt kategoriler oradan da seçilebilir. Tek kaynak `lib/catalog/groups.ts` (üst/alt ilişki burada). Ana sayfadaki "Zeytin" kutusu bu sayfaya gider.
2. **Mağaza sayfası** (`/urunler`, referanstaki "Tüm Ürünler"): solda (masaüstü) kategori listesi, üstte sonuç sayısı ve sıralama (Önerilen / Fiyat artan / Fiyat azalan; adres parametresiyle `?sirala=`), telefonda kategori ve sıralama üstte açılır alan/şerit. Mevcut kart ve "Teklife ekle" korunur.
3. **Ürün sayfası `app/urun/[slug]/page.tsx`:** her **aile** bir sayfa (ör. `/urun/dogal-kirma-yesil-zeytin`), boylar sayfada seçilir (`?boy=` ile doğrudan bağlantı). İçerik: içerik yolu (Ana Sayfa / Ürünler / Kategori / Ürün), büyük galeri (mevcut onaylı görseller, küçük resimler), ad, boy seçimi, fiyat, stok durumu ("Mevcut değil" 189 görünümü), adet + "Sepete ekle", "Toptan teklif al" (`/toptan-satis?teklif=<id>`, 194), mevcut açıklama ve bilgi tablosu (detay penceresindeki metinler), "Güvenli Ödeme" logoları, altta "Benzer Ürünler" (aynı üst kategori, 4 kart). `generateStaticParams`, `dynamicParams=false`, `force-static` + `revalidate=300`. Metadata: başlık, açıklama, canonical, **noindex/follow** (gerçek fiyat onayına kadar), BreadcrumbList. **Product/Offer şeması EKLEME.**
4. **Kartlar sayfaya gider:** tüm ürün kartlarında (ana sayfa ızgaraları, mağaza, kategoriler) görsel ve ad `/urun/<slug>?boy=<boy>` bağlantısıdır. Ürün detay **penceresi** kaldırılır (kullanılmayan kod silinir); sepet/teklif davranışı sayfada aynı.
5. Eski adresler: `/?urun=` gibi eski detay parametreleri varsa ürün sayfasına yönlenir; bilinmeyen ürün 404.

## Kabul kriterleri
- [ ] Unit: kategori ağacı tek kaynak; Zeytin sayfası 3 zeytin ailesinin tüm boylarını, Zeytinyağı 2 boyu listeler; sıralama doğru.
- [ ] Unit: her aile için ürün sayfası: H1, boy seçimi `?boy=` ile seçili gelir, fiyat/stok seçilen boya göre değişir, sepete ekle doğru `productId` ile çalışır, "Mevcut değil" devre dışı, benzer ürünler, metadata (canonical, noindex), BreadcrumbList; Product şeması yok.
- [ ] e2e: kart → ürün sayfası → boy değiştir → sepete ekle → sepet sayısı artar; telefon ve masaüstü; renk karşıtlığı 0 ihlal; CLS < 0.05; yatay taşma yok.
- [ ] `npm run build` sonrası tüm ürün ve kategori sayfaları 200 + noindex; bilinmeyen 404; sitemap'te yok.
- [ ] `npm run lint`, `typecheck`, `test`, `build`, `git diff --check` yeşil.

## Yapılmaması gerekenler
- Fiyat/stok/görsel/ürün verisi değişikliği; yeni ürün; sahte yorum/puan/"kişi inceliyor".
- Push/yayın yok; `node_modules`/`.next` silme; AFINA-KAYNAK git'e eklenmez.
- `docs/` altında yalnız Coder Notu ve Durum.

## Durum: BEKLİYOR
