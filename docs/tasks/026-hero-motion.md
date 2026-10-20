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

## Durum: BEKLİYOR
