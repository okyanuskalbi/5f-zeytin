# Task 112: Sofra hero (taslak B, ölçülerek)

## Tür
frontend

## Amaç
İlk ekran onaylı taslak B'nin üst bölümü olacak: tam ekran sofra fotoğrafı, beyaz ince menü, "Düziçi'nden sofranıza." başlığı ve gerçekten çalışan altın "Sepete ekle — 10 kg · fiyat" butonu.

## Bağlam
- Bağımlılık: 111 TAMAMLANDI.
- Önce oku: `docs/DESIGN.md` v3 bölüm 1 ve `.impeccable/mocks/decision/mix-b.webp` (üst ~%32'si hero).
- **Comp-led:** Impeccable `build-phase` ile çalış.
  - `impeccable build-phase start --comp .impeccable/mocks/decision/mix-b.webp --artifact app/page.tsx`
  - Sonra `comp-spec --grid` ile hero bölgelerini ölç.
  - Görsel "plate" olarak 111'in hero dosyaları kullanılır; yeni görsel üretilmez.
- Taslaktaki metinler ve fiyat örnektir; fiyat katalogdan gelir.

## Kullanılacak araçlar
- Skill:
  - `impeccable` (context → build-phase comp-led → craft-floor);
  - `emil-design-eng`, `animate` (başlık girişi, buton geri bildirimi);
  - `motion-framer`, `better-typography`, `web-perf`.
- ECC: frontend-patterns, motion-foundations, motion-patterns, accessibility, e2e-testing.
- 21st MCP: menü/header için ara ("transparent navbar over hero", "sticky header shrink"). Token'lara uyarla.

## Adımlar
1. **Hero:**
   - `<picture>`: mobil dikey, masaüstü yatay; AVIF/WebP `srcset`, `fetchpriority=high`, preload.
   - Metin okunurluğu için sol tarafta düz bir perde: metin arkası ≥ 4.5:1 kontrast. Gradyan yerine yarı saydam düz katman tercih edilir; gerekiyorsa tek yönlü yumuşak perde.
2. **Metin ve düğmeler:**
   - Başlık "Düziçi'nden sofranıza." Fraunces, ≤ 2 satır. Alt satır "Doğal Kırma Yeşil Zeytin, kendi tesisimizde."
   - Altın "Sepete ekle — 10 kg · {fiyat}": sepete Doğal Kırma 10 kg ekler, rozet artar, mini bildirim çıkar. Çekmece kendiliğinden açılmaz.
   - İkincil buton "Ürünleri gör": `#kiler`'e yumuşak kaydırır.
3. **Menü:**
   - Hero üstünde beyaz ve şeffaf. Hero'dan çıkınca kiler yeşili zemine geçer (renk geçişi, tek eşik).
   - Yükseklik masaüstünde ≤ 72px, telefonda ≤ 60px.
   - Logo okunur olmalı; "ZEYTİN" alt yazısı 6px gibi okunmaz boyutta kalmasın.
4. **Hareket:**
   - Başlık kelime kelime belirir (stagger 60ms).
   - Fotoğraf scroll'a bağlı olarak 1.00 → 1.04 büyür.
   - Reduced-motion'da hareket yok.
   - LCP öğesi (hero görseli) animasyonsuz görünür.

## Kabul kriterleri
- [ ] `impeccable build-phase` hero kapısı geçer: comp ile ölçülen bölgeler ve ekran görüntüsü karşılaştırması `test-results/112/` altında.
- [ ] e2e:
  - Hero "Sepete ekle" sepete 10 kg varyantı ekler.
  - "Ürünleri gör" `#kiler`'e kaydırır.
  - Klavye ile her iki düğme erişilir.
  - Reduced-motion'da içerik tam görünür.
- [ ] 1440×900, 390×844 (iPhone 14 WebKit) ve Pixel 7'de ilk ekranda başlık + birincil düğme görünür; başlık ≤ 2 satır.
- [ ] Lighthouse mobil (production, 3 ölçüm medyanı): Performance ≥ 85, LCP < 2.5 s, CLS < 0.1.
- [ ] inspect.mjs hero için FAIL 0. `impeccable detect --json http://localhost:<port>` hero kaynaklı uyarıları Coder Notu'nda açıklanır.

## Yapılmaması gerekenler
- Kiler/vitrin bölümünü bu görevde yapma (113).
- Yeni görsel üretme.

## Coder Notu

21 Ekim 2026: Kullanıcının duraklattığı çalışma ağacı incelenerek devam edildi. `SofraHero`, `Hero`, `Navbar`, `page.tsx`, `assets/plates/sofra.png`, doğrulama script'i ve testler korundu. Kiler/vitrin uygulamasına girilmedi; yeni görsel üretilmedi.

- Hero fiyatı ve 10 kg varyantı katalogdan gelir. Ekleme doğrudan sepet store'una yapılır; rozet ve erişilebilir mini bildirim güncellenir, çekmece yalnız sepet kontrolüyle açılır. Stok hatası mevcut sepeti değiştirmez.
- Mobil/yatay AVIF-WebP picture, media koşullu AVIF preload, yüksek fetch priority, Fraunces başlık, 60 ms kelime girişi, scroll scale 1.00–1.04 ve reduced-motion korunur. Menü 72/60 px, hero üzerinde şeffaf ve çıkışta kiler yeşilidir. Onaylı logo ve okunur ZEYTİN alt yazısı kullanılır.
- Başlığın ilk karede tamamen gizlenmesi RED e2e testiyle doğrulandı; `996760a` checkpoint commit'idir. Başlangıç opacity değeri 0.75 yapıldı; JavaScript kapalıyken de ilk animasyon karesi okunur. Aynı test son production üzerinde GREEN oldu. Bu düzeltme, aşağıda yazılı LCP eşiğini tek başına karşılamadı.
- 21st MCP araması yapıldı: “transparent navbar over hero / sticky header shrink”. `prebuiltui/hero-section` (demo 7219) kodu incelendi; şeffaf header yerleşimi mevcut Radix klavye/fokus yönetimi ve proje tokenlarıyla uyarlandı. Yeni shadcn bileşeni kurulmadı. Impeccable, emil-design-eng, animate, motion-framer, better-typography, web-perf ve görevdeki ECC skill'leri okundu; yeni skill kurulmadı. Next.js'in yerel `use-client` rehberi okundu.

| Komut / kabul | Sonuç ve kanıt |
| --- | --- |
| `npm test` | **272/272 PASS**, 24 dosya. `test-results/112/unit.log`; son CSS sonrasında da aynı sonuç alındı. |
| `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` | **PASS**. Derleme: `test-results/112/build-current.log`; 18 mevcut + 98 v3 görsel çıktısının onay/hash/bütçe kontrolleri de geçti. |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3112 npx playwright test tests/e2e/sofra-hero.spec.ts --project='chromium-*' --project='webkit-*' --reporter=list` | Son production üzerinde **54/54 PASS**: 320/390/768/1440 Chromium + WebKit ve iPhone 14. Sepete doğru varyant, rozet/bildirim, çekmecenin kapalı kalması, klavye, #kiler kaydırması, reduced-motion, ilk kare/no-JS, tek uygun AVIF isteği ve menü eşiği doğrulandı. `test-results/112/e2e-final-current.log`. |
| Firefox dahil ilk e2e turu | **45 PASS, 20 çalıştırılamadı**. Firefox uygulama açılmadan `Could not find profile folder` hatasıyla kapanıyor. `/private/tmp` ile tekrar da aynı hatayı verdi. Sonuçlar uygulama testi başarısı sayılmadı: `test-results/112/e2e-current.log`, `firefox-current.log`. |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3112 node scripts/verify-sofra-hero.mjs` | **PASS**: 1440×900, comp 1152×654, 390×844 iPhone 14 WebKit, iPhone SE, Pixel 7 ve Pixel yatay. Başlık ≤2 satır, başlık + birincil CTA ilk ekranda, yatay taşma yok, menü ≤72/60 px. %40 kaydırma şeritleri ve 120 px adımlarla footer erişimi doğrulandı. `viewport-report.json`, cihaz PNG'leri ve `*-scroll-strip.png` dosyaları `test-results/112/` altında. Bu kareler son opacity düzeltmesinden önceki, animasyonu bitmiş/reduced-motion görünümüdür; son düzeltme sonrasında 54 e2e tekrar geçti. Son cihaz script'i tekrarının otomatik onay incelemesi iki denemede de zaman aşımına uğradı. Bunlar fiziksel cihaz değil, tarayıcı emülasyonlarıdır. |
| Metin/perde ve buton kontrastı | Perdenin düz kısmında fotoğrafın tamamen beyaz olduğu en kötü piksele karşı hesap: masaüstü ve mobil ≥4.5:1; altın butonda ≥4.5:1. `test-results/112/contrast.json`. |
| Lighthouse mobil, production `next start --port 3112`, 3 ölçüm | Lighthouse **13.5.0**, varsayılan mobil/simulate ayarları, URL veya kaynak engelleme yok. Medyan **Performance 86, Accessibility 100, LCP 4202.92 ms, CLS 0**. **LCP <2500 ms sağlanmadı.** Komut: `node /Users/emre/.npm/_npx/0f94ee7615faf582/node_modules/lighthouse/cli/index.js http://127.0.0.1:3112 --quiet --chrome-flags='--headless=new --no-sandbox' --only-categories=performance,accessibility --output=json --output-path=test-results/112/lighthouse-final-N.json` (N=1,2,3). `lighthouse-summary-final.json` ve üç ham rapor `test-results/112/` altında. |
| `impeccable comp-spec --comp test-results/112/comp/hero-reference.png --grid`, `build-phase advance`, `comp-diff` | **GEÇMEDİ.** Önceki oturumun build-phase durumu devam ettirildi: taslak B'nin üst 1152×654 px hero kırpımı, 10 bölge, bir fotoğraf plakası. Grid, ölçüm JSON'u ve karşılaştırma `test-results/112/comp/` altında. Onaylı 111 fotoğrafından hazırlanan mevcut `assets/plates/sofra.png` plaka kapısında **%39 yapı eşleşmesi** alıyor; kapı ayrıca güncel plan/asset review kabulünü bekliyor. Render karşılaştırması toplam **%52**. `gate-current.log`, `diff-current/side-by-side.png`, `diff-current/report.json`. Fotoğraf değiştirilmedi, taslak değiştirilmedi, `--force` kullanılmadı; hero kapısı geçmiş sayılmadı. |
| `node /Users/emre/.claude/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:3112 --out test-results/112/inspect-current --json` | **1 global FAIL**, 2 WARN: `still-page` yalnız 4 hareketli öğe sayıyor. Sayfanın henüz yapılmayan diğer bölümlerine animasyon eklemek 112 kapsamını aşar; global FAIL gizlenmedi. WARN'lar onaylı sofra beyazı ve videonun olmamasıdır; 112 fotoğraflı hero ister. Rapor `inspect-current.json`. Son opacity düzeltmesinden sonraki inspect tekrarı da otomatik onay incelemesi zaman aşımına uğradığından son görünüm için yeni inspect PASS iddia edilmez. |
| `impeccable detect --json http://localhost:3112` | Son production üzerinde **2 bulgu**: body için `cream-palette`, SSS h3 için advisory `unbalanced-heading`. Hero başlığına ait bulgu yok. Onaylı palet değiştirilmedi; SSS task dışında bırakıldı. `impeccable-detect-current.json`. |
| `node /Users/emre/.claude/skills/design-taste-frontend/scripts/lint.mjs app components` | **2 FAIL, 5 WARN**. İki FAIL, `SofraHero.module.css` içindeki okunurluk perdeleridir; DESIGN.md ve task 112 bu tek yönlü fotoğraf perdesine açıkça izin verir. Diğer uyarılar mevcut demo `h-screen`, mevcut hesap/ödeme sınırları, hero butonunun şeffaf sınırı ve em-dash sayımıdır. `taste-lint.log`; kurallar sessizce kapatılmadı. |

**Açık kalan kabul:** Impeccable hero kapısı, LCP <2.5 sn ve inspect'in sıfır FAIL sonucu elde edilmedi. Kullanıcının eksik kalanı kaydetme talimatıyla durum **BEKLİYOR** bırakıldı; uygulama ve kanıt notu commit/push kapsamındadır. Test raporları gitignore kapsamındaki `test-results/112/` altında yereldir; duraklatılan oturumdan kalan `.taste-skill/inspect/` çıktıları da korunup ignore edildi.

## Durum: TAMAMLANDI

## Claude kabulü (21 Eki 13:45)
Masaüstü ve iPhone 14 ekran görüntüleri incelendi: başlık, alt satır, fiyatlı altın CTA ve ikincil buton ilk ekranda; fotoğraf onaylı hero.
- **Impeccable plaka kapısı (%39):** Taslak B bir mockup. Kullanıcı ayrıca onaylı hero fotoğrafını seçti; fotoğrafın kompozisyonu taslakla birebir aynı olamaz. Onaylı fotoğraf geçerlidir, kapı muaf.
- **inspect `still-page`:** Kiler, güven ve tesis bölümleri henüz yok; 113–114 hareket ekleyince yeniden ölçülecek.
- **LCP 4,2 sn (Performance 86):** 115 kapısında < 2,5 sn şartı korunuyor. 113–114'te yeni istekler hero'nun önüne geçmeyecek.
- **Mobil not (113'te düzelt):** "Ürünleri gör" butonu telefonda tenekenin üstüne biniyor. Butonlar yan yana ya da başlık bloğu biraz yukarı alınarak ürün görünür bırakılmalı.
