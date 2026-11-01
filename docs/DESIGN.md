# AFİNA ZEYTİN v7 — Zeytinin İçinden

## Güncel kullanıcı düzeltmesi

1 Kasım 2026: kullanıcı “Hero hâlâ aynı görünüyor, Google Flow videolarını kullanıp MD’lerdeki gibi daha sinematik bir açılış yap” dedi. Bu istek, v6 split/çerçeveli sahne ve yalnız kare dizisiyle oynatma tercihinin yerini alır. Normal modda kısa filmin kendiliğinden sessiz bir kez ilerlemesi bu kapsamda istenir; önceki uygulamanın genel otomatik oynatma yasağı yeni hero için geçerli değildir. Reduced-motion ve veri tasarrufu sınırları korunur.

Bu dosya tek güncel görsel sözleşmedir. Önceki DESIGN.md değişmeden [v6 tarihçesinde](referans/DESIGN-v6-history-20261101.md), daha eski tarifler [v5 tarihçesinde](referans/DESIGN-v5-history-20261101.md) saklanır. Geçmiş medya onayları ve yayın kanıtları silinmez. Güncel uygulama ve bekleyen kabul [Task 159](tasks/159-flow-sinematik-hero.md) içindedir; bu belge tamamlanmış test/yayın iddiası değildir.

## Görsel fikir ve marka

İlk ekranın kendisi zeytinliğin içindedir: kenardan kenara gerçek Flow filmi, sol altta büyük ve okunur resmî slogan, iki gerçek eylem. Eski iki sütun, organik pencere, görüntü üstündeki ürün kartı ve boş kaydırma mesafesi açılış kompozisyonundan kalkar. Görüntünün sağ/üst kısmı aydınlık ve ayrıntılı kalır; metin için yalnız gereken yerel sol-alt kontrast katmanı kullanılır. Bütün sahneyi karartan merkezlenmiş hero veya cam menü geri gelmez.

Orijinal AFİNA logosu ve **“Kökü toprakta. Yeri sofrada.”** sloganı korunur. Yerel Fraunces başlıklar, Figtree gövde/arayüz; yeni font servisi yoktur.

| Rol | Renk | Kullanım |
| --- | --- | --- |
| Kâğıt | `#F4F0E7` | Opak üst menü ve üretim/ürün odaklı alt sayfa yüzeyleri; film üzerindeki okunur metin/eylem |
| Zeytin | `#172B21` | Açık yüzeylerde başlık/eylem ve tek belirgin B2B bloğu |
| Şampanya | `#B6A078` | Ölçülü vurgu ve denetim ayrıntısı |
| Antrasit | `#252725` | Gövde ve yüksek okunurluk gereken metin |

Renkler mevcut semantik tokenlardan gelir. Video üzerindeki metin ve küçük denetimler bütün kadrajlarda kontrast taşır; yalnız ilk postere göre renk seçilmez. Marka kaplaması, neon gradyan, metalik parıltı, büyük blur veya filtre animasyonu yoktur.

## Menü, hero ve mobil kompozisyon

- Orijinal logo/mağaza/sepet/hesap/menü yolları opak kâğıt navigasyonda, filmin dışında kalır. Cam kapsül, başlığın önünde ikinci nav ve demo menü eklenmez.
- Film navigasyonun altından başlayarak bütün genişliği kaplar. Hero viewport etkisi verir; 300–400vh pin, body/wheel/touch yakalama ve zorunlu uzun intro yoktur. Kısa ekran veya büyütülmüş metinde hero içerikle büyüyebilir, kesilmez.
- Tek H1 sol alt bölgede yer alır; alt metin kısa üretici anlatımıdır. Başlık bir loader veya film çözümlemesini beklemez, SSR'da görünürdür.
- **Ürünleri Keşfet** → `#urunler` ve **Kurumsal Teklif Al** → `#toptan-iletisim` gerçek DOM bağlantılarıdır. Poster/sade/hata durumunda da erişilir. Ürün detayları ve sepete ekleme koleksiyon/alışveriş akışında kalır.
- Görünür, klavyeyle erişilir küçük film denetimi sol/sağ alt uygun boşlukta bulunur; en az 44 px dokunma hedefi vardır. Denetim başlığa, CTA'ya veya güvenli alanlara binmez.
- Mobilde aynı Flow kadrajı `object-fit: cover` ve doğru odak noktasıyla kullanılır; poster/video odak noktası eşleşir. Ağacın/dalın hareketi ve yaprak ayrıntısı izlenebilir olmalıdır. Odak gerçek mobil görüntülerle ayarlanır; fotoğraf geometrisi veya ambalaj değiştirilmez.
- Telefon yüksekliği tek başına bütün mobil videoları kapatma gerekçesi değildir. Reduced-motion/saveData/engelli oynatma/hata doğru geri dönüşlerdir. Film ve kontroller düşük yükseklik, yön değişimi ve metin büyütmede taşmamalıdır.

