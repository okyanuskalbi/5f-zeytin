# Task 037: Sepet sayfası

## Tür
frontend

## Amaç
Sepet sayfasını drawer ile aynı veri kaynağına bağla.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 035 (cart-state). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — cart page
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/sepet/page.tsx` (oluştur / düzenle)
- `components/cart/CartSummary.tsx` (oluştur / düzenle)
- `tests/e2e/cart-page.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Boş/dolu/stok değişti durumları; gerçek fiyatın sunucudan yenilenmesi; kupon ve ödeme için erişilebilir alanlar.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/cart-page.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- PLAN, AGENTS ve Task 035/036/055 okundu; 035 ve 036 tamamlanmış, başlangıçta `main` çalışma ağacı temizdir. Frontend, erişilebilirlik ve TDD skill'leri kullanılıyor. 21st MCP `Checkout Summary` (36084, astralyxdev) kodu incelendi; bilinmeyen ücretleri sıfır göstermeyen özet yapısı marka tokenlarına uyarlanacak.
- Başlamadan saptanan sınır: `getProducts()` halen Task 030'un temsili kataloğunu döndürüyor. Gerçek katalog Task 029, sunucu fiyat/kupon quote bağlantısı Task 054/055 ve ödeme alanı Task 046 kapsamındadır. Bu görev backend/DB/ödeme uygulamasına yetki vermez. Gerçek fiyat yenilemesi doğrulanamayacağı için uygulanabilen frontend ve testler teslim edilecek; durum BEKLİYOR kalacak.
- RED: üretim kodundan önce E2E ve test fixture'ları yazıldı. `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/cart-page.spec.ts --config .cache/task-037/playwright.config.ts --project chromium-320 --grep 'route loads'` → **exit 1**, test gerçekten çalıştı; `/sepet` için beklenen 200 yerine **404** aldı. İlk tarayıcı başlatmasındaki macOS MachPort kısıtı süreç izniyle giderildi; bu ortam hatası RED sayılmadı. 3004 portundaki mevcut sürece dokunulmadı; kabul için ayrı 3037 portu kullanılıyor.
- İlk GREEN: RED ile aynı komut → **exit 0; 1/1, 1,6 sn**. Gerçek `/sepet` route'u 200, katalog fiyatı, yerel kayıttaki sahte fiyatı yok sayma, adet düzenleme, RSC sunucu yenileme isteği ve yenileme sonrası adet korunması doğrulandı. `npm run lint && npm run typecheck && npm run build` → **exit 0**; 14/14 varlık kontrolü, Next.js 16.4.2 build ve dinamik `/sepet` başarılı. Tam tarayıcı matrisi henüz çalıştırılmadı.

### Teslim edilen frontend

