# Yeni nesil dört MD'nin AFİNA uyarlaması

**Tarihsel Task 158 kaydı:** kullanıcı sonrasında hero'nun hâlâ aynı göründüğünü belirterek gerçek Flow videosuyla sinematik açılış istedi. Aşağıdaki v6 split/frame-only/genel no-autoplay uygulama tercihleri [v7 tasarımı](../DESIGN.md) ve [Task 159](../tasks/159-flow-sinematik-hero.md) ile değişmiştir. Özgün kaynak hash'leri ve bütçe/güvenlik/medya kabul sınırları geçerlidir; dört normalize skill güncel v7'yi izler.

1 Kasım 2026 kullanıcı isteği: paylaşılan dört MD'yi bu projede uygulamak. Dosyalar tasarım/uygulama girdisidir; içlerindeki global kurulum, anahtar, model, ücretli üretim ve yayın örnekleri bağımsız işlem yetkisi değildir. Mevcut [v6 Üretici Atlası](../DESIGN.md), kullanıcının koyu/ortalanmış hero ve cam menü reddi, marka gerçekleri ve mevcut servis sınırları korunur. Yeni çalışma [Task 158](../tasks/158-yeni-nesil-md-kitleri.md) içindedir.

## Kaynak envanteri

Kaynaklar kullanıcının `/Users/emre/Downloads/` klasöründen okundu. Hash'ler tam özgün baytlara aittir; yeni skill'ler bunların proje için normalize edilmiş uyarlamalarıdır.

| Özgün dosya | Bayt | SHA256 | Yerel karşılık |
| --- | ---: | --- | --- |
| `profesyonel-web-sitesi-skill-yeni-nesil.md` | 6039 | `f0246c60cd7e5588d093228c38d178dbb945e323067c2165dfd1e9ec03445980` | [Profesyonel web](../../.agents/skills/profesyonel-web-sitesi-yeni-nesil/SKILL.md) |
| `scroll-hero-video-kiti-yeni-nesil.md` | 7818 | `f01ca525ec395387ffddaa3be045197b515158ecb0405db2ebe0f77580b051a3` | [Scroll hero](../../.agents/skills/scroll-hero-video-yeni-nesil/SKILL.md) |
| `sinematik-siteler-yeni-nesil.md` | 9212 | `aa630ea06c077ae0c96444c602a7a46328300e4435e4adbc2c1a7a450a4ebac6` | [Sinematik siteler](../../.agents/skills/sinematik-siteler-yeni-nesil/SKILL.md) |
| `ui-ux-pro-max.md` | 5326 | `9eb2268809dd3ee50376baf8d8d554141c4a75349803fabce4b15cca45ccb017` | [UI/UX Pro Max](../../.agents/skills/ui-ux-pro-max/SKILL.md) |

Dört skill `.agents/skills/` içinde bu projeye aittir; frontmatter adları klasör adlarıyla eşleşir ve birbirlerine bağlanır. Global Codex/Claude/MCP ayarları değiştirilmez; `.claude` skill kopyaları, `AGENTS.md` ve mevcut talimatlar bu kaynaklarla üzerine yazılmaz. Root görev kayıtlarına bu uyarlamanın bağlantısı ayrıca eklenebilir.

## İlke → mevcut proje karşılığı

| Kaynak ilkesi | AFİNA karşılığı |
| --- | --- |
| Konuya özgü marka, iki font, kırık simetri, 8 px ölçek | V6 kâğıt/zeytin/şampanya paleti, Fraunces/Figtree, ayrı metin/görsel hero, ortak boşluk ve hareket tokenları. Logo ve resmî slogan korunur. |
| Tek bölüm mesajı, gerçek içerik, tutarlı mikro durumlar | Üretici %65 / alışveriş %35 anlatımı; gerçek tesis ve mevcut altı ürün. Focus/hover/tap/disabled/hata/başarı davranışları gerçek işlemlere bağlıdır. |
| Standart bileşende 21st search/kaynak uyarlaması | Var olan MCP ve primitive'ler; gerçek sonuç demo ID'siyle kaynak alma, projeye özgü renk/font/içerik. Yeni hosted AI veya kurulum yetkisi çıkarılmaz. |
| Motion, transform/opacity, bir kez reveal, amaçlı spring | `lib/ui-motion.ts`, `MotionProvider`, mevcut LazyMotion/react-m; kısa ve SSR görünür etkileşimler. Video/kare zamanı lineerdir. |
| Sahne → kısa video → kaydırma | Kabul edilen A→B Flow kaynağı, `ScrollFrameSequence`, `FramePlayback`, `frames.ts`, denetlenen AVIF/WebP poster/kare türevleri. Yeni üretim gerektirmez. |
| Yavaş kamera ve görsel süreklilik | Onaylı parlak zeytinlik penceresi, aynı başlangıçtan poster; v6 metin/CTA okunurluğu, görünüm dışında duraklama ve kaynak kabulü. |
| Mobil, kontrast, reduced-motion ve kanıt | Paketli headless Chromium ile en fazla iki worker; gerçek görüntü/etkileşim ve ayrı unit/build/HTTP kanıtı. Fiziksel telefon veya servis mutasyonu yapılmadıysa açık kayıt. |

## Açık uyarlama ve istisnalar

