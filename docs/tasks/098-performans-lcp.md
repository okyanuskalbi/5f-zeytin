# Task 098: Mobil performans — LCP < 2.5 s, Lighthouse ≥ 85

## Tür
frontend

## Amaç
097 ölçümü: Lighthouse mobil 80, LCP 4.85 s (hedef < 2.5 s, ≥ 85). Ayrıca Firefox 320px sepet odak testi (baseline'da da başarısız) düzeltilecek.

## Bağlam
`docs/mobil-analiz-097.md`, `test-results/097/lighthouse-final*.json` (LCP öğesi ve kritik yol oradan okunur). Hero: 086 ScrollFrameSequence (zeytinlik) + 091 etiket kartı. Fontlar next/font (Fraunces opsz/SOFT, Figtree).

## Kullanılacak araçlar
- ECC skill: performance (react-performance), nextjs-turbopack, verification-loop; `vercel-react-best-practices`; `chrome-devtools-mcp:debug-optimize-lcp`

## Adımlar
1. Lighthouse JSON'dan LCP öğesini ve gecikme dökümünü (TTFB / yükleme gecikmesi / yükleme süresi / render gecikmesi) çıkar; her düzeltmeden sonra yeniden ölç.
2. Hero posteri LCP adayıdır: 390–430 px için ≤ 60 KB AVIF + WebP yedek, `fetchpriority="high"`, `<link rel=preload as=image imagesrcset>`; masaüstü için ayrı boyut. Poster SSR'da görünür; kare dizisi yalnız `requestIdleCallback`/ilk etkileşim sonrası ve hero görünürken yüklenir; mobilde ilk 10 kareden fazlası önceden çekilmez.
3. Etiket kartı metni LCP olabilir: font `display: swap`, yalnız kullanılan ağırlıklar/eksenler; Fraunces için `adjustFontFallback`; kritik CSS'te layout kayması yok.
4. JS: Lenis/Motion/scroll bileşenlerini hero sonrası lazy (dynamic import, `ssr:false` sadece etkileşim katmanı); üçüncü taraf yok; bundle analizi raporu.
5. Görseller: tüm `<Image>`/`<img>` doğru `sizes`, lazy (hero hariç); toptan/tesis/footer görselleri ekran dışında.
6. Firefox 320px sepet odak testi: kök neden (drawer odak tuzağı/kaydırma) düzelt; testi gevşetme.

## Kabul kriterleri
- [ ] Lighthouse mobil (yerel, simulated throttling, 3 ölçüm medyanı): Performans ≥ 85, LCP < 2.5 s, CLS < 0.1, A11y ≥ 95 — `test-results/098/`
- [ ] Firefox 320px sepet odak testi geçer; tam e2e geçer
- [ ] Görsel kalite: hero posteri iPhone 14 ekran görüntüsünde bulanık/pikselli değil
- [ ] lint/typecheck/build

## Durum: BEKLİYOR
