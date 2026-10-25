> ONAY VERİLDİ (kullanıcı, 25 Eki 2026): katman görselleri "ok". Onay kaydı ve SHA: `/Users/emre/PROJELER/AFINA-KAYNAK/zeytin-hero-katman/ONAY.md`

# Task 138: Katmanlı hero (derinlik) + KAYDIR ve uzun tire temizliği

## Tür
frontend (görsel hazırlama + bileşen + test, yerel)

## Amaç
Bugünkü hero tek fotoğraf üzerinde Ken Burns yapıyor ve düz duruyor. Sahneyi ayrı katmanlara bölüyoruz: arka plan (zeytinlik + masa), ürünler (10 kg teneke + 1 kg kavanoz), ön plandaki zeytin dalı. Kaydırınca her katman farklı hızda kayacak, derinlik buradan gelecek. Başlık, metin ve satın alma kartı aynı kalacak.

## Kullanılacak araçlar
- `scroll-craft` (önce `references/hero-depth.md` oku; kurallar: temiz plaka, gerçek alfa, ortak temas noktası, mobil ayrı kompozisyon, reduced-motion statik).
- `motion-framer` (`useScroll` + `useTransform`, yalnız transform/opacity), `frontend-design`, `ui-ux-pro-max` (§5), `better-layout`, `tdd-workflow`.
- Coder Notu'na skill tablosu ekle.

## Kaynak görseller (repo dışı, yalnız oku)
Kök: `/Users/emre/PROJELER/AFINA-KAYNAK/`
| Katman | Dosya | Not |
|---|---|---|
| Arka plaka, masaüstü | `zeytin-hero-katman/taslak/arka-masaustu.png` (2048x1152, RGB) | Teneke/kavanoz silinmiş, masa ve zeytinlik tamamlanmış |
| Arka plaka, mobil | `zeytin-hero-katman/taslak/arka-mobil.png` (1152x2048, RGB) | Ortada zeytin kasesi |
| Ön dal | `zeytin-hero-katman/taslak/on-dal-temiz.png` (2048x1152, RGBA) | Sağ üstten giren dal; tuvalin geri kalanı şeffaf |
| Ürün 1 | `zeytin-v3-gorseller/urun-01-kirma-10kg.png` (1024x1536, RGBA) | 10 kg teneke |
| Ürün 2 | `zeytin-v3-gorseller/urun-02-kirma-1kg.png` (1024x1536, RGBA) | 1 kg kavanoz |

Yerleşim referansı (yalnız bakmak için, kullanılmaz): `zeytin-hero-katman/taslak/kompozit-deneme.jpg`. Bu kaba bir denemedir: ürünler fazla büyük, gölgesiz ve masanın üstünde süzülüyor. Sitede bunlar düzeltilecek (madde 3).

## İstenen

1. **Görsel hazırlama** `scripts/prepare-hero-layers.mjs` (sharp, mevcut `prepare-v3-assets.mjs` düzenine benzer):
   - Her kaynağın SHA-256'sını ONAY.md / `zeytin-v3-gorseller/ONAY.md` ile karşılaştır. Uyuşmazsa dur, hata ver.
   - Çıktılar `public/images/hero-katman/` altına AVIF + WebP. Plakalar 1200/2048 genişlik (mobil 640/1152). Dal ve ürünler alfa korunarak; ürünler 360/720 genişlik, dal 1200/2048.
   - Manifest JSON (`lib/media/hero-layers.json`): dosya, genişlik, biçim, boyut. Onaylar `scripts/v3-asset-approvals.json` düzeninde kayıtlı olsun ve `npm run check:assets` yeni dosyaları da doğrulasın.
   - Kaynak PNG'ler repoya kopyalanmaz, yalnız optimize çıktılar girer.

