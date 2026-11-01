---
name: ui-ux-pro-max
description: AFİNA için mevcut Motion/LazyMotion ve 21st bağlantısıyla tutarlı, erişilir mikro etkileşimler, durumlar ve performans politikası.
metadata:
  scope: project
  source: ui-ux-pro-max.md
  source_sha256: 9eb2268809dd3ee50376baf8d8d554141c4a75349803fabce4b15cca45ccb017
---

# AFİNA UI/UX Pro Max

Bu proje [v6 Üretici Atlası](../../../docs/DESIGN.md), mevcut Next.js/React/TypeScript, motion ve shadcn/Radix primitive'lerini kullanır. İki font, özgün logo, açık editoryal hero ve gerçek perakende/kurumsal yollar korunur. Bu yetenek mevcut bağlantılara kalite politikası ekler; global araç/anahtar/skill kurulumu yapmaz.

## Ortak Motion sistemi

- `motion/react`, mevcut LazyMotion ve `motion/react-m` düzenini koru; `framer-motion` veya ikinci motor ekleme. Motion zaten projededir; yeniden paket kurmak bu görev değildir.
- Mesafe, süre, scale ve spring kararlarını `lib/ui-motion.ts` üzerinden paylaş. Tekil bileşenlerde kopya stiffness/damping veya keyfî timing biriktirme. Spring küçük eylem/geri bildirimler içindir; süreli sade fade veya lineer ilerlemeyi körlemesine spring'e çevirme.
- Yalnız transform/opacity animasyonu; width/height/top/left animasyonu ve örneklerdeki filter-blur alınmaz. Büyük parallax/scale yerine arayüzün okunurluğunu ve tıklanabilirliğini koruyan küçük mesafeler seç.
- Giriş/stagger bir kez; mevcut 0.05–0.10 s aralığındaki paylaşılabilir tokenlarla kısa tutulur. `whileInView` tekrar tekrar başlatılmaz. SSR metni/CTA başlangıçta görünürdür; JavaScript/hareket paketi yüklenmediğinde içerik kaybolmaz.
- Hover/tap, focus, loading, disabled, hata ve başarı durumları aynı ailede tutarlı olmalı. Spring hover/tap reduced-motion'da kapanır; görünür odak ve klavye erişimi hareketin yerine geçmez.
- Reduced-motion başta ve tercih değişiminde desteklenir: transform/dekorasyon yok; gerekliyse yalnız kısa opacity geçişi. Video veya kare dizisi otomatik oynatılmaz, poster kalır.
- `AnimatePresence` kullanıldığında koşullu çocuklar kararlı key ve uygun exit alır. Mevcut Radix modalının odak kapanı, Escape, close/focus dönüşü ve scroll lock'u koru. Menü/modal kilidi sayfa sahnesinin kaydırma kilidi değildir.
- `layout` yalnız küçük, kontrollü eleman/grup değişimlerinde değerlendirilebilir. Uzun/deep listeyi otomatik layout animasyonuna sokma; ürün sırası, adı, fiyatı ve stok verisini görsel gerekçeyle değiştirme.

## Scroll ve performans

Motion değerleri `useScroll`/`useTransform`/gereken aboneliklerle ilerler; video/kare zamanı **lineerdir**, `useSpring` kullanılmaz. Framed sahne için mevcut canvas motoru kullanılır; ikinci `<video>.currentTime`/vanilla rAF motoru kurulmaz. Ölçüm dış story'den, görünürlük gerçek medya penceresinden alınır. Görünüm dışı/gizli sekmede istek ve çizim durur; observer, event ve frame kaynakları temizlenir.

SSR poster, boyutu belli görseller, küçük tampon ve talebe bağlı yükleme kalır. Animasyon için tüm içeriği/kareleri önden indirme veya büyük client bundle ekleme. Yeni görsel/video, mevcut model/abonelik/ücretsiz hak varsayımıyla üretilmez; Google Flow kapsamı, gerçek ücret ve kabul kaydı gerekir.

## 21st ve shadcn

1. Mevcut proje bileşenini ve tokenlarını incele; aynı işi yapan ikinci primitive yazma.
2. Yeni standart kalıp gerekiyorsa mevcut 21st MCP `search` → gerçek sonuç ID'si → `get_component` akışını kullan. Araç şeması esastır; kullanıcı adı metnini ID yerine geçirme.
3. Gerçek kaynak erişimini doğrula; demo metni/medyası, fiyat planı, yorum veya ikon stilini aynen taşıma. V6'nın sade editoryal yönüne uyarla.
4. Kod kotası/aboneliği hosted AI üretim yetkisi değildir. `generate`/anahtar yenileme/ayrı eklenti kurulumunu örnek listede var diye başlatma. Mevcut bağlantı çalışıyorsa CLI init veya manuel MCP config yazma.
5. shadcn için MCP yoktur. Gerektiğinde resmi CLI ile `npx shadcn@latest search <bileşen>`, `view`, `docs` ve `add` kullanılır; mevcut primitive tercih edilir ve çıktılar tokenlara uyarlanır.

Omni Chrome Use bu kitlerde tarayıcı otomasyonunu anlatır; ayrı eklenti kurulu varsayılmaz. Flow'daki Omni 1.1 Flash modeli, browser erişimi ve kredi sınırı ayrı doğrulanır. Testte kullanıcının Chrome'u açılmaz: yalnız paketli headless Chromium, en fazla iki worker ve düzgün kapanış.

## Kabul ve birlikte kullanım

Klavye/modal, reduced-motion, kontrast, mobil/masaüstü taşma ve gerçek eylem durumlarını test et. Unit/build, tarayıcı, canlı HTTP/API, fiziksel cihaz ve gerçek ödeme/e-posta sonuçlarını ayrı kaydet. Kaynaktaki “test edilmiş 10.000+ bileşen” ve maliyet/hız sloganları projenin test kanıtı değildir.

- [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md): marka ve hiyerarşi.
- [Scroll hero](../scroll-hero-video-yeni-nesil/SKILL.md): lineer sahne ve kaynak kabulü.
- [Sinematik siteler](../sinematik-siteler-yeni-nesil/SKILL.md): sakin görsel katmanlar.

Kaynak/istisna kaydı: [yeni nesil MD uyarlamaları](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md).
