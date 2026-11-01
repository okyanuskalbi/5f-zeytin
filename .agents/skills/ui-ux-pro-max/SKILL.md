---
name: ui-ux-pro-max
description: AFİNA için mevcut Motion/LazyMotion ve 21st bağlantısıyla tutarlı, erişilir mikro etkileşimler, durumlar ve performans politikası.
metadata:
  scope: project
  source: ui-ux-pro-max.md
  source_sha256: 9eb2268809dd3ee50376baf8d8d554141c4a75349803fabce4b15cca45ccb017
---

Task161/v9 nihai kabul: runtime31f251c; CI41317227401 SUCCESS, API READY;1208unit ve yerel/canlı87e2e+8responsive skip. [QA161](../../../docs/referans/qa-161-20261101.json) esastır; kaynak SHA ve aşağıdaki tarihçe değişmez.


# AFİNA v9 UI/UX Pro Max

## Durum, kaynak ve yetki

[Task161](../../../docs/tasks/161-pro-plan-tum-bolumler-21st-scroll-craft.md) UYGULANIYOR; final yerel/CI/API/canlı kabul BEKLİYOR. Aktif [v9 Hasat Rotası](../../../docs/DESIGN.md), uygulama öncesi [BRIEF/PLAN/COPY](../../../docs/scrollcraft/builds/afina-v9/BRIEF.md), [dokuz ana 21st kaynak/SHA kaydı](../../../docs/scrollcraft/builds/afina-v9/21ST-SOURCES.json) okunur. Kullanıcının yeni pro planı, v8’in görsel uygulama tercihlerini değiştirir; veri/ticaret/medya onayı/harcama yetkisini değiştirmez. [Task158 kaynak kökeni](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md) ve bu dosyanın source_sha256 alanı korunur. V8 DESIGN [byte-identical arşivdedir](../../../docs/referans/DESIGN-v8-history-20261101.md).

## Ortak etkileşim ve okunurluk

- Fraunces/Inter ve pro renk rolleri: marka#84CC16,taş#EDE8DD,mürekkep#1C1F1A,altın#C89B3C; küçük metinde#735519. Özgün logo/ambalaj/iki satır slogan; cam nav okunur taş fallback taşır. Sabit blur animasyon sayılmaz.
- Yeni API motion/react, mevcut LazyMotion düzenini sebepsiz değiştirme; ortak action/editorial lib/ui-motion.ts. Küçük hover/tap spring; scrub x=−travel×progress doğrudan lineer. Layout/width/height/top/left/filter-blur animasyonu veya ikinci engine yok.
- Galeri yalnız≥1024×860 normal/JS ortamında tek bounded pin; mobil/kısa/reduced/JSkapalı native yatay rail. Son SKU/klavye odağı görünür. Tesis yalnız izole görüntü parallax, diğer sahneler bir kez/SSR görünür. Hero doğal tam-film/ön dal/gerçek H1+anchor; v8ambalaj/kâğıt-plane170svh kontratı tarihçe.
- Hover/tap/focus/disabled/loading/error/success aynı ailede. JS’e bağımlı segment/teklif/detail/sepet kontrolleri hydration öncesi disabled; gerçek anchor’lar açık. Üç segment button type=button/aria-pressed; form her input’a etiket/required/KVKK ve ilişkili hata/status verir.
- Modal/menü RadixEscape/odak kapanı/geri dönüş ve arkaplan inert korunur; modal scroll-lock sahne scroll’unu ele geçirmez. AnimatePresence çıkışındaki özet linkleri odak/tıklama kabul etmez; değişen form eski özeti geçersiz kılar. Native FAQ details klavye ve açık durum semantiğini korur.

## Gerçek ürün, talep ve medya

Altı gerçek SKU’nun kimlik/sıra/ad/fiyat/stok/ambalaj/schema alanları korunur; mevcut ProductCard/detail/AddToCart/CatalogProvider/sunucu checkout otoritesi değişmez. SKU ve B2B segment seçimi tek quote context’inde gerçek alanlara taşınır. #teklif formu required/KVKK doğrulamasıyla gerçek özet/mailto taslağı hazırlar; gönderimi kullanıcı e-posta uygulamasında tamamlar. info@afina.com.tr/+903288827708 resmî AFİNA Şirketler Topluluğu kanalıdır; zeytin WhatsApp hattı veya sunucu e-posta teslimi varsayılmaz. Provider/env/DB etkinleştirmesi ve sahte gönderildi/CRM başarısı yok.