2. **Katman sırası** (`SofraHero` içinde, arkadan öne):
   1. `data-layer="plate"`: arka plaka. LCP görseli; preload şu anki gibi media'ya göre (masaüstü/mobil AVIF).
   2. Mevcut `curtain` gradyanı (okunurluk için kalır, gerekirse hafifletilir).
   3. Başlık ve metin (`.copy`), plaka ile ürünler arasında. Masaüstünde ürünler başlığı **kapatmaz**.
   4. `data-layer="products"`: teneke + kavanoz, sağda, masanın üstünde.
   5. `data-layer="branch"`: ön dal, sağ üst köşe.
   6. Satın alma kartı en üstte, bugünkü yerinde ve davranışında.
   - Katman görselleri `aria-hidden`, `alt=""`. Sayfada `<h1>` ve tüm metin gerçek HTML olarak kalır.

3. **Ürünleri sahneye oturtma** (kompozit denemesindeki "yapıştırılmış" görüntüyü düzelt):
   - Ölçek: masaüstünde teneke yüksekliği yaklaşık viewport yüksekliğinin %42'si, kavanoz %28'i. İkisinin tabanı aynı masa çizgisinde (ortak temas noktası). Kavanoz tenekenin önünde ve hafif solunda dursun.
   - Temas gölgesi: her ürünün altında yumuşak, eliptik, koyu-sıcak bir gölge (`radial-gradient`, düşük opaklık). Ürünle birlikte hareket eder.
   - Renk uyumu: stüdyo ışığını sahnenin altın ışığına yaklaştır. Ürün katmanına hafif sıcak ton ver (ör. `filter: saturate(.94) brightness(.96) sepia(.06)`; ya da `mix-blend-mode: soft-light` altın gradyan). Etiket okunur kalsın, renk bozulmasın.
   - Tam değerleri ekran görüntüsüne bakarak ayarla. Masa çizgisi plakadaki gerçek masa kenarıyla örtüşmeli.

4. **Kaydırma hareketi** (pin yok, ek kaydırma alanı yok):
   - İlerleme değeri: hero üstü viewport üstündeyken 0, hero altı viewport üstüne geldiğinde 1 (`useScroll({ target, offset: ["start start", "end start"] })`).
   - Plaka: yavaş, `translateY` 0→%6, `scale` 1.00→1.05.
   - Ürünler: orta hız, `translateY` 0→%14. Gölge ürünle birlikte kayar, ürün masadan kopmaz. Ürünle plaka arasındaki fark küçük tutulur, gerekirse ürün ve masa birlikte, ürün biraz daha hızlı kayar.
   - Dal: en hızlı, `translateY` 0→-%22 (yukarı ve kameradan dışarı), `scale` 1.00→1.12, hafif sağa kayma.
   - Başlık: hafif yukarı ve saydamlaşarak çekilir (`opacity` 1→0.2 ilerlemenin son yarısında). Kart sabit kalır.
   - Ken Burns animasyonunu kaldır; yerine bu paralaks gelir. `motionTokens.hero` içindeki kullanılmayan alanları temizle, yeni değerleri tokens'a taşı.
   - Yalnız `transform` ve `opacity`. Kaydırmada React yeniden render olmaz (motion value). Sekme gizliyken ya da hero ekran dışındayken iş yapılmaz.

