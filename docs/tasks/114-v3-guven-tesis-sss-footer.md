# Task 114: Güven şeridi, tesis + toptan, SSS, footer

## Tür
frontend

## Amaç
Taslak B'nin alt bölümleri:
- sofra beyazı güven şeridi;
- gerçek tesis fotoğraflı "Osmaniye'de, kendi tesisimizde." bloğu ve toptan iletişim satırı;
- yalnız tam cümleli SSS;
- kiler yeşili footer ve tek önizleme notu.

## Bağlam
- Bağımlılık: 111–113 TAMAMLANDI.
- Oku: `docs/DESIGN.md` v3 bölüm 3–6; `mix-b.webp` alt bölüm.
- Tesis görseli `docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg`. Kullanıcı yayın onayı 21 Eki'de verildi. Optimize kopya `public/images/v3/`'e alınır; plaka okunur hâle gelmeyecek, kırpma ve keskinleştirme yok.
- Toptan formunun gönderimi yok (backend onay bekliyor).
- Satıcı bilgisi: `~/PROJELER/AFINA-KAYNAK/sirket/SIRKET.md` içindeki kamuya açık alanlar. Matrah, vergi tutarı ve PDF ASLA kullanılmaz.

## Kullanılacak araçlar
- Skill: `impeccable` (craft-floor, `clarify`), `better-writing` (SSS ve UX metni), `better-layout`, `landing-page-design` (güven ögeleri).
- ECC: frontend-patterns, accessibility, e2e-testing, seo.
- 21st MCP: "trust badges strip", "split feature image" ara; uyarla.

## Adımlar
1. **Güven şeridi:**
   - 3 öğe: "Kargo 2–4 iş günü" (örnek, açık karar), "PayTR ile güvenli ödeme", "Kendi tesisimizde dolum".
   - İnce zeytin yeşili çizgi ikonlar (kutusuz). Arada ince ayırıcı.
2. **Tesis bloğu:**
   - Solda başlık "Osmaniye'de, kendi tesisimizde." ve 2 satır metin: Ellek · Düziçi · 2021'den bu yana · sofralık zeytin, salamura ve zeytinyağı; perakende ve toptan.
   - Sağda tesis fotoğrafı (cover, 4:3 masaüstü, 16:10 telefon).
3. **Toptan (`#toptan`):**
   - Form gönderimi yokken çalışmayan form GÖSTERME.
   - Yerine "Toptan alım için bize yazın" başlığı ve iletişim düğmeleri: telefon, WhatsApp, e-posta.
   - Değerler `lib/site/contact.ts` içinde **boş** yer tutucu olarak tanımlanır. Boşken düğmeler render edilmez; yerine "İletişim bilgileri yakında" yazar.
   - Mevcut form kodu korunur, gizlenir. Backend gelince açılacak.
4. **SSS:**
   - Yalnız `docs/teyit` ve resmi metinlerden tam, kendi içinde anlamlı cevaplar. Yarım cümleli cevabı olan soru kaldırılır.
   - En fazla 6 soru. Akordeon (klavye erişilir, `aria-expanded`).
5. **Footer:**
   - Kiler yeşili zemin, logo, linkler, satıcı bilgisi satırı (unvan · Düziçi VD · VKN), yasal linkler, Topluluk logosu → afina.com.tr.
   - Tek satır "Önizleme: fiyatlar ve görseller temsilidir."
6. **SEO:**
   - `Organization` + `LocalBusiness` (adres, VKN yok) JSON-LD.
   - Product JSON-LD yalnız gerçek fiyat gelince eklenir; şimdi yok.

## Kabul kriterleri
- [ ] Sayfada "henüz kullanıma açık değil", "Gerçek satış kataloğu" gibi taslak yazısı yok. Önizleme notu tam 1 kez geçer (test).
- [ ] SSS cevaplarının her biri büyük harfle başlar, noktayla biter, ≥ 6 kelime (birim test).
- [ ] Tesis görselinde plaka okunur değil: kaynak bulanık dosya, SHA eşleşir.
- [ ] Kaydırma kare şeridi (masaüstü/iPhone/Pixel) `test-results/114/`; 120px tekerlek testiyle footer'a ulaşılır.
- [ ] Lighthouse mobil 3 ölçüm medyanı ≥ 85, A11y ≥ 95. inspect.mjs FAIL 0. Build, lint ve tüm e2e yeşil.

