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

- Ek regresyon GREEN: Drawer yalnız provider hydration tamamlandıktan sonra mount edilir. `npm run test -- tests/unit/cart-wire.test.tsx tests/unit/cart-wire-recovery.test.tsx --coverage --coverage.include=components/cart/CartProvider.tsx --coverage.reporter=text --coverage.reporter=json-summary` → **exit 0; 8/8**, provider statement/line/function **%100**, branch **%94,11**. Gerçek Drawer ile katalog toparlanmasında kayıtlı iki adet korunur ve sonra üçe artırılır. Aynı düzeltme sonrası lint/typecheck/build **exit 0**, son salt okunur incelemede kritik bulgu yok.

### Teslim edilen bağlantı

- `CartProvider` layout'ta tek kez mount edilir; store her provider için ayrı oluşturulur, SSR istekleri arasında paylaşılmaz. Katalog yalnız mevcut `getProducts()` üzerinden sunucuda okunur. Hydration tamamlanmadan drawer mount edilmez; başarısız katalog okuması kayıtlı sepeti silmez.
- ProductCard mevcut callback sözleşmesini koruyarak uygulamada ortak store'a ürün ID/adet ekler; başarılı ekleme drawer'ı açar. Birikimli stok hatasında adet/kayıt korunur, drawer açılmaz ve kullanıcı tekrar deneyebilir. Navbar toplam adedi erişilebilir düğme adında bildirir; sıfırda görsel rozet gizlenir. Rozet zeytin/fildişi tokenlarına uyarlanmıştır.
- Gerçek `/sepet` sayfasındaki route-local store kaldırıldı; sayfa, drawer, ürünler ve Navbar aynı bellek sahibini kullanır. Depolama yazılamazken bile client navigation sonrası adetler korunur. Yenilemede yalnız ID/adet geri yüklenir; fiyat ve bilinmeyen alanlar kayıttan alınmaz.
- Dış tetikleyici ref'i ile Safari'deki fare tıklaması dahil ürün ve Navbar odağı kapanışta geri verilir. Mevcut modal izolasyonu, odak tuzağı, Escape ve reduced-motion davranışı korunur. Mobil menünün `/sepet` bağlantısı aynı sepeti açar. Yeni animasyon, görsel, paket, skill, backend veya ödeme entegrasyonu eklenmedi.

### Nihai komut kabulü — 20 Ekim 2026

| Komut / garanti | Sonuç |
| --- | --- |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/cart-wire.spec.ts tests/e2e/cart-drawer.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/product-card.spec.ts tests/e2e/shell.spec.ts tests/e2e/scenes.spec.ts --config .cache/task-038/playwright.config.ts` | **exit 0; 396/396, 137,2 sn**. Task 038 **72/72**; drawer **48**, sepet sayfası **108**, ürün kartı **12**, shell **60**, sahneler **96**. Chromium/Firefox/WebKit × 320/390/768/1440. |
| Normal, hata ve klavye/hareket senaryoları | Üründen ekleme, toplam adet rozeti, drawer/sayfa çift yönlü düzenleme, silme/boş durum, reload, birikimli stok reddi/tekrar deneme, tükenmiş ürün, sahte fiyat/bilinmeyen ID temizleme, mobil menü; bozuk/engellenen/yazılamayan storage, tek bellek sahibiyle gerçek client navigation; normal/reduced-motion, Enter/Space, odak tuzağı/Escape, fare/klavye tetikleyicisine odak dönüşü **PASS**. |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**, son production düzeltmesi dahil. Next.js 16.4.2 production build ve prebuild varlık denetimi **14/14 PASS**. |
| `npm run test` | **exit 0; 134/134**, altı dosya. Gerçek Drawer ile katalog toparlanması regresyonu dahil. |
| Yukarıdaki provider kapsam komutu | **exit 0; 8/8**; provider statement/line/function **%100**, branch **%94,11**. Diğer UI dosyalarının satır kapsamı bu ölçüme dahil değildir; değişen UI akışları gerçek tarayıcı testleriyle doğrulanır. |
| `node .cache/task-038/verify-results.mjs` | **exit 0**; JSON raporunda `localhost:3038`, **12** proje, dosya başına sayılar, **396** tek denemeli başarılı test; **0 başarısız/atlanan/flaky/global hata** doğrulandı. |
| `git diff --check` | **exit 0**. |

- TDD checkpoint'leri aktif `main` geçmişindedir: `36750de` ilk RED, `f0d3801` ilk GREEN, `32679d9` gerçek Drawer toparlanma RED'i, `4270145` düzeltme GREEN'i. Son kod incelemesinde kritik bulgu yok.
- Rapor `.cache/task-038/results.json`, ekranlar `.cache/task-038/results/`, kapsam özeti `coverage/coverage-summary.json` altında yerel ve commit dışıdır. Masaüstü rozet/reduced-motion ve 320 px boş sepet ekranları açılarak incelendi. Build'in otomatik değiştirdiği `next-env.d.ts` başlangıç içeriğine döndürüldü; kapsam dışı fark bırakılmadı.
- Task 038 kapsamında kalan engel yok. Temsili katalog kararı korunur; gerçek katalog/fiyat/kupon/ödeme işleri kendi task'larındadır. Bu kabul yereldir; deployment veya canlı satış doğrulaması değildir. PLAN, diğer task dosyaları, `_legacy/`, görsel/onay kayıtları ve servis ayarları değiştirilmedi.

## Durum: TAMAMLANDI