## Google Flow filmi ve durum sözleşmesi

Yalnız kullanıcının kabul ettiği ilk **A→B ağaç → dal** klibi kullanılabilir. Diğer üç geçişin son kayıtlı durumu Google doğrulama engelidir; üretilmiş/yayınlanmış gibi gösterilmez. Aynı kabul edilmiş kaynaktan ses içermeyen, web için sıkıştırılmış H264/faststart MP4 türevi (`public/videos/afina-agac-dal.mp4`) hazırlanır. Bu yerel türetme yeni ücretli medya üretimi değildir. Kaynak/çıktı SHA, gerçek codec/süre/boyut ve medya kapısı doğrulanır; SDR'ye ikinci tone mapping uygulanmaz.

- Normal mod: tercih/hydration ve gerçek görünürlük kontrolünden sonra MP4 istenir; `muted` ve `playsInline` ile **bir kez** oynar. A ve B farklı olduğu için `loop` eklenmez veya sahte dikiş yapılmaz.
- Film bitince son karede kalır. İlk postere sıçrama veya observer nedeniyle kendiliğinden tekrar başlama yoktur; kullanıcı **Tekrar oynat** ile başa alabilir.
- Oynarken **Duraklat**, durduğunda **Oynat**, bittiğinde **Tekrar oynat** durumu gerçek video olaylarıyla eşleşir. Kullanıcının manuel duraklatma tercihi görünürlük olaylarıyla ezilmez. Autoplay reddi başarılı oynatma sayılmaz.
- Gizli sekme veya ekran dışı medya durur. Görünürlük geri geldiğinde yalnız kullanıcının durdurmadığı/bitmemiş uygun oturum devam edebilir; biten film otomatik yeniden başlamaz.
- Reduced-motion, saveData, engelli oynatma ve yükleme/codec hatasında statik, kaynaklı poster ile H1/CTA kalır. Bu koşullarda kendiliğinden `video.play()` veya gereksiz MP4 indirmesi başlatılmaz; gerçekten sunulan manuel denetim durumu anlaşılır olmalıdır.
- Observer, event ve video kaynakları unmount'ta temizlenir. Başka sekme, tercih değişimi, autoplay promise reddi ve tekrar oynatmanın yaşam döngüsü test edilir.

## Motion ve rehberlerin uygulanması

Yeni animasyon API'leri `motion/react` üzerinden kullanılır; demo `framer-motion` importu veya ikinci motor taşınmaz. Ortak değerler `lib/ui-motion.ts` içindedir. Açılış/hover/tap küçük transform/opacity hareketleriyle sınırlıdır; SSR metni görünür kalır. Filmin yüklenmesi veya başlaması bir giriş animasyonunun bitmesine bağlı değildir.

`useScroll`/`useTransform` yalnız film kabuğuna küçük, isteğe bağlı bir parallax/scale etkisi verebilir. Native filmin `currentTime` değeri kaydırmaya bağlanmaz; bir seek/rAF motoru kurulmaz. Video zamanına spring uygulanmaz. Genel `ScrollFrameSequence`/canvas kodu diğer onaylı kullanım için korunabilir, fakat yeni hero'nun gerçek filmi yerine kullanılmaz. Reduced-motion'da kabuk hareketi kapanır, poster kalır.