## Yapılmaması gerekenler
- İletişim bilgisi uydurma.
- Formu gerçek bir servise bağlama.
- Kargo firması adı yazma.

## Coder Notu

### Uygulama — 21 Ekim 2026
- Güven şeridi sofra beyazında üç kutusuz çizgi ikon ve ince ayırıcıyla kuruldu. Kargo metni görevdeki gibi “Kargo 2–4 iş günü”; açık karar olduğu için yanında “Örnek süre” görünür. Kargo firması belirtilmedi.
- Tesis bölümü Taslak B'ye göre solda kısa, teyitli konum/faaliyet metni, sağda gerçek fotoğraf kullanır. Görsel kutusu masaüstünde 4:3, telefonda 16:10 ve `cover`dır. Task 111'in `public/images/v3/tesis-osmaniye-*` AVIF/WebP kopyaları zaten hazır olduğundan tekrar üretilmedi; bulanık kaynak ve dört türevin SHA'ları doğrulandı. Kaynak/türev dosyaları, manifest ve onay kaydı değiştirilmedi; dosyada kırpma veya keskinleştirme uygulanmadı.
- `lib/site/contact.ts` telefon, WhatsApp ve e-posta için boş yer tutucular içerir. Boş kanallar render edilmez, “İletişim bilgileri yakında” gösterilir. Dolu kanalların bağlantıları ve boşluk temizliği birim testleriyle doğrulandı; runtime'a iletişim bilgisi eklenmedi. `#toptan` ve mevcut menü/bookmark hedefi `#toptan-iletisim` aynı iletişim satırına ulaşır. `WholesaleForm.tsx` ve enjekte servisli testleri korundu; landing'de mount edilmez, gönderim servisi eklenmedi.
- SSS'de resmi bölüm 04 ve kamuya açık şirket konumundan gelen üç tam cevap korundu. `docs/teyit/surec.md` içindeki kullanıcı teyidi bekleyen cümleler kullanılmadı. Native `details/summary` klavye ve JavaScript kapalı kullanımını korur; küçük istemci bileşeni gerçek `open` durumuyla `aria-expanded` değerini eşitler. JavaScript kapalıyken yanlış ARIA durumu sabitlenmez. Ek animasyon yoktur; reduced-motion'da içerik ve kontroller erişilir.
- Footer kiler yeşili/logo/yasal linkler/Topluluk bağlantısını ve tek önizleme notunu korur. Satıcı tam unvanı, adresi, Düziçi VD ve VKN yalnız `AFINA-KAYNAK/sirket/SIRKET.md` içindeki izinli kamuya açık alanlardan alınarak `lib/site/seller.ts` içinde tutuldu. Vergi PDF'si veya beyan tutarları okunmadı/kullanılmadı.
- Ana sayfada tek JSON-LD üreticisiyle ilişkili `Organization` + `LocalBusiness` grafı eklendi. Görevdeki “adres, VKN yok” sınırı gereği bu alanlar JSON-LD'ye taşınmadı. Gerçek fiyat gelmediğinden `Product`, `Offer`, fiyat, uydurma iletişim ve açılış saati yok. Next.js'in yerel JSON-LD rehberindeki `<` kaçışı uygulandı.
- İstenen impeccable (context/craft-floor/clarify), better-writing, better-layout, landing-page-design ve proje ECC frontend-patterns/accessibility/e2e-testing/seo rehberleri kullanıldı; TDD uygulandı, ek skill kurulmadı. 21st MCP'de `trust badges strip` ve `split feature image` arandı; **Split Feature Section 29418** kaynak kodu okunup fotoğraf/metin düzeni marka tokenlarına uyarlandı. Badge araması uygun kutusuz şerit vermediği için mevcut Lucide ikonları korundu. Yeni shadcn bileşeni/bağımlılık gerekmedi. Next.js 16.4.2'nin yerel server/client, image ve JSON-LD rehberleri okundu.
- Impeccable context kökte DESIGN.md aradığından onaylı `docs/DESIGN.md` doğrudan okundu. Bildirdiği eski `buildPath` kayıt eksikliği bu görevin onaylı B sözleşmesini değiştirmedi; config/plan değişikliği yapılmadı.

### Komutla doğrulama

