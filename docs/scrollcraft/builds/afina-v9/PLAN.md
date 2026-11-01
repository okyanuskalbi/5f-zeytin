# V9 — skor ve kabul sözleşmesi

## Gramer ve fingerprint
Gallery/catalog grameri, üretici/tesis/kanal argümanıyla sınırlıdır. Filmic one-shot ve continuous-world onaysız medya zinciri gerektirir; chaptered-editorial uzun okuma önceliklidir; live-surface sahte yazılım olur; typographic-poster gerçek medyayı siler; split-stage reddedilen yarı bölünmüş hero'yu tekrarlar; rhythmic-cutlist sakin üreticiye fazla hızlıdır. Tek doğal hero → tek yatay raf → gerçek üretim → kullanıcı talep bağlamı grameridir.
Yasaklar: ikinci pin/scrub, body/wheel/touch kilidi, GSAP/Lenis/yabancı rAF motoru, yeni ürün/fiyat/stock sırası, demo logoları/testimonials/kapasite, boş showroom, kaynakta geçen rastgele500ml/5kgplastik ürün, hatalıD→F etiketi.
V6/V7'ye planlanan fark en az4/6: grammar, glass-nav, hero device, act shape, signature. V8'e5/6: gallery grammar, glass-nav, full-film hero/near-branch, gallery-firstactshape, gerçek SKU→talep handoff signature; kapanışın gerçek adres/legal kökü ortak kalır. Son pikseller/işlev doğrulamadan registry satırı eklenmez.

## Bölüm/kaynak/hareket
| Semantik bölüm | 21st gerçek kaynak | Baskın cihaz ve sınır |
|---|---|---|
| Hero + nav |32829Elsewhere +26786Elevate Navbar| Lokal okunurluk, SSR görünür HTML; Motion line stagger/parallax1→1.1, gerçek bağımsız onaylı ön-dal. Sahte ses/gece/stockvideo/GSAP yok.15025 generic-counter çıktısı reddedildi. |
| Galeri |24623motiondotdev Scroll Horizontal Gallery + mevcut gerçek ProductCard| Lineer x=−overflow×p, spring yok, ResizeObserver; tek bounded sticky, altı SKU+actualfocus+sepet/detail. |
| Tesis |20023Parallax Image| Gerçek büyük fotoğraf overscan/y0→120 ve kısa sticky içerik; gerçek yer/adres. |
| Hikâye |1197Aceternity Bento| Üç kaynaklı aşama, kırık simetri; görünürSSR, bir kez transform/opacity reveal. |
| B2B |7262prebuiltui Pricing Cards| Üç plan fiyatı yerine gerçek segment seçimi; seçim talep formuna işlenir.7091globalCSS/sonsuzcanvasreddedildi. |
| Teklif |35258Contact Form| Gerçek alan/validasyon/ürün-segment bağlamı, AnimatePresence özet; gönderim e-posta uygulamasında, doğrulanmamışWhatsApp yok. B2B'yle aynı doğal karar vuruşu; gereksiz pin yok. |
| FAQ/contact/footer |31986FAQ Accordion Section +21474Agency Footer| Mevcut5cevap/schema/nativekeyboard; somut kurumsal iletişim ve ürünlere dönüş kapanışı. |

Scroll Craft engine kaynakları build altında byte-identical reference olarak korunur; Next/Motion mevcut sürücüdür, iki scroll sahibi eklenmez. Hersectiondata-sc-scene/device/source ile skor görünür ve gerçek transform/etkileşimle doğrulanır. En az4aile: kinetic/pan/parallax/reveal/flow. Tek pan scrub; ardışık aynı baskın aile yok, B2B/form tek flow vuruşudur. Mobilde native yatay overflow veya stack, reduced/noJS hiçbir uzun pin/boş height bırakmaz.

## Ana ölçümler
Desktop: rail travel=max(0,scrollWidth−viewportWidth), actualx≈−travel×p (2px tolerans), p0/.25/.5/.75/1; lastcardgörünür, ResizeObserveryeniler; tabfocus gizli karta geldiğinde verticalprogressaynıcard'ıgörünür yapar. Mobile/reduced/noJS altıSKU erişilir, ilk360×640H1+primaryCTA görünür; sayfada x-overflow0.
Her7bölüm için actual21stID/adaptationpath kaydı,6scrollphasepikselleri, okunabilirlik/kontrast, keyboard/details/nav/cart/üyelik/quotevalidasyon/URIhatası; private/no real mail/customer/order writes. Açılış loop5sn/120frame/sessiz/faststart/<8MB, seam ve görünüm dışı pause; reduced/saveData isteksizposter. Yeni ücretli üretim0.
1200baselineunit yerine sonkaynağın gerçek test sayısı yazılır. Unit/lint/type/build/medyagates, headlessChromium≤2gracefulclose; source21streview; gerektiğinde2workerLighthouseyalnızbundledheadlessbinary. Son kaynak API production sonrası aynı domain/mobile/HTTP/hash/etkileşim kabulü. Fiziksel telefon, e-postanın alıcıya teslimi ve WhatsApp servis aktivasyonu test edilmiş sayılmaz.
