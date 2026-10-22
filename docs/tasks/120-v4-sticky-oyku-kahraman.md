# Task 120: v4 — sticky fotoğraf çerçevesiyle tesis öyküsü + kahraman ürün bandı

## Tür
frontend

## Amaç
Prova D'nin imza hareketi: solda sabit (sticky) 4:5 çerçevede fotoğraf çapraz geçişle değişir, sağda 01/02/03 adım. Ardından paralakslı 16:9 "Kahraman ürün" bandı. Mevcut `Facility.tsx` kaldırılır. Sözleşme: `docs/DESIGN.md`, prova `d.html` (`.story`, `.kahraman`), kareler `mock-d-masa-03..05.png`, `mock-d-tel-04..06.png`.

Claude denetim notları (uygula):
- **Tesis fotoğrafı neon yeşildi**, koyu zeytin zeminle çatışıyordu: `scripts/prepare-facility.mjs` (ya da yeni adım) **plakası bulanık kaynaktan** doygunluğu %70'e indirip hafif sıcak ton (sharp `modulate({saturation:.7})` + `tint`/`linear` ile sıcaklık) uygulanmış `tesis-osmaniye-v4-{1200,2400}.webp` üretsin. Orijinal bulanık dosya değişmez; **plaka asla okunur olmaz**; çıktı `docs/referans/tesis/` dışına yazılır (`public/images/tesis/`).
- **Telefonda sticky çerçeve 01. adım metnini eziyordu** (`mock-d-tel-04.png`): telefonda çerçeve `max-height: 42svh`, `aspect-ratio 4/3`, adımlar çerçevenin **altında** başlar (`padding-top: 24px`), her adım `min-height: 52svh`; çerçeve metnin üstüne binmez.
- **Kahraman band hero ile aynı işi tekrar ediyordu:** band başlığı "Doğal Kırma Yeşil Zeytin" yerine kullanım anını anlatır: kicker "KAHRAMAN ÜRÜN", `h2` "Kışlık kiler için / 10 kg teneke.", metin "Aynı zeytin, aynı tesis. Günlük sofra için 1 kg kavanoz da var." Fiyat kutusu (small "10 kg teneke" + ₺ fiyat) + "Sepete ekle" + ikinci hayalet düğme "1 kg kavanoz" (1 kg varyantını ekler). Böylece band hero'yu tekrar etmez, boy kararını satar.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (genel yön: "Trust & Authority" + dönüşüm kalıbı), `frontend-design` (renk, yazı tipi, düzen), `motion-framer` (Framer Motion animasyonları), `shadcn-ui` (bileşen gerekirse; resmi CLI, proje token'larına uyarlanmış), 21st MCP (bileşen arama/üretme, uyarla). Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- **Kullanıcı isteği (22 Eki), yerleşim:** `ui-ux-pro-max` §5 "Layout \& Responsive" (mobil-first kırılımlar, yatay kaydırma yok, dokunma hedefi ≥ 44px) ve `better-layout` (yerleşim düzeltmeleri) fiilen yüklenir. `responsiveness-check` (320/375/390/430/768/1024/1440 genişlik kontrolü) tarayıcı testidir; Claude çalıştırır, sen kodu bu genişliklere göre yaz.
- Skill: `frontend-patterns`, `tdd-workflow`, `motion-advanced` (scroll-linked), `cinematic-scroll-storytelling`, `impeccable` (craft-floor).

## Varlıklar (onaylı)
- Çerçeve 0: `v3Image("01-dogal-kirma-yesil-zeytin-10kg-sahne")`; çerçeve 1: tesis v4 webp (yukarıdaki üretim; manifest/`check-v3-assets` listesine ekle); çerçeve 2: `v3Image("04-naturel-sizma-zeytinyagi-1l-sahne")`.
- Kahraman band zemini: `01-…-10kg-sahne` 16:9 (`inset:-12% 0` ile paralaks payı).

