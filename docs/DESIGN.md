# AFİNA ZEYTİN v6 — Üretici Atlası

## Güncel karar

1 Kasım 2026: kullanıcı canlı siteyi masaüstünde ve mobilde inceleyip eksikleri düzeltmeyi, beğenmediği hero ile tasarım belgelerini bütünüyle değiştirmeyi istedi. Bu dosya güncel görsel sözleşmedir. Önceki v4/v5 tarifleri ve Task 156'nın ortalanmış koyu hero/cam menü yönü geçerli tasarım hedefi değildir. Önceki DESIGN.md içeriği değiştirilmeden [tasarım tarihçesine](referans/DESIGN-v5-history-20261101.md) taşındı. Geçmiş medya onayları ve yayın kanıtları korunur.

Tasarımın odağı **Osmaniye / Düziçi / Ellek'te üretim yapan AFİNA**: yaklaşık %65 üretim ve kurumsal güven, %35 ürün ve alışveriş. Perakende müşterisi ile işletme alıcısının gerçek yolları aynı sayfada açık olmalı.

## Görsel dil

Açık kâğıt zemin, koyu zeytin mürekkebi, bol nefes alan asimetrik sayfa düzeni. Gerçek tesisi ve ürünün kendisini öne çıkaran bir üretici yayını. İnce çizgiler, belirgin tipografi ve gerçek fotoğraf sayfanın karakterini kurar. Şampanya rengi ölçülü vurgu içindir; parlama, metalik altın efekti ve cam kartlar kullanılmaz.

| Rol | Renk | Kullanım |
| --- | --- | --- |
| Kâğıt | `#F4F0E7` | Ana sayfa, açılış, kurumsal anlatım ve ürün rafı |
| Zeytin | `#172B21` | Başlık, birincil eylem, tek belirgin kurumsal teklif bölümü |
| Şampanya | `#B6A078` | İnce vurgu ve açık/koyu yüzeylere uygun ikincil detay |
| Antrasit | `#252725` | Gövde ve yüksek okunurluk gerektiren metin |

Renkler semantik tokenlarla kullanılır. Açık yüzeydeki buton/alan/ürün fiyatı ve koyu B2B yüzeyindeki buton/alan kendi kontrastını korur; dekoratif vurgu rengi otomatik olarak küçük metin rengi sayılmaz.

Yerel **Fraunces** başlıklarda, **Figtree** gövde ve arayüzde kullanılır. Yeni font servisi eklenmez. H1 masaüstünde geniş ama metin sütununa ait; mobilde satırları ve gerçek CTA'ları itmeyecek ölçüdedir. Gövde metni okunaklı 16–18 px, önemli arayüz etiketleri en az 12 px hedefler. Başlık italikleri tek vurgu olarak ölçülü kullanılabilir. Paragraflar çoğunlukla 45–65 karakter genişliğindedir.

## Menü ve açılış

- Üst menü açık, opak ve sade yüzeydir. Hero üzerinde kayan cam kapsül, bulanık arka plan veya koyu örtü yoktur. Orijinal logonun açık zemine uygun yatay varyantı kullanılır; logo yeniden çizilmez.
- Masaüstü hero asimetrik iki parçadır: solda yaklaşık 5/12 metin alanı, sağda yaklaşık 7/12 karartılmamış zeytinlik sahnesi. Görsel kendi çerçevesindedir; sloganın arkasına yayılmaz.
- Tek H1 ve resmî slogan: **“Kökü toprakta. Yeri sofrada.”** Açıklama gerçek üretim bölgesini ve perakende/toptan odağını kısa biçimde anlatır.
- İki gerçek DOM bağlantısı görünür kalır: **Ürünleri Keşfet** → `#urunler`; **Kurumsal Teklif Al** → `#toptan-iletisim`. Düğmelerin işlevi animasyonun hazır olmasına bağlı değildir.
- Görselde küçük, kaynaklı Ellek / Düziçi / Osmaniye notu olabilir; sahte sezon, kapasite, sertifika, müşteri sayısı veya satış rozeti konmaz.
- Mobilde başlık, açıklama, CTA ve görüntü doğal bir dikey akış kurar. Tam ekran yükseklik, iki ekran süren sabit intro veya küçük ekranı kaplayan satın alma kartı zorunlu değildir. Menü, başlık ve CTA kesilmez.

## Sayfa akışı

