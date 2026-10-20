# Task 031: Ürün kartı scroll hareketi

## Tür
frontend

## Amaç
Kartları scroll ile sahneye al.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 030 (product-card). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: motion-patterns, motion-advanced, accessibility
- 21st MCP: evet — scroll product card
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/catalog/ProductCardMotion.tsx` (oluştur / düzenle)
- `components/catalog/ProductCard.tsx` (oluştur / düzenle)
- `tests/e2e/card-motion.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. whileInView/scroll-linked motion; ürün başına sahne hissi, görünür CTA, reduced-motion ve mobil touch. Hareket kart verisini değiştirmez.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/card-motion.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Bağımlı Task 030 `TAMAMLANDI`; ek kullanıcı kararı veya servis onayı gerekmiyor. `motion-foundations`, `motion-patterns`, `motion-advanced` ve `accessibility` skill'leri kullanıldı. Yerel Next.js `use-client` ve Server/Client Components belgeleri ile Motion'ın resmi `inView` / `useAnimate` belgeleri okundu; ek skill veya bağımlılık kurulmadı.
- 21st MCP araması ve kaynak alma ile [Scroll Reveal](https://21st.dev/@cnippet-dev/components/scroll-reveal) (demo 18674) incelendi. Tek seferlik viewport giriş düzeni, mevcut HeroMotion yaklaşımına ve AFİNA kart/token stiline uyarlandı. `whileInView` ile aynı viewport tetiklemesi, hareketi odak/dokunma anında durdurabilmek için `motion/react` içindeki `inView` + `useAnimate` ile uygulanır: kartın %10'u görünür olduğunda 16px → 0, 0,6 saniye, yalnız transform. Observer sabit dış sarmalayıcıyı ölçer; ürün başına giriş bir kez oynar.
- SSR içeriği başlangıçta görünür; opacity/CTA gizlenmez. Reduced-motion başlangıçta ve tercih değiştiği anda hareketi kapatır; düşük donanımda dekoratif hareket atlanır. `focusin` / `pointerdown` hareketi keser, Motion değeri ve CSS sıfırlanır; yerel scroll veya dokunma olayları engellenmez. Observer, medya tercihi ve etkileşim dinleyicileri temizlenir; observer hatası/eksik API ve başarısız JavaScript durumunda kart statik kalır. Kart verisi, fiyat/stok, adet, callback ve yükleniyor/boş/tükendi durumları korunur.
- Değişiklikler yalnız `ProductCardMotion.tsx`, `ProductCard.tsx`, `card-motion.spec.ts` ve bu task dosyasıdır. Task 030'un mevcut test fixture'ı bellek içi Vite paketi ve Playwright route interception ile yeniden kullanıldı; yeni uygulama test rotası veya sunucu eklenmedi. Build'in ürettiği `next-env.d.ts` farkı geri alındı.

### Komutla doğrulama — 20 Ekim 2026

- RED: Uygulama kodundan önce `tests/e2e/card-motion.spec.ts` yazıldı. `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/card-motion.spec.ts --project=chromium-320 -g 'each landing product'` ilk denemede macOS sandbox MachPortRendezvous süreç iznine takıldı; gerekli süreç izniyle tekrarında **exit 1**, kartta `data-product-card-motion` bulunmadığı için beklenen RED elde edildi.
- İlk GREEN turu, yarıda kesilen animasyonun Motion değerinin de sıfırlanması gerektiğini gösterdi; düzeltmeden sonra dar ekran **7/7 başarılı**. Ana sayfadaki mevcut `/hesabim` ve `/sepet` bağlantılarının prefetch 404'leri hareket hatası olarak sayılmadı; JavaScript ve hydration hataları ayrıca denetlendi.
- `npm run lint && npm run typecheck && npm run build` → **exit 0**. Production build `/` sayfasını statik üretti; prebuild varlık kontrolü **14/14 PASS**.
- `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/card-motion.spec.ts` → **exit 0, 84/84 başarılı (45,0 saniye)**. Chromium / Firefox / WebKit × 320 / 390 / 768 / 1440: gerçek landing'de her ürünün sınırlandırılmış ve tek seferlik hareketi, değişmeyen kart verisi, görünür CTA, scroll sonrası adet ve callback hata/tekrar deneme, yükleniyor/boş/tükendi, klavye/odak, reduced-motion ve hareket sırasında tercih değiştirme, `hasTouch` bağlamında gerçek tap ve 44px kontroller, düşük donanım, observer hatası, başarısız JavaScript ve yatay taşma kontrol edildi.
- Rapor Node assertion'ları: **localhost:3004; 12 proje; 84 başarılı; 0 başarısız/atlanan/flaky; 84 doğru target-host annotation'ı**. Kabul JSON'u ve 320/1440 katalog + 320 reduced-motion ekranları `.cache/task031-evidence/` altında tutuldu; ekranlar görsel olarak incelendi. Bu kanıtlar git dışında.
- Regresyon: `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/product-card.spec.ts` → **exit 0, 12/12 başarılı (19,1 saniye)**. `npm run test -- tests/unit/bootstrap.test.ts` → **exit 0, 7/7 başarılı**. `git diff --check` başarılı. Kabul yerel production build üzerinde yapıldı; bu task kapsamında kalan engel yok.

## Durum: TAMAMLANDI
