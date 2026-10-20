# Task 026: Hero hareketi

## Tür
frontend

## Amaç
Hero giriş ve scroll hareketini ayrı uygula.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 025 (hero). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: motion-foundations, motion-patterns, accessibility
- 21st MCP: evet — hero motion referansı
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/landing/HeroMotion.tsx` (oluştur / düzenle)
- `components/landing/Hero.tsx` (oluştur / düzenle)
- `tests/e2e/hero-motion.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. motion ile sınırlı parallax/giriş; reduced-motion durumunda görünür statik içerik; mobilde kaydırmayı kilitleme.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/hero-motion.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

### Başlangıç / TDD RED — 20 Ekim 2026

- `main`, başlangıçta temiz çalışma ağacı; bağımlı 025 `TAMAMLANDI`. PLAN, AGENTS ve 025 okundu. Yeni kullanıcı kararı gerekmiyor; onaylı sahne bulunmadığı için mevcut etiketli placeholder korunacak.
- ECC `motion-foundations`, `motion-patterns`, `motion-advanced`, `accessibility`, `tdd-workflow` ve yerel Next.js 16.4.2 Server/Client Component kılavuzları incelendi. 21st MCP `search` + `get_component({ id: 1503 })` ile [Hero Parallax](https://21st.dev/@manuarora700/components/hero-parallax) referansı alındı; yalnız sınırlı dikey scroll fikri marka düzenine uyarlanacak. Resmi [Motion kurulum](https://motion.dev/docs/react-installation), [useAnimate](https://motion.dev/docs/react-use-animate), [scroll](https://motion.dev/docs/scroll) ve [reduced-motion](https://motion.dev/docs/react-use-reduced-motion) belgeleri doğrulandı. Yeni shadcn bileşeni veya ek skill gerekmiyor.
- Test yolculukları: bir defalık ≤16 px giriş, ≤16 px parallax ve sabit CTA; reduced-motion/klavye; açık sayfada hareket tercihi değişimi; düşük donanımda statik görünüm ve serbest scroll; JavaScript/logo isteği hatası; JavaScript kapalı SSR bağlantıları. `tests/e2e/hero-motion.spec.ts` önce yazıldı.
- `npm run build` → **exit 0**, varlık denetimi **14/14**. Bu checkout'un production sunucusu `next start -p 3026` ile başlatıldı; 3004'teki mevcut süreç korundu.
- `PLAYWRIGHT_BASE_URL=http://localhost:3026 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/hero-motion.spec.ts --project=chromium-320 --grep 'bounded entrance' --output=.cache/task-026/red-results` → **exit 1**, test çalıştı ve `[data-hero-motion="entrance"]` için **beklenen 1 / bulunan 0** ile eksik hareket katmanı doğrulandı. İlk koşumdaki macOS MachPortRendezvousServer sandbox hatası süreç izniyle giderildi; geçerli RED sonraki davranış hatasıdır.

### Uygulama / GREEN

- `Hero` Server Component olarak korundu; `HeroMotion` yalnız iki sloganın girişini ve mevcut placeholder'ın parallax hareketini üstlenir. `motion/react` ile bir defalık **16 px / 0,6 sn** giriş, scroll ilerlemesine bağlı **0…−16 px** parallax; layout/opacity, CTA veya native scroll davranışı hareket ettirilmez. Scroll ölçümü sabit dış elemana bağlıdır; dinleyiciler/animasyonlar cleanup'ta durdurulur.
- SSR'de içerik görünürdür; mount öncesi gizleme veya hydration'a bağlı CTA yoktur. `useReducedMotion` ve ayrı media-query değişim dinleyicisi ile azaltılmış hareket tercihinde transform sıfırlanır; tercih açık sayfada değişince de uygulanır. ≤4 mantıksal işlemcide dekoratif hareket kapalıdır. `matchMedia` olmayan test ortamında ve animasyon başlatma hatasında statik içerik korunur. Tokenlar bu görevin sınırında `HeroMotion.tsx` içinde tek nesnede tutuldu; ortak mimari dosyası açılmadı.
- Gerekli ilk Motion bağımlılığı `npm install --save-exact motion@14.4.0` ile eklendi; `package.json` ve lockfile bu nedenle kapsamdadır. `npm view motion version peerDependencies --json` → **14.4.0**, React 18/19 desteği. Yeni shadcn bileşeni/ek skill eklenmedi.
- `hero.spec.ts` içindeki eski “normal modda da animasyon yok” beklentisi yalnız `reduce` için korundu; normal hareketin sınırları yeni testte ölçülür. İlk karma matrisin **12** eski statik beklenti hatası bu değişiklikle düzeltildi. Hata testindeki **4 WebKit** hatası CTA'nın mevcut hover geçişini saymasından kaynaklanıyordu; kontrol yalnız hero hareket katmanlarına daraltıldı. Birim koşumunda görülen `matchMedia is not a function` hatası statik fallback ile giderildi.
- Aynı RED testi dahil ilk Chromium-320 koşumu **6/6** GREEN; nihai matris **132/132** GREEN. Ayrı üretim refaktörü gerekmedi. RED checkpoint'i bu dalda **`ffc59c0`**; GREEN uygulama, son testler ve bu kanıt notu takip eden `task 026` commit'indedir.

### Nihai komutla doğrulama — 20 Ekim 2026

| Komut / kontrol | Sonuç / garanti |
| --- | --- |
| `npm run lint && npm run typecheck && npm run build` | **exit 0**; son dosyalarla ESLint, Next typegen/TypeScript ve production build başarılı. Prebuild varlık denetimi **14/14**. |
| `PLAYWRIGHT_BASE_URL=http://localhost:3026 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/hero-motion.spec.ts tests/e2e/hero.spec.ts --output=.cache/task-026/verified-results` | **exit 0; 132/132, 46,5 sn**. İstenen hero-motion kabul dosyası **72/72**, mevcut hero regresyonu **60/60**. Chromium/Firefox/WebKit × 320/390/768/1440; giriş/parallax sınırı, scroll dönüşünde giriş tekrarı olmaması, sabit CTA, native wheel, reduced-motion/klavye/odak, çalışma anında tercih değişimi, düşük donanım, JS/logo isteği hatası ve JS kapalı SSR doğrulandı. |
| Playwright JSON raporuna Node assertion'ları | **exit 0**; **132 beklenen**, **0 başarısız / 0 atlanan / 0 flaky**, **12 proje**; hero-motion **72**, hero **60**. Hedef bu checkout'un `localhost:3026` production sunucusudur. |
| `npm run test -- --coverage --coverage.include=app/page.tsx --coverage.include=components/landing/Hero.tsx` | **exit 0; 69/69**. İki statik render fonksiyonunda statement/function/line **%100**; branch yok. Bu yüzde Motion iç işleyişini veya tarayıcı etkileşimini ölçmez; hareket davranışı yukarıdaki 72 E2E ile doğrulandı. |
| Yerel Playwright Node kontrolü: Chromium `hasTouch: true`, `isMobile: true`, CDP native touch gesture + CTA `tap()` | **exit 0**, **320 ve 390 px**. Her iki boyutta `scrollY=241`, `overflowY=visible`, `touchAction=auto`, yatay taşma yok ve iki CTA hedefi başarılı. Sonuç `.cache/task-026/touch-results.json`; fiziksel cihaz kabulü değildir. |
| `git diff --check` | **exit 0**. |

Kanıtlar `.cache/task-026/` altında yerel ve commit dışıdır; nihai makine raporu `verified-results.json`. Chromium **320/1440** normal ve WebKit **390** reduced-motion ekranları açılarak incelendi; metin/CTA kesilmesi, yatay taşma veya çakışma görülmedi. `next-env.d.ts` build'in otomatik değişikliğinden başlangıç baytlarına döndürüldü; kullanılan 3026 sunucusu kapatıldı, önceki 3004 süreci korundu.

Kapsamda kalan engel yoktur. Resmi sloganlar, logo ve etiketli sahne placeholder'ı korunur; yeni/onaysız görsel yayınlanmadı. PLAN, diğer task dosyaları, `_legacy/`, özgün promptlar ve backend/DB/auth/ödeme/yayın ayarları değiştirilmedi. Kurulumun bildirdiği **5 high npm advisory**, başlangıç lockfile'ında aynı sürümleri bulunan ESLint/Next lint araç zincirine aittir; Motion bu listede değildir. Görev dışı bağımlılık güncellemesi yapılmadı. `origin/main` fetch kontrolünde uzak dalda ek commit yoktu; yalnız bu görevin RED/GREEN commit'leri normal push kapsamındadır.

## Durum: TAMAMLANDI
