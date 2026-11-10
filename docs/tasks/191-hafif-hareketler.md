# Task 191: Hafif hareketler (kaydırmaya bağlı olmayan)

## Tür
frontend

## Amaç
Müşteri isteği (10 Kasım 2026, WhatsApp, kullanıcı iletti): "Az bucuk gene animasyon ekle … Scroll animasyonu olmasın da … Ufak tefek şeyler olabilir". Sitedeki sayfalara küçük, zevkli hareketler eklenir. **Kaydırmaya bağlı animasyon olmaz:** sayfa kaydırıldıkça oynayan, ekrana girince beliren, sabitlenen ya da paralaks etkisi yok.

## Bağlam
- 190 (kategori sayfaları) tamamlandıktan sonra aynı ağaçta yürür.
- Site Motion kullanır: `components/site/MotionProvider.tsx` (`m`), tokenlar `lib/ui-motion.ts` (`motionTokens`, `springs`), azaltılmış hareket kancası `usePrefersReducedMotion`.
- Kaydırmaya bağlı kod içeren dosyalar (envanter için başlangıç): `components/catalog/ProductCard.tsx` (`whileInView`, `staticPresentation` yoksa), `components/landing/HeroBand.tsx`, `Story.tsx`, `HeroDepthMotion.tsx`, `SofraHero.tsx`, `components/animation/react-bits/BlurText.tsx`, `components/ui/order-history.tsx`, `pendant-lamp-rail.tsx`, `liquid-glass-logo-reveal.tsx`, `components/media/FramePlayback.tsx`. `components/cart/MiniCart.tsx` içindeki gözlemci işlevseldir (alt bilgi görünürlüğü), animasyon değildir; dokunma.

## İlkeler
- Hareket ya sayfa açılışında **bir kez** olur (yalnız üst bant) ya da **kullanıcının eylemine** yanıttır: üzerine gelme, basma, ekleme, kategori değişimi, açma/kapama.
- Yalnız `transform` ve `opacity`. Süre 150–400 ms; üst bant açılış sırası toplam en çok ~900 ms, fotoğraf yakınlaşması ~1,2 sn. Mevcut tokenlar ve `m` kullanılır; yeni kütüphane yok.
- `prefers-reduced-motion: reduce` → hareket yok, son hâl anında görünür.
- Yerleşim kayması yok (CLS 0). İçerik JavaScript gelmeden de görünür ve okunur: sunucu çıktısında metin görünmez (opacity 0) başlamaz. Hareket yalnız istemci hazır olunca uygulanır ya da yalnız CSS ile yapılır.
- Hover efektleri yalnız `(hover: hover)` cihazlarda. Dokunmatikte basma geri bildirimi (0.98).

## Kullanılacak araçlar
- Fiilen yükle: `motion-framer`, `find-animation-opportunities`, `improve-animations`, `ui-ux-pro-max` (§7 animasyon, §1 azaltılmış hareket), `frontend-design`, `better-accessibility`.
- ECC skill: `frontend-patterns`, `tdd-workflow`, `e2e-testing`.
- **Codex alt ajanları (multi_agent):** (a) üst bant + düğmeler, (b) kartlar + grup fotoğrafları + sepet, (c) kategori gezinmesi + SSS, (d) testler.

## Eklenecekler
1. **Üst bant** (ana sayfa ve bayilik sayfası): açılışta tek sıra; küçük üst yazı → başlık → paragraf → düğmeler, 8–12 px aşağıdan solarak gelir. Fotoğraf 1.04 → 1 ölçek, bir kez.
2. **Ana sayfa grup fotoğrafları:** üzerine gelince fotoğraf 1.05 yakınlaşır, alt şeritteki ok 4 px sağa kayar; basınca 0.98.
3. **Ürün kartları** (`/urunler`, kategori sayfaları): üzerine gelince kart 3–4 px yükselir, gölge yumuşakça belirir, görsel 1.03; klavye odağında da görünür durum.
4. **Sepete ekleme:** "Sepete ekle" → "Eklendi ✓" geçişi küçük ölçek/opacity hareketiyle. Üst menüdeki sepet sayısı artınca rozet kısa bir "pop" yapar (1 → 1.2 → 1).
5. **Kategori gezinmesi** (190): etkin gösterge bağlantılar arasında kayar (Motion `layoutId`). Kategori değişince ürün ızgarası kısa bir solma + sıralı beliriş yapar (kullanıcı eylemi).
6. **Altın düğmeler:** okları üzerine gelince 3 px sağa kayar ("Ürünlerimizi İncele", "Toptan Teklif Al", "Bayilik Başvurusu", "Tüm ürünleri gör", "Teklife ekle" vb.).
7. **SSS:** açılıp kapanırken içerik yumuşakça açılır (opacity + yükseklik; kullanıcı eylemi). Zaten varsa dokunma.
8. **Kaydırmaya bağlı efektler:** vitrinde (ana sayfa, `/urunler`, kategori sayfaları, bayilik, sepet, hesap) görünen `whileInView`/kaydırma tetiklemeli giriş animasyonu varsa kaldırılır (içerik doğrudan görünür). Kullanılmayan eski sinematik bileşenleri silmek bu görevin konusu değil; envanteri Coder Notu'na yaz.

