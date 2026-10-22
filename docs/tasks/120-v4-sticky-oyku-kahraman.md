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

## Durum: BEKLİYOR
