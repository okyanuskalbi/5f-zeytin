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

## Durum: BEKLİYOR
