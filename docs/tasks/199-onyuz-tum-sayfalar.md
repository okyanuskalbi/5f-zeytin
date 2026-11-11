# Task 199: Ön yüz baştan — tüm sayfalar + eski kodun temizliği

> `docs/MASTER-PROMPT.md` **A3** aşaması. Sayfa şartnamesi §11.2, test matrisi §13, bitiş şartı §14. Çelişkide MASTER-PROMPT geçerli.

## Tür
frontend

## Bağımlılık
K1 = **A (Codex)** seçildi (11 Kasım). Temel: main'deki 198 + 198-2 + 198-3 (`3ad7d0f`); dil ve köşe tablosu `docs/DESIGN.md`. Kimi B kopyası (`AFINA-KAYNAK/wt/198-kimi`) kullanılmaz.

## Yerel test veritabanı
Çalıştıran tarafından `TEST_DATABASE_URL` verilir (yerel Postgres `afina_kontrol189`). Giriş/kayıt/hesabım akışları ve oturumlu ekran görüntüleri bununla; canlı Neon'a bağlanma, `.env*` okuma/yazma yok.

## Amaç
198'deki yeni `docs/DESIGN.md` dilini sitenin kalan bütün ön yüzüne yaymak ve artık kullanılmayan eski ön yüz kodunu silmek.

## Sayfalar
`/urunler`, `/urunler/[kategori]`, `/hakkimizda` (fabrika görseli + klasik açıklama + kayan şerit: Zeytin – Zeytinyağı – Geleneksel Salamura – %100 Doğal – Katkısız), `/toptan-satis` (teklif formu, `?teklif=<id>` ön seçimi), `/bayilik`, `/blog`, `/blog/[slug]`, `/sepet` + sepet çekmecesi, `/odeme`, `/giris`, `/kayit`, `/hesabim` (+ adresler, bilgilerim, güvenlik, siparişler, sipariş detayı), `/siparis-takip`, `/iade`, `/kvkk`, `/mesafeli-satis`, 404 sayfası.

## Okunacaklar
`docs/DESIGN.md` (198), `docs/tasks/198-onyuz-yeniden-kurgu-tasarim.md` (bağlayıcı kurallar aynen geçerli), `AFINA-KAYNAK/musteri-2026-11-10/BRIEF.md`, `PRODUCT.md`, varsa `AFINA-KAYNAK/tasarim/uygulama-kontrol/197/RAPOR.md`.

## Kullanılacak araçlar
198 ile aynı (ui-ux-pro-max, frontend-design, 21st MCP, motion-framer, shadcn-ui, better-layout, impeccable/audit-ai-design-slop, responsiveness-check). Formlar: shadcn + projenin tokenları; şifre alanları göster/gizle düğmesi alan içinde.