1. **Açık editoryal hero:** metin ve aydınlık hareketli sahne ayrı yüzeylerde.
2. **Kısa marka anlatımı:** kökler, ürün odağı ve bireysel/kurumsal müşteri bağlamı; az sayıda kaynaklı bilgi.
3. **Gerçek tesis:** müşteri fotoğrafı büyük, geometrisi ve okunur tabelası korunarak kullanılır. Gerçek dış cephe fotoğrafı yapay üretim hattı veya hasat belgesi yerine geçirilmez.
4. **Açık ürün rafı:** mevcut en fazla altı SKU, onaylı ambalaj görselleri, sunucudan gelen fiyat/stok, ürün detayı ve gerçek sepete ekleme. Ağır koyu kartlar, radyal parıltılar ve sahte “en çok alınan” rozeti yoktur. Select/Professional sunum grupları yeni SKU ya da ambalaj anlamına gelmez.
5. **Üretim yolculuğu:** kısa, kaynaklı adımlar ve onaylı sahne; görsel kanıtı olmayan makine/kapasite/sertifika iddiası eklenmez.
6. **Tek belirgin zeytin yeşili B2B alanı:** işletme ihtiyaçları, net talep formu ve doğrulanmış gönderim durumu. Yapılandırılmamış servis için başarılı talep veya CRM kaydı gösterilmez.
7. **SSS, iletişim ve footer:** ortak kaynaktaki beş cevap, gerçek satıcı/konum ve mevcut sipariş takibi, teslimat/iade ve satış koşulları yolları. Telefon/e-posta uydurulmaz.

Landing, menü, ürün sunumu ve mevcut müşteri/sepet yüzeyleri aynı tipografi ve eylem hiyerarşisinde anlaşılır kalır. Görsel yenileme fiyat, stok, ürün sahipliği, oturum, ödeme veya veritabanı sözleşmesini değiştirmez.

## Google Flow, Omni ve hareket

Kullanıcı Google Flow ve Omni ile çalışmayı istedi. Yeni medya için araç/erişim, model, ücret ve sonuç gerçek arayüzden doğrulanır. Omni'nin kullanılabilir olması veya hazırlanmış bir istem çıktı üretildiği anlamına gelmez. AtlasCloud/Kling/başka ücretli sağlayıcıya kendiliğinden geçilmez.

- Bugünkü kullanılabilir hareketli kaynak, kullanıcı tarafından kabul edilen ilk **A→B ağaç → dal** Flow klibidir. Kaynak onayı ve türevler `lib/media/cinematic-hero.json`, `docs/referans/flow-keyframes.json` ve build medya kapısında kayıtlıdır. Bu medya onayı, kullanıcı tarafından reddedilen eski hero düzenini korumayı gerektirmez.
- Masaüstünde bu sahne sağ çerçeve içinde doğal kaydırmaya bağlı ilerler; dış hero'nun kararlı ölçüm alanı kullanılır. Metin ve CTA her zaman okunur DOM içeriğidir. Sayfa kaydırması yakalanmaz veya kilitlenmez.
- Mobilde doğal içerik akışı, aynı kaynaklı poster ve ancak uygun koşulda kısa/kompakt sahne kullanılır. Uzun tam ekran pin zorunlu değildir.
- Azaltılmış hareket, veri tasarrufu, kısa ekran veya oynatıcı hatasında **statik poster** kalır. Otomatik video oynatımı alternatif değildir. Gizli sekmede/görünüm dışındayken gereksiz kare işi durur.
- Kaydırmada ileri/geri süreklilik, küçük başlangıç tamponu, boyutu belli poster ve tembel isteğe bağlı kare yükleme korunur. Body/wheel/touch kilidi, sürekli loop ve preloader arkasına gizlenen başlık eklenmez.
- Diğer üç geçişin son kayıtlı durumu Google doğrulama engelidir; üretilmiş veya yayına alınmış sayılmaz. Mevcut kalan **60 kredi** yalnız daha önce istenen üç aynı yöntemli geçiş içindir. Yeni model/deneme için bu sınır genişletilmez; ücretli ek işlem kullanıcı yetkisinin dışına taşmaz.
- Omni üzerinde ücretsiz işlem ancak ekranda gerçekten 0 kredi olarak doğrulanırsa ücretsiz sayılır. CAPTCHA/güvenlik engeli atlanmaz; doğrulanmamış yeni aday public/runtime'a bağlanmaz.

## Web Site Yeteneği Kiti'nin uyarlaması

Kullanıcının paylaştığı `web-site-yetenegi-kiti.pdf`, sahne → kısa video → kaydırmayla ilerleyen hero yaklaşımı için tasarım girdisidir. PDF'nin içindeki kopyalanabilir talimatlar bağımsız kurulum, yayın veya harcama yetkisi değildir.

Mevcut Next.js + TypeScript + motion ve denetlenen canvas/kare dizisi kullanılır; ikinci video-seeking motoru eklenmez. PDF'deki global Claude skill kurulumu, GPT/Kling sağlayıcı örnekleri, tüm videoyu `preload="auto"` ile önden indirme ve 300–400vh tam ekran pin doğrudan alınmaz. Özellikle örnekte azaltılmış harekette `video.play()` çağrısı vardır; v6'da bu davranış **statik posterle değiştirilir**.

