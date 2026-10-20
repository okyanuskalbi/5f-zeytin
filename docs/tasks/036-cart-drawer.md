# Task 036: Sepet drawer

## Tür
frontend

## Amaç
Erişilebilir sepet drawer arayüzünü kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 035 (cart-state); 024 (shell). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — cart drawer
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/cart/CartDrawer.tsx` (oluştur / düzenle)
- `tests/e2e/cart-drawer.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Odak tuzağı, Escape ve odağı geri verme; adet, silme, boş sepet; tam sepet ve ödeme CTA.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/cart-drawer.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Başlangıç: `main`, temiz çalışma ağacı; 035 ve 024 task dosyaları `TAMAMLANDI`. Bu görev için eksik kullanıcı kararı/onay kapısı yok. Global provider, ürün/navigasyon bağlantısı 038; `/sepet` sayfası 037 ve `/odeme` akışı 046 kapsamındadır.
- `frontend-patterns`, `accessibility`, `tdd-workflow` okundu. 21st MCP `search` / `get_component` ile [Drawer — Shopping Cart](https://21st.dev/@efferd/components/drawer) (4485) alındı. Yerel Next.js `use-client`/`link` kılavuzları ve Radix Dialog resmi belgesi incelendi; `npm_config_cache="$PWD/.cache/npm" npx shadcn@latest docs button dialog` **exit 0**. Mevcut shadcn Dialog/Button kullanılacak; yeni paket/skill kurulmadı.
- TDD / RED: `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/cart-drawer.spec.ts --config .cache/task-036/playwright.config.ts --project=chromium-320 --grep 'quantity, limits'` → **exit 1**, beklenen eksik uygulama: `Could not resolve '../../../components/cart/CartDrawer'`. Fixture yeni bileşeni doğrudan kullanır; hata eksik drawer modülüdür.
- 3004 portundaki mevcut süreç korundu. Commit dışı `.cache/task-036/playwright.config.ts`, proje konfigürasyonundaki aynı 12 tarayıcı/viewport projesini bu checkout'un `next start` çıktısı üzerinde `localhost:3036` hedefine taşır; başka checkout/sunucu yeniden kullanılmaz. Test fixture'ı mevcut Vite/Playwright yöntemini izler; iki destek dosyası yalnız `tests/e2e/fixtures/cart-drawer.*` altındadır, public test rotası oluşturulmaz.

### Uygulama / ilk GREEN

- 21st örneğinin başlık/listeler/alt eylemler düzeni AFİNA tokenlarına uyarlandı. Mevcut Dialog/Button üzerinde kontrollü `open`/`onOpenChange`, mevcut `CartStore` aboneliği/hydration, adet/stok koruması, silme, boş sepet, tahmini kuruş bazlı ara toplam ve `/sepet`/`/odeme` CTA'ları uygulandı. Eksik katalog satırı görünür kalır ve ödeme CTA'sı kapanır. Yeni animasyon/görsel/paket eklenmedi.
- Klavye odağı açılışta kapatma düğmesine taşınır; Escape, kapatma, dış alan ve alışverişe devam ile geri verilir. Satır silinmeden önce odak kapatma düğmesine alınır. Kayıt hatasında sepet bellekte kullanılabilir; stok kaynaklı düzenleme hatası canlı uyarıyla görünür ve yeniden denenebilir.
- İlk GREEN: RED ile aynı E2E hedefi `--project=chromium-320` (grep olmadan) → **exit 0; 4/4 başarılı, 2,5 sn**. İlk tarayıcı başlatmasındaki macOS MachPort izin hatası süreç izniyle giderildi. Ara test açık `aria-modal` niteliğini doğrulayınca bileşene eklendi; ikinci motion turunda etkinleşen azalt düğmesi klavye testinin sırasına dahil edildi. `npm run lint && npm run typecheck` → **exit 0**. Tüm tarayıcılar ve production build kabulü henüz sürüyor.

## Durum: BEKLİYOR
