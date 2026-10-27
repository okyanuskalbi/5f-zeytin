> ONAY VERİLDİ (kullanıcı, 28 Eki 2026): "gerekli işleri codex'e yaptır". Kaynak: `~/security-audit-skill/5f-zeytin/run-1/REPORT.md`. Auth akışı, RLS, migration ve ödeme mantığı değişmez.

# Task 146: CI sertleştirme, prod demo bayrağı kilidi, bootstrap snippet e-postası

## Tür
backend (küçük, yapılandırma)

## Amaç
Güvenlik denetiminde çıkan CI açığını kapatmak ve iki düşük riskli sertleştirmeyi uygulamak.

## Bağlam
1. **CI** (`.github/workflows/vercel-yayin.yml`): ffmpeg yoksa `johnvansickle.com`'dan doğrulamasız tar indirilip `sudo` ile kuruluyor (satır 36-46); `VERCEL_TOKEN` iş akışı düzeyi env (satır 20-23), her adım görüyor; aynı runner sonra `vercel pull --environment=production` ile prod env'i indiriyor ve `deploy --prebuilt --prod` yapıyor. `npm install` (satır 47). Action'lar etiketle sabitli.
2. **Demo bayrağı:** `NEXT_PUBLIC_DEMO=1` prod derlemesinde demo üyelik/ödeme/sipariş takibi arayüzünü açıyor (`lib/auth/adapter.ts:19`, `lib/checkout/adapter.ts:27`). E2E testleri `next start` + `NEXT_PUBLIC_DEMO=1` ile çalıştığı için bayrak prod `NODE_ENV`'de tamamen yok sayılamaz. Vercel prod env'de şu an tanımlı değil (Claude doğruladı).
3. **Bootstrap snippet:** `supabase/snippets/admin-bootstrap.sql:8` herkese açık repoda sahibin e-postasını sabit içeriyor.

## Kullanılacak araçlar
- Skill: `security-review`, `ecc:github-ops`, `tdd-workflow`.
- 21st MCP: hayır.

## Adımlar
1. **CI:**
   - ffmpeg adımında `curl`/`tar`/`sudo cp` dalını kaldır; yalnız `command -v ffmpeg || (sudo apt-get update && sudo apt-get install -y ffmpeg)` kalsın.
   - `VERCEL_TOKEN`'ı iş akışı `env:` bloğundan çıkar; yalnız `vercel pull`, `vercel build`, `vercel deploy` adımlarının `env:` bloğuna koy.
   - `npm install` yerine `npm ci`.
   - `actions/checkout` ve `actions/setup-node`'u şu anki `v4` etiketinin tam commit SHA'sına sabitle (yorumla sürüm); SHA'yı `gh api` ile doğrula.
   - Tetikleyiciler ve yayın davranışı değişmesin.
2. **Demo kilidi:** `next.config.ts` yüklenirken `process.env.VERCEL_ENV === "production" && process.env.NEXT_PUBLIC_DEMO === "1"` ise anlaşılır Türkçe bir hata ile derlemeyi durdur. Yerel `next start` + `NEXT_PUBLIC_DEMO=1` E2E akışı etkilenmesin. Birim testi: koşulda hata, diğer üç kombinasyonda hata yok.
3. **Bootstrap snippet:** E-postayı sabit değer yerine psql değişkeni yap (`:'admin_email'`); dosyanın başına kullanım satırı ekle (`psql -v admin_email=... -f ...` ya da Management API için yer tutucu `__ADMIN_EMAIL__`). Yorumlardaki ön koşullar (şifre sıfırlama, global oturum kapatma) aynı kalsın. Mevcut snippet testleri (PGlite) yeni biçime göre güncellensin, zayıflatılmasın.

## Kabul kriterleri
- [ ] Workflow'da `johnvansickle`, `curl`, iş akışı düzeyi `VERCEL_TOKEN` yok; token yalnız 3 vercel adımında; `npm ci`; action'lar 40 karakter SHA ile.
- [ ] Demo kilidi birim testi yeşil.
- [ ] `git grep -n "@afina" supabase/snippets` boş; bootstrap testleri yeşil.
- [ ] `npm test`, lint, typecheck, build yeşil.

