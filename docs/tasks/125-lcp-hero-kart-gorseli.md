# Task 125: Mobil LCP — hero kartındaki teneke görseli geç yükleniyor

## Tür
frontend

## Amaç
Claude 122 sonrası canlıda Lighthouse mobil iki kez koştu (`~/PROJELER/AFINA-KAYNAK/araclar/log/z-122/lh-1.json`, `lh-2.json`):
- Performance **82 / 84**, A11y 100, Best Practices 100, SEO 100. CLS 0, TBT 20 ms.
- **LCP 4,3–4,5 s** (hedef < 2,5 s).
- **LCP öğesi:** `div.card > div.productImage > picture > img` → `urun-01-kirma-10kg-h300.avif` (hero satın alma kartındaki küçük teneke, 72×92). Bu görsel **`loading="lazy"`, `fetchpriority="auto"`**. Lighthouse "lazy load not applied: false", "fetchpriority=high should be applied: false" diyor. Kırılım: TTFB %16, **yükleme gecikmesi %33**, yükleme süresi %50.

## Kullanılacak araçlar
- `performance-optimization`, `web-perf`, `vercel:react-best-practices`, `tdd-workflow`.
- **Kullanıcı isteği (22 Eki):** `ui-ux-pro-max`, `frontend-design` yüklenir (görünüm değişmeyecek); Coder Notu'na "Skill / nerede kullanıldı" tablosu.

## İstenen
1. Hero satın alma kartının ürün görseli: `loading="eager"`, `fetchpriority="high"`, `decoding="async"`. `<link rel="preload" as="image" imagesrcset=… imagesizes=…>` ile hero arka planıyla birlikte erken bildir (mobil için mobil kaynak, masaüstü için masaüstü kaynak, `media` ile karşılıklı dışlayan). Boyutu doğru: `sizes="(max-width: 900px) 72px, 96px"` için 1x/2x/3x (72/144/216 px genişlik) varyantları; şu an yalnız 226w var. Gerekirse `scripts/prepare-v4-assets.mjs`'e 144w/216w AVIF/WebP çıktısı ekle (onaylı kaynaktan, yeni görsel değil).
2. Hero arka planı ile kart görseli dışında hiçbir görsel preload/eager olmasın.
3. 122'nin ilk yük JS sınırı: Claude kararıyla **200.000 bayt gzip**'e çekilir (ölçülen 189.978; asıl ölçüt Lighthouse). `verify-v4-page.mjs` ve `report-bundle.mjs --check` bu sınırla PASS olmalı. Yeni JS ekleme.
4. Kart görselinin konum/boyutu değişmez (CLS 0 korunur).

## Kabul kriterleri
- [ ] Build HTML'inde kart görseli `fetchpriority="high"` ve `loading` lazy değil (unit/verify script).
- [ ] Kart görseli için 144w ve 216w varyantları, `srcset`'te (unit).
- [ ] `node scripts/verify-v4-page.mjs` PASS (200 KB sınırıyla).
- [ ] `npm test`, lint, typecheck, build yeşil.
- [ ] Lighthouse mobil ≥ 85, LCP < 2,5 s (Claude ölçer; birden çok koşu).

## Yapılmaması gerekenler
- Görsel/tasarım değiştirme, yeni görsel üretme.
- Hero arka plan görselinin kalitesini düşürme.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
