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

## Coder Notu

22 Ekim 2026: Hero kartı `loading="eager"`, `fetchpriority="high"`, `decoding="async"` oldu. Onaylı teneke kaynağının aynı alpha kırpımından mobil 72/144/216 px, masaüstü 96/192/288 px AVIF/WebP türevleri hazırlandı. Arka plan ve kart için ayrı, karşılıklı dışlayan mobil/masaüstü preload çiftleri, picture ile aynı `srcset`/`sizes` değerlerini kullanıyor. Diğer görseller lazy kalıyor. CSS, mevcut görsel dosyaları ve hero arka plan kalitesi değiştirilmedi; kartın 72×92 / 96×118 px alanları korundu.

Kart türevlerinin manifesti yalnız sunucu Hero bileşenine alınarak istemcinin kullandığı `v4-assets.json` korundu. Yeni istemci kodu/bağımlılığı eklenmedi. Her iki kontrol scripti aynı 200.000 bayt gzip JS sınırını uyguluyor; 450.000 bayt toplam aktarım sınırı korunuyor.

| Skill | Nerede kullanıldı |
|---|---|
| `performance-optimization` | Task'taki LCP bulgusuna yönelik erken keşif ve küçük türevler; build bayt bütçeleri ve mevcut dosyaların korunması kontrol edildi. |
| `web-perf` | LCP kaynağının SSR'de eager/high olması ve preload/picture eşleşmesi denetlendi; tarayıcı ölçümü Claude'a bırakıldı. |
| `vercel:react-best-practices` → yerel `vercel-react-best-practices` | Kaynak bildirimleri Server Component'te tutuldu; kart manifesti istemci paketine eklenmedi. |
| `tdd-workflow` | Önce RED, sonra GREEN; SSR, gerçek türev ölçüleri/alpha, bozuk preload/öncelik ve bütçe sınırları için regresyon testleri. |
| `ui-ux-pro-max` | Yerel UX aramasındaki Image Optimization / Content Jumping rehberleriyle responsive srcset ve ayrılmış görsel alanı korundu. |
| `frontend-design` | Onaylı görünüm, metin, tipografi, renkler ve kart yerleşimi korunarak yalnız yükleme davranışı değiştirildi. |

Skill'ler mevcut yerel kurulumlardan okundu; yeni skill kurulmadı. 21st MCP araması denendi; yeni UI bileşeni gerektirmeyen bu görevde mevcut Hero/V3Picture kullanıldı.

Komutla doğrulama:

- RED: `npm test -- tests/unit/hero-card-lcp.test.tsx --maxWorkers=2` → 5 beklenen hata; `npm test -- tests/unit/v4-quality-gate.test.tsx --maxWorkers=2` → 6 beklenen hata, 13 PASS. Yerel RED checkpoint'i son commit'te birleştirildi; RED/ara commit push edilmedi.
- GREEN: `npm test -- --maxWorkers=2` → 34 dosya, **388 test PASS**. Kartın eager/high/async HTML'i, iki formatta mobil/masaüstü yoğunlukları ve gerçek dosya genişlikleri/alpha doğrulandı. Eksik/uyuşmayan preload, lazy/düşük öncelikli kart, eksik yoğunluklar ve hero dışı yüksek öncelik reddediliyor.
- `node --test scripts/check-v3-assets.test.mjs` → **7 test PASS**.
- `npm run lint`, `npm run typecheck`, `npm run build` → **PASS**.
- `npm run check:assets` → **PASS**; 18 görsel ve 112 v3/tesis çıktısı, özgün ONAY.md kayıtları, SHA, ölçü, alpha, oran ve bayt bütçeleriyle doğrulandı.
- `node scripts/verify-v4-page.mjs` → **PASS**; build HTML'inde yalnız arka plan/kart eager ve dört media eşleşmeli preload var. Mobil kart srcset'inde 144w/216w mevcut.
- `node scripts/report-bundle.mjs --check` → **PASS**; ilk yük JS **190.090 / 200.000 bayt gzip**, inline script ve CSS ile raporlanan hero arka planı hariç ilk aktarım **247.679 / 450.000 bayt**. Önceki yerel build ile sekiz JS chunk'ının yolları ve bayt değerleri aynı.
- `4a4ad2c` tabanıyla komut karşılaştırması: mevcut tüm kaynak/onay/kırpım/çıktı kayıtları, CSS, ortak runtime manifesti ve bağımlılık dosyaları korundu.

Tarayıcı kabulü: **Claude doğrulayacak**. Playwright/Lighthouse/inspect/ekran görüntüsü çalıştırılmadı. `tests/e2e/hero-performance.spec.ts` içine mobil/masaüstü 3x kaynak seçimi, tek kart isteği, etkin preload ve sabit ölçü kontrolleri yazıldı; çalıştırılmadı. Lighthouse mobil ≥85, LCP <2,5 s ve CLS 0 sonucu burada ölçülmüş kabul edilmez. Tarayıcı dışındaki tüm istenen adımlar tamamlandı.

## Durum: TAMAMLANDI
