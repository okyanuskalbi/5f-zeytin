# AFİNA ZEYTİN

[afinazeytin.com](https://afinazeytin.com) için premium vitrin ve satın alma projesi.

Next.js App Router + TypeScript + Tailwind 4 uygulaması ve Vitest/Playwright test temeli kuruldu. AI Studio React/Vite kaynakları [_legacy/](_legacy/) içinde korunur.

Node.js 24 ve npm 11 ile yerel kurulum:

```sh
export npm_config_cache="$PWD/.cache/npm"
npm ci
npm run dev
```

Yerel adres: **http://localhost:3004**. `npm run start` da 3004 portunu kullanır; önce `npm run build` çalıştırılmalıdır.

Kabul komutları ve repo içinde tarayıcı kurulumu:

```sh
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"
npm exec -- playwright install chromium firefox webkit
npm run lint && npm run typecheck && npm run test -- tests/unit/bootstrap.test.ts
npm run build && npm run test:e2e -- tests/e2e/bootstrap.spec.ts
```

Playwright Chromium, Firefox ve WebKit'te 320/390/768/1440 genişliklerini test eder. Yerel production sunucusunu kendisi başlatıp kapatır; 3004 portunda mevcut sunucu varsa durur. `PLAYWRIGHT_BASE_URL=https://<hedef-host> npm run test:e2e -- tests/e2e/bootstrap.spec.ts` ile açık hedef verildiğinde yerel sunucu başlatılmaz; hedef host rapora yazılır ve sayfada ZEYTİN uygulama işareti doğrulanır.

Mimari/açık kararlar: [docs/PLAN.md](docs/PLAN.md). Sıralı görevler: [docs/tasks](docs/tasks). Özgün [görsel promptları](docs/visual-prompts.md) korunur. Claude planlar ve denetler; Codex görevleri AGENTS.md kurallarına göre uygular. Görsel, DB, ödeme ve yayın onayları ilgili görevlerde ayrıca alınır.