- `app/sepet/page.tsx`: `connection()` sonrasında mevcut `getProducts()` kaynağını sunucuda okur. `router.refresh()` aynı route'u yeniden ister; yerel adetler korunur. Katalog okuma hatası, boş katalogdan ayrı `null` durumu olarak gösterilir; okunmamış sepet boş veriyle ezilmez. Sayfa arama indeksine kapalıdır.
- `CartSummary`: 035 store'unu `useSyncExternalStore` ile tüketir; adet/stok sınırları, silme ve başlığa güvenli odak dönüşü, boş/dolu/katalog hatası, localStorage hatası ve yeniden deneme, eksik ürün/güncel stok uyarısı ve kullanıcının stok değişikliklerini uygulaması. Saklanan veri yalnız ürün ID/adettir; fiyat katalog prop'undan gelir. Tahmini kuruş bazlı ara toplamın yanında kargo ve indirimlerin bilinmediği açıkça yazılır; nihai tutar hesaplanmaz.
- Sayfa şu an route içinde bir store sahibi oluşturur; bileşen drawer ile aynı store örneğini alabilir ve bu paylaşım E2E'de doğrulanır. Uygulamadaki global provider, navbar/ürün bağlantısı ve route'lar arası tek sahip Task 038'in işidir; layout/navbar/store değiştirilmedi.
- [21st Checkout Summary](https://21st.dev/@astralyxdev/components/checkout-summary) semantik tutar satırları ve bilinmeyen ücret yaklaşımı uyarlandı; varsayılan stiller/ücret oranları kullanılmadı. Mevcut AFİNA Button ve zeytin/fildişi/altın tokenları kullanıldı; yeni shadcn bileşeni/paket/skill veya animasyon eklenmedi. `motion-reduce` davranışı mevcut Button'dan korunur. Next.js'in yerel page/use-client/connection/use-router/Playwright belgeleri okundu.
- `tests/e2e/fixtures/cart-page.{html,tsx}` yalnız test yardımcılarıdır; gerçek CartSummary, CartDrawer, store ve CSS'i Vite ile paketler. Fixture katalog/failure kontrolleri uygulamaya veya public route'a eklenmedi. Kupon alanı açıklamalı salt okunur, uygulama/ödeme düğmeleri devre dışıdır; açık olmayan akışlar başarılıymış gibi gösterilmez.

### Nihai komut kabulü — 20 Ekim 2026

| Komut / garanti | Sonuç |
| --- | --- |
| `CART_PAGE_COVERAGE=1 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/cart-page.spec.ts --config .cache/task-037/playwright.config.ts` | **exit 0; 108/108, 31,9 sn**. Chromium/Firefox/WebKit × 320/390/768/1440; 12 gerçek route testi + 96 bileşen testi. 0 başarısız, 0 atlanan, 0 flaky; her test tek deneme. Hedef `localhost:3037`; mevcut 3004 süreci korunur. |
| Normal ve stok senaryoları | Gerçek route 200 ve sunucu RSC yenileme isteği; katalogdan fiyat, sahte yerel fiyatı yok sayma, adet alt/üst sınırı, kuruş bazlı tahmin, drawer ile aynı store'da çift yönlü düzenleme, reload sonrası adet, silme/boş durum; yenilenen katalog prop'uyla fiyat/stok değişikliği, kayıp ürün ve açık stok uzlaştırma **PASS**. |
| Hata ve erişilebilirlik | Katalog hatası/yeniden deneme, okunmamış sepeti koruma, hata sonrası eski fiyatı gizleme, bozuk/engellenen/yazılamayan localStorage, bellekte düzenleme/toparlanma ve adet hatası; klavye sırası/Enter, görünür odak, silme/uzlaştırmada başlığa odak, ilişkili kupon/ödeme açıklamaları, normal + reduced-motion **PASS**. |
| Responsive | Altı uzun satır, tüm genişliklerde 480 px kısa ekran, yatay taşma olmaması, kaydırarak erişilen ödeme alanı ve ≥44 px kontrol hedefleri **PASS**. Firefox'un 43,999998 px ölçümü 0,01 px hassasiyetle yuvarlanır; hedef boyutu küçültülmedi. |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**; son stok düzeltmesi dahil ESLint sıfır uyarı, TypeScript, Next.js 16.4.2 production build ve dinamik `/sepet` başarılı. Varlık kontrolü **14/14 PASS**. |
| `npm run test` | **exit 0; 126/126**, 4 dosya; mevcut sepet store regresyonları dahil. |
| `node .cache/task-037/check-coverage.mjs .cache/task-037/results.json` | **exit 0**; 32 Chromium V8 kaydı/source map ile fixture'da paketlenen gerçek CartSummary kodu: satır/statement/fonksiyon **%100**, dal **%95,91**; dört eşik ≥%80. Tree-shaking ile fixture'dan çıkarılan CartPage wrapper'ı ve sunucu page bu kapsama dahil değildir; wrapper'ın normal route/yenileme davranışı gerçek Next E2E ile doğrulanır. Gerçek sağlayıcı hata/ödeme kapsamı iddia edilmez. |
| JSON raporu kontrolü | Node `assert` ile **108** tek denemeli başarılı test, **12** proje, `localhost:3037`, sıfır global hata/atlama/flaky doğrulandı; **exit 0**. |
| `git diff --check` | **exit 0**. |

- TDD checkpoint'leri aktif `main` geçmişindedir: `a385a83` ilk RED (route 404), `1850365` ilk GREEN. Kod incelemesiyle eklenen stok regresyonunda `--project chromium-320 --grep 'stock mismatch'` önce etkin adet düğmesini yakaladı (**exit 1**, `0f8a856`), düzeltme sonrası aynı test **exit 0; 1/1** (`9789f6a`). Stok uyuşmazlığı varken diğer satırların adetleri değiştirilemez; uzlaştırmadan önce eski satırlar sessizce silinmez. İlk tam matrisin 95/96 sonucu ve Firefox ölçüm sorunu son 108/108 koşumuyla kapanmıştır.
- Rapor `.cache/task-037/results.json`, ekranlar `.cache/task-037/results/`, kapsam özeti `.cache/task-037/coverage-summary.json` altında yerel/commit dışıdır. Masaüstü dolu, 320 px boş ve 320×480 uzun sepet ekranları açılıp incelendi. Build'in otomatik değiştirdiği `next-env.d.ts` başlangıç içeriğine geri alındı. PLAN, diğer task'lar, görseller, `_legacy/`, env ve backend/DB/auth/ödeme ayarları değiştirilmedi.

### Açık kalan kabul / BEKLİYOR gerekçesi

- **Gerçek fiyatın sunucudan yenilenmesi doğrulanamadı:** mevcut `getProducts()` halen temsili veridir. Route'un sunucuya tekrar isteği ve yeni katalog prop'undan fiyat/stok gösterimi çalışır; bu, gerçek katalog/quote entegrasyonu kanıtı değildir. Task 029 ve 054/055 tamamlanıp gerçek katalog kararı sağlanmalıdır.
- Gerçek kupon uygulama ve ödeme bağlantıları Task 054/055 ile 046'ya bağlıdır. Bu görevde yalnız erişilebilir alanları hazırlandı; oran/eşik/sağlayıcı kararı verilmedi, gerçek ödeme başlatılmadı. Global sepet bağlantısı Task 038'e bırakıldı. Bu bağımlılıklar task dışına çıkılarak uygulanmadı; bu nedenle **Durum BEKLİYOR** bırakıldı.

## Claude kararı (20 Eki)
Yerel kapsam (sepet sayfası, adet/sil, boş durum, testler 108/108 + 126/126) kabul edildi. Gerçek fiyat kaynağı, kupon ve ödeme bağlantısı bu görevin değil; 029 (katalog), 054/055 (fiyat/kupon) ve 045–050 (checkout/PayTR) görevlerinde, kullanıcının DB/ödeme kararından sonra bağlanacak.

## Durum: TAMAMLANDI
