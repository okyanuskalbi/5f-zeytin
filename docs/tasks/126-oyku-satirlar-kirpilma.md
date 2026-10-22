# Task 126: Tesis öyküsü — sticky çerçeve kalkar, üç satır; fotoğraflar kırpılmadan

## Tür
frontend

## Amaç
Kullanıcı (22 Eki):
- "Scrolling yaparken kırpılmalar ve alt boşluklar oluşuyor, hem mobil hem masaüstünde."
- Öykü çerçevesi ekran görüntüsüyle: "Bunu düzelt, foto görünmüyor ki." (teneke çerçevenin sağ kenarında yarım kesik)

Claude'un canlı taraması (masaüstü 1440 her 300px, iPhone 14 WebKit her 260px):
`~/PROJELER/AFINA-KAYNAK/araclar/log/bosluk2/z-desktop-serit.jpg`, `z-iphone-serit.jpg` ve tek kareler `z-desktop/f-*.png`, `z-iphone/f-*.png`.
- **Masaüstü:** sticky 4:5 çerçeve sol üstte kalıyor; adımlar `min-height: 70svh` olduğundan çerçevenin altında ve adımlar arasında büyük boş yeşil alanlar. Bir karede çerçeve üst nav'ın altına girip kesiliyor.
- **iPhone:** bir karede üç fotoğraf üst üste şeritler halinde kesik görünüyor (`z-iphone/f-009..010`). Adım metni sticky çerçevenin altından geçerken yarım kalıyor (`f-011..013`).
- **Kırpılma:** sahne fotoğrafları 16:9, tesis 16:10. Çerçeve 4:5 + `object-fit: cover` olduğu için teneke ve şişe kenardan kesiliyor.

## Karar (Claude)
Sticky çerçeve + çapraz geçiş **kaldırılır**. Öykü, üç ayrı satır olarak akar. D provasının imza hareketi yerine her satırda sade bir giriş hareketi ve fotoğrafta hafif paralaks kalır. Bu, kullanıcı şikâyetini kökten çözer. `docs/DESIGN.md` hareket bölümü bu görevle güncellenmiş sayılır (Claude günceller).

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (§5 Layout & Responsive), `frontend-design`, `better-layout`, `motion-framer`, 21st MCP ("feature section alternating image text", "story timeline" ara; uyarla), `shadcn-ui` (gerekirse). `responsiveness-check` Claude'da. Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- `tdd-workflow`, `frontend-patterns`, `animation-performance`.

## İstenen
1. **Yapı** (`components/landing/Story.tsx` + module; `id="tesisimiz"` korunur): üç `<article>` satırı. Her satır: numara (01/02/03), başlık, metin, fotoğraf. Metinler ve caption'lar değişmez.
2. **Masaüstü (≥ 1024):** her satır 2 kolon, fotoğraf ve metin yan yana; 01 fotoğraf solda, 02 sağda, 03 solda. Kolon oranı 7/5 (fotoğraf geniş). Satırlar arası 96–120px, bölüm üst/alt padding 112/112. Metin dikeyde ortalı. **Hiçbir genişlikte ekranın %30'undan büyük boş alan kalmaz.**
3. **Tablet (768–1023):** aynı iki kolon, oran 1/1, aralık 72px.
4. **Telefon (< 768):** fotoğraf tam genişlik (kenarlardan 16px), altında numara + başlık + metin. Satırlar arası 56px. Sticky yok, üst üste binme yok.
5. **Fotoğraflar kırpılmadan:**
   - Fotoğrafın kendi oranı kullanılır: sahne görselleri `aspect-ratio: 16/9`, tesis `16/10`. `object-fit: cover` yalnız aynı oranda (fiilen kırpma yok).
   - Ürün tam görünmeli: 01 sahne-kırma görselinde teneke, 03 sahne-yağ görselinde şişe tamamen kadrajda. Gerekirse `object-position` ile odak ayarla. Caption hapı ürünün üstüne binmesin (sol alt köşe, ürün sağdaysa sorun yok; değilse sağ alt).
   - Radius 22–26px, gölge mevcut token.
6. **Hareket:** her satır `whileInView` ile girer (fotoğraf ve metin 80ms arayla, y 24px + opacity, `once`). Fotoğrafa satır içinde en çok 24px dikey paralaks (`useScroll` + `useTransform`, transform only). Reduced-motion'da hareket yok. Kaydırma kilidi, pin, sticky yok.
7. **Kahraman band (`HeroBand`) ve diğer bölümler değişmez.** Yalnız öykü ile band arasındaki boşluk 96px'i geçmesin.
8. Eski sticky/IO kodu, `.sticky`/`.frame`/step opaklık stilleri ve ilgili testler kaldırılır ya da yeni yapıya göre yeniden yazılır.

## Kabul kriterleri
- [ ] Unit: üç `article`, her birinde numara/başlık/metin/fotoğraf; sticky konumlu öğe yok.
- [ ] Unit: sahne fotoğraflarının kabı 16/9, tesis 16/10 oranında; fotoğraf alt metinleri ve plakası bulanık tesis kaynağı korunur.
- [ ] Unit: reduced-motion'da transform yok.
- [ ] E2E (yaz, çalıştırma) `tests/e2e/story-126.spec.ts`: 390/768/1440'ta öykü bölümünde her 200px kaydırmada ekranın %30'undan büyük düz renk alanı yok; fotoğraf kapları viewport'ta iken üst üste binen iki fotoğraf yok; ürün görselinin sınırı kap içinde.
- [ ] `npm test`, lint, typecheck, build yeşil; 118–125 testleri korunur (öyküye ait eski testler yeni yapıya uyarlanır).
- [ ] Tarayıcı doğrulaması Claude'da (iPhone + Pixel + 1440 + 768 şeritleri).

## Yapılmaması gerekenler
- Metin/caption değiştirme; yeni görsel üretme; plakası bulanık olmayan kaynak.
- Diğer bölümlerin tasarımına dokunma.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