| Kaynaktaki örnek | Uygulanış ve gerekçesi |
| --- | --- |
| Kök `AGENTS.md`/global Claude skill veya MCP kurulumunu kopyalama | Dört proje yerel normalize skill kullanılır. Çalışan talimat/bağlantı ve anahtarlar korunur; yeni bağımlılık kurulumu gerekmez. |
| Koyu tam ekran, ortalanmış başlık, cam nav/input ve autoplay loop | Kullanıcının reddettiği eski yön olduğu için alınmaz. V6 açık split hero ve opak menü korunur; sinematik katkı sahne/hareket dozundadır. |
| Genel “başlık + iki CTA şablonu” yasağı | Kopya kompozisyondan kaçınılır; müşterinin gerçek ürün ve kurumsal teklif bağlantıları kaldırılmaz. |
| Instrument Serif, sistem fontu veya yeni font servisi | Mevcut Fraunces/Figtree korunur; yazı ailesi değişimi yeni istek değildir. |
| 300–400vh pin, tüm videoyu `preload="auto"`, ikinci video-seeking/rAF motoru | Mevcut framed canvas, doğal akış, küçük tampon ve talebe bağlı kare yükleme kullanılır. Scroll kilidi veya uzun sabit intro geri gelmez. |
| Reduced-motion'da video normal hızda oynasın / `video.play()` | Otomatik hareket yerine statik poster. İçerik ve CTA her zaman görünürdür. |
| Girişte gizli H1/nav, `filter: blur(...)` ve büyük parallax | SSR'da metin görünür kalır; yalnız küçük transform/opacity hareketleri, sade mod ve sabit okunurluk. Kaynaklar kendi içinde yalnız transform/opacity ilkesiyle blur örneği arasında çelişir; ilke korunur. |
| “Spring her yerde”, key'siz AnimatePresence, her listede `layout` | Ortak token/presetler ve uygun küçük etkileşimler; kararlı key/exit, mevcut Radix odak davranışı. Lineer scrub ve büyük listelerde otomatik spring/layout yoktur. |
| Yeni Imagen sahnesi, laptop/3D mockup, sıvı ışık ve maliyet/abonelik iddiaları | Model erişimi veya ücretsiz üretim varsayılmaz. Önce onaylı AFİNA varlıkları; yeni üretim yalnız mevcut Google Flow kapsamı, doğrulanan ücret ve kabul ile. Konu dışı demo sahneleri gerçek tesis/ambalaj kanıtı olmaz. |
| 3–6 saniye ve <5 MB video hedefi | Örnek doğrudan MP4 içindir. Önceden kabul edilen 7,93 sn. / 7.390.220 bayt kaynak kesilmez; runtime ham MP4'ü yayınlamaz, mevcut kare/AVIF/WebP bütçe kapısı korunur. |
| Rastgele testimonial/pricing/marquee örnekleri | Bileşen arama örneğidir; sahte yorum, fiyat paketi, belge veya sosyal kanıt ekleme yetkisi değildir. |
| “Gerçek telefonda/Lighthouse test edildi” veya “10.000+ test edilmiş bileşen” checklist'i | Otomatik başarı kaydı değildir. Yalnız gerçekten çalıştırılan ölçüm/test kaydedilir; emülasyon fiziksel cihaz kabulü sayılmaz. |

## Omni Chrome Use ayrımı ve kredi sınırı

İki MD'deki **Omni Chrome Use**, oturum açık Chrome/Flow arayüzünü otomasyonla kullanma yaklaşımını tarif eder. Ayrı bir Omni Chrome Use eklentisinin kurulu olduğu varsayılmaz; mevcut erişilebilir CUA/browser araçları kullanılabilir. **Omni 1.1 Flash**, Flow içinde ayrı bir model seçeneğidir; otomasyon erişimi, model seçimi, çıktı ve ücret farklı olgulardır.

Bu görevin başlangıç kaydındaki 60 kredi yalnız önceki üç geçişin kalan sınırıdır; her yeni çağrıda provenans defterindeki güncel harcama/kalan okunur. Skill'i yeniden okumak bütçeyi sıfırlamaz. Yeni kaynakların “üret/birkaç kez dene/indir” örnekleri ek model, kapsam veya tekrar yetkisi değildir. Google doğrulama/CAPTCHA engeli atlanmaz. Yeni aday ancak gerçek çıktı ve kabul kaydıyla runtime'a girebilir. Test tarayıcısı yalnız paketli headless Chromium'dur; yetkili Flow üretim oturumu bu test kısıtından ayrı tutulur.

## 21st kaynak uyarlaması

Mevcut bağlantıda `motion spring button hover tap` arandı ve **26725 Magnetic Button** kaynağı alındı: [Hirael bileşeni](https://hirael.com/components/animation/magnetic-button), [MIT kaynak deposu](https://github.com/MohammadShehadeh/hirael). Reduced-motion ile spring'i kapatma ve küçük basma/hover geri bildirimi ilkesi mevcut AFİNA eylemlerine uyarlandı. Cursor takip eden manyetik davranış, demo gradyanı veya ek bağımlılık taşınmadı. V6 hero kompozisyonunun önceki 19074 kaynağı korunur. Gerçek 21st kaynak erişimi yeni hosted AI üretimi anlamına gelmez.

## Kabul kaydı

Bu beş dosya yetenek ve karar uyarlamasıdır. Runtime değişikliği, test, push, yayın veya yeni medya üretildiği sonucunu tek başına kanıtlamaz. Root uygulaması ve gerçek doğrulama/yayın sonuçları [Task 158](../tasks/158-yeni-nesil-md-kitleri.md) içinde kaydedilir. Kaynak hash'leri, skill adları ve yerel çapraz bağlantılar ayrıca denetlenebilir.