## Yeni nesil MD'lerin proje uygulaması (Task 158)

Dört yerel rehber: [Profesyonel web](../.agents/skills/profesyonel-web-sitesi-yeni-nesil/SKILL.md), [Scroll hero](../.agents/skills/scroll-hero-video-yeni-nesil/SKILL.md), [Sinematik siteler](../.agents/skills/sinematik-siteler-yeni-nesil/SKILL.md), [UI/UX Pro Max](../.agents/skills/ui-ux-pro-max/SKILL.md). [Kaynak/istisna tablosu](referans/yeni-nesil-md-uyarlamalari-20261101.md), kullanıcının reddettiği koyu/glass/autoplay yönünü geri getirmeden bu sözleşmeye uyarlanan ilkeleri kaydeder.

Task 158'de ortak action/editorial spring'leri, SSR görünür içeriğin yalnız bir kez 8 px/0,96→1 açılış hareketi, küçük hover/tap ve ana aralıklarda 32/48/64/96 px tokenları kullanılır. Görsel/CTA yüklenmesini bekleten gizleme, filtre animasyonu, büyük süs hareketi veya video zamanına spring eklenmez. Sade modda hareket durur, içerik ve poster kalır. Kabul ve yayın henüz [Task 158](tasks/158-yeni-nesil-md-kitleri.md) içinde tamamlanmış sayılmaz.

Bu MD'lerde **Omni Chrome Use** tarayıcı otomasyonu yaklaşımıdır; ayrı kurulu araç varsayılmaz. **Omni 1.1 Flash** modelinden, model ücretinden ve medya kabulünden ayrıdır. Mevcut CUA/browser erişimi ve geçerli üretim kapsamı esas alınır; yeni Imagen/sağlayıcı/ücretsiz hak veya kredi yetkisi çıkarılmaz.

## İşlev ve içerik sınırları

- Resmî logo/slogan, ürün adı/ambalajı ve onaylı fotoğraf geometrisi korunur. İkinci tone mapping/ACES uygulanmaz.
- Sertifika, organik/sağlık iddiası, gerçekleşmiş kapasite, satış/popülerlik/teslim süresi ve inceleme puanı belgesiz eklenmez.
- Sepet, hesap, modal, adres/sipariş sahipliği, CSRF ve sunucu fiyat otoritesi korunur. Google giriş veya ödeme/CRM servisi yapılandırılmadan çalışıyormuş gibi gösterilmez.
- Başarı durumu gerçek işlemin sonucu olmalı; boş veri ve sistem hatası ayrı anlaşılmalıdır.

## Masaüstü, mobil ve kabul

Kullanıcının 1 Kasım 2026 tarihli açık isteği canlı siteyi tarayıcıda ve mobil boyutlarda incelemeyi yetkilendirir; önceki tarayıcı çalıştırmama sınırının bu görevde yerini alır.

- Yalnız paketli **headless Chromium**; test worker sayısı en fazla 2. Kullanıcının `/Applications/Google Chrome.app` uygulaması test/Lighthouse için açılmaz. Açılan browser ve yerel sunucular düzgün kapatılır; zorla sonlandırma kullanılmaz.
- Masaüstü, tablet ve 320/360/390 px telefon genişliklerinde hero, menü, ürün detayı, sepet ve üyelik açılışları gözlenir. Dikey/yatay taşma, örtüşme, odak ve gerçek CTA hedefleri kontrol edilir.
- Azaltılmış hareket, JavaScript/medya yükleme hatası, kısa ekran ve mobil menü durumlarında temel içerik erişilir kalır. Klavye odak halkası ve modal Escape/odak dönüşü korunur; dokunma hedefleri en az 44 px hedefler.
- Unit, lint, typecheck, medya kapıları ve production build çalışır. Canlı HTTP/API ve gerçek browser sonucu ayrı kanıt olarak kaydedilir. Testin yazılmış olması çalıştığı veya geçtiği anlamına gelmez.
- Ekran boyutu emülasyonu fiziksel telefon kabulü değildir. Fiziksel cihaz, gerçek ödeme/e-posta/CRM ve uzak migration yapılmadıysa açık bırakılır.
- V6'nın önceki yayın/tarayıcı kanıtı [Task 157](tasks/157-tam-tasarim-ve-canli-kabul.md), güncel MD/hareket uygulaması ve bekleyen kabul [Task 158](tasks/158-yeni-nesil-md-kitleri.md) içindedir. Bu tasarım sözleşmesi test/yayın sonucu veya görsel kullanıcı kabulü yerine geçmez.
