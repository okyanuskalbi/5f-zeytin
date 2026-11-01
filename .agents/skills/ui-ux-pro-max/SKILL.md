---
name: ui-ux-pro-max
description: AFİNA için mevcut Motion/LazyMotion ve 21st bağlantısıyla tutarlı, erişilir mikro etkileşimler, durumlar ve performans politikası.
metadata:
  scope: project
  source: ui-ux-pro-max.md
  source_sha256: 9eb2268809dd3ee50376baf8d8d554141c4a75349803fabce4b15cca45ccb017
---

# AFİNA UI/UX Pro Max

Bu proje [v7 Zeytinin İçinden](../../../docs/DESIGN.md), mevcut Next.js/React/TypeScript, motion ve shadcn/Radix primitive'lerini kullanır. Kullanıcının son [Task 159](../../../docs/tasks/159-flow-sinematik-hero.md) düzeltmesi v6 split/frame-only ve genel no-autoplay tercihinin yerini alır: normal modda tam geniş kabul edilmiş Flow filmi bir kez sessiz oynar; sol-alt resmî metin, iki gerçek CTA, opak orijinal nav ve hero altındaki üretici odaklı açık yüzeyler korunur. Bu yetenek mevcut bağlantılara kalite politikası ekler; global araç/anahtar/skill kurulumu yapmaz.

## Ortak Motion sistemi

- Yeni hero/film API'lerini `motion/react` üzerinden kullan; mevcut ortak bileşenlerin LazyMotion düzenini zorunluluk yokken değiştirme. `framer-motion` veya ikinci motor ekleme. Motion zaten projededir; yeniden paket kurmak bu görev değildir.
- Mesafe, süre, scale ve spring kararlarını `lib/ui-motion.ts` üzerinden paylaş. Tekil bileşenlerde kopya stiffness/damping veya keyfî timing biriktirme. Spring küçük eylem/geri bildirimler içindir; süreli sade fade veya lineer ilerlemeyi körlemesine spring'e çevirme.
- Yalnız transform/opacity animasyonu; width/height/top/left animasyonu ve örneklerdeki filter-blur alınmaz. Büyük parallax/scale yerine arayüzün okunurluğunu ve tıklanabilirliğini koruyan küçük mesafeler seç.
- Giriş/stagger bir kez; mevcut 0.05–0.10 s aralığındaki paylaşılabilir tokenlarla kısa tutulur. `whileInView` tekrar tekrar başlatılmaz. SSR metni/CTA başlangıçta görünürdür; JavaScript/hareket paketi yüklenmediğinde içerik kaybolmaz.
- Hover/tap, focus, loading, disabled, hata ve başarı durumları aynı ailede tutarlı olmalı. Spring hover/tap reduced-motion'da kapanır; görünür odak ve klavye erişimi hareketin yerine geçmez.
- Reduced-motion başta ve tercih değişiminde desteklenir: transform/dekorasyon yok; gerekliyse yalnız kısa opacity geçişi. Bu tercih altında video veya kare dizisi otomatik oynatılmaz, statik poster kalır.
- `AnimatePresence` kullanıldığında koşullu çocuklar kararlı key ve uygun exit alır. Mevcut Radix modalının odak kapanı, Escape, close/focus dönüşü ve scroll lock'u koru. Menü/modal kilidi sayfa sahnesinin kaydırma kilidi değildir.
- `layout` yalnız küçük, kontrollü eleman/grup değişimlerinde değerlendirilebilir. Uzun/deep listeyi otomatik layout animasyonuna sokma; ürün sırası, adı, fiyatı ve stok verisini görsel gerekçeyle değiştirme.

## Scroll ve performans

