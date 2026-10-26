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

## Durum: BEKLİYOR
