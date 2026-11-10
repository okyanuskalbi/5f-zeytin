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
- [x] Unit: kategori ağacı tek kaynak; Zeytin sayfası 3 zeytin ailesinin tüm boylarını, Zeytinyağı 2 boyu listeler; sıralama doğru.
- [x] Unit: her aile için ürün sayfası: H1, boy seçimi `?boy=` ile seçili gelir, fiyat/stok seçilen boya göre değişir, sepete ekle doğru `productId` ile çalışır, "Mevcut değil" devre dışı, benzer ürünler, metadata (canonical, noindex), BreadcrumbList; Product şeması yok.
- [x] e2e: kart → ürün sayfası → boy değiştir → sepete ekle → sepet sayısı artar; telefon ve masaüstü; renk karşıtlığı 0 ihlal; CLS < 0.05; yatay taşma yok.
- [x] `npm run build` sonrası tüm ürün ve kategori sayfaları 200 + noindex; bilinmeyen 404; sitemap'te yok.
- [x] `npm run lint`, `typecheck`, `test`, `build`, `git diff --check` yeşil.

## Yapılmaması gerekenler
- Fiyat/stok/görsel/ürün verisi değişikliği; yeni ürün; sahte yorum/puan/"kişi inceliyor".
- Push/yayın yok; `node_modules`/`.next` silme; AFINA-KAYNAK git'e eklenmez.
- `docs/` altında yalnız Coder Notu ve Durum.

## Coder Notu

- Task192 `c465c90` kaydından sonra bu göreve sırayla başlandı. Müşteri BRIEF'i ve referansın gerçek kategori/ürün sayfaları incelendi; 390/1440 görüntü ve oranları `output/task193/referans/` içinde. Referans içerik/görsel/logo kullanılmadı.
- Alt ajanlar ürün sayfası, kategori/gezinme ve test/bağımsız inceleme olarak çalıştı. Önceki görevde yüklenen `ui-ux-pro-max`, `frontend-design`, `better-layout`, `better-accessibility`, `motion-framer`, `responsiveness-check`, `frontend-patterns`, `tdd-workflow`, `e2e-testing` ile bu görevin `seo` skill'i uygulandı; kurulu Next.js page/redirects/statik sayfa kuralları okundu. Product/Offer şeması özellikle eklenmedi.
- RED: eski derlemede gerçek ürün yolu 404, yeni kategori ağacı ve eski ürün sorgusu yönlendirme testleri başarısız doğrulandı. GREEN: 4 aile sayfası; büyük/küçük görsel seçimi, doğrudan boy bağlantısı, adet/stok, gerçek SKU ile sepet ve teklif bağlantısı; tüm kartlarda gerçek bağlantılar; eski detay penceresi ve kullanılmayan üç dosyası kaldırıldı. Eski 188–191 ve 130/133/184 testleri silinmeden yeni davranışa uyarlandı.
- Kategori ağacı tek kaynakta: Zeytinyağı + Zeytin; Zeytin altında Siyah/Yeşil/Kırma. Zeytin 3 aile/4 boy, yağ 2 boy gösterir. Masaüstü yan menü, telefon şeridi, sonuç sayısı ve `?sirala=` ile fiyat sıralaması var. Üst menü/alt bilgi aynı kaynağı kullanır. Altı SKU'nun fiyat/stok/ambalaj/görsel/verisi değiştirilmedi.
- Ürün sayfaları statik, `dynamicParams=false`, `revalidate=300`, canonical + noindex/follow ve BreadcrumbList taşır; Product/Offer yok. Eski altı `/?urun=` adresi 308 ile doğru aile ve boya gider; bilinmeyen ürün 404 olur. Ürün/kategori yolları sitemap dışında kalır. İlk açılışta teklif alanının henüz kullanılamadığı sırada odak almama hatası ayrıca RED/GREEN ile düzeltildi; alan hazır olduğunda bir kez odaklanır.
- Yerel kontroller: lint/typecheck/build/diff-check başarılı; 154 dosyada 1.427 test geçti, mevcut 26 yerel DB testi bağlantı tanımlı olmadığı için atlandı. Canlı veritabanı/ortam/yayın işlemi yapılmadı. 141 benzersiz güncel tarayıcı senaryosunun ilk koşusunda 139 geçti; ekleme anındaki yazı ve mini sepet geçişinin bitmesini beklemeyen 2 ölçüm düzeltildi ve ilgili 9/9 senaryo tekrar geçti (7 tekrarlı + önce başarısız 2). Ölçüm animasyonlar tamamlandığında gerçek renkleri denetler; kontrol gizleme/renk istisnası yok. 390/1440 ürün görüntüleri `output/task193/`, CLS 0, taşma 0, renk karşıtlığı ihlali 0; doğrudan varsayılan dışı 5 L boy açılışı da geçti. Mevcut 189 renk/sistem modu, 189-1 alt bilgi, 190 kategori, 191 hareket ve 192 ana sayfa kontrolleri tekrar çalıştırıldı.
- **Karar (10 Kasım 2026, kullanıcının ilettiği Claude kararı):** “Benzer Ürünler” en fazla 4 farklı karttır. Geçerli SKU hariç önce aynı üst kategoriden ürünler seçilir; eksik kalan yerler diğer mevcut ürünlerden doldurulur. Uygun ürün yoksa bölüm bütünüyle gösterilmez. Bu karar, önceki “aynı kategoriden kesin 4 kart” yorumunu değiştirir; yeni ürün/veri eklenmez. Küçük uygulama belirsizliklerinde görev amacına uygun en sade seçim Coder Notu’na yazılarak sürdürülür.
- Fiziksel cihaz ve Claude'un ayrı görsel kabulü yapılmış sayılmaz. `node_modules` / `.next` korunur; test tarayıcıları ve bu işe ait yerel sunucu düzgün kapatıldı. AFINA-KAYNAK/ham video Git'e eklenmedi; push/yayın yok.

- Karar sonrası son kabul: aynı kategori önceliği, diğer kategoriden tamamlama, seçili SKU hariç tutma, tekrarları eleme ve boş bölümü gizleme testleri RED/GREEN ile doğrulandı. Son kaynakta tam unit/lint/typecheck/build/diff-check yeşil; ürün/kategori ve önceki detay regresyonlarının 28/28 tarayıcı kontrolü geçti. Böylece önceki durma nedeni kapandı.

## Durum: TAMAMLANDI