Kabul edilmiş A→B’den ücretsiz yerel ileri/geri kurgu: kaynak kare6..65,120kare/24fps/5sn/1280×720,2.742.609bayt; `public/videos/afina-zeytinlik-loop-5s.mp4`. Yeni üretim veya kusursuz fiziksel kamera döngüsü iddiası değildir. HeroAVIF76.119bayt; aynı kadraj WebP fallback; onaylı şişeOG1200×630. Normal mod muted/playsInline loop, gerçek pause/play, kullanıcı pause/görünürlük temizliği; reduced/saveData MP4 istemez, hata/blocked poster ve uygun manuel kontrol. Kontrol44px+ ve video transformu dışında. Scroll currentTime/seek, ikinci SDR tone mapping veya yeni ödeme/kredi yok.

Doğru Flow proje62040049-3473-446b-9d93-8e6cbc45f8bc; Task160 ilk/son kare üç yetkili Omni1.1Flash üretimi36kredi, bakiye194, toplam56/80 tarihçesidir. B→C/C→D/D→F adayları kullanıcı/runtime onayı almamıştır; D→F etiket kusuru nedeniyle bağlanmaz. Kullanılmamış24kredi ek deneme yetkisi değildir; güncel [medya kayıtları](../../../docs/referans/flow-keyframes.json) okunur. Omni Chrome Use mevcut CUA/browser ile otomasyon yaklaşımıdır, Omni1.1Flash model adı değildir. MD örnekleri yeni Imagen/model/provider/anahtar/abonelik/global kurulum/ücret yetkisi vermez; güvenlik doğrulaması atlanmaz.

## 21st ve shadcn

Mevcut primitive/token önce. Bağlı21stsearch→gerçekID→get_component→exactSHA→uyarlama: yedi bölüm32829/24623/20023/1197/7262/35258/31986, nav26786/footer21474, toplam9ana kaynak.1635 yalnız kaynak referansı, ProductCard mevcut kullanım;15025genericcounter/7091invasivemotor reddedildi. Demo marka/veri/metin/medya/font/nav ve framer-motion taşıma; hostedAI/key/global kurulum yetkisi çıkarma. shadcn MCP yok, resmî CLI search/view/docs/add ve marka token uyarlaması.

## Kabul

Final-source kontrast/axe/taşma/odak/gerçek kaynak hatası, yedi sahnenin hareket/geometrisi, galeride lineer x/son ürün/odak ve SKU→segment→taslak/gerçek URI, modal/menü/üyelik, SSR/JSkapalı/reduced/saveData/film/kontrol/hata ayrıca test edilir. Telefon360×640/büyütülmüş metin dahil gerçek viewport görüntüsüyle görülür; fiziksel cihaz değildir. Unit/build, CI, API READY, canlı UI, gerçek hesap/ödeme/e-posta teslimi ayrı kapılardır; eski v8PASS yeni v9 kabulü değildir. Test paketli headlessChromium≤2worker, browser.close()/sunucuSIGTERM düzgün kapanış; kullanıcının Chrome’u testte açılmaz.

Birlikte: [Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md), [Scroll hero](../scroll-hero-video-yeni-nesil/SKILL.md), [Sinematik](../sinematik-siteler-yeni-nesil/SKILL.md), [UI/UX](../ui-ux-pro-max/SKILL.md), [Scroll Craft](../scroll-craft/SKILL.md), [Taste](../design-taste-frontend/SKILL.md). Upstream skill/engine değiştirilmez veya runtime’a kopyalanmaz.

## Tarihçe: Task160/v8 kabulü (v9 sonucu değildir)

V8 kaynak 179df851/CI 41304790349 ile afinazeytin.com üzerinde READY. Yerel 1200 unit/tam lint-type-build,74 e2e+6 responsive skip ve altı görsel genişlik PASS; Native inspector 1 FAIL/5 WARN korunur, Scenes exit0.

Canlı kabul: **TAMAMLANDI** — 74 e2e PASS + 6 responsive skip; 1440/1024/768/390/360×640/320 görsel/axe/taşma/pageerror/başarısız kaynak 0; motion/JavaScript kapalı/reduced PASS. Doğal film 190 decoded kare,7,916667 sn., ended/muted; 12,04 sn. gerçek UI oynatım kaydı alındı. Fiziksel cihaz veya gerçek hesap/ödeme/teklif mutasyonu değildir.

Final [yayın makbuzu](../../../docs/referans/yayin-object-v8-20261101.json) ve [QA kaydı](../../../docs/referans/qa-160-20261101.json) nihai Task 160 kanıt kayıtlarıdır; yeni Flow medya kabulü ayrı tutulur.
