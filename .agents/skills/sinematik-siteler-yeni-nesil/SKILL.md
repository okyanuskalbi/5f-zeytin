---
name: sinematik-siteler-yeni-nesil
description: AFİNA v7 için kabul edilmiş Flow filmini tam genişlikte bir kez oynatan, sol-alt okunur metin ve erişilir denetimlerle sinematik anlatım kurma yeteneği.
metadata:
  scope: project
  source: sinematik-siteler-yeni-nesil.md
  source_sha256: aa630ea06c077ae0c96444c602a7a46328300e4435e4adbc2c1a7a450a4ebac6
---

# AFİNA için sinematik Flow açılışı

[Güncel v7 Zeytinin İçinden](../../../docs/DESIGN.md) ve [Task 159](../../../docs/tasks/159-flow-sinematik-hero.md) uygulanır. Kullanıcının “Hero hâlâ aynı görünüyor” düzeltmesi v6 split/çerçeveli/frame-only ve genel no-autoplay uygulama tercihlerini değiştirir. Normal modda gerçek Flow filminin sessiz bir kez ilerlemesi istenir; reduced-motion/saveData statik kalır. Orijinal logo, Fraunces/Figtree, kâğıt/zeytin/şampanya paleti ve hero altındaki kurumsal %65 / alışveriş %35 dengesi korunur.

## Üç sinematik katman

1. **Film:** kabul edilmiş Flow A→B kaynağından sessiz web MP4, opak kâğıt nav altında kenardan kenara viewport yüzey. Eski organik pencere ve hero ürün kartı yoktur. Görüntünün sağ/üst kısmı aydınlık kalır; yalnız gereken sol-alt metin kontrastı katmanı kullanılır.
2. **İçerik:** resmî slogan ve kısa üretici anlatımı sol altta, iki gerçek DOM CTA erişilir. Metin merkezlenmiş koyu bir klona dönmez. Film/JS yüklenmeden görünürdür; e-posta pill'i, sahte form veya demo nav eklenmez.
3. **Hareket/denetim:** sakin kamera, küçük transform/opacity mikro etkileşimleri ve görünür pause/play/replay. Açılış videosu yalnız scroll sırasında hareket eden poster gibi bırakılmaz; bunun yerine normal modda kendi zamanında bir kez oynar.

## Film ve yaşam döngüsü

Mevcut kabul edilmiş 7,93 sn. A→B klibinden web için sıkıştırılmış H264/faststart MP4 türevi kullanılabilir; bu yerel işlem yeni ücretli üretim değildir. Kaynak/çıktı SHA, codec/süre/boyut ve kabul kapısı doğrulanır. SDR'ye ikinci tone mapping uygulanmaz. Diğer üç geçiş üretilmiş/yayınlanmış gibi gösterilmez.

A ve B kadrajları farklıdır: kaynak MD'nin sonsuz loop örneği alınmaz. Film normal modda `muted`/`playsInline` ile bir kez ilerler, son karede kalır; görünür **Duraklat/Oynat/Tekrar oynat** durumları gerçek video olaylarından gelir. Manuel durdurma korunur. Gizli sekme ve ekran dışında durur; uygun bitmemiş oturum dışında observer yeniden oynatmaz. Bitişte ilk postere sıçrama veya kendiliğinden tekrar yoktur.

SSR poster ve içerik görünürdür. Hydration/tercih/görünürlük kontrolünden sonra MP4 istenir. Reduced-motion, saveData, oynatma reddi veya hata halinde statik kaynaklı poster ve eylemler kalır; otomatik `video.play()` ve gereksiz medya isteği başlatılmaz. Mobil poster/video odak noktası aynı olmalı; yaprak/dal hareketi, metin kontrastı ve denetimlerin güvenli alanı gerçek görüntüyle kontrol edilir. Kısa ekranda içerik kesilmek yerine doğal büyüyebilir.

## Kamera, tipografi ve Motion

Yavaş dolly/parallax, kararlı kompozisyon ve sarsıntısız kamera ilkeleri uygundur. Laptop/CRT, çiçek yaprakları, neon sıvı ışık veya 3D demo sahneleri gerçek AFİNA tesisi/ambalajı yerine konmaz. Yeni görsel/model/abonelik hakkı varsayılmaz; önce kabul edilmiş varlıklar kullanılır.

Yeni hareket API'leri `motion/react` üzerinden, ortak token/presetler `lib/ui-motion.ts` içinden gelir. `framer-motion` veya başka motor eklenmez. Başlık/nav için filter-blur, layout ölçüsü animasyonu, gizli SSR başlangıcı ve loader yoktur. Giriş/reveal bir kez ve küçük; film başlaması sekansın bitmesini beklemez. `useScroll` yalnız film kabuğuna küçük isteğe bağlı transform etkisi verebilir; native `currentTime` scroll'a bağlanmaz, video zamanına spring eklenmez. 300–400vh pin veya body/wheel kilidi yoktur.

## 21st ve üretim sınırı

21st **12200 PrismaHero** yalnız tam geniş medya + overlay içerik kompozisyonu için uyarlanır. Demo medya/metin/font/nav, gizli içerik ve `framer-motion` importu taşınmaz. Standart UI'da mevcut primitive'ler, mevcut 21st bağlantısı ve gerekli resmi shadcn CLI kullanılır. Instrument Serif, ikinci font servisi, global MCP/skill/anahtar kurulumu eklenmez.

Google Flow/Veo/model erişimi ve ücret gerçek arayüzde doğrulanır. Imagen'in aboneliğe dahil/ücretsiz olduğu varsayılmaz; yeni üretim/model/tekrar mevcut kullanıcı sınırını aşamaz. Görev başlangıcındaki kalan 60 kredi yalnız önceki üç geçiş içindir; güncel defter her çağrıda okunur, belge okumak bütçeyi yenilemez. CAPTCHA/güvenlik engeli atlanmaz, aday kabul edilmeden runtime'a girmez.

Omni Chrome Use mevcut CUA/browser ile oturumlu Flow otomasyonu yaklaşımıdır; ayrı kurulu eklenti veya Omni 1.1 Flash modeli anlamına gelmez. Araç, model, ücret ve çıktı ayrı olgulardır.

## Kabul ve birlikte kullanım

Sahne netliği, gerçek video zamanı, tek geçiş/son kare, pause/play/replay, kullanıcı durdurması, normal/azaltılmış hareket, görünürlük, autoplay reddi, mobil kadraj ve okunurluk kanıtlanır. Güncel [Task 159 makbuzu](../../../docs/referans/yayin-film-v7-20261101.json) tamamlanan yayın/kabul kanıtıdır; önceki ekran görüntüsü yeni filmi kanıtlamaz. Paketli headless Chromium, en fazla iki worker ve düzgün kapanış; fiziksel telefon/Lighthouse yapılmadıysa yapılmış sayılmaz.

- [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md)
- [Scroll hero](../scroll-hero-video-yeni-nesil/SKILL.md)
- [UI/UX Pro Max](../ui-ux-pro-max/SKILL.md)

[Task 158 kaynak/istisna kaydı](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md) tarihsel uyarlama kökenidir; v6'nın split/frame-only/genel no-autoplay tercihi bu kullanıcı düzeltmesiyle güncellenmiştir.
