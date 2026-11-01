---
name: scroll-hero-video-yeni-nesil
description: AFİNA'nın onaylı Google Flow sahnesini mevcut Motion/canvas motoruyla doğal kaydırmaya bağlama, görünürlük ve poster geri dönüşlerini doğrulama yeteneği.
metadata:
  scope: project
  source: scroll-hero-video-kiti-yeni-nesil.md
  source_sha256: f01ca525ec395387ffddaa3be045197b515158ecb0405db2ebe0f77580b051a3
---

# AFİNA için kaydırmaya bağlı sahne

Önce [v6 tasarımını](../../../docs/DESIGN.md), `AGENTS.md` ve ilgili görevi oku. Bu projede hareketli görüntü aydınlık bir çerçevededir; başlık ve iki gerçek CTA ayrı, okunur DOM içeriğidir. Mobil akış doğal bir içerik dizisidir. Kaynak MD'nin tam ekran 300–400vh tarifini tekrar kurma.

## Sahne → video → kaydırma

1. Önce onaylı görsel/klip ve mevcut provenansı incele. Kullanıcının kabul ettiği A→B ağaç → dal kaynağı `docs/referans/flow-keyframes.json`, türevleri `lib/media/cinematic-hero.json` içindedir. Kabul edilmemiş aday runtime'a alınmaz; ürün etiketi/ambalajı yeniden üretilmez.
2. Yeni üretim ancak istenen kapsam, kullanılabilir model ve ekranda doğrulanan ücretle yapılır. Bu görevin başlangıcındaki kalan 60 kredi yalnız önceki üç aynı yöntemli geçiş kapsamındadır; her çağrı öncesi provenans defterindeki güncel kullanım/kalan sınır okunur. Bu skill bütçeyi sıfırlamaz veya yenilemez. Örnek prompt yeni model, deneme veya sağlayıcı yetkisi değildir. Google doğrulama engeli aşılmaz. Imagen erişimi veya aboneliğe dahil üretim varsayılmaz.
3. Yeni kabul edilmiş klip varsa mevcut `scripts/extract-frames.mjs` ve medya kapılarıyla aynı ilk kareden poster/türev üret. SDR'ye ikinci tone mapping uygulama. Önceki 8 saniyelik kabul edilmiş kaynak, kılavuzdaki 3–6 saniye/<5 MB örneğine uydurmak için kesilmez; runtime'da ham MP4 yerine denetlenen kare dizisi ve kendi bütçesi kullanılır.
4. `ScrollFrameSequence` → `FramePlayback` → `lib/media/frames.ts` hattını kullan. İkinci `<video>.currentTime` veya vanilla scroll motoru ekleme. Motion scroll değerleri lineer kare seçimine gider; spring ile video/kare zamanı yumuşatılmaz.

## Ölçüm, görünürlük ve geri dönüş

- Framed modun dış story'si kararlı kaydırma ölçümü sağlar; görünürlük ve istek bütçesi gerçek medya penceresine göre yönetilir. Metin görünürken ekran dışındaki medya kare işi başlatmamalıdır.
- İleri/geri kaydırmada sahne aynı yönde izlenir; son kadrajın görsel çıkmadan ulaşılabilir olduğu doğrulanır. Kaydırma dinleyicisi içinde React state/render döngüsü veya kopya rAF kuyruğu oluşturma.
- Küçük başlangıç tamponu ve talep edilen kare çevresinde yükleme korunur. `preload="auto"` ile tüm videoyu/kareleri açılışta indirme. Gizli sekme ve görünüm dışında gereksiz istek/çizim durur; unmount'ta observer, event, frame ve görüntü kaynakları temizlenir.
- Reduced-motion, veri tasarrufu, kısa ekran veya oynatıcı hatasında aynı kaynaktan **statik poster** ve tüm içerik kalır. Kaynaktaki reduced-motion `video.play()` davranışı alınmaz. Autoplay, loop, scroll kilidi ve başlığı gizleyen loader yoktur.
- Gelecekte ayrıca onaylanan bir video yüzeyi gerekirse sessizlik ve satır içi oynatma için `muted`/`playsInline` korunur; bu, mevcut kare motorunu değiştirme veya autoplay ekleme talimatı değildir.

## Omni ayrımı

MD'deki **Omni Chrome Use**, oturum açık Flow arayüzünün tarayıcıyla otomasyonu yaklaşımıdır. Flow'daki **Omni 1.1 Flash** model seçeneğiyle aynı şey değildir. Ayrı bir Omni Chrome Use eklentisi kurulu varsayılmaz; yalnız gerçekten mevcut CUA/browser araçları ve yetkili oturum kullanılır. Üretim Chrome oturumu, testlerde paketli headless Chromium kullanma kuralından ayrıdır. Bu yaklaşım yeni kredi, hesap veya güvenlik ayarı yetkisi vermez.

## Kabul

Yavaş/hızlı ve ters kaydırma, poster/ilk kare eşliği, görünüm dışı/sekme duraklaması, reduced-motion'da sıfır kare isteği ve mobil içerik akışını kanıtla. 21st ile hero sonrası standart bölümler aranabilir; sahte fiyat paketi/testimonial/marquee içerikleri eklenmez. Aynı body/wheel doğal akışı ve gerçek ürün/sepet bağlantıları kalır. Test yalnız paketli headless Chromium, en fazla iki worker ve düzgün kapanışla yapılır; fiziksel telefon kabulü emülasyondan ayrı tutulur.

## Birlikte kullanılan yetenekler

- [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md): kimlik ve içerik hiyerarşisi.
- [Sinematik siteler](../sinematik-siteler-yeni-nesil/SKILL.md): sakin kamera/katman kararları.
- [UI/UX Pro Max](../ui-ux-pro-max/SKILL.md): Motion tokenları, 21st ve durumlar.

Kaynak/istisna kanıtı: [yeni nesil MD uyarlamaları](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md).
