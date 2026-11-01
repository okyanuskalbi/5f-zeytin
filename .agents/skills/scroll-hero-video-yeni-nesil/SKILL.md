---
name: scroll-hero-video-yeni-nesil
description: AFİNA v8 Object journey için bağımsız Motion düzlemleri, tek geçiş Flow filmi ve erişilir statik geri dönüşleri uygulayan proje yerel yetenek.
metadata:
  scope: project
  source: scroll-hero-video-kiti-yeni-nesil.md
  source_sha256: f01ca525ec395387ffddaa3be045197b515158ecb0405db2ebe0f77580b051a3
---

# AFİNA için bağımsız düzlemler ve gerçek Flow filmi

Aktif yön [v8 Object journey](../../../docs/DESIGN.md)/[Task 160](../../../docs/tasks/160-scroll-craft-taste-ve-flow.md); önce [BRIEF/PLAN](../../../docs/scrollcraft/builds/afina-v8/PLAN.md). Kullanıcının Scroll Craft/Taste isteği yalnız küçük v7 film-kabuğu hareketini değil kompozisyonu değiştirir. Kaynak MD yeni motor/ücret/model yetkisi değildir; [Task 158 kökeni](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md) korunur.

## Düzlemler ve doğal akış

Desktop yeterli alan: tek kısa 170svh sticky. Motion useScroll/useTransform film scale1→.82/x0→-8vw/y0→-48px, ambalaj y80→-8px/scale1→1.12, kendi kâğıt zeminli copy y0→-24px. Film, gerçek alfa ambalaj ve HTML metin ayrı sahipliktedir. mediaStyle yalnız poster/video;44px+ kontrol transform dışında. Tek zirve ve açık taban teması; stage'ı boş tutan pin, body/wheel/touch capture yok.
Telefon/kısa ekran/reduced pin yok: H1+ana CTA önce,280px film/260px ürün, sonra seçim/ayrıntı.360×640 ve büyütülmüş metin doğrulanır. SSR poster/H1/CTA görünür; seçim aynı id'nin gerçek görsel/ad/fiyat/detail/cart hedefini günceller.
Yeni API motion/react; sadece transform/opacity. GSAP/Lenis/vanilla engine/yeni rAF/seek motoru eklenmez. Native currentTime scroll'a bağlanmaz ve video zamanına spring verilmez. Genel canvas/kare motoru diğer onaylı kullanımlarda kalabilir; bu MP4 yerine geçirilmez.

## Kaynak ve film yaşam döngüsü

1. Kabul edilmiş ilk A→B, docs/referans/flow-keyframes.json ve lib/media/cinematic-film.json provenansı. Web MP4 public/videos/afina-agac-dal.mp4, sessiz H264/faststart/190kare/7,916667sn./2.537.380bayt. Kaynak/çıktı SHA ve script kapısı korunur; yeni üretim veya ikinci SDR tone mapping yok.
2. Normal mod hydration/tercih/gerçek görünürlükten sonra muted/playsInline ile **bir kez** oynar; son karede kalır. Loop/sahte dikiş yok. Pause/play/replay gerçek olaylarla; autoplay reddi oynuyor sayılmaz.
3. Kullanıcı pause korunur; gizli sekme/ekran dışı durur; biten film observer'la yeniden başlamaz. Observer/event/video unmount temizliği korunur.
4. Reduced/saveData kaynak/MP4 isteği başlatmaz; statik poster ve gerçek CTA kalır. Hata/blocked uygun poster/manuel retry; manuel gesture ve tercih değişimi ayrıca test edilir. Mobil poster/video odak eşliği korunur.

## Doğru Flow ve yetki

Doğrudan kullanılan proje https://flow.google.com/project/62040049-3473-446b-9d93-8e6cbc45f8bc ; bir kabul edilmiş A→B+beş referans. B→C ilk B / son C ve C tam önizlemesi görüldü; Omni 1.1 Flash/Frames/720p/8 sn./16:9/x1 = 12 kredi. reCAPTCHA hizmet bağlantısı engeli sürüyor; yeni gönderim/ek harcama 0. Kalan60 sınırı yalnız önceki üç geçiş; belge okumak bütçe yenilemez. CAPTCHA atlanmaz; üç taslak runtime filmi değildir.
Omni Chrome Use tarayıcı otomasyonu yaklaşımıdır, Omni 1.1 Flash model adı değildir. Üretim oturumu yetkisi kullanıcının Chrome'unu testte açma izni sayılmaz. Yeni Imagen/model/sağlayıcı/abonelik varsayılmaz.

## Kabul

Final-source gerçek decoded film/zaman/son kare, kontrolün ayrı düzlemi, tercih/görünürlük/hata, nesne seçimi ve doğru detail/cart, SSR/JS kapalı, rail erişimi ve kompakt telefon kontrol edilir. Paketli headless Chromium ≤2 worker/düzgün kapanış. Önceki [v7 makbuzu](../../../docs/referans/yayin-film-v7-20261101.json) tarihçedir; v8 native Taste/e2e/canlı kabulü ayrıca bekler. Fiziksel cihaz/gerçek servis sonucu emülasyondan türetilmez.
Birlikte [Scroll Craft](../scroll-craft/SKILL.md), [Sinematik](../sinematik-siteler-yeni-nesil/SKILL.md), [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md), [UI/UX](../ui-ux-pro-max/SKILL.md); upstream engine değiştirilmez/import edilmez.
