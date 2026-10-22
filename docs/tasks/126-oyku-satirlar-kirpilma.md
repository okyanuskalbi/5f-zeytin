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

## Coder Notu

- Sticky çerçeve, etkin adım state'i, özel IntersectionObserver/resize kodu ve çapraz geçiş kaldırıldı. `#tesisimiz` ve `data-story-step` sözleşmesi korundu; üç ayrı, başlığıyla etiketli `article` oluşturuldu. Metinler, caption'lar, alt metinler ve plakası bulanık tesis manifesti aynı kaldı.
- Telefon: fotoğraf önce, metin sonra; 16px kenar ve 56px satır aralığı. Tablet: 1/1 kolon ve 72px aralık. Masaüstü: dönüşümlü 7/5–5/7 kolon, 96px aralık, 112px bölüm padding'i. Masaüstünde wrapper'ın sonundaki -40px pay, fotoğrafın 12px rezervi ve ±12px paralaksıyla birlikte band öncesi görünür boşluğu en çok 96px tutar. HeroBand ve diğer bölüm bileşenleri değiştirilmedi.
- Fotoğraflar 16/9–16/10–16/9 oranında; radius 24px ve mevcut gölge korunuyor. İki ürün de kaynak görselin sağında olduğundan caption sol altta, genişliği fotoğrafın sol %58'iyle sınırlı. Fotoğrafın tamamı ±12px hareket ediyor; görsel kırpma penceresinin içinde kaydırılmıyor.
- Her satırda `whileInView`, `once`, 24px giriş ve 80ms fotoğraf/metin aralığı var. Hareket değerleri `motionTokens.story` içinde. Reduced-motion, SSR ve hareket API'si bulunmayan durumda tüm fotoğraflar/metinler görünür, transform yok.

### Skill / nerede kullanıldı

| Skill / araç | Nerede kullanıldı |
|---|---|
| `ui-ux-pro-max` | Fiilen yüklendi; §5 Layout & Responsive ve yerel UX/Next.js aramaları: mobil öncelik, taşma/kırpılma, doğal oran ve boyut rezervi. |
| `frontend-design` | Fiilen yüklendi; mevcut AFİNA renk, font, numara ve fotoğraf dilini koruyan üç satır. |
| `better-layout` | Fiilen yüklendi; `minmax(0, ...)`, `min-width: 0`, mantıksal kenar özellikleri ve telefon okuma sırası. Görevin istediği dönüşümlü masaüstü yerleşimi korundu. |
| `motion-framer` | Fiilen yüklendi; satır başına `whileInView` varyantları ve 80ms aralık. |
| 21st MCP | İstenen `feature section alternating image text` ve `story timeline` sorguları, toplam üç arama çağrısı. Kullanılabilir bileşen kaynağı alınamadı; yeni bileşen eklenmeden mevcut Story proje token'larıyla uyarlandı. |
| `shadcn-ui` | Fiilen yüklendi; bu düzenleme yeni shadcn bileşeni gerektirmediğinden CLI ile bileşen eklenmedi. |
| `frontend-patterns` | Fiilen yüklendi; küçük `StoryRow` bileşeni ve sabit içerik listesi. |
| `tdd-workflow` | Fiilen yüklendi; önce altı başarısız regresyon testi, sonra uygulama ve yeşil doğrulama. |
| `animation-performance` | Fiilen yüklendi; yalnız transform/opacity, React state'i üzerinden kare/scroll güncellemesi yok; zoom kaldırıldı. Gerçek cihaz performansı Claude doğrulayacak. |
| `motion-foundations` | Fiilen yüklendi; ortak token'lar, SSR'de görünür içerik ve reduced-motion kapısı. |
| `motion-patterns` | Fiilen yüklendi; bir kez çalışan satır girişi ve varyant aktarımı. |
| `motion-advanced` | Fiilen yüklendi; satıra bağlı `useScroll` + clamp edilen `useTransform`, bağımsız fotoğraf hareketi. |
| `responsiveness-check` | Görev gereği Claude doğrulayacak. |

### Komutla doğrulama / kabul kanıtı

| Kontrol | Sonuç |
|---|---|
| RED: `npm test -- tests/unit/story.test.tsx` | 6 test beklenen nedenlerle başarısız: bağımsız article yok, doğru fotoğraf kabı oranı yok, eski sticky/etkin adım yapısı var. RED checkpoint yalnız yerelde tutuldu, son yeşil commit'e birleştirildi. |
| GREEN: öykü unit testleri | 6/6 geçti: değişmeyen içerik/numara/alt metin, doğal oranlar ve bulanık tesis kaynağı, sticky yokluğu, reduced-motion/SSR, bir kez giriş, bağımsız ±12px paralaks ve observer temizliği. |
| `npm test -- --maxWorkers=2 --coverage --coverage.include=components/landing/Story.tsx` | 34 dosya, 390/390 test geçti. Story: statement/branch/function/line kapsamı %100. Kapsam ölçümü yalnız Story için; genel uygulama coverage iddiası değildir. 118–125 testleri korundu; genel ürün article sayımı ürünlerle sınırlandı, öykünün üç article'ı ayrıca doğrulandı. |
| `npm run lint` | PASS, sıfır uyarı. |
| `npm run typecheck` | PASS; yeni/güncellenen e2e dosyaları da TypeScript kontrolünden geçti. |
| `npm run build` | PASS; prebuild varlık kontrolleri de geçti: 18 görsel + 112 v3 çıktı. |
| `git diff --check` | PASS. |
| E2E — yazıldı, çalıştırılmadı | `tests/e2e/story-126.spec.ts`: 390/768/1440, normal/reduced-motion, her 200px'te görünür medya/metin sınırlarından %30 boş şerit, fotoğraf çakışması, tam kaynak görselinin kap içinde kalması, oran/kolon/kenar ölçüleri ve band boşluğu. `story-v4`, `v4-quality-gate` ve `scenes` içindeki ilgili eski kabuller yeni article yapısına uyarlandı. |
| Tarayıcı kabulü | **Claude doğrulayacak:** iPhone + Pixel + 1440 + 768 kaydırma şeritleri, gerçek kadraj/caption/boşluk ve hareket görünümü. Playwright, Lighthouse, inspect, ekran görüntüsü veya tarayıcı çalıştırılmadı. AGENTS.md gereği bu kapı TAMAMLANDI durumunu engellemez. |

## Durum: TAMAMLANDI
