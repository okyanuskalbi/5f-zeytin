---
name: profesyonel-web-sitesi-yeni-nesil
description: AFİNA ZEYTİN sayfa ve bileşenlerini marka kimliği, içerik hiyerarşisi, 21st kaynak uyarlaması ve erişilir hareket ilkeleriyle geliştirmek için proje yerel yetenek.
metadata:
  scope: project
  source: profesyonel-web-sitesi-skill-yeni-nesil.md
  source_sha256: f0246c60cd7e5588d093228c38d178dbb945e323067c2165dfd1e9ec03445980
---

# AFİNA için v9 profesyonel web tasarımı

## Durum, kaynak ve yetki

[Task161](../../../docs/tasks/161-pro-plan-tum-bolumler-21st-scroll-craft.md) UYGULANIYOR; final yerel/CI/API/canlı kabul BEKLİYOR. Aktif [v9 Hasat Rotası](../../../docs/DESIGN.md), uygulama öncesi [BRIEF/PLAN/COPY](../../../docs/scrollcraft/builds/afina-v9/BRIEF.md), [dokuz ana 21st kaynak/SHA kaydı](../../../docs/scrollcraft/builds/afina-v9/21ST-SOURCES.json) okunur. Kullanıcının yeni pro planı, v8’in görsel uygulama tercihlerini değiştirir; veri/ticaret/medya onayı/harcama yetkisini değiştirmez. [Task158 kaynak kökeni](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md) ve bu dosyanın source_sha256 alanı korunur. V8 DESIGN [byte-identical arşivdedir](../../../docs/referans/DESIGN-v8-history-20261101.md).

## Marka ve bütün sayfa

- Özgün logo/ambalaj, resmî iki satır slogan; aktif plan paleti#84CC16/#EDE8DD/#1C1F1A/#C89B3C, küçük metinde koyu altın#735519; Fraunces/Inter. Eski Figtree/yeşil-kâğıt palet v8 tarihçesidir. Boşluk32/48/64/96, kısa kaynaklı copy, gerçek eylem ve yaklaşık65/35 üretici/alışveriş dengesi.
- Yedi semantik bölüm: doğal film hero → altıSKU yatay galeri → gerçek Ellek tesisi → üç gerçek aşama bento → üç B2B segment → gerçek teklif taslağı → native SSS/adres/mağaza kapanışı. V8’in bağımsız ambalaj/kâğıt-plane170svh hero’su aktif değildir.
- Ana kaynaklar32829/24623/20023/1197/7262/35258/31986, nav26786/footer21474; dokuz seçili.1635 yalnız incelenmiş referans, mevcut ProductCard yeniden kullanılır;15025/7091 source okunup reddedildi. DemoVite/logo/veri/font/medya/WhatsApp gerçek içerik değildir.
- Orijinal ön dal ve tek okunur cam nav yeni planın parçası; blur sabit stil, animasyon değildir. H1/ikiCTA/gerçek içerik SSR görünür; film/loader/hydration önkoşulu yok. Sertifika/kapasite/organik/yorum/kıtlık/teslimat iddiası uydurulmaz; gerçek tesis ile temsili sahne ayrılır.

## UI ve hareket

Mevcut primitive önce; yeni kalıp 21st search→gerçekID→get_component→kaynak/SHA kaydı→AFİNA uyarlaması. shadcn MCP yok; resmî CLI search/view/docs/add, varsayılan görünüm bırakılmaz. HostedAI/key/global kurulum yapılmaz.
Yeni hareket motion/react/ortak lib/ui-motion.ts, transform/opacity ve kısa once giriş. Galeri tek pin yalnız≥1024×860 normal/JS ortamında, x=−travel×progress lineer; mobil/kısa/reduced/JSkapalı native rail. Diğer sahneler doğal, tesis yalnız fotoğraf parallax. GSAP/Lenis/ScrollCraft runtime/yeni rAF/bodywheelcapture yok; hover/tap/focus/disabled/error ve RadixEscape/odak dönüşü korunur.

## Medya ve çalışan ticaret

Kabul edilmiş A→B’den ücretsiz yerel ileri/geri kurgu: kaynak kare6..65,120kare/24fps/5sn/1280×720,2.742.609bayt; `public/videos/afina-zeytinlik-loop-5s.mp4`. Yeni üretim veya kusursuz fiziksel kamera döngüsü iddiası değildir. HeroAVIF76.119bayt; aynı kadraj WebP fallback; onaylı şişeOG1200×630. Normal mod muted/playsInline loop, gerçek pause/play, kullanıcı pause/görünürlük temizliği; reduced/saveData MP4 istemez, hata/blocked poster ve uygun manuel kontrol. Kontrol44px+ ve video transformu dışında. Scroll currentTime/seek, ikinci SDR tone mapping veya yeni ödeme/kredi yok.