## motion-framer uygulama notları (Claude, kullanıcı `/motion-framer` ile istedi)
Kurulu durum: `motion` 14.4.0; `MotionProvider` → `LazyMotion` + `lib/motion-features.ts` = **`domAnimation`**; genel `MotionConfig` yok; bileşenler `m` kullanır.
1. **`layout` / `layoutId` bu kurulumda ÇALIŞMAZ** (`domAnimation` düzen animasyonu içermez, `domMax` gerekir). Kategori göstergesi (madde 5) için tercih: etkin bağlantının konumunu ölçüp göstergeyi yalnız `transform` (translateX + scaleX, `transform-origin: left`) ile CSS geçişi ya da `m.span animate={{ x, scaleX }}` ile kaydır. Genel özellikleri `domMax`'a yükseltmek ancak gerekçeyle ve paket boyutu farkı (önce/sonra, gzip KB) Coder Notu'na yazılarak yapılır.
2. **Sunucu çıktısında gizli başlama yok:** `initial={{ opacity: 0 }}` gibi başlangıçlar SSR'da satır içi `opacity:0` üretir; JS gecikirse içerik görünmez kalır. Bu yüzden:
   - Üst bant giriş sırası **CSS `@keyframes`** ile (gecikmeli `animation-delay`, `animation-fill-mode: both`), `@media (prefers-reduced-motion: no-preference)` içinde. JS'e bağlı değil.
   - Kategori geçişinde ızgara hareketi: kalıcı `app/urunler/layout.tsx` içinde `pathname` anahtarlı sarmalayıcı; **ilk çizimde `initial={false}`**, yalnız istemci içi kategori değişiminde `{ opacity: 0, y: 8 }` → görünür, çocuklar `staggerChildren` ≤ 0.04 sn (en çok 6 kart).
3. **Hover/basma kalıbı:** üst öğe `whileHover="hover"` + `whileTap="press"` + `initial="rest"`; çocuklar `variants` ile (görsel `scale`, ok `x`). Jest başlangıcına kendi `transition`'ı (≈0.2 sn), bitişe genel `transition` (≈0.3 sn). Basma ölçeği `motionTokens.interaction.tapScale`. Motion'un `whileHover`'ı dokunmatikteki sahte hover'ı zaten yok sayar; CSS hover'ları `@media (hover: hover)` içinde.
4. **Gölge:** `boxShadow` canlandırma (boyama maliyeti) yerine kartın arkasında hazır gölge katmanının `opacity`'si 0 → 1.
5. **"Sepete ekle" → "Eklendi ✓":** `AnimatePresence mode="popLayout"` (ya da `"wait"`), yazıya `key`, çıkış ≤ 150 ms, giriş ≤ 200 ms; düğme genişliği zıplamaz (min genişlik sabit). Sepet rozeti: sayı değişince `key={count}` ile `scale: [1, 1.2, 1]`, `springs.badge`.
6. **Azaltılmış hareket:** `MotionProvider` içine `MotionConfig reducedMotion="user"` ekle (Motion dönüşümleri kapatır, opacity kalır). Mevcut `usePrefersReducedMotion` kullanımlarıyla çelişmediğini test et. CSS animasyonları da yalnız `no-preference` içinde.
7. **Tokenlar:** yeni süre/uzaklık/yay değerleri `lib/ui-motion.ts` içine adlandırılmış olarak eklenir (sihirli sayı yok). Dosyanın başındaki eski "kaydırmaya bağlı hero" yorumu güncellenir.
8. **Yasak kalıplar:** `whileInView`, `useScroll`, `useInView`, `onViewportEnter`, çok sayıda öğede `layout`, genel `will-change`.

## Kabul kriterleri
- [x] Unit: azaltılmış harekette hareketli bileşenler son hâli anında gösterir; üst bant metni sunucu çıktısında görünür (opacity 0 / görünmez başlangıç yok).
- [x] e2e (yeni, kalıcı): (a) ana sayfa, `/urunler` ve bir kategori sayfası yüklendikten 2 sn sonra toplam CLS = 0 (PerformanceObserver `layout-shift`); (b) azaltılmış harekette üst bant öğelerinin `transform` değeri `none` ve opacity 1; (c) **kaydırmaya bağlı hareket yok:** sayfa sonuna kadar kaydırıldıktan sonra ekranda görünen her öğenin opacity'si 1, kaydırma sırasında stil değişimi yok; (d) grup fotoğrafı üzerine gelinince görselin `transform` ölçeği > 1; (e) ürün kartı üzerine gelinince yukarı kayma.
- [x] Mevcut `color-contrast-189` ve `footer-canvas-189-1` testleri geçer.
- [x] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `git diff --check` yeşil.
- [ ] Tarayıcı doğrulaması (görüntü + hareket kaydı) Claude'da.

