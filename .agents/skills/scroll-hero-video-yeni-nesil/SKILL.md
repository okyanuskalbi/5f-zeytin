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

Doğru Flow projesi 62040049-3473-446b-9d93-8e6cbc45f8bc taze bağlantıda önceki reCAPTCHA uyarısı olmadan çalıştı; güvenlik engeli atlanmadı. Aynı ilk/son kare yöntemiyle Omni 1.1 Flash/720p/8 sn./16:9/x1,12 kredi/çıktı: B→C/C→D/D→F üçü de COMPLETE ve indirildi. Üç yetkili istek 36 kredi, bakiye 230→194; ilk 20 ile toplam 56, eski 80 tavanında 24 kredi kullanılmadı (ek deneme yetkisi değil). Yeni klipler yalnız aday; teknik/görsel inceleme ve kullanıcı onayı olmadan public/runtime yok. Sitede kabul edilmiş A→B kalır. Önceki blocked denemeler/0 harcama tarihçesi ve exact prompts docs/referans/flow-keyframes.json içinde korunur; bakiye kanıtı .cache/task-160/flow-194-credit-balance.png.
Omni Chrome Use tarayıcı otomasyonu yaklaşımıdır, Omni 1.1 Flash model adı değildir. Üretim oturumu yetkisi kullanıcının Chrome'unu testte açma izni sayılmaz. Yeni Imagen/model/sağlayıcı/abonelik varsayılmaz.

## Kabul

Final-source gerçek decoded film/zaman/son kare, kontrolün ayrı düzlemi, tercih/görünürlük/hata, nesne seçimi ve doğru detail/cart, SSR/JS kapalı, rail erişimi ve kompakt telefon kontrol edilir. Paketli headless Chromium ≤2 worker/düzgün kapanış. Önceki [v7 makbuzu](../../../docs/referans/yayin-film-v7-20261101.json) tarihçedir; v8 yerel/canlı UI kabulü tamamlandı; yeni medya kullanıcı onayı ayrıdır. Fiziksel cihaz/gerçek servis sonucu emülasyondan türetilmez.
Birlikte [Scroll Craft](../scroll-craft/SKILL.md), [Sinematik](../sinematik-siteler-yeni-nesil/SKILL.md), [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md), [UI/UX](../ui-ux-pro-max/SKILL.md); upstream engine değiştirilmez/import edilmez.

## Güncel Task160 durumu

V8 kaynak 179df851/CI 41304790349 ile afinazeytin.com üzerinde READY. Yerel 1200 unit/tam lint-type-build,74 e2e+6 responsive skip ve altı görsel genişlik PASS; Native inspector 1 FAIL/5 WARN korunur, Scenes exit0.

Canlı kabul: **TAMAMLANDI** — 74 e2e PASS + 6 responsive skip; 1440/1024/768/390/360×640/320 görsel/axe/taşma/pageerror/başarısız kaynak 0; motion/JavaScript kapalı/reduced PASS. Doğal film 190 decoded kare,7,916667 sn., ended/muted; 12,04 sn. gerçek UI oynatım kaydı alındı. Fiziksel cihaz veya gerçek hesap/ödeme/teklif mutasyonu değildir.

Final [yayın makbuzu](../../../docs/referans/yayin-object-v8-20261101.json) ve [QA kaydı](../../../docs/referans/qa-160-20261101.json) nihai Task 160 kanıt kayıtlarıdır; yeni Flow medya kabulü ayrı tutulur.