V7 hero native Flow MP4'ü kendi zamanında bir kez oynatır; `currentTime` scroll'a bağlanmaz. `useScroll`/`useTransform` yalnız küçük, isteğe bağlı film-kabuğu transformu içindir. Video zamanına `useSpring` veya kopya seeking/rAF motoru eklenmez. Genel canvas/kare motoru diğer onaylı kullanımlar için korunabilir; oradaki kare zamanı lineer kalır ve görünürlük gerçek medya penceresinden alınır. V7 film duraklat/oynat/tekrar denetimiyle, son karede durma ve manuel kullanıcı durdurmasını koruma kuralıyla çalışır. Gizli sekme/ekran dışında durur; observer/event/video kaynakları temizlenir.

SSR poster/H1/CTA görünür; native MP4 hydration/tercih/görünürlük kontrolünden sonra istenir. Reduced-motion/saveData/engelli oynatma/hata durumunda statik poster ve eylemler kalır. Başlangıç/bitiş kareleri farklı olduğundan loop yoktur; bitişte yalnız kullanıcı tekrar başlatabilir. Animasyon için tüm içeriği/kareleri önden indirme veya büyük client bundle ekleme. Yeni görsel/video, mevcut model/abonelik/ücretsiz hak varsayımıyla üretilmez; Google Flow kapsamı, gerçek ücret ve kabul kaydı gerekir.

## 21st ve shadcn

1. Mevcut proje bileşenini ve tokenlarını incele; aynı işi yapan ikinci primitive yazma.
2. Yeni standart kalıp gerekiyorsa mevcut 21st MCP `search` → gerçek sonuç ID'si → `get_component` akışını kullan. Araç şeması esastır; kullanıcı adı metnini ID yerine geçirme.
3. Gerçek kaynak erişimini doğrula; demo metni/medyası, fiyat planı, yorum veya ikon stilini aynen taşıma. V7'de 21st 12200 tam geniş medya/overlay içerik kompozisyonu uyarlanabilir; demo nav/font/gizli içerik ve `framer-motion` importları taşınmaz.
4. Kod kotası/aboneliği hosted AI üretim yetkisi değildir. `generate`/anahtar yenileme/ayrı eklenti kurulumunu örnek listede var diye başlatma. Mevcut bağlantı çalışıyorsa CLI init veya manuel MCP config yazma.
5. shadcn için MCP yoktur. Gerektiğinde resmi CLI ile `npx shadcn@latest search <bileşen>`, `view`, `docs` ve `add` kullanılır; mevcut primitive tercih edilir ve çıktılar tokenlara uyarlanır.

Omni Chrome Use bu kitlerde tarayıcı otomasyonunu anlatır; ayrı eklenti kurulu varsayılmaz. Flow'daki Omni 1.1 Flash modeli, browser erişimi ve kredi sınırı ayrı doğrulanır. Testte kullanıcının Chrome'u açılmaz: yalnız paketli headless Chromium, en fazla iki worker ve düzgün kapanış.

## Kabul ve birlikte kullanım

Klavye/modal, reduced-motion, kontrast, mobil/masaüstü taşma ve gerçek eylem durumlarını; filmde gerçek zaman ilerlemesi, tek geçiş/son kare, pause/play/replay ve autoplay reddi durumlarını test et. Task 159 kabul/yayın sonucu önceki testlerden türetilemez. Unit/build, tarayıcı, canlı HTTP/API, fiziksel cihaz ve gerçek ödeme/e-posta sonuçlarını ayrı kaydet. Kaynaktaki “test edilmiş 10.000+ bileşen” ve maliyet/hız sloganları projenin test kanıtı değildir.

- [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md): marka ve hiyerarşi.
- [Scroll hero](../scroll-hero-video-yeni-nesil/SKILL.md): lineer sahne ve kaynak kabulü.
- [Sinematik siteler](../sinematik-siteler-yeni-nesil/SKILL.md): sakin görsel katmanlar.

Kaynak/istisna kökeni: [Task 158 MD uyarlamaları](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md). Güncel hero oynatma/kompozisyon tercihi v7/Task 159'dur; eski split/frame-only/genel no-autoplay tercihi artık uygulanmaz.
