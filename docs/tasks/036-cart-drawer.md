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

### Nihai kabul — 20 Ekim 2026

- TDD kanıtı: `7df134a` RED, `b4aa619` ilk GREEN; ikisi de aktif `main` geçmişindedir. Tam matris ilk koşuda **40 başarılı / 8 WebKit başarısız** ile Safari'nin tıklanan düğmeye odak vermemesini yakaladı. Trigger ref'i açılışta açıkça kaydedilerek kapanışta doğru düğmeye dönülmesi düzeltildi. Safari klavye testi sınırdaki Radix odak döngüsünü `Shift+Tab`/`Tab`, ara kontrolleri macOS `Alt+Tab` ile doğrular. Dışarıdan kontrollü açılış da önceki odağa döner.
- CTA testleri `/sepet` ve `/odeme` href'lerini ve gerçek tıklama sonrası URL değişimini doğrular; hedef yanıtları yalnız testte karşılanır. Böylece gelecekteki sayfaların mevcut 404/prefetch döngüsü drawer kabulüne karışmaz. Bu test, 037/046 uygulamasını veya gerçek ödeme başarısını kanıtlamaz. Uygulamadaki CTA'lar normal Next Link'tir.

| Komut / test garantisi | Sonuç |
| --- | --- |
| `CART_DRAWER_COVERAGE=1 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/cart-drawer.spec.ts tests/e2e/shell.spec.ts tests/e2e/tokens.spec.ts --config .cache/task-036/playwright.config.ts` | **exit 0; 120/120, 52,7 sn**: drawer **48**, shell **60**, mevcut Dialog/Button/token regresyonları **12**. Chromium/Firefox/WebKit × 320/390/768/1440. |
| Drawer normal durumlar | Adet artırma/azaltma, alt/üst stok sınırı, kuruş bazlı tahmini ara toplam, yenileme sonrası adet, silme sonrası güvenli odak, boş sepet ve devre dışı ödeme, iki CTA hedefi **PASS**. |
| Drawer hata ve erişilebilirlik | Bozuk/okunamayan/yazılamayan localStorage, bellekte düzenleme ve kayda toparlanma; eski stoktan gelen hata/yeniden deneme; katalogdan kaldırılan satır; modal ad/açıklama, arka plan izolasyonu, odak tuzağı, Escape/düğme/dış alan/devam ile kapanış, tetikleyiciye odak dönüşü; normal/reduced-motion **PASS**. |
| Dar/kısa ekran | Altı satır ve uzun ürün adlarıyla her genişlikte **480 px yükseklik**, liste kaydırması, ödeme CTA görünürlüğü, yatay taşma olmaması ve tüm eylemlerde ≥44 px hedef **PASS**. |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**; ESLint sıfır uyarı, TypeScript ve Next.js 16.4.2 production build başarılı. Prebuild varlık kontrolü **14/14 PASS**. Son Safari/test düzenlemesi bu koşumda dahildir. |
| `npm run test` | **exit 0; 126/126**, 4 dosya. Sepet store regresyonu dahil; ayrıca `npm run test -- tests/unit/cart-state.test.ts` **55/55**. |
| `node .cache/task-036/check-coverage.mjs .cache/task-036/results.json` | **exit 0**; 16 Chromium V8 kaydı/source map gerçek `CartDrawer.tsx` kaynağına eşlendi: satır **%96,42**, statement **%96,96**, fonksiyon **%94,11**, dal **%87,23**. Dört eşik de ≥%80; kapsam dışı dosyalar bu ölçüme katılmadı. |
| `node .cache/task-036/verify-results.mjs` | **exit 0**; hedef **localhost:3036**, **12** proje, dosya bazında **48/60/12**; **0 başarısız, 0 atlanan, 0 flaky**, her test tek deneme. |
| `git diff --check` | **exit 0**. |

- JSON raporu `.cache/task-036/results.json`, ekranlar `.cache/task-036/results/`, kapsam özeti `.cache/task-036/coverage-summary.json` altında yerel ve commit dışıdır. Masaüstü dolu, mobil boş ve 320×480 ekran görüntüleri açılarak incelendi; CTA ve kaydırma alanları erişilebilir. `CART_DRAWER_COVERAGE` yalnız isteğe bağlı test ölçümüdür; uygulama env sözleşmesi değildir.
- Production build'in otomatik değiştirdiği `next-env.d.ts` başlangıç içeriğine döndürüldü. Görev kodu/testleri ve bu dosyanın Coder Notu/Durum alanları dışında değişiklik yok. PLAN, diğer task'lar, görseller, `_legacy/`, servis/DB/auth/ödeme/yayın ayarları korunur.
- **Task 036 kapsamında kalan engel yok.** Bileşen mevcut store'u prop olarak tüketir; global provider/layout ve ürün/navigasyon bağlantısı 038'e bırakıldı. Canlı yayın veya tahsilat doğrulaması yapılmadı.

## Durum: TAMAMLANDI
