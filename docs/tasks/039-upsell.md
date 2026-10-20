# Task 039: Sepette çapraz satış ve indirim sunumu

## Tür
frontend

## Amaç
Sepette ilgili ürün önerisini ve miktar indirimi sunumunu kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 036 (cart-drawer); 037 (cart-page); 038 (cart-wire). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — upsell strip
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/cart/Upsell.tsx` (oluştur / düzenle)
- `components/cart/CartSummary.tsx` (oluştur / düzenle)
- `tests/e2e/upsell.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Zeytin→zeytinyağı gibi onaylı ilişki; yalnız aktif/stokta ürünler; kendini önerme. Eşik/oran uydurma, yapılandırma yoksa teklif gösterme. Sunucu hesaplaması pricing görevinde.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/upsell.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Başlangıç `main`, temiz çalışma ağacı; 036/037/038 task dosyaları `TAMAMLANDI`. PLAN/AGENTS/bağımlılıklar, ECC `frontend-patterns`, `accessibility`, `tdd-workflow`, yerel Next.js `use-client`, `use-router` ve Playwright belgeleri okundu. ECC kuralı gereği salt okunur TDD denetimi alındı.
- Onaylı ilişki/aktif ürün listesi ve indirim eşik/oran yapılandırması yok. Task'ın 2. adımı uyarınca varsayılan hiçbir teklif gösterilmeyecek; opsiyonel sunum prop'ları yalnız verilmiş yapılandırmayı kullanacak. Test fixture'ındaki örnek ilişki/eşik/oranlar gerçek karar veya runtime verisi değildir. Sunucu fiyat hesaplaması 054/055 kapsamındadır; bu görevde indirim uygulanmaz.
- 21st MCP search/get_component ile [Product Listing Card](https://21st.dev/@shadcnstore/components/product-card-1) (28227) incelendi. Başlık/fiyat/ekleme eylemi AFİNA tokenlarına uyarlanacak. Resmi `npm_config_cache="$PWD/.cache/npm" npx shadcn@latest docs button` **exit 0**; mevcut Button kullanılacak, yeni paket/skill/animasyon/görsel gerekmiyor.
- Test desteği olarak `tests/e2e/fixtures/upsell.{html,tsx}` eklendi; önceki görevlerin Vite/Playwright yöntemini izler. Public test rotası eklenmez. Mevcut 3004 süreci korunur; commit dışı `.cache/task-039/playwright.config.ts` bu checkout'un production build'ini **localhost:3039** üzerinde ve aynı 12 tarayıcı/viewport projesiyle kullanır.
- TDD RED: `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/upsell.spec.ts --config .cache/task-039/playwright.config.ts --project chromium-320 --grep 'approved relations'` → **exit 1**, test çalıştı; beklenen tek öneri yerine **0** listitem bulundu (henüz uygulama yok). İlk macOS MachPort süreç kısıtı süreç izniyle giderildi; ortam hatası RED sayılmadı. Kabul ve uygulama sürüyor.

- İlk GREEN: aynı E2E dosyası `--project chromium-320` → **exit 0; 7/7, 2,6 sn**. Onaylı/aktif/stoklu tekil hedef, kendini/sepettekini önermeme, aynı store'da ekleme/drawer/reload, yapılandırma yokken gizleme, tahmini toplamı değiştirmeyen miktar koşulları, hata/yeniden deneme ve klavye/reduced-motion/güvenli odak doğrulandı. Önceki 6/7 turunda testin ikinci seed'i eski init script'iyle çakışıyordu; kayıtlı test verisi açıkça değiştirilerek düzeltildi. `npm run lint && npm run typecheck && npm run build` **exit 0**, 14/14 varlık kontrolü. Tam tarayıcı matrisi ve kapsam denetimi sürüyor.

- Salt okunur kod incelemesi, yenilemeyle stoğa giren önerinin store'un eski stok guard'ı nedeniyle sürekli reddedildiğini buldu. Ek RED: aynı E2E komutu `--project chromium-320 --grep 'newly restocked'` → **exit 1**; öneri görünmesine ve ekle tıklanmasına rağmen beklenen yeni sepet satırı oluşmadı. Güvenli stok guard güncellemesi uygulanmadan bu kanıt kaydedildi.

- Regresyon GREEN: aynı E2E dosyası `--project chromium-320` → **exit 0; 8/8, 3,3 sn**. Öneriler yalnız tüm mevcut satırlar güncel katalog/stokla geçerliyken görünür; bu koşulda stok guard'ı yenilenerek yeniden stoklanan hedef eklenebilir. Geçersiz sepet satırları otomatik budanmaz; hata/yenilemede teklifler kapalı kalır.

### Teslim edilen frontend

- `Upsell.tsx`, yalnız açıkça verilen onaylı ilişkilerden ve aktif kimlik listesinden öneri çıkarır. Stoksuz/pasif/kayıp/ilişkisiz hedefler, kendi ürünü ve sepette zaten bulunan ürünler gösterilmez; tekrar eden ilişkiler tek öneri oluşturur. Katalog hatası, hydration öncesi, boş/geçersiz stoklu sepet veya yenileme sırasında teklifler kapanır.
- `CartSummary` aynı store'a tek adet ekler; mevcut sepet sayfası, drawer ve kayıt aynı ürünü görür. Yenilenen katalogla stoğa giren veya yeni gelen hedefler eklenebilir. Başarılı eklemede kaybolan öneri düğmesinin odağı kalıcı sepet başlığına taşınır. Reddedilen ekleme canlı hata/yeniden deneme verir; storage hatasında ekleme bellekte korunur ve mevcut storage uyarısı görünür.
- Miktar koşulları yalnız opsiyonel yapılandırmadaki ürün kapsamı/eşik/oranlarla bilgi olarak sunulur; geçersiz/boş koşullar gizlenir. Eşik aşılması bile ara toplamdan indirim düşmez; “Henüz hesaplanmadı” ve sunucu doğrulama açıklaması korunur. Ürün/kampanya kararı, fiyat otoritesi veya backend uygulanmadı.
- Gerçek `/sepet` route'una hiçbir ilişki/aktif ürün/kampanya verisi eklenmedi. **Onaylı yapılandırma yokken teklif göstermeme, bu task'ın açık kabul davranışıdır; frontend için engel değildir.** Gerçek katalog ve sunucu quote bağlantısı 029/054/055 kapsamındadır. Yeni görsel, animasyon, bağımlılık veya skill kurulmadı; mevcut Button'ın reduced-motion ve görünür odak stilleri kullanıldı.

### Nihai komut kabulü — 20 Ekim 2026

| Komut / garanti | Sonuç |
| --- | --- |
| `UPSELL_COVERAGE=1 CART_PAGE_COVERAGE=1 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/upsell.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/cart-wire.spec.ts --config .cache/task-039/playwright.config.ts` | **exit 0; 288/288, 77,8 sn**. Task 039 **108**, sepet sayfası **108**, global sepet bağlantısı **72**. Chromium/Firefox/WebKit × 320/390/768/1440. |
| Öneri / hata durumları | Onaylı aktif/stoklu tekil hedef, kendi/sepetteki/pasif/tükenmiş/kayıp/ilişkisiz hedefleri dışlama; ilişki/aktif kaynak/yapılandırma yokken gizleme, ekleme/drawer/reload, reddedilen stok/tekrar deneme, storage hatasında bellekte koruma ve toparlanma; katalog hatası/yenileme/stok uyuşmazlığında gizleme, stok `0 → pozitif` ve yeni katalog hedefinden ekleme **PASS**. |
| İndirim sunumu | Yapılandırılan ürün kapsamı ve eşik/oran metni, boş/bozuk/fractional eşik/geçersiz oran/tekrar eden eşik/eksik ürün koşullarını gizleme, eşik aşılırken ara toplamı değiştirmeme ve sunucu doğrulama açıklaması **PASS**. Test kampanyaları yalnız fixture'dadır. |
| Erişilebilirlik / responsive | Normal + reduced-motion, Tab/Enter ile ekleme, görünür odak ve ekleme sonrası sepet başlığına dönüş; 480 px kısa ekran, tüm genişliklerde taşmasız sunum, ≥44 px ekleme hedefi, reduced-motion'da sıfır transition **PASS**. Safari/macOS klavye gezinmesi mevcut test düzenindeki `Alt+Tab` ile doğrulanır. |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**, son stok düzeltmesi dahil; ESLint sıfır uyarı, TypeScript ve Next.js 16.4.2 production build başarılı, varlık kontrolü **14/14 PASS**. Son ek test sınırları sonrasında lint/typecheck tekrar **exit 0**. |
| `npm run test` | **exit 0; 134/134**, altı dosya; store/provider regresyonları dahil. |
| `node .cache/task-039/verify-results.mjs` | **exit 0**; hedef **localhost:3039**, **12** proje ve dosya başına **108/72/108**; **288** tek denemeli başarı, **0 başarısız/atlanan/flaky/global hata**. |
| `node .cache/task-039/check-coverage.mjs .cache/task-039/results.json` | **exit 0**; 64 Chromium V8 kaydı/source map gerçek iki bileşene eşlendi. Upsell satır/fonksiyon **%100**, statement **%96,77**, dal **%96,66**; CartSummary satır **%96,66**, fonksiyon **%100**, statement **%97,29**, dal **%96,55**. Her dosyada dört metrik de ≥%80. Fixture'dan çıkarılan CartPage wrapper'ı/sunucu route'u bu kapsam ölçümüne dahil değildir; gerçek route E2E ile doğrulanır. |
| `git diff --check` | **exit 0**. |

- TDD checkpoint'leri aktif `main` geçmişinde: `1d3429f` ilk RED, `59bf5e1` ilk GREEN; `c4f97af` restock RED ve `002ef27` düzeltme GREEN. Son salt okunur kod incelemesinde önceki bulgu giderildi; yeni kritik/engelleyici bulgu yok.
- Rapor `.cache/task-039/results.json`, ekranlar `.cache/task-039/results/`, kapsam özeti `.cache/task-039/coverage-summary.json` altında yerel/commit dışıdır. Masaüstü yapılandırılmış sunum ve 320 px reduced-motion ekranları açılıp incelendi. `UPSELL_COVERAGE` yalnız test ölçüm bayrağıdır; uygulama env sözleşmesi değildir.
- Build'in otomatik değiştirdiği `next-env.d.ts` başlangıç içeriğine döndürüldü. Yalnız bu görev bileşenleri/testleri ve task dosyasının Coder Notu/Durum alanları değişti. PLAN, diğer task dosyaları, `_legacy/`, görseller ve backend/DB/auth/ödeme/yayın ayarları korunur. **Task 039 frontend kapsamında kalan engel yok.** Bu kabul yereldir; canlı yayın, gerçek indirim veya ödeme doğrulaması değildir.

## Durum: TAMAMLANDI
