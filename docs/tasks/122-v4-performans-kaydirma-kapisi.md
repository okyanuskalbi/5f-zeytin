# Task 122: v4 — performans, kaydırma ve kalite kapısı

## Tür
frontend

## Amaç
118–121 sonrası v4 sayfasını yayın kalitesine getirmek: LCP/CLS bütçesi, kullanılmayan v3 kodu/varlığı temizliği, hareket ve erişilebilirlik tutarlılığı. Tarayıcı ölçümleri Claude'da; bu görev ölçülebilir kodu ve betikleri hazırlar.

## Kullanılacak araçlar
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (genel yön: "Trust & Authority" + dönüşüm kalıbı), `frontend-design` (renk, yazı tipi, düzen), `motion-framer` (Framer Motion animasyonları), `shadcn-ui` (bileşen gerekirse; resmi CLI, proje token'larına uyarlanmış), 21st MCP (bileşen arama/üretme, uyarla). Coder Notu'na "Skill / nerede kullanıldı" tablosu ekle.
- **Kullanıcı isteği (22 Eki), yerleşim:** `ui-ux-pro-max` §5 "Layout \& Responsive" (mobil-first kırılımlar, yatay kaydırma yok, dokunma hedefi ≥ 44px) ve `better-layout` (yerleşim düzeltmeleri) fiilen yüklenir. `responsiveness-check` (320/375/390/430/768/1024/1440 genişlik kontrolü) tarayıcı testidir; Claude çalıştırır, sen kodu bu genişliklere göre yaz.
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

## Coder Notu

22 Ekim 2026 — **BEKLİYOR: ilk yük JS kapısı karşılanmadı.** Ölçülen değer 189.978 bayt gzip; sınır 140.000 bayt. Eşik düşürülmedi, kontrol atlanmadı. Aşağıdaki başarılı uygulama ve testler bu açık kabul maddesini TAMAMLANDI yapmaz. Kullanıcının son talimatıyla, unit/lint/typecheck/build yeşilken sonuç BEKLİYOR olarak commit ve push edilir.

### Uygulama ve ölçüm

- `scripts/report-bundle.mjs` artık çalışan sunucu, tarayıcı veya eski 098 raporu gerektirmeden `.next/server/app/index.html` ve onun gerçek build varlıklarını okur. Benzersiz modern script kaynakları/preload'ları gzip ile ölçülür; `noModule` ayrı tutulur. Inline bootstrap/RSC verisi ayrıca gösterilir; CSS ve eager görseller raporlanır. Next 16.4.2 build tablosu ilk yük boyutunu yazmadığından sayı doğrudan build çıktısından hesaplanmıştır.
- Başlangıç: **260.190 bayt gzip** (10 script). Sonuç: **189.978 bayt gzip** (8 script), **%26,98 azalma**; ham JS 608.615 bayt. CSS 71.663 bayt / 14.833 bayt gzip; inline bootstrap/RSC 177.468 bayt / 35.447 bayt gzip. Hero hariç JS + CSS + eager görsel + inline veri hesabı **240.258 bayt**. Bu, SSR kaynaklarına dayalı statik tahmindir; tarayıcının yakın alan lazy görsellerini ne zaman indirdiği ve gerçek transfer toplamı **Claude doğrulayacak**.
- Deney: varsayılan Turbopack parçalama 192.011 bayt verdi; mevcut ayar korununca 189.978 bayt çıktı. Olumsuz deney geri alındı; `next.config.ts` değişmedi.
- Landing animasyonları hafif `motion/react-m` bileşenleri ve asenkron `LazyMotion`/`domAnimation` kullanır; hero döngüsü `motion/react-mini` kullanır. Kapalı sepet, mobil menü ve toptan form diyaloğu etkileşimle yüklenir. Sepetin sürükleme/layout davranışı mevcut modülünde korunur; bu modül ilk SSR script listesinde değildir. Boy anahtarı, aynı görünüm ve SKU davranışıyla yerel radio input'larına dönüştürüldü.
- Tam onay manifesti yerine yalnız kullanılan görsellerin `alt/file/format/width/height` alanlarını içeren `lib/media/v4-assets.json` kullanılır. `node scripts/prepare-v4-assets.mjs` bu izdüşümü üretir; `check-v3-assets` onay manifestiyle birebir eşleşmesini denetler. `public/images/v3/manifest.json`, onay kayıtları, kaynaklar ve özgün görseller korundu. Önceki görevlerde kaldırılmış Pantry/KraftTag dosyaları yeniden üretilmedi; kalan kullanılmayan tesis stilleri temizlendi.
- Hero tek `img`, AVIF/WebP srcset ve karşılıklı dışlayan iki media preload'u kullanmaya devam eder. Diğer tüm sayfa görselleri lazy/async, ölçülü ve ürünler optimize AVIF/WebP çıktılarıdır. Tüm varyantlarda azami baytlar: hero masaüstü **177.776 / 180.000**, telefon **118.742 / 120.000**; ürün 01–06 sırasıyla **56.528, 44.192, 45.434, 25.240, 53.806, 55.402 / 60.000**. Ürün bütçesi varlık denetiminde 60.000 bayta indirildi; artık kullanılmayan koli varlığının arşiv bütçesi değiştirilmedi.
- Mobil çubuk scroll olaylarını tek `requestAnimationFrame` ölçümünde toplar ve unmount'ta bekleyen işi iptal eder. Nav yüksekliği ve çubuğun safe-area/padding rezervi korunur. Kaydırma kilidi/snap eklenmedi; diyalogların modal davranışı korunur.
- Hero ürün başlığı h3 → h2 oldu; güven şeridine görünmez h2 + `aria-labelledby` eklendi. Altın 2px odak rengi, radio hedefleri ≥44px ve dar grid/flex küçülmesi düzenlendi. Renk animasyonları kaldırıldı; transform/opacity/filter sınırı korundu.
- Footer alt satırı `#9AA398` oldu: ink üzerinde hesaplanan kontrast **7,12:1**. Pasif öykü metninin `.28` opaklığı **2,14:1** veriyordu; `.75` ile **6,45:1** (başlık **7,56:1**) oldu. Fotoğraf üstündeki gerçek kontrastı ve klavye odağını **Claude doğrulayacak**.
- Fraunces'ın `swap` ve ayarlı Times New Roman fallback'i korundu. Figtree için Next'in `calculateSizeAdjustValues("Figtree")` çıktısıyla açık Arial fallback'i eklendi: ascent **94,32%**, descent **24,82%**, size-adjust **100,72%**. Build CSS'inde iki ayarlı fallback de doğrulandı. Gerçek font kayması ≤0,02 **Claude doğrulayacak**.
- `BusinessJsonLd` korundu. `FAQPage` doğrudan görünen üç soru/cevaptan üretilir; temsili fiyatlarla Product/Offer eklenmez. **Plan varsayımı uyuşmazlığı:** task'ın “canonical/robots/sitemap mevcut” ifadesine karşılık ana sayfa canonical'ı, robots.txt ve sitemap.xml kaynakta/build'de bulunmadı. İç sayfaların mevcut noindex ayarları korundu; planı değiştirmeme kuralı gereği yeni SEO route/kararı eklenmedi. Bu mevcut eksik de denetçiye aktarılır.

### Komutla doğrulama

| Komut / kontrol | Sonuç |
|---|---|
| `npm test -- --maxWorkers=2 --coverage` | PASS — 31 dosya, **348/348** unit testi. Mevcut `app/**` coverage kapsamı: satır %88,70; statement %83,78; branch %84,21; function %90,47. |
| `node --test scripts/check-v3-assets.test.mjs` | PASS — **7/7**; sahte SHA, hero/ürün bütçe aşımı, eski kiler verisinin runtime'a geri eklenmesi ve tesis değişiklikleri reddedilir. |
| `npm run lint` | PASS — sıfır uyarı/hata. |
| `npm run typecheck` | PASS — e2e dosyası dahil derlenir; tarayıcı çalışmaz. |
| `npm run build` | PASS — prebuild varlık/onay/hash denetimleri dahil. |
| `node scripts/report-bundle.mjs` | PASS — yukarıdaki gerçek boyut raporu. `--check` eklendiğinde JS sınırı nedeniyle FAIL. |
| `node scripts/verify-v4-page.mjs` | **FAIL — yalnız ilk yük JS 189.978 > 140.000**. Öncesindeki gerçek build HTML kontrolü: 6 kart, 3 adım, 3 FAQ, tek görünür önizleme notu, anchor'lar, preload/srcset, lazy/async ve width/height PASS; görsel ve runtime kontrolleri PASS. |
| `rg -n -e Pantry -e KraftTag -e kiler-duvar -e raf-ceviz -e kraft-doku -e kargo-kolisi app components lib` | Runtime taramasında eşleşme yok. Aynı kural unit kapısında da uygulanır. |
| `git diff --check` | PASS. |

TDD kanıtı: ilk scroll testi 20 scroll'da 20 ek ölçüm yakalayarak RED verdi; rAF toplamasıyla GREEN oldu. Eksik offline kapı için testler önce yazıldı. Build HTML'inde görünür önizleme notunu inline RSC metniyle iki kez sayma hatası ayrıca RED ile üretildi; script/style metinlerini görünür kopyadan ayıran düzeltmeyle GREEN oldu. Unit kapısı gerçek SSR'yi ve bozulmuş preload/kart/adım/not/anchor/ölçü/lazy/PNG örneklerinin reddini sınar. RED/ara commit push edilmez.

### Skill / nerede kullanıldı

| Skill / araç | Fiili kullanım |
|---|---|
| `ui-ux-pro-max` | SKILL ve §5 Layout & Responsive okundu; yerel aramada `trust-authority-conversion` ve yatay taşma eşleşmeleri incelendi. Onaylı D yönü korundu; küçülebilen grid, sarılabilen radio hedefleri ve safe-area rezervi gözden geçirildi. |
| `frontend-design` | Onaylı `docs/DESIGN.md` ile renk, Fraunces/Figtree ve sayfa akışı korundu; yeni tasarım yönü üretilmedi. |
| `motion-framer` + `motion-foundations/patterns/advanced` | Hafif/asenkron Motion yüklemesi, reduced-motion, pasif scroll/rAF ve cleanup; sepetin ayrı drag/layout sınırı. |
| `shadcn-ui` | SKILL okundu; resmi `npx shadcn@latest view button dialog` çalıştırıldı. Mevcut token'lı Button/Dialog korunarak kapalı içerik ayrı yüklenen modüllere taşındı. Yeni runtime bağımlılığı eklenmedi. |
| 21st MCP | Bu oturumun araç envanterinde erişilebilir 21st MCP yoktu. AGENTS.md uyarınca kaydedildi; yeni bir UI şablonu üretilmedi, mevcut bileşenler kullanıldı. |
| `better-layout` | `minmax(0, …)`, `min-width`, sarma ve sabit katman rezervlerinin kaynak kontrolü; 320/375/390/430/768/1024/1440 genişlikleri e2e'ye yazıldı. Görsel/reflow kabulü Claude'da. |
| `performance-optimization` + `web-perf` | Önce/sonra build ölçümü, gerçek gzip, preload ve bağımsız görsel bütçeleri; olumsuz parçalama deneyi geri alındı. Tarayıcı izi alınmadı. |
| `vercel:react-best-practices` | `bundle-dynamic-imports` ve `client-passive-event-listeners` kuralları uygulandı; kapalı modüller ilk yükten çıkarıldı. |
| `better-accessibility` | Başlık/section semantiği, yerel radio, hedef boyutu, odak rengi, kontrast, reduced-motion ve modal odak dönüşü. |
| `verification-loop` | Build, typecheck, lint, unit+coverage, varlık negatifleri ve diff incelemesi. |
| `audit-ai-design-slop` | SKILL + ilgili ARTICLE bölümleri okunarak aşağıdaki kaynak temelli checklist uygulandı. |
| `tdd-workflow` | RED/GREEN scroll ve görünür RSC sayımı; gerçek SSR ve negatif kalite kapısı örnekleri. |

### audit-ai-design-slop checklist

| Durum | Öncelik / bulgu | Kanıt ve sonuç |
|---|---|---|
| [x] | P1 — okunurluk | `Story.module.css` pasif metin .28 → .75; footer eski gri → #9AA398. Kaynak renk hesabı yukarıda; gerçek görüntü Claude'da. |
| [x] | P1 — semantik gezinme / odak | Hero h1→h3 atlaması ve güven şeridinin başlık ilişkisi düzeltildi; native boy seçimi ve altın focus halkası. |
| [x] | P1 — gereksiz ilk yük / hareket işi | Kapsamsız onay manifesti runtime'dan çıktı; kapalı modüller ertelendi; scroll başına ölçüm rAF ile toplandı. JS bütçesi hâlâ FAIL olarak raporlanır. |
| [x] | Tekrarlı görünür açıklama | Tek önizleme notu korundu; bootstrap/RSC tekrarları görünür içerik sanılmıyor. |
| [x] | Dekoratif istif / kart tekrarı | Koyu kartlar, radial parıltı, fotoğraf scrim'i ve öykü numaraları onaylı D tasarımının parçası; sırf bir tekniğe benziyor diye değiştirilmedi. |
| [ ] | Teyit gerektiren kanıt metni | Onaylı tasarımdaki “En çok alınan”, “aynı gün dönüş” ve teslimat ifadelerinin gerçek işletme/satış kanıtı bu görevde doğrulanmadı; metin/düzen değiştirmeme sınırı korundu. |
| [ ] | Tarayıcı kapsamı | Taşma/kesilme, başlıkların ≤2 satır olması, 200% metin, odak akışı, gerçek kontrast, LCP/CLS ve reduced-motion görünümü **Claude doğrulayacak**. Kaynak incelemesi görsel kabul diye raporlanmadı. |

En yüksek getirili kalan düzeltme, **140 KB ilk yük JS kapısını karşılamak**. Lighthouse ≥85, LCP <2,5 s, CLS <0,1, font CLS ≤0,02 ve A11y ≥95 için hiçbir ölçüm sonucu uydurulmadı. `tests/e2e/v4-quality-gate.spec.ts` yazıldı; 7 genişlik, ileri/geri çerçeve geçişi, bar/portal etkileşimleri, reduced-motion ve metin büyütme senaryoları hazır. **Playwright, Lighthouse, inspect, ekran görüntüsü veya tarayıcı çalıştırılmadı.** Bu maddeler Claude doğrulayacak; BEKLİYOR'un nedeni tarayıcı testlerinin devri değil, açık JS kapısıdır.

## Durum: BEKLİYOR

## Claude denetimi (22 Eki)
- Canlıda (2ca0464) Lighthouse mobil: Performance 82/84, A11y 100, BP 100, SEO 100, CLS 0, TBT 20 ms, LCP 4,3–4,5 s.
- 140 KB JS sınırı Claude'un tahmini eşiğiydi. Ölçülen 190 KB ile TBT 20 ms; JS darboğaz değil. Sınır 125'te 200 KB'a çekildi.
- LCP sorunu hero kartındaki lazy teneke görseli → 125.
- canonical/robots/sitemap eksikliği not edildi; SEO görevi ayrıca açılacak.
- Bu görevin kalan kabulü 125'e devredildi.

## Durum: TAMAMLANDI (Claude kabulü, kalan madde 125'te)