| Kontrol | Gerçek sonuç |
|---|---|
| TDD RED → GREEN | `npm test -- tests/unit/v3-lower-sections.test.tsx --maxWorkers=2`: önce eksik kargo/#toptan/akordeon/schema için **5 FAIL, 2 PASS**; uygulama sonrası **7 PASS**. Sonrasında boş/dolu iletişim kanalları için dört test daha eklendi. |
| Tüm birim testleri / coverage | `npm test -- --coverage --maxWorkers=2`: **25 dosya / 286 test PASS**. Yapılandırılmış `app/**` kapsamı statements **%82,85**, branches **%86,11**, functions **%88,88**, lines **%87,93**; tüm mevcut eşikler geçti. Bu yüzdeler bileşen kapsamı iddiası değildir. |
| Metin kabulü | Birim testleri: önizleme notu landing+footer DOM'unda tam **1**; üç SSS cevabı büyük harfle başlar, noktayla biter, en az altı kelimedir. `rg -n 'henüz kullanıma açık değil\|Gerçek satış kataloğu' app components` sonucu boş. Önizleme metninin tek runtime kaynağı Footer.tsx. |
| Kaynak / varlık kabulü | `node scripts/check-v3-assets.mjs --require-sources`: **98 çıktı PASS**; özgün ONAY.md, sabit onay SHA'ları, kaynak/türev hash'leri, ölçü/alpha/oran/bütçe doğrulandı. Yeni birim testte bulanık tesis kaynağı ve dört çıktı SHA'sı eşleşir, `crop: null`. |
| Repo gizliliği | `git ls-files \| rg -i 'plaka\|\\.pdf$'`: yalnız `docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg`. Orijinal plakalı fotoğraf ve PDF eklenmedi. |
| Lint | `npm run lint`: **PASS**, sıfır uyarı. |
| Tipler | `npm run typecheck`: **PASS**; güncellenen/yeni e2e dosyaları da tip kontrolüne dahil. |
| Production build | `npm run build`: **PASS**, 16 rota. Ön kapılar **18 onaylı görsel + 98 v3 çıktı PASS**. |
| Impeccable / diff | `impeccable detect --json <değişen UI dosyaları>`: **[]**, tek mekanik tarama. `git diff --check`: **PASS**. |

### Claude doğrulayacak — tarayıcı kabulü
- AGENTS.md **“Tarayıcı testleri Claude'da”** kuralı gereği Playwright/e2e, Lighthouse, inspect.mjs, ekran görüntüsü ve kare şeridi bu oturumda **çalıştırılmadı**. Tarayıcı sonucu veya üretilmiş görsel kanıt iddia edilmez.
- Tesis/SSS/footer testleri v3'e uyarlandı: `facility.spec.ts`, `facility-wholesale-v2.spec.ts`, `faq-contact-footer.spec.ts`, `process-faq-footer.spec.ts`; eski adlar test komutlarının uyumu için korundu. Wholesale testinin landing senaryoları formun görünmemesini doğrular, enjekte servisli form fixture testleri korunur. Shell'in tesis bölgesi ve motion-gate'in toptan senaryosu güncellendi.
- `tests/e2e/lower-sections-v3.spec.ts` %40 adımlı kareler, `test-results/114/filmstrip-*.jpg` ve 120px adımlarla footer'a erişim kabulü için yazıldı. Claude, `--project=chromium-1440 --project=webkit-iphone14 --project=chromium-390 --workers=2` ile çalıştırabilir; son proje bu testte gerçek Pixel 7 emülasyonuyla açılır. Mobil WebKit wheel API yerine aynı 120px native scroll adımını kullanır. Açılan context `finally` ile kapanır.
- Claude: masaüstü/iPhone/Pixel görsel kabulü, plakanın render edilmiş görüntüde okunmaması, 4:3/16:10 fotoğraf, kesik/boş bölüm olmaması, klavye/odak/44px hedefler, reduced-motion ve JavaScript kapalı akordeon; tüm e2e; üç mobil Lighthouse ölçümünde medyan Performance ≥85 ve A11y ≥95; inspect.mjs FAIL 0.
- Kod/komut kontrollerinde açık engel yok. Yalnız devredilen tarayıcı kabulü, AGENTS.md gereği TAMAMLANDI durumunu engellemez. DB/ödeme/e-posta servislerine, diğer dokümanlara ve başka repolara yazılmadı.

## Durum: TAMAMLANDI
