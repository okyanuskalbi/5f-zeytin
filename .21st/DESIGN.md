# AFİNA ZEYTİN v7 — Zeytinin İçinden

Tek güncel sözleşme [docs/DESIGN.md](../docs/DESIGN.md), uygulama [Task 159](../docs/tasks/159-flow-sinematik-hero.md). Kullanıcı önceki hero'nun hâlâ aynı göründüğünü belirterek gerçek Google Flow filmiyle daha sinematik açılış istedi. Bu son düzeltme v6 split/çerçeveli/frame-only ve genel no-autoplay uygulama tercihlerini değiştirir. Önceki DESIGN.md [v6 tarihçesinde](../docs/referans/DESIGN-v6-history-20261101.md) değişmeden saklanır.

## Kompozisyon

- Orijinal opak kâğıt nav dışında, kenardan kenara viewport Flow filmi; eski iki sütun, organik pencere ve hero ürün kartı yok.
- Sol-alt resmî slogan ve iki gerçek DOM CTA. Sağ/üst sahne aydınlık; yalnız gerekli yerel kontrast perdesi. Cam nav, merkezlenmiş koyu klon, demo menü ve yeni font yok.
- Normal modda aynı kabul edilmiş A→B kaynaktan sessiz H264/faststart MP4 bir kez oynar; A/B farklı olduğundan loop yok. Son karede kalır, görünür pause/play/replay denetimi vardır.
- Poster ve video mobil odak/kadrajı eşleşir. Kısa ekran/metin büyütmede kontroller ve CTA kesilmez; 300–400vh pin veya body/wheel kilidi yoktur.
- Reduced-motion/saveData/engelli oynatma/hata: statik poster ve görünür SSR H1/CTA. Gizli sekme/ekran dışında durur; kullanıcının manuel duraklatması korunur.

Orijinal logo, Fraunces/Figtree, `#172B21`/`#F4F0E7`/`#B6A078`/`#252725` ve hero altındaki %65 üretim / %35 alışveriş akışı korunur. Altı gerçek SKU/fiyat/stok, detay/sepet/üyelik ve B2B servis sözleşmeleri değişmez.

## Kaynak ve hareket

21st **12200 PrismaHero**, yalnız tam geniş medya + overlay içerik kompozisyonu için uyarlanır. Demo medya, metin, font, nav, gizli içerik ve `framer-motion` importu taşınmaz. Yeni API `motion/react`; ortak tokenlar `lib/ui-motion.ts`. Küçük film-kabuğu parallax isteğe bağlıdır; `currentTime` scroll'a bağlanmaz, video zamanına spring eklenmez.

[Proje yerel dört MD](../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md) kaynak ilkeleridir; normalize skill'ler Task 159'a göre güncellenir. Google Flow/Omni erişimi, model, ücret ve kabul ayrı doğrulanır. Omni Chrome Use tarayıcı otomasyonu yaklaşımıdır; Omni 1.1 Flash model adıyla karıştırılmaz. Yeni üretim, model, sağlayıcı, anahtar veya kredi yetkisi yoktur; mevcut kabul edilmiş klip kullanılır.

## Kabul sınırı

Task 159 yayın/kabul tamam: `5a3b1f6`, 1197 unit + 44 canlı etkileşim kontrolü; dört genişlikte görsel/axe, gerçek tek oynatım/son kare ve poster/tercihler doğrulandı. [Makbuz](../docs/referans/yayin-film-v7-20261101.json), [QA](../docs/referans/qa-159-20261101.json). Yalnız paketli headless Chromium, en fazla iki worker ve düzgün kapanış. Fiziksel cihaz ve gerçek servis işlemleri emülasyon/HTTP kabulünden ayrıdır; kullanıcının görsel kabulü yerine geçmez.
