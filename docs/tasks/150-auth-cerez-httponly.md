> ONAY VERİLDİ (kullanıcı, 28 Eki 2026): "Zeytin giriş çerezinin tarayıcı kodundan okunamaz hale getirilmesi ... sende". Kaynak: `~/security-audit-skill/5f-zeytin/run-1/REPORT.md` §5.

# Task 150: Supabase oturum çerezleri httpOnly

## Tür
backend (auth, küçük)

## Amaç
Oturum ve yenileme (refresh) çerezlerini tarayıcı JavaScript'inden okunamaz yapmak. CSP `unsafe-inline` olduğu için ileride bir XSS olursa refresh token çalınamasın.

## Bağlam
- `lib/auth/config.ts:46` `getAuthCookieOptions()` → `httpOnly: false`. Gerekçe yorumu "browser client needs the same cookies".
- Tarayıcı istemcisi `lib/auth/client.ts` (`createAuthBrowserClient`) uygulama kodunda HİÇ kullanılmıyor; yalnız `tests/unit/auth-core.test.ts` içe aktarıyor. Tüm auth akışı sunucuda: `lib/auth/server.ts:51`, `app/api/auth/*`, `app/auth/callback`, `proxy.ts` oturum yenileme. PKCE verifier çerezi de sunucu rotalarında yazılıp okunuyor.

## Kullanılacak araçlar
- Skill: `security-review`, `backend-patterns`, `tdd-workflow`.
- 21st MCP: hayır.

## Adımlar
1. `getAuthCookieOptions()` → `httpOnly: true`; diğer alanlar aynı (`path "/"`, `sameSite "lax"`, prod'da `secure`). Yorumu yeni gerçeğe göre düzelt.
2. `lib/auth/client.ts` dosyasını ve yalnız onu test eden test parçalarını kaldır (kullanılmayan, httpOnly ile çalışamayacak kod). Başka içe aktaran varsa önce raporla, kaldırma.
3. Regresyon testi (kaynak testi): `app/`, `components/`, `lib/` içinde `createBrowserClient` ve `@supabase/ssr` içe aktaran `"use client"` dosya yok; `getAuthCookieOptions().httpOnly === true`.
4. Birim testi: kayıt, giriş (şifre + magic link), callback ve proxy yenilemesinin yazdığı `sb-*` çerezlerinin `Set-Cookie` başlığında `HttpOnly` var (mevcut mock'lu route testlerine ekle). PKCE verifier çerezi dahil.
5. Mevcut `auth-core` beklentilerini (`httpOnly: false`) yalnız bu değişiklik için güncelle; zayıflatma.

## Kabul kriterleri
- [ ] `git grep -n "httpOnly: false" lib app` boş.
- [ ] `lib/auth/client.ts` yok; `git grep -n "createBrowserClient" app lib components` boş.
- [ ] Adım 3–4 testleri yeşil.
- [ ] `npm test`, lint, typecheck, build yeşil.
- Tarayıcı testi (giriş → /hesabim → sayfa yenile → çıkış, `document.cookie` içinde `sb-` yok) Claude'da.

## Yapılmaması gerekenler
- Giriş/kayıt akışı, Origin kontrolü, `sameSite`, CSP, RLS, migration, ödeme değişmesin.
- Ön-kayıt (preclaim) ve hesap değiştirme çerez temizliği bu görevde YOK (ayrı karar/test).
- Yeni bağımlılık ekleme.

## Coder Notu

- `getAuthCookieOptions()` artık her ortamda `httpOnly: true`; `path`, `sameSite` ve yalnız production'da `secure` davranışı korundu. Auth/PKCE/yenilemenin sunucuda çalıştığı yorumda açıklandı.
- `lib/auth/client.ts` kaldırıldı. Ön aramada yalnız `auth-core` testinin içe aktardığı doğrulandı; yalnız bu istemciye ait iki test ve SDK mock'u kaldırıldı. Diğer auth beklentileri korundu.
- Kaynak regresyonu `tests/unit/auth-cookie-boundary.test.ts`: üç ortamda cookie seçenekleri, kaldırılan dosya ve `app/`, `components/`, `lib/` içinde browser client / `use client` + `@supabase/ssr` import sınırı.
- Mevcut gerçek SDK + mock ağ testleri; kayıt, şifreli giriş, magic link, callback (eski ve per-flow PKCE), sunucu/proxy yenilemesi ve çıkışta bütün `sb-*` Set-Cookie başlıklarının `HttpOnly` taşıdığını denetliyor. Nötr kayıt/magic link yanıtları ve verifier silme çerezleri de dahil. Callback'in mock `cookies()` yazıları NextResponse'un gerçek çerez serileştiricisiyle başlık olarak denetleniyor.

TDD kanıtı:

- RED: `npm test -- tests/unit/auth-cookie-boundary.test.ts tests/unit/auth-core.test.ts tests/unit/login.test.ts tests/unit/register.test.ts --maxWorkers=2` → 222 testin 20'si beklenen nedenle başarısız (HttpOnly eksikliği ve mevcut browser client). Yerel checkpoint: `dc09b1f`.
- GREEN: aynı komut → 4 dosya, 220 test geçti (kaldırılan istemciye ait iki test çıkarıldı). Yerel checkpoint: `cca845e`. RED/GREEN kanıtı bu notta korunarak ara commit'ler push öncesi tek yeşil görev commit'inde birleştirildi.

Kabul komutları:

| Kontrol | Sonuç |
| --- | --- |
| `git grep -n "httpOnly: false" lib app` | Boş çıktı, beklenen çıkış kodu 1 |
| `git grep -n "createBrowserClient" app lib components` | Boş çıktı, beklenen çıkış kodu 1 |
| `test ! -e lib/auth/client.ts` | Başarılı |
| Hedeflenen auth testleri | 220/220 geçti |
| Aşağıdaki tam birim testi + auth coverage komutu | 73 dosya, 1107/1107 geçti; satır %100, statement %97.95, branch %96.52, fonksiyon %95.91 |
| `npm run lint` | Başarılı, uyarı yok |
| `npm run typecheck` | Başarılı |
| `npm run build` | Başarılı; prebuild varlık kontrolleri de geçti |
| `git diff --check` | Başarılı |

```sh
npm test -- --maxWorkers=2 --coverage --coverage.include=lib/auth/config.ts --coverage.include=lib/auth/server.ts --coverage.include=app/api/auth/login/route.ts --coverage.include=app/api/auth/register/route.ts --coverage.include=app/auth/callback/route.ts --coverage.include=app/auth/logout/route.ts --coverage.include=proxy.ts
```

Yerel build, mevcut Supabase URL yapılandırması için CSP uyarısı verdi; derlemeyi engellemedi. Env veya CSP değiştirilmedi. Coverage yalnız yukarıdaki auth dosyalarına aittir; tüm uygulama coverage iddiası değildir.

Tarayıcı kabulü **Claude doğrulayacak**: giriş → `/hesabim` → sayfa yenile → çıkış; `document.cookie` içinde `sb-` olmaması. AGENTS.md gereği Playwright, Lighthouse, inspect ve ekran görüntüsü çalıştırılmadı. Gerçek sağlayıcı/hesap üzerinde auth kabulü bu mock testlerinden çıkarılmadı. Uygulanamayan kod adımı yok.

## Durum: TAMAMLANDI
