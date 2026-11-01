---
name: ui-ux-pro-max
description: AFİNA için mevcut Motion/LazyMotion ve 21st bağlantısıyla tutarlı, erişilir mikro etkileşimler, durumlar ve performans politikası.
metadata:
  scope: project
  source: ui-ux-pro-max.md
  source_sha256: 9eb2268809dd3ee50376baf8d8d554141c4a75349803fabce4b15cca45ccb017
---

# AFİNA UI/UX Pro Max

Aktif [v8 Object journey](../../../docs/DESIGN.md)/[Task 160](../../../docs/tasks/160-scroll-craft-taste-ve-flow.md), mevcut Next.js/React/TypeScript/motion/shadcn/Radix ve [BRIEF/PLAN](../../../docs/scrollcraft/builds/afina-v8/PLAN.md) esastır. Kaynak MD global kurulum/ücret/model yetkisi değildir; [Task 158 kökeni](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md) korunur. Scroll Craft/Taste yöntemi kullanılır, upstream runtime import edilmez.

## Ortak hareket ve durumlar

- Yeni API motion/react; mevcut LazyMotion düzenini gerekmedikçe değiştirme. Ortak action/editorial tokenları lib/ui-motion.ts; küçük eylemlerde spring, lineer ilerleme/video zamanında spring yok.
- V8 film/ambalaj/katı kâğıt copy-plane ayrı transform sahipleri; film kontrolü 44px+ ve mediaStyle dışında. Tek kısa desktop sticky; telefon/kısa ekran/reduced doğal akış. Tipografi zemine göre sabit; kompozisyonun okunurluğu/tıklanabilirliği korunur.
- Sürekli animasyon yalnız transform/opacity; layout/width/height/top/left/filter-blur yok. Giriş/stagger bir kez, kısa ortak gecikme; SSR H1/CTA görünür, loader'a bağımlı değil. WhileInView yeniden gizleme/oynatma yok.
- Hover/tap/focus/disabled/loading/error/success aynı ailede. Reduced başta ve tercih değişiminde transformları kapatır; sade modda gerçek eylem/odak görünür kalır.
- Mevcut Radix modalında Escape/odak kapanı/geri dönüş korunur; modal scroll-lock sayfa sahnesini kilitleme izni değildir. AnimatePresence gerekirse kararlı key; uzun liste/layout motoru ekleme. Native details klavye/semantik durumuyla gerçek B2B dalıdır.

## Ürün ve medya sözleşmesi

Üç mevcut temsilcinin seçimi aynı görsel/ad/miktar/fiyat/detail/cart id'sini değiştirir; seçim aria-pressed/fieldset/legend ve görünür odak taşır. Gelen ProductVariant alanları yeni ticari veri kaynağı değildir; AddToCart/CatalogProvider hydration/stok ve sunucu fiyat/checkout otoritesi korunur. Altı SKU sırası/verisi pazarlama gerekçesiyle değişmez. Kayıp/boş/stock0 dürüst durum gösterir; kapalı B2B servisi açılmış veya gönderilmiş gibi sunulmaz.
Mevcut kabul edilmiş A→B native MP4 kendi zamanında sessiz bir kez, son kare/pause/play/replay. Scroll currentTime/yeni seek/rAF/loop yok. Manuel pause, görünürlük ve olay temizliği korunur. Reduced/saveData MP4 istemez, poster/CTA kalır; hata/blocked/gesture/retry gerçek durumdur. Telefon H1+CTA önce,280px film/260px ürün ve doğal ayrıntı;360×640/büyütülmüş metin ayrıca kabul edilir.
Yeni medya/Imagen/abonelik hakkı varsayılmaz. Doğru Flow proje 62040049-3473-446b-9d93-8e6cbc45f8bc, reCAPTCHA hizmet bağlantısı engeli, yeni gönderim/harcama 0 ve önceki kalan 60 sınırı görev kaydında. Omni Chrome Use otomasyon, Omni 1.1 Flash modeldir; güvenlik engeli aşılmaz.

## 21st ve shadcn

Mevcut primitive/token önce; yeni kalıp için bağlı 21st search→gerçekID→get_component, sonra AFİNA uyarlaması. 1635 seçim/görsel durumu;12200 tarihsel film kompozisyonu. Demo marka/veri/metin/medya/font/nav ve framer-motion taşınmaz. Kod erişimi hostedAI/anahtar/global kurulum yetkisi değildir. shadcn MCP yok; gereken resmi CLI search/view/docs/add; mevcut primitive tercih edilir.

## Kabul

Gerçek nesne seçimi/detail/cart, native rail klavye/reduced erişimi ve gerçek overflow, B2B details/kapalı hizmet, modal/menü/üyelik odakları, gerçek decoded film/kontrol/fallback, SSR/JS kapalı, kompakt telefon ve kompozit kontrast test edilir. Unit/build, native Taste/e2e, canlı API/HTTP, fiziksel cihaz ve gerçek ödeme/e-posta ayrı sonuçlardır; v8 bekleyen kabul önceki v7 makbuzundan türetilmez. Test yalnız paketli headless Chromium ≤2 worker/düzgün kapanış; kullanıcının Chrome'u açılmaz. Kaynaktaki10.000+ bileşen/hız sloganları bu projenin kanıtı değildir.
Birlikte [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md), [Scroll hero](../scroll-hero-video-yeni-nesil/SKILL.md), [Sinematik](../sinematik-siteler-yeni-nesil/SKILL.md), [Scroll Craft](../scroll-craft/SKILL.md), [Taste](../design-taste-frontend/SKILL.md).
