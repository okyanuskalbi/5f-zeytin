# Task 195: Blog (liste + 4 demo yazı, çalışan sayfalar)

## Tür
frontend (içerik dahil)

## Amaç
Müşteri revizesi (BRIEF.md): "Bir blog kısmı olsun ve aynı örnekteki (köklü zeytindeki gibi) 3-5 demo yazı olsun. Onun sitesinde açılmıyor ama bizde çalışsın."

## Bağlam
- 192 ana sayfada 3'lü blog önizlemesi koydu (`lib/blog/`); bu görev listeyi ve yazı sayfalarını tamamlar.
- Görseller: yalnız mevcut onaylı fotoğraflar (zeytinlik, zeytin dalı, hasat, fabrika, ürün görselleri). Yeni görsel üretme.

## Kullanılacak araçlar
- Fiilen yükle: `copywriting`, `better-typography`, `frontend-design`, `better-accessibility`, `responsiveness-check`.
- ECC: `frontend-patterns`, `tdd-workflow`, `seo`.

## Adımlar
1. **Veri:** `lib/blog/posts.ts` (ya da MD dosyaları + yükleyici): başlık, kısa ad, özet, kapak görseli, tarih, okuma süresi, içerik (başlıklar, paragraflar, liste). 4 yazı:
   - "Salamura Zeytin Nasıl Hazırlanır?" (geleneksel salamura süreci, genel bilgi)
   - "Kırma Zeytin Nedir, Nasıl Saklanır?"
   - "Natürel Sızma Zeytinyağı Nasıl Saklanmalı?" (ışık, ısı, hava; genel bilgi)
   - "Sofralık Zeytin Seçerken Nelere Dikkat Edilmeli?"
   Her biri 400–700 kelime, sade Türkçe, genel bilgi. **Sağlık iddiası, tedavi/hastalık vaadi, uydurma istatistik, kaynaksız rakam YOK** (gıda reklam mevzuatı). AFİNA ürünlerine yalnız doğal bağlantı (ilgili kategori sayfası). "Ayvalık"/referans site metni yok.
2. **`/blog`:** H1, kısa açıklama, yazı kartları ızgarası (kapak, başlık, özet, tarih, "Devamını oku").
3. **`/blog/[slug]`:** içerik yolu, H1, tarih, okuma süresi, kapak, içerik (okunaklı tipografi, satır uzunluğu ≤ 75 karakter), ilgili ürünler (2–3 kart), diğer yazılar. `generateStaticParams`, `dynamicParams=false`.
4. SEO: metadata, canonical, BlogPosting şeması (author: AFİNA ZEYTİN, datePublished), BreadcrumbList; sitemap + `llms.txt` + `feed.xml` (mevcut Atom beslemesine yazılar eklenir).
5. Ana sayfa blog önizlemesi aynı veriden ilk 3 yazıyı gösterir; menü ve alt bilgide "Blog".

## Kabul kriterleri
- [x] Unit: 4 yazı; liste ve yazı sayfaları render; metadata, BlogPosting, BreadcrumbList; yasak ifadeler testi (ör. "tedavi", "iyileştirir", "kanser", "kolesterol", "%", "Ayvalık", "Köklü" geçmez).
- [x] e2e: `/blog` ve her yazı 200; 390/768/1440 taşma yok; renk karşıtlığı 0 ihlal; ana sayfadan yazıya geçiş.
- [x] sitemap, llms.txt, feed.xml yazıları içerir.
- [x] `npm run lint`, `typecheck`, `test`, `build`, `git diff --check` yeşil.

## Yapılmaması gerekenler
- Yeni görsel üretimi; sağlık iddiası; başka siteden metin kopyalama.
- Push/yayın yok; `node_modules`/`.next` silme; AFINA-KAYNAK git'e eklenmez.

## Coder Notu