5. **Mobil (≤ 900 px), ayrı kompozisyon:**
   - `arka-mobil` plakası. Ürünler ortadaki zeytin kasesinin arkasında, ekranın orta-alt bölgesinde, kartın üstünde kalacak şekilde küçük. Başlık üstte okunur, ürünler başlığı kapatmaz.
   - Dal sağ üstte daha küçük, kenardan kırpılabilir.
   - Hareket mesafeleri masaüstünün yarısı. Yatay taşma yok (`overflow: hidden` hero'da zaten var, koru).

6. **Reduced motion** (`usePrefersReducedMotion` ve `@media (prefers-reduced-motion: reduce)`):
   - Tüm katmanlar aynı statik kompozisyonda görünür (derinlik görseli korunur), hiçbir transform yok, başlık tam opak.

7. **Yükleme:**
   - Plaka tek başına eksiksiz bir sahnedir. Ürün ve dal katmanları yüklenene kadar gizli kalır, ikisi de hazır olunca birlikte 300 ms opaklıkla gelir. Biri hata verirse ikisi de gösterilmez, plaka kalır. Yarım sahne olmaz.
   - Ürün/dal görselleri `fetchpriority="low"`, LCP'yi geciktirmez.

8. **Temizlik (aynı commit dizisinde):**
   - "KAYDIR" ipucunu tamamen kaldır: `SofraHero.tsx` içindeki `data-scroll-hint` öğesi, `.scrollHint` CSS'i, `data-scroll-line` animasyonu, `hintDuration` token'ı, ilgili test/doğrulama betikleri (`scripts/verify-sofra-hero.mjs` vb.).
   - Vitrinde görünen uzun tireleri (—) kaldır:
     - `app/layout.tsx:49` og alt → `"Afina Zeytin. Kökü toprakta, yeri sofrada."`
     - `app/kvkk/page.tsx`, `app/iade/page.tsx`, `app/mesafeli-satis/page.tsx` başlıkları → `"KVKK (Taslak) | Afina Zeytin"` biçiminde.
     - `components/site/LegalDocument.tsx:18` → `"Taslak, onay bekleniyor"`.
     - Fiyat yer tutucusu `"—"` (`SofraHero.tsx:121`, `HeroBand.tsx:41`, `CartPresentation.tsx:21`) → `"Fiyat yakında"`. Kartta satır kırmıyorsa bu metin kalır, kırıyorsa küçük puntoyla.
     - Admin paneli ve kod yorumları kapsam dışı.

9. **Testler:**
   - Katman sırası ve `aria-hidden`, reduced motion'da transform yokluğu, "KAYDIR" metninin ve `data-scroll-hint`'in DOM'da olmaması.
   - Katman yükleme mantığı: biri hata verirse ürün+dal gizli.
   - `prepare-hero-layers` için SHA uyuşmazlığında hata (küçük birim testi).
   - Vitrin kaynaklarında görünen `—` kalmadığını yakalayan basit test (admin ve yorumlar hariç).

## Kabul kriterleri
- [ ] Kaydırma sırasında üç katman gözle görülür farklı hızda hareket ediyor; ürünler masadan kopmuyor, süzülmüyor.
- [ ] Ürünlerin altında temas gölgesi var, renk sahneyle uyumlu.
- [ ] Açılışta başlık tam okunur; masaüstünde ve 390 px'te ürünler veya dal başlığı kapatmıyor.
- [ ] Kart, beden seçimi, sepete ekle, "Ürünleri gör/Tesisimiz" bugünkü gibi çalışıyor.
- [ ] Reduced motion'da statik, eksiksiz kompozisyon.
- [ ] "KAYDIR" yok, vitrinde `—` yok.
- [ ] LCP görseli hâlâ plaka ve preload'lu; yeni katmanlar toplamda masaüstünde ≤ 350 KB, mobilde ≤ 220 KB (AVIF).
- [ ] `npm test`, lint, typecheck, build, `check:assets` yeşil.
- Tarayıcı ekran testleri (açılış / ara kaydırma / son / mobil / reduced) Claude'da (AGENTS.md).

## Yapılmaması gerekenler
- Başlık, açıklama, ürün adı, fiyat mantığı ve kart davranışını değiştirme (madde 8'deki yer tutucu hariç).
- Yeni görsel üretme veya kaynak PNG'leri düzenleme/repoya ekleme.
- WebGL, video, pin/sticky kaydırma, imleç kilitleme.
- KURUMSAL repoya dokunma. `.env*` okuma/yazma.
- `docs/tasks` içinde yalnız Coder Notu/Durum.

## Coder Notu
