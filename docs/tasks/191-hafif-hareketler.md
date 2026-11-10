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

## Kabul kriterleri
- [ ] Unit: azaltılmış harekette hareketli bileşenler son hâli anında gösterir; üst bant metni sunucu çıktısında görünür (opacity 0 / görünmez başlangıç yok).
- [ ] e2e (yeni, kalıcı): (a) ana sayfa, `/urunler` ve bir kategori sayfası yüklendikten 2 sn sonra toplam CLS = 0 (PerformanceObserver `layout-shift`); (b) azaltılmış harekette üst bant öğelerinin `transform` değeri `none` ve opacity 1; (c) **kaydırmaya bağlı hareket yok:** sayfa sonuna kadar kaydırıldıktan sonra ekranda görünen her öğenin opacity'si 1, kaydırma sırasında stil değişimi yok; (d) grup fotoğrafı üzerine gelinince görselin `transform` ölçeği > 1; (e) ürün kartı üzerine gelinince yukarı kayma.
- [ ] Mevcut `color-contrast-189` ve `footer-canvas-189-1` testleri geçer.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `git diff --check` yeşil.
- [ ] Tarayıcı doğrulaması (görüntü + hareket kaydı) Claude'da.

## Yapılmaması gerekenler
- Kaydırmaya bağlı animasyon, paralaks, sabitlenen bölüm, otomatik dönen karusel, sürekli dönen/yanıp sönen öğe, sayfa geçiş perdesi.
- Yerleşim, renk, metin, görsel değişikliği. Yeni bağımlılık.
- `AFINA-KAYNAK/` git'e eklenmez (`git add -f` YASAK).
- **Push yok, yayın yok.** Testler yeşilse tek kayıt (commit). İş bitince `node_modules` ve `.next` klasörlerini SİLME.
- `docs/` altında yalnız bu dosyaya Coder Notu ve Durum.

## Durum: BEKLİYOR
