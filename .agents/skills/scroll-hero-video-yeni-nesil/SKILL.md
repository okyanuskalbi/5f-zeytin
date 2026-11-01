---
name: scroll-hero-video-yeni-nesil
description: AFİNA v7 native Flow filmi, küçük scroll-kabuğu etkileri, tek geçiş denetimleri ve statik poster geri dönüşlerini mevcut Motion yapısıyla uygulama yeteneği.
metadata:
  scope: project
  source: scroll-hero-video-kiti-yeni-nesil.md
  source_sha256: f01ca525ec395387ffddaa3be045197b515158ecb0405db2ebe0f77580b051a3
---

# AFİNA için kaydırma ve gerçek Flow filmi

Önce [v7 Zeytinin İçinden tasarımını](../../../docs/DESIGN.md), `AGENTS.md` ve [Task 159](../../../docs/tasks/159-flow-sinematik-hero.md) içindeki son kullanıcı düzeltmesini oku. Kullanıcı v6 hero'nun hâlâ aynı göründüğünü belirterek gerçek Google Flow videosuyla sinematik açılış istedi. V6 split/çerçeveli/frame-only ve genel no-autoplay tercihi yeni hero için geçerli değildir. Bu scroll rehberi artık film kabuğunun küçük kaydırma etkisine kaynaklık eder; yeni hero'nun video zamanını scroll'a bağlamaz.

## Kaynak → web filmi → kontrollü açılış

1. Kabul edilen ilk A→B ağaç → dal klibi ve provenansı önce okunur: `docs/referans/flow-keyframes.json`, `lib/media/cinematic-hero.json`. Yalnız mevcut kabul edilmiş kaynak kullanılabilir; diğer üç geçiş üretilmiş gibi gösterilmez. Ürün etiketi/ambalajı yeniden üretilmez.
2. Aynı kaynaktan ses içermeyen H264/faststart web MP4 türevi `public/videos/afina-agac-dal.mp4` olarak kullanılabilir. Kaynak/output SHA, codec, boyut, süre ve kabul kapısı doğrulanır. Yerel yeniden kodlama yeni ücretli üretim değildir; SDR'ye ikinci tone mapping uygulanmaz. Kılavuzdaki 3–6 sn./<5 MB örneğine uydurmak için kabul edilen 7,93 sn. kaynak kesilmez veya sahte loop yapılmaz.
3. V7 hero native video ile normal modda sessiz **bir kez** ilerler; `muted`/`playsInline` korunur. A/B farklı olduğundan `loop` yoktur. Bitişte son kare kalır; yalnız kullanıcı **Tekrar oynat** ile başa alır.
4. Görünür **Duraklat/Oynat/Tekrar oynat** denetimi gerçek olaylarla eşleşir. Autoplay reddi “oynuyor” sayılmaz. Kullanıcının manuel durdurma tercihi görünürlük olaylarıyla ezilmez; biten film kendiliğinden tekrar başlamaz.

## Scroll ve doğal akış

`motion/react` içindeki `useScroll`/`useTransform` yalnız film kabuğunda küçük isteğe bağlı transform parallax/scale içindir. Native `currentTime` scroll'a bağlanmaz; video zamanına spring veya ikinci seeking/rAF motoru eklenmez. Manuel tekrarın başa alma işlemi scroll seeking değildir. 300–400vh pin, body/wheel/touch yakalama ve boş uzun intro yoktur.

Genel `ScrollFrameSequence`/`FramePlayback`/`frames.ts` diğer onaylı kullanım için korunabilir; fakat yeni hero'nun gerçek MP4 filmi yerine konmaz. Ayrı bir framed kullanım varsa ölçüm kararlı story'den, görünürlük gerçek medya penceresinden alınır ve kare zamanı lineer kalır.

## Görünürlük, tercihler ve erişilebilirlik

- SSR poster/H1/iki gerçek CTA görünürdür; filmin veya hareket paketinin hazır olmasına bağlı değildir. Poster/video mobil odak noktası eşleşir; metin ve denetimler kısa ekran/metin büyütmede kesilmez.
- MP4 ancak hydration, tercih ve gerçek görünürlük kontrolünden sonra istenir. Genel `preload="auto"` örneğiyle gereksiz tüm medya indirilmez. Gizli sekme/ekran dışında film durur; observer/event/video kaynakları unmount'ta temizlenir.
- Reduced-motion, saveData, engelli oynatma ve hata durumunda **statik poster** kalır. Kaynaktaki reduced-motion `video.play()` davranışı uygulanmaz. Bu modlarda kendiliğinden oynatma veya gereksiz MP4 isteği yoktur.
- Telefon yüksekliği tek başına bütün mobil filmi kapatma gerekçesi değildir. Doğru poster geri dönüşü, gerçek tercih/erişim/oynatma durumuna dayanır.
- Denetimler klavyeyle erişilir, görünür ad/odak taşır ve en az 44 px dokunma hedefini korur. Dekoratif görüntünün durumu yanıltıcı başarı veya teknik üretim rozetiyle sunulmaz.

## Üretim ve Omni sınırı

Yeni üretim ancak istenen kapsam, kullanılabilir model ve ekranda doğrulanan ücretle yapılır. Görev başlangıcındaki kalan 60 kredi yalnız önceki üç aynı yöntemli geçiş kapsamındadır; her çağrıda güncel provenans/kullanım okunur. Skill okumak bütçeyi yenilemez. Örnek prompt yeni model, deneme, Imagen/abonelik hakkı veya sağlayıcı yetkisi değildir. Google doğrulama/CAPTCHA engeli aşılmaz; yeni aday kabul edilmeden runtime'a girmez.

**Omni Chrome Use**, mevcut oturumlu Flow yüzeyinin CUA/browser ile otomasyonu yaklaşımıdır. Ayrı eklenti kurulu varsayılmaz ve **Omni 1.1 Flash** model seçeneğiyle karıştırılmaz. Araç erişimi, model, kredi ve sonuç ayrı doğrulanır. Yetkili üretim Chrome oturumu testte kullanıcının Chrome'unu açma yetkisi değildir.

## Kabul ve birlikte kullanım

Gerçek video zamanının ilerlemesi, sessizlik, tek geçiş/son kare, denetimler, kullanıcı durdurması, görünürlük/tercih değişimi, autoplay reddi ve poster kanıtlanır. Gerçek ürün/sepet/üyelik/kurumsal CTA'lar kalır. Test yalnız paketli headless Chromium, en fazla iki worker ve düzgün kapanışla yapılır; fiziksel telefon kabulü emülasyondan ayrıdır. Güncel [Task 159 makbuzu](../../../docs/referans/yayin-film-v7-20261101.json) tamamlanan yayın/kabulü kaydeder; önceki test sonucu yeni film kabulü sayılmaz.

- [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md): kimlik ve gerçek içerik.
- [Sinematik siteler](../sinematik-siteler-yeni-nesil/SKILL.md): tam geniş film kompozisyonu.
- [UI/UX Pro Max](../ui-ux-pro-max/SKILL.md): ortak hareket ve durumlar.

[Task 158 kaynak/istisna kaydı](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md) kaynak kökenidir; güncel görsel/oynatma kararı v7/Task 159'dur.