## Yapılmaması gerekenler
- Auth çerez ayarları, kayıt/giriş akışı, RLS, migration, ödeme değişmesin (ayrı karar).
- Task 145 (SEO) dosyalarına dokunma.
- Yeni bağımlılık ekleme.

## Coder Notu

- CI: doğrulamasız ffmpeg indirme dalı kaldırıldı; yalnız sistem paketi kuruluyor. `npm ci` kullanılıyor. `VERCEL_TOKEN` yalnız pull/build/deploy adımlarında tanımlı; pull adımının sır içermeyen `enabled` çıktısı sayesinde token olmadığında yayın atlama ve uyarı davranışı korunuyor. Push/manual tetikleyicileri, izinler, concurrency ve production yayın komutları korundu.
- `gh api repos/actions/checkout/git/ref/tags/v4` ve `gh api repos/actions/setup-node/git/ref/tags/v4` ile tam commit SHA'ları doğrulandı; ayrıca commit endpoint'leri kontrol edildi. Checkout: `11d5960a326750d5838078e36cf38b85af677262`; setup-node: `49933ea5288caeca8642d1e84afbd3f7d6820020`.
- TDD kanıtı: `npm test -- tests/unit/security-hardening-146.test.ts tests/unit/security-admin-origin.test.ts --maxWorkers=2` ilk koşuda **9 başarısız / 30 başarılı**, uygulama sonrası **39/39 başarılı**. Yeni testler production demo kilidini, diğer üç bayrak kombinasyonunu, yerel production NODE_ENV ile demo kullanımını ve token var/yok yayın davranışını doğruluyor. PGlite testlerinde psql değişkeni bağlı parametreye çevriliyor; onaysız/olmayan hesap, yalnız seçilen e-posta, özel karakterler, tekrar çalıştırma ve başka kullanıcıya yetki verilmemesi doğrulanıyor.
- `VERCEL_ENV=production NEXT_PUBLIC_DEMO=1 node node_modules/next/dist/bin/next build`: beklenen şekilde exit 1 ve Türkçe demo kilidi hatası; normal derleme aşağıda başarılı. Auth/ödeme adapter'larına, RLS/migration dosyalarına ve Task 145 dosyalarına dokunulmadı.
- `git grep -n "@afina" supabase/snippets`: boş çıktı, beklenen exit 1. Snippet artık `:'admin_email'` kullanıyor; psql kullanım satırı eklendi, güvenlik ön koşulları korundu.
- Workflow ayrıca mevcut `js-yaml` ile ayrıştırıldı; token'ın yalnız üç adımda olduğu, tam SHA'lar ve başlangıç sürümüne göre aynı tetikleyici/izin/concurrency değerleri komutla doğrulandı. Tüm run blokları `bash -n` kontrolünden geçti.
- `npm ci --dry-run --ignore-scripts --no-audit --no-fund --cache .task146-npm-cache`: başarılı; bağımlılık veya lockfile değişmedi.
- `npm test -- --maxWorkers=2 --testTimeout=30000`: **71 dosya, 1102/1102 başarılı**. `npm run lint`, `npm run typecheck`, `npm run build`: **başarılı**. Build öncesi üç asset kontrolü de başarılı; mevcut yerel Supabase URL/CSP uyarısı derlemeyi engellemedi.
- `npm test -- tests/unit/security-hardening-146.test.ts tests/unit/task136-security.test.ts --maxWorkers=2 --coverage --coverage.include=next.config.ts`: **45/45 başarılı**; değişen config için satır/ifade/fonksiyon/dal kapsamı **%100**.
- Tarayıcı testleri AGENTS.md gereği çalıştırılmadı; **Claude doğrulayacak**. Bu görevde uygulanamayan madde yok. Yerel RED/GREEN checkpoint'leri, yukarıdaki kanıtlar korunarak tek görev commit'inde birleştirildi; ara commit'ler push edilmedi.

## Durum: TAMAMLANDI