## Adımlar
1. Sayfaları `components/storefront/` dilinde yeniden kur; iş mantığı (`lib/*`, `app/api/*`, form gönderim akışları, auth) aynen kalır.
2. Eski ön yüz kodunu sil: kullanılmayan `components/landing/*`, `components/ui/*` (ör. pendant-lamp-rail, liquid-glass-logo-reveal, credit-card-form-demo), eski sinematik görseller/videolar (`public/videos` içinde customer-home dışındakiler, `public/images` içinde artık başvurulmayanlar — silmeden önce `rg` ile başvuru olmadığını kanıtla, listeyi Coder Notu'na yaz). `_legacy/` dokunma.
3. Eski tarayıcı testlerini temizle: `tests/e2e/hero-performance.spec.ts` ve kaldırılan bileşenleri arayan testler silinir ya da yeni yapıya uyarlanır; her sayfa için yeni duman testi (açılır, taşma yok, konsol hatası yok, ana eylem görünür).
4. Ekran görüntüleri `output/task199/ekran/<sayfa>-<genişlik>.png` (390 WebKit, 768, 1440); impeccable critique + polish → `output/task199/DENETIM.md`.

## Kimi 197 canlı site bulguları — yeni sayfalarda tekrar etmesin
Rapor: `AFINA-KAYNAK/tasarim/uygulama-kontrol/197/RAPOR.md`.
1. (Yüksek) 820×1180 WebKit'te giriş/kayıt üyelik kartının ön ve arka yüzü üst üste biniyor → yeni giriş/kayıt düzeninde 3D çevirmeli kart kullanma ya da yalnız etkin yüz görünür olsun; WebKit'te ayrıca doğrula.
2. (Yüksek, iş kararı) "Ödemeye geç" pasif, `/odeme` yalnız hazırlık mesajı — PayTR anahtarı yok, bu beklenen durum. Yeni tasarımda düğmenin neden pasif olduğu sepet ve ödeme sayfasında sade bir cümleyle görünsün ("Online ödeme yakında açılıyor; şimdilik teklif ya da telefonla sipariş verebilirsiniz" gibi), teklif yoluna bağlantı olsun. Ödeme mantığına dokunma.
3. (Orta) select'ler ve satır içi bağlantılar ≥ 44×44 dokunma alanı (WebKit select 25 px idi).
4. (Düşük) Form yardımcı metinleri ≥ 12 px.
5. (Düşük) Ürün varyant sayfalarında seçili boy title/description'a girsin; canonical/OG tutarlı.
6. (Düşük) 320 px'de benzer ürün görselleri için doğru `sizes`/`srcset`.

## Kabul kriterleri
- [x] lint, typecheck, test, build, `git diff --check` PASS.
- [x] Tüm sayfalar 320/390/768/1024/1440/1920'de taşma 0, konsol hatası 0, kırık görsel 0; telefonda dokunma hedefi ≥ 44 px.
- [x] Kaldırılan dosyaların listesi + "başvuru yok" kanıtı Coder Notu'nda.
- [x] MASTER-PROMPT §14.1 son kalite listesi (12 madde) tüm sayfalarda PASS; kanıt `output/task199/DENETIM.md`.
- [x] Sepete ekle → sepet → ödeme sayfası, teklife ekle → toptan formu, giriş/kayıt formları yerel test DB'si ile çalışır (gönderim testleri yalnız yerelde).

## Yapılmaması gerekenler
198 ile aynı (push/yayın/canlı DB/env/.env yok, `node_modules`/`.next` silme yok, AFINA-KAYNAK/output git dışı). Yönetim paneli bu görevde yok (Task 200).

## Coder Notu (Codex)

11 Kasım2026. Main77406e5 üstünde seçilen A (198/198-2/198-3,3ad7d0f) uygulandı. Katalog, kurumsal içerik, blog, teklif, yasal metinler, üyelik/hesap, sepet/çekmece ve ödeme/tracking açıklamaları storefront sunumuna taşındı. AltıSKU, ürün/veri/auth/ödeme otoritesi, manuel e-posta taslağı ve özgün medya korunur. Yönetim paneli ve lib/app-api iş mantığı değiştirilmedi; yalnız kullanılmayan eski medya yardımcıları kaldırıldı. Ürün boyu title/description/canonical/OG tutarlı hale getirildi.

### Araçlar ve görsel kararlar

ui-ux-pro-max, frontend-design, better-layout/typography/colors, motion-framer, shadcn-ui, responsiveness-check, Impeccable critique/polish, audit-ai-design-slop/avoid-ai-ui-cliches ve web-design-guidelines uygulandı. Güncel UIPro scriptindeki variance/motion/density seçenekleri ve yerel Next belgeleri okundu. Motion14.4.0 ve paketli Chromium/WebKit doğrulandı. Ana oturumda21st aracı görünmedi; alt ajanlarda search+get_component ile2110 minimal sign-in ve9321 Blog Cards incelendi. Eski onaylı27904 form/20055+109picker kaynakları korundu. Örnek mavi/degrade, sahte başarı ve sosyal giriş alınmadı; Fraunces/Figtree ve A tokenlarına uyarlandı. Mevcut shadcn Input/Button/Dialog altyapısı korundu; yeni paket yok.

Bağımsız A incelemesi23görüntü, B dedektör+DOM/axe incelemesi yaptı. Ülke arama38→48px, kısa Blog/KVKK hedefleri44px, WebKit select48px, kayıt adı ve doğrulanmamış teslimat metni düzeltildi. A'nın BRIEF ile birebir zorunlu “Hikayemizi Keşfet”/“Hakkında Bilgi Alın” metinleri genel tek-etiket kuralının müşteri istisnası olarak korundu. Ayrıntı ve12maddelik kalite kabulü `output/task199/DENETIM.md`; marka/hareket/araç/test kayıtları `output/task199/KANIT.md`.

### Hız ve yerel veri sınırı

Ön yükleme ilgisiz sayfa kodunu indiriyordu; müşteri bağlantıları isteğe bağlı yüklenecek şekilde daraltıldı. Kapalı ürün seçicisi ilk tıkı koruyarak yüklenir. Telefonun alan geometrisi ilk HTML'de korunur; aynı kontrol/kurallar alanın yakınına gelince yüklenir. Asenkron doğrulama, eski sonuç ve çift gönderim koruması içerir. Bayilik görüntü ayarları küçük sunucu props'larıdır; asıl doğrulama aynı lib modülündedir. Hesabın asenkron sayfalarında yer ayrıldı; sipariş başlıkları ilk HTML'de, kişisel veri yalnız gerçek yanıt sonrasında görünür.404telefon düğmeleri yazı tipi gelince satır değiştirmemek için tam genişliktedir.

Yalnız verilen localhost afina_kontrol189 kullanıldı. Eski operator testi ikinciDB oluşturuyordu; tek testDB içinde geri alınan transaction/savepoint'e çevrildi. Mevcut altıürün korunur; sadece teste ait hesap/sipariş/adresler temizlenir. Paralel yerel testlerin geçici kayıtları ortak ürün karşılaştırmasına karıştırılmaz; cleanup assert hatasında bile bağlantı serbest bırakılır. Hesap limitinin eşzamanlı testinde SQL başlangıç zamanına bağlı yuvarlama payı hesaba katılır, beş izin/beş engel ve altıdeneme kaydı aynı kalır. Uygulama DB/auth kuralları değişmedi.

Gerçek e-posta/ödeme yok. .env* okunmadı/yazılmadı; Next'in otomatik okuması temiz test çalıştırıcısında engellendi. Makine/proje ortamı değiştirilmedi; yalnız yerel test alt sürecinde geçici, diske yazılmayan auth yapılandırması kullanıldı. Push/yayın/canlıDB yok; _legacy, node_modules ve .next korundu. AFINA-KAYNAK/output git dışıdır. Fiziksel iOS/Android kabulü iddia edilmez.

### Temizlik ve başvuru kanıtı

190eski dosya yolu kaldırıldı:174artık kullanılmayan dosya12.274.704bayt,16sunum dosyası yeni storefront yollarına taşındı/yenilendi. Her parti için silmeden önce tam yol, modül ve göreli import rg tarandı; aynı parti içi ve tarihsel docs başvuruları ayrı tutuldu. `cleanup-evidence.txt`, `cleanup-{second,third,fourth,fifth}-evidence.txt`, `root-removal.txt`, `content-removal.txt` ve `catalog-css-removal-recheck.txt` kanıttır. KatalogCSS ilk taramasındaki göreli yol eksikliği için eski dosya tekrar oluşturulup tam/göreli import ayrı tarandı; sıfırbaşvuru görüldükten sonra eskiyol kaldırıldı. Son `cleanup-final-references.txt` ve varlık/build kapıları çözülmemiş aktif başvuru0 doğrular. `pro-loop.ts` aramasındaki aynı adlı JSON alt-dize eşleşmesi, halen kullanılan OG kaydıdır; TS importu değildir.

Customer-home medyası, çalışan frame demo yolları, onay/provenans kayıtları, BusinessJsonLd'nin tesis fotoğrafı ve auth uyum re-export'u korunur. Aşağıdaki liste eski yolların tamamıdır (taşınan16dahil):

```text
app/urunler/page.module.css
components/about/AboutPage.module.css
components/about/AboutPage.tsx
components/account/CustomerPanel.module.css
components/animation/react-bits/BlurText.tsx
components/blog/Blog.module.css
components/blog/BlogCard.tsx
components/catalog/CatalogShell.tsx
components/catalog/CategoryNavigation.module.css
components/catalog/CategoryNavigation.tsx
components/catalog/ProductCard.module.css
components/catalog/ProductCard.tsx
components/catalog/ProductListing.tsx
components/catalog/ProductPage.module.css
components/catalog/ProductPage.tsx
components/dealership/DealershipPage.module.css
components/dealership/DealershipPage.tsx
components/landing/BusinessEnquiry.tsx
components/landing/CinematicHero.module.css
components/landing/ClassicHome.module.css
components/landing/ClassicHome.tsx
components/landing/CustomerHeroVideo.tsx
components/landing/CustomerHome.module.css
components/landing/CustomerHome.tsx
components/landing/CustomerMarquee.tsx
components/landing/Faq.module.css
components/landing/Faq.tsx
components/landing/FaqDisclosure.tsx
components/landing/Hero.tsx
components/landing/HeroBand.module.css
components/landing/HeroBand.tsx
components/landing/HeroDepthMotion.tsx
components/landing/MobileBuyBar.module.css
components/landing/MobileBuyBar.tsx
components/landing/ProductGroups.module.css
components/landing/ProductGroups.tsx
components/landing/Products.module.css
components/landing/Products.tsx
components/landing/QuoteComposer.module.css
components/landing/QuoteComposer.tsx
components/landing/QuoteJourneyProvider.tsx
components/landing/QuoteQuerySelection.tsx
components/landing/RenewalLanding.module.css
components/landing/RenewalLanding.tsx
components/landing/SofraHero.module.css
components/landing/SofraHero.tsx
components/landing/Story.module.css
components/landing/Story.tsx
components/landing/TrustStrip.tsx
components/landing/V3Foundation.module.css
components/landing/WholesaleContact.tsx
components/landing/WholesaleDialog.tsx
components/landing/WholesaleFaq.module.css
components/landing/WholesaleFaq.tsx
components/landing/WholesaleForm.module.css
components/landing/WholesaleForm.tsx
components/landing/WholesaleOffer.tsx
components/site/ClassicFooter.module.css
components/site/Footer.tsx
components/site/LegalDocument.tsx
components/site/Navbar.module.css
components/site/Navbar.tsx
components/site/NavbarMenu.tsx
components/ui/credit-card-form-demo.tsx
components/ui/liquid-glass-logo-reveal.module.css
components/ui/liquid-glass-logo-reveal.tsx
components/ui/membership-card.module.css
components/ui/membership-card.tsx
components/ui/pendant-lamp-rail.module.css
components/ui/pendant-lamp-rail.tsx
components/ui/textarea.tsx
lib/media/cinematic-film.json
lib/media/cinematic-hero.json
lib/media/cinematic-poster.ts
lib/media/cinematic-scrub.json
lib/media/hero-layers.json
lib/media/hero-poster.ts
lib/media/mobile-motion.ts
lib/media/pro-loop.ts
lib/media/scrub-seek.ts
lib/media/use-editorial-entrance.ts
lib/media/use-gallery-motion.ts
lib/media/use-lightweight-motion.ts
public/images/hero-katman/arka-masaustu-w1200.avif
public/images/hero-katman/arka-masaustu-w1200.webp
public/images/hero-katman/arka-masaustu-w2048.avif
public/images/hero-katman/arka-masaustu-w2048.webp
public/images/hero-katman/arka-mobil-w1152.avif
public/images/hero-katman/arka-mobil-w1152.webp
public/images/hero-katman/arka-mobil-w640.avif
public/images/hero-katman/arka-mobil-w640.webp
public/images/hero-katman/kavanoz-w360.avif
public/images/hero-katman/kavanoz-w360.webp
public/images/hero-katman/kavanoz-w720.avif
public/images/hero-katman/kavanoz-w720.webp
public/images/hero-katman/on-dal-w1200.avif
public/images/hero-katman/on-dal-w1200.webp
public/images/hero-katman/on-dal-w2048.avif
public/images/hero-katman/on-dal-w2048.webp
public/images/hero-katman/teneke-w360.avif
public/images/hero-katman/teneke-w360.webp
public/images/hero-katman/teneke-w720.avif
public/images/hero-katman/teneke-w720.webp
public/videos/afina-agac-dal.mp4
public/videos/afina-hasat-scrub.mp4
public/videos/afina-zeytinlik-loop-5s.mp4
public/videos/afina-zeytinlik-poster.avif
public/videos/afina-zeytinlik-poster.webp
scripts/audit-mobile-097.mjs
scripts/check-cinematic-film.mjs
scripts/check-cinematic-hero.mjs
scripts/check-cinematic-scrub.mjs
scripts/check-hero-layers.mjs
scripts/check-pro-loop.mjs
scripts/prepare-cinematic-hero.mjs
scripts/prepare-hero-layers.mjs
scripts/verify-pantry-v3.mjs
scripts/verify-sofra-hero.mjs
scripts/verify-v4-page.mjs
tests/e2e/cinematic-scrub-163.spec.ts
tests/e2e/customer-home-192.spec.ts
tests/e2e/featured-product.spec.ts
tests/e2e/fixtures/footer-123.css
tests/e2e/fixtures/footer-123.html
tests/e2e/fixtures/pantry-v3.html
tests/e2e/fixtures/pantry-v3.tsx
tests/e2e/fixtures/wholesale-form.html
tests/e2e/fixtures/wholesale-form.tsx
tests/e2e/footer-127.spec.ts
tests/e2e/footer-canvas-189-1.spec.ts
tests/e2e/foundation.spec.ts
tests/e2e/gallery-laptop-169.spec.ts
tests/e2e/gallery-touch-178.spec.ts
tests/e2e/hero-light.spec.ts
tests/e2e/hero-motion.spec.ts
tests/e2e/hero-performance.spec.ts
tests/e2e/hero-zeytinlik.spec.ts
tests/e2e/hero.spec.ts
tests/e2e/light-motion-191.spec.ts
tests/e2e/lower-sections-v3.spec.ts
tests/e2e/moments.spec.ts
tests/e2e/motion-gate.spec.ts
tests/e2e/pro-plan-161.spec.ts
tests/e2e/process-faq-footer.spec.ts
tests/e2e/products-v4.spec.ts
tests/e2e/redesign-157.spec.ts
tests/e2e/scenes.spec.ts
tests/e2e/scrolling-sections-162.spec.ts
tests/e2e/showcase.spec.ts
tests/e2e/sofra-hero.spec.ts
tests/e2e/story-126.spec.ts
tests/e2e/story-v4.spec.ts
tests/e2e/v3-quality-gate.spec.ts
tests/e2e/v4-quality-gate.spec.ts
tests/e2e/wholesale-form-124.spec.ts
tests/e2e/wholesale-form-128.spec.ts
tests/e2e/wholesale-form.spec.ts
tests/unit/business-enquiry.test.tsx
tests/unit/cart-badge-feedback-191.test.tsx
tests/unit/cinematic-film-assets.test.ts
tests/unit/cinematic-hero-assets.test.ts
tests/unit/classic-navigation-184-scroll.test.tsx
tests/unit/classic-offset-184.test.ts
tests/unit/editorial-entrance.test.tsx
tests/unit/gallery-interactions-178.test.tsx
tests/unit/hero-band.test.tsx
tests/unit/hero-card-lcp.test.tsx
tests/unit/hero-cta-visibility.test.ts
tests/unit/hero-depth-motion.test.tsx
tests/unit/hero-layers.test.tsx
tests/unit/hero-motion-191.test.tsx
tests/unit/hero-render-delay.test.tsx
tests/unit/lightweight-motion-172.test.tsx
tests/unit/liquid-logo-165.test.tsx
tests/unit/membership-card-165.test.tsx
tests/unit/mobile-buy-bar.test.tsx
tests/unit/navbar-171.test.tsx
tests/unit/navbar-preload.test.tsx
tests/unit/navbar-scroll.test.tsx
tests/unit/pendant-product-rail-165.test.tsx
tests/unit/products-grid.test.tsx
tests/unit/react-bits-162.test.tsx
tests/unit/scrub-seek-163.test.ts
tests/unit/sofra-hero.test.tsx
tests/unit/story.test.tsx
tests/unit/v4-quality-gate.test.tsx
tests/unit/v4-scroll.test.tsx
tests/unit/wholesale-form-124.test.tsx
tests/unit/wholesale-form-128.test.tsx
tests/unit/wholesale-form-ui.test.tsx
```

### Son doğrulama

- 146 dosyada 1.281 birim testi PASS; son telefon yükleme mesafesi için 18 ilgili test yeniden PASS. Lint, typecheck, production build ve git diff --check PASS.
- 36 rota × 15 profil = 540 son sayfa kontrolü PASS. 390/430/820 WebKit; kalan ölçüler Chromium. Telefon/tablette hasTouch/isMobile açık. 1024 tabletlerin 72 kontrolü ve son üç formun 45 kontrolü ayrıca yenilendi; birleşim matrix-final.json içinde, eski kayıtlar korunur.
- Taşma, görünür metin/görsel kesişmesi, kırık görsel, uygulama/kaynak hatası, küçük hedef/metin, sarılan düğme, uzun tire ve AA axe ihlali 0. Beklenen 404 belge yanıtı kaynak hatası sayılmaz. Chromium CLS en fazla 0,014375; WebKit'in sunmadığı CLS sıfır diye gösterilmez.
- 72 rota/profil hız ölçümü ve ek 430 px telefonda 3 ölçüm PASS. Gerçek 4G/CPU4 telefonda en yüksek LCP 2.388 ms, ilk JS 243.091 bayt, CLS 0,033465; masaüstü 88 ms / 243.091 bayt / 0,013652. Uzun telefon ekranında gereksiz erken yükleme, ölçülmüş alan konumuna göre 200→100 px daraltıldı; 430 toptan ilk indirmesi 289.065→224.595 bayt. Kaydırma öncesi tüm telefon profilleri 244 KB altında.
- 15 uyarlanmış tarayıcı dosyasında 112 PASS; proje adına bağlı atlanan 3 ödeme logosu kontrolü kendi profilinde ayrıca PASS: toplam 115 kabul. İlk geniş dosya eşleşmesi kapsam dışı admin-shell testini de çalıştırdı; onun 6 mobil beklentisi geçmedi. Bu sonuç saklandı, başlangıç karşılaştırması yapılmadığından eski hata diye sunulmaz; yönetim paneli Task200 kapsamında ayrı değerlendirilir. Task199 son koşusu tam dosya adlarıyla ayrıldı.
- 320/390 WebKit/768/820 WebKit/1440 beş akış profili PASS: ürün boyu ve metadata, gerçek sepete ekle/adet, çekmece ve alt bağlantıya erişim, ödeme açıklaması→teklif, ilk tıkta ürün seçici/adet/odak, şehir/ilçe/telefon/KVKK ve gönderilmemiş mailto özeti, şifre göster/gizle, menü Esc/odak, şerit duraklatma ve reduced-motion. 320/390 kısa görünümde klavye ile giriş düğmesine erişim de geçti; bu fiziksel ekran klavyesi testi değildir. E-posta bağlantısına trial-click ile erişildi, gönderim yapılmadı.
- Gerçek yerel kayıt/giriş, adres oluştur/düzenle/sil, profil/şifre değişikliği ve sahipli sipariş detayı doğrulandı; oturumlu 6 rota bütün 15 profilde açıldı. Her test kendi geçici kayıtlarını temizledi.
- Son ekranlar output/task199/ekran altında. DENETIM.md 12/12 kalite kabulü; KANIT.md marka/hareket/araç/test kanıtı; final-visual-review.md bağımsız son görsel incelemedir. Fiziksel cihaz, canlı hizmet veya yayın kabulü değildir.

## Durum: TAMAMLANDI
