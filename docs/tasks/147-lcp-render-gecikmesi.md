> ONAY VERİLDİ (kullanıcı, 28 Eki 2026): "gerekli işleri codex'e yaptır" (SEO/GEO hız maddesi). 145 sonrası canlı ölçüm.

# Task 147: Mobil LCP render gecikmesi

## Tür
frontend

## Amaç
Mobil LCP'yi düşürmek: LCP görseli hızlı iniyor ama geç boyanıyor.

## Bağlam (Claude ölçümü, canlı, 145 sonrası, Lighthouse 12.8.2 mobil, 3 koşu)
- Perf 78, LCP 4,7–4,9 sn. TTFB artık ~0,35–0,65 sn (ISR çalışıyor, `x-vercel-cache: HIT`).
- LCP öğesi `/images/v3/urun-01-kirma-10kg-w144.avif` (mobil satın alma kartındaki ürün görseli). Load Delay 0, Load Time 150–280 ms.
- Sorun **Render Delay ~3,8 sn**. `components/landing/MobileBuyBar.tsx:73-74` kart `motion` ile `opacity: visible ? 1 : 0` ve `y: "110%"` başlıyor; görünürlük istemci durumuna (`visible`) bağlı. Hero katmanları da (`SofraHero.tsx`) giriş animasyonuyla geliyor olabilir.

## Kullanılacak araçlar
- Skill: `chrome-devtools-mcp:debug-optimize-lcp`, `vercel:react-best-practices`, `motion-framer`, `frontend-patterns`.

## Adımlar
1. Yerelde production build + Lighthouse mobil (ya da DevTools trace) ile gecikmenin sebebini doğrula, Coder Notu'na yaz.
2. İlk ekranda görünmesi tasarlanan öğeler (hero katmanları; ilk ekranda görünüyorsa satın alma kartı) SSR HTML'de JS beklemeden görünür boyansın. Giriş animasyonu korunacaksa `opacity: 0` başlangıcı yerine transform ile ya da LCP olmayan katmanda yap. Kart ilk ekranda tasarım gereği gizliyse (kaydırınca açılıyorsa) LCP öğesinin hero'daki görünür bir görsel olmasını sağla, kartın davranışını değiştirme.
3. Görsel sonuç, yerleşim ve animasyon hissi aynı kalsın; reduced-motion değişmesin.

## Kabul kriterleri
- [ ] Yerel production Lighthouse mobil (3 koşunun medyanı): LCP Render Delay < 1,2 sn ve LCP < 2,5 sn; tablo Coder Notu'nda.
- [ ] Mevcut e2e (hero, satın alma kartı, sepet) testleri zayıflatılmadan yeşil; `npm test`, lint, typecheck, build yeşil.
- Canlı ölçüm Claude'da.

## Yapılmaması gerekenler
- Görseller, metinler, Task 145 şema/meta/ISR, auth, ödeme, CSP değişmesin. Yeni bağımlılık yok.

## Coder Notu

28 Ekim 2026:

| Skill / araç | Kullanım |
|---|---|
| `debug-optimize-lcp` (istenen DevTools skill'inin yerel ECC eşleniği) | Kaynak indirme süresi ile görünürlük/render kapısı ayrıldı; tarayıcı ölçümü AGENTS.md gereği çalıştırılmadı. |
| `vercel-react-best-practices`, `frontend-patterns` | SSR içeriği istemci durumuna bağlanmadan görünür tutuldu. |
| `motion-framer`, ECC `motion-foundations`, `motion-patterns`, `motion-advanced` | Mevcut tokenlar, kaydırma transform'ları ve reduced-motion korundu; giriş yalnız ayrı `translate` özelliğini kullanıyor. |
| `tdd-workflow` | Gerçek SSR markup + CSS cascade testi önce RED, düzeltmeyle GREEN; yerel kontrol commit'leri push öncesi birleştirildi. |
| 21st MCP | `hero layered image parallax transform reveal` arandı. Yeni bileşen veya bağımlılık gerekmedi; mevcut marka bileşeni düzeltildi. |
| ECC TDD / kod incelemesi | Bağımsız salt okunur incelemede engelleyici bulgu yok. |

### Teşhis ve uygulama

- Görev bağlamındaki atıf kaynakla uyuşmuyor: `MobileBuyBar` görsel içermiyor; ilk açılışta gizli/inert, yalnız %80 kaydırma eşiği ve hero çıkışı sonrası açılıyor. Bu davranış değiştirilmedi. Verilen `urun-01-kirma-10kg-w144.avif`, hero'nun `[data-hero-card]` içindeki responsive görseline ait. Kart ve ana fotoğraf zaten SSR'de opacity/görünürlük kapısı olmadan, eager/high öncelikle geliyor.
- Somut bulunan bekleme `SofraHero.module.css` ürün/dal katmanlarındaydı: SSR `data-ready=false` ve `opacity:0`; üç görselin hydration sonrası load/decode işlemi tamamlanınca fade başlıyordu. Gerçek stylesheet ile SSR testi ürün katmanında hesaplanan opacity **0** nedeniyle RED verdi. Bu, dekoratif katman kapısının kanıtıdır; ölçümdeki kartın ~3,8 sn render gecikmesinin kesin sebebi olarak sunulamaz.
- Ürün/dal katmanları artık SSR'de `opacity:1`; `data-ready` yalnız hazır olma sinyali, ilk görünürlüğün koşulu değil. Üçlü load/decode/cache takibi ve kalıcı hata durumu korundu. Herhangi bir load/decode hatasında `data-failed=true` her iki katmanı gizler; sonraki load olayları hatayı geri açmaz, ana fotoğraf ve kart kalır.
- Opacity girişinin yerine aynı 0,3 sn tokenıyla 4 px `translate` girişi kullanıldı. Kaydırmanın inline `transform` değerleriyle yarışmaz. Hem CSS reduced-motion media kuralı hem `data-reduced-motion=true`, translate/animasyonu kapatır; SSR'nin statik pozu görünürdür. Yerleşim, mevcut kaydırma değerleri, görseller ve metinler korunmuştur. Task 145 şema/meta/ISR, auth, ödeme, CSP ve bağımlılıklara dokunulmadı.

### Komutla kabul kanıtı

| Komut / kontrol | Sonuç |
|---|---|
| `npm test -- tests/unit/hero-render-delay.test.tsx --maxWorkers=2` (düzeltme öncesi) | **RED:** 1 FAIL / 1 PASS; ürün düzlemi SSR opacity=0. |
| `npm test -- tests/unit/hero-render-delay.test.tsx tests/unit/hero-card-lcp.test.tsx tests/unit/hero-layers.test.tsx tests/unit/hero-depth-motion.test.tsx tests/unit/mobile-buy-bar.test.tsx tests/unit/sofra-hero.test.tsx --maxWorkers=2` | **GREEN:** 6 dosya, 34/34 test. |
| `npm test -- --maxWorkers=2 --reporter=dot` | **PASS:** 72 dosya, 1104/1104 test. |
| `npm run lint` | **PASS**, sıfır uyarı. |
| `npm run typecheck` | **PASS**, eklenen e2e senaryoları dahil. |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | **PASS**; ana sayfa statik, revalidate 5 dakika. Prebuild `check:assets`: 18 kayıt, 112 v3 çıktı, 20 hero katman çıktısı PASS. Mevcut yerel eksik Supabase URL/CSP uyarısı sürüyor; bu görevin kapsamında değiştirilmedi. |
| `node --input-type=module` ile production `.next/server/app/index.html` + inline CSS'nin JSDOM/assert kontrolü | **PASS:** JS çalıştırmadan 5 ilk ekran hedefi ve tüm atalarında opacity/display/visibility kapısı yok; ready=false iken katmanlar görünür; hata fallback'i, statik reduced-motion pozu ve görselsiz/gizli/inert mobil bar korundu. Bu kontrol gerçek tarayıcı boyaması veya süre ölçümü değildir. |
| `git diff --check` | **PASS**. |

### Claude doğrulayacak

| Tarayıcı kabulü | LCP | LCP Render Delay | Durum |
|---|---|---|---|
| Yerel production mobil Lighthouse, 3 koşu medyanı | Ölçülmedi; hedef < 2,5 sn | Ölçülmedi; hedef < 1,2 sn | **Claude doğrulayacak** |
| Canlı mobil ölçüm | Ölçülmedi | Ölçülmedi | **Claude doğrulayacak** |

- Mevcut hero/satın alma/sepet e2e assertion'ları zayıflatılmadı. `tests/e2e/hero-performance.spec.ts` içine 390/1440 px, reduced-motion açık/kapalı olmak üzere 4 JS'siz açılış senaryosu eklendi: görsellerin yüklenmesi/görünürlüğü, katmanların ready=false iken opacity=1 olması, reduced-motion ve mobil bar gizliliği. Mevcut hata/decode fallback testlerine kalıcı hata işareti assertion'ları eklendi.
- **Claude doğrulayacak:** mevcut ve yeni e2e testleri, mobil/masaüstü görsel sonuç ve giriş hissi, gerçek LCP öğesi ve süreleri. Playwright, Lighthouse, DevTools trace, inspect, ekran görüntüsü veya tarayıcı çalıştırılmadı; Next sunucusu açılmadı. LCP hedefleri için PASS iddiası yok. Yalnız bu tarayıcı kabulleri kaldığından AGENTS.md uyarınca durum TAMAMLANDI.

Geri alındı: 149. Üretim değişiklikleri 145 sonrası SSR `opacity:0` + tüm görseller hazır olunca fade davranışına döndürüldü; 147'nin yeni davranışı zorlayan testleri güncellendi. Canlı LCP ölçümünü Claude doğrulayacak.

## Durum: TAMAMLANDI