## Yapılmaması gerekenler
- Kaydırmaya bağlı animasyon, paralaks, sabitlenen bölüm, otomatik dönen karusel, sürekli dönen/yanıp sönen öğe, sayfa geçiş perdesi.
- Yerleşim, renk, metin, görsel değişikliği. Yeni bağımlılık.
- `AFINA-KAYNAK/` git'e eklenmez (`git add -f` YASAK).
- **Push yok, yayın yok.** Testler yeşilse tek kayıt (commit). İş bitince `node_modules` ve `.next` klasörlerini SİLME.
- `docs/` altında yalnız bu dosyaya Coder Notu ve Durum.

## Coder Notu

- 10 Kasım 2026: Task190 `93cd571` kaydından sonra aynı ağaçta yürütüldü. Codex alt ajanları üst bant/düğmeler ve ortak ayarlar; kart/grup/sepet; kategori/SSS; ayrıca kalıcı etkileşim testleri rollerini paylaştı. Son birleştirme, ölçüm ve yerel kabul ana ajanda yapıldı. motion-framer, find-animation-opportunities, improve-animations, ui-ux-pro-max, frontend-design, better-accessibility, frontend-patterns, tdd-workflow, e2e-testing ve proje hareket rehberleri okundu; inceleme rehberleri değerlendirme amacıyla kullanıldı. Claude'un motion-framer uygulama notları korundu ve uygulandı.
- Üst bant metinleri sunucudan görünür gelir; yalnız CSS ile 10 px / 0,5→1 saydamlık sırası 710 ms'de biter, fotoğraf 1,04→1 ölçeği 1,2 saniyede bir kez tamamlanır. Ana sayfa ve bayilik aynı değerleri kullanır. Azaltılmış harekette bu animasyonlar yoktur. Ortak değerler lib/ui-motion.ts içindedir; mevcut LazyMotion/domAnimation korunup MotionConfig reducedMotion=user eklendi. Yeni bağımlılık veya medya yok.
- Grup fotoğrafı 1,05/ok 4 px, kart −4 px/görsel 1,03 ve hazır gölge katmanının saydamlığı kullanıcı etkileşimine yanıt verir. Klavye odağı ve 0,98 basma geri bildirimi var; hover yalnız uygun cihazlarda. Altın düğme okları 3 px kayar. Sepet düğmesinin yazı alanı her iki metnin yerini ayırır; Eklendi geçişi ölçüyü değiştirmez. Rozet ilk kayıtlı sepet yüklemesinde ve adet azalınca oynamaz; yalnız sonraki artışta 1→1,2→1. Kurulu Motion üç duraklı spring'i desteklemediğinden aynı springs.badge süresiyle 350 ms tween kullanıldı.
- Kategori göstergesi mevcut özellik paketinde layoutId yerine ölçülen x/scaleX ile kayar. İlk ürün listesi görünür; yeni kategoriyle eşleşen listede mevcut kart kökleri 250 ms ve 40 ms sıralı giriş kullanır. Ek yerleşim sarmalayıcısı yoktur; eski liste yeni sayfa gelene kadar görünür kalır. Azaltılmış harekette 190'ın asıl seçili dolgusu korunur. SSS doğal details/summary olarak kaldı; destekleyen tarayıcılarda kullanıcı aç/kapa eyleminde yükseklik/saydamlık geçişi vardır. Yükseklik, görevdeki açık SSS istisnasıdır. Desteklemeyen tarayıcı anında açar; fiziksel Safari kabulü yapılmadı.
- RED/GREEN: üst bant/SSR ve genel hareket tercihi, kart/sepet geri bildirimi, kategori/SSS kontrolleri önce başarısız sonra başarılı oldu. Eski 190 derlemesinde fotoğraf ölçeği 1 ve kart kayması 0 olduğu için iki yeni tarayıcı testi başarısızdı. Son görüntü karşılaştırmasında göstergenin özellikler yüklenmeden saydamlık 0'da kalması da bulundu; hazır görünmesine rağmen opacity 0 olan kalıcı kontrol önce RED oldu. Hazır olma görünümü CSS'e bağlandı; gözlemcinin ilk bildiriminin geçişi iptal etmemesi ayrıca test edildi. Son tarayıcı testleri gerçek ara değerleri ve son görünümü ölçer.
- Son yerel kapılar PASS: lint, typecheck, 147 dosyada 1394 birim testi, Next 16.4.2 Turbopack üretim derlemesi ve git diff --check. Önceden mevcut yerel Postgres gerektiren 6 dosya/26 test ayar bulunmadığı için atlandı. Son başsız Chromium koşusu 120/120 PASS: light-motion-191 18, motion-interactions-191 4, category-pages-190 11, color-contrast-189 47 ve footer-canvas-189-1 40. En fazla iki işçi kullanıldı.
- İlk açılışta 390/1440 × ana sayfa/ürünler/bir kategori olmak üzere altı ölçümde CLS tam 0. Azaltılmış harekette iki üst bantta metin transform none/opacity 1; kategori, ürün kartı ve SSS son görünümü anında gelir. Gerçek kategori geçişi, gösterge ara konumu, sabit düğme ölçüsü, rozet artışı ve klavyeyle SSS aç/kapa geçti. Altı vitrin yolunun ana içeriği sonuna kadar tarandı: kaydırmayla transform/saydamlık değişimi ve çalışan animasyon yok. Önceden var olan devre dışı konum seçicisinin sabit 0,6 saydamlığı korunur ve değişmezliği ölçülür; bu durum hareket/gizlenme sayılmadı. Dekoratif öğeler içerik opaklığı kontrolünden ayrıldı. İşlevsel menü bölüm seçimi ve MiniCart alt bilgi gözlemcisi korunur.
- Renk testi 94 açık/koyu taramada 0 ihlal ve 47 görüntü çiftinde 0 fark; alt bilgi testinde 80 açık/koyu görünümde alt tarafta açık piksel yok. 190 öncesi/sonrası değil, 190→191 karşılaştırması output/task191/static-comparison.json içindedir: iki genişlikte ana sayfa/bayilik ve 1440 ürün/kategori görüntüleri piksel olarak aynı; iki 390 ürün ekranının ölçüleri aynı, küçük çizim farkları raporda sayısal olarak korunur (2340/2781 piksel, en büyük kanal farkı 11/255). Bütün ekranlar birebir aynı diye sunulmadı. Kanıtlar output/task191, output/task189-sonra ve output/task189-1-footer altında, git dışındadır.
- Kaydırma envanteri: aktif ProductCard ve hesap/sipariş TrackingTimeline içindeki whileInView kaldırıldı. HeroBand, Story, Hero/SofraHero/HeroDepthMotion, BlurText, pendant-lamp-rail ve liquid-glass-logo-reveal klasik vitrin tarafından kullanılmıyor; silinmedi. FramePlayback yalnız eski ScrollFrameSequence zinciri ve ayrı frames denemesinde kalır. /hesabim tarayıcı kontrolü girişsiz yönlendirmedir; girişli hesabın tarayıcı kabulü yapılmadı, aktif zaman çizelgesi bileşeni yerel testlerde doğrulandı.
- Derleme ve yerel sunucu uzak ağ bağlantıları işletim sistemi düzeyinde engellenerek çalıştı. Canlı veritabanına bağlanılmadı, ortam ayarları değiştirilmedi. Tarayıcılar düzgün kapandı; yerel sunucu SIGTERM ile kapatıldı ve bu çalışmanın geçici dosyaları temizlendi. node_modules ve .next korundu. Push, production/Vercel yayını ve AFINA-KAYNAK/output dosyalarını Git'e ekleme yok.
- Karşılanmayan ayrı kabul: Claude'da görüntü ve hareket kaydı incelemesi yapılmadı; ilgili kutu açık tutuldu. Fiziksel cihaz veya girişli gerçek hesap kabulü iddia edilmez. TAMAMLANDI yerel uygulama/test teslimini belirtir; Claude incelemesi ve yayın kabulü değildir.

## Claude denetimi (10 Kasım 2026)
- motion-framer notlarına uyuldu (domAnimation korunarak ölçülen gösterge, CSS üst bant girişi, `MotionConfig reducedMotion="user"`).
- Ölçümler: grup fotoğrafı üzerine gelince ölçek 1 → 1,05; kart −4 px; "Eklendi ✓" geçişinde düğme genişliği sabit (117,9 px); kategori göstergesi 4 → 686 px kaydı; CLS 0 (`/`, `/urunler`, kategori, `/bayilik`; 390/1440; azaltılmış hareket dahil); azaltılmış harekette üst bant `transform: none`, opacity 1; ana sayfa sonuna kadar kaydırıldığında saydamlaşan içerik yok (yalnız devre dışı "İlçe" seçicisi sabit 0,6, hareket değil).
- `light-motion-191`, `motion-interactions-191`, `category-pages-190`, `footer-canvas-189-1`: Claude sunucusunda 73/73 geçti. Hareket videosu: `AFINA-KAYNAK/tasarim/uygulama-kontrol/AFINA-hareketler.mp4`. **KABUL.**

## Durum: TAMAMLANDI
