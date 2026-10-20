# Task 032: Landing sahne orkestrasyonu

## Tür
frontend

## Amaç
Hero, hikâye ve ürün kartlarını tek landing sahne akışında birleştir.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 026 (hero-motion); 031 (card-motion). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: motion-patterns, motion-advanced, frontend-patterns
- 21st MCP: evet — scrollytelling düzeni
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/landing/SceneFlow.tsx` (oluştur / düzenle)
- `app/page.tsx` (oluştur / düzenle)
- `tests/e2e/scenes.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. En fazla 6 ürün; scroll konumu ile sahne girişleri; native scroll, reduced-motion sade akış, SSR içeriği ve mobil performans. Three.js/AI asistanı/scroll editörü ekleme.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/scenes.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Bağımlı Task 026 ve 031 `TAMAMLANDI`; bu frontend görevi için yeni kullanıcı kararı veya servis onayı gerekmiyor. `motion-foundations`, `motion-patterns`, `motion-advanced`, `frontend-patterns`, `tdd-workflow` ve CLI erişimi için `21st-cli-use` skill'leri kullanıldı. Yerel Next.js Server/Client Components, `use-client`, `page` rehberleri ve Motion'ın resmi [inView](https://motion.dev/docs/inview) / [useAnimate](https://motion.dev/docs/react-use-animate) belgeleri okundu.
- **21st MCP bu oturumun araçları arasında yoktu.** CLI ile `npx -y @21st-dev/cli search 'scrollytelling scroll reveal sections' --limit 3 --json` ve `get 19203 --json` / `get 18675 --json` çalıştırıldı. [Scroll Reveal Content A](https://21st.dev/@abui/components/scroll-reveal-content-a) ve [Scroll Reveal](https://21st.dev/@cnippet-dev/components/scroll-reveal) kaynakları incelendi; ardışık bölüm/tek seferlik giriş düzeni mevcut AFİNA tokenlarına uyarlandı. İlk CLI denemesindeki global npm cache yazma hatası repo içindeki `.cache/npm` kullanılarak giderildi. Yeni skill, uygulama bağımlılığı veya shadcn bileşeni eklenmedi; global MCP ayarı değiştirilmedi.
- `Home` Server Component olarak kaldı; hero, resmi kısa marka tanımıyla hikâye, ürünler ve mevcut toptan alanı `SceneFlow` içinde doğal belge sırasıyla birleşir. İçerik/CTA SSR'de görünürdür; görsel veya tesis bileşeni eklenmedi. Ayrıntılı tesis hikâyesi ve görsel aktarımı Task 033/034 kapsamındadır. Sunulan ürünler sayfada da **en fazla 6** ile sınırlanır; katalog sırası/verisi değiştirilmez, boş katalog mesajı korunur.
- `SceneFlow`, yalnız işaretli üç bölümün metin katmanını **16px → 0 / 0,6 saniye** hareket ettirir. Sabit section üzerinden Motion `inView` ölçümü ve tek seferlik giriş kullanılır; hero/kart hareketleri kendi bileşenlerinde kalır, kart kontrol veya CTA'larına ikinci transform eklenmez. Scroll başına React state güncellemesi, scroll kilidi, pinning veya yeni renderer yoktur. Observer/medya/odak/pointer dinleyicileri temizlenir; odak/dokunma hareketi keser, observer hatasında statik içerik kalır. Reduced-motion ve ≤4 işlemcili cihazlarda dekoratif giriş kapalıdır.
- Dinamik reduced-motion testinin ilk turu mevcut hero girişinin durdurulmuş ara transform değerini koruduğunu gösterdi. Hero dosyasını değiştirmeden `SceneFlow` içinde media-query tabanlı önemli transform sıfırlaması eklendi; birleşik akış artık tercih animasyon sırasında değiştiğinde de tamamen statiktir.
- Task'ın üç uygulama/E2E dosyasına ek olarak, TDD coverage kontrolünde eksik çıkan boş katalog dalı ve değişmez altı ürün sınırı için yalnız bu göreve ait `tests/unit/scenes.test.tsx` eklendi. PLAN, diğer task dosyaları, `_legacy/`, özgün promptlar, katalog kaynağı ve backend/DB/auth/ödeme/yayın ayarları değiştirilmedi. Build'in otomatik `next-env.d.ts` farkı başlangıç içeriğine geri alındı.

### Komutla doğrulama — 20 Ekim 2026

| Kontrol | Sonuç / kanıt |
| --- | --- |
| RED: `PLAYWRIGHT_BASE_URL=http://localhost:3004 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/scenes.spec.ts --project=chromium-320 -g 'landing composes' --output=.cache/task032/red` | **exit 1**, `[data-scene-flow]` için beklenen 1, bulunan 0. İlk sandbox tarayıcı başlatma hatası RED sayılmadı; süreç izniyle gerçek davranış hatası doğrulandı. RED checkpoint: **`9755dbf`**, bu görevin aktif `main` dalında. |
| GREEN: aynı E2E dosyası, `chromium-320`, yerel production `localhost:3032` | **exit 0; 8/8**. İlk 7/8 turundaki dinamik reduced-motion sorunu yukarıdaki entegrasyon korumasıyla giderildi. |
| `PLAYWRIGHT_BASE_URL=http://localhost:3032 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/scenes.spec.ts --output=.cache/task032/acceptance` | **exit 0; 96/96, 47,1 saniye**. Chromium/Firefox/WebKit × 320/390/768/1440: sahne sırası, native scroll, tek seferlik/sınırlı giriş, değişmeyen ürün verisi, boş/7→6 katalog, klavye/CTA/odak, başlangıç ve dinamik reduced-motion, düşük donanım + touch tap/44px kontroller, observer/script hatası ve JS kapalı SSR doğrulandı. |
| Kabul JSON'una Node assertion'ları | **exit 0**; 96 beklenen, **0 başarısız/atlanan/flaky**, 12 proje ve 96 adet `localhost:3032` hedef annotation'ı. Bu checkout'un ayrı production sunucusu kullanıldı; mevcut 3004 süreci durdurulmadı. |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**, son kod/test dosyalarıyla başarılı. Production `/` statik üretildi; prebuild varlık kontrolü **14/14 PASS**. |
| `npm run test -- --coverage --coverage.include=app/page.tsx` | **exit 0; 71/71**. İlk 69 testlik turda boş katalog branch coverage %50 idi; ek sınır testleriyle sayfanın statement/branch/function/line kapsamı **%100**. Bu ölçüm yalnız `app/page.tsx` içindir; Motion iç işleyişinin coverage yüzdesi değildir. Hareket davranışı E2E'de ölçüldü. |
| Ek regresyon: `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/hero-motion.spec.ts tests/e2e/hero.spec.ts tests/e2e/card-motion.spec.ts tests/e2e/product-card.spec.ts --config=.cache/task032/regression.config.ts --project=chromium-320 --project=webkit-1440 --output=.cache/task032/regression` | **exit 1; 36 başarılı / 2 başarısız**. İki hata yalnız eski `hero matches official copy...` testinin katalogda sıfır ürün ve eski boşluk metni beklemesidir (`hero.spec.ts:50–51`). Task 032 öncesi **`0dde063`** sayfası da aynı üç ürünlü katalog kaynağını okuyup kartları render ediyordu; test ve katalog kaynağının başlangıç commit'iyle bayt eşitliği Node assertion'larıyla doğrulandı. Bu kapsam dışı eski test uyumsuzluğu değiştirilmedi. Hero-motion, card-motion ve product-card regresyonlarının tamamı geçti; Task 032'nin zorunlu kabul komutları başarılıdır. |
| `git diff --check` | **exit 0**. |

Kabul JSON'u `.cache/task032/acceptance-results.json`, ek regresyon JSON'u `.cache/task032/regression-results.json`; trace/ekranlar aynı yerel kanıt dizininde ve commit dışındadır. Chromium 320/1440 normal ve WebKit 390 reduced-motion ekranları açılarak incelendi; içerik/CTA kesilmesi veya yatay taşma görülmedi. Bu görev yerel tarayıcı kabulüdür; fiziksel cihaz, dağıtım veya canlı satış kabulü değildir. Task 032 kapsamında kalan engel yoktur; yukarıda ayrı belirtilen eski hero test beklentisi tüm eski E2E paketinin yeşil olduğu anlamına gelmez.

## Durum: TAMAMLANDI
