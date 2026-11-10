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
- [ ] Unit: 4 yazı; liste ve yazı sayfaları render; metadata, BlogPosting, BreadcrumbList; yasak ifadeler testi (ör. "tedavi", "iyileştirir", "kanser", "kolesterol", "%", "Ayvalık", "Köklü" geçmez).
- [ ] e2e: `/blog` ve her yazı 200; 390/768/1440 taşma yok; renk karşıtlığı 0 ihlal; ana sayfadan yazıya geçiş.
- [ ] sitemap, llms.txt, feed.xml yazıları içerir.
- [ ] `npm run lint`, `typecheck`, `test`, `build`, `git diff --check` yeşil.

## Yapılmaması gerekenler
- Yeni görsel üretimi; sağlık iddiası; başka siteden metin kopyalama.
- Push/yayın yok; `node_modules`/`.next` silme; AFINA-KAYNAK git'e eklenmez.

## Durum: BEKLİYOR
