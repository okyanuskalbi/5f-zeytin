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

## Durum: BEKLİYOR
