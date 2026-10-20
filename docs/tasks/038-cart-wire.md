# Task 038: Ürün ve navigasyonu sepet akışına bağlama

## Tür
frontend

## Amaç
Üründen sepete ekleme ve global drawer açma akışını birleştir.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 035 (cart-state); 030 (product-card); 036 (cart-drawer); 037 (cart-page); 024 (shell). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — sepet açma/rozet etkileşimi
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/catalog/ProductCard.tsx` (oluştur / düzenle)
- `components/site/Navbar.tsx` (oluştur / düzenle)
- `components/cart/CartProvider.tsx` (oluştur / düzenle)
- `app/layout.tsx` (oluştur / düzenle)
- `tests/e2e/cart-wire.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. ProductCard aynı cart store kullanır, Navbar rozet/adet gösterir ve drawer açar; provider layoutta tek kez mount edilir. Sepet sayfası ve drawer yenileme sonrası aynı ürün/adet durumunu gösterir; odak ve klavye korunur.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/cart-wire.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Başlangıç: `main`, temiz çalışma ağacı; 024/030/035/036/037 task dosyaları `TAMAMLANDI`. Bu yerel frontend bağlantısı için eksik kullanıcı kararı yok. PLAN ve diğer task dosyaları korunur. `frontend-patterns`, `accessibility`, `tdd-workflow` ve yerel Next.js use-client/context/layout/Playwright kılavuzları okundu. ECC kuralı gereği salt okunur TDD incelemesi alındı.
- 21st MCP search/get_component ile [Count Badge](https://21st.dev/@sebafermanelli/components/count-badge) (37460) incelendi; sıfırda gizleme, erişilebilir gerçek adet adı ve dekoratif rozet yaklaşımı AFİNA tokenlarına uyarlanacak. Resmi `npx shadcn@latest docs button dialog` **exit 0**; mevcut Button/Dialog kullanılacak, yeni bağımlılık gerekmedi.
- TDD RED: `npm run test -- tests/unit/cart-wire.test.tsx` → **exit 1**, beklenen eksik `components/cart/CartProvider` import'u. E2E RED: `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/cart-wire.spec.ts --config .cache/task-038/playwright.config.ts --project chromium-320 --grep 'product, badge'` → **exit 1**, gerçek sayfada sepet açma düğmesi/rozet bulunamadı. macOS MachPort kısıtı gerekli süreç izniyle giderildi; ortam hatası RED sayılmadı. Mevcut 3004 süreci korunur, kabul 3038'de bu checkout'un production build'iyle yapılır.
- Zorunlu destek kapsamı: `CartSummary.tsx` içindeki route-local store ortak provider'a geçirilecek; `CartDrawer.tsx` dış tetikleyicinin Safari dahil odak dönüşünü alacak. Bootstrap async layout testi ve mevcut shell/product-card/scenes testlerindeki artık değişen beklentiler güncellenecek. Bunlar aynı Task 038 bağlantısının ve regresyon kabulünün gerekli parçalarıdır; backend/veri/ödeme kapsamı açılmaz.

- İlk GREEN: aynı E2E dosyası `--project chromium-320` → **exit 0; 5/5, 4,0 sn**; ürün → drawer → gerçek `/sepet`, çift yönlü adet, reload, stok hatası/tekrar deneme, depolama hatasında tek bellek sahibi ve klavye/reduced-motion/odak dönüşü geçti. `npm run lint && npm run typecheck && npm run build` **exit 0**. Provider birim/kapsam testi **7/7**, statement/line/function **%100**, branch **%81,25**; bu ölçüm diğer UI dosyalarının kapsamı değildir.
- Kod incelemesi katalog `null → ürünler` geçişinde gerçek Drawer'ın parent effect'ten önce hydration yaparak boş stokla kaydı silebildiğini buldu. Gerçek Drawer ile `npm run test -- tests/unit/cart-wire-recovery.test.tsx` **exit 1**: beklenen iki adet yerine boş liste. Bu ek RED ayrı korunur; ilk normal akış GREEN'i tam kabul sayılmaz.

## Durum: BEKLİYOR
