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

**Port kararı (Claude, 19 Eki):** ZEYTİN tüm yerel sunucular **3004** portunda (`-p 3004`, Playwright 3004; 3000 başka projede dolu); KURUMSAL 3001 kullanır, iki repo paralel test çalıştırır — `reuseExistingServer` başka uygulamaya bağlanmasın diye yanıtta ZEYTİN'e özgü bir işaret (ör. `<meta name="app" content="zeytin">`) kontrol edilsin.

## Kabul kriterleri
- [ ] `npm run lint && npm run typecheck && npm run test -- tests/unit/bootstrap.test.ts` başarılı.
- [ ] `npm run build && npm run test:e2e -- tests/e2e/bootstrap.spec.ts` başarılı; ana sayfa 200 ve _legacy bağımlılığı yok.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Next.js App Router + TypeScript + Tailwind 4 ve istenen npm komutları kuruldu. `dev` / `start` yalnız `-p 3000` kullanır. Ana sayfa resmi marka metnini, Türkçe belge dilini ve `<meta name="app" content="zeytin">` işaretini içerir.
- Playwright: Chromium / Firefox / WebKit × 320 / 390 / 768 / 1440 = 12 proje. Yerel `webServer`, production build'i `npm run start` ile açar; `reuseExistingServer: false`. `PLAYWRIGHT_BASE_URL` tanımlıysa yerel sunucu açılmaz; boş/geçersiz URL localhosta düşmez. Hedef host HTML/JSON raporunun metadata alanına ve test annotation'ına yazılır.
- Sürümler resmi [Next.js](https://nextjs.org/docs/app/getting-started/installation), [Vitest kurulumu](https://nextjs.org/docs/app/guides/testing/vitest), [Tailwind](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [Playwright](https://playwright.dev/docs/test-webserver) belgeleri ve `npm view` ile doğrulandı. Next 16.4.2, React 19.3.1, Tailwind 4.3.3, Vitest 5.0.5, Playwright 1.64.1 sabitlendi. Mevcut Node 24.11.1 ve paketlerin peer/engine aralıkları için TypeScript 6.0.3, ESLint 9.39.5, jsdom 29.1.1 kullanıldı. ESLint 9'un npm deprecation uyarısı var; Next'in React lint eklentisinin peer aralığı ESLint 10'u kapsamıyor.
- Zorunlu destek dosyaları olarak `postcss.config.mjs`, Next'in ürettiği `next-env.d.ts` ve `.gitignore` girdileri eklendi. `_legacy` TypeScript/ESLint/CSS taramasından ayrıldı; eski koddan import ESLint ile yasaklandı. `_legacy/`, özgün görsel promptları ve PLAN değiştirilmedi. Task gereği 21st kullanılmadı; ek skill kurulmadı.

### Komutla doğrulama — 19 Ekim 2026

- RED: `npm run test -- tests/unit/bootstrap.test.ts` → exit 1, `Failed to resolve import "../../app/page"`; uygulama henüz yokken çözümleme/derleme aşamasında beklenen başarısızlık kaydedildi.
- GREEN: `npm run lint && npm run typecheck && npm run test -- tests/unit/bootstrap.test.ts` → exit 0, **6 test başarılı**. Sayfa/metadata/dil ve yerel/uzak/boş test hedefi doğrulandı.
- `npm run test -- tests/unit/bootstrap.test.ts --coverage` → exit 0, iki uygulama dosyasında statement/function/line **%100**, branch 0/0.
- `npm ci --no-fund --no-audit --fetch-retries=1 --fetch-timeout=20000` → exit 0, **449 paket**. İlk temiz kurulumda bulunan eksik opsiyonel lockfile kayıtları `npm install --package-lock-only --include=optional --no-fund --no-audit` ile düzeltildi; ardından lint/typecheck/birim test/build tekrar geçti.
- `npm run build` → exit 0, `/` statik üretildi. Beş `.next/**/*.nft.json` bağımlılık izi Node komutuyla tarandı: **0 `_legacy` referansı**.
- `npm exec -- playwright install chromium firefox webkit` → exit 0. Repo dışına önbellek yazmamak için kurulum komutlarında `export npm_config_cache="$PWD/.cache/npm"`, tarayıcı kurulumu ve E2E komutlarında `export PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"` kullanıldı; `.cache/` git dışında.
- `npm run build && npm run test:e2e -- tests/e2e/bootstrap.spec.ts` → build başarılı, E2E **exit 1**: `http://localhost:3000 is already used`. JSON raporunda hedef `localhost:3000` ve 12 proje doğrulandı; tarayıcı testleri başlamadı.

### Engel

Port 3000, `lsof -nP -iTCP:3000 -sTCP:LISTEN` çıktısında PID **50762** tarafından tutuluyor. `lsof -a -p 50762 -d cwd -Fn` bu sürecin `/Users/emre/PROJELER/shortlistleads/src/frontend` uygulaması olduğunu gösterdi. Kullanıcıdan portu boşaltması istendi; başka projenin süreci durdurulmadı ve port kararı değiştirilmedi. Port boşaldığında yukarıdaki tarayıcı önbelleği değişkeniyle ikinci kabul komutu tekrar çalıştırılmalı. **Ana sayfanın HTTP 200 yanıtı ve 12 tarayıcı/ekran koşumu henüz doğrulanmadığı için durum BEKLİYOR.**

## Düzeltme 001-a (Claude, 19 Eki)
3000 portu kullanıcının başka projesinde (shortlistleads) sürekli açık; ona DOKUNMA. ZEYTİN portunu **3004** yap: `package.json` dev/start `-p 3004`, `playwright.config.ts` baseURL/webServer 3004, README/PLAN'daki yerel adres `http://localhost:3004`. Sonra E2E dahil tüm kabul kriterlerini yeniden çalıştır.

## Durum: BEKLİYOR
