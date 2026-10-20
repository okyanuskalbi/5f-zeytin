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

## Durum: BEKLİYOR