## Adımlar
1. **Öykü** (`components/landing/Story.tsx` + module; `id="tesisimiz"` **korunur**): zemin `--zeytin`; masaüstü 2 kolon gap 64; sol `position:sticky; top:0; height:100svh` içinde çerçeve 4:5 `max-height:82svh` radius 26 gölge; 3 `<img>` üst üste, aktif `opacity:1; scale(1)`, diğerleri `opacity:0; scale(1.06)`, geçiş opacity .9 s / transform 1.6 s. Sol altta hap caption (12px .18em, blur zemin): "Düziçi, Osmaniye" / "Tesisimiz · Ellek" / "Natürel sızma · 1 L".
   - Sağ adımlar: `padding 18vh 0 24vh`, her adım `min-height:70svh`, pasif opacity .28 → aktif 1 (.5 s). İçerik: `01` "Kökü toprakta." + "Osmaniye'nin Düziçi ilçesi, Ellek beldesi. Zeytinin hikâyesi burada, toprakta başlar; sofrada tamamlanır." / `02` "Kendi tesisimizde." + "Seçim, salamura ve dolum Ellek'teki kendi tesisimizde yapılır. 2021'den bu yana perakende ve toptan alıcılara ulaşıyoruz." / `03` "Yeri sofrada." + "Sofralık zeytin, salamura zeytin ve zeytinyağı. Yalın ve özenli bir sunumla, ürünün özüne saygıyla." Numara Fraunces 14px altın .2em; `h2` `clamp(38px,4.6vw,64px)`; metin 18px `#DCE1D7` ≤46ch.
   - Aktif adım: `IntersectionObserver` `rootMargin:-45% 0px -45% 0px` (ya da `motion` `useInView` eşdeğeri); JS yokken 3 görsel de görünür (ilk aktif), adımlar tam opak (no-JS/reduced-motion fallback).
   - Telefon kuralları yukarıdaki denetim notunda.