Altı gerçek SKU’nun kimlik/sıra/ad/fiyat/stok/ambalaj/schema alanları korunur; mevcut ProductCard/detail/AddToCart/CatalogProvider/sunucu checkout otoritesi değişmez. SKU ve B2B segment seçimi tek quote context’inde gerçek alanlara taşınır. #teklif formu required/KVKK doğrulamasıyla gerçek özet/mailto taslağı hazırlar; gönderimi kullanıcı e-posta uygulamasında tamamlar. info@afina.com.tr/+903288827708 resmî AFİNA Şirketler Topluluğu kanalıdır; zeytin WhatsApp hattı veya sunucu e-posta teslimi varsayılmaz. Provider/env/DB etkinleştirmesi ve sahte gönderildi/CRM başarısı yok.

Doğru Flow proje62040049-3473-446b-9d93-8e6cbc45f8bc; Task160 ilk/son kare üç yetkili Omni1.1Flash üretimi36kredi, bakiye194, toplam56/80 tarihçesidir. B→C/C→D/D→F adayları kullanıcı/runtime onayı almamıştır; D→F etiket kusuru nedeniyle bağlanmaz. Kullanılmamış24kredi ek deneme yetkisi değildir; güncel [medya kayıtları](../../../docs/referans/flow-keyframes.json) okunur. Omni Chrome Use mevcut CUA/browser ile otomasyon yaklaşımıdır, Omni1.1Flash model adı değildir. MD örnekleri yeni Imagen/model/provider/anahtar/abonelik/global kurulum/ücret yetkisi vermez; güvenlik doğrulaması atlanmaz.

## Kabul

Final-source kontrast/axe/taşma/odak/gerçek kaynak hatası, yedi sahnenin hareket/geometrisi, galeride lineer x/son ürün/odak ve SKU→segment→taslak/gerçek URI, modal/menü/üyelik, SSR/JSkapalı/reduced/saveData/film/kontrol/hata ayrıca test edilir. Telefon360×640/büyütülmüş metin dahil gerçek viewport görüntüsüyle görülür; fiziksel cihaz değildir. Unit/build, CI, API READY, canlı UI, gerçek hesap/ödeme/e-posta teslimi ayrı kapılardır; eski v8PASS yeni v9 kabulü değildir. Test paketli headlessChromium≤2worker, browser.close()/sunucuSIGTERM düzgün kapanış; kullanıcının Chrome’u testte açılmaz.

Birlikte: [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md), [Scroll hero](../scroll-hero-video-yeni-nesil/SKILL.md), [Sinematik](../sinematik-siteler-yeni-nesil/SKILL.md), [UI/UX](../ui-ux-pro-max/SKILL.md), [Scroll Craft](../scroll-craft/SKILL.md), [Taste](../design-taste-frontend/SKILL.md). Upstream skill/engine değiştirilmez veya runtime’a kopyalanmaz.

## Tarihçe: Task160/v8 kabulü (v9 sonucu değildir)

V8 kaynak 179df851/CI 41304790349 ile afinazeytin.com üzerinde READY. Yerel 1200 unit/tam lint-type-build,74 e2e+6 responsive skip ve altı görsel genişlik PASS; Native inspector 1 FAIL/5 WARN korunur, Scenes exit0.

Canlı kabul: **TAMAMLANDI** — 74 e2e PASS + 6 responsive skip; 1440/1024/768/390/360×640/320 görsel/axe/taşma/pageerror/başarısız kaynak 0; motion/JavaScript kapalı/reduced PASS. Doğal film 190 decoded kare,7,916667 sn., ended/muted; 12,04 sn. gerçek UI oynatım kaydı alındı. Fiziksel cihaz veya gerçek hesap/ödeme/teklif mutasyonu değildir.

Final [yayın makbuzu](../../../docs/referans/yayin-object-v8-20261101.json) ve [QA kaydı](../../../docs/referans/qa-160-20261101.json) nihai Task 160 kanıt kayıtlarıdır; yeni Flow medya kabulü ayrı tutulur.

Flow devamı: üç yetkili Omni ilk/son kare isteği36kredi, bakiye 194; B→C/C→D/D→F üç tamamlanmış ve indirilmiş aday. İnceleme/kullanıcı onayı olmadan yeni klip public/runtime değildir; mevcut sitede kabul edilmiş A→B kalır. Tam harcama/istem/tarihçe docs/referans/flow-keyframes.json içindedir.
