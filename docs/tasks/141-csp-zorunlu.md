> ONAY VERİLDİ (kullanıcı, 26 Eki 2026): "bunları vs yaptır codex'e" (CSP engelleme moduna alma).

# Task 141: CSP'yi Report-Only'den zorunluya alma

## Tür
backend (yalnız başlık yapılandırması + test)

## Amaç
Task 136'da Report-Only olarak eklenen CSP'yi aynı yönergelerle zorunlu `Content-Security-Policy` başlığına çevirmek. Sitede hiçbir işlev kırılmamalı.

## Bağlam
- `next.config.ts` `headers()`: şu an `Content-Security-Policy-Report-Only`.
- Testler: `tests/unit/task136-security.test.ts`, `tests/e2e/task136-security.spec.ts`.
- Canlı cihaz testinde Safari konsolunda yalnız "report-only, report-to yok" uyarısı vardı; ihlal yoktu.
- PayTR henüz bağlı değil, ama `frame-src`/`form-action`/`script-src` PayTR izinleri korunur.

## Kullanılacak araçlar
- ECC skill: `security-review`, `tdd-workflow`.
- 21st MCP: hayır.

## Dokunulacak dosyalar
- `next.config.ts` (düzenle)
- `tests/unit/task136-security.test.ts`, `tests/e2e/task136-security.spec.ts` (beklentiyi güncelle) veya yeni `tests/e2e/task141-csp.spec.ts`

## Adımlar
1. Başlık adını `Content-Security-Policy` yap; Report-Only başlığı kalksın (ikisi birden olmasın).
2. Yönergeler aynı kalsın. Ek olarak `upgrade-insecure-requests` ekle. `'unsafe-inline'` (SSG hidrasyon + inlineCss + Motion) bilerek kalır; yorumu "enforced" olarak güncelle.
3. `supabaseConnectSources()` boş dönerse (build anında `NEXT_PUBLIC_SUPABASE_URL` yoksa) üretim derlemesi uyarı yazsın (build zamanında `console.warn`); sessizce Supabase'i engelleyen CSP fark edilmeden çıkmasın. Mevcut davranışı bozma.
4. E2E: `next build && next start` üzerinde Chromium + WebKit ile `/`, `/sepet`, `/odeme`, `/giris`, `/kayit`, `/hesabim`, `/siparis-takip`, `/kvkk` açılır; `securitypolicyviolation` olayı ve "Refused to" konsol hatası **sıfır** olmalı. Ana sayfada sepete ekle + menü aç + SSS aç akışı CSP altında çalışmalı.

## Kabul kriterleri
- [ ] Yerel `next start` yanıtında `content-security-policy` var, `content-security-policy-report-only` yok (`curl -sI`).
- [ ] CSP e2e testi Chromium + WebKit'te sıfır ihlalle yeşil.
- [ ] `npm test`, lint, typecheck, build, `check:assets` yeşil.

## Yapılmaması gerekenler
- Nonce/dinamik render'a geçme; sayfaları statikten çıkarma.
- Diğer güvenlik başlıklarına ve uygulama koduna dokunma.

## Coder Notu

- `Content-Security-Policy-Report-Only` kaldırıldı; aynı kaynak/yönergeler zorunlu `Content-Security-Policy` başlığına taşındı ve `upgrade-insecure-requests` eklendi. PayTR izinleri, bilinçli `'unsafe-inline'` izinleri, diğer dört güvenlik başlığı ve render yapılandırması korundu.
- Boş/geçersiz Supabase bağlantı kaynakları üretimde URL veya sır değeri loglamadan `console.warn` verir. Yerel `npm run build` çıktısında beklenen uyarı gözlendi; mevcut kaynak doğrulama davranışı korunur.
- TDD RED: `npm test -- tests/unit/task136-security.test.ts` → yeni beklentiler nedeniyle 16 başarısız, 18 başarılı test. GREEN: `npm test -- tests/unit/task136-security.test.ts --coverage --coverage.include=next.config.ts` → 34/34 başarılı; yapılandırmanın satır/dal/fonksiyon/statement kapsamı %100. RED/GREEN ara commit'leri yalnız yerelde tutuldu ve sonuç commit'inde birleştirildi.
- `npm test -- --maxWorkers=2 --testTimeout=30000` → 66 dosya, 1.060/1.060 test başarılı. `npm run lint`, `npm run typecheck`, `npm run build`, `npm run check:assets` ve `git diff --check` başarılı.
- Yerel üretim derlemesi `next start --hostname 127.0.0.1 --port 3141` ile açıldı. `curl -sI` kontrollerinde `/`, `/sepet`, `/odeme`, `/giris`, `/kayit`, `/siparis-takip`, `/kvkk` HTTP 200; `/hesabim` beklenen HTTP 307 döndürdü. Sekiz yanıtta zorunlu CSP ve `upgrade-insecure-requests` var, Report-Only yok. Açılan sunucu SIGTERM ile düzgün kapatıldı.
- Tarayıcı kabulü **Claude doğrulayacak** (AGENTS.md). `tests/e2e/task136-security.spec.ts`, istenen sekiz rota ve mevcut `/admin` kontrolünde `securitypolicyviolation`, `Refused to`/CSP konsol hataları ve çalışma zamanı hatalarını toplar; ana sayfada sepete ekleme, menü açma ve SSS açma akışını doğrular. Testler yazıldı ve typecheck'ten geçti; Playwright/Lighthouse/inspect veya ekran görüntüsü çalıştırılmadı. Claude komutu: `npm run build && npm run test:e2e -- tests/e2e/task136-security.spec.ts --project=chromium-390 --project=webkit-390`.

## Durum: TAMAMLANDI
