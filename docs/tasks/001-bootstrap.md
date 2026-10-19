# Task 001: Next.js App Router ve test temeli

## Tür
fullstack

## Amaç
Uygulama ve doğrulama komutlarını ilk kez kur; Task 000 sırasında uygulama oluşturulmaz.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: yok. Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: nextjs-turbopack, coding-standards, tdd-workflow
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `package.json` (oluştur / düzenle)
- `package-lock.json` (oluştur / düzenle)
- `next.config.ts` (oluştur / düzenle)
- `tsconfig.json` (oluştur / düzenle)
- `app/layout.tsx` (oluştur / düzenle)
- `app/page.tsx` (oluştur / düzenle)
- `app/globals.css` (oluştur / düzenle)
- `eslint.config.mjs` (oluştur / düzenle)
- `vitest.config.ts` (oluştur / düzenle)
- `playwright.config.ts` (oluştur / düzenle)
- `tests/unit/bootstrap.test.ts` (oluştur / düzenle)
- `tests/e2e/bootstrap.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Next.js App Router, TS, Tailwind 4; npm scripts: dev, build, start, lint (ESLint CLI), typecheck, test (vitest run), test:e2e (playwright test). Playwright webServer ile yerel sunucuyu başlatsın; chromium/firefox/webkit ve 320/390/768/1440 genişlikleri tanımlansın. _legacy import edilmesin. Playwright use.baseURL, PLAYWRIGHT_BASE_URL env değerini okur; bu env varsa yerel webServer kapatılır ve hedef host test raporuna yazılır. Böylece preview/live komutu localhostu test edemez.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run lint && npm run typecheck && npm run test -- tests/unit/bootstrap.test.ts` başarılı.
- [ ] `npm run build && npm run test:e2e -- tests/e2e/bootstrap.spec.ts` başarılı; ana sayfa 200 ve _legacy bağımlılığı yok.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