2. **Kahraman band** (`components/landing/HeroBand.tsx`): `height:92svh; min-height:600px` (telefon: auto, padding 72px), zemin görseli paralaks `translateY` en çok 60px (`useScroll` + `useTransform`, reduced-motion'da sabit), scrim soldan sağa `rgba(10,16,11,.75)→0` (telefon dikey `.85→.55`). Sol kutu `max-width:520px`, içerik yukarıdaki denetim notuna göre; fiyat 34px 800 tabular, small 12px .14em altın. Sepete ekleme 118/119'daki ortak kalıp (`AddToCart`), geri bildirim `role=status`.
3. **Reveal** kicker/h2/p/buy sırayla 80 ms stagger, `once`.
4. **Testler**: `tests/unit/facility.test.tsx` → `story.test.tsx` (3 adım metni, caption, no-JS'de tüm görseller görünür, tesis görselinin `src` v4 dosyası ve alt metninde plaka yok), `hero-band.test.tsx` (iki düğme iki farklı varyantı ekler). E2E `facility*.spec.ts` → `story-v4.spec.ts` (Claude çalıştırır).

## Kabul kriterleri
- [ ] Kaydırdıkça çerçeve görseli 0→1→2 değişir, caption eşlik eder; geri kaydırınca geri döner (Claude: masaüstü + iPhone + Pixel şeridi).
- [ ] Telefonda çerçeve 01 metnini örtmüyor; `mock-d-tel-04.png` sorunu yok (Claude).
- [ ] Tesis görseli v4 renk düzeltmeli, plaka okunmuyor (Claude görsel kontrol; sen üretilen dosyayı aç ve bak).
- [ ] Band paralaks ≤ 60px, reduced-motion'da sabit (unit: transform yok).
- [ ] Band iki düğmesi 10 kg / 1 kg varyantlarını ekler (unit).
- [ ] CLS < 0.1: çerçeve ve band için `aspect-ratio`/sabit yükseklik, görsellerde width/height (Claude Lighthouse).
- [ ] `npm test`, lint, typecheck, build yeşil.

## Yapılmaması gerekenler
- Plakası bulanık olmayan kaynağa dokunma; `docs/referans/tesis/` içine yazma; yeni tesis görseli üretme.
- Scroll kilidi/pin kütüphanesi; yalnız sticky + IO + `motion`.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Coder Notu

- `Facility` yerine `Story` ve `HeroBand` eklendi; `#tesisimiz` korunur. Sayfa sırası ürünler → üç adımlı öykü → kahraman band → mevcut toptan hedefi → SSS şeklindedir. İletişim kanalı veya ürün/fiyat/stok uydurulmadı.
- Öykü masaüstünde 4:5 sticky çerçeve, 64px kolon aralığı, üç fotoğraf/caption ve geri kaydırmayı da izleyen IO kullanır. IO yüzde margin'lerinin genişliğe göre hesaplanması nedeniyle masaüstünde aynı %45/%45 okuma bandı viewport yüksekliğinden piksel olarak hesaplanır. Telefonda okuma bandı fotoğrafın altında tutulur; çerçeve 4:3/en fazla 42svh, adım başlangıcı 24px, adımlar en az 52svh'dir. 320/375/390/430/768/1024/1440px için mobil-first CSS yazıldı.
- SSR/no-JS/reduced-motion halinde sabit ölçülü çerçevede üç fotoğraf/caption birlikte, adımlar tam opak görünür; JS geliştirmesi aynı çerçeve ölçüsünde katmanlı çapraz geçişe dönüşür. İlk fotoğraf ilk aktiftir. Görsellerin width/height ve çerçevenin aspect-ratio/yükseklik alanı ayrılmıştır; gerçek CLS ölçümü Claude'dadır.
- `scripts/prepare-facility-v4.mjs` yalnız SHA'sı sabitlenmiş `docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg` kaynağını okur. `saturation: .7`, RGB çarpanları `[1.025, 1, .97]` ile sıcak ton ve 1200/2400px WebP türevleri üretir. Kaynak değişmeden kaldı; **iki çıktı da dosyadan açılıp incelendi, plaka okunmuyor**. Manifest `public/images/tesis-v4-manifest.json`; kaynak/renk/çıktı SHA/ölçü doğrulaması hem `check-assets` hem `check-v3-assets` akışına bağlandı. Eski bulanık türevler korundu.
- Bandın katalogdan gelen 10 kg fiyatı, birincil `Sepete ekle` ve hayalet `1 kg kavanoz` düğmesi ortak `AddToCart` kullanır. İki ayrı varyant ID'si, stok sınırı, 2400ms başarı geri bildirimi, `role=status` ve yerel hata korunur; drawer kendiliğinden açılmaz. Arka plan `useScroll`/`useTransform` ile ±60px sınırındadır; reduced-motion'da transform yoktur. Kicker/h2/p/buy reveal'i 80ms aralıkla bir kez çalışır; SSR'de içerik görünürdür.
- 21st MCP bu oturumdaki etkin araç listesinde bulunamadı. AGENTS.md'deki erişim yoksa Coder Notu'na yazma yolu uygulandı; onaylı `d.html`, proje bileşenleri ve token'ları esas alındı. Yeni UI primitive'i/bağımlılığı gerekmedi; shadcn resmi CLI `docs button` ile incelendi, mevcut satın alma kontrolü genişletildi.

| Skill / araç | Nerede kullanıldı |
| --- | --- |
| `ui-ux-pro-max` | Skill ve §5 Layout & Responsive yüklendi; `trust-authority-conversion` landing kaydı sorgulandı. Doğrulanmış tesis bilgisi → açık fiyat → düşük sürtünmeli satın alma, mobil-first kırılımlar, taşmayan düzen ve 44px hedefler. |
| `frontend-design` | D provasındaki koyu zeytin/süt/altın, Fraunces/Figtree, fotoğraf çerçevesi ve metin hiyerarşisi. |
| `motion-framer` | Motion reveal ve scroll değerleri; yalnız transform/opacity animasyonu. |
| `shadcn-ui` | Bileşen/token rehberi ve resmi CLI `docs button`; mevcut AddToCart üzerinden birincil/hayalet eylemler, yeni kurulum gerekmedi. |
| `better-layout` | `minmax(0, 1fr)`, `min-width: 0`, mantıksal boşluklar, mobil çerçeve yüksekliği, sarılan fiyat/CTA ve masaüstü kolon düzeni. |
| `frontend-patterns` | Sunucu sayfadan katalog prop'ları; ayrı istemci öykü/band; ortak AddToCart bileşimi. |
| `tdd-workflow` | Eksik iki bileşen için RED, davranış testleriyle GREEN; yalnız yerel checkpoint'ler, nihai yeşil commit'e birleştirme. |
| `motion-foundations` | Ortak `lib/ui-motion.ts` token'ları, SSR görünür varsayılan ve reduced-motion. |
| `motion-patterns` | `once` reveal, 80ms stagger, fotoğraf çapraz geçişi ve geri bildirim. |
| `motion-advanced` | `useScroll`/`useTransform` ile render tetiklemeden sınırlı paralaks; IO/resize cleanup. |
| `cinematic-scroll-storytelling` | Sticky sahne değişimi, eşleşen caption ve sonraki bandın paralaksı; native scroll + IO + Motion kullanıldı. |
| `impeccable` | `context`, `craft-floor`, mevcut PRODUCT.md ve görevdeki `docs/DESIGN.md`; tamamlanan UI'da mekanik `detect --json` sonucu `[]`. Skill'in kök DESIGN.md/yerel config beklentisi nedeniyle proje belgeleri veya config'i değiştirilmedi. |
| 21st MCP | Erişim yok; AGENTS.md fallback'iyle onaylı D provası ve mevcut proje bileşenleri kullanıldı. |

Komut kanıtları:

- RED: `npm test -- tests/unit/story.test.tsx tests/unit/hero-band.test.tsx` → eksik Story/HeroBand import'ları nedeniyle iki suite FAIL (üretim kodundan önce). Yerel checkpoint `d4bce79`; RED/ara commit'ler push edilmeden nihai task commit'ine birleştirildi.
- GREEN: aynı iki dosyada **10 test PASS**. Üç metin/caption, SSR/no-JS, reduced-motion/IO yokluğu, 0→1→2→1→0 aktif görsel/caption, cleanup, iki SKU, katalog fiyatı, stok/eksik varyant, süreli geri bildirim ve paralaksın normal aralık dışındaki scroll değerlerinde dahi −60/+60px'e sıkışması doğrulandı.
- `npm test -- --coverage --coverage.include=components/landing/Story.tsx --coverage.include=components/landing/HeroBand.tsx --coverage.include=components/catalog/AddToCart.tsx` → **28 dosya / 323 test PASS**; bu üç dosyada statements **%95,71**, branches **%90,90**, functions **%94,44**, lines **%100**.
- `npm test -- --coverage` → **28 dosya / 323 test PASS**; mevcut `app/**` kapsamındaki global %80 kapıları geçti: statements **%83,09**, branches **%84,21**, functions **%89,47**, lines **%88,33**.
- `npm run lint`, `npm run typecheck`, `npm run build` → **PASS**. `npm run check:assets` → **18 mevcut görsel + 100 çıktı (98 v3 + 2 v4 tesis) PASS**.
- `node --test scripts/check-v3-assets.test.mjs` → **5 test PASS**; sahte kaynak SHA/renk işlemi, değiştirilmiş v4 çıktı pikselleri ve mevcut varlık bütçe/onay olumsuz senaryoları reddedildi. `git diff --check` → temiz.

Claude doğrulayacak:

- `facility*.spec.ts` yerine `story-v4.spec.ts` yazıldı. İleri/geri geçiş, caption, yedi genişlikte çerçeve/metin aralığı ve taşma, ≥44px düğmeler, iki SKU/persist, ±60px paralaks, reduced-motion, no-JS ve görsel yüklenmeme senaryolarını içerir. Mevcut masaüstü/iPhone 14 projelerine ek olarak yalnız bu spec için Pixel 7 projesi tanımlandı. **E2E çalıştırılmadı.**
- Masaüstü + iPhone + Pixel kaydırma şeritleri/prova karşılaştırması, mobil 01 metninin örtülmemesi, gerçek render/kontrast ve **CLS < 0.1** Lighthouse ölçümü **Claude doğrulayacak**. Playwright, Lighthouse, inspect, ekran görüntüsü veya tarayıcı açılmadı.
- Uygulamada açık engel yok; bu tarayıcı kabul maddeleri AGENTS.md gereği TAMAMLANDI'yı engellemez. Komut sonuçları canlı yayın veya cihaz kabulü olarak sunulmaz. Önceden mevcut 121–122 görev dosyası değişiklikleri korunur, bu commit'e alınmaz.

## Durum: TAMAMLANDI
