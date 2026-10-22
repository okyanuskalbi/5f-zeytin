# Task 122: v4 — performans, kaydırma ve kalite kapısı

## Tür
frontend

## Amaç
118–121 sonrası v4 sayfasını yayın kalitesine getirmek: LCP/CLS bütçesi, kullanılmayan v3 kodu/varlığı temizliği, hareket ve erişilebilirlik tutarlılığı. Tarayıcı ölçümleri Claude'da; bu görev ölçülebilir kodu ve betikleri hazırlar.

## Kullanılacak araçlar
- Skill: `performance-optimization`, `web-perf`, `vercel:react-best-practices`, `better-accessibility`, `verification-loop`, `audit-ai-design-slop` (checklist'i sayfaya uygula, bulguları Coder Notu'na yaz).

## Adımlar
1. **LCP**: hero görseli tek `<img>` + `srcset` AVIF/WebP, `fetchpriority=high`, preload yalnız hero için; diğer tüm görseller `loading=lazy` + `decoding=async`; ürün PNG'leri AVIF/WebP'e çevrilmiş çıktılar (manifest) kullanılır, ham PNG runtime'da yok. Hero masaüstü ≤ 180 KB, telefon ≤ 120 KB; ürün görseli ≤ 60 KB/adet; toplam ilk yük (JS+CSS+görsel, hero hariç) ≤ 450 KB. `scripts/report-bundle.mjs` çıktısını Coder Notu'na yaz.
2. **CLS**: her görsel `width/height` ya da `aspect-ratio`; nav sabit yükseklik; mobil çubuk `padding-bottom` ile rezerve; font `size-adjust`/`font-display: swap` kayması ≤ 0.02 (Fraunces/Figtree fallback metrikleri `app/layout.tsx`'te).
3. **JS**: `motion` kullanımları `LazyMotion` + `domAnimation` ile; sayfa düzeyinde ilk yük JS ≤ 140 KB gzip (Next build çıktısı). Kullanılmayan bileşen/stil/varlık referansı sil (`_legacy` hariç): `Pantry*`, `KraftTag`, `V3Foundation.module.css` kiler kısımları, `kiler-duvar`, `raf-ceviz`, `kraft-doku`, `kargo-kolisi` runtime referansları. Manifest/onay dosyaları ve `zeytin-v3-gorseller` **silinmez** (onaylı kaynak), yalnız runtime'dan çıkar; `check-v3-assets` buna göre güncellenir.
4. **Hareket**: yalnız transform/opacity/filter; `prefers-reduced-motion`'da Ken Burns, reveal, paralaks, çerçeve scale yok, çerçeve geçişi yalnız opacity. Scroll dinleyicileri `passive`, `requestAnimationFrame` ile tek yazıcı; hiçbir bölümde scroll kilidi/snap yok.
5. **Erişilebilirlik**: başlık sırası h1 → h2 → h3; her bölüm `aria-labelledby`; odak halkası altın 2px tüm etkileşimlilerde; dokunma hedefleri ≥ 44px; kontrast tüm metinlerde ≥ 4.5:1 (gri `#B9C0B6` ink üstünde geçer; `#7E867C` yalnız 12px alt satırda, bunu `#9AA398`'e çek). Dil `lang="tr"`; `alt` metinleri gerçek içerik (ürün adı + boy), dekoratifler boş.
6. **SEO/AEO**: `BusinessJsonLd` korunur; `FAQPage` yalnız görünen 3 soru; `Product` şeması 6 varyant için `offers` temsili fiyatla **eklenmez** (gerçek fiyat gelene kadar); canonical/robots/sitemap mevcut.
7. **Kapı betiği**: `scripts/verify-v4-page.mjs` (mevcut `verify-v3-page.mjs` kalıbı): HTML'de hero preload, 6 kart, 3 adım, önizleme notu 1 kez, anchor id'leri, görsellerde width/height; `npm test` içine unit düzeyinde eklenir (tarayıcı gerektirmez). Playwright `tests/e2e/v4-quality-gate.spec.ts` yaz (çalıştırma): 390/768/1440 başlık ≤ 2 satır, yatay taşma 0, çubuk davranışı, çerçeve geçişi, reduced-motion.

## Kabul kriterleri
- [ ] Build çıktısında ana sayfa ilk yük JS ≤ 140 KB gzip; Coder Notu'nda sayı (unit/komut).
- [ ] Hero ve ürün görsel bütçeleri `verify-v4-page.mjs` ile doğrulanır (unit).
- [ ] Runtime'da v3 kiler varlık referansı yok (grep ile unit).
- [ ] Lighthouse mobil ≥ 85, LCP < 2,5 s (sim), CLS < 0,1, A11y ≥ 95 (Claude ölçer; ölçüm eşiğini bilerek kodla).
- [ ] `audit-ai-design-slop` checklist bulguları Coder Notu'nda, giderilenler işaretli.
- [ ] `npm test`, lint, typecheck, build yeşil.

## Yapılmaması gerekenler
- Tasarım kararı değiştirme (renk/düzen/metin) — yalnız kalite.
- Onaylı kaynak dosya silme; `docs/` değiştirme (yalnız Coder Notu/Durum).
- Yeni bağımlılık ekleme (gerekçe yoksa).

## Durum: BEKLİYOR