- Task194 `deb1192` kaydından sonra sırayla başlandı. PLAN/BRIEF/görev okundu; alt ajanlar özgün içerik, blog sayfaları ve test/bağımsız inceleme olarak çalıştı. `copywriting`, `better-typography`, `frontend-design`, `better-accessibility`, `responsiveness-check`, `frontend-patterns`, `tdd-workflow`, `seo` uygulandı; mevcut e2e-testing düzeni ve kurulu Next.js statik sayfa kılavuzu korundu. 21st MCP 9321/29507/10598 kart örnekleri incelendi; mevcut fotoğraf/kart/token düzeni uyarlandı, ücretli kod veya bağımlılık eklenmedi.
- RED: eski derlemede /blog 404, dört yazının gövdesi eksik, sitemap/llms/Atom yeni yazıları içermiyordu. GREEN: dört sabit adres ve önizleme verisi korunarak 477/490/497/489 kelimelik özgün metinler, alt başlıklar/paragraflar/listeler ve ilgili kategori bağlantıları eklendi. Paragraflar tek başına da 400 kelimeyi aşar. Sağlık/hastalık vaadi, kaynaksız rakam, oranlı ev salamurası tarifi, referans site metni ve yasak ifadeler yok; bağımsız içerik incelemesi ve testleri geçti.
- Küçük içerik kararları: rehberler genel hazırlama/saklama/seçim bilgisidir; ürünün kendi etiketine öncelik verir. Mevcut 10 Kasım 2026 tarihleri ve tahmini dört dakikalık okuma bilgisi korundu. Yalnız mevcut onaylı kapaklar kullanıldı. İlgili kategoriye göre 2–3 gerçek ürün gösterilir; yeni ürün/fiyat/stok/görsel üretilmedi.
- /blog dört kartı tarih/özet/okuma bağlantısıyla gösterir. Dört ayrı yazıda içerik yolu, H1, tarih, okuma süresi, kapak, 68ch yazı alanı, ilgili ürünler ve diğer üç yazı vardır. Ana sayfa aynı kaynaktan ilk üç yazıyı gösterir. Tam sayfa görüntülerinde aşağıda kalan gerçek fotoğraflar da yüklenip doğrulandı; boş görsel veya kontrol gizleme yok.
- Yazılar statik params + dynamicParams=false ile üretilir; bilinmeyen yazı 404. Canonical/index-follow, AFİNA ZEYTİN yazarlı BlogPosting ve BreadcrumbList var; Product/Offer yok. Sitemap dokuz kamuya açık URL içerir, fiyatlı ürün/kategori yolları dışarıda kalır. llms.txt tüm yazıları, Atom ise dört yazıyı ve tarihi korunan eski ana sayfa kaydını içerir; XML ayrıştırılarak ve metin kaçışları korunarak doğrulandı.
- Tarayıcı RED/GREEN ek bulgusu: ilgili ürünlerin eski açık altın fiyat yazısı açık zeminde okunmuyordu; yalnız blog kapsamındaki fiyat rengi mevcut koyu altına geçirildi. Yeni sayfaların tamamı tekrar denetlendi.
- Son kabul: 161 dosyada 1.463 unit PASS; mevcut 26 yerel DB testi yapılandırılmadığı için atlandı. Lint/typecheck/Turbopack build/diff-check PASS. Önceki görevlerle ortak 64 senaryonun 61'i ilk koşuda geçti; blogdaki üç renk bulgusu düzeltildikten sonra son blog paketi 7/7 PASS (önce başarılı dört + düzeltilen üç). 390/768/1440 listede ve dört yazıda toplam 15 sayfa görüntüsü/raporu `output/task195/`; CLS 0, taşma 0, axe renk ihlali/pageerror/boş görsel 0. Ana sayfa → yazı → kategori → gerçek ürün, canonical/404, sitemap/llms ve geçerli Atom kontrolleri PASS. Önceki testler silinmeden yeni yazı kayıtlarına göre güncellendi.
- Fiziksel cihaz ve Claude'un ayrı görsel kabulü yapılmış sayılmaz. Canlı DB/ödeme/ortam değişikliği/push/yayın yok. AFINA-KAYNAK ve ham video Git dışında; yeni görsel üretimi yok. `node_modules` ve `.next` korundu; açılan paketli headless Chromium ve yerel sunucu düzgün kapatıldı.

## Durum: TAMAMLANDI