Dört proje yerel rehber birlikte kullanılır: [Profesyonel web](../.agents/skills/profesyonel-web-sitesi-yeni-nesil/SKILL.md), [Scroll hero](../.agents/skills/scroll-hero-video-yeni-nesil/SKILL.md), [Sinematik siteler](../.agents/skills/sinematik-siteler-yeni-nesil/SKILL.md), [UI/UX Pro Max](../.agents/skills/ui-ux-pro-max/SKILL.md). [Task 158 kaynak/uyarlama kaydı](referans/yeni-nesil-md-uyarlamalari-20261101.md) kaynak kökenidir; oradaki v6 split/frame-only ve genel no-autoplay tercihleri kullanıcının bu yeni düzeltmesiyle güncellenmiştir.

Sinematik MD'deki tam ekran gerçek film, kontrollü kamera ve katmanlı metin fikri v7'ye doğrudan karşılık bulur. Örnek siyah/glass/nav/email pill/Instrument Serif/demo sahneleri alınmaz; scroll kitinin 300–400vh pin ve reduced-motion `video.play()` davranışı uygulanmaz. 21st **12200 PrismaHero** yalnız tam geniş medya + overlay içerik kompozisyonu için uyarlanır; demo medya/metin/font/nav, gizli başlık ve `framer-motion` importları taşınmaz. Yeni global skill/MCP/anahtar veya bağımlılık kurulumu yoktur.

## Hero altındaki sayfa ve içerik sınırı

Hero sonrası üretim öncelikli site korunur: kısa marka anlatımı → gerçek tesis → açık ürün rafı → üretim yolculuğu → tek zeytin B2B alanı → kaynaklı beş SSS/iletişim/footer. Yaklaşık %65 kurumsal üretim güveni, %35 ürün/alışveriş; mevcut en fazla altı SKU, gerçek detay/sepet/hesap ve sunucu fiyat/stok otoritesi değişmez.

Gerçek tesis fotoğrafı yapay hat/hasat kanıtı yerine geçirilmez. Onaysız kapasite, sertifika, organik/sağlık, yorum ve satış/popülerlik iddiası eklenmez. Telefon/e-posta, CRM/ödeme/giriş veya talep gönderimi yapılandırılmadan başarılıymış gibi sunulmaz. Video kontrollü bir görsel yenilemedir; DB/auth/ödeme iş kuralı değişimi değildir.

## Omni ve üretim yetkisi

**Omni Chrome Use**, mevcut CUA/browser ile oturumlu Flow arayüzü otomasyonu yaklaşımıdır; ayrı eklenti kurulu varsayılmaz. **Omni 1.1 Flash** model adı, araç erişimi, ücret ve sonuç ayrı olgulardır. Yeni Imagen/sağlayıcı/ücretsiz hak veya yeni ücretli üretim bu görevden çıkarılmaz.

Görev başlangıcında kalan 60 kredi yalnız önceki üç geçişin sınırıdır; her çağrıda güncel provenans ve kalan kullanım okunur, belge okumak bütçeyi yenilemez. Google doğrulama/CAPTCHA engeli atlanmaz. Yeni aday gerçek çıktı ve kabul kaydı olmadan runtime'a bağlanmaz. Bu görev mevcut kabul edilmiş filmin yerel türevini kullanır.

## Kabul ve kanıt

Task 159 için unit/lint/typecheck/build ve medya kapıları; paketli headless Chromium'da masaüstü/mobil görsel/etkileşim kabulü gerekir. En fazla iki worker, düzgün browser/server kapanışı; kullanıcının Chrome'u test/Lighthouse için açılmaz. Film zamanının gerçekten ilerlemesi, sessizlik, tek geçiş/son kare, duraklat/oynat/tekrar, görünürlük/tercih değişimi, autoplay reddi, poster, taşma ve klavye hedefleri ölçülür. Gerçek ürün/sepet/üyelik yolları regresyona karşı kontrol edilir.

SSR/JavaScript kapalı ve reduced-motion/saveData durumunda poster/H1/CTA erişilir kalır. Viewport testi fiziksel telefon kabulü değildir; gerçek hesap/ödeme/teklif yazımı ve uzak migration ayrı kabul olarak kalır. Önceki [Task 157](tasks/157-tam-tasarim-ve-canli-kabul.md) ve [Task 158](tasks/158-yeni-nesil-md-kitleri.md) sonuçları tarihsel kanıttır; yeni film için test/yayın sonucu veya kullanıcının görsel kabulü yerine geçmez.
